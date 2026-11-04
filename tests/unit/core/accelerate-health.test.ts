import { describe, expect, it, vi } from 'vitest'
import { createHealthCache, HEALTH_CACHE_MS } from '../../../src/core/accelerate-health'
import type { SourceHealth } from '../../../src/shared/accelerate-categories'

/** 可控的请求：resolve、reject 结束最近一次请求 */
function deferredRequest(): {
  readonly request: () => Promise<SourceHealth>
  readonly calls: () => number
  resolve(health: SourceHealth): void
  reject(error: Error): void
} {
  const pending: { resolve: (health: SourceHealth) => void; reject: (error: Error) => void }[] = []
  return {
    request: () => new Promise<SourceHealth>((resolve, reject) => pending.push({ resolve, reject })),
    calls: () => pending.length,
    resolve: health => pending.at(-1)?.resolve(health),
    reject: error => pending.at(-1)?.reject(error)
  }
}

describe('createHealthCache', () => {
  it('同时只请求一次；有效期内直接返回，过期后再请求', async () => {
    let time = 0
    const source = deferredRequest()
    const cache = createHealthCache(source.request, () => time)
    expect(cache.current()).toBeUndefined()
    const first = cache.get()
    const second = cache.get()
    expect(source.calls()).toBe(1)
    source.resolve({ ghfast: 120 })
    expect(await first).toEqual({ ghfast: 120 })
    expect(await second).toEqual({ ghfast: 120 })
    expect(cache.current()).toEqual({ ghfast: 120 })
    time = HEALTH_CACHE_MS - 1
    expect(await cache.get()).toEqual({ ghfast: 120 })
    expect(source.calls()).toBe(1)
    time = HEALTH_CACHE_MS
    expect(cache.current()).toBeUndefined()
    void cache.get()
    expect(source.calls()).toBe(2)
  })

  it('请求失败：拒绝，不记住；下次再请求', async () => {
    const source = deferredRequest()
    const cache = createHealthCache(source.request, () => 0)
    const task = cache.get()
    source.reject(new Error('后台无响应'))
    await expect(task).rejects.toThrow('后台无响应')
    expect(cache.current()).toBeUndefined()
    void cache.get()
    expect(source.calls()).toBe(2)
  })

  it('丢弃：之前发出的请求结果不再记住，再取时重新请求', async () => {
    const source = deferredRequest()
    const cache = createHealthCache(source.request, () => 0)
    const stale = cache.get()
    cache.clear()
    const fresh = cache.get()
    expect(source.calls()).toBe(2)
    source.resolve({ ghfast: 80 })
    await fresh
    expect(cache.current()).toEqual({ ghfast: 80 })
    // 丢弃前的请求迟到：不覆盖
    const request = vi.fn()
    void stale.then(request)
    expect(cache.current()).toEqual({ ghfast: 80 })
  })
})
