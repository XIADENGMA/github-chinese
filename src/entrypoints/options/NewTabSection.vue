<template>
  <div class="section">
    <TransferTools :disabled="!ready" @import="importScope($event, 'new-tab')" @export="exportScope('new-tab')" />
    <ul class="switches">
      <li>
        <UiSwitch
          :label="t('newTab')"
          :checked="settings.newTab"
          :disabled="!ready"
          data-test="new-tab"
          @change="save({ newTab: $event })"
        />
      </li>
    </ul>

    <section class="section scopes" aria-labelledby="new-tab-scopes-title">
      <h2 id="new-tab-scopes-title" class="section-title">{{ t('scopes') }}</h2>
      <ul class="switches">
        <li v-for="scope in SCOPES" :key="scope.value">
          <UiSwitch
            :label="t(scope.label)"
            :checked="settings.newTabScopes.includes(scope.value)"
            :disabled="!ready || !settings.newTab"
            :data-test="`scope-${scope.value}`"
            @change="setScope(scope.value, $event)"
          />
        </li>
      </ul>
      <TextList
        :list="paths"
        :label="t('newTabPaths')"
        :placeholder="PLACEHOLDER"
        :empty="t(loadFailed && !loaded ? 'loadFailed' : 'noPaths')"
      />
    </section>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import UiSwitch from '../../components/ui/UiSwitch.vue'
  import { useI18n } from '../../components/ui-preferences'
  import type { MessageKey } from '../../i18n'
  import { NEW_TAB_SCOPES, toggleNewTabScope, type NewTabScope } from '../../shared/new-tab'
  import { normalizeExcludedPath } from '../../shared/settings'
  import TextList from './TextList.vue'
  import TransferTools from './TransferTools.vue'
  import { useBackup } from './useBackup'
  import { useSettingsSave } from './useSettingsSave'
  import { useTextList } from './useTextList'

  const SCOPE_LABELS: Readonly<Record<NewTabScope, MessageKey>> = {
    external: 'newTabExternal',
    content: 'newTabContent',
    search: 'newTabSearch',
    issues: 'newTabIssues',
    notifications: 'newTabNotifications',
    dashboard: 'newTabDashboard',
    profiles: 'newTabProfiles',
    explore: 'newTabExplore'
  }
  const SCOPES = NEW_TAB_SCOPES.map(value => ({ value, label: SCOPE_LABELS[value] }))

  /** 写法示例：所有存储库的发行版页 */
  const PLACEHOLDER = '/*/*/releases'

  const { t } = useI18n()
  const { settings, ready, loaded, loadFailed, update, save } = useSettingsSave()
  const { exportScope, importScope } = useBackup()

  async function setScope(scope: NewTabScope, on: boolean): Promise<void> {
    // 按写入前的最新设置计算：连续开关几项时不丢失
    await save(current => ({ newTabScopes: toggleNewTabScope(current.newTabScopes, scope, on) }))
  }

  // 自定义页面：添加、改写、删除即时保存（失败提示由 useTextList 负责）
  const paths = useTextList({
    items: computed(() => settings.value.newTabPaths),
    save: next => update({ newTabPaths: next }),
    normalize: normalizeExcludedPath
  })
</script>

<style scoped>
  /* 范围与上方开关隔开 */
  .scopes {
    margin-top: 12px;
  }
</style>
