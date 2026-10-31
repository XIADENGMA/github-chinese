import { describe, expect, it } from 'vitest'
import type { ProbeDeps } from '../../../src/shared/accelerate'
import { createDownloadResolver, FAILED_TTL_MS, HEALTHY_TTL_MS } from '../../../src/shared/download-resolver'
import { DEFAULT_SETTINGS, type Settings } from '../../../src/shared/settings'

const RELEASE = 'https://github.com/vuejs/core/releases/download/v3.5.0/vue.global.js'

/** 开启加速、故障转移；首选 ghfast，其后依次为 wget.la、hk.gh-proxy.org、cdn.gh-proxy.org */
const SETTINGS: Settings = { ...DEFAULT_SETTINGS, accelerate: true, failover: true }

type Behavior = 'ok' | 'error' | 'hang'

/** 假探测：按站点决定应答；hang 的请求挂起，release() 后按 ok 应答 */
function fakeNetwork(initial: Readonly<Record<string, Behavior>> = {}) {
  let clock = 0
  const behaviors = new Map(Object.entries(initial))
  const requests: string[] = []
  const hanging: (() => void)[] = []
  const deps: ProbeDeps = {
    now: () => clock,
    fetch: (url) => {
      requests.push(url)
      const behavior = behaviors.get(url) ?? 'ok'
      if (behavior === 'error') return Promise.reject(new TypeError('Failed to fetch'))
      if (behavior === 'hang') return new Promise((resolve) => hanging.push(() => resolve({})))
      return Promise.resolve({})
    },
  }
  return {
    deps,
    requests,
    set(url: string, behavior: Behavior) {
      behaviors.set(url, behavior)
    },
    advance(ms: number) {
      clock += ms
    },
    release() {
      for (const resolve of hanging.splice(0)) resolve()
    },
  }
}

const GHFAST = 'https://ghfast.top/'
const WGET = 'https://wget.la/'
const HK = 'https://hk.gh-proxy.org/'
const CDN = 'https://cdn.gh-proxy.org/'

describe('createDownloadResolver', () => {
  it('未开启、总开关关闭、不是下载链接：原样返回，不探测', async () => {
    const network = fakeNetwork()
    const resolver = createDownloadResolver(network.deps)
    expect(await resolver.resolve(RELEASE, { ...SETTINGS, accelerate: false })).toBe(RELEASE)
    expect(await resolver.resolve(RELEASE, { ...SETTINGS, enabled: false })).toBe(RELEASE)
    expect(await resolver.resolve('https://github.com/vuejs/core', SETTINGS)).toBe('https://github.com/vuejs/core')
    expect(network.requests).toEqual([])
  })

  it('故障转移关闭：直接用首选，不探测', async () => {
    const network = fakeNetwork()
    const resolver = createDownloadResolver(network.deps)
    const settings = { ...SETTINGS, failover: false, accelerateSource: 'wget-la' }
    expect(await resolver.resolve(RELEASE, settings)).toBe(`https://wget.la/${RELEASE}`)
    expect(network.requests).toEqual([])
  })

  it('首选可用：用首选；有效期内不再探测', async () => {
    const network = fakeNetwork()
    const resolver = createDownloadResolver(network.deps)
    expect(await resolver.resolve(RELEASE, SETTINGS)).toBe(`https://ghfast.top/${RELEASE}`)
    // 首选要探测时其余一并探测
    expect(network.requests).toEqual([GHFAST, WGET, HK, CDN])
    network.advance(HEALTHY_TTL_MS - 1)
    expect(await resolver.resolve(RELEASE, SETTINGS)).toBe(`https://ghfast.top/${RELEASE}`)
    expect(network.requests).toHaveLength(4)
    network.advance(1)
    await resolver.resolve(RELEASE, SETTINGS)
    expect(network.requests).toHaveLength(8)
  })

  it('首选不可用：换用其余中最先探测成功的', async () => {
    const network = fakeNetwork({ [GHFAST]: 'error', [WGET]: 'hang' })
    const resolver = createDownloadResolver(network.deps)
    expect(await resolver.resolve(RELEASE, SETTINGS)).toBe(`https://hk.gh-proxy.org/${RELEASE}`)
    network.release()
  })

  it('全部不可用：返回原链接', async () => {
    const network = fakeNetwork({ [GHFAST]: 'error', [WGET]: 'error', [HK]: 'error', [CDN]: 'error' })
    const resolver = createDownloadResolver(network.deps)
    expect(await resolver.resolve(RELEASE, SETTINGS)).toBe(RELEASE)
  })

  it('没有加速源：返回原链接', async () => {
    const network = fakeNetwork()
    const resolver = createDownloadResolver(network.deps)
    const settings = { ...SETTINGS, removedSources: ['ghfast', 'wget-la', 'gh-proxy-hk', 'gh-proxy-cdn'] }
    expect(await resolver.resolve(RELEASE, settings)).toBe(RELEASE)
    expect(network.requests).toEqual([])
  })

  it('不可用的结果 1 分钟内沿用：期间不再探测首选；之后重试，恢复了就换回首选', async () => {
    const network = fakeNetwork({ [GHFAST]: 'error' })
    const resolver = createDownloadResolver(network.deps)
    expect(await resolver.resolve(RELEASE, SETTINGS)).toBe(`https://wget.la/${RELEASE}`)
    network.set(GHFAST, 'ok')
    network.advance(FAILED_TTL_MS - 1)
    expect(await resolver.resolve(RELEASE, SETTINGS)).toBe(`https://wget.la/${RELEASE}`)
    expect(network.requests.filter((url) => url === GHFAST)).toHaveLength(1)
    network.advance(1)
    expect(await resolver.resolve(RELEASE, SETTINGS)).toBe(`https://ghfast.top/${RELEASE}`)
  })

  it('同一站点同时只探测一次', async () => {
    const network = fakeNetwork({ [GHFAST]: 'hang' })
    const resolver = createDownloadResolver(network.deps)
    const tasks = [resolver.resolve(RELEASE, SETTINGS), resolver.resolve(RELEASE, SETTINGS)]
    network.release()
    expect(await Promise.all(tasks)).toEqual([`https://ghfast.top/${RELEASE}`, `https://ghfast.top/${RELEASE}`])
    expect(network.requests.filter((url) => url === GHFAST)).toHaveLength(1)
  })

  it('自定义首选：按其模板加速', async () => {
    const network = fakeNetwork()
    const resolver = createDownloadResolver(network.deps)
    const settings: Settings = {
      ...SETTINGS,
      accelerateSource: 'custom-1',
      customSources: [{ id: 'custom-1', name: 'Mirror', template: 'https://mirror.example/{path}' }],
    }
    expect(await resolver.resolve(RELEASE, settings)).toBe(
      'https://mirror.example/vuejs/core/releases/download/v3.5.0/vue.global.js',
    )
    expect(network.requests[0]).toBe('https://mirror.example/')
  })

  it('克隆地址：同下载链接选源', async () => {
    const network = fakeNetwork({ [GHFAST]: 'error' })
    const resolver = createDownloadResolver(network.deps)
    const clone = 'https://github.com/vuejs/core.git'
    expect(await resolver.resolve(clone, SETTINGS)).toBe(`https://wget.la/${clone}`)
    expect(await resolver.resolve(clone, { ...SETTINGS, failover: false })).toBe(`https://ghfast.top/${clone}`)
  })

  it('只在支持该地址的加速源中选：gh-proxy.org 不支持 gist.github.com，不探测它们', async () => {
    const network = fakeNetwork({ [GHFAST]: 'error' })
    const resolver = createDownloadResolver(network.deps)
    const gist = 'https://gist.github.com/0831f3fbd83ac4d46451.git'
    expect(await resolver.resolve(gist, SETTINGS)).toBe(`https://wget.la/${gist}`)
    expect(network.requests).not.toContain(HK)
    expect(network.requests).not.toContain(CDN)
    // 故障转移关闭、首选不支持：用列表中第一个支持的
    expect(await resolver.resolve(gist, { ...SETTINGS, failover: false, accelerateSource: 'gh-proxy-hk' })).toBe(
      `https://ghfast.top/${gist}`,
    )
  })

  it('没有支持该地址的加速源：返回原地址', async () => {
    const network = fakeNetwork()
    const resolver = createDownloadResolver(network.deps)
    const gist = 'https://gist.github.com/0831f3fbd83ac4d46451.git'
    const settings: Settings = { ...SETTINGS, removedSources: ['ghfast', 'wget-la'] }
    expect(await resolver.resolve(gist, settings)).toBe(gist)
    expect(await resolver.resolve(gist, { ...settings, failover: false })).toBe(gist)
    expect(network.requests).toEqual([])
  })
})
