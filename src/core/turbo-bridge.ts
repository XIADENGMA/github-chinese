/**
 * Turbo 缓存桥接，运行在页面主世界（读得到 window.Turbo）。
 * Turbo 前进后退渲染的是离开页面时克隆的 body，克隆出的节点不在翻译记录里：停用、换词条后无法还原或重译。
 * 内容脚本在这些时候派发重置事件：清掉 Turbo 缓存；当前 body 是缓存克隆体时，按原地址重新访问一次，换成服务器返回的原文。
 * 页面上留有已失效实例的译文时（见 core/instance-mark），内容脚本改派发强制事件：不论 body 来源都重新访问，没有 Turbo 时整页重新加载。
 * 帧导航渲染完后的提升访问会取消进行中的重新访问（不派发事件），自己也不换 body：它结束时 body 还是要换掉的那个，就再访问一次。
 * 带着这些译文的页面不再进 Turbo 缓存：Turbo 每次访问渲染前先缓存当前页面，重新访问被打断、或重置时正有访问在进行，
 * 克隆体会被重新缓存，前进后退又渲染出来。
 * GitHub 自己另有一份缓存：帧导航前把当前页面的标题与 [data-turbo-replace] 元素克隆下来，前进后退时写回并派发 turbo:restored；
 * 帧导航到带锚点的地址时，GitHub 在 soft-nav:success 里按带锚点的地址写回标题，不派发事件。
 * 缓存时页面上带着译文的（在翻译，或留着等重新访问换掉的旧译文）：写回时已停止翻译就立即重新访问；
 * 翻译中写回的显示正常，按克隆体对待，重置时重新访问。
 * 译文已过时的写回时不论是否在翻译都立即重新访问：缓存后仍在翻译时换了词条或时间本地化开关、收到强制事件，或扩展更新（新桥接接手的记录）。
 * 停止翻译的重置不作废：恢复翻译后写回的与当前译文一致。停止翻译期间换了语言、词条或开关的，内容脚本在恢复翻译后补发重置。
 * 是否在翻译：派发可取消的询问事件，翻译中的内容脚本取消它。<html> 上的实例标记会被 GitHub 前进后退时写回，不作依据。
 * 桥接自己不改 DOM：重新访问走 Turbo 的导航，免缓存用 Turbo 的接口（改 head 里的 turbo-cache-control，渲染下一页时随 head 换掉）。
 * GitHub 帧导航后会在 soft-nav:success 换回 head 里带 data-turbo-transient 的元素，免缓存随之失效：旧译文还在就再免缓存一次。
 * 跨世界只用不带 detail 的事件
 */

/** 内容脚本请求重置的事件名（window 上派发，两个世界共用 DOM 事件） */
export const TURBO_RESET_EVENT = 'gcn:turbo-reset'

/** 内容脚本请求强制重新访问的事件名 */
export const TURBO_REVISIT_EVENT = 'gcn:turbo-revisit'

/** 桥接询问页面上是否有内容脚本在翻译：可取消，翻译中的实例调用 preventDefault。各版本共用，不可更改 */
export const TURBO_TRANSLATING_EVENT = 'gcn:turbo-translating'

/** window 上的安装记录（InstalledBridge）。各版本共用，不可更改 */
const BRIDGE_KEY = Symbol.for('github-chinese.turbo-bridge')

/** GitHub 从自己的帧缓存写回标题与元素后派发 */
const RESTORED_EVENT = 'turbo:restored'
/** GitHub 软导航完成：帧导航后 GitHub 在自己的监听里按当前地址写回帧缓存里的标题与 head 里的 transient 元素 */
const SOFT_NAV_SUCCESS_EVENT = 'soft-nav:success'
/** GitHub 帧缓存保存、写回的元素 */
const REPLACE_SELECTOR = '[data-turbo-replace]'

type VisitAction = 'advance' | 'replace' | 'restore'

interface TurboLike {
  readonly cache?: {
    clear(): void
    /** 当前页面离开时不缓存（Turbo 7.2 起） */
    exemptPageFromCache?(): void
  }
  visit(location: string, options?: { readonly action?: VisitAction }): void
}

export interface BridgeWindow extends Window {
  readonly Turbo?: TurboLike
}

/**
 * 安装记录：扩展更新、补注后旧桥接仍在主世界，新装的先卸载它，接手它的状态。
 * 当前页面可能就是旧桥接记下的克隆体，旧内容脚本随后失效、派发的重置由新桥接处理。
 * 各版本共用：已有字段的含义不可更改，新增字段须可选；读取旧记录时逐项校验
 */
interface InstalledBridge {
  readonly uninstall: () => void
  /** 由缓存快照渲染的 body → 渲染时的地址 */
  readonly clones?: WeakMap<Node, string>
  /** 有 Turbo 访问在进行（turbo:visit 之后、turbo:load 之前） */
  readonly visiting?: boolean
  /** GitHub 帧缓存里带着译文的地址 */
  readonly translatedUrls?: Set<string>
  /** GitHub 从这些地址的帧缓存写回的元素 */
  readonly restored?: WeakSet<Element>
}

interface ScrollPosition {
  readonly x: number
  readonly y: number
}

/** 本桥接发起的重新访问 */
interface Revisit {
  readonly url: string
  /** 访问前的滚动位置：Turbo 的 replace 访问会回到顶部 */
  readonly scroll: ScrollPosition
}

/** 带着没有记录的译文、等重新访问换掉的页面 */
interface StalePage {
  readonly body: Node
  /** 有已失效实例的译文：不论 body 来源都要换掉 */
  readonly forced: boolean
}

/** turbo:visit、turbo:load 的 detail；页面也可能派发不带 detail 的同名事件 */
interface VisitDetail {
  readonly url?: unknown
  readonly action?: unknown
}

function detailOf(event: Event): VisitDetail {
  const detail: unknown = (event as CustomEvent<unknown>).detail
  return typeof detail === 'object' && detail !== null ? (detail as VisitDetail) : {}
}

/** 去掉片段标识：只改锚点不换页面 */
function withoutHash(href: string): string {
  const index = href.indexOf('#')
  return index === -1 ? href : href.slice(0, index)
}

/** 安装桥接，返回卸载函数。已装过的先卸载，以最新加载的代码为准 */
export function installTurboBridge(win: BridgeWindow): () => void {
  const registry = win as unknown as Record<symbol, InstalledBridge | undefined>
  const previous = registry[BRIDGE_KEY]
  /** 由缓存快照渲染的 body → 渲染时的地址 */
  const clones = previous?.clones instanceof WeakMap ? previous.clones : new WeakMap<Node, string>()
  const inheritedUrls = previous?.translatedUrls instanceof Set ? previous.translatedUrls : undefined
  /** GitHub 帧缓存里带着译文的地址：缓存里的标题与元素带着没有记录的译文 */
  const translatedUrls = inheritedUrls ?? new Set<string>()
  /** 其中译文已过时的地址：写回后不论是否在翻译都重新访问。接手的全部算过时：新装的版本可能换了词典 */
  const outdatedUrls = new Set<string>(inheritedUrls)
  /** GitHub 从这些地址的帧缓存写回的元素 */
  const restored = previous?.restored instanceof WeakSet ? previous.restored : new WeakSet<Element>()
  let visiting = previous?.visiting === true
  if (typeof previous?.uninstall === 'function') {
    try {
      previous.uninstall()
    } catch {
      // 记录可能被页面改过：照常安装
    }
  }

  const doc = win.document
  /** 访问进行中收到重置：等这次访问结束再判断 */
  let deferred = false
  /**
   * 等重新访问换掉的页面：发起重新访问、访问进行中收到重置或强制事件时记下。
   * 其他访问开始时不作废：它结束时 body 没换（帧导航的提升访问），就再访问一次
   */
  let stalePage: StalePage | undefined
  /** 正在调用 Turbo.visit 的重新访问：等它同步派发的 turbo:visit */
  let proposed: Revisit | undefined
  /** Turbo 已接手的重新访问；之后再有其他访问即作废 */
  let revisit: Revisit | undefined
  /** 地址已变时推迟到本轮任务结束的判断 */
  let pendingCheck: number | undefined
  /** GitHub 从带译文的帧缓存写回的标题；之后的访问会换掉它 */
  let restoredTitle: string | undefined
  /** 帧渲染之后、soft-nav:success 之前（与 GitHub 一致）：届时 GitHub 按当前地址写回帧缓存里的标题 */
  let frameNavigation = false
  /** 已卸载：之后执行的微任务不再处理 */
  let removed = false

  /** 页面上有内容脚本在翻译：派发询问事件，翻译中的实例取消它 */
  const translating = (): boolean => !win.dispatchEvent(new Event(TURBO_TRANSLATING_EVENT, { cancelable: true }))

  /** 当前页面上有 GitHub 从带译文的帧缓存写回的标题或元素 */
  function hasRestored(): boolean {
    if (restoredTitle !== undefined && doc.title === restoredTitle) return true
    for (const element of doc.querySelectorAll(REPLACE_SELECTOR)) if (restored.has(element)) return true
    return false
  }

  /** 页面带着没有记录的译文时返回应重新访问的地址：body 是缓存克隆体时为渲染时的地址，有写回的标题或元素时为当前地址 */
  const staleHref = (): string | undefined =>
    (doc.body ? clones.get(doc.body) : undefined) ?? (hasRestored() ? win.location.href : undefined)

  /** 页面上还留着等重新访问换掉的旧译文 */
  function outdatedOnPage(): boolean {
    const page = stalePage
    return page !== undefined && doc.body === page.body && (page.forced || staleHref() !== undefined)
  }

  /** GitHub 缓存当前页面时：记下缓存里是否带译文、译文是否已过时 */
  function noteCached(): void {
    const href = win.location.href
    // 重置后、重新访问换掉之前，克隆体与写回的标题、元素仍带着旧译文：不论哪种重置都按过时算
    const outdated = outdatedOnPage()
    if (outdated) outdatedUrls.add(href)
    else outdatedUrls.delete(href)
    if (outdated || translating()) translatedUrls.add(href)
    else translatedUrls.delete(href)
  }

  /** 此前缓存的译文已过时：仍在翻译时的重置（词条、时间本地化开关变了），或强制事件 */
  function markOutdated(): void {
    for (const href of translatedUrls) outdatedUrls.add(href)
  }

  /** 当前页面带着没有记录的译文：离开它、重新访问它时 Turbo 都不缓存。没有 head 时 Turbo 写不进设置 */
  function exemptFromCache(turbo: TurboLike): void {
    if (doc.head) turbo.cache?.exemptPageFromCache?.()
  }

  /** 记下等重新访问换掉的页面；同一个 body 已在等强制重新访问的，仍按强制 */
  function keep(forced: boolean): void {
    const body = doc.body
    if (!body) return
    stalePage = { body, forced: forced || (stalePage?.body === body && stalePage.forced) }
  }

  function startRevisit(turbo: TurboLike, forced = false): void {
    keep(forced)
    proposed = { url: win.location.href, scroll: { x: win.scrollX, y: win.scrollY } }
    try {
      turbo.visit(proposed.url, { action: 'replace' })
    } finally {
      // Turbo 在 visit() 内同步派发 turbo:visit；没收到即被拦下或改为整页跳转，不恢复滚动
      proposed = undefined
    }
  }

  /** 页面带着没有记录的译文时重新访问 */
  function revisitIfStale(): void {
    const turbo = win.Turbo
    const href = staleHref()
    if (!turbo || href === undefined) return
    exemptFromCache(turbo)
    keep(false)
    if (withoutHash(href) === withoutHash(win.location.href)) startRevisit(turbo)
    else checkAfterTask()
  }

  /**
   * 地址与渲染克隆体时不同：多半是前进后退，内容脚本在 popstate 之前就已重置。
   * Turbo 在同一任务里发起恢复访问，缓存已清，走网络；本轮任务结束时没有访问在进行（React 等改了地址），才重新访问
   */
  function checkAfterTask(): void {
    if (pendingCheck !== undefined) return
    pendingCheck = win.setTimeout(() => {
      pendingCheck = undefined
      const turbo = win.Turbo
      if (visiting) deferred = true
      else if (turbo && staleHref() !== undefined) startRevisit(turbo)
    }, 0)
  }

  /** 打断重新访问的访问结束了，body 没换：强制的照样重新访问，其余按克隆体与写回的译文判断 */
  function revisitKept(page: StalePage): void {
    const turbo = win.Turbo
    if (!page.forced) revisitIfStale()
    else if (turbo) {
      exemptFromCache(turbo)
      startRevisit(turbo, true)
    }
  }

  /** GitHub 从帧缓存写回了当前地址的标题（elements 为真时还有 [data-turbo-replace] 元素） */
  function noteWrittenBack(elements: boolean): void {
    const href = win.location.href
    // 有访问在进行（如本桥接在同一 turbo:load 里发起的重新访问）：写回的标题与元素随后被它换掉
    if (visiting || !translatedUrls.has(href)) return
    restoredTitle = doc.title
    if (elements) for (const element of doc.querySelectorAll(REPLACE_SELECTOR)) restored.add(element)
    const turbo = win.Turbo
    // 停止翻译后写回的、重置前缓存的：立即换成原文
    if (turbo && (outdatedUrls.has(href) || !translating())) {
      exemptFromCache(turbo)
      startRevisit(turbo)
    }
  }

  const onBeforeRender = (event: Event): void => {
    const body = (event as CustomEvent<{ newBody?: Node } | null>).detail?.newBody
    // 缓存快照克隆自当前文档；网络响应、不换 body 的提升访问由 DOMParser 解析，属于另一个文档
    if (body?.ownerDocument === doc) clones.set(body, win.location.href)
  }

  const onVisit = (event: Event): void => {
    visiting = true
    const { url, action } = detailOf(event)
    if (proposed && url === proposed.url && action === 'replace') {
      revisit = proposed
      return
    }
    // 其他访问：之前的重新访问已被取代或已失败，推迟的重置随之作废（要换掉的页面仍记着）；写回的标题随它换掉
    revisit = undefined
    deferred = false
    restoredTitle = undefined
  }

  const onLoad = (event: Event): void => {
    visiting = false
    const done = revisit
    revisit = undefined
    const page = stalePage
    stalePage = undefined
    if (done) {
      // 只在这次重新访问完成时恢复；重定向到别处的不恢复
      if (detailOf(event).url === done.url) win.scrollTo(done.scroll.x, done.scroll.y)
      restoredTitle = undefined
    } else if (page && doc.body === page.body) {
      // 结束的是别的访问，body 没换（帧导航的提升访问）：旧译文还在
      deferred = false
      revisitKept(page)
      return
    } else if (page?.forced) {
      // 强制重新访问要换掉的 body 已被这次访问换掉：只需按克隆体判断
      deferred = true
    }
    if (!deferred) return
    deferred = false
    revisitIfStale()
  }

  const onReset = (): void => {
    const turbo = win.Turbo
    turbo?.cache?.clear()
    // 仍在翻译：语言、词条或时间本地化变了（含停止期间变化、恢复翻译后补发的）。停止翻译的重置不作废，恢复翻译后写回的与当前译文一致
    if (translating()) markOutdated()
    if (!visiting) {
      revisitIfStale()
      return
    }
    deferred = true
    keep(false)
    // 进行中的访问渲染前会缓存当前页面
    if (turbo && staleHref() !== undefined) exemptFromCache(turbo)
  }

  const onForcedRevisit = (): void => {
    const turbo = win.Turbo
    if (!turbo) {
      win.location.reload()
      return
    }
    turbo.cache?.clear()
    markOutdated()
    exemptFromCache(turbo)
    if (visiting) keep(true)
    else startRevisit(turbo, true)
  }

  /** 与 GitHub 一致：帧请求的响应到达时，GitHub 缓存当前页面 */
  const onBeforeFetchResponse = (event: Event): void => {
    if ((event.target as Element | null)?.localName === 'turbo-frame') noteCached()
  }

  /** 帧渲染前 GitHub 用响应里的原文缓存目标地址（不带锚点） */
  const onBeforeFrameRender = (event: Event): void => {
    frameNavigation = true
    const detail = (event as CustomEvent<{ fetchResponse?: { location?: { href?: unknown } } } | null>).detail
    const href = detail?.fetchResponse?.location?.href
    if (typeof href !== 'string') return
    translatedUrls.delete(href)
    outdatedUrls.delete(href)
  }

  const onRestored = (): void => noteWrittenBack(true)

  /**
   * 帧导航后的 soft-nav:success：GitHub 的监听随后按当前地址写回帧缓存里的标题，
   * 并换回 head 里带 data-turbo-transient 的元素（含 turbo-cache-control，此前的免缓存随之失效）。等本轮派发结束再看
   */
  const onSoftNavSuccess = (): void => {
    if (!frameNavigation) return
    frameNavigation = false
    win.queueMicrotask(() => {
      if (removed) return
      // 此前设的免缓存（如提升访问的 turbo:load 里）随换掉的元素失效：等重新访问换掉的旧译文还在就再设一次
      const turbo = win.Turbo
      if (turbo && outdatedOnPage()) exemptFromCache(turbo)
      noteWrittenBack(false)
    })
  }

  doc.addEventListener('turbo:before-render', onBeforeRender)
  doc.addEventListener('turbo:visit', onVisit)
  // 捕获阶段：先于页面的 turbo:load 监听，不论注册先后（重装前 GitHub 注册的一次性监听写回时，这次访问已结束）
  doc.addEventListener('turbo:load', onLoad, true)
  doc.addEventListener('turbo:before-fetch-response', onBeforeFetchResponse)
  doc.addEventListener('turbo:before-frame-render', onBeforeFrameRender)
  doc.addEventListener(RESTORED_EVENT, onRestored)
  doc.addEventListener(SOFT_NAV_SUCCESS_EVENT, onSoftNavSuccess)
  win.addEventListener(TURBO_RESET_EVENT, onReset)
  win.addEventListener(TURBO_REVISIT_EVENT, onForcedRevisit)
  // GitHub 在文档就绪时缓存首个页面。安装时文档已就绪、没有旧桥接的记录：不知道当时是否在翻译，按现在算
  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', noteCached)
  else if (!inheritedUrls && translating()) translatedUrls.add(win.location.href)

  const uninstall = (): void => {
    removed = true
    doc.removeEventListener('turbo:before-render', onBeforeRender)
    doc.removeEventListener('turbo:visit', onVisit)
    doc.removeEventListener('turbo:load', onLoad, true)
    doc.removeEventListener('turbo:before-fetch-response', onBeforeFetchResponse)
    doc.removeEventListener('turbo:before-frame-render', onBeforeFrameRender)
    doc.removeEventListener(RESTORED_EVENT, onRestored)
    doc.removeEventListener(SOFT_NAV_SUCCESS_EVENT, onSoftNavSuccess)
    doc.removeEventListener('DOMContentLoaded', noteCached)
    win.removeEventListener(TURBO_RESET_EVENT, onReset)
    win.removeEventListener(TURBO_REVISIT_EVENT, onForcedRevisit)
    if (pendingCheck !== undefined) win.clearTimeout(pendingCheck)
    pendingCheck = undefined
    proposed = undefined
    revisit = undefined
    deferred = false
    stalePage = undefined
    frameNavigation = false
    if (registry[BRIDGE_KEY] === installed) delete registry[BRIDGE_KEY]
  }
  const installed: InstalledBridge = {
    uninstall,
    clones,
    translatedUrls,
    restored,
    // 新桥接安装时读取：卸载后不再随事件变化
    get visiting() {
      return visiting
    }
  }
  registry[BRIDGE_KEY] = installed
  return uninstall
}
