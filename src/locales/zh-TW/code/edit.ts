import type { PageDictionary } from '../../../core/types'
import { joinCjk } from '../helpers'

/** 编辑器屏幕阅读器标题里的文件类型 */
const EDITOR_KIND: Readonly<Record<string, string>> = {
  workflow: '工作流程',
  dependabot: 'Dependabot',
  devcontainer: 'devcontainer',
  'issue template': '議題範本',
  'discussion template': '討論範本',
}

const EDITOR_KIND_SOURCE = '(workflow|dependabot|devcontainer|issue template|discussion template)'

/** 「工作流程檔案」「Dependabot 檔案」；未给类型时为「檔案」 */
function editorFile(kind: string | undefined): string {
  return kind ? joinCjk(EDITOR_KIND[kind] ?? kind, '檔案') : '檔案'
}

/**
 * 编辑器（new / edit）、提交对话框、推送保护、上传页（upload，Rails）、删除页（delete）。
 * 提交消息占位符（Update / Create / Delete <文件>）会成为提交消息的默认值，不翻译。
 * 产品名、方案名按 product-names.md 译出（Marketplace → 市集、GitHub Team → GitHub 團隊版）；
 * 标点随原文：原文没有的冒号、逗号、括号不加。
 */
export default {
  static: {
    // 编辑器头部
    'File name': '檔案名稱',
    'Name your file...': '為檔案命名...',
    'Cancel changes': '取消變更',
    'Commit changes...': '提交變更...',
    'Show diff': '顯示差異',
    'Indent mode': '縮排模式',
    'Indent size': '縮排大小',
    'Line wrap mode': '換行模式',
    'No wrap': '不換行',
    'Soft wrap': '自動換行',
    'You have unsaved changes. Do you want to discard them?': '有未儲存的變更。要捨棄嗎？',
    'Choose a license template': '選擇授權條款範本',
    'Choose a code of conduct template': '選擇行為準則範本',
    'Choose .gitignore template': '選擇 .gitignore 範本',
    'Template filter': '範本篩選器',

    // 编辑区：屏幕阅读器标题（新建文件时没有文件名）
    'Editing file contents': '編輯檔案內容',
    // 编辑区底部的焦点提示（含 kbd，整句匹配后按快捷键文字写回；整句未命中时用下方片段）
    'Use Control + Shift + m to toggle the tab key moving focus. Alternatively, use esc then tab to move to the next interactive element on the page.':
      '使用 Control + Shift + m 切換 tab 鍵是否移動焦點。也可以按 esc 再按 tab 移到頁面上的下一個互動元素。',
    // 片段：使用 <Control + Shift + m> 切換 <tab> 鍵是否移動焦點。也可以按 <esc> 再按 <tab> …
    'to toggle the': '切換',
    'key moving focus. Alternatively, use': '鍵是否移動焦點。也可以按',
    'to move to the next interactive element on the page.': '移到頁面上的下一個互動元素。',
    // 工作流编辑器底部的自动补全提示（含 kbd；macOS 多一个 Option + Space）
    'Use Control + Space to trigger autocomplete in most situations.':
      '使用 Control + Space 可在大多數情況下觸發自動完成。',
    'Use Control + Space or Option + Space to trigger autocomplete in most situations.':
      '使用 Control + Space 或 Option + Space 可在大多數情況下觸發自動完成。',
    'Use Tab to navigate to the next placeholder.': '使用 Tab 可跳到下一個預留位置。',
    // 片段：使用 <Control + Space> 或 <Option + Space> 可在大多數情況下觸發自動完成。
    'to trigger autocomplete in most situations.': '可在大多數情況下觸發自動完成。',
    'to navigate to the next placeholder.': '可跳到下一個預留位置。',
    // 工作流编辑器的 YAML 校验弹层
    'Suggested fixes': '建議的修正',
    'Other suggestions…': '其他建議…',

    // 预览
    'Loading preview…': '正在載入預覽…',
    'The document has been deleted.': '此文件已刪除。',
    'The document was renamed without changes.': '此文件已重新命名且內容未變更。',
    'There are no changes to show.': '沒有可顯示的變更。',
    'There is no content to preview.': '沒有可預覽的內容。',
    'There has been an error generating the preview.': '產生預覽時發生錯誤。',
    'But you can preview the whole file.': '但你可以預覽整個檔案。',
    'There has been an error generating the preview. But you can preview the whole file.':
      '產生預覽時發生錯誤。但你可以預覽整個檔案。',
    'Error getting preview': '取得預覽時發生錯誤',
    'Unable to load this preview, sorry.': '無法載入此預覽。',

    // Markdown 文件附件（出错提示：<Try again> with …，与 common-ui 的文件类型片段同用「並改用」）
    'Attach files by dragging & dropping, selecting or pasting them.': '附加檔案可透過拖放、選取或貼上。',
    'Attach files by selecting or pasting them.': '附加檔案可透過選取或貼上。',
    'Uploading your files…': '正在上傳檔案…',
    'We don’t support that file type.': '不支援此檔案類型。',
    'Attaching documents requires write permission to this repository.': '附加文件需要此儲存庫的寫入權限。',
    "Yowza that's a big file.": '檔案過大。',
    'with a file size less than 10MB.': '並改用小於 10MB 的檔案。',
    'This file is empty.': '此檔案為空白。',
    'with a file that’s not empty.': '並改用非空白的檔案。',
    'This file is hidden.': '此檔案為隱藏檔案。',
    'with another file.': '並改用其他檔案。',
    'Something went really wrong, and we can’t process that file.': '發生嚴重錯誤，無法處理此檔案。',
    'Styling with Markdown is supported': '支援使用 Markdown 設定樣式',

    // 编辑页加载出错（如文件不存在；标题 Something went wrong 由通用词典处理）
    'The requested page could not be found.': '找不到所要求的頁面。',

    // 编辑权限问题
    'You are not authorized to create pull requests in this repository': '你無權在此儲存庫中建立拉取請求',
    'The repository owner has restricted who can propose changes.': '儲存庫擁有者已限制可提議變更的人員。',
    'The repository owner has restricted who can propose changes. If you need help, view the':
      '儲存庫擁有者已限制可提議變更的人員。如需協助，請查看',
    'Pull requests cannot be created in this repository': '無法在此儲存庫中建立拉取請求',
    'The repository owner has disabled pull requests.': '儲存庫擁有者已停用拉取請求。',
    'The repository owner has disabled pull requests. If you need help, view the':
      '儲存庫擁有者已停用拉取請求。如需協助，請查看',
    'If you need help, view the': '如需協助，請查看',
    'support resources': '支援資源',
    'This repository is currently being migrated.': '此儲存庫正在移轉。',
    'Sorry, you’re not able to edit this repository while the migration is in progress.': '移轉期間無法編輯此儲存庫。',
    'You are over your repository limit': '儲存庫數量已超過上限',
    'Sorry, you’re not able to fork this repository.': '無法分叉此儲存庫。',
    'You need to fork this repository to propose changes.': '必須分叉此儲存庫才能提議變更。',
    // 原文只有破折号连接两个分句：—— 两侧不加空格，不再加逗号
    'Sorry, you’re not able to edit this repository directly—you need to fork it and propose your changes from there instead.':
      '無法直接編輯此儲存庫——必須先分叉再從分叉提議變更。',
    'Sorry, it looks like your fork is outdated!': '你的分叉似乎已過時！',
    'You’ll have to bring it up to date before you can propose changes.': '必須先更新分叉才能提議變更。',
    'Binary file content is not editable.': '二進位檔案內容無法編輯。',
    'But you can still rename or move it.': '但仍可重新命名或移動。',
    'Forking this .github repository affects default community health files':
      '分叉此 .github 儲存庫會影響預設的社群健康檔案',
    'This is a `.github` repository.': '這是 `.github` 儲存庫。',
    "Forking it to propose changes will use this repository's": '分叉以提議變更時將使用此儲存庫的',
    'community health files': '社群健康檔案',
    "as the publicly visible defaults for all repositories owned by your fork's account that don't have their own. Review the contents of this repository before forking.":
      '作為分叉所屬帳號中所有未自備此類檔案的儲存庫的公開預設檔案。分叉前請先檢查此儲存庫的內容。',
    'Update your fork': '更新你的分叉',
    'Learn more repository limits': '瞭解儲存庫數量限制',
    'Learn more about forks': '瞭解分叉',

    // 编辑器横幅
    // 复刻编辑横幅（EditingForkBanner）：…in your fork <b>owner/repo</b>, so you can send a pull request.
    // 整句由 inline 调整语序；此为整句未命中时的片段（原文无逗号，不加逗号）：
    // …寫入新分支。新分支位於你的分叉 <owner/repo>，之後可建立拉取請求。（分叉名紧跟「分叉」，不被读成分支名）
    'You’re making changes in a project you don’t have write access to. Submitting a change will write it to a new branch in your fork':
      '你正在變更你沒有寫入權限的專案。送出的變更將寫入新分支。新分支位於你的分叉',
    ', so you can send a pull request.': '，之後可建立拉取請求。',
    'shows the community how to support this project. Please see our': '向社群說明贊助此專案的方式。請參閱',
    'repository funding links documentation': '儲存庫贊助連結說明文件',
    "for more information on formatting and what is and isn't allowed in this file.":
      '以瞭解此檔案的格式和允許、禁止的內容。',
    'Please note that funding links are currently': '請注意此儲存庫的贊助連結目前',
    'on this repository. Visit': '。請前往',
    'repository settings': '儲存庫設定',
    'to enable display of your funding links.': '啟用贊助連結顯示。',
    'Looks like this file is an': '此檔案似乎是',
    'issue template config': '議題範本設定',
    '. Need help? Check out the': '。需要協助嗎？請查看',
    'documentation.': '說明文件。',
    'Looks like this file is an issue template. Need help?': '此檔案似乎是議題範本。需要協助嗎？',
    'Looks like this file is a custom slash command. Need help? Check out the':
      '此檔案似乎是自訂斜線命令。需要協助嗎？請查看',
    'file helps users to easily cite your software from the repository overview.':
      '檔案可協助使用者從儲存庫總覽輕鬆引用你的軟體。',
    'Insert example': '插入範例',
    'Parent directory contains leading or trailing whitespace.': '父目錄名稱的開頭或結尾含有空白字元。',
    'We’ve detected the file has mixed line endings. When you commit changes we will normalize them to':
      '偵測到此檔案混用不同的行尾字元。提交變更時將統一為',
    'Windows-style': 'Windows 格式',
    'is a special repository: its': '是特殊儲存庫：其',
    'will appear on your profile!': '將顯示在你的個人檔案中！',
    'is a special repository: this': '是特殊儲存庫：此',
    'will appear on your public organization profile, visible to anyone.': '將顯示在公開的組織資料中，所有人皆可查看。',
    'will appear on your organization member profile, visible only to organization members.':
      '將顯示在組織的成員專屬資料中，僅組織成員可查看。',
    'We’ve detected the file encoding as': '偵測到此檔案的編碼為',
    '. When you commit changes we will transcode it to': '。提交變更時將轉碼為',
    'Unsaved changes': '未儲存的變更',
    'You have unsaved changes on this file that can be restored.': '此檔案有可還原的未儲存變更。',
    'This workflow will fail until runners are configured for the repository. Finish setting up GitHub Actions by':
      '此工作流程在儲存庫設定執行器之前將持續失敗。完成 GitHub 動作設定需要',
    'adding runners': '新增執行器',

    // 赞助文件预览（FUNDING.yml；含文件名的句子由 regexp 处理；产品名 Sponsors → 贊助）
    'Apply to Sponsors.': '申請加入贊助。',
    'Some users provided are not enrolled in GitHub Sponsors.': '所列的部分使用者未加入 GitHub 贊助。',

    // 帮助面板（工作流、devcontainer 编辑器；产品名 Marketplace → 市集）
    'Cannot retrieve help documentation at this time.': '目前無法取得說明文件。',
    'Close help panel': '關閉說明面板',
    'Help panel': '說明面板',
    'Collapse help panel': '摺疊說明面板',
    'Expand help panel': '展開說明面板',
    'Search Marketplace for Actions': '在市集中搜尋動作',
    'Featured actions': '精選動作',
    'There was a problem loading the actions from the marketplace.': '從市集載入動作時發生問題。',
    'Searching Marketplace': '正在搜尋市集',
    'Loading featured actions': '正在載入精選動作',
    'Browse all actions on the GitHub Marketplace': '在 GitHub 市集中瀏覽所有動作',
    // 后接 <devcontainer.json> 与「 file.」（檔案。）
    'Copy and paste the following snippet into the features attribute of your':
      '將下列程式碼片段複製並貼到以下檔案的 features 屬性中',
    'Version:': '版本：',
    'Copy snippet to clipboard': '將程式碼片段複製到剪貼簿',
    'Couldn’t load snippet.': '無法載入程式碼片段。',
    "Couldn't load versions.": '無法載入版本。',
    'View full Marketplace listing': '查看完整的市集頁面',
    'No results found. Try a different search.': '找不到結果。請嘗試其他搜尋條件。',
    'Search results pages': '搜尋結果頁面',
    'Featured categories': '精選類別',
    'Search for features': '搜尋功能',
    'There was a problem loading features.': '載入功能時發生問題。',
    'Searching features': '正在搜尋功能',
    'Loading features': '正在載入功能',
    'Development containers': '開發容器',
    'are configuration files used by Codespaces and tools implementing the dev container specification.':
      '是程式碼空間和實作開發容器規格的工具所使用的設定檔。',
    'These files allow you to create a consistent, sharable development environment.':
      '這些檔案可讓你建立一致、可共用的開發環境。',
    "Dev Container Features are self-contained units of installation code and development container configuration. Features are designed to install atop a wide-range of base container images. Be sure to check a Feature's documentation to see which base images are supported.":
      '開發容器功能是由安裝程式碼和開發容器設定組成的獨立單元。功能可安裝在各種基底容器映像檔上。請查看各功能的說明文件以確認支援哪些基底映像檔。',
    'To reference a Feature, add the desired Feature(s) to a': '若要引用功能，請將所需的功能新增到',
    ". See a Feature's README for available options, or leave the options empty to use the default value.":
      '。可用選項請參閱各功能的讀我檔案，或將選項留空以使用預設值。',
    'Example devcontainer.json': 'devcontainer.json 範例',

    // 提交对话框
    'Propose changes': '提議變更',
    'Sign off and commit changes': '簽署並提交變更',
    'Sign off and propose changes': '簽署並提議變更',
    'Bypass rules and commit changes': '繞過規則並提交變更',
    // 经典提交表单（议题模板编辑器等）的扩展描述：标签与占位符
    'Extended commit message': '詳細提交訊息',
    'Add an optional extended description': '新增選填的詳細描述',
    'There was an error committing your changes:': '提交變更時發生錯誤：',
    // 提交出错（服务端下发）：<用户> has committed since you started editing. <See what changed>
    'A file with the same name already exists. Please choose a different name and try again.':
      '已有同名檔案。請選擇其他名稱後再試一次。',
    'See what changed': '查看變更內容',
    'Something went wrong. Please fork the project, then try from your fork.':
      '發生錯誤。請分叉此專案，然後在分叉中再試一次。',
    'Copilot is thinking...': 'Copilot 正在思考...',
    'Regenerate commit message': '重新產生提交訊息',
    'Copilot commit message generated:': 'Copilot 已產生提交訊息：',
    'Message and description suggested by Copilot.': '訊息和描述由 Copilot 建議。',
    'Choose an email address for': '選擇用於',
    'signing off': '簽署',
    'on this commit': '此提交的電子郵件地址',
    'Direct commit or PR': '直接提交或 PR',
    'Direct commits are disabled for closed pull requests.': '已關閉的拉取請求不允許直接提交。',
    'Commit directly to the': '直接提交到',
    'You can’t commit to': '無法提交到',
    'because it is a': '因為它是',
    'protected branch': '受保護的分支',
    'Some rules will be bypassed by committing directly': '直接提交將繞過部分規則',
    'for this commit': '用於此提交',
    // 拉取请求语境的 start 与 open 同作「建立」（术语表 pull request 行）
    'for this commit and start a pull request': '用於此提交並建立拉取請求',
    'for this commit and start a pull request.': '用於此提交並建立拉取請求。',
    'Branch Name': '分支名稱',
    'PR target branch': 'PR 目標分支',
    'New branch name can not be "HEAD"': '新分支名稱不能是「HEAD」',
    'Changes to commit': '要提交的變更',
    'File could not be edited': '無法編輯檔案',
    'protected branch rules': '分支保護規則',
    'Your protected branch rules': '你的分支保護規則',
    // 分支保护未生效横幅：Your <protected branch rules> <main> branch won't be enforced…
    // The <rulesets> targeting your <main> branch won't be enforced…（規則集對你的 <main> 分支在…之前不會…強制執行。）
    // （方案名译「X 版」；原文只有句号，译文不加冒号、逗号）
    "branch won't be enforced on this private repository until you upgrade this organization to a GitHub Team or Enterprise account.":
      '分支在此組織升級到 GitHub 團隊版或企業版帳號之前不會在此私人儲存庫中強制執行。',
    "branch won't be enforced on this private repository until you move to a GitHub Team or Enterprise account.":
      '分支在你改用 GitHub 團隊版或企業版帳號之前不會在此私人儲存庫中強制執行。',
    "branch won't be enforced on this private repository until you move to a GitHub Team organization account.":
      '分支在你改用 GitHub 團隊版組織帳號之前不會在此私人儲存庫中強制執行。',
    "branch won't be enforced on this private repository until you upgrade this organization to GitHub Team.":
      '分支在此組織升級到 GitHub 團隊版之前不會在此私人儲存庫中強制執行。',
    "branch won't be enforced on this private repository until your organization admins upgrade this organization account to GitHub Team.":
      '分支在組織管理員將此組織帳號升級到 GitHub 團隊版之前不會在此私人儲存庫中強制執行。',
    'targeting your': '對你的',
    'The rulesets targeting your': '規則集對你的',
    "You've successfully submitted a request to your organization's admins for this feature.":
      '已成功向組織管理員送出此功能的申請。',

    // 推送保护（检测到机密）：Secret scanning found a custom pattern named <b>…</b>, defined by your admins, on <a>line 3</a>.
    // （逗号随原文，不改写成括号）
    'used AI to flag a': '使用 AI 標示了',
    'likely secret': '疑似機密',
    'found a': '發現了',
    'found a custom pattern named': '發現了自訂模式',
    ', defined by your admins,': '，由管理員定義，',
    ', defined by your admins, on': '，由管理員定義，位於',
    'secret on': '機密位於',
    'secret.': '機密。',
    'in your attempted push': '在你嘗試推送的內容中',
    'in your attempted push on': '位於你嘗試推送內容的',
    // 命令行推送时，类型名之后的片段会与「in your attempted push」拼成一段
    'in your attempted push.': '在你嘗試推送的內容中。',
    'secret in your attempted push on': '機密位於你嘗試推送內容的',
    'secret in your attempted push.': '機密在你嘗試推送的內容中。',
    ', defined by your admins, in your attempted push on': '，由管理員定義，位於你嘗試推送內容的',
    ', defined by your admins, in your attempted push.': '，由管理員定義，在你嘗試推送的內容中。',
    ', defined by your admins,.': '，由管理員定義。',
    'Remove detected secrets': '移除偵測到的機密',
    'Review guidance': '查看指引',
    'review guidance': '查看指引',
    'remove any detected secrets': '移除所有偵測到的機密',
    'Remove any detected secrets': '移除所有偵測到的機密',
    // <Link>Remove any detected secrets</Link> <span>from your commit and commit history.</span>（AllowSecretBody）：
    // 两段各在一个元素内，行内句调不了语序；地点状语只能接在链接之后，用括号补出（测试中登记为标点例外）
    'from your commit and commit history.': '（從提交和提交歷史記錄中）。',
    'Or request bypass privileges': '或請求繞過權限',
    'Submit a request to bypass these push protections. If granted, you may attempt this push again.':
      '送出繞過這些推送保護的請求。獲准後可再次嘗試此推送。',
    'Allowing this secret risks exposure. Instead,': '允許此機密有外洩風險。建議',
    'removing the secret from your commit and commit history': '從提交和提交歷史記錄中移除此機密',
    'Exposing this secret can allow someone to:': '此機密外洩可能讓他人能夠：',
    'Verify the identity of this': '驗證此',
    'Use this leaked secret to attempt unauthorized access': '利用外洩的機密嘗試未經授權的存取',
    'Know which resources this secret can access': '得知此機密可存取哪些資源',
    "Act on behalf of the secret's owner": '代表機密擁有者行事',
    'Push this secret to this repository without being blocked': '將此機密推送到此儲存庫而不受阻擋',
    'Push protection is enabled for your account. To disable, visit your':
      '你的帳號已啟用推送保護。若要停用，請前往你的',
    'code security settings': '程式碼安全性設定',
    'Bypass reason': '繞過原因',
    "It's used in tests": '用於測試',
    'The secret poses no risk. If anyone finds it, they cannot do any damage or gain access to sensitive information.':
      '此機密沒有風險。即使有人發現，也無法造成任何損害或存取敏感資訊。',
    "It's not a real secret": '不是真正的機密',
    "It's a false positive": '誤報',
    "It's not a real secret or is a harmless value.": '不是真正的機密或是無害的值。',
    'The detected string is not a secret.': '偵測到的字串不是機密。',
    "I'll fix it later": '稍後修正',
    'The secret is real,': '此機密是真的，',
    'I understand the risk': '我瞭解風險',
    ', and I will need to revoke it. This will open a security alert and notify admins of this repository.':
      '，我需要撤銷它。這會建立安全性警示並通知此儲存庫的管理員。',
    'Start request': '提出請求',
    'Allow Secret': '允許機密',
    'Secret allowed. You can now commit these changes.': '已允許機密。現在可以提交這些變更。',
    'An error occurred when allowing your secret. Please try again.': '允許機密時發生錯誤。請再試一次。',
    "Blocked something we shouldn't have?": '誤攔了內容嗎？',

    // 删除页
    "The diff you're trying to view is too large. We only load the first 1000 changed files.":
      '要查看的差異過大。僅載入前 1000 個變更的檔案。',

    // 上传页（Rails）
    'Drag files here to add them to your repository': '將檔案拖曳到這裡以加入你的儲存庫',
    'Drag additional files here to add them to your repository': '將更多檔案拖曳到這裡以加入你的儲存庫',
    'choose your files': '選擇檔案',
    'Or choose your files': '或選擇檔案',
    // 未指定分支时跳回存储库首页的错误横幅
    'Select a branch to upload files': '選擇要上傳檔案的分支',
    'Yowza, that’s a big file. Try again with a file smaller than 25MB.': '檔案過大。請改用小於 25MB 的檔案再試一次。',
    'Yowza, that’s a lot of files. Try uploading fewer than 100 at a time.': '檔案過多。請一次上傳少於 100 個檔案。',
    'Choose your files': '選擇檔案',
    'Remove this file': '移除此檔案',
    'Commit choice': '提交方式',
    'Processing your files…': '正在處理檔案…',
    'Uploads are disabled.': '上傳已停用。',
    'File uploads require push access to this repository.': '上傳檔案需要此儲存庫的推送權限。',
    'Learn more about pull requests.': '瞭解拉取請求。',
  },

  scoped: {
    // 编辑器（Discard、Try again、Filter…、Replace、Saving...、Featured、Restore 由通用词典处理）
    in: '位於',
    disabled: '已停用',
    // 缩进模式下拉框（与 gist 一致；不放 static：Copilot 页的 Spaces 是「空間」）
    Spaces: '空格',
    Tabs: '定位字元',
    'Adding a': '新增',
    // 附件出错提示里的链接（Something went really wrong… <Try again.>）
    'Try again.': '請再試一次。',
    'file.': '檔案。',
    Installation: '安裝',
    'All categories': '所有類別',
    Usage: '用法',
    by: '來自',
    // 编辑区底部提示的句首（快捷键在 <kbd> 中；连接词 then 由通用词典译为「再按」）
    Use: '使用',
    // 附件栏：Attach files by + dragging & dropping, + selecting or pasting them.（通常拼接成整句匹配）
    'Attach files by': '附加檔案可透過',
    'dragging & dropping,': '拖放、',
    'selecting or pasting them.': '選取或貼上。',

    // CodeMirror 搜索面板
    next: '下一個',
    previous: '上一個',
    all: '全部',
    'match case': '大小寫須相符',
    regexp: '規則運算式',
    'by word': '全字拼寫須相符',
    replace: '取代',
    'replace all': '全部取代',
    close: '關閉',
    'Go to line': '前往行',
    go: '前往',
    // CodeMirror 折叠、校验、自动补全
    'folded code': '已摺疊的程式碼',
    unfold: '展開',
    'Selection deleted': '已刪除選取範圍',
    Diagnostics: '診斷',
    'No diagnostics': '沒有診斷',
    Completions: '完成項目',

    // 提交对话框（与拉取请求的合并、建议提交表单共用的字段；
    // Add an optional extended description…、New branch name 由其他页面的全局词条处理）
    'Commit message': '提交訊息',
    'Commit summary': '提交摘要',
    'Extended description': '詳細描述',
    'Optional extended description': '選填的詳細描述',
    'Great commit summaries contain fewer than 50 characters. Place extra information in the extended description.':
      '好的提交摘要少於 50 個字元。其他資訊請寫在詳細描述中。',
    'Commit Email': '提交電子郵件',
    'You are': '你正在',
    'Create a': '建立',
    'new branch': '新分支',
    'Learn more about pull requests': '瞭解拉取請求',
    rulesets: '規則集',
    // 提交出错（违反规则）的 Repository rule violations found: 等由提交页的全局词条处理
    // 分支保护未生效横幅中的功能申请按钮
    'Ask enterprise owners for access': '向企業擁有者申請存取權',
    'Requesting...': '申請中...',
    'Cancelling...': '取消中...',
    // 复刻后编辑失败的提示
    'An unexpected error occurred. Please try again.': '發生未預期的錯誤。請再試一次。',

    // 删除页（与提交、拉取请求的差异视图共用；Load diff、This file was deleted. 由提交页的全局词条处理）
    'Expand diff': '展開差異',
    'Collapse diff': '摺疊差異',
    'Copy path to clipboard': '將路徑複製到剪貼簿',
    'Failed to load diff': '無法載入差異',

    // 推送保护（Share feedback 由通用词典处理）
    'Secret scanning': '機密掃描',
    secret: '機密的身分',
    on: '位於',
    from: '來自',
    consider: '考慮',

    // 上传页
    Or: '或',
    Uploading: '正在上傳',
    of: '/',
    files: '個檔案',
    'This file is': '此檔案',
    empty: '為空白',
    'branch.': '分支。',
    'Add files via upload': '透過上傳新增檔案',
  },

  regexp: [
    // 编辑器屏幕阅读器标题
    [
      new RegExp(`^Creating a new (?:${EDITOR_KIND_SOURCE} )?file in (\\S+)$`),
      (_, kind: string, repo: string) => joinCjk(`在 ${repo} 中建立新`, editorFile(kind)),
    ],
    [
      new RegExp(`^Editing (?:${EDITOR_KIND_SOURCE} file )?(\\S.*) in (\\S+)$`),
      (_, kind: string, name: string, repo: string) => `${joinCjk(`編輯 ${repo} 中的`, editorFile(kind))} ${name}`,
    ],
    [/^Editing (\S.*) file contents$/, '編輯 $1 檔案內容'],

    // CodeMirror 搜索播报：current match. <匹配处上下文> on line 3.（原文只有句号，译文不加冒号、逗号）
    [/^current match\. (.*) on line (\d+)\.$/, '目前的相符項目。第 $2 行的 $1。'],
    [/^replaced (\d+) match(?:es)?\.$/, '已取代 $1 個相符項目。'],
    [/^replaced match on line (\d+)\.$/, '已取代第 $1 行的相符項目。'],

    // 赞助文件预览：文件名是相邻文本节点，整句匹配
    [/^Some errors were encountered when parsing the (\S+) file:$/, '剖析 $1 檔案時發生錯誤：'],
    [/^The (\S+) file does not currently contain valid funding links\.$/, '$1 檔案目前不含有效的贊助連結。'],
    [/^Learn more about formatting (\S+)$/, '瞭解 $1 的格式'],

    // 帮助面板
    [/^Search Marketplace for (\S.*) Actions$/, '在市集中搜尋 $1 動作'],
    [/^Search for (\S.*) features$/, '搜尋 $1 功能'],
    [/^Code snippet for (\S.*)$/, '$1 的程式碼片段'],
    [/^Your search has returned ([\d,]+) results?\.$/, '搜尋傳回 $1 項結果。'],

    // 提交对话框：签署电子邮件（You are <signing off> on this commit as <邮箱>；整句由 inline 调整语序，
    // 此为整句未命中时的片段：原文无标点，译文不加逗号、冒号）
    [/^on this commit as (\S+)$/, '此提交並署名為 $1'],
    // 提交出错：文件已被他人更新
    [/^(\S+) has committed since you started editing\.$/, '$1 在你開始編輯後提交了變更。'],

    // 推送保护：机密所在行
    [/^line (\d+)$/, '第 $1 行'],

    // 删除页
    [
      /^Deleting (directory )?(\S.*)\. Commit changes to save\.$/,
      (_, dir: string, path: string) => `正在刪除${dir ? '目錄' : ''} ${path}。提交變更以儲存。`,
    ],
    [/^Failed to load diff: (\d+)$/, '無法載入差異：$1'],

    // 上传页：文件列表中的删除按钮（Remove <文件名>）、屏幕阅读器标题
    [/^Remove (\S+)$/, '移除 $1'],
    [/^Uploading files to (\S+)$/, '上傳檔案到 $1'],
  ],

  inline: [
    // 提交对话框的签署说明（WebCommitDialog，React 把 {' '} 渲染成单独的文本节点；链接 signing off 的文字照常译为「簽署」）：
    // <span class="…Caption…">Choose an email address for <a>signing off</a> on this commit</span>
    // <div class="…commitEmailFormControl…">You are <a>signing off</a> on this commit as <邮箱></div>
    // 邮箱作身份提到动词之前，原文无标点，译文不加逗号、冒号
    ['Choose an email address for {} on this commit', '選擇用於{}此提交的電子郵件地址'],
    [/^You are \{\} on this commit as (\S+)$/, '你正在以 $1 的身分{}此提交'],
    // 复刻编辑横幅（EditingForkBanner）：<Flash>You’re making changes … in your fork <b>owner/repo</b>, so you can send a pull request.</Flash>
    // 不能创建拉取请求时没有「, so you can send a pull request」；分叉名提到「新分支」之前
    [
      'You’re making changes in a project you don’t have write access to. Submitting a change will write it to a new branch in your fork {}, so you can send a pull request.',
      '你正在變更你沒有寫入權限的專案。送出的變更將寫入你的分叉 {} 中的新分支，之後可建立拉取請求。',
    ],
    [
      'You’re making changes in a project you don’t have write access to. Submitting a change will write it to a new branch in your fork {}.',
      '你正在變更你沒有寫入權限的專案。送出的變更將寫入你的分叉 {} 中的新分支。',
    ],
  ],

  ignore: [
    // 提交对话框：已更改的文件路径
    '[class*="fileCheckboxLabel__"]',
    // 删除页：文件路径、差异内容
    'a[href^="#diff-entry-"]',
    '[class*="diffContentCollapsed__"]',
    // CodeMirror 自动补全候选
    '.cm-tooltip-autocomplete',
    // 帮助面板的 Marketplace 搜索结果与详细信息：操作/功能名、作者、描述（分类名同在面包屑中）
    '[data-testid="editor-side-panel"] [class*="prc-ActionList-ItemLabel-"]',
    '[data-testid="editor-side-panel"] [class*="prc-ActionList-Description-"]',
    '[data-testid="editor-side-panel"] [class*="prc-Truncate-Truncate-"]',
    '[data-testid="editor-side-panel"] h2[data-component="Heading"]',
    '[data-testid="editor-side-panel"] .fgColor-muted > span',
    '[data-testid="editor-side-panel"] div.fgColor-muted:not(.text-small)',
    // 存储库概述侧栏：部署环境名
    '[class*="envItem__"] > a',
    // 上传页：待提交文件名、上传进度中的文件名
    '.js-manifest-file-entry .js-filename',
    '.js-upload-meter-filename',
  ],
} satisfies PageDictionary
