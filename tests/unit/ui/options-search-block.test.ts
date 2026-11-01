import { enableAutoUnmount, mount, type DOMWrapper, type VueWrapper } from '@vue/test-utils'
import { fakeBrowser } from 'wxt/testing/fake-browser'
import { clearToasts } from '../../../src/components/toast'
import '../../../src/entrypoints/options/options.css'
import { getSearchBlockRules, getSettings, searchBlockRulesItem, settingsItem } from '../../../src/shared/settings'
import { mockVersion, seedChineseUi, settle, ZH_SETTINGS } from './helpers'
import { importSfc, required } from './sfc'

const App = await importSfc(() => import('../../../src/entrypoints/options/App.vue'))

enableAutoUnmount(afterEach)

const PLACEHOLDER = '@octocat · octocat/hello-world · hello world'

/** 打开设置页并切到净化设置标签页 */
async function render(): Promise<VueWrapper> {
  const wrapper = mount(required(App), { attachTo: document.body })
  await settle()
  await tab(wrapper).trigger('click')
  await settle()
  return wrapper
}

function tab(wrapper: VueWrapper): DOMWrapper<Element> {
  const found = wrapper.findAll('[role="tab"]').find((item) => item.text() === '净化设置')
  if (!found) throw new Error('未找到标签：净化设置')
  return found
}

/** 净化设置标签页的面板 */
function section(wrapper: VueWrapper): DOMWrapper<Element> {
  return wrapper.get(`#${CSS.escape(tab(wrapper).attributes('aria-controls') ?? '')}`) as DOMWrapper<Element>
}

function toggle(wrapper: VueWrapper): DOMWrapper<HTMLButtonElement> {
  return section(wrapper).get('[role="switch"]') as DOMWrapper<HTMLButtonElement>
}

function addInput(wrapper: VueWrapper): DOMWrapper<HTMLInputElement> {
  return section(wrapper).get('form input') as DOMWrapper<HTMLInputElement>
}

/** 列表各行的规则，新添加的在前 */
function rules(wrapper: VueWrapper): string[] {
  return section(wrapper)
    .findAll<HTMLInputElement>('tbody input')
    .map((input) => input.element.value)
}

async function addRule(wrapper: VueWrapper, value: string): Promise<void> {
  await addInput(wrapper).setValue(value)
  await section(wrapper).get('form').trigger('submit')
  await settle()
}

/** 页面顶部的提示文字 */
function toastTexts(wrapper: VueWrapper): string[] {
  return wrapper
    .get('[aria-live="polite"]')
    .findAll('.ui-toast')
    .map((toast) => toast.text())
}

describe.skipIf(!App)('设置页：净化设置', () => {
  beforeEach(async () => {
    fakeBrowser.reset()
    await seedChineseUi()
    mockVersion('1.2.3')
  })

  afterEach(() => {
    clearToasts()
    vi.restoreAllMocks()
  })

  it('净化搜索开关在前，其下为屏蔽规则的添加框与列表；开关默认开启；空时显示暂无规则', async () => {
    const wrapper = await render()
    const found = section(wrapper)
    expect(tab(wrapper).attributes('aria-selected')).toBe('true')
    expect((found.element as HTMLElement).style.display).not.toBe('none')
    expect(found.attributes('aria-labelledby')).toBe(tab(wrapper).attributes('id'))
    expect(found.find('h2').exists()).toBe(false)
    expect(found.find('textarea').exists()).toBe(false)
    expect(found.get('.ui-switch-label').text()).toBe('净化搜索')
    expect(toggle(wrapper).attributes('aria-checked')).toBe('true')
    const switches = found.get('.switches').element
    expect(switches.compareDocumentPosition(found.get('form').element) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(addInput(wrapper).attributes('aria-label')).toBe('屏蔽规则')
    expect(addInput(wrapper).attributes('placeholder')).toBe(PLACEHOLDER)
    expect(found.get('[data-test="list-empty"]').text()).toBe('暂无规则')
  })

  it('开关即时保存；反映已保存的设置', async () => {
    const wrapper = await render()
    await toggle(wrapper).trigger('click')
    await settle()
    expect((await getSettings()).purifySearch).toBe(false)
    expect(toggle(wrapper).attributes('aria-checked')).toBe('false')
    wrapper.unmount()

    const again = await render()
    expect(toggle(again).attributes('aria-checked')).toBe('false')
  })

  it('开关保存失败：在页面顶部提示，开关不变', async () => {
    const wrapper = await render()
    vi.spyOn(fakeBrowser.storage.sync, 'set').mockRejectedValue(new Error('配额'))
    await toggle(wrapper).trigger('click')
    await settle()
    expect(toastTexts(wrapper)).toEqual(['保存失败'])
    expect(toggle(wrapper).attributes('aria-checked')).toBe('true')
  })

  it('显示已保存的规则，新添加的在前；列名与行内输入框以「屏蔽规则」为名', async () => {
    await searchBlockRulesItem.setValue(['@octocat', 'vuejs/core'])
    const wrapper = await render()
    expect(rules(wrapper)).toEqual(['vuejs/core', '@octocat'])
    expect(
      section(wrapper)
        .findAll('th')
        .map((item) => item.text()),
    ).toEqual(['屏蔽规则', '操作'])
    expect(
      section(wrapper)
        .findAll('tbody input')
        .map((input) => input.attributes('aria-label')),
    ).toEqual(['屏蔽规则', '屏蔽规则'])
  })

  it('添加：GitHub 地址换成所有者、存储库的写法，即时保存并通知已打开的页面；清空添加框', async () => {
    const send = vi.spyOn(fakeBrowser.runtime, 'sendMessage').mockResolvedValue(undefined as never)
    const wrapper = await render()
    await addRule(wrapper, ' @octocat ')
    await addRule(wrapper, 'https://github.com/vuejs/core/issues')
    await addRule(wrapper, 'Sample text')
    expect(await getSearchBlockRules()).toEqual(['@octocat', 'vuejs/core', 'Sample text'])
    expect(rules(wrapper)).toEqual(['Sample text', 'vuejs/core', '@octocat'])
    expect(addInput(wrapper).element.value).toBe('')
    expect(document.activeElement).toBe(addInput(wrapper).element)
    expect(toastTexts(wrapper)).toEqual([])
    expect(send).toHaveBeenCalledWith({ type: 'gcn:search-rules-saved' })
  })

  it.each([
    ['格式错误', '@-x', '格式错误'],
    ['已存在：不区分大小写', '@OctoCat', '已存在'],
    ['已存在：地址与简写相同', 'https://github.com/octocat', '已存在'],
    ['已存在：关键词引号可有可无', '"Sample TEXT"', '已存在'],
  ])('添加失败（%s）：提示，不保存，添加框保留', async (_name, value, message) => {
    await searchBlockRulesItem.setValue(['@octocat', 'Sample text'])
    const wrapper = await render()
    await addRule(wrapper, value)
    expect(toastTexts(wrapper)).toEqual([message])
    expect(await getSearchBlockRules()).toEqual(['@octocat', 'Sample text'])
    expect(addInput(wrapper).element.value).toBe(value)
  })

  it('行内改写：规范化后保存；与其他规则重复时恢复原值并提示；只改大小写可以', async () => {
    await searchBlockRulesItem.setValue(['@octocat', 'vuejs/core'])
    const wrapper = await render()
    const input = section(wrapper).get<HTMLInputElement>('tbody input')
    expect(input.element.value).toBe('vuejs/core')

    await input.setValue('https://github.com/vuejs/router')
    await settle()
    expect(input.element.value).toBe('vuejs/router')
    expect(await getSearchBlockRules()).toEqual(['@octocat', 'vuejs/router'])

    await input.setValue('@OctoCat')
    await settle()
    expect(input.element.value).toBe('vuejs/router')
    expect(toastTexts(wrapper)).toEqual(['已存在'])

    await input.setValue('Vuejs/Router')
    await settle()
    expect(await getSearchBlockRules()).toEqual(['@octocat', 'Vuejs/Router'])
    expect(toastTexts(wrapper)).toEqual([])
  })

  it('删除：即时保存并通知已打开的页面；删空时显示暂无规则', async () => {
    await searchBlockRulesItem.setValue(['@octocat'])
    const send = vi.spyOn(fakeBrowser.runtime, 'sendMessage').mockResolvedValue(undefined as never)
    const wrapper = await render()
    await section(wrapper).get('button[aria-label="删除 @octocat"]').trigger('click')
    await settle()
    expect(await getSearchBlockRules()).toEqual([])
    expect(section(wrapper).get('[data-test="list-empty"]').text()).toBe('暂无规则')
    expect(send).toHaveBeenCalledWith({ type: 'gcn:search-rules-saved' })
  })

  it('保存失败：提示保存失败，不通知页面；添加框保留输入', async () => {
    const send = vi.spyOn(fakeBrowser.runtime, 'sendMessage').mockResolvedValue(undefined as never)
    const wrapper = await render()
    vi.spyOn(fakeBrowser.storage.local, 'set').mockRejectedValue(new Error('配额'))
    await addRule(wrapper, '@octocat')
    expect(toastTexts(wrapper)).toEqual(['保存失败'])
    expect(addInput(wrapper).element.value).toBe('@octocat')
    expect(rules(wrapper)).toEqual([])
    expect(send).not.toHaveBeenCalledWith({ type: 'gcn:search-rules-saved' })
  })

  it('跟随存储变化（另一个设置页修改了规则）', async () => {
    const wrapper = await render()
    await searchBlockRulesItem.setValue(['@hubot'])
    await settle()
    expect(rules(wrapper)).toEqual(['@hubot'])
  })

  it('读取规则失败：列表处显示加载失败，不提示；之后收到规则时显示', async () => {
    await settingsItem.setValue(ZH_SETTINGS)
    vi.spyOn(fakeBrowser.storage.local, 'get').mockRejectedValue(new Error('存储不可用'))
    const wrapper = await render()
    expect(section(wrapper).get('[data-test="list-empty"]').text()).toBe('加载失败')
    expect(toastTexts(wrapper)).toEqual([])
    vi.restoreAllMocks()
    await searchBlockRulesItem.setValue(['@hubot'])
    await settle()
    expect(rules(wrapper)).toEqual(['@hubot'])
  })

  it('列表框限高、框内滚动；表头固定在顶部', async () => {
    await searchBlockRulesItem.setValue(['@octocat'])
    const wrapper = await render()
    const table = section(wrapper).get('table').element
    const frame = getComputedStyle(table.parentElement!)
    expect(frame.maxHeight).toMatch(/^min\(480px, /)
    expect(frame.overflowY).toBe('auto')
    expect(getComputedStyle(table.querySelector('th')!).position).toBe('sticky')
  })
})
