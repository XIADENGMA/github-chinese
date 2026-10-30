import type { PageDictionary } from '../../../core/types'

/**
 * 项目（新版 Projects）：新建项目与模板。
 * 新建项目对话框（从头开始 / 系统模板 / 组织模板）、系统模板名称与简介、默认状态选项、
 * 从存储库或搜索查询导入项、查询构建器的限定符建议。
 */

/** 模板默认的单选选项名称 → 译文；用户自建选项原样保留 */
export const OPTION_NAMES: Readonly<Record<string, string>> = {
  Todo: '待办',
  'In Progress': '正在进行',
  'In progress': '正在进行',
  Done: '已完成',
  Backlog: '待办池',
  Ready: '就绪',
  'In review': '审查中',
  'No Status': '无状态',
}

export function translateOptionName(name: string): string {
  return OPTION_NAMES[name] ?? name
}

const AUTO_ADD_SUB_ISSUES: Readonly<Record<string, string>> = {
  ' and its sub-issues': '及其子议题',
  ' and their sub-issues': '及其子议题',
}

export default {
  static: {
    // 新建项目对话框（布局简介、模板简介原文没有的逗号不加）
    'Create project': '创建项目',
    'Creating project...': '正在创建项目...',
    'Creating project…': '正在创建项目…',
    'Project templates': '项目模板',
    'All templates': '所有模板',
    'View all featured templates': '查看所有精选模板',
    'View all templates from your organization': '查看来自你的组织的所有模板',
    'No templates yet': '暂无模板',
    'Templates can be used to quickly get started with a new project.': '使用模板可以快速开始新项目。',
    'New table': '新建表格',
    'New board': '新建看板',
    'New roadmap': '新建路线图',
    'Start with a powerful spreadsheet style table to filter, sort and group your issues and pull requests. Easily switch to a board or roadmap layout at any time.':
      '使用类似电子表格的表格筛选、排序和分组议题与拉取请求。可随时切换为看板或路线图布局。',
    'Start with a board to spread your issues and pull requests across customizable columns. Easily switch to a table or roadmap layout at any time.':
      '使用看板将议题和拉取请求分布到可自定义的列中。可随时切换为表格或路线图布局。',
    'Start with a roadmap for a high-level visualization of your project over time. Easily switch to a table or board layout at any time.':
      '使用路线图按时间线总览项目。可随时切换为表格或看板布局。',

    // 系统模板
    'Team planning': '团队规划',
    "Manage your team's work items, plan upcoming cycles, and understand team capacity":
      '管理团队的工作项，规划后续周期，了解团队容量',
    'Visualize the status of your project and limit work in progress': '直观呈现项目状态并限制进行中的工作量',
    'Feature release': '功能发布',
    "Manage your team's prioritized work items when planning for a feature release 🚀":
      '规划功能发布时管理团队按优先级排列的工作项 🚀',
    'Bug tracker': '缺陷跟踪',
    'Track and triage your bugs 🐛': '跟踪和分类缺陷 🐛',
    'Iterative development': '迭代开发',
    'Plan your current and upcoming iterations as you work through your prioritized backlog of items':
      '在处理按优先级排列的待办项时规划当前和后续迭代',
    'Product launch': '产品发布',
    'Manage work items across teams and functions when planning for a product launch 🚀':
      '规划产品发布时跨团队和职能管理工作项 🚀',
    "Manage your team's long term plans as you plan out your roadmap": '制定路线图时管理团队的长期计划',
    'Team retrospective': '团队回顾',
    'Reflect as a team what went well, what can be improved next time, and action items':
      '团队一起回顾做得好的地方、下次可改进之处和行动项',

    // 导入项
    'Import items from repository': '从存储库导入项',
    'Import items from search query': '从搜索查询导入项',
    'All new and existing items from the selected repository will be added to this project.':
      '所选存储库中的所有新增和现有项都将添加到此项目。',
    'All existing items matching the search query will be added to this project.':
      '所有与搜索查询匹配的现有项都将添加到此项目。',
    'Import items based on search query': '根据搜索查询导入项',
    'Items to import': '要导入的项',
    'We were unable to bulk import items at this time. Please try again.': '暂时无法批量导入项。请重试。',
    'Please specify a repo, org, or user in your query.': '请在查询中指定存储库、组织或用户。',
    'Enterprise environments require explicit repository scoping (repo:owner/name) for security. Organization and user qualifiers alone are not permitted.':
      '企业环境出于安全考虑要求明确指定存储库范围 (repo:owner/name)。不允许只使用组织或用户限定符。',
    'Select entities to add': '选择要添加的内容',
    'Import query': '导入查询',
    '0 items will be added': '不会添加任何项',
  },
  scoped: {
    // 通用文本（仅项目页生效）
    'Start from scratch': '从头开始',
    'From your organization': '来自你的组织',
    'Please provide a valid search query': '请提供有效的搜索查询',
    ...OPTION_NAMES,
    // 默认状态选项说明
    "This item hasn't been started": '此项尚未开始',
    'This is ready to be picked up': '可以开始处理',
    'This is actively being worked on': '正在处理中',
    'This item is in review': '此项正在审查',
    'This has been completed': '已完成',
    // 新建项目对话框
    'Search templates': '搜索模板',
    Kanban: '看板',
    Featured: '精选',
    'View all': '查看全部',
    'No results': '无结果',
    '1 result': '1 个结果',
    'Open issues and pull requests': '打开的议题和拉取请求',
    'Open issues': '打开的议题',
    'Open pull requests': '打开的拉取请求',
    'Server error': '服务器错误',
    'Error notification': '错误通知',
    // 新建项目对话框的状态图标（aria-label）
    'Green checkmark': '绿色对勾',
    Dash: '横线',
    from: '来自',
    // 批量添加的模式切换（Add from a <button>search query</button> instead）：整句由下方 inline 规则译出，
    // 不构成行内句时按以下片段翻译
    'Add from a': '改为从',
    'search query': '搜索查询',
    instead: '添加',
    // 查询构建器建议（批量添加、从搜索查询导入、存档项页）：限定符名
    Author: '作者',
    Assignee: '受理人',
    Label: '标签',
    Language: '语言',
    Involves: '涉及',
    Mentions: '提及',
    Commenter: '评论者',
    'Review Requested': '请求审查',
    'Reviewed By': '审查者',
    'User Review Requested': '请求用户审查',
    'Team review requested': '请求团队审查',
    Base: '基础分支',
    Head: '头部分支',
    Linked: '链接',
    Reason: '原因',
    'Review state': '审查状态',
    'Item Type': '项类型',
    'Closed date': '关闭日期',
    'Merge date': '合并日期',
    'Update date': '更新日期',
    'Comment count': '评论数',
    'Interactions count': '交互数',
    'Reaction count': '反应数',
    'Commit SHA': '提交 SHA',
    // 查询构建器建议：限定符说明
    'Filter by organization': '按组织筛选',
    'Filter by repository': '按存储库筛选',
    'Filter by label': '按标签筛选',
    'Filter by project': '按项目筛选',
    'The author of the item': '项的作者',
    'The assignee of the item': '项的受理人',
    'The user involved in the item': '涉及项的用户',
    'The user mentioned in the item': '项中提及的用户',
    'Items commented on by the user': '该用户评论过的项',
    'Items with review requested for the user': '请求该用户审查的项',
    'Items with review requested for the user explicitly': '明确请求该用户审查的项',
    'Items in repositories owned by the user': '该用户拥有的存储库中的项',
    'Specify archived or non-archived items only': '仅限已存档或未存档的项',
    'Pull Request base branch': '拉取请求的基础分支',
    'Head branch commit sha': '头部分支的提交 SHA',
    'Closing date': '关闭日期',
    'Updated date': '更新日期',
    'Item comment count': '项评论数',
    'Interaction count': '交互数',
    'Reactions count': '反应数',
    'Search for draft items': '搜索草稿项',
    'Restrict your search to the title, body, comments, or any combination of these':
      '将搜索范围限定为标题、正文、评论或其任意组合',
    'Items linked to an issue or pull request': '链接了议题或拉取请求的项',
    'Specify a review state': '指定审查状态',
    'Commit status: pending | success | failure': '提交状态：pending | success | failure',
    'Team name': '团队名称',
    'Review requested from team': '已请求团队审查',
    'Sort results': '排序结果',
    'Specify the type of item to search for: issue or pr': '指定要搜索的项类型：issue 或 pr',
    'Specify the type of issue to search for': '指定要搜索的议题类型',
    // 查询构建器建议：取值
    'Last 7 days': '最近 7 天',
    'Last 30 days': '最近 30 天',
    'This year': '今年',
    'Exactly 100': '正好 100',
    'Only archived items': '仅已存档的项',
    'Only non-archived items': '仅未存档的项',
    'Only draft items': '仅草稿项',
    'Only non-draft items': '仅非草稿项',
    'Match values in title': '匹配标题',
    'Match values in body': '匹配正文',
    'Match values in comments': '匹配评论',
    'Pull requests that are linked to an issue': '链接了议题的拉取请求',
    'Issue that are linked to pull requests': '链接了拉取请求的议题',
    'Items without a label': '没有标签的项',
    'Items without a milestone': '没有里程碑的项',
    'Items without a project': '没有项目的项',
    'Items that were closed as completed': '以已完成关闭的项',
    'Items that were closed as not planned': '以未计划关闭的项',
    'No reviews': '无审查',
    'Review required': '需要审查',
    'Has approving review': '有批准的审查',
    'Review requesting changes': '请求更改的审查',
    'Most commented': '评论最多',
    'Items with pending status': '状态为 pending 的项',
    'Items with success status': '状态为 success 的项',
    'Items with failure status': '状态为 failure 的项',
  },
  regexp: [
    [/^(\d+) results$/, '$1 个结果'],
    [
      /^The most recent 500 items( and (?:its|their) sub-issues)? will be added to the project$/,
      (_, subIssues?: string) =>
        `将把最近的 500 个项${subIssues ? (AUTO_ADD_SUB_ISSUES[subIssues] ?? '') : ''}添加到项目`,
    ],
    [
      /^(\d+) items?( and (?:its|their) sub-issues)? will be added$/,
      (_, count: string, subIssues?: string) =>
        `将添加 ${count} 个项${subIssues ? (AUTO_ADD_SUB_ISSUES[subIssues] ?? '') : ''}`,
    ],
  ],
  inline: [
    // 批量添加 / 从搜索查询导入的模式切换（bulk-add-configuration.tsx）：
    // <p>Add from a <button>search query</button> instead</p>，按钮文字 search query / repository 照常翻译
    ['Add from a {} instead', '改为从{}添加'],
  ],
} satisfies PageDictionary
