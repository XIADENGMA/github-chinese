import { lookupTable, mergeTables } from '../../../core/table'
import type { PageDictionary } from '../../../core/types'
import common from '../common'
import commonUi from '../common-ui'
import { formatDate } from '../helpers'
import { CATEGORIES } from '../marketplace/browse'

/** 结果页 sr-only 标题中的类型参数（type=…）→ 页面名 */
const RESULT_HEADINGS: Readonly<Record<string, string>> = {
  code: '程式碼搜尋結果',
  repositories: '儲存庫搜尋結果',
  issues: '議題搜尋結果',
  pullrequests: '拉取請求搜尋結果',
  discussions: '討論搜尋結果',
  users: '使用者搜尋結果',
  commits: '提交搜尋結果',
  registrypackages: '套件搜尋結果',
  wikis: 'Wiki 搜尋結果',
  topics: '主題搜尋結果',
  // 产品名译中文（用户定）：Marketplace → 市集
  marketplace: '市集搜尋結果',
}

/** 排序菜单（各结果类型的并集），排序按钮复用；与 common 相同的译文由 pageOnly 去掉，键集合与简体一致 */
const SORT_OPTIONS: Readonly<Record<string, string>> = {
  'Best match': '最相符',
  'Most stars': '最多星號',
  'Fewest stars': '最少星號',
  'Most forks': '最多分叉',
  'Fewest forks': '最少分叉',
  'Recently updated': '最近更新',
  'Least recently updated': '最久未更新',
  'Most commented': '最多留言',
  'Least commented': '最少留言',
  Newest: '最新',
  Oldest: '最舊',
  'Highest score': '最高分數',
  'Lowest score': '最低分數',
  'Most downloads': '最多下載次數',
  'Fewest downloads': '最少下載次數',
  'Most followers': '最多追蹤者',
  'Fewest followers': '最少追蹤者',
  'Most recently joined': '最近加入',
  'Least recently joined': '最早加入',
  'Most repositories': '最多儲存庫',
  'Fewest repositories': '最少儲存庫',
  'Recently committed': '最近提交',
  'Least recently committed': '最早提交',
  'Recently authored': '最近撰寫',
  'Least recently authored': '最早撰寫',
}

const SORT_SOURCE = Object.keys(SORT_OPTIONS).join('|')

/** common 与 common-ui 的全站词条（同一原文 common 优先） */
const commonText = lookupTable(mergeTables([common.static, commonUi.static]))

/** 去掉译文与原文相同、或与 common 全站词条译文相同的词条，避免重复收录 */
function pageOnly(entries: Readonly<Record<string, string>>): Record<string, string> {
  return Object.fromEntries(
    Object.entries(entries).filter(([source, target]) => source !== target && commonText(source) !== target),
  )
}

/** 提交结果的检查摘要：20 successful, 1 skipped, and 1 failing checks（状态词与句式同 commits 的检查摘要） */
const CHECK_STATES: Readonly<Record<string, string>> = {
  successful: '成功',
  failing: '失敗',
  failed: '失敗',
  skipped: '已略過',
  pending: '擱置中',
  queued: '已排入佇列',
  'in progress': '進行中',
  cancelled: '已取消',
  canceled: '已取消',
  neutral: '中性',
  expected: '等待回報',
  errored: '發生錯誤',
  'timed out': '已逾時',
  'action required': '需要採取動作',
  stale: '過時',
  'startup failure': '啟動失敗',
}

const CHECK_PART = `\\d+ (?:${Object.keys(CHECK_STATES).join('|')})`
const CHECK_SEPARATOR_RE = /,? and |, /

/**
 * 20 successful, 1 skipped, and 1 failing → 20 項檢查成功、1 項已略過、1 項失敗（检查量词作「項」）；
 * 标点随原文：原文只有 and、没有逗号时不加标点，3 successful and 1 failing → 3 項檢查成功和 1 項失敗
 */
function checkSummary(list: string): string {
  const parts = list.split(CHECK_SEPARATOR_RE).map((part, index) => {
    const space = part.indexOf(' ')
    const state = part.slice(space + 1)
    return `${part.slice(0, space)} 項${index === 0 ? '檢查' : ''}${CHECK_STATES[state] ?? state}`
  })
  return parts.join(list.includes(',') ? '、' : '和 ')
}

/** 软件包结果的类型图标说明：npm type */
const PACKAGE_TYPES: Readonly<Record<string, string>> = {
  container: '容器類型',
  docker: 'Docker 類型',
  npm: 'npm 類型',
  maven: 'Maven 類型',
  nuget: 'NuGet 類型',
  rubygems: 'RubyGems 類型',
  gradle: 'Gradle 類型',
}

/** 1.1M results / 1 result / 1.2k files（common-ui 的计数规则不含 B）；搜索结果量词作「項」，文件作「個」 */
function countLabel(count: string, kind: string): string {
  return `${count} ${kind.startsWith('file') ? '個檔案' : '項結果'}`
}

/** 提交签名对话框的 sr-only 标题：verified: 06838a0 */
const SIGNATURE_STATES: Readonly<Record<string, string>> = {
  verified: '已驗證',
  unverified: '未驗證',
  'partially verified': '部分驗證',
}

/**
 * 存储库结果中的语言名：<li class="footerItem__…"><span class="languageCircleWrapper__…">色块</span>
 * <span aria-label="Vue language">Vue</span></li>。名称不译（ignore），aria-label 由 attributeRules 改写，
 * 两处共用的选择器不依赖 aria-label
 */
const LANGUAGE_NAME =
  '[data-testid="results-list"] li[class*="footerItem__"] > [class*="languageCircleWrapper__"] + span'

/**
 * 搜索首页与结果页（React）：侧栏筛选、结果头部与排序、各类结果条目、
 * 赞助对话框、右侧推广与提示、代码结果、未登录代码搜索提示。
 * 通用按钮与状态（Star、Verified、Updated、分页、N stars 等计数）由 common 收录；
 * 提交签名弹层（verified signature、GPG Key ID: 等）由 commits 的 static 全站收录。
 * 代码结果的 match 作「相符項目」，量词「個」。
 */
export default {
  static: {
    // 标签页标题
    'Repository search results': '儲存庫搜尋結果',
    'Code search results': '程式碼搜尋結果',
    'Issue search results': '議題搜尋結果',
    'Pull request search results': '拉取請求搜尋結果',
    'Discussion search results': '討論搜尋結果',
    'User search results': '使用者搜尋結果',
    'Commit search results': '提交搜尋結果',
    'Package search results': '套件搜尋結果',
    'Wiki search results': 'Wiki 搜尋結果',
    'Topic search results': '主題搜尋結果',
    'Marketplace search results': '市集搜尋結果',

    // 侧栏与结果头部
    'Advanced search': '進階搜尋',
    'More languages...': '更多語言...',
    'More languages…': '更多語言…',
    'More repositories...': '更多儲存庫...',
    'More repositories…': '更多儲存庫…',
    'More directories...': '更多目錄...',
    'More directories…': '更多目錄…',
    Wikis: 'Wiki',
    'Open column options': '開啟欄選項',
    'View search docs': '查看搜尋說明文件',
    'Sort options': '排序選項',
    'Save search': '儲存搜尋',
    'How can we improve search?': '如何改進搜尋？',

    // 侧栏「進階」限定词
    'Has linked pull request': '有已連結的拉取請求',
    'Mentioned user': '提及的使用者',
    'Mentioned team': '提及的團隊',
    // involves: 限定词（议题页为 Involved user，讨论页为 Involves user）
    'Involved user': '涉及的使用者',
    'Involves user': '涉及的使用者',
    'Number of comments': '留言數',
    'Number of interactions': '互動數',
    'Number of followers': '追蹤者數',
    'Number of forks': '分叉數',
    'Number of stars': '星號數',
    'Number of repositories': '儲存庫數',
    'Date pushed': '推送日期',
    'Creation date': '建立日期',
    'Last updated date': '上次更新日期',
    'CI status': 'CI 狀態',
    'Review status': '審查狀態',
    'Not merged': '未合併',
    'Full name': '全名',
    Sponsorable: '可贊助',
    'Curated topics': '人工整理的主題',
    'Featured topics': '精選主題',
    'Author email': '作者電子郵件',
    'Committer email': '提交者電子郵件',
    'Merge commits': '合併提交',
    'Parent hash': '父提交雜湊',
    'Tree hash': '樹雜湊',
    'Exclude archived': '排除已封存',
    'Exclude forks': '排除分叉',

    // 结果条目（Open linked issues 是按钮名，open 是动词「開啟」，加「已」，避免读成「開啟連結」的议题）
    'Copy full commit hash': '複製完整提交雜湊',
    'Open linked issues': '開啟已連結的議題',
    'View topic': '查看主題',
    'Related:': '相關：',

    // 存储库结果的赞助对话框：「Learn more」（common-ui）+ sr-only「about Sponsors」（Sponsors 指 GitHub Sponsors → 贊助）
    'External links': '外部連結',
    'Learn more about funding links in repositories': '瞭解儲存庫中的贊助連結',
    'about Sponsors': '贊助相關資訊',

    // 右侧推广与提示（结果页 ProTip 的快捷键在 span.hx_kbd 中，不是 <kbd>，引擎按片段翻译）
    'Sponsor open source projects you depend on': '贊助你仰賴的開源專案',
    'Contributors are working behind the scenes to make open source better for everyone—give them the help and recognition they deserve.':
      '貢獻者在幕後努力讓開源對每個人都更好——給予他們應得的協助和肯定。',
    'Explore sponsorable projects': '探索可贊助的專案',
    'Press the': '按',
    'key to activate the search input again and adjust your query.': '鍵可回到搜尋框並調整查詢。',
    'Restrict your search to the title by using the in:title qualifier.': '使用 in:title 限定詞可只搜尋標題。',
    // 产品名译中文（用户定）：GitHub Issues → GitHub 議題、GitHub Packages → GitHub 套件
    'Learn how you can use GitHub Issues to plan and track your work.': '瞭解如何使用 GitHub 議題規劃並追蹤工作。',
    'Save views for sprints, backlogs, teams, or releases. Rank, sort, and filter issues to suit the occasion. The possibilities are endless.':
      '為衝刺、待辦清單、團隊或發行版本儲存檢視。依情況為議題排名、排序並篩選。應用方式不勝枚舉。',
    'Learn more about GitHub Issues': '瞭解 GitHub 議題',
    // 标题：Learn X 作「認識 X」，与链接「瞭解 GitHub 套件」区分
    'Learn GitHub Packages': '認識 GitHub 套件',
    // 原文用逗号带出 including 短语，译文同样用逗号，不改成括号；hosting 取「代管」
    'GitHub Packages is a platform for hosting and managing packages, including containers and other dependencies. Get started with publishing or installing packages yourself.':
      'GitHub 套件是用於代管並管理套件的平台，包括容器和其他相依項目。立即開始自行發布或安裝套件。',
    'Learn more about GitHub Packages': '瞭解 GitHub 套件',

    // 代码结果（登录后）
    'Files with identical content are grouped together.': '內容相同的檔案已歸為一組。',
    'Hide these extra files instead': '改為隱藏這些重複檔案',
    'This file contains': '此檔案另有',
    'not shown.': '未顯示。',
    // See all + 数字 + matches in the full file 拆开时：「查看全部 15 個在完整檔案中的相符項目」
    'matches in the full file': '個在完整檔案中的相符項目',
    'match in the full file': '個在完整檔案中的相符項目',

    // 未登录代码搜索（原文没有逗号，改语序，不加逗号）
    'Sign in to search code on GitHub': '登入 GitHub 以搜尋程式碼',
    'Before you can access our code search functionality please sign in or create a free account.':
      '使用程式碼搜尋功能前請先登入或建立免費帳號。',
    'Before you can access our code search functionality please sign in or sign up.':
      '使用程式碼搜尋功能前請先登入或註冊。',

    // 头部搜索框输入无法识别的限定词时的提示
    'Possible unrecognized qualifier, searching for this term literally': '可能是無法辨識的限定詞，將依字面搜尋此字詞',
  },
  scoped: {
    ...pageOnly(SORT_OPTIONS),
    Tip: '提示',

    // 搜索首页：Tip For an advanced search, use our prefixes（片段只在本页成立；prefix 与 gist.ts 同作「前置詞」）
    'For an': '如需',
    'advanced search': '進階搜尋',
    ', use our': '，可使用',
    prefixes: '前置詞',

    // 侧栏与结果头部（侧栏的 Filter by type 由 copilot 的 static 全站收录；窄屏类型选择前的 Filter: 是名词标签，
    // 同 discussions、marketplace 作「篩選器：」）
    'Filter by': '篩選依據',
    'Filter:': '篩選器：',
    Advanced: '進階',
    State: '狀態',
    States: '狀態',
    Types: '類型',
    Container: '容器',
    Paths: '路徑',
    Size: '大小',
    Topic: '主題',
    'Date created': '建立日期',
    'Close reason': '關閉原因',
    Assignee: '負責人',
    Label: '標籤',
    Milestone: '里程碑',
    Commenter: '留言者',
    Committer: '提交者',
    Hash: '雜湊',
    Symbol: '符號',
    Location: '所在地',

    // 结果条目：Opened + 时间、posted + 时间、Last updated + 时间（Updated、committed 由 common 收录）；
    // 议题、拉取请求的 open 作「建立」，讨论的 posted 作「發表於」
    Opened: '建立於',
    posted: '發表於',
    'Last updated': '上次更新於',
    // 签名弹层（句末带句号的版本，其余由 commits 收录）
    'Learn about vigilant mode.': '瞭解警戒模式。',
    // 主题结果：angular, react, storybook and 1 more
    more: '個其他',
    match: '個相符項目',
    matches: '個相符項目',

    // Marketplace 结果：发布者（By + 链接）、类型标签（Application / GitHub Action）
    ...pageOnly(CATEGORIES),
    By: '來自',
    Application: '應用程式',
    // 产品名译中文（用户定）：单个 GitHub Action → GitHub 動作，同 marketplace 词典
    'GitHub Action': 'GitHub 動作',
    'Verified by GitHub': '已由 GitHub 驗證',
  },
  regexp: [
    // 结果页 sr-only 标题：repositories Search Results · vue（查询词原样保留）
    [
      new RegExp(`^(${Object.keys(RESULT_HEADINGS).join('|')}) Search Results · (.+)$`),
      (_, type, query) => `${RESULT_HEADINGS[type] ?? type} · ${query}`,
    ],
    // 登录后可见类型为空、没有前缀的版本：Search Results · vue is:public
    [/^Search Results · (.+)$/, '搜尋結果 · $1'],
    // 结果数（含 1.2B 这类缩写）
    [/^(\d[\d.,]*[kKMB]?) (results?|files?)$/, (_, count, kind) => countLabel(count, kind)],
    [/^More than (\d[\d.,]*[kKMB]?) (results?|files?)$/, (_, count, kind) => `超過 ${countLabel(count, kind)}`],
    // 耗时：React 把「 (」「210」「 」「ms」「)」拆成相邻文本节点，拼接后为 (210 ms)；数字与单位之间加空格：（210 毫秒）
    [/^\((\d+(?:\.\d+)?) ?(ms|s)\)$/, (_, amount, unit) => `（${amount} ${unit === 'ms' ? '毫秒' : '秒'}）`],
    // 排序按钮：「Sort by: 」「Best match」拼接
    [new RegExp(`^Sort by: (${SORT_SOURCE})$`), (_, option) => `排序依據：${SORT_OPTIONS[option] ?? option}`],
    // 浏览器语言为中文时 React 按本地格式输出日期，只剩英文前缀：on 1月23日、on 2017年4月7日；
    // 数字与年月日之间有无空格都匹配，日期按 helpers 的格式重写，与全站日期一致
    [
      /^on (?:(\d{4}) ?年 ?)?(\d{1,2}) ?月 ?(\d{1,2}) ?日$/,
      (_, year: string, month: string, day: string) =>
        formatDate(year ? Number(year) : undefined, Number(month), Number(day)),
    ],

    // 存储库结果
    [/^(\d[\d,]*) issues? needs? help$/, '$1 個議題需要協助'],
    [/^Sponsor (@[\w-]+|[\w.-]+\/[\w.-]+)$/, '贊助 $1'],
    // 提交结果
    [new RegExp(`^(${CHECK_PART}(?:(?:,? and |, )${CHECK_PART})*) checks?$`), (_, list) => checkSummary(list)],
    [/^Copy full commit hash ([\da-f]{7,40})$/, '複製完整提交雜湊 $1'],
    [
      new RegExp(`^(${Object.keys(SIGNATURE_STATES).join('|')}): ([\\da-f]{7,40})$`),
      (_, state, hash) => `${SIGNATURE_STATES[state] ?? state}：${hash}`,
    ],
    // 软件包结果
    [new RegExp(`^(${Object.keys(PACKAGE_TYPES).join('|')}) type$`), (_, type) => PACKAGE_TYPES[type] ?? type],
    // 代码结果
    [/^Show (\d[\d,]*) more match(?:es)?$/, '再顯示 $1 個相符項目'],
    [/^This file contains (\d[\d,]*) more match(?:es)? not shown\.$/, '此檔案另有 $1 個相符項目未顯示。'],
    [/^See all (\d[\d,]*) match(?:es)? in the full file$/, '查看完整檔案中的全部 $1 個相符項目'],
    // 搜索首页页脚：「GitHub, Inc. © 」「2026」拼接，品牌与年份保持原样（同 common 的全站页脚）
    [/^GitHub, Inc\. © (\d{4})$/, 'GitHub, Inc. © $1'],
  ],
  ignore: [
    // 结果中的用户内容：摘要与描述（Marketplace 应用描述不带 search-match）、主题名、提交与讨论作者名、用户所在地
    '[data-testid="results-list"] :is([class^="Content__"], [class*=" Content__"])',
    '[data-testid="results-list"] a[href^="/topics/"]',
    '[data-testid="results-list"] :is([class^="authorName__"], [class*=" authorName__"])',
    '[data-testid="results-list"] [class*="contentColumn__"] [class*="footerItem__"] > span:not([aria-label])',
    // 议题、拉取请求结果的作者名：头像后的纯文本
    '[data-testid="results-list"] li[class*="footerItem__"]:has(> img:only-child)',
    // Marketplace 结果的发布者名：By + 链接
    '[data-testid="results-list"] li[class*="footerItem__"] > a[data-inline="true"]',
    // 存储库结果的赞助对话框：可赞助帐户名、外部赞助链接
    '[id^="funding-links-modal-"] a.color-fg-default',
    '[id^="funding-links-modal-"] a[target="_blank"]',
    // 编程语言名：侧栏语言筛选项、结果中的语言
    'a[href*="language%3A"]',
    LANGUAGE_NAME,
    // 头部搜索框按钮显示的当前查询（占位文字带 kbd，不忽略）；高亮层与尺寸层由全局忽略规则处理
    '#qb-input-query:not(:has(kbd))',
    // 搜索建议中的限定符取值（state:open 的 open 等，及存储库名、用户名）
    '[data-type="filter-item"] .ActionListItem-label',
  ],
  attributeRules: [
    // 结果中语言名的无障碍名称：Vue language → Vue 語言（语言名原样）
    [LANGUAGE_NAME, 'aria-label', /^(.+) language$/, '$1 語言'],
  ],
} satisfies PageDictionary
