<template>
  <div class="section">
    <TransferTools @import="importScope($event, 'enterprise')" @export="exportScope('enterprise')" />
    <div v-if="pending.length > 0" class="pending" data-test="pending-sites">
      <span class="pending-label">{{ t('pendingSites') }}</span>
      <span class="pending-hosts">{{ pending.join(', ') }}</span>
      <span class="pending-actions">
        <UiButton size="sm" @click="dismissPending">{{ t('cancel') }}</UiButton>
        <UiButton size="sm" variant="primary" @click="authorizePending">{{ t('authorize') }}</UiButton>
      </span>
    </div>
    <TextList :list="list" :label="t('enterpriseSites')" :placeholder="PLACEHOLDER" :empty="t(loadFailed ? 'loadFailed' : 'noSites')" />
  </div>
</template>

<script setup lang="ts">
  import UiButton from '../../components/ui/UiButton.vue'
  import { useI18n } from '../../components/ui-preferences'
  import TextList from './TextList.vue'
  import TransferTools from './TransferTools.vue'
  import { useBackup } from './useBackup'
  import { useEnterpriseSites } from './useEnterpriseSites'

  /** 写法示例：主机名（也可粘贴地址） */
  const PLACEHOLDER = 'github.example.com'

  const { t } = useI18n()
  const { list, loadFailed, pending, authorizePending, dismissPending } = useEnterpriseSites()
  const { exportScope, importScope } = useBackup()
</script>

<style scoped>
  /* 待授权：标签、站点、操作同一行，放不下时站点换行 */
  .pending {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px 12px;
    padding: 8px 8px 8px 16px;
    background: var(--gcn-attention-bg);
    border: 1px solid color-mix(in srgb, var(--gcn-attention-fg) 40%, transparent);
    border-radius: var(--gcn-radius-lg);
  }

  .pending-label {
    font-weight: 600;
    color: var(--gcn-attention-fg);
  }

  .pending-hosts {
    flex: 1 1 auto;
    min-width: 0;
    font-family: var(--gcn-font-mono);
    font-size: 12px;
    overflow-wrap: anywhere;
  }

  .pending-actions {
    display: flex;
    gap: 8px;
    margin-left: auto;
  }
</style>
