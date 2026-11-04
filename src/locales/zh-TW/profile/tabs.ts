import type { PageDictionary } from '../../../core/types'
import { DATE_SOURCE, joinCjk, translateTime } from '../helpers'

/**
 * 筛选摘要片段（与 <strong> 交错出现，片段间不加标点）：
 * 「401 results for <source> repositories matching <a> written in <JavaScript> sorted by <name>」
 * → 「401 項結果 類型為 來源 的儲存庫 符合 a 語言為 JavaScript 排序依據為 名稱」
 * 「17 results for <forked> starred repositories matching <a>」
 * 「16 stars matching <react> written in <TypeScript>」
 * matching 后接搜寻词，用及物的「符合」（「相符」不带宾语）
 */
const SUMMARY_HEADS = ['result for', 'results for'] as const
const SUMMARY_SUBJECTS: Readonly<Record<string, string>> = {
  repositories: '儲存庫',
  // 前面接「的」，不写「已加星號的儲存庫」，免得连用两个「的」
  'starred repositories': '已加星號儲存庫'
}
const SUMMARY_TAILS: Readonly<Record<string, string>> = {
  matching: '符合',
  'written in': '語言為',
  'sorted by': '排序依據為'
}

function summaryFragments(): Record<string, string> {
  const entries: [string, string][] = SUMMARY_HEADS.map(head => [head, '項結果 類型為'])
  for (const [subject, subjectZh] of Object.entries(SUMMARY_SUBJECTS)) {
    for (const [tail, tailZh] of Object.entries(SUMMARY_TAILS)) {
      // 前面是类型词：「來源 的儲存庫 符合」
      entries.push([`${subject} ${tail}`, `的${subjectZh} ${tailZh}`])
      // 无类型：「項結果 儲存庫符合」
      for (const head of SUMMARY_HEADS) entries.push([`${head} ${subject} ${tail}`, `項結果 ${subjectZh}${tailZh}`])
    }
  }
  for (const noun of ['star', 'stars']) {
    entries.push([`${noun} matching`, '顆星符合'], [`${noun} written in`, '顆星 語言為'])
  }
  return Object.fromEntries(entries)
}

/** 空状态主语：You → 你；使用者名称后补空格与中文隔开 */
function who(name: string): string {
  return name === 'You' ? '你' : `${name} `
}

/** 分页标题段：「torvalds (Linus Torvalds) / Repositories」 */
const TAB_TITLES: Readonly<Record<string, string>> = {
  Repositories: '儲存庫',
  Starred: '星號',
  'starred topics': '已加星號的主題',
  Followers: '追蹤者',
  Following: '追蹤中',
  Projects: '專案',
  Packages: '套件',
  Sponsoring: '贊助中',
  Achievements: '成就'
}

/** 星号分页按钮里的类型与排序值 */
const TYPE_LABELS: Readonly<Record<string, string>> = {
  All: '全部',
  Sources: '來源儲存庫',
  Forks: '分叉',
  'Can be sponsored': '可贊助',
  Mirrors: '鏡像',
  Templates: '範本',
  Archived: '已封存',
  Public: '公開',
  Private: '私人'
}
const SORT_LABELS: Readonly<Record<string, string>> = {
  'Recently starred': '最近加星號',
  'Recently active': '最近活躍',
  'Most stars': '最多星號'
}

/**
 * 星号清单的预置名称：新增到清单选单里 GitHub 建议的三个清单，选取即按此名建立。
 * 清单名区域（星号页卡片、清单页标题、星号选单的清单名与建议项）里整段比对时翻译（listNames），
 * 其余清单名是使用者内容、保持原文；区域外的同名文字由 common-ui/actions.ts 的 static 兜底
 */
export const STAR_LIST_NAMES: Readonly<Record<string, string>> = {
  '🔮 Future ideas': '🔮 未來構想',
  '🚀 My stack': '🚀 我的技術堆疊',
  '✨ Inspiration': '✨ 靈感'
}

/** 清单名：预置名称取译名，其余保持原文 */
function starListName(name: string): string {
  return Object.hasOwn(STAR_LIST_NAMES, name) ? STAR_LIST_NAMES[name]! : name
}

/** 储存库 / 星号 / 追踪者 / 清单 / 专案 / 套件 / 赞助分页 */
export default {
  static: {
    // 本人主页的分页标题
    'Your Repositories': '你的儲存庫',
    'Your Stars': '你的星號',
    'Your Packages': '你的套件',
    'Your Achievements': '你的成就',
    'Your Followers': '你的追蹤者',
    'Who You’re Following': '你追蹤的人',
    'Your starred repositories': '你已加星號的儲存庫',
    'Your starred topics': '你已加星號的主題',

    // 储存库分页
    'Find a repository…': '尋找儲存庫…',
    'Select type': '選擇類型',
    'Select order': '選擇排序方式',
    Sources: '來源儲存庫',
    'Can be sponsored': '可贊助',
    Mirrors: '鏡像',
    Templates: '範本',
    'Public archive': '公開封存',
    'Private archive': '私人封存',
    'Forked from': '分叉自',
    // 条目活动曲线的提示
    'Past year of activity': '過去一年的活動',

    // 星号分页
    'Name ascending (A-Z)': '名稱遞增 (A-Z)',
    'Name descending (Z-A)': '名稱遞減 (Z-A)',
    'Search starred repositories': '搜尋已加星號的儲存庫',
    'Search stars': '搜尋星號',
    'Search stars…': '搜尋星號…',
    'All languages': '所有語言',
    'Recently starred': '最近加星號',
    'Recently active': '最近活躍',
    'Starred repositories': '已加星號的儲存庫',
    'Showing results': '顯示結果',
    // 本人星号搜寻结果的末尾（他人的由正则翻译）
    'That’s it. You’ve reached the end of your stars.': '已顯示你的所有星號。',
    "That's it. You've reached the end of your stars.": '已顯示你的所有星號。',
    'Starred topics': '已加星號的主題',
    'See all starred topics': '查看所有已加星號的主題',
    'See all starred repositories': '查看所有已加星號的儲存庫',
    'Repositories in this list': '此清單中的儲存庫',
    'Create list': '建立清單',
    'Edit list': '編輯清單',
    'Delete list': '刪除清單',
    'Are you sure you want to delete this list?': '確定要刪除此清單嗎？',
    'Show all lists...': '顯示所有清單...',
    'Show all lists…': '顯示所有清單…',
    'Create your first list': '建立你的第一個清單',
    'Create your first list.': '建立你的第一個清單。',
    'Lists make it easier to organize and curate repositories that you have starred.': '清單可讓你更輕鬆地整理並分類已加星號的儲存庫。',
    'Write a description': '撰寫描述',
    // 本人星号空状态：As you <explore GitHub>, star repositories to save them for later and they’ll show up here.
    // 链接文字以英文结尾，后接片段以逗号开头，避免「GitHub時」这样中英文相连
    'explore GitHub': '探索 GitHub',
    ', star repositories to save them for later and they’ll show up here.': '，為儲存庫加星號後會顯示在這裡供日後查看。',
    ", star repositories to save them for later and they'll show up here.": '，為儲存庫加星號後會顯示在這裡供日後查看。',
    // 星号清单页（/stars/<使用者>/lists/<清单>）的空状态
    'Add repositories to this list': '將儲存庫加入此清單',
    'Star repositories on GitHub to keep track of your favorite projects and inspirational code.':
      '為 GitHub 上的儲存庫加星號來隨時掌握你喜愛的專案和啟發靈感的程式碼。',
    'Explore repositories.': '探索儲存庫。',

    // 已加星号的主题（/stars/<使用者>/topics）
    'Starred Topics': '已加星號的主題',
    'Browse starred topics': '瀏覽已加星號的主題',
    'Your Starred Topics': '你已加星號的主題',
    'Browse your starred topics': '瀏覽你已加星號的主題',
    'You must be signed in to star a topic': '登入後才能為主題加星號',
    // 本人空状态：As you <explore GitHub>, star topics to save them for later and they’ll show up here.
    // 与储存库空状态相同，后接片段以逗号开头
    'You don’t have any starred topics, yet.': '你還沒有已加星號的主題。',
    "You don't have any starred topics, yet.": '你還沒有已加星號的主題。',
    ', star topics to save them for later and they’ll show up here.': '，為主題加星號後會顯示在這裡供日後查看。',
    ", star topics to save them for later and they'll show up here.": '，為主題加星號後會顯示在這裡供日後查看。',

    // 星号页（/stars/<使用者>）的页头：本人检视与他人检视
    'Your Starred Repositories': '你已加星號的儲存庫',
    'Browse your starred repositories': '瀏覽你已加星號的儲存庫',
    'Browse your starred repositories and topics': '瀏覽你已加星號的儲存庫和主題',
    'Starred Repositories': '已加星號的儲存庫',
    'Browse starred repositories': '瀏覽已加星號的儲存庫',
    'Browse starred repositories and topics': '瀏覽已加星號的儲存庫和主題',

    // 追踪者 / 追踪中
    'Learn more about being social on GitHub.': '瞭解如何在 GitHub 上社交。',
    'Learn more about being social on GitHub': '瞭解如何在 GitHub 上社交',
    'about being social on GitHub.': '關於在 GitHub 上社交的資訊。',

    // 专案分页
    "There aren't any projects yet": '尚無專案',
    'There aren’t any projects yet': '尚無專案',
    'Create your first GitHub project': '建立你的第一個 GitHub 專案',
    'Projects are a customizable, flexible tool for planning and tracking your work.': '專案是可自訂的彈性工具，用於規劃並追蹤你的工作。',

    // 套件分页
    'Get started with GitHub Packages': '開始使用 GitHub 套件',
    'Safely publish packages, store your packages alongside your code, and share your packages privately with your team.':
      '安全地發布套件，將套件與程式碼存放在一起，並與團隊私下共用。',
    'Choose a registry': '選擇登錄庫',
    'A default package manager used for the Java programming language and the Java runtime environment.':
      'Java 程式語言和 Java 執行環境的預設套件管理員。',
    'A free and open source package manager used for the Microsoft development platforms including .NET.':
      '用於 .NET 等 Microsoft 開發平台的免費開源套件管理員。',
    'A standard format for distributing Ruby programs and libraries used for the Ruby programming language.':
      'Ruby 程式語言用於散發程式和程式庫的標準格式。',
    'A package manager for JavaScript, included with Node.js. npm makes it easy for developers to share and reuse code.':
      'JavaScript 的套件管理員，隨附於 Node.js。npm 讓開發人員能輕鬆共用並重複使用程式碼。',
    'A single place for your team to manage Docker images and decide who can see and access your images.':
      '讓團隊集中管理 Docker 映像檔並決定誰可以查看、存取你的映像檔。',

    // 赞助分页
    'Past sponsorship': '過往贊助'
  },
  scoped: {
    ...summaryFragments(),
    // 只有类型词时的末段：17 results for <forked> starred repositories
    'starred repositories': '的已加星號儲存庫',
    // 筛选摘要中的类型词与排序词
    source: '來源',
    forked: '分叉',
    archived: '已封存',
    mirror: '鏡像',
    template: '範本',
    sponsorable: '可贊助',
    public: '公開',
    private: '私人',
    name: '名稱',
    'last updated': '上次更新',
    'recently starred': '最近加星號',
    'recently active': '最近活躍',
    'most stars': '最多星號',
    'written in': '語言為',
    'sorted by': '排序依據為',
    // 筛选按钮与选单
    Type: '類型',
    'Sort:': '排序：',
    'Last updated': '上次更新',
    'Most stars': '最多星號',
    // 储存库条目
    Other: '其他',
    stars: '星號',
    forks: '分叉',
    Containers: '容器',
    // 建立 / 编辑清单对话框：读屏标签与表情符号提示（Tip: <type> <:> to add emoji to the name or description.）
    'Name .': '名稱。',
    'Description .': '描述。',
    type: '輸入',
    'Save list': '儲存清單',
    // 本人星号空状态、已加星号的主题空状态的开头片段
    'As you': '當你',
    // 套件分页：筛选、搜寻无结果「Try <a>…</a> to find what you're looking for.」与列表项
    // 「Published <时间> by <拥有者> in <储存库>」（与 packages 词典一致；原文无逗号，译文不加）
    'Type:': '類型：',
    'Close type options': '關閉類型選項',
    'Visibility:': '可見度：',
    'Select visibility': '選擇可見度',
    'Close visibility options': '關閉可見度選項',
    'Select sort view': '選擇排序方式',
    'Close sort options': '關閉排序選項',
    'Most downloads': '最多下載次數',
    'Least downloads': '最少下載次數',
    Container: '容器',
    Try: '嘗試',
    "to find what you're looking for.": '來尋找你要的內容。',
    'to find what you’re looking for.': '來尋找你要的內容。',
    Published: '發布於',
    by: '發布者',
    in: '儲存庫',
    // 赞助分页摘要片段：
    // <user> is sponsoring <12> organizations and maintainers and has sponsored <22> in the past
    // <user> has sponsored <3> organizations and maintainers in the past
    'is sponsoring': '正在贊助',
    'has sponsored': '曾贊助過',
    'organizations and maintainers and has sponsored': '個組織和維護者並曾贊助過',
    'organization or maintainer and has sponsored': '個組織或維護者並曾贊助過',
    'organizations and maintainers': '個組織和維護者',
    'organization or maintainer': '個組織或維護者',
    'organizations and maintainers in the past': '個組織和維護者',
    'organization or maintainer in the past': '個組織或維護者',
    'in the past': '個',
    // Bulk Sponsor 卡片按钮
    'Get started': '開始使用'
  },
  regexp: [
    // 星号分页按钮：Type: Forks / Language: Swift / Sort by: Most stars
    [new RegExp(`^Type: (${Object.keys(TYPE_LABELS).join('|')})$`), (_, type: string) => `類型：${TYPE_LABELS[type] ?? type}`],
    [/^Language: (.+)$/, (_, language: string) => `語言：${language === 'All' ? '全部' : language}`],
    [new RegExp(`^Sort by: (${Object.keys(SORT_LABELS).join('|')})$`), (_, sort: string) => `排序依據：${SORT_LABELS[sort] ?? sort}`],
    // 储存库条目：1 issue needs help
    [/^(\d[\d,]*) issues? needs? help$/, '$1 個議題需要協助'],

    // 空状态
    [
      /^(You|[\w-]+) (?:don|doesn)[’']t have any (public )?repositories (that match|yet)\.$/,
      (_, name, isPublic, kind) => `${who(name)}${kind === 'yet' ? '還沒有' : '沒有相符的'}${isPublic ? '公開' : ''}儲存庫。`
    ],
    [/^(You|[\w-]+) (?:don|doesn)[’']t have any starred repositories yet\.$/, (_, name) => `${who(name)}還沒有已加星號的儲存庫。`],
    [/^(You|[\w-]+) (?:don|doesn)[’']t have any followers yet\.$/, (_, name) => `${who(name)}還沒有追蹤者。`],
    [/^(You|[\w-]+) (?:aren|isn)[’']t following anybody\.$/, (_, name) => `${who(name)}沒有追蹤任何人。`],
    [/^That[’']s it\. You[’']ve reached the end of ([\w-]+)[’']s stars\.$/, '已顯示 $1 的所有星號。'],
    // 原文只有 and、没有逗号：译文用「和」，不加顿号
    [/^(\d+) open and (\d+) closed projects? found\.$/, '找到 $1 個開放中和 $2 個已關閉的專案。'],

    // 赞助分页
    [new RegExp(`^Sponsoring since (${DATE_SOURCE})$`), (_, date) => `${joinCjk('自', translateTime(date))}起贊助`],
    [new RegExp(`^Sponsored on (${DATE_SOURCE})$`), (_, date) => joinCjk('贊助於', translateTime(date))],

    // 套件分页
    [
      /^Learn more about (Apache Maven|NuGet|RubyGems|npm|Containers)$/,
      (_, registry) => (registry === 'Containers' ? '瞭解容器' : `瞭解 ${registry}`)
    ],

    // 清单页标题段：先于分页标题段，清单名与分页同名（如 Projects）时仍按清单页翻译
    [/^([\w-]+)[’']s list \/ (.+)$/, (_, user: string, name: string) => `${user} 的清單 / ${starListName(name)}`],

    // 分页标题段
    [new RegExp(`^(.+?) / (${Object.keys(TAB_TITLES).join('|')})$`), (_, owner, tab) => `${owner} / ${TAB_TITLES[tab] ?? tab}`]
  ],
  inline: [
    // 本人星号空状态、已加星号的主题空状态：As you <explore GitHub>, star … show up here.
    // 整句收录，链接两侧按中文排版补空格；As you 与句尾片段仍按片段收录作兜底
    ['As you {}, star repositories to save them for later and they’ll show up here.', '當你{}，為儲存庫加星號後會顯示在這裡供日後查看。'],
    ["As you {}, star repositories to save them for later and they'll show up here.", '當你{}，為儲存庫加星號後會顯示在這裡供日後查看。'],
    ['As you {}, star topics to save them for later and they’ll show up here.', '當你{}，為主題加星號後會顯示在這裡供日後查看。'],
    ["As you {}, star topics to save them for later and they'll show up here.", '當你{}，為主題加星號後會顯示在這裡供日後查看。']
  ],
  listNames: STAR_LIST_NAMES,
  ignore: [
    // 已加星号的储存库名、星号清单的描述（空状态的标题与说明不在链接里，不受影响）、清单页的清单描述与储存库名；
    // 清单名与清单页标题在全局的星标列表名称区域（core/ignore 的 LIST_NAME_SELECTORS），预置名称照常翻译
    '#user-starred-repos h3 a',
    '#profile-lists-container a.Box-row > :not(.d-flex)',
    '#user-profile-frame .flex-justify-between:has(> h1) + .f4',
    '#user-list-repositories h2 > a',
    // 已加星号的主题：主题名与描述
    'a[href^="/topics/"] p',
    // 语言筛选选单中的语言名（如 Less 不能译成「較少」）
    '.ActionListContent[href*="language="] .ActionListItem-label',
    '#language-options input[name="language"]:not([value=""]) ~ .text-normal',
    // 套件列表中的套件名、拥有者名与储存库名
    '#package-results .Box-row a.f4',
    '#package-results .Box-row .f6 a'
  ]
} satisfies PageDictionary
