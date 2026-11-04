<template>
  <div class="toast-host" aria-live="polite">
    <TransitionGroup name="toast">
      <UiToast v-for="toast in toasts" :key="toast.id" :tone="toast.tone" :duration="DURATION[toast.tone]" @close="dismissToast(toast.id)">
        {{ t(toast.key, toast.params) }}
      </UiToast>
    </TransitionGroup>
  </div>
</template>

<script setup lang="ts">
  import { dismissToast, useToasts, type ToastTone } from './toast'
  import UiToast from './ui/UiToast.vue'
  import { useI18n } from './ui-preferences'

  /**
   * 页面顶部居中的操作提示（showToast 发出的）。放在弹出页、设置页的根组件里，一页一个。
   * 容器一直在：读屏在提示加入时朗读（polite，不打断正在读的内容）
   */
  const DURATION: Readonly<Record<ToastTone, number>> = { success: 3000, danger: 5000 }

  const toasts = useToasts()
  const { t } = useI18n()
</script>

<style scoped>
  /* 固定在窗口顶部、水平居中，盖在下拉列表等浮层之上；空白处不挡下面的点击 */
  .toast-host {
    position: fixed;
    top: 12px;
    right: 16px;
    left: 16px;
    z-index: 100;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    pointer-events: none;
  }

  /* 从上方滑入、淡入；收起时向上淡出 */
  .toast-enter-active,
  .toast-leave-active {
    transition:
      opacity var(--gcn-duration-base) var(--gcn-ease-out),
      transform var(--gcn-duration-base) var(--gcn-ease-out);
  }

  .toast-enter-from,
  .toast-leave-to {
    opacity: 0;
    transform: translateY(-8px);
  }

  @media (prefers-reduced-motion: reduce) {
    .toast-enter-from,
    .toast-leave-to {
      transform: none;
    }
  }
</style>
