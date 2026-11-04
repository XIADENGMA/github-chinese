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
  fork: '复刻',
  forks: '复刻',
  star: '星标',
  stars: '星标',
  issue: '议题',
  issues: '议题',
  'pull request': '拉取请求',
  'pull requests': '拉取请求'
}

/** 排序字段 */
const SORT_FIELDS: Readonly<Record<string, string>> = {
  Relevance: '相关性',
  'Last pushed': '最近推送',
  Name: '名称',
  Stars: '星标'
}

/** 排序方向（repos-filter.ts 的排序取值共用） */
export function sortDirection(order: string): string {
  return order === 'ascending' ? '升序' : '降序'
}

export default {
  static: {
    // /repos 的标签页标题
    'User repositories': '用户存储库',

    // 列表头部与侧栏
    'Repository filters': '存储库筛选器',
    'Open Repository filters': '打开存储库筛选器',
    'Repository views': '存储库视图',
    'Contributed by me': '我贡献的',
    'Admin access': '管理员权限',
    'Repositories list': '存储库列表',
    'Repositories list display density': '存储库列表显示密度',
    'Last pushed': '最近推送',
    // 窄屏：侧栏折叠按钮的读屏说明（同 issues 的 Change the issues type filter）、头部操作折叠成的菜单按钮
    'Change the repository type filter': '切换存储库视图',
    'More repository actions': '更多存储库操作',
    // 条目末尾设置图标的 Tooltip 与 aria-label
    'Repository settings': '存储库设置',

    // 空状态（页码超出范围的两句见 scoped）；读屏播报把标题与说明连成一句
    'No repositories matched your search.': '没有匹配的存储库。',
    'Try a different search query.': '请尝试其他搜索词。',
    'No repositories matched your search. Try a different search query.': '没有匹配的存储库。请尝试其他搜索词。',
    "Your teams don't have access to any repositories.": '你的团队没有任何存储库的访问权限。',
    'Your teams don’t have access to any repositories.': '你的团队没有任何存储库的访问权限。',

    // ProTip 随机提示：被 <code> 拆开的句子按片段收录
    "When viewing an organization's repositories, you can use the": '查看组织的存储库时，可以使用',
    'When viewing an organization’s repositories, you can use the': '查看组织的存储库时，可以使用',
    'filter to filter by custom property.': '筛选器按自定义属性筛选。',
    'Using a comma within certain filters will aggregate the results. For example:': '在某些筛选器中使用逗号会合并结果。例如：',
    'will show all repositories that have either Go or Ruby as their primary language.': '会显示主要语言为 Go 或 Ruby 的所有存储库。',
    // 只在 /repos 出现（组织页没有已保存的视图）
    "Don't forget that you can create saved views to keep track of your most important repositories!":
      '别忘了可以创建已保存的视图来跟踪你最重要的存储库！',
    'Don’t forget that you can create saved views to keep track of your most important repositories!':
      '别忘了可以创建已保存的视图来跟踪你最重要的存储库！'
  },
  scoped: {
    'Comfortable display density': '宽松显示密度',
    'Compact display density': '紧凑显示密度',
    Relevance: '相关性',
    Order: '顺序',
    // 侧栏：服务端给出的预设链接、已保存视图分组标题、未传 aria-label / 对话框标题时的默认值
    'My repositories': '我的存储库',
    'My contributions': '我的贡献',
    'My forks': '我的复刻',
    Views: '视图',
    'Open sidebar': '打开侧栏',
    Sidebar: '侧栏',
    // 已保存视图编辑：图标与颜色选择器的标签
    Icon: '图标',
    Color: '颜色',
    // 页码超出范围的空状态及其读屏连写（与 issues/list.ts、pulls/list.ts 一致）
    'No more repositories.': '没有更多存储库。',
    'Visit a lower page.': '请访问前面的页面。',
    'No more repositories. Visit a lower page.': '没有更多存储库。请访问前面的页面。'
  },
  regexp: [
    [
      /^Sort by (Relevance|Last pushed|Name|Stars) (ascending|descending)$/,
      (_, field, order) => `按${SORT_FIELDS[field] ?? field}${sortDirection(order)}排序`
    ],
    [/^Show (\d+) more topics?$/, '再显示 $1 个主题'],
    [
      new RegExp(`^${COUNT} (forks?|stars?|issues?|pull requests?) in ${REPO}$`),
      (_, count, kind, repo) => `${repo} 中的 ${count} 个${STAT_KINDS[kind] ?? kind}`
    ],
    [new RegExp(`^${REPO}[’']s past year of commit activity$`), '$1 过去一年的提交活动'],
    // 窄屏的紧凑更新时间（4m、13h、2d、6mo）是 <relative-time format="micro"> 在 shadow DOM 里渲染的文字，
    // 由引擎设 lang 后元素自行渲染中文，不收录
    // 主题对话框标题
    [new RegExp(`^Topics for ${REPO}$`), '$1 的主题'],
    // 列表加载后的读屏播报
    [
      new RegExp(
        `^${COUNT} repositor(?:y|ies) found\\. List is sorted by (Relevance|Last pushed|Name|Stars) in (ascending|descending) order\\.$`
      ),
      (_, count, field, order) => `找到 ${count} 个存储库。列表按${SORT_FIELDS[field] ?? field}${sortDirection(order)}排列。`
    ],
    // 删除视图的确认框（同 issues/views.ts；视图名是用户内容）
    [/^Are you sure you want to delete view '(.+)'\?$/, '确定要删除视图“$1”吗？'],
    // 图标与颜色选择器
    ...VIEW_ICON_RULES
  ],
  inline: [
    // 从未推送过的存储库显示 Created <relative-time>（Updated 由通用词典按片段译作“更新于”）
    ['Created {}', '创建于 {}']
  ],
  ignore: [
    // 描述与语言
    '.repos-list-description',
    '[class*="PrimaryLanguageName__"]'
  ]
} satisfies PageDictionary
