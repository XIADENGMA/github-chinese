import { storage } from 'wxt/utils/storage'
import { probe, PROBE_DEPS, PROBE_TIMEOUT_MS, probeUrl, type AccelerateSource, type ProbeDeps } from './accelerate'
import type { SourceHealth } from './accelerate-categories'

/** 探测结果的有效期：可用的 5 分钟内不再探测，不可用的 1 分钟后重试 */
export const HEALTHY_TTL_MS = 5 * 60_000
export const FAILED_TTL_MS = 60_000

export interface SourceHealthMonitor {
  /**
   * 探测各加速源，返回 标识 → 耗时（可用）或 null（不可用）。
   * 结果按站点缓存（见 HEALTHY_TTL_MS），有效期内不再探测；同一站点同时只探测一次
   */
  check(sources: readonly AccelerateSource[]): Promise<SourceHealth>
  /**
   * 按已知的探测结果排序（不发请求）：可用的按耗时在前，未探测的其次，不可用的在后；同档保持原顺序。
   * 故障转移开启时图片按这个顺序依次尝试
   */
  rank(sources: readonly AccelerateSource[]): readonly AccelerateSource[]
}

/** 一个站点的探测结果 */
export interface StoredHealth {
  readonly ok: boolean
  /** 探测耗时（毫秒），可用时才有 */
  readonly ms?: number
  /** 有效期截止时间（毫秒时间戳） */
  readonly expires: number
}

/** 探测结果的保存：站点根路径 → 结果（后台 Service Worker 闲置后被终止，内存中的结果随之丢失） */
export interface HealthStore {
  load(): Promise<unknown>
  save(entries: Readonly<Record<string, StoredHealth>>): Promise<void>
}

/** 存在会话存储里：浏览器关闭时清除；Service Worker 重启后有效期内的结果照用，页面上的加速选项不必等重新探测 */
const sessionHealthItem = /* @__PURE__ */ storage.defineItem<Readonly<Record<string, StoredHealth>>>('session:sourceHealth', {
  fallback: {}
})

export const SESSION_HEALTH_STORE: HealthStore = {
  load: async () => sessionHealthItem.getValue(),
  save: async entries => sessionHealthItem.setValue(entries)
}

function isStoredHealth(value: unknown): value is StoredHealth {
  if (typeof value !== 'object' || value === null) return false
  const item = value as Record<string, unknown>
  return (
    typeof item.ok === 'boolean' &&
    typeof item.expires === 'number' &&
    Number.isFinite(item.expires) &&
    (item.ms === undefined || (typeof item.ms === 'number' && Number.isFinite(item.ms) && item.ms >= 0))
  )
}

/** 读取保存的结果：丢弃格式不对的项 */
function restoreEntries(value: unknown): [string, StoredHealth][] {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return []
  return Object.entries(value).filter((entry): entry is [string, StoredHealth] => isStoredHealth(entry[1]))
}

/**
 * 加速源的探测（后台）：探测请求见 shared/accelerate 的 probe（HEAD、no-cors，不带 Cookie 与来源页）。
 * 传入 store 时，探测前先读回保存的结果，探测后保存有效期内的结果
 */
export function createSourceHealthMonitor(deps: ProbeDeps = PROBE_DEPS, store?: HealthStore): SourceHealthMonitor {
  const health = new Map<string, StoredHealth>()
  const pending = new Map<string, Promise<StoredHealth>>()
  /** 有新的探测结果未保存 */
  let dirty = false
  const restored = store
    ? store.load().then(
        value => {
          for (const [url, item] of restoreEntries(value)) if (!health.has(url)) health.set(url, item)
        },
        () => undefined
      )
    : Promise.resolve()

  function save(): void {
    if (!store || !dirty) return
    dirty = false
    const now = deps.now()
    const entries = Object.fromEntries([...health].filter(([, item]) => item.expires > now))
    store.save(entries).catch(() => undefined)
  }

  /** 有效期内的探测结果；没有时为 undefined */
  function known(url: string | undefined): StoredHealth | undefined {
    const cached = url === undefined ? undefined : health.get(url)
    return cached && cached.expires > deps.now() ? cached : undefined
  }

  function checkUrl(url: string): Promise<StoredHealth> {
    const cached = known(url)
    if (cached) return Promise.resolve(cached)
    const running = pending.get(url)
    if (running) return running
    const task = probe(url, PROBE_TIMEOUT_MS, deps).then(result => {
      const expires = deps.now() + (result.ok ? HEALTHY_TTL_MS : FAILED_TTL_MS)
      const next: StoredHealth = result.ok ? { ok: true, ms: result.ms, expires } : { ok: false, expires }
      health.set(url, next)
      pending.delete(url)
      dirty = true
      return next
    })
    pending.set(url, task)
    return task
  }

  return {
    async check(sources) {
      await restored
      const entries = await Promise.all(
        sources.map(async source => {
          const url = probeUrl(source.template)
          const result = url ? await checkUrl(url) : undefined
          return [source.id, result?.ok ? (result.ms ?? 0) : null] as const
        })
      )
      save()
      return Object.fromEntries(entries)
    },
    rank(sources) {
      const tier = (source: AccelerateSource): readonly [number, number] => {
        const cached = known(probeUrl(source.template))
        if (!cached) return [1, 0]
        return cached.ok ? [0, cached.ms ?? 0] : [2, 0]
      }
      return sources
        .map((source, index) => ({ source, index, tier: tier(source) }))
        .sort((a, b) => a.tier[0] - b.tier[0] || a.tier[1] - b.tier[1] || a.index - b.index)
        .map(({ source }) => source)
    }
  }
}
