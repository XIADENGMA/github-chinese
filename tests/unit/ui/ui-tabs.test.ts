import { enableAutoUnmount, mount, type VueWrapper } from '@vue/test-utils'
import { defineComponent, h, nextTick, ref, shallowRef, type ShallowRef } from 'vue'
import type { UiTab } from '../../../src/components/ui/types'
import { importSfc, required } from './sfc'

const UiTabs = await importSfc(() => import('../../../src/components/ui/UiTabs.vue'))

enableAutoUnmount(afterEach)

const TABS: readonly UiTab[] = [
  { value: 'excluded', label: '排除路径' },
  { value: 'entries', label: '自定义词条' },
  { value: 'search', label: '屏蔽规则' }
]

/** 各标签相对标签栏内容的位置与宽度（px）：测试环境不排版，按标签文字给出 */
const BOXES: Record<string, { left: number; width: number }> = {
  排除路径: { left: 0, width: 72 },
  自定义词条: { left: 80, width: 86 },
  屏蔽规则: { left: 174, width: 72 }
}
/** 标签两侧的内边距：文字（.ui-tab-text）在标签内的位置 */
const TAB_PADDING = 8

/** 标签栏在视口中的左端、横向滚动量、可见宽度、内容宽度（px） */
interface ListView {
  readonly left: number
  scroll: number
  readonly width: number
  readonly content: number
}

const FITS: ListView = { left: 0, scroll: 0, width: 600, content: 600 }

/** 拖动中的标签（连同其中的文字）的平移量：测试环境不按 transform 排版，照浏览器加上 */
function dragShift(element: Element): number {
  const dragged = element.closest<HTMLElement>('[data-dragging]')
  return dragged ? Number.parseFloat(/translate\((-?[\d.]+)px/.exec(dragged.style.transform)?.[1] ?? '0') : 0
}

/**
 * 各标签、标签文字在视口中的位置（getBoundingClientRect）：标签栏内容中的位置 + 标签栏的位置 − 滚动量；
 * 标签栏的滚动量、可见宽度、内容宽度按 view（滚动量可改）
 */
function stubLayout(boxes = BOXES, view: ListView = { ...FITS }): ListView {
  const box = (element: Element): { left: number; width: number } | undefined => {
    const tab = boxes[element.textContent?.trim() ?? '']
    if (!tab) return undefined
    if (element.getAttribute('role') === 'tab') return tab
    return element.classList.contains('ui-tab-text') ? { left: tab.left + TAB_PADDING, width: tab.width - TAB_PADDING * 2 } : undefined
  }
  const isList = (element: Element): boolean => element.getAttribute('role') === 'tablist'
  vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(function (this: Element) {
    if (isList(this)) return new DOMRect(view.left, 0, view.width, 40)
    const found = box(this)
    return found ? new DOMRect(view.left - view.scroll + found.left + dragShift(this), 0, found.width, 20) : new DOMRect()
  })
  vi.spyOn(Element.prototype, 'scrollLeft', 'get').mockImplementation(function (this: Element) {
    return isList(this) ? view.scroll : 0
  })
  vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockImplementation(function (this: HTMLElement) {
    return isList(this) ? view.width : 0
  })
  vi.spyOn(Element.prototype, 'scrollWidth', 'get').mockImplementation(function (this: Element) {
    return isList(this) ? view.content : 0
  })
  return view
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

/** 横条（指针、轨道）的位置与宽度 */
function bar(wrapper: VueWrapper, name: 'indicator' | 'track'): { transform: string; width: string } {
  const { transform, width } = wrapper.get<HTMLElement>(`[data-test="tabs-${name}"]`).element.style
  return { transform, width }
}

/** 横条应有的样式：位置用 translateX，宽度直接设 */
function placed(left: number, width: number): { transform: string; width: string } {
  return { transform: `translateX(${left}px)`, width: `${width}px` }
}

/** 两端的滚动按钮是否显示 */
function scrollShown(wrapper: VueWrapper): boolean[] {
  return ['start', 'end'].map(side => wrapper.get(`[data-test="tabs-scroll-${side}"]`).classes('is-shown'))
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

  it('指针在选中标签的文字下、与文字等宽（不含两侧内边距，直接设宽度）；首次定位不过渡，切换后滑到新标签下', async () => {
    stubLayout()
    const wrapper = mountPage()
    await nextTick()
    expect(bar(wrapper, 'indicator')).toEqual(placed(8, 56))
    expect(indicator(wrapper).getAttribute('aria-hidden')).toBe('true')
    expect(indicator(wrapper).classList.contains('ui-tabs-indicator-animated')).toBe(false)

    await wrapper.findAll('[role="tab"]')[1]!.trigger('click')
    await nextTick()
    expect(bar(wrapper, 'indicator')).toEqual(placed(88, 70))
    expect(indicator(wrapper).classList.contains('ui-tabs-indicator-animated')).toBe(true)
  })

  it('标签带计数：指针从文字起到计数止', async () => {
    const boxes = new Map<string, { left: number; width: number }>([
      ['ui-tab', { left: 0, width: 82 }],
      ['ui-tab-text', { left: 8, width: 40 }],
      ['ui-tab-count', { left: 54, width: 20 }]
    ])
    vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(function (this: Element) {
      const found = boxes.get(this.classList[0] ?? '')
      return found ? new DOMRect(found.left, 0, found.width, 20) : new DOMRect()
    })
    const wrapper = mount(required(UiTabs), { props: { modelValue: 'excluded', tabs: [{ ...TABS[0]!, count: 3 }] } })
    await nextTick()
    expect(bar(wrapper, 'indicator')).toEqual(placed(8, 66))
    expect(bar(wrapper, 'track')).toEqual(placed(0, 82))
  })

  it('轨道从第一个标签起到最后一个标签止（标签撑满整行时即整行）；标签增减时随之伸缩', async () => {
    stubLayout()
    const wrapper = mount(required(UiTabs), { props: { modelValue: 'excluded', tabs: TABS } })
    await nextTick()
    const track = wrapper.get('[data-test="tabs-track"]')
    expect(track.attributes('aria-hidden')).toBe('true')
    expect(bar(wrapper, 'track')).toEqual(placed(0, 246))

    await wrapper.setProps({ tabs: TABS.slice(0, 2) })
    await nextTick()
    expect(bar(wrapper, 'track')).toEqual(placed(0, 166))

    await wrapper.setProps({ tabs: [] })
    await nextTick()
    expect(bar(wrapper, 'track')).toEqual(placed(0, 0))
    expect(bar(wrapper, 'indicator')).toEqual(placed(0, 0))
  })

  it('按实际排版的位置与宽度（可为小数，不取整）；标签栏横向滚动后照样对齐', async () => {
    stubLayout(
      { 排除路径: { left: 0, width: 72.5 }, 自定义词条: { left: 80.5, width: 86.25 }, 屏蔽规则: { left: 174.75, width: 72.75 } },
      { left: 120, scroll: 30, width: 200, content: 247.5 }
    )
    const wrapper = mount(required(UiTabs), { props: { modelValue: 'entries', tabs: TABS } })
    await nextTick()
    expect(bar(wrapper, 'indicator')).toEqual(placed(88.5, 70.25))
    expect(bar(wrapper, 'track')).toEqual(placed(0, 247.5))
  })

  it('标签栏、标签尺寸变化（窗口缩放、字体加载完成等）：指针、轨道重新定位；卸载后停止观察', async () => {
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
    expect(observed).toEqual([wrapper.get('[role="tablist"]').element, ...tabs(wrapper)])

    vi.restoreAllMocks()
    stubLayout({ ...BOXES, 排除路径: { left: 0, width: 90 }, 屏蔽规则: { left: 192, width: 80 } })
    for (const callback of callbacks) callback()
    await nextTick()
    expect(bar(wrapper, 'indicator')).toEqual(placed(8, 74))
    expect(indicator(wrapper).classList.contains('ui-tabs-indicator-animated')).toBe(false)
    expect(bar(wrapper, 'track')).toEqual(placed(0, 272))

    wrapper.unmount()
    expect(disconnect).toHaveBeenCalled()
  })

  it('标签文字变化（切换界面语言）：重新定位', async () => {
    stubLayout({ ...BOXES, 'Excluded paths': { left: 0, width: 110 } })
    const wrapper = mount(required(UiTabs), { props: { modelValue: 'excluded', tabs: TABS } })
    await nextTick()
    expect(bar(wrapper, 'indicator')).toEqual(placed(8, 56))
    await wrapper.setProps({ tabs: [{ value: 'excluded', label: 'Excluded paths' }, ...TABS.slice(1)] })
    await nextTick()
    expect(bar(wrapper, 'indicator')).toEqual(placed(8, 94))
  })

  describe('放不下时横向滚动', () => {
    /** 标签栏宽 200，内容宽 246（三个标签） */
    const NARROW = { left: 0, scroll: 0, width: 200, content: 246 }

    function scrollTo(wrapper: VueWrapper, view: ListView, left: number): void {
      view.scroll = left
      wrapper.get('[role="tablist"]').element.dispatchEvent(new Event('scroll'))
    }

    it('放得下时两端都不显示滚动按钮', async () => {
      stubLayout()
      const wrapper = mountPage()
      await nextTick()
      expect(scrollShown(wrapper)).toEqual([false, false])
    })

    it('滚动按钮在还有标签的一端显示：开头只显示右端，中间两端都显示，到头只显示左端（容许 1px 误差）', async () => {
      const view = stubLayout(BOXES, { ...NARROW })
      const wrapper = mountPage()
      await nextTick()
      expect(scrollShown(wrapper)).toEqual([false, true])
      scrollTo(wrapper, view, 20)
      await nextTick()
      expect(scrollShown(wrapper)).toEqual([true, true])
      scrollTo(wrapper, view, 45.5)
      await nextTick()
      expect(scrollShown(wrapper)).toEqual([true, false])
      scrollTo(wrapper, view, 0.5)
      await nextTick()
      expect(scrollShown(wrapper)).toEqual([false, true])
    })

    it('点滚动按钮：向该端滚过一屏，减去两端按钮盖住的部分（至少一个按钮宽）', async () => {
      stubLayout(BOXES, { ...NARROW })
      const scrollBy = vi.spyOn(Element.prototype, 'scrollBy').mockImplementation(() => undefined)
      const wrapper = mountPage()
      await nextTick()
      await wrapper.get('[data-test="tabs-scroll-end"]').trigger('click')
      expect(scrollBy).toHaveBeenLastCalledWith({ left: 120 })
      await wrapper.get('[data-test="tabs-scroll-start"]').trigger('click')
      expect(scrollBy).toHaveBeenLastCalledWith({ left: -120 })

      vi.restoreAllMocks()
      stubLayout(BOXES, { ...NARROW, width: 60 })
      const narrow = vi.spyOn(Element.prototype, 'scrollBy').mockImplementation(() => undefined)
      await wrapper.get('[data-test="tabs-scroll-end"]').trigger('click')
      expect(narrow).toHaveBeenLastCalledWith({ left: 40 })
    })

    it('滚动按钮只供指针点按：不进 Tab 顺序，读屏不读；按下时焦点不离开标签', async () => {
      stubLayout(BOXES, { ...NARROW })
      const wrapper = mountPage()
      await nextTick()
      for (const side of ['start', 'end']) {
        const button = wrapper.get(`[data-test="tabs-scroll-${side}"]`)
        expect(button.attributes('tabindex')).toBe('-1')
        expect(button.attributes('aria-hidden')).toBe('true')
        expect(button.attributes('type')).toBe('button')
        const down = new MouseEvent('mousedown', { bubbles: true, cancelable: true })
        button.element.dispatchEvent(down)
        expect(down.defaultPrevented).toBe(true)
      }
    })

    it('选中被挡住或在可见范围外的标签：标签栏滚到它整个露出来（离两端留出按钮宽）；放得下时不滚', async () => {
      const view = stubLayout(BOXES, { ...NARROW })
      const scrollTo = vi.spyOn(Element.prototype, 'scrollTo').mockImplementation(() => undefined)
      const wrapper = mountPage()
      await nextTick()
      await wrapper.findAll('[role="tab"]')[2]!.trigger('click')
      await nextTick()
      expect(scrollTo).toHaveBeenLastCalledWith({ left: 86 })

      view.scroll = 46
      await wrapper.findAll('[role="tab"]')[0]!.trigger('click')
      await nextTick()
      expect(scrollTo).toHaveBeenLastCalledWith({ left: 0 })

      // 恰好离两端都有按钮宽：不滚
      scrollTo.mockClear()
      view.scroll = 6
      await wrapper.findAll('[role="tab"]')[1]!.trigger('click')
      await nextTick()
      expect(scrollTo).not.toHaveBeenCalled()

      vi.restoreAllMocks()
      stubLayout()
      const fits = vi.spyOn(Element.prototype, 'scrollTo').mockImplementation(() => undefined)
      await wrapper.findAll('[role="tab"]')[2]!.trigger('click')
      await nextTick()
      expect(fits).not.toHaveBeenCalled()
    })

    it('打开时选中的标签在可见范围外：滚到它', async () => {
      stubLayout(BOXES, { ...NARROW })
      const scrollTo = vi.spyOn(Element.prototype, 'scrollTo').mockImplementation(() => undefined)
      mountPage('search')
      await nextTick()
      expect(scrollTo).toHaveBeenCalledWith({ left: 86 })
    })
  })

  it('同一页面内多个标签页的 id 不重复', () => {
    const component = required(UiTabs)
    const ids = mount(() => [h(component, { modelValue: 'excluded', tabs: TABS }), h(component, { modelValue: 'excluded', tabs: TABS })])
      .findAll('[role="tab"], [role="tabpanel"]')
      .map(item => item.attributes('id'))
    expect(ids).toHaveLength(12)
    expect(new Set(ids).size).toBe(12)
  })

  describe('排序', () => {
    /** 胶囊的位置（px）：前两个在第一行，第三个换到第二行；高 28 */
    const PILLS: Record<string, { left: number; top: number; width: number }> = {
      排除路径: { left: 0, top: 0, width: 72 },
      自定义词条: { left: 78, top: 0, width: 86 },
      屏蔽规则: { left: 0, top: 34, width: 72 }
    }
    const PILL_HEIGHT = 28

    function stubPills(): void {
      const box = (element: HTMLElement): { left: number; top: number; width: number } | undefined =>
        element.getAttribute('role') === 'tab' ? PILLS[element.textContent?.trim() ?? ''] : undefined
      vi.spyOn(HTMLElement.prototype, 'offsetLeft', 'get').mockImplementation(function (this: HTMLElement) {
        return box(this)?.left ?? 0
      })
      vi.spyOn(HTMLElement.prototype, 'offsetTop', 'get').mockImplementation(function (this: HTMLElement) {
        return box(this)?.top ?? 0
      })
      vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockImplementation(function (this: HTMLElement) {
        return box(this)?.width ?? 0
      })
      vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockImplementation(function (this: HTMLElement) {
        return box(this) ? PILL_HEIGHT : 0
      })
    }

    /** 可排序的胶囊标签：父组件按 move 改顺序，记下各次移动 */
    function mountSortable(reorderable = true): { wrapper: VueWrapper; moves: [string, number][] } {
      const component = required(UiTabs)
      const list = shallowRef<readonly UiTab[]>(TABS)
      const value = ref('excluded')
      const moves: [string, number][] = []
      const wrapper = mount(
        () =>
          h(component, {
            modelValue: value.value,
            'onUpdate:modelValue': (next: string) => (value.value = next),
            onMove: (moved: string, index: number) => {
              moves.push([moved, index])
              const tab = list.value.find(item => item.value === moved)!
              const rest = list.value.filter(item => item.value !== moved)
              list.value = [...rest.slice(0, index), tab, ...rest.slice(index)]
            },
            tabs: list.value,
            label: '分类',
            variant: 'pill',
            reorderable
          }),
        { attachTo: document.body }
      )
      return { wrapper, moves }
    }

    function labels(wrapper: VueWrapper): string[] {
      return tabs(wrapper).map(tab => tab.textContent?.trim() ?? '')
    }

    interface PointerInit {
      readonly x: number
      readonly y: number
      readonly kind?: string
      readonly id?: number
      readonly button?: number
      readonly primary?: boolean
    }

    function pointer(type: string, target: EventTarget, init: PointerInit): PointerEvent {
      const event = new PointerEvent(type, {
        bubbles: true,
        cancelable: true,
        clientX: init.x,
        clientY: init.y,
        pointerId: init.id ?? 1,
        pointerType: init.kind ?? 'mouse',
        button: init.button ?? 0,
        isPrimary: init.primary ?? true
      })
      target.dispatchEvent(event)
      return event
    }

    function dropLine(wrapper: VueWrapper): HTMLElement | undefined {
      const found = wrapper.find<HTMLElement>('[data-test="tabs-drop"]')
      return found.exists() ? found.element : undefined
    }

    /** 标签栏的列间距（样式未加载时为 0） */
    function gap(wrapper: VueWrapper): number {
      return Number.parseFloat(getComputedStyle(wrapper.get('[role="tablist"]').element).columnGap) || 0
    }

    it('拖动中重新定位（如尺寸变化）：指针、轨道按排版位置，不随拖动的标签平移', async () => {
      const callbacks: (() => void)[] = []
      vi.stubGlobal(
        'ResizeObserver',
        class {
          constructor(callback: () => void) {
            callbacks.push(callback)
          }
          observe(): void {}
          disconnect(): void {}
        }
      )
      stubLayout()
      const wrapper = mount(required(UiTabs), { props: { modelValue: 'excluded', tabs: TABS, reorderable: true }, attachTo: document.body })
      await nextTick()
      const first = tabs(wrapper)[0]!
      pointer('pointerdown', first, { x: 10, y: 10 })
      pointer('pointermove', window, { x: 40, y: 10 })
      await nextTick()
      expect(first.style.transform).toBe('translate(30px, 0px)')
      for (const callback of callbacks) callback()
      await nextTick()
      expect(bar(wrapper, 'indicator')).toEqual(placed(8, 56))
      expect(bar(wrapper, 'track')).toEqual(placed(0, 246))
    })

    it('可排序时标签标出快捷键 Alt + ← →；默认不可排序', () => {
      const { wrapper } = mountSortable()
      expect(tabs(wrapper).map(tab => tab.getAttribute('aria-keyshortcuts'))).toEqual(
        Array.from({ length: 3 }, () => 'Alt+ArrowLeft Alt+ArrowRight')
      )
      expect(tabs(mountPage()).some(tab => tab.hasAttribute('aria-keyshortcuts'))).toBe(false)
    })

    it('Alt + → ←：前移、后移一位，焦点留在移动的标签上；到头时不动；不切换选中的标签', async () => {
      const { wrapper, moves } = mountSortable()
      tabs(wrapper)[0]!.focus()
      await press(wrapper, 'ArrowRight')
      expect(selected(wrapper)).toEqual(['自定义词条'])
      const altRight = new KeyboardEvent('keydown', { key: 'ArrowRight', altKey: true, bubbles: true, cancelable: true })
      document.activeElement!.dispatchEvent(altRight)
      await nextTick()
      await nextTick()
      expect(altRight.defaultPrevented).toBe(true)
      expect(moves).toEqual([['entries', 2]])
      expect(labels(wrapper)).toEqual(['排除路径', '屏蔽规则', '自定义词条'])
      expect(document.activeElement).toBe(tabs(wrapper)[2])
      expect(selected(wrapper)).toEqual(['自定义词条'])
      document.activeElement!.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'ArrowRight', altKey: true, bubbles: true, cancelable: true })
      )
      await nextTick()
      expect(moves).toHaveLength(1)
      document.activeElement!.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'ArrowLeft', altKey: true, bubbles: true, cancelable: true })
      )
      await nextTick()
      await nextTick()
      expect(moves).toEqual([
        ['entries', 2],
        ['entries', 1]
      ])
      expect(document.activeElement).toBe(tabs(wrapper)[1])
      const altHome = new KeyboardEvent('keydown', { key: 'Home', altKey: true, bubbles: true, cancelable: true })
      document.activeElement!.dispatchEvent(altHome)
      expect(altHome.defaultPrevented).toBe(false)
    })

    it('不可排序时 Alt + 方向键留给浏览器：不切换、不移动', async () => {
      const { wrapper, moves } = mountSortable(false)
      tabs(wrapper)[0]!.focus()
      const event = new KeyboardEvent('keydown', { key: 'ArrowRight', altKey: true, bubbles: true, cancelable: true })
      document.activeElement!.dispatchEvent(event)
      await nextTick()
      expect(event.defaultPrevented).toBe(false)
      expect(moves).toEqual([])
      expect(selected(wrapper)).toEqual(['排除路径'])
    })

    it('鼠标拖动：移动超过 4px 才开始，标签跟随指针，两个标签之间显示落点；松开后移到落点，这次单击不切换标签', async () => {
      stubPills()
      const { wrapper, moves } = mountSortable()
      const first = tabs(wrapper)[0]!
      pointer('pointerdown', first, { x: 10, y: 10 })
      pointer('pointermove', window, { x: 12, y: 11 })
      await nextTick()
      expect(first.hasAttribute('data-dragging')).toBe(false)
      pointer('pointermove', window, { x: 150, y: 12 })
      await nextTick()
      expect(first.hasAttribute('data-dragging')).toBe(true)
      expect(first.style.transform).toBe('translate(140px, 2px)')
      // 第一行的末尾：自定义词条之后
      const line = dropLine(wrapper)!
      expect(line.getAttribute('aria-hidden')).toBe('true')
      expect(line.style.transform).toBe(`translate(${78 + 86 + gap(wrapper) / 2 - 1}px, 0px)`)
      expect(line.style.height).toBe(`${PILL_HEIGHT}px`)
      pointer('pointerup', window, { x: 150, y: 12 })
      first.click()
      await nextTick()
      expect(moves).toEqual([['excluded', 1]])
      expect(labels(wrapper)).toEqual(['自定义词条', '排除路径', '屏蔽规则'])
      expect(selected(wrapper)).toEqual(['排除路径'])
      expect(dropLine(wrapper)).toBeUndefined()
      expect(tabs(wrapper).some(tab => tab.hasAttribute('data-dragging'))).toBe(false)
      // 之后的单击照常切换
      tabs(wrapper)[0]!.click()
      await nextTick()
      expect(selected(wrapper)).toEqual(['自定义词条'])
    })

    it('拖到另一行：按指针所在行取落点；落在原位两侧时没有落点，松开不移动', async () => {
      stubPills()
      const { wrapper, moves } = mountSortable()
      const last = tabs(wrapper)[2]!
      pointer('pointerdown', last, { x: 20, y: 44 })
      pointer('pointermove', window, { x: 50, y: 10 })
      await nextTick()
      expect(dropLine(wrapper)!.style.transform).toBe(`translate(${78 - gap(wrapper) / 2 - 1}px, 0px)`)
      pointer('pointermove', window, { x: 60, y: 46 })
      await nextTick()
      expect(dropLine(wrapper)).toBeUndefined()
      pointer('pointerup', window, { x: 60, y: 46 })
      await nextTick()
      expect(moves).toEqual([])
      pointer('pointerdown', last, { x: 20, y: 44 })
      pointer('pointermove', window, { x: 2, y: 2 })
      pointer('pointerup', window, { x: 2, y: 2 })
      await nextTick()
      expect(moves).toEqual([['search', 0]])
      expect(labels(wrapper)).toEqual(['屏蔽规则', '排除路径', '自定义词条'])
    })

    it('拖动中按 Escape：取消，不移动；指针取消（如系统手势）同样取消', async () => {
      stubPills()
      const { wrapper, moves } = mountSortable()
      const first = tabs(wrapper)[0]!
      pointer('pointerdown', first, { x: 10, y: 10 })
      pointer('pointermove', window, { x: 150, y: 12 })
      await nextTick()
      const escape = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true })
      window.dispatchEvent(escape)
      await nextTick()
      expect(escape.defaultPrevented).toBe(true)
      expect(first.hasAttribute('data-dragging')).toBe(false)
      pointer('pointerup', window, { x: 150, y: 12 })
      expect(moves).toEqual([])
      pointer('pointerdown', first, { x: 10, y: 10 })
      pointer('pointermove', window, { x: 150, y: 12 })
      pointer('pointercancel', window, { x: 150, y: 12 })
      pointer('pointerup', window, { x: 150, y: 12 })
      await nextTick()
      expect(moves).toEqual([])
      expect(first.hasAttribute('data-dragging')).toBe(false)
      const other = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true })
      window.dispatchEvent(other)
      expect(other.defaultPrevented).toBe(false)
    })

    it('不响应：不可排序、非主键、非主指针、其他指针的移动；只有一个标签时', async () => {
      stubPills()
      const { wrapper, moves } = mountSortable(false)
      pointer('pointerdown', tabs(wrapper)[0]!, { x: 10, y: 10 })
      pointer('pointermove', window, { x: 150, y: 12 })
      await nextTick()
      expect(tabs(wrapper)[0]!.hasAttribute('data-dragging')).toBe(false)
      const sortable = mountSortable()
      const first = tabs(sortable.wrapper)[0]!
      pointer('pointerdown', first, { x: 10, y: 10, button: 2 })
      pointer('pointerdown', first, { x: 10, y: 10, primary: false })
      pointer('pointermove', window, { x: 150, y: 12 })
      await nextTick()
      expect(first.hasAttribute('data-dragging')).toBe(false)
      pointer('pointerdown', first, { x: 10, y: 10, id: 1 })
      pointer('pointermove', window, { x: 150, y: 12, id: 2 })
      pointer('pointerup', window, { x: 150, y: 12, id: 2 })
      await nextTick()
      expect(first.hasAttribute('data-dragging')).toBe(false)
      pointer('pointerup', window, { x: 10, y: 10, id: 1 })
      expect([...moves, ...sortable.moves]).toEqual([])
      const single = mount(required(UiTabs), {
        props: { modelValue: 'excluded', tabs: TABS.slice(0, 1), reorderable: true },
        attachTo: document.body
      })
      pointer('pointerdown', single.get('[role="tab"]').element, { x: 10, y: 10 })
      pointer('pointermove', window, { x: 150, y: 12 })
      await nextTick()
      expect(single.get('[role="tab"]').attributes('data-dragging')).toBeUndefined()
    })

    describe('触屏', () => {
      beforeEach(() => {
        vi.useFakeTimers()
      })

      afterEach(() => {
        vi.useRealTimers()
      })

      it('按住 300ms 后才能拖动：之后不滚动页面、不弹长按菜单；松开后移到落点', async () => {
        stubPills()
        const { wrapper, moves } = mountSortable()
        const first = tabs(wrapper)[0]!
        pointer('pointerdown', first, { x: 10, y: 10, kind: 'touch' })
        const menu = new Event('contextmenu', { cancelable: true })
        window.dispatchEvent(menu)
        expect(menu.defaultPrevented).toBe(true)
        vi.advanceTimersByTime(299)
        await nextTick()
        expect(first.hasAttribute('data-dragging')).toBe(false)
        vi.advanceTimersByTime(1)
        await nextTick()
        expect(first.hasAttribute('data-dragging')).toBe(true)
        const scroll = new Event('touchmove', { cancelable: true })
        window.dispatchEvent(scroll)
        expect(scroll.defaultPrevented).toBe(true)
        pointer('pointermove', window, { x: 30, y: 46, kind: 'touch' })
        pointer('pointerup', window, { x: 30, y: 46, kind: 'touch' })
        await nextTick()
        expect(moves).toEqual([['excluded', 1]])
        const after = new Event('touchmove', { cancelable: true })
        window.dispatchEvent(after)
        expect(after.defaultPrevented).toBe(false)
      })

      it('按住不够久就移动：是在滚动页面，不拖动', async () => {
        stubPills()
        const { wrapper, moves } = mountSortable()
        const first = tabs(wrapper)[0]!
        pointer('pointerdown', first, { x: 10, y: 10, kind: 'touch' })
        pointer('pointermove', window, { x: 10, y: 40, kind: 'touch' })
        const scroll = new Event('touchmove', { cancelable: true })
        window.dispatchEvent(scroll)
        expect(scroll.defaultPrevented).toBe(false)
        vi.advanceTimersByTime(500)
        await nextTick()
        expect(first.hasAttribute('data-dragging')).toBe(false)
        pointer('pointerup', window, { x: 10, y: 40, kind: 'touch' })
        expect(moves).toEqual([])
      })
    })
  })

  describe('胶囊样式、计数、操作区与 panel 插槽', () => {
    const CATEGORIES: readonly UiTab[] = [
      { value: 'gh-proxy', label: 'gh-proxy', count: 4 },
      { value: 'custom', label: '自定义', count: 0 },
      { value: 'other', label: '其他' }
    ]

    /** 胶囊样式的分类标签：标签可增减；面板用 panel 插槽，other 有同名插槽 */
    function mountPills(): { wrapper: VueWrapper; list: ShallowRef<readonly UiTab[]> } {
      const component = required(UiTabs)
      const list = shallowRef<readonly UiTab[]>(CATEGORIES)
      const value = ref('gh-proxy')
      const wrapper = mount(
        () =>
          h(
            component,
            {
              modelValue: value.value,
              'onUpdate:modelValue': (next: string) => (value.value = next),
              tabs: list.value,
              label: '分类',
              variant: 'pill'
            },
            {
              actions: () => h('button', { type: 'button' }, '测速'),
              panel: ({ value: tab }: { value: string }) => h('p', `面板 ${tab}`),
              other: () => h('p', '其他的专属内容')
            }
          ),
        { attachTo: document.body }
      )
      return { wrapper, list }
    }

    it('胶囊样式没有轨道、指针与滚动按钮；默认为下划线样式，都有', () => {
      const { wrapper } = mountPills()
      expect(wrapper.get('.ui-tabs').classes()).toContain('ui-tabs-pill')
      for (const name of ['tabs-indicator', 'tabs-track', 'tabs-scroll-start', 'tabs-scroll-end']) {
        expect(wrapper.find(`[data-test="${name}"]`).exists(), name).toBe(false)
      }
      const page = mountPage()
      expect(page.get('.ui-tabs').classes()).toContain('ui-tabs-underline')
      for (const name of ['tabs-indicator', 'tabs-track', 'tabs-scroll-start', 'tabs-scroll-end']) {
        expect(page.find(`[data-test="${name}"]`).exists(), name).toBe(true)
      }
    })

    it('计数：给出时显示在标签文字后（含 0），未给出时不显示', () => {
      const { wrapper } = mountPills()
      const counts = wrapper.findAll('[role="tab"]').map(tab => {
        const count = tab.find('[data-test="tab-count"]')
        return count.exists() ? count.text() : undefined
      })
      expect(counts).toEqual(['4', '0', undefined])
      expect(wrapper.get('[role="tab"] .ui-tab-text').text()).toBe('gh-proxy')
    })

    it('操作区在标签栏右侧、标签栏之外；没有操作区插槽时不渲染', () => {
      const { wrapper } = mountPills()
      expect(wrapper.get('.ui-tabs-head > .ui-tabs-actions').text()).toBe('测速')
      expect(wrapper.get('[role="tablist"]').find('.ui-tabs-actions').exists()).toBe(false)
      expect(mountPage().find('.ui-tabs-actions').exists()).toBe(false)
    })

    it('panel 插槽按标签的 value 渲染各面板；有同名插槽的标签用同名插槽', () => {
      const { wrapper } = mountPills()
      expect(wrapper.findAll('[role="tabpanel"]').map(panel => panel.text())).toEqual(['面板 gh-proxy', '面板 custom', '其他的专属内容'])
      expect(visiblePanels(wrapper)).toEqual(['gh-proxy4'])
    })

    it('标签随数据增减：新标签带面板，点击后显示', async () => {
      const { wrapper, list } = mountPills()
      list.value = [...CATEGORIES, { value: 'category-1', label: '分类 1', count: 0 }]
      await nextTick()
      expect(wrapper.findAll('[role="tabpanel"]').at(-1)?.text()).toBe('面板 category-1')
      await wrapper.findAll('[role="tab"]').at(-1)!.trigger('click')
      expect(selected(wrapper)).toEqual(['分类 10'])
      expect(visiblePanels(wrapper)).toEqual(['分类 10'])
    })
  })
})
