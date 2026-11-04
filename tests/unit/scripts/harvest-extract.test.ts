import { afterEach, describe, expect, it } from 'vitest'
import { expandGroup, extractStrings, groupTexts, type ExtractArgs, type HarvestedString } from '../../../scripts/harvest-extract'

const ARGS: ExtractArgs = {
  ignoreSelector: '.ignored',
  ignoreTags: ['CODE'],
  timeTags: ['relative-time'],
  attributes: ['aria-label'],
  buttonTypes: ['submit']
}

function extract(html: string): HarvestedString[] {
  document.body.innerHTML = html
  return extractStrings(ARGS).filter(item => item.kind !== 'title')
}

afterEach(() => {
  document.body.innerHTML = ''
})

describe('采集：相邻文本节点', () => {
  it('同一父元素下只隔注释、两段以上有文字的记为文本组，各段原文以分隔符连接', () => {
    expect(extract('<p>Updated <!-- -->3<!-- --> days ago</p>')).toEqual([
      { kind: 'group', text: 'Updated \u00023\u0002 days ago', count: 1 }
    ])
  })

  it('元素隔开的、只有一段有文字的、整组超长的逐段记', () => {
    // 每段不超过上限、合起来超过
    const long = 'word '.repeat(50)
    expect(
      extract(`<span>Sample <b>text</b> more</span><p>Issues<!---->  </p><p>${long}<!---->${long}</p>`).map(item => [
        item.kind,
        item.text.length > 40 ? item.text.length : item.text
      ])
    ).toEqual([
      ['text', 'Sample'],
      ['text', 'text'],
      ['text', 'more'],
      ['text', 'Issues'],
      ['text', long.trim().length]
    ])
  })

  it('忽略区域、跳过标签里的文字不计；跳过标签的属性照常采集', () => {
    expect(extract('<div class="ignored">Sample<!---->text</div><code aria-label="Copy">x = 1</code>Done')).toEqual([
      { kind: 'attr', text: 'Copy', count: 1 },
      { kind: 'text', text: 'Done', count: 1 }
    ])
  })
})

describe('统计：文本组展开', () => {
  const group: HarvestedString = { kind: 'group', text: 'Updated \u00023\u0002 days ago', count: 2 }

  it('整组命中时按整组文字计', () => {
    expect(expandGroup(group, text => (text === 'Updated 3 days ago' ? '3 天前更新' : undefined))).toEqual([
      { kind: 'group', text: 'Updated 3 days ago', count: 2 }
    ])
  })

  it('未命中时拆成含字母的各段', () => {
    expect(expandGroup(group, () => undefined)).toEqual([
      { kind: 'text', text: 'Updated', count: 2 },
      { kind: 'text', text: 'days ago', count: 2 }
    ])
  })

  it('其他类型原样返回；判断词条是否用到时整组文字与各段都算', () => {
    const text: HarvestedString = { kind: 'text', text: 'Issues', count: 1 }
    expect(expandGroup(text, () => undefined)).toEqual([text])
    expect(groupTexts(group)).toEqual(['Updated 3 days ago', 'Updated', '3', 'days ago'])
    expect(groupTexts(text)).toEqual(['Issues'])
  })
})
