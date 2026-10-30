import type { PageDictionary, RegExpRule } from '../../../core/types'

const regexp: readonly RegExpRule[] = [
  // 待批准的工作流
  [/^(\d+) workflows? awaiting approval$/, '$1 個工作流程等待核准'],
]

/**
 * 提交的检查弹层（提交列表、提交详情、经典比较页）：状态徽章、检查对话框标题、检查运行条目、
 * 待批准的工作流横幅。检查汇总与耗时的正则见 check-summary.ts；
 * 检查汇总标题（All checks have passed 等）与批准按钮由 pulls 词典全局收录。
 */
export default {
  static: {
    'See all checks': '查看所有檢查',
    'Checks status error': '檢查狀態錯誤',
    'Checks unavailable': '檢查無法使用',
    'There was an error retrieving checks status': '擷取檢查狀態時發生錯誤',
    'Approving workflows': '正在核准工作流程',
    'Failed to approve workflows': '無法核准工作流程',
    'Dismiss workflow approval notice': '關閉工作流程核准通知',
    // 检查运行条目的说明（破折号与说明在同一文本节点）
    '— This check has started...': '— 此檢查已開始...',
  },
  scoped: {
    'Status checks': '狀態檢查',
    // 检查运行条目：应用头像链接的无障碍名称
    Avatar: '頭像',
    // 检查运行状态（Pending 与 common-ui 的审查评论徽章「待處理」不同，检查状态作「擱置中」）
    Pending: '擱置中',
    'In progress': '進行中',
    Skipped: '已略過',
    Expected: '等待回報',
    Neutral: '中性',
    Cancelled: '已取消',
    Canceled: '已取消',
    Failing: '失敗',
    Successful: '成功',
    'Timed out': '已逾時',
    'Action required': '需要採取動作',
    'Startup failure': '啟動失敗',
    Waiting: '等待中',
    Requested: '已請求',
  },
  regexp,
} satisfies PageDictionary
