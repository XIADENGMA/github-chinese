/** 扩展生效的站点（含 GitHub 状态页），与 wxt.config.ts 的 host_permissions 保持一致 */
export const GITHUB_ORIGINS: readonly string[] = [
  'https://github.com/*',
  'https://gist.github.com/*',
  'https://www.githubstatus.com/*',
]

const GITHUB_HOSTS: ReadonlySet<string> = new Set(['github.com', 'gist.github.com', 'www.githubstatus.com'])

/** 解析扩展生效站点的页面地址；不是 github.com / gist.github.com / www.githubstatus.com 时返回 undefined */
export function parseGitHubUrl(url: string | undefined): URL | undefined {
  if (!url) return undefined
  try {
    const parsed = new URL(url)
    return parsed.protocol === 'https:' && GITHUB_HOSTS.has(parsed.hostname) ? parsed : undefined
  } catch {
    return undefined
  }
}
