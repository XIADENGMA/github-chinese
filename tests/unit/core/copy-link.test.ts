// @vitest-environment-options { "url": "https://github.com/vuejs/core/releases" }
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  COPY_BUTTON_ATTRIBUTE,
  COPY_FEEDBACK_MS,
  createCopyLinkButtons,
  type CopyLinkButtons,
  type CopyState
} from '../../../src/core/copy-link'
import { AUTO_SOURCE_ID, BUILTIN_SOURCES } from '../../../src/shared/accelerate'
import { DEFAULT_SETTINGS, type Settings } from '../../../src/shared/settings'

const ASSET = 'https://github.com/vuejs/core/releases/download/v3.5.0/vue.global.js'
const ZIP = 'https://github.com/vuejs/core/archive/refs/tags/v3.5.0.zip'
const TAG = 'https://github.com/vuejs/core/releases/tag/v3.5.0'

/** 附件列表：附件、源码包、版本页链接各一行；列表外一个附件链接 */
const PAGE = `
<ul>
  <li class="Box-row"><a id="asset" href="${ASSET}">vue.global.js</a><span>Sample text</span></li>
  <li class="Box-row"><a id="zip" href="${ZIP}">Source code (zip)</a></li>
  <li class="Box-row"><a id="tag" href="${TAG}">v3.5.0</a></li>
</ul>
<p><a id="outside" href="${ASSET}">vue.global.js</a></p>`

let settings: Settings
const resolve = vi.fn(async (url: string): Promise<string> => `https://resolved.example/${url}`)
const copy = vi.fn(async (): Promise<void> => {})
const label = (state: CopyState): string => `label:${state}`
let buttons: CopyLinkButtons | undefined

function start(): CopyLinkButtons {
  buttons = createCopyLinkButtons(document, { settings: () => settings, resolve, copy, label })
  return buttons
}

function buttonAfter(id: string): HTMLButtonElement | null {
  const next = document.getElementById(id)?.nextElementSibling
  return next?.hasAttribute(COPY_BUTTON_ATTRIBUTE) ? (next as HTMLButtonElement) : null
}

function allButtons(): HTMLButtonElement[] {
  return [...document.querySelectorAll<HTMLButtonElement>(`[${COPY_BUTTON_ATTRIBUTE}]`)]
}

function styleCount(): number {
  return document.querySelectorAll('#gcn-copy-link-style').length
}

/** 等 DOM 变动的扫描、复制的回调跑完 */
async function flush(): Promise<void> {
  for (let round = 0; round < 10; round += 1) await Promise.resolve()
}

function setVisibility(isPublic: boolean): void {
  document.head.innerHTML = `<meta name="octolytics-dimension-repository_public" content="${isPublic}">`
}

beforeEach(() => {
  settings = { ...DEFAULT_SETTINGS, accelerate: true }
  setVisibility(true)
  document.body.innerHTML = PAGE
})

afterEach(() => {
  buttons?.stop()
  buttons = undefined
  vi.useRealTimers()
  resolve.mockClear()
  copy.mockClear()
  document.head.innerHTML = ''
  document.body.innerHTML = ''
})

describe('添加与移除', () => {
  it('附件、源码包链接后各加一个按钮；样式只加一次', () => {
    start()
    expect(buttonAfter('asset')).not.toBeNull()
    expect(buttonAfter('zip')).not.toBeNull()
    expect(buttonAfter('tag')).toBeNull()
    expect(buttonAfter('outside')).toBeNull()
    expect(allButtons()).toHaveLength(2)
    expect(styleCount()).toBe(1)
    const button = buttonAfter('asset')!
    expect(button.type).toBe('button')
    expect(button.getAttribute('translate')).toBe('no')
    expect(button.dataset.state).toBe('idle')
    expect(button.getAttribute('aria-label')).toBe('label:idle')
    expect(button.title).toBe('label:idle')
    expect(button.querySelector('svg')).not.toBeNull()
  })

  it.each<[string, Partial<Settings>]>([
    ['插件关闭', { enabled: false }],
    ['下载加速关闭', { accelerate: false }]
  ])('%s：不加', (_, patch) => {
    settings = { ...settings, ...patch }
    start()
    expect(allButtons()).toHaveLength(0)
    expect(styleCount()).toBe(0)
  })

  it('不公开的页面：不加', () => {
    setVisibility(false)
    start()
    expect(allButtons()).toHaveLength(0)
  })

  it('设置变化后刷新：关闭时移除按钮与样式，开启时加回', () => {
    const instance = start()
    settings = { ...settings, accelerate: false }
    instance.refresh()
    expect(allButtons()).toHaveLength(0)
    expect(styleCount()).toBe(0)
    settings = { ...settings, accelerate: true }
    instance.refresh()
    expect(allButtons()).toHaveLength(2)
    expect(styleCount()).toBe(1)
  })

  it('后来出现的附件也加；链接移除后不再记着；按钮被页面移走时补回', async () => {
    start()
    document
      .querySelector('ul')!
      .insertAdjacentHTML('beforeend', `<li class="Box-row"><a id="late" href="${ASSET}.map">vue.global.js.map</a></li>`)
    await flush()
    expect(buttonAfter('late')).not.toBeNull()
    document.getElementById('zip')!.closest('li')!.remove()
    buttonAfter('asset')!.remove()
    await flush()
    expect(buttonAfter('asset')).not.toBeNull()
    expect(allButtons()).toHaveLength(2)
  })

  it('开启时才监听 DOM 变动', () => {
    const observe = vi.spyOn(MutationObserver.prototype, 'observe')
    const disconnect = vi.spyOn(MutationObserver.prototype, 'disconnect')
    settings = { ...settings, accelerate: false }
    const instance = start()
    expect(observe).not.toHaveBeenCalled()
    settings = { ...settings, accelerate: true }
    instance.refresh()
    instance.refresh()
    expect(observe).toHaveBeenCalledOnce()
    settings = { ...settings, enabled: false }
    instance.refresh()
    expect(disconnect).toHaveBeenCalledOnce()
    vi.restoreAllMocks()
  })

  it('不公开的页面照常监听：软导航到公开页面后加上', async () => {
    setVisibility(false)
    start()
    expect(allButtons()).toHaveLength(0)
    setVisibility(true)
    document.body.innerHTML = PAGE
    await flush()
    expect(allButtons()).toHaveLength(2)
  })

  it('停止：移除按钮与样式，不再添加', async () => {
    start().stop()
    expect(allButtons()).toHaveLength(0)
    expect(styleCount()).toBe(0)
    document.querySelector('ul')!.insertAdjacentHTML('beforeend', `<li class="Box-row"><a href="${ASSET}.map">vue.global.js.map</a></li>`)
    await flush()
    expect(allButtons()).toHaveLength(0)
  })
})

describe('复制', () => {
  it('不用探测：复制首选加速源的地址，显示已复制，2 秒后恢复；点击不交给页面', async () => {
    vi.useFakeTimers()
    const pageListener = vi.fn()
    document.addEventListener('click', pageListener)
    start()
    const button = buttonAfter('asset')!
    button.click()
    await flush()
    expect(copy).toHaveBeenCalledExactlyOnceWith(`https://ghfast.top/${ASSET}`)
    expect(resolve).not.toHaveBeenCalled()
    expect(button.dataset.state).toBe('copied')
    expect(button.getAttribute('aria-label')).toBe('label:copied')
    expect(pageListener).not.toHaveBeenCalled()
    vi.advanceTimersByTime(COPY_FEEDBACK_MS - 1)
    expect(button.dataset.state).toBe('copied')
    vi.advanceTimersByTime(1)
    expect(button.dataset.state).toBe('idle')
    expect(button.getAttribute('aria-label')).toBe('label:idle')
    document.removeEventListener('click', pageListener)
  })

  it.each<[string, Partial<Settings>]>([
    ['故障转移开启', { failover: true }],
    ['首选为自动选择', { failover: false, accelerateSource: AUTO_SOURCE_ID }]
  ])('%s：请后台选源，复制选出的地址', async (_, patch) => {
    settings = { ...settings, ...patch }
    start()
    buttonAfter('zip')!.click()
    await flush()
    expect(resolve).toHaveBeenCalledExactlyOnceWith(ZIP)
    expect(copy).toHaveBeenCalledExactlyOnceWith(`https://resolved.example/${ZIP}`)
  })

  it('选源失败、剪贴板不可用：显示复制失败', async () => {
    settings = { ...settings, failover: true }
    start()
    resolve.mockRejectedValueOnce(new Error('timeout'))
    const button = buttonAfter('asset')!
    button.click()
    await flush()
    expect(copy).not.toHaveBeenCalled()
    expect(button.dataset.state).toBe('failed')
    expect(button.getAttribute('aria-label')).toBe('label:failed')
    copy.mockRejectedValueOnce(new Error('denied'))
    button.click()
    await flush()
    expect(button.dataset.state).toBe('failed')
  })

  it('没有加速源支持：显示复制失败，不写剪贴板', async () => {
    settings = { ...settings, removedSources: BUILTIN_SOURCES.map(source => source.id) }
    start()
    const button = buttonAfter('asset')!
    button.click()
    await flush()
    expect(copy).not.toHaveBeenCalled()
    expect(button.dataset.state).toBe('failed')
  })

  it('连点：提示从最后一次起保留 2 秒', async () => {
    vi.useFakeTimers()
    start()
    const button = buttonAfter('asset')!
    button.click()
    await flush()
    vi.advanceTimersByTime(COPY_FEEDBACK_MS - 500)
    button.click()
    await flush()
    vi.advanceTimersByTime(1000)
    expect(button.dataset.state).toBe('copied')
    vi.advanceTimersByTime(COPY_FEEDBACK_MS)
    expect(button.dataset.state).toBe('idle')
  })

  it('功能已关闭（尚未刷新）：点击不处理', async () => {
    start()
    settings = { ...settings, accelerate: false }
    buttonAfter('asset')!.click()
    await flush()
    expect(copy).not.toHaveBeenCalled()
  })
})
