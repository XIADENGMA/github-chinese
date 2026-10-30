import type { PageDictionary } from '../../../core/types'
import { joinCjk } from '../helpers'

/** 编辑器屏幕阅读器标题里的文件类型 */
const EDITOR_KIND: Readonly<Record<string, string>> = {
  workflow: '工作流',
  dependabot: 'Dependabot',
  devcontainer: 'devcontainer',
  'issue template': '议题模板',
  'discussion template': '讨论模板',
}

const EDITOR_KIND_SOURCE = '(workflow|dependabot|devcontainer|issue template|discussion template)'

/** 「工作流文件」「Dependabot 文件」；未给类型时为「文件」 */
function editorFile(kind: string | undefined): string {
  return kind ? joinCjk(EDITOR_KIND[kind] ?? kind, '文件') : '文件'
}

/**
 * 编辑器（new / edit）、提交对话框、推送保护、上传页（upload，Rails）、删除页（delete）。
 * 提交消息占位符（Update / Create / Delete <文件>）会成为提交消息的默认值，不翻译。
 * 产品名、方案名按 product-names.md 译出（Marketplace → 市场、GitHub Team → GitHub 团队版）；
 * 标点随原文：原文没有的冒号、逗号、括号不加。
 */
export default {
  static: {
    // 编辑器头部
    'File name': '文件名',
    'Name your file...': '为文件命名...',
    'Cancel changes': '取消更改',
    'Commit changes...': '提交更改...',
    'Show diff': '显示差异',
    'Indent mode': '缩进模式',
    'Indent size': '缩进大小',
    'Line wrap mode': '换行模式',
    'No wrap': '不换行',
    'Soft wrap': '软换行',
    'You have unsaved changes. Do you want to discard them?': '有未保存的更改。是否放弃？',
    'Choose a license template': '选择许可证模板',
    'Choose a code of conduct template': '选择行为准则模板',
    'Choose .gitignore template': '选择 .gitignore 模板',
    'Template filter': '模板筛选器',

    // 编辑区：屏幕阅读器标题（新建文件时没有文件名）
    'Editing file contents': '编辑文件内容',
    // 编辑区底部的焦点提示（含 kbd，整句匹配后按快捷键文字写回；整句未命中时用下方片段）
    'Use Control + Shift + m to toggle the tab key moving focus. Alternatively, use esc then tab to move to the next interactive element on the page.':
      '使用 Control + Shift + m 切换 tab 键是否移动焦点。也可以按 esc 再按 tab 移到页面上的下一个交互元素。',
    // 片段：使用 <Control + Shift + m> 切换 <tab> 键是否移动焦点。也可以按 <esc> 后再按 <tab> …
    'to toggle the': '切换',
    'key moving focus. Alternatively, use': '键是否移动焦点。也可以按',
    'to move to the next interactive element on the page.': '移到页面上的下一个交互元素。',
    // 工作流编辑器底部的自动补全提示（含 kbd；macOS 多一个 Option + Space）
    'Use Control + Space to trigger autocomplete in most situations.':
      '使用 Control + Space 可在大多数情况下触发自动补全。',
    'Use Control + Space or Option + Space to trigger autocomplete in most situations.':
      '使用 Control + Space 或 Option + Space 可在大多数情况下触发自动补全。',
    'Use Tab to navigate to the next placeholder.': '使用 Tab 可跳到下一个占位符。',
    // 片段：使用 <Control + Space> 或 <Option + Space> 可在大多数情况下触发自动补全。
    'to trigger autocomplete in most situations.': '可在大多数情况下触发自动补全。',
    'to navigate to the next placeholder.': '可跳到下一个占位符。',
    // 工作流编辑器的 YAML 校验弹层
    'Suggested fixes': '建议的修复',
    'Other suggestions…': '其他建议…',

    // 预览
    'Loading preview…': '正在加载预览…',
    'The document has been deleted.': '此文档已删除。',
    'The document was renamed without changes.': '此文档已重命名且内容无更改。',
    'There are no changes to show.': '无更改。',
    'There is no content to preview.': '无可预览内容。',
    'There has been an error generating the preview.': '生成预览时出错。',
    'But you can preview the whole file.': '但可以预览整个文件。',
    'There has been an error generating the preview. But you can preview the whole file.':
      '生成预览时出错。但可以预览整个文件。',
    'Error getting preview': '获取预览出错',
    'Unable to load this preview, sorry.': '无法加载此预览。',

    // Markdown 文件附件（出错提示：<Try again> with …，与 common-ui 的文件类型片段同用「并改用」）
    'Attach files by dragging & dropping, selecting or pasting them.': '拖放、选择或粘贴文件以附加。',
    'Attach files by selecting or pasting them.': '选择或粘贴文件以附加。',
    'Uploading your files…': '正在上传文件…',
    'We don’t support that file type.': '不支持此文件类型。',
    'Attaching documents requires write permission to this repository.': '附加文档需要此存储库的写入权限。',
    "Yowza that's a big file.": '文件过大。',
    'with a file size less than 10MB.': '并改用小于 10MB 的文件。',
    'This file is empty.': '此文件为空。',
    'with a file that’s not empty.': '并改用非空文件。',
    'This file is hidden.': '此文件为隐藏文件。',
    'with another file.': '并改用其他文件。',
    'Something went really wrong, and we can’t process that file.': '出现严重错误，无法处理此文件。',
    'Styling with Markdown is supported': '支持 Markdown 样式',

    // 编辑页加载出错（如文件不存在；标题 Something went wrong 由通用词典处理）
    'The requested page could not be found.': '找不到请求的页面。',

    // 编辑权限问题
    'You are not authorized to create pull requests in this repository': '你无权在此存储库中创建拉取请求',
    'The repository owner has restricted who can propose changes.': '存储库所有者已限制可提议更改的人员。',
    'The repository owner has restricted who can propose changes. If you need help, view the':
      '存储库所有者已限制可提议更改的人员。如需帮助，请查看',
    'Pull requests cannot be created in this repository': '无法在此存储库中创建拉取请求',
    'The repository owner has disabled pull requests.': '存储库所有者已禁用拉取请求。',
    'The repository owner has disabled pull requests. If you need help, view the':
      '存储库所有者已禁用拉取请求。如需帮助，请查看',
    'If you need help, view the': '如需帮助，请查看',
    'support resources': '支持资源',
    'This repository is currently being migrated.': '此存储库正在迁移。',
    'Sorry, you’re not able to edit this repository while the migration is in progress.': '迁移期间无法编辑此存储库。',
    'You are over your repository limit': '存储库数量已超出上限',
    'Sorry, you’re not able to fork this repository.': '无法复刻此存储库。',
    'You need to fork this repository to propose changes.': '须复刻此存储库才能提议更改。',
    // 原文只有破折号连接两个分句：—— 两侧不加空格，不再加逗号
    'Sorry, you’re not able to edit this repository directly—you need to fork it and propose your changes from there instead.':
      '无法直接编辑此存储库——须先复刻再在复刻中提议更改。',
    'Sorry, it looks like your fork is outdated!': '你的复刻已过时！',
    'You’ll have to bring it up to date before you can propose changes.': '须先更新复刻才能提议更改。',
    'Binary file content is not editable.': '二进制文件内容不可编辑。',
    'But you can still rename or move it.': '但仍可重命名或移动。',
    'Forking this .github repository affects default community health files':
      '复刻此 .github 存储库会影响默认社区健康文件',
    'This is a `.github` repository.': '这是一个 `.github` 存储库。',
    "Forking it to propose changes will use this repository's": '复刻以提议更改时将使用此存储库的',
    'community health files': '社区健康文件',
    "as the publicly visible defaults for all repositories owned by your fork's account that don't have their own. Review the contents of this repository before forking.":
      '作为复刻所属帐户下所有未自带此类文件的存储库的公开默认文件。复刻前请检查此存储库的内容。',
    'Update your fork': '更新你的复刻',
    'Learn more repository limits': '了解存储库数量限制',
    'Learn more about forks': '了解复刻',

    // 编辑器横幅
    // 复刻编辑横幅（EditingForkBanner）：…in your fork <b>owner/repo</b>, so you can send a pull request.
    // 整句由 inline 调整语序；此为整句未命中时的片段（原文无逗号，不加逗号）：
    // …写入新分支。新分支位于你的复刻 <owner/repo>，之后可发送拉取请求。（复刻名紧跟「复刻」，不被读成分支名）
    'You’re making changes in a project you don’t have write access to. Submitting a change will write it to a new branch in your fork':
      '你正在更改没有写入访问权限的项目。提交的更改将写入新分支。新分支位于你的复刻',
    ', so you can send a pull request.': '，之后可发送拉取请求。',
    'shows the community how to support this project. Please see our': '向社区展示支持此项目的方式。请参阅',
    'repository funding links documentation': '存储库赞助链接文档',
    "for more information on formatting and what is and isn't allowed in this file.":
      '以了解格式以及此文件中允许和禁止的内容。',
    'Please note that funding links are currently': '请注意此存储库的赞助链接当前',
    'on this repository. Visit': '。请前往',
    'repository settings': '存储库设置',
    'to enable display of your funding links.': '启用赞助链接显示。',
    'Looks like this file is an': '此文件似乎是',
    'issue template config': '议题模板配置',
    '. Need help? Check out the': '。需要帮助？请查看',
    'documentation.': '文档。',
    'Looks like this file is an issue template. Need help?': '此文件似乎是议题模板。需要帮助？',
    'Looks like this file is a custom slash command. Need help? Check out the':
      '此文件似乎是自定义斜杠命令。需要帮助？请查看',
    'file helps users to easily cite your software from the repository overview.':
      '文件可帮助用户从存储库概述引用你的软件。',
    'Insert example': '插入示例',
    'Parent directory contains leading or trailing whitespace.': '父目录名称首尾包含空白。',
    'We’ve detected the file has mixed line endings. When you commit changes we will normalize them to':
      '检测到此文件的换行符不一致。提交更改时将统一为',
    'Windows-style': 'Windows 风格',
    'is a special repository: its': '是一个特殊存储库：其',
    'will appear on your profile!': '将显示在你的个人资料中！',
    'is a special repository: this': '是一个特殊存储库：此',
    'will appear on your public organization profile, visible to anyone.': '将显示在组织的公开个人资料中，所有人可见。',
    'will appear on your organization member profile, visible only to organization members.':
      '将显示在组织的成员个人资料中，仅组织成员可见。',
    'We’ve detected the file encoding as': '检测到此文件的编码为',
    '. When you commit changes we will transcode it to': '。提交更改时将转码为',
    'Unsaved changes': '未保存的更改',
    'You have unsaved changes on this file that can be restored.': '此文件有可恢复的未保存更改。',
    'This workflow will fail until runners are configured for the repository. Finish setting up GitHub Actions by':
      '此工作流在存储库配置运行器之前将一直失败。完成 GitHub 操作设置需要',
    'adding runners': '添加运行器',

    // 赞助文件预览（FUNDING.yml；含文件名的句子由 regexp 处理；产品名 Sponsors → 赞助）
    'Apply to Sponsors.': '申请加入赞助。',
    'Some users provided are not enrolled in GitHub Sponsors.': '部分用户未加入 GitHub 赞助。',

    // 帮助面板（工作流、devcontainer 编辑器；产品名 Marketplace → 市场）
    'Cannot retrieve help documentation at this time.': '暂时无法获取帮助文档。',
    'Close help panel': '关闭帮助面板',
    'Help panel': '帮助面板',
    'Collapse help panel': '折叠帮助面板',
    'Expand help panel': '展开帮助面板',
    'Search Marketplace for Actions': '在市场中搜索操作',
    'Featured actions': '精选操作',
    'There was a problem loading the actions from the marketplace.': '从市场加载操作时出错。',
    'Searching Marketplace': '正在搜索市场',
    'Loading featured actions': '正在加载精选操作',
    'Browse all actions on the GitHub Marketplace': '在 GitHub 市场中浏览所有操作',
    // 后接 <devcontainer.json> 与「 file.」（文件。）
    'Copy and paste the following snippet into the features attribute of your':
      '将以下代码片段复制粘贴到以下文件的 features 属性中',
    'Version:': '版本：',
    'Copy snippet to clipboard': '将代码片段复制到剪贴板',
    'Couldn’t load snippet.': '无法加载代码片段。',
    "Couldn't load versions.": '无法加载版本。',
    'View full Marketplace listing': '查看完整的市场上架信息',
    'No results found. Try a different search.': '未找到结果。请尝试其他搜索。',
    'Search results pages': '搜索结果页',
    'Featured categories': '精选类别',
    'Search for features': '搜索功能',
    'There was a problem loading features.': '加载功能时出错。',
    'Searching features': '正在搜索功能',
    'Loading features': '正在加载功能',
    'Development containers': '开发容器',
    'are configuration files used by Codespaces and tools implementing the dev container specification.':
      '是代码空间及实现了开发容器规范的工具所使用的配置文件。',
    'These files allow you to create a consistent, sharable development environment.':
      '借助这些文件可以创建一致、可共享的开发环境。',
    "Dev Container Features are self-contained units of installation code and development container configuration. Features are designed to install atop a wide-range of base container images. Be sure to check a Feature's documentation to see which base images are supported.":
      '开发容器功能是独立的安装代码和开发容器配置单元。功能可安装在多种基础容器映像之上。请查看各功能的文档以确认支持哪些基础映像。',
    'To reference a Feature, add the desired Feature(s) to a': '要引用功能，请将所需功能添加到',
    ". See a Feature's README for available options, or leave the options empty to use the default value.":
      '。可用选项见各功能的自述文件，选项留空则使用默认值。',
    'Example devcontainer.json': '示例 devcontainer.json',

    // 提交对话框
    'Propose changes': '提议更改',
    'Sign off and commit changes': '签署并提交更改',
    'Sign off and propose changes': '签署并提议更改',
    'Bypass rules and commit changes': '绕过规则并提交更改',
    // 经典提交表单（议题模板编辑器等）的扩展描述：标签与占位符
    'Extended commit message': '扩展提交消息',
    'Add an optional extended description': '添加可选的扩展描述',
    'There was an error committing your changes:': '提交更改时出错：',
    // 提交出错（服务端下发）：<用户> has committed since you started editing. <See what changed>
    'A file with the same name already exists. Please choose a different name and try again.':
      '已存在同名文件。请换个名称重试。',
    'See what changed': '查看更改',
    'Something went wrong. Please fork the project, then try from your fork.':
      '出错了。请复刻此项目，然后在复刻中重试。',
    'Copilot is thinking...': 'Copilot 正在思考...',
    'Regenerate commit message': '重新生成提交消息',
    'Copilot commit message generated:': 'Copilot 已生成提交消息：',
    'Message and description suggested by Copilot.': '提交消息和描述由 Copilot 建议。',
    'Choose an email address for': '选择用于',
    'signing off': '签署',
    'on this commit': '此提交的电子邮件地址',
    'Direct commit or PR': '直接提交或拉取请求',
    'Direct commits are disabled for closed pull requests.': '已关闭的拉取请求禁止直接提交。',
    'Commit directly to the': '直接提交到',
    'You can’t commit to': '无法提交到',
    'because it is a': '因为它是',
    'protected branch': '受保护分支',
    'Some rules will be bypassed by committing directly': '直接提交将绕过部分规则',
    'for this commit': '用于此提交',
    // 拉取请求语境的 start 与 open 同作「创建」（术语表 pull request 行）
    'for this commit and start a pull request': '用于此提交并创建拉取请求',
    'for this commit and start a pull request.': '用于此提交并创建拉取请求。',
    'Branch Name': '分支名称',
    'PR target branch': '拉取请求目标分支',
    'New branch name can not be "HEAD"': '新分支名称不能为“HEAD”',
    'Changes to commit': '要提交的更改',
    'File could not be edited': '无法编辑文件',
    'protected branch rules': '分支保护规则',
    'Your protected branch rules': '你的分支保护规则',
    // 分支保护未生效横幅：Your <protected branch rules> <main> branch won't be enforced…
    // （方案名译「X 版」；原文只有句号，译文不加冒号、逗号）
    "branch won't be enforced on this private repository until you upgrade this organization to a GitHub Team or Enterprise account.":
      '分支在此组织升级到 GitHub 团队版或企业版帐户之前不会在此专用存储库中强制实施。',
    "branch won't be enforced on this private repository until you move to a GitHub Team or Enterprise account.":
      '分支在转为 GitHub 团队版或企业版帐户之前不会在此专用存储库中强制实施。',
    "branch won't be enforced on this private repository until you move to a GitHub Team organization account.":
      '分支在转为 GitHub 团队版组织帐户之前不会在此专用存储库中强制实施。',
    "branch won't be enforced on this private repository until you upgrade this organization to GitHub Team.":
      '分支在此组织升级到 GitHub 团队版之前不会在此专用存储库中强制实施。',
    "branch won't be enforced on this private repository until your organization admins upgrade this organization account to GitHub Team.":
      '分支在组织管理员将此组织帐户升级到 GitHub 团队版之前不会在此专用存储库中强制实施。',
    'targeting your': '针对你的',
    'The rulesets targeting your': '规则集针对你的',
    "You've successfully submitted a request to your organization's admins for this feature.":
      '已向组织管理员提交此功能的申请。',

    // 推送保护（检测到机密）：Secret scanning found a custom pattern named <b>…</b>, defined by your admins, on <a>line 3</a>.
    // （逗号随原文，不改写成括号）
    'used AI to flag a': '使用 AI 标记了',
    'likely secret': '疑似机密',
    'found a': '发现了',
    'found a custom pattern named': '发现了自定义模式',
    ', defined by your admins,': '，由管理员定义，',
    ', defined by your admins, on': '，由管理员定义，位于',
    'secret on': '机密位于',
    'secret.': '机密。',
    'in your attempted push': '在你尝试的推送中',
    'in your attempted push on': '在你尝试的推送中位于',
    // 命令行推送时，类型名之后的片段会与「in your attempted push」拼成一段
    'in your attempted push.': '在你尝试的推送中。',
    'secret in your attempted push on': '机密在你尝试的推送中位于',
    'secret in your attempted push.': '机密在你尝试的推送中。',
    ', defined by your admins, in your attempted push on': '，由管理员定义，在你尝试的推送中位于',
    ', defined by your admins, in your attempted push.': '，由管理员定义，在你尝试的推送中。',
    ', defined by your admins,.': '，由管理员定义。',
    'Remove detected secrets': '删除检测到的机密',
    'Review guidance': '查看指南',
    'review guidance': '查看指南',
    'remove any detected secrets': '删除所有检测到的机密',
    'Remove any detected secrets': '删除所有检测到的机密',
    // <Link>Remove any detected secrets</Link> <span>from your commit and commit history.</span>（AllowSecretBody）：
    // 两段各在一个元素内，行内句调不了语序；地点状语只能接在链接之后，用括号补出（测试中登记为标点例外）
    'from your commit and commit history.': '（从提交及提交历史记录中）。',
    'Or request bypass privileges': '或申请绕过权限',
    'Submit a request to bypass these push protections. If granted, you may attempt this push again.':
      '提交绕过这些推送保护的申请。获批后可再次尝试推送。',
    'Allowing this secret risks exposure. Instead,': '允许此机密存在泄露风险。建议',
    'removing the secret from your commit and commit history': '从提交及提交历史记录中删除此机密',
    'Exposing this secret can allow someone to:': '泄露此机密可能使他人能够：',
    'Verify the identity of this': '验证此',
    'Use this leaked secret to attempt unauthorized access': '利用泄露的机密尝试未授权访问',
    'Know which resources this secret can access': '获知此机密可访问的资源',
    "Act on behalf of the secret's owner": '以机密所有者的身份行事',
    'Push this secret to this repository without being blocked': '将此机密推送到此存储库而不被阻止',
    'Push protection is enabled for your account. To disable, visit your': '你的帐户已启用推送保护。如需禁用，请前往',
    'code security settings': '代码安全设置',
    'Bypass reason': '绕过原因',
    "It's used in tests": '用于测试',
    'The secret poses no risk. If anyone finds it, they cannot do any damage or gain access to sensitive information.':
      '此机密没有风险。即使被他人发现，也无法造成损害或访问敏感信息。',
    "It's not a real secret": '不是真实的机密',
    "It's a false positive": '误报',
    "It's not a real secret or is a harmless value.": '不是真实的机密或是无害的值。',
    'The detected string is not a secret.': '检测到的字符串不是机密。',
    "I'll fix it later": '稍后修复',
    'The secret is real,': '此机密是真实的，',
    'I understand the risk': '我了解风险',
    ', and I will need to revoke it. This will open a security alert and notify admins of this repository.':
      '，我需要将其撤销。这将创建安全警报并通知此存储库的管理员。',
    'Start request': '发起申请',
    'Allow Secret': '允许机密',
    'Secret allowed. You can now commit these changes.': '已允许此机密。现在可以提交这些更改。',
    'An error occurred when allowing your secret. Please try again.': '允许机密时出错。请重试。',
    "Blocked something we shouldn't have?": '误拦了内容？',

    // 删除页
    "The diff you're trying to view is too large. We only load the first 1000 changed files.":
      '差异过大。仅加载前 1000 个已更改的文件。',

    // 上传页（Rails）
    'Drag files here to add them to your repository': '将文件拖到此处以添加到存储库',
    'Drag additional files here to add them to your repository': '将更多文件拖到此处以添加到存储库',
    'choose your files': '选择文件',
    'Or choose your files': '或选择文件',
    // 未指定分支时跳回存储库首页的错误横幅
    'Select a branch to upload files': '选择要上传文件的分支',
    'Yowza, that’s a big file. Try again with a file smaller than 25MB.': '文件过大。请使用小于 25MB 的文件重试。',
    'Yowza, that’s a lot of files. Try uploading fewer than 100 at a time.': '文件过多。请一次上传少于 100 个文件。',
    'Choose your files': '选择文件',
    'Remove this file': '删除此文件',
    'Commit choice': '提交方式',
    'Processing your files…': '正在处理文件…',
    'Uploads are disabled.': '上传已禁用。',
    'File uploads require push access to this repository.': '上传文件需要此存储库的推送权限。',
    'Learn more about pull requests.': '了解拉取请求。',
  },

  scoped: {
    // 编辑器（Discard、Try again、Filter…、Replace、Saving...、Featured、Restore 由通用词典处理）
    in: '位于',
    disabled: '已禁用',
    // 缩进模式下拉框（与 gist 一致；不放 static：Copilot 页的 Spaces 是「空间」）
    Spaces: '空格',
    Tabs: '制表符',
    'Adding a': '添加',
    // 附件出错提示里的链接（Something went really wrong… <Try again.>）
    'Try again.': '重试。',
    'file.': '文件。',
    Installation: '安装',
    'All categories': '所有类别',
    Usage: '用法',
    by: '来自',
    // 编辑区底部提示的句首（快捷键在 <kbd> 中；连接词 then 由通用词典译为「再按」）
    Use: '使用',
    // 附件栏：Attach files by + dragging & dropping, + selecting or pasting them.（通常拼接成整句匹配）
    'Attach files by': '附加文件可',
    'dragging & dropping,': '拖放、',
    'selecting or pasting them.': '选择或粘贴。',

    // CodeMirror 搜索面板
    next: '下一个',
    previous: '上一个',
    all: '全部',
    'match case': '区分大小写',
    regexp: '正则',
    'by word': '全词匹配',
    replace: '替换',
    'replace all': '全部替换',
    close: '关闭',
    'Go to line': '转到行',
    go: '转到',
    // CodeMirror 折叠、校验、自动补全
    'folded code': '已折叠的代码',
    unfold: '展开',
    'Selection deleted': '已删除所选内容',
    Diagnostics: '诊断',
    'No diagnostics': '无诊断',
    Completions: '补全',

    // 提交对话框（与拉取请求的合并、建议提交表单共用的字段；
    // Add an optional extended description…、New branch name 由其他页面的全局词条处理）
    'Commit message': '提交消息',
    'Commit summary': '提交摘要',
    'Extended description': '扩展描述',
    'Optional extended description': '可选的扩展描述',
    'Great commit summaries contain fewer than 50 characters. Place extra information in the extended description.':
      '提交摘要最好少于 50 个字符。其余信息写在扩展描述中。',
    'Commit Email': '提交电子邮件',
    'You are': '你正在',
    'Create a': '创建',
    'new branch': '新分支',
    'Learn more about pull requests': '了解拉取请求',
    rulesets: '规则集',
    // 提交出错（违反规则）的 Repository rule violations found: 等由提交页的全局词条处理
    // 分支保护未生效横幅中的功能申请按钮
    'Ask enterprise owners for access': '向企业所有者申请访问权限',
    'Requesting...': '申请中...',
    'Cancelling...': '取消中...',
    // 复刻后编辑失败的提示
    'An unexpected error occurred. Please try again.': '发生意外错误。请重试。',

    // 删除页（与提交、拉取请求的差异视图共用；Load diff、This file was deleted. 由提交页的全局词条处理）
    'Expand diff': '展开差异',
    'Collapse diff': '折叠差异',
    'Copy path to clipboard': '复制路径到剪贴板',
    'Failed to load diff': '差异加载失败',

    // 推送保护（Share feedback 由通用词典处理）
    'Secret scanning': '机密扫描',
    secret: '机密的身份',
    on: '位于',
    from: '来自',
    consider: '考虑',

    // 上传页
    Or: '或',
    Uploading: '正在上传',
    of: '/',
    files: '个文件',
    'This file is': '此文件',
    empty: '为空',
    'branch.': '分支。',
    'Add files via upload': '通过上传添加文件',
  },

  regexp: [
    // 编辑器屏幕阅读器标题
    [
      new RegExp(`^Creating a new (?:${EDITOR_KIND_SOURCE} )?file in (\\S+)$`),
      (_, kind: string, repo: string) => joinCjk(`在 ${repo} 中新建`, editorFile(kind)),
    ],
    [
      new RegExp(`^Editing (?:${EDITOR_KIND_SOURCE} file )?(\\S.*) in (\\S+)$`),
      (_, kind: string, name: string, repo: string) => `${joinCjk(`编辑 ${repo} 中的`, editorFile(kind))} ${name}`,
    ],
    [/^Editing (\S.*) file contents$/, '编辑 $1 文件内容'],

    // CodeMirror 搜索播报：current match. <匹配处上下文> on line 3.（原文只有句号，译文不加冒号、逗号）
    [/^current match\. (.*) on line (\d+)\.$/, '当前匹配。第 $2 行的 $1。'],
    [/^replaced (\d+) match(?:es)?\.$/, '已替换 $1 处匹配。'],
    [/^replaced match on line (\d+)\.$/, '已替换第 $1 行的匹配。'],

    // 赞助文件预览：文件名是相邻文本节点，整句匹配
    [/^Some errors were encountered when parsing the (\S+) file:$/, '解析 $1 文件时出错：'],
    [/^The (\S+) file does not currently contain valid funding links\.$/, '$1 文件当前不包含有效的赞助链接。'],
    [/^Learn more about formatting (\S+)$/, '了解 $1 的格式'],

    // 帮助面板
    [/^Search Marketplace for (\S.*) Actions$/, '在市场中搜索 $1 操作'],
    [/^Search for (\S.*) features$/, '搜索 $1 功能'],
    [/^Code snippet for (\S.*)$/, '$1 的代码片段'],
    [/^Your search has returned ([\d,]+) results?\.$/, '搜索返回 $1 个结果。'],

    // 提交对话框：签署电子邮件（You are <signing off> on this commit as <邮箱>；整句由 inline 调整语序，
    // 此为整句未命中时的片段：原文无标点，译文不加逗号、冒号）
    [/^on this commit as (\S+)$/, '此提交并署名为 $1'],
    // 提交出错：文件已被他人更新
    [/^(\S+) has committed since you started editing\.$/, '$1 在你开始编辑后提交了更改。'],

    // 推送保护：机密所在行
    [/^line (\d+)$/, '第 $1 行'],

    // 删除页
    [
      /^Deleting (directory )?(\S.*)\. Commit changes to save\.$/,
      (_, dir: string, path: string) => `正在删除${dir ? '目录' : ''} ${path}。提交更改后生效。`,
    ],
    [/^Failed to load diff: (\d+)$/, '差异加载失败：$1'],

    // 上传页：文件列表中的删除按钮（Remove <文件名>）、屏幕阅读器标题
    [/^Remove (\S+)$/, '删除 $1'],
    [/^Uploading files to (\S+)$/, '上传文件到 $1'],
  ],

  inline: [
    // 提交对话框的签署说明（WebCommitDialog，React 把 {' '} 渲染成单独的文本节点；链接 signing off 的文字照常译为「签署」）：
    // <span class="…Caption…">Choose an email address for <a>signing off</a> on this commit</span>
    // <div class="…commitEmailFormControl…">You are <a>signing off</a> on this commit as <邮箱></div>
    // 邮箱作身份提到动词之前，原文无标点，译文不加逗号、冒号
    ['Choose an email address for {} on this commit', '选择用于{}此提交的电子邮件地址'],
    [/^You are \{\} on this commit as (\S+)$/, '你正在以 $1 的身份{}此提交'],
    // 复刻编辑横幅（EditingForkBanner）：<Flash>You’re making changes … in your fork <b>owner/repo</b>, so you can send a pull request.</Flash>
    // 不能创建拉取请求时没有「, so you can send a pull request」；复刻名提到「新分支」之前
    [
      'You’re making changes in a project you don’t have write access to. Submitting a change will write it to a new branch in your fork {}, so you can send a pull request.',
      '你正在更改没有写入访问权限的项目。提交的更改将写入你的复刻 {} 中的新分支，之后可发送拉取请求。',
    ],
    [
      'You’re making changes in a project you don’t have write access to. Submitting a change will write it to a new branch in your fork {}.',
      '你正在更改没有写入访问权限的项目。提交的更改将写入你的复刻 {} 中的新分支。',
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
