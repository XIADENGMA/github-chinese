import type { PageDictionary } from '../../../core/types'
import { joinCjk } from '../helpers'
import { millions, thousands } from './numbers'

/** GitHub 教育首页（/education）：首屏、数据、使命、四类用户卡片、CTA；推荐语由 shared 的忽略规则排除 */
export default {
  static: {
    // 首屏
    'Empowering the next generation of developers': '培育下一代開發人員',
    'GitHub Education bridges the gap between coding education and a tech career, and is accessible to everyone globally at no cost.':
      'GitHub 教育弭平程式設計教育和科技職涯之間的落差，全球每個人都能免費使用。',

    // 数据（数字见 regexp）
    "Connect with millions of peers who've expanded their skills through GitHub Education.": '與數百萬透過 GitHub 教育拓展技能的同儕交流。',
    'Collaborate with educators around the world who enhance their lesson plans and workstreams with GitHub tools.':
      '與世界各地運用 GitHub 工具改善教案和工作流程的教育工作者協作。',
    'Join thousands of schools globally that incorporate GitHub into their tech curriculum.':
      '加入全球數千所將 GitHub 納入科技課程的學校。',

    // 使命：<b>More than a platform.</b> GitHub Education is a commitment …
    'More than a platform.': '不只是平台。',
    'GitHub Education is a commitment to bringing tech and open source collaboration to students and educators across the globe.':
      'GitHub 教育致力於將科技和開源協作帶給全球的學生和教育工作者。',
    // <b>Join us today</b> and take the first step …（整句见 inline）
    'Join us today': '立即加入我們',
    'and take the first step towards transforming your tech education experience.': '，踏出改變你的科技教育體驗的第一步。',
    // 「加入 GitHub 教育」链接的 aria-label
    'Enable GitHub Education': '啟用 GitHub 教育',

    // 四类用户卡片
    'Join a community where learning meets doing, with free access to the same tools professional developers use, including GitHub Copilot Student and Codespaces.':
      '加入學以致用的社群，免費使用與專業開發人員相同的工具，包括 GitHub Copilot 學生版和程式碼空間。',
    'Learn more about students': '瞭解學生相關資訊',
    'Connect with a community of peers, expand your teaching methods, and empower students to dream big.':
      '與同儕社群交流，拓展教學方法，讓學生勇敢追夢。',
    'Learn more about teachers': '瞭解教師相關資訊',
    'Enhance your technical and academic departments with real-world software solutions, thanks to free access to GitHub Enterprise.':
      '免費使用 GitHub 企業版，以實務軟體解決方案強化你的技術和學術部門。',
    'Learn more about schools': '瞭解學校相關資訊',
    "Expand your brand's footprint in the tech landscape and ensure the tech leaders of tomorrow know your tools by name by partnering with GitHub Education.":
      '與 GitHub 教育合作，擴大你的品牌在科技領域的影響力，讓未來的科技領袖對你的工具耳熟能詳。',
    'Learn more about partners': '瞭解合作夥伴相關資訊',

    // 「更進一步」
    'Go further': '更進一步'
  },
  regexp: [
    // 数据：5 million students / 200K verified educators / +2K educational institutions
    [/^(\d+) million students$/, (_, count) => joinCjk(millions(count!), '位學生')],
    [/^(\d+)K verified educators$/, (_, count) => joinCjk(thousands(count!), '位已驗證的教育工作者')],
    [/^\+(\d+)K educational institutions$/, (_, count) => joinCjk(`超過 ${thousands(count!)}`, '所教育機構')]
  ],
  inline: [
    // <b>Join us today</b> and take the first step towards transforming your tech education experience.
    ['{} and take the first step towards transforming your tech education experience.', '{}，踏出改變你的科技教育體驗的第一步。']
  ]
} satisfies PageDictionary
