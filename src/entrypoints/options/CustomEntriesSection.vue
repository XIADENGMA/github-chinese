<template>
  <div class="section" data-test="custom-entries">
    <div class="section-tools transfer-tools">
      <UiButton size="sm" @click="fileInput?.click()">{{ t('import') }}</UiButton>
      <UiButton size="sm" :disabled="total === 0" @click="exportFile">{{ t('export') }}</UiButton>
      <input
        ref="fileInput"
        type="file"
        accept=".json,application/json"
        class="sr-only"
        tabindex="-1"
        aria-hidden="true"
        data-test="import-file"
        @change="onFileChange"
      />
    </div>

    <form class="entry-form" @submit.prevent="onAdd">
      <UiInput ref="sourceInput" v-model="source" :aria-label="t('source')" :placeholder="t('source')" />
      <UiInput v-model="target" :aria-label="t('target')" :placeholder="t('target')" />
      <UiButton type="submit" variant="primary" :disabled="!canAdd">{{ t('add') }}</UiButton>
    </form>

    <UiInput ref="searchInput" v-model="query" type="search" :aria-label="t('search')" :placeholder="t('search')" />

    <div v-if="rows.length > 0" ref="viewport" class="list-frame entries-viewport">
      <table class="list-table list-table-inline" :aria-rowcount="rows.length + 1">
        <thead>
          <tr aria-rowindex="1">
            <th scope="col" class="select-cell">
              <UiCheckbox
                ref="selectAll"
                :checked="selection.state.value === 'all'"
                :indeterminate="selection.state.value === 'some'"
                :label="t('selectAll')"
                data-test="select-all"
                @change="selection.toggleAll"
              />
            </th>
            <th scope="col">{{ t('source') }}</th>
            <th scope="col">{{ t('target') }}</th>
            <th scope="col" class="bulk-cell">
              <UiButton v-if="selection.count.value > 0" variant="danger" size="sm" data-test="delete-selected" @click="confirming = true">
                {{ t('deleteCount', { count: selection.count.value }) }}
              </UiButton>
              <span v-else class="sr-only">{{ t('actions') }}</span>
            </th>
          </tr>
        </thead>
        <tbody>
          <template v-for="item in items" :key="item.kind === 'row' ? rowKey(item.data[0]) : item.key">
            <tr v-if="item.kind === 'gap'" class="entries-gap" aria-hidden="true">
              <td colspan="4" :style="{ height: `${item.height}px` }"></td>
            </tr>
            <CustomEntryRow
              v-else
              :entry="item.data"
              :index="item.index"
              :selected="selection.has(item.data[0])"
              @select="selection.toggle"
              @edit="onEdit"
              @remove="onRemove"
            />
          </template>
        </tbody>
      </table>
      <UiBackToTop :label="t('backToTop')" />
    </div>
    <p v-else class="blankslate" data-test="entries-empty">{{ t(emptyMessage) }}</p>
    <UiConfirm
      v-model:open="confirming"
      :title="t('deleteConfirm', { count: selection.count.value })"
      :confirm-label="t('delete')"
      :cancel-label="t('cancel')"
      @confirm="onRemoveSelected"
    />
  </div>
</template>

<script setup lang="ts">
  import { computed, nextTick, ref, useTemplateRef, watch } from 'vue'
  import UiBackToTop from '../../components/ui/UiBackToTop.vue'
  import UiButton from '../../components/ui/UiButton.vue'
  import UiCheckbox from '../../components/ui/UiCheckbox.vue'
  import UiConfirm from '../../components/ui/UiConfirm.vue'
  import UiInput from '../../components/ui/UiInput.vue'
  import { useI18n } from '../../components/ui-preferences'
  import { useSelection } from '../../components/useSelection'
  import { useVirtualList } from '../../components/useVirtualList'
  import type { MessageKey } from '../../i18n'
  import { normalizeEntry, type EntryField, type EntryPair } from '../../shared/custom-entries'
  import CustomEntryRow from './CustomEntryRow.vue'
  import { useCustomEntries } from './useCustomEntries'

  /** 行高估计：单元格上下内边距 12 + 输入框 32；实际行高（如触屏加高的控件）渲染后测量 */
  const ROW_HEIGHT = 44

  const { t } = useI18n()
  const { query, rows, total, loadFailed, rowKey, add, edit, remove, removeMany, importFile, exportFile } = useCustomEntries()
  /** 多选：只选筛选结果中的词条（按原文） */
  const selection = useSelection(() => rows.value.map(([source]) => source))
  /** 删除所选的确认框 */
  const confirming = ref(false)

  const source = ref('')
  const target = ref('')
  const sourceInput = useTemplateRef<InstanceType<typeof UiInput>>('sourceInput')
  const searchInput = useTemplateRef<InstanceType<typeof UiInput>>('searchInput')
  const fileInput = useTemplateRef<HTMLInputElement>('fileInput')
  const selectAll = useTemplateRef<InstanceType<typeof UiCheckbox>>('selectAll')
  const viewport = useTemplateRef<HTMLElement>('viewport')
  const { items, scrollToTop, pin } = useVirtualList({
    source: rows,
    viewport,
    estimatedHeight: ROW_HEIGHT,
    keyOf: row => rowKey(row[0])
  })

  // 搜索结果从头显示
  watch(query, () => scrollToTop())

  const canAdd = computed(() => source.value.trim() !== '' && target.value.trim() !== '')
  /** 列表为空时：没有词条（或读取失败），或搜索无结果 */
  const emptyMessage = computed<MessageKey>(() => {
    if (total.value > 0) return 'notFound'
    return loadFailed.value ? 'loadFailed' : 'noEntries'
  })

  async function onAdd(): Promise<void> {
    if (!canAdd.value) return
    if (!(await add(source.value, target.value))) return
    source.value = ''
    target.value = ''
    // 新词条在最前
    scrollToTop()
    sourceInput.value?.focus()
  }

  /** 行内编辑：成功显示规范化后的值，失败恢复原值 */
  async function onEdit(event: Event, row: EntryPair, field: EntryField): Promise<void> {
    const input = event.target as HTMLInputElement
    const [oldSource, oldTarget] = row
    const source = field === 'source' ? input.value : oldSource
    const target = field === 'target' ? input.value : oldTarget
    const pair = (await edit(oldSource, source, target)) ? normalizeEntry(source, target) : undefined
    input.value = field === 'source' ? (pair?.[0] ?? oldSource) : (pair?.[1] ?? oldTarget)
  }

  /**
   * 删除。焦点原在列表里（键盘操作；Chromium 点击按钮也会聚焦）时，移到原位置这一条（原来的下一条，没有时上一条）的删除按钮；
   * 删空时移到搜索框（有搜索词时）或添加表单。不移的话焦点随被删的行落到页面开头
   */
  async function onRemove(removed: string): Promise<void> {
    const index = rows.value.findIndex(([key]) => key === removed)
    const hadFocus = viewport.value?.contains(document.activeElement) ?? false
    if (!(await remove(removed)) || !hadFocus) return
    await nextTick()
    if (rows.value.length === 0) {
      const input = query.value.trim() === '' ? sourceInput.value : searchInput.value
      input?.focus()
      return
    }
    const next = Math.min(index, rows.value.length - 1)
    // 这一条可能不在渲染范围内（键盘滚开后删除）：先保留渲染，聚焦时浏览器把它滚入视野
    pin(next)
    await nextTick()
    viewport.value?.querySelector<HTMLElement>(`[data-index="${next}"] .entry-action button`)?.focus()
  }

  /** 删除所选。焦点移到全选框；删空时移到搜索框（有搜索词时）或添加表单 */
  async function onRemoveSelected(): Promise<void> {
    if (!(await removeMany([...selection.selected.value]))) return
    selection.clear()
    await nextTick()
    if (selectAll.value) selectAll.value.focus()
    else (query.value.trim() === '' ? sourceInput.value : searchInput.value)?.focus()
  }

  async function onFileChange(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement
    const file = input.files?.[0]
    // 清空以便重复选择同一文件
    input.value = ''
    // 新导入的词条在最前
    if (file && (await importFile(file))) scrollToTop()
  }
</script>

<style scoped>
  /* 两列可收窄到 0：输入框的固有宽度不撑开表单，窄屏（如 Firefox Android）不横向溢出 */
  .entry-form {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) auto;
    gap: 8px;
  }

  /* 限高、表头见 options.css 的 .list-frame；虚拟列表替换行与占位时不做滚动锚定，滚动位置不跳 */
  .entries-viewport {
    overflow-anchor: none;
  }

  /* 未渲染行的占位（数据行的样式见 CustomEntryRow.vue） */
  .entries-gap td {
    padding: 0;
  }
</style>
