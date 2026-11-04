import { fakeBrowser } from 'wxt/testing/fake-browser'
import { applyLegacySettingValues, removeLegacyUntranslated } from '../../../src/shared/legacy-storage'
import { DEFAULT_SETTINGS, getSettings } from '../../../src/shared/settings'

/** 旧版本存下的未翻译文本：两条记录、条数、清空代次与更早的整体存储 */
const LEGACY_UNTRANSLATED = {
  'untranslated:Open issues': { count: 2, kinds: 1, seen: 1, pages: { issues: 1 } },
  'untranslated:Pull requests': { count: 1, kinds: 2, seen: 2, pages: { pulls: 1 } },
  untranslatedMeta: { count: 2, full: false },
  untranslatedEpoch: 3,
  untranslated: { records: [] }
}

/** 不属于未翻译文本的键 */
const KEPT = { customEntries: { Issues: '议题' }, untranslatedNote: 'Sample text' }

/** 模拟支持 getKeys 的浏览器（fakeBrowser 没有实现），返回恢复函数 */
function addGetKeys(getKeys: () => Promise<string[]>): () => void {
  const local = fakeBrowser.storage.local as unknown as { getKeys?: () => Promise<string[]> }
  local.getKeys = getKeys
  return () => {
    delete local.getKeys
  }
}

/** 全量读取（get(null) 或 get()）的次数 */
function fullReads(get: { mock: { calls: unknown[][] } }): number {
  return get.mock.calls.filter(([keys]) => keys === null || keys === undefined).length
}

beforeEach(() => {
  fakeBrowser.reset()
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('removeLegacyUntranslated', () => {
  it('删除记录、条数、清空代次与整体存储，其余键保留', async () => {
    await fakeBrowser.storage.local.set({ ...LEGACY_UNTRANSLATED, ...KEPT })
    await removeLegacyUntranslated()
    expect(await fakeBrowser.storage.local.get(null)).toEqual(KEPT)
  })

  it('没有旧数据时不写入', async () => {
    await fakeBrowser.storage.local.set(KEPT)
    const remove = vi.spyOn(fakeBrowser.storage.local, 'remove')
    await removeLegacyUntranslated()
    expect(remove).not.toHaveBeenCalled()
    expect(await fakeBrowser.storage.local.get(null)).toEqual(KEPT)
  })

  it('支持 getKeys 时只取键名，不全量读取', async () => {
    await fakeBrowser.storage.local.set({ ...LEGACY_UNTRANSLATED, ...KEPT })
    // 取键不经过下面的 get 监视
    const read = fakeBrowser.storage.local.get.bind(fakeBrowser.storage.local)
    const restore = addGetKeys(async () => Object.keys(await read(null)))
    try {
      const get = vi.spyOn(fakeBrowser.storage.local, 'get')
      await removeLegacyUntranslated()
      expect(fullReads(get)).toBe(0)
    } finally {
      restore()
    }
    expect(await fakeBrowser.storage.local.get(null)).toEqual(KEPT)
  })

  it('getKeys 出错时退回全量读取', async () => {
    await fakeBrowser.storage.local.set({ ...LEGACY_UNTRANSLATED, ...KEPT })
    const restore = addGetKeys(async () => {
      throw new Error('未实现')
    })
    try {
      await removeLegacyUntranslated()
    } finally {
      restore()
    }
    expect(await fakeBrowser.storage.local.get(null)).toEqual(KEPT)
  })

  it('读取失败时拒绝，不删除', async () => {
    await fakeBrowser.storage.local.set(LEGACY_UNTRANSLATED)
    vi.spyOn(fakeBrowser.storage.local, 'get').mockRejectedValue(new Error('存储不可用'))
    const remove = vi.spyOn(fakeBrowser.storage.local, 'remove')
    await expect(removeLegacyUntranslated()).rejects.toThrow('存储不可用')
    expect(remove).not.toHaveBeenCalled()
  })
})

describe('applyLegacySettingValues', () => {
  it.each<[string, Record<string, unknown>]>([
    ['开启', { collectUntranslated: true }],
    ['类型不符', { collectUntranslated: 'off' }],
    ['没有该字段', {}]
  ])('collectUntranslated %s：改为 false（设置会同步，未更新的旧版本读不到时按开启处理），其余字段原样保留', async (_name, legacy) => {
    const stored = { enabled: false, excludedPaths: ['/settings'], theme: 'neon', ...legacy }
    await fakeBrowser.storage.sync.set({ settings: stored })
    await applyLegacySettingValues()
    expect((await fakeBrowser.storage.sync.get('settings')).settings).toEqual({
      enabled: false,
      excludedPaths: ['/settings'],
      theme: 'neon',
      collectUntranslated: false
    })
    expect(await getSettings()).toEqual({ ...DEFAULT_SETTINGS, enabled: false, excludedPaths: ['/settings'] })
  })

  it.each<[string, Record<string, unknown>]>([
    ['已是 false（关闭过收集）', { settings: { enabled: false, collectUntranslated: false } }],
    ['没有存储的设置', {}],
    ['存储值不是对象', { settings: ['collectUntranslated'] }]
  ])('%s：不写入', async (_name, stored) => {
    await fakeBrowser.storage.sync.set(stored)
    const set = vi.spyOn(fakeBrowser.storage.sync, 'set')
    await applyLegacySettingValues()
    expect(set).not.toHaveBeenCalled()
  })

  it('写入失败时拒绝', async () => {
    await fakeBrowser.storage.sync.set({ settings: { collectUntranslated: true } })
    vi.spyOn(fakeBrowser.storage.sync, 'set').mockRejectedValue(new Error('配额'))
    await expect(applyLegacySettingValues()).rejects.toThrow('配额')
  })
})
