// @vitest-environment-options { "url": "https://github.com/vuejs/core/issues/1" }
import { afterEach, describe, expect, it } from 'vitest'
import { FIGHT_LIMIT, FIGHT_WINDOW_MS } from '../../../src/core/records'
import {
  createTranslator,
  type Translator,
  type TranslatorHost,
  type TranslatorOptions,
} from '../../../src/core/translator'
import type { LocaleBundle, PageKey } from '../../../src/core/types'
import { $, settle, TEST_BUNDLE, testMatcher, texts } from './helpers'

const MONTHS: Readonly<Record<string, string>> = { October: '10', November: '11' }

const BASE: LocaleBundle = [
  ...TEST_BUNDLE,
  [
    'common',
    {
      static: {
        remaining: '剩余',
        items: '项',
        October: '十月',
        'Tip:': '提示：',
        'Press K to search': '按 K 搜索',
        'Tip: Press K to search': '提示：按 K 搜索',
      },
      regexp: [
        [/^(\d[\d,]*) remaining items?$/, '还有 $1 项'],
        [/^(October|November) (\d{4})$/, (_, month: string, year: string) => `${year} 年 ${MONTHS[month]} 月`],
      ],
      inline: [['{} starred {}', '{} 星标了 {}']],
      mergeText: ['h3 > span[data-sr-feedback]', '[class*="shortcutHint__"]'],
    },
  ],
  ['issues', { mergeText: ['[class*="remainingItemsHeading__"]'] }],
]

/** 整段规则：「Updated 3 days ago by octocat」整段命中；其中的「Updated 3 days ago」另由 TEST_BUNDLE 的正则命中 */
const WHOLE: LocaleBundle = [['common', { regexp: [[/^Updated (\d+) days? ago by ([\w-]+)$/, '$1 天前由 $2 更新']] }]]

const BUNDLE: LocaleBundle = [...BASE, ...WHOLE]

/** 另收「Sample text」：区域根的直接文字单独命中（不放进 BUNDLE，其余用例的「Sample」「text」按未收录处理） */
const SAMPLE_TEXT: LocaleBundle = [...BUNDLE, ['common', { static: { 'Sample text': '示例文本' } }]]

const ISSUES: readonly PageKey[] = ['common', 'repository', 'issues']
const PULLS: readonly PageKey[] = ['common', 'repository', 'pulls']
const ISSUE_PATH = '/vuejs/core/issues/1'
const PULL_PATH = '/vuejs/core/pull/1'
const REMAINING = `<h3 class="remainingItemsHeading__x" id="h"><span data-testid="count">12</span><span> remaining <span>items</span></span></h3>`
/** 嵌套的合并区域：计数元素是内层区域 */
const NESTED = REMAINING.replace('data-testid="count"', 'data-sr-feedback')
/** 整段未命中，其中的文本组（中间隔注释）命中 */
const UPDATED = '<span>Updated <!-- -->3<!-- --> days ago</span> <em>by octocat and hubot</em>'

/** 可改的地址：checkLocation 按 href 判断是否导航 */
const loc = { href: '', pathname: '', hostname: 'github.com' }
function go(path: string): void {
  loc.pathname = path
  loc.href = `https://github.com${path}`
}

/** 可调时钟：互相覆盖的统计窗口按它计算，不依赖机器快慢 */
let now = 0
const CLOCK_HOST: TranslatorHost = {
  document,
  location: loc as unknown as Location,
  MutationObserver: window.MutationObserver,
  performance: { now: () => now },
}

let translator: Translator | undefined
const cleanups: (() => void)[] = []

function start(html: string, pages = ISSUES, options: Partial<TranslatorOptions> = {}): Translator {
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

/** 用可调时钟、可改地址开始：页面类型由地址决定 */
function startAt(path: string, html: string): Translator {
  go(path)
  return start(html, ISSUES, {
    host: CLOCK_HOST,
    resolvePages: (location) => (location.pathname.includes('/pull/') ? PULLS : ISSUES),
  })
}

const text = (selector: string): string => $(selector).textContent ?? ''
const misses = (t: Translator): string[] => t.drainUntranslated().map(([source]) => source)

/** issues 页面的合并区域 */
const heading = (id: string, html: string): string => `<h3 class="remainingItemsHeading__x" id="${id}">${html}</h3>`

function element(tag: string, content: string): HTMLElement {
  return Object.assign(document.createElement(tag), { textContent: content })
}

/** 多等几轮：变动回调（含本引擎写入引起的后续回调）全部完成 */
async function settleAll(): Promise<void> {
  for (let i = 0; i < 5; i++) await settle()
}

/** 文档解析中：只有 readyState 为 loading 时才按解析器追加处理 */
function parsing(): void {
  Object.defineProperty(document, 'readyState', { configurable: true, get: () => 'loading' })
  cleanups.push(() => Reflect.deleteProperty(document, 'readyState'))
}

/** 页面脚本：文字一旦不是原文就改回原文，返回被改成的文字（用户看到的闪烁） */
function guardText(node: Text, original: string): string[] {
  const shown: string[] = []
  const guard = new MutationObserver(() => {
    if (node.data === original) return
    shown.push(node.data)
    node.data = original
  })
  guard.observe(node, { characterData: true })
  cleanups.push(() => guard.disconnect())
  return shown
}

/** 页面脚本：属性一旦不是原值就改回原值，返回被改成的值 */
function guardAttribute(element: Element, name: string, original: string): string[] {
  const shown: string[] = []
  const guard = new MutationObserver(() => {
    const current = element.getAttribute(name)
    if (current === original) return
    shown.push(current ?? '')
    element.setAttribute(name, original)
  })
  guard.observe(element, { attributes: true, attributeFilter: [name] })
  cleanups.push(() => guard.disconnect())
  return shown
}

const repeat = (value: string): string[] => Array.from({ length: FIGHT_LIMIT }, () => value)

afterEach(() => {
  for (const cleanup of cleanups.splice(0)) cleanup()
  translator?.stop()
  translator = undefined
  document.body.innerHTML = ''
  now = 0
})

describe('整段合并', () => {
  it('区域内全部文字连成一段匹配：译文写入第一个文本节点，其余置空；不记未翻译', () => {
    const t = start(REMAINING)
    expect(text('#h')).toBe('还有 12 项')
    expect($('#h [data-testid="count"]').textContent).toBe('还有 12 项')
    expect(t.drainUntranslated()).toEqual([])
  })

  it('嵌套元素拆开的月份按一段翻译', () => {
    start('<h3><span data-sr-feedback id="m">October <span class="color-fg-muted">2026</span></span></h3>')
    expect(text('#m')).toBe('2026 年 10 月')
  })

  it('整段未命中：不写入，照常逐组处理、逐组记未翻译', () => {
    const t = start(
      `${REMAINING.replace('12', 'many').replace('id="h"', 'id="a"')}` +
        '<h3 class="remainingItemsHeading__x" id="b"><span>Sample</span><span> text</span></h3>',
    )
    expect(text('#a')).toBe('many 剩余 项')
    expect(text('#b')).toBe('Sample text')
    expect(t.drainUntranslated().map(([source]) => source)).toEqual(['many', 'Sample', 'text'])
  })

  it('整段未命中：其中的文本组照常整组匹配，与不在合并区域时相同', () => {
    const t = start(`${heading('a', UPDATED)}<h3 id="b">${UPDATED}</h3>`)
    expect(text('#a')).toBe('3天前更新 by octocat and hubot')
    expect(text('#b')).toBe('3天前更新 by octocat and hubot')
    expect(t.drainUntranslated()).toEqual([['by octocat and hubot', 'issues', 1, 2, 1]])
  })

  it('整段未命中：其中的行内句照常处理', () => {
    start(heading('s', '<span><b>octocat</b> starred <b>vuejs/core</b></span>'))
    expect(text('#s')).toBe('octocat 星标了 vuejs/core')
  })

  it('区域内有链接等不能合并的元素：照常逐组处理', () => {
    start(REMAINING.replace('<span>items</span>', '<a href="#items">items</a>'))
    expect(text('#h')).toBe('12 剩余 项')
  })

  it('区域内有时间元素：照常逐组处理，时间元素的文字不改', () => {
    start(
      REMAINING.replace('<span>items</span>', '<relative-time datetime="2026-01-01T00:00:00Z">items</relative-time>'),
    )
    expect(text('#h')).toBe('12 剩余 items')
  })

  it('区域内有忽略区域：照常逐组处理，忽略区域内的文字不改', () => {
    start(REMAINING.replace('<span>items</span>', '<span class="markdown-body">items</span>'))
    expect(text('#h')).toBe('12 剩余 items')
  })

  it('嵌套的合并区域：外层整段命中时只按外层处理', () => {
    start(NESTED)
    expect(text('#h')).toBe('还有 12 项')
  })

  it('嵌套的合并区域：外层整段未命中时内层整段处理', () => {
    start(heading('n', '<span data-sr-feedback>Updated <span>3</span> days ago</span> <em>by octocat and hubot</em>'))
    expect(text('#n')).toBe('3天前更新 by octocat and hubot')
  })

  it('区域内元素的属性照常翻译', () => {
    start(REMAINING.replace('data-testid="count"', 'data-testid="count" title="Copy"'))
    expect($('#h [data-testid="count"]').getAttribute('title')).toBe('复制')
    expect(text('#h')).toBe('还有 12 项')
  })

  it('只在所属页面类型生效；忽略区域内不处理', () => {
    start(`${REMAINING}<div class="markdown-body">${REMAINING.replace('id="h"', 'id="u"')}</div>`, [
      'common',
      'repository',
      'pulls',
    ])
    expect(text('#h')).toBe('12 剩余 项')
    expect(text('#u')).toBe('12 remaining items')
  })

  it.each([
    ['translate="no"', REMAINING.replace('id="h"', 'id="h" translate="no"')],
    ['data-gcn-ignore', REMAINING.replace('id="h"', 'id="h" data-gcn-ignore')],
    ['contenteditable="true"', REMAINING.replace('id="h"', 'id="h" contenteditable="true"')],
    [
      'notranslate 类名',
      REMAINING.replace('class="remainingItemsHeading__x"', 'class="remainingItemsHeading__x notranslate"'),
    ],
  ])('区域根自身带 %s：全量遍历与动态插入都不处理', async (_, html) => {
    start(html).stop()
    expect(text('#h')).toBe('12 remaining items')
    const t = start('<div id="box"></div>')
    $('#box').insertAdjacentHTML('beforeend', html)
    await settle()
    expect(text('#h')).toBe('12 remaining items')
    expect(t.translatedCount()).toBe(0)
    expect(misses(t)).toEqual([])
  })

  it('整段写入过的区域移出后加上退出标记、再插回：还原整段原文', async () => {
    start(`<div id="box">${REMAINING}</div>`)
    const h = $('#h')
    expect(text('#h')).toBe('还有 12 项')
    h.remove()
    await settle()
    h.setAttribute('translate', 'no')
    $('#box').append(h)
    await settle()
    expect(text('#h')).toBe('12 remaining items')
  })

  it('停止后还原', () => {
    const t = start(REMAINING)
    t.stop()
    translator = undefined
    expect(text('#h')).toBe('12 remaining items')
  })
})

describe('整段合并：变动', () => {
  it('其中的文字变化后整段重算', async () => {
    start(REMAINING)
    ;($('#h [data-testid="count"]').firstChild as Text).data = '13'
    await settle()
    expect(text('#h')).toBe('还有 13 项')
    ;($('#h span span').firstChild as Text).data = 'item'
    await settle()
    expect(text('#h')).toBe('还有 13 项')
  })

  it('区域内插入元素后整段重算', async () => {
    start(REMAINING.replace('<span>items</span>', ''))
    expect(text('#h')).toBe('12 剩余 ')
    $('#h span:last-child').append(Object.assign(document.createElement('span'), { textContent: 'items' }))
    await settle()
    expect(text('#h')).toBe('还有 12 项')
  })

  it('区域内插入不能合并的元素后照常逐组处理', async () => {
    start(REMAINING)
    $('#h span:last-child').append(Object.assign(document.createElement('a'), { textContent: 'Issues' }))
    await settle()
    expect(text('#h')).toBe('12 剩余 项议题')
  })

  it.each([
    ['跳过子树的元素', '<code>Issues</code>', '12 剩余 项Issues'],
    ['svg', '<svg><title>x</title></svg>', '12 剩余 项x'],
    ['kbd', '<kbd>K</kbd>', '12 剩余 项K'],
    ['时间元素', '<relative-time datetime="2026-01-01T00:00:00Z">Jan 1</relative-time>', '12 剩余 项Jan 1'],
    ['忽略区域', '<span class="markdown-body">Sample</span>', '12 剩余 项Sample'],
  ])('区域内插入%s（两侧没有文本）后照常逐组处理', async (_, html, shown) => {
    start(REMAINING)
    // 插在区域根末尾：根没有直接文字，不会按行内句宿主补种子
    $('#h').insertAdjacentHTML('beforeend', html)
    await settle()
    expect(text('#h')).toBe(shown)
  })

  it('移除区域内的元素（两侧没有文本）后整段重算', async () => {
    start(REMAINING)
    $('#h [data-testid="count"]').remove()
    await settle()
    expect(text('#h')).toBe(' 剩余 项')
  })

  it('计数被清空（删除其中的文本节点）后整段重算', async () => {
    start(REMAINING)
    $('#h [data-testid="count"]').textContent = ''
    await settle()
    expect(text('#h')).toBe(' 剩余 项')
  })

  it('删掉区域末尾的元素后整段重算', async () => {
    start(heading('h', '<span>12</span><span> remaining </span><span>items</span>'))
    expect(text('#h')).toBe('还有 12 项')
    $('#h span:last-child').remove()
    await settle()
    expect(text('#h')).toBe('12 剩余 ')
  })

  it('删掉区域内唯一不能合并的元素后整段合并', async () => {
    start(REMAINING.replace('</h3>', '<button>x</button></h3>'))
    expect(text('#h')).toBe('12 剩余 项x')
    $('#h button').remove()
    await settle()
    expect(text('#h')).toBe('还有 12 项')
  })

  it('计数起初是占位符，原地改成数字后整段合并', async () => {
    start(REMAINING.replace('>12<', '>…<'))
    expect(text('#h')).toBe('… 剩余 项')
    ;($('#h [data-testid="count"]').firstChild as Text).data = '12'
    await settle()
    expect(text('#h')).toBe('还有 12 项')
  })

  it('计数起初为空，写入数字后整段合并', async () => {
    start(REMAINING.replace('>12<', '><'))
    expect(text('#h')).toBe(' 剩余 项')
    $('#h [data-testid="count"]').textContent = '12'
    await settle()
    expect(text('#h')).toBe('还有 12 项')
  })

  it('忽略区域内的合并区域：子节点增删后仍不处理', async () => {
    start(`<div class="markdown-body">${REMAINING}</div>`)
    $('#h [data-testid="count"]').remove()
    await settle()
    expect(text('#h')).toBe(' remaining items')
  })

  it('忽略区域内的合并区域：移除不含文字的元素后整段能命中，仍不处理', async () => {
    start(`<div class="markdown-body">${REMAINING.replace('</h3>', '<i></i></h3>')}</div>`)
    $('#h i').remove()
    await settle()
    expect(text('#h')).toBe('12 remaining items')
  })

  it('忽略区域内的合并区域：文字改写后仍不处理', async () => {
    start(`<div class="markdown-body">${REMAINING}</div>`)
    ;($('#h [data-testid="count"]').firstChild as Text).data = '13'
    await settle()
    expect(text('#h')).toBe('13 remaining items')
  })

  it('整段写入过、文字变化后整段未命中：照常逐组重算，未翻译只记一次；之后只重算变化的文本组，再命中时整段写入', async () => {
    const t = start(heading('h', UPDATED.replace(' and hubot', '')))
    expect(text('#h')).toBe('3 天前由 octocat 更新')
    const by = $('#h em').firstChild as Text
    by.data = 'by octocat and hubot'
    await settle()
    expect(text('#h')).toBe('3天前更新 by octocat and hubot')
    expect(t.drainUntranslated()).toEqual([['by octocat and hubot', 'issues', 1, 1, 1]])
    ;($('#h span').childNodes[2] as Text).data = '4'
    await settle()
    expect(text('#h')).toBe('4天前更新 by octocat and hubot')
    expect(t.drainUntranslated()).toEqual([])
    by.data = 'by octocat'
    await settle()
    expect(text('#h')).toBe('4 天前由 octocat 更新')
  })

  it('整段写入过、插入元素后整段未命中：照常逐组重算', async () => {
    start(heading('h', UPDATED.replace(' and hubot', '')))
    expect(text('#h')).toBe('3 天前由 octocat 更新')
    $('#h').append(Object.assign(document.createElement('em'), { textContent: ' and hubot' }))
    await settle()
    expect(text('#h')).toBe('3天前更新 by octocat and hubot')
  })

  it('整段写入过、变化后整段未命中：其中的镜像文字属性随文本组的译文同步', async () => {
    const mirror =
      '<span data-component="text" data-content="Updated 3 days ago">Updated <!-- -->3<!-- --> days ago</span>'
    start(heading('h', `${mirror} <em>by octocat</em>`))
    expect(text('#h')).toBe('3 天前由 octocat 更新')
    ;($('#h em').firstChild as Text).data = 'by octocat and hubot'
    await settle()
    expect(text('#h')).toBe('3天前更新 by octocat and hubot')
    expect($('#h span').getAttribute('data-content')).toBe('3天前更新')
  })

  it('嵌套：外层整段写入过、变化后未命中时内层整段处理；内层文字变化后只重算内层', async () => {
    start(heading('n', '<span data-sr-feedback>Updated <span>3</span> days ago</span> <em>by octocat</em>'))
    expect(text('#n')).toBe('3 天前由 octocat 更新')
    ;($('#n em').firstChild as Text).data = 'by octocat and hubot'
    await settle()
    expect(text('#n')).toBe('3天前更新 by octocat and hubot')
    ;($('#n span span').firstChild as Text).data = '4'
    await settle()
    expect(text('#n')).toBe('4天前更新 by octocat and hubot')
  })

  it('嵌套：外层整段命中时改写内层区域里的文字，按外层整段重算', async () => {
    start(NESTED)
    expect(text('#h')).toBe('还有 12 项')
    ;($('#h [data-sr-feedback]').firstChild as Text).data = '13'
    await settle()
    expect(text('#h')).toBe('还有 13 项')
  })

  it('嵌套：外层整段命中时内层区域追加元素，按外层整段重算', async () => {
    start(NESTED)
    $('#h [data-sr-feedback]').append(element('b', '3'))
    await settle()
    expect(text('#h')).toBe('还有 123 项')
  })

  it('嵌套：外层不能合并、内层能合并时，改写内层文字后按内层整段重算', async () => {
    start(heading('o', '<a href="#x">Sample</a> <span data-sr-feedback id="m">October <b>2026</b></span>'))
    expect(text('#m')).toBe('2026 年 10 月')
    ;($('#m b').firstChild as Text).data = '2027'
    await settle()
    expect(text('#m')).toBe('2027 年 10 月')
  })

  it('整段写入过、换用没有整段规则的词条后照常逐组重算', () => {
    const t = start(heading('h', UPDATED.replace(' and hubot', '')))
    expect(text('#h')).toBe('3 天前由 octocat 更新')
    t.setMatcher(testMatcher(undefined, BASE))
    expect(text('#h')).toBe('3天前更新 by octocat')
  })
})

describe('整段合并：区域内元素变为忽略区域（类名不在观察范围内）后文字变化', () => {
  /** 合并区域：计数、文字之外还有一个空的图标元素 */
  const WITH_ICON = REMAINING.replace('</h3>', '<span id="icon"></span></h3>')

  it('对照：一开始就带忽略标记时照常逐组处理', () => {
    start(WITH_ICON.replace('id="icon"', 'id="icon" class="notranslate"').replace('>12<', '>13<'))
    expect(text('#h')).toBe('13 剩余 项')
  })

  it('页面给空元素加上 notranslate 后改计数：整段重新逐组处理，不残留置空的文字；停止后还原', async () => {
    const t = start(WITH_ICON)
    expect(text('#h')).toBe('还有 12 项')
    // 类名不在观察范围内，本身不触发处理
    $('#icon').classList.add('notranslate')
    await settle()
    ;($('#h [data-testid="count"]').firstChild as Text).data = '13'
    await settle()
    expect(text('#h')).toBe('13 剩余 项')
    expect(misses(t)).toEqual([])
    t.stop()
    translator = undefined
    expect(text('#h')).toBe('13 remaining items')
  })

  it('变为忽略区域的元素自己有整段写入时置空的文字：释放区域时还原', async () => {
    start(REMAINING)
    expect(text('#h')).toBe('还有 12 项')
    $('#h span span').classList.add('notranslate')
    ;($('#h [data-testid="count"]').firstChild as Text).data = '13'
    await settle()
    expect(text('#h')).toBe('13 剩余 items')
  })
})

describe('整段合并：区域内换入 kbd', () => {
  /** 快捷键提示：按键先由普通 span 显示，之后换成 kbd */
  const HINT = '<p class="shortcutHint__x" id="r"><b>Tip:</b> Press <span>K</span> to search</p>'

  it('参照：一开始就是 kbd 时按 kbd 句子处理，「提示：」后的整句不带开头空白', () => {
    start(HINT.replace('<span>K</span>', '<kbd>K</kbd>'))
    expect(text('#r b')).toBe('提示：')
    expect(texts($('#r'))).toEqual(['按 ', ' 搜索'])
    expect(text('#r')).toBe('提示：按 K 搜索')
  })

  it('整段写入后按键换成 kbd：先释放区域再按 kbd 整句重算，与一开始就是 kbd 时相同；停止后还原', async () => {
    const t = start(HINT)
    expect(text('#r')).toBe('提示：按 K 搜索')
    $('#r span').replaceWith(element('kbd', 'K'))
    await settle()
    expect(text('#r b')).toBe('提示：')
    expect(texts($('#r'))).toEqual(['按 ', ' 搜索'])
    expect(text('#r')).toBe('提示：按 K 搜索')
    expect(misses(t)).toEqual([])
    t.stop()
    translator = undefined
    expect(text('#r')).toBe('Tip: Press K to search')
  })
})

describe('整段合并：区域内的行内句宿主', () => {
  /** 另收整段「12 starred vuejs/core」：BASE 的行内句「{} starred {}」同样命中区域根 */
  const STARRED: LocaleBundle = [
    ...BUNDLE,
    ['common', { regexp: [[/^(\d+) starred ([\w./-]+)$/, '$2 获得 $1 个星标']] }],
  ]
  const MERGED = 'vuejs/core 获得 12 个星标'

  function startFeed(count: string): Translator {
    const html = `<h3><span data-sr-feedback id="m"><b>${count}</b> starred <b>vuejs/core</b></span></h3>`
    return start(html, ISSUES, { matcher: testMatcher(undefined, STARRED) })
  }

  it('计数起初是占位符（按行内句写入），原地改成数字后整段命中：按整段写入，不留行内句写回的片段；与全新翻译相同', async () => {
    const t = startFeed('…')
    expect(text('#m')).toBe('… 星标了 vuejs/core')
    ;($('#m b').firstChild as Text).data = '12'
    await settle()
    expect(text('#m')).toBe(MERGED)
    t.stop()
    t.start()
    expect(text('#m')).toBe(MERGED)
  })

  it('整段写入后宿主内的文本节点被替换：仍按整段写入，不按行内句写回；与全新翻译相同', async () => {
    const t = startFeed('12')
    expect(text('#m')).toBe(MERGED)
    $('#m').childNodes[1]!.replaceWith(' starred ')
    await settle()
    expect(text('#m')).toBe(MERGED)
    t.stop()
    t.start()
    expect(text('#m')).toBe(MERGED)
  })
})

describe('整段合并：不能再合并时重新遍历区域', () => {
  /** 区域内有镜像文字属性的元素：整段写入时其中的文字置空，属性保持原文 */
  const MIRRORED = REMAINING.replace(
    '<span> remaining ',
    '<span data-component="text" data-content="remaining"> remaining ',
  )
  const mirror = (): string | null => $('#h [data-component="text"]').getAttribute('data-content')

  it('插入跳过子树的元素（两侧没有文本）后，区域内的镜像文字属性随文字同步', async () => {
    start(MIRRORED)
    expect(text('#h')).toBe('还有 12 项')
    $('#h').append(element('code', 'x'))
    await settle()
    expect(text('#h')).toBe('12 剩余 项x')
    expect(mirror()).toBe('剩余')
  })

  it('区域内元素变为忽略区域（类名不在观察范围内）后文字变化：区域内的镜像文字属性随文字同步', async () => {
    start(MIRRORED.replace('</h3>', '<span id="icon"></span></h3>'))
    expect(text('#h')).toBe('还有 12 项')
    expect(mirror()).toBe('remaining')
    $('#icon').classList.add('notranslate')
    ;($('#h [data-testid="count"]').firstChild as Text).data = '13'
    await settle()
    expect(text('#h')).toBe('13 剩余 项')
    expect(mirror()).toBe('剩余')
  })

  it('移除区域内的元素（两侧没有文本）后整段未命中：区域内的镜像文字属性随文字同步', async () => {
    start(MIRRORED)
    $('#h [data-testid="count"]').remove()
    await settle()
    expect(text('#h')).toBe(' 剩余 项')
    expect(mirror()).toBe('剩余')
  })
})

describe('整段合并：释放整段写入过的区域时，区域内忽略区域里的重新进入区域', () => {
  /** 建议块：标题栏是重新进入区域，代码在 .blob-wrapper 内 */
  const BLOCK = '<div class="js-suggested-changes-blob"><div id="hdr">Copy</div><div class="blob-wrapper"></div></div>'

  it.each([
    [
      '区域内插入含建议块的评论正文',
      REMAINING,
      () => $('#h span:last-child').insertAdjacentHTML('beforeend', `<div class="comment-body">${BLOCK}</div>`),
    ],
    [
      '区域内的外壳变为评论正文（类名不观察）后标题栏写入文字',
      REMAINING.replace('</h3>', `<span id="wrap">${BLOCK.replace('Copy', '')}</span></h3>`),
      () => {
        $('#wrap').className = 'comment-body'
        $('#hdr').append('Copy')
      },
    ],
    [
      '区域内的外壳变为评论正文（类名不观察）后向其中插入建议块',
      REMAINING.replace('</h3>', '<span id="wrap"></span></h3>'),
      () => {
        $('#wrap').className = 'comment-body'
        $('#wrap').insertAdjacentHTML('beforeend', BLOCK)
      },
    ],
  ])('%s：区域照常逐组重算，标题栏照常翻译，与全新处理相同', async (_, html, change) => {
    const t = start(html)
    const shown = (): string[] => [text('#h [data-testid="count"]'), text('#hdr')]
    expect(text('#h [data-testid="count"]')).toBe('还有 12 项')
    change()
    await settle()
    expect(shown()).toEqual(['12', '复制'])
    t.stop()
    t.start()
    expect(shown()).toEqual(['12', '复制'])
  })
})

describe('整段合并：文档解析中已译文字被追加标点', () => {
  it('区域内只有一段文字：显示不改回英文，不记未翻译；停止后还原整段原文', async () => {
    parsing()
    const t = start('<h3><span data-sr-feedback id="m">Edit</span></h3>')
    expect(text('#m')).toBe('编辑')
    ;($('#m').lastChild as Text).appendData('…')
    await settle()
    expect(text('#m')).toBe('编辑…')
    expect(misses(t)).toEqual([])
    t.stop()
    translator = undefined
    expect(text('#m')).toBe('Edit…')
  })

  it('整段未命中、逐组译出的末段被追加标点：显示不改回英文，不多记未翻译；停止后还原整段原文', async () => {
    parsing()
    const t = start(heading('h', '<span>many</span><span> remaining <span id="i">items</span></span>'))
    expect(text('#h')).toBe('many 剩余 项')
    expect(misses(t)).toEqual(['many'])
    ;($('#i').lastChild as Text).appendData('…')
    await settle()
    expect(text('#h')).toBe('many 剩余 项…')
    expect(misses(t)).toEqual([])
    t.stop()
    translator = undefined
    expect(text('#h')).toBe('many remaining items…')
  })

  it('整段未命中、区域根与后代的文字各自译出，后代末尾被追加标点：显示不改回英文，不记未翻译；停止后还原整段原文', async () => {
    parsing()
    const t = start(
      '<h3><span data-sr-feedback id="m">Sample text <span class="color-fg-muted">Edit</span></span></h3>',
      ISSUES,
      { matcher: testMatcher(undefined, SAMPLE_TEXT) },
    )
    expect(text('#m')).toBe('示例文本 编辑')
    expect(misses(t)).toEqual([])
    // 解析器把下一块到达的省略号追加到区域内最后一个文本节点
    ;($('#m span').firstChild as Text).appendData('…')
    await settle()
    expect(text('#m')).toBe('示例文本 编辑…')
    expect(misses(t)).toEqual([])
    t.stop()
    translator = undefined
    expect(text('#m')).toBe('Sample text Edit…')
  })

  it.each([
    ['跳过子树的元素', 'code'],
    ['不能合并的元素', 'a'],
  ])('同一解析任务内又插入%s：区域只处理一次，显示不改回英文、不记未翻译；停止后还原', async (_, tag) => {
    parsing()
    const t = start('<h3><span data-sr-feedback id="m">Edit</span></h3>')
    expect(text('#m')).toBe('编辑')
    ;($('#m').lastChild as Text).appendData('… ')
    $('#m').append(element(tag, 'README.md'))
    await settle()
    expect(text('#m')).toBe('编辑… README.md')
    expect(misses(t)).toEqual([])
    t.stop()
    translator = undefined
    expect(text('#m')).toBe('Edit… README.md')
  })
})

describe('整段合并：页面脚本重绘', () => {
  /** 整段命中正则：译文写入计数所在的文本节点，标签、名词置空 */
  const REDRAWN =
    '<h3><span data-sr-feedback id="r"><span id="count">12</span>' +
    '<span id="label"> remaining <span id="noun">items</span></span></span></h3>'
  const firstText = (selector: string): Text => $(selector).firstChild as Text

  it('每次重绘都重写三段文字（计数、名词与原文相同）：次数未超上限，标签改回后仍整段翻译', async () => {
    const t = start(REDRAWN, ISSUES, { host: CLOCK_HOST })
    expect(text('#r')).toBe('还有 12 项')
    // 页面脚本（非 React）重绘：计数、标签、名词逐段写入
    const render = (label: string): void => {
      firstText('#count').data = '12'
      firstText('#label').data = label
      firstText('#noun').data = 'items'
    }
    const steps: readonly (readonly [label: string, shown: string])[] = [
      [' open ', '12 open 项'],
      [' closed ', '12 closed 项'],
      [' remaining ', '还有 12 项'],
    ]
    expect(steps.length).toBeLessThanOrEqual(FIGHT_LIMIT)
    for (const [label, shown] of steps) {
      render(label)
      await settle()
      expect(text('#r'), `标签改为「${label.trim()}」`).toBe(shown)
    }
    // 整段未命中的两次：照常逐组处理，各记一次未命中的标签
    expect(misses(t)).toEqual(['open', 'closed'])
    t.stop()
    translator = undefined
    expect(text('#r')).toBe('12 remaining items')
  })

  it('只重写标签、次数超过上限：计数与名词写回原文时记录随之清除，不计改回；标签改回后仍整段翻译', async () => {
    start(REDRAWN, ISSUES, { host: CLOCK_HOST })
    expect(text('#r')).toBe('还有 12 项')
    for (let i = 1; i <= FIGHT_LIMIT + 2; i++) {
      firstText('#label').data = i % 2 === 0 ? ' open ' : ' closed '
      await settle()
    }
    expect(text('#r')).toBe('12 open 项')
    firstText('#label').data = ' remaining '
    await settle()
    expect(text('#r')).toBe('还有 12 项')
  })

  it('每次重绘都重写计数与标签、次数超过上限：计数写回原文时记录随之清除，不计改回；标签改回后仍整段翻译', async () => {
    start(REDRAWN, ISSUES, { host: CLOCK_HOST })
    expect(text('#r')).toBe('还有 12 项')
    for (let i = 1; i <= FIGHT_LIMIT + 2; i++) {
      firstText('#count').data = '12'
      firstText('#label').data = i % 2 === 0 ? ' open ' : ' closed '
      await settle()
    }
    expect(text('#r')).toBe('12 open 项')
    firstText('#count').data = '12'
    firstText('#label').data = ' remaining '
    await settle()
    expect(text('#r')).toBe('还有 12 项')
  })
})

describe('整段合并：区域不能再合并后，区域内其他文字变化时不重新遍历区域', () => {
  const MERGED =
    '<h3><span data-sr-feedback id="r"><span id="x" title="Close">12</span> ' +
    '<span class="issue-user-content">remaining</span> <span id="a">items</span></span></h3>'

  it('切换页面类型后区域内出现忽略区域：页面坚持显示原值、已暂停翻译的属性不重新翻译；停止后还原', async () => {
    // 拉取请求页能整段合并；议题页的忽略规则命中其中的元素，不能再合并
    const t = startAt(PULL_PATH, MERGED)
    expect(text('#r')).toBe('还有 12 项')
    const x = $('#x')
    expect(x.getAttribute('title')).toBe('关闭')
    go(ISSUE_PATH)
    expect(t.checkLocation()).toBe(true)
    expect(text('#r')).toBe('12 remaining 项')
    // 页面反复改回原 title，超过上限后暂停翻译该属性
    const shown = guardAttribute(x, 'title', 'Close')
    x.setAttribute('title', 'Close')
    await settleAll()
    expect(x.getAttribute('title')).toBe('Close')
    expect(shown).toEqual(repeat('关闭'))
    // 统计窗口过去之后，页面改写区域内的另一段文字：只处理这段文字
    now += FIGHT_WINDOW_MS * 2
    shown.length = 0
    ;($('#a').firstChild as Text).data = 'Edit'
    await settleAll()
    expect(shown).toEqual([])
    expect(text('#r')).toBe('12 remaining 编辑')
    expect(x.getAttribute('title')).toBe('Close')
    t.stop()
    translator = undefined
    expect(text('#r')).toBe('12 remaining Edit')
    expect(x.getAttribute('title')).toBe('Close')
  })

  it('切换页面类型后区域内出现忽略区域、其余文字都单独译出：已暂停翻译的属性不重新翻译；停止后还原', async () => {
    // 拉取请求页整段命中；议题页忽略其中的用户内容，其余文字单独命中，没有写回原文引起的变动
    const t = startAt(
      PULL_PATH,
      '<h3><span data-sr-feedback id="r"><span id="x" title="Close">Updated 3 days ago</span>' +
        '<span class="issue-user-content"> by octocat</span></span></h3>',
    )
    expect(text('#r')).toBe('3 天前由 octocat 更新')
    go(ISSUE_PATH)
    expect(t.checkLocation()).toBe(true)
    await settleAll()
    expect(text('#r')).toBe('3天前更新 by octocat')
    const x = $('#x')
    const shown = guardAttribute(x, 'title', 'Close')
    x.setAttribute('title', 'Close')
    await settleAll()
    expect(shown).toEqual(repeat('关闭'))
    // 统计窗口过去之后，页面改写区域内的文字：只处理这段文字
    now += FIGHT_WINDOW_MS * 2
    shown.length = 0
    ;(x.firstChild as Text).data = 'Updated 4 days ago'
    await settleAll()
    expect(shown).toEqual([])
    expect(text('#r')).toBe('4天前更新 by octocat')
    expect(x.getAttribute('title')).toBe('Close')
    t.stop()
    translator = undefined
    expect(text('#r')).toBe('Updated 4 days ago by octocat')
  })

  it('停用期间区域内多了链接、重新启用后：页面坚持显示原文、已暂停翻译的文字不重新翻译；停止后还原', async () => {
    const t = startAt(
      ISSUE_PATH,
      '<h3><span data-sr-feedback id="r"><span id="x">12</span> remaining <span id="a">items</span></span></h3>',
    )
    expect(text('#r')).toBe('还有 12 项')
    t.stop()
    $('#r').append(' ', Object.assign(element('a', 'octocat'), { href: '#octocat' }))
    t.start()
    expect(text('#r')).toBe('12 剩余 项 octocat')
    const node = $('#a').firstChild as Text
    const shown = guardText(node, 'items')
    node.data = 'items'
    await settleAll()
    expect(node.data).toBe('items')
    expect(shown).toEqual(repeat('项'))
    now += FIGHT_WINDOW_MS * 2
    shown.length = 0
    ;($('#x').firstChild as Text).data = '13'
    await settleAll()
    expect(shown).toEqual([])
    expect(text('#r')).toBe('13 剩余 items octocat')
    t.stop()
    translator = undefined
    expect(text('#r')).toBe('13 remaining items octocat')
  })

  it('停用期间区域内多了链接、重新启用后：页面先改镜像属性、后改文字，文字译出后属性同步为同一译文', async () => {
    const t = startAt(
      ISSUE_PATH,
      '<h3><span data-sr-feedback id="r"><span id="m" data-component="text" data-content="Edit">Edit</span><span> file</span></span></h3>',
    )
    expect(text('#r')).toBe('编辑文件')
    t.stop()
    $('#r').append(Object.assign(element('a', 'octocat'), { href: '#octocat' }))
    t.start()
    const mirror = $('#m')
    expect(mirror.textContent).toBe('编辑')
    expect(mirror.getAttribute('data-content')).toBe('编辑')
    // 页面先改镜像属性，下一个任务再改文字
    mirror.setAttribute('data-content', 'Close')
    await settleAll()
    expect(mirror.getAttribute('data-content')).toBe('Close')
    ;(mirror.firstChild as Text).data = 'Close'
    await settleAll()
    expect(mirror.textContent).toBe('关闭')
    expect(mirror.getAttribute('data-content')).toBe('关闭')
    t.stop()
    translator = undefined
    expect(mirror.textContent).toBe('Close')
    expect(mirror.getAttribute('data-content')).toBe('Close')
  })

  it('整段未命中的区域：切换页面类型前已暂停翻译的文字，之后区域内其他文字变化时不重新翻译；停止后还原', async () => {
    // 拉取请求页整段未命中、逐组译出；议题页的忽略规则命中其中的用户名，不能再合并
    const t = startAt(
      PULL_PATH,
      '<h3><span data-sr-feedback id="r"><span id="x">Newest</span> ' +
        '<span class="issue-user-content">octocat</span> <span id="a">Sample</span></span></h3>',
    )
    expect(text('#r')).toBe('最新 octocat Sample')
    // 页面反复改回原文，超过上限后暂停翻译这段文字
    const node = $('#x').firstChild as Text
    const shown = guardText(node, 'Newest')
    node.data = 'Newest'
    await settleAll()
    expect(node.data).toBe('Newest')
    expect(shown).toEqual(repeat('最新'))
    go(ISSUE_PATH)
    expect(t.checkLocation()).toBe(true)
    expect(text('#r')).toBe('Newest octocat Sample')
    // 统计窗口过去之后，页面改写区域内的另一段文字（与 #x 不在同一文本组）
    now += FIGHT_WINDOW_MS * 2
    shown.length = 0
    ;($('#a').firstChild as Text).data = 'Edit'
    await settleAll()
    expect(shown).toEqual([])
    expect(text('#r')).toBe('Newest octocat 编辑')
    t.stop()
    translator = undefined
    expect(text('#r')).toBe('Newest octocat Edit')
  })

  it('整段未命中的区域：停用期间多了链接、重新启用后，已暂停翻译的属性不重新翻译；停止后还原', async () => {
    const t = startAt(
      ISSUE_PATH,
      '<h3><span data-sr-feedback id="r"><span id="x" title="Close">Newest</span> <span id="a">Sample</span></span></h3>',
    )
    const x = $('#x')
    expect(text('#r')).toBe('最新 Sample')
    expect(x.getAttribute('title')).toBe('关闭')
    t.stop()
    $('#r').append(' ', Object.assign(element('a', 'octocat'), { href: '#octocat' }))
    t.start()
    expect(text('#r')).toBe('最新 Sample octocat')
    expect(x.getAttribute('title')).toBe('关闭')
    // 页面反复改回原 title，超过上限后暂停翻译该属性
    const shown = guardAttribute(x, 'title', 'Close')
    x.setAttribute('title', 'Close')
    await settleAll()
    expect(x.getAttribute('title')).toBe('Close')
    expect(shown).toEqual(repeat('关闭'))
    // 统计窗口过去之后，页面改写区域内的另一段文字
    now += FIGHT_WINDOW_MS * 2
    shown.length = 0
    ;($('#a').firstChild as Text).data = 'Edit'
    await settleAll()
    expect(shown).toEqual([])
    expect(text('#r')).toBe('最新 编辑 octocat')
    expect(x.getAttribute('title')).toBe('Close')
    t.stop()
    translator = undefined
    expect(text('#r')).toBe('Newest Edit octocat')
    expect(x.getAttribute('title')).toBe('Close')
  })
})
