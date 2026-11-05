/** 页面内控件（加速选项、下载文件夹、图片预览）用的线条图标：16×16，描边随文字颜色（小三角描边后近似实心） */

const SVG_NS = 'http://www.w3.org/2000/svg'

/** 图标的图形：path 的 d 或 rect（x、y、宽、高、圆角） */
type Shape = { readonly d: string } | { readonly rect: readonly [number, number, number, number, number] }

const ICONS = {
  copy: [{ rect: [5.5, 5.5, 8, 8, 1.5] }, { d: 'M10.5 3.5v-.5a1.5 1.5 0 0 0-1.5-1.5H4A1.5 1.5 0 0 0 2.5 3v5A1.5 1.5 0 0 0 4 9.5h.5' }],
  check: [{ d: 'M3 8.5l3 3 7-7' }],
  cross: [{ d: 'M4 4l8 8M12 4l-8 8' }],
  previous: [{ d: 'M10 3L5 8l5 5' }],
  next: [{ d: 'M6 3l5 5-5 5' }],
  zoomIn: [{ d: 'M8 3v10M3 8h10' }],
  zoomOut: [{ d: 'M3 8h10' }],
  reset: [{ d: 'M2.5 6V2.5H6M13.5 6V2.5H10M2.5 10v3.5H6M13.5 10v3.5H10' }],
  original: [{ d: 'M9 2.5h4.5V7M13.5 2.5L7.5 8.5M12 9.5v3a1 1 0 0 1-1 1H3.5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h3' }],
  link: [{ d: 'M6.5 9.5l3-3M7.25 4.75l1-1a2.475 2.475 0 0 1 3.5 3.5l-1 1M8.75 11.25l-1 1a2.475 2.475 0 0 1-3.5-3.5l1-1' }],
  download: [{ d: 'M8 2.5v8M4.5 7L8 10.5 11.5 7M2.5 13.5h11' }],
  zap: [{ d: 'M9 1.5L3.5 9h4L7 14.5 12.5 7h-4L9 1.5z' }],
  triangleDown: [{ d: 'M5 6.5h6L8 9.5z' }]
} as const satisfies Readonly<Record<string, readonly Shape[]>>

export type IconName = keyof typeof ICONS

/** 创建图标（不用 innerHTML）；读屏软件跳过 */
export function createIcon(doc: Document, name: IconName): SVGSVGElement {
  const svg = doc.createElementNS(SVG_NS, 'svg')
  for (const [key, value] of Object.entries({
    viewBox: '0 0 16 16',
    width: '16',
    height: '16',
    fill: 'none',
    stroke: 'currentColor',
    'stroke-width': '1.5',
    'stroke-linecap': 'round',
    'stroke-linejoin': 'round',
    'aria-hidden': 'true',
    focusable: 'false'
  })) {
    svg.setAttribute(key, value)
  }
  for (const shape of ICONS[name] as readonly Shape[]) {
    if ('d' in shape) {
      const path = doc.createElementNS(SVG_NS, 'path')
      path.setAttribute('d', shape.d)
      svg.append(path)
      continue
    }
    const [x, y, width, height, radius] = shape.rect
    const rect = doc.createElementNS(SVG_NS, 'rect')
    for (const [key, value] of Object.entries({ x, y, width, height, rx: radius })) rect.setAttribute(key, String(value))
    svg.append(rect)
  }
  return svg
}
