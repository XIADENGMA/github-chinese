/**
 * 实例标记：内容脚本翻译期间在 <html> 上留一个属性，停止、失效时移除。
 * Firefox 更新、停用扩展时直接销毁旧内容脚本，旧实例来不及还原：译文和它的标记一起留在页面上，新实例没有这些译文的记录。
 * 新实例需要重置时据此识别，改为强制重新访问（见 core/turbo-bridge）。只改属性，不增删节点。
 * GitHub 前进后退时按地址缓存、还原 <html> 的属性：会写回已移除的旧标记，删掉后来写入的标记。
 * 所以只认本实例启动时就在、之后没被移除过的标记；本实例的标记被改掉时按当前状态写回
 */

/** 标记属性名前缀，后接实例 id */
export const INSTANCE_MARK_PREFIX = 'data-gcn-i-'

export interface InstanceMark {
  /** 本实例的属性名 */
  readonly name: string
  /** 翻译中写入本实例的标记，停止时移除 */
  update(active: boolean): void
  /** 移除其他实例留下的标记，返回其中是否有已失效实例的（本实例启动时就在、之后没被移除过） */
  clearOthers(): boolean
  /** 停止维护本实例的标记（内容脚本失效时） */
  disconnect(): void
}

/** 生成实例 id：只含小写字母与数字，可直接用作属性名 */
export function createInstanceId(): string {
  return Array.from(crypto.getRandomValues(new Uint32Array(2)), (value) => value.toString(36).padStart(7, '0')).join('')
}

function marksOn(root: Element): string[] {
  return root.getAttributeNames().filter((attr) => attr.startsWith(INSTANCE_MARK_PREFIX))
}

export function createInstanceMark(doc: Document, id: string = createInstanceId()): InstanceMark {
  const name = `${INSTANCE_MARK_PREFIX}${id}`
  const root = doc.documentElement
  let active = false
  /** 启动时就在的其他实例的标记：那些实例已失效，译文没有还原 */
  const stale = new Set(root ? marksOn(root) : [])

  const write = (): void => {
    if (!root) return
    if (active) root.setAttribute(name, '')
    else root.removeAttribute(name)
  }

  // 不移除之后出现的其他标记：同时装着两份扩展时，两边的观察器会来回改
  const observer = new MutationObserver(() => {
    if (!root) return
    if (root.hasAttribute(name) !== active) write()
    // 被移除过的：旧实例已自己还原，或被页面改掉；之后再出现的是页面写回的
    for (const attr of stale) if (!root.hasAttribute(attr)) stale.delete(attr)
  })
  if (root) observer.observe(root, { attributes: true })

  return {
    name,

    update(next) {
      active = next
      write()
    },

    clearOthers() {
      if (!root) return false
      const others = marksOn(root).filter((attr) => attr !== name)
      const found = others.some((attr) => stale.has(attr))
      for (const attr of others) root.removeAttribute(attr)
      stale.clear()
      return found
    },

    disconnect() {
      observer.disconnect()
    },
  }
}
