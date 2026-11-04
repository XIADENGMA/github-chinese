import { accountLogin, pathSegments } from '../core/page'
import { sanitizeScopes, toggleScope } from './scope-list'

/**
 * 自动加载的范围（处理见 core/auto-load）：按所在页面生效，不属于前几种页面的归「其他页面」（other）；
 * 侧栏常用存储库（全局导航侧栏的「显示更多」）在任何页面按 sidePanel 生效
 */
export const AUTO_LOAD_SCOPES = [
  'search',
  'issues',
  'pulls',
  'discussions',
  'actions',
  'releases',
  'tags',
  'commits',
  'dashboard',
  'profiles',
  'sidePanel',
  'other'
] as const

export type AutoLoadScope = (typeof AUTO_LOAD_SCOPES)[number]

/** 按所在页面生效的范围 */
export type AutoLoadPageScope = Exclude<AutoLoadScope, 'sidePanel'>

/** 默认全部开启（总开关仍默认关闭） */
export const DEFAULT_AUTO_LOAD_SCOPES: readonly AutoLoadScope[] = AUTO_LOAD_SCOPES

/** 读取存储中的范围：不是数组时用默认值；丢弃未知项，去重，按 AUTO_LOAD_SCOPES 的顺序 */
export function sanitizeAutoLoadScopes(value: unknown): readonly AutoLoadScope[] {
  return sanitizeScopes(AUTO_LOAD_SCOPES, value, DEFAULT_AUTO_LOAD_SCOPES)
}

/** 开关一个范围，返回新的范围列表（按 AUTO_LOAD_SCOPES 的顺序） */
export function toggleAutoLoadScope(scopes: readonly AutoLoadScope[], scope: AutoLoadScope, on: boolean): readonly AutoLoadScope[] {
  return toggleScope(AUTO_LOAD_SCOPES, scopes, scope, on)
}

/** 首页（动态）的顶级路径 */
const DASHBOARD_TOP = new Set(['dashboard', 'dashboard-feed', 'feed'])
/** 个人的列表页：我的存储库、关注的存储库、星标 */
const PERSONAL_TOP = new Set(['repos', 'watching', 'stars'])
/** 组织下的列表页：/orgs/<组织>/<段> */
const ORG_LIST_SECTIONS = new Set(['repositories', 'people', 'teams', 'projects', 'packages'])
/** 存储库下的页面 /<所有者>/<存储库>/<段>/… 的范围：列表页与详情页同一范围（如议题列表与议题的时间线） */
const REPO_SECTIONS: ReadonlyMap<string, AutoLoadPageScope> = new Map([
  ['search', 'search'],
  ['issues', 'issues'],
  ['labels', 'issues'],
  ['milestones', 'issues'],
  ['milestone', 'issues'],
  ['pulls', 'pulls'],
  ['pull', 'pulls'],
  ['discussions', 'discussions'],
  ['actions', 'actions'],
  ['releases', 'releases'],
  ['tags', 'tags'],
  ['commits', 'commits'],
  ['commit', 'commits']
])

/** github.com 上的页面所属的范围 */
function githubScope(pathname: string): AutoLoadPageScope {
  const [first, second, third] = pathSegments(pathname)
  if (first === undefined || DASHBOARD_TOP.has(first)) return 'dashboard'
  if (first === 'search') return 'search'
  if (first === 'issues') return 'issues'
  if (first === 'pulls') return 'pulls'
  if (first === 'discussions') return 'discussions'
  if (PERSONAL_TOP.has(first)) return 'profiles'
  if (first === 'orgs') {
    if (third === 'discussions') return 'discussions'
    return second !== undefined && (third === undefined || ORG_LIST_SECTIONS.has(third)) ? 'profiles' : 'other'
  }
  // 其余站点页面（设置、市场、主题等），以及 /users/、/organizations/ 下的页面
  if (first === 'users' || first === 'organizations' || accountLogin(pathname) === undefined) return 'other'
  // 个人主页、组织主页（各 ?tab= 标签页同一路径）
  if (second === undefined) return 'profiles'
  return (third === undefined ? undefined : REPO_SECTIONS.get(third)) ?? 'other'
}

/** gist.github.com 上的页面所属的范围：搜索，个人的代码片段列表 */
function gistScope(pathname: string): AutoLoadPageScope {
  const [first, second] = pathSegments(pathname)
  if (first === 'search') return 'search'
  if (first === undefined || first === 'discover') return 'other'
  return first === 'starred' || second === undefined || second === 'starred' || second === 'forked' ? 'profiles' : 'other'
}

/** 页面所属的范围（按所在页面生效的那几种） */
export function autoLoadPageScope(url: Pick<URL, 'hostname' | 'pathname'>): AutoLoadPageScope {
  if (url.hostname === 'github.com') return githubScope(url.pathname)
  if (url.hostname === 'gist.github.com') return gistScope(url.pathname)
  return 'other'
}
