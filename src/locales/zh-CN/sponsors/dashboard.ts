import type { PageDictionary } from '../../../core/types'
import { joinCjk } from '../helpers'

/**
 * 赞助仪表板（/sponsors/<name>/dashboard/*）：概述、个人资料、等级、目标、你的赞助者、电子邮件动态、付款、设置；
 * 申请赞助（/sponsors/<name>/signup）与候补名单（/sponsors/<name>/waitlist）。
 * 产品名按用户决定（2026-10-27，product-names.md）译成中文：GitHub Sponsors → GitHub 赞助，单独的 Sponsors → 赞助；
 * 句中的 beta（in beta / out of beta）作“测试阶段”“结束测试”，不留英文。
 */

/** 收件人与等级名称 */
const RECIPIENT_NAMES: Readonly<Record<string, string>> = {
  'All sponsors': '全部赞助者',
  'Recurring sponsors': '定期赞助者',
  'One-time sponsors': '一次性赞助者',
  'select filter': '选择筛选器',
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

/** 「[retired] $5 a month (3 sponsors)」→「[已停用] 每月 $5（3 个）」 */
export function translateRecipient(text: string): string {
  const match = /^(\[retired\] )?(.+?) \((\d[\d,]*) sponsors?\)$/.exec(text)
  if (!match) return tierName(text)
  const [, retired, name = '', count = ''] = match
  return `${retired ? '[已停用] ' : ''}${tierName(name)}（${count} 个）`
}

export default {
  static: {
    // 仪表板导航
    'Sponsors dashboard': '赞助仪表板',
    'Sponsor dashboard': '赞助仪表板',
    'Profile details': '个人资料详细信息',
    'Sponsor tiers': '赞助等级',
    'Your goals': '你的目标',
    Payouts: '付款',

    // 个人资料
    'Short bio': '简介',
    'Optional: Opt-in to get featured on github.com/sponsors': '可选：选择在 github.com/sponsors 上获得推荐',
    'Featured Sponsors': '精选赞助者',
    'Manually add my featured sponsors': '手动添加精选赞助者',
    'Add a description (optional)': '添加描述（可选）',
    'Drag and drop list.': '拖放列表。',

    // 目标
    'Sponsor goal': '赞助目标',
    'Set a goal': '设定目标',
    'What is your goal based on?': '目标基于什么？',
    'Number of monthly sponsors': '每月赞助者人数',
    'Sponsorships a month': '每月赞助金额',
    'Describe your goal': '描述你的目标',
    'I understand that this will publicly display how much sponsorship funds I receive each month':
      '我了解这将公开显示我每月收到的赞助金额',
    'Embed it': '嵌入',
    'Share it out': '分享出去',

    // 等级
    'Add a monthly tier': '添加每月等级',
    'Monthly tiers': '每月等级',
    'One-time tiers': '一次性等级',
    'Add a one-time tier': '添加一次性等级',
    'Display welcome message': '显示欢迎消息',
    'Publish tier': '发布等级',
    'Retire tier': '停用等级',
    'Continue to tier editor': '继续编辑等级',
    'Custom amounts': '自定义金额',
    'Grant sponsors access to a private repository': '授予赞助者访问专用存储库的权限',
    'Active tiers': '有效等级',
    'Retired tiers': '已停用等级',

    // 你的赞助者
    'Select recipients': '选择收件人',
    'Filter tiers': '筛选等级',
    'Draft a new update': '起草新动态',
    'Email updates to your sponsors': '通过电子邮件向赞助者发送动态',
    'Send email to': '发送电子邮件给',

    // 付款与设置
    'Payouts information': '付款信息',
    'Edit your bank information': '编辑银行信息',
    'Stripe Connect account': 'Stripe Connect 帐户',
    'tax forms': '税务表格',
    'Connect with Patreon': '连接 Patreon',
    'Link Patreon account': '链接 Patreon 帐户',
    'Allow people to pay you through Patreon': '允许他人通过 Patreon 向你付款',
    'Update Patreon preferences': '更新 Patreon 首选项',
    'Unlink Patreon account': '取消链接 Patreon 帐户',
    'Unpublish profile': '取消发布个人资料',
    'Disable GitHub Sponsors account': '禁用 GitHub 赞助帐户',
    'Unpublish GitHub Sponsors account': '取消发布 GitHub 赞助帐户',
    'This organization is using a fiscal host': '此组织正在使用财务托管方',

    // 申请赞助 /sponsors/<name>/signup
    'Get Sponsored': '获得赞助',
    'GitHub Sponsors profile': 'GitHub 赞助个人资料',
    'and start receiving funding.': '并开始接受资助。',
    'Loading sign-up status': '正在加载注册状态',
    'Your information has been saved.': '信息已保存。',
    // 标点随原文：三句各自成句，不加原文没有的逗号
    'The organization billing email where we will contact you about your GitHub Sponsors profile. This will not be shared publicly. Change it in the':
      '我们将通过此组织计费电子邮件就你的 GitHub 赞助个人资料与你联系。该地址不会公开。可在以下位置更改',
    'organization profile page': '组织个人资料页面',
    'Select a verified email address for us to contact you about your GitHub Sponsors profile. This will not be shared publicly. You can manage verified email addresses in your':
      '选择一个已验证的电子邮件地址供我们就你的 GitHub 赞助个人资料与你联系。该地址不会公开。可在以下位置管理已验证的电子邮件地址',
    'Select a verified email address for us to contact you about your GitHub Sponsors profile. This will not be shared publicly.':
      '选择一个已验证的电子邮件地址供我们就你的 GitHub 赞助个人资料与你联系。该地址不会公开。',
    'You can manage verified email addresses in your': '可在以下位置管理已验证的电子邮件地址',
    'Country or region of residence': '居住国家或地区',
    'The country or region where you reside. This is required for tax purposes.':
      '你居住的国家或地区。此项为税务所需。',
    'How you receive payments': '收款方式',
    'Bank account': '银行帐户',
    'Use a bank account to receive your sponsorships. Note: If you use a personal bank account, your country may tax your GitHub Sponsors payouts as personal income.':
      '使用银行帐户接收赞助。注意：如果使用个人银行帐户，所在国家可能将 GitHub 赞助付款作为个人收入征税。',
    'Country or region where your bank account is located': '银行帐户所在国家或地区',
    'Country or region where your bank account is located:': '银行帐户所在国家或地区：',
    'Bank account country or region': '银行帐户所在国家或地区',
    'Your region is not supported. You can use an account with a': '不支持你所在的地区。可以使用',
    'fiscal host': '财务托管方',
    'or sign up to be notified when Sponsors supports your region.': '的帐户或注册以便在赞助支持你所在地区时收到通知。',
    'Fiscal Host': '财务托管方',
    'Members of supported fiscal hosts can use their fiscal host to join GitHub Sponsors instead of using a bank account.':
      '受支持的财务托管方成员可以通过其财务托管方而非银行帐户加入 GitHub 赞助。',
    'Choose a fiscal host': '选择财务托管方',
    'Choose a fiscal host:': '选择财务托管方：',
    'Select a fiscal host': '选择财务托管方',
    'Fiscal host project profile URL': '财务托管方项目个人资料 URL',
    'Fiscal host project profile URL:': '财务托管方项目个人资料 URL：',
    'Please include a link to your profile on your fiscal host’s site, if available.':
      '如有，请附上你在财务托管方网站上的个人资料链接。',
    "Please include a link to your profile on your fiscal host's site, if available.":
      '如有，请附上你在财务托管方网站上的个人资料链接。',

    // 候补名单 /sponsors/<name>/waitlist
    'If you have a bank account in': '如果你的银行帐户位于',
    'a country or region where GitHub Sponsors is generally available': 'GitHub 赞助已全面推出的国家或地区',
    ', you will get an email from us when your application has been reviewed.':
      '，申请经审查后我们会给你发送电子邮件。',
    "If you don't have an eligible bank account, don't worry! We're working hard to get more countries out of beta soon. Join the waitlist to be the first to know.":
      '如果没有符合条件的银行帐户，不用担心！我们正在努力让更多国家尽快结束测试。加入候补名单以第一时间获知。',
    'Use a bank account': '使用银行帐户',
    'You can use your bank account to join GitHub Sponsors.': '可以使用你的银行帐户加入 GitHub 赞助。',
    'Note that you are responsible for all applicable taxes on payouts you receive. If you use a personal bank account, your country may tax your GitHub Sponsors payouts as personal income.':
      '请注意你需对收到的付款承担所有适用税费。如果使用个人银行帐户，所在国家可能将 GitHub 赞助付款作为个人收入征税。',
    'Learn more about setting up a Stripe account': '了解如何设置 Stripe 帐户',
    'Use another bank account where GitHub Sponsors is available or complete signup to receive a notification if your region becomes available.':
      '使用 GitHub 赞助可用地区的其他银行帐户或完成注册以便在你所在地区可用时收到通知。',
    'Use a fiscal host': '使用财务托管方',
    'You can use a fiscal host to join GitHub Sponsors instead of using your own bank account.':
      '可以通过财务托管方而非自己的银行帐户加入 GitHub 赞助。',
    'Join waitlist': '加入候补名单',
  },
  scoped: {
    // 仪表板侧栏
    Webhooks: 'Web 钩子',
    Newsletters: '新闻简报',
    Introduction: '介绍',
    Tiers: '等级',
    Goals: '目标',
    Updates: '动态',
    Retire: '停用',
    Export: '导出',
    'Filter by': '筛选条件',
    // 徽章 Beta → 测试版；句中「may be in beta」「out of beta」作“测试阶段”“结束测试”
    beta: '测试阶段',
    'Update profile': '更新个人资料',
    'Link account': '链接帐户',
    'Disable account': '禁用帐户',
    'Save draft': '保存草稿',
    'Add or remove': '添加或删除',
    'Select a country or region': '选择国家或地区',
    'e.g.,': '例如',
    'email settings': '电子邮件设置',
    'Linked account': '链接的帐户',
    'Request approval': '申请审批',
    'Launch a': '创建',
    // 「Your region is <not supported> or may be in <beta>.」
    'Your region is': '你所在的地区',
    'not supported': '不受支持',
    'or may be in': '或可能处于',
  },
  regexp: [
    // 你的赞助者 / 电子邮件动态：收件人选择；未知名称保留原文时与中文前缀之间补空格
    [/^Filter: (.+)$/, (_, text: string) => `筛选器：${translateRecipient(text)}`],
    [/^Send email to (.+)$/, (_, text: string) => joinCjk('发送电子邮件给', translateRecipient(text))],
    [/^(?:\[retired\] )?.+? \(\d[\d,]* sponsors?\)$/, (text: string) => translateRecipient(text)],

    // 个人资料：团队成员列表的排序按钮（省略号随原文）；团队成员 / 精选赞助者选择框的剩余名额（脚本生成）
    [/^Advanced move (.+?)(\.\.\.|…)$/, '高级移动 $1$2'],
    [/^(\d+) remaining$/, '剩余 $1 个'],

    // 候补名单
    [/^GitHub Sponsors is now out of beta for (\d+) regions!$/, 'GitHub 赞助已在 $1 个地区结束测试！'],
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
