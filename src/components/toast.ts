import { shallowRef, type Ref } from 'vue'
import type { MessageKey, MessageParams } from '../i18n'
import type { UiToastTone } from './ui/types'

/** 提示的类型：成功、失败 */
export type ToastTone = UiToastTone

export interface Toast {
  readonly id: number
  readonly tone: ToastTone
  readonly key: MessageKey
  readonly params?: MessageParams
}

/** 同时显示的提示数：超出时先收起最早的 */
export const MAX_TOASTS = 3

/** 页面内的提示队列，新的在后。由根组件里的 ToastHost 显示在页面顶部，并按时收起 */
const list = shallowRef<readonly Toast[]>([])
let nextId = 0

function sameParams(a: MessageParams = {}, b: MessageParams = {}): boolean {
  const keys = Object.keys(a)
  return keys.length === Object.keys(b).length && keys.every(key => a[key] === b[key])
}

function sameToast(a: Toast, b: Toast): boolean {
  return a.tone === b.tone && a.key === b.key && sameParams(a.params, b.params)
}

/** 当前显示的提示 */
export function useToasts(): Readonly<Ref<readonly Toast[]>> {
  return list
}

/** 显示一条提示，返回其 id。已有相同的提示时换成这条（重新计时，读屏重新朗读），不叠加 */
export function showToast(tone: ToastTone, key: MessageKey, params?: MessageParams): number {
  const toast: Toast = params ? { id: nextId++, tone, key, params } : { id: nextId++, tone, key }
  list.value = [...list.value.filter(item => !sameToast(item, toast)), toast].slice(-MAX_TOASTS)
  return toast.id
}

export function dismissToast(id: number): void {
  list.value = list.value.filter(toast => toast.id !== id)
}

export function clearToasts(): void {
  list.value = []
}

/** 一处操作（如一个分区）的提示：同时只留一条，新提示替换旧的 */
export interface ToastSource {
  show(tone: ToastTone, key: MessageKey, params?: MessageParams): void
  /** 收起这处的提示，如再次操作成功时收起之前的失败提示 */
  clear(): void
}

export function createToastSource(): ToastSource {
  let current: number | undefined
  function clear(): void {
    if (current !== undefined) dismissToast(current)
    current = undefined
  }
  return {
    show(tone, key, params) {
      clear()
      current = showToast(tone, key, params)
    },
    clear
  }
}
