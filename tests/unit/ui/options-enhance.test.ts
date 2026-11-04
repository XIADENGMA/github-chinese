import { enableAutoUnmount, mount, type DOMWrapper, type VueWrapper } from '@vue/test-utils'
import { fakeBrowser } from 'wxt/testing/fake-browser'
import { clearToasts } from '../../../src/components/toast'
import '../../../src/entrypoints/options/options.css'
import { getSettings, settingsItem } from '../../../src/shared/settings'
import { mockVersion, seedChineseUi, settle, ZH_SETTINGS } from './helpers'
import { importSfc, required } from './sfc'

const App = await importSfc(() => import('../../../src/entrypoints/options/App.vue'))

enableAutoUnmount(afterEach)

/** 范围开关，按显示顺序 */
const SCOPE_LABELS = ['站外链接', '正文链接', '搜索结果', '议题与拉取请求', '通知', '首页', '个人与组织主页', '探索']

/** 打开设置页并切到增强设置标签页 */
async function render(): Promise<VueWrapper> {
  const wrapper = mount(required(App), { attachTo: document.body })
  await settle()
  await tab(wrapper).trigger('click')
  await settle()
  return wrapper
}

function tab(wrapper: VueWrapper): DOMWrapper<Element> {
  const found = wrapper.findAll('[role="tab"]').find(item => item.text() === '增强设置')
  if (!found) throw new Error('未找到标签：增强设置')
  return found
}

function panel(wrapper: VueWrapper): DOMWrapper<Element> {
  return wrapper.get(`#${CSS.escape(tab(wrapper).attributes('aria-controls') ?? '')}`) as DOMWrapper<Element>
}

/** 新标签页打开的分区 */
function newTabSection(wrapper: VueWrapper): DOMWrapper<Element> {
  return panel(wrapper).get('section[aria-labelledby="new-tab-title"]') as DOMWrapper<Element>
}

function switchOf(scope: DOMWrapper<Element>, label: string): DOMWrapper<HTMLButtonElement> {
  const labelEl = scope.findAll('label').find(item => item.text() === label)
  if (!labelEl) throw new Error(`未找到开关：${label}`)
  return scope.get(`#${CSS.escape(labelEl.attributes('for') ?? '')}`) as DOMWrapper<HTMLButtonElement>
}

function switchLabels(scope: DOMWrapper<Element>): string[] {
  return scope.findAll('label').map(item => item.text())
}

function toastTexts(wrapper: VueWrapper): string[] {
  return wrapper
    .get('[aria-live="polite"]')
    .findAll('.ui-toast')
    .map(toast => toast.text())
}

function pathRows(wrapper: VueWrapper): string[] {
  return newTabSection(wrapper)
    .findAll<HTMLInputElement>('tbody input')
    .map(input => input.element.value)
}

async function addPath(wrapper: VueWrapper, value: string): Promise<void> {
  const scope = newTabSection(wrapper)
  await scope.get('form input').setValue(value)
  await scope.get('form').trigger('submit')
  await settle()
}

describe.skipIf(!App)('设置页：增强', () => {
  beforeEach(async () => {
    fakeBrowser.reset()
    await seedChineseUi()
    mockVersion('1.2.3')
  })

  afterEach(() => {
    delete document.documentElement.dataset.theme
    clearToasts()
    vi.restoreAllMocks()
  })

  it('自动加载、图片预览两个开关，下方是新标签页打开：启用、各范围、自定义页面', async () => {
    const wrapper = await render()
    expect(
      panel(wrapper)
        .findAll('h2')
        .map(item => item.text())
    ).toEqual(['新标签页打开'])
    const top = panel(wrapper).get('.enhance > .switches') as DOMWrapper<Element>
    expect(switchLabels(top)).toEqual(['自动加载', '图片预览'])
    expect(switchLabels(newTabSection(wrapper))).toEqual(['启用', ...SCOPE_LABELS])
    const input = newTabSection(wrapper).get('form input')
    expect(input.attributes('aria-label')).toBe('自定义页面')
    expect(input.attributes('placeholder')).toBe('/*/*/releases')
    expect(newTabSection(wrapper).get('[data-test="list-empty"]').text()).toBe('暂无路径')
  })

  it('默认都关闭；范围不可用，默认选中站外链接、搜索结果', async () => {
    const wrapper = await render()
    for (const label of ['自动加载', '图片预览']) {
      expect(switchOf(panel(wrapper), label).attributes('aria-checked')).toBe('false')
    }
    expect(switchOf(newTabSection(wrapper), '启用').attributes('aria-checked')).toBe('false')
    for (const label of SCOPE_LABELS) {
      const control = switchOf(newTabSection(wrapper), label)
      expect(control.element.disabled, label).toBe(true)
      expect(control.attributes('aria-checked'), label).toBe(String(label === '站外链接' || label === '搜索结果'))
    }
  })

  it('开关立即保存', async () => {
    const wrapper = await render()
    await switchOf(panel(wrapper), '自动加载').trigger('click')
    await switchOf(panel(wrapper), '图片预览').trigger('click')
    await switchOf(newTabSection(wrapper), '启用').trigger('click')
    await settle()
    expect(await getSettings()).toMatchObject({ autoLoad: true, imagePreview: true, newTab: true })
    expect(switchOf(newTabSection(wrapper), '议题与拉取请求').element.disabled).toBe(false)
  })

  it('范围：连续开关几项都保存，按固定顺序', async () => {
    await settingsItem.setValue({ ...ZH_SETTINGS, newTab: true })
    const wrapper = await render()
    const scope = newTabSection(wrapper)
    await switchOf(scope, '探索').trigger('click')
    await switchOf(scope, '站外链接').trigger('click')
    await switchOf(scope, '正文链接').trigger('click')
    await settle()
    expect((await getSettings()).newTabScopes).toEqual(['content', 'search', 'explore'])
    expect(switchOf(scope, '站外链接').attributes('aria-checked')).toBe('false')
    expect(switchOf(scope, '探索').attributes('aria-checked')).toBe('true')
  })

  it('自定义页面：去掉首尾空白后保存，不以 / 开头的不保存', async () => {
    const wrapper = await render()
    await addPath(wrapper, ' /*/*/releases ')
    await addPath(wrapper, '/orgs/*/repositories')
    expect((await getSettings()).newTabPaths).toEqual(['/*/*/releases', '/orgs/*/repositories'])
    expect(pathRows(wrapper)).toEqual(['/orgs/*/repositories', '/*/*/releases'])
    await addPath(wrapper, 'vuejs/core')
    expect((await getSettings()).newTabPaths).toEqual(['/*/*/releases', '/orgs/*/repositories'])
  })

  it('保存失败：提示', async () => {
    const wrapper = await render()
    vi.spyOn(fakeBrowser.storage.sync, 'set').mockRejectedValue(new Error('配额'))
    await switchOf(panel(wrapper), '自动加载').trigger('click')
    await settle()
    expect(toastTexts(wrapper)).toEqual(['保存失败'])
  })
})
