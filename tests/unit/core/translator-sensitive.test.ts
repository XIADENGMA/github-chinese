// @vitest-environment-options { "url": "https://github.com/vuejs/core/issues" }
import { afterEach, describe, expect, it } from 'vitest'
import { createTranslator, type Translator } from '../../../src/core/translator'
import type { LocaleBundle } from '../../../src/core/types'
import { $, settle, TEST_BUNDLE, testMatcher } from './helpers'

const HOME = '/vuejs/core/issues'

/** settings 作用域另有正则与精确词条：只在设置页命中 */
const BUNDLE: LocaleBundle = [
  ...TEST_BUNDLE,
  ['settings', { scoped: { 'Panel title': '面板标题' }, regexp: [[/^Item (.+)$/, '条目 $1']] }],
  ['issues', { scoped: { Labels: '标签' } }]
]

let translator: Translator | undefined

function start(html: string): Translator {
  document.body.innerHTML = html
  translator = createTranslator({ matcher: testMatcher(undefined, BUNDLE), host: window, collectUntranslated: true })
  translator.start()
  return translator
}

afterEach(() => {
  translator?.stop()
  translator = undefined
  document.head.innerHTML = ''
  document.body.innerHTML = ''
  history.replaceState(null, '', HOME)
})

/** 敏感页上的内容：作用域词条命中的文本与属性、整组未命中的文本组、单独未命中的文本 */
const SENSITIVE_PAGE = '<p>Item alpha</p><button aria-label="Panel title"></button><span>Labels<!-- -->beta gamma</span><p>Plain note</p>'

describe('离开不收集的页面', () => {
  it('旧正文还在时（先改地址再换正文）：该页已翻译、未命中的文字都不收集；换上的正文照常收集', async () => {
    history.replaceState(null, '', '/settings/sessions')
    const t = start(SENSITIVE_PAGE)
    expect($('p').textContent).toBe('条目 alpha')
    expect(t.drainUntranslated()).toEqual([])

    history.pushState(null, '', HOME)
    // head 先变：Turbo 合并 head 时正文还没换
    document.head.append(document.createElement('meta'))
    await settle()
    expect(t.pages).toEqual(['common', 'repository', 'issues'])
    expect(t.drainUntranslated()).toEqual([])

    document.body.innerHTML = '<p>Another phrase</p>'
    await settle()
    expect(t.drainUntranslated()).toEqual([['Another phrase', 'issues', 1, 1, 1]])
  })

  it('在不收集的页面上停止、离开后再开始：留下的节点不收集', async () => {
    history.replaceState(null, '', '/settings/sessions')
    const t = start(SENSITIVE_PAGE)
    t.stop()
    history.pushState(null, '', HOME)
    t.start()
    expect(t.drainUntranslated()).toEqual([])
    document.body.insertAdjacentHTML('beforeend', '<p>Another phrase</p>')
    await settle()
    expect(t.drainUntranslated()).toEqual([['Another phrase', 'issues', 1, 1, 1]])
  })

  it('普通页面首次开始照常收集', () => {
    const t = start('<p>Plain note</p>')
    expect(t.drainUntranslated()).toEqual([['Plain note', 'issues', 1, 1, 1]])
  })
})

describe('页面类型不变的软导航', () => {
  it.each([
    // 仓库设置侧栏在 repo-content-turbo-frame 内导航，页面类型不变
    ['/vuejs/core/settings', '/vuejs/core/settings/secrets/actions', 'repo-settings'],
    ['/settings/profile', '/settings/tokens', 'settings']
  ])('%s → %s：进入后不收集，返回后新内容照常收集', async (from, to, page) => {
    history.replaceState(null, '', from)
    const t = start('<turbo-frame id="repo-content-turbo-frame"><p>General phrase</p></turbo-frame>')
    expect(t.drainUntranslated()).toEqual([['General phrase', page, 1, 1, 1]])
    const pages = t.pages

    // 帧导航：先改地址，再换帧内容
    history.pushState(null, '', to)
    $('turbo-frame').innerHTML = '<p>Hidden phrase</p><button aria-label="Rotate key"></button>'
    await settle()
    expect(t.pages).toEqual(pages)
    expect(t.drainUntranslated()).toEqual([])

    history.pushState(null, '', from)
    // 地址变化先由导航监听处理（Chrome 的 currententrychange 在 pushState 时同步触发）
    t.checkLocation()
    $('turbo-frame').innerHTML = '<p>Visible phrase</p>'
    await settle()
    expect(t.drainUntranslated()).toEqual([['Visible phrase', page, 1, 1, 1]])
  })
})

describe('离开后新旧节点拼成一句', () => {
  /** 在不收集的页面上开始，离开并检测到地址变化 */
  function leave(html: string): Translator {
    history.replaceState(null, '', '/settings/sessions')
    const t = start(html)
    history.pushState(null, '', HOME)
    t.checkLocation()
    expect(t.drainUntranslated()).toEqual([])
    return t
  }

  it.each([
    ['非空白', '<p id="x">Sample text</p>', 'Label '],
    ['纯空白', '<p id="x">Sample text</p>', ' '],
    ['隔注释', '<p id="x"><!-- -->Sample text</p>', 'Label ']
  ])('旧文本节点前插入新文本节点（%s）：整句不收集', async (_, html, inserted) => {
    const t = leave(html)
    const host = $('#x')
    host.insertBefore(document.createTextNode(inserted), host.firstChild)
    await settle()
    expect(t.drainUntranslated()).toEqual([])
  })

  it('整句不收集时组内新节点一并标记：旧节点移除后，新节点的文字也不收集', async () => {
    const t = leave('<p id="x">Sample text</p>')
    const host = $('#x')
    const old = host.firstChild!
    host.insertBefore(document.createTextNode('Label words '), old)
    await settle()
    expect(t.drainUntranslated()).toEqual([])
    old.remove()
    await settle()
    expect(host.textContent).toBe('Label words ')
    expect(t.drainUntranslated()).toEqual([])
  })

  it('kbd 句子开头插入新文字：整句不收集', async () => {
    const t = leave('<p id="x"><kbd>K</kbd> sample words</p>')
    $('#x').prepend('Press ')
    await settle()
    expect(t.drainUntranslated()).toEqual([])
  })

  it('kbd 内是旧文字、两侧是新插入的文字：整句不收集', async () => {
    const t = leave('<p id="x"><kbd>K</kbd></p>')
    $('#x').prepend('Press ')
    $('#x').append(' to open')
    await settle()
    expect(t.drainUntranslated()).toEqual([])
  })

  it('对照：离开后新元素里的文字照常收集', async () => {
    const t = leave('<p id="x">Sample text</p>')
    $('#x').insertAdjacentHTML('afterend', '<p>Another phrase</p>')
    await settle()
    expect(t.drainUntranslated()).toEqual([['Another phrase', 'issues', 1, 1, 1]])
  })
})
