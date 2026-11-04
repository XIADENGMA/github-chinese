import type { PageDictionary } from '../../core/types'
import checks from './pulls/checks'
import comments from './pulls/comments'
import commits from './pulls/commits'
import compare from './pulls/compare'
import conflicts from './pulls/conflicts'
import dashboard from './pulls/dashboard'
import files from './pulls/files'
import header from './pulls/header'
import list from './pulls/list'
import mergeFlow from './pulls/merge-flow'
import mergebox from './pulls/mergebox'
import overview from './pulls/overview'
import review from './pulls/review'
import sidebar from './pulls/sidebar'
import stacks from './pulls/stacks'
import timeline from './pulls/timeline'
import { mergeDictionaries } from './helpers'

/**
 * 页面类型 pulls：存储库拉取请求列表、全局 /pulls 收件箱、拉取请求详情（头部、对话、概述、提交、检查、已更改的文件）、
 * 合并框、时间线、审查、评论面板、侧栏、冲突编辑器，堆栈列表与堆栈详情（/stacks、/stack/<编号>），以及比较页（/compare，作用域另含 commits）的拉取请求创建表单。
 * 正则按合并顺序匹配：具体的整句规则排在通用计数规则（list.ts）之前。
 */
export default mergeDictionaries(
  header,
  mergebox,
  mergeFlow,
  timeline,
  review,
  sidebar,
  files,
  commits,
  checks,
  compare,
  overview,
  comments,
  conflicts,
  dashboard,
  stacks,
  list
) satisfies PageDictionary
