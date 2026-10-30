// @vitest-environment-options { "url": "https://github.com/octocat?tab=stars" }
import { afterEach, describe, expect, it } from 'vitest'
import { IGNORE_SELECTORS, LIST_NAME_SELECTORS } from '../../../src/core/ignore'
import { createMatcher } from '../../../src/core/matcher'
import { createTranslator, type Translator } from '../../../src/core/translator'
import type { LocaleBundle, PageKey } from '../../../src/core/types'
import { $, settle } from './helpers'

/**
 * 星标列表名称区域（LIST_NAME_SELECTORS）里的预置列表名：夹具取自星标页、列表页、星标菜单的真实结构，内容换成中性占位。
 * 区域里整段是预置名称表（listNames）的原文时译出，其余列表名是用户内容，保持原文
 */
const BUNDLE: LocaleBundle = [
  [
    'common',
    {
      // 区域外的预置名称由 static 兜底（语言包见 common-ui/actions.ts）；列表名区域里不查 static
      static: {
        Issues: '议题',
        Stars: '星标',
        'Sample text': '示例文字',
        '✨ Inspiration': '✨ 灵感',
        '2 repositories': '2 个存储库',
      },
      labels: { bug: '缺陷' },
    },
  ],
  [
    'profile',
    {
      listNames: { '🔮 Future ideas': '🔮 未来构想', '🚀 My stack': '🚀 我的技术栈', '✨ Inspiration': '✨ 灵感' },
      // 列表描述是用户内容（语言包见 profile/tabs.ts）
      ignore: ['#profile-lists-container a.Box-row > :not(.d-flex)'],
    },
  ],
]

const PROFILE: readonly PageKey[] = ['common', 'profile']

/** 星标页的列表卡片：标题在 h3 里，描述在卡片末尾 */
const CARD = (slug: string, name: string, id: string, description = ''): string =>
  `<a class="d-block Box-row Box-row--hover-gray mt-0 color-fg-default no-underline " href="/stars/octocat/lists/${slug}">\n` +
  '  <div class="d-flex flex-row flex-items-baseline flex-justify-between flex-wrap tmp-py-3">\n' +
  `    <h3 class="f4 text-bold tmp-mr-3" id="${id}">${name}</h3>\n` +
  `    <div class="color-fg-muted text-small no-wrap" id="${id}-count">2 repositories</div>\n` +
  '  </div>\n' +
  (description ? `  <span class="Truncate color-fg-muted" id="${id}-desc">${description}</span>\n` : '') +
  '</a>'

const STARS = (cards: string): string => `<div id="profile-lists-container"><div class="Box">${cards}</div></div>`

/** 列表页：标题是 h1 */
const LIST_PAGE = (name: string): string =>
  '<turbo-frame id="user-profile-frame" target="_top"><div class="position-relative">' +
  '<a href="/octocat?tab=stars" class="d-flex flex-items-center tmp-mt-3 mb-2 text-semibold">Stars</a>' +
  `<div class="tmp-my-3"><div class="d-flex flex-justify-between flex-items-center mb-2"><h1 id="title">${name}</h1></div></div>` +
  '</div></turbo-frame>'

/** 星标菜单（select-panel 版）的列表项：按钮里名称与描述分开 */
const PANEL_ITEM = (id: string, name: string, description = ''): string =>
  '<li class="ActionListItem" role="none">' +
  '<button class="ActionListContent" type="button" role="menuitemcheckbox" data-target="user-list-menu.listItems">' +
  `<span class="ActionListItem-descriptionWrap"><span class="ActionListItem-label" id="${id}">${name}</span>` +
  (description ? `<span class="ActionListItem-description" id="${id}-desc">${description}</span>` : '') +
  '</span></button></li>'

const PANEL = (items: string): string =>
  `<select-panel data-target="user-list-menu.selectPanel"><ul class="ActionListWrap" role="menu">${items}</ul></select-panel>`

/** 旧版复选框菜单：名称在 Truncate 里，或直接是 Truncate-text；建议项的 name 为 list_names[] */
const CHECKBOX = (id: string, name: string, wrapped = true): string =>
  `<label class="d-flex"><input class="js-user-list-menu-item" type="checkbox" name="${wrapped ? 'list_ids[]' : 'list_names[]'}">` +
  (wrapped
    ? `<span class="Truncate"><span class="Truncate-text" id="${id}">${name}</span></span>`
    : `<span class="Truncate-text" id="${id}">${name}</span>`) +
  '</label>'

/** React 版 SelectPanel 的选项：列表选项的 data-id 为 list-<编号> */
const OPTION = (dataId: string, id: string, name: string, description = ''): string =>
  `<li role="option" aria-selected="false" data-id="${dataId}" data-component="ActionList.Item">` +
  '<div class="ActionListContent"><span data-component="ActionList.Item--DividerContainer"><div>' +
  `<span data-component="ActionList.Item.Label" id="${id}">${name}</span>` +
  (description ? `<span data-component="ActionList.Description" id="${id}-desc">${description}</span>` : '') +
  '</div></span></div></li>'

let translator: Translator | undefined

function start(html: string, bundle: LocaleBundle = BUNDLE): Translator {
  document.body.innerHTML = html
  translator = createTranslator({
    matcher: createMatcher(bundle),
    host: window,
    collectUntranslated: true,
    resolvePages: () => PROFILE,
  })
  translator.start()
  return translator
}

const text = (selector: string): string => $(selector).textContent ?? ''
const misses = (t: Translator): string[] => t.drainUntranslated().map(([source]) => source)

afterEach(() => {
  translator?.stop()
  translator = undefined
  document.body.innerHTML = ''
})

describe('星标列表名称区域', () => {
  it('都在全局忽略列表里', () => {
    for (const selector of LIST_NAME_SELECTORS) expect(IGNORE_SELECTORS, selector).toContain(selector)
  })

  it('星标页的卡片、列表页标题：预置名称译出，计数照常翻译；stop 后还原', () => {
    const t = start(
      STARS(CARD('inspiration', '✨ Inspiration', 'insp') + CARD('my-stack', '🚀 My stack', 'stack')) +
        LIST_PAGE('🔮 Future ideas'),
    )
    expect(text('#insp')).toBe('✨ 灵感')
    expect(text('#stack')).toBe('🚀 我的技术栈')
    expect(text('#title')).toBe('🔮 未来构想')
    expect(text('#insp-count')).toBe('2 个存储库')
    expect(misses(t)).toEqual([])
    t.stop()
    expect(text('#insp')).toBe('✨ Inspiration')
    expect(text('#stack')).toBe('🚀 My stack')
    expect(text('#title')).toBe('🔮 Future ideas')
  })

  it('自定义列表名保持原文、不记未翻译：与词条、默认标签同形的，去掉表情、大小写不同的；描述同样不译', () => {
    const t = start(
      STARS(
        CARD('issues', 'Issues', 'issues') +
          CARD('bug', 'bug', 'bug') +
          CARD('inspiration', 'Inspiration', 'plain') +
          CARD('inspiration-1', '✨ inspiration', 'lower') +
          CARD('sample', 'Sample text', 'sample', '✨ Inspiration'),
      ) + LIST_PAGE('Sample text'),
    )
    for (const [id, name] of [
      ['issues', 'Issues'],
      ['bug', 'bug'],
      ['plain', 'Inspiration'],
      ['lower', '✨ inspiration'],
      ['sample', 'Sample text'],
      ['sample-desc', '✨ Inspiration'],
      ['title', 'Sample text'],
    ]) {
      expect(text(`#${id}`), id).toBe(name)
    }
    expect(misses(t)).toEqual([])
  })

  it('星标菜单（三种结构）：预置名称与建议项译出，自定义名称、列表描述保持原文、不记未翻译；非列表选项照常翻译', () => {
    const t = start(
      PANEL(PANEL_ITEM('panel-insp', '✨ Inspiration', 'Sample text') + PANEL_ITEM('panel-issues', 'Issues')) +
        `<div>${CHECKBOX('old-stack', '🚀 My stack')}${CHECKBOX('old-bug', 'bug')}${CHECKBOX('old-future', '🔮 Future ideas', false)}</div>` +
        '<ul role="listbox">' +
        OPTION('list-1', 'react-insp', '✨ Inspiration', 'Sample text') +
        OPTION('list-2', 'react-sample', 'Sample text') +
        OPTION('item-1', 'react-issues', 'Issues') +
        '</ul>',
    )
    for (const [id, name] of [
      ['panel-insp', '✨ 灵感'],
      ['panel-insp-desc', 'Sample text'],
      ['panel-issues', 'Issues'],
      ['old-stack', '🚀 我的技术栈'],
      ['old-bug', 'bug'],
      ['old-future', '🔮 未来构想'],
      ['react-insp', '✨ 灵感'],
      ['react-insp-desc', 'Sample text'],
      ['react-sample', 'Sample text'],
      ['react-issues', '议题'],
    ]) {
      expect(text(`#${id}`), id).toBe(name)
    }
    expect(misses(t)).toEqual([])
    t.stop()
    expect(text('#panel-insp')).toBe('✨ Inspiration')
    expect(text('#old-future')).toBe('🔮 Future ideas')
    expect(text('#react-insp')).toBe('✨ Inspiration')
  })

  it('区域外同样的文字照常查词典：有 static 词条的译出，没有词条的保持原文并记未翻译', () => {
    const t = start('<span id="menu">✨ Inspiration</span><span id="other">🚀 My stack</span>')
    expect(text('#menu')).toBe('✨ 灵感')
    expect(text('#other')).toBe('🚀 My stack')
    expect(misses(t)).toEqual(['🚀 My stack'])
  })

  it('标签名称区域不查列表名表：预置列表名作标签名时保持原文', () => {
    start('<span class="IssueLabel" id="label">✨ Inspiration</span><span class="IssueLabel" id="bug-label">bug</span>')
    expect(text('#label')).toBe('✨ Inspiration')
    expect(text('#bug-label')).toBe('缺陷')
  })

  it('列表名被改写（编辑列表后局部刷新）：改为预置名称时译出，改为自定义名称时保持原文', async () => {
    start(STARS(CARD('sample', 'Sample text', 'name')) + LIST_PAGE('Sample text'))
    $('#name').firstChild!.nodeValue = '🚀 My stack'
    $('#title').textContent = '✨ Inspiration'
    await settle()
    expect(text('#name')).toBe('🚀 我的技术栈')
    expect(text('#title')).toBe('✨ 灵感')
    $('#name').firstChild!.nodeValue = 'Issues'
    $('#title').textContent = 'Sample text'
    await settle()
    expect(text('#name')).toBe('Issues')
    expect(text('#title')).toBe('Sample text')
  })

  it('整个列表容器换掉（切换排序后局部加载）：新卡片里的预置名称译出', async () => {
    start(STARS(CARD('sample', 'Sample text', 'old')))
    $('#profile-lists-container').innerHTML = `<div class="Box">${CARD('inspiration', '✨ Inspiration', 'new')}</div>`
    await settle()
    expect(text('#new')).toBe('✨ 灵感')
  })

  it('没有列表名表时不翻译列表名区域', () => {
    start(STARS(CARD('inspiration', '✨ Inspiration', 'insp')), [
      ['common', { static: { '✨ Inspiration': '✨ 灵感' } }],
    ])
    expect(text('#insp')).toBe('✨ Inspiration')
  })
})
