import type { PageDictionary } from '../../../core/types'

/** AI 扫描类型（提示文案里的 {scanName}） */
const SCAN_NAME: Readonly<Record<string, string>> = {
  'standard scan': '標準掃描',
  'deep scan': '深度掃描'
}

/**
 * 代码扫描：列表（筛选、空状态、提示、工具按钮、AI 扫描）、工具状态页、
 * 警报详情（React 局部组件）、受影响分支、开发区、自动修复。
 * 术语：detect → 偵測，fix → 修正（Autofix → 自動修正），agentic autofix → 代理式自動修正，
 * remediation → 修復，AI credits → AI 點數，finding → 發現項目，setup / configuration → 設定，
 * metered billing → 依用量計費，git checkout → 簽出，regex → 規則運算式。
 */
export default {
  static: {
    // 列表与工具状态
    'Automatically detect vulnerabilities in your code.': '自動偵測程式碼中的漏洞。',
    // Configure tools … Learn more about <Code Scanning>（原文 tools 与 to keep 之间没有逗号，译文不加）
    'Configure tools that integrate with Code Scanning to keep the quality of your code under control. Learn more about':
      '設定與程式碼掃描整合的工具以掌控程式碼品質。瞭解',
    'Add tool': '新增工具',
    'Configure scanning tool': '設定掃描工具',
    'Tool status': '工具狀態',
    Tools: '工具',
    'All tools are working as expected': '所有工具都正常運作',
    'Sorry, something went wrong loading this data': '抱歉，載入此資料時發生錯誤',
    'All tools working correctly': '所有工具都正常運作',
    'Loading tools': '正在載入工具',
    'Manage tools': '管理工具',
    'Tools, failed to load tool status': '工具，無法載入工具狀態',
    'Tools, one or more tools failed': '工具，一或多個工具失敗',
    'Tools, one or more tools have warnings': '工具，一或多個工具有警告',
    'Run completed with warnings': '執行完成但有警告',
    'Last run failed': '上次執行失敗',
    'Last run succeeded': '上次執行成功',
    'Last run cancelled': '上次執行已取消',
    'Run in progress': '正在執行',
    'No code scanning alerts here!': '這裡沒有程式碼掃描警示！',
    'Looking good!': '一切正常！',
    'No new code scanning alerts.': '沒有新的程式碼掃描警示。',
    'Keep up the good work!': '繼續保持！',
    'No code scanning alerts found.': '找不到程式碼掃描警示。',
    "We'll keep watching out for new ones.": '我們會持續留意新的警示。',
    'We’ll keep watching out for new ones.': '我們會持續留意新的警示。',
    'Detected by': '偵測工具',
    'CodeQL is reporting errors.': 'CodeQL 回報了錯誤。',
    Rule: '規則',
    'Rule ID': '規則 ID',
    Precision: '精確度',
    'Security severity': '安全性嚴重性',
    Recommendation: '建議',
    Example: '範例',
    'Show paths': '顯示路徑',
    'Generate fix': '產生修正',
    'Generating fix': '正在產生修正',
    'Commit to new branch': '提交到新分支',
    Warning: '警告',

    // 搜索框自动补全的限定词说明（警示状态 open 作「未解決」，ref 作「參考」）
    'filter by open/closed state': '依未解決/已關閉狀態篩選',
    'filter by tool': '依工具篩選',
    'filter by branch name': '依分支名稱篩選',
    'filter by pr number': '依 PR 編號篩選',
    'filter by ref (e.g. branches/tags)': '依參考篩選（例如分支/標記）',
    'filter by rule': '依規則篩選',
    'filter by rule tag': '依規則標記篩選',
    'filter by severity': '依嚴重性篩選',
    'only show alerts in application code': '僅顯示應用程式碼中的警示',
    'filter by closure reason': '依關閉原因篩選',
    'filter by file path (e.g. lib/crypto or *_test.js)': '依檔案路徑篩選（例如 lib/crypto 或 *_test.js）',
    'filter by language': '依語言篩選',
    'filter by assignee': '依負責人篩選',
    'filter by presence of a property': '依具有屬性篩選',
    'filter by absence of a property': '依缺少屬性篩選',
    'Filter by tool': '依工具篩選',
    'Filter by branch': '依分支篩選',
    'Filter by rule': '依規則篩選',
    'Filter rules': '篩選規則',

    // 列表底部提示
    'You can run CodeQL locally from the command line.': '你可以從命令列在本機執行 CodeQL。',
    'You can run CodeQL locally using Visual Studio Code.': '你可以使用 Visual Studio Code 在本機執行 CodeQL。',
    // CodeQL queries are developed by an open-source coalition called the <GitHub Security Lab>.
    'CodeQL queries are developed by an open-source coalition called the': 'CodeQL 查詢的開發者是開源聯盟',
    // 团队名由英文普通词构成，按产品名规则译出
    'GitHub Security Lab': 'GitHub 安全實驗室',
    'The libraries and queries that power CodeQL are open-source.': '驅動 CodeQL 的程式庫和查詢都是開源的。',
    'You can upload code scanning analyses from other third-party tools using GitHub Actions.':
      '你可以使用 GitHub 動作上傳其他第三方工具的程式碼掃描分析。',
    'You can configure CodeQL to run with additional queries.': '你可以設定 CodeQL 執行其他查詢。',

    // 工具状态页
    'Scanned files': '已掃描的檔案',
    'Download language CSV report': '下載語言 CSV 報告',
    'Setup types': '設定類型',
    'Setup type': '設定類型',
    '· Last scan': '· 上次掃描',
    'View setup type': '查看設定類型',
    'This setup is working as expected.': '此設定運作正常。',
    'This configuration is working as expected.': '此設定運作正常。',
    'First scan': '首次掃描',
    'Push to': '推送到',
    'Pull request to': '拉取請求到',
    'Download list of rules used': '下載使用的規則清單',
    'Tool version': '工具版本',

    // AI 扫描
    'AI scan': 'AI 掃描',
    'Deep AI Scan': '深度 AI 掃描',
    'AI scan options': 'AI 掃描選項',
    'AI scan type': 'AI 掃描類型',
    'Manage AI scan settings': '管理 AI 掃描設定',
    'AI scan, one or more scans failed': 'AI 掃描，一或多項掃描失敗',
    'AI scan, one or more scans cancelled': 'AI 掃描，一或多項掃描已取消',
    'AI scan in progress': 'AI 掃描進行中',
    'Deep scan': '深度掃描',
    'Cancelling Deep scan': '正在取消深度掃描',
    'Cancelling deep scan': '正在取消深度掃描',
    'Deep scan in progress · Click to stop': '深度掃描進行中 · 按一下以停止',
    'Stopping deep scan': '正在停止深度掃描',
    'Deep scan in progress': '深度掃描進行中',
    'Deep scan is running': '深度掃描正在執行',
    'Start deep scan': '開始深度掃描',
    'Starting deep scan': '正在啟動深度掃描',
    'Cancel deep scan': '取消深度掃描',
    'How deep scans work': '深度掃描的運作方式',
    'about deep scans': '深度掃描相關資訊',
    'Deep scans can consume significant time, compute resources, and AI credits. Results appear only after completing a deep scan.':
      '深度掃描可能耗用大量時間、運算資源和 AI 點數。結果只會在深度掃描完成後顯示。',
    'Canceling will lose any progress made so far.': '取消會遺失目前為止的所有進度。',
    'Continue scan': '繼續掃描',
    'Cancel scan': '取消掃描',
    // Advanced AI security scan on <分支>. Powered by MDASH. Scans may take over an hour …
    'Advanced AI security scan on': '在以下分支上執行進階 AI 安全性掃描',
    '. Scans can consume a large number of AI credits. Powered by MDASH.': '。掃描可能耗用大量 AI 點數。由 MDASH 提供支援。',
    '. Scans may take over an hour and consume a large number of AI credits. Powered by MDASH.':
      '。掃描可能耗時超過一小時並耗用大量 AI 點數。由 MDASH 提供支援。',
    '. Powered by MDASH. Scans may take over an hour and consume a large number of AI credits.':
      '。由 MDASH 提供支援。掃描可能耗時超過一小時並耗用大量 AI 點數。',
    // Full-repo AI-powered security scan on <分支>. Available for any programming language.
    'Full-repo AI-powered security scan on': '在以下分支上執行由 AI 驅動的全儲存庫安全性掃描',
    'Standard scan': '標準掃描',
    'Standard scan in progress': '標準掃描進行中',
    'Start standard scan': '開始標準掃描',
    'Standard scan completed': '標準掃描已完成',
    'Standard scan failed': '標準掃描失敗',
    'Standard scan cancelled': '標準掃描已取消',
    '. Available for any programming language.': '。適用於任何程式語言。',
    'Enable Actions for this repository to run standard scans.': '為此儲存庫啟用動作以執行標準掃描。',
    'Enable Actions for this repository to run deep scans.': '為此儲存庫啟用動作以執行深度掃描。',
    // There are no AI credits … See <GitHub Advanced Security license billing> for more information …
    // 原文 because … or because … 之间没有逗号，译文不加
    'There are no AI credits available to start an AI scan. This may be because the budget has been exceeded or because metered billing has not been set up by the repository owner. See':
      '沒有可用的 AI 點數來啟動 AI 掃描。可能是已超出預算或儲存庫擁有者尚未設定依用量計費。請參閱',
    'for more information about how AI-powered scans are billed.': '以瞭解 AI 掃描的計費方式。',
    // 后接「Copilot 設定」等链接；引号里的设定项 Usage billed to 是选择计费帐号的下拉选单，作「使用量計費帳號」
    'Before you can start an AI scan, you need to pick a "Usage billed to" option in your':
      '啟動 AI 掃描前，必須在以下設定中選擇「使用量計費帳號」',
    'Scan progress': '掃描進度',
    'Scan in progress': '掃描進行中',
    'Scan is running': '掃描正在執行',
    'Starting scan': '正在啟動掃描',
    'Start scan': '開始掃描',
    Scanning: '掃描中',
    'Failed to stop scan': '無法停止掃描',
    'You don’t have permission to run this scan': '你沒有執行此掃描的權限',
    "You don't have permission to run this scan": '你沒有執行此掃描的權限',
    'Analyzing code': '正在分析程式碼',
    'Scanning functions': '正在掃描函式',
    'Validating findings': '正在驗證發現項目',
    'Preparing results': '正在準備結果',
    'Preparing scan': '正在準備掃描',
    'Preparing source code': '正在準備原始碼',
    'Scanning code': '正在掃描程式碼',
    'Processing results': '正在處理結果',
    'Pending cancellation': '等待取消',
    Interrupted: '已中斷',
    'Not started': '尚未開始',
    'Scan failed to start': '掃描無法啟動',
    'Last scan completed': '上次掃描已完成',
    'Last scan failed to complete': '上次掃描未能完成',
    'Last scan was cancelled': '上次掃描已取消',
    'See job': '查看作業',
    'View job': '查看作業',
    'View results': '查看結果',
    'Started:': '開始時間：',
    'Last run:': '上次執行：',
    ', completed:': '，完成時間：',
    ', cancelled:': '，取消時間：',
    'Actions disabled': '動作已停用',
    'Budget exceeded': '已超出預算',
    'Customer selection required': '需要選擇計費帳號',
    'Scan failed to start, budget exceeded': '掃描無法啟動，已超出預算',
    'Scan failed to start, enable Actions': '掃描無法啟動，請啟用動作',
    'Scan failed to start, customer selection required': '掃描無法啟動，需要選擇計費帳號',

    // 警示详情头部与侧栏
    '← Code scanning alerts': '← 程式碼掃描警示',
    'In pull request': '位於拉取請求',
    'On branch': '位於分支',
    'First detected in commit': '首次偵測於提交',
    'Appeared in branch': '出現於分支',
    'Affected branches': '受影響的分支',
    'branches (not shown)': '個分支（未顯示）',
    'First detected': '首次偵測於',
    'No configurations analyzing': '沒有正在分析的設定',
    // … If this was done by mistake, learn how to fix it by <rerunning a code scan analysis …>.
    'All configurations for the default branch have been deleted. If this was done by mistake, learn how to fix it by':
      '預設分支的所有設定都已刪除。如果是誤刪，可以透過',
    'rerunning a code scan analysis to restore all alerts': '重新執行程式碼掃描分析來還原所有警示',
    'Failed to load branches': '無法載入分支',
    'Only in Pull Request': '僅在拉取請求中',
    'Configurations analyzing': '正在分析的設定',
    'Deleting a configuration': '刪除設定',
    'may have an impact on the status of other alerts on the same branch.': '可能會影響同一分支上其他警示的狀態。',
    'All configurations deleted': '已刪除所有設定',
    // close as fixed 作「關閉並標示為已修正」
    'Deleting all configurations will close this alert as fixed.': '刪除所有設定會將此警示關閉並標示為已修正。',
    'The following configurations have reported this alert.': '以下設定回報了此警示。',
    'API upload': 'API 上傳',
    'Delete configuration': '刪除設定',

    // 自动修正
    // Speed up the remediation of this alert with <agentic autofix | Copilot Autofix for CodeQL>
    'Speed up the remediation of this alert with': '使用以下功能加快此警示的修復',
    'Speed up the remediation of this alert with agentic autofix': '使用代理式自動修正加快此警示的修復',
    'Copilot Autofix for CodeQL': '適用於 CodeQL 的 Copilot 自動修正',
    'Agentic fixes use AI credits.': '代理式修正會耗用 AI 點數。',
    'Learn more about AI credit usage': '瞭解 AI 點數使用量',
    'Agentic autofix': '代理式自動修正',
    // <Copilot> is creating a pull request…（拉取请求的 open / create 作「建立」）
    'is creating a pull request…': '正在建立拉取請求…',
    'is creating a pull request...': '正在建立拉取請求...',
    'created a pull request': '建立了拉取請求',
    'Failed to create pull request.': '無法建立拉取請求。',
    'Successfully assigned to Copilot to generate fixes for the selected alerts. Copilot will open a pull request.':
      '已指派給 Copilot 為選取的警示產生修正。Copilot 將建立拉取請求。',
    'Copilot is already assigned': '已指派 Copilot',
    'You have reached your monthly limit for AI credits. Enable additional credits to get more usage.':
      '你已達到本月的 AI 點數上限。啟用額外點數以取得更多使用量。',
    // 收费方式作「計費」
    'GitHub Advanced Security license billing': 'GitHub 進階安全性授權計費',
    'AI usage, like scanning and fixing, is blocked by your organization.': '你的組織已禁止掃描、修正等 AI 用途。',
    'There are no AI credits available to start an agentic autofix. This may be because the budget has been exceeded or because metered billing has not been set up by the repository owner. See':
      '沒有可用的 AI 點數來啟動代理式自動修正。可能是已超出預算或儲存庫擁有者尚未設定依用量計費。請參閱',
    'for more information about how agentic autofix is billed.': '以瞭解代理式自動修正的計費方式。',
    'Before you can use agentic autofix, you need to pick a "Usage billed to" option in your Copilot settings.':
      '使用代理式自動修正前，必須在 Copilot 設定中選擇「使用量計費帳號」。',
    // 原文 encountered an error and was unable 之间没有逗号，译文不加
    'Agentic autofix encountered an error and was unable to start working on the alert. This may be caused by a repository ruleset violation. See':
      '代理式自動修正發生錯誤而無法開始處理此警示。可能是違反了儲存庫規則集。請參閱',
    'granting bypass permissions for the agent': '為代理授予繞過權限',
    'Manage rulesets': '管理規則集',
    'Agentic autofix encountered an error and was unable to start working on the alert. You have exceeded the maximum number of queued jobs. Please try again later.':
      '代理式自動修正發生錯誤而無法開始處理此警示。已排入佇列的作業已超過上限。請稍後再試。',
    'Agentic autofix could not be started because you do not have access to Copilot.':
      '因你沒有 Copilot 的存取權而無法啟動代理式自動修正。',
    'Agentic autofix could not be started because Copilot cloud agent is not enabled for you or this repository. See':
      '因你或此儲存庫未啟用 Copilot 雲端代理而無法啟動代理式自動修正。請參閱',
    'Copilot cloud agent access management': 'Copilot 雲端代理存取權管理',

    // 分支：在 GitHub 桌面版中开启 / 本机签出（与 issues/metadata.ts 的同名词条同译）
    'Opening branch in GitHub Desktop...': '正在 GitHub 桌面版中開啟分支...',
    // If nothing happens, make sure <GitHub Desktop> is installed and set up properly, then <try again>.
    // 整句见 inline，这里是整句未命中时的片段
    'If nothing happens, make sure': '如果沒有反應，請確認',
    'is installed and set up properly, then': '已正確安裝並設定，然後',
    'Run the following commands in your local clone.': '在本機複製的儲存庫中執行以下命令。',
    'Checkout in your local repository': '在本機儲存庫中簽出',
    'Closed and fixed alerts will not be included in this branch': '已關閉和已修正的警示不會包含在此分支中',
    'This commit will be co-authored by Copilot Autofix': '此提交的共同作者將是 Copilot 自動修正',
    'Checkout locally': '在本機簽出',
    'Open branch with GitHub Desktop': '使用 GitHub 桌面版開啟分支',
    'Commit Copilot Autofix to a new branch': '將 Copilot 自動修正提交到新分支',
    'create a new branch': '建立新分支',

    // 开发区：Link a branch, pull request, or <create a new branch> to start working on this alert.
    'Link a branch, pull request, or': '連結分支、拉取請求，或',
    'to start working on this alert.': '以開始處理此警示。',
    'to start working this alert.': '以開始處理此警示。',
    'or link a branch or pull request to address this alert.': '或連結分支或拉取請求來處理此警示。',
    'No linked branches or pull requests.': '沒有已連結的分支或拉取請求。',
    'Link a branch or pull request': '連結分支或拉取請求',
    'Group selected': '已選取群組',
    'Pull request and branch search results': '拉取請求和分支搜尋結果',
    'Unable to complete the search for pull requests and branches. Try a moment later.': '無法完成拉取請求和分支的搜尋。請稍後再試。',
    'Invalid item type': '無效的項目類型'
  },
  scoped: {
    // 其他区域也出现的同形文字，本区域内单独生效
    'Code Scanning': '程式碼掃描',
    // 严重性等级 Note 作「附註」
    Note: '附註',
    Test: '測試',
    default: '預設',
    'at least': '至少',
    'View less': '顯示較少',
    'Create a new branch': '建立新分支',
    'Something went wrong, please try again.': '發生錯誤，請再試一次。',
    'Check the': '查看',
    'sort by': '排序依據',
    Tool: '工具',
    'View source': '查看原始碼',
    // 数据流路径：Source → Sink（sink 取图论的「匯點」）
    Source: '來源',
    Sink: '匯點',
    'Default setup': '預設設定',
    Configuration: '設定',
    Configurations: '設定',
    'last scan': '上次掃描',
    // #12 opened <时间> merges into <分支>；整句见 inline，这里是整句未命中时的片段
    'merges into': '將合併到',
    See: '請參閱',
    Complete: '已完成',
    Failed: '失敗',
    'In progress': '進行中',
    Cancelling: '取消中',
    'Manage settings': '管理設定',
    'Branch name': '分支名稱',
    'Commit message': '提交訊息',
    'Extended description': '詳細描述',
    "What's next?": '接下來要做什麼？',
    'What’s next?': '接下來要做什麼？',
    'Sorry, something went wrong': '抱歉，發生錯誤',
    'try again': '再試一次',
    Issue: '議題',
    // 「在 GitHub 桌面版中開啟」对话框里的链接文字；产品名按用户规定译出
    'GitHub Desktop': 'GitHub 桌面版'
  },
  regexp: [
    // 受影响分支的修正位置：Fixed <时间> via pull request #12
    [/^via pull request #(\d+)$/, '透過拉取請求 #$1'],
    [/^via commit ([0-9a-f]{7,40})$/, '透過提交 $1'],
    [/^Merging pull request #(\d+) may fix the alert in this branch\.$/, '合併拉取請求 #$1 可能會修正此分支中的警示。'],
    // 未显示的分支数：+ at least 12 branches (not shown) / + more branches (not shown)
    [
      /^\+ (at least )?([\d,]+|more) branches \(not shown\)$/,
      (_, atLeast: string | undefined, count: string) =>
        count === 'more' ? '+ 更多分支（未顯示）' : `+ ${atLeast ? '至少 ' : ''}${count} 個分支（未顯示）`
    ],
    // 开发区的拉取请求条目
    [/^#(\d+) was closed$/, '#$1 已關閉'],
    [/^#(\d+) was merged into$/, '#$1 已合併到'],
    // 自动修正
    [/^Commit autofix(?:es)? to (new )?branch$/, (_, isNew: string | undefined) => `將自動修正提交到${isNew ? '新' : ''}分支`],
    [/^Copilot failed to create a pull request\. (.+)\.$/, 'Copilot 無法建立拉取請求。$1。'],
    // 代理式自动修正横幅：Failed to create pull request: <错误信息>.
    [/^Failed to create pull request: (.+)\.$/, '無法建立拉取請求：$1。'],
    // AI 扫描不可用的说明（{scanName} = standard scan / deep scan）
    [
      /^There are no AI credits available to start an? (standard scan|deep scan)\. This may be because the budget has been exceeded or because metered billing has not been set up by the repository owner\.$/,
      (_, scan: string) => `沒有可用的 AI 點數來啟動${SCAN_NAME[scan]}。可能是已超出預算或儲存庫擁有者尚未設定依用量計費。`
    ],
    [
      /^Before you can start an? (standard scan|deep scan), you need to pick a "Usage billed to" option in your$/,
      (_, scan: string) => `啟動${SCAN_NAME[scan]}前，必須在以下設定中選擇「使用量計費帳號」`
    ],
    // AI 深度扫描进度
    [/^([\d,]+) of ([\d,]+) functions scanned$/, '已掃描 $1/$2 個函式'],
    [/^([\d,]+) of ([\d,]+) findings validated$/, '已驗證 $1/$2 個發現項目'],
    [/^Scan started by ([\w-]+(?:\[bot\])?)$/, '由 $1 啟動掃描'],
    // 工具状态页：12/30 files scanned
    [/^([\d,]+)\/([\d,]+) files? scanned$/, '已掃描 $1/$2 個檔案'],
    // 代码路径：3 steps in src/index.js、Step 2
    [/^([\d,]+) steps? in (\S+)$/, '$2 中的 $1 個步驟'],
    [/^Step (\d+)$/, '步驟 $1']
  ],
  // 被元素拆开的整句（结构见 code-scanning-shared、code-scanning-development-section 组件源码）
  inline: [
    // 开发区的拉取请求条目：#12 opened <relative-time> merges into <span>main</span>；拉取请求的 open 作「建立」，
    // merges into 指目标分支，作「並將合併到」；原文没有标点，译文不加；时间后接中文不加空格
    [/^#(\d+) opened \{\} merges into \{\}$/, '#$1 建立於 {}並將合併到 {}'],
    // #12 was closed <relative-time>：时间后面没有文本节点，文字只能放在槽位前；没有时间时由 regexp 译成「#12 已關閉」
    [/^#(\d+) was closed \{\}$/, '#$1 關閉於 {}'],
    // 受影响分支的修正位置：Fixed <relative-time> via pull request #12 / via commit <sha>；单独的 Fixed 是状态徽章，不改
    [/^Fixed \{\} via pull request #(\d+)$/, '於 {}透過拉取請求 #$1 修正'],
    [/^Fixed \{\} via commit ([0-9a-f]{7,40})$/, '於 {}透過提交 $1 修正'],
    ['Fixed {}', '修正於 {}'],
    // 在 GitHub 桌面版中开启分支：… make sure <a>GitHub Desktop</a> is installed …, then <a>try again</a>.
    ['If nothing happens, make sure {} is installed and set up properly, then {}.', '如果沒有反應，請確認 {}已正確安裝並設定，然後{}。']
  ]
} satisfies PageDictionary
