<template>
  <tr>
    <td>
      <UiInput
        inline
        mono
        :model-value="item"
        :aria-label="label"
        spellcheck="false"
        autocomplete="off"
        @change="emit('edit', $event, item)"
      />
    </td>
    <td class="text-list-action">
      <UiButton variant="danger" size="sm" :aria-label="t('deleteEntry', { source: item })" @click="emit('remove', item)">
        {{ t('delete') }}
      </UiButton>
    </td>
  </tr>
</template>

<script setup lang="ts">
  import UiButton from '../../components/ui/UiButton.vue'
  import UiInput from '../../components/ui/UiInput.vue'
  import { useI18n } from '../../components/ui-preferences'

  /**
   * 文字列表的一行：行内改写，删除。
   * 单独成组件：列表重渲染（添加框输入、其他条目变化）时这一行的属性与处理函数不变、不跟着更新，
   * 输入框里未提交的修改不会被回写成原值
   */
  defineProps<{
    item: string
    /** 列名：输入框的无障碍名称 */
    label: string
  }>()

  const emit = defineEmits<{
    edit: [event: Event, item: string]
    remove: [item: string]
  }>()

  const { t } = useI18n()
</script>

<style scoped>
  td {
    padding: 6px 8px;
    vertical-align: middle;
    transition: background-color var(--gcn-duration-fast) var(--gcn-ease);
  }

  /* 分隔线同自定义词条（CustomEntryRow.vue）：内阴影，不占高度 */
  tr + tr td {
    box-shadow: inset 0 1px 0 var(--gcn-border-muted);
  }

  tr:hover td {
    background: var(--gcn-bg-muted);
  }

  .text-list-action {
    width: 1%;
    white-space: nowrap;
  }
</style>
