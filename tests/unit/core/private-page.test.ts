import { describe, expect, it } from 'vitest'
import { isPrivatePage } from '../../../src/core/private-page'

const GIST = 'https://gist.github.com/octocat/0831f3fbd83ac4d46451'

/** 新建文档，写入 head 与 body */
function page(head: string, body = ''): Document {
  const doc = document.implementation.createHTMLDocument('')
  doc.head.innerHTML = head
  doc.body.innerHTML = body
  return doc
}

/** 代码片段页面的标题；secret 为私密代码片段（标题旁有标签） */
function gistTitle(secret: boolean): string {
  const label = secret ? '<span class="Label Label--secondary">Secret</span>' : ''
  return `<div class="gisthead"><h1><span class="author"><a href="/octocat">octocat</a></span>
    <strong itemprop="name"><a href="/octocat/0831f3fbd83ac4d46451">sample.sh</a></strong>${label}</h1></div>`
}

describe('isPrivatePage', () => {
  it('存储库页面：按 octolytics 的公开标记', () => {
    const meta = (value: string): string => `<meta name="octolytics-dimension-repository_public" content="${value}">`
    expect(isPrivatePage(page(meta('false')), 'https://github.com/octocat/sample')).toBe(true)
    expect(isPrivatePage(page(meta('true')), 'https://github.com/octocat/sample')).toBe(false)
    expect(isPrivatePage(page(''), 'https://github.com/octocat/sample')).toBe(false)
  })

  it('私密代码片段：标题旁有标签（文字已译成中文也一样）', () => {
    expect(isPrivatePage(page('', gistTitle(true)), GIST)).toBe(true)
    const translated = page('', gistTitle(false).replace('</h1>', '<span class="Label">私密</span></h1>'))
    expect(isPrivatePage(translated, GIST)).toBe(true)
    expect(isPrivatePage(page('', gistTitle(false)), GIST)).toBe(false)
  })

  it('标签的提示文字（未翻译时）也算', () => {
    const doc = page('', '<span title="Only those with the link can see this gist.">Secret</span>')
    expect(isPrivatePage(doc, GIST)).toBe(true)
  })

  it.each(['https://gist.github.example.com/octocat/0831f3fbd83ac4d46451', 'https://github.example.com/gist/octocat/0831f3fbd83ac4d46451'])(
    '企业版站点的代码片段（%s）：同样按标签判断',
    url => {
      expect(isPrivatePage(page('', gistTitle(true)), url)).toBe(true)
      expect(isPrivatePage(page('', gistTitle(false)), url)).toBe(false)
    }
  )

  it('不在代码片段站点上：标题旁的标签不算（存储库名旁有「Public」标签）', () => {
    expect(isPrivatePage(page('', gistTitle(true)), 'https://github.example.com/octocat/sample')).toBe(false)
    expect(isPrivatePage(page('', gistTitle(true)), 'https://github.com/octocat/sample')).toBe(false)
    expect(isPrivatePage(page('', gistTitle(true)), 'not a url')).toBe(false)
  })
})
