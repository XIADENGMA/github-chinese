import type { PageDictionary } from '../../../core/types'

const EMAIL = '(\\S+@\\S+?)'

/** 添加电子邮件失败的原因（“Error adding foo@example.com: email is already in use”）；用 Map 避免命中原型链键 */
const ADD_EMAIL_ERRORS: ReadonlyMap<string, string> = new Map([
  ['email is already in use', '电子邮件已被使用'],
  ['Email is already in use', '电子邮件已被使用'],
  ['email is invalid', '电子邮件无效'],
  ['Email is invalid', '电子邮件无效'],
])

/**
 * 电子邮件（/settings/emails）：电子邮件列表与标签、添加电子邮件、主要电子邮件地址、备用电子邮件地址、电子邮件隐私、阻止暴露电子邮件的推送、
 * 电子邮件首选项，以及订阅首选项页（/settings/emails/subscriptions）。电子邮件地址在 <strong> 等元素中时按片段收录。
 */
export default {
  static: {
    // 页头说明（原文无逗号、括号，译文不加：“e.g. edits and merges” 作“编辑和合并等”）
    'You have a single verified email associated with your GitHub account. Add an additional verified email address in case you lose access to your primary email.':
      '你的 GitHub 帐户只关联了一个已验证电子邮件。请再添加一个已验证电子邮件地址以防无法访问主要电子邮件地址。',
    'Emails you can use to sign in to your account. Verified emails can be used as the author or committer addresses for web-based Git operations, e.g. edits and merges.':
      '可用于登录帐户的电子邮件。已验证电子邮件可用作编辑和合并等网页端 Git 操作的作者或提交者地址。',

    // 电子邮件列表
    'Visible in emails': '在电子邮件中可见',
    'Not visible in emails': '在电子邮件中不可见',
    'Receives notifications': '接收通知',
    'Not receiving notifications': '不接收通知',
    'This email address is the default for GitHub notifications, such as replies to issues, pull requests, and similar activity.':
      '此电子邮件地址是对议题、拉取请求的回复及类似活动等 GitHub 通知的默认地址。',
    'This email will be used for account-related notifications and can also be used for password resets.':
      '此电子邮件将用于帐户相关通知并可用于重置密码。',
    "This email will not be used as the 'from' address for web-based Git operations.":
      '此电子邮件不会用作网页端 Git 操作的“发件人”地址。',
    'This email will not be used as the ‘from’ address for web-based Git operations.':
      '此电子邮件不会用作网页端 Git 操作的“发件人”地址。',
    'Unverified email addresses cannot receive notifications or be used to reset your password.':
      '未验证的电子邮件地址无法接收通知或用于重置密码。',
    'Manage email preferences': '管理电子邮件首选项',
    'Resend verification email': '重新发送验证电子邮件',
    'Delete email address': '删除电子邮件地址',
    'Remove email address': '移除电子邮件地址',
    'Are you sure you want to remove this email from your account? Once removed, commits attributed to this email address will no longer be associated with your account.':
      '确定要从帐户中移除此电子邮件吗？移除后，归属于此电子邮件地址的提交将不再与你的帐户关联。',
    'Are you sure you want to remove this email from your account? Once removed, commits attributed to this email address will no longer be associated with your account. One of your other emails will become your primary address.':
      '确定要从帐户中移除此电子邮件吗？移除后，归属于此电子邮件地址的提交将不再与你的帐户关联。你的其他电子邮件之一将成为主要电子邮件地址。',
    'Are you sure you want to remove this email from your account? Once removed, commits attributed to this email address will no longer be associated with your account. Removing your backup email will allow all verified emails to be used for password resets.':
      '确定要从帐户中移除此电子邮件吗？移除后，归属于此电子邮件地址的提交将不再与你的帐户关联。移除备用电子邮件地址后所有已验证电子邮件都可用于重置密码。',
    'At least one email is required.': '至少需要一个电子邮件。',
    'At least one verified email is required.': '至少需要一个已验证电子邮件。',
    // 删除按钮不可用时的提示与无障碍名称
    'At least one non-backup email is required.': '至少需要一个非备用电子邮件地址。',
    'Delete: At least one non-backup email is required.': '删除：至少需要一个非备用电子邮件地址。',
    // 通过 Google / Apple 登录连接的电子邮件（connect → 连接）
    'Connected to Google': '已连接 Google',
    'Connected to Apple': '已连接 Apple',
    'Disconnect from Google': '断开与 Google 的连接',
    'Disconnect from Apple': '断开与 Apple 的连接',
    'You must set a password first before you can disconnect this email from its identity provider.':
      '你必须先设置密码才能断开此电子邮件与其标识提供者的连接。',

    // 添加电子邮件、主要电子邮件地址
    'Add email address': '添加电子邮件地址',
    'Email address': '电子邮件地址',
    'Primary email address': '主要电子邮件地址',
    // 旧版说明
    'Your primary email address will be used for account-related notifications (e.g. account changes and billing receipts) as well as any web-based GitHub operations (e.g. edits and merges).':
      '你的主要电子邮件地址将用于帐户相关通知（如帐户变更和账单收据）以及所有网页端 GitHub 操作（如编辑和合并）。',
    'Select an email to be used for account-related notifications and can be used for password reset.':
      '选择用于帐户相关通知并可用于重置密码的电子邮件。',
    'Select email to become primary': '选择要设为主要电子邮件地址的电子邮件',
    'Select email to become backup': '选择要设为备用电子邮件地址的电子邮件',
    // 已启用电子邮件隐私时的说明：两个电子邮件地址在 <strong> 中
    'Because you have email privacy enabled,': '由于你已启用电子邮件隐私，',
    'will be used for account-related notifications as well as password resets.': '将用于帐户相关通知和重置密码。',
    'will be used for web-based Git operations, e.g., edits and merges.': '将用于编辑和合并等网页端 Git 操作。',
    'will be used for web-based Git operations, e.g. edits and merges.': '将用于编辑和合并等网页端 Git 操作。',
    'Your primary email was changed to': '你的主要电子邮件地址已更改为',
    '. Your default notification email address is still set to': '。你的默认通知电子邮件地址仍为',
    '. Would you like to update that as well?': '。是否也要更新它？',
    'Yes, update my notification email': '是，更新我的通知电子邮件',

    // 备用电子邮件地址
    'Backup email address': '备用电子邮件地址',
    'Your backup GitHub email address will be used as an additional destination for security-relevant account notifications and can also be used for password resets.':
      '你的 GitHub 备用电子邮件地址将作为接收安全相关帐户通知的附加地址并可用于重置密码。',
    'Allow all verified emails': '允许所有已验证电子邮件',
    'All verified emails can now be used for password resets.': '现在所有已验证电子邮件都可用于重置密码。',
    'Only allow primary email': '仅允许主要电子邮件地址',
    'Only your primary email address can now be used for password resets.': '现在只有主要电子邮件地址可用于重置密码。',

    // 电子邮件隐私：「We’ll remove your public profile email and use <noreply 地址> when performing …」
    'Keep my email addresses private': '对我的电子邮件地址保密',
    'Keep my email address private': '对我的电子邮件地址保密',
    'We’ll remove your public profile email and use': '我们将移除个人资料中的公开电子邮件并使用',
    "We'll remove your public profile email and use": '我们将移除个人资料中的公开电子邮件并使用',
    'when performing web-based Git operations (e.g. edits and merges) and sending email on your behalf. If you want command line Git operations to use your private email you must':
      '执行网页端 Git 操作（如编辑和合并）和代你发送电子邮件。如果希望命令行 Git 操作使用你的私密电子邮件则必须',
    'set your email in Git': '在 Git 中设置电子邮件',
    'Previously authored commits associated with a public email will remain public.':
      '之前使用公开电子邮件创作的提交将保持公开。',
    'Your primary email address is now public. To select which email to display on your profile, visit':
      '你的主要电子邮件地址现已公开。要选择在个人资料中显示哪个电子邮件，请前往',
    'profile settings.': '个人资料设置。',
    'Your primary email address is now private. If you previously made your email public, we’ve removed it from your profile.':
      '你的主要电子邮件地址现已设为私密。如果你之前公开过电子邮件，我们已将其从个人资料中移除。',
    "Your primary email address is now private. If you previously made your email public, we've removed it from your profile.":
      '你的主要电子邮件地址现已设为私密。如果你之前公开过电子邮件，我们已将其从个人资料中移除。',

    // 阻止暴露电子邮件的命令行推送
    'Block command line pushes that expose my email': '阻止会暴露我电子邮件的命令行推送',
    "When you push to GitHub, we'll check the most recent commit. If the author email on that commit is a private email on your GitHub account, we will block the push and warn you about exposing your private email.":
      '推送到 GitHub 时，我们会检查最新的提交。如果该提交的作者电子邮件是你 GitHub 帐户中的私密电子邮件，我们将阻止推送并提醒你可能暴露私密电子邮件。',
    'When you push to GitHub, we’ll check the most recent commit. If the author email on that commit is a private email on your GitHub account, we will block the push and warn you about exposing your private email.':
      '推送到 GitHub 时，我们会检查最新的提交。如果该提交的作者电子邮件是你 GitHub 帐户中的私密电子邮件，我们将阻止推送并提醒你可能暴露私密电子邮件。',
    'Commits pushed with a private email will no longer be blocked.': '使用私密电子邮件推送的提交将不再被阻止。',
    'Commits pushed with a private email will now be blocked and you will see a warning.':
      '使用私密电子邮件推送的提交现在将被阻止并显示警告。',

    // 电子邮件首选项与订阅首选项页
    'Email preferences': '电子邮件首选项',
    'Receive all emails, except those I unsubscribe from.': '接收所有电子邮件，已取消订阅的除外。',
    "We'll occasionally contact you with the latest news and happenings from the GitHub Universe.":
      '我们会不定期向你发送 GitHub 世界的最新消息和动态。',
    'We’ll occasionally contact you with the latest news and happenings from the GitHub Universe.':
      '我们会不定期向你发送 GitHub 世界的最新消息和动态。',
    'Only receive account related emails, and those I subscribe to.': '仅接收帐户相关电子邮件和我订阅的电子邮件。',
    "We'll only send you legal or administrative emails, and any emails you've specifically subscribed to.":
      '我们只会向你发送法律或管理类电子邮件，以及你专门订阅的电子邮件。',
    'We’ll only send you legal or administrative emails, and any emails you’ve specifically subscribed to.':
      '我们只会向你发送法律或管理类电子邮件，以及你专门订阅的电子邮件。',
    'Save email preferences': '保存电子邮件首选项',
    'Subscription preferences for': '订阅首选项',
    '⏳Please wait while we find your subscriptions...⌛': '⏳正在查找你的订阅...⌛',
    'No subscriptions found': '未找到订阅',
    'Save subscription preferences': '保存订阅首选项',
    'Back to email settings': '返回电子邮件设置',
    "To stop receiving emails for the topics below, uncheck any topics you don't want to receive, then click Save subscription preferences":
      '要停止接收以下主题的电子邮件，请取消勾选不想接收的主题，然后单击保存订阅首选项',
    'To stop receiving emails for the topics below, uncheck any topics you don’t want to receive, then click Save subscription preferences':
      '要停止接收以下主题的电子邮件，请取消勾选不想接收的主题，然后单击保存订阅首选项',
    'General info and offers from GitHub': '来自 GitHub 的一般信息和优惠',
    'Unsubscribe from all topics': '取消订阅所有主题',
  },
  scoped: {
    // 电子邮件标签
    Primary: '主要',
    Backup: '备用',
  },
  regexp: [
    [
      // 句号随原文；“e.g. edits and merges” 作“编辑和合并等”，不加括号
      new RegExp(
        `^Emails you can use to sign in to your account\\. Your emails will not be used as the ['‘]from['’] address for web-based Git operations, e\\.g\\. edits and merges\\. All web-based Git operations will be linked to ${EMAIL}(\\.?)$`,
      ),
      (_, email: string, dot: string) =>
        `可用于登录帐户的电子邮件。这些电子邮件不会用作编辑和合并等网页端 Git 操作的“发件人”地址。所有网页端 Git 操作都将关联到 ${email}${dot ? '。' : ''}`,
    ],
    [
      new RegExp(`^We sent a verification email to ${EMAIL}\\. Please follow the instructions in it\\.$`),
      '已向 $1 发送验证电子邮件。请按照其中的说明操作。',
    ],
    [new RegExp(`^Your primary email was changed to ${EMAIL}\\.$`), '你的主要电子邮件地址已更改为 $1。'],
    [
      new RegExp(
        `^Because you have email privacy enabled, ${EMAIL} will be used for account-related notifications as well as password resets\\. ${EMAIL} will be used for web-based Git operations, e\\.g\\.,? edits and merges\\.$`,
      ),
      '由于你已启用电子邮件隐私，$1 将用于帐户相关通知和重置密码。$2 将用于编辑和合并等网页端 Git 操作。',
    ],
    [new RegExp(`^Removed email ${EMAIL} from your account\\.$`), '已从你的帐户中移除电子邮件 $1。'],
    [new RegExp(`^Subscription preferences for ${EMAIL}$`), '$1 的订阅首选项'],
    // 电子邮件列表中每行的菜单按钮与删除按钮（无障碍名称）
    [new RegExp(`^Manage email ${EMAIL}$`), '管理电子邮件 $1'],
    [new RegExp(`^Delete ${EMAIL}$`), '删除 $1'],
    // 断开 Google / Apple 连接的确认对话框
    [
      new RegExp(
        `^This will disconnect ${EMAIL} from your social identity provider\\. You will no longer be able to use it as a password alternative\\.$`,
      ),
      '这将断开 $1 与社交标识提供者的连接。你将无法再用它代替密码登录。',
    ],
    // 添加电子邮件失败的提示：原因未收录时保留原文
    [
      new RegExp(`^Error adding ${EMAIL}: (.+)$`),
      (_, email: string, reason: string) => `添加 ${email} 时出错：${ADD_EMAIL_ERRORS.get(reason) ?? reason}`,
    ],
  ],
} satisfies PageDictionary
