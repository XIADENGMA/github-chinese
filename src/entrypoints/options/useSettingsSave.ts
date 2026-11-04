import { createToastSource } from '../../components/toast'
import { useSettings, type UseSettings } from '../../components/useSettings'
import type { SettingsPatch } from '../../shared/settings'

export interface UseSettingsSave extends UseSettings {
  /** 写入部分设置（传函数时按写入前的最新设置计算）；失败时在页面顶部提示，再次保存成功时收起 */
  save(patch: SettingsPatch): Promise<boolean>
}

/** 设置页标签页里的开关：读取设置，改动即时保存。须在组件 setup 内调用 */
export function useSettingsSave(): UseSettingsSave {
  const state = useSettings()
  const toast = createToastSource()

  async function save(patch: SettingsPatch): Promise<boolean> {
    if (!(await state.update(patch))) {
      toast.show('danger', 'saveFailed')
      return false
    }
    toast.clear()
    return true
  }

  return { ...state, save }
}
