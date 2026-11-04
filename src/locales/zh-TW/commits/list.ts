import type { PageDictionary, RegExpRule } from '../../../core/types'
import { DATE_SOURCE, joinCjk, translateTime } from '../helpers'

/** 签名弹层无障碍名称中的验证状态（小写，下划线已替换为空格） */
const VERIFICATION_STATES: Readonly<Record<string, string>> = {
  verified: '已驗證',
  unverified: '未驗證',
  'partially verified': '部分驗證'
}

/** 提交消息中关闭关键字的提示：This commit closes issue #12. */
const CLOSE_TARGETS: Readonly<Record<string, string>> = {
  issue: '議題',
  'pull request': '拉取請求'
}

/** 引用：#12 或 owner/repo#12 */
const ISSUE_REF_SOURCE = '(?:[\\w.-]+\\/[\\w.-]+)?#\\d+'

const regexp: readonly RegExpRule[] = [
  // 日期分组标题：Commits on Jan 5, 2024
  [new RegExp(`^Commits on (${DATE_SOURCE})$`), (_, date: string) => joinCjk(translateTime(date), '的提交')],
  // 提交行操作
  [/^Copy full SHA for ([0-9a-f]{7,40})$/, '複製 $1 的完整 SHA'],
  [
    /^(Show|Hide) description for ([0-9a-f]{7,40})$/,
    (_, action: string, sha: string) => `${action === 'Show' ? '顯示' : '隱藏'} ${sha} 的描述`
  ],
  [/^View (\d+) commit comments?$/, '查看 $1 則提交留言'],
  // 多个作者：按钮文字、无障碍名称、对话框标题（作者是人，量词作「位」）
  [/^(\d+) people$/, '$1 人'],
  [/^Show (\d+) authors$/, '顯示 $1 位作者'],
  [/^(\d+) authors$/, '$1 位作者'],
  // 组织作者链接：octo-org's org home page
  [/^([\w.-]+)['’]s org home page$/, '$1 的組織首頁'],
  // 提交消息中的关闭关键字提示：This commit closes issue #12.
  [
    new RegExp(`^This commit (?:closes|fixes|resolves) (issue|pull request) (${ISSUE_REF_SOURCE})\\.$`),
    (_, target: string, ref: string) => `此提交會關閉${CLOSE_TARGETS[target] ?? target} ${ref}。`
  ],
  // 文件历史记录：标签页标题段、重命名提示
  [/^History for (.+) - ([\w.-]+\/[\w.-]+)$/, '$1 的歷史記錄 - $2'],
  [/^Renamed to (\S.*)$/, '已重新命名為 $1'],
  [/^Renamed from (\S.*)$/, '重新命名自 $1'],
  // 签名弹层的无障碍名称：verified: 0ff253b
  [
    /^(verified|unverified|partially verified): ([0-9a-f]{7})$/,
    (_, state: string, sha: string) => `${VERIFICATION_STATES[state] ?? state}：${sha}`
  ],
  [/^Verification error: ([0-9a-f]{7})$/, '驗證錯誤：$1'],
  // 签名弹层：<上傳你的 GPG 公開簽署金鑰> 以驗證你的簽章。
  [/^Upload your public signing (GPG|SSH) key$/, '上傳你的 $1 公開簽署金鑰'],
  // 部分验证：<用户> 的貢獻已透過 SSH 金鑰驗證。
  [/^['’]s contribution has been verified via (GPG|SSH|S\/MIME) key\.$/, '的貢獻已透過 $1 金鑰驗證。'],
  // 提交回顾：提交组的大小标签（size: M）
  [/^size: (XS|S|M|L|XL)$/, '大小：$1'],
  // 筛选结果播报（结果量词作「項」）
  [/^(\d[\d,]*) results?$/, '$1 項結果'],
  // 提交行的无障碍名称：<提交消息>. More information available below.
  [/^(\S.*)\. More information available below\.$/, '$1。下方有更多資訊。']
]

/**
 * 提交历史记录列表（/commits/<分支>、文件历史记录）：筛选栏、日期分组、提交行与作者、签名弹层、
 * 空状态、提交回顾（Copilot）。经典比较页的提交列表共用这些文字。
 * 检查弹层见 checks.ts 与 check-summary.ts，日期范围选择器见 date-picker.ts。
 */
export default {
  static: {
    // 页头与筛选栏（屏幕阅读器标题）
    'Commit history': '提交歷史記錄',
    'Branch selector': '分支選擇器',
    'User selector': '使用者選擇器',
    Datepicker: '日期選擇器',
    'All users': '所有使用者',
    // All time 取 Chromium 繁中「不限時間」，与 activity.ts 的时间范围一致
    'All time': '不限時間',
    'View commits for all users': '查看所有使用者的提交',
    'Find a user...': '尋找使用者...',
    'Find a user…': '尋找使用者…',
    'Loading users...': '正在載入使用者...',
    'Loading users…': '正在載入使用者…',
    'Could not load users': '無法載入使用者',
    'Filter on author': '依作者篩選',
    // 文件历史记录标题：歷史記錄 <路径> 位於 <分支>
    'History for': '歷史記錄',
    '(Browse history)': '（瀏覽歷史記錄）',
    'End of commit history for this file': '此檔案的提交歷史記錄到此為止',

    // 提交行
    'View commit details': '查看提交詳細資料',
    'Browse repository at this point': '瀏覽此提交時的儲存庫',
    'Browse the repository at this point in the history': '瀏覽歷史記錄中此時間點的儲存庫',
    'View code at this point': '查看此提交時的程式碼',
    'Copy the full SHA': '複製完整 SHA',
    'View checks': '查看檢查',
    'Configuration menu': '設定選單',
    'Load more commits': '載入更多提交',
    'Commit message body': '提交訊息內文',
    // 作者行：<作者> 撰寫並由 <提交者> 提交於 <时间>
    'authored and': '撰寫並由',
    'and pushed': '並推送於',
    'on behalf of': '代表',
    'pushed by': '推送者',

    // 空状态与错误
    "There isn't any commit history to show here": '這裡沒有可顯示的提交歷史記錄',
    "There isn't any commit history to show here.": '這裡沒有可顯示的提交歷史記錄。',
    'There isn’t any commit history to show here.': '這裡沒有可顯示的提交歷史記錄。',
    'There isn’t any commit history to show here': '這裡沒有可顯示的提交歷史記錄',
    "There isn't any commit history to show here for the selected date range": '所選日期範圍內沒有可顯示的提交歷史記錄',
    'There isn’t any commit history to show here for the selected date range': '所選日期範圍內沒有可顯示的提交歷史記錄',
    'No commits history': '沒有提交歷史記錄',
    'Commit history cannot be loaded': '無法載入提交歷史記錄',
    'Try reloading the page, or if the problem persists, view the history locally using this command:':
      '請嘗試重新載入頁面，若問題持續發生，請使用以下命令在本機查看歷史記錄：',
    'View commit history locally command': '在本機查看提交歷史記錄的命令',
    // 看到非預期的內容？請參閱 <GitHub 提交指南>.
    'Seeing something unexpected? Take a look at the': '看到非預期的內容？請參閱',
    'GitHub commits guide': 'GitHub 提交指南',

    // 提交回顾（Copilot）；原文无逗号，译文不加
    'Commit recap': '提交回顧',
    'Close commit recap': '關閉提交回顧',
    'Introducing the commit recap': '全新的提交回顧',
    'Groups together commits to cut through noise with summarized changes and linked pull requests.':
      '將提交分組並以變更摘要和已連結的拉取請求過濾雜訊。',
    'Analyzing recent commits...': '正在分析最近的提交...',
    'Analyzing recent commits…': '正在分析最近的提交…',
    'Analyzing…': '分析中…',
    'Analyzing...': '分析中...',
    'Failed to generate commit recap': '無法產生提交回顧',
    // 两句原文用句号分开，译文不并成逗号句
    'AI-generated content may be inaccurate. Please verify important information.': 'AI 產生的內容可能不準確。請確認重要資訊。',
    // 提交反馈后：謝謝。我們正在開發此功能並期待你的 <詳細意見回饋>！（原文无逗号，译文不加）
    'Thank you. This feature is under development and': '謝謝。我們正在開發此功能並期待你的',
    'detailed feedback': '詳細意見回饋',
    'is appreciated!': '！',

    // 签名弹层（React 与经典版）；原文无逗号，译文不加；产品名译中文：GitHub Enterprise Server → GitHub 企業伺服器
    'This commit was created on GitHub.com and signed with GitHub’s': '此提交在 GitHub.com 上建立並使用 GitHub 的',
    "This commit was created on GitHub.com and signed with GitHub's": '此提交在 GitHub.com 上建立並使用 GitHub 的',
    'This commit was created on GitHub Enterprise Server and signed with a': '此提交在 GitHub 企業伺服器上建立並使用',
    'This commit was signed with the committer’s': '此提交使用提交者的',
    "This commit was signed with the committer's": '此提交使用提交者的',
    'verified signature': '已驗證簽章',
    "This commit was signed with a verified signature, though we're still working on certificate revocation checking.":
      '此提交使用已驗證簽章簽署，但憑證撤銷檢查仍在進行中。',
    'This commit was signed with a verified signature, though we’re still working on certificate revocation checking.':
      '此提交使用已驗證簽章簽署，但憑證撤銷檢查仍在進行中。',
    '. The key has expired.': '。此金鑰已過期。',
    '. The key has been revoked.': '。此金鑰已撤銷。',
    '. The key has expired and has been revoked.': '。此金鑰已過期且已撤銷。',
    'The key has expired.': '此金鑰已過期。',
    'The key has expired': '此金鑰已過期',
    'and has been revoked': '且已撤銷',
    'The key has been revoked.': '此金鑰已撤銷。',
    'GPG Key ID:': 'GPG 金鑰 ID：',
    'GPG key ID:': 'GPG 金鑰 ID：',
    'SSH Key Fingerprint:': 'SSH 金鑰指紋：',
    'SSH key Fingerprint:': 'SSH 金鑰指紋：',
    'SSH key fingerprint:': 'SSH 金鑰指紋：',
    'Certificate subject': '憑證主體',
    'Certificate issuer': '憑證簽發者',
    'Learn about vigilant mode': '瞭解警戒模式',
    'Verification error': '驗證錯誤',
    'Verification status not available': '無法取得驗證狀態',
    'The commit signature verification service is not available': '提交簽章驗證服務無法使用',
    'The signature in this commit could not be verified. Someone may be trying to trick you.':
      '無法驗證此提交中的簽章。可能有人試圖欺騙你。',
    'We were unable to parse the signature in this commit.': '無法剖析此提交中的簽章。',
    "GitHub supports GPG and S/MIME signatures. We don't know what type of signature this is.":
      'GitHub 支援 GPG 和 S/MIME 簽章。無法辨識此簽章的類型。',
    'GitHub supports GPG and S/MIME signatures. We don’t know what type of signature this is.':
      'GitHub 支援 GPG 和 S/MIME 簽章。無法辨識此簽章的類型。',
    'to verify your signature.': '以驗證你的簽章。',
    'This user has not yet uploaded their public signing key.': '此使用者尚未上傳公開簽署金鑰。',
    'The email in this signature doesn’t match the committer email.': '此簽章中的電子郵件與提交者的電子郵件不符。',
    "The email in this signature doesn't match the committer email.": '此簽章中的電子郵件與提交者的電子郵件不符。',
    'Verify your email address': '驗證你的電子郵件地址',
    'The committer email address is not verified.': '提交者的電子郵件地址未驗證。',
    'No user is associated with the committer email.': '沒有與提交者電子郵件關聯的使用者。',
    // 「X. Please try again later.」句号随原文（与 common-ui、actions 一致）
    'We had a problem verifying this signature. Please try again later.': '驗證此簽章時發生問題。請稍後再試。',
    "The key that signed this doesn't have usage flags that allow signing.": '簽署此內容的金鑰沒有允許簽署的用途旗標。',
    'The key that signed this doesn’t have usage flags that allow signing.': '簽署此內容的金鑰沒有允許簽署的用途旗標。',
    'The key that signed this is expired.': '簽署此內容的金鑰已過期。',
    'We had a problem checking for revoked certificates. Please try again later.': '檢查已撤銷的憑證時發生問題。請稍後再試。',
    'One or more certificates in the chain has been revoked.': '憑證鏈中有一或多個憑證已撤銷。',
    'The signing certificate or its chain could not be verified.': '無法驗證簽署憑證或其憑證鏈。',
    'We were unable to verify this signature.': '無法驗證此簽章。',
    'This commit is not signed, but one or more authors requires that any commit attributed to them is signed.':
      '此提交未經簽署，但有一或多位作者要求歸屬於他們的所有提交都必須簽署。',
    'We cannot verify signatures from co-authors, and some of the co-authors attributed to this commit require their commits to be signed.':
      '無法驗證共同作者的簽章，而此提交的部分共同作者要求其提交必須簽署。',
    // 在场证明（Proof of presence）
    'Proof of presence': '在場證明',
    'proof of presence': '在場證明',
    Authenticated: '已通過身分驗證',
    'An unavailable user': '無法顯示的使用者',
    // <用户> 驗證此提交的方式為 <在場證明>
    'authenticated this commit with': '驗證此提交的方式為',
    'Completed on': '完成於'
  },
  scoped: {
    // 作者行动词：<用户> 推送於 <时间>（撰寫於、提交於由 common-ui 收录）
    pushed: '推送於',
    // 文件历史记录：歷史記錄 <路径> 位於 <分支>
    on: '位於',
    'Nothing to show': '沒有可顯示的內容',
    // 提交行菜单：複製完整 SHA <0ff253b>（SHA 在单独的元素中）
    'Copy full SHA for': '複製完整 SHA',
    'Copy full SHA': '複製完整 SHA',
    // 提交回顾：大小 <M>
    'size:': '大小：',
    // 签名徽章（Verified、Unverified、Partially verified、Expired 由 common-ui 收录）
    Revoked: '已撤銷',
    // 签名对话框的屏幕阅读器标题（验证状态原值）
    verified: '已驗證',
    unverified: '未驗證',
    partially_verified: '部分驗證'
  },
  regexp,
  ignore: [
    // 提交历史的“History for”面包屑：存储库名与路径段是用户内容（documentation 等目录名会撞上全局词条）
    '[data-component="Breadcrumbs"] [data-component="Breadcrumbs.Item"]'
  ]
} satisfies PageDictionary
