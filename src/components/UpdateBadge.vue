<template>
  <a
    v-if="newVersion"
    class="update-badge"
    :href="releaseUrl(newVersion)"
    target="_blank"
    rel="noreferrer"
    :aria-label="label"
    :title="label"
    data-test="update"
  >
    {{ t('newVersion') }}
  </a>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { releaseUrl } from '../shared/update-check'
import { useI18n } from './ui-preferences'
import { useUpdateCheck } from './useUpdateCheck'

const { t } = useI18n()
const { newVersion } = useUpdateCheck()
const label = computed(() => (newVersion.value ? t('newVersionLabel', { version: newVersion.value }) : undefined))
</script>

<style scoped>
/* 跟在版本号后：描边胶囊，与版本号按文字基线对齐 */
.update-badge {
  padding: 0 7px;
  font-size: 12px;
  font-weight: 500;
  line-height: 18px;
  color: var(--gcn-accent);
  white-space: nowrap;
  text-decoration: none;
  border: 1px solid currentColor;
  border-radius: 999px;
  transition: background-color var(--gcn-duration-fast) var(--gcn-ease);
}

.update-badge:hover {
  background: var(--gcn-invisible-hover-bg);
}
</style>
