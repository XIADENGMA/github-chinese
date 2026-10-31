import { afterEach, describe, expect, it, vi } from 'vitest'
import { fetchImage, IMAGE_TIMEOUT_MS, MAX_IMAGE_BYTES, type ImageFetchDeps } from '../../../src/shared/image-fetcher'
import { DEFAULT_SETTINGS, type Settings } from '../../../src/shared/settings'

const AVATAR = 'https://avatars.githubusercontent.com/u/583231?v=4'
const RAW = 'https://raw.githubusercontent.com/vuejs/core/main/logo.png'
/** 开启图片加速；首选 ghfast（不支持头像），其后依次为 wget.la（不支持头像）、hk.gh-proxy.org、cdn.gh-proxy.org */
const SETTINGS: Settings = { ...DEFAULT_SETTINGS, accelerateImages: true }
const PNG = new Uint8Array([0x89, 0x50, 0x4e, 0x47])

type Reply = Response | 'error' | 'hang'

/** 假请求：按加速后的地址应答；没有配置的地址应答 404 */
function fakeFetch(replies: Readonly<Record<string, Reply>>): ImageFetchDeps & { calls: [string, RequestInit][] } {
  const calls: [string, RequestInit][] = []
  return {
    calls,
    fetch: (url, init) => {
      calls.push([url, init])
      const reply = replies[url] ?? new Response('', { status: 404 })
      if (reply === 'error') return Promise.reject(new TypeError('Failed to fetch'))
      if (reply === 'hang') {
        return new Promise((_, reject) => {
          init.signal?.addEventListener('abort', () => reject(new DOMException('aborted', 'AbortError')))
        })
      }
      return Promise.resolve(reply)
    },
  }
}

function image(
  type = 'image/png',
  body: Uint8Array<ArrayBuffer> = PNG,
  headers: Record<string, string> = {},
): Response {
  return new Response(body, { status: 200, headers: { 'content-type': type, ...headers } })
}

afterEach(() => {
  vi.useRealTimers()
})

describe('fetchImage', () => {
  it('未开启、总开关关闭、不是可加速的图片：不请求', async () => {
    const deps = fakeFetch({})
    expect(await fetchImage(AVATAR, { ...SETTINGS, accelerateImages: false }, deps)).toBeUndefined()
    expect(await fetchImage(AVATAR, { ...SETTINGS, enabled: false }, deps)).toBeUndefined()
    expect(await fetchImage('https://camo.githubusercontent.com/abc/def', SETTINGS, deps)).toBeUndefined()
    expect(deps.calls).toEqual([])
  })

  it('故障转移关闭：只试第一个支持的加速源（头像跳过 ghfast、wget.la）；返回 data: 地址，不带 Cookie 与来源页', async () => {
    const deps = fakeFetch({ [`https://hk.gh-proxy.org/${AVATAR}`]: image('image/png; charset=binary') })
    expect(await fetchImage(AVATAR, SETTINGS, deps)).toBe('data:image/png;base64,iVBORw==')
    expect(deps.calls).toHaveLength(1)
    expect(deps.calls[0]![1]).toMatchObject({ credentials: 'omit', referrerPolicy: 'no-referrer' })
    expect(deps.calls[0]![1].signal).toBeInstanceOf(AbortSignal)
  })

  it('故障转移关闭、第一个取不到：不再试其他', async () => {
    const deps = fakeFetch({ [`https://cdn.gh-proxy.org/${AVATAR}`]: image() })
    expect(await fetchImage(AVATAR, SETTINGS, deps)).toBeUndefined()
    expect(deps.calls).toHaveLength(1)
  })

  it('故障转移开启：依次尝试，跳过出错、应答失败、不是图片的', async () => {
    const deps = fakeFetch({
      [`https://ghfast.top/${RAW}`]: 'error',
      [`https://wget.la/${RAW}`]: new Response('<html></html>', {
        status: 200,
        headers: { 'content-type': 'text/html' },
      }),
      [`https://cdn.gh-proxy.org/${RAW}`]: image('image/svg+xml'),
    })
    expect(await fetchImage(RAW, { ...SETTINGS, failover: true }, deps)).toBe('data:image/svg+xml;base64,iVBORw==')
    expect(deps.calls.map(([url]) => new URL(url).hostname)).toEqual([
      'ghfast.top',
      'wget.la',
      'hk.gh-proxy.org',
      'cdn.gh-proxy.org',
    ])
  })

  it.each([
    ['声明的大小超出上限', image('image/png', PNG, { 'content-length': String(MAX_IMAGE_BYTES + 1) })],
    ['实际大小超出上限', image('image/png', new Uint8Array(MAX_IMAGE_BYTES + 1))],
    ['类型不能放进 data: 地址', image('image/png,evil')],
  ])('%s：不用', async (_name, reply) => {
    const deps = fakeFetch({ [`https://ghfast.top/${RAW}`]: reply })
    expect(await fetchImage(RAW, SETTINGS, deps)).toBeUndefined()
  })

  it('大图片分段编码', async () => {
    const big = new Uint8Array(0x8000 * 2 + 3).fill(0xff)
    const deps = fakeFetch({ [`https://ghfast.top/${RAW}`]: image('image/png', big) })
    const dataUrl = await fetchImage(RAW, SETTINGS, deps)
    expect(dataUrl).toBe(`data:image/png;base64,${Buffer.from(big).toString('base64')}`)
  })

  it('超时：中止请求，换下一个', async () => {
    vi.useFakeTimers()
    const deps = fakeFetch({ [`https://ghfast.top/${RAW}`]: 'hang', [`https://wget.la/${RAW}`]: image() })
    const task = fetchImage(RAW, { ...SETTINGS, failover: true }, deps)
    await vi.advanceTimersByTimeAsync(IMAGE_TIMEOUT_MS)
    expect(await task).toBe('data:image/png;base64,iVBORw==')
    expect(deps.calls[0]![1].signal?.aborted).toBe(true)
  })
})
