<template>
  <dialog ref="dialog" class="ui-confirm" :aria-labelledby="titleId" data-test="confirm" @close="close">
    <p :id="titleId" class="ui-confirm-title">{{ title }}</p>
    <div class="ui-confirm-actions">
      <UiButton autofocus data-test="confirm-cancel" @click="close">{{ cancelLabel }}</UiButton>
      <UiButton variant="danger" data-test="confirm-ok" @click="onConfirm">{{ confirmLabel }}</UiButton>
    </div>
  </dialog>
</template>

<script setup lang="ts">
  import { onMounted, useId, useTemplateRef, watch } from 'vue'
  import UiButton from './UiButton.vue'

  /**
   * 确认框（模态 dialog）：标题，取消与确认（危险样式）两个按钮。open 为 true 时打开，焦点在取消上；
   * 点取消、按 Escape 关闭，点确认时关闭并发出 confirm。关闭后焦点回到打开前所在的元素（浏览器负责）
   */
  defineProps<{
    title: string
    confirmLabel: string
    cancelLabel: string
  }>()
  const open = defineModel<boolean>('open', { default: false })
  const emit = defineEmits<{ confirm: [] }>()

  const titleId = useId()
  const dialog = useTemplateRef<HTMLDialogElement>('dialog')

  /** 对话框随 open 打开、关闭 */
  function sync(): void {
    const element = dialog.value
    if (!element || element.open === open.value) return
    if (open.value) element.showModal()
    else element.close()
  }

  function close(): void {
    open.value = false
  }

  function onConfirm(): void {
    close()
    emit('confirm')
  }

  watch(open, sync, { flush: 'post' })
  onMounted(sync)
</script>

<style scoped>
  .ui-confirm {
    width: min(320px, calc(100vw - 32px));
    padding: 16px;
    color: var(--gcn-fg);
    overflow-wrap: anywhere;
    background: var(--gcn-overlay-bg);
    border: 1px solid var(--gcn-overlay-border);
    border-radius: var(--gcn-radius-overlay);
    box-shadow: var(--gcn-shadow-overlay);
  }

  .ui-confirm[open] {
    animation: ui-confirm-in var(--gcn-duration-base) var(--gcn-ease-out);
  }

  .ui-confirm::backdrop {
    background: var(--gcn-backdrop);
  }

  .ui-confirm-title {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
    line-height: 24px;
  }

  .ui-confirm-actions {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    margin-top: 16px;
  }

  @keyframes ui-confirm-in {
    from {
      opacity: 0;
      transform: scale(0.96);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .ui-confirm[open] {
      animation: none;
    }
  }
</style>
