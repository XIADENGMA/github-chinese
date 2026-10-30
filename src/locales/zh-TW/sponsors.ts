import type { PageDictionary } from '../../core/types'
import { mergeDictionaries } from './helpers'
import dashboard from './sponsors/dashboard'
import explore from './sponsors/explore'
import marketing from './sponsors/marketing'
import profile from './sponsors/profile'

/**
 * GitHub 赞助（GitHub Sponsors）：营销页、探索页与筛选、赞助帐号、批次赞助、组织相依项目、赞助页与目标、等级与结帐、
 * 赞助仪表板、申请赞助与候补名单。
 * 组织赞助页（/orgs/<name>/sponsoring）不属于 sponsors 页面类型，只有 static 生效，其词条由 organization 词典收录。
 */
export default mergeDictionaries(profile, explore, dashboard, marketing) satisfies PageDictionary
