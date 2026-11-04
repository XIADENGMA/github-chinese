import type { PageDictionary } from '../../../core/types'
import { DATE_SOURCE, joinCjk, translateTime } from '../helpers'

/** 状态切换的计数：状态作定语（3 个已发布的） */
const ADVISORY_STATE: Readonly<Record<string, string>> = {
  Draft: '草稿',
  Triage: '待分类的',
  Published: '已发布的',
  Closed: '已关闭的',
}

const LIST_STATE: Readonly<Record<string, string>> = {
  published: '已发布的安全公告',
  draft: '安全公告草稿',
  closed: '已关闭的安全公告',
  triage: '待分类的安全公告',
}

const SEVERITY_FILTER: Readonly<Record<string, string>> = {
  'All severities': '所有严重性',
  Low: '低',
  Moderate: '中',
  High: '高',
  Critical: '严重',
}

const SORT: Readonly<Record<string, string>> = {
  Newest: '最新',
  Oldest: '最早',
  'Recently updated': '最近更新',
  'Least recently updated': '最久未更新',
}

/** 「octocat, monalisa, and hubot」→「octocat、monalisa 和 hubot」 */
function joinNames(names: string): string {
  return names
    .replace(/,? and /, ' 和 ')
    .split(', ')
    .join('、')
}

/**
 * 安全公告：存储库安全公告列表 / 详情 / 表单、专用漏洞报告、
 * 全局 GitHub Advisory Database（/advisories）。
 */
export default {
  static: {
    // 存储库安全公告列表
    'View known security vulnerabilities and report new vulnerabilities privately to maintainers.':
      '查看已知安全漏洞并向维护者私下报告新漏洞。',
    "View information about security vulnerabilities from this repository's maintainers.":
      '查看此存储库维护者发布的安全漏洞信息。',
    'View information about security vulnerabilities from this repository’s maintainers.':
      '查看此存储库维护者发布的安全漏洞信息。',
    "Privately discuss, fix, and publish information about security vulnerabilities in your repository's code.":
      '私下讨论、修复并发布存储库代码中安全漏洞的信息。',
    'Privately discuss, fix, and publish information about security vulnerabilities in your repository’s code.':
      '私下讨论、修复并发布存储库代码中安全漏洞的信息。',
    'Filter advisories: severity:critical, ecosystem:npm': '筛选公告：severity:critical, ecosystem:npm',
    'Filter advisories: severity:critical, ecosystem:npm, sort:newest':
      '筛选公告：severity:critical, ecosystem:npm, sort:newest',
    'Available filters': '可用筛选器',
    'Clear current search query, filters, and sorts': '清除当前搜索、筛选器和排序',
    'Narrow your search': '缩小搜索范围',
    'New draft security advisory': '新建安全公告草稿',

    // 存储库安全公告详情（维护者）
    'Draft Advisory': '公告草稿',
    'Edit advisory': '编辑公告',
    'Edit advisory credits': '编辑公告致谢',
    'Publish advisory': '发布公告',
    'Request CVE': '申请 CVE',
    'Request CVE ID': '申请 CVE ID',
    'Close security advisory': '关闭安全公告',
    'Reopen security advisory': '重新打开安全公告',
    'Accept and open as draft': '接受并作为草稿打开',
    'Start a temporary private fork': '创建临时专用复刻',
    'Temporary private fork': '临时专用复刻',
    'Collaborate on a patch in private': '私下协作修复',
    'Open a draft security advisory': '创建安全公告草稿',
    'Create draft security advisory': '创建安全公告草稿',
    'Update security advisory': '更新安全公告',
    'Submit report': '提交报告',
    'Private vulnerability report': '专用漏洞报告',
    'Privately report a security vulnerability': '私下报告安全漏洞',
    'Advisory details': '公告详细信息',
    'Advisory Credits': '公告致谢',
    'No known CVE': '无已知 CVE',
    'No CVE': '无 CVE',
    Reporter: '报告者',
    Analyst: '分析者',
    Finder: '发现者',
    Coordinator: '协调者',
    'Remediation developer': '修复开发人员',
    'Remediation reviewer': '修复审查者',
    'Remediation verifier': '修复验证者',
    'Package name': '软件包名称',

    // 公告表单
    'CVE identifier': 'CVE 标识符',
    'Request CVE ID later': '稍后申请 CVE ID',
    'I have an existing CVE ID': '我已有 CVE ID',
    'Affected products': '受影响的产品',
    'Select an ecosystem': '选择生态系统',
    'Add another affected product': '添加其他受影响的产品',
    'Please fill out the details': '请填写详细信息',
    'Common weakness enumerator (CWE)': '通用弱点枚举 (CWE)',
    'Search by CWE': '按 CWE 搜索',

    // 公告字段
    Package: '软件包',
    'Affected versions': '受影响的版本',
    'Patched versions': '已修补的版本',
    'Patched version': '已修补的版本',
    References: '参考资料',
    'No package listed': '未列出软件包',
    'No known source code': '无已知源代码',
    'External ID': '外部 ID',
    'No External ID': '无外部 ID',
    'Malware type': '恶意软件类型',

    // GitHub Advisory Database：列表
    'GitHub Advisory Database': 'GitHub 公告数据库',
    'Filter advisories': '筛选公告',
    'GitHub reviewed advisories': 'GitHub 已审查公告',
    'All reviewed': '全部已审查',
    'Unreviewed advisories': '未审查公告',
    'All unreviewed': '全部未审查',
    'Malware advisories': '恶意软件公告',
    'All malware': '全部恶意软件',
    'CC-BY-4.0 License': 'CC-BY-4.0 许可证',
    'Language support': '语言支持',
    'About GitHub Advisory Database': '关于 GitHub 公告数据库',
    'Search by CVE/GHSA ID, package, severity, ecosystem, credit…':
      '按 CVE/GHSA ID、软件包、严重性、生态系统、致谢搜索…',
    'Search by CVE/GHSA ID, package, severity, ecosystem, credit...':
      '按 CVE/GHSA ID、软件包、严重性、生态系统、致谢搜索...',
    'Filter by CWE': '按 CWE 筛选',
    // 公告条目：<CVE> was published for <软件包> (<生态系统>) <时间>；整句见 inline，这里是整句未命中时的片段
    'was published for': '已发布 影响',
    'was published': '发布于',
    // Advisories are also available from the <GraphQL API>
    'Advisories are also available from the': '公告也可从以下接口获取',

    // GitHub Advisory Database：详情
    'GitHub Reviewed': 'GitHub 已审查',
    Unreviewed: '未审查',
    Malware: '恶意软件',
    '• Updated': '• 更新于',
    'Vulnerability details': '漏洞详细信息',
    // Published by the <National Vulnerability Database> <时间>；整句见 inline，这里是整句未命中时的片段
    'Published by the': '发布者',
    'National Vulnerability Database': '美国国家漏洞数据库',
    'Published to the GitHub Advisory Database': '发布到 GitHub 公告数据库',
    'Checking history': '正在检查历史记录',
    'See something to contribute?': '有内容要补充？',
    'Suggest improvements for this vulnerability': '为此漏洞提出改进建议',
    'Suggest improvements for this advisory on the GitHub Advisory Database.':
      '在 GitHub 公告数据库中为此公告提出改进建议。',
    'See advisory in GitHub Advisory Database': '在 GitHub 公告数据库中查看公告',
    'See all of your affected repositories': '查看所有受影响的存储库',
    'Advisory links': '公告链接',
    'Improve this advisory': '改进此公告',
  },
  scoped: {
    // 其他区域也出现的同形文字，本区域内单独生效
    // 公告致谢（计费页的 Credits 是额度，见 settings-account/billing）
    Credits: '致谢',
    'Security vulnerability database inclusive of CVEs and GitHub originated security advisories from the world of open source software.':
      '收录开源软件领域 CVE 及 GitHub 发起的安全公告的安全漏洞数据库。',
    'Last updated': '最后更新',
    Advisory: '公告',
    Reviewed: '审查于',
    'Source code': '源代码',
    // 时间线：<用户> published to <存储库> <时间>；整句见 inline，这里是整句未命中时的片段
    'published to': '发布到',
    advisories: '条公告',
    advisory: '条公告',
    Collaborators: '协作者',
    Other: '其他',
    'An unexpected error occurred. Please try again.': '发生意外错误。请重试。',
    // 生态系统筛选项、公告表单的生态系统选项（与 npm、pip 等并列）；产品名按用户规定译出
    'GitHub Actions': 'GitHub 操作',
  },
  regexp: [
    // 公告列表状态切换：3 Published
    [/^([\d,]+) (Draft|Triage|Published|Closed)$/, (_, count, state) => `${count} 个${ADVISORY_STATE[state]}`],
    [
      /^There aren['’]t any (published|draft|closed|triage) security advisories(\.?)$/,
      (_, state, period) => `暂无${LIST_STATE[state]}${period ? '。' : ''}`,
    ],
    // 原文是两句，没有逗号，译文不加
    [
      /^Exact package name not found on (.+)\. You can still submit this report\.$/,
      '在 $1 上未找到完全匹配的软件包名称。仍可提交此报告。',
    ],
    // GitHub Advisory Database 列表
    [/^([\d,]+) advisor(?:y|ies)$/, '$1 条公告'],
    [
      /^Filter by severity - (All severities|Low|Moderate|High|Critical)$/,
      (_, level) => `按严重性筛选 - ${SEVERITY_FILTER[level]}`,
    ],
    [/^Sort by - (Newest|Oldest|Recently updated|Least recently updated)$/, (_, sort) => `排序依据 - ${SORT[sort]}`],
    [/^Credited to ([\w-]+(?:, [\w-]+)*,? and [\w-]+|[\w-]+)$/, (_, names) => `致谢 ${joinNames(names)}`],
    // 撤回说明：前缀与日期用 joinCjk 拼接，日期后接中文不加空格
    [
      new RegExp(`^This advisory was withdrawn on (${DATE_SOURCE})(\\.?)$`),
      (_, date, period) => `${joinCjk('此公告已于', translateTime(date))}撤回${period ? '。' : ''}`,
    ],
  ],
  ignore: [
    // GitHub Advisory Database 详情页标题（公告摘要）
    'h2.lh-condensed.Subhead-heading',
    // GitHub Advisory Database 列表：<CVE> was published for <软件包> (<生态系统>) 中的软件包名
    'div.mt-1.text-small.color-fg-muted span.text-bold ~ span',
  ],
  // 被元素拆开的公告条目整句；槽位顺序不变，未命中时按片段翻译（published、by、was published for、published to）
  inline: [
    // 存储库安全公告详情页头：<a>用户</a> published <span>GHSA-…</span> <relative-time>
    ['{} published {} {}', '{} 发布了 {} 于 {}'],
    // 存储库安全公告列表、安全概述页：GHSA-… <span class="opened-by">published <relative-time> by <a>用户</a></span>
    ['published {} by {}', '于 {}由 {} 发布'],
    // GitHub Advisory Database 列表：<span>CVE-…</span> was published for <span>软件包</span> (pip) <relative-time>
    [/^\{\} was published for \{\} \(([^()]+)\) \{\}$/, '{} 针对 {} ($1) 发布于 {}'],
    // GitHub Advisory Database 详情时间线：Published by the <a>National Vulnerability Database</a> <relative-time>
    // 链接文字译成中文（美国国家漏洞数据库），槽位两侧不留空格
    ['Published by the {} {}', '由{}发布于 {}'],
    // GitHub Advisory Database 详情时间线：<a>头像</a> <a>用户</a> published to <a>存储库</a> <relative-time>
    ['{} {} published to {} {}', '{} {} 发布到 {} 于 {}'],
    // GitHub Advisory Database 详情时间线：Published to the GitHub Advisory Database <relative-time>
    ['Published to the GitHub Advisory Database {}', '于 {}发布到 GitHub 公告数据库'],
  ],
} satisfies PageDictionary
