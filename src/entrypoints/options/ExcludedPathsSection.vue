<template>
  <section class="section" aria-labelledby="excluded-title">
    <h2 id="excluded-title" class="section-title">{{ t('excludedPaths') }}</h2>
    <TextList :list="list" :label="t('path')" :placeholder="PLACEHOLDER" :empty="t(loadFailed ? 'loadFailed' : 'noPaths')" />
  </section>
</template>

<script setup lang="ts">
  import { useI18n } from '../../components/ui-preferences'
  import TextList from './TextList.vue'
  import { useExcludedPaths } from './useExcludedPaths'

  /** 写法示例：* 匹配一段路径 */
  const PLACEHOLDER = '/*/*/wiki'

  const { t } = useI18n()
  const list = useExcludedPaths()
  const { loadFailed } = list
</script>
