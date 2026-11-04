import { describe, expect, it } from 'vitest'
import { fitTransform, MAX_ZOOM, MAX_ZOOM_OF_FIT, MIN_ZOOM_OF_FIT, wheelFactor, zoomLimits, zoomTo } from '../../../src/core/image-geometry'

const AREA = { left: 20, top: 10, width: 800, height: 600 }

describe('fitTransform', () => {
  it('大图缩小到完整显示，居中', () => {
    // 宽受限：1600×600 → 0.5
    expect(fitTransform({ width: 1600, height: 600 }, AREA)).toEqual({ scale: 0.5, x: 20, y: 10 + 150 })
    // 高受限：400×1200 → 0.5
    expect(fitTransform({ width: 400, height: 1200 }, AREA)).toEqual({ scale: 0.5, x: 20 + 300, y: 10 })
  })

  it('小图不放大，原尺寸居中', () => {
    expect(fitTransform({ width: 200, height: 100 }, AREA)).toEqual({ scale: 1, x: 20 + 300, y: 10 + 250 })
  })
})

describe('zoomLimits', () => {
  it('下限为适应窗口的 1/4；上限取原图 4 倍与适应窗口 16 倍中较大的', () => {
    expect(zoomLimits(1)).toEqual({ min: MIN_ZOOM_OF_FIT, max: MAX_ZOOM_OF_FIT })
    expect(zoomLimits(0.1)).toEqual({ min: 0.1 * MIN_ZOOM_OF_FIT, max: MAX_ZOOM })
  })
})

describe('zoomTo', () => {
  const LIMITS = { min: 0.25, max: 4 }

  it('以指定点为中心缩放：该点下的图片位置不动', () => {
    const view = { x: 100, y: 50, scale: 1 }
    const next = zoomTo(view, 2, 300, 250, LIMITS)
    expect(next).toEqual({ scale: 2, x: -100, y: -150 })
    // 图片上 (200, 200) 这一点缩放前后都在 (300, 250)
    expect(view.x + 200 * view.scale).toBe(300)
    expect(next.x + 200 * next.scale).toBe(300)
    expect(next.y + 200 * next.scale).toBe(250)
  })

  it('限制在范围内', () => {
    const view = { x: 0, y: 0, scale: 1 }
    expect(zoomTo(view, 10, 0, 0, LIMITS).scale).toBe(4)
    expect(zoomTo(view, 0.01, 0, 0, LIMITS).scale).toBe(0.25)
  })
})

describe('wheelFactor', () => {
  it('向上放大、向下缩小，同幅度互为倒数', () => {
    expect(wheelFactor(-100, 0)).toBeGreaterThan(1)
    expect(wheelFactor(100, 0)).toBeLessThan(1)
    expect(wheelFactor(100, 0) * wheelFactor(-100, 0)).toBeCloseTo(1)
    expect(wheelFactor(0, 0)).toBe(1)
  })

  it('按行、按页滚动换算成像素；单次限幅', () => {
    expect(wheelFactor(3, 1)).toBeCloseTo(wheelFactor(48, 0))
    expect(wheelFactor(1, 2)).toBe(wheelFactor(150, 0))
    expect(wheelFactor(1000, 0)).toBe(wheelFactor(150, 0))
    expect(wheelFactor(-1000, 0)).toBe(wheelFactor(-150, 0))
  })
})
