<template>
  <div class="builtin-rules" :class="{ 'is-off': !enabled }" data-test="builtin-rules">
    <div class="builtin-tools">
      <UiInput v-model="query" class="builtin-search" type="search" :aria-label="t('search')" :placeholder="t('search')" />
      <span class="builtin-count" data-test="builtin-count">{{ t('entryCount', { count: rows.length }) }}</span>
    </div>

    <div v-if="rows.length > 0" ref="viewport" class="list-frame builtin-viewport">
      <table class="list-table builtin-table" :aria-rowcount="rows.length + 1">
        <thead>
          <tr aria-rowindex="1">
            <th scope="col">{{ t('purifyBuiltin') }}</th>
          </tr>
        </thead>
        <tbody>
          <template v-for="item in items" :key="item.kind === 'row' ? item.data : item.key">
            <tr v-if="item.kind === 'gap'" class="builtin-gap" aria-hidden="true">
              <td :style="{ height: `${item.height}px` }"></td>
            </tr>
            <tr v-else :data-index="item.index" :aria-rowindex="item.index + 2">
              <td>{{ item.data }}</td>
            </tr>
          </template>
        </tbody>
      </table>
      <UiBackToTop :label="t('backToTop')" />
    </div>
    <p v-else class="blankslate" data-test="builtin-empty">{{ t('notFound') }}</p>
  </div>
</template>

<script setup lang="ts">
  import { computed, ref, useTemplateRef, watch } from 'vue'
  import UiBackToTop from '../../components/ui/UiBackToTop.vue'
  import UiInput from '../../components/ui/UiInput.vue'
  import { useI18n } from '../../components/ui-preferences'
  import { useVirtualList } from '../../components/useVirtualList'
  import { BUILTIN_BLOCK_RULES } from '../../shared/search-block-builtin'

  /** 内置屏蔽规则（只读）：可搜索；只渲染可见的行。关闭内置规则时列表变淡 */
  defineProps<{ enabled: boolean }>()

  /** 行高估计：单元格上下内边距 16 + 一行文字 20；实际行高渲染后测量 */
  const ROW_HEIGHT = 36

  const { t } = useI18n()
  const query = ref('')
  const rows = computed(() => {
    const words = query.value.trim().toLowerCase().split(/\s+/).filter(Boolean)
    if (words.length === 0) return BUILTIN_BLOCK_RULES
    return BUILTIN_BLOCK_RULES.filter(rule => {
      const text = rule.toLowerCase()
      return words.every(word => text.includes(word))
    })
  })
  const viewport = useTemplateRef<HTMLElement>('viewport')
  const { items, scrollToTop } = useVirtualList({ source: rows, viewport, estimatedHeight: ROW_HEIGHT })

  // 搜索结果从头显示
  watch(query, () => scrollToTop())
</script>

<style scoped>
  .builtin-rules {
    display: grid;
    gap: 8px;
    transition: opacity 120ms ease;
  }

  .builtin-rules.is-off {
    opacity: 0.6;
  }

  /* 搜索框占满，条数靠右 */
  .builtin-tools {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .builtin-search {
    flex: 1 1 auto;
    min-width: 0;
  }

  .builtin-count {
    flex: none;
    font-size: 12px;
    font-variant-numeric: tabular-nums;
    color: var(--gcn-fg-muted);
    white-space: nowrap;
  }

  /* 虚拟列表替换行与占位时不做滚动锚定，滚动位置不跳 */
  .builtin-viewport {
    overflow-anchor: none;
  }

  .builtin-table {
    table-layout: fixed;
  }

  /* 单元格不换行（各行等高，见 useVirtualList） */
  .builtin-table td {
    padding: 8px 12px;
    overflow: hidden;
    font-family: var(--gcn-font-mono);
    font-size: 12px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  /* 分隔线用内阴影：不占高度，各行等高 */
  .builtin-table tbody tr + tr td {
    box-shadow: inset 0 1px 0 var(--gcn-border-muted);
  }

  .builtin-table .builtin-gap td {
    padding: 0;
    box-shadow: none;
  }

  @media (prefers-reduced-motion: reduce) {
    .builtin-rules {
      transition: none;
    }
  }
</style>
