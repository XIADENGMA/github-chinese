import { describe, expect, it } from 'vitest'
import {
  attributeMatches,
  compileIgnoreIndex,
  conditionHolds,
  elementMatches,
  safeMatches,
  selectorKeys,
  splitSelectorList,
  tagMatches
} from '../../../src/core/selectors'

function element(html: string): Element {
  const host = document.createElement('div')
  host.innerHTML = html
  return host.firstElementChild!
}

describe('splitSelectorList', () => {
  it('按顶层逗号拆分，忽略括号与引号内的逗号', () => {
    expect(splitSelectorList('.a, :is(h1, h2) > b,[title="x, y"] , ')).toEqual(['.a', ':is(h1, h2) > b', '[title="x, y"]'])
    expect(splitSelectorList('a\\,b, c')).toEqual(['a\\,b', 'c'])
  })
})

describe('selectorKeys', () => {
  it.each([
    ['.markdown-body', [{ kind: 'class', name: 'markdown-body' }]],
    ['#user-profile-frame .d-table-cell .color-fg-muted.text-small', [{ kind: 'class', name: 'color-fg-muted' }]],
    ['article.Box-row > h2', [{ kind: 'tag', name: 'h2' }]],
    ['div#main', [{ kind: 'id', name: 'main' }]],
    ['a[data-hovercard-type="user"]', [{ kind: 'attribute', condition: { name: 'data-hovercard-type', operator: '=', value: 'user' } }]],
    ['[contenteditable=""]', [{ kind: 'attribute', condition: { name: 'contenteditable', operator: '=', value: '' } }]],
    ['[data-gcn-ignore]', [{ kind: 'attribute', condition: { name: 'data-gcn-ignore', operator: '', value: '' } }]],
    ['[class*="prc-Token-"] [class*=\'Text-\' i]', [{ kind: 'attribute', condition: { name: 'class', operator: '*=', value: 'text-' } }]],
    ['p[class*="description__"]', [{ kind: 'attribute', condition: { name: 'class', operator: '*=', value: 'description__' } }]],
    ['[itemprop~=codeRepository][itemprop="x"]', [{ kind: 'attribute', condition: { name: 'itemprop', operator: '=', value: 'x' } }]],
    [
      'a:not([href$="l=Other"]) > [itemprop="keywords"]',
      [{ kind: 'attribute', condition: { name: 'itemprop', operator: '=', value: 'keywords' } }]
    ],
    ['.pinned-item-list-item-content tool-tip', [{ kind: 'tag', name: 'tool-tip' }]],
    ['h1::before', [{ kind: 'tag', name: 'h1' }]]
  ])('%s', (selector, keys) => {
    expect(selectorKeys(selector)).toEqual(keys)
  })

  it(':is() / :where() 展开为各分支特征', () => {
    expect(selectorKeys('[data-listview-item-title-container] :is(h1, h2, .title)')).toEqual([
      { kind: 'tag', name: 'h1' },
      { kind: 'tag', name: 'h2' },
      { kind: 'class', name: 'title' }
    ])
    expect(selectorKeys(':where(.a b, c)')).toEqual([
      { kind: 'tag', name: 'b' },
      { kind: 'tag', name: 'c' }
    ])
  })

  it.each(['*', ':root', ':is(*, .a)', ':not(.a)', '.a\\:b', '[xlink|href]', ':is(.a):is(.b)', ':has(.a)'])('%s 提取不到特征', selector => {
    expect(selectorKeys(selector)).toBeUndefined()
  })
})

describe('conditionHolds', () => {
  it.each([
    ['~=', 'coderepository', 'url codeRepository', true],
    ['~=', 'code', 'codeRepository', false],
    ['~=', 'a b', 'a b', false],
    ['|=', 'en', 'en-US', true],
    ['|=', 'en', 'eng', false],
    ['^=', 'prc-', 'prc-Token', true],
    ['^=', '', 'x', false],
    ['$=', 'other', 'l=Other', true],
    ['*=', 'token-', 'x prc-Token-y', true],
    ['*=', 'zzz', 'abc', false],
    ['=', 'user', 'USER', true],
    ['', '', 'anything', true]
  ])('%s %s 对 %s → %s', (operator, value, actual, expected) => {
    expect(conditionHolds({ name: 'x', operator, value }, actual)).toBe(expected)
  })
})

describe('compileIgnoreIndex', () => {
  const probe = document.createElement('div')

  it('丢弃非法与重复选择器，其余照常编译', () => {
    const index = compileIgnoreIndex(['[[[', '', 42, '.a', '.a', 'p:nth-child(', '[x="1"]', '*'], probe)
    expect(index.invalid).toEqual(['[[[', '', '42', 'p:nth-child('])
    expect(index.selector).toBe('.a, [x="1"], *')
    expect(index.byClass.get('a')).toEqual(['.a'])
    expect(index.byValue.get('x')?.get('1')).toEqual(['[x="1"]'])
    expect(index.universal).toEqual(['*'])
  })

  it('选择器列表拆成多个条目', () => {
    const index = compileIgnoreIndex(['.a, b, [c]'], probe)
    expect(index.byClass.get('a')).toEqual(['.a'])
    expect(index.byTag.get('b')).toEqual(['b'])
    expect(index.byAttribute.get('c')).toEqual([{ selector: '[c]', condition: { name: 'c', operator: '', value: '' } }])
  })
})

describe('元素匹配', () => {
  const probe = document.createElement('div')
  const index = compileIgnoreIndex(
    [
      '.markdown-body',
      'a[data-hovercard-type="user"]',
      '[class*="prc-TopicTag-"]',
      'article > h2',
      '#readme',
      '[data-listview-item-title-container] :is(h3)'
    ],
    probe
  )

  it.each([
    ['<div class="x markdown-body"></div>', true],
    ['<div class="markdown"></div>', false],
    ['<a data-hovercard-type="user"></a>', true],
    ['<a data-hovercard-type="issue"></a>', false],
    ['<span data-hovercard-type="user"></span>', false],
    ['<span class="prc-TopicTag-TopicTag-abc"></span>', true],
    ['<span class="prc-Other"></span>', false],
    ['<article><h2></h2></article>', false],
    ['<section id="readme"></section>', true]
  ])('%s → %s', (html, expected) => {
    expect(elementMatches(index, element(html))).toBe(expected)
  })

  it('组合选择器按最右特征定位后用 matches 校验', () => {
    const article = element('<article><h2>t</h2></article>')
    expect(tagMatches(index, article.firstElementChild!, 'h2')).toBe(true)
    const list = element('<div data-listview-item-title-container><h3>t</h3><h4>t</h4></div>')
    expect(elementMatches(index, list.children[0]!)).toBe(true)
    expect(elementMatches(index, list.children[1]!)).toBe(false)
  })

  it('attributeMatches 只看给定属性', () => {
    const link = element('<a data-hovercard-type="user" class="markdown-body"></a>')
    expect(attributeMatches(index, link, 'data-hovercard-type', 'user')).toBe(true)
    expect(attributeMatches(index, link, 'class', 'markdown-body')).toBe(true)
    expect(attributeMatches(index, link, 'href', '/')).toBe(false)
  })

  it('没有类名索引时跳过 class 拆分', () => {
    const tagOnly = compileIgnoreIndex(['pre'], probe)
    expect(attributeMatches(tagOnly, element('<p class="a b"></p>'), 'class', 'a b')).toBe(false)
  })

  it('matches 抛错按未命中处理', () => {
    const broken = {
      matches: () => {
        throw new Error('bad')
      }
    } as unknown as Element
    expect(safeMatches(broken, '.a')).toBe(false)
  })
})
