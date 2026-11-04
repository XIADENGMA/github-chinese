// @vitest-environment-options { "url": "https://github.com/vuejs/core/issues" }
import { fakeBrowser } from 'wxt/testing/fake-browser'
import type { LocaleBundle } from '../../../src/core/types'
import { languageEnvironment, pageLanguageEnvironment } from '../../../src/shared/language-env'
import type { PageLocale } from '../../../src/shared/locale'
import { LOCALE_SCRIPT_FILES, registerLocale, takeLocale } from '../../../src/shared/locale-loader'
import { syncLocaleScript } from '../../../src/shared/locale-script'
import { DEFAULT_SETTINGS } from '../../../src/shared/settings'
import { fakeContentScripts } from './fake-scripting'

/** 模拟页面上的 navigator.languages（隐身窗口等处会被缩减） */
function stubLanguages(languages: readonly string[]): void {
  vi.spyOn(navigator, 'languages', 'get').mockReturnValue(languages)
}

beforeEach(() => {
  fakeBrowser.reset()
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('pageLanguageEnvironment', () => {
  it('浏览器语言列表取自 i18n.getAcceptLanguages；界面语言、时区照常读取', async () => {
    vi.spyOn(fakeBrowser.i18n, 'getAcceptLanguages').mockResolvedValue(['en-US', 'zh-TW'] as never)
    vi.spyOn(fakeBrowser.i18n, 'getUILanguage').mockReturnValue('en-US')
    stubLanguages(['en-US', 'en'])
    expect(await pageLanguageEnvironment()).toEqual({
      languages: ['en-US', 'zh-TW'],
      uiLanguage: 'en-US',
      timeZone: languageEnvironment().timeZone
    })
  })

  it.each<[string, () => Promise<unknown>]>([
    ['不支持', async () => Promise.reject(new Error('不支持'))],
    ['为空', async () => []],
    ['格式不符', async () => 'zh-TW']
  ])('getAcceptLanguages %s：退回 navigator.languages', async (_name, implementation) => {
    vi.spyOn(fakeBrowser.i18n, 'getAcceptLanguages').mockImplementation(implementation as never)
    stubLanguages(['zh-HK'])
    expect((await pageLanguageEnvironment()).languages).toEqual(['zh-HK'])
  })

  it('同步抛错（测试环境未实现）：退回 navigator.languages', async () => {
    stubLanguages(['zh-HK'])
    expect((await pageLanguageEnvironment()).languages).toEqual(['zh-HK'])
  })

  it('丢弃不是字符串的项', async () => {
    vi.spyOn(fakeBrowser.i18n, 'getAcceptLanguages').mockResolvedValue(['zh-TW', 1, ''] as never)
    expect((await pageLanguageEnvironment()).languages).toEqual(['zh-TW'])
  })
})

describe('后台注册的词典与内容脚本取用的语言一致', () => {
  const BUNDLES: Readonly<Record<PageLocale, LocaleBundle>> = {
    'zh-CN': [['common', { static: { Issues: '议题' } }]],
    'zh-TW': [['common', { static: { Issues: '議題' } }]]
  }

  /** 内容脚本的运行上下文（只实现 content.ts 用到的部分） */
  function createContext(): { readonly isInvalid: boolean; readonly isValid: boolean; invalidate(): void } {
    let invalid = false
    const cleanups: (() => void)[] = []
    return {
      get isInvalid() {
        return invalid
      },
      get isValid() {
        return !invalid
      },
      onInvalidated(callback: () => void) {
        cleanups.push(callback)
        return () => undefined
      },
      addEventListener(target: EventTarget, type: string, handler: EventListener) {
        target.addEventListener(type, handler)
        cleanups.push(() => target.removeEventListener(type, handler))
      },
      setInterval: () => 0,
      invalidate() {
        invalid = true
        for (const cleanup of cleanups) cleanup()
      }
    } as never
  }

  afterEach(() => {
    takeLocale('zh-CN')
    takeLocale('zh-TW')
    document.body.innerHTML = ''
  })

  it.each<[string, string[] | undefined, readonly string[], PageLocale]>([
    ['隐身窗口（navigator.languages 被缩减）', ['en-US', 'zh-TW'], ['en-US', 'en'], 'zh-TW'],
    ['读不到语言偏好：两边都按 navigator.languages', undefined, ['zh-HK', 'en'], 'zh-TW']
  ])('%s：内容脚本直接取用注册脚本登记的语言包，不动态导入', async (_name, accepted, languages, expected) => {
    const scripts = fakeContentScripts()
    if (accepted) vi.spyOn(fakeBrowser.i18n, 'getAcceptLanguages').mockResolvedValue(accepted as never)
    stubLanguages(languages)
    await syncLocaleScript(DEFAULT_SETTINGS)
    const [file] = scripts.registered[0]?.js ?? []
    const locale = (Object.keys(LOCALE_SCRIPT_FILES) as PageLocale[]).find(key => LOCALE_SCRIPT_FILES[key] === `/${file}`)
    expect(locale).toBe(expected)
    // 注册的词典脚本在页面开始解析前执行，登记语言包
    registerLocale(locale!, BUNDLES[locale!])

    document.body.innerHTML = '<p>Issues</p>'
    const getURL = vi.spyOn(fakeBrowser.runtime, 'getURL')
    const sendMessage = vi.spyOn(fakeBrowser.runtime, 'sendMessage')
    vi.resetModules()
    const { default: content } = await import('../../../src/entrypoints/content')
    const context = createContext()
    try {
      await content.main(context as never)
      expect(document.querySelector('p')?.textContent).toBe(BUNDLES[expected][0]![1].static!.Issues)
      expect(getURL).not.toHaveBeenCalled()
      expect(sendMessage).not.toHaveBeenCalledWith(expect.objectContaining({ type: 'gcn:inject-locale' }))
    } finally {
      context.invalidate()
    }
  })
})
