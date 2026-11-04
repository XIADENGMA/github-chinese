import { describe, expect, it } from 'vitest'
import { BUILTIN_SOURCES, MAX_CUSTOM_SOURCES, parseDownloadLink, parseImageUrl, type AccelerableLink } from '../../../src/shared/accelerate'
import {
  addCategory,
  addSource,
  BUILTIN_CATEGORIES,
  categoryCandidates,
  categoryName,
  categoryUrl,
  countRemovedBuiltins,
  findCategory,
  LEGACY_CATEGORY_ID,
  listCategories,
  listSources,
  MAX_CUSTOM_CATEGORIES,
  moveCategory,
  pickSource,
  removeCategory,
  removeSource,
  removeSources,
  renameCategory,
  replacementCategory,
  restoreBuiltins,
  sanitizeAccelerateSettings,
  sanitizeCategories,
  sanitizeCustomSources,
  setCategoryAutoHide,
  type AccelerateCategory,
  type AccelerateSettings,
  type CustomSource,
  type LabelText
} from '../../../src/shared/accelerate-categories'

const RELEASE = 'https://github.com/vuejs/core/releases/download/v3.5.0/vue.global.js'
const GIST = 'https://gist.github.com/octocat/0831f3fbd83ac4d46451/archive/c197afe.zip'
const TIME = Date.UTC(2026, 0, 1)

const label: LabelText = key => (key === 'otherCategory' ? '其他' : '自定义')

function link(href: string): AccelerableLink {
  const parsed = parseDownloadLink(href)
  if (!parsed) throw new Error(`不可加速：${href}`)
  return parsed
}

function settingsWith(overrides: Partial<AccelerateSettings> = {}): AccelerateSettings {
  return {
    categories: [],
    categoryOrder: [],
    removedCategories: [],
    customSources: [],
    removedSources: [],
    replaceCategory: '',
    ...overrides
  }
}

function category(settings: AccelerateSettings, id: string): AccelerateCategory {
  const found = findCategory(settings, id)
  if (!found) throw new Error(`没有分类：${id}`)
  return found
}

const ids = (items: readonly { readonly id: string }[]): string[] => items.map(item => item.id)

const MIRROR: CustomSource = { id: 'custom-1', name: 'Mirror', template: 'https://mirror.example/{url}', category: 'custom' }
const TEAM = { id: 'category-1', name: 'Team' }

describe('内置分类', () => {
  it('每个内置源恰好属于一个内置分类，标识不重复；有「自定义」分类', () => {
    const all = BUILTIN_CATEGORIES.flatMap(item => item.sources)
    expect([...all].sort()).toEqual(ids(BUILTIN_SOURCES).sort())
    expect(new Set(ids(BUILTIN_CATEGORIES)).size).toBe(BUILTIN_CATEGORIES.length)
    expect(ids(BUILTIN_CATEGORIES)).toContain(LEGACY_CATEGORY_ID)
  })
})

describe('listCategories / listSources', () => {
  it('默认：内置分类按内置顺序，自动隐藏开启；以文案为名称的带 label', () => {
    const list = listCategories(settingsWith())
    expect(ids(list)).toEqual(['gh-proxy', 'ghfast', 'wget-la', 'other', 'custom'])
    expect(list.every(item => item.builtin && item.autoHide)).toBe(true)
    expect(list.map(item => categoryName(item, label))).toEqual(['gh-proxy', 'ghfast', 'wget.la', '其他', '自定义'])
    expect(ids(category(settingsWith(), 'gh-proxy').sources)).toEqual(['gh-proxy-hk', 'gh-proxy-cdn', 'gh-proxy-edgeone', 'gh-proxy-com'])
  })

  it('已删除的分类、内置源不列出；自定义源排在所属分类的内置源之后，自定义分类排在最后', () => {
    const settings = settingsWith({
      categories: [TEAM, { id: 'other', name: '备用', autoHide: false }],
      removedCategories: ['wget-la'],
      removedSources: ['gh-proxy-cdn'],
      customSources: [
        { ...MIRROR, category: 'gh-proxy' },
        { id: 'custom-2', name: 'Team', template: 'https://team.example/{url}', category: 'category-1' }
      ]
    })
    const list = listCategories(settings)
    expect(ids(list)).toEqual(['gh-proxy', 'ghfast', 'other', 'custom', 'category-1'])
    expect(ids(category(settings, 'gh-proxy').sources)).toEqual(['gh-proxy-hk', 'gh-proxy-edgeone', 'gh-proxy-com', 'custom-1'])
    expect(category(settings, 'gh-proxy').sources[3]).toEqual({ id: 'custom-1', name: 'Mirror', template: 'https://mirror.example/{url}' })
    expect(category(settings, 'other')).toMatchObject({ name: '备用', autoHide: false, builtin: true })
    expect(category(settings, 'other').label).toBeUndefined()
    expect(category(settings, 'category-1')).toMatchObject({ name: 'Team', builtin: false, autoHide: true })
    expect(ids(listSources(settings))).toEqual([
      'gh-proxy-hk',
      'gh-proxy-edgeone',
      'gh-proxy-com',
      'custom-1',
      'ghfast',
      'gh-monlor',
      'hub-ddayh',
      'ghproxy-053000',
      'custom-2'
    ])
  })
})

describe('replacementCategory', () => {
  it('不替换、分类已删除或不存在时没有', () => {
    expect(replacementCategory(settingsWith())).toBeUndefined()
    expect(replacementCategory(settingsWith({ replaceCategory: 'ghfast', removedCategories: ['ghfast'] }))).toBeUndefined()
    expect(replacementCategory(settingsWith({ replaceCategory: 'gone' }))).toBeUndefined()
    expect(replacementCategory(settingsWith({ replaceCategory: 'ghfast' }))?.id).toBe('ghfast')
  })
})

describe('categoryCandidates / pickSource / categoryUrl', () => {
  const ghProxy = category(settingsWith(), 'gh-proxy')

  it('候选只留支持该地址的，顺序不变', () => {
    expect(categoryCandidates(ghProxy, link(GIST))).toEqual([])
    expect(
      ids(categoryCandidates(category(settingsWith(), 'other'), parseImageUrl('https://avatars.githubusercontent.com/u/583231?v=4')!))
    ).toEqual([])
    expect(ids(categoryCandidates(ghProxy, link(RELEASE)))).toEqual(['gh-proxy-hk', 'gh-proxy-cdn', 'gh-proxy-edgeone', 'gh-proxy-com'])
  })

  it('不给探测结果：第一个支持的', () => {
    expect(pickSource(ghProxy, link(RELEASE))?.id).toBe('gh-proxy-hk')
    expect(categoryUrl(ghProxy, link(RELEASE))).toBe(`https://hk.gh-proxy.org/${RELEASE}`)
    expect(categoryUrl(ghProxy, link(GIST))).toBeUndefined()
  })

  it('给出探测结果：可用的中耗时最短的，同样快时靠前的；都不可用、未探测时没有', () => {
    expect(pickSource(ghProxy, link(RELEASE), { 'gh-proxy-hk': 300, 'gh-proxy-cdn': 80, 'gh-proxy-edgeone': null })?.id).toBe(
      'gh-proxy-cdn'
    )
    expect(pickSource(ghProxy, link(RELEASE), { 'gh-proxy-cdn': 50, 'gh-proxy-com': 50 })?.id).toBe('gh-proxy-cdn')
    expect(pickSource(ghProxy, link(RELEASE), { 'gh-proxy-hk': 0 })?.id).toBe('gh-proxy-hk')
    expect(pickSource(ghProxy, link(RELEASE), { 'gh-proxy-hk': null, ghfast: 10 })).toBeUndefined()
    expect(pickSource(ghProxy, link(RELEASE), {})).toBeUndefined()
    expect(categoryUrl(ghProxy, link(RELEASE), { 'gh-proxy-com': 120 })).toBe(`https://gh-proxy.com/${RELEASE}`)
  })
})

describe('sanitizeCategories', () => {
  it.each([undefined, null, 'x', { id: 'a' }])('非数组 %j → 空', value => {
    expect(sanitizeCategories(value)).toEqual([])
  })

  it('内置分类的项只留改名与关闭自动隐藏；自定义分类须有名称；丢弃不合法、重复的项', () => {
    expect(
      sanitizeCategories([
        { id: 'ghfast', name: '  快  ', autoHide: true },
        { id: 'other', autoHide: false, extra: 1 },
        { id: 'custom', name: '' },
        { id: 'ghfast', name: '重复' },
        { id: 'category-1', name: ' Team ' },
        { id: 'category-2', name: '   ' },
        { id: 'category-3' },
        { id: '', name: '空标识' },
        { id: 'category-4', name: 'x'.repeat(30), autoHide: false },
        'category-5',
        null
      ])
    ).toEqual([
      { id: 'ghfast', name: '快' },
      { id: 'other', autoHide: false },
      { id: 'custom' },
      { id: 'category-1', name: 'Team' },
      { id: 'category-4', name: 'x'.repeat(20), autoHide: false }
    ])
  })

  it('自定义分类超出上限的截掉，内置分类的项不计入', () => {
    const many = Array.from({ length: MAX_CUSTOM_CATEGORIES + 2 }, (_, index) => ({ id: `category-${index}`, name: `C${index}` }))
    const result = sanitizeCategories([...many, { id: 'ghfast', autoHide: false }])
    expect(result).toHaveLength(MAX_CUSTOM_CATEGORIES + 1)
    expect(result.at(-1)).toEqual({ id: 'ghfast', autoHide: false })
  })
})

describe('sanitizeCustomSources', () => {
  const CATEGORIES = new Set(['gh-proxy', 'custom', 'category-1'])

  it.each([undefined, null, 'x', { id: 'a' }])('非数组 %j → 空', value => {
    expect(sanitizeCustomSources(value, CATEGORIES)).toEqual([])
  })

  it('没有分类的（旧版本添加的）归入「自定义」；分类不存在的、不合法、重复（标识或效果相同的模板）、占用内置标识的丢弃', () => {
    expect(
      sanitizeCustomSources(
        [
          { id: 'custom-1', name: 'Mirror', template: 'https://mirror.example/{url}' },
          { id: 'custom-1', name: '同标识', template: 'https://other.example/{url}', category: 'custom' },
          { id: 'custom-2', name: '同效果', template: 'https://mirror.example', category: 'gh-proxy' },
          { id: 'ghfast', name: '内置标识', template: 'https://other.example/{url}' },
          { id: 'custom-3', name: 'HTTP', template: 'http://other.example/{url}' },
          { id: 'custom-4', name: '分类不存在', template: 'https://other.example/{url}', category: 'gone' },
          { id: '', name: '空标识', template: 'https://other.example/{url}' },
          { id: 'custom-5', template: 'https://other.example/{url}', category: 'category-1' },
          { id: 'custom-6', name: 'x'.repeat(40), template: 'https://third.example/{path}', category: 'gh-proxy' },
          'custom-7'
        ],
        CATEGORIES
      )
    ).toEqual([
      MIRROR,
      { id: 'custom-5', name: 'other.example', template: 'https://other.example/{url}', category: 'category-1' },
      { id: 'custom-6', name: 'x'.repeat(30), template: 'https://third.example/{path}', category: 'gh-proxy' }
    ])
  })

  it('超出上限的截掉', () => {
    const many = Array.from({ length: MAX_CUSTOM_SOURCES + 2 }, (_, index) => ({
      id: `custom-${index}`,
      name: `M${index}`,
      template: `https://m${index}.example/{url}`
    }))
    expect(sanitizeCustomSources(many, CATEGORIES)).toHaveLength(MAX_CUSTOM_SOURCES)
  })
})

describe('sanitizeAccelerateSettings', () => {
  const COPY = { id: 'custom-9', name: '我的代理', template: 'https://gh-proxy.com', category: 'custom' }

  it('缺省：空的改动，不替换', () => {
    expect(sanitizeAccelerateSettings({})).toEqual(settingsWith())
  })

  it('去掉与生效的内置源效果相同的自定义源；内置源或其分类已删除时保留', () => {
    expect(sanitizeAccelerateSettings({ customSources: [COPY, MIRROR] }).customSources).toEqual([MIRROR])
    expect(sanitizeAccelerateSettings({ customSources: [COPY], removedSources: ['gh-proxy-com'] }).customSources).toEqual([COPY])
    expect(sanitizeAccelerateSettings({ customSources: [COPY], removedCategories: ['gh-proxy'] }).customSources).toEqual([COPY])
  })

  it('已删除的分类只留内置分类，去重；已删除的分类中的自定义源丢弃', () => {
    const result = sanitizeAccelerateSettings({
      removedCategories: ['ghfast', 'ghfast', 'category-1', 1],
      removedSources: ['wget-la', 'wget-la', 2],
      customSources: [{ ...MIRROR, category: 'ghfast' }]
    })
    expect(result.removedCategories).toEqual(['ghfast'])
    expect(result.removedSources).toEqual(['wget-la'])
    expect(result.customSources).toEqual([])
  })

  it('替换原链接：分类存在时保留，否则不替换', () => {
    expect(sanitizeAccelerateSettings({ replaceCategory: 'ghfast' }).replaceCategory).toBe('ghfast')
    expect(sanitizeAccelerateSettings({ replaceCategory: 'category-1', categories: [TEAM] }).replaceCategory).toBe('category-1')
    expect(sanitizeAccelerateSettings({ replaceCategory: 'ghfast', removedCategories: ['ghfast'] }).replaceCategory).toBe('')
    expect(sanitizeAccelerateSettings({ replaceCategory: 'gone' }).replaceCategory).toBe('')
    expect(sanitizeAccelerateSettings({ replaceCategory: 1 }).replaceCategory).toBe('')
  })
})

describe('addCategory', () => {
  it('新建：去掉首尾空白，按时间生成标识，排在最后', () => {
    const result = addCategory(settingsWith(), '  Team  ', TIME, label)
    const id = `category-${TIME.toString(36)}`
    expect(result).toEqual({ ok: true, id, patch: { categories: [{ id, name: 'Team' }] } })
  })

  it('同一时刻新建的标识不重复', () => {
    const first = { id: `category-${TIME.toString(36)}`, name: 'A' }
    const result = addCategory(settingsWith({ categories: [first] }), 'B', TIME, label)
    expect(result.ok && result.id).toBe(`${first.id}-2`)
  })

  it('名称为空、与现有分类重名（不区分大小写，含以文案为名称的）、已达上限', () => {
    expect(addCategory(settingsWith(), '  ', TIME, label)).toEqual({ ok: false, reason: 'invalid' })
    expect(addCategory(settingsWith(), 'GHFAST', TIME, label)).toEqual({ ok: false, reason: 'exists' })
    expect(addCategory(settingsWith(), '其他', TIME, label)).toEqual({ ok: false, reason: 'exists' })
    expect(addCategory(settingsWith({ categories: [TEAM] }), 'team', TIME, label)).toEqual({ ok: false, reason: 'exists' })
    // 已删除的内置分类不占名称
    expect(addCategory(settingsWith({ removedCategories: ['ghfast'] }), 'ghfast', TIME, label).ok).toBe(true)
    const full = Array.from({ length: MAX_CUSTOM_CATEGORIES }, (_, index) => ({ id: `category-${index}`, name: `C${index}` }))
    expect(addCategory(settingsWith({ categories: full }), 'New', TIME, label)).toEqual({ ok: false, reason: 'limit' })
  })
})

describe('renameCategory', () => {
  it('内置分类：改名记为改动；改回默认名称或清空时去掉改动', () => {
    expect(renameCategory(settingsWith(), 'ghfast', '快', label)).toEqual({
      ok: true,
      patch: { categories: [{ id: 'ghfast', name: '快' }] }
    })
    const renamed = settingsWith({ categories: [{ id: 'ghfast', name: '快', autoHide: false }] })
    expect(renameCategory(renamed, 'ghfast', 'ghfast', label)).toEqual({
      ok: true,
      patch: { categories: [{ id: 'ghfast', autoHide: false }] }
    })
    expect(renameCategory(settingsWith({ categories: [{ id: 'other', name: '备用' }] }), 'other', '其他', label)).toEqual({
      ok: true,
      patch: { categories: [] }
    })
    expect(renameCategory(settingsWith({ categories: [{ id: 'other', name: '备用' }] }), 'other', ' ', label)).toEqual({
      ok: true,
      patch: { categories: [] }
    })
  })

  it('自定义分类：改名；不能清空', () => {
    const settings = settingsWith({ categories: [TEAM] })
    expect(renameCategory(settings, 'category-1', 'Group', label)).toEqual({
      ok: true,
      patch: { categories: [{ id: 'category-1', name: 'Group' }] }
    })
    expect(renameCategory(settings, 'category-1', '', label)).toEqual({ ok: false, reason: 'invalid' })
  })

  it('与其他分类重名、分类不存在：失败；与自己重名（只改大小写）可以', () => {
    const settings = settingsWith({ categories: [TEAM] })
    expect(renameCategory(settings, 'category-1', 'wget.la', label)).toEqual({ ok: false, reason: 'exists' })
    expect(renameCategory(settings, 'gone', 'X', label)).toEqual({ ok: false, reason: 'invalid' })
    expect(renameCategory(settings, 'category-1', 'TEAM', label).ok).toBe(true)
  })
})

describe('setCategoryAutoHide', () => {
  it('关闭记为改动，开启时去掉；自定义分类保留名称；分类不存在时不改', () => {
    expect(setCategoryAutoHide(settingsWith(), 'ghfast', false)).toEqual({ categories: [{ id: 'ghfast', autoHide: false }] })
    expect(setCategoryAutoHide(settingsWith({ categories: [{ id: 'ghfast', autoHide: false }] }), 'ghfast', true)).toEqual({
      categories: []
    })
    const custom = settingsWith({ categories: [{ ...TEAM, autoHide: false }] })
    expect(setCategoryAutoHide(custom, 'category-1', true)).toEqual({ categories: [TEAM] })
    expect(setCategoryAutoHide(settingsWith(), 'gone', false)).toEqual({})
  })
})

describe('removeCategory', () => {
  it('内置分类记入已删除，连同其中的自定义源；替换原链接用的是它时改为不替换', () => {
    const settings = settingsWith({
      categories: [{ id: 'ghfast', name: '快' }],
      customSources: [{ ...MIRROR, category: 'ghfast' }],
      replaceCategory: 'ghfast'
    })
    expect(removeCategory(settings, 'ghfast')).toEqual({
      categories: [],
      customSources: [],
      removedCategories: ['ghfast'],
      replaceCategory: ''
    })
  })

  it('自定义分类直接去掉；分类不存在时不改', () => {
    const settings = settingsWith({ categories: [TEAM], customSources: [MIRROR, { ...MIRROR, id: 'custom-2', category: 'category-1' }] })
    expect(removeCategory(settings, 'category-1')).toEqual({ categories: [], customSources: [MIRROR] })
    expect(removeCategory(settings, 'gone')).toEqual({})
  })
})

describe('addSource / removeSource / restoreBuiltins', () => {
  it('添加：校验模板，按时间生成标识，名称为空时用域名', () => {
    expect(addSource(settingsWith({ categories: [TEAM] }), 'category-1', ' ', ' https://mirror.example/{url} ', TIME)).toEqual({
      ok: true,
      id: `custom-${TIME.toString(36)}`,
      patch: {
        customSources: [
          { id: `custom-${TIME.toString(36)}`, name: 'mirror.example', template: 'https://mirror.example/{url}', category: 'category-1' }
        ]
      }
    })
  })

  it('格式错误、分类不存在、已存在（任一分类中，含效果相同的写法与内置源）、已达上限', () => {
    expect(addSource(settingsWith(), 'custom', 'A', 'http://a.example/{url}', TIME)).toEqual({ ok: false, reason: 'invalid' })
    expect(addSource(settingsWith(), 'gone', 'A', 'https://a.example/{url}', TIME)).toEqual({ ok: false, reason: 'invalid' })
    expect(addSource(settingsWith(), 'custom', 'A', 'https://ghfast.top', TIME)).toEqual({ ok: false, reason: 'exists' })
    expect(addSource(settingsWith({ customSources: [MIRROR] }), 'ghfast', 'A', 'https://mirror.example/', TIME)).toEqual({
      ok: false,
      reason: 'exists'
    })
    const full = Array.from({ length: MAX_CUSTOM_SOURCES }, (_, index) => ({
      id: `custom-${index}`,
      name: `M${index}`,
      template: `https://m${index}.example/{url}`,
      category: 'custom'
    }))
    expect(addSource(settingsWith({ customSources: full }), 'custom', 'A', 'https://a.example/{url}', TIME)).toEqual({
      ok: false,
      reason: 'limit'
    })
  })

  it('已删除的内置源可以作为自定义源添加；恢复内置时一并去掉重复的自定义源', () => {
    const removed = settingsWith({ removedSources: ['ghfast'], removedCategories: ['other'] })
    const result = addSource(removed, 'custom', '', 'https://ghfast.top/{url}', TIME)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    const settings = settingsWith({ ...removed, customSources: [...(result.patch.customSources ?? []), MIRROR] })
    expect(countRemovedBuiltins(settings)).toBe(2)
    expect(restoreBuiltins(settings)).toEqual({ removedCategories: [], removedSources: [], customSources: [MIRROR] })
  })

  it('删除：内置源记入已删除（不重复记），自定义源直接去掉', () => {
    const settings = settingsWith({ customSources: [MIRROR], removedSources: ['wget-la'] })
    expect(removeSource(settings, 'ghfast')).toEqual({ removedSources: ['wget-la', 'ghfast'] })
    expect(removeSource(settings, 'wget-la')).toEqual({})
    expect(removeSource(settings, 'custom-1')).toEqual({ customSources: [] })
  })

  it('删除多个：内置源一并记入已删除（已删除的、重复的不再记），自定义源一并去掉；都不存在时不改', () => {
    const other: CustomSource = { ...MIRROR, id: 'custom-2', template: 'https://mirror2.example/{url}' }
    const settings = settingsWith({ customSources: [MIRROR, other], removedSources: ['wget-la'] })
    expect(removeSources(settings, ['ghfast', 'custom-1', 'wget-la', 'ghfast', 'gh-proxy-hk'])).toEqual({
      customSources: [other],
      removedSources: ['wget-la', 'ghfast', 'gh-proxy-hk']
    })
    expect(removeSources(settings, ['custom-1', 'custom-2'])).toEqual({ customSources: [] })
    expect(removeSources(settings, ['wget-la', 'missing'])).toEqual({})
    expect(removeSources(settings, [])).toEqual({})
  })
})

describe('分类顺序', () => {
  const DEFAULT_IDS = BUILTIN_CATEGORIES.map(item => item.id)

  it('排过序时按排好的顺序；不在顺序里的（之后新建的、新增的内置分类）保持原来的先后排在后面', () => {
    const settings = settingsWith({ categories: [TEAM], categoryOrder: ['other', 'ghfast'] })
    expect(ids(listCategories(settings))).toEqual(['other', 'ghfast', 'gh-proxy', 'wget-la', 'custom', 'category-1'])
    expect(ids(listSources(settings)).slice(0, 4)).toEqual(['gh-monlor', 'hub-ddayh', 'ghproxy-053000', 'ghfast'])
  })

  it('读取存储：去掉不存在的分类（已删除的、未知的）与重复的；不是列表时为空', () => {
    expect(
      sanitizeAccelerateSettings({
        categories: [TEAM],
        removedCategories: ['wget-la'],
        categoryOrder: ['category-1', 'wget-la', 'ghfast', 'ghfast', 'missing', 3]
      }).categoryOrder
    ).toEqual(['category-1', 'ghfast'])
    expect(sanitizeAccelerateSettings({ categoryOrder: 'ghfast' }).categoryOrder).toEqual([])
  })

  it('移动：移到第 index 位，越界时到首尾；记下全部分类的顺序', () => {
    const settings = settingsWith({ categories: [TEAM] })
    expect(moveCategory(settings, 'category-1', 0)).toEqual({ categoryOrder: ['category-1', ...DEFAULT_IDS] })
    expect(moveCategory(settings, 'gh-proxy', 2)).toEqual({
      categoryOrder: ['ghfast', 'wget-la', 'gh-proxy', 'other', 'custom', 'category-1']
    })
    expect(moveCategory(settings, 'gh-proxy', 99)).toEqual({
      categoryOrder: ['ghfast', 'wget-la', 'other', 'custom', 'category-1', 'gh-proxy']
    })
    expect(moveCategory(settings, 'other', -3)).toEqual({
      categoryOrder: ['other', 'gh-proxy', 'ghfast', 'wget-la', 'custom', 'category-1']
    })
  })

  it('移动：在已排好的顺序上移动；位置不变、分类不存在时不改；移回默认顺序时清空', () => {
    const settings = settingsWith({ categoryOrder: ['ghfast', 'gh-proxy'] })
    expect(moveCategory(settings, 'gh-proxy', 0)).toEqual({ categoryOrder: [] })
    expect(moveCategory(settings, 'ghfast', 0)).toEqual({})
    expect(moveCategory(settings, 'missing', 0)).toEqual({})
    expect(moveCategory(settings, 'custom', 1)).toEqual({ categoryOrder: ['ghfast', 'custom', 'gh-proxy', 'wget-la', 'other'] })
  })

  it('删除分类：从顺序中去掉；恢复内置后排在最后', () => {
    const settings = settingsWith({ categoryOrder: ['other', 'ghfast', 'gh-proxy', 'wget-la', 'custom'] })
    const patch = removeCategory(settings, 'ghfast')
    expect(patch.categoryOrder).toEqual(['other', 'gh-proxy', 'wget-la', 'custom'])
    const removed = { ...settings, ...patch }
    expect(ids(listCategories({ ...removed, ...restoreBuiltins(removed) }))).toEqual(['other', 'gh-proxy', 'wget-la', 'custom', 'ghfast'])
    expect(removeCategory(settingsWith(), 'ghfast').categoryOrder).toBeUndefined()
  })
})
