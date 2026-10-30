import type { PageDictionary } from '../../../core/types'

/**
 * 教育页共用：页内导航（Students / Teachers / Schools / Partners）、首屏眉题与标签页标题、
 * 多个教育页共用的 CTA 横幅、「更進一步」卡片、常见问题，以及推荐语（第三方引言）的忽略规则。
 * 全局导航与页脚里单独出现的产品名按 GLOSSARY.zh-TW 第 3 节译成中文：与简体同键保留 scoped，
 * 译文与 common/global-nav.ts、common/marketing.ts 的 static 一致。
 */
export default {
  static: {
    // 三个教育页共用的 CTA 横幅
    'Begin your GitHub Education journey': '展開你的 GitHub 教育之旅',
    'Join us today and take the first step towards transforming your tech education experience.':
      '立即加入我們，踏出改變你的科技教育體驗的第一步。',
    'Join us today and take the first step toward transforming your tech education experience.':
      '立即加入我們，踏出改變你的科技教育體驗的第一步。',

    // 「更進一步」区块：标题见学生页、教师页，卡片说明见 /education、学生页
    'Go further with these': '運用這些資源更進一步',
    'From cloud hosting to development platforms and premium educational content, the Student Developer Pack includes dozens of partner offers and resources that will allow students to use professional tools at no cost.':
      '從雲端代管、開發平台到優質教育內容，學生開發人員套件包含數十項合作夥伴優惠和資源，讓學生免費使用專業工具。',
    'See the pack': '查看開發人員套件',
    'Have questions or need help? Join in on the conversation and meet fellow students and teachers all learning together with GitHub.':
      '有疑問或需要協助嗎？加入討論，認識同樣透過 GitHub 一起學習的學生和教師。',
    'Learn how to use GitHub with interactive courses designed for beginners and experts.':
      '透過專為初學者和專家設計的互動式課程，學習如何使用 GitHub。',

    // 常见问题：教师页与学校页共用的「GitHub 教育是什麼 / 為什麼要加入」
    'What is GitHub Education?': 'GitHub 教育是什麼？',
    "GitHub Education is a community dedicated to empowering the next generation of developers through the power of open-source education. Whether you're a student eager to make your mark, an educator aiming to inspire, or an early career developer looking to sharpen your skills, GitHub Education is here to help you succeed.":
      'GitHub 教育是一個致力於透過開源教育的力量培育下一代開發人員的社群。無論你是渴望嶄露頭角的學生、希望啟發他人的教育工作者，還是初入職場、想精進技能的開發人員，GitHub 教育都能助你成功。',
    'Why Join GitHub Education?': '為什麼要加入 GitHub 教育？',
    // 各条好处：<b>标题</b> 后接以冒号开头的说明文字
    'Free access to tools': '免費使用工具',
    'Real-world experience': '實務經驗',
    ': Engage in open source projects and collaborative development to gain practical experience and build a portfolio of contributions. This hands-on approach prepares you for a successful career in tech, offering real-world application and visibility.':
      '：參與開源專案和協作開發，累積實務經驗並建立貢獻作品集。這種動手實作的方式為你在科技業的成功職涯做好準備，並提供實際應用的機會和能見度。',
    'Exclusive learning content': '獨家學習內容',
    ': Explore our Learning Paths to find structured educational content designed to guide your learning. These paths provide a clear progression through different tech topics, helping you enhance your knowledge and skills at your own pace.':
      '：探索我們的學習路徑，找到專為引導你學習而設計的結構化教育內容。這些路徑循序漸進地帶你學習不同的科技主題，協助你依自己的步調增進知識和技能。',
    'Global network': '全球人脈',
    ': Connect campus advisors and experts, and attend special events and live streams. Each connection will expand your horizon and open doors to new growth opportunities.':
      '：結識校園顧問和專家，參加特別活動和直播。每一次交流都能拓展你的視野，為你開啟新的成長機會。',
    // 教师页：<a>Sign up for free</a> and take …（整句见 inline）；学校页：同一句是只隔注释的文本组
    'Sign up for free and take the first step toward becoming a leader in technology and innovation.':
      '免費註冊，踏出成為科技和創新領域領導者的第一步。',
    'and take the first step toward becoming a leader in technology and innovation.':
      '，踏出成為科技和創新領域領導者的第一步。',
  },
  scoped: {
    // 页内导航、标签页标题；Partners、Education、More 由 common 提供
    Students: '學生',
    Teachers: '教師',
    Schools: '學校',
    'GitHub Education': 'GitHub 教育',
    'Students - GitHub Education': '學生 - GitHub 教育',
    'Teachers - GitHub Education': '教師 - GitHub 教育',
    'Schools - GitHub Education': '學校 - GitHub 教育',
    'Partners - GitHub Education': '合作夥伴 - GitHub 教育',
    // dashboard/onboarding 的 static 同样译「加入 GitHub 教育」；本页与简体同键保留 scoped
    'Join GitHub Education': '加入 GitHub 教育',
    'Join the conversation': '加入討論',
    'Jump in': '立即參與',
    'Student Developer Pack': '學生開發人員套件',

    // 全局导航、页脚里的产品名：与简体同键保留 scoped，译文与 common 的 static 一致
    // （Marketplace、GitHub Marketplace、Code Quality 由 common/marketing.ts 的 static 译出，
    // GitHub Mobile 由 auth/two-factor.ts 的 static 译出，不在此重复）
    Actions: '動作',
    Codespaces: '程式碼空間',
    'GitHub Advanced Security': 'GitHub 進階安全性',
    'Copilot for Business': 'Copilot 商務版',
    'GitHub Skills': 'GitHub 技能',
    'GitHub Sponsors': 'GitHub 贊助',
    'GitHub Desktop': 'GitHub 桌面版',
  },
  inline: [
    // 教师页常见问题：<a>Sign up for free</a> and take the first step …
    [
      '{} and take the first step toward becoming a leader in technology and innovation.',
      '{}，踏出成為科技和創新領域領導者的第一步。',
    ],
  ],
  ignore: [
    // 推荐语（第三方引言、人名与职务、公司名）
    'figure[class*="Testimonial-module__Testimonial___"]',
    // 「看看各校如何使用 GitHub」卡片标题是学校名（链接到博客文章）
    'a[class*="Card-module__Card__link___"][href^="https://github.blog/"]',
  ],
} satisfies PageDictionary
