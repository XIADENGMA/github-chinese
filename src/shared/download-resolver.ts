import {
  accelerateLink,
  acceleratePreferred,
  candidateSources,
  parseAccelerableLink,
  probe,
  PROBE_DEPS,
  PROBE_TIMEOUT_MS,
  probeUrl,
  type AccelerateSource,
  type ProbeDeps,
} from './accelerate'
import type { Settings } from './settings'

/** 探测结果的有效期：可用的 5 分钟内不再探测，不可用的 1 分钟后重试 */
export const HEALTHY_TTL_MS = 5 * 60_000
export const FAILED_TTL_MS = 60_000

export interface DownloadResolver {
  /** 加速后的地址；不加速（未开启、不是下载链接或克隆地址、没有可用的加速源）时返回原地址 */
  resolve(href: string, settings: Settings): Promise<string>
}

interface Health {
  readonly ok: boolean
  readonly expires: number
}

/**
 * 下载链接、克隆地址的选源（后台）。只在支持该地址的加速源中选（见 supportsLink）。
 * 故障转移关闭时用首选加速源（它不支持时用第一个支持的）；开启时先探测：
 * 首选可用就用首选，否则用其余加速源中最先探测成功的，全部不可用时用原地址。
 * 探测结果按站点缓存（见 HEALTHY_TTL_MS），同一站点同时只探测一次
 */
export function createDownloadResolver(deps: ProbeDeps = PROBE_DEPS): DownloadResolver {
  const health = new Map<string, Health>()
  const pending = new Map<string, Promise<boolean>>()

  /** 有效期内的探测结果；没有时为 undefined */
  function known(url: string): boolean | undefined {
    const cached = health.get(url)
    return cached && cached.expires > deps.now() ? cached.ok : undefined
  }

  function check(source: AccelerateSource): Promise<boolean> {
    const url = probeUrl(source.template)
    if (!url) return Promise.resolve(false)
    const cached = known(url)
    if (cached !== undefined) return Promise.resolve(cached)
    const running = pending.get(url)
    if (running) return running
    const task = probe(url, PROBE_TIMEOUT_MS, deps).then(({ ok }) => {
      health.set(url, { ok, expires: deps.now() + (ok ? HEALTHY_TTL_MS : FAILED_TTL_MS) })
      pending.delete(url)
      return ok
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
    const rest = others.map((source) => ({ source, available: check(source) }))
    if (await first) return preferred
    const fallbacks = rest.map(({ source, available }) =>
      available.then((ok) => (ok ? source : Promise.reject(new Error(`加速源不可用：${source.name}`)))),
    )
    return Promise.any(fallbacks).catch(() => undefined)
  }

  return {
    async resolve(href, settings) {
      const link = parseAccelerableLink(href)
      if (!link || !settings.enabled || !settings.accelerate) return href
      if (!settings.failover) return acceleratePreferred(settings, link) ?? href
      const source = await pick(candidateSources(settings, link))
      return (source && accelerateLink(source.template, link)) ?? href
    },
  }
}
