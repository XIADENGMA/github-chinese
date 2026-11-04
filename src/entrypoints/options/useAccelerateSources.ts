import { computed, shallowRef, type ComputedRef, type Ref } from 'vue'
import { createToastSource } from '../../components/toast'
import { useI18n } from '../../components/ui-preferences'
import { useSettings } from '../../components/useSettings'
import type { MessageKey } from '../../i18n'
import { measureLatency, probeUrl, type AccelerateSource, type LatencyResult } from '../../shared/accelerate'
import {
  addCategory,
  addSource,
  categoryName,
  countRemovedBuiltins,
  isBuiltinSource,
  listCategories,
  listSources,
  moveCategory,
  removeCategory,
  removeSource,
  removeSources,
  renameCategory,
  restoreBuiltins,
  setCategoryAutoHide,
  type AccelerateCategory,
  type EditFailure,
  type EditResult,
  type LabelText
} from '../../shared/accelerate-categories'
import type { Settings, SettingsPatch } from '../../shared/settings'

/** 一个加速源的测速状态：测速中，或测出的结果 */
export type LatencyState = { readonly testing: true } | { readonly testing: false; readonly result: LatencyResult }

export interface SourceRow {
  readonly source: AccelerateSource
  readonly builtin: boolean
  /** 测速状态；未测为 undefined */
  readonly latency: LatencyState | undefined
}

export interface CategoryView {
  readonly category: AccelerateCategory
  /** 显示的名称 */
  readonly name: string
  readonly rows: readonly SourceRow[]
}

/** 加速的开关 */
export type AccelerateSwitch = 'accelerate' | 'accelerateImages' | 'failover'

export interface UseAccelerateSources {
  readonly settings: Readonly<Ref<Settings>>
  /** 已读取设置或读取失败；之前显示的是默认值 */
  readonly ready: ComputedRef<boolean>
  readonly categories: ComputedRef<readonly CategoryView[]>
  /** 全部加速源数（测速按钮用） */
  readonly sourceCount: ComputedRef<number>
  /** 已删除的内置分类与内置源数 */
  readonly removedCount: ComputedRef<number>
  /** 正在测速 */
  readonly testing: ComputedRef<boolean>
  setSwitch(key: AccelerateSwitch, value: boolean): Promise<void>
  /** 替换原链接用的分类；空串为不替换 */
  setReplace(id: string): Promise<void>
  /** 新建分类，返回新分类的标识；失败时为 undefined */
  addCategory(name: string): Promise<string | undefined>
  renameCategory(id: string, name: string): Promise<boolean>
  setAutoHide(id: string, value: boolean): Promise<void>
  removeCategory(id: string): Promise<boolean>
  /** 把分类移到第 index 位（从 0 起）：先按新顺序显示，写入后即时生效 */
  moveCategory(id: string, index: number): Promise<boolean>
  addSource(categoryId: string, name: string, template: string): Promise<boolean>
  removeSource(id: string): Promise<boolean>
  /** 删除多个加速源，一次写入 */
  removeSources(ids: readonly string[]): Promise<boolean>
  /** 恢复已删除的内置分类与内置源 */
  restore(): Promise<void>
  /** 为全部加速源并行测速，结果逐个更新 */
  test(): Promise<void>
}

const EDIT_FAILURE_MESSAGE: Readonly<Record<EditFailure, MessageKey>> = {
  invalid: 'invalidFormat',
  exists: 'exists',
  limit: 'limitReached'
}

/** 下载加速的设置：开关、替换原链接、分类与加速源。保存失败、编辑失败在页面顶部提示。须在组件 setup 或 effectScope 内调用 */
export function useAccelerateSources(): UseAccelerateSources {
  const { settings, ready, update } = useSettings()
  const { t } = useI18n()
  const toast = createToastSource()
  const latency = shallowRef<ReadonlyMap<string, LatencyState>>(new Map())
  /** 最近一次测速的序号：再次测速后，上一次迟到的结果丢弃 */
  let testRun = 0
  /** 排序后、写入完成前显示的分类顺序：拖放后不先跳回原位；最近一次排序写完后清除 */
  const pendingOrder = shallowRef<readonly string[]>()
  let moveRun = 0
  const label: LabelText = key => t(key)

  /** 显示用的设置：排序未写完时按排好的顺序 */
  const shown = computed(() => (pendingOrder.value ? { ...settings.value, categoryOrder: pendingOrder.value } : settings.value))

  const categories = computed<readonly CategoryView[]>(() =>
    listCategories(shown.value).map(category => ({
      category,
      name: categoryName(category, label),
      rows: category.sources.map(source => ({ source, builtin: isBuiltinSource(source.id), latency: latency.value.get(source.id) }))
    }))
  )
  const sourceCount = computed(() => listSources(settings.value).length)
  const removedCount = computed(() => countRemovedBuiltins(settings.value))
  const testing = computed(() => [...latency.value.values()].some(state => state.testing))

  async function save(patch: SettingsPatch): Promise<boolean> {
    if (!(await update(patch))) {
      toast.show('danger', 'saveFailed')
      return false
    }
    toast.clear()
    return true
  }

  /**
   * 先按界面上的设置校验以便提示；写入时按最新设置重算（期间别处改过时以最新为准），重算失败时不写入。
   * 成功时返回结果（新建时带标识）
   */
  async function edit(run: (current: Settings) => EditResult): Promise<Extract<EditResult, { ok: true }> | undefined> {
    const checked = run(settings.value)
    if (!checked.ok) {
      toast.show('danger', EDIT_FAILURE_MESSAGE[checked.reason])
      return undefined
    }
    // 写入时的结果（setter 里按最新设置重算）
    const written: { result: EditResult } = { result: checked }
    const saved = await save(current => {
      written.result = run(current)
      return written.result.ok ? written.result.patch : {}
    })
    const { result } = written
    return saved && result.ok ? result : undefined
  }

  async function setSwitch(key: AccelerateSwitch, value: boolean): Promise<void> {
    await save({ [key]: value })
  }

  async function setReplace(id: string): Promise<void> {
    await save({ replaceCategory: id })
  }

  async function onAddCategory(name: string): Promise<string | undefined> {
    const time = Date.now()
    return (await edit(current => addCategory(current, name, time, label)))?.id
  }

  async function onRenameCategory(id: string, name: string): Promise<boolean> {
    return (await edit(current => renameCategory(current, id, name, label))) !== undefined
  }

  async function setAutoHide(id: string, value: boolean): Promise<void> {
    await save(current => setCategoryAutoHide(current, id, value))
  }

  function onRemoveCategory(id: string): Promise<boolean> {
    return save(current => removeCategory(current, id))
  }

  async function onMoveCategory(id: string, index: number): Promise<boolean> {
    const patch = moveCategory(shown.value, id, index)
    if (!patch.categoryOrder) return true
    const run = ++moveRun
    pendingOrder.value = patch.categoryOrder
    // 写入时按最新设置重算；连续排序时上一次写完前的顺序以显示的为准
    const saved = await save(current => moveCategory(current, id, index))
    if (run === moveRun) pendingOrder.value = undefined
    return saved
  }

  async function onAddSource(categoryId: string, name: string, template: string): Promise<boolean> {
    const time = Date.now()
    return (await edit(current => addSource(current, categoryId, name, template, time))) !== undefined
  }

  function onRemoveSource(id: string): Promise<boolean> {
    return save(current => removeSource(current, id))
  }

  function onRemoveSources(ids: readonly string[]): Promise<boolean> {
    return save(current => removeSources(current, ids))
  }

  async function restore(): Promise<void> {
    await save(restoreBuiltins)
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

  return {
    settings,
    ready,
    categories,
    sourceCount,
    removedCount,
    testing,
    setSwitch,
    setReplace,
    addCategory: onAddCategory,
    renameCategory: onRenameCategory,
    setAutoHide,
    removeCategory: onRemoveCategory,
    moveCategory: onMoveCategory,
    addSource: onAddSource,
    removeSource: onRemoveSource,
    removeSources: onRemoveSources,
    restore,
    test
  }
}
