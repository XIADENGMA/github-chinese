import { onScopeDispose, ref, shallowRef, type ComputedRef, type Ref } from 'vue'
import { createToastSource } from '../../components/toast'
import { useSettings } from '../../components/useSettings'
import { normalizeRule, ruleKeyOf } from '../../shared/search-block'
import { getSearchBlockRules, setSearchBlockRules, watchSearchBlockRules, type Settings } from '../../shared/settings'
import { sendToBackground } from '../../shared/tab-messages'
import { useTextList, type UseTextList } from './useTextList'

export interface UseSearchBlock extends UseTextList {
  readonly settings: Readonly<Ref<Settings>>
  /** 设置已读取或读取失败：之前开关不可用 */
  readonly ready: ComputedRef<boolean>
  /** 读取规则失败、之后也没收到规则：列表为空时显示加载失败 */
  readonly loadFailed: Readonly<Ref<boolean>>
  setPurify(value: boolean): Promise<void>
}

/** 请后台通知已打开的 GitHub 页面重新读取规则；失败时这些页面刷新后才用上新规则 */
function notifySaved(): void {
  sendToBackground({ type: 'gcn:search-rules-saved' }).catch(() => undefined)
}

/** 搜索净化的开关与屏蔽规则列表（添加、改写、删除即时保存）。须在组件 setup 或 effectScope 内调用 */
export function useSearchBlock(): UseSearchBlock {
  const { settings, ready, update } = useSettings()
  const toast = createToastSource()
  const rules = shallowRef<readonly string[]>([])
  const loadFailed = ref(false)
  /** 已收到存储变化或已保存：迟到的初次读取结果丢弃 */
  let changed = false

  // 跟随存储（如另一个设置页修改了规则）
  const stopWatch = watchSearchBlockRules((next) => {
    changed = true
    loadFailed.value = false
    rules.value = next
  })
  onScopeDispose(stopWatch)

  getSearchBlockRules().then(
    (value) => {
      if (!changed) rules.value = value
    },
    () => {
      if (!changed) loadFailed.value = true
    },
  )

  async function save(next: readonly string[]): Promise<boolean> {
    try {
      changed = true
      rules.value = await setSearchBlockRules(next)
      loadFailed.value = false
      notifySaved()
      return true
    } catch {
      return false
    }
  }

  const list = useTextList({ items: rules, save, normalize: normalizeRule, keyOf: ruleKeyOf })

  async function setPurify(value: boolean): Promise<void> {
    if (await update({ purifySearch: value })) toast.clear()
    else toast.show('danger', 'saveFailed')
  }

  return { ...list, settings, ready, loadFailed, setPurify }
}
