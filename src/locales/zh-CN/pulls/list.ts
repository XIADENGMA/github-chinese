import type { PageDictionary } from '../../../core/types'
import { FILTER_BAR_INLINE, FILTER_BAR_RULES, FILTER_BAR_SCOPED, LABEL_SUGGESTION_IGNORE } from '../issues/filter'

/**
 * 筛选框（与议题列表同一组件）的 scoped 词条中不收的：No、Pending 在拉取请求页沿用通用词典的“否”“待处理”；
 * 其余已由其他拉取请求子文件同译收录
 */
const FILTER_BAR_SKIP: ReadonlySet<string> = new Set([
  'No',
  'Pending',
  // dashboard.ts、mergebox.ts、comments.ts、conflicts.ts
  'Exclude',
  'Review requested',
  'Skipped',
  'Cancelled',
  'Waiting',
  'Category',
  'between',
])

/** 筛选框的 scoped 词条：建议列表（筛选器名称、说明、取值）、高级筛选、校验提示，取自 issues/filter.ts */
const FILTER_BAR: Readonly<Record<string, string>> = Object.fromEntries(
  Object.entries(FILTER_BAR_SCOPED).filter(([key]) => !FILTER_BAR_SKIP.has(key)),
)

const REVIEW_FILTER: Readonly<Record<string, string>> = {
  'Review required': '需要审查',
  Approved: '已批准',
  'Changes requested': '已请求更改',
  'No reviews': '暂无审查',
  'Approved review': '已批准',
  'Reviewed by you': '你已审查',
  'Not reviewed by you': '你未审查',
  'Awaiting review from you': '等待你审查',
  'Awaiting review from you or your team': '等待你或你的团队审查',
}

const REVIEW_FILTER_SOURCE = Object.keys(REVIEW_FILTER).join('|')

const SORT_FIELD: Readonly<Record<string, string>> = {
  Newest: '最新',
  Oldest: '最早',
  Updated: '更新时间',
  Comments: '评论数',
  'Best match': '最佳匹配',
  'Created on': '创建时间',
  'Last updated': '最后更新',
  'Total comments': '评论总数',
  Reactions: '反应',
  'Total reactions': '反应总数',
}

const SORT_FIELD_SOURCE = Object.keys(SORT_FIELD).join('|')

const REACTION_LABEL: Readonly<Record<string, string>> = {
  total: '',
  'Thumbs up': '👍 ',
  'Thumbs down': '👎 ',
  Laugh: '😄 ',
  Hooray: '🎉 ',
  Confused: '😕 ',
  Rocket: '🚀 ',
  Eyes: '👀 ',
  Heart: '❤️ ',
}

const ITEM_STATUS: Readonly<Record<string, string>> = {
  Open: '打开',
  'Closed (completed)': '已关闭（已完成）',
  'Not planned (skipped)': '未计划（已跳过）',
  'Duplicate of an existing item': '与已有项重复',
  'Merged (completed)': '已合并（已完成）',
  'In merge queue': '在合并队列中',
  'Open (in progress)': '打开（正在进行）',
  'Closed (abandoned)': '已关闭（已放弃）',
  'Draft (not ready)': '草稿（未就绪）',
  'Archived (abandoned)': '已存档（已放弃）',
}

const ITEM_STATUS_SOURCE = Object.keys(ITEM_STATUS)
  .map((status) => status.replace(/[()]/g, '\\$&'))
  .join('|')

/** 列表名称：No more pull requests、No issues and pull requests matched your search 等 */
const DASHBOARD_LABEL: Readonly<Record<string, string>> = {
  'pull requests': '拉取请求',
  'issues and pull requests': '议题和拉取请求',
}

/** 列表项检查状态图标：Status checks: success（与存储库首页同译） */
const STATUS_CHECK_STATE: Readonly<Record<string, string>> = {
  success: '成功',
  failure: '失败',
  pending: '挂起',
  error: '出错',
  expected: '等待报告',
}

/**
 * 拉取请求列表：存储库列表（React 新版与经典版）、全局 /pulls、筛选与排序、列表项元数据、ProTip、批量操作、堆栈列表。
 * 筛选框与议题列表是同一组件，建议列表、高级筛选与校验提示的词条和规则取自 issues/filter.ts。
 */
export default {
  static: {
    // 列表头部
    'Search pull requests': '搜索拉取请求',
    'Search all pull requests': '搜索所有拉取请求',
    'New pull request': '新建拉取请求',
    'Pull request filters': '拉取请求筛选器',
    'Pull requests display density': '拉取请求显示密度',
    'Loading pull requests display density': '正在加载拉取请求显示密度',
    'Loading pull requests': '正在加载拉取请求',
    'Change the pull requests type filter': '更改拉取请求类型筛选器',
    'Learn more about searching and filtering pull requests.': '了解搜索和筛选拉取请求。',
    'Pull requests navigation': '拉取请求导航',
    'Repository Pull Requests': '存储库拉取请求',
    'Tell us your feedback on the new pull request experience': '告诉我们你对新版拉取请求体验的看法',
    'Filter by reviews': '按审查筛选',
    'Filter by review': '按审查筛选',
    'Reviewed by you': '你已审查',
    'Not reviewed by you': '你未审查',
    'Awaiting review from you': '等待你审查',
    'Awaiting review from you or your team': '等待你或你的团队审查',
    // 经典列表“审查”筛选菜单（user-review-requested:@me）
    'Awaiting review from you specifically': '等待你本人审查',
    'Review required before merging': '合并前需要审查',

    // 列表项状态图标
    'Open pull request': '打开的拉取请求',
    'Closed pull request': '已关闭的拉取请求',
    'Merged pull request': '已合并的拉取请求',
    'Draft pull request': '草稿拉取请求',
    'Pull request in merge queue': '合并队列中的拉取请求',
    'Queued pull request': '已排队的拉取请求',
    'Archived pull request': '已存档的拉取请求',
    'Queued, view merge queue': '已排队，查看合并队列',

    // 空状态
    'No pull requests matched your search': '没有匹配的拉取请求',
    'No more pull requests': '没有更多拉取请求',
    'When a pull request needs your review or attention, it’ll appear here.':
      '需要你审查或关注的拉取请求会显示在这里。',
    "When a pull request needs your review or attention, it'll appear here.":
      '需要你审查或关注的拉取请求会显示在这里。',
    'Failed to load pull requests. Try refreshing the page.': '加载拉取请求失败。请刷新页面。',
    'There aren’t any open pull requests.': '没有打开的拉取请求。',
    "There aren't any open pull requests.": '没有打开的拉取请求。',
    'There aren’t any closed pull requests.': '没有已关闭的拉取请求。',
    "There aren't any closed pull requests.": '没有已关闭的拉取请求。',
    'Welcome to pull requests!': '欢迎使用拉取请求！',
    'Pull requests help you collaborate on code with other people. As pull requests are created, they’ll appear here in a searchable and filterable list. To get started, you should':
      '拉取请求帮助你与他人协作编写代码。创建的拉取请求会显示在这里，可供搜索和筛选。开始使用，你可以',
    "Pull requests help you collaborate on code with other people. As pull requests are created, they'll appear here in a searchable and filterable list. To get started, you should":
      '拉取请求帮助你与他人协作编写代码。创建的拉取请求会显示在这里，可供搜索和筛选。开始使用，你可以',
    'create a pull request': '创建拉取请求',
    // 首次贡献说明：If you know how to fix an <issue>, consider opening a pull request for it.（链接 issue 见 scoped）
    'If you know how to fix an': '如果你知道如何修复某个',
    ', consider opening a pull request for it.': '，可以考虑为其创建拉取请求。',
    // 有贡献指南时后接 You can read this repository’s <contributing guidelines> to learn how to open a good pull request.
    // （多句文本按句查词，两句拼读）
    'If you would like to submit code to this repository, consider opening a pull request.':
      '如果你想向此存储库提交代码，可以考虑创建拉取请求。',
    'You can read this repository’s': '你可以阅读此存储库的',
    'to learn how to open a good pull request.': '以了解如何创建优质的拉取请求。',

    // 经典列表筛选菜单、搜索框与 ProTip（与议题列表共用，原文即写 issues）
    'Filter Issues': '筛选议题',
    'Search all issues': '搜索所有议题',
    'Click a checkbox on the left to edit multiple issues at once.': '单击左侧的复选框可一次编辑多个议题。',
    'No projects found. Sorry about that.': '未找到项目。',

    // 经典列表筛选菜单与 ProTip（拉取请求专有）
    'Filter Pull Requests': '筛选拉取请求',
    'Filter pull requests': '筛选拉取请求',
    'Pull requests with no milestone': '无里程碑的拉取请求',
    'Filter pull requests by the default branch with': '按默认分支筛选拉取请求可用',
    'Find all pull requests that aren’t related to any open issues with': '查找与任何打开的议题都无关的拉取请求可用',
    "Find all pull requests that aren't related to any open issues with": '查找与任何打开的议题都无关的拉取请求可用',
    'on any issue or pull request to go back to the pull request listing page.':
      '可从任意议题或拉取请求返回拉取请求列表页。',
    'Exclude your own pull requests with': '排除你自己的拉取请求可用',
    // ProTip! Add <.patch> or <.diff> to the end of URLs for Git’s plaintext views.
    'to the end of URLs for Git’s plaintext views.': '到 URL 末尾以查看 Git 纯文本视图。',
    "to the end of URLs for Git's plaintext views.": '到 URL 末尾以查看 Git 纯文本视图。',
    // ProTip! Add comments to specific lines under <Files changed>.
    'Add comments to specific lines under': '可在以下位置为特定行添加评论',

    // 批量操作
    'Assigned to some selected pull requests': '已分配给部分所选拉取请求',
    'Pull requests updated, but the results could not be refreshed': '拉取请求已更新，但无法刷新结果',
    'Could not update pull requests': '无法更新拉取请求',

    // 堆栈列表
    'Open stacks': '打开的堆栈',
    'Completed stacks': '已完成的堆栈',
    'There are no open stacks': '没有打开的堆栈',
    'There are no completed stacks': '没有已完成的堆栈',
    'Back to stacks': '返回堆栈列表',

    // 全局 /pulls
    'Pull requests created by you': '你创建的拉取请求',
    'Pull requests assigned to you': '分配给你的拉取请求',
    'Pull requests mentioning you': '提及你的拉取请求',
    'Pull requests requesting your review': '请求你审查的拉取请求',
    // 视图说明的大写 R 写法
    'Pull Requests mentioning you': '提及你的拉取请求',
    'Pull Requests requesting your review': '请求你审查的拉取请求',
    // 经典 /pulls 的存储库可见性筛选项（Public repositories only 由 org-settings 词典收录）
    'Private repositories only': '仅专用存储库',
  },
  scoped: {
    // 筛选框（与议题列表同一组件）；Parent issue、Blocked by 在议题页由 issues/metadata.ts 收录
    ...FILTER_BAR,
    'Parent issue': '父议题',
    'Blocked by': '被阻止',

    // 列表头部
    'Merge queue': '合并队列',
    Pages: '页面',
    Stacks: '堆栈',
    'Authored by me': '我创建的',
    'Created by me': '我创建的',
    'Assigned to me': '分配给我的',
    'Involves me': '与我有关',
    'Review requests': '审查请求',
    'Repository visibility': '存储库可见性',
    'Filter by organization or owner': '按组织或所有者筛选',

    // 与议题列表共用的筛选与排序
    Label: '标签',
    Labels: '标签',
    Milestones: '里程碑',
    Milestone: '里程碑',
    Project: '项目',
    Reviews: '审查',
    Assignee: '受理人',
    Assignees: '受理人',
    'Sort…': '排序…',
    Order: '顺序',
    ascending: '升序',
    descending: '降序',
    'Created on': '创建时间',
    'Last updated': '最后更新',
    'Total comments': '评论总数',
    'Best match': '最佳匹配',
    'Total reactions': '反应总数',
    Laugh: '大笑',
    Hooray: '欢呼',
    Confused: '困惑',
    Rocket: '火箭',
    Eyes: '眼睛',
    Heart: '爱心',
    'Filter by label': '按标签筛选',
    'Filter by labels': '按标签筛选',
    'Filter by projects': '按项目筛选',
    'Filter by project': '按项目筛选',
    'Filter by milestones': '按里程碑筛选',
    'Filter by milestone': '按里程碑筛选',
    'Filter by assignee': '按受理人筛选',
    'Filter by who’s assigned': '按受理人筛选',
    "Filter by who's assigned": '按受理人筛选',
    'Filter users': '筛选用户',
    'Filter labels': '筛选标签',
    'Filter milestones': '筛选里程碑',
    'Filter authors': '筛选作者',
    'User results': '用户结果',
    'Label results': '标签结果',
    'Pull request results': '拉取请求结果',
    Unlabeled: '无标签',
    'Assigned to nobody': '未分配',
    'Comfortable display density': '宽松显示密度',
    'Compact display density': '紧凑显示密度',
    Created: '已创建',
    Assigned: '已分配',
    Mentioned: '提及我的',
    'Approved review': '已批准',
    'No reviews': '暂无审查',

    // 经典列表筛选菜单
    'Everything assigned to you': '分配给你的所有内容',
    'Everything mentioning you': '提及你的所有内容',
    'Open issues and pull requests': '打开的议题和拉取请求',
    'View advanced search syntax': '查看高级搜索语法',
    'Most commented': '评论最多',
    'Least commented': '评论最少',
    'Most reactions': '反应最多',
    // 标签筛选菜单页脚：Use <kbd>alt</kbd> + <kbd>click/return</kbd> to exclude labels，
    // or <kbd>⇧</kbd> + <kbd>click/return</kbd> for logical OR（Use、or 由通用词典翻译）
    'to exclude labels': '排除标签',
    'for logical OR': '表示逻辑或',

    // ProTip（与议题列表共用）
    'Mix and match filters to narrow down what you’re looking for.': '组合使用筛选器以缩小查找范围。',
    "Mix and match filters to narrow down what you're looking for.": '组合使用筛选器以缩小查找范围。',
    'Exclude everything labeled': '排除所有带有标签',
    'Follow long discussions with': '关注长讨论可用',
    'Notify someone on an issue with a mention, like:': '在议题中提及某人以通知对方，例如：',
    'to see everything that’s not assigned.': '查看所有未分配的内容。',
    "to see everything that's not assigned.": '查看所有未分配的内容。',
    'will show everything without a label.': '将显示所有无标签的内容。',
    'will show everything without a milestone.': '将显示所有无里程碑的内容。',
    'What’s not been updated in a month:': '一个月内未更新的：',
    "What's not been updated in a month:": '一个月内未更新的：',
    'Updated in the last three days:': '最近三天更新的：',
    'Ears burning? Get': '想知道谁在讨论你？查看',
    'mentions with': '的提及可用',
    'Exclude your own issues with': '排除你自己的议题可用',
    'Find everything you created by searching': '查找你创建的所有内容可搜索',

    // 空状态与搜索
    'Invalid query': '查询无效',
    'Visit a lower page.': '请访问前面的页面。',
    'Enter a query to start searching.': '输入查询以开始搜索。',
    'Learn more about searching and filtering': '了解搜索与筛选',
    'All caught up': '全部处理完毕',
    'Try a new search': '尝试新的搜索',
    Unread: '未读',
    // 经典列表无结果：You could search <all of GitHub> or try an <advanced search>.（前两段由通用词典翻译）
    'or try an': '或尝试',
    'advanced search': '高级搜索',
    // 首次贡献说明的链接：If you know how to fix an <issue>, …（筛选框高亮层的 is:issue 已由忽略规则排除）
    issue: '议题',

    // 列表项：#123 opened <时间> by <用户>（拉取请求的动词 open 译“创建”；common-ui 的共用 opened 为“打开于”）
    opened: '创建于',
    by: '由',
    'was merged': '合并于',
    'was closed': '关闭于',

    // 批量操作
    'Apply labels': '应用标签',
    'Mark as': '标记为',
    Unarchived: '已取消存档',
    Assign: '分配',
    'Assign to nobody': '不分配给任何人',
    'Assign someone': '分配给某人',
    'Apply assignees': '应用受理人',
    'Apply milestone': '应用里程碑',
    'Add to projects': '添加到项目',
    // 经典列表 ProTip：Adding <no:label> will show everything without a label.
    Adding: '添加',

    // 堆栈进度：<3> unmerged（整句由下方 inline 处理，数字不在独立元素中时按片段）
    unmerged: '未合并',
  },
  regexp: [
    // 经典列表计数：546 Open / 12,345 Closed
    [/^([\d,]+) Open$/, '$1 个打开的'],
    [/^([\d,]+) Closed$/, '$1 个已关闭的'],
    [/^([\d,]+) Total$/, '共 $1 个'],
    // 经典列表项：#123 opened、#123 by
    [/^#(\d+) opened$/, '#$1 创建于'],
    [/^#(\d+) by$/, '#$1 由'],
    [/^Open pull requests created by ([\w-]+(?:\[bot\])?)$/, '$1 创建的打开的拉取请求'],
    // 空状态：No more pull requests、No issues and pull requests matched your search
    [
      /^No (pull requests|issues and pull requests) matched your search$/,
      (_, label) => `没有匹配的${DASHBOARD_LABEL[label] ?? label}`,
    ],
    [
      /^Search for (pull requests|issues and pull requests)\.$/,
      (_, label) => `搜索${DASHBOARD_LABEL[label] ?? label}。`,
    ],
    // 首次贡献横幅标题（存储库名是相邻文本节点，拼接后整句匹配；与议题列表同译）
    [/^👋 Want to contribute to ([\w.-]+\/[\w.-]+)\?$/, '👋 想为 $1 做贡献吗？'],
    // 堆栈列表
    [/^(\d+) pull requests in this stack$/, '此堆栈中有 $1 个拉取请求'],
    // 筛选按钮无障碍名称（标签名是用户内容，原文无引号，译文不加）
    [/^Filter by author (\S+)$/, '按作者 $1 筛选'],
    [/^Filter by assignee (\S+)$/, '按受理人 $1 筛选'],
    [/^Filter by label (.+)$/, '按标签 $1 筛选'],
    [/^Filter by repository ([\w.-]+\/[\w.-]+)$/, '按存储库 $1 筛选'],
    [
      new RegExp(`^Filter by review: (${REVIEW_FILTER_SOURCE})$`),
      (_, label) => `按审查筛选：${REVIEW_FILTER[label] ?? label}`,
    ],
    // 排序按钮：Sort by Newest descending → 按最新降序排序（原文无标点，改语序代替冒号、逗号）
    [
      new RegExp(`^Sort by (${SORT_FIELD_SOURCE}) (ascending|descending)$`),
      (_, field, direction) => `按${SORT_FIELD[field] ?? field}${direction === 'ascending' ? '升序' : '降序'}排序`,
    ],
    [new RegExp(`^Sort by (${SORT_FIELD_SOURCE})$`), (_, field) => `按${SORT_FIELD[field] ?? field}排序`],
    // 审查状态提示
    [/^([\d,]+) review approvals?$/, '$1 个批准'],
    [/^([\d,]+) reviews? requesting changes$/, '$1 个审查请求更改'],
    // 检查状态
    [/^(\d+)\/(\d+) checks passing$/, '$1/$2 个检查通过'],
    [/^(\d+) ?\/ ?(\d+) checks OK$/, '$1/$2 个检查正常'],
    [
      /^Status checks: (success|failure|pending|error|expected)$/,
      (_, state) => `状态检查：${STATUS_CHECK_STATE[state] ?? state}`,
    ],
    // 任务列表进度（量词用“个”，与议题、个人主页贡献同译）
    [/^(\d+) of (\d+) tasks?$/, '$2 个任务中已完成 $1 个'],
    [/^(\d+) tasks? done$/, '$1 个任务已完成'],
    [/^(\d+) tasks?$/, '$1 个任务'],
    // 链接的议题、反应数
    [/^(\d+) linked issues?$/, '$1 个链接的议题'],
    [/^(\d+) linked issues? for pull request ([\w.-]+\/[\w.-]+#\d+): (.+)$/, '拉取请求 $2 的 $1 个链接的议题：$3'],
    [
      /^([\d,]+) (total|Thumbs up|Thumbs down|Laugh|Hooray|Confused|Rocket|Eyes|Heart) reactions?$/,
      (_, count, label) => `${REACTION_LABEL[label] ?? ''}${count} 个反应`,
    ],
    [/^Milestone: (.+)$/, '里程碑：$1'],
    [/^\+(\d+), show all (\d+) assignees$/, '+$1，显示全部 $2 个受理人'],
    // 列表项无障碍名称
    [new RegExp(`^Status: (${ITEM_STATUS_SOURCE})\\.$`), (_, status) => `状态：${ITEM_STATUS[status] ?? status}。`],
    // 列表项复选框：Select: <标题>（标题为空时只剩 Select:）
    [/^Select:(?: (.+))?$/, (_, title) => (title ? `选择：${title}` : '选择')],
    // 读屏播报：Selected. <标题>.（原文状态后是句号，不改冒号）
    [/^Selected\. (.+)\.$/, '已选择。$1。'],
    [/^Unselected\. (.+)\.$/, '未选择。$1。'],
    // 全选：Select all pull requests: <列表标题>；3 pull requests of 25 selected（与 common-ui 同译，原文无标点）
    [/^Select all pull requests:(?: (.+))?$/, (_, title) => (title ? `全选拉取请求：${title}` : '全选拉取请求')],
    [
      /^([\d,]+) pull requests? (?:of ([\d,]+) )?selected$/,
      (_, count, total) => (total ? `${total} 个拉取请求中已选择 ${count} 个` : `已选择 ${count} 个拉取请求`),
    ],
    // 数字在独立元素中时的后半段：<3> of 25 selected（原文无标点，不加逗号；与议题列表同一写法）
    [/^of ([\d,]+) selected$/, '/$1 已选择'],
    // 批量更新
    [/^(\d+) pull requests? returned to the list$/, '$1 个拉取请求已返回列表'],
    [/^Updating (\d+) pull requests?$/, '正在更新 $1 个拉取请求'],
    [/^Bulk update is in progress (\d+) %$/, '批量更新进行中 $1%'],
    [/^Could not update (\d+) of (\d+) pull requests?$/, '$2 个拉取请求中有 $1 个无法更新'],
    [/^(\d+) pull requests? updated$/, '已更新 $1 个拉取请求'],
    // 筛选框（与议题列表同一组件）：建议列表的组合文字、高级筛选、校验提示；宽泛规则，放在最后
    ...FILTER_BAR_RULES,
  ],
  inline: [
    // 堆栈进度（堆栈列表与堆栈详情）：<span><span>3</span> merged</span>；不收录时 merged 落到头部片段“合并了”
    ['{#} merged', '{#} 个已合并'],
    ['{#} unmerged', '{#} 个未合并'],
    // 筛选框的校验提示（与议题列表同一组件）
    ...FILTER_BAR_INLINE,
  ],
  // 筛选框 label: 取值建议里的标签名（与议题列表同一组件）
  ignore: [LABEL_SUGGESTION_IGNORE],
} satisfies PageDictionary
