import type { PageDictionary } from '../../../core/types'

/** 复刻页「儲存庫類型」筛选项 */
const FORK_TYPE: Readonly<Record<string, string>> = {
  Active: '活躍',
  Inactive: '不活躍',
  Network: '網路',
  Archived: '已封存',
  Starred: '已加星號',
}

/**
 * 网络图（/network：画布 + 数据表视图 React 局部组件 network-graph-table-view）
 * 与复刻列表（/forks）。
 */
export default {
  static: {
    // 网络图
    Network: '網路',
    'Network Graph': '網路圖表',
    'The network graph is also available as a data table.': '網路圖表也能以資料表呈現。',
    'Timeline of the most recent commits to this repository and its network ordered by most recently pushed to.':
      '此儲存庫和其網路中最近提交的時間軸，依最近推送時間排序。',
    'Timeline of the most recent commits to this repository and its network ordered by most recently pushed to and updated daily.':
      '此儲存庫和其網路中最近提交的時間軸，依最近推送時間排序並每日更新。',
    'Network graph of recent commits. Use the Chart options menu to view as a table.':
      '最近提交的網路圖表。使用圖表選項選單以表格形式查看。',
    'View graph data as a table': '以表格形式查看圖表資料',
    'Maximize dialog': '最大化對話方塊',
    'Restore dialog size': '還原對話方塊大小',
    'Loading graph data': '正在載入圖表資料',
    'Keyboard shortcuts available': '可使用鍵盤快速鍵',
    'Sorry, your browser doesn’t support the <canvas> element.': '你的瀏覽器不支援 <canvas> 元素。',
    "Sorry, your browser doesn't support the <canvas> element.": '你的瀏覽器不支援 <canvas> 元素。',
    'switch to list view': '切換到清單檢視',
    'Woah, this network is huge! We’re showing only some of this network’s repositories.':
      '這個網路非常龐大！我們只顯示其中部分儲存庫。',
    "Woah, this network is huge! We're showing only some of this network's repositories.":
      '這個網路非常龐大！我們只顯示其中部分儲存庫。',
    'Loading network graph data': '正在載入網路圖表資料',
    'Loading network graph data.': '正在載入網路圖表資料。',
    'Couldn’t load the network graph data.': '無法載入網路圖表資料。',
    "Couldn't load the network graph data.": '無法載入網路圖表資料。',
    'No commits to display.': '沒有可顯示的提交。',
    Repo: '儲存庫',
    'Ahead / behind': '領先/落後',
    'Commit Date': '提交日期',
    'Commit Description': '提交描述',
    'Compare Repo': '比較儲存庫',
    'Compare Branch': '比較分支',
    'Compare Date': '比較日期',
    'Compare Author': '比較作者',
    'Compare Commit Description': '比較提交描述',
    'Compare Commit': '比較提交',
    'Comparison not available': '無法比較',

    // 复刻
    Forks: '分叉',
    'Switch to tree view': '切換到樹狀檢視',
    'Filter by period': '依期間篩選',
    'Any repository that has not been created or updated during this period will be excluded.':
      '將排除此期間內未建立或更新的任何儲存庫。',
    'Repository type:': '儲存庫類型：',
    'Filter by repository type': '依儲存庫類型篩選',
    'Repositories with push activity': '有推送活動的儲存庫',
    Inactive: '不活躍',
    'Repositories with no push activity': '沒有推送活動的儲存庫',
    'Forks of other forks': '其他分叉的分叉',
    'Archived repositories': '已封存的儲存庫',
    'Repositories with at least 1 star': '至少有 1 顆星的儲存庫',
    'Most starred': '最多星號',
    'Open issues': '開放中的議題',
    'Nothing to show': '沒有可顯示的內容',
    'No forked repositories found': '找不到分叉儲存庫',
    'No one has forked this repository yet.': '還沒有人分叉此儲存庫。',
    'No one has forked this repository yet': '還沒有人分叉此儲存庫',
    // Forks are a great way … After <forking a repository>, you can send the original author a <pull request>.
    'Forks are a great way to contribute to a repository. After': '分叉是為儲存庫做出貢獻的好方法。在',
    'forking a repository': '分叉儲存庫',
    ', you can send the original author a': '後，你可以向原作者發送',
    'Save Defaults': '儲存預設值',
    'Defaults Saved': '已儲存預設值',
    'Never updated': '從未更新',
    'Try changing your filters, or search for': '試著變更篩選器，或搜尋',
    'active forked repositories': '活躍的分叉儲存庫',
  },
  scoped: {
    // 其他区域也出现的同形文字，本区域内单独生效
    'Sort:': '排序：',
    // 网络图数据表
    Branch: '分支',
    'Up to date': '已是最新',
    // 复刻筛选与列表
    Active: '活躍',
    Created: '建立於',
    Updated: '更新於',
    'pull request': '拉取請求',
  },
  regexp: [
    [
      /^The repository network shows the ([\d,]+) most recently pushed forks\.$/,
      '儲存庫網路顯示最近推送的 $1 個分叉。',
    ],
    // 数据表「領先/落後」列
    [/^([\d,]+) ahead, ([\d,]+) behind$/, '領先 $1，落後 $2'],
    [/^([\d,]+) (ahead|behind)$/, (_, count, direction) => `${direction === 'ahead' ? '領先' : '落後'} ${count}`],
    [/^([\d,]+) commits? ahead of (\S+)$/, '領先 $2 $1 個提交'],
    [/^([\d,]+) commits? behind (\S+)$/, '落後 $2 $1 個提交'],
    [/^([\d,]+) commits? loaded\.$/, '已載入 $1 個提交。'],
    // 复刻页多选的存储库类型：Active, Archived
    [
      /^((?:Active|Inactive|Network|Archived|Starred)(?:, (?:Active|Inactive|Network|Archived|Starred))+)$/,
      (_, types) =>
        types
          .split(', ')
          .map((type) => FORK_TYPE[type] ?? type)
          .join('、'),
    ],
  ],
  ignore: [
    // 数据表分支名
    '[class*="branchCell"]',
    // 复刻列表存储库名
    'li.Box-row h2.f4 > a.Link',
  ],
} satisfies PageDictionary
