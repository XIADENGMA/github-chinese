// @vitest-environment node
/**
 * 构建期压缩词条表（scripts/pack-tables.ts）的等价性：改写在构建时生效（wxt build 与 wxt dev），vitest 与检查脚本
 * 用的是源码对象。这里用同一个改写函数处理全部词典模块，并带插件打包语言包入口后在 vm 中执行，与源码语言包逐条比较
 */
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative, resolve } from 'node:path'
import { runInThisContext } from 'node:vm'
import { build, parseSync, type ESTree, type Plugin, type Rolldown } from 'vite'
import { describe, expect, it } from 'vitest'
import { findTables, packTables, packTablesPlugin } from '../../../scripts/pack-tables'
import { detectPages } from '../../../src/core/page'
import { createMatcher, type Matcher } from '../../../src/core/matcher'
import { tableEntries, type Table } from '../../../src/core/table'
import { PAGE_KEYS, type LocaleBundle, type PageDictionary, type PageKey } from '../../../src/core/types'
import cnRegions from '../../../src/locales/zh-CN/common/regions'
import cnModels from '../../../src/locales/zh-CN/copilot/models'
import { zhCN } from '../../../src/locales/zh-CN/index'
import twRegions from '../../../src/locales/zh-TW/common/regions'
import twModels from '../../../src/locales/zh-TW/copilot/models'
import { zhTW } from '../../../src/locales/zh-TW/index'

const ROOT = resolve(__dirname, '../../..')
const LOCALE_DIR = resolve(ROOT, 'src/locales')

/** 解析全部模块、打包、比较全部原文较慢 */
const SLOW_TIMEOUT = 180_000

function listFiles(dir: string, extension: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name)
    if (statSync(full).isDirectory()) return listFiles(full, extension)
    return name.endsWith(extension) ? [full] : []
  })
}

function parse(file: string, code: string): ESTree.Program {
  return parseSync(file, code).program
}

/** 执行一段定义了 result 的代码，返回 result */
function evaluate(code: string): Record<string, unknown> {
  return runInThisContext(`(function () {\n${code}\nreturn result\n})()`) as Record<string, unknown>
}

/** 压缩串（类型上仍写作 Table） */
function asTable(value: unknown): Table {
  return value as Table
}

describe('改写函数：只改纯字符串的 static / scoped 对象字面量，条目同对象字面量的语义', () => {
  const SEPARATOR_ESCAPE = '\\u001f'
  const code = [
    "const x = { y: '乙' }",
    "const k = 'kk'",
    "const s = 'static'",
    'const result = {',
    "  duplicate: { scoped: { Open: '打开', Close: '关闭', 'Open': '覆盖' } },",
    "  integerKeys: { static: { '2': '二', z: 'z', '1': '一', '01': '零一', '4294967295': '大', '-1': '负一' } },",
    "  quotedKey: { 'static': { a: '甲', 'b c': \"乙丙\", '': '空' } },",
    "  proto: { static: { __proto__: '原型', a: '甲' } },",
    "  quotedProto: { static: { '__proto__': '原型', a: '甲' } },",
    "  spread: { static: { ...x, a: '甲' } },",
    "  computed: { static: { [k]: '甲' } },",
    '  template: { static: { a: `模板` } },',
    '  number: { static: { a: 1 } },',
    '  numericKey: { static: { 1: "一" } },',
    `  separator: { static: { a: '含${SEPARATOR_ESCAPE}分隔符' } },`,
    '  empty: { static: {} },',
    "  getter: { static: { a: '甲', get b() { return '乙' } } },",
    "  method: { static: { a() { return '甲' } } },",
    '  shorthand: { static: { s } },',
    "  outerComputed: { [s]: { a: '甲' } },",
    "  other: { other: { a: '甲' } },",
    "  nested: { static: { a: '甲' }, regexp: [{ scoped: { b: '乙' } }] },",
    '}',
  ].join('\n')
  const packed = packTables(code, parse('sample.js', code), 'sample.js')
  const before = evaluate(code)
  const after = evaluate(packed?.code ?? code)

  function field(result: Record<string, unknown>, name: string, key = 'static'): unknown {
    return (result[name] as Record<string, unknown>)[key]
  }

  it.each([
    ['duplicate', 'scoped'],
    ['integerKeys', 'static'],
    ['quotedKey', 'static'],
  ])('%s：改写成字符串，解码后同 Object.entries（重复的原文后者覆盖，整数样式的原文排在前面）', (name, key) => {
    expect(typeof field(after, name, key)).toBe('string')
    expect(tableEntries(asTable(field(after, name, key)))).toEqual(Object.entries(field(before, name, key) as object))
  })

  it('解码结果', () => {
    expect(tableEntries(asTable(field(after, 'duplicate', 'scoped')))).toEqual([
      ['Open', '覆盖'],
      ['Close', '关闭'],
    ])
    expect(tableEntries(asTable(field(after, 'integerKeys'))).map(([key]) => key)).toEqual([
      '1',
      '2',
      'z',
      '01',
      '4294967295',
      '-1',
    ])
  })

  it.each([
    'proto',
    'quotedProto',
    'spread',
    'computed',
    'template',
    'number',
    'numericKey',
    'separator',
    'empty',
    'getter',
    'method',
    'shorthand',
  ])('%s：不改写', (name) => {
    const line = code.split('\n').find((text) => text.startsWith(`  ${name}: `))
    expect(packed?.code.split('\n')).toContain(line)
    /** 条目（方法按源码比较） */
    const shape = (value: unknown): unknown[] =>
      Object.entries(value as object).map(([key, item]) => [key, typeof item === 'function' ? String(item) : item])
    expect(typeof field(after, name)).toBe('object')
    expect(shape(field(after, name))).toEqual(shape(field(before, name)))
  })

  it('不是 static / scoped 属性值的对象不改写；同一对象里的嵌套表各自判断', () => {
    expect(after.outerComputed).toEqual(before.outerComputed)
    expect(after.other).toEqual(before.other)
    expect(typeof field(after, 'nested')).toBe('string')
    expect(after.nested).toMatchObject({ regexp: [{ scoped: expect.any(String) }] })
  })

  it('生成源码映射；没有可改写的表时不处理', () => {
    expect(packed?.map.sources).toEqual(['sample.js'])
    expect(packed?.map.sourcesContent).toEqual([code])
    expect(packed?.map.mappings.split(';')).toHaveLength(packed?.code.split('\n').length ?? 0)
    const plain = "const result = { regexp: [], other: { a: '甲' } }"
    expect(packTables(plain, parse('plain.js', plain))).toBeUndefined()
  })
})

describe('构建插件', () => {
  const plugin = packTablesPlugin(LOCALE_DIR)
  const transform = plugin.transform as {
    handler(this: { parse(code: string): ESTree.Program }, code: string, id: string): unknown
  }
  const context = { parse: (code: string) => parse('module.js', code) }
  const code = "export default { static: { Open: '打开' } }"

  it('只处理词典目录下的模块', () => {
    const inside = transform.handler.call(context, code, resolve(LOCALE_DIR, 'zh-CN/sample.ts').replaceAll('\\', '/'))
    expect(inside).toMatchObject({ code: expect.stringContaining('export default { static: "Open') })
    expect(transform.handler.call(context, code, resolve(ROOT, 'src/core/sample.ts'))).toBeNull()
    expect(transform.handler.call(context, code, resolve(LOCALE_DIR, '../locales-other/sample.ts'))).toBeNull()
    expect(transform.handler.call(context, 'export const a = 1', resolve(LOCALE_DIR, 'zh-CN/a.ts'))).toBeNull()
  })
})

describe('全部词典模块', () => {
  it(
    '每张改写的表解码后与原对象的条目、取值、顺序相同',
    () => {
      let count = 0
      for (const file of listFiles(LOCALE_DIR, '.ts')) {
        const code = readFileSync(file, 'utf8')
        for (const table of findTables(parse(file, code))) {
          const original = runInThisContext(`(${code.slice(table.start, table.end)})`) as object
          expect(Object.getPrototypeOf(original)).toBe(Object.prototype)
          expect(table.entries, relative(ROOT, file)).toEqual(Object.entries(original))
          expect(tableEntries(asTable(table.packed)), relative(ROOT, file)).toEqual(Object.entries(original))
          count++
        }
      }
      // 简繁合计七百多张；骤减说明改写条件或词典写法变了
      expect(count).toBeGreaterThan(600)
    },
    SLOW_TIMEOUT,
  )
})

/** 打包入口（同生产构建：压缩代码），在 vm 中执行后取出导出的语言包 */
async function bundleOf(entry: string, exportName: string, plugins: readonly Plugin[]): Promise<LocaleBundle> {
  const output = await build({
    configFile: false,
    logLevel: 'silent',
    root: ROOT,
    plugins: [...plugins],
    build: {
      write: false,
      minify: true,
      lib: { entry, formats: ['iife'], name: '__packedBundle' },
    },
  })
  const result = (Array.isArray(output) ? output[0] : output) as Rolldown.RolldownOutput
  const code = result.output[0].code
  const exports = runInThisContext(`(function () {\n${code}\nreturn __packedBundle\n})()`) as Record<string, unknown>
  return exports[exportName] as LocaleBundle
}

/** 带改写插件打包语言包入口 */
function packedBundle(entry: string, exportName: string): Promise<LocaleBundle> {
  return bundleOf(resolve(ROOT, entry), exportName, [packTablesPlugin(LOCALE_DIR)])
}

describe('合成词典经插件与压缩打包：合并表里自有的 __proto__ 条目与不改写时相同', () => {
  const helpers = resolve(ROOT, 'src/locales/shared/helpers.ts').replaceAll('\\', '/')
  /** 虚拟模块：路径在词典目录下，插件才处理 */
  const id = resolve(LOCALE_DIR, '__sample__/proto.js').replaceAll('\\', '/')
  const sample: Plugin = {
    name: 'test:proto-sample',
    enforce: 'pre',
    resolveId: (source) => (source.replaceAll('\\', '/') === id ? id : null),
    load: (source) =>
      source === id
        ? [
            `import { mergeDictionaries } from ${JSON.stringify(helpers)}`,
            "const withProto = { ['__proto__']: '原型条目', Sibling: '同表' }",
            'export const bundle = [',
            "  ['common', mergeDictionaries({ static: withProto }, { static: { Open: '打开', Close: '关闭' } })],",
            "  ['repository', mergeDictionaries({ scoped: { Fork: '复刻' } }, { scoped: { ['__proto__']: '仓库原型', Star: '星标' } })],",
            "  ['issues', mergeDictionaries({ static: { ['__proto__']: '都是普通对象' } }, { static: withProto })],",
            ']',
          ].join('\n')
        : null,
  }

  it(
    '合并表含压缩串时是子表数组；表的条目、translate 结果与不改写的打包相同',
    async () => {
      const [plain, packed] = await Promise.all([
        bundleOf(id, 'bundle', [sample]),
        bundleOf(id, 'bundle', [sample, packTablesPlugin(LOCALE_DIR)]),
      ])
      const forms = packed.map(([, dict]) =>
        [dict.static, dict.scoped].map((table) => (Array.isArray(table) ? 'list' : typeof table)),
      )
      expect(forms).toEqual([
        ['list', 'object'],
        ['object', 'list'],
        ['object', 'object'],
      ])

      const expected = createMatcher(plain)
      const actual = createMatcher(packed)
      const scopes: PageKey[][] = [['common'], ['common', 'repository'], ['common', 'issues']]
      for (const scope of scopes) {
        for (const text of ['__proto__', 'Sibling', 'Open', 'Close', 'Fork', 'Star', 'constructor']) {
          expect(actual.translate(text, scope), `${scope.join('|')} ${text}`).toBe(expected.translate(text, scope))
        }
      }
      expect(actual.translate('__proto__', ['common'])).toBe('原型条目')
      expect(actual.translate('__proto__', ['common', 'repository'])).toBe('仓库原型')

      plain.forEach(([key, dict], index) => {
        const [, other] = packed[index]!
        expect(tableEntries(other.static), `${key} static`).toEqual(Object.entries(dict.static ?? {}))
        expect(tableEntries(other.scoped), `${key} scoped`).toEqual(Object.entries(dict.scoped ?? {}))
      })
      // 子表都是普通对象的合并：先出现者优先
      expect(Object.entries(plain[2]![1].static ?? {})).toEqual([
        ['__proto__', '都是普通对象'],
        ['Sibling', '同表'],
      ])
    },
    SLOW_TIMEOUT,
  )
})

/** 页面范围：每个页面类型，以及按地址推断的多层范围 */
const SCOPES: readonly (readonly PageKey[])[] = [
  ...new Map(
    [
      ['common'] as PageKey[],
      ...PAGE_KEYS.map((key): PageKey[] => ['common', key]),
      ...[
        'https://github.com/',
        'https://github.com/octocat',
        'https://github.com/octocat?tab=projects',
        'https://github.com/orgs/octo-org/projects',
        'https://github.com/orgs/octo-org/settings/profile',
        'https://github.com/organizations/octo-org/settings/billing',
        'https://github.com/octocat/hello-world',
        'https://github.com/octocat/hello-world/compare/main...dev',
        'https://github.com/octocat/hello-world/pull/1/checks',
        'https://github.com/octocat/hello-world/pull/1/agent-sessions/1',
        'https://github.com/octocat/hello-world/community/license/new',
        'https://github.com/octocat/hello-world/issues/1',
        'https://github.com/octocat/hello-world/settings',
        'https://github.com/settings/profile',
        'https://gist.github.com/octocat/1',
        'https://www.githubstatus.com/',
      ].map((url) => detectPages(new URL(url))),
    ].map((scope) => [scope.join('|'), scope] as const),
  ).values(),
]

/** 表中的全部原文 */
function tableTexts(bundles: readonly LocaleBundle[]): string[] {
  const texts = new Set<string>()
  for (const bundle of bundles) {
    for (const [, dict] of bundle) {
      for (const [key] of [...tableEntries(dict.static), ...tableEntries(dict.scoped)]) texts.add(key)
    }
  }
  return [...texts]
}

/** 正则替换函数里查表的原文：任务创建失败横幅（models 词典）、会话地点与短信区号（regions 词典） */
function replacerTexts(models: PageDictionary, regions: PageDictionary): string[] {
  const billing = tableEntries(models.static).map(([key]) => key)
  const places = [...tableEntries(regions.static).map(([key]) => key), 'Mars']
  return [
    ...[...billing, "Unable to start task for 'Fix the bug'. Please try again.", 'Internal error'].map(
      (description) => `Task creation failed. ${description}`,
    ),
    ...places.map((place) => `View details of session from ${place} last accessed 3 days ago`),
    ...places.map((place) => `${place} (+1)`),
    `${places[0]}/${places[1]} (+61)`,
  ]
}

describe.each([
  ['zh-CN', 'src/locales/zh-CN/index.ts', 'zhCN', zhCN, cnModels, cnRegions],
  ['zh-TW', 'src/locales/zh-TW/index.ts', 'zhTW', zhTW, twModels, twRegions],
] as const)('%s：带改写插件打包的语言包', (_, entry, exportName, source, models, regions) => {
  it(
    '表解码后与源码语言包相同；对全部原文在全部页面范围下 translate 逐条相同',
    async () => {
      const packed = await packedBundle(entry, exportName)
      expect(packed).toHaveLength(source.length)

      // 改写生效：叶子词典的表是字符串，合并词典的表是子表数组
      const tables = packed.flatMap(([, dict]) => [dict.static, dict.scoped] as unknown[])
      expect(tables.filter((table) => typeof table === 'string').length).toBeGreaterThan(0)
      expect(tables.filter((table) => Array.isArray(table)).length).toBeGreaterThan(30)

      packed.forEach(([key, dict], index) => {
        const [sourceKey, original] = source[index]!
        expect(key).toBe(sourceKey)
        expect(tableEntries(dict.static), `${key} static`).toEqual(Object.entries(original.static ?? {}))
        expect(tableEntries(dict.scoped), `${key} scoped`).toEqual(Object.entries(original.scoped ?? {}))
        // 名称表、说明表、预置列表名表不改写（含展开），条目与源码相同；标签正则逐条同源
        expect(tableEntries(dict.labels), `${key} labels`).toEqual(tableEntries(original.labels))
        expect(tableEntries(dict.labelDescriptions), `${key} labelDescriptions`).toEqual(
          tableEntries(original.labelDescriptions),
        )
        expect(tableEntries(dict.listNames), `${key} listNames`).toEqual(tableEntries(original.listNames))
        expect(
          (dict.labelRegexp ?? []).map(([pattern]) => String(pattern)),
          `${key} labelRegexp`,
        ).toEqual((original.labelRegexp ?? []).map(([pattern]) => String(pattern)))
      })

      // 名称表、说明表、预置列表名表的全部原文、标签正则样例与自定义名反例：translateLabel 在三种区域逐条相同
      const labelTexts = [
        ...new Set(
          source.flatMap(([, dict]) =>
            [
              ...tableEntries(dict.labels),
              ...tableEntries(dict.labelDescriptions),
              ...tableEntries(dict.listNames),
            ].map(([text]) => text),
          ),
        ),
        'Pull requests that update javascript code',
        'Pull requests that update GitHub Actions code',
        'scope: vapor',
        'Bug',
        'Inspiration',
      ]
      const texts = [...tableTexts([source, packed]), ...replacerTexts(models, regions)]
      const expected = createMatcher(source)
      const actual = createMatcher(packed)
      const labelResults = (matcher: Matcher): (string | undefined)[] =>
        labelTexts.flatMap((text) => [
          matcher.translateLabel(text, 'name'),
          matcher.translateLabel(text, 'description'),
          matcher.translateLabel(text, 'list'),
        ])
      expect(labelResults(expected).filter((result) => result !== undefined).length).toBeGreaterThan(20)
      expect(labelResults(actual)).toEqual(labelResults(expected))

      const mismatched: string[] = []
      for (const scope of SCOPES) {
        for (const text of texts) {
          if (actual.translate(text, scope) !== expected.translate(text, scope)) {
            mismatched.push(`${scope.join('|')} ${text}`)
          }
        }
      }
      expect(mismatched).toEqual([])
      expect(texts.length * SCOPES.length).toBeGreaterThan(500_000)
    },
    SLOW_TIMEOUT,
  )
})

/** 读取词条表的函数：参数里的 x.static / x.scoped 不算直接读取 */
const TABLE_FUNCTIONS: ReadonlySet<string> = new Set(['addEntries', 'tableEntries', 'lookupTable', 'mergeTables'])

/** 只按词条表的运行时形态处理的文件：matcher 收录、mergeDictionaries 合并 */
const TABLE_INTERNALS: ReadonlySet<string> = new Set(['src/core/matcher.ts', 'src/locales/shared/helpers.ts'])

function isTableName(node: ESTree.Node, computed: boolean): boolean {
  if (!computed && node.type === 'Identifier') return node.name === 'static' || node.name === 'scoped'
  return node.type === 'Literal' && (node.value === 'static' || node.value === 'scoped')
}

function isTableCall(node: ESTree.Node | undefined): boolean {
  return node?.type === 'CallExpression' && node.callee.type === 'Identifier' && TABLE_FUNCTIONS.has(node.callee.name)
}

/** 遍历语法树，带上祖先节点（由近及远排在末尾） */
function walk(node: unknown, visit: (node: ESTree.Node, parents: readonly ESTree.Node[]) => void): void {
  const stack: ESTree.Node[] = []
  const step = (value: unknown): void => {
    if (Array.isArray(value)) {
      for (const child of value) step(child)
      return
    }
    if (typeof value !== 'object' || value === null) return
    const isNode = typeof (value as { type?: unknown }).type === 'string'
    if (isNode) {
      visit(value as ESTree.Node, stack)
      stack.push(value as ESTree.Node)
    }
    for (const [key, child] of Object.entries(value)) if (key !== 'parent') step(child)
    if (isNode) stack.pop()
  }
  step(node)
}

/** 代码中直接读取 static / scoped 的位置：不是读取函数的参数（或 mergeTables 数组参数的元素）的成员访问，以及解构 */
function tableReads(path: string, code: string): string[] {
  const reads: string[] = []
  const lineOf = (node: ESTree.Node): number => code.slice(0, node.start).split('\n').length
  walk(parse(path, code), (node, parents) => {
    const parent = parents.at(-1)
    if (node.type === 'MemberExpression' && isTableName(node.property, node.computed)) {
      const asArgument = isTableCall(parent)
      const inMergedList = parent?.type === 'ArrayExpression' && isTableCall(parents.at(-2))
      if (!asArgument && !inMergedList) reads.push(`${path}:${lineOf(node)} ${code.slice(node.start, node.end)}`)
    }
    if (
      node.type === 'ObjectPattern' &&
      node.properties.some((item) => item.type === 'Property' && isTableName(item.key, item.computed))
    ) {
      reads.push(`${path}:${lineOf(node)} 解构`)
    }
  })
  return reads
}

describe('运行时只经 core/table 读取 static / scoped', () => {
  it('能查出直接读取', () => {
    const sample = [
      'lookupTable(models.static)',
      'mergeTables([a.static, b.scoped])',
      "const x = dict.static['Open']",
      'const y = { ...dict.scoped }',
      "Object.keys(dict['static'])",
      'const { static: table } = dict',
      'const z = dict[scoped]',
    ].join('\n')
    expect(tableReads('sample.ts', sample)).toEqual([
      'sample.ts:3 dict.static',
      'sample.ts:4 dict.scoped',
      "sample.ts:5 dict['static']",
      'sample.ts:6 解构',
    ])
  })

  it(
    'src 中没有直接按键读取、展开或解构词条表（构建产物中是压缩串）',
    () => {
      const reads = listFiles(resolve(ROOT, 'src'), '.ts').flatMap((file) => {
        const path = relative(ROOT, file).replaceAll('\\', '/')
        return TABLE_INTERNALS.has(path) ? [] : tableReads(path, readFileSync(file, 'utf8'))
      })
      expect(reads).toEqual([])
    },
    SLOW_TIMEOUT,
  )
})
