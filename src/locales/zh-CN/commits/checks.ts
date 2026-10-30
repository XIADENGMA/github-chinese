import type { PageDictionary, RegExpRule } from '../../../core/types'

const regexp: readonly RegExpRule[] = [
  // 待批准的工作流
  [/^(\d+) workflows? awaiting approval$/, '$1 个工作流等待批准'],
]

/**
 * 提交的检查弹层（提交列表、提交详情、经典比较页）：状态徽章、检查对话框标题、检查运行条目、
 * 待批准的工作流横幅。检查汇总与耗时的正则见 check-summary.ts；
 * 检查汇总标题（All checks have passed 等）与批准按钮由 pulls 词典全局收录。
 */
export default {
  static: {
    'See all checks': '查看所有检查',
    'Checks status error': '检查状态错误',
    'Checks unavailable': '检查不可用',
    'There was an error retrieving checks status': '获取检查状态时出错',
    'Approving workflows': '正在批准工作流',
    'Failed to approve workflows': '批准工作流失败',
    'Dismiss workflow approval notice': '关闭工作流批准通知',
    // 检查运行条目的说明（破折号与说明在同一文本节点）
    '— This check has started...': '— 此检查已开始...',
  },
  scoped: {
    'Status checks': '状态检查',
    // 检查运行条目：应用头像链接的无障碍名称
    Avatar: '头像',
    // 检查运行状态（Pending 与 common-ui 的审查评论徽章“待处理”不同，检查状态作“挂起”）
    Pending: '挂起',
    'In progress': '正在进行',
    Skipped: '已跳过',
    Expected: '等待报告',
    Neutral: '中性',
    Cancelled: '已取消',
    Canceled: '已取消',
    Failing: '失败',
    Successful: '成功',
    'Timed out': '已超时',
    'Action required': '需要操作',
    'Startup failure': '启动失败',
    Waiting: '等待中',
    Requested: '已请求',
  },
  regexp,
} satisfies PageDictionary
