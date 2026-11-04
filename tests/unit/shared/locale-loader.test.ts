import { afterEach, describe, expect, it, vi } from 'vitest'
import type { LocaleBundle } from '../../../src/core/types'
import { BUILD_ID } from '../../../src/shared/build-id'
import {
  createLocaleLoader,
  LOCALE_SCRIPT_FILES,
  registerLocale,
  takeLocale,
  waitForRegistration,
  type LocaleLoaderDeps
} from '../../../src/shared/locale-loader'

const CN: LocaleBundle = [['common', { static: { Code: '代码' } }]]
const TW: LocaleBundle = [['common', { static: { Code: '程式碼' } }]]

/** 模拟词典脚本：导入时登记语言包 */
function deps(overrides: Partial<LocaleLoaderDeps> = {}): LocaleLoaderDeps {
  return {
    resolveUrl: path => `chrome-extension://sample${path}`,
    importScript: vi.fn(async (url: string) => {
      registerLocale(url.includes('zh-tw') ? 'zh-TW' : 'zh-CN', url.includes('zh-tw') ? TW : CN)
    }),
    requestInjection: vi.fn(async () => false),
    ...overrides
  }
}

/** 全局对象上的登记（语言 → 构建标识） */
function registrations(): Record<string, string | undefined> {
  const registry = (globalThis as unknown as Record<string, Record<string, { build: string }> | undefined>)['__githubChineseLocales']
  return Object.fromEntries(Object.entries(registry ?? {}).map(([locale, entry]) => [locale, entry.build]))
}

/** 清掉测试留下的登记 */
function clearRegistrations(): void {
  takeLocale('zh-CN')
  takeLocale('zh-TW')
}

afterEach(() => {
  vi.restoreAllMocks()
  clearRegistrations()
})

describe('createLocaleLoader', () => {
  it('没有登记时动态导入对应语言的词典脚本，地址带构建标识', async () => {
    const options = deps()
    const loader = createLocaleLoader(options)
    expect(await loader.load('zh-TW')).toBe(TW)
    const [url] = vi.mocked(options.importScript!).mock.calls[0]!
    expect(url).toBe(`chrome-extension://sample/locale-zh-tw.js?build=${BUILD_ID}`)
    // 已取走：全局对象上不留登记
    expect(takeLocale('zh-TW')).toBeUndefined()
  })

  it('同一语言只加载一次', async () => {
    const options = deps()
    const loader = createLocaleLoader(options)
    await Promise.all([loader.load('zh-CN'), loader.load('zh-CN')])
    await loader.load('zh-CN')
    expect(options.importScript).toHaveBeenCalledTimes(1)
  })

  it('注册的词典脚本已登记（页面开始解析前执行）：直接取用，不导入', async () => {
    registerLocale('zh-CN', CN)
    const options = deps()
    expect(await createLocaleLoader(options).load('zh-CN')).toBe(CN)
    expect(options.importScript).not.toHaveBeenCalled()
    expect(takeLocale('zh-CN')).toBeUndefined()
  })

  it('另一语言的登记不被取用：照常导入当前语言；取到后另一语言的登记一并删除', async () => {
    registerLocale('zh-TW', TW)
    const options = deps()
    expect(await createLocaleLoader(options).load('zh-CN')).toBe(CN)
    expect(options.importScript).toHaveBeenCalledTimes(1)
    expect(registrations()).toEqual({})
  })

  it('取到当前语言后，旧版本留下的另一语言登记一并删除', () => {
    registerLocale('zh-TW', TW, 'old-build')
    registerLocale('zh-CN', CN)
    expect(takeLocale('zh-CN')).toBe(CN)
    expect(registrations()).toEqual({})
  })

  it('没取到当前语言时不动另一语言的登记', () => {
    registerLocale('zh-TW', TW)
    expect(takeLocale('zh-CN')).toBeUndefined()
    expect(registrations()).toEqual({ 'zh-TW': BUILD_ID })
  })

  it('扩展更新前旧版本留下的登记被丢弃，不被读到', async () => {
    registerLocale('zh-CN', TW, 'old-build')
    const loader = createLocaleLoader(deps({ importScript: vi.fn(async () => undefined) }))
    await expect(loader.load('zh-CN')).rejects.toThrow('语言包加载失败')
    registerLocale('zh-CN', TW, 'old-build')
    expect(takeLocale('zh-CN')).toBeUndefined()
  })

  it('同一页面里同一构建的模块已执行过（导入不再登记）：改请后台注入', async () => {
    const options = deps({
      importScript: vi.fn(async () => undefined),
      requestInjection: vi.fn(async locale => {
        registerLocale(locale, CN)
        return true
      })
    })
    expect(await createLocaleLoader(options).load('zh-CN')).toBe(CN)
    expect(options.requestInjection).toHaveBeenCalledWith('zh-CN')
  })

  it('动态导入失败：请后台注入后取用', async () => {
    const options = deps({
      importScript: vi.fn(async () => {
        throw new TypeError('Failed to fetch dynamically imported module')
      }),
      requestInjection: vi.fn(async locale => {
        registerLocale(locale, TW)
        return true
      })
    })
    expect(await createLocaleLoader(options).load('zh-TW')).toBe(TW)
    expect(options.requestInjection).toHaveBeenCalledWith('zh-TW')
  })

  it('导入与注入都失败：报错，之后可重试', async () => {
    let fail = true
    const options = deps({
      importScript: vi.fn(async () => {
        if (fail) throw new Error('blocked')
        registerLocale('zh-CN', CN)
      }),
      requestInjection: vi.fn(async () => {
        throw new Error('no receiver')
      })
    })
    const loader = createLocaleLoader(options)
    await expect(loader.load('zh-CN')).rejects.toThrow('语言包加载失败：zh-CN')
    fail = false
    expect(await loader.load('zh-CN')).toBe(CN)
  })

  it('词典脚本路径与 entrypoints 下的文件名一致', () => {
    expect(LOCALE_SCRIPT_FILES).toEqual({ 'zh-CN': '/locale-zh-cn.js', 'zh-TW': '/locale-zh-tw.js' })
  })
})

describe('等待注册的词典脚本登记（Firefox）', () => {
  /** 页面解析状态 */
  function stubReadyState(state: DocumentReadyState): void {
    vi.spyOn(document, 'readyState', 'get').mockReturnValue(state)
  }

  /** Firefox 的加载器：取不到登记时先等；不动态导入，请后台注入（注入的词典脚本执行时登记） */
  function firefoxDeps(): LocaleLoaderDeps {
    return {
      resolveUrl: path => `moz-extension://sample${path}`,
      requestInjection: vi.fn(async locale => {
        registerLocale(locale, locale === 'zh-TW' ? TW : CN)
        return true
      }),
      waitForRegistration: () => waitForRegistration(document)
    }
  }

  /** 让已就绪的微任务跑完 */
  async function flush(): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 0))
  }

  it('页面仍在解析：等词典脚本登记后取用，不请后台注入', async () => {
    stubReadyState('loading')
    const options = firefoxDeps()
    const task = createLocaleLoader(options).load('zh-CN')
    await flush()
    expect(options.requestInjection).not.toHaveBeenCalled()
    registerLocale('zh-CN', CN)
    expect(await task).toBe(CN)
    expect(options.requestInjection).not.toHaveBeenCalled()
  })

  it('到 DOMContentLoaded 仍没有登记：请后台注入', async () => {
    stubReadyState('loading')
    const options = firefoxDeps()
    const task = createLocaleLoader(options).load('zh-TW')
    await flush()
    expect(options.requestInjection).not.toHaveBeenCalled()
    document.dispatchEvent(new Event('DOMContentLoaded'))
    expect(await task).toBe(TW)
    expect(options.requestInjection).toHaveBeenCalledExactlyOnceWith('zh-TW')
  })

  it('登记的是另一语言（注册与当前语言不一致）：醒来后请后台注入当前语言', async () => {
    stubReadyState('loading')
    const options = firefoxDeps()
    const task = createLocaleLoader(options).load('zh-CN')
    registerLocale('zh-TW', TW)
    expect(await task).toBe(CN)
    expect(options.requestInjection).toHaveBeenCalledExactlyOnceWith('zh-CN')
  })

  it('已有另一语言的登记（注册的词典脚本已执行）：不等，直接请后台注入', async () => {
    stubReadyState('loading')
    registerLocale('zh-TW', TW)
    const options = firefoxDeps()
    expect(await createLocaleLoader(options).load('zh-CN')).toBe(CN)
    expect(options.requestInjection).toHaveBeenCalledTimes(1)
  })

  it('已取走登记（登记随之删除）后页面仍在解析时换另一语言：不等，直接请后台注入', async () => {
    stubReadyState('loading')
    registerLocale('zh-CN', CN)
    const options = firefoxDeps()
    const loader = createLocaleLoader(options)
    expect(await loader.load('zh-CN')).toBe(CN)
    const task = loader.load('zh-TW')
    await flush()
    expect(options.requestInjection).toHaveBeenCalledTimes(1)
    expect(await task).toBe(TW)
  })

  it('等到另一语言的登记、请后台注入当前语言后，页面仍在解析时换回：不等，直接请后台注入', async () => {
    stubReadyState('loading')
    const options = firefoxDeps()
    const loader = createLocaleLoader(options)
    const first = loader.load('zh-CN')
    registerLocale('zh-TW', TW)
    expect(await first).toBe(CN)
    const task = loader.load('zh-TW')
    await flush()
    expect(options.requestInjection).toHaveBeenCalledTimes(2)
    expect(await task).toBe(TW)
  })

  it('页面已解析完：不等，直接请后台注入', async () => {
    stubReadyState('interactive')
    const options = firefoxDeps()
    expect(await createLocaleLoader(options).load('zh-CN')).toBe(CN)
    expect(options.requestInjection).toHaveBeenCalledTimes(1)
  })

  it('后台注入失败：报错，之后可重试', async () => {
    stubReadyState('interactive')
    let fail = true
    const options: LocaleLoaderDeps = {
      ...firefoxDeps(),
      requestInjection: vi.fn(async locale => {
        if (fail) return false
        registerLocale(locale, CN)
        return true
      })
    }
    const loader = createLocaleLoader(options)
    await expect(loader.load('zh-CN')).rejects.toThrow('语言包加载失败：zh-CN')
    fail = false
    expect(await loader.load('zh-CN')).toBe(CN)
  })

  it('不传等待（Chromium）：页面仍在解析也不等', async () => {
    stubReadyState('loading')
    const options = deps()
    expect(await createLocaleLoader(options).load('zh-CN')).toBe(CN)
    expect(options.importScript).toHaveBeenCalledTimes(1)
  })

  it('等到后撤下监听：之后的登记、DOMContentLoaded 不再触发', async () => {
    stubReadyState('loading')
    const removeListener = vi.spyOn(document, 'removeEventListener')
    const waiting = waitForRegistration(document)
    registerLocale('zh-CN', CN)
    await waiting
    expect(removeListener).toHaveBeenCalledWith('DOMContentLoaded', expect.any(Function))
    const listeners = (globalThis as unknown as Record<string, Set<unknown>>)['__githubChineseLocaleListeners']
    expect(listeners?.size).toBe(0)
  })
})
