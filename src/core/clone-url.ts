import { parseCloneUrl } from '../shared/accelerate'
import { categoryCandidates, categoryUrl, replacementCategory } from '../shared/accelerate-categories'
import type { Settings } from '../shared/settings'
import type { HealthCache } from './accelerate-health'
import { isPrivatePage } from './private-page'

/**
 * 克隆地址加速（替换原链接）：开启下载加速、选了替换原链接的分类时，存储库 Code 下拉框里的 HTTPS 克隆地址、
 * 代码片段的「Clone via HTTPS」地址换成用该分类加速后的地址（故障转移开启时用探测可用的最快的，都不可用时不改）。存储库的复制按钮复制的是页面脚本里的原地址：点击冒泡到 window 时（页面脚本已复制）
 * 再把加速后的地址写入剪贴板。代码片段的复制按钮复制输入框的值，不另外处理。
 * 只改这两处：新建存储库页面的地址用于推送，不改（推送凭据不交给加速源）。关闭下载加速、不替换、停止时还原
 */
export interface CloneUrlOptions {
  readonly settings: () => Settings
  /** 加速源的探测结果（故障转移开启时用） */
  readonly health: HealthCache
  /** 写入剪贴板 */
  readonly copy: (text: string) => void
}

export interface CloneUrlRewriter {
  /** 设置变化后按新设置改写或还原 */
  refresh(): void
  /** 停止监听并还原 */
  stop(): void
}

/** 存储库 Code 下拉框的 HTTPS 克隆地址输入框（React 组件：切换 HTTPS、SSH 等时同一元素改 value） */
const REPO_INPUT_ID = 'clone-with-https'
/** 要改写的元素：存储库的克隆地址输入框；代码片段的分享输入框与「Clone via HTTPS」选项（选中时页面把选项的值填进输入框） */
const TARGET_SELECTOR = `input#${REPO_INPUT_ID}, input[id^="gist-share-url"], button[role="option"][value]`

interface Rewrite {
  readonly original: string
  readonly accelerated: string
}

type Target = HTMLInputElement | HTMLButtonElement

/** 同时改属性与当前值：React 重新渲染时改回属性，观察到后再改写；输入框显示、复制的是当前值 */
function setValue(element: Target, value: string): void {
  element.setAttribute('value', value)
  element.value = value
}

export function createCloneUrlRewriter(doc: Document, options: CloneUrlOptions): CloneUrlRewriter {
  const rewrites = new Map<Target, Rewrite>()
  /** 等后台选源的元素与原地址：期间值变了（切换了克隆方式）就不改 */
  const pending = new WeakMap<Target, string>()

  function isActive(): boolean {
    const settings = options.settings()
    return settings.enabled && settings.accelerate && replacementCategory(settings) !== undefined && !isPrivatePage(doc)
  }

  function restore(element: Target, rewrite: Rewrite): void {
    rewrites.delete(element)
    if (element.getAttribute('value') === rewrite.accelerated) setValue(element, rewrite.original)
  }

  function apply(element: Target, original: string, accelerated: string): void {
    if (accelerated === original) return
    rewrites.set(element, { original, accelerated })
    setValue(element, accelerated)
  }

  function rewrite(element: Target, original: string): void {
    const settings = options.settings()
    const category = replacementCategory(settings)
    const link = parseCloneUrl(original)
    if (!category || !link || pending.get(element) === original || categoryCandidates(category, link).length === 0) return
    const known = settings.failover ? options.health.current() : undefined
    if (!settings.failover || known) {
      const accelerated = categoryUrl(category, link, known)
      if (accelerated) apply(element, original, accelerated)
      return
    }
    pending.set(element, original)
    options.health.get().then(
      health => {
        pending.delete(element)
        const current = replacementCategory(options.settings())
        const accelerated = current && categoryUrl(current, link, health)
        if (accelerated && element.isConnected && element.getAttribute('value') === original && isActive()) {
          apply(element, original, accelerated)
        }
      },
      () => pending.delete(element)
    )
  }

  function scan(): void {
    for (const [element, state] of rewrites) {
      // 已移除，或页面改了值（切换克隆方式）：不再记着
      if (!element.isConnected || element.getAttribute('value') !== state.accelerated) rewrites.delete(element)
    }
    const active = isActive()
    if (!active) {
      for (const [element, state] of rewrites) restore(element, state)
      return
    }
    for (const element of doc.querySelectorAll<Target>(TARGET_SELECTOR)) {
      if (!rewrites.has(element)) rewrite(element, element.getAttribute('value') ?? '')
    }
  }

  /** 存储库复制按钮：页面脚本复制原地址之后，改写剪贴板 */
  function onClick(event: MouseEvent): void {
    const button = event.target instanceof Element ? event.target.closest('button') : null
    if (!button) return
    for (const [element, state] of rewrites) {
      if (element.id === REPO_INPUT_ID && element.parentElement?.contains(button) && element !== button) {
        if (element.getAttribute('value') === state.accelerated) options.copy(state.accelerated)
        return
      }
    }
  }

  const observer = new MutationObserver(scan)
  observer.observe(doc.documentElement, {
    subtree: true,
    childList: true,
    attributes: true,
    attributeFilter: ['value']
  })
  const view = doc.defaultView
  view?.addEventListener('click', onClick)
  scan()

  return {
    refresh() {
      // 替换用的分类、故障转移可能变了：先还原再按新设置改写
      for (const [element, state] of rewrites) restore(element, state)
      scan()
    },
    stop() {
      observer.disconnect()
      view?.removeEventListener('click', onClick)
      for (const [element, state] of rewrites) restore(element, state)
    }
  }
}
