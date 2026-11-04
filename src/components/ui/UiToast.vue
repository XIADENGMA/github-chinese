<template>
  <div class="ui-toast" :class="`ui-toast-${tone}`" @pointerenter="setHovered(true)" @pointerleave="setHovered(false)">
    <svg class="ui-toast-icon" viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
      <circle cx="8" cy="8" r="7" fill="currentColor" />
      <path
        v-if="tone === 'success'"
        class="ui-toast-glyph"
        d="M5 8.25l2 2 4-4.5"
        fill="none"
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path v-else class="ui-toast-glyph" d="M5.75 5.75l4.5 4.5m0-4.5l-4.5 4.5" fill="none" stroke-width="1.5" stroke-linecap="round" />
    </svg>
    <span class="ui-toast-text"><slot /></span>
  </div>
</template>

<script setup lang="ts">
  import { onBeforeUnmount, onMounted } from 'vue'
  import type { UiToastTone } from './types'

  /**
   * 提示条：图标标明成功或失败，文字由插槽给出。显示 duration 毫秒后发出 close；
   * 指针停在上面、页面切到后台时暂停计时，之后接着走剩余的时间
   */
  const { tone, duration } = defineProps<{
    tone: UiToastTone
    /** 显示时长（ms） */
    duration: number
  }>()

  const emit = defineEmits<{ close: [] }>()

  let remaining = duration
  let startedAt = 0
  let timer: ReturnType<typeof setTimeout> | undefined
  let hovered = false

  function start(): void {
    if (timer !== undefined || hovered || document.hidden) return
    startedAt = Date.now()
    timer = setTimeout(() => emit('close'), remaining)
  }

  function pause(): void {
    if (timer === undefined) return
    clearTimeout(timer)
    timer = undefined
    remaining -= Date.now() - startedAt
  }

  function setHovered(value: boolean): void {
    hovered = value
    if (value) pause()
    else start()
  }

  function onVisibilityChange(): void {
    if (document.hidden) pause()
    else start()
  }

  onMounted(() => {
    document.addEventListener('visibilitychange', onVisibilityChange)
    start()
  })

  onBeforeUnmount(() => {
    document.removeEventListener('visibilitychange', onVisibilityChange)
    clearTimeout(timer)
  })
</script>

<style scoped>
  /* 浮层样式与下拉列表一致；长文字换行 */
  .ui-toast {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    max-width: 100%;
    padding: 8px 14px 8px 12px;
    font-size: 14px;
    font-weight: 500;
    line-height: 20px;
    color: var(--gcn-fg);
    overflow-wrap: anywhere;
    pointer-events: auto;
    background: var(--gcn-overlay-bg);
    border: 1px solid var(--gcn-overlay-border);
    border-radius: var(--gcn-radius-overlay);
    box-shadow: var(--gcn-shadow-overlay);
  }

  /* 16px 图标与 20px 行高的首行居中 */
  .ui-toast-icon {
    flex: none;
    margin-top: 2px;
  }

  .ui-toast-success .ui-toast-icon {
    color: var(--gcn-success-fg);
  }

  .ui-toast-danger .ui-toast-icon {
    color: var(--gcn-danger-fg);
  }

  /* 圆内的勾、叉取浮层底色，像是镂空的 */
  .ui-toast-glyph {
    stroke: var(--gcn-overlay-bg);
  }

  /* 高对比度模式：圆随系统文字色，勾、叉取系统底色 */
  @media (forced-colors: active) {
    .ui-toast-glyph {
      stroke: Canvas;
    }
  }
</style>
