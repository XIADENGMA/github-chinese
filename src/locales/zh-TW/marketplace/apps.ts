import type { PageDictionary } from '../../../core/types'

/**
 * GitHub 应用页（/apps/<name>）、安装与授权（/apps/<name>/installations/…）、
 * 订单页（/marketplace/<name>/order/<id>）、待处理订单与待安装（/marketplace/orders/pending、/marketplace/installations/pending）。
 * 向组织所有者申请安装的 request 作「申請」（与 org-settings/copilot.ts 的「申請中...」一致）；计费 plan 作「方案」。
 */
export default {
  static: {
    // 应用页 /apps/<name>
    'Read more about this app on the Marketplace': '在市集上瞭解此應用程式',
    'Manage your installation settings.': '管理安裝設定。',
    'Learn more about GitHub Apps': '瞭解 GitHub 應用程式',

    // 选择安装目标 /apps/<name>/installations/select_target
    'Install & Authorize': '安裝並授權',
    'Authorize & Request': '授權並申請',
    'Install & Authorize on your personal account': '在個人帳號上安裝並授權',
    'Install & Authorize on your organization': '在組織上安裝並授權',
    'Install on your personal account': '安裝到個人帳號',
    'Install on your organization': '安裝到組織',
    'Request on your organization': '向組織申請',
    'Authorize & Request on your organization': '授權並向組織申請',

    // 存储库访问（「適用於…所有現有」+ 通用词典的 and「和」+「未來儲存庫。」，
    // 与 org-settings/third-party.ts 的整句译文一致）
    'for these repositories:': '適用於下列儲存庫：',
    'This applies to all current': '適用於資源擁有者擁有的所有現有',
    'future repositories owned by the resource owner.': '未來儲存庫。',
    'Also includes public repositories (read-only).': '同時包含公開儲存庫（唯讀）。',

    // 权限
    'with these permissions:': '具有下列權限：',
    "can also request users' permission to the following resources. These permissions will be requested and authorized on an individual-user basis.":
      '也可以請求使用者對下列資源的權限。這些權限將依個別使用者請求並授權。',
    'can also request users’ permission to the following resources. These permissions will be requested and authorized on an individual-user basis.':
      '也可以請求使用者對下列資源的權限。這些權限將依個別使用者請求並授權。',
    'These permissions will also be requested and authorized as needed on an individual-user basis.':
      '這些權限也會視需要依個別使用者請求並授權。',
    // 按钮提交后的进度文字（另见 scoped 的 Installing、Requesting）
    'Installing & Authorizing': '安裝並授權中',

    // 安装后跳转
    "Next: you'll be redirected to": '下一步：將重新導向至',
    'Next: you’ll be redirected to': '下一步：將重新導向至',
    'Next: you’ll be directed to the GitHub App’s site to complete setup.':
      '下一步：你將前往 GitHub 應用程式的網站完成設定。',
    "Next: you'll be directed to the GitHub App's site to complete setup.":
      '下一步：你將前往 GitHub 應用程式的網站完成設定。',

    // 订单页 /marketplace/<name>/order/<id>
    'To complete this installation, you must': '若要完成此安裝，你必須',
    'grant this app access': '授予此應用程式存取',
    'to your GitHub account.': '你的 GitHub 帳號的權限。',
    // 第二句之后接链接「簽署」the「GitHub 客戶合約」（整句见 inline）；原文没有逗号，译文用「若要…請」承接
    'An organization owner or billing manager must link their personal billing information with this organization account. You can switch to a business account to use your business’ billing information by':
      '組織擁有者或帳務管理員必須將個人帳單資訊連結到此組織帳號。若要切換到商業帳號以使用公司的帳單資訊請',
    'Complete order and begin installation': '完成訂單並開始安裝',
    // 原文按钮名带引号、引号后有逗号：译文用「」，逗号照录
    'By clicking “Complete order and begin installation”, you agree to the':
      '按一下「完成訂單並開始安裝」，即表示你同意',
    'By clicking "Complete order and begin installation", you agree to the':
      '按一下「完成訂單並開始安裝」，即表示你同意',

    // 待处理订单 /marketplace/orders/pending
    'Pending orders': '待處理訂單',
    'Review and complete your orders': '查看並完成你的訂單',
    // 后接链接「帳務總覽頁面」+ 句号：链接作「前往」的宾语
    'We noticed you started setting up some new plans but didn’t finish. You can complete your pending orders below or review any active subscriptions on the':
      '你有一些新方案尚未完成設定。你可以在下方完成待處理訂單；若要查看有效的訂閱，請前往',
    "We noticed you started setting up some new plans but didn't finish. You can complete your pending orders below or review any active subscriptions on the":
      '你有一些新方案尚未完成設定。你可以在下方完成待處理訂單；若要查看有效的訂閱，請前往',
    'Remove from pending orders': '從待處理訂單中移除',
    'This will not affect your existing subscriptions.': '這不會影響你現有的訂閱。',

    // 待安装 /marketplace/installations/pending
    'Pending installations': '待處理的安裝',
    "We noticed you’ve purchased some apps but didn't finish installing them. You can review and install them below.":
      '你購買的部分應用程式尚未完成安裝。你可以在下方查看並安裝。',
    'We noticed you’ve purchased some apps but didn’t finish installing them. You can review and install them below.':
      '你購買的部分應用程式尚未完成安裝。你可以在下方查看並安裝。',
    "We noticed you've purchased some apps but didn't finish installing them. You can review and install them below.":
      '你購買的部分應用程式尚未完成安裝。你可以在下方查看並安裝。',
    // 后接链接「帳務總覽頁面」+ 句号；原文没有标点，译文不加逗号
    'View or cancel any active subscriptions on the': '若要查看或取消有效的訂閱請前往',
    'Grant this app access to your GitHub account to complete installation.':
      '授予此應用程式存取你的 GitHub 帳號的權限以完成安裝。',
  },
  scoped: {
    Website: '網站',
    Request: '申請',
    request: '申請',
    Installing: '安裝中',
    Requesting: '申請中',
    signing: '簽署',
    'Only select repositories': '僅限選取的儲存庫',
    'Search for a repository': '搜尋儲存庫',
    'Select at least one repository.': '至少選取一個儲存庫。',
    'User permissions': '使用者權限',
    'App settings': '應用程式設定',
    'Save and continue': '儲存並繼續',
    'Order summary': '訂單摘要',
    'New plan': '新方案',
    'Due today': '今日應付',
    'Edit your plan': '編輯方案',
    'Review your order': '查看訂單',
    'Cancel this plan': '取消此方案',
    'billing overview page': '帳務總覽頁面',
    '(current plan)': '（目前方案）',
  },
  regexp: [
    // 页面标题
    [/^GitHub Apps - (.+)$/, 'GitHub 應用程式 - $1'],

    // 安装目标
    [/^Install & Authorize on your personal account (\S+)$/, '在個人帳號 $1 上安裝並授權'],
    [/^Install & Authorize on your organization (\S+)$/, '在組織 $1 上安裝並授權'],
    [/^Install on your personal account (\S+)$/, '安裝到個人帳號 $1'],
    [/^Install on your organization (\S+)$/, '安裝到組織 $1'],
    [/^Authorize & Request on your organization (\S+)$/, '授權並向組織 $1 申請'],
    [/^Request on your organization (\S+)$/, '向組織 $1 申請'],
    [/^Where do you want to install (.+)\?$/, '要將 $1 安裝在哪裡？'],
    [/^(.+) is installed\. Click to configure\.$/, '$1 已安裝。按一下以設定。'],
    // 原文末尾的句号照录
    [
      /^Selected (\d+) repositor(?:y|ies)(\.?)$/,
      (_, count: string, period: string) => `已選取 ${count} 個儲存庫${period ? '。' : ''}`,
    ],
    [
      /^Installing and authorizing (.+) immediately grants these permissions on your account:$/,
      '安裝並授權 $1 會立即在你的帳號上授予下列權限：',
    ],
    [
      /^(.+) can also request users['’] permission to the following resources\. These permissions will be requested and authorized on an individual-user basis\.$/,
      '$1 也可以請求使用者對下列資源的權限。這些權限將依個別使用者請求並授權。',
    ],
    [/^Install (.+)$/, '安裝 $1'],
  ],
  inline: [
    // 订单页：首段 + 链接 signing + the + 链接 GitHub Customer Agreement + 句号；整句命中时去掉 the，
    // 显示为「…請簽署 GitHub 客戶合約。」。不命中时按 static 首段与 scoped 的 signing 逐段翻译
    [
      'An organization owner or billing manager must link their personal billing information with this organization account. You can switch to a business account to use your business’ billing information by {} the {}.',
      '組織擁有者或帳務管理員必須將個人帳單資訊連結到此組織帳號。若要切換到商業帳號以使用公司的帳單資訊請{} {}。',
    ],
  ],
  ignore: [
    // 应用页名称
    '.Layout-main h1.f1',
    // 侧栏：开发人员帐户名、第三方说明中的应用名
    '.Layout-sidebar img.avatar + a',
    '.Layout-sidebar > ul + p > strong',
  ],
} satisfies PageDictionary
