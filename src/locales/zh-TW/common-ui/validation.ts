import type { PageDictionary } from '../../../core/types'
import { joinCjk } from '../helpers'

/**
 * 表单校验错误（服务器渲染，多在 flash 横幅或字段下方）：「<字段名> <错误>」，如 Name can't be blank、
 * Domain is not properly formatted.。字段名与错误分别查表，两张表的键简繁相同（正则由键拼成）。
 * 几条错误拼成一段（Domain is not a valid public domain.. Domain is not properly formatted.）时由引擎按句翻译
 * （见 core/matcher.ts）。页面词典收了同一句的（issues/labels.ts、settings-account/security.ts 等）优先。
 */

/** 字段名：译法与各表单的字段标签一致 */
const FIELDS: Readonly<Record<string, string>> = {
  Bio: '個人簡介',
  'Billing email': '帳單電子郵件',
  Body: '內文',
  Branch: '分支',
  'Callback URL': '回呼 URL',
  Color: '顏色',
  Company: '公司',
  Description: '描述',
  Domain: '網域',
  Email: '電子郵件',
  'Homepage URL': '首頁 URL',
  Key: '金鑰',
  Label: '標籤',
  Location: '所在地',
  Login: '使用者名稱',
  Name: '名稱',
  Note: '備註',
  'Organization name': '組織名稱',
  Password: '密碼',
  'Repository name': '儲存庫名稱',
  'Tag name': '標記名稱',
  'Team name': '團隊名稱',
  Title: '標題',
  URL: 'URL',
  Username: '使用者名稱',
  Value: '值',
  Website: '網站',
}

/** 错误：字段名之后的部分 */
const MESSAGES: Readonly<Record<string, string>> = {
  "can't be blank": '不能為空白',
  'can’t be blank': '不能為空白',
  'is invalid': '無效',
  'has already been taken': '已在使用中',
  'is already taken': '已在使用中',
  'is already in use': '已在使用中',
  'already exists': '已存在',
  'is reserved': '已被保留',
  'is unavailable': '無法使用',
  'is not a valid URL': '不是有效的 URL',
  'is not a valid public domain': '不是有效的公開網域',
  'is not properly formatted': '格式不正確',
  'is not a number': '不是數字',
  'is not included in the list': '不在可選範圍內',
  'must be accepted': '必須接受',
  'contains invalid characters': '包含無效字元',
}

/** 带字符数的错误：is too long (maximum is 100 characters)；COUNTED_SOURCE 不含捕获组，拼进 VALIDATION_RE */
const COUNTED_SOURCE = String.raw`is (?:too long|too short|the wrong length) \((?:maximum is|minimum is|should be) \d+ characters?\)`
const COUNTED_RE =
  /^is (too long|too short|the wrong length) \((?:maximum is|minimum is|should be) (\d+) characters?\)$/
const COUNTED: Readonly<Record<string, (count: string) => string>> = {
  'too long': (count) => `過長（上限為 ${count} 個字元）`,
  'too short': (count) => `太短（至少 ${count} 個字元）`,
  'the wrong length': (count) => `長度不正確（應為 ${count} 個字元）`,
}

/** 键拼成正则：长的在前（Callback URL 先于 URL），转义正则元字符 */
function alternatives(keys: readonly string[]): string {
  return [...keys]
    .sort((a, b) => b.length - a.length || a.localeCompare(b))
    .map((key) => key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    .join('|')
}

/** 字段名的正则片段（不含捕获组）：其他页面的「X is invalid」规则据此让出校验句 */
export const VALIDATION_FIELD_SOURCE = alternatives(Object.keys(FIELDS))

const VALIDATION_RE = new RegExp(
  `^(${VALIDATION_FIELD_SOURCE}) (${alternatives(Object.keys(MESSAGES))}|${COUNTED_SOURCE})(\\.?)$`,
)

/** VALIDATION_RE 匹配到的错误一定在两张表之一 */
function message(text: string): string {
  const fixed = MESSAGES[text]
  if (fixed !== undefined) return fixed
  const [, kind, count] = COUNTED_RE.exec(text)!
  return COUNTED[kind!]!(count!)
}

export default {
  regexp: [
    // Name can't be blank → 名稱不能為空白；Description is too long (maximum is 100 characters). → 描述過長（上限為 100 個字元）。
    [
      VALIDATION_RE,
      (_, field: string, error: string, dot: string) => `${joinCjk(FIELDS[field]!, message(error))}${dot ? '。' : ''}`,
    ],
  ],
} satisfies PageDictionary
