import type { PageDictionary } from '../../../core/types'

/**
 * 拉取请求概述页（Overview 预览）：“为你推荐”操作项、迷你合并状态、活动摘要、侧栏分区（受理人、标签、审查者、
 * 部署、开发、参与者、通知）、描述编辑历史记录、功能预览与反馈。
 * 审查者行的提示（Request review from …、Reviewing at … effort）见 sidebar.ts。
 */
export default {
  static: {
    // 功能预览
    'Try the new pull requests Overview page!': '试用新的拉取请求概述页面！',
    'Focus on what matters most and take action with confidence.': '专注于最重要的事项并从容采取行动。',
    'Welcome to the new pull requests Overview page!': '欢迎使用新的拉取请求概述页面！',
    'You can learn more, turn it off, or send feedback anytime from here.': '你可以随时在这里了解更多、关闭此功能或发送反馈。',
    'Overview preview could not be turned on. Try again.': '无法开启概述预览。请重试。',
    'Try the Overview page': '试用概述页面',
    'Try the Overview page, try again': '试用概述页面，重试',
    'Preview: Overview preview options': '预览：概述预览选项',
    'Private preview: Overview preview options': '私密预览：概述预览选项',
    'View Conversation page': '查看对话页面',
    'Temporarily return to the classic view': '暂时返回经典视图',
    'Turn off Overview preview': '关闭概述预览',
    'Turn off Overview preview?': '要关闭概述预览吗？',
    'Failed to turn off Overview preview': '关闭概述预览失败',
    'Why are you turning off Overview preview?': '为什么要关闭概述预览？',
    'Looking for an old friend?': '在找原来的内容？',
    'Status and details': '状态和详细信息',

    // 为你推荐：可合并性
    'Some non-required checks are failing': '部分非必需检查失败',
    'Some checks need approval': '部分检查需要批准',
    'Blocked by a downstack pull request': '被堆栈下层的拉取请求阻止',
    'Required checks failing': '必需检查失败',
    'Fix the failing required checks.': '修复失败的必需检查。',
    'View merge status': '查看合并状态',
    'Approvals unavailable': '批准信息不可用',
    'No approvals required': '无需批准',
    'View approvals': '查看批准',
    'No checks available': '无可用检查',
    'View unresolved comments': '查看未解决的评论',
    'No comments available': '无可用评论',
    'No checks have been reported for this pull request yet.': '此拉取请求尚未报告任何检查。',
    // 连接两个分句的 - 译作——
    'All requirements are met - merge the pull request.': '已满足所有要求——可以合并拉取请求。',
    'Address the requested changes before merging.': '合并前请处理所请求的更改。',
    'Unresolved comments must be resolved': '必须解决所有未解决的评论',
    'Resolve all comments before merging.': '合并前请解决所有评论。',
    'Request another approving review before this can merge.': '还需要再获得一个批准审查才能合并。',
    'Update your branch with the base branch before merging.': '合并前请使用基础分支更新你的分支。',
    'Update your branch with the base branch when convenient.': '方便时请使用基础分支更新你的分支。',

    // 为你推荐：拉取请求状态
    'An error occurred while deleting the head branch. Please try again.': '删除头部分支时出错。请重试。',
    'An error occurred while restoring the branch. Please try again.': '恢复分支时出错。请重试。',
    // ready for review → 可供审查
    'This pull request is not ready for review yet.': '此拉取请求尚不可供审查。',
    'Mark this pull request as ready when you want reviews.': '在需要审查时将此拉取请求标记为可供审查。',
    'Reopen it if you still need it.': '如仍需要可重新打开。',
    'Restore the branch if you still need it.': '如仍需要可恢复分支。',
    'Restoring head branch': '正在恢复头部分支',
    'Opening revert pull request': '正在创建还原拉取请求',

    // 为你推荐：审查者
    'Review what changed since your approval.': '审查自你批准以来的更改。',
    'Review what changed since your last review.': '审查自你上次审查以来的更改。',
    'View new changes': '查看新的更改',
    'All of your comment threads have been resolved.': '你的所有评论线程均已解决。',
    'Thank you for your time and thoughtful feedback.': '感谢你抽出时间提供细致的反馈。',
    'View your comments': '查看你的评论',
    "You're all set, thanks for your time!": '一切就绪，感谢你抽出时间！',
    'Your review is in progress': '你的审查正在进行',
    'Failed to load pending comments': '加载待处理的评论失败',
    'You have been assigned to review from': '你作为以下团队的成员被分配审查',
    'You have been assigned to review': '你已被分配审查',
    'Your review has been requested as a code owner': '你作为代码所有者被请求审查',
    'Start your review of the changes.': '开始审查这些更改。',
    'Review just your files': '仅审查你负责的文件',
    'You have a batch in progress': '你有正在进行的批次',

    // 为你推荐：堆栈
    'A previous stacked PR was closed': '堆栈中之前的拉取请求已关闭',
    'Review previous stacked PRs first': '请先审查堆栈中之前的拉取请求',
    'Review a previous stacked PR first': '请先审查堆栈中之前的一个拉取请求',
    'Complete your requested reviews in': '请先完成以下拉取请求中你被请求的审查',
    'Complete your requested review in': '请先完成以下拉取请求中你被请求的审查',

    // 活动摘要
    'Additional activity actions': '更多活动操作',
    'No new activity': '暂无新活动',

    // 侧栏分区
    'Unable to load assignees': '无法加载受理人',
    'Loading assignees': '正在加载受理人',
    "Assignees couldn't be loaded": '无法加载受理人',
    'Manage assignees': '管理受理人',
    'Unable to load labels': '无法加载标签',
    'Manage labels': '管理标签',
    'Unable to load reviewers': '无法加载审查者',
    'Manage reviewers': '管理审查者',
    'Filter reviewers': '筛选审查者',
    'No reviewers available': '无可用审查者',
    'No reviewers match your search.': '没有匹配的审查者。',
    'No reviewers are available for this pull request.': '此拉取请求没有可用的审查者。',
    'Failed to request review from Copilot.': '请求 Copilot 审查失败。',
    'Failed to re-request review.': '重新请求审查失败。',
    'Failed to update reviewers': '更新审查者失败',
    'Unable to load deployments': '无法加载部署',
    'Unable to load development': '无法加载开发信息',
    'Merging this pull request may close these issues.': '合并此拉取请求可能会关闭这些议题。',
    'Unable to load participants': '无法加载参与者',
    "You're now unsubscribed from this thread.": '你已取消订阅此线程。',
    "You're ignoring this repository.": '你正在忽略此存储库。',
    'Updating subscription': '正在更新订阅',
    'Set your default effort in': '可在以下位置设置默认审查强度',

    // 描述与评论
    'Description history is unavailable. Retry to load it again.': '描述历史记录不可用。请重试。',
    'History unavailable. Retry': '历史记录不可用。重试',
    '(loading description edit history)': '（正在加载描述编辑历史记录）',
    'Loading description history': '正在加载描述历史记录',
    '(view description edit history)': '（查看描述编辑历史记录）',
    'Failed to update description': '更新描述失败',
    'Pull request description updated successfully.': '拉取请求描述已更新。',
    'This comment could not be found. It may have been deleted or is no longer visible to you.':
      '未找到此评论。它可能已被删除或你已无权查看。',
    'Skip comments': '跳过评论',
    'Copilot summary warning': 'Copilot 摘要警告',
    'Copilot couldn’t regenerate this summary. The previous summary is shown.': 'Copilot 无法重新生成此摘要。显示的是之前的摘要。'
  },
  scoped: {
    // 功能预览
    'Try Overview': '试用概述',
    'Not now': '暂不',
    "What's new": '新功能',
    "See what's new": '查看新功能',
    'Loved!': '已喜欢！',
    'Love this feature': '喜欢此功能',
    // 页脚：Try visiting the new homes for <merge box> and the <timeline>.（and the 由 common/pages.ts 的全局词条翻译）
    'Try visiting the new home for the': '可在新位置查看',
    'Try visiting the new homes for': '可在新位置查看',
    'merge box': '合并框',
    timeline: '时间线',

    // 为你推荐
    'Recommended action': '推荐操作',
    'Unable to load this section': '无法加载此分区',
    'Try reloading the page.': '请重新加载页面。',
    'Checks failing': '检查失败',
    'Ready to merge': '可以合并',
    'Approval required': '需要批准',
    'Required to update': '需要更新',
    'Out of date': '已过时',
    Reviewed: '已审查',
    Failed: '失败',
    'Collapse checks': '折叠检查',
    'Expand checks': '展开检查',
    'Resolved comments': '已解决的评论',
    'Nothing to do.': '无需操作。',
    'Branch deleted': '分支已删除',
    'Branch restored': '分支已恢复',
    'Failed to delete branch': '删除分支失败',
    'Failed to restore branch': '恢复分支失败',
    'New changes': '新的更改',
    'Comments resolved': '评论已解决',
    'Start your review': '开始审查',
    'Review all files': '审查所有文件',
    'Loading item': '正在加载项',
    'Unable to load this item': '无法加载此项',
    'Collapse item': '折叠项',
    'Expand item': '展开项',
    // Reopen or remove <#12> before merging this pull request.（堆栈下层的拉取请求已关闭；remove 指移出堆栈）
    'Reopen or remove': '请重新打开或从堆栈中删除',
    // Resolve the issues in <#12> before merging this pull request.
    'Resolve the issues in': '请先解决以下拉取请求中的问题',
    'before merging this pull request.': '后再合并此拉取请求。',
    'before reviewing this pull request.': '后再审查此拉取请求。',
    // Resolve the <merge conflicts> before this can merge.
    'Resolve the': '请解决',
    'before this can merge.': '后才能合并。',
    // Delete the <branch> branch to tidy up.
    'Delete the': '删除',
    'branch to tidy up.': '分支以保持整洁。',
    // This pull request was merged <时间>. 时间元素紧跟片段，拼作“此拉取请求合并于 3 天前”
    'This pull request was merged': '此拉取请求合并于',
    // <user> merged in <sha> 3 days ago. / Merged in <sha>.
    'merged in': '合并于提交',
    'Merged in': '合并于提交',
    'Marked as draft': '已标记为草稿',
    'Marked ready for review': '已标记为可供审查',
    Reopened: '已重新打开',

    // 活动摘要
    'Copilot events': 'Copilot 事件',
    'Review comments': '审查评论',
    'PR updates': '拉取请求更新',

    // 侧栏分区
    'No reviewers': '无审查者',
    'Everyone else': '其他人',
    'No deployments yet': '暂无部署',
    'View workflow': '查看工作流',
    'No linked issues': '无链接的议题',
    'No participants': '无参与者',
    'See less': '收起',
    'None yet - feature coming soon': '暂无 - 功能即将推出',
    Prompt: '提示',
    'Failed to load comments': '加载评论失败',
    'refresh the page': '刷新页面'
  },
  regexp: [
    // 迷你合并状态
    [/^(\d+) of (\d+) approvals$/, '$1/$2 个批准'],
    [/^(\d+) of (\d+) required approvals received$/, '已获得 $1/$2 个必需的批准'],
    [/^(\d+) of (\d+) reviews approved$/, '$1/$2 个审查已批准'],
    [/^(\d+) of (\d+) successful checks$/, '$1/$2 个检查成功'],
    [/^(\d+) of (\d+) resolved comments$/, '已解决 $1/$2 条评论'],
    // 活动摘要（原文无标点，译文不加逗号）
    [/^(\d+) approved with (\d+) comments?$/, '$1 个批准含 $2 条评论'],
    [/^(\d+) requested changes with (\d+) comments?$/, '$1 个更改请求含 $2 条评论'],
    // 活动摘要其余各行：时间线面板的分组标题（N requested changes 见 mergebox.ts）；原文逗号转成顿号
    [/^(\d+) approved$/, '$1 个批准'],
    [/^(\d+) new commits?$/, '$1 个新提交'],
    [/^(\d+) review comments?$/, '$1 条审查评论'],
    [/^(\d+) requested reviewers? changed$/, '已更改 $1 个请求的审查者'],
    [/^(\d+) Copilot events?$/, '$1 个 Copilot 事件'],
    [/^(\d+) base changes?, (\d+) force push(?:es)?$/, '$1 次基础分支更改、$2 次强制推送'],
    [/^(\d+) base changes?$/, '$1 次基础分支更改'],
    [/^(\d+) force push(?:es)?$/, '$1 次强制推送'],
    // 待提交的批次（连接两个分句的破折号译作——）
    [/^(\d+) unsubmitted items? — only visible to you until submitted$/, '$1 个未提交的项——提交前仅你可见'],
    // 参与者：+3 more
    [/^\+(\d+) more$/, '另外 $1 个'],
    // 反馈字数
    [/^Feedback is too long\. Use (\d+) characters or fewer\.$/, '反馈过长。最多 $1 个字符。']
  ]
} satisfies PageDictionary
