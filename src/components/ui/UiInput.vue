<template>
  <span class="ui-input" :class="{ 'ui-input-search': isSearch() }" v-bind="attrs().root">
    <svg v-if="isSearch()" class="ui-input-icon" viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
      <circle cx="7" cy="7" r="4.75" fill="none" stroke="currentColor" stroke-width="1.5" />
      <path d="M10.5 10.5 14 14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
    </svg>
    <input
      ref="input"
      v-bind="attrs().field"
      v-model="model"
      class="ui-field ui-input-field"
      :class="{ 'ui-input-inline': inline, 'ui-input-mono': mono }"
    />
  </span>
</template>

<script setup lang="ts">
  import { computed, useAttrs, useTemplateRef } from 'vue'
  import { splitAttrs, type SplitAttrs } from './attrs'

  /**
   * 单行输入框。class、style 落在外层（布局与宽度）；type、placeholder、aria-*、change 等其余属性与事件落在原生 input 上。
   * type="search" 时左侧显示放大镜。
   * 不保存自己的值：显示的值只来自 modelValue（v-model），父组件可直接改写 DOM 恢复原值。
   * 内部仍用原生 v-model：输入法组字期间不更新、不回写
   */
  defineOptions({ inheritAttrs: false })

  const props = defineProps<{
    modelValue?: string
    /** 行内编辑（如表格单元格）：静止时无边框、透明底，悬停、聚焦时显示 */
    inline?: boolean
    /** 等宽字体（地址、代码） */
    mono?: boolean
  }>()

  const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

  const model = computed({
    get: () => props.modelValue ?? '',
    set: (value: string) => emit('update:modelValue', value)
  })

  // attrs 不是响应式的：渲染时读取
  const rawAttrs = useAttrs()
  const attrs = (): SplitAttrs => splitAttrs(rawAttrs)
  const isSearch = (): boolean => rawAttrs.type === 'search'

  const input = useTemplateRef<HTMLInputElement>('input')

  defineExpose({
    focus(): void {
      input.value?.focus()
    }
  })
</script>

<style scoped>
  .ui-input {
    position: relative;
    display: block;
    min-width: 0;
  }

  .ui-input-icon {
    position: absolute;
    top: 50%;
    left: 10px;
    color: var(--gcn-fg-muted);
    pointer-events: none;
    transform: translateY(-50%);
  }

  .ui-input-search .ui-input-field {
    padding-left: 32px;
  }

  .ui-input-mono {
    font-family: var(--gcn-font-mono);
  }

  .ui-input-field[type='search']::-webkit-search-cancel-button {
    cursor: pointer;
  }

  .ui-input-inline:not(:hover, :focus-visible, [aria-invalid='true']) {
    background: transparent;
    border-color: transparent;
    box-shadow: none;
  }
</style>
