import { enableAutoUnmount, mount, type DOMWrapper, type VueWrapper } from '@vue/test-utils'
import { fakeBrowser } from 'wxt/testing/fake-browser'
import { clearToasts } from '../../../src/components/toast'
import type { LocaleBundle } from '../../../src/core/types'
import '../../../src/entrypoints/options/options.css'
import type { PageLocale } from '../../../src/shared/locale'
import { settingsItem } from '../../../src/shared/settings'
import { mockVersion, seedChineseUi, settle, ZH_SETTINGS } from './helpers'
import { importSfc, required } from './sfc'

const load = vi.hoisted(() => vi.fn<(locale: PageLocale) => Promise<LocaleBundle>>())
vi.mock('../../../src/entrypoints/options/locale-bundle', () => ({ loadLocaleBundle: load }))

const App = await importSfc(() => import('../../../src/entrypoints/options/App.vue'))

enableAutoUnmount(afterEach)

const CN: LocaleBundle = [
  ['common', { static: { Code: '代码', Issues: '议题' }, regexp: [[/^(\d+) stars?$/, '$1 个星标']] }],
  ['repository', { scoped: { Code: '仓库代码' } }]
]
const TW: LocaleBundle = [['common', { static: { Code: '程式碼' } }]]

/** 等待中的加载：resolve / reject 由用例控制 */
interface Deferred {
  resolve(bundle: LocaleBundle): void
  reject(error: Error): void
}

function deferLoads(): Map<PageLocale, Deferred> {
  const pending = new Map<PageLocale, Deferred>()
  load.mockImplementation(
    locale =>
      new Promise((resolve, reject) => {
        pending.set(locale, { resolve, reject })
      })
  )
  return pending
}

async function render(): Promise<VueWrapper> {
  const wrapper = mount(required(App), { attachTo: document.body })
  await settle()
  return wrapper
}

/** 观察接近视口的 IntersectionObserver：测试中手动触发 */
interface Observed {
  readonly callback: IntersectionObserverCallback
  readonly targets: Element[]
  disconnected: boolean
}

const observers: Observed[] = []

function stubObserver(): void {
  observers.length = 0
  vi.stubGlobal(
    'IntersectionObserver',
    class {
      private readonly record: Observed
      constructor(callback: IntersectionObserverCallback) {
        this.record = { callback, targets: [], disconnected: false }
        observers.push(this.record)
      }
      observe(target: Element): void {
        this.record.targets.push(target)
      }
      disconnect(): void {
        this.record.disconnected = true
      }
      unobserve(): void {}
      takeRecords(): IntersectionObserverEntry[] {
        return []
      }
    }
  )
}

function panel(wrapper: VueWrapper): DOMWrapper<Element> {
  return wrapper.get('[data-test="builtin-dictionary"]') as DOMWrapper<Element>
}

/** 内置词库接近视口 */
async function scrollNear(wrapper: VueWrapper): Promise<void> {
  const target = panel(wrapper).element
  for (const item of observers) {
    if (item.disconnected || !item.targets.includes(target)) continue
    item.callback([{ isIntersecting: true, target } as unknown as IntersectionObserverEntry], {} as IntersectionObserver)
  }
  await settle()
}

/** 标签：页面的标签页，或汉化设置里的词库标签 */
function tab(wrapper: VueWrapper, label: string): DOMWrapper<Element> {
  const found = wrapper.findAll('[role="tab"]').find(item => item.text() === label)
  if (!found) throw new Error(`未找到标签：${label}`)
  return found
}

/** 表格各行：原文、译文、范围 */
function rows(wrapper: VueWrapper): string[][] {
  return panel(wrapper)
    .findAll('tbody tr[data-index]')
    .map(row => row.findAll('td').map(cell => cell.text()))
}

function count(wrapper: VueWrapper): string | undefined {
  const found = panel(wrapper).find('[data-test="dictionary-count"]')
  return found.exists() ? found.text() : undefined
}

function empty(wrapper: VueWrapper): string | undefined {
  const found = panel(wrapper).find('[data-test="dictionary-empty"]')
  return found.exists() ? found.text() : undefined
}

async function search(wrapper: VueWrapper, query: string): Promise<void> {
  await panel(wrapper).get('input[type="search"]').setValue(query)
  await settle()
}

/** 选择翻译语言 */
async function chooseLocale(wrapper: VueWrapper, label: string): Promise<void> {
  const select = panel(wrapper).get('[data-test="dictionary-language"]')
  await select.trigger('click')
  const listbox = wrapper.get(`#${CSS.escape(select.attributes('aria-controls') ?? '')}`)
  const option = listbox.findAll('[role="option"]').find(item => item.text() === label)
  if (!option) throw new Error(`未找到选项：${label}`)
  await option.trigger('click')
  await settle()
}

describe.skipIf(!App)('设置页：内置词库', () => {
  beforeEach(async () => {
    fakeBrowser.reset()
    await seedChineseUi()
    mockVersion('1.2.3')
    load.mockReset()
    load.mockImplementation(async locale => (locale === 'zh-TW' ? TW : CN))
    stubObserver()
  })

  afterEach(() => {
    clearToasts()
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it('在汉化设置中，与自定义词库分两个标签（排在其后，默认显示自定义词库）；接近视口时才加载，之后不再观察；切换标签页不重新加载', async () => {
    const wrapper = await render()
    const section = panel(wrapper)
    const own = section.element.closest('[role="tabpanel"]')
    expect(own?.getAttribute('aria-labelledby')).toBe(tab(wrapper, '内置词库').attributes('id'))
    expect(own?.parentElement?.closest('[role="tabpanel"]')?.getAttribute('aria-labelledby')).toBe(
      tab(wrapper, '汉化设置').attributes('id')
    )
    expect(own?.previousElementSibling?.getAttribute('aria-labelledby')).toBe(tab(wrapper, '自定义词库').attributes('id'))
    expect(section.find('h2').exists()).toBe(false)
    expect(section.isVisible()).toBe(false)
    await tab(wrapper, '内置词库').trigger('click')
    await settle()
    expect(section.isVisible()).toBe(true)
    expect(load).not.toHaveBeenCalled()
    expect(empty(wrapper)).toBe('加载中')
    expect(observers.flatMap(item => item.targets)).toEqual([section.element])
    await scrollNear(wrapper)
    expect(load).toHaveBeenCalledExactlyOnceWith('zh-CN')
    expect(observers.every(item => item.disconnected)).toBe(true)
    await tab(wrapper, '加速设置').trigger('click')
    await tab(wrapper, '汉化设置').trigger('click')
    await settle()
    expect(load).toHaveBeenCalledOnce()
  })

  it('不支持 IntersectionObserver 时直接加载', async () => {
    vi.stubGlobal('IntersectionObserver', undefined)
    const wrapper = await render()
    expect(load).toHaveBeenCalledExactlyOnceWith('zh-CN')
    expect(count(wrapper)).toBe('4 条')
  })

  it('加载中：显示加载中，不显示条数', async () => {
    deferLoads()
    const wrapper = await render()
    await scrollNear(wrapper)
    expect(empty(wrapper)).toBe('加载中')
    expect(count(wrapper)).toBeUndefined()
  })

  it('加载后：表格列出原文、译文、范围（全局或页面类型），显示条数；工具栏为翻译语言、搜索；列表末尾有返回顶部', async () => {
    const wrapper = await render()
    await scrollNear(wrapper)
    const scope = panel(wrapper)
    expect(scope.findAll('th').map(item => item.text())).toEqual(['原文', '译文', '范围'])
    expect(rows(wrapper)).toEqual([
      ['Code', '代码', '全局'],
      ['Issues', '议题', '全局'],
      ['/^(\\d+) stars?$/', '$1 个星标', 'common'],
      ['Code', '仓库代码', 'repository']
    ])
    expect(count(wrapper)).toBe('4 条')
    expect(scope.get('table').attributes('aria-rowcount')).toBe('5')
    expect(scope.get('tr[data-index="0"]').attributes('aria-rowindex')).toBe('2')
    expect(scope.get('tr[data-index="0"] td').attributes('title')).toBe('Code')
    expect(scope.get('[data-test="dictionary-language"]').attributes('aria-label')).toBe('翻译语言')
    const input = scope.get('input[type="search"]')
    expect(input.attributes('aria-label')).toBe('搜索')
    expect(input.attributes('placeholder')).toBe('搜索')
    expect(scope.get('.list-frame > .ui-back-to-top [data-test="back-to-top"]').attributes('aria-label')).toBe('返回顶部')
  })

  it('默认为页面翻译语言：设置中选了繁体时加载繁体', async () => {
    await settingsItem.setValue({ ...ZH_SETTINGS, language: 'zh-TW' })
    const wrapper = await render()
    await scrollNear(wrapper)
    expect(load).toHaveBeenCalledExactlyOnceWith('zh-TW')
    expect(rows(wrapper)).toEqual([['Code', '程式碼', '全局']])
  })

  it('搜索：按原文、译文、页面类型筛选，多个词都要命中；条数随之变化；无结果显示未找到', async () => {
    const wrapper = await render()
    await scrollNear(wrapper)
    await search(wrapper, 'code')
    expect(rows(wrapper).map(row => row[1])).toEqual(['代码', '仓库代码'])
    expect(count(wrapper)).toBe('2 条')
    await search(wrapper, 'code repository')
    expect(rows(wrapper).map(row => row[1])).toEqual(['仓库代码'])
    await search(wrapper, 'Sample text')
    expect(rows(wrapper)).toEqual([])
    expect(empty(wrapper)).toBe('未找到')
    expect(count(wrapper)).toBe('0 条')
  })

  it('切换翻译语言：加载该语言，搜索词保留；同一语言只加载一次', async () => {
    const wrapper = await render()
    await scrollNear(wrapper)
    await search(wrapper, 'code')
    await chooseLocale(wrapper, '繁體中文')
    expect(load).toHaveBeenLastCalledWith('zh-TW')
    expect(rows(wrapper)).toEqual([['Code', '程式碼', '全局']])
    await chooseLocale(wrapper, '简体中文')
    expect(rows(wrapper).map(row => row[1])).toEqual(['代码', '仓库代码'])
    expect(load).toHaveBeenCalledTimes(2)
  })

  it('加载失败：显示加载失败与重试，点重试重新加载；再切回这个语言时也重新加载', async () => {
    load.mockImplementation(async locale => {
      if (locale === 'zh-CN') throw new Error('语言包加载失败：zh-CN')
      return TW
    })
    const wrapper = await render()
    await scrollNear(wrapper)
    expect(empty(wrapper)).toBe('加载失败')
    expect(count(wrapper)).toBeUndefined()
    expect(panel(wrapper).get('[data-test="dictionary-retry"]').text()).toBe('重试')
    await panel(wrapper).get('[data-test="dictionary-retry"]').trigger('click')
    await settle()
    expect(load.mock.calls.map(([locale]) => locale)).toEqual(['zh-CN', 'zh-CN'])
    expect(empty(wrapper)).toBe('加载失败')
    await chooseLocale(wrapper, '繁體中文')
    expect(panel(wrapper).find('[data-test="dictionary-retry"]').exists()).toBe(false)
    load.mockImplementation(async locale => (locale === 'zh-TW' ? TW : CN))
    await chooseLocale(wrapper, '简体中文')
    expect(load.mock.calls.map(([locale]) => locale)).toEqual(['zh-CN', 'zh-CN', 'zh-TW', 'zh-CN'])
    expect(rows(wrapper)).toHaveLength(4)
  })

  it('加载失败后点重试：加载成功时显示列表', async () => {
    load.mockRejectedValueOnce(new Error('语言包加载失败：zh-CN'))
    const wrapper = await render()
    await scrollNear(wrapper)
    await panel(wrapper).get('[data-test="dictionary-retry"]').trigger('click')
    await settle()
    expect(rows(wrapper)).toHaveLength(4)
    expect(count(wrapper)).toBe('4 条')
  })

  it('切换语言后，上一个语言迟到的结果不显示', async () => {
    const pending = deferLoads()
    const wrapper = await render()
    await scrollNear(wrapper)
    await chooseLocale(wrapper, '繁體中文')
    pending.get('zh-TW')?.resolve(TW)
    await settle()
    pending.get('zh-CN')?.resolve(CN)
    await settle()
    expect(rows(wrapper)).toEqual([['Code', '程式碼', '全局']])
  })

  it('词条多时只渲染可视范围内的行，其余用占位撑开', async () => {
    const many: LocaleBundle = [
      ['common', { static: Object.fromEntries(Array.from({ length: 500 }, (_, index) => [`Sample text ${index}`, `示例文字 ${index}`])) }]
    ]
    load.mockResolvedValue(many)
    const wrapper = await render()
    await scrollNear(wrapper)
    const rendered = panel(wrapper).findAll('tbody tr[data-index]')
    expect(rendered.length).toBeGreaterThan(0)
    expect(rendered.length).toBeLessThan(100)
    expect(panel(wrapper).get('table').attributes('aria-rowcount')).toBe('501')
    expect(panel(wrapper).find('tbody tr.dictionary-gap').exists()).toBe(true)
    expect(count(wrapper)).toBe('500 条')
  })
})
