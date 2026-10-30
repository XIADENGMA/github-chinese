import type { PageDictionary } from '../../../core/types'

/**
 * 热门时间范围：热门短语里的 today 译「今日」（今日 675 顆星、今日熱門），
 * 日期范围选项 Today 仍由全局词条译「今天」；this week / this month 与日期范围选项同译
 */
const SINCE: Readonly<Record<string, string>> = {
  today: '今日',
  'this week': '本週',
  'this month': '本月',
}

/** 热门榜类型 */
const KIND: Readonly<Record<string, string>> = {
  repositories: '儲存庫',
  developers: '開發人員',
}

/** 语言名（变量）两侧补空格，与中文隔开 */
function spaced(name: string | undefined): string {
  return name ? ` ${name} ` : ''
}

/**
 * 热门页 /trending、/trending/developers：页头、自然语言 / 编程语言 / 时间范围 / 可赞助筛选、
 * 储存库与开发人员条目、空状态、标签页标题。编程语言名由全局忽略规则跳过。
 * Spoken language 译「自然語言」，与编程语言筛选（語言）区分。
 */
export default {
  static: {
    // 页头
    'See what the GitHub community is most excited about today.': '看看 GitHub 社群今天最熱衷什麼。',
    'See what the GitHub community is most excited about this week.': '看看 GitHub 社群本週最熱衷什麼。',
    'See what the GitHub community is most excited about this month.': '看看 GitHub 社群本月最熱衷什麼。',
    'These are the developers building the hot tools today.': '這些是今天打造熱門工具的開發人員。',
    'These are the developers building the hot tools this week.': '這些是本週打造熱門工具的開發人員。',
    'These are the developers building the hot tools this month.': '這些是本月打造熱門工具的開發人員。',

    // 自然语言筛选与首次访问提示
    'Spoken Language:': '自然語言：',
    'Select a spoken language': '選擇自然語言',
    'Type or choose a spoken language': '輸入或選擇自然語言',
    'Filter spoken languages': '篩選自然語言',
    'Clear spoken language': '清除自然語言',
    'Filter by spoken language': '依自然語言篩選',
    'Select your preferred spoken language in order to see matching trending results.':
      '選擇你偏好的自然語言，以查看相符的熱門結果。',
    // 句子被链接拆成：This setting can be saved in your + profile settings + .
    'This setting can be saved in your': '此設定可儲存至你的',
    'This setting can be updated in your': '此設定可更新於你的',

    // 编程语言、时间范围、可赞助筛选（产品名按用户要求译成中文：GitHub Sponsors → GitHub 贊助；developer 照术语表作「開發人員」）
    'Type or choose a language': '輸入或選擇語言',
    'Adjust time span': '調整時間範圍',
    'GitHub Sponsors participation': 'GitHub 贊助參與情形',
    'Sponsorable developers': '可贊助的開發人員',
  },
  scoped: {
    'profile settings': '個人檔案設定',
    'Language:': '語言：',
    'Select a language': '選擇語言',
    'Filter languages': '篩選語言',
    'Clear language': '清除語言',
    'Unknown languages': '未知語言',
    // 已选语言显示在按钮上，主题页的语言筛选菜单也不在全局忽略范围内：与其它词条同形的编程语言名原样保留
    Logos: 'Logos',
    Move: 'Move',
    Reason: 'Reason',
    'Date range:': '日期範圍：',
    'Sponsorable:': '可贊助：',
    // 与「Sponsorable developers」同属可赞助筛选
    'All developers': '所有開發人員',
    // 筛选的不限选项
    Any: '不限',

    // 储存库条目：星号 / 分叉数链接的图标 aria-label（单数形式由 common-ui 翻译）、Built by 头像
    stars: '星號',
    forks: '分叉',
    // Built by 后接主要贡献者头像，作「建立者」（GLOSSARY.zh-TW 繁体补充），不作「建置者」
    'Built by': '建立者',

    // 开发人员条目
    'Popular repo': '熱門儲存庫',
  },
  regexp: [
    // 储存库条目：675 stars today / 2,987 stars this week
    [/^([\d,]+) stars? (today|this week|this month)$/, (_, count, since) => `${SINCE[since] ?? since} ${count} 顆星`],
    // 开发人员条目的无障碍名称（赞助按钮 Sponsor @user 由 common-ui 翻译）
    [/^Works for (.+)$/, '任職於 $1'],
    [/^Is from (.+)$/, '來自 $1'],
    // 空状态：It looks like we don’t have any trending repositories for Zimpl.
    [
      /^It looks like we don[’']t have any trending (repositories|developers)(?: for (.+?))?\.$/,
      (_, kind, language) => `目前沒有${spaced(language)}熱門${KIND[kind] ?? kind}。`,
    ],
    // 标签页标题段：Trending TypeScript repositories on GitHub this week
    [
      /^Trending (?:(.+) )?(repositories|developers) on GitHub (today|this week|this month)$/,
      (_, language, kind, since) => `${SINCE[since] ?? since} GitHub 上的${spaced(language)}熱門${KIND[kind] ?? kind}`,
    ],
  ],
} satisfies PageDictionary
