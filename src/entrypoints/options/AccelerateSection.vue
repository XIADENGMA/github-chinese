<template>
  <div class="section">
    <ul class="switches">
      <li v-for="key in SWITCHES" :key="key">
        <UiSwitch :label="t(key)" :checked="settings[key]" :disabled="!ready" @change="setSwitch(key, $event)" />
      </li>
    </ul>

    <div class="section-tools sources-tools">
      <UiButton size="sm" :disabled="testing || rows.length === 0" @click="test">{{ t('testLatency') }}</UiButton>
      <UiButton size="sm" :disabled="!ready || removedCount === 0" @click="restore">
        {{ t('restoreSources') }}
      </UiButton>
    </div>

    <div v-if="items.length > 0" ref="frame" class="list-frame">
      <table class="list-table sources" :aria-busy="testing">
        <thead>
          <tr>
            <th scope="col">{{ t('sources') }}</th>
            <th scope="col" class="metric">{{ t('latency') }}</th>
            <th scope="col" class="metric">{{ t('ping') }}</th>
            <th scope="col">
              <span class="sr-only">{{ t('actions') }}</span>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in items" :key="item.source.id">
            <td>
              <label class="source">
                <input
                  class="source-radio"
                  type="radio"
                  name="accelerate-source"
                  :checked="item.preferred"
                  :disabled="!ready"
                  @change="select(item.source.id)"
                />
                <span class="source-text">
                  <span class="source-name">{{ item.source.name }}</span>
                  <span class="source-template">{{ item.source.template }}</span>
                </span>
              </label>
            </td>
            <td v-for="metric in item.metrics" :key="metric.kind" class="metric" :class="`is-${metric.tone}`">
              {{ metric.text }}
            </td>
            <td class="source-action">
              <UiButton
                variant="danger"
                size="sm"
                :disabled="!ready"
                :aria-label="t('deleteEntry', { source: item.source.name })"
                @click="onRemove(item.source.id, index)"
              >
                {{ t('delete') }}
              </UiButton>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <p v-else class="blankslate" data-test="sources-empty">{{ t('noSources') }}</p>

    <form class="source-form" @submit.prevent="onAdd">
      <UiInput
        ref="nameInput"
        v-model="name"
        :aria-label="t('sourceName')"
        :placeholder="t('sourceName')"
        :maxlength="SOURCE_NAME_MAX_LENGTH"
      />
      <UiInput
        v-model="template"
        mono
        :aria-label="t('sourceTemplate')"
        :placeholder="TEMPLATE_PLACEHOLDER"
        :maxlength="SOURCE_TEMPLATE_MAX_LENGTH"
        spellcheck="false"
        autocomplete="off"
      />
      <UiButton type="submit" variant="primary" :disabled="!canAdd">{{ t('add') }}</UiButton>
    </form>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, useTemplateRef } from 'vue'
import UiButton from '../../components/ui/UiButton.vue'
import UiInput from '../../components/ui/UiInput.vue'
import UiSwitch from '../../components/ui/UiSwitch.vue'
import { useI18n } from '../../components/ui-preferences'
import { SOURCE_NAME_MAX_LENGTH, SOURCE_TEMPLATE_MAX_LENGTH } from '../../shared/accelerate'
import { useAccelerateSources, type AccelerateSwitch, type LatencyState, type SourceRow } from './useAccelerateSources'

type MetricKind = 'latency' | 'ping'
type MetricTone = 'good' | 'fair' | 'slow' | 'muted'

interface MetricView {
  readonly kind: MetricKind
  readonly text: string
  readonly tone: MetricTone
}

const SWITCHES: readonly AccelerateSwitch[] = ['accelerate', 'accelerateImages', 'failover']
const METRICS: readonly MetricKind[] = ['latency', 'ping']
/** 延迟、Ping 的分档（毫秒）：不超过前者为快，不超过后者为一般，其余为慢 */
const TONE_LIMITS: Readonly<Record<MetricKind, readonly [number, number]>> = {
  latency: [500, 1500],
  ping: [200, 600],
}
const TEMPLATE_PLACEHOLDER = 'https://example.com/{url}'
/** 未测速 */
const UNTESTED = '—'

const { t } = useI18n()
const { settings, ready, rows, removedCount, testing, setSwitch, select, add, remove, restore, test } =
  useAccelerateSources()

const name = ref('')
const template = ref('')
const frame = useTemplateRef<HTMLElement>('frame')
const nameInput = useTemplateRef<InstanceType<typeof UiInput>>('nameInput')

const canAdd = computed(() => ready.value && template.value.trim() !== '')

function toneOf(ms: number, kind: MetricKind): MetricTone {
  const [good, fair] = TONE_LIMITS[kind]
  if (ms <= good) return 'good'
  return ms <= fair ? 'fair' : 'slow'
}

function metricOf(state: LatencyState | undefined, kind: MetricKind): MetricView {
  if (!state) return { kind, text: UNTESTED, tone: 'muted' }
  if (state.testing) return { kind, text: t('testing'), tone: 'muted' }
  const result = kind === 'latency' ? state.result.latency : state.result.ping
  if (!result) return { kind, text: UNTESTED, tone: 'muted' }
  if (!result.ok) return { kind, text: t(result.reason === 'timeout' ? 'timeout' : 'failed'), tone: 'slow' }
  return { kind, text: `${result.ms} ms`, tone: toneOf(result.ms, kind) }
}

const items = computed(() =>
  rows.value.map((row: SourceRow) => ({ ...row, metrics: METRICS.map((kind) => metricOf(row.latency, kind)) })),
)

async function onAdd(): Promise<void> {
  if (!canAdd.value || !(await add(name.value, template.value))) return
  name.value = ''
  template.value = ''
  nameInput.value?.focus()
}

/** 删除。焦点原在列表里时移到原位置这一行（没有时上一行）的删除按钮，删空时移到添加表单；不移的话焦点落到页面开头 */
async function onRemove(id: string, index: number): Promise<void> {
  const hadFocus = frame.value?.contains(document.activeElement) ?? false
  if (!(await remove(id)) || !hadFocus) return
  await nextTick()
  const buttons = frame.value?.querySelectorAll<HTMLButtonElement>('.source-action button')
  const next = buttons?.[Math.min(index, buttons.length - 1)]
  if (next) next.focus()
  else nameInput.value?.focus()
}
</script>

<style scoped>
/* 测速、恢复内置：作用于下面的加速源列表，靠右放在列表上方 */
.sources-tools {
  justify-content: flex-end;
}

/* 限高、表头见 options.css 的 .list-frame */
.sources td {
  padding: 8px 12px;
  vertical-align: middle;
  transition: background-color var(--gcn-duration-fast) var(--gcn-ease);
}

.sources tbody tr + tr td {
  border-top: 1px solid var(--gcn-border-muted);
}

.sources tbody tr:hover td {
  background: var(--gcn-bg-muted);
}

.source {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  min-width: 0;
  cursor: pointer;
}

.source-radio {
  flex: none;
  width: 16px;
  height: 16px;
  margin: 2px 0 0;
  accent-color: var(--gcn-accent);
  cursor: inherit;
}

.source-text {
  display: grid;
  gap: 2px;
  min-width: 0;
}

.source-template {
  font-family: var(--gcn-font-mono);
  font-size: 12px;
  color: var(--gcn-fg-muted);
  overflow-wrap: anywhere;
}

/* 数值列：按内容收窄，右对齐，数字等宽 */
.sources .metric {
  width: 1%;
  white-space: nowrap;
  text-align: right;
  font-variant-numeric: tabular-nums;
}

.is-good {
  color: var(--gcn-success-fg);
}

.is-fair {
  color: var(--gcn-attention-fg);
}

.is-slow {
  color: var(--gcn-danger-fg);
}

.is-muted {
  color: var(--gcn-fg-muted);
}

.source-action {
  width: 1%;
  white-space: nowrap;
}

/* 两列可收窄到 0：输入框的固有宽度不撑开表单 */
.source-form {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 2fr) auto;
  gap: 8px;
}
</style>
