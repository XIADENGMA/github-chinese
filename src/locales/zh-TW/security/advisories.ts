import type { PageDictionary } from '../../../core/types'
import { DATE_SOURCE, joinCjk, translateTime } from '../helpers'

/** 状态切换的计数：状态作定语，量词随「公告」作「則」（3 則已發布，同 N 則公告） */
const ADVISORY_STATE: Readonly<Record<string, string>> = {
  Draft: '草稿',
  Triage: '待分類',
  Published: '已發布',
  Closed: '已關閉'
}

const LIST_STATE: Readonly<Record<string, string>> = {
  published: '已發布的安全性公告',
  draft: '安全性公告草稿',
  closed: '已關閉的安全性公告',
  triage: '待分類的安全性公告'
}

/** 严重性：Critical 作「重大」 */
const SEVERITY_FILTER: Readonly<Record<string, string>> = {
  'All severities': '所有嚴重性',
  Low: '低',
  Moderate: '中',
  High: '高',
  Critical: '重大'
}

const SORT: Readonly<Record<string, string>> = {
  Newest: '最新',
  Oldest: '最舊',
  'Recently updated': '最近更新',
  'Least recently updated': '最久未更新'
}

/** 「octocat, monalisa, and hubot」→「octocat、monalisa 和 hubot」 */
function joinNames(names: string): string {
  return names
    .replace(/,? and /, ' 和 ')
    .split(', ')
    .join('、')
}

/**
 * 安全公告：存储库安全公告列表 / 详情 / 表单、私下回報漏洞、
 * 全局 GitHub 公告資料庫（/advisories）。
 * 公告计数的量词作「則」（一則公告）；漏洞的 report 作「回報」；credit 作「致謝」。
 */
export default {
  static: {
    // 存储库安全公告列表
    'View known security vulnerabilities and report new vulnerabilities privately to maintainers.':
      '查看已知的安全性漏洞並私下向維護者回報新漏洞。',
    "View information about security vulnerabilities from this repository's maintainers.": '查看此儲存庫維護者發布的安全性漏洞資訊。',
    'View information about security vulnerabilities from this repository’s maintainers.': '查看此儲存庫維護者發布的安全性漏洞資訊。',
    "Privately discuss, fix, and publish information about security vulnerabilities in your repository's code.":
      '私下討論、修正並發布儲存庫程式碼中安全性漏洞的資訊。',
    'Privately discuss, fix, and publish information about security vulnerabilities in your repository’s code.':
      '私下討論、修正並發布儲存庫程式碼中安全性漏洞的資訊。',
    'Filter advisories: severity:critical, ecosystem:npm': '篩選公告：severity:critical, ecosystem:npm',
    'Filter advisories: severity:critical, ecosystem:npm, sort:newest': '篩選公告：severity:critical, ecosystem:npm, sort:newest',
    'Available filters': '可用的篩選器',
    'Clear current search query, filters, and sorts': '清除目前的搜尋查詢、篩選器和排序',
    'Narrow your search': '縮小搜尋範圍',
    'New draft security advisory': '新增安全性公告草稿',

    // 存储库安全公告详情（维护者）
    'Draft Advisory': '公告草稿',
    'Edit advisory': '編輯公告',
    'Edit advisory credits': '編輯公告致謝',
    'Publish advisory': '發布公告',
    'Request CVE': '申請 CVE',
    'Request CVE ID': '申請 CVE ID',
    'Close security advisory': '關閉安全性公告',
    'Reopen security advisory': '重新開啟安全性公告',
    'Accept and open as draft': '接受並建立草稿',
    'Start a temporary private fork': '建立臨時私人分叉',
    'Temporary private fork': '臨時私人分叉',
    'Collaborate on a patch in private': '私下協作修補程式',
    'Open a draft security advisory': '建立安全性公告草稿',
    'Create draft security advisory': '建立安全性公告草稿',
    'Update security advisory': '更新安全性公告',
    'Submit report': '送出回報',
    'Private vulnerability report': '私下漏洞回報',
    'Privately report a security vulnerability': '私下回報安全性漏洞',
    'Advisory details': '公告詳細資料',
    'Advisory Credits': '公告致謝',
    'No known CVE': '無已知 CVE',
    'No CVE': '無 CVE',
    Reporter: '回報者',
    Analyst: '分析者',
    Finder: '發現者',
    Coordinator: '協調者',
    'Remediation developer': '修復開發人員',
    'Remediation reviewer': '修復審查者',
    'Remediation verifier': '修復驗證者',
    'Package name': '套件名稱',

    // 公告表单
    'CVE identifier': 'CVE 識別碼',
    'Request CVE ID later': '稍後申請 CVE ID',
    'I have an existing CVE ID': '我已有 CVE ID',
    'Affected products': '受影響的產品',
    'Select an ecosystem': '選擇生態系',
    'Add another affected product': '新增其他受影響的產品',
    'Please fill out the details': '請填寫詳細資料',
    // CWE 的通行译名「常見弱點列舉」
    'Common weakness enumerator (CWE)': '常見弱點列舉 (CWE)',
    'Search by CWE': '依 CWE 搜尋',

    // 公告字段
    Package: '套件',
    'Affected versions': '受影響的版本',
    'Patched versions': '已修補的版本',
    'Patched version': '已修補的版本',
    References: '參考資料',
    'No package listed': '未列出套件',
    'No known source code': '無已知原始碼',
    'External ID': '外部 ID',
    'No External ID': '無外部 ID',
    'Malware type': '惡意軟體類型',

    // GitHub 公告資料庫：列表
    'GitHub Advisory Database': 'GitHub 公告資料庫',
    'Filter advisories': '篩選公告',
    'GitHub reviewed advisories': 'GitHub 已審查的公告',
    'All reviewed': '所有已審查',
    'Unreviewed advisories': '未審查的公告',
    'All unreviewed': '所有未審查',
    'Malware advisories': '惡意軟體公告',
    'All malware': '所有惡意軟體',
    'CC-BY-4.0 License': 'CC-BY-4.0 授權條款',
    'Language support': '語言支援',
    'About GitHub Advisory Database': '關於 GitHub 公告資料庫',
    'Search by CVE/GHSA ID, package, severity, ecosystem, credit…': '依 CVE/GHSA ID、套件、嚴重性、生態系、致謝搜尋…',
    'Search by CVE/GHSA ID, package, severity, ecosystem, credit...': '依 CVE/GHSA ID、套件、嚴重性、生態系、致謝搜尋...',
    'Filter by CWE': '依 CWE 篩選',
    // 公告条目：<CVE> was published for <软件包> (<生态系统>) <时间>；整句见 inline，这里是整句未命中时的片段
    'was published for': '已發布 影響',
    'was published': '發布於',
    // Advisories are also available from the <GraphQL API>
    'Advisories are also available from the': '公告也可從以下來源取得',

    // GitHub 公告資料庫：详情
    'GitHub Reviewed': 'GitHub 已審查',
    Unreviewed: '未審查',
    Malware: '惡意軟體',
    '• Updated': '• 更新於',
    'Vulnerability details': '漏洞詳細資料',
    // Published by the <National Vulnerability Database> <时间>；整句见 inline，这里是整句未命中时的片段
    'Published by the': '發布者',
    'National Vulnerability Database': '美國國家漏洞資料庫',
    'Published to the GitHub Advisory Database': '發布到 GitHub 公告資料庫',
    'Checking history': '正在檢查歷史記錄',
    'See something to contribute?': '有內容要補充？',
    'Suggest improvements for this vulnerability': '為此漏洞提出改進建議',
    'Suggest improvements for this advisory on the GitHub Advisory Database.': '在 GitHub 公告資料庫中為此公告提出改進建議。',
    'See advisory in GitHub Advisory Database': '在 GitHub 公告資料庫中查看公告',
    'See all of your affected repositories': '查看你所有受影響的儲存庫',
    'Advisory links': '公告連結',
    'Improve this advisory': '改進此公告'
  },
  scoped: {
    // 其他区域也出现的同形文字，本区域内单独生效
    // 公告致谢（计费页的 Credits 是点数，见 settings-account/billing）
    Credits: '致謝',
    'Security vulnerability database inclusive of CVEs and GitHub originated security advisories from the world of open source software.':
      '收錄開源軟體領域 CVE 和 GitHub 發起之安全性公告的安全性漏洞資料庫。',
    'Last updated': '上次更新',
    Advisory: '公告',
    Reviewed: '審查於',
    'Source code': '原始碼',
    // 时间线：<用户> published to <存储库> <时间>；整句见 inline，这里是整句未命中时的片段
    'published to': '發布到',
    advisories: '則公告',
    advisory: '則公告',
    Collaborators: '協作者',
    Other: '其他',
    'An unexpected error occurred. Please try again.': '發生未預期的錯誤。請再試一次。',
    // 生态系统筛选项、公告表单的生态系统选项（与 npm、pip 等并列）；产品名按用户规定译出
    'GitHub Actions': 'GitHub 動作'
  },
  regexp: [
    // 公告列表状态切换：3 Published
    [/^([\d,]+) (Draft|Triage|Published|Closed)$/, (_, count, state) => `${count} 則${ADVISORY_STATE[state]}`],
    [
      /^There aren['’]t any (published|draft|closed|triage) security advisories(\.?)$/,
      (_, state, period) => `沒有${LIST_STATE[state]}${period ? '。' : ''}`
    ],
    // 原文是两句，没有逗号，译文不加
    [/^Exact package name not found on (.+)\. You can still submit this report\.$/, '在 $1 上找不到完全相符的套件名稱。仍可送出此回報。'],
    // GitHub 公告資料庫列表
    [/^([\d,]+) advisor(?:y|ies)$/, '$1 則公告'],
    [/^Filter by severity - (All severities|Low|Moderate|High|Critical)$/, (_, level) => `依嚴重性篩選 - ${SEVERITY_FILTER[level]}`],
    [/^Sort by - (Newest|Oldest|Recently updated|Least recently updated)$/, (_, sort) => `排序依據 - ${SORT[sort]}`],
    [/^Credited to ([\w-]+(?:, [\w-]+)*,? and [\w-]+|[\w-]+)$/, (_, names) => `致謝 ${joinNames(names)}`],
    // 撤回说明：前缀与日期用 joinCjk 拼接，日期后接中文不加空格
    [
      new RegExp(`^This advisory was withdrawn on (${DATE_SOURCE})(\\.?)$`),
      (_, date, period) => `${joinCjk('此公告已於', translateTime(date))}撤回${period ? '。' : ''}`
    ]
  ],
  ignore: [
    // GitHub Advisory Database 详情页标题（公告摘要）
    'h2.lh-condensed.Subhead-heading',
    // GitHub Advisory Database 列表：<CVE> was published for <软件包> (<生态系统>) 中的软件包名
    'div.mt-1.text-small.color-fg-muted span.text-bold ~ span'
  ],
  // 被元素拆开的公告条目整句；槽位顺序不变，未命中时按片段翻译（published、by、was published for、published to）
  inline: [
    // 存储库安全公告详情页头：<a>用户</a> published <span>GHSA-…</span> <relative-time>
    ['{} published {} {}', '{} 發布了 {} 於 {}'],
    // 存储库安全公告列表、安全概述页：GHSA-… <span class="opened-by">published <relative-time> by <a>用户</a></span>
    ['published {} by {}', '於 {}由 {} 發布'],
    // GitHub 公告資料庫列表：<span>CVE-…</span> was published for <span>软件包</span> (pip) <relative-time>
    [/^\{\} was published for \{\} \(([^()]+)\) \{\}$/, '{} 針對 {} ($1) 發布於 {}'],
    // GitHub 公告資料庫详情时间线：Published by the <a>National Vulnerability Database</a> <relative-time>
    // 链接文字译成中文（美國國家漏洞資料庫），槽位两侧不留空格
    ['Published by the {} {}', '由{}發布於 {}'],
    // GitHub 公告資料庫详情时间线：<a>头像</a> <a>用户</a> published to <a>存储库</a> <relative-time>
    ['{} {} published to {} {}', '{} {} 發布到 {} 於 {}'],
    // GitHub 公告資料庫详情时间线：Published to the GitHub Advisory Database <relative-time>
    ['Published to the GitHub Advisory Database {}', '於 {}發布到 GitHub 公告資料庫']
  ]
} satisfies PageDictionary
