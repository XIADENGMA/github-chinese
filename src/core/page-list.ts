/**
 * 分页列表的识别（供 core/auto-load）：分页、下一页地址、分页上方的列表与列表项，以及在取回的下一页里找到同一列表。
 * 不按具体页面写规则：从分页向前找最近的「重复结构」——一组签名相同（同标签、role、第一个类名）的子元素。
 * 经典分页（服务端渲染）与 Primer React 的 Pagination（服务端也渲染列表）都适用
 */

/**
 * 分页：经典分页（.paginate-container、.pagination）、Primer React 的 Pagination（data-component、类名；
 * aria-label 翻译后（Pagination → 分页）会失配，只作未翻译时的后备）
 */
export const PAGINATION_SELECTOR =
  '.paginate-container, .pagination, nav[data-component="Pagination"], nav[class*="prc-Pagination-PaginationContainer-"], nav[aria-label="Pagination"]'
/** 不显示的元素：不算列表项，也不往里找 */
const SKIP_TAGS: ReadonlySet<string> = new Set(['script', 'template', 'style', 'link', 'meta', 'noscript'])
/** 控件：一组同签名的控件不是列表（筛选按钮、菜单等） */
const CONTROL_TAGS: ReadonlySet<string> = new Set([
  'button',
  'details',
  'summary',
  'input',
  'select',
  'option',
  'label',
  'form',
  'svg',
  'img'
])
/** 当前页的列表至少几项：有分页的列表第一页不会太短 */
export const MIN_LIST_ITEMS = 3
/** 列表的分量（项数 × 各项元素数之和）下限：几个小链接组成的按钮组不算 */
const MIN_LIST_SCORE = 30
/** 从分页向上找列表的层数、每层看几个前面的兄弟 */
const MAX_UP = 4
const MAX_SIBLINGS = 4
/** 在一个兄弟里向下找的层数、最多看的元素数 */
const MAX_DEPTH = 8
const MAX_VISIT = 4000
/** React 生成的 id（useId）：:r1:、_r_1_、_R_2ktp_ */
const GENERATED_ID_RE = /^(?::r|_r_)/i

/** 一个列表：列表项所在的容器与列表项的签名 */
export interface PageList {
  readonly container: Element
  readonly signature: string
}

/** 从 body 到元素的路径：每步是签名与同签名兄弟中的序号 */
export type ElementPath = readonly string[]

/** 去掉类名里的构建哈希：CSS Modules 的 name__hash、Primer React 的 prc-组件-部件-hash */
export function classStem(name: string): string {
  return name.replace(/__[\w-]{4,}$/, '').replace(/^(prc-[A-Za-z]+-[A-Za-z]+)-[\w-]{4,}$/, '$1')
}

/** 列表项的签名：标签、role、第一个类名（去哈希） */
export function itemSignature(element: Element): string {
  return `${element.localName}|${element.getAttribute('role') ?? ''}|${classStem(element.classList[0] ?? '')}`
}

/** 路径一步的签名：比列表项多 id（React 生成的除外）与 data-testid */
function stepSignature(element: Element): string {
  const id = element.id && !GENERATED_ID_RE.test(element.id) ? element.id : ''
  return `${itemSignature(element)}|${id}|${element.getAttribute('data-testid') ?? ''}`
}

/** 最外层的分页（嵌套的只取外层），按文档顺序 */
export function paginations(root: ParentNode): Element[] {
  return [...root.querySelectorAll(PAGINATION_SELECTOR)].filter(element => !element.parentElement?.closest(PAGINATION_SELECTOR))
}

/**
 * 分页中的下一页链接：带 next_page 类或 rel="next" 的；否则「上一页 / 下一页」按钮组的最后一个是链接时取它
 * （第一页的「上一页」、最后一页的「下一页」是不可用的 span、button）
 */
export function nextPageLink(container: Element): HTMLAnchorElement | undefined {
  const explicit = container.querySelector<HTMLAnchorElement>('a.next_page[href], a[rel~="next"][href]')
  if (explicit) return explicit
  const groups = [container, ...container.querySelectorAll('.pagination, .BtnGroup')].filter(group =>
    group.matches('.pagination, .BtnGroup')
  )
  for (const group of groups) {
    const last = group.lastElementChild
    if (group.childElementCount >= 2 && last?.localName === 'a' && last.hasAttribute('href')) {
      return last as HTMLAnchorElement
    }
  }
  return undefined
}

/** 分页里标出的当前页码（aria-current="page"、.current 的数字）；没有时为 undefined */
export function currentPageNumber(pagination: Element): number | undefined {
  const text = pagination.querySelector('[aria-current="page"], .current')?.textContent?.trim() ?? ''
  return /^\d+$/.test(text) ? Number(text) : undefined
}

/** 地址里的页码（page、p 参数）；没有时为 undefined */
export function pageNumberOf(url: URL): number | undefined {
  const value = url.searchParams.get('page') ?? url.searchParams.get('p') ?? ''
  return /^\d+$/.test(value) ? Number(value) : undefined
}

/**
 * 下一页的地址：按 base 解析链接的 href，去掉 #；
 * Primer React 的客户端分页 href 为 #页码，换成 base 带 ?page=页码（服务端渲染的同一页）
 */
export function nextPageUrl(link: Element, base: URL): URL | undefined {
  const href = link.getAttribute('href') ?? ''
  const page = /^#(\d+)$/.exec(href)?.[1]
  if (page) {
    const url = new URL(base.href)
    url.hash = ''
    url.searchParams.set('page', page)
    return url
  }
  try {
    const url = new URL(href, base)
    url.hash = ''
    return url
  } catch {
    return undefined
  }
}

/** 容器里签名相同的列表项 */
export function listItems(container: Element, signature: string): Element[] {
  return [...container.children].filter(child => itemSignature(child) === signature)
}

/** 结构相近：至少一半的第一个子元素签名相同（几个不相干的包装元素不算列表） */
function isUniform(members: readonly Element[]): boolean {
  const counts = new Map<string, number>()
  let most = 0
  for (const member of members) {
    const first = [...member.children].find(child => !SKIP_TAGS.has(child.localName))
    const signature = first ? itemSignature(first) : ''
    const count = (counts.get(signature) ?? 0) + 1
    counts.set(signature, count)
    most = Math.max(most, count)
  }
  return most * 2 >= members.length
}

/** 元素的子元素中数量最多的一组同签名元素：至少 MIN_LIST_ITEMS 项、占一半以上、结构相近，不是控件 */
function dominantGroup(element: Element): { readonly signature: string; readonly members: Element[] } | undefined {
  const groups = new Map<string, Element[]>()
  let total = 0
  for (const child of element.children) {
    if (SKIP_TAGS.has(child.localName)) continue
    total += 1
    const signature = itemSignature(child)
    const members = groups.get(signature)
    if (members) members.push(child)
    else groups.set(signature, [child])
  }
  let best: { readonly signature: string; readonly members: Element[] } | undefined
  for (const [signature, members] of groups) {
    if (!best || members.length > best.members.length) best = { signature, members }
  }
  if (!best || best.members.length < MIN_LIST_ITEMS || best.members.length * 2 < total) return undefined
  if (CONTROL_TAGS.has(best.members[0]!.localName) || !isUniform(best.members)) return undefined
  return best
}

function hasLink(members: readonly Element[]): boolean {
  return members.some(member => member.matches('a[href]') || member.querySelector('a[href]') !== null)
}

/** 一组列表项的分量：项数 × 各项元素数之和 */
function groupScore(members: readonly Element[]): number {
  return members.length * members.reduce((sum, member) => sum + member.getElementsByTagName('*').length + 1, 0)
}

/** 一个子树里分量最大的列表；没有时为 undefined */
function bestListIn(root: Element): { readonly list: PageList; readonly score: number } | undefined {
  let best: { readonly list: PageList; readonly score: number } | undefined
  const queue: [Element, number][] = [[root, 0]]
  for (let index = 0; index < queue.length && index < MAX_VISIT; index += 1) {
    const [element, depth] = queue[index]!
    const group = dominantGroup(element)
    if (group && hasLink(group.members)) {
      const score = groupScore(group.members)
      if (!best || score > best.score) best = { list: { container: element, signature: group.signature }, score }
    }
    if (depth >= MAX_DEPTH) continue
    for (const child of element.children) {
      if (!SKIP_TAGS.has(child.localName)) queue.push([child, depth + 1])
    }
  }
  return best && best.score >= MIN_LIST_SCORE ? best : undefined
}

/** 分页与列表项同在一个容器里（分页是列表项的兄弟）：容器里的那组列表项 */
function groupAround(branch: Element): { readonly list: PageList; readonly score: number } | undefined {
  const parent = branch.parentElement
  if (!parent) return undefined
  const group = dominantGroup(parent)
  if (!group || group.members.includes(branch) || !hasLink(group.members)) return undefined
  if (!group.members.some(member => (member.compareDocumentPosition(branch) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0)) {
    return undefined
  }
  const score = groupScore(group.members)
  return score >= MIN_LIST_SCORE ? { list: { container: parent, signature: group.signature }, score } : undefined
}

/**
 * 分页上方的列表：从分页起逐层向上，在前面最近的几个兄弟里（以及与分页同在一个容器的列表项）找分量最大的列表，找到即止。
 * isHidden：不显示的兄弟（如只在窄屏显示的）跳过
 */
export function listBefore(pagination: Element, isHidden: (element: Element) => boolean): PageList | undefined {
  let branch: Element | null = pagination
  for (let level = 0; branch && branch.localName !== 'body' && level <= MAX_UP; level += 1) {
    let best = groupAround(branch)
    let seen = 0
    for (let sibling = branch.previousElementSibling; sibling && seen < MAX_SIBLINGS;) {
      if (!SKIP_TAGS.has(sibling.localName) && !isHidden(sibling)) {
        seen += 1
        const found = bestListIn(sibling)
        if (found && (!best || found.score > best.score)) best = found
      }
      sibling = sibling.previousElementSibling
    }
    if (best) return best.list
    branch = branch.parentElement
  }
  return undefined
}

/** 从 body 到元素的路径 */
export function pathOf(element: Element): ElementPath {
  const steps: string[] = []
  for (let node: Element | null = element; node && node.localName !== 'body'; node = node.parentElement) {
    const signature = stepSignature(node)
    let index = 0
    for (let sibling = node.previousElementSibling; sibling; sibling = sibling.previousElementSibling) {
      if (stepSignature(sibling) === signature) index += 1
    }
    steps.unshift(`${signature}#${index}`)
  }
  return steps
}

/** 按路径在文档里找元素；找不到时为 undefined */
export function findByPath(doc: Document, path: ElementPath): Element | undefined {
  let node: Element | null = doc.body
  for (const step of path) {
    if (!node) return undefined
    const cut = step.lastIndexOf('#')
    const signature = step.slice(0, cut)
    let remaining = Number(step.slice(cut + 1))
    let found: Element | null = null
    for (const child of node.children) {
      if (stepSignature(child) !== signature) continue
      if (remaining === 0) {
        found = child
        break
      }
      remaining -= 1
    }
    node = found
  }
  return node ?? undefined
}

/** 文档中排在列表最后一项之后（不在其内）的最外层分页：分页在列表容器外，或与列表项同在容器里 */
export function paginationsAfter(root: ParentNode, list: PageList): Element[] {
  const items = listItems(list.container, list.signature)
  const anchor = items[items.length - 1] ?? list.container
  return paginations(root).filter(
    pagination => !anchor.contains(pagination) && (anchor.compareDocumentPosition(pagination) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0
  )
}

/** 元素里所有链接（去重、排序后拼接）；没有链接时为空串 */
export function linkKey(element: Element): string {
  const hrefs = new Set<string>()
  if (element.localName === 'a' && element.getAttribute('href')) hrefs.add(element.getAttribute('href')!)
  for (const link of element.querySelectorAll('a[href]')) {
    const href = link.getAttribute('href') ?? ''
    if (href && href !== '#') hrefs.add(href)
  }
  return [...hrefs].sort().join(' ')
}

/** 元素里的第一个链接（不含 #）；没有时为空串 */
export function firstLink(element: Element): string {
  const links = element.localName === 'a' ? [element, ...element.querySelectorAll('a[href]')] : [...element.querySelectorAll('a[href]')]
  for (const link of links) {
    const href = link.getAttribute('href') ?? ''
    if (href && href !== '#') return href
  }
  return ''
}

/** 列表项的标识（去重用）：id（React 生成的除外），否则其中所有链接，否则文字 */
export function itemKey(element: Element): string {
  if (element.id && !GENERATED_ID_RE.test(element.id)) return `#${element.id}`
  return linkKey(element) || (element.textContent ?? '').replace(/\s+/g, ' ').trim().slice(0, 300)
}

/** 引用 id 的属性：改名时一并改 */
const ID_REFERENCE_ATTRIBUTES = [
  'for',
  'aria-labelledby',
  'aria-describedby',
  'aria-controls',
  'aria-owns',
  'aria-activedescendant',
  'aria-details',
  'popovertarget',
  'anchor',
  'list'
]

/** 节点内引用改名 id 的属性与 #锚点链接一并改 */
function updateIdReferences(node: Element, renamed: ReadonlyMap<string, string>): void {
  for (const element of [node, ...node.querySelectorAll('*')]) {
    for (const name of ID_REFERENCE_ATTRIBUTES) {
      const value = element.getAttribute(name)
      if (!value) continue
      const next = value
        .split(/\s+/)
        .map(token => renamed.get(token) ?? token)
        .join(' ')
      if (next !== value) element.setAttribute(name, next)
    }
    const href = element.localName === 'a' ? element.getAttribute('href') : null
    const target = href?.startsWith('#') ? renamed.get(href.slice(1)) : undefined
    if (target) element.setAttribute('href', `#${target}`)
  }
}

/**
 * 接上的节点里与当前文档或同批其他节点重复的 id 改名（加 suffix，仍重复再加序号），
 * 节点内引用这些 id 的属性与 #锚点链接一并改；不重复的保留（如发行版的锚点）
 */
export function renameDuplicateIds(doc: Document, nodes: readonly Element[], suffix: string): void {
  const used = new Set<string>()
  const taken = (id: string): boolean => used.has(id) || doc.getElementById(id) !== null
  for (const node of nodes) {
    const renamed = new Map<string, string>()
    for (const element of [node, ...node.querySelectorAll('[id]')]) {
      const id = element.id
      if (!id) continue
      if (!taken(id)) {
        used.add(id)
        continue
      }
      let next = `${id}${suffix}`
      for (let index = 2; taken(next); index += 1) next = `${id}${suffix}-${index}`
      used.add(next)
      renamed.set(id, next)
      element.id = next
    }
    if (renamed.size > 0) updateIdReferences(node, renamed)
  }
}
