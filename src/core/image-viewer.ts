import { createIcon, type IconName } from './icons'
import { fitTransform, wheelFactor, zoomLimits, zoomTo, type Size, type ViewArea, type ViewTransform } from './image-geometry'

/**
 * 图片预览的浮层（影子树内，样式不受页面影响）：适应窗口显示，滚轮、双指缩放，拖动平移，双击在适应窗口与原始大小间切换；
 * 上一张、下一张、缩小、放大、重置、原图（新标签页）、下载、关闭。Esc 关闭，←/→ 切换，+/- 缩放，0 重置
 */

/** 浮层上的文字（按钮的无障碍名称与提示、状态） */
export type ViewerLabel =
  'dialog' | 'previous' | 'next' | 'zoomOut' | 'zoomIn' | 'reset' | 'original' | 'download' | 'close' | 'loading' | 'loadFailed'

export interface ViewerImage {
  readonly src: string
  readonly alt: string
}

export interface ViewerOptions {
  readonly label: (key: ViewerLabel) => string
  /** 在新标签页打开 */
  readonly open: (url: string) => void
  /** 下载；失败时拒绝（改为在新标签页打开） */
  readonly download: (url: string) => Promise<void>
}

export interface ImageViewer {
  /** 显示一组图片，从第 index 张开始 */
  show(images: readonly ViewerImage[], index: number): void
  close(): void
  readonly isOpen: boolean
}

/** 浮层宿主元素上的标记属性 */
export const VIEWER_HOST_ATTRIBUTE = 'data-gcn-image-preview'
/** 图片四周的留白 */
const PADDING = 16
/** 拖动超过这么远（像素）才算拖动，不算单击 */
const DRAG_THRESHOLD = 4
/** 加载超过这么久才显示「加载中」 */
const LOADING_DELAY_MS = 300
/** 按钮缩放的倍数 */
const STEP = 1.25
/** SVG 等没有固有尺寸的图片按这个大小显示 */
const FALLBACK_SIZE: Size = { width: 300, height: 150 }

type Action = 'previous' | 'next' | 'zoomOut' | 'zoomIn' | 'reset' | 'original' | 'download' | 'close'

/** 工具栏：按钮分组，组间加分隔线 */
const TOOLBAR: readonly (readonly Action[])[] = [
  ['previous', 'next'],
  ['zoomOut', 'zoomIn', 'reset'],
  ['original', 'download', 'close']
]

const ICONS: Readonly<Record<Action, IconName>> = {
  previous: 'previous',
  next: 'next',
  zoomOut: 'zoomOut',
  zoomIn: 'zoomIn',
  reset: 'reset',
  original: 'original',
  download: 'download',
  close: 'cross'
}

const STYLE = `
:host { all: initial; }
[hidden] { display: none !important; }
.viewer {
  position: fixed;
  inset: 0;
  z-index: 2147483647;
  display: flex;
  flex-direction: column;
  background: rgba(1, 4, 9, 0.9);
  color: #f0f6fc;
  font: 12px/1.5 -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", Helvetica, Arial, sans-serif;
  outline: none;
}
.stage {
  position: relative;
  flex: 1;
  min-height: 0;
  overflow: hidden;
  touch-action: none;
  user-select: none;
  -webkit-user-select: none;
  cursor: grab;
}
.stage.is-dragging { cursor: grabbing; }
.image {
  position: absolute;
  left: 0;
  top: 0;
  max-width: none;
  max-height: none;
  transform-origin: 0 0;
  opacity: 0;
  transition: opacity 120ms ease-out;
  -webkit-user-drag: none;
  pointer-events: none;
}
.image.is-loaded { opacity: 1; }
.status {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0;
  color: rgba(240, 246, 252, 0.7);
  pointer-events: none;
}
.bar {
  flex: none;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 8px 12px calc(8px + env(safe-area-inset-bottom, 0px));
  background: rgba(1, 4, 9, 0.6);
}
.counter {
  min-width: 48px;
  padding: 0 8px;
  color: rgba(240, 246, 252, 0.8);
  font-variant-numeric: tabular-nums;
  text-align: center;
}
.separator {
  width: 1px;
  height: 20px;
  margin: 0 4px;
  background: rgba(240, 246, 252, 0.2);
}
button {
  all: unset;
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 6px;
  color: #f0f6fc;
  cursor: pointer;
}
button:hover { background: rgba(240, 246, 252, 0.12); }
button:active { background: rgba(240, 246, 252, 0.2); }
button:focus-visible { outline: 2px solid #4493f8; outline-offset: -2px; }
button:disabled { opacity: 0.35; cursor: default; background: none; }
svg { display: block; width: 18px; height: 18px; }
@media (pointer: coarse) {
  button { width: 44px; height: 44px; }
}
@media (prefers-reduced-motion: reduce) {
  .image { transition: none; }
}
`

interface Parts {
  readonly host: HTMLElement
  readonly root: ShadowRoot
  readonly viewer: HTMLElement
  readonly stage: HTMLElement
  readonly image: HTMLImageElement
  readonly status: HTMLElement
  readonly counter: HTMLElement
  readonly buttons: Readonly<Record<Action, HTMLButtonElement>>
  /** 只在多张时显示：计数、上一张、下一张及其后的分隔线 */
  readonly navigation: readonly HTMLElement[]
}

/** 拖动：起点与开始时的位置；两指：开始时的距离、中点与位置 */
type Gesture =
  | {
      readonly kind: 'pan'
      readonly startX: number
      readonly startY: number
      readonly origin: ViewTransform
      moved: boolean
    }
  | { readonly kind: 'pinch'; readonly distance: number; readonly midX: number; readonly midY: number; readonly origin: ViewTransform }

export function createImageViewer(doc: Document, options: ViewerOptions): ImageViewer {
  let parts: Parts | undefined
  let images: readonly ViewerImage[] = []
  let index = 0
  let open = false
  let natural: Size = FALLBACK_SIZE
  let fit: ViewTransform = { x: 0, y: 0, scale: 1 }
  let view: ViewTransform = fit
  let loaded = false
  /** 当前加载的序号：切换、关闭后，上一张的「加载中」计时作废 */
  let loadId = 0
  let loadingTimer: ReturnType<typeof setTimeout> | undefined
  let savedOverflow: string | undefined
  let restoreFocus: HTMLElement | undefined
  const pointers = new Map<number, { x: number; y: number }>()
  let gesture: Gesture | undefined

  function element<K extends keyof HTMLElementTagNameMap>(tag: K, className?: string): HTMLElementTagNameMap[K] {
    const node = doc.createElement(tag)
    if (className) node.className = className
    return node
  }

  function build(): Parts {
    const host = element('div')
    host.setAttribute(VIEWER_HOST_ATTRIBUTE, '')
    // 文字已是界面语言：汉化引擎、浏览器翻译都不处理（影子树内不继承宿主的 translate，另标一次）
    host.setAttribute('translate', 'no')
    const root = host.attachShadow({ mode: 'open' })
    const style = element('style')
    style.textContent = STYLE
    const viewer = element('div', 'viewer')
    viewer.setAttribute('role', 'dialog')
    viewer.setAttribute('aria-modal', 'true')
    viewer.setAttribute('translate', 'no')
    viewer.tabIndex = -1
    const stage = element('div', 'stage')
    const image = element('img', 'image')
    image.draggable = false
    image.decoding = 'async'
    const status = element('p', 'status')
    status.setAttribute('role', 'status')
    stage.append(image, status)
    const bar = element('div', 'bar')
    bar.setAttribute('role', 'toolbar')
    const counter = element('span', 'counter')
    const buttons = {} as Record<Action, HTMLButtonElement>
    const navigation: HTMLElement[] = [counter]
    bar.append(counter)
    TOOLBAR.forEach((group, groupIndex) => {
      for (const action of group) {
        const button = element('button')
        button.type = 'button'
        button.dataset.action = action
        button.append(createIcon(doc, ICONS[action]))
        button.addEventListener('click', () => run(action))
        buttons[action] = button
        bar.append(button)
        if (groupIndex === 0) navigation.push(button)
      }
      if (groupIndex < TOOLBAR.length - 1) {
        const separator = element('span', 'separator')
        bar.append(separator)
        if (groupIndex === 0) navigation.push(separator)
      }
    })
    viewer.append(stage, bar)
    root.append(style, viewer)

    // 换了地址后，上一张的 load、error 不再触发（HTML 标准的 update the image data）
    image.addEventListener('load', onLoad)
    image.addEventListener('error', onError)
    stage.addEventListener('wheel', onWheel, { passive: false })
    stage.addEventListener('pointerdown', onPointerDown)
    stage.addEventListener('pointermove', onPointerMove)
    stage.addEventListener('pointerup', onPointerUp)
    stage.addEventListener('pointercancel', onPointerUp)
    stage.addEventListener('dblclick', onDoubleClick)
    return { host, root, viewer, stage, image, status, counter, buttons, navigation }
  }

  function applyLabels(p: Parts): void {
    p.viewer.setAttribute('aria-label', options.label('dialog'))
    for (const [action, button] of Object.entries(p.buttons) as [Action, HTMLButtonElement][]) {
      const label = options.label(action)
      button.setAttribute('aria-label', label)
      button.title = label
    }
  }

  /** 图片可显示的区域（舞台内坐标） */
  function area(p: Parts): ViewArea {
    const rect = p.stage.getBoundingClientRect()
    return {
      left: PADDING,
      top: PADDING,
      width: Math.max(1, rect.width - PADDING * 2),
      height: Math.max(1, rect.height - PADDING * 2)
    }
  }

  function render(): void {
    if (!parts) return
    const { image } = parts
    image.style.width = `${natural.width}px`
    image.style.height = `${natural.height}px`
    image.style.transform = `translate(${view.x}px, ${view.y}px) scale(${view.scale})`
  }

  function limits(): { readonly min: number; readonly max: number } {
    return zoomLimits(fit.scale)
  }

  function isFitted(): boolean {
    return Math.abs(view.scale - fit.scale) < 1e-6 && Math.abs(view.x - fit.x) < 0.5 && Math.abs(view.y - fit.y) < 0.5
  }

  function refit(): void {
    if (!parts) return
    fit = fitTransform(natural, area(parts))
    view = fit
    render()
  }

  function setStatus(text: string): void {
    if (!parts) return
    parts.status.textContent = text
    parts.status.hidden = text === ''
  }

  function load(next: number): void {
    if (!parts || next < 0 || next >= images.length) return
    index = next
    const id = ++loadId
    const { image, counter, buttons, navigation } = parts
    const current = images[index]!
    loaded = false
    image.classList.remove('is-loaded')
    image.alt = current.alt
    counter.textContent = `${index + 1} / ${images.length}`
    for (const node of navigation) node.hidden = images.length < 2
    buttons.previous.disabled = index === 0
    buttons.next.disabled = index === images.length - 1
    setStatus('')
    clearTimeout(loadingTimer)
    loadingTimer = setTimeout(() => {
      if (id === loadId && !loaded) setStatus(options.label('loading'))
    }, LOADING_DELAY_MS)
    image.src = current.src
  }

  function onLoad(): void {
    if (!parts || !open) return
    clearTimeout(loadingTimer)
    const { image } = parts
    natural = image.naturalWidth > 0 && image.naturalHeight > 0 ? { width: image.naturalWidth, height: image.naturalHeight } : FALLBACK_SIZE
    loaded = true
    setStatus('')
    refit()
    image.classList.add('is-loaded')
  }

  function onError(): void {
    if (!parts || !open || !parts.image.getAttribute('src')) return
    clearTimeout(loadingTimer)
    loaded = false
    setStatus(options.label('loadFailed'))
  }

  /** 舞台中心（舞台内坐标） */
  function center(p: Parts): { x: number; y: number } {
    const rect = p.stage.getBoundingClientRect()
    return { x: rect.width / 2, y: rect.height / 2 }
  }

  function zoomBy(factor: number, x?: number, y?: number): void {
    if (!parts || !loaded) return
    const point = x === undefined || y === undefined ? center(parts) : { x, y }
    view = zoomTo(view, view.scale * factor, point.x, point.y, limits())
    render()
  }

  function run(action: Action): void {
    const current = images[index]
    switch (action) {
      case 'previous':
        load(index - 1)
        return
      case 'next':
        load(index + 1)
        return
      case 'zoomOut':
        zoomBy(1 / STEP)
        return
      case 'zoomIn':
        zoomBy(STEP)
        return
      case 'reset':
        if (loaded) refit()
        return
      case 'original':
        if (current) options.open(current.src)
        return
      case 'download':
        if (current) options.download(current.src).catch(() => options.open(current.src))
        return
      case 'close':
        close()
        return
    }
  }

  /** 舞台内坐标 */
  function local(p: Parts, event: { clientX: number; clientY: number }): { x: number; y: number } {
    const rect = p.stage.getBoundingClientRect()
    return { x: event.clientX - rect.left, y: event.clientY - rect.top }
  }

  /** 点是否落在图片上 */
  function onImage(x: number, y: number): boolean {
    return loaded && x >= view.x && x <= view.x + natural.width * view.scale && y >= view.y && y <= view.y + natural.height * view.scale
  }

  function onWheel(event: WheelEvent): void {
    if (!parts) return
    event.preventDefault()
    const point = local(parts, event)
    zoomBy(wheelFactor(event.deltaY, event.deltaMode), point.x, point.y)
  }

  function startGesture(): void {
    const points = [...pointers.values()]
    if (points.length === 1) {
      const [only] = points
      gesture = { kind: 'pan', startX: only!.x, startY: only!.y, origin: view, moved: gesture !== undefined }
    } else if (points.length >= 2) {
      const [a, b] = points as [{ x: number; y: number }, { x: number; y: number }]
      gesture = {
        kind: 'pinch',
        distance: Math.max(1, Math.hypot(a.x - b.x, a.y - b.y)),
        midX: (a.x + b.x) / 2,
        midY: (a.y + b.y) / 2,
        origin: view
      }
    } else {
      gesture = undefined
    }
  }

  function onPointerDown(event: PointerEvent): void {
    if (!parts || (event.pointerType === 'mouse' && event.button !== 0)) return
    parts.stage.setPointerCapture?.(event.pointerId)
    pointers.set(event.pointerId, local(parts, event))
    startGesture()
  }

  function onPointerMove(event: PointerEvent): void {
    if (!parts || !pointers.has(event.pointerId) || !gesture) return
    pointers.set(event.pointerId, local(parts, event))
    if (gesture.kind === 'pan') {
      const point = pointers.get(event.pointerId)!
      const dx = point.x - gesture.startX
      const dy = point.y - gesture.startY
      if (!gesture.moved && Math.hypot(dx, dy) < DRAG_THRESHOLD) return
      gesture.moved = true
      parts.stage.classList.add('is-dragging')
      if (!loaded) return
      view = { ...gesture.origin, x: gesture.origin.x + dx, y: gesture.origin.y + dy }
      render()
      return
    }
    const [a, b] = [...pointers.values()] as [{ x: number; y: number }, { x: number; y: number }]
    if (!a || !b || !loaded) return
    const midX = (a.x + b.x) / 2
    const midY = (a.y + b.y) / 2
    const ratio = Math.hypot(a.x - b.x, a.y - b.y) / gesture.distance
    const moved = { ...gesture.origin, x: gesture.origin.x + midX - gesture.midX, y: gesture.origin.y + midY - gesture.midY }
    view = zoomTo(moved, gesture.origin.scale * ratio, midX, midY, limits())
    render()
  }

  function onPointerUp(event: PointerEvent): void {
    if (!parts || !pointers.has(event.pointerId)) return
    const point = local(parts, event)
    const tapped = gesture?.kind === 'pan' && !gesture.moved && pointers.size === 1
    pointers.delete(event.pointerId)
    parts.stage.classList.remove('is-dragging')
    // 两指变一指：接着拖动，抬起时不算单击
    if (pointers.size > 0) {
      startGesture()
      if (gesture?.kind === 'pan') gesture.moved = true
      return
    }
    gesture = undefined
    // 单击图片以外的地方关闭
    if (tapped && event.type === 'pointerup' && !onImage(point.x, point.y)) close()
  }

  function onDoubleClick(event: MouseEvent): void {
    if (!parts || !loaded) return
    const point = local(parts, event)
    if (!onImage(point.x, point.y)) return
    if (!isFitted()) {
      refit()
      return
    }
    const target = fit.scale < 1 ? 1 : Math.min(limits().max, fit.scale * 2)
    view = zoomTo(view, target, point.x, point.y, limits())
    render()
  }

  /** 焦点只在浮层的按钮间循环 */
  function trapFocus(event: KeyboardEvent, p: Parts): void {
    const focusable = Object.values(p.buttons).filter(button => !button.disabled && !button.hidden)
    if (focusable.length === 0) return
    const active = p.root.activeElement
    const first = focusable[0]!
    const last = focusable[focusable.length - 1]!
    if (event.shiftKey && (active === first || !focusable.includes(active as HTMLButtonElement))) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && (active === last || !focusable.includes(active as HTMLButtonElement))) {
      event.preventDefault()
      first.focus()
    }
  }

  /** 预览期间的按键：在 window 的捕获阶段处理，不交给页面（GitHub 的快捷键） */
  function onKeyDown(event: KeyboardEvent): void {
    if (!parts || !open) return
    event.stopPropagation()
    if (event.ctrlKey || event.metaKey || event.altKey) return
    const handled = ((): boolean => {
      switch (event.key) {
        case 'Escape':
          close()
          return true
        case 'ArrowLeft':
          load(index - 1)
          return true
        case 'ArrowRight':
          load(index + 1)
          return true
        case '+':
        case '=':
          zoomBy(STEP)
          return true
        case '-':
        case '_':
          zoomBy(1 / STEP)
          return true
        case '0':
          if (loaded) refit()
          return true
        case 'Tab':
          trapFocus(event, parts!)
          return false
        default:
          return false
      }
    })()
    if (handled) event.preventDefault()
  }

  /** 窗口大小变化：未缩放、未拖动时重新适应窗口 */
  function onResize(): void {
    if (!parts || !loaded) return
    const fitted = isFitted()
    fit = fitTransform(natural, area(parts))
    if (fitted) {
      view = fit
      render()
    }
  }

  function show(next: readonly ViewerImage[], start: number): void {
    if (next.length === 0) return
    parts ??= build()
    applyLabels(parts)
    images = next
    if (!open) {
      open = true
      const active = doc.activeElement
      restoreFocus = active instanceof HTMLElement && active !== doc.body ? active : undefined
      ;(doc.body ?? doc.documentElement).append(parts.host)
      const html = doc.documentElement
      savedOverflow = html.style.overflow
      html.style.overflow = 'hidden'
      doc.defaultView?.addEventListener('keydown', onKeyDown, true)
      doc.defaultView?.addEventListener('resize', onResize)
      parts.viewer.focus({ preventScroll: true })
    }
    load(Math.min(Math.max(0, start), next.length - 1))
  }

  function close(): void {
    if (!open || !parts) return
    open = false
    loadId += 1
    clearTimeout(loadingTimer)
    pointers.clear()
    gesture = undefined
    doc.defaultView?.removeEventListener('keydown', onKeyDown, true)
    doc.defaultView?.removeEventListener('resize', onResize)
    parts.image.removeAttribute('src')
    parts.image.classList.remove('is-loaded')
    parts.stage.classList.remove('is-dragging')
    parts.host.remove()
    doc.documentElement.style.overflow = savedOverflow ?? ''
    savedOverflow = undefined
    loaded = false
    images = []
    restoreFocus?.focus({ preventScroll: true })
    restoreFocus = undefined
  }

  return {
    show,
    close,
    get isOpen() {
      return open
    }
  }
}
