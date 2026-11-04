import type { PageDictionary } from '../../../core/types'

/** 自动合并动作 */
const AUTO_MERGE_ACTION: Readonly<Record<string, string>> = {
  'automatically merge': '自动合并',
  'be added to the merge queue': '加入合并队列'
}

/**
 * 合并框（续）：自动合并、合并队列、草稿与转为草稿、关闭、合并后与关闭后状态（删除 / 恢复分支、代码空间清理）、
 * 部署、堆栈合并与堆栈变基、在场证明。
 */
export default {
  static: {
    // 自动合并
    'Auto-merge enabled': '已启用自动合并',
    'Disable auto-merge': '禁用自动合并',
    'Disabling auto-merge': '正在禁用自动合并',
    'Pull requests to disable auto-merge': '要禁用自动合并的拉取请求',
    'Pull requests to enable auto-merge': '要启用自动合并的拉取请求',
    'Auto-merge will be enabled for the following pull requests. This will replace any existing auto-merge selections in the stack.':
      '将为以下拉取请求启用自动合并。这将替换堆栈中现有的自动合并设置。',
    'Learn more about automatically merging a pull request.': '了解自动合并拉取请求。',
    'Learn more about auto-merge.': '了解自动合并。',
    'This pull request will be automatically merged when all requirements are met.': '此拉取请求将在满足所有要求时自动合并。',
    'This pull request will be added to the merge queue when all requirements are met.': '此拉取请求将在满足所有要求时加入合并队列。',
    'This pull request will be added to the merge queue when all requirements are met': '此拉取请求将在满足所有要求时加入合并队列',
    'This pull request will automatically merge when it meets the merge requirements.': '此拉取请求将在满足合并要求时自动合并。',
    'Auto-merge is not allowed on this repository.': '此存储库不允许自动合并。',
    'Auto-merge cannot be enabled because this pull request is already in a mergeable state.': '此拉取请求因已可合并而无法启用自动合并。',

    // 合并队列
    'Merge when ready': '准备就绪时合并',
    'Confirm merge when ready': '确认准备就绪时合并',
    'Queue and merge in a group': '排队并分组合并',
    'Queue and force solo merge': '排队并强制单独合并',
    'Confirm queue and force solo merge': '确认排队并强制单独合并',
    'Enqueue stack': '将堆栈加入队列',
    'Confirm enqueue stack': '确认将堆栈加入队列',
    'Enqueue pull request': '将拉取请求加入队列',
    'Confirm enqueue pull request': '确认将拉取请求加入队列',
    'Add to merge queue': '添加到合并队列',
    'Confirm add to merge queue': '确认添加到合并队列',
    'Adding to merge queue...': '正在添加到合并队列...',
    'Adding to merge queue…': '正在添加到合并队列…',
    'Select merge queue method': '选择合并队列方式',
    'Merge queue method': '合并队列方式',
    'Queued to merge...': '已排队等待合并...',
    'Queued to merge…': '已排队等待合并…',
    'This pull request is queued to merge': '此拉取请求已排队等待合并',
    'Remove from the queue': '从队列中删除',
    'Remove from the queue?': '要从队列中删除吗？',
    'Removing from the queue': '正在从队列中删除',
    'Removing this pull request from the queue could impact other pull requests in the queue. Are you sure?':
      '从队列中删除此拉取请求可能会影响队列中的其他拉取请求。确定要删除吗？',
    'Failed to remove pull request from the merge queue': '从合并队列中删除拉取请求失败',
    'The pull request was successfully removed from the queue.': '已从队列中删除拉取请求。',
    // 排队状态：<说明> <merge queue>.（链接在句末，说明里用“以下队列”指代）
    'This pull request is locked for deployment by the': '此拉取请求已被以下队列锁定以进行部署',
    'This pull request is next up in the': '此拉取请求在以下队列中排在下一位',

    // 草稿、转为草稿、关闭
    'This pull request is still a work in progress': '此拉取请求仍在进行中',
    'Draft pull requests cannot be merged.': '草稿拉取请求无法合并。',
    // open 指拉取请求的打开状态（Open），不是动词“创建”
    'Author has reached the open pull request limit': '作者已达到打开的拉取请求上限',
    'Still in progress?': '仍在进行中？',
    // 不支持草稿拉取请求的存储库：Still in progress? 下的链接与弹层
    'Learn about draft PRs': '了解草稿 PR',
    'Try draft pull requests': '试用草稿拉取请求',
    "Open an in-progress pull request without asking for formal review or risking an unwanted merge. When you're ready for code review, you can mark your draft pull request as ready for review, which will request reviews from any code owners.":
      '创建进行中的拉取请求而不必请求正式审查或担心意外合并。准备好接受代码审查时，你可以将草稿拉取请求标记为可供审查，这将向所有代码所有者请求审查。',
    'Convert this pull request to draft?': '要将此拉取请求转换为草稿吗？',
    'Converting to draft': '正在转换为草稿',
    'People who are already subscribed will not be unsubscribed.': '已订阅的用户不会被取消订阅。',
    'Failed to convert the pull request to draft': '将拉取请求转换为草稿失败',
    'The pull request was successfully converted to draft.': '已将拉取请求转换为草稿。',
    'Not planning to merge?': '不打算合并？',
    'Close this pull request?': '要关闭此拉取请求吗？',
    'This pull request will be closed. You can reopen it later if needed.': '此拉取请求将被关闭。如有需要可以稍后重新打开。',
    'Failed to close the pull request': '关闭拉取请求失败',
    'The pull request was successfully closed.': '已关闭拉取请求。',

    // 合并后 / 关闭后
    'Pull request successfully merged and closed': '拉取请求已成功合并并关闭',
    'Closed with unmerged commits': '已关闭但有未合并的提交',
    'Branch successfully deleted': '分支已成功删除',
    'Delete branch': '删除分支',
    'Deleting branch': '正在删除分支',
    'Restore branch': '恢复分支',
    'Restoring branch': '正在恢复分支',
    "You're all set — the branch has been merged.": '一切就绪——分支已合并。',
    'You’re all set — the branch has been merged.': '一切就绪——分支已合并。',
    // 对话页合并事件“还原”按钮的提示
    'Create a new pull request to revert these changes': '创建新的拉取请求以还原这些更改',
    // 整句（跨存储库合并后）由下方 inline 处理；不命中时按片段拼读
    'If you wish, you can also delete this fork of': '如有需要，也可以删除以下存储库的此复刻',
    'This pull request is closed.': '此拉取请求已关闭。',
    'Some codespaces could not be deleted.': '部分代码空间无法删除。',
    'Copilot can watch this pull request': 'Copilot 可以监视此拉取请求',
    'Copilot can monitor this pull request for failed Actions workflows and merge conflicts and fix them automatically.':
      'Copilot 可以监视此拉取请求中失败的操作工作流和合并冲突并自动修复。',
    'Watch and fix': '监视并修复',

    // 部署
    'This branch has not been deployed': '此分支尚未部署',
    'This branch was successfully deployed': '此分支已成功部署',
    'This branch had an error being deployed': '此分支部署出错',
    'This branch is being deployed': '此分支正在部署',
    'Show environments': '显示环境',
    'Hide environments': '隐藏环境',

    // 合并区的合并状态链接
    'View status': '查看状态',

    // 堆栈合并
    'Stacked pull requests list': '堆叠式拉取请求列表',
    'Merging this pull request in the stack…': '正在合并堆栈中的此拉取请求…',
    'This pull request is being merged.': '正在合并此拉取请求。',
    'Merging stack…': '正在合并堆栈…',
    'This pull request cannot be merged.': '此拉取请求无法合并。',
    'Unable to merge as a stack': '无法作为堆栈合并',
    'Some of the pull requests in this stack cannot be merged.': '此堆栈中的部分拉取请求无法合并。',
    'Able to merge this pull request': '可以合并此拉取请求',
    'Only this pull request will be merged.': '仅合并此拉取请求。',
    'Able to merge as a stack': '可以作为堆栈合并',
    'Loading stack status...': '正在加载堆栈状态...',
    'Loading stack status…': '正在加载堆栈状态…',
    'Waiting on status checks...': '正在等待状态检查...',
    'Waiting on status checks…': '正在等待状态检查…',
    'Some of the pull requests in this stack have pending status checks.': '此堆栈中部分拉取请求有挂起的状态检查。',
    'Could not determine stack status': '无法确定堆栈状态',
    'Cancelling stack merge': '正在取消堆栈合并',
    'Collapse stack details': '折叠堆栈详细信息',
    'Expand stack details': '展开堆栈详细信息',
    'Will not merge: higher up the stack': '不会合并：位于堆栈上层',
    'Blocked downstack': '下层被阻止',
    'Rebase stack': '变基堆栈',
    'Rebasing stack': '正在变基堆栈',
    'Rebasing stack…': '正在变基堆栈…',
    'Rebasing complete': '变基完成',
    'This stack is up to date and has a linear commit history.': '此堆栈已是最新且提交历史记录呈线性。',
    'Rebasing stacked pull requests': '正在变基堆叠式拉取请求',
    'Rebasing stacked pull requests list': '正在变基的堆叠式拉取请求列表',
    'Rebasing was stopped due to merge conflicts': '变基因合并冲突而停止',
    'Rebasing was stopped due to an error': '变基因出错而停止',
    'Rebasing was stopped due to a network error': '变基因网络错误而停止',
    'Try to rebase this stack again. If the problem persists, refresh the page.': '请重新变基此堆栈。如果问题仍然存在，请刷新页面。',
    // 原文界面名 Done 无引号，译文不加
    'Command-line conflict-resolution instructions are available below. Select Done to proceed.':
      '下方提供了命令行解决冲突的说明。选择完成以继续。',
    'Failed to load stack rebase status': '加载堆栈变基状态失败',
    'Stack rebase polling timed out': '堆栈变基轮询超时',
    'Rebasing a stack restores a linear commit history when its branches have diverged, and brings the stack up to date with its base branch.':
      '变基堆栈可在其分支出现分叉时恢复线性的提交历史记录，并使堆栈与其基础分支保持同步。',
    'Learn more about rebasing stacks.': '了解堆栈变基。',
    'Each branch is rebased onto the tip of the one below it, starting from the first unmerged branch.':
      '从第一个未合并的分支开始，每个分支都会变基到其下方分支的最新提交之上。',
    'Once a branch is rebased, it is force-pushed.': '分支变基后会被强制推送。',
    'The process stops at the first merge conflict or failed rebase.': '过程会在遇到第一个合并冲突或变基失败时停止。',
    'Commits keep their original author, but will be signed and verified by GitHub.': '提交保留原作者，但会由 GitHub 签名和验证。',
    'Learn more about commit signature verification.': '了解提交签名验证。',
    'Current stack entry merge conflicts': '当前堆栈条目的合并冲突',
    'Downstack merge conflicts': '下层堆栈的合并冲突',
    'This stack has conflicts that must be resolved': '此堆栈存在必须解决的冲突',
    'Optional stack rebase': '可选的堆栈变基',
    'This stack is out-of-date with its base branch': '此堆栈落后于其基础分支',
    'Required stack rebase': '必需的堆栈变基',
    'Some branches in this stack have diverged and must be rebased': '此堆栈中的部分分支已分叉且必须变基',
    'Rebase this stack to restore a linear commit history across its branches.': '变基此堆栈以恢复各分支间线性的提交历史记录。',

    // 在场证明
    'Authentication is already in progress. Complete it before starting another attempt.': '身份验证正在进行中。请先完成再重新尝试。',
    'Authenticating... Proof of presence, opens in a new tab': '身份验证中...在场证明，在新标签页中打开',
    'Authenticate proof of presence, opens in a new tab': '验证在场证明，在新标签页中打开',
    'The proof of presence requirement could not be evaluated. Try again later.': '无法评估在场证明要求。请稍后重试。',
    'Learn more about proof of presence': '了解在场证明',
    'Authenticate to merge': '验证身份以合并',
    'Unable to evaluate proof of presence. Try again later.': '无法评估在场证明。请稍后重试。',
    'PoP provided': '已提供在场证明',
    'Proof of presence required': '需要在场证明',
    'Proof of presence verified': '在场证明已验证',
    'Proof of presence unavailable': '在场证明不可用',
    'Unable to load proof of presence. Try again later.': '无法加载在场证明。请稍后重试。'
  },
  scoped: {
    // 合并队列片段：This repository uses the <merge queue> for all merges into the <main> branch.
    'Not enabled for this repository': '此存储库未启用',
    'This repository uses the': '此存储库使用',
    'merge queue': '合并队列',
    'for all merges into the': '来合并所有更改到',
    'branch.': '分支。',
    'Remove from queue': '从队列中删除',
    // 自动合并片段：This pull request will <merge automatically> when all requirements are met.
    // 整句由下方 inline 处理；宿主结构不同、不命中时按片段拼读（原文无括号、逗号，条件作句末状语）
    'This pull request will': '此拉取请求将',
    'merge automatically': '自动合并',
    'squash automatically': '自动压缩合并',
    'rebase automatically': '自动变基合并',
    'be added to the merge queue': '加入合并队列',
    'when all requirements are met.': '于满足所有要求时。',
    // 草稿：Add more commits by pushing to the <branch> branch on <repo>.（采集数据无此句 DOM，按片段收录）
    'Draft state': '草稿状态',
    'Add more commits by pushing to the': '推送更多提交到',
    'branch on': '分支位于',
    // 合并后：You’re all set — the <branch> branch can be safely deleted.
    "You're all set — the": '一切就绪——',
    'You’re all set — the': '一切就绪——',
    'You’re all set—the': '一切就绪——',
    "You're all set—the": '一切就绪——',
    'branch can be safely deleted.': '分支可以安全删除。',
    'in the': '入口在',
    settings: '设置',
    'settings.': '设置。',
    Revert: '还原',
    // 关闭后：This pull request is closed, but the <branch> branch has unmerged commits.
    'This pull request is closed, but the': '此拉取请求已关闭，但',
    'branch has unmerged commits.': '分支有未合并的提交。',
    'Delete Codespace?': '要删除代码空间吗？',
    // 部署
    'No deployments': '暂无部署',
    'View deployment': '查看部署',
    Deployments: '部署',
    // 堆栈合并
    'Stacked pull requests': '堆叠式拉取请求',
    'Refresh the page to try again.': '请刷新页面后重试。',
    'Cancel merge': '取消合并',
    Merging: '合并中',
    'Not ready': '未就绪',
    Ready: '就绪',
    Rebased: '已变基',
    'Rebase failed': '变基失败',
    Rebasing: '变基中',
    'Resolve the merge conflicts in pull request': '请先解决拉取请求',
    ', then try to rebase this stack again.': '中的合并冲突，然后重新变基此堆栈。',
    'Check pull request': '请检查拉取请求',
    'for any issues, then try to rebase this stack again.': '是否有问题，然后重新变基此堆栈。',
    'Select Done to proceed.': '选择完成以继续。',
    'What will happen': '将会发生什么',
    // 在场证明
    'Authenticating...': '身份验证中...',
    'Authenticating…': '身份验证中…',
    'via MFA': '通过多因素身份验证',
    'via Re-Auth': '通过重新进行身份验证',
    'Proof of presence': '在场证明'
  },
  regexp: [
    // 合并队列
    [/^for all merges into the (.+) branch\.$/, '来合并所有更改到 $1 分支。'],
    [/^There (?:is|are) (\d+) pull requests? ahead of this one in the$/, '此拉取请求在以下队列中前面还有 $1 个拉取请求'],
    [
      /^This pull request will be automatically grouped with other pull requests and merged into (.+)\.$/,
      '此拉取请求将自动与其他拉取请求分组并合并到 $1。'
    ],
    [/^This pull request will be merged into (.+) by itself\.$/, '此拉取请求将单独合并到 $1。'],
    // 自动合并
    [
      /^This pull request and (\d+) others? in the stack will (automatically merge|be added to the merge queue) when they all meet the merge requirements\.$/,
      (_, count, action) => `此拉取请求与堆栈中的其他 ${count} 个拉取请求将在全部满足合并要求后${AUTO_MERGE_ACTION[action] ?? action}。`
    ],
    [/^Are you sure you want to disable auto-merge for (\d+) pull requests?\?$/, '确定要为 $1 个拉取请求禁用自动合并吗？'],
    // 合并后：代码空间清理（产品名按 product-names.md：codespace → 代码空间）
    [/^Delete (?:(\d+) )?codespaces?$/, (_, count) => (count ? `删除 ${count} 个代码空间` : '删除代码空间')],
    [/^Deleting (?:(\d+) )?codespaces?\.$/, (_, count) => (count ? `正在删除 ${count} 个代码空间。` : '正在删除代码空间。')],
    [/^Couldn['’]t delete (?:(\d+) )?codespaces?$/, (_, count) => (count ? `无法删除 ${count} 个代码空间` : '无法删除代码空间')],
    [
      /^You['’]re all set — the (\d+) codespaces? for head branch can be safely deleted\. You can also manage your codespaces in$/,
      '一切就绪——头部分支的 $1 个代码空间可以安全删除。你也可以在以下位置管理代码空间'
    ],
    [/^Are you sure you want to delete (\d+) codespaces? for the head branch\?$/, '确定要删除头部分支的 $1 个代码空间吗？'],
    // 堆栈合并
    [/^(\d+) pull requests are being merged\.$/, '正在合并 $1 个拉取请求。'],
    [/^Merging this pull request will also merge (\d+) pull requests? below it\.$/, '合并此拉取请求还将合并其下方的 $1 个拉取请求。'],
    [/^(\d+) of (\d+) pull requests loading$/, '正在加载 $1/$2 个拉取请求'],
    [/^(\d+) of (\d+) branches rebased$/, '已变基 $1/$2 个分支'],
    [
      /^Resolve the merge conflicts in pull request #(\d+), then try to rebase this stack again\.$/,
      '请先解决拉取请求 #$1 中的合并冲突，然后重新变基此堆栈。'
    ],
    [
      /^Check pull request #(\d+) for any issues, then try to rebase this stack again\.$/,
      '请检查拉取请求 #$1 是否有问题，然后重新变基此堆栈。'
    ],
    [/^Rebase this stack onto the latest version of (.+)\.$/, '将此堆栈变基到 $1 的最新版本。'],
    // 在场证明
    [/^This requirement was satisfied by ([\w-]+)$/, '此要求已由 $1 满足']
  ],
  inline: [
    // 禁用自动合并的说明（React 合并框）：This pull request will <span>merge automatically</span> when all requirements
    // are met. <a>Learn more about automatically merging a pull request.</a>；条件提到句中，原文无括号
    ['This pull request will {} when all requirements are met. {}', '此拉取请求将在满足所有要求时{}。{}'],
    ['This pull request will {} when all requirements are met.', '此拉取请求将在满足所有要求时{}。'],
    // 合并后（跨存储库）：You're all set — the <分支> branch can be safely deleted. If you wish, you can also delete this
    // fork of <strong>owner/repo</strong> in the <a>settings</a>.（宿主为合并框副标题 <p>）；原文一个逗号，译文一个
    [
      "You're all set — the {} branch can be safely deleted. If you wish, you can also delete this fork of {} in the {}.",
      '一切就绪——{} 分支可以安全删除。如有需要也可以删除 {} 的此复刻，入口在{}。'
    ],
    [
      'You’re all set — the {} branch can be safely deleted. If you wish, you can also delete this fork of {} in the {}.',
      '一切就绪——{} 分支可以安全删除。如有需要也可以删除 {} 的此复刻，入口在{}。'
    ],
    // 同一存储库时只有前半句；按片段翻译时“——”后的空白文本节点会留下空格，整句收录
    ["You're all set — the {} branch can be safely deleted.", '一切就绪——{} 分支可以安全删除。'],
    ['You’re all set — the {} branch can be safely deleted.', '一切就绪——{} 分支可以安全删除。']
  ]
} satisfies PageDictionary
