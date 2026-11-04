import { onBeforeUnmount, shallowRef, watch, type Ref, type ShallowRef } from 'vue'

/** 提前量：元素在视口下方一屏内即算接近 */
const ROOT_MARGIN = '0px 0px 100% 0px'

/**
 * 元素接近视口后为 true，之后不再变回 false（用于推迟加载较大的内容）。
 * 不支持 IntersectionObserver 时直接为 true。须在组件 setup 内调用
 */
export function useNearViewport(target: Readonly<ShallowRef<Element | null>>): Readonly<Ref<boolean>> {
  const near = shallowRef(typeof IntersectionObserver === 'undefined')
  let observer: IntersectionObserver | undefined

  function stop(): void {
    observer?.disconnect()
    observer = undefined
  }

  watch(
    target,
    element => {
      stop()
      if (near.value || !element) return
      observer = new IntersectionObserver(
        entries => {
          if (!entries.some(entry => entry.isIntersecting)) return
          near.value = true
          stop()
        },
        { rootMargin: ROOT_MARGIN }
      )
      observer.observe(element)
    },
    { immediate: true, flush: 'post' }
  )
  onBeforeUnmount(stop)
  return near
}
