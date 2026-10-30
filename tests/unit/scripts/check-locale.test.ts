// @vitest-environment node
import { spawnSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

const ROOT = fileURLToPath(new URL('../../../', import.meta.url))
const TSX_CLI = createRequire(import.meta.url).resolve('tsx/cli')
const SCRIPT = join(ROOT, 'scripts/check-locale.ts')
/** 单次检查的时限：含 tsx 启动与回溯计时线程 */
const CHECK_TIMEOUT_MS = 20_000

type Rule = readonly [RegExp, string]

interface CheckResult {
  readonly status: number | null
  readonly output: string
}

let dir = ''

beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), 'check-locale-'))
})

afterEach(() => {
  rmSync(dir, { recursive: true, force: true })
})

/** 只含这些正则规则的词典源码：逐条按 source 与 flags 重建 */
function dictionarySource(rules: readonly Rule[]): string {
  const items = rules.map(
    ([pattern, replacement]) =>
      `[new RegExp(${JSON.stringify(pattern.source)}, ${JSON.stringify(pattern.flags)}), ${JSON.stringify(replacement)}]`,
  )
  return `export default { regexp: [${items.join(', ')}] }\n`
}

/** 只含这些 static 词条的词典源码 */
function staticSource(entries: Readonly<Record<string, string>>): string {
  return `export default { static: ${JSON.stringify(entries)} }\n`
}

/** 只含这些字符串行内句的词典源码 */
function inlineSource(rules: readonly (readonly [string, string])[]): string {
  return `export default { inline: ${JSON.stringify(rules)} }\n`
}

/** 长度恰为 length 的英文文字（单词间单个空格，不以空格结尾） */
function words(length: number): string {
  const text = 'Sample text '.repeat(Math.ceil(length / 12)).slice(0, length)
  return text.endsWith(' ') ? `${text.slice(0, -1)}x` : text
}

/** n 个槽位以 glue 相连 */
function slots(n: number, glue: string): string {
  return Array.from({ length: n }, () => '{}').join(glue)
}

/** 词典写进临时文件，用 check-locale 只检查这一个文件 */
function check(rules: readonly Rule[]): CheckResult {
  return checkSource(dictionarySource(rules))
}

function checkSource(source: string, args: readonly string[] = []): CheckResult {
  const file = join(dir, 'sample.ts')
  writeFileSync(file, source)
  const result = spawnSync(process.execPath, [TSX_CLI, SCRIPT, ...args, file], {
    cwd: ROOT,
    encoding: 'utf8',
    timeout: CHECK_TIMEOUT_MS,
  })
  return { status: result.status, output: `${result.stdout}${result.stderr}${result.error?.message ?? ''}` }
}

describe('check-locale 正则写法', { timeout: CHECK_TIMEOUT_MS * 2 }, () => {
  it('带 m / u / v 标志：报错，退出码 1', () => {
    const rules: Rule[] = [
      [/^Sample (\d+)$/m, '示例 $1'],
      [/^Sample (\d+)$/u, '示例 $1'],
      [new RegExp('^Sample (\\d+)$', 'v'), '示例 $1'],
    ]

    const { status, output } = check(rules)

    expect(status, output).toBe(1)
    rules.forEach(([pattern], index) => {
      expect(output).toContain(`regexp[${index}] ${pattern}：不得使用 m / u / v 标志`)
    })
  })

  it('顶层有 |：报错，退出码 1', () => {
    const { status, output } = check([[/^Sample$|^Text$/, '示例']])

    expect(status, output).toBe(1)
    expect(output).toContain('regexp[0] /^Sample$|^Text$/：顶层不得有 |，备选放进分组')
  })

  it('备选放进分组、不带 m / u / v 标志：通过，退出码 0', () => {
    const { status, output } = check([
      [/^(?:Sample|Text)$/, '示例'],
      [/^(?:Sample|Text) (\d+)$/i, '示例 $1'],
    ])

    expect(status, output).toBe(0)
    expect(output).toContain('0 个错误')
  })

  it('替换中的 $<名称>：正则没有命名组、名字不是命名组时报错（regexp、属性规则、行内句）；名字写对时通过', () => {
    const { status, output } = checkSource(
      `export default {
  regexp: [
    [/^View (?<title>.+)$/, '查看 $<titel>'],
    [/^Edit (.+)$/, '编辑 $<name>'],
    [/^Open (?<title>.+)$/, '打开 $<title>'],
  ],
  attributeRules: [
    ['.sample button', 'aria-label', /^Copy (?<name>.+)$/, '复制 $<nmae>'],
    ['.sample button', 'aria-label', /^Close (?<name>.+)$/, '关闭 $<name>'],
  ],
  inline: [
    [/^\\{\\} pushed (?<count>\\d+) commits$/, '{} 推送了 $<cnt> 个提交'],
    [/^\\{\\} merged (?<count>\\d+) commits$/, '{} 合并了 $<count> 个提交'],
  ],
}\n`,
    )

    expect(status, output).toBe(1)
    expect(output).toContain('regexp[0] /^View (?<title>.+)$/：$<titel> 不是命名组')
    expect(output).toContain('regexp[1] /^Edit (.+)$/：$<name> 会原样输出')
    expect(output).toContain('attributeRules[0] /^Copy (?<name>.+)$/：$<nmae> 不是命名组')
    expect(output).toContain('inline[0] /^\\{\\} pushed (?<count>\\d+) commits$/：$<cnt> 不是命名组')
    for (const where of ['regexp[2]', 'attributeRules[1]', 'inline[1]']) expect(output).not.toContain(where)
  })
})

describe('check-locale 回溯检查', { timeout: CHECK_TIMEOUT_MS * 2 }, () => {
  it('输入接在字面文字、槽位之后：嵌套量词前有字面前缀或槽位，都报疑似灾难回溯', () => {
    const { status, output } = checkSource(
      `export default {
  regexp: [[/^Sample (\\w+\\s?)+$/, '示例 $1']],
  inline: [
    [/^\\{\\} pushed (\\w+\\s?)+$/, '{} 推送了 $1'],
    [/^\\{\\} pushed (\\d+) commits?$/, '{} 推送了 $1 个提交'],
  ],
}\n`,
    )

    expect(status, output).toBe(1)
    expect(output).toContain('regexp[0] /^Sample (\\w+\\s?)+$/：疑似灾难回溯')
    expect(output).toContain('inline[0] /^\\{\\} pushed (\\w+\\s?)+$/：疑似灾难回溯')
    expect(output).not.toContain('inline[1]')
  })

  it('行内句正则按含槽位字符的句型键计时：槽位在句末、量词内含槽位，都报疑似灾难回溯', () => {
    const { status, output } = checkSource(
      `export default {
  inline: [
    [/^(\\w+\\s?)+ pushed \\{\\}$/, '$1 推送了 {}'],
    [/^((\\{\\})+)+ pushed$/, '$1 推送了'],
  ],
}\n`,
    )

    expect(status, output).toBe(1)
    expect(output).toContain('inline[0] /^(\\w+\\s?)+ pushed \\{\\}$/：疑似灾难回溯')
    expect(output).toContain('inline[1] /^((\\{\\})+)+ pushed$/：疑似灾难回溯')
  })

  it('嵌套量词前有 8 个以上带量词的成分：照报疑似灾难回溯', () => {
    const numbers = ' (\\d+)'.repeat(8)
    const { status, output } = checkSource(
      `export default {
  regexp: [
    [/^Sample${numbers} (\\w+\\s?)+$/, '示例 $1'],
    [/^Sample${numbers} (\\w+)$/, '示例 $1'],
  ],
  inline: [[/^\\{\\}${numbers} (\\w+\\s?)+$/, '{} 示例 $1']],
}\n`,
    )

    expect(status, output).toBe(1)
    expect(output).toContain(`regexp[0] /^Sample${numbers} (\\w+\\s?)+$/：疑似灾难回溯`)
    expect(output).not.toContain('regexp[1]')
    expect(output).toContain(`inline[0] /^\\{\\}${numbers} (\\w+\\s?)+$/：疑似灾难回溯`)
  })

  it('字符类里没有常用示例字符：照常推导，之后的嵌套量词照报疑似灾难回溯', () => {
    const { status, output } = checkSource(
      `export default {
  regexp: [
    [/^Took (\\d+[smhd]) and (\\w+\\s?)+$/, '用时 $1，$2'],
    [/^Took (\\d+[smhd]) and (\\w+)$/, '用时 $1，$2'],
  ],
  inline: [[/^\\{\\} took (\\d+[smhd]) [·•] (\\w+\\s?)+$/, '{} 用时 $1 $2']],
}\n`,
    )

    expect(status, output).toBe(1)
    expect(output).toContain('regexp[0] /^Took (\\d+[smhd]) and (\\w+\\s?)+$/：疑似灾难回溯')
    expect(output).not.toContain('regexp[1]')
    expect(output).toContain('inline[0] /^\\{\\} took (\\d+[smhd]) [·•] (\\w+\\s?)+$/：疑似灾难回溯')
  })

  it('行内句正则按槽位换成槽位字符后计时：槽位直接带量词，报疑似灾难回溯；同一正则作 regexp 规则不报', () => {
    const { status, output } = checkSource(
      `export default {
  regexp: [[/^(\\{\\}+\\s?)+ pushed$/, '$1 推送了']],
  inline: [[/^(\\{\\}+\\s?)+ pushed$/, '$1 推送了']],
}\n`,
    )

    expect(status, output).toBe(1)
    expect(output).toContain('inline[0] /^(\\{\\}+\\s?)+ pushed$/：疑似灾难回溯')
    // 按原样执行时 + 只作用于 }，每轮以 { 开头，没有歧义
    expect(output).not.toContain('regexp[0]')
  })

  it('行内句正则按句型键长度上限计时：三次回溯的写法不报，regexp 规则照报', () => {
    const { status, output } = checkSource(
      `export default {
  regexp: [[/^Sample (.+) (.+) (.+)!$/, '示例 $1 $2 $3！']],
  inline: [[/^\\{\\} (.+) (.+) (.+)!$/, '{} $1 $2 $3！']],
}\n`,
    )

    expect(status, output).toBe(1)
    expect(output).toContain('regexp[0] /^Sample (.+) (.+) (.+)!$/：疑似灾难回溯')
    expect(output).not.toContain('inline[0]')
  })
})

describe('check-locale 标点', { timeout: CHECK_TIMEOUT_MS * 2 }, () => {
  it('原文含破折号：译文可用破折号', () => {
    const { status, output } = checkSource(staticSource({ 'Sample — text': '示例——文本' }))

    expect(status, output).toBe(0)
  })

  it('原文无标点：译文有标点时报错', () => {
    const { status, output } = checkSource(staticSource({ 'Sample text': '示例——文本' }))

    expect(status, output).toBe(1)
    expect(output).toContain('原文无标点，译文不应有标点')
  })
})

describe('check-locale 标签表', { timeout: CHECK_TIMEOUT_MS * 3 }, () => {
  /** 只含这些名称表条目的词典源码 */
  function labelsSource(entries: Readonly<Record<string, string>>): string {
    return `export default { labels: ${JSON.stringify(entries)} }\n`
  }

  /** 只含这些说明表条目的词典源码 */
  function descriptionsSource(entries: Readonly<Record<string, string>>): string {
    return `export default { labelDescriptions: ${JSON.stringify(entries)} }\n`
  }

  it('合法标签表：通过，按 labels 计数', () => {
    const { status, output } = checkSource(labelsSource({ bug: '缺陷', 'good first issue': '适合新手的议题' }))

    expect(status, output).toBe(0)
    expect(output).toContain('labels 2')
    expect(output).toContain('2 条词条')
    expect(output).not.toContain('未知字段')
  })

  it('条目检查同 static：译文为空、首尾空白，键未规范化、不含英文字母，不是对象：报错', () => {
    const bad = checkSource(
      labelsSource({ invalid: '', question: ' 疑问', ' bug': '缺陷', 'help  wanted': '需要帮助', 缺陷: '程序缺陷' }),
    )

    expect(bad.status, bad.output).toBe(1)
    for (const message of [
      'labels "invalid"：译文为空或不是字符串',
      'labels "question"：译文首尾有空白',
      'labels " bug"：键未规范化',
      'labels "help  wanted"：键未规范化',
      'labels "缺陷"：键不含英文字母，不会被匹配',
    ]) {
      expect(bad.output).toContain(message)
    }

    const array = checkSource("export default { labels: ['bug'] }\n")

    expect(array.status, array.output).toBe(1)
    expect(array.output).toContain('labels 必须是对象')
  })

  it('标签表的值不是字符串：报错', () => {
    const { status, output } = checkSource('export default { labels: { bug: 1, question: null } }\n')

    expect(status, output).toBe(1)
    expect(output).toContain('labels "bug"：译文为空或不是字符串')
    expect(output).toContain('labels "question"：译文为空或不是字符串')
  })

  it('说明表：合法时通过，按 labelDescriptions 计数；条目检查同 static', () => {
    const { status, output } = checkSource(descriptionsSource({ 'Good for newcomers': '适合新手' }))

    expect(status, output).toBe(0)
    expect(output).toContain('labelDescriptions 1')
    expect(output).toContain('1 条词条')
    expect(output).not.toContain('未知字段')

    const bad = checkSource(
      descriptionsSource({ 'Good for newcomers': '', ' Extra attention is needed': '需要额外关注' }),
    )

    expect(bad.status, bad.output).toBe(1)
    expect(bad.output).toContain('labelDescriptions "Good for newcomers"：译文为空或不是字符串')
    expect(bad.output).toContain('labelDescriptions " Extra attention is needed"：键未规范化')

    const array = checkSource("export default { labelDescriptions: ['Good for newcomers'] }\n")

    expect(array.status, array.output).toBe(1)
    expect(array.output).toContain('labelDescriptions 必须是对象')
  })

  it('标签正则：合法时通过，按 labelRegexp 计数', () => {
    const { status, output } = checkSource(
      "export default { labelRegexp: [[/^Pull requests that update ([\\w.#+ -]{1,40}) code$/, '更新 $1 代码的拉取请求']] }\n",
    )

    expect(status, output).toBe(0)
    expect(output).toContain('labelRegexp 1')
    expect(output).toContain('1 条词条')
    expect(output).not.toContain('未知字段')
  })

  it('标签正则的检查同 regexp：未锚定、带 g 标志、结构不对、不是数组：报错', () => {
    const bad = checkSource(
      `export default {
  labelRegexp: [
    [/Pull requests that update (.+) code$/, '更新 $1 代码的拉取请求'],
    [/^Sample (\\d+)$/g, '示例 $1'],
    ['bug', '缺陷'],
  ],
}\n`,
    )

    expect(bad.status, bad.output).toBe(1)
    expect(bad.output).toContain('labelRegexp[0] /Pull requests that update (.+) code$/：必须以 ^ 开头、$ 结尾')
    expect(bad.output).toContain('labelRegexp[1] /^Sample (\\d+)$/g：不得使用 g / y 标志')
    expect(bad.output).toContain('labelRegexp[2]：应为 [RegExp, string | function]')

    const object = checkSource("export default { labelRegexp: { bug: '缺陷' } }\n")

    expect(object.status, object.output).toBe(1)
    expect(object.output).toContain('labelRegexp 必须是数组')
  })

  it('星标列表名表：合法时通过，按 listNames 计数；条目检查同 static', () => {
    const { status, output } = checkSource(
      `export default { listNames: ${JSON.stringify({ '✨ Inspiration': '✨ 灵感' })} }\n`,
    )

    expect(status, output).toBe(0)
    expect(output).toContain('listNames 1')
    expect(output).toContain('1 条词条')
    expect(output).not.toContain('未知字段')

    const bad = checkSource(
      `export default { listNames: ${JSON.stringify({ '✨ Inspiration': '', ' 🚀 My stack': '🚀 我的技术栈', '✨': '灵感' })} }\n`,
    )

    expect(bad.status, bad.output).toBe(1)
    expect(bad.output).toContain('listNames "✨ Inspiration"：译文为空或不是字符串')
    expect(bad.output).toContain('listNames " 🚀 My stack"：键未规范化')
    expect(bad.output).toContain('listNames "✨"：键不含英文字母，不会被匹配')

    const array = checkSource("export default { listNames: ['✨ Inspiration'] }\n")

    expect(array.status, array.output).toBe(1)
    expect(array.output).toContain('listNames 必须是对象')
  })

  it('全量检查：不同文件的名称表、说明表里同一原文译文不同时报冲突，译文相同时记重复', () => {
    // 临时目录里放一套语言目录（index.ts 注册两个词典），以它为工作目录全量检查
    const root = join(dir, 'src/locales/zh-CN')
    mkdirSync(root, { recursive: true })
    const tablesSource = (labels: Readonly<Record<string, string>>, descriptions: Readonly<Record<string, string>>) =>
      `export default { labels: ${JSON.stringify(labels)}, labelDescriptions: ${JSON.stringify(descriptions)} }\n`
    writeFileSync(
      join(root, 'a.ts'),
      tablesSource(
        { bug: '缺陷', question: '疑问' },
        { 'Good for newcomers': '适合新手', 'Extra attention is needed': '需要额外关注' },
      ),
    )
    writeFileSync(
      join(root, 'b.ts'),
      tablesSource(
        { bug: '错误', question: '疑问' },
        { 'Good for newcomers': '新手友好', 'Extra attention is needed': '需要额外关注' },
      ),
    )
    writeFileSync(
      join(root, 'index.ts'),
      "import a from './a'\nimport b from './b'\n\nexport const zhCN = [\n  ['common', a],\n  ['issues', b],\n]\n",
    )

    const result = spawnSync(process.execPath, [TSX_CLI, SCRIPT], {
      cwd: dir,
      encoding: 'utf8',
      timeout: CHECK_TIMEOUT_MS,
    })
    const output = `${result.stdout}${result.stderr}${result.error?.message ?? ''}`

    expect(result.status, output).toBe(1)
    expect(output).toContain('labels "bug" 冲突：src/locales/zh-CN/a.ts「缺陷」≠ 本文件「错误」')
    expect(output).toContain('labels "question" 与 src/locales/zh-CN/a.ts 重复')
    expect(output).toContain(
      'labelDescriptions "Good for newcomers" 冲突：src/locales/zh-CN/a.ts「适合新手」≠ 本文件「新手友好」',
    )
    expect(output).toContain('labelDescriptions "Extra attention is needed" 与 src/locales/zh-CN/a.ts 重复')
    expect(output).toContain('共 2 个文件，8 条词条，2 个错误')
  })

  it('全量检查：不同文件的星标列表名表里同一原文译文不同时报冲突，译文相同时记重复', () => {
    const root = join(dir, 'src/locales/zh-CN')
    mkdirSync(root, { recursive: true })
    const listSource = (names: Readonly<Record<string, string>>) =>
      `export default { listNames: ${JSON.stringify(names)} }\n`
    writeFileSync(join(root, 'a.ts'), listSource({ '✨ Inspiration': '✨ 灵感', '🚀 My stack': '🚀 我的技术栈' }))
    writeFileSync(join(root, 'b.ts'), listSource({ '✨ Inspiration': '✨ 启发', '🚀 My stack': '🚀 我的技术栈' }))
    writeFileSync(
      join(root, 'index.ts'),
      "import a from './a'\nimport b from './b'\n\nexport const zhCN = [\n  ['common', a],\n  ['profile', b],\n]\n",
    )

    const result = spawnSync(process.execPath, [TSX_CLI, SCRIPT], {
      cwd: dir,
      encoding: 'utf8',
      timeout: CHECK_TIMEOUT_MS,
    })
    const output = `${result.stdout}${result.stderr}${result.error?.message ?? ''}`

    expect(result.status, output).toBe(1)
    expect(output).toContain('listNames "✨ Inspiration" 冲突：src/locales/zh-CN/a.ts「✨ 灵感」≠ 本文件「✨ 启发」')
    expect(output).toContain('listNames "🚀 My stack" 与 src/locales/zh-CN/a.ts 重复')
    expect(output).toContain('共 2 个文件，4 条词条，1 个错误')
  })
})

describe('check-locale 属性规则', { timeout: CHECK_TIMEOUT_MS * 3 }, () => {
  it('合法规则：通过，退出码 0', () => {
    const { status, output } = checkSource(
      `export default { attributeRules: [['.sample a', 'aria-label', /^View (.+)$/, '查看 $1'], ['.sample input[disabled]', 'value', /^Sample (.+)$/, '示例 $1']] }\n`,
    )

    expect(status, output).toBe(0)
  })

  it('属性名不是可翻译属性：报错', () => {
    const { status, output } = checkSource(
      `export default { attributeRules: [['.sample a', 'href', /^View (.+)$/, '查看 $1']] }\n`,
    )

    expect(status, output).toBe(1)
    expect(output).toContain('属性名必须是可翻译属性')
  })

  it('结构不对、选择器为空、正则未锚定：报错', () => {
    const { status, output } = checkSource(
      `export default { attributeRules: [['.sample a', 'aria-label', /^View/], ['', 'title', /View (.+)$/, '查看 $1']] }\n`,
    )

    expect(status, output).toBe(1)
    expect(output).toContain('应为 [选择器, 属性名, RegExp, string | function]')
    expect(output).toContain('选择器为空')
    expect(output).toContain('必须以 ^ 开头、$ 结尾')
  })
})

describe('check-locale 行内句与整段合并', { timeout: CHECK_TIMEOUT_MS * 3 }, () => {
  it('合法规则：通过，退出码 0', () => {
    const { status, output } = checkSource(
      `export default {
  inline: [
    ['Are you sure you want to unblock {} from {}?', '确定要取消阻止 {} 访问 {} 吗？'],
    ['{#} merged', '{#} 个已合并'],
    [/^\\{\\} published \\{\\} \\{\\}$/, '{} 发布了 {} {}'],
    [/^Allow this (GitHub|OAuth) App via the \\{\\}\\.$/, '允许此 $1 应用通过 {}。'],
  ],
  mergeText: ['h3 > span[data-sr-feedback]'],
}\n`,
    )

    expect(status, output).toBe(0)
    expect(output).toContain('inline 4')
  })

  it('句型没有槽位、未规范化、译文槽位数不符、正则未锚定：报错', () => {
    const { status, output } = checkSource(
      `export default {
  inline: [
    ['No slot here', '没有槽位'],
    [' {} merged', '{} 已合并'],
    ['{} published {}', '{} 发布了'],
    [/\\{\\} pushed$/, '{} 推送了'],
    ['{} only'],
  ],
}\n`,
    )

    expect(status, output).toBe(1)
    expect(output).toContain('句型没有槽位，应写进 static / scoped')
    expect(output).toContain('句型未规范化')
    expect(output).toContain('译文有 1 个槽位，句型有 2 个')
    expect(output).toContain('必须以 ^ 开头、$ 结尾')
    expect(output).toContain('应为 [string | RegExp, string | function]')
  })

  it('原文无标点而译文有标点、整段合并选择器为空：报错', () => {
    const { status, output } = checkSource(
      `export default { inline: [['{} merged', '{} 已合并。']], mergeText: [''] }\n`,
    )

    expect(status, output).toBe(1)
    expect(output).toContain('原文无标点，译文不应有标点')
    expect(output).toContain('mergeText[0]：选择器为空')
  })

  it('标点与空格检查中槽位按占位计：句末「标点 + 空格 + 槽位」不误报，槽位前的半角标点照报；报错显示原译文', () => {
    const { status, output } = checkSource(
      inlineSource([
        ['Sample text from {}: {}', '来自 {} 的示例文本：{}'],
        ['Sample text. {}', '示例文本。{}'],
        ['See {}: {}', '见 {}：{}。'],
        ['Sample text from {}: {}!', '来自 {} 的示例文本:{}！'],
      ]),
    )

    expect(status, output).toBe(1)
    expect(output).not.toContain('inline[0]')
    expect(output).not.toContain('inline[1]')
    expect(output).toContain('inline[2] "See {}: {}"：原文结尾无标点，译文结尾不应有标点 → 见 {}：{}。')
    expect(output).toContain('inline[3] "Sample text from {}: {}!"：中文后接半角标点 → 来自 {} 的示例文本:{}！')
  })

  it('正则句型的译文带 $n：所引用捕获组带入的槽位计入译文槽位数', () => {
    const { status, output } = checkSource(
      `export default {
  inline: [
    [/^Allow this (GitHub|OAuth) App via the \\{\\}\\.$/, '允许此 $1 应用。'],
    [/^Allow this (GitHub|OAuth) App via the \\{\\}\\.$/, '允许此 $1 应用通过 {} 和 {}。'],
    [/^Allow this (GitHub|OAuth) App via the ?(\\{\\})\\.$/, '允许此 $1 应用通过 $2。'],
    [/^Allow this (GitHub|OAuth) App via the ?(\\{\\})\\.$/, '允许此 $1 应用通过 $2 和 $2。'],
  ],
}\n`,
    )

    expect(status, output).toBe(1)
    const plain = '/^Allow this (GitHub|OAuth) App via the \\{\\}\\.$/'
    const carried = '/^Allow this (GitHub|OAuth) App via the ?(\\{\\})\\.$/'
    expect(output).toContain(`inline[0] ${plain}：译文有 0 个槽位，句型有 1 个`)
    expect(output).toContain(`inline[1] ${plain}：译文有 2 个槽位，句型有 1 个`)
    expect(output).not.toContain('inline[2]')
    expect(output).toContain(`inline[3] ${carried}：译文有 2 个槽位（引用带入 2 个），句型有 1 个`)
  })

  it('正则句型的译文带 $<名称>、$&、$$、两位数 $nn：按替换写法计入所引用内容中的槽位', () => {
    const { status, output } = checkSource(
      `export default {
  regexp: [[/^Sample text$/, '示例文本 $$1']],
  inline: [
    [/^Allow this (GitHub|OAuth) App via the ?(?<who>\\{\\})\\.$/, '允许此 $1 应用通过 $<who>。'],
    [/^Allow this (GitHub|OAuth) App via the ?(?<who>\\{\\})\\.$/, '允许此 $1 应用通过 $<who> 和 $2。'],
    [/^Allow this (GitHub|OAuth) App via the ?(?<who>\\{\\})\\.$/, '允许此 $1 应用通过 $<whom>。'],
    [/^Sample text by \\{\\}$/, '示例文本 $&'],
    [/^Sample text by ?(\\{\\})$/, '示例文本 $$1 {}'],
    [/^Sample text by ?(\\{\\})$/, '示例文本 $10'],
  ],
}\n`,
    )

    expect(status, output).toBe(1)
    const named = '/^Allow this (GitHub|OAuth) App via the ?(?<who>\\{\\})\\.$/'
    expect(output).not.toContain('regexp[0]')
    expect(output).not.toContain('inline[0]')
    expect(output).toContain(`inline[1] ${named}：译文有 2 个槽位（引用带入 2 个），句型有 1 个`)
    expect(output).toContain(`inline[2] ${named}：译文有 0 个槽位，句型有 1 个`)
    expect(output).toContain(`inline[2] ${named}：$<whom> 不是命名组`)
    for (const index of [3, 4]) expect(output).not.toContain(`inline[${index}]`)
    expect(output).toContain('inline[5] /^Sample text by ?(\\{\\})$/：$10 超出捕获组数量 1')
    expect(output).not.toMatch(/inline\[5\].*译文有/)
  })

  it('字符串句型的键长、子节点数超过引擎上限：报错', () => {
    const { status, output } = checkSource(
      inlineSource([
        [`${words(298)} {}.`, '示例文本，见 {}。'],
        [`${words(299)} {}.`, '示例文本，见 {}。'],
        [`Sample ${slots(19, ' and ')} done.`, `示例 ${slots(19, ' 和 ')} 完成。`],
        [`Sample ${slots(20, ' and ')} done.`, `示例 ${slots(20, ' 和 ')} 完成。`],
        [slots(20, ' and '), slots(20, ' 和 ')],
      ]),
    )

    expect(status, output).toBe(1)
    expect(output).toMatch(/inline\[1\] .*：句型键长 301，超过上限 300，不会被匹配/)
    expect(output).toMatch(/inline\[3\] .*：至少 41 个子节点，超过上限 40，不会被匹配/)
    for (const index of [0, 2, 4]) expect(output).not.toContain(`inline[${index}]`)
  })
})

describe('check-locale 繁体检查', { timeout: CHECK_TIMEOUT_MS * 2 }, () => {
  const TW = ['--locale=zh-TW']

  it('static 译文含简体字：报错', () => {
    const result = checkSource(staticSource({ Settings: '设定' }), TW)
    expect(result.status).toBe(1)
    expect(result.output).toContain('含简体字「设」')
  })

  it('替换函数、模块内常量里的简体字同样报错（按行号）', () => {
    const result = checkSource(
      [
        "const LABELS: Record<string, string> = { Actor: '参与者' }",
        'export default {',
        '  regexp: [',
        '    [/^(\\d+) files?$/, (_: string, n: string) => `${n} 个文件`],',
        '    [/^Actor: (.+)$/, (_: string, v: string) => `${LABELS.Actor}：${v}`],',
        '  ],',
        '}',
        '',
      ].join('\n'),
      TW,
    )
    expect(result.status).toBe(1)
    expect(result.output).toContain('第 1 行：含简体字「参与」')
    expect(result.output).toContain('第 4 行：含简体字「个」')
  })

  it('注释与抛出的错误信息不查；繁体也通行的词不报', () => {
    const result = checkSource(
      [
        '// 简体注释：设置',
        'export function parse(text: string): never {',
        '  throw new Error(`无法解析时间：${text}`)',
        '}',
        "export default { static: { Milestones: '里程碑', Employer: '雇主' } }",
        '',
      ].join('\n'),
      TW,
    )
    expect(result.status).toBe(0)
  })

  it('大陆用语、弯引号：只警告', () => {
    const result = checkSource(staticSource({ 'Sample text': '軟件', 'Sample "text"': '“文字”' }), TW)
    expect(result.status).toBe(0)
    expect(result.output).toContain('大陆用语「軟件」')
    expect(result.output).toContain('引号用「」')
  })

  it('简体模式不做繁体检查', () => {
    expect(checkSource(staticSource({ Settings: '设置' })).status).toBe(0)
  })

  it('--locale zh-TW（空格分隔）同样生效', () => {
    const result = checkSource(staticSource({ Settings: '设定' }), ['--locale', 'zh-TW'])
    expect(result.status).toBe(1)
    expect(result.output).toContain('含简体字「设」')
  })

  it('未知参数、未知语言：报错退出', () => {
    expect(checkSource(staticSource({ Settings: '設定' }), ['--lang=zh-TW']).output).toContain('未知参数 --lang=zh-TW')
    expect(checkSource(staticSource({ Settings: '設定' }), ['--locale=ja']).status).toBe(1)
  })
})
