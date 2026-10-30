// @vitest-environment-options { "url": "https://github.com/vuejs/core/issues" }
import { afterEach, describe, expect, it } from 'vitest'
import { createTranslator, type Translator, type TranslatorOptions } from '../../../src/core/translator'
import type { LocaleBundle, PageDictionary, PageKey } from '../../../src/core/types'
import { mergeDictionaries } from '../../../src/locales/zh-CN/helpers'
import { $, settle, TEST_BUNDLE, testMatcher } from './helpers'

const ENTRY_TYPES: Readonly<Record<string, string>> = { Directory: '目录', File: '文件' }

const BUNDLE: LocaleBundle = [
  ...TEST_BUNDLE,
  [
    'common',
    { static: { 'View progress': '查看进度', Documentation: '文档', 'Loading...': '正在加载...', Copy: '复制' } },
  ],
  [
    'issues',
    {
      attributeRules: [
        ['[invalid', 'title', /^(.+)$/, '不应生效'],
        ['[class*="titleOptionsContainer__"] a', 'aria-label', /^View (.+)$/, (_, title: string) => `查看 ${title}`],
        ['.sample-filters input', 'value', /^Sample (.+)$/, '示例 $1'],
      ],
      ignore: ['ul[role="group"]:not(:has([data-loading]))', '[aria-label$=" (user)"]'],
    },
  ],
  [
    'repository',
    {
      attributeRules: [
        [
          '.react-directory-filename-cell a',
          'aria-label',
          /^(.+), \((Directory|File)\)$/,
          (_, name: string, type: string) => `${name}（${ENTRY_TYPES[type] ?? type}）`,
        ],
        ['.react-directory-filename-cell a', 'title', /^(.+)$/, '$1'],
      ],
    },
  ],
]

const ISSUES: readonly PageKey[] = ['common', 'repository', 'issues']
const PULLS: readonly PageKey[] = ['common', 'repository', 'pulls']

let translator: Translator | undefined

function start(html: string, pages: readonly PageKey[] = ISSUES, options: Partial<TranslatorOptions> = {}): Translator {
  document.body.innerHTML = html
  translator = createTranslator({
    matcher: testMatcher(undefined, BUNDLE),
    host: window,
    collectUntranslated: true,
    resolvePages: () => pages,
    ...options,
  })
  translator.start()
  return translator
}

const label = (selector: string): string | null => $(selector).getAttribute('aria-label')

/** 记录元素自身的属性变动，返回取出已变动属性名的函数 */
function watchAttributes(element: Element): () => string[] {
  const names: string[] = []
  const collect = (records: MutationRecord[]): void => {
    names.push(...records.flatMap((record) => record.attributeName ?? []))
  }
  const observer = new MutationObserver(collect)
  observer.observe(element, { attributes: true })
  return () => {
    collect(observer.takeRecords())
    observer.disconnect()
    return names
  }
}

afterEach(() => {
  translator?.stop()
  translator = undefined
  document.body.innerHTML = ''
})

describe('属性规则', () => {
  const PINNED = `<div class="titleOptionsContainer__x"><a id="pin" aria-label="View progress" href="/o/r/issues/1">
    <span data-component="Text">progress</span></a></div><button id="other" aria-label="View progress"></button>`

  it('选择器命中的元素按规则改写，不查词典、不记未翻译；选择器外照常查词典', () => {
    const t = start(PINNED)
    expect(label('#pin')).toBe('查看 progress')
    expect($('#pin span').textContent).toBe('progress')
    expect(label('#other')).toBe('查看进度')
    expect(t.drainUntranslated().map(([text]) => text)).not.toContain('View progress')
  })

  it('只在所属页面类型生效', () => {
    start(PINNED, PULLS)
    expect(label('#pin')).toBe('查看进度')
  })

  it('页面改写属性后按规则重写；停止后还原', async () => {
    const t = start(PINNED)
    $('#pin').setAttribute('aria-label', 'View Sample title')
    await settle()
    expect(label('#pin')).toBe('查看 Sample title')
    t.stop()
    translator = undefined
    expect(label('#pin')).toBe('View Sample title')
  })

  it('选择器不合法的规则丢弃，其余照常', () => {
    start(`${PINNED}<span id="t" title="Copy"></span>`)
    expect($('#t').getAttribute('title')).toBe('复制')
    expect(label('#pin')).toBe('查看 progress')
  })
})

describe('value 属性规则', () => {
  const FILTERS = `<div class="sample-filters">
    <input id="d" type="text" value="Sample text" disabled>
    <input id="e" type="text" value="Sample text">
    <input id="c" type="text" value="Copy" disabled>
    <input id="b" type="submit" value="Sample text">
    <button id="btn" value="Sample text" disabled>Sample</button>
  </div><input id="o" type="text" value="Sample text" disabled>`

  const value = (selector: string): string | null => $(selector).getAttribute('value')

  it('改写带 disabled 属性的 input 与按钮 input；未命中时不查词典、不记未翻译', () => {
    const t = start(FILTERS)
    expect(value('#d')).toBe('示例 text')
    expect(value('#b')).toBe('示例 text')
    expect(value('#e')).toBe('Sample text')
    expect(value('#c')).toBe('Copy')
    expect(value('#btn')).toBe('Sample text')
    expect(value('#o')).toBe('Sample text')
    const missed = t.drainUntranslated().map(([text]) => text)
    expect(missed).not.toContain('Copy')
    expect(missed).not.toContain('Sample text')
  })

  it('只在所属页面类型生效', () => {
    start(FILTERS, PULLS)
    expect(value('#d')).toBe('Sample text')
  })

  it('去掉 disabled 后还原原文、重新禁用后再改写；页面改写 value 后按规则重写；停止后还原', async () => {
    const t = start(FILTERS)
    $('#d').removeAttribute('disabled')
    await settle()
    expect(value('#d')).toBe('Sample text')
    $('#d').setAttribute('disabled', '')
    await settle()
    expect(value('#d')).toBe('示例 text')
    $('#d').setAttribute('value', 'Sample title')
    await settle()
    expect(value('#d')).toBe('示例 title')
    t.stop()
    translator = undefined
    expect(value('#d')).toBe('Sample title')
  })

  it('插入的禁用输入框按规则改写', async () => {
    start('<div class="sample-filters"></div>')
    $('.sample-filters').insertAdjacentHTML('beforeend', '<input id="n" type="text" value="Sample text" disabled>')
    await settle()
    expect(value('#n')).toBe('示例 text')
  })

  it('切换到没有 value 规则的页面类型：还原原文；切回后再改写', () => {
    const t = start(FILTERS, ISSUES, {
      resolvePages: (location) => (location.pathname.endsWith('/pulls') ? PULLS : ISSUES),
    })
    history.pushState(null, '', '/vuejs/core/pulls')
    t.checkLocation()
    expect(value('#d')).toBe('Sample text')
    history.pushState(null, '', '/vuejs/core/issues')
    t.checkLocation()
    expect(value('#d')).toBe('示例 text')
  })
})

describe('子词典经 mergeDictionaries 合并的属性规则', () => {
  /** 没有属性规则的子词典 */
  const LIST: PageDictionary = { static: { 'Sample text': '示例文字' } }
  /** 带属性规则的子词典 */
  const CARD: PageDictionary = { attributeRules: [['.sample-card > a', 'aria-label', /^View (.+)$/, '查看 $1']] }
  /** 与 CARD 命中同一元素、同一属性 */
  const CARD_ALT: PageDictionary = { attributeRules: [['.sample-card a', 'aria-label', /^View (.+)$/, '打开 $1']] }
  const CARD_HTML = `<div class="sample-card"><a id="card" aria-label="View Sample title"
    href="/vuejs/core/issues/1">Sample text</a></div>`

  /** 合并结果作为 issues 词典 */
  function merged(...dicts: readonly PageDictionary[]): Partial<TranslatorOptions> {
    return { matcher: testMatcher(undefined, [...TEST_BUNDLE, ['issues', mergeDictionaries(...dicts)]]) }
  }

  it('在所属页面生效：按规则改写属性，不记未翻译', () => {
    const t = start(CARD_HTML, ISSUES, merged(LIST, CARD))
    expect(label('#card')).toBe('查看 Sample title')
    expect($('#card').textContent).toBe('示例文字')
    expect(t.drainUntranslated().map(([text]) => text)).not.toContain('View Sample title')
  })

  it('依次拼接：先出现的子词典优先', () => {
    start(CARD_HTML, ISSUES, merged(CARD_ALT, LIST, CARD))
    expect(label('#card')).toBe('打开 Sample title')
  })
})

describe('忽略区域的根元素按属性规则改写', () => {
  const FILE = `<div class="react-directory-filename-cell"><a id="f" title="Documentation"
    aria-label="Documentation, (Directory)" href="/o/r/tree/main/Documentation">Documentation</a></div>`

  it('只改规则列出的属性：恒等规则保持原文，文字不译、不记未翻译', () => {
    const t = start(FILE)
    expect(label('#f')).toBe('Documentation（目录）')
    expect($('#f').getAttribute('title')).toBe('Documentation')
    expect($('#f').textContent).toBe('Documentation')
    expect(t.drainUntranslated()).toEqual([])
  })

  it('没有命中的规则：保持原文', () => {
    start(FILE.replace('Documentation, (Directory)', 'Documentation'))
    expect(label('#f')).toBe('Documentation')
  })

  it('页面改写属性后按规则重写；子节点变化不还原规则写入的属性；停止后还原', async () => {
    const t = start(FILE)
    $('#f').setAttribute('aria-label', 'README.md, (File)')
    await settle()
    expect(label('#f')).toBe('README.md（文件）')
    $('#f').append(' ')
    await settle()
    expect(label('#f')).toBe('README.md（文件）')
    t.stop()
    translator = undefined
    expect(label('#f')).toBe('README.md, (File)')
  })

  it('子节点变化时不重写规则写入的属性', async () => {
    start(FILE)
    const changes = watchAttributes($('#f'))
    $('#f').append(' ')
    await settle()
    expect(changes()).toEqual([])
    expect(label('#f')).toBe('Documentation（目录）')
  })

  it('忽略区域内的元素不按规则改写', () => {
    start(`<div class="markdown-body">${FILE}</div>`)
    expect(label('#f')).toBe('Documentation, (Directory)')
  })
})

describe('先翻译、后变为忽略的元素', () => {
  it('子节点变化使忽略规则命中（:has()）：还原已译的属性与文字', async () => {
    const t = start(`<ul id="g" role="group" aria-label="Documentation"><li data-loading="true">Loading...</li></ul>`)
    expect(label('#g')).toBe('文档')
    expect($('#g li').textContent).toBe('正在加载...')
    $('#g').replaceChildren(Object.assign(document.createElement('li'), { textContent: 'Documentation' }))
    await settle()
    expect(label('#g')).toBe('Documentation')
    expect($('#g li').textContent).toBe('Documentation')
    t.stop()
    translator = undefined
    expect(label('#g')).toBe('Documentation')
  })

  it('属性变化使忽略规则命中：还原其余已译的属性', async () => {
    start('<span id="u" title="Copy" placeholder="Copy" aria-label="x"></span>')
    expect($('#u').getAttribute('title')).toBe('复制')
    expect($('#u').getAttribute('placeholder')).toBe('复制')
    $('#u').setAttribute('aria-label', 'octocat (user)')
    await settle()
    expect($('#u').getAttribute('title')).toBe('Copy')
    expect($('#u').getAttribute('placeholder')).toBe('Copy')
  })

  it('还原后区域内的重新进入区域在同一轮照常翻译', async () => {
    const t = start(`<div id="u" title="Copy" aria-label="x"><div class="js-suggested-changes-blob">
      <div><button id="copy" aria-label="Copy">Copy</button></div>
      <div class="blob-wrapper"><span id="code">Copy</span></div></div></div>`)
    expect($('#code').textContent).toBe('复制')
    $('#u').setAttribute('aria-label', 'octocat (user)')
    t.flush()
    expect($('#u').getAttribute('title')).toBe('Copy')
    expect($('#code').textContent).toBe('Copy')
    expect(label('#copy')).toBe('复制')
    expect($('#copy').textContent).toBe('复制')
    await settle()
    expect(label('#copy')).toBe('复制')
    expect($('#code').textContent).toBe('Copy')
  })

  it('忽略区域内重新进入区域里的元素：子节点变化不还原', async () => {
    start(`<div class="comment-body"><div class="js-suggested-changes-blob">
      <div><button id="copy" aria-label="Copy">Copy</button></div>
      <div class="blob-wrapper"><span id="code">Copy</span></div></div></div>`)
    expect(label('#copy')).toBe('复制')
    const changes = watchAttributes($('#copy'))
    $('#copy').append(' ')
    await settle()
    expect(changes()).toEqual([])
    expect(label('#copy')).toBe('复制')
    expect($('#code').textContent).toBe('Copy')
  })

  it('忽略区域内本来就不翻译的元素：子节点变化不受影响', async () => {
    start('<div class="markdown-body"><p id="p" title="Copy">Issues</p></div>')
    $('#p').append(' more')
    await settle()
    expect($('#p').getAttribute('title')).toBe('Copy')
    expect($('#p').textContent).toBe('Issues more')
  })
})
