import type { PageDictionary } from '../../../core/types'
import { joinCjk } from '../helpers'
import { copilotPlan } from './plans'

/** 引用选择器的分类名 */
const ENTITY: Readonly<Record<string, string>> = {
  'Files and folders': '檔案和資料夾',
  Issues: '議題',
  'Pull requests': '拉取請求',
  Discussions: '討論',
  Repositories: '儲存庫'
}

/** 引用增删的读屏公告（Adding issue 12 as a reference.）中的引用类型 */
const REFERENCE_TYPE: Readonly<Record<string, string>> = {
  issue: '議題',
  'pull-request': '拉取請求',
  discussion: '討論'
}

/** 英文列表（Intl.ListFormat('en')：GIF, JPEG, PNG, and WEBP）改用顿号与「和」连接 */
function formatList(list: string): string {
  return list.replace(/,? and /, ' 和 ').replace(/, /g, '、')
}

/** 排队消息的操作 */
const QUEUE_ACTION: Readonly<Record<string, string>> = {
  'Send now': '立即傳送',
  'Sending now': '正在立即傳送',
  'Remove from queue': '從佇列中移除',
  'Removing from queue': '正在從佇列中移除'
}

/** 模型选择器锁定项的提示（Model locked. + 原因）中的固定原因句，译文与 models.ts 一致 */
const LOCKED_REASON: Readonly<Record<string, string>> = {
  "You've used all free requests this month.": '本月的免費請求已全部用完。',
  "You've reached your premium request limit this month.": '本月進階請求已達上限。',
  'This model is not available on your plan.': '你的方案無法使用此模型。'
}

/** 锁定原因：固定句查表，升级、方案要求两种句型按方案名拼接（原文带句号才补「。」）；都不中保留原文 */
function lockedReason(reason: string): string {
  const text = reason.replace(/’/g, "'")
  if (Object.hasOwn(LOCKED_REASON, text)) return LOCKED_REASON[text] ?? reason
  const upgrade = /^Upgrade to (Copilot [\w+]+) to access this model(\.?)$/.exec(text)
  if (upgrade) return `${joinCjk(joinCjk('升級到', copilotPlan(upgrade[1]!)), '以使用此模型')}${upgrade[2] ? '。' : ''}`
  const requires = /^This model requires (Copilot [\w+]+)(\.?)$/.exec(text)
  if (requires) return `${joinCjk('此模型需要', copilotPlan(requires[1]!))}${requires[2] ? '。' : ''}`
  return reason
}

/**
 * Copilot 聊天输入框：附件与粘贴、引用选择器、文件选择面板、排队消息、命令建议，
 * 以及停靠聊天面板中被变量拆开的提示片段。
 */
export default {
  static: {
    // 模型与扩展提示（模型名、扩展名单独成节点）
    'model currently doesn’t support external context from ongoing conversations. Start a new conversation to chat with this model.':
      '模型目前不支援來自進行中對話的外部上下文。開始新對話以與此模型聊天。',
    'model doesn’t support answering questions about images. Start a new conversation without images to chat with this model.':
      '模型不支援回答與圖片有關的問題。開始不含圖片的新對話以與此模型聊天。',
    'Connect with': '連接',
    'extension, you’ll need to connect your GitHub account to your': '擴充功能，必須將你的 GitHub 帳號連接到你的',
    'Click connect to be redirected to': '按一下連接以重新導向至',
    'Figma logo': 'Figma 標誌',

    // 文件选择面板
    "Couldn't load files. Something went wrong. Check your connection and try again.": '無法載入檔案。發生錯誤。請檢查網路連線後再試一次。',
    "Couldn't load repositories. Something went wrong. Check your connection and try again.":
      '無法載入儲存庫。發生錯誤。請檢查網路連線後再試一次。',
    'Files loaded.': '已載入檔案。',
    'Repositories loaded.': '已載入儲存庫。',
    'Search repositories…': '搜尋儲存庫…',
    'Searching repositories': '正在搜尋儲存庫',

    // 排队消息
    'message with attachments': '含附件的訊息',

    // 上传与开始会话的错误
    'The cloud session is no longer available': '雲端工作階段已無法使用',
    'This turn has reached its upload limit': '此回合已達上傳上限',
    'Try again, or open Copilot to start the session.': '請再試一次，或開啟 Copilot 以開始工作階段。'
  },
  scoped: {
    'Show more...': '顯示更多...',
    'Upgrade plan': '升級方案',
    'An unexpected error occurred. Please try again.': '發生未預期的錯誤。請再試一次。'
  },
  regexp: [
    // 引用选择器
    [
      /^(Files and folders|Issues|Pull requests|Discussions|Repositories) ›(?: (.+) ›)?$/,
      (_, entity: string, repo: string) => `${ENTITY[entity] ?? entity} ›${repo ? ` ${repo} ›` : ''}`
    ],
    [/^Select folders and files in (.+)$/, '選取 $1 中的資料夾和檔案'],
    [
      /^(Adding|Removing) (\S+) (\S+) as a reference\.$/,
      (_, action: string, type: string, id: string) => {
        const kind = Object.hasOwn(REFERENCE_TYPE, type) ? (REFERENCE_TYPE[type] ?? type) : type
        return action === 'Adding' ? `${joinCjk('正在將', kind)} ${id} 新增為參考。` : `${joinCjk('正在從參考中移除', kind)} ${id}。`
      }
    ],
    [/^Displayed (\d+) GitHub references?$/, '已顯示 $1 個 GitHub 參考'],

    // 附件
    [/^Couldn['’]t attach (.+?)\. (?:This file type is|These file types are) unsupported\.$/, '無法附加 $1。檔案類型不受支援。'],
    [/^Couldn['’]t attach (.+?)\. (?:This file|These files) must be ([\d.]+ ?[KMG]B) or smaller\.$/, '無法附加 $1。檔案不得超過 $2。'],
    [
      /^Couldn['’]t attach (.+?)\. You can attach up to (\d+) (documents|files) at a time\.$/,
      (_, names: string, count: string, kind: string) =>
        `無法附加 ${names}。一次最多可附加 ${count} 個${kind === 'documents' ? '文件' : '檔案'}。`
    ],
    [/^Couldn['’]t attach (.+?)\. (?:This file is|These files are) empty\.$/, '無法附加 $1。檔案為空。'],
    [/^Couldn['’]t attach (.+?)\. (?:This file|These files) could not be read\.$/, '無法附加 $1。無法讀取檔案。'],
    [/^Couldn['’]t attach (.+?)\. You can upload up to ([\d.]+ ?[KMG]B) of files at a time\.$/, '無法附加 $1。一次最多可上傳 $2 的檔案。'],
    [
      /^Couldn['’]t paste (.+?)\. Only (.+) images can be pasted\. Drag in or attach (?:this file|these files) instead\.$/,
      (_, names: string, formats: string) => `無法貼上 ${names}。只能貼上 ${formatList(formats)} 圖片。請改為拖曳或附加檔案。`
    ],
    [
      /^Couldn['’]t upload (.+?)\. This session doesn['’]t allow writing files to the workspace\.$/,
      '無法上傳 $1。此工作階段不允許將檔案寫入工作區。'
    ],
    [/^Couldn['’]t upload (.+?) to the workspace\. Try attaching (?:it|them) again\.$/, '無法將 $1 上傳到工作區。請重新附加。'],

    // 排队消息与命令建议
    [
      /^(Send now|Sending now|Remove from queue|Removing from queue), queued message (\d+) of (\d+): (.+)$/,
      (_, action: string, index: string, total: string, label: string) =>
        `${QUEUE_ACTION[action] ?? action}，佇列中的訊息 ${index}/${total}：${label}`
    ],
    [/^(\d+) command suggestions available\. (.+) selected\.$/, '有 $1 項可用的命令建議。已選取 $2。'],
    [/^Model locked\. (.+)$/, (_, reason: string) => `模型已鎖定。${lockedReason(reason)}`],

    // 会话与存储库浏览
    [/^Saved session (\S+)$/, '已儲存的工作階段 $1'],
    [/^Explore repository (.+)$/, '探索儲存庫 $1'],
    [/^Unable to load this repository\. Select a repository owned by (.+)\.$/, '無法載入此儲存庫。選擇 $1 擁有的儲存庫。']
  ]
} satisfies PageDictionary
