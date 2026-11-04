import type { LocaleBundle } from '../../core/types'
import type { PageLocale } from '../../shared/locale'
import { LOCALE_SCRIPT_FILES, takeLocale } from '../../shared/locale-loader'

/**
 * 设置页加载词典脚本（浏览内置词库用）：插入 script 执行扩展自带的词典脚本，执行后取走登记的语言包（见 shared/locale-loader）。
 * 地址按设置页自身的地址解析，不用 runtime.getURL：Chrome 对开了 use_dynamic_url 的 web_accessible_resources 返回会话随机地址，
 * 不在设置页 CSP 的 'self' 之内，脚本被拦截。
 * 不用 import()：Firefox 的代码检查把参数不是字面量的 import() 报为不安全调用
 */
export function loadLocaleBundle(locale: PageLocale, doc: Document = document): Promise<LocaleBundle> {
  return new Promise((resolve, reject) => {
    const script = doc.createElement('script')
    script.src = new URL(LOCALE_SCRIPT_FILES[locale], doc.baseURI).href
    script.addEventListener('load', () => {
      script.remove()
      const bundle = takeLocale(locale)
      if (bundle) resolve(bundle)
      else reject(new Error(`语言包加载失败：${locale}`))
    })
    script.addEventListener('error', () => {
      script.remove()
      reject(new Error(`语言包加载失败：${locale}`))
    })
    doc.head.append(script)
  })
}
