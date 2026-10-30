import type { PageDictionary } from '../../../core/types'

const ORG_INVITE_VERB: Readonly<Record<string, string>> = {
  Invite: '邀請成員加入',
  Add: '新增成員至',
}

/** 登录后全局导航栏：头部按钮、全局导航侧栏、用户菜单、新建菜单、Copilot 与代理菜单、存储库标签导航 */
export default {
  static: {
    // 头部
    'Global navigation menu': '全域導覽選單',
    'Open global navigation menu': '開啟全域導覽選單',
    'Open menu': '開啟選單',
    'Close menu': '關閉選單',
    Breadcrumbs: '導覽路徑',
    // 页头面包屑（所有页面共用）
    'GitHub Breadcrumb': 'GitHub 導覽路徑',
    'Show more breadcrumb items': '顯示更多導覽路徑項目',
    'Command palette': '命令面板',
    'Search or jump to…': '搜尋或跳至…',
    'Search or jump to...': '搜尋或跳至...',
    'Search or jump to': '搜尋或跳至',
    // 搜索按钮文字 Type <kbd>/</kbd> to search：引擎整句匹配，其他快捷键由正则处理；
    // “to search” 是整句未命中时的片段兜底。“Type” 与“類型”同形，不收录
    'Type / to search': '按 / 搜尋',
    'to search': '搜尋',
    'All issues': '所有議題',
    'All pull requests': '所有拉取請求',
    'All repositories': '所有儲存庫',
    'Your issues': '你的議題',
    'Your pull requests': '你的拉取請求',
    'Your repositories': '你的儲存庫',
    'Create new…': '新增…',
    'Create new...': '新增...',
    'Create something new': '建立新內容',
    'Open user navigation menu': '開啟使用者導覽選單',
    'Close user navigation menu': '關閉使用者導覽選單',
    'Switch repository': '切換儲存庫',
    'Search repositories': '搜尋儲存庫',
    'Loading repositories...': '正在載入儲存庫...',
    'Loading repositories…': '正在載入儲存庫…',
    'No repositories found': '找不到儲存庫',

    // 通知入口
    Notifications: '通知',
    'You have no unread notifications': '沒有未讀通知',
    'You have unread notifications': '有未讀通知',
    'Notifications are disabled': '通知已停用',
    'Notifications are unavailable at the moment.': '通知目前無法使用。',

    // Copilot 菜单
    'Chat with Copilot': '與 Copilot 聊天',
    'Navigate to Copilot': '前往 Copilot',
    'Open Copilot…': '開啟 Copilot…',
    'Open Copilot...': '開啟 Copilot...',
    'Open Copilot menu': '開啟 Copilot 選單',
    'Open agents panel': '開啟代理面板',
    'Ask Copilot…': '詢問 Copilot…',
    'In immersive chat': '在沉浸式聊天中',
    'In a space': '在空間中',
    'About this page': '關於此頁面',
    'Download for…': '下載適用於…',
    'Your Copilot': '你的 Copilot',
    // 计划标签（GlobalCopilotMenu 的 <Label>：Free / Student / Pro / Pro+）：方案名按用户要求译“X 版”；
    // 教育福利申请的身份选项 Student 由 settings-account 的 scoped 译“學生”
    Free: '免費版',
    Student: '學生版',
    Pro: '專業版',
    'Pro+': '專業增強版',
    'Meet the new Copilot': '認識全新的 Copilot',
    'Close announcement': '關閉公告',
    'Start a session or revisit recent sessions from the navigation bar.':
      '從導覽列開始工作階段或重新開啟最近的工作階段。',
    "Start a session or revisit recent sessions from the navigation bar. Choose Learn more for a quick tour of what's new.":
      '從導覽列開始工作階段或重新開啟最近的工作階段。選擇瞭解詳情可快速瀏覽新功能。',
    'Opening Copilot': '正在開啟 Copilot',
    'Unable to open Copilot. Please try again.': '無法開啟 Copilot。請再試一次。',

    // 代理菜单
    Agents: '代理',
    'Recent sessions': '最近的工作階段',
    'New session': '新增工作階段',
    'Open Copilot settings': '開啟 Copilot 設定',
    'View all sessions': '查看所有工作階段',
    'Loading recent sessions': '正在載入最近的工作階段',
    'Sessions couldn’t be loaded': '無法載入工作階段',
    'No recent sessions': '沒有最近的工作階段',
    'Start a new session to see it here.': '開始新的工作階段後會顯示在這裡。',
    'Try again or, if the problem persists, contact support.': '請再試一次；如果問題持續發生，請聯絡支援團隊。',
    'GitHub status': 'GitHub 狀態',
    'Start a new task with Copilot': '使用 Copilot 開始新任務',
    'Describe your task in natural language. Copilot will work in the background and open a pull request for your review.':
      '使用自然語言描述任務。Copilot 會在背景工作，並建立拉取請求供你審查。',
    'Describe a coding task to work on': '描述要處理的程式開發任務',
    'Learn more about Copilot cloud agent': '瞭解 Copilot 雲端代理',
    'Recent tasks': '最近的任務',
    'Tasks couldn’t be loaded': '無法載入任務',
    'uses AI. Check for mistakes.': '使用 AI。請檢查是否有誤。',
    // 产品名按用户要求译成中文：Copilot cloud agent → Copilot 雲端代理
    'Copilot cloud agent': 'Copilot 雲端代理',
    // 标题由 “Start a task with ” 与代理名两个相邻文本节点组成，整体匹配
    'Start a task with Copilot cloud agent': '使用 Copilot 雲端代理開始任務',
    'Copilot works in the cloud and opens a pull request for your review. Enjoy up to 5 free uses this month with your Copilot Free plan.':
      'Copilot 會在雲端工作，並建立拉取請求供你審查。你的 Copilot 免費版方案本月最多可免費使用 5 次。',
    // 会话状态（列表项说明文字）
    Working: '工作中',
    'Needs attention': '需要處理',
    Idle: '閒置',

    // 新建菜单
    'New issue': '新增議題',
    'New repository': '新增儲存庫',
    'Import repository': '匯入儲存庫',
    'New agent session': '新增代理工作階段',
    'New agent task': '新增代理任務',
    'New spark': '新增 Spark',
    'New codespace': '新增程式碼空間',
    'New doc': '新增文件',
    'New gist': '新增程式碼片段',
    'New organization': '新增組織',
    'New project': '新增專案',
    'Create new repository': '建立新儲存庫',
    // 组织页面中新建菜单的分组标题
    'This organization': '此組織',

    // 全局导航侧栏
    Home: '首頁',
    Feed: '動態',
    'Pull requests': '拉取請求',
    Repositories: '儲存庫',
    Projects: '專案',
    Discussions: '討論',
    'MCP registry': 'MCP 登錄庫',
    'Top repositories': '常用儲存庫',
    'Search for repositories': '搜尋儲存庫',
    'Close search': '關閉搜尋',
    'Show even more': '顯示更多',
    // 原“团队”区的迁移提示，后接链接
    'Teams have moved to': '團隊已移至',

    // 用户菜单
    'User navigation': '使用者導覽',
    'Set status': '設定狀態',
    'Edit status': '編輯狀態',
    Profile: '個人檔案',
    Stars: '星號',
    Gists: '程式碼片段',
    Organizations: '組織',
    // 导航项（指赞助功能）；个人资料侧栏的赞助者列表标题需由 profile 词典 scoped 译“贊助者”
    Sponsors: '贊助',
    Settings: '設定',
    'Enterprise settings': '企業設定',
    'Copilot settings': 'Copilot 設定',
    'Feature preview': '功能預覽',
    Appearance: '外觀',
    Accessibility: '無障礙',
    'Try Enterprise': '試用企業版',
    Upgrade: '升級',
    'Privacy Statement': '隱私權聲明',
    'Status Page': '狀態頁面',
    'My Privacy Choices': '我的隱私權選擇',
    'Sign out': '登出',
    'Sign out...': '登出...',
    'Sign out…': '登出…',
    'Single sign-on': '單一登入',
    'Staff tools': '員工工具',
    'Admin mode': '管理員模式',
    'Enable site admin actions': '啟用網站管理員動作',
    'Failed to toggle site admin mode': '無法切換網站管理員模式',
    'UI service': 'UI 服務',
    'Route through the new UI service': '透過新 UI 服務路由',
    'Failed to toggle UI service opt-out': '無法切換 UI 服務的選擇退出狀態',
    // 旧版用户菜单
    'Your profile': '你的個人檔案',
    'Your projects': '你的專案',
    'Your stars': '你的星號',
    'Your gists': '你的程式碼片段',
    'Your organizations': '你的組織',
    'Your enterprises': '你的企業',
    'Your enterprise': '你的企業',
    'Your sponsors': '你的贊助者',
    'GitHub Website': 'GitHub 網站',
    'GitHub Docs': 'GitHub 說明文件',
    'GitHub Support': 'GitHub 支援',
    'GitHub Community': 'GitHub 社群',

    // 帐户切换
    'Account switcher': '帳號切換器',
    'Add account': '新增帳號',
    'Switch account': '切換帳號',
    'Maximum accounts reached': '已達帳號數量上限',
    'Signed in as': '目前登入帳號',
    'Switch to another account': '切換到其他帳號',
    'An error has occurred while switching accounts. Please try again.': '切換帳號時發生錯誤。請再試一次。',
    'An error occurred while switching accounts. Please try again.': '切換帳號時發生錯誤。請再試一次。',
    'Unable to switch to the selected account.': '無法切換到選取的帳號。',
    'Please try again. If the issue persists, try adding the account again.':
      '請再試一次。如果問題持續發生，請嘗試再次新增此帳號。',

    // 企业栏
    'Data residency:': '資料落地：',
    'Viewing as': '目前身分',
    'Users managed by': '使用者受控於',
    'UI PREVIEW': 'UI 預覽',
    'UI PREVIEW: View commit in github-ui': 'UI 預覽：在 github-ui 中查看提交',
    'Leave UI preview mode': '結束 UI 預覽模式',

    // 存储库、组织等页面的标签导航（位于全局导航栏内）
    'Repository navigation': '儲存庫導覽',
    Repository: '儲存庫',
    Organization: '組織',
    User: '使用者',
    Local: '本機',
    Code: '程式碼',
    // 产品名按用户要求译成中文：存储库标签页 Actions、代码按钮下拉的 Codespaces 标签页；
    // 全局导航侧栏、营销头部的同名产品项共用
    Actions: '動作',
    Codespaces: '程式碼空間',
    Models: '模型',
    'Security and quality': '安全性和品質',
    Insights: '洞察',
  },
  regexp: [
    // 已登录头部搜索按钮的无障碍名称与按钮文字（快捷键不是 / 时）
    [/^Open quick search dialog, type (\S+) to search$/, '開啟快速搜尋對話方塊，按 $1 搜尋'],
    [/^Type (\S+) to search$/, '按 $1 搜尋'],
    // 新建菜单中的组织项
    [/^(Invite|Add) someone to ([\w.-]+)$/, (_, verb, org) => `${ORG_INVITE_VERB[verb] ?? verb} ${org}`],
    [/^New team in ([\w.-]+)$/, '在 $1 中新增團隊'],
    [/^New repository in ([\w.-]+)$/, '在 $1 中新增儲存庫'],
    // 企业栏 title
    [/^Data residency: ([^-]+?) - Viewing as ([\w-]+)$/, '資料落地：$1 - 以 $2 身分查看'],
    [/^Data residency: ([^-]+?) - Users managed by (.+)$/, '資料落地：$1 - 由 $2 管理的使用者'],
    [/^Viewing as ([\w-]+)$/, '以 $1 身分查看'],
    [/^Users managed by (.+)$/, '由 $1 管理的使用者'],
    // 代理菜单：会话数播报、正在创建的任务
    [/^(\d+) recent sessions?$/, '$1 個最近的工作階段'],
    [/^Creating task in ([\w.-]+\/[\w.-]+)$/, '正在 $1 中建立任務'],
  ],
} satisfies PageDictionary
