import type { PageDictionary } from '../../../core/types'

/** 行范围前缀：Comment on lines R12 to R14 */
const LINE_SOURCE = '[LR+-]?\\d+'

/** 自动审查留言（代码扫描等）涉及的对象 */
const RESOURCE: Readonly<Record<string, string>> = { alert: '警示', finding: '發現項目' }
const RESOURCE_SOURCE = Object.keys(RESOURCE).join('|')

/** 解除原因（与 code 词典机密推送保护的「誤報」「用於測試」同译） */
const RESOLUTION: Readonly<Record<string, string>> = {
  'false positive': '誤報',
  'used in tests': '用於測試',
  "won't fix": '不予修正',
  'won’t fix': '不予修正'
}

/** 原因：as false positive → 以誤報為由（原文无标点，不加引号） */
function reasonPrefix(reason: string | undefined): string {
  return reason ? `以${RESOLUTION[reason] ?? reason}為由` : ''
}

/**
 * 审查：提交审查（审查变更、完成审查、送出审查对话框）、行留言（开始审查、新增单则留言）、
 * 审查讨论串（解决对话、显示已解决）、建议的变更与批次提交、Copilot 建议状态、自动修正建议、
 * 代码扫描等自动审查留言的解除状态。
 * dismiss 用于警示时作「解除」（审查的 dismiss 作「駁回」，见 timeline.ts）。
 */
export default {
  static: {
    // 提交审查
    'Review changes': '審查變更',
    'Submit review': '送出審查',
    'Finish your review': '完成審查',
    // 审查菜单为 comments 模式时的标题（无权核准与要求变更，或拉取请求不可审查）
    'Finish your comments': '完成留言',
    'Request changes': '要求變更',
    'Submit general feedback without explicit approval.': '送出不含明確核准的一般意見回饋。',
    'Submit feedback and approve merging these changes.': '送出意見回饋並核准合併這些變更。',
    'Submit feedback suggesting follow-up changes.': '送出建議後續變更的意見回饋。',
    'Submit feedback suggesting changes.': '送出建議變更的意見回饋。',
    'Submit feedback that must be addressed before merging.': '送出合併前必須處理的意見回饋。',
    'Submit feedback and record your approval of these merged changes.': '送出意見回饋並記錄你對這些已合併變更的核准。',
    'Submit feedback and approve merging these changes into': '送出意見回饋並核准將這些變更合併到',
    "Pull request authors can't approve their own pull requests.": '拉取請求作者無法核准自己的拉取請求。',
    'Pull request authors can’t approve their own pull requests.': '拉取請求作者無法核准自己的拉取請求。',
    "Pull request authors can't request changes on their own pull requests.": '拉取請求作者無法對自己的拉取請求要求變更。',
    'Pull request authors can’t request changes on their own pull requests.': '拉取請求作者無法對自己的拉取請求要求變更。',
    "Users that pushed changes to this pull request after it was opened can't approve": '在此拉取請求建立後推送過變更的使用者無法核准',
    'Only users with explicit access to this repository may approve pull requests': '只有明確擁有此儲存庫存取權的使用者才能核准拉取請求',
    'Only users with explicit access to this repository may request changes on pull requests':
      '只有明確擁有此儲存庫存取權的使用者才能對拉取請求要求變更',
    // 经典审查菜单：Approve 选项说明、单数 pull request 版的禁用提示、请求更改未填评论时的校验提示
    'Submit feedback approving these changes.': '送出核准這些變更的意見回饋。',
    'Pull request authors can’t approve their own pull request.': '拉取請求作者無法核准自己的拉取請求。',
    'Pull request authors can’t request changes on their own pull request.': '拉取請求作者無法對自己的拉取請求要求變更。',
    'Only users with explicit access to this repository may request changes to pull requests':
      '只有明確擁有此儲存庫存取權的使用者才能對拉取請求要求變更',
    'You need to leave a comment indicating the requested changes.': '你需要發表留言說明所要求的變更。',
    'Only users who did not collaborate with the cloud agent will satisfy review requirements.':
      '只有未與雲端代理協作的使用者才能滿足審查要求。',
    'Are you sure you want to cancel? You will lose all your pending comments.': '確定要取消嗎？所有待處理的留言都將遺失。',
    'Are you sure you want to abandon your review? You will lose all your pending comments.':
      '確定要放棄審查嗎？所有待處理的留言都將遺失。',
    'Cancel review': '取消審查',
    'Abandon review': '放棄審查',
    'Submitting review…': '正在送出審查…',
    'Submitting review...': '正在送出審查...',
    'Failed to submit review': '無法送出審查',
    'Review submitted': '已送出審查',
    // 经典页提交审查后的闪现提示
    'Your review was submitted successfully.': '你的審查已成功送出。',
    'Your review was submitted on a merged pull request.': '你在已合併的拉取請求上送出了審查。',
    'Pending review': '待處理的審查',
    'Your review is pending': '你的審查尚未送出',
    'Unable to load pending comments': '無法載入待處理的留言',

    // 行留言
    'Start a review': '開始審查',
    'Add single comment': '新增單則留言',
    'Add review comment': '新增審查留言',
    'Add diff comment': '新增差異留言',
    // 经典多行评论表单标题：Commenting on lines <+12> to <+14>（React 整句由正则处理）
    'Commenting on lines': '留言位於行',
    'Reply…': '回覆…',
    'Reply...': '回覆...',
    'Reply and resolve comment': '回覆並解決留言',
    'Changing the line number of a comment with a suggested change is not supported.': '不支援變更含有建議變更的留言行號。',

    // 审查讨论串
    'Resolve conversation': '解決對話',
    'Unresolve conversation': '取消解決對話',
    // 经典版按钮提交中的文字
    'Resolving conversation…': '正在解決對話…',
    'Unresolving conversation…': '正在取消解決對話…',
    'Failed to resolve thread': '無法解決討論串',
    'Failed to unresolve thread': '無法取消解決討論串',
    'resolved this thread as': '將此討論串解決為',
    'marked this conversation as resolved.': '將此對話標示為已解決。',
    'marked this thread as resolved': '將此討論串標示為已解決',
    'Resolve with reason': '附上原因解決',
    'Resolve comment': '解決留言',
    'Unresolve comment': '取消解決留言',
    'Show resolved': '顯示已解決',
    'Hide resolved': '隱藏已解決',
    'Show outdated': '顯示過時',
    'Hide outdated': '隱藏過時',
    'Comment thread': '留言討論串',
    'There was a problem loading this review comment': '載入此審查留言時發生問題',

    // 建议的变更
    'Suggested change': '建議的變更',
    'Commit suggestion': '提交建議',
    'Commit suggestions': '提交建議',
    // 储存库要求签署提交时的按钮
    'Sign off and commit suggestion': '簽署並提交建議',
    'Sign off and commit suggestions': '簽署並提交建議',
    // 无写入权限时「提交建議」按钮的提示
    'This code change can be committed by users with write permissions.': '具有寫入權限的使用者可以提交此程式碼變更。',
    'Add suggestion to batch': '將建議加入批次',
    'Remove from batch': '從批次中移除',
    'Pending in batch': '已在批次中',
    'Apply suggestion': '套用建議',
    'Apply suggestions': '套用建議',
    'Apply Suggestion': '套用建議',
    'Applying suggestion…': '正在套用建議…',
    'Applying suggestions…': '正在套用建議…',
    'Insert a suggestion': '插入建議',
    'Suggestions to apply': '要套用的建議',
    'Discard batch': '捨棄批次',
    'Discard batch?': '要捨棄批次嗎？',
    'Add this suggestion to a batch that can be applied as a single commit.': '將此建議加入可作為單一提交套用的批次。',
    'This suggestion is invalid because no changes were made to the code.': '此建議因未對程式碼做任何變更而無效。',
    'Suggestions cannot be applied while the pull request is closed.': '拉取請求關閉時無法套用建議。',
    'Suggestions cannot be applied while viewing a subset of changes.': '查看部分變更時無法套用建議。',
    'Only one suggestion per line can be applied in a batch.': '一個批次中每行只能套用一項建議。',
    'Applying suggestions on deleted lines is not supported.': '不支援在已刪除的行上套用建議。',
    'You must change the existing code in this line in order to create a valid suggestion.':
      '必須變更此行中的現有程式碼才能建立有效的建議。',
    'Outdated suggestions cannot be applied.': '無法套用過時的建議。',
    'This suggestion has been applied or marked resolved.': '此建議已套用或已標示為已解決。',
    'Suggestions cannot be applied from pending reviews.': '無法從待處理的審查中套用建議。',
    'Suggestions cannot be applied on multi-line comments.': '無法在多行留言上套用建議。',
    'Suggestions cannot be applied on outdated comments.': '無法在過時的留言上套用建議。',
    'Suggestions cannot be applied while the pull request is queued to merge.': '拉取請求已排入佇列等待合併時無法套用建議。',
    'Suggestion cannot be applied right now. Please check back later.': '目前無法套用建議。請稍後再查看。',
    'You do not have permission to apply this suggestion.': '你沒有套用此建議的權限。',
    'This suggestion cannot be applied because the pull request is closed.': '此建議因拉取請求已關閉而無法套用。',
    'This suggestion cannot be applied because the pull request is queued to merge.': '此建議因拉取請求已排入佇列等待合併而無法套用。',
    'This suggestion is outdated and cannot be applied.': '此建議已過時且無法套用。',
    'This suggestion is part of a pending comment and cannot be applied.': '此建議因屬於待處理的留言而無法套用。',
    'This suggestion is part of a resolved comment and cannot be applied.': '此建議因屬於已解決的留言而無法套用。',
    'Unable to apply suggestions when viewing a specific commit range.': '查看特定提交範圍時無法套用建議。',
    'Unable to commit due to too many changes in the batch.': '因批次中的變更過多而無法提交。',
    'Unable to apply suggestions on deleted lines.': '無法在已刪除的行上套用建議。',
    'This suggestion does not have a valid line range.': '此建議沒有有效的行範圍。',
    'Unable to determine the validity of this suggestion.': '無法判斷此建議是否有效。',
    'The pull request has been updated since this batch was created. Please refresh the page and try again.':
      '建立此批次後拉取請求已更新。請重新整理頁面後再試一次。',
    'Failed to submit suggested changes': '無法送出建議的變更',
    // 经典版批次建议：按钮提示、提交对话框、提交失败（后接 Refresh and try again.）
    'Batching suggestions must be done from the files tab.': '必須在變更的檔案分頁中批次處理建議。',
    'Remove this suggestion from those to be applied in batch': '從要批次套用的建議中移除此建議',
    'Apply all batched suggestions as a single commit': '將批次中的所有建議作為單一提交套用',
    'Multiple suggested changes can be batched together in a single commit. Each suggestion author will be attributed in the commit as a co-author.':
      '多項建議的變更可以批次放入單一提交。每位建議作者都會在提交中列為共同作者。',
    'Applying commit...': '正在套用提交...',
    'This diff has recently been updated.': '此差異最近已更新。',
    // 提交消息生成（读屏播报）
    'Commit message updated with a generated suggestion.': '已使用產生的建議更新提交訊息。',
    'Commit message cleared for the updated batch.': '已為更新後的批次清除提交訊息。',
    'Copilot is generating a commit message. Enter your own message or wait for Copilot to finish.':
      'Copilot 正在產生提交訊息。請自行輸入訊息或等待 Copilot 完成。',
    "Copilot couldn't generate a commit message. Using the default commit message instead.": 'Copilot 無法產生提交訊息。改用預設提交訊息。',
    'Commit description updated with a generated suggestion.': '已使用產生的建議更新提交描述。',
    'Generated commit description cleared.': '已清除產生的提交描述。',
    'Message suggested by Copilot.': '訊息由 Copilot 建議。',
    'Copilot is generating a description. Enter your own description or wait for Copilot to finish.':
      'Copilot 正在產生描述。請自行輸入描述或等待 Copilot 完成。',
    'Description suggested by Copilot.': '描述由 Copilot 建議。',

    // Copilot 建议状态
    'This suggestion has been addressed.': '此建議已處理。',
    "This suggestion won't be addressed.": '此建議將不予處理。',
    'This suggestion won’t be addressed.': '此建議將不予處理。',
    'This suggestion is incorrect or unhelpful.': '此建議不正確或沒有幫助。',

    // 自动修正建议（代码扫描）
    'Loading suggestion...': '正在載入建議...',
    'Sorry, we could not generate an autofix suggestion.': '抱歉，無法產生自動修正建議。',
    'Unable to commit as this autofix suggestion is now outdated.': '此自動修正建議因已過時而無法提交。',
    'This autofix suggestion is outdated': '此自動修正建議已過時',
    'Show autofix suggestion': '顯示自動修正建議',
    'Hide autofix suggestion': '隱藏自動修正建議',
    'This autofix suggestion was applied.': '已套用此自動修正建議。',
    'Failed to commit suggested changes': '無法提交建議的變更',
    'Commit this suggested change directly.': '直接提交此建議的變更。',
    'Revise this suggestion with Copilot.': '使用 Copilot 修改此建議。',
    'Apply this suggested change directly.': '直接套用此建議的變更。',
    'Change suggestion action': '變更建議的動作',
    'Batching suggestions is only available in the Files changed tab': '只能在變更的檔案分頁中批次處理建議',
    'Unable to commit due to other pending changes affecting this line.': '因其他待處理的變更影響此行而無法提交。',
    'Workflows are awaiting approval. Approve workflows to run.': '工作流程正在等待核准。請核准執行工作流程。',
    'A maintainer must approve the workflows to verify this fix.': '必須由維護者核准工作流程才能驗證此修正。',
    'Failed to approve workflows, please try again.': '無法核准工作流程，請再試一次。',
    'Copilot session is done': 'Copilot 工作階段已完成',
    'Assigning to Copilot': '正在指派給 Copilot',
    // 产品名按 product-names.md 译出：Copilot code review → Copilot 程式碼審查
    'Copilot code review comment': 'Copilot 程式碼審查留言',
    'Generated by AI': '由 AI 產生',
    'Code scanning notice': '程式碼掃描提示',
    'View in Conversation tab': '在對話分頁中查看',
    'for the full code scanning experience.': '以獲得完整的程式碼掃描體驗。',
    'Request to dismiss was denied': '解除請求已遭拒絕',
    'Request to close license alert': '請求關閉授權條款警示',
    'An authorized approver needs to close this alert. Submitting this request will send a notification to all approvers for their review.':
      '此警示需要由獲得授權的核准者關閉。送出此請求會通知所有核准者審查。'
  },
  scoped: {
    'Review event': '審查事件',
    'Start review': '開始審查',
    'Discard review': '捨棄審查',
    // comments 模式的按钮：Submit / Discard 与 comments 是同一元素内的相邻文本节点，引擎拼成整句匹配，片段不单独收录
    'Submit comments': '送出留言',
    'Discard comments': '捨棄留言',
    'Pending comments': '待處理的留言',
    // 经典审查菜单标题 Finish your <review> 的两段（React 版整句由 static 处理）
    'Finish your': '完成',
    review: '審查',
    'Expand this section': '展開此區段',
    // Copilot 建议状态（与 comments.ts 的解决原因同译）
    Addressed: '已處理',
    "Won't fix": '不予修正',
    'Won’t fix': '不予修正',
    Incorrect: '不正確',
    // 自动修正建议：Try pushing a new commit or if the problem persists <contact support>
    'Try pushing a new commit or if the problem persists': '請嘗試推送新提交或在問題持續發生時',
    'Add to batch': '加入批次',
    'Unknown Author': '未知作者',
    'Code paths': '程式碼路徑',
    Ask: '詢問',
    'Something went wrong, please try again.': '發生錯誤，請再試一次。',
    'Failed to react to comment': '無法對留言新增表情回應',
    'Failed to dismiss': '無法解除',
    'Failed to reopen': '無法重新開啟',
    // 自动审查留言状态：<user> denied request to dismiss
    'denied request to dismiss': '拒絕了解除請求',
    'denied request to close': '拒絕了關閉請求',
    // 捨棄批次对话框：… remove all <3> <suggestions> <from the batch.>（建议只是移出批次，留言本身保留）
    suggestion: '建議',
    suggestions: '建議',
    'from the batch.': '從批次中移除。'
  },
  regexp: [
    // 待处理的留言数（pending review comments 按术语表作「待處理」，与 common-ui 的 Pending 徽章一致）
    [/^(\d+) pending comments?$/, '$1 則待處理的留言'],
    // 行留言表单：Comment on line R12 / Commenting on lines +12 to +14（与 commits 词典的「對第 N 行留言」同一写法）
    [
      new RegExp(`^Comment(?:ing)? on lines? (${LINE_SOURCE})(?: to (${LINE_SOURCE}))?$`),
      (_, start, end) => (end ? `對第 ${start} 至 ${end} 行留言` : `對第 ${start} 行留言`)
    ],
    // 批次：Commit 3 suggestions
    [/^Commit (\d+) suggestions?$/, '提交 $1 項建議'],
    [/^(\d+) suggestions? in batch$/, '批次中有 $1 項建議'],
    [/^Are you sure you want to discard this batch\? This will remove all (\d+)$/, '確定要捨棄此批次嗎？此動作會將全部 $1 項'],
    // 提交建议失败：冒号后为服务器返回的原因（与 commits 词典同译）
    [/^There was an error trying to commit changes: (\S.*)$/, '提交變更時發生錯誤：$1'],
    // 自动审查留言（代码扫描等）的解除与关闭状态
    [
      /^requested to (dismiss|close)(?: as (.+))?$/,
      (_, action, reason) => `請求${reasonPrefix(reason)}${action === 'dismiss' ? '解除' : '關閉'}`
    ],
    [
      new RegExp(`^This (${RESOURCE_SOURCE}) was dismissed(?: as (.+))?$`),
      // 不带原因：此警示已解除；带原因：此警示已以誤報為由解除
      (_, resource, reason) => `此${RESOURCE[resource] ?? resource}已${reason ? reasonPrefix(reason) : ''}解除`
    ],
    [
      new RegExp(`^(dismissed|closed) this (${RESOURCE_SOURCE})(?: as (.+))?$`),
      (_, action, resource, reason) =>
        `${reasonPrefix(reason)}${action === 'dismissed' ? '解除' : '關閉'}了此${RESOURCE[resource] ?? resource}`
    ],
    [
      new RegExp(`^Dismissing the (${RESOURCE_SOURCE}) will mark this conversation as resolved\\.$`),
      (_, resource) => `解除此${RESOURCE[resource] ?? resource}會將此對話標示為已解決。`
    ]
  ]
} satisfies PageDictionary
