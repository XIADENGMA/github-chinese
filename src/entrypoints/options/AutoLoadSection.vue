<template>
  <div class="section">
    <ul class="switches">
      <li>
        <UiSwitch
          :label="t('autoLoad')"
          :checked="settings.autoLoad"
          :disabled="!ready"
          data-test="auto-load"
          @change="save({ autoLoad: $event })"
        />
      </li>
    </ul>

    <section class="section scopes" aria-labelledby="auto-load-scopes-title">
      <h2 id="auto-load-scopes-title" class="section-title">{{ t('scopes') }}</h2>
      <ul class="switches">
        <li v-for="scope in SCOPES" :key="scope.value">
          <UiSwitch
            :label="t(scope.label)"
            :checked="settings.autoLoadScopes.includes(scope.value)"
            :disabled="!ready || !settings.autoLoad"
            :data-test="`auto-load-scope-${scope.value}`"
            @change="setScope(scope.value, $event)"
          />
        </li>
      </ul>
    </section>
  </div>
</template>

<script setup lang="ts">
  import UiSwitch from '../../components/ui/UiSwitch.vue'
  import { useI18n } from '../../components/ui-preferences'
  import type { MessageKey } from '../../i18n'
  import { AUTO_LOAD_SCOPES, toggleAutoLoadScope, type AutoLoadScope } from '../../shared/auto-load'
  import { useSettingsSave } from './useSettingsSave'

  const SCOPE_LABELS: Readonly<Record<AutoLoadScope, MessageKey>> = {
    search: 'autoLoadSearch',
    issues: 'autoLoadIssues',
    pulls: 'autoLoadPulls',
    discussions: 'autoLoadDiscussions',
    actions: 'autoLoadActions',
    releases: 'autoLoadReleases',
    tags: 'autoLoadTags',
    commits: 'autoLoadCommits',
    dashboard: 'autoLoadDashboard',
    profiles: 'autoLoadProfiles',
    sidePanel: 'autoLoadSidePanel',
    other: 'autoLoadOther'
  }
  const SCOPES = AUTO_LOAD_SCOPES.map(value => ({ value, label: SCOPE_LABELS[value] }))

  const { t } = useI18n()
  const { settings, ready, save } = useSettingsSave()

  async function setScope(scope: AutoLoadScope, on: boolean): Promise<void> {
    // 按写入前的最新设置计算：连续开关几项时不丢失
    await save(current => ({ autoLoadScopes: toggleAutoLoadScope(current.autoLoadScopes, scope, on) }))
  }
</script>

<style scoped>
  /* 范围与上方开关隔开 */
  .scopes {
    margin-top: 12px;
  }
</style>
