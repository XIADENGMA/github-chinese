import type { PageDictionary } from '../../../core/types'

/** 警示的对象：finding 与 pulls/review.ts 同作「發現項目」 */
const ENTITY: Readonly<Record<string, string>> = {
  alert: '警示',
  alerts: '警示',
  finding: '發現項目',
  findings: '發現項目',
}

/** production code 作「正式環境程式碼」；compensating control 作「補償性控制措施」 */
const REASON: Readonly<Record<string, string>> = {
  'not valid': '無效',
  'not in production code': '不在正式環境程式碼中',
  'not relevant': '不相關',
  'mitigated by a compensating control': '已由補償性控制措施緩解',
}

/** 解除原因（小写形式出现在「requested to dismiss this as …」里；与 pulls/review.ts 的「誤報」「用於測試」「不予修正」同译） */
const RESOLUTION: Readonly<Record<string, string>> = {
  'false positive': '誤報',
  'used in tests': '用於測試',
  "won't fix": '不予修正',
  'won’t fix': '不予修正',
  mitigated: '已緩解',
  'a fix has already been started': '已開始修正',
  'no bandwidth to fix this': '無暇修正',
  'risk is tolerable to this project': '此專案可容忍此風險',
  'this alert is inaccurate or incorrect': '此警示不準確或有誤',
  'vulnerable code is not actually used': '未實際使用有漏洞的程式碼',
  'tolerable risk': '風險可容忍',
  inaccurate: '不準確',
  'not used': '未使用',
  'fix started': '已開始修正',
  'no bandwidth': '無暇修正',
}

/** 严重性：Critical 作「重大」；CodeQL 的 note 作「附註」 */
const SEVERITY_LABEL: Readonly<Record<string, string>> = {
  critical: '重大',
  high: '高',
  medium: '中',
  moderate: '中',
  low: '低',
  error: '錯誤',
  warning: '警告',
  note: '附註',
  unknown: '未知',
}

/** 警报状态（状态标签的 title） */
const ALERT_STATE: Readonly<Record<string, string>> = {
  Open: '未解決',
  Fixed: '已修正',
  Closed: '已關閉',
  Dismissed: '已解除',
  'Auto-dismissed': '已自動解除',
}

function resolution(text: string): string {
  return RESOLUTION[text.toLowerCase()] ?? text
}

/**
 * Dependabot、代码扫描、机密扫描共用的警报界面：
 * 警报页头部、解除 / 重新开启、解除原因、负责人、追踪议题、元数据侧栏。
 * dismiss（警示）作「解除」；警示列表的 Open 作「未解決」；Dismissal comment、Request comment 是解除理由，作「說明」；
 * 共用解除表单的栏位 Comment 由 common 译作「留言」，其校验提示 Comment cannot be empty 随栏位作「留言」。
 */
export default {
  static: {
    // 解除对话框
    'Dismiss alerts': '解除警示',
    'Select a reason to dismiss this alert.': '選擇解除此警示的原因。',
    'Request to dismiss alert': '請求解除警示',
    'This alert needs approval before it can be dismissed. Requests are sent to all approvers.':
      '此警示需經核准才能解除。請求會傳送給所有核准者。',
    'Submit request': '送出請求',
    'Request comment (required)': '請求說明（必填）',
    'Dismissal reason': '解除原因',
    'Dismissal comment': '解除說明',
    'Add a comment about this dismissal': '新增此次解除的說明',
    'Comment cannot be empty': '留言不可為空',
    'Dismissal reason is required': '必須選擇解除原因',
    'Submitting your request': '正在送出請求',
    'False positive': '誤報',
    'Used in tests': '用於測試',
    "Won't fix": '不予修正',
    'Won’t fix': '不予修正',
    Mitigated: '已緩解',

    // 重新开启、解除请求
    'Reopen alert': '重新開啟警示',
    'Reopen alerts': '重新開啟警示',
    'Reopening alert': '正在重新開啟警示',
    'Request pending': '請求待處理',
    'Dismissal request pending': '解除請求待處理',
    'Cancel dismissal request': '取消解除請求',
    'Cancelling dismissal request': '正在取消解除請求',
    'There was an issue cancelling the dismissal request. Please try again.': '取消解除請求時發生問題。請再試一次。',
    'There was an issue reopening the alert. Please try again.': '重新開啟警示時發生問題。請再試一次。',
    'Approve dismissal': '核准解除',
    'Deny dismissal': '拒絕解除',
    'Dismissal request': '解除請求',
    'Dismissal requests': '解除請求',

    // 元数据侧栏（界面显示义的 render 作「顯示」；CWE 的 weakness 作「弱點」）
    'Alert metadata': '警示中繼資料',
    'View all fields': '查看所有欄位',
    'There was an error rendering this section.': '顯示此區段時發生錯誤。',
    Weakness: '弱點',
    Weaknesses: '弱點',
    'No CWEs': '無 CWE',
    'Loading CWE…': '正在載入 CWE…',
    'Learn more on MITRE.': '在 MITRE 上瞭解詳情。',
    'Runtime risks': '執行階段風險',
    // 原文没有逗号，译文不加
    'Active deployment records impacted by this vulnerability have been detected and tagged with runtime risks.':
      '已偵測到受此漏洞影響的作用中部署記錄並標記了執行階段風險。',
    'Learn more about runtime risks': '瞭解執行階段風險',
    'Security campaign': '安全性活動',
    'No campaign is currently tracking this alert.': '目前沒有活動在追蹤此警示。',

    // 负责人（拉取请求的 open 作「建立」）
    'Successfully assigned to Copilot to generate a fix. Copilot will open a pull request.':
      '已指派給 Copilot 產生修正。Copilot 將建立拉取請求。',
    'Successfully assigned to Copilot to apply the autofix for this alert. Copilot will open a PR.':
      '已指派給 Copilot 為此警示套用自動修正。Copilot 將建立 PR。',
    'Failed to assign Copilot': '無法指派 Copilot',
    'Failed to assign to Copilot': '無法指派給 Copilot',
    'Failed to assign to Copilot. Please try again.': '無法指派給 Copilot。請再試一次。',
    'Assign agent to alert': '將代理指派給警示',
    // breaking change 取微软繁中「重大變更」
    'The agent will analyze this vulnerability and open a draft pull request with a proposed fix, including updating the dependency and resolving any breaking changes introduced by the update.':
      '代理會分析此漏洞並建立附有建議修正的草稿拉取請求，包括更新相依項目並解決更新所引入的任何重大變更。',
    'Assignee limit reached': '已達負責人上限',
    'Ensure a fix has been generated.': '請確認已產生修正。',
    'Unable to complete the search for assignees. Try again later.': '無法完成負責人搜尋。請稍後再試。',
    'Assignee search results': '負責人搜尋結果',
    'Unable to save your selection due to server error. Try again later.':
      '因伺服器錯誤而無法儲存你的選擇。請稍後再試。',
    'Unable to save your selection due to server error. Try a moment later.':
      '因伺服器錯誤而無法儲存你的選擇。請稍後再試。',
    'Learn more about alert assignees': '瞭解警示負責人',

    // 追踪议题
    'Link an issue to this alert.': '將議題連結到此警示。',
    'Add existing GitHub issue': '加入現有的 GitHub 議題',
    'Change or remove issue': '變更或移除議題',
    Tracking: '追蹤',
  },
  scoped: {
    // 其他区域也出现的同形文字，本区域内单独生效
    'Security campaigns': '安全性活動',
    'Dismiss alert': '解除警示',
    Dismiss: '解除',
    'Filter assignees': '篩選負責人',
    // 负责人：No one - <Assign yourself>
    Assignees: '負責人',
    'No one -': '無人 -',
    'Assign yourself': '指派給自己',
    'No one assigned': '無負責人',
    'Search error': '搜尋錯誤',
    'Save error': '儲存錯誤',
    'Sorry, something went wrong. Please try again.': '抱歉，發生錯誤。請再試一次。',
    Tags: '標記',
    Development: '開發',
    // 警示列表与详情的状态（Closed 由 common 译作「已關閉」）
    Open: '未解決',
  },
  regexp: [
    [/^Max ([\d,]+) characters$/, '最多 $1 個字元'],
    // 状态标签的 title：Status: Fixed、Status: Dismissed as false positive
    [/^Status: (Open|Fixed|Closed|Dismissed|Auto-dismissed)$/, (_, state: string) => `狀態：${ALERT_STATE[state]!}`],
    [
      /^Status: (Closed|Dismissed) as (.+)$/,
      (_, state: string, reason: string) => `狀態：${ALERT_STATE[state]!}（${resolution(reason)}）`,
    ],
    // 解除对话框（单复数、警示 / 發現項目）
    [/^Dismiss (alerts?|findings?)$/, (_, entity) => `解除${ENTITY[entity]}`],
    [
      /^Select a reason to dismiss (this|these) (alerts?|findings?)\.$/,
      (_, which, entity) => `選擇解除${which === 'this' ? '此' : '這些'}${ENTITY[entity]}的原因。`,
    ],
    [/^Request to dismiss (alerts?|findings?)$/, (_, entity) => `請求解除${ENTITY[entity]}`],
    [
      /^(?:This (alert|finding) needs|These (alerts|findings) need) approval before (?:it|they) can be dismissed\. Requests are sent to all approvers\.$/,
      (_, one, many) => `${one ? '此' : '這些'}${ENTITY[one || many]}需經核准才能解除。請求會傳送給所有核准者。`,
    ],
    [
      /^(This|These) (alerts?|findings?) (?:is|are) (not valid|not in production code|not relevant|mitigated by a compensating control)$/,
      (_, which, entity, reason) => `${which === 'This' ? '此' : '這些'}${ENTITY[entity]}${REASON[reason]}`,
    ],
    // 负责人（人数作「人」，负责人计数作「位」）
    [/^Assign up to (\d+) people to this alert$/, '最多可為此警示指派 $1 人'],
    [/^You have reached the limit of (\d+) assignees$/, '已達 $1 位負責人的上限'],
    // 追踪议题、严重性筛选、CWE（GitHub 原文带引号和句号，译文随原文；单引号单独出现时作「」）
    [/^Tracked in issue #(\d+)$/, '在議題 #$1 中追蹤'],
    [
      /^Filter alerts by ('?)(critical|high|medium|moderate|low|error|warning|note|unknown)'? severity(\.?)$/,
      (_, quote, level, period) => {
        const label = SEVERITY_LABEL[level]
        return `篩選嚴重性為${quote ? `「${label}」` : label}的警示${period ? '。' : ''}`
      },
    ],
    [/^Error fetching details for CWE-(\d+)\.$/, '擷取 CWE-$1 詳細資料時發生錯誤。'],
    // 警示页头部的解除请求说明（React 拆分后拼接）
    [/^Dismissal requested as (.+)$/, (_, reason) => `已請求以${resolution(reason)}為由解除`],
    [/^requested to dismiss this as (.+)$/, (_, reason) => `請求以${resolution(reason)}為由解除此警示`],
  ],
} satisfies PageDictionary
