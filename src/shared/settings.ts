import { storage } from 'wxt/utils/storage'
import { DEFAULT_SOURCE_ID, sanitizeCustomSources, sanitizeRemovedSources, type AccelerateSettings } from './accelerate'
import {
  isPageLocalePreference,
  isUiLanguagePreference,
  type PageLocalePreference,
  type UiLanguagePreference,
} from './locale'

/** 扩展界面外观：auto 跟随浏览器 */
export type ThemePreference = 'auto' | 'light' | 'dark'

export const THEME_PREFERENCES: readonly ThemePreference[] = ['auto', 'light', 'dark']

export function isThemePreference(value: unknown): value is ThemePreference {
  return (THEME_PREFERENCES as readonly unknown[]).includes(value)
}

export interface Settings extends AccelerateSettings {
  /** 总开关 */
  readonly enabled: boolean
  /** 时间本地化：<relative-time> 等元素改用中文格式 */
  readonly translateTime: boolean
  /** 翻译标签页标题 */
  readonly translateTitle: boolean
  /**
   * 排除路径。以 / 开头；* 匹配单段，** 匹配任意多段；
   * 命中路径本身及其下级路径。例：/settings、/*\/*\/wiki
   */
  readonly excludedPaths: readonly string[]
  /** 页面翻译语言（简体 / 繁体）；auto 按浏览器语言 */
  readonly language: PageLocalePreference
  /** 扩展界面语言；auto 按浏览器界面语言 */
  readonly uiLanguage: UiLanguagePreference
  /** 扩展界面外观；auto 跟随浏览器 */
  readonly theme: ThemePreference
  /** 下载加速：Release 附件、源码包、Raw 文件、Gist 的链接与克隆地址改走加速源（见 shared/accelerate） */
  readonly accelerate: boolean
  /** 图片加速：GitHub 的图片加载失败时经加速源取回（见 core/image-accelerate） */
  readonly accelerateImages: boolean
  /** 故障转移：下载前探测加速源，首选不可用时换用其他加速源；图片取不到时依次换用其他加速源 */
  readonly failover: boolean
  /** 搜索净化：搜索结果中命中屏蔽规则的直接隐藏（规则见 searchBlockRulesItem，处理见 core/search-purify） */
  readonly purifySearch: boolean
}

/**
 * 自定义词条：原文 → 译文，优先于内置词条与正则。
 * 内置属性规则命中的属性、内置行内句整句命中的句子不再查词典，自定义词条对它们不生效
 */
export type CustomEntries = Readonly<Record<string, string>>

export const DEFAULT_SETTINGS: Settings = {
  enabled: true,
  translateTime: true,
  translateTitle: true,
  excludedPaths: [],
  language: 'auto',
  uiLanguage: 'auto',
  theme: 'auto',
  accelerate: false,
  accelerateImages: false,
  failover: false,
  purifySearch: true,
  accelerateSource: DEFAULT_SOURCE_ID,
  customSources: [],
  removedSources: [],
}

/**
 * 已删除的设置项，写入时固定为下列值（读取时忽略）。
 * collectUntranslated：旧版本的「收集未翻译」开关。设置随浏览器账号同步，未更新的旧版本读不到时按开启处理
 */
export const LEGACY_SETTING_VALUES = { collectUntranslated: false } as const

export const settingsItem = storage.defineItem<Partial<Settings>>('sync:settings', {
  fallback: DEFAULT_SETTINGS,
})

export const customEntriesItem = storage.defineItem<CustomEntries>('local:customEntries', {
  fallback: {},
})

/** 搜索净化的屏蔽规则：每项一条（写法见 shared/search-block）。可能较多，不放进同步的设置 */
export const searchBlockRulesItem = storage.defineItem<readonly string[]>('local:searchBlockRules', {
  fallback: [],
})

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string')
}

/** 合并存储值与默认值，丢弃类型不符的字段与未知字段 */
export function mergeSettings(stored: unknown): Settings {
  if (typeof stored !== 'object' || stored === null) return DEFAULT_SETTINGS
  const value = stored as Record<string, unknown>
  const pickBoolean = (key: keyof Settings, fallback: boolean): boolean =>
    typeof value[key] === 'boolean' ? (value[key] as boolean) : fallback
  return {
    enabled: pickBoolean('enabled', DEFAULT_SETTINGS.enabled),
    translateTime: pickBoolean('translateTime', DEFAULT_SETTINGS.translateTime),
    translateTitle: pickBoolean('translateTitle', DEFAULT_SETTINGS.translateTitle),
    excludedPaths: isStringArray(value.excludedPaths) ? value.excludedPaths : DEFAULT_SETTINGS.excludedPaths,
    language: isPageLocalePreference(value.language) ? value.language : DEFAULT_SETTINGS.language,
    uiLanguage: isUiLanguagePreference(value.uiLanguage) ? value.uiLanguage : DEFAULT_SETTINGS.uiLanguage,
    theme: isThemePreference(value.theme) ? value.theme : DEFAULT_SETTINGS.theme,
    accelerate: pickBoolean('accelerate', DEFAULT_SETTINGS.accelerate),
    accelerateImages: pickBoolean('accelerateImages', DEFAULT_SETTINGS.accelerateImages),
    failover: pickBoolean('failover', DEFAULT_SETTINGS.failover),
    purifySearch: pickBoolean('purifySearch', DEFAULT_SETTINGS.purifySearch),
    accelerateSource:
      typeof value.accelerateSource === 'string' ? value.accelerateSource : DEFAULT_SETTINGS.accelerateSource,
    customSources: sanitizeCustomSources(value.customSources),
    removedSources: sanitizeRemovedSources(value.removedSources),
  }
}

/** 过滤非字符串、空键空值 */
export function sanitizeCustomEntries(stored: unknown): CustomEntries {
  if (typeof stored !== 'object' || stored === null || Array.isArray(stored)) return {}
  const entries = Object.entries(stored as Record<string, unknown>).filter(
    (entry): entry is [string, string] =>
      typeof entry[1] === 'string' && entry[0].trim() !== '' && entry[1].trim() !== '',
  )
  return Object.fromEntries(entries)
}

export async function getSettings(): Promise<Settings> {
  return mergeSettings(await settingsItem.getValue())
}

/** 要写入的部分设置；按当前设置计算时传函数（如增删列表项，读改写不丢失之前的修改） */
export type SettingsPatch = Partial<Settings> | ((current: Settings) => Partial<Settings>)

/** 合并写入；已删除的设置项一并写入固定值（见 LEGACY_SETTING_VALUES） */
export async function updateSettings(patch: SettingsPatch): Promise<Settings> {
  const current = await getSettings()
  const next = { ...current, ...(typeof patch === 'function' ? patch(current) : patch) }
  await settingsItem.setValue({ ...next, ...LEGACY_SETTING_VALUES })
  return next
}

export function watchSettings(callback: (settings: Settings) => void): () => void {
  return settingsItem.watch((value) => callback(mergeSettings(value)))
}

export async function getCustomEntries(): Promise<CustomEntries> {
  return sanitizeCustomEntries(await customEntriesItem.getValue())
}

export function watchCustomEntries(callback: (entries: CustomEntries) => void): () => void {
  return customEntriesItem.watch((value) => callback(sanitizeCustomEntries(value)))
}

function globToRegExp(pattern: string): RegExp {
  const source = pattern
    .replace(/\/+$/, '')
    .split(/(\*\*|\*)/)
    .map((part) => {
      if (part === '**') return '.*'
      if (part === '*') return '[^/]*'
      return part.replace(/[.+?^${}()|[\]\\]/g, '\\$&')
    })
    .join('')
  return new RegExp(`^${source}(?:/.*)?$`, 'i')
}

/** 路径是否被排除规则命中 */
export function isPathExcluded(pathname: string, patterns: readonly string[]): boolean {
  return patterns
    .map((pattern) => pattern.trim())
    .filter((pattern) => pattern.startsWith('/'))
    .some((pattern) => globToRegExp(pattern).test(pathname))
}

/** 值为布尔的设置项 */
export type BooleanSettingKey = {
  [K in keyof Settings]: Settings[K] extends boolean ? K : never
}[keyof Settings]

/** 写入自定义词条（先过滤无效项），返回实际写入的值 */
export async function setCustomEntries(entries: CustomEntries): Promise<CustomEntries> {
  const next = sanitizeCustomEntries(entries)
  await customEntriesItem.setValue(next)
  return next
}

/** 过滤非字符串与空行，去掉首尾空白 */
export function sanitizeSearchBlockRules(stored: unknown): readonly string[] {
  if (!Array.isArray(stored)) return []
  return stored
    .filter((item): item is string => typeof item === 'string')
    .map((item) => item.trim())
    .filter((item) => item !== '')
}

export async function getSearchBlockRules(): Promise<readonly string[]> {
  return sanitizeSearchBlockRules(await searchBlockRulesItem.getValue())
}

export function watchSearchBlockRules(callback: (rules: readonly string[]) => void): () => void {
  return searchBlockRulesItem.watch((value) => callback(sanitizeSearchBlockRules(value)))
}

/** 写入屏蔽规则（先过滤无效项），返回实际写入的值 */
export async function setSearchBlockRules(rules: readonly string[]): Promise<readonly string[]> {
  const next = sanitizeSearchBlockRules(rules)
  await searchBlockRulesItem.setValue(next)
  return next
}

/** 规范化一条排除规则：去掉首尾空白；不以 / 开头时为 undefined */
export function normalizeExcludedPath(value: string): string | undefined {
  const path = value.trim()
  return path.startsWith('/') ? path : undefined
}

/** 根路径 / 作为规则会命中全部页面，不能单独排除 */
export function canExcludePath(pathname: string): boolean {
  return pathname.replace(/\/+$/, '') !== ''
}

/** 把页面路径加入排除规则；已命中或不可排除时原样返回 */
export function addExcludedPath(patterns: readonly string[], pathname: string): readonly string[] {
  if (!canExcludePath(pathname) || isPathExcluded(pathname, patterns)) return patterns
  return [...patterns, pathname.replace(/\/+$/, '')]
}

/** 移除所有命中页面路径的排除规则 */
export function removeExcludedPath(patterns: readonly string[], pathname: string): readonly string[] {
  return patterns.filter((pattern) => !isPathExcluded(pathname, [pattern]))
}
