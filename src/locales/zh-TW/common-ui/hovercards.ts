import type { PageDictionary } from '../../../core/types'

/**
 * 悬停卡片：用户、组织、存储库、议题、拉取请求、讨论、提交的悬停卡片界面文字。
 * 卡片中的简介、所在地、正文摘要是用户内容，整块忽略；状态、计数、时间由其它子词典的通用规则翻译。
 * hovercard 按 VS Code 繁中的 hover（暫留）译「暫留卡片」。
 */

const REPO = '([\\w.-]+/[\\w.-]+)'

const ITEM_KINDS: Readonly<Record<string, string>> = {
  issue: '議題',
  'pull request': '拉取請求',
  discussion: '討論',
}

/** Opened this …：议题、拉取请求的 open 作「建立」（术语表），讨论与静态词条同作「發起」 */
const OPENED: Readonly<Record<string, string>> = {
  issue: '建立了',
  'pull request': '建立了',
  discussion: '發起了',
}

const PERIODS: Readonly<Record<string, string>> = {
  day: '一天',
  week: '一週',
  month: '一個月',
  year: '一年',
}

export default {
  static: {
    'Press escape to close this hovercard': '按 Esc 鍵關閉此暫留卡片',
    'Hovercard is unavailable': '暫留卡片無法使用',
    // 悬停卡片的无障碍名称（按卡片类型）
    Hovercard: '暫留卡片',
    'User Hovercard': '使用者暫留卡片',
    'Organization Hovercard': '組織暫留卡片',
    'Team Hovercard': '團隊暫留卡片',
    'Repository Hovercard': '儲存庫暫留卡片',
    'Issue Hovercard': '議題暫留卡片',
    'Pull Request Hovercard': '拉取請求暫留卡片',
    'Discussion Hovercard': '討論暫留卡片',
    'Commit Hovercard': '提交暫留卡片',
    'Project Hovercard': '專案暫留卡片',
    'Package Hovercard': '套件暫留卡片',
    'Integration Hovercard': '整合暫留卡片',
    'Copilot Hovercard': 'Copilot 暫留卡片',
    'Automated Reviewer Hovercard': '自動審查者暫留卡片',
    'Sponsors Hovercard': '贊助暫留卡片',
    'Achievement Hovercard': '成就暫留卡片',
    'Advisory Hovercard': '公告暫留卡片',
    'CWE Hovercard': 'CWE 暫留卡片',
    'Security Alert Hovercard': '安全性警示暫留卡片',
    'Dependabot Alert Hovercard': 'Dependabot 警示暫留卡片',
    // 用户卡片的区块名称（aria-label）
    'User avatar': '使用者頭像',
    'User login and name': '使用者名稱和姓名',
    'User bio': '使用者簡介',
    'User location': '使用者所在地',
    'User action buttons': '使用者動作按鈕',
    // PRO 徽章指 GitHub Pro 方案（术语表：專業版），与个人主页、个人资料设置一致
    'User pro badge': '專業版徽章',
    // 用户与当前页面的关系
    'Owns this repository': '擁有此儲存庫',
    'Committed to this repository': '曾提交至此儲存庫',
    'Opened this issue': '建立了此議題',
    'Opened this pull request': '建立了此拉取請求',
    'Opened this pull request (their first ever)': '建立了此拉取請求（其第一個拉取請求）',
    'Opened this discussion': '發起了此討論',
    'Started this discussion': '發起了此討論',
    'You left a review': '你送出了審查',
    'Left a review': '送出了審查',
    'Member of': '所屬組織',
    // 你与议题、拉取请求的关系
    'You opened this issue': '你建立了此議題',
    'You commented on this issue': '你在此議題中留言',
    'You commented on and opened this issue': '你建立了此議題並留言',
    'You were mentioned on and commented on this issue': '你在此議題中被提及並留言',
    'You opened this pull request': '你建立了此拉取請求',
    'You commented on this pull request': '你在此拉取請求中留言',
    'You commented on and opened this pull request': '你建立了此拉取請求並留言',
    'You were mentioned on and commented on this pull request': '你在此拉取請求中被提及並留言',
    'You were mentioned on and opened this pull request': '你建立了此拉取請求並在其中被提及',
    'You are assigned to this pull request': '你是此拉取請求的負責人',
    'You are assigned to and opened this pull request': '你建立了此拉取請求且是其負責人',
    // 关系行前的图标（aria-label 为图标名）
    'Git-commit': '提交',
    'Git-pull-request': '拉取請求',
    'Issue-opened': '議題',
    'Comment-discussion': '討論',
    // Answered N discussions in owner/repo 前的图标
    'Check-circle': '已回答',
    // 存储库卡片的星标、复刻图标
    star: '星號',
    fork: '分叉',
  },
  regexp: [
    [
      /^Committed to this repository in the past (day|week|month|year)$/,
      (_, period: string) => `過去${PERIODS[period]!}內曾提交至此儲存庫`,
    ],
    [
      /^Opened this (issue|pull request|discussion) \(their first in @([\w.-]+)\)$/,
      (_, kind: string, org: string) =>
        `${OPENED[kind]!}此${ITEM_KINDS[kind]!}（在 @${org} 中的第一個${ITEM_KINDS[kind]!}）`,
    ],
    [new RegExp(`^Started (\\d[\\d,]*) discussions? in ${REPO}$`), '在 $2 中發起了 $1 個討論'],
    [new RegExp(`^Answered (\\d[\\d,]*) discussions? in ${REPO}$`), '在 $2 中回答了 $1 個討論'],
    [/^Sponsor @([\w-]+)$/, '贊助 @$1'],
    [/^View all commits by ([\w.-]+(?:\[bot\])?)$/, '查看 $1 的所有提交'],
  ],
  // 用户简介、所在地、个人状态，议题 / 拉取请求 / 讨论的正文摘要与标题
  ignore: [
    '.markdown-body-short',
    '.js-hovercard-content .dashboard-break-word',
    '.js-hovercard-content address',
    '.js-hovercard-content .user-status-message-wrapper',
  ],
} satisfies PageDictionary
