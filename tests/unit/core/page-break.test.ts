import { afterEach, describe, expect, it } from 'vitest'
import { createPageBreak, PAGE_BREAK_CLASS } from '../../../src/core/page-break'
import { itemSignature } from '../../../src/core/page-list'

const URL_2 = new URL('https://github.com/vuejs/core/releases?page=2')

afterEach(() => {
  document.head.innerHTML = ''
  document.body.innerHTML = ''
})

function container(html: string): Element {
  document.body.innerHTML = html
  return document.body.firstElementChild!
}

describe('createPageBreak', () => {
  it('列表里用 li：链接到该页，不再翻译，签名与列表项不同', () => {
    const list = container('<ul><li>Sample text</li></ul>')
    const divider = createPageBreak(document, list, URL_2, '第 2 页')
    expect(divider.localName).toBe('li')
    expect(divider.classList.contains(PAGE_BREAK_CLASS)).toBe(true)
    expect(divider.hasAttribute('data-gcn-ignore')).toBe(true)
    expect(divider.querySelector('a')?.getAttribute('href')).toBe(URL_2.href)
    expect(divider.textContent).toBe('第 2 页')
    expect(itemSignature(divider)).not.toBe(itemSignature(list.firstElementChild!))
  })

  it('其他容器用 div；样式只加一次', () => {
    const list = container('<div><section>Sample text</section></div>')
    expect(createPageBreak(document, list, URL_2, 'Page 2').localName).toBe('div')
    createPageBreak(document, list, URL_2, 'Page 3')
    expect(document.querySelectorAll('style')).toHaveLength(1)
  })

  it('网格、换行的弹性布局里（卡片列表）独占一行', () => {
    createPageBreak(document, container('<div style="display: grid"><div>Sample text</div></div>'), URL_2, '第 2 页')
    const css = document.querySelector('style')?.textContent ?? ''
    const rule = /:is\(div, li\)\.gcn-page-break \{([^}]*)\}/.exec(css)?.[1] ?? ''
    expect(rule).toContain('grid-column: 1 / -1')
    expect(rule).toContain('width: 100%')
  })

  it('表格里用 tr：单元格跨所有列；CSS Grid 布局的表格加标记', () => {
    const body = container('<table><tbody><tr><td>Sample text</td></tr></tbody></table>').querySelector('tbody')!
    const row = createPageBreak(document, body, URL_2, '第 2 页')
    expect(row.localName).toBe('tr')
    expect(row.querySelector('td')?.colSpan).toBe(100)
    expect(row.querySelector('td a')?.textContent).toBe('第 2 页')
    expect(row.hasAttribute('data-gcn-grid')).toBe(false)

    const grid = container('<table style="display: grid"><tbody><tr><td>Sample text</td></tr></tbody></table>')
    expect(createPageBreak(document, grid.querySelector('tbody')!, URL_2, '第 2 页').hasAttribute('data-gcn-grid')).toBe(true)
  })
})
