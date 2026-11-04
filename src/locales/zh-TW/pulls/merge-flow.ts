import type { PageDictionary } from '../../../core/types'

/** 自动合并动作 */
const AUTO_MERGE_ACTION: Readonly<Record<string, string>> = {
  'automatically merge': '自動合併',
  'be added to the merge queue': '加入合併佇列'
}

/**
 * 合并框（续）：自动合并、合并队列、草稿与转为草稿、关闭、合并后与关闭后状态（删除 / 恢复分支、代码空间清理）、
 * 部署、堆栈合并与堆栈变基、在场证明。
 */
export default {
  static: {
    // 自动合并
    'Auto-merge enabled': '已啟用自動合併',
    'Disable auto-merge': '停用自動合併',
    'Disabling auto-merge': '正在停用自動合併',
    'Pull requests to disable auto-merge': '要停用自動合併的拉取請求',
    'Pull requests to enable auto-merge': '要啟用自動合併的拉取請求',
    'Auto-merge will be enabled for the following pull requests. This will replace any existing auto-merge selections in the stack.':
      '將為下列拉取請求啟用自動合併。這會取代堆疊中現有的任何自動合併設定。',
    'Learn more about automatically merging a pull request.': '瞭解如何自動合併拉取請求。',
    'Learn more about auto-merge.': '瞭解自動合併。',
    'This pull request will be automatically merged when all requirements are met.': '此拉取請求將在符合所有要求時自動合併。',
    'This pull request will be added to the merge queue when all requirements are met.': '此拉取請求將在符合所有要求時加入合併佇列。',
    'This pull request will be added to the merge queue when all requirements are met': '此拉取請求將在符合所有要求時加入合併佇列',
    'This pull request will automatically merge when it meets the merge requirements.': '此拉取請求將在符合合併要求時自動合併。',
    'Auto-merge is not allowed on this repository.': '此儲存庫不允許自動合併。',
    'Auto-merge cannot be enabled because this pull request is already in a mergeable state.': '此拉取請求因已可合併而無法啟用自動合併。',

    // 合并队列
    'Merge when ready': '準備就緒時合併',
    'Confirm merge when ready': '確認準備就緒時合併',
    'Queue and merge in a group': '排入佇列並分組合併',
    'Queue and force solo merge': '排入佇列並強制單獨合併',
    'Confirm queue and force solo merge': '確認排入佇列並強制單獨合併',
    'Enqueue stack': '將堆疊排入佇列',
    'Confirm enqueue stack': '確認將堆疊排入佇列',
    'Enqueue pull request': '將拉取請求排入佇列',
    'Confirm enqueue pull request': '確認將拉取請求排入佇列',
    'Add to merge queue': '加入合併佇列',
    'Confirm add to merge queue': '確認加入合併佇列',
    'Adding to merge queue...': '正在加入合併佇列...',
    'Adding to merge queue…': '正在加入合併佇列…',
    'Select merge queue method': '選擇合併佇列方式',
    'Merge queue method': '合併佇列方式',
    'Queued to merge...': '已排入佇列等待合併...',
    'Queued to merge…': '已排入佇列等待合併…',
    'This pull request is queued to merge': '此拉取請求已排入佇列等待合併',
    'Remove from the queue': '從佇列中移除',
    'Remove from the queue?': '要從佇列中移除嗎？',
    'Removing from the queue': '正在從佇列中移除',
    'Removing this pull request from the queue could impact other pull requests in the queue. Are you sure?':
      '從佇列中移除此拉取請求可能會影響佇列中的其他拉取請求。確定要移除嗎？',
    'Failed to remove pull request from the merge queue': '無法從合併佇列中移除拉取請求',
    'The pull request was successfully removed from the queue.': '已從佇列中移除拉取請求。',
    // 排队状态：<说明> <merge queue>.（链接在句末；locked for deployment by 作「鎖定…的是」，免得读成「部署合併佇列」；
    // 其余说明里用「下列佇列」指代）
    'This pull request is locked for deployment by the': '鎖定此拉取請求以供部署的是',
    'This pull request is next up in the': '此拉取請求在下列佇列中排在下一個',

    // 草稿、转为草稿、关闭
    'This pull request is still a work in progress': '此拉取請求仍在進行中',
    'Draft pull requests cannot be merged.': '草稿拉取請求無法合併。',
    // open 指拉取请求的开放状态（Open → 開放中），不是动词「建立」
    'Author has reached the open pull request limit': '作者已達到開放中拉取請求的上限',
    'Still in progress?': '仍在進行中？',
    // 不支持草稿拉取请求的存储库：Still in progress? 下的链接与弹层
    'Learn about draft PRs': '瞭解草稿 PR',
    'Try draft pull requests': '試用草稿拉取請求',
    "Open an in-progress pull request without asking for formal review or risking an unwanted merge. When you're ready for code review, you can mark your draft pull request as ready for review, which will request reviews from any code owners.":
      '建立進行中的拉取請求而不必請求正式審查或擔心意外合併。準備好接受程式碼審查時，你可以將草稿拉取請求標示為可供審查，這會向所有程式碼擁有者請求審查。',
    'Convert this pull request to draft?': '要將此拉取請求轉換為草稿嗎？',
    'Converting to draft': '正在轉換為草稿',
    'People who are already subscribed will not be unsubscribed.': '已訂閱的人不會被取消訂閱。',
    'Failed to convert the pull request to draft': '無法將拉取請求轉換為草稿',
    'The pull request was successfully converted to draft.': '已將拉取請求轉換為草稿。',
    'Not planning to merge?': '不打算合併？',
    'Close this pull request?': '要關閉此拉取請求嗎？',
    'This pull request will be closed. You can reopen it later if needed.': '此拉取請求將會關閉。如有需要可以稍後重新開啟。',
    'Failed to close the pull request': '無法關閉拉取請求',
    'The pull request was successfully closed.': '已關閉拉取請求。',

    // 合并后 / 关闭后
    'Pull request successfully merged and closed': '拉取請求已成功合併並關閉',
    'Closed with unmerged commits': '已關閉但有未合併的提交',
    'Branch successfully deleted': '已成功刪除分支',
    'Delete branch': '刪除分支',
    'Deleting branch': '正在刪除分支',
    'Restore branch': '還原分支',
    'Restoring branch': '正在還原分支',
    "You're all set — the branch has been merged.": '一切就緒——分支已合併。',
    'You’re all set — the branch has been merged.': '一切就緒——分支已合併。',
    // 对话页合并事件“还原”按钮的提示
    'Create a new pull request to revert these changes': '建立新的拉取請求以還原這些變更',
    // 整句（跨存储库合并后）由下方 inline 处理；不命中时按片段拼读
    'If you wish, you can also delete this fork of': '如有需要，也可以刪除下列儲存庫的此分叉',
    'This pull request is closed.': '此拉取請求已關閉。',
    'Some codespaces could not be deleted.': '部分程式碼空間無法刪除。',
    // Copilot 的 watch、monitor 是监看拉取请求的状态，不是通知订阅的「關注」：watch 作「監看」，monitor 作「監控」（同 copilot/app.ts）
    'Copilot can watch this pull request': 'Copilot 可以監看此拉取請求',
    'Copilot can monitor this pull request for failed Actions workflows and merge conflicts and fix them automatically.':
      'Copilot 可以監控此拉取請求中失敗的動作工作流程和合併衝突並自動修正。',
    'Watch and fix': '監看並修正',

    // 部署
    'This branch has not been deployed': '此分支尚未部署',
    'This branch was successfully deployed': '此分支已成功部署',
    'This branch had an error being deployed': '此分支部署時發生錯誤',
    'This branch is being deployed': '此分支正在部署',
    'Show environments': '顯示環境',
    'Hide environments': '隱藏環境',

    // 合并区的合并状态链接
    'View status': '查看狀態',

    // 堆栈合并
    'Stacked pull requests list': '堆疊式拉取請求清單',
    'Merging this pull request in the stack…': '正在合併堆疊中的此拉取請求…',
    'This pull request is being merged.': '正在合併此拉取請求。',
    'Merging stack…': '正在合併堆疊…',
    'This pull request cannot be merged.': '此拉取請求無法合併。',
    'Unable to merge as a stack': '無法作為堆疊合併',
    'Some of the pull requests in this stack cannot be merged.': '此堆疊中的部分拉取請求無法合併。',
    'Able to merge this pull request': '可以合併此拉取請求',
    'Only this pull request will be merged.': '只會合併此拉取請求。',
    'Able to merge as a stack': '可以作為堆疊合併',
    'Loading stack status...': '正在載入堆疊狀態...',
    'Loading stack status…': '正在載入堆疊狀態…',
    'Waiting on status checks...': '正在等待狀態檢查...',
    'Waiting on status checks…': '正在等待狀態檢查…',
    'Some of the pull requests in this stack have pending status checks.': '此堆疊中部分拉取請求有擱置中的狀態檢查。',
    'Could not determine stack status': '無法判斷堆疊狀態',
    'Cancelling stack merge': '正在取消堆疊合併',
    'Collapse stack details': '摺疊堆疊詳細資料',
    'Expand stack details': '展開堆疊詳細資料',
    'Will not merge: higher up the stack': '不會合併：位於堆疊上層',
    'Blocked downstack': '受阻於堆疊下層',
    'Rebase stack': '重定堆疊基底',
    'Rebasing stack': '正在重定堆疊基底',
    'Rebasing stack…': '正在重定堆疊基底…',
    'Rebasing complete': '重定基底完成',
    'This stack is up to date and has a linear commit history.': '此堆疊已是最新狀態且提交歷史記錄呈線性。',
    'Rebasing stacked pull requests': '正在重定堆疊式拉取請求的基底',
    'Rebasing stacked pull requests list': '正在重定基底的堆疊式拉取請求清單',
    'Rebasing was stopped due to merge conflicts': '重定基底因合併衝突而停止',
    'Rebasing was stopped due to an error': '重定基底因發生錯誤而停止',
    'Rebasing was stopped due to a network error': '重定基底因網路錯誤而停止',
    'Try to rebase this stack again. If the problem persists, refresh the page.':
      '請再次嘗試重定此堆疊的基底。如果問題持續發生，請重新整理頁面。',
    // 原文界面名 Done 无引号，译文不加；补「按鈕」，免得「選取完成」读成选取已完成
    'Command-line conflict-resolution instructions are available below. Select Done to proceed.':
      '下方提供以命令列解決衝突的說明。選取完成按鈕以繼續。',
    'Failed to load stack rebase status': '無法載入堆疊重定基底狀態',
    'Stack rebase polling timed out': '堆疊重定基底輪詢逾時',
    'Rebasing a stack restores a linear commit history when its branches have diverged, and brings the stack up to date with its base branch.':
      '重定堆疊基底可在分支出現分歧時還原線性的提交歷史記錄，並讓堆疊與其基底分支同步至最新狀態。',
    'Learn more about rebasing stacks.': '瞭解如何重定堆疊基底。',
    'Each branch is rebased onto the tip of the one below it, starting from the first unmerged branch.':
      '從第一個未合併的分支開始，每個分支都會重定基底到其下方分支的最新提交之上。',
    'Once a branch is rebased, it is force-pushed.': '分支重定基底後就會強制推送。',
    'The process stops at the first merge conflict or failed rebase.': '此程序會在遇到第一個合併衝突或重定基底失敗時停止。',
    'Commits keep their original author, but will be signed and verified by GitHub.': '提交會保留原作者，但會由 GitHub 簽署並驗證。',
    'Learn more about commit signature verification.': '瞭解提交簽章驗證。',
    'Current stack entry merge conflicts': '目前堆疊項目的合併衝突',
    'Downstack merge conflicts': '堆疊下層的合併衝突',
    'This stack has conflicts that must be resolved': '此堆疊有必須解決的衝突',
    'Optional stack rebase': '選用的堆疊重定基底',
    'This stack is out-of-date with its base branch': '此堆疊落後於其基底分支',
    'Required stack rebase': '必要的堆疊重定基底',
    'Some branches in this stack have diverged and must be rebased': '此堆疊中的部分分支已分歧且必須重定基底',
    'Rebase this stack to restore a linear commit history across its branches.': '重定此堆疊的基底以還原各分支間線性的提交歷史記錄。',

    // 在场证明
    'Authentication is already in progress. Complete it before starting another attempt.': '身分驗證已在進行中。請先完成再重新嘗試。',
    'Authenticating... Proof of presence, opens in a new tab': '身分驗證中...在場證明，在新分頁中開啟',
    'Authenticate proof of presence, opens in a new tab': '驗證在場證明，在新分頁中開啟',
    'The proof of presence requirement could not be evaluated. Try again later.': '無法評估在場證明要求。請稍後再試。',
    'Learn more about proof of presence': '瞭解在場證明',
    'Authenticate to merge': '驗證身分以合併',
    'Unable to evaluate proof of presence. Try again later.': '無法評估在場證明。請稍後再試。',
    'PoP provided': '已提供在場證明',
    'Proof of presence required': '需要在場證明',
    'Proof of presence verified': '在場證明已驗證',
    'Proof of presence unavailable': '在場證明無法使用',
    'Unable to load proof of presence. Try again later.': '無法載入在場證明。請稍後再試。'
  },
  scoped: {
    // 合并队列片段：This repository uses the <merge queue> for all merges into the <main> branch.
    'Not enabled for this repository': '此儲存庫未啟用',
    'This repository uses the': '此儲存庫使用',
    'merge queue': '合併佇列',
    'for all merges into the': '來合併所有變更到',
    'branch.': '分支。',
    'Remove from queue': '從佇列中移除',
    // 自动合并片段：This pull request will <merge automatically> when all requirements are met.
    // 整句由下方 inline 处理；宿主结构不同、不命中时按片段拼读（原文无括号、逗号，条件作句末状语）
    'This pull request will': '此拉取請求將',
    'merge automatically': '自動合併',
    'squash automatically': '自動壓縮並合併',
    'rebase automatically': '自動重定基底並合併',
    'be added to the merge queue': '加入合併佇列',
    'when all requirements are met.': '於符合所有要求時。',
    // 草稿：Add more commits by pushing to the <branch> branch on <repo>.（采集数据无此句 DOM，按片段收录）
    'Draft state': '草稿狀態',
    'Add more commits by pushing to the': '推送更多提交到',
    'branch on': '分支位於',
    // 合并后：You’re all set — the <branch> branch can be safely deleted.
    "You're all set — the": '一切就緒——',
    'You’re all set — the': '一切就緒——',
    'You’re all set—the': '一切就緒——',
    "You're all set—the": '一切就緒——',
    'branch can be safely deleted.': '分支可以安全刪除。',
    'in the': '入口在',
    settings: '設定',
    'settings.': '設定。',
    Revert: '還原',
    // 关闭后：This pull request is closed, but the <branch> branch has unmerged commits.
    'This pull request is closed, but the': '此拉取請求已關閉，但',
    'branch has unmerged commits.': '分支有未合併的提交。',
    'Delete Codespace?': '要刪除程式碼空間嗎？',
    // 部署
    'No deployments': '尚無部署',
    'View deployment': '查看部署',
    Deployments: '部署',
    // 堆栈合并
    'Stacked pull requests': '堆疊式拉取請求',
    'Refresh the page to try again.': '請重新整理頁面後再試一次。',
    'Cancel merge': '取消合併',
    Merging: '合併中',
    'Not ready': '未就緒',
    Ready: '就緒',
    Rebased: '已重定基底',
    'Rebase failed': '重定基底失敗',
    Rebasing: '重定基底中',
    'Resolve the merge conflicts in pull request': '請先解決拉取請求',
    ', then try to rebase this stack again.': '中的合併衝突，然後再次嘗試重定此堆疊的基底。',
    'Check pull request': '請檢查拉取請求',
    'for any issues, then try to rebase this stack again.': '是否有任何問題，然後再次嘗試重定此堆疊的基底。',
    'Select Done to proceed.': '選取完成按鈕以繼續。',
    'What will happen': '會發生什麼事',
    // 在场证明
    'Authenticating...': '身分驗證中...',
    'Authenticating…': '身分驗證中…',
    'via MFA': '透過多重要素驗證',
    'via Re-Auth': '透過重新驗證身分',
    'Proof of presence': '在場證明'
  },
  regexp: [
    // 合并队列
    [/^for all merges into the (.+) branch\.$/, '來合併所有變更到 $1 分支。'],
    [/^There (?:is|are) (\d+) pull requests? ahead of this one in the$/, '此拉取請求在下列佇列中前面還有 $1 個拉取請求'],
    [
      /^This pull request will be automatically grouped with other pull requests and merged into (.+)\.$/,
      '此拉取請求將自動與其他拉取請求分組並合併到 $1。'
    ],
    [/^This pull request will be merged into (.+) by itself\.$/, '此拉取請求將單獨合併到 $1。'],
    // 自动合并
    [
      /^This pull request and (\d+) others? in the stack will (automatically merge|be added to the merge queue) when they all meet the merge requirements\.$/,
      (_, count, action) => `此拉取請求和堆疊中的其他 ${count} 個拉取請求將在全部符合合併要求後${AUTO_MERGE_ACTION[action] ?? action}。`
    ],
    [/^Are you sure you want to disable auto-merge for (\d+) pull requests?\?$/, '確定要為 $1 個拉取請求停用自動合併嗎？'],
    // 合并后：代码空间清理（产品名按术语表第 3 节：codespace → 程式碼空間）
    [/^Delete (?:(\d+) )?codespaces?$/, (_, count) => (count ? `刪除 ${count} 個程式碼空間` : '刪除程式碼空間')],
    [/^Deleting (?:(\d+) )?codespaces?\.$/, (_, count) => (count ? `正在刪除 ${count} 個程式碼空間。` : '正在刪除程式碼空間。')],
    [/^Couldn['’]t delete (?:(\d+) )?codespaces?$/, (_, count) => (count ? `無法刪除 ${count} 個程式碼空間` : '無法刪除程式碼空間')],
    [
      /^You['’]re all set — the (\d+) codespaces? for head branch can be safely deleted\. You can also manage your codespaces in$/,
      '一切就緒——來源分支的 $1 個程式碼空間可以安全刪除。你也可以在下列位置管理程式碼空間'
    ],
    [/^Are you sure you want to delete (\d+) codespaces? for the head branch\?$/, '確定要刪除來源分支的 $1 個程式碼空間嗎？'],
    // 堆栈合并
    [/^(\d+) pull requests are being merged\.$/, '正在合併 $1 個拉取請求。'],
    [/^Merging this pull request will also merge (\d+) pull requests? below it\.$/, '合併此拉取請求也會合併其下方的 $1 個拉取請求。'],
    [/^(\d+) of (\d+) pull requests loading$/, '正在載入 $1/$2 個拉取請求'],
    [/^(\d+) of (\d+) branches rebased$/, '已重定基底 $1/$2 個分支'],
    [
      /^Resolve the merge conflicts in pull request #(\d+), then try to rebase this stack again\.$/,
      '請先解決拉取請求 #$1 中的合併衝突，然後再次嘗試重定此堆疊的基底。'
    ],
    [
      /^Check pull request #(\d+) for any issues, then try to rebase this stack again\.$/,
      '請檢查拉取請求 #$1 是否有任何問題，然後再次嘗試重定此堆疊的基底。'
    ],
    [/^Rebase this stack onto the latest version of (.+)\.$/, '將此堆疊重定基底到 $1 的最新版本。'],
    // 在场证明
    [/^This requirement was satisfied by ([\w-]+)$/, '此要求已由 $1 滿足']
  ],
  inline: [
    // 禁用自动合并的说明（React 合并框）：This pull request will <span>merge automatically</span> when all requirements
    // are met. <a>Learn more about automatically merging a pull request.</a>；条件提到句中，原文无括号
    ['This pull request will {} when all requirements are met. {}', '此拉取請求將在符合所有要求時{}。{}'],
    ['This pull request will {} when all requirements are met.', '此拉取請求將在符合所有要求時{}。'],
    // 合并后（跨存储库）：You're all set — the <分支> branch can be safely deleted. If you wish, you can also delete this
    // fork of <strong>owner/repo</strong> in the <a>settings</a>.（宿主为合并框副标题 <p>）；原文一个逗号，译文一个
    [
      "You're all set — the {} branch can be safely deleted. If you wish, you can also delete this fork of {} in the {}.",
      '一切就緒——{} 分支可以安全刪除。如有需要也可以刪除 {} 的此分叉，入口在{}。'
    ],
    [
      'You’re all set — the {} branch can be safely deleted. If you wish, you can also delete this fork of {} in the {}.',
      '一切就緒——{} 分支可以安全刪除。如有需要也可以刪除 {} 的此分叉，入口在{}。'
    ],
    // 同一存储库时只有前半句；按片段翻译时「——」后的空白文本节点会留下空格，整句收录
    ["You're all set — the {} branch can be safely deleted.", '一切就緒——{} 分支可以安全刪除。'],
    ['You’re all set — the {} branch can be safely deleted.', '一切就緒——{} 分支可以安全刪除。']
  ]
} satisfies PageDictionary
