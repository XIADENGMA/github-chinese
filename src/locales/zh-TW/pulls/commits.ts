import type { PageDictionary } from '../../../core/types'
import { DATE_SOURCE, joinCjk, translateTime } from '../helpers'

/** 提交签名状态（签名徽章的无障碍名称：verified: 0ff253b，与 commits 词典同译） */
const VERIFICATION_STATES: Readonly<Record<string, string>> = {
  verified: '已驗證',
  unverified: '未驗證',
  'partially verified': '部分驗證'
}

/**
 * “提交”标签页：按日期分组的提交列表、提交行操作、签名徽章、加载错误。与提交列表页（commits 词典）同译。
 * 提交行的通用文字（View commit details、Browse repository at this point 等）由 commits 词典的 static 收录；
 * commits 词典放在 regexp 的规则在拉取请求页不生效，这里按同样译法补充。
 * 提交留言的量词作「則」，多个作者的人数作「人」（与 commits 词典一致）。
 */
export default {
  static: {
    'Failed to load commit list.': '無法載入提交清單。',
    'There are no commits in this pull request.': '此拉取請求中沒有提交。',
    'Loading commits': '正在載入提交',
    'Unable to load commits': '無法載入提交',
    "This pull request is big! We're only showing the most recent 250 commits": '此拉取請求很大！僅顯示最近 250 個提交',
    'Only the most recent 250 commits are being shown.': '僅顯示最近 250 個提交。'
  },
  regexp: [
    // 日期分组标题：Commits on Oct 26, 2026
    [new RegExp(`^Commits on (${DATE_SOURCE})$`), (_, date: string) => joinCjk(translateTime(date), '的提交')],
    [/^Copy full SHA for ([0-9a-f]{7,40})$/, '複製 $1 的完整 SHA'],
    [
      /^(Show|Hide) description for ([0-9a-f]{7,40})$/,
      (_, action: string, sha: string) => `${action === 'Show' ? '顯示' : '隱藏'} ${sha} 的描述`
    ],
    [/^View (\d+) commit comments?$/, '查看 $1 則提交留言'],
    // 多个作者：按钮文字
    [/^(\d+) people$/, '$1 人'],
    // 签名徽章：verified: 0ff253b
    [
      /^(verified|unverified|partially verified): ([0-9a-f]{7,40})$/,
      (_, state: string, sha: string) => `${VERIFICATION_STATES[state] ?? state}：${sha}`
    ],
    [/^Verification error: ([0-9a-f]{7,40})$/, '驗證錯誤：$1']
  ]
} satisfies PageDictionary
