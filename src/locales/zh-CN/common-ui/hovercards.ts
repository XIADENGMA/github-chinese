import type { PageDictionary } from '../../../core/types'

/**
 * 悬停卡片：用户、组织、存储库、议题、拉取请求、讨论、提交的悬停卡片界面文字。
 * 卡片中的简介、所在地、正文摘要是用户内容，整块忽略；状态、计数、时间由其它子词典的通用规则翻译。
 */

const REPO = '([\\w.-]+/[\\w.-]+)'

const ITEM_KINDS: Readonly<Record<string, string>> = {
  issue: '议题',
  'pull request': '拉取请求',
  discussion: '讨论'
}

/** Opened this …：拉取请求的 open 作“创建”（术语表），议题仍作“打开”，讨论与静态词条同作“发起” */
const OPENED: Readonly<Record<string, string>> = {
  issue: '打开了',
  'pull request': '创建了',
  discussion: '发起了'
}

const PERIODS: Readonly<Record<string, string>> = {
  day: '一天',
  week: '一周',
  month: '一个月',
  year: '一年'
}

export default {
  static: {
    'Press escape to close this hovercard': '按 Esc 关闭此悬停卡片',
    'Hovercard is unavailable': '悬停卡片不可用',
    // 悬停卡片的无障碍名称（按卡片类型）
    Hovercard: '悬停卡片',
    'User Hovercard': '用户悬停卡片',
    'Organization Hovercard': '组织悬停卡片',
    'Team Hovercard': '团队悬停卡片',
    'Repository Hovercard': '存储库悬停卡片',
    'Issue Hovercard': '议题悬停卡片',
    'Pull Request Hovercard': '拉取请求悬停卡片',
    'Discussion Hovercard': '讨论悬停卡片',
    'Commit Hovercard': '提交悬停卡片',
    'Project Hovercard': '项目悬停卡片',
    'Package Hovercard': '软件包悬停卡片',
    'Integration Hovercard': '集成悬停卡片',
    'Copilot Hovercard': 'Copilot 悬停卡片',
    'Automated Reviewer Hovercard': '自动审查者悬停卡片',
    'Sponsors Hovercard': '赞助悬停卡片',
    'Achievement Hovercard': '成就悬停卡片',
    'Advisory Hovercard': '公告悬停卡片',
    'CWE Hovercard': 'CWE 悬停卡片',
    'Security Alert Hovercard': '安全警报悬停卡片',
    'Dependabot Alert Hovercard': 'Dependabot 警报悬停卡片',
    // 用户卡片的区块名称（aria-label）
    'User avatar': '用户头像',
    'User login and name': '用户名和姓名',
    'User bio': '用户简介',
    'User location': '用户所在地',
    'User action buttons': '用户操作按钮',
    // PRO 徽章指 GitHub Pro 方案（product-names.md：专业版），与个人主页、个人资料设置一致
    'User pro badge': '专业版徽章',
    // 用户与当前页面的关系
    'Owns this repository': '拥有此存储库',
    'Committed to this repository': '曾向此存储库提交代码',
    'Opened this issue': '打开了此议题',
    'Opened this pull request': '创建了此拉取请求',
    'Opened this pull request (their first ever)': '创建了此拉取请求（其第一个拉取请求）',
    'Opened this discussion': '发起了此讨论',
    'Started this discussion': '发起了此讨论',
    'You left a review': '你提交了审查',
    'Left a review': '提交了审查',
    'Member of': '所属组织',
    // 你与议题、拉取请求的关系
    'You opened this issue': '你打开了此议题',
    'You commented on this issue': '你评论了此议题',
    'You commented on and opened this issue': '你打开并评论了此议题',
    'You were mentioned on and commented on this issue': '你在此议题中被提及并发表了评论',
    'You opened this pull request': '你创建了此拉取请求',
    'You commented on this pull request': '你评论了此拉取请求',
    'You commented on and opened this pull request': '你创建并评论了此拉取请求',
    'You were mentioned on and commented on this pull request': '你在此拉取请求中被提及并发表了评论',
    'You were mentioned on and opened this pull request': '你创建了此拉取请求并在其中被提及',
    'You are assigned to this pull request': '你是此拉取请求的受理人',
    'You are assigned to and opened this pull request': '你创建了此拉取请求且是其受理人',
    // 关系行前的图标（aria-label 为图标名）
    'Git-commit': '提交',
    'Git-pull-request': '拉取请求',
    'Issue-opened': '议题',
    'Comment-discussion': '讨论',
    // Answered N discussions in owner/repo 前的图标
    'Check-circle': '已回答',
    // 存储库卡片的星标、复刻图标
    star: '星标',
    fork: '复刻'
  },
  regexp: [
    [
      /^Committed to this repository in the past (day|week|month|year)$/,
      (_, period: string) => `过去${PERIODS[period]!}内曾向此存储库提交代码`
    ],
    [
      /^Opened this (issue|pull request|discussion) \(their first in @([\w.-]+)\)$/,
      (_, kind: string, org: string) => `${OPENED[kind]!}此${ITEM_KINDS[kind]!}（在 @${org} 中的第一个${ITEM_KINDS[kind]!}）`
    ],
    [new RegExp(`^Started (\\d[\\d,]*) discussions? in ${REPO}$`), '在 $2 中发起了 $1 个讨论'],
    [new RegExp(`^Answered (\\d[\\d,]*) discussions? in ${REPO}$`), '在 $2 中回答了 $1 个讨论'],
    [/^Sponsor @([\w-]+)$/, '赞助 @$1'],
    [/^View all commits by ([\w.-]+(?:\[bot\])?)$/, '查看 $1 的所有提交']
  ],
  // 用户简介、所在地、个人状态，议题 / 拉取请求 / 讨论的正文摘要与标题
  ignore: [
    '.markdown-body-short',
    '.js-hovercard-content .dashboard-break-word',
    '.js-hovercard-content address',
    '.js-hovercard-content .user-status-message-wrapper'
  ]
} satisfies PageDictionary
