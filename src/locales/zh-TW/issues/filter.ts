import type { InlineRule, PageDictionary, RegExpRule } from '../../../core/types'
import { VALIDATION_FIELD_SOURCE } from '../common-ui/validation'
import { joinCjk } from '../helpers'

/**
 * 筛选框 label: 的取值建议（建议项 aria-label 为“名称, Label”，译后为“名称，標籤”）：标签名是用户内容，只忽略名称；
 * 界面取值（Open、Closed 等）照常翻译。无值、有值两项 No label、Has label 的 aria-label 同样以“, Label”结尾
 * （“No Label, Label”“Has Label, Label”，译后为“無標籤，標籤”“有標籤，標籤”），按原文与译文全等排除。
 * 拉取请求列表用同一组件（pulls/list.ts）
 */
export const LABEL_SUGGESTION_IGNORE =
  'li[role="option"]:is([aria-label$=", Label"], [aria-label$="，標籤"])' +
  ':not([aria-label="No Label, Label"], [aria-label="Has Label, Label"], [aria-label="無標籤，標籤"], [aria-label="有標籤，標籤"])' +
  ' [class*="displayName__"]'

/** 筛选器名称（建议列表、高级筛选的限定符） */
const FILTER_KEY: Readonly<Record<string, string>> = {
  Archived: '已封存',
  Assignee: '負責人',
  Author: '作者',
  Base: '基底分支',
  'Blocked by': '受阻於',
  Blocking: '阻擋',
  Category: '類別',
  'Closed date': '關閉日期',
  'Closed reason': '關閉原因',
  // language: 限定符的新名称（与 Programming language“编程语言”区分）
  'Code language': '程式碼語言',
  'Comment count': '留言數',
  Commenter: '留言者',
  'Commit SHA': '提交 SHA',
  'Creation date': '建立日期',
  Draft: '草稿',
  Field: '欄位',
  Has: '有',
  Head: '來源分支',
  In: '範圍',
  'In body': '在內文中',
  'In comments': '在留言中',
  'In title': '在標題中',
  'Interactions count': '互動數',
  Involves: '涉及',
  Is: '是',
  Label: '標籤',
  Language: '語言',
  Linked: '已連結',
  'Merge date': '合併日期',
  Mentions: '提及',
  Milestone: '里程碑',
  No: '無',
  Organization: '組織',
  'Parent issue': '父議題',
  Project: '專案',
  'Reaction count': '表情回應數',
  'Relates to': '相關',
  Repository: '儲存庫',
  'Review requested': '已請求審查',
  'Review state': '審查狀態',
  'Reviewed by': '審查者',
  Sort: '排序',
  State: '狀態',
  Status: '狀態',
  'Sub-issue': '子議題',
  Suggestions: '建議',
  Team: '團隊',
  'Team review requested': '已請求團隊審查',
  Text: '文字',
  Type: '類型',
  'Update date': '更新日期',
  User: '使用者',
  'User review requested': '已請求使用者審查',
}

/** 筛选器说明（item 指议题、拉取请求或项目项，按术语表译「項目」） */
const FILTER_DESCRIPTION: Readonly<Record<string, string>> = {
  'Specify archived or non-archived items only': '僅限已封存或未封存的項目',
  'Pull Request base branch': '拉取請求的基底分支',
  'Closing date': '關閉日期',
  'Item comment count': '項目留言數',
  'Creation date': '建立日期',
  'Search for draft items': '搜尋草稿項目',
  'Filter by items with a specific metadata value': '篩選具有特定中繼資料值的項目',
  'Head branch commit sha': '來源分支的提交 SHA',
  'Search for text only inside the body of an item': '僅在項目內文中搜尋文字',
  'Search for text only inside the comments of an item': '僅在項目留言中搜尋文字',
  'Interaction count': '互動數',
  'Search for text only inside the title of an item': '僅在項目標題中搜尋文字',
  'Filter only "issues", "pulls", "open", "closed", or "draft"':
    '僅篩選「issues」「pulls」「open」「closed」或「draft」',
  'Limit text search to the title, body, or comments of an item or a combination of them':
    '將文字搜尋限定在項目的標題、內文、留言或其組合中',
  Language: '語言',
  'Items linked to an issue or pull request': '連結到議題或拉取請求的項目',
  'Look for open, closed, or draft issues': '尋找開放中、已關閉或草稿議題',
  'Merge date': '合併日期',
  Milestone: '里程碑',
  'Filter by items without a specific metadata value': '篩選缺少特定中繼資料值的項目',
  'Parent issue': '父議題',
  'State of Pull Requests': '拉取請求的狀態',
  'Reactions count': '表情回應數',
  'Filter by item closed reason': '依項目的關閉原因篩選',
  'Specify a review state': '指定審查狀態',
  'Commit SHA': '提交 SHA',
  'Sort results': '排序結果',
  'Look for open / closed items': '尋找開放中/已關閉的項目',
  'Commit status: pending | success | failure': '提交狀態：pending | success | failure',
  'Issue status or pull request commit status': '議題狀態或拉取請求的提交狀態',
  'Pending suggestions count': '待處理建議數',
  'Team name': '團隊名稱',
  'Review requested from team': '已請求團隊審查',
  'Updated date': '更新日期',
  'Filter by repository': '依儲存庫篩選',
  'Filter by organization': '依組織篩選',
  'Filter by label': '依標籤篩選',
  'Filter by project': '依專案篩選',
  'Issues blocked by another issue': '受其他議題阻擋的議題',
  'Issues blocking another issue': '阻擋其他議題的議題',
  'Issues related to another issue': '與其他議題相關的議題',
  'The assignee of the item': '項目的負責人',
  'The author of the item': '項目的作者',
  'Items commented on by the user': '該使用者留言過的項目',
  'The user involved in the item': '項目涉及的使用者',
  'The user mentioned in the item': '項目中提及的使用者',
  'Items reviewed by the user': '該使用者審查過的項目',
  'Items with review requested for the user': '已請求該使用者審查的項目',
  'Items in repositories owned by the user': '該使用者擁有的儲存庫中的項目',
  'Items with review requested for the user explicitly': '已明確請求該使用者審查的項目',
  'Filter by issue fields': '依議題欄位篩選',
  'Specify the type of issue to search for': '指定要搜尋的議題類型',
}

/** 筛选值（建议列表） */
const FILTER_VALUE: Readonly<Record<string, string>> = {
  Issue: '議題',
  'Pull Request': '拉取請求',
  Title: '標題',
  Body: '內文',
  Comments: '留言',
  Open: '開放中',
  Closed: '已關閉',
  Merged: '已合併',
  Draft: '草稿',
  Completed: '已完成',
  'Not planned': '不予處理',
  Duplicate: '重複',
  'No reviews': '尚無審查',
  'Review required': '需要審查',
  Approved: '已核准',
  'Changes requested': '已要求變更',
  Pending: '擱置中',
  Success: '成功',
  Failure: '失敗',
  Queued: '已排入佇列',
  Waiting: '等待中',
  Cancelled: '已取消',
  Skipped: '已略過',
  Discussion: '討論',
  Locked: '已鎖定',
  Unlocked: '未鎖定',
  Unmerged: '未合併',
  Private: '私人',
  Public: '公開',
  Repository: '儲存庫',
  Unread: '未讀',
  Blocked: '受阻擋',
  Blocking: '阻擋',
  True: '是',
  False: '否',
  Today: '今天',
  Yesterday: '昨天',
  'Past 7 days': '過去 7 天',
  'Past 30 days': '過去 30 天',
  'Past year': '過去一年',
  'Less than 10': '少於 10',
  'More than 10': '多於 10',
  'Between 10 and 100': '介於 10 到 100 之間',
  'Signed-in user': '已登入的使用者',
  'Your AI pair programmer': '你的 AI 結對程式設計師',
  Me: '我',
}

/** 高级筛选中的运算符 */
const OPERATOR: Readonly<Record<string, string>> = {
  'is one of': '是下列其中之一',
  'is not one of': '不是下列其中之一',
  is: '是',
  'is not': '不是',
  'greater than': '大於',
  'less than': '小於',
  'greater than or equal to': '大於或等於',
  'less than or equal to': '小於或等於',
  'equal to': '等於',
  before: '早於',
  after: '晚於',
  'before and including': '早於或等於',
  'after and including': '晚於或等於',
  between: '介於',
}

/** 选择器条目名（复数） */
const PICKER_ITEMS: Readonly<Record<string, string>> = {
  users: '使用者',
  labels: '標籤',
  projects: '專案',
  milestones: '里程碑',
  assignees: '負責人',
  authors: '作者',
  repositories: '儲存庫',
  organizations: '組織',
  teams: '團隊',
  types: '類型',
  'issue types': '議題類型',
  items: '項目',
  values: '值',
  results: '結果',
}

const PICKER_ITEMS_SOURCE = Object.keys(PICKER_ITEMS)
  .sort((a, b) => b.length - a.length)
  .join('|')

/** 选择器条目名（单数，选择按钮「1 label selected」「Select a label」） */
const PICKER_ITEM: Readonly<Record<string, string>> = {
  user: '使用者',
  label: '標籤',
  project: '專案',
  milestone: '里程碑',
  assignee: '負責人',
  author: '作者',
  repository: '儲存庫',
  organization: '組織',
  team: '團隊',
  type: '類型',
  'issue type': '議題類型',
  item: '項目',
  value: '值',
}

const PICKER_ITEM_SOURCE = Object.keys(PICKER_ITEM)
  .sort((a, b) => b.length - a.length)
  .join('|')

/** 选择计数的量词（术语表第 2 节）：人用「位」，结果用「項」，未列出的用「個」 */
const PICKER_MEASURE: Readonly<Record<string, string>> = {
  users: '位',
  user: '位',
  assignees: '位',
  assignee: '位',
  authors: '位',
  author: '位',
  results: '項',
}

/**
 * 不放入 scoped 的词条：通用词典已有相同译文，或已由侧栏 / 详情页（metadata.ts、viewer.ts）收录。
 * 映射表本身保留，供组合文本的正则查表。
 */
const SHARED: ReadonlySet<string> = new Set([
  // 通用词典
  'Archived',
  'Author',
  'Draft',
  'Language',
  'Organization',
  'Repository',
  'Sort',
  'Status',
  'Suggestions',
  'User',
  'Title',
  'Open',
  'Closed',
  'Merged',
  'Completed',
  'Not planned',
  'Duplicate',
  'Review required',
  'Approved',
  'Changes requested',
  'Success',
  'Locked',
  'Unlocked',
  'Private',
  'Public',
  'Today',
  'Yesterday',
  // metadata.ts、viewer.ts
  'Assignee',
  'Label',
  'Type',
  'Project',
  'Milestone',
  'Field',
  'Parent issue',
  'Blocked by',
  'Relates to',
  'Comments',
])

/** 去掉 SHARED 中的词条 */
function own(map: Readonly<Record<string, string>>): Record<string, string> {
  return Object.fromEntries(Object.entries(map).filter(([key]) => !SHARED.has(key)))
}

function keyName(name: string): string {
  return FILTER_KEY[name] ?? name
}

/** 连字符与空格视为相同：parent-issue、parent issue → Parent issue */
function looseKey(name: string): string {
  return name.toLowerCase().replace(/-/g, ' ')
}

/** 小写的筛选器名称（建议列表的 Has label、No assignee、Exclude parent-issue） */
const LOOSE_KEY: ReadonlyMap<string, string> = new Map(
  Object.entries(FILTER_KEY).map(([key, value]) => [looseKey(key), value]),
)

/**
 * Exclude <key> 中的 key 是限定符（小写），与筛选器名称不同的按名称查表：created → Creation date。
 * Has / No 建议项用的是名称，不经此表
 */
const KEY_NAME: ReadonlyMap<string, string> = new Map([
  ['closed', 'Closed date'],
  ['created', 'Creation date'],
  ['merged', 'Merge date'],
  ['updated', 'Update date'],
  ['org', 'Organization'],
  ['repo', 'Repository'],
  ['reason', 'Closed reason'],
  ['review', 'Review state'],
  ['sha', 'Commit SHA'],
])

/** 建议列表「No 筛选器名」中可出现的筛选器（排除 has / no / is / in 这类关键字本身） */
const LOWER_KEY_SOURCE = Object.keys(FILTER_KEY)
  .map((key) => key.toLowerCase())
  .filter((key) => !['has', 'no', 'is', 'in'].includes(key))
  .sort((a, b) => b.length - a.length)
  .join('|')

/** 已知筛选器直接接中文，未知的保留原文并与中文之间留空格 */
function withKey(prefix: string, name: string): string {
  return joinCjk(prefix, LOOSE_KEY.get(looseKey(name)) ?? name)
}

function describe(text: string): string {
  return FILTER_DESCRIPTION[text] ?? text
}

function valueName(value: string): string {
  return FILTER_VALUE[value] ?? value
}

function items(name: string): string {
  return PICKER_ITEMS[name] ?? name
}

/**
 * 筛选框组件的 scoped 词条：建议列表（筛选器名称、说明、取值）、高级筛选、校验提示。
 * 拉取请求列表是同一组件，由 pulls/list.ts 取用
 */
export const FILTER_BAR_SCOPED: Readonly<Record<string, string>> = {
  ...own(FILTER_KEY),
  ...own(FILTER_DESCRIPTION),
  ...own(FILTER_VALUE),
  ...OPERATOR,

  // 高级筛选与建议
  Exclude: '排除',
  Qualifier: '限定詞',
  Operator: '運算子',
  Value: '值',
  From: '從',
  To: '到',
  Before: '早於',
  After: '晚於',
  Between: '介於',
  And: '且',
  Or: '或',
  'Filter values': '篩選值',
  'No filter': '無篩選器',
  'items shown.': '個項目已顯示。',

  // 校验提示（<code> 两侧的片段）
  'Unbalanced quotation marks': '引號不成對',
  'Unbalanced parentheses': '括號不成對',
  'Invalid value': '無效的值',
  'Empty value for': '下列篩選器的值為空',
  'Only one value allowed for': '下列篩選器只允許一個值',
  'Filter values are not supported for': '下列篩選器不支援篩選值',
  'cannot be used within groups': '不能在群組中使用',
  'is not supported.': '不受支援。',
  // 关闭高级筛选时的确认（Discard changes? 等）由通用词典处理
}

/** 筛选框组件的正则：建议列表的组合文字、高级筛选、校验提示（pulls/list.ts 同样取用） */
export const FILTER_BAR_RULES: readonly RegExpRule[] = [
  // 建议列表的组合 aria-label：Author, Filter, The author of the item
  [
    /^(.+), Filter(?:, (.+))?$/,
    (_, name, description) => `${keyName(name)}，篩選器${description ? `，${describe(description)}` : ''}`,
  ],
  [/^(@me|@copilot), (Signed-in user|Your AI pair programmer)$/, (_, value, text) => `${value}，${valueName(text)}`],
  [/^Has (.+), \1$/, (_, name) => `${joinCjk('有', keyName(name))}，${keyName(name)}`],
  [/^No (.+), \1$/, (_, name) => `${joinCjk('無', keyName(name))}，${keyName(name)}`],
  [/^Has ([a-z][\w -]*)$/, (_, name) => withKey('有', name)],
  [/^Exclude ([a-z][\w -]*)$/, (_, key) => withKey('排除', KEY_NAME.get(key) ?? key)],
  [new RegExp(`^No (${LOWER_KEY_SOURCE})$`), (_, name) => withKey('無', name)],
  // 高级筛选
  [
    /^Advanced filter dialog(?:: (\d+) valid filters?)?$/,
    (_, count) => `進階篩選器對話方塊${count ? `：${count} 個有效篩選器` : ''}`,
  ],
  // 对话框里一行一个筛选条件，按术语表 row → 「列」
  [/^Row (\d+)$/, '第 $1 列'],
  [/^Delete filter (\d+): (.+)$/, '刪除篩選器 $1：$2'],
  [/^(?:(.+), )?Qualifier (\d+)$/, (_, title, index) => `${title ? `${keyName(title)}，` : ''}限定詞 ${index}`],
  [
    /^(?:(.+), )?Operator (\d+)$/,
    (_, title, index) => `${title ? `${OPERATOR[title] ?? keyName(title)}，` : ''}運算子 ${index}`,
  ],
  // 介于运算符的两个输入框：Value 1 From / Value 1 To（原文无标点，译文不加括号）
  [/^Value (\d+) (From|To)$/, (_, index, edge) => `值 ${index} ${edge === 'From' ? '起始' : '結束'}`],
  [/^(?:(.+), )?Value (\d+)$/, (_, value, index) => `${value ? `${valueName(value)}，` : ''}值 ${index}`],
  [
    /^Enter a (text|number|date|value)$/,
    (_, type) => `輸入${{ text: '文字', number: '數字', date: '日期' }[type] ?? '值'}`,
  ],
  // 校验提示（issues 指查询中的错误，用「處」与議題计数区分）
  [/^Filter contains (\d+) issues?:$/, '篩選器有 $1 處錯誤：'],
  [/^Filter '(.+)' not supported$/, '不支援篩選器「$1」'],
  // 原文无逗号，译文用「且」连接
  [/^Filter '(.+)' is deprecated and will be removed in the future$/, '篩選器「$1」已淘汰且日後將移除'],
  [/^Maximum nested groups of (\d+) exceeded$/, '已超過巢狀群組上限 $1'],
  [/^Authenticate with (.+) to access$/, '使用 $1 驗證身分以存取'],
  [/^SSO required for (.+)$/, '$1 需要 SSO'],
  // 表单校验句（Title is invalid）与多句文本不在此翻译，交给 common 的校验规则与按句翻译
  [new RegExp(`^(?!(?:${VALIDATION_FIELD_SOURCE}) is invalid$)(?!.*[.!?] [A-Z])(.+) is invalid$`), '$1 無效'],
]

/** 筛选框组件的行内句（pulls/list.ts 同样取用） */
export const FILTER_BAR_INLINE: readonly InlineRule[] = [
  // 校验提示：<code> 是槽位，整句命中时连同中间的 for 一起译出；未命中时按上面的片段处理
  ['Invalid value {} for {}', '{} 不是篩選器 {} 的有效值'],
]

/**
 * 筛选栏：搜索框、建议列表（筛选器名称、说明、取值）、高级筛选对话框、校验提示、
 * 筛选按钮（作者 / 标签 / 项目 / 里程碑 / 受理人 / 类型）的选择器对话框、排序取值。
 */
export default {
  static: {
    // 搜索框
    'Search or filter': '搜尋或篩選',
    'Revert filter changes': '還原篩選器變更',
    'Loading Suggestions': '正在載入建議',
    'User Avatar': '使用者頭像',

    // 高级筛选
    'Add a filter': '新增篩選器',
    'Advanced filters': '進階篩選器',
    'Build complex filter queries': '建立複雜的篩選查詢',
    'To start building your query add your first filter using the button below.':
      '使用下方按鈕新增第一個篩選器，開始建立查詢。',
    'Select a filter': '選擇篩選器',
    'Make a selection': '請選擇',
    'Enter search text': '輸入搜尋文字',

    // 建议列表：筛选器说明（其余说明见 FILTER_DESCRIPTION，作为 scoped 收录）
    'Issues with no labels': '沒有標籤的議題',
    'Issues with no type': '沒有類型的議題',

    // 排序取值
    'Least reactions': '最少表情回應',
    'Most recent committer date': '提交者日期最新',
    'Least recent committer date': '提交者日期最舊',
    'Most recent author date': '作者日期最新',
    'Least recent author date': '作者日期最舊',
    'Unread first': '未讀優先',
    'Read first': '已讀優先',
    'Most thumbs up (👍) reactions': '最多 👍 表情回應',
    'Least thumbs up (👍) reactions': '最少 👍 表情回應',
    'Most thumbs down (👎) reactions': '最多 👎 表情回應',
    'Least thumbs down (👎) reactions': '最少 👎 表情回應',
    'Most laugh (😄) reactions': '最多 😄 表情回應',
    'Least laugh (😄) reactions': '最少 😄 表情回應',
    'Most confused (😕) reactions': '最多 😕 表情回應',
    'Least confused (😕) reactions': '最少 😕 表情回應',
    'Most tada (🎉) reactions': '最多 🎉 表情回應',
    'Least tada (🎉) reactions': '最少 🎉 表情回應',
    'Most heart (❤️) reactions': '最多 ❤️ 表情回應',
    'Least heart (❤️) reactions': '最少 ❤️ 表情回應',
    'Most eyes (👀) reactions': '最多 👀 表情回應',
    'Least eyes (👀) reactions': '最少 👀 表情回應',
    'Most rocket (🚀) reactions': '最多 🚀 表情回應',
    'Least rocket (🚀) reactions': '最少 🚀 表情回應',

    // 选择器对话框
    'Hidden selection': '已隱藏的選取項目',
    'Selected item hidden by search': '選取的項目因搜尋而隱藏',
    'Use the search to find specific items': '使用搜尋功能尋找特定項目',
    'Active filter:': '目前的篩選器：',
    'No filter added': '未新增篩選器',
    'Open filter dialog': '開啟篩選器對話方塊',
    'Free text is not supported.': '不支援自由文字。',
    'Error fetching search results': '擷取搜尋結果時發生錯誤',
  },
  scoped: {
    ...FILTER_BAR_SCOPED,

    // 筛选按钮与嵌套菜单（Assignees 见 metadata.ts）
    'Author...': '作者...',
    'Labels...': '標籤...',
    'Projects...': '專案...',
    'Milestones...': '里程碑...',
    'Assignees...': '負責人...',
    'Types...': '類型...',
    'Filter by labels': '依標籤篩選',
    'Filter by projects': '依專案篩選',
    'Filter by milestones': '依里程碑篩選',
    'Filter by user': '依使用者篩選',
    'No assignees': '無負責人',
  },
  regexp: [
    ...FILTER_BAR_RULES,
    // 选择器对话框（select 按术语表分译：复数的多选对话框作「選取」，单数的选择按钮作「選擇」）
    [new RegExp(`^Filter (${PICKER_ITEMS_SOURCE})$`), (_, name) => `篩選${items(name)}`],
    [new RegExp(`^Select (${PICKER_ITEMS_SOURCE})$`), (_, name) => `選取${items(name)}`],
    [new RegExp(`^Select an? (${PICKER_ITEM_SOURCE})$`), (_, name) => `選擇${PICKER_ITEM[name] ?? name}`],
    [
      new RegExp(`^([\\d,]+) (${PICKER_ITEMS_SOURCE}|${PICKER_ITEM_SOURCE}) selected$`),
      (_, count, name) =>
        `已選取 ${count} ${PICKER_MEASURE[name] ?? '個'}${PICKER_ITEMS[name] ?? PICKER_ITEM[name] ?? name}`,
    ],
    [new RegExp(`^Loading (${PICKER_ITEMS_SOURCE})\\.\\.\\.$`), (_, name) => `正在載入${items(name)}...`],
    [new RegExp(`^Error loading (${PICKER_ITEMS_SOURCE})\\.$`), (_, name) => `載入${items(name)}時發生錯誤。`],
    [new RegExp(`^No (${PICKER_ITEMS_SOURCE}) to show\\.$`), (_, name) => `沒有可顯示的${items(name)}。`],
    [
      new RegExp(`^Add a filter using the input to match (${PICKER_ITEMS_SOURCE})\\.$`),
      (_, name) => `使用輸入框新增篩選器以比對${items(name)}。`,
    ],
    // 计数可能是 human() 的缩写形式：1.2k
    [/^([\d.,]+[kmb]?) selected items hidden by search$/, '$1 個選取的項目因搜尋而隱藏'],
    // 条目名逐词匹配（每个后续词以空格开头），避免嵌套量词回溯
    [/^([\d,]+) [a-z]+(?: [a-z]+)* matching, showing first (\d+)$/, '$1 個相符項目，顯示前 $2 個'],
    [/^([\d.,]+[kmb]?) [a-z]+(?: [a-z]+)* matching$/, '$1 個相符項目'],
  ],
  inline: FILTER_BAR_INLINE,
  ignore: [LABEL_SUGGESTION_IGNORE],
} satisfies PageDictionary
