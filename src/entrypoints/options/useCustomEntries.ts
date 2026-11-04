import { computed, onScopeDispose, ref, shallowRef, type ComputedRef, type Ref } from 'vue'
import { downloadText } from '../../components/download'
import { createToastSource } from '../../components/toast'
import type { MessageKey } from '../../i18n'
import {
  EXPORT_FILE_NAME,
  addEntry,
  editEntry,
  filterEntries,
  mergeEntries,
  normalizeEntry,
  parseCustomEntriesJson,
  removeEntries,
  removeEntry,
  serializeEntries,
  type EntryEditResult,
  type EntryPair
} from '../../shared/custom-entries'
import { getCustomEntries, setCustomEntries, watchCustomEntries, type CustomEntries } from '../../shared/settings'
import { sendToBackground } from '../../shared/tab-messages'

export interface UseCustomEntries {
  readonly entries: Readonly<Ref<CustomEntries>>
  /** 搜索词 */
  readonly query: Ref<string>
  /** 筛选后的词条，新添加的在前 */
  readonly rows: ComputedRef<EntryPair[]>
  readonly total: ComputedRef<number>
  /** 读取存储失败、之后也没收到词条：列表为空时显示加载失败 */
  readonly loadFailed: Readonly<Ref<boolean>>
  /** 列表行的键：改原文后沿用原来的键，同一行就地更新，焦点与同行未提交的输入都保留 */
  rowKey(source: string): number
  add(source: string, target: string): Promise<boolean>
  edit(original: string, source: string, target: string): Promise<boolean>
  remove(source: string): Promise<boolean>
  /** 删除多条（按原文），一次写入 */
  removeMany(sources: readonly string[]): Promise<boolean>
  importText(text: string): Promise<boolean>
  importFile(file: Blob): Promise<boolean>
  exportFile(): void
}

const RESULT_MESSAGE: Readonly<Record<'invalid' | 'exists', MessageKey>> = {
  invalid: 'invalidFormat',
  exists: 'exists'
}

/** 请后台通知已打开的 GitHub 页面重新读取词条；失败时这些页面刷新后才用上新词条 */
function notifySaved(): void {
  sendToBackground({ type: 'gcn:custom-entries-saved' }).catch(() => undefined)
}

/**
 * 自定义词条管理。操作结果（已导入、已存在、格式错误、保存失败、读取失败）在页面顶部提示。
 * 须在组件 setup 或 effectScope 内调用
 */
export function useCustomEntries(): UseCustomEntries {
  const entries = shallowRef<CustomEntries>({})
  const query = ref('')
  const loadFailed = ref(false)
  const toast = createToastSource()
  let changed = false

  const stopWatch = watchCustomEntries(next => {
    changed = true
    loadFailed.value = false
    entries.value = next
  })
  onScopeDispose(stopWatch)

  getCustomEntries().then(
    value => {
      if (!changed) entries.value = value
    },
    () => {
      if (!changed) loadFailed.value = true
    }
  )

  const rows = computed(() => filterEntries(entries.value, query.value))
  const total = computed(() => Object.keys(entries.value).length)

  const rowIds = new Map<string, number>()
  let nextRowId = 0

  function rowKey(source: string): number {
    let id = rowIds.get(source)
    if (id === undefined) {
      id = nextRowId++
      rowIds.set(source, id)
    }
    return id
  }

  async function save(next: CustomEntries): Promise<boolean> {
    try {
      changed = true
      entries.value = await setCustomEntries(next)
      loadFailed.value = false
      notifySaved()
      return true
    } catch {
      toast.show('danger', 'saveFailed')
      return false
    }
  }

  async function apply(result: EntryEditResult): Promise<boolean> {
    if (!result.ok) {
      toast.show('danger', RESULT_MESSAGE[result.reason])
      return false
    }
    toast.clear()
    return save(result.entries)
  }

  function add(source: string, target: string): Promise<boolean> {
    return apply(addEntry(entries.value, source, target))
  }

  async function edit(original: string, source: string, target: string): Promise<boolean> {
    const result = editEntry(entries.value, original, source, target)
    const renamed = result.ok ? normalizeEntry(source, target)?.[0] : undefined
    if (renamed === undefined || renamed === original) return apply(result)
    // 保存期间新旧原文共用一个键：保存前（列表仍是原文）、保存后（列表换成新原文）渲染的都是原来那一行
    rowIds.set(renamed, rowKey(original))
    const saved = await apply(result)
    rowIds.delete(saved ? original : renamed)
    return saved
  }

  function remove(source: string): Promise<boolean> {
    toast.clear()
    return save(removeEntry(entries.value, source))
  }

  function removeMany(sources: readonly string[]): Promise<boolean> {
    toast.clear()
    return save(removeEntries(entries.value, sources))
  }

  async function importText(text: string): Promise<boolean> {
    const imported = parseCustomEntriesJson(text)
    if (!imported) {
      toast.show('danger', 'invalidFormat')
      return false
    }
    if (!(await save(mergeEntries(entries.value, imported)))) return false
    toast.show('success', 'imported', { count: Object.keys(imported).length })
    return true
  }

  async function importFile(file: Blob): Promise<boolean> {
    let text: string
    try {
      text = await file.text()
    } catch {
      toast.show('danger', 'readFailed')
      return false
    }
    return importText(text)
  }

  function exportFile(): void {
    downloadText(EXPORT_FILE_NAME, serializeEntries(entries.value))
  }

  return { entries, query, rows, total, loadFailed, rowKey, add, edit, remove, removeMany, importText, importFile, exportFile }
}
