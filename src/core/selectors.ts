/**
 * 忽略选择器编译。
 * - 逐条校验，非法选择器丢弃，不影响其余选择器。
 * - 按最右复合选择器中必须出现的特征（类名 / id / 属性 / 标签）建索引，
 *   遍历时只对带有这些特征的元素调用 matches，避免每个元素都匹配整串选择器。
 *   :is() / :where() 展开为多个特征；属性选择器的 *= ^= $= ~= |= 先用字符串预判。
 */

/** 属性条件：运算符与小写值；运算符为空表示只要求属性存在 */
export interface AttributeCondition {
  readonly name: string
  readonly operator: string
  readonly value: string
}

/** 选择器特征 */
export type SelectorKey =
  { readonly kind: 'class' | 'id' | 'tag'; readonly name: string } | { readonly kind: 'attribute'; readonly condition: AttributeCondition }

export interface IndexedSelector {
  readonly selector: string
  /** 属性索引的预判条件 */
  readonly condition?: AttributeCondition
}

export interface IgnoreIndex {
  /** 全部有效选择器（逗号连接），用于 closest 判断祖先；没有时为空串 */
  readonly selector: string
  /** 被丢弃的非法选择器 */
  readonly invalid: readonly string[]
  readonly byClass: ReadonlyMap<string, readonly string[]>
  readonly byId: ReadonlyMap<string, readonly string[]>
  /** [name="value"]：小写属性名 → 小写属性值 → 选择器 */
  readonly byValue: ReadonlyMap<string, ReadonlyMap<string, readonly string[]>>
  /** 其他属性选择器：小写属性名 → 选择器与预判条件 */
  readonly byAttribute: ReadonlyMap<string, readonly IndexedSelector[]>
  /** 小写标签名 → 选择器 */
  readonly byTag: ReadonlyMap<string, readonly string[]>
  /** 提取不到特征的选择器：每个元素都要匹配 */
  readonly universal: readonly string[]
}

interface CompoundParts {
  readonly rest: string
  readonly attributes: readonly AttributeCondition[]
  /** :is() / :where() 的参数 */
  readonly alternatives: readonly string[]
}

const IDENT = '[\\w\\u0080-\\uFFFF-]+'
const CLASS_RE = new RegExp(`\\.(${IDENT})`)
const ID_RE = new RegExp(`#(${IDENT})`)
const TAG_RE = /^([a-zA-Z][\w-]*)/
const ATTRIBUTE_RE = new RegExp(`^\\[\\s*(${IDENT})\\s*(?:([~|^$*]?=)\\s*(?:"([^"]*)"|'([^']*)'|(${IDENT}))\\s*(?:[is]\\s*)?)?\\]$`, 'i')
const ANY_OF_RE = /:(?:is|where|matches|-webkit-any|-moz-any)$/i
const PSEUDO_RE = /::?[\w-]+/g
const WHITESPACE_RE = /\s/
const SPACES_RE = /\s+/
const MAX_DEPTH = 4

/** 扫描顶层字符（跳过转义、引号、括号内容），对每个顶层字符回调 */
function scanTopLevel(selector: string, onChar: (char: string, index: number) => void): void {
  let depth = 0
  let quote = ''
  for (let i = 0; i < selector.length; i++) {
    const char = selector[i]!
    if (char === '\\') {
      i++
    } else if (quote) {
      if (char === quote) quote = ''
    } else if (char === '"' || char === "'") {
      quote = char
    } else if (char === '(' || char === '[') {
      depth++
    } else if (char === ')' || char === ']') {
      depth--
    } else if (depth === 0) {
      onChar(char, i)
    }
  }
}

/** 按顶层逗号拆分选择器列表 */
export function splitSelectorList(selector: string): string[] {
  const parts: string[] = []
  let start = 0
  scanTopLevel(selector, (char, index) => {
    if (char !== ',') return
    parts.push(selector.slice(start, index))
    start = index + 1
  })
  parts.push(selector.slice(start))
  return parts.map(part => part.trim()).filter(Boolean)
}

/** 最右复合选择器（最后一个顶层组合符之后的部分） */
function rightmostCompound(selector: string): string {
  let start = 0
  scanTopLevel(selector, (char, index) => {
    if (char === '>' || char === '+' || char === '~' || WHITESPACE_RE.test(char)) start = index + 1
  })
  return selector.slice(start).trim()
}

function parseAttribute(group: string): AttributeCondition | undefined {
  const match = ATTRIBUTE_RE.exec(group)
  if (!match) return undefined
  const value = match[3] ?? match[4] ?? match[5] ?? ''
  return { name: match[1]!.toLowerCase(), operator: match[2] ?? '', value: value.toLowerCase() }
}

/** 拆分复合选择器：属性条件、:is() 参数与其余部分；遇到无法识别的属性选择器返回 undefined */
function splitCompound(compound: string): CompoundParts | undefined {
  const attributes: AttributeCondition[] = []
  const alternatives: string[] = []
  let rest = ''
  let depth = 0
  let quote = ''
  let bracketStart = -1
  let argumentStart = -1
  let anyOf = false
  for (let i = 0; i < compound.length; i++) {
    const char = compound[i]!
    if (quote) {
      if (char === quote) quote = ''
    } else if ((char === '"' || char === "'") && (bracketStart >= 0 || depth > 0)) {
      quote = char
    } else if (bracketStart >= 0) {
      if (char !== ']') continue
      const attribute = parseAttribute(compound.slice(bracketStart, i + 1))
      if (!attribute) return undefined
      attributes.push(attribute)
      bracketStart = -1
    } else if (char === '(') {
      if (depth === 0) {
        argumentStart = i + 1
        anyOf = ANY_OF_RE.test(rest)
      }
      depth++
    } else if (char === ')') {
      depth--
      if (depth === 0 && anyOf) alternatives.push(compound.slice(argumentStart, i))
    } else if (depth === 0) {
      if (char === '[') bracketStart = i
      else rest += char
    }
  }
  return { rest: rest.replace(PSEUDO_RE, ''), attributes, alternatives }
}

/** 属性条件的选择性：= 最高，其次带值的运算符，最后仅要求存在 */
function attributeRank(condition: AttributeCondition): number {
  if (condition.operator === '=') return 0
  return condition.operator ? 1 : 2
}

/**
 * 提取选择器必须满足的特征：元素至少具备其中之一才可能命中。
 * 提取不到返回 undefined（需要对每个元素匹配）。
 */
export function selectorKeys(selector: string, depth = 0): SelectorKey[] | undefined {
  const compound = rightmostCompound(selector)
  if (!compound || compound.includes('\\') || depth > MAX_DEPTH) return undefined
  const parts = splitCompound(compound)
  if (!parts) return undefined
  const className = CLASS_RE.exec(parts.rest)?.[1]
  if (className) return [{ kind: 'class', name: className }]
  const id = ID_RE.exec(parts.rest)?.[1]
  if (id) return [{ kind: 'id', name: id }]
  const attribute = [...parts.attributes].sort((a, b) => attributeRank(a) - attributeRank(b))[0]
  if (attribute) return [{ kind: 'attribute', condition: attribute }]
  const tag = TAG_RE.exec(parts.rest)?.[1]
  if (tag) return [{ kind: 'tag', name: tag.toLowerCase() }]
  // 只剩 :is() / :where()：任一分支命中即可，取各分支特征的并集
  if (parts.alternatives.length !== 1) return undefined
  const keys: SelectorKey[] = []
  for (const alternative of splitSelectorList(parts.alternatives[0]!)) {
    const alternativeKeys = selectorKeys(alternative, depth + 1)
    if (!alternativeKeys) return undefined
    keys.push(...alternativeKeys)
  }
  return keys.length > 0 ? keys : undefined
}

/** 属性值是否可能满足条件（小写比较，宁多勿漏） */
export function conditionHolds(condition: AttributeCondition, value: string): boolean {
  const expected = condition.value
  switch (condition.operator) {
    case '~=':
      return expected !== '' && !SPACES_RE.test(expected) && value.toLowerCase().split(SPACES_RE).includes(expected)
    case '|=': {
      const actual = value.toLowerCase()
      return actual === expected || actual.startsWith(`${expected}-`)
    }
    case '^=':
      return expected !== '' && value.toLowerCase().startsWith(expected)
    case '$=':
      return expected !== '' && value.toLowerCase().endsWith(expected)
    case '*=':
      return expected !== '' && value.toLowerCase().includes(expected)
    case '=':
      return value.toLowerCase() === expected
    default:
      return true
  }
}

function isValidSelector(selector: unknown, probe: Element): selector is string {
  if (typeof selector !== 'string' || !selector.trim()) return false
  try {
    probe.matches(selector)
    return true
  } catch {
    return false
  }
}

function push<T>(map: Map<string, T[]>, key: string, item: T): void {
  const list = map.get(key)
  if (list) list.push(item)
  else map.set(key, [item])
}

/**
 * 编译忽略选择器。
 * @param probe 用于校验选择器的元素（与页面同一文档）
 */
export function compileIgnoreIndex(selectors: readonly unknown[], probe: Element): IgnoreIndex {
  const valid: string[] = []
  const invalid: string[] = []
  const byClass = new Map<string, string[]>()
  const byId = new Map<string, string[]>()
  const byValue = new Map<string, Map<string, string[]>>()
  const byAttribute = new Map<string, IndexedSelector[]>()
  const byTag = new Map<string, string[]>()
  const universal: string[] = []

  const add = (key: SelectorKey, selector: string): void => {
    if (key.kind !== 'attribute') {
      push(key.kind === 'class' ? byClass : key.kind === 'id' ? byId : byTag, key.name, selector)
      return
    }
    const { condition } = key
    if (condition.operator === '=') {
      const values = byValue.get(condition.name) ?? new Map<string, string[]>()
      byValue.set(condition.name, values)
      push(values, condition.value, selector)
    } else {
      push(byAttribute, condition.name, { selector, condition })
    }
  }

  for (const selector of new Set(selectors)) {
    if (!isValidSelector(selector, probe)) {
      invalid.push(String(selector))
      continue
    }
    valid.push(selector)
    for (const complex of splitSelectorList(selector)) {
      const keys = selectorKeys(complex)
      if (!keys) universal.push(complex)
      else for (const key of keys) add(key, complex)
    }
  }
  return { selector: valid.join(', '), invalid, byClass, byId, byValue, byAttribute, byTag, universal }
}

/** matches 出错（个别引擎对已通过校验的选择器仍可能在匹配时抛错）按未命中处理 */
export function safeMatches(element: Element, selector: string): boolean {
  try {
    return element.matches(selector)
  } catch {
    return false
  }
}

function anyMatches(element: Element, selectors: readonly string[] | undefined): boolean {
  if (!selectors) return false
  for (const selector of selectors) {
    if (safeMatches(element, selector)) return true
  }
  return false
}

/** class 属性值中命中索引的选择器是否匹配 */
export function classMatches(index: IgnoreIndex, element: Element, classValue: string): boolean {
  if (index.byClass.size === 0) return false
  for (const token of classValue.split(SPACES_RE)) {
    if (token && anyMatches(element, index.byClass.get(token))) return true
  }
  return false
}

/** 单个属性（名、值）命中索引的选择器是否匹配 */
export function attributeMatches(index: IgnoreIndex, element: Element, name: string, value: string): boolean {
  const indexed = index.byAttribute.get(name)
  if (indexed) {
    for (const entry of indexed) {
      if ((!entry.condition || conditionHolds(entry.condition, value)) && safeMatches(element, entry.selector)) return true
    }
  }
  const byValue = index.byValue.get(name)
  if (byValue && anyMatches(element, byValue.get(value.toLowerCase()))) return true
  if (name === 'class') return classMatches(index, element, value)
  return name === 'id' && anyMatches(element, index.byId.get(value))
}

/** 不依赖属性的选择器（标签、无特征）是否匹配 */
export function tagMatches(index: IgnoreIndex, element: Element, localName: string): boolean {
  return anyMatches(element, index.byTag.get(localName)) || anyMatches(element, index.universal)
}

/** 元素自身是否命中忽略选择器 */
export function elementMatches(index: IgnoreIndex, element: Element): boolean {
  if (tagMatches(index, element, element.localName)) return true
  const attributes = element.attributes
  for (let i = 0; i < attributes.length; i++) {
    const attribute = attributes[i]!
    if (attributeMatches(index, element, attribute.name, attribute.value)) return true
  }
  return false
}
