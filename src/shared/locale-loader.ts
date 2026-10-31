/**
 * 页面翻译语言包的加载。语言包很大（简体词典约 1.7 MB），按语言拆成独立的词典脚本（entrypoints/locale-*.ts），
 * 内容脚本只用当前语言的那一个。后台把当前语言的词典脚本注册为 document_start 内容脚本
 * （见 locale-script.ts）：页面开始解析前已登记，内容脚本直接取用，打开页面即显示中文。
 * Firefox 的注册脚本可能还在编译（脚本缓存未命中时挡住解析，编译完才执行），内容脚本先读完存储（Safari 同样处理）：
 * 取不到登记、页面仍在解析且注册的词典脚本还没执行（没有当前构建的登记，也没取到过语言包）时，
 * 先等它登记或 DOMContentLoaded（见 waitForRegistration）。
 * 没有注册（刚安装、扩展更新后尚未补回、总开关关闭时打开的页面之后开启、语言与注册的不一致）时动态导入
 * （词典脚本列在 web_accessible_resources），失败时请后台注入；Firefox、Safari 不动态导入，直接请后台注入。
 * 词典脚本执行后把语言包连同构建标识登记在扩展隔离环境的全局对象上（页面脚本读不到），内容脚本取走。
 */
import type { LocaleBundle } from '../core/types'
import { BUILD_ID } from './build-id'
import type { PageLocale } from './locale'

/** 登记语言包的全局键 */
const REGISTRY_KEY = '__githubChineseLocales'
/** 等待登记的回调的全局键：词典脚本与内容脚本各自打包，经隔离环境的全局对象相通 */
const LISTENERS_KEY = '__githubChineseLocaleListeners'

interface Registration {
  /** 登记时的构建标识：扩展更新后页面上旧版本的登记与当前构建不同 */
  readonly build: string
  readonly bundle: LocaleBundle
}

type Registry = Partial<Record<PageLocale, Registration>>

type RegistrationListener = () => void

/** 词典脚本的构建产物（与 entrypoints 下的文件名一致） */
export const LOCALE_SCRIPT_FILES = {
  'zh-CN': '/locale-zh-cn.js',
  'zh-TW': '/locale-zh-tw.js',
} as const satisfies Readonly<Record<PageLocale, string>>

/** 页面时间元素（<relative-time> 等）渲染所用的 lang */
export const TIME_LANGS: Readonly<Record<PageLocale, string>> = { 'zh-CN': 'zh-CN', 'zh-TW': 'zh-TW' }

function registry(): Registry {
  const scope = globalThis as unknown as Record<string, Registry | undefined>
  scope[REGISTRY_KEY] ??= {}
  return scope[REGISTRY_KEY]
}

function registrationListeners(): Set<RegistrationListener> {
  const scope = globalThis as unknown as Record<string, Set<RegistrationListener> | undefined>
  scope[LISTENERS_KEY] ??= new Set()
  return scope[LISTENERS_KEY]
}

/** 有当前构建的登记：注册的词典脚本已执行 */
function hasCurrentRegistration(): boolean {
  return Object.values(registry()).some((entry) => entry?.build === BUILD_ID)
}

/** 词典脚本调用：登记语言包并唤醒等待登记的内容脚本（build 只供测试模拟旧版本的登记） */
export function registerLocale(locale: PageLocale, bundle: LocaleBundle, build: string = BUILD_ID): void {
  registry()[locale] = { build, bundle }
  const scope = globalThis as unknown as Record<string, Set<RegistrationListener> | undefined>
  for (const listener of [...(scope[LISTENERS_KEY] ?? [])]) listener()
}

/**
 * 取走登记的语言包：取后删除；不是当前构建登记的（扩展更新前的旧版本）丢弃，返回 undefined。
 * 取到时其余登记（另一语言、旧版本）一并删除：用不到，不常驻内存
 */
export function takeLocale(locale: PageLocale): LocaleBundle | undefined {
  const entries = registry()
  const entry = entries[locale]
  delete entries[locale]
  if (entry?.build !== BUILD_ID) return undefined
  for (const key of Object.keys(entries)) delete entries[key as PageLocale]
  return entry.bundle
}

/**
 * 页面仍在解析时，等下一次登记或 DOMContentLoaded（二者先到者）；已解析完时不等。
 * 用于 Firefox（Safari 同样用）：注册的词典脚本未命中脚本缓存时先挡住解析、编译完再执行，一定在 DOMContentLoaded 之前
 */
export function waitForRegistration(doc: Document): Promise<void> {
  if (doc.readyState !== 'loading') return Promise.resolve()
  const listeners = registrationListeners()
  return new Promise((resolve) => {
    const done = (): void => {
      listeners.delete(done)
      doc.removeEventListener('DOMContentLoaded', done)
      resolve()
    }
    listeners.add(done)
    doc.addEventListener('DOMContentLoaded', done)
  })
}

export interface LocaleLoaderDeps {
  /** 扩展内路径 → 完整地址（runtime.getURL） */
  resolveUrl(path: string): string
  /** 动态导入脚本；不传时不导入，直接请后台注入（Firefox：AMO 的代码检查把参数不是字面量的 import() 报为不安全调用；Safari 同样不传） */
  importScript?(url: string): Promise<unknown>
  /** 请后台注入词典脚本；成功返回 true */
  requestInjection(locale: PageLocale): Promise<boolean>
  /** 注册的词典脚本还没执行时，先等它登记再动态导入（Firefox、Safari，见 waitForRegistration）；不传时不等 */
  waitForRegistration?(): Promise<void>
}

export interface LocaleLoader {
  /** 加载语言包；同一语言只加载一次，失败后可重试 */
  load(locale: PageLocale): Promise<LocaleBundle>
}

export function createLocaleLoader(deps: LocaleLoaderDeps): LocaleLoader {
  const loaded = new Map<PageLocale, Promise<LocaleBundle>>()
  /** 取到过语言包：取走时登记一并删除，之后看不出注册的词典脚本已执行，据此不再等 */
  let taken = false

  function take(locale: PageLocale): LocaleBundle | undefined {
    const bundle = takeLocale(locale)
    if (bundle) taken = true
    return bundle
  }

  async function fetchBundle(locale: PageLocale): Promise<LocaleBundle> {
    // 注册的词典脚本已在页面开始解析前执行：直接取用
    let bundle = take(locale)
    if (bundle) return bundle
    // 注册的词典脚本还没执行：等它登记。已有当前构建的登记（另一语言）或取到过语言包时它已执行过，不等
    if (deps.waitForRegistration && !taken && !hasCurrentRegistration()) {
      await deps.waitForRegistration().catch(() => undefined)
      bundle = take(locale)
      if (bundle) return bundle
    }
    if (deps.importScript) {
      try {
        // 地址按构建区分：扩展更新前后的实例不共用已执行过的模块；同一构建的各页面地址相同，浏览器可复用编译结果。
        // 同一页面里同一构建的模块已执行过（不再登记）时，下面改请后台注入
        await deps.importScript(`${deps.resolveUrl(LOCALE_SCRIPT_FILES[locale])}?build=${BUILD_ID}`)
      } catch {
        // 下面改请后台注入
      }
      bundle = take(locale)
    }
    if (!bundle && (await deps.requestInjection(locale).catch(() => false))) bundle = take(locale)
    if (!bundle) throw new Error(`语言包加载失败：${locale}`)
    return bundle
  }

  return {
    load(locale) {
      const cached = loaded.get(locale)
      if (cached) return cached
      const task = fetchBundle(locale)
      loaded.set(locale, task)
      task.catch(() => loaded.delete(locale))
      return task
    },
  }
}
