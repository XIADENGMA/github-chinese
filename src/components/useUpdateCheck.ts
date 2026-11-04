import { computed, onScopeDispose, shallowRef, type ComputedRef } from 'vue'
import { getExtensionVersion } from '../shared/extension'
import { checkLatestVersion, isNewerVersion } from '../shared/update-check'

export interface UseUpdateCheck {
  /** 比当前版本新的发行版版本号；没有时为 undefined */
  readonly newVersion: ComputedRef<string | undefined>
}

/**
 * 新版本提示（弹出页、设置页的版本号旁）。须在组件 setup 或 effectScope 内调用。
 * Firefox 不检查：AMO 自动更新，发行版的 xpi 未签名，只能临时载入
 */
export function useUpdateCheck(): UseUpdateCheck {
  const current = getExtensionVersion()
  const latest = shallowRef<string>()
  const newVersion = computed(() => (latest.value !== undefined && isNewerVersion(latest.value, current) ? latest.value : undefined))
  // 条件直接写构建期常量（同 isFirefoxBuild）：函数调用不内联，Firefox 构建里会留着检查代码
  if (String(import.meta.env.FIREFOX) === 'true') return { newVersion }

  let active = true
  onScopeDispose(() => {
    active = false
  })
  void checkLatestVersion(version => {
    if (active) latest.value = version
  })
  return { newVersion }
}
