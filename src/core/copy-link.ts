import { acceleratePreferred, needsProbe, parseDownloadLink } from '../shared/accelerate'
import type { Settings } from '../shared/settings'
import { createIcon, type IconName } from './icons'
import { isPrivatePage } from './private-page'

/**
 * 复制加速链接：开启下载加速时，发行版附件列表、标签列表中每个附件与源码包链接后加一个复制按钮，
 * 复制加速后的地址（交给命令行、下载工具）。不公开的页面不加；关闭下载加速、停止时移除
 */
export interface CopyLinkOptions {
  readonly settings: () => Settings
  /** 要探测时（故障转移开启、首选为自动选择）请后台选源，返回加速后的地址；出错、超时时拒绝 */
  readonly resolve: (url: string) => Promise<string>
  /** 写入剪贴板；失败时拒绝 */
  readonly copy: (text: string) => Promise<void>
  /** 按钮的无障碍名称：复制、已复制、复制失败 */
  readonly label: (state: CopyState) => string
}

export interface CopyLinkButtons {
  /** 设置变化后按新设置添加或移除 */
  refresh(): void
  /** 停止监听并移除按钮 */
  stop(): void
}

/** 按钮的状态：待复制、已复制、复制失败 */
export type CopyState = 'idle' | 'copied' | 'failed'

/** 按钮上的标记属性 */
export const COPY_BUTTON_ATTRIBUTE = 'data-gcn-copy-link'
/** 已复制、复制失败的提示保留多久 */
export const COPY_FEEDBACK_MS = 2000

/** 附件、源码包链接：发行版附件列表与标签列表的行内（Box-row） */
const LINK_SELECTOR = '.Box-row a[href]'
const STYLE_ID = 'gcn-copy-link-style'
const ICONS: Readonly<Record<CopyState, IconName>> = { idle: 'copy', copied: 'check', failed: 'cross' }

/** 按钮样式：颜色用 GitHub 的主题变量（随浅色、深色主题），取不到时用默认值 */
const STYLE = `
[${COPY_BUTTON_ATTRIBUTE}] {
  display: inline-flex;
  flex: none;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  margin: -2px 0 -2px 4px;
  padding: 0;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: var(--fgColor-muted, #59636e);
  vertical-align: middle;
  cursor: pointer;
}
[${COPY_BUTTON_ATTRIBUTE}]:hover {
  background: var(--control-transparent-bgColor-hover, rgba(129, 139, 152, 0.15));
  color: var(--fgColor-accent, #0969da);
}
[${COPY_BUTTON_ATTRIBUTE}]:focus-visible {
  outline: 2px solid var(--focus-outlineColor, #0969da);
  outline-offset: -2px;
}
[${COPY_BUTTON_ATTRIBUTE}][data-state='copied'] {
  color: var(--fgColor-success, #1a7f37);
}
[${COPY_BUTTON_ATTRIBUTE}][data-state='failed'] {
  color: var(--fgColor-danger, #d1242f);
}
`

/** Release 附件与源码包：可加速的才加按钮 */
function isCopyTarget(anchor: HTMLAnchorElement): boolean {
  const kind = parseDownloadLink(anchor.href)?.kind
  return kind === 'release' || kind === 'archive'
}

export function createCopyLinkButtons(doc: Document, options: CopyLinkOptions): CopyLinkButtons {
  /** 已加按钮的链接 → 按钮 */
  const buttons = new Map<HTMLAnchorElement, HTMLButtonElement>()
  const timers = new WeakMap<HTMLButtonElement, ReturnType<typeof setTimeout>>()
  let scheduled = false
  let observing = false
  let stopped = false

  /** 设置上开启：开启时才监听 DOM 变动 */
  function isEnabled(): boolean {
    const settings = options.settings()
    return settings.enabled && settings.accelerate
  }

  function isActive(): boolean {
    return isEnabled() && !isPrivatePage(doc)
  }

  function setState(button: HTMLButtonElement, state: CopyState): void {
    const label = options.label(state)
    button.dataset.state = state
    button.setAttribute('aria-label', label)
    button.title = label
    button.replaceChildren(createIcon(doc, ICONS[state]))
  }

  /** 加速后的地址；没有加速源支持时为 undefined */
  async function acceleratedUrl(href: string): Promise<string | undefined> {
    const settings = options.settings()
    const link = parseDownloadLink(href)
    if (!link) return undefined
    if (!needsProbe(settings)) return acceleratePreferred(settings, link)
    return options.resolve(href)
  }

  async function onClick(button: HTMLButtonElement, anchor: HTMLAnchorElement): Promise<void> {
    if (!isActive()) return
    clearTimeout(timers.get(button))
    let state: CopyState = 'failed'
    try {
      const url = await acceleratedUrl(anchor.href)
      if (url) {
        await options.copy(url)
        state = 'copied'
      }
    } catch {
      // 选源失败、剪贴板不可用：显示复制失败
    }
    if (!button.isConnected) return
    setState(button, state)
    timers.set(
      button,
      setTimeout(() => setState(button, 'idle'), COPY_FEEDBACK_MS)
    )
  }

  function createButton(anchor: HTMLAnchorElement): HTMLButtonElement {
    const button = doc.createElement('button')
    button.type = 'button'
    button.setAttribute(COPY_BUTTON_ATTRIBUTE, '')
    // 文字已是界面语言：汉化引擎、浏览器翻译都不处理
    button.setAttribute('translate', 'no')
    setState(button, 'idle')
    button.addEventListener('click', event => {
      event.preventDefault()
      event.stopPropagation()
      void onClick(button, anchor)
    })
    return button
  }

  function ensureStyle(): void {
    if (doc.getElementById(STYLE_ID)) return
    const style = doc.createElement('style')
    style.id = STYLE_ID
    style.textContent = STYLE
    ;(doc.head ?? doc.documentElement).append(style)
  }

  function removeAll(): void {
    for (const button of buttons.values()) button.remove()
    buttons.clear()
    doc.getElementById(STYLE_ID)?.remove()
  }

  function scan(): void {
    scheduled = false
    setObserving(!stopped && isEnabled())
    // 不公开的页面（软导航后可能变化，照常监听）
    if (!observing || isPrivatePage(doc)) {
      removeAll()
      return
    }
    for (const [anchor, button] of buttons) {
      // 链接已移除、按钮被页面移走：不再记着
      if (!anchor.isConnected || anchor.nextElementSibling !== button) {
        button.remove()
        buttons.delete(anchor)
      }
    }
    for (const anchor of doc.querySelectorAll<HTMLAnchorElement>(LINK_SELECTOR)) {
      if (buttons.has(anchor) || !isCopyTarget(anchor)) continue
      ensureStyle()
      const button = createButton(anchor)
      anchor.after(button)
      buttons.set(anchor, button)
    }
  }

  /** 同一轮 DOM 变动只扫描一次 */
  function schedule(): void {
    if (scheduled) return
    scheduled = true
    queueMicrotask(scan)
  }

  const observer = new MutationObserver(schedule)

  function setObserving(on: boolean): void {
    if (on === observing) return
    observing = on
    if (on) observer.observe(doc.documentElement, { childList: true, subtree: true })
    else observer.disconnect()
  }

  scan()

  return {
    refresh: scan,
    stop() {
      stopped = true
      setObserving(false)
      removeAll()
    }
  }
}
