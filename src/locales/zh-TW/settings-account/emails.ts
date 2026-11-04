import type { PageDictionary } from '../../../core/types'

const EMAIL = '(\\S+@\\S+?)'

/** 添加电子邮件失败的原因（「Error adding foo@example.com: email is already in use」）；用 Map 避免命中原型链键 */
const ADD_EMAIL_ERRORS: ReadonlyMap<string, string> = new Map([
  ['email is already in use', '電子郵件已被使用'],
  ['Email is already in use', '電子郵件已被使用'],
  ['email is invalid', '電子郵件無效'],
  ['Email is invalid', '電子郵件無效']
])

/**
 * 电子邮件（/settings/emails）：电子邮件列表与标签、添加电子邮件、主要电子邮件地址、备用电子邮件地址、电子邮件隐私、阻止暴露电子邮件的推送、
 * 电子邮件首选项，以及订阅首选项页（/settings/emails/subscriptions）。电子邮件地址在 <strong> 等元素中时按片段收录。
 * 术语：preferences → 偏好設定，private（电子邮件隐私）→ 不公開（private email 作「不公開的電子郵件」，同 auth/oauth；
 * 「私人電子郵件」在台湾读作个人信箱，不用），block（推送）→ 阻擋，disconnect → 中斷連接，
 * 'from' address → 「寄件者」地址，web-based Git operations → 網頁上的 Git 操作。
 */
export default {
  static: {
    // 页头说明（原文无逗号、括号，译文不加：「e.g. edits and merges」作「編輯和合併等」）
    'You have a single verified email associated with your GitHub account. Add an additional verified email address in case you lose access to your primary email.':
      '你的 GitHub 帳號只有一個已驗證的電子郵件。再新增一個已驗證的電子郵件地址以防無法存取主要電子郵件。',
    'Emails you can use to sign in to your account. Verified emails can be used as the author or committer addresses for web-based Git operations, e.g. edits and merges.':
      '可用來登入帳號的電子郵件。已驗證的電子郵件可作為網頁上編輯和合併等 Git 操作的作者或提交者地址。',

    // 电子邮件列表
    'Visible in emails': '在電子郵件中可見',
    'Not visible in emails': '在電子郵件中不可見',
    'Receives notifications': '接收通知',
    'Not receiving notifications': '不接收通知',
    'This email address is the default for GitHub notifications, such as replies to issues, pull requests, and similar activity.':
      '此電子郵件地址是 GitHub 通知的預設地址，例如議題和拉取請求的回覆等類似活動。',
    'This email will be used for account-related notifications and can also be used for password resets.':
      '此電子郵件將用於帳號相關通知，也可用於重設密碼。',
    "This email will not be used as the 'from' address for web-based Git operations.":
      '此電子郵件不會作為網頁上 Git 操作的「寄件者」地址。',
    'This email will not be used as the ‘from’ address for web-based Git operations.':
      '此電子郵件不會作為網頁上 Git 操作的「寄件者」地址。',
    'Unverified email addresses cannot receive notifications or be used to reset your password.':
      '未驗證的電子郵件地址無法接收通知，也無法用來重設密碼。',
    'Manage email preferences': '管理電子郵件偏好設定',
    'Resend verification email': '重新傳送驗證電子郵件',
    'Delete email address': '刪除電子郵件地址',
    'Remove email address': '移除電子郵件地址',
    'Are you sure you want to remove this email from your account? Once removed, commits attributed to this email address will no longer be associated with your account.':
      '確定要從帳號中移除此電子郵件嗎？移除後，歸屬於此電子郵件地址的提交將不再與你的帳號關聯。',
    'Are you sure you want to remove this email from your account? Once removed, commits attributed to this email address will no longer be associated with your account. One of your other emails will become your primary address.':
      '確定要從帳號中移除此電子郵件嗎？移除後，歸屬於此電子郵件地址的提交將不再與你的帳號關聯。你的另一個電子郵件將成為主要地址。',
    'Are you sure you want to remove this email from your account? Once removed, commits attributed to this email address will no longer be associated with your account. Removing your backup email will allow all verified emails to be used for password resets.':
      '確定要從帳號中移除此電子郵件嗎？移除後，歸屬於此電子郵件地址的提交將不再與你的帳號關聯。移除備用電子郵件後，所有已驗證的電子郵件都可用於重設密碼。',
    'At least one email is required.': '至少需要一個電子郵件。',
    'At least one verified email is required.': '至少需要一個已驗證的電子郵件。',
    // 删除按钮不可用时的提示与无障碍名称
    'At least one non-backup email is required.': '至少需要一個非備用的電子郵件。',
    'Delete: At least one non-backup email is required.': '刪除：至少需要一個非備用的電子郵件。',
    // 通过 Google / Apple 登录连接的电子邮件（connect → 連接；disconnect 同 common-ui 的 Disconnect → 中斷連接）
    'Connected to Google': '已連接 Google',
    'Connected to Apple': '已連接 Apple',
    'Disconnect from Google': '中斷與 Google 的連接',
    'Disconnect from Apple': '中斷與 Apple 的連接',
    'You must set a password first before you can disconnect this email from its identity provider.':
      '你必須先設定密碼才能中斷此電子郵件與其身分識別提供者的連接。',

    // 添加电子邮件、主要电子邮件地址
    'Add email address': '新增電子郵件地址',
    'Email address': '電子郵件地址',
    'Primary email address': '主要電子郵件地址',
    // 旧版说明
    'Your primary email address will be used for account-related notifications (e.g. account changes and billing receipts) as well as any web-based GitHub operations (e.g. edits and merges).':
      '你的主要電子郵件地址將用於帳號相關通知（例如帳號變更和帳單收據）和所有網頁上的 GitHub 操作（例如編輯和合併）。',
    'Select an email to be used for account-related notifications and can be used for password reset.':
      '選擇用於帳號相關通知並可用於重設密碼的電子郵件。',
    'Select email to become primary': '選擇要設為主要地址的電子郵件',
    'Select email to become backup': '選擇要設為備用地址的電子郵件',
    // 已启用电子邮件隐私时的说明：两个电子邮件地址在 <strong> 中
    'Because you have email privacy enabled,': '由於你已啟用電子郵件隱私，',
    'will be used for account-related notifications as well as password resets.': '將用於帳號相關通知和重設密碼。',
    'will be used for web-based Git operations, e.g., edits and merges.': '將用於網頁上編輯和合併等 Git 操作。',
    'will be used for web-based Git operations, e.g. edits and merges.': '將用於網頁上編輯和合併等 Git 操作。',
    'Your primary email was changed to': '你的主要電子郵件已變更為',
    '. Your default notification email address is still set to': '。你的預設通知電子郵件地址仍為',
    '. Would you like to update that as well?': '。要一併更新嗎？',
    'Yes, update my notification email': '是，更新我的通知電子郵件',

    // 备用电子邮件地址
    'Backup email address': '備用電子郵件地址',
    'Your backup GitHub email address will be used as an additional destination for security-relevant account notifications and can also be used for password resets.':
      '你的 GitHub 備用電子郵件地址將作為安全性相關帳號通知的額外收件地址，也可用於重設密碼。',
    'Allow all verified emails': '允許所有已驗證的電子郵件',
    'All verified emails can now be used for password resets.': '現在所有已驗證的電子郵件都可用於重設密碼。',
    'Only allow primary email': '僅允許主要電子郵件',
    'Only your primary email address can now be used for password resets.': '現在只有主要電子郵件地址可用於重設密碼。',

    // 电子邮件隐私：「We’ll remove your public profile email and use <noreply 地址> when performing …」
    // → 「我們將移除個人檔案中的公開電子郵件並使用 <noreply 地址> 來執行網頁上的 Git 操作…」（第一段原文无逗号）
    'Keep my email addresses private': '不公開我的電子郵件地址',
    'Keep my email address private': '不公開我的電子郵件地址',
    'We’ll remove your public profile email and use': '我們將移除個人檔案中的公開電子郵件並使用',
    "We'll remove your public profile email and use": '我們將移除個人檔案中的公開電子郵件並使用',
    'when performing web-based Git operations (e.g. edits and merges) and sending email on your behalf. If you want command line Git operations to use your private email you must':
      '來執行網頁上的 Git 操作（例如編輯和合併）和代你傳送電子郵件。如果要讓命令列 Git 操作使用不公開的電子郵件，你必須',
    'set your email in Git': '在 Git 中設定電子郵件',
    'Previously authored commits associated with a public email will remain public.': '先前使用公開電子郵件撰寫的提交將保持公開。',
    'Your primary email address is now public. To select which email to display on your profile, visit':
      '你的主要電子郵件地址現已公開。若要選擇在個人檔案中顯示哪個電子郵件，請前往',
    'profile settings.': '個人檔案設定。',
    'Your primary email address is now private. If you previously made your email public, we’ve removed it from your profile.':
      '你的主要電子郵件地址現已設為不公開。如果你先前公開過電子郵件，我們已將其從個人檔案中移除。',
    "Your primary email address is now private. If you previously made your email public, we've removed it from your profile.":
      '你的主要電子郵件地址現已設為不公開。如果你先前公開過電子郵件，我們已將其從個人檔案中移除。',

    // 阻止暴露电子邮件的命令行推送（block pushes → 阻擋推送，同 new/plans 的推送保护说明）
    'Block command line pushes that expose my email': '阻擋會暴露我電子郵件的命令列推送',
    "When you push to GitHub, we'll check the most recent commit. If the author email on that commit is a private email on your GitHub account, we will block the push and warn you about exposing your private email.":
      '推送到 GitHub 時，我們會檢查最新的提交。如果該提交的作者電子郵件是你 GitHub 帳號中不公開的電子郵件，我們會阻擋推送並警告你可能暴露不公開的電子郵件。',
    'When you push to GitHub, we’ll check the most recent commit. If the author email on that commit is a private email on your GitHub account, we will block the push and warn you about exposing your private email.':
      '推送到 GitHub 時，我們會檢查最新的提交。如果該提交的作者電子郵件是你 GitHub 帳號中不公開的電子郵件，我們會阻擋推送並警告你可能暴露不公開的電子郵件。',
    'Commits pushed with a private email will no longer be blocked.': '使用不公開的電子郵件推送的提交將不再受到阻擋。',
    'Commits pushed with a private email will now be blocked and you will see a warning.':
      '使用不公開的電子郵件推送的提交現在將受到阻擋，並會顯示警告。',

    // 电子邮件首选项与订阅首选项页
    'Email preferences': '電子郵件偏好設定',
    'Receive all emails, except those I unsubscribe from.': '接收所有電子郵件，已取消訂閱的除外。',
    "We'll occasionally contact you with the latest news and happenings from the GitHub Universe.":
      '我們會不定期向你傳送 GitHub 世界的最新資訊和動態。',
    'We’ll occasionally contact you with the latest news and happenings from the GitHub Universe.':
      '我們會不定期向你傳送 GitHub 世界的最新資訊和動態。',
    'Only receive account related emails, and those I subscribe to.': '只接收帳號相關電子郵件和我訂閱的電子郵件。',
    "We'll only send you legal or administrative emails, and any emails you've specifically subscribed to.":
      '我們只會向你傳送法律或行政相關的電子郵件和你特別訂閱的電子郵件。',
    'We’ll only send you legal or administrative emails, and any emails you’ve specifically subscribed to.':
      '我們只會向你傳送法律或行政相關的電子郵件和你特別訂閱的電子郵件。',
    'Save email preferences': '儲存電子郵件偏好設定',
    'Subscription preferences for': '訂閱偏好設定',
    '⏳Please wait while we find your subscriptions...⌛': '⏳正在尋找你的訂閱...⌛',
    'No subscriptions found': '找不到訂閱',
    'Save subscription preferences': '儲存訂閱偏好設定',
    'Back to email settings': '返回電子郵件設定',
    // 原文按钮名没有引号，译文不加
    "To stop receiving emails for the topics below, uncheck any topics you don't want to receive, then click Save subscription preferences":
      '若要停止接收以下主題的電子郵件，請取消勾選不想接收的主題，然後按一下儲存訂閱偏好設定',
    'To stop receiving emails for the topics below, uncheck any topics you don’t want to receive, then click Save subscription preferences':
      '若要停止接收以下主題的電子郵件，請取消勾選不想接收的主題，然後按一下儲存訂閱偏好設定',
    'General info and offers from GitHub': '來自 GitHub 的一般資訊和優惠',
    'Unsubscribe from all topics': '取消訂閱所有主題'
  },
  scoped: {
    // 电子邮件标签
    Primary: '主要',
    Backup: '備用'
  },
  regexp: [
    [
      // 句号随原文；「e.g. edits and merges」作「編輯和合併等」，不加括号
      new RegExp(
        `^Emails you can use to sign in to your account\\. Your emails will not be used as the ['‘]from['’] address for web-based Git operations, e\\.g\\. edits and merges\\. All web-based Git operations will be linked to ${EMAIL}(\\.?)$`
      ),
      (_, email: string, dot: string) =>
        `可用來登入帳號的電子郵件。你的電子郵件不會作為網頁上編輯和合併等 Git 操作的「寄件者」地址。所有網頁上的 Git 操作都會連結到 ${email}${dot ? '。' : ''}`
    ],
    [
      new RegExp(`^We sent a verification email to ${EMAIL}\\. Please follow the instructions in it\\.$`),
      '我們已傳送驗證電子郵件至 $1。請依照其中的說明操作。'
    ],
    [new RegExp(`^Your primary email was changed to ${EMAIL}\\.$`), '你的主要電子郵件已變更為 $1。'],
    [
      new RegExp(
        `^Because you have email privacy enabled, ${EMAIL} will be used for account-related notifications as well as password resets\\. ${EMAIL} will be used for web-based Git operations, e\\.g\\.,? edits and merges\\.$`
      ),
      '由於你已啟用電子郵件隱私，$1 將用於帳號相關通知和重設密碼。$2 將用於網頁上編輯和合併等 Git 操作。'
    ],
    [new RegExp(`^Removed email ${EMAIL} from your account\\.$`), '已從你的帳號中移除電子郵件 $1。'],
    [new RegExp(`^Subscription preferences for ${EMAIL}$`), '$1 的訂閱偏好設定'],
    // 电子邮件列表中每行的菜单按钮与删除按钮（无障碍名称）
    [new RegExp(`^Manage email ${EMAIL}$`), '管理電子郵件 $1'],
    [new RegExp(`^Delete ${EMAIL}$`), '刪除 $1'],
    // 断开 Google / Apple 连接的确认对话框（social identity provider → 社群身分識別提供者）
    [
      new RegExp(
        `^This will disconnect ${EMAIL} from your social identity provider\\. You will no longer be able to use it as a password alternative\\.$`
      ),
      '這將中斷 $1 與社群身分識別提供者的連接。你將無法再用它代替密碼。'
    ],
    // 添加电子邮件失败的提示：原因未收录时保留原文
    [
      new RegExp(`^Error adding ${EMAIL}: (.+)$`),
      (_, email: string, reason: string) => `新增 ${email} 時發生錯誤：${ADD_EMAIL_ERRORS.get(reason) ?? reason}`
    ]
  ]
} satisfies PageDictionary
