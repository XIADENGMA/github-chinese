import { enableAutoUnmount, mount, type VueWrapper } from '@vue/test-utils'
import { h, nextTick, ref, type Component } from 'vue'
import { importSfc, required } from './sfc'

const UiInput = await importSfc(() => import('../../../src/components/ui/UiInput.vue'))

enableAutoUnmount(afterEach)

/** 输入法组字：开始后改值并触发 input，此时不应更新 */
async function compose(element: HTMLInputElement, value: string): Promise<void> {
  element.dispatchEvent(new Event('compositionstart'))
  element.value = value
  element.dispatchEvent(new Event('input'))
  await nextTick()
}

describe.skipIf(!UiInput)('UiInput', () => {
  function field(wrapper: VueWrapper): HTMLInputElement {
    return wrapper.get('input').element
  }

  it('v-model：显示 modelValue，输入时发出 update:modelValue', async () => {
    const wrapper = mount(required(UiInput), { props: { modelValue: 'octocat' } })
    expect(field(wrapper).value).toBe('octocat')
    await wrapper.get('input').setValue('vuejs/core')
    expect(wrapper.emitted('update:modelValue')).toEqual([['vuejs/core']])
    await wrapper.setProps({ modelValue: 'Sample text' })
    expect(field(wrapper).value).toBe('Sample text')
    await wrapper.setProps({ modelValue: undefined })
    expect(field(wrapper).value).toBe('')
  })

  it('class、style 在外层；type、placeholder、aria-label 与 change 监听落在原生 input 上', async () => {
    const onChange = vi.fn((event: Event) => (event.target as HTMLInputElement).value)
    const wrapper = mount(required(UiInput), {
      props: { modelValue: '' },
      attrs: { class: 'cell', style: 'width: 120px', placeholder: '原文', 'aria-label': '原文', onChange },
    })
    expect(wrapper.classes()).toEqual(expect.arrayContaining(['ui-input', 'cell']))
    expect(wrapper.attributes('style')).toContain('width: 120px')
    const input = wrapper.get('input')
    expect(input.attributes()).toMatchObject({ placeholder: '原文', 'aria-label': '原文' })
    expect(input.classes()).not.toContain('cell')
    expect(input.attributes('style')).toBeUndefined()
    await input.setValue('Code')
    expect(onChange).toHaveReturnedWith('Code')
  })

  it('type="search" 时左侧显示放大镜，对读屏隐藏；其他类型不显示', () => {
    const search = mount(required(UiInput), { props: { modelValue: '' }, attrs: { type: 'search' } })
    expect(search.get('input').attributes('type')).toBe('search')
    expect(search.classes()).toContain('ui-input-search')
    expect(search.get('svg').attributes('aria-hidden')).toBe('true')
    const text = mount(required(UiInput), { props: { modelValue: '' } })
    expect(text.find('svg').exists()).toBe(false)
    expect(text.classes()).not.toContain('ui-input-search')
  })

  it('输入法组字期间不更新，组字结束时更新', async () => {
    const wrapper = mount(required(UiInput), { props: { modelValue: '' } })
    const input = field(wrapper)
    await compose(input, 'dai ma')
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    input.value = '代码'
    input.dispatchEvent(new Event('compositionend'))
    expect(wrapper.emitted('update:modelValue')).toEqual([['代码']])
  })

  it('父组件只传值不监听：直接改写 DOM 恢复原值后，重新渲染不会换回输入过的值', async () => {
    const input = required(UiInput)
    const tick = ref(0)
    const Parent: Component = {
      setup: () => () =>
        h('div', { 'data-tick': tick.value }, [
          h(input, {
            modelValue: 'Code',
            onChange: (event: Event) => {
              ;(event.target as HTMLInputElement).value = 'Code'
            },
          }),
        ]),
    }
    const wrapper = mount(Parent)
    const field = wrapper.get('input')
    await field.setValue('Source')
    expect((field.element as HTMLInputElement).value).toBe('Code')
    tick.value += 1
    await nextTick()
    expect((field.element as HTMLInputElement).value).toBe('Code')
  })

  it('行内样式；focus() 聚焦输入框', async () => {
    const wrapper = mount(required(UiInput), { props: { modelValue: '', inline: true }, attachTo: document.body })
    expect(wrapper.get('input').classes()).toContain('ui-input-inline')
    ;(wrapper.vm as unknown as { focus(): void }).focus()
    expect(document.activeElement).toBe(field(wrapper))
  })
})
