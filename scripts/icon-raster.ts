/**
 * 压缩 SVG 内嵌位图。Photoshop 等导出的 SVG 只是把整张大尺寸 PNG 以 base64 内嵌，动辄上 MB。
 * 边长超过上限的位图缩小，取调色板 PNG 与真彩 PNG 中较小者；缩小后反而更大的保持原样。
 * MIME 写错的（如 img/png）改正；其余保持原样。
 */
import sharp from 'sharp'

/** 内嵌位图最大边长：图标最大输出 256px，留 2 倍余量 */
export const MAX_RASTER_SIZE = 512

/** 调色板 PNG 的目标质量（libimagequant，0–100） */
const PALETTE_QUALITY = 85

/** href / xlink:href 中的 base64 data URI：前缀、引号、MIME、数据 */
const DATA_URI_RE = /(href\s*=\s*)(["'])data:([^;,"']*);base64,([^"']*)\2/g

/** base64 中可能夹带的换行与 XML 字符引用 */
const BASE64_NOISE_RE = /&#x?[0-9a-f]+;|\s+/gi

const MIME_BY_FORMAT: Readonly<Record<string, string>> = {
  png: 'image/png',
  jpeg: 'image/jpeg',
  webp: 'image/webp',
  gif: 'image/gif'
}

export interface ShrinkResult {
  readonly svg: string
  /** 缩小的位图数 */
  readonly resized: number
  /** 只改正 MIME 的位图数 */
  readonly retyped: number
}

interface Replacement {
  readonly uri: string
  readonly resized: boolean
}

/** 缩小到上限内，返回调色板 PNG 与真彩 PNG 中较小者 */
async function resizeToPng(input: Buffer, maxSize: number): Promise<Buffer> {
  const resized = sharp(input).resize(maxSize, maxSize, { fit: 'inside', kernel: 'lanczos3' })
  const [palette, truecolor] = await Promise.all([
    resized.clone().png({ palette: true, quality: PALETTE_QUALITY, effort: 10, compressionLevel: 9 }).toBuffer(),
    resized.clone().png({ compressionLevel: 9, adaptiveFiltering: true }).toBuffer()
  ])
  return palette.length <= truecolor.length ? palette : truecolor
}

/** 无需改动时返回 undefined；无法解码的数据（如内嵌 SVG）保持原样 */
async function shrinkDataUri(mime: string, data: string, maxSize: number): Promise<Replacement | undefined> {
  const input = Buffer.from(data.replace(BASE64_NOISE_RE, ''), 'base64')
  const metadata = await sharp(input)
    .metadata()
    .catch(() => undefined)
  const actualMime = metadata?.format ? MIME_BY_FORMAT[metadata.format] : undefined
  if (!metadata || !actualMime) return undefined

  if (Math.max(metadata.width ?? 0, metadata.height ?? 0) > maxSize) {
    const output = await resizeToPng(input, maxSize)
    if (output.length < input.length) {
      return { uri: `data:image/png;base64,${output.toString('base64')}`, resized: true }
    }
  }
  return actualMime === mime ? undefined : { uri: `data:${actualMime};base64,${data}`, resized: false }
}

export async function shrinkEmbeddedRasters(svg: string, maxSize = MAX_RASTER_SIZE): Promise<ShrinkResult> {
  const matches = [...svg.matchAll(DATA_URI_RE)]
  const replacements = await Promise.all(matches.map(match => shrinkDataUri(match[3] ?? '', match[4] ?? '', maxSize)))
  const parts: string[] = []
  let cursor = 0
  matches.forEach((match, index) => {
    const replacement = replacements[index]
    if (!replacement) return
    const [whole, prefix, quote] = match
    parts.push(svg.slice(cursor, match.index), `${prefix}${quote}${replacement.uri}${quote}`)
    cursor = match.index + whole.length
  })
  parts.push(svg.slice(cursor))
  return {
    svg: parts.join(''),
    resized: replacements.filter(replacement => replacement?.resized === true).length,
    retyped: replacements.filter(replacement => replacement?.resized === false).length
  }
}
