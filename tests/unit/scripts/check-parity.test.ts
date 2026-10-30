// @vitest-environment node
import { spawnSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

const ROOT = fileURLToPath(new URL('../../../', import.meta.url))
const TSX_CLI = createRequire(import.meta.url).resolve('tsx/cli')
const SCRIPT = join(ROOT, 'scripts/check-parity.ts')
/** 单次检查的时限：含 tsx 启动 */
const CHECK_TIMEOUT_MS = 20_000

type Locale = 'zh-CN' | 'zh-TW'

interface CheckResult {
  readonly status: number | null
  readonly output: string
}

let dir = ''

beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), 'check-parity-'))
})

afterEach(() => {
  rmSync(dir, { recursive: true, force: true })
})

/** 在临时仓库的 src/locales/<语言>/ 下写文件 */
function write(locale: Locale, file: string, source: string): void {
  const full = join(dir, 'src/locales', locale, file)
  mkdirSync(dirname(full), { recursive: true })
  writeFileSync(full, source)
}

/** 按页面类型注册词典文件的 index.ts */
function indexSource(name: string, files: readonly (readonly [page: string, file: string])[]): string {
  const imports = files.map(([, file], index) => `import d${index} from './${file}'\n`).join('')
  const entries = files.map(([page], index) => `['${page}', d${index}]`).join(', ')
  return `${imports}export const ${name} = [${entries}]\n`
}

/** 在临时仓库里运行 check-parity */
function check(...args: string[]): CheckResult {
  const result = spawnSync(process.execPath, [TSX_CLI, SCRIPT, ...args], {
    cwd: dir,
    encoding: 'utf8',
    timeout: CHECK_TIMEOUT_MS,
  })
  return { status: result.status, output: `${result.stdout}${result.stderr}${result.error?.message ?? ''}` }
}

const CN_ISSUES = `export const LABEL = '议题'
export default {
  static: { Issues: '议题', 'Sample text': '示例文本' },
  regexp: [[/^([0-9]+) files?$/, '$1 个文件']],
  ignore: ['.markdown-body', '[aria-label="筛选作者选项"]'],
  attributeRules: [['button[aria-label="复制"]', 'title', /^Copy$/]],
  inline: [['Sample {} text', '示例 {} 文本']],
  mergeText: ['.Box-title'],
}
`

const TW_ISSUES = `export const LABEL = '議題'
export default {
  static: { Issues: '議題', 'Sample text': '範例文字' },
  regexp: [[/^([0-9]+) files?$/, '$1 個檔案']],
  ignore: ['.markdown-body', '[aria-label="篩選作者選項"]'],
  attributeRules: [['button[aria-label="複製"]', 'title', /^Copy$/]],
  inline: [['Sample {} text', '範例 {} 文字']],
  mergeText: ['.Box-title'],
}
`

/** 简繁各一个词典与 index.ts */
function writePair(cn = CN_ISSUES, tw = TW_ISSUES): void {
  write('zh-CN', 'issues.ts', cn)
  write('zh-TW', 'issues.ts', tw)
  write('zh-CN', 'index.ts', indexSource('zhCN', [['issues', 'issues']]))
  write('zh-TW', 'index.ts', indexSource('zhTW', [['issues', 'issues']]))
}

describe('check-parity', { timeout: CHECK_TIMEOUT_MS * 2 }, () => {
  it('结构相同、译文不同：通过；选择器里含中文的属性值不比', () => {
    writePair()
    const { status, output } = check()
    expect(output).toContain('✔ 简繁结构一致（1 个文件）')
    expect(status).toBe(0)
  })

  it('键、正则、选择器、句型、导出不同：逐项报出', () => {
    writePair(
      CN_ISSUES,
      `export const NAME = '議題'
export default {
  static: { Issues: '議題', Extra: '多出' },
  regexp: [[/^([0-9]+) file$/, '$1 個檔案']],
  ignore: ['.markdown', '[aria-label="篩選作者選項"]'],
  attributeRules: [['a[aria-label="複製"]', 'title', /^Copy$/]],
  inline: [['Sample text {}', '範例文字 {}']],
  mergeText: [],
}
`,
    )
    const { status, output } = check()
    expect(status).toBe(1)
    expect(output).toContain('导出 缺少 "LABEL"')
    expect(output).toContain('导出 多出 "NAME"')
    expect(output).toContain('static 缺少 "Sample text"')
    expect(output).toContain('static 多出 "Extra"')
    expect(output).toContain('regexp[0] 不同')
    expect(output).toContain('ignore 不同')
    expect(output).toContain('attributeRules[0] 不同')
    expect(output).toContain('inline[0] 不同')
    expect(output).toContain('mergeText 不同')
  })

  it('选择器里不含中文的引号属性值照常比较', () => {
    writePair(CN_ISSUES, TW_ISSUES.replace(`'.markdown-body', `, `'.markdown-body', '[data-sample="octocat"]', `))
    const { status, output } = check()
    expect(status).toBe(1)
    expect(output).toContain('ignore 不同')
  })

  it('标签表：键相同、译文不同时通过；键不同时逐项报出', () => {
    const withLabels = (source: string, labels: string): string =>
      source.replace('  mergeText:', `  labels: ${labels},\n  mergeText:`)
    const cn = withLabels(CN_ISSUES, "{ bug: '缺陷', question: '疑问' }")
    writePair(cn, withLabels(TW_ISSUES, "{ bug: '錯誤', question: '疑問' }"))
    expect(check().status).toBe(0)
    writePair(cn, withLabels(TW_ISSUES, "{ bug: '錯誤', Question: '疑問' }"))
    const { status, output } = check()
    expect(status).toBe(1)
    expect(output).toContain('labels 缺少 "question"')
    expect(output).toContain('labels 多出 "Question"')
  })

  it('说明表：键相同、译文不同时通过；键不同时逐项报出', () => {
    const withDescriptions = (source: string, descriptions: string): string =>
      source.replace('  mergeText:', `  labelDescriptions: ${descriptions},\n  mergeText:`)
    const cn = withDescriptions(CN_ISSUES, "{ 'Good for newcomers': '适合新手' }")
    writePair(cn, withDescriptions(TW_ISSUES, "{ 'Good for newcomers': '適合新手' }"))
    expect(check().status).toBe(0)
    writePair(cn, withDescriptions(TW_ISSUES, "{ 'Good for Newcomers': '適合新手' }"))
    const { status, output } = check()
    expect(status).toBe(1)
    expect(output).toContain('labelDescriptions 缺少 "Good for newcomers"')
    expect(output).toContain('labelDescriptions 多出 "Good for Newcomers"')
  })

  it('星标列表名表：键相同、译文不同时通过；键不同时逐项报出', () => {
    const withNames = (source: string, names: string): string =>
      source.replace('  mergeText:', `  listNames: ${names},\n  mergeText:`)
    const cn = withNames(CN_ISSUES, "{ '✨ Inspiration': '✨ 灵感' }")
    writePair(cn, withNames(TW_ISSUES, "{ '✨ Inspiration': '✨ 靈感' }"))
    expect(check().status).toBe(0)
    writePair(cn, withNames(TW_ISSUES, "{ '✨ inspiration': '✨ 靈感' }"))
    const { status, output } = check()
    expect(status).toBe(1)
    expect(output).toContain('listNames 缺少 "✨ Inspiration"')
    expect(output).toContain('listNames 多出 "✨ inspiration"')
  })

  it('标签正则：source、flags 相同时通过；数量、写法不同时逐项报出', () => {
    const withRules = (source: string, rules: string): string =>
      source.replace('  mergeText:', `  labelRegexp: ${rules},\n  mergeText:`)
    const cn = withRules(CN_ISSUES, "[[/^Sample (\\d+) code$/, '示例 $1 代码']]")
    writePair(cn, withRules(TW_ISSUES, "[[/^Sample (\\d+) code$/, '範例 $1 程式碼']]"))
    expect(check().status).toBe(0)
    writePair(cn, withRules(TW_ISSUES, "[[/^Sample (\\w+) code$/, '範例 $1 程式碼'], [/^Text$/, '文字']]"))
    const { status, output } = check()
    expect(status).toBe(1)
    expect(output).toContain('labelRegexp 数量不同：简体 1，繁体 2')
    expect(output).toContain('labelRegexp[0] 不同')
    expect(output).not.toContain('regexp[0] 不同')
  })

  it('文件缺失、多出：报出', () => {
    writePair()
    write('zh-CN', 'issues/list.ts', CN_ISSUES)
    write('zh-TW', 'pulls.ts', TW_ISSUES)
    const { status, output } = check()
    expect(status).toBe(1)
    expect(output).toMatch(/✖ issues\/list\.ts\n {4}繁体文件缺失/)
    expect(output).toMatch(/✖ pulls\.ts\n {4}简体无对应文件/)
  })

  it('繁体文件加载失败：报出原因，不中断其余检查', () => {
    writePair()
    write('zh-CN', 'wiki.ts', CN_ISSUES)
    write('zh-TW', 'wiki.ts', "import missing from './missing'\nexport default missing\n")
    const { status, output } = check()
    expect(status).toBe(1)
    expect(output).toMatch(/✖ wiki\.ts\n {4}繁体加载失败：/)
    expect(output).not.toMatch(/✖ issues\.ts/)
  })

  it('繁体 index.ts 缺失、注册顺序不同：报出', () => {
    writePair()
    write('zh-CN', 'pulls.ts', CN_ISSUES)
    write('zh-TW', 'pulls.ts', TW_ISSUES)
    write(
      'zh-CN',
      'index.ts',
      indexSource('zhCN', [
        ['issues', 'issues'],
        ['pulls', 'pulls'],
      ]),
    )
    write(
      'zh-TW',
      'index.ts',
      indexSource('zhTW', [
        ['pulls', 'pulls'],
        ['issues', 'issues'],
      ]),
    )
    expect(check().output).toContain('index.ts 注册顺序不同')
    rmSync(join(dir, 'src/locales/zh-TW/index.ts'))
    expect(check().output).toContain('繁体 index.ts 缺失')
  })

  it('指定文件：简体、繁体目录下的路径均可，只对照这些文件', () => {
    writePair()
    write('zh-CN', 'pulls.ts', CN_ISSUES)
    expect(check('src/locales/zh-TW/issues.ts').status).toBe(0)
    expect(check('src/locales/zh-CN/issues.ts').status).toBe(0)
    const { status, output } = check('src/locales/zh-CN/pulls.ts')
    expect(status).toBe(1)
    expect(output).toContain('繁体文件缺失')
  })

  it('指定 index.ts：对照注册顺序', () => {
    writePair()
    write('zh-TW', 'index.ts', 'export const zhTW = []\n')
    expect(check('src/locales/zh-TW/index.ts').output).toContain('index.ts 注册顺序不同')
  })

  it('不在词典目录下的文件：报错退出', () => {
    writePair()
    const { status, output } = check('sample.ts')
    expect(status).toBe(1)
    expect(output).toContain('不在词典目录下：sample.ts')
  })
})
