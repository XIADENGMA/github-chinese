import { computed, shallowRef, watch, type ComputedRef, type ShallowRef } from 'vue'

/** 全选框的状态：都没选、选了一部分、全选 */
export type SelectionState = 'none' | 'some' | 'all'

export interface UseSelection<K> {
  /** 已选的键 */
  readonly selected: Readonly<ShallowRef<ReadonlySet<K>>>
  readonly count: ComputedRef<number>
  readonly state: ComputedRef<SelectionState>
  has(key: K): boolean
  toggle(key: K, on: boolean): void
  /** 全选（列表中的全部键）或全不选 */
  toggleAll(on: boolean): void
  clear(): void
}

/**
 * 列表的多选：只选当前列表里的键。列表变化后（删除、搜索、切换分类）不在其中的键自动取消，
 * 不会删到看不见的条目。须在组件 setup 或 effectScope 内调用
 */
export function useSelection<K>(keys: () => readonly K[]): UseSelection<K> {
  const selected = shallowRef<ReadonlySet<K>>(new Set())

  watch(keys, current => {
    if (selected.value.size === 0) return
    const present = new Set(current)
    const kept = [...selected.value].filter(key => present.has(key))
    if (kept.length < selected.value.size) selected.value = new Set(kept)
  })

  const count = computed(() => selected.value.size)
  const state = computed<SelectionState>(() => {
    if (selected.value.size === 0) return 'none'
    return keys().every(key => selected.value.has(key)) ? 'all' : 'some'
  })

  function has(key: K): boolean {
    return selected.value.has(key)
  }

  function toggle(key: K, on: boolean): void {
    if (on === selected.value.has(key)) return
    const next = new Set(selected.value)
    if (on) next.add(key)
    else next.delete(key)
    selected.value = next
  }

  function toggleAll(on: boolean): void {
    selected.value = on ? new Set(keys()) : new Set()
  }

  function clear(): void {
    if (selected.value.size > 0) selected.value = new Set()
  }

  return { selected, count, state, has, toggle, toggleAll, clear }
}
