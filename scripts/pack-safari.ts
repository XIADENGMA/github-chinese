/**
 * 把 Safari 版扩展打包成 macOS 宿主应用（参数见 safari.ts）。须在装有 Xcode 的 macOS 上运行。
 *
 * 用法：bun run pack:safari [--input <扩展目录>] [--out <输出目录>]
 *   扩展目录：默认 .output/safari-mv3（bun run build:safari 的产物）
 * 输出：<输出目录>/github-chinese-<版本>-safari-macos.zip（默认输出目录 .output），内含「GitHub Chinese.app」
 */
import { spawnSync } from 'node:child_process'
import { copyFile, mkdir, mkdtemp, readdir, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, join, relative, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseArgs } from 'node:util'
import { APP_NAME, appVersion, buildArgs, converterArgs, findHostPage, packageName, pickScheme } from './safari'

const USAGE = '用法：bun run pack:safari [--input <扩展目录>] [--out <输出目录>]'
/** 宿主应用页面（替换 Xcode 模板的英文页面） */
const HOST_PAGE_DIR = fileURLToPath(new URL('safari-app/', import.meta.url))
/** 通用二进制须含的架构：Apple 芯片、Intel */
const REQUIRED_ARCHS = ['arm64', 'x86_64']

interface Manifest {
  readonly version: string
  readonly version_name?: string
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}

/** GitHub Actions 中显示为警告 */
function warn(message: string): void {
  process.stdout.write(process.env.GITHUB_ACTIONS === 'true' ? `::warning title=safari::${message}\n` : `${message}\n`)
}

/** 运行命令：输出直接显示，capture 时取标准输出；失败时抛出 */
function run(command: string, args: readonly string[], capture = false): string {
  const result = spawnSync(command, args, {
    encoding: 'utf8',
    stdio: ['ignore', capture ? 'pipe' : 'inherit', 'inherit'],
  })
  if (result.error) throw new Error(`${command} 无法运行：${result.error.message}`, { cause: result.error })
  if (result.status !== 0) throw new Error(`${command} 失败：退出码 ${result.status ?? result.signal}`)
  return result.stdout ?? ''
}

async function readManifest(dir: string): Promise<Manifest> {
  const file = join(dir, 'manifest.json')
  let manifest: Partial<Manifest>
  try {
    manifest = JSON.parse(await readFile(file, 'utf8')) as Partial<Manifest>
  } catch (error) {
    throw new Error(`扩展清单无法读取：${file}`, { cause: error })
  }
  if (typeof manifest.version !== 'string') throw new Error(`扩展清单缺少 version：${file}`)
  return { version: manifest.version, version_name: manifest.version_name }
}

/** 目录下的全部文件、目录（相对路径，用 / 分隔） */
async function listEntries(dir: string, kind: 'file' | 'directory'): Promise<string[]> {
  const entries = await readdir(dir, { recursive: true, withFileTypes: true })
  return entries
    .filter((entry) => (kind === 'file' ? entry.isFile() : entry.isDirectory()))
    .map((entry) => relative(dir, join(entry.parentPath, entry.name)).split(sep).join('/'))
}

/** 转换生成的 .xcodeproj */
async function findProject(dir: string): Promise<string> {
  const projects = (await listEntries(dir, 'directory')).filter(
    (path) => path.split('/').at(-1) === `${APP_NAME}.xcodeproj`,
  )
  if (projects.length !== 1) throw new Error(`未找到 Xcode 工程：${dir}`)
  return join(dir, projects[0]!)
}

/** 换上 scripts/safari-app 的页面；模板结构不同时沿用模板页面 */
async function replaceHostPage(projectDir: string): Promise<void> {
  const page = findHostPage(await listEntries(projectDir, 'file'))
  if (page === undefined) {
    warn('未找到宿主应用页面，沿用模板页面')
    return
  }
  await copyFile(join(HOST_PAGE_DIR, 'Main.html'), join(projectDir, page.html))
  await copyFile(join(HOST_PAGE_DIR, 'Script.js'), join(projectDir, page.script))
  await copyFile(join(HOST_PAGE_DIR, 'Style.css'), join(projectDir, page.style))
}

function plistValue(plist: string, key: string): string {
  return run('plutil', ['-extract', key, 'raw', '-o', '-', plist], true).trim()
}

/** 核对构建结果：版本号、唯一的扩展及其清单版本、架构、签名 */
async function verifyApp(app: string, manifest: Manifest, version: string): Promise<void> {
  const plist = join(app, 'Contents/Info.plist')
  const shortVersion = plistValue(plist, 'CFBundleShortVersionString')
  if (shortVersion !== version) throw new Error(`应用版本号 ${shortVersion} 与扩展 ${version} 不符`)
  const plugins = join(app, 'Contents/PlugIns')
  const appexes = (await readdir(plugins)).filter((name) => name.endsWith('.appex'))
  if (appexes.length !== 1) throw new Error(`应用中的扩展数量不为 1：${appexes.join('、') || '无'}`)
  const bundled = await readManifest(join(plugins, appexes[0]!, 'Contents/Resources'))
  if (bundled.version !== manifest.version)
    throw new Error(`应用内扩展版本 ${bundled.version} 与 ${manifest.version} 不符`)
  const executable = join(app, 'Contents/MacOS', plistValue(plist, 'CFBundleExecutable'))
  const archs = run('lipo', ['-archs', executable], true).trim().split(/\s+/)
  const missing = REQUIRED_ARCHS.filter((arch) => !archs.includes(arch))
  if (missing.length > 0) throw new Error(`应用缺少架构：${missing.join('、')}`)
  run('codesign', ['--verify', '--deep', '--strict', '--verbose=2', app])
}

async function main(): Promise<void> {
  const { values, positionals } = parseArgs({
    options: { input: { type: 'string' }, out: { type: 'string' } },
    allowPositionals: true,
  })
  if (positionals.length > 0) throw new Error(USAGE)
  if (process.platform !== 'darwin') throw new Error('仅支持 macOS（需要 Xcode）')
  const input = resolve(values.input ?? '.output/safari-mv3')
  const out = resolve(values.out ?? '.output')
  const manifest = await readManifest(input)
  const version = appVersion(manifest.version)
  const zip = join(out, packageName(manifest.version_name ?? manifest.version))
  const work = await mkdtemp(join(tmpdir(), 'github-chinese-safari-'))
  try {
    run('xcrun', converterArgs(input, work))
    const project = await findProject(work)
    await replaceHostPage(dirname(project))
    const scheme = pickScheme(run('xcodebuild', ['-list', '-json', '-project', project], true))
    const derivedDataPath = join(work, 'build')
    run('xcodebuild', buildArgs({ project, scheme, derivedDataPath, version }))
    const app = join(derivedDataPath, 'Build/Products/Release', `${APP_NAME}.app`)
    await verifyApp(app, manifest, version)
    await mkdir(out, { recursive: true })
    await rm(zip, { force: true })
    // 保留扩展属性与签名，压缩包内顶层为 .app
    run('ditto', ['-c', '-k', '--sequesterRsrc', '--keepParent', app, zip])
    process.stdout.write(`${zip}\n`)
  } finally {
    await rm(work, { recursive: true, force: true })
  }
}

try {
  await main()
} catch (error) {
  process.stderr.write(`${errorMessage(error)}\n`)
  process.exitCode = 1
}
