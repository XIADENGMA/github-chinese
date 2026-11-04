import { accountLogin, pathSegments } from '../core/page'

/**
 * 新标签页打开的范围（处理见 core/new-tab）：
 * 站外链接、正文链接在任何页面生效；其余按所在页面生效（该页面上除导航、菜单、分页等之外的链接）。
 * 另可按路径自定义页面（写法同排除路径，见 settings 的 newTabPaths）
 */
export const NEW_TAB_SCOPES = ['external', 'content', 'search', 'issues', 'notifications', 'dashboard', 'profiles', 'explore'] as const

export type NewTabScope = (typeof NEW_TAB_SCOPES)[number]

/** 按所在页面生效的范围 */
export type PageScope = Exclude<NewTabScope, 'external' | 'content'>

/** 默认生效的范围（总开关仍默认关闭） */
export const DEFAULT_NEW_TAB_SCOPES: readonly NewTabScope[] = ['external', 'search']

export function isNewTabScope(value: unknown): value is NewTabScope {
  return (NEW_TAB_SCOPES as readonly unknown[]).includes(value)
}

/** 读取存储中的范围：不是数组时用默认值；丢弃未知项，去重，按 NEW_TAB_SCOPES 的顺序 */
export function sanitizeNewTabScopes(value: unknown): readonly NewTabScope[] {
  if (!Array.isArray(value)) return DEFAULT_NEW_TAB_SCOPES
  return NEW_TAB_SCOPES.filter(scope => value.includes(scope))
}

/** 开关一个范围，返回新的范围列表（按 NEW_TAB_SCOPES 的顺序） */
export function toggleNewTabScope(scopes: readonly NewTabScope[], scope: NewTabScope, on: boolean): readonly NewTabScope[] {
  return NEW_TAB_SCOPES.filter(item => (item === scope ? on : scopes.includes(item)))
}

/** GitHub 自己的站点：github.com、githubusercontent.com、githubassets.com、githubstatus.com 及其子域名 */
const GITHUB_SITES = ['github.com', 'githubusercontent.com', 'githubassets.com', 'githubstatus.com']

export function isGitHubSite(hostname: string): boolean {
  const host = hostname.toLowerCase()
  return GITHUB_SITES.some(site => host === site || host.endsWith(`.${site}`))
}

/** 发现类页面的顶级路径 */
const EXPLORE_TOP = new Set(['explore', 'trending', 'topics', 'collections'])
/** 首页（动态）的顶级路径 */
const DASHBOARD_TOP = new Set(['dashboard', 'dashboard-feed', 'feed'])
/** 组织下的列表页：/orgs/<组织>/<段> */
const ORG_LIST_SECTIONS = new Set(['repositories', 'people', 'teams', 'projects', 'packages'])
/** 存储库下的列表页：/<所有者>/<存储库>/<段>，没有下一段 */
const REPO_LIST_SECTIONS = new Set(['issues', 'pulls', 'discussions', 'milestones'])
/** 存储库下带一段名称的列表页：/<所有者>/<存储库>/<段>/<名称> */
const REPO_NAMED_LIST_SECTIONS = new Set(['labels', 'milestone'])

/** github.com 上的页面所属的范围 */
function githubScope(pathname: string): PageScope | undefined {
  const [first, second, third, fourth] = pathSegments(pathname)
  if (first === undefined || DASHBOARD_TOP.has(first)) return 'dashboard'
  if (first === 'search') return 'search'
  if (first === 'notifications') return 'notifications'
  if (first === 'issues' || first === 'pulls') return 'issues'
  if (EXPLORE_TOP.has(first)) return 'explore'
  if (first === 'stars') return 'profiles'
  if (first === 'orgs') {
    if (second === undefined) return undefined
    if (third === 'discussions' && fourth === undefined) return 'issues'
    return third === undefined || ORG_LIST_SECTIONS.has(third) ? 'profiles' : undefined
  }
  // 其余站点页面（设置、新建等），以及 /users/、/organizations/ 下的页面
  if (first === 'users' || first === 'organizations' || accountLogin(pathname) === undefined) return undefined
  // 个人主页、组织主页（各 ?tab= 标签页同一路径）
  if (second === undefined) return 'profiles'
  if (third === undefined) return undefined
  if (third === 'search' && fourth === undefined) return 'search'
  if (REPO_LIST_SECTIONS.has(third) && fourth === undefined) return 'issues'
  if (third === 'discussions' && fourth === 'categories') return 'issues'
  if (REPO_NAMED_LIST_SECTIONS.has(third) && fourth !== undefined) return 'issues'
  return undefined
}

/** gist.github.com 上的页面所属的范围：搜索、发现，个人的代码片段列表 */
function gistScope(pathname: string): PageScope | undefined {
  const [first, second] = pathSegments(pathname)
  if (first === undefined) return undefined
  if (first === 'search') return 'search'
  if (first === 'discover') return 'explore'
  if (first === 'starred') return 'profiles'
  if (second === undefined || second === 'starred' || second === 'forked') return 'profiles'
  return undefined
}

/** 页面所属的范围（按所在页面生效的那几种）；不属于任何一种时为 undefined */
export function pageScope(url: Pick<URL, 'hostname' | 'pathname'>): PageScope | undefined {
  if (url.hostname === 'github.com') return githubScope(url.pathname)
  if (url.hostname === 'gist.github.com') return gistScope(url.pathname)
  return undefined
}
