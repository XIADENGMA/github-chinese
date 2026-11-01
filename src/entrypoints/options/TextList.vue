<template>
  <div class="text-list">
    <form class="text-list-form" @submit.prevent="onAdd">
      <UiInput
        ref="input"
        v-model="draft"
        mono
        :aria-label="label"
        :placeholder="placeholder"
        spellcheck="false"
        autocomplete="off"
      />
      <UiButton type="submit" variant="primary" :disabled="draft.trim() === ''">{{ t('add') }}</UiButton>
    </form>

    <div v-if="rows.length > 0" ref="frame" class="list-frame">
      <table class="list-table list-table-inline">
        <thead>
          <tr>
            <th scope="col">{{ label }}</th>
            <th scope="col">
              <span class="sr-only">{{ t('actions') }}</span>
            </th>
          </tr>
        </thead>
        <tbody>
          <TextListRow
            v-for="item in rows"
            :key="list.rowKey(item)"
            :item="item"
            :label="label"
            @edit="onEdit"
            @remove="onRemove"
          />
        </tbody>
      </table>
    </div>
    <p v-else class="blankslate" data-test="list-empty">{{ empty }}</p>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, useTemplateRef } from 'vue'
import UiButton from '../../components/ui/UiButton.vue'
import UiInput from '../../components/ui/UiInput.vue'
import { useI18n } from '../../components/ui-preferences'
import TextListRow from './TextListRow.vue'
import type { UseTextList } from './useTextList'

/** 单列的文字列表（排除路径、屏蔽规则）：上方添加；列表新添加的在前，可行内改写、删除 */
const props = defineProps<{
  list: UseTextList
  /** 列名，也是输入框的无障碍名称 */
  label: string
  /** 添加框的占位文字：写法示例 */
  placeholder: string
  /** 列表为空时的文字 */
  empty: string
}>()

const { t } = useI18n()
const draft = ref('')
const input = useTemplateRef<InstanceType<typeof UiInput>>('input')
const frame = useTemplateRef<HTMLElement>('frame')
const rows = computed(() => props.list.rows.value)

async function onAdd(): Promise<void> {
  if (draft.value.trim() === '' || !(await props.list.add(draft.value))) return
  draft.value = ''
  // 新添加的在最前
  if (frame.value) frame.value.scrollTop = 0
  input.value?.focus()
}

/** 行内改写：成功显示规范化后的值，失败恢复原值 */
async function onEdit(event: Event, item: string): Promise<void> {
  const field = event.target as HTMLInputElement
  field.value = (await props.list.edit(item, field.value)) ?? item
}

/**
 * 删除。焦点原在列表里（键盘操作；Chromium 点击按钮也会聚焦）时，移到原位置这一条（原来的下一条，没有时上一条）的删除按钮；
 * 删空时移到添加框。不移的话焦点随被删的行落到页面开头
 */
async function onRemove(item: string): Promise<void> {
  const index = rows.value.indexOf(item)
  const hadFocus = frame.value?.contains(document.activeElement) ?? false
  if (!(await props.list.remove(item)) || !hadFocus) return
  await nextTick()
  const buttons = frame.value?.querySelectorAll<HTMLButtonElement>('.text-list-action button')
  const next = buttons?.[Math.min(index, buttons.length - 1)]
  if (next) next.focus()
  else input.value?.focus()
}
</script>

<style scoped>
.text-list {
  display: grid;
  gap: 12px;
}

/* 输入框可收窄到 0：固有宽度不撑开表单 */
.text-list-form {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 8px;
}
</style>
