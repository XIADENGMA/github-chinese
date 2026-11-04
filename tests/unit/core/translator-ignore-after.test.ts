// @vitest-environment-options { "url": "https://github.com/vuejs/core/issues/1" }
import { afterEach, describe, expect, it } from 'vitest'
import { createTranslator, type Translator } from '../../../src/core/translator'
import type { LocaleBundle, PageKey } from '../../../src/core/types'
import { $, settle, TEST_BUNDLE, testMatcher } from './helpers'

/**
 * 先翻译、后变为忽略的区域：忽略规则依赖子节点（:has()）、兄弟、属性，或页面加上退出标记。
 * 区域根自带已译属性的情形见 translator-attribute-rules.test.ts
 */
const BUNDLE: LocaleBundle = [
  ...TEST_BUNDLE,
  ['common', { static: { Documentation: '文档', 'Loading...': '正在加载...' } }],
  [
    'issues',
    {
      ignore: ['ul[role="group"]:not(:has([data-loading]))', '[aria-label$=" (user)"]', '.wrap:has(.marker) .title'],
      attributeRules: [['ul[role="group"]', 'aria-label', /^(.+) group$/, '$1 组']]
    }
  ]
]

const ISSUES: readonly PageKey[] = ['common', 'repository', 'issues']

/** 加载中的分组：加载行移除后分组命中忽略规则 */
const LOADING_GROUP = (attributes: string): string =>
  `<ul id="g" role="group" ${attributes}><li data-loading="true">Loading...</li><li id="keep">Copy</li></ul>`

let translator: Translator | undefined

function start(html: string, bundle = BUNDLE): Translator {
  document.body.innerHTML = html
  translator = createTranslator({
    matcher: testMatcher(undefined, bundle),
    host: window,
    collectUntranslated: true,
    resolvePages: () => ISSUES
  })
  translator.start()
  return translator
}

function stop(t: Translator): void {
  t.stop()
  translator = undefined
}

const text = (selector: string): string => $(selector).textContent ?? ''
const attribute = (selector: string, name: string): string | null => $(selector).getAttribute(name)

function element(tag: string, content: string): HTMLElement {
  return Object.assign(document.createElement(tag), { textContent: content })
}

afterEach(() => {
  translator?.stop()
  translator = undefined
  document.body.innerHTML = ''
  Reflect.deleteProperty(document, 'readyState')
})

describe('依赖子节点的忽略规则（:has()）', () => {
  it('区域根没有译文属性：加载行移除后区域内已译的文字还原；停止后不变', async () => {
    const t = start(LOADING_GROUP(''))
    expect(text('#keep')).toBe('复制')
    $('#g [data-loading]').remove()
    await settle()
    expect(text('#keep')).toBe('Copy')
    stop(t)
    expect(text('#keep')).toBe('Copy')
  })

  it('区域根的属性由属性规则写入：区域内已译的文字还原，根的属性仍按规则改写；停止后还原', async () => {
    const t = start(LOADING_GROUP('aria-label="Sample group"'))
    expect(attribute('#g', 'aria-label')).toBe('Sample 组')
    expect(text('#keep')).toBe('复制')
    $('#g [data-loading]').remove()
    await settle()
    expect(attribute('#g', 'aria-label')).toBe('Sample 组')
    expect(text('#keep')).toBe('Copy')
    stop(t)
    expect(attribute('#g', 'aria-label')).toBe('Sample group')
  })

  it('嵌套的组：内层加载完成后外层随之命中忽略，外层的属性还原', async () => {
    start(
      '<ul role="group" id="outer" aria-label="Documentation"><li>' +
        '<ul role="group" id="inner" aria-label="Sample"><li data-loading>Loading</li></ul></li></ul>'
    )
    expect(attribute('#outer', 'aria-label')).toBe('文档')
    $('#inner [data-loading]').remove()
    await settle()
    expect(attribute('#outer', 'aria-label')).toBe('Documentation')
  })
})

describe('依赖属性的忽略规则', () => {
  it('元素属性变化使自身命中（元素自身没有译文属性）：其中已译的文字还原', async () => {
    start('<div id="u" aria-label="x"><span id="s">Copy</span></div>')
    expect(text('#s')).toBe('复制')
    $('#u').setAttribute('aria-label', 'octocat (user)')
    await settle()
    expect(text('#s')).toBe('Copy')
  })

  it('还原的文字是外面包着标点的 span 的语境：标点写回原文，与全新处理相同', async () => {
    const t = start('<span id="o"><span><a id="u" aria-label="x">Copy</a></span><span>.</span></span>')
    expect(text('#o')).toBe('复制。')
    $('#u').setAttribute('aria-label', 'octocat (user)')
    await settle()
    expect(text('#o')).toBe('Copy.')
    t.stop()
    t.start()
    expect(text('#o')).toBe('Copy.')
  })
})

describe('条件在兄弟上的忽略规则：文档解析结束时检查', () => {
  it('文档解析中条件元素后到：解析结束后还原区域内的文字与属性', async () => {
    let state: DocumentReadyState = 'loading'
    Object.defineProperty(document, 'readyState', { configurable: true, get: () => state })
    start('<div class="wrap" id="w"><h2 class="title" title="Copy">Copy</h2></div>')
    expect(text('#w .title')).toBe('复制')
    expect(attribute('#w .title', 'title')).toBe('复制')
    $('#w').append(Object.assign(document.createElement('span'), { className: 'marker' }))
    await settle()
    state = 'interactive'
    document.dispatchEvent(new Event('DOMContentLoaded'))
    await settle()
    expect(text('#w .title')).toBe('Copy')
    expect(attribute('#w .title', 'title')).toBe('Copy')
  })

  it('解析结束后还原的文字是外面包着标点的 span 的语境：标点写回原文，与全新处理相同', async () => {
    let state: DocumentReadyState = 'loading'
    Object.defineProperty(document, 'readyState', { configurable: true, get: () => state })
    const t = start('<span id="o"><span class="wrap" id="w"><span class="title">Copy</span></span><span>.</span></span>')
    expect(text('#o')).toBe('复制。')
    $('#w').append(Object.assign(document.createElement('span'), { className: 'marker' }))
    await settle()
    state = 'interactive'
    document.dispatchEvent(new Event('DOMContentLoaded'))
    await settle()
    expect(text('#o')).toBe('Copy.')
    t.stop()
    t.start()
    expect(text('#o')).toBe('Copy.')
  })
})

describe('退出标记属性', () => {
  it.each([
    ['contenteditable', 'true'],
    ['contenteditable', ''],
    ['translate', 'no'],
    ['data-gcn-ignore', '']
  ])('元素加上 %s="%s" 后还原其中的译文与属性；去掉后不补译，之后的变动照常翻译', async (name, value) => {
    start('<div id="d" title="Copy"><p>Copy</p></div>')
    expect(text('#d p')).toBe('复制')
    expect(attribute('#d', 'title')).toBe('复制')
    $('#d').setAttribute(name, value)
    await settle()
    expect(text('#d p')).toBe('Copy')
    expect(attribute('#d', 'title')).toBe('Copy')
    $('#d').removeAttribute(name)
    await settle()
    expect(text('#d p')).toBe('Copy')
    $('#d').append(element('span', 'Edit'))
    await settle()
    expect(text('#d span')).toBe('编辑')
  })

  it('contenteditable="false" 不是退出标记：不还原', async () => {
    start('<div id="d" title="Copy"><p>Copy</p></div>')
    $('#d').setAttribute('contenteditable', 'false')
    await settle()
    expect(text('#d p')).toBe('复制')
    expect(attribute('#d', 'title')).toBe('复制')
  })

  it.each([
    ['translate', 'no'],
    ['contenteditable', 'true'],
    ['data-gcn-ignore', '']
  ])('同一批里元素被移动且加上 %s="%s"：其中的译文、转换过的标点还原，与全新处理相同', async (name, value) => {
    const bundle: LocaleBundle = [...BUNDLE, ['common', { static: { 'Contributed to': '贡献于', Sample: '示例' } }]]
    const shown = (): string[] => ['#punct', '#text', '#deep', '#after'].map(text)
    const t = start(
      '<p id="punct">Contributed to <a>a</a><span id="comma">, </span><a>b</a></p>' +
        '<p id="text"><a>a</a><span id="sample">Sample</span></p>' +
        '<p id="deep"><a>x</a><span id="outer"><span id="inner">Sample</span></span></p>' +
        '<p id="after"><a>y</a><span id="later">Sample</span></p>',
      bundle
    )
    expect(shown()).toEqual(['贡献于 a、b', 'a示例', 'x示例', 'y示例'])
    $('#comma').setAttribute(name, value)
    $('#punct').append($('#comma'))
    $('#sample').setAttribute(name, value)
    $('#text').prepend($('#sample'))
    // 标记加在后代上、被移动的是祖先
    $('#inner').setAttribute(name, value)
    $('#deep').prepend($('#outer'))
    // 先移动、后加标记
    $('#after').prepend($('#later'))
    $('#later').setAttribute(name, value)
    await settle()
    const changed = shown()
    expect(changed).toEqual(['贡献于 ab, ', 'Samplea', 'Samplex', 'Sampley'])
    t.stop()
    t.start()
    expect(shown()).toEqual(changed)
  })
})

describe('整段写入过的合并区域内，元素先译后忽略：所在区域照常逐组重算', () => {
  const MERGE_BUNDLE: LocaleBundle = [
    ...BUNDLE,
    ['common', { static: { remaining: '剩余', items: '项' }, regexp: [[/^(\d[\d,]*) remaining items?$/, '还有 $1 项']] }],
    ['issues', { ignore: ['span.x:not(:has(.loading))'], mergeText: ['[class*="remainingItemsHeading__"]'] }]
  ]
  /** 整段写入：译文在计数所在的文本节点，其余置空 */
  const REMAINING =
    '<h3 class="remainingItemsHeading__x" id="h"><span id="first">12</span>' + '<span id="rest"> remaining <span>items</span></span></h3>'
  const LOADING = '<i class="loading"></i>'

  it.each([
    ['其余文字所在元素加上 translate="no"', REMAINING, () => $('#rest').setAttribute('translate', 'no'), '12 remaining items'],
    ['计数所在元素加上 contenteditable="true"', REMAINING, () => $('#first').setAttribute('contenteditable', 'true'), '12 剩余 项'],
    [
      '区域末尾的空元素加上 data-gcn-ignore',
      REMAINING.replace('</h3>', '<i id="icon"></i></h3>'),
      () => $('#icon').setAttribute('data-gcn-ignore', ''),
      '12 剩余 项'
    ],
    [
      '其余文字所在元素的 aria-label 变为命中忽略规则',
      REMAINING,
      () => $('#rest').setAttribute('aria-label', 'octocat (user)'),
      '12 remaining items'
    ],
    [
      '其余文字所在元素移除加载行后命中 :has() 规则',
      REMAINING.replace('<span id="rest">', '<span class="x" id="rest">').replace('</span></span></h3>', `</span>${LOADING}</span></h3>`),
      () => $('#rest .loading').remove(),
      '12 remaining items'
    ],
    [
      '计数所在元素移除加载行后命中 :has() 规则',
      REMAINING.replace('<span id="first">12', `<span class="x" id="first">12${LOADING}`),
      () => $('#first .loading').remove(),
      '12 剩余 项'
    ]
  ])('%s：与全新处理相同；停止后还原', async (_, html, change, shown) => {
    const t = start(html, MERGE_BUNDLE)
    expect(text('#h')).toBe('还有 12 项')
    change()
    await settle()
    expect(text('#h')).toBe(shown)
    stop(t)
    expect(text('#h')).toBe('12 remaining items')
  })

  it('计数所在元素加上退出标记后页面改写计数：其余文字保持照常译出', async () => {
    start(REMAINING, MERGE_BUNDLE)
    $('#first').setAttribute('data-gcn-ignore', '')
    await settle()
    ;($('#first').firstChild as Text).data = '13'
    await settle()
    expect(text('#h')).toBe('13 剩余 项')
  })

  it('文档解析结束时区域内元素命中条件在兄弟上的规则：所在区域照常逐组重算', async () => {
    let state: DocumentReadyState = 'loading'
    Object.defineProperty(document, 'readyState', { configurable: true, get: () => state })
    start(`<div class="wrap" id="w">${REMAINING}</div>`, MERGE_BUNDLE)
    expect(text('#h')).toBe('还有 12 项')
    // 类名在条件元素到达前补上（类名不观察）：happy-dom 按元素缓存匹配结果，条件元素加到祖先下时不失效
    $('#rest').classList.add('title')
    $('#w').append(Object.assign(document.createElement('span'), { className: 'marker' }))
    await settle()
    state = 'interactive'
    document.dispatchEvent(new Event('DOMContentLoaded'))
    await settle()
    expect(text('#h')).toBe('12 remaining items')
  })
})

describe.each([
  [
    '忽略区域的根属性变化',
    (content: string): string =>
      `<div class="comment-body" id="r" title="Sample text"><div class="js-suggested-changes-blob">${content}</div></div>`,
    (): void => $('#r').setAttribute('title', 'Sample')
  ],
  [
    '区域的属性变化后命中忽略规则',
    (content: string): string => `<div id="r" aria-label="x"><div class="js-suggested-changes-blob">${content}</div></div>`,
    (): void => $('#r').setAttribute('aria-label', 'octocat (user)')
  ]
])('区域内的重新进入区域在同一批先被处理，随后区域还原（%s）', (_, region, restore) => {
  /** 行内句、kbd 句子、整段合并 */
  const JUDGED: LocaleBundle = [
    ...BUNDLE,
    [
      'common',
      {
        static: {
          'Type / to search': '按 / 搜索',
          'Press / to search': '按下 / 搜索',
          'Press K to search': '按 K 搜索',
          'Type K to search': '输入 K 搜索'
        },
        inline: [
          ['{} published {} {}', '{} 发布了 {} {}'],
          ['{} opened {} {}', '{} 打开了 {} 于 {}']
        ],
        mergeText: ['.hint']
      }
    ]
  ]

  it.each([
    [
      '行内句宿主末尾插入与文字不相邻的槽位（只经重判）',
      '<div><p id="t"><span>octocat</span> published <span>GHSA-1</span></p></div>',
      () => $('#t').append(element('span', 'today')),
      'octocat published GHSA-1',
      'octocat 发布了 GHSA-1today'
    ],
    [
      '页面改写行内句宿主的一段（经文本组判断）',
      '<div><p id="t"><span>octocat</span> published <span>GHSA-1</span> <span>today</span></p></div>',
      () => {
        ;($('#t span').nextSibling as Text).data = ' opened '
      },
      'octocat 发布了 GHSA-1 today',
      'octocat 打开了 GHSA-1 于 today'
    ],
    [
      'kbd 句子的首段被改写',
      '<div><p id="t">Type <kbd>/</kbd> to search</p></div>',
      () => {
        ;($('#t').firstChild as Text).data = 'Press '
      },
      '按 / 搜索',
      '按下 / 搜索'
    ],
    [
      '合并区域的首段被改写',
      '<div><p id="t"><span class="hint">Press <b>K</b> to search</span></p></div>',
      () => {
        ;($('#t .hint').firstChild as Text).data = 'Type '
      },
      '按 K 搜索',
      '输入 K 搜索'
    ],
    [
      '重新进入区域自身是整段写入过的合并区域，插入链接后不能再合并',
      '<span class="hint" id="t">Edit <b>file</b></span>',
      () => $('#t').append(element('a', 'Copy')),
      '编辑文件',
      '编辑 文件复制'
    ]
  ])('%s：这一批处理完即与全新翻译相同', (_, content, change, before, shown) => {
    const t = start(region(content), JUDGED)
    expect(text('#t')).toBe(before)
    change()
    restore()
    // 只处理这一批：引擎还原文字引起的下一批变动不参与
    t.flush()
    expect(text('#t')).toBe(shown)
    t.stop()
    t.start()
    expect(text('#t')).toBe(shown)
  })
})
