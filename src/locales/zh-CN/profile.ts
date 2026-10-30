import type { PageDictionary } from '../../core/types'
import { mergeDictionaries } from './helpers'
import achievements from './profile/achievements'
import contributions from './profile/contributions'
import sidebar from './profile/sidebar'
import tabs from './profile/tabs'
import timezones from './profile/timezones'

/**
 * 个人主页：头部与侧栏、贡献图与贡献活动、存储库 / 星标 / 关注者等标签页、成就、编辑个人资料表单的时区下拉。
 * 用户主页 /<name> 同时套用 organization 词典，两边共用词条保持一致。
 */
export default mergeDictionaries(sidebar, contributions, tabs, achievements, timezones) satisfies PageDictionary
