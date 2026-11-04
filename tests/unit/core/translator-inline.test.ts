// @vitest-environment-options { "url": "https://github.com/vuejs/core/pulls" }
import { afterEach, describe, expect, it } from 'vitest'
import { createMatcher } from '../../../src/core/matcher'
import { FIGHT_LIMIT } from '../../../src/core/records'
import { createTranslator, type Translator, type TranslatorHost, type TranslatorOptions } from '../../../src/core/translator'
import type { LocaleBundle, PageKey } from '../../../src/core/types'
import { $, settle, texts } from './helpers'

const BUNDLE: LocaleBundle = [
  [
    'common',
    {
      static: {
        'Type / to search': '按 / 搜索',
        'Type ? for help and tips': '按 ? 查看帮助和提示',
        'Type # to search pull requests': '按 # 搜索拉取请求',
        'Press CtrlK now': '按 Ctrl 加 K 立即',
        'Tip:': '提示：',
        'to search': '搜索',
        Use: '使用',
        'Learn more about': '了解',
        'Contributed to': '贡献于',
        'Recently updated': '最近更新',
        'What is': '什么是',
        Version: '版本',
        Remaining: '剩余',
        'There was an error while loading.': '加载时出错。',
        'Please reload this page': '请重新加载此页面'
      }
    }
  ],
  ['repo-settings', { scoped: { Type: '类型' } }],
  ['issues', { scoped: { Type: '类型' } }]
]

/** 页面范围内另有一条行内句规则（正式语言包 common 有行内句规则） */
const INLINE_BUNDLE: LocaleBundle = [...BUNDLE, ['common', { inline: [['{} merged', '{} 已合并']] }]]

/** 只收整句、不收片段：kbd 片段的组成变了以后，各段回到原文 */
const SENTENCES: LocaleBundle = [
  ['common', { static: { 'Type / to search': '按 / 搜索', 'Press CtrlShiftK now': '按 Ctrl Shift K 立即', Sample: '示例' } }]
]

let translator: Translator | undefined

/** 时钟固定：各次改回都落在同一统计窗口内，结果不受机器快慢影响 */
const FIXED_CLOCK_HOST: TranslatorHost = {
  document,
  location: window.location,
  MutationObserver: window.MutationObserver,
  performance: { now: () => 0 }
}

function start(html: string, options: Partial<TranslatorOptions> = {}): Translator {
  document.body.innerHTML = html
  translator = createTranslator({ matcher: createMatcher(BUNDLE), host: window, ...options })
  translator.start()
  return translator
}

function pagesOf(...keys: PageKey[]): Partial<TranslatorOptions> {
  return { resolvePages: () => ['common', 'repository', ...keys] }
}

const text = (selector: string): string => $(selector).textContent ?? ''

function element(tag: string, content: string): HTMLElement {
  return Object.assign(document.createElement(tag), { textContent: content })
}

afterEach(() => {
  translator?.stop()
  translator = undefined
  document.body.innerHTML = ''
})

describe('被 kbd 拆开的句子', () => {
  it('整句匹配，译文按 kbd 文字切分写回各段；kbd 与节点数不变', () => {
    start('<span id="p">Type <kbd>/</kbd> to search</span>')
    expect(texts($('#p'))).toEqual(['按 ', ' 搜索'])
    expect(text('kbd')).toBe('/')
    expect($('#p').childNodes).toHaveLength(3)
  })

  it('片段词条是 scoped「类型」的页面也按整句翻译', () => {
    for (const scope of ['repo-settings', 'issues'] as const) {
      start('<span id="p">Type <kbd>/</kbd> to search</span>', pagesOf(scope))
      expect(texts($('#p')), scope).toEqual(['按 ', ' 搜索'])
      translator!.stop()
    }
  })

  it('kbd 以外的元素是片段边界：Tip: 单独翻译，不并入整句；全角冒号后不留空白', () => {
    start(`<div id="a"><span class="text-bold">Tip:</span> Type <kbd>#</kbd> to search pull requests</div>
      <div id="b">Type <kbd>?</kbd> for help and tips</div>`)
    expect(text('#a')).toBe('提示：按 # 搜索拉取请求')
    expect(text('#b')).toBe('按 ? 查看帮助和提示')
    translator?.stop()
    expect(text('#a')).toBe('Tip: Type # to search pull requests')
  })

  it('元素末尾是译出的全角标点：其后文本不留开头空白；不是全角标点时保留', () => {
    start('<p id="a"><span>Tip:</span> Use</p><p id="b"><span>Use</span> Version</p><p id="c"><span>Tip:</span> Sample</p>')
    expect(text('#a')).toBe('提示：使用')
    expect(text('#b')).toBe('使用 版本')
    // 未翻译的文本不改
    expect(text('#c')).toBe('提示： Sample')
  })

  it('元素内是文本组（末节点已置空）：按组的译文判断', () => {
    start('<p id="a"><span>Tip<!-- -->:</span> Use</p>')
    expect(text('#a')).toBe('提示：使用')
  })

  it('元素末尾的全角标点不是本引擎写入的（页面原有中文）：其后文本保留开头空白', () => {
    start('<p id="a"><span>提示：</span> Use</p>')
    expect(text('#a')).toBe('提示： 使用')
  })

  it('首个 kbd 之前或末个 kbd 之后没有文字时逐段处理；只有快捷键时不处理', () => {
    start('<p id="a"><kbd>Tab</kbd> to search</p><span id="b"><kbd>g</kbd> <kbd>i</kbd></span>', {
      collectUntranslated: true
    })
    expect(texts($('#a'))).toEqual([' 搜索'])
    expect(text('#b')).toBe('g i')
    expect(translator!.drainUntranslated()).toEqual([])
  })

  it('译文缺少 kbd 文字、或某段需写入但该处没有文本节点时逐段处理', () => {
    start('<span id="a">Type <kbd>/</kbd> to search</span><span id="b">Press <kbd>Ctrl</kbd><kbd>K</kbd> now</span>', {
      matcher: createMatcher(BUNDLE, { custom: { 'Type / to search': '搜索' } })
    })
    expect(texts($('#a'))).toEqual(['Type ', ' 搜索'])
    expect(texts($('#b'))).toEqual(['Press ', ' now'])
  })

  it('kbd 文字也出现在译文的英文单词里时，按独立出现的位置切分；相邻 kbd 拼成的文字照常切分', () => {
    start('<p id="a">Press <kbd>C</kbd> to chat</p><p id="b">Press <kbd>Ctrl</kbd><kbd>K</kbd> now</p>', {
      matcher: createMatcher(BUNDLE, {
        custom: { 'Press C to chat': '用 Copilot 聊天请按 C', 'Press CtrlK now': '立即按 CtrlK' }
      })
    })
    expect(texts($('#a'))).toEqual(['用 Copilot 聊天请按 ', ''])
    expect(texts($('#b'))).toEqual(['立即按 ', ''])
  })

  it('整句未命中：逐段处理，只记整句未翻译', () => {
    const t = start('<p id="a">Use <kbd>Control</kbd> to search</p><p id="b">Press <kbd>Enter</kbd> to confirm</p>', {
      collectUntranslated: true
    })
    expect(text('#a')).toBe('使用 Control 搜索')
    expect(text('#b')).toBe('Press Enter to confirm')
    expect(t.drainUntranslated().map(([source]) => source)).toEqual(['Use Control to search', 'Press Enter to confirm'])
  })

  it('外部改写其中一段后整句重算；不再命中时各段回到原文；stop 后还原', async () => {
    const t = start('<span id="p">Type <kbd>/</kbd> to search</span>')
    const [first, , last] = [...$('#p').childNodes] as Text[]
    first!.data = 'Type '
    await settle()
    expect(texts($('#p'))).toEqual(['按 ', ' 搜索'])
    last!.data = ' to jump'
    await settle()
    expect(texts($('#p'))).toEqual(['Type ', ' to jump'])
    last!.data = ' to search'
    await settle()
    expect(texts($('#p'))).toEqual(['按 ', ' 搜索'])
    t.stop()
    expect(texts($('#p'))).toEqual(['Type ', ' to search'])
  })

  it('页面反复把其中一段改回原文：有限次后逐段处理，其余段回到原文，不留半句译文', async () => {
    start('<p id="p">Type <kbd>?</kbd> for help and tips</p>')
    expect(texts($('#p'))).toEqual(['按 ', ' 查看帮助和提示'])
    const first = $('#p').firstChild as Text
    const guard = new MutationObserver(() => {
      if (first.data !== 'Type ') first.data = 'Type '
    })
    guard.observe(first, { characterData: true })
    try {
      first.data = 'Type '
      for (let i = 0; i < 5; i++) await settle()
      expect(texts($('#p'))).toEqual(['Type ', ' for help and tips'])
    } finally {
      guard.disconnect()
    }
    translator?.stop()
    expect(texts($('#p'))).toEqual(['Type ', ' for help and tips'])
  })

  it('React 以新文本节点替换其中一段后整句重算', async () => {
    start('<span id="p">Type <kbd>/</kbd> to search</span>')
    const host = $('#p')
    host.replaceChild(document.createTextNode(' to search'), host.lastChild!)
    await settle()
    expect(texts(host)).toEqual(['按 ', ' 搜索'])
  })

  it('kbd 内文字变化后整句重算', async () => {
    start('<span id="p">Type <kbd>/</kbd> to search</span>')
    ;($('kbd').firstChild as Text).data = '?'
    await settle()
    expect(texts($('#p'))).toEqual(['Type ', ' 搜索'])
    ;($('kbd').firstChild as Text).data = '/'
    await settle()
    expect(texts($('#p'))).toEqual(['按 ', ' 搜索'])
  })

  it('kbd 两侧只有空白文本时，kbd 内文字变化后同样整句重算', async () => {
    start('<span id="p">Press <kbd>Ctrl</kbd> <kbd id="k">K</kbd> to open</span>', {
      matcher: createMatcher(BUNDLE, { custom: { 'Press Ctrl K to open': '按 Ctrl K 打开' } })
    })
    expect(texts($('#p'))).toEqual(['按 ', ' ', ' 打开'])
    ;($('#k').firstChild as Text).data = 'J'
    await settle()
    expect(texts($('#p'))).toEqual(['Press ', ' ', ' to open'])
    ;($('#k').firstChild as Text).data = 'K'
    await settle()
    expect(texts($('#p'))).toEqual(['按 ', ' ', ' 打开'])
  })

  it('动态插入的句子、逐段补进的文字都按整句处理', async () => {
    start('<main></main><span id="q"><kbd>/</kbd></span>')
    $('main').insertAdjacentHTML('beforeend', '<span id="p">Type <kbd>/</kbd> to search</span>')
    const host = $('#q')
    host.prepend('Type ')
    host.append(' to search')
    await settle()
    expect(texts($('#p'))).toEqual(['按 ', ' 搜索'])
    expect(texts(host)).toEqual(['按 ', ' 搜索'])
  })

  it('忽略区域内不处理', () => {
    start('<div class="markdown-body"><p id="p">Type <kbd>/</kbd> to search</p></div>')
    expect(text('#p')).toBe('Type / to search')
  })

  it('顶部搜索按钮：占位提示整句翻译，显示当前查询时不翻译', () => {
    start(`<button class="Search-module__searchButton__aiE0a"><span data-component="text">
        <span id="p" class="Search-module__placeholder__p9hbG">Type <kbd class="Search-module__kbd__WCskr">/</kbd> to search</span></span></button>
      <button class="Search-module__searchButton__aiE0a"><span data-component="text">
        <span id="q" class="Search-module__placeholder__p9hbG">to search</span></span></button>`)
    expect(text('#p')).toBe('按 / 搜索')
    expect(text('#q')).toBe('to search')
  })
})

describe('kbd 句子里只有半角标点的段', () => {
  /** 用户照未翻译列表补的整句词条 */
  const CUSTOM = { 'Press K.': '按 K。', 'Use Ctrl, Alt to move': '用 Ctrl，Alt 移动' }
  const PRESS = '<p id="a">Press <kbd>K</kbd>.<a href="#x">octocat</a></p>'

  it.each([
    ['没有行内句规则', BUNDLE],
    ['有行内句规则', INLINE_BUNDLE]
  ])('整句译文写入的全角标点不按孤立标点重算（页面范围内%s）：句号后紧跟元素、两个 kbd 之间的逗号', (_, bundle) => {
    start(`${PRESS}<p id="b">Use <kbd>Ctrl</kbd>, <kbd>Alt</kbd> to move</p>`, {
      matcher: createMatcher(bundle, { custom: CUSTOM })
    })
    expect(texts($('#a'))).toEqual(['按 ', '。'])
    expect(texts($('#b'))).toEqual(['用 ', '，', ' 移动'])
  })

  it('页面范围内有行内句规则时动态插入：处理后不再产生变动；停止后还原', () => {
    const t = start('<div id="root"></div>', { matcher: createMatcher(INLINE_BUNDLE, { custom: CUSTOM }) })
    $('#root').innerHTML = PRESS
    // 同步逐批处理：不收敛时变动回调在微任务里无限进行
    for (let i = 0; i < 10; i++) t.flush()
    expect(t.batches).toBeLessThanOrEqual(2)
    expect(texts($('#a'))).toEqual(['按 ', '。'])
    t.stop()
    expect(text('#a')).toBe('Press K.octocat')
  })

  it('kbd 被移除后，整句写入的全角标点按孤立标点重算：语境不是中文时写回半角，与全新处理相同', async () => {
    const t = start(PRESS, { matcher: createMatcher(BUNDLE, { custom: CUSTOM }) })
    expect(texts($('#a'))).toEqual(['按 ', '。'])
    $('#a kbd').remove()
    await settle()
    expect(text('#a')).toBe('Press .octocat')
    t.stop()
    t.start()
    expect(text('#a')).toBe('Press .octocat')
  })

  it.each([
    [
      '首段被改写为未收录的英文',
      () => {
        ;($('#a').firstChild as Text).data = 'Hit '
      },
      'Hit K.octocat'
    ],
    [
      '首段被清空（不再构成整句）',
      () => {
        ;($('#a').firstChild as Text).data = ''
      },
      'K.octocat'
    ],
    [
      'kbd 内文字变化',
      () => {
        ;($('#a kbd').firstChild as Text).data = 'J'
      },
      'Press J.octocat'
    ]
  ])('kbd 仍在、%s后逐段处理：整句写入的全角标点按孤立标点重算，语境不是中文时写回半角，与全新处理相同', async (_, change, shown) => {
    const t = start(PRESS, { matcher: createMatcher(BUNDLE, { custom: CUSTOM }) })
    expect(texts($('#a'))).toEqual(['按 ', '。'])
    change()
    await settle()
    expect(text('#a')).toBe(shown)
    t.stop()
    t.start()
    expect(text('#a')).toBe(shown)
  })

  it('页面反复把首段改回原文：有限次后逐段处理，不留整句切分出的全角标点', async () => {
    start(PRESS, { matcher: createMatcher(BUNDLE, { custom: CUSTOM }) })
    expect(texts($('#a'))).toEqual(['按 ', '。'])
    const first = $('#a').firstChild as Text
    const guard = new MutationObserver(() => {
      if (first.data !== 'Press ') first.data = 'Press '
    })
    guard.observe(first, { characterData: true })
    try {
      first.data = 'Press '
      for (let i = 0; i < 5; i++) await settle()
      expect(texts($('#a'))).toEqual(['Press ', '.'])
    } finally {
      guard.disconnect()
    }
  })

  it('其他段被外部改写、整句不再命中：整句写入的全角标点按孤立标点重算，与全新处理相同', async () => {
    const t = start(`${PRESS}<p id="b">Use <kbd>Ctrl</kbd>, <kbd>Alt</kbd> to move</p>`, {
      matcher: createMatcher(BUNDLE, { custom: CUSTOM })
    })
    expect(texts($('#a'))).toEqual(['按 ', '。'])
    expect(texts($('#b'))).toEqual(['用 ', '，', ' 移动'])
    ;($('#a').firstChild as Text).data = 'Tap '
    ;($('#b').lastChild as Text).data = ' to jump'
    await settle()
    // 语境不再是中文时写回半角；语境仍是中文（首段照常译出）时两个 kbd 之间的逗号转顿号
    const shown = [
      ['Tap ', '.'],
      ['使用 ', '、', ' to jump']
    ]
    expect([texts($('#a')), texts($('#b'))]).toEqual(shown)
    t.stop()
    t.start()
    expect([texts($('#a')), texts($('#b'))]).toEqual(shown)
  })
})

describe.each([
  ['没有行内句规则', SENTENCES],
  ['有行内句规则', [...SENTENCES, ['common', { inline: [['{} merged', '{} 已合并']] }]] satisfies LocaleBundle]
])('kbd 片段的组成变化（页面范围内%s）', (_, bundle) => {
  const TYPE = '<span id="k">Type <kbd>/</kbd> to search</span>'
  const PRESS = '<p id="k">Press <kbd>Ctrl</kbd><kbd id="m">Shift</kbd><kbd>K</kbd> now</p>'

  it.each([
    ['首段与 kbd 之间插入元素', TYPE, () => $('#k kbd').before(element('b', 'Sample')), ['Type ', ' to search']],
    ['kbd 之后插入元素', TYPE, () => $('#k kbd').after(element('b', 'Sample')), ['Type ', ' to search']],
    [
      '相邻 kbd 中间一个的文字被改写',
      PRESS,
      () => {
        ;($('#m').firstChild as Text).data = 'Alt'
      },
      ['Press ', ' now']
    ],
    [
      '相邻 kbd 中间一个的文字被替换',
      PRESS,
      () => {
        $('#m').textContent = 'Alt'
      },
      ['Press ', ' now']
    ]
  ])('%s：片段整句重算，与全新处理相同', async (_, html, change, shown) => {
    const t = start(html, { matcher: createMatcher(bundle) })
    expect(text('#k')).toMatch(/^按 /)
    change()
    await settle()
    expect(texts($('#k'))).toEqual(shown)
    t.stop()
    t.start()
    expect(texts($('#k'))).toEqual(shown)
  })
})

describe('行内元素旁的孤立标点', () => {
  it('紧贴包着标点的 span 插入元素：与全新处理结果相同', async () => {
    const t = start('<p id="a">Learn more about <a>x</a><span>.</span></p><p id="b">Contributed to <a>a</a><span>, </span></p>')
    expect(text('#a')).toBe('了解 x。')
    expect(text('#b')).toBe('贡献于 a，')
    $('#a').append(element('b', 'octocat'))
    $('#b').append(element('a', 'hubot'))
    await settle()
    const changed = [text('#a'), text('#b')]
    t.stop()
    t.start()
    expect(changed).toEqual([text('#a'), text('#b')])
    expect(changed).toEqual(['了解 x.octocat', '贡献于 a、hubot'])
  })

  it('行内句重判后整句写入：作为槽位的标点按整句语境转全角', async () => {
    const bundle: LocaleBundle = [...BUNDLE, ['common', { inline: [['Merged {#} commits into {}{}', '已合并 {#} 个提交到 {}{}']] }]]
    start('<p id="h">Merged <b>many</b> commits into <a>main</a><span>.</span></p>', {
      matcher: createMatcher(bundle)
    })
    expect(text('#h')).toBe('Merged many commits into main.')
    ;($('#h b').firstChild as Text).data = '3'
    await settle()
    expect(text('#h')).toBe('已合并 3 个提交到 main。')
  })

  it('跳过区域里的孤立标点不改写：忽略的 span、退出标记，含译后才加上退出标记的', async () => {
    start(
      '<p id="a">Learn more about <a>x</a>, <b>y</b><span class="branch-name">!</span></p>' +
        '<p id="b">Learn more about <a>x</a>, <b>y</b><span translate="no">;</span></p>' +
        '<p id="c">Contributed to <a>x</a>, <b>y</b><span id="later">!</span></p>'
    )
    expect(text('#a')).toBe('了解 x、y!')
    expect(text('#b')).toBe('了解 x、y;')
    expect(text('#c')).toBe('贡献于 x、y！')
    $('#later').setAttribute('translate', 'no')
    await settle()
    expect(text('#later')).toBe('!')
    ;($('#c').firstChild as Text).data = 'Learn more about '
    await settle()
    expect(text('#c')).toBe('了解 x、y!')
  })

  it('句末标点随中文语境转全角，语境未翻译时不变；stop 后还原', () => {
    const t = start('<p id="a">Learn more about <a>x</a>.</p><p id="b">Unknown words <a>x</a>.</p>')
    expect(text('#a')).toBe('了解 x。')
    expect(text('#b')).toBe('Unknown words x.')
    t.stop()
    expect(text('#a')).toBe('Learn more about x.')
  })

  it('两个元素之间的逗号用顿号，其余用全角逗号；问号、冒号', () => {
    start(`<p id="a">Contributed to <a>a</a>, <a>b</a>, <a>c</a></p><p id="b">Contributed to <a>a</a>, </p>
      <p id="c">What is <a>Copilot</a>?</p><p id="d"><b>x</b>: <!-- -->Recently updated</p>`)
    expect(text('#a')).toBe('贡献于 a、b、c')
    expect(text('#b')).toBe('贡献于 a，')
    expect(text('#c')).toBe('什么是 Copilot？')
    expect(text('#d')).toBe('x：最近更新')
  })

  it('两侧都是文字、两个数字之间、省略号与括号不转换', () => {
    start(`<p id="a">Learn more about<!-- -->.</p><p id="b">Version <span>1</span>.<span>5</span></p>
      <p id="c">Remaining <span>10</span>: <span>30</span></p><p id="d">剩余 <span>10</span>:<span>30</span></p>
      <p id="e">Learn more about <a>x</a>...</p><p id="f">Learn more about <a>x</a>)</p>`)
    expect(text('#a')).toBe('了解.')
    expect(text('#b')).toBe('版本 1.5')
    expect(text('#c')).toBe('剩余 10: 30')
    expect(text('#d')).toBe('剩余 10:30')
    expect(text('#e')).toBe('了解 x...')
    expect(text('#f')).toBe('了解 x)')
  })

  it('标点前后元素里的数字被改写（含更深层的文字）：标点随之重算，与全新处理相同', async () => {
    const t = start(
      '<p id="a">Remaining <span>10</span>: <span><b>30</b></span></p><p id="b">Remaining <span><b>x</b></span>: <span>30</span></p>'
    )
    expect([text('#a'), text('#b')]).toEqual(['剩余 10: 30', '剩余 x：30'])
    ;($('#a b').firstChild as Text).data = 'x'
    ;($('#b b').firstChild as Text).data = 'v1'
    await settle()
    const changed = [text('#a'), text('#b')]
    expect(changed).toEqual(['剩余 10：x', '剩余 v1: 30'])
    t.stop()
    t.start()
    expect([text('#a'), text('#b')]).toEqual(changed)
  })

  it('带译文标签的长列表：标签改写后全部写回半角，改回后全部转换；与全新处理相同', async () => {
    const links = Array.from({ length: 40 }, (_, i) => `<a href="/u${i}">user${i}</a>`).join(', ')
    const t = start(`<p id="list">Contributed to ${links}</p>`)
    const commas = (): string[] => texts($('#list')).slice(1)
    expect(new Set(commas())).toEqual(new Set(['、']))
    const label = $('#list').firstChild as Text
    label.data = 'Unknown words '
    await settle()
    expect(new Set(commas())).toEqual(new Set([', ']))
    label.data = 'Contributed to '
    await settle()
    const changed = text('#list')
    expect(new Set(commas())).toEqual(new Set(['、']))
    t.stop()
    t.start()
    expect(text('#list')).toBe(changed)
  })

  it('句中已有译文的错误提示：链接后的句号转换', () => {
    start('<p id="a">There was an error while loading. <a>Please reload this page</a>.</p>')
    expect(text('#a')).toBe('加载时出错。请重新加载此页面。')
  })

  it('语境被外部改成未收录的英文后恢复半角；语境后补进时转换', async () => {
    start('<p id="a">Learn more about <a>x</a>.</p><p id="b"><a>y</a>.</p>')
    ;($('#a').firstChild as Text).data = 'Something else entirely '
    await settle()
    expect(text('#a')).toBe('Something else entirely x.')
    $('#b').prepend('Learn more about ')
    await settle()
    expect(text('#b')).toBe('了解 y。')
  })

  it('语境文字被移除后恢复半角', async () => {
    start('<p id="a">Learn more about <a>x</a>.</p>')
    expect(text('#a')).toBe('了解 x。')
    $('#a').firstChild!.remove()
    await settle()
    expect(text('#a')).toBe('x.')
  })

  it('React 重写标点节点后按新内容判断；不增删节点、不计入未翻译', async () => {
    const t = start('<p id="a">Learn more about <a>x</a>.</p>', { collectUntranslated: true })
    ;($('#a').lastChild as Text).data = '!'
    await settle()
    expect(text('#a')).toBe('了解 x！')
    expect($('#a').childNodes).toHaveLength(3)
    expect(t.drainUntranslated()).toEqual([])
  })

  it('重译与忽略区域：换词典后按新语境重算；忽略区域内不处理', () => {
    const t = start('<p id="a">Learn more about <a>x</a>.</p><div class="markdown-body"><p id="m">Learn more about <a>x</a>.</p></div>')
    expect(text('#m')).toBe('Learn more about x.')
    t.setMatcher(createMatcher([['common', { static: { Version: '版本' } }]]))
    expect(text('#a')).toBe('Learn more about x.')
    t.setMatcher(createMatcher(BUNDLE))
    expect(text('#a')).toBe('了解 x。')
  })

  it('与语境同组（只隔注释）：整组命中时译文写入标点节点，整组不再命中后标点照常转换', () => {
    const t = start('<p id="d"><b>x</b>: <!-- -->Recently updated</p>', {
      matcher: createMatcher(BUNDLE, { custom: { ': Recently updated': '：最近更新时间' } })
    })
    expect(text('#d')).toBe('x：最近更新时间')
    t.setMatcher(createMatcher(BUNDLE))
    expect(text('#d')).toBe('x：最近更新')
    t.stop()
    expect(text('#d')).toBe('x: Recently updated')
  })

  it('页面反复改回半角：未超上限时每次照常转全角，超过后保持半角；不记未翻译；stop 后还原', async () => {
    const t = start('<p id="a">Learn more about <a>octocat</a>.</p>', {
      host: FIXED_CLOCK_HOST,
      collectUntranslated: true
    })
    expect(text('#a')).toBe('了解 octocat。')
    const punct = $('#a').lastChild as Text
    for (let i = 1; i <= FIGHT_LIMIT; i++) {
      punct.data = '.'
      await settle()
      expect(text('#a'), `第 ${i} 次改回`).toBe('了解 octocat。')
    }
    punct.data = '.'
    await settle()
    expect(text('#a')).toBe('了解 octocat.')
    expect(t.drainUntranslated().map(([source]) => source)).toEqual(['octocat'])
    t.stop()
    expect(text('#a')).toBe('Learn more about octocat.')
  })

  it('两个元素之间的逗号被页面反复改回：未超上限时每次照常转顿号', async () => {
    start('<p id="b">Contributed to <a>octocat</a>, <a>hubot</a></p>', { host: FIXED_CLOCK_HOST })
    expect(text('#b')).toBe('贡献于 octocat、hubot')
    const comma = $('#b a').nextSibling as Text
    for (let i = 1; i <= FIGHT_LIMIT; i++) {
      comma.data = ', '
      await settle()
      expect(text('#b'), `第 ${i} 次改回`).toBe('贡献于 octocat、hubot')
    }
  })

  it('单独包在 span 里的标点按 span 的位置与 span 外的语境判断', () => {
    // pulls 合并描述：This pull request was merged <relative-time/><span class="ml-n1">.</span>
    start(`<span id="a">Learn more about <a>x</a><span class="ml-n1">.</span></span>
      <span id="b">Unknown words <a>x</a><span class="ml-n1">.</span></span>
      <span id="c">Version <span>1</span><span>.</span><span>5</span></span>
      <span id="d">Contributed to <a>a</a><span>,</span> <a>b</a></span>
      <span id="e">Learn more about <a>x</a><span>.</span>Recently updated</span>
      <span id="f">Learn more about <a>x</a><b>.</b></span>`)
    expect(text('#a')).toBe('了解 x。')
    expect(text('#b')).toBe('Unknown words x.')
    expect(text('#c')).toBe('版本 1.5')
    expect(text('#d')).toBe('贡献于 a, b')
    expect(text('#e')).toBe('了解 x.最近更新')
    expect(text('#f')).toBe('了解 x.')
  })

  it('单独包在 span 里的标点：span 外的语境变化、后补进或被移除时重算；stop 后还原', async () => {
    const t = start(
      '<p id="a">Learn more about <a>x</a><span>.</span></p><p id="b"><a>y</a><span>.</span></p>' +
        '<p id="c">Learn more about <a>z</a><span>.</span></p>'
    )
    expect(text('#a')).toBe('了解 x。')
    expect(text('#b')).toBe('y.')
    ;($('#a').firstChild as Text).data = 'Something else entirely '
    $('#b').prepend('Learn more about ')
    $('#c').firstChild!.remove()
    await settle()
    expect(text('#a')).toBe('Something else entirely x.')
    expect(text('#b')).toBe('了解 y。')
    expect(text('#c')).toBe('z.')
    t.stop()
    expect(text('#b')).toBe('Learn more about y.')
  })
})

describe('整句各段都包在元素里：包着标点的 span 没有直接文本兄弟时，语境取前一个兄弟元素里最后一段文字', () => {
  const SPANNED: LocaleBundle = [
    ...BUNDLE,
    [
      'common',
      {
        static: {
          "Please follow this repository's": '请遵守此存储库的',
          'contributing guidelines': '贡献指南',
          'security policy': '安全策略',
          and: '和',
          'code of conduct': '行为准则',
          'You are viewing a previous version of this ruleset. This ruleset has been modified since this version. See the':
            '你正在查看此规则集的旧版本。此版本之后规则集已被修改。查看',
          'latest version': '最新版本'
        }
      }
    ]
  ]
  const LINKS = ['contributing guidelines', 'security policy', 'code of conduct']

  /**
   * 议题评论框下方的贡献须知（ContributorFooter）：<span>Please follow this repository's </span><span>{链接}</span><span>.</span>；
   * 链接之间是 <span>, </span>，末个链接前是 <span> </span><span>and {链接}</span>
   */
  function footer(id: string, names: readonly string[]): string {
    const links = names.map((name, i) => `<a href="/octo-org/${i}">${name}</a>`)
    const last = links.pop()!
    const head = links.map((link, i) => `${link}<span>${i < links.length - 1 ? ', ' : ' '}</span>`).join('')
    return (
      `<span data-testid="contributor-footer-text" id="${id}"><span>Please follow this repository's </span>` +
      `<span>${links.length > 0 ? `${head}<span>and ${last}</span>` : last}</span><span>.</span></span>`
    )
  }

  /** 规则集历史版本提示（RulesetPage） */
  const RULESET =
    '<span id="ruleset"><span class="d-inline">You are viewing a previous version of this ruleset. ' +
    'This ruleset has been modified since this version. See the </span><a href="/x">latest version</a><span>.</span></span>'

  const spanned = (): Partial<TranslatorOptions> => ({ matcher: createMatcher(SPANNED) })

  it('贡献须知（三个、两个、一个链接）与规则集提示：分隔的逗号用顿号，句号转全角；stop 后还原', () => {
    const t = start(footer('three', LINKS) + footer('two', LINKS.slice(0, 2)) + footer('one', LINKS.slice(0, 1)) + RULESET, spanned())
    expect(text('#three')).toBe('请遵守此存储库的 贡献指南、安全策略 和 行为准则。')
    expect(text('#two')).toBe('请遵守此存储库的 贡献指南 和 安全策略。')
    expect(text('#one')).toBe('请遵守此存储库的 贡献指南。')
    expect(text('#ruleset')).toBe('你正在查看此规则集的旧版本。此版本之后规则集已被修改。查看 最新版本。')
    t.stop()
    expect(text('#three')).toBe("Please follow this repository's contributing guidelines, security policy and code of conduct.")
  })

  it('前一个元素里的文字不是本引擎写入的中文（话题、团队、仓库名等用户内容）：不转换', () => {
    start(
      '<span id="topics"><a href="/topics/vue"><span>vue</span></a><span>, </span>' +
        '<a href="/topics/octocat"><span>octocat</span></a></span>' +
        '<span id="teams"><span>Contributed to</span><span><a href="/octo-org">octo-org</a><span>, </span>' +
        '<a href="/vuejs/core">vuejs/core</a></span><span>.</span></span>',
      spanned()
    )
    expect(text('#topics')).toBe('vue, octocat')
    expect(text('#teams')).toBe('贡献于octo-org, vuejs/core.')
  })

  it('团队名与词条同名（审查摘要 on behalf of 后的团队列表）：团队名不翻译，分隔符保持半角', () => {
    const bundle: LocaleBundle = [...SPANNED, ['common', { static: { 'on behalf of': '代表', Sample: '示例' } }]]
    const team = (name: string, last: boolean): string =>
      `<span class="nestedTeamList__abc12"><a data-hovercard-type="team" href="/orgs/octo-org/teams/${name}">` +
      `<span>${name}</span></a>${last ? '' : '<span class="separator__abc12">, </span>'}</span>`
    const t = start(`<span id="teams">on behalf of ${team('octo-team', false)}${team('Sample', false)}${team('web', true)}</span>`, {
      matcher: createMatcher(bundle)
    })
    expect(text('#teams')).toBe('代表 octo-team, Sample, web')
    t.stop()
    expect(text('#teams')).toBe('on behalf of octo-team, Sample, web')
  })

  it('外层标点的语境在内层元素里、隔着内层末尾的分隔符：语境文字改写后两处都重算，与全新处理相同', async () => {
    const t = start('<span id="nested"><span><b>Learn more about</b><span>, </span></span><span>.</span></span>', spanned())
    expect(text('#nested')).toBe('了解，。')
    ;($('#nested b').firstChild as Text).data = 'Sample text'
    await settle()
    const changed = text('#nested')
    expect(changed).toBe('Sample text, .')
    t.stop()
    t.start()
    expect(text('#nested')).toBe(changed)
  })

  it('链接文字改成未收录的英文后标点写回原文，改回后再转全角：与全新处理相同', async () => {
    const t = start(footer('three', LINKS) + footer('one', LINKS.slice(0, 1)), spanned())
    ;($('#three a').firstChild as Text).data = 'Sample text'
    ;($('#one a').firstChild as Text).data = 'Something else entirely'
    await settle()
    const changed = [text('#three'), text('#one')]
    expect(changed).toEqual(['请遵守此存储库的 Sample text, 安全策略 和 行为准则。', '请遵守此存储库的 Something else entirely.'])
    t.stop()
    t.start()
    expect([text('#three'), text('#one')]).toEqual(changed)
    ;($('#one a').firstChild as Text).data = 'contributing guidelines'
    await settle()
    expect(text('#one')).toBe('请遵守此存储库的 贡献指南。')
  })

  it('句号已在、链接后补进或整体替换时转全角；链接被移除后写回原文：与全新处理相同', async () => {
    const t = start(
      footer('late', LINKS.slice(0, 1)).replace(/<a [^>]*>contributing guidelines<\/a>/, '') +
        footer('swap', LINKS.slice(0, 1)).replace('contributing guidelines', 'Sample text') +
        footer('gone', LINKS.slice(0, 1)),
      spanned()
    )
    expect([text('#late'), text('#swap'), text('#gone')]).toEqual([
      '请遵守此存储库的 .',
      '请遵守此存储库的 Sample text.',
      '请遵守此存储库的 贡献指南。'
    ])
    const link = (): HTMLElement => Object.assign(element('a', 'contributing guidelines'), { href: '/octo-org/0' })
    $('#late > span:nth-child(2)').append(link())
    $('#swap a').replaceWith(link())
    $('#gone a').remove()
    await settle()
    const changed = [text('#late'), text('#swap'), text('#gone')]
    expect(changed).toEqual(['请遵守此存储库的 贡献指南。', '请遵守此存储库的 贡献指南。', '请遵守此存储库的 .'])
    t.stop()
    t.start()
    expect([text('#late'), text('#swap'), text('#gone')]).toEqual(changed)
  })

  it.each([
    ['translate', 'no'],
    ['contenteditable', 'true'],
    ['data-gcn-ignore', '']
  ])('语境所在元素加上 %s="%s"、其中的译文还原：标点写回原文，与全新处理相同', async (name, value) => {
    const shown = (): string[] => ['#one', '#first', '#links'].map(text)
    const t = start(footer('one', LINKS.slice(0, 1)) + footer('first', LINKS) + footer('links', LINKS), spanned())
    $('#one a').setAttribute(name, value)
    $('#first a').setAttribute(name, value)
    // 全部链接所在的元素
    $('#links > span:nth-child(2)').setAttribute(name, value)
    await settle()
    const changed = shown()
    expect(changed).toEqual([
      '请遵守此存储库的 contributing guidelines.',
      '请遵守此存储库的 contributing guidelines, 安全策略 和 行为准则。',
      '请遵守此存储库的 contributing guidelines, security policy and code of conduct.'
    ])
    t.stop()
    t.start()
    expect(shown()).toEqual(changed)
  })

  it('语境是合并区域：整段写入后转全角，整段不再命中后写回原文；与全新处理相同', async () => {
    const bundle: LocaleBundle = [...SPANNED, ['common', { static: { 'Press K to search': '按 K 搜索' }, mergeText: ['.hint'] }]]
    const shown = (): string[] => ['#hit', '#miss'].map(text)
    const t = start(
      '<span id="hit"><span class="hint">Sample <b>K</b> text</span><span>.</span></span>' +
        '<span id="miss"><span class="hint">Press <b>K</b> to search</span><span>.</span></span>',
      { matcher: createMatcher(bundle) }
    )
    expect(shown()).toEqual(['Sample K text.', '按 K 搜索。'])
    ;($('#hit .hint').firstChild as Text).data = 'Press '
    ;($('#hit .hint').lastChild as Text).data = ' to search'
    ;($('#miss .hint').lastChild as Text).data = ' to jump'
    await settle()
    const changed = shown()
    expect(changed).toEqual(['按 K 搜索。', 'Press K to jump.'])
    t.stop()
    t.start()
    expect(shown()).toEqual(changed)
  })

  it('语境是行内句宿主：槽位改为数字、重判后整句写入时转全角，改回后写回原文；与全新处理相同', async () => {
    const bundle: LocaleBundle = [...SPANNED, ['common', { inline: [['{#} commits merged', '{#} 个提交已合并']] }]]
    const shown = (): string[] => ['#hit', '#miss'].map(text)
    const t = start(
      '<span id="hit"><span><b>many</b> commits merged</span><span>.</span></span>' +
        '<span id="miss"><span><b>3</b> commits merged</span><span>.</span></span>',
      { matcher: createMatcher(bundle) }
    )
    expect(shown()).toEqual(['many commits merged.', '3 个提交已合并。'])
    ;($('#hit b').firstChild as Text).data = '3'
    ;($('#miss b').firstChild as Text).data = 'many'
    await settle()
    const changed = shown()
    expect(changed).toEqual(['3 个提交已合并。', 'many commits merged.'])
    t.stop()
    t.start()
    expect(shown()).toEqual(changed)
  })
})
