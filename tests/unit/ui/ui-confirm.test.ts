import { enableAutoUnmount, mount, type VueWrapper } from '@vue/test-utils'
import { defineComponent, h, nextTick, ref, type Ref } from 'vue'
import { importSfc, required } from './sfc'

const UiConfirm = await importSfc(() => import('../../../src/components/ui/UiConfirm.vue'))

enableAutoUnmount(afterEach)

const LABELS = { title: '删除 2 条？', confirmLabel: '删除', cancelLabel: '取消' }

/** 带 v-model:open 的页面：打开、关闭由父组件采纳；记下确认次数 */
function mountPage(initial = false): { wrapper: VueWrapper; open: Ref<boolean>; confirmed: () => number } {
  const component = required(UiConfirm)
  const open = ref(initial)
  let count = 0
  const Page = defineComponent({
    setup() {
      return () =>
        h(component, {
          ...LABELS,
          open: open.value,
          'onUpdate:open': (value: boolean) => (open.value = value),
          onConfirm: () => (count += 1)
        })
    }
  })
  return { wrapper: mount(Page, { attachTo: document.body }), open, confirmed: () => count }
}

function dialogOf(wrapper: VueWrapper): HTMLDialogElement {
  return wrapper.get<HTMLDialogElement>('dialog').element
}

describe.skipIf(!UiConfirm)('UiConfirm', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('默认关闭；标题即对话框的名称；按钮依次为取消、确认（危险样式），取消自动聚焦', () => {
    const { wrapper } = mountPage()
    const dialog = dialogOf(wrapper)
    expect(dialog.open).toBe(false)
    expect(document.getElementById(dialog.getAttribute('aria-labelledby') ?? '')?.textContent).toBe('删除 2 条？')
    const buttons = wrapper.findAll('button')
    expect(buttons.map(button => button.text())).toEqual(['取消', '删除'])
    expect(buttons[0]!.attributes()).toHaveProperty('autofocus')
    expect(buttons[0]!.attributes('type')).toBe('button')
    expect(buttons[1]!.classes()).toContain('ui-button-danger')
  })

  it('open 为 true 时以模态打开，为 false 时关闭', async () => {
    const showModal = vi.spyOn(HTMLDialogElement.prototype, 'showModal')
    const { wrapper, open } = mountPage()
    open.value = true
    await nextTick()
    expect(showModal).toHaveBeenCalledOnce()
    expect(dialogOf(wrapper).open).toBe(true)
    open.value = false
    await nextTick()
    expect(dialogOf(wrapper).open).toBe(false)
  })

  it('挂载时 open 已为 true：直接打开', () => {
    const { wrapper } = mountPage(true)
    expect(dialogOf(wrapper).open).toBe(true)
  })

  it('点取消：关闭，不确认', async () => {
    const { wrapper, open, confirmed } = mountPage(true)
    await wrapper.get('[data-test="confirm-cancel"]').trigger('click')
    expect(open.value).toBe(false)
    expect(dialogOf(wrapper).open).toBe(false)
    expect(confirmed()).toBe(0)
  })

  it('点确认：关闭并确认一次', async () => {
    const { wrapper, open, confirmed } = mountPage(true)
    await wrapper.get('[data-test="confirm-ok"]').trigger('click')
    expect(open.value).toBe(false)
    expect(dialogOf(wrapper).open).toBe(false)
    expect(confirmed()).toBe(1)
  })

  it('浏览器关闭对话框（Escape）：open 随之为 false，不确认', async () => {
    const { wrapper, open, confirmed } = mountPage(true)
    dialogOf(wrapper).close()
    await nextTick()
    expect(open.value).toBe(false)
    expect(confirmed()).toBe(0)
  })
})
