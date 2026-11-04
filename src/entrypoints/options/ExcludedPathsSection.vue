<template>
  <section class="section" aria-labelledby="excluded-title">
    <div class="section-head">
      <h2 id="excluded-title" class="section-title">{{ t('excludedPaths') }}</h2>
      <TransferTools @import="importScope($event, 'excluded')" @export="exportScope('excluded')" />
    </div>
    <TextList :list="list" :label="t('path')" :placeholder="PLACEHOLDER" :empty="t(loadFailed ? 'loadFailed' : 'noPaths')" />
  </section>
</template>

<script setup lang="ts">
  import { useI18n } from '../../components/ui-preferences'
  import TextList from './TextList.vue'
  import TransferTools from './TransferTools.vue'
  import { useBackup } from './useBackup'
  import { useExcludedPaths } from './useExcludedPaths'

  /** 写法示例：* 匹配一段路径 */
  const PLACEHOLDER = '/*/*/wiki'

  const { t } = useI18n()
  const list = useExcludedPaths()
  const { loadFailed } = list
  const { exportScope, importScope } = useBackup()
</script>
