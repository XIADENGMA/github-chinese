import type { PageDictionary, RegExpRule } from '../../../core/types'
import { DATE_SOURCE, joinCjk, translateTime } from '../helpers'

/** 签名弹层无障碍名称中的验证状态（小写，下划线已替换为空格） */
const VERIFICATION_STATES: Readonly<Record<string, string>> = {
  verified: '已验证',
  unverified: '未验证',
  'partially verified': '部分验证',
}

/** 提交消息中关闭关键字的提示：This commit closes issue #12. */
const CLOSE_TARGETS: Readonly<Record<string, string>> = {
  issue: '议题',
  'pull request': '拉取请求',
}

/** 引用：#12 或 owner/repo#12 */
const ISSUE_REF_SOURCE = '(?:[\\w.-]+\\/[\\w.-]+)?#\\d+'

const regexp: readonly RegExpRule[] = [
  // 日期分组标题：Commits on Jan 5, 2024
  [new RegExp(`^Commits on (${DATE_SOURCE})$`), (_, date: string) => joinCjk(translateTime(date), '的提交')],
  // 提交行操作
  [/^Copy full SHA for ([0-9a-f]{7,40})$/, '复制 $1 的完整 SHA'],
  [
    /^(Show|Hide) description for ([0-9a-f]{7,40})$/,
    (_, action: string, sha: string) => `${action === 'Show' ? '显示' : '隐藏'} ${sha} 的描述`,
  ],
  [/^View (\d+) commit comments?$/, '查看 $1 条提交评论'],
  // 多个作者：按钮文字、无障碍名称、对话框标题
  [/^(\d+) people$/, '$1 人'],
  [/^Show (\d+) authors$/, '显示 $1 个作者'],
  [/^(\d+) authors$/, '$1 个作者'],
  // 组织作者链接：octo-org's org home page
  [/^([\w.-]+)['’]s org home page$/, '$1 的组织主页'],
  // 提交消息中的关闭关键字提示：This commit closes issue #12.
  [
    new RegExp(`^This commit (?:closes|fixes|resolves) (issue|pull request) (${ISSUE_REF_SOURCE})\\.$`),
    (_, target: string, ref: string) => `此提交关闭${CLOSE_TARGETS[target] ?? target} ${ref}。`,
  ],
  // 文件历史记录：标签页标题段、重命名提示
  [/^History for (.+) - ([\w.-]+\/[\w.-]+)$/, '$1 的历史记录 - $2'],
  [/^Renamed to (\S.*)$/, '已重命名为 $1'],
  [/^Renamed from (\S.*)$/, '重命名自 $1'],
  // 签名弹层的无障碍名称：verified: 0ff253b
  [
    /^(verified|unverified|partially verified): ([0-9a-f]{7})$/,
    (_, state: string, sha: string) => `${VERIFICATION_STATES[state] ?? state}：${sha}`,
  ],
  [/^Verification error: ([0-9a-f]{7})$/, '验证错误：$1'],
  // 签名弹层：<上传你的 GPG 签名公钥> 以验证你的签名。
  [/^Upload your public signing (GPG|SSH) key$/, '上传你的 $1 签名公钥'],
  // 部分验证：<用户> 的贡献已通过 SSH 密钥验证。
  [/^['’]s contribution has been verified via (GPG|SSH|S\/MIME) key\.$/, '的贡献已通过 $1 密钥验证。'],
  // 提交回顾：提交组的规模标签（size: M）
  [/^size: (XS|S|M|L|XL)$/, '规模：$1'],
  // 筛选结果播报
  [/^(\d[\d,]*) results?$/, '$1 个结果'],
  // 提交行的无障碍名称：<提交消息>. More information available below.
  [/^(\S.*)\. More information available below\.$/, '$1。更多信息见下方。'],
]

/**
 * 提交历史记录列表（/commits/<分支>、文件历史记录）：筛选栏、日期分组、提交行与作者、签名弹层、
 * 空状态、提交回顾（Copilot）。经典比较页的提交列表共用这些文字。
 * 检查弹层见 checks.ts 与 check-summary.ts，日期范围选择器见 date-picker.ts。
 */
export default {
  static: {
    // 页头与筛选栏（屏幕阅读器标题）
    'Commit history': '提交历史记录',
    'Branch selector': '分支选择器',
    'User selector': '用户选择器',
    Datepicker: '日期选择器',
    'All users': '所有用户',
    'All time': '全部时间',
    'View commits for all users': '查看所有用户的提交',
    'Find a user...': '查找用户...',
    'Find a user…': '查找用户…',
    'Loading users...': '正在加载用户...',
    'Loading users…': '正在加载用户…',
    'Could not load users': '无法加载用户',
    'Filter on author': '按作者筛选',
    // 文件历史记录标题：历史记录 <路径> 位于 <分支>
    'History for': '历史记录',
    '(Browse history)': '（浏览历史记录）',
    'End of commit history for this file': '此文件的提交历史记录到此为止',

    // 提交行
    'View commit details': '查看提交详细信息',
    'Browse repository at this point': '浏览此提交时的存储库',
    'Browse the repository at this point in the history': '浏览历史记录中此时间点的存储库',
    'View code at this point': '查看此提交时的代码',
    'Copy the full SHA': '复制完整 SHA',
    'View checks': '查看检查',
    'Configuration menu': '配置菜单',
    'Load more commits': '加载更多提交',
    'Commit message body': '提交消息正文',
    // 作者行：<作者> 编写并由 <提交者> 提交于 <时间>
    'authored and': '编写并由',
    'and pushed': '并推送于',
    'on behalf of': '代表',
    'pushed by': '推送者',

    // 空状态与错误
    "There isn't any commit history to show here": '这里没有可显示的提交历史记录',
    "There isn't any commit history to show here.": '这里没有可显示的提交历史记录。',
    'There isn’t any commit history to show here.': '这里没有可显示的提交历史记录。',
    'There isn’t any commit history to show here': '这里没有可显示的提交历史记录',
    "There isn't any commit history to show here for the selected date range": '所选日期范围内没有可显示的提交历史记录',
    'There isn’t any commit history to show here for the selected date range': '所选日期范围内没有可显示的提交历史记录',
    'No commits history': '没有提交历史记录',
    'Commit history cannot be loaded': '无法加载提交历史记录',
    'Try reloading the page, or if the problem persists, view the history locally using this command:':
      '请重新加载页面；如果问题仍然存在，请使用以下命令在本地查看历史记录：',
    'View commit history locally command': '在本地查看提交历史记录的命令',
    // 看到意外内容？请查看 <GitHub 提交指南>.
    'Seeing something unexpected? Take a look at the': '看到意外内容？请查看',
    'GitHub commits guide': 'GitHub 提交指南',

    // 提交回顾（Copilot）；原文无逗号，译文不加
    'Commit recap': '提交回顾',
    'Close commit recap': '关闭提交回顾',
    'Introducing the commit recap': '全新的提交回顾',
    'Groups together commits to cut through noise with summarized changes and linked pull requests.':
      '将提交分组并通过汇总的更改和链接的拉取请求过滤无关信息。',
    'Analyzing recent commits...': '正在分析最近的提交...',
    'Analyzing recent commits…': '正在分析最近的提交…',
    'Analyzing…': '分析中…',
    'Analyzing...': '分析中...',
    'Failed to generate commit recap': '生成提交回顾失败',
    // 两句原文用句号分开，译文不并成逗号句
    'AI-generated content may be inaccurate. Please verify important information.':
      'AI 生成的内容可能不准确。请核实重要信息。',
    // 提交反馈后：谢谢。我们正在开发此功能并期待你的 <详细反馈>！（原文无逗号，译文不加）
    'Thank you. This feature is under development and': '谢谢。我们正在开发此功能并期待你的',
    'detailed feedback': '详细反馈',
    'is appreciated!': '！',

    // 签名弹层（React 与经典版）；原文无逗号，译文不加；产品名译中文：GitHub Enterprise Server → GitHub 企业服务器
    'This commit was created on GitHub.com and signed with GitHub’s': '此提交在 GitHub.com 上创建并使用 GitHub 的',
    "This commit was created on GitHub.com and signed with GitHub's": '此提交在 GitHub.com 上创建并使用 GitHub 的',
    'This commit was created on GitHub Enterprise Server and signed with a': '此提交在 GitHub 企业服务器上创建并使用',
    'This commit was signed with the committer’s': '此提交使用提交者的',
    "This commit was signed with the committer's": '此提交使用提交者的',
    'verified signature': '已验证签名',
    "This commit was signed with a verified signature, though we're still working on certificate revocation checking.":
      '此提交使用已验证签名签署，但证书吊销检查仍在进行中。',
    'This commit was signed with a verified signature, though we’re still working on certificate revocation checking.':
      '此提交使用已验证签名签署，但证书吊销检查仍在进行中。',
    '. The key has expired.': '。该密钥已过期。',
    '. The key has been revoked.': '。该密钥已被撤销。',
    '. The key has expired and has been revoked.': '。该密钥已过期并已被撤销。',
    'The key has expired.': '该密钥已过期。',
    'The key has expired': '该密钥已过期',
    'and has been revoked': '且已被撤销',
    'The key has been revoked.': '该密钥已被撤销。',
    'GPG Key ID:': 'GPG 密钥 ID：',
    'GPG key ID:': 'GPG 密钥 ID：',
    'SSH Key Fingerprint:': 'SSH 密钥指纹：',
    'SSH key Fingerprint:': 'SSH 密钥指纹：',
    'SSH key fingerprint:': 'SSH 密钥指纹：',
    'Certificate subject': '证书主体',
    'Certificate issuer': '证书颁发者',
    'Learn about vigilant mode': '了解警戒模式',
    'Verification error': '验证错误',
    'Verification status not available': '验证状态不可用',
    'The commit signature verification service is not available': '提交签名验证服务不可用',
    'The signature in this commit could not be verified. Someone may be trying to trick you.':
      '无法验证此提交中的签名。可能有人试图欺骗你。',
    'We were unable to parse the signature in this commit.': '无法解析此提交中的签名。',
    "GitHub supports GPG and S/MIME signatures. We don't know what type of signature this is.":
      'GitHub 支持 GPG 和 S/MIME 签名。无法识别此签名的类型。',
    'GitHub supports GPG and S/MIME signatures. We don’t know what type of signature this is.':
      'GitHub 支持 GPG 和 S/MIME 签名。无法识别此签名的类型。',
    'to verify your signature.': '以验证你的签名。',
    'This user has not yet uploaded their public signing key.': '此用户尚未上传签名公钥。',
    'The email in this signature doesn’t match the committer email.': '此签名中的电子邮件与提交者电子邮件不匹配。',
    "The email in this signature doesn't match the committer email.": '此签名中的电子邮件与提交者电子邮件不匹配。',
    'Verify your email address': '验证你的电子邮件地址',
    'The committer email address is not verified.': '提交者电子邮件地址未验证。',
    'No user is associated with the committer email.': '没有与提交者电子邮件关联的用户。',
    // 「X. Please try again later.」句号随原文（与 common-ui、actions 一致）
    'We had a problem verifying this signature. Please try again later.': '验证此签名时出现问题。请稍后重试。',
    "The key that signed this doesn't have usage flags that allow signing.": '签署此内容的密钥没有允许签名的用途标志。',
    'The key that signed this doesn’t have usage flags that allow signing.': '签署此内容的密钥没有允许签名的用途标志。',
    'The key that signed this is expired.': '签署此内容的密钥已过期。',
    'We had a problem checking for revoked certificates. Please try again later.':
      '检查已吊销证书时出现问题。请稍后重试。',
    'One or more certificates in the chain has been revoked.': '证书链中有一个或多个证书已被吊销。',
    'The signing certificate or its chain could not be verified.': '无法验证签名证书或其证书链。',
    'We were unable to verify this signature.': '无法验证此签名。',
    'This commit is not signed, but one or more authors requires that any commit attributed to them is signed.':
      '此提交未签名，但一个或多个作者要求归属于他们的所有提交都必须签名。',
    'We cannot verify signatures from co-authors, and some of the co-authors attributed to this commit require their commits to be signed.':
      '无法验证共同作者的签名，而此提交的部分共同作者要求其提交必须签名。',
    // 在场证明（Proof of presence）
    'Proof of presence': '在场证明',
    'proof of presence': '在场证明',
    Authenticated: '已通过身份验证',
    'An unavailable user': '不可用的用户',
    // <用户> 对此提交进行身份验证的方式为 <在场证明>
    'authenticated this commit with': '对此提交进行身份验证的方式为',
    'Completed on': '完成于',
  },
  scoped: {
    // 作者行动词：<用户> 推送于 <时间>（编写于、提交于由 common-ui 收录）
    pushed: '推送于',
    // 文件历史记录：历史记录 <路径> 位于 <分支>
    on: '位于',
    'Nothing to show': '暂无内容',
    // 提交行菜单：复制完整 SHA <0ff253b>（SHA 在单独的元素中）
    'Copy full SHA for': '复制完整 SHA',
    'Copy full SHA': '复制完整 SHA',
    // 提交回顾：规模 <M>
    'size:': '规模：',
    // 签名徽章（Verified、Unverified、Partially verified、Expired 由 common-ui 收录）
    Revoked: '已撤销',
    // 签名对话框的屏幕阅读器标题（验证状态原值）
    verified: '已验证',
    unverified: '未验证',
    partially_verified: '部分验证',
  },
  regexp,
  ignore: [
    // 提交历史的“History for”面包屑：存储库名与路径段是用户内容（documentation 等目录名会撞上全局词条）
    '[data-component="Breadcrumbs"] [data-component="Breadcrumbs.Item"]',
  ],
} satisfies PageDictionary
