import { accelerateLink, candidateSources, parseImageUrl } from './accelerate'
import type { Settings } from './settings'

/** 单个加速源取图片的时限 */
export const IMAGE_TIMEOUT_MS = 10_000
/** 图片大小上限：data: 地址经消息传给页面，超出的不取 */
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024

/** 可放进 data: 地址的图片类型 */
const IMAGE_TYPE_RE = /^image\/[a-z0-9.+-]+$/

export interface ImageFetchDeps {
  fetch(url: string, init: RequestInit): Promise<Response>
}

export const IMAGE_FETCH_DEPS: ImageFetchDeps = {
  // 不把全局 fetch 直接挂到对象上：以对象为 this 调用会报 Illegal invocation
  fetch: (url, init) => fetch(url, init),
}

function toBase64(bytes: Uint8Array): string {
  let binary = ''
  // 分段转换：一次展开过多参数会超出调用栈
  for (let start = 0; start < bytes.length; start += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(start, start + 0x8000))
  }
  return btoa(binary)
}

/** 取一个地址，返回 data: 地址；应答不成功、不是图片、超出大小上限或超时时为 undefined */
async function fetchDataUrl(url: string, deps: ImageFetchDeps): Promise<string | undefined> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), IMAGE_TIMEOUT_MS)
  try {
    // 加速源的应答带 Access-Control-Allow-Origin: *，不需要主机权限
    const response = await deps.fetch(url, {
      credentials: 'omit',
      referrerPolicy: 'no-referrer',
      signal: controller.signal,
    })
    const type = (response.headers.get('content-type') ?? '').split(';')[0]!.trim().toLowerCase()
    if (!response.ok || !IMAGE_TYPE_RE.test(type)) return undefined
    if (Number(response.headers.get('content-length')) > MAX_IMAGE_BYTES) return undefined
    const bytes = new Uint8Array(await response.arrayBuffer())
    return bytes.length > MAX_IMAGE_BYTES ? undefined : `data:${type};base64,${toBase64(bytes)}`
  } catch {
    return undefined
  } finally {
    clearTimeout(timer)
  }
}

/**
 * 经加速源取回加载失败的图片（后台），返回 data: 地址（GitHub 的 CSP 允许 data: 图片，不允许加速源的站点）。
 * 只用支持该地址的加速源：故障转移关闭时只试第一个（首选，或首选不支持时第一个支持的），开启时依次尝试。
 * 未开启、不是可加速的图片、都取不到时为 undefined
 */
export async function fetchImage(
  href: string,
  settings: Settings,
  deps: ImageFetchDeps = IMAGE_FETCH_DEPS,
): Promise<string | undefined> {
  const link = parseImageUrl(href)
  if (!link || !settings.enabled || !settings.accelerateImages) return undefined
  const sources = candidateSources(settings, link)
  for (const source of settings.failover ? sources : sources.slice(0, 1)) {
    const url = accelerateLink(source.template, link)
    const dataUrl = url && (await fetchDataUrl(url, deps))
    if (dataUrl) return dataUrl
  }
  return undefined
}
