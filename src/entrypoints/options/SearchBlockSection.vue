<template>
  <div class="section">
    <ul class="switches">
      <li>
        <UiSwitch :label="t('purifySearch')" :checked="settings.purifySearch" :disabled="!ready" @change="setPurify" />
      </li>
    </ul>
    <TextList :list="list" :label="t('searchBlockRules')" :placeholder="PLACEHOLDER" :empty="t(loadFailed ? 'loadFailed' : 'noRules')" />
  </div>
</template>

<script setup lang="ts">
  import UiSwitch from '../../components/ui/UiSwitch.vue'
  import { useI18n } from '../../components/ui-preferences'
  import TextList from './TextList.vue'
  import { useSearchBlock } from './useSearchBlock'

  /** 写法示例：所有者、存储库、关键词（见 shared/search-block） */
  const PLACEHOLDER = '@octocat · octocat/hello-world · hello world'

  const { t } = useI18n()
  const list = useSearchBlock()
  const { settings, ready, loadFailed, setPurify } = list
</script>
