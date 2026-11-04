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
    'Hey students, your tech career starts here': '同學們，你的科技職涯從這裡開始',
    'Open the doors to innovation and growth in the tech world': '開啟科技世界的創新和成長之門',

    // GitHub 专业版权益（数字见 regexp；「Unlimited repositories」短而通用，见 scoped）
    'Free GitHub Pro account for verified learners': '已驗證的學習者可免費取得 GitHub 專業版帳號',
    'Private repos with advanced collaboration tools to keep all your projects in one place.':
      '私人儲存庫搭配進階協作工具，將你的所有專案集中在同一處。',
    'Build anywhere': '隨處建置',
    'More room for ideas': '更多創意空間',

    // 技能折叠面板
    'Build your skills and launch your future with GitHub': '運用 GitHub 培養技能並開創你的未來',
    'Code in the cloud with GitHub Codespaces': '透過 GitHub 程式碼空間在雲端寫程式',
    'GitHub Codespaces provides a powerful, cloud-based development environment accessible from any device with internet access. Codespaces offers a consistent, customizable platform that scales with your development needs, supporting your journey from beginner to advanced projects, wherever you are.':
      'GitHub 程式碼空間提供功能強大的雲端開發環境，可從任何連網裝置存取。程式碼空間的平台一致且可自訂，能隨你的開發需求擴充，無論你身在何處，都能支援你從初學一路邁向進階專案。',
    'Learn faster and code better with GitHub Copilot Student': '透過 GitHub Copilot 學生版加快學習並寫出更好的程式碼',
    // GitHub Copilot <!-- -->Student<!-- --> is your AI-powered coding companion. …（整组）
    "GitHub Copilot Student is your AI-powered coding companion. Available for free to verified students, teachers, and open-source maintainers, Copilot offers real-time, context-aware code suggestions right in your editor—whether you're learning the ropes or an experienced developer.":
      'GitHub Copilot 學生版是你的 AI 程式開發夥伴。已驗證的學生、教師和開源維護者都能免費使用，Copilot 直接在你的編輯器中提供即時且能理解上下文的程式碼建議——無論你是剛入門的新手還是經驗豐富的開發人員。',
    "is your AI-powered coding companion. Available for free to verified students, teachers, and open-source maintainers, Copilot offers real-time, context-aware code suggestions right in your editor—whether you're learning the ropes or an experienced developer.":
      '是你的 AI 程式開發夥伴。已驗證的學生、教師和開源維護者都能免費使用，Copilot 直接在你的編輯器中提供即時且能理解上下文的程式碼建議——無論你是剛入門的新手還是經驗豐富的開發人員。',
    'Become a leader in tech with GitHub Campus Experts': '透過 GitHub 校園專家成為科技領袖',
    'As a GitHub Campus Expert, you’ll receive training and support to enhance your skills in public speaking, technical writing, community management, and more. Start making a significant impact at your campus and build your future in technology today.':
      '身為 GitHub 校園專家，你將獲得培訓和支援，精進公開演說、技術寫作、社群管理等技能。立即開始在你的校園發揮重大影響力，打造你在科技領域的未來。',
    'Learn more about Campus Experts': '瞭解校園專家',
    'Work on real-world projects with Community Exchange': '透過社群交流參與實際專案',
    "Find and collaborate on projects that take your skills further. Community Exchange brings together students and educators to share valuable learning resources, from code samples and tutorials to full projects. Whether you're contributing your own work or helping others, this is where you expand your knowledge through practical experience.":
      '尋找並協作參與能讓你的技能更上一層樓的專案。社群交流匯聚學生和教育工作者，分享寶貴的學習資源，從程式碼範例、教學課程到完整專案應有盡有。無論是貢獻自己的作品還是協助他人，這裡都是你透過實務經驗拓展知識的地方。',

    // 学生开发人员包
    'The Student Developer Pack': '學生開發人員套件',
    'Discover the Student Developer Pack': '探索學生開發人員套件',
    'Access professional developer tools and partner offers at no cost.': '免費使用專業開發人員工具和合作夥伴優惠。',
    'Build skills with step-by-step Learning Paths for every experience level.': '透過適合各種經驗程度、循序漸進的學習路徑培養技能。',
    'Explore curated Experiences in Web Development, Data Science & Machine Learning, and more.':
      '探索網頁開發、資料科學和機器學習等領域的精選體驗。',

    // CTA
    'Subscribe to our newsletter': '訂閱我們的電子報',

    // 常见问题
    'Am I eligible to get the Student Developer Pack?': '我有資格取得學生開發人員套件嗎？',
    // … please <!-- -->read our docs on applying<!-- -->.（整组）
    'If you’re a student aged 13+ and enrolled in a degree or diploma-granting course of study, the GitHub Student Developer Pack is for you. All you need is a school-issued email address and/or official, dated proof of enrollment. For more information about the application process and what documents we accept, please read our docs on applying.':
      '如果你是年滿 13 歲、就讀可授予學位或文憑課程的學生，GitHub 學生開發人員套件就是為你準備的。你只需要學校核發的電子郵件地址和/或註明日期的正式在學證明。如需瞭解申請流程和我們接受的文件，請閱讀我們的申請說明文件。',
    'If you’re a student aged 13+ and enrolled in a degree or diploma-granting course of study, the GitHub Student Developer Pack is for you. All you need is a school-issued email address and/or official, dated proof of enrollment. For more information about the application process and what documents we accept, please':
      '如果你是年滿 13 歲、就讀可授予學位或文憑課程的學生，GitHub 學生開發人員套件就是為你準備的。你只需要學校核發的電子郵件地址和/或註明日期的正式在學證明。如需瞭解申請流程和我們接受的文件，請',
    'read our docs on applying': '閱讀我們的申請說明文件'
  },
  scoped: {
    'Get verified': '取得驗證',
    // auth/signup 等页面另有本页译法，短标签放 scoped
    'Unlimited repositories': '無限量儲存庫'
  },
  regexp: [
    // 3K Actions minutes and 180 Codespaces hours per month.
    [
      /^(\d+)K Actions minutes and (\d+) Codespaces hours per month\.$/,
      (_, minutes, hours) => joinCjk(`每月 ${thousands(minutes!)}`, `動作分鐘數和 ${hours} 程式碼空間時數。`)
    ],
    // 2 GB Packages storage and 20 GB Codespaces storage.
    [/^(\d+) GB Packages storage and (\d+) GB Codespaces storage\.$/, '$1 GB 套件儲存空間和 $2 GB 程式碼空間的儲存空間。']
  ]
} satisfies PageDictionary
