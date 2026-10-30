import type { PageDictionary } from '../../core/types'
import { mergeDictionaries } from './helpers'
import achievements from './profile/achievements'
import contributions from './profile/contributions'
import sidebar from './profile/sidebar'
import tabs from './profile/tabs'
import timezones from './profile/timezones'

/**
 * 个人主页：头部与侧栏、贡献图与贡献活动、储存库 / 星号 / 追踪者等分页、成就、编辑个人档案表单的时区下拉。
 * 使用者主页 /<name> 同时套用 organization 词典，两边共用词条保持一致。
 */
export default mergeDictionaries(sidebar, contributions, tabs, achievements, timezones) satisfies PageDictionary
