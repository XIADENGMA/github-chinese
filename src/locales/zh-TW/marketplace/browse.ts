import type { PageDictionary } from '../../../core/types'
import { joinCjk } from '../helpers'

/**
 * 市场（Marketplace）首页、导航、搜索与筛选、类别、搜索结果、上架新工具页（/marketplace/new）。
 * 类别名多为常见单词，放 scoped 只在市场页生效；类别说明是长句，放 static。
 * 产品名按用户决定（2026-10-27，product-names.md）译成中文：Marketplace → 市集、GitHub Marketplace → GitHub 市集、
 * Actions → 動作、GitHub Sponsors → GitHub 贊助；Copilot 是品牌词，保留。
 * creator 作「創作者」（与 org-settings/actions.ts 的「已驗證創作者」一致），extension 作「擴充功能」。
 */

/** 侧栏类别名 */
export const CATEGORIES: Readonly<Record<string, string>> = {
  'Agent apps': '代理應用程式',
  'AI Assisted': 'AI 輔助',
  'API management': 'API 管理',
  'Backup Utilities': '備份公用程式',
  Chat: '聊天',
  'Code quality': '程式碼品質',
  'Code review': '程式碼審查',
  'Code Scanning Ready': '支援程式碼掃描',
  'Code search': '程式碼搜尋',
  'Container CI': '容器 CI',
  'Continuous integration': '持續整合',
  'Dependency management': '相依性管理',
  Deployment: '部署',
  'Deployment Protection Rules': '部署保護規則',
  'Desktop tools': '桌面工具',
  IDEs: 'IDE',
  Learning: '學習',
  Localization: '在地化',
  Mobile: '行動裝置',
  'Mobile CI': '行動裝置 CI',
  Monitoring: '監控',
  'Open Source management': '開源管理',
  'Project management': '專案管理',
  Publishing: '發布',
  'Recently added': '最近新增',
  Reporting: '報告',
  Security: '安全性',
  Support: '支援',
  Sustainability: '永續性',
  Testing: '測試',
  'Time tracking': '時間追蹤',
  Utilities: '公用程式',
  'Game CI': '遊戲 CI',
  'GitHub Sponsors': 'GitHub 贊助'
}

/** 类别名的正则片段（已转义） */
const CATEGORY_NAMES = Object.keys(CATEGORIES)
  .map(name => name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
  .join('|')

/** 「<类别> apps / actions」标题：程式碼品質應用程式、IDE 應用程式、GitHub 贊助動作 */
function categoryHeading(name: string, kind: string): string {
  return joinCjk(CATEGORIES[name] ?? name, kind === 'apps' ? '應用程式' : '動作')
}

/** 首页与筛选用到的单词；Security、Support、Code review 与 common 的全局译文相同，不进 scoped */
const CATEGORY_SCOPED = Object.fromEntries(
  Object.entries(CATEGORIES).filter(([name, label]) => name !== label && !['Security', 'Support', 'Code review'].includes(name))
)

export default {
  static: {
    // 头部
    'Enhance your workflow with extensions': '使用擴充功能強化你的工作流程',
    // 原文没有标点，译文不加
    'Tools from the community and partners to simplify tasks and automate processes': '來自社群和合作夥伴的工具可簡化工作並自動化流程',
    'Tools to improve your workflow': '改善工作流程的工具',

    // 导航
    'Marketplace navigation': '市集導覽',
    'Marketplace categories': '市集類別',
    'Open Marketplace categories': '開啟市集類別',
    'All apps': '所有應用程式',
    'All actions': '所有動作',
    'Create a new extension': '建立新的擴充功能',
    'Create extension': '建立擴充功能',

    // 搜索
    'Search Marketplace': '搜尋市集',
    'Search for apps and actions': '搜尋應用程式和動作',
    'Search for Copilot extensions, apps and actions': '搜尋 Copilot 擴充功能、應用程式和動作',
    'Search in GitHub Marketplace': '在 GitHub 市集中搜尋',

    // 筛选器
    'Apps only': '僅限應用程式',
    'Actions only': '僅限動作',
    'Copilot extensions only': '僅限 Copilot 擴充功能',
    'Copilot extensions': 'Copilot 擴充功能',
    'Filter by listing type': '依類型篩選',
    // 搜索框筛选建议的组合 aria-label：<名称>, Filter, <说明>（两个筛选器结构相同）
    'Listing type, Filter, Filter by listing type': '類型，篩選器，依類型篩選',
    'Category, Filter, Filter by category or tag': '類別，篩選器，依類別或標籤篩選',
    'Filter by category or tag': '依類別或標籤篩選',
    'All creators': '所有創作者',
    'Verified creators': '已驗證創作者',

    // 首页
    'Discover apps with Copilot extensions': '探索具有 Copilot 擴充功能的應用程式',
    'Your favorite tools now work with GitHub Copilot.': '你喜愛的工具現在可搭配 GitHub Copilot 使用。',
    'View recommended or recent marketplace listings': '查看推薦或最近新增的市集項目',
    'View recommended or recent marketplace listings navigation': '查看推薦或最近新增的市集項目',

    // 搜索结果
    'Copilot Extensions': 'Copilot 擴充功能',
    'Extend Copilot capabilities using third party tools, services, and data': '使用第三方工具、服務和資料擴充 Copilot 的功能',
    'Automate your workflow from idea to production': '將從構想到上線的工作流程自動化',
    'Build on your workflow with apps that integrate with GitHub': '使用與 GitHub 整合的應用程式擴充你的工作流程',
    'Try searching by different keywords.': '嘗試使用其他關鍵字搜尋。',
    'No results. Try searching by different keywords.': '沒有結果。嘗試使用其他關鍵字搜尋。',

    // 类别说明（标点随原文：原文没有逗号的句子不加逗号、顿号）
    'Tools that are superpowered with AI (artificial intelligence) to help you be a better developer.':
      'AI（人工智慧）加持的工具助你成為更好的開發人員。',
    'Structure your API infrastructure to enable various internet gateways to interact with your service.':
      '建構 API 基礎架構讓各種網際網路閘道都能與你的服務互動。',
    'Utilities providing periodic backups of your GitHub data': '定期備份 GitHub 資料的公用程式',
    'Bring GitHub into your conversations.': '將 GitHub 帶進你的對話。',
    'Automate your code review with style, quality, security, and test‑coverage checks when you need them.':
      '視需要透過程式碼風格、品質、安全性和測試涵蓋範圍檢查自動執行程式碼審查。',
    'Automate your code review with style, quality, security, and test-coverage checks when you need them.':
      '視需要透過程式碼風格、品質、安全性和測試涵蓋範圍檢查自動執行程式碼審查。',
    'Ensure your code meets quality standards and ship with confidence.': '確保程式碼符合品質標準並安心發布。',
    'Static analysis, dynamic analysis, container scanning, linting, and fuzzing tools that integrate with GitHub Code Scanning SARIF Upload':
      '與 GitHub 程式碼掃描 SARIF 上傳整合的靜態分析、動態分析、容器掃描、程式碼檢查和模糊測試工具',
    'Query, index, or hash the semantics of your source code.': '查詢、索引或雜湊原始碼的語意。',
    'Continuous integration for container applications.': '容器應用程式的持續整合。',
    'Automatically build and test your code as you push it to GitHub, preventing bugs from being deployed to production.':
      '推送到 GitHub 時自動建置並測試程式碼，避免錯誤部署到正式環境。',
    'Secure and manage your third-party dependencies.': '保護並管理第三方相依項目。',
    'Streamline your code deployment so you can focus on your product.': '簡化程式碼部署以便專注於產品。',
    'Enables custom protection rules to gate deployments with third-party services': '啟用自訂保護規則以透過第三方服務管控部署',
    'Developer tools that are run natively on your local machine.': '在本機上原生執行的開發人員工具。',
    'Tools for building a CI pipeline for game development': '為遊戲開發建置 CI 管線的工具',
    'Find the right interface to build, debug, and deploy your source code.': '找到合適的介面來建置、偵錯並部署原始碼。',
    'Get the skills you need to level up.': '取得更上一層樓所需的技能。',
    "Extend your software's reach. Localize and translate continuously from GitHub.": '擴大軟體的觸及範圍。在 GitHub 上持續在地化並翻譯。',
    'Extend your software’s reach. Localize and translate continuously from GitHub.': '擴大軟體的觸及範圍。在 GitHub 上持續在地化並翻譯。',
    'Improve your workflow for the small screen.': '改善小螢幕上的工作流程。',
    'Continuous integration for Mobile applications': '行動應用程式的持續整合',
    'Monitor the impact of your code changes. Measure performance, track errors, and analyze your application.':
      '監控程式碼變更的影響。評估效能、追蹤錯誤並分析應用程式。',
    'Running open source projects can be hard. Here are some tools to make that process a little more fun and a ton more manageable.':
      '經營開源專案並不容易。這些工具能讓過程更有趣也更好管理。',
    'Organize, manage, and track your project with tools that build on top of issues and pull requests.':
      '使用以議題和拉取請求為基礎的工具來組織、管理並追蹤專案。',
    'Get your site ready for production so you can get the word out.': '讓網站做好上線準備以便廣為宣傳。',
    'The latest tools that help you and your team build software better, together.': '協助你和團隊攜手更好地打造軟體的最新工具。',
    'Get insights into how your teams are developing software using GitHub.': '深入瞭解團隊如何使用 GitHub 開發軟體。',
    'Find, fix, and prevent security vulnerabilities before they can be exploited.': '在安全性漏洞遭到利用前發現、修正並防範。',
    'Get your team and customers the help they need.': '為團隊和客戶提供所需的協助。',
    'Optimize your work to minimize impact on the environment.': '最佳化工作以減少對環境的影響。',
    'Eliminate bugs and ship with more confidence by adding these tools to your workflow.':
      '將這些工具加入工作流程以消除錯誤並更安心地發布。',
    'Track your progress, and predict how long a task will take based on your coding activity.':
      '追蹤進度，並根據程式開發活動預測工作需要多久。',
    'Auxiliary tools to enhance your experience on GitHub': '提升 GitHub 使用體驗的輔助工具',

    // 上架新工具 /marketplace/new（listing 作「上架資訊」，与 settings-developer/apps.ts 一致）
    'New Marketplace Listing': '新增市集上架資訊',
    'List your tool': '上架你的工具',
    'List your tool on GitHub Marketplace': '在 GitHub 市集上架你的工具',
    'Is this your app?': '這是你的應用程式嗎？',
    'You have no tools to list on GitHub Marketplace': '你沒有可在 GitHub 市集上架的工具',
    'Learn more about the requirements': '瞭解相關要求',
    // 链接「瞭解相關要求」之后的片段：原文没有逗号，译文不加
    'to list a tool on GitHub Marketplace.': '以便在 GitHub 市集上架工具。',
    'More about tools and GitHub Marketplace': '關於工具和 GitHub 市集的更多資訊',
    'About GitHub Marketplace': '關於 GitHub 市集',
    'How to create and list tools on the GitHub Marketplace, including guidelines for listing content, artwork, and screenshots.':
      '如何在 GitHub 市集建立並上架工具，包括上架內容、圖片和螢幕截圖的指南。',
    'Adding webhooks for a GitHub Marketplace listing': '為 GitHub 市集上架資訊新增 Web 鉤子',
    'Add webhooks for your app to notify you when specified events are triggered.': '為應用程式新增 Web 鉤子以在指定事件觸發時通知你。'
  },
  scoped: {
    ...CATEGORY_SCOPED,
    // 面包屑、页面标题（Marketplace · GitHub）里的 Marketplace、GitHub Marketplace 由 common 的全局 static 译「市集」
    Apps: '應用程式',
    // 侧栏分区标题、面包屑、搜索结果分区标题里的 Actions（复数、指可复用的动作）；全局导航产品菜单里的 Actions 同译
    Actions: '動作',
    // App、Action 也是列表条目的类型标签；另一种标签 Copilot 是产品名，不译
    App: '應用程式',
    Action: '動作',
    'Collapse sidebar': '摺疊側邊欄',
    'Listing type': '類型',
    'Listing Type': '類型',
    Category: '類別',
    // 搜索框输入 type:、category: 时的有值建议项（与 issues 的「有<筛选器>」同式）
    'Has listing type': '有類型',
    'Has category': '有類別',
    'Most popular': '最熱門',
    'Filter:': '篩選器：',
    // 创作者筛选（All creators / Verified creators）
    'By:': '創作者：',
    'Sort:': '排序：',
    'Free trial': '免費試用',
    Popularity: '熱門程度',
    'Best match': '最相符',
    // 类别说明「Tools to manage your <GitHub Sponsors> community」
    'Tools to manage your': '管理',
    community: '社群的工具'
  },
  regexp: [
    [/^Search results for “(.+)”$/, '「$1」的搜尋結果'],
    // 原文末尾的句号照录；搜索结果量词作「項」，与 common-ui/counts.ts 一致
    [/^(\d[\d,]*) results?(\.?)$/, (_, count: string, period: string) => `${count} 項結果${period ? '。' : ''}`],
    [new RegExp(`^(${CATEGORY_NAMES}) (apps|actions)$`), (_, name: string, kind: string) => categoryHeading(name, kind)],
    // 分页：原文末尾的省略号照录
    [/^Page (\d+)(\.\.\.|…)?$/, '第 $1 頁$2']
  ],
  ignore: [
    // 列表条目：名称、描述
    '[data-testid="marketplace-item"] h3',
    '[data-testid="marketplace-item"] p',
    // 搜索框内的查询文本叠加层（用户输入）
    '#marketplace-search-filter div[aria-hidden="true"]'
  ]
} satisfies PageDictionary
