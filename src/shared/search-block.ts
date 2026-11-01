/**
 * 搜索净化的屏蔽规则（页面上的处理见 core/search-purify）。每条一种写法：
 *   @octocat             所有者（用户、组织）：其存储库及存储库下的议题、代码等结果，以及该用户本身
 *   octocat/hello-world  存储库
 *   hello world          关键词：名称、标题、描述、主题、标签含这段文字（不区分大小写）。
 *                        不是上面两种写法的都按关键词；以 @ 开头、存储库写法的关键词加引号："@octocat"
 * GitHub 地址（https://github.com/octocat、…/octocat/hello-world/issues）按所有者、存储库识别
 */

export type SearchBlockRule =
  | { readonly kind: 'owner'; readonly owner: string }
  | { readonly kind: 'repo'; readonly owner: string; readonly name: string }
  | { readonly kind: 'keyword'; readonly keyword: string }

/** 一条规则的长度上限 */
export const MAX_RULE_LENGTH = 200

/** 用户名、组织名：字母、数字、连字符，至多 39 个字符 */
const LOGIN_RE = /^[a-z\d][a-z\d-]{0,38}$/i
/** 存储库名 */
const REPO_NAME_RE = /^[\w.-]{1,100}$/
const GITHUB_URL_RE = /^(?:https?:\/\/)?(?:www\.)?github\.com\/([^?#]*)/i
const QUOTED_RE = /^"(.*)"$/
/** 所有者写法的前缀（同 GitHub 的 @提及） */
const MENTION_PREFIX = '@'

/** github.com 上不是用户名的一级路径（搜索结果里出现的链接） */
const RESERVED_PATHS: ReadonlySet<string> = new Set([
  'about',
  'apps',
  'codespaces',
  'collections',
  'enterprise',
  'explore',
  'features',
  'login',
  'marketplace',
  'notifications',
  'search',
  'settings',
  'site',
  'sponsors',
  'topics',
  'trending',
])

/** 带所有者的一级路径：/orgs/<组织>/…、/users/<用户>/…（软件包等） */
const OWNER_PREFIXES: ReadonlySet<string> = new Set(['orgs', 'users'])

/** 路径对应的所有者与存储库（保持原大小写） */
export interface PathOwner {
  readonly owner: string
  readonly name?: string
}

function decodeSegment(segment: string): string {
  try {
    return decodeURIComponent(segment)
  } catch {
    return segment
  }
}

/** github.com 上的路径对应的所有者、存储库；不是用户、存储库下的路径为 undefined */
export function ownerOfPath(pathname: string): PathOwner | undefined {
  const [first = '', second] = pathname.split('/').filter(Boolean).map(decodeSegment)
  if (OWNER_PREFIXES.has(first.toLowerCase())) {
    return second !== undefined && LOGIN_RE.test(second) ? { owner: second } : undefined
  }
  if (RESERVED_PATHS.has(first.toLowerCase()) || !LOGIN_RE.test(first)) return undefined
  return second !== undefined && REPO_NAME_RE.test(second) ? { owner: first, name: second } : { owner: first }
}

/** 解析一行；空行、超长、@ 后不是用户名、不是用户与存储库的 GitHub 地址为 undefined */
export function parseRule(line: string): SearchBlockRule | undefined {
  const text = line.trim()
  if (text === '' || text.length > MAX_RULE_LENGTH) return undefined
  const quoted = QUOTED_RE.exec(text)
  if (quoted) {
    const keyword = quoted[1]!.trim()
    return keyword === '' ? undefined : { kind: 'keyword', keyword }
  }
  if (text.startsWith(MENTION_PREFIX)) {
    const owner = text.slice(MENTION_PREFIX.length)
    return LOGIN_RE.test(owner) ? { kind: 'owner', owner } : undefined
  }
  const url = GITHUB_URL_RE.exec(text)
  if (url) {
    const path = ownerOfPath(url[1]!.replace(/\.git$/i, ''))
    if (!path) return undefined
    return path.name === undefined
      ? { kind: 'owner', owner: path.owner }
      : { kind: 'repo', owner: path.owner, name: path.name }
  }
  const slash = text.indexOf('/')
  if (slash > 0) {
    const owner = text.slice(0, slash)
    const name = text.slice(slash + 1)
    if (LOGIN_RE.test(owner) && REPO_NAME_RE.test(name)) return { kind: 'repo', owner, name }
  }
  return { kind: 'keyword', keyword: text }
}

/** 规则的写法：地址换成所有者、存储库；关键词保持原样（含引号） */
function ruleLine(rule: SearchBlockRule, line: string): string {
  if (rule.kind === 'owner') return `${MENTION_PREFIX}${rule.owner}`
  if (rule.kind === 'repo') return `${rule.owner}/${rule.name}`
  return line.trim()
}

/** 判重用的键：不区分大小写 */
function ruleKey(rule: SearchBlockRule): string {
  if (rule.kind === 'owner') return `owner:${rule.owner.toLowerCase()}`
  if (rule.kind === 'repo') return `repo:${rule.owner.toLowerCase()}/${rule.name.toLowerCase()}`
  return `keyword:${rule.keyword.toLowerCase()}`
}

/** 规范化一条规则：去掉首尾空白，GitHub 地址换成所有者、存储库的写法；无效时为 undefined */
export function normalizeRule(line: string): string | undefined {
  const rule = parseRule(line)
  return rule ? ruleLine(rule, line) : undefined
}

/** 判重用的键：同一所有者、存储库、关键词（不区分大小写，关键词引号可有可无）的规则相同；无效的规则按原文 */
export function ruleKeyOf(line: string): string {
  const rule = parseRule(line)
  return rule ? ruleKey(rule) : `invalid:${line.trim()}`
}

/** 编译后的规则：所有者、存储库（所有者/名称）与关键词，均为小写 */
export interface SearchBlockList {
  readonly owners: ReadonlySet<string>
  readonly repos: ReadonlySet<string>
  readonly keywords: readonly string[]
}

export const EMPTY_BLOCK_LIST: SearchBlockList = { owners: new Set(), repos: new Set(), keywords: [] }

/** 编译存储的规则；无效的行跳过 */
export function compileSearchBlockRules(lines: readonly string[]): SearchBlockList {
  const owners = new Set<string>()
  const repos = new Set<string>()
  const keywords = new Set<string>()
  for (const line of lines) {
    const rule = parseRule(line)
    if (rule?.kind === 'owner') owners.add(rule.owner.toLowerCase())
    else if (rule?.kind === 'repo') repos.add(`${rule.owner}/${rule.name}`.toLowerCase())
    else if (rule?.kind === 'keyword') keywords.add(rule.keyword.toLowerCase())
  }
  return { owners, repos, keywords: [...keywords] }
}

export function isEmptyBlockList(list: SearchBlockList): boolean {
  return list.owners.size === 0 && list.repos.size === 0 && list.keywords.length === 0
}

/** 一条搜索结果：所有者、存储库取自标题行的第一个链接，文字取自其中的用户内容 */
export interface SearchResultInfo {
  readonly owner?: string
  /** 所有者/名称 */
  readonly repo?: string
  /** 名称、标题、描述、主题、标签的文字 */
  readonly text: string
}

/** 结果是否命中规则（不区分大小写） */
export function isBlockedResult(result: SearchResultInfo, list: SearchBlockList): boolean {
  if (result.owner !== undefined && list.owners.has(result.owner.toLowerCase())) return true
  if (result.repo !== undefined && list.repos.has(result.repo.toLowerCase())) return true
  if (list.keywords.length === 0) return false
  const text = result.text.toLowerCase()
  return list.keywords.some((keyword) => text.includes(keyword))
}
