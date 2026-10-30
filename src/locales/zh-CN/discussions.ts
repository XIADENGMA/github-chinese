import type { PageDictionary } from '../../core/types'
import categories from './discussions/categories'
import compose from './discussions/compose'
import list from './discussions/list'
import viewer from './discussions/viewer'
import { mergeDictionaries } from './helpers'

/**
 * 讨论（GitHub Discussions）：讨论列表与类别页、讨论详情、回答、投票、新建讨论、类别与分组管理、讨论操作。
 * 页面类型 discussions 覆盖 /<owner>/<repo>/discussions…、/orgs/<org>/discussions…、/discussions。
 * 默认类别名（Announcements、General 等）译为中文，其余类别名、分组名、标题、投票选项属于用户内容；
 * 自定义类别名所在元素由 categories 的 ignore 排除。
 * 正则按合并顺序匹配：list 中的评论数链接规则须排在通用计数规则之前（同一文件内已排好）。
 */
export default mergeDictionaries(list, viewer, compose, categories) satisfies PageDictionary
