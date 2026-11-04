import { describe, expect, it } from 'vitest'
import {
  AUTO_LOAD_SCOPES,
  autoLoadPageScope,
  DEFAULT_AUTO_LOAD_SCOPES,
  sanitizeAutoLoadScopes,
  toggleAutoLoadScope
} from '../../../src/shared/auto-load'

function scopeOf(href: string): ReturnType<typeof autoLoadPageScope> {
  return autoLoadPageScope(new URL(href))
}

describe('autoLoadPageScope', () => {
  it.each([
    ['https://github.com/', 'dashboard'],
    ['https://github.com/dashboard', 'dashboard'],
    ['https://github.com/dashboard-feed', 'dashboard'],
    ['https://github.com/search?q=vue&type=repositories', 'search'],
    ['https://github.com/vuejs/core/search?q=ref', 'search'],
    ['https://github.com/issues', 'issues'],
    ['https://github.com/issues/created', 'issues'],
    ['https://github.com/vuejs/core/issues', 'issues'],
    ['https://github.com/vuejs/core/issues/1', 'issues'],
    ['https://github.com/vuejs/core/labels/bug', 'issues'],
    ['https://github.com/vuejs/core/milestones', 'issues'],
    ['https://github.com/vuejs/core/milestone/1', 'issues'],
    ['https://github.com/pulls', 'pulls'],
    ['https://github.com/pulls/involves', 'pulls'],
    ['https://github.com/vuejs/core/pulls?q=is%3Aclosed', 'pulls'],
    ['https://github.com/vuejs/core/pull/2', 'pulls'],
    ['https://github.com/vuejs/core/pull/2/commits', 'pulls'],
    ['https://github.com/discussions', 'discussions'],
    ['https://github.com/vuejs/core/discussions', 'discussions'],
    ['https://github.com/vuejs/core/discussions/3', 'discussions'],
    ['https://github.com/vuejs/core/discussions/categories/q-a', 'discussions'],
    ['https://github.com/orgs/vuejs/discussions', 'discussions'],
    ['https://github.com/vuejs/core/actions', 'actions'],
    ['https://github.com/vuejs/core/actions/workflows/ci.yml', 'actions'],
    ['https://github.com/vuejs/core/releases', 'releases'],
    ['https://github.com/vuejs/core/releases/tag/v3.5.0', 'releases'],
    ['https://github.com/vuejs/core/tags', 'tags'],
    ['https://github.com/vuejs/core/commits', 'commits'],
    ['https://github.com/vuejs/core/commits/main/packages', 'commits'],
    ['https://github.com/vuejs/core/commit/abc123', 'commits'],
    ['https://github.com/octocat', 'profiles'],
    ['https://github.com/octocat?tab=stars', 'profiles'],
    ['https://github.com/orgs/vuejs', 'profiles'],
    ['https://github.com/orgs/vuejs/repositories', 'profiles'],
    ['https://github.com/orgs/vuejs/people', 'profiles'],
    ['https://github.com/repos', 'profiles'],
    ['https://github.com/watching', 'profiles'],
    ['https://github.com/stars/octocat', 'profiles'],
    ['https://gist.github.com/octocat', 'profiles'],
    ['https://gist.github.com/octocat/starred', 'profiles'],
    ['https://gist.github.com/starred', 'profiles'],
    ['https://gist.github.com/search?q=vue', 'search']
  ] as const)('%s → %s', (href, expected) => {
    expect(scopeOf(href)).toBe(expected)
  })

  it.each([
    'https://github.com/vuejs/core',
    'https://github.com/vuejs/core/branches',
    'https://github.com/vuejs/core/forks',
    'https://github.com/vuejs/core/stargazers',
    'https://github.com/vuejs/core/network/dependents',
    'https://github.com/vuejs/core/constructor',
    'https://github.com/marketplace?type=apps',
    'https://github.com/mcp',
    'https://github.com/topics/vue',
    'https://github.com/explore',
    'https://github.com/notifications',
    'https://github.com/settings/profile',
    'https://github.com/orgs',
    'https://github.com/orgs/vuejs/settings',
    'https://github.com/users/octocat/projects/1',
    'https://github.com/organizations/vuejs/settings/profile',
    'https://gist.github.com/',
    'https://gist.github.com/discover',
    'https://gist.github.com/octocat/0123456789abcdef',
    'https://www.githubstatus.com/history'
  ])('其他页面：%s', href => {
    expect(scopeOf(href)).toBe('other')
  })
})

describe('自动加载的范围', () => {
  it('默认全部开启', () => {
    expect(DEFAULT_AUTO_LOAD_SCOPES).toEqual(AUTO_LOAD_SCOPES)
    expect(AUTO_LOAD_SCOPES).toEqual([
      'search',
      'issues',
      'pulls',
      'discussions',
      'actions',
      'releases',
      'tags',
      'commits',
      'dashboard',
      'profiles',
      'sidePanel',
      'other'
    ])
  })

  it('读取：不是数组时用默认值；丢弃未知项，去重，按固定顺序', () => {
    expect(sanitizeAutoLoadScopes(undefined)).toEqual(DEFAULT_AUTO_LOAD_SCOPES)
    expect(sanitizeAutoLoadScopes('search')).toEqual(DEFAULT_AUTO_LOAD_SCOPES)
    expect(sanitizeAutoLoadScopes(['other', 'search', 'unknown', 'search', 3])).toEqual(['search', 'other'])
    expect(sanitizeAutoLoadScopes([])).toEqual([])
  })

  it('开关一项：返回新列表，按固定顺序，不改原列表', () => {
    const scopes = ['issues', 'other'] as const
    expect(toggleAutoLoadScope(scopes, 'search', true)).toEqual(['search', 'issues', 'other'])
    expect(toggleAutoLoadScope(scopes, 'other', false)).toEqual(['issues'])
    expect(toggleAutoLoadScope(scopes, 'issues', true)).toEqual(['issues', 'other'])
    expect(scopes).toEqual(['issues', 'other'])
  })
})
