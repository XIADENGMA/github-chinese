/**
 * 文件夹下载的文件列表与取回：用 GitHub 自己的接口（目录页按 JSON 请求时返回页面数据，Raw 地址取文件），
 * 同站请求带 Cookie，私有存储库、企业版站点同样可用；经加速源取回时不带 Cookie 与来源页。
 * 各请求用目录页数据里的提交 SHA：下载期间分支有新提交也取到同一版本
 */

/** 目录页：所有者、存储库来自地址，目录路径与提交来自页面数据 */
export interface FolderInfo {
  readonly owner: string
  readonly repo: string
  /** 目录在存储库中的路径，不带首尾的 /；根目录为空串 */
  readonly path: string
  /** 提交的 SHA */
  readonly oid: string
}

/** 失败原因：文件过多（含目录过大、页面只给出部分条目）、文件过大、没有文件、请求失败 */
export type FolderErrorReason = 'tooMany' | 'tooLarge' | 'empty' | 'failed'

export class FolderError extends Error {
  constructor(readonly reason: FolderErrorReason) {
    super(`文件夹下载失败：${reason}`)
  }
}

/** 文件数、目录数、总大小的上限：超出时不下载（大目录用 Download ZIP 或 git 稀疏检出） */
export const MAX_FILES = 1000
export const MAX_DIRECTORIES = 300
export const MAX_TOTAL_BYTES = 500 * 1024 * 1024
/** 同时进行的请求数：列目录、取文件 */
export const LIST_CONCURRENCY = 4
export const FETCH_CONCURRENCY = 6
/** 取文件失败时重试的次数 */
export const FETCH_RETRIES = 1

export type FetchLike = (url: string, init: RequestInit) => Promise<Response>

/** 目录页：/<所有者>/<存储库>/tree/<引用>[/<路径>] */
const TREE_PATH_RE = /^\/([^/]+)\/([^/]+)\/tree\/[^/]/

/** 目录页的所有者、存储库；不是目录页时为 undefined */
export function treePage(pathname: string): { readonly owner: string; readonly repo: string } | undefined {
  const match = TREE_PATH_RE.exec(pathname)
  return match ? { owner: decodeURIComponent(match[1]!), repo: decodeURIComponent(match[2]!) } : undefined
}

/** 路径的每一段分别编码 */
export function encodePath(path: string): string {
  return path.split('/').map(encodeURIComponent).join('/')
}

interface TreeItem {
  readonly path: string
  readonly contentType: string
}

interface TreeData {
  readonly path: string
  readonly oid: string
  readonly items: readonly TreeItem[]
  readonly totalCount: number
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/** 目录页的页面数据：payload.codeViewTreeRoute 下的 path、refInfo.currentOid、tree.items、tree.totalCount */
export function parseTreeData(json: unknown): TreeData | undefined {
  const route = isRecord(json) && isRecord(json.payload) ? json.payload.codeViewTreeRoute : undefined
  if (!isRecord(route) || typeof route.path !== 'string' || !isRecord(route.refInfo) || !isRecord(route.tree)) return undefined
  const { currentOid } = route.refInfo
  const { items, totalCount } = route.tree
  if (typeof currentOid !== 'string' || !/^[0-9a-f]{40,64}$/.test(currentOid) || !Array.isArray(items)) return undefined
  const parsed: TreeItem[] = []
  for (const item of items) {
    if (!isRecord(item) || typeof item.path !== 'string' || typeof item.contentType !== 'string') return undefined
    parsed.push({ path: item.path, contentType: item.contentType })
  }
  return {
    path: route.path.replace(/^\/+|\/+$/g, ''),
    oid: currentOid,
    items: parsed,
    totalCount: typeof totalCount === 'number' ? totalCount : parsed.length
  }
}

async function fetchTree(fetcher: FetchLike, url: string, signal: AbortSignal): Promise<TreeData> {
  const response = await fetcher(url, { credentials: 'same-origin', headers: { Accept: 'application/json' }, signal })
  const data = response.ok ? parseTreeData(await response.json().catch(() => undefined)) : undefined
  if (!data) throw new FolderError('failed')
  // 目录条目过多时页面只给出一部分
  if (data.items.length < data.totalCount) throw new FolderError('tooMany')
  return data
}

/** 依次处理，同时进行的不超过 limit 个；任一失败时拒绝（其余照常结束） */
export async function runPool<T>(items: readonly T[], limit: number, worker: (item: T) => Promise<void>): Promise<void> {
  let next = 0
  const lanes = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (next < items.length) {
      const item = items[next]!
      next += 1
      await worker(item)
    }
  })
  await Promise.all(lanes)
}

/**
 * 列出目录下（含子目录）的全部文件：逐级请求目录页的页面数据。子模块、指向目录的符号链接跳过。
 * 超出 MAX_FILES、MAX_DIRECTORIES 或某级目录条目过多时以 tooMany 拒绝
 */
export async function listFolder(
  origin: string,
  pathname: string,
  fetcher: FetchLike,
  signal: AbortSignal
): Promise<{ readonly info: FolderInfo; readonly files: readonly string[] }> {
  const page = treePage(pathname)
  if (!page) throw new FolderError('failed')
  const root = await fetchTree(fetcher, `${origin}${pathname}`, signal)
  const info: FolderInfo = { ...page, path: root.path, oid: root.oid }
  const base = `${origin}/${encodePath(page.owner)}/${encodePath(page.repo)}/tree/${root.oid}/`
  const files: string[] = []
  let directories = 1
  let pending: readonly TreeItem[] = root.items
  while (pending.length > 0) {
    const subdirectories: string[] = []
    for (const item of pending) {
      if (item.contentType === 'directory') subdirectories.push(item.path)
      else if (item.contentType === 'file' || item.contentType === 'symlink_file') files.push(item.path)
    }
    directories += subdirectories.length
    if (files.length > MAX_FILES || directories > MAX_DIRECTORIES) throw new FolderError('tooMany')
    const found: TreeItem[] = []
    await runPool(subdirectories, LIST_CONCURRENCY, async path => {
      signal.throwIfAborted()
      found.push(...(await fetchTree(fetcher, `${base}${encodePath(path)}`, signal)).items)
    })
    pending = found
  }
  if (files.length === 0) throw new FolderError('empty')
  return { info, files: files.sort() }
}

/** 取一个文件；应答不成功、网络出错时重试，仍失败时以 failed 拒绝；取消时以 AbortError 拒绝 */
export async function fetchFile(fetcher: FetchLike, url: string, init: RequestInit, signal: AbortSignal): Promise<Uint8Array> {
  for (let attempt = 0; ; attempt += 1) {
    signal.throwIfAborted()
    try {
      const response = await fetcher(url, { ...init, signal })
      if (response.ok) return new Uint8Array(await response.arrayBuffer())
    } catch (error) {
      if (signal.aborted) throw error
    }
    if (attempt >= FETCH_RETRIES) throw new FolderError('failed')
  }
}
