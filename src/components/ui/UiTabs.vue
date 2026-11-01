<template>
  <div class="ui-tabs">
    <div ref="list" role="tablist" class="ui-tabs-list" :aria-label="label" @keydown="onKeydown">
      <button
        v-for="tab in tabs"
        :id="tabId(tab.value)"
        :key="tab.value"
        type="button"
        role="tab"
        class="ui-tab"
        :aria-selected="tab.value === modelValue"
        :aria-controls="panelId(tab.value)"
        :tabindex="tab.value === focusable ? 0 : -1"
        @click="select(tab.value)"
      >
        <span class="ui-tab-text" :data-text="tab.label">{{ tab.label }}</span>
        <UiRipple />
      </button>
      <span
        class="ui-tabs-indicator"
        :class="{ 'ui-tabs-indicator-animated': animated }"
        :style="indicatorStyle"
        aria-hidden="true"
        data-test="tabs-indicator"
      ></span>
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
      <slot :name="tab.value" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, shallowRef, useId, useTemplateRef, watch } from 'vue'
import type { UiTab } from './types'
import UiRipple from './UiRipple.vue'

/**
 * 标签页（WAI-ARIA tabs，选中即切换）：标签栏与各标签的面板，面板内容由与 tab.value 同名的插槽给出。
 * 未选中的面板只隐藏、不卸载，其中未保存的输入切换后仍在；面板的第一项内容应可聚焦（面板本身不进 Tab 顺序）。
 * 选中标签下有指针（横条），切换时滑到新标签下。键盘：← → 切换（首尾循环），Home、End 到第一个、最后一个。
 * 值只来自 modelValue：切换只发出 update:modelValue
 */
const props = defineProps<{
  modelValue: string
  tabs: readonly UiTab[]
  /** 标签栏的无障碍名称 */
  label?: string
}>()

const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

/** 指针相对标签栏的位置与宽度（px） */
interface IndicatorBox {
  readonly left: number
  readonly width: number
}

const id = useId()
const tabId = (value: string): string => `${id}-tab-${value}`
const panelId = (value: string): string => `${id}-panel-${value}`

const list = useTemplateRef<HTMLElement>('list')
const indicator = shallowRef<IndicatorBox>({ left: 0, width: 0 })
/** 切换过标签后指针才过渡：打开页面、尺寸变化时直接到位，不从左端滑过来 */
const animated = ref(false)
let observer: ResizeObserver | undefined

/** Tab 键停留的标签：选中的标签；没有选中时为第一个，标签栏仍能用键盘进入 */
const focusable = computed(() =>
  props.tabs.some((tab) => tab.value === props.modelValue) ? props.modelValue : props.tabs[0]?.value,
)

/** 宽 1px 的横条按标签宽度横向缩放：移动、伸缩都只用 transform */
const indicatorStyle = computed(() => ({
  transform: `translateX(${indicator.value.left}px) scaleX(${indicator.value.width})`,
}))

function buttons(): HTMLElement[] {
  return list.value ? [...list.value.querySelectorAll<HTMLElement>('[role="tab"]')] : []
}

/** 指针移到选中的标签下，与标签等宽；没有选中时不显示 */
function place(): void {
  const button = buttons()[props.tabs.findIndex((tab) => tab.value === props.modelValue)]
  indicator.value = button ? { left: button.offsetLeft, width: button.offsetWidth } : { left: 0, width: 0 }
}

/** 观察各标签的尺寸：字体加载完成、界面语言切换后标签变宽变窄，指针随之调整 */
function observe(): void {
  observer?.disconnect()
  for (const button of buttons()) observer?.observe(button)
}

function select(value: string): void {
  if (value !== props.modelValue) emit('update:modelValue', value)
}

function onKeydown(event: KeyboardEvent): void {
  const items = buttons()
  const index = items.indexOf(event.target as HTMLElement)
  if (index === -1) return
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

watch(
  () => props.modelValue,
  () => {
    animated.value = true
    place()
  },
  { flush: 'post' },
)

// 标签增减、文字变化后重新定位，新增的标签也观察
watch(
  () => props.tabs,
  () => {
    observe()
    place()
  },
  { flush: 'post' },
)

onMounted(() => {
  if (typeof ResizeObserver !== 'undefined') observer = new ResizeObserver(place)
  observe()
  place()
})

onBeforeUnmount(() => {
  observer?.disconnect()
  observer = undefined
})
</script>

<style scoped>
.ui-tabs {
  display: grid;
  gap: 12px;
  min-width: 0;
}

/*
 * 标签栏：放不下时横向滚动，不显示滚动条（窄屏、英文界面）。
 * 底部的分隔线画在背景上而非边框：滚动容器裁剪到边框以内，画成边框时指针盖不住它
 */
.ui-tabs-list {
  position: relative;
  display: flex;
  gap: 8px;
  min-width: 0;
  padding-bottom: 8px;
  overflow-x: auto;
  scrollbar-width: none;
  background: linear-gradient(var(--gcn-border), var(--gcn-border)) left bottom / 100% 1px no-repeat;
}

.ui-tabs-list::-webkit-scrollbar {
  display: none;
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

/* 指针：选中标签下的横条，盖住分隔线 */
.ui-tabs-indicator {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 1px;
  height: 2px;
  pointer-events: none;
  background: var(--gcn-tab-indicator);
  transform-origin: left;
}

.ui-tabs-indicator-animated {
  transition: transform var(--gcn-duration-base) var(--gcn-ease-out);
}

.ui-tabs-panel {
  min-width: 0;
}

@media (prefers-reduced-motion: reduce) {
  .ui-tab,
  .ui-tabs-indicator-animated {
    transition: none;
  }
}

/* 高对比度模式：背景（分隔线、指针）由系统接管，改用系统色的边框与指针 */
@media (forced-colors: active) {
  .ui-tabs-list {
    background: none;
    border-bottom: 1px solid CanvasText;
  }

  .ui-tabs-indicator {
    background: Highlight;
    forced-color-adjust: none;
  }
}
</style>
