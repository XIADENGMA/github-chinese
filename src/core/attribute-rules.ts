/**
 * 属性规则（见 types 的 AttributeRule）：按属性名分组；先试正则、再看选择器，首个命中的规则生效。
 */
import { BUTTON_INPUT_TYPES } from './ignore'
import { applyRule, normalizeText } from './matcher'
import { safeMatches } from './selectors'
import type { AttributeRule, RegExpRule } from './types'

/** 按钮类型的 input（调用方已确认是 input） */
export function isButtonInput(element: Element): boolean {
  return BUTTON_INPUT_TYPES.has((element.getAttribute('type') ?? '').toLowerCase())
}

/** value 规则可改写的元素：按钮 input、带 disabled 属性的其他 input（其余 input 的值是用户输入，其他元素的 value 不显示） */
function isValueRuleTarget(element: Element): boolean {
  return element.localName === 'input' && (isButtonInput(element) || element.hasAttribute('disabled'))
}

/** 属性名 → [选择器, 规则]，按优先级 */
export type AttributeRuleSet = ReadonlyMap<string, readonly (readonly [selector: string, rule: RegExpRule])[]>

export const EMPTY_ATTRIBUTE_RULES: AttributeRuleSet = new Map()

/** 按属性名分组；选择器不合法的规则丢弃 */
export function compileAttributeRules(rules: readonly AttributeRule[], probe: Element): AttributeRuleSet {
  const set = new Map<string, (readonly [string, RegExpRule])[]>()
  for (const [selector, name, pattern, replacement] of rules) {
    try {
      probe.matches(selector)
    } catch {
      continue
    }
    const list = set.get(name)
    const entry = [selector, [pattern, replacement]] as const
    if (list) list.push(entry)
    else set.set(name, [entry])
  }
  return set
}

/**
 * 属性原文按规则改写的结果：没有规则命中时返回 undefined；替换结果与规范化原文相同时返回原文。
 */
export function applyAttributeRules(set: AttributeRuleSet, element: Element, name: string, source: string): string | undefined {
  const list = set.get(name)
  if (!list || (name === 'value' && !isValueRuleTarget(element))) return undefined
  const text = normalizeText(source)
  for (const [selector, rule] of list) {
    if (!rule[0].test(text) || !safeMatches(element, selector)) continue
    const result = applyRule(text, rule)
    if (result !== undefined) return result === text ? source : result
  }
  return undefined
}
