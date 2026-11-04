/**
 * 软导航检测：GitHub 用 Turbo 与 React 路由改地址而不刷新页面。
 * 监听导航事件、Navigation API（可用时）与 DOM 变动，地址变化时回调。
 */

/** document 上派发的软导航事件 */
export const DOCUMENT_NAVIGATION_EVENTS: readonly string[] = [
  'turbo:load',
  'turbo:render',
  'turbo:frame-load',
  'soft-nav:end',
  'soft-nav:success'
]

/** window 上的导航事件 */
export const WINDOW_NAVIGATION_EVENTS: readonly string[] = ['popstate', 'pageshow', 'hashchange']

export interface NavigationHost {
  readonly document: Document
  readonly location: Location
  readonly MutationObserver: typeof MutationObserver
  addEventListener(type: string, listener: () => void): void
  removeEventListener(type: string, listener: () => void): void
}

export interface NavigationWatcher {
  readonly running: boolean
  start(): void
  stop(): void
  /** 立即比较地址，变化时回调 */
  check(): void
}

interface NavigationApi {
  addEventListener(type: string, listener: () => void): void
  removeEventListener(type: string, listener: () => void): void
}

export function createNavigationWatcher(host: NavigationHost, onChange: (href: string) => void): NavigationWatcher {
  let running = false
  let lastHref = ''
  let observer: MutationObserver | null = null
  const navigation = (host as { readonly navigation?: NavigationApi }).navigation

  const check = (): void => {
    if (!running) return
    const href = host.location.href
    if (href === lastHref) return
    lastHref = href
    onChange(href)
  }

  return {
    get running() {
      return running
    },

    start() {
      if (running) return
      running = true
      lastHref = host.location.href
      for (const type of DOCUMENT_NAVIGATION_EVENTS) host.document.addEventListener(type, check)
      for (const type of WINDOW_NAVIGATION_EVENTS) host.addEventListener(type, check)
      navigation?.addEventListener('currententrychange', check)
      observer = new host.MutationObserver(check)
      observer.observe(host.document, { childList: true, subtree: true })
    },

    stop() {
      if (!running) return
      running = false
      for (const type of DOCUMENT_NAVIGATION_EVENTS) host.document.removeEventListener(type, check)
      for (const type of WINDOW_NAVIGATION_EVENTS) host.removeEventListener(type, check)
      navigation?.removeEventListener('currententrychange', check)
      observer?.disconnect()
      observer = null
    },

    check
  }
}
