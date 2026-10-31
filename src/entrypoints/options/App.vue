<template>
  <div class="options">
    <header class="options-header">
      <img class="options-logo" :src="LOGO_URL" width="32" height="32" alt="" />
      <div class="options-brand">
        <h1 class="options-title">{{ t('appName') }}</h1>
        <span v-if="version" class="options-version" data-test="version">v{{ version }}</span>
      </div>
    </header>

    <main class="options-main">
      <ExcludedPathsSection />
      <CustomEntriesSection />
      <AccelerateSection />

      <section class="section" aria-labelledby="about-title">
        <h2 id="about-title" class="section-title">{{ t('about') }}</h2>
        <dl class="pairs">
          <dt>{{ t('githubRepository') }}</dt>
          <dd>
            <a class="link" :href="REPOSITORY_URL" target="_blank" rel="noreferrer" data-test="repository">
              {{ REPOSITORY_LABEL }}
            </a>
          </dd>
        </dl>
      </section>
    </main>

    <ToastHost />
  </div>
</template>

<script setup lang="ts">
import ToastHost from '../../components/ToastHost.vue'
import { useI18n, useUiPreferencesSync } from '../../components/ui-preferences'
import { getExtensionVersion, REPOSITORY_URL } from '../../shared/extension'
import AccelerateSection from './AccelerateSection.vue'
import CustomEntriesSection from './CustomEntriesSection.vue'
import ExcludedPathsSection from './ExcludedPathsSection.vue'

/** 扩展图标（public/ 下的文件）。用绑定而非静态属性：模板里静态的绝对路径会被编译成模块导入 */
const LOGO_URL = '/icon/96.png'
/** 显示的存储库地址：省略协议 */
const REPOSITORY_LABEL = REPOSITORY_URL.replace(/^https:\/\//, '')

useUiPreferencesSync()
const { t } = useI18n()
const version = getExtensionVersion()
</script>

<style scoped>
.options {
  max-width: 760px;
  margin: 0 auto;
  padding: 32px 24px 48px;
}

.options-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding-bottom: 24px;
  margin-bottom: 8px;
}

/* 图标自带深色底：描一圈细边，深色背景上也能看出轮廓 */
.options-logo {
  flex: none;
  border-radius: 7px;
  box-shadow: 0 0 0 1px var(--gcn-border-muted);
}

/* 名称与版本号按文字基线对齐；窄屏时版本号换到下一行 */
.options-brand {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  column-gap: 8px;
  min-width: 0;
}

.options-title {
  font-size: 24px;
  font-weight: 600;
}

.options-version {
  font-size: 14px;
  font-variant-numeric: tabular-nums;
  color: var(--gcn-fg-muted);
  white-space: nowrap;
}

.options-main {
  display: grid;
  gap: 40px;
}

/* 窄屏时值换到名称下方 */
.pairs {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 4px 16px;
  margin: 0;
  padding: 12px 16px;
  border: 1px solid var(--gcn-border);
  border-radius: var(--gcn-radius-lg);
}

.pairs dd {
  min-width: 0;
  margin: 0;
  overflow-wrap: anywhere;
}

.link {
  color: var(--gcn-accent);
  text-decoration: none;
}

.link:hover {
  text-decoration: underline;
  text-underline-offset: 0.2em;
}
</style>
