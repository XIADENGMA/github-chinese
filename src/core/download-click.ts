import { parseDownloadLink } from '../shared/accelerate'
import { categoryCandidates, categoryUrl, replacementCategory } from '../shared/accelerate-categories'
import type { Settings } from '../shared/settings'
import type { HealthCache } from './accelerate-health'
import { isPrivatePage } from './private-page'

export interface DownloadClickOptions {
  /** 当前设置 */
  readonly settings: () => Settings
  /** 加速源的探测结果（故障转移开启时用） */
  readonly health: HealthCache
  /** 打开地址；newTab 为原链接在新标签页打开 */
  readonly open: (url: string, newTab: boolean) => void
}

/** 普通的左键单击（含键盘触发的点击）：不带修饰键，页面没有取消 */
function isPlainClick(event: MouseEvent): boolean {
  return event.button === 0 && !event.defaultPrevented && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey
}

/** 点击落在的链接（含开放影子树内的） */
function anchorOf(event: Event): HTMLAnchorElement | undefined {
  return event.composedPath().find((node): node is HTMLAnchorElement => node instanceof HTMLAnchorElement)
}

/**
 * 替换原链接：选了替换原链接的分类时，下载链接的点击在 window 的捕获阶段处理（先于页面脚本），
 * 取消默认跳转，改开用该分类加速后的地址。故障转移关闭时用分类中第一个支持该链接的加速源；
 * 开启时用探测可用的最快的（已有探测结果时直接用，否则等后台探测），都不可用、后台出错时打开原链接。
 * 分类中没有加速源支持该链接时不处理。中键、带修饰键的点击（新标签页打开、另存为等）不处理
 */
export function createDownloadClickHandler(options: DownloadClickOptions): (event: MouseEvent) => void {
  return event => {
    const settings = options.settings()
    if (!settings.enabled || !settings.accelerate || !isPlainClick(event)) return
    const category = replacementCategory(settings)
    const anchor = anchorOf(event)
    const link = anchor && parseDownloadLink(anchor.href)
    if (!category || !anchor || !link || isPrivatePage(anchor.ownerDocument)) return
    // 带 download 属性的 Raw 链接是要保存文件：加速源把文本文件显示在页面上，不加速
    if (link.kind === 'raw' && anchor.hasAttribute('download')) return
    if (categoryCandidates(category, link).length === 0) return
    const newTab = anchor.target === '_blank'
    const { href } = anchor
    const known = settings.failover ? options.health.current() : undefined
    if (!settings.failover || known) {
      const url = categoryUrl(category, link, known)
      // 都不可用：照常打开原链接
      if (!url) return
      event.preventDefault()
      options.open(url, newTab)
      return
    }
    event.preventDefault()
    options.health.get().then(
      health => options.open(categoryUrl(category, link, health) ?? href, newTab),
      () => options.open(href, newTab)
    )
  }
}
