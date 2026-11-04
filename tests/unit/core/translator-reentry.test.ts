// @vitest-environment-options { "url": "https://github.com/vuejs/core/pull/1" }
import { afterEach, describe, expect, it, vi } from 'vitest'
import { REENTRY_CONTAINER_CLASS, REENTRY_SELECTORS } from '../../../src/core/ignore'
import type { Matcher } from '../../../src/core/matcher'
import { createTranslator, type Translator, type TranslatorOptions } from '../../../src/core/translator'
import type { LocaleBundle } from '../../../src/core/types'
import { $, settle, TEST_BUNDLE, testMatcher } from './helpers'

const HOME = '/vuejs/core/pull/1'

const BUNDLE: LocaleBundle = [
  ...TEST_BUNDLE,
  [
    'common',
    {
      static: {
        'Suggested change': '建议的更改',
        'Commit suggestion': '提交建议',
        'Add suggestion to batch': '将建议加入批次'
      }
    }
  ]
]

/** 评论正文中的建议块：标题栏、代码表格、按钮区 */
const SUGGESTION = `
  <div class="comment-body markdown-body js-comment-body">
    <p id="user">Issues</p>
    <div class="my-2 border rounded-2 js-suggested-changes-blob diff-view" id="blob">
      <div class="d-flex flex-items-center px-2 py-1" id="header">
        <span class="text-small" id="label">Suggested change</span>
        <a class="user-mention" href="/octocat" id="mention">Settings</a>
      </div>
      <div class="blob-wrapper data file" id="wrapper">
        <table><tbody><tr>
          <td class="blob-num blob-num-addition" data-line-number="1"></td>
          <td class="blob-code-inner blob-code-addition js-blob-code-addition" id="code">Issues</td>
        </tr></tbody></table>
        <span id="wrapper-text">Issues</span>
      </div>
      <div class="js-apply-changes" id="apply"></div>
    </div>
  </div>`

let translator: Translator | undefined

function start(html: string, matcher: Matcher = testMatcher(undefined, BUNDLE), options: Partial<TranslatorOptions> = {}): Translator {
  document.body.innerHTML = html
  translator = createTranslator({ matcher, host: window, collectUntranslated: true, ...options })
  translator.start()
  return translator
}

/** 记录查找重新进入区域时调用过的元素（getElementsByClassName / querySelectorAll 的 this） */
function spySearches(): () => Element[] {
  const byClass = vi.spyOn(Element.prototype, 'getElementsByClassName')
  const bySelector = vi.spyOn(Element.prototype, 'querySelectorAll')
  return () => [...byClass.mock.contexts, ...bySelector.mock.contexts] as Element[]
}

/** 查找范围与 region 互不包含：既没有进入 region，也没有从其祖先整树扫描 */
function expectNotSearched(searched: readonly Element[], region: Element): void {
  for (const element of searched) expect(element.contains(region) || region.contains(element)).toBe(false)
}

/** 选择器在括号、方括号之外有无组合符或逗号（即不止一个复合选择器） */
function hasTopLevelCombinator(selector: string): boolean {
  let depth = 0
  for (const char of selector) {
    if (char === '(' || char === '[') depth++
    else if (char === ')' || char === ']') depth--
    else if (depth === 0 && /[\s>+~,]/.test(char)) return true
  }
  return false
}

/** 记录每条原文的查询次数 */
function countingMatcher(): { matcher: Matcher; calls: Map<string, number> } {
  const inner = testMatcher(undefined, BUNDLE)
  const calls = new Map<string, number>()
  const matcher: Matcher = {
    ...inner,
    translateRaw(raw, pages) {
      calls.set(raw.trim(), (calls.get(raw.trim()) ?? 0) + 1)
      return inner.translateRaw(raw, pages)
    }
  }
  return { matcher, calls }
}

/** 用户内容与代码保持原文 */
function expectUserContentKept(): void {
  expect($('#user').textContent).toBe('Issues')
  expect($('#code').textContent).toBe('Issues')
  expect($('#wrapper-text').textContent).toBe('Issues')
  expect($('#mention').textContent).toBe('Settings')
}

/** 嵌套建议块：外层标题栏内有正文（其中再有建议块），以及不隔忽略区域的建议块 */
const NESTED = `<div class="js-suggested-changes-blob"><div id="outer">
  <span id="outer-label">Suggested change</span>
  <div class="markdown-body"><p id="inner-user">Close</p><div class="js-suggested-changes-blob">
    <div><span id="inner-label">Add suggestion to batch</span></div>
  </div></div>
  <div class="js-suggested-changes-blob"><div><span id="direct-label">Commit suggestion</span></div></div>
</div></div>`

/** 各层标题栏翻译、正文保持原文；每段文字只查询一次 */
function expectNested(calls: ReadonlyMap<string, number>): void {
  expect($('#outer-label').textContent).toBe('建议的更改')
  expect($('#inner-label').textContent).toBe('将建议加入批次')
  expect($('#direct-label').textContent).toBe('提交建议')
  expect($('#inner-user').textContent).toBe('Close')
  // 不隔忽略区域的嵌套建议块已随外层遍历，不再单独遍历
  expect([calls.get('Suggested change'), calls.get('Add suggestion to batch'), calls.get('Commit suggestion')]).toEqual([1, 1, 1])
}

afterEach(() => {
  vi.restoreAllMocks()
  translator?.stop()
  translator = undefined
  document.body.innerHTML = ''
  history.replaceState(null, '', HOME)
})

describe('REENTRY_SELECTORS', () => {
  it('全部是合法选择器', () => {
    expect(REENTRY_SELECTORS.length).toBeGreaterThan(0)
    for (const selector of REENTRY_SELECTORS) expect(() => document.querySelector(selector), selector).not.toThrow()
  })

  it('目标都是容器类的直接子元素（引擎按类名查找容器，只检查其直接子元素）', () => {
    // 自检：后代、相邻、并列形式都算；括号、方括号内的不算
    expect(['.a .b', '.a > .b', '.a + .b', '.a ~ .b', '.a, .b', ':not(.a .b)', '[title="a b"]'].map(hasTopLevelCombinator)).toEqual([
      true,
      true,
      true,
      true,
      true,
      false,
      false
    ])
    const prefix = `.${REENTRY_CONTAINER_CLASS} > `
    for (const selector of REENTRY_SELECTORS) {
      expect(selector.startsWith(prefix), selector).toBe(true)
      const target = selector.slice(prefix.length)
      // 去掉前缀后只剩一个复合选择器：`.js-suggested-changes-blob > .blob-wrapper .x` 这类后代形式引擎不会处理
      expect(target, selector).not.toBe('')
      expect(hasTopLevelCombinator(target), selector).toBe(false)
    }
  })
})

describe('忽略区域内的重新进入区域', () => {
  it('初次遍历：建议块标题栏翻译；正文、代码格、代码表格、嵌套的忽略规则保持原文', () => {
    start(SUGGESTION)
    expect($('#label').textContent).toBe('建议的更改')
    expectUserContentKept()
  })

  it('React 门户向按钮区插入按钮', async () => {
    start(SUGGESTION)
    $('#apply').innerHTML = '<button type="button" aria-label="Add suggestion to batch">Commit suggestion</button>'
    await settle()
    expect($('#apply button').textContent).toBe('提交建议')
    expect($('#apply button').getAttribute('aria-label')).toBe('将建议加入批次')
    expectUserContentKept()
  })

  it('经典视图用模板克隆替换按钮区（插入的是建议块的直接子元素）', async () => {
    start(SUGGESTION)
    const template = document.createElement('template')
    template.innerHTML = '<div class="d-flex" id="form"><button>Commit suggestion</button></div><span id="tip">Cancel</span>'
    $('#apply').replaceWith(template.content.cloneNode(true))
    await settle()
    expect($('#form button').textContent).toBe('提交建议')
    expect($('#tip').textContent).toBe('取消')
  })

  it('正文整体替换（innerHTML）：插入的建议块照常翻译，用户内容与代码不动', async () => {
    start('<div class="comment-body markdown-body js-comment-body"><p>Close</p></div>')
    $('.comment-body').outerHTML = SUGGESTION
    await settle()
    expect($('#label').textContent).toBe('建议的更改')
    expectUserContentKept()
    $('.comment-body').innerHTML = SUGGESTION
    await settle()
    expect($('#label').textContent).toBe('建议的更改')
    expectUserContentKept()
  })

  it('分块插入：先插入空建议块，再插入标题栏', async () => {
    start('<div class="comment-body markdown-body js-comment-body"></div>')
    $('.comment-body').innerHTML = '<div class="js-suggested-changes-blob"></div>'
    await settle()
    $('.js-suggested-changes-blob').innerHTML = '<div><span id="label">Suggested change</span></div>'
    await settle()
    expect($('#label').textContent).toBe('建议的更改')
  })

  it('正文 innerHTML 改为段落与建议块（建议块自身是变动根节点）：标题栏照常翻译、正文保持原文，每段文字只查询一次', async () => {
    const { matcher, calls } = countingMatcher()
    start('<div class="comment-body markdown-body js-comment-body"><p>Close</p></div>', matcher)
    $('.comment-body').innerHTML =
      '<p id="user">Close</p><div class="js-suggested-changes-blob"><div><span id="label">Suggested change</span></div></div>'
    await settle()
    expect($('#label').textContent).toBe('建议的更改')
    expect($('#user').textContent).toBe('Close')
    expect(calls.get('Suggested change')).toBe(1)
    expect(calls.has('Close')).toBe(false)
  })

  it('React 把按钮文字改回英文、改写属性：照常重译', async () => {
    start(SUGGESTION)
    $('#apply').innerHTML = '<button type="button">Commit suggestion</button>'
    await settle()
    const button = $('#apply button')
    ;(button.firstChild as Text).data = 'Add suggestion to batch'
    button.setAttribute('title', 'Cancel')
    $('#header').setAttribute('aria-label', 'Close')
    await settle()
    expect(button.textContent).toBe('将建议加入批次')
    expect(button.getAttribute('title')).toBe('取消')
    expect($('#header').getAttribute('aria-label')).toBe('关闭')
  })

  it('代码表格、建议块自身的直接文本、正文中新增的文字不翻译', async () => {
    start(SUGGESTION)
    $('#wrapper').insertAdjacentHTML('beforeend', '<span id="later">Close</span>')
    $('#blob').append('Close')
    $('#user').textContent = 'Cancel'
    $('#blob').setAttribute('aria-label', 'Close')
    await settle()
    expect($('#later').textContent).toBe('Close')
    expect($('#blob').lastChild!.textContent).toBe('Close')
    expect($('#user').textContent).toBe('Cancel')
    expect($('#blob').getAttribute('aria-label')).toBe('Close')
    expect($('#code').textContent).toBe('Issues')
    expect($('#wrapper-text').textContent).toBe('Issues')
  })

  it('显式退出标记、跳过标签内不重新进入', async () => {
    start(`<div translate="no">${SUGGESTION}</div><pre><div class="js-suggested-changes-blob"><span id="in-pre">Close</span></div></pre>`)
    expect($('#label').textContent).toBe('Suggested change')
    expect($('#in-pre').textContent).toBe('Close')
    $('#apply').innerHTML = '<button>Commit suggestion</button>'
    await settle()
    expect($('#apply button').textContent).toBe('Commit suggestion')
  })

  it.each([
    ['显式退出标记', '<div translate="no">', '</div>'],
    ['跳过标签', '<pre>', '</pre>'],
    ['纯代码容器', '<div class="react-code-lines">', '</div>']
  ])('正文内%s中的建议块不重新进入：首轮、插入直接子元素后都保持原文', async (_, open, close) => {
    start(`<div class="comment-body markdown-body">${open}<div class="js-suggested-changes-blob" id="blob">
      <div><span id="label">Suggested change</span></div>
    </div>${close}</div>`)
    expect($('#label').textContent).toBe('Suggested change')
    $('#blob').insertAdjacentHTML('beforeend', '<div id="form"><button>Commit suggestion</button></div>')
    await settle()
    expect($('#form button').textContent).toBe('Commit suggestion')
  })

  it('重新进入区域内的嵌套忽略区域里再有建议块，照样翻译；每段文字只处理一次', () => {
    const { matcher, calls } = countingMatcher()
    start(`<div class="comment-body">${NESTED}</div>`, matcher)
    expectNested(calls)
  })

  it('建议块的直接子元素自身命中忽略规则时仍跳过', async () => {
    start(`<div class="comment-body"><div class="js-suggested-changes-blob">
      <div class="notranslate" id="exit"><span id="exit-label">Close</span></div>
      <div class="markdown-title" id="soft"><span id="soft-label">Close</span></div>
    </div></div>`)
    expect($('#exit-label').textContent).toBe('Close')
    expect($('#soft-label').textContent).toBe('Close')
    ;($('#exit-label').firstChild as Text).data = 'Cancel'
    ;($('#soft-label').firstChild as Text).data = 'Cancel'
    $('#soft').setAttribute('title', 'Close')
    $('#soft-label').setAttribute('title', 'Close')
    await settle()
    expect($('#exit-label').textContent).toBe('Cancel')
    expect($('#soft-label').textContent).toBe('Cancel')
    expect($('#soft').getAttribute('title')).toBe('Close')
    expect($('#soft-label').getAttribute('title')).toBe('Close')
  })

  it('页面类型变化重译、更换匹配器后保持；停止后全部还原', () => {
    const t = start(SUGGESTION)
    history.replaceState(null, '', '/vuejs/core/issues')
    expect(t.checkLocation()).toBe(true)
    expect($('#label').textContent).toBe('建议的更改')
    t.setMatcher(testMatcher(undefined, BUNDLE))
    expect($('#label').textContent).toBe('建议的更改')
    t.stop()
    expect($('#label').textContent).toBe('Suggested change')
    expectUserContentKept()
  })

  it('建议块内未命中的文字记为未翻译，计入已翻译数', () => {
    const t = start(SUGGESTION.replace('Suggested change', 'Suggestion header'))
    expect(t.drainUntranslated().map(([text]) => text)).toContain('Suggestion header')
    const before = t.translatedCount()
    t.stop()
    const plain = start(SUGGESTION)
    expect(plain.translatedCount()).toBe(before + 1)
  })
})

describe('查找范围', () => {
  const codeRows = (count: number): string =>
    Array.from({ length: count }, () => '<div class="react-file-line"><span>Issues</span></div>').join('')

  it('首轮只在可能含建议块的忽略区域里查找：纯代码容器、跳过标签内不查', () => {
    document.body.innerHTML = `<a class="author" href="/octocat">octocat</a>
      <div class="react-code-lines" id="lines">${codeRows(20)}</div>
      <pre id="pre"><div class="js-suggested-changes-blob"><span id="in-pre">Close</span></div></pre>${SUGGESTION}`
    const searched = spySearches()
    translator = createTranslator({ matcher: testMatcher(undefined, BUNDLE), host: window })
    translator.start()
    expect($('#label').textContent).toBe('建议的更改')
    expect($('#in-pre').textContent).toBe('Close')
    expect(searched().length).toBeGreaterThan(0)
    expectNotSearched(searched(), $('#lines'))
    expectNotSearched(searched(), $('#pre'))
  })

  it.each([
    ['纯代码容器', '<div class="react-code-lines" id="lines"></div>'],
    ['显式退出标记', '<div translate="no" id="lines"></div>'],
    ['跳过标签', '<pre id="lines"></pre>']
  ])('向%s内插入大量行：不查找，同一父元素只判断一次', (_, container) => {
    const rows = 50
    const t = start(`${container}${SUGGESTION}`)
    const lines = $('#lines')
    // 行自身不是纯代码容器：不查找只靠变动根节点按父元素的判断
    for (let i = 0; i < rows; i++) lines.insertAdjacentHTML('beforeend', '<div><span>Issues</span></div>')
    const searched = spySearches()
    const closest = vi.spyOn(Element.prototype, 'closest')
    t.flush()
    expect(searched()).toEqual([])
    expect(closest.mock.calls.length).toBeLessThan(rows)
    expect(lines.lastElementChild!.textContent).toBe('Issues')
  })

  it('经典差异视图（差异表格外有 .highlight 包装）的行内评审线程：首轮、门户插入按钮、改回英文、插入新线程行', async () => {
    const thread = (id: string): string =>
      `<tr class="inline-comments"><td class="line-comments"><div class="comment-body markdown-body">
        <p class="user">Close</p>
        <div class="js-suggested-changes-blob">
          <div><span id="${id}">Suggested change</span></div>
          <div class="blob-wrapper"><table><tbody><tr>
            <td class="blob-code-inner blob-code-addition">Issues</td>
          </tr></tbody></table></div>
          <div class="js-apply-changes" id="${id}-apply"></div>
        </div>
      </div></td></tr>`
    /** 用户内容与代码保持原文 */
    const expectKept = (): void => {
      for (const element of document.querySelectorAll('.user')) expect(element.textContent).toBe('Close')
      for (const element of document.querySelectorAll('.blob-code-inner')) expect(element.textContent).toBe('Issues')
    }
    start(`<div class="file"><div class="js-file-content"><div class="data highlight js-blob-wrapper">
      <deferred-diff-lines><table class="diff-table js-diff-table"><tbody id="diff">
        <tr><td class="blob-num"></td><td class="blob-code blob-code-inner">Issues</td></tr>${thread('first')}
      </tbody></table></deferred-diff-lines>
    </div></div></div>`)
    expect($('#first').textContent).toBe('建议的更改')
    expectKept()

    $('#first-apply').innerHTML = '<button type="button" aria-label="Add suggestion to batch">Commit suggestion</button>'
    await settle()
    const button = $('#first-apply button')
    expect(button.textContent).toBe('提交建议')
    expect(button.getAttribute('aria-label')).toBe('将建议加入批次')

    ;(button.firstChild as Text).data = 'Commit suggestion'
    button.setAttribute('title', 'Cancel')
    await settle()
    expect(button.textContent).toBe('提交建议')
    expect(button.getAttribute('title')).toBe('取消')

    $('#diff').insertAdjacentHTML('beforeend', thread('second'))
    await settle()
    expect($('#second').textContent).toBe('建议的更改')
    expectKept()
  })

  it('插入跳过区域的嵌套建议块：各层标题栏翻译，每段文字只处理一次', async () => {
    const { matcher, calls } = countingMatcher()
    start('<div class="comment-body"><p>Close</p></div>', matcher)
    $('.comment-body').innerHTML = `<div>${NESTED}</div>`
    await settle()
    expectNested(calls)
  })
})

describe('重新进入区域内的时间元素', () => {
  const time = (id: string): string => `<relative-time id="${id}" datetime="2026-01-01T00:00:00Z">Jan 1</relative-time>`
  /** 建议块的直接子元素是时间元素；对照：代码表格内、正文中的时间元素 */
  const TIMES = `<div class="comment-body"><p>${time('body-time')}</p><div class="js-suggested-changes-blob">
    ${time('time')}<div class="blob-wrapper">${time('wrapper-time')}</div></div></div>`

  function expectTimeSet(): void {
    expect($('#time').getAttribute('lang')).toBe('zh-CN')
    expect($('#time').getAttribute('prefix')).toBe('')
  }

  function expectTimeRestored(selector = '#time'): void {
    expect($(selector).hasAttribute('lang'), selector).toBe(false)
    expect($(selector).hasAttribute('prefix'), selector).toBe(false)
  }

  it('以关闭状态启动，开启后设置 lang、前缀置空', async () => {
    const t = start(TIMES, undefined, { translateTime: false })
    expectTimeRestored()
    t.setFeatures({ translateTime: true })
    await settle()
    expectTimeSet()
  })

  it('开 → 关 → 开后重新设置；停止后还原', async () => {
    const t = start(TIMES)
    expectTimeSet()
    t.setFeatures({ translateTime: false })
    await settle()
    expectTimeRestored()
    t.setFeatures({ translateTime: true })
    await settle()
    expectTimeSet()
    t.stop()
    expectTimeRestored()
  })

  it('对照：代码表格内、正文中的时间元素切换后仍不处理', async () => {
    const t = start(TIMES)
    t.setFeatures({ translateTime: false })
    await settle()
    t.setFeatures({ translateTime: true })
    await settle()
    expectTimeRestored('#wrapper-time')
    expectTimeRestored('#body-time')
  })
})
