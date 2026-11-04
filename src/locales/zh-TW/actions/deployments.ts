import type { PageDictionary } from '../../../core/types'
import { DEPLOYMENT_PHASES, DEPLOYMENT_STATES, deploymentStatus } from './format'

/**
 * 部署与环境：部署列表（/deployments）、环境页、筛选栏（含高级筛选对话框）。
 */

/** 安全取值：避免 constructor 等原型链键命中 */
function pick(map: Readonly<Record<string, string>>, key: string): string | undefined {
  return Object.hasOwn(map, key) ? map[key] : undefined
}

function alternation(map: Readonly<Record<string, string>>): string {
  return Object.keys(map)
    .sort((a, b) => b.length - a.length)
    .join('|')
}

const STATE_SOURCE = alternation(DEPLOYMENT_STATES)
const PHASE_SOURCE = alternation(DEPLOYMENT_PHASES)

/** 状态图标的无障碍名称：Deployment success */
const ICON_STATES: Readonly<Record<string, string>> = {
  success: '成功',
  failure: '失敗',
  error: '錯誤',
  inactive: '非作用中',
  pending: '擱置中',
  queued: '已排入佇列',
  in_progress: '進行中',
  'in progress': '進行中',
  waiting: '等待中',
  abandoned: '已放棄',
  destroyed: '已銷毀'
}

export default {
  static: {
    'All deployments': '所有部署',
    'Deployment views': '部署檢視',
    'Deployment environments': '部署環境',
    'Open Deployment environments': '開啟部署環境',
    'Environment management': '環境管理',
    'Filter environments': '篩選環境',
    'Filter environments...': '篩選環境...',
    'Filter environments…': '篩選環境…',
    'Manage environments': '管理環境',
    // 状态用「已＋动词」：pinned → 已釘選（「釘選環境」易误读成动作）
    'Latest deployments from pinned environments': '已釘選環境的最新部署',
    'Latest deployments': '最新部署',
    'Latest deployment': '最新部署',
    'Active deployments': '作用中的部署',
    'Deployment history': '部署歷史記錄',
    'View deployment': '查看部署',
    'Your search did not match any deployments': '沒有與搜尋相符的部署',
    'Filter deployments': '篩選部署',
    'Deployed to': '已部署到',
    'Failed to deploy to': '無法部署到',
    'View workflow run': '查看工作流程執行',
    '/ History': '/ 歷史記錄',
    'More list item action bar': '更多動作',
    'Text will be ignored since log searching is not yet available:': '因尚不支援記錄搜尋而忽略以下文字：'
  },

  scoped: {
    'View logs': '查看記錄',
    'Try a different search query': '嘗試其他搜尋字詞',
    deployed: '部署於',
    'deployed by': '部署者',
    'Deployed by': '部署者',
    // Last deployed <时间>：上次部署於 3 天前
    Last: '上次',
    Active: '作用中',
    Abandoned: '已放棄',
    Destroyed: '已銷毀',
    error: '錯誤',
    abandoned: '已放棄',
    destroyed: '已銷毀',
    in_progress: '進行中',
    'in progress': '進行中',
    waiting: '等待中',

    // 筛选栏与高级筛选对话框
    State: '狀態',
    Creator: '建立者',
    Environment: '環境',
    Ref: '參考',
    Text: '文字',
    Qualifier: '限定詞',
    Operator: '運算子',
    'is one of': '是下列其中之一',
    'is not one of': '不是下列其中之一',
    is: '是',
    Value: '值',
    'Filter values': '篩選值',
    Me: '我',
    'Signed-in user': '已登入的使用者',
    'Empty value for': '下列限定詞的值為空',
    before: '早於',
    after: '晚於',
    'before and including': '早於或等於',
    'after and including': '晚於或等於',
    between: '介於',
    Has: '有',
    Exclude: '排除',
    Created: '建立時間'
  },

  regexp: [
    [/^([\d,]+) deployments?$/, '$1 個部署'],
    [/^via (.+) #(\d+)$/, '透過 $1 #$2'],
    [/^View deployment to (.+)$/, '查看 $1 的部署'],
    [/^(Pin|Unpin) (.+) environment$/, (_, action: string, name: string) => `${action === 'Pin' ? '釘選' : '取消釘選'} ${name} 環境`],
    [new RegExp(`^Deployment (${alternation(ICON_STATES)})$`), (_, state: string) => `部署${pick(ICON_STATES, state) ?? state}`],
    // 列表条目：Status: Deployed (completed).
    [
      new RegExp(`^Status: (${STATE_SOURCE}) \\((${PHASE_SOURCE})\\)\\.$`),
      (_, state: string, phase: string) => `${deploymentStatus(state, phase)}。`
    ],
    // 列表条目的无障碍名称：标题: Status: Deployed (completed). More information available below.
    [
      new RegExp(`^(?:(.+): )?Status: (${STATE_SOURCE}) \\((${PHASE_SOURCE})\\)\\. More information available below\\.$`),
      (_, title: string, state: string, phase: string) => `${title ? `${title}：` : ''}${deploymentStatus(state, phase)}。下方有更多資訊。`
    ],
    // 名词 Filter 作「篩選器」；issues 指筛选语法错误，用「處錯誤」，避免与議題（issue）混淆；与 issues/filter.ts 同句同译
    [/^Filter contains (\d+) issues?:$/, '篩選器有 $1 處錯誤：']
  ]
} satisfies PageDictionary
