import type { PageDictionary } from '../../../core/types'

/**
 * 存储库 Code 下拉框的代码空间标签页（React）及其对话框：新建、重命名、更改计算机类型、导出、分享深层链接。
 * 这些界面出现在存储库页，整句放 static（全局）；含变量的文字见 repo-rules.ts（已由 repository.ts 合并）。
 * 议题开发侧栏里的代码空间文字归 issues 词典；产品名译法见 codespaces.ts 文件头。
 */
export default {
  static: {
    // 标签页头部
    'Your workspaces in the cloud': '你的雲端工作區',
    'Codespace repository configuration': '程式碼空間儲存庫設定',
    'New with options...': '使用選項新增...',
    'New with options…': '使用選項新增…',
    'Configure dev container': '設定開發容器',
    'Set up prebuilds': '設定預先建置',
    'Manage codespaces': '管理程式碼空間',
    'Share a deep link': '分享深層連結',
    'What are codespaces?': '什麼是程式碼空間？',
    'Create error': '建立時發生錯誤',
    'Configure and create a codespace': '設定並建立程式碼空間',
    'Creating codespace': '正在建立程式碼空間',
    'Creating codespace...': '正在建立程式碼空間...',
    'Creating codespace…': '正在建立程式碼空間…',
    'Create codespace': '建立程式碼空間',
    // 按分支创建（Create codespace on <branch>）由 repo-rules.ts 的正则处理，分支名不收录
    'Create a codespace on default branch': '在預設分支上建立程式碼空間',
    'Could not create a codespace. Try again.': '無法建立程式碼空間。請再試一次。',
    'Codespace failed to provision': '程式碼空間佈建失敗',
    'Codespace provisioning timed out': '程式碼空間佈建逾時',

    // 列表
    'On current branch': '目前分支',
    'On other branches': '其他分支',
    'No codespaces on current branch': '目前分支上沒有程式碼空間',
    'No codespaces': '沒有程式碼空間',
    "You don't have any codespaces with this repository checked out": '你沒有簽出此儲存庫的程式碼空間',
    'You don’t have any codespaces with this repository checked out': '你沒有簽出此儲存庫的程式碼空間',
    'Learn more about codespaces...': '瞭解程式碼空間...',
    'Learn more about codespaces…': '瞭解程式碼空間…',
    'Machine type disallowed': '不允許的機器類型',
    'Image disallowed': '不允許的映像檔',
    // 自動刪除 <3 天後>
    'Auto-deletes': '自動刪除',
    'Uncommitted changes': '有未提交的變更',
    'Unpushed changes': '有未推送的變更',
    'From your fork': '來自你的分叉',
    'From fork': '來自分叉',
    "You don't have push permissions": '你沒有推送權限',
    'You don’t have push permissions': '你沒有推送權限',

    // 横幅（标题隐藏，正文由服务器下发）
    'Codespaces maintenance notice': '程式碼空間維護通知',
    'Codespaces is undergoing maintenance. Users may experience connection issues during this time, for more details please visit':
      '程式碼空間正在維護。在此期間可能發生連線問題，詳細資訊請造訪',
    'Codespaces will be undergoing maintenance. Users may experience connection issues during this time, for more details please visit':
      '程式碼空間即將維護。在此期間可能發生連線問題，詳細資訊請造訪',
    'this announcement': '此公告',
    'SSO warning': 'SSO 警告',
    'Pull request warning': '拉取請求警告',
    'You cannot create a codespace on a closed pull request. Please reopen it if you wish to create a new codespace.':
      '無法在已關閉的拉取請求上建立程式碼空間。如需建立新的程式碼空間，請重新開啟該拉取請求。',
    'You may be able to': '你或許可以',
    'Create notice': '建立提示',
    // 此儲存庫的程式碼空間使用量付費方為 <owner>。
    'Codespace usage for this repository is paid for by': '此儲存庫的程式碼空間使用量付費方為',

    // 运行上限
    'Maximum running codespaces reached': '執行中的程式碼空間已達上限',
    "You have too many running codespaces. You'll need to stop some before you start a new codespace.":
      '執行中的程式碼空間過多。必須先停止部分程式碼空間才能啟動新的程式碼空間。',
    'You have too many running codespaces. You’ll need to stop some before you start a new codespace.':
      '執行中的程式碼空間過多。必須先停止部分程式碼空間才能啟動新的程式碼空間。',
    'Manage all codespaces': '管理所有程式碼空間',

    // 操作菜单
    'Change machine type': '變更機器類型',
    'Stop codespace': '停止程式碼空間',
    'Stopping...': '停止中...',
    'Auto-delete codespace': '自動刪除程式碼空間',
    'Keep codespace': '保留程式碼空間',
    'Action disabled by your organization': '你的組織已停用此動作',
    'Start is temporarily disabled': '暫時無法啟動',
    'Open in browser': '在瀏覽器中開啟',
    'Open in Browser': '在瀏覽器中開啟',
    'Open in Visual Studio Code': '在 Visual Studio Code 中開啟',
    'Open in Visual Studio Code Insiders': '在 Visual Studio Code Insiders 中開啟',
    'Open in JupyterLab': '在 JupyterLab 中開啟',
    'Open in JetBrains Gateway': '在 JetBrains Gateway 中開啟',
    'Open in ...': '在...中開啟',
    'Open in...': '在...中開啟',
    'Open in…': '在…中開啟',

    // 更改计算机类型
    'Change codespace machine type': '變更程式碼空間機器類型',
    'Update codespace': '更新程式碼空間',
    'Updating…': '更新中…',
    'Machine type': '機器類型',
    'Failed to load machine types': '無法載入機器類型',
    'Failed to update machine type. Please try again.': '無法更新機器類型。請再試一次。',
    // 标准规格：存储库页与代码空间页由 repo-rules.ts 的正则处理；设置页等未合并这些正则的页面靠这里的固定组合
    '2-core': '2 核心',
    '4-core': '4 核心',
    '8-core': '8 核心',
    '16-core': '16 核心',
    '32-core': '32 核心',
    '64-core': '64 核心',
    '8GB RAM · 32GB': '8 GB 記憶體 · 32 GB 儲存空間',
    '16GB RAM · 32GB': '16 GB 記憶體 · 32 GB 儲存空間',
    '32GB RAM · 64GB': '32 GB 記憶體 · 64 GB 儲存空間',
    '64GB RAM · 128GB': '64 GB 記憶體 · 128 GB 儲存空間',
    '128GB RAM · 256GB': '128 GB 記憶體 · 256 GB 儲存空間',

    // 导出 / 发布
    'Publish to a new repository': '發布到新的儲存庫',
    'Export changes to a fork': '將變更匯出到分叉',
    'Export changes to a branch': '將變更匯出到分支',
    'Checking repository status': '正在檢查儲存庫狀態',
    'Checking fork status': '正在檢查分叉狀態',
    'Checking branch status': '正在檢查分支狀態',
    'Your changes have been published to a new repository.': '你的變更已發布到新的儲存庫。',
    'Your changes have been exported to a new fork.': '你的變更已匯出到新的分叉。',
    'Your changes have been exported to a new branch.': '你的變更已匯出到新的分支。',
    'See repository': '查看儲存庫',
    'See fork': '查看分叉',
    'See branch': '查看分支',
    // 主按钮：Create ${target} 已由 new / repository 词典覆盖；导出中为 Creating ${target}...
    'Creating repository...': '正在建立儲存庫...',
    'Creating fork...': '正在建立分叉...',
    'Creating branch...': '正在建立分支...',
    'This will create a new repository and push up your work.': '這會建立新的儲存庫並推送你的工作內容。',
    'This will create a new branch with any unpushed changes': '這會以所有未推送的變更建立新分支',
    // 已有复刻：……重新指派到你現有的此儲存庫分叉 <owner/repo>，並將……
    "You do not have write access to this codespace's repository. This will reassign your codespace to your existing fork of this repository,":
      '你沒有此程式碼空間所屬儲存庫的寫入權限。這會將你的程式碼空間重新指派到你現有的此儲存庫分叉',
    'You do not have write access to this codespace’s repository. This will reassign your codespace to your existing fork of this repository,':
      '你沒有此程式碼空間所屬儲存庫的寫入權限。這會將你的程式碼空間重新指派到你現有的此儲存庫分叉',
    ', and export your changes to a new branch.': '，並將你的變更匯出到新分支。',
    // 没有复刻：……這會分叉 <owner/repo>，將你的程式碼空間……
    "You do not have write access to this codespace's repository. This will create a new fork of":
      '你沒有此程式碼空間所屬儲存庫的寫入權限。這會分叉',
    'You do not have write access to this codespace’s repository. This will create a new fork of':
      '你沒有此程式碼空間所屬儲存庫的寫入權限。這會分叉',
    ', reassign your codespace to that fork, and export your changes to a new branch.':
      '，將你的程式碼空間重新指派到該分叉，並將你的變更匯出到新分支。',
    // 旧版文案：……這會將此儲存庫分叉到 <owner/repo>，……
    "You do not have write access to this codespace's repository. This will create a new fork of the repository at":
      '你沒有此程式碼空間所屬儲存庫的寫入權限。這會將此儲存庫分叉到',
    'You do not have write access to this codespace’s repository. This will create a new fork of the repository at':
      '你沒有此程式碼空間所屬儲存庫的寫入權限。這會將此儲存庫分叉到',
    'this repository': '此儲存庫',
    'Your codespace export did not complete. Please try again.': '程式碼空間匯出未完成。請再試一次。',
    'Your codespace does not appear to be exporting. Please try again.': '程式碼空間似乎未在匯出。請再試一次。',
    'Failed to check export status.': '無法檢查匯出狀態。',
    'Failed to start export. Please try again.': '無法開始匯出。請再試一次。',
    'Failed to start export.': '無法開始匯出。',

    // 重命名
    'Rename codespace': '重新命名程式碼空間',
    'Display name': '顯示名稱',
    'Failed to rename codespace. Please try again.': '無法重新命名程式碼空間。請再試一次。',

    // 分享深层链接（徽章图片的 alt“Open in GitHub Codespaces”与按钮名“Open in Codespaces”是图片上的文字，不翻译）
    'Share codespace configuration': '分享程式碼空間設定',
    'Choose which settings from this configuration to include when sharing': '選擇分享時要包含的設定',
    'Quick start': '快速啟動',
    'Automatically create or reuse the most recent matching codespace.': '自動建立或重複使用最近相符的程式碼空間。',
    'Read more about creating a link.': '進一步瞭解如何建立連結。',
    Snippets: '程式碼片段',
    'Use the following snippets to embed an “Open in Codespaces” button for this configuration in your own page or README.':
      '使用下列程式碼片段在你自己的頁面或讀我檔案中內嵌此設定的「Open in Codespaces」按鈕。',
    'Snippet format': '程式碼片段格式',
    'URL snippet': 'URL 程式碼片段',
    'HTML snippet': 'HTML 程式碼片段',
    'MARKDOWN snippet': 'Markdown 程式碼片段'
  }
} satisfies PageDictionary
