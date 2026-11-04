import type { PageDictionary } from '../../../core/types'
import { joinCjk } from '../helpers'

/** 审查强度名称（Copilot 程式碼審查；与 sidebar.ts 同译） */
const EFFORT: Readonly<Record<string, string>> = {
  lite: '輕量',
  light: '輕量',
  balanced: '平衡',
  thorough: '深入',
  deep: '深入',
  max: '最高',
  auto: '自動'
}

const EFFORT_SOURCE = Object.keys(EFFORT).join('|')

function effortName(effort: string): string {
  return EFFORT[effort.toLowerCase()] ?? effort
}

/** 自动合并方式 */
const AUTO_MERGE_METHOD: Readonly<Record<string, string>> = {
  merge: '合併',
  squash: '壓縮',
  rebase: '重定基底'
}

/** 从合并队列中移除的原因（前一组跟在 due to 后，后一组跟在 because 后） */
const DEQUEUE_REASON: Readonly<Record<string, string>> = {
  'an unknown reason': '未知原因',
  'it being already merged': '已合併',
  'no response for status checks': '狀態檢查無回應',
  'failed status checks': '狀態檢查失敗',
  'a conflict with the base branch': '與基底分支衝突',
  'the pull request being merged': '拉取請求已合併',
  'a manual request': '手動請求',
  'an unknown Git error': '未知的 Git 錯誤',
  'the queue being cleared': '佇列已清除',
  'a roll back': '復原',
  'invalid changes in the merge commit': '合併提交中有無效的變更',
  'Branch Protection failures': '未通過分支保護',
  'a pull request earlier in the stack was removed': '堆疊中較早的拉取請求已移除',
  'a pull request earlier in the stack was unmerged and was not in the queue': '堆疊中較早的拉取請求未合併且不在佇列中',
  'the pull requests in the stack were not ordered correctly in the queue': '堆疊中的拉取請求在佇列中的順序不正確'
}

const DEQUEUE_REASON_SOURCE = Object.keys(DEQUEUE_REASON)
  .map(reason => reason.replace(/[()[\]{}*+?.\\^$|]/g, '\\$&'))
  .join('|')

function dequeueReason(reason: string): string {
  return DEQUEUE_REASON[reason] ?? reason
}

/** 锁定原因（时间线小写形式，与议题时间线同译） */
const LOCK_REASON: Readonly<Record<string, string>> = {
  'off topic': '離題',
  'off-topic': '離題',
  'too heated': '過於激烈',
  resolved: '已解決',
  spam: '垃圾內容'
}

const LOCK_REASON_SOURCE = Object.keys(LOCK_REASON).join('|')

/** 专案状态名：无状态时 GitHub 显示 No status */
function projectStatus(status: string): string {
  return status === 'No status' ? '無狀態' : status
}

/**
 * 移动专案卡片：moved this from Todo to Done in <专案> → 將此拉取請求從 Todo 移至 Done 於 <专案>（与议题时间线同一写法）。
 * 原文无标点：状态名（用户内容）不加引号，后接的专案链接前用「於」；英文状态名两侧补空格
 */
function movedText(from: string | undefined, to: string): string {
  const parts = from === undefined ? ['移至', projectStatus(to)] : ['從', projectStatus(from), '移至', projectStatus(to)]
  return ['將此拉取請求', ...parts, '於'].reduce(joinCjk)
}

/** 排序依据 */
const SORT_ORDER: Readonly<Record<string, string>> = { Oldest: '最舊', Newest: '最新' }
const SORT_SUBJECT: Readonly<Record<string, string>> = { comments: '留言', activity: '活動' }

/**
 * 拉取请求时间线：经典与 React 时间线的事件句子与片段、活动面板（时间线面板）、Copilot 事件、隐藏留言。
 * 事件由“操作者 + 文本片段 + 链接 / 令牌”交替组成，片段按出现位置分别收录，译文需能顺序拼读。
 * 独立的 to 译为「至」，与差异视图行范围（commits 词典）一致：從 <A> 至 <B>。
 * 审查的 dismiss 作「駁回」（警示的 dismiss 作「解除」，见 review.ts）。
 * 审查提交、审查讨论串与建议见 review.ts。
 */
export default {
  static: {
    // 只出现在拉取请求中的事件
    'linked an issue that may be closed by this pull request': '連結了可能由此拉取請求關閉的議題',
    'removed a link to an issue': '移除了議題的連結',
    'added a commit that referenced this pull request': '新增了參考此拉取請求的提交',
    'pushed a commit that referenced this pull request': '推送了參考此拉取請求的提交',
    'review requested due to automatic review settings': '因自動審查設定而請求了審查',
    'Head branch was pushed to by a user without write access': '沒有寫入權限的使用者推送了來源分支',
    // 经典时间线隐去操作者的事件（作者处为文字 Repository owner；带锁定原因的见 scoped 与 inline）
    'Repository owner locked and limited conversation to collaborators': '儲存庫擁有者鎖定了對話並限制為僅協作者可留言',
    'Repository owner deleted a comment': '儲存庫擁有者刪除了一則留言',
    'Repository owner deleted a comment from': '儲存庫擁有者刪除了以下使用者的一則留言'
  },
  scoped: {
    // 审查（时间线头部）
    'approved these changes': '核准了這些變更',
    'requested changes': '要求了變更',
    'suggested changes': '建議了變更',
    'left review comments': '發表了審查留言',
    'left a comment': '發表了留言',
    reviewed: '審查於',
    'started a review': '開始了審查',
    'reviewed these changes': '審查了這些變更',
    'found potential problems': '發現了潛在問題',
    'previously approved these changes': '先前核准了這些變更',
    'previously requested changes': '先前要求了變更',
    // previously 单独成段时：<用户> <previously> approved these changes；先前审查条目旁的按钮
    previously: '先前',
    'See review': '查看審查',
    // 已驳回审查的状态标签（留言列表审查头部，后接时间）；不收录时 previously commented 会被 mergebox.ts 的审查者正则当作用户名
    'previously approved': '先前核准於',
    'previously recommended approval': '先前建議核准於',
    'previously suggested changes': '先前建議變更於',
    'previously commented': '先前留言於',
    'previously reviewed': '先前審查於',
    // 当前审查的状态标签（同一位置，后接时间；commented 由 common-ui 译「留言於」，与 actions 词典的 approved 同译）
    approved: '核准於',
    'recommended approval': '建議核准於',
    'changes requested': '要求變更於',
    // 驳回审查：dismissed <user>’s stale review via <sha>；活动面板：dismissed <user>'s review / a review via <sha>
    // 原文无逗号，via 前不加标点：駁回了 octocat 的過時審查因提交 0ff253b
    'dismissed this review': '駁回了此審查',
    dismissed: '駁回了',
    '’s stale review via': '的過時審查因提交',
    "'s stale review via": '的過時審查因提交',
    '’s stale review': '的過時審查',
    "'s stale review": '的過時審查',
    '’s review via': '的審查因提交',
    "'s review via": '的審查因提交',
    '’s review': '的審查',
    "'s review": '的審查',
    // stale review 是链接时 ’s 单独成段：dismissed <user>’s <stale review> via <sha>
    '’s': '的',
    'stale review': '過時審查',
    'a review': '一項審查',
    via: '因提交',
    // 没有审查者链接时：dismissed a stale review via <sha>
    'dismissed a stale review via': '駁回了一項過時審查因提交',
    'View reviewed changes': '查看已審查的變更',

    // 请求审查：requested review from <user> and a balanced review from <Copilot>
    'requested a review from': '請求審查者',
    'requested review from': '請求審查者',
    'requested a review': '請求了審查',
    'self-requested a review': '自行請求了審查',
    'removed the review request': '移除了審查請求',
    'removed the review request for': '移除了審查者',
    'removed the request for review from': '移除了審查者',
    'a team': '一個團隊',
    'as a': '作為',
    'code owner': '程式碼擁有者',
    'on behalf of': '代表',

    // Copilot 事件：Copilot started reviewing on behalf of <user>
    'started reviewing': '開始審查',
    'finished reviewing': '完成了審查',
    'started work': '開始工作',
    'finished work': '完成了工作',
    'stopped work': '停止了工作',
    // 动词无工作阶段链接时与 on behalf of 合成一段（整句见下方 inline，此为整句未命中时的片段；「以下使用者」指后接的用户名）
    'finished reviewing on behalf of': '代表以下使用者完成了審查',
    'finished work on behalf of': '代表以下使用者完成了工作',
    'stopped work on behalf of': '代表以下使用者停止了工作',
    'due to an error': '因發生錯誤',
    'View session': '查看工作階段',
    'Copilot PR reviewer': 'Copilot PR 審查者',
    'created this pull request from a session': '從工作階段建立了此拉取請求',
    // 工作阶段状态后接时长：completed after <时长>
    'completed after': '完成耗時',
    'failed after': '失敗前已執行',

    // 推送：force-pushed the <branch> branch from <sha> to <sha>；活动面板：force-pushed <this branch> from <sha> to <sha>
    'force-pushed': '強制推送了',
    'force-pushed the': '強制推送了分支',
    // 经典时间线：force-pushed 是比较链接，the 是链接后的独立文本：<force-pushed> the <branch> branch from …
    the: '分支',
    'this branch': '此分支',
    'branch from': '從',
    to: '至',

    // 分支：merged commit <sha> into <branch>、deleted the <branch> branch；活动面板：merged commit <sha>
    'merged commit': '合併了提交',
    commit: '提交',
    into: '到',
    'deleted the': '刪除了',
    // 不带分支名时的整段
    'deleted the branch': '刪除了分支',
    'restored the': '還原了',
    branch: '分支',
    'changed the base branch from': '變更了基底分支從',
    'changed the title': '變更了標題',
    'changed the title from': '變更了標題從',

    // 标签：added the <label> label、added <a> <b> and removed <c> labels
    added: '新增了',
    removed: '移除了',
    'and removed': '並移除了',
    'added the': '新增了',
    'removed the': '移除了',
    label: '標籤',
    labels: '標籤',
    'added a label': '新增了標籤',
    'removed a label': '移除了標籤',

    // 负责人
    assigned: '將此拉取請求指派給',
    unassigned: '取消指派了',
    'and unassigned': '並取消指派了',
    'self-assigned this': '將此拉取請求指派給自己',
    'removed their assignment': '取消了自己的指派',

    // 里程碑与专案
    'added this to the': '將此拉取請求加入',
    'removed this from the': '將此拉取請求移出',
    milestone: '里程碑',
    'modified the milestones:': '修改了里程碑：',
    'modified the milestone:': '修改了里程碑：',
    'added this to': '將此拉取請求加入',
    'removed this from': '將此拉取請求移出',
    'and removed this from': '並將此拉取請求移出',

    // 状态
    'closed this': '關閉了此拉取請求',
    'reopened this': '重新開啟了此拉取請求',
    'closed this PR': '關閉了此 PR',
    'reopened this PR': '重新開啟了此 PR',
    'closed this in': '透過以下提交關閉了此拉取請求',
    'closed this as not planned': '關閉了此拉取請求並標示為不予處理',
    // 来源存储库（分叉）被删除时
    'closed this by deleting the head repository': '透過刪除來源儲存庫關閉了此拉取請求',
    'marked this pull request as draft': '將此拉取請求標示為草稿',
    'marked this pull request as ready for review': '將此拉取請求標示為可供審查',
    'converted this to draft': '將此拉取請求轉換為草稿',
    'converted this pull request to draft': '將此拉取請求轉換為草稿',
    'locked this conversation': '鎖定了此對話',
    'unlocked this conversation': '解除鎖定了此對話',
    locked: '鎖定了對話',
    'and limited conversation to collaborators': '並限制為僅協作者可留言',
    // 经典时间线：locked as <strong>原因</strong> and limited conversation to collaborators（整句见下方 inline；
    // 不命中时按片段拼读：將對話鎖定為 離題 並限制為僅協作者可留言）
    'locked as': '將對話鎖定為',
    'Repository owner locked as': '儲存庫擁有者將對話鎖定為',
    ...LOCK_REASON,

    // 提及与参考：referenced this from <repo> in <commit>；referenced this pull request in a commit
    'mentioned this pull request': '提及了此拉取請求',
    'mentioned this': '提及了此拉取請求',
    'mentioned this in': '在以下位置提及了此拉取請求',
    'mentioned this pull request in': '在以下位置提及了此拉取請求',
    'referenced this pull request': '參考了此拉取請求',
    'referenced this pull request from a commit': '從提交中參考了此拉取請求',
    'referenced this': '參考了此拉取請求',
    'referenced this pull request in a commit': '在一個提交中參考了此拉取請求',
    'pull request in a commit': '於一個提交中',
    in: '於提交',
    'This was referenced': '被參考於',
    'started a Copilot session': '開始了 Copilot 工作階段',

    // 自动合并、合并队列与堆叠
    'enabled auto-merge': '啟用了自動合併',
    'disabled auto-merge': '停用了自動合併',
    'auto-merge was automatically disabled': '自動合併已自動停用',
    'Auto-merge was automatically disabled': '自動合併已自動停用',
    'Pull request was closed': '拉取請求已關閉',
    'enabled stacked auto-merge': '啟用了堆疊式自動合併',
    'disabled stacked auto-merge': '停用了堆疊式自動合併',
    'enabled stacked auto-merge (squash)': '啟用了堆疊式自動合併（壓縮）',
    'enabled stacked auto-merge (rebase)': '啟用了堆疊式自動合併（重定基底）',
    'enabled stacked auto-merge (merge)': '啟用了堆疊式自動合併（合併）',
    'added this pull request to the': '將此拉取請求加入',
    'removed this pull request from the': '將此拉取請求移出',
    'added this pull request to': '將此拉取請求加入',
    'removed this pull request from': '將此拉取請求移出',
    'added this pull request to a stack': '將此拉取請求加入堆疊',
    'removed this pull request from a stack': '將此拉取請求移出堆疊',
    'Merged via the queue into': '已透過佇列合併到',
    'with commit': '提交為',
    'added to the merge queue': '已加入合併佇列',
    // 移出合并队列：removed this pull request from the <merge queue> due to <原因>（原因在按钮里时单独成段）
    'due to': '原因是',
    because: '原因是',
    ...DEQUEUE_REASON,

    // 活动面板未单独映射的事件（GitHub 以事件类型名代替）
    'head ref deleted': '刪除了來源分支',
    'head ref restored': '還原了來源分支',
    'base ref changed': '變更了基底分支',
    'auto merge enabled': '啟用了自動合併',
    'auto merge disabled': '停用了自動合併',
    'auto squash enabled': '啟用了自動壓縮合併',
    'auto rebase enabled': '啟用了自動重定基底合併',
    milestoned: '新增了里程碑',
    demilestoned: '移除了里程碑',
    connected: '連結了議題',
    disconnected: '取消連結了議題',
    'comment deleted': '刪除了留言',
    'automatic base change succeeded': '自動變更基底分支成功',
    'automatic base change failed': '自動變更基底分支失敗',

    // 部署：deployed to <environment>（Active 与 actions 词典的部署状态同译）
    'deployed to': '部署到',
    'temporarily deployed to': '暫時部署到',
    'had a problem deploying to': '部署到以下環境時發生問題',
    Active: '作用中',

    // 隐藏留言
    'There was a problem hiding this comment.': '隱藏此留言時發生問題。',
    'Learn more about hiding disruptive comments': '瞭解隱藏干擾性留言',
    'Low Quality': '低品質',
    comment: '留言',
    'This comment has been minimized.': '此留言已最小化。',
    'This comment was marked as spam.': '此留言已標示為垃圾內容。',
    'This comment was marked as abuse.': '此留言已標示為濫用。',
    'This comment was marked as off-topic.': '此留言已標示為離題。',
    'This comment was marked as outdated.': '此留言已標示為過時。',
    'This comment was marked as duplicate.': '此留言已標示為重複。',
    'This comment was marked as resolved.': '此留言已標示為已解決。',
    'This comment was marked as low quality.': '此留言已標示為低品質。',

    // 活动面板筛选器
    'Since this pull request was created': '自此拉取請求建立以來',
    'Since your last review': '自你上次審查以來',
    'Since you last interacted': '自你上次互動以來',
    'Since marked ready for review': '自標示為可供審查以來',
    // 活动行
    'New changes since last review': '上次審查後的新變更',
    // 经典对话页时间线的分隔标记
    'New changes since you last viewed': '你上次查看後的新變更',
    'started a review thread': '開始了審查討論串',
    'performed an action': '執行了動作',
    // 时间线面板
    'Any time': '任何時間',
    'Activity type': '活動類型',
    'Actor login or ID': '執行者的使用者名稱或 ID',
    Actor: '執行者',
    Since: '起始時間',
    'No activity': '沒有活動',
    'Activity on this pull request will appear here.': '此拉取請求的活動會顯示在這裡。',
    'No loaded activity matches the query. Change the query or retry loading activity.':
      '已載入的活動中沒有相符的結果。請變更查詢或重新嘗試載入活動。',
    'No loaded activity matches the query. Change or clear the query.': '已載入的活動中沒有相符的結果。請變更或清除查詢。',
    'Loading more activity': '正在載入更多活動',
    'Unable to load more activity. Try again.': '無法載入更多活動。請再試一次。',
    'Retry loading activity': '重新嘗試載入活動',
    'Fix the filter query to show activity.': '請修正篩選查詢以顯示活動。',
    'Unable to load activity.': '無法載入活動。',
    'Unable to load activity': '無法載入活動',
    'No actors in loaded activity': '已載入的活動中沒有執行者',
    'Actors unavailable': '無法取得執行者',
    'Loading actors': '正在載入執行者',
    'Timeline events': '時間軸事件',
    'Unknown time': '未知時間',
    'Activity time': '活動時間',
    'Search loaded activity by username, commit summary, or commit SHA. All words must match; use quotes for a phrase. Combine text with type:, actor: (login or ID), and since: (available preset or ISO timestamp). Use commas for multiple types or actors.':
      '依使用者名稱、提交摘要或提交 SHA 搜尋已載入的活動。所有字詞都必須相符；片語請加上引號。文字可搭配 type:、actor:（使用者名稱或 ID）和 since:（可用的預設集或 ISO 時間戳記）使用。多個類型或執行者請以逗號分隔。',
    'Use type:, actor:, or since: qualifiers. Quote literal text containing colons or leading hyphens.':
      '請使用 type:、actor: 或 since: 限定詞。包含冒號或以連字號開頭的字面文字請加上引號。',
    'Parentheses, AND, and OR are not supported. Use plain text, quoted phrases, or type:, actor:, and since:.':
      '不支援括號、AND 和 OR。請使用純文字、加上引號的片語，或 type:、actor: 和 since:。',
    'Only inclusive qualifiers are supported. Remove exclusions, comparisons, or ranges.':
      '僅支援包含型限定詞。請移除排除、比較或範圍條件。',
    'Unknown activity type. Choose a type from the suggestions.': '未知的活動類型。請從建議中選擇類型。',
    'Use an actor login or ID, not a comparison or range.': '請使用執行者的使用者名稱或 ID，而非比較或範圍。',
    'Commented reviews': '含留言的審查',
    'Conversation comments': '對話留言',
    'State changes': '狀態變更',
    'Description edits': '描述編輯',
    'Base changes and force pushes': '基底分支變更和強制推送',
    Approvals: '核准',
    // 产品名按 product-names.md 译出
    'copilot code review': 'Copilot 程式碼審查',
    // 留言时间线
    'View all activity': '查看所有活動',
    'Comment unavailable': '無法顯示留言',

    // 未登录时对话底部的注册提示
    'Have a question about this project?': '對此專案有疑問嗎？',
    'Sign up for a free GitHub account to open an issue and contact its maintainers and the community.':
      '註冊免費的 GitHub 帳號以建立議題並聯絡其維護者和社群。',
    'By clicking “Sign up for GitHub”, you agree to our': '按一下「註冊 GitHub」即表示你同意我們的',
    'By clicking "Sign up for GitHub", you agree to our': '按一下「註冊 GitHub」即表示你同意我們的',
    'terms of service': '服務條款',
    // 弯撇号版由 common/pages.ts 的全局词条翻译，直撇号版与之同译
    ". We'll occasionally send you account related emails.": '。我們會不定期傳送與帳號相關的電子郵件給你。',
    'Already on GitHub?': '已有 GitHub 帳號？',
    'to your account': '你的帳號'
  },
  regexp: [
    // 审查强度：requested a lite review from / and a balanced review from
    [new RegExp(`^requested an? (${EFFORT_SOURCE}) review from$`, 'i'), (_, effort) => `請求${effortName(effort)}強度審查者`],
    [new RegExp(`^and an? (${EFFORT_SOURCE}) review from$`, 'i'), (_, effort) => `和${effortName(effort)}強度審查者`],
    // 新增了 N 個提交
    [/^added (\d+) commits?$/, '新增了 $1 個提交'],
    [/^and others added (\d+) commits?$/, '等人新增了 $1 個提交'],
    // 自动合并
    [/^enabled auto-merge \((merge|squash|rebase)\)$/, (_, method) => `啟用了自動合併（${AUTO_MERGE_METHOD[method] ?? method}）`],
    [
      /^enabled auto-merge for pull request #(\d+) \((merge|squash|rebase)\)$/,
      (_, num, method) => `為拉取請求 #${num} 啟用了自動合併（${AUTO_MERGE_METHOD[method] ?? method}）`
    ],
    // 合并队列：removed this pull request from the merge queue due to failed status checks（原文无标点，改语序代替逗号、冒号）
    [
      new RegExp(`^removed from the queue (?:due to|because) (${DEQUEUE_REASON_SOURCE})$`),
      (_, reason) => `因${dequeueReason(reason)}而從佇列中移除`
    ],
    [
      new RegExp(`^removed this pull request from the merge queue (?:due to|because) (${DEQUEUE_REASON_SOURCE})$`),
      (_, reason) => `因${dequeueReason(reason)}而將此拉取請求移出合併佇列`
    ],
    // 活动面板：<merge queue> 链接之后的原因（与前面的 due to 拼成一段；整句见下方 inline）
    [new RegExp(`^(?:due to|because) (${DEQUEUE_REASON_SOURCE})$`), (_, reason) => `原因是${dequeueReason(reason)}`],
    // 堆叠
    [/^added this pull request to stack #(\d+)$/, '將此拉取請求加入堆疊 #$1'],
    [/^removed this pull request from stack #(\d+)$/, '將此拉取請求移出堆疊 #$1'],
    // 专案状态：moved this to Done in <专案>
    [/^moved this from (.+?) to (.+) in$/, (_, from, to) => movedText(from, to)],
    [/^moved this to (.+) in$/, (_, status) => movedText(undefined, status)],
    // 交叉引用
    [
      /^mentioned this in (\d+) (issues|pull requests)$/,
      (_, count, kind) => `在 ${count} 個${kind === 'issues' ? '議題' : '拉取請求'}中提及了此拉取請求`
    ],
    // 锁定：locked [as off-topic] and limited conversation to collaborators（原文无标点，原因不加引号；与议题时间线同一写法）
    [
      new RegExp(`^locked (?:as (${LOCK_REASON_SOURCE}) )?and limited conversation to collaborators$`),
      (_, reason) =>
        reason ? `以${LOCK_REASON[reason] ?? reason}為由鎖定了對話並限制為僅協作者可留言` : '鎖定了對話並限制為僅協作者可留言'
    ],
    [
      new RegExp(`^locked this conversation as (${LOCK_REASON_SOURCE})$`),
      (_, reason) => `以${LOCK_REASON[reason] ?? reason}為由鎖定了此對話`
    ],
    [new RegExp(`^as (${LOCK_REASON_SOURCE})$`), (_, reason) => `以${LOCK_REASON[reason] ?? reason}為由`],
    // 检查通过数
    [/^(\d+) of (\d+) checks passed$/, '$1/$2 項檢查通過'],
    [/^(\d+) checks? passed$/, '$1 項檢查通過'],
    [/^(\d+) checks? failed$/, '$1 項檢查失敗'],
    // 相似留言 / 先前的留言
    [/^(\d+) similar comments?$/, '$1 則類似的留言'],
    [/^(\d+) previous comments?$/, '$1 則先前的留言'],
    // 驳回审查：Reason for dismissing <name>'s review
    [/^Reason for dismissing (.+)['’]s review$/, '駁回 $1 審查的原因'],
    // 活动面板
    [/^Showing (\d+) of (\d+) loaded events$/, '顯示 $1/$2 個已載入的事件'],
    [/^(\d+) activit(?:y|ies)$/, '$1 項活動'],
    [/^Expand (\d+) activit(?:y|ies)$/, '展開 $1 項活動'],
    [/^Collapse (\d+) activit(?:y|ies)$/, '摺疊 $1 項活動'],
    [/^Activity filters \((\d+) active\)$/, '活動篩選器（已套用 $1 個）'],
    [/^Activity \((.+)\)$/, '活動 ($1)'],
    [/^Filter activity: (.+)$/, '篩選活動：$1'],
    [
      /^Sort (comments|activity): (Oldest|Newest)$/,
      (_, subject, order) => `${SORT_SUBJECT[subject] ?? subject}排序：${SORT_ORDER[order] ?? order}`
    ],
    [/^Enter a value for (type|actor|since):\.$/, '請輸入 $1: 的值。'],
    [/^Use an available since: preset or an ISO timestamp, such as (\S+)\.$/, '請使用可用的 since: 預設集或 ISO 時間戳記，例如 $1。'],
    // 代理工作阶段链接：View session <工作阶段 ID>
    [/^View session ([0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12})$/, '查看工作階段 $1']
  ],
  inline: [
    // 经典时间线：<作者> changed the base branch from <main> to <dev> <时间链接>。
    // 作者前的头像、句末的时间链接随布局可有可无，前后的槽位原样带回；不命中时按上方片段逐段翻译
    [/^(\{\}*)changed the base branch from \{\} to \{\}(\{\}*)$/, '$1 將基底分支從 {} 變更為 {}$2'],
    // 经典时间线锁定事件：<作者> locked as <strong>原因</strong> and limited conversation to collaborators <时间链接>；
    // 隐去操作者时作者处为文字 Repository owner。原文无标点，原因提到句首（与上方正则同一写法）
    [/^(\{\}*)locked as \{\} and limited conversation to collaborators(\{\}*)$/, '$1 以{}為由鎖定了對話並限制為僅協作者可留言 $2'],
    [
      /^(\{\}*)Repository owner locked as \{\} and limited conversation to collaborators(\{\}*)$/,
      '$1 儲存庫擁有者以{}為由鎖定了對話並限制為僅協作者可留言 $2'
    ],
    // 活动面板（RemovedFromMergeQueueText）：<作者> removed this pull request from the <merge queue> due to <原因>。
    // 原文无标点：原因是文字时提到句首；原因在按钮里时作「…移出合併佇列的原因是 <原因>」。作者元素带右边距，不补空格
    [
      new RegExp(`^(\\{\\}*)removed this pull request from the \\{\\} (?:due to|because) (${DEQUEUE_REASON_SOURCE})$`),
      (_, lead, reason) => `${lead}因${dequeueReason(reason)}而將此拉取請求移出{}`
    ],
    [/^(\{\}*)removed this pull request from the \{\} (?:due to|because) \{\}$/, '$1將此拉取請求移出{}的原因是{}'],
    // 经典时间线编码代理事件：<Copilot> finished work on behalf of <用户> [due to an error] <时间链接>。
    // 原文无标点，用户名提到动词前（与 copilot/code.ts 的整句正则同一写法）；用户链接后没有文本节点时整句写不进去，
    // 按上方 scoped 片段「代表以下使用者完成了工作」逐段翻译
    [
      /^(\{\}*)(finished|stopped) work on behalf of \{\}(due to an error)?(\{\}*)$/,
      (_, lead, verb, error, tail) =>
        `${lead} 代表 {} ${error ? '因發生錯誤而' : ''}${verb === 'finished' ? '完成了工作' : '停止了工作'} ${tail}`
    ],
    [/^(\{\}*)finished reviewing on behalf of \{\}(\{\}*)$/, '$1 代表 {} 完成了審查 $2']
  ]
} satisfies PageDictionary
