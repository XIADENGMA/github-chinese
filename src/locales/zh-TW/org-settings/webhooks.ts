import type { PageDictionary } from '../../../core/types'

/** Web 钩子事件：名称与说明（组织与存储库 Web 钩子表单共用） */
const EVENTS: Readonly<Record<string, string>> = {
  'Branch protection rules': '分支保護規則',
  'Check runs': '檢查執行',
  'Commit comments': '提交留言',
  'Custom property': '自訂屬性',
  Memberships: '成員身分',
  Meta: 'Web 鉤子本身',
  'this discussion': '此討論',
  Pushes: '推送',
  Statuses: '狀態',
  Watches: '關注',
  'Personal access token requests': '個人存取權杖請求',
  'Personal access token request created, approved, denied, or cancelled.': '個人存取權杖請求已建立、核准、拒絕或取消。',
  Sponsorships: '贊助',
  Deployments: '部署',
  Milestones: '里程碑',
  Releases: '發行版本'
}

/**
 * 组织 Web 钩子：列表、添加 / 编辑表单、事件选择、最近交付。
 * 表单与存储库 Web 钩子相同；存储库设置已收录为 static 的表单文字与事件名不再重复，
 * 这里只放存储库设置未收录为 static 的短词与事件，全部放 scoped。
 */
export default {
  scoped: {
    'Webhooks /': 'Web 鉤子 /',
    '/ Add webhook': '/ 新增 Web 鉤子',
    // 列表项 URL 后：「(all events)」
    '(all events)': '（所有事件）',
    'all events': '所有事件',
    etc: '等',
    '). More information can be found in': '）。詳細資訊請參閱',
    'Content type': '內容類型',
    Secret: '機密',
    '(not recommended)': '（不建議）',
    'not recommended': '不建議',
    'Disable (not recommended)': '停用（不建議）',
    // 「Just the」+「push」+「event.」；「Send me」+「everything」+「.」；整句在同一文本节点时另收
    'Just the': '僅',
    'event.': '事件。',
    'Just the push event.': '僅 push 事件。',
    'Send me': '傳送',
    everything: '所有事件',
    'Send me everything.': '傳送所有事件。',
    'Okay, that hook was successfully created.': '已成功建立該 Web 鉤子。',
    'Okay, this hook was successfully updated.': '已成功更新該 Web 鉤子。',
    'Recent deliveries': '最近傳遞',
    redelivery: '重新傳遞',
    Request: '請求',
    Response: '回應',
    Headers: '標頭',
    Payload: '承載',
    Body: '內文',
    Redeliver: '重新傳遞',
    ...EVENTS
  },
  regexp: [
    // 交付耗时（句号随原文，与存储库 Web 钩子一致）
    [/^Completed in (\d+(?:\.\d+)?) seconds?(\.?)$/, (_, seconds: string, dot: string) => `耗時 ${seconds} 秒${dot ? '。' : ''}`],
    [/^(\d+) webhooks?$/, '$1 個 Web 鉤子']
  ]
} satisfies PageDictionary
