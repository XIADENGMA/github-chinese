import { describe, expect, it } from 'vitest'
import {
  DEFAULT_NEW_TAB_SCOPES,
  isNewTabScope,
  isSiteLink,
  NEW_TAB_SCOPES,
  pageScope,
  sanitizeNewTabScopes,
  toggleNewTabScope
} from '../../../src/shared/new-tab'

function scopeOf(href: string): ReturnType<typeof pageScope> {
  return pageScope(new URL(href))
}

describe('pageScope', () => {
  it.each([
    ['https://github.com/', 'dashboard'],
    ['https://github.com/dashboard', 'dashboard'],
    ['https://github.com/search?q=vue&type=repositories', 'search'],
    ['https://github.com/vuejs/core/search?q=ref', 'search'],
    ['https://github.com/notifications', 'notifications'],
    ['https://github.com/notifications/subscriptions', 'notifications'],
    ['https://github.com/issues', 'issues'],
    ['https://github.com/issues/assigned', 'issues'],
    ['https://github.com/pulls', 'issues'],
    ['https://github.com/vuejs/core/issues', 'issues'],
    ['https://github.com/vuejs/core/pulls?q=is%3Aopen', 'issues'],
    ['https://github.com/vuejs/core/discussions', 'issues'],
    ['https://github.com/vuejs/core/discussions/categories/q-a', 'issues'],
    ['https://github.com/vuejs/core/labels/bug', 'issues'],
    ['https://github.com/vuejs/core/milestone/1', 'issues'],
    ['https://github.com/vuejs/core/milestones', 'issues'],
    ['https://github.com/orgs/vuejs/discussions', 'issues'],
    ['https://github.com/octocat', 'profiles'],
    ['https://github.com/octocat?tab=repositories', 'profiles'],
    ['https://github.com/orgs/vuejs/repositories', 'profiles'],
    ['https://github.com/orgs/vuejs/people', 'profiles'],
    ['https://github.com/orgs/vuejs', 'profiles'],
    ['https://github.com/stars', 'profiles'],
    ['https://github.com/explore', 'explore'],
    ['https://github.com/trending/typescript', 'explore'],
    ['https://github.com/topics/vue', 'explore'],
    ['https://github.com/collections/clean-code-linters', 'explore'],
    ['https://gist.github.com/octocat', 'profiles'],
    ['https://gist.github.com/octocat/starred', 'profiles'],
    ['https://gist.github.com/starred', 'profiles'],
    ['https://gist.github.com/search?q=vue', 'search'],
    ['https://gist.github.com/discover', 'explore'],
    // 企业版站点：主站同 github.com，代码片段（gist 子域名、主站的 /gist 下）同 gist.github.com
    ['https://github.example.com/search?q=vue', 'search'],
    ['https://octo-corp.ghe.com/vuejs/core/issues', 'issues'],
    ['https://gist.github.example.com/discover', 'explore'],
    ['https://github.example.com/gist/discover', 'explore'],
    ['https://github.example.com/gist/octocat', 'profiles']
  ] as const)('%s → %s', (href, expected) => {
    expect(scopeOf(href)).toBe(expected)
  })

  it.each([
    'https://github.com/vuejs/core',
    'https://github.com/vuejs/core/issues/1',
    'https://github.com/vuejs/core/issues/new',
    'https://github.com/vuejs/core/pull/2',
    'https://github.com/vuejs/core/tree/main/packages',
    'https://github.com/vuejs/core/releases',
    'https://github.com/settings/profile',
    'https://github.com/marketplace',
    'https://github.com/orgs/vuejs/settings',
    'https://github.com/users/octocat/projects/1',
    'https://gist.github.com/',
    'https://gist.github.com/octocat/0831f3fbd83ac4d46451',
    'https://www.githubstatus.com/'
  ])('%s → 不属于任何范围', href => {
    expect(scopeOf(href)).toBeUndefined()
  })
})

describe('isSiteLink', () => {
  it.each([
    ['github.com', 'github.com'],
    ['raw.githubusercontent.com', 'github.com'],
    ['github.com', 'github.example.com'],
    ['github.example.com', 'github.example.com'],
    ['GitHub.Example.com', 'github.example.com'],
    ['gist.github.example.com', 'github.example.com'],
    ['media.github.example.com', 'github.example.com'],
    ['github.example.com', 'gist.github.example.com'],
    ['raw.github.example.com', 'gist.github.example.com'],
    ['octo-corp.ghe.com', 'octo-corp.ghe.com']
  ])('%s（页面在 %s）→ 站内', (host, page) => {
    expect(isSiteLink(host, page)).toBe(true)
  })

  it.each([
    ['example.com', 'github.com'],
    ['github.example.com', 'github.com'],
    ['example.com', 'github.example.com'],
    ['example.com', 'gist.github.example.com'],
    ['github.example.com.evil.test', 'github.example.com'],
    ['notgithub.example.com', 'github.example.com'],
    ['other-corp.ghe.com', 'octo-corp.ghe.com']
  ])('%s（页面在 %s）→ 站外', (host, page) => {
    expect(isSiteLink(host, page)).toBe(false)
  })
})

describe('范围的读取与开关', () => {
  it('不是数组时用默认值；丢弃未知项、去重，按固定顺序', () => {
    expect(sanitizeNewTabScopes(undefined)).toEqual(DEFAULT_NEW_TAB_SCOPES)
    expect(sanitizeNewTabScopes('search')).toEqual(DEFAULT_NEW_TAB_SCOPES)
    expect(sanitizeNewTabScopes(['search', 'unknown', 'external', 'search', 3])).toEqual(['external', 'search'])
    expect(sanitizeNewTabScopes([])).toEqual([])
  })

  it('开、关一项，顺序不变', () => {
    expect(toggleNewTabScope(['external', 'search'], 'content', true)).toEqual(['external', 'content', 'search'])
    expect(toggleNewTabScope(['external', 'search'], 'external', false)).toEqual(['search'])
    expect(toggleNewTabScope(['search'], 'search', true)).toEqual(['search'])
  })

  it('isNewTabScope', () => {
    for (const scope of NEW_TAB_SCOPES) expect(isNewTabScope(scope)).toBe(true)
    expect(isNewTabScope('repository')).toBe(false)
  })
})
