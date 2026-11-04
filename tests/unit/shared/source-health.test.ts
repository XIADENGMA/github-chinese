import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { AccelerateSource, ProbeDeps } from '../../../src/shared/accelerate'
import type { SourceHealth } from '../../../src/shared/accelerate-categories'
import {
  createSourceHealthMonitor,
  FAILED_TTL_MS,
  HEALTHY_TTL_MS,
  type HealthStore,
  type SourceHealthMonitor,
  type StoredHealth
} from '../../../src/shared/source-health'

const FAST: AccelerateSource = { id: 'fast', name: 'fast', template: 'https://fast.example/{url}' }
const SLOW: AccelerateSource = { id: 'slow', name: 'slow', template: 'https://slow.example/{url}' }
const DOWN: AccelerateSource = { id: 'down', name: 'down', template: 'https://down.example/{url}' }
/** 与 FAST 同一站点 */
const FAST_PATH: AccelerateSource = { id: 'fast-path', name: 'fast path', template: 'https://fast.example/gh/{path}' }
const INVALID: AccelerateSource = { id: 'invalid', name: 'invalid', template: 'not a url' }

/** 假探测：fast 40 毫秒、slow 300 毫秒后应答，down 网络出错（计时用假时钟） */
function fakeDeps(): ProbeDeps & { readonly fetch: ReturnType<typeof vi.fn> } {
  return {
    now: () => Date.now(),
    fetch: vi.fn((url: string) => {
      if (url === 'https://down.example/') return Promise.reject(new TypeError('Failed to fetch'))
      return new Promise(resolve => setTimeout(() => resolve({}), url === 'https://slow.example/' ? 300 : 40))
    })
  }
}

/** 探测并让假请求全部应答 */
async function check(monitor: SourceHealthMonitor, sources: readonly AccelerateSource[]): Promise<SourceHealth> {
  const task = monitor.check(sources)
  await vi.advanceTimersByTimeAsync(300)
  return task
}

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

describe('createSourceHealthMonitor', () => {
  it('探测各加速源的站点根路径：可用为耗时，不可用、模板无效为 null；同一站点只探测一次', async () => {
    const deps = fakeDeps()
    const monitor = createSourceHealthMonitor(deps)
    const health = await check(monitor, [FAST, SLOW, DOWN, FAST_PATH, INVALID])
    expect(health).toEqual({ fast: 40, slow: 300, down: null, 'fast-path': 40, invalid: null })
    expect(deps.fetch.mock.calls.map(([url]) => url)).toEqual(['https://fast.example/', 'https://slow.example/', 'https://down.example/'])
    expect(deps.fetch.mock.calls[0]![1]).toMatchObject({ method: 'HEAD', mode: 'no-cors', credentials: 'omit' })
  })

  it('有效期：可用的 5 分钟、不可用的 1 分钟内不再探测', async () => {
    const deps = fakeDeps()
    const monitor = createSourceHealthMonitor(deps)
    await check(monitor, [FAST, DOWN])
    deps.fetch.mockClear()
    vi.advanceTimersByTime(FAILED_TTL_MS - 1000)
    await check(monitor, [FAST, DOWN])
    expect(deps.fetch).not.toHaveBeenCalled()
    vi.advanceTimersByTime(1000)
    await check(monitor, [FAST, DOWN])
    expect(deps.fetch.mock.calls.map(([url]) => url)).toEqual(['https://down.example/'])
    deps.fetch.mockClear()
    vi.advanceTimersByTime(HEALTHY_TTL_MS)
    await check(monitor, [FAST])
    expect(deps.fetch.mock.calls.map(([url]) => url)).toEqual(['https://fast.example/'])
  })

  it('同时探测同一站点：只发一次请求', async () => {
    const deps = fakeDeps()
    const monitor = createSourceHealthMonitor(deps)
    const both = Promise.all([monitor.check([FAST]), monitor.check([FAST_PATH])])
    await vi.advanceTimersByTimeAsync(300)
    const [first, second] = await both
    expect(deps.fetch).toHaveBeenCalledOnce()
    expect(second['fast-path']).toBe(first.fast)
  })

  it('排序：可用的按耗时在前，未探测的其次，不可用的在后；同档保持原顺序', async () => {
    const monitor = createSourceHealthMonitor(fakeDeps())
    const unknown: AccelerateSource = { id: 'unknown', name: 'unknown', template: 'https://unknown.example/{url}' }
    expect(monitor.rank([SLOW, unknown, FAST])).toEqual([SLOW, unknown, FAST])
    await check(monitor, [SLOW, DOWN, FAST])
    expect(monitor.rank([DOWN, SLOW, unknown, FAST, INVALID])).toEqual([FAST, SLOW, unknown, INVALID, DOWN])
  })

  describe('保存探测结果', () => {
    /** 内存中的保存：记录每次保存的内容 */
    function memoryStore(initial: unknown): HealthStore & { readonly saved: Record<string, StoredHealth>[] } {
      const saved: Record<string, StoredHealth>[] = []
      return {
        saved,
        load: vi.fn(async () => initial),
        save: vi.fn(async (entries: Readonly<Record<string, StoredHealth>>) => {
          saved.push({ ...entries })
        })
      }
    }

    it('探测前读回保存的结果：有效期内的照用，不再探测；过期的重新探测', async () => {
      const deps = fakeDeps()
      const store = memoryStore({
        'https://fast.example/': { ok: true, ms: 40, expires: Date.now() + 1000 },
        'https://slow.example/': { ok: true, ms: 300, expires: Date.now() - 1 }
      })
      const monitor = createSourceHealthMonitor(deps, store)
      expect(await check(monitor, [FAST, SLOW])).toEqual({ fast: 40, slow: 300 })
      expect(deps.fetch.mock.calls.map(([url]) => url)).toEqual(['https://slow.example/'])
    })

    it('探测后保存有效期内的结果；没有新的探测结果时不保存', async () => {
      const deps = fakeDeps()
      const store = memoryStore({})
      const monitor = createSourceHealthMonitor(deps, store)
      const start = Date.now()
      await check(monitor, [FAST, DOWN])
      expect(store.saved).toEqual([
        {
          'https://fast.example/': { ok: true, ms: 40, expires: start + 40 + HEALTHY_TTL_MS },
          'https://down.example/': { ok: false, expires: start + FAILED_TTL_MS }
        }
      ])
      await check(monitor, [FAST])
      expect(store.saved).toHaveLength(1)
      vi.advanceTimersByTime(FAILED_TTL_MS)
      await check(monitor, [DOWN])
      expect(Object.keys(store.saved.at(-1)!).sort()).toEqual(['https://down.example/', 'https://fast.example/'])
    })

    it.each([
      [
        '格式不对的项',
        { 'https://fast.example/': { ok: 'yes', expires: 1 }, 'https://slow.example/': { ok: true, ms: -1, expires: Date.now() + 1000 } }
      ],
      ['不是对象', ['https://fast.example/']],
      ['没有保存过', undefined]
    ])('保存的内容%s：丢弃，照常探测', async (_name, initial) => {
      const deps = fakeDeps()
      const monitor = createSourceHealthMonitor(deps, memoryStore(initial))
      expect(await check(monitor, [FAST, SLOW])).toEqual({ fast: 40, slow: 300 })
      expect(deps.fetch).toHaveBeenCalledTimes(2)
    })

    it('读取、保存失败：照常探测，结果不受影响', async () => {
      const deps = fakeDeps()
      const store: HealthStore = {
        load: () => Promise.reject(new Error('不支持')),
        save: () => Promise.reject(new Error('不支持'))
      }
      const monitor = createSourceHealthMonitor(deps, store)
      expect(await check(monitor, [FAST])).toEqual({ fast: 40 })
    })
  })
})
