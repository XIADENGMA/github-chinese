import { onScopeDispose, ref, shallowRef, type Ref } from 'vue'
import { browser } from 'wxt/browser'
import { createToastSource } from '../../components/toast'
import type { MessageKey } from '../../i18n'
import { enterpriseHosts, enterpriseOrigins, normalizeEnterpriseHost } from '../../shared/enterprise'
import { pendingSitesItem } from '../../shared/settings'
import { useTextList, type UseTextList } from './useTextList'

export interface UseEnterpriseSites {
  readonly list: UseTextList
  /** 读取已授权的站点失败 */
  readonly loadFailed: Readonly<Ref<boolean>>
  /** 导入的、尚未授权的站点 */
  readonly pending: Readonly<Ref<readonly string[]>>
  /** 授权导入的站点（在点击中调用） */
  authorizePending(): Promise<boolean>
  /** 不授权，清除导入的站点 */
  dismissPending(): Promise<void>
}

/**
 * 企业版站点：以已授予的主机权限为准（见 shared/enterprise）。添加时申请该站点的权限，删除时移除；
 * 在别处授权、撤销（弹出页、浏览器的扩展管理）时随之刷新。授权后的注册、注入由后台处理（见 background.ts）。
 * 导入的站点先记为待授权（见 shared/settings 的 pendingSitesItem），点击授权时一并申请。
 * 须在组件 setup 内调用
 */
export function useEnterpriseSites(): UseEnterpriseSites {
  const hosts = shallowRef<readonly string[]>([])
  const pending = shallowRef<readonly string[]>([])
  const loadFailed = ref(false)
  const toast = createToastSource()

  async function refresh(): Promise<void> {
    try {
      hosts.value = enterpriseHosts((await browser.permissions.getAll()).origins ?? [])
      loadFailed.value = false
    } catch {
      loadFailed.value = true
    }
    // 已在别处授权的站点不再待授权
    if (pending.value.some(host => hosts.value.includes(host))) {
      await pendingSitesItem.setValue(pending.value.filter(host => !hosts.value.includes(host))).catch(() => undefined)
    }
  }

  /**
   * 改为 next：先申请新增站点的权限，授予后移除删去站点的权限。
   * permissions.request 须在用户手势内调用：位于首个 await 之前，添加、改写的事件中同步执行
   */
  async function save(next: readonly string[]): Promise<boolean | MessageKey> {
    const added = next.filter(host => !hosts.value.includes(host))
    const removed = hosts.value.filter(host => !next.includes(host))
    try {
      if (added.length > 0 && !(await browser.permissions.request({ origins: added.flatMap(enterpriseOrigins) }))) {
        return 'authorizeFailed'
      }
      if (removed.length > 0) await browser.permissions.remove({ origins: removed.flatMap(enterpriseOrigins) })
      return true
    } catch {
      return added.length > 0 ? 'authorizeFailed' : false
    } finally {
      await refresh()
    }
  }

  /** 申请待授权站点的权限：permissions.request 同样在首个 await 之前 */
  async function authorizePending(): Promise<boolean> {
    const sites = pending.value
    if (sites.length === 0) return true
    let granted: boolean
    try {
      granted = await browser.permissions.request({ origins: sites.flatMap(enterpriseOrigins) })
    } catch {
      granted = false
    }
    if (!granted) {
      toast.show('danger', 'authorizeFailed')
      return false
    }
    toast.clear()
    await pendingSitesItem.setValue([]).catch(() => undefined)
    await refresh()
    return true
  }

  async function dismissPending(): Promise<void> {
    await pendingSitesItem.setValue([]).catch(() => undefined)
  }

  const onChange = (): void => void refresh()
  const events = [browser.permissions?.onAdded, browser.permissions?.onRemoved]
  for (const event of events) event?.addListener(onChange)
  const stopPending = pendingSitesItem.watch(value => {
    pending.value = value ?? []
  })
  onScopeDispose(() => {
    for (const event of events) event?.removeListener(onChange)
    stopPending()
  })
  pendingSitesItem.getValue().then(
    value => {
      pending.value = value
    },
    () => undefined
  )
  void refresh()

  const list = useTextList({ items: hosts, save, normalize: normalizeEnterpriseHost })
  return { list, loadFailed, pending, authorizePending, dismissPending }
}
