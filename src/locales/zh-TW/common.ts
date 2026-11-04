import type { PageDictionary } from '../../core/types'
import dialogs from './common/dialogs'
import globalNav from './common/global-nav'
import marketing from './common/marketing'
import pages from './common/pages'
import regions from './common/regions'
import search from './common/search'
import securityPages from './common/security-pages'
import site from './common/site'
import { mergeDictionaries } from './helpers'

/**
 * 站点框架：营销头部与页脚、登录后全局导航栏与菜单、全局搜索与命令面板、
 * 键盘快捷方式等全局对话框、会话提醒与 Cookie 横幅、错误页；
 * 以及 GitHub 自有页面正文（高级支持、企业试用、联系销售、结账、安全产品介绍）与国家/地区、州/省列表。
 * 本文件的 regexp、inline 全站生效。
 */
export default mergeDictionaries(marketing, globalNav, search, dialogs, site, pages, securityPages, regions) satisfies PageDictionary
