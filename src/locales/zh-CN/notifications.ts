import type { PageDictionary } from '../../core/types'

/** 收件箱条目右侧的通知原因（小写，同 reason: 限定符） */
const REASONS: Readonly<Record<string, string>> = {
  'review requested': '请求审查',
  'approval requested': '请求批准',
  mention: '提及',
  'team mention': '团队提及',
  author: '作者',
  assign: '分配',
  assigned: '已分配',
  comment: '评论',
  commented: '已评论',
  subscribed: '已订阅',
  manual: '手动订阅',
  'state change': '状态变更',
  'ci activity': 'CI 活动',
  'security alert': '安全警报',
  'security advisory credit': '安全公告致谢',
  invitation: '邀请',
  'member feature requested': '成员功能请求',
  'your activity': '你的活动'
}

/**
 * 关注设置菜单（/watching 每个存储库的下拉，与存储库头部 Watch 菜单是同一组件）。
 * 菜单项说明、Security alerts、Get push notifications on 等由 repository 的 static 全站收录，这里只收页面词条。
 */
const WATCH_MENU: Readonly<Record<string, string>> = {
  Ignoring: '已忽略',
  Ignore: '忽略',
  Custom: '自定义',
  'Notify me:': '通知我：',
  Releases: '发行版',
  'Labels:': '标签：',
  'Failed to update': '更新失败',
  'Discussions are not enabled for this repo': '此存储库未启用讨论',
  // 关注数量上限提示句尾：请更新你的 <关注设置> 后继续。
  'to continue.': '后继续。'
}

/** 订阅页 /notifications/subscriptions 的原因筛选（首字母大写；Reason、Author、Comment、Mention 由 common 收录） */
const SUBSCRIPTION_REASONS: Readonly<Record<string, string>> = {
  Assign: '分配',
  Manual: '手动订阅',
  'Review Requested': '请求审查',
  'State Change': '状态变更',
  'Team Mention': '团队提及'
}

/** 存储库所有者名：GitHub 登录名 */
const OWNER = '([\\w.-]+)'
/** 存储库全名 owner/repo */
const REPO = '([\\w.-]+/[\\w.-]+)'
const COUNT = '(\\d[\\d,]*)'

/** 关注按钮无障碍名称：按钮文字 */
const WATCH_BUTTON: Readonly<Record<string, string>> = {
  Watch: '关注',
  Unwatch: '取消关注'
}

/** 关注按钮无障碍名称：当前订阅方式（Participating 是屏幕阅读器用的简称） */
const WATCH_SELECTION: Readonly<Record<string, string>> = {
  Participating: '参与',
  'All Activity': '所有活动',
  Ignore: '忽略',
  Custom: '自定义'
}

/** 自定义订阅对话框中未启用的事件类型 */
const THREAD_TYPES: Readonly<Record<string, string>> = {
  Issues: '议题',
  'Pull requests': '拉取请求',
  Releases: '发行版',
  Discussions: '讨论',
  'Security alerts': '安全警报'
}

/** 搜索框限定符说明（is: 按状态或讨论类型，即 issue-or-pull-request、release 等；官方文档作“按讨论类型筛选”） */
const QUALIFIER_HINTS: Readonly<Record<string, string>> = {
  'filter by repository': '按存储库筛选',
  'filter by status or discussion type': '按状态或讨论类型筛选',
  'filter by notification reason': '按通知原因筛选',
  'filter by notification author': '按通知作者筛选',
  'filter by organization': '按组织筛选'
}

/** ProTip「…press <kbd>e</kbd> to mark it as Done.」的目标状态（与侧栏、批量操作的译法一致；Done 按术语表作“完成”） */
const MARK_STATES: Readonly<Record<string, string>> = {
  Done: '完成',
  Unread: '未读',
  Read: '已读'
}

/** 默认筛选器（Participating 也是关注菜单项；Mentioned 按术语表作“提及我的”，Team mentioned 与之并列） */
const DEFAULT_FILTERS: Readonly<Record<string, string>> = {
  Assigned: '已分配',
  Participating: '参与',
  Mentioned: '提及我的',
  'Team mentioned': '提及我的团队',
  'Review requested': '请求审查'
}

/**
 * 通知：收件箱 /notifications（侧栏、筛选、分组、批量操作、空状态、横幅、ProTip）、
 * 议题与拉取请求页顶部的通知操作栏、已关注的存储库 /watching、订阅 /notifications/subscriptions。
 * 「Notifications」「Saved」「Repositories」「Subscribe」及 Filter、Clear、Save、Today 等通用词由 common 收录。
 * 词条来自登录后的采集数据（收件箱、筛选结果、订阅页、关注页）与公开资料；
 * 搜索框是 query-builder 组件，查询高亮层与尺寸层由全局忽略规则处理。
 */
export default {
  static: {
    // 侧栏
    Inbox: '收件箱',
    'Switch inbox': '切换收件箱',
    'Manage notifications': '管理通知',
    'Notification settings': '通知设置',
    'Watched repositories': '已关注的存储库',
    Subscriptions: '订阅',
    'Add new filter': '添加筛选器',
    'Create new filter': '新建筛选器',
    'New filter': '新建筛选器',
    'Custom filters': '自定义筛选器',
    'Customize filters': '自定义筛选器',
    'Edit filters': '编辑筛选器',
    'Filter name': '筛选器名称',
    'Delete filter': '删除筛选器',
    'Filter inbox by…': '筛选收件箱…',
    'Filter inbox by...': '筛选收件箱...',
    'Notification filters': '通知筛选器',
    // 自定义筛选器对话框：名称输入框
    'Inbox name': '收件箱名称',
    'Filter name...': '筛选器名称...',
    'Filter name…': '筛选器名称…',

    // 搜索框与建议（query-builder 的分组标题、提交按钮也用于全局搜索框；
    // 限定符名词 filter 作“筛选器”，同官方文档“收件箱筛选器”“支持的筛选器”与 issues 的筛选框提示）
    'Filter notifications': '筛选通知',
    'Search notifications': '搜索通知',
    'Suggested filters': '建议的筛选器',
    ...QUALIFIER_HINTS,
    "Sorry, we don't support the": '暂不支持',
    'Sorry, we don’t support the': '暂不支持',
    'filter yet.': '筛选器。',
    'Learn more about filters.': '了解筛选器。',
    '- submit': '- 提交',
    'Submit search': '提交搜索',
    'No notifications matched your query.': '没有与查询匹配的通知。',

    // 分组与排序
    'Group by': '分组依据',
    'Group by:': '分组依据：',
    'Group by: Date': '分组依据：日期',
    'Group by: Repository': '分组依据：存储库',
    'Newest to oldest': '从新到旧',
    'Oldest to newest': '从旧到新',
    // 列表的无障碍标题
    'Notifications by date': '按日期分组的通知',
    'Notifications by repository': '按存储库分组的通知',

    // 条目与批量操作、议题页顶部的通知操作栏
    'Mark as read': '标记为已读',
    'Mark as unread': '标记为未读',
    'Mark as done': '标记为完成',
    'Move to inbox': '移到收件箱',
    Unsave: '取消保存',
    'Mark all as read': '全部标记为已读',
    'Mark all as done': '全部标记为完成',
    'Mark all notifications as read': '将全部通知标记为已读',
    'Are you sure you want to mark all unread notifications as read?': '确定要将全部未读通知标记为已读吗？',
    'Back to notifications': '返回通知',
    'View all gist notifications': '查看全部代码片段通知',

    // 空状态
    'All caught up!': '全部处理完毕！',
    'Take a break, write some code, do what you do best.': '休息一下，写点代码，做你最擅长的事。',
    'Save something important': '保存重要通知',
    'Notifications you save will appear here to read later.': '保存的通知会显示在这里供稍后阅读。',
    'Mark notifications as done so you can move on with your work.': '将通知标记为完成以继续手头的工作。',
    'New activity appears in your inbox.': '新活动会显示在收件箱中。',
    'All done here!': '这里已全部处理！',
    // 当前侧栏筛选器（含自定义筛选器）下没有通知
    "You're caught up on this filter.": '此筛选器下已全部处理。',
    'You’re caught up on this filter.': '此筛选器下已全部处理。',
    'No notifications': '没有通知',
    'No new notifications': '没有新通知',

    // 横幅与清理对话框（原文没有逗号的句子，译文不加逗号，必要时用“以”连接）
    'Clear out the clutter.': '清除杂乱内容。',
    'Get the most out of your new inbox by quickly and easily marking all of your previously read notifications as done.':
      '将之前已读的通知一次性标记为完成以充分利用新版收件箱。',
    "Overwhelmed by notifications? We've found some repositories that may be causing notifications you don't need.":
      '通知太多？我们发现一些存储库可能在产生你不需要的通知。',
    'Overwhelmed by notifications? We’ve found some repositories that may be causing notifications you don’t need.':
      '通知太多？我们发现一些存储库可能在产生你不需要的通知。',
    'Update watching settings': '更新关注设置',
    'Clean up your inbox': '清理收件箱',
    'Marking your notifications as "done" helps to create a more focused inbox. Don\'t worry - if there is new activity, you\'ll still be notified.':
      '将通知标记为“完成”可让收件箱更聚焦。别担心，有新活动时你仍会收到通知。',
    'Marking your notifications as “done” helps to create a more focused inbox. Don’t worry - if there is new activity, you’ll still be notified.':
      '将通知标记为“完成”可让收件箱更聚焦。别担心，有新活动时你仍会收到通知。',
    'Mark all read notifications as done': '将全部已读通知标记为完成',
    'This process could take a few moments depending on the quantity.': '视数量多少可能需要一些时间。',
    'Bulk actions currently being processed.': '批量操作正在处理中。',
    'Bulk action processing complete.': '批量操作已处理完成。',
    "We've noticed that you rarely interact with this repository, are you sure you need notifications?":
      '你很少与此存储库互动，确定需要接收通知吗？',
    'We’ve noticed that you rarely interact with this repository, are you sure you need notifications?':
      '你很少与此存储库互动，确定需要接收通知吗？',
    'unwatch suggestions': '取消关注建议',
    'Unwatch suggestions': '取消关注建议',
    'these repositories may be causing unnecessary notifications.': '这些存储库可能在产生不必要的通知。',
    'These repositories may be causing unnecessary notifications.': '这些存储库可能在产生不必要的通知。',
    'unwatch all': '全部取消关注',
    'Unwatch all': '全部取消关注',
    'change notification settings': '更改通知设置',
    'Change notification settings': '更改通知设置',
    'you can change how you receive notifications from your account settings.': '你可以在帐户设置中更改接收通知的方式。',
    'You can change how you receive notifications from your account settings.': '你可以在帐户设置中更改接收通知的方式。',

    // ProTip（「Filter by is:unread」后半句的片段依赖上下文，放 scoped；被 kbd 拆开的句子整句见 regexp）
    // Triage notifications on the go with GitHub Mobile for iOS or Android.（产品名译中文：GitHub Mobile → GitHub 移动版）
    'Triage notifications on the go with GitHub Mobile for': '随时随地处理通知的 GitHub 移动版支持',
    'When viewing a notification, press': '查看通知时，按',
    'to mark it as Done.': '可将其标记为完成。',
    'to mark it as Unread.': '可将其标记为未读。',
    'to mark it as Read.': '可将其标记为已读。',
    'Create custom filters to quickly access your most important notifications.': '创建自定义筛选器以快速访问最重要的通知。',
    'to clean up your inbox.': '以清理收件箱。',

    // 已关注的存储库 /watching
    'Unwatch repositories by owner': '按所有者取消关注存储库',
    'Find a repository owner': '查找存储库所有者',
    'Stop watching all repositories': '取消关注全部存储库',
    'Stop ignoring': '停止忽略',
    'Sorted by most recently watched.': '按最近关注排序。',
    'Confirm unwatching all repositories': '确认取消关注全部存储库',
    'You will stop receiving notifications for all repositories that you are watching.': '你将不再收到所关注的全部存储库的通知。',

    // 订阅 /notifications/subscriptions（thread 统一译作“线程”）
    'Subscription list': '订阅列表',
    'Filter by reason': '按原因筛选',
    'Any reason': '任意原因',
    'Show all subscriptions': '显示全部订阅',
    'You were assigned to the Issue/PR.': '你被分配到该议题或拉取请求。',
    'You created the thread.': '你创建了该线程。',
    'You commented on the thread.': '你评论了该线程。',
    'You subscribed to the thread (via an Issue or Pull Request).': '你（通过议题或拉取请求）订阅了该线程。',
    'You were specifically @mentioned in the content.': '你在内容中被 @提及。',
    'You were requested for review.': '你被请求审查。',
    'You changed the thread state (for example, closing an Issue or merging a Pull Request).':
      '你更改了线程状态（例如关闭议题或合并拉取请求）。',
    'You were on a team that was mentioned.': '你所在的团队被提及。',
    'Filter repository': '筛选存储库',
    'Most recently subscribed': '最近订阅',
    'Least recently subscribed': '最早订阅',
    'Reason:': '原因：',
    'Repository:': '存储库：',
    // 按钮，同术语表 Clear filters → 清除筛选器
    'Clear current filters': '清除当前筛选器',
    '• subscribed': '• 订阅于',
    '• updated': '• 更新于'
  },
  scoped: {
    ...REASONS,
    ...WATCH_MENU,
    ...SUBSCRIPTION_REASONS,

    // 页面标题与订阅页、关注页的标签导航（进行体，按术语表作“正在关注”；common 的 Watch 是动词）
    Watching: '正在关注',
    // 侧栏文件夹 Done 与 Done 按钮同译“完成”（官方文档），由 common 收录
    // 窄屏筛选对话框中收件箱 / 已保存 / 完成的分组标题
    Folders: '文件夹',
    // 侧栏默认筛选器
    ...DEFAULT_FILTERS,
    // 窄屏（移动端）带表情符号的筛选器
    '🎯 Assigned': '🎯 已分配',
    '💬 Participating': '💬 参与',
    '✋ Mentioned': '✋ 提及我的',
    '🙌 Team mentioned': '🙌 提及我的团队',
    '👀 Review requested': '👀 请求审查',
    // 自定义筛选器对话框
    'Filter by…': '筛选条件…',
    'Filter by...': '筛选条件...',
    // 按日期分组：Today、Yesterday、This week、This month 由 common 收录
    Older: '更早',

    // 列表头部与批量操作「Mark as ▾」下拉：Read / Unread
    Unread: '未读',
    Read: '已读',
    // 数字在单独元素中：3 + selected
    selected: '项已选择',
    'Mark as': '标记为',
    'Get started': '开始使用',
    'get started': '开始使用',
    customize: '自定义',
    // 收件箱分页按钮（订阅页用 Previous）
    Prev: '上一页',
    // ProTip：Filter by is:unread to see what's new. / Filter by is:read then bulk select and mark all as Done to clean up your inbox.
    // 「mark all as <strong>Done</strong> to clean up your inbox.」按片段翻译，<strong> 两侧会留下原文空白；
    // 采集数据没有这句的 DOM（收件箱样本为空状态），未核实结构，不加 inline 整句规则
    'Filter by': '按',
    // 原文没有逗号：按 is:unread 筛选以查看新动态。
    "to see what's new.": '筛选以查看新动态。',
    'to see what’s new.': '筛选以查看新动态。',
    'then bulk select and mark all as': '筛选后批量选择并全部标记为',

    // 订阅页条目：#123 opened 3 days ago by octocat • subscribed … • updated …（opened 由 common 收录）
    by: '由',
    // 关注页列表的无障碍标题
    'Repository list': '存储库列表'
  },
  regexp: [
    // 计数
    [new RegExp(`^${COUNT} new notifications?$`), '$1 条新通知'],
    [new RegExp(`^${COUNT} unread notifications?$`), '$1 条未读通知'],
    [new RegExp(`^${COUNT} notifications?$`), '$1 条通知'],
    [new RegExp(`^Select all ${COUNT} notifications?$`), '选择全部 $1 条通知'],
    [new RegExp(`^View all ${COUNT} notifications?$`), '查看全部 $1 条通知'],
    [new RegExp(`^${COUNT} selected$`), '已选择 $1 项'],
    // 分页：1-25 of 380（数字与文字拆分时为 of 380）；原文没有逗号，改语序，同 common-ui 的「N 个中的第 X‒Y 个」
    [new RegExp(`^${COUNT} ?[-–] ?${COUNT} of ${COUNT}$`), '$3 条中的第 $1-$2 条'],
    [new RegExp(`^of ${COUNT}$`), '共 $1 条'],
    // 订阅页条目
    [/^#(\d+) opened$/, '#$1 打开于'],
    // 搜索框限定符建议的无障碍名称：reason, filter by notification reason, filter（限定符名原样保留；
    // 末尾的 filter 是条目类型，名词作“筛选器”，同 issues、actions 建议列表的「<名称>, Filter, <说明>」）
    [
      new RegExp(`^([\\w-]+), (${Object.keys(QUALIFIER_HINTS).join('|')}), filter$`),
      (_, qualifier: string, hint: string) => `${qualifier}，${QUALIFIER_HINTS[hint] ?? hint}，筛选器`
    ],

    // 已关注的存储库：按所有者取消关注
    [new RegExp(`^${OWNER}['’]s repositories$`), '$1 的存储库'],
    [new RegExp(`^Confirm unwatching ${OWNER}['’]s repositories$`), '确认取消关注 $1 的存储库'],
    [
      new RegExp(`^You will stop receiving notifications for all repositories owned by ${OWNER} that you are watching\\.$`),
      '你将不再收到所关注的 $1 名下所有存储库的通知。'
    ],
    // 已关注的存储库：全部取消关注
    [new RegExp(`^Unwatch ${COUNT} repositor(?:y|ies)$`), '取消关注 $1 个存储库'],
    [
      new RegExp(`^You will stop receiving notifications for the ${COUNT} repositor(?:y|ies) you are watching\\.$`),
      '你将不再收到所关注的 $1 个存储库的通知。'
    ],
    [
      new RegExp(
        `^By unwatching these ${COUNT} repositor(?:y|ies), you will only receive notifications when participating or @mentioned\\.$`
      ),
      '取消关注这 $1 个存储库后，只有参与或被 @提及时才会收到通知。'
    ],
    // 已关注的存储库：每个存储库的关注按钮无障碍名称（译法同存储库头部）
    [
      new RegExp(
        `^(Watch|Unwatch): (Participating|All Activity|Ignore|Custom) in ${REPO}\\. ${COUNT} users? (?:is|are) watching this repository\\. Click to change subscription settings\\.$`
      ),
      (_, button: string, selection: string, repo: string, count: string) =>
        `${WATCH_BUTTON[button] ?? button}：${repo}（${WATCH_SELECTION[selection] ?? selection}）。${count} 个用户正在关注此存储库。单击可更改订阅设置。`
    ],
    [
      new RegExp(
        `^Stop ignoring in ${REPO}\\. ${COUNT} users? (?:is|are) watching this repository\\. Click to change subscription settings\\.$`
      ),
      // 原文 Stop ignoring 后没有冒号，译文不加（同存储库头部）
      '停止忽略 $1。$2 个用户正在关注此存储库。单击可更改订阅设置。'
    ],
    // 自定义订阅对话框
    [new RegExp(`^Subscribe to events for ${REPO}$`), '订阅 $1 的事件'],
    [
      new RegExp(`^(${Object.keys(THREAD_TYPES).join('|')}) are not enabled for this repository$`),
      (_, thread: string) => `此存储库未启用${THREAD_TYPES[thread] ?? thread}`
    ],
    // ProTip：When viewing a notification, press <kbd>e</kbd> to mark it as Done.
    // 引擎按 kbd 整句匹配，译文按快捷键文字切分写回；整句未命中时用 static 中的片段
    [
      new RegExp(`^When viewing a notification, press (.+?) to mark it as (${Object.keys(MARK_STATES).join('|')})\\.$`),
      (_, key: string, state: string) => `查看通知时，按 ${key} 可将其标记为${MARK_STATES[state] ?? state}。`
    ]
  ],
  ignore: [
    // 侧栏「Repositories」列表与按存储库分组的链接：存储库名
    'a[href^="/notifications?query=repo%3A"]',
    'a[href^="/notifications?query=repo:"]',
    // 搜索建议中的限定符取值（is:unread、reason:assign 的 unread、assign，及存储库名、用户名）
    '[data-type="filter-item"] .ActionListItem-label'
  ],
  attributeRules: [
    // 自定义筛选器对话框：默认筛选器名称（🎯 Assigned 等）显示在禁用的输入框里；查询（reason:assign 等）不匹配
    [
      '.js-custom-inbox-dialog-content input[disabled]',
      'value',
      new RegExp(`^(\\S+) (${Object.keys(DEFAULT_FILTERS).join('|')})$`),
      (_, icon: string, name: string) => `${icon} ${DEFAULT_FILTERS[name] ?? name}`
    ]
  ]
} satisfies PageDictionary
