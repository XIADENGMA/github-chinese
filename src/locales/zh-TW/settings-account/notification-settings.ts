import type { PageDictionary } from '../../../core/types'

/** 通知渠道摘要中的渠道名（「Notify me:」下拉按钮：on GitHub, Email, CLI） */
const CHANNELS: Readonly<Record<string, string>> = {
  'on GitHub': 'GitHub',
  'On GitHub': 'GitHub',
  Email: '電子郵件',
  CLI: 'CLI'
}

/** 自定义电子邮件更新摘要中的事件名（Reviews, Pushes, Comments, My own updates） */
const EMAIL_EVENTS: Readonly<Record<string, string>> = {
  Reviews: '審查',
  Pushes: '推送',
  Comments: '留言',
  'My own updates': '我自己的更新'
}

const CHANNEL_SOURCE = '(?:[oO]n GitHub|Email|CLI)'
const EVENT_SOURCE = '(?:Reviews|Pushes|Comments|My own updates)'

function joinItems(list: string, names: Readonly<Record<string, string>>): string {
  return list
    .split(', ')
    .map(item => names[item] ?? item)
    .join('、')
}

/**
 * 通知设置（/settings/notifications、/settings/notifications/custom_routing）：默认通知电子邮件、自动关注、
 * 订阅（关注中、参与和 @提及、自定义电子邮件更新、已忽略的存储库）、系统（Actions、Dependabot、安全活动、部署密钥、代理任务）、
 * 自定义路由。「Subscriptions」「Notification settings」由 notifications 收录，「In-product messages」由组织设置收录。
 * 术语：watch → 關注（进行体 Watching → 關注中），channel → 管道，routing → 路由，digest → 摘要，
 * security campaign → 安全性活動，agent session → 代理工作階段。
 */
export default {
  static: {
    // 默认通知电子邮件：说明可能被链接拆开（句号随原文）
    'Default notifications email': '預設通知電子郵件',
    "Choose where you'd like emails to be sent. You can add more email addresses. Use custom routes to specify different email addresses to be used for individual organizations.":
      '選擇接收電子郵件的地址。你可以新增更多電子郵件地址。使用自訂路由為個別組織指定不同的電子郵件地址。',
    'Choose where you’d like emails to be sent. You can add more email addresses. Use custom routes to specify different email addresses to be used for individual organizations.':
      '選擇接收電子郵件的地址。你可以新增更多電子郵件地址。使用自訂路由為個別組織指定不同的電子郵件地址。',
    "Choose where you'd like emails to be sent. You can": '選擇接收電子郵件的地址。你可以',
    'Choose where you’d like emails to be sent. You can': '選擇接收電子郵件的地址。你可以',
    'add more email addresses': '新增更多電子郵件地址',
    '. Use': '。使用',
    'custom routes': '自訂路由',
    'to specify different email addresses to be used for individual organizations.': '為個別組織指定不同的電子郵件地址。',
    'Custom routing': '自訂路由',
    'Custom Routing': '自訂路由',

    // 自动关注
    'Automatically watch repositories': '自動關注儲存庫',
    "When you're given push access to a repository, automatically receive notifications for it.":
      '獲得儲存庫的推送權限時，自動接收該儲存庫的通知。',
    'When you’re given push access to a repository, automatically receive notifications for it.':
      '獲得儲存庫的推送權限時，自動接收該儲存庫的通知。',
    'Automatically watch teams': '自動關注團隊',
    'Anytime you join a new team, you will automatically be subscribed to updates and receive notification when that team is @mentioned.':
      '每當你加入新團隊，都會自動訂閱其更新，並在該團隊被 @提及時收到通知。',

    // 订阅：关注
    "Notifications for all repositories, teams, or conversations you're watching.": '你關注的所有儲存庫、團隊或對話的通知。',
    'Notifications for all repositories, teams, or conversations you’re watching.': '你關注的所有儲存庫、團隊或對話的通知。',
    'View watched repositories': '查看已關注的儲存庫',
    'Select notification channels': '選擇通知管道',
    'On GitHub': '在 GitHub 上',
    'on GitHub': '在 GitHub 上',
    "Don't notify": '不通知',
    'Don’t notify': '不通知',

    // 订阅：参与、@提及和自定义
    'Participating, @mentions and custom': '參與、@提及和自訂',
    'Notifications for the conversations you are participating in, or if someone cites you with an @mention. Also for all activity when subscribed to specific events.':
      '你參與的對話或有人 @提及你時的通知。訂閱特定事件時，也會收到所有活動的通知。',

    // 订阅：自定义电子邮件更新
    'Customize email updates': '自訂電子郵件更新',
    "Choose which additional events you'll receive emails for when participating or watching.":
      '選擇參與或關注時還要透過電子郵件接收哪些事件。',
    'Choose which additional events you’ll receive emails for when participating or watching.':
      '選擇參與或關注時還要透過電子郵件接收哪些事件。',
    'Select events': '選擇事件',
    'Pull Request reviews': '拉取請求審查',
    'Pull Request pushes': '拉取請求推送',
    'Comments on Issues and Pull Requests': '議題和拉取請求中的留言',
    'Includes your own updates': '包括你自己的更新',

    // 订阅：已忽略的存储库
    'Ignored repositories': '已忽略的儲存庫',
    "You'll never be notified.": '你將不會收到任何通知。',
    'You’ll never be notified.': '你將不會收到任何通知。',
    'View ignored repositories': '查看已忽略的儲存庫',

    // 系统：Actions（说明被「GitHub Actions」链接拆开；产品名按用户规定译成中文：GitHub Actions → GitHub 動作）
    // → 「儲存庫中的工作流程執行通知需已設定 <GitHub 動作>。」（原文片段无标点，译文不加逗号；链接后的孤立句号由引擎转全角）
    'Notifications for workflow runs on repositories set up with': '儲存庫中的工作流程執行通知需已設定',
    'Notifications for workflow runs on repositories set up with GitHub Actions.': '已設定 GitHub 動作的儲存庫中的工作流程執行通知。',
    'Only notify for failed workflows': '僅在工作流程失敗時通知',
    'Failed workflows only': '僅限失敗的工作流程',
    'Agent tasks': '代理任務',
    'Notifications for agent sessions that you started.': '你發起的代理工作階段的通知。',

    // 系统：Dependabot（说明被「Dependabot alerts」链接拆开，链接后无逗号，译文不加）
    // → 「當你獲得 <Dependabot 警示> 的存取權限後將自動收到你的相依項目中發現新漏洞的通知。」
    'Dependabot alerts: New vulnerabilities': 'Dependabot 警示：新漏洞',
    "When you're given access to": '當你獲得',
    'When you’re given access to': '當你獲得',
    'automatically receive notifications when a new vulnerability is found in one of your dependencies.':
      '的存取權限後將自動收到你的相依項目中發現新漏洞的通知。',
    'Dependabot alerts: Email digest': 'Dependabot 警示：電子郵件摘要',
    'Email a regular summary of Dependabot alerts for up to 10 of your repositories.':
      '定期以電子郵件傳送最多 10 個儲存庫的 Dependabot 警示摘要。',
    "Don't send": '不傳送',
    'Don’t send': '不傳送',
    'Send weekly': '每週傳送',
    'Send daily': '每天傳送',

    // 系统：安全活动、部署密钥、产品内消息
    'Security campaign emails': '安全性活動電子郵件',
    'Receive email notifications about security campaigns in repositories where you have access to security alerts.':
      '接收你可存取安全性警示的儲存庫中有關安全性活動的電子郵件通知。',
    "'Deploy key' alert email": '「部署金鑰」警示電子郵件',
    '‘Deploy key’ alert email': '「部署金鑰」警示電子郵件',
    '“Deploy key” alert email': '「部署金鑰」警示電子郵件',
    '"Deploy key" alert email': '「部署金鑰」警示電子郵件',
    'When you are given admin permissions to an organization, automatically receive notifications when a new deploy key is added.':
      '獲得組織的管理員權限後，每當新增部署金鑰時都會自動收到通知。',
    'Get tips, solutions and exclusive offers from GitHub about products, services and events we think you might find interesting.':
      '接收 GitHub 針對你可能感興趣的產品、服務和活動所提供的提示、解決方案和專屬優惠。',

    // 自定义路由页：句子被「verified」链接拆开，默认电子邮件在 <strong> 中
    // → 「你可以依據儲存庫所屬的組織將通知傳送到不同的 <已驗證> 電子郵件地址。」
    '/ Custom Routing': '/ 自訂路由',
    '/ Custom routing': '/ 自訂路由',
    'You can send notifications to different': '你可以依據儲存庫所屬的組織將通知傳送到不同的',
    'email addresses depending on the organization that owns the repository.': '電子郵件地址。',
    'is your current default email for notifications.': '是你目前的預設通知電子郵件。',
    'No custom routes yet.': '尚無自訂路由。',
    'Add new route': '新增路由',
    'Pick organization': '選擇組織',
    'Search organizations': '搜尋組織',
    'Select Email': '選擇電子郵件'
  },
  scoped: {
    // 订阅分组名（进行体，按术语表作「關注中」）；settings-developer 的权限名 Watching 同在 settings 页面类型，共用此条
    Watching: '關注中',
    'Notify me:': '通知我：',
    Email: '電子郵件',
    System: '系統',
    verified: '已驗證',
    // 产品名按用户规定译成中文：系统分组的 Actions 标题、计费页的产品名、GitHub 应用权限名同用；
    // 说明中的「GitHub Actions」链接
    Actions: '動作',
    'GitHub Actions': 'GitHub 動作'
  },
  regexp: [
    // 「Notify me:」下拉按钮的渠道摘要：on GitHub, Email, CLI → GitHub、電子郵件、CLI
    [new RegExp(`^(${CHANNEL_SOURCE}(?:, ${CHANNEL_SOURCE})+)$`), (_, list: string) => joinItems(list, CHANNELS)],
    // Actions 通知勾选「僅限失敗的工作流程」时的摘要：Email. (Failed workflows only)
    [
      new RegExp(`^(${CHANNEL_SOURCE}(?:, ${CHANNEL_SOURCE})*)\\. \\(Failed workflows only\\)$`),
      (_, list: string) => `${joinItems(list, CHANNELS)}（僅限失敗的工作流程）`
    ],
    // 自定义电子邮件更新的事件摘要：Reviews, Pushes, Comments → 審查、推送、留言
    [new RegExp(`^(${EVENT_SOURCE}(?:, ${EVENT_SOURCE})*)$`), (_, list: string) => joinItems(list, EMAIL_EVENTS)],
    // 自定义路由：默认电子邮件未被拆开时
    [/^(\S+@\S+) is your current default email for notifications\.$/, '$1 是你目前的預設通知電子郵件。']
  ]
} satisfies PageDictionary
