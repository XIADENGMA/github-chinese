import type { PageDictionary } from '../../../core/types'

const REPO = '[\\w.-]+\\/[\\w.-]+'

/** 严重性小写值 → 译文（标题属性、筛选提示里出现） */
const SEVERITY: Readonly<Record<string, string>> = {
  critical: '严重',
  high: '高',
  moderate: '中',
  medium: '中',
  low: '低',
  unknown: '未知',
  error: '错误',
  warning: '警告',
  note: '注意'
}

/** 「X severity」标签：用行业惯用的危害等级 */
const SEVERITY_LEVEL: Readonly<Record<string, string>> = {
  critical: '严重',
  high: '高危',
  moderate: '中危',
  medium: '中危',
  low: '低危',
  unknown: '未知严重性'
}

const SEVERITY_SOURCE = Object.keys(SEVERITY).join('|')

/**
 * 存储库「安全和质量」标签页框架：侧边栏、概述页、安全策略、严重性与状态词。
 */
export default {
  static: {
    // 侧边栏
    Policy: '策略',
    Advisories: '公告',
    'Vulnerability alerts': '漏洞警报',
    'Security Policy': '安全策略',
    'Security Advisories': '安全公告',
    'Security advisories': '安全公告',
    'Security advisory': '安全公告',

    // 概述页（未登录 / 无权限）
    'Report a vulnerability': '报告漏洞',
    'Published advisory': '已发布的公告',
    'Draft advisory': '公告草稿',
    'Closed advisory': '已关闭的公告',
    // 了解 <存储库> 的相关公告请访问 <GitHub Advisory Database>
    'Learn more about advisories related to': '了解',
    'No security policy detected': '未检测到安全策略',
    'This project has not set up a SECURITY.md file yet.': '此项目尚未设置 SECURITY.md 文件。',
    "This project hasn't set up a SECURITY.md file yet.": '此项目尚未设置 SECURITY.md 文件。',
    'This project hasn’t set up a SECURITY.md file yet.': '此项目尚未设置 SECURITY.md 文件。',
    // SECURITY.md 在 <code> 里：This project has not set up a <code>SECURITY.md</code> file yet.
    'This project has not set up a': '此项目尚未设置',

    // 概述页（管理员）：各项功能状态卡片，标题后跟「•」与状态标签
    'Security policy •': '安全策略 •',
    'Security advisories •': '安全公告 •',
    'Private vulnerability reporting •': '专用漏洞报告 •',
    'Dependabot alerts •': 'Dependabot 警报 •',
    'Code scanning alerts •': '代码扫描警报 •',
    'Secret scanning alerts •': '机密扫描警报 •',
    'Needs setup': '待设置',
    'Define how users should report security vulnerabilities for this repository': '定义用户应如何报告此存储库的安全漏洞',
    'Define how users should report security vulnerabilities for this repository.': '定义用户应如何报告此存储库的安全漏洞。',
    'Suggest how users should report security vulnerabilities for this repository': '建议用户应如何报告此存储库的安全漏洞',
    'View how to securely report security vulnerabilities for this repository': '查看如何安全地报告此存储库的安全漏洞',
    'Set up a security policy': '设置安全策略',
    'View security policy': '查看安全策略',
    'Edit security policy': '编辑安全策略',
    'Suggest a policy': '建议策略',
    'View or disclose security advisories for this repository': '查看或披露此存储库的安全公告',
    'View or disclose security advisories for this repository.': '查看或披露此存储库的安全公告。',
    'View security advisories for this repository': '查看此存储库的安全公告',
    'View security advisories': '查看安全公告',
    'Private vulnerability reporting': '专用漏洞报告',
    'Allow users to privately report potential security vulnerabilities': '允许用户私下报告潜在的安全漏洞',
    'Allow users to privately report potential security vulnerabilities.': '允许用户私下报告潜在的安全漏洞。',
    'Enable vulnerability reporting': '启用漏洞报告',
    'See reported vulnerabilities': '查看已报告的漏洞',
    'View reported vulnerabilities': '查看已报告的漏洞',
    'Get notified when one of your dependencies has a vulnerability': '依赖项存在漏洞时接收通知',
    'Get notified when one of your dependencies has a vulnerability.': '依赖项存在漏洞时接收通知。',
    'Enable Dependabot alerts': '启用 Dependabot 警报',
    "You don't have permission to enable this feature": '你无权启用此功能',
    'You don’t have permission to enable this feature': '你无权启用此功能',
    'Automatically detect common vulnerability and coding errors': '自动检测常见漏洞和编码错误',
    'Automatically detect common vulnerabilities and coding errors': '自动检测常见漏洞和编码错误',
    'Automatically detect common vulnerabilities and coding errors.': '自动检测常见漏洞和编码错误。',
    'Set up code scanning': '设置代码扫描',
    'Advanced Security is only available for Organizations': '高级安全仅适用于组织',
    'Code scanning for private repositories is part of GitHub Advanced Security': '专用存储库的代码扫描属于 GitHub 高级安全',
    'Code scanning configuration error': '代码扫描配置错误',
    // CodeQL is reporting errors. Check the <status page> for help.
    'CodeQL is reporting errors. Check the': 'CodeQL 报告了错误。查看',
    'Checking code scanning status...': '正在检查代码扫描状态...',
    'Checking code scanning status…': '正在检查代码扫描状态…',
    'Code scanning is not enabled': '代码扫描未启用',
    'Code scanning helps you find and fix vulnerabilities and coding errors.': '代码扫描可帮助你发现并修复漏洞和编码错误。',
    'Get notified when a secret is pushed to this repository': '有机密推送到此存储库时接收通知',
    'Get notified when a secret is pushed to this repository.': '有机密推送到此存储库时接收通知。',
    'View detected secrets': '查看检测到的机密',
    'Enable in settings': '在设置中启用',
    'Enable code scanning': '启用代码扫描',

    // 安全策略页
    'Start setup': '开始设置',
    'Help your community understand how to securely report security vulnerabilities for your project.':
      '帮助社区了解如何安全地报告此项目的安全漏洞。',
    'Suggest a security policy': '建议安全策略',
    'Security policies are configured by the repository owner.': '安全策略由存储库所有者配置。',

    // 严重性与状态
    Severity: '严重性',
    Critical: '严重',
    High: '高',
    Moderate: '中',
    Medium: '中',
    Low: '低',
    'All severities': '所有严重性',
    'Filter by severity': '按严重性筛选',
    Fixed: '已修复',
    Dismissed: '已消除',
    'Auto-dismissed': '已自动消除',
    Withdrawn: '已撤回'
  },
  scoped: {
    // 其他区域也出现的同形文字，本区域内单独生效
    'Security overview': '安全概述',
    Reporting: '报告',
    // 侧栏分组：Findings › Dependabot › Malware / Vulnerabilities
    Findings: '发现',
    Vulnerabilities: '漏洞',
    'Code scanning': '代码扫描',
    'Secret scanning': '机密扫描',
    'Code quality': '代码质量',
    'View Dependabot alerts': '查看 Dependabot 警报',
    'Configure code scanning': '配置代码扫描',
    'View alerts': '查看警报',
    'Enable secret scanning': '启用机密扫描',
    'Find out more': '了解详情',
    'Contact sales': '联系销售',
    'status page': '状态页',
    'for help.': '以获取帮助。',
    'file yet.': '文件。',
    Triage: '待分类',
    // 与其他区域同形但本区域语境不同的短词
    'Security policy': '安全策略',
    'Dependabot alerts': 'Dependabot 警报',
    // 公告条目：published / closed <时间> by <用户>；GitHub Advisory Database 详情：Published <时间> in <存储库>
    // published 的整句见 advisories.ts 的 inline，这里是整句未命中时的片段
    Published: '发布于',
    published: '发布于',
    closed: '关闭于',
    by: '由',
    'in the': '的相关公告请访问',
    in: '位于',
    Unknown: '未知',
    ...SEVERITY
  },
  regexp: [
    // 页面 h1（屏幕阅读器）：Security: owner/repo
    [new RegExp(`^Security: (${REPO})$`), '安全：$1'],
    // 标签页标题片段：Dependabot alerts · owner/repo (filters applied)
    [new RegExp(`^(${REPO}) \\(filters applied\\)$`), '$1（已应用筛选器）'],
    // 严重性标签的 title 属性
    [new RegExp(`^Severity: (${SEVERITY_SOURCE})$`, 'i'), (_, level) => `严重性：${SEVERITY[level.toLowerCase()]}`],
    // 详情页的「Moderate severity」标签
    [/^(Critical|High|Moderate|Medium|Low|Unknown) severity$/, (_, level) => SEVERITY_LEVEL[level.toLowerCase()] ?? level],
    // 组织安全概述表格：分页组件写入的全选文字（Select all 12 repositories）
    [/^Select all (\d[\d,]*) repositories$/, '选择全部 $1 个存储库']
  ],
  ignore: [
    // 公告 / 警报列表的标题链接（公告摘要属于用户内容）
    'a.Link--primary.v-align-middle.no-underline.h4',
    // 存储库安全公告详情页标题
    '.js-repository-advisory-details h1.gh-header-title',
    // 警报详情页（React）标题
    'h1.text-wrap-balance > span:first-child'
  ]
} satisfies PageDictionary
