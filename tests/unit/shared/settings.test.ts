import { fakeBrowser } from 'wxt/testing/fake-browser'
import {
  DEFAULT_SETTINGS,
  addExcludedPath,
  canExcludePath,
  customEntriesItem,
  getCustomEntries,
  getSearchBlockRules,
  getSettings,
  isPathExcluded,
  matchesPathPattern,
  normalizeExcludedPath,
  mergeSettings,
  removeExcludedPath,
  sanitizeCustomEntries,
  sanitizeSearchBlockRules,
  searchBlockRulesItem,
  setCustomEntries,
  setSearchBlockRules,
  settingsItem,
  updateSettings,
  watchCustomEntries,
  watchSearchBlockRules,
  watchSettings,
} from '../../../src/shared/settings'

beforeEach(() => {
  fakeBrowser.reset()
})

describe('mergeSettings', () => {
  it.each([undefined, null, 'x', 1, true])('非对象 %s → 默认值', (input) => {
    expect(mergeSettings(input)).toEqual(DEFAULT_SETTINGS)
  })

  it('保留合法字段，补齐缺失字段', () => {
    expect(mergeSettings({ enabled: false, excludedPaths: ['/settings'] })).toEqual({
      ...DEFAULT_SETTINGS,
      enabled: false,
      excludedPaths: ['/settings'],
    })
  })

  it('丢弃类型不符的字段', () => {
    expect(
      mergeSettings({
        enabled: 'no',
        translateTime: 0,
        translateTitle: false,
        excludedPaths: ['/a', 1],
      }),
    ).toEqual({ ...DEFAULT_SETTINGS, translateTitle: false })
  })

  it('忽略未知字段（含旧版本的 collectUntranslated）', () => {
    const merged = mergeSettings({ enabled: false, collectUntranslated: false, unknown: 1 })
    expect(merged).toEqual({ ...DEFAULT_SETTINGS, enabled: false })
    expect(Object.hasOwn(merged, 'collectUntranslated')).toBe(false)
  })

  it('excludedPaths 不是数组时用默认值', () => {
    expect(mergeSettings({ excludedPaths: '/a' }).excludedPaths).toEqual([])
  })

  it('语言与外观：默认自动；保留合法取值，非法取值用默认值', () => {
    expect(DEFAULT_SETTINGS).toMatchObject({ language: 'auto', uiLanguage: 'auto', theme: 'auto' })
    expect(mergeSettings({ language: 'zh-TW', uiLanguage: 'en', theme: 'dark' })).toEqual({
      ...DEFAULT_SETTINGS,
      language: 'zh-TW',
      uiLanguage: 'en',
      theme: 'dark',
    })
    expect(mergeSettings({ language: 'en', uiLanguage: 'ja', theme: 'neon' })).toEqual(DEFAULT_SETTINGS)
    expect(mergeSettings({ language: null, uiLanguage: 1, theme: ['dark'] })).toEqual(DEFAULT_SETTINGS)
  })
})

describe('加速设置', () => {
  it('默认关闭，首选第一个内置源，没有自定义源', () => {
    expect(DEFAULT_SETTINGS).toMatchObject({
      accelerate: false,
      accelerateImages: false,
      failover: false,
      accelerateSource: 'ghfast',
      customSources: [],
      removedSources: [],
    })
  })

  it('保留合法字段；丢弃类型不符的字段与不合法的加速源', () => {
    const mirror = { id: 'custom-1', name: 'Mirror', template: 'https://mirror.example/{url}' }
    expect(
      mergeSettings({
        accelerate: true,
        accelerateImages: true,
        failover: 'yes',
        accelerateSource: 'custom-1',
        customSources: [mirror, { id: 'custom-2', name: 'HTTP', template: 'http://insecure.example/{url}' }],
        removedSources: ['wget-la', 3],
      }),
    ).toEqual({
      ...DEFAULT_SETTINGS,
      accelerate: true,
      accelerateImages: true,
      accelerateSource: 'custom-1',
      customSources: [mirror],
      removedSources: ['wget-la'],
    })
    expect(
      mergeSettings({ accelerateImages: 'yes', accelerateSource: 1, customSources: 'x', removedSources: {} }),
    ).toEqual(DEFAULT_SETTINGS)
  })
})

describe('搜索净化', () => {
  it('默认开启；保留布尔值，其余用默认值', () => {
    expect(DEFAULT_SETTINGS.purifySearch).toBe(true)
    expect(mergeSettings({ purifySearch: false }).purifySearch).toBe(false)
    expect(mergeSettings({ purifySearch: 'no' }).purifySearch).toBe(true)
  })

  it.each([undefined, null, 'x', { 0: '@octocat' }])('屏蔽规则不是数组 %s → 没有规则', (input) => {
    expect(sanitizeSearchBlockRules(input)).toEqual([])
  })

  it('屏蔽规则：过滤非字符串与空行，去掉首尾空白', () => {
    expect(sanitizeSearchBlockRules([' @octocat ', '', '  ', 3, null, 'vuejs/core'])).toEqual([
      '@octocat',
      'vuejs/core',
    ])
  })
})

describe('增强设置', () => {
  it('默认都关闭；新标签页打开的范围默认为站外链接与搜索结果，没有自定义页面', () => {
    expect(DEFAULT_SETTINGS).toMatchObject({
      autoLoad: false,
      imagePreview: false,
      newTab: false,
      newTabScopes: ['external', 'search'],
      newTabPaths: [],
    })
  })

  it('保留合法字段；范围丢弃未知项、按固定顺序；类型不符的用默认值', () => {
    expect(
      mergeSettings({
        autoLoad: true,
        imagePreview: true,
        newTab: true,
        newTabScopes: ['issues', 'external', 'unknown'],
        newTabPaths: ['/*/*/releases'],
      }),
    ).toEqual({
      ...DEFAULT_SETTINGS,
      autoLoad: true,
      imagePreview: true,
      newTab: true,
      newTabScopes: ['external', 'issues'],
      newTabPaths: ['/*/*/releases'],
    })
    expect(
      mergeSettings({ autoLoad: 'yes', imagePreview: 1, newTab: null, newTabScopes: 'search', newTabPaths: ['/a', 2] }),
    ).toEqual(DEFAULT_SETTINGS)
    expect(mergeSettings({ newTabScopes: [] }).newTabScopes).toEqual([])
  })
})

describe('与内置源重复的自定义源', () => {
  it('读取时去掉；首选是它时改为对应的内置源', () => {
    const copy = { id: 'custom-1', name: 'Mirror', template: 'https://gh-proxy.com' }
    const mirror = { id: 'custom-2', name: 'Mirror 2', template: 'https://mirror.example/{url}' }
    expect(mergeSettings({ customSources: [copy, mirror], accelerateSource: 'custom-1' })).toEqual({
      ...DEFAULT_SETTINGS,
      customSources: [mirror],
      accelerateSource: 'gh-proxy-com',
    })
  })
})

describe('matchesPathPattern', () => {
  it('* 匹配单段，** 匹配任意多段，含下级路径，不分大小写；不以 / 开头的规则无效', () => {
    expect(matchesPathPattern('/vuejs/core/releases', ['/*/*/releases'])).toBe(true)
    expect(matchesPathPattern('/vuejs/core/releases/tag/v3.5.0', ['/*/*/releases'])).toBe(true)
    expect(matchesPathPattern('/vuejs/core/tags', ['/*/*/releases'])).toBe(false)
    expect(matchesPathPattern('/vuejs/core/wiki/Home', ['/**/wiki'])).toBe(true)
    expect(matchesPathPattern('/VueJS/Core', [' /vuejs/core '])).toBe(true)
    expect(matchesPathPattern('/vuejs/core', ['vuejs/core'])).toBe(false)
    expect(matchesPathPattern('/vuejs/core', [])).toBe(false)
  })
})

describe('sanitizeCustomEntries', () => {
  it.each([undefined, null, 'x', ['a', 'b']])('非对象 %s → 空对象', (input) => {
    expect(sanitizeCustomEntries(input)).toEqual({})
  })

  it('过滤非字符串值与空键空值', () => {
    expect(sanitizeCustomEntries({ Issues: '议题', ' ': '空', Empty: '  ', Count: 3, Pulls: '拉取请求' })).toEqual({
      Issues: '议题',
      Pulls: '拉取请求',
    })
  })
})

describe('isPathExcluded', () => {
  it.each([
    ['/settings', ['/settings'], true],
    ['/settings/profile', ['/settings'], true],
    ['/settingsx', ['/settings'], false],
    ['/vuejs/core/wiki', ['/*/*/wiki'], true],
    ['/vuejs/core/wiki/Home', ['/*/*/wiki'], true],
    ['/vuejs/wiki', ['/*/*/wiki'], false],
    ['/a/b/c/wiki', ['/**/wiki'], true],
    ['/Settings', ['/settings'], true],
    ['/settings', ['/settings/'], true],
    ['/settings', ['  /settings  '], true],
    ['/settings', ['settings'], false],
    ['/a.b', ['/a.b'], true],
    ['/aXb', ['/a.b'], false],
    ['/anything', [], false],
  ])('%s 对 %j → %s', (pathname, patterns, expected) => {
    expect(isPathExcluded(pathname, patterns)).toBe(expected)
  })
})

describe('normalizeExcludedPath', () => {
  it('去掉首尾空白', () => {
    expect(normalizeExcludedPath(' /settings ')).toBe('/settings')
    expect(normalizeExcludedPath('/*/*/wiki')).toBe('/*/*/wiki')
  })

  it('不以 / 开头：无效', () => {
    for (const value of ['', '  ', 'settings', '*/wiki']) expect(normalizeExcludedPath(value), value).toBeUndefined()
  })
})

describe('排除此页 / 取消排除', () => {
  it('根路径不可排除', () => {
    expect(canExcludePath('/')).toBe(false)
    expect(canExcludePath('')).toBe(false)
    expect(canExcludePath('/vuejs/core')).toBe(true)
  })

  it('加入当前路径，去掉末尾斜杠', () => {
    expect(addExcludedPath(['/settings'], '/vuejs/core/')).toEqual(['/settings', '/vuejs/core'])
  })

  it('已命中或根路径时原样返回', () => {
    const patterns = ['/vuejs']
    expect(addExcludedPath(patterns, '/vuejs/core')).toBe(patterns)
    expect(addExcludedPath(patterns, '/')).toBe(patterns)
  })

  it('移除所有命中当前路径的规则', () => {
    expect(removeExcludedPath(['/vuejs', '/*/*/wiki', '/settings', '/vuejs/core'], '/vuejs/core')).toEqual([
      '/*/*/wiki',
      '/settings',
    ])
  })
})

describe('存储读写', () => {
  it('无存储值时返回默认设置', async () => {
    expect(await getSettings()).toEqual(DEFAULT_SETTINGS)
  })

  it('updateSettings 合并写入', async () => {
    await settingsItem.setValue({ translateTime: false })
    const next = await updateSettings({ enabled: false })
    expect(next).toEqual({ ...DEFAULT_SETTINGS, enabled: false, translateTime: false })
    expect(await settingsItem.getValue()).toEqual({ ...next, collectUntranslated: false })
  })

  it('updateSettings 传函数：按写入前存储中的最新设置计算', async () => {
    await settingsItem.setValue({ removedSources: ['wget-la'] })
    const next = await updateSettings((current) => ({ removedSources: [...current.removedSources, 'ghfast'] }))
    expect(next.removedSources).toEqual(['wget-la', 'ghfast'])
    expect((await getSettings()).removedSources).toEqual(['wget-la', 'ghfast'])
  })

  it.each<[string, Record<string, unknown>]>([
    ['开启', { collectUntranslated: true }],
    ['关闭', { collectUntranslated: false }],
    ['没有该字段', {}],
  ])(
    '旧版本的 collectUntranslated（%s）：读取时忽略；写入时固定为 false（设置会同步，未更新的旧版本读不到时按开启处理）',
    async (_name, legacy) => {
      await fakeBrowser.storage.sync.set({ settings: { enabled: false, ...legacy } })
      expect(await getSettings()).toEqual({ ...DEFAULT_SETTINGS, enabled: false })
      const next = await updateSettings({ translateTitle: false })
      expect(Object.hasOwn(next, 'collectUntranslated')).toBe(false)
      expect(await settingsItem.getValue()).toEqual({
        ...DEFAULT_SETTINGS,
        enabled: false,
        translateTitle: false,
        collectUntranslated: false,
      })
    },
  )

  it('watchSettings 回调合并后的设置', async () => {
    const callback = vi.fn()
    const stop = watchSettings(callback)
    await settingsItem.setValue({ enabled: false, excludedPaths: 'bad' as never })
    expect(callback).toHaveBeenLastCalledWith({ ...DEFAULT_SETTINGS, enabled: false })
    stop()
  })

  it('setCustomEntries 过滤后写入', async () => {
    const saved = await setCustomEntries({ Issues: '议题', Bad: ' ' })
    expect(saved).toEqual({ Issues: '议题' })
    expect(await customEntriesItem.getValue()).toEqual({ Issues: '议题' })
    expect(await getCustomEntries()).toEqual({ Issues: '议题' })
  })

  it('watchCustomEntries 回调过滤后的词条', async () => {
    const callback = vi.fn()
    const stop = watchCustomEntries(callback)
    await customEntriesItem.setValue({ Pulls: '拉取请求', Bad: 1 as never })
    expect(callback).toHaveBeenLastCalledWith({ Pulls: '拉取请求' })
    stop()
  })

  it('屏蔽规则存于 local 区：无存储值时没有规则；setSearchBlockRules 过滤后写入', async () => {
    expect(await getSearchBlockRules()).toEqual([])
    const saved = await setSearchBlockRules(['@octocat', ' '])
    expect(saved).toEqual(['@octocat'])
    expect(await fakeBrowser.storage.local.get('searchBlockRules')).toEqual({ searchBlockRules: ['@octocat'] })
    expect(await getSearchBlockRules()).toEqual(['@octocat'])
  })

  it('watchSearchBlockRules 回调过滤后的规则', async () => {
    const callback = vi.fn()
    const stop = watchSearchBlockRules(callback)
    await searchBlockRulesItem.setValue(['vuejs/core', 1 as never])
    expect(callback).toHaveBeenLastCalledWith(['vuejs/core'])
    stop()
  })
})
