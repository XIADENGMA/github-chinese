import type { PageDictionary } from '../../../core/types'
import { joinCjk } from '../helpers'
import { translateOptionName } from './templates'

/**
 * 项目（新版 Projects）：工作流。
 * 默认工作流名称、工作流编辑器（触发条件、操作块、筛选器校验）、自动添加 / 自动存档确认、
 * 代理自动分配、看板列上的工作流指示。
 */

/** 默认工作流名称（服务端数据，可被用户改名） */
export const WORKFLOW_NAMES: Readonly<Record<string, string>> = {
  'Item added to project': '項目已加入專案',
  'Item reopened': '項目已重新開啟',
  'Item closed': '項目已關閉',
  'Code changes requested': '已要求程式碼變更',
  'Code review approved': '程式碼審查已核准',
  'Pull request merged': '拉取請求已合併',
  'Pull request linked to issue': '拉取請求已連結到議題',
  'Auto-archive items': '自動封存項目',
  'Auto-add to project': '自動加入專案',
  'Auto-close issue': '自動關閉議題',
  'Auto-add sub-issues to project': '自動將子議題加入專案',
  'Item added': '項目已加入'
}

function workflowName(name: string): string {
  return WORKFLOW_NAMES[name] ?? name
}

const TIME_UNITS: Readonly<Record<string, string>> = {
  minute: '分鐘',
  hour: '小時',
  day: '天'
}

export default {
  static: {
    // 工作流编辑器
    'Save and turn on workflow': '儲存並開啟工作流程',
    'Save workflow': '儲存工作流程',
    'Viewing mode. Click edit to make changes to this workflow.': '檢視模式。按一下編輯以修改此工作流程。',
    'A workflow with this name already exists': '已有同名的工作流程',
    'An empty filter will match all newly created and updated Issues and Pull Requests':
      '篩選器空白時會與所有新建立或更新的議題和拉取請求相符',
    'Workflow name cannot be empty': '工作流程名稱不可空白',
    'A valid field is required': '需要有效的欄位',
    'A query or a field id is required': '需要查詢或欄位 ID',
    'Workflow name cannot be longer than 250 characters': '工作流程名稱不能超過 250 個字元',
    'Add the item to the project': '將項目加入專案',
    'Add sub-issues to the project': '將子議題加入專案',
    'When the filter matches a new or updated item': '新增或更新的項目與篩選器相符時',
    'When an item in the project has sub-issues': '專案中的項目有子議題時',
    'When an item is added to the project': '項目加入專案時',
    'When an item is reopened': '項目重新開啟時',
    'When an item is closed': '項目關閉時',
    'When a pull request has a review requesting changes': '拉取請求有要求變更的審查時',
    'When a pull request is approved': '拉取請求獲得核准時',
    'When a pull request is merged': '拉取請求合併時',
    'When a pull request is linked to an issue': '拉取請求連結到議題時',
    'When the status is updated': '狀態更新時',
    'Going forward, all new or updated items that match your filter will be auto added. You can also manually add items that currently match your filter':
      '今後所有與篩選器相符的新增或更新項目都會自動加入。你也可以手動加入目前與篩選器相符的項目',
    'Link to GitHub Docs page about adding multiple issues or pull requests to a project':
      '關於將多個議題或拉取請求加入專案的 GitHub 說明文件頁面連結',
    'Enabling this workflow will automatically add sub-issues in the following scenarios:': '啟用此工作流程會在下列情況自動加入子議題：',
    'When a sub-issue is added to an issue in the project': '專案中的議題新增了子議題時',
    'When an issue with sub-issues is added to the project': '有子議題的議題加入專案時',
    'Note: This workflow will initially add all existing sub-issues of issues in the project.':
      '注意：此工作流程首次執行時會加入專案中議題的所有現有子議題。',
    'existing items that match this query': '個與此查詢相符的現有項目',
    'Something went wrong loading this workflow configuration.': '載入此工作流程設定時發生錯誤。',
    'Workflow list': '工作流程清單',
    'No workflows': '沒有工作流程',
    'Open workflow options': '開啟工作流程選項',
    'Edit workflow name': '編輯工作流程名稱',
    'Workflow name': '工作流程名稱',
    'Default workflows': '預設工作流程',
    'Configure workflows': '設定工作流程',
    'Select a content type': '選擇內容類型',

    // 启用 / 更新确认
    'Update workflow': '更新工作流程',
    'Update workflow?': '要更新工作流程嗎？',
    'Disable workflow?': '要停用工作流程嗎？',
    'Enable workflow?': '要啟用工作流程嗎？',
    'You have to disable this workflow to be able to edit this field.': '必須先停用此工作流程才能編輯此欄位。',
    'Updating this workflow will archive': '更新此工作流程將封存',
    'Enabling this workflow will archive': '啟用此工作流程將封存',
    'items that currently meet the filter conditions.': '個目前符合篩選條件的項目。',
    'item that currently meet the filter conditions.': '個目前符合篩選條件的項目。',
    'As future items match filter conditions, they will be automatically archived.': '日後符合篩選條件的項目也會自動封存。',

    // 删除 / 新建 / 复制工作流
    'Could not delete workflow, please try again': '無法刪除工作流程，請再試一次',
    'Workflow deleted': '已刪除工作流程',
    'Delete workflow': '刪除工作流程',
    'Are you sure you want to delete this workflow? This action cannot be undone.': '確定要刪除此工作流程嗎？此動作無法復原。',
    'New auto-add workflow': '新增自動加入工作流程',
    'Duplicate workflow': '複製工作流程',
    'New workflow': '新增工作流程',
    'Maximum number of auto-add workflows reached. Delete a workflow or upgrade your plan to continue.':
      '自動加入工作流程的數量已達上限。刪除工作流程或升級方案後才能繼續。',

    // 代理自动分配（原文没有的逗号不加）
    'Auto-assign issues to agent': '自動將議題指派給代理',
    'Assigns maximum 5 agents at once. Respects column limits.': '一次最多指派 5 個代理。遵守欄上限。',
    'The agent assigned to work on issues in this project': '負責處理此專案議題的代理',
    'The configured model is no longer available. Future auto-assign runs will use the default model until a valid model is selected.':
      '所設定的模型已無法使用。選擇有效模型之前自動指派將使用預設模型。',
    'Source column': '來源欄',
    'Auto-assign to agent': '自動指派給代理',
    'Auto-assign enabled': '已啟用自動指派',
    'Auto-assign disabled': '已停用自動指派',
    'Add auto-assign workflow': '新增自動指派工作流程',
    'Pause auto-assign': '暫停自動指派',
    'Enable auto-assign': '啟用自動指派'
  },
  scoped: {
    // 默认工作流名称
    ...WORKFLOW_NAMES,
    // 通用文本（仅项目页生效）
    'Filter cannot be empty': '篩選器不可空白',
    'A valid value is required': '需要有效的值',
    'An action is required': '需要設定動作',
    'A type is required': '需要類型',
    'A query is required': '需要查詢',
    'A repository is required': '需要儲存庫',
    'A value is required': '需要值',
    'Filter contains invalid syntax': '篩選器包含無效的語法',
    'Close the issue': '關閉議題',
    'Save and enable': '儲存並啟用',
    'Assign agent': '指派代理',
    'starts and moves to': '開始並移到',
    'The AI model used by the agent to complete work': '代理完成工作所使用的 AI 模型',
    'Select a repository to choose a specific model': '選擇儲存庫後才能指定模型',
    'Filter models': '篩選模型',
    'The repository the agent will work in. Set to auto-detect from the issue': '代理工作所在的儲存庫。設為根據議題自動偵測',
    'Set by issue': '由議題決定',
    'Additional instructions for this agent': '給此代理的額外指示',
    'Provide additional instructions for the agent': '為代理提供額外指示',
    'Prompt cannot be longer than 4000 characters': '提示不能超過 4000 個字元',
    Workflows: '工作流程',
    'is added': '已加入',
    // 「篩選項目」易读作名词（筛选条件），写全「專案項目」
    'Filter items': '篩選專案項目',
    'Set value': '設定值',
    'Archive item': '封存項目',
    'Oops!': '糟糕！',
    See: '查看',
    Recommended: '推薦',
    Model: '模型',
    Auto: '自動',
    Prompt: '提示',
    On: '開啟',
    Off: '關閉',
    Pause: '暫停',
    Enable: '啟用',
    Disabled: '已停用'
  },
  regexp: [
    // 复制的工作流名：Duplicate of Item closed。只接大写或数字开头的名称，避开议题关闭菜单的 Duplicate of another issue
    [/^Duplicate of ([A-Z0-9].*)$/, (_, name: string) => joinCjk(workflowName(name), '的副本')],
    [/^See (\d+) existing items that match this query$/, '查看 $1 個與此查詢相符的現有項目'],
    [/^(\d+) items? match(?:es)? this query$/, '$1 個項目與此查詢相符'],
    // 原文没有逗号，译文也不加
    [
      /^Using the (.+) operator means that your workflow will run every (\d+) (minutes?|hours?|days?)$/,
      (_, field: string, value: string, unit: string) =>
        `使用 ${field} 運算子時工作流程每 ${value} ${TIME_UNITS[unit.replace(/s$/, '')] ?? unit}執行一次`
    ],
    // 看板列上的工作流指示（strings.ts 的 columnWorkflowIndicator*，for 后都是列名）：列名原文没有引号，译文也不加
    [/^Workflows for (.+)$/, (_, column: string) => joinCjk(translateOptionName(column), '欄的工作流程')],
    [
      /^(\d+) workflows configured for (.+)$/,
      (_, count: string, column: string) => joinCjk(translateOptionName(column), `欄已設定 ${count} 個工作流程`)
    ],
    [
      /^Auto-assign (enabled|disabled) for (.+)$/,
      (_, state: string, column: string) => joinCjk(translateOptionName(column), `欄的自動指派${state === 'enabled' ? '已啟用' : '已停用'}`)
    ],
    // 工作流名不含句末标点，且不以 is / are / been 等结尾，避免误配普通句子。
    // 两个译名相连无法断句，改语序并补「欄」「工作流程」：已為已完成欄啟用項目已關閉工作流程
    [
      /^([^.,:;!?]+?)(?<! (?:is|are|was|were|been|be)) (enabled|disabled) for ([^.,:;!?]+)$/,
      (_, name: string, state: string, column: string) =>
        joinCjk(
          joinCjk(joinCjk('已為', translateOptionName(column)), `欄${state === 'enabled' ? '啟用' : '停用'}`),
          joinCjk(workflowName(name), '工作流程')
        )
    ],
    // 状态字段设置页：Item added to project: Active
    [
      /^(Item added to project|Item added): (Active|Disabled)$/,
      (_, name: string, state: string) => `${workflowName(name)}：${state === 'Active' ? '已啟用' : '已停用'}`
    ]
  ]
} satisfies PageDictionary
