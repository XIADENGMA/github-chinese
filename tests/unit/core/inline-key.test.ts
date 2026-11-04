import { describe, expect, it } from 'vitest'
import { createInlineFragments, sentenceOf } from '../../../src/core/inline'
import {
  generalizeKey,
  keyMatches,
  MAX_SENTENCE_CHILDREN,
  MAX_SENTENCE_KEY,
  minChildren,
  NUM_SLOT,
  patternKey,
  patternRegExp,
  patternSlots,
  sentenceKey,
  SLOT,
  slotCount,
  splitTemplate
} from '../../../src/core/inline-key'
import { createRecordStore } from '../../../src/core/records'

/** 长度恰为 length 的英文文字（单词间单个空格，不以空格结尾） */
function words(length: number): string {
  const text = 'Sample text '.repeat(Math.ceil(length / 12)).slice(0, length)
  return text.endsWith(' ') ? `${text.slice(0, -1)}x` : text
}

describe('句型键', () => {
  it('各段原文与槽位依次穿插，规范化后去掉槽位两侧的空格', () => {
    const key = sentenceKey(['\n  Are you sure you want to unblock ', '  from\n ', '?  '], [SLOT, SLOT])
    expect(key).toBe(`Are you sure you want to unblock${SLOT}from${SLOT}?`)
    expect(sentenceKey(['', ' published ', ' ', ''], [SLOT, SLOT, SLOT])).toBe(`${SLOT}published${SLOT}${SLOT}`)
  })

  it('字符串句型编译成同样的键；{#} 是数字槽位', () => {
    expect(patternKey('Are you sure you want to unblock {} from {}?')).toBe(
      sentenceKey(['Are you sure you want to unblock ', ' from ', '?'], [SLOT, SLOT])
    )
    expect(patternKey('{#} merged')).toBe(`${NUM_SLOT}merged`)
    expect(generalizeKey(`${NUM_SLOT}merged${SLOT}`)).toBe(`${SLOT}merged${SLOT}`)
  })

  it('页面文字中的 {} 不是槽位', () => {
    expect(sentenceKey(['Use {} here ', ''], [SLOT])).not.toBe(patternKey('Use {} here {}'))
  })

  it('正则句型：\\{\\} 匹配任一槽位，\\{#\\} 只匹配数字槽位，两侧空格不计', () => {
    const any = patternRegExp(/^\{\} published \{\} \{\}$/)
    expect(any.test(`${SLOT}published${SLOT}${SLOT}`)).toBe(true)
    expect(any.test(`${SLOT}published${NUM_SLOT}${SLOT}`)).toBe(true)
    const numeric = patternRegExp(/^\{#\} remaining$/)
    expect(numeric.test(`${NUM_SLOT}remaining`)).toBe(true)
    expect(numeric.test(`${SLOT}remaining`)).toBe(false)
    expect(patternRegExp(/^a {} b$/i).flags).toBe('i')
  })

  it('槽位数与译文切分', () => {
    expect(slotCount('确定要取消阻止 {} 访问 {} 吗？')).toBe(2)
    expect(slotCount(`${SLOT}已合并{#}`)).toBe(2)
    expect(patternSlots('{} published {} {}')).toBe(3)
    expect(patternSlots(/^\{\} published (\w+) \{#\}$/)).toBe(2)
    expect(splitTemplate('确定要取消阻止 {} 访问 {} 吗？', 2)).toEqual(['确定要取消阻止 ', ' 访问 ', ' 吗？'])
    expect(splitTemplate(`允许${SLOT}通过 {} 授权`, 2)).toEqual(['允许', '通过 ', ' 授权'])
    expect(splitTemplate('{} 已合并', 2)).toBeUndefined()
  })

  it('keyMatches：字符串句型的 {} 对应任一槽位，{#} 只对应数字槽位，其余字符相同', () => {
    const pattern = patternKey('{#} of {} checks passed')
    expect(keyMatches(pattern, `${NUM_SLOT}of${SLOT}checks passed`)).toBe(true)
    expect(keyMatches(pattern, `${NUM_SLOT}of${NUM_SLOT}checks passed`)).toBe(true)
    expect(keyMatches(pattern, `${SLOT}of${SLOT}checks passed`)).toBe(false)
    expect(keyMatches(pattern, `${NUM_SLOT}of${SLOT}checks failed`)).toBe(false)
    expect(keyMatches(pattern, `${NUM_SLOT}of${SLOT}checks passed.`)).toBe(false)
  })

  it('minChildren：每个槽位一个元素，非空的每段文字至少一个文本节点', () => {
    expect(minChildren(patternKey('Sample {} and {} done.'))).toBe(5)
    expect(minChildren(patternKey('{} and {}'))).toBe(3)
    expect(minChildren(patternKey('{} {#}'))).toBe(2)
    expect(minChildren(patternKey('{}'))).toBe(1)
  })
})

describe('行内句上限与引擎拆句一致', () => {
  it('宿主子节点不超过 MAX_SENTENCE_CHILDREN 时才拆句', () => {
    const host = document.createElement('p')
    host.append(document.createElement('b'))
    while (host.childNodes.length < MAX_SENTENCE_CHILDREN) host.append(document.createComment(''))
    expect(sentenceOf(host)).toBeDefined()
    host.append(document.createComment(''))
    expect(sentenceOf(host)).toBeUndefined()
  })

  it('句型键不超过 MAX_SENTENCE_KEY 时才查行内句', () => {
    const keys: string[] = []
    const records = createRecordStore(() => 0)
    const fragments = createInlineFragments({
      records,
      textSource: node => records.textSource(node),
      translate: () => undefined,
      fit: (_node, translated) => translated,
      applyRun: () => undefined,
      noteRunMiss: () => undefined,
      translateInline: key => {
        keys.push(key)
        return undefined
      },
      inlineEnabled: () => true,
      touch: () => undefined,
      skipped: () => false
    })
    /** 宿主为「文字 + 元素」，句型键为文字 + 槽位 */
    const lookups = (length: number): string[] => {
      const host = document.createElement('p')
      host.append(words(length - 1), document.createElement('b'))
      keys.length = 0
      fragments.beginRound()
      fragments.claimRun([host.firstChild as Text], false)
      fragments.endRound()
      return [...keys]
    }
    expect(lookups(MAX_SENTENCE_KEY).map(key => key.length)).toEqual([MAX_SENTENCE_KEY])
    expect(lookups(MAX_SENTENCE_KEY + 1)).toEqual([])
  })
})
