import type { PageDictionary } from '../../../core/types'
import { joinName } from './list'

/** 锁定原因（时间线小写形式） */
const LOCK_REASON: Readonly<Record<string, string>> = {
  'off topic': '離題',
  'too heated': '過於激烈',
  resolved: '已解決',
  spam: '垃圾內容'
}

/** 项目状态名：无状态时 GitHub 显示 No status */
function projectStatus(status: string): string {
  return status === 'No status' ? '無狀態' : status
}

/** 以 X 為由（锁定原因是界面文字，原文无引号，译文不加） */
function lockReason(reason: string): string {
  return `以${LOCK_REASON[reason] ?? reason}為由`
}

/**
 * 议题时间线：事件句子与片段、加载更多、引用与专用存储库提示、错误。
 * 事件由“操作者 + 文本片段 + 链接 / 令牌”交替组成，片段按出现位置分别收录，译文需能顺序拼读；
 * 原文无标点的片段，译文不加逗号、引号（项目名、状态名两侧不加引号，后接的链接前用「於」）。
 * 片段多为 this / added 之类的短词，拉取请求时间线另有译法，因此放在 scoped。
 * 整句能对上元素结构的用 inline（删除评论事件），数字被嵌套元素隔开的用 mergeText（加载更多标题）。
 */
export default {
  static: {
    // 只出现在议题中的事件
    'pinned this issue': '釘選了此議題',
    'unpinned this issue': '取消釘選了此議題',
    'transferred this issue from': '將此議題轉移自',
    'converted this issue into a discussion': '將此議題轉換為討論',
    'converted this from a draft issue': '將草稿議題轉換為此議題',
    'created this issue from a note in': '從以下專案的備註建立了此議題',
    'linked a pull request that will close this issue': '連結了將關閉此議題的拉取請求',
    'removed a link to a pull request': '移除了拉取請求的連結',
    'added a commit that references this issue': '新增了參考此議題的提交',
    'as a duplicate of this issue': '標示為此議題的重複項目',
    'added a sub-issue': '新增了子議題',
    'added sub-issues': '新增了子議題',
    'removed a sub-issue': '移除了子議題',
    'removed sub-issues': '移除了子議題',
    'added a parent issue': '新增了父議題',
    'added parent issues': '新增了父議題',
    'removed a parent issue': '移除了父議題',
    'removed parent issues': '移除了父議題',
    'added a related issue': '新增了相關議題',
    'removed a related issue': '移除了相關議題',
    'changed the issue type from': '將議題類型從',
    'This milestone has been deleted': '此里程碑已刪除',
    'Issues mentioned': '提及的議題',
    'This event is from a private repository and is only visible to repository members': '此事件來自私人儲存庫且僅儲存庫成員可見',
    'Hide commit message body': '隱藏提交訊息內文',
    'Show commit message body': '顯示提交訊息內文',
    'Load newer activity': '載入較新的活動',
    'Load older activity': '載入較舊的活動',
    'Loading remaining timeline items': '正在載入剩餘的時間軸項目',
    'Loading older timeline items': '正在載入較舊的時間軸項目',
    'Loading newer timeline items': '正在載入較新的時間軸項目',
    'Could not load event': '無法載入事件',
    'Issue duplicate undo failed': '無法復原重複標示',
    'Timeline cannot be loaded': '無法載入時間軸',
    'The timeline is currently unavailable due to a system error. Try reloading the page.':
      '時間軸因系統錯誤而暫時無法使用。請嘗試重新載入頁面。',
    'Issue timeline is being transferred.': '正在轉移議題時間軸。'
  },
  scoped: {
    // 关闭 / 重新打开（原因链接：completed / not planned / duplicate）
    'closed this': '關閉了此議題',
    'closed this as': '關閉了此議題並標示為',
    'closed this as a': '關閉了此議題並標示為',
    'closed this in': '關閉了此議題於',
    // React 时间线的 as 单独成段：closed this | as | not planned
    as: '並標示為',
    in: '於',
    of: '於',
    completed: '完成',
    duplicate: '重複',
    'reopened this': '重新開啟了此議題',

    // 标签
    added: '新增了',
    removed: '移除了',
    'and removed': '並移除了',

    // 受理人
    assigned: '將此議題指派給',
    unassigned: '取消指派了',
    'and unassigned': '並取消指派了',
    'self-assigned this': '將此議題指派給自己',
    'removed their assignment': '取消了自己的指派',

    // 里程碑
    'added this to the': '將此議題加入',
    'removed this from the': '將此議題移出',
    milestone: '里程碑',
    'modified the milestones:': '修改了里程碑：',
    'modified the milestone:': '修改了里程碑：',

    // 项目
    'added this to': '將此議題加入',
    'removed this from': '將此議題移出',
    'and removed this from': '並將此議題移出',
    // 后接来源链接
    'deleted this from': '從以下位置刪除了此議題',

    // 锁定 / 固定 / 订阅 / 改标题
    locked: '鎖定了對話',
    'and limited conversation to collaborators': '並限制為僅協作者可留言',
    'unlocked this conversation': '解除鎖定了此對話',
    subscribed: '訂閱了此議題',
    unsubscribed: '取消訂閱了此議題',
    'changed the title': '變更了標題',

    // 提及 / 引用 / 重复
    'mentioned this': '提及了此議題',
    'marked this as a duplicate of': '將此議題標示為重複於',
    'unmarked this as a duplicate of': '取消將此議題標示為重複於',
    marked: '將',
    unmarked: '取消將',

    // 依赖与相关
    'marked this as blocked': '將此議題標示為受阻擋',
    'unmarked this as blocked': '取消將此議題標示為受阻擋',
    'marked this as blocking': '將此議題標示為阻擋',
    'unmarked this as blocking': '取消將此議題標示為阻擋',

    // 议题类型：added the [类型] issue type / changed the issue type from [A] to [B]
    'added the': '新增了',
    'removed the': '移除了',
    'issue type': '議題類型',
    to: '改為',

    // 议题字段：set / changed [字段] to [值]，cleared [字段]；汇总为 updated …, and also removed …
    set: '將',
    changed: '將',
    cleared: '清除了',
    updated: '更新了',
    ', and also removed': '，並移除了',
    Rationale: '理由',

    // 固定评论
    'pinned a': '釘選了一則',
    'unpinned a': '取消釘選了一則',
    ', a': '、一則',
    'and a': '和一則',
    'and unpinned a': '並取消釘選了一則',
    'and pinned a': '並釘選了一則',
    // 同一条评论先后钉选、取消钉选：互逆并列用「和」，同「追蹤和取消追蹤」
    'pinned and unpinned a': '釘選和取消釘選了一則',
    'unpinned and pinned a': '取消釘選和重新釘選了一則',
    comment: '留言',
    'a comment': '一則留言',

    // 评论删除、阻止用户（<操作者> deleted a comment from <用户> <时间> 整句见 inline；此为整句未命中时的片段）
    'deleted a comment from': '刪除了以下使用者的一則留言',
    blocked: '封鎖了',
    'temporarily blocked': '暫時封鎖了',

    // 时间线结构
    'Repository owner': '儲存庫擁有者',
    Metadata: '中繼資料',
    'Load all': '全部載入',
    Events: '事件',
    // 加载更多旁的菜单按钮（较早 / 较新的加载方向）
    'Load more actions': '載入選項'
  },
  regexp: [
    // 锁定：locked [as off topic] and limited conversation to collaborators（原文无标点，译文不加）
    [
      /^locked (?:as (off topic|too heated|resolved|spam) )?and limited conversation to collaborators$/,
      (_, reason) => (reason ? `${lockReason(reason)}鎖定了對話並限制為僅協作者可留言` : '鎖定了對話並限制為僅協作者可留言')
    ],
    [/^as (off topic|too heated|resolved|spam)$/, (_, reason) => lockReason(reason)],
    // 通过项目状态关闭：closed this [as …] by moving to Done in <项目>（项目链接接在「於」后）
    [/^closed this by moving to (.+) in$/, (_, status) => joinName(joinName('透過移至', projectStatus(status)), '關閉了此議題於')],
    [/^by moving to (.+) in$/, (_, status) => joinName(joinName('透過移至', projectStatus(status)), '於')],
    // 项目状态变更：moved this from Todo to Done in <项目>
    [
      /^moved this from (.+?) to (.+) in$/,
      (_, from, to) => joinName(joinName(joinName(joinName('將此議題從', projectStatus(from)), '移至'), projectStatus(to)), '於')
    ],
    [/^moved this to (.+) in$/, (_, status) => joinName(joinName('將此議題移至', projectStatus(status)), '於')],
    // 交叉引用
    [/^mentioned this in (\d+) issues$/, '在 $1 個議題中提及了此議題'],
    [/^mentioned this in (\d+) pull requests$/, '在 $1 個拉取請求中提及了此議題'],
    [/^added (\d+) commits that reference this issue$/, '新增了 $1 個參考此議題的提交'],
    [/^Private repository: ([\w.-]+\/[\w.-]+)$/, '私人儲存庫：$1'],
    [/^Only people who can see ([\w.-]+\/[\w.-]+) will see this reference\.$/, '只有能查看 $1 的人才會看到此參考。'],
    [
      /^This (issue|pull request) will close once commit ([0-9a-f]{7,40}) is merged into the '(.+)' branch\.$/,
      (_, subject, sha, branch) => `提交 ${sha} 合併到「${branch}」分支後此${subject === 'issue' ? '議題' : '拉取請求'}將會關閉。`
    ],
    [/^Undo marking issue as duplicate of issue #(\d+)$/, '復原將此議題標示為議題 #$1 的重複項目'],
    [/^Discussion #(\d+)$/, '討論 #$1'],
    // 依赖与相关（多个）
    [/^marked this as blocked by (\d+) issues$/, '將此議題標示為受阻於 $1 個議題'],
    [/^unmarked this as blocked by (\d+) issues$/, '取消將此議題標示為受阻於 $1 個議題'],
    [/^marked this as blocking (\d+) issues$/, '將此議題標示為阻擋 $1 個議題'],
    [/^unmarked this as blocking (\d+) issues$/, '取消將此議題標示為阻擋 $1 個議題'],
    [/^added (\d+) related issues$/, '新增了 $1 個相關議題'],
    [/^removed (\d+) related issues$/, '移除了 $1 個相關議題'],
    // 加载更多
    [/^Load (\d+) more$/, '再載入 $1 個'],
    [/^(\d+) new items? loaded\.$/, '已載入 $1 個新項目。'],
    // 加载更多标题（mergeText 整段合并）：<h3><span>12</span><span> remaining <span>items</span></span></h3>
    [/^(\d[\d,]*) remaining items?$/, '還有 $1 個項目']
  ],
  inline: [
    // 删除评论事件：<操作者> deleted a comment from <用户链接> [<时间链接>]。
    // 宿主 div[class*="timelineBodyContent__"] 的直接子节点依次是操作者容器、文字、被删评论作者的链接、时间链接；
    // 时间链接随布局可有可无，由 $1 原样带回。不命中时按 scoped 片段「刪除了以下使用者的一則留言」逐段翻译
    [/^\{\}deleted a comment from \{\}((?:\{\})*)$/, '{} 刪除了 {} 的一則留言 $1'],
    // 时间线错误占位（Blankslate.Description 的 <p>）：说明文字 + <a>Contact support</a> + 句尾；语序调整后链接在句末
    // （句式与 metadata.ts、milestones.ts 的「若問題持續發生，請聯絡支援團隊」一致）。
    // 不命中时按 static 说明与 viewer.ts 的片段「（若問題持續發生）。」逐段翻译
    [
      'The timeline is currently unavailable due to a system error. Try reloading the page. {} if the problem persists.',
      '時間軸因系統錯誤而暫時無法使用。請嘗試重新載入頁面。若問題持續發生，請{}。'
    ]
  ],
  mergeText: [
    // 时间线“加载更多”的标题：计数与 remaining / items 分在嵌套 span 中（LoadMore.module.css 的 remainingItemsHeading）
    'h3[class*="remainingItemsHeading__"]'
  ]
} satisfies PageDictionary
