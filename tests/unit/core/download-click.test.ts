// @vitest-environment-options { "url": "https://github.com/vuejs/core/releases" }
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { HealthCache } from '../../../src/core/accelerate-health'
import { createDownloadClickHandler } from '../../../src/core/download-click'
import { isPrivatePage } from '../../../src/core/private-page'
import type { SourceHealth } from '../../../src/shared/accelerate-categories'
import { DEFAULT_SETTINGS, type Settings } from '../../../src/shared/settings'

const RELEASE = 'https://github.com/vuejs/core/releases/download/v3.5.0/vue.global.js'
const RAW = 'https://github.com/vuejs/core/raw/refs/heads/main/README.md'

const GIST_ARCHIVE = 'https://gist.github.com/octocat/0831f3fbd83ac4d46451/archive/c197afe.zip'
/** gh-proxy 分类：cdn 最快，edgeone 不可用，gh-proxy.com 未探测 */
const HEALTH: SourceHealth = { 'gh-proxy-hk': 300, 'gh-proxy-cdn': 80, 'gh-proxy-edgeone': null }

let settings: Settings
/** 有效期内的探测结果 */
let known: SourceHealth | undefined
const get = vi.fn(async (): Promise<SourceHealth> => HEALTH)
const health: HealthCache = { current: () => known, get, clear: () => undefined }
const open = vi.fn()
const handler = createDownloadClickHandler({ settings: () => settings, health, open })

/** 页面上加一个链接，返回它 */
function addLink(href: string, attributes: Readonly<Record<string, string>> = {}): HTMLAnchorElement {
  const anchor = document.createElement('a')
  anchor.href = href
  for (const [name, value] of Object.entries(attributes)) anchor.setAttribute(name, value)
  anchor.append(Object.assign(document.createElement('span'), { textContent: 'vue.global.js' }))
  document.body.append(anchor)
  return anchor
}

/** 点击，返回是否被取消默认行为 */
function click(target: Element, init: MouseEventInit = {}): boolean {
  const event = new MouseEvent('click', { bubbles: true, cancelable: true, composed: true, button: 0, ...init })
  target.dispatchEvent(event)
  return event.defaultPrevented
}

/** 等待异步回调执行 */
async function flushTasks(): Promise<void> {
  await new Promise(done => setTimeout(done, 0))
}

function setVisibility(isPublic: boolean): void {
  document.head.innerHTML = `<meta name="octolytics-dimension-repository_public" content="${isPublic}">`
}

beforeEach(() => {
  settings = { ...DEFAULT_SETTINGS, accelerate: true, replaceCategory: 'ghfast' }
  known = undefined
  window.addEventListener('click', handler, { capture: true })
})

afterEach(() => {
  window.removeEventListener('click', handler, { capture: true })
  get.mockClear()
  open.mockClear()
  document.head.innerHTML = ''
  document.body.innerHTML = ''
})

describe('createDownloadClickHandler', () => {
  it('故障转移关闭：取消跳转，直接打开替换用的分类加速后的地址（点在链接内的元素上）', () => {
    const anchor = addLink(RELEASE)
    expect(click(anchor.firstElementChild!)).toBe(true)
    expect(open).toHaveBeenCalledExactlyOnceWith(`https://ghfast.top/${RELEASE}`, false)
    expect(get).not.toHaveBeenCalled()
  })

  it('相对地址按页面解析', () => {
    expect(click(addLink('/vuejs/core/archive/refs/tags/v3.5.0.zip'))).toBe(true)
    expect(open).toHaveBeenCalledWith('https://ghfast.top/https://github.com/vuejs/core/archive/refs/tags/v3.5.0.zip', false)
  })

  it('原链接在新标签页打开（target="_blank"）：同样开新标签页', () => {
    click(addLink(RELEASE, { target: '_blank' }))
    expect(open).toHaveBeenCalledWith(`https://ghfast.top/${RELEASE}`, true)
  })

  it.each([
    ['未开启下载加速', { accelerate: false }],
    ['总开关关闭', { enabled: false }],
    ['不替换原链接', { replaceCategory: '' }],
    ['替换用的分类已删除', { removedCategories: ['ghfast'] }],
    ['分类中没有加速源', { removedSources: ['ghfast'] }]
  ] as const)('%s：不处理', (_name, overrides) => {
    settings = { ...settings, ...overrides }
    expect(click(addLink(RELEASE))).toBe(false)
    expect(open).not.toHaveBeenCalled()
  })

  it.each([
    ['中键', { button: 1 }],
    ['Ctrl', { ctrlKey: true }],
    ['Meta', { metaKey: true }],
    ['Shift', { shiftKey: true }],
    ['Alt', { altKey: true }]
  ] as const)('%s 点击：不处理', (_name, init) => {
    expect(click(addLink(RELEASE), init)).toBe(false)
    expect(open).not.toHaveBeenCalled()
  })

  it('处理的单击不再传给页面（GitHub 的自述文件不看 defaultPrevented，照样站内跳转）；不处理的照常传', async () => {
    // 不处理的照常传到这里：取消，免得测试环境真的跳转
    const page = vi.fn((event: Event) => event.preventDefault())
    document.addEventListener('click', page)
    try {
      expect(click(addLink(RELEASE))).toBe(true)
      settings = { ...settings, failover: true }
      expect(click(addLink(RELEASE))).toBe(true)
      await flushTasks()
      expect(open).toHaveBeenCalledTimes(2)
      expect(page).not.toHaveBeenCalled()
      click(addLink('https://vuejs.org/'))
      expect(page).toHaveBeenCalledOnce()
    } finally {
      document.removeEventListener('click', page)
    }
  })

  it('页面已取消的点击、不是下载的链接、不在链接上：不处理', () => {
    const anchor = addLink(RELEASE)
    const cancel = (event: Event): void => event.preventDefault()
    // 先于本处理注册的捕获监听取消了点击
    window.removeEventListener('click', handler, { capture: true })
    window.addEventListener('click', cancel, { capture: true })
    window.addEventListener('click', handler, { capture: true })
    click(anchor)
    window.removeEventListener('click', cancel, { capture: true })
    expect(click(addLink('https://github.com/vuejs/core/releases/tag/v3.5.0'))).toBe(false)
    expect(click(document.body)).toBe(false)
    expect(open).not.toHaveBeenCalled()
  })

  it('非公开存储库的页面：不处理；公开存储库照常', () => {
    setVisibility(false)
    expect(isPrivatePage(document)).toBe(true)
    expect(click(addLink(RELEASE))).toBe(false)
    setVisibility(true)
    expect(isPrivatePage(document)).toBe(false)
    expect(click(addLink(RELEASE))).toBe(true)
  })

  it('带 download 属性的 Raw 链接（保存文件）：不处理；Release 附件带 download 照常', () => {
    expect(click(addLink(RAW, { download: 'README.md' }))).toBe(false)
    expect(click(addLink(RAW))).toBe(true)
    expect(click(addLink(RELEASE, { download: '' }))).toBe(true)
    expect(open).toHaveBeenCalledTimes(2)
  })

  it('开放影子树内的链接', () => {
    const host = document.createElement('div')
    document.body.append(host)
    const root = host.attachShadow({ mode: 'open' })
    const anchor = document.createElement('a')
    anchor.href = RELEASE
    root.append(anchor)
    expect(click(anchor)).toBe(true)
    expect(open).toHaveBeenCalledWith(`https://ghfast.top/${RELEASE}`, false)
  })

  it('codeload 链接：换成 github.com 的 archive 再加速', () => {
    click(addLink('https://codeload.github.com/vuejs/core/zip/refs/heads/main'))
    expect(open).toHaveBeenCalledWith('https://ghfast.top/https://github.com/vuejs/core/archive/refs/heads/main.zip', false)
  })

  it('分类中第一个加速源不支持的链接：用分类中下一个支持的', () => {
    settings = {
      ...settings,
      replaceCategory: 'gh-proxy',
      customSources: [{ id: 'custom-1', name: 'Mirror', template: 'https://mirror.example/{url}', category: 'gh-proxy' }]
    }
    expect(click(addLink(GIST_ARCHIVE))).toBe(true)
    expect(open).toHaveBeenCalledWith(`https://mirror.example/${GIST_ARCHIVE}`, false)
  })

  it('分类中没有加速源支持的链接（只有用 {path} 的自定义源，代码片段不在 github.com 上）：不处理', () => {
    settings = {
      ...settings,
      categories: [{ id: 'category-1', name: 'Mirror' }],
      customSources: [{ id: 'custom-1', name: 'Mirror', template: 'https://mirror.example/{path}', category: 'category-1' }],
      replaceCategory: 'category-1'
    }
    expect(click(addLink(GIST_ARCHIVE))).toBe(false)
    expect(click(addLink(RELEASE))).toBe(true)
    expect(open).toHaveBeenCalledExactlyOnceWith('https://mirror.example/vuejs/core/releases/download/v3.5.0/vue.global.js', false)
  })

  describe('故障转移开启', () => {
    beforeEach(() => {
      settings = { ...settings, failover: true, replaceCategory: 'gh-proxy' }
    })

    it('没有探测结果：取消跳转，请后台探测，打开可用的最快的加速后的地址', async () => {
      expect(click(addLink(RELEASE, { target: '_blank' }))).toBe(true)
      expect(get).toHaveBeenCalledOnce()
      expect(open).not.toHaveBeenCalled()
      await flushTasks()
      expect(open).toHaveBeenCalledExactlyOnceWith(`https://cdn.gh-proxy.org/${RELEASE}`, true)
    })

    it('已有探测结果：直接打开，不请后台', () => {
      known = { 'gh-proxy-com': 20, 'gh-proxy-cdn': 80 }
      expect(click(addLink(RELEASE))).toBe(true)
      expect(get).not.toHaveBeenCalled()
      expect(open).toHaveBeenCalledExactlyOnceWith(`https://gh-proxy.com/${RELEASE}`, false)
    })

    it('已有探测结果、分类中都不可用：不处理，照常打开原链接', () => {
      known = { 'gh-proxy-hk': null, 'gh-proxy-cdn': null }
      expect(click(addLink(RELEASE))).toBe(false)
      expect(open).not.toHaveBeenCalled()
    })

    it('探测后都不可用、后台出错：打开原链接', async () => {
      get.mockResolvedValueOnce({ 'gh-proxy-hk': null })
      expect(click(addLink(RELEASE))).toBe(true)
      await flushTasks()
      expect(open).toHaveBeenLastCalledWith(RELEASE, false)
      get.mockRejectedValueOnce(new Error('后台无响应'))
      expect(click(addLink(`${RELEASE}#top`))).toBe(true)
      await flushTasks()
      expect(open).toHaveBeenLastCalledWith(`${RELEASE}#top`, false)
    })

    it('分类中没有加速源支持该链接：不处理，不请后台', () => {
      expect(click(addLink(GIST_ARCHIVE))).toBe(false)
      expect(get).not.toHaveBeenCalled()
    })
  })
})
