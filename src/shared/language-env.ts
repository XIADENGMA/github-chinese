import { browser } from 'wxt/browser'
import type { LanguageEnvironment } from './locale'

function readUiLanguage(): string | undefined {
  try {
    return browser.i18n.getUILanguage() || undefined
  } catch {
    // 不支持 i18n 的环境（测试等）按语言列表判断
    return undefined
  }
}

function readTimeZone(): string | undefined {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || undefined
  } catch {
    return undefined
  }
}

/** 当前环境的浏览器语言、界面语言与时区；读不到的项省略 */
export function languageEnvironment(): LanguageEnvironment {
  const nav = globalThis.navigator as Navigator | undefined
  const languages = nav?.languages?.length ? [...nav.languages] : nav?.language ? [nav.language] : []
  return { languages, uiLanguage: readUiLanguage(), timeZone: readTimeZone() }
}

/** 浏览器的语言偏好列表（i18n.getAcceptLanguages）；读不到或为空时返回 undefined */
async function readAcceptLanguages(): Promise<string[] | undefined> {
  try {
    const languages: unknown = await browser.i18n.getAcceptLanguages()
    if (!Array.isArray(languages)) return undefined
    const tags = languages.filter((tag): tag is string => typeof tag === 'string' && tag !== '')
    return tags.length > 0 ? tags : undefined
  } catch {
    // 不支持的环境（测试等）
    return undefined
  }
}

/**
 * 页面翻译语言的识别环境，后台注册词典与内容脚本解析语言共用：浏览器语言列表取自 i18n.getAcceptLanguages()。
 * 隐身窗口、Brave 防护下页面的 navigator.languages 会被缩减，与后台读到的不同；getAcceptLanguages 两边读同一份偏好。
 * 读不到时退回 navigator.languages。界面语言、徽标、弹出页、设置页用同步的 languageEnvironment()
 */
export async function pageLanguageEnvironment(): Promise<LanguageEnvironment> {
  const accepted = await readAcceptLanguages()
  const env = languageEnvironment()
  return accepted ? { ...env, languages: accepted } : env
}
