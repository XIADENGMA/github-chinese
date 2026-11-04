import type { PageDictionary } from '../../../core/types'

/**
 * Copilot 空间（Spaces）：空间列表页、新建 / 编辑 / 复制空间、所有者选择、颜色与图标、文件树选择器、
 * 聊天输入框中的空间选择器。产品名按 product-names.md 译出：Copilot Spaces → Copilot 空間。
 */
export default {
  static: {
    // 空间列表（/copilot/spaces）
    'Search spaces': '搜尋空間',
    'Filter spaces': '篩選空間',
    'Space options': '空間選項',
    'Start your first space': '建立你的第一個空間',
    'Spaces you create will appear here.': '你建立的空間會顯示在這裡。',
    'Need help? Read the docs': '需要協助？閱讀說明文件',
    "Produce code that follows your team's patterns.": '產生遵循團隊慣用模式的程式碼。',
    'Produce code that follows your team’s patterns.': '產生遵循團隊慣用模式的程式碼。',
    'Centralize docs so your team can quickly find answers.': '集中管理說明文件，讓團隊快速找到答案。',
    'Create requirements and issues your team can ship.': '建立團隊可以交付的需求和議題。',
    'Spaces organize your files, pull requests, issues, and standards so Copilot can give more relevant help for your work.':
      '空間可整理你的檔案、拉取請求、議題和標準，讓 Copilot 為你的工作提供更切合的協助。',
    'Spaces are available in VS Code! Get started using Spaces with the GitHub MCP server.':
      'VS Code 現已支援空間！透過 GitHub MCP 伺服器開始使用空間。',
    'Try Spaces in VS Code': '在 VS Code 中試用空間',
    'Copilot Spaces documentation': 'Copilot 空間說明文件',
    // 旧版空间介绍
    'Set context once. Chat again and again': '設定一次上下文。反覆聊天',
    'Create and share a custom Copilot experience using a collection of GitHub repositories, files, and other content.':
      '使用一組 GitHub 儲存庫、檔案和其他內容，建立並分享自訂的 Copilot 體驗。',
    'Spaces lets you create shared research environments where you and your team can collaborate, explore topics, and exchange insights—all powered by AI-driven search and summarization.':
      '你可以透過空間建立共用的研究環境，與團隊一起協作、探索主題並交流洞見——一切都由 AI 驅動的搜尋和摘要提供支援。',

    // 新建空间
    'New Space': '新增空間',
    'New space': '新增空間',
    'Create space': '建立空間',
    'Create Space': '建立空間',
    'Edit space': '編輯空間',
    'Manage space': '管理空間',
    'Share space': '分享空間',
    'Duplicate space': '複製空間',
    'Duplicate Space': '複製空間',
    'Space settings': '空間設定',
    'Delete space': '刪除空間',
    'Are you sure you want to delete this space? This action cannot be undone.': '確定要刪除此空間嗎？此動作無法復原。',
    'Some resources will not be duplicated': '部分資源不會複製',
    // 屬於 <擁有者> 的私人資源不會複製到新空間。
    'Private resources owned by': '屬於',
    'will not be duplicated to the new space.': '的私人資源不會複製到新空間。',
    // 「儲存空間」易读成 storage，加「此」
    'Error saving space': '儲存此空間時發生錯誤',
    'Something went wrong while saving.': '儲存時發生錯誤。',
    'Space name': '空間名稱',
    'Choose a name that describes your project or use case': '選擇能描述專案或用途的名稱',
    'Memorable name that helps you find your space.': '有助於找到空間的好記名稱。',
    'Space owner. Required. Selected owner: @': '空間擁有者。必填。選取的擁有者：@',
    'Where we will store your space. Once created the space is not transferable.': '空間的儲存位置。建立後無法轉移。',
    'Pick a color to make your space more recognizable.': '選擇顏色，讓空間更容易辨識。',
    'Select a color': '選擇顏色',
    'Filter colors': '篩選顏色',
    'Displays beneath the title on your spaces overview page without impacting responses.': '顯示在空間總覽頁面的標題下方，不影響回應。',
    'Changes how Copilot responds on specific questions or tasks.': '變更 Copilot 回應特定問題或任務的方式。',
    // 描述、说明输入框的占位符
    "Add a short description to explain this space's purpose (e.g., 'Frontend design system' or 'API docs hub').":
      '新增簡短描述，說明此空間的用途（例如「前端設計系統」或「API 說明文件中心」）。',
    'Define Copilot’s role, focus, and what to avoid in this space. Ex. “You are a [role]. Follow our [framework/patterns] to [type of task]. Avoid [practices or tools] unless specified”.':
      '定義 Copilot 在此空間中的角色、重點和應避免的事項。例如：「你是 [角色]。遵循我們的 [架構/模式] 來 [任務類型]。除非另有指定，否則避免 [做法或工具]」。',
    'Add text, code files, or GitHub data to set a permanent context': '新增文字、程式碼檔案或 GitHub 資料以設定永久上下文',
    "You've exceeded the size limit for this space. Remove some references to continue.": '已超出此空間的大小上限。移除部分參考以繼續。',
    'The size of the space exceeds the current limit': '空間大小超出目前上限',
    'Copilot Space not found': '找不到 Copilot 空間',
    'Copilot Space SSO error': 'Copilot 空間 SSO 錯誤',
    // 空间不存在页
    'Space not found': '找不到空間',
    "This URL may be incorrect, you're signed out of your organization, or the Space may have been deleted.":
      '此 URL 可能有誤，你可能已登出組織，或空間可能已刪除。',

    // 空间资源（来源）
    'Add sources': '新增來源',
    'Add instructions': '新增指示',
    'Add a text file': '新增文字檔',
    'Give the file a title': '為檔案加上標題',
    'Enter content here': '在此輸入內容',
    'Resource actions': '資源動作',
    'View all attachments': '查看所有附件',
    "One or more files can't be submitted:": '一或多個檔案無法送出：',
    'One or more files can’t be submitted:': '一或多個檔案無法送出：',
    'File extensions': '副檔名',
    'No extension': '無副檔名',
    // 添加来源菜单（带存储库名的 Add files from <owner/repo> 见 regexp）
    'Add files from repository': '從儲存庫新增檔案',
    'Link files, pull requests, and issues': '連結檔案、拉取請求和議題',
    'Upload a file': '上傳檔案',
    'Add text content': '新增文字內容',
    // 来源区、对话区的空状态
    'Add sources to get started': '新增來源以開始使用',
    'Provide files, docs, issues, or repositories so Copilot can give more relevant answers.':
      '提供檔案、說明文件、議題或儲存庫，讓 Copilot 的回答更切題。',
    'Start a new conversation in this space by typing in the input box at the top.': '在頂端輸入框中輸入內容，在此空間開始新對話。',

    // 文件树选择器：最多 <N> 個檔案可同時新增。
    'Add files, folders...': '新增檔案、資料夾...',
    'Add files, folders…': '新增檔案、資料夾…',
    'Select folders and files': '選取資料夾和檔案',
    'files can be added at a time.': '個檔案可同時新增。',
    'Fetching files...': '正在擷取檔案...',
    "Couldn't load.": '無法載入。',
    "This file can't be submitted:": '此檔案無法送出：',
    'This file was filtered out:': '此檔案已篩除：',
    "These files can't be submitted:": '這些檔案無法送出：',
    'These files were filtered out:': '這些檔案已篩除：',
    '. Only supported file types are allowed.': '。只允許支援的檔案類型。',

    // 空间选择器
    'Recent spaces': '最近的空間',
    // 聊天附件菜单的空间入口
    'Spaces…': '空間…'
  },
  scoped: {
    'Never mind': '取消',
    Directory: '目錄',
    File: '檔案',
    'Go to file': '前往檔案',
    'An unknown error occurred': '發生未知錯誤',
    // 空间列表的分组与用途卡片
    Yours: '你的',
    'Shared with me': '與我共用',
    'Owned by': '擁有者為',
    'Generate code': '產生程式碼',
    'Share knowledge': '分享知識',
    'Plan projects': '規劃專案',
    // 空间表单与分享
    Icon: '圖示',
    'Color:': '顏色：',
    Content: '內容',
    Size: '大小',
    Sources: '來源',
    'Up to': '最多',
    Viewer: '檢視者',
    Editor: '編輯者',
    'Can view': '可查看',
    'Can edit': '可編輯',
    // 空间颜色
    auburn: '赤褐色',
    blue: '藍色',
    brown: '棕色',
    coral: '珊瑚色',
    cyan: '青色',
    gray: '灰色',
    green: '綠色',
    indigo: '靛藍色',
    lemon: '檸檬黃',
    lime: '萊姆綠',
    olive: '橄欖色',
    orange: '橘色',
    pine: '松綠色',
    pink: '粉紅色',
    plum: '梅子色',
    purple: '紫色',
    red: '紅色',
    teal: '藍綠色',
    yellow: '黃色'
  },
  regexp: [
    [/^Private resources owned by (.+) will not be duplicated to the new space\.$/, '屬於 $1 的私人資源不會複製到新空間。'],
    [/^(\d+) entries not shown$/, '另有 $1 項未顯示'],
    [/^(\d+) \/ (\d+) possible sources selected, add fewer files\.$/, '已選取 $1 / $2 個可用來源，需減少檔案。'],
    [
      /^Up to (\d+) (files|items) can be added at a time\.$/,
      (_, count: string, kind: string) => `一次最多可新增 ${count} ${kind === 'files' ? '個檔案' : '項'}。`
    ],
    [/^Add files from ([\w.-]+\/[\w.-]+)$/, '從 $1 新增檔案']
  ]
} satisfies PageDictionary
