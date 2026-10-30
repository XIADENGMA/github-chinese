import type { PageDictionary } from '../../../core/types'
import { joinCjk } from '../helpers'

/**
 * 项目（新版 Projects）：字段。
 * 系统字段与模板默认字段名、字段类型、新建字段对话框、字段设置页、单选 / 迭代选项、
 * 议题字段导入、默认值、字段排序、删除字段与删除选项。
 */

/** 系统字段与模板默认字段名 → 译文；用于表头、分组、筛选等拼接文本 */
export const FIELD_NAMES: Readonly<Record<string, string>> = {
  Title: '標題',
  Assignees: '負責人',
  Status: '狀態',
  Labels: '標籤',
  'Linked pull requests': '已連結的拉取請求',
  Milestone: '里程碑',
  Repository: '儲存庫',
  Reviewers: '審查者',
  'Parent issue': '父議題',
  'Sub-issues progress': '子議題進度',
  Type: '類型',
  'Issue type': '議題類型',
  Created: '建立時間',
  Updated: '更新時間',
  Closed: '關閉時間',
  Iteration: '迭代',
  Estimate: '預估',
  Priority: '優先順序',
  Size: '大小',
  'Start date': '開始日期',
  'Target date': '目標日期',
  'End date': '結束日期',
}

const FIELD_NAMES_LOWER = new Map(Object.entries(FIELD_NAMES).map(([name, zh]) => [name.toLowerCase(), zh]))

/** 已知字段名返回译文（不区分大小写），其余（用户自定义字段）原样返回 */
export function translateFieldName(name: string): string {
  return FIELD_NAMES[name] ?? FIELD_NAMES_LOWER.get(name.toLowerCase()) ?? name
}

/** 字段名正则片段（不含捕获组），长名在前 */
export const FIELD_NAME_SOURCE = Object.keys(FIELD_NAMES)
  .sort((a, b) => b.length - a.length)
  .map((name) => name.replace(/[.*+?^${}()|[\]\\-]/g, '\\$&'))
  .join('|')

/** 拼接用户字段名后，在中文与英文 / 数字之间补空格 */
export function pangu(text: string): string {
  return text.replace(/([一-鿿])([A-Za-z0-9])/g, '$1 $2').replace(/([A-Za-z0-9])([一-鿿])/g, '$1 $2')
}

const VALUE_NOUNS: Readonly<Record<string, string>> = {
  option: '選項',
  options: '選項',
  iteration: '迭代',
  iterations: '迭代',
  'iteration value': '迭代值',
  'iteration values': '迭代值',
  value: '值',
  values: '值',
}

function valueNoun(noun: string): string {
  return VALUE_NOUNS[noun] ?? noun
}

const NOUN_SOURCE = '(?:option|options|iteration|iterations|value|values)'

export default {
  static: {
    // 字段菜单（Visible fields 与议题视图共用，由 issues 词典收录）
    'New field': '新增欄位',
    'Hidden fields': '隱藏的欄位',
    'Add field': '新增欄位',
    'Project fields': '專案欄位',
    'Manage fields...': '管理欄位...',
    'Create a new field configuration': '建立新的欄位設定',
    'Field name': '欄位名稱',
    'Field type': '欄位類型',
    'Field name is required.': '欄位名稱為必填。',
    "Field name can't contain colons": '欄位名稱不能包含冒號',
    'This field name has already been taken': '此欄位名稱已被使用',
    'This field name is a reserved word': '此欄位名稱是保留字',
    'Error: At least one valid option is required for the status field': '錯誤：狀態欄位至少需要一個有效選項',
    'At least one option is required for the select type fields': '選擇類欄位至少需要一個選項',
    'Column options failed to update.': '無法更新欄選項。',
    'Single select': '單選',
    'Multi select': '多選',
    'Choose an iteration…': '選擇迭代…',
    'Choose an option…': '選擇選項…',
    'Date editor': '日期編輯器',
    'Number editor': '數字編輯器',
    'Text editor': '文字編輯器',
    'This field must be an integer': '此欄位必須為整數',
    'This field must be positive or 0.': '此欄位必須為正數或 0。',

    // 字段设置页
    'Custom fields': '自訂欄位',
    'Custom field options': '自訂欄位選項',
    'Reorder fields': '調整欄位順序',
    'Reorder custom fields': '調整自訂欄位順序',
    'Reorder fields list': '欄位順序清單',
    'Reorder custom fields list': '自訂欄位順序清單',
    'Change the order in which fields appear on project items and in field lists.':
      '變更欄位在專案項目和欄位清單中的顯示順序。',
    'Change the order in which custom fields appear on project items and in field lists.':
      '變更自訂欄位在專案項目和欄位清單中的顯示順序。',
    'appear on project items and in field lists.': '在專案項目和欄位清單中的顯示順序。',
    'No fields are available to reorder.': '沒有可調整順序的欄位。',
    'No sortable columns available. Only custom fields can be reordered.': '沒有可排序的欄。只能調整自訂欄位的順序。',
    'Move field...': '移動欄位...',
    'Edit field': '編輯欄位',
    'Issue field': '議題欄位',
    // 字段设置页的说明：链接版由下方 inline 规则整句译出，无链接时三个文本节点相邻、按整句匹配
    'Issue fields can only be edited in the': '議題欄位只能在以下位置編輯',
    "Issue fields can only be edited in the project owner's settings.": '議題欄位只能在專案擁有者的設定中編輯。',
    'Remove field': '移除欄位',
    'Delete field': '刪除欄位',
    'This field no longer exists': '此欄位已不存在',
    'Select another field to view settings.': '選擇其他欄位以查看設定。',
    'New items added to the project will automatically have this value set for this field.':
      '新加入專案的項目會自動將此欄位設為此值。',

    // 删除 / 移除字段
    'Delete field?': '刪除欄位？',
    'Remove field from project?': '從專案移除欄位？',
    'Permanently delete data from this project?': '永久刪除此專案中的資料？',
    'from this project, but it will remain on existing issues.': '從此專案中移除，但會保留在現有議題上。',
    'You can add it back to the project anytime.': '你可以隨時將它重新加入專案。',
    'Delete field and data': '刪除欄位和資料',

    // 单选选项
    'Single select options': '單選選項',
    'Add option': '新增選項',
    'Add option…': '新增選項…',
    'Option has already been taken': '此選項已存在',
    'Option names cannot contain ","': '選項名稱不能包含「,」',
    'Edit option': '編輯選項',
    'New option': '新增選項',
    'Edit option dialog': '編輯選項對話方塊',
    'New option dialog': '新增選項對話方塊',
    'Advanced Move...': '進階移動...',
    'Remove option': '移除選項',
    'Create new option': '建立新選項',
    'Visible in group headers and value pickers': '顯示在群組標題和值選擇器中',

    // 进度字段
    'Segmented bar': '分段橫條圖',
    'Progress visualization variant': '進度顯示樣式',
    'Show numerical value': '顯示數值',

    // 迭代
    'Duration quantity': '持續時間數值',
    'Add iteration': '新增迭代',
    'Add new iteration configuration': '新增迭代設定',
    'Active iterations': '使用中的迭代',
    'Completed iterations': '已完成的迭代',
    'Insert break': '插入間隔',
    'Insert break above': '在上方插入間隔',
    'Insert break below': '在下方插入間隔',
    'Edit iteration name': '編輯迭代名稱',
    "You're out of iterations.": '迭代已用完。',
    'Create an iteration using the "+ Add iteration" button above.': '使用上方的「+ 新增迭代」按鈕建立迭代。',
    'No completed iterations.': '沒有已完成的迭代。',
    'Iterations will automatically move here over time.': '迭代會隨時間自動移到這裡。',
    'Iteration length cannot be blank': '迭代長度不能空白',
    'Iteration not found': '找不到迭代',
    'Create an iteration': '建立迭代',
    'Create an Iteration': '建立迭代',

    // 议题字段
    'Add issue fields': '新增議題欄位',
    'Introducing issue fields 🗂️': '全新議題欄位 🗂️',
    'Add issue fields to keep information consistent across your issues.': '新增議題欄位以保持各議題的資訊一致。',
    'Close issue field quick add actions': '關閉議題欄位快速新增',
    'See more fields': '查看更多欄位',
    'This field conflicts with an issue field. Rename this field.': '此欄位與議題欄位衝突。請重新命名此欄位。',
    'No Issue Fields available': '沒有可用的議題欄位',
    "All issue fields have restricted visibility and can't be added to this project.":
      '所有議題欄位都因可見度受限而無法加入此專案。',
    'All available Issue Fields have been added to this project.': '所有可用的議題欄位都已加入此專案。',
    "Issue fields can be created in the project owner's settings.": '可在專案擁有者的設定中建立議題欄位。',
    'Manage Issue Fields': '管理議題欄位',
    'Some issue fields are not available because of their visibility settings.': '部分議題欄位因可見度設定而無法使用。',
    'Rename duplicate field': '重新命名重複的欄位',
    'Field limit reached': '已達欄位數量上限',
    'No fields selected': '未選取欄位',
    'Too many fields selected': '選取的欄位過多',
    'Unable to add selected fields': '無法新增選取的欄位',
    'Select at least one field to continue.': '至少選取一個欄位才能繼續。',
    'Something went wrong adding fields.': '新增欄位時發生錯誤。',
    'Manage fields': '管理欄位',
    'Projects cannot have more than 50 fields': '專案最多只能有 50 個欄位',

    // 议题类型设置
    'Set up issue types in your project': '在專案中設定議題類型',
    'Rename field': '重新命名欄位',
    'Selecting the type field on a project, and applying Epic, Feature, and Task to project items':
      '在專案中選取類型欄位，並為專案項目套用 Epic、Feature 和 Task',
    'New timestamp fields available': '可使用新的時間戳記欄位',
    'You can now add Created, Closed, and Updated timestamp fields to your project to track when issues and pull requests were created, closed, or last updated.':
      '現在可以為專案新增建立時間、關閉時間和更新時間欄位以追蹤議題和拉取請求的建立、關閉或上次更新時間。',
  },
  scoped: {
    // 通用文本（仅项目页生效）
    'Save and create': '儲存並建立',
    'Title cannot be blank': '標題不能空白',
    'Created at': '建立時間',
    'Updated at': '更新時間',
    'Closed at': '關閉時間',
    'Sub-issues progress': '子議題進度',
    'Linked pull requests': '已連結的拉取請求',
    'No linked pull requests': '沒有已連結的拉取請求',
    'Enter a number…': '輸入數字…',
    'Enter text…': '輸入文字…',
    'Enter a date…': '輸入日期…',
    'Change the order in which': '變更',
    "Reorder couldn't be saved": '無法儲存順序',
    "project owner's settings": '專案擁有者的設定',
    'Default value': '預設值',
    'Enter default text': '輸入預設文字',
    'Enter default number': '輸入預設數字',
    'Action required': '需要採取動作',
    'Changes saved. Return to': '已儲存變更。返回',
    'and remove its data from': '並從以下位置移除其資料',
    'This cannot be undone.': '此動作無法復原。',
    'Warning:': '警告：',
    'Label text': '標籤文字',
    'Label text is required': '標籤文字為必填',
    'Set as default': '設為預設',
    'Unset as default': '取消設為預設',
    'Filter options': '篩選選項',
    'Starts on': '開始於',
    'Naming conflict': '名稱衝突',
    'Learn more about issue types.': '瞭解議題類型。',
    'I’ll do it later': '稍後再說',
    'Finish setup': '完成設定',
    'Issues create dialog with issue type selection': '含議題類型選項的建立議題對話方塊',
    // 系统字段与模板默认字段（与其他页面共用的词，用 scoped 避免冲突）
    Title: '標題',
    Assignees: '負責人',
    Labels: '標籤',
    Milestone: '里程碑',
    Reviewers: '審查者',
    'Parent issue': '父議題',
    Type: '類型',
    Created: '建立時間',
    Updated: '更新時間',
    Iteration: '迭代',
    Estimate: '預估',
    Priority: '優先順序',
    Size: '大小',
    'Start date': '開始日期',
    'Target date': '目標日期',
    'End date': '結束日期',
    'Issue type': '議題類型',
    // 字段类型与设置
    Number: '數字',
    Date: '日期',
    Text: '文字',
    Options: '選項',
    Default: '預設',
    Color: '顏色',
    Bar: '橫條圖',
    Ring: '環形圖',
    Fields: '欄位',
    'custom fields': '自訂欄位',
    fields: '欄位',
    'Saved!': '已儲存！',
    Added: '已加入',
    Rename: '重新命名',
    Resolve: '解決',
    'Get Started': '開始使用',
    'Got it': '我知道了',
    // 迭代
    Duration: '持續時間',
    day: '天',
    days: '天',
    week: '週',
    weeks: '週',
    Current: '目前',
    Planned: '已規劃',
    Completed: '已完成',
    Active: '使用中',
    'Remove item': '移除',
  },
  regexp: [
    // 字段设置页（字段名原文没有引号，译文也不加；中英文之间由 pangu / joinCjk 补空格；原文没有的逗号不加）
    [/^(.+) field settings$/, (_, name: string) => pangu(`${translateFieldName(name)}欄位設定`)],
    [
      /^(.+) fields are created by GitHub and cannot be renamed\.$/,
      (_, name: string) => pangu(`${translateFieldName(name)}欄位由 GitHub 建立且無法重新命名。`),
    ],
    // 原文是 field actions；去掉引号后「開啟狀態的動作」有歧义，补「欄位」：開啟狀態欄位的動作
    [
      /^Open field actions for (.+)$/,
      (_, name: string) => joinCjk(joinCjk('開啟', translateFieldName(name)), '欄位的動作'),
    ],
    [/^Move field (.+)$/, (_, name: string) => joinCjk('移動欄位', translateFieldName(name))],
    [new RegExp(`^(${FIELD_NAME_SOURCE}) options$`), (_, name: string) => `${translateFieldName(name)}選項`],
    [/^Add ([a-z][\w -]*)…$/, (_, name: string) => pangu(`新增${translateFieldName(name)}…`)],

    // 删除 / 移除字段（原文的 “” 转成「」；带数据的整句由下方 inline 规则译出，不构成行内句时按首段翻译）
    [
      /^This will delete the field “(.+)”(\.)?$/,
      (_, name: string, dot?: string) => `這將刪除欄位「${translateFieldName(name)}」${dot ? '。' : ''}`,
    ],
    [
      /^This will delete the field “(.+)” and remove its data from$/,
      (_, name: string) => `這將刪除欄位「${translateFieldName(name)}」並從以下位置移除其資料`,
    ],
    [
      /^This will remove the field “(.+)” from this project, but it will remain on existing issues\.$/,
      (_, name: string) => `這將從此專案中移除欄位「${translateFieldName(name)}」，但會保留在現有議題上。`,
    ],
    [/^This will remove the field “(.+)”$/, (_, name: string) => `這將移除欄位「${translateFieldName(name)}」`],
    [/^(\d+) items?$/, '$1 個項目'],
    [/^(\d+) workflows?$/, '$1 個工作流程'],

    // 单选选项（选项名是用户内容，原文没有引号，译文也不加）
    [/^Open edit dialog for (.+)$/, (_, name: string) => joinCjk(joinCjk('開啟', name), '的編輯對話方塊')],
    [/^Advanced move (.+)\.\.\.$/, (_, name: string) => `${joinCjk('進階移動', name)}...`],
    [/^Set (.+) as default$/, (_, name: string) => joinCjk(joinCjk('將', name), '設為預設')],
    [/^Unset (.+) as default$/, (_, name: string) => joinCjk(joinCjk('取消將', name), '設為預設')],
    [/^Maximum of (\d+) options reached$/, '已達 $1 個選項的上限'],
    [/^Label text must be (\d+) characters or fewer$/, '標籤文字不能超過 $1 個字元'],
    [/^Description must be (\d+) characters or fewer$/, '描述不能超過 $1 個字元'],

    // 迭代
    [/^Iteration length must be (\d+) or more$/, '迭代長度不能少於 $1'],
    [/^Iteration length must be (\d+) or less$/, '迭代長度不能超過 $1'],
    [/^(\d+) Active$/, '使用中 $1'],
    [/^(\d+) Completed$/, '已完成 $1'],
    [/^(\d+) active iterations? will also be pushed forward\.$/, '$1 個使用中的迭代也會順延。'],
    // 读屏播报（iteration-field-options.tsx）：Return to 后是项目标题（用户内容），原样保留、不加引号
    [/^Changes saved\. Return to (.+)\.$/, (_, title: string) => `${joinCjk('已儲存變更。返回', title)}。`],

    // 删除选项 / 迭代（未参与匹配的捕获组为空字符串）
    [
      new RegExp(`^Delete (?:(${NOUN_SOURCE})|(\\d+) (${NOUN_SOURCE}))(\\?)?$`),
      (_, single: string, count: string, plural: string, mark: string) =>
        `刪除${count ? ` ${count} 個` : ''}${valueNoun(single || plural)}${mark ? '？' : ''}`,
    ],
    [
      /^This will permanently delete (?:this|these) (option|options|iteration|iterations|value|values|iteration value|iteration values) from the "(.+)" field and will impact everyone using this project\.$/,
      (_, noun: string, field: string) =>
        `這將從「${translateFieldName(field)}」欄位中永久刪除所選${valueNoun(noun)}並影響所有使用此專案的人。`,
    ],
    [
      new RegExp(`^The ${NOUN_SOURCE} will be permanently deleted from (\\d+) items? in this project\\.$`),
      '將從此專案的 $1 個項目中永久刪除。',
    ],
    [
      new RegExp(`^The ${NOUN_SOURCE} will be permanently deleted from any items in this project\\.$`),
      '將從此專案的所有項目中永久刪除。',
    ],
    [
      /^(?:This iteration value|These iteration values) will be removed from (\d+) items? in this project\.$/,
      '將從此專案的 $1 個項目中移除。',
    ],
    [
      /^(?:This iteration value|These iteration values) will be removed from any items in this project\.$/,
      '將從此專案的所有項目中移除。',
    ],
    [
      new RegExp(
        `^(?:This|These) (${NOUN_SOURCE}) (?:is|are) used in (\\d+) workflows?\\. Deleting (?:it|them) will disable the workflows? and invalidate any actions referencing (?:it|them)\\.$`,
      ),
      (_, noun: string, count: string) =>
        `${count} 個工作流程正在使用所選${valueNoun(noun)}。刪除後會停用相關工作流程並使引用它的動作失效。`,
    ],

    // 议题字段（字段名原文没有引号，译文也不加；两句之间随原文用句号）
    [
      /^Use issue fields defined by (.+) to keep information consistent across projects\.$/,
      '使用 $1 定義的議題欄位以保持各專案的資訊一致。',
    ],
    [
      /^Add (.+) field to project$/,
      (_, name: string) => joinCjk(joinCjk('將', translateFieldName(name)), '欄位加入專案'),
    ],
    [/^(.+) field added to project$/, (_, name: string) => joinCjk(translateFieldName(name), '欄位已加入專案')],
    [
      /^Could not add (.+) field to project\. Please try again\.$/,
      (_, name: string) => `${joinCjk(joinCjk('無法將', translateFieldName(name)), '欄位加入專案')}。請再試一次。`,
    ],
    [
      /^In order to add the "(.+)" issue field, you need to rename your project field\.$/,
      '若要新增「$1」議題欄位，必須先重新命名專案欄位。',
    ],
    [/^Rename project field "(.+)"$/, '重新命名專案欄位「$1」'],
    [
      /^You already have (\d+) fields in your project\. Remove some in order to add more fields\.$/,
      '專案已有 $1 個欄位。移除部分欄位後才能新增更多欄位。',
    ],
    [
      /^You can only add (\d+) at a time\. Deselect some fields to continue\.$/,
      '一次最多只能新增 $1 個。取消選取部分欄位後才能繼續。',
    ],
    [
      /^You already have (\d+) fields in your project\. Adding these would exceed the (\d+)-field limit\.$/,
      '專案已有 $1 個欄位。新增這些欄位會超過 $2 個欄位的上限。',
    ],
    [/^Issue fields can only be applied to issues within the (.+) organization$/, '議題欄位只能套用於 $1 組織內的議題'],

    // 议题类型设置（原文右引号误用为左引号 “）
    [
      /^Rename your “(.+)[“”] custom field and start using issue types defined by your organization\.$/,
      '重新命名自訂欄位「$1」並開始使用組織定義的議題類型。',
    ],
    [
      /^To start using issue types in your project, please rename your “(.+)[“”] custom field and update any filters that reference it\.$/,
      '若要在專案中使用議題類型，請重新命名自訂欄位「$1」並更新引用它的篩選器。',
    ],
  ],
  inline: [
    // 删除字段对话框（delete-field-dialog.tsx）：<p>This will delete the field “字段” and remove its data from <strong>3 items</strong> and <strong>2 workflows</strong>.</p>
    // 只有项或只有工作流时一个槽位，两者都有时两个槽位；槽位内是「3 個項目」「2 個工作流程」（数字开头、中文结尾），
    // 译文只在槽位前留空格，原文没有的逗号不加。不构成行内句时按上方 regexp 的首段翻译
    [
      /^This will delete the field “(.+)” and remove its data from \{\}\.$/,
      (_, name: string) => `這將刪除欄位「${translateFieldName(name)}」並從 {}中移除其資料。`,
    ],
    [
      /^This will delete the field “(.+)” and remove its data from \{\} and \{\}\.$/,
      (_, name: string) => `這將刪除欄位「${translateFieldName(name)}」並從 {}和 {}中移除其資料。`,
    ],
    // 字段设置页议题字段的说明（column-settings-view.tsx）：<span>Issue fields can only be edited in the <a>project owner's settings</a>.</span>
    ['Issue fields can only be edited in the {}.', '議題欄位只能在{}中編輯。'],
  ],
} satisfies PageDictionary
