import type { PageDictionary } from '../../../core/types'

/** 复刻页「存储库类型」筛选项 */
const FORK_TYPE: Readonly<Record<string, string>> = {
  Active: '活跃',
  Inactive: '不活跃',
  Network: '网络',
  Archived: '已存档',
  Starred: '已加星标'
}

/**
 * 网络图（/network：画布 + 数据表视图 React 局部组件 network-graph-table-view）
 * 与复刻列表（/forks）。
 */
export default {
  static: {
    // 网络图
    Network: '网络',
    'Network Graph': '网络图',
    'The network graph is also available as a data table.': '网络图也提供数据表形式。',
    'Timeline of the most recent commits to this repository and its network ordered by most recently pushed to.':
      '此存储库及其网络中按最近推送时间排序的最近提交时间线。',
    'Timeline of the most recent commits to this repository and its network ordered by most recently pushed to and updated daily.':
      '此存储库及其网络中按最近推送时间排序并每日更新的最近提交时间线。',
    'Network graph of recent commits. Use the Chart options menu to view as a table.': '最近提交的网络图。使用图表选项菜单以表格形式查看。',
    'View graph data as a table': '以表格形式查看图表数据',
    'Maximize dialog': '最大化对话框',
    'Restore dialog size': '还原对话框大小',
    'Loading graph data': '正在加载图表数据',
    'Keyboard shortcuts available': '可使用键盘快捷方式',
    'Sorry, your browser doesn’t support the <canvas> element.': '你的浏览器不支持 <canvas> 元素。',
    "Sorry, your browser doesn't support the <canvas> element.": '你的浏览器不支持 <canvas> 元素。',
    'switch to list view': '切换到列表视图',
    'Woah, this network is huge! We’re showing only some of this network’s repositories.': '此网络过于庞大，仅显示其中部分存储库。',
    "Woah, this network is huge! We're showing only some of this network's repositories.": '此网络过于庞大，仅显示其中部分存储库。',
    'Loading network graph data': '正在加载网络图数据',
    'Loading network graph data.': '正在加载网络图数据。',
    'Couldn’t load the network graph data.': '无法加载网络图数据。',
    "Couldn't load the network graph data.": '无法加载网络图数据。',
    'No commits to display.': '没有可显示的提交。',
    Repo: '存储库',
    'Ahead / behind': '领先/落后',
    'Commit Date': '提交日期',
    'Commit Description': '提交描述',
    'Compare Repo': '比较存储库',
    'Compare Branch': '比较分支',
    'Compare Date': '比较日期',
    'Compare Author': '比较作者',
    'Compare Commit Description': '比较提交描述',
    'Compare Commit': '比较提交',
    'Comparison not available': '无法比较',

    // 复刻
    Forks: '复刻',
    'Switch to tree view': '切换到树状视图',
    'Filter by period': '按周期筛选',
    'Any repository that has not been created or updated during this period will be excluded.': '此周期内未创建或更新的存储库将被排除。',
    'Repository type:': '存储库类型：',
    'Filter by repository type': '按存储库类型筛选',
    'Repositories with push activity': '有推送活动的存储库',
    Inactive: '不活跃',
    'Repositories with no push activity': '没有推送活动的存储库',
    'Forks of other forks': '复刻的复刻',
    'Archived repositories': '已存档的存储库',
    'Repositories with at least 1 star': '至少有 1 个星标的存储库',
    'Most starred': '星标最多',
    'Open issues': '打开的议题',
    'Nothing to show': '暂无内容',
    'No forked repositories found': '未找到复刻存储库',
    'No one has forked this repository yet.': '还没有人复刻此存储库。',
    'No one has forked this repository yet': '还没有人复刻此存储库',
    // Forks are a great way … After <forking a repository>, you can send the original author a <pull request>.
    'Forks are a great way to contribute to a repository. After': '复刻是为存储库做贡献的好方法。在',
    'forking a repository': '复刻存储库',
    ', you can send the original author a': '后，可以向原作者发送',
    'Save Defaults': '保存默认设置',
    'Defaults Saved': '已保存默认设置',
    'Never updated': '从未更新',
    'Try changing your filters, or search for': '尝试更改筛选器，或搜索',
    'active forked repositories': '活跃的复刻存储库'
  },
  scoped: {
    // 其他区域也出现的同形文字，本区域内单独生效
    'Sort:': '排序：',
    // 网络图数据表
    Branch: '分支',
    'Up to date': '已是最新',
    // 复刻筛选与列表
    Active: '活跃',
    Created: '创建于',
    Updated: '更新于',
    'pull request': '拉取请求'
  },
  regexp: [
    [/^The repository network shows the ([\d,]+) most recently pushed forks\.$/, '存储库网络显示最近推送的 $1 个复刻。'],
    // 数据表「领先/落后」列
    [/^([\d,]+) ahead, ([\d,]+) behind$/, '领先 $1，落后 $2'],
    [/^([\d,]+) (ahead|behind)$/, (_, count, direction) => `${direction === 'ahead' ? '领先' : '落后'} ${count}`],
    [/^([\d,]+) commits? ahead of (\S+)$/, '领先 $2 $1 个提交'],
    [/^([\d,]+) commits? behind (\S+)$/, '落后 $2 $1 个提交'],
    [/^([\d,]+) commits? loaded\.$/, '已加载 $1 个提交。'],
    // 复刻页多选的存储库类型：Active, Archived
    [
      /^((?:Active|Inactive|Network|Archived|Starred)(?:, (?:Active|Inactive|Network|Archived|Starred))+)$/,
      (_, types) =>
        types
          .split(', ')
          .map(type => FORK_TYPE[type] ?? type)
          .join('、')
    ]
  ],
  ignore: [
    // 数据表分支名
    '[class*="branchCell"]',
    // 复刻列表存储库名
    'li.Box-row h2.f4 > a.Link'
  ]
} satisfies PageDictionary
