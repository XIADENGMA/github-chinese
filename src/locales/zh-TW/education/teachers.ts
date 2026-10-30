import type { PageDictionary } from '../../../core/types'

/**
 * 教师页（/education/teachers）：首屏、GitHub 团队版权益、折叠面板、CTA、合作伙伴工具卡片、常见问题。
 * 常见问题里的链接把句子拆开：键长在引擎上限内的整句用 inline，超过的按片段收录；
 * 「Free access to tools」说明超过采集上限（400 字符），按快照照录。
 */
export default {
  static: {
    // 首屏
    'Enhance your teaching experience with GitHub': '運用 GitHub 提升你的教學體驗',
    'Whether you’re teaching a class or managing an entire curriculum, GitHub Education is here to support you.':
      '無論你是教授一門課，還是管理整套課程，GitHub 教育都能為你提供支援。',
    'Check out the Teacher Toolbox': '查看教師工具箱',

    // GitHub 团队版权益
    'Get your GitHub Teams account, free for teachers': '取得你的 GitHub 團隊版帳號，教師免費使用',
    'Unlimited private repositories': '無限量私人儲存庫',
    'Manage class projects with unlimited private repos and advanced collaboration tools.':
      '運用無限量私人儲存庫和進階協作工具管理課堂專案。',
    'Team organization and permissions': '團隊組織和權限',
    'Simplify classroom management with structured team roles and permission settings.':
      '透過結構化的團隊角色和權限設定，簡化課堂管理。',
    'Enhanced classroom security': '強化課堂安全性',
    'Keep your educational content secure with advanced security features like two-factor authentication.':
      '透過雙重驗證等進階安全性功能，確保你的教育內容安全無虞。',

    // 折叠面板：<b>Empower your classroom</b> with professional developer tools
    // <b> 前没有文本节点，译文不能前置；原文无标点、译文不加标点，两段之间保留原文的空格
    'Empower your classroom': '強化你的課堂',
    'with professional developer tools': '運用專業開發人員工具',
    'Foster collaboration with GitHub Teams': '運用 GitHub 團隊版促進協作',
    'Give your students a head start with GitHub Teams for education—offered at no cost. They’ll collaborate on projects in private repositories, handle access with advanced tools, and master industry-standard workflows. This mirrors the professional development environment, nurturing essential skills for their future tech careers.':
      '用專為教育提供的 GitHub 團隊版讓你的學生搶先起步——完全免費。他們將在私人儲存庫中協作完成專案、使用進階工具管理存取權限，並精通業界標準的工作流程。這與專業開發環境如出一轍，能培養他們未來科技職涯不可或缺的技能。',
    'Learn more about GitHub Team': '瞭解 GitHub 團隊版',
    'Harness the AI power of GitHub Copilot Pro': '發揮 GitHub Copilot 專業版的 AI 威力',
    'Enhance your curriculum with AI-powered code suggestions and assignment generation, simplifying lesson planning and encouraging student engagement. It’s free for verified educators.':
      '運用 AI 驅動的程式碼建議和作業生成功能充實你的課程，簡化備課並提升學生參與度。已驗證的教育工作者可免費使用。',
    'Learn more about GitHub Copilot': '瞭解 GitHub Copilot',
    'Grow your network with Teacher Discussions': '透過教師討論拓展你的人脈',
    'Join our invitation-only Teacher Discussions to connect with a global network of educators where you can share innovative teaching strategies and explore new ideas.':
      '加入我們採邀請制的教師討論，與全球的教育工作者交流，分享創新的教學策略並探索新想法。',

    // CTA
    'Join us today and take the first step toward transforming the way you teach.':
      '立即加入我們，踏出改變教學方式的第一步。',
    'Read GitHub Education blog posts': '閱讀 GitHub 教育部落格文章',

    // 「更進一步」卡片：Codio、Classroom 50 是合作伙伴的产品名，保留原文
    'Codio is a hands-on learning platform that combines interactive courseware, browser-based coding environments, and auto grading in one place. Instructors get free access — no cost to create curriculum, use the migration tool, or explore the full platform.':
      'Codio 是動手實作的學習平台，將互動式教材、瀏覽器內的程式開發環境和自動評分整合在一起。講師可免費使用——建立課程、使用移轉工具或探索完整平台都不需付費。',
    'Explore codio': '探索 codio',
    'Classroom 50 is a free, open-source alternative to GitHub Classroom from the Fifty Foundation. It helps teachers distribute assignments, configure auto-grading with GitHub Actions, and review student submissions through both web and command-line interfaces.':
      'Classroom 50 是 Fifty Foundation 推出的免費開源 GitHub 教室替代方案。它協助教師發放作業、使用 GitHub 動作設定自動評分，並透過網頁和命令列介面批閱學生繳交的作業。',
    'Explore Classroom 50': '探索 Classroom 50',
    'The Teacher Toolbox is your central go-to resource for all things GitHub. It includes helpful links, guides, learning modules, sample curriculum, use cases, videos, and articles to help teachers use GitHub in the classroom.':
      '教師工具箱是你取得所有 GitHub 相關資源的首選。其中包含實用連結、指南、學習模組、範例課程、使用情境、影片和文章，協助教師在課堂上使用 GitHub。',
    'Browse the Teacher Toolbox': '瀏覽教師工具箱',

    // 常见问题：「免費使用工具」说明（教师页版本）
    ': Jump-start your development journey with the GitHub Student Developer Pack, offering dozens of premium tools and services at no cost. From AI-powered coding assistance with free access to Copilot, to GitHub Codespaces which provide a fully configured cloud development environment, these tools are used daily by professional developers globally. They’d normally cost a fortune, but are available for free to verified students.':
      '：透過 GitHub 學生開發人員套件快速展開你的開發之旅，免費取得數十種優質工具和服務。從可免費使用 Copilot 的 AI 輔助程式開發，到提供完整設定雲端開發環境的 GitHub 程式碼空間，這些都是全球專業開發人員每天使用的工具。它們通常所費不貲，但已驗證的學生可以免費使用。',
    'How can I qualify for GitHub Education benefits as a teacher?': '身為教師，我要如何符合 GitHub 教育權益的資格？',
    // … through our <a>GitHub Education for Teachers</a> portal.（整句见 inline；片段供逐段回退）
    'To access GitHub Education benefits, you need to be a currently employed educator at an accredited educational institution. Please apply by submitting proof of academic employment, such as a faculty ID or employment verification letter, using your institutional email address through our':
      '若要取得 GitHub 教育權益，你必須是經認可教育機構的在職教育工作者。請使用你的機構電子郵件地址提交學術任職證明（例如教職員證或在職證明書），並透過',
    'GitHub Education for Teachers': '適用於教師的 GitHub 教育',
    'How do I access free GitHub Copilot Pro?': '如何免費使用 GitHub Copilot 專業版？',
    // … in our <a>GitHub Education for educators</a> documentation page.（键长超过引擎上限，按片段收录）
    'This free benefit is available to teachers who qualify for GitHub Education. To apply, please provide proof of your current academic position using your official academic email address along with supplementary documents, such as a faculty ID or an employment verification letter, via our Teacher Application. You can find more information in our':
      '這項免費權益適用於符合 GitHub 教育資格的教師。若要申請，請透過我們的教師申請表，使用你的正式學術電子郵件地址提供目前學術職位的證明，並附上補充文件（例如教職員證或在職證明書）。如需詳細資訊，請參閱',
    'GitHub Education for educators': '適用於教育工作者的 GitHub 教育',
    'documentation page.': '說明文件頁面。',
    'What should I do if my application for GitHub Education benefits was not approved?':
      '如果我的 GitHub 教育權益申請未獲核准，該怎麼辦？',
    'If your application was not approved, it may be due to insufficient proof of current academic employment or affiliation with a non-degree granting institution. Ensure your application includes a clear academic email address and proper employment documentation. You may update your information and reapply as needed.':
      '如果你的申請未獲核准，原因可能是目前學術任職的證明不足，或你所屬的機構不授予學位。請確認你的申請包含清楚的學術電子郵件地址和適當的任職文件。你可以視需要更新資訊並重新申請。',
  },
  scoped: {
    'Teacher Toolbox': '教師工具箱',
    // 只用于「… through our <a>GitHub Education for Teachers</a> portal.」逐段回退，动词「提出申請」落在此段
    'portal.': '入口網站提出申請。',
  },
  inline: [
    // … using your institutional email address through our <a>GitHub Education for Teachers</a> portal.
    [
      'To access GitHub Education benefits, you need to be a currently employed educator at an accredited educational institution. Please apply by submitting proof of academic employment, such as a faculty ID or employment verification letter, using your institutional email address through our {} portal.',
      '若要取得 GitHub 教育權益，你必須是經認可教育機構的在職教育工作者。請透過{}入口網站，使用你的機構電子郵件地址提交學術任職證明（例如教職員證或在職證明書）以提出申請。',
    ],
  ],
} satisfies PageDictionary
