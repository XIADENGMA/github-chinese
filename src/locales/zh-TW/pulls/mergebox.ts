import type { PageDictionary } from '../../../core/types'

/** 检查状态（合并框检查汇总、分组标题；与 commits/check-summary.ts 同一套译法，状态词按术语表状态行） */
const CHECK_STATE: Readonly<Record<string, string>> = {
  failing: '失敗',
  failed: '失敗',
  errored: '發生錯誤',
  neutral: '中性',
  'timed out': '已逾時',
  cancelled: '已取消',
  stale: '過時',
  pending: '擱置中',
  'in progress': '進行中',
  requested: '已請求',
  queued: '已排入佇列',
  skipped: '已略過',
  expected: '等待回報',
  successful: '成功',
  'action required': '需要採取動作',
}

const CHECK_STATE_SOURCE = Object.keys(CHECK_STATE).join('|')
const CHECK_PART_SOURCE = `\\d+ (?:${CHECK_STATE_SOURCE})`
const CHECK_PART_RE = new RegExp(`(\\d+) (${CHECK_STATE_SOURCE})`, 'g')

/**
 * 1 failing, 2 skipped, and 15 successful → 1 項檢查失敗、2 項已略過、15 項成功（检查量词作「項」）；
 * 原文只有 and、没有逗号时不加标点：2 failing and 3 successful → 2 項檢查失敗和 3 項成功（与 commits 词典的检查汇总一致）
 */
function checkSummary(list: string): string {
  const parts = [...list.matchAll(CHECK_PART_RE)].map(
    ([, count, state], i) => `${count} 項${i === 0 ? '檢查' : ''}${CHECK_STATE[state!] ?? state}`,
  )
  return list.includes(',') ? parts.join('、') : parts.join('和 ')
}

/** 检查耗时：2m / 30s / 1h 5m → 2 分鐘 / 30 秒 / 1 小時 5 分鐘 */
const DURATION_UNIT: Readonly<Record<string, string>> = { s: '秒', m: '分鐘', h: '小時', d: '天' }
export const DURATION_SOURCE = '\\d+[smhd](?: \\d+[smhd]){0,2}'

export function duration(text: string): string {
  return text
    .split(' ')
    .map((part) =>
      part.replace(/^(\d+)([smhd])$/, (_, amount: string, unit: string) => `${amount} ${DURATION_UNIT[unit]}`),
    )
    .join(' ')
}

/** 检查结论（Failing after 30s 中的状态词） */
const CHECK_CONCLUSION: Readonly<Record<string, string>> = {
  Failing: '失敗',
  Failed: '失敗',
  Failure: '失敗',
  Cancelled: '取消',
  Canceled: '取消',
  Errored: '發生錯誤',
  Error: '發生錯誤',
  'Timed out': '逾時',
  'Startup failure': '啟動失敗',
  // 原文无标点：Neutral after 41s → 41 秒後結果為中性（与 checks.ts 的「結果為中性」一致）
  Neutral: '結果為中性',
  Skipped: '略過',
  Stale: '過時',
  'Action required': '需要採取動作',
}

const CHECK_CONCLUSION_SOURCE = Object.keys(CHECK_CONCLUSION).join('|')

/** 审查分组（复数 / 单数） */
const REVIEW_GROUP: Readonly<Record<string, string>> = {
  approvals: '個核准',
  approval: '個核准',
  'requested changes': '個變更要求',
  'requested change': '個變更要求',
  'pending reviews': '個待處理的審查',
  'pending review': '個待處理的審查',
}

const REVIEW_GROUP_SOURCE = Object.keys(REVIEW_GROUP).join('|')

/** 审查者状态（合并框审查者列表；无障碍名称首字母小写） */
const REVIEW_STATUS: Readonly<Record<string, string>> = {
  'approved these changes': '核准了這些變更',
  'requested changes': '要求了變更',
  commented: '發表了留言',
}

/** 合并要求摘要（审查部分副标题；审查者是人，量词作「位」） */
const REVIEW_REQUIREMENT: Readonly<Record<string, string>> = {
  'At least 1 approving review is required': '至少需要 1 位具有寫入權限的審查者核准。',
  'An approval on the most recent push is required': '最近一次推送需要具有寫入權限的審查者核准。',
  'Code owner review required': '需要具有寫入權限的程式碼擁有者審查。',
  'A review from a compliance team is required': '需要具有寫入權限的合規團隊審查。',
}

const REVIEW_REQUIREMENT_SOURCE = Object.keys(REVIEW_REQUIREMENT).join('|')

/** 服务端下发的必要状态检查状态（Pending 按术语表作「擱置中」） */
const REQUIRED_CHECK_STATE: Readonly<Record<string, string>> = {
  expected: '尚未回報',
  failing: '失敗',
  'in progress': '進行中',
  pending: '擱置中',
}

/** 1 change requested, 2 approving reviews → 1 個變更要求、2 個核准審查 */
function reviewSummary(text: string): string {
  return text
    .split(', ')
    .map((part) =>
      part
        .replace(/^(\d+) changes? requested$/, '$1 個變更要求')
        .replace(/^(\d+) approving reviews?$/, '$1 個核准審查'),
    )
    .join('、')
}

/** 审查状态，可带「唯讀權限」与「代表團隊」：代表 org/team 以唯讀權限核准了這些變更 */
function reviewStatus(status: string, readOnly: string | undefined, teams: string | undefined): string {
  const base = REVIEW_STATUS[status.toLowerCase()] ?? status
  return `${teams ? `代表 ${teams} ` : ''}${readOnly ? '以唯讀權限' : ''}${base}`
}

const collapseOrExpand = (action: string): string => (action === 'Collapse' ? '摺疊' : '展開')

/** 合并状态摘要：合并状态按钮的提示与侧边面板副标题 */
const MERGE_STATUS_MESSAGE: Readonly<Record<string, string>> = {
  'Ready to merge when you are.': '隨時可以合併。',
  'Some optional checks are failing, but merging is still available.': '部分選用檢查失敗，但仍可合併。',
  'Still taking shape. Draft pull requests cannot be merged.': '仍在完善中。草稿拉取請求無法合併。',
  'Queued for merge.': '已排入佇列等待合併。',
  'Waiting for checks to finish.': '正在等待檢查完成。',
  // 原文无逗号：and 译「且」
  'Checks are failing and need attention.': '檢查失敗且需要處理。',
  "Waiting for a reviewer's approval.": '正在等待審查者核准。',
  'Waiting for a reviewer’s approval.': '正在等待審查者核准。',
  'Reviewers have requested changes.': '審查者已要求變更。',
  'Merge conflicts need to be resolved.': '需要解決合併衝突。',
  'Merging is currently blocked.': '合併目前受阻。',
  'This pull request has been merged.': '此拉取請求已合併。',
  'This pull request has been closed.': '此拉取請求已關閉。',
  'Some required conversations still need resolution.': '部分必要對話仍待解決。',
  'Some review requirements still need attention.': '部分審查要求仍需處理。',
  'Ready to merge. Workflow approval is still pending.': '可以合併。工作流程仍在等待核准。',
  'Workflow approval is still pending.': '工作流程仍在等待核准。',
  'Ready to merge. Some optional checks have not passed.': '可以合併。部分選用檢查未通過。',
  'Some optional checks have not passed.': '部分選用檢查未通過。',
  'Some optional checks are failing.': '部分選用檢查失敗。',
  'An authorized user must authenticate to merge.': '必須由獲得授權的使用者驗證身分才能合併。',
}

/** 2 checks are failing and need attention. */
const FAILING_CHECKS_RE = /^(\d+) checks? (?:is|are) failing and needs? attention\.$/

/** 合并状态按钮提示：<状态摘要> Click to view details in the merge panel. */
function mergeStatusHint(message: string): string {
  const failing = FAILING_CHECKS_RE.exec(message)
  const translated = failing ? `${failing[1]} 項檢查失敗且需要處理。` : MERGE_STATUS_MESSAGE[message]
  return translated
    ? `${translated}按一下可在合併面板中查看詳細資料。`
    : `${message} 按一下可在合併面板中查看詳細資料。`
}

/**
 * 合并框：新版（React）与经典版的合并状态面板、审查、检查、冲突与更新分支、命令行说明、
 * 合并方式与确认、绕过规则、合并被阻止。
 * 自动合并、合并队列、草稿、关闭与合并后、部署、堆栈合并、在场证明见 merge-flow.ts。
 * 被链接、分支名拆开的句子片段放在 scoped，避免影响其他页面。
 */
export default {
  static: {
    // 合并状态按钮与侧边面板
    'Merge status': '合併狀態',
    'Loading merge status': '正在載入合併狀態',
    'Close merge status': '關閉合併狀態',
    'Merge info': '合併資訊',
    'Merge status cannot be loaded': '無法載入合併狀態',
    ...MERGE_STATUS_MESSAGE,

    // 审查
    'Changes approved': '變更已核准',
    'Changes reviewed': '變更已審查',
    'No applicable reviews submitted': '尚未送出適用的審查',
    'At least 1 approving review is required': '至少需要 1 個核准審查',
    'An approval on the most recent push is required': '最近一次推送需要獲得核准',
    'Code owner review required': '需要程式碼擁有者審查',
    'A review from a compliance team is required': '需要合規團隊審查',
    'Review has been requested on this pull request. It is not required to merge.':
      '已請求審查此拉取請求。此審查不是合併的必要條件。',
    'Learn more about requesting a pull request review.': '瞭解如何請求拉取請求審查。',
    'Learn more about pull request reviews.': '瞭解拉取請求審查。',
    'At least 1 approving review is required to merge this pull request.': '合併此拉取請求至少需要 1 個核准審查。',
    'New changes require approval from someone other than the last pusher.': '新的變更需要由最後推送者以外的人核准。',
    'Dismiss review': '駁回審查',
    'Re-request review': '重新請求審查',
    'Dismissing review': '正在駁回審查',
    'Please provide a reason for dismissing the review': '請提供駁回審查的原因',
    'This reason will appear in the timeline so other users will know why the review was dismissed.':
      '此原因會顯示在時間軸上供其他使用者瞭解審查遭駁回的原因。',
    'Show all reviewers': '顯示所有審查者',
    'Hide all reviewers': '隱藏所有審查者',

    // 检查
    'All checks have passed': '所有檢查皆已通過',
    "Some checks haven't completed yet": '部分檢查尚未完成',
    'Some checks haven’t completed yet': '部分檢查尚未完成',
    'Some checks are waiting for approval': '部分檢查正在等待核准',
    'Some checks were not successful': '部分檢查未成功',
    'All checks have failed': '所有檢查皆失敗',
    'Checks awaiting conflict resolution': '檢查正在等待衝突解決',
    'Checks status is unknown': '檢查狀態未知',
    'No checks available.': '沒有可用的檢查。',
    'Checks settings': '檢查設定',
    'Show all checks': '顯示所有檢查',
    'Hide all checks': '隱藏所有檢查',
    'Checks cannot be loaded right now': '目前無法載入檢查',
    'Loading status checks…': '正在載入狀態檢查…',
    'Loading status checks...': '正在載入狀態檢查...',
    'Approve workflows to run': '核准執行工作流程',
    'Approve and run workflows': '核准並執行工作流程',
    'Re-running workflows': '正在重新執行工作流程',
    'Successfully approved and re-requested workflows.': '已核准並重新請求執行工作流程。',
    'Unable to re-run one or more workflows because they were created over a month ago.':
      '一或多個工作流程因建立於一個多月前而無法重新執行。',
    'Learn more about approving workflows.': '瞭解如何核准工作流程。',
    'This workflow requires approval from a maintainer.': '此工作流程需要維護者核准。',
    'First-time contributors need a maintainer to approve running workflows.':
      '首次貢獻者需要維護者核准才能執行工作流程。',
    'Copilot failure analysis': 'Copilot 失敗分析',
    'is analyzing CI failures': '正在分析 CI 失敗',
    'View failure analysis': '查看失敗分析',
    'Failure analysis unavailable': '失敗分析無法使用',
    'Continuous integration has not been set up': '尚未設定持續整合',
    'GitHub Actions and several other apps can be used to automatically catch bugs and enforce style.':
      'GitHub 動作和其他多種應用程式可用來自動找出錯誤並強制統一程式碼風格。',
    'Waiting for status to be reported': '正在等待回報狀態',
    'Waiting to run this check...': '正在等待執行此檢查...',
    'Waiting to run this check…': '正在等待執行此檢查…',
    'This check has started...': '此檢查已開始...',
    'This check has started…': '此檢查已開始…',

    // 冲突与更新分支
    'No conflicts with base branch': '與基底分支沒有衝突',
    'Merging can be performed automatically.': '可以自動合併。',
    'Checking for the ability to merge automatically...': '正在檢查能否自動合併...',
    'Checking for the ability to merge automatically…': '正在檢查能否自動合併…',
    'Checking for ability to merge automatically…': '正在檢查能否自動合併…',
    'Checking for ability to merge automatically...': '正在檢查能否自動合併...',
    "Hang in there while we check the branch's status.": '檢查分支狀態期間請稍候。',
    'Hang in there while we check the branch’s status.': '檢查分支狀態期間請稍候。',
    'This branch is out-of-date with the base branch': '此分支落後於基底分支',
    'This branch has conflicts that must be resolved': '此分支有必須解決的衝突',
    'This branch cannot be rebased due to conflicts': '此分支因衝突而無法重定基底',
    'This branch has no conflicts with the base branch': '此分支與基底分支沒有衝突',
    'This branch has no conflicts with the base branch when rebasing': '重定基底時此分支與基底分支沒有衝突',
    'Rebase and merge can be performed automatically.': '可以自動重定基底並合併。',
    'Use the command line to resolve conflicts before continuing.': '請先使用命令列解決衝突再繼續。',
    'or the command line to resolve conflicts before continuing.': '或命令列解決衝突後再繼續。',
    'Use the web editor or the command line to resolve conflicts.': '使用網頁編輯器或命令列解決衝突。',
    'Use the command line to resolve conflicts within the stack before continuing.':
      '請先使用命令列解決堆疊中的衝突再繼續。',
    'Changes can be cleanly merged.': '變更可以無衝突合併。',
    'Conflicting files': '有衝突的檔案',
    'Retry loading Agent Merge': '重試載入代理合併',
    'Load Agent Merge settings to try again.': '載入代理合併設定後再試一次。',
    'Could not update Agent Merge': '無法更新代理合併',
    'Automatic merge conflict resolution is already enabled.': '已啟用自動解決合併衝突。',
    'Automatically resolve merge conflicts in this pull request.': '自動解決此拉取請求中的合併衝突。',
    'Failed to start an agent session. Please try again.': '無法啟動代理工作階段。請再試一次。',
    'Update with merge commit': '以合併提交更新',
    'Update with rebase': '以重定基底更新',
    'The merge commit will be associated with your account.': '合併提交將與你的帳號關聯。',
    'This pull request will be rebased on top of the latest changes and then force pushed.':
      '此拉取請求會先重定基底到最新變更之上再強制推送。',
    'This branch cannot be rebased at this time.': '目前無法重定此分支的基底。',
    'Update branch options': '更新分支選項',
    "Couldn't update branch": '無法更新分支',
    'Couldn’t update branch': '無法更新分支',
    'Resolve conflicts via the command line': '透過命令列解決衝突',
    'Resolve Conflicts with CLI': '使用 CLI 解決衝突',
    'Stacked pull requests rely on rebasing rather than merge commits to update your branch. Instead of merging upstream changes into your branch, a rebase will replay the commits from your head branch on top of the latest base.':
      '堆疊式拉取請求依靠重定基底而非合併提交來更新分支。重定基底不會將上游變更合併到你的分支，而是在最新的基底之上重新套用來源分支的提交。',
    // Use the <gh stack> CLI to resolve conflicts within your stack of branches.
    'CLI to resolve conflicts within your stack of branches.': 'CLI 解決分支堆疊中的衝突。',
    'Checkout the stack of branches locally.': '在本機簽出分支堆疊。',
    'Rebase the stack with changes from the base branch.': '以基底分支的變更重定堆疊基底。',
    'Fix any conflicts and commit the result.': '修正所有衝突並提交結果。',
    // See <Resolving a merge conflict> for step-by-step instructions on resolving merge conflicts.
    'for step-by-step instructions on resolving merge conflicts.': '中的逐步說明。',
    'Copy checkout command to clipboard': '將簽出命令複製到剪貼簿',
    'Copy rebase command to clipboard': '將重定基底命令複製到剪貼簿',
    'Copy push command to clipboard': '將推送命令複製到剪貼簿',

    // 命令行合并说明
    'Merging via command line': '透過命令列合併',
    'Checkout via command line': '透過命令列簽出',
    'If you do not want to use the merge button or an automatic merge cannot be performed, you can perform a manual merge on the command line. However, the following steps are not applicable if the base branch is protected.':
      '如果你不想使用合併按鈕或無法自動合併，可以在命令列上手動合併。但如果基底分支受到保護，下列步驟並不適用。',
    'If you cannot merge a pull request automatically here, you have the option of checking it out via command line to resolve conflicts and perform a manual merge.':
      '如果無法在此自動合併拉取請求，你可以透過命令列簽出以解決衝突並手動合併。',
    // clone 按术语表作「複製」，补宾语「儲存庫」，避免读成 copy
    'Clone the repository or update your local repository with the latest changes.':
      '複製儲存庫或以最新變更更新本機儲存庫。',
    'Switch to the base branch of the pull request.': '切換到拉取請求的基底分支。',
    'Switch to the head branch of the pull request.': '切換到拉取請求的來源分支。',
    'Merge the head branch into the base branch.': '將來源分支合併到基底分支。',
    'Merge the base branch into the head branch.': '將基底分支合併到來源分支。',
    'Fix the conflicts and commit the result.': '修正衝突並提交結果。',
    'From your project repository, check out a new branch and test the changes.':
      '在你的專案儲存庫中簽出新分支並測試變更。',
    'Merge the changes and update on GitHub.': '合併變更並在 GitHub 上更新。',
    // 旧版合并框的命令行说明与冲突提示
    'Checkout via the command line': '透過命令列簽出',
    'If the conflicts on this branch are too complex to resolve in the web editor, you can check it out via command line to resolve the conflicts.':
      '如果此分支上的衝突過於複雜而無法在網頁編輯器中解決，你可以透過命令列簽出並解決衝突。',
    'These conflicts are too complex to resolve in the web editor.': '這些衝突過於複雜而無法在網頁編輯器中解決。',
    'Resolve conflicts then push again. These conflicts are too complex to resolve in the web editor. Actions workflows will not trigger on activity from this pull request while it has merge conflicts.':
      '請解決衝突後重新推送。這些衝突過於複雜而無法在網頁編輯器中解決。此拉取請求有合併衝突時其活動不會觸發動作工作流程。',
    'or the command line to resolve conflicts before continuing. Actions workflows will not trigger on activity from this pull request while it has merge conflicts.':
      '或命令列解決衝突後再繼續。此拉取請求有合併衝突時其活動不會觸發動作工作流程。',
    'You do not have permission to push to the head branch.': '你沒有推送到來源分支的權限。',
    'Pull request cannot be merged because it has a merge conflict.': '拉取請求因有合併衝突而無法合併。',
    'This branch cannot be rebased due to conflicts.': '此分支因衝突而無法重定基底。',
    'Resolving a merge conflict using the command line': '使用命令列解決合併衝突',
    'Copy clone URL': '複製用來複製儲存庫的 URL',
    'Copy clone command': '複製用來複製儲存庫的命令',
    'Copy checkout command': '複製簽出命令',
    'Copy merge command': '複製合併命令',
    'Copy push command': '複製推送命令',

    // 合并方式与合并按钮
    'Merge pull request': '合併拉取請求',
    'Squash and merge': '壓縮並合併',
    'Rebase and merge': '重定基底並合併',
    'Create a merge commit': '建立合併提交',
    'Confirm merge': '確認合併',
    'Confirm squash and merge': '確認壓縮並合併',
    'Confirm rebase and merge': '確認重定基底並合併',
    'Merge stack': '合併堆疊',
    'Confirm merge stack': '確認合併堆疊',
    'Squash and merge stack': '壓縮並合併堆疊',
    'Confirm squash and merge stack': '確認壓縮並合併堆疊',
    'Rebase and merge stack': '重定基底並合併堆疊',
    'Confirm rebase and merge stack': '確認重定基底並合併堆疊',
    'Enable auto-merge': '啟用自動合併',
    'Confirm auto-merge': '確認自動合併',
    'Enable auto-merge (squash)': '啟用自動合併（壓縮）',
    'Enable auto-merge (rebase)': '啟用自動合併（重定基底）',
    'Confirm auto-merge (squash)': '確認自動合併（壓縮）',
    'Confirm auto-merge (rebase)': '確認自動合併（重定基底）',
    'Bypass rules and merge': '繞過規則並合併',
    'Confirm bypass rules and merge': '確認繞過規則並合併',
    'Bypass rules and merge (squash)': '繞過規則並合併（壓縮）',
    'Bypass rules and merge (rebase)': '繞過規則並合併（重定基底）',
    'Confirm bypass rules and merge (squash)': '確認繞過規則並合併（壓縮）',
    'Confirm bypass rules and merge (rebase)': '確認繞過規則並合併（重定基底）',
    'Select merge method': '選擇合併方式',
    'All commits from this branch will be added to the base branch via a merge commit.':
      '此分支的所有提交將透過合併提交加入基底分支。',
    'The 1 commit from this branch will be added to the base branch.': '此分支的 1 個提交將加入基底分支。',
    'The 1 commit from this branch will be rebased and added to the base branch.':
      '此分支的 1 個提交將重定基底後加入基底分支。',
    'Merge commits are not allowed on this repository.': '此儲存庫不允許合併提交。',
    'Squash merges are not allowed on this repository.': '此儲存庫不允許壓縮合併。',
    'Rebase merges are not allowed on this repository.': '此儲存庫不允許重定基底合併。',
    'This branch cannot be rebased safely.': '此分支無法安全地重定基底。',
    'Checking for the ability to merge stack': '正在檢查能否合併堆疊',
    'Merging is blocked due to failing stack merge requirements': '因未符合堆疊合併要求而無法合併',
    'Checking for the ability to merge automatically': '正在檢查能否自動合併',
    'You can also merge this with the command line.': '你也可以透過命令列合併。',
    'View command line instructions.': '查看命令列說明。',
    'to this repository can merge pull requests.': '的使用者才能合併拉取請求。',
    'to this repository can mark a draft pull request as ready for review.':
      '的使用者才能將草稿拉取請求標示為可供審查。',

    // 确认合并（表单字段的 optional 作「選填」）
    'Add an optional extended description…': '新增選填的詳細描述…',
    'Add an optional extended description...': '新增選填的詳細描述...',
    'Select commit author email': '選擇提交作者電子郵件',
    'Repository rule violations found': '發現違反儲存庫規則',
    'Merge error warning banner': '合併錯誤警告橫幅',
    'Base branch was modified. Review and try the merge again.': '基底分支已修改。請檢查後再次嘗試合併。',
    'Head branch was modified. Review and try the merge again.': '來源分支已修改。請檢查後再次嘗試合併。',
    'Pull Request is not mergeable': '拉取請求無法合併',
    'Pull request is not mergeable': '拉取請求無法合併',

    // 绕过规则
    'Merge without waiting for requirements to be met (bypass rules)': '不等待符合要求即合併（繞過規則）',
    'Merge without waiting for requirements to be met (bypass branch protections)':
      '不等待符合要求即合併（繞過分支保護）',
    'Skip the queue and merge directly.': '略過佇列直接合併。',
    'Use the selected merge method without waiting.': '立即使用選取的合併方式。',

    // 合并被阻止（规则失败原因由服务端下发）
    'Merging is blocked': '合併受阻',
    'The base branch restricts merging to authorized users.': '基底分支僅允許獲得授權的使用者合併。',
    'Learn more about protected branches.': '瞭解受保護的分支。',
    'Merging can be performed automatically once the requested changes are addressed.':
      '處理所要求的變更後就能自動合併。',
    'The base branch requires all commits to be signed.': '基底分支要求所有提交都必須簽署。',
    'Commits must have verified signatures.': '提交必須有已驗證的簽章。',
    'Learn more about signing commits.': '瞭解如何簽署提交。',
    'The base branch requires all conversations on code to be resolved.': '基底分支要求解決所有程式碼對話。',
    'All comments must be resolved.': '必須解決所有留言。',
    'Changes must be made through a pull request.': '變更必須透過拉取請求提出。',
    'Changes must be made through the merge queue': '變更必須透過合併佇列合併',
    'Changes must be made through the merge queue.': '變更必須透過合併佇列合併。',
    'This branch must not contain merge commits.': '此分支不得包含合併提交。',
    'Required deployments must succeed before merging.': '必要部署必須成功才能合併。',
    'Required status checks must pass before merging.': '必要狀態檢查必須通過才能合併。',
    'Required status checks must pass before merging': '必要狀態檢查必須通過才能合併',
    'Required statuses must pass before merging': '必要狀態檢查必須通過才能合併',
    "You're not authorized to push to this branch.": '你無權推送到此分支。',
    'You’re not authorized to push to this branch.': '你無權推送到此分支。',
    // 网址自动成链接时的前半：… Visit <网址> for more information.（for more information. 由 common/site.ts 收录；纯文本整句见正则）
    "You're not authorized to push to this branch. Visit": '你無權推送到此分支。請造訪',
    'You’re not authorized to push to this branch. Visit': '你無權推送到此分支。請造訪',
    'Required approving review count not met.': '未達所需的核准審查數量。',
    // 规则集限制合并方式（原文方式名无引号，译文不加）
    'Merge is not an allowed merge method in this repository.': '合併不是此儲存庫允許的合併方式。',
    'Squash is not an allowed merge method in this repository.': '壓縮不是此儲存庫允許的合併方式。',
    'Rebase is not an allowed merge method in this repository.': '重定基底不是此儲存庫允許的合併方式。',
    'User does not have push access to the repository.': '使用者沒有此儲存庫的推送權限。',
  },
  scoped: {
    // 合并框里的短词与句子片段（被链接、分支名拆开）
    Mergeable: '可合併',
    'Able to merge': '可以合併',
    'Unable to merge': '無法合併',
    'Cannot merge': '無法合併',
    'Checks pending': '檢查擱置中',
    'Review requested': '已請求審查',
    'Merge is blocked': '合併受阻',
    'Merge method': '合併方式',
    'Merge options': '合併選項',
    'Merge error': '合併錯誤',
    // 规则要求作「必要」，表单字段的 Required（必填）由 common-ui 收录
    Required: '必要',
    Started: '開始於',
    Skipped: '已略過',
    'In progress': '進行中',
    Neutral: '中性',
    Expected: '等待回報',
    Stale: '過時',
    Cancelled: '已取消',
    Successful: '成功',
    Failing: '失敗',
    Waiting: '等待中',
    Requested: '已請求',
    Unknown: '未知',
    'Startup failure': '啟動失敗',
    'Action required': '需要採取動作',
    'failing checks': '失敗的檢查',
    'successful checks': '成功的檢查',
    'pending checks': '擱置中的檢查',
    'in progress checks': '進行中的檢查',
    'skipped checks': '已略過的檢查',
    'neutral checks': '中性的檢查',
    'all checks': '所有檢查',
    'Group by status': '依狀態分組',
    'No grouping': '不分組',
    'Approve and run': '核准並執行',
    'Creating task…': '正在建立任務…',
    'review options': '審查選項',
    'was requested for review': '被請求審查',
    'was requested for review as a codeowner': '被請求以程式碼擁有者身分審查',
    'write access': '寫入權限',
    'contact support': '聯絡支援團隊',
    'Try reloading the page, or if the problem persists': '請嘗試重新載入頁面，若問題持續發生，請',
    'Try again or if the problem persists': '請再試一次或在問題持續發生時',
    // 原文界面名无引号，译文不加
    'view the Checks tab.': '查看檢查分頁。',
    'Only those with': '只有擁有此儲存庫',
    // You can also <a>open this in GitHub Desktop</a> or view <a>command line instructions</a>.（You can also 由 common-ui 翻译）
    'open this in GitHub Desktop': '在 GitHub 桌面版中開啟',
    'or view': '或查看',
    'command line instructions': '命令列說明',
    'You will be able to merge this pull request after you': '合併此拉取請求前需要先',
    'verify your email address': '驗證電子郵件地址',
    'Merging must be performed from the': '必須從',
    'advisory.': '公告中執行合併。',
    'Use the': '請使用',
    'web editor': '網頁編輯器',
    'or the': '或',
    'command line': '命令列',
    'to resolve conflicts.': '解決衝突。',
    'Use the command line': '請使用命令列',
    'to resolve conflicts before continuing.': '解決衝突後再繼續。',
    'These conflicts are too complex to resolve in the web editor': '這些衝突過於複雜而無法在網頁編輯器中解決',
    Conflicts: '衝突',
    'Merge conflicts': '合併衝突',
    'merge conflicts': '合併衝突',
    'Resolve conflicts': '解決衝突',
    'Edit on the web': '在網頁上編輯',
    'Watch with Copilot': '使用 Copilot 監看',
    'Update branch': '更新分支',
    'Rebase branch': '重定分支基底',
    'Updating branch': '正在更新分支',
    'Rebasing branch': '正在重定分支基底',
    'CLI Instructions': 'CLI 說明',
    Step: '步驟',
    See: '請參閱',
    'Resolving a merge conflict': '解決合併衝突',
    'Push the changes.': '推送變更。',
    'Copy command': '複製命令',
    'Commit message': '提交訊息',
    'Extended description': '詳細描述',
    'Commit email': '提交電子郵件',
    'Optional override': '選用覆寫',
    'Bypass requirements': '繞過要求',
    'Confirming...': '確認中...',
    'Confirming…': '確認中…',
    'Merging...': '合併中...',
    'Merging…': '合併中…',
  },
  regexp: [
    // 检查汇总：1 failing, 2 skipped, 15 successful checks（经典版：… and 3 successful checks）
    [
      new RegExp(`^(${CHECK_PART_SOURCE}(?:(?:, and |, | and )${CHECK_PART_SOURCE})*) checks?$`),
      (_, list) => checkSummary(list),
    ],
    [/^(\d+) checks?$/, '$1 項檢查'],
    [
      new RegExp(`^(Collapse|Expand) (${CHECK_PART_SOURCE}) checks? group$`),
      (_, action, part) => `${collapseOrExpand(action)}分組 ${checkSummary(part)}`,
    ],
    [
      /^(Collapse|Expand) (\d+) checks? group$/,
      (_, action, count) => `${collapseOrExpand(action)}分組 ${count} 項檢查`,
    ],
    // 检查耗时：Successful in 2m → 2 分鐘內成功；Failing after 30s → 30 秒後失敗
    // （原文无标点，译文不加逗号；与 commits/check-summary.ts 同一写法）
    [
      new RegExp(`^(Successful|Success|Completed) in (${DURATION_SOURCE})$`),
      (_, state, time) => `${duration(time)}內${state === 'Completed' ? '完成' : '成功'}`,
    ],
    [
      new RegExp(`^(${CHECK_CONCLUSION_SOURCE}) after (${DURATION_SOURCE})$`),
      (_, state, time) => `${duration(time)}後${CHECK_CONCLUSION[state] ?? state}`,
    ],
    [FAILING_CHECKS_RE, '$1 項檢查失敗且需要處理。'],
    [/^(\d+) workflows? awaiting approval$/, '$1 個工作流程等待核准'],
    [/^(.+) Click to view details in the merge panel\.$/, (_, message) => mergeStatusHint(message)],
    // 审查分组：2 approvals / 1 pending review
    [new RegExp(`^(\\d+) (${REVIEW_GROUP_SOURCE})$`), (_, count, group) => `${count} ${REVIEW_GROUP[group] ?? group}`],
    [
      new RegExp(`^(Collapse|Expand) (\\d+) (${REVIEW_GROUP_SOURCE}) group$`),
      (_, action, count, group) => `${collapseOrExpand(action)}分組 ${count} ${REVIEW_GROUP[group] ?? group}`,
    ],
    [
      /^list of (approvals|requested changes|pending reviews)$/,
      (_, group) => `${(REVIEW_GROUP[group] ?? group).replace(/^個/, '')}清單`,
    ],
    // 审查者状态：Approved these changes [with read-only permissions] [for org/team]
    // 合并框审查者列表的状态不带时间：commented 作「發表了留言」；后接时间的 commented 作「留言於」
    // （审查头部的状态标签见 common-ui，评论头部的读屏标题 <用户名> commented <时间> 见 comments.ts 的行内句）
    [
      /^(Approved these changes|Requested changes|Commented)( with read-only permissions)?(?: for (.+))?$/,
      (_, status, readOnly, teams) => reviewStatus(status, readOnly, teams),
    ],
    // 排除 previously：评论列表审查头部的已驳回审查标签（previously commented 等）由 timeline.ts 收录
    [
      /^(?!previously )([\w-]+(?:\[bot\])?) (approved these changes|requested changes|commented)( with read-only permissions)?(?: for (.+))?$/,
      (_, login, status, readOnly, teams) => `${login} ${reviewStatus(status, readOnly, teams)}`,
    ],
    [
      /^([\w-]+(?:\[bot\])?) was requested for review( as a codeowner)?$/,
      (_, login, owner) => `${login} ${owner ? '被請求以程式碼擁有者身分審查' : '被請求審查'}`,
    ],
    [/^([\w-]+(?:\[bot\])?)['’]s avatar image$/, '$1 的頭像'],
    // 审查要求
    [/^At least (\d+) approving reviews are required$/, '至少需要 $1 個核准審查'],
    [
      /^At least (\d+) approving reviews? (?:is|are) required by reviewers with write access\.$/,
      '至少需要 $1 位具有寫入權限的審查者核准。',
    ],
    [
      /^At least (\d+) approving reviews are required to merge this pull request\.$/,
      '合併此拉取請求至少需要 $1 個核准審查。',
    ],
    [
      new RegExp(`^(${REVIEW_REQUIREMENT_SOURCE}) by reviewers with write access\\.$`),
      (_, summary) => REVIEW_REQUIREMENT[summary] ?? summary,
    ],
    [/^No applicable reviews submitted by reviewers with write access\.$/, '具有寫入權限的審查者尚未送出適用的審查。'],
    // 原文无冒号：改语序
    [
      /^(\d+ changes? requested(?:, \d+ approving reviews?)?|\d+ approving reviews?) by reviewers with write access\.$/,
      (_, summary) => `具有寫入權限的審查者送出了 ${reviewSummary(summary)}。`,
    ],
    [
      /^(\d+) reviews? requesting changes by reviewers with write access\.$/,
      '具有寫入權限的審查者送出了 $1 個要求變更的審查。',
    ],
    [/^(\d+) changes? requested$/, '$1 個變更要求'],
    [/^(\d+) approving reviews?$/, '$1 個核准審查'],
    [/^(\d+) pending reviewers?$/, '$1 位尚未審查的審查者'],
    [/^Waiting on code owner review from (.+)\.$/, '正在等待程式碼擁有者 $1 的審查。'],
    // 冲突与更新分支
    [
      /^Merge the latest changes from (.+) into this branch\. This merge commit will be associated with ([\w-]+)\.$/,
      '將 $1 的最新變更合併到此分支。此合併提交將與 $2 關聯。',
    ],
    [/^Merge the latest changes from (.+) into this branch\.$/, '將 $1 的最新變更合併到此分支。'],
    [/^Merge the latest changes from$/, '將'],
    [/^into this branch\.$/, '的最新變更合併到此分支。'],
    // 命令行说明步骤：Step 1 / Step 1:
    [/^Step (\d+)(:?)$/, (_, step, colon) => `第 ${step} 步${colon ? '：' : ''}`],
    // 合并方式说明
    [
      /^The (\d+) commits from this branch will be combined into one commit in the base branch\.$/,
      '此分支的 $1 個提交將壓縮為基底分支中的一個提交。',
    ],
    [
      /^The (\d+) commits from this branch will be rebased and added to the base branch\.$/,
      '此分支的 $1 個提交將重定基底後加入基底分支。',
    ],
    [/^The (\d+) commits from this branch will be added to the base branch\.$/, '此分支的 $1 個提交將加入基底分支。'],
    [
      /^All commits from these (\d+) branches will be added to the base branch via merge commits\.$/,
      '這 $1 個分支的所有提交將透過合併提交加入基底分支。',
    ],
    [
      /^The commits from these (\d+) branches will be combined into one commit per branch in the base branch\.$/,
      '這 $1 個分支的提交將各自壓縮為基底分支中的一個提交。',
    ],
    [
      /^All commits from these (\d+) branches will be rebased and added to the base branch\.$/,
      '這 $1 個分支的所有提交將重定基底後加入基底分支。',
    ],
    [
      /^Merging is blocked due to (failing|pending) merge requirements$/,
      (_, verb) => (verb === 'pending' ? '因合併要求尚未完成而無法合併' : '因未符合合併要求而無法合併'),
    ],
    [/^This commit will be authored by (\S+)\.$/, '此提交的作者將為 $1。'],
    [/^This will rebase your changes and merge them into (.+)\.$/, '這會將你的變更重定基底並合併到 $1。'],
    [/^This will squash your changes and merge them into (.+)\.$/, '這會壓縮你的變更並合併到 $1。'],
    // 服务端下发的规则失败原因（检查量词作「項」）
    [
      /^Required status check "(.+)" is (expected|failing|in progress|pending)\.$/,
      (_, name, state) => `必要狀態檢查「${name}」${REQUIRED_CHECK_STATE[state] ?? state}。`,
    ],
    [
      /^(\d+) of (\d+) required status checks? (?:has|have) not succeeded: (.+)\.$/,
      '$2 項必要狀態檢查中有 $1 項未成功：$3。',
    ],
    [/^(\d+) of (\d+) required status checks? (?:is|are) expected\.$/, '$2 項必要狀態檢查中有 $1 項尚未回報。'],
    [
      /^(\d+) of (\d+) required status checks? (?:is|are) (pending|in progress)\.$/,
      (_, count, total, state) => `${total} 項必要狀態檢查中有 ${count} 項${REQUIRED_CHECK_STATE[state] ?? state}。`,
    ],
    // 网址为纯文本时整句（链接时的前半见 static）
    [
      /^You['’]re not authorized to push to this branch\. Visit (\S+) for more information\.$/,
      '你無權推送到此分支。請造訪 $1 以瞭解詳情。',
    ],
  ],
} satisfies PageDictionary
