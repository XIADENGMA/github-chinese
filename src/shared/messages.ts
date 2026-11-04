import type { PageKey } from '../core/types'
import { isPageLocale, type PageLocale } from './locale'

/** popup、后台 → content script 的消息 */
export type ContentMessage =
  | { readonly type: 'gcn:get-status' }
  /** 自定义词条已变化，重新读取（后台转发设置页的保存通知） */
  | { readonly type: 'gcn:custom-entries-changed' }
  /** 搜索净化的屏蔽规则已变化，重新读取（同上） */
  | { readonly type: 'gcn:search-rules-changed' }

/** popup 向内容脚本发的请求 */
export type TabRequest = Extract<ContentMessage, { readonly type: 'gcn:get-status' }>

export interface ContentStatus {
  /** 当前页面正在翻译 */
  readonly active: boolean
  /** 当前路径被排除 */
  readonly excluded: boolean
  /** 当前页面类型 */
  readonly pages: readonly PageKey[]
  /** 已翻译的文本节点与属性数 */
  readonly translatedCount: number
}

/** 内容脚本、扩展页面 → 后台的消息 */
export type BackgroundMessage =
  /** 自定义词条已保存（设置页），由后台转发给各 GitHub 标签页 */
  | { readonly type: 'gcn:custom-entries-saved' }
  /** 搜索净化的屏蔽规则已保存（设置页），由后台转发给各 GitHub 标签页 */
  | { readonly type: 'gcn:search-rules-saved' }
  /** 内容脚本动态导入词典脚本失败时，请后台把词典脚本注入发送方所在的框架 */
  | { readonly type: 'gcn:inject-locale'; readonly locale: PageLocale }
  /** 点击了下载链接、显示或复制加速地址（故障转移开启、自动选择时）：请后台选出可用的加速源，应答加速后的地址（见 ResolvedDownload） */
  | { readonly type: 'gcn:resolve-download'; readonly url: string }
  /** 图片加载失败（开启图片加速时）：请后台经加速源取回，应答 data: 地址（见 FetchedImage） */
  | { readonly type: 'gcn:fetch-image'; readonly url: string }

/** 后台应答：处理成功为 ok */
export interface BackgroundAck {
  readonly ok: boolean
}

/** 后台对 gcn:resolve-download 的应答：加速后的地址，或没有可用加速源时的原地址 */
export interface ResolvedDownload {
  readonly ok: true
  readonly url: string
}

/** 后台对 gcn:fetch-image 的应答：经加速源取回的图片 */
export interface FetchedImage {
  readonly ok: true
  /** data: 地址 */
  readonly url: string
}

/** 图片的 data: 地址 */
const DATA_IMAGE_RE = /^data:image\/[a-z0-9.+-]+;base64,/

/** 下载链接的长度上限：超出的不处理 */
const MAX_URL_LENGTH = 4096

const CONTENT_MESSAGE_TYPES: ReadonlySet<string> = new Set<ContentMessage['type']>([
  'gcn:get-status',
  'gcn:custom-entries-changed',
  'gcn:search-rules-changed',
])

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isCount(value: unknown): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value) && value >= 0
}

export function isContentMessage(value: unknown): value is ContentMessage {
  return isRecord(value) && typeof value.type === 'string' && CONTENT_MESSAGE_TYPES.has(value.type)
}

/** 校验内容脚本返回的状态 */
export function isContentStatus(value: unknown): value is ContentStatus {
  return (
    isRecord(value) &&
    typeof value.active === 'boolean' &&
    typeof value.excluded === 'boolean' &&
    Array.isArray(value.pages) &&
    value.pages.every((page) => typeof page === 'string') &&
    isCount(value.translatedCount)
  )
}

/** 校验发往后台的消息 */
export function isBackgroundMessage(value: unknown): value is BackgroundMessage {
  if (!isRecord(value)) return false
  switch (value.type) {
    case 'gcn:custom-entries-saved':
    case 'gcn:search-rules-saved':
      return true
    case 'gcn:inject-locale':
      return isPageLocale(value.locale)
    case 'gcn:resolve-download':
    case 'gcn:fetch-image':
      return typeof value.url === 'string' && value.url.length <= MAX_URL_LENGTH
    default:
      return false
  }
}

/** 后台已确认处理 */
export function isAcknowledged(value: unknown): value is BackgroundAck {
  return isRecord(value) && value.ok === true
}

/** 校验后台对 gcn:resolve-download 的应答 */
export function isResolvedDownload(value: unknown): value is ResolvedDownload {
  return isRecord(value) && value.ok === true && typeof value.url === 'string' && value.url.startsWith('https://')
}

/** 校验后台对 gcn:fetch-image 的应答：base64 编码的图片 data: 地址 */
export function isFetchedImage(value: unknown): value is FetchedImage {
  return isRecord(value) && value.ok === true && typeof value.url === 'string' && DATA_IMAGE_RE.test(value.url)
}
