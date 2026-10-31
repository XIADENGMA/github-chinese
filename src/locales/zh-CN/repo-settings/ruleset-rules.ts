import type { PageDictionary } from '../../../core/types'

/** 合并方式：英文 → 中文 */
const MERGE_METHOD: Readonly<Record<string, string>> = {
  Merge: '合并',
  Squash: '压缩',
  Rebase: '变基',
}

/** 元数据限制的对象：英文 → 中文 */
const METADATA_SUBJECT: Readonly<Record<string, string>> = {
  'Commit message': '提交消息',
  'Author email': '作者电子邮件',
  'Committer email': '提交者电子邮件',
  'Branch name': '分支名称',
  'Tag name': '标签名称',
}

/** 元数据限制的匹配方式：英文 → 中文 */
const METADATA_OPERATOR: Readonly<Record<string, string>> = {
  'start with a matching pattern': '以匹配模式开头',
  'end with a matching pattern': '以匹配模式结尾',
  'contain a matching pattern': '包含匹配模式',
  'match a given regex pattern': '匹配给定的正则表达式',
}

/** 输入校验的字段：英文 → 中文 */
const FIELD: Readonly<Record<string, string>> = {
  'File path': '文件路径',
  'File extension': '文件扩展名',
  'Maximum file path length': '最大文件路径长度',
  'Maximum file size (MB)': '最大文件大小 (MB)',
}

/** 输入校验的问题：英文 → 中文 */
const FIELD_PROBLEM: Readonly<Record<string, string>> = {
  'cannot be empty': '不能为空',
  'has already been added': '已添加',
  'must be a whole number': '必须为整数',
}

/**
 * 存储库设置 · 规则集的规则：分支 / 标签 / 推送规则及其参数（合并队列、部署、拉取请求与必需审查者、
 * 状态检查、代码扫描、代码质量、工作流、机密扫描、代码覆盖率、文件路径 / 扩展名 / 大小）、元数据限制、规则错误提示。
 * 与经典分支保护同名的规则（Require signed commits 等）见 branches.ts。
 */
export default {
  static: {
    // 规则面板
    'Branch rules': '分支规则',
    'Tag rules': '标签规则',
    'Push rules': '推送规则',
    'Branch protections': '分支保护',
    'Tag protections': '标签保护',
    'Push protections': '推送保护',
    'No branch protections have been added': '尚未添加分支保护',
    'No tag protections have been added': '尚未添加标签保护',
    'No push protections have been added': '尚未添加推送保护',
    'Which rules should be applied to the targets that you have selected?': '应对所选目标应用哪些规则？',
    'Which rules should be applied?': '应应用哪些规则？',
    'Hide additional settings': '隐藏其他设置',
    'Show additional settings': '显示其他设置',

    // 创建 / 更新 / 删除
    'Restrict creations': '限制创建',
    'Only allow users with bypass permission to create matching refs.': '仅允许拥有绕过权限的用户创建匹配的引用。',
    'Restrict updates': '限制更新',
    'Only allow users with bypass permission to update matching refs.': '仅允许拥有绕过权限的用户更新匹配的引用。',
    'Allow fork syncing': '允许同步复刻',
    'Branch can pull changes from its upstream repository': '分支可以从上游存储库拉取更改',
    'Restrict deletions': '限制删除',
    'Only allow users with bypass permissions to delete matching refs.': '仅允许拥有绕过权限的用户删除匹配的引用。',
    'Prevent merge commits from being pushed to matching refs.': '禁止将合并提交推送到匹配的引用。',
    'Block force pushes': '阻止强制推送',
    'Prevent users with push access from force pushing to refs.': '禁止拥有推送权限的用户强制推送到引用。',

    // 合并队列
    'Merges must be performed via a merge queue.': '必须通过合并队列进行合并。',
    'Limit the number of queued pull requests requesting checks and workflow runs at the same time.':
      '限制同时请求检查和工作流运行的排队拉取请求数量。',
    'Minimum group size': '最小分组大小',
    'The minimum number of PRs that will be merged together in a group.': '一组中一起合并的 PR 的最少数量。',
    'Maximum group size': '最大分组大小',
    'The maximum number of PRs that will be merged together in a group.': '一组中一起合并的 PR 的最多数量。',
    'Wait time to meet minimum group size (minutes)': '等待达到最小分组大小的时间（分钟）',
    'The time merge queue should wait after the first PR is added to the queue for the minimum group size to be met. After this time has elapsed, the minimum group size will be ignored and a smaller group will be merged.':
      '第一个 PR 加入队列后，合并队列等待达到最小分组大小的时间。超过此时间后，将忽略最小分组大小并合并较小的分组。',
    'Require all queue entries to pass required checks': '要求所有队列条目都通过必需的检查',
    'When this setting is disabled, only the commit at the head of the merge group, i.e. the commit containing changes from all of the PRs in the group, must pass its required checks to merge.':
      '禁用此设置时，只有合并组头部的提交（即包含组内所有 PR 更改的提交）须通过必需的检查才能合并。',
    'Status check timeout (minutes)': '状态检查超时（分钟）',
    'Maximum time for a required status check to report a conclusion. After this much time has elapsed, checks that have not reported a conclusion will be assumed to have failed':
      '必需的状态检查报告结论的最长时间。超过此时间仍未报告结论的检查将视为失败',
    'Repository settings load was cancelled': '存储库设置加载已取消',
    'Failed to load repository settings': '加载存储库设置失败',

    // 部署
    'Require deployments to succeed': '要求部署成功',
    'Choose which environments must be successfully deployed to before refs can be pushed into a ref that matches this rule.':
      '选择哪些环境必须部署成功，才能将引用推送到与此规则匹配的引用。',
    'Required deployment environments': '必需的部署环境',
    'Add environments': '添加环境',
    'Select environments': '选择环境',
    'Click to add environments': '单击添加环境',
    'No environments found': '未找到环境',
    'Search for deployment environments': '搜索部署环境',
    'No deployment environments have been added': '尚未添加部署环境',
    'Learn more about deployment environments': '了解部署环境',

    // 签名提交、拉取请求
    'Commits pushed to matching refs must have verified signatures.': '推送到匹配引用的提交必须带有经过验证的签名。',
    'Require all commits be made to a non-target branch and submitted via a pull request before they can be merged.':
      '所有提交都必须先提交到非目标分支，并通过拉取请求提交，才能合并。',
    'Required approvals': '所需批准数',
    'The number of approving reviews that are required before a pull request can be merged.':
      '拉取请求合并前所需的批准审查数量。',
    'New, reviewable commits pushed will dismiss previous pull request review approvals.':
      '推送新的可审查提交时，将消除之前的拉取请求审查批准。',
    'Require an approving review in pull requests that modify files that have a designated code owner.':
      '拉取请求修改了指定代码所有者的文件时，需要获得批准审查。',
    'All conversations on code must be resolved before a pull request can be merged.':
      '必须解决代码上的所有对话，拉取请求才能合并。',
    'Require an additional approval for unattributed Copilot pull requests':
      '未署名的 Copilot 拉取请求需要额外一次批准',
    'When Copilot opens a pull request without a human collaborator, require one more approving review if a non-zero approval count is required.':
      '当 Copilot 在没有人类协作者参与的情况下创建拉取请求时，如果所需批准数不为零，则需要额外一次批准审查。',
    'Allowed merge methods': '允许的合并方式',
    'When merging pull requests, you can allow any combination of merge commits, squashing, or rebasing. At least one option must be enabled.':
      '合并拉取请求时，可以允许合并提交、压缩或变基的任意组合，但至少须启用一项。',

    // 必需审查者（指定团队审查匹配文件）
    'Require review from specific teams': '需要特定团队审查',
    'A collection of reviewers and associated file patterns. Each reviewer has a list of file patterns which determine the files that reviewer is required to review.':
      '审查者及其关联文件模式的集合。每个审查者都有一组文件模式，决定其必须审查的文件。',
    'Add reviewer': '添加审查者',
    'Edit reviewer': '编辑审查者',
    'Reviewer details': '审查者详细信息',
    'No reviewers have been added': '尚未添加审查者',
    'Reviewer not found': '未找到审查者',
    'Reviewer was not found': '未找到审查者',
    'Select reviewer': '选择审查者',
    'Search reviewers': '搜索审查者',
    'Pagination for required reviewers': '必需审查者分页',
    'Pull requests which change matching files must be approved by the specified team.':
      '更改了匹配文件的拉取请求必须经过指定团队批准。',
    'Pull requests which change matching files must be approved by the specified team. File patterns use fnmatch syntax.':
      '更改了匹配文件的拉取请求必须经过指定团队批准。文件模式使用 fnmatch 语法。',
    'A reviewer must be selected': '必须选择审查者',
    'This team is already added as a reviewer': '此团队已添加为审查者',
    'At least one file pattern must be specified': '必须至少指定一个文件模式',
    'Failed to read response': '读取响应失败',
    'No teams found': '未找到团队',
    'Adjust your search term to find other teams. Only visible teams can be added as reviewers.':
      '调整搜索词以查找其他团队。只能添加可见团队作为审查者。',
    'Only visible teams can be added as reviewers.': '只能添加可见团队作为审查者。',

    // Copilot 代码审查
    'Request pull request review from Copilot': '请求 Copilot 审查拉取请求',
    'Automatically request review from Copilot for new pull requests, if the author has access to Copilot code review.':
      '如果作者可以使用 Copilot 代码审查，则自动为新拉取请求请求 Copilot 审查。',
    'Request Copilot code review for new pull requests automatically if the author has access to Copilot code review and their premium requests quota has not reached the limit.':
      '如果作者可以使用 Copilot 代码审查且高级请求配额未达上限，则自动为新拉取请求请求 Copilot 代码审查。',
    'Request Copilot code review for new pull requests automatically if the author has access to Copilot code review and AI credits.':
      '如果作者可以使用 Copilot 代码审查且有 AI 额度，则自动为新拉取请求请求 Copilot 代码审查。',
    'Review new pushes': '审查新推送',
    'Copilot automatically reviews each new push to the pull request.': 'Copilot 自动审查拉取请求的每次新推送。',
    'Review draft pull requests': '审查草稿拉取请求',
    'Copilot automatically reviews draft pull requests before they are marked as ready for review.':
      'Copilot 在草稿拉取请求标记为可供审查之前自动审查。',
    'Automated code reviews on push': '推送时自动审查代码',
    'Manage static analysis tools in Copilot code review': '管理 Copilot 代码审查中的静态分析工具',
    'Copilot code review will include findings from the selected static analysis tools in its review comments.':
      'Copilot 代码审查将在审查评论中包含所选静态分析工具的发现。',

    // 状态检查
    'Require status checks to pass': '要求通过状态检查',
    'Choose which status checks must pass before the ref is updated. When enabled, commits must first be pushed to another ref where the checks pass.':
      '选择更新引用前必须通过哪些状态检查。启用后，提交必须先推送到其他引用并通过检查。',
    'Whether pull requests targeting a matching branch must be tested with the latest code. This setting will not take effect unless at least one status check is enabled.':
      '以匹配分支为目标的拉取请求是否必须使用最新代码测试。至少启用一项状态检查后，此设置才会生效。',
    'Enter the name of a status check': '输入状态检查名称',
    'No required checks': '无必需的检查',
    'Add checks': '添加检查',
    'Add Checks': '添加检查',
    'Search for checks': '搜索检查',
    'No matching checks found': '未找到匹配的检查',
    'Start typing to find status checks to require.': '输入以查找要设为必需的状态检查。',
    'No checks have been added': '尚未添加检查',
    'Any source': '任意来源',
    'Select source': '选择来源',

    // 代码扫描
    'Require code scanning results': '要求代码扫描结果',
    'Choose which tools must provide code scanning results before the reference is updated. When configured, code scanning must be enabled and have results for both the commit and the reference being updated.':
      '选择更新引用前必须提供代码扫描结果的工具。配置后，必须启用代码扫描，且提交和要更新的引用都须有扫描结果。',
    'Code scanning tools': '代码扫描工具',
    'Required tools and alert thresholds': '必需的工具和警报阈值',
    'No code scanning tools specified': '未指定代码扫描工具',
    'Learn more about code scanning thresholds': '了解代码扫描阈值',
    'Enter a tool name': '输入工具名称',
    'Enter the name of a code scanning tool': '输入代码扫描工具名称',
    'Delete tool': '删除工具',
    'Security alerts threshold': '安全警报阈值',
    'Alerts threshold': '警报阈值',
    'High or higher': '高及以上',
    'Medium or higher': '中及以上',
    'Errors and Warnings': '错误和警告',
    'Tools that must provide code scanning results for this rule to pass.':
      '必须提供代码扫描结果才能通过此规则的工具。',
    'Learn more about enabling code scanning.': '了解如何启用代码扫描。',
    'Please select at least one code scanning tool': '请至少选择一个代码扫描工具',

    // 代码质量
    'Require code quality results': '要求代码质量结果',
    'Choose which severity levels of code quality results should block pull request merges. When configured, a code quality analysis must be done on the pull request before the changes can be merged.':
      '选择哪些严重级别的代码质量结果应阻止合并拉取请求。配置后，必须先对拉取请求完成代码质量分析，才能合并更改。',
    'Warnings and higher': '警告及以上',
    'Notes and higher': '注意及以上',
    'The lowest severity level at which code quality reviews need to be resolved before commits can be merged.':
      '合并提交前须解决的代码质量审查的最低严重级别。',

    // 工作流
    'Require workflows to pass before merging': '合并前必须通过工作流',
    'Require all changes made to a targeted branch to pass the specified workflows before they can be merged.':
      '对目标分支所做的所有更改都必须通过指定的工作流，才能合并。',
    'Workflow configurations': '工作流配置',
    'No workflow configurations found': '未找到工作流配置',
    'Add required workflow': '添加必需工作流',
    'Workflow already exists': '工作流已存在',
    'Unknown repository': '未知存储库',
    'Select branch or tag': '选择分支或标签',
    'Branch or tag': '分支或标签',
    'Pin to commit': '固定到提交',
    'Always reference the current commit': '始终引用当前提交',
    'Enter a SHA': '输入 SHA',
    'Enter a valid SHA': '输入有效的 SHA',
    'Enter the SHA for the commit you want to reference': '输入要引用的提交的 SHA',
    'Invalid SHA': '无效的 SHA',
    'Valid SHA': '有效的 SHA',
    'Validating...': '验证中...',
    'Validating…': '验证中…',
    'Pick a workflow file': '选择工作流文件',
    'Please select a workflow path': '请选择工作流路径',
    'Organizations could not be loaded. Try searching again.': '无法加载组织。请重新搜索。',
    'Repositories could not be loaded. Try searching again.': '无法加载存储库。请重新搜索。',
    'Required workflows could not be loaded': '无法加载必需工作流',
    'Please select an organization': '请选择组织',
    'Select organization': '选择组织',
    'Please select a repository': '请选择存储库',

    // 机密扫描、许可证、代码覆盖率
    'Require secret scanning alerts are resolved': '要求解决机密扫描警报',
    'Choose which secret scanning alerts should block pull request merges. When configured, secret scanning alerts created from the pull request must be resolved before the changes can be merged. Secret Protection must be enabled.':
      '选择哪些机密扫描警报应阻止合并拉取请求。配置后，必须先解决拉取请求产生的机密扫描警报，才能合并更改。必须启用机密保护。',
    'Secret types': '机密类型',
    'Provider patterns': '提供程序模式',
    'Secrets tied to a specific service provider.': '与特定服务提供程序关联的机密。',
    'Secrets detected using regular expression patterns defined by your organization.':
      '使用组织定义的正则表达式模式检测到的机密。',
    'Secrets not tied to a specific provider, detected with deterministic methods.':
      '与特定提供程序无关、通过确定性方法检测到的机密。',
    'Require license compliance results before merging': '合并前要求许可证合规结果',
    "Enforce any added or changed dependencies to comply with the organization's license policy.":
      '强制要求新增或更改的依赖项符合组织的许可证策略。',
    'Restrict code coverage': '限制代码覆盖率',
    'Enforce minimum line coverage thresholds on pull requests. This rule evaluates uploaded coverage data but does not wait for coverage uploads. To ensure coverage is evaluated before merging, make each status check associated with a coverage upload a required status check.':
      '对拉取请求强制实施最低行覆盖率阈值。此规则会评估已上传的覆盖率数据，但不会等待覆盖率上传。要确保合并前评估覆盖率，请将每个与覆盖率上传关联的状态检查设为必需的状态检查。',
    'Minimum line coverage percentage': '最低行覆盖率百分比',
    'Maximum line coverage drop': '最大行覆盖率降幅',

    // 多选参数
    'Click to add values': '单击添加值',
    'Add values': '添加值',
    'Select values': '选择值',
    'No values have been added': '尚未添加值',

    // 推送规则
    'Restrict file paths': '限制文件路径',
    'Prevent commits that include changes in specified file paths from being pushed.':
      '禁止推送更改了指定文件路径的提交。',
    'Restrict file path length': '限制文件路径长度',
    'Prevent commits that include file paths that exceed a specified character limit from being pushed.':
      '禁止推送文件路径超过指定字符数限制的提交。',
    'Restrict file extensions': '限制文件扩展名',
    'Prevent commits that include files with specified file extensions from being pushed.':
      '禁止推送包含指定扩展名文件的提交。',
    'Restrict file size': '限制文件大小',
    'Prevent commits that exceed a specified file size limit from being pushed.':
      '禁止推送超过指定文件大小限制的提交。',
    'Restricted file paths': '受限文件路径',
    'Add restricted path': '添加受限路径',
    'No restricted paths': '无受限路径',
    'File path': '文件路径',
    'Examples: `.github/**/*`, `**/*.exe`': '示例：`.github/**/*`, `**/*.exe`',
    'File path is too long. Maximum length is 200 characters': '文件路径过长。最大长度为 200 个字符',
    'fnmatch patterns': 'fnmatch 模式',
    'for files and folders.': '匹配文件和文件夹。',
    'Allowed exceptions': '允许的例外',
    'Add allowed path': '添加允许的路径',
    'Add a restricted path before adding exceptions': '添加例外前须先添加受限路径',
    'No allowed exceptions': '无允许的例外',
    'Restricted file extensions': '受限文件扩展名',
    'Add file extension': '添加文件扩展名',
    'File extension': '文件扩展名',
    'Commits that include files with the specified file extension will be rejected.':
      '包含指定扩展名文件的提交将被拒绝。',
    'Examples: `bin`, `exe`': '示例：`bin`, `exe`',
    'No file extensions': '无文件扩展名',
    'File extension cannot contain \\, /, or *': '文件扩展名不能包含 \\、/ 或 *',
    'File extension is too long. Maximum length is 200 characters': '文件扩展名过长。最大长度为 200 个字符',
    'Maximum file path length': '最大文件路径长度',
    'Maximum file path length:': '最大文件路径长度：',
    'Maximum file size (MB)': '最大文件大小 (MB)',
    'Maximum file size (MB):': '最大文件大小 (MB)：',
    'This limit does not apply to Git Large File Storage (Git LFS).': '此限制不适用于 Git 大文件存储 (Git LFS)。',
    // 受限提交
    'Contains secret(s)': '包含机密',
    'Contains sensitive information': '包含敏感信息',
    'Company IP': '公司知识产权',
    'Add full or abbreviated commit hash': '添加完整或缩写的提交哈希',
    'Commit ID': '提交 ID',
    'Select reason': '选择原因',
    'Other reason': '其他原因',
    'No commit IDs have been added yet': '尚未添加提交 ID',
    'Add a commit ID restriction to prevent specific commits from ever being accepted into target branches':
      '添加提交 ID 限制以阻止特定提交进入目标分支',

    // 按名称匹配存储库（组织规则集）
    'Specify if repository names must match or cannot match the naming pattern.':
      '指定存储库名称必须匹配还是不得匹配命名模式。',
    'Must match': '必须匹配',
    'Repository names must match the specified naming pattern.': '存储库名称必须匹配指定的命名模式。',
    'Cannot match': '不得匹配',
    'Repository names cannot match the specified naming pattern.': '存储库名称不得匹配指定的命名模式。',

    // 元数据限制
    'Restrict commit metadata': '限制提交元数据',
    'Restrict commit author email addresses, committer email addresses, commit message content, and other metadata':
      '限制提交作者电子邮件地址、提交者电子邮件地址、提交消息内容和其他元数据',
    'Restrict commit messages': '限制提交消息',
    'Restrict commit author emails': '限制提交作者电子邮件',
    'Restrict committer emails': '限制提交者电子邮件',
    'Restrict branch names': '限制分支名称',
    'Restrict tag names': '限制标签名称',
    'Metadata restrictions': '元数据限制',
    'Metadata restrictions are available to Enterprise organizations': '元数据限制仅适用于企业版组织',
    'Metadata restrictions can ensure that commit messages contain a GitHub issue number, or enforce the format of new branch and tag names.':
      '元数据限制可确保提交消息包含 GitHub 议题编号，或强制实施新分支和标签名称的格式。',
    'Learn more about metadata restrictions': '了解元数据限制',
    'No metadata restrictions have been added': '尚未添加元数据限制',
    'No restrictions have been added': '尚未添加限制',
    'Add restriction': '添加限制',
    'Add a metadata restriction': '添加元数据限制',
    'Edit a metadata restriction': '编辑元数据限制',
    'All metadata restrictions have been used': '已用完所有元数据限制',
    'This ruleset uses all metadata restriction types. You can edit the existing restrictions or remove them to add new ones.':
      '此规则集已使用所有元数据限制类型。可以编辑现有限制，或将其移除以添加新限制。',
    'Edit this metadata rule': '编辑此元数据规则',
    'Delete this metadata rule': '删除此元数据规则',
    'Restore this metadata rule': '恢复此元数据规则',
    'start with a matching pattern': '以匹配模式开头',
    'end with a matching pattern': '以匹配模式结尾',
    'contain a matching pattern': '包含匹配模式',
    'match a given regex pattern': '匹配给定的正则表达式',
    'Must start with a matching pattern': '必须以匹配模式开头',
    'Must end with a matching pattern': '必须以匹配模式结尾',
    'Must contain a matching pattern': '必须包含匹配模式',
    'Must match a given regex pattern': '必须匹配给定的正则表达式',
    'Must not start with a matching pattern': '不得以匹配模式开头',
    'Must not end with a matching pattern': '不得以匹配模式结尾',
    'Must not contain a matching pattern': '不得包含匹配模式',
    'Must not match a given regex pattern': '不得匹配给定的正则表达式',
    'Matching pattern': '匹配模式',
    'How this rule appears when configuring it.': '配置时此规则的显示方式。',
    'How this rule will appear to your': '此规则向你的',
    "'s users throughout": '用户显示的方式，范围为',
    '’s users throughout': '用户显示的方式，范围为',

    // 规则错误
    'An error occurred': '发生错误',
    'Restricted file paths cannot be empty. Please add at least one restricted file path or disable the rule.':
      '受限文件路径不能为空。请至少添加一个受限文件路径，或禁用此规则。',
    'Restricted file extensions cannot be empty. Please add at least one restricted file extension or disable the rule.':
      '受限文件扩展名不能为空。请至少添加一个受限文件扩展名，或禁用此规则。',
    'Merge queue rules are only supported for named branches or the default branch. Please adjust your branch targets.':
      '合并队列规则仅支持具名分支或默认分支。请调整分支目标。',
    'Repository conditions cannot be empty': '存储库条件不能为空',
    'Required deployments cannot be empty. Please add at least one deployment or disable the rule.':
      '必需的部署不能为空。请至少添加一个部署，或禁用此规则。',
    'Required status checks cannot be empty. Please add at least one status check or disable the rule.':
      '必需的状态检查不能为空。请至少添加一项状态检查，或禁用此规则。',
    'Workflows cannot be empty. Please add at least one workflow or disable the rule.':
      '工作流不能为空。请至少添加一个工作流，或禁用此规则。',
  },
  scoped: {
    Merge: '合并',
    Squash: '压缩',
    Rebase: '变基',
    Alerts: '警报',
    Errors: '错误',
    // 代码扫描阈值：编辑时为「Alerts:」，只读时为「Alerts threshold:」
    'Alerts:': '警报：',
    'Security alerts:': '安全警报：',
    'Alerts threshold:': '警报阈值：',
    'Security alerts threshold:': '安全警报阈值：',
    'Tool name': '工具名称',
    Restrictions: '限制',
    Requirement: '要求',
    Must: '必须',
    'Must not': '不得',
    Metadata: '元数据',
    metadata: '元数据',
    restrictions: '限制',
    Negate: '取反',
    'Branch name': '分支名称',
    'Tag name': '标签名称',
    'Commit message': '提交消息',
    'Additional settings': '其他设置',
    'Add workflow': '添加工作流',
    Reviewer: '审查者',
    'File patterns': '文件模式',
    // 文件路径限制说明：<字段说明> Supports <a>fnmatch patterns</a> for files and folders.
    Supports: '支持',
  },
  regexp: [
    // 元数据限制说明：Commit message must start with a matching pattern
    [
      /^(Commit message|Author email|Committer email|Branch name|Tag name) must (not )?(start with a matching pattern|end with a matching pattern|contain a matching pattern|match a given regex pattern)$/,
      (_, subject: string, not: string, operator: string) =>
        `${METADATA_SUBJECT[subject] ?? subject}${not ? '不得' : '必须'}${METADATA_OPERATOR[operator] ?? operator}`,
    ],
    // 允许的合并方式组合：Merge, Squash, Rebase
    [
      /^(?:Merge|Squash|Rebase)(?:, (?:Merge|Squash|Rebase)){1,2}$/,
      (match: string) =>
        match
          .split(', ')
          .map((method) => MERGE_METHOD[method] ?? method)
          .join('、'),
    ],
    // 状态检查搜索结果：Already added ci/build、Add ci/build（只认带 / : . _ - 的检查名，避免误伤普通按钮）
    [/^Already added (.{1,100})$/, '已添加 $1'],
    [/^Add ([^\s/:._-]*[/:._-]\S*)$/, '添加 $1'],
    // 多选参数：Select all (3)
    [/^Select all \((\d+)\)$/, '全选 ($1)'],
    // 必需审查者
    [/^(\d+) reviewers?$/, '$1 个审查者'],
    [/^Show \+(\d+) more$/, '再显示 $1 个'],
    [/^\+ (\d+) more$/, '+ $1 个'],
    [/^No teams found for '(.{1,100})'$/, '未找到与“$1”匹配的团队'],
    // 文件路径 / 扩展名 / 大小输入校验：File path cannot be empty
    [
      /^(File path|File extension|Maximum file path length|Maximum file size \(MB\)) (cannot be empty|has already been added|must be a whole number)$/,
      (_, field: string, problem: string) => {
        const name = FIELD[field] ?? field
        // 半角括号与中文之间空一格：最大文件大小 (MB) 必须为整数
        return `${name}${name.endsWith(')') ? ' ' : ''}${FIELD_PROBLEM[problem] ?? problem}`
      },
    ],
  ],
} satisfies PageDictionary
