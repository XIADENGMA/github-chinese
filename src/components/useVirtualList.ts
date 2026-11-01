import { computed, ref, shallowRef, toValue, watch, type ComputedRef, type MaybeRefOrGetter, type Ref } from 'vue'

/** 渲染项：数据行，或连续若干未渲染行的占位（高度 = 行数 × 行高） */
export type VirtualItem<T> =
  | { readonly kind: 'row'; readonly index: number; readonly data: T }
  | { readonly kind: 'gap'; readonly key: symbol; readonly height: number }

export interface VirtualListOptions<T> {
  /** 全部数据 */
  readonly source: MaybeRefOrGetter<readonly T[]>
  /** 滚动容器。行元素带 data-index（数据序号）：据此测量行高、找出焦点所在的行 */
  readonly viewport: Readonly<Ref<HTMLElement | null>>
  /** 测量到行高之前的估计值（px）；各行等高 */
  readonly estimatedHeight: number
  /** 可视范围上下各多渲染的行数 */
  readonly overscan?: number
  /** 数据的唯一键：焦点行按键跟踪，前面插入、删除数据后仍保留同一条；不给时按序号 */
  readonly keyOf?: (item: T) => unknown
}

export interface VirtualList<T> {
  /** 按顺序渲染的行与占位 */
  readonly items: ComputedRef<readonly VirtualItem<T>[]>
  /** 滚回顶部 */
  scrollToTop(): void
  /** 按焦点行保留第 index 行：不在范围内时也渲染，随后可聚焦其中的控件（聚焦时浏览器把它滚入视野） */
  pin(index: number): void
}

interface Range {
  readonly start: number
  readonly end: number
}

/** 焦点所在的行：获得焦点时的序号与数据的键 */
interface FocusedRow {
  readonly index: number
  readonly key: unknown
}

const DEFAULT_OVERSCAN = 6

/**
 * 占位的 key：首个渲染行之前、末个渲染行之后，以及焦点行在范围之前 / 之后时它与范围之间。
 * 焦点行两侧的占位分开取键：焦点行从范围一侧跳到另一侧时，复用的节点前后顺序不变，
 * 焦点行不被移动（移动 DOM 节点会让其中的输入框失去焦点）
 */
const GAP_BEFORE = Symbol('before')
const GAP_AFTER_PIN = Symbol('after-pin')
const GAP_BEFORE_PIN = Symbol('before-pin')
const GAP_AFTER = Symbol('after')

/** 行高差不到半像素不更新：避免占位高度随舍入来回变 */
const MEASURE_TOLERANCE = 0.5

/**
 * 虚拟列表：只渲染可视范围（上下各加 overscan 行）内的行，其余行用等高的占位撑开滚动高度。
 * - 各行等高：取一个已渲染行的高度，容器或内容尺寸变化时重新测量；
 * - 焦点所在的行滚出范围后仍保留渲染（在原位置，连同上下相邻的行：Tab、Shift+Tab 依次经过），焦点离开列表后才移除；
 *   行的组件不应随列表滚动重渲染（处理函数保持不变），否则 v-model 会把输入框里未提交的修改回写成原值；
 * - 未布局（容器高度为 0，如测试环境）时按窗口高度估算可视行数。
 * 须在组件 setup 内调用
 */
export function useVirtualList<T>(options: VirtualListOptions<T>): VirtualList<T> {
  const overscan = options.overscan ?? DEFAULT_OVERSCAN
  const scrollTop = ref(0)
  const viewportHeight = ref(0)
  const rowHeight = ref(options.estimatedHeight)
  const focused = shallowRef<FocusedRow>()

  const keyOf = (item: T, index: number): unknown => (options.keyOf ? options.keyOf(item) : index)

  // 范围不变时返回原对象：不触发重算，滚动不让父组件重渲染
  const range = computed<Range>((previous) => {
    const count = toValue(options.source).length
    const height = rowHeight.value
    const visible = Math.ceil((viewportHeight.value || window.innerHeight) / height) + 1
    // 数据变少、滚动位置还没收回时按末尾一屏算
    const first = Math.min(Math.floor(scrollTop.value / height), Math.max(0, count - visible))
    const start = Math.max(0, first - overscan)
    const end = Math.min(count, first + visible + overscan)
    return previous?.start === start && previous.end === end ? previous : { start, end }
  })

  /** 焦点行的当前序号：数据变动后按键重新查找，找不到（已删除）时不保留 */
  const pinned = computed(() => {
    const target = focused.value
    if (!target) return undefined
    const source = toValue(options.source)
    if (target.index < source.length && keyOf(source[target.index]!, target.index) === target.key) return target.index
    const find = options.keyOf
    if (!find) return undefined
    const index = source.findIndex((item) => find(item) === target.key)
    return index === -1 ? undefined : index
  })

  /** 要渲染的序号（升序）：范围内的行；焦点行在范围外时加上它与相邻的行 */
  const indexes = computed(() => {
    const count = toValue(options.source).length
    const { start, end } = range.value
    const inRange = Array.from({ length: end - start }, (_, offset) => start + offset)
    const pin = pinned.value
    if (pin === undefined || (pin >= start && pin < end)) return inRange
    const near = [pin - 1, pin, pin + 1].filter(
      (index) => index >= 0 && index < count && (index < start || index >= end),
    )
    return pin < start ? [...near, ...inRange] : [...inRange, ...near]
  })

  const items = computed(() => {
    const source = toValue(options.source)
    const pin = pinned.value
    // 中间的占位只有一处：焦点行与范围之间
    const middle = pin !== undefined && pin < range.value.start ? GAP_AFTER_PIN : GAP_BEFORE_PIN
    const result: VirtualItem<T>[] = []
    const gap = (key: symbol, rows: number): void => {
      result.push({ kind: 'gap', key, height: rows * rowHeight.value })
    }
    let next = 0
    for (const index of indexes.value) {
      if (index > next) gap(next === 0 ? GAP_BEFORE : middle, index - next)
      result.push({ kind: 'row', index, data: source[index]! })
      next = index + 1
    }
    if (source.length > next) gap(GAP_AFTER, source.length - next)
    return result
  })

  function measure(element: HTMLElement): void {
    viewportHeight.value = element.clientHeight
    // 容器隐藏后再显示（如所在的标签页切换回来），浏览器把滚动位置归零且不派发 scroll：尺寸变化时一并同步
    scrollTop.value = element.scrollTop
    const height = element.querySelector('[data-index]')?.getBoundingClientRect().height ?? 0
    if (height > 0 && Math.abs(height - rowHeight.value) >= MEASURE_TOLERANCE) rowHeight.value = height
  }

  /** 第 index 行的焦点记录；序号无效时为 undefined */
  function rowAt(index: number): FocusedRow | undefined {
    const source = toValue(options.source)
    return Number.isInteger(index) && index >= 0 && index < source.length
      ? { index, key: keyOf(source[index]!, index) }
      : undefined
  }

  function pin(index: number): void {
    const row = rowAt(index)
    if (row) focused.value = row
  }

  watch(
    options.viewport,
    (element, _, onCleanup) => {
      if (!element) return
      const onScroll = (): void => {
        scrollTop.value = element.scrollTop
        // 焦点已不在列表里（所在行被删除等，没有 focusout）：不再保留那一行
        if (!element.contains(document.activeElement)) focused.value = undefined
      }
      const onFocusIn = (event: FocusEvent): void => {
        const row = (event.target as Element).closest<HTMLElement>('[data-index]')
        focused.value = rowAt(Number(row?.dataset.index))
      }
      const onFocusOut = (event: FocusEvent): void => {
        // 焦点移到列表里的另一处（同一行的另一个输入框、相邻的行）：由 focusin 更新。
        // 这里先清除的话，范围外的焦点行在焦点移过去之前就被移除，焦点落空
        if (event.relatedTarget instanceof Node && element.contains(event.relatedTarget)) return
        // 窗口失去焦点（切换应用、标签页）时焦点仍留在原处，回来照常编辑：保留那一行
        if (document.hasFocus()) focused.value = undefined
      }
      element.addEventListener('scroll', onScroll, { passive: true })
      element.addEventListener('focusin', onFocusIn)
      element.addEventListener('focusout', onFocusOut)
      // 容器高度变化（窗口缩放）、行高变化（触屏与鼠标切换控件尺寸）都会改变容器或表格的尺寸
      const observer = typeof ResizeObserver === 'undefined' ? undefined : new ResizeObserver(() => measure(element))
      observer?.observe(element)
      if (element.firstElementChild) observer?.observe(element.firstElementChild)
      scrollTop.value = element.scrollTop
      measure(element)
      onCleanup(() => {
        element.removeEventListener('scroll', onScroll)
        element.removeEventListener('focusin', onFocusIn)
        element.removeEventListener('focusout', onFocusOut)
        observer?.disconnect()
      })
    },
    { flush: 'post' },
  )

  function scrollToTop(): void {
    const element = options.viewport.value
    if (element) element.scrollTop = 0
    scrollTop.value = 0
  }

  return { items, scrollToTop, pin }
}
