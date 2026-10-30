/**
 * 把 assets/icon.svg 渲染为扩展图标 PNG（透明圆角）。
 *
 * 用法：bun run icons [--source assets/icon.svg] [--out public/icon]
 * 1. 源文件内嵌位图边长超过 512px 时（如 Photoshop 导出的 SVG），先压缩并写回源文件
 * 2. 按 512px 渲染一次，再用 Lanczos 缩到各尺寸：比浏览器直接渲染小尺寸清晰
 * 输出：<out>/16.png、32.png、48.png、96.png、128.png、256.png（WXT 构建时自动写入 manifest icons）
 */
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { parseArgs } from 'node:util'
import { chromium } from '@playwright/test'
import sharp from 'sharp'
import { shrinkEmbeddedRasters } from './icon-raster'

const SIZES = [16, 32, 48, 96, 128, 256] as const

/** 母版尺寸：各输出尺寸都由它缩小得到 */
const RENDER_SIZE = 512

/** 渲染页：<img> 按 viewBox 缩放 SVG，背景透明 */
function renderPage(dataUrl: string, size: number): string {
  return [
    '<!doctype html>',
    '<html><head><style>html,body{margin:0;background:transparent}img{display:block}</style></head>',
    `<body><img id="icon" width="${size}" height="${size}" alt="" src="${dataUrl}"></body></html>`,
  ].join('')
}

function formatBytes(bytes: number): string {
  return bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(2)} MB` : `${Math.ceil(bytes / 1024)} KB`
}

/** 压缩源文件中过大的内嵌位图，有改动时写回（先写临时文件再改名，中断时不损坏源文件） */
async function shrinkSource(path: string, label: string): Promise<string> {
  const original = await readFile(path, 'utf8')
  const { svg, resized, retyped } = await shrinkEmbeddedRasters(original)
  if (resized + retyped > 0) {
    const temp = `${path}.tmp`
    await writeFile(temp, svg)
    await rename(temp, path)
    const before = formatBytes(Buffer.byteLength(original))
    process.stdout.write(`${label}：${before} → ${formatBytes(Buffer.byteLength(svg))}\n`)
  }
  return svg
}

async function renderMaster(svg: string): Promise<Buffer> {
  const dataUrl = `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`
  const browser = await chromium.launch({ headless: true })
  try {
    const page = await browser.newPage({ viewport: { width: RENDER_SIZE, height: RENDER_SIZE }, deviceScaleFactor: 1 })
    await page.setContent(renderPage(dataUrl, RENDER_SIZE), { waitUntil: 'load' })
    return await page.locator('#icon').screenshot({ omitBackground: true, animations: 'disabled' })
  } finally {
    await browser.close()
  }
}

async function main(): Promise<void> {
  const { values } = parseArgs({
    options: {
      source: { type: 'string', default: 'assets/icon.svg' },
      out: { type: 'string', default: 'public/icon' },
    },
  })
  const svg = await shrinkSource(resolve(values.source), values.source)
  const master = await renderMaster(svg)
  const outDir = resolve(values.out)
  await mkdir(outDir, { recursive: true })

  for (const size of SIZES) {
    const target = resolve(outDir, `${size}.png`)
    await sharp(master)
      .resize(size, size, { kernel: 'lanczos3' })
      .png({ compressionLevel: 9, adaptiveFiltering: true })
      .toFile(target)
    process.stdout.write(`${size}px → ${target}\n`)
  }
}

await main()
