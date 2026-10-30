import { ref, watch, type Ref } from 'vue'
import { createToastSource } from '../../components/toast'
import { useSettings } from '../../components/useSettings'
import { parseExcludedPaths } from '../../shared/settings'

export interface UseExcludedPaths {
  /** 文本框内容，每行一条 */
  readonly text: Ref<string>
  /** 上次保存时格式错误：文本框标红，输入后清除 */
  readonly invalid: Readonly<Ref<boolean>>
  /** 用户输入后调用：停止跟随存储变化，清除错误标记与提示 */
  markDirty(): void
  /** 保存；结果（已保存、格式错误、保存失败）在页面顶部提示 */
  save(): Promise<void>
}

/** 排除路径编辑。须在组件 setup 或 effectScope 内调用 */
export function useExcludedPaths(): UseExcludedPaths {
  const { settings, update } = useSettings()
  const toast = createToastSource()
  const text = ref('')
  const invalid = ref(false)
  let dirty = false

  // 未编辑时跟随存储（如在弹出页排除了某页）
  watch(
    () => settings.value.excludedPaths,
    (paths) => {
      if (!dirty) text.value = paths.join('\n')
    },
    { immediate: true },
  )

  function markDirty(): void {
    dirty = true
    invalid.value = false
    toast.clear()
  }

  async function save(): Promise<void> {
    const parsed = parseExcludedPaths(text.value)
    if (parsed.invalid.length > 0) {
      invalid.value = true
      toast.show('danger', 'invalidFormat')
      return
    }
    if (!(await update({ excludedPaths: parsed.paths }))) {
      toast.show('danger', 'saveFailed')
      return
    }
    dirty = false
    invalid.value = false
    text.value = parsed.paths.join('\n')
    toast.show('success', 'saved')
  }

  return { text, invalid, markDirty, save }
}
