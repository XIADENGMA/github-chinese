import type { PageDictionary } from '../../core/types'

/** 收件箱条目右侧的通知原因（小写，同 reason: 限定符） */
const REASONS: Readonly<Record<string, string>> = {
  'review requested': '審查請求',
  'approval requested': '核准請求',
  mention: '提及',
  'team mention': '團隊提及',
  author: '作者',
  assign: '指派',
  assigned: '已指派',
  comment: '留言',
  commented: '已留言',
  subscribed: '已訂閱',
  manual: '手動訂閱',
  'state change': '狀態變更',
  'ci activity': 'CI 活動',
  'security alert': '安全性警示',
  'security advisory credit': '安全性公告致謝',
  invitation: '邀請',
  'member feature requested': '成員功能請求',
  'your activity': '你的活動'
}

/**
 * 关注设置菜单（/watching 每个存储库的下拉，与存储库头部 Watch 菜单是同一组件）。
 * 菜单项说明、Security alerts、Get push notifications on 等由 repository 的 static 全站收录，这里只收页面词条。
 */
const WATCH_MENU: Readonly<Record<string, string>> = {
  Ignoring: '已忽略',
  Ignore: '忽略',
  Custom: '自訂',
  'Notify me:': '通知我：',
  Releases: '發行版本',
  'Labels:': '標籤：',
  'Failed to update': '無法更新',
  'Discussions are not enabled for this repo': '此儲存庫未啟用討論',
  // 关注数量上限提示句尾：請更新你的 <關注設定> 以繼續。
  'to continue.': '以繼續。'
}

/** 订阅页 /notifications/subscriptions 的原因筛选（首字母大写；Reason、Author、Comment、Mention 由 common 收录） */
const SUBSCRIPTION_REASONS: Readonly<Record<string, string>> = {
  Assign: '指派',
  Manual: '手動訂閱',
  'Review Requested': '審查請求',
  'State Change': '狀態變更',
  'Team Mention': '團隊提及'
}

/** 存储库所有者名：GitHub 登录名 */
const OWNER = '([\\w.-]+)'
/** 存储库全名 owner/repo */
const REPO = '([\\w.-]+/[\\w.-]+)'
const COUNT = '(\\d[\\d,]*)'

/** 关注按钮无障碍名称：按钮文字 */
const WATCH_BUTTON: Readonly<Record<string, string>> = {
  Watch: '關注',
  Unwatch: '取消關注'
}

/** 关注按钮无障碍名称：当前订阅方式（Participating 是屏幕阅读器用的简称） */
const WATCH_SELECTION: Readonly<Record<string, string>> = {
  Participating: '參與',
  'All Activity': '所有活動',
  Ignore: '忽略',
  Custom: '自訂'
}

/** 自定义订阅对话框中未启用的事件类型 */
const THREAD_TYPES: Readonly<Record<string, string>> = {
  Issues: '議題',
  'Pull requests': '拉取請求',
  Releases: '發行版本',
  Discussions: '討論',
  'Security alerts': '安全性警示'
}

/** 搜索框限定符说明（is: 按状态或讨论类型，即 issue-or-pull-request、release 等；filter by → 「依…篩選」） */
const QUALIFIER_HINTS: Readonly<Record<string, string>> = {
  'filter by repository': '依儲存庫篩選',
  'filter by status or discussion type': '依狀態或討論類型篩選',
  'filter by notification reason': '依通知原因篩選',
  'filter by notification author': '依通知作者篩選',
  'filter by organization': '依組織篩選'
}

/** ProTip「…press <kbd>e</kbd> to mark it as Done.」的目标状态（与侧栏、批量操作的译法一致；Done 按术语表作「完成」） */
const MARK_STATES: Readonly<Record<string, string>> = {
  Done: '完成',
  Unread: '未讀',
  Read: '已讀'
}

/**
 * 默认筛选器（Participating 也是关注菜单项；Mentioned 按术语表作「提及我的」，Team mentioned 与之并列；
 * Review requested 按术语表 review request 作「審查請求」，不作按钮义的「請求審查」）
 */
const DEFAULT_FILTERS: Readonly<Record<string, string>> = {
  Assigned: '已指派',
  Participating: '參與',
  Mentioned: '提及我的',
  'Team mentioned': '提及我的團隊',
  'Review requested': '審查請求'
}

/**
 * 通知：收件箱 /notifications（侧栏、筛选、分组、批量操作、空状态、横幅、ProTip）、
 * 议题与拉取请求页顶部的通知操作栏、已关注的存储库 /watching、订阅 /notifications/subscriptions。
 * 「Notifications」「Saved」「Repositories」「Subscribe」及 Filter、Clear、Save、Today 等通用词由 common 收录。
 * 词条来自登录后的采集数据（收件箱、筛选结果、订阅页、关注页）与公开资料；
 * 搜索框是 query-builder 组件，查询高亮层与尺寸层由全局忽略规则处理。
 * 通知的量词按术语表用「則」（3 則通知）。
 */
export default {
  static: {
    // 侧栏
    Inbox: '收件匣',
    'Switch inbox': '切換收件匣',
    'Manage notifications': '管理通知',
    'Notification settings': '通知設定',
    'Watched repositories': '已關注的儲存庫',
    Subscriptions: '訂閱',
    'Add new filter': '新增篩選器',
    'Create new filter': '建立新篩選器',
    'New filter': '新增篩選器',
    'Custom filters': '自訂篩選器',
    'Customize filters': '自訂篩選器',
    'Edit filters': '編輯篩選器',
    'Filter name': '篩選器名稱',
    'Delete filter': '刪除篩選器',
    'Filter inbox by…': '篩選收件匣…',
    'Filter inbox by...': '篩選收件匣...',
    'Notification filters': '通知篩選器',
    // 自定义筛选器对话框：名称输入框
    'Inbox name': '收件匣名稱',
    'Filter name...': '篩選器名稱...',
    'Filter name…': '篩選器名稱…',

    // 搜索框与建议（query-builder 的分组标题、提交按钮也用于全局搜索框；
    // 限定符名词 filter 作「篩選器」，同 issues 的筛选框提示；submit 按术语表作「送出」）
    'Filter notifications': '篩選通知',
    'Search notifications': '搜尋通知',
    'Suggested filters': '建議的篩選器',
    ...QUALIFIER_HINTS,
    // 「Sorry, we don't support the」+ <限定符> +「filter yet.」：尚不支援 xxx 篩選器。
    "Sorry, we don't support the": '尚不支援',
    'Sorry, we don’t support the': '尚不支援',
    'filter yet.': '篩選器。',
    'Learn more about filters.': '瞭解篩選器。',
    '- submit': '- 送出',
    'Submit search': '送出搜尋',
    'No notifications matched your query.': '沒有與查詢相符的通知。',

    // 分组与排序
    'Group by': '分組依據',
    'Group by:': '分組依據：',
    'Group by: Date': '分組依據：日期',
    'Group by: Repository': '分組依據：儲存庫',
    'Newest to oldest': '由新到舊',
    'Oldest to newest': '由舊到新',
    // 列表的无障碍标题
    'Notifications by date': '依日期分組的通知',
    'Notifications by repository': '依儲存庫分組的通知',

    // 条目与批量操作、议题页顶部的通知操作栏（mark as 按术语表作「標示為」）
    'Mark as read': '標示為已讀',
    'Mark as unread': '標示為未讀',
    'Mark as done': '標示為完成',
    'Move to inbox': '移至收件匣',
    Unsave: '取消儲存',
    'Mark all as read': '全部標示為已讀',
    'Mark all as done': '全部標示為完成',
    'Mark all notifications as read': '將所有通知標示為已讀',
    'Are you sure you want to mark all unread notifications as read?': '確定要將所有未讀通知標示為已讀嗎？',
    'Back to notifications': '返回通知',
    'View all gist notifications': '查看所有程式碼片段通知',

    // 空状态
    'All caught up!': '全部處理完畢！',
    'Take a break, write some code, do what you do best.': '休息一下，寫點程式，做你最擅長的事。',
    'Save something important': '儲存重要通知',
    'Notifications you save will appear here to read later.': '你儲存的通知會顯示在這裡供稍後閱讀。',
    'Mark notifications as done so you can move on with your work.': '將通知標示為完成以繼續手邊的工作。',
    'New activity appears in your inbox.': '新活動會顯示在收件匣中。',
    'All done here!': '這裡已全部處理完畢！',
    // 当前侧栏筛选器（含自定义筛选器）下没有通知
    "You're caught up on this filter.": '此篩選器下已全部處理完畢。',
    'You’re caught up on this filter.': '此篩選器下已全部處理完畢。',
    'No notifications': '沒有通知',
    'No new notifications': '沒有新通知',

    // 横幅与清理对话框（原文没有逗号的句子，译文不加逗号，必要时用「以」连接）
    'Clear out the clutter.': '清除雜亂內容。',
    'Get the most out of your new inbox by quickly and easily marking all of your previously read notifications as done.':
      '快速輕鬆地將先前已讀的通知全部標示為完成以充分運用新版收件匣。',
    "Overwhelmed by notifications? We've found some repositories that may be causing notifications you don't need.":
      '通知太多？我們發現一些儲存庫可能正在產生你不需要的通知。',
    'Overwhelmed by notifications? We’ve found some repositories that may be causing notifications you don’t need.':
      '通知太多？我們發現一些儲存庫可能正在產生你不需要的通知。',
    'Update watching settings': '更新關注設定',
    'Clean up your inbox': '清理收件匣',
    'Marking your notifications as "done" helps to create a more focused inbox. Don\'t worry - if there is new activity, you\'ll still be notified.':
      '將通知標示為「完成」可讓收件匣更聚焦。別擔心，有新活動時你仍會收到通知。',
    'Marking your notifications as “done” helps to create a more focused inbox. Don’t worry - if there is new activity, you’ll still be notified.':
      '將通知標示為「完成」可讓收件匣更聚焦。別擔心，有新活動時你仍會收到通知。',
    'Mark all read notifications as done': '將所有已讀通知標示為完成',
    'This process could take a few moments depending on the quantity.': '視數量多寡可能需要一些時間。',
    'Bulk actions currently being processed.': '正在處理批次動作。',
    'Bulk action processing complete.': '批次動作處理完成。',
    "We've noticed that you rarely interact with this repository, are you sure you need notifications?":
      '你很少與此儲存庫互動，確定需要接收通知嗎？',
    'We’ve noticed that you rarely interact with this repository, are you sure you need notifications?':
      '你很少與此儲存庫互動，確定需要接收通知嗎？',
    'unwatch suggestions': '取消關注建議',
    'Unwatch suggestions': '取消關注建議',
    'these repositories may be causing unnecessary notifications.': '這些儲存庫可能正在產生不必要的通知。',
    'These repositories may be causing unnecessary notifications.': '這些儲存庫可能正在產生不必要的通知。',
    'unwatch all': '全部取消關注',
    'Unwatch all': '全部取消關注',
    'change notification settings': '變更通知設定',
    'Change notification settings': '變更通知設定',
    'you can change how you receive notifications from your account settings.': '你可以在帳號設定中變更接收通知的方式。',
    'You can change how you receive notifications from your account settings.': '你可以在帳號設定中變更接收通知的方式。',

    // ProTip（「Filter by is:unread」后半句的片段依赖上下文，放 scoped；被 kbd 拆开的句子整句见 regexp）
    // Triage notifications on the go with GitHub Mobile for iOS or Android.（产品名译中文：GitHub Mobile → GitHub 行動版；
    // 片段原文无标点，译文不加逗号，拼起来是「可隨時隨地處理通知的 GitHub 行動版適用於 iOS 或 Android。」）
    'Triage notifications on the go with GitHub Mobile for': '可隨時隨地處理通知的 GitHub 行動版適用於',
    'When viewing a notification, press': '查看通知時，按',
    'to mark it as Done.': '可將其標示為完成。',
    'to mark it as Unread.': '可將其標示為未讀。',
    'to mark it as Read.': '可將其標示為已讀。',
    // access 指查看通知，不是权限义的「存取」
    'Create custom filters to quickly access your most important notifications.': '建立自訂篩選器以快速查看最重要的通知。',
    'to clean up your inbox.': '以清理收件匣。',

    // 已关注的存储库 /watching
    'Unwatch repositories by owner': '依擁有者取消關注儲存庫',
    'Find a repository owner': '尋找儲存庫擁有者',
    'Stop watching all repositories': '取消關注所有儲存庫',
    'Stop ignoring': '停止忽略',
    'Sorted by most recently watched.': '依最近關注時間排序。',
    'Confirm unwatching all repositories': '確認取消關注所有儲存庫',
    'You will stop receiving notifications for all repositories that you are watching.': '你將不再收到所有已關注儲存庫的通知。',

    // 订阅 /notifications/subscriptions（thread 按术语表统一作「討論串」；少用「被」字句）
    'Subscription list': '訂閱清單',
    'Filter by reason': '依原因篩選',
    'Any reason': '任何原因',
    'Show all subscriptions': '顯示所有訂閱',
    'You were assigned to the Issue/PR.': '該議題或 PR 已指派給你。',
    'You created the thread.': '你建立了該討論串。',
    'You commented on the thread.': '你在該討論串中留言。',
    'You subscribed to the thread (via an Issue or Pull Request).': '你（透過議題或拉取請求）訂閱了該討論串。',
    'You were specifically @mentioned in the content.': '內容中特別 @提及了你。',
    'You were requested for review.': '有人請求你審查。',
    'You changed the thread state (for example, closing an Issue or merging a Pull Request).':
      '你變更了討論串狀態（例如關閉議題或合併拉取請求）。',
    'You were on a team that was mentioned.': '有人提及了你所在的團隊。',
    'Filter repository': '篩選儲存庫',
    'Most recently subscribed': '最近訂閱',
    'Least recently subscribed': '最早訂閱',
    'Reason:': '原因：',
    'Repository:': '儲存庫：',
    // 按钮，同术语表 Clear filters → 清除篩選器
    'Clear current filters': '清除目前篩選器',
    '• subscribed': '• 訂閱於',
    '• updated': '• 更新於'
  },
  scoped: {
    ...REASONS,
    ...WATCH_MENU,
    ...SUBSCRIPTION_REASONS,

    // 页面标题与订阅页、关注页的标签导航（进行体，按术语表作「關注中」；common 的 Watch 是动词「關注」）
    Watching: '關注中',
    // 侧栏文件夹 Done 与 Done 按钮同译「完成」，由 common 收录
    // 窄屏筛选对话框中收件匣 / 已儲存 / 完成的分组标题
    Folders: '資料夾',
    // 侧栏默认筛选器
    ...DEFAULT_FILTERS,
    // 窄屏（移动端）带表情符号的筛选器
    '🎯 Assigned': '🎯 已指派',
    '💬 Participating': '💬 參與',
    '✋ Mentioned': '✋ 提及我的',
    '🙌 Team mentioned': '🙌 提及我的團隊',
    '👀 Review requested': '👀 審查請求',
    // 自定义筛选器对话框
    'Filter by…': '篩選條件…',
    'Filter by...': '篩選條件...',
    // 按日期分组：Today、Yesterday、This week、This month 由 common 收录；更早的分组作「更早」，不用排序义的「較舊」
    Older: '更早',

    // 列表头部与批量操作「Mark as ▾」下拉：Read / Unread
    Unread: '未讀',
    Read: '已讀',
    // 数字在单独元素中：3 + selected → 3 則已選取（通知的量词作「則」）
    selected: '則已選取',
    'Mark as': '標示為',
    'Get started': '開始使用',
    'get started': '開始使用',
    customize: '自訂',
    // 收件箱分页按钮（订阅页用 Previous）
    Prev: '上一頁',
    // ProTip：Filter by is:unread to see what's new. / Filter by is:read then bulk select and mark all as Done to clean up your inbox.
    // 「mark all as <strong>Done</strong> to clean up your inbox.」按片段翻译，<strong> 两侧会留下原文空白；
    // 采集数据没有这句的 DOM（收件箱样本为空状态），未核实结构，不加 inline 整句规则
    'Filter by': '依',
    // 原文没有逗号：依 is:unread 篩選以查看新動態。
    "to see what's new.": '篩選以查看新動態。',
    'to see what’s new.': '篩選以查看新動態。',
    'then bulk select and mark all as': '篩選後批次選取並全部標示為',

    // 订阅页条目：#123 opened 3 days ago by octocat • subscribed … • updated …（opened 由 common 收录）
    by: '由',
    // 关注页列表的无障碍标题
    'Repository list': '儲存庫清單'
  },
  regexp: [
    // 计数（通知的量词作「則」）
    [new RegExp(`^${COUNT} new notifications?$`), '$1 則新通知'],
    [new RegExp(`^${COUNT} unread notifications?$`), '$1 則未讀通知'],
    [new RegExp(`^${COUNT} notifications?$`), '$1 則通知'],
    [new RegExp(`^Select all ${COUNT} notifications?$`), '全選 $1 則通知'],
    [new RegExp(`^View all ${COUNT} notifications?$`), '查看全部 $1 則通知'],
    [new RegExp(`^${COUNT} selected$`), '已選取 $1 則'],
    // 分页：1-25 of 380（数字与文字拆分时为 of 380）；原文没有逗号，改语序
    [new RegExp(`^${COUNT} ?[-–] ?${COUNT} of ${COUNT}$`), '$3 則中的第 $1-$2 則'],
    [new RegExp(`^of ${COUNT}$`), '共 $1 則'],
    // 订阅页条目（open 按术语表作「建立」，同 common-ui 的 opened → 建立於）
    [/^#(\d+) opened$/, '#$1 建立於'],
    // 搜索框限定符建议的无障碍名称：reason, filter by notification reason, filter（限定符名原样保留；
    // 末尾的 filter 是条目类型，名词作「篩選器」，同 issues、actions 建议列表的「<名称>, Filter, <说明>」）
    [
      new RegExp(`^([\\w-]+), (${Object.keys(QUALIFIER_HINTS).join('|')}), filter$`),
      (_, qualifier: string, hint: string) => `${qualifier}，${QUALIFIER_HINTS[hint] ?? hint}，篩選器`
    ],

    // 已关注的存储库：按所有者取消关注
    [new RegExp(`^${OWNER}['’]s repositories$`), '$1 的儲存庫'],
    [new RegExp(`^Confirm unwatching ${OWNER}['’]s repositories$`), '確認取消關注 $1 的儲存庫'],
    [
      new RegExp(`^You will stop receiving notifications for all repositories owned by ${OWNER} that you are watching\\.$`),
      '你將不再收到 $1 名下所有已關注儲存庫的通知。'
    ],
    // 已关注的存储库：全部取消关注
    [new RegExp(`^Unwatch ${COUNT} repositor(?:y|ies)$`), '取消關注 $1 個儲存庫'],
    [
      new RegExp(`^You will stop receiving notifications for the ${COUNT} repositor(?:y|ies) you are watching\\.$`),
      '你將不再收到已關注的 $1 個儲存庫的通知。'
    ],
    [
      new RegExp(
        `^By unwatching these ${COUNT} repositor(?:y|ies), you will only receive notifications when participating or @mentioned\\.$`
      ),
      '取消關注這 $1 個儲存庫後，只有在參與或被 @提及時才會收到通知。'
    ],
    // 已关注的存储库：每个存储库的关注按钮无障碍名称（译法同存储库头部；人数量词作「位」）
    [
      new RegExp(
        `^(Watch|Unwatch): (Participating|All Activity|Ignore|Custom) in ${REPO}\\. ${COUNT} users? (?:is|are) watching this repository\\. Click to change subscription settings\\.$`
      ),
      (_, button: string, selection: string, repo: string, count: string) =>
        `${WATCH_BUTTON[button] ?? button}：${repo}（${WATCH_SELECTION[selection] ?? selection}）。${count} 位使用者正在關注此儲存庫。按一下可變更訂閱設定。`
    ],
    [
      new RegExp(
        `^Stop ignoring in ${REPO}\\. ${COUNT} users? (?:is|are) watching this repository\\. Click to change subscription settings\\.$`
      ),
      // 原文 Stop ignoring 后没有冒号，译文不加（同存储库头部）
      '停止忽略 $1。$2 位使用者正在關注此儲存庫。按一下可變更訂閱設定。'
    ],
    // 自定义订阅对话框
    [new RegExp(`^Subscribe to events for ${REPO}$`), '訂閱 $1 的事件'],
    [
      new RegExp(`^(${Object.keys(THREAD_TYPES).join('|')}) are not enabled for this repository$`),
      (_, thread: string) => `此儲存庫未啟用${THREAD_TYPES[thread] ?? thread}`
    ],
    // ProTip：When viewing a notification, press <kbd>e</kbd> to mark it as Done.
    // 引擎按 kbd 整句匹配，译文按快捷键文字切分写回；整句未命中时用 static 中的片段
    [
      new RegExp(`^When viewing a notification, press (.+?) to mark it as (${Object.keys(MARK_STATES).join('|')})\\.$`),
      (_, key: string, state: string) => `查看通知時，按 ${key} 可將其標示為${MARK_STATES[state] ?? state}。`
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
