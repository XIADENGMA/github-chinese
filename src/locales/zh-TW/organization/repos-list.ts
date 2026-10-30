import type { PageDictionary } from '../../../core/types'
import { VIEW_ICON_RULES } from '../issues/views'

/**
 * React 存储库列表：/repos（个人存储库列表）与 /orgs/<组织>/repositories 共用。
 * 列表与条目统计、排序与显示密度、侧栏与已保存视图、ProTip 提示、空状态、读屏播报；筛选框见 repos-filter.ts。
 */

const COUNT = '(\\d[\\d.,]*[kKmM]?\\+?)'
const REPO = '([\\w.-]+/[\\w.-]+)'

/** 条目统计：9.3k forks in vuejs/core、5,000+ issues in microsoft/vscode */
const STAT_KINDS: Readonly<Record<string, string>> = {
  fork: '分叉',
  forks: '分叉',
  star: '星',
  stars: '星',
  issue: '議題',
  issues: '議題',
  'pull request': '拉取請求',
  'pull requests': '拉取請求',
}

/** 条目统计的量词（术语表第 2 节）：星号计数用「顆」（55k 顆星），其余用「個」 */
const STAT_MEASURES: Readonly<Record<string, string>> = { star: '顆', stars: '顆' }

/** 排序字段 */
const SORT_FIELDS: Readonly<Record<string, string>> = {
  Relevance: '相關性',
  'Last pushed': '上次推送',
  Name: '名稱',
  Stars: '星號',
}

/** 排序方向（repos-filter.ts 的排序取值共用） */
export function sortDirection(order: string): string {
  return order === 'ascending' ? '遞增' : '遞減'
}

export default {
  static: {
    // /repos 的分页标题
    'User repositories': '使用者儲存庫',

    // 列表头部与侧栏
    'Repository filters': '儲存庫篩選器',
    'Open Repository filters': '開啟儲存庫篩選器',
    'Repository views': '儲存庫檢視',
    'Contributed by me': '我貢獻的',
    'Admin access': '管理員權限',
    'Repositories list': '儲存庫清單',
    'Repositories list display density': '儲存庫清單顯示密度',
    'Last pushed': '上次推送',
    // 窄屏：侧栏折叠按钮的读屏说明（同 issues 的 Change the issues type filter）、头部操作折叠成的菜单按钮
    'Change the repository type filter': '切換儲存庫檢視',
    'More repository actions': '更多儲存庫動作',
    // 条目末尾设置图标的 Tooltip 与 aria-label
    'Repository settings': '儲存庫設定',

    // 空状态（页码超出范围的两句见 scoped）；读屏播报把标题与说明连成一句
    'No repositories matched your search.': '沒有相符的儲存庫。',
    'Try a different search query.': '嘗試其他搜尋字詞。',
    'No repositories matched your search. Try a different search query.': '沒有相符的儲存庫。嘗試其他搜尋字詞。',
    "Your teams don't have access to any repositories.": '你的團隊沒有任何儲存庫的存取權。',
    'Your teams don’t have access to any repositories.': '你的團隊沒有任何儲存庫的存取權。',

    // ProTip 随机提示：被 <code> 拆开的句子按片段收录
    "When viewing an organization's repositories, you can use the": '查看組織的儲存庫時，可以使用',
    'When viewing an organization’s repositories, you can use the': '查看組織的儲存庫時，可以使用',
    'filter to filter by custom property.': '篩選器依自訂屬性篩選。',
    'Using a comma within certain filters will aggregate the results. For example:':
      '在某些篩選器中使用逗號會合併結果。例如：',
    'will show all repositories that have either Go or Ruby as their primary language.':
      '會顯示主要語言為 Go 或 Ruby 的所有儲存庫。',
    // 只在 /repos 出现（组织页没有已保存的视图）
    "Don't forget that you can create saved views to keep track of your most important repositories!":
      '別忘了你可以建立已儲存的檢視來隨時掌握最重要的儲存庫！',
    'Don’t forget that you can create saved views to keep track of your most important repositories!':
      '別忘了你可以建立已儲存的檢視來隨時掌握最重要的儲存庫！',
  },
  scoped: {
    'Comfortable display density': '舒適顯示密度',
    'Compact display density': '精簡顯示密度',
    Relevance: '相關性',
    Order: '順序',
    // 侧栏：服务端给出的预设链接、已保存视图分组标题、未传 aria-label / 对话框标题时的默认值
    'My repositories': '我的儲存庫',
    'My contributions': '我的貢獻',
    'My forks': '我的分叉',
    Views: '檢視',
    'Open sidebar': '開啟側邊欄',
    Sidebar: '側邊欄',
    // 已保存视图编辑：图标与颜色选择器的标签
    Icon: '圖示',
    Color: '顏色',
    // 页码超出范围的空状态及其读屏连写（与 issues/list.ts、pulls/list.ts 一致）
    'No more repositories.': '沒有更多儲存庫。',
    'Visit a lower page.': '請前往前面的頁面。',
    'No more repositories. Visit a lower page.': '沒有更多儲存庫。請前往前面的頁面。',
  },
  regexp: [
    [
      /^Sort by (Relevance|Last pushed|Name|Stars) (ascending|descending)$/,
      (_, field, order) => `依${SORT_FIELDS[field] ?? field}${sortDirection(order)}排序`,
    ],
    [/^Show (\d+) more topics?$/, '再顯示 $1 個主題'],
    [
      new RegExp(`^${COUNT} (forks?|stars?|issues?|pull requests?) in ${REPO}$`),
      (_, count, kind, repo) => `${repo} 的 ${count} ${STAT_MEASURES[kind] ?? '個'}${STAT_KINDS[kind] ?? kind}`,
    ],
    [new RegExp(`^${REPO}[’']s past year of commit activity$`), '$1 過去一年的提交活動'],
    // 窄屏的紧凑更新时间（4m、13h、2d、6mo）是 <relative-time format="micro"> 在 shadow DOM 里渲染的文字，
    // 由引擎设 lang 后元素自行渲染中文，不收录
    // 主题对话框标题
    [new RegExp(`^Topics for ${REPO}$`), '$1 的主題'],
    // 列表加载后的读屏播报
    [
      new RegExp(
        `^${COUNT} repositor(?:y|ies) found\\. List is sorted by (Relevance|Last pushed|Name|Stars) in (ascending|descending) order\\.$`,
      ),
      (_, count, field, order) =>
        `找到 ${count} 個儲存庫。清單依${SORT_FIELDS[field] ?? field}${sortDirection(order)}排列。`,
    ],
    // 删除视图的确认框（同 issues/views.ts；视图名是用户内容）
    [/^Are you sure you want to delete view '(.+)'\?$/, '確定要刪除檢視「$1」嗎？'],
    // 图标与颜色选择器
    ...VIEW_ICON_RULES,
  ],
  inline: [
    // 从未推送过的存储库显示 Created <relative-time>（Updated 由通用词典按片段译作“更新於”）
    ['Created {}', '建立於 {}'],
  ],
  ignore: [
    // 描述与语言
    '.repos-list-description',
    '[class*="PrimaryLanguageName__"]',
  ],
} satisfies PageDictionary
