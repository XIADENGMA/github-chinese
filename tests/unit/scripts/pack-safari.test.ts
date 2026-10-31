// @vitest-environment node
import { spawnSync } from 'node:child_process'
import { createRequire } from 'node:module'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import {
  APP_NAME,
  appVersion,
  buildArgs,
  BUNDLE_ID,
  converterArgs,
  findHostPage,
  packageName,
  pickScheme,
} from '../../../scripts/safari'

const ROOT = fileURLToPath(new URL('../../../', import.meta.url))
const TSX_CLI = createRequire(import.meta.url).resolve('tsx/cli')
const SCRIPT = join(ROOT, 'scripts/pack-safari.ts')
/** 单次运行的时限：含 tsx 启动 */
const CLI_TIMEOUT_MS = 20_000

describe('版本号与文件名', () => {
  it('应用版本号：至多三段整数', () => {
    expect(appVersion('1.1.0')).toBe('1.1.0')
    expect(appVersion('2')).toBe('2')
    for (const version of ['1.0.0.1', '1.0.0-beta.1', '', 'v1.0.0']) {
      expect(() => appVersion(version)).toThrow('至多三段整数')
    }
  })

  it('产物文件名同其他浏览器的前缀；版本号可带预发布后缀，不能含路径', () => {
    expect(packageName('1.1.0')).toBe('github-chinese-1.1.0-safari-macos.zip')
    expect(packageName('1.0.0-beta.1')).toBe('github-chinese-1.0.0-beta.1-safari-macos.zip')
    expect(() => packageName('../1.0.0')).toThrow('版本号无效')
    expect(() => packageName('1.0.0/x')).toThrow('版本号无效')
  })
})

describe('命令参数', () => {
  it('Bundle ID 的最后一段同应用名（空格换成 -）：转换器给应用、扩展的 Bundle ID 才同前缀', () => {
    expect(BUNDLE_ID.split('.').at(-1)).toBe(APP_NAME.replaceAll(' ', '-'))
  })

  it('转换：只含 macOS 应用的 Swift 工程，复制扩展文件，不打开 Xcode、不询问', () => {
    expect(converterArgs('/tmp/ext', '/tmp/work')).toEqual([
      'safari-web-extension-converter',
      '/tmp/ext',
      '--project-location',
      '/tmp/work',
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
    ])
  })

  it('构建：Release、通用二进制、macOS 13 起可用、临时签名，版本号写入应用与扩展', () => {
    const args = buildArgs({
      project: '/tmp/a.xcodeproj',
      scheme: APP_NAME,
      derivedDataPath: '/tmp/b',
      version: '1.1.0',
    })
    expect(args.slice(0, 11)).toEqual([
      '-quiet',
      '-project',
      '/tmp/a.xcodeproj',
      '-scheme',
      APP_NAME,
      '-configuration',
      'Release',
      '-destination',
      'generic/platform=macOS',
      '-derivedDataPath',
      '/tmp/b',
    ])
    expect(args).toEqual(
      expect.arrayContaining([
        'CODE_SIGN_IDENTITY=-',
        'CODE_SIGN_STYLE=Manual',
        'DEVELOPMENT_TEAM=',
        'ONLY_ACTIVE_ARCH=NO',
        'MACOSX_DEPLOYMENT_TARGET=13.0',
        'MARKETING_VERSION=1.1.0',
        'CURRENT_PROJECT_VERSION=1.1.0',
      ]),
    )
    expect(args.at(-1)).toBe('build')
  })
})

describe('pickScheme', () => {
  const list = (schemes: unknown): string => JSON.stringify({ project: { name: APP_NAME, schemes } })

  it('同名方案；多平台工程取「(macOS)」', () => {
    expect(pickScheme(list([`${APP_NAME} Extension`, APP_NAME]))).toBe(APP_NAME)
    expect(pickScheme(list([`${APP_NAME} (iOS)`, `${APP_NAME} (macOS)`]))).toBe(`${APP_NAME} (macOS)`)
  })

  it('没有宿主应用的方案、输出结构不对：抛出并列出已有方案', () => {
    expect(() => pickScheme(list(['Other']))).toThrow('没有宿主应用的方案：Other')
    expect(() => pickScheme(list('GitHub Chinese'))).toThrow('（无）')
    expect(() => pickScheme('null')).toThrow('（无）')
    expect(() => pickScheme('{"project":null}')).toThrow('（无）')
  })
})

describe('findHostPage', () => {
  const MACOS_ONLY = [
    'GitHub Chinese/Resources/Base.lproj/Main.html',
    'GitHub Chinese/Resources/Script.js',
    'GitHub Chinese/Resources/Style.css',
    'GitHub Chinese/Resources/Icon.png',
    'GitHub Chinese Extension/Resources/manifest.json',
  ]

  it('Base.lproj/Main.html 与上一层的 Script.js、Style.css', () => {
    expect(findHostPage(MACOS_ONLY)).toEqual({
      html: 'GitHub Chinese/Resources/Base.lproj/Main.html',
      script: 'GitHub Chinese/Resources/Script.js',
      style: 'GitHub Chinese/Resources/Style.css',
    })
    expect(
      findHostPage([
        'Shared (App)/Resources/Base.lproj/Main.html',
        'Shared (App)/Resources/Script.js',
        'Shared (App)/Resources/Style.css',
      ]),
    ).toEqual({
      html: 'Shared (App)/Resources/Base.lproj/Main.html',
      script: 'Shared (App)/Resources/Script.js',
      style: 'Shared (App)/Resources/Style.css',
    })
  })

  it('缺文件、页面不止一处、不在 Base.lproj 下：undefined', () => {
    expect(findHostPage(MACOS_ONLY.filter((file) => !file.endsWith('Style.css')))).toBeUndefined()
    expect(findHostPage([...MACOS_ONLY, 'Other/Resources/Base.lproj/Main.html'])).toBeUndefined()
    expect(findHostPage(['A/Main.html', 'A/Script.js', 'A/Style.css'])).toBeUndefined()
  })
})

describe('命令行', () => {
  function runCli(...args: string[]): ReturnType<typeof spawnSync> {
    return spawnSync(process.execPath, [TSX_CLI, SCRIPT, ...args], {
      cwd: ROOT,
      encoding: 'utf8',
      timeout: CLI_TIMEOUT_MS,
    })
  }

  it(
    '多余的参数：输出用法，退出码 1',
    () => {
      const result = runCli('extra')
      expect(result.stderr).toContain('用法：bun run pack:safari')
      expect(result.status).toBe(1)
    },
    CLI_TIMEOUT_MS,
  )

  it.skipIf(process.platform === 'darwin')(
    '不是 macOS：报错，退出码 1',
    () => {
      const result = runCli()
      expect(result.stderr).toContain('仅支持 macOS')
      expect(result.status).toBe(1)
    },
    CLI_TIMEOUT_MS,
  )
})
