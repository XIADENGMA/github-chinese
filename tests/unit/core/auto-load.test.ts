// @vitest-environment-options { "url": "https://github.com/vuejs/core/releases" }
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  createAutoLoader,
  HIDDEN_NAV_ATTRIBUTE,
  LOAD_MORE_SELECTOR,
  MAX_AUTO_PAGES,
  PAGE_NAV_ATTRIBUTE,
  RECLICK_DELAY_MS,
  type AutoLoader
} from '../../../src/core/auto-load'
import { PAGE_BREAK_CLASS } from '../../../src/core/page-break'
import { nextPageLink, paginations } from '../../../src/core/page-list'

const RELEASES = 'https://github.com/vuejs/core/releases'

function release(version: string): string {
  return `<section id="release-${version}"><h2><a href="/vuejs/core/releases/tag/${version}">${version}</a></h2><p>Sample text</p></section>`
}

/** 发行版列表的一页：当前页码，有下一页时带 next_page 链接 */
function releasesPage(versions: readonly string[], page: number, next?: string): string {
  const nextLink = next ? `<a class="next_page" rel="next" href="${next}">Next</a>` : '<span class="next_page disabled">Next</span>'
  return (
    `<main><div id="list">${versions.map(release).join('')}</div>` +
    `<div class="paginate-container"><div class="pagination"><span class="previous_page disabled">Previous</span>` +
    `<em class="current" aria-current="page">${page}</em>${nextLink}</div></div></main>`
  )
}

/** 接近视口的回调：测试里手动触发 */
const watchers = new Map<Element, () => void>()
const cancelled: Element[] = []
function watch(element: Element, onNear: () => void): () => void {
  watchers.set(element, onNear)
  return () => {
    watchers.delete(element)
    cancelled.push(element)
  }
}

function near(element: Element | null | undefined): void {
  if (element) watchers.get(element)?.()
}

/** 最后一处显示的分页 */
function pagination(): Element | null {
  const all = paginations(document).filter(node => !node.hasAttribute(HIDDEN_NAV_ATTRIBUTE))
  return all[all.length - 1] ?? null
}

function versions(): string[] {
  return [...document.querySelectorAll('section[id^="release-"]')].map(node => node.id.replace('release-', ''))
}

function dividers(): string[] {
  return [...document.querySelectorAll(`.${PAGE_BREAK_CLASS}`)].map(node => node.textContent ?? '')
}

/** 等 DOM 变动的扫描、取回的回调跑完 */
async function flush(): Promise<void> {
  for (let round = 0; round < 3; round += 1) await new Promise(done => setTimeout(done, 0))
}

let active = true
let clock = 0
let pages: Record<string, string>
const fetchPage = vi.fn(async (url: string): Promise<string> => {
  const html = pages[url]
  if (html === undefined) throw new Error(`404 ${url}`)
  return html
})
const onError = vi.fn()
let loader: AutoLoader | undefined

function start(): AutoLoader {
  loader = createAutoLoader(document, {
    active: () => active,
    fetchPage,
    watch,
    now: () => clock,
    onError,
    pageLabel: page => `第 ${page} 页`
  })
  return loader
}

beforeEach(() => {
  history.replaceState(null, '', '/vuejs/core/releases')
  active = true
  clock = 0
  pages = {}
})

afterEach(() => {
  loader?.stop()
  loader = undefined
  watchers.clear()
  cancelled.length = 0
  fetchPage.mockClear()
  onError.mockClear()
  document.body.innerHTML = ''
  vi.useRealTimers()
  vi.restoreAllMocks()
})

describe('「加载更多」按钮', () => {
  function addButton(): HTMLButtonElement {
    const form = document.createElement('form')
    form.className = 'ajax-pagination-form'
    const button = document.createElement('button')
    button.type = 'button'
    form.append(button)
    document.body.append(form)
    return button
  }

  it('接近视口时点击，每个只点一次', () => {
    const button = addButton()
    const onClick = vi.fn()
    button.addEventListener('click', onClick)
    start()
    expect(button.matches(LOAD_MORE_SELECTOR)).toBe(true)
    near(button)
    near(button)
    expect(onClick).toHaveBeenCalledOnce()
    expect(cancelled).toContain(button)
  })

  it('后来出现的按钮也处理；不可用的不点', async () => {
    start()
    const button = addButton()
    const onClick = vi.fn()
    button.addEventListener('click', onClick)
    await flush()
    button.disabled = true
    near(button)
    expect(onClick).not.toHaveBeenCalled()
    button.disabled = false
    loader!.refresh()
    near(button)
    expect(onClick).toHaveBeenCalledOnce()
  })

  it(`同一类按钮在同一页面最多点 ${MAX_AUTO_PAGES} 次`, () => {
    const buttons = Array.from({ length: MAX_AUTO_PAGES + 2 }, () => addButton())
    const onClick = vi.fn()
    for (const button of buttons) button.addEventListener('click', onClick)
    start()
    for (const button of buttons) near(button)
    expect(onClick).toHaveBeenCalledTimes(MAX_AUTO_PAGES)
  })

  it.each([
    ['议题时间线', 'issue-timeline-load-more-load-top'],
    ['全局导航侧栏的常用存储库', 'dynamic-side-panel-items-show-more']
  ])('React 的按钮（%s）：点过一会儿后仍在原处再点', async (_, testId) => {
    vi.useFakeTimers()
    const button = document.createElement('button')
    button.setAttribute('data-testid', testId)
    document.body.append(button)
    const onClick = vi.fn()
    button.addEventListener('click', onClick)
    start()
    near(button)
    near(button)
    expect(onClick).toHaveBeenCalledOnce()
    clock += RECLICK_DELAY_MS
    await vi.advanceTimersByTimeAsync(RECLICK_DELAY_MS)
    near(button)
    expect(onClick).toHaveBeenCalledTimes(2)
  })

  it('功能关闭：不点；刷新后不再监听，再开启后重新监听', () => {
    const button = addButton()
    const onClick = vi.fn()
    button.addEventListener('click', onClick)
    const instance = start()
    active = false
    near(button)
    expect(onClick).not.toHaveBeenCalled()
    instance.refresh()
    expect(watchers.has(button)).toBe(false)
    active = true
    instance.refresh()
    near(button)
    expect(onClick).toHaveBeenCalledOnce()
  })

  it('停止后不再监听，新出现的按钮也不处理', async () => {
    const button = addButton()
    start().stop()
    expect(watchers.size).toBe(0)
    expect(cancelled).toContain(button)
    addButton()
    await flush()
    expect(watchers.size).toBe(0)
  })
})

describe('经典分页', () => {
  beforeEach(() => {
    document.body.innerHTML = releasesPage(['v3.5', 'v3.4', 'v3.3'], 1, '/vuejs/core/releases?page=2')
    pages[`${RELEASES}?page=2`] = releasesPage(['v3.2', 'v3.1'], 2, '/vuejs/core/releases?page=3').replace(
      '<p>Sample text</p>',
      '<p>Sample text</p><script>window.sampleInjected = true</script>'
    )
    pages[`${RELEASES}?page=3`] = releasesPage(['v3.0'], 3)
  })

  it('取回下一页接在列表之后，前面插入页码分隔，分页换成下一页的；直到最后一页', async () => {
    start()
    near(pagination())
    await flush()
    expect(fetchPage).toHaveBeenCalledExactlyOnceWith(`${RELEASES}?page=2`)
    expect(versions()).toEqual(['v3.5', 'v3.4', 'v3.3', 'v3.2', 'v3.1'])
    expect(dividers()).toEqual(['第 2 页'])
    const divider = document.querySelector(`.${PAGE_BREAK_CLASS}`)!
    expect(divider.nextElementSibling?.id).toBe('release-v3.2')
    expect(divider.querySelector('a')?.getAttribute('href')).toBe(`${RELEASES}?page=2`)
    expect(document.querySelector('script')).toBeNull()
    expect(document.querySelectorAll('.paginate-container')).toHaveLength(1)
    expect(pagination()!.querySelector('[aria-current="page"]')?.textContent).toBe('2')
    expect(nextPageLink(pagination()!)?.getAttribute('href')).toBe('/vuejs/core/releases?page=3')

    near(pagination())
    await flush()
    expect(versions()).toEqual(['v3.5', 'v3.4', 'v3.3', 'v3.2', 'v3.1', 'v3.0'])
    expect(dividers()).toEqual(['第 2 页', '第 3 页'])
    // 最后一页：没有下一页，不再监听
    expect(nextPageLink(pagination()!)).toBeUndefined()
    expect(watchers.has(pagination()!)).toBe(false)
    expect(fetchPage).toHaveBeenCalledTimes(2)
  })

  it('取回中再接近视口：不重复取', async () => {
    start()
    const first = pagination()
    near(first)
    near(first)
    await flush()
    expect(fetchPage).toHaveBeenCalledOnce()
  })

  it('已有的项不重复接上', async () => {
    pages[`${RELEASES}?page=2`] = releasesPage(['v3.3', 'v3.2'], 2)
    start()
    near(pagination())
    await flush()
    expect(versions()).toEqual(['v3.5', 'v3.4', 'v3.3', 'v3.2'])
  })

  it('列表上方的分页不监听', () => {
    document.body.insertAdjacentHTML(
      'afterbegin',
      '<div class="paginate-container" id="top"><a class="next_page" href="/vuejs/core/releases?page=2">Next</a></div>'
    )
    start()
    expect(watchers.has(document.getElementById('top')!)).toBe(false)
    expect(watchers.has(pagination()!)).toBe(true)
  })

  it('站外的下一页不取', async () => {
    document.body.innerHTML = releasesPage(['v3.5', 'v3.4', 'v3.3'], 1, 'https://example.com/vuejs/core/releases?page=2')
    start()
    near(pagination())
    await flush()
    expect(fetchPage).not.toHaveBeenCalled()
  })

  it('取回失败：回调，这一列表不再自动取，分页保留', async () => {
    delete pages[`${RELEASES}?page=2`]
    start()
    const container = pagination()
    near(container)
    await flush()
    expect(onError).toHaveBeenCalledOnce()
    expect(versions()).toEqual(['v3.5', 'v3.4', 'v3.3'])
    expect(pagination()).toBe(container)
    near(container)
    await flush()
    expect(fetchPage).toHaveBeenCalledOnce()
  })

  it('下一页没有列表项：不接，分页保留', async () => {
    pages[`${RELEASES}?page=2`] = '<div class="blankslate">Sample text</div>'
    start()
    const container = pagination()
    near(container)
    await flush()
    expect(versions()).toEqual(['v3.5', 'v3.4', 'v3.3'])
    expect(dividers()).toEqual([])
    expect(pagination()).toBe(container)
  })

  it('取回期间列表被换掉（软导航）：丢弃', async () => {
    let release: (html: string) => void = () => {}
    fetchPage.mockImplementationOnce(async () => new Promise<string>(done => (release = done)))
    start()
    near(pagination())
    document.body.innerHTML = releasesPage(['v2.7', 'v2.6', 'v2.5'], 1)
    release(pages[`${RELEASES}?page=2`]!)
    await flush()
    expect(versions()).toEqual(['v2.7', 'v2.6', 'v2.5'])
  })

  it('取回期间关闭了功能：丢弃，再开启后重新取', async () => {
    let release: (html: string) => void = () => {}
    fetchPage.mockImplementationOnce(async () => new Promise<string>(done => (release = done)))
    start()
    near(pagination())
    active = false
    release(pages[`${RELEASES}?page=2`]!)
    await flush()
    expect(versions()).toEqual(['v3.5', 'v3.4', 'v3.3'])
    active = true
    loader!.refresh()
    near(pagination())
    await flush()
    expect(fetchPage).toHaveBeenLastCalledWith(`${RELEASES}?page=2`)
    expect(versions()).toEqual(['v3.5', 'v3.4', 'v3.3', 'v3.2', 'v3.1'])
  })

  it('取回期间停止：丢弃', async () => {
    let release: (html: string) => void = () => {}
    fetchPage.mockImplementationOnce(async () => new Promise<string>(done => (release = done)))
    start()
    near(pagination())
    loader!.stop()
    release(pages[`${RELEASES}?page=2`]!)
    await flush()
    expect(versions()).toEqual(['v3.5', 'v3.4', 'v3.3'])
    expect(watchers.size).toBe(0)
  })

  it('开启时才监听 DOM 变动', () => {
    const observe = vi.spyOn(MutationObserver.prototype, 'observe')
    const disconnect = vi.spyOn(MutationObserver.prototype, 'disconnect')
    active = false
    const instance = start()
    expect(observe).not.toHaveBeenCalled()
    expect(watchers.size).toBe(0)
    active = true
    instance.refresh()
    instance.refresh()
    expect(observe).toHaveBeenCalledOnce()
    expect(watchers.has(pagination()!)).toBe(true)
    active = false
    instance.refresh()
    expect(disconnect).toHaveBeenCalledOnce()
    expect(watchers.size).toBe(0)
  })

  it(`同一页面最多取回 ${MAX_AUTO_PAGES} 页；软导航后重新计数`, async () => {
    for (let page = 2; page <= MAX_AUTO_PAGES + 2; page += 1) {
      pages[`${RELEASES}?page=${page}`] = releasesPage([`p${page}`], page, `/vuejs/core/releases?page=${page + 1}`)
    }
    start()
    for (let round = 0; round < MAX_AUTO_PAGES + 2; round += 1) {
      near(pagination())
      await flush()
    }
    expect(fetchPage).toHaveBeenCalledTimes(MAX_AUTO_PAGES)
    history.replaceState(null, '', '/vuejs/core/releases?q=p')
    loader!.refresh()
    near(pagination())
    await flush()
    expect(fetchPage).toHaveBeenCalledTimes(MAX_AUTO_PAGES + 1)
    expect(fetchPage).toHaveBeenLastCalledWith(`${RELEASES}?page=${MAX_AUTO_PAGES + 2}`)
  })

  it('发行版的侧栏目录一并接上', async () => {
    const toc = (names: readonly string[]): string =>
      `<div class="js-release-toc"><nav-list><ul>${names.map(name => `<li><a href="#${name}">${name}</a></li>`).join('')}</ul></nav-list></div>`
    document.body.insertAdjacentHTML('afterbegin', toc(['v3.5', 'v3.4', 'v3.3']))
    pages[`${RELEASES}?page=2`] = toc(['v3.2', 'v3.1']) + releasesPage(['v3.2', 'v3.1'], 2)
    start()
    near(pagination())
    await flush()
    expect([...document.querySelectorAll('.js-release-toc li')].map(node => node.textContent)).toEqual([
      'v3.5',
      'v3.4',
      'v3.3',
      'v3.2',
      'v3.1'
    ])
  })
})

describe('分页与列表项同在一个容器里、按游标翻页', () => {
  function starsPage(names: readonly string[], previous: string, next?: string): string {
    const items = names.map(name => `<div><h3><a href="/octocat/${name}">${name}</a></h3><p>Sample text</p></div>`).join('')
    const nextButton = next ? `<a class="btn" href="${next}">Next</a>` : '<button class="btn" disabled>Next</button>'
    return `<div id="list">${items}<div class="paginate-container"><div class="BtnGroup"><a class="btn" href="${previous}">Previous</a>${nextButton}</div></div></div>`
  }

  function names(): string[] {
    return [...document.querySelectorAll('#list h3 a')].map(node => node.textContent ?? '')
  }

  it('接在最后一项之后、分页之前，按顺序计页码，一直取到最后一页', async () => {
    history.replaceState(null, '', '/octocat?tab=stars')
    document.body.innerHTML = starsPage(
      ['hello-world', 'spoon-knife', 'linguist'],
      '/octocat?before=c0&tab=stars',
      '/octocat?after=c1&tab=stars'
    )
    pages['https://github.com/octocat?after=c1&tab=stars'] = starsPage(
      ['octocat.github.io', 'git-consortium'],
      '/octocat?before=c1&tab=stars',
      '/octocat?after=c2&tab=stars'
    )
    pages['https://github.com/octocat?after=c2&tab=stars'] = starsPage(['test-repo1'], '/octocat?before=c2&tab=stars')
    start()
    near(pagination())
    await flush()
    near(pagination())
    await flush()
    expect(fetchPage).toHaveBeenCalledTimes(2)
    expect(names()).toEqual(['hello-world', 'spoon-knife', 'linguist', 'octocat.github.io', 'git-consortium', 'test-repo1'])
    expect(dividers()).toEqual(['第 2 页', '第 3 页'])
    expect(document.querySelector('#list')!.lastElementChild!.classList.contains('paginate-container')).toBe(true)
    expect(nextPageLink(pagination()!)).toBeUndefined()
  })
})

describe('React 渲染的列表', () => {
  const REPOS = 'https://github.com/orgs/vuejs/repositories'

  function reposPage(names: readonly string[], page: number, last = false): string {
    const items = names.map(name => `<li><h3><a href="/vuejs/${name}">${name}</a></h3><p>Sample text</p></li>`).join('')
    const next = last ? '<span aria-disabled="true">Next</span>' : `<a rel="next" href="#${page + 1}">Next</a>`
    return (
      `<react-app><div id="root"><ul id="list" class="list__aaaa1">${items}</ul>` +
      // aria-label 已被翻译：按 data-component、类名认分页
      '<nav class="prc-Pagination-PaginationContainer-HEhGo" data-component="Pagination" aria-label="分页">' +
      `<div><a href="#1">1</a><a aria-current="page" href="#${page}">${page}</a>${next}</div></nav></div></react-app>`
    )
  }

  function names(): string[] {
    return [...document.querySelectorAll('#list h3 a')].map(node => node.textContent ?? '')
  }

  beforeEach(() => {
    history.replaceState(null, '', '/orgs/vuejs/repositories')
    document.body.innerHTML = reposPage(['core', 'router', 'pinia'], 1)
    pages[`${REPOS}?page=2`] = reposPage(['docs', 'devtools'], 2)
    pages[`${REPOS}?page=3`] = reposPage(['vitepress'], 3, true)
  })

  it('React 的分页隐藏不移除，换上取回的分页；#页码 链接换成地址', async () => {
    start()
    const reactNav = document.querySelector('nav')!
    near(reactNav)
    await flush()
    expect(fetchPage).toHaveBeenCalledExactlyOnceWith(`${REPOS}?page=2`)
    expect(names()).toEqual(['core', 'router', 'pinia', 'docs', 'devtools'])
    expect(dividers()).toEqual(['第 2 页'])
    expect(reactNav.isConnected).toBe(true)
    expect(reactNav.hasAttribute(HIDDEN_NAV_ATTRIBUTE)).toBe(true)
    expect(reactNav.style.display).toBe('none')
    const ours = document.querySelector(`[${PAGE_NAV_ATTRIBUTE}]`)!
    expect(ours.previousElementSibling).toBe(reactNav)
    expect(ours.querySelector('[aria-current="page"]')?.textContent).toBe('2')
    expect(nextPageLink(ours)?.getAttribute('href')).toBe(`${REPOS}?page=3`)

    near(ours)
    await flush()
    expect(names()).toEqual(['core', 'router', 'pinia', 'docs', 'devtools', 'vitepress'])
    expect(dividers()).toEqual(['第 2 页', '第 3 页'])
    expect(document.querySelectorAll(`[${PAGE_NAV_ATTRIBUTE}]`)).toHaveLength(1)
    expect(document.querySelector(`[${PAGE_NAV_ATTRIBUTE}] [aria-current="page"]`)?.textContent).toBe('3')
  })

  it('列表重新渲染（筛选、软导航）：接上的去掉，React 的分页恢复', async () => {
    start()
    const reactNav = document.querySelector('nav')!
    near(reactNav)
    await flush()
    document.querySelector('#list li')!.remove()
    loader!.refresh()
    expect(names()).toEqual(['router', 'pinia'])
    expect(dividers()).toEqual([])
    expect(document.querySelector(`[${PAGE_NAV_ATTRIBUTE}]`)).toBeNull()
    expect(reactNav.hasAttribute(HIDDEN_NAV_ATTRIBUTE)).toBe(false)
    expect(reactNav.style.display).toBe('')
  })
})
