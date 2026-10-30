// @vitest-environment-options { "url": "https://github.com/vuejs/core/issues" }
import { afterEach, describe, expect, it } from 'vitest'
import { createTranslator, type Translator } from '../../../src/core/translator'
import { settle, testMatcher } from './helpers'

const HOME = '/vuejs/core/issues'

let translator: Translator | undefined

/** 先改地址再启动：地址用完整网址，'//settings' 这类相对写法会被当成主机名 */
function startAt(href: string, html: string): Translator {
  history.replaceState(null, '', href)
  document.body.innerHTML = html
  translator = createTranslator({ matcher: testMatcher(), host: window, collectUntranslated: true })
  translator.start()
  return translator
}

afterEach(() => {
  translator?.stop()
  translator = undefined
  document.body.innerHTML = ''
  history.replaceState(null, '', HOME)
})

describe('不收集的页面：地址变体', () => {
  it.each([
    'https://github.com//settings/tokens',
    'https://github.com/settings//tokens',
    'https://github.com/settings/%74okens',
    'https://github.com/settings/tokens.html',
    'https://github.com/SETTINGS/TOKENS/',
    'https://github.com//login',
  ])('%s：不收集', (href) => {
    const t = startAt(href, '<p>Sample text</p>')
    expect(t.drainUntranslated()).toEqual([])
  })

  it('软导航到地址变体：之后出现的文字不收集', async () => {
    const t = startAt(`https://github.com${HOME}`, '<p>Sample text</p>')
    expect(t.drainUntranslated()).toEqual([['Sample text', 'issues', 1, 1, 1]])

    history.pushState(null, '', 'https://github.com/settings//tokens')
    document.body.innerHTML = '<p>Hidden phrase</p>'
    await settle()
    expect(t.pages).toEqual(['common', 'settings'])
    expect(t.drainUntranslated()).toEqual([])
  })

  it('结账页不收集', () => {
    const t = startAt('https://github.com/account/upgrade', '<p>Sample text</p><p>Another phrase</p>')
    expect(t.drainUntranslated()).toEqual([])
  })
})

describe('普通页面照常收集', () => {
  it('规范地址', () => {
    const t = startAt(`https://github.com${HOME}`, '<p>Sample text</p>')
    expect(t.drainUntranslated()).toEqual([['Sample text', 'issues', 1, 1, 1]])
  })

  it('普通页的地址变体', () => {
    const t = startAt('https://github.com//vuejs/core/issues', '<p>Sample text</p>')
    expect(t.drainUntranslated()).toEqual([['Sample text', 'issues', 1, 1, 1]])
  })
})
