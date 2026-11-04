<template>
  <tr :data-index="index" :aria-rowindex="index + 2">
    <td class="select-cell">
      <UiCheckbox :checked="selected" :label="t('selectItem', { item: entry[0] })" @change="emit('select', entry[0], $event)" />
    </td>
    <td>
      <UiInput inline :model-value="entry[0]" :aria-label="t('source')" @change="emit('edit', $event, entry, 'source')" />
    </td>
    <td>
      <UiInput inline :model-value="entry[1]" :aria-label="t('target')" @change="emit('edit', $event, entry, 'target')" />
    </td>
    <td class="entry-action">
      <UiButton variant="danger" size="sm" :aria-label="t('deleteEntry', { source: entry[0] })" @click="emit('remove', entry[0])">
        {{ t('delete') }}
      </UiButton>
    </td>
  </tr>
</template>

<script setup lang="ts">
  import UiButton from '../../components/ui/UiButton.vue'
  import UiCheckbox from '../../components/ui/UiCheckbox.vue'
  import UiInput from '../../components/ui/UiInput.vue'
  import { useI18n } from '../../components/ui-preferences'
  import type { EntryField, EntryPair } from '../../shared/custom-entries'

  /**
   * 自定义词条列表的一行：选择，原文、译文行内编辑，删除。
   * 单独成组件：列表滚动时父组件重渲染，这一行的属性与处理函数不变、不跟着更新，
   * 输入框里未提交的修改不会被 v-model 回写成原值
   */
  defineProps<{
    entry: EntryPair
    /** 在列表（筛选结果）中的序号，从 0 起；读屏的行号接在表头之后 */
    index: number
    selected: boolean
  }>()

  const emit = defineEmits<{
    select: [source: string, selected: boolean]
    edit: [event: Event, entry: EntryPair, field: EntryField]
    remove: [source: string]
  }>()

  const { t } = useI18n()
</script>

<style scoped>
  td {
    padding: 6px 8px;
    vertical-align: middle;
    transition: background-color var(--gcn-duration-fast) var(--gcn-ease);
  }

  /* 分隔线用内阴影，不占高度：各行等高，虚拟列表按行高计算占位 */
  tr + tr td {
    box-shadow: inset 0 1px 0 var(--gcn-border-muted);
  }

  tr:hover td {
    background: var(--gcn-bg-muted);
  }

  .entry-action {
    width: 1%;
    white-space: nowrap;
  }
</style>
