import {
  computed,
  effectScope,
  onScopeDispose,
  ref,
  shallowRef,
  type ComputedRef,
  type EffectScope,
  type Ref,
} from 'vue'
import {
  DEFAULT_SETTINGS,
  getSettings,
  updateSettings,
  watchSettings,
  type Settings,
  type SettingsPatch,
} from '../shared/settings'

export interface UseSettings {
  /** 当前设置；存储变化时自动更新 */
  readonly settings: Readonly<Ref<Settings>>
  /** 已从存储读取 */
  readonly loaded: Readonly<Ref<boolean>>
  /** 读取失败 */
  readonly loadFailed: Readonly<Ref<boolean>>
  /** 已读取或读取失败；之前显示的是默认值 */
  readonly ready: ComputedRef<boolean>
  /** 写入部分设置（传函数时按写入前的最新设置计算）；失败返回 false */
  update(patch: SettingsPatch): Promise<boolean>
}

function createSettings(): UseSettings {
  const settings = shallowRef<Settings>(DEFAULT_SETTINGS)
  const loaded = ref(false)
  const loadFailed = ref(false)
  const ready = computed(() => loaded.value || loadFailed.value)
  let changed = false
  // 写入串行执行，避免并发读改写丢失修改
  let queue: Promise<unknown> = Promise.resolve()

  const stopWatch = watchSettings((next) => {
    changed = true
    settings.value = next
    loaded.value = true
  })
  onScopeDispose(stopWatch)

  getSettings().then(
    (value) => {
      if (!changed) settings.value = value
      loaded.value = true
    },
    () => {
      loadFailed.value = true
    },
  )

  function update(patch: SettingsPatch): Promise<boolean> {
    const task = queue.then(() => updateSettings(patch))
    queue = task.catch(() => undefined)
    return task.then(
      (next) => {
        changed = true
        settings.value = next
        loaded.value = true
        return true
      },
      () => false,
    )
  }

  return { settings, loaded, loadFailed, ready, update }
}

interface SharedSettings {
  readonly store: UseSettings
  readonly scope: EffectScope
  users: number
}

/** 页面内共用的一份设置 */
let shared: SharedSettings | undefined

/**
 * 读写扩展设置。同一页面内各处共用一份：只读一次存储、只注册一个监听，写入排在同一队列，不互相覆盖。
 * 最后一个使用者的作用域结束时停止监听，下次调用重新读取。须在组件 setup 或 effectScope 内调用
 */
export function useSettings(): UseSettings {
  if (!shared) {
    const scope = effectScope(true)
    shared = { store: scope.run(createSettings)!, scope, users: 0 }
  }
  const current = shared
  current.users += 1
  onScopeDispose(() => {
    current.users -= 1
    if (current.users > 0) return
    current.scope.stop()
    if (shared === current) shared = undefined
  })
  return current.store
}
