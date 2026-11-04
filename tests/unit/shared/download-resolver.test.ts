import { describe, expect, it } from 'vitest'
import { AUTO_SOURCE_ID, BUILTIN_SOURCES, probeUrl, type ProbeDeps } from '../../../src/shared/accelerate'
import { createDownloadResolver, FAILED_TTL_MS, HEALTHY_TTL_MS } from '../../../src/shared/download-resolver'
import { DEFAULT_SETTINGS, type Settings } from '../../../src/shared/settings'

const RELEASE = 'https://github.com/vuejs/core/releases/download/v3.5.0/vue.global.js'

/** 开启加速、故障转移；首选 ghfast，其后按内置列表的顺序 */
const SETTINGS: Settings = { ...DEFAULT_SETTINGS, accelerate: true, failover: true }

type Behavior = 'ok' | 'error' | 'hang'

/** 假探测：按站点决定应答；hang 的请求挂起，release() 后按 ok 应答 */
function fakeNetwork(initial: Readonly<Record<string, Behavior>> = {}) {
  let clock = 0
  const behaviors = new Map(Object.entries(initial))
  const requests: string[] = []
  const hanging: { readonly url: string; readonly resolve: () => void }[] = []
  const deps: ProbeDeps = {
    now: () => clock,
    fetch: url => {
      requests.push(url)
      const behavior = behaviors.get(url) ?? 'ok'
      if (behavior === 'error') return Promise.reject(new TypeError('Failed to fetch'))
      if (behavior === 'hang') return new Promise(resolve => hanging.push({ url, resolve: () => resolve({}) }))
      return Promise.resolve({})
    }
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
      for (const { resolve } of hanging.splice(0)) resolve()
    },
    /** 只放行这个站点挂起的请求 */
    releaseUrl(url: string) {
      for (const item of hanging.filter(entry => entry.url === url)) {
        hanging.splice(hanging.indexOf(item), 1)
        item.resolve()
      }
    }
  }
}

const GHFAST = 'https://ghfast.top/'
const WGET = 'https://wget.la/'
const HK = 'https://hk.gh-proxy.org/'
const CDN = 'https://cdn.gh-proxy.org/'
/** 内置源的探测地址，按列表顺序 */
const PROBES = BUILTIN_SOURCES.map(source => probeUrl(source.template)!)
const BUILTIN_IDS = BUILTIN_SOURCES.map(source => source.id)
/** 支持 gist.github.com 的内置源 */
const GIST_SOURCE_IDS = ['ghfast', 'wget-la', 'gh-monlor', 'hub-ddayh', 'ghproxy-053000']

/** 等探测的回调跑完 */
async function flush(): Promise<void> {
  for (let round = 0; round < 5; round += 1) await Promise.resolve()
}

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
    expect(network.requests).toEqual(PROBES)
    network.advance(HEALTHY_TTL_MS - 1)
    expect(await resolver.resolve(RELEASE, SETTINGS)).toBe(`https://ghfast.top/${RELEASE}`)
    expect(network.requests).toHaveLength(PROBES.length)
    network.advance(1)
    await resolver.resolve(RELEASE, SETTINGS)
    expect(network.requests).toHaveLength(PROBES.length * 2)
  })

  it('首选不可用：换用其余中最先探测成功的', async () => {
    const network = fakeNetwork({ [GHFAST]: 'error', [WGET]: 'hang' })
    const resolver = createDownloadResolver(network.deps)
    expect(await resolver.resolve(RELEASE, SETTINGS)).toBe(`https://hk.gh-proxy.org/${RELEASE}`)
    network.release()
  })

  it('全部不可用：返回原链接', async () => {
    const network = fakeNetwork(Object.fromEntries(PROBES.map(url => [url, 'error'])))
    const resolver = createDownloadResolver(network.deps)
    expect(await resolver.resolve(RELEASE, SETTINGS)).toBe(RELEASE)
  })

  it('没有加速源：返回原链接', async () => {
    const network = fakeNetwork()
    const resolver = createDownloadResolver(network.deps)
    const settings = { ...SETTINGS, removedSources: BUILTIN_IDS }
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
    expect(network.requests.filter(url => url === GHFAST)).toHaveLength(1)
    network.advance(1)
    expect(await resolver.resolve(RELEASE, SETTINGS)).toBe(`https://ghfast.top/${RELEASE}`)
  })

  it('同一站点同时只探测一次', async () => {
    const network = fakeNetwork({ [GHFAST]: 'hang' })
    const resolver = createDownloadResolver(network.deps)
    const tasks = [resolver.resolve(RELEASE, SETTINGS), resolver.resolve(RELEASE, SETTINGS)]
    network.release()
    expect(await Promise.all(tasks)).toEqual([`https://ghfast.top/${RELEASE}`, `https://ghfast.top/${RELEASE}`])
    expect(network.requests.filter(url => url === GHFAST)).toHaveLength(1)
  })

  it('自定义首选：按其模板加速', async () => {
    const network = fakeNetwork()
    const resolver = createDownloadResolver(network.deps)
    const settings: Settings = {
      ...SETTINGS,
      accelerateSource: 'custom-1',
      customSources: [{ id: 'custom-1', name: 'Mirror', template: 'https://mirror.example/{path}' }]
    }
    expect(await resolver.resolve(RELEASE, settings)).toBe('https://mirror.example/vuejs/core/releases/download/v3.5.0/vue.global.js')
    expect(network.requests[0]).toBe('https://mirror.example/')
  })

  it('克隆地址：同下载链接选源', async () => {
    const network = fakeNetwork({ [GHFAST]: 'error' })
    const resolver = createDownloadResolver(network.deps)
    const clone = 'https://github.com/vuejs/core.git'
    expect(await resolver.resolve(clone, SETTINGS)).toBe(`https://wget.la/${clone}`)
    expect(await resolver.resolve(clone, { ...SETTINGS, failover: false })).toBe(`https://ghfast.top/${clone}`)
  })

  it('只在支持该地址的加速源中选：gh-proxy 系列不支持 gist.github.com，不探测它们', async () => {
    const network = fakeNetwork({ [GHFAST]: 'error' })
    const resolver = createDownloadResolver(network.deps)
    const gist = 'https://gist.github.com/0831f3fbd83ac4d46451.git'
    expect(await resolver.resolve(gist, SETTINGS)).toBe(`https://wget.la/${gist}`)
    for (const url of [HK, CDN, 'https://edgeone.gh-proxy.org/', 'https://gh-proxy.com/']) {
      expect(network.requests).not.toContain(url)
    }
    // 故障转移关闭、首选不支持：用列表中第一个支持的
    expect(await resolver.resolve(gist, { ...SETTINGS, failover: false, accelerateSource: 'gh-proxy-hk' })).toBe(
      `https://ghfast.top/${gist}`
    )
  })

  it('没有支持该地址的加速源：返回原地址', async () => {
    const network = fakeNetwork()
    const resolver = createDownloadResolver(network.deps)
    const gist = 'https://gist.github.com/0831f3fbd83ac4d46451.git'
    const settings: Settings = { ...SETTINGS, removedSources: GIST_SOURCE_IDS }
    expect(await resolver.resolve(gist, settings)).toBe(gist)
    expect(await resolver.resolve(gist, { ...settings, failover: false })).toBe(gist)
    expect(network.requests).toEqual([])
  })

  describe('自动选择', () => {
    const AUTO: Settings = { ...SETTINGS, failover: false, accelerateSource: AUTO_SOURCE_ID }

    it('不看故障转移开关：全部探测，用最先连通的', async () => {
      const network = fakeNetwork({ [GHFAST]: 'hang', [WGET]: 'error' })
      const resolver = createDownloadResolver(network.deps)
      expect(await resolver.resolve(RELEASE, AUTO)).toBe(`https://hk.gh-proxy.org/${RELEASE}`)
      expect(network.requests).toEqual(PROBES)
      network.release()
    })

    it('有效期内用已知耗时最短的，不再探测', async () => {
      const network = fakeNetwork(Object.fromEntries(PROBES.map(url => [url, 'hang'])))
      const resolver = createDownloadResolver(network.deps)
      const first = resolver.resolve(RELEASE, AUTO)
      network.advance(50)
      network.releaseUrl(CDN)
      await flush()
      network.advance(50)
      network.release()
      expect(await first).toBe(`https://cdn.gh-proxy.org/${RELEASE}`)
      await flush()
      expect(await resolver.resolve(RELEASE, AUTO)).toBe(`https://cdn.gh-proxy.org/${RELEASE}`)
      expect(network.requests).toHaveLength(PROBES.length)
    })

    it('都不可用：返回原链接', async () => {
      const network = fakeNetwork(Object.fromEntries(PROBES.map(url => [url, 'error'])))
      const resolver = createDownloadResolver(network.deps)
      expect(await resolver.resolve(RELEASE, AUTO)).toBe(RELEASE)
    })

    it('只在支持该地址的加速源中选', async () => {
      const network = fakeNetwork()
      const resolver = createDownloadResolver(network.deps)
      const gist = 'https://gist.github.com/0831f3fbd83ac4d46451.git'
      expect(await resolver.resolve(gist, AUTO)).toBe(`https://ghfast.top/${gist}`)
      expect(network.requests).not.toContain(HK)
    })
  })

  it('rank：可用的按耗时在前，未探测的其次，不可用的在后，同档保持原顺序；不发请求', async () => {
    const network = fakeNetwork({ [GHFAST]: 'error', [WGET]: 'hang', [HK]: 'hang' })
    const resolver = createDownloadResolver(network.deps)
    const task = resolver.resolve(RELEASE, { ...SETTINGS, accelerateSource: AUTO_SOURCE_ID })
    await flush()
    network.advance(80)
    network.releaseUrl(HK)
    await flush()
    network.advance(20)
    network.releaseUrl(WGET)
    await task
    await flush()
    const requests = network.requests.length
    const order = resolver.rank(BUILTIN_SOURCES).map(source => source.id)
    // 其余内置源立即连通（耗时 0），排在最前
    expect(order.slice(0, -3)).toEqual(BUILTIN_IDS.filter(id => !['ghfast', 'wget-la', 'gh-proxy-hk'].includes(id)))
    expect(order.slice(-3)).toEqual(['gh-proxy-hk', 'wget-la', 'ghfast'])
    const fresh = createDownloadResolver(fakeNetwork().deps)
    expect(fresh.rank(BUILTIN_SOURCES)).toEqual(BUILTIN_SOURCES)
    expect(network.requests).toHaveLength(requests)
  })
})
