import { browser } from 'wxt/browser'
import { defineContentScript } from 'wxt/utils/define-content-script'
import { createCloneUrlRewriter } from '../core/clone-url'
import { createController } from '../core/controller'
import { createDownloadClickHandler } from '../core/download-click'
import { createImageAccelerator } from '../core/image-accelerate'
import { createInstanceMark } from '../core/instance-mark'
import { TURBO_RESET_EVENT, TURBO_REVISIT_EVENT, TURBO_TRANSLATING_EVENT } from '../core/turbo-bridge'
import type { LocaleBundle } from '../core/types'
import { PROBE_TIMEOUT_MS } from '../shared/accelerate'
import { pageLanguageEnvironment } from '../shared/language-env'
import { resolvePageLocale, type PageLocale } from '../shared/locale'
import { createLocaleLoader, TIME_LANGS, waitForRegistration } from '../shared/locale-loader'
import {
  isAcknowledged,
  isContentMessage,
  isFetchedImage,
  isResolvedDownload,
  type BackgroundMessage,
  type ContentMessage,
} from '../shared/messages'
import {
  DEFAULT_SETTINGS,
  getCustomEntries,
  getSettings,
  isPathExcluded,
  watchSettings,
  type Settings,
} from '../shared/settings'
import { sendToBackground } from '../shared/tab-messages'

type SendResponse = (response?: unknown) => void

/** 处理一条消息。同步应答时直接调用 sendResponse；异步应答返回 true 保持消息通道（Chrome 与 Firefox 均适用） */
type MessageHandler = (message: ContentMessage, sendResponse: SendResponse) => true | undefined

interface MessageGate {
  /** 注册到 runtime.onMessage 的监听 */
  readonly listener: (message: unknown, sender: unknown, sendResponse: SendResponse) => true | undefined
  /** 启动完成：按序处理排队的消息，之后直接交给 handler */
  open(handler: MessageHandler): void
}

/** 要应答的消息（popup、后台的查询）：启动完成前收到时保持消息通道 */
function expectsResponse(message: ContentMessage): boolean {
  return message.type === 'gcn:get-status'
}

/** 当前语言的语言包：词典脚本按需加载，动态导入失败（Firefox、Safari 不动态导入）时请后台注入 */
const locales = createLocaleLoader({
  resolveUrl: (path) => browser.runtime.getURL(path as Parameters<typeof browser.runtime.getURL>[0]),
  requestInjection: async (locale) => {
    const message: BackgroundMessage = { type: 'gcn:inject-locale', locale }
    return isAcknowledged(await browser.runtime.sendMessage(message))
  },
  // Firefox 的注册脚本可能还在编译，本脚本先读完存储：先等它登记。Chromium 的注册脚本在解析前同步执行，不等。
  // Firefox 不动态导入：AMO 的代码检查把参数不是字面量的 import() 报为不安全调用。
  // Safari 同 Firefox：不依赖内容脚本的动态导入与注册脚本的执行时机（词典脚本也不开放，见 wxt.config.ts）。
  // 条件直接写构建期常量（同 isFirefoxBuild）：函数调用不内联，经它判断时 Firefox 构建里仍留着 import()
  ...(String(import.meta.env.FIREFOX) === 'true' || String(import.meta.env.SAFARI) === 'true'
    ? { waitForRegistration: () => waitForRegistration(document) }
    : { importScript: (url: string) => import(/* @vite-ignore */ url) }),
})

/** 总开关关闭时启动用的空语言包：开启后加载完成才换上真实语言包 */
const EMPTY_BUNDLE: LocaleBundle = []

/** 开启后语言包加载期间收到状态查询：等加载落定再应答，最多等这么久（须短于 popup 的应答超时，见 shared/tab-messages） */
const STATUS_WAIT_MS = 1000

/**
 * 检查扩展是否失效的间隔。Chrome、Edge 中停用、卸载扩展时不通知内容脚本，脚本照常运行：
 * 靠 WXT 的 ctx.setInterval 到点时读 browser.runtime.id，读不到即触发 onInvalidated
 */
const INVALIDATION_CHECK_MS = 3000

/** 下载加速：等后台选源的时限（后台探测加速源最多 PROBE_TIMEOUT_MS），超时打开原链接 */
const RESOLVE_TIMEOUT_MS = PROBE_TIMEOUT_MS + 2000

/** 图片加速：等后台取回的时限（故障转移开启时后台依次试各加速源） */
const FETCH_IMAGE_TIMEOUT_MS = 30_000

/** 请后台为下载链接、克隆地址选源（故障转移），返回加速后的地址 */
async function resolveDownload(url: string): Promise<string> {
  const message: BackgroundMessage = { type: 'gcn:resolve-download', url }
  const response = await sendToBackground(message, RESOLVE_TIMEOUT_MS)
  if (!isResolvedDownload(response)) throw new Error('后台未选出下载地址')
  return response.url
}

/** 请后台经加速源取回加载失败的图片，返回 data: 地址 */
async function fetchImage(url: string): Promise<string> {
  const message: BackgroundMessage = { type: 'gcn:fetch-image', url }
  const response = await sendToBackground(message, FETCH_IMAGE_TIMEOUT_MS)
  if (!isFetchedImage(response)) throw new Error('后台未取回图片')
  return response.url
}

/** 消息入口：启动完成前收到的消息排队 */
function createMessageGate(): MessageGate {
  let handle: MessageHandler | undefined
  const queued: { readonly message: ContentMessage; readonly sendResponse: SendResponse }[] = []
  return {
    listener(message, _sender, sendResponse) {
      if (!isContentMessage(message)) return undefined
      if (handle) return handle(message, sendResponse)
      queued.push({ message, sendResponse })
      return expectsResponse(message) ? true : undefined
    },
    open(handler) {
      handle = handler
      for (const { message, sendResponse } of queued.splice(0)) handler(message, sendResponse)
    },
  }
}

export default defineContentScript({
  matches: ['https://github.com/*', 'https://gist.github.com/*', 'https://www.githubstatus.com/*'],
  runAt: 'document_start',
  // 新实例只用 document 上的自定义事件让旧实例失效，不经 window.postMessage 把事件名广播给页面脚本
  noScriptStartedPostMessage: true,
  async main(ctx) {
    if (ctx.isInvalid) return
    // 先注册消息监听再读存储：扩展安装、更新后后台先探测页面上有没有本版本的内容脚本（见 background.ts），
    // 读存储期间没有应答会被当成没有，再注入一份让本实例失效，整页先还原成英文再重译
    const gate = createMessageGate()
    browser.runtime.onMessage.addListener(gate.listener)
    const removeMessageListener = (): void => {
      try {
        browser.runtime.onMessage.removeListener(gate.listener)
      } catch {
        // 上下文已失效，监听随之作废
      }
    }

    const [settings, customEntries, initialLanguages] = await Promise.all([
      getSettings().catch(() => DEFAULT_SETTINGS),
      getCustomEntries().catch(() => ({})),
      // 与后台注册词典脚本同一来源（见 shared/language-env）
      pageLanguageEnvironment(),
    ])
    let languages = initialLanguages
    const locale: PageLocale = resolvePageLocale(settings.language, languages)
    // 总开关关闭时不加载语言包，开启时再加载（见 syncLocale）
    const bundle: LocaleBundle | undefined =
      ctx.isInvalid || !settings.enabled ? undefined : await locales.load(locale).catch(() => undefined)
    // 不再启动（已失效，或开启时语言包加载失败）。排队的查询不应答：页面上有新实例时由它应答
    if (ctx.isInvalid || (settings.enabled && !bundle)) {
      removeMessageListener()
      return
    }
    /** 已换上的语言包的语言：关闭时启动的为 undefined，开启后加载完成才换上 */
    let loadedLocale: PageLocale | undefined = bundle ? locale : undefined
    /** 交给控制器的设置：语言包换上之前一律停止（空语言包没有译文，不算在翻译） */
    const effective = (next: Settings): Settings => (loadedLocale === undefined ? { ...next, enabled: false } : next)

    // 翻译中在 <html> 上留标记（见 core/instance-mark）：重置时发现别的实例的标记，说明它已失效、旧译文没有还原
    const mark = createInstanceMark(document)
    // 关闭时启动也创建（用空语言包）：状态查询、后台探测、桥接询问都靠它应答
    const controller = createController({
      bundle: bundle ?? EMPTY_BUNDLE,
      timeLang: TIME_LANGS[locale],
      settings: effective(settings),
      customEntries,
      isPathExcluded,
      onActiveChange: (active) => mark.update(active),
      // 交给主世界的 turbo-bridge 处理 Turbo 缓存克隆体；有已失效实例的标记时强制重新访问。
      // 失效时只做普通重置：新实例此时可能已写入标记
      onReset: (reason) => {
        const stale = reason !== 'dispose' && mark.clearOthers()
        window.dispatchEvent(new Event(stale ? TURBO_REVISIT_EVENT : TURBO_RESET_EVENT))
      },
    })
    let current: Settings = settings
    /** 最近一次加载请求的序号：加载期间又有变化（关闭、语言再变）时，旧请求的结果丢弃 */
    let localeRequest = 0

    /** 开启时加载当前语言的语言包并换上；关闭期间不加载 */
    const syncLocale = async (): Promise<void> => {
      const request = ++localeRequest
      if (!current.enabled) return
      const target = resolvePageLocale(current.language, languages)
      if (target === loadedLocale) return
      let next: LocaleBundle
      try {
        next = await locales.load(target)
      } catch {
        // 加载失败时沿用当前语言，还没有语言包时保持停止；设置或浏览器语言再变化时重试
        return
      }
      if (request !== localeRequest || ctx.isInvalid) return
      const first = loadedLocale === undefined
      loadedLocale = target
      controller.updateLocale(next, TIME_LANGS[target])
      // 第一次换上语言包：按加载完成时的最新设置开启
      if (first) controller.updateSettings(current)
    }

    /** 在途的 syncLocale（最近一次），落定后为 undefined：开启后语言包换上之前的状态查询等它 */
    let localeTask: Promise<void> | undefined
    const requestLocale = (): void => {
      const task = syncLocale()
      localeTask = task
      const settled = (): void => {
        if (localeTask === task) localeTask = undefined
      }
      void task.then(settled, settled)
    }

    /** 等在途的 syncLocale 落定，最多 STATUS_WAIT_MS */
    const waitForLocale = (task: Promise<void>): Promise<void> =>
      new Promise((resolve) => {
        const timer = ctx.setTimeout(resolve, STATUS_WAIT_MS)
        const settle = (pending: Promise<void>): void => {
          const next = (): void => {
            // 期间又发起了加载（设置、浏览器语言再变）：接着等最新的
            if (localeTask && localeTask !== pending) {
              settle(localeTask)
              return
            }
            clearTimeout(timer)
            resolve()
          }
          void pending.then(next, next)
        }
        settle(task)
      })

    // 克隆地址加速：改写 Code 下拉框等处的克隆地址（见 core/clone-url）
    const cloneUrls = createCloneUrlRewriter(document, {
      settings: () => current,
      resolve: resolveDownload,
      copy: (text) => {
        navigator.clipboard.writeText(text).catch(() => undefined)
      },
    })
    // 图片加速：图片加载失败时经加速源取回（见 core/image-accelerate）
    const images = createImageAccelerator({ settings: () => current, fetchImage })

    const applySettings = (next: Settings): void => {
      current = next
      controller.updateSettings(effective(next))
      requestLocale()
      cloneUrls.refresh()
      if (next.enabled && next.accelerateImages) images.retryFailed(document)
    }

    /** 最近一次读取浏览器语言的序号：读取期间又变化时，旧结果丢弃 */
    let languagesRequest = 0
    const refreshLanguages = async (): Promise<void> => {
      const request = ++languagesRequest
      const next = await pageLanguageEnvironment()
      if (request !== languagesRequest || ctx.isInvalid) return
      languages = next
      requestLocale()
    }

    // 只监听 sync 区（设置）；自定义词条变化由后台转发
    const unwatchSettings = watchSettings(applySettings)
    // 浏览器语言变化：自动识别的翻译语言随之变化
    ctx.addEventListener(window, 'languagechange', () => void refreshLanguages())
    // 主世界桥接询问是否在翻译：翻译中取消询问事件。实例标记会被 GitHub 前进后退时写回，桥接不据此判断
    ctx.addEventListener(window, TURBO_TRANSLATING_EVENT, (event: Event) => {
      if (controller.translator.active) event.preventDefault()
    })
    // 下载加速：在捕获阶段先于页面脚本处理下载链接的点击（见 core/download-click）
    ctx.addEventListener(
      window,
      'click',
      createDownloadClickHandler({
        settings: () => current,
        resolve: resolveDownload,
        open: (url, newTab) => {
          window.open(url, newTab ? '_blank' : '_self', newTab ? 'noopener' : '')
        },
      }),
      { capture: true },
    )
    // 图片的 error 不冒泡：在捕获阶段监听
    ctx.addEventListener(window, 'error', images.onError, { capture: true })

    const refreshCustomEntries = async (): Promise<void> => {
      try {
        const entries = await getCustomEntries()
        if (ctx.isValid) controller.updateCustomEntries(entries)
      } catch {
        // 读取失败时沿用当前词条
      }
    }

    const refreshSettings = async (): Promise<void> => {
      try {
        const next = await getSettings()
        if (ctx.isValid) applySettings(next)
      } catch {
        // 读取失败时沿用当前设置
      }
    }

    const handleMessage: MessageHandler = (message, sendResponse) => {
      switch (message.type) {
        case 'gcn:get-status':
          // 开启后语言包还在加载：保持消息通道，等加载落定再应答（popup 开启后立即查询，得到换上之后的状态）。
          // 期间失效时不应答
          if (current.enabled && loadedLocale === undefined && localeTask) {
            void waitForLocale(localeTask).then(() => {
              if (ctx.isValid) sendResponse(controller.getStatus())
            })
            return true
          }
          sendResponse(controller.getStatus())
          return undefined
        case 'gcn:custom-entries-changed':
          void refreshCustomEntries()
          return undefined
      }
    }

    // 往返缓存恢复：缓存期间收不到自定义词条通知，Firefox 还会丢弃设置变更事件，恢复后补读
    ctx.addEventListener(window, 'pageshow', (event) => {
      if (!event.persisted) return
      void refreshCustomEntries()
      void refreshSettings()
    })

    // 软导航时顺带检查扩展是否失效（失效会触发 onInvalidated）
    ctx.addEventListener(window, 'wxt:locationchange', () => {
      if (ctx.isValid) controller.checkLocation()
    })
    // 不导航时定时检查（见 INVALIDATION_CHECK_MS）：检查由 ctx.setInterval 完成，回调不做事
    ctx.setInterval(() => undefined, INVALIDATION_CHECK_MS)

    // 先还原页面：扩展更新后旧上下文里调用扩展 API 可能抛错，不能因此跳过还原
    ctx.onInvalidated(() => {
      controller.dispose()
      mark.disconnect()
      cloneUrls.stop()
      removeMessageListener()
      try {
        unwatchSettings()
      } catch {
        // 上下文已失效，监听随之作废
      }
    })

    // 设置、浏览器语言的监听在读完存储（开启时还有加载语言包）后才注册，期间的变化收不到：补读一次
    void refreshLanguages()
    void refreshSettings()

    // 启动完成：处理读存储期间排队的消息
    gate.open(handleMessage)
  },
})
