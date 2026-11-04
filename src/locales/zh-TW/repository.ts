import type { PageDictionary } from '../../core/types'
import codespacesRepoRules from './codespaces/repo-rules'
import { mergeDictionaries } from './helpers'
import banners from './repository/banners'
import empty from './repository/empty'
import header from './repository/header'
import overview from './repository/overview'
import pages from './repository/pages'
import sidebar from './repository/sidebar'

/**
 * 存储库（页面类型 repository）：所有存储库页共用的作用域。
 * 存储库首页 /<owner>/<repo> 的作用域是 common → repository → code，其它存储库页是 common → repository → <分区>。
 * 内容：存储库头部与操作按钮、首页代码区（分支选择器、Code 下拉、最新提交、文件列表、自述文件）、
 * 提示横幅与复刻信息条、空存储库、侧栏、存储库级整页（已禁用、DMCA 下架、贡献入口页）；
 * 并合并 codespaces 词典中含变量的 Code 下拉规则（放在最后）。
 * 存储库标签导航（Code、Issues 等）位于全局导航，由 common 收录。
 */
export default mergeDictionaries(header, overview, banners, empty, sidebar, pages, codespacesRepoRules) satisfies PageDictionary
