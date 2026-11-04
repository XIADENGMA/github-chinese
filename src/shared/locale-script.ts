/**
 * 词典脚本的注册（后台）：把当前语言的词典脚本注册为 document_start 内容脚本，与 content.ts 同一组站点。
 * 页面开始解析前语言包已登记（见 locale-loader.ts），内容脚本不用等动态导入，打开页面即显示中文。
 * 自动语言按 pageLanguageEnvironment 识别，与内容脚本同一来源。
 * 注册、更新都显式写持久：Chromium 的更新不带该标志时把注册降为仅本次会话，重启浏览器后不恢复。
 * 总开关关闭时注销：关闭时内容脚本也不加载语言包（见 content.ts），页面不执行词典脚本。
 * 安装、更新扩展时浏览器清空注册（Chromium、Firefox 都是），由后台的安装、更新事件与启动时的同步补回。
 * 没有 scripting API 时不处理，内容脚本动态导入
 */
import { browser } from 'wxt/browser'
import { GITHUB_ORIGINS } from './github'
import { pageLanguageEnvironment } from './language-env'
import { resolvePageLocale } from './locale'
import { LOCALE_SCRIPT_FILES } from './locale-loader'
import type { Settings } from './settings'

/** 注册的词典内容脚本 ID */
export const LOCALE_SCRIPT_ID = 'gcn-locale'

/** 注册时的脚本路径不带开头的 /；浏览器返回的路径可能带 */
function scriptPath(path: string): string {
  return path.replace(/^\//, '')
}

function sameList(a: readonly string[] | undefined, b: readonly string[]): boolean {
  return a !== undefined && a.length === b.length && a.every((value, i) => value === b[i])
}

/** 同一组站点，不计顺序与重复：Chromium 按字符串排序返回 */
function sameSet(a: readonly string[] | undefined, b: readonly string[]): boolean {
  if (a === undefined) return false
  const have = new Set(a)
  const want = new Set(b)
  return have.size === want.size && [...want].every(value => have.has(value))
}

/** 注册报 ID 已存在 */
function isDuplicateId(error: unknown): boolean {
  return error instanceof Error && error.message.includes('Duplicate script ID')
}

/** 按设置注册、更新或注销词典脚本；与已注册的相同时不改动 */
export async function syncLocaleScript(settings: Settings): Promise<void> {
  const scripting = browser.scripting
  if (typeof scripting?.registerContentScripts !== 'function') return
  const [current] = await scripting.getRegisteredContentScripts({ ids: [LOCALE_SCRIPT_ID] })
  if (!settings.enabled) {
    if (current) await scripting.unregisterContentScripts({ ids: [LOCALE_SCRIPT_ID] })
    return
  }
  const locale = resolvePageLocale(settings.language, await pageLanguageEnvironment())
  const js = [scriptPath(LOCALE_SCRIPT_FILES[locale])]
  const matches = [...GITHUB_ORIGINS]
  if (
    current &&
    current.runAt === 'document_start' &&
    // 已降为仅本次会话的注册改回持久；不返回该字段的浏览器按持久
    current.persistAcrossSessions !== false &&
    sameList(current.js?.map(scriptPath), js) &&
    sameSet(current.matches, matches)
  ) {
    return
  }
  const script = { id: LOCALE_SCRIPT_ID, matches, js, runAt: 'document_start' as const, persistAcrossSessions: true }
  if (current) {
    await scripting.updateContentScripts([script])
    return
  }
  try {
    await scripting.registerContentScripts([script])
  } catch (error) {
    // 浏览器启动初期持久注册还在加载：查询不到，注册却报 ID 已存在。按已注册处理，之后的同步再核对
    if (!isDuplicateId(error)) throw error
  }
}
