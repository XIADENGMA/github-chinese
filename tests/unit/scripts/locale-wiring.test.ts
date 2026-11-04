// @vitest-environment node
import { describe, expect, it } from 'vitest'
import type { InlineRule, PageDictionary, RegExpRule } from '../../../src/core/types'
import { isDictionaryLike, isEmptyDictionary, isMerged, overriddenKeys, ownEntries } from '../../../scripts/locale-wiring'

const RULE: InlineRule = ['{} merged', '{} 已合并']
const OTHER: InlineRule = ['{} pushed', '{} 推送了']

describe('词典接线：行内句与整段合并字段', () => {
  it('只含 inline / mergeText 的对象也算词典，且不算空词典', () => {
    expect(isDictionaryLike({ inline: [RULE] })).toBe(true)
    expect(isDictionaryLike({ mergeText: ['h3 > span'] })).toBe(true)
    expect(isEmptyDictionary({ inline: [RULE] })).toBe(false)
    expect(isEmptyDictionary({ mergeText: ['h3 > span'] })).toBe(false)
    expect(isEmptyDictionary({ inline: [], mergeText: [] })).toBe(true)
  })

  it('行内句规则按同一对象、整段合并选择器按字符串判断是否已合并', () => {
    const child: PageDictionary = { inline: [RULE], mergeText: ['h3 > span'] }
    expect(isMerged(child, { inline: [RULE, OTHER], mergeText: ['h3 > span'] })).toBe(true)
    expect(isMerged(child, { inline: [['{} merged', '{} 已合并']], mergeText: ['h3 > span'] })).toBe(false)
    expect(isMerged(child, { inline: [RULE] })).toBe(false)
  })

  it('自己的词条不含被合并文件的行内句规则与整段合并选择器', () => {
    const child: PageDictionary = { inline: [RULE], mergeText: ['h3 > span'] }
    const own = ownEntries({ inline: [RULE, OTHER], mergeText: ['h3 > span', '.month'] }, [child])
    expect(own.inline).toEqual([OTHER])
    expect(own.mergeText).toEqual(['.month'])
  })
})

describe('词典接线：标签表', () => {
  it('只含 labels 的对象也算词典，有条目时不算空词典', () => {
    expect(isDictionaryLike({ labels: { bug: '缺陷' } })).toBe(true)
    expect(isEmptyDictionary({ labels: { bug: '缺陷' } })).toBe(false)
    expect(isEmptyDictionary({ labels: {} })).toBe(true)
  })

  it('按键判断是否已合并（不与 static 混用）；被覆盖的原文按 labels 报出；自己的词条不含被合并文件的条目', () => {
    const child: PageDictionary = { labels: { bug: '缺陷', question: '疑问' } }
    expect(isMerged(child, { labels: { bug: '缺陷', question: '疑问', wontfix: '不予修复' } })).toBe(true)
    expect(isMerged(child, { labels: { bug: '缺陷' } })).toBe(false)
    expect(isMerged(child, { static: { bug: '缺陷', question: '疑问' } })).toBe(false)
    expect(overriddenKeys(child, { labels: { bug: '错误', question: '疑问' } })).toEqual(['labels "bug"'])
    const own = ownEntries({ labels: { bug: '缺陷', question: '疑问', wontfix: '不予修复' } }, [child])
    expect(own.labels).toEqual({ wontfix: '不予修复' })
  })
})

describe('词典接线：说明表', () => {
  it('只含 labelDescriptions 的对象也算词典，有条目时不算空词典', () => {
    expect(isDictionaryLike({ labelDescriptions: { 'Good for newcomers': '适合新手' } })).toBe(true)
    expect(isEmptyDictionary({ labelDescriptions: { 'Good for newcomers': '适合新手' } })).toBe(false)
    expect(isEmptyDictionary({ labelDescriptions: {} })).toBe(true)
  })

  it('按键判断是否已合并（不与 labels、static 混用）；被覆盖的原文按 labelDescriptions 报出；自己的词条不含被合并文件的条目', () => {
    const child: PageDictionary = { labelDescriptions: { 'Good for newcomers': '适合新手' } }
    expect(
      isMerged(child, {
        labelDescriptions: { 'Good for newcomers': '适合新手', 'Extra attention is needed': '需要额外关注' }
      })
    ).toBe(true)
    expect(isMerged(child, { labels: { 'Good for newcomers': '适合新手' } })).toBe(false)
    expect(isMerged(child, { static: { 'Good for newcomers': '适合新手' } })).toBe(false)
    expect(overriddenKeys(child, { labelDescriptions: { 'Good for newcomers': '新手友好' } })).toEqual([
      'labelDescriptions "Good for newcomers"'
    ])
    const own = ownEntries({ labelDescriptions: { 'Good for newcomers': '适合新手', 'Extra attention is needed': '需要额外关注' } }, [
      child
    ])
    expect(own.labelDescriptions).toEqual({ 'Extra attention is needed': '需要额外关注' })
  })
})

describe('词典接线：星标列表名表', () => {
  it('只含 listNames 的对象也算词典，有条目时不算空词典', () => {
    expect(isDictionaryLike({ listNames: { '✨ Inspiration': '✨ 灵感' } })).toBe(true)
    expect(isEmptyDictionary({ listNames: { '✨ Inspiration': '✨ 灵感' } })).toBe(false)
    expect(isEmptyDictionary({ listNames: {} })).toBe(true)
  })

  it('按键判断是否已合并（不与 static 混用）；被覆盖的原文按 listNames 报出；自己的词条不含被合并文件的条目', () => {
    const child: PageDictionary = { listNames: { '✨ Inspiration': '✨ 灵感' } }
    expect(isMerged(child, { listNames: { '✨ Inspiration': '✨ 灵感', '🚀 My stack': '🚀 我的技术栈' } })).toBe(true)
    expect(isMerged(child, { static: { '✨ Inspiration': '✨ 灵感' } })).toBe(false)
    expect(overriddenKeys(child, { listNames: { '✨ Inspiration': '✨ 启发' } })).toEqual(['listNames "✨ Inspiration"'])
    const own = ownEntries({ listNames: { '✨ Inspiration': '✨ 灵感', '🚀 My stack': '🚀 我的技术栈' } }, [child])
    expect(own.listNames).toEqual({ '🚀 My stack': '🚀 我的技术栈' })
  })
})

describe('词典接线：标签正则', () => {
  const ECOSYSTEM: RegExpRule = [/^Pull requests that update ([\w.#+ -]{1,40}) code$/, '更新 $1 代码的拉取请求']
  const SAMPLE: RegExpRule = [/^Sample (\d+)$/, '示例 $1']

  it('只含 labelRegexp 的对象也算词典，有规则时不算空词典', () => {
    expect(isDictionaryLike({ labelRegexp: [ECOSYSTEM] })).toBe(true)
    expect(isEmptyDictionary({ labelRegexp: [ECOSYSTEM] })).toBe(false)
    expect(isEmptyDictionary({ labelRegexp: [] })).toBe(true)
  })

  it('按同一对象判断是否已合并（不与 regexp 混用）；自己的词条不含被合并文件的规则', () => {
    const child: PageDictionary = { labelRegexp: [ECOSYSTEM] }
    expect(isMerged(child, { labelRegexp: [ECOSYSTEM, SAMPLE] })).toBe(true)
    expect(isMerged(child, { labelRegexp: [[ECOSYSTEM[0], ECOSYSTEM[1]]] })).toBe(false)
    expect(isMerged(child, { regexp: [ECOSYSTEM] })).toBe(false)
    expect(isMerged(child, {})).toBe(false)
    const own = ownEntries({ regexp: [ECOSYSTEM], labelRegexp: [ECOSYSTEM, SAMPLE] }, [child])
    expect(own.labelRegexp).toEqual([SAMPLE])
    expect(own.regexp).toEqual([ECOSYSTEM])
  })
})
