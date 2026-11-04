import type { PageDictionary } from '../../../core/types'
import { duration, DURATION_SOURCE } from './mergebox'

/** 检查 / 作业状态图标的无障碍名称：This check passed、This job was skipped */
const CHECK_RESULT: Readonly<Record<string, string>> = {
  passed: '已通过',
  succeeded: '已成功',
  failed: '失败',
  'was skipped': '已跳过',
  'was cancelled': '已取消',
  'was canceled': '已取消',
  'was neutral': '结果为中性',
  'timed out': '已超时',
  'requires action': '需要操作',
  'is in progress': '正在进行',
  'is queued': '已排队',
  // Pending（检查）→ 挂起；整句作“处于挂起状态”（与合并框的必需检查状态一致）
  'is pending': '处于挂起状态',
  'is waiting': '正在等待',
  'is stale': '已过时',
  'had a startup failure': '启动失败'
}

const CHECK_RESULT_SOURCE = Object.keys(CHECK_RESULT).join('|')

const CHECK_SUBJECT: Readonly<Record<string, string>> = { check: '此检查', job: '此作业' }

/** 注释计数：3 errors / 1 warning / 2 notices */
const ANNOTATION_UNIT: Readonly<Record<string, string>> = {
  error: '个错误',
  errors: '个错误',
  warning: '个警告',
  warnings: '个警告',
  notice: '个提示',
  notices: '个提示'
}

const ANNOTATION_PART = '\\d+ (?:error|warning|notice)s?'

/**
 * 2 errors and 6 notices → 2 个错误和 6 个提示；1 error, 2 warnings, and 3 notices → 1 个错误、2 个警告和 3 个提示。
 * 原文只有 and 时不加标点，与 actions 词典的注释计数同译
 */
function annotationCounts(text: string): string {
  const items = [...text.matchAll(/(\d+) ((?:error|warning|notice)s?)/g)].map(
    ([, count, unit]) => `${count} ${ANNOTATION_UNIT[unit!] ?? unit}`
  )
  if (items.length < 2) return items.join('')
  return `${items.slice(0, -1).join('、')}和 ${items.at(-1)}`
}

/**
 * “检查”标签页：检查套件列表、检查运行详细信息（状态、耗时、详细信息链接）、作业日志工具栏、注释、重新运行。
 * 作业日志的通用文字（Search logs、Set up job 等）由 actions 词典的 static 收录；
 * 这里补充 actions 词典放在 scoped、在拉取请求页不生效的短词。
 * 套件名、检查名、工作流名是用户内容，不收录。
 */
export default {
  static: {
    'Check suites': '检查套件',
    'Check run summary': '检查运行摘要',
    'Re-running checks...': '正在重新运行检查...',
    'Re-running checks…': '正在重新运行检查…',
    'This check run has no output.': '此检查运行没有输出。'
  },
  scoped: {
    // 运行状态（小写）
    queued: '已排队',
    'in progress': '正在进行',
    requested: '已请求',
    waiting: '等待中',
    pending: '挂起',
    // 检查运行头部、作业标题后接时间：completed <时间> in 30s、succeeded <时间> in 1m 41s（与 actions 词典同译）
    completed: '完成于',
    succeeded: '成功于',
    failed: '失败于',
    cancelled: '取消于',
    // 重新运行
    'Re-run': '重新运行',
    'Re-run checks': '重新运行检查',
    'Re-run all checks': '重新运行所有检查',
    'Re-run failed checks': '重新运行失败的检查',
    'Re-run all jobs': '重新运行所有作业',
    'Re-run failed jobs': '重新运行失败的作业',
    'Re-run jobs': '重新运行作业',
    // 运行详细信息与作业日志
    Summary: '摘要',
    Jobs: '作业',
    'Run details': '运行详细信息',
    Usage: '使用情况',
    'Workflow file': '工作流文件',
    Annotations: '注释',
    'Set up job': '设置作业',
    'Complete job': '完成作业',
    'Search logs': '搜索日志',
    'View raw logs': '查看原始日志',
    'Show timestamps': '显示时间戳',
    'Go to next result': '转到下一个结果',
    'Go to previous result': '转到上一个结果'
  },
  regexp: [
    [
      new RegExp(`^This (check|job) (${CHECK_RESULT_SOURCE})$`),
      (_, subject, result) => `${CHECK_SUBJECT[subject] ?? subject}${CHECK_RESULT[result] ?? result}`
    ],
    // 耗时：completed 9 minutes ago in 30s
    [new RegExp(`^in (${DURATION_SOURCE})$`), (_, time) => `用时 ${duration(time)}`],
    // 第三方检查的详细信息链接
    [/^View more details on (.+)$/, '在 $1 上查看更多详细信息'],
    // 注释计数：3 errors、2 errors and 6 notices
    [new RegExp(`^${ANNOTATION_PART}(?:(?:,| and|, and) ${ANNOTATION_PART}){0,2}$`), (match: string) => annotationCounts(match)],
    // 注释内容（GitHub 生成，与 actions 词典同译；原文只有句号，不加逗号）
    [/^Process completed with exit code (-?\d+)\.$/, '进程以退出代码 $1 完成。']
  ]
} satisfies PageDictionary
