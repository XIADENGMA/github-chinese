import type { PageDictionary, RegExpRule } from '../../../core/types'
import { joinCjk } from '../helpers'

/** 检查汇总中的状态词（与拉取请求合并框同一套译法；状态词按 GLOSSARY.zh-TW 状态行） */
const CHECK_STATE: Readonly<Record<string, string>> = {
  failing: '失敗',
  failed: '失敗',
  errored: '發生錯誤',
  neutral: '中性',
  'timed out': '已逾時',
  cancelled: '已取消',
  stale: '過時',
  pending: '擱置中',
  'in progress': '進行中',
  requested: '已請求',
  queued: '已排入佇列',
  skipped: '已略過',
  expected: '等待回報',
  successful: '成功',
  'action required': '需要採取動作'
}

const CHECK_STATE_SOURCE = Object.keys(CHECK_STATE).join('|')
const CHECK_PART_SOURCE = `\\d+ (?:${CHECK_STATE_SOURCE})`
const CHECK_PART_RE = new RegExp(`(\\d+) (${CHECK_STATE_SOURCE})`, 'g')

/**
 * 1 failing, 2 skipped, and 15 successful → 1 項檢查失敗、2 項已略過、15 項成功（检查量词作「項」）；
 * 原文只有 and、没有逗号时不加标点：1 failing and 1 successful → 1 項檢查失敗和 1 項成功
 */
function checkSummary(list: string): string {
  const parts = [...list.matchAll(CHECK_PART_RE)].map(
    ([, count, state], index) => `${count} 項${index === 0 ? '檢查' : ''}${CHECK_STATE[state!] ?? state}`
  )
  return list.includes(',') ? parts.join('、') : parts.join('和 ')
}

/** 检查耗时：41s / 1m 30s / 2h 5m → 41 秒 / 1 分鐘 30 秒 / 2 小時 5 分鐘 */
const DURATION_UNIT: Readonly<Record<string, string>> = { s: '秒', m: '分鐘', h: '小時', d: '天' }
const DURATION_SOURCE = '\\d+[smhd](?: \\d+[smhd]){0,2}'

function duration(text: string): string {
  return text.replace(/(\d+)([smhd])/g, (_, amount: string, unit: string) => `${amount} ${DURATION_UNIT[unit] ?? unit}`)
}

/** 检查结论（Failing after 30s 中的状态词） */
const CHECK_CONCLUSION: Readonly<Record<string, string>> = {
  Failing: '失敗',
  Failed: '失敗',
  Cancelled: '取消',
  Canceled: '取消',
  Errored: '發生錯誤',
  'Timed out': '逾時',
  'Startup failure': '啟動失敗',
  Skipped: '略過',
  Stale: '過時',
  'Action required': '需要採取動作'
}

const CHECK_CONCLUSION_SOURCE = Object.keys(CHECK_CONCLUSION).join('|')

const regexp: readonly RegExpRule[] = [
  // 检查对话框副标题：1 failing, 2 skipped, and 15 successful checks
  [new RegExp(`^(${CHECK_PART_SOURCE}(?:(?:, and |, | and )${CHECK_PART_SOURCE})*) checks?$`), (_, list: string) => checkSummary(list)],
  [/^(\d+) checks?$/, '$1 項檢查'],
  // 检查运行耗时：Successful in 41s → 41 秒內成功；Failing after 2m 5s → 2 分鐘 5 秒後失敗（原文无标点，译文不加逗号）
  [
    new RegExp(`^(Successful|Success|Completed) in (${DURATION_SOURCE})$`),
    (_, state: string, time: string) => joinCjk(duration(time), `內${state === 'Completed' ? '完成' : '成功'}`)
  ],
  [
    new RegExp(`^(${CHECK_CONCLUSION_SOURCE}) after (${DURATION_SOURCE})$`),
    (_, state: string, time: string) => joinCjk(duration(time), `後${CHECK_CONCLUSION[state] ?? state}`)
  ]
]

/**
 * 提交检查弹层的汇总与耗时：检查对话框副标题（1 failing, 2 skipped, and 15 successful checks）、
 * 检查数（N checks）、检查运行耗时（Successful in 41s、Failing after 30s）。
 * 只含正则：由 commits.ts 合并；存储库首页最新提交行也有同一弹层，作用域 common → repository → code
 * 不含 commits，code.ts 也合并本文件（先例：codespaces/repo-rules.ts 由 repository.ts 合并）。
 */
export default { regexp } satisfies PageDictionary
