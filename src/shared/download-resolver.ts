import {
  accelerateLink,
  acceleratePreferred,
  candidateSources,
  isAutoSource,
  needsProbe,
  parseAccelerableLink,
  probe,
  PROBE_DEPS,
  PROBE_TIMEOUT_MS,
  probeUrl,
  type AccelerateSource,
  type ProbeDeps
} from './accelerate'
import type { Settings } from './settings'

/** 探测结果的有效期：可用的 5 分钟内不再探测，不可用的 1 分钟后重试 */
export const HEALTHY_TTL_MS = 5 * 60_000
export const FAILED_TTL_MS = 60_000

export interface DownloadResolver {
  /** 加速后的地址；不加速（未开启、不是下载链接或克隆地址、没有可用的加速源）时返回原地址 */
  resolve(href: string, settings: Settings): Promise<string>
  /**
   * 按已知的探测结果排序（不发请求）：可用的按耗时在前，未探测的其次，不可用的在后；同档保持原顺序。
   * 自动选择时图片按这个顺序依次尝试
   */
  rank(sources: readonly AccelerateSource[]): readonly AccelerateSource[]
}

interface Health {
  readonly ok: boolean
  /** 探测耗时（毫秒），可用时才有 */
  readonly ms?: number
  readonly expires: number
}

/**
 * 下载链接、克隆地址的选源（后台）。只在支持该地址的加速源中选（见 supportsLink）。
 * 故障转移关闭时用首选加速源（它不支持时用第一个支持的）；开启时先探测：
 * 首选可用就用首选，否则用其余加速源中最先探测成功的，全部不可用时用原地址。
 * 首选为自动选择时：有效期内有探测成功的就用其中耗时最短的，没有时全部探测，用最先成功的。
 * 探测结果按站点缓存（见 HEALTHY_TTL_MS），同一站点同时只探测一次
 */
export function createDownloadResolver(deps: ProbeDeps = PROBE_DEPS): DownloadResolver {
  const health = new Map<string, Health>()
  const pending = new Map<string, Promise<boolean>>()

  /** 有效期内的探测结果；没有时为 undefined */
  function knownHealth(url: string | undefined): Health | undefined {
    const cached = url === undefined ? undefined : health.get(url)
    return cached && cached.expires > deps.now() ? cached : undefined
  }

  function known(url: string): boolean | undefined {
    return knownHealth(url)?.ok
  }

  function check(source: AccelerateSource): Promise<boolean> {
    const url = probeUrl(source.template)
    if (!url) return Promise.resolve(false)
    const cached = known(url)
    if (cached !== undefined) return Promise.resolve(cached)
    const running = pending.get(url)
    if (running) return running
    const task = probe(url, PROBE_TIMEOUT_MS, deps).then(result => {
      const expires = deps.now() + (result.ok ? HEALTHY_TTL_MS : FAILED_TTL_MS)
      health.set(url, result.ok ? { ok: true, ms: result.ms, expires } : { ok: false, expires })
      pending.delete(url)
      return result.ok
    })
    pending.set(url, task)
    return task
  }

  async function pick(sources: readonly AccelerateSource[]): Promise<AccelerateSource | undefined> {
    const [preferred, ...others] = sources
    if (!preferred) return undefined
    const url = probeUrl(preferred.template)
    if (url && known(url) === true) return preferred
    // 首选要探测（或已知不可用）时其余一并探测：首选不可用时不用再从头等
    const first = check(preferred)
    const rest = others.map(source => ({ source, available: check(source) }))
    if (await first) return preferred
    return firstAvailable(rest)
  }

  /** 最先探测成功的；都不可用时为 undefined */
  function firstAvailable(
    probes: readonly { readonly source: AccelerateSource; readonly available: Promise<boolean> }[]
  ): Promise<AccelerateSource | undefined> {
    const fallbacks = probes.map(({ source, available }) =>
      available.then(ok => (ok ? source : Promise.reject(new Error(`加速源不可用：${source.name}`))))
    )
    return Promise.any(fallbacks).catch(() => undefined)
  }

  /** 有效期内探测成功的加速源中耗时最短的；没有时为 undefined */
  function fastestKnown(sources: readonly AccelerateSource[]): AccelerateSource | undefined {
    let best: { readonly source: AccelerateSource; readonly ms: number } | undefined
    for (const source of sources) {
      const cached = knownHealth(probeUrl(source.template))
      if (cached?.ok && cached.ms !== undefined && (!best || cached.ms < best.ms)) best = { source, ms: cached.ms }
    }
    return best?.source
  }

  /** 自动选择：已知最快的，没有时全部探测（已知不可用的跳过），用最先成功的 */
  function pickFastest(sources: readonly AccelerateSource[]): Promise<AccelerateSource | undefined> {
    const fastest = fastestKnown(sources)
    if (fastest) return Promise.resolve(fastest)
    return firstAvailable(sources.map(source => ({ source, available: check(source) })))
  }

  function rank(sources: readonly AccelerateSource[]): readonly AccelerateSource[] {
    const tier = (source: AccelerateSource): readonly [number, number] => {
      const cached = knownHealth(probeUrl(source.template))
      if (!cached) return [1, 0]
      return cached.ok ? [0, cached.ms ?? 0] : [2, 0]
    }
    return sources
      .map((source, index) => ({ source, index, tier: tier(source) }))
      .sort((a, b) => a.tier[0] - b.tier[0] || a.tier[1] - b.tier[1] || a.index - b.index)
      .map(({ source }) => source)
  }

  return {
    async resolve(href, settings) {
      const link = parseAccelerableLink(href)
      if (!link || !settings.enabled || !settings.accelerate) return href
      if (!needsProbe(settings)) return acceleratePreferred(settings, link) ?? href
      const candidates = candidateSources(settings, link)
      const source = await (isAutoSource(settings) ? pickFastest(candidates) : pick(candidates))
      return (source && accelerateLink(source.template, link)) ?? href
    },
    rank
  }
}
