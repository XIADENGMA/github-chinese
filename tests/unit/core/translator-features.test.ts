// @vitest-environment-options { "url": "https://github.com/vuejs/core/issues" }
import { afterEach, describe, expect, it, vi } from 'vitest'
import { FIGHT_LIMIT } from '../../../src/core/records'
import { createTranslator, type Translator, type TranslatorOptions } from '../../../src/core/translator'
import type { LocaleBundle } from '../../../src/core/types'
import { $, PAGE_IGNORES, settle, TEST_BUNDLE, testMatcher, texts } from './helpers'

const HOME = '/vuejs/core/issues'
let translator: Translator | undefined
let cleanups: (() => void)[] = []

function start(html: string, options: Partial<TranslatorOptions> = {}): Translator {
  document.body.innerHTML = html
  translator = createTranslator({ matcher: testMatcher(), host: window, ...options })
  translator.start()
  return translator
}

afterEach(() => {
  for (const cleanup of cleanups) cleanup()
  cleanups = []
  translator?.stop()
  translator = undefined
  document.head.innerHTML = ''
  document.body.innerHTML = ''
  history.replaceState(null, '', HOME)
})

describe('时间元素', () => {
  it('relative-time 设 lang="zh-CN"，缺省前缀置空；light DOM 不翻译', () => {
    start('<relative-time datetime="2020-01-01T00:00:00Z">Open</relative-time>')
    const time = $('relative-time')
    expect(time.getAttribute('lang')).toBe('zh-CN')
    expect(time.getAttribute('prefix')).toBe('')
    expect(time.textContent).toBe('Open')
  })

  it('已有空前缀不改动；prefix="on" 置空；还原原值', () => {
    start(`<relative-time id="a" prefix="" lang="en"></relative-time><relative-time id="b" prefix="On "></relative-time>
      <relative-time id="c" prefix="updated"></relative-time>`)
    expect($('#a').getAttribute('prefix')).toBe('')
    expect($('#a').getAttribute('lang')).toBe('zh-CN')
    expect($('#b').getAttribute('prefix')).toBe('')
    expect($('#c').getAttribute('prefix')).toBe('updated')
    translator!.stop()
    expect($('#a').getAttribute('lang')).toBe('en')
    expect($('#a').getAttribute('prefix')).toBe('')
    expect($('#b').getAttribute('prefix')).toBe('On ')
    expect($('#c').hasAttribute('lang')).toBe(false)
  })

  it('其余前缀查词典：已收录的翻译，未收录的保持原样并计入未翻译；停止后还原', () => {
    const custom = { 'Today at': '今天' }
    start(
      '<relative-time id="a" prefix="Today at "></relative-time><relative-time id="b" prefix="Due by"></relative-time>',
      {
        matcher: testMatcher({ custom }),
        collectUntranslated: true,
      },
    )
    expect($('#a').getAttribute('prefix')).toBe('今天 ')
    expect($('#b').getAttribute('prefix')).toBe('Due by')
    expect(translator!.drainUntranslated()).toEqual([['Due by', 'issues', 2, 1, 1]])
    translator!.stop()
    expect($('#a').getAttribute('prefix')).toBe('Today at ')
  })

  it('time-ago / local-time / time-until 只设 lang 与 hour-cycle', () => {
    start('<time-ago></time-ago><local-time></local-time><time-until></time-until>')
    for (const tag of ['time-ago', 'local-time', 'time-until']) {
      expect($(tag).getAttribute('lang')).toBe('zh-CN')
      expect($(tag).getAttribute('hour-cycle')).toBe('h23')
      expect($(tag).hasAttribute('prefix')).toBe(false)
    }
  })

  it('不翻译时间元素自身的 title（由元素维护）', () => {
    start('<relative-time title="Close"></relative-time>')
    expect($('relative-time').getAttribute('title')).toBe('Close')
  })

  it('translateTime 关闭时不处理，开关切换时应用与还原', () => {
    const t = start('<relative-time></relative-time>', { translateTime: false })
    const time = $('relative-time')
    expect(time.hasAttribute('lang')).toBe(false)
    t.setFeatures({ translateTime: true })
    expect(time.getAttribute('lang')).toBe('zh-CN')
    t.setFeatures({ translateTime: false })
    expect(time.hasAttribute('lang')).toBe(false)
    expect(time.hasAttribute('prefix')).toBe(false)
  })

  it('动态插入与外部改写后重新设置', async () => {
    start('<main></main>')
    $('main').insertAdjacentHTML('beforeend', '<relative-time></relative-time>')
    await settle()
    const time = $('relative-time')
    expect(time.getAttribute('lang')).toBe('zh-CN')
    time.setAttribute('lang', 'en')
    await settle()
    expect(time.getAttribute('lang')).toBe('zh-CN')
    time.removeAttribute('prefix')
    await settle()
    expect(time.getAttribute('prefix')).toBe('')
  })

  it('忽略区域内的时间元素不处理', () => {
    start('<div class="markdown-body"><relative-time></relative-time></div>')
    expect($('relative-time').hasAttribute('lang')).toBe(false)
  })
})

describe('标签页标题', () => {
  it('按 " · " 分段翻译，未命中段保持原样', () => {
    document.head.innerHTML = '<title>Issues · vuejs/core</title>'
    start('')
    expect(document.title).toBe('议题 · vuejs/core')
  })

  it('标题变化后重新翻译', async () => {
    document.head.innerHTML = '<title>Issues · vuejs/core</title>'
    start('')
    document.title = 'Pull requests · vuejs/core'
    await settle()
    expect(document.title).toBe('拉取请求 · vuejs/core')
    ;($('title').firstChild as Text).data = 'Settings · vuejs/core'
    await settle()
    expect(document.title).toBe('设置 · vuejs/core')
  })

  it('多个文本子节点：译文写入第一个，其余置空', () => {
    document.head.innerHTML = '<title>Issues</title>'
    $('title').append(' · Search')
    start('')
    expect(texts($('title'))).toEqual(['议题 · 搜索', ''])
    translator!.stop()
    expect(texts($('title'))).toEqual(['Issues', ' · Search'])
  })

  it('不翻译 SVG 内的 title', () => {
    start('<svg><title>Issues</title></svg>')
    expect($('svg title').textContent).toBe('Issues')
  })

  it('translateTitle 开关与还原', () => {
    document.head.innerHTML = '<title>Issues · vuejs/core</title>'
    const t = start('', { translateTitle: false })
    expect(document.title).toBe('Issues · vuejs/core')
    t.setFeatures({ translateTitle: true })
    expect(document.title).toBe('议题 · vuejs/core')
    t.setFeatures({ translateTitle: false })
    expect(document.title).toBe('Issues · vuejs/core')
    t.setFeatures({ translateTitle: true })
    t.stop()
    expect(document.title).toBe('Issues · vuejs/core')
  })

  it('标题元素晚于启动插入', async () => {
    start('')
    document.head.innerHTML = '<title>Notifications</title>'
    await settle()
    expect(document.title).toBe('通知')
  })

  it('用户内容段按当前路径识别：议题标题、Wiki 页名不翻译', async () => {
    document.head.innerHTML = '<title>Settings · Issue #12 · vuejs/core</title>'
    start('<main></main>')
    expect(document.title).toBe('Settings · Issue #12 · vuejs/core')
    history.pushState(null, '', '/vuejs/core/wiki/Settings')
    document.title = 'Settings · vuejs/core Wiki'
    await settle()
    expect(document.title).toBe('Settings · vuejs/core Wiki')
    history.pushState(null, '', '/vuejs/core/wiki/_pages')
    document.title = 'Settings · vuejs/core Wiki'
    await settle()
    expect(document.title).toBe('设置 · vuejs/core Wiki')
  })
})

describe('地址变化', () => {
  it('变动回调中发现地址变化：基于原文按新页面类型重译', async () => {
    const t = start('<button>Open</button><main></main>')
    expect($('button').textContent).toBe('未解决')
    history.pushState(null, '', '/vuejs/core/pulls')
    $('main').append(document.createElement('span'))
    await settle()
    expect($('button').textContent).toBe('开启中')
    expect(t.pages).toEqual(['common', 'repository', 'pulls'])
    history.pushState(null, '', '/vuejs/core')
    expect(t.checkLocation()).toBe(true)
    expect($('button').textContent).toBe('打开')
    expect(t.checkLocation()).toBe(false)
  })

  it('页面类型不变时不重译', () => {
    const t = start('<button>Open</button>')
    history.pushState(null, '', '/vuejs/core/issues/1')
    expect(t.checkLocation()).toBe(false)
    expect($('button').textContent).toBe('未解决')
  })

  it('页面词典的忽略规则随页面类型切换，新命中区域还原', () => {
    const t = start('<div class="issue-user-content"><span title="Copy">Issues</span></div>')
    expect($('span').textContent).toBe('Issues')
    history.pushState(null, '', '/vuejs/core/pulls')
    t.checkLocation()
    expect($('span').textContent).toBe('议题')
    expect($('span').getAttribute('title')).toBe('复制')
    history.pushState(null, '', '/vuejs/core/issues')
    t.checkLocation()
    expect($('span').textContent).toBe('Issues')
    expect($('span').getAttribute('title')).toBe('Copy')
  })

  it('onLocationChange 可在回调中停止翻译', async () => {
    const onLocationChange = vi.fn(() => translator?.stop())
    start('<span>Issues</span><main></main>', { onLocationChange })
    history.pushState(null, '', '/settings')
    $('main').append(document.createElement('i'))
    await settle()
    expect(onLocationChange).toHaveBeenCalledWith('https://github.com/settings')
    expect(translator!.active).toBe(false)
    expect($('span').textContent).toBe('Issues')
  })

  it('未启动时 checkLocation 不处理', () => {
    const t = createTranslator({ matcher: testMatcher(), host: window })
    expect(t.checkLocation()).toBe(false)
  })
})

describe('匹配器更换', () => {
  it('自定义词条优先于内置词典', () => {
    start('<span>Issues</span><b>Open</b>', { matcher: testMatcher({ custom: { Issues: '问题', ' Open ': '开放' } }) })
    expect($('span').textContent).toBe('问题')
    expect($('b').textContent).toBe('开放')
  })

  it('setMatcher 基于原文重译', () => {
    const t = start('<span>Issues</span><button aria-label="Copy"></button>')
    t.setMatcher(testMatcher({ custom: { Issues: '问题', Copy: '拷贝' } }))
    expect($('span').textContent).toBe('问题')
    expect($('button').getAttribute('aria-label')).toBe('拷贝')
    t.setMatcher(testMatcher())
    expect($('span').textContent).toBe('议题')
    expect($('button').getAttribute('aria-label')).toBe('复制')
  })

  it('未启动时 setMatcher / setFeatures 只保存', () => {
    document.body.innerHTML = '<span>Issues</span>'
    const t = createTranslator({ matcher: testMatcher(), host: window })
    t.setMatcher(testMatcher({ custom: { Issues: '问题' } }))
    t.setFeatures({ translateTime: false })
    expect($('span').textContent).toBe('Issues')
    translator = t
    t.start()
    expect($('span').textContent).toBe('问题')
    expect(t.features.translateTime).toBe(false)
  })
})

describe('坏选择器', () => {
  it('非法选择器被丢弃，其余选择器照常生效', () => {
    const bundle: LocaleBundle = [...TEST_BUNDLE, ['issues', { ignore: ['[[[', 'div:::bad', '', '.keep-en'] }]]
    start('<p class="keep-en">Issues</p><p id="x">Issues</p>', { matcher: testMatcher({}, bundle) })
    expect($('.keep-en').textContent).toBe('Issues')
    expect($('#x').textContent).toBe('议题')
  })
})

describe('页面级忽略：仓库页头部面包屑', () => {
  const bundle: LocaleBundle = [
    ...TEST_BUNDLE,
    ['common', { static: { Home: '首页', Docs: '文档', 'Switch repository': '切换仓库' } }],
    ['repository', { ignore: PAGE_IGNORES.repository }],
  ]
  const header = (owner: string, repo?: string): string => `
    <header aria-label="Global navigation menu" class="GlobalNav styles-module__appHeader__YzYWk">
      <nav aria-label="Breadcrumbs" data-component="Breadcrumbs"><ol>
        <li><a id="owner" data-component="Breadcrumbs.Item" href="/${owner}"><span>${owner}</span></a></li>
        ${repo ? `<li><a id="repo" data-component="Breadcrumbs.Item" href="/${owner}/${repo}">${repo}</a><span id="tip">Switch repository</span></li>` : ''}
      </ol></nav>
    </header>`

  it('仓库页的所有者名、仓库名不翻译，切换仓库提示照常；非仓库页的界面面包屑照常翻译', () => {
    start(header('Home', 'Docs'), {
      matcher: testMatcher({}, bundle),
      resolvePages: () => ['common', 'repository', 'code'],
    })
    expect([$('#owner').textContent, $('#repo').textContent, $('#tip').textContent]).toEqual([
      'Home',
      'Docs',
      '切换仓库',
    ])
    translator!.stop()
    start(header('Notifications'), {
      matcher: testMatcher({}, bundle),
      resolvePages: () => ['common', 'notifications'],
    })
    expect($('#owner').textContent).toBe('通知')
  })
})

describe('镜像文字属性 data-content / data-text', () => {
  const custom = { Code: '代码', Insights: '洞察', Split: '拆分' }
  const NAV = `
    <nav><ul>
      <li><a class="prc-components-UnderlineItem-7fP-n" href="/o/r/issues"><span data-component="icon"></span>
        <span id="issues" data-component="text" data-content="Issues">Issues</span><span data-component="counter">546</span></a></li>
      <li><a class="prc-components-UnderlineItem-7fP-n" href="/o/r/actions"><span id="actions" data-component="text" data-content="Actions">Actions</span></a></li>
      <li><a class="prc-components-UnderlineItem-7fP-n" href="/o/r/x"><span id="diff" data-component="text" data-content="Issues">Settings</span></a></li>
    </ul></nav>
    <div class="SegmentedControl-item"><span id="split" class="Button-label" data-content="Split">Split</span></div>
    <div id="seg" class="prc-SegmentedControl-Text-7S2y2" data-text="Code">Code</div>
    <ul><li id="emoji" data-emoji-name="smile" data-text="Code">Code</li></ul>
    <div id="json" data-content='{"a":"Code"}'>Code</div>
    <div class="markdown-body"><span id="ig" data-component="text" data-content="Issues">Issues</span></div>`
  const attr = (selector: string, name: string): string | null => $(selector).getAttribute(name)
  const pair = (selector: string, name = 'data-content'): [string | null, string | null] => [
    $(selector).textContent,
    attr(selector, name),
  ]

  it('白名单内的属性随文字翻译；表情、JSON、值与文字不同、忽略区域都不动；不计入未翻译', () => {
    const t = start(NAV, { matcher: testMatcher({ custom }), collectUntranslated: true })
    expect(pair('#issues')).toEqual(['议题', '议题'])
    expect(pair('#split')).toEqual(['拆分', '拆分'])
    expect(pair('#seg', 'data-text')).toEqual(['代码', '代码'])
    expect(pair('#actions')).toEqual(['Actions', 'Actions'])
    expect(attr('#diff', 'data-content')).toBe('Issues')
    expect(attr('#emoji', 'data-text')).toBe('Code')
    expect(attr('#json', 'data-content')).toBe('{"a":"Code"}')
    expect(attr('#ig', 'data-content')).toBe('Issues')
    // Actions 只按文本（位 1）记一次，不按属性记
    expect(t.drainUntranslated().filter(([text]) => text === 'Actions')).toEqual([['Actions', 'issues', 1, 1, 1]])
  })

  it('同一批里外部改写文字与属性后重译；只改属性也同步', async () => {
    start(NAV, { matcher: testMatcher({ custom }) })
    const span = $('#issues')
    ;(span.firstChild as Text).data = 'Pull requests'
    span.setAttribute('data-content', 'Pull requests')
    await settle()
    expect(pair('#issues')).toEqual(['拉取请求', '拉取请求'])
    span.setAttribute('data-content', 'Pull requests')
    await settle()
    expect(attr('#issues', 'data-content')).toBe('拉取请求')
  })

  it('React 先改属性、后换文字时，文字到位后同步', async () => {
    start(NAV, { matcher: testMatcher({ custom }) })
    const span = $('#issues')
    span.setAttribute('data-content', 'Insights')
    await settle()
    expect(attr('#issues', 'data-content')).toBe('Insights')
    span.textContent = 'Insights'
    await settle()
    expect(pair('#issues')).toEqual(['洞察', '洞察'])
  })

  it('新插入的元素', async () => {
    start(NAV, { matcher: testMatcher({ custom }) })
    $('nav ul').insertAdjacentHTML(
      'beforeend',
      '<li><a class="prc-components-UnderlineItem-7fP-n"><span id="new" data-component="text" data-content="Insights">Insights</span></a></li>',
    )
    await settle()
    expect(pair('#new')).toEqual(['洞察', '洞察'])
  })

  it('词典变化后属性跟随新译文；文字不再翻译时还原；stop 后还原', () => {
    const t = start(NAV, { matcher: testMatcher({ custom }) })
    t.setMatcher(testMatcher({ custom: { ...custom, Issues: '问题' } }))
    expect(pair('#issues')).toEqual(['问题', '问题'])
    t.setMatcher(testMatcher({ custom: { Issues: '议题' } }))
    expect(pair('#seg', 'data-text')).toEqual(['Code', 'Code'])
    t.stop()
    expect(pair('#issues')).toEqual(['Issues', 'Issues'])
    expect(pair('#split')).toEqual(['Split', 'Split'])
  })
})

describe('未翻译收集', () => {
  it('记录未命中文本、出处、页面类型与出现次数，排除技术记号', () => {
    const t = start(
      `<p>Hello world</p><p>Hello world</p><p>https://github.com</p><p>v1.2.3</p><p>@octocat</p><p>vuejs/core</p>
      <p>a1b2c3d4e5</p><p>Oct 26, 2026</p><p>Issues</p><button title="Mystery tooltip"></button>`,
      { collectUntranslated: true },
    )
    expect(t.drainUntranslated()).toEqual([
      ['Hello world', 'issues', 1, 2, 1],
      ['Mystery tooltip', 'issues', 2, 1, 1],
    ])
    expect(t.drainUntranslated()).toEqual([])
  })

  it('整组未命中时记录拼接文本；部分命中时记录未命中的节点', () => {
    const t = start('<span>Merged <!-- -->into main</span><a>Issues<!-- -->Unknown tail</a>', {
      collectUntranslated: true,
    })
    expect(t.drainUntranslated()).toEqual([
      ['Merged into main', 'issues', 1, 1, 1],
      ['Unknown tail', 'issues', 1, 1, 1],
    ])
  })

  it('同一节点不重复计数；换页后新出现的文本计入新页面类型', async () => {
    const t = start('<p>Hello world</p>', { collectUntranslated: true })
    expect(t.drainUntranslated()).toEqual([['Hello world', 'issues', 1, 1, 1]])
    history.pushState(null, '', '/vuejs/core/pulls')
    t.checkLocation()
    expect(t.drainUntranslated()).toEqual([])
    document.body.insertAdjacentHTML('beforeend', '<p>Hello world</p>')
    await settle()
    expect(t.drainUntranslated()).toEqual([['Hello world', 'pulls', 1, 1, 1]])
  })

  it('标签页标题不收集：标题含仓库名、议题标题等用户内容，不经忽略规则', async () => {
    document.head.innerHTML = '<title>Issues · Unknown title part · vuejs/core</title>'
    const t = start('<p>Issues</p>', { collectUntranslated: true })
    expect(t.drainUntranslated()).toEqual([])
    document.title = 'New page title · vuejs/core'
    await settle()
    expect(t.drainUntranslated()).toEqual([])
  })

  it('敏感页面（令牌、密钥、账单、登录等）不收集；离开后新出现的文字照常收集', async () => {
    history.pushState(null, '', '/settings/tokens')
    try {
      const t = start('<p>Hello world</p><button aria-label="Mystery"></button>', { collectUntranslated: true })
      expect(t.drainUntranslated()).toEqual([])
      document.body.insertAdjacentHTML('beforeend', '<p>Token note</p>')
      await settle()
      expect(t.drainUntranslated()).toEqual([])
      history.pushState(null, '', '/vuejs/core/issues')
      t.checkLocation()
      document.body.insertAdjacentHTML('beforeend', '<p>Another phrase</p>')
      await settle()
      expect(t.drainUntranslated()).toEqual([['Another phrase', 'issues', 1, 1, 1]])
    } finally {
      history.replaceState(null, '', '/vuejs/core/issues')
    }
  })

  it('关闭标题翻译时不记录标题', () => {
    document.head.innerHTML = '<title>Unknown title part</title>'
    const t = start('<p>Issues</p>', { collectUntranslated: true, translateTitle: false })
    expect(t.drainUntranslated()).toEqual([])
  })

  it('默认不收集；开启后补收现有文本（不含标题），关闭时丢弃待取出的增量', async () => {
    document.head.innerHTML = '<title>Unknown title part</title>'
    const t = start('<p>Hello world</p><button aria-label="Mystery"></button>')
    expect(t.drainUntranslated()).toEqual([])
    t.setFeatures({ collectUntranslated: true })
    expect(t.drainUntranslated()).toEqual([
      ['Hello world', 'issues', 1, 1, 1],
      ['Mystery', 'issues', 2, 1, 1],
    ])
    $('p').firstChild!.textContent = 'Hello again'
    await settle()
    expect(t.drainUntranslated()).toEqual([['Hello again', 'issues', 1, 1, 1]])
    $('p').firstChild!.textContent = 'Hello once more'
    await settle()
    t.setFeatures({ collectUntranslated: false })
    expect(t.drainUntranslated()).toEqual([])
  })

  it('待取出条目数有上限', () => {
    const items = Array.from({ length: 5 }, (_, i) => `<p>Phrase number ${'x'.repeat(i + 1)}</p>`).join('')
    const t = start(items, { collectUntranslated: true, maxUntranslated: 3 })
    expect(t.drainUntranslated()).toHaveLength(3)
  })

  it('停止翻译不丢弃待取出的增量', () => {
    const t = start('<p>Hello world</p>', { collectUntranslated: true })
    t.stop()
    expect(t.drainUntranslated()).toEqual([['Hello world', 'issues', 1, 1, 1]])
  })
})

describe('对抗保护', () => {
  it('页面脚本反复改回英文时有限次后停止，不死循环', async () => {
    const t = start('<span>Issues</span>')
    const node = $('span').firstChild as Text
    const guard = new MutationObserver(() => {
      if (node.data !== 'Issues') node.data = 'Issues'
    })
    guard.observe(node, { characterData: true })
    cleanups.push(() => guard.disconnect())
    node.data = 'Issues'
    for (let i = 0; i < 5; i++) await settle()
    expect(node.data).toBe('Issues')
    const batches = t.batches
    expect(batches).toBeLessThan(FIGHT_LIMIT * 3)
    await settle()
    expect(t.batches).toBe(batches)
  })

  it('属性同样有限次后停止', async () => {
    const t = start('<button aria-label="Copy"></button>')
    const button = $('button')
    const guard = new MutationObserver(() => {
      if (button.getAttribute('aria-label') !== 'Copy') button.setAttribute('aria-label', 'Copy')
    })
    guard.observe(button, { attributes: true })
    cleanups.push(() => guard.disconnect())
    button.setAttribute('aria-label', 'Copy')
    for (let i = 0; i < 5; i++) await settle()
    expect(button.getAttribute('aria-label')).toBe('Copy')
    expect(t.batches).toBeLessThan(FIGHT_LIMIT * 3)
  })

  it('偶发的改回原文不触发保护', async () => {
    start('<span>Issues</span>')
    const node = $('span').firstChild as Text
    for (let i = 0; i < 3; i++) {
      node.data = 'Issues'
      await settle()
      expect(node.data).toBe('议题')
    }
  })
})
