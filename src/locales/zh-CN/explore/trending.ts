import type { PageDictionary } from '../../../core/types'

/**
 * 趋势时间范围：趋势短语里的 today 译“今日”（今日 675 个星标、今日热门），
 * 日期范围选项 Today 仍由全局词条译“今天”；this week / this month 与日期范围选项同译
 */
const SINCE: Readonly<Record<string, string>> = {
  today: '今日',
  'this week': '本周',
  'this month': '本月',
}

/** 趋势榜类型 */
const KIND: Readonly<Record<string, string>> = {
  repositories: '存储库',
  developers: '开发人员',
}

/** 语言名（变量）两侧补空格，与中文隔开 */
function spaced(name: string | undefined): string {
  return name ? ` ${name} ` : ''
}

/**
 * 趋势页 /trending、/trending/developers：页头、自然语言 / 编程语言 / 时间范围 / 可赞助筛选、
 * 存储库与开发人员条目、空状态、标签页标题。编程语言名由全局忽略规则跳过。
 */
export default {
  static: {
    // 页头
    'See what the GitHub community is most excited about today.': '看看 GitHub 社区今天最关注什么。',
    'See what the GitHub community is most excited about this week.': '看看 GitHub 社区本周最关注什么。',
    'See what the GitHub community is most excited about this month.': '看看 GitHub 社区本月最关注什么。',
    'These are the developers building the hot tools today.': '这些开发人员正在打造今日热门工具。',
    'These are the developers building the hot tools this week.': '这些开发人员正在打造本周热门工具。',
    'These are the developers building the hot tools this month.': '这些开发人员正在打造本月热门工具。',

    // 自然语言筛选与首次访问提示
    'Spoken Language:': '自然语言：',
    'Select a spoken language': '选择自然语言',
    'Type or choose a spoken language': '输入或选择自然语言',
    'Filter spoken languages': '筛选自然语言',
    'Clear spoken language': '清除自然语言',
    'Filter by spoken language': '按自然语言筛选',
    'Select your preferred spoken language in order to see matching trending results.':
      '选择偏好的自然语言以查看匹配的趋势结果。',
    // 句子被链接拆成：This setting can be saved in your + profile settings + .
    'This setting can be saved in your': '此设置可保存到你的',
    'This setting can be updated in your': '此设置可更新于你的',

    // 编程语言、时间范围、可赞助筛选（赞助语境，沿用“开发者”；产品名按用户要求译成中文：GitHub Sponsors → GitHub 赞助）
    'Type or choose a language': '输入或选择语言',
    'Adjust time span': '调整时间范围',
    'GitHub Sponsors participation': 'GitHub 赞助参与情况',
    'Sponsorable developers': '可赞助的开发者',
  },
  scoped: {
    'profile settings': '个人资料设置',
    'Language:': '语言：',
    'Select a language': '选择语言',
    'Filter languages': '筛选语言',
    'Clear language': '清除语言',
    'Unknown languages': '未知语言',
    // 已选语言显示在按钮上，主题页的语言筛选菜单也不在全局忽略范围内：与其它词条同形的编程语言名原样保留
    Logos: 'Logos',
    Move: 'Move',
    Reason: 'Reason',
    'Date range:': '日期范围：',
    'Sponsorable:': '可赞助：',
    // 与“Sponsorable developers”同属可赞助筛选
    'All developers': '所有开发者',
    Any: '任意',

    // 存储库条目：星标 / 复刻数链接的图标 aria-label（单数形式由 common-ui 翻译）、构建者头像
    stars: '星标',
    forks: '复刻',
    'Built by': '构建者',

    // 开发人员条目
    'Popular repo': '热门存储库',
  },
  regexp: [
    // 存储库条目：675 stars today / 2,987 stars this week
    [/^([\d,]+) stars? (today|this week|this month)$/, (_, count, since) => `${SINCE[since] ?? since} ${count} 个星标`],
    // 开发人员条目的无障碍名称（赞助按钮 Sponsor @user 由 common-ui 翻译）
    [/^Works for (.+)$/, '就职于 $1'],
    [/^Is from (.+)$/, '来自 $1'],
    // 空状态：It looks like we don’t have any trending repositories for Zimpl.
    [
      /^It looks like we don[’']t have any trending (repositories|developers)(?: for (.+?))?\.$/,
      (_, kind, language) => `暂无${spaced(language)}趋势${KIND[kind] ?? kind}。`,
    ],
    // 标签页标题段：Trending TypeScript repositories on GitHub this week
    [
      /^Trending (?:(.+) )?(repositories|developers) on GitHub (today|this week|this month)$/,
      (_, language, kind, since) => `${SINCE[since] ?? since} GitHub 上的${spaced(language)}趋势${KIND[kind] ?? kind}`,
    ],
  ],
} satisfies PageDictionary
