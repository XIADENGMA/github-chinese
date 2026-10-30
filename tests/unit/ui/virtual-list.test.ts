import { nextTick, ref, shallowRef, type Ref, type ShallowRef } from 'vue'
import { useVirtualList, type VirtualItem, type VirtualList } from '../../../src/components/useVirtualList'
import { withScope, type Scoped } from './helpers'

const ROW = 40

interface Fixture {
  readonly element: HTMLElement
  readonly source: Ref<string[]>
  readonly viewport: ShallowRef<HTMLElement | null>
  readonly list: Scoped<VirtualList<string>>
}

const fixtures: Fixture[] = []

/**
 * 滚动容器（可视高度 height）> table > tbody，同设置页的结构；rows 为预先放进去的行（模拟已渲染的行）。
 * 表格的高度与行高不同：量错元素时测得的行高不对
 */
function container(height: number, rows: readonly number[] = []): HTMLElement {
  const element = document.createElement('div')
  Object.defineProperty(element, 'clientHeight', { configurable: true, value: height })
  const table = document.createElement('table')
  table.getBoundingClientRect = () => ({ height: 2000 }) as DOMRect
  table.append(document.createElement('tbody'))
  element.append(table)
  for (const index of rows) tbody(element).append(row(index))
  document.body.append(element)
  return element
}

function tbody(element: HTMLElement): HTMLElement {
  const found = element.querySelector('tbody')
  if (!found) throw new Error('未找到 tbody')
  return found
}

/** 一行：带 data-index，两个输入框 */
function row(index: number, height = 0): HTMLTableRowElement {
  const element = document.createElement('tr')
  element.dataset.index = String(index)
  element.getBoundingClientRect = () => ({ height }) as DOMRect
  for (const field of ['source', 'target']) {
    const cell = document.createElement('td')
    const input = document.createElement('input')
    input.setAttribute('aria-label', `${field}-${index}`)
    cell.append(input)
    element.append(cell)
  }
  return element
}

/** keyed：按数据本身（各不相同的字符串）跟踪焦点行 */
async function setup(count: number, element: HTMLElement, keyed = false): Promise<Fixture> {
  const source = ref(Array.from({ length: count }, (_, index) => `item-${index}`))
  const viewport = shallowRef<HTMLElement | null>(null)
  const keyOf = keyed ? (item: string): string => item : undefined
  const list = withScope(() => useVirtualList({ source, viewport, estimatedHeight: ROW, overscan: 2, keyOf }))
  viewport.value = element
  await nextTick()
  const fixture = { element, source, viewport, list }
  fixtures.push(fixture)
  return fixture
}

/** 渲染项简写：行写序号，占位写“gap 高度” */
function shape(items: readonly VirtualItem<string>[]): (number | string)[] {
  return items.map((item) => (item.kind === 'row' ? item.index : `gap ${item.height}`))
}

/** 渲染项的键：行写序号，占位写键名 */
function keys(items: readonly VirtualItem<string>[]): (number | string)[] {
  return items.map((item) => (item.kind === 'row' ? item.index : String(item.key.description)))
}

function range(start: number, end: number): number[] {
  return Array.from({ length: end - start }, (_, offset) => start + offset)
}

async function scrollTo(element: HTMLElement, top: number): Promise<void> {
  element.scrollTop = top
  element.dispatchEvent(new Event('scroll'))
  await nextTick()
}

function input(element: HTMLElement, index: number, field = 'source'): HTMLInputElement {
  const found = element.querySelector<HTMLInputElement>(`[data-index="${index}"] input[aria-label^="${field}"]`)
  if (!found) throw new Error(`未找到第 ${index} 行`)
  return found
}

function focusOut(target: Element, relatedTarget: Element | null): void {
  target.dispatchEvent(new FocusEvent('focusout', { bubbles: true, relatedTarget }))
}

function capture(options?: boolean | EventListenerOptions): boolean {
  return typeof options === 'boolean' ? options : (options?.capture ?? false)
}

afterEach(() => {
  for (const { list, element } of fixtures.splice(0)) {
    list.stop()
    element.remove()
  }
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('useVirtualList', () => {
  it('只渲染可视范围加上下 overscan 行，其余用占位撑开，总高度不变', async () => {
    // 可视 400 / 40 = 10 行，加一行容纳上下各露出一部分的行
    const { list } = await setup(100, container(400))
    expect(shape(list.result.items.value)).toEqual([...range(0, 13), `gap ${87 * ROW}`])
    const total = list.result.items.value.reduce((sum, item) => sum + (item.kind === 'row' ? ROW : item.height), 0)
    expect(total).toBe(100 * ROW)
    expect(list.result.items.value[0]).toEqual({ kind: 'row', index: 0, data: 'item-0' })
  })

  it('滚动后范围随之移动，上下各一个占位', async () => {
    const { element, list } = await setup(100, container(400))
    await scrollTo(element, 50 * ROW)
    expect(shape(list.result.items.value)).toEqual([`gap ${48 * ROW}`, ...range(48, 63), `gap ${37 * ROW}`])
  })

  it('范围不变的滚动不重建渲染项', async () => {
    const { element, list } = await setup(100, container(400))
    const before = list.result.items.value
    await scrollTo(element, ROW / 2)
    expect(list.result.items.value).toBe(before)
    await scrollTo(element, 50 * ROW)
    expect(list.result.items.value).not.toBe(before)
  })

  it('滚到末尾：最后一行渲染，末尾没有占位；数据变少、滚动位置未收回时按末尾一屏算', async () => {
    const { element, source, list } = await setup(100, container(400))
    await scrollTo(element, 100 * ROW)
    expect(shape(list.result.items.value)).toEqual([`gap ${87 * ROW}`, ...range(87, 100)])
    source.value = source.value.slice(0, 20)
    await nextTick()
    expect(shape(list.result.items.value)).toEqual([`gap ${7 * ROW}`, ...range(7, 20)])
  })

  it('数据少于一屏时全部渲染，没有占位；没有数据时没有渲染项', async () => {
    const { source, list } = await setup(3, container(400))
    expect(shape(list.result.items.value)).toEqual([0, 1, 2])
    source.value = []
    await nextTick()
    expect(list.result.items.value).toEqual([])
  })

  it('未布局（容器高度为 0）时按窗口高度估算可视行数', async () => {
    const { list } = await setup(100, container(0))
    const visible = Math.ceil(window.innerHeight / ROW) + 1
    expect(shape(list.result.items.value)).toEqual([...range(0, visible + 2), `gap ${(98 - visible) * ROW}`])
  })

  it('行高取已渲染行（不是表格）的实测高度；与估计值差不到半像素时不更新', async () => {
    const element = container(520, [])
    tbody(element).append(row(0, 52))
    const { list } = await setup(100, element)
    // 520 / 52 = 10 行
    expect(shape(list.result.items.value)).toEqual([...range(0, 13), `gap ${87 * 52}`])

    const close = container(400)
    tbody(close).append(row(0, ROW + 0.3))
    const other = await setup(100, close)
    expect(shape(other.list.result.items.value).at(-1)).toBe(`gap ${87 * ROW}`)
  })

  it('观察容器与表格的尺寸，变化时重新测量；卸载后停止观察', async () => {
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
      },
    )
    const element = container(400)
    const sample = row(0, ROW)
    tbody(element).append(sample)
    const { list } = await setup(100, element)
    expect(observed).toEqual([element, element.querySelector('table')])

    sample.getBoundingClientRect = () => ({ height: 50 }) as DOMRect
    Object.defineProperty(element, 'clientHeight', { configurable: true, value: 500 })
    for (const callback of callbacks) callback()
    await nextTick()
    expect(shape(list.result.items.value)).toEqual([...range(0, 13), `gap ${87 * 50}`])

    list.stop()
    expect(disconnect).toHaveBeenCalled()
  })

  it('没有 ResizeObserver 时照常工作', async () => {
    vi.stubGlobal('ResizeObserver', undefined)
    const { element, list } = await setup(100, container(400))
    await scrollTo(element, 50 * ROW)
    expect(shape(list.result.items.value)[0]).toBe(`gap ${48 * ROW}`)
  })

  it('焦点所在的行滚出范围后，连同上下相邻的行保留在原位置；焦点离开后移除', async () => {
    const { element, list } = await setup(100, container(400, range(0, 13)))
    input(element, 5).focus()
    await scrollTo(element, 50 * ROW)
    expect(shape(list.result.items.value)).toEqual([
      `gap ${4 * ROW}`,
      4,
      5,
      6,
      `gap ${41 * ROW}`,
      ...range(48, 63),
      `gap ${37 * ROW}`,
    ])
    const total = list.result.items.value.reduce((sum, item) => sum + (item.kind === 'row' ? ROW : item.height), 0)
    expect(total).toBe(100 * ROW)

    input(element, 5).blur()
    await nextTick()
    expect(shape(list.result.items.value)).toEqual([`gap ${48 * ROW}`, ...range(48, 63), `gap ${37 * ROW}`])
  })

  it('焦点行在范围之后：保留在末尾的占位之间', async () => {
    const { element, list } = await setup(100, container(400, [90]))
    await scrollTo(element, 90 * ROW)
    input(element, 90).focus()
    await scrollTo(element, 0)
    expect(shape(list.result.items.value)).toEqual([...range(0, 13), `gap ${76 * ROW}`, 89, 90, 91, `gap ${8 * ROW}`])
  })

  it('焦点行是首行或末行：只保留存在的相邻行', async () => {
    const first = await setup(100, container(400, [0]))
    input(first.element, 0).focus()
    await scrollTo(first.element, 50 * ROW)
    expect(shape(first.list.result.items.value).slice(0, 3)).toEqual([0, 1, `gap ${46 * ROW}`])

    const last = await setup(100, container(400, [99]))
    await scrollTo(last.element, 99 * ROW)
    input(last.element, 99).focus()
    await scrollTo(last.element, 0)
    expect(shape(last.list.result.items.value).slice(-3)).toEqual([`gap ${85 * ROW}`, 98, 99])
  })

  it('焦点行紧挨范围时与范围连成一段，中间没有占位', async () => {
    const { element, list } = await setup(100, container(400, [46]))
    await scrollTo(element, 46 * ROW)
    input(element, 46).focus()
    await scrollTo(element, 50 * ROW)
    expect(shape(list.result.items.value)).toEqual([`gap ${45 * ROW}`, ...range(45, 63), `gap ${37 * ROW}`])
  })

  it('焦点行从范围之后一次跳到范围之前：焦点行两侧的占位键不同，两次都有的项先后顺序不变', async () => {
    const { element, list } = await setup(200, container(400, [100]))
    await scrollTo(element, 100 * ROW)
    input(element, 100).focus()
    await scrollTo(element, 0)
    const before = keys(list.result.items.value)
    expect(before.filter((key) => typeof key === 'string')).toEqual(['before-pin', 'after'])

    await scrollTo(element, 150 * ROW)
    const after = keys(list.result.items.value)
    expect(after.filter((key) => typeof key === 'string')).toEqual(['before', 'after-pin', 'after'])
    // Vue 按键比对新旧列表：两次都有的项顺序一致，就不会移动焦点行的节点（移动会让输入框失去焦点）
    const shared = (from: (number | string)[], to: (number | string)[]): (number | string)[] =>
      from.filter((key) => to.includes(key))
    expect(shared(before, after)).toEqual(shared(after, before))
  })

  it('焦点在行与行之间移动：保留新的焦点行', async () => {
    const { element, list } = await setup(100, container(400, [1, 2]))
    input(element, 1).focus()
    input(element, 2).focus()
    await scrollTo(element, 50 * ROW)
    expect(shape(list.result.items.value).slice(0, 5)).toEqual([`gap ${1 * ROW}`, 1, 2, 3, `gap ${44 * ROW}`])
  })

  it('焦点移到列表里的另一处时先不移除焦点行（等 focusin）；移出列表时移除', async () => {
    const { element, list } = await setup(100, container(400, [5]))
    input(element, 5).focus()
    await scrollTo(element, 50 * ROW)
    // 浏览器在 focusout 之后、聚焦新元素之前运行微任务（Vue 在此时更新）：同一行的另一个输入框必须还在
    focusOut(input(element, 5), input(element, 5, 'target'))
    await nextTick()
    expect(shape(list.result.items.value)).toContain(5)

    const outside = document.createElement('button')
    document.body.append(outside)
    focusOut(input(element, 5), outside)
    await nextTick()
    expect(shape(list.result.items.value)).not.toContain(5)
    outside.remove()
  })

  it('窗口失去焦点（切换应用）时保留焦点行', async () => {
    const { element, list } = await setup(100, container(400, [1]))
    input(element, 1).focus()
    await scrollTo(element, 50 * ROW)
    vi.spyOn(document, 'hasFocus').mockReturnValue(false)
    focusOut(input(element, 1), null)
    await nextTick()
    expect(shape(list.result.items.value)).toContain(1)
  })

  it('焦点行被移除（没有 focusout）后，下次滚动不再保留；焦点不在行内时不保留', async () => {
    const { element, list } = await setup(100, container(400, [1]))
    const target = input(element, 1)
    target.focus()
    target.closest('[data-index]')?.remove()
    await scrollTo(element, 50 * ROW)
    expect(shape(list.result.items.value)[0]).toBe(`gap ${48 * ROW}`)

    const loose = document.createElement('input')
    element.append(loose)
    loose.focus()
    await scrollTo(element, 51 * ROW)
    expect(shape(list.result.items.value)[0]).toBe(`gap ${49 * ROW}`)
  })

  it('按键跟踪焦点行：前面插入数据后仍保留同一条（序号随之变）；那一条被删掉后不保留', async () => {
    const { element, source, list } = await setup(100, container(400, [1]), true)
    input(element, 1).focus()
    await scrollTo(element, 50 * ROW)
    expect(shape(list.result.items.value).slice(0, 4)).toEqual([0, 1, 2, `gap ${45 * ROW}`])

    source.value = ['new', ...source.value]
    await nextTick()
    expect(shape(list.result.items.value).slice(0, 5)).toEqual([`gap ${1 * ROW}`, 1, 2, 3, `gap ${44 * ROW}`])
    expect(list.result.items.value[2]).toEqual({ kind: 'row', index: 2, data: 'item-1' })

    source.value = source.value.filter((item) => item !== 'item-1')
    await nextTick()
    expect(shape(list.result.items.value)[0]).toBe(`gap ${48 * ROW}`)
  })

  it('焦点行的数据被删掉时不保留', async () => {
    const { element, source, list } = await setup(100, container(400, [90]))
    await scrollTo(element, 90 * ROW)
    input(element, 90).focus()
    await scrollTo(element, 0)
    source.value = source.value.slice(0, 50)
    await nextTick()
    expect(shape(list.result.items.value)).toEqual([...range(0, 13), `gap ${37 * ROW}`])
  })

  it('pin：按焦点行保留指定的行；序号无效时不变', async () => {
    const { list } = await setup(100, container(400))
    list.result.pin(70)
    await nextTick()
    expect(shape(list.result.items.value).slice(13)).toEqual([`gap ${56 * ROW}`, 69, 70, 71, `gap ${28 * ROW}`])
    list.result.pin(100)
    list.result.pin(-1)
    await nextTick()
    expect(shape(list.result.items.value)).toContain(70)
  })

  it('scrollToTop：滚回顶部并立即按顶部渲染；未挂载时也可调用', async () => {
    const { element, list } = await setup(100, container(400))
    await scrollTo(element, 50 * ROW)
    list.result.scrollToTop()
    expect(element.scrollTop).toBe(0)
    expect(shape(list.result.items.value)[0]).toBe(0)

    const detached = withScope(() =>
      useVirtualList({ source: ['item-0'], viewport: shallowRef(null), estimatedHeight: ROW }),
    )
    expect(() => detached.result.scrollToTop()).not.toThrow()
    detached.stop()
  })

  it('容器换成新元素（列表清空后再出现）：改为监听新元素，按新元素的位置渲染；旧元素不再生效', async () => {
    const { element, viewport, list } = await setup(100, container(400))
    await scrollTo(element, 50 * ROW)
    viewport.value = null
    await nextTick()
    const next = container(400)
    viewport.value = next
    await nextTick()
    expect(shape(list.result.items.value)[0]).toBe(0)

    await scrollTo(element, 80 * ROW)
    expect(shape(list.result.items.value)[0]).toBe(0)
    await scrollTo(next, 20 * ROW)
    expect(shape(list.result.items.value)[0]).toBe(`gap ${18 * ROW}`)
    next.remove()
  })

  it('卸载后逐一移除注册过的监听（事件、函数、捕获阶段都对应）', async () => {
    const element = container(400)
    const add = vi.spyOn(element, 'addEventListener')
    const remove = vi.spyOn(element, 'removeEventListener')
    const { list } = await setup(100, element)
    const registered = add.mock.calls.map(([type, listener, options]) => [type, listener, capture(options)])
    expect(registered.map(([type]) => type)).toEqual(['scroll', 'focusin', 'focusout'])
    list.stop()
    expect(remove.mock.calls.map(([type, listener, options]) => [type, listener, capture(options)])).toEqual(registered)
  })
})
