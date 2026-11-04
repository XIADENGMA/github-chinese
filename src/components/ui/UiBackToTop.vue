<template>
  <div ref="root" class="ui-back-to-top" :class="{ 'is-shown': shown }">
    <button
      type="button"
      class="ui-back-to-top-button"
      :aria-label="label"
      :title="label"
      data-test="back-to-top"
      @click="toTop"
      @focus="focused = true"
      @blur="focused = false"
    >
      <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" focusable="false">
        <path :d="ARROW_UP" fill="currentColor" />
      </svg>
    </button>
  </div>
</template>

<script setup lang="ts">
  import { computed, onBeforeUnmount, onMounted, ref, useTemplateRef } from 'vue'

  /**
   * 返回顶部：放在可滚动的列表（容器）里，作为最后一个子元素；固定在列表可见区域的右下角。
   * 向下滚过半屏后显示（同时在列表末尾留出按钮的高度），点按后列表滚回顶部（减少动态效果时直接回到顶部）。
   * 按钮有焦点时不隐藏：键盘操作回到顶部后焦点仍在按钮上
   */
  const { label } = defineProps<{
    /** 按钮的名称（悬停提示同） */
    label: string
  }>()

  /** Octicons 的 arrow-up（16px） */
  const ARROW_UP =
    'M3.47 7.78a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 0l4.25 4.25a.751.751 0 0 1-.018 1.042.751.751 0 0 1-1.042.018L9 4.81v7.44a.75.75 0 0 1-1.5 0V4.81L4.53 7.78a.75.75 0 0 1-1.06 0Z'

  const root = useTemplateRef<HTMLElement>('root')
  const scrolled = ref(false)
  const focused = ref(false)
  const shown = computed(() => scrolled.value || focused.value)
  let container: HTMLElement | null = null

  /** 滚过列表可见高度的一半后显示 */
  function update(): void {
    if (container) scrolled.value = container.scrollTop > container.clientHeight / 2
  }

  function toTop(): void {
    const reduced = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches
    container?.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' })
  }

  onMounted(() => {
    container = root.value?.parentElement ?? null
    container?.addEventListener('scroll', update, { passive: true })
    update()
  })

  onBeforeUnmount(() => {
    container?.removeEventListener('scroll', update)
    container = null
  })
</script>

<style scoped>
  /*
   * 粘在列表可见区域的底部；只有按钮响应点按，下面的行照常可点。层级高于各行与固定的表头。
   * 隐藏时高为 0、不占位置；显示时在列表末尾留出按钮的高度，滚到底时最后一行在按钮上方，不被挡住
   */
  .ui-back-to-top {
    position: sticky;
    bottom: 12px;
    z-index: 3;
    display: flex;
    align-items: flex-end;
    justify-content: flex-end;
    height: 0;
    padding-right: 12px;
    pointer-events: none;
  }

  .ui-back-to-top.is-shown {
    height: calc(var(--gcn-control-md) + 12px);
  }

  .ui-back-to-top-button {
    display: inline-flex;
    flex: none;
    align-items: center;
    justify-content: center;
    width: var(--gcn-control-md);
    height: var(--gcn-control-md);
    padding: 0;
    color: var(--gcn-fg-muted);
    pointer-events: auto;
    cursor: pointer;
    background: var(--gcn-overlay-bg);
    border: 1px solid var(--gcn-overlay-border);
    border-radius: 50%;
    box-shadow: var(--gcn-shadow-overlay);
    opacity: 0;
    visibility: hidden;
    transform: translateY(4px);
    -webkit-tap-highlight-color: transparent;
    transition:
      opacity var(--gcn-duration-fast) var(--gcn-ease),
      transform var(--gcn-duration-fast) var(--gcn-ease),
      color var(--gcn-duration-fast) var(--gcn-ease),
      background-color var(--gcn-duration-fast) var(--gcn-ease),
      visibility 0s linear var(--gcn-duration-fast);
  }

  .is-shown > .ui-back-to-top-button {
    opacity: 1;
    visibility: visible;
    transform: none;
    transition-delay: 0s;
  }

  .ui-back-to-top-button:hover {
    color: var(--gcn-fg);
    background-color: color-mix(in srgb, var(--gcn-overlay-bg), var(--gcn-fg) 6%);
  }

  .ui-back-to-top-button:active {
    background-color: color-mix(in srgb, var(--gcn-overlay-bg), var(--gcn-fg) 10%);
    transition-duration: 0s;
  }

  @media (prefers-reduced-motion: reduce) {
    .ui-back-to-top-button {
      transform: none;
      transition: none;
    }
  }
</style>
