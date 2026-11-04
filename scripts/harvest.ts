/**
 * 抓取公开 GitHub 页面（未登录）的界面文本，供编写词典、统计覆盖率使用。
 *
 * 用法：bun run harvest [--urls scripts/harvest-urls.json] [--out .harvest/raw] [--areas issues,pulls] [--concurrency 3]
 * 输出：<out>/<area>.json
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { parseArgs } from 'node:util'
import { chromium, type BrowserContext, type Page } from '@playwright/test'
import { BUTTON_INPUT_TYPES, IGNORE_SELECTORS, IGNORE_TAGS, TRANSLATABLE_ATTRIBUTES } from '../src/core/ignore'
import { TIME_TAGS } from '../src/core/dom'
import { createMatcher } from '../src/core/matcher'
import { detectPages } from '../src/core/page'
import type { PageKey } from '../src/core/types'
import { zhCN } from '../src/locales/zh-CN/index'
import { extractStrings, type HarvestedString } from './harvest-extract'

export type { HarvestedString }

interface FollowSpec {
  /** 匹配页面内链接（绝对地址）的正则 */
  readonly pattern: string
  readonly count: number
  /** 依次追加到链接后的后缀，默认 [''] */
  readonly suffixes?: readonly string[]
  readonly then?: FollowSpec
}

type UrlSpec = string | { readonly url: string; readonly follow?: FollowSpec }

export interface HarvestedPage {
  readonly url: string
  readonly finalUrl: string
  readonly status: number
  /** 被重定向到登录页等 */
  readonly redirected: boolean
  readonly scopes: readonly PageKey[]
  readonly strings: readonly HarvestedString[]
}

interface Task {
  readonly area: string
  readonly url: string
  readonly follow?: FollowSpec
}

const MAX_ATTEMPTS = 3
const matcher = createMatcher(zhCN)
const RATE_LIMIT_BACKOFF_MS = 20_000

function collectLinks(): string[] {
  return [...new Set([...document.querySelectorAll('a[href]')].map(a => (a as HTMLAnchorElement).href))]
}

async function settle(page: Page): Promise<void> {
  await page.waitForLoadState('networkidle', { timeout: 10_000 }).catch(() => undefined)
  for (let i = 0; i < 4; i++) {
    await page.evaluate(() => window.scrollBy(0, window.innerHeight))
    await page.waitForTimeout(400)
  }
  await page.evaluate(() => window.scrollTo(0, 0))
  await page.waitForLoadState('networkidle', { timeout: 5_000 }).catch(() => undefined)
}

/** 内容脚本只注入这两个站点 */
const GITHUB_HOSTS: ReadonlySet<string> = new Set(['github.com', 'gist.github.com'])

/** 跳到登录页，或跳出 GitHub 站点（如 /apps/dependabot → docs.github.com） */
function isRedirectedAway(requested: string, final: string): boolean {
  const { hostname, pathname } = new URL(final)
  if (!GITHUB_HOSTS.has(hostname)) return true
  return !new URL(requested).pathname.startsWith('/login') && (pathname === '/login' || pathname.startsWith('/session'))
}

async function visit(page: Page, task: Task): Promise<{ page: HarvestedPage; links: string[] }> {
  for (let attempt = 1; ; attempt++) {
    const response = await page.goto(task.url, { waitUntil: 'domcontentloaded', timeout: 60_000 })
    const status = response?.status() ?? 0
    if (status === 429 && attempt < MAX_ATTEMPTS) {
      await page.waitForTimeout(RATE_LIMIT_BACKOFF_MS * attempt)
      continue
    }
    await settle(page)
    const finalUrl = page.url()
    const scopes = detectPages(new URL(finalUrl))
    const ignoreSelector = [...IGNORE_SELECTORS, ...matcher.ignoreSelectors(scopes)].join(',')
    const strings = await page.evaluate(extractStrings, {
      ignoreSelector,
      ignoreTags: [...IGNORE_TAGS],
      timeTags: [...TIME_TAGS],
      attributes: TRANSLATABLE_ATTRIBUTES,
      buttonTypes: [...BUTTON_INPUT_TYPES]
    })
    const links = task.follow ? await page.evaluate(collectLinks) : []
    return {
      page: { url: task.url, finalUrl, status, redirected: isRedirectedAway(task.url, finalUrl), scopes, strings },
      links
    }
  }
}

function expandFollow(task: Task, links: readonly string[]): Task[] {
  const follow = task.follow
  if (!follow) return []
  const pattern = new RegExp(follow.pattern)
  const picked = links.filter(link => pattern.test(link.split(/[?#]/)[0]!)).slice(0, follow.count)
  return picked.flatMap(link =>
    (follow.suffixes ?? ['']).map(suffix => ({
      area: task.area,
      url: link.split(/[?#]/)[0]! + suffix,
      follow: follow.then
    }))
  )
}

async function runQueue(context: BrowserContext, initial: Task[], concurrency: number): Promise<Map<string, HarvestedPage[]>> {
  const queue = [...initial]
  const seen = new Set(initial.map(task => task.url))
  const results = new Map<string, HarvestedPage[]>()
  let done = 0

  async function worker(): Promise<void> {
    const page = await context.newPage()
    for (let task = queue.shift(); task; task = queue.shift()) {
      try {
        const { page: harvested, links } = await visit(page, task)
        results.set(task.area, [...(results.get(task.area) ?? []), harvested])
        for (const next of expandFollow(task, links)) {
          if (seen.has(next.url)) continue
          seen.add(next.url)
          queue.push(next)
        }
        done++
        process.stdout.write(`[${done}] ${task.area} ${harvested.status} ${harvested.strings.length} ${task.url}\n`)
      } catch (error) {
        process.stderr.write(`失败 ${task.url}: ${error instanceof Error ? error.message : String(error)}\n`)
      }
    }
    await page.close()
  }

  await Promise.all(Array.from({ length: concurrency }, () => worker()))
  return results
}

function toTasks(config: Record<string, readonly UrlSpec[]>, areas: ReadonlySet<string> | undefined): Task[] {
  return Object.entries(config)
    .filter(([area]) => !areas || areas.has(area))
    .flatMap(([area, specs]) =>
      specs.map(spec => (typeof spec === 'string' ? { area, url: spec } : { area, url: spec.url, follow: spec.follow }))
    )
}

async function main(): Promise<void> {
  const { values } = parseArgs({
    options: {
      urls: { type: 'string', default: 'scripts/harvest-urls.json' },
      out: { type: 'string', default: '.harvest/raw' },
      areas: { type: 'string' },
      concurrency: { type: 'string', default: '3' }
    }
  })
  const config = JSON.parse(await readFile(resolve(values.urls), 'utf8')) as Record<string, readonly UrlSpec[]>
  const areas = values.areas ? new Set(values.areas.split(',').map(area => area.trim())) : undefined
  const tasks = toTasks(config, areas)
  const outDir = resolve(values.out)
  await mkdir(outDir, { recursive: true })

  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({
    locale: 'en-US',
    viewport: { width: 1440, height: 900 },
    extraHTTPHeaders: { 'Accept-Language': 'en-US,en;q=0.9' }
  })
  // tsx（esbuild keepNames）会给函数包一层 __name，页面内需要同名占位
  await context.addInitScript({ content: 'globalThis.__name = (fn) => fn' })
  try {
    const results = await runQueue(context, tasks, Math.max(1, Number(values.concurrency)))
    for (const [area, pages] of results) {
      await writeFile(resolve(outDir, `${area}.json`), JSON.stringify({ area, pages }, null, 1))
    }
    process.stdout.write(`完成：${[...results.values()].flat().length} 页 → ${outDir}\n`)
  } finally {
    await browser.close()
  }
}

await main()
