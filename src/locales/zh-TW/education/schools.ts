import type { PageDictionary } from '../../../core/types'
import { joinCjk } from '../helpers'
import { thousands } from './numbers'

/**
 * 学校页（/education/schools）：首屏、三项优势、全校方案折叠面板、GitHub 课堂、CTA、学校案例卡片、常见问题。
 * 常见问题里只隔注释的相邻文本（Actions / Codespaces / Copilot、Terms and Conditions、Let us know 等）
 * 先整组匹配，整句照录；再给出各段，供分段时回退。学校案例卡片的标题是学校名，由 shared 的忽略规则排除。
 */
export default {
  static: {
    // 首屏
    'Teach with industry-standard tools': '使用業界標準工具教學',
    'Get free access with training for students and faculty': '免費使用並獲得針對學生和教職員的培訓',

    // 三项优势
    'Enhance your technical curriculum': '強化你的技術課程',
    "Elevate your lessons with GitHub's advanced tools and provide students access to current industry practices.":
      '運用 GitHub 的進階工具提升你的課程，讓學生接觸業界現行的實務做法。',
    'Reinvigorate your teaching methods': '為你的教學方法注入新活力',
    'Use GitHub to automate feedback and manage coursework, which can make your sessions more dynamic and interactive.':
      '使用 GitHub 自動提供回饋並管理課業，讓你的課堂更有活力、更具互動性。',
    'Boost collaboration across campus': '促進全校協作',
    // 句末的「.」是单独的文本节点
    'Make it easier for students and educators to collaborate on projects and assignments.':
      '讓學生和教育工作者更輕鬆地協作完成專案和作業。',
    'Make it easier for students and educators to collaborate on projects and assignments':
      '讓學生和教育工作者更輕鬆地協作完成專案和作業',

    // 全校方案折叠面板
    'Unlock a passion for learning with GitHub for your whole school': '運用 GitHub 為全校點燃學習熱情',
    'Deploy GitHub Enterprise at your school, for free': '在你的學校免費部署 GitHub 企業版',
    // … Leverage GitHub <!-- -->Actions<!-- -->, <!-- -->Codespaces<!-- -->, and <!-- -->Copilot<!-- --> to elevate …
    'Implement GitHub Enterprise Server and Cloud in your school to unlock a suite of advanced tools for educators and students. Leverage GitHub Actions, Codespaces, and Copilot to elevate your technical education and collaboration standards.':
      '在你的學校部署 GitHub 企業伺服器和企業雲端，為教育工作者和學生解鎖一整套進階工具。善用 GitHub 動作、程式碼空間和 Copilot 來提升你的技術教育和協作水準。',
    'Implement GitHub Enterprise Server and Cloud in your school to unlock a suite of advanced tools for educators and students. Leverage GitHub':
      '在你的學校部署 GitHub 企業伺服器和企業雲端，為教育工作者和學生解鎖一整套進階工具。善用 GitHub',
    'to elevate your technical education and collaboration standards.': '來提升你的技術教育和協作水準。',
    'Explore GitHub Copilot': '探索 GitHub Copilot',
    'Build student tech communities': '建立學生科技社群',
    "Foster diverse technology communities on your campus through GitHub's comprehensive support system, offering training and mentorship to empower student growth and innovation.":
      '透過 GitHub 完善的支援體系，在你的校園培育多元的科技社群，並提供培訓和輔導，促進學生的成長和創新。',
    // 两句之间只隔注释
    'Support your faculty by integrating Git and GitHub into their teaching toolkit. Our teacher training features self-paced video lessons and practical assignments, enabling educators to enhance their skills and apply them directly in the classroom.':
      '將 Git 和 GitHub 融入教職員的教學工具組，為他們提供支援。我們的教師培訓包含可自訂進度的影片課程和實作作業，讓教育工作者能提升技能並直接應用在課堂上。',
    'Support your faculty by integrating Git and GitHub into their teaching toolkit.':
      '將 Git 和 GitHub 融入教職員的教學工具組，為他們提供支援。',
    'Our teacher training features self-paced video lessons and practical assignments, enabling educators to enhance their skills and apply them directly in the classroom.':
      '我們的教師培訓包含可自訂進度的影片課程和實作作業，讓教育工作者能提升技能並直接應用在課堂上。',
    "Tailor GitHub Education to your school's needs": '依你學校的需求量身打造 GitHub 教育',
    "Our free educational self-serve solution for schools doesn't include advanced features like Enterprise Support, Advanced Security, Enterprise Managed Users or Copilot Business. If you need these additional features for your institution, please contact our sales team to discuss available discounts for schools.":
      '我們為學校提供的免費自助式教育解決方案不包含企業支援、進階安全性、企業受控使用者或 Copilot 商務版等進階功能。如果你的機構需要這些額外功能，請聯絡我們的銷售團隊，洽談學校適用的折扣。',

    // GitHub 课堂（数字见 regexp）
    'Bring the global power of open source and the developer community to your campus.':
      '將開源和開發人員社群的全球力量帶進你的校園。',
    'Discover GitHub Classroom': '探索 GitHub 教室',
    'Give students hands-on experience with the tools used by professional developers.':
      '讓學生親手體驗專業開發人員使用的工具。',
    'Empower your students and faculty with real-world software development skills':
      '讓你的學生和教職員掌握實務軟體開發技能',

    // CTA
    'Discover the impact of GitHub Education': '探索 GitHub 教育的影響力',
    "Join thousands of educational institutions around the world that are already benefiting from GitHub Education's free resources.":
      '加入全球數千所已從 GitHub 教育免費資源中受益的教育機構。',

    // 学校案例卡片（标题是学校名，已忽略；说明文字中的学校名保留原文）
    'See how schools use GitHub': '看看各校如何使用 GitHub',
    'Discover how Naperville North High School uses GitHub Classroom to enhance their AP Computer Science curriculum, creating a professional-like collaborative environment that enhances learning.':
      '瞭解 Naperville North High School 如何使用 GitHub 教室強化 AP 電腦科學課程，打造貼近專業的協作環境，提升學習成效。',
    "Learn about Rice University's journey integrating GitHub into their first-year computer science classes, improving student engagement and project management through practical, real-world tools.":
      '瞭解 Rice University 將 GitHub 融入大一電腦科學課程的歷程，透過實用且貼近實務的工具，提升學生參與度和專案管理。',
    'Explore how Harvard’s CS50 course leverages GitHub to streamline course management, distribute content, and track student progress, significantly enriching the computer science education experience.':
      '探索 Harvard 的 CS50 課程如何運用 GitHub 簡化課程管理、發放內容並追蹤學生進度，大幅充實電腦科學教育體驗。',

    // 常见问题：「免費使用工具」说明（学校页版本，与教师页措辞略有不同）
    ': Jump-start your development journey with the GitHub Student Developer Pack, offering dozens of premium tools and services at no cost. From AI-powered coding assistance with Copilot to GitHub Codespaces, which provide a fully configured cloud development environment, these tools are used daily by professional developers globally. They’d normally cost a fortune, but are available for free to verified students.':
      '：透過 GitHub 學生開發人員套件快速展開你的開發之旅，免費取得數十種優質工具和服務。從 Copilot 的 AI 輔助程式開發，到提供完整設定雲端開發環境的 GitHub 程式碼空間，這些都是全球專業開發人員每天使用的工具。它們通常所費不貲，但已驗證的學生可以免費使用。',
    'Is GitHub Education right for my school?': 'GitHub 教育適合我的學校嗎？',
    // … does not include Enterprise Support, <!-- -->Advanced Security<!-- -->, <!-- -->Enterprise Managed Users (EMUs)<!-- -->, Copilot Business, or contract redlining.
    'GitHub Education offers free access (yes, free!) to GitHub Enterprise Server or GitHub Enterprise Cloud. This program is specifically designed for accredited institutions that grant degrees, diplomas, or certificates. It equips schools with a comprehensive suite of tools to enhance the educational experience but does not include Enterprise Support, Advanced Security, Enterprise Managed Users (EMUs), Copilot Business, or contract redlining.':
      'GitHub 教育免費（沒錯，免費！）提供 GitHub 企業伺服器或 GitHub 企業雲端。此計畫專為授予學位、文憑或證書的經認可機構設計，為學校提供一整套提升教育體驗的工具，但不包含企業支援、進階安全性、企業受控使用者 (EMU)、Copilot 商務版或合約修訂。',
    'GitHub Education offers free access (yes, free!) to GitHub Enterprise Server or GitHub Enterprise Cloud. This program is specifically designed for accredited institutions that grant degrees, diplomas, or certificates. It equips schools with a comprehensive suite of tools to enhance the educational experience but does not include Enterprise Support,':
      'GitHub 教育免費（沒錯，免費！）提供 GitHub 企業伺服器或 GitHub 企業雲端。此計畫專為授予學位、文憑或證書的經認可機構設計，為學校提供一整套提升教育體驗的工具，但不包含企業支援、',
    'Enterprise Managed Users (EMUs)': '企業受控使用者 (EMU)',
    ', Copilot Business, or contract redlining.': '、Copilot 商務版或合約修訂。',
    // Our offering is intended as a <b>whole-school solution</b> to ensure …（整句见 inline）
    'Our offering is intended as a': '我們的方案定位為',
    'whole-school solution': '全校解決方案',
    'to ensure every department benefits. It promotes an integrated learning and development environment throughout your entire institution. However, the adoption must be at the institutional level and cannot be implemented by individual departments.':
      '，確保每個部門都能受益。它能在你的整個機構內推動整合式的學習和開發環境。但必須以整個機構為單位採用，不能由個別部門自行實施。',
    'To fully participate, your school must:': '若要全面參與，你的學校必須：',
    'Provide the platform access across all interested departments.': '為所有有意參與的部門提供平台存取權。',
    'Designate an administrator as the main contact for GitHub to handle any technical queries.':
      '指定一名管理員擔任 GitHub 的主要聯絡人，處理各種技術問題。',
    "Display your school's logo on our website as a sign of our partnership.":
      '在我們的網站上展示你學校的標誌，作為雙方合作關係的象徵。',
    'Maintain open lines of communication for all qualified users within your institution.':
      '為機構內所有符合資格的使用者維持暢通的溝通管道。',
    'Agree to receive regular updates from GitHub Education to stay informed about new tools and opportunities.':
      '同意定期接收 GitHub 教育的最新資訊，隨時掌握新工具和新機會。',
    // 三个相邻的 <b>：… please </b><b>contact our sales team</b><b> to discuss …
    // 宿主 <p> 没有直接文字，不构成行内句；首段原文以空格结尾，译文以全角标点收尾才会吃掉该空格，
    // 「請」落到第二段（见 scoped）
    'If your institution does not fit this criteria, such as not granting formal degrees or certificates, please':
      '如果你的機構不符合此標準，例如不授予正式學位或證書，',
    'to discuss alternative options and available education discounts.': '，洽談其他選擇和可用的教育折扣。',
    "If you're leading your school's IT program, heading a department, or overseeing technology adoption at your school, you're welcome to apply. Provide the requested information, and GitHub will be in contact to discuss eligibility and the next steps. The agreement must be signed by your school's CIO or CTO as part of a full campus solution.":
      '如果你負責學校的 IT 業務、領導某個部門，或督導學校採用新科技，歡迎提出申請。請提供所需資訊，GitHub 會與你聯絡，討論資格和後續步驟。作為全校解決方案的一部分，協議必須由你學校的 CIO 或 CTO 簽署。',
    'To receive the free benefits, your school needs to:': '若要取得免費權益，你的學校需要：',
    'Offer GitHub access across all technical and academic departments.': '在所有技術和學術部門提供 GitHub 存取權。',
    'Display your school’s logo on our website as a GitHub Education partner.':
      '以 GitHub 教育合作夥伴的身分，在我們的網站上展示你學校的標誌。',
    'Receive regular updates from GitHub Education.': '定期接收 GitHub 教育的最新資訊。',
    // Agree to our <!-- -->Terms and Conditions<!-- -->.
    'Agree to our Terms and Conditions.': '同意我們的條款和條件。',
    'Agree to our': '同意我們的',
    'Terms and Conditions': '條款和條件',
    // Interested? <!-- -->Let us know<!-- -->, and we'll guide you …
    "Interested? Let us know, and we'll guide you through joining our education initiative!":
      '有興趣嗎？告訴我們，我們會引導你加入我們的教育計畫！',
    ", and we'll guide you through joining our education initiative!": '，我們會引導你加入我們的教育計畫！',
    'Do schools receive free access to Copilot and the Student Developer Pack?':
      '學校能免費使用 Copilot 和學生開發人員套件嗎？',
    // … Students and educators must <!-- -->apply directly to receive these benefits<!-- -->.
    'While GitHub offers free access to Copilot and numerous partner tools for all verified students and educators, these are not accessed through our educational institutional benefits. Students and educators must apply directly to receive these benefits.':
      '雖然 GitHub 為所有已驗證的學生和教育工作者免費提供 Copilot 和眾多合作夥伴工具，但這些並非透過我們的教育機構權益取得。學生和教育工作者必須直接申請才能獲得這些權益。',
    'While GitHub offers free access to Copilot and numerous partner tools for all verified students and educators, these are not accessed through our educational institutional benefits. Students and educators must':
      '雖然 GitHub 為所有已驗證的學生和教育工作者免費提供 Copilot 和眾多合作夥伴工具，但這些並非透過我們的教育機構權益取得。學生和教育工作者必須',
    'apply directly to receive these benefits': '直接申請才能獲得這些權益',
    'Can I enroll my non-profit educational organization?': '我可以讓我的非營利教育組織加入嗎？',
    // … Visit our <!-- -->GitHub Social Impact<!-- --> site for more information.
    'GitHub Education supports accredited institutions that grant degrees. For non-profit organizations, GitHub offers separate discounts. Visit our GitHub Social Impact site for more information.':
      'GitHub 教育支援授予學位的經認可機構。針對非營利組織，GitHub 另有折扣。請造訪我們的 GitHub 社會影響力網站瞭解詳情。',
    'GitHub Education supports accredited institutions that grant degrees. For non-profit organizations, GitHub offers separate discounts. Visit our':
      'GitHub 教育支援授予學位的經認可機構。針對非營利組織，GitHub 另有折扣。請造訪我們的',
    'GitHub Social Impact': 'GitHub 社會影響力',
    'site for more information.': '網站瞭解詳情。',
  },
  scoped: {
    'Enroll your campus': '讓你的校園加入',
    'Teacher training': '教師培訓',
    // org-settings、security 词典只在各自页面译「聯絡銷售人員」（scoped），此处给出本页译法
    'Contact sales': '聯絡銷售人員',
    // 产品名按 product-names.md 译中文；repo-settings 等页面另有本页译法
    'Advanced Security': '進階安全性',
    'Who can apply?': '誰可以申請？',
    'How do I sign up?': '如何註冊？',
    'Interested?': '有興趣嗎？',
    'Let us know': '告訴我們',
    // 本页只出现在「… please </b><b>contact our sales team</b><b> to discuss …」里，「請」从首段挪到此段；
    // new 页另有 scoped「聯絡我們的銷售團隊」
    'contact our sales team': '請聯絡我們的銷售團隊',
  },
  regexp: [
    // 2k+ universities, community colleges, secondary schools, and bootcamps use GitHub in the classroom.
    [
      /^(\d+)k\+ universities, community colleges, secondary schools, and bootcamps use GitHub in the classroom\.$/,
      (_, count) => joinCjk(`超過 ${thousands(count!)}`, '所大學、社區學院、中學和訓練營在課堂上使用 GitHub。'),
    ],
  ],
  inline: [
    // Our offering is intended as a <b>whole-school solution</b> to ensure every department benefits. …
    [
      'Our offering is intended as a {} to ensure every department benefits. It promotes an integrated learning and development environment throughout your entire institution. However, the adoption must be at the institutional level and cannot be implemented by individual departments.',
      '我們的方案定位為{}，確保每個部門都能受益。它能在你的整個機構內推動整合式的學習和開發環境。但必須以整個機構為單位採用，不能由個別部門自行實施。',
    ],
  ],
} satisfies PageDictionary
