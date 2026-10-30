import type { PageDictionary, RegExpRule } from '../../../core/types'

const ORG = '([\\w.-]+)'

/**
 * Dependabot 规则页（规则列表、新建 / 编辑表单、删除确认）的 scoped 词条。
 * 存储库设置的 Dependabot 规则页是同一组件，由 repo-settings/security.ts 取用；
 * New rule、/ New rule、Rules 在存储库设置由 branches.ts、nav.ts 收录，不放这里
 */
export const DEPENDABOT_RULES_SCOPED: Readonly<Record<string, string>> = {
  'Rule created.': '已建立規則。',
  'Rule saved. It may take a moment for this rule to be applied to matching alerts':
    '已儲存規則。此規則可能需要一些時間才會套用到相符的警示',
  'Rule saved.': '已儲存規則。',
  'Rule was successfully deleted.': '已刪除規則。',
  '/ Dependabot rules': '/ Dependabot 規則',
  // preset 取「預設集」，与 default（預設）区分
  'GitHub presets': 'GitHub 預設集',
  'Managed by GitHub': '由 GitHub 管理',
  'Edit curated rule': '編輯精選規則',
  'Edit rule': '編輯規則',
  'Dismiss low-impact alerts for development-scoped dependencies': '解除開發範圍相依項目的低影響警示',
  'In a developer (non-production or runtime) environment, these alerts are unlikely to be exploitable or have limited effect like slow builds or long-running tests.':
    '在開發環境（非正式環境、非執行階段）中，這些警示不太可能被利用，或影響有限，例如建置變慢或測試執行時間較長。',
  'Learn more about this methodology.': '瞭解此方法。',
  'Repository rules': '儲存庫規則',
  'Organization rules': '組織規則',
  'Edit custom rule': '編輯自訂規則',
  'The following inputs have errors:': '下列輸入有錯誤：',
  'Rule name': '規則名稱',
  // 表单校验提示：add 指填写名称，作「輸入」
  'Add a rule name': '輸入規則名稱',
  State: '狀態',
  Enforced: '已強制執行',
  // 「目標警示」自动补全只译分组标题，筛选取值（critical、runtime 等）要原样输入查询，照原文
  'Target alerts': '目標警示',
  'Add rule metadata': '新增規則中繼資料',
  Severities: '嚴重性',
  Scopes: '範圍',
  'Rules will be applied for alerts matching all included metadata.': '規則會套用到與所有包含的中繼資料相符的警示。',
  'Select one or more rules to apply to matching alerts.': '選取一或多個要套用到相符警示的規則。',
  'Dependabot will automatically close or reopen alerts based on selected criteria.':
    'Dependabot 會根據選取的條件自動關閉或重新開啟警示。',
  'Until patch is available': '直到有可用的修補程式',
  // 拉取请求语境的动词 open → 建立（安全更新即 Dependabot 创建的拉取请求）
  'Open a pull request to resolve alerts': '建立拉取請求以解決警示',
  'Dependabot will attempt to open security updates based on selected criteria.':
    'Dependabot 會根據選取的條件嘗試建立安全性更新。',
  'Create rule': '建立規則',
  '/ Edit rule': '/ 編輯規則',
  'Save rule': '儲存規則',
  'Delete this rule': '刪除此規則',
  'Deleting this rule can potentially reopen associated alerts.': '刪除此規則可能會重新開啟關聯的警示。',
  'Are you sure you want to delete this rule?': '確定要刪除此規則嗎？',
  '/ GitHub Preset rule': '/ GitHub 預設集規則',
}

/** Dependabot 规则的正则：安全设置页的已启用条数、删除确认（repo-settings/security.ts 同样取用） */
export const DEPENDABOT_RULES_REGEXP: readonly RegExpRule[] = [
  [/^(\d+) rules? enabled$/, '已啟用 $1 個規則'],
  // 规则名两侧的引号随原文（作「」），原文无逗号，译文不加
  [
    /^This will permanently delete the rule "([^"]{1,200})" and potentially reopen associated alerts\.$/,
    '這會永久刪除規則「$1」並可能重新開啟關聯的警示。',
  ],
]

/**
 * 绕过列表内置参与者的名称（actor.name 原值）：存储库角色 admin、maintain、write，组织管理员角色 Organization admin
 * （新版组件里也可能是 admin，故 admin 只作「管理員」），无名称时的兜底词 Unknown。用 Map 查找，constructor 等原型链键不会命中
 */
const BYPASS_ACTOR_NAMES: ReadonlyMap<string, string> = new Map([
  ['admin', '管理員'],
  ['maintain', '維護'],
  ['write', '寫入'],
  ['Organization admin', '組織管理員'],
  ['Unknown', '未知'],
])

/**
 * 绕过列表每行菜单按钮的读屏名称：「<名称> Bypass actor actions」（repo-settings/security.ts 同样取用）。
 * 内置参与者用译名（同名的团队、用户也会译出）；其余团队、应用、用户、自定义角色的名称原样保留
 */
export const BYPASS_ACTOR_ACTIONS_RULE: RegExpRule = [
  /^(.+) Bypass actor actions$/,
  (_, name: string) => {
    const builtin = BYPASS_ACTOR_NAMES.get(name)
    return builtin === undefined ? `可繞過的執行者 ${name} 的動作` : `可繞過的執行者${builtin}的動作`
  },
]

/**
 * 安全：身份验证安全（双因素身份验证、SAML 单一登录、SSH 证书颁发机构、IP 允许列表）、Advanced Security（配置、全局设置）、
 * Dependabot 规则、已验证和批准的域、合规。
 * 个人和存储库的「程式碼安全性」设置页有大量同名文字，这部分放 scoped。
 * 术语：security（功能）→ 安全性，configuration → 設定，enforce → 強制執行，actor → 執行者，bypass → 繞過，
 * eligible → 符合資格，default setup → 預設設定，extended → 擴充，certificate authority → 憑證授權單位。
 */
export default {
  static: {
    // 身份验证安全：双因素身份验证
    'Requiring an additional authentication method adds another level of security for your organization.':
      '要求額外的身分驗證方式可為組織多加一層安全防護。',
    'Require two-factor authentication for everyone in your organization': '要求組織中的所有人啟用雙重驗證',
    'Only allow secure two-factor methods': '僅允許安全的雙重驗證方式',
    'Members, billing managers, and outside collaborators who do not have two-factor authentication enabled for their personal account will be removed from the organization and will receive an email notifying them about the change.':
      '個人帳號未啟用雙重驗證的成員、帳務管理員和外部協作者將從組織中移除，並會收到通知此變更的電子郵件。',
    'Enabling two-factor authentication requirement.': '正在啟用雙重驗證要求。',
    'Disabled two-factor authentication requirement.': '已停用雙重驗證要求。',

    // 身份验证安全：SSH 证书颁发机构
    'SSH Certificate Authorities': 'SSH 憑證授權單位',
    'SSH certificate authorities': 'SSH 憑證授權單位',
    'Provide SSH certificates that members can use to access your resources with Git':
      '提供 SSH 憑證供成員透過 Git 存取你的資源',
    'New CA': '新增 CA',
    'Add CA': '新增 CA',
    'Require SSH Certificates': '要求使用 SSH 憑證',
    'I understand, please delete this CA': '我瞭解，刪除此 CA',

    // 身份验证安全：IP 允许列表
    'An IP allow list lets your organization limit access based on the IP address a person is accessing from.':
      'IP 允許清單可讓組織根據存取來源的 IP 位址限制存取。',
    // 原文无标点，译文不加
    "Restrict access to your organization's assets by configuring a list of IP addresses that are allowed to connect":
      '設定允許連線的 IP 位址清單以限制對組織資產的存取',
    'Restrict access to your organization’s assets by configuring a list of IP addresses that are allowed to connect':
      '設定允許連線的 IP 位址清單以限制對組織資產的存取',
    'Enable IP allow list': '啟用 IP 允許清單',
    'Enable IP allow list configuration for installed GitHub Apps': '為已安裝的 GitHub 應用程式啟用 IP 允許清單設定',

    // 身份验证安全：SAML 单一登录（GitHub Enterprise Cloud 组织）
    'Enable SAML authentication': '啟用 SAML 身分驗證',
    'Sign on URL': '登入 URL',
    'Public certificate': '公開憑證',
    'Test SAML configuration': '測試 SAML 設定',

    // Advanced Security：配置
    'Code security configurations': '程式碼安全性設定',
    'New configuration': '新增設定',
    'Apply to': '套用到',
    'Apply configuration': '套用設定',
    'All repositories without configurations': '所有未套用設定的儲存庫',
    // detach 与 repo-settings/danger-zone.ts 一致作「分離」
    'Detach configuration': '分離設定',
    'Use as default for newly created repositories': '設為新建立儲存庫的預設',
    'Enforce configuration': '強制執行設定',
    'Custom configuration': '自訂設定',
    'Update configuration': '更新設定',
    'Dependency scanning': '相依性掃描',
    'Malware alerts': '惡意軟體警示',
    'Scan for AI-detected secrets': '掃描 AI 偵測到的機密',
    'Generic patterns': '通用模式',
    'Extended metadata': '擴充中繼資料',
    'Specific actors': '特定執行者',
    'Select actors': '選取執行者',
    'Specific roles or teams': '特定角色或團隊',
    'Add role or team': '新增角色或團隊',

    // 机密风险评估、绕过请求、自定义模式
    Assessments: '評估',
    'Scan your organization': '掃描你的組織',
    'Rerun scan': '重新執行掃描',
    'Preview cost and enable Secret Protection': '預覽費用並啟用機密保護',
    'Review and enable': '查看並啟用',
    'For all repositories': '適用於所有儲存庫',
    'For public repositories for free': '免費用於公開儲存庫',
    'Configure in settings': '在設定頁面中設定',
    'Approve bypass request': '核准繞過請求',
    'Deny bypass request': '拒絕繞過請求',
    'Push protection bypass': '推送保護繞過',
    'All statuses': '所有狀態',
    'Publish pattern': '發布模式',
    'All repositories in the organization': '組織中的所有儲存庫',

    // Advanced Security：全局设置（组织专用）
    "Security and analysis features help keep your repositories secure and updated. By enabling these features, you're granting us permission to perform read-only analysis on your organization's repositories.":
      '安全性和分析功能可協助你的儲存庫保持安全和最新。啟用這些功能即表示你授權我們對組織的儲存庫執行唯讀分析。',
    'Security and analysis features help keep your repositories secure and updated. By enabling these features, you’re granting us permission to perform read-only analysis on your organization’s repositories.':
      '安全性和分析功能可協助你的儲存庫保持安全和最新。啟用這些功能即表示你授權我們對組織的儲存庫執行唯讀分析。',
    'Grant Dependabot access to private repositories': '授予 Dependabot 私人儲存庫的存取權',
    'In order to update dependencies in your organization, Dependabot accesses dependencies in all public repositories and the selected private repositories. The contents of these repositories will be accessible to all users in your organization through Dependabot updates. Be sure that you want to share these repositories with everyone in your organization or consider using private registries instead.':
      '為了更新組織中的相依項目，Dependabot 會存取所有公開儲存庫和選取的私人儲存庫中的相依項目。組織中的所有使用者都可以透過 Dependabot 更新存取這些儲存庫的內容。請確認你要與組織中的所有人共用這些儲存庫，或考慮改用私人登錄庫。',
    'Add private repositories': '新增私人儲存庫',
    'Add a private repository': '新增私人儲存庫',
    'Choose which repositories Dependabot can access.': '選擇 Dependabot 可以存取的儲存庫。',
    // 「Choose」+（「additional」）+「repositories Dependabot can access.」：名词放到本段末尾
    'repositories Dependabot can access.': 'Dependabot 可以存取的儲存庫。',
    'Public repositories only': '僅限公開儲存庫',
    'Public and internal repositories only': '僅限公開和內部儲存庫',
    'Grant a team permission to manage security alerts and settings across your organization. This team will also be granted read access to all repositories.':
      '授予團隊管理整個組織安全性警示和設定的權限。此團隊也會獲得所有儲存庫的讀取權限。',
    'Keep scheduled scans running every 30 days for inactive repositories':
      '對不活躍的儲存庫繼續每 30 天執行一次排程掃描',

    // Dependabot 规则（组织专用）
    'Rules will target all public repositories in this organization.': '規則將以此組織中的所有公開儲存庫為目標。',
    'Rule is enabled by default for all public repositories.': '此規則預設對所有公開儲存庫啟用。',
    'Rule is enabled for all public repositories and can never be disabled by individual repositories.':
      '此規則對所有公開儲存庫啟用，個別儲存庫一律無法停用。',
    'Rule can never be enabled on any repositories.': '此規則無法在任何儲存庫上啟用。',

    // 已验证和批准的域（组织资料作「組織資料」；中间的徽章元素译作「已驗證」）
    "You can verify the domains controlled by your organization to confirm your organization's identity on GitHub. A":
      '你可以驗證組織控制的網域，以在 GitHub 上確認組織的身分。如果組織資料上顯示的所有網域（例如公開電子郵件或網站 URL）都已驗證，組織資料頁面上就會加上',
    'You can verify the domains controlled by your organization to confirm your organization’s identity on GitHub. A':
      '你可以驗證組織控制的網域，以在 GitHub 上確認組織的身分。如果組織資料上顯示的所有網域（例如公開電子郵件或網站 URL）都已驗證，組織資料頁面上就會加上',
    "badge will be added to your organization's profile page if all of the domains displayed on your profile (e.g. public email or website URL) are verified. You may also approve a domain by first adding it to the list of eligible domains. Approved domains may be used for email notification routing to users with verified emails that do not belong to a domain that you can verify.":
      '徽章。你也可以先將網域加入符合資格的網域清單，再核准該網域。已核准的網域可用於向電子郵件已驗證、但不屬於你可驗證網域的使用者路由電子郵件通知。',
    'badge will be added to your organization’s profile page if all of the domains displayed on your profile (e.g. public email or website URL) are verified. You may also approve a domain by first adding it to the list of eligible domains. Approved domains may be used for email notification routing to users with verified emails that do not belong to a domain that you can verify.':
      '徽章。你也可以先將網域加入符合資格的網域清單，再核准該網域。已核准的網域可用於向電子郵件已驗證、但不屬於你可驗證網域的使用者路由電子郵件通知。',
    'Learn more about verifying or approving a domain for your enterprise.': '瞭解如何為企業驗證或核准網域。',
    'Learn more about verifying or approving a domain for your organization.': '瞭解如何為組織驗證或核准網域。',
    "Can't verify this domain?": '無法驗證此網域？',
    'Can’t verify this domain?': '無法驗證此網域？',
    'Approve it instead': '改為核准',
    'Restrict email notifications to only approved or verified domains': '僅向已核准或已驗證的網域傳送電子郵件通知',

    // 合规
    'Compliance reports': '合規性報告',
    'ISO/IEC 27001:2022 certification': 'ISO/IEC 27001:2022 認證',
    'ISO/IEC 27001:2013 certification': 'ISO/IEC 27001:2013 認證',
    'Cloud Security Alliance CAIQ self-assessment (CSA CAIQ - Level 1)':
      '雲端安全聯盟 CAIQ 自我評估 (CSA CAIQ - Level 1)',
  },
  scoped: {
    // 身份验证安全
    'Try risk-free for 30 days': '免費試用 30 天',
    'learn more': '瞭解詳情',
    'dismiss this message.': '關閉此訊息。',
    Key: '金鑰',
    'IP allow list': 'IP 允許清單',
    'IP address or range in CIDR notation': '以 CIDR 標記法表示的 IP 位址或範圍',
    'Short description of IP address or range': 'IP 位址或範圍的簡短描述',
    'Check IP address': '檢查 IP 位址',
    'Yes, delete this IP allow list entry': '是，刪除此 IP 允許清單項目',

    // Advanced Security：配置（与存储库设置共用）
    'Security configurations': '安全性設定',
    'GitHub recommended': 'GitHub 建議',
    'Save configuration': '儲存設定',
    Enforce: '強制執行',
    "Don't enforce": '不強制執行',
    'Don’t enforce': '不強制執行',
    'Private and internal': '私人和內部',
    'Not set': '未設定',
    'Security updates': '安全性更新',
    'Dependabot on Actions runners': '動作執行器上的 Dependabot',
    'Dependabot on self-hosted runners': '自架執行器上的 Dependabot',
    Exempt: '豁免',
    'Default setup': '預設設定',
    'Validity checks': '有效性檢查',
    'Non-provider patterns': '非提供者模式',
    'Scan for generic passwords': '掃描通用密碼',
    'Bypass privileges': '繞過權限',

    // 推送保护的绕过执行者（安全配置、规则集共用的绕过列表组件）；原文无逗号，译文不加
    'Push Protection will run and the selected actor(s) will be prompted to bypass':
      '推送保護會執行並向選取的執行者顯示繞過提示',
    'Push Protection will not run and no bypass prompt will be shown': '推送保護不會執行也不會顯示繞過提示',
    'No actors have been selected': '尚未選取執行者',
    'At least one actor is required.': '至少需要一個執行者。',
    'Bypass actors are managed by policy or security configuration': '可繞過的執行者由政策或安全性設定管理',
    'Bypass actors are managed by policy/security configuration.': '可繞過的執行者由政策/安全性設定管理。',
    'Search for bypass actors': '搜尋可繞過的執行者',
    'Adjust your search term to find other bypass actors': '調整搜尋字詞以尋找其他可繞過的執行者',
    'Actor is already added': '此執行者已加入',
    'Failed to fetch suggestions': '無法擷取建議',
    'Failed to update bypass actor.': '無法更新可繞過的執行者。',
    'Choose which roles and teams can bypass this ruleset': '選擇可以繞過此規則集的角色和團隊',

    // Advanced Security：全局设置（与个人、存储库「程式碼安全性」设置共用）
    'Try our new settings': '試用新設定',
    'Security & analysis': '安全性和分析',
    'Security and analysis features help keep your repositories secure and updated.':
      '安全性和分析功能可協助你的儲存庫保持安全和最新。',
    'Disable all': '全部停用',
    'Enable all': '全部啟用',
    // 「全部啟用 / 全部停用」按钮的无障碍标签（与个人设置一致）
    'Enable all private vulnerability reporting': '全部啟用私下回報漏洞',
    'Disable all private vulnerability reporting': '全部停用私下回報漏洞',
    'Enable all dependency graph': '全部啟用相依性圖表',
    'Disable all dependency graph': '全部停用相依性圖表',
    'Enable all Dependabot alerts': '全部啟用 Dependabot 警示',
    'Disable all Dependabot alerts': '全部停用 Dependabot 警示',
    'Enable all Dependabot security updates': '全部啟用 Dependabot 安全性更新',
    'Disable all Dependabot security updates': '全部停用 Dependabot 安全性更新',
    'Enable all grouped security updates': '全部啟用分組安全性更新',
    'Disable all grouped security updates': '全部停用分組安全性更新',
    'Enable all dependabot on actions': '全部啟用動作執行器上的 Dependabot',
    'Disable all dependabot on actions': '全部停用動作執行器上的 Dependabot',
    'Enable all dependabot self-hosted': '全部啟用自架執行器上的 Dependabot',
    'Disable all dependabot self-hosted': '全部停用自架執行器上的 Dependabot',
    'Automatically enable for new public repositories': '為新的公開儲存庫自動啟用',
    'Disable private vulnerability reporting': '停用私下回報漏洞',
    'Enable by default for new public repositories': '為新的公開儲存庫預設啟用',
    'Automatically enable for new private repositories': '為新的私人儲存庫自動啟用',
    'Enable by default for new private repositories': '為新的私人儲存庫預設啟用',
    'Dependabot alerts': 'Dependabot 警示',
    'Automatically enable for new repositories': '為新儲存庫自動啟用',
    'Enable by default for new repositories': '為新儲存庫預設啟用',
    'Dependabot security updates': 'Dependabot 安全性更新',
    'Grouped security updates': '分組安全性更新',
    'Learn how to group updates.': '瞭解如何將更新分組。',
    'learn more here': '在此瞭解詳情',
    'Code scanning': '程式碼掃描',
    // 「Identify vulnerabilities and errors with」+ CodeQL +「. Default CodeQL analysis will be set up on」+「eligible」+「public repositories.」
    'Identify vulnerabilities and errors with': '使用',
    '. Default CodeQL analysis will be set up on': '識別漏洞和錯誤。預設的 CodeQL 分析將設定在',
    eligible: '符合資格的',
    'public repositories.': '公開儲存庫上。',
    'Recommend the extended query suite for repositories enabling default setup':
      '為啟用預設設定的儲存庫建議擴充查詢套件',
    'The extended query includes the default suite, plus lower severity and precision queries.':
      '擴充查詢包含預設套件，以及嚴重性和精確度較低的查詢。',
    'Enable code scanning default setup': '啟用程式碼掃描預設設定',
    'This will turn on CodeQL default setup for all eligible public repositories and repositories with GitHub Advanced Security enabled.':
      '這會為所有符合資格的公開儲存庫，以及已啟用 GitHub 進階安全性的儲存庫開啟 CodeQL 預設設定。',
    'What makes a repository eligible for default setup?': '儲存庫需符合哪些條件才能使用預設設定？',
    'Query suites': '查詢套件',
    // 「Group of queries」+「to run against your code.」（与存储库设置一致，不加逗号）
    'Group of queries': '一組查詢',
    'to run against your code.': '用於對你的程式碼執行。',
    Extended: '擴充',
    'Recommended by your organization. Queries from the default suite, plus lower severity and precision queries.':
      '由你的組織建議。預設套件中的查詢，以及嚴重性和精確度較低的查詢。',
    'Code scanning uses GitHub Actions. Also, repositories where code scanning is already enabled will not be re-enabled.':
      '程式碼掃描使用 GitHub 動作。此外，已啟用程式碼掃描的儲存庫不會重複啟用。',
    'Disable code scanning default setup': '停用程式碼掃描預設設定',
    'This will disable CodeQL default setup on all repositories where it is enabled.':
      '這會在所有已啟用 CodeQL 預設設定的儲存庫上停用此設定。',
    'Secret scanning': '機密掃描',
    'Push protection': '推送保護',
    // 「Block commits that contain」+「supported secrets」：阻挡提交、推送作「阻擋」（封鎖只用于用户）
    'Block commits that contain': '阻擋提交中出現',
    'supported secrets': '支援的機密',
    'Automatically enable for repositories added to secret scanning': '為加入機密掃描的儲存庫自動啟用',
    'Add a resource link in the CLI and web UI when a commit is blocked': '提交遭阻擋時在 CLI 和網頁介面中新增資源連結',
    'Add a resource link in the CLI and the web UI when a commit is blocked':
      '提交遭阻擋時在 CLI 和網頁介面中新增資源連結',
    // 「Link will show in addition to」+「the message GitHub displays」
    'Link will show in addition to': '連結會附加於',
    'the message GitHub displays': 'GitHub 顯示的訊息',
    'Save link': '儲存連結',
    'Save Link': '儲存連結',
    'Enable secret scanning for eligible repositories?': '為符合資格的儲存庫啟用機密掃描？',
    'This will turn on secret scanning for all public repositories.': '這會為所有公開儲存庫開啟機密掃描。',
    'Enable for eligible repositories': '為符合資格的儲存庫啟用',
    'Disable secret scanning?': '停用機密掃描？',
    'This will disable secret scanning on all repositories where it is enabled.':
      '這會在所有已啟用機密掃描的儲存庫上停用此功能。',
    'Disable secret scanning': '停用機密掃描',
    'Enable push protection for eligible repositories?': '為符合資格的儲存庫啟用推送保護？',
    'This will turn on push protection for all repositories that have secret scanning enabled.':
      '這會為所有已啟用機密掃描的儲存庫開啟推送保護。',
    'Push protection coverage': '推送保護涵蓋範圍',
    'Already enabled': '已啟用',
    'Will be enabled': '將啟用',
    'Not eligible': '不符合資格',
    'Disable push protection?': '停用推送保護？',
    'You can still enable push protection at the repository level.': '你仍可在儲存庫層級啟用推送保護。',
    'Disable push protection': '停用推送保護',
    'Enable push protection': '啟用推送保護',
    'This will disable push protection on all repositories where it is enabled.':
      '這會在所有已啟用推送保護的儲存庫上停用此功能。',
    'Learn more about these security privileges': '瞭解這些安全性權限',
    'Search for teams': '搜尋團隊',
    'Edit runner type for Dependabot': '編輯 Dependabot 的執行器類型',
    'Runner label': '執行器標籤',
    'Runner group name': '執行器群組名稱',
    'Pattern configurations': '模式設定',
    'Organization setting': '組織設定',
    'Enterprise setting': '企業設定',
    'New pattern': '新增模式',
    'Save and dry run': '儲存並試執行',
    'Additional settings': '其他設定',

    // Dependabot 存储库访问（组织专用）：显示「Repository access」选择器时，「Select」/「Choose」与后段之间插入的片段，
    // 拼作「選擇 其他 儲存庫」「選擇 其他 Dependabot 可以存取的儲存庫。」
    additional: '其他',

    // Dependabot 规则（与存储库设置共用）
    ...DEPENDABOT_RULES_SCOPED,
    // 以下三条存储库设置由 branches.ts、nav.ts 收录，不放进共用常量
    'New rule': '新增規則',
    '/ New rule': '/ 新增規則',
    Rules: '規則',

    // SAML 单一登录（GitHub Enterprise Cloud 组织）
    Issuer: '簽發者',
    'Signature method': '簽章方法',
    'Digest method': '摘要方法',
    'Require SAML SSO authentication for all members': '要求所有成員透過 SAML SSO 驗證身分',
    'Save SAML settings': '儲存 SAML 設定',

    // IP 允许列表条目
    'Edit IP allow list entry': '編輯 IP 允許清單項目',
    'Delete IP allow list entry': '刪除 IP 允許清單項目',

    // Advanced Security：配置、安全管理员
    Enforcement: '強制執行',
    'Security manager team': '安全性管理員團隊',
    'Add team': '新增團隊',

    // 已验证和批准的域
    'Approve domain': '核准網域',
  },
  regexp: [
    // 句号随原文
    [
      new RegExp(`^Require two-factor authentication for everyone in the ${ORG} organization(\\.?)$`),
      (_, org: string, dot: string) => `要求 ${org} 組織中的所有人啟用雙重驗證${dot ? '。' : ''}`,
    ],
    [
      new RegExp(`^Require SAML SSO authentication for all members of the ${ORG} organization(\\.?)$`),
      (_, org: string, dot: string) => `要求 ${org} 組織的所有成員透過 SAML SSO 驗證身分${dot ? '。' : ''}`,
    ],
    [
      new RegExp(`^You[’']re about to enable private vulnerability reporting on all public repositories in ${ORG}\\.$`),
      '你即將為 $1 中的所有公開儲存庫啟用私下回報漏洞。',
    ],
    [
      new RegExp(
        `^You[’']re about to disable private vulnerability reporting on all public repositories in ${ORG}\\.$`,
      ),
      '你即將為 $1 中的所有公開儲存庫停用私下回報漏洞。',
    ],
    [
      new RegExp(`^You[’']re about to enable dependency graph on all private repositories in ${ORG}\\.$`),
      '你即將為 $1 中的所有私人儲存庫啟用相依性圖表。',
    ],
    [
      new RegExp(
        `^You[’']re about to disable dependency graph on all private repositories in ${ORG}\\. This will also disable Dependabot alerts and Dependabot security updates on those repositories\\.$`,
      ),
      '你即將為 $1 中的所有私人儲存庫停用相依性圖表。這也會停用這些儲存庫的 Dependabot 警示和 Dependabot 安全性更新。',
    ],
    [
      new RegExp(
        `^You[’']re about to enable Dependabot alerts on all repositories in ${ORG}\\. Alerts require the dependency graph, so we[’']ll also turn that on for all repositories\\. No notifications will be sent while Dependabot alerts are being enabled\\.$`,
      ),
      '你即將為 $1 中的所有儲存庫啟用 Dependabot 警示。警示需要相依性圖表，因此我們也會為所有儲存庫開啟相依性圖表。啟用 Dependabot 警示期間不會傳送通知。',
    ],
    [
      new RegExp(
        `^You[’']re about to disable Dependabot alerts on all repositories in ${ORG}\\. This will also disable Dependabot security updates on those repositories\\.$`,
      ),
      '你即將為 $1 中的所有儲存庫停用 Dependabot 警示。這也會停用這些儲存庫的 Dependabot 安全性更新。',
    ],
    [
      new RegExp(
        `^You[’']re about to enable Dependabot security updates on all repositories in ${ORG}\\. Dependabot security updates require the dependency graph and Dependabot alerts, so we[’']ll also turn that on for all repositories\\.$`,
      ),
      '你即將為 $1 中的所有儲存庫啟用 Dependabot 安全性更新。Dependabot 安全性更新需要相依性圖表和 Dependabot 警示，因此我們也會為所有儲存庫開啟這些功能。',
    ],
    [
      new RegExp(`^You[’']re about to disable Dependabot security updates on all repositories in ${ORG}\\.$`),
      '你即將為 $1 中的所有儲存庫停用 Dependabot 安全性更新。',
    ],
    [
      new RegExp(
        `^You[’']re about to enable grouped security updates on all repositories in ${ORG}\\. Grouped security updates require the dependency graph, Dependabot alerts, Dependabot security updates and Dependabot security updates, so we[’']ll also turn that on for all repositories\\.$`,
      ),
      '你即將為 $1 中的所有儲存庫啟用分組安全性更新。分組安全性更新需要相依性圖表、Dependabot 警示和 Dependabot 安全性更新，因此我們也會為所有儲存庫開啟這些功能。',
    ],
    [
      new RegExp(`^You[’']re about to disable grouped security updates on all repositories in ${ORG}\\.$`),
      '你即將為 $1 中的所有儲存庫停用分組安全性更新。',
    ],
    [
      /^This will disable push protection on (\d+) repositor(?:y|ies) where it is enabled\.$/,
      '這會在 $1 個已啟用推送保護的儲存庫上停用此功能。',
    ],
    // Dependabot 规则（与存储库设置共用）；「Managed by <组织>」由合并进来的规则集词典收录
    ...DEPENDABOT_RULES_REGEXP,
    // 推送保护绕过列表标题：「3 actors」（执行者可以是角色、团队或应用程序，量词作「個」）
    [/^(\d+) actors?$/, '$1 個執行者'],
    // 绕过列表每行菜单按钮的读屏名称：「<名称> Bypass actor actions」（与存储库设置共用）
    BYPASS_ACTOR_ACTIONS_RULE,
    [/^Approve ([\w-]+(?:\.[\w-]+)+)$/, '核准 $1'],
  ],
} satisfies PageDictionary
