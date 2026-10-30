/**
 * 词典覆盖率统计，输出各区域待翻译摘要。
 * 用法：bun run coverage:locale [--raw .harvest/raw]... [--out .harvest/digest] [--all] [--unused]
 *   --raw 可重复，合并多个采集目录；页面类型按当前 page.ts 重新判断
 *   默认摘要只列未翻译文本；--all 同时列出已翻译文本及译文
 *   --unused 另列采集页面上从未用到的词条（可能已过时；页面覆盖不全，删除前人工核对）
 * 输出：<out>/<区域>.txt（每行：页面数 \t 出现次数 \t 类型 \t 原文 [\t → 译文]），<out>/coverage.json，
 *   --unused 时另有 <out>/unused.txt（每行：文件 \t 类型 \t 原文或正则）
 */
import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { parseArgs } from 'node:util'
import { createMatcher, normalizeText } from '../src/core/matcher'
import { detectPages } from '../src/core/page'
import { TITLE_SEPARATOR } from '../src/core/title'
import type { PageDictionary, PageKey } from '../src/core/types'
import { zhCN } from '../src/locales/zh-CN/index'
import { isLikelyContent } from './content'
import type { HarvestedPage } from './harvest'
import { expandGroup, groupTexts, HARVEST_MAX_LENGTH, type HarvestedString } from './harvest-extract'
import {
  arrayOf,
  displayPath,
  isDictionaryLike,
  listDictionaryFiles,
  mergedFiles,
  ownEntriesByFile,
  pageKeysByFile,
  recordOf,
} from './locale-wiring'

/** 出现在至少这个比例的页面上的文本归入 common */
const COMMON_RATIO = 0.25

interface StringStat {
  readonly text: string
  readonly kinds: Set<string>
  count: number
  readonly pages: Set<string>
  readonly areaPages: Map<string, number>
  readonly scopes: Map<string, readonly PageKey[]>
}

interface LoadedPage {
  readonly area: string
  readonly page: HarvestedPage
  /** 按当前路由规则判断的页面类型（采集时记录的可能已过时） */
  readonly scopes: readonly PageKey[]
}

/** 标题按分段符拆开统计，与引擎逐段翻译一致 */
function expandTitle(item: HarvestedString): HarvestedString[] {
  if (item.kind !== 'title') return [item]
  return item.text
    .split(TITLE_SEPARATOR)
    .map((segment) => normalizeText(segment))
    .filter((text) => /[A-Za-z]/.test(text))
    .map((text) => ({ ...item, text }))
}

async function loadPages(rawDirs: readonly string[]): Promise<LoadedPage[]> {
  const loaded = await Promise.all(
    rawDirs.map(async (rawDir) => {
      const files = (await readdir(rawDir)).filter((file) => file.endsWith('.json'))
      return Promise.all(
        files.map(
          async (file) =>
            JSON.parse(await readFile(resolve(rawDir, file), 'utf8')) as { area: string; pages: HarvestedPage[] },
        ),
      )
    }),
  )
  return loaded
    .flat()
    .flatMap(({ area, pages }) =>
      pages
        .filter((page) => !page.redirected && isGitHubPage(page.finalUrl))
        .map((page) => ({ area, page, scopes: detectPages(new URL(page.finalUrl)) })),
    )
}

/** 旧采集数据未标记跳出站点的页面（如 /apps/dependabot → docs.github.com） */
function isGitHubPage(url: string): boolean {
  const { hostname } = new URL(url)
  return hostname === 'github.com' || hostname === 'gist.github.com'
}

/** 文本组按引擎的做法展开：整组命中计整组文字，否则计各段 */
function collect(
  pages: readonly LoadedPage[],
  translate: (text: string, scopes: readonly PageKey[]) => string | undefined,
): Map<string, StringStat> {
  const stats = new Map<string, StringStat>()
  for (const { area, page, scopes } of pages) {
    const items = page.strings
      .flatMap(expandTitle)
      .flatMap((item) => expandGroup(item, (text) => translate(text, scopes)))
    for (const item of items) {
      if (isLikelyContent(item.text)) continue
      const stat =
        stats.get(item.text) ??
        ({
          text: item.text,
          kinds: new Set(),
          count: 0,
          pages: new Set(),
          areaPages: new Map(),
          scopes: new Map(),
        } satisfies StringStat)
      stats.set(item.text, stat)
      stat.kinds.add(item.kind)
      stat.count += item.count
      if (!stat.pages.has(page.finalUrl)) {
        stat.pages.add(page.finalUrl)
        stat.areaPages.set(area, (stat.areaPages.get(area) ?? 0) + 1)
      }
      stat.scopes.set(scopes.join('|'), scopes)
    }
  }
  return stats
}

/** 全部文本（含疑似用户内容）及其出现过的页面类型，用于判断词条是否用到 */
function collectTexts(pages: readonly LoadedPage[]): Map<string, Set<PageKey>> {
  const texts = new Map<string, Set<PageKey>>()
  for (const { page, scopes } of pages) {
    for (const text of page.strings.flatMap(expandTitle).flatMap(groupTexts)) {
      const keys = texts.get(text) ?? new Set<PageKey>()
      texts.set(text, keys)
      for (const key of scopes) keys.add(key)
    }
  }
  return texts
}

/** 页面数相同时按区域名排序，结果与 --raw 的先后顺序无关 */
function assignArea(stat: StringStat, totalPages: number): string {
  if (stat.pages.size / totalPages >= COMMON_RATIO || stat.areaPages.has('common')) return 'common'
  return [...stat.areaPages].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))[0]![0]
}

/** 加载全部词典文件；加载失败、没有默认导出的（正在编写的、共用工具模块）跳过并提示 */
async function loadDictionaries(): Promise<Map<string, PageDictionary>> {
  const dicts = new Map<string, PageDictionary>()
  for (const file of listDictionaryFiles()) {
    try {
      const dict = ((await import(pathToFileURL(file).href)) as { default?: unknown }).default
      if (isDictionaryLike(dict)) dicts.set(file, dict)
    } catch (error) {
      process.stdout.write(`跳过 ${displayPath(file)}：${error instanceof Error ? error.message : String(error)}\n`)
    }
  }
  return dicts
}

/** 采集页面上从未用到的词条：static 看原文是否出现；scoped、regexp 只看生效页面类型的页面（common 看全部） */
async function reportUnused(texts: ReadonlyMap<string, ReadonlySet<PageKey>>, outDir: string): Promise<void> {
  const dicts = await loadDictionaries()
  const merged = mergedFiles(dicts)
  const keysByFile = pageKeysByFile(dicts, zhCN, merged)
  const allTexts = [...texts.keys()]
  /** 页面类型组合 → 这些页面上出现过的文本 */
  const textsByKeys = new Map<string, { readonly list: readonly string[]; readonly set: ReadonlySet<string> }>()
  const textsFor = (
    keys: readonly PageKey[],
  ): { readonly list: readonly string[]; readonly set: ReadonlySet<string> } => {
    const signature = keys.includes('common') ? 'common' : [...keys].sort().join('|')
    let entry = textsByKeys.get(signature)
    if (!entry) {
      const list =
        signature === 'common' ? allTexts : allTexts.filter((text) => keys.some((key) => texts.get(text)!.has(key)))
      entry = { list, set: new Set(list) }
      textsByKeys.set(signature, entry)
    }
    return entry
  }
  // 采集时丢弃了超长文本，这类词条无从判断
  const observable = (key: string): boolean => key.length <= HARVEST_MAX_LENGTH
  const lines: string[] = []
  let total = 0
  for (const [file, dict] of ownEntriesByFile(dicts, merged)) {
    const keys = keysByFile.get(file) ?? []
    const scopedTexts = textsFor(keys)
    const name = displayPath(file)
    const statics = Object.keys(recordOf(dict.static))
    const scopeds = Object.keys(recordOf(dict.scoped))
    const rules = arrayOf(dict.regexp)
    const unused = [
      ...statics.filter((key) => observable(key) && !texts.has(key)).map((key) => ['static', key]),
      ...scopeds.filter((key) => observable(key) && !scopedTexts.set.has(key)).map((key) => ['scoped', key]),
      ...rules
        .filter(([pattern]) => !scopedTexts.list.some((text) => pattern.test(text)))
        .map(([pattern]) => ['regexp', String(pattern)]),
    ]
    total += statics.length + scopeds.length + rules.length
    lines.push(...unused.map(([kind, source]) => [name, kind, source].join('\t')))
  }
  await writeFile(resolve(outDir, 'unused.txt'), `${lines.join('\n')}\n`)
  process.stdout.write(`未用到的词条 ${lines.length} / ${total}，见 ${displayPath(resolve(outDir, 'unused.txt'))}\n`)
}

async function main(): Promise<void> {
  const { values } = parseArgs({
    options: {
      raw: { type: 'string', multiple: true, default: ['.harvest/raw'] },
      out: { type: 'string', default: '.harvest/digest' },
      all: { type: 'boolean', default: false },
      unused: { type: 'boolean', default: false },
    },
  })
  const pages = await loadPages(values.raw.map((dir) => resolve(dir)))
  const totalPages = new Set(pages.map(({ page }) => page.finalUrl)).size
  const matcher = createMatcher(zhCN)
  const stats = collect(pages, (text, scopes) => matcher.translate(text, scopes))
  const byArea = new Map<string, string[]>()
  const summary: Record<string, { total: number; translated: number; missing: number; coverage: number }> = {}

  const sorted = [...stats.values()].sort(
    (a, b) => b.pages.size - a.pages.size || b.count - a.count || a.text.localeCompare(b.text),
  )
  for (const stat of sorted) {
    const area = assignArea(stat, totalPages)
    const results = [...stat.scopes.values()].map((scopes) => matcher.translate(stat.text, scopes))
    const translated = results.every((result) => result !== undefined)
    const entry = (summary[area] ??= { total: 0, translated: 0, missing: 0, coverage: 0 })
    entry.total++
    if (translated) entry.translated++
    else entry.missing++
    if (translated && !values.all) continue
    const line = [stat.pages.size, stat.count, [...stat.kinds].sort().join(','), stat.text]
    if (translated) line.push(`→ ${results[0]}`)
    byArea.set(area, [...(byArea.get(area) ?? []), line.join('\t')])
  }

  const outDir = resolve(values.out)
  await mkdir(outDir, { recursive: true })
  for (const [area, lines] of byArea) {
    await writeFile(resolve(outDir, `${area}.txt`), `${lines.join('\n')}\n`)
  }
  let total = 0
  let translated = 0
  for (const [area, entry] of Object.entries(summary).sort()) {
    entry.coverage = entry.total === 0 ? 1 : entry.translated / entry.total
    total += entry.total
    translated += entry.translated
    process.stdout.write(
      `${area.padEnd(14)} ${String(entry.translated).padStart(5)} / ${String(entry.total).padEnd(5)} ${(entry.coverage * 100).toFixed(1)}%\n`,
    )
  }
  const overall = total === 0 ? 1 : translated / total
  process.stdout.write(`总计 ${translated} / ${total}  ${(overall * 100).toFixed(1)}%（${totalPages} 页）\n`)
  await writeFile(
    resolve(outDir, 'coverage.json'),
    JSON.stringify({ totalPages, overall, areas: Object.fromEntries(Object.entries(summary).sort()) }, null, 2),
  )
  if (values.unused) await reportUnused(collectTexts(pages), outDir)
}

await main()
