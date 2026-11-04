import type { PageDictionary } from '../../../core/types'
import { DATE_SOURCE, joinCjk, translateTime } from '../helpers'

/**
 * 依赖项关系图：依赖项（/network/dependencies）、被依赖（/network/dependents）、
 * Dependabot 更新（/network/updates）、依赖路径对话框、SBOM 导出、未启用状态。
 */
export default {
  static: {
    'Dependency graph': '相依性圖表',
    'Dependency Insights menu': '相依性洞察選單',
    Dependencies: '相依項目',
    Dependents: '被相依項目',
    'Network Dependents': '被相依項目',
    'Export SBOM': '匯出 SBOM',
    'Dependency files checked': '相依性檔案檢查於',
    'Tell us how to make the Dependency Graph work better for you with a few quick questions.':
      '回答幾個簡短問題，告訴我們如何讓相依性圖表更適合你。',

    // 依赖项列表（Direct / Transitive 作「直接」「間接」，同台湾通行的「直接相依」「間接相依」）
    'Search all dependencies': '搜尋所有相依項目',
    'Filter ecosystems': '篩選生態系',
    'Filter by ecosystem': '依生態系篩選',
    'Filter by ecosystem options': '依生態系篩選選項',
    'No ecosystems found.': '找不到生態系。',
    Transitive: '間接',
    Direct: '直接',
    'Learn more about SBOMS.': '瞭解 SBOM。',
    'Supported ecosystems will have transitivity labels on their packages.': '受支援的生態系會在套件上顯示直接/間接相依標籤。',
    'View transitive paths': '查看間接相依路徑',
    'You can view transitive paths for packages within supported ecosystems.': '你可以查看受支援生態系中套件的間接相依路徑。',
    'Show dependency options': '顯示相依項目選項',
    'No dependencies found.': '找不到相依項目。',
    // To view your dependency graph, … define dependencies in <one of the supported manifest file types>, like …
    'To view your dependency graph, your repository must define dependencies in': '若要查看相依性圖表，儲存庫必須將相依項目定義在',
    'Detect additional dependencies with GitHub Actions': '使用 GitHub 動作偵測更多相依項目',
    // … GitHub Actions adds your dependencies using the <dependency submission API> so you can receive …
    'Not all dependencies are automatically detected for ecosystems like Gradle. GitHub Actions adds your dependencies using the':
      'Gradle 等生態系的相依項目並非都能自動偵測。GitHub 動作新增你的相依項目時使用',
    'so you can receive Dependabot alerts for known vulnerabilities.': '，讓你能收到已知漏洞的 Dependabot 警示。',
    'View in Marketplace': '在市集中查看',
    // These dependencies are defined in <owner/repo>’s manifest files, such as …
    'These dependencies are defined in': '這些相依項目定義在',
    '’s manifest files, such as': '的資訊清單檔案中，例如',
    "'s manifest files, such as": '的資訊清單檔案中，例如',
    'Dependencies defined in': '相依項目定義於',
    'Dependencies defined in these manifest files have known security vulnerabilities and should be updated:':
      '這些資訊清單檔案中定義的相依項目有已知的安全性漏洞，應予以更新：',
    'Known security vulnerability in': '已知的安全性漏洞位於',
    'Known vulnerability found': '發現已知漏洞',
    'update suggested:': '建議更新：',
    'Always verify the validity and compatibility of suggestions with your codebase.': '務必確認建議有效且與你的程式碼庫相容。',
    'What’s not been updated': '尚未更新的內容',
    "What's not been updated": '尚未更新的內容',

    // 未启用：The owner of this repository has not yet enabled … Once enabled, you can <track this repository’s dependencies>.
    'Dependency graph is disabled': '相依性圖表已停用',
    'The owner of this repository has not yet enabled the dependency graph. Once enabled, you can':
      '此儲存庫的擁有者尚未啟用相依性圖表。啟用後，你可以',
    'Dependency graph has not been enabled by an organization owner or a user with admin permissions for this repository. Once enabled, you can':
      '組織擁有者或具有此儲存庫管理員權限的使用者尚未啟用相依性圖表。啟用後，你可以',
    'track this repository’s dependencies': '追蹤此儲存庫的相依項目',
    "track this repository's dependencies": '追蹤此儲存庫的相依項目',
    'Learn more about how we use your data.': '瞭解我們如何使用你的資料。',
    'Learn more about how we use your data': '瞭解我們如何使用你的資料',
    'Enable the dependency graph': '啟用相依性圖表',
    // Track this repository’s <dependencies and sub-dependencies>
    'Track this repository’s': '追蹤此儲存庫的',
    "Track this repository's": '追蹤此儲存庫的',
    'dependencies and sub-dependencies': '相依項目和子相依項目',
    'is not enabled for this repository. Click on "Enable the dependency graph" below to enable it.':
      '未在此儲存庫中啟用。按一下下方的「啟用相依性圖表」以啟用。',
    // If you’d like to enable the <dependency graph> and <vulnerability alerting>, click on "Allow access" below …
    'If you’d like to enable the': '如果要啟用',
    "If you'd like to enable the": '如果要啟用',
    'click on "Allow access" below to enable it.': '按一下下方的「允許存取」以啟用。',
    ', click on "Allow access" below to enable it.': '，按一下下方的「允許存取」以啟用。',

    // 被依赖列表：Repositories that depend on <软件包>
    'Filter by Package': '依套件篩選',
    'Package:': '套件：',
    'Repositories that depend on': '相依於以下套件的儲存庫',
    'Packages that depend on': '相依於以下套件的套件',
    'These counts are approximate and may not exactly match the dependents shown below.':
      '這些計數為近似值，可能與下方顯示的被相依項目不完全相符。',
    'Filter by Owner': '依擁有者篩選',
    'Filter by owner': '依擁有者篩選',
    'Filter by owner menu': '依擁有者篩選選單',
    'Filter by owner list': '依擁有者篩選清單',
    'Enter a user name': '輸入使用者名稱',
    'Filter by this user': '依此使用者篩選',
    'We haven’t found any dependents for this repository yet.': '尚未發現此儲存庫的被相依項目。',
    "We haven't found any dependents for this repository yet.": '尚未發現此儲存庫的被相依項目。',
    'We’ll keep looking!': '我們會繼續尋找！',
    "We'll keep looking!": '我們會繼續尋找！',
    'GitHub does not currently determine the dependents of private repositories': 'GitHub 目前不會判定私人儲存庫的被相依項目',

    // Dependabot 更新（/network/updates）
    'Enable Dependabot': '啟用 Dependabot',
    "Dependabot isn't enabled": '未啟用 Dependabot',
    'Dependabot isn’t enabled': '未啟用 Dependabot',
    "Dependabot isn't enabled on forks by default": '分叉預設不啟用 Dependabot',
    'Dependabot isn’t enabled on forks by default': '分叉預設不啟用 Dependabot',
    "Dependabot version updates aren't configured yet": '尚未設定 Dependabot 版本更新',
    'Dependabot version updates aren’t configured yet': '尚未設定 Dependabot 版本更新',
    'Dependabot creates pull requests to keep your dependencies up-to-date.': 'Dependabot 會建立拉取請求，讓你的相依項目保持最新。',
    'Create config file': '建立設定檔',
    'Recent update jobs': '最近的更新作業',
    // <Dependabot version updates> automatically keep your application up-to-date …
    'automatically keep your application up-to-date by periodically updating dependencies to their latest versions.':
      '會定期將相依項目更新到最新版本，讓你的應用程式自動保持最新。',
    'can also help keep dependencies updated.': '也能協助讓相依項目保持最新。',
    'Monitored dependency files': '受監控的相依性檔案',
    'Check for updates': '檢查更新',
    'Recent jobs': '最近的作業'
  },
  scoped: {
    // 链接文字含句末的「中」：…必須將相依項目定義在 <任一種支援的資訊清單檔案中>，例如 …
    'one of the supported manifest file types': '任一種支援的資訊清單檔案中',
    ', like': '，例如',
    'dependency submission API': '相依性提交 API',
    'dependency graph': '相依性圖表',
    'vulnerability alerting': '漏洞警示',
    'Allow access': '允許存取',
    'Dependabot version updates': 'Dependabot 版本更新',
    'Dependabot security updates': 'Dependabot 安全性更新',
    'view logs': '查看記錄',
    'Secret scanning': '機密掃描',
    // 生态系统筛选项（与 npm 并列）；产品名按用户规定译出，同 security 公告的生态系统选项
    'GitHub Actions': 'GitHub 動作'
  },
  regexp: [
    // 依赖条目元信息：· Detected automatically on Oct 18, 2026 · MIT
    [
      new RegExp(`^· Detected automatically on (${DATE_SOURCE})(?: · (.+))?$`),
      (_, date, license) => `${joinCjk('· 自動偵測於', translateTime(date))}${license ? ` · ${license}` : ''}`
    ],
    // 依赖路径对话框
    [/^Paths for (.+)$/, '$1 的路徑'],
    [/^Showing ([\d,]+) paths?\. Export SBOM to view all paths\.$/, '顯示 $1 條路徑。匯出 SBOM 以查看所有路徑。'],
    // 计数
    [/^([\d,]+) Total$/, '共 $1 個'],
    [/^([\d,]+) (Repositor(?:y|ies)|Packages?)$/, (_, count, kind) => `${count} 個${kind.startsWith('Repositor') ? '儲存庫' : '套件'}`],
    // 页面标题片段：Network Dependents · owner/repo · @scope/name repositories
    // 软件包名须像软件包名（@scope/name、小写开头，或含 . : /），避免误命中「12 repositories」「Public repositories」
    [
      /^(@[\w.-]+\/[\w.-]+|[a-z][\w.:/-]*|[A-Z0-9][\w-]*[.:/][\w.:/-]*) (repositories|packages)$/,
      (_, name, kind) => `相依於 ${name} 的${kind === 'repositories' ? '儲存庫' : '套件'}`
    ]
  ],
  ignore: [
    // 软件包名、清单文件路径
    'a[data-hovercard-type="dependendency_graph_package"]',
    'a[data-hovercard-type="dependency_graph_package"]',
    'a[data-test-selector="dg-repo-pkg-manifest"]',
    '#dependents .select-menu-item-text',
    '#dependents p[role="status"] > strong'
  ]
} satisfies PageDictionary
