/**
 * 正则规则索引：按文本首字符筛出候选规则，再按字面前缀跳过；词条未命中的文本不必逐条执行作用域内全部正则。
 * 只做保守推导：推不出首字符的规则（wild）对任何文本都尝试。推导正确时结果与逐条执行完全一致；
 * 推错会跳过该规则，可能漏译，也可能由后面的规则或更通用作用域的规则命中而误译。
 */
import type { RegExpRule } from './types'

export interface IndexedRule {
  readonly rule: RegExpRule
  /** 文本须以此开头才可能匹配；空串不限 */
  readonly prefix: string
}

export interface RegExpIndex {
  /** 可能匹配该文本的规则，保持原顺序 */
  candidates(text: string): readonly IndexedRule[]
}

/** 这些标志改变首字符的含义：m 让 ^ 匹配行首，u / v 按码点处理，g / y 由 lastIndex 决定起点 */
const UNSUPPORTED_FLAGS_RE = /[muvgy]/
/** 前缀推导另外不支持 i（大小写不定） */
const PREFIX_UNSUPPORTED_FLAGS_RE = /[imuvgy]/
const META: ReadonlySet<string> = new Set(['\\', '^', '$', '.', '|', '?', '*', '+', '(', ')', '[', ']', '{', '}'])
const ALNUM_RE = /[A-Za-z0-9]/
const ASCII_LETTER_RE = /[A-Za-z]/
/** 码元上限：ASCII */
const ASCII_LIMIT = 0x80
/** 量词 {n} / {n,} / {n,m}，取下限 n（可带前导零）；不成量词的 {（如 {0,x}）是字面字符 */
const REPEAT_RE = /^\{(\d+)(?:,\d*)?\}/
const UNICODE_ESCAPE_RE = /^[\da-f]{4}$/i
const HEX_ESCAPE_RE = /^[\da-f]{2}$/i
/** 字符类区间展开的上限：更大的区间按 wild 处理 */
const MAX_CLASS_RANGE = 256
const DIGITS: readonly string[] = [...'0123456789']

/** 扫描 [start, end)：跳过转义与字符类，遇到括号与顶层 | 时回调 */
function scan(source: string, start: number, end: number, visit: (char: string, index: number) => boolean | void): void {
  let inClass = false
  for (let index = start; index < end; index += 1) {
    const char = source[index]!
    if (char === '\\') {
      index += 1
      continue
    }
    if (inClass) {
      if (char === ']') inClass = false
      continue
    }
    if (char === '[') inClass = true
    else if (visit(char, index) === true) return
  }
}

/** [start, end) 按顶层 | 切开的各段 */
function alternatives(source: string, start: number, end: number): [number, number][] {
  const parts: [number, number][] = []
  let depth = 0
  let from = start
  scan(source, start, end, (char, index) => {
    if (char === '(') depth += 1
    else if (char === ')') depth -= 1
    else if (char === '|' && depth === 0) {
      parts.push([from, index])
      from = index + 1
    }
  })
  parts.push([from, end])
  return parts
}

/** 与 start 处的 ( 配对的 ) 位置；不配对返回 -1 */
function closingParen(source: string, start: number): number {
  let depth = 0
  let found = -1
  scan(source, start, source.length, (char, index) => {
    if (char === '(') depth += 1
    else if (char === ')') {
      depth -= 1
      if (depth === 0) {
        found = index
        return true
      }
    }
    return false
  })
  return found
}

/** index 处是否是允许零次的量词：?、*、下限为 0 的 {n,m}（含 {00}、{000,1} 这类前导零写法） */
function optionalAt(source: string, index: number): boolean {
  const char = source[index]
  if (char === '?' || char === '*') return true
  if (char !== '{') return false
  const repeat = REPEAT_RE.exec(source.slice(index))
  return repeat !== null && Number(repeat[1]) === 0
}

/** 分组内容的起点：跳过 ?: 与 ?<名称>；前瞻、后顾、修饰符返回 -1 */
function groupBodyStart(source: string, open: number, close: number): number {
  const inner = open + 1
  if (source[inner] !== '?') return inner
  if (source[inner + 1] === ':') return inner + 2
  if (source[inner + 1] === '<' && source[inner + 2] !== '=' && source[inner + 2] !== '!') {
    const nameEnd = source.indexOf('>', inner)
    return nameEnd < 0 || nameEnd > close ? -1 : nameEnd + 1
  }
  return -1
}

/**
 * index 处转义（\ 之后）代表的单个字符与占用长度：标点、\uXXXX、\xXX。
 * \d 等字符组返回 undefined，由调用方处理
 */
function escapedChar(source: string, index: number): [string, number] | undefined {
  const escaped = source[index]
  if (escaped === undefined) return undefined
  if (!ALNUM_RE.test(escaped)) return [escaped, 1]
  const hex = escaped === 'u' ? UNICODE_ESCAPE_RE.exec(source.slice(index + 1, index + 5)) : null
  if (hex) return [String.fromCharCode(Number.parseInt(hex[0], 16)), 5]
  const byte = escaped === 'x' ? HEX_ESCAPE_RE.exec(source.slice(index + 1, index + 3)) : null
  if (byte) return [String.fromCharCode(Number.parseInt(byte[0], 16)), 3]
  return undefined
}

/** open 处的简单字符类（不取反，只含字面字符、区间与 \d）：可匹配的字符与类之后的位置；其余返回 undefined */
function classHead(source: string, open: number): [Set<string>, number] | undefined {
  if (source[open + 1] === '^') return undefined
  const chars = new Set<string>()
  let index = open + 1
  while (index < source.length) {
    let char = source[index]!
    if (char === ']') return chars.size > 0 ? [chars, index + 1] : undefined
    if (char === '\\') {
      if (source[index + 1] === 'd') {
        for (const digit of DIGITS) chars.add(digit)
        index += 2
        continue
      }
      const escaped = escapedChar(source, index + 1)
      if (!escaped) return undefined
      char = escaped[0]
      index += 1 + escaped[1]
    } else index += 1
    if (source[index] !== '-' || source[index + 1] === ']' || source[index + 1] === undefined) {
      chars.add(char)
      continue
    }
    // 区间 a-z
    let last = source[index + 1]!
    let width = 1
    if (last === '\\') {
      const escaped = escapedChar(source, index + 2)
      if (!escaped) return undefined
      last = escaped[0]
      width = 1 + escaped[1]
    }
    const from = char.charCodeAt(0)
    const to = last.charCodeAt(0)
    if (to < from || to - from > MAX_CLASS_RANGE) return undefined
    for (let code = from; code <= to; code += 1) chars.add(String.fromCharCode(code))
    index += 1 + width
  }
  return undefined
}

/** 序列 [start, end) 匹配时的首字符集合；推不出（空、通配、可省略的首原子）返回 undefined */
function sequenceHead(source: string, start: number, end: number): Set<string> | undefined {
  if (start >= end) return undefined
  const char = source[start]!
  let head: Set<string>
  let next: number
  if (char === '\\') {
    if (source[start + 1] === 'd') {
      head = new Set(DIGITS)
      next = start + 2
    } else {
      const escaped = escapedChar(source, start + 1)
      if (!escaped) return undefined
      head = new Set([escaped[0]])
      next = start + 1 + escaped[1]
    }
  } else if (char === '[') {
    const parsed = classHead(source, start)
    if (!parsed) return undefined
    ;[head, next] = parsed
  } else if (char === '(') {
    const close = closingParen(source, start)
    if (close < 0 || close >= end) return undefined
    const body = groupBodyStart(source, start, close)
    if (body < 0) return undefined
    head = new Set()
    for (const [from, to] of alternatives(source, body, close)) {
      const part = sequenceHead(source, from, to)
      if (!part) return undefined
      for (const item of part) head.add(item)
    }
    next = close + 1
  } else if (META.has(char)) {
    return undefined
  } else {
    head = new Set([char])
    next = start + 1
  }
  return next < end && optionalAt(source, next) ? undefined : head
}

/** 源码顶层（不在分组、字符类内）是否有 |：^a|b$ 只有前一支锚定开头 */
export function hasTopLevelAlternative(pattern: RegExp): boolean {
  return alternatives(pattern.source, 0, pattern.source.length).length > 1
}

/** 能匹配的文本的首字符（UTF-16 码元）集合；推不出返回 undefined */
export function headSet(pattern: RegExp): ReadonlySet<string> | undefined {
  const { source, flags } = pattern
  if (UNSUPPORTED_FLAGS_RE.test(flags) || !source.startsWith('^') || hasTopLevelAlternative(pattern)) return undefined
  const head = sequenceHead(source, 1, source.length)
  if (!head || !flags.includes('i')) return head
  // 非 Unicode 模式下 ASCII 字母只与 ASCII 字母互为大小写
  const folded = new Set<string>()
  for (const char of head) {
    if (char.charCodeAt(0) >= ASCII_LIMIT) return undefined
    if (ASCII_LETTER_RE.test(char)) {
      folded.add(char.toLowerCase())
      folded.add(char.toUpperCase())
    } else folded.add(char)
  }
  return folded
}

/** 匹配的文本必定以之开头的字面前缀；推不出为空串 */
export function literalPrefix(pattern: RegExp): string {
  const { source, flags } = pattern
  if (PREFIX_UNSUPPORTED_FLAGS_RE.test(flags) || !source.startsWith('^') || hasTopLevelAlternative(pattern)) return ''
  let prefix = ''
  let index = 1
  while (index < source.length) {
    let char = source[index]!
    let width = 1
    if (char === '\\') {
      const escaped = source[index + 1]
      if (escaped === undefined || ALNUM_RE.test(escaped)) break
      char = escaped
      width = 2
    } else if (META.has(char)) break
    const after = source[index + width]
    if (after === '?' || after === '*' || after === '{') break
    prefix += char
    if (after === '+') break
    index += width
  }
  return prefix
}

/** 按原顺序合并两组升序下标 */
function mergeOrdered(a: readonly number[], b: readonly number[]): number[] {
  const merged: number[] = []
  let i = 0
  let j = 0
  while (i < a.length || j < b.length) {
    if (j >= b.length || (i < a.length && a[i]! < b[j]!)) merged.push(a[i++]!)
    else merged.push(b[j++]!)
  }
  return merged
}

export function createRegExpIndex(rules: readonly RegExpRule[]): RegExpIndex {
  const indexed: IndexedRule[] = rules.map(rule => ({ rule, prefix: literalPrefix(rule[0]) }))
  const wild: number[] = []
  const byHead = new Map<string, number[]>()
  rules.forEach(([pattern], position) => {
    const head = headSet(pattern)
    if (!head) {
      wild.push(position)
      return
    }
    for (const char of head) {
      const list = byHead.get(char)
      if (list) list.push(position)
      else byHead.set(char, [position])
    }
  })
  const wildRules = wild.map(position => indexed[position]!)
  /** 首字符 → 候选规则：第一次用到时合并 */
  const merged = new Map<string, readonly IndexedRule[]>()

  return {
    candidates(text) {
      const char = text.charAt(0)
      const cached = merged.get(char)
      if (cached) return cached
      const own = byHead.get(char)
      const list = own ? mergeOrdered(own, wild).map(position => indexed[position]!) : wildRules
      merged.set(char, list)
      return list
    }
  }
}
