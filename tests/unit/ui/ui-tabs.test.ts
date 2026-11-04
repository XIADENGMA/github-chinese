import { enableAutoUnmount, mount, type VueWrapper } from '@vue/test-utils'
import { defineComponent, h, nextTick, ref } from 'vue'
import type { UiTab } from '../../../src/components/ui/types'
import { importSfc, required } from './sfc'

const UiTabs = await importSfc(() => import('../../../src/components/ui/UiTabs.vue'))

enableAutoUnmount(afterEach)

const TABS: readonly UiTab[] = [
  { value: 'excluded', label: '排除路径' },
  { value: 'entries', label: '自定义词条' },
  { value: 'search', label: '屏蔽规则' }
]

/** 各标签的位置与宽度（px）：测试环境不排版，按标签文字给出 */
const BOXES: Record<string, { left: number; width: number }> = {
  排除路径: { left: 0, width: 72 },
  自定义词条: { left: 80, width: 86 },
  屏蔽规则: { left: 174, width: 72 }
}

function stubLayout(boxes = BOXES): void {
  const box = (element: HTMLElement): { left: number; width: number } | undefined =>
    element.getAttribute('role') === 'tab' ? boxes[element.textContent?.trim() ?? ''] : undefined
  vi.spyOn(HTMLElement.prototype, 'offsetLeft', 'get').mockImplementation(function (this: HTMLElement) {
    return box(this)?.left ?? 0
  })
  vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockImplementation(function (this: HTMLElement) {
    return box(this)?.width ?? 0
  })
}

/** 带 v-model 的页面：切换由父组件采纳 */
function mountPage(initial = 'excluded', tabs: readonly UiTab[] = TABS): VueWrapper {
  const component = required(UiTabs)
  const Page = defineComponent({
    setup() {
      const value = ref(initial)
      return () =>
        h(
          component,
          {
            modelValue: value.value,
            'onUpdate:modelValue': (next: string) => (value.value = next),
            tabs,
            label: '规则'
          },
          {
            excluded: () => h('textarea', { 'aria-label': '排除路径' }),
            entries: () => h('input', { 'aria-label': '原文' }),
            search: () => h('button', { type: 'button' }, '保存')
          }
        )
    }
  })
  return mount(Page, { attachTo: document.body })
}

function tabs(wrapper: VueWrapper): HTMLElement[] {
  return wrapper.findAll<HTMLElement>('[role="tab"]').map(item => item.element)
}

function selected(wrapper: VueWrapper): string[] {
  return tabs(wrapper)
    .filter(tab => tab.getAttribute('aria-selected') === 'true')
    .map(tab => tab.textContent?.trim() ?? '')
}

/** 显示中的面板对应的标签文字 */
function visiblePanels(wrapper: VueWrapper): string[] {
  return wrapper
    .findAll<HTMLElement>('[role="tabpanel"]')
    .filter(panel => panel.element.style.display !== 'none')
    .map(panel => document.getElementById(panel.attributes('aria-labelledby') ?? '')?.textContent?.trim() ?? '')
}

function indicator(wrapper: VueWrapper): HTMLElement {
  return wrapper.get<HTMLElement>('[data-test="tabs-indicator"]').element
}

async function press(wrapper: VueWrapper, key: string): Promise<void> {
  const target = document.activeElement as HTMLElement
  target.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }))
  await nextTick()
  await nextTick()
}

describe.skipIf(!UiTabs)('UiTabs', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it('标签栏带名称；标签与面板互相关联；只有选中的标签在 Tab 顺序里', () => {
    const wrapper = mountPage('entries')
    const list = wrapper.get('[role="tablist"]')
    expect(list.attributes('aria-label')).toBe('规则')
    expect(tabs(wrapper).map(tab => tab.textContent?.trim())).toEqual(['排除路径', '自定义词条', '屏蔽规则'])
    expect(tabs(wrapper).map(tab => tab.getAttribute('aria-selected'))).toEqual(['false', 'true', 'false'])
    expect(tabs(wrapper).map(tab => tab.tabIndex)).toEqual([-1, 0, -1])
    for (const tab of tabs(wrapper)) {
      expect(tab.getAttribute('type')).toBe('button')
      const panel = document.getElementById(tab.getAttribute('aria-controls') ?? '')
      expect(panel?.getAttribute('role')).toBe('tabpanel')
      expect(panel?.getAttribute('aria-labelledby')).toBe(tab.id)
    }
  })

  it('只显示选中标签的面板；其余面板隐藏但不卸载', () => {
    const wrapper = mountPage('entries')
    expect(visiblePanels(wrapper)).toEqual(['自定义词条'])
    expect(wrapper.find('textarea').exists()).toBe(true)
    expect(wrapper.find('[role="tabpanel"] button').exists()).toBe(true)
  })

  it('点击标签切换；面板内容保留（未保存的输入仍在）', async () => {
    const wrapper = mountPage()
    await wrapper.get('textarea').setValue('/draft')
    await wrapper.findAll('[role="tab"]')[2]!.trigger('click')
    expect(selected(wrapper)).toEqual(['屏蔽规则'])
    expect(visiblePanels(wrapper)).toEqual(['屏蔽规则'])
    await wrapper.findAll('[role="tab"]')[0]!.trigger('click')
    expect(visiblePanels(wrapper)).toEqual(['排除路径'])
    expect((wrapper.get('textarea').element as HTMLTextAreaElement).value).toBe('/draft')
  })

  it('值只来自 modelValue：点击只发出 update:modelValue，点已选中的标签不发出', async () => {
    const wrapper = mount(required(UiTabs), { props: { modelValue: 'excluded', tabs: TABS } })
    await wrapper.findAll('[role="tab"]')[1]!.trigger('click')
    await wrapper.findAll('[role="tab"]')[0]!.trigger('click')
    expect(wrapper.emitted('update:modelValue')).toEqual([['entries']])
    expect(wrapper.findAll('[role="tab"]').map(tab => tab.attributes('aria-selected'))).toEqual(['true', 'false', 'false'])
  })

  it('键盘：→ ← 切换并聚焦（首尾循环），Home、End 到第一个、最后一个；其他键不处理', async () => {
    const wrapper = mountPage()
    tabs(wrapper)[0]!.focus()
    await press(wrapper, 'ArrowRight')
    expect(selected(wrapper)).toEqual(['自定义词条'])
    expect(document.activeElement).toBe(tabs(wrapper)[1])
    await press(wrapper, 'End')
    expect(selected(wrapper)).toEqual(['屏蔽规则'])
    await press(wrapper, 'ArrowRight')
    expect(selected(wrapper)).toEqual(['排除路径'])
    expect(document.activeElement).toBe(tabs(wrapper)[0])
    await press(wrapper, 'ArrowLeft')
    expect(selected(wrapper)).toEqual(['屏蔽规则'])
    await press(wrapper, 'Home')
    expect(selected(wrapper)).toEqual(['排除路径'])
    expect(visiblePanels(wrapper)).toEqual(['排除路径'])

    const event = new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, cancelable: true })
    tabs(wrapper)[0]!.dispatchEvent(event)
    expect(event.defaultPrevented).toBe(false)
    expect(selected(wrapper)).toEqual(['排除路径'])
  })

  it('面板里的按键不切换标签', async () => {
    const wrapper = mountPage()
    const textarea = wrapper.get('textarea').element as HTMLTextAreaElement
    textarea.focus()
    textarea.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, cancelable: true }))
    await nextTick()
    expect(selected(wrapper)).toEqual(['排除路径'])
  })

  it('没有选中的标签时：面板都不显示，第一个标签可用 Tab 进入', () => {
    const wrapper = mountPage('unknown')
    expect(selected(wrapper)).toEqual([])
    expect(visiblePanels(wrapper)).toEqual([])
    expect(tabs(wrapper).map(tab => tab.tabIndex)).toEqual([0, -1, -1])
  })

  it('指针在选中标签下、与其等宽；首次定位不过渡，切换后滑到新标签下', async () => {
    stubLayout()
    const wrapper = mountPage()
    await nextTick()
    expect(indicator(wrapper).style.transform).toBe('translateX(0px) scaleX(72)')
    expect(indicator(wrapper).getAttribute('aria-hidden')).toBe('true')
    expect(indicator(wrapper).classList.contains('ui-tabs-indicator-animated')).toBe(false)

    await wrapper.findAll('[role="tab"]')[1]!.trigger('click')
    await nextTick()
    expect(indicator(wrapper).style.transform).toBe('translateX(80px) scaleX(86)')
    expect(indicator(wrapper).classList.contains('ui-tabs-indicator-animated')).toBe(true)
  })

  it('标签尺寸变化（字体加载完成等）：指针重新定位；卸载后停止观察', async () => {
    const callbacks: (() => void)[] = []
    const observed: Element[] = []
    const disconnect = vi.fn()
    vi.stubGlobal(
      'ResizeObserver',
      class {
        constructor(callback: () => void) {
          callbacks.push(callback)
        }
        observe(target: Element): void {
          observed.push(target)
        }
        disconnect = disconnect
      }
    )
    stubLayout()
    const wrapper = mountPage()
    expect(observed).toEqual(tabs(wrapper))

    vi.restoreAllMocks()
    stubLayout({ ...BOXES, 排除路径: { left: 0, width: 90 } })
    for (const callback of callbacks) callback()
    await nextTick()
    expect(indicator(wrapper).style.transform).toBe('translateX(0px) scaleX(90)')
    expect(indicator(wrapper).classList.contains('ui-tabs-indicator-animated')).toBe(false)

    wrapper.unmount()
    expect(disconnect).toHaveBeenCalled()
  })

  it('标签文字变化（切换界面语言）：重新定位', async () => {
    stubLayout({ ...BOXES, 'Excluded paths': { left: 0, width: 110 } })
    const wrapper = mount(required(UiTabs), { props: { modelValue: 'excluded', tabs: TABS } })
    await nextTick()
    expect(indicator(wrapper).style.transform).toBe('translateX(0px) scaleX(72)')
    await wrapper.setProps({ tabs: [{ value: 'excluded', label: 'Excluded paths' }, ...TABS.slice(1)] })
    await nextTick()
    expect(indicator(wrapper).style.transform).toBe('translateX(0px) scaleX(110)')
  })

  it('同一页面内多个标签页的 id 不重复', () => {
    const component = required(UiTabs)
    const ids = mount(() => [h(component, { modelValue: 'excluded', tabs: TABS }), h(component, { modelValue: 'excluded', tabs: TABS })])
      .findAll('[role="tab"], [role="tabpanel"]')
      .map(item => item.attributes('id'))
    expect(ids).toHaveLength(12)
    expect(new Set(ids).size).toBe(12)
  })
})
