import { afterEach, describe, expect, it } from 'vitest'
import { patternKey } from '../../../src/core/inline-key'
import { createMatcher, type Matcher } from '../../../src/core/matcher'
import { detectPages } from '../../../src/core/page'
import { createTranslator, type Translator } from '../../../src/core/translator'
import type { PageDictionary, PageKey } from '../../../src/core/types'
import { zhCN } from '../../../src/locales/zh-CN/index'
import cnStacks from '../../../src/locales/zh-CN/pulls/stacks'
import { zhTW } from '../../../src/locales/zh-TW/index'
import twStacks from '../../../src/locales/zh-TW/pulls/stacks'

/** 期望译文：[简体, 繁体] */
type Pair = readonly [cn: string, tw: string]

const LIST_URL = 'https://github.com/octocat/hello-world/stacks?state=completed&page=2'
const DETAIL_URL = 'https://github.com/octocat/hello-world/stack/12'
const PULL_URL = 'https://github.com/octocat/hello-world/pull/42'

/** 堆栈页的作用域（列表与详情相同）：common → repository → pulls */
const SCOPE: readonly PageKey[] = detectPages(new URL(LIST_URL))
/** 堆栈页未归入拉取请求作用域时的作用域 */
const REPO_ONLY: readonly PageKey[] = ['common', 'repository']

interface Locale {
  readonly name: string
  /** 期望译文在 Pair 中的下标 */
  readonly index: 0 | 1
  readonly dict: PageDictionary
  /** 只含堆栈词典：检查词条本身 */
  readonly own: Matcher
  /** 正式语言包：检查页面上的实际效果 */
  readonly full: Matcher
}

const LOCALES: readonly Locale[] = [
  { name: 'zh-CN', index: 0, dict: cnStacks, own: createMatcher([['pulls', cnStacks]]), full: createMatcher(zhCN) },
  { name: 'zh-TW', index: 1, dict: twStacks, own: createMatcher([['pulls', twStacks]]), full: createMatcher(zhTW) },
]

/** 新增的全局词条 */
const STATIC_CASES: readonly (readonly [string, Pair])[] = [
  ['More Actions', ['更多操作', '更多動作']],
  ['Open Pull requests navigation', ['打开拉取请求导航', '開啟拉取請求導覽']],
  [
    'Unable to perform this operation. Please check your internet connection and try again later.',
    ['无法执行此操作。请检查网络连接并稍后重试。', '無法執行此操作。請檢查網路連線並稍後再試。'],
  ],
  [
    'The server is currently unable to perform this operation. Please try again later.',
    ['服务器当前无法执行此操作。请稍后重试。', '伺服器目前無法執行此操作。請稍後再試。'],
  ],
  [
    'Unable to read response from the server. Please try again later.',
    ['无法读取服务器的响应。请稍后重试。', '無法讀取伺服器的回應。請稍後再試。'],
  ],
  [
    'You need to sign in again to perform this action. Please refresh the page and try again.',
    ['你需要重新登录才能执行此操作。请刷新页面后重试。', '你需要重新登入才能執行此動作。請重新整理頁面後再試一次。'],
  ],
]

/** 堆栈创建横幅的堆栈引用不是链接时，相邻文本节点连成的整段：由 header.ts 的堆栈编号正则处理 */
const JOINED_CASES: readonly (readonly [string, Pair])[] = [
  ['This pull request was added to stack #4', ['此拉取请求已添加到堆栈 #4', '此拉取請求已加入堆疊 #4']],
  ['This pull request was added to stack #1024', ['此拉取请求已添加到堆栈 #1024', '此拉取請求已加入堆疊 #1024']],
  ['Stack #4', ['堆栈 #4', '堆疊 #4']],
]
const JOINED_MISSES: readonly string[] = [
  'This pull request was added to stack',
  'This pull request was added to stack #abc',
  'This pull request was added to #4',
]

/** 行内句：{} 为元素槽位 */
const INLINE_CASES: readonly (readonly [string, Pair])[] = [
  [
    'This pull request can be stacked with other pull requests. {}',
    ['此拉取请求可以与其他拉取请求堆叠。{}', '此拉取請求可以和其他拉取請求堆疊。{}'],
  ],
  ['This pull request was added to {}', ['此拉取请求已添加到{}', '此拉取請求已加入{}']],
  [
    'This pull request can be added to {}. Review and update the stack when you’re ready.',
    ['此拉取请求可添加到{}。准备好后审查并更新堆栈。', '此拉取請求可加入{}。準備好後審查並更新堆疊。'],
  ],
  [
    'This pull request and other pull requests can be added to {}. Review and update the stack when you’re ready.',
    [
      '此拉取请求及其他拉取请求可添加到{}。准备好后审查并更新堆栈。',
      '此拉取請求和其他拉取請求可加入{}。準備好後審查並更新堆疊。',
    ],
  ],
]

/** 已有的拉取请求词条：堆栈页归入拉取请求作用域后才生效 */
const SCOPED_EXISTING: readonly (readonly [string, Pair])[] = [
  ['Stacks', ['堆栈', '堆疊']],
  ['Sort by Newest', ['按最新排序', '依最新排序']],
  ['Sort by Oldest', ['按最早排序', '依最舊排序']],
  ['3 pull requests in this stack', ['此堆栈中有 3 个拉取请求', '此堆疊中有 3 個拉取請求']],
  ['Pull requests in stack #12', ['堆栈 #12 中的拉取请求', '堆疊 #12 中的拉取請求']],
  ['Stack #12', ['堆栈 #12', '堆疊 #12']],
  ['Pull request stack, position 2 of 3', ['拉取请求堆栈，3 个中的第 2 个', '拉取請求堆疊，共 3 個中的第 2 個']],
  ['Unstack', ['取消堆叠', '取消堆疊']],
  ['Links copied!', ['链接已复制！', '已複製連結！']],
  ["You don't have permission", ['你没有权限', '你沒有權限']],
]

describe('堆栈页作用域', () => {
  it('列表、详情都归入拉取请求', () => {
    expect(SCOPE).toEqual(['common', 'repository', 'pulls'])
    expect(detectPages(new URL(DETAIL_URL))).toEqual(SCOPE)
  })
})

describe.each(LOCALES)('$name 堆栈词条', ({ index, dict, own, full }) => {
  it('全局词条：正式语言包中生效', () => {
    expect(Object.keys(dict.static ?? {}).sort()).toEqual(STATIC_CASES.map(([source]) => source).sort())
    for (const [source, pair] of STATIC_CASES) {
      expect(own.translate(source, SCOPE)).toBe(pair[index])
      expect(full.translate(source, SCOPE)).toBe(pair[index])
    }
  })

  it('Stack：只在拉取请求作用域内', () => {
    expect(Object.keys(dict.scoped ?? {})).toEqual(['Stack'])
    const expected: Pair = ['堆栈', '堆疊']
    expect(own.translate('Stack', SCOPE)).toBe(expected[index])
    expect(full.translate('Stack', SCOPE)).toBe(expected[index])
    expect(own.translate('Stack', ['common', 'repository', 'issues'])).toBeUndefined()
  })

  it('堆栈创建横幅整段：不在堆栈词典，由 header.ts 的堆栈编号正则处理', () => {
    expect(dict.regexp).toBeUndefined()
    for (const [source, pair] of JOINED_CASES) {
      expect(own.translate(source, SCOPE)).toBeUndefined()
      expect(full.translate(source, SCOPE)).toBe(pair[index])
    }
    for (const source of JOINED_MISSES) expect(full.translate(source, SCOPE)).toBeUndefined()
  })

  it('行内句', () => {
    expect((dict.inline ?? []).map(([source]) => source)).toEqual(INLINE_CASES.map(([source]) => source))
    for (const [source, pair] of INLINE_CASES) {
      expect(own.translateInline(patternKey(source), SCOPE)).toBe(pair[index])
      expect(full.translateInline(patternKey(source), SCOPE)).toBe(pair[index])
    }
  })

  it.each(SCOPED_EXISTING)('已有词条在堆栈页生效：%s', (source, pair) => {
    expect(full.translate(source, SCOPE)).toBe(pair[index])
    expect(full.translate(source, REPO_ONLY)).not.toBe(pair[index])
  })
})

/** 去掉注释：客户端渲染时 React 的相邻文本节点之间没有服务端渲染插入的 <!-- --> */
function stripComments(node: Node): void {
  for (const child of [...node.childNodes]) {
    if (child.nodeType === Node.COMMENT_NODE) node.removeChild(child)
    else stripComments(child)
  }
}

/** 按 url 推断作用域，翻译 html；client 为 true 时按客户端渲染（相邻文本节点之间没有注释） */
function render(html: string, matcher: Matcher, url: string, client = false): Translator {
  document.body.innerHTML = html
  if (client) stripComments(document.body)
  const translator = createTranslator({ matcher, host: window, resolvePages: () => detectPages(new URL(url)) })
  translator.start()
  return translator
}

/** 元素的显示文字（空白折叠） */
function shown(id: string): string {
  return (document.getElementById(id)?.textContent ?? '').replace(/\s+/g, ' ').trim()
}

function label(id: string): string | null | undefined {
  return document.getElementById(id)?.getAttribute('aria-label')
}

/** 堆栈列表（已完成、第 2 页）：结构同 RepoStacksList、StackListRow、StacksSortMenu、Primer Pagination */
const LIST_HTML = `
  <div class="hide-lg hide-xl mb-3">
    <button type="button" aria-labelledby="sidebar-tip"><svg aria-hidden="true"></svg></button>
    <span id="sidebar-tip" role="tooltip" aria-hidden="true">Open Pull requests navigation</span>
  </div>
  <div data-testid="stacks-content">
    <h1 id="title">Stacks</h1>
    <div>
      <h2 class="sr-only" id="list-title">Completed stacks</h2>
      <div>
        <ul>
          <li><a href="/octocat/hello-world/stacks"><div id="filter-open">Open</div><span>12</span></a></li>
          <li><a href="/octocat/hello-world/stacks?state=completed" aria-current="true"
            ><div id="filter-completed">Completed</div><span>3</span></a></li>
        </ul>
        <div role="toolbar" aria-label="Actions">
          <button type="button" aria-haspopup="true" aria-label="Sort by Oldest" id="sort"
            ><svg aria-hidden="true"></svg><span>Sort</span></button>
          <button type="button" aria-haspopup="true" aria-labelledby="more-tip"><svg aria-hidden="true"></svg></button>
          <span id="more-tip" role="tooltip" aria-hidden="true">More Actions</span>
        </div>
      </div>
      <ul data-listview-component="items-list" role="list" aria-labelledby="list-title">
        <li role="listitem" id="row" aria-label="#5. More information available below.">
          <div data-listview-item-title-container>
            <h3><a href="/octocat/hello-world/stack/5"><span>#5</span></a></h3>
            <p><svg aria-hidden="true"></svg><span id="warning"
              >Unmergeable due to a closed PR<!-- --> <a href="/octocat/hello-world/pull/34">#<!-- -->34</a></span></p>
          </div>
          <div>
            <span id="merged"><span>2</span> merged</span>
            <span id="unmerged"><span>1</span> unmerged</span>
          </div>
        </li>
      </ul>
    </div>
    <nav aria-label="Pagination" id="pager">
      <a href="/octocat/hello-world/stacks?state=completed" rel="prev" aria-label="Previous Page" id="prev">Previous</a>
      <a href="/octocat/hello-world/stacks?state=completed" aria-label="Page 1" id="page-1">1</a>
      <em aria-current="page">2</em>
      <span aria-disabled="true" id="next">Next</span>
    </nav>
  </div>
  <ul role="menu">
    <li role="none"><span id="sort-heading">Sort by</span></li>
    <li role="menuitemradio" aria-checked="false"><span id="sort-newest">Newest</span></li>
    <li role="menuitemradio" aria-checked="true"><span id="sort-oldest">Oldest</span></li>
  </ul>
  <p id="empty">There are no completed stacks</p>`

/** 堆栈详情：结构同 RepoStackDetail、StackActionsMenu、UnstackDialog、StackBadge */
const DETAIL_HTML = `
  <div data-testid="stacks-content">
    <a href="/octocat/hello-world/stacks" id="back"><svg aria-hidden="true"></svg>Back to stacks</a>
    <div>
      <h1>#<!-- -->12</h1>
      <div>
        <span class="sr-only" id="base-label">Base branch:</span>
        <span data-component="BranchName" id="base-ref">main</span>
        <svg aria-hidden="true"></svg>
        <span><svg aria-hidden="true"></svg><span aria-hidden="true">3</span
          ><span class="sr-only" id="size">3<!-- --> pull requests in this stack</span></span>
      </div>
      <span id="merged"><span>1</span> merged</span>
      <button type="button" aria-haspopup="true" aria-labelledby="options-tip"><svg aria-hidden="true"></svg></button>
      <span id="options-tip" role="tooltip" aria-hidden="true">More options</span>
    </div>
    <h2 class="sr-only" id="list-title">Pull requests in stack #12</h2>
    <ul data-listview-component="items-list" role="list" aria-labelledby="list-title">
      <li role="listitem">
        <button type="button" aria-haspopup="dialog" aria-label="Pull request stack, position 2 of 3" id="badge"
          ><svg aria-hidden="true"></svg>2<!-- -->/<!-- -->3</button>
      </li>
    </ul>
  </div>
  <ul role="menu">
    <li role="menuitem"><span id="copy">Copy pull request links</span></li>
    <li role="menuitem"><span aria-hidden="true" id="copied">Links copied!</span
      ><span class="sr-only" id="copied-sr">Pull request links copied</span></li>
    <li role="menuitem"><span aria-hidden="true" id="copy-failed">Failed to copy</span
      ><span class="sr-only" id="copy-failed-sr">Failed to copy pull request links</span></li>
    <li role="none"></li>
    <li role="menuitem" aria-disabled="true"><span id="unstack">Unstack pull requests</span
      ><span id="no-permission">You don't have permission</span><span id="locked">This stack cannot be unstacked</span></li>
  </ul>
  <div role="dialog" aria-modal="true" aria-labelledby="dialog-title">
    <h1 id="dialog-title">Are you sure you want to unstack these pull requests?</h1>
    <button type="button" aria-label="Close" id="dialog-close"><svg aria-hidden="true"></svg></button>
    <div id="dialog-message">Auto-merge will be disabled for this stack. All pull requests will be removed from the stack. Their base branches will not be retargeted and their commit histories will remain the same.</div>
    <div class="mt-2"><div data-variant="critical" id="dialog-error"
      ><svg aria-hidden="true"></svg>Unable to perform this operation. Please check your internet connection and try again later.</div></div>
    <span class="sr-only" aria-live="polite" id="dialog-live">Checking whether auto-merge is enabled for this stack.</span>
    <button type="button"><span id="dialog-cancel">Cancel</span></button>
    <button type="button" aria-disabled="true" disabled><span id="dialog-unstack">Unstack</span></button>
  </div>
  <div role="dialog" aria-modal="true">
    <h1 id="badge-loading">Stack </h1>
    <h1 id="badge-title"><a href="/octocat/hello-world/stack/12">Stack #<!-- -->12</a></h1>
    <p id="badge-error">Failed to load stack data.</p>
  </div>`

/** 拉取请求页：可堆叠横幅（CanStackBanner）、堆栈横幅（StackCreatedBanner）、预览堆栈对话框的说明（PreviewStackDescription） */
const PULL_HTML = `
  <section aria-label="Can Stack Banner" id="can-stack">
    <div id="can-stack-text">This pull request can be stacked with other pull requests.<!-- --> <a href="https://gh.io/stacks-overview">Learn more about stacks</a></div>
  </section>
  <section aria-label="Stack Updated Banner" tabindex="-1" id="banner">
    <div id="added-link">This pull request was added to <a href="/octocat/hello-world/stack/4">stack #4</a></div>
  </section>
  <div id="added-text">This pull request was added to <!-- -->stack #4</div>
  <div id="created-link"><a href="/octocat/hello-world/stack/4">Stack #4</a> was created successfully</div>
  <p id="preview-link">This pull request can be added to <span><a href="/octocat/hello-world/stack/4">stack #<!-- -->4</a></span>. Review and update the stack when you’re ready.</p>
  <p id="preview-text">This pull request can be added to <span>stack #4</span>. Review and update the stack when you’re ready.</p>
  <p id="preview-others">This pull request and other pull requests can be added to <span><a href="/octocat/hello-world/stack/4">stack #<!-- -->4</a></span>. Review and update the stack when you’re ready.</p>`

describe.each(LOCALES)('$name 堆栈页面', ({ index, full }) => {
  const t = (pair: Pair): string => pair[index]
  let translator: Translator | undefined

  afterEach(() => {
    translator?.stop()
    translator = undefined
    document.body.innerHTML = ''
  })

  it('堆栈列表', () => {
    translator = render(LIST_HTML, full, LIST_URL)
    expect(shown('sidebar-tip')).toBe(t(['打开拉取请求导航', '開啟拉取請求導覽']))
    expect(shown('title')).toBe(t(['堆栈', '堆疊']))
    expect(shown('list-title')).toBe(t(['已完成的堆栈', '已完成的堆疊']))
    expect(shown('filter-open')).toBe(t(['打开', '開放中']))
    expect(shown('filter-completed')).toBe('已完成')
    expect(label('sort')).toBe(t(['按最早排序', '依最舊排序']))
    expect(shown('sort')).toBe('排序')
    expect(shown('more-tip')).toBe(t(['更多操作', '更多動作']))
    expect(label('row')).toBe(t(['#5。更多信息见下方。', '#5。下方有更多資訊。']))
    expect(shown('warning')).toBe(t(['因有已关闭的拉取请求而无法合并 #34', '因有已關閉的 PR 而無法合併 #34']))
    expect(shown('merged')).toBe(t(['2 个已合并', '2 個已合併']))
    expect(shown('unmerged')).toBe(t(['1 个未合并', '1 個未合併']))
    expect(label('pager')).toBe(t(['分页', '分頁']))
    expect([label('prev'), shown('prev')]).toEqual([t(['上一页', '上一頁']), t(['上一页', '上一頁'])])
    expect(label('page-1')).toBe(t(['第 1 页', '第 1 頁']))
    expect(shown('next')).toBe(t(['下一页', '下一頁']))
    expect(shown('sort-heading')).toBe(t(['排序依据', '排序依據']))
    expect([shown('sort-newest'), shown('sort-oldest')]).toEqual(['最新', t(['最早', '最舊'])])
    expect(shown('empty')).toBe(t(['没有已完成的堆栈', '沒有已完成的堆疊']))
  })

  it('堆栈详情', () => {
    translator = render(DETAIL_HTML, full, DETAIL_URL)
    expect(shown('back')).toBe(t(['返回堆栈列表', '返回堆疊清單']))
    expect(shown('base-label')).toBe(t(['基础分支：', '基底分支：']))
    expect(shown('base-ref')).toBe('main')
    expect(shown('size')).toBe(t(['此堆栈中有 3 个拉取请求', '此堆疊中有 3 個拉取請求']))
    expect(shown('merged')).toBe(t(['1 个已合并', '1 個已合併']))
    expect(shown('options-tip')).toBe(t(['更多选项', '更多選項']))
    expect(shown('list-title')).toBe(t(['堆栈 #12 中的拉取请求', '堆疊 #12 中的拉取請求']))
    expect(label('badge')).toBe(t(['拉取请求堆栈，3 个中的第 2 个', '拉取請求堆疊，共 3 個中的第 2 個']))
  })

  it('堆栈操作菜单', () => {
    translator = render(DETAIL_HTML, full, DETAIL_URL)
    expect(shown('copy')).toBe(t(['复制拉取请求链接', '複製拉取請求連結']))
    expect(shown('copied')).toBe(t(['链接已复制！', '已複製連結！']))
    expect(shown('copied-sr')).toBe(t(['拉取请求链接已复制', '已複製拉取請求連結']))
    expect(shown('copy-failed')).toBe(t(['复制失败', '無法複製']))
    expect(shown('copy-failed-sr')).toBe(t(['复制拉取请求链接失败', '無法複製拉取請求連結']))
    expect(shown('unstack')).toBe(t(['取消堆叠拉取请求', '取消堆疊拉取請求']))
    expect(shown('no-permission')).toBe(t(['你没有权限', '你沒有權限']))
    expect(shown('locked')).toBe(t(['此堆栈无法取消堆叠', '此堆疊無法取消堆疊']))
  })

  it('取消堆叠对话框', () => {
    translator = render(DETAIL_HTML, full, DETAIL_URL)
    expect(shown('dialog-title')).toBe(t(['确定要取消堆叠这些拉取请求吗？', '確定要取消堆疊這些拉取請求嗎？']))
    expect(label('dialog-close')).toBe(t(['关闭', '關閉']))
    expect(shown('dialog-message')).toBe(
      t([
        '此堆栈的自动合并将被禁用。所有拉取请求都将从堆栈中删除。其基础分支不会重新指定且提交历史记录保持不变。',
        '此堆疊的自動合併將會停用。所有拉取請求都將從堆疊中移除。其基底分支不會重新指定且提交歷史記錄維持不變。',
      ]),
    )
    expect(shown('dialog-error')).toBe(
      t(['无法执行此操作。请检查网络连接并稍后重试。', '無法執行此操作。請檢查網路連線並稍後再試。']),
    )
    expect(shown('dialog-live')).toBe(t(['正在检查此堆栈是否启用了自动合并。', '正在檢查此堆疊是否已啟用自動合併。']))
    expect(shown('dialog-cancel')).toBe('取消')
    expect(shown('dialog-unstack')).toBe(t(['取消堆叠', '取消堆疊']))
  })

  it('堆栈徽章对话框', () => {
    translator = render(DETAIL_HTML, full, DETAIL_URL)
    expect(shown('badge-loading')).toBe(t(['堆栈', '堆疊']))
    expect(shown('badge-title')).toBe(t(['堆栈 #12', '堆疊 #12']))
    expect(shown('badge-error')).toBe(t(['加载堆栈数据失败。', '無法載入堆疊資料。']))
  })

  it('拉取请求页：被链接拆开的堆栈句子', () => {
    translator = render(PULL_HTML, full, PULL_URL)
    expect(label('can-stack')).toBe(t(['可堆叠横幅', '可堆疊橫幅']))
    // 句号与链接之间的空格是单独的文本节点：按整句写入后“。”后不留空格
    expect(shown('can-stack-text')).toBe(
      t(['此拉取请求可以与其他拉取请求堆叠。了解堆栈', '此拉取請求可以和其他拉取請求堆疊。瞭解堆疊']),
    )
    const added = t(['此拉取请求已添加到堆栈 #4', '此拉取請求已加入堆疊 #4'])
    expect(label('banner')).toBe(t(['堆栈已更新横幅', '堆疊已更新橫幅']))
    expect(shown('added-link')).toBe(added)
    expect(shown('added-text')).toBe(added)
    expect(shown('created-link')).toBe(t(['堆栈 #4 已成功创建', '堆疊 #4 已成功建立']))
    const preview = t([
      '此拉取请求可添加到堆栈 #4。准备好后审查并更新堆栈。',
      '此拉取請求可加入堆疊 #4。準備好後審查並更新堆疊。',
    ])
    expect(shown('preview-link')).toBe(preview)
    expect(shown('preview-text')).toBe(preview)
    expect(shown('preview-others')).toBe(
      t([
        '此拉取请求及其他拉取请求可添加到堆栈 #4。准备好后审查并更新堆栈。',
        '此拉取請求和其他拉取請求可加入堆疊 #4。準備好後審查並更新堆疊。',
      ]),
    )
  })

  it('客户端渲染：相邻文本节点之间没有注释', () => {
    const cases: readonly (readonly [html: string, url: string, checks: readonly (readonly [string, Pair])[]])[] = [
      [LIST_HTML, LIST_URL, [['warning', ['因有已关闭的拉取请求而无法合并 #34', '因有已關閉的 PR 而無法合併 #34']]]],
      [
        DETAIL_HTML,
        DETAIL_URL,
        [
          ['size', ['此堆栈中有 3 个拉取请求', '此堆疊中有 3 個拉取請求']],
          ['badge-title', ['堆栈 #12', '堆疊 #12']],
        ],
      ],
      [
        PULL_HTML,
        PULL_URL,
        [
          [
            'can-stack-text',
            ['此拉取请求可以与其他拉取请求堆叠。了解堆栈', '此拉取請求可以和其他拉取請求堆疊。瞭解堆疊'],
          ],
          ['added-text', ['此拉取请求已添加到堆栈 #4', '此拉取請求已加入堆疊 #4']],
          [
            'preview-link',
            [
              '此拉取请求可添加到堆栈 #4。准备好后审查并更新堆栈。',
              '此拉取請求可加入堆疊 #4。準備好後審查並更新堆疊。',
            ],
          ],
        ],
      ],
    ]
    for (const [html, url, checks] of cases) {
      translator?.stop()
      translator = render(html, full, url, true)
      for (const [id, pair] of checks) expect(shown(id)).toBe(t(pair))
    }
  })
})
