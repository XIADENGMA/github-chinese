import type { PageDictionary } from '../../../core/types'
import { duration, DURATION_SOURCE } from './mergebox'

/** 检查 / 作业状态图标的无障碍名称：This check passed、This job was skipped */
const CHECK_RESULT: Readonly<Record<string, string>> = {
  passed: '已通過',
  succeeded: '已成功',
  failed: '失敗',
  'was skipped': '已略過',
  'was cancelled': '已取消',
  'was canceled': '已取消',
  'was neutral': '結果為中性',
  'timed out': '已逾時',
  'requires action': '需要採取動作',
  'is in progress': '進行中',
  'is queued': '已排入佇列',
  // Pending（检查）→ 擱置中（与 actions、commits 词典的检查状态一致）
  'is pending': '擱置中',
  'is waiting': '等待中',
  'is stale': '已過時',
  'had a startup failure': '啟動失敗'
}

const CHECK_RESULT_SOURCE = Object.keys(CHECK_RESULT).join('|')

const CHECK_SUBJECT: Readonly<Record<string, string>> = { check: '此檢查', job: '此作業' }

/** 注释计数：3 errors / 1 warning / 2 notices */
const ANNOTATION_UNIT: Readonly<Record<string, string>> = {
  error: '個錯誤',
  errors: '個錯誤',
  warning: '個警告',
  warnings: '個警告',
  notice: '個提示',
  notices: '個提示'
}

const ANNOTATION_PART = '\\d+ (?:error|warning|notice)s?'

/**
 * 2 errors and 6 notices → 2 個錯誤和 6 個提示；1 error, 2 warnings, and 3 notices → 1 個錯誤、2 個警告和 3 個提示。
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
 * annotation 按术语表作「標註」，与 actions 词典一致。
 */
export default {
  static: {
    'Check suites': '檢查套件',
    'Check run summary': '檢查執行摘要',
    'Re-running checks...': '正在重新執行檢查...',
    'Re-running checks…': '正在重新執行檢查…',
    'This check run has no output.': '此檢查執行沒有輸出。'
  },
  scoped: {
    // 运行状态（小写）
    queued: '已排入佇列',
    'in progress': '進行中',
    requested: '已請求',
    waiting: '等待中',
    pending: '擱置中',
    // 检查运行头部、作业标题后接时间：completed <时间> in 30s、succeeded <时间> in 1m 41s（与 actions 词典同译）
    completed: '完成於',
    succeeded: '成功於',
    failed: '失敗於',
    cancelled: '取消於',
    // 重新运行
    'Re-run': '重新執行',
    'Re-run checks': '重新執行檢查',
    'Re-run all checks': '重新執行所有檢查',
    'Re-run failed checks': '重新執行失敗的檢查',
    'Re-run all jobs': '重新執行所有作業',
    'Re-run failed jobs': '重新執行失敗的作業',
    'Re-run jobs': '重新執行作業',
    // 运行详细信息与作业日志
    Summary: '摘要',
    Jobs: '作業',
    'Run details': '執行詳細資料',
    Usage: '使用量',
    'Workflow file': '工作流程檔案',
    Annotations: '標註',
    'Set up job': '設定作業',
    'Complete job': '完成作業',
    'Search logs': '搜尋記錄',
    'View raw logs': '查看原始記錄',
    'Show timestamps': '顯示時間戳記',
    'Go to next result': '前往下一個結果',
    'Go to previous result': '前往上一個結果'
  },
  regexp: [
    [
      new RegExp(`^This (check|job) (${CHECK_RESULT_SOURCE})$`),
      (_, subject, result) => `${CHECK_SUBJECT[subject] ?? subject}${CHECK_RESULT[result] ?? result}`
    ],
    // 耗时：completed 9 minutes ago in 30s（与 actions 词典同译「耗時」）
    [new RegExp(`^in (${DURATION_SOURCE})$`), (_, time) => `耗時 ${duration(time)}`],
    // 第三方检查的详细信息链接
    [/^View more details on (.+)$/, '在 $1 上查看更多詳細資料'],
    // 注释计数：3 errors、2 errors and 6 notices
    [new RegExp(`^${ANNOTATION_PART}(?:(?:,| and|, and) ${ANNOTATION_PART}){0,2}$`), (match: string) => annotationCounts(match)],
    // 注释内容（GitHub 生成，与 actions 词典同译；原文只有句号，不加逗号）
    [/^Process completed with exit code (-?\d+)\.$/, '處理程序以結束碼 $1 完成。']
  ]
} satisfies PageDictionary
