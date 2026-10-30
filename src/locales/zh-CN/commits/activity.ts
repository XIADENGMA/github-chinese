import type { PageDictionary, RegExpRule } from '../../../core/types'
import { joinCjk } from '../helpers'

/** 时间范围筛选项 */
const TIME_PERIODS: Readonly<Record<string, string>> = {
  'Last 24 hours': '过去 24 小时',
  'Last week': '过去一周',
  'Last month': '过去一个月',
  'Last quarter': '过去一个季度',
  'Last year': '过去一年',
  'All time': '全部时间',
}

/** 活动类型筛选项 */
const ACTIVITY_TYPES: Readonly<Record<string, string>> = {
  'All activity': '所有活动',
  'Direct pushes': '直接推送',
  'Pull request merges': '拉取请求合并',
  'Merge queue merges': '合并队列合并',
  'Force pushes': '强制推送',
  'Branch creations': '分支创建',
  'Branch deletions': '分支删除',
}

const COMMITS_SOURCE = '(\\d+) commits?'

/** adding 3 commits / removing 2 commits / removing 2 commits and adding 3 commits */
function translateChange(text: string): string | undefined {
  const both = new RegExp(`^removing ${COMMITS_SOURCE} and adding ${COMMITS_SOURCE}$`).exec(text)
  if (both) return `删除 ${both[1]} 个提交并新增 ${both[2]} 个提交`
  const single = new RegExp(`^(adding|removing) ${COMMITS_SOURCE}$`).exec(text)
  if (single) return `${single[1] === 'adding' ? '新增' : '删除'} ${single[2]} 个提交`
  return undefined
}

const CHANGE_SOURCE = `(?:adding \\d+ commits?|removing \\d+ commits?(?: and adding \\d+ commits?)?)`

const regexp: readonly RegExpRule[] = [
  // 筛选按钮的无障碍名称
  [
    /^Filter by time: (Last 24 hours|Last week|Last month|Last quarter|Last year|All time)$/,
    (_, period: string) => `按时间筛选：${TIME_PERIODS[period] ?? period}`,
  ],
  [
    /^Filter by activity type: (All activity|Direct pushes|Pull request merges|Merge queue merges|Force pushes|Branch creations|Branch deletions)$/,
    (_, type: string) => `按活动类型筛选：${ACTIVITY_TYPES[type] ?? type}`,
  ],
  [/^Filter by branch: (\S.*)$/, (_, name: string) => `按分支筛选：${name === 'All branches' ? '所有分支' : name}`],
  [/^Filter by user: (\S.*)$/, (_, login: string) => `按用户筛选：${login === 'All users' ? '所有用户' : login}`],
  // 推送者头像链接
  [/^View ([\w.[\]-]+) profile$/, '查看 $1 的个人资料'],
  // 事件描述：<用户> pushed 3 commits to <分支> adding 3 commits
  [new RegExp(`^pushed ${COMMITS_SOURCE} to$`), '推送了 $1 个提交到'],
  [new RegExp(`^pushed ${COMMITS_SOURCE}$`), '推送了 $1 个提交'],
  [new RegExp(`^(${CHANGE_SOURCE})$`), (_, change: string) => translateChange(change) ?? change],
  // 按分支筛选后不显示分支名，动词与改动说明拼成一句（原文无标点，译文不加逗号）
  [
    new RegExp(`^(pushed|force pushed) (${CHANGE_SOURCE})$`),
    (_, verb: string, change: string) =>
      joinCjk(`${verb === 'pushed' ? '推送' : '强制推送'}时`, translateChange(change) ?? change),
  ],
]

/**
 * 活动页（/activity）：筛选栏、排序、推送事件、事件标签、更多操作菜单、空状态与错误。
 */
export default {
  static: {
    // 筛选栏
    'All activity': '所有活动',
    'Direct pushes': '直接推送',
    'Pull request merges': '拉取请求合并',
    'Merge queue merges': '合并队列合并',
    'Force pushes': '强制推送',
    'Branch creations': '分支创建',
    'Branch deletions': '分支删除',
    'View activity for all branches': '查看所有分支的活动',
    'View activity for all users': '查看所有用户的活动',
    'Showing oldest first': '最早的在前',
    'Showing most recent first': '最新的在前',

    // 事件
    Pusher: '推送者',
    'Deleted branch': '已删除分支',
    'Deleted tag': '已删除标记',
    'Created branch': '已创建分支',
    'Updated branch': '已更新分支',
    'Force push': '强制推送',
    'Pull request merge': '拉取请求合并',
    'Merge queue merge': '合并队列合并',
    'Missing commit': '缺失的提交',
    'deleted this branch': '删除了此分支',
    'deleted this tag': '删除了此标记',
    'created this branch': '创建了此分支',
    'force pushed to': '强制推送到',
    'force pushed': '强制推送了',
    'More activity actions': '更多活动操作',

    // 空状态与错误
    'No activity matched your search.': '没有与搜索匹配的活动。',
    'Try expanding your search by selecting a different branch, activity type, user, or timeframe.':
      '请尝试选择其他分支、活动类型、用户或时间范围来扩大搜索。',
    'Failed to load activity data.': '加载活动数据失败。',
    'Your request timed out. Try changing filters or choosing a shorter timeframe.':
      '请求超时。请尝试更改筛选器或选择更短的时间范围。',
    'Loading activity': '正在加载活动',
    'Failed to get activity': '获取活动失败',
    'Share feedback about this page': '提供有关此页面的反馈',
  },
  scoped: {
    // 显示分支名时的动词：<用户> 删除了 / 创建了 <分支>
    deleted: '删除了',
    created: '创建了',
    // 与 dashboard、pulls 词典的全局条目同译，按页面收录
    'pushed to': '推送到',
    'Restore branch': '恢复分支',
    'Last 24 hours': '过去 24 小时',
    'Last week': '过去一周',
    'Last month': '过去一个月',
    'Last quarter': '过去一个季度',
    'Last year': '过去一年',
  },
  regexp,
  ignore: [
    // 事件描述中的分支名链接
    '[data-testid="action-text"] > a',
  ],
} satisfies PageDictionary
