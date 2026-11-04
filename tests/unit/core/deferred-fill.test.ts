import { afterEach, describe, expect, it } from 'vitest'
import { commitDates, completeDeferred } from '../../../src/core/deferred-fill'

const OID_A = 'a'.repeat(40)
const OID_B = 'b'.repeat(40)

function fetchedPage(data: string): Document {
  return new DOMParser().parseFromString(
    `<react-app><script type="application/json" data-target="react-app.embeddedData">${data}</script></react-app>`,
    'text/html'
  )
}

const EMBEDDED = JSON.stringify({
  payload: {
    commitGroups: [
      { title: 'Sample text', commits: [{ oid: OID_A, authoredDate: '2026-10-13T08:00:00.000Z' }] },
      { title: 'Sample text', commits: [{ oid: OID_B, authoredDate: '2026-10-12T08:00:00.000Z', committedDate: 'x' }] }
    ]
  }
})

/** 服务端渲染的提交行：作者时间、验证状态是骨架 */
function commitRow(oid: string): Element {
  const wrapper = document.createElement('ul')
  wrapper.innerHTML = `<li data-commit-link="/vuejs/core/commit/${oid}">
    <div class="CommitAttributionContainer__AilSky"><a href="/octocat">octocat</a><span class="pl-1">authored</span>
      <div class="skeleton__c5fLaY rounded__er6wPa" style="width:60px"></div>
      <div class="skeleton__c5fLaY rounded__er6wPa" style="width:20px"></div></div>
    <div class="metadata__lB1fsH"><div class="prc-Skeleton-SkeletonBox-e93nW"></div></div>
  </li>`
  return wrapper.firstElementChild!
}

afterEach(() => {
  document.body.innerHTML = ''
})

describe('commitDates', () => {
  it('从内嵌数据取各提交的作者时间', () => {
    const dates = commitDates(fetchedPage(EMBEDDED))
    expect(dates.get(OID_A)).toBe('2026-10-13T08:00:00.000Z')
    expect(dates.get(OID_B)).toBe('2026-10-12T08:00:00.000Z')
  })

  it('没有内嵌数据、数据无效：空', () => {
    expect(commitDates(new DOMParser().parseFromString('<p>Sample text</p>', 'text/html')).size).toBe(0)
    expect(commitDates(fetchedPage('{not json')).size).toBe(0)
  })
})

describe('completeDeferred', () => {
  it('提交行的作者时间换成 relative-time，其余骨架去掉', () => {
    const rows = [commitRow(OID_A), commitRow('c'.repeat(40))]
    completeDeferred(document, rows, fetchedPage(EMBEDDED))
    const time = rows[0]!.querySelector('relative-time')
    expect(time?.getAttribute('datetime')).toBe('2026-10-13T08:00:00.000Z')
    expect(time?.textContent).toBe('2026-10-13')
    // 内嵌数据里没有的提交：不补时间
    expect(rows[1]!.querySelector('relative-time')).toBeNull()
    for (const row of rows) {
      expect(row.querySelector('[class*="skeleton__"], [class*="prc-Skeleton"]')).toBeNull()
      expect(row.querySelector('.pl-1')?.textContent).toBe('authored')
    }
  })

  it('不是提交行：只去掉骨架', () => {
    const wrapper = document.createElement('div')
    wrapper.innerHTML = '<div class="Box-row"><a href="/a">Sample text</a><span class="prc-Skeleton-SkeletonText-x1"></span></div>'
    const row = wrapper.firstElementChild!
    completeDeferred(document, [row], fetchedPage(EMBEDDED))
    expect(row.innerHTML).toBe('<a href="/a">Sample text</a>')
  })
})
