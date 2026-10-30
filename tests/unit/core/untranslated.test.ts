import { describe, expect, it } from 'vitest'
import { createUntranslatedBuffer, isCollectable, isSensitivePath, kindBit } from '../../../src/core/untranslated'

describe('isCollectable', () => {
  it.each([
    'Open issues',
    'Sign in to GitHub',
    'Updated 3 days ago',
    'Filter by label',
    'No results matched your search.',
  ])('收集界面文字：%s', (text) => {
    expect(isCollectable(text)).toBe(true)
  })

  it.each([
    ['', '空串'],
    ['x', '单个字母'],
    ['5m', '单个字母'],
    ['123', '无字母'],
    ['https://github.com/vuejs/core', '网址'],
    ['www.example.com', '网址'],
    ['vuejs.org', '域名'],
    ['github.com/settings', '域名路径'],
    ['octocat@github.com', '邮箱'],
    ['v3.5.12', '版本号'],
    ['1.2.3-beta.1', '版本号'],
    ['a1b2c3d', '短哈希'],
    ['3f786850e387550fdab836ed7e6dc881de23001b', '完整哈希'],
    ['@octocat', '提及'],
    ['@vuejs/core-team', '团队提及'],
    ['#123', '编号'],
    ['vuejs/core#123', '跨仓库编号'],
    ['GH-123', '外部编号'],
    ['vuejs/core', '仓库路径'],
    ['/settings/profile', '绝对路径'],
    ['src/core/', '目录'],
    ['packages/', '目录'],
    ['package.json', '文件名'],
    ['README.md', '文件名'],
    ['Oct 26, 2026', '日期'],
    ['Mon, Oct 26', '日期'],
    ['October 2026', '月份'],
    ['26 Oct 2026', '日期'],
    ['Oct 26, 2026, 10:30 AM GMT+8', '日期时间'],
    ['2026-10-26', 'ISO 日期'],
    ['2026-10-26T10:00:00Z', 'ISO 时间'],
    ['10:30 AM', '时刻'],
    ['10:30 PM PST', '时刻'],
    ['由 octocat 打开', '含汉字的译文'],
    ['新建代码片段', '含汉字的译文'],
  ])('排除 %s（%s）', (text) => {
    expect(isCollectable(text)).toBe(false)
  })

  it('超长文本不收集', () => {
    expect(isCollectable('word '.repeat(50).trim())).toBe(false)
    expect(isCollectable('word '.repeat(10).trim(), 20)).toBe(false)
  })

  it('哈希必须含数字：纯字母单词不算哈希', () => {
    expect(isCollectable('acceded')).toBe(true)
  })

  it.each([
    ['1a2b3-4c5d6', '恢复码'],
    ['JBSWY3DPEHPK3PXP', 'TOTP 密钥'],
    ['jbsw y3dp ehpk 3pxp', '分组的 TOTP 密钥'],
    ['a1B2c3D4e5F6g7H8i9J0k', '长串字母数字混合'],
    ['Token ghp_abcdEFGH1234', '个人访问令牌'],
    ['Token github_pat_11ABCDEFG0123', '细粒度令牌'],
    ['Token gho_abcdEFGH1234', 'OAuth 令牌'],
    ['Token ghu_abcdEFGH1234', '应用用户令牌'],
    ['Token ghs_abcdEFGH1234', '应用安装令牌'],
    ['Token ghr_abcdEFGH1234', '刷新令牌'],
    ['Key SHA256:abcdefghijklmnopqrstuv', 'SSH 指纹'],
    ['Fingerprint 16:27:ac:a5:76:28:2d:36:63:1b:56:4d:eb:df:a6:48', 'MD5 指纹'],
    ['Sent to user@example.com', '句中邮箱'],
    ['Signed in from 192.0.2.1', 'IPv4'],
    ['Signed in from 2001:db8::1', 'IPv6 缩写'],
    ['Signed in from 2001:db8:85a3:8d3:1319:8a2e:370:7348', '句中 IPv6'],
    ['2001:0db8:85a3:0000:0000:8a2e:0370:7334', 'IPv6'],
    ['Visa ending in 4242', '卡号尾号'],
    ['Visa •••• 0000', '卡号尾号（圆点）'],
    ['Card ••••0000', '卡号尾号（圆点）'],
    ['Visa •• 0000', '卡号尾号（2 个圆点）'],
    ['Card •••0000', '卡号尾号（3 个圆点）'],
  ])('排除密钥与个人信息 %s（%s）', (text) => {
    expect(isCollectable(text)).toBe(false)
  })

  it.each([
    'Recovery codes',
    'Two-factor authentication',
    'Sign in from a new device',
    'internationalization',
    'Mention @octocat',
    'a b',
    // 单个圆点是分隔符，不是卡号掩码
    'Sample text • 2026',
  ])('相关界面文字照常收集：%s', (text) => {
    expect(isCollectable(text)).toBe(true)
  })
})

describe('isSensitivePath', () => {
  it.each([
    '/settings/tokens',
    '/settings/tokens/new',
    '/settings/personal-access-tokens/123',
    '/settings/security',
    '/settings/security-log',
    '/settings/sponsors-log',
    '/settings/auth/recovery-codes',
    '/settings/two_factor_authentication/setup/intro',
    '/settings/sessions',
    '/settings/emails',
    '/settings/keys',
    '/settings/ssh/new',
    '/settings/gpg/new',
    '/settings/billing/summary',
    '/settings/apps/my-app',
    '/settings/applications/123',
    '/settings/developers',
    '/settings/installations',
    '/settings/credentials',
    '/settings/secrets',
    '/settings/variables',
    '/settings/codespaces',
    '/settings/codespaces/secrets/new',
    '/settings/connections/applications/Iv1abc',
    '/organizations/acme/settings/billing',
    '/organizations/acme/settings/audit-log',
    '/organizations/acme/settings/personal-access-token-requests',
    '/organizations/acme/billing/plans',
    '/orgs/acme/settings/billing',
    '/orgs/acme/settings/secrets/actions',
    '/orgs/acme/people/octocat/sso',
    '/orgs/acme/people/octocat/sso/identity',
    '/orgs/acme/billing',
    '/enterprises/acme/settings/audit-log',
    '/enterprises/acme/settings/security',
    '/enterprises/acme/settings/billing',
    '/enterprises/acme/settings/personal-access-tokens',
    '/enterprises/acme/audit-log',
    '/enterprises/acme/billing/usage',
    '/enterprises/acme/licensing',
    '/enterprises/acme/enterprise_licensing',
    '/enterprises/acme/people/octocat/sso',
    '/enterprises/acme/people/octocat/sso/identity',
    '/account/upgrade',
    '/account/billing/history',
    '/marketplace/sample-app/order/abc123',
    '/github-copilot/signup',
    '/github-copilot/signup/success',
    '/github-copilot/free_signup',
    '/github-copilot/pro/signup',
    '/github-copilot/business_signup/organization/payment',
    '/sponsors/octocat/sponsorships',
    '/sponsors/octocat/dashboard',
    '/sponsors/octocat/dashboard/payouts',
    '/sponsors/octocat/dashboard/your_sponsors',
    '/vuejs/core/settings/secrets/actions',
    '/vuejs/core/settings/variables/actions',
    '/vuejs/core/settings/keys',
    '/vuejs/core/settings/hooks/123',
    '/vuejs/core/settings/environments',
    '/vuejs/core/security/secret-scanning/17',
    '/vuejs/core/security/secret-scanning',
    '/orgs/acme/security/alerts/secret-scanning',
    '/orgs/acme/security/alerts/secret-scanning/17',
    '/enterprises/acme/security/alerts/secret-scanning',
    '/login',
    '/login/oauth/authorize',
    '/logout',
    '/session',
    '/sessions/two-factor',
    '/password_reset',
    '/signup',
    '/join',
    '/account_verifications',
  ])('不收集：%s', (pathname) => {
    expect(isSensitivePath(pathname)).toBe(true)
  })

  it.each([
    '//settings/tokens',
    '/settings//tokens',
    '/settings/tokens/',
    '/SETTINGS/Tokens',
    '/settings/%74okens',
    '/settings/tokens.html',
    '//login',
    '/login.html',
    '/%6Cogin',
    '/vuejs/core//settings/secrets/actions',
    '/vuejs//core/settings/secrets/actions',
    // 解码出的 %2F 改变分段：原始路径命中的仍不收集
    '/orgs/ac%2Fme/settings/billing',
    // 段内编码的 / 按分段处理
    '/settings/tokens.html%2F',
    '/settings/%74okens%2Fnew',
    '/settings%2Ftokens',
    // 任意格式后缀
    '/account/upgrade.json',
    '/settings/tokens.atom',
  ])('地址变体按规范化后的路径判断，不收集：%s', (pathname) => {
    expect(isSensitivePath(pathname)).toBe(true)
  })

  it.each([
    '/settings/profile',
    '/settings/appearance',
    '/settings/notifications',
    '/vuejs/core/settings',
    '/vuejs/core/settings/branches',
    '/vuejs/core/issues',
    '/vuejs/core/security',
    '/vuejs/core/security/dependabot',
    '/vuejs/billing',
    '/acme/settings/tokens',
    '/organizations/acme/settings/codespaces',
    '/orgs/acme/people',
    '/orgs/acme/people/octocat',
    '/enterprises/acme',
    '/enterprises/acme/people',
    '/enterprises/acme/people/octocat',
    '/enterprises/acme/sso',
    '/enterprises/acme/settings/profile',
    '/enterprises/acme/billing-foo',
    '/login-help',
    '/login-help.html',
    '/account/organizations/new',
    '/marketplace/sample-app',
    '/github-copilot',
    '/github-copilot/pro',
    '/sponsors',
    '/sponsors/explore',
    '/sponsors/accounts',
    '/sponsors/octocat',
    '/octocat/dashboard',
    // 解码、去后缀不会把普通页判为不收集
    '/%76uejs/core',
    '/vuejs/core/blob/main/login.html',
    '/vuejs/core.json',
    '/login-help.json',
  ])('照常收集：%s', (pathname) => {
    expect(isSensitivePath(pathname)).toBe(false)
  })
})

describe('kindBit', () => {
  it('text、attr 依次为 1、2；标签页标题不收集', () => {
    expect([kindBit('text'), kindBit('attr')]).toEqual([1, 2])
  })
})

describe('createUntranslatedBuffer', () => {
  it('按页面类型与原文合并：累计出现次数与出处，每次访问只计一页', () => {
    const buffer = createUntranslatedBuffer()
    buffer.add('Open issues', 'text', 'issues')
    buffer.add('Open issues', 'attr', 'issues')
    buffer.add('Filter by label', 'text', 'issues')
    expect(buffer.drain()).toEqual([
      ['Open issues', 'issues', 3, 2, 1],
      ['Filter by label', 'issues', 1, 1, 1],
    ])
    expect(buffer.drain()).toEqual([])
  })

  it('同一次访问内取出后再出现，不再计页面数；新访问重新计数', () => {
    const buffer = createUntranslatedBuffer()
    buffer.add('Open issues', 'text', 'issues')
    buffer.drain()
    buffer.add('Open issues', 'text', 'issues')
    expect(buffer.drain()).toEqual([['Open issues', 'issues', 1, 1, 0]])
    buffer.startVisit()
    buffer.add('Open issues', 'text', 'pulls')
    expect(buffer.drain()).toEqual([['Open issues', 'pulls', 1, 1, 1]])
  })

  it('一批之内跨越多次访问时页面数累加', () => {
    const buffer = createUntranslatedBuffer()
    buffer.add('Open issues', 'text', 'issues')
    buffer.startVisit()
    buffer.add('Open issues', 'text', 'issues')
    expect(buffer.drain()).toEqual([['Open issues', 'issues', 1, 2, 2]])
  })

  it('忽略不值得收集的文本', () => {
    const buffer = createUntranslatedBuffer({ maxLength: 20 })
    buffer.add('https://example.com', 'text', 'code')
    buffer.add('x', 'text', 'code')
    buffer.add('This text is far too long', 'text', 'code')
    expect(buffer.drain()).toEqual([])
  })

  it('待取出已满时不再新增，已有条目继续计数', () => {
    const buffer = createUntranslatedBuffer({ maxPending: 2 })
    buffer.add('First text', 'text', 'code')
    buffer.add('Second text', 'text', 'code')
    buffer.add('Third text', 'text', 'code')
    buffer.add('First text', 'attr', 'code')
    expect(buffer.drain()).toEqual([
      ['First text', 'code', 3, 2, 1],
      ['Second text', 'code', 1, 1, 1],
    ])
    // 满时被丢弃的文本不占用本次访问的页面计数
    buffer.add('Third text', 'text', 'code')
    expect(buffer.drain()).toEqual([['Third text', 'code', 1, 1, 1]])
  })

  it('clear 丢弃待取出的增量与本次访问记录', () => {
    const buffer = createUntranslatedBuffer()
    buffer.add('Open issues', 'text', 'issues')
    buffer.clear()
    expect(buffer.drain()).toEqual([])
    buffer.add('Open issues', 'text', 'issues')
    expect(buffer.drain()).toEqual([['Open issues', 'issues', 1, 1, 1]])
  })
})
