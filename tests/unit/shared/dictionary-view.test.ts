import type { LocaleBundle } from '../../../src/core/types'
import { DYNAMIC_TARGET, dictionaryRows, filterDictionaryRows, type DictionaryRow } from '../../../src/shared/dictionary-view'

const closed = (): string => '已关闭'

const BUNDLE: LocaleBundle = [
  [
    'common',
    {
      static: { Code: '代码', Issues: '议题' },
      regexp: [
        [/^(\d+) stars?$/, '$1 个星标'],
        [/^Closed (\d+)$/, closed]
      ],
      labels: { bug: '缺陷' },
      labelDescriptions: { "Something isn't working": '有问题' },
      labelRegexp: [[/^Pull requests that update (.+) code$/, '更新 $1 代码的拉取请求']],
      listNames: { Favorites: '收藏' },
      issueTypes: { Task: '任务' }
    }
  ],
  [
    'repository',
    {
      static: { Code: '源码', Wiki: '维基' },
      scoped: { Code: '仓库代码' },
      inline: [
        ['Opened {} by {}', '由 {} 于 {} 打开'],
        [/^Closed \{\}$/, closed]
      ],
      labels: { bug: '错误', duplicate: '重复' }
    }
  ]
]

/** 行的显示内容（不含搜索用的字段） */
function shown(rows: readonly DictionaryRow[]): Pick<DictionaryRow, 'source' | 'target' | 'page'>[] {
  return rows.map(({ source, target, page }) => (page ? { source, target, page } : { source, target }))
}

describe('内置词库的浏览', () => {
  it('按语言包顺序展开：全局词条、名称区域的词条为全局；页面词条、正则、行内句注明页面类型；译文是函数的显示为「—」', () => {
    expect(shown(dictionaryRows(BUNDLE))).toEqual([
      { source: 'Code', target: '代码' },
      { source: 'Issues', target: '议题' },
      { source: '/^(\\d+) stars?$/', target: '$1 个星标', page: 'common' },
      { source: '/^Closed (\\d+)$/', target: DYNAMIC_TARGET, page: 'common' },
      { source: 'bug', target: '缺陷' },
      { source: "Something isn't working", target: '有问题' },
      { source: '/^Pull requests that update (.+) code$/', target: '更新 $1 代码的拉取请求' },
      { source: 'Favorites', target: '收藏' },
      { source: 'Task', target: '任务' },
      { source: 'Wiki', target: '维基' },
      { source: 'Code', target: '仓库代码', page: 'repository' },
      { source: 'Opened {} by {}', target: '由 {} 于 {} 打开', page: 'repository' },
      { source: '/^Closed \\{\\}$/', target: DYNAMIC_TARGET, page: 'repository' },
      { source: 'duplicate', target: '重复' }
    ])
  })

  it('同一原文：同类的全局表中先收录的生效，只列一条；不同类的表各列一条', () => {
    const rows = dictionaryRows([
      ['common', { static: { bug: '缺陷' }, labels: { bug: '缺陷标签' } }],
      ['issues', { static: { bug: '漏洞' }, labels: { bug: '漏洞标签' } }]
    ])
    expect(shown(rows)).toEqual([
      { source: 'bug', target: '缺陷' },
      { source: 'bug', target: '缺陷标签' }
    ])
  })

  it('空语言包：没有行', () => {
    expect(dictionaryRows([])).toEqual([])
    expect(dictionaryRows([['common', {}]])).toEqual([])
  })

  describe('搜索', () => {
    const rows = dictionaryRows(BUNDLE)

    it('空白：全部', () => {
      expect(filterDictionaryRows(rows, '')).toBe(rows)
      expect(filterDictionaryRows(rows, '  ')).toBe(rows)
    })

    it('按原文、译文、页面类型筛选，不区分大小写', () => {
      expect(filterDictionaryRows(rows, 'CODE').map(row => row.target)).toEqual(['代码', '更新 $1 代码的拉取请求', '仓库代码'])
      expect(filterDictionaryRows(rows, '代码').map(row => row.target)).toEqual(['代码', '更新 $1 代码的拉取请求', '仓库代码'])
      expect(filterDictionaryRows(rows, 'repository').map(row => row.source)).toEqual(['Code', 'Opened {} by {}', '/^Closed \\{\\}$/'])
    })

    it('空白分隔的多个词都要命中', () => {
      expect(filterDictionaryRows(rows, '  code   REPOSITORY ').map(row => row.target)).toEqual(['仓库代码'])
    })

    it('无结果：空列表', () => {
      expect(filterDictionaryRows(rows, 'Sample text')).toEqual([])
    })
  })
})
