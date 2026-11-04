import type { PageDictionary } from '../../../core/types'
import { joinName } from './list'

/** 锁定原因（时间线小写形式） */
const LOCK_REASON: Readonly<Record<string, string>> = {
  'off topic': '偏离主题',
  'too heated': '争论过激',
  resolved: '已解决',
  spam: '垃圾信息'
}

/** 项目状态名：无状态时 GitHub 显示 No status */
function projectStatus(status: string): string {
  return status === 'No status' ? '无状态' : status
}

/** 以 X 为由（锁定原因是界面文字，原文无引号，译文不加） */
function lockReason(reason: string): string {
  return `以${LOCK_REASON[reason] ?? reason}为由`
}

/**
 * 议题时间线：事件句子与片段、加载更多、引用与专用存储库提示、错误。
 * 事件由“操作者 + 文本片段 + 链接 / 令牌”交替组成，片段按出现位置分别收录，译文需能顺序拼读；
 * 原文无标点的片段，译文不加逗号、引号（项目名、状态名两侧不加引号，后接的链接前用“于”）。
 * 片段多为 this / added 之类的短词，拉取请求时间线另有译法，因此放在 scoped。
 * 整句能对上元素结构的用 inline（删除评论事件），数字被嵌套元素隔开的用 mergeText（加载更多标题）。
 */
export default {
  static: {
    // 只出现在议题中的事件
    'pinned this issue': '置顶了此议题',
    'unpinned this issue': '取消置顶了此议题',
    'transferred this issue from': '将此议题转移自',
    'converted this issue into a discussion': '将此议题转换为讨论',
    'converted this from a draft issue': '将此议题从草稿议题转换而来',
    'created this issue from a note in': '从以下项目的备注创建了此议题',
    'linked a pull request that will close this issue': '链接了一个将关闭此议题的拉取请求',
    'removed a link to a pull request': '删除了一个拉取请求链接',
    'added a commit that references this issue': '添加了一个引用此议题的提交',
    'as a duplicate of this issue': '标记为此议题的重复项',
    'added a sub-issue': '添加了子议题',
    'added sub-issues': '添加了子议题',
    'removed a sub-issue': '删除了子议题',
    'removed sub-issues': '删除了子议题',
    'added a parent issue': '添加了父议题',
    'added parent issues': '添加了父议题',
    'removed a parent issue': '删除了父议题',
    'removed parent issues': '删除了父议题',
    'added a related issue': '添加了相关议题',
    'removed a related issue': '删除了相关议题',
    'changed the issue type from': '将议题类型从',
    'This milestone has been deleted': '此里程碑已删除',
    'Issues mentioned': '提及的议题',
    'This event is from a private repository and is only visible to repository members': '此事件来自专用存储库且仅存储库成员可见',
    'Hide commit message body': '隐藏提交消息正文',
    'Show commit message body': '显示提交消息正文',
    'Load newer activity': '加载较新的活动',
    'Load older activity': '加载较早的活动',
    'Loading remaining timeline items': '正在加载剩余的时间线条目',
    'Loading older timeline items': '正在加载较早的时间线条目',
    'Loading newer timeline items': '正在加载较新的时间线条目',
    'Could not load event': '无法加载事件',
    'Issue duplicate undo failed': '撤销重复标记失败',
    'Timeline cannot be loaded': '无法加载时间线',
    'The timeline is currently unavailable due to a system error. Try reloading the page.':
      '系统错误，时间线暂不可用。请尝试重新加载页面。',
    'Issue timeline is being transferred.': '议题时间线正在转移。'
  },
  scoped: {
    // 关闭 / 重新打开（原因链接：completed / not planned / duplicate）
    'closed this': '关闭了此议题',
    'closed this as': '将此议题关闭为',
    'closed this as a': '将此议题关闭为',
    'closed this in': '关闭了此议题于',
    // React 时间线的 as 单独成段：closed this | as | not planned
    as: '并标记为',
    in: '于',
    of: '于',
    completed: '已完成',
    duplicate: '重复',
    'reopened this': '重新打开了此议题',

    // 标签
    added: '添加了',
    removed: '删除了',
    'and removed': '并删除了',

    // 受理人
    assigned: '分配给了',
    unassigned: '取消分配了',
    'and unassigned': '并取消分配了',
    'self-assigned this': '将此议题分配给了自己',
    'removed their assignment': '取消了自己的分配',

    // 里程碑
    'added this to the': '将此议题添加到',
    'removed this from the': '将此议题移出',
    milestone: '里程碑',
    'modified the milestones:': '修改了里程碑：',
    'modified the milestone:': '修改了里程碑：',

    // 项目
    'added this to': '将此议题添加到',
    'removed this from': '将此议题移出',
    'and removed this from': '并将此议题移出',
    // 后接来源链接
    'deleted this from': '从以下位置删除了此议题',

    // 锁定 / 置顶 / 订阅 / 改标题
    locked: '锁定了对话',
    'and limited conversation to collaborators': '并限制为仅协作者可评论',
    'unlocked this conversation': '解锁了此对话',
    subscribed: '订阅了此议题',
    unsubscribed: '取消订阅了此议题',
    'changed the title': '更改了标题',

    // 提及 / 引用 / 重复
    'mentioned this': '提及了此议题',
    'marked this as a duplicate of': '将此议题标记为重复于',
    'unmarked this as a duplicate of': '取消将此议题标记为重复于',
    marked: '将',
    unmarked: '取消将',

    // 依赖与相关
    'marked this as blocked': '将此议题标记为被阻止',
    'unmarked this as blocked': '取消将此议题标记为被阻止',
    'marked this as blocking': '将此议题标记为阻止',
    'unmarked this as blocking': '取消将此议题标记为阻止',

    // 议题类型：added the [类型] issue type / changed the issue type from [A] to [B]
    'added the': '添加了',
    'removed the': '删除了',
    'issue type': '议题类型',
    to: '改为',

    // 议题字段：set / changed [字段] to [值]，cleared [字段]；汇总为 updated …, and also removed …
    set: '将',
    changed: '将',
    cleared: '清除了',
    updated: '更新了',
    ', and also removed': '，并删除了',
    Rationale: '理由',

    // 置顶评论
    'pinned a': '置顶了一条',
    'unpinned a': '取消置顶了一条',
    ', a': '、一条',
    'and a': '和一条',
    'and unpinned a': '并取消置顶了一条',
    'and pinned a': '并置顶了一条',
    // 同一条评论先后置顶、取消置顶：互逆并列用「和」，同「关注和取消关注」
    'pinned and unpinned a': '置顶和取消置顶了一条',
    'unpinned and pinned a': '取消置顶和重新置顶了一条',
    comment: '评论',
    'a comment': '一条评论',

    // 评论删除、阻止用户（<操作者> deleted a comment from <用户> <时间> 整句见 inline；此为整句未命中时的片段）
    'deleted a comment from': '删除了以下用户的一条评论',
    blocked: '阻止了',
    'temporarily blocked': '暂时阻止了',

    // 时间线结构
    'Repository owner': '存储库所有者',
    Metadata: '元数据',
    'Load all': '全部加载',
    Events: '事件',
    // 加载更多旁的菜单按钮（较早 / 较新的加载方向）
    'Load more actions': '加载选项'
  },
  regexp: [
    // 锁定：locked [as off topic] and limited conversation to collaborators（原文无标点，译文不加）
    [
      /^locked (?:as (off topic|too heated|resolved|spam) )?and limited conversation to collaborators$/,
      (_, reason) => (reason ? `${lockReason(reason)}锁定了对话并限制为仅协作者可评论` : '锁定了对话并限制为仅协作者可评论')
    ],
    [/^as (off topic|too heated|resolved|spam)$/, (_, reason) => lockReason(reason)],
    // 通过项目状态关闭：closed this [as …] by moving to Done in <项目>（项目链接接在“于”后）
    [/^closed this by moving to (.+) in$/, (_, status) => joinName(joinName('通过移至', projectStatus(status)), '关闭了此议题于')],
    [/^by moving to (.+) in$/, (_, status) => joinName(joinName('通过移至', projectStatus(status)), '于')],
    // 项目状态变更：moved this from Todo to Done in <项目>
    [
      /^moved this from (.+?) to (.+) in$/,
      (_, from, to) => joinName(joinName(joinName(joinName('将此议题从', projectStatus(from)), '移至'), projectStatus(to)), '于')
    ],
    [/^moved this to (.+) in$/, (_, status) => joinName(joinName('将此议题移至', projectStatus(status)), '于')],
    // 交叉引用
    [/^mentioned this in (\d+) issues$/, '在 $1 个议题中提及了此议题'],
    [/^mentioned this in (\d+) pull requests$/, '在 $1 个拉取请求中提及了此议题'],
    [/^added (\d+) commits that reference this issue$/, '添加了 $1 个引用此议题的提交'],
    [/^Private repository: ([\w.-]+\/[\w.-]+)$/, '专用存储库：$1'],
    [/^Only people who can see ([\w.-]+\/[\w.-]+) will see this reference\.$/, '只有能查看 $1 的用户才能看到此引用。'],
    [
      /^This (issue|pull request) will close once commit ([0-9a-f]{7,40}) is merged into the '(.+)' branch\.$/,
      (_, subject, sha, branch) => `提交 ${sha} 合并到“${branch}”分支后此${subject === 'issue' ? '议题' : '拉取请求'}将关闭。`
    ],
    [/^Undo marking issue as duplicate of issue #(\d+)$/, '撤销将此议题标记为议题 #$1 的重复项'],
    [/^Discussion #(\d+)$/, '讨论 #$1'],
    // 依赖与相关（多个）
    [/^marked this as blocked by (\d+) issues$/, '将此议题标记为被 $1 个议题阻止'],
    [/^unmarked this as blocked by (\d+) issues$/, '取消将此议题标记为被 $1 个议题阻止'],
    [/^marked this as blocking (\d+) issues$/, '将此议题标记为阻止 $1 个议题'],
    [/^unmarked this as blocking (\d+) issues$/, '取消将此议题标记为阻止 $1 个议题'],
    [/^added (\d+) related issues$/, '添加了 $1 个相关议题'],
    [/^removed (\d+) related issues$/, '删除了 $1 个相关议题'],
    // 加载更多
    [/^Load (\d+) more$/, '再加载 $1 条'],
    [/^(\d+) new items? loaded\.$/, '已加载 $1 条新内容。'],
    // 加载更多标题（mergeText 整段合并）：<h3><span>12</span><span> remaining <span>items</span></span></h3>
    [/^(\d[\d,]*) remaining items?$/, '还有 $1 项']
  ],
  inline: [
    // 删除评论事件：<操作者> deleted a comment from <用户链接> [<时间链接>]。
    // 宿主 div[class*="timelineBodyContent__"] 的直接子节点依次是操作者容器、文字、被删评论作者的链接、时间链接；
    // 时间链接随布局可有可无，由 $1 原样带回。不命中时按 scoped 片段“删除了以下用户的一条评论”逐段翻译
    [/^\{\}deleted a comment from \{\}((?:\{\})*)$/, '{} 删除了 {} 的一条评论 $1'],
    // 时间线错误占位（Blankslate.Description 的 <p>）：说明文字 + <a>Contact support</a> + 句尾；语序调整后链接在句末
    // （句式与 metadata.ts、milestones.ts 的“仍然出错时请联系支持”一致）。
    // 不命中时按 static 说明与 viewer.ts 的片段“（如果仍然出错）。”逐段翻译
    [
      'The timeline is currently unavailable due to a system error. Try reloading the page. {} if the problem persists.',
      '系统错误，时间线暂不可用。请尝试重新加载页面。仍然出错时请{}。'
    ]
  ],
  mergeText: [
    // 时间线“加载更多”的标题：计数与 remaining / items 分在嵌套 span 中（LoadMore.module.css 的 remainingItemsHeading）
    'h3[class*="remainingItemsHeading__"]'
  ]
} satisfies PageDictionary
