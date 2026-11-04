<template>
  <div class="ui-tabs" :class="`ui-tabs-${variant}`">
    <div class="ui-tabs-head">
      <div class="ui-tabs-scroller">
        <div ref="list" role="tablist" class="ui-tabs-list" :aria-label="label" @keydown="onKeydown" @scroll.passive="updateEdges">
          <button
            v-for="tab in tabs"
            :id="tabId(tab.value)"
            :key="tab.value"
            type="button"
            role="tab"
            class="ui-tab"
            :aria-selected="tab.value === modelValue"
            :aria-controls="panelId(tab.value)"
            :aria-keyshortcuts="reorderable ? REORDER_KEYS : undefined"
            :tabindex="tab.value === focusable ? 0 : -1"
            :data-dragging="tab.value === dragging ? '' : undefined"
            :style="tab.value === dragging ? dragStyle : undefined"
            @click="onClick(tab.value)"
            @pointerdown="onPointerDown($event, tab.value)"
          >
            <span class="ui-tab-text" :data-text="tab.label">{{ tab.label }}</span>
            <span v-if="tab.count !== undefined" class="ui-tab-count" data-test="tab-count">{{ tab.count }}</span>
            <UiRipple />
          </button>
          <span v-if="variant === 'underline'" class="ui-tabs-track" :style="trackStyle" aria-hidden="true" data-test="tabs-track"></span>
          <span
            v-if="variant === 'underline'"
            class="ui-tabs-indicator"
            :class="{ 'ui-tabs-indicator-animated': animated }"
            :style="indicatorStyle"
            aria-hidden="true"
            data-test="tabs-indicator"
          ></span>
          <span v-if="drop" class="ui-tabs-drop" :style="dropStyle" aria-hidden="true" data-test="tabs-drop"></span>
        </div>
        <template v-if="variant === 'underline'">
          <!-- 只供指针点按（键盘用 ← → 切换，读屏可读到全部标签）：不进 Tab 顺序，点按时焦点不离开标签 -->
          <button
            v-for="side in SIDES"
            :key="side"
            type="button"
            class="ui-tabs-scroll"
            :class="[`ui-tabs-scroll-${side}`, { 'is-shown': edges[side] }]"
            tabindex="-1"
            aria-hidden="true"
            :data-test="`tabs-scroll-${side}`"
            @mousedown.prevent
            @click="scrollTabs(side)"
          >
            <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" focusable="false">
              <path :d="CHEVRONS[side]" fill="currentColor" />
            </svg>
          </button>
        </template>
      </div>
      <div v-if="$slots.actions" class="ui-tabs-actions">
        <slot name="actions" />
      </div>
    </div>
    <div
      v-for="tab in tabs"
      v-show="tab.value === modelValue"
      :id="panelId(tab.value)"
      :key="tab.value"
      role="tabpanel"
      class="ui-tabs-panel"
      :aria-labelledby="tabId(tab.value)"
    >
      <slot :name="tab.value">
        <slot name="panel" :value="tab.value" />
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed, nextTick, onBeforeUnmount, onMounted, ref, shallowRef, useId, useTemplateRef, watch } from 'vue'
  import type { UiTab } from './types'
  import UiRipple from './UiRipple.vue'

  /**
   * 标签页（WAI-ARIA tabs，选中即切换）：标签栏与各标签的面板，面板内容由与 tab.value 同名的插槽给出，
   * 没有同名插槽时用 panel 插槽（参数为标签的 value，标签随数据增减时用）。actions 插槽放在标签栏右侧（标签栏以外的操作）。
   * 样式：underline 为页面级的标签栏（标签撑满整行、文字居中，下有轨道，选中标签的文字下有横条；放不下时横向滚动，
   * 还有标签的一端显示滚动按钮）；pill 为分组切换（胶囊按钮，放不下时换行）。
   * 未选中的面板只隐藏、不卸载，其中未保存的输入切换后仍在；面板的第一项内容应可聚焦（面板本身不进 Tab 顺序）。
   * 选中标签下有指针（横条），切换时滑到新标签下。键盘：← → 切换（首尾循环），Home、End 到第一个、最后一个。
   * 可排序（reorderable）时：拖动标签（鼠标；触屏按住片刻后拖动）到两个标签之间，或 Alt + ← → 前移、后移一位，发出 move。
   * 值与顺序只来自 props：切换只发出 update:modelValue，排序只发出 move
   */
  const props = withDefaults(
    defineProps<{
      modelValue: string
      tabs: readonly UiTab[]
      /** 标签栏的无障碍名称 */
      label?: string
      variant?: 'underline' | 'pill'
      /** 可拖动排序 */
      reorderable?: boolean
    }>(),
    { label: undefined, variant: 'underline', reorderable: false }
  )

  const emit = defineEmits<{
    'update:modelValue': [value: string]
    /** 把标签移到第 index 位（从 0 起） */
    move: [value: string, index: number]
  }>()

  /** 指针、轨道相对标签栏的位置与宽度（px） */
  interface IndicatorBox {
    readonly left: number
    readonly width: number
  }

  const NO_BOX: IndicatorBox = { left: 0, width: 0 }

  /** 落点：插到第 index 个标签之前（index 为标签数时放到最后）；指示线相对标签栏的位置（px） */
  interface DropTarget {
    readonly index: number
    readonly left: number
    readonly top: number
    readonly height: number
  }

  /** 标签栏的一行（放不下时换行）：各标签的序号 */
  interface TabRow {
    readonly top: number
    readonly height: number
    readonly items: readonly number[]
  }

  /** 按下的标签：拖动开始前也有 */
  interface Press {
    readonly value: string
    readonly pointerId: number
    readonly x: number
    readonly y: number
    readonly touch: boolean
  }

  /** 标签栏的两端 */
  type Side = 'start' | 'end'

  /** 鼠标、触控笔移动超过这段距离（px）才算拖动；触屏按住这么久（ms）后才能拖动，之前移动是在滚动页面 */
  const DRAG_THRESHOLD = 4
  const LONG_PRESS_MS = 300
  const REORDER_KEYS = 'Alt+ArrowLeft Alt+ArrowRight'
  const SIDES: readonly Side[] = ['start', 'end']
  /** 两端滚动按钮的宽度（px，同样式）：选中的标签滚到按钮以外；点按钮滚过一屏，减去两端按钮盖住的部分 */
  const SCROLL_BUTTON_WIDTH = 40
  /** 判断滚到头时容许的误差（px）：缩放比例不是整数时滚动位置带小数 */
  const EDGE_TOLERANCE = 1
  /** Octicons 的 chevron-left、chevron-right（16px） */
  const CHEVRONS: Readonly<Record<Side, string>> = {
    start:
      'M9.78 12.78a.75.75 0 0 1-1.06 0L4.47 8.53a.75.75 0 0 1 0-1.06l4.25-4.25a.751.751 0 0 1 1.042.018.751.751 0 0 1 .018 1.042L6.06 8l3.72 3.72a.75.75 0 0 1 0 1.06Z',
    end: 'M6.22 3.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.751.751 0 0 1-1.042-.018.751.751 0 0 1-.018-1.042L9.94 8 6.22 4.28a.75.75 0 0 1 0-1.06Z'
  }

  const id = useId()
  const tabId = (value: string): string => `${id}-tab-${value}`
  const panelId = (value: string): string => `${id}-panel-${value}`

  const list = useTemplateRef<HTMLElement>('list')
  const indicator = shallowRef<IndicatorBox>(NO_BOX)
  const track = shallowRef<IndicatorBox>(NO_BOX)
  /** 两端是否还有滚出去的标签（显示该端的滚动按钮） */
  const edges = shallowRef<Readonly<Record<Side, boolean>>>({ start: false, end: false })
  /** 切换过标签后指针才过渡：打开页面、尺寸变化时直接到位，不从左端滑过来 */
  const animated = ref(false)
  let observer: ResizeObserver | undefined
  let press: Press | undefined
  let pressTimer: ReturnType<typeof setTimeout> | undefined
  /** 拖动结束时的那次单击不切换标签 */
  let suppressClick = false
  /** 拖动中的标签、相对按下处的位移、落点 */
  const dragging = ref<string>()
  const offset = shallowRef({ x: 0, y: 0 })
  const drop = shallowRef<DropTarget>()

  /** Tab 键停留的标签：选中的标签；没有选中时为第一个，标签栏仍能用键盘进入 */
  const focusable = computed(() => (props.tabs.some(tab => tab.value === props.modelValue) ? props.modelValue : props.tabs[0]?.value))

  /**
   * 横条直接设宽度，位置用 transform：不用 1px 宽的元素横向放大——缩放比例不是整数时（如系统缩放 125%），
   * 1px 先按 1 个物理像素绘制再放大，横条比文字短一截
   */
  const indicatorStyle = computed(() => ({
    width: `${indicator.value.width}px`,
    transform: `translateX(${indicator.value.left}px)`
  }))
  const trackStyle = computed(() => ({ width: `${track.value.width}px`, transform: `translateX(${track.value.left}px)` }))
  const dragStyle = computed(() => ({ transform: `translate(${offset.value.x}px, ${offset.value.y}px)` }))
  /** 宽 2px 的竖线，中线在两个标签之间 */
  const dropStyle = computed(() =>
    drop.value ? { transform: `translate(${drop.value.left - 1}px, ${drop.value.top}px)`, height: `${drop.value.height}px` } : undefined
  )

  function buttons(): HTMLElement[] {
    return list.value ? [...list.value.querySelectorAll<HTMLElement>('[role="tab"]')] : []
  }

  /**
   * 元素相对标签栏内容的位置与宽度（含标签栏的横向滚动）。取实际排版的位置（可为小数；offsetLeft 等取整，
   * 英文等文字宽度带小数时差出半个像素）；所在的标签正在拖动（平移了）时减去平移量
   */
  function boxOf(element: Element, button: HTMLElement, container: HTMLElement): IndicatorBox {
    const shift = button.hasAttribute('data-dragging') ? offset.value.x : 0
    const origin = container.getBoundingClientRect().left + container.clientLeft - container.scrollLeft + shift
    const { left, width } = element.getBoundingClientRect()
    return { left: left - origin, width }
  }

  /** 标签的文字（连同计数）的位置与宽度，不含标签两侧的内边距 */
  function textBox(button: HTMLElement, container: HTMLElement): IndicatorBox | undefined {
    const first = button.querySelector<HTMLElement>('.ui-tab-text')
    if (!first) return undefined
    const last = button.querySelector<HTMLElement>('.ui-tab-count') ?? first
    const start = boxOf(first, button, container)
    const end = boxOf(last, button, container)
    return { left: start.left, width: end.left + end.width - start.left }
  }

  /**
   * 指针移到选中的标签下，与该标签的文字等宽，没有选中时不显示；轨道从第一个标签起到最后一个标签止（标签撑满整行时即整行）。
   * 文字按加粗后的宽度占位（见 .ui-tab-text），选中后变粗也不用重算
   */
  function place(): void {
    const container = list.value
    const items = buttons()
    const selected = items[props.tabs.findIndex(tab => tab.value === props.modelValue)]
    const first = items[0]
    const last = items.at(-1)
    if (!container || !first || !last) {
      indicator.value = NO_BOX
      track.value = NO_BOX
      return
    }
    indicator.value = (selected && textBox(selected, container)) ?? NO_BOX
    const start = boxOf(first, first, container)
    const end = boxOf(last, last, container)
    track.value = { left: start.left, width: end.left + end.width - start.left }
  }

  /** 两端的滚动按钮：放不下（可横向滚动）且该端还有标签时显示 */
  function updateEdges(): void {
    const container = list.value
    if (!container || props.variant !== 'underline') return
    const max = container.scrollWidth - container.clientWidth
    const start = container.scrollLeft > EDGE_TOLERANCE
    const end = container.scrollLeft < max - EDGE_TOLERANCE
    if (start !== edges.value.start || end !== edges.value.end) edges.value = { start, end }
  }

  /** 指针、轨道重新定位，两端的滚动按钮随之显示、隐藏 */
  function layout(): void {
    place()
    updateEdges()
  }

  /** 点两端的滚动按钮：向该端滚过一屏，减去两端按钮盖住的部分 */
  function scrollTabs(side: Side): void {
    const container = list.value
    if (!container) return
    const step = Math.max(container.clientWidth - SCROLL_BUTTON_WIDTH * 2, SCROLL_BUTTON_WIDTH)
    container.scrollBy({ left: side === 'start' ? -step : step })
  }

  /** 选中的标签整个露出来：在可见范围外、或被两端的滚动按钮盖住时，标签栏滚过去 */
  function reveal(): void {
    const container = list.value
    const button = buttons()[props.tabs.findIndex(tab => tab.value === props.modelValue)]
    if (!container || !button || props.variant !== 'underline') return
    if (container.scrollWidth - container.clientWidth <= EDGE_TOLERANCE) return
    const { left, width } = boxOf(button, button, container)
    const view = container.scrollLeft
    if (left - SCROLL_BUTTON_WIDTH < view) container.scrollTo({ left: Math.max(0, left - SCROLL_BUTTON_WIDTH) })
    else if (left + width + SCROLL_BUTTON_WIDTH > view + container.clientWidth) {
      container.scrollTo({ left: left + width + SCROLL_BUTTON_WIDTH - container.clientWidth })
    }
  }

  /** 观察标签栏与各标签的尺寸：窗口变宽变窄、字体加载完成、界面语言切换后，指针、轨道与两端的滚动按钮随之调整 */
  function observe(): void {
    observer?.disconnect()
    if (list.value) observer?.observe(list.value)
    for (const button of buttons()) observer?.observe(button)
  }

  function select(value: string): void {
    if (value !== props.modelValue) emit('update:modelValue', value)
  }

  function onClick(value: string): void {
    if (suppressClick) {
      suppressClick = false
      return
    }
    select(value)
  }

  /** 发出移动；标签原有焦点时，父组件改了顺序（DOM 节点移动会失去焦点）后聚焦回去 */
  function move(value: string, index: number): void {
    const focused = document.activeElement?.id === tabId(value)
    emit('move', value, index)
    if (focused) void nextTick(() => document.getElementById(tabId(value))?.focus())
  }

  /** Alt + ← →：前移、后移一位（到头时不动） */
  function onReorderKey(event: KeyboardEvent, index: number): void {
    if (!props.reorderable || (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight')) return
    event.preventDefault()
    const tab = props.tabs[index]
    const to = index + (event.key === 'ArrowLeft' ? -1 : 1)
    if (tab && to >= 0 && to < props.tabs.length) move(tab.value, to)
  }

  function onKeydown(event: KeyboardEvent): void {
    const items = buttons()
    const index = items.indexOf(event.target as HTMLElement)
    if (index === -1) return
    // Alt + 方向键只用来排序：不可排序时留给浏览器（后退、前进）
    if (event.altKey) {
      onReorderKey(event, index)
      return
    }
    let next: number
    switch (event.key) {
      case 'ArrowRight':
        next = (index + 1) % items.length
        break
      case 'ArrowLeft':
        next = (index - 1 + items.length) % items.length
        break
      case 'Home':
        next = 0
        break
      case 'End':
        next = items.length - 1
        break
      default:
        return
    }
    event.preventDefault()
    const tab = props.tabs[next]
    if (tab) select(tab.value)
    items[next]?.focus()
  }

  /** 各行的标签（同一行的 offsetTop 相同；拖动中的标签只是平移，不影响排版） */
  function rowsOf(items: readonly HTMLElement[]): TabRow[] {
    const rows: TabRow[] = []
    items.forEach((item, index) => {
      const last = rows.at(-1)
      if (last && item.offsetTop === last.top) rows[rows.length - 1] = { ...last, items: [...last.items, index] }
      else rows.push({ top: item.offsetTop, height: item.offsetHeight, items: [index] })
    })
    return rows
  }

  /** 指针处的落点：指针所在行中，指针在哪两个标签之间；落在拖动的标签原位两侧（不移动）时为 undefined */
  function dropAt(clientX: number, clientY: number, value: string): DropTarget | undefined {
    const container = list.value
    if (!container) return undefined
    const items = buttons()
    const box = container.getBoundingClientRect()
    const x = clientX - box.left + container.scrollLeft
    const y = clientY - box.top + container.scrollTop
    const rows = rowsOf(items)
    const row = rows.find(item => y < item.top + item.height) ?? rows.at(-1)
    if (!row) return undefined
    const before = row.items.find(index => {
      const item = items[index]
      return item !== undefined && x < item.offsetLeft + item.offsetWidth / 2
    })
    const last = items[row.items.at(-1) ?? -1]
    const index = before ?? (row.items.at(-1) ?? -1) + 1
    const from = props.tabs.findIndex(tab => tab.value === value)
    if (index === from || index === from + 1) return undefined
    const gap = Number.parseFloat(getComputedStyle(container).columnGap) || 0
    const target = before === undefined ? undefined : items[before]
    const left = target ? target.offsetLeft - gap / 2 : (last ? last.offsetLeft + last.offsetWidth : 0) + gap / 2
    return { index, left, top: row.top, height: row.height }
  }

  const preventDefault = (event: Event): void => event.preventDefault()

  function startDrag(): void {
    pressTimer = undefined
    if (!press) return
    dragging.value = press.value
    offset.value = { x: 0, y: 0 }
    document.addEventListener('selectstart', preventDefault)
  }

  function endDrag(): void {
    clearTimeout(pressTimer)
    pressTimer = undefined
    press = undefined
    dragging.value = undefined
    drop.value = undefined
    window.removeEventListener('pointermove', onPointerMove)
    window.removeEventListener('pointerup', onPointerUp)
    window.removeEventListener('pointercancel', endDrag)
    window.removeEventListener('keydown', onDragKeydown, true)
    window.removeEventListener('touchmove', onTouchMove)
    window.removeEventListener('contextmenu', preventDefault)
    document.removeEventListener('selectstart', preventDefault)
  }

  function onPointerDown(event: PointerEvent, value: string): void {
    suppressClick = false
    if (!props.reorderable || props.tabs.length < 2 || !event.isPrimary || event.button !== 0 || press) return
    press = { value, pointerId: event.pointerId, x: event.clientX, y: event.clientY, touch: event.pointerType === 'touch' }
    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', onPointerUp)
    window.addEventListener('pointercancel', endDrag)
    window.addEventListener('keydown', onDragKeydown, true)
    if (!press.touch) return
    // 触屏：拖动开始后不滚动页面、不弹出长按菜单
    window.addEventListener('touchmove', onTouchMove, { passive: false })
    window.addEventListener('contextmenu', preventDefault)
    pressTimer = setTimeout(startDrag, LONG_PRESS_MS)
  }

  function onPointerMove(event: PointerEvent): void {
    if (!press || event.pointerId !== press.pointerId) return
    const x = event.clientX - press.x
    const y = event.clientY - press.y
    if (dragging.value === undefined) {
      if (Math.hypot(x, y) < DRAG_THRESHOLD) return
      if (press.touch) {
        endDrag()
        return
      }
      startDrag()
    }
    offset.value = { x, y }
    drop.value = dragging.value === undefined ? undefined : dropAt(event.clientX, event.clientY, dragging.value)
  }

  function onPointerUp(event: PointerEvent): void {
    if (!press || event.pointerId !== press.pointerId) return
    const value = dragging.value
    const target = drop.value
    endDrag()
    if (value === undefined) return
    suppressClick = true
    if (!target) return
    const from = props.tabs.findIndex(tab => tab.value === value)
    move(value, target.index > from ? target.index - 1 : target.index)
  }

  /** 拖动中按 Escape：取消 */
  function onDragKeydown(event: KeyboardEvent): void {
    if (event.key !== 'Escape' || dragging.value === undefined) return
    event.preventDefault()
    event.stopPropagation()
    endDrag()
  }

  function onTouchMove(event: TouchEvent): void {
    if (dragging.value !== undefined) event.preventDefault()
  }

  watch(
    () => props.modelValue,
    () => {
      animated.value = true
      place()
      reveal()
    },
    { flush: 'post' }
  )

  // 标签增减、文字变化后重新定位，新增的标签也观察
  watch(
    () => props.tabs,
    () => {
      observe()
      layout()
    },
    { flush: 'post' }
  )

  onMounted(() => {
    if (typeof ResizeObserver !== 'undefined') observer = new ResizeObserver(layout)
    observe()
    layout()
    reveal()
  })

  onBeforeUnmount(() => {
    observer?.disconnect()
    observer = undefined
    endDrag()
  })
</script>

<style scoped>
  .ui-tabs {
    display: grid;
    gap: 12px;
    min-width: 0;
  }

  /* 标签栏与右侧的操作：操作按钮与第一行标签对齐 */
  .ui-tabs-head {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    min-width: 0;
  }

  .ui-tabs-actions {
    display: flex;
    flex: none;
    align-items: center;
    gap: 8px;
  }

  /* 标签栏与两端的滚动按钮 */
  .ui-tabs-scroller {
    position: relative;
    display: flex;
    flex: 1 1 auto;
    min-width: 0;
  }

  /* 标签栏：放不下时横向滚动（窄屏、英文界面），不显示滚动条；点滚动按钮、选中被挡住的标签时平滑滚动 */
  .ui-tabs-list {
    position: relative;
    display: flex;
    flex: 1 1 auto;
    gap: 8px;
    min-width: 0;
    padding-bottom: 8px;
    overflow-x: auto;
    scroll-behavior: smooth;
    scrollbar-width: none;
  }

  .ui-tabs-list::-webkit-scrollbar {
    display: none;
  }

  /*
   * 滚动按钮：标签栏放不下时，在还有标签的一端显示；盖在标签栏这一端，渐隐到页面底色。
   * 高同标签，不盖住下方的轨道与横条；隐藏时淡出后不再响应点按
   */
  .ui-tabs-scroll {
    position: absolute;
    top: 0;
    z-index: 3;
    display: flex;
    align-items: center;
    width: 40px;
    height: var(--gcn-control-md);
    padding: 0;
    color: var(--gcn-fg-muted);
    border: 0;
    cursor: pointer;
    opacity: 0;
    visibility: hidden;
    -webkit-tap-highlight-color: transparent;
    transition:
      opacity var(--gcn-duration-fast) var(--gcn-ease),
      visibility 0s linear var(--gcn-duration-fast);
  }

  .ui-tabs-scroll.is-shown {
    opacity: 1;
    visibility: visible;
    transition-delay: 0s;
  }

  .ui-tabs-scroll-start {
    left: 0;
    justify-content: flex-start;
    background: linear-gradient(to right, var(--gcn-bg) 50%, transparent);
  }

  .ui-tabs-scroll-end {
    right: 0;
    justify-content: flex-end;
    background: linear-gradient(to left, var(--gcn-bg) 50%, transparent);
  }

  /* 图标外一圈圆形的点按反馈 */
  .ui-tabs-scroll svg {
    box-sizing: content-box;
    padding: 4px;
    border-radius: 50%;
    transition: background-color var(--gcn-duration-fast) var(--gcn-ease);
  }

  .ui-tabs-scroll:hover {
    color: var(--gcn-fg);
  }

  .ui-tabs-scroll:hover svg {
    background: var(--gcn-invisible-hover-bg);
  }

  .ui-tabs-scroll:active svg {
    background: var(--gcn-invisible-active-bg);
    transition-duration: 0s;
  }

  .ui-tab {
    position: relative;
    display: inline-flex;
    flex: none;
    align-items: center;
    height: var(--gcn-control-md);
    padding: 0 8px;
    font: inherit;
    font-size: 14px;
    line-height: 20px;
    white-space: nowrap;
    color: var(--gcn-fg);
    background: transparent;
    border: 0;
    border-radius: var(--gcn-radius);
    cursor: pointer;
    user-select: none;
    -webkit-tap-highlight-color: transparent;
    transition: background-color var(--gcn-duration-fast) var(--gcn-ease);
  }

  /* 页面级标签栏：标签撑满整行（放不下时不压缩，横向滚动），文字居中。只选自己的标签：面板里嵌套的标签页不受影响 */
  .ui-tabs-underline > .ui-tabs-head > .ui-tabs-scroller > .ui-tabs-list > .ui-tab {
    flex: 1 0 auto;
    justify-content: center;
  }

  .ui-tab:hover {
    background: var(--gcn-invisible-hover-bg);
  }

  /* 按下立即变色，松开时再过渡回去 */
  .ui-tab:active {
    background: var(--gcn-invisible-active-bg);
    transition-duration: 0s;
  }

  /* 焦点框画在标签以内：标签栏是滚动容器，画在外面会被裁掉 */
  .ui-tab:focus-visible {
    outline-offset: -2px;
  }

  .ui-tab[aria-selected='true'] {
    font-weight: 600;
  }

  /* 按加粗后的宽度占位：选中时字变粗，标签不变宽，后面的标签不跟着移动 */
  .ui-tab-text {
    display: inline-flex;
    flex-direction: column;
    align-items: center;
  }

  .ui-tab-text::after {
    height: 0;
    overflow: hidden;
    font-weight: 600;
    visibility: hidden;
    content: attr(data-text);
    /* 替代文本为空：读屏不把占位的文字算进标签名 */
    content: attr(data-text) / '';
  }

  /* 轨道：从第一个标签到最后一个标签（撑满整行时即整行；放不下时连同滚动出去的部分） */
  .ui-tabs-track {
    position: absolute;
    bottom: 0;
    left: 0;
    height: 1px;
    pointer-events: none;
    background: var(--gcn-border);
  }

  /* 指针：选中标签下的横条，盖住轨道 */
  .ui-tabs-indicator {
    position: absolute;
    bottom: 0;
    left: 0;
    height: 2px;
    pointer-events: none;
    background: var(--gcn-tab-indicator);
  }

  .ui-tabs-indicator-animated {
    transition:
      transform var(--gcn-duration-base) var(--gcn-ease-out),
      width var(--gcn-duration-base) var(--gcn-ease-out);
  }

  /* 拖动中的标签：跟随指针，浮在其他标签之上；不透底（选中的胶囊底色是半透明的） */
  .ui-tab[data-dragging] {
    z-index: 2;
    cursor: grabbing;
    background-color: var(--gcn-bg);
    box-shadow: var(--gcn-shadow-overlay);
    transition: none;
  }

  .ui-tabs-pill .ui-tab[data-dragging][aria-selected='true'] {
    background-image: linear-gradient(
      color-mix(in srgb, var(--gcn-accent) 10%, transparent),
      color-mix(in srgb, var(--gcn-accent) 10%, transparent)
    );
  }

  /* 落点：两个标签之间的竖线 */
  .ui-tabs-drop {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 1;
    width: 2px;
    pointer-events: none;
    background: var(--gcn-accent);
    border-radius: 1px;
  }

  .ui-tabs-panel {
    min-width: 0;
  }

  /* 计数：灰底圆角，选中时随文字变色 */
  .ui-tab-count {
    min-width: 20px;
    margin-left: 6px;
    padding: 0 6px;
    font-size: 12px;
    font-weight: 500;
    line-height: 18px;
    text-align: center;
    font-variant-numeric: tabular-nums;
    color: var(--gcn-fg-muted);
    background: var(--gcn-neutral-bg);
    border-radius: 999px;
  }

  /* 胶囊：放不下时换行，不滚动；没有轨道、横条，选中的描主题色边、浅主题色底 */
  .ui-tabs-pill .ui-tabs-list {
    flex-wrap: wrap;
    gap: 6px;
    padding-bottom: 0;
    overflow: visible;
  }

  .ui-tabs-pill .ui-tab {
    height: var(--gcn-control-sm);
    padding: 0 10px;
    font-size: 13px;
    border: 1px solid var(--gcn-border);
    border-radius: 999px;
  }

  .ui-tabs-pill .ui-tab[aria-selected='true'] {
    color: var(--gcn-accent);
    background: color-mix(in srgb, var(--gcn-accent) 10%, transparent);
    border-color: var(--gcn-accent);
  }

  .ui-tabs-pill .ui-tab[aria-selected='true'] .ui-tab-count {
    color: inherit;
    background: color-mix(in srgb, var(--gcn-accent) 16%, transparent);
  }

  /* 焦点框画在胶囊外：标签栏不滚动，不会被裁掉 */
  .ui-tabs-pill .ui-tab:focus-visible {
    outline-offset: 2px;
  }

  @media (prefers-reduced-motion: reduce) {
    .ui-tab,
    .ui-tabs-indicator-animated,
    .ui-tabs-scroll,
    .ui-tabs-scroll svg {
      transition: none;
    }

    .ui-tabs-list {
      scroll-behavior: auto;
    }
  }

  /* 高对比度模式：背景色（轨道、指针）由系统接管，改用系统色；滚动按钮的渐隐底色不显示，改用不透明的系统底色 */
  @media (forced-colors: active) {
    .ui-tabs-scroll {
      color: ButtonText;
      background: Canvas;
      forced-color-adjust: none;
    }

    .ui-tabs-track {
      background: CanvasText;
      forced-color-adjust: none;
    }

    .ui-tabs-indicator {
      background: Highlight;
      forced-color-adjust: none;
    }

    .ui-tabs-pill .ui-tab[aria-selected='true'] {
      border: 2px solid Highlight;
    }

    .ui-tabs-drop {
      background: Highlight;
      forced-color-adjust: none;
    }
  }
</style>
