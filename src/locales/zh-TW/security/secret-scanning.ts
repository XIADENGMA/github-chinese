import type { PageDictionary } from '../../../core/types'

/** 关闭原因（与 alerts.ts 的「誤報」「用於測試」「不予修正」同译） */
const CLOSE_REASON: Readonly<Record<string, string>> = {
  revoked: '已撤銷',
  'false positive': '誤報',
  'used in tests': '用於測試',
  "won't fix": '不予修正',
  'won’t fix': '不予修正'
}

/**
 * 机密扫描：警示列表（筛选、空状态、意见回馈横幅）、详情（修复步骤、时间轴）、有效性、关闭原因、推送保护。
 * 术语：secret → 機密，provider → 提供者，validity → 有效性，revoke → 撤銷，rotate → 輪替，
 * remediation → 修復（与 code-scanning.ts、advisories.ts 一致），production code → 正式環境程式碼（与 alerts.ts 一致）。
 */
export default {
  static: {
    'Secret scanning alert': '機密掃描警示',
    Generic: '通用',
    Bypassed: '已繞過',
    Validity: '有效性',
    'Secret type': '機密類型',
    Provider: '提供者',
    'Possibly active secret': '可能有效的機密',
    'Active secret': '有效的機密',
    'Inactive secret': '無效的機密',
    'Possibly active': '可能有效',
    'Close as': '關閉原因',
    'Close alert': '關閉警示',
    Revoked: '已撤銷',
    'This secret has been revoked': '此機密已撤銷',
    'This secret is only used in tests': '此機密僅用於測試',
    'This secret is not in production code': '此機密不在正式環境程式碼中',
    'Select a close reason': '選擇關閉原因',
    'Remediation steps': '修復步驟',
    'Push protection bypassed': '已繞過推送保護',
    'Verify secret': '驗證機密',
    'Check secret': '檢查機密',
    'Last checked': '上次檢查',
    'Secret detected': '偵測到機密',
    'No secret scanning alerts': '沒有機密掃描警示',

    // 意见回馈横幅：<Book some time with us> to discuss the GitHub secret scanning experience.
    'Can you give us some feedback?': '可以給我們一些意見回饋嗎？',
    "We want to better understand our users' needs and experiences.": '我們希望更深入瞭解使用者的需求和體驗。',
    'We want to better understand our users’ needs and experiences.': '我們希望更深入瞭解使用者的需求和體驗。',
    'Book some time with us': '與我們預約時間',
    'to discuss the GitHub secret scanning experience.': '來討論 GitHub 機密掃描的使用體驗。',

    // 未启用：To scan for secrets, you must first enable secret scanning in <this repository's settings>.
    // 链接后只剩句号：前一段改为「…，前往」（与 dependabot.ts 同句式）
    'Secret scanning disabled': '機密掃描已停用',
    'To scan for secrets, you must first enable secret scanning in': '若要掃描機密，必須先啟用機密掃描，前往',

    // 列表筛选
    'Ignored by configuration': '已依設定忽略',
    'Clear closure reasons': '清除關閉原因',
    'Service Providers': '服務提供者',
    'Custom Patterns': '自訂模式',
    'Filter by secret type': '依機密類型篩選',
    'Filter secret type': '篩選機密類型',
    'Filter by provider': '依提供者篩選',
    'Filter provider': '篩選提供者',
    'Advanced filter dialog': '進階篩選器對話方塊',
    'Select all alerts': '選取所有警示',
    'Select validity option': '選擇有效性選項',
    'Select secret type option': '選擇機密類型選項',
    'Select provider option': '選擇提供者選項',
    'Select sort option': '選擇排序選項',

    // 空状态：No secrets found. Try <clearing filters> to view all of this repository's secret alerts.
    'No secrets found.': '找不到機密。',
    "to view all of this repository's secret alerts.": '以查看此儲存庫的所有機密警示。',
    'to view all of this repository’s secret alerts.': '以查看此儲存庫的所有機密警示。',
    "Your repository doesn't have any unresolved secrets.": '你的儲存庫沒有任何未解決的機密。',
    'Your repository doesn’t have any unresolved secrets.': '你的儲存庫沒有任何未解決的機密。',

    // 详情：修复步骤（Revoke this <机密类型> through <提供者> to prevent unauthorized access.）
    'Follow the steps below before you close this alert.': '關閉此警示前，先依照下列步驟處理。',
    "Rotate the secret if it's in use to prevent breaking workflows.": '機密若仍在使用，先輪替以免中斷工作流程。',
    'Rotate the secret if it’s in use to prevent breaking workflows.': '機密若仍在使用，先輪替以免中斷工作流程。',
    'Revoke this': '撤銷此',
    'to prevent unauthorized access.': '以防止未經授權的存取。',
    'Check security logs for potential breaches.': '檢查安全性記錄中是否有潛在的入侵。',
    'Close the alert as revoked.': '關閉警示並標示為已撤銷。',
    'Preview unavailable': '無法預覽',
    'This file is too large to show a preview': '此檔案過大無法顯示預覽',

    // 详情：时间轴（<用户> opened this alert <时间>）；警示的 open 作「建立」
    'opened this alert': '建立了此警示',
    'closed this as': '關閉了此警示並標示為',
    'closed this as completed in': '在下列提交中關閉了此警示並標示為完成'
  },
  scoped: {
    // 其他区域也出现的同形文字，本区域内单独生效
    'Push protection': '推送保護',
    Inactive: '無效',
    True: '是',
    Qualifier: '限定詞',
    Operator: '運算子',
    Value: '值',
    Is: '是',
    'is one of': '是下列其中之一',
    Try: '嘗試',
    'clearing filters': '清除篩選器',
    // <检测工具> detected a <类型> secret
    'detected a': '偵測到',
    secret: '機密',
    'Give us feedback': '提供意見回饋',
    through: '透過',
    'to clipboard': '到剪貼簿',
    'View file': '查看檔案',
    'reopened this': '重新開啟了此警示',
    'closed as': '關閉並標示為',
    'used in tests': '用於測試',
    "won't fix": '不予修正',
    'won’t fix': '不予修正',
    revoked: '已撤銷',
    'false positive': '誤報',
    'hidden item': '個隱藏項目',
    'hidden items': '個隱藏項目',
    'Load all...': '全部載入...',
    'Load all…': '全部載入…'
  },
  regexp: [
    // 关闭原因标签：Closed as revoked（原文无标点，译文不加冒号；dependabot.ts 的筛选按钮 Closed as 另作「關閉原因」）
    [
      /^Closed as (revoked|false positive|used in tests|won['’]t fix)$/i,
      (_, reason) => `已關閉並標示為${CLOSE_REASON[reason.toLowerCase()]}`
    ],
    // 筛选栏 aria-label：Advanced filter dialog: 1 valid filter
    [/^Advanced filter dialog: ([\d,]+) valid filters?$/, '進階篩選器對話方塊：$1 個有效篩選器']
  ],
  // 被元素拆开的整句；整句未命中时由 static 的片段兜底
  inline: [
    // 修复步骤：Revoke this <机密类型> through <提供者> to prevent unauthorized access.；「透過 …」移到动词前
    ['Revoke this {} through {} to prevent unauthorized access.', '將此 {} 透過 {} 撤銷，以防止未經授權的存取。']
  ]
} satisfies PageDictionary
