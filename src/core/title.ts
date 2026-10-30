import { normalizeText } from './matcher'
import { accountLogin, pathSegments, repositoryName } from './page'

/** GitHub 标签页标题的分段符：「Issues · vuejs/core」 */
export const TITLE_SEPARATOR = ' · '

/** 标题末尾的站点名段：「Issues · vuejs/core · GitHub」；不少页面没有 */
const SITE_SEGMENT = 'GitHub'
/** 内容标记段：其前各段是用户内容（议题 / 拉取请求 / 讨论标题、提交信息） */
const CONTENT_MARKER_RE = /^(?:(?:Issue|Pull Request|Discussion) #\d+|[\w.-]+\/[\w.-]+@[0-9a-f]{7,40})$/
const WIKI_SEGMENT_SUFFIX = ' Wiki'
/** 仓库 Wiki 页的路径：/owner/repo/wiki 之后的部分 */
const WIKI_PATH_RE = /^\/[^/]+\/[^/]+\/wiki(?:\/(.*))?$/
const WORKFLOW_PATH_RE = /^\/[^/]+\/[^/]+\/actions\/workflows\/[^/]+/
/** 仓库首页标题「GitHub - owner/repo: 描述」的前缀，小写 */
const DESCRIPTION_SITE_PREFIX = 'github - '
const GIST_HOST = 'gist.github.com'
/** /owner/ 之后的 gist 编号：十六进制或旧式数字编号 */
const GIST_ID_RE = /^(?:[\da-f]{20,40}|\d+)$/
/** 首段的 gist 编号只认十六进制：纯数字首段是登录名（/1234567 是用户的 gist 列表） */
const GIST_HEX_ID_RE = /^[\da-f]{20,40}$/
/** 单个 gist 页的子页：标题首段是子页名 */
const GIST_SUBPAGES = new Set(['forks', 'revisions', 'stargazers'])

/** 判断规范化后的第 i 段是否是用户内容 */
type UserSegment = (normalized: string, i: number) => boolean

/** 末尾站点名段（「GitHub」）之前的段数 */
function contentLength(segments: readonly string[]): number {
  const last = segments.length - 1
  return normalizeText(segments[last] ?? '') === SITE_SEGMENT ? last : segments.length
}

/** 带描述的仓库首页：路径恰为 /owner/repo，首段以「owner/repo:」或「GitHub - owner/repo:」开头（不区分大小写） */
function isDescriptionTitle(first: string, pathname: string): boolean {
  const parts = pathSegments(pathname)
  if (parts.length !== 2 || repositoryName(pathname) === undefined) return false
  const prefix = `${parts.join('/')}:`
  const lower = normalizeText(first).toLowerCase()
  return lower.startsWith(prefix) || lower.startsWith(DESCRIPTION_SITE_PREFIX + prefix)
}

/** 规则集页：/owner/repo/rules…、/owner/repo/settings/rules… */
function isRulesPage(parts: readonly string[]): boolean {
  return parts[2] === 'rules' || (parts[2] === 'settings' && parts[3] === 'rules')
}

/**
 * 标题开头属于用户内容的段数：
 * - 工作流页的工作流名、带描述的仓库首页的「owner/repo: 描述」：站点名段之前的全部段（名称、描述可能含分段符）；
 * - 内容标记段（Issue #N、Pull Request #N、Discussion #N、owner/repo@sha）之前的段，取最右边的标记；
 * - Wiki 页面（路径 wiki 之后各段都不以 _ 开头）中「… Wiki」段之前的段，取最右边的「… Wiki」段。
 * @param end 站点名段之前的段数（见 contentLength）
 */
function userSegmentCount(segments: readonly string[], pathname: string, end: number): number {
  if (WORKFLOW_PATH_RE.test(pathname) || isDescriptionTitle(segments[0] ?? '', pathname)) return end
  const wiki = WIKI_PATH_RE.exec(pathname)
  const wikiPage = wiki !== null && !(wiki[1] ?? '').split('/').some((part) => part.startsWith('_'))
  let count = 0
  segments.forEach((segment, i) => {
    const normalized = normalizeText(segment)
    if (CONTENT_MARKER_RE.test(normalized) || (wikiPage && normalized.endsWith(WIKI_SEGMENT_SUFFIX))) {
      count = Math.max(count, i)
    }
  })
  return count
}

/**
 * 单个 gist 页（/owner/id、/id，可带子页或修订）：除子页名（Forks / Revisions / Stargazers，首段）与站点名段外
 * 都是 gist 名（描述或首个文件名）。
 * 搜索页（/search）「Search · <查询词> · GitHub」：首段之后、站点名段之前都是查询词（可能含分段符）。
 * 其余页返回 undefined。
 * @param end 站点名段之前的段数（见 contentLength）
 */
function gistUserSegment(pathname: string, end: number): UserSegment | undefined {
  const parts = pathSegments(pathname)
  if (parts[0] === 'search') return (_, i) => i > 0 && i < end
  const id = GIST_ID_RE.test(parts[1] ?? '') ? 1 : GIST_HEX_ID_RE.test(parts[0] ?? '') ? 0 : -1
  if (id < 0) return undefined
  const subpage = GIST_SUBPAGES.has(parts[id + 1] ?? '')
  return (_, i) => i < end && !(subpage && i === 0)
}

/**
 * 标题中的用户内容段：
 * - userSegmentCount 计出的开头各段；
 * - 与地址中账号同名的段（登录名，如用户 today 的主页「today · GitHub」）；
 * - 规则集页站点名段之前的末段，与仓库名同名且不是首段时（「Settings · Rulesets · documentation」
 *   「Rulesets · documentation · GitHub」）；
 * - 主题页与主题名同名的首段（「bot · GitHub Topics · GitHub」）；
 * - 单个 gist 页的 gist 名、gist 搜索页的查询词。
 */
function userSegment(segments: readonly string[], pathname: string, hostname: string): UserSegment {
  const end = contentLength(segments)
  if (hostname === GIST_HOST) return gistUserSegment(pathname, end) ?? (() => false)
  const skip = userSegmentCount(segments, pathname, end)
  const parts = pathSegments(pathname)
  const login = accountLogin(pathname)
  const repository = repositoryName(pathname)
  const repositoryIndex = end > 1 && isRulesPage(parts) ? end - 1 : -1
  const [first, topic] = parts
  return (normalized, i) => {
    const lower = normalized.toLowerCase()
    return (
      i < skip ||
      lower === login ||
      (i === repositoryIndex && lower === repository) ||
      (i === 0 && first === 'topics' && lower === topic)
    )
  }
}

/**
 * 按分段符逐段翻译标题；未命中的段、用户内容段（见 userSegment）保持原样。
 * @param translate 翻译规范化文本，未命中返回 undefined
 * @param pathname 当前地址的路径
 * @param hostname 当前地址的主机名，用于识别 gist 页
 */
export function translateTitleText(
  title: string,
  translate: (text: string) => string | undefined,
  pathname = '',
  hostname = 'github.com',
): string {
  const segments = title.split(TITLE_SEPARATOR)
  const isUser = userSegment(segments, pathname, hostname)
  return segments
    .map((segment, i) => {
      const normalized = normalizeText(segment)
      if (!normalized || isUser(normalized, i)) return segment
      return translate(normalized) || segment
    })
    .join(TITLE_SEPARATOR)
}
