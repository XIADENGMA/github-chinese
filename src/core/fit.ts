/**
 * 全角标点两侧的空白：紧邻元素的文本，元素靠这一侧的文字是本引擎写入的全角标点时，写入值不带这一侧的空白
 * （「提示：」+「 按 …」、「描述 」+「（可选）」）。只有空白的页面文字（含 &nbsp;）同样置空。
 * 写入时按当时的语境处理；一轮（一次全量遍历或一批变动）结束时按最终语境重算：
 * - 本轮写入过的节点（含置空的空白）：其后的元素在同一轮稍后才译出或还原（按文档顺序先写前面的文本）；
 * - 本轮写入、以全角标点开头或结尾的节点所在各层元素前后的文本：前面的文本先于它处理；
 * - 本轮有变动的节点所在各层元素前后的文本：元素靠这一侧的文字变了，紧邻的文本不在本轮处理范围内。
 * 其余未翻译的文本保持原文。
 */
import { COMMENT_NODE, ELEMENT_NODE, isTextNode } from './dom'
import type { RecordStore } from './records'
import { FULL_PUNCT_END_RE, FULL_PUNCT_START_RE } from './text'

const LEADING_SPACE_RE = /^\s+/
const TRAILING_SPACE_RE = /\s+$/
/** 只有空白（含 NBSP） */
export const SPACE_ONLY_RE = /^\s+$/

export interface TextFit {
  /** 译文的写入值：按当前语境去掉紧邻全角标点一侧的空白；两端有空白时记下译文，轮末重算 */
  fit(node: Text, translated: string): string
  /** 只有空白的未翻译文字的写入值：紧邻全角标点时为空串（轮末重算），否则为原文 */
  space(node: Text, source: string): string
  /** 本轮有变动的节点（文本或元素）：轮末重算它所在各层元素前后紧邻的文本 */
  touch(node: Node): void
  beginRound(): void
  /** 一轮结束：本轮写入过的节点、全角标点前后、变动处前后的文本按最终语境重算 */
  endRound(): void
  /** 停止翻译：丢弃记下的译文 */
  reset(): void
}

interface Fitted {
  /** 未去空白的译文（只有空白的文字为原文） */
  readonly value: string
  /** 写入值 */
  readonly written: string
}

/** 跳过注释与置空的文本节点后的相邻兄弟 */
function adjacent(node: Node, forward: boolean): Node | null {
  let current = forward ? node.nextSibling : node.previousSibling
  while (current && (current.nodeType === COMMENT_NODE || (isTextNode(current) && current.data === ''))) {
    current = forward ? current.nextSibling : current.previousSibling
  }
  return current
}

/** 元素内第一个（forward）或最后一个非空文本节点 */
function edgeText(element: Element, forward: boolean): Text | null {
  for (let child = forward ? element.firstChild : element.lastChild; child;) {
    if (isTextNode(child)) {
      if (child.data !== '') return child
    } else if (child.nodeType === ELEMENT_NODE) {
      const found = edgeText(child as Element, forward)
      if (found) return found
    }
    child = forward ? child.nextSibling : child.previousSibling
  }
  return null
}

/**
 * spaceable：只有空白的页面文字能否置空（不在忽略、跳过区域内）。
 * 遍历中处理的文字已知可以，只在重算前后紧邻的文本时判断
 */
export function createTextFit(records: RecordStore, spaceable: (node: Text) => boolean): TextFit {
  let fitted = new WeakMap<Text, Fitted>()
  /** 本轮写入过、两端有空白的节点（含置空的空白） */
  let written: Text[] = []
  /** 本轮写入、以全角标点开头或结尾的节点 */
  let edges: Text[] = []
  /** 本轮有变动的节点 */
  let touched = new Set<Node>()

  /** 元素靠开头（start）或结尾一侧的文字是本引擎写入的全角标点 */
  function ownPunctEdge(node: Node | null, start: boolean): boolean {
    if (node?.nodeType !== ELEMENT_NODE) return false
    const text = edgeText(node as Element, start)
    return text !== null && records.ownText(text) && (start ? FULL_PUNCT_START_RE : FULL_PUNCT_END_RE).test(text.data)
  }

  function fitValue(node: Text, value: string): string {
    let result = value
    if (LEADING_SPACE_RE.test(result) && ownPunctEdge(adjacent(node, false), false)) {
      result = result.replace(LEADING_SPACE_RE, '')
    }
    if (TRAILING_SPACE_RE.test(result) && ownPunctEdge(adjacent(node, true), true)) {
      result = result.replace(TRAILING_SPACE_RE, '')
    }
    return result
  }

  function noteEdge(node: Text, value: string): void {
    if (FULL_PUNCT_START_RE.test(value) || FULL_PUNCT_END_RE.test(value)) edges.push(node)
  }

  /** 仍显示上次按语境写入的值时，按当前语境重算；写回原文（记录随之清除）时不再记下 */
  function refit(node: Text): void {
    const entry = fitted.get(node)
    if (!entry || node.data !== entry.written || !records.ownText(node)) return
    const value = fitValue(node, entry.value)
    if (value === entry.written) return
    records.writeText(node, records.peekText(node), value)
    if (records.ownText(node)) fitted.set(node, { value: entry.value, written: value })
    else fitted.delete(node)
  }

  /** 前后紧邻的文本：记下过的按语境重算；没有记录、只有空白的页面文字紧邻全角标点时置空 */
  function refitText(node: Text): void {
    if (fitted.has(node)) {
      refit(node)
      return
    }
    const source = node.data
    if (records.hasText(node) || !SPACE_ONLY_RE.test(source)) return
    const value = fitValue(node, source)
    if (value === source || !spaceable(node)) return
    fitted.set(node, { value: source, written: value })
    records.writeText(node, source, value)
  }

  /**
   * 重算 node 一侧紧邻的文本，途经的置空空白一并重算；返回紧邻的节点。
   * 跳过注释、置空的文本节点（含这次重算后置空的）与没有文字的元素（与 edgeText 一致）
   */
  function refitSide(node: Node, forward: boolean): Node | null {
    for (let current = forward ? node.nextSibling : node.previousSibling; current;) {
      if (isTextNode(current)) {
        if (current.data === '' && fitted.has(current)) refit(current)
        if (current.data !== '') refitText(current)
        if (current.data !== '') return current
      } else if (current.nodeType === ELEMENT_NODE) {
        if (edgeText(current as Element, forward) !== null) return current
      } else if (current.nodeType !== COMMENT_NODE) {
        return current
      }
      current = forward ? current.nextSibling : current.previousSibling
    }
    return null
  }

  /**
   * node 自身起逐层向上，重算各层前后紧邻的文本：node 可能是该层元素的最后一段（tail）
   * 或第一段（head）文字时才继续向上
   */
  function refitAround(node: Node): void {
    let tail = true
    let head = true
    for (let current: Node | null = node; current && (tail || head); current = current.parentElement) {
      if (tail) tail = refitSide(current, true) === null
      if (head) head = refitSide(current, false) === null
    }
  }

  return {
    fit(node, translated) {
      if (!LEADING_SPACE_RE.test(translated) && !TRAILING_SPACE_RE.test(translated)) {
        fitted.delete(node)
        noteEdge(node, translated)
        return translated
      }
      const value = fitValue(node, translated)
      fitted.set(node, { value: translated, written: value })
      written.push(node)
      noteEdge(node, value)
      return value
    },

    space(node, source) {
      const value = fitValue(node, source)
      if (value === source) {
        fitted.delete(node)
        return value
      }
      // 按当时的语境置空：紧邻的元素可能在同一轮稍后译出或还原，轮末重算
      fitted.set(node, { value: source, written: value })
      written.push(node)
      return value
    },

    touch(node) {
      touched.add(node)
    },

    beginRound() {
      written = []
      edges = []
      touched = new Set()
    },

    endRound() {
      const nodes = written
      const ends = edges
      const around = touched
      written = []
      edges = []
      touched = new Set()
      for (const node of nodes) refit(node)
      for (const node of ends) if (node.isConnected && records.ownText(node)) refitAround(node)
      for (const node of around) if (node.isConnected) refitAround(node)
    },

    reset() {
      fitted = new WeakMap()
      written = []
      edges = []
      touched = new Set()
    }
  }
}
