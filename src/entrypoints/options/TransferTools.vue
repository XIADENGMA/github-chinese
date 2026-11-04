<template>
  <div class="section-tools transfer-tools">
    <UiButton size="sm" :disabled="disabled" @click="input?.click()">{{ importLabel ?? t('import') }}</UiButton>
    <UiButton size="sm" :disabled="disabled" @click="emit('export')">{{ exportLabel ?? t('export') }}</UiButton>
    <input
      ref="input"
      type="file"
      accept=".json,application/json"
      class="sr-only"
      tabindex="-1"
      aria-hidden="true"
      data-test="backup-file"
      @change="onChange"
    />
  </div>
</template>

<script setup lang="ts">
  import { useTemplateRef } from 'vue'
  import UiButton from '../../components/ui/UiButton.vue'
  import { useI18n } from '../../components/ui-preferences'

  /** 导入、导出按钮：导入时选择 JSON 文件，发出 import；导出发出 export */
  defineProps<{
    importLabel?: string
    exportLabel?: string
    disabled?: boolean
  }>()

  const emit = defineEmits<{ import: [file: File]; export: [] }>()

  const { t } = useI18n()
  const input = useTemplateRef<HTMLInputElement>('input')

  function onChange(event: Event): void {
    const field = event.target as HTMLInputElement
    const file = field.files?.[0]
    // 清空以便重复选择同一文件
    field.value = ''
    if (file) emit('import', file)
  }
</script>
