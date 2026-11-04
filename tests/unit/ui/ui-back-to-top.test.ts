import { enableAutoUnmount, mount, type VueWrapper } from '@vue/test-utils'
import { defineComponent, h, nextTick } from 'vue'
import { importSfc, required } from './sfc'

const UiBackToTop = await importSfc(() => import('../../../src/components/ui/UiBackToTop.vue'))

enableAutoUnmount(afterEach)

/** 列表的滚动位置与可见高度（px） */
const view = { top: 0, height: 400 }

/** 可滚动的列表：表格之后是返回顶部 */
function mountList(): VueWrapper {
  const component = required(UiBackToTop)
  const List = defineComponent({
    setup() {
      return () => h('div', { class: 'frame' }, [h('table'), h(component, { label: '返回顶部' })])
    }
  })
  return mount(List, { attachTo: document.body })
}

function frameOf(wrapper: VueWrapper): HTMLElement {
  return wrapper.get<HTMLElement>('.frame').element
}

async function scrollTo(wrapper: VueWrapper, top: number): Promise<void> {
  view.top = top
  frameOf(wrapper).dispatchEvent(new Event('scroll'))
  await nextTick()
}

function shown(wrapper: VueWrapper): boolean {
  return wrapper.get('.ui-back-to-top').classes('is-shown')
}

describe.skipIf(!UiBackToTop)('UiBackToTop', () => {
  beforeEach(() => {
    view.top = 0
    view.height = 400
    vi.spyOn(Element.prototype, 'scrollTop', 'get').mockImplementation(function (this: Element) {
      return this.classList.contains('frame') ? view.top : 0
    })
    vi.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockImplementation(function (this: HTMLElement) {
      return this.classList.contains('frame') ? view.height : 0
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it('放在列表末尾；按钮的名称、悬停提示为给出的名称', () => {
    const wrapper = mountList()
    expect(frameOf(wrapper).lastElementChild?.classList.contains('ui-back-to-top')).toBe(true)
    const button = wrapper.get('[data-test="back-to-top"]')
    expect(button.attributes('type')).toBe('button')
    expect(button.attributes('aria-label')).toBe('返回顶部')
    expect(button.attributes('title')).toBe('返回顶部')
  })

  it('在顶部时隐藏；向下滚过可见高度的一半后显示，滚回去后隐藏', async () => {
    const wrapper = mountList()
    expect(shown(wrapper)).toBe(false)
    await scrollTo(wrapper, 200)
    expect(shown(wrapper)).toBe(false)
    await scrollTo(wrapper, 201)
    expect(shown(wrapper)).toBe(true)
    await scrollTo(wrapper, 120)
    expect(shown(wrapper)).toBe(false)
  })

  it('挂载时列表已滚下去：直接显示', async () => {
    view.top = 1000
    const wrapper = mountList()
    await nextTick()
    expect(shown(wrapper)).toBe(true)
  })

  it('点按：列表平滑滚回顶部；减少动态效果时直接回到顶部', async () => {
    const scroll = vi.spyOn(Element.prototype, 'scrollTo').mockImplementation(() => undefined)
    const wrapper = mountList()
    await scrollTo(wrapper, 800)
    await wrapper.get('[data-test="back-to-top"]').trigger('click')
    expect(scroll).toHaveBeenLastCalledWith({ top: 0, behavior: 'smooth' })
    expect(scroll.mock.contexts.at(-1)).toBe(frameOf(wrapper))

    vi.stubGlobal('matchMedia', (query: string) => ({ matches: query === '(prefers-reduced-motion: reduce)' }))
    await wrapper.get('[data-test="back-to-top"]').trigger('click')
    expect(scroll).toHaveBeenLastCalledWith({ top: 0, behavior: 'auto' })
  })

  it('有焦点时不隐藏（键盘操作回到顶部后焦点仍在按钮上）；失去焦点后隐藏', async () => {
    const wrapper = mountList()
    const button = wrapper.get('[data-test="back-to-top"]')
    await button.trigger('focus')
    expect(shown(wrapper)).toBe(true)
    await button.trigger('blur')
    expect(shown(wrapper)).toBe(false)
  })

  it('卸载后不再监听列表的滚动', () => {
    const wrapper = mountList()
    const frame = frameOf(wrapper)
    const remove = vi.spyOn(frame, 'removeEventListener')
    wrapper.unmount()
    expect(remove).toHaveBeenCalledWith('scroll', expect.any(Function))
  })
})
