import type { PageDictionary } from '../../../core/types'

/**
 * 项目（新版 Projects）：项目设置与项目菜单。
 * 项目菜单（顶栏）、常规设置（名称、描述、自述文件、可见性、模板、危险区域）、删除项目对话框、
 * 访问权限与协作者、默认存储库、项目详细信息面板、经典项目迁移提示。
 */

/** 协作者显示名（不含捕获组）：用户登录名，或团队“@slug • 4 members” */
const COLLABORATOR_SOURCE = '[\\w.-]+|@[\\w.-]+ • \\d+ members?'

/**
 * Select / Unselect 后不按协作者处理的词（不含捕获组）：all、none，
 * 以及侧边面板议题元数据等选择器的名词（Select labels、Select assignees…），避免译成「選取 labels」
 */
const NOT_COLLABORATOR =
  '(?!(?:all|none|projects?|branch(?:es)?|assignees?|milestones?|issues?|options?|labels?|repositor(?:y|ies)|languages?|status|columns?|views?|types?|fields?|users?|teams?|reviewers?)$)'

/** 团队显示名中的成员数：@design • 4 members → @design • 4 位成員（人用量词「位」） */
function collaboratorName(name: string): string {
  return name.replace(/ • (\d+) members?$/, ' • $1 位成員')
}

export default {
  static: {
    // 项目菜单
    'Project details': '專案詳細資料',
    'Edit project name': '編輯專案名稱',
    'Update project title': '更新專案標題',
    'Use this template': '使用此範本',

    // 常规设置
    'Project settings': '專案設定',
    'Project settings menu': '專案設定選單',
    'Project name': '專案名稱',
    'Project name is required.': '專案名稱為必填。',
    'Project settings saved successfully': '已成功儲存專案設定',
    'A short description about this project.': '此專案的簡短描述。',
    'Let everyone know what this project is about, how to use it and link to important resources.':
      '讓所有人瞭解此專案的內容和使用方式，並附上重要資源的連結。',
    'Edit short description': '編輯簡短描述',
    'You choose who can read, write, and admin this project.': '由你決定誰可以讀取、寫入並管理此專案。',
    // read / write access → 讀取 / 寫入權限（GLOSSARY.zh-TW permission 行）
    'Everyone on the internet has read access to this project. You choose who has write and admin access.':
      '網際網路上的所有人都擁有此專案的讀取權限。由你決定誰擁有寫入和管理權限。',
    'Everyone in your enterprise has read access to this project. You choose who has write and admin access.':
      '你企業中的所有人都擁有此專案的讀取權限。由你決定誰擁有寫入和管理權限。',
    'has read access to this project. You choose who has write and admin access.': '擁有此專案的讀取權限。由你決定誰擁有寫入和管理權限。',
    'Only organization owners can change project visibility.': '只有組織擁有者可以變更專案可見度。',
    'Only admins can change project visibility.': '只有管理員可以變更專案可見度。',
    'This project is currently public.': '此專案目前設為公開。',
    'This project is currently private.': '此專案目前設為私人。',
    'This project is currently internal to your enterprise.': '此專案目前僅在你的企業內部可見。',
    'This project was created with the': '此專案是以',
    'Make template': '設為範本',
    'Make this project a template that can be used by members of the': '將此專案設為範本供',
    'organization when creating new projects.': '組織的成員在建立新專案時使用。',
    'Remove this project as a template? It will no longer be available as a template when creating new projects.':
      '要取消將此專案設為範本嗎？建立新專案時將無法再使用它作為範本。',
    'Copy as template': '複製為範本',
    'Copy this project into a template that can be used when creating new projects.': '將此專案複製為可在建立新專案時使用的範本。',
    'Make a copy of this project.': '建立此專案的副本。',
    'Re-open project': '重新開啟專案',
    'Re-opening a project will add it to the list of open projects.': '重新開啟專案會將它加入開放中的專案清單。',
    'Re-open this project': '重新開啟此專案',
    'Close project': '關閉專案',
    'Closing a project will disable its workflows & remove it from the list of open projects.':
      '關閉專案會停用其工作流程並將它從開放中的專案清單移除。',
    'Close this project': '關閉此專案',
    'Delete project': '刪除專案',
    'Once you delete a project, there is no going back. Please be certain.': '刪除專案後，將無法復原。請務必確定。',
    'Delete this project': '刪除此專案',
    'Resync search index for this project': '重新同步此專案的搜尋索引',
    'This will asynchronously correct inconsistencies between the search index and the database':
      '這會以非同步方式修正搜尋索引和資料庫之間的不一致',
    'Resync search index': '重新同步搜尋索引',

    // 删除项目对话框：整句由下方 inline 规则译出，不构成行内句时按以下片段翻译
    'Delete project warning': '刪除專案警告',
    'I understand the consequences, delete this project': '我瞭解後果，刪除此專案',
    'project, saved views, custom fields and associated values, and Insights data.': '專案、已儲存的檢視、自訂欄位和相關值，以及洞察資料。',
    'This will not delete issues or pull requests themselves.': '這不會刪除議題或拉取請求本身。',

    // 访问权限
    'Everyone in the organization can see and edit this project.': '組織中的所有人都可以查看並編輯此專案。',
    'Everyone in the organization can see this project.': '組織中的所有人都可以查看此專案。',
    'are admins of this project.': '是此專案的管理員。',
    'can see this project. Owners are also admins of this project.': '可以查看此專案。擁有者也是此專案的管理員。',
    'Everyone in the organization is an admin of this project.': '組織中的所有人都是此專案的管理員。',
    'Public project': '公開專案',
    'Private project': '私人專案',
    'Internal project': '內部專案',
    'This project is public and visible to anyone.': '此專案為公開專案且所有人都能查看。',
    'Only those with access to this project can view it.': '只有具備此專案存取權的人才能查看。',
    'Everyone in the organization can view this project.': '組織中的所有人都可以查看此專案。',
    'Can see, make changes to, and add new collaborators to this project.': '可以查看、變更此專案並新增協作者。',
    'Can see and make changes to this project.': '可以查看並變更此專案。',
    'Can see this project.': '可以查看此專案。',
    'Organization members will only be able to see this project if it’s public. To give an organization member additional access, they can be added as part of a team or as a collaborator.':
      '此專案公開時組織成員才能查看。若要授予組織成員更多存取權，可將其加入團隊或新增為協作者。',

    // 默认存储库
    'By default, new issues created from this project are added to this repository.': '從此專案建立的新議題預設會加入此儲存庫。',

    // 经典项目迁移
    'Setting up the project…': '正在設定專案…',
    'Creating project columns…': '正在建立專案欄…',
    'Creating an initial view…': '正在建立初始檢視…',
    'Migrating issues, pull requests, and drafts…': '正在移轉議題、拉取請求和草稿…',
    'Your project could not be migrated.': '無法移轉你的專案。',
    'Your classic project': '你的傳統專案',
    'Users visiting the classic project will be linked to this one.': '造訪傳統專案的使用者會被導向此專案。',
    '• Users visiting the classic project will be linked to this one.': '• 造訪傳統專案的使用者會被導向此專案。',
    'This project has been migrated as part of the sunset for Projects (classic).': '此專案已隨專案（傳統）淘汰而移轉。',
    'This project is being migrated as part of the sunset for Projects (classic).': '此專案正隨專案（傳統）淘汰而移轉。'
  },
  scoped: {
    // 通用文本（仅项目页生效）
    'What’s new': '新功能',
    'Short description': '簡短描述',
    'An error occurred while saving.': '儲存時發生錯誤。',
    'Edit README': '編輯讀我檔案',
    'You have unsaved changes. Are you sure you want leave this page and discard them?': '你有未儲存的變更。確定要離開此頁面並捨棄變更嗎？',
    // 原文无逗号，译文不加；与 org-settings/general.ts 同句一致
    'Unexpected bad things will happen if you don’t read this!': '不讀完以下內容可能會造成意想不到的後果！',
    'Are you absolutely sure?': '你確定嗎？',
    'be undone. This will permanently delete the': '復原。這將永久刪除',
    // 删除项目对话框草稿议题句（整句见下方 inline）的片段：前段带出「在此專案中建立的」，末段只剩句号，
    // 不构成行内句时同样拼成「這也會刪除在此專案中建立的 3 個草稿議題。」
    'This will also delete': '這也會刪除在此專案中建立的',
    'that were created in this project.': '。',
    'that was created in this project.': '。',
    'Who has access': '誰有存取權',
    'Base role': '基本角色',
    'Only those with direct access and': '只有具備直接存取權的人和',
    'Search by username or team': '依使用者名稱或團隊搜尋',
    'Find a collaborator': '尋找協作者',
    'Find a collaborator or a team': '尋找協作者或團隊',
    'Add collaborators': '新增協作者',
    'Invite collaborators': '邀請協作者',
    '· Already a collaborator': '· 已是協作者',
    'Unable to add some users': '無法新增部分使用者',
    'Failed to update collaborators': '無法更新協作者',
    'Remove collaborator': '移除協作者',
    'Select all collaborators.': '選取所有協作者。',
    'Remove yourself as admin?': '要移除自己的管理員身分嗎？',
    'Are you sure you want to remove yourself as Admin? You will lose access to Settings':
      '確定要移除自己的管理員身分嗎？你將無法再存取設定',
    'Failed to remove collaborators': '無法移除協作者',
    'Loading collaborators...': '正在載入協作者...',
    'Add a collaborator to see them here.': '新增協作者後會顯示在這裡。',
    'Try to change or remove some filters to see results.': '嘗試變更或移除部分篩選器以查看結果。',
    "You don't have any collaborators yet.": '你還沒有任何協作者。',
    'No collaborators found.': '找不到協作者。',
    'Default repository': '預設儲存庫',
    'No repositories are available for selection.': '沒有可選擇的儲存庫。',
    'No repositories match this search': '沒有與此搜尋相符的儲存庫',
    'Try a different search term or browse your repositories.': '嘗試其他搜尋字詞或瀏覽你的儲存庫。',
    'Starting migration…': '正在開始移轉…',
    'Migrating permissions…': '正在移轉權限…',
    'Migrating workflows…': '正在移轉工作流程…',
    'has been closed and is read-only.': '已關閉且為唯讀。',
    "is still open, but future changes won't be synchronized.": '仍處於開放狀態，但之後的變更不會同步。',
    'Migration complete': '移轉完成',
    // 项目菜单
    Project: '專案',
    // 项目菜单的分组标题：产品名按 product-names.md 译出（GitHub Projects → GitHub 專案）
    'GitHub Projects': 'GitHub 專案',
    template: '範本',
    'template.': '範本建立的。',
    'Make a copy': '建立副本',
    // 常规设置
    Visibility: '可見度',
    Internal: '內部',
    'on the internet': '在網際網路上',
    'in your enterprise': '在你的企業中',
    'Danger zone': '危險區域',
    // 删除项目对话框
    'This action': '此動作',
    cannot: '無法',
    'Please type': '請輸入',
    'to confirm.': '以確認。',
    // 访问权限
    'Manage access': '管理存取權',
    Manage: '管理',
    owners: '擁有者',
    Role: '角色',
    'Role:': '角色：',
    Mixed: '混合',
    Read: '讀取',
    // Write 角色依赖 common-ui 的全局词条（繁体按留言框分页义译「撰寫」），不收 scoped 副本：
    // 同页侧边面板新增留言、读我档案编辑器的 Write 分页应作「撰寫」，scoped 会一并改掉，mergeText 区分不开；
    // inline 只能改「Role: Write」按钮，角色选单、Base role 按钮、表头筛选仍是「撰寫」，不采用；
    // 权限义应作「寫入」，待引擎支持按选择器限定的文字规则（只对角色按钮、角色选单、表头角色筛选生效）
    Admin: '管理員',
    'no access': '無存取權',
    'No access': '無存取權',
    Invite: '邀請',
    'Search by username': '依使用者名稱搜尋',
    'Please try again later.': '請稍後再試。',
    'An error has occurred.': '發生錯誤。',
    'Something went wrong.': '發生錯誤。',
    'Something went wrong': '發生錯誤',
    'An error occurred': '發生錯誤',
    // 默认存储库
    'Filter repositories': '篩選儲存庫',
    'No repositories available': '沒有可用的儲存庫',
    // 经典项目迁移
    'Try again': '再試一次'
  },
  regexp: [
    [/^Workflows \((\d+) enabled\)$/, '工作流程（已啟用 $1 個）'],
    [/^(\d+) draft issues?$/, '$1 個草稿議題'],
    [/^(\d+) users? successfully added$/, '已成功新增 $1 位使用者'],
    [/^Remove collaborator (.+)$/, (_, name: string) => `移除協作者 ${collaboratorName(name)}`],
    // 协作者列表的勾选框：选中列表项 → 「選取」
    [new RegExp(`^Unselect ${NOT_COLLABORATOR}(${COLLABORATOR_SOURCE})$`), (_, name: string) => `取消選取 ${collaboratorName(name)}`],
    [new RegExp(`^Select ${NOT_COLLABORATOR}(${COLLABORATOR_SOURCE})$`), (_, name: string) => `選取 ${collaboratorName(name)}`],
    [/^(\d+) selected$/, '已選取 $1 個'],
    [/^(\d+) members?, (\d+) teams?$/, '$1 位成員，$2 個團隊'],
    [/^(\d+) members?$/, '$1 位成員'],
    [/^(\d+) teams?$/, '$1 個團隊'],
    [/^@(.+) • (\d+) members?$/, '@$1 • $2 位成員'],
    [/^(\d+) collaborators? found\.$/, '找到 $1 位協作者。'],
    [/^Migrating (.+)$/, '正在移轉 $1']
  ],
  // 删除项目对话框里的项目名：须照原文输入才能确认，不翻译。默认标题 @user's untitled project 在顶栏、详细信息侧栏、
  // 项目列表同样保持原文（views.ts、list.ts 的 ignore），items.ts 的正则只在标签页标题等未忽略处生效
  ignore: [
    'label[for="confirm-delete-input"] > span',
    '[role="alertdialog"]:has(#confirm-delete-input) p:first-of-type > span:nth-of-type(2)'
  ],
  inline: [
    // 删除项目对话框（delete-project-dialog.tsx）：加粗的 cannot、项目名、草稿议题数都是 <span>
    // <p>This action <span>cannot</span> be undone. This will permanently delete the <span>项目名</span> project, saved views, …</p>
    [
      'This action {} be undone. This will permanently delete the {} project, saved views, custom fields and associated values, and Insights data.',
      '此動作{}復原。這將永久刪除 {} 專案、已儲存的檢視、自訂欄位和相關值，以及洞察資料。'
    ],
    // <p>This will also delete <span>3 draft issues</span> that were created in this project.</p>
    [/^This will also delete \{\} that (?:were|was) created in this project\.$/, '這也會刪除在此專案中建立的 {}。'],
    // <label>Please type <span>项目名</span> to confirm.</label>
    ['Please type {} to confirm.', '請輸入 {} 以確認。'],
    // 常规设置的模板区（general-settings-view.tsx）：<p>This project was created with the&nbsp;<a>模板名</a>&nbsp;template.</p>
    ['This project was created with the {} template.', '此專案是以 {} 範本建立的。'],
    // <p>Make this project a template that can be used by members of the <b>组织</b> organization when creating new projects.</p>
    [
      'Make this project a template that can be used by members of the {} organization when creating new projects.',
      '將此專案設為範本供 {} 組織的成員在建立新專案時使用。'
    ],
    // 经典项目迁移完成的说明（project-migration-overlay-description.tsx）：
    // <span>• <a>Your classic project</a> has been closed and is read-only.<br>• Users visiting the classic project will be linked to this one.</span>
    [
      '• {} has been closed and is read-only. {} • Users visiting the classic project will be linked to this one.',
      '• {}已關閉且為唯讀。{}• 造訪傳統專案的使用者會被導向此專案。'
    ],
    // <span><a>Your classic project</a> is still open, but future changes won't be synchronized.</span>
    ["{} is still open, but future changes won't be synchronized.", '{}仍處於開放狀態，但之後的變更不會同步。'],
    // 访问设置的可见范围说明（privacy-settings.tsx）：<span>Only those with direct access and <a>owners</a>can see this project. …</span>
    // 按片段翻译时链接前的空格会留在两个中文词之间；链接文字 owners 照常翻译
    [
      'Only those with direct access and {} can see this project. Owners are also admins of this project.',
      '只有具備直接存取權的人和{}可以查看此專案。擁有者也是此專案的管理員。'
    ]
  ]
} satisfies PageDictionary
