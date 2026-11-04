import { enableAutoUnmount, flushPromises, mount, type DOMWrapper, type VueWrapper } from '@vue/test-utils'
import { h, type Component } from 'vue'
import type { UiSelectOption } from '../../../src/components/ui/types'
import { importSfc, required } from './sfc'

const UiSelect = await importSfc(() => import('../../../src/components/ui/UiSelect.vue'))

enableAutoUnmount(afterEach)

const OPTIONS: readonly UiSelectOption[] = [
  { value: 'auto', label: '自动（简体中文）' },
  { value: 'zh-CN', label: '简体中文', lang: 'zh-CN' },
  { value: 'en', label: 'English', lang: 'en' }
]

/** 输入字母跳转用：两项以 B 开头 */
const LETTERS: readonly UiSelectOption[] = [
  { value: 'alpha', label: 'Alpha' },
  { value: 'beta', label: 'Beta' },
  { value: 'bravo', label: 'Bravo' },
  { value: 'charlie', label: 'Charlie' }
]

interface Props {
  modelValue?: string
  options?: readonly UiSelectOption[]
  disabled?: boolean
}

function render(props: Props = {}, attrs: Record<string, unknown> = {}): VueWrapper {
  return mount(required(UiSelect), {
    props: { modelValue: 'auto', options: OPTIONS, ...props },
    attrs,
    attachTo: document.body
  })
}

function trigger(wrapper: VueWrapper): DOMWrapper<HTMLButtonElement> {
  return wrapper.get('[role="combobox"]') as DOMWrapper<HTMLButtonElement>
}

function listbox(wrapper: VueWrapper): DOMWrapper<HTMLElement> {
  return wrapper.get(`#${CSS.escape(trigger(wrapper).attributes('aria-controls') ?? '')}`) as DOMWrapper<HTMLElement>
}

function options(wrapper: VueWrapper): DOMWrapper<Element>[] {
  return listbox(wrapper).findAll('[role="option"]')
}

function option(wrapper: VueWrapper, index: number): DOMWrapper<Element> {
  const found = options(wrapper)[index]
  if (!found) throw new Error(`没有第 ${index} 项`)
  return found
}

/** 列表是否展开：aria-expanded 与列表是否显示须一致 */
function isOpen(wrapper: VueWrapper): boolean {
  const expanded = trigger(wrapper).attributes('aria-expanded') === 'true'
  expect(listbox(wrapper).element.style.display !== 'none').toBe(expanded)
  return expanded
}

/** 高亮项（aria-activedescendant 指向的选项）的文字；列表关闭时没有 */
function activeText(wrapper: VueWrapper): string | undefined {
  const id = trigger(wrapper).attributes('aria-activedescendant')
  return id === undefined ? undefined : wrapper.get(`#${CSS.escape(id)}`).text()
}

/** 按钮上显示的当前值：去掉对读屏隐藏、只用来撑开宽度的部分 */
function shown(wrapper: VueWrapper): { text: string; lang: string | null } {
  const clone = trigger(wrapper).element.cloneNode(true) as HTMLElement
  for (const hidden of clone.querySelectorAll('[aria-hidden="true"]')) hidden.remove()
  return { text: clone.textContent?.trim() ?? '', lang: clone.querySelector('[lang]')?.getAttribute('lang') ?? null }
}

/** 在按钮上按键，等界面更新后返回事件（可检查是否阻止了默认行为） */
async function press(wrapper: VueWrapper, key: string, init: KeyboardEventInit = {}): Promise<KeyboardEvent> {
  const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...init })
  trigger(wrapper).element.dispatchEvent(event)
  await flushPromises()
  return event
}

async function pointerdown(target: { readonly element: Element }): Promise<void> {
  target.element.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, button: 0 }))
  await flushPromises()
}

describe.skipIf(!UiSelect)('UiSelect', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  it('按钮是 combobox，列表以按钮为名；选项的文字、lang、选中状态；按钮显示当前值', () => {
    const wrapper = render({ modelValue: 'zh-CN' })
    const button = trigger(wrapper)
    expect(button.element.tagName).toBe('BUTTON')
    expect(button.attributes()).toMatchObject({ type: 'button', 'aria-haspopup': 'listbox', 'aria-expanded': 'false' })
    expect(button.attributes('id')).toBeTruthy()
    expect(button.attributes('aria-activedescendant')).toBeUndefined()
    expect(listbox(wrapper).attributes('role')).toBe('listbox')
    expect(listbox(wrapper).attributes('aria-labelledby')).toBe(button.attributes('id'))
    expect(isOpen(wrapper)).toBe(false)
    expect(options(wrapper).map(item => item.text())).toEqual(['自动（简体中文）', '简体中文', 'English'])
    expect(options(wrapper).map(item => item.attributes('lang'))).toEqual([undefined, 'zh-CN', 'en'])
    expect(options(wrapper).map(item => item.attributes('aria-selected'))).toEqual(['false', 'true', 'false'])
    expect(shown(wrapper)).toEqual({ text: '简体中文', lang: 'zh-CN' })
  })

  it('按钮里叠放全部选项撑开宽度（与原生下拉一样取最长项），对读屏隐藏', () => {
    const sizers = trigger(render()).findAll('span[aria-hidden="true"]')
    expect(sizers.map(sizer => sizer.text())).toEqual(OPTIONS.map(item => item.label))
    expect(sizers.map(sizer => sizer.attributes('lang'))).toEqual([undefined, 'zh-CN', 'en'])
  })

  it('点击打开并高亮当前值；点选项发出 update:modelValue 并关闭；父组件不采纳时仍显示原值', async () => {
    const wrapper = render()
    await trigger(wrapper).trigger('click')
    expect(isOpen(wrapper)).toBe(true)
    expect(activeText(wrapper)).toBe('自动（简体中文）')
    expect(listbox(wrapper).classes()).not.toContain('is-keyboard')
    await option(wrapper, 2).trigger('click')
    expect(wrapper.emitted('update:modelValue')).toEqual([['en']])
    expect(isOpen(wrapper)).toBe(false)
    expect(shown(wrapper).text).toBe('自动（简体中文）')
    await wrapper.setProps({ modelValue: 'en' })
    expect(shown(wrapper)).toEqual({ text: 'English', lang: 'en' })
    expect(option(wrapper, 2).attributes('aria-selected')).toBe('true')
  })

  it('点当前值只关闭、不发出；展开时再点按钮关闭', async () => {
    const wrapper = render()
    await trigger(wrapper).trigger('click')
    await option(wrapper, 0).trigger('click')
    expect(isOpen(wrapper)).toBe(false)
    await trigger(wrapper).trigger('click')
    await trigger(wrapper).trigger('click')
    expect(isOpen(wrapper)).toBe(false)
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  })

  it('打开时聚焦按钮；在列表上按下不移走焦点', async () => {
    const wrapper = render()
    await trigger(wrapper).trigger('click')
    expect(document.activeElement).toBe(trigger(wrapper).element)
    const event = new MouseEvent('mousedown', { bubbles: true, cancelable: true })
    option(wrapper, 1).element.dispatchEvent(event)
    expect(event.defaultPrevented).toBe(true)
  })

  it('指针经过的选项高亮（无焦点框）；键盘移动后高亮项有焦点框', async () => {
    const wrapper = render()
    await press(wrapper, 'ArrowDown')
    expect(listbox(wrapper).classes()).toContain('is-keyboard')
    await option(wrapper, 2).trigger('pointermove')
    expect(activeText(wrapper)).toBe('English')
    expect(option(wrapper, 2).classes()).toContain('is-active')
    expect(listbox(wrapper).classes()).not.toContain('is-keyboard')
    await press(wrapper, 'ArrowUp')
    expect(activeText(wrapper)).toBe('简体中文')
    expect(listbox(wrapper).classes()).toContain('is-keyboard')
  })

  describe('键盘', () => {
    it.each(['ArrowDown', 'ArrowUp', 'Enter', ' '])('%j 打开列表并高亮当前值', async key => {
      const wrapper = render({ modelValue: 'zh-CN' })
      expect((await press(wrapper, key)).defaultPrevented).toBe(true)
      expect(isOpen(wrapper)).toBe(true)
      expect(activeText(wrapper)).toBe('简体中文')
    })

    it.each([
      ['Home', '自动（简体中文）'],
      ['End', 'English']
    ])('%s 打开列表并高亮首项或末项', async (key, expected) => {
      const wrapper = render({ modelValue: 'zh-CN' })
      await press(wrapper, key)
      expect(activeText(wrapper)).toBe(expected)
    })

    it('列表关闭时 Tab、Esc 等按键不打开，也不阻止默认行为', async () => {
      const wrapper = render()
      for (const key of ['Tab', 'Escape', 'Shift', 'F5']) expect((await press(wrapper, key)).defaultPrevented).toBe(false)
      expect((await press(wrapper, 'e', { ctrlKey: true })).defaultPrevented).toBe(false)
      expect(isOpen(wrapper)).toBe(false)
    })

    it('↓ ↑ Home End PageUp PageDown 移动高亮（到头不循环），Enter 选中并关闭', async () => {
      const wrapper = render({ modelValue: 'zh-CN' })
      await press(wrapper, 'ArrowDown')
      const steps: readonly (readonly [string, string])[] = [
        ['ArrowDown', 'English'],
        ['ArrowDown', 'English'],
        ['Home', '自动（简体中文）'],
        ['ArrowUp', '自动（简体中文）'],
        ['End', 'English'],
        ['PageUp', '自动（简体中文）'],
        ['PageDown', 'English']
      ]
      for (const [key, expected] of steps) {
        expect((await press(wrapper, key)).defaultPrevented).toBe(true)
        expect(activeText(wrapper)).toBe(expected)
      }
      expect(wrapper.emitted('update:modelValue')).toBeUndefined()
      await press(wrapper, 'Enter')
      expect(wrapper.emitted('update:modelValue')).toEqual([['en']])
      expect(isOpen(wrapper)).toBe(false)
    })

    it('空格、Alt+↑ 选中并关闭；松开空格时阻止默认行为（Firefox 会在松开时再点一次按钮）', async () => {
      const wrapper = render()
      await press(wrapper, ' ')
      await press(wrapper, 'ArrowDown')
      await press(wrapper, ' ')
      expect(isOpen(wrapper)).toBe(false)
      const keyup = new KeyboardEvent('keyup', { key: ' ', bubbles: true, cancelable: true })
      trigger(wrapper).element.dispatchEvent(keyup)
      expect(keyup.defaultPrevented).toBe(true)
      await press(wrapper, 'End')
      expect((await press(wrapper, 'ArrowUp', { altKey: true })).defaultPrevented).toBe(true)
      expect(isOpen(wrapper)).toBe(false)
      expect(wrapper.emitted('update:modelValue')).toEqual([['zh-CN'], ['en']])
    })

    it('Tab 选中高亮项并关闭，不阻止焦点移走', async () => {
      const wrapper = render()
      await press(wrapper, 'ArrowDown')
      await press(wrapper, 'ArrowDown')
      expect((await press(wrapper, 'Tab')).defaultPrevented).toBe(false)
      expect(isOpen(wrapper)).toBe(false)
      expect(wrapper.emitted('update:modelValue')).toEqual([['zh-CN']])
    })

    it('Esc 关闭、不选中，不传到外层；列表关闭时的 Esc 照常传出', async () => {
      const escapes: KeyboardEvent[] = []
      const listener = (event: KeyboardEvent): void => {
        if (event.key === 'Escape') escapes.push(event)
      }
      document.addEventListener('keydown', listener)
      try {
        const wrapper = render()
        await press(wrapper, 'ArrowDown')
        await press(wrapper, 'ArrowDown')
        expect((await press(wrapper, 'Escape')).defaultPrevented).toBe(true)
        expect(isOpen(wrapper)).toBe(false)
        expect(escapes).toHaveLength(0)
        await press(wrapper, 'Escape')
        expect(escapes).toHaveLength(1)
        expect(wrapper.emitted('update:modelValue')).toBeUndefined()
      } finally {
        document.removeEventListener('keydown', listener)
      }
    })

    it('其他按键不移动高亮、不阻止默认行为', async () => {
      const wrapper = render()
      await press(wrapper, 'ArrowDown')
      expect((await press(wrapper, 'Shift')).defaultPrevented).toBe(false)
      expect(activeText(wrapper)).toBe('自动（简体中文）')
      expect(isOpen(wrapper)).toBe(true)
    })

    it('输入字母跳到以其开头的选项（不分大小写）；连按同一字母轮换；停顿后重新匹配；无匹配时不动', async () => {
      vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
      const wrapper = render({ modelValue: 'alpha', options: LETTERS })
      expect((await press(wrapper, 'b')).defaultPrevented).toBe(true)
      expect(isOpen(wrapper)).toBe(true)
      expect(activeText(wrapper)).toBe('Beta')
      await press(wrapper, 'B')
      expect(activeText(wrapper)).toBe('Bravo')
      await press(wrapper, 'b')
      expect(activeText(wrapper)).toBe('Beta')
      vi.advanceTimersByTime(500)
      await press(wrapper, 'c')
      await press(wrapper, 'h')
      expect(activeText(wrapper)).toBe('Charlie')
      await press(wrapper, 'x')
      expect(activeText(wrapper)).toBe('Charlie')
      await press(wrapper, 'a')
      expect(activeText(wrapper)).toBe('Alpha')
      expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    })

    it('键盘移动时高亮项滚动到可见处', async () => {
      const wrapper = render()
      const last = vi.spyOn(option(wrapper, 2).element, 'scrollIntoView')
      const middle = vi.spyOn(option(wrapper, 1).element, 'scrollIntoView')
      await press(wrapper, 'End')
      expect(last).toHaveBeenCalledWith({ block: 'nearest' })
      await press(wrapper, 'ArrowUp')
      expect(middle).toHaveBeenCalledWith({ block: 'nearest' })
    })
  })

  it('点控件外关闭、不改值；在列表内按下不关；点本控件的 label：先不关，随后转发的点击关闭', async () => {
    const select = required(UiSelect)
    const Parent: Component = {
      setup: () => () =>
        h('div', [
          h('label', { for: 'ui-language' }, '界面语言'),
          h(select, { id: 'ui-language', modelValue: 'auto', options: OPTIONS }),
          h('p', 'Sample text')
        ])
    }
    const wrapper = mount(Parent, { attachTo: document.body })
    await trigger(wrapper).trigger('click')
    await pointerdown(wrapper.get('p'))
    expect(isOpen(wrapper)).toBe(false)

    await trigger(wrapper).trigger('click')
    await pointerdown(option(wrapper, 1))
    expect(isOpen(wrapper)).toBe(true)
    await pointerdown(wrapper.get('label'))
    expect(isOpen(wrapper)).toBe(true)
    await wrapper.get('label').trigger('click')
    expect(isOpen(wrapper)).toBe(false)
    expect(wrapper.findComponent(select).emitted('update:modelValue')).toBeUndefined()
  })

  it('失去焦点时关闭', async () => {
    const wrapper = render()
    await trigger(wrapper).trigger('click')
    await trigger(wrapper).trigger('blur')
    expect(isOpen(wrapper)).toBe(false)
  })

  it('禁用：按钮不可用、打不开；展开时被禁用则收起', async () => {
    const wrapper = render({ disabled: true })
    expect(trigger(wrapper).element.disabled).toBe(true)
    await press(wrapper, 'ArrowDown')
    expect(isOpen(wrapper)).toBe(false)
    await wrapper.setProps({ disabled: false })
    await trigger(wrapper).trigger('click')
    expect(isOpen(wrapper)).toBe(true)
    await wrapper.setProps({ disabled: true })
    expect(isOpen(wrapper)).toBe(false)
  })

  it('没有选项时打不开，按钮为空', async () => {
    const wrapper = render({ options: [] })
    await trigger(wrapper).trigger('click')
    expect(isOpen(wrapper)).toBe(false)
    expect(shown(wrapper).text).toBe('')
  })

  it('class、style 在外层；id、data-test、aria-* 在按钮上，列表以该 id 为名；箭头对读屏隐藏', () => {
    const wrapper = render(
      {},
      {
        class: 'select',
        style: 'min-width: 180px',
        id: 'ui-language',
        'data-test': 'ui-language',
        'aria-describedby': 'hint'
      }
    )
    expect(wrapper.element.tagName).toBe('SPAN')
    expect(wrapper.classes()).toEqual(expect.arrayContaining(['ui-select', 'select']))
    expect(wrapper.attributes('style')).toContain('min-width: 180px')
    const button = trigger(wrapper)
    expect(button.attributes()).toMatchObject({
      id: 'ui-language',
      'data-test': 'ui-language',
      'aria-describedby': 'hint'
    })
    expect(button.classes()).not.toContain('select')
    expect(button.attributes('style')).toBeUndefined()
    expect(listbox(wrapper).attributes('aria-labelledby')).toBe('ui-language')
    expect(button.get('svg').attributes('aria-hidden')).toBe('true')
  })

  it('列表与按钮同名：取关联的 label、aria-label 或 aria-labelledby', async () => {
    const select = required(UiSelect)
    const Parent: Component = {
      setup: () => () =>
        h('div', [
          h('label', { for: 'page-language' }, '翻译语言'),
          h(select, { id: 'page-language', modelValue: 'auto', options: OPTIONS })
        ])
    }
    const labelled = mount(Parent, { attachTo: document.body })
    await trigger(labelled).trigger('click')
    expect(listbox(labelled).attributes('aria-label')).toBe('翻译语言')
    expect(listbox(labelled).attributes('aria-labelledby')).toBeUndefined()
    expect(listbox(render({}, { 'aria-label': '界面语言' })).attributes('aria-label')).toBe('界面语言')
    const byIds = listbox(render({}, { 'aria-labelledby': 'language-title' }))
    expect(byIds.attributes('aria-labelledby')).toBe('language-title')
    expect(byIds.attributes('aria-label')).toBeUndefined()
  })

  describe('展开方向', () => {
    interface Layout {
      /** 按钮在窗口中的位置 */
      readonly rect: DOMRect
      /** 列表的内容高度与宽度 */
      readonly list: { readonly height: number; readonly width: number }
      readonly viewport: { readonly width: number; readonly height: number }
    }

    async function openWith(layout: Layout): Promise<DOMWrapper<HTMLElement>> {
      const wrapper = render()
      vi.spyOn(window, 'innerWidth', 'get').mockReturnValue(layout.viewport.width)
      vi.spyOn(window, 'innerHeight', 'get').mockReturnValue(layout.viewport.height)
      vi.spyOn(trigger(wrapper).element, 'getBoundingClientRect').mockReturnValue(layout.rect)
      const list = listbox(wrapper).element
      Object.defineProperty(list, 'scrollHeight', { configurable: true, value: layout.list.height })
      Object.defineProperty(list, 'offsetWidth', { configurable: true, value: layout.list.width })
      await trigger(wrapper).trigger('click')
      await flushPromises()
      return listbox(wrapper)
    }

    it('下方放得下：向下展开，最大高度取下方空间', async () => {
      const list = await openWith({
        rect: new DOMRect(16, 100, 180, 32),
        list: { height: 110, width: 180 },
        viewport: { width: 300, height: 430 }
      })
      expect(list.classes()).not.toContain('is-above')
      expect(list.classes()).not.toContain('is-end')
      // 430 - 132（按钮底边）- 4（间距）- 8（边距）
      expect(list.element.style.maxHeight).toBe('286px')
    })

    it('下方放不下而上方更宽裕：向上展开；右侧超出窗口：与按钮右缘对齐', async () => {
      const list = await openWith({
        rect: new DOMRect(104, 330, 180, 32),
        list: { height: 110, width: 200 },
        viewport: { width: 300, height: 430 }
      })
      expect(list.classes()).toEqual(expect.arrayContaining(['is-above', 'is-end']))
      // 330（按钮顶边）- 4 - 8
      expect(list.element.style.maxHeight).toBe('318px')
    })

    it('上下都放不下：取较宽裕的一侧，至少 80px，超出部分在列表内滚动', async () => {
      const list = await openWith({
        rect: new DOMRect(16, 40, 180, 32),
        list: { height: 110, width: 180 },
        viewport: { width: 300, height: 100 }
      })
      expect(list.classes()).toContain('is-above')
      expect(list.element.style.maxHeight).toBe('80px')
    })
  })

  it('卸载时移除文档上的监听', async () => {
    const wrapper = render()
    await trigger(wrapper).trigger('click')
    const remove = vi.spyOn(document, 'removeEventListener')
    wrapper.unmount()
    expect(remove).toHaveBeenCalledWith('pointerdown', expect.any(Function), true)
  })
})
