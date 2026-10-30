// @vitest-environment-options { "url": "https://github.com/vuejs/core/issues/1" }
import { afterEach, describe, expect, it } from 'vitest'
import { createTranslator, type Translator } from '../../../src/core/translator'
import type { LocaleBundle, PageKey } from '../../../src/core/types'
import { $, settle, TEST_BUNDLE, testMatcher } from './helpers'

const NBSP = '\u00a0'

interface FitOptions {
  /** 收录「ProTip!」「Tip:」 */
  readonly tip?: boolean
  /** 收录「Note」 */
  readonly note?: boolean
}

function fitBundle({ tip = true, note = true }: FitOptions = {}): LocaleBundle {
  return [
    ...TEST_BUNDLE,
    [
      'common',
      {
        static: {
          ...(tip ? { 'ProTip!': '提示！', 'Tip:': '提示：' } : {}),
          ...(note ? { Note: '注意' } : {}),
          'Use the app': '使用应用',
          Description: '描述',
          '(optional)': '（可选）',
          'Profile updated —': '个人资料已更新——',
          '— Use the app': '——使用应用',
          'Suggested change': '建议的更改：',
        },
      },
    ],
  ]
}

/** 另有不会命中的行内句规则与合并选择器（正式语言包各页面类型都有） */
const WITH_RULES: LocaleBundle = [
  ...fitBundle(),
  ['common', { inline: [['Sample {} words', '{} 的示例文字']], mergeText: ['.sample-merge'] }],
]

const ISSUES: readonly PageKey[] = ['common', 'repository', 'issues']

let translator: Translator | undefined

function start(html: string, bundle = fitBundle()): Translator {
  document.body.innerHTML = html
  translator = createTranslator({
    matcher: testMatcher(undefined, bundle),
    host: window,
    resolvePages: () => ISSUES,
  })
  translator.start()
  return translator
}

const text = (selector: string): string => $(selector).textContent ?? ''

/** 同一 DOM 停止后重新开始（全新翻译）时的文字 */
function fresh(t: Translator, selector: string): string {
  t.stop()
  t.start()
  return text(selector)
}

afterEach(() => {
  translator?.stop()
  translator = undefined
  document.body.innerHTML = ''
})

describe('全角标点两侧的空白', () => {
  it('元素文字以本引擎写入的全角标点开头时，前面文本不留结尾空白', () => {
    start('<label id="l">Description <span class="color-fg-muted">(optional)</span></label>')
    expect(text('#l')).toBe('描述（可选）')
  })

  it('元素末尾不再是全角标点后，紧跟文本的开头空白恢复；反方向同样重算', async () => {
    start('<p id="a"><span>Tip:</span> Use the app</p><p id="b"><span>Note</span> Use the app</p>')
    expect(text('#a')).toBe('提示：使用应用')
    expect(text('#b')).toBe('注意 使用应用')
    ;($('#a span').firstChild as Text).data = 'Sample'
    ;($('#b span').firstChild as Text).data = 'Tip:'
    await settle()
    expect(text('#a')).toBe('Sample 使用应用')
    expect(text('#b')).toBe('提示：使用应用')
  })

  it('破折号「——」按全角标点处理', () => {
    start('<p id="p">Profile updated — <a href="#x">Use the app</a></p>')
    expect(text('#p')).toBe('个人资料已更新——使用应用')
  })

  it.each([
    ['译文不保留原文开头空白', '<p id="p"><a href="#x">Sample</a> — Use the app</p>', 'Sample——使用应用'],
    ['前面译文不留结尾空白', '<p id="p">Description <span>— Use the app</span></p>', '描述——使用应用'],
    ['前面只有空白的文字置空', '<p id="p"><span>Sample</span> <span>— Use the app</span></p>', 'Sample——使用应用'],
  ])('译文以破折号「——」开头：%s', (_, html, shown) => {
    start(html)
    expect(text('#p')).toBe(shown)
  })
})

describe('全角标点与前后文本之间隔着空白、注释、没有文字的元素', () => {
  it.each([
    ['包裹元素开头有空白', '<label id="l">Description <span> <b>(optional)</b></span></label>'],
    ['包裹元素开头有换行缩进', '<label id="l">Description <span>\n  <b>(optional)</b></span></label>'],
    ['同一层隔着注释与空白', '<label id="l">Description <!-- --> <span>(optional)</span></label>'],
  ])('%s：空白置空，前面译文不留结尾空白', (_, html) => {
    start(html)
    expect(text('#l')).toBe('描述（可选）')
  })

  it('标点文字前有 svg：标点文字改成英文后，前面译文恢复结尾空白', async () => {
    const t = start('<label id="l">Description <span><svg></svg><b>(optional)</b></span></label>')
    expect(text('#l')).toBe('描述（可选）')
    ;($('#l b').firstChild as Text).data = 'Sample'
    await settle()
    expect(text('#l')).toBe('描述 Sample')
    expect(fresh(t, '#l')).toBe('描述 Sample')
  })

  it('标点文字后有 svg：标点文字改成英文后，紧跟的译文恢复开头空白', async () => {
    const t = start('<p id="p"><span><b>Tip:</b><svg></svg></span> Use the app</p>')
    expect(text('#p')).toBe('提示：使用应用')
    ;($('#p b').firstChild as Text).data = 'Sample'
    await settle()
    expect(text('#p')).toBe('Sample 使用应用')
    expect(fresh(t, '#p')).toBe('Sample 使用应用')
  })
})

describe('全角标点旁只有空白的文字', () => {
  const PRO_TIP = `<div id="s"><span><span class="tip">ProTip!</span>${NBSP}</span><span>Use the app</span></div>`

  it('紧跟在末尾为全角标点的元素之后时置空（含 &nbsp;）；停止后还原', () => {
    const t = start(PRO_TIP)
    expect(text('#s')).toBe('提示！使用应用')
    t.stop()
    translator = undefined
    expect(text('#s')).toBe(`ProTip!${NBSP}Use the app`)
  })

  it('紧挨在开头为全角标点的元素之前时置空（该元素在同一轮稍后译出）', () => {
    start('<label id="l"><span>Description</span>\n  <span>(optional)</span></label>')
    expect(text('#l')).toBe('描述（可选）')
  })

  it('不紧邻全角标点时保持原文', () => {
    start('<p id="p"><span>Note</span> <span>Use the app</span></p>')
    expect(text('#p')).toBe('注意 使用应用')
  })

  it('元素末尾不再是全角标点时恢复原文空白，再变回时重新置空', async () => {
    start(PRO_TIP)
    const tip = $('#s .tip').firstChild as Text
    tip.data = 'Sample'
    await settle()
    expect(text('#s')).toBe(`Sample${NBSP}使用应用`)
    tip.data = 'ProTip!'
    await settle()
    expect(text('#s')).toBe('提示！使用应用')
  })

  it('插入末尾为全角标点的元素后，紧跟的空白置空', async () => {
    start('<p id="p"> <span>Use the app</span></p>')
    $('#p').prepend(Object.assign(document.createElement('span'), { textContent: 'Tip:' }))
    await settle()
    expect(text('#p')).toBe('提示：使用应用')
  })

  it('换用不收录该词条的词典后恢复原文空白', () => {
    const t = start(PRO_TIP)
    t.setMatcher(testMatcher(undefined, fitBundle({ tip: false })))
    expect(text('#s')).toBe(`ProTip!${NBSP}使用应用`)
  })

  it('忽略区域内的空白不处理（紧邻其中重新进入区域的译文）', () => {
    start(
      '<div class="markdown-body" id="body"><div class="js-suggested-changes-blob" id="blob">' +
        '<div id="header"><span>Suggested change</span></div> <div class="blob-wrapper">Sample</div></div></div>',
    )
    expect(text('#header')).toBe('建议的更改：')
    expect(text('#blob')).toBe('建议的更改： Sample')
  })
})

describe('先按当时的语境置空的空白：同一轮稍后紧邻元素不再以全角标点开头', () => {
  const LABEL = '<label id="l"><span>Description</span> <span class="opt">(optional)</span></label>'

  it('换用把紧邻元素译成不带全角标点的词典后恢复原文空白', () => {
    const t = start(LABEL)
    expect(text('#l')).toBe('描述（可选）')
    t.setMatcher(testMatcher({ custom: { '(optional)': '可选' } }, fitBundle()))
    expect(text('#l')).toBe('描述 可选')
  })

  it('换用忽略紧邻元素的词典后恢复原文空白', () => {
    const t = start(LABEL)
    t.setMatcher(testMatcher(undefined, [...fitBundle(), ['issues', { ignore: ['.opt'] }]]))
    expect(text('#l')).toBe('描述 (optional)')
  })
})

describe('两端有空白的译文先按当时的语境去掉空白：同一轮稍后紧邻元素不再以全角标点开头', () => {
  const LABEL = '<label id="l">Description <span class="opt">(optional)</span></label>'

  it('换用把紧邻元素译成不带全角标点的词典后，前面译文恢复结尾空白', () => {
    const t = start(LABEL)
    expect(text('#l')).toBe('描述（可选）')
    t.setMatcher(testMatcher({ custom: { '(optional)': '可选' } }, fitBundle()))
    expect(text('#l')).toBe('描述 可选')
    expect(fresh(t, '#l')).toBe('描述 可选')
  })

  it('换用忽略紧邻元素的词典后，前面译文恢复结尾空白', () => {
    const t = start(LABEL)
    t.setMatcher(testMatcher(undefined, [...fitBundle(), ['issues', { ignore: ['.opt'] }]]))
    expect(text('#l')).toBe('描述 (optional)')
    expect(fresh(t, '#l')).toBe('描述 (optional)')
  })
})

describe.each([
  ['只有静态词条', fitBundle()],
  ['另有行内句规则与合并选择器', WITH_RULES],
])('页面变动后，只有空白的文字变为紧邻全角标点（%s）', (_, bundle) => {
  const rewriteToSpace = (): void => {
    ;($('#s').childNodes[1] as Text).data = ' '
  }

  it.each([
    [
      '移除夹在末尾为全角标点的元素与空白之间的元素',
      `<div id="s"><span>ProTip!</span><b id="x">Sample</b>${NBSP}<span>Use the app</span></div>`,
      () => $('#x').remove(),
      '提示！使用应用',
    ],
    [
      '移除夹在空白与开头为全角标点的元素之间的元素',
      '<label id="s"><span>Description</span> <b id="x">Sample</b><span>(optional)</span></label>',
      () => $('#x').remove(),
      '描述（可选）',
    ],
    [
      '全角标点之后的文字被改写为只有空白',
      '<div id="s"><span>ProTip!</span>Sample<span>Use the app</span></div>',
      rewriteToSpace,
      '提示！使用应用',
    ],
    [
      '全角标点之前的文字被改写为只有空白',
      '<label id="s"><span>Description</span>Sample<span>(optional)</span></label>',
      rewriteToSpace,
      '描述（可选）',
    ],
    [
      '末尾为全角标点的元素之后插入只有空白的文本节点',
      '<div id="s"><span>ProTip!</span><span>Use the app</span></div>',
      () => $('#s span').after(NBSP),
      '提示！使用应用',
    ],
    [
      '开头为全角标点的元素之前插入只有空白的文本节点',
      '<label id="s"><span>Description</span><span>(optional)</span></label>',
      () => $('#s span:last-child').before(' '),
      '描述（可选）',
    ],
  ])('%s：置空，与全新翻译相同', async (_, html, change, shown) => {
    const t = start(html, bundle)
    change()
    await settle()
    expect(text('#s')).toBe(shown)
    expect(fresh(t, '#s')).toBe(shown)
  })
})

describe('孤立标点转成的全角标点旁只有空白的文字', () => {
  const NOTE = '<p id="p"><span>Note <a href="#x">Sample</a>.</span> <span>Use the app</span></p>'

  it('句末标点随中文语境转全角后，紧跟的空白置空；停止后还原', () => {
    const t = start(NOTE)
    expect(text('#p')).toBe('注意 Sample。使用应用')
    t.stop()
    translator = undefined
    expect(text('#p')).toBe('Note Sample. Use the app')
  })

  it('同样的结构一次插入（只有一条变动记录）时同样置空', async () => {
    start('<div id="root"></div>')
    const holder = document.createElement('div')
    holder.innerHTML = NOTE
    $('#root').append(...holder.childNodes)
    await settle()
    expect(text('#p')).toBe('注意 Sample。使用应用')
  })

  it('换用不收录语境文字的词典：标点写回半角，空白恢复原文', () => {
    const t = start(NOTE)
    t.setMatcher(testMatcher(undefined, fitBundle({ note: false })))
    expect(text('#p')).toBe('Note Sample. 使用应用')
  })
})

describe('文本组整体命中后置空的节点', () => {
  // 先逐个译出「file 」（译文带结尾空白），之后首段改写使整组「Edit file 」命中：译文写入首段、「file 」置空
  const GROUP = '<p id="p">Sample<!-- -->file <span>Note</span></p>'

  it('之后紧跟的元素改为以全角标点开头：仍为空，首段译文不留结尾空白', async () => {
    const t = start(GROUP)
    expect(text('#p')).toBe('Sample文件 注意')
    ;($('#p').firstChild as Text).data = 'Edit '
    await settle()
    expect(text('#p')).toBe('编辑文件 注意')
    ;($('#p span').firstChild as Text).data = '(optional)'
    await settle()
    expect(text('#p')).toBe('编辑文件（可选）')
    expect(fresh(t, '#p')).toBe('编辑文件（可选）')
  })

  it('与紧跟的元素在同一批变动中改写：同样只显示整组译文', async () => {
    const t = start(GROUP)
    ;($('#p').firstChild as Text).data = 'Edit '
    ;($('#p span').firstChild as Text).data = '(optional)'
    await settle()
    expect(text('#p')).toBe('编辑文件（可选）')
    expect(fresh(t, '#p')).toBe('编辑文件（可选）')
  })
})
