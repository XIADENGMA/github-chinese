import type { MessageKey } from '../i18n'
import {
  BUILTIN_SOURCES,
  MAX_CUSTOM_SOURCES,
  accelerateLink,
  parseSourceTemplate,
  sourceName,
  supportsLink,
  templateKey,
  type AccelerableLink,
  type AccelerateSource
} from './accelerate'

/**
 * 加速源分类：页面上每个分类是一个加速选项（见 core/accelerate-options），用分类中的加速源加速。
 * 故障转移关闭时用分类中第一个支持该地址的加速源；开启时用探测可用、耗时最短的，
 * 都不可用时按分类的自动隐藏开关隐藏，或显示为不可用。
 * 内置分类按提供商划分；用户可新建、改名、删除分类，调整分类的顺序，在分类中添加自定义加速源。
 * 设置里只存改动（见 AccelerateSettings），新版本增减内置分类、内置源时照常生效
 */

/** 内置分类的默认名称是界面文案时的键（不以提供商命名的分类） */
export type CategoryLabel = Extract<MessageKey, 'otherCategory' | 'customCategory'>

export interface BuiltinCategory {
  readonly id: string
  /** 提供商名称；为空时显示 label 的文案 */
  readonly name: string
  readonly label?: CategoryLabel
  /** 内置加速源的标识：故障转移关闭时按这个顺序取第一个支持的 */
  readonly sources: readonly string[]
}

/**
 * 内置分类，按提供商：同一提供商的节点归在一起（gh-proxy.org 与 gh-proxy.com 的首页相同）；
 * 只有一个节点的提供商单列，其余归入「其他」。「自定义」默认为空，旧版本添加的自定义源归入其中
 */
export const BUILTIN_CATEGORIES: readonly BuiltinCategory[] = [
  { id: 'gh-proxy', name: 'gh-proxy', sources: ['gh-proxy-hk', 'gh-proxy-cdn', 'gh-proxy-edgeone', 'gh-proxy-com'] },
  { id: 'ghfast', name: 'ghfast', sources: ['ghfast'] },
  { id: 'wget-la', name: 'wget.la', sources: ['wget-la'] },
  { id: 'other', name: '', label: 'otherCategory', sources: ['gh-monlor', 'hub-ddayh', 'ghproxy-053000'] },
  { id: 'custom', name: '', label: 'customCategory', sources: [] }
]

/** 旧版本的自定义源（没有分类）归入的分类 */
export const LEGACY_CATEGORY_ID = 'custom'
/** 自定义分类的上限与名称的长度上限（设置随浏览器账号同步，见 MAX_CUSTOM_SOURCES） */
export const MAX_CUSTOM_CATEGORIES = 10
export const CATEGORY_NAME_MAX_LENGTH = 20

export interface CustomSource extends AccelerateSource {
  /** 所属分类的标识 */
  readonly category: string
}

/** 存储中的分类项：自定义分类（必有 name），或内置分类的改动（改名、关闭自动隐藏） */
export interface CategoryEntry {
  readonly id: string
  readonly name?: string
  /** 自动隐藏：故障转移开启、分类中没有可用的加速源时隐藏该分类；不填为开启 */
  readonly autoHide?: boolean
}

/** 加速源相关的设置（见 shared/settings） */
export interface AccelerateSettings {
  /** 自定义分类（默认排在内置分类之后，按添加顺序）与内置分类的改动 */
  readonly categories: readonly CategoryEntry[]
  /** 分类的顺序（分类标识）：排过序时才有；不在其中的分类（之后新建的、新版本新增的）按默认顺序排在后面 */
  readonly categoryOrder: readonly string[]
  /** 已删除的内置分类 */
  readonly removedCategories: readonly string[]
  /** 自定义加速源：排在所属分类的内置源之后 */
  readonly customSources: readonly CustomSource[]
  /** 已删除的内置加速源 */
  readonly removedSources: readonly string[]
  /** 替换原链接：下载链接、克隆地址改用这个分类加速；空串为不替换，只在旁边加选项 */
  readonly replaceCategory: string
}

/** 生效的分类 */
export interface AccelerateCategory {
  readonly id: string
  /** 名称；为空时显示 label 的文案（见 categoryName） */
  readonly name: string
  readonly label?: CategoryLabel
  readonly builtin: boolean
  readonly autoHide: boolean
  /** 未删除的内置源在前，自定义源在后 */
  readonly sources: readonly AccelerateSource[]
}

/** 各加速源的探测结果：标识 → 耗时（毫秒）；不可用为 null，未探测的没有 */
export type SourceHealth = Readonly<Record<string, number | null>>

/** 编辑失败的原因：格式错误、已存在、已达上限 */
export type EditFailure = 'invalid' | 'exists' | 'limit'

/** 编辑的结果：成功时为要写入的设置（新建时带新标识） */
export type EditResult =
  | { readonly ok: true; readonly patch: Partial<AccelerateSettings>; readonly id?: string }
  | { readonly ok: false; readonly reason: EditFailure }

/** 界面文案：内置分类以文案为名称时用 */
export type LabelText = (key: CategoryLabel) => string

const BUILTIN_SOURCE_BY_ID: ReadonlyMap<string, AccelerateSource> = new Map(BUILTIN_SOURCES.map(source => [source.id, source]))
const BUILTIN_CATEGORY_BY_ID: ReadonlyMap<string, BuiltinCategory> = new Map(BUILTIN_CATEGORIES.map(category => [category.id, category]))

export function isBuiltinCategory(id: string): boolean {
  return BUILTIN_CATEGORY_BY_ID.has(id)
}

export function isBuiltinSource(id: string): boolean {
  return BUILTIN_SOURCE_BY_ID.has(id)
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/** 分类名称：去掉首尾空白，截到上限 */
function cleanName(text: string): string {
  return text.trim().slice(0, CATEGORY_NAME_MAX_LENGTH)
}

/** 按排好的顺序：排过的在前，其余保持原来的先后排在后面 */
function applyOrder(categories: readonly AccelerateCategory[], order: readonly string[]): readonly AccelerateCategory[] {
  if (order.length === 0) return categories
  const rank = new Map(order.map((id, index) => [id, index]))
  return categories
    .map((category, index) => ({ category, rank: rank.get(category.id) ?? order.length + index }))
    .sort((a, b) => a.rank - b.rank)
    .map(item => item.category)
}

/** 生效的分类：默认未删除的内置分类在前（按内置顺序），自定义分类在后；排过序时按排好的顺序 */
export function listCategories(settings: AccelerateSettings): readonly AccelerateCategory[] {
  const removedCategories = new Set(settings.removedCategories)
  const removedSources = new Set(settings.removedSources)
  const entries = new Map(settings.categories.map(entry => [entry.id, entry]))
  const customIn = (id: string): readonly AccelerateSource[] =>
    settings.customSources
      .filter(source => source.category === id)
      .map(({ id: sourceId, name, template }) => ({ id: sourceId, name, template }))
  const builtin = BUILTIN_CATEGORIES.filter(category => !removedCategories.has(category.id)).map((category): AccelerateCategory => {
    const entry = entries.get(category.id)
    const builtinSources = category.sources.flatMap(id => {
      const source = BUILTIN_SOURCE_BY_ID.get(id)
      return source && !removedSources.has(id) ? [source] : []
    })
    return {
      id: category.id,
      name: entry?.name ?? category.name,
      ...(entry?.name === undefined && category.label ? { label: category.label } : {}),
      builtin: true,
      autoHide: entry?.autoHide ?? true,
      sources: [...builtinSources, ...customIn(category.id)]
    }
  })
  const custom = settings.categories
    .filter(entry => !isBuiltinCategory(entry.id) && entry.name !== undefined)
    .map((entry): AccelerateCategory => ({
      id: entry.id,
      name: entry.name ?? '',
      builtin: false,
      autoHide: entry.autoHide ?? true,
      sources: customIn(entry.id)
    }))
  return applyOrder([...builtin, ...custom], settings.categoryOrder)
}

export function findCategory(settings: AccelerateSettings, id: string): AccelerateCategory | undefined {
  return listCategories(settings).find(category => category.id === id)
}

/** 全部生效的加速源，按分类顺序（图片加速、测速用） */
export function listSources(settings: AccelerateSettings): readonly AccelerateSource[] {
  return listCategories(settings).flatMap(category => category.sources)
}

/** 显示的名称 */
export function categoryName(category: Pick<AccelerateCategory, 'name' | 'label'>, label: LabelText): string {
  return category.name || (category.label ? label(category.label) : '')
}

/** 替换原链接用的分类；不替换、分类已不存在时为 undefined */
export function replacementCategory(settings: AccelerateSettings): AccelerateCategory | undefined {
  return settings.replaceCategory === '' ? undefined : findCategory(settings, settings.replaceCategory)
}

/** 分类中能加速该地址的加速源，按分类中的顺序 */
export function categoryCandidates(category: AccelerateCategory, link: AccelerableLink): readonly AccelerateSource[] {
  return category.sources.filter(source => supportsLink(source, link))
}

/**
 * 分类为该地址选的加速源：不给探测结果时为第一个支持的；给出时为探测可用的中耗时最短的（同样快时靠前的），
 * 都不可用（含未探测）时为 undefined
 */
export function pickSource(category: AccelerateCategory, link: AccelerableLink, health?: SourceHealth): AccelerateSource | undefined {
  const candidates = categoryCandidates(category, link)
  if (!health) return candidates[0]
  let best: { readonly source: AccelerateSource; readonly ms: number } | undefined
  for (const source of candidates) {
    const ms = health[source.id]
    if (typeof ms === 'number' && (!best || ms < best.ms)) best = { source, ms }
  }
  return best?.source
}

/** 用分类加速后的地址；没有可用的加速源时为 undefined（见 pickSource） */
export function categoryUrl(category: AccelerateCategory, link: AccelerableLink, health?: SourceHealth): string | undefined {
  const source = pickSource(category, link, health)
  return source && accelerateLink(source.template, link)
}

// ---------- 读取存储 ----------

function sanitizeEntry(item: unknown): CategoryEntry | undefined {
  if (!isRecord(item) || typeof item.id !== 'string' || item.id === '') return undefined
  const name = typeof item.name === 'string' ? cleanName(item.name) : ''
  const autoHide = item.autoHide === false ? { autoHide: false } : {}
  if (isBuiltinCategory(item.id)) return { id: item.id, ...(name ? { name } : {}), ...autoHide }
  return name ? { id: item.id, name, ...autoHide } : undefined
}

/** 读取存储中的分类项：丢弃不合法、重复的项；自定义分类超出上限的截掉 */
export function sanitizeCategories(value: unknown): readonly CategoryEntry[] {
  if (!Array.isArray(value)) return []
  const entries: CategoryEntry[] = []
  let custom = 0
  for (const item of value) {
    const entry = sanitizeEntry(item)
    if (!entry || entries.some(existing => existing.id === entry.id)) continue
    if (!isBuiltinCategory(entry.id)) {
      if (custom === MAX_CUSTOM_CATEGORIES) continue
      custom += 1
    }
    entries.push(entry)
  }
  return entries
}

function uniqueStrings(value: unknown, keep: (item: string) => boolean): readonly string[] {
  return Array.isArray(value) ? [...new Set(value.filter((item): item is string => typeof item === 'string' && keep(item)))] : []
}

/**
 * 读取存储中的自定义加速源：丢弃不合法、重复的项与分类不存在的项，超出上限的截掉；
 * 没有分类的（旧版本添加的）归入 LEGACY_CATEGORY_ID
 */
export function sanitizeCustomSources(value: unknown, categoryIds: ReadonlySet<string>): readonly CustomSource[] {
  if (!Array.isArray(value)) return []
  const sources: CustomSource[] = []
  for (const item of value) {
    if (sources.length === MAX_CUSTOM_SOURCES) break
    if (!isRecord(item) || typeof item.id !== 'string' || typeof item.template !== 'string') continue
    const { id } = item
    const template = parseSourceTemplate(item.template)
    const category = typeof item.category === 'string' ? item.category : LEGACY_CATEGORY_ID
    if (id === '' || isBuiltinSource(id) || !template || !categoryIds.has(category)) continue
    if (sources.some(source => source.id === id || templateKey(source.template) === templateKey(template))) continue
    sources.push({ id, name: sourceName(typeof item.name === 'string' ? item.name : '', template), template, category })
  }
  return sources
}

/** 生效的内置源的模板键（未删除、所在分类未删除） */
function activeBuiltinKeys(removedCategories: readonly string[], removedSources: readonly string[]): ReadonlySet<string> {
  const keys = new Set<string>()
  for (const category of BUILTIN_CATEGORIES) {
    if (removedCategories.includes(category.id)) continue
    for (const id of category.sources) {
      const source = BUILTIN_SOURCE_BY_ID.get(id)
      if (source && !removedSources.includes(id)) keys.add(templateKey(source.template))
    }
  }
  return keys
}

/**
 * 读取存储中的加速源设置（字段见 AccelerateSettings）。与生效的内置源重复的自定义源去掉：
 * 新版本把用户自己加过的源收为内置源时，不出现两个同样的源。替换原链接的分类不存在时为不替换；顺序里不存在的分类去掉
 */
export function sanitizeAccelerateSettings(stored: Readonly<Record<string, unknown>>): AccelerateSettings {
  const categories = sanitizeCategories(stored.categories)
  const removedCategories = uniqueStrings(stored.removedCategories, isBuiltinCategory)
  const removedSources = uniqueStrings(stored.removedSources, () => true)
  const categoryIds = new Set([
    ...BUILTIN_CATEGORIES.filter(category => !removedCategories.includes(category.id)).map(category => category.id),
    ...categories.filter(entry => !isBuiltinCategory(entry.id)).map(entry => entry.id)
  ])
  const builtinKeys = activeBuiltinKeys(removedCategories, removedSources)
  const customSources = sanitizeCustomSources(stored.customSources, categoryIds).filter(
    source => !builtinKeys.has(templateKey(source.template))
  )
  const replace = typeof stored.replaceCategory === 'string' && categoryIds.has(stored.replaceCategory) ? stored.replaceCategory : ''
  const categoryOrder = uniqueStrings(stored.categoryOrder, id => categoryIds.has(id))
  return { categories, categoryOrder, removedCategories, customSources, removedSources, replaceCategory: replace }
}

// ---------- 编辑 ----------

/** 名称是否已被其他分类使用（不区分大小写） */
function nameTaken(settings: AccelerateSettings, name: string, label: LabelText, except?: string): boolean {
  const key = name.toLowerCase()
  return listCategories(settings).some(category => category.id !== except && categoryName(category, label).toLowerCase() === key)
}

function uniqueId(base: string, taken: ReadonlySet<string>): string {
  let id = base
  for (let suffix = 2; taken.has(id); suffix += 1) id = `${base}-${suffix}`
  return id
}

/** 新建分类；time 为新建时间，用来生成标识 */
export function addCategory(settings: AccelerateSettings, name: string, time: number, label: LabelText): EditResult {
  const clean = cleanName(name)
  if (clean === '') return { ok: false, reason: 'invalid' }
  if (nameTaken(settings, clean, label)) return { ok: false, reason: 'exists' }
  const custom = settings.categories.filter(entry => !isBuiltinCategory(entry.id))
  if (custom.length >= MAX_CUSTOM_CATEGORIES) return { ok: false, reason: 'limit' }
  const id = uniqueId(`category-${time.toString(36)}`, new Set(settings.categories.map(entry => entry.id)))
  return { ok: true, id, patch: { categories: [...settings.categories, { id, name: clean }] } }
}

/** 改写一个分类项；内置分类的项没有改动时去掉 */
function withEntry(settings: AccelerateSettings, id: string, update: (entry: CategoryEntry) => CategoryEntry): readonly CategoryEntry[] {
  const current = settings.categories.find(entry => entry.id === id) ?? { id }
  const next = update(current)
  const empty = isBuiltinCategory(id) && next.name === undefined && next.autoHide === undefined
  const others = settings.categories.filter(entry => entry.id !== id)
  if (empty) return others
  return settings.categories.some(entry => entry.id === id)
    ? settings.categories.map(entry => (entry.id === id ? next : entry))
    : [...settings.categories, next]
}

/** 改名。内置分类改回默认名称或清空时恢复默认名称；自定义分类不能清空 */
export function renameCategory(settings: AccelerateSettings, id: string, name: string, label: LabelText): EditResult {
  const category = findCategory(settings, id)
  if (!category) return { ok: false, reason: 'invalid' }
  const clean = cleanName(name)
  const builtin = BUILTIN_CATEGORY_BY_ID.get(id)
  const defaultName = builtin ? categoryName(builtin, label) : undefined
  if (clean === '' && !builtin) return { ok: false, reason: 'invalid' }
  if (clean !== '' && nameTaken(settings, clean, label, id)) return { ok: false, reason: 'exists' }
  const override = clean === '' || clean === defaultName ? undefined : clean
  const categories = withEntry(settings, id, ({ name: _name, ...rest }) => (override === undefined ? rest : { ...rest, name: override }))
  return { ok: true, patch: { categories } }
}

/** 开关自动隐藏 */
export function setCategoryAutoHide(settings: AccelerateSettings, id: string, autoHide: boolean): Partial<AccelerateSettings> {
  if (!findCategory(settings, id)) return {}
  return { categories: withEntry(settings, id, ({ autoHide: _autoHide, ...rest }) => (autoHide ? rest : { ...rest, autoHide: false })) }
}

/** 删除分类，连同其中的自定义源；内置分类记入已删除。替换原链接用的是它时改为不替换；从顺序中去掉 */
export function removeCategory(settings: AccelerateSettings, id: string): Partial<AccelerateSettings> {
  if (!findCategory(settings, id)) return {}
  return {
    categories: settings.categories.filter(entry => entry.id !== id),
    customSources: settings.customSources.filter(source => source.category !== id),
    ...(isBuiltinCategory(id) ? { removedCategories: [...settings.removedCategories, id] } : {}),
    ...(settings.replaceCategory === id ? { replaceCategory: '' } : {}),
    ...(settings.categoryOrder.includes(id) ? { categoryOrder: settings.categoryOrder.filter(item => item !== id) } : {})
  }
}

/**
 * 把分类移到第 index 位（按生效的分类计，从 0 起，越界时到首尾），即时生效：页面上的选项、下拉菜单、替换原链接的列表都按新顺序。
 * 位置不变时不写入；移完与默认顺序相同时清空顺序
 */
export function moveCategory(settings: AccelerateSettings, id: string, index: number): Partial<AccelerateSettings> {
  const ids = listCategories(settings).map(category => category.id)
  if (!ids.includes(id)) return {}
  const rest = ids.filter(item => item !== id)
  const to = Math.max(0, Math.min(Math.trunc(index), rest.length))
  const next = [...rest.slice(0, to), id, ...rest.slice(to)]
  if (next.every((item, position) => item === ids[position])) return {}
  const defaults = listCategories({ ...settings, categoryOrder: [] }).map(category => category.id)
  return { categoryOrder: next.every((item, position) => item === defaults[position]) ? [] : next }
}

/** 在分类中添加自定义加速源；time 为添加时间，用来生成标识。效果相同的源（任一分类中）已存在时不添加 */
export function addSource(settings: AccelerateSettings, categoryId: string, name: string, template: string, time: number): EditResult {
  const parsed = parseSourceTemplate(template)
  if (!parsed || !findCategory(settings, categoryId)) return { ok: false, reason: 'invalid' }
  const key = templateKey(parsed)
  if (listSources(settings).some(source => templateKey(source.template) === key)) return { ok: false, reason: 'exists' }
  if (settings.customSources.length >= MAX_CUSTOM_SOURCES) return { ok: false, reason: 'limit' }
  const id = uniqueId(`custom-${time.toString(36)}`, new Set(settings.customSources.map(source => source.id)))
  const source: CustomSource = { id, name: sourceName(name, parsed), template: parsed, category: categoryId }
  return { ok: true, id, patch: { customSources: [...settings.customSources, source] } }
}

/** 删除加速源：内置源记入已删除，自定义源直接去掉 */
export function removeSource(settings: AccelerateSettings, id: string): Partial<AccelerateSettings> {
  if (!isBuiltinSource(id)) return { customSources: settings.customSources.filter(source => source.id !== id) }
  return settings.removedSources.includes(id) ? {} : { removedSources: [...settings.removedSources, id] }
}

/** 删除多个加速源（见 removeSource），一次写入 */
export function removeSources(settings: AccelerateSettings, ids: readonly string[]): Partial<AccelerateSettings> {
  const targets = new Set(ids)
  const builtin = [...targets].filter(id => isBuiltinSource(id) && !settings.removedSources.includes(id))
  const custom = settings.customSources.filter(source => !targets.has(source.id))
  return {
    ...(custom.length < settings.customSources.length ? { customSources: custom } : {}),
    ...(builtin.length > 0 ? { removedSources: [...settings.removedSources, ...builtin] } : {})
  }
}

/** 已删除的内置分类与内置源数 */
export function countRemovedBuiltins(settings: AccelerateSettings): number {
  return settings.removedCategories.filter(isBuiltinCategory).length + settings.removedSources.filter(isBuiltinSource).length
}

/** 恢复已删除的内置分类与内置源；与内置源重复的自定义源一并去掉 */
export function restoreBuiltins(settings: AccelerateSettings): Partial<AccelerateSettings> {
  const keys = activeBuiltinKeys([], [])
  return {
    removedCategories: [],
    removedSources: [],
    customSources: settings.customSources.filter(source => !keys.has(templateKey(source.template)))
  }
}
