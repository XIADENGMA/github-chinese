// @vitest-environment node
import sharp from 'sharp'
import { describe, expect, it } from 'vitest'
import { MAX_RASTER_SIZE, shrinkEmbeddedRasters } from '../../../scripts/icon-raster'

/** 渐变色块 PNG 的 base64 */
async function pngBase64(width: number, height: number): Promise<string> {
  const pixels = Buffer.alloc(width * height * 4)
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const offset = (y * width + x) * 4
      pixels[offset] = (x * 7) % 256
      pixels[offset + 1] = (y * 3) % 256
      pixels[offset + 2] = 200
      pixels[offset + 3] = x < 8 ? 0 : 255
    }
  }
  const png = await sharp(pixels, { raw: { width, height, channels: 4 } })
    .png()
    .toBuffer()
  return png.toString('base64')
}

function wrap(href: string, quote = '"'): string {
  return [
    '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 1254 1254">',
    `<image id="图层_1" width="1254" height="1254" xlink:href=${quote}${href}${quote}/>`,
    '</svg>'
  ].join('\n')
}

async function embeddedSize(svg: string): Promise<[number | undefined, number | undefined]> {
  const data = /base64,([^"']+)/.exec(svg)?.[1] ?? ''
  const metadata = await sharp(Buffer.from(data, 'base64')).metadata()
  return [metadata.width, metadata.height]
}

describe('shrinkEmbeddedRasters', () => {
  it('缩小超过上限的位图，改为 image/png，其余属性不变', async () => {
    const svg = wrap(`data:img/png;base64,${await pngBase64(1254, 1254)}`)

    const result = await shrinkEmbeddedRasters(svg)

    expect(result).toMatchObject({ resized: 1, retyped: 0 })
    expect(result.svg).toContain('<image id="图层_1" width="1254" height="1254" xlink:href="data:image/png;base64,')
    expect(result.svg.length).toBeLessThan(svg.length)
    expect(await embeddedSize(result.svg)).toEqual([MAX_RASTER_SIZE, MAX_RASTER_SIZE])
  })

  it('保持宽高比', async () => {
    const result = await shrinkEmbeddedRasters(wrap(`data:image/png;base64,${await pngBase64(1024, 600)}`))

    expect(result.resized).toBe(1)
    expect(await embeddedSize(result.svg)).toEqual([512, 300])
  })

  it('处理结果再次处理时不变', async () => {
    const first = await shrinkEmbeddedRasters(wrap(`data:image/png;base64,${await pngBase64(900, 900)}`))

    const second = await shrinkEmbeddedRasters(first.svg)

    expect(second).toEqual({ svg: first.svg, resized: 0, retyped: 0 })
  })

  it('未超上限的位图只改正 MIME', async () => {
    const data = await pngBase64(64, 64)

    const result = await shrinkEmbeddedRasters(wrap(`data:img/png;base64,${data}`))

    expect(result).toEqual({ svg: wrap(`data:image/png;base64,${data}`), resized: 0, retyped: 1 })
  })

  it('支持单引号与带换行、字符引用的 base64', async () => {
    const data = await pngBase64(700, 700)
    const noisy = `${data.slice(0, 40)}&#10;\n  ${data.slice(40)}`

    const result = await shrinkEmbeddedRasters(wrap(`data:image/png;base64,${noisy}`, "'"))

    expect(result.resized).toBe(1)
    expect(result.svg).toContain("xlink:href='data:image/png;base64,")
    expect(await embeddedSize(result.svg)).toEqual([512, 512])
  })

  it('缩小后反而更大时保持原样', async () => {
    // 8px 随机纹理平铺：原图靠重复压得极小，缩放后周期被打乱，两种 PNG 都更大
    const width = 600
    const tile = 8
    let seed = 7
    const random = (): number => (seed = (seed * 1103515245 + 12345) % 2147483648) % 256
    const texture = Array.from({ length: tile * tile * 3 }, random)
    const pixels = Buffer.alloc(width * width * 4, 255)
    for (let y = 0; y < width; y++) {
      for (let x = 0; x < width; x++) {
        const offset = (y * width + x) * 4
        const source = ((y % tile) * tile + (x % tile)) * 3
        pixels[offset] = texture[source] ?? 0
        pixels[offset + 1] = texture[source + 1] ?? 0
        pixels[offset + 2] = texture[source + 2] ?? 0
      }
    }
    const png = await sharp(pixels, { raw: { width, height: width, channels: 4 } })
      .png()
      .toBuffer()
    const svg = wrap(`data:image/png;base64,${png.toString('base64')}`)

    expect(await shrinkEmbeddedRasters(svg)).toEqual({ svg, resized: 0, retyped: 0 })
  })

  it('无内嵌位图、无法解码或内嵌 SVG 时原样返回', async () => {
    const vector = '<svg xmlns="http://www.w3.org/2000/svg"><rect width="1" height="1"/></svg>'
    const broken = wrap('data:image/png;base64,AAAA')
    const nested = wrap(`data:image/svg+xml;base64,${Buffer.from(vector).toString('base64')}`)

    for (const svg of [vector, broken, nested]) {
      expect(await shrinkEmbeddedRasters(svg)).toEqual({ svg, resized: 0, retyped: 0 })
    }
  })

  it('支持自定义上限', async () => {
    const result = await shrinkEmbeddedRasters(wrap(`data:image/png;base64,${await pngBase64(300, 300)}`), 128)

    expect(await embeddedSize(result.svg)).toEqual([128, 128])
  })
})
