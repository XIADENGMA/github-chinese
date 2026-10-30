import { GITHUB_ORIGINS, parseGitHubUrl } from '../../../src/shared/github'

describe('parseGitHubUrl', () => {
  it.each([
    'https://github.com/',
    'https://github.com/vuejs/core/issues?q=is%3Aopen#top',
    'https://gist.github.com/octocat/123',
    'https://www.githubstatus.com/incidents/abc123',
  ])('%s 是 GitHub 页面', (url) => {
    expect(parseGitHubUrl(url)?.href).toBe(new URL(url).href)
  })

  it.each([
    undefined,
    '',
    'not a url',
    'http://github.com/vuejs/core',
    'https://docs.github.com/zh',
    'https://githubstatus.com/',
    'https://eu.githubstatus.com/',
    'https://github.com.evil.example/',
    'https://example.com/github.com',
    'chrome://extensions/',
  ])('%s 不是 GitHub 页面', (url) => {
    expect(parseGitHubUrl(url)).toBeUndefined()
  })

  it('站点列表与 host_permissions 一致', () => {
    expect(GITHUB_ORIGINS).toEqual([
      'https://github.com/*',
      'https://gist.github.com/*',
      'https://www.githubstatus.com/*',
    ])
  })
})
