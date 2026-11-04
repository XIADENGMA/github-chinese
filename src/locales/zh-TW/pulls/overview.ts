import type { PageDictionary } from '../../../core/types'

/**
 * 拉取请求总览页（Overview 预览）：「為你推薦」动作项、迷你合并状态、活动摘要、侧栏分区（负责人、标签、审查者、
 * 部署、开发、参与者、通知）、描述编辑历史记录、功能预览与意见回馈。
 * 审查者行的提示（Request review from …、Reviewing at … effort）见 sidebar.ts。
 */
export default {
  static: {
    // 功能预览
    'Try the new pull requests Overview page!': '試用新的拉取請求總覽頁面！',
    'Focus on what matters most and take action with confidence.': '專注於最重要的事項並從容採取行動。',
    'Welcome to the new pull requests Overview page!': '歡迎使用新的拉取請求總覽頁面！',
    'You can learn more, turn it off, or send feedback anytime from here.': '你可以隨時在這裡瞭解詳情、關閉此功能或傳送意見回饋。',
    'Overview preview could not be turned on. Try again.': '無法開啟總覽預覽。請再試一次。',
    'Try the Overview page': '試用總覽頁面',
    'Try the Overview page, try again': '試用總覽頁面，再試一次',
    'Preview: Overview preview options': '預覽：總覽預覽選項',
    'Private preview: Overview preview options': '私人預覽：總覽預覽選項',
    'View Conversation page': '查看對話頁面',
    'Temporarily return to the classic view': '暫時返回傳統檢視',
    'Turn off Overview preview': '關閉總覽預覽',
    'Turn off Overview preview?': '要關閉總覽預覽嗎？',
    'Failed to turn off Overview preview': '無法關閉總覽預覽',
    'Why are you turning off Overview preview?': '你為什麼要關閉總覽預覽？',
    'Looking for an old friend?': '在找原來的內容嗎？',
    'Status and details': '狀態和詳細資料',

    // 为你推荐：可合并性
    'Some non-required checks are failing': '部分非必要檢查失敗',
    'Some checks need approval': '部分檢查需要核准',
    'Blocked by a downstack pull request': '受阻於堆疊下層的拉取請求',
    'Required checks failing': '必要檢查失敗',
    'Fix the failing required checks.': '修正失敗的必要檢查。',
    'View merge status': '查看合併狀態',
    'Approvals unavailable': '無法取得核准資訊',
    'No approvals required': '不需要核准',
    'View approvals': '查看核准',
    'No checks available': '沒有可用的檢查',
    'View unresolved comments': '查看未解決的留言',
    'No comments available': '沒有可用的留言',
    'No checks have been reported for this pull request yet.': '此拉取請求尚未回報任何檢查。',
    // 连接两个分句的 - 译作——
    'All requirements are met - merge the pull request.': '已滿足所有要求——可以合併拉取請求。',
    'Address the requested changes before merging.': '合併前請處理要求的變更。',
    'Unresolved comments must be resolved': '必須解決所有未解決的留言',
    'Resolve all comments before merging.': '合併前請解決所有留言。',
    'Request another approving review before this can merge.': '需再請求一個核准審查才能合併。',
    'Update your branch with the base branch before merging.': '合併前請以基底分支更新你的分支。',
    'Update your branch with the base branch when convenient.': '方便時請以基底分支更新你的分支。',

    // 为你推荐：拉取请求状态
    'An error occurred while deleting the head branch. Please try again.': '刪除來源分支時發生錯誤。請再試一次。',
    'An error occurred while restoring the branch. Please try again.': '還原分支時發生錯誤。請再試一次。',
    // ready for review → 可供審查
    'This pull request is not ready for review yet.': '此拉取請求尚不可供審查。',
    'Mark this pull request as ready when you want reviews.': '需要審查時請將此拉取請求標示為可供審查。',
    'Reopen it if you still need it.': '如仍需要可重新開啟。',
    'Restore the branch if you still need it.': '如仍需要可還原分支。',
    'Restoring head branch': '正在還原來源分支',
    'Opening revert pull request': '正在建立還原拉取請求',

    // 为你推荐：审查者
    'Review what changed since your approval.': '審查你核准後的變更。',
    'Review what changed since your last review.': '審查你上次審查後的變更。',
    'View new changes': '查看新的變更',
    'All of your comment threads have been resolved.': '你的所有留言討論串都已解決。',
    'Thank you for your time and thoughtful feedback.': '感謝你抽空提供用心的意見回饋。',
    'View your comments': '查看你的留言',
    "You're all set, thanks for your time!": '一切就緒，感謝你抽空！',
    'Your review is in progress': '你的審查進行中',
    'Failed to load pending comments': '無法載入待處理的留言',
    'You have been assigned to review from': '已透過以下團隊指派你審查',
    'You have been assigned to review': '已指派你審查',
    'Your review has been requested as a code owner': '已請求你以程式碼擁有者身分審查',
    'Start your review of the changes.': '開始審查這些變更。',
    'Review just your files': '只審查你負責的檔案',
    'You have a batch in progress': '你有進行中的批次',

    // 为你推荐：堆叠
    'A previous stacked PR was closed': '先前的堆疊式 PR 已關閉',
    'Review previous stacked PRs first': '請先審查先前的堆疊式 PR',
    'Review a previous stacked PR first': '請先審查先前的一個堆疊式 PR',
    'Complete your requested reviews in': '請先完成以下拉取請求中向你請求的審查',
    'Complete your requested review in': '請先完成以下拉取請求中向你請求的審查',

    // 活动摘要
    'Additional activity actions': '更多活動動作',
    'No new activity': '沒有新活動',

    // 侧栏分区
    'Unable to load assignees': '無法載入負責人',
    'Loading assignees': '正在載入負責人',
    "Assignees couldn't be loaded": '無法載入負責人',
    'Manage assignees': '管理負責人',
    'Unable to load labels': '無法載入標籤',
    'Manage labels': '管理標籤',
    'Unable to load reviewers': '無法載入審查者',
    'Manage reviewers': '管理審查者',
    'Filter reviewers': '篩選審查者',
    'No reviewers available': '沒有可用的審查者',
    'No reviewers match your search.': '沒有相符的審查者。',
    'No reviewers are available for this pull request.': '此拉取請求沒有可用的審查者。',
    'Failed to request review from Copilot.': '無法請求 Copilot 審查。',
    'Failed to re-request review.': '無法重新請求審查。',
    'Failed to update reviewers': '無法更新審查者',
    'Unable to load deployments': '無法載入部署',
    'Unable to load development': '無法載入開發資訊',
    'Merging this pull request may close these issues.': '合併此拉取請求可能會關閉這些議題。',
    'Unable to load participants': '無法載入參與者',
    "You're now unsubscribed from this thread.": '你已取消訂閱此討論串。',
    "You're ignoring this repository.": '你正在忽略此儲存庫。',
    'Updating subscription': '正在更新訂閱',
    'Set your default effort in': '可在以下位置設定預設審查強度',

    // 描述与评论
    'Description history is unavailable. Retry to load it again.': '無法取得描述歷史記錄。請重新嘗試載入。',
    'History unavailable. Retry': '無法取得歷史記錄。重試',
    '(loading description edit history)': '（正在載入描述編輯歷史記錄）',
    'Loading description history': '正在載入描述歷史記錄',
    '(view description edit history)': '（查看描述編輯歷史記錄）',
    'Failed to update description': '無法更新描述',
    'Pull request description updated successfully.': '已更新拉取請求描述。',
    'This comment could not be found. It may have been deleted or is no longer visible to you.': '找不到此留言。可能已刪除或你已無法查看。',
    'Skip comments': '略過留言',
    'Copilot summary warning': 'Copilot 摘要警告',
    'Copilot couldn’t regenerate this summary. The previous summary is shown.': 'Copilot 無法重新產生此摘要。目前顯示的是先前的摘要。'
  },
  scoped: {
    // 功能预览
    'Try Overview': '試用總覽',
    'Not now': '暫時不要',
    "What's new": '新功能',
    "See what's new": '查看新功能',
    'Loved!': '已喜歡！',
    'Love this feature': '喜歡此功能',
    // 页脚：Try visiting the new homes for <merge box> and the <timeline>.（and the 由 common/pages.ts 的全局词条翻译）
    'Try visiting the new home for the': '可在新位置查看',
    'Try visiting the new homes for': '可在新位置查看',
    'merge box': '合併區塊',
    timeline: '時間軸',

    // 为你推荐
    'Recommended action': '建議的動作',
    'Unable to load this section': '無法載入此區段',
    'Try reloading the page.': '請嘗試重新載入頁面。',
    'Checks failing': '檢查失敗',
    'Ready to merge': '可以合併',
    'Approval required': '需要核准',
    'Required to update': '需要更新',
    'Out of date': '已過時',
    Reviewed: '已審查',
    Failed: '失敗',
    'Collapse checks': '摺疊檢查',
    'Expand checks': '展開檢查',
    'Resolved comments': '已解決的留言',
    'Nothing to do.': '無需採取動作。',
    'Branch deleted': '已刪除分支',
    'Branch restored': '已還原分支',
    'Failed to delete branch': '無法刪除分支',
    'Failed to restore branch': '無法還原分支',
    'New changes': '新的變更',
    'Comments resolved': '留言已解決',
    'Start your review': '開始審查',
    'Review all files': '審查所有檔案',
    'Loading item': '正在載入項目',
    'Unable to load this item': '無法載入此項目',
    'Collapse item': '摺疊項目',
    'Expand item': '展開項目',
    // Reopen or remove <#12> before merging this pull request.（堆叠下层的拉取请求已关闭；remove 指移出堆叠）
    'Reopen or remove': '請重新開啟或從堆疊中移除',
    // Resolve the issues in <#12> before merging this pull request.
    'Resolve the issues in': '請先解決以下拉取請求中的問題',
    'before merging this pull request.': '後再合併此拉取請求。',
    'before reviewing this pull request.': '後再審查此拉取請求。',
    // Resolve the <merge conflicts> before this can merge.
    'Resolve the': '請解決',
    'before this can merge.': '後才能合併。',
    // Delete the <branch> branch to tidy up.
    'Delete the': '刪除',
    'branch to tidy up.': '分支以保持整潔。',
    // This pull request was merged <时间>. 时间元素紧跟片段，拼作「此拉取請求合併於 3 天前」
    'This pull request was merged': '此拉取請求合併於',
    // <user> merged in <sha> 3 days ago. / Merged in <sha>.
    'merged in': '合併於提交',
    'Merged in': '合併於提交',
    'Marked as draft': '已標示為草稿',
    'Marked ready for review': '已標示為可供審查',
    Reopened: '已重新開啟',

    // 活动摘要
    'Copilot events': 'Copilot 事件',
    'Review comments': '審查留言',
    'PR updates': 'PR 更新',

    // 侧栏分区
    'No reviewers': '無審查者',
    'Everyone else': '其他人',
    'No deployments yet': '尚無部署',
    'View workflow': '查看工作流程',
    'No linked issues': '沒有已連結的議題',
    'No participants': '無參與者',
    'See less': '顯示較少',
    'None yet - feature coming soon': '尚無 - 功能即將推出',
    Prompt: '提示',
    'Failed to load comments': '無法載入留言',
    'refresh the page': '重新整理頁面'
  },
  regexp: [
    // 迷你合并状态
    [/^(\d+) of (\d+) approvals$/, '$1/$2 個核准'],
    [/^(\d+) of (\d+) required approvals received$/, '已取得 $1/$2 個必要的核准'],
    [/^(\d+) of (\d+) reviews approved$/, '$1/$2 個審查已核准'],
    [/^(\d+) of (\d+) successful checks$/, '$1/$2 項檢查成功'],
    [/^(\d+) of (\d+) resolved comments$/, '已解決 $1/$2 則留言'],
    // 活动摘要（原文无标点，译文不加逗号）
    [/^(\d+) approved with (\d+) comments?$/, '$1 個核准含 $2 則留言'],
    [/^(\d+) requested changes with (\d+) comments?$/, '$1 個變更要求含 $2 則留言'],
    // 活动摘要其余各行：时间轴面板的分组标题（N requested changes 见 mergebox.ts）；原文逗号转成顿号
    [/^(\d+) approved$/, '$1 個核准'],
    [/^(\d+) new commits?$/, '$1 個新提交'],
    [/^(\d+) review comments?$/, '$1 則審查留言'],
    [/^(\d+) requested reviewers? changed$/, '已變更 $1 位請求的審查者'],
    [/^(\d+) Copilot events?$/, '$1 個 Copilot 事件'],
    [/^(\d+) base changes?, (\d+) force push(?:es)?$/, '$1 次基底分支變更、$2 次強制推送'],
    [/^(\d+) base changes?$/, '$1 次基底分支變更'],
    [/^(\d+) force push(?:es)?$/, '$1 次強制推送'],
    // 待提交的批次（连接两个分句的破折号译作——）
    [/^(\d+) unsubmitted items? — only visible to you until submitted$/, '$1 個未送出的項目——送出前僅你可見'],
    // 参与者：+3 more（同一规则也可能命中其他列表的计数，量词用「個」）
    [/^\+(\d+) more$/, '還有 $1 個'],
    // 意见回馈字数
    [/^Feedback is too long\. Use (\d+) characters or fewer\.$/, '意見回饋過長。最多 $1 個字元。']
  ]
} satisfies PageDictionary
