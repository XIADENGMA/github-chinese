import type { PageDictionary } from '../../../core/types'
import { joinCjk } from '../helpers'
import { thousands } from './numbers'

/**
 * 学生页（/education/students）：首屏、GitHub 专业版权益、技能折叠面板、学生开发人员包、CTA、常见问题。
 * 「GitHub Copilot <!-- -->Student<!-- --> is your …」等只隔注释的相邻文本先整组匹配，整句照录。
 */
export default {
  static: {
    // 首屏
    'Hey students, your tech career starts here': '同学们，你的技术职业从这里开始',
    'Open the doors to innovation and growth in the tech world': '打开技术世界创新与成长的大门',

    // GitHub 专业版权益（数字见 regexp；「Unlimited repositories」短而通用，见 scoped）
    'Free GitHub Pro account for verified learners': '已验证学习者免费获得 GitHub 专业版帐户',
    'Private repos with advanced collaboration tools to keep all your projects in one place.':
      '专用存储库配备高级协作工具，让你的所有项目集中于一处。',
    'Build anywhere': '随处构建',
    'More room for ideas': '更多创意空间',

    // 技能折叠面板
    'Build your skills and launch your future with GitHub': '用 GitHub 提升技能并开启你的未来',
    'Code in the cloud with GitHub Codespaces': '使用 GitHub 代码空间在云端编码',
    'GitHub Codespaces provides a powerful, cloud-based development environment accessible from any device with internet access. Codespaces offers a consistent, customizable platform that scales with your development needs, supporting your journey from beginner to advanced projects, wherever you are.':
      'GitHub 代码空间提供强大的云端开发环境，任何联网设备都能访问。代码空间提供一致、可自定义的平台，随你的开发需求扩展，无论身在何处，都支持你从入门到高级项目的进阶之旅。',
    'Learn faster and code better with GitHub Copilot Student': '借助 GitHub Copilot 学生版更快学习并写出更好的代码',
    // GitHub Copilot <!-- -->Student<!-- --> is your AI-powered coding companion. …（整组）
    "GitHub Copilot Student is your AI-powered coding companion. Available for free to verified students, teachers, and open-source maintainers, Copilot offers real-time, context-aware code suggestions right in your editor—whether you're learning the ropes or an experienced developer.":
      'GitHub Copilot 学生版是你的 AI 驱动编码伙伴。已验证的学生、教师和开源维护者可免费使用，Copilot 直接在你的编辑器中提供实时、感知上下文的代码建议——无论你是初学者还是经验丰富的开发人员。',
    "is your AI-powered coding companion. Available for free to verified students, teachers, and open-source maintainers, Copilot offers real-time, context-aware code suggestions right in your editor—whether you're learning the ropes or an experienced developer.":
      '是你的 AI 驱动编码伙伴。已验证的学生、教师和开源维护者可免费使用，Copilot 直接在你的编辑器中提供实时、感知上下文的代码建议——无论你是初学者还是经验丰富的开发人员。',
    'Become a leader in tech with GitHub Campus Experts': '通过 GitHub 校园专家成为技术领袖',
    'As a GitHub Campus Expert, you’ll receive training and support to enhance your skills in public speaking, technical writing, community management, and more. Start making a significant impact at your campus and build your future in technology today.':
      '作为 GitHub 校园专家，你将获得培训和支持，提升公开演讲、技术写作、社区管理等技能。立即开始在你的校园产生重大影响，构建你的技术未来。',
    'Learn more about Campus Experts': '了解校园专家',
    'Work on real-world projects with Community Exchange': '通过社区交流参与真实项目',
    "Find and collaborate on projects that take your skills further. Community Exchange brings together students and educators to share valuable learning resources, from code samples and tutorials to full projects. Whether you're contributing your own work or helping others, this is where you expand your knowledge through practical experience.":
      '寻找并协作参与能进一步提升你技能的项目。社区交流汇聚学生和教育工作者，共享宝贵的学习资源，从代码示例、教程到完整项目。无论是贡献自己的作品还是帮助他人，这里都是你通过实践拓展知识的地方。',

    // 学生开发人员包
    'The Student Developer Pack': '学生开发人员包',
    'Discover the Student Developer Pack': '探索学生开发人员包',
    'Access professional developer tools and partner offers at no cost.': '免费使用专业开发人员工具和合作伙伴优惠。',
    'Build skills with step-by-step Learning Paths for every experience level.':
      '通过面向各经验水平的分步学习路径提升技能。',
    'Explore curated Experiences in Web Development, Data Science & Machine Learning, and more.':
      '探索 Web 开发、数据科学与机器学习等领域的精选体验。',

    // CTA
    'Subscribe to our newsletter': '订阅我们的通讯',

    // 常见问题
    'Am I eligible to get the Student Developer Pack?': '我是否有资格获得学生开发人员包？',
    // … please <!-- -->read our docs on applying<!-- -->.（整组）
    'If you’re a student aged 13+ and enrolled in a degree or diploma-granting course of study, the GitHub Student Developer Pack is for you. All you need is a school-issued email address and/or official, dated proof of enrollment. For more information about the application process and what documents we accept, please read our docs on applying.':
      '如果你是 13 岁及以上、就读于授予学位或文凭课程的学生，GitHub 学生开发人员包就是为你准备的。你只需要一个学校电子邮件地址和/或带日期的官方在读证明。有关申请流程和我们接受的文件的更多信息，请阅读我们的申请文档。',
    'If you’re a student aged 13+ and enrolled in a degree or diploma-granting course of study, the GitHub Student Developer Pack is for you. All you need is a school-issued email address and/or official, dated proof of enrollment. For more information about the application process and what documents we accept, please':
      '如果你是 13 岁及以上、就读于授予学位或文凭课程的学生，GitHub 学生开发人员包就是为你准备的。你只需要一个学校电子邮件地址和/或带日期的官方在读证明。有关申请流程和我们接受的文件的更多信息，请',
    'read our docs on applying': '阅读我们的申请文档',
  },
  scoped: {
    'Get verified': '获得验证',
    // auth/signup 等页面另有本页译法，短标签放 scoped
    'Unlimited repositories': '无限存储库',
  },
  regexp: [
    // 3K Actions minutes and 180 Codespaces hours per month.
    [
      /^(\d+)K Actions minutes and (\d+) Codespaces hours per month\.$/,
      (_, minutes, hours) => joinCjk(`每月 ${thousands(minutes!)}`, `分钟操作和 ${hours} 小时代码空间。`),
    ],
    // 2 GB Packages storage and 20 GB Codespaces storage.
    [/^(\d+) GB Packages storage and (\d+) GB Codespaces storage\.$/, '$1 GB 软件包存储和 $2 GB 代码空间存储。'],
  ],
} satisfies PageDictionary
