import type { PageDictionary } from '../../../core/types'

/**
 * GitHub 赞助营销页（/sponsors，实际地址 /open-source/sponsors），按 sponsors 页面类型处理。
 * 推荐项目（第三方项目的标语、说明与赞助按钮）属于运营内容，不收录。
 * 产品名按用户决定（2026-10-27，product-names.md）译成中文：GitHub Sponsors → GitHub 贊助，单独的 Sponsors → 贊助。
 * 标点随原文：原文没有逗号的句子不加逗号。
 */
export default {
  static: {
    // 页头
    'See your top dependencies': '查看你的主要相依項目',
    'Get sponsored': '獲得贊助',

    // 首屏与数据
    'Support the developers who power open source': '支持推動開源的開發人員',
    'Given back to our maintainers': '已回饋給維護者',
    'Regions supported globally': '全球支援的地區',
    'Organizations sponsoring': '參與贊助的組織',
    'GitHub Sponsors allows the developer community': 'GitHub 贊助讓開發人員社群',
    'to financially support the open source projects they depend on, directly on GitHub': '直接在 GitHub 上資助他們所仰賴的開源專案',

    // 给维护者 / 赞助者
    'For maintainers': '給維護者',
    'Launch a page in minutes and showcase Sponsors buttons on your GitHub profile and repositories! You will automatically appear in worldwide recommendations to partners who are eager to invest in their open source dependencies.':
      '只要幾分鐘就能推出頁面並在你的 GitHub 個人檔案和儲存庫上展示贊助按鈕！渴望投資其開源相依項目的全球合作夥伴會自動在推薦中看到你。',
    'For sponsors': '給贊助者',
    'Find and fund your dependencies in a single transaction. The discovery and bulk sponsorship tools are easy to use. Flexible payment enables you to choose when and how you pay. Corporations like Microsoft like it because all their payments go out as a single invoice.':
      '在一筆交易中找到並資助你的相依項目。探索和批次贊助工具簡單易用。彈性的付款方式讓你自行選擇付款時間和方式。Microsoft 等企業喜歡它是因為所有款項都會合併為單一發票。',
    'Learn about invoiced billing': '瞭解發票付款',

    // 协助开源
    'Help open source thrive': '協助開源蓬勃發展',
    'Everyone should be able to contribute to open source. Making open source a viable, financially rewarding career path helps contribute to our digital infrastructure. More funding, more projects, more software to power our world.':
      '每個人都應該能為開源做出貢獻。讓開源成為可行、有經濟回報的職涯道路有助於建設我們的數位基礎設施。更多資金，更多專案，更多驅動世界的軟體。',
    'Shopify uses GitHub Sponsors to efficiently manage and fund projects within the open source community, tailored to the needs of recipients.':
      'Shopify 使用 GitHub 贊助有效率地管理、資助開源社群中的專案，並依受資助者的需求量身打造。',
    'Senior Engineering Operations Manager, Shopify': 'Shopify 資深工程營運經理',
    'Invest in open source. It powers your world.': '投資開源。它驅動著你的世界。',
    'The internet depends on open source, everywhere': '網際網路處處仰賴開源',

    // 常见问题
    'Frequently Asked Questions': '常見問題',
    'Frequently asked questions': '常見問題',
    'How do I sponsor a project?': '如何贊助專案？',
    // Sign in and start by navigating to <your dependencies>, your <explore tab>, <trending repositories>, or <collections>.
    // 两个链接之间的「, 」由引擎转成顿号；「, or」作「或」（列举的最后一项前不加顿号）
    'Sign in and start by navigating to': '登入後先前往',
    'your dependencies': '你的相依項目',
    ', your': '、你的',
    'explore tab': '探索分頁',
    'trending repositories': '熱門儲存庫',
    ', or': '或',
    collections: '精選集',
    '. When a repository has the Sponsor graphic, you can sponsor them directly.': '。儲存庫顯示贊助圖示時，你可以直接贊助。',
    'How do I get paid for my contributions?': '如何因我的貢獻獲得報酬？',
    'You can become a sponsored developer by joining GitHub Sponsors, completing your sponsored developer profile, creating sponsorship tiers, submitting your bank and tax information, and enabling two-factor authentication for your account on GitHub.com.':
      '只要加入 GitHub 贊助、填妥受贊助開發人員個人檔案、建立贊助等級、送出銀行和稅務資訊，並為你的 GitHub.com 帳號啟用雙重驗證就能成為受贊助的開發人員。',
    'Learn more about getting paid for contributions': '瞭解如何因貢獻獲得報酬',
    'Do I need to fill out a tax form to receive sponsorships?': '接受贊助需要填寫稅務表單嗎？',
    'Yes. Your tax information must be on file in order for GitHub to make payments to your bank account. The required tax documents may vary based on your location.':
      '需要。GitHub 必須存有你的稅務資訊才能付款到你的銀行帳戶。所需的稅務文件可能因你所在的地點而異。',
    'Note that we do our best to help you with the Sponsors program, but we’re unable to provide tax guidance.':
      '請注意我們會盡力協助你參與贊助計畫，但無法提供稅務指引。',
    "Note that we do our best to help you with the Sponsors program, but we're unable to provide tax guidance.":
      '請注意我們會盡力協助你參與贊助計畫，但無法提供稅務指引。',
    'Learn more about tax information for GitHub Sponsors': '瞭解 GitHub 贊助的稅務資訊'
  }
} satisfies PageDictionary
