/** 图片预览的缩放、平移计算（像素，视口坐标）：图片左上角在 (x, y)，缩放 scale */
export interface ViewTransform {
  readonly x: number
  readonly y: number
  readonly scale: number
}

export interface Size {
  readonly width: number
  readonly height: number
}

/** 可显示图片的区域：视口去掉四周留白与底部工具栏 */
export interface ViewArea {
  readonly left: number
  readonly top: number
  readonly width: number
  readonly height: number
}

/** 放大上限：不小于原图的 4 倍，也不小于适应窗口时的 16 倍 */
export const MAX_ZOOM = 4
export const MAX_ZOOM_OF_FIT = 16
/** 缩小下限：适应窗口时的 1/4 */
export const MIN_ZOOM_OF_FIT = 0.25

/** 适应窗口：完整显示、居中；小图不放大 */
export function fitTransform(image: Size, area: ViewArea): ViewTransform {
  const scale = Math.min(1, area.width / image.width, area.height / image.height)
  return {
    scale,
    x: area.left + (area.width - image.width * scale) / 2,
    y: area.top + (area.height - image.height * scale) / 2
  }
}

/** 缩放范围 */
export function zoomLimits(fit: number): { readonly min: number; readonly max: number } {
  return { min: fit * MIN_ZOOM_OF_FIT, max: Math.max(MAX_ZOOM, fit * MAX_ZOOM_OF_FIT) }
}

/** 以 (px, py) 为中心缩放到 scale（限制在范围内），该点下的图片位置不动 */
export function zoomTo(
  view: ViewTransform,
  scale: number,
  px: number,
  py: number,
  limits: { readonly min: number; readonly max: number }
): ViewTransform {
  const next = Math.min(limits.max, Math.max(limits.min, scale))
  const ratio = next / view.scale
  return { scale: next, x: px - (px - view.x) * ratio, y: py - (py - view.y) * ratio }
}

/** 滚轮的缩放倍数：向上放大、向下缩小；按行、按页滚动的换算成像素，单次限幅 */
export function wheelFactor(deltaY: number, deltaMode: number): number {
  const pixels = deltaY * (deltaMode === 1 ? 16 : deltaMode === 2 ? 400 : 1)
  return Math.exp(-Math.max(-150, Math.min(150, pixels)) * 0.002)
}
