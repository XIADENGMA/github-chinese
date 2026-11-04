import { normalizeText } from '../core/matcher'
import { sanitizeCustomEntries, type CustomEntries } from './settings'

/** [原文, 译文] */
export type EntryPair = readonly [source: string, target: string]

/** 行内编辑的字段 */
export type EntryField = 'source' | 'target'

export type EntryEditResult =
  { readonly ok: true; readonly entries: CustomEntries } | { readonly ok: false; readonly reason: 'invalid' | 'exists' }

/** 导出文件名 */
export const EXPORT_FILE_NAME = 'github-chinese-custom-entries.json'

/** 原文按页面文本规则规范化，译文去首尾空白；任一为空返回 undefined */
export function normalizeEntry(source: string, target: string): EntryPair | undefined {
  const key = normalizeText(source)
  const value = target.trim()
  return key !== '' && value !== '' ? [key, value] : undefined
}

function normalizeEntries(entries: CustomEntries): CustomEntries {
  return Object.fromEntries(
    Object.entries(entries).flatMap(([source, target]) => {
      const pair = normalizeEntry(source, target)
      return pair ? [pair] : []
    })
  )
}

/**
 * 解析导入的 JSON（{ 原文: 译文 }）。
 * 不是对象，或有键但无一有效时返回 undefined；无效项丢弃。
 */
export function parseCustomEntriesJson(text: string): CustomEntries | undefined {
  let parsed: unknown
  try {
    parsed = JSON.parse(text)
  } catch {
    return undefined
  }
  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) return undefined
  const entries = normalizeEntries(sanitizeCustomEntries(parsed))
  if (Object.keys(entries).length === 0 && Object.keys(parsed).length > 0) return undefined
  return entries
}

/** 新增词条；原文已存在时不覆盖 */
export function addEntry(entries: CustomEntries, source: string, target: string): EntryEditResult {
  const pair = normalizeEntry(source, target)
  if (!pair) return { ok: false, reason: 'invalid' }
  if (Object.hasOwn(entries, pair[0])) return { ok: false, reason: 'exists' }
  return { ok: true, entries: { ...entries, [pair[0]]: pair[1] } }
}

/** 修改词条（可改原文），保持原有顺序；新原文与其他词条重复时拒绝 */
export function editEntry(entries: CustomEntries, original: string, source: string, target: string): EntryEditResult {
  const pair = normalizeEntry(source, target)
  if (!pair) return { ok: false, reason: 'invalid' }
  const [key, value] = pair
  if (key !== original && Object.hasOwn(entries, key)) return { ok: false, reason: 'exists' }
  if (!Object.hasOwn(entries, original)) return { ok: true, entries: { ...entries, [key]: value } }
  const pairs = Object.entries(entries).map((entry): EntryPair => (entry[0] === original ? pair : entry))
  return { ok: true, entries: Object.fromEntries(pairs) }
}

export function removeEntry(entries: CustomEntries, source: string): CustomEntries {
  return Object.fromEntries(Object.entries(entries).filter(([key]) => key !== source))
}

/** 合并导入的词条，同原文以导入为准 */
export function mergeEntries(entries: CustomEntries, imported: CustomEntries): CustomEntries {
  return { ...entries, ...imported }
}

/** 按原文或译文筛选（不区分大小写），新添加的在前 */
export function filterEntries(entries: CustomEntries, query: string): EntryPair[] {
  const needle = query.trim().toLowerCase()
  const pairs = Object.entries(entries).reverse()
  if (needle === '') return pairs
  return pairs.filter(([source, target]) => source.toLowerCase().includes(needle) || target.toLowerCase().includes(needle))
}

export function serializeEntries(entries: CustomEntries): string {
  return `${JSON.stringify(entries, null, 2)}\n`
}
