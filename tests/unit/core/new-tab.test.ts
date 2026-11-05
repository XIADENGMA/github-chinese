// @vitest-environment-options { "url": "https://github.com/search?q=vue" }
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createNewTabClickHandler, shouldOpenInNewTab } from '../../../src/core/new-tab'
import { DEFAULT_SETTINGS, type Settings } from '../../../src/shared/settings'

const EXTERNAL = 'https://vuejs.org/guide/introduction.html'
const REPO = 'https://github.com/vuejs/core'

let settings: Settings
const open = vi.fn()
const handler = createNewTabClickHandler({ settings: () => settings, open })

/** 在 container（默认 body）里加一个链接，返回它 */
function addLink(href: string, attributes: Readonly<Record<string, string>> = {}, container: Element = document.body): HTMLAnchorElement {
  const anchor = document.createElement('a')
  anchor.href = href
  for (const [name, value] of Object.entries(attributes)) anchor.setAttribute(name, value)
  anchor.append(Object.assign(document.createElement('span'), { textContent: 'Sample text' }))
  container.append(anchor)
  return anchor
}

/** body 里加一个元素作容器 */
function addContainer(html: string): Element {
  const template = document.createElement('template')
  template.innerHTML = html
  const element = template.content.firstElementChild!
  document.body.append(element)
  return element.querySelector('[data-slot]') ?? element
}

/** 冒泡到 window 时默认行为是否已被取消；没传到（处理了，不再传给页面）时为 undefined */
let prevented: boolean | undefined

/** 记下是否已取消，再取消：测试环境里未取消的链接点击会真的跳转（之后的相对地址都落到别的站点） */
function guard(event: Event): void {
  prevented = event.defaultPrevented
  event.preventDefault()
}

/** 点击，返回是否被取消默认行为（没传到页面时看事件本身） */
function click(target: Element, init: MouseEventInit = {}): boolean {
  prevented = undefined
  const event = new MouseEvent('click', { bubbles: true, cancelable: true, composed: true, button: 0, ...init })
  target.dispatchEvent(event)
  return prevented ?? event.defaultPrevented
}

function goTo(path: string): void {
  history.replaceState(null, '', path)
}

function page(): URL {
  return new URL(document.URL)
}

beforeEach(() => {
  goTo('/search?q=vue')
  settings = { ...DEFAULT_SETTINGS, newTab: true }
  window.addEventListener('click', handler, { capture: true })
  window.addEventListener('click', guard)
})

afterEach(() => {
  window.removeEventListener('click', handler, { capture: true })
  window.removeEventListener('click', guard)
  open.mockClear()
  document.body.innerHTML = ''
})

describe('createNewTabClickHandler', () => {
  it('取消跳转，在新标签页打开（点在链接内的元素上）', () => {
    const anchor = addLink(REPO)
    expect(click(anchor.firstElementChild!)).toBe(true)
    expect(open).toHaveBeenCalledExactlyOnceWith(REPO, false)
  })

  it('链接本来不带来源页（rel 含 noreferrer）：照样不带', () => {
    expect(click(addLink(EXTERNAL, { rel: 'nofollow noopener noreferrer' }))).toBe(true)
    expect(open).toHaveBeenCalledExactlyOnceWith(EXTERNAL, true)
  })

  it.each<[string, Partial<Settings>]>([
    ['插件关闭', { enabled: false }],
    ['功能关闭', { newTab: false }]
  ])('%s：不处理', (_, patch) => {
    settings = { ...settings, ...patch }
    expect(click(addLink(EXTERNAL))).toBe(false)
    expect(open).not.toHaveBeenCalled()
  })

  it.each<[string, MouseEventInit]>([
    ['中键', { button: 1 }],
    ['Ctrl', { ctrlKey: true }],
    ['Meta', { metaKey: true }],
    ['Shift', { shiftKey: true }],
    ['Alt', { altKey: true }]
  ])('%s 单击：照常', (_, init) => {
    expect(click(addLink(EXTERNAL), init)).toBe(false)
    expect(open).not.toHaveBeenCalled()
  })

  it('处理的单击不再传给页面（GitHub 的自述文件不看 defaultPrevented，照样站内跳转）；不处理的照常传', () => {
    const page = vi.fn()
    document.addEventListener('click', page)
    try {
      click(addLink(EXTERNAL))
      expect(open).toHaveBeenCalledOnce()
      expect(page).not.toHaveBeenCalled()
      click(addLink(EXTERNAL), { ctrlKey: true })
      expect(page).toHaveBeenCalledOnce()
    } finally {
      document.removeEventListener('click', page)
    }
  })

  it('先注册的处理已取消默认行为：不处理', () => {
    const cancel = (event: Event): void => event.preventDefault()
    window.removeEventListener('click', handler, { capture: true })
    window.addEventListener('click', cancel, { capture: true })
    window.addEventListener('click', handler, { capture: true })
    try {
      click(addLink(EXTERNAL))
      expect(open).not.toHaveBeenCalled()
    } finally {
      window.removeEventListener('click', cancel, { capture: true })
    }
  })

  it('不是链接：不处理', () => {
    const button = document.createElement('button')
    document.body.append(button)
    expect(click(button)).toBe(false)
    expect(open).not.toHaveBeenCalled()
  })

  it('开放影子树里的链接也处理', () => {
    const host = document.createElement('div')
    document.body.append(host)
    const root = host.attachShadow({ mode: 'open' })
    const anchor = document.createElement('a')
    anchor.href = EXTERNAL
    root.append(anchor)
    expect(click(anchor)).toBe(true)
    expect(open).toHaveBeenCalledExactlyOnceWith(EXTERNAL, false)
  })
})

describe('shouldOpenInNewTab', () => {
  it('站外链接：任何页面、任何位置（含导航）都生效；只关站外时不处理', () => {
    goTo('/vuejs/core/pull/2')
    const inNav = addLink(EXTERNAL, {}, addContainer('<nav></nav>'))
    expect(shouldOpenInNewTab(inNav, page(), settings)).toBe(true)
    settings = { ...settings, newTabScopes: ['search'] }
    expect(shouldOpenInNewTab(inNav, page(), settings)).toBe(false)
  })

  it.each(['https://docs.github.com/en', 'https://gist.github.com/octocat', 'https://raw.githubusercontent.com/vuejs/core/main/README.md'])(
    'GitHub 自己的站点不算站外：%s',
    href => {
      goTo('/vuejs/core')
      expect(shouldOpenInNewTab(addLink(href), page(), { ...settings, newTabScopes: ['external'] })).toBe(false)
    }
  )

  it('企业版站点的页面：本站及其子域名、GitHub 自己的站点不算站外，其他网站算', () => {
    const only = { ...settings, newTabScopes: ['external'] as const }
    const enterprise = new URL('https://github.example.com/vuejs/core/issues')
    for (const href of [
      'https://github.example.com/vuejs/core',
      'https://gist.github.example.com/octocat',
      'https://media.github.example.com/user/1/files/sample.png',
      'https://github.com/vuejs/core'
    ]) {
      expect(shouldOpenInNewTab(addLink(href), enterprise, only), href).toBe(false)
    }
    expect(shouldOpenInNewTab(addLink(EXTERNAL), enterprise, only)).toBe(true)
    expect(shouldOpenInNewTab(addLink('https://octo-corp.ghe.com/'), enterprise, only)).toBe(true)
    // github.com 的页面上，企业版站点算站外
    expect(shouldOpenInNewTab(addLink('https://github.example.com/vuejs/core'), page(), only)).toBe(true)
  })

  it('企业版站点的页面按所在页面的范围生效（同 github.com）', () => {
    const issues = { ...settings, newTabScopes: ['issues'] as const }
    expect(
      shouldOpenInNewTab(
        addLink('https://github.example.com/vuejs/core/issues/1'),
        new URL('https://github.example.com/vuejs/core/issues'),
        issues
      )
    ).toBe(true)
    expect(
      shouldOpenInNewTab(
        addLink('https://github.example.com/vuejs/core/issues/1'),
        new URL('https://github.example.com/vuejs/core'),
        issues
      )
    ).toBe(false)
  })

  it('正文链接：任何页面都生效（含正文里的站内链接）', () => {
    goTo('/vuejs/core/issues/1')
    settings = { ...settings, newTabScopes: ['content'] }
    const body = addContainer('<div class="comment-body"><p data-slot></p></div>')
    expect(shouldOpenInNewTab(addLink(`${REPO}/pull/2`, {}, body), page(), settings)).toBe(true)
    const markdown = addContainer('<article class="markdown-body"></article>')
    expect(shouldOpenInNewTab(addLink(`${REPO}/blob/main/README.md`, {}, markdown), page(), settings)).toBe(true)
    // 正文外的站内链接
    expect(shouldOpenInNewTab(addLink(`${REPO}/pulls`), page(), settings)).toBe(false)
  })

  it('按页面生效：只处理页面主体中的链接', () => {
    settings = { ...settings, newTabScopes: ['search'] }
    expect(shouldOpenInNewTab(addLink(REPO), page(), settings)).toBe(true)
    for (const html of [
      '<header class="AppHeader"><div data-slot></div></header>',
      '<header class="GlobalNav"></header>',
      '<div role="banner"></div>',
      '<nav aria-label="Sample text"><ul><li data-slot></li></ul></nav>',
      '<div role="navigation"></div>',
      '<div class="paginate-container"><div class="pagination" data-slot></div></div>',
      '<div class="UnderlineNav"></div>',
      '<div role="tablist"></div>',
      '<details-menu></details-menu>',
      '<div role="dialog"></div>',
      '<footer role="contentinfo"></footer>'
    ]) {
      const anchor = addLink(`${REPO}/issues`, {}, addContainer(html))
      expect(shouldOpenInNewTab(anchor, page(), settings), html).toBe(false)
    }
  })

  it('当前页面不在所选范围：不处理', () => {
    goTo('/vuejs/core/issues')
    settings = { ...settings, newTabScopes: ['search'] }
    expect(shouldOpenInNewTab(addLink(`${REPO}/issues/1`), page(), settings)).toBe(false)
    settings = { ...settings, newTabScopes: ['issues'] }
    expect(shouldOpenInNewTab(addLink(`${REPO}/issues/1`), page(), settings)).toBe(true)
  })

  it('自定义页面：路径匹配时处理页面主体中的链接', () => {
    goTo('/vuejs/core/releases')
    settings = { ...settings, newTabScopes: [], newTabPaths: ['/*/*/releases'] }
    expect(shouldOpenInNewTab(addLink(`${REPO}/releases/tag/v3.5.0`), page(), settings)).toBe(true)
    expect(shouldOpenInNewTab(addLink(`${REPO}/tags`, {}, addContainer('<nav></nav>')), page(), settings)).toBe(false)
    goTo('/vuejs/core/tags')
    expect(shouldOpenInNewTab(addLink(`${REPO}/releases`), page(), settings)).toBe(false)
  })

  it('同一页面（只改查询串、锚点）：不处理', () => {
    goTo('/search?q=vue')
    expect(shouldOpenInNewTab(addLink('https://github.com/search?q=vue&type=code'), page(), settings)).toBe(false)
    expect(shouldOpenInNewTab(addLink('https://github.com/search?q=vue#top'), page(), settings)).toBe(false)
  })

  it.each<[string, string, Readonly<Record<string, string>>]>([
    ['本来就在新窗口打开', EXTERNAL, { target: '_blank' }],
    ['指定了其他窗口', EXTERNAL, { target: 'preview' }],
    ['下载', EXTERNAL, { download: '' }],
    ['作按钮用', REPO, { role: 'button' }],
    ['标签页', REPO, { role: 'tab' }],
    ['菜单项', REPO, { role: 'menuitem' }],
    ['弹出菜单', REPO, { 'aria-haspopup': 'true' }],
    ['展开收起', REPO, { 'aria-expanded': 'false' }],
    ['POST 等动作', REPO, { 'data-method': 'post' }],
    ['Turbo 动作', REPO, { 'data-turbo-method': 'delete' }]
  ])('%s：不处理', (_, href, attributes) => {
    expect(shouldOpenInNewTab(addLink(href, attributes), page(), settings)).toBe(false)
  })

  it('target 为空或 _self：照常处理', () => {
    expect(shouldOpenInNewTab(addLink(EXTERNAL, { target: '' }), page(), settings)).toBe(true)
    expect(shouldOpenInNewTab(addLink(EXTERNAL, { target: '_self' }), page(), settings)).toBe(true)
  })

  it.each(['mailto:octocat@example.com', 'javascript:void(0)', 'ftp://example.com/file'])('非 http(s) 链接：不处理（%s）', href => {
    expect(shouldOpenInNewTab(addLink(href), page(), settings)).toBe(false)
  })
})
