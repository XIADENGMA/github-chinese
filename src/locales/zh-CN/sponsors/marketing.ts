import type { PageDictionary } from '../../../core/types'

/**
 * GitHub 赞助营销页（/sponsors，实际地址 /open-source/sponsors），按 sponsors 页面类型处理。
 * 推荐项目（第三方项目的标语、说明与赞助按钮）属于运营内容，不收录。
 * 产品名按用户决定（2026-10-27，product-names.md）译成中文：GitHub Sponsors → GitHub 赞助，单独的 Sponsors → 赞助。
 * 标点随原文：原文没有逗号的句子不加逗号。
 */
export default {
  static: {
    // 页头
    'See your top dependencies': '查看你的主要依赖',
    'Get sponsored': '获得赞助',

    // 首屏与数据
    'Support the developers who power open source': '支持驱动开源的开发者',
    'Given back to our maintainers': '已回馈给维护者',
    'Regions supported globally': '全球支持的地区',
    'Organizations sponsoring': '参与赞助的组织',
    'GitHub Sponsors allows the developer community': 'GitHub 赞助让开发者社区',
    'to financially support the open source projects they depend on, directly on GitHub': '直接在 GitHub 上资助其依赖的开源项目',

    // 面向维护者 / 赞助者
    'For maintainers': '面向维护者',
    'Launch a page in minutes and showcase Sponsors buttons on your GitHub profile and repositories! You will automatically appear in worldwide recommendations to partners who are eager to invest in their open source dependencies.':
      '几分钟即可创建页面并在你的 GitHub 个人资料和存储库中展示赞助按钮！你将自动出现在面向全球乐于投资其开源依赖的合作伙伴的推荐中。',
    'For sponsors': '面向赞助者',
    'Find and fund your dependencies in a single transaction. The discovery and bulk sponsorship tools are easy to use. Flexible payment enables you to choose when and how you pay. Corporations like Microsoft like it because all their payments go out as a single invoice.':
      '一次交易即可找到并资助你的依赖。发现与批量赞助工具简单易用。灵活的付款方式让你可自行选择付款时间和方式。Microsoft 等企业因所有付款都合并为一张发票而青睐它。',
    'Learn about invoiced billing': '了解开票计费',

    // 助力开源
    'Help open source thrive': '助力开源繁荣',
    'Everyone should be able to contribute to open source. Making open source a viable, financially rewarding career path helps contribute to our digital infrastructure. More funding, more projects, more software to power our world.':
      '每个人都应能为开源做贡献。让开源成为可行、有经济回报的职业道路有助于建设我们的数字基础设施。更多资金，更多项目，更多驱动世界的软件。',
    'Shopify uses GitHub Sponsors to efficiently manage and fund projects within the open source community, tailored to the needs of recipients.':
      'Shopify 使用 GitHub 赞助高效管理和资助开源社区中的项目，并根据受资助者的需求量身定制。',
    'Senior Engineering Operations Manager, Shopify': 'Shopify 高级工程运营经理',
    'Invest in open source. It powers your world.': '投资开源。它驱动着你的世界。',
    'The internet depends on open source, everywhere': '互联网处处依赖开源',

    // 常见问题
    'Frequently Asked Questions': '常见问题',
    'Frequently asked questions': '常见问题',
    'How do I sponsor a project?': '如何赞助项目？',
    'Sign in and start by navigating to': '登录后前往',
    'your dependencies': '你的依赖',
    ', your': '、你的',
    'explore tab': '探索标签页',
    'trending repositories': '趋势存储库',
    ', or': '，或',
    collections: '集合',
    '. When a repository has the Sponsor graphic, you can sponsor them directly.': '。存储库带有赞助标识时，可直接赞助。',
    'How do I get paid for my contributions?': '如何为我的贡献获得报酬？',
    'You can become a sponsored developer by joining GitHub Sponsors, completing your sponsored developer profile, creating sponsorship tiers, submitting your bank and tax information, and enabling two-factor authentication for your account on GitHub.com.':
      '加入 GitHub 赞助、完善被赞助开发者个人资料、创建赞助等级、提交银行和税务信息，并为你的 GitHub.com 帐户启用双因素身份验证即可成为被赞助的开发者。',
    'Learn more about getting paid for contributions': '了解如何为贡献获得报酬',
    'Do I need to fill out a tax form to receive sponsorships?': '接受赞助需要填写税务表格吗？',
    'Yes. Your tax information must be on file in order for GitHub to make payments to your bank account. The required tax documents may vary based on your location.':
      '需要。GitHub 须存有你的税务信息才能向你的银行帐户付款。所需税务文件因所在地而异。',
    'Note that we do our best to help you with the Sponsors program, but we’re unable to provide tax guidance.':
      '请注意我们会尽力协助你参与赞助计划，但无法提供税务指导。',
    "Note that we do our best to help you with the Sponsors program, but we're unable to provide tax guidance.":
      '请注意我们会尽力协助你参与赞助计划，但无法提供税务指导。',
    'Learn more about tax information for GitHub Sponsors': '了解 GitHub 赞助的税务信息'
  }
} satisfies PageDictionary
