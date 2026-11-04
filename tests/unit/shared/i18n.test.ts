import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { simplifiedChars } from '../../../scripts/data/simplified-only'
import { MESSAGES, translateMessage } from '../../../src/i18n'
import type { UiLanguage } from '../../../src/shared/locale'

const LANGUAGES = Object.keys(MESSAGES) as UiLanguage[]
const KEYS = Object.keys(MESSAGES['zh-CN'])

describe('扩展界面文案', () => {
  it.each(LANGUAGES)('%s：与简体逐键对应，无空文案', language => {
    const messages = MESSAGES[language]
    expect(Object.keys(messages).sort()).toEqual([...KEYS].sort())
    for (const key of KEYS) expect(messages[key as keyof typeof messages].trim()).not.toBe('')
  })

  it.each(LANGUAGES)('%s：参数占位与简体一致', language => {
    const params = (text: string): string[] => [...text.matchAll(/\{(\w+)\}/g)].map(match => match[1]!).sort()
    for (const key of KEYS) {
      const name = key as keyof (typeof MESSAGES)['zh-CN']
      expect(params(MESSAGES[language][name]), name).toEqual(params(MESSAGES['zh-CN'][name]))
    }
  })

  it('繁体文案不混入简体字', () => {
    for (const [key, text] of Object.entries(MESSAGES['zh-TW'])) expect(simplifiedChars(text), `${key}：${text}`).toEqual([])
  })

  it('英文文案不含中文', () => {
    for (const [key, text] of Object.entries(MESSAGES.en)) expect(text, key).not.toMatch(/[一-鿿]/)
  })
})

describe('扩展名称、说明（public/_locales）', () => {
  /** messages.json 中各条的 message */
  function messagesOf(folder: string): Record<string, string> {
    const raw = JSON.parse(readFileSync(`public/_locales/${folder}/messages.json`, 'utf8')) as Record<string, { message: string }>
    return Object.fromEntries(Object.entries(raw).map(([key, value]) => [key, value.message]))
  }

  it('各语言的键相同', () => {
    const keys = Object.keys(messagesOf('en')).sort()
    for (const folder of ['zh_CN', 'zh_TW']) expect(Object.keys(messagesOf(folder)).sort()).toEqual(keys)
  })

  it('繁体不混入简体字；英文不含中文', () => {
    for (const [key, text] of Object.entries(messagesOf('zh_TW'))) expect(simplifiedChars(text), key).toEqual([])
    for (const [key, text] of Object.entries(messagesOf('en'))) expect(text, key).not.toMatch(/[一-鿿]/)
  })
})

describe('translateMessage', () => {
  it('按语言取文案并替换参数', () => {
    expect(translateMessage('zh-CN', 'imported', { count: 3 })).toBe('已导入 3 条')
    expect(translateMessage('zh-TW', 'imported', { count: 3 })).toBe('已匯入 3 筆')
    expect(translateMessage('en', 'deleteEntry', { source: 'Code' })).toBe('Delete Code')
  })

  it('没有对应参数的占位符保留；原型链上的名称不当作参数', () => {
    expect(translateMessage('zh-CN', 'deleteEntry')).toBe('删除 {source}')
    expect(translateMessage('zh-CN', 'deleteEntry', {})).toBe('删除 {source}')
    expect(translateMessage('en', 'autoOption', { toString: 'x' } as never)).toBe('Auto ({name})')
  })
})
