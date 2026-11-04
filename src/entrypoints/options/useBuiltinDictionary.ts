import { computed, ref, shallowRef, toValue, watch, type ComputedRef, type MaybeRefOrGetter, type Ref, type WritableComputedRef } from 'vue'
import { useSettings } from '../../components/useSettings'
import type { LocaleBundle } from '../../core/types'
import { dictionaryRows, filterDictionaryRows, type DictionaryRow } from '../../shared/dictionary-view'
import { languageEnvironment } from '../../shared/language-env'
import { resolvePageLocale, type PageLocale } from '../../shared/locale'
import { loadLocaleBundle } from './locale-bundle'

/** 加载状态 */
export type DictionaryState = 'loading' | 'ready' | 'failed'

export interface UseBuiltinDictionaryOptions {
  /** 为 true 后才加载（如接近视口时）；默认立即加载 */
  readonly enabled?: MaybeRefOrGetter<boolean>
  readonly load?: (locale: PageLocale) => Promise<LocaleBundle>
}

export interface UseBuiltinDictionary {
  /** 浏览的语言：默认为页面翻译语言 */
  readonly locale: WritableComputedRef<PageLocale>
  readonly query: Ref<string>
  /** 筛选后的行 */
  readonly rows: ComputedRef<readonly DictionaryRow[]>
  readonly state: Readonly<Ref<DictionaryState>>
  /** 重新加载当前语言（加载失败后） */
  retry(): void
}

/** 内置词库的浏览：按语言加载语言包（同一语言只加载一次，失败的可重试），按搜索词筛选。须在组件 setup 内调用 */
export function useBuiltinDictionary(options: UseBuiltinDictionaryOptions = {}): UseBuiltinDictionary {
  const { enabled = true, load = loadLocaleBundle } = options
  const { settings } = useSettings()
  const env = languageEnvironment()
  const chosen = ref<PageLocale>()
  const query = ref('')
  const all = shallowRef<readonly DictionaryRow[]>([])
  const state = ref<DictionaryState>('loading')
  const cache = new Map<PageLocale, Promise<readonly DictionaryRow[]>>()
  /** 最近一次加载的序号：换语言后，上一次迟到的结果丢弃 */
  let request = 0

  const locale = computed({
    get: () => chosen.value ?? resolvePageLocale(settings.value.language, env),
    set: (value: PageLocale) => {
      chosen.value = value
    }
  })

  function rowsOf(value: PageLocale): Promise<readonly DictionaryRow[]> {
    let task = cache.get(value)
    if (!task) {
      task = load(value).then(dictionaryRows)
      cache.set(value, task)
      task.catch(() => cache.delete(value))
    }
    return task
  }

  async function show(value: PageLocale): Promise<void> {
    const current = ++request
    state.value = 'loading'
    try {
      const rows = await rowsOf(value)
      if (current !== request) return
      all.value = rows
      state.value = 'ready'
    } catch {
      if (current !== request) return
      all.value = []
      state.value = 'failed'
    }
  }

  watch(
    [locale, () => toValue(enabled)],
    ([value, active]) => {
      if (active) void show(value)
    },
    { immediate: true }
  )

  function retry(): void {
    if (toValue(enabled)) void show(locale.value)
  }

  const rows = computed(() => filterDictionaryRows(all.value, query.value))
  return { locale, query, rows, state, retry }
}
