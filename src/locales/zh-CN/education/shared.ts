import type { PageDictionary } from '../../../core/types'

/**
 * 教育页共用：页内导航（Students / Teachers / Schools / Partners）、首屏眉题与标签页标题、
 * 多个教育页共用的 CTA 横幅、「更进一步」卡片、常见问题，以及推荐语（第三方引言）的忽略规则。
 * 全局导航与页脚里单独出现的产品名按 product-names.md 译成中文：common 现译仍是英文（或未收录）的，
 * 先在本页 scoped 给出中文译法，等全站 sweep 时统一到 common。
 */
export default {
  static: {
    // 三个教育页共用的 CTA 横幅
    'Begin your GitHub Education journey': '开启你的 GitHub 教育之旅',
    'Join us today and take the first step towards transforming your tech education experience.':
      '立即加入我们，迈出改变你的技术教育体验的第一步。',
    'Join us today and take the first step toward transforming your tech education experience.':
      '立即加入我们，迈出改变你的技术教育体验的第一步。',

    // 「更进一步」区块：标题见学生页、教师页，卡片说明见 /education、学生页
    'Go further with these': '借助以下内容更进一步',
    'From cloud hosting to development platforms and premium educational content, the Student Developer Pack includes dozens of partner offers and resources that will allow students to use professional tools at no cost.':
      '从云托管、开发平台到高级教育内容，学生开发人员包包含数十项合作伙伴优惠和资源，让学生免费使用专业工具。',
    'See the pack': '查看开发人员包',
    'Have questions or need help? Join in on the conversation and meet fellow students and teachers all learning together with GitHub.':
      '有疑问或需要帮助？加入讨论，结识同样在使用 GitHub 学习的学生和教师。',
    'Learn how to use GitHub with interactive courses designed for beginners and experts.':
      '通过为初学者和专家设计的交互式课程学习如何使用 GitHub。',

    // 常见问题：教师页与学校页共用的「GitHub 教育是什么 / 为什么加入」
    'What is GitHub Education?': 'GitHub 教育是什么？',
    "GitHub Education is a community dedicated to empowering the next generation of developers through the power of open-source education. Whether you're a student eager to make your mark, an educator aiming to inspire, or an early career developer looking to sharpen your skills, GitHub Education is here to help you succeed.":
      'GitHub 教育是一个致力于通过开源教育的力量赋能下一代开发人员的社区。无论你是渴望崭露头角的学生、希望启发他人的教育工作者，还是想要磨炼技能的职业生涯早期开发人员，GitHub 教育都会助你成功。',
    'Why Join GitHub Education?': '为什么加入 GitHub 教育？',
    // 各条好处：<b>标题</b> 后接以冒号开头的说明文字
    'Free access to tools': '免费使用工具',
    'Real-world experience': '实践经验',
    ': Engage in open source projects and collaborative development to gain practical experience and build a portfolio of contributions. This hands-on approach prepares you for a successful career in tech, offering real-world application and visibility.':
      '：参与开源项目和协作开发，积累实践经验并建立贡献作品集。这种动手实践的方式为你在技术领域的成功职业生涯做好准备，带来真实的应用场景和曝光度。',
    'Exclusive learning content': '独家学习内容',
    ': Explore our Learning Paths to find structured educational content designed to guide your learning. These paths provide a clear progression through different tech topics, helping you enhance your knowledge and skills at your own pace.':
      '：探索我们的学习路径，找到旨在引导你学习的结构化教育内容。这些路径提供贯穿不同技术主题的清晰进阶，帮助你按自己的节奏提升知识和技能。',
    'Global network': '全球网络',
    ': Connect campus advisors and experts, and attend special events and live streams. Each connection will expand your horizon and open doors to new growth opportunities.':
      '：联系校园顾问和专家，参加特别活动和直播。每一次联系都会开阔你的视野，打开新的成长机会之门。',
    // 教师页：<a>Sign up for free</a> and take …（整句见 inline）；学校页：同一句是只隔注释的文本组
    'Sign up for free and take the first step toward becoming a leader in technology and innovation.':
      '免费注册，迈出成为技术与创新领导者的第一步。',
    'and take the first step toward becoming a leader in technology and innovation.':
      '，迈出成为技术与创新领导者的第一步。',
  },
  scoped: {
    // 页内导航、标签页标题；Partners、Education、More 由 common 提供
    Students: '学生',
    Teachers: '教师',
    Schools: '学校',
    'GitHub Education': 'GitHub 教育',
    'Students - GitHub Education': '学生 - GitHub 教育',
    'Teachers - GitHub Education': '教师 - GitHub 教育',
    'Schools - GitHub Education': '学校 - GitHub 教育',
    'Partners - GitHub Education': '合作伙伴 - GitHub 教育',
    // dashboard/onboarding 的 static 仍译「加入 GitHub Education」，本页按 product-names.md 译中文
    'Join GitHub Education': '加入 GitHub 教育',
    'Join the conversation': '加入讨论',
    'Jump in': '立即参与',
    'Student Developer Pack': '学生开发人员包',

    // 全局导航、页脚里的产品名：common 现译仍为英文或未收录，等待全站 sweep 统一到 common
    // （Marketplace、GitHub Marketplace、Code Quality 已由 common/marketing.ts 的 static 译出，
    // GitHub Mobile 已由 auth/two-factor.ts 的 static 译出，不再重复）
    Actions: '操作',
    Codespaces: '代码空间',
    'GitHub Advanced Security': 'GitHub 高级安全',
    'Copilot for Business': 'Copilot 商业版',
    'GitHub Skills': 'GitHub 技能',
    'GitHub Sponsors': 'GitHub 赞助',
    'GitHub Desktop': 'GitHub 桌面版',
  },
  inline: [
    // 教师页常见问题：<a>Sign up for free</a> and take the first step …
    [
      '{} and take the first step toward becoming a leader in technology and innovation.',
      '{}，迈出成为技术与创新领导者的第一步。',
    ],
  ],
  ignore: [
    // 推荐语（第三方引言、人名与职务、公司名）
    'figure[class*="Testimonial-module__Testimonial___"]',
    // 「看看学校如何使用 GitHub」卡片标题是学校名（链接到博客文章）
    'a[class*="Card-module__Card__link___"][href^="https://github.blog/"]',
  ],
} satisfies PageDictionary
