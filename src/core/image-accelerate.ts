import { parseImageUrl } from '../shared/accelerate'
import type { Settings } from '../shared/settings'
import { isPrivatePage } from './private-page'

/**
 * 图片加速：开启后，GitHub 的图片（头像、GitHub 自己的图片、存储库与代码片段中的图片文件）加载失败时，
 * 请后台经加速源取回，换成 data: 地址（GitHub 的 CSP 允许 data: 图片，不允许加速源的站点，
 * 所以不能直接改成加速源的地址）。不公开的页面（私有存储库、私密代码片段）中的图片不处理
 */
export interface ImageAccelerateOptions {
  readonly settings: () => Settings
  /** 请后台经加速源取回图片，返回 data: 地址；取不到时拒绝 */
  readonly fetchImage: (url: string) => Promise<string>
}

export interface ImageAccelerator {
  /** 图片加载失败：在 window 的捕获阶段监听 error 事件（图片的 error 不冒泡） */
  readonly onError: (event: Event) => void
  /** 处理页面上已加载失败的图片（开启图片加速时） */
  retryFailed(doc: Document): void
}

/** 同时请后台取回的图片数 */
const MAX_CONCURRENT = 4
/** 记住的取回结果数（同一头像在页面上反复出现）；失败的也记住，不反复请求 */
const MAX_CACHED = 200

/** 图片当前在用的地址 */
function currentUrl(img: HTMLImageElement): string {
  return img.currentSrc || img.src
}

/** 解析地址；不合法时为 undefined */
function resolveUrl(url: string, base: string): string | undefined {
  try {
    return new URL(url, base).href
  } catch {
    return undefined
  }
}

/** 把 srcset 中解析后等于 failed 的地址换成 replacement；没有时返回 undefined */
function replaceInSrcset(srcset: string, base: string, failed: string, replacement: string): string | undefined {
  let changed = false
  const candidates = srcset.split(/,\s+/).map((candidate) => {
    const [url = '', ...descriptors] = candidate.trim().split(/\s+/)
    if (resolveUrl(url, base) !== failed) return candidate
    changed = true
    return [replacement, ...descriptors].join(' ')
  })
  return changed ? candidates.join(', ') : undefined
}

/** 换上取回的图片：<img> 的 src、srcset，以及所在 <picture> 中各 <source> 的 srcset */
function replaceImage(img: HTMLImageElement, failed: string, dataUrl: string): void {
  const base = img.baseURI
  const sources = img.parentElement instanceof HTMLPictureElement ? img.parentElement.querySelectorAll('source') : []
  for (const element of [...sources, img]) {
    const srcset = element.getAttribute('srcset')
    const next = srcset && replaceInSrcset(srcset, base, failed, dataUrl)
    if (next) element.setAttribute('srcset', next)
  }
  if (img.src === failed) img.setAttribute('src', dataUrl)
}

export function createImageAccelerator(options: ImageAccelerateOptions): ImageAccelerator {
  /** 原地址 → 取回的 data: 地址 */
  const cache = new Map<string, Promise<string>>()
  const waiting: (() => void)[] = []
  let running = 0

  function schedule(task: () => Promise<string>): Promise<string> {
    return new Promise((resolve, reject) => {
      const run = (): void => {
        running += 1
        task()
          .then(resolve, reject)
          .finally(() => {
            running -= 1
            waiting.shift()?.()
          })
      }
      if (running < MAX_CONCURRENT) run()
      else waiting.push(run)
    })
  }

  function load(url: string): Promise<string> {
    const cached = cache.get(url)
    if (cached) return cached
    const task = schedule(() => options.fetchImage(url))
    // 失败的结果也记住；这里只防未处理的拒绝
    task.catch(() => undefined)
    cache.set(url, task)
    if (cache.size > MAX_CACHED) cache.delete(cache.keys().next().value!)
    return task
  }

  function retry(img: HTMLImageElement): void {
    const failed = currentUrl(img)
    const settings = options.settings()
    if (!settings.enabled || !settings.accelerateImages || !failed || failed.startsWith('data:')) return
    const link = parseImageUrl(failed)
    if (!link || isPrivatePage(img.ownerDocument)) return
    load(link.url).then(
      (dataUrl) => {
        // 等待期间页面换了图：不动
        if (currentUrl(img) === failed) replaceImage(img, failed, dataUrl)
      },
      () => undefined,
    )
  }

  return {
    onError(event) {
      if (event.target instanceof HTMLImageElement) retry(event.target)
    },
    retryFailed(doc) {
      for (const img of doc.querySelectorAll('img')) {
        if (img.complete && img.naturalWidth === 0 && img.naturalHeight === 0) retry(img)
      }
    },
  }
}
