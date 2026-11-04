import type { SourceHealth } from '../shared/accelerate-categories'

/** 内容脚本记住探测结果的时长：后台另有缓存（见 shared/source-health），这里只省去反复发消息 */
export const HEALTH_CACHE_MS = 60_000

/** 本页的加速源探测结果（故障转移开启时由后台探测） */
export interface HealthCache {
  /** 有效期内的结果；没有时为 undefined */
  current(): SourceHealth | undefined
  /** 有效期内直接返回，否则请后台探测（同时只请求一次）；后台出错、超时时拒绝 */
  get(): Promise<SourceHealth>
  /** 丢弃记住的结果（设置变化：加速源可能增删） */
  clear(): void
}

export function createHealthCache(request: () => Promise<SourceHealth>, now: () => number = Date.now): HealthCache {
  let cached: { readonly health: SourceHealth; readonly expires: number } | undefined
  let pending: Promise<SourceHealth> | undefined
  /** 每次丢弃后加一：丢弃前发出的请求，结果不再记住 */
  let generation = 0

  function current(): SourceHealth | undefined {
    return cached && cached.expires > now() ? cached.health : undefined
  }

  return {
    current,
    get() {
      const known = current()
      if (known) return Promise.resolve(known)
      if (pending) return pending
      const started = generation
      const task = request().then(
        health => {
          if (started === generation) {
            cached = { health, expires: now() + HEALTH_CACHE_MS }
            pending = undefined
          }
          return health
        },
        (error: unknown) => {
          if (started === generation) pending = undefined
          throw error
        }
      )
      pending = task
      return task
    },
    clear() {
      generation += 1
      cached = undefined
      pending = undefined
    }
  }
}
