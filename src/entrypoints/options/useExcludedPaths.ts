import { computed, type ComputedRef } from 'vue'
import { useSettings } from '../../components/useSettings'
import { normalizeExcludedPath } from '../../shared/settings'
import { useTextList, type UseTextList } from './useTextList'

export interface UseExcludedPaths extends UseTextList {
  /** 读取设置失败、之后也没收到设置：列表为空时显示加载失败 */
  readonly loadFailed: ComputedRef<boolean>
}

/** 排除路径列表：添加、改写、删除即时保存，跟随存储变化（如在弹出页排除此页）。须在组件 setup 或 effectScope 内调用 */
export function useExcludedPaths(): UseExcludedPaths {
  const { settings, loaded, loadFailed, update } = useSettings()
  const list = useTextList({
    items: computed(() => settings.value.excludedPaths),
    save: next => update({ excludedPaths: next }),
    normalize: normalizeExcludedPath
  })
  return { ...list, loadFailed: computed(() => loadFailed.value && !loaded.value) }
}
