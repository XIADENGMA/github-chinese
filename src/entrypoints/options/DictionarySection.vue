<template>
  <div ref="root" class="section" data-test="builtin-dictionary">
    <div class="dictionary-tools">
      <UiSelect
        v-model="selectedLocale"
        class="dictionary-language"
        :options="LOCALE_OPTIONS"
        :aria-label="t('pageLanguage')"
        data-test="dictionary-language"
      />
      <UiInput v-model="query" class="dictionary-search" type="search" :aria-label="t('search')" :placeholder="t('search')" />
      <span v-if="state === 'ready'" class="dictionary-count" data-test="dictionary-count">
        {{ t('entryCount', { count: rows.length }) }}
      </span>
    </div>

    <div v-if="state === 'ready' && rows.length > 0" ref="viewport" class="list-frame dictionary-viewport">
      <table class="list-table dictionary" :aria-rowcount="rows.length + 1">
        <colgroup>
          <col class="dictionary-col-source" />
          <col class="dictionary-col-target" />
          <col class="dictionary-col-scope" />
        </colgroup>
        <thead>
          <tr aria-rowindex="1">
            <th scope="col">{{ t('source') }}</th>
            <th scope="col">{{ t('target') }}</th>
            <th scope="col">{{ t('scopes') }}</th>
          </tr>
        </thead>
        <tbody>
          <template v-for="item in items" :key="item.kind === 'row' ? item.index : item.key">
            <tr v-if="item.kind === 'gap'" class="dictionary-gap" aria-hidden="true">
              <td colspan="3" :style="{ height: `${item.height}px` }"></td>
            </tr>
            <tr v-else :data-index="item.index" :aria-rowindex="item.index + 2">
              <td :title="item.data.source">{{ item.data.source }}</td>
              <td :title="item.data.target">{{ item.data.target }}</td>
              <td class="dictionary-scope">{{ item.data.page ?? t('scopeGlobal') }}</td>
            </tr>
          </template>
        </tbody>
      </table>
      <UiBackToTop :label="t('backToTop')" />
    </div>
    <div v-else class="blankslate dictionary-status">
      <span data-test="dictionary-empty">{{ t(emptyMessage) }}</span>
      <UiButton v-if="state === 'failed'" size="sm" data-test="dictionary-retry" @click="retry">{{ t('retry') }}</UiButton>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed, useTemplateRef, watch } from 'vue'
  import type { UiSelectOption } from '../../components/ui/types'
  import UiBackToTop from '../../components/ui/UiBackToTop.vue'
  import UiButton from '../../components/ui/UiButton.vue'
  import UiInput from '../../components/ui/UiInput.vue'
  import UiSelect from '../../components/ui/UiSelect.vue'
  import { useI18n } from '../../components/ui-preferences'
  import { useNearViewport } from '../../components/useNearViewport'
  import { useVirtualList } from '../../components/useVirtualList'
  import type { MessageKey } from '../../i18n'
  import { isPageLocale, LANGUAGE_NAMES, PAGE_LOCALES } from '../../shared/locale'
  import { useBuiltinDictionary } from './useBuiltinDictionary'

  /** 行高估计：单元格上下内边距 16 + 一行文字 20；实际行高渲染后测量 */
  const ROW_HEIGHT = 36
  /** 语言名用该语言书写并标注语言 */
  const LOCALE_OPTIONS: readonly UiSelectOption[] = PAGE_LOCALES.map(value => ({ value, label: LANGUAGE_NAMES[value], lang: value }))

  const { t } = useI18n()
  /** 词库较大（简体约 1.7 MB）：接近视口时才加载 */
  const near = useNearViewport(useTemplateRef<HTMLElement>('root'))
  const { locale, query, rows, state, retry } = useBuiltinDictionary({ enabled: near })
  const viewport = useTemplateRef<HTMLElement>('viewport')
  const { items, scrollToTop } = useVirtualList({ source: rows, viewport, estimatedHeight: ROW_HEIGHT })

  const selectedLocale = computed({
    get: () => locale.value,
    set: (value: string) => {
      if (isPageLocale(value)) locale.value = value
    }
  })

  /** 列表为空时：加载中、加载失败，或搜索无结果 */
  const emptyMessage = computed<MessageKey>(() => {
    if (state.value === 'loading') return 'stateLoading'
    return state.value === 'failed' ? 'loadFailed' : 'notFound'
  })

  // 换语言、搜索结果从头显示
  watch([query, locale], () => scrollToTop())
</script>

<style scoped>
  /* 语言按内容宽，搜索框占满其余，条数靠右 */
  .dictionary-tools {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .dictionary-language {
    flex: none;
    min-width: 140px;
  }

  .dictionary-search {
    flex: 1 1 auto;
    min-width: 0;
  }

  /* 状态文字与重试按钮居中排成一行 */
  .dictionary-status {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }

  .dictionary-count {
    flex: none;
    font-size: 12px;
    font-variant-numeric: tabular-nums;
    color: var(--gcn-fg-muted);
    white-space: nowrap;
  }

  /* 限高、表头见 options.css 的 .list-frame；虚拟列表替换行与占位时不做滚动锚定，滚动位置不跳 */
  .dictionary-viewport {
    overflow-anchor: none;
  }

  /* 固定列宽，单元格不换行（各行等高，见 useVirtualList），完整内容见悬停提示 */
  .dictionary {
    table-layout: fixed;
  }

  .dictionary-col-source {
    width: 46%;
  }

  .dictionary-col-target {
    width: 38%;
  }

  .dictionary td {
    padding: 8px 12px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  /* 分隔线用内阴影：不占高度，各行等高（边框会让第一行矮 1px，虚拟列表按第一行的高度计算） */
  .dictionary tbody tr + tr td {
    box-shadow: inset 0 1px 0 var(--gcn-border-muted);
  }

  .dictionary-scope {
    font-family: var(--gcn-font-mono);
    font-size: 12px;
    color: var(--gcn-fg-muted);
  }

  .dictionary .dictionary-gap td {
    padding: 0;
    box-shadow: none;
  }

  @media (max-width: 640px) {
    .dictionary-tools {
      flex-wrap: wrap;
    }
  }
</style>
