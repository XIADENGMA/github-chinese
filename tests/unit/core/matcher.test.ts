import { describe, expect, it } from 'vitest'
import { patternKey } from '../../../src/core/inline-key'
import { applyRule, createMatcher, hasLatin, normalizeText } from '../../../src/core/matcher'
import type { LocaleBundle, PageKey, RegExpRule } from '../../../src/core/types'

const bundle: LocaleBundle = [
  [
    'common',
    {
      static: { Open: '打开', Issues: '议题', Shared: '共享-通用' },
      regexp: [
        [/^(\d+) stars?$/, '$1 个星标'],
        [/^Opened by (.+)$/, (_match, user) => `由 ${user} 打开`],
      ],
      ignore: ['.common-ignore'],
    },
  ],
  ['common', { static: { Open: '不应覆盖', Close: '关闭' } }],
  ['repository', { scoped: { Open: '仓库-打开' }, regexp: [[/^(\d+) forks?$/, '$1 个复刻']] }],
  ['issues', { scoped: { Open: '未解决' }, regexp: [[/^(\d+) stars?$/, '议题页 $1 星']], ignore: ['.issue-ignore'] }],
]

describe('normalizeText / hasLatin', () => {
  it('合并空白（含不换行空格）并去首尾', () => {
    expect(normalizeText('  a \n\t b  c  ')).toBe('a b c')
    expect(hasLatin('中文 1')).toBe(false)
    expect(hasLatin('中文 a')).toBe(true)
  })
})

describe('createMatcher', () => {
  const matcher = createMatcher(bundle, { custom: { ' Issues ': '问题', Empty: '  ', '': 'x' } })

  it('优先级：custom > scoped（越具体越优先）> 全局 static > regexp', () => {
    expect(matcher.translate('Issues', ['common', 'repository', 'issues'])).toBe('问题')
    expect(matcher.translate('Open', ['common', 'repository', 'issues'])).toBe('未解决')
    expect(matcher.translate('Open', ['common', 'repository'])).toBe('仓库-打开')
    expect(matcher.translate('Open', ['common'])).toBe('打开')
    expect(matcher.translate('Close', ['common'])).toBe('关闭')
  })

  it('同一原文的 static 先出现者生效', () => {
    expect(matcher.translate('Open', ['common', 'dashboard'])).toBe('打开')
  })

  it('regexp 按页面类型生效，越具体越优先；支持函数替换', () => {
    expect(matcher.translate('3 stars', ['common'])).toBe('3 个星标')
    expect(matcher.translate('3 stars', ['common', 'repository', 'issues'])).toBe('议题页 3 星')
    expect(matcher.translate('2 forks', ['common'])).toBeUndefined()
    expect(matcher.translate('2 forks', ['common', 'repository'])).toBe('2 个复刻')
    expect(matcher.translate('Opened by octocat', ['common'])).toBe('由 octocat 打开')
  })

  it('替换函数抛错时视为未命中，继续尝试后面的规则', () => {
    const throwing = createMatcher([
      [
        'common',
        {
          regexp: [
            [
              /^boom (\d+)$/,
              () => {
                throw new RangeError('boom')
              },
            ],
            [/^boom (\d+)$/, (_match, n) => `爆炸 ${n}`],
            [
              /^only (\d+)$/,
              () => {
                throw new Error('only')
              },
            ],
          ],
        },
      ],
    ])
    expect(throwing.translate('boom 1', ['common'])).toBe('爆炸 1')
    expect(throwing.translate('only 1', ['common'])).toBeUndefined()
  })

  it('替换函数查表误中原型链键时视为未命中；原文本身带同样字样时照常', () => {
    const states: Readonly<Record<string, string>> = { Open: '打开' }
    const rule: RegExpRule = [/^State: (.+)$/, (_match, name) => `状态：${states[name] ?? name}`]
    const leaky = createMatcher([
      ['common', { regexp: [rule], inline: [['{} is {}', () => `是${String(Object.getPrototypeOf(states))}`]] }],
    ])
    expect(leaky.translate('State: Open', ['common'])).toBe('状态：打开')
    for (const key of ['constructor', 'toString', 'valueOf', 'hasOwnProperty', '__proto__']) {
      expect(leaky.translate(`State: ${key}`, ['common'])).toBeUndefined()
      // 属性规则同样经 applyRule
      expect(applyRule(`State: ${key}`, rule)).toBeUndefined()
    }
    expect(leaky.translate('State: [object Object]', ['common'])).toBe('状态：[object Object]')
    expect(leaky.translateInline(patternKey('{} is {}'), ['common'])).toBeUndefined()
  })

  it('空值自定义词条被丢弃；无英文或空串不匹配', () => {
    expect(matcher.translate('Empty', ['common'])).toBeUndefined()
    expect(matcher.translate('', ['common'])).toBeUndefined()
    expect(matcher.translate('中文', ['common'])).toBeUndefined()
  })

  it('translateRaw 保留首尾空白，未命中返回 undefined', () => {
    expect(matcher.translateRaw('\n  Close  ', ['common'])).toBe('\n  关闭  ')
    expect(matcher.translateRaw('  Not here ', ['common'])).toBeUndefined()
  })

  it('translateRaw：译文那一端是全角标点时不保留原文的空白', () => {
    const punct = createMatcher([
      ['common', { static: { 'Tip:': '提示：', '(optional)': '（可选）', Done: '完成', '— Done': '——完成' } }],
    ])
    expect(punct.translateRaw('Tip: ', ['common'])).toBe('提示：')
    expect(punct.translateRaw(' (optional) ', ['common'])).toBe('（可选）')
    expect(punct.translateRaw(' Done ', ['common'])).toBe(' 完成 ')
    expect(punct.translateRaw(' — Done ', ['common'])).toBe('——完成 ')
  })

  it('缓存命中与未命中结果，超出上限后清空仍正确', () => {
    const small = createMatcher(bundle, { maxCacheSize: 2 })
    for (let i = 0; i < 5; i++) {
      expect(small.translate('Open', ['common'])).toBe('打开')
      expect(small.translate(`${i} stars`, ['common'])).toBe(`${i} 个星标`)
      expect(small.translate('Missing', ['common'])).toBeUndefined()
    }
  })

  it('ignoreSelectors 按页面类型合并', () => {
    expect(matcher.ignoreSelectors(['common'])).toEqual(['.common-ignore'])
    expect(matcher.ignoreSelectors(['common', 'repository', 'issues'])).toEqual(['.common-ignore', '.issue-ignore'])
  })

  it('attributeRules：按页面范围合并，越具体的页面类型越靠前', () => {
    const general = ['a', 'title', /^(.+)$/, '通用'] as const
    const specific = ['a', 'title', /^(.+)$/, '具体'] as const
    const rules = createMatcher([
      ['common', { attributeRules: [general] }],
      ['issues', { attributeRules: [specific] }],
    ])
    expect(rules.attributeRules(['common'])).toEqual([general])
    expect(rules.attributeRules(['common', 'repository', 'issues'])).toEqual([specific, general])
    expect(rules.attributeRules(['common', 'pulls'])).toEqual([general])
  })

  it('translateInline：越具体的页面类型越优先；字符串句型先于正则句型；{} 句型也匹配数字槽位', () => {
    const inline = createMatcher([
      [
        'common',
        {
          inline: [
            ['Are you sure you want to unblock {} from {}?', '确定要取消阻止 {} 访问 {} 吗？'],
            ['{} merged', '{} 合并了'],
            [/^\{\} published \{\} \{\}$/, '{} 发布了 {} {}'],
            [/^Allow this (GitHub|OAuth) App via the \{\}\.$/, '允许此 $1 应用通过 {}。'],
            ['{} boom', () => '爆炸 {}'],
            [
              '{} fail',
              () => {
                throw new Error('fail')
              },
            ],
          ],
        },
      ],
      ['pulls', { inline: [['{#} merged', '{#} 个已合并']] }],
    ])
    const key = patternKey
    expect(inline.translateInline(key('Are you sure you want to unblock {} from {}?'), ['common'])).toBe(
      '确定要取消阻止 {} 访问 {} 吗？',
    )
    expect(inline.translateInline(key('{#} merged'), ['common'])).toBe('{} 合并了')
    expect(inline.translateInline(key('{#} merged'), ['common', 'repository', 'pulls'])).toBe('{#} 个已合并')
    expect(inline.translateInline(key('{} merged'), ['common', 'repository', 'pulls'])).toBe('{} 合并了')
    expect(inline.translateInline(key('{} published {} {}'), ['common'])).toBe('{} 发布了 {} {}')
    expect(inline.translateInline(key('Allow this OAuth App via the {}.'), ['common'])).toBe(
      '允许此 OAuth 应用通过 {}。',
    )
    expect(inline.translateInline(key('{} boom'), ['common'])).toBe('爆炸 {}')
    expect(inline.translateInline(key('{} fail'), ['common'])).toBeUndefined()
    expect(inline.translateInline(key('{} unknown'), ['common'])).toBeUndefined()
    expect(inline.translateInline(key('{} {}'), ['common'])).toBeUndefined()
    expect(inline.hasInline(['common'])).toBe(true)
    expect(createMatcher(bundle).hasInline(['common', 'repository', 'issues'])).toBe(false)
  })

  it('translateInline：同一页面类型先查字符串句型；同一句型先收录的生效；只有正则句型也算有规则', () => {
    const inline = createMatcher([
      [
        'common',
        {
          inline: [
            [/^\{\} merged$/, '正则 {}'],
            ['{} merged', '{} 合并了'],
            ['{} merged', '{} 重复'],
          ],
        },
      ],
      ['issues', { inline: [[/^\{\} closed$/, '{} 已关闭']] }],
    ])
    expect(inline.translateInline(patternKey('{} merged'), ['common'])).toBe('{} 合并了')
    expect(inline.hasInline(['common', 'repository', 'issues'])).toBe(true)
    expect(createMatcher([['issues', { inline: [[/^\{\} closed$/, '{} 已关闭']] }]]).hasInline(['issues'])).toBe(true)
  })

  it('translateInline：句型键没有英文字母时不匹配，即使正则句型能对上', () => {
    const inline = createMatcher([['common', { inline: [[/^\{\} (?:and|&) \{\}$/, '{} 和 {}']] }]])
    expect(inline.translateInline(patternKey('{} and {}'), ['common'])).toBe('{} 和 {}')
    expect(inline.translateInline(patternKey('{} & {}'), ['common'])).toBeUndefined()
    expect(inline.translateInline(patternKey('{#} & {#}'), ['common'])).toBeUndefined()
  })

  it('translateInline：混用 {#} 与 {} 的字符串句型，{} 处也对应数字槽位', () => {
    const inline = createMatcher([
      [
        'common',
        {
          inline: [
            ['{#} of {} checks passed', '{}/{} 项检查通过'],
            ['{} pushed {#} commits', '{} 推送了 {} 个提交'],
          ],
        },
      ],
    ])
    const key = patternKey
    expect(inline.translateInline(key('{#} of {} checks passed'), ['common'])).toBe('{}/{} 项检查通过')
    expect(inline.translateInline(key('{#} of {#} checks passed'), ['common'])).toBe('{}/{} 项检查通过')
    expect(inline.translateInline(key('{} of {#} checks passed'), ['common'])).toBeUndefined()
    expect(inline.translateInline(key('{} pushed {#} commits'), ['common'])).toBe('{} 推送了 {} 个提交')
    expect(inline.translateInline(key('{#} pushed {#} commits'), ['common'])).toBe('{} 推送了 {} 个提交')
    expect(inline.translateInline(key('{#} pushed {} commits'), ['common'])).toBeUndefined()
  })

  it('translateInline：同一页面类型的字符串句型，对上的 {#} 越多越优先，同样多时先收录的生效；替换函数出错时接着试', () => {
    const inline = createMatcher([
      [
        'common',
        {
          inline: [
            ['{} of {}', '{} 之 {}'],
            ['{#} of {}', '数字 {} 之 {}'],
            ['{} of {#}', '{} 之数字 {}'],
            ['{} merged', '{} 合并了'],
            [
              '{#} merged',
              () => {
                throw new Error('merged')
              },
            ],
          ],
        },
      ],
    ])
    const key = patternKey
    expect(inline.translateInline(key('{} of {}'), ['common'])).toBe('{} 之 {}')
    expect(inline.translateInline(key('{} of {#}'), ['common'])).toBe('{} 之数字 {}')
    expect(inline.translateInline(key('{#} of {#}'), ['common'])).toBe('数字 {} 之 {}')
    expect(inline.translateInline(key('{#} merged'), ['common'])).toBe('{} 合并了')
  })

  it('mergeSelectors 按页面类型合并', () => {
    const merging = createMatcher([
      ['common', { mergeText: ['.month'] }],
      ['issues', { mergeText: ['.remaining'] }],
    ])
    expect(merging.mergeSelectors(['common'])).toEqual(['.month'])
    expect(merging.mergeSelectors(['common', 'repository', 'issues'])).toEqual(['.month', '.remaining'])
  })
})

describe('多句文本按句翻译', () => {
  const sentences = createMatcher([
    [
      'common',
      {
        static: {
          'Domain is not a valid public domain.': '域不是有效的公共域名。',
          'Domain is not properly formatted.': '域格式不正确。',
          'Something went wrong.': '出错了。',
          'Please try again.': '请重试。',
          'Something went wrong. Please try again.': '整段译文',
          'Saved.': '已保存',
          'Saved!': '已保存！',
          'Are you sure?': '确定吗？',
          'Loading...': '加载中...',
        },
        regexp: [[/^(\d+) errors?\.$/, '$1 个错误。']],
      },
    ],
  ])
  const translate = (text: string): string | undefined => sentences.translate(text, ['common'])

  it('每句都有词条时拼成一段，服务器拼接时多出的句点一并去掉', () => {
    const joined = '域不是有效的公共域名。域格式不正确。'
    expect(translate('Domain is not a valid public domain.. Domain is not properly formatted.')).toBe(joined)
    expect(translate('Domain is not a valid public domain. Domain is not properly formatted.')).toBe(joined)
    expect(translate('3 errors. Domain is not properly formatted.')).toBe('3 个错误。域格式不正确。')
  })

  it('! ? 后多出的句点同样去掉；省略号照原样查词条', () => {
    expect(translate('Saved!. Domain is not properly formatted.')).toBe('已保存！域格式不正确。')
    expect(translate('Are you sure?. Domain is not properly formatted.')).toBe('确定吗？域格式不正确。')
    expect(translate('Loading... Please try again.')).toBe('加载中... 请重试。')
  })

  it('整段有词条时用整段译文', () => {
    expect(translate('Something went wrong. Please try again.')).toBe('整段译文')
  })

  it('前一句译文不以全角标点结尾时隔一个空格；translateRaw 保留首尾空白', () => {
    expect(translate('Saved. Domain is not properly formatted.')).toBe('已保存 域格式不正确。')
    expect(sentences.translateRaw('  Saved. Saved.\n', ['common'])).toBe('  已保存 已保存\n')
  })

  it('有一句没有词条、下一句不以大写字母开头或句数超过上限时不翻译', () => {
    expect(translate('Domain is not properly formatted. Name is unknown.')).toBeUndefined()
    expect(translate('Saved. saved.')).toBeUndefined()
    expect(translate(Array(6).fill('Saved.').join(' '))).toBe(Array(6).fill('已保存').join(' '))
    expect(translate(Array(7).fill('Saved.').join(' '))).toBeUndefined()
  })
})

describe('名称表、说明表与标签正则（translateLabel）', () => {
  const ECOSYSTEM: RegExpRule = [/^Pull requests that update ([\w.#+ -]{1,40}) code$/, '更新 $1 代码的拉取请求']
  const labelBundle: LocaleBundle = [
    ['common', { static: { Open: '打开' } }],
    [
      'issues',
      {
        labels: { bug: '缺陷', 'help wanted': '需要帮助' },
        labelDescriptions: { 'Good for newcomers': '适合新手' },
        labelRegexp: [ECOSYSTEM],
      },
    ],
    [
      'pulls',
      {
        labels: { bug: '错误', question: '疑问' },
        labelDescriptions: { 'Good for newcomers': '后收录', 'Further information is requested': '需要更多信息' },
        labelRegexp: [[/^Pull requests that update (.+)$/, '后收录']],
      },
    ],
  ]
  const labels = createMatcher(labelBundle)

  it('全局生效，不分页面类型；同一原文先收录的生效；标签正则按收录顺序，首个命中生效', () => {
    expect(labels.translateLabel('bug', 'name')).toBe('缺陷')
    expect(labels.translateLabel('question', 'name')).toBe('疑问')
    expect(labels.translateLabel('Good for newcomers', 'description')).toBe('适合新手')
    expect(labels.translateLabel('Further information is requested', 'description')).toBe('需要更多信息')
    expect(labels.translateLabel('Pull requests that update Javascript code', 'description')).toBe(
      '更新 Javascript 代码的拉取请求',
    )
    expect(labels.translateLabel('Pull requests that update GitHub Actions code', 'description')).toBe(
      '更新 GitHub Actions 代码的拉取请求',
    )
    expect(labels.translateLabel('Pull requests that update docs', 'description')).toBe('后收录')
    expect(labels.hasLabels()).toBe(true)
  })

  it('名称只查名称表，说明只查说明表与标签正则', () => {
    expect(labels.translateLabel('bug', 'description')).toBeUndefined()
    expect(labels.translateLabel('help wanted', 'description')).toBeUndefined()
    expect(labels.translateLabel('Good for newcomers', 'name')).toBeUndefined()
    expect(labels.translateLabel('Pull requests that update Javascript code', 'name')).toBeUndefined()
  })

  it('整段、区分大小写匹配；首尾空白照原文保留，中间空白规范化', () => {
    expect(labels.translateLabel('\n    help   wanted\n', 'name')).toBe('\n    需要帮助\n')
    expect(labels.translateLabel('  Good  for newcomers ', 'description')).toBe('  适合新手 ')
    for (const source of ['Bug', 'BUG', 'bug report', '🐞 bug', 'scope: vapor', 'Help wanted', '缺陷', '']) {
      expect(labels.translateLabel(source, 'name'), source).toBeUndefined()
      expect(labels.translateLabel(source, 'description'), source).toBeUndefined()
    }
  })

  it('不进 static / scoped / regexp：translate 照常查词条，名称表、说明表与标签正则不参与', () => {
    for (const scope of [['common'], ['common', 'repository', 'issues'], ['common', 'repository', 'pulls']]) {
      expect(labels.translate('bug', scope as PageKey[])).toBeUndefined()
      expect(labels.translate('Good for newcomers', scope as PageKey[])).toBeUndefined()
      expect(labels.translate('Pull requests that update Javascript code', scope as PageKey[])).toBeUndefined()
    }
    expect(labels.translateLabel('Open', 'name')).toBeUndefined()
    expect(labels.translateLabel('Open', 'description')).toBeUndefined()
  })

  it('自定义词条不参与标签区域（与属性规则写入的无障碍名称一致，都按语言包），区域外照常生效', () => {
    const custom = createMatcher(labelBundle, {
      custom: {
        bug: '程序缺陷',
        'scope: vapor': '范围',
        'Good for newcomers': '新手友好',
        'Pull requests that update Ruby code': '更新 Ruby 依赖',
      },
    })
    expect(custom.translateLabel(' bug ', 'name')).toBe(' 缺陷 ')
    expect(custom.translateLabel('Good for newcomers', 'description')).toBe('适合新手')
    expect(custom.translateLabel('Pull requests that update Ruby code', 'description')).toBe('更新 Ruby 代码的拉取请求')
    expect(custom.translateLabel('scope: vapor', 'name')).toBeUndefined()
    expect(custom.translate('bug', ['common'])).toBe('程序缺陷')
    expect(custom.translate('scope: vapor', ['common'])).toBe('范围')
  })

  it('没有名称表、说明表与标签正则时不判断；只有说明表或标签正则时也算有', () => {
    const none = createMatcher([['common', { static: { bug: '缺陷' } }]])
    expect(none.hasLabels()).toBe(false)
    expect(none.translateLabel('bug', 'name')).toBeUndefined()
    const rulesOnly = createMatcher([['common', { labelRegexp: [ECOSYSTEM] }]])
    expect(rulesOnly.hasLabels()).toBe(true)
    expect(rulesOnly.translateLabel('Pull requests that update python code', 'description')).toBe(
      '更新 python 代码的拉取请求',
    )
    expect(rulesOnly.translateLabel('bug', 'name')).toBeUndefined()
    const descriptionsOnly = createMatcher([['common', { labelDescriptions: { 'Good for newcomers': '适合新手' } }]])
    expect(descriptionsOnly.hasLabels()).toBe(true)
    expect(descriptionsOnly.translateLabel('Good for newcomers', 'description')).toBe('适合新手')
  })

  describe('星标列表的预置名称（listNames）', () => {
    const lists = createMatcher([
      ['common', { static: { '✨ Inspiration': '✨ 灵感' }, labels: { bug: '缺陷' } }],
      ['profile', { listNames: { '✨ Inspiration': '✨ 灵感', '🚀 My stack': '🚀 我的技术栈' } }],
      ['explore', { listNames: { '🚀 My stack': '后收录' } }],
    ])

    it('全局生效，同一原文先收录的生效；整段、区分大小写匹配，首尾空白照原文保留', () => {
      expect(lists.translateLabel('✨ Inspiration', 'list')).toBe('✨ 灵感')
      expect(lists.translateLabel('\n  🚀 My  stack\n', 'list')).toBe('\n  🚀 我的技术栈\n')
      for (const source of ['Inspiration', '✨ inspiration', '✨ Inspiration!', '🔮 Future ideas', '']) {
        expect(lists.translateLabel(source, 'list'), source).toBeUndefined()
      }
    })

    it('只用于列表名：标签名称、说明区域不查列表名，列表名区域不查名称表、static', () => {
      expect(lists.translateLabel('✨ Inspiration', 'name')).toBeUndefined()
      expect(lists.translateLabel('✨ Inspiration', 'description')).toBeUndefined()
      expect(lists.translateLabel('bug', 'list')).toBeUndefined()
      expect(lists.translateLabel('bug', 'name')).toBe('缺陷')
      // 区域外照常查 static
      expect(lists.translate('✨ Inspiration', ['common', 'profile'])).toBe('✨ 灵感')
      expect(lists.translate('🚀 My stack', ['common', 'profile'])).toBeUndefined()
    })

    it('只有列表名表时也算有名称表；自定义词条不参与', () => {
      const only = createMatcher([['profile', { listNames: { '✨ Inspiration': '✨ 灵感' } }]], {
        custom: { '✨ Inspiration': '灵感集' },
      })
      expect(only.hasLabels()).toBe(true)
      expect(only.translateLabel('✨ Inspiration', 'list')).toBe('✨ 灵感')
      expect(only.translate('✨ Inspiration', ['common'])).toBe('灵感集')
    })
  })

  describe('默认议题类型的名称（issueTypes）', () => {
    const types = createMatcher([
      ['common', { static: { Feature: '特性' }, labels: { bug: '缺陷' } }],
      ['issues', { issueTypes: { Task: '任务', Bug: '缺陷' } }],
      ['org-settings', { issueTypes: { Bug: '后收录', Feature: '功能' } }],
    ])

    it('全局生效，同一原文先收录的生效；整段、区分大小写匹配，首尾空白照原文保留', () => {
      expect(types.translateLabel('Bug', 'type')).toBe('缺陷')
      expect(types.translateLabel(' Feature\n', 'type')).toBe(' 功能\n')
      for (const source of ['bug', 'Epic', 'Bug!', '']) {
        expect(types.translateLabel(source, 'type'), source).toBeUndefined()
      }
    })

    it('只用于类型名称区域：其他区域不查类型名，类型名称区域不查名称表、static', () => {
      expect(types.translateLabel('Bug', 'name')).toBeUndefined()
      expect(types.translateLabel('Task', 'list')).toBeUndefined()
      expect(types.translateLabel('Task', 'description')).toBeUndefined()
      expect(types.translateLabel('bug', 'type')).toBeUndefined()
      // 区域外照常查 static
      expect(types.translate('Feature', ['common', 'issues'])).toBe('特性')
      expect(types.translate('Task', ['common', 'issues'])).toBeUndefined()
    })

    it('只有类型名表时也算有名称表', () => {
      expect(createMatcher([['issues', { issueTypes: { Task: '任务' } }]]).hasLabels()).toBe(true)
    })
  })
})
