import type { PageDictionary } from '../../../core/types'

/**
 * 比较页（/compare，作用域另含 commits）的拉取请求创建表单：标题、描述、创建按钮与草稿选项、创建失败提示，
 * 以及网页编辑器提交到新分支后的提示、首次贡献提示。
 * 比较页其余部分（范围选择、合并状态、统计）由 commits 词典处理；侧栏与拉取请求侧栏相同（sidebar.ts）。
 * 动词 open（建立拉取请求）按术语表作「建立」。
 */
export default {
  static: {
    'Create a new pull request by comparing changes across two branches.': '比較兩個分支的變更以建立新的拉取請求。',
    'Create pull request': '建立拉取請求',
    'Open a pull request that is ready for review': '建立可供審查的拉取請求',
    'Cannot be merged until marked ready for review': '標示為可供審查前無法合併',
    // 创建按钮下拉选项的补充说明（存储库有 CODEOWNERS 时）
    'Automatically requests reviews from code owners': '自動請求程式碼擁有者審查',
    "Doesn't request code owners review and cannot be merged": '不請求程式碼擁有者審查且無法合併',
    'Create pull request options': '建立拉取請求選項',
    'Creating pull request…': '正在建立拉取請求…',
    'Creating pull request...': '正在建立拉取請求...',
    'Pull request title': '拉取請求標題',
    'Pull request body': '拉取請求內文',
    // 已有拉取请求框中描述为空时
    'No description available': '沒有描述',

    // 网页编辑器提交到新分支后的提示：… a new branch named <patch-1>. Create a pull request below …
    'The change you just made was written to a new branch named': '你剛才所做的變更已寫入新分支',
    '. Create a pull request below to propose these changes.': '。在下方建立拉取請求以提議這些變更。',

    // 首次贡献提示：Reporting a security vulnerability? Check out the project’s <security policy>.
    'Reporting a security vulnerability?': '要回報安全性漏洞嗎？',
    'Looking for help?': '需要協助嗎？',
    "Check out the project's": '請查看此專案的',
    'Check out the project’s': '請查看此專案的',
    'instructions for getting support': '支援說明'
  },
  scoped: {
    'Create draft pull request': '建立草稿拉取請求',
    'View pull request': '查看拉取請求',
    'Add a title': '新增標題',
    'Add a description': '新增描述',
    'Helpful resources': '實用資源'
  },
  regexp: [
    [
      /^Pull request creation failed\. Validation failed: A pull request already exists for (\S+)\.$/,
      '拉取請求建立失敗。驗證失敗：$1 已有拉取請求。'
    ],
    [/^No commits between (\S+) and (\S+)$/, '$1 和 $2 之間沒有提交']
  ]
} satisfies PageDictionary
