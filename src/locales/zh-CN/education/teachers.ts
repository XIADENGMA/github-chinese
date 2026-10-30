import type { PageDictionary } from '../../../core/types'

/**
 * 教师页（/education/teachers）：首屏、GitHub 团队版权益、折叠面板、CTA、合作伙伴工具卡片、常见问题。
 * 常见问题里的链接把句子拆开：键长在引擎上限内的整句用 inline，超过的按片段收录；
 * 「Free access to tools」说明超过采集上限（400 字符），按快照照录。
 */
export default {
  static: {
    // 首屏
    'Enhance your teaching experience with GitHub': '用 GitHub 提升你的教学体验',
    'Whether you’re teaching a class or managing an entire curriculum, GitHub Education is here to support you.':
      '无论你是教授一门课程还是管理整个课程体系，GitHub 教育都会为你提供支持。',
    'Check out the Teacher Toolbox': '查看教师工具箱',

    // GitHub 团队版权益
    'Get your GitHub Teams account, free for teachers': '获取你的 GitHub 团队版帐户，教师免费',
    'Unlimited private repositories': '无限专用存储库',
    'Manage class projects with unlimited private repos and advanced collaboration tools.':
      '使用无限专用存储库和高级协作工具管理课堂项目。',
    'Team organization and permissions': '团队组织和权限',
    'Simplify classroom management with structured team roles and permission settings.':
      '通过结构化的团队角色和权限设置简化课堂管理。',
    'Enhanced classroom security': '增强的课堂安全',
    'Keep your educational content secure with advanced security features like two-factor authentication.':
      '借助双因素身份验证等高级安全功能保护你的教育内容。',

    // 折叠面板：<b>Empower your classroom</b> with professional developer tools
    // <b> 前没有文本节点，译文不能前置；原文无标点、译文不加标点，两段之间保留原文的空格
    'Empower your classroom': '赋能你的课堂',
    'with professional developer tools': '借助专业开发人员工具',
    'Foster collaboration with GitHub Teams': '用 GitHub 团队版促进协作',
    'Give your students a head start with GitHub Teams for education—offered at no cost. They’ll collaborate on projects in private repositories, handle access with advanced tools, and master industry-standard workflows. This mirrors the professional development environment, nurturing essential skills for their future tech careers.':
      '让你的学生用面向教育的 GitHub 团队版赢在起跑线——免费提供。他们将在专用存储库中协作完成项目，使用高级工具管理访问权限，并掌握行业标准工作流。这与专业开发环境如出一辙，培养他们未来技术职业所需的关键技能。',
    'Learn more about GitHub Team': '了解 GitHub 团队版',
    'Harness the AI power of GitHub Copilot Pro': '发挥 GitHub Copilot 专业版的 AI 力量',
    'Enhance your curriculum with AI-powered code suggestions and assignment generation, simplifying lesson planning and encouraging student engagement. It’s free for verified educators.':
      '用 AI 驱动的代码建议和作业生成增强你的课程，简化教案规划并提高学生参与度。已验证的教育工作者可免费使用。',
    'Learn more about GitHub Copilot': '了解 GitHub Copilot',
    'Grow your network with Teacher Discussions': '通过教师讨论拓展你的人脉',
    'Join our invitation-only Teacher Discussions to connect with a global network of educators where you can share innovative teaching strategies and explore new ideas.':
      '加入我们仅限邀请的教师讨论，与全球教育工作者网络建立联系，分享创新教学策略并探索新想法。',

    // CTA
    'Join us today and take the first step toward transforming the way you teach.':
      '立即加入我们，迈出改变你教学方式的第一步。',
    'Read GitHub Education blog posts': '阅读 GitHub 教育博客文章',

    // 「更进一步」卡片：Codio、Classroom 50 是合作伙伴的产品名，保留原文
    'Codio is a hands-on learning platform that combines interactive courseware, browser-based coding environments, and auto grading in one place. Instructors get free access — no cost to create curriculum, use the migration tool, or explore the full platform.':
      'Codio 是一个动手学习平台，将交互式课件、基于浏览器的编码环境和自动评分集于一处。讲师可免费使用——创建课程、使用迁移工具或探索完整平台均不收费。',
    'Explore codio': '探索 codio',
    'Classroom 50 is a free, open-source alternative to GitHub Classroom from the Fifty Foundation. It helps teachers distribute assignments, configure auto-grading with GitHub Actions, and review student submissions through both web and command-line interfaces.':
      'Classroom 50 是 Fifty Foundation 推出的 GitHub 课堂免费开源替代方案。它帮助教师分发作业、使用 GitHub 操作配置自动评分，并通过网页和命令行界面审查学生提交的内容。',
    'Explore Classroom 50': '探索 Classroom 50',
    'The Teacher Toolbox is your central go-to resource for all things GitHub. It includes helpful links, guides, learning modules, sample curriculum, use cases, videos, and articles to help teachers use GitHub in the classroom.':
      '教师工具箱是你了解 GitHub 一切内容的核心资源。它包含实用链接、指南、学习模块、示例课程、使用场景、视频和文章，帮助教师在课堂中使用 GitHub。',
    'Browse the Teacher Toolbox': '浏览教师工具箱',

    // 常见问题：「免费使用工具」说明（教师页版本）
    ': Jump-start your development journey with the GitHub Student Developer Pack, offering dozens of premium tools and services at no cost. From AI-powered coding assistance with free access to Copilot, to GitHub Codespaces which provide a fully configured cloud development environment, these tools are used daily by professional developers globally. They’d normally cost a fortune, but are available for free to verified students.':
      '：通过 GitHub 学生开发人员包快速开启你的开发之旅，免费获得数十款高级工具和服务。从可免费使用 Copilot 的 AI 驱动编码辅助，到提供完整配置云端开发环境的 GitHub 代码空间，这些工具是全球专业开发人员每天都在使用的。它们通常价格不菲，但已验证的学生可免费使用。',
    'How can I qualify for GitHub Education benefits as a teacher?': '作为教师，我如何获得 GitHub 教育福利的资格？',
    // … through our <a>GitHub Education for Teachers</a> portal.（整句见 inline；片段供逐段回退）
    'To access GitHub Education benefits, you need to be a currently employed educator at an accredited educational institution. Please apply by submitting proof of academic employment, such as a faculty ID or employment verification letter, using your institutional email address through our':
      '要获得 GitHub 教育福利，你需要是经认证教育机构的在职教育工作者。请提交学术任职证明（如教职工 ID 或在职证明信），使用你的机构电子邮件地址，通过我们的',
    'GitHub Education for Teachers': '面向教师的 GitHub 教育',
    'How do I access free GitHub Copilot Pro?': '如何免费使用 GitHub Copilot 专业版？',
    // … in our <a>GitHub Education for educators</a> documentation page.（键长超过引擎上限，按片段收录）
    'This free benefit is available to teachers who qualify for GitHub Education. To apply, please provide proof of your current academic position using your official academic email address along with supplementary documents, such as a faculty ID or an employment verification letter, via our Teacher Application. You can find more information in our':
      '此免费福利面向符合 GitHub 教育资格的教师。要申请，请通过我们的教师申请，使用你的官方学术电子邮件地址提供当前学术职位证明，并附上补充文件（如教职工 ID 或在职证明信）。更多信息请参阅我们的',
    'GitHub Education for educators': '面向教育工作者的 GitHub 教育',
    'documentation page.': '文档页面。',
    'What should I do if my application for GitHub Education benefits was not approved?':
      '如果我的 GitHub 教育福利申请未获批准，该怎么办？',
    'If your application was not approved, it may be due to insufficient proof of current academic employment or affiliation with a non-degree granting institution. Ensure your application includes a clear academic email address and proper employment documentation. You may update your information and reapply as needed.':
      '如果你的申请未获批准，可能是因为当前学术任职证明不足，或所属机构不授予学位。请确保你的申请包含清晰的学术电子邮件地址和适当的任职文件。你可以根据需要更新信息并重新申请。',
  },
  scoped: {
    'Teacher Toolbox': '教师工具箱',
    // 只用于「… through our <a>GitHub Education for Teachers</a> portal.」逐段回退，动词「申请」落在此段
    'portal.': '门户申请。',
  },
  inline: [
    // … using your institutional email address through our <a>GitHub Education for Teachers</a> portal.
    [
      'To access GitHub Education benefits, you need to be a currently employed educator at an accredited educational institution. Please apply by submitting proof of academic employment, such as a faculty ID or employment verification letter, using your institutional email address through our {} portal.',
      '要获得 GitHub 教育福利，你需要是经认证教育机构的在职教育工作者。请通过我们的{}门户，使用你的机构电子邮件地址提交学术任职证明（如教职工 ID 或在职证明信）来申请。',
    ],
  ],
} satisfies PageDictionary
