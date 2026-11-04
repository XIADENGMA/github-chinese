import type { PageDictionary, RegExpRule } from '../../../core/types'
import { joinCjk } from '../helpers'

/** 时间范围筛选项（All time 取 Chromium 繁中「不限時間」） */
const TIME_PERIODS: Readonly<Record<string, string>> = {
  'Last 24 hours': '過去 24 小時',
  'Last week': '過去一週',
  'Last month': '過去一個月',
  'Last quarter': '過去一季',
  'Last year': '過去一年',
  'All time': '不限時間'
}

/** 活动类型筛选项 */
const ACTIVITY_TYPES: Readonly<Record<string, string>> = {
  'All activity': '所有活動',
  'Direct pushes': '直接推送',
  'Pull request merges': '拉取請求合併',
  'Merge queue merges': '合併佇列合併',
  'Force pushes': '強制推送',
  'Branch creations': '分支建立',
  'Branch deletions': '分支刪除'
}

const COMMITS_SOURCE = '(\\d+) commits?'

/** adding 3 commits / removing 2 commits / removing 2 commits and adding 3 commits */
function translateChange(text: string): string | undefined {
  const both = new RegExp(`^removing ${COMMITS_SOURCE} and adding ${COMMITS_SOURCE}$`).exec(text)
  if (both) return `移除 ${both[1]} 個提交並新增 ${both[2]} 個提交`
  const single = new RegExp(`^(adding|removing) ${COMMITS_SOURCE}$`).exec(text)
  if (single) return `${single[1] === 'adding' ? '新增' : '移除'} ${single[2]} 個提交`
  return undefined
}

const CHANGE_SOURCE = `(?:adding \\d+ commits?|removing \\d+ commits?(?: and adding \\d+ commits?)?)`

const regexp: readonly RegExpRule[] = [
  // 筛选按钮的无障碍名称
  [
    /^Filter by time: (Last 24 hours|Last week|Last month|Last quarter|Last year|All time)$/,
    (_, period: string) => `依時間篩選：${TIME_PERIODS[period] ?? period}`
  ],
  [
    /^Filter by activity type: (All activity|Direct pushes|Pull request merges|Merge queue merges|Force pushes|Branch creations|Branch deletions)$/,
    (_, type: string) => `依活動類型篩選：${ACTIVITY_TYPES[type] ?? type}`
  ],
  [/^Filter by branch: (\S.*)$/, (_, name: string) => `依分支篩選：${name === 'All branches' ? '所有分支' : name}`],
  [/^Filter by user: (\S.*)$/, (_, login: string) => `依使用者篩選：${login === 'All users' ? '所有使用者' : login}`],
  // 推送者头像链接
  [/^View ([\w.[\]-]+) profile$/, '查看 $1 的個人檔案'],
  // 事件描述：<用户> pushed 3 commits to <分支> adding 3 commits
  [new RegExp(`^pushed ${COMMITS_SOURCE} to$`), '推送了 $1 個提交到'],
  [new RegExp(`^pushed ${COMMITS_SOURCE}$`), '推送了 $1 個提交'],
  [new RegExp(`^(${CHANGE_SOURCE})$`), (_, change: string) => translateChange(change) ?? change],
  // 按分支筛选后不显示分支名，动词与改动说明拼成一句（原文无标点，译文不加逗号）
  [
    new RegExp(`^(pushed|force pushed) (${CHANGE_SOURCE})$`),
    (_, verb: string, change: string) => joinCjk(`${verb === 'pushed' ? '推送' : '強制推送'}時`, translateChange(change) ?? change)
  ]
]

/**
 * 活动页（/activity）：筛选栏、排序、推送事件、事件标签、更多操作菜单、空状态与错误。
 */
export default {
  static: {
    // 筛选栏
    'All activity': '所有活動',
    'Direct pushes': '直接推送',
    'Pull request merges': '拉取請求合併',
    'Merge queue merges': '合併佇列合併',
    'Force pushes': '強制推送',
    'Branch creations': '分支建立',
    'Branch deletions': '分支刪除',
    'View activity for all branches': '查看所有分支的活動',
    'View activity for all users': '查看所有使用者的活動',
    'Showing oldest first': '由舊到新顯示',
    'Showing most recent first': '由新到舊顯示',

    // 事件
    Pusher: '推送者',
    'Deleted branch': '已刪除分支',
    'Deleted tag': '已刪除標記',
    'Created branch': '已建立分支',
    'Updated branch': '已更新分支',
    'Force push': '強制推送',
    'Pull request merge': '拉取請求合併',
    'Merge queue merge': '合併佇列合併',
    'Missing commit': '遺失的提交',
    'deleted this branch': '刪除了此分支',
    'deleted this tag': '刪除了此標記',
    'created this branch': '建立了此分支',
    'force pushed to': '強制推送到',
    'force pushed': '強制推送了',
    'More activity actions': '更多活動動作',

    // 空状态与错误
    'No activity matched your search.': '沒有與搜尋相符的活動。',
    'Try expanding your search by selecting a different branch, activity type, user, or timeframe.':
      '請嘗試選擇其他分支、活動類型、使用者或時間範圍來擴大搜尋範圍。',
    'Failed to load activity data.': '無法載入活動資料。',
    'Your request timed out. Try changing filters or choosing a shorter timeframe.': '請求逾時。請嘗試變更篩選器或選擇較短的時間範圍。',
    'Loading activity': '正在載入活動',
    'Failed to get activity': '無法取得活動',
    'Share feedback about this page': '提供此頁面的意見回饋'
  },
  scoped: {
    // 显示分支名时的动词：<用户> 刪除了 / 建立了 <分支>
    deleted: '刪除了',
    created: '建立了',
    // 与 dashboard、pulls 词典的全局条目同译，按页面收录
    'pushed to': '推送到',
    'Restore branch': '還原分支',
    'Last 24 hours': '過去 24 小時',
    'Last week': '過去一週',
    'Last month': '過去一個月',
    'Last quarter': '過去一季',
    'Last year': '過去一年'
  },
  regexp,
  ignore: [
    // 事件描述中的分支名链接
    '[data-testid="action-text"] > a'
  ]
} satisfies PageDictionary
