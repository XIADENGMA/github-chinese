import type { PageDictionary } from '../../../core/types'

const REPO = '[\\w.-]+\\/[\\w.-]+'

/** 严重性小写值 → 译文（标题属性、筛选提示里出现）；等级词同术语表，CodeQL 的 note 与 alerts.ts 同作「附註」 */
const SEVERITY: Readonly<Record<string, string>> = {
  critical: '重大',
  high: '高',
  moderate: '中',
  medium: '中',
  low: '低',
  unknown: '未知',
  error: '錯誤',
  warning: '警告',
  note: '附註'
}

/** 「X severity」标签：等级词后接「嚴重性」（高嚴重性） */
const SEVERITY_LEVEL: Readonly<Record<string, string>> = {
  critical: '重大嚴重性',
  high: '高嚴重性',
  moderate: '中嚴重性',
  medium: '中嚴重性',
  low: '低嚴重性',
  unknown: '未知嚴重性'
}

const SEVERITY_SOURCE = Object.keys(SEVERITY).join('|')

/**
 * 储存库「安全性和品质」分页框架：侧边栏、总览页、安全性政策、严重性与状态词。
 * 术语：security（功能）→ 安全性，policy → 政策，advisory → 公告，alert → 警示，report（漏洞）→ 回報，
 * dismiss（警示）→ 解除，finding → 發現項目（与 alerts.ts 一致）。
 */
export default {
  static: {
    // 侧边栏
    Policy: '政策',
    Advisories: '公告',
    'Vulnerability alerts': '漏洞警示',
    'Security Policy': '安全性政策',
    'Security Advisories': '安全性公告',
    'Security advisories': '安全性公告',
    'Security advisory': '安全性公告',

    // 总览页（未登录 / 无权限）
    'Report a vulnerability': '回報漏洞',
    'Published advisory': '已發布的公告',
    'Draft advisory': '草稿公告',
    'Closed advisory': '已關閉的公告',
    // 瞭解 <储存库> 的相關公告請參閱 <GitHub 公告資料庫>
    'Learn more about advisories related to': '瞭解',
    'No security policy detected': '未偵測到安全性政策',
    'This project has not set up a SECURITY.md file yet.': '此專案尚未設定 SECURITY.md 檔案。',
    "This project hasn't set up a SECURITY.md file yet.": '此專案尚未設定 SECURITY.md 檔案。',
    'This project hasn’t set up a SECURITY.md file yet.': '此專案尚未設定 SECURITY.md 檔案。',
    // SECURITY.md 在 <code> 里：This project has not set up a <code>SECURITY.md</code> file yet.
    'This project has not set up a': '此專案尚未設定',

    // 总览页（管理员）：各项功能状态卡片，标题后跟「•」与状态标签
    'Security policy •': '安全性政策 •',
    'Security advisories •': '安全性公告 •',
    'Private vulnerability reporting •': '私下回報漏洞 •',
    'Dependabot alerts •': 'Dependabot 警示 •',
    'Code scanning alerts •': '程式碼掃描警示 •',
    'Secret scanning alerts •': '機密掃描警示 •',
    'Needs setup': '待設定',
    'Define how users should report security vulnerabilities for this repository': '定義使用者應如何回報此儲存庫的安全性漏洞',
    'Define how users should report security vulnerabilities for this repository.': '定義使用者應如何回報此儲存庫的安全性漏洞。',
    'Suggest how users should report security vulnerabilities for this repository': '建議使用者應如何回報此儲存庫的安全性漏洞',
    'View how to securely report security vulnerabilities for this repository': '查看如何安全地回報此儲存庫的安全性漏洞',
    'Set up a security policy': '設定安全性政策',
    'View security policy': '查看安全性政策',
    'Edit security policy': '編輯安全性政策',
    'Suggest a policy': '建議政策',
    'View or disclose security advisories for this repository': '查看或揭露此儲存庫的安全性公告',
    'View or disclose security advisories for this repository.': '查看或揭露此儲存庫的安全性公告。',
    'View security advisories for this repository': '查看此儲存庫的安全性公告',
    'View security advisories': '查看安全性公告',
    'Private vulnerability reporting': '私下回報漏洞',
    'Allow users to privately report potential security vulnerabilities': '允許使用者私下回報潛在的安全性漏洞',
    'Allow users to privately report potential security vulnerabilities.': '允許使用者私下回報潛在的安全性漏洞。',
    'Enable vulnerability reporting': '啟用漏洞回報',
    'See reported vulnerabilities': '查看已回報的漏洞',
    'View reported vulnerabilities': '查看已回報的漏洞',
    'Get notified when one of your dependencies has a vulnerability': '你的相依項目有漏洞時接收通知',
    'Get notified when one of your dependencies has a vulnerability.': '你的相依項目有漏洞時接收通知。',
    'Enable Dependabot alerts': '啟用 Dependabot 警示',
    "You don't have permission to enable this feature": '你沒有啟用此功能的權限',
    'You don’t have permission to enable this feature': '你沒有啟用此功能的權限',
    'Automatically detect common vulnerability and coding errors': '自動偵測常見漏洞和程式碼錯誤',
    'Automatically detect common vulnerabilities and coding errors': '自動偵測常見漏洞和程式碼錯誤',
    'Automatically detect common vulnerabilities and coding errors.': '自動偵測常見漏洞和程式碼錯誤。',
    'Set up code scanning': '設定程式碼掃描',
    'Advanced Security is only available for Organizations': '進階安全性僅適用於組織',
    'Code scanning for private repositories is part of GitHub Advanced Security': '私人儲存庫的程式碼掃描屬於 GitHub 進階安全性',
    'Code scanning configuration error': '程式碼掃描設定錯誤',
    // CodeQL is reporting errors. Check the <status page> for help.
    'CodeQL is reporting errors. Check the': 'CodeQL 回報了錯誤。查看',
    'Checking code scanning status...': '正在檢查程式碼掃描狀態...',
    'Checking code scanning status…': '正在檢查程式碼掃描狀態…',
    'Code scanning is not enabled': '未啟用程式碼掃描',
    'Code scanning helps you find and fix vulnerabilities and coding errors.': '程式碼掃描可協助你找出並修正漏洞和程式碼錯誤。',
    'Get notified when a secret is pushed to this repository': '有機密推送到此儲存庫時接收通知',
    'Get notified when a secret is pushed to this repository.': '有機密推送到此儲存庫時接收通知。',
    'View detected secrets': '查看偵測到的機密',
    'Enable in settings': '在設定中啟用',
    'Enable code scanning': '啟用程式碼掃描',

    // 安全性政策页
    'Start setup': '開始設定',
    'Help your community understand how to securely report security vulnerabilities for your project.':
      '協助社群瞭解如何安全地回報專案的安全性漏洞。',
    'Suggest a security policy': '建議安全性政策',
    'Security policies are configured by the repository owner.': '安全性政策由儲存庫擁有者設定。',

    // 严重性与状态
    Severity: '嚴重性',
    Critical: '重大',
    High: '高',
    Moderate: '中',
    Medium: '中',
    Low: '低',
    'All severities': '所有嚴重性',
    'Filter by severity': '依嚴重性篩選',
    Fixed: '已修正',
    Dismissed: '已解除',
    'Auto-dismissed': '已自動解除',
    Withdrawn: '已撤回'
  },
  scoped: {
    // 其他区域也出现的同形文字，本区域内单独生效
    'Security overview': '安全性總覽',
    // 侧栏分组：Reporting › Policy / Advisories（漏洞回报）
    Reporting: '回報',
    // 侧栏分组：Findings › Dependabot › Malware / Vulnerabilities
    Findings: '發現項目',
    Vulnerabilities: '漏洞',
    'Code scanning': '程式碼掃描',
    'Secret scanning': '機密掃描',
    'Code quality': '程式碼品質',
    'View Dependabot alerts': '查看 Dependabot 警示',
    'Configure code scanning': '設定程式碼掃描',
    'View alerts': '查看警示',
    'Enable secret scanning': '啟用機密掃描',
    'Find out more': '瞭解詳情',
    'Contact sales': '聯絡銷售人員',
    'status page': '狀態頁面',
    'for help.': '以取得協助。',
    'file yet.': '檔案。',
    Triage: '待分類',
    // 与其他区域同形但本区域语境不同的短词
    'Security policy': '安全性政策',
    'Dependabot alerts': 'Dependabot 警示',
    // 公告条目：published / closed <时间> by <用户>；GitHub Advisory Database 详情：Published <时间> in <储存库>
    // published 的整句见 advisories.ts 的 inline，这里是整句未命中时的片段
    Published: '發布於',
    published: '發布於',
    closed: '關閉於',
    by: '由',
    'in the': '的相關公告請參閱',
    in: '位於',
    Unknown: '未知',
    ...SEVERITY
  },
  regexp: [
    // 页面 h1（屏幕阅读器）：Security: owner/repo
    [new RegExp(`^Security: (${REPO})$`), '安全性：$1'],
    // 分页标题片段：Dependabot alerts · owner/repo (filters applied)
    [new RegExp(`^(${REPO}) \\(filters applied\\)$`), '$1（已套用篩選器）'],
    // 严重性标签的 title 属性
    [new RegExp(`^Severity: (${SEVERITY_SOURCE})$`, 'i'), (_, level) => `嚴重性：${SEVERITY[level.toLowerCase()]}`],
    // 详情页的「Moderate severity」标签
    [/^(Critical|High|Moderate|Medium|Low|Unknown) severity$/, (_, level) => SEVERITY_LEVEL[level.toLowerCase()] ?? level],
    // 组织安全性总览表格：分页组件写入的全选文字（Select all 12 repositories）
    [/^Select all (\d[\d,]*) repositories$/, '選取全部 $1 個儲存庫']
  ],
  ignore: [
    // 公告 / 警示列表的标题链接（公告摘要属于用户内容）
    'a.Link--primary.v-align-middle.no-underline.h4',
    // 储存库安全性公告详情页标题
    '.js-repository-advisory-details h1.gh-header-title',
    // 警示详情页（React）标题
    'h1.text-wrap-balance > span:first-child'
  ]
} satisfies PageDictionary
