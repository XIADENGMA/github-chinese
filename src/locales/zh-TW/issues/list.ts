import type { PageDictionary } from '../../../core/types'
import { joinCjk } from '../helpers'

/** 列表项状态图标的无障碍描述 */
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
  'Archived (abandoned)': '已封存（已放棄）'
}

const ITEM_STATUS_SOURCE = Object.keys(ITEM_STATUS)
  .map(status => status.replace(/[()]/g, '\\$&'))
  .join('|')

/** 排序字段（按钮文字与菜单项） */
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
  'Thumbs up': '👍',
  'Thumbs down': '👎',
  Laugh: '😄',
  Hooray: '🎉',
  Confused: '😕',
  Rocket: '🚀',
  Eyes: '👀',
  Heart: '❤️'
}

const SORT_FIELD_SOURCE = Object.keys(SORT_FIELD).join('|')

/** 中文、日文假名、谚文 */
const CJK_LETTER_RE = /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uac00-\ud7af\uf900-\ufaff]/
/** 空白、全角标点、弯引号、省略号、破折号：两侧不加空格 */
const TIGHT_RE = /[\s\u2014\u2018\u2019\u201c\u201d\u2026\u3000-\u303f\uff00-\uffef]/

/** 交界处的字符与中文相接时要隔开：英文、数字、表情符号、半角标点 */
function apart(char: string | undefined): boolean {
  return char !== undefined && !CJK_LETTER_RE.test(char) && !TIGHT_RE.test(char)
}

/**
 * 中文与用户内容（标题、标签名、字段名、视图名、状态名）拼接，议题词典各文件共用。用户内容原文不加引号，译文也不加；
 * 与英文、数字、表情符号、半角标点相接时留一个空格，与中文、全角标点相接时直接相连
 * （依標籤 good first issue 篩選、依標籤缺陷篩選、依 Status 為 ✅ Done 篩選、查看 [Bug] Fix login）
 */
export function joinName(left: string, right: string): string {
  const end = left.at(-1)
  const start = right.at(0)
  const spaced =
    (end !== undefined && CJK_LETTER_RE.test(end) && apart(start)) || (start !== undefined && CJK_LETTER_RE.test(start) && apart(end))
  return spaced ? `${left} ${right}` : `${left}${right}`
}

/** 依 X 排序 / 依 X 遞減排序 / 依 X 遞減排列：原文无标点，译文不加冒号、逗号；表情符号两侧留空格 */
function sortBy(field: string, suffix: string, verb = '排序'): string {
  return joinName(joinName('依', SORT_FIELD[field] ?? field), `${suffix}${verb}`)
}

/** 选择计数中的条目单位 */
const UNIT: Readonly<Record<string, string>> = {
  issue: '議題',
  issues: '議題',
  'pull request': '拉取請求',
  'pull requests': '拉取請求',
  'issue or pull request': '議題或拉取請求',
  'issues and pull requests': '議題和拉取請求',
  // 与通用词典的 list item → 「清單項目」一致
  'list item': '清單項目',
  'list items': '清單項目'
}

const UNIT_SOURCE = Object.keys(UNIT)
  .sort((a, b) => b.length - a.length)
  .join('|')

/** 全选勾选框标签中的条目名（复数） */
const SELECT_ALL_UNIT: Readonly<Record<string, string>> = {
  issues: '議題',
  'pull requests': '拉取請求',
  'list items': '清單項目'
}

/** 链接的拉取请求的状态 */
const PR_STATE: Readonly<Record<string, string>> = {
  Open: '開放中',
  Closed: '已關閉',
  Merged: '已合併',
  Draft: '草稿',
  'State unavailable': '無法取得狀態'
}

const PR_STATE_SOURCE = Object.keys(PR_STATE).join('|')

/** 看板列 “No 字段” 中的字段名 */
const BOARD_FIELD: Readonly<Record<string, string>> = {
  Status: '狀態',
  Assignees: '負責人',
  Assignee: '負責人',
  Labels: '標籤',
  Milestone: '里程碑',
  Type: '類型',
  'Issue type': '議題類型',
  Project: '專案',
  Priority: '優先順序',
  Repository: '儲存庫',
  Author: '作者'
}

const BOARD_FIELD_SOURCE = Object.keys(BOARD_FIELD).join('|')

/** 批量标记的已读状态 */
const READ_STATE: Readonly<Record<string, string>> = { read: '已讀', unread: '未讀' }

/** 看板卡片父议题的状态（读屏）：(Open) */
const PARENT_STATE: Readonly<Record<string, string>> = {
  Open: '開放中',
  Closed: '已關閉',
  Completed: '已完成',
  'Not planned': '不予處理',
  Duplicate: '重複'
}

/** 代理会话耗时单位 */
const ELAPSED_UNIT: Readonly<Record<string, string>> = { d: '天', h: '小時', m: '分鐘', s: '秒' }

/** 代理会话状态动词 */
const SESSION_VERB: Readonly<Record<string, string>> = { Running: '已執行', Ran: '執行了', Active: '活躍了' }

const ELAPSED_SOURCE = '\\d+[dhms](?: \\d+[dhms])?'

/** 耗时：数字与单位之间、各段之间都留空格（2h 3m → 2 小時 3 分鐘） */
function elapsed(text: string): string {
  return text.replace(/(\d+)([dhms])/g, (_, value: string, unit: string) => `${value} ${ELAPSED_UNIT[unit] ?? unit}`)
}

/** 前缀 + 「位於 A 和 B 之間」：条目标题是用户内容，不加引号；与中文之间按 joinName 留空格 */
function between(prefix: string, first: string, second: string): string {
  return joinName(joinName(joinName(joinName(prefix, first), '和'), second), '之間')
}

/**
 * 议题列表：存储库议题列表（React）与 /issues 共用的列表外壳、列表项、空状态、批量操作、
 * 固定议题、视图选项与看板布局、拖放排序、首次贡献横幅。
 */
export default {
  static: {
    // 头部与侧栏
    'Search Issues': '搜尋議題',
    'Search issues': '搜尋議題',
    'Search Issues and PRs': '搜尋議題和 PR',
    'Search PRs': '搜尋 PR',
    'Issue list': '議題清單',
    'Navigation sidebar': '導覽側邊欄',
    'Open Issues sidebar navigation': '開啟議題側邊欄導覽',
    'Issues navigation': '議題導覽',
    'Open views': '開啟檢視清單',
    'Pinned views': '已釘選的檢視',
    'All views': '所有檢視',
    'Default views': '預設檢視',
    'Untitled view': '未命名檢視',
    'Private preview': '私人預覽',
    'Issues display density': '議題顯示密度',
    // /issues 仪表板“提及我的”视图的说明
    'Issues mentioning you': '提及你的議題',

    // 列表控件
    'Filter issues by state': '依狀態篩選議題',
    'Issue list controls': '議題清單控制項',
    // 操作栏溢出菜单：More + 操作栏名称
    'More Issue list controls': '更多議題清單控制項',
    'More Issue actions': '更多議題動作',
    'Bulk actions': '批次動作',
    'Sort by reactions': '依表情回應排序',
    'Updating issues': '正在更新議題',
    'Loading issues': '正在載入議題',
    'Saved view issues results': '已儲存檢視的議題結果',
    'Unable to refresh issues': '無法重新整理議題',
    'Unable to refresh issues.': '無法重新整理議題。',
    'Unable to refresh issues. Showing previously loaded results.': '無法重新整理議題。顯示先前載入的結果。',
    'Showing previously loaded results.': '顯示先前載入的結果。',
    'View issue': '查看議題',
    'Loading issue': '正在載入議題',

    // 列表项
    'Closed issue (completed)': '已關閉的議題（已完成）',
    'Closed issue (not planned)': '已關閉的議題（不予處理）',
    'Blocked, filter by blocked issues': '受阻擋，篩選受阻擋的議題',
    'sub-issues summary': '子議題摘要',
    '1 linked PR': '1 個已連結的 PR',
    'Pull request link unavailable': '無法取得拉取請求連結',
    'New activity.': '有新動態。',
    'list item action bar': '清單項目動作列',
    'Learn more about searching and filtering issues and pull requests.': '瞭解如何搜尋、篩選議題和拉取請求。',
    'Search for issues.': '搜尋議題。',
    'No issues matched your search': '沒有相符的議題',
    'No more issues': '沒有更多議題',
    'Failed to load issues. Try refreshing the page.': '無法載入議題。請重新整理頁面。',
    'More issues available': '還有更多議題',
    'Issue options': '議題選項',

    // 空状态：To get started, you should <create an issue>.
    'Welcome to issues!': '歡迎使用議題！',
    'Issues are used to track todos, bugs, feature requests, and more. As issues are created, they’ll appear here in a searchable and filterable list. To get started, you should':
      '議題可用來追蹤待辦事項、錯誤、功能請求等。建立的議題會顯示在這裡，可供搜尋和篩選。若要開始使用，請',
    "Issues are used to track todos, bugs, feature requests, and more. As issues are created, they'll appear here in a searchable and filterable list. To get started, you should":
      '議題可用來追蹤待辦事項、錯誤、功能請求等。建立的議題會顯示在這裡，可供搜尋和篩選。若要開始使用，請',
    'create an issue': '建立議題',
    'There aren’t any open issues.': '沒有開放中的議題。',
    "There aren't any open issues.": '沒有開放中的議題。',
    'Try adjusting your search filters.': '試著調整搜尋篩選器。',
    'We encountered an error trying to load issues.': '載入議題時發生錯誤。',

    // 固定议题
    'Pinned issues': '已釘選的議題',
    'Drag and drop pinned issues list.': '可拖放的已釘選議題清單。',
    'Advanced move...': '進階移動...',
    'Could not reorder pinned issues. Please try again.': '無法重新排列已釘選的議題。請再試一次。',
    'Could not unpin issue. Please try again.': '無法取消釘選議題。請再試一次。',

    // 首次贡献横幅
    'Dismiss for this repository only': '僅在此儲存庫中關閉',
    'Dismiss for all repositories': '在所有儲存庫中關閉',
    'If you have a bug or an idea, read the': '如果你發現錯誤或有新想法，請在建立議題前閱讀',
    'contributing guidelines': '貢獻指南',
    'before opening an issue.': '。',
    "If you're ready to tackle some open issues,": '如果你準備好處理一些開放中的議題，',
    'If you’re ready to tackle some open issues,': '如果你準備好處理一些開放中的議題，',
    "we've collected some good first issues for you.": '我們為你挑選了一些適合新手的議題。',
    'we’ve collected some good first issues for you.': '我們為你挑選了一些適合新手的議題。',
    'First-time contribution banner dismissed': '已關閉首次貢獻橫幅',
    // 经典横幅（无贡献指南时）：… You can also take a look at the <Open Source Guide>. … <we've collected some good first issues for you>.
    'If you have a bug or an idea, browse the open issues before opening a new one. You can also take a look at the':
      '如果你發現錯誤或有新想法，請先瀏覽開放中的議題，再建立新議題。你也可以查看',
    'Open Source Guide': '開源指南',
    'Learn about Open Source and how to contribute': '瞭解開源以及如何參與貢獻',
    "we've collected some good first issues for you": '我們為你挑選了一些適合新手的議題',
    'we’ve collected some good first issues for you': '我們為你挑選了一些適合新手的議題',
    // 维护者横幅（议题列表与拉取请求列表共用，放 static）：
    // Now, GitHub will help potential first-time contributors <discover issues> labeled with <good first issue>
    // 标签名固定在句末：链接只译「探索」，labeled with 补出「議題」（原文无标点，不加冒号），
    // 读作「…探索 帶有以下標籤的議題 good first issue」
    'Label issues and pull requests for new contributors': '為議題和拉取請求加上適合新貢獻者的標籤',
    'Now, GitHub will help potential first-time contributors': '現在，GitHub 會協助潛在的首次貢獻者',
    'discover issues': '探索',
    'labeled with': '帶有以下標籤的議題',

    // 批量操作
    'Apply issue type': '套用議題類型',
    'Bulk update had an error': '批次更新發生錯誤',
    'Bulk update is pending': '批次更新等待中',
    'Bulk update completed successfully': '批次更新已成功完成',
    'Bulk update completed with errors': '批次更新已完成但發生錯誤',
    'Bulk update failed': '批次更新失敗',
    'Issues updated, but the results could not be refreshed': '議題已更新，但無法重新整理結果',
    'Could not update issues': '無法更新議題',
    'Failed to load projects': '無法載入專案',
    'Select issues individually to change read state': '請逐一選取議題以變更已讀狀態',
    'Read state updated, but the results could not be refreshed': '已讀狀態已更新，但無法重新整理結果',
    'Could not update read state': '無法更新已讀狀態',
    'The update timed out, but some changes might have been applied. Refresh the page before trying again.':
      '更新逾時，但部分變更可能已套用。請重新整理頁面後再試一次。',

    // 侧边面板
    'Could not delete the issue. The issue was restored. Please try again.': '無法刪除議題。議題已還原。請再試一次。',
    'The issue was deleted, but the dashboard could not be refreshed. Reload the page to recover.':
      '議題已刪除，但無法重新整理儀表板。請重新載入頁面。',
    'Issue deletion failed': '議題刪除失敗',
    'Issue deleted; refresh failed': '議題已刪除；重新整理失敗',
    'Could not delete the issue. The sub-issue was restored. Please try again.': '無法刪除議題。子議題已還原。請再試一次。',
    'The issue was deleted, but this page could not be refreshed. Reload the page to recover.':
      '議題已刪除，但無法重新整理此頁面。請重新載入頁面。',

    // 视图选项
    'View options': '檢視選項',
    'Unable to load view options': '無法載入檢視選項',
    'Loading view options': '正在載入檢視選項',
    'Swimlane by': '泳道分組依據',
    'View options have unsaved changes': '檢視選項有未儲存的變更',
    'Close view options': '關閉檢視選項',
    'Unsaved layout changes': '未儲存的版面配置變更',

    // 看板
    'Nothing to group by': '沒有可分組的欄位',
    'Choose a field to group by to see this view as a board.': '選擇分組欄位，以看板形式查看此檢視。',
    'Could not move this item. Please try again.': '無法移動此項目。請再試一次。',
    'Initializing session': '正在初始化工作階段',
    'Could not check for this issue': '無法檢查此議題',
    'Not available for this issue': '此議題無法使用',
    'Assign to agent': '指派給代理',
    'More labels': '更多標籤',
    'Link copied.': '已複製連結。',
    'Could not copy link.': '無法複製連結。',
    "Some cards couldn't load all details.": '部分卡片無法載入所有詳細資料。',
    'Some cards couldn’t load all details.': '部分卡片無法載入所有詳細資料。',
    'Unable to load all details.': '無法載入所有詳細資料。',
    'Could not load more board groups. Try again.': '無法載入更多看板群組。請再試一次。',
    'Too many board groups are loaded to continue. Narrow the view and try again.':
      '已載入的看板群組過多，無法繼續。請縮小檢視範圍後再試一次。',
    'Could not load more board groups.': '無法載入更多看板群組。',
    'Could not load more cards. Try again.': '無法載入更多卡片。請再試一次。',
    'You do not have permission to move this item.': '你沒有移動此項目的權限。',
    'Wait for this item’s last move to finish before moving it again.': '請等此項目上一次移動完成後再移動。',
    "Wait for this item's last move to finish before moving it again.": '請等此項目上一次移動完成後再移動。',
    'Moved. This item no longer matches this view and will not appear on the next refresh.':
      '已移動。此項目不再符合此檢視，下次重新整理後將不會顯示。',
    'You cannot move this item.': '你無法移動此項目。',

    // 拖放与键盘移动
    'How to move objects via keyboard': '如何使用鍵盤移動物件',
    'This navigation is only available when move mode is activated.': '只有在啟用移動模式時才能使用此導覽。',
    'Keyboard Shortcut': '鍵盤快速鍵',
    'Move selected items': '移動選取的項目',
    'Move selected item': '移動選取的項目',
    'Missing selection': '未選取項目',
    'The first item you selected cannot be deselected when performing a move.': '移動時無法取消選取你選取的第一個項目。',
    'I understand': '我瞭解',
    'First item in list.': '清單中的第一個項目。',
    'Last item in list.': '清單中的最後一個項目。',
    'Move item one position': '將項目移動一個位置',
    'Cancel drag mode': '取消拖曳模式',
    'Place item': '放置項目',
    'Entry must be greater than 0.': '輸入值必須大於 0。',
    'Entry is required.': '必須輸入值。',
    'Entry is invalid.': '輸入值無效。',
    'Move item before': '將項目移到前面',
    'Move item after': '將項目移到後面',
    'Move to position': '移到指定位置'
  },
  scoped: {
    // 头部与侧栏
    'Issue filters': '議題篩選器',
    'Issues sidebar navigation': '議題側邊欄導覽',
    // /issues 仪表板的筛选区域（landmark）
    'Filter issues': '篩選議題',
    'List view': '清單檢視',
    Pages: '頁面',
    Views: '檢視',
    'Assigned to me': '指派給我的',
    'Created by me': '我建立的',
    Mentioned: '提及我的',
    'Mentioning me': '提及我的',
    'Involves me': '與我有關',
    'Recent activity': '最近活動',
    "What's new": '新功能',
    'What’s new': '新功能',

    // 筛选按钮（Filter by label、Filter by project 见 filter.ts，Labels 见 metadata.ts）
    Milestones: '里程碑',
    Types: '類型',
    'Filter by milestone': '依里程碑篩選',
    'Filter by assignees': '依負責人篩選',
    'Filter by assignee': '依負責人篩選',
    'Filter by issue type': '依議題類型篩選',

    // 列表控件
    Density: '密度',
    Compact: '精簡',
    'Comfortable display density': '舒適顯示密度',
    'Compact display density': '精簡顯示密度',
    'Sort…': '排序…',
    Order: '順序',
    ascending: '遞增',
    descending: '遞減',
    Updated: '更新時間',
    'Created on': '建立時間',
    'Last updated': '上次更新',
    'Total comments': '留言總數',
    'Best match': '最相符',
    'Total reactions': '表情回應總數',
    // 反应排序项（Thumbs up、Thumbs down 由通用词典处理）
    Laugh: '大笑',
    Hooray: '歡呼',
    Confused: '困惑',
    Rocket: '火箭',
    Eyes: '眼睛',
    Heart: '愛心',
    'Most commented': '最多留言',
    'Least commented': '最少留言',
    'Most reactions': '最多表情回應',
    // 已读状态（Unread 见 filter.ts）
    Read: '已讀',

    // 批量操作
    'Mark as': '標示為',
    'Apply labels': '套用標籤',
    Assign: '指派',
    'Apply assignees': '套用負責人',
    'Apply milestone': '套用里程碑',
    'Add to projects': '加入專案',

    // 列表项（/issues 仪表板的拉取请求列表另有 was merged，后接时间元素）。
    // #12 by octocat was closed 3 days ago 里的 octocat 是作者（链接提示 Filter by author），不是关闭者；
    // 只译「由 octocat 關閉於」会读成 octocat 关闭了议题。原文无标点，补「建立後」：由 octocat 建立後關閉於 3 天前
    'Open issue': '開放中的議題',
    by: '由',
    'was closed': '建立後關閉於',
    'was merged': '建立後合併於',
    '· Updated': '· 更新於',
    '· Duplicate': '· 重複',
    'more label': '個其他標籤',
    'more labels': '個其他標籤',
    'Only the first': '僅顯示前',
    'linked pull requests are shown.': '個已連結的拉取請求。',
    'State unavailable': '無法取得狀態',
    // 列表项勾选框的无障碍名称前缀（标题为空时）；只剩说明的 More information available below. 由通用词典处理
    'Select:': '選取：',

    // 空状态（Something went wrong 由通用词典处理）
    'Invalid query': '查詢無效',
    'Visit a lower page.': '請前往前面的頁面。',
    'Try a different search query.': '嘗試其他搜尋字詞。',
    'Enter a query to start searching.': '輸入查詢以開始搜尋。',
    'Learn more about searching and filtering': '瞭解搜尋和篩選',
    'All caught up': '全部處理完畢',
    'Try a new search': '嘗試新的搜尋',
    'Try refreshing the page.': '請重新整理頁面。',
    'Reload page': '重新載入頁面',

    // 视图选项（Table 由通用词典处理）
    List: '清單',
    Board: '看板',
    Layout: '版面配置',
    'Column by': '分欄依據',
    'Group by': '分組依據',
    Configuration: '設定',
    'Unsaved changes': '未儲存的變更',
    'No value': '無值',

    // 看板卡片：代理会话、日期令牌、父议题、存储库图标（公共/专用存储库与「在新分頁中開啟」由通用词典处理）
    'In progress': '進行中',
    Complete: '已完成',
    'Created:': '建立時間：',
    'Updated:': '更新時間：',
    'Closed:': '關閉時間：',
    'Parent issue:': '父議題：',
    'Archived repository': '已封存的儲存庫',
    'Forked repository': '分叉的儲存庫',

    // 拖放（读屏说明三句随原文分句，与 projects/views.ts 同一句式）
    Action: '動作',
    Item: '項目',
    'Item(s)': '項目',
    'To pick up a draggable item, press the space bar. While dragging, use the arrow keys to move the item. Press space again to drop the item in its new position, or press escape to cancel.':
      '若要拿起可拖曳的項目，請按空白鍵。拖曳時，使用方向鍵移動項目。再按一次空白鍵將項目放到新位置，或按 Esc 鍵取消。'
  },
  regexp: [
    // 全选读屏：3 issues of 25 selected（与通用词典的「25 個清單項目中已選取 3 個」同一写法；
    // 1,234 results、3 selected、3 of 25 selected 由通用词典处理）
    [
      new RegExp(`^([\\d,]+) (${UNIT_SOURCE}) (?:of ([\\d,]+) )?selected$`),
      (_, count, unit, total) =>
        total ? `${total} 個${UNIT[unit] ?? unit}中已選取 ${count} 個` : `已選取 ${count} 個${UNIT[unit] ?? unit}`
    ],
    // 计数在独立节点中时的后半段：<3> of 25 selected（原文无标点，不加逗号）
    [/^of ([\d,]+) selected$/, '/$1 已選取'],
    // 排序按钮：Sort by Newest descending → 依最新遞減排序（与 pulls、organization 同一写法）
    [
      new RegExp(`^Sort by (${SORT_FIELD_SOURCE}) (ascending|descending)$`),
      (_, field, direction) => sortBy(field, direction === 'ascending' ? '遞增' : '遞減')
    ],
    [new RegExp(`^Sort by (${SORT_FIELD_SOURCE})$`), (_, field) => sortBy(field, '')],
    // 读屏摘要：12 issues found. List is sorted by Last updated in descending order.（结果的量词按术语表用「項」）
    [
      new RegExp(
        `^([\\d.,]+k?) (issues?|pull requests?|results?) found\\. List is sorted by (${SORT_FIELD_SOURCE}) in (ascending|descending) order\\.$`
      ),
      (_, count, noun, field, direction) =>
        `找到 ${count} ${/^issue/.test(noun) ? '個議題' : /^pull/.test(noun) ? '個拉取請求' : '項結果'}。${sortBy(field, direction === 'ascending' ? '遞增' : '遞減', '排列')}。`
    ],
    // 分页播报（原文无标点，译文不加括号、逗号）
    [/^Page (\d+) of (\d+) loaded with (\d+) items$/, '第 $1/$2 頁已載入 $3 個項目'],
    // 列表项状态图标
    [new RegExp(`^Status: (${ITEM_STATUS_SOURCE})\\.$`), (_, status) => `狀態：${ITEM_STATUS[status] ?? status}。`],
    // 列表项的无障碍名称：[Selected. ]标题[. New activity]. More information available below.
    // （原文状态后是句号，不改冒号；与 pulls 的「已選取。<标题>。」同一写法）
    [
      /^(Selected\. )?(.+?)(\. New activity)?\. More information available below\.$/,
      (_, selected, title, activity) => `${selected ? '已選取。' : ''}${title}${activity ? '。有新動態' : ''}。下方有更多資訊。`
    ],
    [/^Select: (.+)$/, '選取：$1'],
    [/^Selected\. (.+)\.$/, '已選取。$1。'],
    [/^Unselected\. (.+)\.$/, '未選取。$1。'],
    // 全选勾选框的标签（读屏）：Select all issues: <列表标题>
    [
      /^Select all (issues|pull requests|list items):(?: (.+))?$/,
      (_, unit, title) => `全選${SELECT_ALL_UNIT[unit] ?? unit}：${title ?? ''}`
    ],
    // 列表项元数据（12 comments 由通用词典处理）
    [
      /^([\d,]+) (Total reactions|Thumbs up|Thumbs down|Laugh|Hooray|Confused|Rocket|Eyes|Heart) reactions?$/,
      (_, count, label) => (label === 'Total reactions' ? `${count} 個表情回應` : `${count} 個 ${SORT_FIELD[label] ?? label} 表情回應`)
    ],
    [/^(\d+) \/ (\d+) sub-issues completed, filter by parent issue ([\w.-]+\/[\w.-]+#\d+)$/, '已完成 $1/$2 個子議題，依父議題 $3 篩選'],
    [/^Filter by author (\S+)$/, '依作者 $1 篩選'],
    [/^Filter by assignee (\S+)$/, '依負責人 $1 篩選'],
    // 标签名是用户内容，两侧不加引号
    [/^Filter by label (.+)$/, (_, name) => joinName(joinName('依標籤', name), '篩選')],
    [/^Filter by repository ([\w.-]+\/[\w.-]+)$/, '依儲存庫 $1 篩選'],
    // 议题字段徽章：Filter by Priority: High → 依 Priority 為 High 篩選（字段名、取值不加引号）
    [/^Filter by ([^:]+): (.+)$/, (_, field, value) => joinName(joinName(joinName(joinName('依', field), '為'), value), '篩選')],
    [/^Show (\d+) more issue field values?$/, '再顯示 $1 個議題欄位值'],
    [/^\+(\d+), show all (\d+) assignees$/, '+$1，顯示全部 $2 位負責人'],
    [/^Milestone: (.+)$/, '里程碑：$1'],
    [/^View ([\w-]+(?:\[bot\])?)'s profile$/, '查看 $1 的個人檔案'],
    // 链接的拉取请求
    [
      new RegExp(`^1 linked pull request (\\S*#\\d+)(?:: (.+))?, (${PR_STATE_SOURCE})$`),
      (_, reference, title, state) => `1 個已連結的拉取請求 ${reference}${title ? `：${title}` : ''}，${PR_STATE[state] ?? state}`
    ],
    [/^([\d,]+) linked pull requests?$/, '$1 個已連結的拉取請求'],
    [/^([\d,]+) linked pull requests, showing first (\d+)$/, '$1 個已連結的拉取請求，顯示前 $2 個'],
    [/^([\d,]+) linked PRs$/, '$1 個已連結的 PR'],
    [/^Only the first (\d+) of ([\d,]+) linked pull requests are shown\.$/, '僅顯示 $2 個已連結拉取請求中的前 $1 個。'],
    [new RegExp(`^(\\S*#\\d+) · (${PR_STATE_SOURCE})$`), (_, reference, state) => `${reference} · ${PR_STATE[state] ?? state}`],
    [/^link to the pull request #(.+)$/, '拉取請求 #$1 的連結'],
    [/^link to the issue #(.+)$/, '議題 #$1 的連結'],
    // 结果上限横幅
    [
      /^Showing the first ([\d,]+) (issues|pull requests)\. To view additional \2, please refine your search\.$/,
      (_, count, noun) => {
        const name = noun === 'issues' ? '議題' : '拉取請求'
        return `僅顯示前 ${count} 個${name}。若要查看更多${name}，請縮小搜尋範圍。`
      }
    ],
    // /issues 仪表板收件箱空状态（attention 不译「關注」，免得与 watch 撞词）
    [
      /^When an? (issue|pull request) needs your review or attention, it[’']ll appear here\.$/,
      (_, noun) => `需要你審查或留意的${noun === 'issue' ? '議題' : '拉取請求'}會顯示在這裡。`
    ],
    // 固定议题
    [/^Pinned issue #(\d+) options$/, '已釘選議題 #$1 的選項'],
    // 取消固定按钮的无障碍名称：Unpin issue #12, <标题>（逗号随原文，不改成冒号）
    [/^Unpin issue #(\d+), (.+)$/, '取消釘選議題 #$1，$2'],
    // 首次贡献横幅
    [/^👋 Want to contribute to ([\w.-]+\/[\w.-]+)\?$/, '👋 想為 $1 做出貢獻嗎？'],
    // 批量更新
    [
      /^Bulk update is in progress (\d+) %(?: \((\d+) issues failing to update\))?$/,
      (_, percent, failed) => `批次更新進行中 ${percent}%${failed ? `（${failed} 個議題更新失敗）` : ''}`
    ],
    [/^\((\d+) issues failing to update\)$/, '（$1 個議題更新失敗）'],
    [/^Could not update (\d+) of (\d+) issues$/, '$2 個議題中有 $1 個無法更新'],
    [/^(\d+) issues? updated$/, '已更新 $1 個議題'],
    [/^Updating (\d+) issues?$/, '正在更新 $1 個議題'],
    [/^(\d+) issues? marked as (read|unread)$/, (_, count, state) => `已將 ${count} 個議題標示為${READ_STATE[state] ?? state}`],
    [/^Marking (\d+) issues? as (read|unread)$/, (_, count, state) => `正在將 ${count} 個議題標示為${READ_STATE[state] ?? state}`],
    [/^Select at most (\d+) issues to change read state$/, '最多選取 $1 個議題以變更已讀狀態'],
    [/^Select between 1 and ([\d,]+) issues$/, '請選取 1 到 $1 個議題'],
    // 看板卡片
    [/^Author: (.+)$/, '作者：$1'],
    [/^Assignee: (.+)$/, '負責人：$1'],
    [/^Type: (.+)$/, '類型：$1'],
    [/^Sub-issues progress: (\d+) \/ (\d+) completed$/, '子議題進度：已完成 $1/$2'],
    // 卡片标签溢出提示：bug, docs and 2 more（反应提示 Reacted by … 与“, and 2 more”由通用词典处理）
    [/^(?!Reacted by |, )(.+) and (\d+) more$/, '$1 和其他 $2 個'],
    [new RegExp(`^No (${BOARD_FIELD_SOURCE})$`), (_, field) => `無${BOARD_FIELD[field] ?? field}`],
    [/^\((Open|Closed|Completed|Not planned|Duplicate)\)$/, (_, state) => `（${PARENT_STATE[state] ?? state}）`],
    // 看板卡片的代理会话
    [/^Open (Copilot|Claude|Codex) session$/, '開啟 $1 工作階段'],
    [/^(Copilot|Claude|Codex) session(:?)$/, (_, agent, colon) => `${agent} 工作階段${colon ? '：' : ''}`],
    [
      new RegExp(`^(.+?) · Updated (${ELAPSED_SOURCE}) ago · (Running|Ran|Active) for (${ELAPSED_SOURCE})$`),
      (_, head, updated, verb, duration) =>
        `${head} · ${joinCjk(elapsed(updated), '前更新')} · ${joinCjk(SESSION_VERB[verb] ?? verb, elapsed(duration))}`
    ],
    // 拖放播报（条目标题是用户内容，原文无引号，译文不加；标题与中文之间按 joinName 留空格）
    [/^Moving (.+)\.$/, (_, title) => `${joinName('正在移動', title)}。`],
    [/^Between (.+) and (.+)\.$/, (_, first, second) => `${between('位於', first, second)}。`],
    [/^Cancel moving (.+) and (\d+) other items$/, (_, title, count) => joinName(joinName('取消移動', title), `和其他 ${count} 個項目`)],
    [/^Cancel moving (.+)$/, (_, title) => joinName('取消移動', title)],
    [/^(.+) successfully moved to first item in list\.$/, (_, title) => `${joinName(title, '已移到清單中的第一個位置')}。`],
    [/^(.+) successfully moved to last item in list\.$/, (_, title) => `${joinName(title, '已移到清單中的最後一個位置')}。`],
    [
      /^(.+) successfully moved between (.+) and (.+)\.$/,
      (_, title, first, second) => `${between(joinName(title, '已移到'), first, second)}。`
    ],
    [/^(.+) (?:did not move|not moved)\.$/, (_, title) => `${joinName(title, '未移動')}。`],
    [/^Entry must be less than or equal to (\d+)\.$/, '輸入值必須小於或等於 $1。'],
    [/^(.+) will be moved\.\.\.$/, (_, title) => `${joinName(title, '將會移動')}...`],
    [/^(.+) will not be moved\.$/, (_, title) => `${joinName(title, '不會移動')}。`],
    [/^(.+) will be first item in the list\.$/, (_, title) => `${joinName(title, '將成為清單中的第一個項目')}。`],
    [/^(.+) will be last item in the list\.$/, (_, title) => `${joinName(title, '將成為清單中的最後一個項目')}。`],
    [/^(.+) will be between (.+) and (.+)\.$/, (_, title, first, second) => `${between(joinName(title, '將位於'), first, second)}。`],
    [/^(.+) cannot be moved to an invalid position\.$/, (_, title) => `${joinName(title, '無法移到無效位置')}。`],
    // 兜底（放在最后，具体规则优先）：已存档标签的无障碍名称、看板泳道的折叠按钮、看板卡片的操作菜单
    // （标签名、分组值、卡片标题是用户内容，原文无标点，译文不加冒号、引号）
    [/^Archived (.+)$/, (_, name) => joinName('已封存', name)],
    [/^(Collapse|Expand) (.+)$/, (_, action, name) => joinName(action === 'Collapse' ? '摺疊' : '展開', name)],
    // 评论的操作按钮（Actions for octocat's comment, …）由通用词典处理
    [/^Actions for (?!.*['’]s (?:comment|reply), )(.+)$/, (_, name) => joinName(name, '的動作')]
  ],
  attributeRules: [
    // 固定议题卡片的标题链接：aria-label="View <议题标题>"（PinnedIssueCard：
    // div[class*="PinnedIssueContainer__"] > div > div[class*="titleOptionsContainer__"] > a）。
    // 标题原样保留；选择器不依赖 aria-label 的取值，同容器内的选项按钮是 button，不受影响
    [
      '[class*="PinnedIssueContainer__"] [class*="titleOptionsContainer__"] > a',
      'aria-label',
      /^View (.+)$/,
      (_, title) => joinName('查看', title)
    ]
  ]
} satisfies PageDictionary
