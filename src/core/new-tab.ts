import { isGitHubSite, pageScope } from '../shared/new-tab'
import { matchesPathPattern, type Settings } from '../shared/settings'

/**
 * 新标签页打开：开启后，单击符合范围（见 shared/new-tab）的链接时改在新标签页打开。
 * 站外链接、正文链接在任何页面生效；按页面生效的范围与自定义页面只处理页面主体中的链接，
 * 顶栏、导航、菜单、标签页、分页、工具栏、对话框里的不处理。
 * 只改变当前页面查询串、锚点的链接（筛选、排序、翻页、标签页、页内跳转），本来就在新窗口打开的、下载、
 * 带 POST 等动作的、作按钮用的链接不处理；中键、带修饰键的单击照常
 */
export interface NewTabOptions {
  readonly settings: () => Settings
  /** 在新标签页打开；noreferrer 为链接本来不带来源页 */
  readonly open: (url: string, noreferrer: boolean) => void
}

/** 正文：渲染后的 Markdown */
const CONTENT_SELECTOR = '.markdown-body, .comment-body'
/** 页面框架：全站顶栏（登录后、未登录、旧版）与页脚、导航、菜单、标签页、分页、工具栏、对话框等 */
const CHROME_SELECTOR = [
  'header.GlobalNav',
  'header[class*="appHeader"]',
  'header.AppHeader',
  'header.Header',
  '.js-header-wrapper',
  '[role="banner"]',
  '[role="contentinfo"]',
  'nav',
  '[role="navigation"]',
  '[role="menu"]',
  '[role="menubar"]',
  '[role="listbox"]',
  '[role="tablist"]',
  '[role="toolbar"]',
  '[role="dialog"]',
  '[role="search"]',
  '.pagination',
  '.paginate-container',
  '.UnderlineNav',
  '.subnav',
  '.SelectMenu',
  'details-menu',
  '.dropdown-menu'
].join(', ')
/** 作按钮用、带动作的链接 */
const ACTION_LINK_SELECTOR = [
  '[role="button"]',
  '[role="tab"]',
  '[role="menuitem"]',
  '[role="menuitemradio"]',
  '[role="menuitemcheckbox"]',
  '[role="option"]',
  '[aria-haspopup]',
  '[aria-expanded]',
  '[data-method]',
  '[data-turbo-method]',
  '[data-turbo-stream]'
].join(', ')

/** 普通的左键单击（含键盘触发的点击）：不带修饰键，页面没有取消 */
function isPlainClick(event: MouseEvent): boolean {
  return event.button === 0 && !event.defaultPrevented && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey
}

/** 点击落在的链接（含开放影子树内的） */
function anchorOf(event: Event): HTMLAnchorElement | undefined {
  return event.composedPath().find((node): node is HTMLAnchorElement => node instanceof HTMLAnchorElement)
}

function parseUrl(href: string): URL | undefined {
  try {
    return new URL(href)
  } catch {
    return undefined
  }
}

/** 链接要不要改在新标签页打开；page 为当前页面的地址 */
export function shouldOpenInNewTab(anchor: HTMLAnchorElement, page: URL, settings: Settings): boolean {
  const url = parseUrl(anchor.href)
  if (!url || (url.protocol !== 'https:' && url.protocol !== 'http:')) return false
  const target = anchor.getAttribute('target')
  if ((target !== null && target !== '' && target !== '_self') || anchor.hasAttribute('download')) return false
  if (anchor.matches(ACTION_LINK_SELECTOR)) return false
  // 同一页面：只改查询串、锚点
  if (url.origin === page.origin && url.pathname === page.pathname) return false
  const scopes = settings.newTabScopes
  if (scopes.includes('external') && !isGitHubSite(url.hostname)) return true
  if (scopes.includes('content') && anchor.closest(CONTENT_SELECTOR)) return true
  const scope = pageScope(page)
  const onPage = (scope !== undefined && scopes.includes(scope)) || matchesPathPattern(page.pathname, settings.newTabPaths)
  return onPage && anchor.closest(CHROME_SELECTOR) === null
}

/**
 * 链接的点击处理，在 window 的捕获阶段注册（先于页面脚本：取消默认行为后 Turbo、React 的路由不再跳转）。
 * 图片预览、下载加速先处理（已取消默认行为的点击不处理）
 */
export function createNewTabClickHandler(options: NewTabOptions): (event: MouseEvent) => void {
  return event => {
    const settings = options.settings()
    if (!settings.enabled || !settings.newTab || !isPlainClick(event)) return
    const anchor = anchorOf(event)
    if (!anchor) return
    const page = parseUrl(anchor.ownerDocument.URL)
    if (!page || !shouldOpenInNewTab(anchor, page, settings)) return
    event.preventDefault()
    const noreferrer = (anchor.getAttribute('rel') ?? '').split(/\s+/).includes('noreferrer')
    options.open(anchor.href, noreferrer)
  }
}
