// @vitest-environment-options { "url": "https://github.example.com/search?q=vue&type=repositories" }
import { afterEach, describe, expect, it } from 'vitest'
import { createSearchPurifier, type SearchPurifier } from '../../../src/core/search-purify'
import { compileSearchBlockRules } from '../../../src/shared/search-block'

let purifier: SearchPurifier | undefined

/** 存储库结果：标题行的链接为存储库（站内相对链接） */
function repoResult(repo: string): string {
  return `<div class="Result__x"><h3><div class="search-title"><a href="/${repo}"><span class="search-match">${repo}</span></a></div></h3></div>`
}

function hiddenStates(): boolean[] {
  return [...document.querySelectorAll<HTMLElement>('[data-testid="results-list"] > *')].map(
    item => item.style.getPropertyValue('display') === 'none'
  )
}

function start(): void {
  document.body.innerHTML = `<div data-testid="results-list">${repoResult('octocat/hello-world')}${repoResult('vuejs/core')}</div>`
  purifier = createSearchPurifier(document, { active: () => true, rules: () => compileSearchBlockRules(['@octocat']) })
}

afterEach(() => {
  purifier?.stop()
  purifier = undefined
  document.body.innerHTML = ''
  history.replaceState(null, '', '/search?q=vue&type=repositories')
})

describe('createSearchPurifier：企业版站点', () => {
  it('主站的搜索结果页同样净化：按本站的链接判断所有者', () => {
    start()
    expect(hiddenStates()).toEqual([true, false])
  })

  it('主站 /gist 下的代码片段搜索页：不处理', () => {
    history.replaceState(null, '', '/gist/search?q=vue')
    start()
    expect(hiddenStates()).toEqual([false, false])
  })
})
