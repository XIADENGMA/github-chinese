import type { PageDictionary } from '../../../core/types'

/**
 * 比较页（/compare，作用域另含 commits）的拉取请求创建表单：标题、描述、创建按钮与草稿选项、创建失败提示，
 * 以及网页编辑器提交到新分支后的提示、首次贡献提示。
 * 比较页其余部分（范围选择、合并状态、统计）由 commits 词典处理；侧栏与拉取请求侧栏相同（sidebar.ts）。
 */
export default {
  static: {
    'Create a new pull request by comparing changes across two branches.': '比较两个分支的更改以创建新的拉取请求。',
    'Create pull request': '创建拉取请求',
    'Open a pull request that is ready for review': '创建可供审查的拉取请求',
    'Cannot be merged until marked ready for review': '标记为可供审查前无法合并',
    // 创建按钮下拉选项的补充说明（存储库有 CODEOWNERS 时）
    'Automatically requests reviews from code owners': '自动请求代码所有者审查',
    "Doesn't request code owners review and cannot be merged": '不请求代码所有者审查且无法合并',
    'Create pull request options': '创建拉取请求选项',
    'Creating pull request…': '正在创建拉取请求…',
    'Creating pull request...': '正在创建拉取请求...',
    'Pull request title': '拉取请求标题',
    'Pull request body': '拉取请求正文',
    // 已有拉取请求框中描述为空时
    'No description available': '暂无描述',

    // 网页编辑器提交到新分支后的提示：… a new branch named <patch-1>. Create a pull request below …
    'The change you just made was written to a new branch named': '你刚才所做的更改已写入新分支',
    '. Create a pull request below to propose these changes.': '。在下方创建拉取请求以提议这些更改。',

    // 首次贡献提示：Reporting a security vulnerability? Check out the project’s <security policy>.
    'Reporting a security vulnerability?': '要报告安全漏洞？',
    'Looking for help?': '需要帮助？',
    "Check out the project's": '请查看此项目的',
    'Check out the project’s': '请查看此项目的',
    'instructions for getting support': '支持说明'
  },
  scoped: {
    'Create draft pull request': '创建草稿拉取请求',
    'View pull request': '查看拉取请求',
    'Add a title': '添加标题',
    'Add a description': '添加描述',
    'Helpful resources': '实用资源'
  },
  regexp: [
    [
      /^Pull request creation failed\. Validation failed: A pull request already exists for (\S+)\.$/,
      '拉取请求创建失败。验证失败：$1 已存在拉取请求。'
    ],
    [/^No commits between (\S+) and (\S+)$/, '$1 和 $2 之间没有提交']
  ]
} satisfies PageDictionary
