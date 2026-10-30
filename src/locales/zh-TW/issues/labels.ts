import type { PageDictionary, RegExpRule } from '../../../core/types'
import { joinName } from './list'

/** 标签颜色选择器的默认颜色名 */
const COLOR_NAME: Readonly<Record<string, string>> = {
  Red: '紅色',
  Orange: '橘色',
  Yellow: '黃色',
  Green: '綠色',
  Teal: '藍綠色',
  Blue: '藍色',
  Navy: '海軍藍',
  Purple: '紫色',
  Pink: '粉紅色',
  'Light Pink': '淺粉紅色',
  'Light Yellow': '淺黃色',
  'Light Green': '淺綠色',
  'Light Teal': '淺藍綠色',
  'Light Blue': '淺藍色',
  'Light Indigo': '淺靛藍色',
  Lavender: '薰衣草紫',
}

const COLOR_NAME_SOURCE = Object.keys(COLOR_NAME)
  .sort((a, b) => b.length - a.length)
  .join('|')

const HEX_SOURCE = '#[0-9A-Fa-f]{3}(?:[0-9A-Fa-f]{3})?'

/**
 * 默认标签（GitHub、Dependabot 预置）的名称：名称表（PageDictionary.labels），只在标签名称区域内整段匹配；
 * 自定义标签名是用户内容，不收
 */
const LABEL_NAMES: Readonly<Record<string, string>> = {
  bug: '錯誤',
  documentation: '說明文件',
  duplicate: '重複',
  enhancement: '改進',
  'good first issue': '適合新手的議題',
  'help wanted': '需要協助',
  invalid: '無效',
  question: '疑問',
  wontfix: '不予修正',
  dependencies: '相依項目',
  accessibility: '無障礙',
}

/**
 * 默认标签的说明（说明表 PageDictionary.labelDescriptions，只在标签说明区域内整段匹配），弯引号、直引号两种写法都收。
 * 同一说明另收在 static：筛选框的标签建议、标签选择器里的说明不在标签区域里（两处译文相同）
 */
const LABEL_DESCRIPTIONS: Readonly<Record<string, string>> = {
  'Barrier affecting people with disabilities': '影響身心障礙者使用的障礙',
  "Something isn't working": '某些功能無法正常運作',
  'Something isn’t working': '某些功能無法正常運作',
  'Improvements or additions to documentation': '說明文件的改進或補充',
  'This issue or pull request already exists': '此議題或拉取請求已存在',
  'New feature or request': '新功能或功能請求',
  'Good for newcomers': '適合新手',
  'Extra attention is needed': '需要特別注意',
  "This doesn't seem right": '這似乎不對',
  'This doesn’t seem right': '這似乎不對',
  'Further information is requested': '需要更多資訊',
  'This will not be worked on': '不會處理',
  'Pull requests that update a dependency file': '更新相依性檔案的拉取請求',
}

/**
 * 名称区域里 GitHub 写入的占位文字（名称表）：新建、编辑标签对话框的预览令牌，名称为空时显示。
 * static 另收（令牌的 aria-label 不在标签区域里，两处译文相同）
 */
const LABEL_PLACEHOLDERS: Readonly<Record<string, string>> = {
  'Label preview': '標籤預覽',
}

/** 名称表：默认标签名与名称区域里的占位文字 */
const LABEL_NAME_TABLE: Readonly<Record<string, string>> = { ...LABEL_NAMES, ...LABEL_PLACEHOLDERS }

const LABEL_NAME_MAP: ReadonlyMap<string, string> = new Map(Object.entries(LABEL_NAMES))
const LABEL_TOKEN_MAP: ReadonlyMap<string, string> = new Map(Object.entries(LABEL_NAME_TABLE))
const LABEL_DESCRIPTION_MAP: ReadonlyMap<string, string> = new Map(Object.entries(LABEL_DESCRIPTIONS))

/** 按字面匹配的正则备选 */
function alternatives(texts: Iterable<string>): string {
  return [...texts].map((text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')
}

/** 默认标签名（正则备选）：无障碍名称里的标签名按它匹配 */
export const LABEL_NAME_SOURCE = alternatives(LABEL_NAME_MAP.keys())

/** 默认标签的说明（正则备选）：说明提示的无障碍名称按它匹配 */
export const LABEL_DESCRIPTION_SOURCE = alternatives(LABEL_DESCRIPTION_MAP.keys())

/**
 * 无障碍名称里的标签名：默认标签与标签区域里显示的译名相同，自定义标签名（用户内容）原样返回
 */
export function labelName(name: string): string {
  return LABEL_NAME_MAP.get(name) ?? name
}

/** 无障碍名称里的标签名，archived 不为空时是已存档标签（Archived 加标签名，与议题列表的 Archived 兜底规则同样拼接） */
export function archivedLabelName(archived: string, name: string): string {
  return archived ? joinName('已封存', labelName(name)) : labelName(name)
}

/** 预览令牌的无障碍名称（值同令牌里显示的文字）：默认标签名、占位文字与令牌同译，自定义标签名原样返回 */
export function labelTokenName(text: string): string {
  return LABEL_TOKEN_MAP.get(text) ?? text
}

/** 无障碍名称里的标签说明：默认说明与标签区域里显示的译文相同，其余原样返回 */
export function labelDescription(description: string): string {
  return LABEL_DESCRIPTION_MAP.get(description) ?? description
}

/** 生态说明里的产品名按术语表第 3 节译出；其余生态名（javascript、Docker 等）保持原文 */
const ECOSYSTEM_NAMES: ReadonlyMap<string, string> = new Map([['GitHub Actions', 'GitHub 動作']])

/**
 * Dependabot 按生态生成的标签说明：Pull requests that update javascript code（新建的写作 Javascript）。
 * 生态名不定，不逐条收进说明表：标签说明区域里按标签正则、区域外按全站 regexp（common-ui/labels.ts）、
 * 说明提示的无障碍名称按属性规则翻译，译文相同
 */
export const ECOSYSTEM_DESCRIPTION: RegExpRule = [
  /^Pull requests that update ([\w.#+ -]{1,40}) code$/,
  (_, name: string) => joinName(joinName('更新', ECOSYSTEM_NAMES.get(name) ?? name), '程式碼的拉取請求'),
]

/**
 * 标签页：列表、排序、搜索、使用中 / 已封存切换、新建 / 编辑 / 删除 / 存档对话框、颜色选择器、按标签转换为讨论，
 * 以及 GitHub 与 Dependabot 默认标签的名称（标签名称区域）与说明（标签说明区域、static）。
 */
export default {
  static: {
    // 列表与头部
    'New label': '新增標籤',
    'Search all labels': '搜尋所有標籤',
    'Loading labels': '正在載入標籤',
    'Label actions': '標籤動作',
    'label actions': '標籤動作',
    'More label actions': '更多標籤動作',
    'Total issue count': '議題總數',
    'Oops we could not load the labels': '無法載入標籤',
    'Could not load data': '無法載入資料',
    'open pull requests': '個開放中的拉取請求',
    'open issues': '個開放中的議題',

    // 排序（与里程碑页的 Alphabetical 同译；Most issues、Fewest issues 见 milestones.ts）
    Alphabetically: '依字母順序',
    'Reverse alphabetically': '依字母倒序',

    // 空状态
    'There are no labels in this repository': '此儲存庫中沒有標籤',
    'Start creating labels using the "New Label" button.': '使用「新增標籤」按鈕開始建立標籤。',
    'There are no archived labels in this repository': '此儲存庫中沒有已封存的標籤',
    'Labels you archive will appear here.': '你封存的標籤會顯示在這裡。',
    'No matching labels': '沒有相符的標籤',
    'We couldn’t find any labels that match your filter. Please try again.': '找不到與篩選器相符的標籤。請再試一次。',
    "We couldn't find any labels that match your filter. Please try again.": '找不到與篩選器相符的標籤。請再試一次。',

    // 新建 / 编辑表单
    'Edit label': '編輯標籤',
    'Create label': '建立標籤',
    'Label name': '標籤名稱',
    'Label preview': '標籤預覽',
    'Optionally add a description': '可新增描述',
    'Maximum 50 characters': '最多 50 個字元',
    'Name is required': '名稱為必填',
    'Name must be 50 characters or fewer': '名稱不得超過 50 個字元',
    'Name has already been taken': '名稱已在使用中',
    'Description is too long (maximum is 100 characters)': '描述過長（上限為 100 個字元）',
    'Color is required': '顏色為必填',
    'Color is invalid': '顏色無效',
    'Color must be a valid hex color, such as #0969da': '顏色必須是有效的十六進位色碼，例如 #0969da',
    'Choose random color': '隨機選擇顏色',
    'Choose from default colors': '從預設顏色中選擇',
    'Could not update label': '無法更新標籤',
    'There was an error updating this label': '更新此標籤時發生錯誤',
    'You do not have permission to create labels in this repository': '你沒有在此儲存庫中建立標籤的權限',

    // 删除 / 存档
    'Permanently delete label': '永久刪除標籤',
    'Delete this label': '刪除此標籤',
    'Once you delete this label, you will not be able to see it again.': '刪除此標籤後，你將無法再看到它。',
    'Deleting this label will remove it from all issues and pull requests.':
      '刪除此標籤會將其從所有議題和拉取請求中移除。',
    'There was an error deleting the label. Please try again.': '刪除標籤時發生錯誤。請再試一次。',
    'Archive Label': '封存標籤',
    'There was an error archiving the label. Please try again.': '封存標籤時發生錯誤。請再試一次。',
    'There was an error removing the label from the archive. Please try again.': '取消封存標籤時發生錯誤。請再試一次。',
    "Don't show this again": '不再顯示',
    'Don’t show this again': '不再顯示',

    // 按标签将议题转换为讨论（标题的复数写法 Convert issues to discussions 见 scoped）
    'Convert to discussions': '轉換為討論',
    'Convert issue to discussion': '將議題轉換為討論',
    'Issue will be locked': '議題將會鎖定',
    'Existing links will redirect to the new discussion': '現有連結將重新導向至新討論',
    'You must choose a category for the discussion to belong to. You will be able to change this after the conversion is complete.':
      '你必須為討論選擇所屬類別。轉換完成後可以變更。',
    'Choose a category': '選擇類別',
    'I understand, convert issue to discussion': '我瞭解，將議題轉換為討論',
    'I understand, convert issues to discussions': '我瞭解，將議題轉換為討論',
    'Future issues with this label will not be automatically converted into discussions.':
      '之後加上此標籤的議題不會自動轉換為討論。',

    // 默认标签的说明：筛选框的标签建议、标签选择器里显示（标签区域里的同一说明见 LABEL_DESCRIPTIONS，两处译文相同）
    'Barrier affecting people with disabilities': '影響身心障礙者使用的障礙',
    "Something isn't working": '某些功能無法正常運作',
    'Something isn’t working': '某些功能無法正常運作',
    'Improvements or additions to documentation': '說明文件的改進或補充',
    'This issue or pull request already exists': '此議題或拉取請求已存在',
    'New feature or request': '新功能或功能請求',
    'Good for newcomers': '適合新手',
    'Extra attention is needed': '需要特別注意',
    "This doesn't seem right": '這似乎不對',
    'This doesn’t seem right': '這似乎不對',
    'Further information is requested': '需要更多資訊',
    'This will not be worked on': '不會處理',
    'Pull requests that update a dependency file': '更新相依性檔案的拉取請求',
  },
  scoped: {
    // 标签页的 Active / Archived 切换、议题侧栏迭代字段的分组标题：「正在使用」义作「使用中」（术语表 Active 行）
    Active: '使用中',
    Color: '顏色',
    'Delete failed': '刪除失敗',
    // 按标签转换的对话框标题（多个议题）；组织设置页另有同名权限名
    'Convert issues to discussions': '將議題轉換為討論',
  },
  regexp: [
    // 计数提示：20 open pull requests / 4 open issues（标签总数 59 labels 由通用词典处理）
    [/^([\d,]+) open pull requests?$/, '$1 個開放中的拉取請求'],
    [/^([\d,]+) open issues?$/, '$1 個開放中的議題'],
    // 标签行的无障碍名称：标签名 + 计数（计数的可见文字与提示文字被列表组件首尾相接；两段计数之间原文无标点，译文用空格隔开）
    // bug. 9 open pull requests9 open pull requests48 open issues48 open issues.（默认标签名与行里的标签令牌同译）
    [
      /^(.+?)\. (?=\d)(?:([\d,]+) open pull requests\2 open pull requests)?(?:([\d,]+) open issues\3 open issues)?\.$/,
      (_, name, pulls, issues) =>
        `${labelName(name)}。${[pulls ? `${pulls} 個開放中的拉取請求` : '', issues ? `${issues} 個開放中的議題` : ''].filter(Boolean).join(' ')}。`,
    ],
    // 存档确认（默认标签名与行里的标签令牌同译，自定义标签名原样保留）
    [
      /^Archiving hides "(.+)" so it can[’']t be added to discussions, issues, or pull requests\. It remains on anything that already uses it, and you can unarchive it any time\.$/,
      (_, name: string) =>
        `封存會隱藏「${labelName(name)}」，使其無法再加入討論、議題或拉取請求。已使用此標籤的項目會保留它，你可以隨時取消封存。`,
    ],
    // 颜色选择器：Red (#b60205)、Color: Red (#b60205)、Color: #ab12cd（括号内是色值，用半角括号并与中文隔开）
    [
      new RegExp(`^(${COLOR_NAME_SOURCE}) \\((${HEX_SOURCE})\\)$`),
      (_, name, hex) => `${COLOR_NAME[name] ?? name} (${hex})`,
    ],
    [
      new RegExp(`^Color: (${COLOR_NAME_SOURCE}) \\((${HEX_SOURCE})\\)$`),
      (_, name, hex) => `顏色：${COLOR_NAME[name] ?? name} (${hex})`,
    ],
    [new RegExp(`^Color: (${HEX_SOURCE})$`), '顏色：$1'],
    // 非预设颜色的色块按钮：Color: (#ab12cd)
    [new RegExp(`^Color: \\((${HEX_SOURCE})\\)$`), '顏色：($1)'],
  ],
  attributeRules: [
    // 标签页列表行的标签链接（忽略区域根）：无障碍名称是标签名，已存档的前加 Archived；默认标签与链接里的标签令牌同译，
    // 自定义标签名保持原文（结果与原文相同时保持原文）
    [
      '[class*="labelRowDescription__"] a[aria-label]',
      'aria-label',
      /^(?:(Archived) )?(.+)$/,
      (_, archived: string, name: string) => archivedLabelName(archived, name),
    ],
    // 标签页列表行的无障碍名称（没有打开的议题、拉取请求时只有标签名）：good first issue.（默认标签名同译）
    [
      'li[data-label-id]',
      'aria-label',
      new RegExp(`^(${LABEL_NAME_SOURCE})\\.$`),
      (_, name: string) => `${labelName(name)}。`,
    ],
  ],
  labels: LABEL_NAME_TABLE,
  labelDescriptions: LABEL_DESCRIPTIONS,
  labelRegexp: [ECOSYSTEM_DESCRIPTION],
} satisfies PageDictionary
