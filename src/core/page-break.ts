/**
 * 自动加载的页码分隔（供 core/auto-load）：接上的每一页前插入「第 N 页」，链接到该页。
 * 按列表容器选标签：ul、ol 里用 li，表格里用 tr（含 CSS Grid 布局的表格），其他用 div
 */

/** 分隔的类名（签名与列表项不同，不算列表项） */
export const PAGE_BREAK_CLASS = 'gcn-page-break'
const LINE_CLASS = `${PAGE_BREAK_CLASS}-line`
/** 表格是 CSS Grid 布局时 tr 上的标记 */
const GRID_ATTRIBUTE = 'data-gcn-grid'
const STYLE_ID = 'gcn-page-break-style'

/** 样式：颜色用 GitHub 的主题变量（随浅色、深色主题），取不到时用默认值 */
const STYLE = `
:is(div, li).${PAGE_BREAK_CLASS},
.${LINE_CLASS} {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--fgColor-muted, #59636e);
  font-size: 12px;
  font-weight: normal;
  line-height: 18px;
}
:is(div, li).${PAGE_BREAK_CLASS},
tr.${PAGE_BREAK_CLASS} > td {
  margin: 0;
  padding: 8px 16px;
  list-style: none;
}
/* 网格、换行的弹性布局里（卡片列表）独占一行 */
:is(div, li).${PAGE_BREAK_CLASS} {
  grid-column: 1 / -1;
  box-sizing: border-box;
  width: 100%;
}
:is(div, li).${PAGE_BREAK_CLASS}::before,
:is(div, li).${PAGE_BREAK_CLASS}::after,
.${LINE_CLASS}::before,
.${LINE_CLASS}::after {
  content: '';
  flex: 1;
  border-top: 1px solid var(--borderColor-muted, rgba(209, 217, 224, 0.7));
}
tr.${PAGE_BREAK_CLASS}[${GRID_ATTRIBUTE}] {
  display: contents;
}
tr.${PAGE_BREAK_CLASS}[${GRID_ATTRIBUTE}] > td {
  display: block;
  grid-column: 1 / -1;
}
.${PAGE_BREAK_CLASS} a {
  color: inherit;
}
.${PAGE_BREAK_CLASS} a:hover {
  color: var(--fgColor-accent, #0969da);
}
`

function ensureStyle(doc: Document): void {
  if (doc.getElementById(STYLE_ID)) return
  const style = doc.createElement('style')
  style.id = STYLE_ID
  style.textContent = STYLE
  ;(doc.head ?? doc.documentElement).append(style)
}

function isGridTable(doc: Document, container: Element): boolean {
  const table = container.closest('table') ?? container
  return doc.defaultView?.getComputedStyle(table).display.includes('grid') ?? false
}

/** 页码分隔：容器里放的元素，内含指向该页的链接 */
export function createPageBreak(doc: Document, container: Element, url: URL, text: string): Element {
  ensureStyle(doc)
  const tag = /^(?:ul|ol)$/.test(container.localName) ? 'li' : /^(?:table|thead|tbody|tfoot)$/.test(container.localName) ? 'tr' : 'div'
  const element = doc.createElement(tag)
  element.className = PAGE_BREAK_CLASS
  // 文字已是扩展界面语言：不再翻译
  element.setAttribute('data-gcn-ignore', '')
  const link = doc.createElement('a')
  link.href = url.href
  link.textContent = text
  if (tag !== 'tr') {
    element.append(link)
    return element
  }
  if (isGridTable(doc, container)) element.setAttribute(GRID_ATTRIBUTE, '')
  const cell = doc.createElement('td')
  cell.colSpan = 100
  const line = doc.createElement('div')
  line.className = LINE_CLASS
  line.append(link)
  cell.append(line)
  element.append(cell)
  return element
}
