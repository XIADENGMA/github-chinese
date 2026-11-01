import { computed, type ComputedRef, type Ref } from 'vue'
import { createToastSource } from '../../components/toast'

export interface TextListOptions {
  /** 已保存的条目，按添加顺序 */
  readonly items: Readonly<Ref<readonly string[]>>
  /** 写入全部条目；失败时为 false */
  save(next: readonly string[]): Promise<boolean>
  /** 规范化一条输入；格式错误时为 undefined */
  normalize(value: string): string | undefined
  /** 判重用的键：键相同即为同一条。不给时按原文 */
  keyOf?(item: string): string
}

export interface UseTextList {
  /** 列表各行：新添加的在前 */
  readonly rows: ComputedRef<readonly string[]>
  /** 行的键：改写后沿用原来的键，同一行就地更新，焦点保留 */
  rowKey(item: string): number
  add(value: string): Promise<boolean>
  /** 改写一条：返回保存后的值；格式错误、已存在、保存失败时为 undefined */
  edit(original: string, value: string): Promise<string | undefined>
  remove(item: string): Promise<boolean>
}

/**
 * 单列的文字列表（排除路径、屏蔽规则）：添加、改写、删除即时保存。
 * 操作结果（格式错误、已存在、保存失败）在页面顶部提示。须在组件 setup 或 effectScope 内调用
 */
export function useTextList(options: TextListOptions): UseTextList {
  const toast = createToastSource()
  const keyOf = options.keyOf ?? ((item: string) => item)
  const rows = computed(() => [...options.items.value].reverse())

  const rowIds = new Map<string, number>()
  let nextRowId = 0

  function rowKey(item: string): number {
    let id = rowIds.get(item)
    if (id === undefined) {
      id = nextRowId++
      rowIds.set(item, id)
    }
    return id
  }

  /** 规范化并判重（除去 except 这一条）；不通过时提示 */
  function accept(value: string, except?: string): string | undefined {
    const item = options.normalize(value)
    if (item === undefined) {
      toast.show('danger', 'invalidFormat')
      return undefined
    }
    const key = keyOf(item)
    if (options.items.value.some((other) => other !== except && keyOf(other) === key)) {
      toast.show('danger', 'exists')
      return undefined
    }
    return item
  }

  async function save(next: readonly string[]): Promise<boolean> {
    if (await options.save(next)) {
      toast.clear()
      return true
    }
    toast.show('danger', 'saveFailed')
    return false
  }

  async function add(value: string): Promise<boolean> {
    const item = accept(value)
    return item !== undefined && save([...options.items.value, item])
  }

  async function edit(original: string, value: string): Promise<string | undefined> {
    const item = accept(value, original)
    if (item === undefined) return undefined
    if (item === original) {
      toast.clear()
      return item
    }
    // 保存期间新旧两个值共用一个键：保存前（列表仍是原值）、保存后（换成新值）渲染的都是原来那一行
    rowIds.set(item, rowKey(original))
    const saved = await save(options.items.value.map((other) => (other === original ? item : other)))
    rowIds.delete(saved ? original : item)
    return saved ? item : undefined
  }

  function remove(item: string): Promise<boolean> {
    return save(options.items.value.filter((other) => other !== item))
  }

  return { rows, rowKey, add, edit, remove }
}
