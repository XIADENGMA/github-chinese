import type { PageDictionary } from '../../../core/types'
import { FILTER_BAR_INLINE, FILTER_BAR_RULES, FILTER_BAR_SCOPED, LABEL_SUGGESTION_IGNORE } from '../issues/filter'

/**
 * 筛选框（与议题列表同一组件）的 scoped 词条中不收的：No、Pending 在拉取请求页沿用通用词典的「否」「待處理」；
 * 其余已由其他拉取请求子文件同译收录
 */
const FILTER_BAR_SKIP: ReadonlySet<string> = new Set([
  'No',
  'Pending',
  // dashboard.ts、mergebox.ts、comments.ts、conflicts.ts
  'Exclude',
  'Review requested',
  'Skipped',
  'Cancelled',
  'Waiting',
  'Category',
  'between',
])

/** 筛选框的 scoped 词条：建议列表（筛选器名称、说明、取值）、高级筛选、校验提示，取自 issues/filter.ts */
const FILTER_BAR: Readonly<Record<string, string>> = Object.fromEntries(
  Object.entries(FILTER_BAR_SCOPED).filter(([key]) => !FILTER_BAR_SKIP.has(key)),
)

const REVIEW_FILTER: Readonly<Record<string, string>> = {
  'Review required': '需要審查',
  Approved: '已核准',
  'Changes requested': '已要求變更',
  'No reviews': '尚無審查',
  'Approved review': '已核准',
  'Reviewed by you': '你已審查',
  'Not reviewed by you': '你未審查',
  'Awaiting review from you': '等待你審查',
  'Awaiting review from you or your team': '等待你或你的團隊審查',
}

const REVIEW_FILTER_SOURCE = Object.keys(REVIEW_FILTER).join('|')

const SORT_FIELD: Readonly<Record<string, string>> = {
  Newest: '最新',
  Oldest: '最舊',
  Updated: '更新時間',
  Comments: '留言數',
  'Best match': '最相符',
  'Created on': '建立時間',
  'Last updated': '上次更新',
  'Total comments': '留言總數',
  Reactions: '表情回應',
  'Total reactions': '表情回應總數',
}

const SORT_FIELD_SOURCE = Object.keys(SORT_FIELD).join('|')

const REACTION_LABEL: Readonly<Record<string, string>> = {
  total: '',
  'Thumbs up': '👍 ',
  'Thumbs down': '👎 ',
  Laugh: '😄 ',
  Hooray: '🎉 ',
  Confused: '😕 ',
  Rocket: '🚀 ',
  Eyes: '👀 ',
  Heart: '❤️ ',
}

const ITEM_STATUS: Readonly<Record<string, string>> = {
  Open: '開放中',
  'Closed (completed)': '已關閉（已完成）',
  'Not planned (skipped)': '不予處理（已略過）',
  'Duplicate of an existing item': '與現有項目重複',
  'Merged (completed)': '已合併（已完成）',
  'In merge queue': '在合併佇列中',
  'Open (in progress)': '開放中（進行中）',
  'Closed (abandoned)': '已關閉（已放棄）',
  'Draft (not ready)': '草稿（未就緒）',
  'Archived (abandoned)': '已封存（已放棄）',
}

const ITEM_STATUS_SOURCE = Object.keys(ITEM_STATUS)
  .map((status) => status.replace(/[()]/g, '\\$&'))
  .join('|')

/** 列表名称：No more pull requests、No issues and pull requests matched your search 等 */
const DASHBOARD_LABEL: Readonly<Record<string, string>> = {
  'pull requests': '拉取請求',
  'issues and pull requests': '議題和拉取請求',
}

/** 列表项检查状态图标：Status checks: success（与存储库首页同译；Pending 按术语表作「擱置中」） */
const STATUS_CHECK_STATE: Readonly<Record<string, string>> = {
  success: '成功',
  failure: '失敗',
  pending: '擱置中',
  error: '錯誤',
  expected: '等待回報',
}

/**
 * 拉取请求列表：存储库列表（React 新版与经典版）、全局 /pulls、筛选与排序、列表项元数据、ProTip、批量操作、堆栈列表。
 * 筛选框与议题列表是同一组件，建议列表、高级筛选与校验提示的词条和规则取自 issues/filter.ts。
 */
export default {
  static: {
    // 列表头部
    'Search pull requests': '搜尋拉取請求',
    'Search all pull requests': '搜尋所有拉取請求',
    'New pull request': '新增拉取請求',
    'Pull request filters': '拉取請求篩選器',
    'Pull requests display density': '拉取請求顯示密度',
    'Loading pull requests display density': '正在載入拉取請求顯示密度',
    'Loading pull requests': '正在載入拉取請求',
    'Change the pull requests type filter': '切換拉取請求檢視',
    'Learn more about searching and filtering pull requests.': '瞭解如何搜尋、篩選拉取請求。',
    'Pull requests navigation': '拉取請求導覽',
    'Repository Pull Requests': '儲存庫拉取請求',
    'Tell us your feedback on the new pull request experience': '告訴我們你對新版拉取請求體驗的意見',
    'Filter by reviews': '依審查篩選',
    'Filter by review': '依審查篩選',
    'Reviewed by you': '你已審查',
    'Not reviewed by you': '你未審查',
    'Awaiting review from you': '等待你審查',
    'Awaiting review from you or your team': '等待你或你的團隊審查',
    // 经典列表“审查”筛选菜单（user-review-requested:@me）
    'Awaiting review from you specifically': '等待你本人審查',
    'Review required before merging': '合併前需要審查',

    // 列表项状态图标
    'Open pull request': '開放中的拉取請求',
    'Closed pull request': '已關閉的拉取請求',
    'Merged pull request': '已合併的拉取請求',
    'Draft pull request': '草稿拉取請求',
    'Pull request in merge queue': '合併佇列中的拉取請求',
    'Queued pull request': '已排入佇列的拉取請求',
    'Archived pull request': '已封存的拉取請求',
    'Queued, view merge queue': '已排入佇列，查看合併佇列',

    // 空状态
    'No pull requests matched your search': '沒有相符的拉取請求',
    'No more pull requests': '沒有更多拉取請求',
    // attention 不译「關注」，免得与 watch 撞词（与 issues/list.ts 同一写法）
    'When a pull request needs your review or attention, it’ll appear here.':
      '需要你審查或留意的拉取請求會顯示在這裡。',
    "When a pull request needs your review or attention, it'll appear here.":
      '需要你審查或留意的拉取請求會顯示在這裡。',
    'Failed to load pull requests. Try refreshing the page.': '無法載入拉取請求。請重新整理頁面。',
    'There aren’t any open pull requests.': '沒有開放中的拉取請求。',
    "There aren't any open pull requests.": '沒有開放中的拉取請求。',
    'There aren’t any closed pull requests.': '沒有已關閉的拉取請求。',
    "There aren't any closed pull requests.": '沒有已關閉的拉取請求。',
    'Welcome to pull requests!': '歡迎使用拉取請求！',
    'Pull requests help you collaborate on code with other people. As pull requests are created, they’ll appear here in a searchable and filterable list. To get started, you should':
      '拉取請求可讓你與他人協作處理程式碼。建立的拉取請求會顯示在這裡，可供搜尋和篩選。若要開始使用，請',
    "Pull requests help you collaborate on code with other people. As pull requests are created, they'll appear here in a searchable and filterable list. To get started, you should":
      '拉取請求可讓你與他人協作處理程式碼。建立的拉取請求會顯示在這裡，可供搜尋和篩選。若要開始使用，請',
    'create a pull request': '建立拉取請求',
    // 首次贡献说明：If you know how to fix an <issue>, consider opening a pull request for it.（链接 issue 见 scoped）
    'If you know how to fix an': '如果你知道如何修正某個',
    ', consider opening a pull request for it.': '，可以考慮為其建立拉取請求。',
    // 有贡献指南时后接 You can read this repository’s <contributing guidelines> to learn how to open a good pull request.
    // （多句文本按句查词，两句拼读）
    'If you would like to submit code to this repository, consider opening a pull request.':
      '如果你想向此儲存庫提交程式碼，可以考慮建立拉取請求。',
    'You can read this repository’s': '你可以閱讀此儲存庫的',
    'to learn how to open a good pull request.': '以瞭解如何建立優質的拉取請求。',

    // 经典列表筛选菜单、搜索框与 ProTip（与议题列表共用，原文即写 issues）
    'Filter Issues': '篩選議題',
    'Search all issues': '搜尋所有議題',
    'Click a checkbox on the left to edit multiple issues at once.': '按一下左側的核取方塊可一次編輯多個議題。',
    'No projects found. Sorry about that.': '找不到專案。',

    // 经典列表筛选菜单与 ProTip（拉取请求专有）
    'Filter Pull Requests': '篩選拉取請求',
    'Filter pull requests': '篩選拉取請求',
    'Pull requests with no milestone': '沒有里程碑的拉取請求',
    'Filter pull requests by the default branch with': '依預設分支篩選拉取請求可使用',
    'Find all pull requests that aren’t related to any open issues with': '尋找與任何開放中議題都無關的拉取請求可使用',
    "Find all pull requests that aren't related to any open issues with": '尋找與任何開放中議題都無關的拉取請求可使用',
    'on any issue or pull request to go back to the pull request listing page.':
      '可從任何議題或拉取請求返回拉取請求清單頁面。',
    'Exclude your own pull requests with': '排除你自己的拉取請求可使用',
    // ProTip! Add <.patch> or <.diff> to the end of URLs for Git’s plaintext views.
    'to the end of URLs for Git’s plaintext views.': '到 URL 結尾以查看 Git 純文字檢視。',
    "to the end of URLs for Git's plaintext views.": '到 URL 結尾以查看 Git 純文字檢視。',
    // ProTip! Add comments to specific lines under <Files changed>.（链接在句末，仿其他 ProTip 的「…可使用」句式作「…可前往」）
    'Add comments to specific lines under': '為特定行新增留言可前往',

    // 批量操作
    'Assigned to some selected pull requests': '已指派給部分選取的拉取請求',
    'Pull requests updated, but the results could not be refreshed': '拉取請求已更新，但無法重新整理結果',
    'Could not update pull requests': '無法更新拉取請求',

    // 堆栈列表
    'Open stacks': '開放中的堆疊',
    'Completed stacks': '已完成的堆疊',
    'There are no open stacks': '沒有開放中的堆疊',
    'There are no completed stacks': '沒有已完成的堆疊',
    'Back to stacks': '返回堆疊清單',

    // 全局 /pulls
    'Pull requests created by you': '你建立的拉取請求',
    'Pull requests assigned to you': '指派給你的拉取請求',
    'Pull requests mentioning you': '提及你的拉取請求',
    'Pull requests requesting your review': '請求你審查的拉取請求',
    // 视图说明的大写 R 写法
    'Pull Requests mentioning you': '提及你的拉取請求',
    'Pull Requests requesting your review': '請求你審查的拉取請求',
    // 经典 /pulls 的存储库可见性筛选项（Public repositories only 由 org-settings 词典收录）
    'Private repositories only': '僅限私人儲存庫',
  },
  scoped: {
    // 筛选框（与议题列表同一组件）；Parent issue、Blocked by 在议题页由 issues/metadata.ts 收录
    ...FILTER_BAR,
    'Parent issue': '父議題',
    'Blocked by': '受阻於',

    // 列表头部
    'Merge queue': '合併佇列',
    Pages: '頁面',
    Stacks: '堆疊',
    'Authored by me': '我建立的',
    'Created by me': '我建立的',
    'Assigned to me': '指派給我的',
    'Involves me': '與我有關',
    'Review requests': '審查請求',
    'Repository visibility': '儲存庫可見度',
    'Filter by organization or owner': '依組織或擁有者篩選',

    // 与议题列表共用的筛选与排序
    Label: '標籤',
    Labels: '標籤',
    Milestones: '里程碑',
    Milestone: '里程碑',
    Project: '專案',
    Reviews: '審查',
    Assignee: '負責人',
    Assignees: '負責人',
    'Sort…': '排序…',
    Order: '順序',
    ascending: '遞增',
    descending: '遞減',
    'Created on': '建立時間',
    'Last updated': '上次更新',
    'Total comments': '留言總數',
    'Best match': '最相符',
    'Total reactions': '表情回應總數',
    Laugh: '大笑',
    Hooray: '歡呼',
    Confused: '困惑',
    Rocket: '火箭',
    Eyes: '眼睛',
    Heart: '愛心',
    'Filter by label': '依標籤篩選',
    'Filter by labels': '依標籤篩選',
    'Filter by projects': '依專案篩選',
    'Filter by project': '依專案篩選',
    'Filter by milestones': '依里程碑篩選',
    'Filter by milestone': '依里程碑篩選',
    'Filter by assignee': '依負責人篩選',
    'Filter by who’s assigned': '依負責人篩選',
    "Filter by who's assigned": '依負責人篩選',
    'Filter users': '篩選使用者',
    'Filter labels': '篩選標籤',
    'Filter milestones': '篩選里程碑',
    'Filter authors': '篩選作者',
    'User results': '使用者結果',
    'Label results': '標籤結果',
    'Pull request results': '拉取請求結果',
    Unlabeled: '無標籤',
    'Assigned to nobody': '未指派',
    'Comfortable display density': '舒適顯示密度',
    'Compact display density': '精簡顯示密度',
    Created: '已建立',
    Assigned: '已指派',
    Mentioned: '提及我的',
    'Approved review': '已核准',
    'No reviews': '尚無審查',

    // 经典列表筛选菜单
    'Everything assigned to you': '指派給你的所有內容',
    'Everything mentioning you': '提及你的所有內容',
    'Open issues and pull requests': '開放中的議題和拉取請求',
    'View advanced search syntax': '查看進階搜尋語法',
    'Most commented': '最多留言',
    'Least commented': '最少留言',
    'Most reactions': '最多表情回應',
    // 标签筛选菜单页脚：Use <kbd>alt</kbd> + <kbd>click/return</kbd> to exclude labels，
    // or <kbd>⇧</kbd> + <kbd>click/return</kbd> for logical OR（Use、or 由通用词典翻译）
    'to exclude labels': '排除標籤',
    'for logical OR': '表示邏輯或',

    // ProTip（与议题列表共用）
    'Mix and match filters to narrow down what you’re looking for.': '組合使用篩選器以縮小搜尋範圍。',
    "Mix and match filters to narrow down what you're looking for.": '組合使用篩選器以縮小搜尋範圍。',
    'Exclude everything labeled': '排除所有帶有標籤',
    'Follow long discussions with': '追蹤長篇討論可使用',
    'Notify someone on an issue with a mention, like:': '在議題中提及某人以通知對方，例如：',
    'to see everything that’s not assigned.': '以查看所有未指派的內容。',
    "to see everything that's not assigned.": '以查看所有未指派的內容。',
    'will show everything without a label.': '會顯示所有沒有標籤的內容。',
    'will show everything without a milestone.': '會顯示所有沒有里程碑的內容。',
    'What’s not been updated in a month:': '一個月內未更新的內容：',
    "What's not been updated in a month:": '一個月內未更新的內容：',
    'Updated in the last three days:': '最近三天內更新的內容：',
    'Ears burning? Get': '想知道誰在談論你？查看',
    'mentions with': '的提及可使用',
    'Exclude your own issues with': '排除你自己的議題可使用',
    'Find everything you created by searching': '尋找你建立的所有內容可搜尋',

    // 空状态与搜索
    'Invalid query': '查詢無效',
    'Visit a lower page.': '請前往前面的頁面。',
    'Enter a query to start searching.': '輸入查詢以開始搜尋。',
    'Learn more about searching and filtering': '瞭解搜尋和篩選',
    'All caught up': '全部處理完畢',
    'Try a new search': '嘗試新的搜尋',
    Unread: '未讀',
    // 经典列表无结果：You could search <all of GitHub> or try an <advanced search>.（前两段由通用词典翻译）
    'or try an': '或嘗試',
    'advanced search': '進階搜尋',
    // 首次贡献说明的链接：If you know how to fix an <issue>, …（筛选框高亮层的 is:issue 已由忽略规则排除）
    issue: '議題',

    // 列表项：#123 opened <时间> by <用户>（拉取请求的动词 open 译「建立」，与 common-ui 的共用 opened 同为「建立於」）。
    // #123 by octocat was merged <时间> 里的 octocat 是作者（链接提示 Open pull requests created by），不是合并者；
    // 补「建立後」，与 issues/list.ts 同一写法：由 octocat 建立後合併於 3 天前
    opened: '建立於',
    by: '由',
    'was merged': '建立後合併於',
    'was closed': '建立後關閉於',

    // 批量操作
    'Apply labels': '套用標籤',
    'Mark as': '標示為',
    Unarchived: '已取消封存',
    Assign: '指派',
    'Assign to nobody': '不指派給任何人',
    'Assign someone': '指派給某人',
    'Apply assignees': '套用負責人',
    'Apply milestone': '套用里程碑',
    'Add to projects': '加入專案',
    // 经典列表 ProTip「Adding <no:label> will show everything without a label.」的片段（采集参考中与后半句相邻，
    // 不是批量操作的进度文字）；把限定符放进搜索框，按术语表 add 放进已有集合的写法作「加入」
    Adding: '加入',

    // 堆栈进度：<3> unmerged（整句由下方 inline 处理，数字不在独立元素中时按片段）
    unmerged: '未合併',
  },
  regexp: [
    // 经典列表计数：546 Open / 12,345 Closed
    [/^([\d,]+) Open$/, '$1 個開放中'],
    [/^([\d,]+) Closed$/, '$1 個已關閉'],
    [/^([\d,]+) Total$/, '共 $1 個'],
    // 经典列表项：#123 opened、#123 by
    [/^#(\d+) opened$/, '#$1 建立於'],
    [/^#(\d+) by$/, '#$1 由'],
    [/^Open pull requests created by ([\w-]+(?:\[bot\])?)$/, '$1 建立的開放中拉取請求'],
    // 空状态：No more pull requests、No issues and pull requests matched your search
    [
      /^No (pull requests|issues and pull requests) matched your search$/,
      (_, label) => `沒有相符的${DASHBOARD_LABEL[label] ?? label}`,
    ],
    [
      /^Search for (pull requests|issues and pull requests)\.$/,
      (_, label) => `搜尋${DASHBOARD_LABEL[label] ?? label}。`,
    ],
    // 首次贡献横幅标题（存储库名是相邻文本节点，拼接后整句匹配；与议题列表同译）
    [/^👋 Want to contribute to ([\w.-]+\/[\w.-]+)\?$/, '👋 想為 $1 做出貢獻嗎？'],
    // 堆栈列表
    [/^(\d+) pull requests in this stack$/, '此堆疊中有 $1 個拉取請求'],
    // 筛选按钮无障碍名称（标签名是用户内容，原文无引号，译文不加）
    [/^Filter by author (\S+)$/, '依作者 $1 篩選'],
    [/^Filter by assignee (\S+)$/, '依負責人 $1 篩選'],
    [/^Filter by label (.+)$/, '依標籤 $1 篩選'],
    [/^Filter by repository ([\w.-]+\/[\w.-]+)$/, '依儲存庫 $1 篩選'],
    [
      new RegExp(`^Filter by review: (${REVIEW_FILTER_SOURCE})$`),
      (_, label) => `依審查篩選：${REVIEW_FILTER[label] ?? label}`,
    ],
    // 排序按钮：Sort by Newest descending → 依最新遞減排序（原文无标点，改语序代替冒号、逗号；与 issues/list.ts 同一写法）
    [
      new RegExp(`^Sort by (${SORT_FIELD_SOURCE}) (ascending|descending)$`),
      (_, field, direction) => `依${SORT_FIELD[field] ?? field}${direction === 'ascending' ? '遞增' : '遞減'}排序`,
    ],
    [new RegExp(`^Sort by (${SORT_FIELD_SOURCE})$`), (_, field) => `依${SORT_FIELD[field] ?? field}排序`],
    // 审查状态提示
    [/^([\d,]+) review approvals?$/, '$1 個核准'],
    [/^([\d,]+) reviews? requesting changes$/, '$1 個要求變更的審查'],
    // 检查状态（检查量词作「項」）
    [/^(\d+)\/(\d+) checks passing$/, '$1/$2 項檢查通過'],
    [/^(\d+) ?\/ ?(\d+) checks OK$/, '$1/$2 項檢查正常'],
    [
      /^Status checks: (success|failure|pending|error|expected)$/,
      (_, state) => `狀態檢查：${STATUS_CHECK_STATE[state] ?? state}`,
    ],
    // 任务列表进度（量词用「項」，按术语表工作清单的写法，与个人主页贡献同译）
    [/^(\d+) of (\d+) tasks?$/, '$2 項工作中已完成 $1 項'],
    [/^(\d+) tasks? done$/, '$1 項工作已完成'],
    [/^(\d+) tasks?$/, '$1 項工作'],
    // 链接的议题、反应数
    [/^(\d+) linked issues?$/, '$1 個已連結的議題'],
    [/^(\d+) linked issues? for pull request ([\w.-]+\/[\w.-]+#\d+): (.+)$/, '拉取請求 $2 的 $1 個已連結議題：$3'],
    [
      /^([\d,]+) (total|Thumbs up|Thumbs down|Laugh|Hooray|Confused|Rocket|Eyes|Heart) reactions?$/,
      (_, count, label) => `${REACTION_LABEL[label] ?? ''}${count} 個表情回應`,
    ],
    [/^Milestone: (.+)$/, '里程碑：$1'],
    [/^\+(\d+), show all (\d+) assignees$/, '+$1，顯示全部 $2 位負責人'],
    // 列表项无障碍名称
    [new RegExp(`^Status: (${ITEM_STATUS_SOURCE})\\.$`), (_, status) => `狀態：${ITEM_STATUS[status] ?? status}。`],
    // 列表项复选框：Select: <标题>（标题为空时只剩 Select:）
    [/^Select:(?: (.+))?$/, (_, title) => (title ? `選取：${title}` : '選取')],
    // 读屏播报：Selected. <标题>.（原文状态后是句号，不改冒号）
    [/^Selected\. (.+)\.$/, '已選取。$1。'],
    [/^Unselected\. (.+)\.$/, '未選取。$1。'],
    // 全选：Select all pull requests: <列表标题>；3 pull requests of 25 selected（与 common-ui 同译，原文无标点）
    [/^Select all pull requests:(?: (.+))?$/, (_, title) => (title ? `全選拉取請求：${title}` : '全選拉取請求')],
    [
      /^([\d,]+) pull requests? (?:of ([\d,]+) )?selected$/,
      (_, count, total) => (total ? `${total} 個拉取請求中已選取 ${count} 個` : `已選取 ${count} 個拉取請求`),
    ],
    // 数字在独立元素中时的后半段：<3> of 25 selected（原文无标点，不加逗号；与议题列表同一写法）
    [/^of ([\d,]+) selected$/, '/$1 已選取'],
    // 批量更新
    [/^(\d+) pull requests? returned to the list$/, '$1 個拉取請求已回到清單'],
    [/^Updating (\d+) pull requests?$/, '正在更新 $1 個拉取請求'],
    [/^Bulk update is in progress (\d+) %$/, '批次更新進行中 $1%'],
    [/^Could not update (\d+) of (\d+) pull requests?$/, '$2 個拉取請求中有 $1 個無法更新'],
    [/^(\d+) pull requests? updated$/, '已更新 $1 個拉取請求'],
    // 筛选框（与议题列表同一组件）：建议列表的组合文字、高级筛选、校验提示；宽泛规则，放在最后
    ...FILTER_BAR_RULES,
  ],
  inline: [
    // 堆栈进度（堆栈列表与堆栈详情）：<span><span>3</span> merged</span>；不收录时 merged 落到头部片段「合併了」
    ['{#} merged', '{#} 個已合併'],
    ['{#} unmerged', '{#} 個未合併'],
    // 筛选框的校验提示（与议题列表同一组件）
    ...FILTER_BAR_INLINE,
  ],
  // 筛选框 label: 取值建议里的标签名（与议题列表同一组件）
  ignore: [LABEL_SUGGESTION_IGNORE],
} satisfies PageDictionary
