import type { PageDictionary } from '../../core/types'
import advanced from './search/advanced'
import results from './search/results'
import tips from './search/tips'
import { mergeDictionaries } from './helpers'

/**
 * 搜索（页面类型 search）：/search 首页与结果页（React）、空结果提示、未登录代码搜索提示，
 * 高级搜索 /search/advanced（Rails 表单）。
 * 全局搜索对话框、命令面板、已保存的搜索对话框由 common 收录。
 */
export default mergeDictionaries(results, tips, advanced) satisfies PageDictionary
