import { acceleratePreferred, candidateSources, needsProbe, parseDownloadLink } from '../shared/accelerate'
import type { Settings } from '../shared/settings'
import { isPrivatePage } from './private-page'

export interface DownloadClickOptions {
  /** 当前设置 */
  readonly settings: () => Settings
  /** 要探测时（故障转移开启、首选为自动选择）请后台选源，返回要打开的地址；出错、超时时拒绝 */
  readonly resolve: (url: string) => Promise<string>
  /** 打开地址；newTab 为原链接在新标签页打开 */
  readonly open: (url: string, newTab: boolean) => void
}

/** 普通的左键单击（含键盘触发的点击）：不带修饰键，页面没有取消 */
function isPlainClick(event: MouseEvent): boolean {
  return (
    event.button === 0 &&
    !event.defaultPrevented &&
    !event.metaKey &&
    !event.ctrlKey &&
    !event.shiftKey &&
    !event.altKey
  )
}

/** 点击落在的链接（含开放影子树内的） */
function anchorOf(event: Event): HTMLAnchorElement | undefined {
  return event.composedPath().find((node): node is HTMLAnchorElement => node instanceof HTMLAnchorElement)
}

/**
 * 下载链接的点击处理，在 window 的捕获阶段注册（先于页面脚本）。开启下载加速时取消默认跳转，改开加速后的地址：
 * 不探测时直接用首选加速源（它不支持该链接时用第一个支持的）；要探测时请后台选源，后台出错、超时则打开原链接。
 * 没有加速源支持该链接时不处理。中键、带修饰键的点击（新标签页打开、另存为等）不处理
 */
export function createDownloadClickHandler(options: DownloadClickOptions): (event: MouseEvent) => void {
  return (event) => {
    const settings = options.settings()
    if (!settings.enabled || !settings.accelerate || !isPlainClick(event)) return
    const anchor = anchorOf(event)
    const link = anchor && parseDownloadLink(anchor.href)
    if (!anchor || !link || isPrivatePage(anchor.ownerDocument)) return
    // 带 download 属性的 Raw 链接是要保存文件：加速源把文本文件显示在页面上，不加速
    if (link.kind === 'raw' && anchor.hasAttribute('download')) return
    const newTab = anchor.target === '_blank'
    if (!needsProbe(settings)) {
      const url = acceleratePreferred(settings, link)
      if (!url) return
      event.preventDefault()
      options.open(url, newTab)
      return
    }
    if (candidateSources(settings, link).length === 0) return
    event.preventDefault()
    const { href } = anchor
    options.resolve(href).then(
      (url) => options.open(url, newTab),
      () => options.open(href, newTab),
    )
  }
}
