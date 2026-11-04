// @vitest-environment-options { "url": "https://github.com/vuejs/core/releases" }
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createDownloadClickHandler } from '../../../src/core/download-click'
import { isPrivatePage } from '../../../src/core/private-page'
import { AUTO_SOURCE_ID, BUILTIN_SOURCES } from '../../../src/shared/accelerate'
import { DEFAULT_SETTINGS, type Settings } from '../../../src/shared/settings'

const RELEASE = 'https://github.com/vuejs/core/releases/download/v3.5.0/vue.global.js'
const RAW = 'https://github.com/vuejs/core/raw/refs/heads/main/README.md'

let settings: Settings
const resolve = vi.fn(async (url: string): Promise<string> => `https://resolved.example/${url}`)
const open = vi.fn()
const handler = createDownloadClickHandler({ settings: () => settings, resolve, open })

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
  settings = { ...DEFAULT_SETTINGS, accelerate: true }
  window.addEventListener('click', handler, { capture: true })
})

afterEach(() => {
  window.removeEventListener('click', handler, { capture: true })
  resolve.mockClear()
  open.mockClear()
  document.head.innerHTML = ''
  document.body.innerHTML = ''
})

describe('createDownloadClickHandler', () => {
  it('故障转移关闭：取消跳转，直接打开首选加速源的地址（点在链接内的元素上）', () => {
    const anchor = addLink(RELEASE)
    expect(click(anchor.firstElementChild!)).toBe(true)
    expect(open).toHaveBeenCalledExactlyOnceWith(`https://ghfast.top/${RELEASE}`, false)
    expect(resolve).not.toHaveBeenCalled()
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
    ['没有加速源', { removedSources: BUILTIN_SOURCES.map(source => source.id) }]
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

  it('首选加速源不支持的链接（gh-proxy.org 与 Gist 压缩包）：改用列表中第一个支持的', () => {
    settings = { ...settings, accelerateSource: 'gh-proxy-hk' }
    const gist = 'https://gist.github.com/octocat/0831f3fbd83ac4d46451/archive/c197afe.zip'
    expect(click(addLink(gist))).toBe(true)
    expect(open).toHaveBeenCalledWith(`https://ghfast.top/${gist}`, false)
  })

  it('没有加速源支持的链接（只剩用 {path} 的自定义源，Gist 不在 github.com 上）：不处理', () => {
    settings = {
      ...settings,
      removedSources: BUILTIN_SOURCES.map(source => source.id),
      customSources: [{ id: 'custom-1', name: 'Mirror', template: 'https://mirror.example/{path}' }]
    }
    expect(click(addLink('https://gist.github.com/octocat/0831f3fbd83ac4d46451/archive/c197afe.zip'))).toBe(false)
    expect(click(addLink(RELEASE))).toBe(true)
    expect(open).toHaveBeenCalledExactlyOnceWith(`https://mirror.example/vuejs/core/releases/download/v3.5.0/vue.global.js`, false)
  })

  describe('故障转移开启', () => {
    beforeEach(() => {
      settings = { ...settings, failover: true }
    })

    it('取消跳转，请后台选源，打开应答的地址', async () => {
      expect(click(addLink(RELEASE, { target: '_blank' }))).toBe(true)
      expect(resolve).toHaveBeenCalledExactlyOnceWith(RELEASE)
      await flushTasks()
      expect(open).toHaveBeenCalledExactlyOnceWith(`https://resolved.example/${RELEASE}`, true)
    })

    it('后台出错、超时：打开原链接', async () => {
      resolve.mockRejectedValueOnce(new Error('后台无响应'))
      expect(click(addLink(`${RELEASE}#top`))).toBe(true)
      await flushTasks()
      expect(open).toHaveBeenCalledExactlyOnceWith(`${RELEASE}#top`, false)
    })

    it('没有加速源支持该链接：不处理，不请后台', () => {
      settings = { ...settings, removedSources: ['ghfast', 'wget-la', 'gh-monlor', 'hub-ddayh', 'ghproxy-053000'] }
      expect(click(addLink('https://gist.github.com/octocat/0831f3fbd83ac4d46451/archive/c197afe.zip'))).toBe(false)
      expect(resolve).not.toHaveBeenCalled()
    })
  })

  it('首选为自动选择：故障转移关闭也请后台选源', async () => {
    settings = { ...settings, failover: false, accelerateSource: AUTO_SOURCE_ID }
    expect(click(addLink(RELEASE))).toBe(true)
    expect(resolve).toHaveBeenCalledExactlyOnceWith(RELEASE)
    await flushTasks()
    expect(open).toHaveBeenCalledExactlyOnceWith(`https://resolved.example/${RELEASE}`, false)
  })
})
