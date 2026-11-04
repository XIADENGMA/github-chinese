import { afterEach, describe, expect, it } from 'vitest'
import {
  classStem,
  currentPageNumber,
  findByPath,
  firstLink,
  itemKey,
  itemSignature,
  linkKey,
  listBefore,
  listItems,
  nextPageLink,
  nextPageUrl,
  pageNumberOf,
  paginations,
  paginationsAfter,
  pathOf,
  renameDuplicateIds
} from '../../../src/core/page-list'

const NOT_HIDDEN = (): boolean => false

/** 列表项：标题链接加一段文字（分量够算列表） */
function item(tag: string, href: string, attributes = ''): string {
  return `<${tag}${attributes}><h3><a href="${href}">Sample text</a></h3><p>Sample text</p></${tag}>`
}

function items(tag: string, hrefs: readonly string[]): string {
  return hrefs.map(href => item(tag, href)).join('')
}

const PAGINATION = '<div class="paginate-container"><div class="pagination"><a class="next_page" href="?page=2">Next</a></div></div>'

function element(html: string): Element {
  const wrapper = document.createElement('div')
  wrapper.innerHTML = html
  return wrapper.firstElementChild!
}

afterEach(() => {
  document.body.innerHTML = ''
})

describe('classStem / itemSignature', () => {
  it('去掉构建哈希', () => {
    expect(classStem('listItem__X41oTe')).toBe('listItem')
    expect(classStem('skeleton__c5fLaY')).toBe('skeleton')
    expect(classStem('prc-Pagination-Page-Etgqf')).toBe('prc-Pagination-Page')
    expect(classStem('Box-row')).toBe('Box-row')
    expect(classStem('')).toBe('')
  })

  it('签名：标签、role、第一个类名', () => {
    expect(itemSignature(element('<li role="listitem" class="listItem__X41oTe other"></li>'))).toBe('li|listitem|listItem')
    expect(itemSignature(element('<section></section>'))).toBe('section||')
  })
})

describe('paginations', () => {
  it('只取最外层，按文档顺序', () => {
    document.body.innerHTML = `${PAGINATION}<nav aria-label="Pagination"><a rel="next" href="#2">Next</a></nav>`
    const found = paginations(document)
    expect(found.map(node => node.localName)).toEqual(['div', 'nav'])
    expect(found[0]!.classList.contains('paginate-container')).toBe(true)
  })

  it('Primer React 的分页按 data-component、类名认：aria-label 翻译后（分页、MCP 注册表分页）照样找到', () => {
    document.body.innerHTML =
      '<nav data-component="Pagination" aria-label="分页" id="by-component"><a rel="next" href="#2">下一页</a></nav>' +
      '<nav class="prc-Pagination-PaginationContainer-HEhGo" aria-label="MCP 注册表分页" id="by-class"><a rel="next" href="#2">下一页</a></nav>' +
      '<nav aria-label="面包屑导航"><a href="/">Sample text</a></nav>'
    expect(paginations(document).map(node => node.id)).toEqual(['by-component', 'by-class'])
  })
})

describe('nextPageLink', () => {
  it('带 next_page 类或 rel="next" 的链接', () => {
    expect(nextPageLink(element('<div><a class="next_page" href="?page=2">Next</a></div>'))?.getAttribute('href')).toBe('?page=2')
    expect(nextPageLink(element('<div><a rel="nofollow next" href="?page=3">Next</a></div>'))?.getAttribute('href')).toBe('?page=3')
  })

  it('Primer React 的分页', () => {
    const nav = element(
      '<nav aria-label="Pagination"><div><a rel="prev" href="?page=1">Previous</a><a href="?page=1">1</a>' +
        '<a aria-current="page" href="?page=2">2</a><a rel="next" href="?page=3">Next</a></div></nav>'
    )
    expect(nextPageLink(nav)?.getAttribute('href')).toBe('?page=3')
  })

  it('「上一页 / 下一页」按钮组、标签页的分页：最后一个是链接时取它', () => {
    const group =
      '<div><div class="BtnGroup"><a class="btn" href="?before=x">Previous</a><a class="btn" href="?after=y">Next</a></div></div>'
    expect(nextPageLink(element(group))?.getAttribute('href')).toBe('?after=y')
    const tags =
      '<div class="paginate-container"><div class="pagination"><span class="disabled">Newer</span><a rel="nofollow" href="?after=v1">Older</a></div></div>'
    expect(nextPageLink(element(tags))?.getAttribute('href')).toBe('?after=v1')
  })

  it('没有下一页', () => {
    expect(nextPageLink(element('<div><span class="next_page disabled">Next</span></div>'))).toBeUndefined()
    expect(nextPageLink(element('<div><a class="next_page">Next</a></div>'))).toBeUndefined()
    const last =
      '<div><div class="BtnGroup"><a class="btn" href="?before=x">Previous</a><button class="btn" disabled>Next</button></div></div>'
    expect(nextPageLink(element(last))).toBeUndefined()
    expect(nextPageLink(element('<div><div class="BtnGroup"><a class="btn" href="?after=y">Next</a></div></div>'))).toBeUndefined()
  })
})

describe('nextPageUrl', () => {
  const link = (href: string): Element => element(`<a href="${href}">Next</a>`)

  it('按当前地址解析，去掉 #', () => {
    const base = new URL('https://github.com/vuejs/core/releases#top')
    expect(nextPageUrl(link('?page=2'), base)?.href).toBe('https://github.com/vuejs/core/releases?page=2')
    expect(nextPageUrl(link('/vuejs/core/tags?after=v1#x'), base)?.href).toBe('https://github.com/vuejs/core/tags?after=v1')
  })

  it('#页码：换成带 page 参数的地址', () => {
    const base = new URL('https://github.com/orgs/vuejs/repositories?q=sample#2')
    expect(nextPageUrl(link('#3'), base)?.href).toBe('https://github.com/orgs/vuejs/repositories?q=sample&page=3')
  })

  it('无效地址', () => {
    expect(nextPageUrl(link('http://['), new URL('https://github.com/'))).toBeUndefined()
  })
})

describe('页码', () => {
  it('分页里标出的当前页', () => {
    expect(currentPageNumber(element('<nav><a aria-current="page" href="?page=3">3</a></nav>'))).toBe(3)
    expect(currentPageNumber(element('<div class="pagination"><em class="current">4</em></div>'))).toBe(4)
    expect(currentPageNumber(element('<div><span class="current">Sample text</span></div>'))).toBeUndefined()
    expect(currentPageNumber(element('<div><a href="?page=2">2</a></div>'))).toBeUndefined()
  })

  it('地址里的页码', () => {
    expect(pageNumberOf(new URL('https://github.com/vuejs/core/releases?page=4'))).toBe(4)
    expect(pageNumberOf(new URL('https://github.com/search?q=vue&p=2'))).toBe(2)
    expect(pageNumberOf(new URL('https://github.com/vuejs/core/releases?page=last'))).toBeUndefined()
    expect(pageNumberOf(new URL('https://github.com/vuejs/core/tags?after=v1'))).toBeUndefined()
  })
})

describe('listBefore', () => {
  it('分页前面兄弟里的列表', () => {
    document.body.innerHTML = `<div><ul id="list">${items('li', ['/a', '/b', '/c'])}</ul></div>${PAGINATION}`
    const list = listBefore(document.querySelector('.paginate-container')!, NOT_HIDDEN)
    expect(list?.container.id).toBe('list')
    expect(list?.signature).toBe('li||')
    expect(listItems(list!.container, list!.signature)).toHaveLength(3)
  })

  it('分页与列表项同在一个容器里', () => {
    document.body.innerHTML = `<div id="list">${items('section', ['/a', '/b', '/c'])}${PAGINATION}</div>`
    const list = listBefore(document.querySelector('.paginate-container')!, NOT_HIDDEN)
    expect(list?.container.id).toBe('list')
    expect(list?.signature).toBe('section||')
  })

  it('几个小链接、按钮组成的组不算列表', () => {
    document.body.innerHTML = `
      <div><ul id="list">${items('li', ['/a', '/b', '/c'])}</ul></div>
      <div><a href="#1">1</a><a href="#2">2</a><a href="#3">3</a></div>
      <div><button>1</button><button>2</button><button>3</button><button>4</button></div>
      ${PAGINATION}`
    expect(listBefore(document.querySelector('.paginate-container')!, NOT_HIDDEN)?.container.id).toBe('list')
  })

  it('不显示的兄弟跳过；找不到时为 undefined', () => {
    document.body.innerHTML = `
      <div id="wide"><ul>${items('li', ['/a', '/b', '/c', '/d'])}</ul></div>
      <div id="narrow"><ol id="list">${items('li', ['/a', '/b', '/c'])}</ol></div>
      ${PAGINATION}`
    const pagination = document.querySelector('.paginate-container')!
    expect(listBefore(pagination, node => node.id === 'narrow')?.container.parentElement?.id).toBe('wide')
    expect(listBefore(pagination, node => node.id === 'wide')?.container.id).toBe('list')
    document.body.innerHTML = `<p>Sample text</p>${PAGINATION}`
    expect(listBefore(document.querySelector('.paginate-container')!, NOT_HIDDEN)).toBeUndefined()
  })
})

describe('pathOf / findByPath', () => {
  it('在结构相同的另一份文档里找到同一元素（React 生成的 id、类名哈希不同也可以）', () => {
    document.body.innerHTML = `<main><div id=":r1:"><ul class="list__aaaa1">${items('li', ['/a'])}</ul></div><div id="other"><ul class="list__aaaa1"></ul></div></main>`
    const path = pathOf(document.querySelector('#\\:r1\\: ul')!)
    const other = new DOMParser().parseFromString(
      `<main><div id=":r9:"><ul class="list__bbbb2" data-mark="target"></ul></div><div id="other"><ul></ul></div></main>`,
      'text/html'
    )
    expect(findByPath(other, path)?.getAttribute('data-mark')).toBe('target')
    const different = new DOMParser().parseFromString('<main><section><ul></ul></section></main>', 'text/html')
    expect(findByPath(different, path)).toBeUndefined()
  })
})

describe('paginationsAfter', () => {
  it('列表最后一项之后的分页：容器里的、容器外的；列表前面的不算', () => {
    document.body.innerHTML = `
      <div class="paginate-container" id="before"></div>
      <div id="list">${items('section', ['/a', '/b', '/c'])}<div class="paginate-container" id="inner"></div></div>
      <div class="paginate-container" id="outer"></div>`
    const container = document.getElementById('list')!
    expect(paginationsAfter(document, { container, signature: 'section||' }).map(node => node.id)).toEqual(['inner', 'outer'])
  })
})

describe('列表项的标识', () => {
  it('linkKey：所有链接去重排序，不含 #', () => {
    expect(linkKey(element('<li><a href="/b">B</a><a href="/a">A</a><a href="#">x</a><a href="/a">A</a></li>'))).toBe('/a /b')
    expect(linkKey(element('<a href="/x"><span>Sample text</span></a>'))).toBe('/x')
    expect(linkKey(element('<li>Sample text</li>'))).toBe('')
  })

  it('firstLink：第一个链接，不含 #', () => {
    expect(firstLink(element('<li><a href="#">x</a><a href="/c">c</a><a href="/d">d</a></li>'))).toBe('/c')
    expect(firstLink(element('<a href="/x">x</a>'))).toBe('/x')
    expect(firstLink(element('<li>Sample text</li>'))).toBe('')
  })

  it('itemKey：id（React 生成的除外），否则链接，否则文字', () => {
    expect(itemKey(element('<li id="issue-1"><a href="/a">a</a></li>'))).toBe('#issue-1')
    expect(itemKey(element('<li id=":r3:"><a href="/a">a</a></li>'))).toBe('/a')
    expect(itemKey(element('<li id="_R_2ktp_"><a href="/b">b</a></li>'))).toBe('/b')
    expect(itemKey(element('<li>  Sample\n  text </li>'))).toBe('Sample text')
  })
})

describe('renameDuplicateIds', () => {
  it('与文档、同批节点重复的 id 改名，节点内的引用一并改；不重复的保留', () => {
    document.body.innerHTML = '<div id="dup"></div><div id="taken"></div><div id="taken-gcn1"></div>'
    const first = element(
      '<li><label for="dup">x</label><input id="dup"><a href="#dup">x</a><span id="unique"></span><span id="taken"></span></li>'
    )
    const second = element('<li><span id="unique"></span><span aria-labelledby="unique other"></span><a href="#unique">x</a></li>')
    renameDuplicateIds(document, [first, second], '-gcn1')
    expect(first.querySelector('input')!.id).toBe('dup-gcn1')
    expect(first.querySelector('label')!.getAttribute('for')).toBe('dup-gcn1')
    expect(first.querySelector('a')!.getAttribute('href')).toBe('#dup-gcn1')
    expect(first.querySelectorAll('span')[0]!.id).toBe('unique')
    expect(first.querySelectorAll('span')[1]!.id).toBe('taken-gcn1-2')
    expect(second.querySelector('span')!.id).toBe('unique-gcn1')
    expect(second.querySelectorAll('span')[1]!.getAttribute('aria-labelledby')).toBe('unique-gcn1 other')
    expect(second.querySelector('a')!.getAttribute('href')).toBe('#unique-gcn1')
  })
})
