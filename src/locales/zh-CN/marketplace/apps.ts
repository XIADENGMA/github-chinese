import type { PageDictionary } from '../../../core/types'

/**
 * GitHub 应用页（/apps/<name>）、安装与授权（/apps/<name>/installations/…）、
 * 订单页（/marketplace/<name>/order/<id>）、待处理订单与待安装（/marketplace/orders/pending、/marketplace/installations/pending）。
 */
export default {
  static: {
    // 应用页 /apps/<name>
    'Read more about this app on the Marketplace': '在市场中了解此应用',
    'Manage your installation settings.': '管理安装设置。',
    'Learn more about GitHub Apps': '了解 GitHub 应用',

    // 选择安装目标 /apps/<name>/installations/select_target
    'Install & Authorize': '安装并授权',
    'Authorize & Request': '授权并申请',
    'Install & Authorize on your personal account': '安装并授权到个人帐户',
    'Install & Authorize on your organization': '安装并授权到组织',
    'Install on your personal account': '安装到个人帐户',
    'Install on your organization': '安装到组织',
    'Request on your organization': '向组织申请',
    'Authorize & Request on your organization': '授权并向组织申请',

    // 存储库访问
    'for these repositories:': '用于以下存储库：',
    'This applies to all current': '适用于资源所有者拥有的所有当前',
    'future repositories owned by the resource owner.': '未来的存储库。',
    'Also includes public repositories (read-only).': '同时包括公共存储库（只读）。',

    // 权限
    'with these permissions:': '具有以下权限：',
    "can also request users' permission to the following resources. These permissions will be requested and authorized on an individual-user basis.":
      '还可以请求用户对以下资源的权限。这些权限将按单个用户请求和授权。',
    'can also request users’ permission to the following resources. These permissions will be requested and authorized on an individual-user basis.':
      '还可以请求用户对以下资源的权限。这些权限将按单个用户请求和授权。',
    'These permissions will also be requested and authorized as needed on an individual-user basis.':
      '这些权限也将按需针对单个用户请求和授权。',
    // 按钮提交后的进度文字（另见 scoped 的 Installing、Requesting）
    'Installing & Authorizing': '安装并授权中',

    // 安装后跳转
    "Next: you'll be redirected to": '下一步：你将被重定向到',
    'Next: you’ll be redirected to': '下一步：你将被重定向到',
    'Next: you’ll be directed to the GitHub App’s site to complete setup.': '下一步：你将前往 GitHub 应用的网站完成设置。',
    "Next: you'll be directed to the GitHub App's site to complete setup.": '下一步：你将前往 GitHub 应用的网站完成设置。',

    // 订单页 /marketplace/<name>/order/<id>
    'To complete this installation, you must': '要完成安装，必须',
    'grant this app access': '授予此应用访问',
    'to your GitHub account.': '你的 GitHub 帐户的权限。',
    // 第二句之后接链接「签署」the「GitHub 客户协议」（整句见 inline）；原文没有逗号，译文用“若要…请”承接
    'An organization owner or billing manager must link their personal billing information with this organization account. You can switch to a business account to use your business’ billing information by':
      '组织所有者或账单管理员必须将个人账单信息链接到此组织帐户。若要切换为企业帐户以使用企业账单信息请',
    'Complete order and begin installation': '完成订单并开始安装',
    // 原文按钮名带引号、引号后有逗号，译文照录
    'By clicking “Complete order and begin installation”, you agree to the': '单击“完成订单并开始安装”，即表示你同意',
    'By clicking "Complete order and begin installation", you agree to the': '单击“完成订单并开始安装”，即表示你同意',

    // 待处理订单 /marketplace/orders/pending
    'Pending orders': '待处理订单',
    'Review and complete your orders': '查看并完成订单',
    // 后接链接“计费概述页”+ 句号：链接作“前往”的宾语；原文第二句没有逗号，译文不加
    'We noticed you started setting up some new plans but didn’t finish. You can complete your pending orders below or review any active subscriptions on the':
      '你有尚未完成设置的新计划。可在下方完成待处理订单或前往可查看有效订阅的',
    "We noticed you started setting up some new plans but didn't finish. You can complete your pending orders below or review any active subscriptions on the":
      '你有尚未完成设置的新计划。可在下方完成待处理订单或前往可查看有效订阅的',
    'Remove from pending orders': '从待处理订单中删除',
    'This will not affect your existing subscriptions.': '这不会影响现有订阅。',

    // 待安装 /marketplace/installations/pending
    'Pending installations': '待安装',
    "We noticed you’ve purchased some apps but didn't finish installing them. You can review and install them below.":
      '你购买的部分应用尚未完成安装。可在下方查看并安装。',
    'We noticed you’ve purchased some apps but didn’t finish installing them. You can review and install them below.':
      '你购买的部分应用尚未完成安装。可在下方查看并安装。',
    "We noticed you've purchased some apps but didn't finish installing them. You can review and install them below.":
      '你购买的部分应用尚未完成安装。可在下方查看并安装。',
    // 后接链接“计费概述页”+ 句号；原文没有标点，译文不加逗号
    'View or cancel any active subscriptions on the': '如需查看或取消有效订阅请前往',
    'Grant this app access to your GitHub account to complete installation.': '授予此应用访问你的 GitHub 帐户的权限以完成安装。'
  },
  scoped: {
    Website: '网站',
    Request: '申请',
    request: '申请',
    Installing: '安装中',
    Requesting: '申请中',
    signing: '签署',
    'Only select repositories': '仅选定的存储库',
    'Search for a repository': '搜索存储库',
    'Select at least one repository.': '至少选择一个存储库。',
    'User permissions': '用户权限',
    'App settings': '应用设置',
    'Save and continue': '保存并继续',
    'Order summary': '订单摘要',
    'New plan': '新计划',
    'Due today': '今日应付',
    'Edit your plan': '编辑计划',
    'Review your order': '查看订单',
    'Cancel this plan': '取消此计划',
    'billing overview page': '计费概述页',
    '(current plan)': '（当前计划）'
  },
  regexp: [
    // 页面标题
    [/^GitHub Apps - (.+)$/, 'GitHub 应用 - $1'],

    // 安装目标
    [/^Install & Authorize on your personal account (\S+)$/, '安装并授权到个人帐户 $1'],
    [/^Install & Authorize on your organization (\S+)$/, '安装并授权到组织 $1'],
    [/^Install on your personal account (\S+)$/, '安装到个人帐户 $1'],
    [/^Install on your organization (\S+)$/, '安装到组织 $1'],
    [/^Authorize & Request on your organization (\S+)$/, '授权并向组织 $1 申请'],
    [/^Request on your organization (\S+)$/, '向组织 $1 申请'],
    [/^Where do you want to install (.+)\?$/, '要将 $1 安装到哪里？'],
    [/^(.+) is installed\. Click to configure\.$/, '$1 已安装。单击进行配置。'],
    // 原文末尾的句号照录
    [/^Selected (\d+) repositor(?:y|ies)(\.?)$/, (_, count: string, period: string) => `已选择 ${count} 个存储库${period ? '。' : ''}`],
    [
      /^Installing and authorizing (.+) immediately grants these permissions on your account:$/,
      '安装并授权 $1 会立即在你的帐户上授予以下权限：'
    ],
    [
      /^(.+) can also request users['’] permission to the following resources\. These permissions will be requested and authorized on an individual-user basis\.$/,
      '$1 还可以请求用户对以下资源的权限。这些权限将按单个用户请求和授权。'
    ],
    [/^Install (.+)$/, '安装 $1']
  ],
  inline: [
    // 订单页：首段 + 链接 signing + the + 链接 GitHub Customer Agreement + 句号；整句命中时去掉 the，
    // 显示为“…请签署 GitHub 客户协议。”。不命中时按 static 首段与 scoped 的 signing 逐段翻译
    [
      'An organization owner or billing manager must link their personal billing information with this organization account. You can switch to a business account to use your business’ billing information by {} the {}.',
      '组织所有者或账单管理员必须将个人账单信息链接到此组织帐户。若要切换为企业帐户以使用企业账单信息请{} {}。'
    ]
  ],
  ignore: [
    // 应用页名称
    '.Layout-main h1.f1',
    // 侧栏：开发人员帐户名、第三方说明中的应用名
    '.Layout-sidebar img.avatar + a',
    '.Layout-sidebar > ul + p > strong'
  ]
} satisfies PageDictionary
