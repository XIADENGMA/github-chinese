import type { PageDictionary } from '../../../core/types'
import { joinCjk } from '../helpers'

/**
 * 快速搜索建议中的“探索”页面标题（未登录时显示）。
 * 产品名按用户要求译成中文（GitHub Actions → GitHub 操作、Codespaces → 代码空间）；
 * 品牌词 Copilot、技术缩写 CI/CD、MCP 与专名 The ReadME Project 保留；Enterprise、Team 是产品页导航名，同全局 static
 */
const EXPLORE_TITLES: Readonly<Record<string, string>> = {
  'GitHub Actions': 'GitHub 操作',
  Blog: '博客',
  'CI/CD': 'CI/CD',
  'Code review': '代码审查',
  Codespaces: '代码空间',
  'Community Discussions': '社区讨论',
  Copilot: 'Copilot',
  'Customer stories': '客户案例',
  Discussions: '讨论',
  Documentation: '文档',
  Enterprise: '企业',
  Features: '功能',
  'GitHub Security': 'GitHub 安全',
  'GitHub Sponsors': 'GitHub 赞助',
  'GitHub Pages': 'GitHub 页面',
  Integrations: '集成',
  Issues: '议题',
  'GitHub Mobile': 'GitHub 移动版',
  'GitHub Packages': 'GitHub 软件包',
  MCP: 'MCP',
  'Open Source': '开源',
  'Open Source Accelerator': '开源加速器',
  Pricing: '定价',
  Resources: '资源',
  'Secure your code': '保护你的代码',
  'Security features': '安全功能',
  'Software supply chain': '软件供应链',
  Solutions: '解决方案',
  Security: '安全',
  Startups: '初创企业',
  Team: '团队',
  'The ReadME Project': 'The ReadME Project',
  'The ReadME Podcast': 'The ReadME Podcast',
  Trending: '趋势',
  'Feature Previews': '功能预览',
  'Code Search': '代码搜索',
  'GitHub Changelog': 'GitHub 更新日志',
  'GitHub Shop': 'GitHub 商店',
  'GitHub Desktop': 'GitHub 桌面版',
  'Why GitHub': '为什么选择 GitHub'
}

const EXPLORE_TITLE_SOURCE = Object.keys(EXPLORE_TITLES)
  .map(title => title.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&'))
  .join('|')

/** “探索”加标题译文：译文以拉丁字母或数字开头时中间加空格 */
function exploreLabel(title: string): string {
  return joinCjk('探索', EXPLORE_TITLES[title] ?? title)
}

const SEARCH_SCOPE: Readonly<Record<string, string>> = {
  Organization: '组织',
  Enterprise: '企业',
  Owner: '所有者'
}

const SUGGESTION_KIND: Readonly<Record<string, string>> = {
  organization: '组织',
  repository: '存储库',
  owner: '所有者',
  language: '语言'
}

/** 全局搜索（快速搜索、已保存的搜索、反馈）与命令面板 */
export default {
  static: {
    // 快速搜索对话框
    'Quick search': '快速搜索',
    'Clear search': '清除搜索',
    'Search suggestions': '搜索建议',
    'Search syntax tips': '搜索语法提示',
    'Provide feedback': '提供反馈',
    'Jump to': '跳转到',
    Recent: '最近',
    Owners: '所有者',
    Saved: '已保存',
    Languages: '语言',
    'Saved queries': '已保存的查询',
    'Search all of GitHub': '搜索整个 GitHub',
    'All of GitHub': '整个 GitHub',
    'Search in this directory': '在此目录中搜索',
    'Search in this repository': '在此存储库中搜索',
    'Search in this organization': '在此组织中搜索',
    'Search in this enterprise': '在此企业中搜索',
    'Search in this owner': '在此所有者中搜索',
    'Open Copilot chat': '打开 Copilot 聊天',
    'Start a new Copilot thread': '开始新的 Copilot 对话',
    Autocomplete: '自动补全',
    'Manage saved searches': '管理已保存的搜索',
    'Manage saved searches, Action': '管理已保存的搜索，操作',
    'Community Discussions': '社区讨论',
    'GitHub Security': 'GitHub 安全',
    'Open Source Accelerator': '开源加速器',
    'Secure your code': '保护你的代码',
    'Security features': '安全功能',
    'Software supply chain': '软件供应链',
    'Feature Previews': '功能预览',
    'Code Search': '代码搜索',
    'GitHub Changelog': 'GitHub 更新日志',
    'GitHub Shop': 'GitHub 商店',
    // 旧版搜索框
    'Search code, repositories, users, issues, pull requests...': '搜索代码、存储库、用户、议题、拉取请求...',
    'Search code, repositories, users, issues, pull requests…': '搜索代码、存储库、用户、议题、拉取请求…',

    // 反馈对话框
    'We read every piece of feedback, and take your input very seriously.': '我们会阅读每一条反馈，并认真对待你的意见。',
    Feedback: '反馈',
    'Include my email address so I can be contacted': '附上我的电子邮件地址以便联系我',
    'Send feedback': '发送反馈',
    'Sending feedback': '正在发送反馈',
    'Submit feedback': '提交反馈',
    'Could not submit your feedback. Please try again.': '无法提交反馈。请重试。',
    'Could not submit your feedback. Please check your connection and try again.': '无法提交反馈。请检查网络连接后重试。',

    // 已保存的搜索对话框（数量上限提示由正则整体匹配）
    'Saved searches': '已保存的搜索',
    'Update saved search': '更新已保存的搜索',
    'Create saved search': '创建已保存的搜索',
    'Use saved searches to filter your results more quickly': '使用已保存的搜索更快地筛选结果',
    'Could not load your saved searches.': '无法加载已保存的搜索。',
    'Could not load saved searches.': '无法加载已保存的搜索。',
    Query: '查询',
    // “To see all available qualifiers, see our” + 链接 “documentation” + “.”
    'To see all available qualifiers, see our': '要查看全部可用的限定符，请参阅',
    documentation: '文档',
    "You don't have any saved searches yet.": '你还没有已保存的搜索。',
    'Saving saved search': '正在保存搜索',
    'Could not save your search. Please check the name and query and try again.': '无法保存搜索。请检查名称和查询后重试。',
    'Could not save your search. Please check your connection and try again.': '无法保存搜索。请检查网络连接后重试。',
    'Could not delete this saved search. Please try again.': '无法删除此已保存的搜索。请重试。',
    'Could not delete this saved search. Please check your connection and try again.': '无法删除此已保存的搜索。请检查网络连接后重试。',

    // 命令面板
    'Search GitHub': '搜索 GitHub',
    'Clear command palette': '清除命令面板',
    'Current scope:': '当前范围：',
    'Tip:': '提示：',
    'for help and tips': '查看帮助和提示',
    'Type ? for help and tips': '按 ? 查看帮助和提示',
    'Top result': '最佳结果',
    Commands: '命令',
    'Global commands': '全局命令',
    'This page': '此页面',
    'Access policies': '访问策略',
    'Issues and pull requests': '议题和拉取请求',
    Teams: '团队',
    Users: '用户',
    'Projects (classic)': '项目（经典）',
    Files: '文件',
    Modes: '模式',
    'Use filters in issues and pull requests': '在议题和拉取请求中使用筛选器',
    'Loading results...': '正在加载结果...',
    'Loading results…': '正在加载结果…',
    "Some results couldn't be loaded.": '部分结果无法加载。',
    "Results couldn't be loaded.": '无法加载结果。',
    'No results found.': '未找到结果。',
    'Some results may require single-sign on.': '部分结果可能需要单一登录。',
    'Press Backspace at the start of the input to remove a scope.': '在输入开头按 Backspace 可删除一个范围。',
    'Could not open that page. Please try again.': '无法打开该页面。请重试。',
    'Search issues and pull requests': '搜索议题和拉取请求',
    // @ 模式的输入框占位文字（服务端下发）：所有者范围、全局
    'Search or jump to a repository': '搜索或跳转到存储库',
    'Search or jump to a user, organization, or repository': '搜索或跳转到用户、组织或存储库',
    'Search prefix:': '搜索前缀：',
    'to jump to': '跳转',
    'to accept a scope or suggestion; otherwise, move focus.': '接受范围或建议；否则移动焦点。',
    'to move to dialog controls.': '移到对话框控件。',
    'to close.': '关闭。',
    'at the start of the input, with no text selected, removes one scope.': '在输入开头且未选中文本时，删除一个范围。',
    // 命令面板帮助
    'Search for': '搜索',
    'Search for issues and pull requests': '搜索议题和拉取请求',
    'issues and pull requests': '议题和拉取请求',
    'Search for organizations, repositories, and users': '搜索组织、存储库和用户',
    'organizations, repositories, and users': '组织、存储库和用户',
    repositories: '存储库',
    'Search for files': '搜索文件',
    files: '文件',
    'Search your issues and pull requests': '搜索你的议题和拉取请求',
    'Filter to pull requests': '仅筛选拉取请求',
    'Filter to issues': '仅筛选议题',
    'Filter to open issues and pull requests': '仅筛选打开的议题和拉取请求',
    // 命令面板提示（Tip:）：带前缀时是 Type <kbd>前缀</kbd> + 片段，引擎整句匹配；片段兜底
    'Type author:@me to search your issues and pull requests': '输入 author:@me 搜索你的议题和拉取请求',
    'Add : and a line number to jump to a specific line': '添加 : 和行号以跳转到指定行',
    'Press Tab on a repository to search within it': '在存储库上按 Tab 可在其中搜索',
    'Press Tab on an account or repository to search within it': '在帐户或存储库上按 Tab 可在其中搜索',
    'Type / to search files': '按 / 搜索文件',
    'Type @ to search repositories': '按 @ 搜索存储库',
    'Type @ to search organizations, repositories, and users': '按 @ 搜索组织、存储库和用户',
    'Type # to search issues and pull requests': '按 # 搜索议题和拉取请求',
    'to search files': '搜索文件',
    'to search repositories': '搜索存储库',
    'to search organizations, repositories, and users': '搜索组织、存储库和用户',
    'to search issues and pull requests': '搜索议题和拉取请求',
    'Go to your accessibility settings to change your keyboard shortcuts': '转到辅助功能设置更改键盘快捷方式',
    // 命令面板结果图标说明（议题、拉取请求状态由对应页面词典负责）
    'Private repository': '专用存储库',
    'Public repository': '公共存储库',
    // 命令面板页面目录
    'Issues: assigned to you': '议题：分配给你的',
    'Issues: mentioning you': '议题：提及你的',
    'Pull requests: assigned to you': '拉取请求：分配给你的',
    'Pull requests: mentioning you': '拉取请求：提及你的',
    'Pull requests: requesting your review': '拉取请求：请求你审查的',
    'Settings > Appearance': '设置 > 外观',
    'Settings > Accessibility': '设置 > 辅助功能',
    'Settings > Password and authentication': '设置 > 密码和身份验证',
    'Settings > Account security': '设置 > 帐户安全',
    'Settings > Sessions': '设置 > 会话',
    'Settings > Notifications': '设置 > 通知',
    'Settings > Emails': '设置 > 电子邮件',
    'Settings > SSH and GPG keys': '设置 > SSH 和 GPG 密钥',
    'Settings > Repositories': '设置 > 存储库',
    'Settings > Packages': '设置 > 软件包',
    'Settings > Saved replies': '设置 > 已保存回复',
    'Settings > Applications': '设置 > 应用',
    'Settings > Security log': '设置 > 安全日志',
    'Settings > Developer settings > GitHub Apps': '设置 > 开发人员设置 > GitHub 应用',
    'Settings > Developer settings > OAuth Apps': '设置 > 开发人员设置 > OAuth 应用',
    'Settings > Developer settings > Personal access tokens': '设置 > 开发人员设置 > 个人访问令牌',
    'Settings > Developer settings > Personal access tokens > Fine-grained tokens': '设置 > 开发人员设置 > 个人访问令牌 > 精细令牌',
    'Settings > Developer settings > Personal access tokens > Tokens (classic)': '设置 > 开发人员设置 > 个人访问令牌 > 令牌（经典）',

    // 旧版命令面板（开启功能预览后出现）。服务端下发的原文含讨论、项目，新版面板改写为上面只含议题和拉取请求的写法
    'Clear Command Palette': '清除命令面板',
    'Search issues, pull requests, discussions, and projects': '搜索议题、拉取请求、讨论和项目',
    'Issues, pull requests, and discussions': '议题、拉取请求和讨论',
    'Run a command': '运行命令',
    'Global Commands': '全局命令',
    'Type > to filter': '按 > 筛选',
    // 报错条（服务端模板 <command-palette-tip data-on-error>）：两句同一文本节点，整句收录；
    // 原文 We’ve 是弯撇号、aren't 是直撇号，另收全直、全弯写法。空态 No results matched your search 见 common-ui
    "We’ve encountered an error and some results aren't available at this time. Type a new search or try again later.":
      '出错了，部分结果暂时不可用。请重新搜索或稍后重试。',
    "We've encountered an error and some results aren't available at this time. Type a new search or try again later.":
      '出错了，部分结果暂时不可用。请重新搜索或稍后重试。',
    'We’ve encountered an error and some results aren’t available at this time. Type a new search or try again later.':
      '出错了，部分结果暂时不可用。请重新搜索或稍后重试。',
    // 左下角提示条：脚本写入 .js-command-palette-toasts 的 .Toast-content
    'Failed to run command': '运行命令失败',
    'Copy failed': '复制失败',
    // 提示：Type <kbd>前缀</kbd> + 片段，引擎整句匹配；片段兜底
    'Type # to search discussions': '按 # 搜索讨论',
    'Type # to search issues': '按 # 搜索议题',
    'Type # to search pull requests': '按 # 搜索拉取请求',
    'Type ! to search projects': '按 ! 搜索项目',
    'Type @ to search people and organizations': '按 @ 搜索人员和组织',
    'Type @ to search teams': '按 @ 搜索团队',
    'Type > to activate command mode': '按 > 进入命令模式',
    'to search discussions': '搜索讨论',
    'to search issues': '搜索议题',
    'to search pull requests': '搜索拉取请求',
    'to search projects': '搜索项目',
    'to search people and organizations': '搜索人员和组织',
    'to search teams': '搜索团队',
    'to activate command mode': '进入命令模式',
    'Type is:issue to filter to issues': '输入 is:issue 仅筛选议题',
    'Type is:pr to filter to pull requests': '输入 is:pr 仅筛选拉取请求',
    'Type is:project to filter to projects': '输入 is:project 仅筛选项目',
    'Type is:open to filter to open content': '输入 is:open 仅筛选打开的内容',
    'Type author:@me to search your content': '输入 author:@me 搜索你的内容',
    // 帮助项：Search for <strong>…,</strong> and <strong>…</strong>、Activate <strong>command mode</strong>，
    // 标题整段合并后按整句匹配（见 mergeText）；strong 内的片段不单独收录，users、projects 与搜索页的类型词同形
    'Search for issues, pull requests, discussions, and projects': '搜索议题、拉取请求、讨论和项目',
    'Search for projects': '搜索项目',
    'Activate command mode': '进入命令模式',
    'Use filters in issues, pull requests, discussions, and projects': '在议题、拉取请求、讨论和项目中使用筛选器',
    'Search your issues, pull requests, and discussions': '搜索你的议题、拉取请求和讨论',
    'Filter to discussions': '仅筛选讨论',
    'Filter to projects': '仅筛选项目',
    'Filter to open issues, pull requests, and discussions': '仅筛选打开的议题、拉取请求和讨论',
    // 底部搜索项的片段兜底（整句见 inline）
    'across all of GitHub': '在整个 GitHub 中',
    // 命令（> 模式）。命令列表项的破折号前缀与命令名在同一文本节点
    '– New repository': '– 新建存储库',
    '– Import repository': '– 导入存储库',
    '– New project': '– 新建项目',
    '– New discussion': '– 新建讨论',
    '– New organization': '– 新建组织',
    '– New gist': '– 新建代码片段',
    '– New issue': '– 新建议题',
    '– New file': '– 新建文件',
    '– Change tab size rendering': '– 更改制表符渲染宽度',
    '– Switch theme': '– 切换主题',
    'New file': '新建文件',
    'Transfer issue…': '转移议题…',
    'Clone repository: Copy HTTPS': '克隆存储库：复制 HTTPS',
    'Clone repository: Copy SSH': '克隆存储库：复制 SSH',
    'Clone repository: Copy GitHub CLI': '克隆存储库：复制 GitHub CLI',
    // 更改制表符宽度的子页；作用域标记里的命令名被截断，省略号随原文
    'Change tab size rendering': '更改制表符渲染宽度',
    'Change tab size r...': '更改制表符渲染宽度...',
    '2 spaces': '2 个空格',
    '3 spaces': '3 个空格',
    '4 spaces': '4 个空格',
    '5 spaces': '5 个空格',
    '6 spaces': '6 个空格',
    '7 spaces': '7 个空格',
    '8 spaces': '8 个空格',
    '9 spaces': '9 个空格',
    '10 spaces': '10 个空格',
    '12 spaces': '12 个空格',
    // 切换主题的子页（主题名同外观设置的 Dark default 等）
    'Switch theme': '切换主题',
    'Default dark': '深色默认',
    'Default light': '浅色默认',
    'Switch theme to dark high contrast': '将主题切换为深色高对比度',
    'Sync with system settings': '跟随系统设置'
  },
  regexp: [
    // 快速搜索：“探索”建议
    [new RegExp(`^Explore (${EXPLORE_TITLE_SOURCE})$`), (_, title) => exploreLabel(title)],
    // 快速搜索：上下文建议的无障碍名称（变量为搜索词、存储库、组织）
    [/^Search GitHub for (.+)$/, '在 GitHub 中搜索 $1'],
    [/^Search this directory for (.+)$/, '在此目录中搜索 $1'],
    [
      /^Search (Organization|Enterprise|Owner) ([\w.-]+) for (.+)$/,
      (_, scope, name, query) => `在${SEARCH_SCOPE[scope] ?? scope} ${name} 中搜索 ${query}`
    ],
    [/^Search ([\w.-]+\/[\w.-]+) for (.+)$/, '在 $1 中搜索 $2'],
    [/^Recent search: (.+)$/, '最近搜索：$1'],
    [/^Jump to (.+), (organization|repository)$/, (_, name, kind) => `跳转到 ${name}（${SUGGESTION_KIND[kind] ?? kind}）`],
    // 限定符值可含空格：language:"Objective C"、license:"MIT License"、saved:"my search"
    [
      /^Autocomplete (.+) scope, (organization|repository|owner|language)$/,
      (_, value, kind) => `自动补全 ${value} 范围（${SUGGESTION_KIND[kind] ?? kind}）`
    ],
    [/^Autocomplete (.+) qualifier value$/, '自动补全 $1 限定符值'],
    [/^(saved:.+), Autocomplete$/, '$1，自动补全'],
    [/^(.+), jump to this code$/, '$1，跳转到此代码'],
    // 已保存搜索数量上限（React 拆分的数字与文字拼接后）
    [
      /^Limit of (\d+) saved searches reached\. Please delete an existing saved search before creating a new one\.$/,
      '已达到 $1 个已保存搜索的上限。请先删除现有的已保存搜索再创建新的。'
    ]
  ],
  inline: [
    // 旧版命令面板底部的搜索项：Search<strong> '查询' </strong>across all of GitHub（空格在 strong 内）；
    // 存储库、所有者范围内末段是 in owner/repo、in owner
    ['Search {} across all of GitHub', '在整个 GitHub 中搜索{}'],
    [/^Search \{\} in ([\w.-]+(?:\/[\w.-]+)?)$/, '在 $1 中搜索{}']
  ],
  // 旧版命令面板帮助项的标题：服务端模板 <command-palette-help> 的标题元素，以及据此渲染的列表项
  // （标题以 innerHTML 写入内层 span）。<strong> 拆开的标题整段合并后匹配
  mergeText: ['[data-target="command-palette-help.titleElement"]', '[data-target="command-palette-item.titleElement"] > span']
} satisfies PageDictionary
