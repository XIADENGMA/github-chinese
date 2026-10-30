import { fakeBrowser } from 'wxt/testing/fake-browser'

type OptionalApi = 'action' | 'scripting'

/** 模拟浏览器缺少某个 API（如不支持徽标、没有 scripting），返回恢复函数 */
export function removeApi(name: OptionalApi): () => void {
  const original: unknown = fakeBrowser[name]
  Object.defineProperty(fakeBrowser, name, { value: undefined, configurable: true, writable: true })
  return () => {
    Object.defineProperty(fakeBrowser, name, { value: original, configurable: true, writable: true })
  }
}
