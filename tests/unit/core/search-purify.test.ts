// @vitest-environment-options { "url": "https://github.com/search?q=vue&type=repositories" }
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { createSearchPurifier, type SearchPurifier } from '../../../src/core/search-purify'
import { compileSearchBlockRules, type SearchBlockList } from '../../../src/shared/search-block'

let active: boolean
let rules: SearchBlockList
let purifier: SearchPurifier | undefined

/** 等 MutationObserver 回调 */
async function flush(): Promise<void> {
  await new Promise(done => setTimeout(done, 0))
}

function start(lines: readonly string[]): SearchPurifier {
  rules = compileSearchBlockRules(lines)
  purifier = createSearchPurifier(document, { active: () => active, rules: () => rules })
  return purifier
}

/** 存储库结果（同搜索结果页：标题行的链接为存储库；描述、主题为用户内容） */
function repoResult(repo: string, description = '', topics: readonly string[] = []): string {
  const tokens = topics.map(topic => `<div><a class="topicLabel__x" href="/topics/${topic}">${topic}</a></div>`)
  return (
    `<div class="Result__x"><div class="resultRow__x"><div class="resultContent__x">` +
    `<h3 class="header__x"><div class="headerRow__x"><div class="search-title title__x">` +
    `<a href="/${repo}"><span class="search-match">${repo}</span></a></div></div></h3>` +
    `<div class="Content__x"><span class="search-match">${description}</span></div>` +
    `<div class="tokenList__x">${tokens.join('')}</div>` +
    `<ul class="footer__x"><li><a href="/${repo}/stargazers">1k</a></li></ul>` +
    `</div></div></div>`
  )
}

/** 议题结果：标题行先是所属存储库的链接，再是议题；标签为高亮文字，作者在页脚 */
function issueResult(repo: string, title: string, labels: readonly string[] = [], author = 'hubot'): string {
  const tokens = labels.map(label => `<div><span class="prc-Label"><span class="search-match">${label}</span></span></div>`)
  return (
    `<div class="Result__x"><h3 class="header__x">` +
    `<div class="RepositoryContext__x"><a href="/${repo}"><span>${repo}</span></a></div>` +
    `<div class="search-title title__x"><a href="/${repo}/issues/1"><span class="search-match">${title}</span></a></div>` +
    `</h3><div class="tokenList__x">${tokens.join('')}</div><ul class="footer__x"><li>${author}</li></ul></div>`
  )
}

/** 用户结果：名称与用户名两个链接；右侧关注按钮链接到登录页 */
function userResult(login: string, name = ''): string {
  return (
    `<div class="Result__x"><div class="resultRow__x"><div class="contentColumn__x">` +
    `<h3 class="header__x"><div class="search-title title__x">` +
    `<a href="/${login}"><span>${name}</span></a><a href="/${login}"><span>${login}</span></a>` +
    `</div></h3></div><div class="rightColumn__x"><a href="/login?return_to=x">Follow</a></div></div></div>`
  )
}

function showResults(...items: string[]): HTMLElement[] {
  document.body.innerHTML = `<div data-testid="results-list" class="List__x">${items.join('')}</div>`
  return items$()
}

function items$(): HTMLElement[] {
  return [...document.querySelectorAll<HTMLElement>('[data-testid="results-list"] > *')]
}

/** 各条结果是否隐藏 */
function hiddenStates(): boolean[] {
  return items$().map(item => item.style.getPropertyValue('display') === 'none')
}

beforeEach(() => {
  active = true
})

afterEach(() => {
  purifier?.stop()
  purifier = undefined
  document.body.innerHTML = ''
  history.replaceState(null, '', '/search?q=vue&type=repositories')
})

describe('createSearchPurifier', () => {
  it('命中所有者、存储库、关键词的结果隐藏，其余照常', () => {
    showResults(
      repoResult('octocat/hello-world'),
      repoResult('vuejs/core'),
      repoResult('vuejs/vue', 'A Sample text here'),
      repoResult('vuejs/router'),
      repoResult('vuejs/pinia', '', ['sample-topic']),
      issueResult('octocat/linguist', 'Bug'),
      issueResult('vuejs/docs', 'Typo', ['sample-label']),
      userResult('octocat', 'The Octocat'),
      userResult('vuejs', 'Vue')
    )
    start(['@octocat', 'vuejs/core', 'Sample text', 'sample-topic', 'sample-label'])
    expect(hiddenStates()).toEqual([true, true, true, false, true, true, true, true, false])
  })

  it('不留占位：display: none !important；恢复显示时还原原有的行内 display', () => {
    const [item] = showResults(repoResult('octocat/hello-world'))
    item!.style.setProperty('display', 'flex')
    start(['@octocat'])
    expect(item!.style.getPropertyValue('display')).toBe('none')
    expect(item!.style.getPropertyPriority('display')).toBe('important')
    rules = compileSearchBlockRules([])
    purifier!.refresh()
    expect(item!.style.getPropertyValue('display')).toBe('flex')
    expect(item!.style.getPropertyPriority('display')).toBe('')
  })

  it('不按页脚、描述里的链接与文字判断所有者', () => {
    showResults(
      repoResult('vuejs/vue', 'See <a href="https://github.com/octocat">github.com/octocat</a>'),
      issueResult('vuejs/docs', 'Typo', [], 'octocat')
    )
    start(['@octocat'])
    expect(hiddenStates()).toEqual([false, false])
  })

  it('之后插入的结果（换页、加载更多）也隐藏', async () => {
    showResults()
    start(['@octocat'])
    document.querySelector('[data-testid="results-list"]')!.innerHTML = repoResult('vuejs/core') + repoResult('octocat/hello-world')
    await flush()
    expect(hiddenStates()).toEqual([false, true])
  })

  it('结果列表整个换掉：新列表照常处理', async () => {
    showResults(repoResult('octocat/hello-world'))
    start(['@octocat'])
    showResults(repoResult('octocat/linguist'), repoResult('vuejs/core'))
    await flush()
    expect(hiddenStates()).toEqual([true, false])
  })

  it('结果元素复用（链接改指别的结果）：重新判断', async () => {
    showResults(repoResult('octocat/hello-world'), repoResult('vuejs/core'))
    start(['@octocat'])
    expect(hiddenStates()).toEqual([true, false])
    const [first, second] = items$()
    first!.querySelector('h3 a')!.setAttribute('href', '/vuejs/router')
    second!.querySelector('h3 a')!.setAttribute('href', '/octocat/linguist')
    await flush()
    expect(hiddenStates()).toEqual([false, true])
  })

  it('页面改回了 display（重新渲染）：之后的变动时再隐藏', async () => {
    const [item] = showResults(repoResult('octocat/hello-world'))
    start(['@octocat'])
    item!.style.removeProperty('display')
    item!.append(document.createElement('span'))
    await flush()
    expect(item!.style.getPropertyValue('display')).toBe('none')
  })

  it('不在搜索结果页时不处理：离开时显示，回到搜索页后再隐藏', () => {
    showResults(repoResult('octocat/hello-world'))
    history.replaceState(null, '', '/octocat/hello-world/search')
    start(['@octocat'])
    expect(hiddenStates()).toEqual([false])
    history.replaceState(null, '', '/search?q=octocat')
    purifier!.refresh()
    expect(hiddenStates()).toEqual([true])
    history.replaceState(null, '', '/topics/octocat')
    purifier!.refresh()
    expect(hiddenStates()).toEqual([false])
  })

  it('关闭、规则清空时显示已隐藏的结果；开启、规则恢复后再隐藏', () => {
    showResults(repoResult('octocat/hello-world'))
    start(['@octocat'])
    active = false
    purifier!.refresh()
    expect(hiddenStates()).toEqual([false])
    active = true
    purifier!.refresh()
    expect(hiddenStates()).toEqual([true])
    rules = compileSearchBlockRules(['""'])
    purifier!.refresh()
    expect(hiddenStates()).toEqual([false])
  })

  it('未开启时不处理之后插入的结果', async () => {
    active = false
    showResults()
    start(['@octocat'])
    showResults(repoResult('octocat/hello-world'))
    await flush()
    expect(hiddenStates()).toEqual([false])
  })

  it('只处理结果列表的直接子元素', () => {
    showResults(repoResult('octocat/hello-world'))
    start(['@octocat'])
    expect(document.querySelectorAll('[style*="display"]')).toHaveLength(1)
  })

  it('stop：显示已隐藏的结果，不再处理', async () => {
    showResults(repoResult('octocat/hello-world'))
    start(['@octocat']).stop()
    expect(hiddenStates()).toEqual([false])
    showResults(repoResult('octocat/linguist'))
    await flush()
    expect(hiddenStates()).toEqual([false])
  })
})
