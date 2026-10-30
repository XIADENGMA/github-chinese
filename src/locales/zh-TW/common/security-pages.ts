import type { PageDictionary } from '../../../core/types'

/**
 * 案例问答句型中间的客户名槽位：首尾两个客户之间的每个客户在句型键里是「,槽位」，译文各加一个「、{}」
 * （只有两个客户时为空）
 */
function middleCustomers(middle: string): string {
  return '、{}'.repeat(middle.split(',').length - 1)
}

/**
 * GitHub 安全产品介绍页正文（页面类型只有 common，词条全站生效）：/security、/security/advanced-security 及其子页
 * code-security、secret-protection、software-supply-chain，以及 /security/plans。只收这几页特有的句子与短语。
 * 产品名译成中文：GitHub Advanced Security / Secret Protection / Code Security → GitHub 進階安全性 / 機密保護 /
 * 程式碼安全性，Supply Chain Security → 供應鏈安全性，Copilot Autofix → Copilot 自動修正；品牌词 CodeQL、Dependabot
 * 与缩写 GHAS、DevSecOps、AppSec、SAST、EPSS、SBOM、SLSA、SARIF 保留。
 * /security/plans 的功能对比表与 /pricing 比较表（new/plans.ts 的 scoped）同名的行名、说明沿用其译法。
 * 不收录：客户名、人名（logo 的 svg title 在跳过标签内，引擎不处理）；统计数字 4.4M、39M 与货币代码 USD（照原文）；
 * 资源卡片标签 Demo（易与部署环境名等用户内容同形）；CodeQL（品牌词）。
 * 对比表表头 Free / Team / Enterprise 由 marketing 的全局词条翻译（Team / Enterprise 作“團隊 / 企業”，
 * 这几页没有单独的页面类型，不能改作方案名）。页顶 GitHub Universe 横幅与营销页头页脚归 marketing.ts。
 */
export default {
  static: {
    // 子导航与首屏按钮（GitHub Security、Advanced Security、Secret Protection、Code Security、More 由 marketing 等收录）
    'Supply Chain Security': '供應鏈安全性',
    'Plans & pricing': '方案和定價',
    'Request a demo': '預約示範',
    'See plans & pricing': '查看方案和定價',
    'Contact sales': '聯絡銷售人員',
    'Ready to use it in your repositories?': '準備好在你的儲存庫中使用了嗎？',
    'Get started now': '立即開始',

    // 标签页标题「GitHub Advanced Security · Built-in protection for every repository」（/security/plans 同）的第二段，
    // 子页标题「GitHub Code Security」「GitHub Secret Protection」「GitHub Supply Chain Security」
    'Built-in protection for every repository': '為每個儲存庫提供內建保護',
    'GitHub Code Security': 'GitHub 程式碼安全性',
    'GitHub Secret Protection': 'GitHub 機密保護',
    'GitHub Supply Chain Security': 'GitHub 供應鏈安全性',

    // /security：首屏与功能
    'Get enterprise-grade, built-in application security.': '取得企業級的內建應用程式安全性。',
    'Find out how platform security strengthens your workflow.': '瞭解平台安全性如何強化你的工作流程。',
    'GitHub’s API stays secure with ISO, SOC 2, and GDPR.': 'GitHub 的 API 符合 ISO、SOC 2 和 GDPR 規範，安全無虞。',
    'Security seamlessly integrated into your workflow': '安全性無縫融入你的工作流程',
    'Prevent accidental secret exposure': '防止機密意外外洩',
    'Push protection automatically blocks secrets before they reach your repository, keeping code clean without disrupting workflows.':
      '推送保護會在機密進入儲存庫前自動攔截，讓程式碼保持乾淨，又不會干擾工作流程。',
    'Explore GitHub Secret Protection': '探索 GitHub 機密保護',
    'Find and fix vulnerabilities in your code': '找出並修正程式碼中的漏洞',
    'Address security debt in your GitHub workflow with static analysis, AI remediation, and proactive vulnerability management.':
      '透過靜態分析、AI 修復和主動式漏洞管理，在 GitHub 工作流程中處理安全性債務。',
    'Explore GitHub Code Security': '探索 GitHub 程式碼安全性',
    'Stay secure': '保持安全',
    'Securing the entire software supply chain': '保護整個軟體供應鏈',
    'Enhance your security strategy with the GitHub Security Lab': '透過 GitHub 安全實驗室強化你的安全性策略',
    'Learn how the lab helps secure open source by finding vulnerabilities, building tools like CodeQL, and advancing security research.':
      '瞭解實驗室如何透過找出漏洞、打造 CodeQL 等工具和推動安全性研究，協助保護開源。',
    'Visit the GitHub Security Lab': '造訪 GitHub 安全實驗室',
    'Stay ahead of threats with the Security Advisory Database': '透過安全性公告資料庫搶先因應威脅',
    'Access a security vulnerability database inclusive of CVEs and GitHub originated security advisories from the world of open source software.':
      '存取安全性漏洞資料庫，其中收錄了 CVE，以及 GitHub 針對開源軟體世界發布的安全性公告。',
    'Visit the Security Database': '造訪安全性資料庫',
    'Strengthen your software supply chain': '強化你的軟體供應鏈',
    "GitHub's supply chain security reduces open source risks with auto-updates, dependency tracking, and build attestation.":
      'GitHub 的供應鏈安全性透過自動更新、相依項目追蹤和建置證明，降低開源風險。',
    'See supply chain security': '查看供應鏈安全性',

    // /security：客户案例与评价（客户名、人名保持原文）
    "Adopted by the world's leading organizations": '全球領先組織紛紛採用',
    'View all customer stories': '查看所有客戶案例',
    'Otto Group elevates developer engagement with GitHub Advanced Security':
      'Otto Group 透過 GitHub 進階安全性提升開發人員參與度',
    'Read customer story': '閱讀客戶案例',
    'SPH Media tames tool sprawl and secures code with GitHub': 'SPH Media 透過 GitHub 解決工具氾濫問題並保護程式碼',
    'Postmates uses GitHub Advanced Security to catch vulnerabilities': 'Postmates 使用 GitHub 進階安全性揪出漏洞',
    // 评价引言：<b>GitHub Advanced Security empowers our developers</b> to detect …（/security/advanced-security）；
    // /security 首页 <b> 内的产品名与其后文字分开，相邻文本节点整段匹配上一条，元素拆开时见 inline，此为片段。
    // 后半句以全角逗号开头：引擎不保留其前的空白
    'GitHub Advanced Security empowers our developers': 'GitHub 進階安全性為我們的開發人員提供強大助力',
    'empowers our developers': '為我們的開發人員提供強大助力',
    'to detect and fix vulnerabilities earlier, accelerating our time to market and boosting developer satisfaction.':
      '，讓他們能更早找出並修正漏洞，加快產品上市速度，並提升開發人員滿意度。',
    'Head of development services and tools at SAP': 'SAP 開發服務和工具負責人',
    'Built-in security for developer workflows': '為開發人員工作流程內建安全性',

    // 资源卡片（三个子页共用；卡片标签 Demo 不收录）
    'Resources to get started': '入門資源',
    'Explore the DevSecOps guide': '探索 DevSecOps 指南',
    'Learn how to write more secure code from the start with DevSecOps.':
      '瞭解如何透過 DevSecOps，從一開始就撰寫更安全的程式碼。',
    'Read the whitepaper': '閱讀白皮書',
    'Avoid AppSec pitfalls': '避開 AppSec 陷阱',
    'Explore common application security pitfalls and how to avoid them.': '瞭解常見的應用程式安全性陷阱和避免方法。',
    'Adopting GitHub Advanced Security': '採用 GitHub 進階安全性',
    'You can adopt GitHub Advanced Security at scale in your company.': '你可以在公司內大規模採用 GitHub 進階安全性。',
    'View the docs': '查看說明文件',
    'Best practices for more secure software': '打造更安全軟體的最佳做法',
    'Discover developer-first security': '探索以開發人員為優先的安全性',
    'Discover developer-first application security': '探索以開發人員為優先的應用程式安全性',
    'Take an in-depth look at the current state of application security.': '深入瞭解應用程式安全性的現況。',
    'View the webinar': '觀看網路研討會',
    REPORT: '報告',
    Videos: '影片',

    // /security/advanced-security
    'Security that moves at the speed of development': '緊跟開發速度的安全性',
    'Explore Secret Protection': '探索機密保護',
    'Fix vulnerabilities in your code': '修正程式碼中的漏洞',
    'Explore Code Security': '探索程式碼安全性',
    'Companies using GitHub Advanced Security': '使用 GitHub 進階安全性的公司',
    'Become a risk reduction warrior': '成為降低風險的先鋒',
    'Stay ahead of threats with built-in security, secret protection, and dependency monitoring.':
      '透過內建安全性、機密保護和相依項目監控，搶先因應威脅。',
    'Explore GitHub security risk assessments': '探索 GitHub 安全性風險評估',
    'Strengthen your development with AI': '運用 AI 強化開發',
    'Empower your team with native AppSec': '以原生 AppSec 強化你的團隊',
    'Write secure code at scale with AI-driven insights and automated fixes from GitHub Copilot Autofix.':
      '運用 GitHub Copilot 自動修正提供的 AI 洞察和自動化修正，大規模撰寫安全的程式碼。',
    'Find and fix vulnerabilities in real time by integrating application security right into GitHub.':
      '將應用程式安全性直接整合到 GitHub 中，即時找出並修正漏洞。',
    'Lead developer': '首席開發人員',
    'Two layers of powerful protection': '雙層強大防護',
    'Combine Secret Protection and Code Security to safeguard your code from every angle.':
      '結合機密保護和程式碼安全性，全方位保護你的程式碼。',
    // 价格卡片：价格数字与货币代码 USD 照原文
    'For teams and organizations serious about stopping secret leaks.': '適合致力於阻止機密外洩的團隊和組織。',
    'per active committer/month': '每位活躍提交者/月',
    'For teams and organizations committed to fixing vulnerabilities before production.':
      '適合致力於在進入正式環境前修正漏洞的團隊和組織。',
    'Get the most out of GitHub Advanced Security': '充分發揮 GitHub 進階安全性的價值',
    'Maximize your defenses with industry-leading AppSec': '運用業界領先的 AppSec 全面強化防禦',
    'Discover how our security solution can benefit your organization.':
      '瞭解我們的安全性解決方案能為你的組織帶來哪些效益。',
    'See how improved security drives business success': '瞭解提升安全性如何推動業務成功',
    'Explore the benefits of improving software security standards in organizations.':
      '瞭解在組織中提高軟體安全性標準的好處。',
    'Read the report': '閱讀報告',
    'How top teams secure code while moving fast': '頂尖團隊如何在快速推進的同時確保程式碼安全',
    'Learn how industry experts protect their code without sacrificing productivity.':
      '瞭解產業專家如何在不犧牲生產力的情況下保護程式碼。',
    'Watch the videos': '觀看影片',

    // /security/advanced-security：常见问题（被链接拆开的答案见 inline）
    'What is GitHub Advanced Security?': '什麼是 GitHub 進階安全性？',
    'GitHub Advanced Security (GHAS) encompasses GitHub’s application security products comprising GitHub Secret Protection and GitHub Code Security. GHAS adds cutting-edge tools for static analysis, software composition analysis, and secret scanning to the GitHub platform that developers already know and love. Unlike traditional application security packages that burden the software development toolchain with complex workflows that inhibit adoption, GHAS makes it easy for developers to find and fix vulnerabilities earlier in the software development life cycle.':
      'GitHub 進階安全性 (GHAS) 涵蓋 GitHub 的應用程式安全性產品，包括 GitHub 機密保護和 GitHub 程式碼安全性。GHAS 為開發人員早已熟悉且喜愛的 GitHub 平台，加入了靜態分析、軟體組成分析和機密掃描等尖端工具。傳統的應用程式安全性方案以複雜的工作流程拖累軟體開發工具鏈，阻礙採用；GHAS 則讓開發人員能在軟體開發生命週期中更早、更輕鬆地找出並修正漏洞。',
    'Why choose GitHub Advanced Security instead of a third-party AppSec product?':
      '為什麼選擇 GitHub 進階安全性，而不是第三方 AppSec 產品？',
    'Unlike third-party security add-ons, GitHub Advanced Security operates entirely in the native GitHub workflows that developers already know and love. By making it easier for developers to remediate vulnerabilities as they go, GitHub Advanced Security frees time for security teams to focus on critical strategies that protect businesses, customers, and communities from application-based vulnerabilities.':
      '與第三方安全性附加元件不同，GitHub 進階安全性完全在開發人員早已熟悉且喜愛的原生 GitHub 工作流程中運作。GitHub 進階安全性讓開發人員能更輕鬆地邊開發邊修復漏洞，為安全性團隊騰出時間，專注於保護企業、客戶和社群免受應用程式漏洞威脅的關鍵策略。',
    'What is DevSecOps?': '什麼是 DevSecOps？',
    'DevSecOps refers to a combination of the development, security, and operations tools necessary to develop software applications.':
      'DevSecOps 是指開發軟體應用程式所需的開發、安全性和維運工具組合。',
    'What is AppSec?': '什麼是 AppSec？',
    'Application security (AppSec) is the process of finding, fixing, and preventing security vulnerabilities in applications. GitHub Advanced Security provides AppSec tools for static application security testing (SAST), which identifies vulnerabilities in the code itself.':
      '應用程式安全性 (AppSec) 是找出、修正並預防應用程式中安全性漏洞的過程。GitHub 進階安全性提供靜態應用程式安全性測試 (SAST) 的 AppSec 工具，可找出程式碼本身的漏洞。',
    'Can I use GitHub Advanced Security with Microsoft Azure DevOps?':
      '我可以搭配 Microsoft Azure DevOps 使用 GitHub 進階安全性嗎？',
    // 答案中的链接文字（整句见 inline）
    'add-on': '附加元件',
    'Where can I find case studies and reference customers?': '在哪裡可以找到案例研究和參考客戶？',
    'customer stories': '客戶案例',
    'Can I review documentation before purchase?': '購買前可以查看說明文件嗎？',
    'Does GitHub offer consulting, training, and other deployment services?':
      'GitHub 是否提供諮詢、培訓和其他部署服務？',
    'Expert Services': '專家服務',

    // /security/advanced-security/code-security
    'Application security where found means fixed': '找到即修正的應用程式安全性',
    'Secure your code as you build with GitHub Code Security. Detect vulnerabilities early and fix them with Copilot Autofix.':
      '透過 GitHub 程式碼安全性，在建置時同步保護程式碼。及早偵測漏洞，交由 Copilot 自動修正處理。',
    // 视频标题与播放按钮的 aria-label
    'What is GitHub code security?': '什麼是 GitHub 程式碼安全性？',
    'Play video. Thumbnail description: What is GitHub code security?':
      '播放影片。縮圖說明：什麼是 GitHub 程式碼安全性？',
    // 统计：大号数字 + 说明（数字与说明分两段显示）
    '28 min': '28 分鐘',
    'From vulnerability detection to remediation': '從偵測漏洞到完成修復',
    '3X': '3 倍',
    'Faster remediation on average with Copilot Autofix': 'Copilot 自動修正帶來的平均修復加速',
    'Of alert types include AI-powered code suggestions': '警示類型提供 AI 驅動的程式碼建議',
    'How it works': '運作方式',
    'Detect and remediate vulnerabilities early with AI-powered fixes': '運用 AI 驅動的修正及早偵測並修復漏洞',
    'Automate security checks': '自動執行安全性檢查',
    'Find security issues in real time with CodeQL’s powerful analysis that traces data flows throughout your application.':
      '運用 CodeQL 強大的分析能力追蹤整個應用程式的資料流，即時找出安全性問題。',
    'Learn more about CodeQL': '瞭解 CodeQL',
    'Remediate at scale': '大規模修復',
    'Get contextual explanations and AI-powered fixes for CodeQL-detected alerts with Copilot Autofix.':
      '透過 Copilot 自動修正，為 CodeQL 偵測到的警示取得結合上下文的說明和 AI 驅動的修正。',
    'Explore Copilot Autofix': '探索 Copilot 自動修正',
    'Reduce security debt': '減少安全性債務',
    'GitHub Code Security continuously scans your code as you build, helping detect vulnerabilities early, fix them fast with Copilot Autofix, and ship securely.':
      'GitHub 程式碼安全性會在你建置時持續掃描程式碼，協助你及早偵測漏洞、透過 Copilot 自動修正快速解決，並安全地交付。',
    'One-click risk assessment': '一鍵風險評估',
    'Evaluate exposure to application vulnerabilities and leaked secrets in your codebase with our free risk assessment tool.':
      '使用我們的免費風險評估工具，評估程式碼庫中應用程式漏洞和外洩機密的曝險程度。',
    // 评价引言：<b>Copilot Autofix streamlines security</b> by flagging …（原文结尾的右引号照录；后半句以全角逗号开头）
    'Copilot Autofix streamlines security': 'Copilot 自動修正簡化了安全性工作',
    'by flagging vulnerabilities and suggesting fixes instantly, keeping code secure while freeing teams for strategic work.”':
      '，它能即時標記漏洞並提出修正建議，在確保程式碼安全的同時，讓團隊騰出心力投入策略性工作。」',
    'community manager of security at Otto GmbH & Co. KGaA': 'Otto GmbH & Co. KGaA 安全性社群經理',
    'Build secure software from day one': '從第一天起打造安全的軟體',
    'Security should be built in, not bolted on. With Code Security, you can find, fix, and prevent vulnerabilities seamlessly—keeping your software resilient from development to deployment.':
      '安全性應該內建，而不是事後外加。透過程式碼安全性，你可以無縫找出、修正並預防漏洞——讓軟體從開發到部署始終保持韌性。',

    // /security/advanced-security/code-security：常见问题（原文部分答案结尾没有句点，译文照原文不加）
    'What is Code Security?': '什麼是程式碼安全性？',
    'GitHub Code Security empowers developers to secure their code without sacrificing speed. With built-in static analysis, AI-powered remediation, advanced dependency scanning, and proactive vulnerability management, teams can automatically detect, prioritize, and remediate security issues, all within their existing GitHub workflow—allowing them to deliver secure software faster and with greater confidence':
      'GitHub 程式碼安全性讓開發人員能在不犧牲速度的前提下保護程式碼。透過內建的靜態分析、AI 驅動的修復、進階相依性掃描和主動式漏洞管理，團隊可以在現有的 GitHub 工作流程中自動偵測安全性問題、排定優先順序並加以修復——更快、更有信心地交付安全的軟體',
    'What is Copilot Autofix?': '什麼是 Copilot 自動修正？',
    'Copilot Autofix uses AI-powered code suggestions to automatically fix security vulnerabilities identified by CodeQL. When a security vulnerability is detected, Copilot Autofix analyzes the code context, understands the underlying security issue, and generates a precise, contextually appropriate fix. This feature bridges the gap between vulnerability detection and remediation, enabling developers to review and apply AI-suggested fixes directly within their workflow.':
      'Copilot 自動修正運用 AI 驅動的程式碼建議，自動修正 CodeQL 找出的安全性漏洞。偵測到安全性漏洞時，Copilot 自動修正會分析程式碼上下文、理解潛在的安全性問題，並產生精確且符合上下文的修正。這項功能縮小了漏洞偵測和修復之間的落差，讓開發人員能直接在工作流程中審查並套用 AI 建議的修正。',
    'What are Security Campaigns?': '什麼是安全性活動？',
    // 原文重复的 With With 照录在键里
    'Security campaigns provide a structured framework for planning, tracking, and implementing security fixes across multiple repositories and teams allowing you to systematically burn down security debt. With With security campaigns, security teams can group related vulnerabilities, prioritize remediation efforts, assign ownership, and monitor progress through a unified dashboard. Security campaigns can be organized by vulnerability type, security initiative, compliance requirement, or any other logical grouping to coordinate security improvements at scale.':
      '安全性活動提供結構化的架構，可跨多個儲存庫和團隊規劃、追蹤並實作安全性修正，讓你有系統地清償安全性債務。透過安全性活動，安全性團隊可以將相關漏洞分組、排定修復工作的優先順序、指派負責人，並透過統一的儀表板監控進度。安全性活動可依漏洞類型、安全性舉措、合規要求或任何其他邏輯分組來組織，以大規模協調安全性改善。',
    'What is dependency analysis?': '什麼是相依性分析？',
    "Dependency review scans pull requests for vulnerable dependencies before they're introduced into your codebase. It evaluates the security impact of dependency changes, identifying vulnerable packages and their severity levels to prevent security issues from being merged. The tool shows detailed dependency changes by comparing the base and head branches, highlighting added, removed, and updated dependencies along with their known vulnerabilities":
      '相依性審查會在有漏洞的相依項目引入程式碼庫之前掃描拉取請求。它會評估相依項目變更對安全性的影響，找出有漏洞的套件及其嚴重性等級，防止安全性問題遭到合併。這項工具會比較基底分支和來源分支，顯示詳細的相依項目變更，並標示新增、移除和更新的相依項目及其已知漏洞',
    'What is EPSS?': '什麼是 EPSS？',
    'Dependabot alerts now feature the Exploit Prediction Scoring System (EPSS) from the global Forum of Incident Response and Security Teams (FIRST), helping better assess vulnerability risks. EPSS helps organizations prioritize vulnerability remediation by predicting the likelihood of a vulnerability being exploited in the next 30 days. It provides a score ranging from 0 to 1 (0-100%), alongside a percentile ranking to indicate how the vulnerability compares to others.':
      'Dependabot 警示現已加入全球事件應變和安全團隊論壇 (FIRST) 的漏洞利用預測評分系統 (EPSS)，協助更準確地評估漏洞風險。EPSS 會預測漏洞在未來 30 天內遭到利用的可能性，協助組織排定漏洞修復的優先順序。它會提供 0 到 1 (0-100%) 的分數，以及顯示該漏洞與其他漏洞相比所處位置的百分位數排名。',
    'What is the code security risk assessment?': '什麼是程式碼安全性風險評估？',
    // 风险评估答案：「… Learn more about」与「GitHub security risk assessments」是相邻文本节点（未渲染成链接），
    // 引擎整段匹配时按句查词条；逐个节点匹配时末句「Learn more about」由 common-ui 翻译
    'The Code Security Risk Assessment is a free evaluation that analyzes repositories to identify potential code-level vulnerabilities and highlight areas where GitHub Code Security can help improve security posture.':
      '程式碼安全性風險評估是一項免費評估，會分析儲存庫以找出潛在的程式碼層級漏洞，並指出 GitHub 程式碼安全性可協助改善安全態勢的地方。',
    'Learn more about GitHub security risk assessments.': '瞭解 GitHub 安全性風險評估。',
    'Learn more about GitHub security risk assessments': '瞭解 GitHub 安全性風險評估',
    'GitHub security risk assessments': 'GitHub 安全性風險評估',
    // 风险评估截图链接的 aria-label
    'Modal titled “Scan organization” showing a risk assessment setup with Secret Protection and Code Security selected, and Cancel and Continue buttons.':
      '標題為「掃描組織」的對話方塊，顯示已選取機密保護和程式碼安全性的風險評估設定，以及取消和繼續按鈕。',

    // /security/advanced-security/secret-protection
    'Keep your secrets secret': '守住你的機密',
    'GitHub Secret Protection continuously monitors your GitHub perimeter, helping prevent exposures, protect credentials, and ship securely.':
      'GitHub 機密保護會持續監控你的 GitHub 邊界，協助防止外洩、保護認證資訊並安全地交付。',
    'What is GitHub Secret Protection?': '什麼是 GitHub 機密保護？',
    'Play video. Thumbnail description: What is GitHub Secret Protection?':
      '播放影片。縮圖說明：什麼是 GitHub 機密保護？',
    // 统计说明（数字 4.4M、150+、39M 照原文）
    'Secrets prevented from leaking on GitHub in 2024': '2024 年在 GitHub 上成功阻止外洩的機密',
    'Industry partners, working together to mitigate risk for the developer community':
      '產業合作夥伴，攜手為開發人員社群降低風險',
    'Secret leaks detected with Secret Protection in 2024': '2024 年機密保護偵測到的機密外洩',
    'Prevent accidental secret exposure across your repositories': '防止儲存庫中的機密意外外洩',
    'Block leaks before they happen': '在外洩發生前加以阻擋',
    'Find the threats that others miss': '找出他人遺漏的威脅',
    'Detect secrets in issues, discussions, and more with secret scanning. Metadata like validity checks and public leaks help prioritize active threats.':
      '透過機密掃描偵測議題、討論等處的機密。有效性檢查和公開外洩等中繼資料，有助於優先處理仍有效的威脅。',
    'Give Copilot the heavy lifting': '把繁重的工作交給 Copilot',
    'GitHub Copilot finds elusive secrets like passwords without the false positives. It detects secrets that traditional secret detectors are less likely to catch, providing an additional layer of security.':
      'GitHub Copilot 能找出密碼等難以察覺的機密，而且不會產生誤報。它能偵測傳統機密偵測工具不易發現的機密，多提供一層安全防護。',
    'GitHub partners with 150+ providers to mitigate risks and ensure the highest level of detection accuracy.':
      'GitHub 與 150 多家提供者合作，降低風險並確保最高的偵測準確度。',
    'Learn about the secret scanning partner program': '瞭解機密掃描合作夥伴計畫',
    'Safer code for everyone': '讓每個人的程式碼更安全',
    "Whether you're securing an open source project or strengthening your enterprise codebase, Secret Protection helps you keep secrets out of your code.":
      '無論你是要保護開源專案，還是強化企業程式碼庫，機密保護都能協助你讓機密遠離程式碼。',
    'Learn how to build security into your code from day one with DevSecOps.':
      '瞭解如何透過 DevSecOps，從第一天起就將安全性融入程式碼。',

    // /security/advanced-security/secret-protection：常见问题（首问与视频标题同文）
    'GitHub Secret Protection detects and prevents secret leaks continuously in real-time, proactively blocking sensitive credentials from being pushed to a repository with push protection. With a remarkably low false positive rate and approximately 150 service provider integrations, it enables rapid credential revocation and rotation, enhancing developer productivity.':
      'GitHub 機密保護會持續即時偵測並防止機密外洩，透過推送保護主動阻擋敏感認證資訊被推送到儲存庫。憑藉極低的誤報率和約 150 項服務提供者整合，它能快速撤銷和輪替認證資訊，提升開發人員的生產力。',
    'What is the secret risk assessment?': '什麼是機密風險評估？',
    // 答案末尾「Learn more about」+「GitHub security risk assessments」同代码安全页，按句收录
    'The secret risk assessment provides a free, comprehensive overview of an organization’s secret leak footprint across its GitHub repositories.':
      '機密風險評估會免費提供組織在其 GitHub 儲存庫中機密外洩情況的全面總覽。',
    'By analyzing repositories for exposed secrets, it helps admins and developers understand their exposure to potential security risks and offers actionable insights for remediation.':
      '它會分析儲存庫中暴露的機密，協助管理員和開發人員瞭解自身面臨的潛在安全性風險，並提供可據以修復的實用洞察。',
    'What is push protection?': '什麼是推送保護？',
    'Push protection is designed to prevent sensitive information, such as secrets or tokens, from being pushed to your repository in the first place. It proactively scans your code for secrets during the push process and blocks the push if any are detected.':
      '推送保護旨在從源頭防止機密或權杖等敏感資訊被推送到你的儲存庫。它會在推送過程中主動掃描程式碼中的機密，一旦偵測到便會阻擋推送。',
    'What is delegated bypass for push protection?': '什麼是推送保護的委派繞過？',
    'Delegated bypass introduces an approval process for developers to bypass push protection. Anyone opting to bypass a push protection block will need to submit a request to a designated group of reviewers, ensuring any risky secrets are not accidentally leaked.':
      '委派繞過為開發人員繞過推送保護加入了核准流程。任何想要繞過推送保護攔截的人，都必須向指定的審查者群組送出請求，確保有風險的機密不會意外外洩。',
    'What are secret scanning validity checks?': '什麼是機密掃描有效性檢查？',
    'Validity checks help you determine whether detected secrets are still active, enabling developers and security teams to prioritize their response effectively. When a secret is flagged, the system verifies its validity to confirm whether the secret is active or inactive.':
      '有效性檢查可協助你判斷偵測到的機密是否仍然有效，讓開發人員和安全性團隊能有效排定回應的優先順序。機密被標記後，系統會驗證其有效性，確認該機密有效還是無效。',
    'What is the secret scanning partnership program?': '什麼是機密掃描合作夥伴計畫？',
    'The secret scanning partnership program allows service providers to secure their token formats by enabling GitHub to scan public repositories and npm packages for exposed secrets. When a secret is found in a public repo, GitHub sends an alert directly to the service provider, who can then validate and take appropriate action.':
      '機密掃描合作夥伴計畫讓服務提供者能授權 GitHub 掃描公開儲存庫和 npm 套件中暴露的機密，藉此保護自己的權杖格式。在公開儲存庫中找到機密時，GitHub 會直接向服務提供者傳送警示，由其驗證並採取適當行動。',

    // /security/advanced-security/software-supply-chain
    'GitHub Supply Chain': 'GitHub 供應鏈',
    'Secure your software supply chain': '保護你的軟體供應鏈',
    'Manage open source risks with GitHub’s supply chain security. Detect and fix threats early with automated scanning, updates, and policy enforcement—keeping your software resilient.':
      '透過 GitHub 的供應鏈安全性管理開源風險。運用自動化掃描、更新和政策強制執行，及早偵測並排除威脅——讓你的軟體保持韌性。',
    'Secure your dependencies': '保護你的相依項目',
    'Automatically detect vulnerabilities and get trusted updates with Dependabot.':
      '透過 Dependabot 自動偵測漏洞並取得可信賴的更新。',
    'Prioritize what matters': '優先處理重要事項',
    'Dependabot surfaces the top 10% of your most critical alerts first using exploitation likelihood, severity scores, and triage rules.':
      'Dependabot 會根據遭利用的可能性、嚴重性分數和分類規則，優先呈現最重大的前 10% 警示。',
    'Distribute what you build': '分發你的建置成品',
    'Easily sign and verify your builds with artifact attestations—simplifying security and compliance.':
      '透過成品證明輕鬆簽署並驗證建置——簡化安全性和合規性。',
    'From dependencies to deployment, lock down your supply chain.': '從相依項目到部署，全面守住你的供應鏈。',
    'Understand your supply chain': '瞭解你的供應鏈',
    'Identify critical risks faster with EPSS scores and automated alerts. Map dependencies and dependents, including transitive ones, with one-click SBOMs.':
      '透過 EPSS 分數和自動化警示，更快找出重大風險。只要一鍵產生 SBOM，就能掌握相依項目和被相依項目（包括間接相依項目）。',
    'Explore supply chain security': '探索供應鏈安全性',
    'Make updates a breeze': '讓更新輕而易舉',
    'Stay secure with automatic pull requests for the latest dependencies. Dependabot groups updates for faster reviews and merges.':
      '自動建立拉取請求以更新至最新的相依項目，確保安全。Dependabot 會將更新分組，加快審查和合併。',
    'Explore Dependabot': '探索 Dependabot',
    'Prevent new risks': '防範新風險',
    'Enforce security and license compliance on pull requests with the dependency review action (available with GitHub Code Security).':
      '透過相依性審查動作（隨 GitHub 程式碼安全性提供），在拉取請求上強制執行安全性和授權條款合規。',
    'Explore the Dependency Review Action': '探索相依性審查動作',
    'Don’t just comply, be secure': '不只合規，更要安全',
    'Easily sign and verify builds with artifact attestations. Meet external compliance frameworks like SOC2 or strengthen internal security with SLSA—up to Build Level 3.':
      '透過成品證明輕鬆簽署並驗證建置。符合 SOC2 等外部合規架構，或透過 SLSA 強化內部安全性——最高可達建置等級 3。',
    'Explore artifact attestations': '探索成品證明',
    'Secure software from the start': '從一開始就確保軟體安全',
    'Whether you’re contributing to an open source project or choosing new tools for your team, your security needs are covered with GitHub.':
      '無論你是要為開源專案貢獻，還是為團隊挑選新工具，GitHub 都能滿足你的安全性需求。',
    'Chat with GitHub Copilot': '與 GitHub Copilot 聊天',
    'Securing your end-to-end supply chain': '保護端對端供應鏈',
    'Protect your entire GitHub workflow, from personal accounts to code and builds.':
      '保護整個 GitHub 工作流程，從個人帳號到程式碼和建置。',
    'Read the guide': '閱讀指南',

    // /security/advanced-security/software-supply-chain：常见问题
    'What is supply chain security?': '什麼是供應鏈安全性？',
    'When developing a software project, you likely use other software to build and run your application, such as open-source libraries, frameworks or other tools. These resources are collectively referred to as your “dependencies”, because your project depends on them to function properly. Your project could rely on hundreds of these dependencies, forming what is known as your "supply chain".':
      '開發軟體專案時，你很可能會使用其他軟體來建置並執行應用程式，例如開源程式庫、架構或其他工具。這些資源統稱為你的「相依項目」，因為你的專案要依靠它們才能正常運作。你的專案可能依賴數百個這類相依項目，形成所謂的「供應鏈」。',
    'Your supply chain can pose a security risk. If one of your dependencies has a known security weakness or a bug, malicious actors could exploit this vulnerability to, for example, insert malicious code (malware), steal sensitive data, or cause some other type of disruption to your project. This type of threat is called a "supply chain attack". Having vulnerable dependencies in your supply chain compromises the security of your own project, and you put your users at risk, too.':
      '供應鏈可能帶來安全性風險。如果某個相依項目有已知的安全性弱點或錯誤，惡意人士就可能利用這個漏洞，例如插入惡意程式碼（惡意軟體）、竊取敏感資料，或以其他方式破壞你的專案。這類威脅稱為「供應鏈攻擊」。供應鏈中有漏洞的相依項目會危及你自己專案的安全性，也會讓你的使用者面臨風險。',
    'One of the most important things you can do to protect your supply chain is to patch your vulnerable dependencies.':
      '保護供應鏈最重要的措施之一，就是修補有漏洞的相依項目。',
    'Attackers don’t just target dependencies you use; they will also target user accounts and build processes as well. It’s important to secure both to ensure that the code you distribute hasn’t been tampered with.':
      '攻擊者不只會鎖定你使用的相依項目，也會鎖定使用者帳號和建置流程。務必同時保護兩者，確保你發布的程式碼未遭竄改。',
    // 以下几段答案由相邻文本节点组成（链接未渲染成 <a>），引擎整段匹配：收录整句或按句拆分后的各句；
    // 结尾句点是否单独成节点不确定，另收不带句点的写法
    'GitHub offers a range of features to help you understand the dependencies and secure the dependencies in your environment, and to secure your GitHub accounts and build system.':
      'GitHub 提供一系列功能，協助你瞭解並保護環境中的相依項目，以及保護你的 GitHub 帳號和建置系統。',
    'GitHub offers a range of features to help you understand the dependencies and secure the dependencies in your environment, and to secure your GitHub accounts and build system':
      'GitHub 提供一系列功能，協助你瞭解並保護環境中的相依項目，以及保護你的 GitHub 帳號和建置系統',
    'Why choose GitHub’s supply chain features instead of third-party products?':
      '為什麼選擇 GitHub 的供應鏈功能，而不是第三方產品？',
    'Unlike third-party security add-ons, GitHub’s supply chain features operate entirely in the native GitHub workflows that developers already know and love. By making it easier for developers to remediate vulnerabilities as they go, GitHub frees time for security teams to focus on critical strategies that protect businesses, customers, and communities from application-based vulnerabilities.':
      '與第三方安全性附加元件不同，GitHub 的供應鏈功能完全在開發人員早已熟悉且喜愛的原生 GitHub 工作流程中運作。GitHub 讓開發人員能更輕鬆地邊開發邊修復漏洞，為安全性團隊騰出時間，專注於保護企業、客戶和社群免受應用程式漏洞威脅的關鍵策略。',
    'What is SLSA and SLSA level 3?': '什麼是 SLSA 和 SLSA 等級 3？',
    // SLSA 答案首段文本节点（整段未命中时逐个节点匹配）
    'Supply-chain Levels for Software Artifacts (SLSA)': '軟體成品供應鏈等級 (SLSA)',
    'Supply-chain Levels for Software Artifacts (SLSA) is a framework for improving the end-to-end integrity of a software artifact throughout its development lifecycle.':
      '軟體成品供應鏈等級 (SLSA) 是一套架構，用於在軟體成品的整個開發生命週期中提升其端對端完整性。',
    'It provides a comprehensive, step-by-step methodology for building integrity and provenance guarantees into your software supply chain.':
      '它提供一套全面且循序漸進的方法，協助你在軟體供應鏈中建立完整性和來源保證。',
    'SLSA Level 3 signifies a significantly hardened software supply chain where builds are highly isolated, source code history is verified, and provenance is strictly controlled, providing a strong guarantee against tampering and ensuring the integrity of software artifacts.':
      'SLSA 等級 3 代表經過大幅強化的軟體供應鏈：建置高度隔離、原始碼歷史記錄經過驗證、來源受到嚴格控管，能有效防範竄改，確保軟體成品的完整性。',
    'GitHub Actions and Artifact Attestations greatly simplify the journey to SLSA Level 3.':
      'GitHub 動作和成品證明可大幅簡化達成 SLSA 等級 3 的過程。',
    'GitHub Actions and Artifact Attestations greatly simplify the journey to SLSA Level 3':
      'GitHub 動作和成品證明可大幅簡化達成 SLSA 等級 3 的過程',
    'Can GitHub create software bill of materials or SBOMs?': 'GitHub 能否建立軟體物料清單 (SBOM)？',
    'You can export a software bill of materials or SBOM for your repository from the GitHub dependency graph.':
      '你可以從 GitHub 相依性圖表為儲存庫匯出軟體物料清單 (SBOM)。',
    'SBOMs allow transparency into your open source usage and help expose supply chain vulnerabilities, reducing supply chain risks.':
      'SBOM 能讓你清楚掌握開源元件的使用情形，並協助揭露供應鏈漏洞，降低供應鏈風險。',
    'Are GitHub’s supply chain features paid or free?': 'GitHub 的供應鏈功能是付費還是免費？',
    'Most of GitHub’s supply chain features are available for free to all users.':
      'GitHub 大部分的供應鏈功能都免費提供給所有使用者。',
    'A select few advanced features are available to private repos only in GitHub Code Security.':
      '少數進階功能僅在 GitHub 程式碼安全性中提供給私人儲存庫。',
    'See pricing.': '查看定價。',

    // /security/plans：计划卡片（价格数字与货币代码 USD 照原文；For teams …、per active committer/month 见上）
    'The perfect pair for complete protection': '全面防護的完美組合',
    'Add-on': '附加元件',
    'Explore platform security features': '探索平台安全性功能',
    'Securing your code, end to end': '端對端保護你的程式碼',
    'GitHub safeguards user accounts, branches, tags, and pushes, and supports SBOMs and artifact attestations for SLSA L3 builds.':
      'GitHub 會保護使用者帳號、分支、標記和推送，並支援 SBOM 和成品證明，以實現 SLSA L3 建置。',

    // /security/plans：功能对比表（与 new/plans.ts 的 scoped 同名同译；Provider patterns、Generic patterns、
    // Dependency graph 已由其他文件的 static 收录；单元格的屏幕阅读器文字 Included / Not included）
    'Public repositories': '公開儲存庫',
    Included: '包含',
    'Not included': '不包含',
    'Push protection': '推送保護',
    'Prevent secret exposures by proactively blocking secrets before they reach your code.':
      '在機密進入程式碼前主動攔截，防止機密外洩。',
    'Secret scanning': '機密掃描',
    'Detect and manage exposed secrets across git history, pull requests, issues, and wikis.':
      '在 Git 歷史記錄、拉取請求、議題和 Wiki 中偵測並管理外洩的機密。',
    'GitHub collaborates with AWS, Azure, and Google Cloud to detect secrets with high accuracy. This minimizes false positives, letting you focus on what matters.':
      'GitHub 與 AWS、Azure 和 Google Cloud 合作，以高準確度偵測機密。這能盡量減少誤報，讓你專注於重要的事。',
    'Provider notification': '提供者通知',
    'Providers get real-time alerts when their tokens appear in public code, enabling them to notify, quarantine, or revoke secrets.':
      '提供者的權杖出現在公開程式碼中時，提供者會即時收到警示，以便通知、隔離或撤銷機密。',
    'Validity checks': '有效性檢查',
    'Prioritize active secrets with validity checks for provider patterns.':
      '透過提供者模式的有效性檢查，優先處理仍有效的機密。',
    'Copilot secret scanning': 'Copilot 機密掃描',
    // 原文漏了 secrets（unstructured like passwords），按原意译
    'Use AI to detect unstructured like passwords—without the noise.': '使用 AI 偵測密碼等非結構化機密——免受誤報干擾。',
    'Detect tokens from unknown providers, including HTTP authentication headers, connection strings, and private keys.':
      '偵測來自未知提供者的權杖，包括 HTTP 身分驗證標頭、連接字串和私密金鑰。',
    'Push protection bypass controls': '推送保護繞過控制',
    'Manage who can bypass push protection and when.': '管理誰可以在何時繞過推送保護。',
    'Insights in security overview': '安全性總覽中的洞察',
    'Understand how risk is distributed across your organization with security metrics and insight dashboards.':
      '透過安全性指標和洞察儀表板，瞭解風險在組織中的分布情形。',
    'Scan history API': '掃描歷史記錄 API',
    'Review how and when GitHub scans your repositories for secrets.': '查看 GitHub 掃描儲存庫機密的方式和時間。',
    'Copilot Autofix': 'Copilot 自動修正',
    'Powered by GitHub Copilot, generate automatic fixes for 90% of alert types in JavaScript, Typescript, Java, and Python.':
      '由 GitHub Copilot 驅動，為 JavaScript、TypeScript、Java 和 Python 中 90% 的警示類型自動產生修正。',
    'Third party extensibility for code scanning alerts': '程式碼掃描警示的第三方擴充性',
    'Centralize your findings across all your scanning tools via SARIF upload to GitHub.':
      '將 SARIF 上傳到 GitHub，集中管理所有掃描工具的發現項目。',
    'Contextual vulnerability intelligence and advice': '結合上下文的漏洞情報和建議',
    'Quickly remediate with context provided by Copilot Autofix.': '利用 Copilot 自動修正提供的上下文快速修復。',
    'Uncover vulnerabilities in your code with our industry-leading semantic code analysis.':
      '運用業界領先的語意程式碼分析，找出程式碼中的漏洞。',
    'Security campaigns': '安全性活動',
    'Reduce security debt and burn down your security backlog with security campaigns.':
      '透過安全性活動減少安全性債務，逐步消化安全性待辦事項。',
    'Get a clear view of your project’s dependencies with a summary of manifest, lock files, and submitted dependencies via the API.':
      '透過資訊清單、鎖定檔和經由 API 提交的相依項目摘要，清楚掌握專案的相依項目。',
    'Dependency review action': '相依性審查動作',
    'Catch insecure dependencies before adding them and get insights on licenses, dependents, and age.':
      '在加入不安全的相依項目前加以攔截，並掌握授權條款、被相依項目和存在時間等資訊。',
    'Dependabot custom auto-triage rules': 'Dependabot 自訂自動分類規則',
    'Define alert-centric policies to control how Dependabot handles alerts and pull requests.':
      '定義以警示為中心的政策，控制 Dependabot 處理警示和拉取請求的方式。',
    'Dependabot security updates with grouped updates': '支援分組更新的 Dependabot 安全性更新',
    'Automated pull requests that batch dependency updates for known vulnerabilities.':
      '自動建立拉取請求，批次更新有已知漏洞的相依項目。',
    'Dependabot version updates': 'Dependabot 版本更新',
    'Automated pull requests that keep your dependencies up to date.': '自動建立拉取請求，讓相依項目保持最新。',
    'Get a clear view of risk distribution with security metrics and dashboards.':
      '透過安全性指標和儀表板，清楚掌握風險分布。',
  },
  inline: [
    // 评价引言（/security）：<b><元素>GitHub Advanced Security</元素> empowers our developers</b>，产品名单独成元素时
    // 整句改写，产品名与译文之间不留空格（相邻文本节点时整段命中 static）
    ['{} empowers our developers', '{}為我們的開發人員提供強大助力'],
    // /security/advanced-security 常见问题：答案被链接拆开（p > a），链接文字由 static 翻译
    [
      'Yes. GitHub Advanced Security is available as an {} for Azure DevOps.',
      '是的。GitHub 進階安全性可作為 Azure DevOps 的{}使用。',
    ],
    [
      'Yes. As with all GitHub products, {} for GitHub Advanced Security is publicly available.',
      '是的。與所有 GitHub 產品一樣，GitHub 進階安全性的{}也是公開的。',
    ],
    ['Yes! Please visit {} to learn more.', '是的！請造訪{}以瞭解詳情。'],
    // Read our <a>customer stories</a> to learn how customers like <a>客户</a>, <a>客户</a>, and <a>客户</a> use …：
    // 客户名是链接，数目不定（至少两个，and 前可有逗号；槽位两侧的空格不进句型键）；客户名保持原文，与中文之间留空格
    [
      /^Read our \{\} to learn how customers like \{\}((?:, \{\})*)(?:, )?and \{\} use GitHub Advanced Security to secure applications and accelerate the software development lifecycle\.$/,
      (_: string, middle: string) =>
        `閱讀我們的{}，瞭解 {}${middleCustomers(middle)} 和 {} 等客戶如何使用 GitHub 進階安全性保護應用程式並加速軟體開發生命週期。`,
    ],
  ],
} satisfies PageDictionary
