/**
 * Safari 版宿主应用的打包参数（命令行见 pack-safari.ts）：
 *   safari-web-extension-converter 把扩展目录转成 Xcode 工程，xcodebuild 构建宿主应用（扩展在应用的 PlugIns 里）。
 * 不上架：临时签名（CODE_SIGN_IDENTITY=-），不公证；安装时须开启 Safari 的「允许未签名的扩展」
 */
import { posix } from 'node:path'

/** 宿主应用名：应用、Xcode 工程、构建目标同名 */
export const APP_NAME = 'GitHub Chinese'
/**
 * 宿主应用的 Bundle ID；扩展为「<Bundle ID>.Extension」。最后一段须同应用名（空格换成 -）：
 * 转换器（Xcode 26）给应用的 Bundle ID 取前几段加应用名，给扩展的取整个 Bundle ID 加 .Extension，
 * 两者前缀不一致时 Xcode 拒绝把扩展嵌入应用
 */
export const BUNDLE_ID = 'io.github.setube.GitHub-Chinese'

/** 应用的版本号（CFBundleShortVersionString）至多三段整数 */
const APP_VERSION_RE = /^\d+(\.\d+){0,2}$/
/** 发行版的版本号（可带预发布后缀），用在文件名里 */
const RELEASE_VERSION_RE = /^\d+(\.\d+){0,3}(-[0-9A-Za-z.]+)?$/

/** 应用的版本号：取扩展清单的 version（WXT 已去掉预发布后缀） */
export function appVersion(version: string): string {
  if (!APP_VERSION_RE.test(version)) throw new Error(`应用版本号须为至多三段整数：${version}`)
  return version
}

/** 产物文件名：与其他浏览器的产物同一前缀（github-chinese-<版本>-…） */
export function packageName(version: string): string {
  if (!RELEASE_VERSION_RE.test(version)) throw new Error(`版本号无效：${version}`)
  return `github-chinese-${version}-safari-macos.zip`
}

/** xcrun 的参数：转成只含 macOS 应用的 Swift 工程，扩展文件复制进工程，不打开 Xcode、不询问 */
export function converterArgs(extensionDir: string, projectLocation: string): string[] {
  return [
    'safari-web-extension-converter',
    extensionDir,
    '--project-location',
    projectLocation,
    '--app-name',
    APP_NAME,
    '--bundle-identifier',
    BUNDLE_ID,
    '--swift',
    '--macos-only',
    '--copy-resources',
    '--no-open',
    '--no-prompt',
    '--force',
  ]
}

export interface BuildOptions {
  /** .xcodeproj 的路径 */
  readonly project: string
  readonly scheme: string
  /** 构建目录；应用在其下的 Build/Products/Release */
  readonly derivedDataPath: string
  /** 应用的版本号（见 appVersion） */
  readonly version: string
}

/** xcodebuild 的参数：Release，通用二进制（Apple 芯片与 Intel），临时签名，不用开发团队与描述文件；只输出警告与错误 */
export function buildArgs({ project, scheme, derivedDataPath, version }: BuildOptions): string[] {
  return [
    '-quiet',
    '-project',
    project,
    '-scheme',
    scheme,
    '-configuration',
    'Release',
    '-destination',
    'generic/platform=macOS',
    '-derivedDataPath',
    derivedDataPath,
    'CODE_SIGN_IDENTITY=-',
    'CODE_SIGN_STYLE=Manual',
    'DEVELOPMENT_TEAM=',
    'PROVISIONING_PROFILE_SPECIFIER=',
    'ONLY_ACTIVE_ARCH=NO',
    `MARKETING_VERSION=${version}`,
    `CURRENT_PROJECT_VERSION=${version}`,
    'build',
  ]
}

/** 从 `xcodebuild -list -json` 的输出中选宿主应用的方案：同名，或多平台工程的「(macOS)」 */
export function pickScheme(listJson: string): string {
  // 任何 JSON 值都可安全取属性：null、非对象取到 undefined
  const schemes = (JSON.parse(listJson) as { project?: { schemes?: unknown } } | null)?.project?.schemes
  const names = Array.isArray(schemes) ? schemes.filter((name): name is string => typeof name === 'string') : []
  const scheme = [APP_NAME, `${APP_NAME} (macOS)`].find((name) => names.includes(name))
  if (scheme === undefined) throw new Error(`Xcode 工程中没有宿主应用的方案：${names.join('、') || '（无）'}`)
  return scheme
}

/** 宿主应用页面的三个文件（相对 Xcode 工程目录的 posix 路径） */
export interface HostPage {
  readonly html: string
  readonly script: string
  readonly style: string
}

/**
 * 在生成的工程文件（相对路径）中找宿主应用的页面：Base.lproj/Main.html，Base.lproj 所在目录有 Script.js、Style.css。
 * 找不到或不止一处（Xcode 模板改了）时返回 undefined，沿用模板页面
 */
export function findHostPage(files: readonly string[]): HostPage | undefined {
  const pages = files.filter(
    (file) => posix.basename(file) === 'Main.html' && posix.basename(posix.dirname(file)) === 'Base.lproj',
  )
  if (pages.length !== 1) return undefined
  const resources = posix.dirname(posix.dirname(pages[0]!))
  const script = posix.join(resources, 'Script.js')
  const style = posix.join(resources, 'Style.css')
  return files.includes(script) && files.includes(style) ? { html: pages[0]!, script, style } : undefined
}
