import { computed, shallowRef, type ComputedRef, type Ref } from 'vue'
import { createToastSource } from '../../components/toast'
import { useSettings } from '../../components/useSettings'
import type { MessageKey } from '../../i18n'
import {
  addSource,
  countRemovedSources,
  isAutoSource,
  listSources,
  measureLatency,
  preferredSource,
  probeUrl,
  removeSource,
  restoreSources,
  type AccelerateSource,
  type LatencyResult,
  type SourceAddResult
} from '../../shared/accelerate'
import type { Settings, SettingsPatch } from '../../shared/settings'

/** 一个加速源的测速状态：测速中，或测出的结果 */
export type LatencyState = { readonly testing: true } | { readonly testing: false; readonly result: LatencyResult }

export interface SourceRow {
  readonly source: AccelerateSource
  /** 首选 */
  readonly preferred: boolean
  /** 测速状态；未测为 undefined */
  readonly latency: LatencyState | undefined
}

/** 加速的开关 */
export type AccelerateSwitch = 'accelerate' | 'accelerateImages' | 'failover'

export interface UseAccelerateSources {
  readonly settings: Readonly<Ref<Settings>>
  /** 已读取设置或读取失败；之前显示的是默认值 */
  readonly ready: ComputedRef<boolean>
  readonly rows: ComputedRef<readonly SourceRow[]>
  /** 首选为自动选择 */
  readonly auto: ComputedRef<boolean>
  /** 已删除的内置源数 */
  readonly removedCount: ComputedRef<number>
  /** 正在测速 */
  readonly testing: ComputedRef<boolean>
  setSwitch(key: AccelerateSwitch, value: boolean): Promise<void>
  /** 设为首选；AUTO_SOURCE_ID 为自动选择 */
  select(id: string): Promise<void>
  add(name: string, template: string): Promise<boolean>
  remove(id: string): Promise<boolean>
  /** 恢复已删除的内置源 */
  restore(): Promise<void>
  /** 为列表中的加速源并行测速，结果逐个更新 */
  test(): Promise<void>
}

type AddFailure = Extract<SourceAddResult, { readonly ok: false }>['reason']

const ADD_FAILURE_MESSAGE: Readonly<Record<AddFailure, MessageKey>> = {
  invalid: 'invalidFormat',
  exists: 'exists',
  limit: 'limitReached'
}

/** 下载加速的设置。保存失败、添加失败在页面顶部提示。须在组件 setup 或 effectScope 内调用 */
export function useAccelerateSources(): UseAccelerateSources {
  const { settings, ready, update } = useSettings()
  const toast = createToastSource()
  const latency = shallowRef<ReadonlyMap<string, LatencyState>>(new Map())
  /** 最近一次测速的序号：再次测速后，上一次迟到的结果丢弃 */
  let testRun = 0

  const rows = computed<readonly SourceRow[]>(() => {
    const preferred = preferredSource(settings.value)
    return listSources(settings.value).map(source => ({
      source,
      preferred: source.id === preferred?.id,
      latency: latency.value.get(source.id)
    }))
  })
  const auto = computed(() => isAutoSource(settings.value))
  const removedCount = computed(() => countRemovedSources(settings.value))
  const testing = computed(() => [...latency.value.values()].some(state => state.testing))

  async function save(patch: SettingsPatch): Promise<boolean> {
    if (!(await update(patch))) {
      toast.show('danger', 'saveFailed')
      return false
    }
    toast.clear()
    return true
  }

  async function setSwitch(key: AccelerateSwitch, value: boolean): Promise<void> {
    await save({ [key]: value })
  }

  async function select(id: string): Promise<void> {
    await save({ accelerateSource: id })
  }

  function add(name: string, template: string): Promise<boolean> {
    const time = Date.now()
    // 先按界面上的设置校验以便提示；写入时按最新设置重算，期间别处已加了同一个源时不重复添加
    const checked = addSource(settings.value, name, template, time)
    if (!checked.ok) {
      toast.show('danger', ADD_FAILURE_MESSAGE[checked.reason])
      return Promise.resolve(false)
    }
    return save(current => {
      const result = addSource(current, name, template, time)
      return result.ok ? result.patch : {}
    })
  }

  function remove(id: string): Promise<boolean> {
    return save(current => removeSource(current, id))
  }

  async function restore(): Promise<void> {
    await save(restoreSources)
  }

  async function test(): Promise<void> {
    const run = ++testRun
    const sources = listSources(settings.value)
    latency.value = new Map<string, LatencyState>(sources.map(source => [source.id, { testing: true }]))
    await Promise.all(
      sources.map(async source => {
        const url = probeUrl(source.template)
        const result: LatencyResult = url ? await measureLatency(url) : { latency: { ok: false, reason: 'error' } }
        if (run === testRun) latency.value = new Map(latency.value).set(source.id, { testing: false, result })
      })
    )
  }

  return { settings, ready, rows, auto, removedCount, testing, setSwitch, select, add, remove, restore, test }
}
