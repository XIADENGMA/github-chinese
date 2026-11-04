/**
 * 加速：Release 附件、源码包（含 codeload）、Raw 文件、Gist 的压缩包与 Raw 文件、克隆地址，
 * 以及加载失败的 GitHub 图片，改走第三方加速源。
 * 加速源以地址模板表示：{url} 换成原地址，{path} 换成 github.com 上的路径（不带开头的 /）；
 * 两者都没有时原地址接在模板之后（https://ghfast.top 等同 https://ghfast.top/{url}）。
 * 不在 github.com 上的地址（Gist、头像等）没有对应路径，用 {path} 的加速源不加速。
 * 加速源按分类管理（见 shared/accelerate-categories）
 */

/** 加速源 */
export interface AccelerateSource {
  /** 内置源为固定标识，自定义源在添加时生成 */
  readonly id: string
  readonly name: string
  /** 地址模板（见文件开头） */
  readonly template: string
  /** 内置源实测不支持的主机（应答 403、404）；自定义源不填，视为都支持 */
  readonly unsupportedHosts?: readonly string[]
}

/** 头像与 GitHub 自己的图片：部分加速源不转发 */
const IMAGE_ONLY_HOSTS = ['github.githubassets.com', 'avatars.githubusercontent.com'] as const

/**
 * 内置加速源：第三方公益服务，可用性随时变化；所属分类见 shared/accelerate-categories 的 BUILTIN_CATEGORIES。
 * 不支持的主机为实测（前四个 2026-10，其余 2026-11；2026-11 复测前四个结果不变）
 */
export const BUILTIN_SOURCES: readonly AccelerateSource[] = [
  {
    id: 'ghfast',
    name: 'ghfast.top',
    template: 'https://ghfast.top/{url}',
    unsupportedHosts: ['github.githubassets.com', 'avatars.githubusercontent.com']
  },
  {
    id: 'wget-la',
    name: 'wget.la',
    template: 'https://wget.la/{url}',
    unsupportedHosts: ['avatars.githubusercontent.com']
  },
  {
    id: 'gh-proxy-hk',
    name: 'hk.gh-proxy.org',
    template: 'https://hk.gh-proxy.org/{url}',
    unsupportedHosts: ['gist.github.com']
  },
  {
    id: 'gh-proxy-cdn',
    name: 'cdn.gh-proxy.org',
    template: 'https://cdn.gh-proxy.org/{url}',
    unsupportedHosts: ['gist.github.com']
  },
  {
    id: 'gh-proxy-edgeone',
    name: 'edgeone.gh-proxy.org',
    template: 'https://edgeone.gh-proxy.org/{url}',
    unsupportedHosts: ['gist.github.com']
  },
  {
    id: 'gh-proxy-com',
    name: 'gh-proxy.com',
    template: 'https://gh-proxy.com/{url}',
    unsupportedHosts: ['gist.github.com']
  },
  {
    id: 'gh-monlor',
    name: 'gh.monlor.com',
    template: 'https://gh.monlor.com/{url}',
    unsupportedHosts: IMAGE_ONLY_HOSTS
  },
  {
    id: 'hub-ddayh',
    name: 'hub.ddayh.com',
    template: 'https://hub.ddayh.com/{url}',
    unsupportedHosts: IMAGE_ONLY_HOSTS
  },
  {
    id: 'ghproxy-053000',
    name: 'ghproxy.053000.xyz',
    template: 'https://ghproxy.053000.xyz/{url}',
    unsupportedHosts: IMAGE_ONLY_HOSTS
  }
]

/** 自定义加速源（各分类合计）的上限与名称、模板的长度上限：设置随浏览器账号同步，单项不超过 8 KB */
export const MAX_CUSTOM_SOURCES = 10
export const SOURCE_NAME_MAX_LENGTH = 30
export const SOURCE_TEMPLATE_MAX_LENGTH = 200

/** 故障转移：探测加速源的时限 */
export const PROBE_TIMEOUT_MS = 3000
/** 测速：单次请求的时限 */
export const TEST_TIMEOUT_MS = 5000
/** 测速：连接建立后再请求的次数，Ping 取其中位数 */
export const PING_SAMPLES = 3

/** 可加速的地址种类：Release 附件、源码包、Raw 文件（含 Gist 的）、Gist 压缩包、克隆地址、图片 */
export type LinkKind = 'release' | 'archive' | 'raw' | 'gist' | 'clone' | 'image'

/** 可加速的地址 */
export interface AccelerableLink {
  readonly kind: LinkKind
  /**
   * 交给加速源的地址：去掉 # 之后的片段；效果相同的写法统一（codeload 换成 github.com 的 archive，
   * gist.github.com 的 Raw 换成 gist.githubusercontent.com，blob?raw=true 换成 raw）
   */
  readonly url: string
  /**
   * github.com 上的路径（不带开头的 /，含查询串）：raw.githubusercontent.com 的文件换成 <所有者>/<存储库>/raw/…；
   * 不在 github.com 上的地址（Gist、头像等）没有
   */
  readonly path?: string
}

/** github.com：<所有者>/<存储库>/ 之后是 releases/download、releases/latest/download、archive、raw */
const GITHUB_DOWNLOAD_RE = /^\/[^/]+\/[^/]+\/(releases\/download|releases\/latest\/download|archive|raw)\/./
/** github.com 的文件页面带 ?raw=true：<所有者>/<存储库>/blob/<分支等>/<文件路径> */
const GITHUB_BLOB_RE = /^\/([^/]+\/[^/]+)\/blob\/(.+)$/
/** raw.githubusercontent.com：<所有者>/<存储库>/<分支等>/<文件路径> */
const RAW_FILE_RE = /^\/([^/]+\/[^/]+)\/([^/]+\/.+)$/
/** codeload.github.com：<所有者>/<存储库>/zip 或 tar.gz/<引用>，同 github.com 的 archive/<引用>.zip、.tar.gz */
const CODELOAD_RE = /^\/([^/]+\/[^/]+)\/(zip|tar\.gz)\/(.+)$/
/** gist.github.com：<用户>/<ID>/archive/<文件> 或 <用户>/<ID>/raw/<…> */
const GIST_FILE_RE = /^\/([^/]+\/[0-9a-f]+)\/(archive|raw)\/(.+)$/
/** gist.githubusercontent.com：<用户>/<ID>/raw/<…> */
const GIST_RAW_RE = /^\/[^/]+\/[0-9a-f]+\/raw\/./
/** 克隆地址：github.com 的 <所有者>/<存储库>.git，gist.github.com 的 <ID>.git */
const REPO_CLONE_RE = /^\/[^/]+\/[^/]+\.git$/
const GIST_CLONE_RE = /^\/[0-9a-f]+\.git$/
/** 加载失败时经加速源取回的图片：头像、GitHub 自己的图片 */
const IMAGE_HOSTS: ReadonlySet<string> = new Set([
  'avatars.githubusercontent.com',
  'github.githubassets.com',
  'user-images.githubusercontent.com'
])

const GITHUB_KINDS: Readonly<Record<string, LinkKind>> = {
  'releases/download': 'release',
  'releases/latest/download': 'release',
  archive: 'archive',
  raw: 'raw'
}

function tryParseUrl(text: string): URL | undefined {
  try {
    return new URL(text)
  } catch {
    return undefined
  }
}

/** 可交给第三方的地址：https，不带用户名、端口；带 token 的不交给第三方 */
function parsePublicUrl(href: string): URL | undefined {
  const url = tryParseUrl(href)
  if (!url || url.protocol !== 'https:' || url.username || url.password || url.port || url.searchParams.has('token')) {
    return undefined
  }
  return url
}

/** github.com 上的地址：路径即 {path} */
function githubLink(kind: LinkKind, pathname: string, search: string): AccelerableLink {
  return { kind, url: `https://github.com${pathname}${search}`, path: `${pathname.slice(1)}${search}` }
}

/** Raw 文件：raw.githubusercontent.com、gist.githubusercontent.com，github.com 的 raw 与 blob?raw=true */
function parseRawUrl(url: URL, kind: LinkKind): AccelerableLink | undefined {
  const { hostname, pathname, search } = url
  if (hostname === 'raw.githubusercontent.com') {
    const match = RAW_FILE_RE.exec(pathname)
    return match ? { kind, url: `${url.origin}${pathname}${search}`, path: `${match[1]}/raw/${match[2]}${search}` } : undefined
  }
  if (hostname === 'gist.githubusercontent.com') {
    return GIST_RAW_RE.test(pathname) ? { kind, url: `${url.origin}${pathname}${search}` } : undefined
  }
  if (hostname !== 'github.com') return undefined
  if (GITHUB_DOWNLOAD_RE.exec(pathname)?.[1] === 'raw') return githubLink(kind, pathname, search)
  const blob = url.searchParams.get('raw') === 'true' ? GITHUB_BLOB_RE.exec(pathname) : null
  return blob ? githubLink(kind, `/${blob[1]}/raw/${blob[2]}`, '') : undefined
}

/** 识别可加速的下载链接（Release 附件、源码包、Raw 文件、Gist）；不可加速时返回 undefined */
export function parseDownloadLink(href: string): AccelerableLink | undefined {
  const url = parsePublicUrl(href)
  if (!url) return undefined
  const { hostname, pathname, search } = url
  if (hostname === 'github.com') {
    const kind = GITHUB_KINDS[GITHUB_DOWNLOAD_RE.exec(pathname)?.[1] ?? '']
    // 文件页面带 ?raw=true 的另行识别（见 parseRawUrl）
    if (kind) return githubLink(kind, pathname, search)
  }
  if (hostname === 'codeload.github.com') {
    const match = CODELOAD_RE.exec(pathname)
    return match ? githubLink('archive', `/${match[1]}/archive/${match[3]}.${match[2]}`, search) : undefined
  }
  if (hostname === 'gist.github.com') {
    const match = GIST_FILE_RE.exec(pathname)
    if (match?.[2] === 'archive') return { kind: 'gist', url: `${url.origin}${pathname}${search}` }
    return match ? { kind: 'raw', url: `https://gist.githubusercontent.com/${match[1]}/raw/${match[3]}${search}` } : undefined
  }
  return parseRawUrl(url, 'raw')
}

/** 识别可加速的克隆地址（https 的 .git 地址）；不可加速时返回 undefined */
export function parseCloneUrl(href: string): AccelerableLink | undefined {
  const url = parsePublicUrl(href)
  if (!url || url.search || url.hash) return undefined
  if (url.hostname === 'github.com' && REPO_CLONE_RE.test(url.pathname)) {
    return githubLink('clone', url.pathname, '')
  }
  return url.hostname === 'gist.github.com' && GIST_CLONE_RE.test(url.pathname) ? { kind: 'clone', url: url.href } : undefined
}

/** 识别可经加速源取回的图片地址；不可加速时返回 undefined */
export function parseImageUrl(href: string): AccelerableLink | undefined {
  const url = parsePublicUrl(href)
  if (!url) return undefined
  if (IMAGE_HOSTS.has(url.hostname)) return { kind: 'image', url: `${url.origin}${url.pathname}${url.search}` }
  return parseRawUrl(url, 'image')
}

/** 后台选源的地址：下载链接或克隆地址 */
export function parseAccelerableLink(href: string): AccelerableLink | undefined {
  return parseDownloadLink(href) ?? parseCloneUrl(href)
}

const SLOT_RE = /\{url\}|\{path\}/

/** 套用加速源，返回加速后的地址；模板用 {path} 而地址不在 github.com 上时为 undefined */
export function accelerateLink(template: string, link: AccelerableLink): string | undefined {
  const { url, path } = link
  // 用函数替换：链接中的 $& 等不当作替换模式
  if (template.includes('{url}')) return template.replace('{url}', () => url)
  if (template.includes('{path}')) return path === undefined ? undefined : template.replace('{path}', () => path)
  return `${template.replace(/\/+$/, '')}/${url}`
}

/** 加速源能否加速该地址：用 {path} 的只加速 github.com 上的地址；内置源跳过实测不支持的主机 */
export function supportsLink(source: AccelerateSource, link: AccelerableLink): boolean {
  if (source.template.includes('{path}') && link.path === undefined) return false
  return !(source.unsupportedHosts ?? []).includes(new URL(link.url).hostname)
}

/** 校验模板时套用的示例链接 */
const SAMPLE_LINK: AccelerableLink = {
  kind: 'release',
  url: 'https://github.com/octocat/hello-world/releases/download/v1.0/sample.zip',
  path: 'octocat/hello-world/releases/download/v1.0/sample.zip'
}

function isGitHubHost(hostname: string): boolean {
  return ['github.com', 'githubusercontent.com'].some(host => hostname === host || hostname.endsWith(`.${host}`))
}

/** 模板所在的站点（去掉占位符后解析）：须为 https，且不是 GitHub 自己的域名 */
function templateOrigin(template: string): string | undefined {
  const url = tryParseUrl(template.replace(SLOT_RE, ''))
  if (!url || url.protocol !== 'https:' || url.username || url.password || isGitHubHost(url.hostname)) return undefined
  return url.origin
}

/**
 * 校验地址模板，返回去掉首尾空白的模板；不合法时返回 undefined。
 * 占位符至多一个且在站点之后，其余位置不许有花括号
 */
export function parseSourceTemplate(text: string): string | undefined {
  const template = text.trim()
  if (template === '' || template.length > SOURCE_TEMPLATE_MAX_LENGTH) return undefined
  if (/[{}]/.test(template.replace(SLOT_RE, ''))) return undefined
  const origin = templateOrigin(template)
  if (!origin) return undefined
  return tryParseUrl(accelerateLink(template, SAMPLE_LINK) ?? '')?.origin === origin ? template : undefined
}

/** 模板的比较键：套用示例链接的结果，写法不同而效果相同的模板（如带不带 {url}）视为同一个 */
export function templateKey(template: string): string {
  return accelerateLink(template, SAMPLE_LINK) ?? template
}

/** 探测、测速请求的地址：加速源站点的根路径 */
export function probeUrl(template: string): string | undefined {
  const origin = templateOrigin(template)
  return origin && `${origin}/`
}

/** 名称：去掉首尾空白，截到上限；为空时用模板的域名 */
export function sourceName(text: string, template: string): string {
  const name = text.trim().slice(0, SOURCE_NAME_MAX_LENGTH)
  return name || (tryParseUrl(templateOrigin(template) ?? '')?.hostname ?? template)
}

/** 一次请求的结果：耗时（毫秒），或超时、出错 */
export type ProbeResult = { readonly ok: true; readonly ms: number } | { readonly ok: false; readonly reason: 'timeout' | 'error' }

export interface ProbeDeps {
  fetch(url: string, init: RequestInit): Promise<unknown>
  /** 单调时钟（毫秒） */
  now(): number
}

export const PROBE_DEPS: ProbeDeps = {
  // 不把全局 fetch 直接挂到对象上：以对象为 this 调用会报 Illegal invocation
  fetch: (url, init) => fetch(url, init),
  now: () => performance.now()
}

/**
 * 请求一次加速源，计时。HEAD、no-cors：不需要主机权限，响应不可读，只看连不连得上；
 * 不用缓存，不带 Cookie 与来源页
 */
export async function probe(url: string, timeoutMs: number, deps: ProbeDeps = PROBE_DEPS): Promise<ProbeResult> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  const start = deps.now()
  try {
    await deps.fetch(url, {
      method: 'HEAD',
      mode: 'no-cors',
      cache: 'no-store',
      credentials: 'omit',
      referrerPolicy: 'no-referrer',
      signal: controller.signal
    })
    return { ok: true, ms: Math.round(deps.now() - start) }
  } catch {
    return { ok: false, reason: controller.signal.aborted ? 'timeout' : 'error' }
  } finally {
    clearTimeout(timer)
  }
}

/** 测速结果 */
export interface LatencyResult {
  /** 延迟：首次请求的耗时，含建立连接（DNS、TCP、TLS） */
  readonly latency: ProbeResult
  /** Ping：连接建立后再请求 PING_SAMPLES 次的中位数（浏览器发不了 ICMP）；首次请求失败时没有 */
  readonly ping?: ProbeResult
}

function median(values: readonly number[]): number {
  const sorted = [...values].sort((a, b) => a - b)
  const middle = Math.floor(sorted.length / 2)
  return sorted.length % 2 === 1 ? sorted[middle]! : Math.round((sorted[middle - 1]! + sorted[middle]!) / 2)
}

/** 测一个加速源的延迟与 Ping */
export async function measureLatency(url: string, deps: ProbeDeps = PROBE_DEPS): Promise<LatencyResult> {
  const latency = await probe(url, TEST_TIMEOUT_MS, deps)
  if (!latency.ok) return { latency }
  const samples: number[] = []
  for (let round = 0; round < PING_SAMPLES; round += 1) {
    const result = await probe(url, TEST_TIMEOUT_MS, deps)
    if (!result.ok) return { latency, ping: result }
    samples.push(result.ms)
  }
  return { latency, ping: { ok: true, ms: median(samples) } }
}
