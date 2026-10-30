/**
 * 行内句的句型键：宿主各段文字的原文，元素子节点换成槽位字符；规范化后去掉槽位两侧的空格。
 * 词典的字符串句型用 {} / {#} 标出槽位，编译成同样的键；正则句型中的槽位换成匹配槽位字符的写法。
 */
import { normalizeText } from './text'

/** 槽位：私用区字符 */
export const SLOT = '\ue000'
/** 数字槽位：只含数字（可带千分位逗号）的叶子元素 */
export const NUM_SLOT = '\ue001'

/** 宿主子节点上限：超过时不按行内句处理（列表、表格等容器）；inline.ts 拆句用同一上限，由 inline-key.test 核对 */
export const MAX_SENTENCE_CHILDREN = 40
/** 句型键长度上限：超过时不按行内句处理（正文段落）；同上 */
export const MAX_SENTENCE_KEY = 300

const SLOT_SPACE_RE = new RegExp(` ?([${SLOT}${NUM_SLOT}]) ?`, 'g')
const NUM_SLOT_RE = new RegExp(NUM_SLOT, 'g')
/** 句型键中的槽位 */
const KEY_SLOT_RE = new RegExp(`[${SLOT}${NUM_SLOT}]`)
/** 字符串句型中的槽位 */
const PATTERN_SLOT_RE = /\{(#?)\}/g
/** 正则句型中的槽位 \{\} / \{#\}（不转义的 {} / {#} 也算），连同两侧各一个空格 */
const REGEXP_SLOT_RE = / ?\\?\{(#?)\\?\} ?/g
/** 译文中的槽位：{} / {#}，以及正则替换带入的槽位字符 */
const TEMPLATE_SLOT_RE = new RegExp(`\\{#?\\}|[${SLOT}${NUM_SLOT}]`)

/** 句型键：texts 比 marks 多一个，依次穿插 */
export function sentenceKey(texts: readonly string[], marks: readonly string[]): string {
  let raw = texts[0] ?? ''
  marks.forEach((mark, i) => {
    raw += mark + (texts[i + 1] ?? '')
  })
  return normalizeText(raw).replace(SLOT_SPACE_RE, '$1')
}

/** 数字槽位换成普通槽位：能对应同一页面句型键的字符串句型，放宽后的键相同（见 keyMatches） */
export function generalizeKey(key: string): string {
  return key.replace(NUM_SLOT_RE, SLOT)
}

/** 字符串句型的键 */
export function patternKey(pattern: string): string {
  const marked = pattern.replace(PATTERN_SLOT_RE, (_, hash: string) => (hash ? NUM_SLOT : SLOT))
  return normalizeText(marked).replace(SLOT_SPACE_RE, '$1')
}

/** 字符串句型的键能否对应页面的句型键：{} 对应任一槽位，{#} 只对应数字槽位，其余字符相同 */
export function keyMatches(pattern: string, key: string): boolean {
  if (pattern.length !== key.length) return false
  for (let i = 0; i < key.length; i++) {
    if (pattern[i] !== key[i] && !(pattern[i] === SLOT && key[i] === NUM_SLOT)) return false
  }
  return true
}

/** 句型键对应的宿主至少有几个子节点：每个槽位一个元素，非空的每段文字至少一个文本节点 */
export function minChildren(key: string): number {
  const segments = key.split(KEY_SLOT_RE)
  return segments.length - 1 + segments.filter((segment) => segment !== '').length
}

/** 正则句型：{} 匹配任一槽位，{#} 只匹配数字槽位 */
export function patternRegExp(pattern: RegExp): RegExp {
  const source = pattern.source.replace(REGEXP_SLOT_RE, (_, hash: string) => (hash ? NUM_SLOT : `[${SLOT}${NUM_SLOT}]`))
  return new RegExp(source, pattern.flags)
}

/** 句型或译文中的槽位数 */
export function slotCount(text: string): number {
  return text.split(TEMPLATE_SLOT_RE).length - 1
}

/** 句型的槽位数：字符串句型数 {} / {#}，正则句型数 \{\} / \{#\} */
export function patternSlots(pattern: string | RegExp): number {
  return typeof pattern === 'string' ? slotCount(pattern) : (pattern.source.match(REGEXP_SLOT_RE) ?? []).length
}

/** 按槽位切分译文；段数不是槽位数 + 1 时返回 undefined */
export function splitTemplate(translation: string, slots: number): string[] | undefined {
  const segments = translation.split(TEMPLATE_SLOT_RE)
  return segments.length === slots + 1 ? segments : undefined
}
