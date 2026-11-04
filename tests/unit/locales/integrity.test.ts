import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { describe, expect, it } from 'vitest'
import {
  classifyModule,
  displayPath,
  isEmptyDictionary,
  isMerged,
  listDictionaryFiles,
  mergedFiles,
  overriddenKeys,
  placeOf,
  registeredKeys
} from '../../../scripts/locale-wiring'
import { hasTopLevelAlternative } from '../../../src/core/regexp-index'
import type { LocaleBundle, PageDictionary } from '../../../src/core/types'
import { zhCN } from '../../../src/locales/zh-CN/index'
import { zhTW } from '../../../src/locales/zh-TW/index'

interface LocaleFiles {
  readonly locale: string
  readonly bundle: LocaleBundle
  readonly kinds: ReadonlyMap<string, ReturnType<typeof classifyModule>>
  readonly dicts: ReadonlyMap<string, PageDictionary>
  readonly merged: ReadonlyMap<string, readonly string[]>
  readonly top: readonly string[]
  readonly sub: readonly string[]
  readonly registered: readonly string[]
}

// 运行时列出文件再动态导入：import.meta.glob 的展开结果会被模块缓存，新增的词典文件可能漏检
async function loadLocale(locale: string, bundle: LocaleBundle): Promise<LocaleFiles> {
  const root = resolve('src/locales', locale)
  const modules = new Map(
    await Promise.all(
      listDictionaryFiles(root).map(async file => [file, (await import(pathToFileURL(file).href)) as Record<string, unknown>] as const)
    )
  )
  const kinds = new Map([...modules].map(([file, module]) => [file, classifyModule(module, placeOf(file, root))]))
  const dicts = new Map(
    [...modules].flatMap(([file, module]) => (kinds.get(file) === 'dictionary' ? [[file, module.default as PageDictionary] as const] : []))
  )
  const top = [...dicts.keys()].filter(file => placeOf(file, root) === 'top')
  return {
    locale,
    bundle,
    kinds,
    dicts,
    merged: mergedFiles(dicts, root),
    top,
    sub: [...dicts.keys()].filter(file => placeOf(file, root) === 'sub'),
    registered: top.filter(file => registeredKeys(dicts.get(file)!, bundle).length > 0)
  }
}

const LOCALES = [await loadLocale('zh-CN', zhCN), await loadLocale('zh-TW', zhTW)]

describe.each(LOCALES.map(files => [files.locale, files] as const))('%s 词典接线', (locale, files) => {
  it('找到全部词典文件', () => {
    expect(files.top.map(displayPath)).toContain(`src/locales/${locale}/common.ts`)
    expect(files.sub.length).toBeGreaterThan(0)
  })

  it('每个词典文件都有默认导出（子目录里的共用工具模块除外）', () => {
    expect([...files.kinds].filter(([, kind]) => kind === 'missing-default').map(([file]) => displayPath(file))).toEqual([])
  })

  it.each(files.top.map(displayPath))('%s 已在 index.ts 注册', name => {
    const file = files.top.find(top => displayPath(top) === name)!
    expect(files.registered).toContain(file)
  })

  it.each(files.sub.map(displayPath))('%s 已被注册的词典合并，且词条未被覆盖', name => {
    const file = files.sub.find(sub => displayPath(sub) === name)!
    const child = files.dicts.get(file)!
    if (isEmptyDictionary(child)) return
    const parents = files.registered.filter(top => files.merged.get(top)?.includes(file))
    expect(parents.map(displayPath), '没有被任何已注册的词典合并').not.toEqual([])
    for (const parent of parents) {
      expect(isMerged(child, files.dicts.get(parent)!)).toBe(true)
      expect(overriddenKeys(child, files.dicts.get(parent)!), `在 ${displayPath(parent)} 中被覆盖`).toEqual([])
    }
  })
})

/**
 * 引擎按首字符与字面前缀给正则建索引（src/core/regexp-index），regexp 与标签正则 labelRegexp 都是：
 * 带 m / u / v 标志、顶层有 | 的写法推导不了，也容易写错锚定
 */
function badRules(bundle: LocaleBundle): string[] {
  return bundle.flatMap(([key, dict]) =>
    [...(dict.regexp ?? []), ...(dict.labelRegexp ?? [])]
      .map(([pattern]) => pattern)
      .filter(pattern => /[muv]/.test(pattern.flags) || hasTopLevelAlternative(pattern))
      .map(pattern => `${key} ${String(pattern)}`)
  )
}

describe.each([
  ['zh-CN', zhCN],
  ['zh-TW', zhTW]
] as const)('%s 正则写法', (_, bundle) => {
  it('regexp、labelRegexp 不带 m / u / v 标志，顶层没有 |', () => {
    expect(badRules(bundle)).toEqual([])
  })
})

it('正则写法检查含标签正则', () => {
  const bundle: LocaleBundle = [
    [
      'issues',
      {
        regexp: [[/^Sample$/, '示例']],
        labelRegexp: [
          [/^Sample$/m, '示例'],
          [/^Sample$|^Text$/, '示例']
        ]
      }
    ]
  ]
  expect(badRules(bundle)).toEqual(['issues /^Sample$/m', 'issues /^Sample$|^Text$/'])
})
