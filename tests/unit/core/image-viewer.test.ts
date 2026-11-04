import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createImageViewer, VIEWER_HOST_ATTRIBUTE, type ViewerLabel } from '../../../src/core/image-viewer'

const IMAGES = [
  { src: 'https://example.com/a.png', alt: 'Sample text 1' },
  { src: 'https://example.com/b.png', alt: 'Sample text 2' },
  { src: 'https://example.com/c.png', alt: '' }
]
/** 舞台 832×632，去掉四周 16 的留白后可显示区域 800×600；1600×1200 的图适应窗口为 0.5 倍，左上角在 (16, 16) */
const STAGE = { width: 832, height: 632 }
const FIT = 'translate(16px, 16px) scale(0.5)'

const label = (key: ViewerLabel): string => `label:${key}`
const open = vi.fn()
const download = vi.fn(async (): Promise<void> => {})
let viewer: ReturnType<typeof createImageViewer>

function host(): HTMLElement | null {
  return document.querySelector<HTMLElement>(`[${VIEWER_HOST_ATTRIBUTE}]`)
}

function part<T extends Element = HTMLElement>(selector: string): T {
  return host()!.shadowRoot!.querySelector<T>(selector)!
}

function button(action: string): HTMLButtonElement {
  return part<HTMLButtonElement>(`button[data-action="${action}"]`)
}

function image(): HTMLImageElement {
  return part<HTMLImageElement>('.image')
}

function counter(): string {
  return part('.counter').textContent ?? ''
}

function status(): { readonly text: string; readonly hidden: boolean } {
  const element = part('.status')
  return { text: element.textContent ?? '', hidden: element.hidden }
}

/** 当前图片加载完成，固有尺寸 width×height */
function loadImage(width = 1600, height = 1200): void {
  const element = image()
  Object.defineProperty(element, 'naturalWidth', { value: width, configurable: true })
  Object.defineProperty(element, 'naturalHeight', { value: height, configurable: true })
  element.dispatchEvent(new Event('load'))
}

function transform(): string {
  return image().style.transform
}

function key(name: string, init: KeyboardEventInit = {}): KeyboardEvent {
  const event = new KeyboardEvent('keydown', { key: name, bubbles: true, cancelable: true, ...init })
  document.body.dispatchEvent(event)
  return event
}

function pointer(type: string, x: number, y: number, init: PointerEventInit = {}): void {
  part('.stage').dispatchEvent(
    new PointerEvent(type, {
      clientX: x,
      clientY: y,
      pointerId: 1,
      pointerType: 'mouse',
      button: 0,
      bubbles: true,
      ...init
    })
  )
}

/** 单击舞台上的一点 */
function tap(x: number, y: number): void {
  pointer('pointerdown', x, y)
  pointer('pointerup', x, y)
}

beforeEach(() => {
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(() => new DOMRect(0, 0, STAGE.width, STAGE.height))
  viewer = createImageViewer(document, { label, open, download })
})

afterEach(() => {
  viewer.close()
  vi.restoreAllMocks()
  vi.useRealTimers()
  open.mockClear()
  download.mockClear()
  document.body.innerHTML = ''
  document.documentElement.style.overflow = ''
})

describe('打开与关闭', () => {
  it('打开：浮层在影子树里，对话框、按钮带名称；页面不滚动；焦点在浮层', () => {
    viewer.show(IMAGES, 0)
    expect(viewer.isOpen).toBe(true)
    const dialog = part('[role="dialog"]')
    expect(dialog.getAttribute('aria-modal')).toBe('true')
    expect(host()!.getAttribute('translate')).toBe('no')
    expect(dialog.getAttribute('translate')).toBe('no')
    expect(dialog.getAttribute('aria-label')).toBe('label:dialog')
    for (const action of ['previous', 'next', 'zoomOut', 'zoomIn', 'reset', 'original', 'download', 'close']) {
      expect(button(action).getAttribute('aria-label')).toBe(`label:${action}`)
      expect(button(action).title).toBe(`label:${action}`)
      expect(button(action).querySelector('svg')).not.toBeNull()
    }
    expect(part('[role="toolbar"]')).not.toBeNull()
    expect(document.documentElement.style.overflow).toBe('hidden')
    expect(document.activeElement).toBe(host())
    expect(image().getAttribute('src')).toBe(IMAGES[0]!.src)
    expect(image().alt).toBe('Sample text 1')
  })

  it('关闭：移除浮层，恢复页面滚动与原来的焦点；再打开复用同一浮层', () => {
    document.documentElement.style.overflow = 'auto'
    const trigger = document.createElement('button')
    document.body.append(trigger)
    trigger.focus()
    viewer.show(IMAGES, 0)
    const first = host()
    button('close').click()
    expect(viewer.isOpen).toBe(false)
    expect(host()).toBeNull()
    expect(document.documentElement.style.overflow).toBe('auto')
    expect(document.activeElement).toBe(trigger)
    viewer.show(IMAGES, 1)
    expect(host()).toBe(first)
  })

  it('没有图片：不打开；序号超出范围时取最近的一张', () => {
    viewer.show([], 0)
    expect(viewer.isOpen).toBe(false)
    expect(host()).toBeNull()
    viewer.show(IMAGES, 9)
    expect(counter()).toBe('3 / 3')
  })
})

describe('切换', () => {
  it('计数，首张不能上一张、末张不能下一张', () => {
    viewer.show(IMAGES, 0)
    expect(counter()).toBe('1 / 3')
    expect(button('previous').disabled).toBe(true)
    expect(button('next').disabled).toBe(false)
    button('next').click()
    button('next').click()
    expect(counter()).toBe('3 / 3')
    expect(image().getAttribute('src')).toBe(IMAGES[2]!.src)
    expect(button('next').disabled).toBe(true)
    button('previous').click()
    expect(counter()).toBe('2 / 3')
  })

  it('只有一张：不显示计数与切换按钮', () => {
    viewer.show(IMAGES.slice(0, 1), 0)
    expect(part('.counter').hidden).toBe(true)
    expect(button('previous').hidden).toBe(true)
    expect(button('next').hidden).toBe(true)
    expect(part('.separator').hidden).toBe(true)
    expect(button('zoomIn').hidden).toBe(false)
  })
})

describe('按键', () => {
  it('←/→ 切换，Esc 关闭；按键不交给页面', () => {
    const pageListener = vi.fn()
    document.addEventListener('keydown', pageListener)
    viewer.show(IMAGES, 1)
    expect(key('ArrowRight').defaultPrevented).toBe(true)
    expect(counter()).toBe('3 / 3')
    key('ArrowLeft')
    key('ArrowLeft')
    expect(counter()).toBe('1 / 3')
    key('Escape')
    expect(viewer.isOpen).toBe(false)
    expect(pageListener).not.toHaveBeenCalled()
    key('Escape')
    expect(pageListener).toHaveBeenCalledOnce()
    document.removeEventListener('keydown', pageListener)
  })

  it('带 Ctrl、Meta、Alt 的按键不处理', () => {
    viewer.show(IMAGES, 0)
    expect(key('ArrowRight', { ctrlKey: true }).defaultPrevented).toBe(false)
    expect(key('ArrowRight', { metaKey: true }).defaultPrevented).toBe(false)
    expect(key('ArrowRight', { altKey: true }).defaultPrevented).toBe(false)
    expect(counter()).toBe('1 / 3')
  })

  it('+/- 缩放，0 重置（加载完成后）', () => {
    viewer.show(IMAGES, 0)
    key('+')
    expect(transform()).toBe('')
    loadImage()
    expect(transform()).toBe(FIT)
    key('=')
    expect(transform()).toBe('translate(-84px, -59px) scale(0.625)')
    key('-')
    expect(transform()).toBe(FIT)
    key('_')
    expect(transform()).toBe('translate(96px, 76px) scale(0.4)')
    key('0')
    expect(transform()).toBe(FIT)
  })

  it('Tab 只在浮层的按钮间循环', () => {
    viewer.show(IMAGES, 0)
    const root = host()!.shadowRoot!
    // 首张：上一张不可用，第一个可聚焦的是下一张
    expect(key('Tab').defaultPrevented).toBe(true)
    expect(root.activeElement).toBe(button('next'))
    key('Tab', { shiftKey: true })
    expect(root.activeElement).toBe(button('close'))
    expect(key('Tab').defaultPrevented).toBe(true)
    expect(root.activeElement).toBe(button('next'))
    button('zoomIn').focus()
    expect(key('Tab').defaultPrevented).toBe(false)
  })
})

describe('加载', () => {
  it('超过 300ms 才显示加载中；加载完成后显示图片', () => {
    vi.useFakeTimers()
    viewer.show(IMAGES, 0)
    vi.advanceTimersByTime(299)
    expect(status().hidden).toBe(true)
    vi.advanceTimersByTime(1)
    expect(status()).toEqual({ text: 'label:loading', hidden: false })
    loadImage()
    expect(status().hidden).toBe(true)
    expect(image().classList.contains('is-loaded')).toBe(true)
    expect(image().style.width).toBe('1600px')
    expect(image().style.height).toBe('1200px')
  })

  it('切换后上一张的加载中计时作废', () => {
    vi.useFakeTimers()
    viewer.show(IMAGES, 0)
    vi.advanceTimersByTime(200)
    key('ArrowRight')
    loadImage()
    vi.advanceTimersByTime(500)
    expect(status().hidden).toBe(true)
  })

  it('加载失败：显示加载失败', () => {
    viewer.show(IMAGES, 0)
    image().dispatchEvent(new Event('error'))
    expect(status()).toEqual({ text: 'label:loadFailed', hidden: false })
    key('ArrowRight')
    expect(status().hidden).toBe(true)
  })

  it('没有固有尺寸（如 SVG）：按 300×150 显示', () => {
    viewer.show(IMAGES, 0)
    loadImage(0, 0)
    expect(image().style.width).toBe('300px')
    expect(transform()).toBe('translate(266px, 241px) scale(1)')
  })
})

describe('工具栏', () => {
  it('放大、缩小以舞台中心为准，重置回到适应窗口', () => {
    viewer.show(IMAGES, 0)
    loadImage()
    button('zoomIn').click()
    expect(transform()).toBe('translate(-84px, -59px) scale(0.625)')
    button('zoomOut').click()
    expect(transform()).toBe(FIT)
    button('zoomIn').click()
    button('reset').click()
    expect(transform()).toBe(FIT)
  })

  it('原图：新标签页打开；下载失败时改为新标签页打开', async () => {
    viewer.show(IMAGES, 1)
    button('original').click()
    expect(open).toHaveBeenCalledExactlyOnceWith(IMAGES[1]!.src)
    button('download').click()
    expect(download).toHaveBeenCalledExactlyOnceWith(IMAGES[1]!.src)
    await Promise.resolve()
    expect(open).toHaveBeenCalledOnce()
    download.mockRejectedValueOnce(new Error('blocked'))
    button('download').click()
    await vi.waitFor(() => expect(open).toHaveBeenCalledTimes(2))
    expect(open).toHaveBeenLastCalledWith(IMAGES[1]!.src)
  })
})

describe('指针', () => {
  it('单击图片以外的地方关闭，单击图片不关闭', () => {
    viewer.show(IMAGES, 0)
    loadImage()
    tap(400, 300)
    expect(viewer.isOpen).toBe(true)
    tap(5, 5)
    expect(viewer.isOpen).toBe(false)
  })

  it('拖动平移，松开时不算单击', () => {
    viewer.show(IMAGES, 0)
    loadImage()
    pointer('pointerdown', 5, 5)
    pointer('pointermove', 55, 35)
    expect(transform()).toBe('translate(66px, 46px) scale(0.5)')
    expect(part('.stage').classList.contains('is-dragging')).toBe(true)
    pointer('pointerup', 55, 35)
    expect(viewer.isOpen).toBe(true)
    expect(part('.stage').classList.contains('is-dragging')).toBe(false)
  })

  it('移动不超过 4px 仍算单击', () => {
    viewer.show(IMAGES, 0)
    loadImage()
    pointer('pointerdown', 5, 5)
    pointer('pointermove', 7, 7)
    expect(transform()).toBe(FIT)
    pointer('pointerup', 7, 7)
    expect(viewer.isOpen).toBe(false)
  })

  it('鼠标右键不处理', () => {
    viewer.show(IMAGES, 0)
    loadImage()
    pointer('pointerdown', 5, 5, { button: 2 })
    pointer('pointerup', 5, 5, { button: 2 })
    expect(viewer.isOpen).toBe(true)
  })

  it('双指缩放：随两指距离缩放、随中点移动；抬起时不关闭', () => {
    viewer.show(IMAGES, 0)
    loadImage()
    const touch = (type: string, id: number, x: number): void => pointer(type, x, 316, { pointerId: id, pointerType: 'touch' })
    touch('pointerdown', 1, 316)
    touch('pointerdown', 2, 516)
    touch('pointermove', 2, 716)
    expect(transform()).toBe('translate(-284px, -284px) scale(1)')
    touch('pointerup', 2, 716)
    touch('pointerup', 1, 316)
    expect(viewer.isOpen).toBe(true)
  })

  it('滚轮以指针处为中心缩放，取消页面滚动', () => {
    viewer.show(IMAGES, 0)
    loadImage()
    const wheel = new WheelEvent('wheel', { deltaY: 100, deltaMode: 0, clientX: 416, clientY: 316, cancelable: true })
    part('.stage').dispatchEvent(wheel)
    expect(wheel.defaultPrevented).toBe(true)
    const scale = Number(/scale\(([\d.]+)\)/.exec(transform())![1])
    expect(scale).toBeCloseTo(0.5 * Math.exp(-0.2))
  })

  it('双击图片：适应窗口与原始大小间切换；双击图片外不处理', () => {
    viewer.show(IMAGES, 0)
    loadImage()
    const doubleClick = (x: number, y: number): void => {
      part('.stage').dispatchEvent(new MouseEvent('dblclick', { clientX: x, clientY: y, bubbles: true }))
    }
    doubleClick(5, 5)
    expect(transform()).toBe(FIT)
    doubleClick(416, 316)
    expect(transform()).toBe('translate(-384px, -284px) scale(1)')
    doubleClick(416, 316)
    expect(transform()).toBe(FIT)
  })
})

describe('窗口大小变化', () => {
  it('适应窗口时重新适应；缩放过的不动', () => {
    viewer.show(IMAGES, 0)
    loadImage()
    vi.mocked(HTMLElement.prototype.getBoundingClientRect).mockImplementation(() => new DOMRect(0, 0, 432, 332))
    window.dispatchEvent(new Event('resize'))
    expect(transform()).toBe('translate(16px, 16px) scale(0.25)')
    button('zoomIn').click()
    const zoomed = transform()
    vi.mocked(HTMLElement.prototype.getBoundingClientRect).mockImplementation(() => new DOMRect(0, 0, STAGE.width, STAGE.height))
    window.dispatchEvent(new Event('resize'))
    expect(transform()).toBe(zoomed)
    button('reset').click()
    expect(transform()).toBe(FIT)
  })
})
