import type { PageDictionary } from '../../../core/types'
import { joinCjk } from '../helpers'

/**
 * 赞助仪表板（/sponsors/<name>/dashboard/*）：总览、个人档案、等级、目标、你的赞助者、电子邮件动态、拨款、设定；
 * 申请赞助（/sponsors/<name>/signup）与候补名单（/sponsors/<name>/waitlist）。
 * 产品名按用户决定（2026-10-27，product-names.md）译成中文：GitHub Sponsors → GitHub 贊助，单独的 Sponsors → 贊助；
 * 句中的 beta（in beta / out of beta）作「測試階段」「結束測試」，不留英文。
 * 赞助语境的 updates 作「動態」（与 org-settings 的「贊助動態電子郵件」一致）；payouts 作「撥款」；
 * bank account、Stripe account、财务托管机构的 account 是金融帐户，作「帳戶」（銀行帳戶、Stripe 帳戶），
 * GitHub 与 Patreon 的帐号仍作「帳號」。
 */

/** 收件人与等级名称 */
const RECIPIENT_NAMES: Readonly<Record<string, string>> = {
  'All sponsors': '所有贊助者',
  'Recurring sponsors': '定期贊助者',
  'One-time sponsors': '一次性贊助者',
  'select filter': '選擇篩選器',
}

/** 单个等级名：「$5 a month」「$10 one time」 */
function singleTierName(name: string): string {
  const match = /^(\$[\d,]+(?:\.\d{2})?) (a month|one time)$/.exec(name)
  if (!match) return RECIPIENT_NAMES[name] ?? name
  return match[2] === 'a month' ? `每月 ${match[1]}` : `一次性 ${match[1]}`
}

/** 等级名；多个等级以「; 」分隔：「$5 a month; $10 a month」→「每月 $5；每月 $10」（分号随原文） */
function tierName(name: string): string {
  return name.split('; ').map(singleTierName).join('；')
}

/** 「[retired] $5 a month (3 sponsors)」→「[已停用] 每月 $5（3 位）」；赞助者是人，量词用「位」 */
export function translateRecipient(text: string): string {
  const match = /^(\[retired\] )?(.+?) \((\d[\d,]*) sponsors?\)$/.exec(text)
  if (!match) return tierName(text)
  const [, retired, name = '', count = ''] = match
  return `${retired ? '[已停用] ' : ''}${tierName(name)}（${count} 位）`
}

export default {
  static: {
    // 仪表板导航
    'Sponsors dashboard': '贊助儀表板',
    'Sponsor dashboard': '贊助儀表板',
    'Profile details': '個人檔案詳細資料',
    'Sponsor tiers': '贊助等級',
    'Your goals': '你的目標',
    Payouts: '撥款',

    // 个人档案
    'Short bio': '簡介',
    'Optional: Opt-in to get featured on github.com/sponsors': '選填：選擇加入 github.com/sponsors 的精選推薦',
    'Featured Sponsors': '精選贊助者',
    'Manually add my featured sponsors': '手動新增我的精選贊助者',
    'Add a description (optional)': '新增描述（選填）',
    'Drag and drop list.': '可拖放的清單。',

    // 目标
    'Sponsor goal': '贊助目標',
    'Set a goal': '設定目標',
    'What is your goal based on?': '你的目標以什麼為依據？',
    'Number of monthly sponsors': '每月贊助者人數',
    'Sponsorships a month': '每月贊助金額',
    'Describe your goal': '描述你的目標',
    'I understand that this will publicly display how much sponsorship funds I receive each month':
      '我瞭解這會公開顯示我每月收到的贊助金額',
    'Embed it': '內嵌',
    'Share it out': '分享',

    // 等级
    'Add a monthly tier': '新增每月等級',
    'Monthly tiers': '每月等級',
    'One-time tiers': '一次性等級',
    'Add a one-time tier': '新增一次性等級',
    'Display welcome message': '顯示歡迎訊息',
    'Publish tier': '發布等級',
    'Retire tier': '停用等級',
    'Continue to tier editor': '繼續前往等級編輯器',
    'Custom amounts': '自訂金額',
    'Grant sponsors access to a private repository': '授予贊助者私人儲存庫的存取權限',
    'Active tiers': '啟用中的等級',
    'Retired tiers': '已停用的等級',

    // 你的赞助者
    'Select recipients': '選擇收件者',
    'Filter tiers': '篩選等級',
    'Draft a new update': '草擬新動態',
    'Email updates to your sponsors': '透過電子郵件傳送動態給贊助者',
    'Send email to': '傳送電子郵件給',

    // 拨款与设定
    'Payouts information': '撥款資訊',
    'Edit your bank information': '編輯銀行資訊',
    'Stripe Connect account': 'Stripe Connect 帳戶',
    'tax forms': '稅務表單',
    'Connect with Patreon': '連接 Patreon',
    'Link Patreon account': '連結 Patreon 帳號',
    'Allow people to pay you through Patreon': '允許他人透過 Patreon 付款給你',
    'Update Patreon preferences': '更新 Patreon 偏好設定',
    'Unlink Patreon account': '取消連結 Patreon 帳號',
    'Unpublish profile': '取消發布個人檔案',
    'Disable GitHub Sponsors account': '停用 GitHub 贊助帳號',
    'Unpublish GitHub Sponsors account': '取消發布 GitHub 贊助帳號',
    'This organization is using a fiscal host': '此組織正在使用財務託管機構',

    // 申请赞助 /sponsors/<name>/signup
    'Get Sponsored': '獲得贊助',
    'GitHub Sponsors profile': 'GitHub 贊助個人檔案',
    'and start receiving funding.': '並開始獲得資助。',
    'Loading sign-up status': '正在載入註冊狀態',
    'Your information has been saved.': '已儲存你的資訊。',
    // 标点随原文：三句各自成句，不加原文没有的逗号；后接链接「組織資料頁面」，与 org-settings「…請至」+「帳務頁面」同一写法
    'The organization billing email where we will contact you about your GitHub Sponsors profile. This will not be shared publicly. Change it in the':
      '我們會透過此組織帳單電子郵件就你的 GitHub 贊助個人檔案與你聯絡。此地址不會公開。變更請至',
    'organization profile page': '組織資料頁面',
    'Select a verified email address for us to contact you about your GitHub Sponsors profile. This will not be shared publicly. You can manage verified email addresses in your':
      '選擇一個已驗證的電子郵件地址供我們就你的 GitHub 贊助個人檔案與你聯絡。此地址不會公開。管理已驗證的電子郵件地址請至',
    'Select a verified email address for us to contact you about your GitHub Sponsors profile. This will not be shared publicly.':
      '選擇一個已驗證的電子郵件地址供我們就你的 GitHub 贊助個人檔案與你聯絡。此地址不會公開。',
    'You can manage verified email addresses in your': '管理已驗證的電子郵件地址請至',
    'Country or region of residence': '居住的國家/地區',
    'The country or region where you reside. This is required for tax purposes.':
      '你居住的國家/地區。此資訊為稅務所需。',
    'How you receive payments': '收款方式',
    'Bank account': '銀行帳戶',
    'Use a bank account to receive your sponsorships. Note: If you use a personal bank account, your country may tax your GitHub Sponsors payouts as personal income.':
      '使用銀行帳戶接收贊助款項。注意：如果使用個人銀行帳戶，你所在的國家可能會將 GitHub 贊助撥款視為個人所得課稅。',
    'Country or region where your bank account is located': '銀行帳戶所在的國家/地區',
    'Country or region where your bank account is located:': '銀行帳戶所在的國家/地區：',
    'Bank account country or region': '銀行帳戶所在國家/地區',
    'Your region is not supported. You can use an account with a': '你所在的地區不受支援。你可以使用',
    'fiscal host': '財務託管機構',
    'or sign up to be notified when Sponsors supports your region.': '的帳戶或註冊以在贊助支援你所在的地區時收到通知。',
    'Fiscal Host': '財務託管機構',
    'Members of supported fiscal hosts can use their fiscal host to join GitHub Sponsors instead of using a bank account.':
      '受支援財務託管機構的成員可以透過所屬財務託管機構而非銀行帳戶加入 GitHub 贊助。',
    'Choose a fiscal host': '選擇財務託管機構',
    'Choose a fiscal host:': '選擇財務託管機構：',
    'Select a fiscal host': '選擇財務託管機構',
    // 第三方网站上的项目 profile 作「專案頁面」（「專案檔案」易读成专案里的档案）
    'Fiscal host project profile URL': '財務託管機構專案頁面 URL',
    'Fiscal host project profile URL:': '財務託管機構專案頁面 URL：',
    'Please include a link to your profile on your fiscal host’s site, if available.':
      '如有，請附上你在財務託管機構網站上的個人檔案連結。',
    "Please include a link to your profile on your fiscal host's site, if available.":
      '如有，請附上你在財務託管機構網站上的個人檔案連結。',

    // 候补名单 /sponsors/<name>/waitlist
    'If you have a bank account in': '如果你的銀行帳戶位於',
    'a country or region where GitHub Sponsors is generally available': 'GitHub 贊助已全面開放的國家/地區',
    ', you will get an email from us when your application has been reviewed.':
      '，申請審查完成後我們會寄電子郵件給你。',
    "If you don't have an eligible bank account, don't worry! We're working hard to get more countries out of beta soon. Join the waitlist to be the first to know.":
      '如果你沒有符合資格的銀行帳戶，別擔心！我們正努力讓更多國家盡快結束測試階段。加入候補名單以搶先獲得通知。',
    'Use a bank account': '使用銀行帳戶',
    'You can use your bank account to join GitHub Sponsors.': '你可以使用自己的銀行帳戶加入 GitHub 贊助。',
    'Note that you are responsible for all applicable taxes on payouts you receive. If you use a personal bank account, your country may tax your GitHub Sponsors payouts as personal income.':
      '請注意你須自行負擔所收撥款的所有適用稅金。如果使用個人銀行帳戶，你所在的國家可能會將 GitHub 贊助撥款視為個人所得課稅。',
    'Learn more about setting up a Stripe account': '瞭解如何設定 Stripe 帳戶',
    'Use another bank account where GitHub Sponsors is available or complete signup to receive a notification if your region becomes available.':
      '使用位於 GitHub 贊助可用地區的其他銀行帳戶或完成註冊以在你所在的地區開放時收到通知。',
    'Use a fiscal host': '使用財務託管機構',
    'You can use a fiscal host to join GitHub Sponsors instead of using your own bank account.':
      '你可以透過財務託管機構而非自己的銀行帳戶加入 GitHub 贊助。',
    'Join waitlist': '加入候補名單',
  },
  scoped: {
    // 仪表板侧栏
    Webhooks: 'Web 鉤子',
    Newsletters: '電子報',
    Introduction: '介紹',
    Tiers: '等級',
    Goals: '目標',
    Updates: '動態',
    Retire: '停用',
    Export: '匯出',
    'Filter by': '篩選依據',
    // 徽章 Beta → 測試版；句中「may be in beta」「out of beta」作「測試階段」「結束測試」
    beta: '測試階段',
    'Update profile': '更新個人檔案',
    'Link account': '連結帳號',
    'Disable account': '停用帳號',
    'Save draft': '儲存草稿',
    'Add or remove': '新增或移除',
    'Select a country or region': '選擇國家/地區',
    'e.g.,': '例如，',
    'email settings': '電子郵件設定',
    'Linked account': '已連結的帳號',
    'Request approval': '申請核准',
    'Launch a': '建立',
    // 「Your region is <not supported> or may be in <beta>.」
    'Your region is': '你所在的地區',
    'not supported': '不受支援',
    'or may be in': '或可能處於',
  },
  regexp: [
    // 你的赞助者 / 电子邮件动态：收件人选择；未知名称保留原文时与中文前缀之间补空格
    [/^Filter: (.+)$/, (_, text: string) => `篩選器：${translateRecipient(text)}`],
    [/^Send email to (.+)$/, (_, text: string) => joinCjk('傳送電子郵件給', translateRecipient(text))],
    [/^(?:\[retired\] )?.+? \(\d[\d,]* sponsors?\)$/, (text: string) => translateRecipient(text)],

    // 个人档案：团队成员清单的排序按钮（省略号随原文）；团队成员 / 精选赞助者选择框的剩余名额（脚本生成）
    [/^Advanced move (.+?)(\.\.\.|…)$/, '進階移動 $1$2'],
    [/^(\d+) remaining$/, '剩餘 $1 個'],

    // 候补名单
    [/^GitHub Sponsors is now out of beta for (\d+) regions!$/, 'GitHub 贊助已在 $1 個地區結束測試！'],
  ],
  ignore: [
    // 目标类型标签：GitHub 脚本比对其英文原文切换金额 / 人数预览，译文会使预览出错
    '.js-sponsors-goals-type-label',
    // 目标描述预览：脚本写入正在输入的描述
    '.js-sponsors-goal-description-preview',
    // 等级建议：勾选后脚本读取其文字作为新等级描述提交
    ':has(> .js-tier-suggestion)',
  ],
} satisfies PageDictionary
