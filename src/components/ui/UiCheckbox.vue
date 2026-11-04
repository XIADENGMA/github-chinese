<template>
  <label class="ui-checkbox">
    <input
      ref="input"
      type="checkbox"
      class="ui-checkbox-input"
      :checked="checked"
      :disabled="disabled"
      :aria-label="label"
      @change="onChange"
    />
  </label>
</template>

<script setup lang="ts">
  import { useTemplateRef, watchEffect } from 'vue'

  /**
   * 复选框（列表多选用，无可见标签）：状态由父组件持有，点击只发出新状态。
   * indeterminate 为部分选中（全选框），显示为横线，点击时发出 true。外层留出点击区域，比方框大一圈
   */
  const props = defineProps<{
    checked: boolean
    indeterminate?: boolean
    /** 无障碍名称 */
    label: string
    disabled?: boolean
  }>()

  const emit = defineEmits<{ change: [checked: boolean] }>()

  const input = useTemplateRef<HTMLInputElement>('input')

  // 部分选中只能用 DOM 属性设置
  watchEffect(
    () => {
      if (input.value) input.value.indeterminate = props.indeterminate === true
    },
    { flush: 'post' }
  )

  defineExpose({
    focus: (): void => input.value?.focus()
  })

  function onChange(event: Event): void {
    const field = event.target as HTMLInputElement
    const next = field.checked
    // 显示的状态以父组件为准：先恢复，父组件改了状态再随之更新
    field.checked = props.checked
    field.indeterminate = props.indeterminate === true
    emit('change', next)
  }
</script>

<style scoped>
  /* 点击区域 28×28，方框 16×16 居中 */
  .ui-checkbox {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: var(--gcn-control-sm);
    height: var(--gcn-control-sm);
    margin: -6px;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
  }

  .ui-checkbox:has(:disabled) {
    cursor: not-allowed;
  }

  .ui-checkbox-input {
    flex: none;
    width: 16px;
    height: 16px;
    margin: 0;
    appearance: none;
    cursor: inherit;
    background: var(--gcn-bg) center / 16px 16px no-repeat;
    border: 1px solid var(--gcn-border-emphasis);
    border-radius: 4px;
    transition:
      background-color var(--gcn-duration-fast) var(--gcn-ease),
      border-color var(--gcn-duration-fast) var(--gcn-ease);
  }

  .ui-checkbox:hover .ui-checkbox-input:not(:disabled, :checked, :indeterminate) {
    border-color: var(--gcn-fg-muted);
  }

  /* 选中、部分选中：主题色底（同开关打开），白色勾或横线 */
  .ui-checkbox-input:is(:checked, :indeterminate) {
    background-color: var(--gcn-switch-on);
    border-color: var(--gcn-switch-on);
  }

  .ui-checkbox:hover .ui-checkbox-input:is(:checked, :indeterminate):not(:disabled) {
    background-color: var(--gcn-switch-on-hover);
    border-color: var(--gcn-switch-on-hover);
  }

  .ui-checkbox-input:checked {
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cpath d='M4.5 8.25l2.25 2.25 4.75-5' fill='none' stroke='%23fff' stroke-width='1.75' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
  }

  .ui-checkbox-input:indeterminate {
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cpath d='M4.75 8h6.5' fill='none' stroke='%23fff' stroke-width='1.75' stroke-linecap='round'/%3E%3C/svg%3E");
  }

  .ui-checkbox-input:focus-visible {
    outline-offset: 1px;
  }

  .ui-checkbox-input:disabled {
    opacity: 0.5;
  }

  @media (prefers-reduced-motion: reduce) {
    .ui-checkbox-input {
      transition: none;
    }
  }

  /* 高对比度模式：系统接管颜色，自绘的方框、勾看不出状态；改回系统的复选框 */
  @media (forced-colors: active) {
    .ui-checkbox-input {
      appearance: auto;
    }
  }
</style>
