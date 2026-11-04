import type { PageDictionary, RegExpRule } from '../../../core/types'

const PULL_STATES: Readonly<Record<string, string>> = {
  Open: '打开的',
  Closed: '已关闭的',
  Merged: '已合并的',
  Draft: '草稿'
}

const regexp: readonly RegExpRule[] = [
  // 分支行：领先和落后计数图的无障碍名称（原文为 and，译文不用斜杠）
  [/^Ahead and behind counts: (\d[\d,]*) ahead, (\d[\d,]*) behind$/, '领先和落后计数：领先 $1，落后 $2'],
  // 分支行：关联拉取请求的无障碍名称
  [
    /^(Open|Closed|Merged|Draft) pull request #(\d+)$/,
    (_, state: string, number: string) => `${PULL_STATES[state] ?? state}拉取请求 #${number}`
  ],
  // 分支菜单：重命名分支的无障碍名称
  [/^Rename branch ['‘](.+)['’]$/, '重命名分支“$1”'],
  // 未保护分支横幅
  [/^Your (\S+) branch isn['’]t protected$/, '你的 $1 分支未受保护'],
  // 合并队列徽章的无障碍名称（1 个时原文为 There is 1 pull request in the merge queue）
  [/^There are (\d+) pull requests in the merge queue$/, '合并队列中有 $1 个拉取请求'],
  // 搜索分支后的结果播报
  [/^(\d[\d,]*) results? found$/, '找到 $1 个结果'],
  // 重命名对话框：名称校验结果（服务器按规范化后的名称返回）、重命名成功提示
  [/^Your branch name will be (\S+)$/, '分支名称将为 $1'],
  [/^Branch (\S+) will be renamed to (\S+) shortly\.$/, '分支 $1 即将重命名为 $2。']
]

/**
 * 分支页（/branches）：标签页、分支表格、合并队列徽章、分支菜单、新建 / 重命名 / 删除 / 恢复分支、
 * 未保护分支横幅。
 */
export default {
  static: {
    // 页头与标签页
    'Branches navigation': '分支导航',
    'Branch views': '分支视图',
    'Search branches...': '搜索分支...',
    'Search branches…': '搜索分支…',
    'Search branches': '搜索分支',
    'Your branches': '你的分支',
    'Active branches': '活跃分支',
    'Stale branches': '过时分支',
    'View more branches': '查看更多分支',
    'No branches': '没有分支',
    'No branches match the search': '没有与搜索匹配的分支',

    // 表格列与行操作
    'Check status': '检查状态',
    Behind: '落后',
    Ahead: '领先',
    'Action menu': '操作菜单',
    'Merge queue': '合并队列',
    'View the merge queue': '查看合并队列',
    'There is 1 pull request in the merge queue': '合并队列中有 1 个拉取请求',
    'Copy branch name to clipboard': '复制分支名称到剪贴板',
    'View rules': '查看规则',
    'View all rules': '查看所有规则',
    'There are no rulesets associated with this branch.': '此分支没有关联的规则集。',
    'This branch is protected by branch protections': '此分支受分支保护规则保护',
    'Branch menu': '分支菜单',
    'Rename branch': '重命名分支',
    'This branch no longer exists.': '此分支已不存在。',

    // 操作错误
    "You can't delete the default branch.": '无法删除默认分支。',
    'You can’t delete the default branch.': '无法删除默认分支。',
    // protected branch → 受保护分支（GLOSSARY，与 repo-settings、pulls 一致）
    "You can't delete this protected branch.": '无法删除此受保护分支。',
    'You can’t delete this protected branch.': '无法删除此受保护分支。',
    // 正在重命名的分支（原文无逗号，译文用“因…而…”不加）
    "You can't delete this branch because it is being renamed.": '此分支因正在重命名而无法删除。',
    'You can’t delete this branch because it is being renamed.': '此分支因正在重命名而无法删除。',
    "You can't delete this branch.": '无法删除此分支。',
    'You can’t delete this branch.': '无法删除此分支。',
    'Branch could not be deleted.': '无法删除分支。',
    'Branch could not be deleted': '无法删除分支',
    'Branch could not be restored.': '无法恢复分支。',
    "You can't rename this branch because it is being renamed.": '此分支因正在重命名而无法再次重命名。',
    'You can’t rename this branch because it is being renamed.': '此分支因正在重命名而无法再次重命名。',
    "You don't have permission to rename this branch.": '你没有重命名此分支的权限。',
    'You don’t have permission to rename this branch.': '你没有重命名此分支的权限。',

    // 删除分支对话框：分支 <名称> 关联了一个打开的拉取请求： / 分支 <名称> 将被永久删除。
    'is associated with an open pull request:': '关联了一个打开的拉取请求：',
    'If you delete this branch, the pull request will be closed.': '删除此分支将关闭该拉取请求。',
    'will be permanently deleted.': '将被永久删除。',
    'Are you sure you want to delete this branch?': '确定要删除此分支吗？',

    // 未保护分支横幅：你的 <main> 分支未受保护
    "branch isn't protected": '分支未受保护',
    'branch isn’t protected': '分支未受保护',

    // 新建分支对话框
    'New branch': '新建分支',
    'Create a branch': '创建分支',
    'New branch name': '新分支名称',
    'Choose from this fork or its upstream repository.': '从此复刻或其上游存储库中选择。',
    'Create new branch': '创建新分支',
    'Unable to create branch:': '无法创建分支：',
    'Repository rule violations found:': '发现违反存储库规则的情况：',
    'Please address the rule violations and try again.': '请解决违反规则的问题后重试。',
    'Learn more about rulesets.': '了解规则集。',
    'Checking if ref name is valid': '正在检查引用名称是否有效',
    'Checking if branch name is valid': '正在检查分支名称是否有效',

    // 重命名分支对话框（“将关闭 N 个来自此分支的打开的拉取请求。”与页面站点说明由 repo-settings 词典收录）
    'Rename this branch': '重命名此分支',
    'Rename default branch': '重命名默认分支',
    'Renaming this branch:': '重命名此分支将：',
    'draft release targeting this branch.': '个以此分支为目标的发行版草稿。',
    'draft releases targeting this branch.': '个以此分支为目标的发行版草稿。',
    // 产品名译中文：GitHub Pages → GitHub 页面
    'Show details on unpublishing GitHub Pages site': '显示取消发布 GitHub 页面站点的详细信息',
    'Hide details on unpublishing GitHub Pages site': '隐藏取消发布 GitHub 页面站点的详细信息',
    'Show details on updating local environment': '显示更新本地环境的详细信息',
    'Hide details on updating local environment': '隐藏更新本地环境的详细信息',
    "Will not update your members' local environments.": '不会更新成员的本地环境。',
    'Will not update your members’ local environments.': '不会更新成员的本地环境。',
    "Your members will have to manually update their local environments. We'll let them know when they visit the repository, or you can share the following commands.":
      '成员需要手动更新本地环境。他们访问存储库时会收到通知，你也可以分享以下命令。',
    'Your members will have to manually update their local environments. We’ll let them know when they visit the repository, or you can share the following commands.':
      '成员需要手动更新本地环境。他们访问存储库时会收到通知，你也可以分享以下命令。'
  },
  scoped: {
    // 标签页、表格列与行操作（All、Default、Pull request、Restore、Deleted 由 common-ui 收录）
    Branches: '分支',
    Overview: '概述',
    Yours: '你的',
    Active: '活跃',
    Stale: '过时',
    'All branches': '所有分支',
    Branch: '分支',
    Updated: '更新时间',
    Source: '来源',
    Your: '你的',
    // 重命名对话框：重命名 <分支> 为：（Rename 由 common-ui 收录）
    'to:': '为：',
    // 重命名对话框的影响列表（数字在单独的元素中）：
    // 将更新 <3> 个以此分支为目标的拉取请求。 / … 个以此分支为目标并分布在 <2> 个存储库中的拉取请求。
    // 将更新 <1> 条明确针对以下分支的分支保护规则 <main>.
    'Will update': '将更新',
    'Will close': '将关闭',
    // 拉取请求一项的前半句整句见 inline，以下两条是整句未命中时的片段
    'pull request targeting this': '个以此',
    'pull requests targeting this': '个以此',
    'branch.': '分支为目标的拉取请求。',
    'branch across': '分支为目标并分布在',
    'repositories.': '个存储库中的拉取请求。',
    'branch protection that explicitly targets': '条明确针对以下分支的分支保护规则',
    'branch protections that explicitly target': '条明确针对以下分支的分支保护规则',
    // 删除分支对话框：分支 <名称> 将被永久删除。
    'The branch': '分支',
    // 与 pulls、repository 词典的全局条目同译，按页面收录
    'Delete branch': '删除分支',
    'Repository rule violations found': '发现违反存储库规则的情况',
    'Protect this branch from force pushing or deletion, or require status checks before merging.':
      '保护此分支免遭强制推送或删除，或要求合并前通过状态检查。',
    'Protect this branch': '保护此分支'
  },
  regexp,
  ignore: [
    // 分支行更新者的用户名提示
    '[class*="UserLink__"] + [data-component="Tooltip"]'
  ],
  inline: [
    // 重命名对话框：Will update <span>3</span> pull requests targeting this <span>branch…</span>（宿主为 <div>）；
    // 按片段翻译时“以此”后的空白文本节点会留下空格，前半句整句收录，尾部 <span> 里的片段照常翻译
    ['Will update {} pull request targeting this {}', '将更新 {} 个以此{}'],
    ['Will update {} pull requests targeting this {}', '将更新 {} 个以此{}']
  ]
} satisfies PageDictionary
