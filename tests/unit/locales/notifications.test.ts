import { afterEach, describe, expect, it } from 'vitest'
import { IGNORE_SELECTORS } from '../../../src/core/ignore'
import { createMatcher, normalizeText } from '../../../src/core/matcher'
import { compileIgnoreIndex, elementMatches } from '../../../src/core/selectors'
import { createTranslator, type Translator } from '../../../src/core/translator'
import type { PageDictionary } from '../../../src/core/types'
import common from '../../../src/locales/zh-CN/common'
import commonUi from '../../../src/locales/zh-CN/common-ui'
import notifications from '../../../src/locales/zh-CN/notifications'

/** 以通用类型访问词条，便于用任意字符串取值 */
const dict: PageDictionary = notifications

const matcher = createMatcher([['notifications', notifications]])
/** 含通用词典，与实际页面一致：Today、Save、Filter 等通用词由 common / common-ui 翻译 */
const fullMatcher = createMatcher([
  ['common', common],
  ['common', commonUi],
  ['notifications', notifications],
])

/** 页面上实际生效的忽略选择器：全局规则 + 本页规则 */
const PAGE_IGNORE = [...IGNORE_SELECTORS, ...notifications.ignore]

function translate(text: string): string | undefined {
  return matcher.translate(text, ['common', 'notifications'])
}

function translateFull(text: string): string | undefined {
  return fullMatcher.translate(text, ['common', 'notifications'])
}

interface RegExpCase {
  /** 正例：[原文, 译文] */
  readonly hits: readonly (readonly [string, string])[]
  /** 反例：不应命中任何词条 */
  readonly misses: readonly string[]
}

/** 按词典中的正则顺序排列，每条正则至少一个正例、一个反例 */
const REGEXP_CASES: readonly RegExpCase[] = [
  // 计数
  {
    hits: [
      ['3 new notifications', '3 条新通知'],
      ['1 new notification', '1 条新通知'],
    ],
    misses: ['new notifications'],
  },
  {
    hits: [
      ['12 unread notifications', '12 条未读通知'],
      ['1 unread notification', '1 条未读通知'],
    ],
    misses: ['unread notifications'],
  },
  {
    hits: [
      ['1,234 notifications', '1,234 条通知'],
      ['1 notification', '1 条通知'],
    ],
    misses: ['Many notifications'],
  },
  {
    hits: [['Select all 25 notifications', '选择全部 25 条通知']],
    misses: ['Select all notifications'],
  },
  {
    hits: [['View all 3 notifications', '查看全部 3 条通知']],
    misses: ['View all notifications'],
  },
  {
    hits: [
      ['3 selected', '已选择 3 项'],
      ['1,000 selected', '已选择 1,000 项'],
    ],
    misses: ['All selected'],
  },
  // 分页（原文没有逗号，译文改语序）
  {
    hits: [
      ['1-25 of 380', '380 条中的第 1-25 条'],
      ['26 – 50 of 1,024', '1,024 条中的第 26-50 条'],
    ],
    misses: ['1-25 of many'],
  },
  {
    hits: [['of 380', '共 380 条']],
    misses: ['of many'],
  },
  // 订阅页条目
  {
    hits: [['#123 opened', '#123 打开于']],
    misses: ['#abc opened'],
  },
  // 搜索框限定符建议的无障碍名称（query-builder：`${值}, ${说明}, filter`；末尾的条目类型 filter 作“筛选器”）
  {
    hits: [
      ['reason, filter by notification reason, filter', 'reason，按通知原因筛选，筛选器'],
      ['is, filter by status or discussion type, filter', 'is，按状态或讨论类型筛选，筛选器'],
      ['repo, filter by repository, filter', 'repo，按存储库筛选，筛选器'],
    ],
    misses: ['reason, filter by label, filter', 'reason:, filter by notification reason, filter'],
  },
  // 已关注的存储库：按所有者取消关注
  {
    hits: [
      ["octocat's repositories", 'octocat 的存储库'],
      ['octo-org’s repositories', 'octo-org 的存储库'],
    ],
    misses: ['my repositories'],
  },
  {
    hits: [
      ["Confirm unwatching octocat's repositories", '确认取消关注 octocat 的存储库'],
      ['Confirm unwatching my-org’s repositories', '确认取消关注 my-org 的存储库'],
    ],
    misses: ['Confirm unwatching repositories', "Confirm unwatching octocat's"],
  },
  {
    hits: [
      [
        'You will stop receiving notifications for all repositories owned by octocat that you are watching.',
        '你将不再收到所关注的 octocat 名下所有存储库的通知。',
      ],
    ],
    misses: [
      'You will stop receiving notifications for all repositories owned by the octocat org that you are watching.',
    ],
  },
  // 已关注的存储库：全部取消关注
  {
    hits: [
      ['Unwatch 12 repositories', '取消关注 12 个存储库'],
      ['Unwatch 1 repository', '取消关注 1 个存储库'],
    ],
    misses: ['Unwatch repositories'],
  },
  {
    hits: [
      [
        'You will stop receiving notifications for the 12 repositories you are watching.',
        '你将不再收到所关注的 12 个存储库的通知。',
      ],
    ],
    misses: ['You will stop receiving notifications for the repositories you are watching.'],
  },
  {
    hits: [
      [
        'By unwatching these 12 repositories, you will only receive notifications when participating or @mentioned.',
        '取消关注这 12 个存储库后，只有参与或被 @提及时才会收到通知。',
      ],
    ],
    misses: ['By unwatching these repositories, you will only receive notifications when participating or @mentioned.'],
  },
  // 已关注的存储库：每个存储库的关注按钮无障碍名称
  {
    hits: [
      [
        'Unwatch: All Activity in octocat/hello-world. 7 users are watching this repository. Click to change subscription settings.',
        '取消关注：octocat/hello-world（所有活动）。7 个用户正在关注此存储库。单击可更改订阅设置。',
      ],
      [
        'Watch: Participating in octo-org/hello-world. 1 user is watching this repository. Click to change subscription settings.',
        '关注：octo-org/hello-world（参与）。1 个用户正在关注此存储库。单击可更改订阅设置。',
      ],
      [
        'Unwatch: Custom in my-org/my.repo. 1,024 users are watching this repository. Click to change subscription settings.',
        '取消关注：my-org/my.repo（自定义）。1,024 个用户正在关注此存储库。单击可更改订阅设置。',
      ],
    ],
    misses: [
      'Unwatch: All Activity in octocat. 7 users are watching this repository. Click to change subscription settings.',
      'Unwatch: Everything in octocat/hello-world. 7 users are watching this repository. Click to change subscription settings.',
    ],
  },
  {
    hits: [
      [
        'Stop ignoring in octocat/hello-world. 2 users are watching this repository. Click to change subscription settings.',
        // 原文 Stop ignoring 后没有冒号，同存储库头部
        '停止忽略 octocat/hello-world。2 个用户正在关注此存储库。单击可更改订阅设置。',
      ],
    ],
    misses: ['Stop ignoring in octocat/hello-world.'],
  },
  {
    hits: [['Subscribe to events for octocat/hello-world', '订阅 octocat/hello-world 的事件']],
    misses: ['Subscribe to events for octocat', 'Subscribe to events for octocat/hello world'],
  },
  {
    hits: [
      ['Discussions are not enabled for this repository', '此存储库未启用讨论'],
      ['Security alerts are not enabled for this repository', '此存储库未启用安全警报'],
    ],
    misses: ['Projects are not enabled for this repository'],
  },
  // ProTip（kbd 整句，快捷键文字原样保留）
  {
    hits: [
      ['When viewing a notification, press e to mark it as Done.', '查看通知时，按 e 可将其标记为完成。'],
      [
        'When viewing a notification, press shift + u to mark it as Unread.',
        '查看通知时，按 shift + u 可将其标记为未读。',
      ],
      ['When viewing a notification, press shift i to mark it as Read.', '查看通知时，按 shift i 可将其标记为已读。'],
    ],
    misses: [
      'When viewing a notification, press e to mark it as Saved.',
      'When viewing a notification, press to mark it as Done.',
    ],
  },
]

const HITS = REGEXP_CASES.flatMap((item) => item.hits)
const MISSES = REGEXP_CASES.flatMap((item) => item.misses)

describe('notifications 正则词条', () => {
  it.each(HITS)('%s → %s', (input, expected) => {
    expect(dict.static?.[input]).toBeUndefined()
    expect(dict.scoped?.[input]).toBeUndefined()
    expect(translate(input)).toBe(expected)
  })

  it.each(MISSES)('不命中：%s', (input) => {
    expect(translate(input)).toBeUndefined()
  })

  it('每条正则都有首个命中它的正例', () => {
    const rules = notifications.regexp
    const covered = new Set(HITS.map(([input]) => rules.findIndex(([pattern]) => pattern.test(input))))
    const uncovered = rules.filter((_, index) => !covered.has(index)).map(([pattern]) => String(pattern))
    expect(uncovered).toEqual([])
  })

  it('React 拆分的相邻文本节点拼接后命中', () => {
    expect(translate(normalizeText(['1', '-', '25', ' of ', '380'].join('')))).toBe('380 条中的第 1-25 条')
    expect(translate(normalizeText(['Select all ', '25', ' notifications'].join('')))).toBe('选择全部 25 条通知')
    expect(translate(normalizeText(['#', '123', ' opened'].join('')))).toBe('#123 打开于')
    expect(translate(normalizeText(['Unwatch ', '12', ' repositories'].join('')))).toBe('取消关注 12 个存储库')
  })

  it('拆开的片段单独命中', () => {
    expect(translate('When viewing a notification, press')).toBe('查看通知时，按')
    expect(translate('to mark it as Done.')).toBe('可将其标记为完成。')
    expect(translate('Filter by')).toBe('按')
    // 原文没有逗号，译文不加：按 is:unread 筛选以查看新动态。
    expect(translate("to see what's new.")).toBe('筛选以查看新动态。')
    expect(translate('Sorry, we don’t support the')).toBe('暂不支持')
    expect(translate('filter yet.')).toBe('筛选器。')
    expect(translate('selected')).toBe('项已选择')
    // 片段译文不带原文没有的标点：…Done / …iOS or Android.；产品名译中文：GitHub Mobile → GitHub 移动版
    expect(translate('then bulk select and mark all as')).toBe('筛选后批量选择并全部标记为')
    expect(translate('Triage notifications on the go with GitHub Mobile for')).toBe(
      '随时随地处理通知的 GitHub 移动版支持',
    )
  })
})

describe('notifications 静态词条', () => {
  it.each([
    ['Inbox', '收件箱'],
    ['Manage notifications', '管理通知'],
    ['Watched repositories', '已关注的存储库'],
    ['Subscriptions', '订阅'],
    ['Filter notifications', '筛选通知'],
    ['Group by: Repository', '分组依据：存储库'],
    ['Mark as read', '标记为已读'],
    ['Mark as unread', '标记为未读'],
    ['Mark as done', '标记为完成'],
    ['Move to inbox', '移到收件箱'],
    ['Unsave', '取消保存'],
    ['All caught up!', '全部处理完毕！'],
    ['Take a break, write some code, do what you do best.', '休息一下，写点代码，做你最擅长的事。'],
    // 名词 filter 作“筛选器”（侧栏筛选器、搜索框限定符）
    ["You're caught up on this filter.", '此筛选器下已全部处理。'],
    ['You’re caught up on this filter.', '此筛选器下已全部处理。'],
    ['Suggested filters', '建议的筛选器'],
    ['Learn more about filters.', '了解筛选器。'],
    ['Unwatch all', '全部取消关注'],
    ['Stop ignoring', '停止忽略'],
    ['Filter by reason', '按原因筛选'],
    ['Add new filter', '添加筛选器'],
    ['New activity appears in your inbox.', '新活动会显示在收件箱中。'],
    ['Mark all read notifications as done', '将全部已读通知标记为完成'],
    // 原文没有逗号，译文不加
    ['Notifications you save will appear here to read later.', '保存的通知会显示在这里供稍后阅读。'],
    ['Mark notifications as done so you can move on with your work.', '将通知标记为完成以继续手头的工作。'],
    [
      'Get the most out of your new inbox by quickly and easily marking all of your previously read notifications as done.',
      '将之前已读的通知一次性标记为完成以充分利用新版收件箱。',
    ],
    ['This process could take a few moments depending on the quantity.', '视数量多少可能需要一些时间。'],
    [
      'Create custom filters to quickly access your most important notifications.',
      '创建自定义筛选器以快速访问最重要的通知。',
    ],
    ['Stop watching all repositories', '取消关注全部存储库'],
    ['Clear current filters', '清除当前筛选器'],
    ['filter by status or discussion type', '按状态或讨论类型筛选'],
    // 订阅原因说明：thread 统一译作“线程”
    ['You created the thread.', '你创建了该线程。'],
    [
      'You changed the thread state (for example, closing an Issue or merging a Pull Request).',
      '你更改了线程状态（例如关闭议题或合并拉取请求）。',
    ],
    // 列表与对话框的无障碍名称、关注页确认对话框
    ['Notification filters', '通知筛选器'],
    ['Notifications by date', '按日期分组的通知'],
    ['Notifications by repository', '按存储库分组的通知'],
    ['Inbox name', '收件箱名称'],
    // 省略号随原文
    ['Filter name...', '筛选器名称...'],
    ['Filter name…', '筛选器名称…'],
    ['Filter inbox by...', '筛选收件箱...'],
    ['Subscription list', '订阅列表'],
    ['Confirm unwatching all repositories', '确认取消关注全部存储库'],
    [
      'You will stop receiving notifications for all repositories that you are watching.',
      '你将不再收到所关注的全部存储库的通知。',
    ],
  ])('%s → %s', (input, expected) => {
    expect(translate(input)).toBe(expected)
  })
})

describe('notifications 页面词条', () => {
  it.each([
    ['Participating', '参与'],
    // 侧栏筛选器：Mentioned 按术语表作“提及我的”，Team mentioned 与之并列
    ['Mentioned', '提及我的'],
    ['Team mentioned', '提及我的团队'],
    ['✋ Mentioned', '✋ 提及我的'],
    ['👀 Review requested', '👀 请求审查'],
    ['review requested', '请求审查'],
    ['ci activity', 'CI 活动'],
    // 进行体：正在关注
    ['Watching', '正在关注'],
    ['Ignore', '忽略'],
    ['Unread', '未读'],
    ['Team Mention', '团队提及'],
    // 批量操作
    ['Mark as', '标记为'],
    ['Read', '已读'],
    // 按日期分组
    ['Older', '更早'],
    // 窄屏筛选对话框、关注页与订阅页
    ['Folders', '文件夹'],
    ['Repository list', '存储库列表'],
    ['Filter by...', '筛选条件...'],
    ['Filter by…', '筛选条件…'],
    // 关注设置菜单（与存储库头部的关注菜单译法一致）
    ['Notify me:', '通知我：'],
    ['Labels:', '标签：'],
    ['Failed to update', '更新失败'],
    ['to continue.', '后继续。'],
    ['Discussions are not enabled for this repo', '此存储库未启用讨论'],
  ])('%s → %s', (input, expected) => {
    expect(translate(input)).toBe(expected)
  })

  it.each([
    ['All', '全部'],
    ['Select all', '全选'],
    ['Save', '保存'],
    ['Create', '创建'],
    ['Apply', '应用'],
    ['Today', '今天'],
    ['Yesterday', '昨天'],
    ['This week', '本周'],
    ['This month', '本月'],
    ['Not available', '不可用'],
    // 名词按钮按术语表作“筛选器”
    ['Filter', '筛选器'],
    ['Clear', '清除'],
    // 订阅页的存储库筛选下拉
    ['Select repository', '选择存储库'],
    // 侧栏文件夹、批量操作按钮（官方文档作“完成”）
    ['Done', '完成'],
  ])('通用词 %s 由 common 收录，本页不重复', (input, expected) => {
    expect(dict.static?.[input]).toBeUndefined()
    expect(dict.scoped?.[input]).toBeUndefined()
    expect(translateFull(input)).toBe(expected)
  })

  it('不在其他页面生效', () => {
    expect(matcher.translate('Folders', ['common', 'repository'])).toBeUndefined()
    expect(matcher.translate('3 selected', ['common', 'search'])).toBeUndefined()
    // ProTip 后半句依赖「Filter by is:unread」上下文，只在通知页生效
    expect(matcher.translate("to see what's new.", ['common', 'repository'])).toBeUndefined()
    expect(matcher.translate('then bulk select and mark all as', ['common', 'repository'])).toBeUndefined()
  })
})

describe('notifications 被 <kbd> 拆开的 ProTip（引擎整句匹配，按 kbd 文字切分写回）', () => {
  let translator: Translator | undefined

  afterEach(() => {
    translator?.stop()
    translator = undefined
    document.body.innerHTML = ''
  })

  // 「提示！」是全角标点结尾，后面的整句不留开头空白
  it.each([
    ['press <kbd>e</kbd> to mark it as Done.', '提示！查看通知时，按 e 可将其标记为完成。'],
    [
      'press <kbd>shift</kbd> + <kbd>u</kbd> to mark it as Unread.',
      '提示！查看通知时，按 shift + u 可将其标记为未读。',
    ],
  ])('When viewing a notification, %s', (tail, expected) => {
    document.body.innerHTML = `<p id="tip"><strong>ProTip!</strong> When viewing a notification, ${tail}</p>`
    const tip = document.getElementById('tip')!
    const keys = [...tip.querySelectorAll('kbd')].map((kbd) => kbd.textContent)
    translator = createTranslator({
      matcher: fullMatcher,
      host: window,
      resolvePages: () => ['common', 'notifications'],
      collectUntranslated: true,
    })
    translator.start()
    expect(tip.textContent?.replace(/\s+/g, ' ').trim()).toBe(expected)
    expect([...tip.querySelectorAll('kbd')].map((kbd) => kbd.textContent)).toEqual(keys)
    // 只靠片段兜底时，引擎会把整句记为未翻译
    expect(translator.drainUntranslated()).toEqual([])
  })
})

describe('notifications 自定义筛选器对话框', () => {
  let translator: Translator | undefined

  afterEach(() => {
    translator?.stop()
    translator = undefined
    document.body.innerHTML = ''
  })

  /** 同对话框内容片段：默认筛选器的名称、查询都在禁用的输入框里（宽屏、窄屏各一份） */
  function row(name: string, query: string): string {
    return `<li class="Box-row">
      <input type="text" placeholder="Filter name..." aria-label="Inbox name" value="${name}" disabled>
      <input type="text" placeholder="Filter inbox by..." aria-label="Filter inbox by…" value="${query}" disabled>
    </li>`
  }

  const DEFAULTS = [
    ['🎯 Assigned', 'reason:assign', '🎯 已分配'],
    ['💬 Participating', 'reason:participating', '💬 参与'],
    ['✋ Mentioned', 'reason:mention', '✋ 提及我的'],
    ['🙌 Team mentioned', 'reason:team-mention', '🙌 提及我的团队'],
    ['👀 Review requested', 'reason:review-requested', '👀 请求审查'],
  ] as const

  it('内容载入后：默认筛选器名称译出，查询与可编辑的输入框保持原文', async () => {
    document.body.innerHTML = '<details-dialog><div class="js-custom-inbox-dialog-content"></div></details-dialog>'
    translator = createTranslator({
      matcher: fullMatcher,
      host: window,
      resolvePages: () => ['common', 'notifications'],
      collectUntranslated: true,
    })
    translator.start()
    const rows = DEFAULTS.map(([name, query]) => row(name, query)).join('')
    document.querySelector('.js-custom-inbox-dialog-content')!.innerHTML =
      `<ul>${rows}${rows}<li><input id="custom" type="text" value="🎯 Assigned"></li></ul>`
    await new Promise((resolve) => setTimeout(resolve, 0))

    const values = [...document.querySelectorAll('input[disabled]')].map((input) => input.getAttribute('value'))
    const expected = DEFAULTS.flatMap(([, query, translated]) => [translated, query])
    expect(values).toEqual([...expected, ...expected])
    expect(document.getElementById('custom')!.getAttribute('value')).toBe('🎯 Assigned')
    const input = document.querySelector('input[disabled]')!
    expect(input.getAttribute('placeholder')).toBe('筛选器名称...')
    expect(input.getAttribute('aria-label')).toBe('收件箱名称')
    expect(translator.drainUntranslated()).toEqual([])
  })

  it('不在其他页面生效', () => {
    document.body.innerHTML = `<div class="js-custom-inbox-dialog-content"><ul>${row('🎯 Assigned', 'reason:assign')}</ul></div>`
    translator = createTranslator({ matcher: fullMatcher, host: window, resolvePages: () => ['common', 'repository'] })
    translator.start()
    expect(document.querySelector('input')!.getAttribute('value')).toBe('🎯 Assigned')
  })
})

describe('notifications 忽略选择器', () => {
  it.each(notifications.ignore)('%s 是合法选择器', (selector) => {
    expect(() => document.createElement('div').querySelector(selector)).not.toThrow()
  })

  it('引擎能为全部选择器建立索引', () => {
    const index = compileIgnoreIndex(notifications.ignore, document.createElement('div'))
    expect(index.invalid).toEqual([])
    expect(index.universal).toEqual([])
  })

  it('不重复全局忽略规则', () => {
    expect(notifications.ignore.filter((selector) => IGNORE_SELECTORS.includes(selector))).toEqual([])
  })

  it('侧栏存储库链接被忽略，筛选器与收件箱链接不被忽略', () => {
    document.body.innerHTML = `
      <a href="/notifications">Inbox</a>
      <a href="/notifications?query=is%3Asaved">Saved</a>
      <a href="/notifications?query=reason%3Aassign">Assigned</a>
      <a href="/notifications?query=repo%3Aocto-org%2Fhello-world">octo-org/hello-world</a>
      <a href="/notifications?query=repo:octocat/Done">octocat/Done</a>`
    const index = compileIgnoreIndex(notifications.ignore, document.createElement('div'))
    const ignored = (text: string): boolean =>
      Boolean([...document.querySelectorAll('a')].find((node) => node.textContent === text)?.closest(index.selector))
    expect(ignored('octo-org/hello-world')).toBe(true)
    expect(ignored('octocat/Done')).toBe(true)
    expect(ignored('Inbox')).toBe(false)
    expect(ignored('Saved')).toBe(false)
    expect(ignored('Assigned')).toBe(false)
    expect(matcher.ignoreSelectors(['common', 'notifications'])).toEqual(notifications.ignore)
    expect(matcher.ignoreSelectors(['common', 'repository'])).toEqual([])
  })

  it('搜索框的查询高亮层与尺寸测量层由全局规则忽略，搜索框旁的按钮不被忽略', () => {
    document.body.innerHTML = `
      <div class="styled-input-container">
        <div><span aria-hidden="true">reason:mention</span></div>
        <div class="styled-input-content"><span>reason</span>:<span>mention</span></div>
        <input aria-label="Search notifications" />
      </div>
      <button>Clear</button>
      <span class="Label">mention</span>`
    const index = compileIgnoreIndex(PAGE_IGNORE, document.createElement('div'))
    const ignored = (node: Element | null | undefined): boolean => Boolean(node?.closest(index.selector))
    const container = document.querySelector('.styled-input-container')
    expect([...(container?.querySelectorAll('span') ?? [])].every((node) => ignored(node))).toBe(true)
    expect(ignored(container?.querySelector('input'))).toBe(false)
    expect(ignored(document.querySelector('button'))).toBe(false)
    expect(ignored(document.querySelector('.Label'))).toBe(false)
  })

  it('query-builder 的高亮层、尺寸层与建议取值被忽略，限定符说明与条目原因不被忽略', () => {
    document.body.innerHTML = `
      <query-builder class="QueryBuilder">
        <label class="FormControl-label sr-only">Search notifications</label>
        <div class="QueryBuilder-StyledInputContainer">
          <div aria-hidden="true" class="QueryBuilder-StyledInputContent"><span><span>reason:</span><span>assign</span></span></div>
          <div class="QueryBuilder-InputWrapper">
            <div aria-hidden="true" class="QueryBuilder-Sizer">reason:assign</div>
            <input class="QueryBuilder-Input" placeholder="Search notifications" />
          </div>
        </div>
        <span class="sr-only" id="qb-clear">Clear</span>
        <ul role="listbox" aria-label="Suggestions">
          <li role="option" class="ActionListItem" data-type="filter-result">
            <span class="ActionListContent QueryBuilder-ListItem"><span class="ActionListItem-descriptionWrap">
              <span class="ActionListItem-label text-normal">reason:</span>
              <span class="ActionListItem-description" id="qb-desc">filter by notification reason</span>
            </span></span>
          </li>
          <li role="option" class="ActionListItem" data-type="filter-item">
            <span class="ActionListContent QueryBuilder-ListItem"><span class="ActionListItem-descriptionWrap">
              <span class="ActionListItem-label text-normal" id="qb-value">author</span>
            </span></span>
          </li>
        </ul>
      </query-builder>
      <span id="row-reason">author</span>`
    const index = compileIgnoreIndex(PAGE_IGNORE, document.createElement('div'))
    const ignored = (node: Element | null | undefined): boolean => Boolean(node?.closest(index.selector))
    const byId = (id: string): Element | null => document.getElementById(id)
    expect(ignored(document.querySelector('.QueryBuilder-StyledInputContent span span:last-child'))).toBe(true)
    expect(ignored(document.querySelector('.QueryBuilder-Sizer'))).toBe(true)
    expect(ignored(byId('qb-value'))).toBe(true)
    expect(ignored(document.querySelector('[data-type="filter-result"] .ActionListItem-label'))).toBe(false)
    expect(ignored(byId('qb-desc'))).toBe(false)
    expect(ignored(byId('qb-clear'))).toBe(false)
    expect(ignored(document.querySelector('label'))).toBe(false)
    expect(ignored(byId('row-reason'))).toBe(false)
    // 条目右侧的通知原因仍按词典翻译
    expect(translate('author')).toBe('作者')
    // 引擎的索引匹配与原生 matches 一致
    const elements = [...document.body.querySelectorAll('*')]
    expect(elements.filter((element) => elementMatches(index, element))).toEqual(
      elements.filter((element) => element.matches(index.selector)),
    )
  })
})
