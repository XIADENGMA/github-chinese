import { describe, expect, it } from 'vitest'
import { createMatcher } from '../../../src/core/matcher'
import {
  addEntries,
  lookupTable,
  mergeTables,
  packTable,
  TABLE_SEPARATOR,
  tableEntries,
  type Table,
} from '../../../src/core/table'
import type { LocaleBundle, PageDictionary, PageKey } from '../../../src/core/types'
import { mergeDictionaries } from '../../../src/locales/shared/helpers'

/** 构建产物的压缩串（类型上仍写作 Table） */
function packed(record: Table): Table {
  return packTable(Object.entries(record)) as unknown as Table
}

/** 普通对象的词典改成压缩串形态（模拟构建产物） */
function packDictionary(dict: PageDictionary): PageDictionary {
  return {
    ...dict,
    ...(dict.static ? { static: packed(dict.static) } : {}),
    ...(dict.scoped ? { scoped: packed(dict.scoped) } : {}),
  }
}

function mapOf(...tables: (Table | undefined)[]): Map<string, string> {
  const map = new Map<string, string>()
  for (const table of tables) addEntries(map, table)
  return map
}

describe('packTable', () => {
  it('原文、译文交替以分隔符相连', () => {
    expect(
      packTable([
        ['Open', '打开'],
        ['Close', '关闭'],
      ]),
    ).toBe(['Open', '打开', 'Close', '关闭'].join(TABLE_SEPARATOR))
    expect(packTable([['', '']])).toBe(TABLE_SEPARATOR)
  })

  it('原文或译文含分隔符时不压缩', () => {
    expect(packTable([[`a${TABLE_SEPARATOR}b`, '甲']])).toBeUndefined()
    expect(packTable([['a', `甲${TABLE_SEPARATOR}`]])).toBeUndefined()
  })
})

describe('三种形态的读取结果相同', () => {
  const first: Table = { Open: '打开', Close: '关闭' }
  const second: Table = { Open: '不应覆盖', Edit: '编辑', '': '空原文', Empty: '' }
  const merged = mergeTables([packed(first), second])

  it('合并表含压缩串时不复制：子表数组', () => {
    expect(Array.isArray(merged)).toBe(true)
    expect(merged).toEqual([packed(first), second])
  })

  it('addEntries：先收录者优先，已有的原文不覆盖', () => {
    const expected = [
      ['Open', '打开'],
      ['Close', '关闭'],
      ['Edit', '编辑'],
      ['', '空原文'],
      ['Empty', ''],
    ]
    expect([...mapOf(first, second)]).toEqual(expected)
    expect([...mapOf(packed(first), packed(second))]).toEqual(expected)
    expect([...mapOf(merged)]).toEqual(expected)
    expect([...mapOf({ Open: '已有' }, merged)].slice(0, 2)).toEqual([
      ['Open', '已有'],
      ['Close', '关闭'],
    ])
    expect(mapOf(undefined, packed({}))).toEqual(new Map())
  })

  it('tableEntries：顺序同普通对象合并后的 Object.entries', () => {
    const plain = mergeTables([first, second])
    expect(plain).toEqual({ Open: '打开', Close: '关闭', Edit: '编辑', '': '空原文', Empty: '' })
    expect(tableEntries(merged)).toEqual(Object.entries(plain))
    expect(tableEntries(packed(second))).toEqual(Object.entries(second))
    expect(tableEntries(first)).toEqual(Object.entries(first))
    expect(tableEntries(undefined)).toEqual([])
  })

  it('lookupTable：只查表自身的条目', () => {
    for (const table of [mergeTables([first, second]), merged]) {
      const lookup = lookupTable(table)
      expect(lookup('Open')).toBe('打开')
      expect(lookup('Edit')).toBe('编辑')
      expect(lookup('Empty')).toBe('')
      expect(lookup('constructor')).toBeUndefined()
      expect(lookup('__proto__')).toBeUndefined()
      expect(lookup('Missing')).toBeUndefined()
    }
    expect(lookupTable(undefined)('Open')).toBeUndefined()
  })
})

describe('mergeTables', () => {
  it('子表都是普通对象时合并成新的普通对象，可直接按键读取', () => {
    const a: Table = { A: '甲' }
    const result = mergeTables([a, undefined, { A: '乙', B: '丙' }])
    expect(result).toEqual({ A: '甲', B: '丙' })
    expect(result).not.toBe(a)
    expect(mergeTables([])).toEqual({})
    expect(mergeTables([undefined])).toEqual({})
  })

  it('合并表再合并时展开成一层，只有一张压缩串时直接用它', () => {
    const a = packed({ A: '甲' })
    const b = packed({ B: '乙' })
    const c: Table = { C: '丙' }
    expect(mergeTables([mergeTables([a, c]), b])).toEqual([a, c, b])
    expect(mergeTables([undefined, a])).toBe(a)
    expect(tableEntries(mergeTables([mergeTables([a, c]), mergeTables([b, { A: '不应覆盖' }])]))).toEqual([
      ['A', '甲'],
      ['B', '乙'],
      ['C', '丙'],
    ])
  })

  it('mergeDictionaries：压缩串不复制，同一原文先出现者优先', () => {
    const merged = mergeDictionaries(
      packDictionary({ static: { A: '甲' }, scoped: { S: '一' } }),
      packDictionary({ static: { A: '乙', B: '丙' } }),
    )
    expect(Array.isArray(merged.static)).toBe(true)
    expect(tableEntries(merged.static)).toEqual([
      ['A', '甲'],
      ['B', '丙'],
    ])
    expect(tableEntries(merged.scoped)).toEqual([['S', '一']])
  })
})

describe('matcher 读取压缩串与合并表', () => {
  const bundle: LocaleBundle = [
    ['common', mergeDictionaries({ static: { Open: '打开', Shared: '共享' } }, { static: { Close: '关闭' } })],
    ['common', { static: { Open: '不应覆盖', Star: '星标' } }],
    [
      'repository',
      mergeDictionaries({ scoped: { Open: '仓库-打开' } }, { scoped: { Open: '不应覆盖', Fork: '复刻' } }),
    ],
    ['issues', { scoped: { Open: '未解决', Shared: '议题-共享' }, regexp: [[/^(\d+) open$/, '$1 个未解决']] }],
    ['issues', { scoped: { Open: '不应覆盖', Labels: '标签' } }],
  ]
  /** 构建产物的形态：叶子表压缩成字符串，合并表是子表数组 */
  const packedBundle: LocaleBundle = bundle.map(([key, dict]): readonly [PageKey, PageDictionary] => [
    key,
    {
      ...dict,
      static: dict.static === undefined ? undefined : mergeTables([packed(dict.static)]),
      scoped: dict.scoped === undefined ? undefined : mergeTables([packed(dict.scoped), packed({})]),
    },
  ])
  const custom = { Labels: '自定义标签' }
  const scopes: PageKey[][] = [['common'], ['common', 'repository'], ['common', 'repository', 'issues']]
  const texts = ['Open', 'Close', 'Shared', 'Star', 'Fork', 'Labels', '3 open', 'Missing']

  it('与普通对象的语言包逐条相同：custom > scoped（越具体越优先）> 全局 static > regexp', () => {
    const plain = createMatcher(bundle, { custom })
    const compact = createMatcher(packedBundle, { custom })
    for (const scope of scopes) {
      for (const text of texts)
        expect(compact.translate(text, scope), `${scope.join('|')} ${text}`).toBe(plain.translate(text, scope))
    }
    expect(compact.translate('Open', ['common', 'repository', 'issues'])).toBe('未解决')
    expect(compact.translate('Open', ['common', 'repository'])).toBe('仓库-打开')
    expect(compact.translate('Open', ['common'])).toBe('打开')
    expect(compact.translate('Shared', ['common', 'issues'])).toBe('议题-共享')
    expect(compact.translate('Star', ['common'])).toBe('星标')
    expect(compact.translate('Fork', ['common'])).toBeUndefined()
    expect(compact.translate('Labels', ['common', 'issues'])).toBe('自定义标签')
    expect(compact.translate('3 open', ['common', 'issues'])).toBe('3 个未解决')
  })
})

describe('原文为 __proto__ 的自有条目（只能用计算键写出，插件不压缩这样的表）：各形态、各读取函数结果相同', () => {
  /** 带自有 __proto__ 条目的表 */
  function withProto(value: string, rest: Table = {}): Table {
    return { ['__proto__']: value, ...rest }
  }

  it('前提：计算键写出的是自有条目；对象字面量里直接写 __proto__ 设置的是原型，不是条目', () => {
    expect(Object.keys(withProto('原型条目'))).toEqual(['__proto__'])
    expect(Object.keys({ __proto__: '原型条目' })).toEqual([])
  })

  it('mergeTables 合并普通对象：保留该条目，先出现者优先，条目顺序同 Object.assign 从后往前覆盖，结果仍是普通对象', () => {
    const merged = mergeTables([{ A: '甲' }, withProto('先'), withProto('后', { B: '乙' })])
    expect(Object.getPrototypeOf(merged)).toBe(Object.prototype)
    expect(Object.entries(merged)).toEqual([
      ['__proto__', '先'],
      ['B', '乙'],
      ['A', '甲'],
    ])
    // 把 __proto__ 换成普通原文 P，用 Object.assign 对照顺序
    const assigned = Object.keys(Object.assign({}, { P: '后', B: '乙' }, { P: '先' }, { A: '甲' }))
    expect(Object.keys(merged)).toEqual(assigned.map((key) => (key === 'P' ? '__proto__' : key)))
  })

  it('合并表含压缩串（子表数组）时与普通对象合并的结果相同', () => {
    const plain = mergeTables([withProto('原型条目', { A: '甲' }), { B: '乙' }, withProto('不应覆盖')])
    const compact = mergeTables([withProto('原型条目', { A: '甲' }), packed({ B: '乙' }), withProto('不应覆盖')])
    expect(Array.isArray(compact)).toBe(true)
    expect(tableEntries(compact)).toEqual(Object.entries(plain))
    expect(tableEntries(plain)).toEqual(Object.entries(plain))
    for (const table of [plain, compact]) {
      expect(mapOf(table).get('__proto__')).toBe('原型条目')
      expect(mapOf(table).size).toBe(3)
      expect(lookupTable(table)('__proto__')).toBe('原型条目')
    }
    expect(tableEntries(mergeTables([compact, { C: '丙' }]))).toEqual(Object.entries(mergeTables([plain, { C: '丙' }])))
  })

  it('压缩串含 __proto__ 时同样收录（插件不生成这样的串）；串内原文重复时先出现者优先，与 addEntries 相同', () => {
    const table = packTable([
      ['__proto__', '原型条目'],
      ['A', '甲'],
      ['A', '不应覆盖'],
    ]) as unknown as Table
    expect(tableEntries(table)).toEqual([
      ['__proto__', '原型条目'],
      ['A', '甲'],
    ])
    expect([...mapOf(table)]).toEqual(tableEntries(table))
    expect(lookupTable(table)('__proto__')).toBe('原型条目')
    expect(tableEntries(mergeTables([{ B: '乙' }, table]))).toEqual([
      ['__proto__', '原型条目'],
      ['A', '甲'],
      ['B', '乙'],
    ])
  })

  it('matcher：mergeDictionaries 合并含该条目的表，源码形态与构建产物形态的语言包逐条相同', () => {
    const source: LocaleBundle = [
      [
        'common',
        mergeDictionaries({ static: withProto('原型条目', { Sibling: '同表' }) }, { static: { Open: '打开' } }),
      ],
      ['repository', mergeDictionaries({ scoped: { Fork: '复刻' } }, { scoped: withProto('仓库原型') })],
    ]
    // 构建产物：含 __proto__ 的表不压缩，其余压缩成字符串
    const built: LocaleBundle = [
      [
        'common',
        mergeDictionaries({ static: withProto('原型条目', { Sibling: '同表' }) }, { static: packed({ Open: '打开' }) }),
      ],
      ['repository', mergeDictionaries({ scoped: packed({ Fork: '复刻' }) }, { scoped: withProto('仓库原型') })],
    ]
    const plain = createMatcher(source)
    const compact = createMatcher(built)
    const scopes: PageKey[][] = [['common'], ['common', 'repository']]
    for (const scope of scopes) {
      for (const text of ['__proto__', 'Sibling', 'Open', 'Fork', 'constructor']) {
        expect(compact.translate(text, scope), `${scope.join('|')} ${text}`).toBe(plain.translate(text, scope))
      }
    }
    expect(plain.translate('__proto__', ['common'])).toBe('原型条目')
    expect(plain.translate('__proto__', ['common', 'repository'])).toBe('仓库原型')
  })
})
