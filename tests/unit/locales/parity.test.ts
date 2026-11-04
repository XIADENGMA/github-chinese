import { describe, expect, it } from 'vitest'
import type { PageDictionary } from '../../../src/core/types'
import { zhCN } from '../../../src/locales/zh-CN/index'
import { zhTW } from '../../../src/locales/zh-TW/index'

/** 选择器里含中文的引号属性值按各自译文匹配，不比 */
const CJK_QUOTED_RE = /"[^"]*[一-鿿][^"]*"|'[^']*[一-鿿][^']*'/g

function selectorShape(selector: string): string {
  return selector.replace(CJK_QUOTED_RE, quoted => `${quoted[0]}…${quoted[0]}`)
}

/** 词典的结构：键、正则、选择器、属性名、句型；不含译文 */
function structure(dict: PageDictionary): unknown {
  return {
    static: Object.keys(dict.static ?? {}),
    scoped: Object.keys(dict.scoped ?? {}),
    labels: Object.keys(dict.labels ?? {}),
    labelDescriptions: Object.keys(dict.labelDescriptions ?? {}),
    labelRegexp: (dict.labelRegexp ?? []).map(([pattern]) => String(pattern)),
    listNames: Object.keys(dict.listNames ?? {}),
    regexp: (dict.regexp ?? []).map(([pattern]) => String(pattern)),
    ignore: (dict.ignore ?? []).map(selectorShape),
    attributeRules: (dict.attributeRules ?? []).map(([selector, attribute, pattern]) => [
      selectorShape(selector),
      attribute,
      String(pattern)
    ]),
    inline: (dict.inline ?? []).map(([pattern]) => String(pattern)),
    mergeText: (dict.mergeText ?? []).map(selectorShape)
  }
}

describe('简繁语言包结构一致', () => {
  it('页面类型与注册顺序相同', () => {
    expect(zhTW.map(([page]) => page)).toEqual(zhCN.map(([page]) => page))
  })

  it.each(zhCN.map(([page], index) => [`${index} ${page}`, index] as const))('%s：键、正则、选择器、句型相同', (_, index) => {
    expect(structure(zhTW[index]![1])).toEqual(structure(zhCN[index]![1]))
  })
})
