import { deflateRawSync, inflateRawSync } from 'node:zlib'
import { describe, expect, it } from 'vitest'
import { createZip, crc32, deflateRaw, MAX_ZIP_ENTRIES, type ZipEntry } from '../../../src/core/zip'

const encoder = new TextEncoder()
const decoder = new TextDecoder()

interface ParsedEntry {
  readonly name: string
  readonly flags: number
  readonly method: number
  readonly time: number
  readonly date: number
  readonly crc: number
  readonly size: number
  readonly data: Uint8Array
}

/** 按中央目录读出各文件，并与本地文件头逐项核对 */
async function readZip(blob: Blob): Promise<ParsedEntry[]> {
  const bytes = new Uint8Array(await blob.arrayBuffer())
  const view = new DataView(bytes.buffer)
  const end = bytes.length - 22
  expect(view.getUint32(end, true)).toBe(0x06054b50)
  const count = view.getUint16(end + 10, true)
  expect(view.getUint16(end + 8, true)).toBe(count)
  const centralSize = view.getUint32(end + 12, true)
  let at = view.getUint32(end + 16, true)
  expect(at + centralSize).toBe(end)
  const entries: ParsedEntry[] = []
  for (let index = 0; index < count; index += 1) {
    expect(view.getUint32(at, true)).toBe(0x02014b50)
    const nameLength = view.getUint16(at + 28, true)
    const offset = view.getUint32(at + 42, true)
    const central = {
      flags: view.getUint16(at + 8, true),
      method: view.getUint16(at + 10, true),
      time: view.getUint16(at + 12, true),
      date: view.getUint16(at + 14, true),
      crc: view.getUint32(at + 16, true),
      compressed: view.getUint32(at + 20, true),
      size: view.getUint32(at + 24, true),
      name: decoder.decode(bytes.subarray(at + 46, at + 46 + nameLength))
    }
    // 本地文件头与中央目录一致
    expect(view.getUint32(offset, true)).toBe(0x04034b50)
    expect(view.getUint16(offset + 6, true)).toBe(central.flags)
    expect(view.getUint16(offset + 8, true)).toBe(central.method)
    expect(view.getUint32(offset + 14, true)).toBe(central.crc)
    expect(view.getUint32(offset + 18, true)).toBe(central.compressed)
    expect(view.getUint32(offset + 22, true)).toBe(central.size)
    const localName = view.getUint16(offset + 26, true)
    const extra = view.getUint16(offset + 28, true)
    const start = offset + 30 + localName + extra
    const body = bytes.subarray(start, start + central.compressed)
    const data = central.method === 8 ? new Uint8Array(inflateRawSync(body)) : body
    const { name, flags, method, time, date, crc, size } = central
    entries.push({ name, flags, method, time, date, crc, size, data })
    at += 46 + nameLength
  }
  return entries
}

/** 用 Node 的 zlib 压缩（与浏览器的 deflate-raw 格式相同） */
async function nodeDeflate(data: Uint8Array): Promise<Uint8Array> {
  return new Uint8Array(deflateRawSync(data))
}

function entry(name: string, text: string): ZipEntry {
  return { name, data: encoder.encode(text) }
}

describe('crc32', () => {
  it('标准校验值', () => {
    expect(crc32(new Uint8Array())).toBe(0)
    expect(crc32(encoder.encode('123456789'))).toBe(0xcbf43926)
    expect(crc32(encoder.encode('The quick brown fox jumps over the lazy dog'))).toBe(0x414fa339)
  })
})

describe('createZip', () => {
  it('文件名为 UTF-8（标志位 11），压缩后更小的用 deflate，其余原样存储；内容可还原', async () => {
    const repeated = 'Sample text\n'.repeat(200)
    const blob = await createZip(
      [entry('core/README.md', repeated), entry('core/说明.txt', 'ab'), { name: 'core/empty', data: new Uint8Array() }],
      {
        compress: nodeDeflate
      }
    )
    expect(blob.type).toBe('application/zip')
    const files = await readZip(blob)
    expect(files.map(file => file.name)).toEqual(['core/README.md', 'core/说明.txt', 'core/empty'])
    expect(files.map(file => file.method)).toEqual([8, 0, 0])
    expect(files.every(file => file.flags === 0x0800)).toBe(true)
    expect(files.map(file => decoder.decode(file.data))).toEqual([repeated, 'ab', ''])
    expect(files.map(file => file.size)).toEqual([repeated.length, 2, 0])
    expect(files[0]!.crc).toBe(crc32(encoder.encode(repeated)))
  })

  it('不压缩时全部原样存储', async () => {
    const files = await readZip(await createZip([entry('a.txt', 'Sample text '.repeat(50))], { compress: async () => undefined }))
    expect(files[0]).toMatchObject({ method: 0, size: 600 })
  })

  it('修改时间：MS-DOS 格式（两秒精度）；1980 年以前按 1980 年', async () => {
    const [file] = await readZip(
      await createZip([entry('a', 'x')], { date: new Date(2026, 0, 2, 3, 4, 7), compress: async () => undefined })
    )
    expect(file!.date).toBe(((2026 - 1980) << 9) | (1 << 5) | 2)
    expect(file!.time).toBe((3 << 11) | (4 << 5) | 3)
    const [old] = await readZip(await createZip([entry('a', 'x')], { date: new Date(1970, 5, 1), compress: async () => undefined }))
    expect(old!.date >> 9).toBe(0)
  })

  it('没有文件：只有目录结尾', async () => {
    const blob = await createZip([])
    expect(blob.size).toBe(22)
    expect(await readZip(blob)).toEqual([])
  })

  it('文件数超出上限：拒绝', async () => {
    const entries = Array.from({ length: MAX_ZIP_ENTRIES + 1 }, () => ({ name: 'a', data: new Uint8Array() }))
    await expect(createZip(entries)).rejects.toThrow()
  })
})

describe('deflateRaw', () => {
  it('压缩结果可还原；不支持 CompressionStream 时为 undefined', async () => {
    const data = encoder.encode('Sample text '.repeat(100))
    const deflated = await deflateRaw(data)
    expect(deflated!.length).toBeLessThan(data.length)
    expect(decoder.decode(inflateRawSync(deflated!))).toBe(decoder.decode(data))
    const original = globalThis.CompressionStream
    try {
      Reflect.deleteProperty(globalThis, 'CompressionStream')
      expect(await deflateRaw(data)).toBeUndefined()
    } finally {
      globalThis.CompressionStream = original
    }
  })
})
