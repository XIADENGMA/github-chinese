import {
  CJK,
  expect,
  extractJsonScripts,
  extractTitle,
  FIXTURE_URL,
  fx,
  offlineTest as test,
  readFixture,
  repoTab,
  waitForSimulation,
} from './fixtures'

/** 存储库标签页 → 期望译文（GLOSSARY 术语；产品名 Actions 按术语表译出） */
const REPO_TABS: ReadonlyArray<readonly [item: string, text: string]> = [
  ['code', '代码'],
  ['issues', '议题'],
  ['pull-requests', '拉取请求'],
  ['actions', '操作'],
  ['projects', '项目'],
  ['security', '安全'],
  ['insights', '见解'],
  ['settings', '设置'],
]

test.describe('离线夹具：存储库首页', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(FIXTURE_URL.repo)
  })

  test('存储库标签页与 Watch / Fork / Star 被翻译', async ({ page }) => {
    for (const [item, text] of REPO_TABS) await expect(repoTab(page, item)).toHaveText(text)
    // React 拆开的计数节点保持原样
    await expect(page.locator('[data-tab-item="issues"] [data-component="CounterLabel"]')).toHaveText('546')
    await expect(fx(page, 'watch-label')).toHaveText('关注')
    await expect(fx(page, 'fork')).toContainText('复刻')
    await expect(fx(page, 'fork')).toContainText('3')
    await expect(fx(page, 'star')).toContainText('星标')
    await expect(fx(page, 'star')).toContainText('42')
  })

  test('属性被翻译', async ({ page }) => {
    await expect(fx(page, 'search')).toHaveAttribute('placeholder', '搜索')
    await expect(fx(page, 'search')).toHaveAttribute('aria-label', '搜索')
    await expect(fx(page, 'repo-nav')).toHaveAttribute('aria-label', '存储库')
    await expect(fx(page, 'notifications')).toHaveAttribute('aria-label', '通知')
  })

  test('README、用户内容与内嵌 JSON 保持原样', async ({ page }) => {
    await expect(repoTab(page, 'issues')).toHaveText('议题')
    await waitForSimulation(page)

    const readme = fx(page, 'readme')
    const readmeText = ((await readme.textContent()) ?? '').replace(/\s+/g, ' ')
    expect(readmeText).not.toMatch(CJK)
    for (const word of ['Issues', 'Pull requests', 'Settings', 'Security', 'Insights', 'Watch', 'Fork', 'Star']) {
      await expect(readme.getByText(word, { exact: true }).first()).toBeVisible()
    }
    expect(readmeText).toContain('Issues and Pull requests are welcome.')
    await expect(fx(page, 'readme-link')).toHaveAttribute('title', 'Issues')
    await expect(fx(page, 'readme-link')).toHaveAttribute('aria-label', 'Pull requests')
    await expect(fx(page, 'description')).toHaveText('Hello world, but with extra steps')

    const html = await readFixture('repo.html')
    const scripts = await page
      .locator('script[type="application/json"]')
      .evaluateAll((elements) => elements.map((element) => element.textContent))
    expect(scripts).toEqual(extractJsonScripts(html))
  })

  test('延迟插入的内容与 React 改写后的文本被重新翻译', async ({ page }) => {
    await waitForSimulation(page)
    // characterData：React 把 PR 标签页文字写回英文
    await expect(repoTab(page, 'pull-requests')).toHaveText('拉取请求')
    // childList：React 重建 Watch 文本节点
    await expect(fx(page, 'watch-label')).toHaveText('关注')
    // attributes：React 把 placeholder 写回英文
    await expect(fx(page, 'search')).toHaveAttribute('placeholder', '搜索')
    // 延迟插入的对话框
    await expect(fx(page, 'dynamic')).toHaveAttribute('aria-label', '设置')
    await expect(fx(page, 'dynamic-title')).toHaveText('设置')
    await expect(fx(page, 'dynamic-close')).toHaveAttribute('aria-label', '关闭')
    await expect(fx(page, 'dynamic-cancel')).toHaveText('取消')
    await expect(fx(page, 'dynamic-save')).toHaveText('保存')
  })

  test('relative-time 带 lang="zh-CN"', async ({ page }) => {
    const times = page.locator('relative-time')
    await expect(times).toHaveCount(3)
    await expect(page.locator('relative-time:not([lang="zh-CN"])')).toHaveCount(0)
    // 夹具中的 relative-time 按 lang 用 Intl 渲染 shadow DOM；中文与数字之间补空格
    const rendered = (): Promise<string> => times.first().evaluate((element) => element.shadowRoot?.textContent ?? '')
    await expect.poll(rendered).toMatch(CJK)
    expect(await rendered()).not.toMatch(/\d[一-鿿]|[一-鿿]\d/)
  })
})

test.describe('离线夹具：议题列表', () => {
  test('标题被翻译', async ({ page }) => {
    const original = extractTitle(await readFixture('issues.html'))
    await page.goto(FIXTURE_URL.issues)
    await expect(repoTab(page, 'issues')).toHaveText('议题')
    await expect(page).toHaveTitle(/议题/)
    await expect(page).toHaveTitle(/octo-org\/hello-world/)
    expect(await page.title()).not.toBe(original)
  })

  test('默认标签名被翻译', async ({ page }) => {
    await page.goto(FIXTURE_URL.issues)
    await expect(page.locator('.IssueLabel').first()).toHaveText('缺陷')
  })
})
