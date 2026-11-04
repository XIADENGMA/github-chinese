import { enableAutoUnmount, mount } from '@vue/test-utils'
import { effectScope, nextTick, shallowRef } from 'vue'
import { useSelection } from '../../../src/components/useSelection'
import { importSfc, required } from './sfc'

const UiCheckbox = await importSfc(() => import('../../../src/components/ui/UiCheckbox.vue'))

enableAutoUnmount(afterEach)

/** 同浏览器单击复选框：切换选中、清除部分选中，再发出 change */
async function toggle(input: HTMLInputElement): Promise<void> {
  input.checked = !input.checked
  input.indeterminate = false
  input.dispatchEvent(new Event('change', { bubbles: true }))
  await nextTick()
}

describe.skipIf(!UiCheckbox)('UiCheckbox', () => {
  it('原生复选框：无障碍名称、选中状态来自属性；外层留出点击区域', () => {
    const wrapper = mount(required(UiCheckbox), { props: { checked: true, label: '全选' } })
    const input = wrapper.get<HTMLInputElement>('input')
    expect(wrapper.element.tagName).toBe('LABEL')
    expect(input.attributes('type')).toBe('checkbox')
    expect(input.attributes('aria-label')).toBe('全选')
    expect(input.element.checked).toBe(true)
    expect(input.element.indeterminate).toBe(false)
  })

  it('部分选中：indeterminate 随属性变化', async () => {
    const wrapper = mount(required(UiCheckbox), { props: { checked: false, indeterminate: true, label: '全选' } })
    await nextTick()
    const input = wrapper.get<HTMLInputElement>('input').element
    expect(input.indeterminate).toBe(true)
    await wrapper.setProps({ indeterminate: false })
    await nextTick()
    expect(input.indeterminate).toBe(false)
  })

  it('点击发出新状态，显示的状态以属性为准；属性改了才变', async () => {
    const wrapper = mount(required(UiCheckbox), { props: { checked: false, indeterminate: true, label: '全选' } })
    await nextTick()
    const input = wrapper.get<HTMLInputElement>('input')
    await toggle(input.element)
    expect(wrapper.emitted('change')).toEqual([[true]])
    expect(input.element.checked).toBe(false)
    expect(input.element.indeterminate).toBe(true)
    await wrapper.setProps({ checked: true, indeterminate: false })
    await nextTick()
    expect(input.element.checked).toBe(true)
    expect(input.element.indeterminate).toBe(false)
    await toggle(input.element)
    expect(wrapper.emitted('change')).toEqual([[true], [false]])
  })

  it('不可用：原生 disabled；可由父组件聚焦', () => {
    const wrapper = mount(required(UiCheckbox), {
      props: { checked: false, label: '选择 /settings', disabled: true },
      attachTo: document.body
    })
    expect(wrapper.get('input').attributes('disabled')).toBeDefined()
    const enabled = mount(required(UiCheckbox), { props: { checked: false, label: '选择 /settings' }, attachTo: document.body })
    ;(enabled.vm as unknown as { focus(): void }).focus()
    expect(document.activeElement).toBe(enabled.get('input').element)
  })
})

describe('useSelection', () => {
  function setup(initial: readonly string[]) {
    const keys = shallowRef<readonly string[]>(initial)
    const scope = effectScope()
    const selection = scope.run(() => useSelection(() => keys.value))!
    return { keys, scope, selection }
  }

  it('勾选、取消；全选框的状态：都没选、选了一部分、全选', () => {
    const { selection } = setup(['/a', '/b', '/c'])
    expect(selection.state.value).toBe('none')
    selection.toggle('/a', true)
    selection.toggle('/a', true)
    expect([...selection.selected.value]).toEqual(['/a'])
    expect(selection.count.value).toBe(1)
    expect(selection.has('/a')).toBe(true)
    expect(selection.state.value).toBe('some')
    selection.toggle('/b', true)
    selection.toggle('/c', true)
    expect(selection.state.value).toBe('all')
    selection.toggle('/b', false)
    expect([...selection.selected.value]).toEqual(['/a', '/c'])
    selection.toggle('/b', false)
    expect(selection.count.value).toBe(2)
  })

  it('全选为列表中的全部键；全不选、清空', () => {
    const { selection } = setup(['/a', '/b'])
    selection.toggleAll(true)
    expect([...selection.selected.value]).toEqual(['/a', '/b'])
    selection.toggleAll(false)
    expect(selection.count.value).toBe(0)
    selection.toggle('/a', true)
    const before = selection.selected.value
    selection.clear()
    expect(selection.count.value).toBe(0)
    expect(selection.selected.value).not.toBe(before)
    const empty = selection.selected.value
    selection.clear()
    expect(selection.selected.value).toBe(empty)
  })

  it('列表变化（删除、搜索）：不在其中的键自动取消；都在时不变', async () => {
    const { keys, selection } = setup(['/a', '/b', '/c'])
    keys.value = ['/a', '/b', '/c', '/d']
    await nextTick()
    expect(selection.count.value).toBe(0)
    selection.toggleAll(true)
    const all = selection.selected.value
    keys.value = ['/d', '/c', '/b', '/a']
    await nextTick()
    expect(selection.selected.value).toBe(all)
    keys.value = ['/b', '/x']
    await nextTick()
    expect([...selection.selected.value]).toEqual(['/b'])
    expect(selection.state.value).toBe('some')
  })
})
