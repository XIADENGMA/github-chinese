import { describe, expect, it } from 'vitest'
import { createMatcher } from '../../../src/core/matcher'
import { createRegExpIndex, hasTopLevelAlternative, headSet, literalPrefix } from '../../../src/core/regexp-index'
import type { RegExpRule } from '../../../src/core/types'

const sorted = (set: ReadonlySet<string> | undefined): string[] | undefined => (set ? [...set].sort() : undefined)
const DIGITS = [...'0123456789']

describe('headSet', () => {
  it.each<[RegExp, string[]]>([
    [/^Open (\d+)$/, ['O']],
    [/^(\d+) comments?$/, DIGITS],
    [/^\d+$/, DIGITS],
    [/^(?:Open|Closed) issues$/, ['C', 'O']],
    [/^(?<state>Merged|Closed)$/, ['C', 'M']],
    [/^((?:Open|Draft) by) (.+)$/, ['D', 'O']],
    [/^open$/i, ['O', 'o']],
    [/^\.(.+)$/, ['.']],
    [/^· (.+)$/, ['·']],
    [/^\x41b$/, ['A']],
    [/^[A-C]x$/, ['A', 'B', 'C']],
    [/^[a-b]x$/i, ['A', 'B', 'a', 'b']],
    [/^[\d.]+$/, ['.', ...DIGITS].sort()],
    [/^[-a]$/, ['-', 'a']],
    [/^(?:ab)+c$/, ['a']],
    [/^a+?b$/, ['a']],
    // 下限 1：必有
    [/^a{01}b$/, ['a']],
    // 未闭合的 {0 是普通字符，不是量词
    [new RegExp('^a{0b$'), ['a']],
    // 字符类里的括号不算分组
    [/^([)(]|x)y$/, ['(', ')', 'x']]
  ])('%s → 首字符集合', (pattern, expected) => {
    expect(sorted(headSet(pattern))).toEqual([...expected].sort())
  })

  it.each([
    /^./,
    /^(.+) opened$/,
    /^\w+$/,
    /^\s/,
    /^\S+ x$/,
    /^[^a]x$/,
    /^[\w-]+$/,
    new RegExp('^[]x'),
    /^(?=A)A$/,
    /^(?!A)./,
    /^(?<=x)y/,
    /^(?:)x$/,
    /^(?:a|)b$/,
    /^a?b$/,
    /^a*b$/,
    // 下限为 0 的 {n,m}，可带前导零
    /^a{0,2}b$/,
    /^a{0}b$/,
    /^a{00}b$/,
    /^a{00,}b$/,
    /^a{000,1}b$/,
    /^(?:x){00}b$/,
    /^a{00}?b$/,
    /^(?:a)?b$/,
    /^[ab]?c$/,
    // 断言、反向引用、\0、修饰符分组
    /^\bx/,
    new RegExp('^\\1x'),
    /^\0x/,
    new RegExp('^(?i:a)b'),
    new RegExp('^(?-i:a)b', 'i'),
    /^Foo|^Bar/,
    /^x/m,
    /^x/u,
    /^é/i,
    /Open$/,
    /^$/
  ])('%s → 推不出（wild）', pattern => {
    expect(headSet(pattern)).toBeUndefined()
  })
})

describe('hasTopLevelAlternative', () => {
  it.each([/[|]/, /\|/, /[\]|]/, /(?<=a|b)c/, /[)](a|b)/, /(a|b)/])('%s → 无顶层 |', pattern => {
    expect(hasTopLevelAlternative(pattern)).toBe(false)
  })

  it.each([new RegExp('[]|a'), /[^]|a/, /\\|a/, /\[|\]/, /[(]a|b/, /^a|b$/])('%s → 有顶层 |', pattern => {
    expect(hasTopLevelAlternative(pattern)).toBe(true)
  })
})

describe('literalPrefix', () => {
  it.each<[RegExp, string]>([
    [/^Open$/, 'Open'],
    [/^Foo (\d+)$/, 'Foo '],
    [/^Foo?$/, 'Fo'],
    [/^Fo+$/, 'Fo'],
    [/^\.x$/, '.x'],
    [/^a{2}$/, ''],
    [/^(?:x)$/, ''],
    [/^\d+$/, ''],
    [/^Open$/i, ''],
    [/^Foo|^Bar/, ''],
    [/Open$/, '']
  ])('%s → %j', (pattern, expected) => {
    expect(literalPrefix(pattern)).toBe(expected)
  })
})

describe('createRegExpIndex', () => {
  const rules: RegExpRule[] = [
    [/^(.+) wild one$/, 'A'],
    [/^Open (.+)$/, 'B'],
    [/^\w+ wild two$/, 'C'],
    [/^Closed (.+)$/, 'D'],
    [/^Order (.+)$/, 'E']
  ]
  const names = (text: string): string[] =>
    createRegExpIndex(rules)
      .candidates(text)
      .map(({ rule }) => rule[1] as string)

  it('按首字符取候选，wild 规则交错其中，保持原顺序', () => {
    expect(names('Open issue')).toEqual(['A', 'B', 'C', 'E'])
    expect(names('Closed issue')).toEqual(['A', 'C', 'D'])
  })

  it('没有对应首字符时只取 wild', () => {
    expect(names('zzz')).toEqual(['A', 'C'])
    expect(names('')).toEqual(['A', 'C'])
  })

  it('同一首字符的候选只合并一次', () => {
    const index = createRegExpIndex(rules)
    expect(index.candidates('Open a')).toBe(index.candidates('Order b'))
  })
})

/** 统计 exec 次数的正则 */
class CountingRegExp extends RegExp {
  calls = 0

  override exec(text: string): RegExpExecArray | null {
    this.calls += 1
    return super.exec(text)
  }
}

describe('匹配器使用索引', () => {
  it('结果与逐条执行一致；首字符、字面前缀不符的规则不执行', () => {
    const wild = new CountingRegExp('^(.+) items?$')
    const open = new CountingRegExp('^Open (\\d+)$')
    const opened = new CountingRegExp('^Opened by (.+)$')
    const closed = new CountingRegExp('^Closed (\\d+)$')
    const matcher = createMatcher([
      [
        'common',
        {
          // 函数替换：只调用一次 exec（字符串替换会再经 replace 执行一次）
          regexp: [
            [wild, (_, what) => `${what} 项`],
            [open, (_, count) => `${count} 个打开`],
            [opened, (_, user) => `由 ${user} 打开`],
            [closed, (_, count) => `${count} 个关闭`]
          ]
        }
      ]
    ])
    expect(matcher.translate('Open 3', ['common'])).toBe('3 个打开')
    expect(matcher.translate('Opened by octocat', ['common'])).toBe('由 octocat 打开')
    expect(matcher.translate('Closed 2', ['common'])).toBe('2 个关闭')
    expect(matcher.translate('Five items', ['common'])).toBe('Five 项')
    expect(matcher.translate('Nothing here', ['common'])).toBeUndefined()
    // wild 每次都试；^Open (\d+)$ 的字面前缀是「Open 」，Opened by 开头的不试；其余按首字符只试一次
    expect(wild.calls).toBe(5)
    expect(open.calls).toBe(1)
    expect(opened.calls).toBe(1)
    expect(closed.calls).toBe(1)
  })

  it('同一页面类型的多个词典合并后再建索引；作用域从具体到通用', () => {
    const matcher = createMatcher([
      ['common', { regexp: [[/^Open (\d+)$/, '通用 $1']] }],
      ['issues', { regexp: [[/^Open (\d+)$/, '议题 $1']] }],
      ['issues', { regexp: [[/^Closed (\d+)$/, '已关闭 $1']] }]
    ])
    expect(matcher.translate('Open 1', ['common', 'issues'])).toBe('议题 1')
    expect(matcher.translate('Closed 2', ['common', 'issues'])).toBe('已关闭 2')
    expect(matcher.translate('Open 1', ['common'])).toBe('通用 1')
  })

  it('首原子可省略（{00}）时不按首字符跳过，不由后面的规则误译', () => {
    const matcher = createMatcher([
      [
        'common',
        {
          regexp: [
            [/^(?:New ){00}Open (\d+)$/, '打开 $1'],
            [/^(.+) (\d+)$/, '其他 $2']
          ]
        }
      ]
    ])
    expect(matcher.translate('Open 3', ['common'])).toBe('打开 3')
  })

  it('首原子可省略（{00}）时不按首字符跳过，不由更通用作用域的规则误译', () => {
    const matcher = createMatcher([
      ['common', { regexp: [[/^Open (\d+)$/, '通用 $1']] }],
      ['issues', { regexp: [[/^(?:New ){00}Open (\d+)$/, '甲 $1']] }]
    ])
    expect(matcher.translate('Open 3', ['common', 'issues'])).toBe('甲 3')
  })
})
