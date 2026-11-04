import type { PageDictionary } from '../../core/types'
import activity from './commits/activity'
import branches from './commits/branches'
import checkSummary from './commits/check-summary'
import checks from './commits/checks'
import commit from './commits/commit'
import compare from './commits/compare'
import datePicker from './commits/date-picker'
import diff from './commits/diff'
import list from './commits/list'
import { mergeDictionaries } from './helpers'

/**
 * 页面类型 commits：提交列表（/commits）、提交详情（/commit/<sha>）、分支页（/branches）、
 * 活动页（/activity）、比较页（/compare，作用域另含 pulls）。
 * 正则按合并顺序匹配：列表与详情中更具体的规则排在差异视图的通用计数规则之前。
 * check-summary 只含检查汇总与耗时的正则，code.ts 也合并它（存储库首页最新提交的检查弹层）。
 */
export default mergeDictionaries(list, checkSummary, checks, datePicker, commit, diff, branches, activity, compare) satisfies PageDictionary
