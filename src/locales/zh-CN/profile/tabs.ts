import type { PageDictionary } from '../../../core/types'
import { DATE_SOURCE, joinCjk, translateTime } from '../helpers'

/**
 * 筛选摘要片段（与 <strong> 交错出现，片段间不加标点）：
 * 「401 results for <source> repositories matching <a> written in <JavaScript> sorted by <name>」
 * → 「401 个结果 类型为 源 的存储库 匹配 a 语言为 JavaScript 排序依据为 名称」
 * 「17 results for <forked> starred repositories matching <a>」
 * 「16 stars matching <react> written in <TypeScript>」
 */
const SUMMARY_HEADS = ['result for', 'results for'] as const
const SUMMARY_SUBJECTS: Readonly<Record<string, string>> = {
  repositories: '存储库',
  'starred repositories': '已加星标的存储库',
}
const SUMMARY_TAILS: Readonly<Record<string, string>> = {
  matching: '匹配',
  'written in': '语言为',
  'sorted by': '排序依据为',
}

function summaryFragments(): Record<string, string> {
  const entries: [string, string][] = SUMMARY_HEADS.map((head) => [head, '个结果 类型为'])
  for (const [subject, subjectZh] of Object.entries(SUMMARY_SUBJECTS)) {
    for (const [tail, tailZh] of Object.entries(SUMMARY_TAILS)) {
      // 前面是类型词：「源 的存储库 匹配」
      entries.push([`${subject} ${tail}`, `的${subjectZh} ${tailZh}`])
      // 无类型：「个结果 存储库匹配」
      for (const head of SUMMARY_HEADS) entries.push([`${head} ${subject} ${tail}`, `个结果 ${subjectZh}${tailZh}`])
    }
  }
  for (const noun of ['star', 'stars']) {
    entries.push([`${noun} matching`, '个星标匹配'], [`${noun} written in`, '个星标 语言为'])
  }
  return Object.fromEntries(entries)
}

/** 空状态主语：You → 你；用户名后补空格与中文隔开 */
function who(name: string): string {
  return name === 'You' ? '你' : `${name} `
}

/** 标签页标题段：「torvalds (Linus Torvalds) / Repositories」 */
const TAB_TITLES: Readonly<Record<string, string>> = {
  Repositories: '存储库',
  Starred: '星标',
  'starred topics': '已加星标的主题',
  Followers: '关注者',
  Following: '正在关注',
  Projects: '项目',
  Packages: '软件包',
  Sponsoring: '正在赞助',
  Achievements: '成就',
}

/** 星标标签页按钮里的类型与排序值 */
const TYPE_LABELS: Readonly<Record<string, string>> = {
  All: '全部',
  Sources: '源存储库',
  Forks: '复刻',
  'Can be sponsored': '可赞助',
  Mirrors: '镜像',
  Templates: '模板',
  Archived: '已存档',
  Public: '公共',
  Private: '专用',
}
const SORT_LABELS: Readonly<Record<string, string>> = {
  'Recently starred': '最近星标',
  'Recently active': '最近活跃',
  'Most stars': '星标最多',
}

/**
 * 星标列表的预置名称：添加到列表菜单里 GitHub 建议的三个列表，选中即按此名创建。
 * 列表名区域（星标页卡片、列表页标题、星标菜单的列表名与建议项）里整段匹配时翻译（listNames），
 * 其余列表名是用户内容、保持原文；区域外的同名文字由 common-ui/actions.ts 的 static 兜底
 */
export const STAR_LIST_NAMES: Readonly<Record<string, string>> = {
  '🔮 Future ideas': '🔮 未来构想',
  '🚀 My stack': '🚀 我的技术栈',
  '✨ Inspiration': '✨ 灵感',
}

/** 列表名：预置名称取译名，其余保持原文 */
function starListName(name: string): string {
  return Object.hasOwn(STAR_LIST_NAMES, name) ? STAR_LIST_NAMES[name]! : name
}

/** 存储库 / 星标 / 关注者 / 列表 / 项目 / 软件包 / 赞助标签页 */
export default {
  static: {
    // 本人主页的标签页标题
    'Your Repositories': '你的存储库',
    'Your Stars': '你的星标',
    'Your Packages': '你的软件包',
    'Your Achievements': '你的成就',
    'Your Followers': '你的关注者',
    'Who You’re Following': '你关注的人',
    'Your starred repositories': '你已加星标的存储库',
    'Your starred topics': '你已加星标的主题',

    // 存储库标签页
    'Find a repository…': '查找存储库…',
    'Select type': '选择类型',
    'Select order': '选择排序依据',
    Sources: '源存储库',
    'Can be sponsored': '可赞助',
    Mirrors: '镜像',
    Templates: '模板',
    'Public archive': '公共存档',
    'Private archive': '专用存档',
    'Forked from': '复刻自',
    // 条目活动曲线的提示
    'Past year of activity': '过去一年的活动',

    // 星标标签页
    'Name ascending (A-Z)': '名称升序 (A-Z)',
    'Name descending (Z-A)': '名称降序 (Z-A)',
    'Search starred repositories': '搜索已加星标的存储库',
    'Search stars': '搜索星标',
    'Search stars…': '搜索星标…',
    'All languages': '所有语言',
    'Recently starred': '最近星标',
    'Recently active': '最近活跃',
    'Starred repositories': '已加星标的存储库',
    'Showing results': '显示结果',
    // 本人星标搜索结果的末尾（他人的由正则翻译）
    'That’s it. You’ve reached the end of your stars.': '已显示你的全部星标。',
    "That's it. You've reached the end of your stars.": '已显示你的全部星标。',
    'Starred topics': '已加星标的主题',
    'See all starred topics': '查看所有已加星标的主题',
    'See all starred repositories': '查看所有已加星标的存储库',
    'Repositories in this list': '此列表中的存储库',
    'Create list': '创建列表',
    'Edit list': '编辑列表',
    'Delete list': '删除列表',
    'Are you sure you want to delete this list?': '确定要删除此列表吗？',
    'Show all lists...': '显示所有列表...',
    'Show all lists…': '显示所有列表…',
    'Create your first list': '创建你的第一个列表',
    'Create your first list.': '创建你的第一个列表。',
    'Lists make it easier to organize and curate repositories that you have starred.':
      '列表可以帮你整理和归类已加星标的存储库。',
    'Write a description': '编写描述',
    // 本人星标空状态：As you <explore GitHub>, star repositories to save them for later and they’ll show up here.
    'explore GitHub': '探索 GitHub',
    ', star repositories to save them for later and they’ll show up here.':
      '时为存储库加星标留待以后查看，它们会显示在这里。',
    ", star repositories to save them for later and they'll show up here.":
      '时为存储库加星标留待以后查看，它们会显示在这里。',
    // 星标列表页（/stars/<用户>/lists/<列表>）的空状态
    'Add repositories to this list': '将存储库添加到此列表',
    'Star repositories on GitHub to keep track of your favorite projects and inspirational code.':
      '为 GitHub 上的存储库加星标来跟踪你喜爱的项目和富有启发性的代码。',
    'Explore repositories.': '探索存储库。',

    // 已加星标的主题（/stars/<用户>/topics）
    'Starred Topics': '已加星标的主题',
    'Browse starred topics': '浏览已加星标的主题',
    'Your Starred Topics': '你已加星标的主题',
    'Browse your starred topics': '浏览你已加星标的主题',
    'You must be signed in to star a topic': '登录后才能为主题加星标',
    // 本人空状态：As you <explore GitHub>, star topics to save them for later and they’ll show up here.
    'You don’t have any starred topics, yet.': '你还没有已加星标的主题。',
    "You don't have any starred topics, yet.": '你还没有已加星标的主题。',
    ', star topics to save them for later and they’ll show up here.': '时为主题加星标留待以后查看，它们会显示在这里。',
    ", star topics to save them for later and they'll show up here.": '时为主题加星标留待以后查看，它们会显示在这里。',

    // 星标页（/stars/<用户>）的页头：本人视图与他人视图
    'Your Starred Repositories': '你已加星标的存储库',
    'Browse your starred repositories': '浏览你已加星标的存储库',
    'Browse your starred repositories and topics': '浏览你已加星标的存储库和主题',
    'Starred Repositories': '已加星标的存储库',
    'Browse starred repositories': '浏览已加星标的存储库',
    'Browse starred repositories and topics': '浏览已加星标的存储库和主题',

    // 关注者 / 正在关注
    'Learn more about being social on GitHub.': '了解如何在 GitHub 上社交。',
    'Learn more about being social on GitHub': '了解如何在 GitHub 上社交',
    'about being social on GitHub.': '关于在 GitHub 上社交的信息。',

    // 项目标签页
    "There aren't any projects yet": '暂无项目',
    'There aren’t any projects yet': '暂无项目',
    'Create your first GitHub project': '创建你的第一个 GitHub 项目',
    'Projects are a customizable, flexible tool for planning and tracking your work.':
      '项目是可自定义的灵活工具，用于规划和跟踪工作。',

    // 软件包标签页
    'Get started with GitHub Packages': '开始使用 GitHub 软件包',
    'Safely publish packages, store your packages alongside your code, and share your packages privately with your team.':
      '安全地发布软件包，将软件包与代码存放在一起，并与团队私下共享。',
    'Choose a registry': '选择注册表',
    'A default package manager used for the Java programming language and the Java runtime environment.':
      'Java 编程语言和 Java 运行时环境的默认软件包管理器。',
    'A free and open source package manager used for the Microsoft development platforms including .NET.':
      '用于 .NET 等 Microsoft 开发平台的免费开源软件包管理器。',
    'A standard format for distributing Ruby programs and libraries used for the Ruby programming language.':
      '用于分发 Ruby 程序和库的标准格式。',
    'A package manager for JavaScript, included with Node.js. npm makes it easy for developers to share and reuse code.':
      'JavaScript 软件包管理器，随 Node.js 提供。npm 让开发人员能轻松共享和复用代码。',
    'A single place for your team to manage Docker images and decide who can see and access your images.':
      '集中管理 Docker 映像并决定谁可以查看和访问你的映像。',

    // 赞助标签页
    'Past sponsorship': '过往赞助',
  },
  scoped: {
    ...summaryFragments(),
    // 只有类型词时的末段：17 results for <forked> starred repositories
    'starred repositories': '的已加星标的存储库',
    // 筛选摘要中的类型词与排序词
    source: '源',
    forked: '复刻',
    archived: '已存档',
    mirror: '镜像',
    template: '模板',
    sponsorable: '可赞助',
    public: '公共',
    private: '专用',
    name: '名称',
    'last updated': '最后更新',
    'recently starred': '最近星标',
    'recently active': '最近活跃',
    'most stars': '星标最多',
    'written in': '语言为',
    'sorted by': '排序依据为',
    // 筛选按钮与菜单
    Type: '类型',
    'Sort:': '排序：',
    'Last updated': '最后更新',
    'Most stars': '星标最多',
    // 存储库条目
    Other: '其他',
    stars: '星标',
    forks: '复刻',
    Containers: '容器',
    // 创建 / 编辑列表对话框：读屏标签与表情符号提示（Tip: <type> <:> to add emoji to the name or description.）
    'Name .': '名称。',
    'Description .': '描述。',
    type: '输入',
    'Save list': '保存列表',
    // 本人星标空状态、已加星标的主题空状态的开头片段
    'As you': '在你',
    // 软件包标签页：筛选、搜索无结果「Try <a>…</a> to find what you're looking for.」与列表项
    // 「Published <时间> by <所有者> in <存储库>」（与 packages 词典一致；原文无逗号，译文不加）
    'Type:': '类型：',
    'Close type options': '关闭类型选项',
    'Visibility:': '可见性：',
    'Select visibility': '选择可见性',
    'Close visibility options': '关闭可见性选项',
    'Select sort view': '选择排序依据',
    'Close sort options': '关闭排序选项',
    'Most downloads': '下载最多',
    'Least downloads': '下载最少',
    Container: '容器',
    Try: '试试',
    "to find what you're looking for.": '来查找你需要的内容。',
    'to find what you’re looking for.': '来查找你需要的内容。',
    Published: '发布于',
    by: '发布者',
    in: '存储库',
    // 赞助标签页摘要片段：
    // <user> is sponsoring <12> organizations and maintainers and has sponsored <22> in the past
    // <user> has sponsored <3> organizations and maintainers in the past
    'is sponsoring': '正在赞助',
    'has sponsored': '曾赞助过',
    'organizations and maintainers and has sponsored': '个组织和维护者并曾赞助过',
    'organization or maintainer and has sponsored': '个组织或维护者并曾赞助过',
    'organizations and maintainers': '个组织和维护者',
    'organization or maintainer': '个组织或维护者',
    'organizations and maintainers in the past': '个组织和维护者',
    'organization or maintainer in the past': '个组织或维护者',
    'in the past': '个',
    // Bulk Sponsor 卡片按钮
    'Get started': '开始使用',
  },
  regexp: [
    // 星标标签页按钮：Type: Forks / Language: Swift / Sort by: Most stars
    [
      new RegExp(`^Type: (${Object.keys(TYPE_LABELS).join('|')})$`),
      (_, type: string) => `类型：${TYPE_LABELS[type] ?? type}`,
    ],
    [/^Language: (.+)$/, (_, language: string) => `语言：${language === 'All' ? '全部' : language}`],
    [
      new RegExp(`^Sort by: (${Object.keys(SORT_LABELS).join('|')})$`),
      (_, sort: string) => `排序依据：${SORT_LABELS[sort] ?? sort}`,
    ],
    // 存储库条目：1 issue needs help
    [/^(\d[\d,]*) issues? needs? help$/, '$1 个议题需要帮助'],

    // 空状态
    [
      /^(You|[\w-]+) (?:don|doesn)[’']t have any (public )?repositories (that match|yet)\.$/,
      (_, name, isPublic, kind) =>
        `${who(name)}${kind === 'yet' ? '还没有' : '没有匹配的'}${isPublic ? '公共' : ''}存储库。`,
    ],
    [
      /^(You|[\w-]+) (?:don|doesn)[’']t have any starred repositories yet\.$/,
      (_, name) => `${who(name)}还没有已加星标的存储库。`,
    ],
    [/^(You|[\w-]+) (?:don|doesn)[’']t have any followers yet\.$/, (_, name) => `${who(name)}还没有关注者。`],
    [/^(You|[\w-]+) (?:aren|isn)[’']t following anybody\.$/, (_, name) => `${who(name)}还没有关注任何人。`],
    [/^That[’']s it\. You[’']ve reached the end of ([\w-]+)[’']s stars\.$/, '已显示 $1 的全部星标。'],
    // 原文只有 and、没有逗号：译文用“和”，不加顿号
    [/^(\d+) open and (\d+) closed projects? found\.$/, '找到 $1 个打开和 $2 个已关闭的项目。'],

    // 赞助标签页
    [new RegExp(`^Sponsoring since (${DATE_SOURCE})$`), (_, date) => joinCjk('赞助始于', translateTime(date))],
    [new RegExp(`^Sponsored on (${DATE_SOURCE})$`), (_, date) => joinCjk('赞助于', translateTime(date))],

    // 软件包标签页
    [
      /^Learn more about (Apache Maven|NuGet|RubyGems|npm|Containers)$/,
      (_, registry) => (registry === 'Containers' ? '了解容器' : `了解 ${registry}`),
    ],

    // 列表页标题段：先于标签页标题段，列表名与标签页同名（如 Projects）时仍按列表页翻译
    [/^([\w-]+)[’']s list \/ (.+)$/, (_, user: string, name: string) => `${user} 的列表 / ${starListName(name)}`],

    // 标签页标题段
    [
      new RegExp(`^(.+?) / (${Object.keys(TAB_TITLES).join('|')})$`),
      (_, owner, tab) => `${owner} / ${TAB_TITLES[tab] ?? tab}`,
    ],
  ],
  inline: [
    // 本人星标空状态、已加星标的主题空状态：As you <explore GitHub>, star … show up here.
    // 整句收录，链接两侧按中文排版补空格；As you 与句尾片段仍按片段收录作兜底
    [
      'As you {}, star repositories to save them for later and they’ll show up here.',
      '在你{} 时为存储库加星标留待以后查看，它们会显示在这里。',
    ],
    [
      "As you {}, star repositories to save them for later and they'll show up here.",
      '在你{} 时为存储库加星标留待以后查看，它们会显示在这里。',
    ],
    [
      'As you {}, star topics to save them for later and they’ll show up here.',
      '在你{} 时为主题加星标留待以后查看，它们会显示在这里。',
    ],
    [
      "As you {}, star topics to save them for later and they'll show up here.",
      '在你{} 时为主题加星标留待以后查看，它们会显示在这里。',
    ],
  ],
  listNames: STAR_LIST_NAMES,
  ignore: [
    // 已加星标的存储库名、星标列表的描述（空状态的标题与说明不在链接里，不受影响）、列表页的列表描述与存储库名；
    // 列表名与列表页标题在全局的星标列表名称区域（core/ignore 的 LIST_NAME_SELECTORS），预置名称照常翻译
    '#user-starred-repos h3 a',
    '#profile-lists-container a.Box-row > :not(.d-flex)',
    '#user-profile-frame .flex-justify-between:has(> h1) + .f4',
    '#user-list-repositories h2 > a',
    // 已加星标的主题：主题名与描述
    'a[href^="/topics/"] p',
    // 语言筛选菜单中的语言名（如 Less 不能译成“较少”）
    '.ActionListContent[href*="language="] .ActionListItem-label',
    '#language-options input[name="language"]:not([value=""]) ~ .text-normal',
    // 软件包列表中的软件包名、所有者名与存储库名
    '#package-results .Box-row a.f4',
    '#package-results .Box-row .f6 a',
  ],
} satisfies PageDictionary
