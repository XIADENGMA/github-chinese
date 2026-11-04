import type { PageDictionary } from '../../../core/types'

/**
 * 项目（新版 Projects）：新建项目与模板。
 * 新建项目对话框（从头开始 / 系统模板 / 组织模板）、系统模板名称与简介、默认状态选项、
 * 从存储库或搜索查询导入项、查询构建器的限定符建议。
 */

/** 模板默认的单选选项名称 → 译文；用户自建选项原样保留 */
export const OPTION_NAMES: Readonly<Record<string, string>> = {
  Todo: '待辦',
  'In Progress': '進行中',
  'In progress': '進行中',
  Done: '已完成',
  Backlog: '待辦清單',
  Ready: '就緒',
  'In review': '審查中',
  'No Status': '無狀態'
}

export function translateOptionName(name: string): string {
  return OPTION_NAMES[name] ?? name
}

const AUTO_ADD_SUB_ISSUES: Readonly<Record<string, string>> = {
  ' and its sub-issues': '及其子議題',
  ' and their sub-issues': '及其子議題'
}

export default {
  static: {
    // 新建项目对话框（布局简介、模板简介原文没有的逗号不加）
    'Create project': '建立專案',
    'Creating project...': '正在建立專案...',
    'Creating project…': '正在建立專案…',
    'Project templates': '專案範本',
    'All templates': '所有範本',
    'View all featured templates': '查看所有精選範本',
    'View all templates from your organization': '查看你組織的所有範本',
    'No templates yet': '尚無範本',
    'Templates can be used to quickly get started with a new project.': '使用範本可以快速開始新專案。',
    'New table': '新增表格',
    'New board': '新增看板',
    'New roadmap': '新增藍圖',
    'Start with a powerful spreadsheet style table to filter, sort and group your issues and pull requests. Easily switch to a board or roadmap layout at any time.':
      '使用功能強大的試算表式表格篩選、排序並分組議題和拉取請求。可隨時輕鬆切換為看板或藍圖版面配置。',
    'Start with a board to spread your issues and pull requests across customizable columns. Easily switch to a table or roadmap layout at any time.':
      '使用看板將議題和拉取請求分散到可自訂的欄中。可隨時輕鬆切換為表格或藍圖版面配置。',
    'Start with a roadmap for a high-level visualization of your project over time. Easily switch to a table or board layout at any time.':
      '使用藍圖依時間軸呈現專案全貌。可隨時輕鬆切換為表格或看板版面配置。',

    // 系统模板
    'Team planning': '團隊規劃',
    "Manage your team's work items, plan upcoming cycles, and understand team capacity":
      '管理團隊的工作項目、規劃接下來的週期，並瞭解團隊產能',
    'Visualize the status of your project and limit work in progress': '以視覺化方式呈現專案狀態並限制進行中的工作量',
    'Feature release': '功能發布',
    "Manage your team's prioritized work items when planning for a feature release 🚀":
      '在規劃功能發布時管理團隊依優先順序排列的工作項目 🚀',
    'Bug tracker': '錯誤追蹤',
    'Track and triage your bugs 🐛': '追蹤並分類錯誤 🐛',
    'Iterative development': '迭代開發',
    'Plan your current and upcoming iterations as you work through your prioritized backlog of items':
      '在處理依優先順序排列的待辦項目時規劃目前和接下來的迭代',
    'Product launch': '產品發表',
    'Manage work items across teams and functions when planning for a product launch 🚀': '在規劃產品發表時跨團隊和職能管理工作項目 🚀',
    "Manage your team's long term plans as you plan out your roadmap": '在規劃藍圖時管理團隊的長期計畫',
    'Team retrospective': '團隊回顧',
    'Reflect as a team what went well, what can be improved next time, and action items':
      '與團隊一起回顧進展順利之處、下次可改進之處和行動項目',

    // 导入项
    'Import items from repository': '從儲存庫匯入項目',
    'Import items from search query': '從搜尋查詢匯入項目',
    'All new and existing items from the selected repository will be added to this project.':
      '選取的儲存庫中所有新的和現有的項目都會加入此專案。',
    'All existing items matching the search query will be added to this project.': '與搜尋查詢相符的所有現有項目都會加入此專案。',
    'Import items based on search query': '根據搜尋查詢匯入項目',
    'Items to import': '要匯入的項目',
    'We were unable to bulk import items at this time. Please try again.': '目前無法批次匯入項目。請再試一次。',
    'Please specify a repo, org, or user in your query.': '請在查詢中指定儲存庫、組織或使用者。',
    'Enterprise environments require explicit repository scoping (repo:owner/name) for security. Organization and user qualifiers alone are not permitted.':
      '企業環境基於安全性考量要求明確指定儲存庫範圍 (repo:owner/name)。不允許只使用組織和使用者限定詞。',
    'Select entities to add': '選取要加入的內容',
    'Import query': '匯入查詢',
    '0 items will be added': '不會加入任何項目'
  },
  scoped: {
    // 通用文本（仅项目页生效）
    'Start from scratch': '從頭開始',
    'From your organization': '來自你的組織',
    'Please provide a valid search query': '請提供有效的搜尋查詢',
    ...OPTION_NAMES,
    // 默认状态选项说明
    "This item hasn't been started": '此項目尚未開始',
    'This is ready to be picked up': '已可開始處理',
    'This is actively being worked on': '正在處理',
    'This item is in review': '此項目正在審查',
    'This has been completed': '已完成',
    // 新建项目对话框（模板 Kanban 与布局 Board 在同一对话框，Kanban 译「看板方法」以免同名）
    'Search templates': '搜尋範本',
    Kanban: '看板方法',
    Featured: '精選',
    'View all': '查看全部',
    'No results': '沒有結果',
    '1 result': '1 項結果',
    'Open issues and pull requests': '開放中的議題和拉取請求',
    'Open issues': '開放中的議題',
    'Open pull requests': '開放中的拉取請求',
    'Server error': '伺服器錯誤',
    'Error notification': '錯誤通知',
    // 新建项目对话框的状态图标（aria-label）
    'Green checkmark': '綠色勾號',
    Dash: '橫線',
    from: '來自',
    // 批量添加的模式切换（Add from a <button>search query</button> instead）：整句由下方 inline 规则译出，
    // 不构成行内句时按以下片段翻译
    'Add from a': '改為從',
    'search query': '搜尋查詢',
    instead: '加入',
    // 查询构建器建议（批量添加、从搜索查询导入、存档项页）：限定符名（与 issues/filter.ts 同译）
    Author: '作者',
    Assignee: '負責人',
    Label: '標籤',
    Language: '語言',
    Involves: '涉及',
    Mentions: '提及',
    Commenter: '留言者',
    'Review Requested': '已請求審查',
    'Reviewed By': '審查者',
    'User Review Requested': '已請求使用者審查',
    'Team review requested': '已請求團隊審查',
    Base: '基底分支',
    Head: '來源分支',
    Linked: '已連結',
    Reason: '原因',
    'Review state': '審查狀態',
    'Item Type': '項目類型',
    'Closed date': '關閉日期',
    'Merge date': '合併日期',
    'Update date': '更新日期',
    'Comment count': '留言數',
    'Interactions count': '互動數',
    'Reaction count': '表情回應數',
    'Commit SHA': '提交 SHA',
    // 查询构建器建议：限定符说明
    'Filter by organization': '依組織篩選',
    'Filter by repository': '依儲存庫篩選',
    'Filter by label': '依標籤篩選',
    'Filter by project': '依專案篩選',
    'The author of the item': '項目的作者',
    'The assignee of the item': '項目的負責人',
    'The user involved in the item': '項目涉及的使用者',
    'The user mentioned in the item': '項目中提及的使用者',
    'Items commented on by the user': '該使用者留言過的項目',
    'Items with review requested for the user': '已請求該使用者審查的項目',
    'Items with review requested for the user explicitly': '已明確請求該使用者審查的項目',
    'Items in repositories owned by the user': '該使用者擁有的儲存庫中的項目',
    'Specify archived or non-archived items only': '僅限已封存或未封存的項目',
    'Pull Request base branch': '拉取請求的基底分支',
    'Head branch commit sha': '來源分支的提交 SHA',
    'Closing date': '關閉日期',
    'Updated date': '更新日期',
    'Item comment count': '項目留言數',
    'Interaction count': '互動數',
    'Reactions count': '表情回應數',
    'Search for draft items': '搜尋草稿項目',
    'Restrict your search to the title, body, comments, or any combination of these': '將搜尋範圍限定在標題、內文、留言或其任意組合',
    'Items linked to an issue or pull request': '連結到議題或拉取請求的項目',
    'Specify a review state': '指定審查狀態',
    'Commit status: pending | success | failure': '提交狀態：pending | success | failure',
    'Team name': '團隊名稱',
    'Review requested from team': '已請求團隊審查',
    'Sort results': '排序結果',
    'Specify the type of item to search for: issue or pr': '指定要搜尋的項目類型：issue 或 pr',
    'Specify the type of issue to search for': '指定要搜尋的議題類型',
    // 查询构建器建议：取值
    'Last 7 days': '過去 7 天',
    'Last 30 days': '過去 30 天',
    'This year': '今年',
    'Exactly 100': '等於 100',
    'Only archived items': '僅限已封存的項目',
    'Only non-archived items': '僅限未封存的項目',
    'Only draft items': '僅限草稿項目',
    'Only non-draft items': '僅限非草稿項目',
    'Match values in title': '比對標題中的值',
    'Match values in body': '比對內文中的值',
    'Match values in comments': '比對留言中的值',
    'Pull requests that are linked to an issue': '已連結到議題的拉取請求',
    'Issue that are linked to pull requests': '已連結到拉取請求的議題',
    'Items without a label': '沒有標籤的項目',
    'Items without a milestone': '沒有里程碑的項目',
    'Items without a project': '沒有專案的項目',
    'Items that were closed as completed': '已關閉並標示為完成的項目',
    'Items that were closed as not planned': '已關閉並標示為不予處理的項目',
    'No reviews': '尚無審查',
    'Review required': '需要審查',
    'Has approving review': '有核准的審查',
    'Review requesting changes': '要求變更的審查',
    'Most commented': '最多留言',
    'Items with pending status': '狀態為 pending 的項目',
    'Items with success status': '狀態為 success 的項目',
    'Items with failure status': '狀態為 failure 的項目'
  },
  regexp: [
    // 结果的量词按术语表用「項」
    [/^(\d+) results$/, '$1 項結果'],
    [
      /^The most recent 500 items( and (?:its|their) sub-issues)? will be added to the project$/,
      (_, subIssues?: string) => `最近的 500 個項目${subIssues ? (AUTO_ADD_SUB_ISSUES[subIssues] ?? '') : ''}將加入專案`
    ],
    [
      /^(\d+) items?( and (?:its|their) sub-issues)? will be added$/,
      (_, count: string, subIssues?: string) => `將加入 ${count} 個項目${subIssues ? (AUTO_ADD_SUB_ISSUES[subIssues] ?? '') : ''}`
    ]
  ],
  inline: [
    // 批量添加 / 从搜索查询导入的模式切换（bulk-add-configuration.tsx）：
    // <p>Add from a <button>search query</button> instead</p>，按钮文字 search query / repository 照常翻译
    ['Add from a {} instead', '改為從{}加入']
  ]
} satisfies PageDictionary
