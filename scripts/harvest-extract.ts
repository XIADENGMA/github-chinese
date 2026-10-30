/**
 * 采集格式与页面内采集函数。extractStrings 由 page.evaluate 序列化后在页面内执行，不得引用本模块的其他标识符。
 *
 * 同一父元素下相邻（中间只隔注释）、两段以上含非空白文字的文本节点记为一个文本组（kind: group），
 * text 为各段原文（空白已合并、未去首尾）以 PART_SEPARATOR 连接。引擎先整组匹配、未命中再逐段匹配，
 * 统计时按 expandGroup 同样处理（见 scripts/coverage.ts）。
 */
import { normalizeText } from '../src/core/text'

export interface HarvestedString {
  readonly text: string
  readonly kind: 'text' | 'attr' | 'title' | 'group'
  readonly count: number
}

export interface ExtractArgs {
  readonly ignoreSelector: string
  readonly ignoreTags: readonly string[]
  /** 时间元素：内容由元素自行渲染，只采集 relative-time 的前缀 */
  readonly timeTags: readonly string[]
  readonly attributes: readonly string[]
  readonly buttonTypes: readonly string[]
}

/** 文本组各段的分隔符 */
export const PART_SEPARATOR = '\u0002'

/** 采集时丢弃超过这个长度的文本 */
export const HARVEST_MAX_LENGTH = 400

const LATIN_RE = /[A-Za-z]/

/** 在页面内执行：收集文本节点（相邻的记为文本组）、可翻译属性、标题 */
export function extractStrings(args: ExtractArgs): HarvestedString[] {
  const ignoreTags = new Set(args.ignoreTags)
  const timeTags = new Set(args.timeTags)
  const counts = new Map<string, number>()
  const count = (key: string): void => {
    counts.set(key, (counts.get(key) ?? 0) + 1)
  }
  const add = (raw: string | null, kind: HarvestedString['kind']): void => {
    if (!raw) return
    const text = raw.replace(/\s+/g, ' ').trim()
    if (!text || text.length > 400 || !/[A-Za-z]/.test(text)) return
    count(`${kind}\u0001${text}`)
  }
  /** 相邻的文本节点：两段以上含非空白文字时记为文本组，否则（或整组超长）逐段记 */
  const addRun = (parts: readonly string[]): void => {
    const spaced = parts.map((part) => part.replace(/\s+/g, ' '))
    const joined = spaced.join('').trim()
    if (spaced.filter((part) => /\S/.test(part)).length >= 2 && joined.length <= 400 && /[A-Za-z]/.test(joined)) {
      count(`group\u0001${spaced.join('\u0002')}`)
    } else {
      for (const part of spaced) add(part, 'text')
    }
  }
  const addAttributes = (el: Element): void => {
    for (const name of args.attributes) add(el.getAttribute(name), 'attr')
    if (el instanceof HTMLInputElement && args.buttonTypes.includes(el.type)) add(el.getAttribute('value'), 'attr')
  }
  const walk = (root: Node): void => {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        if (!(node instanceof Element)) return NodeFilter.FILTER_ACCEPT
        if (node.matches(args.ignoreSelector)) return NodeFilter.FILTER_REJECT
        if (timeTags.has(node.localName)) {
          const prefix = node.localName === 'relative-time' ? node.getAttribute('prefix') : null
          if (prefix?.trim().toLowerCase() !== 'on') add(prefix, 'attr')
          return NodeFilter.FILTER_REJECT
        }
        if (ignoreTags.has(node.tagName.toUpperCase())) {
          addAttributes(node)
          return NodeFilter.FILTER_REJECT
        }
        return NodeFilter.FILTER_ACCEPT
      },
    })
    let run: string[] = []
    let last: Node | null = null
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      if (node instanceof Text) {
        // 与上一个文本节点之间只隔注释（同一父元素）时并入同一组
        let previous = node.previousSibling
        while (previous && previous.nodeType === Node.COMMENT_NODE) previous = previous.previousSibling
        if (previous !== last || previous === null) {
          addRun(run)
          run = []
        }
        run.push(node.data)
        last = node
      } else if (node instanceof Element) {
        addRun(run)
        run = []
        last = null
        addAttributes(node)
        if (node.shadowRoot) walk(node.shadowRoot)
      }
    }
    addRun(run)
  }
  walk(document.body)
  add(document.title, 'title')
  return [...counts].map(([key, value]) => {
    const [kind, text] = key.split('\u0001') as [HarvestedString['kind'], string]
    return { kind, text, count: value }
  })
}

/**
 * 统计用：文本组整组命中时按一条整组文字计，未命中时拆成各段（与引擎先整组、再逐段一致）；其他类型原样返回。
 * translate 返回 undefined 表示未命中
 */
export function expandGroup(item: HarvestedString, translate: (text: string) => string | undefined): HarvestedString[] {
  if (item.kind !== 'group') return [item]
  const parts = item.text.split(PART_SEPARATOR)
  const joined = normalizeText(parts.join(''))
  if (translate(joined) !== undefined) return [{ ...item, text: joined }]
  return parts
    .map((part) => normalizeText(part))
    .filter((text) => LATIN_RE.test(text))
    .map((text) => ({ ...item, kind: 'text', text }))
}

/** 文本组的整组文字与各段（判断词条是否用到时都算出现过）；其他类型只有自身 */
export function groupTexts(item: HarvestedString): string[] {
  if (item.kind !== 'group') return [item.text]
  const parts = item.text.split(PART_SEPARATOR)
  return [normalizeText(parts.join('')), ...parts.map((part) => normalizeText(part)).filter((text) => text !== '')]
}
