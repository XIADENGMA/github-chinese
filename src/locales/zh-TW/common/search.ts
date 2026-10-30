import type { PageDictionary } from '../../../core/types'
import { joinCjk } from '../helpers'

/**
 * 快速搜索建议中的“探索”页面标题（未登录时显示）。
 * 产品名按用户要求译成中文（GitHub Actions → GitHub 動作、Codespaces → 程式碼空間）；
 * 品牌词 Copilot、技术缩写 CI/CD、MCP 与专名 The ReadME Project 保留；Enterprise、Team 是产品页导航名，同全局 static
 */
const EXPLORE_TITLES: Readonly<Record<string, string>> = {
  'GitHub Actions': 'GitHub 動作',
  Blog: '部落格',
  'CI/CD': 'CI/CD',
  'Code review': '程式碼審查',
  Codespaces: '程式碼空間',
  'Community Discussions': '社群討論',
  Copilot: 'Copilot',
  'Customer stories': '客戶案例',
  Discussions: '討論',
  Documentation: '說明文件',
  Enterprise: '企業',
  Features: '功能',
  'GitHub Security': 'GitHub 安全性',
  'GitHub Sponsors': 'GitHub 贊助',
  'GitHub Pages': 'GitHub 頁面',
  Integrations: '整合',
  Issues: '議題',
  'GitHub Mobile': 'GitHub 行動版',
  'GitHub Packages': 'GitHub 套件',
  MCP: 'MCP',
  'Open Source': '開源',
  'Open Source Accelerator': '開源加速器',
  Pricing: '定價',
  Resources: '資源',
  'Secure your code': '保護你的程式碼',
  'Security features': '安全性功能',
  'Software supply chain': '軟體供應鏈',
  Solutions: '解決方案',
  Security: '安全性',
  Startups: '新創公司',
  Team: '團隊',
  'The ReadME Project': 'The ReadME Project',
  'The ReadME Podcast': 'The ReadME Podcast',
  Trending: '熱門',
  'Feature Previews': '功能預覽',
  'Code Search': '程式碼搜尋',
  'GitHub Changelog': 'GitHub 變更記錄',
  'GitHub Shop': 'GitHub 商店',
  'GitHub Desktop': 'GitHub 桌面版',
  'Why GitHub': '為什麼選擇 GitHub',
}

const EXPLORE_TITLE_SOURCE = Object.keys(EXPLORE_TITLES)
  .map((title) => title.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&'))
  .join('|')

/** “探索”加标题译文：译文以拉丁字母或数字开头时中间加空格 */
function exploreLabel(title: string): string {
  return joinCjk('探索', EXPLORE_TITLES[title] ?? title)
}

const SEARCH_SCOPE: Readonly<Record<string, string>> = {
  Organization: '組織',
  Enterprise: '企業',
  Owner: '擁有者',
}

const SUGGESTION_KIND: Readonly<Record<string, string>> = {
  organization: '組織',
  repository: '儲存庫',
  owner: '擁有者',
  language: '語言',
}

/** 全局搜索（快速搜索、已保存的搜索、反馈）与命令面板 */
export default {
  static: {
    // 快速搜索对话框
    'Quick search': '快速搜尋',
    'Clear search': '清除搜尋',
    'Search suggestions': '搜尋建議',
    'Search syntax tips': '搜尋語法提示',
    'Provide feedback': '提供意見回饋',
    'Jump to': '跳至',
    Recent: '最近',
    Owners: '擁有者',
    Saved: '已儲存',
    Languages: '語言',
    'Saved queries': '已儲存的查詢',
    'Search all of GitHub': '搜尋整個 GitHub',
    'All of GitHub': '整個 GitHub',
    'Search in this directory': '在此目錄中搜尋',
    'Search in this repository': '在此儲存庫中搜尋',
    'Search in this organization': '在此組織中搜尋',
    'Search in this enterprise': '在此企業中搜尋',
    'Search in this owner': '在此擁有者中搜尋',
    'Open Copilot chat': '開啟 Copilot 聊天',
    'Start a new Copilot thread': '開始新的 Copilot 對話',
    Autocomplete: '自動完成',
    'Manage saved searches': '管理已儲存的搜尋',
    'Manage saved searches, Action': '管理已儲存的搜尋，動作',
    'Community Discussions': '社群討論',
    'GitHub Security': 'GitHub 安全性',
    'Open Source Accelerator': '開源加速器',
    'Secure your code': '保護你的程式碼',
    'Security features': '安全性功能',
    'Software supply chain': '軟體供應鏈',
    'Feature Previews': '功能預覽',
    'Code Search': '程式碼搜尋',
    'GitHub Changelog': 'GitHub 變更記錄',
    'GitHub Shop': 'GitHub 商店',
    // 旧版搜索框
    'Search code, repositories, users, issues, pull requests...': '搜尋程式碼、儲存庫、使用者、議題、拉取請求...',
    'Search code, repositories, users, issues, pull requests…': '搜尋程式碼、儲存庫、使用者、議題、拉取請求…',

    // 反馈对话框
    'We read every piece of feedback, and take your input very seriously.':
      '我們會閱讀每一則意見回饋，並認真看待你的意見。',
    Feedback: '意見回饋',
    'Include my email address so I can be contacted': '附上我的電子郵件地址以便聯絡我',
    'Send feedback': '傳送意見回饋',
    'Sending feedback': '正在傳送意見回饋',
    'Submit feedback': '送出意見回饋',
    'Could not submit your feedback. Please try again.': '無法送出你的意見回饋。請再試一次。',
    'Could not submit your feedback. Please check your connection and try again.':
      '無法送出你的意見回饋。請檢查網路連線後再試一次。',

    // 已保存的搜索对话框（数量上限提示由正则整体匹配）
    'Saved searches': '已儲存的搜尋',
    'Update saved search': '更新已儲存的搜尋',
    'Create saved search': '建立已儲存的搜尋',
    'Use saved searches to filter your results more quickly': '使用已儲存的搜尋更快篩選結果',
    'Could not load your saved searches.': '無法載入你已儲存的搜尋。',
    'Could not load saved searches.': '無法載入已儲存的搜尋。',
    Query: '查詢',
    // “To see all available qualifiers, see our” + 链接 “documentation” + “.”
    'To see all available qualifiers, see our': '若要查看所有可用的限定詞，請參閱我們的',
    documentation: '說明文件',
    "You don't have any saved searches yet.": '你還沒有已儲存的搜尋。',
    'Saving saved search': '正在儲存搜尋',
    'Could not save your search. Please check the name and query and try again.':
      '無法儲存你的搜尋。請檢查名稱和查詢後再試一次。',
    'Could not save your search. Please check your connection and try again.':
      '無法儲存你的搜尋。請檢查網路連線後再試一次。',
    'Could not delete this saved search. Please try again.': '無法刪除此已儲存的搜尋。請再試一次。',
    'Could not delete this saved search. Please check your connection and try again.':
      '無法刪除此已儲存的搜尋。請檢查網路連線後再試一次。',

    // 命令面板
    'Search GitHub': '搜尋 GitHub',
    'Clear command palette': '清除命令面板',
    'Current scope:': '目前範圍：',
    'Tip:': '提示：',
    'for help and tips': '查看說明和提示',
    'Type ? for help and tips': '按 ? 查看說明和提示',
    'Top result': '最佳結果',
    Commands: '命令',
    'Global commands': '全域命令',
    'This page': '此頁面',
    'Access policies': '存取政策',
    'Issues and pull requests': '議題和拉取請求',
    Teams: '團隊',
    Users: '使用者',
    'Projects (classic)': '專案（傳統）',
    Files: '檔案',
    Modes: '模式',
    'Use filters in issues and pull requests': '在議題和拉取請求中使用篩選器',
    'Loading results...': '正在載入結果...',
    'Loading results…': '正在載入結果…',
    "Some results couldn't be loaded.": '部分結果無法載入。',
    "Results couldn't be loaded.": '無法載入結果。',
    'No results found.': '找不到結果。',
    'Some results may require single-sign on.': '部分結果可能需要單一登入。',
    'Press Backspace at the start of the input to remove a scope.': '在輸入內容開頭按 Backspace 可移除範圍。',
    'Could not open that page. Please try again.': '無法開啟該頁面。請再試一次。',
    'Search issues and pull requests': '搜尋議題和拉取請求',
    // @ 模式的输入框占位文字（服务端下发）：所有者范围、全局
    'Search or jump to a repository': '搜尋或跳至儲存庫',
    'Search or jump to a user, organization, or repository': '搜尋或跳至使用者、組織或儲存庫',
    'Search prefix:': '搜尋前置字元：',
    'to jump to': '跳至',
    'to accept a scope or suggestion; otherwise, move focus.': '接受範圍或建議；否則移動焦點。',
    'to move to dialog controls.': '移至對話方塊控制項。',
    'to close.': '關閉。',
    'at the start of the input, with no text selected, removes one scope.':
      '在輸入內容開頭且未選取文字時，移除一個範圍。',
    // 命令面板帮助
    'Search for': '搜尋',
    'Search for issues and pull requests': '搜尋議題和拉取請求',
    'issues and pull requests': '議題和拉取請求',
    'Search for organizations, repositories, and users': '搜尋組織、儲存庫和使用者',
    'organizations, repositories, and users': '組織、儲存庫和使用者',
    repositories: '儲存庫',
    'Search for files': '搜尋檔案',
    files: '檔案',
    'Search your issues and pull requests': '搜尋你的議題和拉取請求',
    'Filter to pull requests': '僅篩選拉取請求',
    'Filter to issues': '僅篩選議題',
    'Filter to open issues and pull requests': '僅篩選開放中的議題和拉取請求',
    // 命令面板提示（Tip:）：带前缀时是 Type <kbd>前缀</kbd> + 片段，引擎整句匹配；片段兜底
    'Type author:@me to search your issues and pull requests': '輸入 author:@me 搜尋你的議題和拉取請求',
    'Add : and a line number to jump to a specific line': '加上 : 和行號以跳至特定行',
    'Press Tab on a repository to search within it': '在儲存庫上按 Tab 可在其中搜尋',
    'Press Tab on an account or repository to search within it': '在帳號或儲存庫上按 Tab 可在其中搜尋',
    'Type / to search files': '按 / 搜尋檔案',
    'Type @ to search repositories': '按 @ 搜尋儲存庫',
    'Type @ to search organizations, repositories, and users': '按 @ 搜尋組織、儲存庫和使用者',
    'Type # to search issues and pull requests': '按 # 搜尋議題和拉取請求',
    'to search files': '搜尋檔案',
    'to search repositories': '搜尋儲存庫',
    'to search organizations, repositories, and users': '搜尋組織、儲存庫和使用者',
    'to search issues and pull requests': '搜尋議題和拉取請求',
    'Go to your accessibility settings to change your keyboard shortcuts': '前往無障礙設定變更鍵盤快速鍵',
    // 命令面板结果图标说明（议题、拉取请求状态由对应页面词典负责）
    'Private repository': '私人儲存庫',
    'Public repository': '公開儲存庫',
    // 命令面板页面目录
    'Issues: assigned to you': '議題：指派給你的',
    'Issues: mentioning you': '議題：提及你的',
    'Pull requests: assigned to you': '拉取請求：指派給你的',
    'Pull requests: mentioning you': '拉取請求：提及你的',
    'Pull requests: requesting your review': '拉取請求：請求你審查的',
    'Settings > Appearance': '設定 > 外觀',
    'Settings > Accessibility': '設定 > 無障礙',
    'Settings > Password and authentication': '設定 > 密碼和身分驗證',
    'Settings > Account security': '設定 > 帳號安全性',
    'Settings > Sessions': '設定 > 工作階段',
    'Settings > Notifications': '設定 > 通知',
    'Settings > Emails': '設定 > 電子郵件',
    'Settings > SSH and GPG keys': '設定 > SSH 和 GPG 金鑰',
    'Settings > Repositories': '設定 > 儲存庫',
    'Settings > Packages': '設定 > 套件',
    'Settings > Saved replies': '設定 > 已儲存的回覆',
    'Settings > Applications': '設定 > 應用程式',
    'Settings > Security log': '設定 > 安全性記錄',
    'Settings > Developer settings > GitHub Apps': '設定 > 開發人員設定 > GitHub 應用程式',
    'Settings > Developer settings > OAuth Apps': '設定 > 開發人員設定 > OAuth 應用程式',
    'Settings > Developer settings > Personal access tokens': '設定 > 開發人員設定 > 個人存取權杖',
    'Settings > Developer settings > Personal access tokens > Fine-grained tokens':
      '設定 > 開發人員設定 > 個人存取權杖 > 精細權杖',
    'Settings > Developer settings > Personal access tokens > Tokens (classic)':
      '設定 > 開發人員設定 > 個人存取權杖 > 權杖（傳統）',

    // 旧版命令面板（开启功能预览后出现）。服务端下发的原文含讨论、项目，新版面板改写为上面只含议题和拉取请求的写法
    'Clear Command Palette': '清除命令面板',
    'Search issues, pull requests, discussions, and projects': '搜尋議題、拉取請求、討論和專案',
    'Issues, pull requests, and discussions': '議題、拉取請求和討論',
    'Run a command': '執行命令',
    'Global Commands': '全域命令',
    'Type > to filter': '按 > 篩選',
    // 报错条（服务端模板 <command-palette-tip data-on-error>）：两句同一文本节点，整句收录；
    // 原文 We’ve 是弯撇号、aren't 是直撇号，另收全直、全弯写法。空态 No results matched your search 见 common-ui
    "We’ve encountered an error and some results aren't available at this time. Type a new search or try again later.":
      '發生錯誤，部分結果目前無法取得。請重新搜尋或稍後再試。',
    "We've encountered an error and some results aren't available at this time. Type a new search or try again later.":
      '發生錯誤，部分結果目前無法取得。請重新搜尋或稍後再試。',
    'We’ve encountered an error and some results aren’t available at this time. Type a new search or try again later.':
      '發生錯誤，部分結果目前無法取得。請重新搜尋或稍後再試。',
    // 左下角提示条：脚本写入 .js-command-palette-toasts 的 .Toast-content
    'Failed to run command': '無法執行命令',
    'Copy failed': '複製失敗',
    // 提示：Type <kbd>前缀</kbd> + 片段，引擎整句匹配；片段兜底
    'Type # to search discussions': '按 # 搜尋討論',
    'Type # to search issues': '按 # 搜尋議題',
    'Type # to search pull requests': '按 # 搜尋拉取請求',
    'Type ! to search projects': '按 ! 搜尋專案',
    'Type @ to search people and organizations': '按 @ 搜尋人員和組織',
    'Type @ to search teams': '按 @ 搜尋團隊',
    'Type > to activate command mode': '按 > 進入命令模式',
    'to search discussions': '搜尋討論',
    'to search issues': '搜尋議題',
    'to search pull requests': '搜尋拉取請求',
    'to search projects': '搜尋專案',
    'to search people and organizations': '搜尋人員和組織',
    'to search teams': '搜尋團隊',
    'to activate command mode': '進入命令模式',
    'Type is:issue to filter to issues': '輸入 is:issue 僅篩選議題',
    'Type is:pr to filter to pull requests': '輸入 is:pr 僅篩選拉取請求',
    'Type is:project to filter to projects': '輸入 is:project 僅篩選專案',
    'Type is:open to filter to open content': '輸入 is:open 僅篩選開放中的內容',
    'Type author:@me to search your content': '輸入 author:@me 搜尋你的內容',
    // 帮助项：Search for <strong>…,</strong> and <strong>…</strong>、Activate <strong>command mode</strong>，
    // 标题整段合并后按整句匹配（见 mergeText）；strong 内的片段不单独收录，users、projects 与搜索页的类型词同形
    'Search for issues, pull requests, discussions, and projects': '搜尋議題、拉取請求、討論和專案',
    'Search for projects': '搜尋專案',
    'Activate command mode': '進入命令模式',
    'Use filters in issues, pull requests, discussions, and projects': '在議題、拉取請求、討論和專案中使用篩選器',
    'Search your issues, pull requests, and discussions': '搜尋你的議題、拉取請求和討論',
    'Filter to discussions': '僅篩選討論',
    'Filter to projects': '僅篩選專案',
    'Filter to open issues, pull requests, and discussions': '僅篩選開放中的議題、拉取請求和討論',
    // 底部搜索项的片段兜底（整句见 inline）
    'across all of GitHub': '在整個 GitHub 中',
    // 命令（> 模式）。命令列表项的破折号前缀与命令名在同一文本节点
    '– New repository': '– 新增儲存庫',
    '– Import repository': '– 匯入儲存庫',
    '– New project': '– 新增專案',
    '– New discussion': '– 新增討論',
    '– New organization': '– 新增組織',
    '– New gist': '– 新增程式碼片段',
    '– New issue': '– 新增議題',
    '– New file': '– 新增檔案',
    '– Change tab size rendering': '– 變更定位字元顯示寬度',
    '– Switch theme': '– 切換佈景主題',
    'New file': '新增檔案',
    'Transfer issue…': '轉移議題…',
    'Clone repository: Copy HTTPS': '複製儲存庫：複製 HTTPS',
    'Clone repository: Copy SSH': '複製儲存庫：複製 SSH',
    'Clone repository: Copy GitHub CLI': '複製儲存庫：複製 GitHub CLI',
    // 更改制表符宽度的子页；作用域标记里的命令名被截断，省略号随原文
    'Change tab size rendering': '變更定位字元顯示寬度',
    'Change tab size r...': '變更定位字元顯示寬度...',
    '2 spaces': '2 個空格',
    '3 spaces': '3 個空格',
    '4 spaces': '4 個空格',
    '5 spaces': '5 個空格',
    '6 spaces': '6 個空格',
    '7 spaces': '7 個空格',
    '8 spaces': '8 個空格',
    '9 spaces': '9 個空格',
    '10 spaces': '10 個空格',
    '12 spaces': '12 個空格',
    // 切换主题的子页（主题名同外观设置的 Dark default 等）
    'Switch theme': '切換佈景主題',
    'Default dark': '深色預設',
    'Default light': '淺色預設',
    'Switch theme to dark high contrast': '將佈景主題切換為深色高對比',
    'Sync with system settings': '與系統設定同步',
  },
  regexp: [
    // 快速搜索：“探索”建议
    [new RegExp(`^Explore (${EXPLORE_TITLE_SOURCE})$`), (_, title) => exploreLabel(title)],
    // 快速搜索：上下文建议的无障碍名称（变量为搜索词、存储库、组织）
    [/^Search GitHub for (.+)$/, '在 GitHub 中搜尋 $1'],
    [/^Search this directory for (.+)$/, '在此目錄中搜尋 $1'],
    [
      /^Search (Organization|Enterprise|Owner) ([\w.-]+) for (.+)$/,
      (_, scope, name, query) => `在${SEARCH_SCOPE[scope] ?? scope} ${name} 中搜尋 ${query}`,
    ],
    [/^Search ([\w.-]+\/[\w.-]+) for (.+)$/, '在 $1 中搜尋 $2'],
    [/^Recent search: (.+)$/, '最近搜尋：$1'],
    [
      /^Jump to (.+), (organization|repository)$/,
      (_, name, kind) => `跳至 ${name}（${SUGGESTION_KIND[kind] ?? kind}）`,
    ],
    // 限定符值可含空格：language:"Objective C"、license:"MIT License"、saved:"my search"
    [
      /^Autocomplete (.+) scope, (organization|repository|owner|language)$/,
      (_, value, kind) => `自動完成 ${value} 範圍（${SUGGESTION_KIND[kind] ?? kind}）`,
    ],
    [/^Autocomplete (.+) qualifier value$/, '自動完成 $1 限定詞值'],
    [/^(saved:.+), Autocomplete$/, '$1，自動完成'],
    [/^(.+), jump to this code$/, '$1，跳至此程式碼'],
    // 已保存搜索数量上限（React 拆分的数字与文字拼接后）
    [
      /^Limit of (\d+) saved searches reached\. Please delete an existing saved search before creating a new one\.$/,
      '已達 $1 個已儲存搜尋的上限。請先刪除現有的已儲存搜尋再建立新的搜尋。',
    ],
  ],
  inline: [
    // 旧版命令面板底部的搜索项：Search<strong> '查询' </strong>across all of GitHub（空格在 strong 内）；
    // 存储库、所有者范围内末段是 in owner/repo、in owner
    ['Search {} across all of GitHub', '在整個 GitHub 中搜尋{}'],
    [/^Search \{\} in ([\w.-]+(?:\/[\w.-]+)?)$/, '在 $1 中搜尋{}'],
  ],
  // 旧版命令面板帮助项的标题：服务端模板 <command-palette-help> 的标题元素，以及据此渲染的列表项
  // （标题以 innerHTML 写入内层 span）。<strong> 拆开的标题整段合并后匹配
  mergeText: [
    '[data-target="command-palette-help.titleElement"]',
    '[data-target="command-palette-item.titleElement"] > span',
  ],
} satisfies PageDictionary
