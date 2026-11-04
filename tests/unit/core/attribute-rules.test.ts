import { describe, expect, it } from 'vitest'
import { applyAttributeRules, compileAttributeRules } from '../../../src/core/attribute-rules'
import type { AttributeRule } from '../../../src/core/types'

const probe = document.createElement('div')

function element(html: string): Element {
  probe.innerHTML = html
  return probe.firstElementChild!
}

describe('compileAttributeRules / applyAttributeRules', () => {
  const rules: readonly AttributeRule[] = [
    ['[invalid', 'title', /^(.+)$/, '不应生效'],
    ['.a', 'title', /^View (.+)$/, '查看 $1'],
    ['.b', 'title', /^View (.+)$/, '浏览 $1'],
    ['span', 'aria-label', /^(.+)$/, '$1']
  ]
  const set = compileAttributeRules(rules, probe)

  it('按属性名分组，丢弃选择器不合法的规则', () => {
    expect([...set.keys()].sort()).toEqual(['aria-label', 'title'])
    expect(set.get('title')).toHaveLength(2)
  })

  it('先看正则再看选择器，首个命中的规则生效；原文先规范化', () => {
    expect(applyAttributeRules(set, element('<i class="a b"></i>'), 'title', ' View  Sample ')).toBe('查看 Sample')
    expect(applyAttributeRules(set, element('<i class="b"></i>'), 'title', 'View Sample')).toBe('浏览 Sample')
  })

  it('没有规则命中：返回 undefined', () => {
    expect(applyAttributeRules(set, element('<i class="c"></i>'), 'title', 'View Sample')).toBeUndefined()
    expect(applyAttributeRules(set, element('<i class="a"></i>'), 'title', 'Sample')).toBeUndefined()
    expect(applyAttributeRules(set, element('<i class="a"></i>'), 'placeholder', 'View Sample')).toBeUndefined()
  })

  it('替换结果与规范化原文相同：返回原文', () => {
    expect(applyAttributeRules(set, element('<span></span>'), 'aria-label', '  Sample  text ')).toBe('  Sample  text ')
  })
})

describe('value 规则', () => {
  const set = compileAttributeRules([['.sample *', 'value', /^Sample (.+)$/, '示例 $1']], probe)
  const apply = (html: string): string | undefined =>
    applyAttributeRules(set, element(`<div class="sample">${html}</div>`).firstElementChild!, 'value', 'Sample text')

  it('只作用于按钮 input 与带 disabled 属性的其他 input', () => {
    expect(apply('<input type="submit">')).toBe('示例 text')
    expect(apply('<input type="BUTTON">')).toBe('示例 text')
    expect(apply('<input type="text" disabled>')).toBe('示例 text')
    expect(apply('<input disabled>')).toBe('示例 text')
  })

  it('未禁用的非按钮 input、其他元素：返回 undefined', () => {
    expect(apply('<input type="text">')).toBeUndefined()
    expect(apply('<input>')).toBeUndefined()
    expect(apply('<button disabled></button>')).toBeUndefined()
    expect(apply('<option disabled></option>')).toBeUndefined()
  })
})
