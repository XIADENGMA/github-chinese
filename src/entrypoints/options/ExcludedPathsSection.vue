<template>
  <section class="section" aria-labelledby="excluded-title">
    <h2 id="excluded-title" class="section-title">{{ t('excludedPaths') }}</h2>
    <UiTextarea
      v-model="text"
      mono
      rows="6"
      spellcheck="false"
      autocomplete="off"
      aria-labelledby="excluded-title"
      :aria-invalid="invalid"
      :placeholder="PLACEHOLDER"
      @input="markDirty"
    />
    <div class="section-actions">
      <UiButton variant="primary" @click="save">{{ t('save') }}</UiButton>
    </div>
  </section>
</template>

<script setup lang="ts">
import UiButton from '../../components/ui/UiButton.vue'
import UiTextarea from '../../components/ui/UiTextarea.vue'
import { useI18n } from '../../components/ui-preferences'
import { useExcludedPaths } from './useExcludedPaths'

const PLACEHOLDER = '/settings\n/*/*/wiki'

const { t } = useI18n()
const { text, invalid, markDirty, save } = useExcludedPaths()
</script>
