/**
 * 自动加载接上的 React 列表项（服务端渲染的 HTML）的补全（供 core/auto-load）：
 * React 在客户端才填的部分，服务端只渲染骨架占位，接上后不会再加载。
 * 提交列表的作者时间从取回页面的内嵌数据补上，其余骨架去掉
 */

/** 骨架占位：CSS Modules 的 skeleton__hash、Primer 的 Skeleton 组件（prc-Skeleton-SkeletonBox-hash 等） */
const SKELETON_SELECTOR = ['[class^="skeleton__"]', '[class*=" skeleton__"]', '[class*="prc-Skeleton"]', '[class*="LoadingSkeleton"]'].join(
  ', '
)
/** 内嵌数据里最多看的值的个数 */
const MAX_VALUES = 50_000

/** 取回页面的 React 内嵌数据里提交的作者时间：oid → authoredDate */
export function commitDates(fetched: Document): Map<string, string> {
  const dates = new Map<string, string>()
  const text = fetched.querySelector('script[data-target="react-app.embeddedData"]')?.textContent
  if (!text) return dates
  let data: unknown
  try {
    data = JSON.parse(text)
  } catch {
    return dates
  }
  const stack: unknown[] = [data]
  for (let visited = 0; stack.length > 0 && visited < MAX_VALUES; visited += 1) {
    const value = stack.pop()
    if (Array.isArray(value)) {
      stack.push(...value)
      continue
    }
    if (!value || typeof value !== 'object') continue
    const record = value as Record<string, unknown>
    if (typeof record.oid === 'string' && typeof record.authoredDate === 'string') {
      dates.set(record.oid, record.authoredDate)
    } else {
      stack.push(...Object.values(record))
    }
  }
  return dates
}

/** 节点及其后代中匹配的元素 */
function within(nodes: readonly Element[], selector: string): Element[] {
  return nodes.flatMap(node => [...(node.matches(selector) ? [node] : []), ...node.querySelectorAll(selector)])
}

/** 提交行的作者时间：骨架换成 relative-time（同 GitHub 自己渲染的） */
function fillCommitDates(doc: Document, nodes: readonly Element[], fetched: Document): void {
  const rows = within(nodes, '[data-commit-link]')
  if (rows.length === 0) return
  const dates = commitDates(fetched)
  for (const row of rows) {
    const oid = (row.getAttribute('data-commit-link') ?? '').split('/').pop() ?? ''
    const date = dates.get(oid)
    const slot = row.querySelector('[class^="CommitAttributionContainer"] [class^="skeleton__"]')
    if (!date || !slot) continue
    const time = doc.createElement('relative-time')
    time.className = 'pl-1'
    time.setAttribute('datetime', date)
    time.textContent = date.slice(0, 10)
    slot.replaceWith(time)
  }
}

/** 补全接上的节点：能补的补上，其余骨架去掉 */
export function completeDeferred(doc: Document, nodes: readonly Element[], fetched: Document): void {
  fillCommitDates(doc, nodes, fetched)
  for (const skeleton of within(nodes, SKELETON_SELECTOR)) skeleton.remove()
}
