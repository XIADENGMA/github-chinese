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
  failure: '失败',
  error: '出错',
  inactive: '不活跃',
  pending: '挂起',
  queued: '已排队',
  in_progress: '正在进行',
  'in progress': '正在进行',
  waiting: '等待中',
  abandoned: '已放弃',
  destroyed: '已销毁',
}

export default {
  static: {
    'All deployments': '全部部署',
    'Deployment views': '部署视图',
    'Deployment environments': '部署环境',
    'Open Deployment environments': '打开部署环境',
    'Environment management': '环境管理',
    'Filter environments': '筛选环境',
    'Filter environments...': '筛选环境...',
    'Filter environments…': '筛选环境…',
    'Manage environments': '管理环境',
    'Latest deployments from pinned environments': '置顶环境的最新部署',
    'Latest deployments': '最新部署',
    'Latest deployment': '最新部署',
    'Active deployments': '活跃部署',
    'Deployment history': '部署历史记录',
    'View deployment': '查看部署',
    'Your search did not match any deployments': '没有与搜索匹配的部署',
    'Filter deployments': '筛选部署',
    'Deployed to': '已部署到',
    'Failed to deploy to': '未能部署到',
    'View workflow run': '查看工作流运行',
    '/ History': '/ 历史记录',
    'More list item action bar': '更多操作',
    'Text will be ignored since log searching is not yet available:': '因暂不支持日志搜索而忽略以下文本：',
  },

  scoped: {
    'View logs': '查看日志',
    'Try a different search query': '尝试其他搜索词',
    deployed: '部署于',
    'deployed by': '部署者',
    'Deployed by': '部署者',
    Last: '最后',
    Active: '活跃',
    Abandoned: '已放弃',
    Destroyed: '已销毁',
    error: '出错',
    abandoned: '已放弃',
    destroyed: '已销毁',
    in_progress: '正在进行',
    'in progress': '正在进行',
    waiting: '等待中',

    // 筛选栏与高级筛选对话框
    State: '状态',
    Creator: '创建者',
    Environment: '环境',
    Ref: '引用',
    Text: '文本',
    Qualifier: '限定符',
    Operator: '运算符',
    'is one of': '是以下之一',
    'is not one of': '不是以下之一',
    is: '是',
    Value: '值',
    'Filter values': '筛选值',
    Me: '我',
    'Signed-in user': '已登录用户',
    'Empty value for': '以下限定符的值为空',
    before: '早于',
    after: '晚于',
    'before and including': '早于或等于',
    'after and including': '晚于或等于',
    between: '介于',
    Has: '有',
    Exclude: '排除',
    Created: '创建时间',
  },

  regexp: [
    [/^([\d,]+) deployments?$/, '$1 个部署'],
    [/^via (.+) #(\d+)$/, '通过 $1 #$2'],
    [/^View deployment to (.+)$/, '查看 $1 的部署'],
    [
      /^(Pin|Unpin) (.+) environment$/,
      (_, action: string, name: string) => `${action === 'Pin' ? '置顶' : '取消置顶'} ${name} 环境`,
    ],
    [
      new RegExp(`^Deployment (${alternation(ICON_STATES)})$`),
      (_, state: string) => `部署${pick(ICON_STATES, state) ?? state}`,
    ],
    // 列表条目：Status: Deployed (completed).
    [
      new RegExp(`^Status: (${STATE_SOURCE}) \\((${PHASE_SOURCE})\\)\\.$`),
      (_, state: string, phase: string) => `${deploymentStatus(state, phase)}。`,
    ],
    // 列表条目的无障碍名称：标题: Status: Deployed (completed). More information available below.
    [
      new RegExp(
        `^(?:(.+): )?Status: (${STATE_SOURCE}) \\((${PHASE_SOURCE})\\)\\. More information available below\\.$`,
      ),
      (_, title: string, state: string, phase: string) =>
        `${title ? `${title}：` : ''}${deploymentStatus(state, phase)}。更多信息见下方。`,
    ],
    // 名词 Filter 作“筛选器”；issues 指筛选语法错误，用“处错误”，避免与议题（issue）混淆；与 issues/filter.ts 同句同译
    [/^Filter contains (\d+) issues?:$/, '筛选器有 $1 处错误：'],
  ],
} satisfies PageDictionary
