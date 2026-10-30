/**
 * 旧版本留在存储里的数据，扩展更新后由后台处理。
 * 未翻译文本（storage.local）：一条记录一个键（untranslated:<原文>），另有条数、清空代次与更早的整体存储，删除。
 * 设置（storage.sync 的 settings，整体一个对象）中已删除的设置项：读取时忽略（见 settings 的 mergeSettings），
 * 不删除，改为固定值（见 settings 的 LEGACY_SETTING_VALUES）
 */
import { browser } from 'wxt/browser'
import { storage } from 'wxt/utils/storage'
import { LEGACY_SETTING_VALUES, settingsItem } from './settings'

/** 未翻译记录的键前缀 */
const LEGACY_UNTRANSLATED_PREFIX = 'untranslated:'

/** 未翻译文本的其余键：整体存储、条数、清空代次 */
const LEGACY_UNTRANSLATED_KEYS: readonly string[] = ['untranslated', 'untranslatedMeta', 'untranslatedEpoch']

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isLegacyUntranslatedKey(key: string): boolean {
  return key.startsWith(LEGACY_UNTRANSLATED_PREFIX) || LEGACY_UNTRANSLATED_KEYS.includes(key)
}

/** storage.local 的全部键名；有 getKeys（Chrome 130+、Firefox 143+）时只取键名，不读值 */
async function listLocalKeys(): Promise<string[]> {
  const area = browser.storage.local
  if (typeof area.getKeys === 'function') {
    try {
      return await area.getKeys()
    } catch {
      // 未实现时退回全量读取
    }
  }
  return Object.keys(await area.get(null))
}

/** 删除旧版本收集的未翻译文本；没有时不写入 */
export async function removeLegacyUntranslated(): Promise<void> {
  const keys = (await listLocalKeys()).filter(isLegacyUntranslatedKey)
  if (keys.length > 0) await browser.storage.local.remove(keys)
}

/** 存储的设置中已删除的设置项改为固定值，其余字段原样保留；已是固定值或没有存储的设置时不写入 */
export async function applyLegacySettingValues(): Promise<void> {
  const stored = await storage.getItem<unknown>(settingsItem.key)
  if (!isRecord(stored)) return
  if (Object.entries(LEGACY_SETTING_VALUES).every(([field, value]) => stored[field] === value)) return
  await storage.setItem(settingsItem.key, { ...stored, ...LEGACY_SETTING_VALUES })
}
