/**
 * 最小的 ZIP 打包：文件名 UTF-8（通用标志位 11），每个文件按 deflate 压缩（浏览器的 CompressionStream），
 * 压缩后不更小、不支持压缩时原样存储。不写目录项（解压工具按路径建目录），不支持 ZIP64：
 * 文件数不超过 65535、总大小不超过 4 GB（文件夹下载的上限远小于此，见 core/folder-download）
 */

export interface ZipEntry {
  /** 压缩包内的路径，用 / 分隔 */
  readonly name: string
  readonly data: Uint8Array
}

export interface ZipOptions {
  /** 文件的修改时间；不给时用当前时间 */
  readonly date?: Date
  /** 压缩：返回 deflate 原始数据；不压缩时返回 undefined。不给时用 deflateRaw */
  readonly compress?: (data: Uint8Array) => Promise<Uint8Array | undefined>
}

/** ZIP 的上限：文件数（16 位）与偏移、大小（32 位） */
export const MAX_ZIP_ENTRIES = 0xffff
const MAX_UINT32 = 0xffffffff

const STORE = 0
const DEFLATE = 8
/** 解压所需版本 2.0（deflate） */
const VERSION = 20
/** 通用标志位 11：文件名为 UTF-8 */
const UTF8_FLAG = 0x0800

const CRC_TABLE = (() => {
  const table = new Uint32Array(256)
  for (let n = 0; n < 256; n += 1) {
    let c = n
    for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    table[n] = c >>> 0
  }
  return table
})()

export function crc32(data: Uint8Array): number {
  let crc = 0xffffffff
  for (const byte of data) crc = CRC_TABLE[(crc ^ byte) & 0xff]! ^ (crc >>> 8)
  return (crc ^ 0xffffffff) >>> 0
}

/** deflate 原始数据（CompressionStream 的 deflate-raw）；不支持时为 undefined */
export async function deflateRaw(data: Uint8Array): Promise<Uint8Array | undefined> {
  if (typeof CompressionStream === 'undefined') return undefined
  try {
    const stream = new Blob([data as BlobPart]).stream().pipeThrough(new CompressionStream('deflate-raw'))
    return new Uint8Array(await new Response(stream).arrayBuffer())
  } catch {
    return undefined
  }
}

/** MS-DOS 格式的日期、时间（两秒精度，1980 年以前按 1980 年） */
function dosDateTime(date: Date): { readonly date: number; readonly time: number } {
  const year = Math.max(date.getFullYear(), 1980)
  return {
    date: ((year - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate(),
    time: (date.getHours() << 11) | (date.getMinutes() << 5) | (date.getSeconds() >> 1)
  }
}

interface Packed {
  readonly name: Uint8Array
  readonly method: number
  readonly crc: number
  readonly size: number
  readonly body: Uint8Array
  readonly offset: number
}

function header(length: number): { readonly bytes: Uint8Array; readonly view: DataView } {
  const bytes = new Uint8Array(length)
  return { bytes, view: new DataView(bytes.buffer) }
}

/** 本地文件头与中央目录共有的字段：版本、标志、方法、时间、日期、CRC、两个大小、文件名长度 */
function writeCommon(view: DataView, at: number, entry: Packed, stamp: { readonly date: number; readonly time: number }): void {
  view.setUint16(at, VERSION, true)
  view.setUint16(at + 2, UTF8_FLAG, true)
  view.setUint16(at + 4, entry.method, true)
  view.setUint16(at + 6, stamp.time, true)
  view.setUint16(at + 8, stamp.date, true)
  view.setUint32(at + 10, entry.crc, true)
  view.setUint32(at + 14, entry.body.length, true)
  view.setUint32(at + 18, entry.size, true)
  view.setUint16(at + 22, entry.name.length, true)
}

function localHeader(entry: Packed, stamp: { readonly date: number; readonly time: number }): Uint8Array {
  const { bytes, view } = header(30 + entry.name.length)
  view.setUint32(0, 0x04034b50, true)
  writeCommon(view, 4, entry, stamp)
  bytes.set(entry.name, 30)
  return bytes
}

function centralHeader(entry: Packed, stamp: { readonly date: number; readonly time: number }): Uint8Array {
  const { bytes, view } = header(46 + entry.name.length)
  view.setUint32(0, 0x02014b50, true)
  view.setUint16(4, VERSION, true)
  writeCommon(view, 6, entry, stamp)
  // 扩展字段、注释、磁盘号、内部与外部属性为 0
  view.setUint32(42, entry.offset, true)
  bytes.set(entry.name, 46)
  return bytes
}

function endRecord(count: number, size: number, offset: number): Uint8Array {
  const { bytes, view } = header(22)
  view.setUint32(0, 0x06054b50, true)
  view.setUint16(8, count, true)
  view.setUint16(10, count, true)
  view.setUint32(12, size, true)
  view.setUint32(16, offset, true)
  return bytes
}

/** 打包成 ZIP；超出上限（文件数、4 GB）时拒绝 */
export async function createZip(entries: readonly ZipEntry[], options: ZipOptions = {}): Promise<Blob> {
  if (entries.length > MAX_ZIP_ENTRIES) throw new Error('文件数超出 ZIP 上限')
  const stamp = dosDateTime(options.date ?? new Date())
  const compress = options.compress ?? deflateRaw
  const encoder = new TextEncoder()
  const parts: Uint8Array[] = []
  const packed: Packed[] = []
  let offset = 0
  for (const entry of entries) {
    const deflated = entry.data.length > 0 ? await compress(entry.data) : undefined
    const useDeflate = deflated !== undefined && deflated.length < entry.data.length
    const item: Packed = {
      name: encoder.encode(entry.name),
      method: useDeflate ? DEFLATE : STORE,
      crc: crc32(entry.data),
      size: entry.data.length,
      body: useDeflate ? deflated : entry.data,
      offset
    }
    const local = localHeader(item, stamp)
    offset += local.length + item.body.length
    if (offset > MAX_UINT32) throw new Error('大小超出 ZIP 上限')
    parts.push(local, item.body)
    packed.push(item)
  }
  const central = packed.map(item => centralHeader(item, stamp))
  const centralSize = central.reduce((total, bytes) => total + bytes.length, 0)
  if (offset + centralSize > MAX_UINT32) throw new Error('大小超出 ZIP 上限')
  return new Blob([...parts, ...central, endRecord(packed.length, centralSize, offset)] as BlobPart[], { type: 'application/zip' })
}
