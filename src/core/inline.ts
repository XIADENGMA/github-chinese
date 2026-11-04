/**
 * 行内片段：被 <kbd> 拆开的句子、被其他元素拆开的句子（行内句）、行内元素旁的孤立标点。
 *
 * kbd 句子：宿主直接子节点中由文本、注释、kbd 组成且含 kbd 的连续片段算一句，其他元素是片段边界。
 * 第一个 kbd 之前、最后一个 kbd 之后都有文字时整句匹配，译文按 kbd 文字切分后写回各段文字。
 *
 * 行内句：宿主（不含 kbd）的直接子节点中，元素是槽位，槽位之间的文字是一段。句型键（各段原文 + 槽位字符）
 * 命中行内句规则时，译文按槽位切分写回各段；槽位元素不改动，其中的文字照常处理。
 * 未命中时各段照常处理（逐段翻译、逐段记未翻译）；曾按整句写入的宿主不再命中时各段立即照常重算。
 * 槽位内的变化使槽位字符改变（数字槽位与普通槽位之间）时，宿主整句重算。
 *
 * 孤立标点：链接等行内元素旁只有一个半角标点的文本节点（按整句写入的段不算）。语境文字（最近的直接文本兄弟；
 * 标点单独包在 span 里、span 前后都没有直接文本兄弟时，取 span 前一个兄弟元素里最后一段文字）是本引擎写入的中文、
 * 且位置合适时转为全角；一轮处理结束时统一重算，语境不再是中文时写回原文。
 * 处理过文本组、文字被引擎另行改写（先译后忽略的区域还原、合并区域整段写入、行内句重判）、子节点有增删的元素
 * 及其祖先含过孤立标点时，其中的标点在轮末重算。
 *
 * 原文由引擎按轮取得（host.textSource）：取原文有副作用（计改回次数、解析中追加标点时改写记录），
 * 同一轮里同一节点不论经过几条路径都只取一次。全角标点两侧的空白见 fit.ts。
 */
import { COMMENT_NODE, ELEMENT_NODE, isTextNode, textRun } from './dom'
import { MAX_SENTENCE_CHILDREN, MAX_SENTENCE_KEY, NUM_SLOT, SLOT, sentenceKey, splitTemplate } from './inline-key'
import { normalizeText, withLeading, withTrailing } from './matcher'
import { CONTESTED, type Contested, type RecordStore } from './records'

const NON_SPACE_RE = /\S/
const LATIN_RE = /[A-Za-z]/
const WORD_CHAR_RE = /[A-Za-z\d]/
const CJK_RE = /[\u3400-\u9fff\uf900-\ufaff]/

// ---------- kbd ----------

export function isKbd(node: Node | null | undefined): node is Element {
  return node?.nodeType === ELEMENT_NODE && (node as Element).localName === 'kbd'
}

function skipComments(node: Node | null, forward: boolean): Node | null {
  let current = node
  while (current?.nodeType === COMMENT_NODE) current = forward ? current.nextSibling : current.previousSibling
  return current
}

/** 文本组是否紧邻 kbd：跳过注释后看首节点的前一个、末节点的后一个兄弟 */
export function besideKbd(run: readonly Text[]): boolean {
  const first = run[0]
  const last = run[run.length - 1]
  if (!first || !last) return false
  return isKbd(skipComments(first.previousSibling, false)) || isKbd(skipComments(last.nextSibling, true))
}

/** kbd 所在片段中、一侧最近的文本节点（跳过注释与 kbd）；先遇到其他元素（片段边界）时返回 null */
function spanNeighbor(kbd: Element, forward: boolean): Text | null {
  for (let current = forward ? kbd.nextSibling : kbd.previousSibling; current;) {
    if (isTextNode(current)) return current
    if (current.nodeType !== COMMENT_NODE && !isKbd(current)) return null
    current = forward ? current.nextSibling : current.previousSibling
  }
  return null
}

/**
 * kbd 所在片段中最近的文本节点（跳过注释与 kbd，先找前面的），用于 kbd 内文字变化、kbd 旁增删节点后定位所在片段
 * （相邻的 kbd 之间可以没有文本）
 */
export function kbdNeighbor(kbd: Element): Text | null {
  return spanNeighbor(kbd, false) ?? spanNeighbor(kbd, true)
}

/** 宿主直接子节点中由文本、注释、kbd 组成且含 kbd 的连续片段 */
export interface KbdSpan {
  /** kbd 分隔出的文本组，比 kbd 多一个；组可以为空 */
  readonly groups: readonly (readonly Text[])[]
  /** 各 kbd 的规范化文字 */
  readonly keys: readonly string[]
  /** 各 kbd 元素 */
  readonly kbds: readonly Element[]
}

/** 拆出宿主内的 kbd 片段：kbd 以外的元素是片段边界 */
export function kbdSpans(host: Element): KbdSpan[] {
  const spans: KbdSpan[] = []
  let groups: Text[][] = [[]]
  let keys: string[] = []
  let kbds: Element[] = []
  const close = (): void => {
    if (keys.length > 0) spans.push({ groups, keys, kbds })
    groups = [[]]
    keys = []
    kbds = []
  }
  for (let child = host.firstChild; child; child = child.nextSibling) {
    if (isTextNode(child)) {
      groups[groups.length - 1]!.push(child)
    } else if (isKbd(child)) {
      keys.push(normalizeText(child.textContent ?? ''))
      kbds.push(child)
      groups.push([])
    } else if (child.nodeType !== COMMENT_NODE) {
      close()
    }
  }
  close()
  return spans
}

/** 元素内的全部文本节点（含后代），按文档顺序追加到 into */
function collectTexts(element: Element, into: Text[]): void {
  for (let child = element.firstChild; child; child = child.nextSibling) {
    if (isTextNode(child)) into.push(child)
    else if (child.nodeType === ELEMENT_NODE) collectTexts(child as Element, into)
  }
}

/** 片段内的全部文本节点（含 kbd 内的），按文档顺序 */
function spanTexts(span: KbdSpan): Text[] {
  const nodes: Text[] = []
  span.groups.forEach((group, i) => {
    nodes.push(...group)
    const kbd = span.kbds[i]
    if (kbd) collectTexts(kbd, nodes)
  })
  return nodes
}

/**
 * key 在 text 中 from 之后的位置；whole 为 true 时跳过嵌在英文单词、数字里的出现
 * （如 kbd 文字 C 与译文中的「Copilot」）
 */
function findKey(text: string, key: string, from: number, whole: boolean): number {
  const guardStart = whole && WORD_CHAR_RE.test(key[0] ?? '')
  const guardEnd = whole && WORD_CHAR_RE.test(key[key.length - 1] ?? '')
  for (let at = text.indexOf(key, from); at >= 0; at = text.indexOf(key, at + 1)) {
    const embedded = (guardStart && WORD_CHAR_RE.test(text[at - 1] ?? '')) || (guardEnd && WORD_CHAR_RE.test(text[at + key.length] ?? ''))
    if (!embedded) return at
  }
  return -1
}

function splitAt(text: string, keys: readonly string[], whole: boolean): string[] | undefined {
  const segments: string[] = []
  let start = 0
  for (const key of keys) {
    const at = key ? findKey(text, key, start, whole) : -1
    if (at < 0) return undefined
    segments.push(text.slice(start, at))
    start = at + key.length
  }
  segments.push(text.slice(start))
  return segments
}

/**
 * 按 kbd 文字依次切分译文；某个 kbd 文字为空或在译文中找不到时返回 undefined。
 * 先找独立出现的 kbd 文字，找不到再取首次出现（相邻 kbd 拼成的「CtrlK」）。
 */
export function splitByKeys(text: string, keys: readonly string[]): string[] | undefined {
  return splitAt(text, keys, true) ?? splitAt(text, keys, false)
}

// ---------- 孤立标点 ----------

const FULL_WIDTH: ReadonlyMap<string, string> = new Map([
  ['.', '。'],
  [',', '，'],
  ['?', '？'],
  ['!', '！'],
  [':', '：'],
  [';', '；']
])
/** 两个元素之间的逗号 */
const ENUMERATION_COMMA = '、'
const FULL_PUNCT: ReadonlySet<string> = new Set([...FULL_WIDTH.values(), ENUMERATION_COMMA])
const HALF_PUNCT_RE = /^\s*[.,?!:;]\s*$/
/** 只有空白、标点、符号 */
const MARKS_ONLY_RE = /^[\s\p{P}\p{S}]*$/u
const TRAILING_SPACE_RE = /\s$/
const LEADING_DIGIT_RE = /^\s*\d/
const TRAILING_DIGIT_RE = /\d\s*$/

/** 去掉首尾空白后是单个半角标点 . , ? ! : ; */
export function isHalfPunct(text: string): boolean {
  return HALF_PUNCT_RE.test(text)
}

/** 孤立标点转换后的写入值 */
export function isFullPunct(text: string): boolean {
  return FULL_PUNCT.has(text)
}

/** 跳过注释与空白文本后的相邻兄弟 */
function meaningfulSibling(node: Node, forward: boolean): Node | null {
  let current = forward ? node.nextSibling : node.previousSibling
  while (current && (current.nodeType === COMMENT_NODE || (isTextNode(current) && !NON_SPACE_RE.test(current.data)))) {
    current = forward ? current.nextSibling : current.previousSibling
  }
  return current
}

function isElement(node: Node | null): boolean {
  return node?.nodeType === ELEMENT_NODE
}

/**
 * 只包着这个节点的 span（<span class="ml-n1">.</span>）：标点按 span 的位置与 span 外的语境判断。
 * span 里还有别的内容、或 span 没有父元素时返回 null
 */
export function punctWrapper(node: Text): Element | null {
  const parent = node.parentElement
  if (parent?.tagName !== 'SPAN' || parent.parentElement === null) return null
  return meaningfulSibling(node, false) === null && meaningfulSibling(node, true) === null ? parent : null
}

/** 判断位置与语境时代表标点的节点：包着它的 span，或节点本身 */
function punctAnchor(node: Text): Node {
  return punctWrapper(node) ?? node
}

/**
 * 孤立标点的位置是否适合转全角（source 为该节点原文）：
 * - 原文以空白结尾，或其后没有其他节点；
 * - 至少一侧紧邻元素；
 * - 不在两个数字之间（10:30、1.5）。
 * 标点单独包在 span 里时按 span 的位置判断。
 */
export function punctFits(node: Text, source: string): boolean {
  const anchor = punctAnchor(node)
  const previous = meaningfulSibling(anchor, false)
  const next = meaningfulSibling(anchor, true)
  if (!TRAILING_SPACE_RE.test(source) && next !== null) return false
  if (!isElement(previous) && !isElement(next)) return false
  return !(TRAILING_DIGIT_RE.test(previous?.textContent ?? '') && LEADING_DIGIT_RE.test(next?.textContent ?? ''))
}

/** 半角标点对应的全角标点；逗号两侧都是元素时用顿号 */
export function fullWidthPunct(node: Text, source: string): string | undefined {
  const mark = source.trim()
  const full = FULL_WIDTH.get(mark)
  if (full === undefined || mark !== ',') return full
  const anchor = punctAnchor(node)
  return isElement(meaningfulSibling(anchor, false)) && isElement(meaningfulSibling(anchor, true)) ? ENUMERATION_COMMA : full
}

function nearestText(node: Node, forward: boolean): Text | null {
  for (let current = forward ? node.nextSibling : node.previousSibling; current;) {
    if (isTextNode(current) && !MARKS_ONLY_RE.test(current.data)) return current
    current = forward ? current.nextSibling : current.previousSibling
  }
  return null
}

/** 标点位置（anchor）的直接文字语境：跳过空白与纯标点后最近的前一个直接文本兄弟，没有则取后一个 */
export type DirectContext = (anchor: Node) => Text | null

function directContext(anchor: Node): Text | null {
  return nearestText(anchor, false) ?? nearestText(anchor, true)
}

/**
 * 记住查找结果的 directContext：同一父元素下的标点逐个向两侧查找，长列表里是平方级；记下途经节点的结果，
 * 之后查到它们时直接取用。只在兄弟顺序与有意义的直接文字都不变时可用（轮末重算期间只在半角、全角标点之间改写）
 */
function memoDirectContext(): DirectContext {
  const before = new Map<Node, Text | null>()
  const after = new Map<Node, Text | null>()
  const nearest = (anchor: Node, forward: boolean): Text | null => {
    const memo = forward ? after : before
    const known = memo.get(anchor)
    if (known !== undefined) return known
    const passed: Node[] = [anchor]
    let found: Text | null = null
    for (let current = forward ? anchor.nextSibling : anchor.previousSibling; current;) {
      if (isTextNode(current) && !MARKS_ONLY_RE.test(current.data)) {
        found = current
        break
      }
      const result = memo.get(current)
      if (result !== undefined) {
        found = result
        break
      }
      passed.push(current)
      current = forward ? current.nextSibling : current.previousSibling
    }
    for (const node of passed) memo.set(node, found)
    return found
  }
  return anchor => nearest(anchor, false) ?? nearest(anchor, true)
}

/** 元素内（含后代）最后一段有意义的文字：跳过只有空白、标点、符号的文本节点；没有时返回 null */
function lastMeaningfulText(element: Element): Text | null {
  for (let child = element.lastChild; child; child = child.previousSibling) {
    if (isTextNode(child)) {
      if (!MARKS_ONLY_RE.test(child.data)) return child
    } else if (child.nodeType === ELEMENT_NODE) {
      const found = lastMeaningfulText(child as Element)
      if (found) return found
    }
  }
  return null
}

/**
 * 判断标点所在语境的文本：跳过空白与纯标点后最近的前一个直接文本兄弟，没有则取后一个；
 * 标点单独包在 span 里时取 span 的兄弟。span 前后都没有直接文本兄弟（整句各段都包在元素里，
 * 如 <span>…</span><span><a>…</a></span><span>.</span>）时，取 span 前一个有意义的兄弟元素里最后一段有意义的文字。
 * direct 取直接文字语境（轮末重算时换成记住结果的，见 memoDirectContext）
 */
export function punctContext(node: Text, direct: DirectContext = directContext): Text | null {
  const wrapper = punctWrapper(node)
  const text = direct(wrapper ?? node)
  if (text !== null || wrapper === null) return text
  const previous = meaningfulSibling(wrapper, false)
  return previous?.nodeType === ELEMENT_NODE ? lastMeaningfulText(previous as Element) : null
}

/** 孤立标点应显示的值（source 为原文）：语境是本引擎写入的中文（chinese）且位置合适时为全角标点，否则为原文 */
function desiredPunct(node: Text, source: string, chinese: boolean): string {
  return (chinese && punctFits(node, source) && fullWidthPunct(node, source)) || source
}

// ---------- 行内句 ----------

const NUMERIC_RE = /^\d[\d,]*$/

/** 宿主直接子节点：元素是槽位，槽位之间的文本（中间可隔注释）是一组 */
export interface Sentence {
  /** 槽位分隔出的文本组，比槽位多一个；组可以为空 */
  readonly groups: readonly (readonly Text[])[]
  /** 各槽位元素 */
  readonly slots: readonly Element[]
  /** 各槽位的标记（见 slotMark） */
  readonly marks: readonly string[]
}

/** 槽位的标记：只含数字（可带千分位）的叶子元素为 NUM_SLOT，其余为 SLOT */
function slotMark(element: Element): string {
  return element.firstElementChild === null && NUMERIC_RE.test(normalizeText(element.textContent ?? '')) ? NUM_SLOT : SLOT
}

/** 按元素子节点把宿主的直接文本分组 */
function splitGroups(host: Element): Sentence {
  const groups: Text[][] = [[]]
  const slots: Element[] = []
  const marks: string[] = []
  for (let child = host.firstChild; child; child = child.nextSibling) {
    if (isTextNode(child)) {
      groups[groups.length - 1]!.push(child)
    } else if (child.nodeType === ELEMENT_NODE) {
      slots.push(child as Element)
      marks.push(slotMark(child as Element))
      groups.push([])
    }
  }
  return { groups, slots, marks }
}

/** 拆出宿主的行内句；没有元素子节点、子节点过多、含 kbd 时返回 undefined */
export function sentenceOf(host: Element): Sentence | undefined {
  if (host.firstElementChild === null || host.childNodes.length > MAX_SENTENCE_CHILDREN) return undefined
  for (let child: Element | null = host.firstElementChild; child; child = child.nextElementSibling) {
    if (child.localName === 'kbd') return undefined
  }
  return splitGroups(host)
}

// ---------- 处理 ----------

/** 引擎提供的写入与收集能力 */
export interface InlineHost {
  readonly records: RecordStore
  /** 本轮的原文（每轮每个节点只取一次）；与页面互相覆盖、解析器刚追加标点时为 CONTESTED */
  textSource(node: Text): string | Contested
  /** 翻译原始文本并保留首尾空白；未命中返回 undefined */
  translate(source: string): string | undefined
  /** 译文的写入值：去掉紧邻全角标点一侧的空白（见 fit.ts） */
  fit(node: Text, translated: string): string
  /** 按已取得的原文处理文本组；collect 为 false 时不记未翻译 */
  applyRun(run: readonly Text[], sources: readonly (string | Contested)[], collect: boolean): void
  /** 记录整句未翻译：nodes 为句中全部文本节点（记在第一个上），任一节点不可收集时整句不记 */
  noteRunMiss(nodes: readonly Text[], source: string): void
  /** 行内句：句型键 → 用 {} 标出槽位的译文；未命中返回 undefined */
  translateInline(key: string): string | undefined
  /** 当前页面范围内有无行内句规则 */
  inlineEnabled(): boolean
  /** 本轮改了显示的节点（轮末转换的孤立标点）：轮末重算它所在各层元素前后紧邻的文本（见 fit.ts） */
  touch(node: Node): void
  /** 元素在跳过区域内（忽略区域、退出标记等）：其中的孤立标点不改写 */
  skipped(element: Element): boolean
}

export interface InlineFragments {
  /** 一轮（一次全量遍历或一批变动）开始 */
  beginRound(): void
  /** 一轮结束：重算本轮涉及的孤立标点 */
  endRound(): void
  /**
   * 处理文本组前调用：记录含孤立标点的父元素；紧邻 kbd 时按宿主内的 kbd 片段处理，
   * 否则有行内句规则时按行内句处理宿主的全部文本组（每轮每个宿主一次）。
   * 返回 true 表示文本组已处理，或只有孤立标点、留到轮末。
   */
  claimRun(run: readonly Text[], beside: boolean): boolean
  /** 元素可能按行内句处理：当前按整句写入，或有行内句规则、有元素子节点、子节点不多且直接文字含英文 */
  maybeSentence(element: Element): boolean
  /** 子节点有增删的元素：可能按行内句处理（槽位数可能变了）时返回元素自身，否则返回 null（见 rejudge） */
  sentenceHost(element: Element): Element | null
  /**
   * 子节点有增删、文字被改写的元素：作为槽位的标记（数字 / 非数字）与宿主上次按行内句判断时不同（句型键随之改变），
   * 宿主可能按行内句处理时返回宿主，否则返回 null（见 rejudge）
   */
  slotHost(element: Element): Element | null
  /**
   * 只按行内句重判宿主（与 claimRun 共用每轮每个宿主一次的判断）：之前按整句写入、或按当前文字预判命中时
   * 整句重算，返回 true；否则返回 false，其中的文字不处理（文字本身没变，重算会再取原文）。
   * 返回 true 时宿主及其祖先下的孤立标点轮末重算（宿主的文字可能是槽位里、或外面包着标点的 span 的语境）
   */
  rejudge(parent: Element): boolean
  /** 只记录孤立标点（变动中无需翻译的文本组）；所在元素及其祖先含过孤立标点时轮末重算 */
  notePunct(run: readonly Text[]): void
  /**
   * 子节点有增删的父元素：它及其祖先含过孤立标点时轮末重算（语境文字可能已被移除，或旁边插入了元素；
   * 包着标点的 span 的语境可能在前一个兄弟元素的子树里）
   */
  noteChildren(parent: Node): void
  /**
   * 引擎在处理文本组以外改写了其中文字的元素（先译后忽略的区域还原、合并区域整段写入）：
   * 它及其祖先含过孤立标点时轮末重算（其中的文字可能是包着标点的 span 的语境）
   */
  noteRewritten(element: Element): void
  /** 半角孤立标点，或由它转成的全角标点 */
  isPunctNode(node: Text): boolean
  /** 区域内的文字已还原、随后重新遍历：区域内宿主本轮的判断作废，重新遍历时重新判断 */
  forget(region: Element): void
  /** 停止翻译：丢弃整句宿主等状态，重新开始时按全新页面处理 */
  reset(): void
}

export function createInlineFragments(host: InlineHost): InlineFragments {
  const { records } = host
  /** 本轮已按 kbd 片段处理过的宿主 */
  let kbdHosts = new Set<Element>()
  /** 本轮已按行内句判断过的宿主：true 表示全部文本组已处理，false 表示照常逐组处理 */
  let sentenceHosts = new Map<Element, boolean>()
  /** 当前按整句写入的宿主 */
  let activeHosts = new WeakSet<Element>()
  /** 按整句写入的文本节点：不算孤立标点 */
  let sentenceNodes = new WeakSet<Text>()
  /** 按 kbd 句子整句写入的文本节点：仍在 kbd 片段中时不算孤立标点（kbd 被移除后照常判断） */
  let kbdNodes = new WeakSet<Text>()
  /** 按行内句判断宿主时各槽位的标记：之后标记变了，宿主整句重算（见 slotHost） */
  let slotMarks = new WeakMap<Element, string>()
  /** 本轮轮末重算孤立标点的父元素：处理过文本组、子节点有增删的元素及其祖先中含过孤立标点的 */
  let punctPending = new Set<Element>()
  /** 出现过孤立标点子节点的父元素 */
  let punctParents = new WeakSet<Element>()
  /** 本轮向上查找过的元素：它及其祖先中含过孤立标点的都已加入 punctPending（见 notePunctAround） */
  let aroundWalked = new Set<Element>()

  const sourcesOf = (run: readonly Text[]): (string | Contested)[] => run.map(node => host.textSource(node))

  /**
   * kbd 片段：整句命中后按 kbd 文字切分译文，第 i 段写入第 i 组的第一个文本节点、其余置空（按整句写入，不算孤立标点）；
   * 未命中或切分失败时逐组处理，只记整句未翻译。不构成整句时逐组处理。
   * 有节点须保持显示（解析器刚追加标点，CONTESTED 且仍是自身写入）时整句跳过，各组保持当前文字；
   * 有节点与页面互相覆盖时逐组处理，其余各段不留整句切分出的译文片段。
   */
  function processKbdSpan(span: KbdSpan): void {
    const { groups, keys } = span
    const found = groups.map(sourcesOf)
    if (found.some(group => group.includes(CONTESTED))) {
      const holding = groups.some((group, i) => group.some((node, j) => found[i]![j] === CONTESTED && records.ownText(node)))
      if (!holding) applySpan(groups, found, false)
      return
    }
    const sources = found as string[][]
    const texts = sources.map(group => group.join(''))
    const sentence = NON_SPACE_RE.test(texts[0]!) && NON_SPACE_RE.test(texts[texts.length - 1]!) && texts.some(text => LATIN_RE.test(text))
    if (!sentence) {
      applySpan(groups, sources, true)
      return
    }
    const raw = texts.map((text, i) => text + (keys[i] ?? '')).join('')
    const translated = host.translate(raw)
    const segments = translated === undefined ? undefined : splitByKeys(translated, keys)
    if (segments?.every((segment, i) => groups[i]!.length > 0 || !NON_SPACE_RE.test(segment))) {
      groups.forEach((group, i) =>
        group.forEach((node, j) => {
          kbdNodes.add(node)
          records.writeText(node, sources[i]![j]!, j === 0 ? host.fit(node, segments[i]!) : '')
        })
      )
      return
    }
    applySpan(groups, sources, false)
    // 整句含 kbd 文字：记录时检查句中全部文本节点
    host.noteRunMiss(spanTexts(span), raw)
  }

  /**
   * kbd 片段的各组照常处理（之前整句写入的孤立标点按孤立标点重算，留到轮末）；collect 为 false 时不记未翻译
   */
  function applySpan(groups: readonly (readonly Text[])[], found: readonly (readonly (string | Contested)[])[], collect: boolean): void {
    groups.forEach((group, i) => {
      for (const node of group) kbdNodes.delete(node)
      notePunct(group)
      host.applyRun(group, found[i]!, collect)
    })
  }

  /** 宿主内的 kbd 片段（每轮每个宿主一次） */
  function processKbdSpans(parent: Element): void {
    if (kbdHosts.has(parent)) return
    kbdHosts.add(parent)
    for (const span of kbdSpans(parent)) processKbdSpan(span)
  }

  /**
   * 第 i 段写入第 i 组的第一个文本节点、其余置空。整句开头、结尾保留原文的空白（那一端是全角标点时不保留），
   * 槽位两侧的空白按译文；原文与该段都只有空白的组照常处理（保持原文，紧邻全角标点时置空，见 fit.ts）
   */
  function writeSentence(
    groups: readonly (readonly Text[])[],
    sources: readonly (readonly string[])[],
    texts: readonly string[],
    segments: readonly string[]
  ): void {
    const last = groups.length - 1
    groups.forEach((group, i) => {
      if (!NON_SPACE_RE.test(texts[i]!) && !NON_SPACE_RE.test(segments[i]!)) {
        for (const node of group) sentenceNodes.delete(node)
        host.applyRun(group, sources[i]!, false)
        return
      }
      let value = segments[i]!
      if (i === 0) value = withLeading(texts[i]!, value.trimStart())
      if (i === last) value = withTrailing(texts[i]!, value.trimEnd())
      group.forEach((node, j) => {
        sentenceNodes.add(node)
        records.writeText(node, sources[i]![j]!, j === 0 ? host.fit(node, value) : '')
      })
    })
  }

  /** 各组照常处理（只有孤立标点的组留到轮末）；collect 为 false 时不记未翻译 */
  function applyGroups(groups: readonly (readonly Text[])[], found: readonly (readonly (string | Contested)[])[], collect: boolean): void {
    groups.forEach((group, i) => {
      for (const node of group) sentenceNodes.delete(node)
      if (group.length > 0 && !notePunct(group)) host.applyRun(group, found[i]!, collect)
    })
  }

  /** 各段原文对应的切分译文；未命中、切分失败、某段需写入但该处没有文本节点时返回 undefined */
  function matchSentence(sentence: Sentence, texts: readonly string[]): string[] | undefined {
    const { groups, marks } = sentence
    const key = sentenceKey(texts, marks)
    const translation = key.length <= MAX_SENTENCE_KEY ? host.translateInline(key) : undefined
    const segments = translation === undefined ? undefined : splitTemplate(translation, marks.length)
    return segments?.every((segment, i) => groups[i]!.length > 0 || !NON_SPACE_RE.test(segment)) ? segments : undefined
  }

  /**
   * 整句宿主保持现状：有节点须保持显示（解析器刚追加标点：CONTESTED 且仍是自身写入），
   * 且没有新到的英文文字（同一解析任务里插入的文字照常处理）
   */
  function holdsSentence(groups: readonly (readonly Text[])[], found: readonly (readonly (string | Contested)[])[]): boolean {
    let held = false
    for (let i = 0; i < groups.length; i++) {
      const group = groups[i]!
      for (let j = 0; j < group.length; j++) {
        const node = group[j]!
        if (found[i]![j] === CONTESTED) held ||= records.ownText(node)
        else if (!records.ownText(node) && !sentenceNodes.has(node) && LATIN_RE.test(node.data)) return false
      }
    }
    return held
  }

  /**
   * 行内句：句型键命中后按槽位切分译文写回各组，返回 true（宿主的全部文本组已处理）。
   * 之前没有按整句写入、按当前文字预判也不命中时返回 false，由调用方按文档顺序照常逐组处理（原文只取一次）；
   * 之前按整句写入、现在不命中时各组立即照常重算。
   * 有节点与页面互相覆盖时：之前按整句写入的宿主须保持显示时（见 holdsSentence）保持现状，否则各组照常处理
   * （之前按整句写入的不记未翻译，且仍算整句宿主：覆盖期间的后续各轮同样不记，停止覆盖后整句重算）。
   * 记下判断所依据的槽位标记（见 slotHost）
   */
  function processSentence(parent: Element, sentence: Sentence): boolean {
    const { groups, slots, marks } = sentence
    slots.forEach((slot, i) => slotMarks.set(slot, marks[i]!))
    const active = activeHosts.has(parent)
    const peeked = groups.map(group => group.map(node => records.peekText(node)).join(''))
    if (!active && matchSentence(sentence, peeked) === undefined) return false
    const found = groups.map(sourcesOf)
    if (found.some(group => group.includes(CONTESTED))) {
      if (!active || !holdsSentence(groups, found)) applyGroups(groups, found, !active)
      return true
    }
    const sources = found as string[][]
    const texts = sources.map(group => group.join(''))
    const segments = matchSentence(sentence, texts)
    if (segments) {
      writeSentence(groups, sources, texts, segments)
      activeHosts.add(parent)
      return true
    }
    activeHosts.delete(parent)
    applyGroups(groups, found, true)
    return true
  }

  /**
   * 曾按整句写入、现在不构成行内句（槽位全被移除、子节点过多、换入 kbd）：kbd 片段以外的各组立即照常重算，
   * kbd 片段按 kbd 句子处理（只记整句未翻译）；宿主本轮算已处理
   */
  function releaseSentence(parent: Element): void {
    activeHosts.delete(parent)
    sentenceHosts.set(parent, true)
    const { groups } = splitGroups(parent)
    for (const group of groups) for (const node of group) sentenceNodes.delete(node)
    const plain = groups.filter(group => group.length > 0 && !besideKbd(group))
    applyGroups(plain, plain.map(sourcesOf), true)
    processKbdSpans(parent)
  }

  function maybeSentence(parent: Element): boolean {
    if (activeHosts.has(parent)) return true
    if (!host.inlineEnabled() || parent.firstElementChild === null) return false
    if (parent.childNodes.length > MAX_SENTENCE_CHILDREN) return false
    // 句型键由直接文字与槽位字符组成，直接文字没有英文时不会命中（不查不含英文的键）
    for (let child = parent.firstChild; child; child = child.nextSibling) {
      if (isTextNode(child) && LATIN_RE.test(records.peekText(child))) return true
    }
    return false
  }

  /** 按行内句处理宿主的全部文本组；返回 false 表示照常逐组处理 */
  function claimSentence(parent: Element): boolean {
    if (!maybeSentence(parent)) return false
    const sentence = sentenceOf(parent)
    if (sentence) return processSentence(parent, sentence)
    if (!activeHosts.has(parent)) return false
    releaseSentence(parent)
    return true
  }

  /** 按行内句判断宿主（每轮每个宿主一次，结果沿用）；返回 false 表示照常逐组处理 */
  function judgeSentence(parent: Element): boolean {
    let claimed = sentenceHosts.get(parent)
    if (claimed === undefined) {
      claimed = claimSentence(parent)
      sentenceHosts.set(parent, claimed)
    }
    return claimed
  }

  function sentenceHost(element: Element): Element | null {
    return maybeSentence(element) ? element : null
  }

  function isPunctNode(node: Text): boolean {
    if (sentenceNodes.has(node) || (kbdNodes.has(node) && besideKbd(textRun(node)))) return false
    const data = node.data
    if (isHalfPunct(data)) return true
    // 由半角孤立标点转成的全角标点：整句、kbd 句子写入的「。」等原文不是孤立标点，不算
    return data.length === 1 && isFullPunct(data) && records.ownText(node) && isHalfPunct(records.peekText(node))
  }

  /** 记录含孤立标点的父元素；返回文本组是否全是孤立标点 */
  function notePunct(run: readonly Text[]): boolean {
    let count = 0
    for (const node of run) {
      if (!isPunctNode(node)) continue
      count++
      // 单独包在 span 里的标点：语境在 span 外，外层的文字变化时也要重算
      const outer = punctWrapper(node)?.parentElement
      if (outer) notePunctParent(outer)
    }
    const parent = run[0]?.parentElement
    if (!parent) return false
    if (count > 0) notePunctParent(parent)
    notePunctAround(parent)
    return count === run.length
  }

  /** 含孤立标点的父元素：记下，本轮轮末重算（本轮的向上查找可能已在它记下之前经过它） */
  function notePunctParent(element: Element): void {
    punctParents.add(element)
    punctPending.add(element)
  }

  /**
   * 元素及其祖先中含过孤立标点的父元素轮末重算：包着标点的 span 的语境可能在前一个兄弟元素的子树里
   * （见 punctContext），其中的文字改写、子节点增删时外层的标点也要重算（与 fit.ts 的 refitAround 同理，逐层向上）。
   * 本轮查找过的元素不再向上：它的祖先都已查过，之后才记下的父元素在记下时已加入（见 notePunctParent）
   */
  function notePunctAround(element: Element): void {
    for (let current: Element | null = element; current; current = current.parentElement) {
      if (aroundWalked.has(current)) return
      aroundWalked.add(current)
      if (punctParents.has(current)) punctPending.add(current)
    }
  }

  /** 父元素下的孤立标点：直接子文本，以及单独包在子 span 里的文本 */
  function syncPunctIn(parent: Element, direct: DirectContext): void {
    for (let child = parent.firstChild; child; child = child.nextSibling) {
      if (isTextNode(child)) {
        if (isPunctNode(child)) syncPunct(child, direct)
        continue
      }
      if (child.nodeName !== 'SPAN') continue
      for (let inner = child.firstChild; inner; inner = inner.nextSibling) {
        if (isTextNode(inner) && punctWrapper(inner) === child && isPunctNode(inner)) syncPunct(inner, direct)
      }
    }
  }

  /** 语境文字是本引擎写入的中文且位置合适时转全角，否则写回原文；显示变化时紧邻的文本随之重算 */
  function syncPunct(node: Text, direct: DirectContext): void {
    const parent = node.parentElement
    if (parent === null) return
    const context = punctContext(node, direct)
    const chinese = context !== null && records.ownText(context) && CJK_RE.test(context.data)
    // 取原文没有副作用时（没有记录，或当前是本引擎写入的）先按只读的原文预判：显示已是应显示的值就不必改写，
    // 也不必按忽略选择器查找祖先（轮末重算的标点大多显示不变）
    if (!records.hasText(node) || records.ownText(node)) {
      const peeked = records.peekText(node)
      if (!isHalfPunct(peeked) || desiredPunct(node, peeked, chinese) === node.data) return
    }
    // 跳过区域里的标点（包着它的 span 被忽略、带退出标记，含译后才进入的）保持原样
    if (host.skipped(parent)) return
    const source = host.textSource(node)
    if (source === CONTESTED || !isHalfPunct(source)) return
    const desired = desiredPunct(node, source, chinese)
    if (node.data !== desired) host.touch(node)
    if (node.data !== desired || records.hasText(node)) records.writeText(node, source, desired)
  }

  return {
    beginRound() {
      kbdHosts = new Set()
      sentenceHosts = new Map()
      punctPending = new Set()
      aroundWalked = new Set()
    },

    endRound() {
      const parents = punctPending
      punctPending = new Set()
      aroundWalked = new Set()
      kbdHosts = new Set()
      sentenceHosts = new Map()
      // 重算期间只在半角、全角标点之间改写（都只有标点）：兄弟顺序与有意义的直接文字不变，直接文字语境记住查找结果
      const direct = memoDirectContext()
      for (const parent of parents) {
        if (parent.isConnected) syncPunctIn(parent, direct)
      }
    },

    claimRun(run, beside) {
      const punctOnly = notePunct(run)
      const parent = run[0]?.parentElement
      if (!parent) return punctOnly
      if (beside) {
        // 曾按整句写入、现在含 kbd：kbd 片段以外的各组照常重算，再按 kbd 片段处理
        if (activeHosts.has(parent)) releaseSentence(parent)
        else processKbdSpans(parent)
        return true
      }
      return judgeSentence(parent) || punctOnly
    },

    maybeSentence,

    sentenceHost,

    slotHost(element) {
      const mark = slotMarks.get(element)
      const parent = element.parentElement
      if (mark === undefined || mark === slotMark(element) || parent === null) return null
      return sentenceHost(parent)
    },

    rejudge(parent) {
      if (!judgeSentence(parent)) return false
      // 重判不经 claimRun（claimRun 先由 notePunct 记下文本组所在的元素）
      notePunctAround(parent)
      return true
    },

    notePunct(run) {
      notePunct(run)
    },

    noteChildren(parent) {
      if (parent.nodeType === ELEMENT_NODE) notePunctAround(parent as Element)
    },

    noteRewritten: notePunctAround,

    isPunctNode,

    forget(region) {
      for (const parent of sentenceHosts.keys()) if (region.contains(parent)) sentenceHosts.delete(parent)
      for (const parent of kbdHosts) if (region.contains(parent)) kbdHosts.delete(parent)
    },

    reset() {
      kbdHosts = new Set()
      sentenceHosts = new Map()
      activeHosts = new WeakSet()
      sentenceNodes = new WeakSet()
      kbdNodes = new WeakSet()
      slotMarks = new WeakMap()
      punctPending = new Set()
      punctParents = new WeakSet()
      aroundWalked = new Set()
    }
  }
}
