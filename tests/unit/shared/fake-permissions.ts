import { fakeBrowser } from 'wxt/testing/fake-browser'
import { GITHUB_ORIGINS } from '../../../src/shared/github'

type Listener = (permissions: { origins?: string[]; permissions?: string[] }) => void

/** 权限事件：记录监听，trigger 依次调用 */
interface FakeEvent {
  addListener(listener: Listener): void
  removeListener(listener: Listener): void
  hasListener(listener: Listener): boolean
  hasListeners(): boolean
  trigger(origins: string[]): Promise<void>
}

function fakeEvent(): FakeEvent & { readonly listeners: Set<Listener> } {
  const listeners = new Set<Listener>()
  return {
    listeners,
    addListener: listener => void listeners.add(listener),
    removeListener: listener => void listeners.delete(listener),
    hasListener: listener => listeners.has(listener),
    hasListeners: () => listeners.size > 0,
    async trigger(origins) {
      for (const listener of [...listeners]) listener({ origins, permissions: [] })
    }
  }
}

export interface FakePermissions {
  /** 已授予的可选主机权限（清单的 GitHub 站点之外），按授予顺序 */
  readonly granted: string[]
  /** permissions.request 的结果：授予或拒绝 */
  answer: boolean
  /** 模拟在浏览器的扩展管理里授予（触发 onAdded） */
  grant(origins: readonly string[]): Promise<void>
  /** 模拟在浏览器的扩展管理里撤销（触发 onRemoved） */
  revoke(origins: readonly string[]): Promise<void>
  readonly onAdded: FakeEvent
  readonly onRemoved: FakeEvent
  /** 恢复初始状态：只有清单的 GitHub 站点，请求时授予，没有监听 */
  reset(): void
}

/**
 * fakeBrowser 未实现 permissions：用内存表模拟。清单的 GitHub 站点始终授予；可选主机权限按精确的匹配模式记录，
 * 已授予的不重复记录、不触发事件（同浏览器）。直接赋值到 fakeBrowser 上（不是 spy）：
 * vi.restoreAllMocks 不会还原它，用例里对它的 spy 还原后仍是这份实现
 */
export function installFakePermissions(): FakePermissions {
  const granted: string[] = []
  const onAdded = fakeEvent()
  const onRemoved = fakeEvent()
  const state: FakePermissions = {
    granted,
    answer: true,
    async grant(origins) {
      const added = origins.filter(origin => !granted.includes(origin))
      granted.push(...added)
      if (added.length > 0) await onAdded.trigger(added)
    },
    async revoke(origins) {
      const removed = origins.filter(origin => granted.includes(origin))
      granted.splice(0, granted.length, ...granted.filter(origin => !removed.includes(origin)))
      if (removed.length > 0) await onRemoved.trigger(removed)
    },
    onAdded,
    onRemoved,
    reset() {
      granted.splice(0)
      state.answer = true
      onAdded.listeners.clear()
      onRemoved.listeners.clear()
    }
  }
  const all = (): string[] => [...GITHUB_ORIGINS, ...granted]
  Object.assign(fakeBrowser.permissions, {
    contains: async ({ origins = [] }: { origins?: string[] }) => origins.every(origin => all().includes(origin)),
    getAll: async () => ({ permissions: ['storage', 'scripting', 'activeTab'], origins: all() }),
    request: async ({ origins = [] }: { origins?: string[] }) => {
      if (!state.answer) return false
      await state.grant(origins)
      return true
    },
    remove: async ({ origins = [] }: { origins?: string[] }) => {
      await state.revoke(origins)
      return true
    },
    onAdded,
    onRemoved
  })
  return state
}

/** 全局的模拟权限：各用例前由 setup.ts 重置 */
export const fakePermissions = installFakePermissions()
