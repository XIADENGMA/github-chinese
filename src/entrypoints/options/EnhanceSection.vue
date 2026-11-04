<template>
  <div class="enhance">
    <ul class="switches">
      <li v-for="key in SWITCHES" :key="key">
        <UiSwitch :label="t(key)" :checked="settings[key]" :disabled="!ready" @change="setSwitch(key, $event)" />
      </li>
    </ul>

    <section class="section" aria-labelledby="new-tab-title">
      <h2 id="new-tab-title" class="section-title">{{ t('newTab') }}</h2>
      <ul class="switches">
        <li>
          <UiSwitch
            :label="t('enable')"
            :checked="settings.newTab"
            :disabled="!ready"
            data-test="new-tab"
            @change="setSwitch('newTab', $event)"
          />
        </li>
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
  import { createToastSource } from '../../components/toast'
  import UiSwitch from '../../components/ui/UiSwitch.vue'
  import { useI18n } from '../../components/ui-preferences'
  import { useSettings } from '../../components/useSettings'
  import type { MessageKey } from '../../i18n'
  import { NEW_TAB_SCOPES, toggleNewTabScope, type NewTabScope } from '../../shared/new-tab'
  import { normalizeExcludedPath, type SettingsPatch } from '../../shared/settings'
  import TextList from './TextList.vue'
  import { useTextList } from './useTextList'

  type EnhanceSwitch = 'autoLoad' | 'imagePreview' | 'newTab'

  /** 新标签页打开的总开关在下方分区内 */
  const SWITCHES: readonly EnhanceSwitch[] = ['autoLoad', 'imagePreview']

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
  const { settings, ready, loaded, loadFailed, update } = useSettings()
  // 保存失败时在页面顶部提示；再次保存成功时收起
  const toast = createToastSource()

  async function save(patch: SettingsPatch): Promise<boolean> {
    if (!(await update(patch))) {
      toast.show('danger', 'saveFailed')
      return false
    }
    toast.clear()
    return true
  }

  async function setSwitch(key: EnhanceSwitch, value: boolean): Promise<void> {
    await save({ [key]: value })
  }

  async function setScope(scope: NewTabScope, on: boolean): Promise<void> {
    // 按写入前的最新设置计算：连续开关几项时不丢失
    await save(current => ({ newTabScopes: toggleNewTabScope(current.newTabScopes, scope, on) }))
  }

  const paths = useTextList({
    items: computed(() => settings.value.newTabPaths),
    save: next => update({ newTabPaths: next }),
    normalize: normalizeExcludedPath
  })
</script>

<style scoped>
  .enhance {
    display: grid;
    gap: 40px;
  }
</style>
