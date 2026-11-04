import type { PageDictionary } from '../../../core/types'

/** 列表条目的动作（后接 <relative-time>）：警示的 opened 同议题作「建立」，dismiss 作「解除」，fix 作「修正」 */
const LIST_ACTION: Readonly<Record<string, string>> = {
  opened: '建立於',
  fixed: '修正於',
  dismissed: '解除於',
  'auto-dismissed': '自動解除於',
  closed: '關閉於',
  reopened: '重新開啟於'
}

const REACHABILITY: Readonly<Record<string, string>> = {
  Reachable: '可達',
  'Potentially reachable': '可能可達',
  Unreachable: '不可達',
  Unavailable: '無法取得'
}

/**
 * Dependabot 警报：列表（筛选、提示、停用 / 重新整理状态）、详情（React 局部组件）、
 * 解除原因、可达性分析、安全更新。
 * 筛选框自动补全里的取值提示（fix-started, no-bandwidth… / package-name 等）是要输入的筛选值，不翻译。
 * 术语：dismiss（警示）→ 解除，fix → 修正，manifest → 資訊清單，lockfile → 鎖定檔，ecosystem → 生態系，
 * transitive / direct dependency → 間接 / 直接相依項目，reachability → 可達性，reach（动词）→ 觸及，
 * registry → 登錄庫，production → 正式環境，runtime → 執行階段，snooze → 延後，patch → 修補程式。
 */
export default {
  static: {
    // 列表
    'Search all Dependabot alerts': '搜尋所有 Dependabot 警示',
    'Search Dependabot alerts': '搜尋 Dependabot 警示',
    Manifest: '資訊清單',
    'Manifest path': '資訊清單路徑',
    'Most important': '最重要',
    Runtime: '執行階段',
    'Patch available': '有修補程式',
    'Vulnerable function': '有漏洞的函式',
    Reachable: '可達',
    'Potentially reachable': '可能可達',
    '• Detected in': '• 偵測於',
    'Detected in': '偵測於',
    'Alert settings': '警示設定',
    'Manage repository vulnerability settings': '管理儲存庫漏洞設定',
    'Manage account notification settings': '管理帳號通知設定',
    'Manage Dependabot rules': '管理 Dependabot 規則',
    'Dependabot rules': 'Dependabot 規則',
    'Auto-triage rules': '自動分類規則',
    'Refresh Dependabot alerts': '重新整理 Dependabot 警示',
    "Reprocess your project's current dependency files.": '重新處理專案目前的相依性檔案。',
    'Reprocess your project’s current dependency files.': '重新處理專案目前的相依性檔案。',
    'Refresh queued, it may take several minutes to see changes reflected in your alerts.':
      '已排入重新整理佇列，警示可能需要幾分鐘才會反映變更。',
    'Refreshed recently, available again in about 1 hour.': '最近已重新整理，約 1 小時後可再次重新整理。',
    'Welcome to Dependabot alerts!': '歡迎使用 Dependabot 警示！',
    "Dependabot alerts track security vulnerabilities that apply to your repository's dependencies.":
      'Dependabot 警示會追蹤影響儲存庫相依項目的安全性漏洞。',
    'Dependabot alerts track security vulnerabilities that apply to your repository’s dependencies.':
      'Dependabot 警示會追蹤影響儲存庫相依項目的安全性漏洞。',
    "Dependabot alerts track security vulnerabilities that apply to your repository's dependencies. As alerts are created, they’ll appear here.":
      'Dependabot 警示會追蹤影響儲存庫相依項目的安全性漏洞。警示建立後會顯示在這裡。',
    "Dependabot alerts track security vulnerabilities that apply to your repository's dependencies. As alerts are created, they'll appear here.":
      'Dependabot 警示會追蹤影響儲存庫相依項目的安全性漏洞。警示建立後會顯示在這裡。',
    'Dependabot alerts track security vulnerabilities that apply to your repository’s dependencies. As alerts are created, they’ll appear here.':
      'Dependabot 警示會追蹤影響儲存庫相依項目的安全性漏洞。警示建立後會顯示在這裡。',

    // 未启用：To receive …, you must first enable Dependabot alerts in <this repository’s settings>.
    'Dependabot alerts are disabled.': 'Dependabot 警示已停用。',
    'To receive Dependabot alerts, you must first enable Dependabot alerts in':
      '若要接收 Dependabot 警示，必須先啟用 Dependabot 警示，前往',
    'this repository’s settings': '此儲存庫的設定',
    "this repository's settings": '此儲存庫的設定',

    // 自动解除、自动分类横幅
    'Ignore the false alarms': '忽略誤報',
    'To help you focus on the alerts that matter, Dependabot now proactively dismisses low impact alerts. These alerts may only have limited effects (e.g. long-running builds or tests) or are unlikely to be exploitable.':
      '為了協助你專注於重要的警示，Dependabot 現在會主動解除低影響的警示。這些警示可能影響有限（例如建置或測試執行時間較長），或不太可能被利用。',
    'learn more about auto-dismissing alerts.': '瞭解自動解除警示。',
    'Auto-triage your alerts': '自動分類警示',
    'Control how Dependabot opens pull requests, ignores false positives and snoozes alerts. Rules can be enforced at the organization level. Free for open source and available for private repos through':
      '控制 Dependabot 建立拉取請求、忽略誤報和延後警示的方式。規則可在組織層級強制執行。開源專案可免費使用，私人儲存庫則可透過',
    'Learn more about auto-triage': '瞭解自動分類',

    // 搜索与筛选
    'CVE exploitation likelihood. `n`, `>n`, `<n`, `>=n`, `<=n`, or range `n..n`, where `n` is a number from 0.0 to 1.0':
      'CVE 遭利用的可能性。`n`、`>n`、`<n`、`>=n`、`<=n` 或範圍 `n..n`，其中 `n` 為 0.0 到 1.0 之間的數字',
    'Filter by resolution': '依處理結果篩選',
    'Clear resolution': '清除處理結果篩選器',
    'Filter by packages': '依套件篩選',
    'Clear package filter': '清除套件篩選器',
    'Clear ecosystem filter': '清除生態系篩選器',
    'Filter by manifest': '依資訊清單篩選',
    'Clear manifest filter': '清除資訊清單篩選器',
    'Dismiss Alerts': '解除警示',
    'Select a reason to dismiss': '選擇解除原因',
    'Clear current search filters.': '清除目前的搜尋篩選器。',
    // 提示：Add <code>-has:patch</code> to see alerts without an available fix.
    'to see alerts without an available fix.': '以查看沒有可用修正的警示。',
    'to see alerts with calls to vulnerable functions.': '以查看呼叫了有漏洞函式的警示。',
    'See auto-dismissed alerts with': '使用以下條件查看自動解除的警示',
    'Find alerts on your dev dependencies using': '使用以下條件尋找開發相依項目的警示',

    // 解除原因（与 alerts.ts 的小写形式同译）
    'A fix has already been started': '已開始修正',
    'No bandwidth to fix this': '無暇修正',
    'Risk is tolerable to this project': '此專案可容忍此風險',
    'This alert is inaccurate or incorrect': '此警示不準確或有誤',
    'Vulnerable code is not actually used': '未實際使用有漏洞的程式碼',

    // 详情页头部：dismissed by <用户> <时间>
    'dismissed by': '解除者',
    'auto-dismissed by': '自動解除者',
    'to assign Dependabot alerts in this repository.': '以在此儲存庫中指派 Dependabot 警示。',

    // 修正建议与错误
    // The latest possible version that can be installed is <版本> because of the following conflicting dependency:
    'The latest possible version that can be installed is': '可安裝的最新版本為',
    'because of the following conflicting dependency:': '，原因是存在以下相衝突的相依項目：',
    'because of the following conflicting dependencies:': '，原因是存在以下相衝突的相依項目：',
    'The earliest fixed version is': '最早的修正版本為',
    'about troubleshooting Dependabot errors': '關於 Dependabot 錯誤的疑難排解',
    // Transitive dependency <软件包> is introduced via <软件包>
    'is introduced via': '引入自',
    'or later. For example:': '或更新版本。例如：',
    'Update logs': '更新記錄',

    // 安全性更新
    'Create Dependabot security update': '建立 Dependabot 安全性更新',
    'Review security update': '審查安全性更新',
    'Dependabot is creating a security update to fix': 'Dependabot 正在建立安全性更新以修正',
    'Merging this pull request would fix': '合併此拉取請求將修正',
    'Learn more about Dependabot security updates': '瞭解 Dependabot 安全性更新',
    'Transitive dependency': '間接相依項目',
    'Direct dependency': '直接相依項目',
    'Related alerts': '相關警示',

    // 可达性分析：Prioritize this alert with signals like <severity>, <EPSS score>, or <…>.
    'Vulnerability metadata': '漏洞中繼資料',
    'Prioritize this alert with signals like': '依據以下訊號排定此警示的優先順序',
    'whether the code is deployed to production': '程式碼是否已部署到正式環境',
    'Your code reaches the vulnerable function.': '你的程式碼會觸及有漏洞的函式。',
    "Analysis couldn't confirm whether your code reaches the vulnerable function.": '分析無法確認你的程式碼是否會觸及有漏洞的函式。',
    "We couldn't determine reachability because of an error on our side. We're continually improving reachability analysis, so you should see fewer of these errors over time.":
      '我們這邊發生錯誤，因此無法判定可達性。我們持續改進可達性分析，此類錯誤會逐漸減少。',
    "We'll try again tomorrow as long as reachability analysis is enabled for this repository.":
      '只要此儲存庫仍啟用可達性分析，我們明天會再試一次。',
    'Reachability analysis needs a lockfile to know which version of this package is installed. Commit a lockfile to receive reachability results.':
      '可達性分析需要鎖定檔才能得知此套件安裝的是哪個版本。提交鎖定檔以取得可達性結果。',
    "Reachability can't be checked because GitHub hasn't identified which functions contain this vulnerability. When that information is added, this alert will be analyzed automatically.":
      'GitHub 尚未識別出哪些函式含有此漏洞，因此無法檢查可達性。新增該資訊後，將自動分析此警示。',
    "We didn't find a call to the vulnerable function in this manifest's directory, but we found a call in another directory in your repository.":
      '我們在此資訊清單所在的目錄中找不到對有漏洞函式的呼叫，但在儲存庫的另一個目錄中找到了呼叫。',
    "Right now, reachability analysis supports only JavaScript and TypeScript languages, so this alert wasn't analyzed.":
      '目前可達性分析僅支援 JavaScript 和 TypeScript 語言，因此未分析此警示。',
    "Reachability analysis didn't complete, so call paths aren't available.": '可達性分析未完成，因此無法提供呼叫路徑。',
    'About reachability': '關於可達性',
    // … from the public npm registry and from <private registries configured for Dependabot>.
    'Reachability analysis supports dependencies from the public npm registry and from': '可達性分析支援的相依項目來自公開 npm 登錄庫和',
    'private registries configured for Dependabot': '為 Dependabot 設定的私人登錄庫',
    // The <reachability analysis run> for this repository reached its time limit …
    'reachability analysis run': '可達性分析執行',
    'for this repository reached its time limit before it finished checking this alert. Each run reuses the work earlier runs completed, so a later run might finish checking it.':
      '在此儲存庫中尚未檢查完此警示就已達到時間上限。每次執行都會沿用先前執行已完成的工作，因此之後的執行可能會完成檢查。',
    "The reachability analysis run for this repository reached its time limit before it finished checking this alert. Each run reuses the work earlier runs completed, so a later run might finish checking it. We'll try again tomorrow as long as reachability analysis is enabled for this repository.":
      '此儲存庫的可達性分析執行在檢查完此警示前就已達到時間上限。每次執行都會沿用先前執行已完成的工作，因此之後的執行可能會完成檢查。只要此儲存庫仍啟用可達性分析，我們明天會再試一次。',
    // A call that chooses its function at runtime, such as <code>obj[name]()</code>, could reach …
    'A call that chooses its function at runtime, such as': '在執行階段才決定呼叫哪個函式的呼叫，例如',
    ", could reach the vulnerable function. The call is in your code or in one of your dependencies. Analysis reads code without running it, so it can't tell which function the call chooses.":
      '，可能會觸及有漏洞的函式。此呼叫位於你的程式碼或你的某個相依項目中。分析只讀取程式碼而不執行，因此無法判斷此呼叫會選擇哪個函式。',
    ', could reach the vulnerable function. The call is in your code or in one of your dependencies. Analysis reads code without running it, so it can’t tell which function the call chooses.':
      '，可能會觸及有漏洞的函式。此呼叫位於你的程式碼或你的某個相依項目中。分析只讀取程式碼而不執行，因此無法判斷此呼叫會選擇哪個函式。',

    // 导出 CSV 报告
    'Export CSV': '匯出 CSV',
    'Generating your report. Stay on this page to automatically download the report.': '正在產生報告。停留在此頁面將自動下載報告。',
    "Your report is being generated. You will receive an email when it's ready. Stay on this page to automatically download the report.":
      '正在產生報告。完成後你會收到電子郵件。停留在此頁面將自動下載報告。',
    'Your report is being generated. You will receive an email when it’s ready. Stay on this page to automatically download the report.':
      '正在產生報告。完成後你會收到電子郵件。停留在此頁面將自動下載報告。',
    "We couldn't generate your report. Please try again later. If the problem persists, please contact support.":
      '無法產生報告。請稍後再試。如果問題持續發生，請聯絡支援團隊。',
    'We couldn’t generate your report. Please try again later. If the problem persists, please contact support.':
      '無法產生報告。請稍後再試。如果問題持續發生，請聯絡支援團隊。',
    'Your report is ready and the download has started.': '報告已就緒，並已開始下載。',
    'Your report is ready and the download has started. An email with the report has also been sent to you.':
      '報告已就緒，並已開始下載。報告也已透過電子郵件寄給你。',
    'Something went wrong while exporting your data. Please try again later. If the problem persists, please contact support.':
      '匯出資料時發生錯誤。請稍後再試。如果問題持續發生，請聯絡支援團隊。'
  },
  scoped: {
    // 其他区域也出现的同形文字，本区域内单独生效
    'Dependabot security updates': 'Dependabot 安全性更新',
    'Dependabot version updates': 'Dependabot 版本更新',
    On: '位於',
    bot: '機器人',
    severity: '嚴重性',
    'Opt out': '選擇退出',
    // … available for private repos through <GitHub Advanced Security.>
    'GitHub Advanced Security.': 'GitHub 進階安全性使用。',
    // 列表筛选栏的关闭原因下拉按钮（与 Package、Ecosystem、Manifest 并列），作「關閉原因」；选单里的 fixed 作「已修正」
    'Closed as': '關閉原因',
    fixed: '已修正',
    Opened: '建立於',
    // dependabot opened this <时间>
    'opened this': '建立於',
    'View logs': '查看記錄'
  },
  regexp: [
    // 列表条目：#38 opened 3 days ago • Detected in …
    [/^#(\d+) (opened|fixed|dismissed|auto-dismissed|closed|reopened)$/, (_, number, action) => `#${number} ${LIST_ACTION[action]}`],
    // 详情页修正建议
    [/^Upgrade (\S+) to fix (\d+) Dependabot alerts? in (\S+)$/, '升級 $1 以修正 $3 中的 $2 個 Dependabot 警示'],
    [/^Upgrade (\S+) to version (\S+) or later\. For example:$/, '將 $1 升級到 $2 或更新版本。例如：'],
    [/^Dependabot cannot update (\S+) to a non-vulnerable version$/, 'Dependabot 無法將 $1 更新到無漏洞的版本'],
    // 安全性更新进度：Dependabot is creating a security update to fix <3 Dependabot alerts> on …
    [/^([\d,]+) Dependabot alerts?$/, '$1 個 Dependabot 警示'],
    // 侧栏可达性标记的 aria-label（原文无引号）
    [
      /^Filter alerts by (Reachable|Potentially reachable|Unreachable|Unavailable) reachability$/,
      (_, title) => `篩選可達性為${REACHABILITY[title]}的警示`
    ]
  ],
  // 被元素拆开的整句；整句未命中时由 static 的片段兜底
  inline: [
    // 可达性分析：Prioritize this alert with signals like <a>severity</a>, <a>EPSS score</a>, or <a>…</a>.
    ['Prioritize this alert with signals like {}, {}, or {}.', '依據{}、{}或{}等訊號排定此警示的優先順序。']
  ]
} satisfies PageDictionary
