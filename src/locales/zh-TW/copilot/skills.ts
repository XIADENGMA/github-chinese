import type { PageDictionary, RegExpRule } from '../../../core/types'
import { joinCjk } from '../helpers'

/** 技能执行中的动作（“An error occurred while …”的后半句）；译文都以中文结尾，后接「時發生錯誤」不必补空格 */
const ACTIVE_SKILL: Readonly<Record<string, string>> = {
  'searching Bing': '使用 Bing 搜尋',
  'searching the codebase': '搜尋程式碼庫',
  'getting alert': '取得警示',
  'getting data': '取得資料',
  'getting job logs': '取得作業記錄',
  'getting discussion': '取得討論',
  'searching for file': '搜尋檔案',
  'searching for file changes': '搜尋檔案變更',
  'searching for support documents': '搜尋支援文件',
  'analyzing Figma file': '分析 Figma 檔案',
}

/** 日志对象名词 */
const LOG_NOUN: Readonly<Record<string, string>> = {
  job: '作業',
  'workflow run': '工作流程執行',
  'pull request': '拉取請求',
  workflow: '工作流程',
}

/** 粘贴内容的展开 / 折叠 / 删除 */
const PASTED_ACTION: Readonly<Record<string, string>> = {
  Expand: '展開',
  Collapse: '摺疊',
  Remove: '移除',
}

/** 日志对象：job 123 / workflow run 456 / pull request 7 / workflow ci.yml */
function logTopic(topic: string): string {
  const match = /^(job|workflow run|pull request|workflow) (.+)$/.exec(topic)
  if (!match) return topic
  return `${LOG_NOUN[match[1]!] ?? match[1]} ${match[2]}`
}

const ACTIVE_SKILL_SOURCE = Object.keys(ACTIVE_SKILL).join('|')

/** 首页 Copilot 输入框（dashboard/composer）沿用的规则：粘贴代码块的读屏播报，展开在本词典的规则列表末尾，两处引用同一份 */
export const COMPOSER_SHARED_RULES: readonly RegExpRule[] = [
  [/^(?:Code block|Block) (?:pasted|added), (\d+) total$/, '已新增程式碼區塊，共 $1 個'],
  [/^(?:Code block|Block) removed, (\d+) (?:left|remaining)$/, '已移除程式碼區塊，剩餘 $1 個'],
]

/**
 * Copilot 聊天的技能 / 工具调用状态（网页搜索、代码搜索、获取文件、作业日志、GitHub API、起草议题等）、
 * 接口错误提示，以及停靠聊天面板按页面给出的推荐问题。
 */
export default {
  static: {
    // 技能状态
    'An error occurred when searching the web': '搜尋網頁時發生錯誤',
    'An error occurred when searching code': '搜尋程式碼時發生錯誤',
    'An error occurred when finding a file': '尋找檔案時發生錯誤',
    'An error occurred when finding the file changes': '尋找檔案變更時發生錯誤',
    'An error occurred when fetching alert information': '擷取警示資訊時發生錯誤',
    'An error occurred when fetching discussion': '擷取討論時發生錯誤',
    'An error occurred when fetching a commit': '擷取提交時發生錯誤',
    'An error occurred when fetching data from the GitHub API': '從 GitHub API 擷取資料時發生錯誤',
    'An error occurred when searching support documents': '搜尋支援文件時發生錯誤',
    // 未知技能时逐段翻译：執行以下動作時發生錯誤 <技能動作>
    'An error occurred while': '執行以下動作時發生錯誤',
    'Get file': '取得檔案',
    'Get file changes': '取得檔案變更',
    'Get alert information': '取得警示資訊',
    'Fetching alert information': '正在擷取警示資訊',
    'Unable to fetch alert information': '無法擷取警示資訊',
    'Using alert information': '正在使用警示資訊',
    'Get discussion': '取得討論',
    'Get job logs': '取得作業記錄',
    'Coming up with a plan': '正在擬定計畫',
    'Try modifying your query by reframing your question.': '試著換個方式提問。',
    'API endpoint returned results successfully': 'API 端點已成功傳回結果',
    'API results': 'API 結果',
    'Information on using Copilot in GitHub Support': '在 GitHub 支援中使用 Copilot 的資訊',
    'Support Search': '支援搜尋',
    'Support search': '支援搜尋',
    'Retrieving information about alerts': '正在檢索警示資訊',
    'Including information about alerts': '正在納入警示資訊',
    'Searching for file': '正在搜尋檔案',
    'Using results of get file': '正在使用取得檔案的結果',
    'Searching for file changes': '正在搜尋檔案變更',
    'Planning response...': '正在規劃回應...',
    'Planning response…': '正在規劃回應…',
    'Plan created': '計畫已建立',
    'Searching for support documents': '正在搜尋支援文件',
    'Using results of support search': '正在使用支援搜尋的結果',
    'Analyzing Figma file': '正在分析 Figma 檔案',
    'Using results of Figma file': '正在使用 Figma 檔案的結果',
    'Using the code search agent': '正在使用程式碼搜尋代理',
    'Using results of code search agent': '正在使用程式碼搜尋代理的結果',
    'Drafting update': '正在草擬更新',
    'Drafted update': '已草擬更新',
    'Drafting issue': '正在草擬議題',
    'Drafted issue': '已草擬議題',
    'Fetching issues': '正在擷取議題',
    'Fetching issue': '正在擷取議題',
    'Fetched issues': '已擷取議題',
    'Fetched issue': '已擷取議題',
    'Gathering what I need...': '正在收集所需資訊...',
    'Gathered additional information': '已收集更多資訊',
    'Gathering agent logs...': '正在收集代理記錄...',
    'Gathered agent logs': '已收集代理記錄',
    'Searching agent sessions...': '正在搜尋代理工作階段...',
    'Searched agent sessions': '已搜尋代理工作階段',
    'Searching GitHub': '正在搜尋 GitHub',
    'Searched GitHub': '已搜尋 GitHub',
    'GitHub search failed': 'GitHub 搜尋失敗',
    'No result details returned.': '未傳回結果詳細資料。',
    'Search warnings': '搜尋警告',
    'searching Bing': '使用 Bing 搜尋',
    'searching the codebase': '搜尋程式碼庫',
    'getting alert': '取得警示',
    'getting data': '取得資料',
    'getting job logs': '取得作業記錄',
    'getting discussion': '取得討論',
    'searching for file': '搜尋檔案',
    'searching for file changes': '搜尋檔案變更',
    'searching for support documents': '搜尋支援文件',
    'analyzing Figma file': '分析 Figma 檔案',
    'Mona and Copilot flying a Hubot-themed spaceship': 'Mona 和 Copilot 駕駛著 Hubot 主題的太空船',
    'Copilot badge': 'Copilot 徽章',
    'First, create a new draft issue. Then ask for additional information to fill out the issue.':
      '首先，建立新的草稿議題。然後詢問補充資訊以補齊議題內容。',
    'First, create an issue with sub issues. Then ask for additional information to fill out these issues.':
      '首先，建立含有子議題的議題。然後詢問補充資訊以補齊這些議題的內容。',

    // 接口错误
    'This message could not be processed.': '無法處理此訊息。',
    'You’re not authorized to use Copilot.': '你未獲授權使用 Copilot。',
    "You're not authorized to use Copilot.": '你未獲授權使用 Copilot。',
    'Your usage quota has been exceeded. Please wait for your quota to reset or upgrade your plan.':
      '已超過使用量配額。請等待配額重設或升級方案。',
    'Access denied. You do not have permission to view this. For more on scraping GitHub and how it may affect your rights, please review our Terms of Service (https://docs.github.com/en/site-policy/github-terms/github-terms-of-service)':
      '存取遭拒。你沒有查看此內容的權限。如需瞭解抓取 GitHub 資料的詳細資訊，以及這可能對你的權利造成什麼影響，請參閱我們的服務條款 (https://docs.github.com/en/site-policy/github-terms/github-terms-of-service)',
    'GitHub API rate limit exceeded. Please wait and try again. For more on scraping GitHub and how it may affect your rights, please review our Terms of Service (https://docs.github.com/en/site-policy/github-terms/github-terms-of-service)':
      '已超過 GitHub API 速率限制。請稍候再試。如需瞭解抓取 GitHub 資料的詳細資訊，以及這可能對你的權利造成什麼影響，請參閱我們的服務條款 (https://docs.github.com/en/site-policy/github-terms/github-terms-of-service)',
    'Resource not found. Please try again.': '找不到資源。請再試一次。',
    'Your network connection was interrupted. Please try again.': '網路連線已中斷。請再試一次。',
    'Message too large. Please shorten it or remove some references and try again.':
      '訊息過大。請縮短內容或移除部分參考後再試一次。',
    'Copilot extensions can’t be used in shared conversations. Please unshare the conversation and try again.':
      '分享的對話中無法使用 Copilot 擴充功能。請取消分享對話後再試一次。',
    "I'm sorry but there was an error. Please try again.": '很抱歉，發生錯誤。請再試一次。',

    // 推荐问题：标题
    'What can I ask': '我可以問什麼',
    'What does this do': '這有什麼作用',
    'About this repo': '關於此儲存庫',
    Summarize: '摘要',
    'Main points': '重點',
    Explain: '說明',
    Improve: '改進',
    'What it does': '作用',
    'Explain changes': '說明變更',
    'User comments': '使用者留言',
    'Key decisions': '關鍵決策',
    'Repo overview': '儲存庫總覽',
    'Performance issues': '效能問題',
    'Recent PRs': '最近的 PR',
    'Summarize changes': '摘要變更',
    'Help me review': '幫我審查',
    'Identify risks': '找出風險',
    'Create PR': '建立 PR',
    'Walk me through': '逐步說明',
    'File structure': '檔案結構',
    'Ask questions': '提問',
    'Unresolved feedback': '未解決的意見回饋',
    // 沉浸式聊天首页的推荐任务：分类与示例
    'Write code': '撰寫程式碼',
    'Profile README': '個人檔案讀我檔案',
    'Simple calculator': '簡易計算機',
    'Pong game': 'Pong 遊戲',
    'Mermaid architecture overview': 'Mermaid 架構總覽',
    'Create a profile README': '建立個人檔案讀我檔案',
    'Generate a simple calculator': '產生簡易計算機',
    'Make a Pong game': '製作 Pong 遊戲',
    'Design a Mermaid architecture overview': '設計 Mermaid 架構總覽',
    'My open pull requests': '我開放中的拉取請求',
    'Summarize my latest PR': '摘要我最新的 PR',
    'Issues assigned to me': '指派給我的議題',
    'Create a new issue': '建立新議題',
    'Summarize my latest issue': '摘要我最新的議題',
    'Basic Git commands': 'Git 基本命令',
    'Git branching': 'Git 分支',
    'Advanced Git commands': 'Git 進階命令',

    // 推荐问题：内容
    'What questions can I ask?': '我可以問哪些問題？',
    'What does this repository do?': '這個儲存庫有什麼用途？',
    'How should I get started exploring this repo?': '我該如何開始探索這個儲存庫？',
    'Can you tell me about this repository?': '可以介紹一下這個儲存庫嗎？',
    'Summarize this issue.': '摘要此議題。',
    'What are the main points being discussed here?': '這裡討論的重點是什麼？',
    'Suggest next steps for this issue.': '建議此議題的後續步驟。',
    'Summarize this alert.': '摘要此警示。',
    'Explain this file.': '說明此檔案。',
    'Summarize this file for me.': '幫我摘要此檔案。',
    'How can I improve this file?': '如何改進此檔案？',
    'Explain this code.': '說明這段程式碼。',
    'How can I improve this code?': '如何改進這段程式碼？',
    'What does this code do?': '這段程式碼有什麼作用？',
    'Explain these changes.': '說明這些變更。',
    'What does this diff do?': '這個差異有什麼作用？',
    'Summarize the changes in this file.': '摘要此檔案中的變更。',
    'Summarize this pull request.': '摘要此拉取請求。',
    'What commits are included in this PR?': '此 PR 包含哪些提交？',
    'Can you tell me about the changes in this PR?': '可以介紹一下此 PR 中的變更嗎？',
    'Summarize this discussion.': '摘要此討論。',
    'Summarize the comments made by user in a discussion.': '摘要討論中使用者發表的留言。',
    'What were some key decisions made in this discussion?': '此討論中做出了哪些關鍵決策？',
    'Summarize this discussion. What were some key decisions made in this discussion?':
      '摘要此討論。此討論中做出了哪些關鍵決策？',
    'Summarize the comments made on this discussion.': '摘要此討論中的留言。',
    'Suggest next steps based on this discussion': '根據此討論建議後續步驟',
    'Why did this job fail?': '此作業為什麼失敗？',
    'How can I fix this build?': '如何修正此建置？',
    'Explain why this job failed.': '說明此作業失敗的原因。',
    'Explain this snippet': '說明這段程式碼片段',
    'Suggest improvements to this code.': '為這段程式碼提出改進建議。',
    'Explain this diff': '說明此差異',
    'Why should I enable secret protection?': '為什麼要啟用機密保護？',
    'What kind of credentials does secret scanning find?': '機密掃描能找出哪些認證資訊？',
    'What is the impact of leaked secret in one of my repositories?': '儲存庫中外洩的機密會造成什麼影響？',
    'Why should I enable code security?': '為什麼要啟用程式碼安全性？',
    'What kind of vulnerabilities does code security scanning find?': '程式碼安全性掃描能找出哪些漏洞？',
    'What is the impact of a vulnerability in my repo?': '儲存庫中的漏洞會造成什麼影響？',
    'What is the difference between a Code Security Risk Assessment and a Secret Risk Assessment?':
      '程式碼安全性風險評估和機密風險評估有什麼差別？',
    'How is my data used during a Risk Assessment?': '風險評估期間會如何使用我的資料？',
    'Who will be notified of findings from a Risk Assessment?': '誰會收到風險評估發現項目的通知？',
    'What is the best way to get started with Copilot?': '開始使用 Copilot 的最佳方式是什麼？',
    'How do I clone this repository?': '如何複製此儲存庫？',
    'How do I revert a commit?': '如何還原提交？',
    'How do I add myself as a reviewer?': '如何將自己新增為審查者？',
    'How do I create a repository?': '如何建立儲存庫？',
    'How do I create an issue?': '如何建立議題？',
    'How do I filter issues by label?': '如何依標籤篩選議題？',
    'What are the most recently updated issues?': '最近更新的議題有哪些？',
    'How do I create a pull request?': '如何建立拉取請求？',
    'How do I filter pull requests by label?': '如何依標籤篩選拉取請求？',
    'How do I reopen a closed pull request?': '如何重新開啟已關閉的拉取請求？',
    'How do I start a new discussion?': '如何發起新討論？',
    'How do I filter discussions by category or tag?': '如何依類別或標記篩選討論？',
    'How do I search for a specific discussion?': '如何搜尋特定討論？',
    'Give me a high level overview of this repo': '概略介紹此儲存庫',
    'What are potential performance issues in this code?': '這段程式碼可能有哪些效能問題？',
    'Summarize the last 3 merged PRs in this repo': '摘要此儲存庫最近合併的 3 個 PR',
    'Summarize the high level changes made': '概略摘要所做的變更',
    'Help me review this pull request': '幫我審查此拉取請求',
    'Help me review this pull request.': '幫我審查此拉取請求。',
    'Identify potential risks from this change.': '找出此變更的潛在風險。',
    'Create a PR to solve this issue.': '建立 PR 來解決此議題。',
    'List and define the functions and variables in this file': '列出並說明此檔案中的函式和變數',
    "What's new in Copilot?": 'Copilot 有哪些新功能？',
    'What feedback is unresolved?': '哪些意見回饋尚未解決？',
  },
  scoped: {
    Debug: '偵錯',
    Changes: '變更',
  },
  regexp: [
    // 网页 / 支持文档搜索
    [/^An error occurred when searching for “(.+)”$/, '搜尋「$1」時發生錯誤'],
    [/^Searching the web for “(.+)”$/, '正在網路上搜尋「$1」'],
    [/^No web search results for “(.+)” were found$/, '找不到「$1」的網頁搜尋結果'],
    [/^Using web search results for “(.+)”$/, '正在使用「$1」的網頁搜尋結果'],
    [/^Searching support documents for “(.+)”$/, '正在支援文件中搜尋「$1」'],
    [/^No support documents for “(.+)” were found$/, '找不到「$1」的支援文件'],
    [/^Using support search results for “(.+)”$/, '正在使用「$1」的支援搜尋結果'],
    [/^Search for "(.+)" in "(.+)"$/, '在「$2」中搜尋「$1」'],
    [/^Search results for "(.+)" in "(.+)"$/, '「$1」在「$2」中的搜尋結果'],

    // 文件
    [/^An error occurred when finding “(.+)” in (\S+)$/, '在 $2 中尋找「$1」時發生錯誤'],
    [/^An error occurred when finding file changes for “(.+)” in (\S+)$/, '在 $2 中尋找「$1」的檔案變更時發生錯誤'],
    [/^File results for “(.+)” in (\S+)$/, '「$1」在 $2 中的檔案結果'],
    [/^No files matching “(.+)” in (\S+) were found$/, '在 $2 中找不到與「$1」相符的檔案'],
    [/^No files changes were found for “(.+)” in (\S+)$/, '在 $2 中找不到「$1」的檔案變更'],
    [/^Using results for “(.+)” in (\S+)$/, '正在使用「$1」在 $2 中的結果'],
    [/^File changes for (.+) in (\S+)$/, '$2 中 $1 的檔案變更'],
    [/^View file (?!changes$)(\S+)$/, '查看檔案 $1'],
    [/^View file changes for (\S+)$/, '查看 $1 的檔案變更'],
    [/^View directory (\S+)$/, '查看目錄 $1'],

    // 讨论、作业日志、API
    [/^Fetching discussion (\d+)$/, '正在擷取討論 $1'],
    [/^Unable to fetch discussion (\d+)$/, '無法擷取討論 $1'],
    [/^Using discussion #(\d+)$/, '正在使用討論 #$1'],
    [/^Details about discussion #(\d+)$/, '討論 #$1 的詳細資料'],
    [
      /^(Fetching logs for|Unable to fetch logs for|Using logs for|An error occurred when fetching logs for) (.+) in (\S+)$/,
      (_, lead: string, topic: string, repo: string) => {
        const target = `${repo} ${joinCjk('中', logTopic(topic))} 的記錄`
        if (lead === 'Fetching logs for') return `正在擷取 ${target}`
        if (lead === 'Using logs for') return `正在使用 ${target}`
        if (lead === 'Unable to fetch logs for') return `無法擷取 ${target}`
        return `擷取 ${target}時發生錯誤`
      },
    ],
    [/^Fetching endpoint (\S+)$/, '正在擷取端點 $1'],
    [/^Using endpoint (\S+)$/, '正在使用端點 $1'],
    [/^Unable to fetch from (\S+)$/, '無法從 $1 擷取'],
    [/^An error occurred when fetching from (\S+)$/, '從 $1 擷取時發生錯誤'],
    [/^Fetching (\/\S+)$/, '正在擷取 $1'],
    [/^Results of (\/\S+)$/, '$1 的結果'],
    // 接口说明由模型生成（英文），原样保留；原文无冒号，译文不加
    [
      /^(Using the GitHub API to|Unable to use the GitHub API to|An error occurred when using the GitHub API to) (.+)$/,
      (_, lead: string, action: string) => {
        if (lead.startsWith('Using')) return `正在透過 GitHub API 執行 ${action}`
        if (lead.startsWith('Unable')) return `無法透過 GitHub API 執行 ${action}`
        return joinCjk(`透過 GitHub API 執行 ${action}`, '時發生錯誤')
      },
    ],
    [
      /^Retrieving (.+) in ([\w.-]+\/[\w.-]+)$/,
      (_, topic: string, repo: string) => `正在檢索 ${repo} ${joinCjk('中的', logTopic(topic))}`,
    ],
    [
      /^(Job|Workflow run|Pull request|Workflow) (.+) in ([\w.-]+\/[\w.-]+)$/,
      (_, noun: string, id: string, repo: string) => `${repo} 中的${logTopic(`${noun.toLowerCase()} ${id}`)}`,
    ],
    [/^Get file (\S+)$/, '取得檔案 $1'],
    [/^Get file changes for (\S+)$/, '取得 $1 的檔案變更'],
    [/^Get data from (\S+)$/, '從 $1 取得資料'],
    [/^View search results for (.+)$/, '查看 $1 的搜尋結果'],

    // 起草议题与代理任务
    [/^Drafting update for @([\w.-]+\/[\w.-]+)\/issues\/(\d+)$/, '正在為 $1#$2 草擬更新'],
    [/^Drafted update for @([\w.-]+\/[\w.-]+)\/issues\/(\d+)$/, '已為 $1#$2 草擬更新'],
    [/^Drafting issue in ([\w.-]+\/[\w.-]+)$/, '正在 $1 中草擬議題'],
    [/^Drafted issue in ([\w.-]+\/[\w.-]+)$/, '已在 $1 中草擬議題'],
    [/^Fetching metadata from ([\w.-]+\/[\w.-]+)$/, '正在擷取 $1 的中繼資料'],
    [/^Using metadata from ([\w.-]+\/[\w.-]+)$/, '正在使用 $1 的中繼資料'],
    [/^Creating agent task in ([\w.-]+\/[\w.-]+)$/, '正在 $1 中建立代理任務'],
    [/^Created agent task in ([\w.-]+\/[\w.-]+)$/, '已在 $1 中建立代理任務'],
    [/^Researching ([\w.-]+\/[\w.-]+)$/, '正在研究 $1'],
    [/^Research completed for ([\w.-]+\/[\w.-]+)$/, '已完成 $1 的研究'],
    [
      new RegExp(`^An error occurred while (${ACTIVE_SKILL_SOURCE})$`),
      (_, skill: string) => `${ACTIVE_SKILL[skill] ?? skill}時發生錯誤`,
    ],

    // 其他
    [/^Explain why job (\d+) failed\.$/, '說明作業 $1 失敗的原因。'],
    [
      /^([Pp]ositive|[Nn]egative) feedback submitted$/,
      (_, kind: string) => `已送出${kind.toLowerCase() === 'positive' ? '正面' : '負面'}意見回饋`,
    ],
    [/^Are you sure you want to unshare all (\d+) conversations\?$/, '確定要取消分享全部 $1 個對話嗎？'],
    [/^Authenticate with SSO to access ([\w.-]+)$/, '透過 SSO 驗證身分以存取 $1'],
    [/^Single sign-on for ([\w.-]+)$/, '$1 的單一登入'],
    [/^(.+) \(opens a new page\)$/, '$1（開啟新頁面）'],
    [/^Pasted content (\d+)$/, '貼上的內容 $1'],
    [/^Pasted Image (\d+)$/, '貼上的圖片 $1'],
    [
      /^(Expand|Collapse|Remove) Pasted content (\d+)$/,
      (_, action: string, index: string) => `${PASTED_ACTION[action] ?? action}貼上的內容 ${index}`,
    ],
    [/^Attach Pasted content (\d+) as file$/, '將貼上的內容 $1 附加為檔案'],
    ...COMPOSER_SHARED_RULES,
  ],
} satisfies PageDictionary
