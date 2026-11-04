import { fakePermissions } from './shared/fake-permissions'

/**
 * 单元测试不联网：全局 fetch 一律失败（happy-dom 的 fetch 会发出真实请求，弹出页、设置页挂载时会检查新版本）。
 * 需要应答的用例自行 vi.spyOn(globalThis, 'fetch') 或 vi.stubGlobal
 */
globalThis.fetch = (() => Promise.reject(new TypeError('单元测试不联网'))) as typeof fetch

/** fakeBrowser 未实现 permissions：各用例使用模拟的权限（见 shared/fake-permissions），用例前恢复初始状态 */
beforeEach(() => {
  fakePermissions.reset()
})
