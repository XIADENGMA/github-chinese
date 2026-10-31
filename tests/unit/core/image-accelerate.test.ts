// @vitest-environment-options { "url": "https://github.com/vuejs/core" }
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createImageAccelerator, type ImageAccelerator } from '../../../src/core/image-accelerate'
import { DEFAULT_SETTINGS, type Settings } from '../../../src/shared/settings'

const AVATAR = 'https://avatars.githubusercontent.com/u/583231?s=40&v=4'
const LOGO = 'https://github.com/vuejs/core/raw/main/logo.png'
const DATA = 'data:image/png;base64,iVBORw=='

let settings: Settings
let accelerator: ImageAccelerator
const fetchImage = vi.fn(async (url: string): Promise<string> => `${DATA}#${url}`)

async function flush(): Promise<void> {
  await new Promise((done) => setTimeout(done, 0))
}

function addImage(src: string, attributes: Readonly<Record<string, string>> = {}): HTMLImageElement {
  const img = document.createElement('img')
  for (const [name, value] of Object.entries(attributes)) img.setAttribute(name, value)
  img.setAttribute('src', src)
  document.body.append(img)
  return img
}

/** 图片加载失败：派发不冒泡的 error 事件，window 的捕获监听收到 */
function fail(img: HTMLImageElement): void {
  img.dispatchEvent(new Event('error'))
}

beforeEach(() => {
  settings = { ...DEFAULT_SETTINGS, accelerateImages: true }
  accelerator = createImageAccelerator({ settings: () => settings, fetchImage })
  window.addEventListener('error', accelerator.onError, { capture: true })
})

afterEach(() => {
  window.removeEventListener('error', accelerator.onError, { capture: true })
  fetchImage.mockReset()
  fetchImage.mockImplementation(async (url) => `${DATA}#${url}`)
  document.head.innerHTML = ''
  document.body.innerHTML = ''
})

describe('createImageAccelerator', () => {
  it('GitHub 的图片加载失败：请后台取回，换上 data: 地址', async () => {
    const img = addImage(AVATAR)
    fail(img)
    expect(fetchImage).toHaveBeenCalledExactlyOnceWith(AVATAR)
    await flush()
    expect(img.getAttribute('src')).toBe(`${DATA}#${AVATAR}`)
  })

  it('README 中的相对路径图片：按解析后的地址取回', async () => {
    const img = addImage('/vuejs/core/blob/main/logo.png?raw=true')
    fail(img)
    expect(fetchImage).toHaveBeenCalledExactlyOnceWith(LOGO)
    await flush()
    expect(img.getAttribute('src')).toBe(`${DATA}#${LOGO}`)
  })

  it.each([
    ['未开启图片加速', { accelerateImages: false }],
    ['总开关关闭', { enabled: false }],
  ] as const)('%s：不处理', (_name, overrides) => {
    settings = { ...settings, ...overrides }
    fail(addImage(AVATAR))
    expect(fetchImage).not.toHaveBeenCalled()
  })

  it('不经加速源的图片（外部图片的代理、其他网站、已是 data:）、私有存储库页面中的图片：不处理', () => {
    fail(addImage('https://camo.githubusercontent.com/abc/def'))
    fail(addImage('https://example.com/logo.png'))
    fail(addImage(DATA))
    document.head.innerHTML = '<meta name="octolytics-dimension-repository_public" content="false">'
    fail(addImage(AVATAR))
    expect(fetchImage).not.toHaveBeenCalled()
  })

  it('同一地址只取一次：页面上几处同样的头像一起换上；取不到的也不再请求', async () => {
    const first = addImage(AVATAR)
    const second = addImage(AVATAR)
    fail(first)
    fail(second)
    await flush()
    expect(fetchImage).toHaveBeenCalledTimes(1)
    expect(second.getAttribute('src')).toBe(first.getAttribute('src'))
    fetchImage.mockRejectedValueOnce(new Error('取不到'))
    const broken = addImage(LOGO)
    fail(broken)
    await flush()
    fail(addImage(LOGO))
    await flush()
    expect(fetchImage).toHaveBeenCalledTimes(2)
    expect(broken.getAttribute('src')).toBe(LOGO)
  })

  it('取回期间页面换了图：不动', async () => {
    const img = addImage(AVATAR)
    fail(img)
    img.setAttribute('src', 'https://avatars.githubusercontent.com/u/1?v=4')
    await flush()
    expect(img.getAttribute('src')).toBe('https://avatars.githubusercontent.com/u/1?v=4')
  })

  it('srcset 与 <picture> 的 <source> 中的同一地址（相对路径按页面解析）一并换掉，其他候选不动', async () => {
    document.body.innerHTML = `<picture>
      <source media="(prefers-color-scheme: dark)" srcset="/vuejs/core/raw/main/logo.png 1x, https://example.com/dark.png 2x">
      <img src="${LOGO}" srcset="${LOGO} 1x, https://example.com/big.png 2x">
    </picture>`
    const img = document.querySelector('img')!
    fail(img)
    await flush()
    const data = `${DATA}#${LOGO}`
    expect(document.querySelector('source')!.getAttribute('srcset')).toBe(`${data} 1x, https://example.com/dark.png 2x`)
    expect(img.getAttribute('srcset')).toBe(`${data} 1x, https://example.com/big.png 2x`)
    expect(img.getAttribute('src')).toBe(data)
  })

  it('同时最多请求 4 张，其余排队', async () => {
    const pending: (() => void)[] = []
    fetchImage.mockImplementation((url) => new Promise((resolve) => pending.push(() => resolve(`${DATA}#${url}`))))
    for (let index = 0; index < 6; index += 1) fail(addImage(`https://avatars.githubusercontent.com/u/${index}?v=4`))
    expect(fetchImage).toHaveBeenCalledTimes(4)
    pending.shift()!()
    await flush()
    expect(fetchImage).toHaveBeenCalledTimes(5)
    while (pending.length > 0) {
      pending.shift()!()
      await flush()
    }
    expect(fetchImage).toHaveBeenCalledTimes(6)
    expect([...document.querySelectorAll('img')].every((img) => img.getAttribute('src')!.startsWith(DATA))).toBe(true)
  })

  it('开启时处理已加载失败的图片；加载成功的、还没加载完的不处理', async () => {
    const broken = addImage(AVATAR)
    const loaded = addImage(LOGO)
    const loading = addImage('https://avatars.githubusercontent.com/u/2?v=4')
    const state = (img: HTMLImageElement, complete: boolean, width: number): void => {
      Object.defineProperty(img, 'complete', { value: complete, configurable: true })
      Object.defineProperty(img, 'naturalWidth', { value: width, configurable: true })
      Object.defineProperty(img, 'naturalHeight', { value: width, configurable: true })
    }
    state(broken, true, 0)
    state(loaded, true, 40)
    state(loading, false, 0)
    accelerator.retryFailed(document)
    expect(fetchImage).toHaveBeenCalledExactlyOnceWith(AVATAR)
    await flush()
    expect(broken.getAttribute('src')).toBe(`${DATA}#${AVATAR}`)
  })

  it('不是图片的 error 事件：不处理', () => {
    accelerator.onError(new Event('error'))
    const script = document.createElement('script')
    document.body.append(script)
    script.dispatchEvent(new Event('error'))
    expect(fetchImage).not.toHaveBeenCalled()
  })
})
