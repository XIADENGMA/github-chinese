import { fakeBrowser } from 'wxt/testing/fake-browser'
import type { LocaleBundle } from '../../../src/core/types'
import { loadLocaleBundle } from '../../../src/entrypoints/options/locale-bundle'
import type { PageLocale } from '../../../src/shared/locale'
import { registerLocale, takeLocale } from '../../../src/shared/locale-loader'

const CN: LocaleBundle = [['common', { static: { Code: '代码' } }]]
/** 设置页的地址（扩展的固定地址） */
const PAGE = 'chrome-extension://abcdefghijklmnopabcdefghijklmnop/options.html'

/** 模拟的 script 元素：记录地址与是否移除 */
interface FakeScript extends EventTarget {
  src: string
  removed: boolean
  remove(): void
}

/** 只实现 createElement('script') 与 head.append 的文档：插入 script 时调用 onAppend */
function fakeDocument(onAppend: (script: FakeScript) => void): { doc: Document; scripts: FakeScript[] } {
  const scripts: FakeScript[] = []
  const doc = {
    baseURI: PAGE,
    createElement: () => {
      const script = Object.assign(new EventTarget(), {
        src: '',
        removed: false,
        remove() {
          script.removed = true
        }
      })
      scripts.push(script)
      return script
    },
    head: { append: (script: FakeScript) => onAppend(script) }
  }
  return { doc: doc as unknown as Document, scripts }
}

describe('设置页加载词典脚本', () => {
  beforeEach(() => {
    fakeBrowser.reset()
  })

  afterEach(() => {
    takeLocale('zh-CN')
    takeLocale('zh-TW')
  })

  it.each([
    ['zh-CN', '/locale-zh-cn.js'],
    ['zh-TW', '/locale-zh-tw.js']
  ] as const)('%s：插入扩展自带的词典脚本，执行后取走登记的语言包，移除 script', async (locale: PageLocale, file) => {
    const { doc, scripts } = fakeDocument(script => {
      registerLocale(locale, CN)
      script.dispatchEvent(new Event('load'))
    })
    await expect(loadLocaleBundle(locale, doc)).resolves.toBe(CN)
    expect(scripts).toHaveLength(1)
    expect(scripts[0]!.src).toBe(`chrome-extension://abcdefghijklmnopabcdefghijklmnop${file}`)
    expect(scripts[0]!.removed).toBe(true)
  })

  it('地址按设置页自身的地址解析，不用 runtime.getURL（Chrome 返回会话随机地址，设置页 CSP 拦截）', async () => {
    const getURL = vi
      .spyOn(fakeBrowser.runtime, 'getURL')
      .mockReturnValue('chrome-extension://a799739a-280a-4862-ad5e-ae5b08162243/locale-zh-cn.js')
    const { doc, scripts } = fakeDocument(script => {
      registerLocale('zh-CN', CN)
      script.dispatchEvent(new Event('load'))
    })
    await loadLocaleBundle('zh-CN', doc)
    expect(new URL(scripts[0]!.src).host).toBe(new URL(PAGE).host)
    expect(getURL).not.toHaveBeenCalled()
  })

  it('执行后没有登记：失败', async () => {
    const { doc, scripts } = fakeDocument(script => script.dispatchEvent(new Event('load')))
    await expect(loadLocaleBundle('zh-CN', doc)).rejects.toThrow('语言包加载失败：zh-CN')
    expect(scripts[0]!.removed).toBe(true)
  })

  it('脚本加载失败：失败，移除 script', async () => {
    const { doc, scripts } = fakeDocument(script => script.dispatchEvent(new Event('error')))
    await expect(loadLocaleBundle('zh-TW', doc)).rejects.toThrow('语言包加载失败：zh-TW')
    expect(scripts[0]!.removed).toBe(true)
  })
})
