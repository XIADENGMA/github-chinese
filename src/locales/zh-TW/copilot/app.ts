import type { PageDictionary } from '../../../core/types'
import { COPILOT_PLANS, copilotPlan } from './plans'

/**
 * Copilot 应用外壳：侧栏导航、GitHub Copilot 应用的下载与唤起、代理首页（/copilot/agents）与存储库代理页、
 * 存储库代理页与停靠面板会话历史的筛选、代理推广提示、拉取请求中的编码代理会话，以及 Copilot 页通用的单个词。
 * 外壳与停靠面板在各页面复用，整句放 static；单个通用词放 scoped，只在 Copilot 页生效。
 */
export default {
  static: {
    // 侧栏
    'Copilot navigation': 'Copilot 導覽',
    'Agent management': '代理管理',
    // 侧栏会话列表的标题、议题页的代理会话面板
    'Agent sessions': '代理工作階段',
    'Agent session': '代理工作階段',

    // GitHub Copilot 应用：侧栏入口、下载菜单、唤起状态
    'The GitHub Copilot app': 'GitHub Copilot 應用程式',
    'The GitHub Copilot app, New': 'GitHub Copilot 應用程式，新功能',
    'GitHub Copilot App': 'GitHub Copilot 應用程式',
    'An agent-driven desktop experience built natively on GitHub.': '以 GitHub 原生打造、由代理驅動的桌面體驗。',
    'Choose a GitHub Copilot app download': '選擇要下載的 GitHub Copilot 應用程式',
    'Download GitHub Copilot app (opens in new tab)': '下載 GitHub Copilot 應用程式（在新分頁中開啟）',
    'More download options': '更多下載選項',
    'Opening GitHub Copilot app': '正在開啟 GitHub Copilot 應用程式',
    'GitHub Copilot app did not open. Use Open the app to retry or Download to install.':
      'GitHub Copilot 應用程式未開啟。使用開啟應用程式來重試，或使用下載來安裝。',

    // 代理首页：<Copilot 雲端代理> 處理……（产品名、功能名、方案名按 product-names.md 译出）
    'handles routine tasks so you can focus on core work': '處理例行任務讓你專注於核心工作',
    'Save time by offloading testing, dependency upgrades, migrations and maintenance to agents. Create pull requests from Copilot Chat, CLI, IDEs or assign an Issue to Copilot to get started.':
      '將測試、相依性升級、移轉和維護工作交給代理，節省時間。從 Copilot 聊天、CLI、IDE 建立拉取請求，或將議題指派給 Copilot 來開始使用。',
    'View capabilities': '查看功能',
    'Copilot cloud agent access disabled': 'Copilot 雲端代理存取權已停用',
    'Agents (opens a new page)': '代理（開啟新頁面）',
    // 存储库代理页（/<owner>/<repo>/agents）：未开通与空状态
    'Copilot Coding Agent handles routine tasks so you can focus on core work': 'Copilot 程式開發代理處理例行任務讓你專注於核心工作',
    'View Copilot Coding Agent capabilities': '查看 Copilot 程式開發代理的功能',
    'Available on paid plans. Try it with Copilot Pro — free for 30 days.': '適用於付費方案。試用 Copilot 專業版——30 天免費。',
    'Let Copilot work on tasks for you in the background.': '讓 Copilot 在背景為你處理任務。',
    'Your code review sessions are available from the pull request timeline. Enable Copilot cloud agent to assign tasks, track progress, and review changes — all from this page.':
      '你的程式碼審查工作階段可從拉取請求時間軸查看。啟用 Copilot 雲端代理來指派任務、追蹤進度並審查變更——全部在此頁面完成。',
    'Customize environment': '自訂環境',
    // 旧版编码代理面板与推广
    'No agents running': '沒有執行中的代理',
    'You can now ask Copilot to work on a task for you in the background, creating a pull request which you can review.':
      '現在你可以請 Copilot 在背景為你處理任務，並建立拉取請求供你審查。',
    'No open tasks yet. Start a new task to see it here.': '尚無開放中的任務。開始新任務後會顯示在這裡。',
    'Copilot coding agent now uses fewer premium requests!': 'Copilot 程式開發代理現在使用的進階請求更少了！',
    'From now on, each session uses just one premium request.': '從現在起，每個工作階段只會使用一個進階請求。',
    'Delegate tasks to GitHub Copilot coding agent': '將任務委派給 GitHub Copilot 程式開發代理',
    "Let Copilot work independently in the background to complete tasks, and then monitor Copilot's progress.":
      '讓 Copilot 在背景獨立完成任務，然後監控 Copilot 的進度。',
    "Delegate tasks to GitHub Copilot coding agent to work on in the background, and then monitor Copilot's progress.":
      '將任務委派給 GitHub Copilot 程式開發代理在背景處理，然後監控 Copilot 的進度。',
    'This feature is not available on your current plan.': '你目前的方案不提供此功能。',
    // 拉取请求中的编码代理会话：标题后缀、状态与错误
    '· Initializing pull request…': '· 正在初始化拉取請求…',
    '· Last updated': '· 上次更新於',
    'Steer active session while Copilot is working': '在 Copilot 工作時引導目前的工作階段',
    'View detailed logs': '查看詳細記錄',
    'Copilot encountered an unknown Git error. If the problem persists, please contact GitHub Support. To retry, leave a comment on this pull request asking Copilot to try again.':
      'Copilot 遇到未知的 Git 錯誤。如果問題持續發生，請聯絡 GitHub 支援。若要重試，請在此拉取請求中留言，要求 Copilot 再試一次。',
    'Submitting will post a pull request comment': '送出後將發表拉取請求留言',
    'Copilot is still working. Changes will automatically appear once they have been committed to the branch.':
      'Copilot 仍在工作中。變更提交到分支後會自動顯示。',

    // 会话筛选（存储库代理页、停靠面板的会话历史）；Filter by <标签小写>
    'Filter sessions': '篩選工作階段',
    'Session filters': '工作階段篩選器',
    'Task filters': '任務篩選器',
    'My sessions': '我的工作階段',
    'Filter by status': '依狀態篩選',
    'Filter by environment': '依環境篩選',
    'Filter by type': '依類型篩選',
    'Filter by agent': '依代理篩選',

    // 代理推广提示（免费用户弹出提示的标题 Start a task with Copilot cloud agent 见 common/global-nav.ts）
    'Let Copilot tackle your TODOs': '讓 Copilot 處理你的待辦事項'
  },
  scoped: {
    // 外壳
    'GitHub homepage': 'GitHub 首頁',
    'Condense sidebar': '收合側邊欄',
    Navigation: '導覽',
    'Open the app': '開啟應用程式',
    // 侧栏用户菜单的方案标签（Copilot Free），订阅页链接文字（Copilot Business）同用；方案名见 plans.ts 的 COPILOT_PLANS
    ...COPILOT_PLANS,
    // 唤起中的按钮：<span>Opening</span><span>GitHub Copilot app</span>，后接宾语（应用名）作“正在開啟”
    Opening: '正在開啟',
    // 侧栏入口的“新”徽章（无障碍名称 The GitHub Copilot app, New 见 static）
    New: '新',
    // 代理首页：查看 <功能>；存取 <Copilot 雲端代理> 的權限已由你的管理員停用。
    capabilities: '功能',
    'Access to': '存取',
    'has been disabled by your administrator.': '的權限已由你的管理員停用。',
    // 会话列表
    Active: '使用中',
    'In progress': '進行中',
    'Created by me': '我建立的',
    'Start free trial': '開始免費試用',
    'Try adjusting your search or filters.': '試著調整搜尋或篩選器。',
    // 拉取请求中的编码代理会话：<Copilot> 開始工作；已更改的文件列表
    'started work': '開始工作',
    'View file': '查看檔案',
    Viewed: '已查看',
    viewed: '已查看',
    'Viewed files': '已查看的檔案',
    Diff: '差異',
    Repos: '儲存庫',
    default: '預設',
    'Find a branch...': '尋找分支...',
    'Find a branch…': '尋找分支…',

    // Copilot 页通用词：会话、任务视图、聊天中的引用卡片
    Model: '模型',
    Session: '工作階段',
    'View session': '查看工作階段',
    'Session options': '工作階段選項',
    'Previous conversation': '上一個對話',
    'Repository owner': '儲存庫擁有者',
    'Previous question': '上一個問題',
    'Next question': '下一個問題',
    'Previous step': '上一步',
    'Next step': '下一步',
    Assign: '指派',
    Authorize: '授權',
    Duration: '持續時間',
    Tip: '提示',
    Skipped: '已略過',
    You: '你',
    Host: '主機',
    'Files changed': '變更的檔案',
    'Loading tasks': '正在載入任務',
    'Open issue': '開放中的議題',
    'Draft issue': '草稿議題',
    Opened: '建立於',
    'Blocked by': '受阻於',
    Image: '圖片',
    Job: '作業',
    'Code search': '程式碼搜尋',
    'Failed to search': '搜尋失敗',
    'Upload failed': '上傳失敗',
    'Please try again later.': '請稍後再試。',
    // Share feedback（提供意見回饋）由 common-ui 翻译
    'Suggest improvements': '建議改進',
    'Input:': '輸入：',
    'Output:': '輸出：',
    // 停靠聊天的推荐问题标题
    'Get started': '開始使用',
    'Next steps': '後續步驟',
    Comments: '留言',
    "What's new": '新功能',
    // 公告横幅的链接
    'See what’s new': '查看新功能',
    "See what's new": '查看新功能',
    // Copilot 专业版结账页（/github-copilot/pro）的步骤名：核对订单，不是代码审查
    Review: '確認'
  },
  regexp: [
    // 侧栏用户菜单：方案标签后接升级链接（Copilot Free · <Upgrade>）；用户按钮的无障碍名称（octocat, Copilot Free）
    [/^(Copilot (?:Free|Pro\+?|Business|Enterprise|Student)) ·$/, (_, plan: string) => `${copilotPlan(plan)} ·`],
    [
      /^([\w-]+), (Copilot (?:Free|Pro\+?|Business|Enterprise|Student))$/,
      (_, login: string, plan: string) => `${login}，${copilotPlan(plan)}`
    ]
  ]
} satisfies PageDictionary
