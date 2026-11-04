import { lookupTable } from '../../../core/table'
import type { PageDictionary, RegExpRule } from '../../../core/types'
import models from './models'

/** 会话列表的筛选标签 / 状态（单词放 scoped，全局导航已有 Working / Idle / Needs attention） */
const PERMISSION_MODE: Readonly<Record<string, string>> = {
  'Always ask': '一律詢問',
  Assisted: '輔助',
  'Allow all': '全部允許',
  Interactive: '互動式',
  Autopilot: '自動駕駛',
  Plan: '規劃'
}

/** 选择器里的占位值与聊天模式 */
const PICKER_VALUE: Readonly<Record<string, string>> = {
  'Select repository': '選擇儲存庫',
  'Select branch': '選擇分支',
  'Loading branch...': '正在載入分支...',
  Personal: '個人',
  Ask: '詢問',
  Agent: '代理'
}

/** 日志详细程度 */
const VERBOSITY: Readonly<Record<string, string>> = {
  Minimal: '精簡',
  Balanced: '平衡',
  Detailed: '詳細'
}

/** 环境状态 */
const ENV_STATUS: Readonly<Record<string, string>> = {
  Online: '線上',
  Offline: '離線',
  Ready: '就緒',
  Degraded: '已降級',
  Waking: '喚醒中',
  Draining: '排空中',
  Connecting: '連線中',
  Connected: '已連線',
  Disconnected: '已中斷連線'
}

/** 代理显示名（Copilot、Claude、OpenAI Codex 等，最多 4 个词），避免匹配会话标题等长文本 */
const AGENT_NAME = '[\\w.+-]+(?: [\\w.+-]+){0,3}'

function pickerValue(value: string): string {
  return PICKER_VALUE[value] ?? PERMISSION_MODE[value] ?? value
}

/** 括号：内容含中文用全角，否则用半角并与前文空一格 */
function paren(text: string): string {
  return /[一-鿿]/.test(text) ? `（${text}）` : ` (${text})`
}

/** 任务创建失败横幅的说明（字符串替换）；读屏播报“Task creation failed. <说明>”与首页输入框（dashboard/composer）沿用 */
export const TASK_FAILURE_RULES: readonly (readonly [RegExp, string])[] = [
  [/^Unable to start task for '(.+)'\. Please try again\.$/, '無法為「$1」開始任務。請再試一次。'],
  [/^Unable to start task for '(.+?)': (.+)$/, '無法為「$1」開始任務：$2']
]

/** models 词典的全局词条（任务创建失败横幅的计费提示从这里取译文） */
const modelText = lookupTable(models.static)

/** 横幅说明：计费提示取 models 词典译文，其余按横幅规则翻译，都不命中时保留原文 */
function translateTaskFailure(description: string): string {
  const billing = modelText(description)
  if (billing !== undefined) return billing
  const rule = TASK_FAILURE_RULES.find(([pattern]) => pattern.test(description))
  return rule ? description.replace(rule[0], rule[1]) : description
}

const composerRules: RegExpRule[] = []

/**
 * 首页 Copilot 输入框（dashboard/composer）与本页共用组件的规则：环境条、任务创建失败横幅、图片附件。
 * 在本词典的规则列表中用 composerRule 原地标出，按列表中的先后顺序收集；两处引用同一份
 */
export const COMPOSER_SHARED_RULES: readonly RegExpRule[] = composerRules

/** 标出首页输入框沿用的规则：原样返回，并收进 COMPOSER_SHARED_RULES */
function composerRule(rule: RegExpRule): RegExpRule {
  composerRules.push(rule)
  return rule
}

/**
 * Copilot 代理：代理会话列表与筛选、会话页头部与详细信息、分享 / 固定 / 存档 / 删除、引导（steering）限制、
 * 继续于其他客户端、新建任务与分配给代理、任务创建失败的横幅与读屏播报、
 * 代理 / 范围 / 存储库 / 环境 / 权限选择器、授权与第三方代理设置。
 * 页面：/copilot/agents（代理首页）、/{owner}/{repo}/agents（存储库代理页）、
 * /{owner}/{repo}/tasks/{id}（代理会话页）；会话页也出现在拉取请求下（/pull/N/agent-sessions/…），长句放 static。
 */
export default {
  static: {
    // 会话类型与客户端
    'Cloud agents': '雲端代理',
    'Cloud session': '雲端工作階段',
    'Environment session': '環境工作階段',
    'CLI session': 'CLI 工作階段',
    'CLI session connected': 'CLI 工作階段已連線',
    'Private session connected': '私人工作階段已連線',
    'Private remote session': '私人遠端工作階段',
    'VS Code session': 'VS Code 工作階段',
    'VS Code session connected': 'VS Code 工作階段已連線',
    'JetBrains session': 'JetBrains 工作階段',
    'JetBrains session connected': 'JetBrains 工作階段已連線',
    'Copilot in VS Code': 'VS Code 中的 Copilot',
    'Copilot in JetBrains': 'JetBrains 中的 Copilot',
    'Copilot Code Review': 'Copilot 程式碼審查',
    'Copilot app': 'Copilot 應用程式',
    'Actions session': '動作工作階段',
    'Local machine': '本機電腦',
    'New chat session': '新增聊天工作階段',
    'New remote session': '新增遠端工作階段',
    'Runs on GitHub-managed compute.': '在 GitHub 管理的運算資源上執行。',
    'Runs on a user-managed device — Copilot CLI or an IDE-embedded client (VS Code / JetBrains).':
      '在使用者管理的裝置上執行——Copilot CLI 或內嵌於 IDE 的用戶端 (VS Code / JetBrains)。',

    // 新建任务
    'New task': '新增任務',
    'Give Copilot cloud agent a background task': '交給 Copilot 雲端代理一項背景任務',
    'Give Copilot a background task to work on': '交給 Copilot 一項背景任務',
    'Explain this repository and help me understand the codebase': '說明此儲存庫並幫我瞭解程式碼庫',
    'Analyze test coverage and add missing tests': '分析測試涵蓋範圍並補上缺少的測試',
    'Create a detailed implementation plan for a feature': '為某項功能擬定詳細的實作計畫',
    'Coding task prompt': '程式開發任務提示',
    'What would you like to do next?': '接下來想做什麼？',
    'Setting up your cloud session…': '正在設定雲端工作階段…',
    'Preparing repository…': '正在準備儲存庫…',
    'Repository preparation failed.': '儲存庫準備失敗。',
    'Starting agent…': '正在啟動代理…',
    'Copilot is working…': 'Copilot 正在工作…',
    'Copilot is working...': 'Copilot 正在工作...',
    'Waking compute…': '正在喚醒運算資源…',
    'Waiting for session…': '正在等待工作階段…',
    'Waiting for agent to start session...': '正在等待代理開始工作階段...',
    'Retry starting agent': '重試啟動代理',
    'Agent startup did not finish': '代理啟動未完成',
    'Task creation failed': '任務建立失敗',
    'Task started': '任務已開始',
    'Starting task…': '正在開始任務…',
    'Failed to start task in this environment.': '無法在此環境中開始任務。',
    'Failed to start Chat.': '無法開始聊天。',
    'The selected owner changed. Please submit again.': '選取的擁有者已變更。請重新送出。',
    'This chat was not submitted. Start a new chat to continue.': '此聊天未送出。開始新的聊天以繼續。',
    'Automation task cannot start in Sandbox': '自動化任務無法在沙箱中開始',
    'Go back to the Automations page, then choose Create manually.': '返回自動化頁面，然後選擇手動建立。',
    'Task cannot start in Sandbox': '任務無法在沙箱中開始',
    'Go back and try again from the previous page.': '返回上一頁再試一次。',
    'Go back to Automations': '返回自動化',
    'Chat is only available for Cloud sessions. Choose a repository to create a task.': '聊天僅適用於雲端工作階段。選擇儲存庫以建立任務。',
    'Submission error': '送出錯誤',
    'Startup may already have reached the environment. Restarting may send the first message again.':
      '啟動請求可能已送達環境。重新啟動可能會再次傳送第一則訊息。',
    'Startup recovery expired. Restart startup to try again.': '啟動復原已過期。重新啟動以再試一次。',
    'Startup may have reached the environment. Retry explicitly before sending the first message again.':
      '啟動請求可能已送達環境。先明確重試，再重新傳送第一則訊息。',
    'Submission status checking is unavailable. Your draft is still available.': '無法檢查送出狀態。你的草稿仍然保留。',
    'Status unavailable': '無法取得狀態',
    'Loading status': '正在載入狀態',
    'Try asking Copilot to plan before implementing': '試著讓 Copilot 先規劃再實作',
    'Reference specific files to give Copilot better context': '引用特定檔案為 Copilot 提供更好的上下文',
    'You can ask Copilot to explain its approach before making changes': '你可以讓 Copilot 在變更前先說明做法',
    'Add a .github/agents.md file to customize Copilot for your repository': '新增 .github/agents.md 檔案，為儲存庫自訂 Copilot',
    'Copilot can work on multiple tasks in parallel across different repos': 'Copilot 可以在不同儲存庫中平行處理多項任務',
    'Use the Copilot CLI to start tasks from your terminal': '使用 Copilot CLI 從終端機開始任務',
    'Ask Copilot to write tests for its own changes before finishing': '讓 Copilot 在完成前為自己的變更撰寫測試',
    "You can approve or reject Copilot's plan before it starts coding": '你可以在 Copilot 開始撰寫程式碼前核准或拒絕它的計畫',
    'Spinning up dev environment…': '正在啟動開發環境…',
    'Fueling the runtime engines…': '正在為執行階段引擎加油…',
    'Clearing the airspace for MCP traffic…': '正在為 MCP 流量淨空空域…',
    'Cabin pressure stable. Almost ready…': '艙壓穩定。即將就緒…',
    'Reticulating goggles...': '正在調校護目鏡...',
    'Calibrating flux capacitor...': '正在校準通量電容器...',
    'Adjusting seatbelt…': '正在調整安全帶…',
    'Waiting for clearance from GitHub tower…': '正在等待 GitHub 塔台放行…',
    'Final systems check, standing by…': '最終系統檢查，待命中…',
    'Takeoff soon™…': '即將起飛™…',

    // 范围、存储库、环境选择器
    'Start a session': '開始工作階段',
    'Select session scope for Chat': '選擇聊天的工作階段範圍',
    'Scope determines which repositories the session can access': '範圍決定工作階段可以存取哪些儲存庫',
    'Search user or organizations': '搜尋使用者或組織',
    'Searching owners': '正在搜尋擁有者',
    'SSO required': '需要 SSO',
    '(single sign-on required)': '（需要單一登入）',
    'Ask anything across repositories': '跨儲存庫提問',
    'Work in a repository': '在儲存庫中工作',
    'Could not load repositories': '無法載入儲存庫',
    'Searching repositories…': '正在搜尋儲存庫…',
    'Repository selection information': '儲存庫選擇資訊',
    'Resolving repository owner': '正在解析儲存庫擁有者',
    'Change Chat scope, current:': '變更聊天範圍，目前：',
    'Your repositories and public repositories': '你的儲存庫和公開儲存庫',
    'Cloud sessions are disabled by this organization': '此組織已停用雲端工作階段',
    "Chats can't be run on Actions": '聊天無法在動作中執行',
    'No Mission Control environments available': '沒有可用的任務控制中心環境',
    'No custom environments available.': '沒有可用的自訂環境。',
    'Set one up': '設定一個',
    'Selected environment is no longer available. Switched to the default environment.': '選取的環境已無法使用。已切換到預設環境。',
    'Mode: Chat': '模式：聊天',
    'Choose Chat or a repository': '選擇聊天或儲存庫',
    'Start a general chat for Personal or an organization, or select a repository to give Copilot project context.':
      '為個人或組織開始一般聊天，或選擇儲存庫為 Copilot 提供專案上下文。',
    'Start a general chat, or select a repository to give Copilot project context.':
      '開始一般聊天，或選擇儲存庫為 Copilot 提供專案上下文。',
    'Set the session scope': '設定工作階段範圍',
    'Choose Personal or an organization to set which repositories are available to your session.':
      '選擇個人或組織，設定工作階段可使用的儲存庫。',
    'Choose where Copilot runs': '選擇 Copilot 的執行位置',
    'Use the environment picker to run your session in new, fast Cloud sessions or in Actions.':
      '使用環境選擇器，在全新且快速的雲端工作階段或動作中執行工作階段。',
    'Branch: None available': '分支：沒有可用的分支',
    'Loading branch...': '正在載入分支...',
    'Loading branches…': '正在載入分支…',
    'Please select a repository and branch.': '請選擇儲存庫和分支。',
    'Please select a valid base branch.': '請選擇有效的基底分支。',
    'Spaces can only be attached when starting a new cloud session.': '只能在開始新的雲端工作階段時附加空間。',
    'Could not load spaces': '無法載入空間',
    'Could not select this space. Try again.': '無法選擇此空間。請再試一次。',
    'No space': '無空間',
    'No matching spaces': '沒有相符的空間',
    'No spaces available': '沒有可用的空間',
    'Filter spaces by name or owner': '依名稱或擁有者篩選空間',
    'Find a space': '尋找空間',
    'Resolving…': '解析中…',

    // 代理选择器
    'Select an agent': '選擇代理',
    'Custom agents': '自訂代理',
    'Custom agent': '自訂代理',
    'Create a custom agent': '建立自訂代理',
    'This repository has no custom agents': '此儲存庫沒有自訂代理',
    'No custom agents available': '沒有可用的自訂代理',
    'Custom agents are reusable instructions and tools in your repository.': '自訂代理是儲存庫中可重複使用的指示和工具。',
    'Custom agents come from a repository. Select one to use its agents.': '自訂代理來自儲存庫。選擇一個儲存庫以使用其中的代理。',
    'Loading agents': '正在載入代理',
    'Loading agent': '正在載入代理',
    'Loading agent…': '正在載入代理…',
    'Agent unavailable': '代理無法使用',
    'Requires authorization': '需要授權',
    'Your organization has removed access for this agent. Contact your administrator for more information.':
      '你的組織已移除此代理的存取權。聯絡管理員以瞭解詳情。',

    // 模式与工具权限
    'Step-by-step collaboration': '逐步協作',
    'Plan first, execute when ready': '先規劃，準備好再執行',
    'End-to-end execution without interruption': '不中斷的端對端執行',
    'Ask for permission': '徵求許可',
    'Run all tools without asking': '不經詢問即執行所有工具',
    'Switching mode...': '正在切換模式...',
    'Your mode could not be updated. Please try again.': '無法更新模式。請再試一次。',
    'Tool permissions': '工具權限',
    'Currently enforced:': '目前強制執行：',
    'Set by this session and cannot be changed here': '由此工作階段設定且無法在此變更',
    "Not allowed by this session's permission policy.": '此工作階段的權限政策不允許。',
    'Autopilot works best with fewer approvals': '自動駕駛在核准次數較少時效果最佳',
    'Continue with Always ask': '繼續使用一律詢問',
    'Change approval setting': '變更核准設定',
    'Always ask': '一律詢問',
    'Require approval for each request.': '每個請求都需要核准。',
    'Automatically approve tool requests that pass an LLM safety check. Ask otherwise.':
      '自動核准通過 LLM 安全檢查的工具請求。否則會詢問。',
    'Auto-approve all tool, path, and URL requests.': '自動核准所有工具、路徑和 URL 請求。',
    'Show the current permission status.': '顯示目前的權限狀態。',
    'Configure tool permissions': '設定工具權限',
    'Configure automatic tool approval': '設定工具自動核准',
    'Auto-approve all tool calls this session': '在此工作階段自動核准所有工具呼叫',
    'Stop auto-approving tool calls': '停止自動核准工具呼叫',
    'Show whether auto-approve is on': '顯示是否已開啟自動核准',
    'Loading tool permissions': '正在載入工具權限',
    'Tool permissions could not be loaded. Only Always ask is available.': '無法載入工具權限。只能使用一律詢問。',
    "Tool permissions: No options are available for this session, so it can't be started.":
      '工具權限：此工作階段沒有可用的選項，因此無法開始。',
    'No permitted tool permissions are available for this session.': '此工作階段沒有允許的工具權限。',
    'Disabled by your organization. Contact your administrator': '已由你的組織停用。聯絡管理員',
    'Tool permissions are not ready.': '工具權限尚未就緒。',
    'Could not change tool permissions. Try again.': '無法變更工具權限。請再試一次。',
    'Tool permissions cannot be changed for this session.': '無法變更此工作階段的工具權限。',
    'Tool permissions are not reported for this session.': '此工作階段未回報工具權限。',

    // 会话页头部与详细信息
    'Agent session header': '代理工作階段標頭',
    'Manage session': '管理工作階段',
    'Task actions': '任務動作',
    'Toggle sidebar': '切換側邊欄',
    'Rename task': '重新命名任務',
    'Edit task': '編輯任務',
    'Failed to rename. Please try again.': '重新命名失敗。請再試一次。',
    'Failed to rename task. Please try again.': '無法重新命名任務。請再試一次。',
    'Something went wrong renaming the task. Please try again.': '重新命名任務時發生錯誤。請再試一次。',
    'Session status': '工作階段狀態',
    'Session ID': '工作階段 ID',
    'Copy session ID': '複製工作階段 ID',
    'Environment ID': '環境 ID',
    'Copy environment ID': '複製環境 ID',
    'Host name': '主機名稱',
    'Copy host name': '複製主機名稱',
    'Host software': '主機軟體',
    'Active sessions': '使用中的工作階段',
    'Session spend': '工作階段費用',
    'Most recent model': '最近使用的模型',
    'Excludes turns not yet loaded': '不含尚未載入的回合',
    'Status freshness': '狀態時效',
    'AHP version': 'AHP 版本',
    'Working directory': '工作目錄',
    'Staff session details': '員工工作階段詳細資料',
    'Visible to anyone with access to this repository': '具有此儲存庫存取權的任何人都可以查看',
    'Only visible to you': '只有你可以查看',
    'Only you can see this session.': '只有你可以查看此工作階段。',
    'Remote mode enabled': '已啟用遠端模式',
    'Learn more about remote session privacy': '瞭解遠端工作階段隱私權',
    'Dismiss remote session banner': '關閉遠端工作階段橫幅',
    'Connection is active and ready to use': '連線已建立並可供使用',
    'Anything you do here will be sent to your connected terminal. This session is private to you.':
      '你在這裡的任何動作都會傳送到已連線的終端機。此工作階段僅供你使用。',
    'started a CLI session': '開始了 CLI 工作階段',
    'started a cloud session': '開始了雲端工作階段',
    'started an environment session': '開始了環境工作階段',
    'created this session': '建立了此工作階段',
    'created the session': '建立了工作階段',
    'started a task': '開始了任務',
    // <login> 發起此工作階段的管道為 <Slack> · Copilot
    'started this session via': '發起此工作階段的管道為',
    'Session started via': '工作階段的發起管道為',
    'discussion comment': '討論留言',
    'pull request comment': '拉取請求留言',
    'pull request review': '拉取請求審查',
    'scheduled trigger': '排程觸發',
    'code scanning alert': '程式碼掃描警示',
    'secret scanning alert': '機密掃描警示',
    'Dependabot alert': 'Dependabot 警示',
    'merge conflict': '合併衝突',
    'from the legacy chat': '來自舊版聊天',
    'legacy chat': '舊版聊天',
    'Failed to fetch triggering comment': '無法擷取觸發留言',
    'Failed to fetch problem statement': '無法擷取問題描述',
    'Go to pull request': '前往拉取請求',
    'View pull request': '查看拉取請求',
    'View files changed': '查看變更的檔案',
    'View changes': '查看變更',
    'View changed files': '查看變更的檔案',
    'Collapse changed files': '摺疊變更的檔案',
    'Failed to create pull request': '無法建立拉取請求',
    'Error creating pull request': '建立拉取請求時發生錯誤',
    'View verbose logs': '查看詳細記錄',
    'Copy original prompt': '複製原始提示',
    'View run': '查看執行',
    'Go to parent conversation': '前往父對話',
    'Open in GitHub Copilot App': '在 GitHub Copilot 應用程式中開啟',
    'Hide intermediate steps': '隱藏中間步驟',
    'Show key steps': '顯示關鍵步驟',
    'Show every tool call': '顯示每個工具呼叫',
    'Tool verbosity': '工具詳細程度',

    // 继续于其他客户端
    'Continue in…': '在…中繼續',
    'Continue in Copilot CLI': '在 Copilot CLI 中繼續',
    'Open in VS Code': '在 VS Code 中開啟',
    'Open in VS Code Insiders': '在 VS Code Insiders 中開啟',
    'Create a codespace': '建立程式碼空間',
    'Only session creator can resume': '只有工作階段建立者可以恢復',
    'Continue this session where it was started': '在開始此工作階段的地方繼續',
    'This session is offline': '此工作階段已離線',
    'You can view updates here. Start a new session in the cloud to work from the web.':
      '你可以在這裡查看更新。若要在網頁上工作，請在雲端開始新的工作階段。',
    'You can view updates here.': '你可以在這裡查看更新。',
    'Open this session where it was started to continue, or start a new session in the cloud.':
      '在開始此工作階段的地方開啟它以繼續，或在雲端開始新的工作階段。',
    'Open this session where it was started to continue.': '在開始此工作階段的地方開啟它以繼續。',
    'New cloud session': '新增雲端工作階段',
    'Respond to the agent prompt in your local CLI session to continue.': '在本機 CLI 工作階段中回應代理的提示以繼續。',

    // 重新连接与只读
    "We couldn't reconnect": '無法重新連線',
    "This session can't be resumed": '此工作階段無法恢復',
    'Environment authentication is unavailable': '無法使用環境身分驗證',
    'A Copilot license is required to reconnect this session': '需要 Copilot 授權才能重新連線此工作階段',
    'This session requires a newer compatible version of Copilot': '此工作階段需要較新且相容的 Copilot 版本',
    'This session is read-only': '此工作階段為唯讀',
    'The session could not finish preparing its environment': '工作階段無法完成環境準備',
    'Try connecting to this session again.': '再次嘗試連線到此工作階段。',
    'The environment it ran in is no longer available. Start a new session in the cloud.':
      '原本的執行環境已無法使用。在雲端開始新的工作階段。',
    'You can still view its history. To send messages, start a new session in the cloud.':
      '你仍可查看其歷史記錄。若要傳送訊息，請在雲端開始新的工作階段。',
    'Reopen this session after a compatible version of Copilot is available.': '有相容版本的 Copilot 後，再重新開啟此工作階段。',
    'Check that Copilot access is available, then reopen this session.': '確認可以存取 Copilot 後，再重新開啟此工作階段。',
    'This session is open in read-only mode.': '此工作階段以唯讀模式開啟。',
    'Resuming session…': '正在恢復工作階段…',
    'Reconnecting this session and catching up on its conversation.': '正在重新連線此工作階段並同步對話。',
    'The session connection was lost.': '工作階段連線已中斷。',
    'The active AHP session could not be connected.': '無法連線到使用中的 AHP 工作階段。',
    'The live conversation is unavailable. Reconnect to continue.': '即時對話無法使用。重新連線以繼續。',
    'This conversation is missing valid creation metadata. Retry to load it again.': '此對話缺少有效的建立中繼資料。重試以再次載入。',
    'Activity cannot be loaded': '無法載入活動',
    'The activity on this task is temporarily unavailable due to a system error. Try reloading the page, or if the problem persists, contact support.':
      '由於系統錯誤，此任務的活動暫時無法使用。試著重新載入頁面；如果問題持續發生，聯絡支援團隊。',
    'This task is not viewable': '無法查看此任務',
    'Unable to connect to the session': '無法連線到工作階段',
    'Environment offline': '環境已離線',
    'Environment is offline': '環境已離線',
    'Environment offline. The environment for this session is offline. Steering will resume when the host reconnects.':
      '環境已離線。此工作階段的環境已離線。主機重新連線後將恢復引導。',
    'The environment for this session is offline. Steering will resume when the host reconnects.':
      '此工作階段的環境已離線。主機重新連線後將恢復引導。',
    'First message recovery failed': '第一則訊息復原失敗',
    'Error loading session.': '載入工作階段時發生錯誤。',
    "We couldn't load the session history": '無法載入工作階段歷史記錄',
    'Loading session history…': '正在載入工作階段歷史記錄…',
    'Opening previous chat…': '正在開啟上一個聊天…',

    // 引导（steering）
    'Steering is not available for this session': '此工作階段無法使用引導',
    'Only the session owner can steer this session': '只有工作階段擁有者可以引導此工作階段',
    'Steer active session while agent is working': '在代理工作時引導目前的工作階段',
    'Steer active turn': '引導目前的回合',
    'Steering Copilot requires an active subscription': '引導 Copilot 需要有效的訂閱',
    'Steering Copilot requires an active subscription.': '引導 Copilot 需要有效的訂閱。',
    'Only the task owner can steer this session.': '只有任務擁有者可以引導此工作階段。',
    'Sessions created by organizations cannot be steered.': '無法引導由組織建立的工作階段。',
    'Only the author of the task can ask for changes.': '只有任務作者可以要求變更。',
    'Steering disabled. Contact your administrator to enable steering on local sessions.': '引導已停用。聯絡管理員為本機工作階段啟用引導。',
    'This session has been archived': '此工作階段已封存',
    'This session has been archived.': '此工作階段已封存。',
    'You do not have write permission on the repository': '你沒有此儲存庫的寫入權限',
    'This pull request was merged. Start a new session to continue iterating.': '此拉取請求已合併。開始新的工作階段以繼續迭代。',
    'This pull request was merged. To continue iterating,': '此拉取請求已合併。若要繼續迭代，請',
    'start a new session': '開始新的工作階段',
    'This pull request was closed. To continue iterating, reopen the pull request.': '此拉取請求已關閉。若要繼續迭代，請重新開啟拉取請求。',
    'This pending prompt has expired. Start a new task to continue.': '此待處理的提示已過期。開始新任務以繼續。',
    'Send a message to the CLI session...': '傳送訊息到 CLI 工作階段...',
    'Failed to submit latest message': '無法送出最新訊息',
    'Failed to submit command. Please try again.': '無法送出命令。請再試一次。',
    'upgrade your plan': '升級方案',
    'Upgrade your plan': '升級方案',

    // 排队的消息
    'Queued messages': '佇列中的訊息',
    'Message queued': '訊息已排入佇列',
    'Message queued. It will be sent after the current response finishes.': '訊息已排入佇列。將在目前的回應完成後傳送。',
    'Queued message removed.': '已移除佇列中的訊息。',
    'Queued message sent now.': '已立即傳送佇列中的訊息。',
    'Queued message could not be removed.': '無法移除佇列中的訊息。',
    'Queued message could not be sent now.': '無法立即傳送佇列中的訊息。',
    'Queued in saved history.': '已在儲存的歷史記錄中排入佇列。',
    'Queued message waiting for agent': '佇列中的訊息正在等待代理',
    'Remove from queue': '從佇列中移除',
    'Removing queued message': '正在移除佇列中的訊息',
    'Sending queued message now': '正在立即傳送佇列中的訊息',
    'The message was sent now, but could not be removed from the queue. It may be delivered twice.':
      '訊息已立即傳送，但無法從佇列中移除。可能會重複傳送。',
    'Queued for Copilot': '已排入佇列等候 Copilot',
    'Message with attachments': '含附件的訊息',
    'Steering message': '引導訊息',
    'Steering message waiting for agent': '引導訊息正在等待代理',

    // 分享
    'Share session': '分享工作階段',
    'Session shared': '已分享工作階段',
    'Session sharing': '工作階段分享',
    'Sharing settings': '分享設定',
    'This session is private': '此工作階段不公開',
    'This session is visible to anyone with access to this repository who has the link.':
      '具有此儲存庫存取權且取得連結的任何人都可以查看此工作階段。',
    'When shared, this session and future messages will be visible to anyone with repository access as view only.':
      '分享後，具有儲存庫存取權的任何人都能以唯讀方式查看此工作階段和後續訊息。',
    'Sharing session...': '正在分享工作階段...',
    'Unsharing session...': '正在取消分享工作階段...',
    'Failed to share session. Please try again.': '無法分享工作階段。請再試一次。',
    'Failed to unshare session. Please try again.': '無法取消分享工作階段。請再試一次。',
    'View shared session (opens in a new tab)': '查看分享的工作階段（在新分頁中開啟）',
    'Your session has expired. Sign in again to change sharing settings.': '你的工作階段已過期。重新登入以變更分享設定。',
    "You don't have permission to access this session's sharing settings.": '你沒有權限存取此工作階段的分享設定。',
    'This session could not be found or you no longer have access to it.': '找不到此工作階段，或你已無權存取。',
    'Invalid usage. Use /share, /share link, or /share off.': '用法無效。使用 /share、/share link 或 /share off。',
    'You must be signed in to share a session.': '必須登入才能分享工作階段。',
    'Session sharing is not available.': '無法使用工作階段分享。',
    'This session is not attached to a web task and cannot be shared here.': '此工作階段未附加到網頁任務，無法在這裡分享。',
    'Could not load session sharing settings. Please try again.': '無法載入工作階段分享設定。請再試一次。',
    'Could not change session sharing settings. Please try again.': '無法變更工作階段分享設定。請再試一次。',
    'Session sharing turned off.': '已關閉工作階段分享。',
    'Session shared with repository readers.': '已與具儲存庫讀取權限的使用者分享工作階段。',
    'Only the task owner can change session sharing settings.': '只有任務擁有者可以變更工作階段分享設定。',
    'Sharing requires a session attached to a repository.': '工作階段必須附加到儲存庫才能分享。',
    'Sharing settings cannot be changed for this session.': '無法變更此工作階段的分享設定。',

    // 固定、存档、删除
    'Pin session': '釘選工作階段',
    'Unpin session': '取消釘選工作階段',
    'Session pinned.': '已釘選工作階段。',
    'Session unpinned.': '已取消釘選工作階段。',
    'Loading pinned sessions.': '正在載入已釘選的工作階段。',
    'Couldn’t update pinned session': '無法更新已釘選的工作階段',
    'Couldn’t update the pinned session. Please try again.': '無法更新已釘選的工作階段。請再試一次。',
    'You can pin up to 20 sessions. Unpin a session before pinning another.':
      '最多可釘選 20 個工作階段。先取消釘選一個工作階段，再釘選其他工作階段。',
    'This session is no longer available to pin. It may have been deleted or you may have lost access.':
      '此工作階段已無法釘選。可能已刪除，或你已失去存取權。',
    'Archive only': '僅封存',
    'Archive and close': '封存並關閉',
    // 存档确认：Copilot 页由行内句整句翻译（见 inline），其他页面按片段：……在我的工作階段頁面的 <已完成> 分頁中找到並還原它。
    'This session will be removed from your active sessions. You can find and restore it anytime from the':
      '此工作階段將從你使用中的工作階段移除。你可以隨時在我的工作階段頁面的',
    'This session has an open pull request. Would you like to close it? You can find and restore this session anytime from the':
      '此工作階段有一個開放中的拉取請求。要關閉它嗎？你可以隨時在我的工作階段頁面的',
    'tab in My sessions.': '分頁中找到並還原它。',
    'Failed to archive the session. Please try again.': '無法封存工作階段。請再試一次。',
    'The session was archived, but the pull request could not be closed. Please close it manually.':
      '工作階段已封存，但無法關閉拉取請求。請手動關閉。',
    'The session was unarchived, but the pull request could not be reopened. Please reopen it manually.':
      '工作階段已取消封存，但無法重新開啟拉取請求。請手動重新開啟。',
    'Failed to unarchive the session. Please try again.': '無法取消封存工作階段。請再試一次。',
    'Delete session': '刪除工作階段',
    'Are you sure you want to delete this session? This action cannot be undone.': '確定要刪除此工作階段嗎？此動作無法復原。',
    'Failed to delete session. Please try again.': '無法刪除工作階段。請再試一次。',

    // 分配给代理
    'Assign to Agent': '指派給代理',
    'Target repository': '目標儲存庫',
    'Base branch': '基底分支',
    'Optional prompt': '選填提示',
    'Select base branch': '選擇基底分支',
    // 输入框占位文字（原文无冒号）
    'Optionally provide additional context for the agent, like constraints, priorities, or areas to avoid':
      '可為代理提供額外的上下文，例如限制條件、優先順序或要避開的部分',
    'A new branch will be created based on the selected branch': '將以選取的分支為基礎建立新分支',
    'The agent will use the issue description, comments, and any additional prompt you provide to get started. Select a custom agent for specialized tasks.':
      '代理會根據議題描述、留言和你提供的任何額外提示開始工作。針對專門任務，選擇自訂代理。',
    "You're assigning the agent to perform work in a different organization. The issue description will be visible to users outside this repository.":
      '你正在指派代理到其他組織中工作。此儲存庫以外的使用者將可看見議題描述。',
    "You're assigning the agent to perform work in a public repository. The issue description will be visible to users outside this repository.":
      '你正在指派代理到公開儲存庫中工作。此儲存庫以外的使用者將可看見議題描述。',
    "The selected repo has no commits or branches so there's no valid base branch to create a PR against.":
      '選取的儲存庫沒有任何提交或分支，因此沒有可用來建立 PR 的有效基底分支。',
    'Insufficient quota. Assignment is temporarily unavailable until additional usage is available.':
      '配額不足。取得額外使用量之前，暫時無法指派。',

    // 授权
    'Authorization required': '需要授權',
    Authenticate: '驗證身分',
    'Authorizing…': '授權中…',
    'to complete authentication, then returned here.': '以完成身分驗證，之後會返回這裡。',

    // Copilot 设置：dotfiles、存储库访问、第三方代理
    'Failed to save changes': '無法儲存變更',
    'Repository access': '儲存庫存取權',
    'Failed to update third-party agent settings, please try again later.': '無法更新第三方代理設定，請稍後再試。',
    "Agent installation is blocked because the partner agent's app is already installed":
      '已安裝合作夥伴代理的應用程式，因此無法安裝此代理',
    'Learn more about Claude on GitHub': '瞭解 GitHub 上的 Claude',
    'Learn more about Codex on GitHub': '瞭解 GitHub 上的 Codex',
    'Using this alongside the Claude app may cause conflicts or confusion. Since both use "@Claude" for mentions, enabling both may lead to mixed or incorrect responses.':
      '與 Claude 應用程式同時使用可能會造成衝突或混淆。由於兩者都使用「@Claude」提及，同時啟用可能會導致回應混雜或錯誤。',
    'Using this alongside the chatgpt-codex-connector app may cause conflicts or confusion. Since both use “@Codex” mentions, enabling both may lead to mixed or incorrect responses.':
      '與 chatgpt-codex-connector 應用程式同時使用可能會造成衝突或混淆。由於兩者都使用「@Codex」提及，同時啟用可能會導致回應混雜或錯誤。',

    // 后台云端会话（聊天中的工具）
    'Start a cloud session': '開始雲端工作階段',
    'Start a cloud agent session?': '要開始雲端代理工作階段嗎？',
    'Start session': '開始工作階段',
    'Started a cloud agent session': '已開始雲端代理工作階段',
    'Failed to start a session': '無法開始工作階段',
    'Did not start a session': '未開始工作階段',
    'Open a session': '開啟工作階段',
    'Opened the session': '已開啟工作階段',
    'Failed to open the session': '無法開啟工作階段',
    'List sessions': '列出工作階段',
    'Listed 1 session': '已列出 1 個工作階段',
    'Failed to list sessions': '無法列出工作階段',

    // 文件附件
    'File diff': '檔案差異',
    'Code snippet': '程式碼片段',
    'Workflow job': '工作流程作業',
    'Issue (not planned)': '議題（不予處理）',
    'Filter views': '篩選檢視',
    'Filter views (filters applied)': '篩選檢視（已套用篩選器）',
    'Reset filters': '重設篩選器',
    'Collapse question': '摺疊問題',
    'Expand question': '展開問題',
    'Shell mode disabled': 'Shell 模式已停用',
    'Shell mode enabled': 'Shell 模式已啟用',
    'Enter shell command': '輸入 shell 命令',
    'Shell command': 'Shell 命令',

    // Chronicle 命令
    'Chronicle command suggestions': 'Chronicle 命令建議',
    'View session history and activity': '查看工作階段歷史記錄和活動',
    'Get a report on your work from the last day': '取得過去一天的工作報告',
    'Search all session content by keyword or topic': '依關鍵字或主題搜尋所有工作階段內容',
    'Get personalized tips based on usage patterns': '根據使用模式取得個人化建議',
    'Get personalized tips to reduce token usage and cost': '取得降低權杖使用量和費用的個人化建議',
    'Suggest improvements to copilot-instructions.md': '為 copilot-instructions.md 提出改進建議',

    // 调试日志
    'View debug log': '查看偵錯記錄',
    'Debug log': '偵錯記錄',
    'Debug output': '偵錯輸出',
    'No debug events captured yet.': '尚未擷取任何偵錯事件。',
    'Download logs': '下載記錄',
    'Debug log copied to the clipboard.': '已將偵錯記錄複製到剪貼簿。',
    'Could not copy the debug log.': '無法複製偵錯記錄。',
    'Debug log downloaded.': '已下載偵錯記錄。',
    'Could not download the debug log.': '無法下載偵錯記錄。',
    'Bug report created.': '已建立錯誤回報。',
    'Could not create the bug report.': '無法建立錯誤回報。',
    'Copy this session’s debug log to the clipboard': '將此工作階段的偵錯記錄複製到剪貼簿',
    'Collect this session’s debug logs': '收集此工作階段的偵錯記錄',
    'Report a bug — the argument becomes the issue title': '回報錯誤——引數會成為議題標題',
    'Download the debug log archive': '下載偵錯記錄封存檔',
    'Add a bug title after /report-bug.': '在 /report-bug 後加上錯誤標題。',

    // 引导提示
    'Close tour': '關閉導覽',
    'Could not save your dismissal.': '無法儲存關閉狀態。'
  },
  scoped: {
    // 会话状态与筛选
    Done: '已完成',
    Failed: '失敗',
    Cancelled: '已取消',
    'Timed out': '已逾時',
    'Ready for review': '可供審查',
    Unsuccessful: '未成功',
    'Queued to merge': '已排入合併佇列',
    Running: '執行中',
    Finished: '已完成',
    Connecting: '連線中',
    Connected: '已連線',
    Disconnected: '已中斷連線',
    Unavailable: '無法使用',
    Online: '線上',
    Degraded: '已降級',
    Waking: '喚醒中',
    Draining: '排空中',
    Resuming: '恢復中',
    // 选择器
    Personal: '個人',
    Cloud: '雲端',
    Remote: '遠端',
    NEW: '新',
    Unsupported: '不支援',
    Automation: '自動化',
    Mode: '模式',
    Interactive: '互動式',
    Autopilot: '自動駕駛',
    Assisted: '輔助',
    'Allow all': '全部允許',
    Minimal: '精簡',
    Balanced: '平衡',
    Detailed: '詳細',
    Shared: '已分享',
    Tokens: '權杖',
    Context: '上下文',
    Sessions: '工作階段',
    Folder: '資料夾',
    Choices: '選項',
    Background: '背景',
    Step: '步驟',
    Finish: '完成'
  },
  regexp: [
    // 范围、存储库、分支、环境（composerRule：首页输入框沿用）
    composerRule([/^Personal \(([\w.-]+)\)$/, '個人 ($1)']),
    composerRule([/^Select conversation scope, current: (.+)$/, (_, value: string) => `選擇對話範圍，目前：${pickerValue(value)}`]),
    [/^(\d+) owners?$/, '$1 位擁有者'],
    [/^(\d+) repositor(?:y|ies)$/, '$1 個儲存庫'],
    composerRule([
      /^Repositories in @([\w.-]+)( and public repositories)?$/,
      (_, owner: string, more: string) => `@${owner} 中的儲存庫${more ? '和公開儲存庫' : ''}`
    ]),
    composerRule([
      /^Repositories are limited to (.+)\. Change the Chat scope to work in another owner['’]s repositories\.$/,
      (_, owner: string) =>
        `儲存庫僅限於${owner === 'your personal account' ? '你的個人帳號' : ` ${owner}`}。變更聊天範圍以在其他擁有者的儲存庫中工作。`
    ]),
    composerRule([/^Cloud sessions are disabled for ([\w.-]+)$/, '$1 已停用雲端工作階段']),
    [/^Private repository selection is restricted to ([\w.-]+)\.$/, '只能從 $1 選擇私人儲存庫。'],
    composerRule([/^Repository: (.+)$/, (_, value: string) => `儲存庫：${pickerValue(value)}`]),
    composerRule([/^Branch: (.+)$/, (_, value: string) => `分支：${pickerValue(value)}`]),
    composerRule([/^Remove ([\w.-]+\/[\w.-]+)$/, '移除 $1']),
    composerRule([
      /^Environment: (.+?)(?: \((.+)\))?$/,
      (_, name: string, status: string) => `環境：${name === 'Cloud' ? '雲端' : name}${status ? paren(ENV_STATUS[status] ?? status) : ''}`
    ]),
    [/^Environment status: (.+)$/, (_, status: string) => `環境狀態：${ENV_STATUS[status] ?? status}`],
    [/^(.+) environment details$/, '$1 環境詳細資料'],
    composerRule([/^Chat \((.+)\)$/, (_, owner: string) => `聊天${paren(pickerValue(owner))}`]),
    composerRule([/^Mode: Chat \((.+)\)$/, (_, owner: string) => `模式：聊天${paren(pickerValue(owner))}`]),
    composerRule([
      /^Space: (.+)$/,
      (_, name: string) => `空間：${name === 'Resolving…' ? '解析中…' : name === 'No space' ? '無空間' : name}`
    ]),
    composerRule([/^Resolving space: (.+)$/, '正在解析空間：$1']),
    composerRule([/^Space selected: (.+)$/, '已選擇空間：$1']),

    // 代理与模式
    composerRule([/^(Agent|Custom agent): (.+)$/, (_, kind: string, name: string) => `${kind === 'Agent' ? '代理' : '自訂代理'}：${name}`]),
    composerRule([/^Mode: (.+)$/, (_, mode: string) => `模式：${pickerValue(mode)}`]),
    composerRule([
      /^Select (CLI agent|MCP permission) mode, current: (.+)$/,
      (_, kind: string, mode: string) => `選擇${kind === 'CLI agent' ? ' CLI 代理' : ' MCP 權限'}模式，目前：${pickerValue(mode)}`
    ]),
    [/^Tool permissions (?:are )?set to “(.+)”\.$/, (_, mode: string) => `工具權限已設為「${pickerValue(mode)}」。`],
    composerRule([
      /^Tool permissions: "(.+)" isn['’]t available for this session\. Choose an available option to continue\.$/,
      (_, mode: string) => `工具權限：「${pickerValue(mode)}」不適用於此工作階段。選擇可用的選項以繼續。`
    ]),
    [/^Log verbosity: (Minimal|Balanced|Detailed)$/, (_, level: string) => `記錄詳細程度：${VERBOSITY[level] ?? level}`],
    [/^Information about the (.+) agent$/, '關於 $1 代理的資訊'],
    [
      new RegExp(`^(${AGENT_NAME}) requires authorization( first\\.)?$`),
      (_, agent: string, first: string) => `${agent} 需要${first ? '先' : ''}授權${first ? '。' : ''}`
    ],
    [/^Couldn['’]t start authorization for (.+)\. Please try again\.$/, '無法開始 $1 的授權。請再試一次。'],

    // 任务与分配
    [/^Creating task in ([\w.-]+\/[\w.-]+)$/, '正在 $1 中建立任務'],
    [/^New agent (?:session|task) in ([\w.-]+\/[\w.-]+)$/, '在 $1 中新增代理工作階段'],
    ...TASK_FAILURE_RULES.map(composerRule),
    // 任务创建失败的读屏播报：Task creation failed. + 横幅说明
    [/^Task creation failed\. (.+)$/, (_, description: string) => `任務建立失敗。${translateTaskFailure(description)}`],
    [/^Assign (\d+) issues to (.+)$/, '將 $1 個議題指派給 $2'],
    [/^Assign (.+) to issue$/, '將 $1 指派給議題'],
    [/^Assignment failed for #(\d+)$/, '#$1 指派失敗'],
    [/^Assignment failed for #(\d+) and #(\d+)$/, '#$1 和 #$2 指派失敗'],
    [/^Assignment failed for #(\d+), #(\d+) and (\d+) others?$/, '#$1、#$2 和其他 $3 個議題指派失敗'],
    [
      /^Instructions must be ([\d,]+) characters or fewer\. Current length: ([\d,]+) characters\.$/,
      '指示不得超過 $1 個字元。目前長度：$2 個字元。'
    ],
    [
      /^Choose which repositories (.+) should be enabled in\. (.+) will only be available where it is enabled for the repository and in the Copilot license policies\.$/,
      '選擇要在哪些儲存庫中啟用 $1。只有在儲存庫已啟用且 Copilot 授權政策允許時，$2 才可使用。'
    ],

    // 会话状态与操作
    [new RegExp(`^(${AGENT_NAME}) is working…$`), '$1 正在工作…'],
    [new RegExp(`^(${AGENT_NAME})['’]s work was cancelled$`), '$1 的工作已取消'],
    [new RegExp(`^(${AGENT_NAME}) stopped work due to an error$`), '$1 因發生錯誤而停止工作'],
    [new RegExp(`^(${AGENT_NAME}) timed out$`), '$1 已逾時'],
    [
      /^Only (.+) can steer this session$/,
      (_, who: string) => `只有${who === 'the session owner' ? '工作階段擁有者' : ` ${who} `}可以引導此工作階段`
    ],
    [/^Wait until the session is complete before steering (.+) sessions$/, '等待工作階段完成後再引導 $1 工作階段'],
    [/^This session is steered from (.+)$/, '此工作階段由 $1 引導'],
    [/^Continue the conversation in the originating (.+) channel\.$/, '在原始的 $1 頻道中繼續對話。'],
    [
      /^You can['’]t view this task because you do not have any active sessions( for this pull request)?\.$/,
      (_, forPull: string) => `你無法查看此任務，因為你${forPull ? '在此拉取請求中' : ''}沒有任何使用中的工作階段。`
    ],
    [/^Remote (.+) session$/, '遠端 $1 工作階段'],
    [/^(.+) session \(read only\)$/, '$1 工作階段（唯讀）'],
    [/^(.+?)(?: —)? session details$/, '$1 工作階段詳細資料'],
    [/^Copy branch name (.+)$/, '複製分支名稱 $1'],
    [/^Context window (.+) used$/, '已使用上下文視窗的 $1'],
    [/^([\d.]+[kM]?) cached$/, '$1 已快取'],
    [/^([\d.]+[kM]?) reasoning$/, '$1 推理'],
    [/^View PR #(\d+)$/, '查看 PR #$1'],
    [/^(\d+) of (\d+)$/, '$1/$2'],
    [/^(\d+) results?$/, '$1 項結果'],
    [/^(\d+) messages queued$/, '$1 則訊息已排入佇列'],
    [
      /^(\d+) messages queued\. They will be sent after the current response finishes\.$/,
      '$1 則訊息已排入佇列。將在目前的回應完成後傳送。'
    ],
    [/^Queued message removed: (.+)\.$/, '已移除佇列中的訊息：$1。'],
    [/^(\d+) queued messages removed\.$/, '已移除 $1 則佇列中的訊息。'],
    [/^(\d+) queued messages sent now\.$/, '已立即傳送 $1 則佇列中的訊息。'],
    [/^(\d+) recent sessions? available for the attached context$/, '附加的上下文有 $1 個最近的工作階段可用'],
    [/^Listed (\d+) sessions$/, '已列出 $1 個工作階段'],
    [
      /^Copilot will start a background cloud agent session on ([\w.-]+\/[\w.-]+)( and open a pull request)?\. It works independently of this chat\.$/,
      (_, repo: string, pull: string) =>
        `Copilot 將在 ${repo} 上開始背景雲端代理工作階段${pull ? '並建立拉取請求' : ''}。它會獨立於此聊天運作。`
    ],
    // 代码审查会话的标题：Review of <拉取请求标题>
    [/^Review of (.+)$/, '審查 $1'],
    // 步骤计数（引导弹窗页脚 Step 1 of 3，句末可带句点）：与 repo-settings 的“步驟 N/M”一致
    [/^Step (\d+) of (\d+)(\.?)$/, (_, step: string, total: string, period: string) => `步驟 ${step}/${total}${period ? '。' : ''}`],
    [/^View debug log \((\d+) events?\)$/, '查看偵錯記錄（$1 個事件）'],
    [/^Request failed with status (\d+)(\.)?$/, (_, status: string, period = '') => `請求以狀態碼 ${status} 失敗${period ? '。' : ''}`],
    [
      /^Unknown \/collect-debug-logs option “(.+)”\. Try \/collect-debug-logs download\.$/,
      '未知的 /collect-debug-logs 選項「$1」。試試 /collect-debug-logs download。'
    ],
    [
      /^(\S+) needs a repository, and this session doesn['’]t have one\. Start a session from a repository to use it\.$/,
      '$1 需要儲存庫，但此工作階段沒有儲存庫。從儲存庫開始工作階段後再使用。'
    ],
    [/^issue #(\d+)$/, '議題 #$1'],
    [/^pull request #(\d+)$/, '拉取請求 #$1'],
    [/^discussion #(\d+)$/, '討論 #$1'],

    // 附件
    [/^Uploading (.+)$/, '正在上傳 $1'],
    [/^Upload of (.+) failed: (.+)$/, '$1 上傳失敗：$2'],
    [/^Upload failed: (.+)$/, '上傳失敗：$1'],
    [/^Retry upload of (.+)$/, '重試上傳 $1'],
    composerRule([/^Image: (.+)$/, '圖片：$1']),
    composerRule([/^Image limit reached \((\d+)\)$/, '已達圖片上限 ($1)']),
    composerRule([/^You can attach up to (\d+) images per task$/, '每項任務最多可附加 $1 張圖片']),
    composerRule([
      /^(\d+) files could not be attached: (.+)\. Text and PDF files must be (.+) or smaller, and you can attach up to (\d+) text, PDF, or image files at a time\.$/,
      '$1 個檔案無法附加：$2。文字和 PDF 檔案不得超過 $3，且一次最多可附加 $4 個文字、PDF 或圖片檔案。'
    ]),
    composerRule([
      /^(.+) could not be attached\. Text and PDF files must be (.+) or smaller, and you can attach up to (\d+) text, PDF, or image files at a time\.$/,
      '無法附加 $1。文字和 PDF 檔案不得超過 $2，且一次最多可附加 $3 個文字、PDF 或圖片檔案。'
    ])
  ],
  // 存档确认对话框（agent-sessions 的 ArchiveConfirmationDialog，正文是 Primer Dialog.Body 的直接子节点）：
  // 仅存档为“文字、{' '} 空格、<strong>Completed</strong>、文字”，有打开的拉取请求时空格在第一段文字末尾。
  // 标签页名由 <strong> 突出，原文无引号，整句翻译后中文之间不留空格
  inline: [
    [
      'This session will be removed from your active sessions. You can find and restore it anytime from the {} tab in My sessions.',
      '此工作階段將從你使用中的工作階段移除。你可以隨時在我的工作階段頁面的{}分頁中找到並還原它。'
    ],
    [
      'This session has an open pull request. Would you like to close it? You can find and restore this session anytime from the {} tab in My sessions.',
      '此工作階段有一個開放中的拉取請求。要關閉它嗎？你可以隨時在我的工作階段頁面的{}分頁中找到並還原此工作階段。'
    ]
  ]
} satisfies PageDictionary
