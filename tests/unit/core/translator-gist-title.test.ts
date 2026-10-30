// @vitest-environment-options { "url": "https://gist.github.com/octocat/0123456789abcdef0123" }
import { afterEach, describe, expect, it } from 'vitest'
import { createTranslator, type Translator } from '../../../src/core/translator'
import type { LocaleBundle } from '../../../src/core/types'
import { TEST_BUNDLE, testMatcher } from './helpers'

/** 测试词典加上 gist 页的子页名与列表页标题 */
const BUNDLE: LocaleBundle = [
  ...TEST_BUNDLE,
  ['gist', { scoped: { Forks: '复刻' }, regexp: [[/^([\w-]+)[’']s gists$/, '$1 的 Gist']] }],
]

let translator: Translator | undefined

afterEach(() => {
  translator?.stop()
  translator = undefined
  document.head.innerHTML = ''
  history.replaceState(null, '', '/octocat/0123456789abcdef0123')
})

function start(title: string): void {
  document.head.innerHTML = `<title>${title}</title>`
  translator = createTranslator({ matcher: testMatcher(undefined, BUNDLE), host: window })
  translator.start()
}

describe('gist 页标题', () => {
  it('gist 名不翻译', () => {
    start('Settings · Issues · GitHub')
    expect(document.title).toBe('Settings · Issues · GitHub')
  })

  it('不是单个 gist 页照常翻译', () => {
    history.replaceState(null, '', '/discover')
    start('Settings · GitHub')
    expect(document.title).toBe('设置 · GitHub')
    translator!.stop()
    expect(document.title).toBe('Settings · GitHub')
  })

  it('纯数字登录名的 gist 列表页照常翻译', () => {
    history.replaceState(null, '', '/1234567')
    start('1234567’s gists · GitHub')
    expect(document.title).toBe('1234567 的 Gist · GitHub')
  })

  it('纯数字登录名的 gist 子页：子页名照常翻译，gist 名不翻译', () => {
    history.replaceState(null, '', '/1234567/0123456789abcdef0123/forks')
    start('Forks · Settings · GitHub')
    expect(document.title).toBe('复刻 · Settings · GitHub')
  })
})
