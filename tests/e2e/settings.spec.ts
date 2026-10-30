import {
  CJK,
  expect,
  extractTitle,
  FIXTURE_URL,
  fx,
  offlineTest as test,
  readFixture,
  repoTab,
  waitForSimulation,
} from './fixtures'

/** 全局标记：页面主世界上确认未被刷新，后台上确认已重新启动 */
interface MarkedGlobal {
  __fxMarker?: string
}

test.describe('设置联动', () => {
  test('关闭总开关后恢复英文且无需刷新，重新开启后再次翻译', async ({ page, extension }) => {
    const originalTitle = extractTitle(await readFixture('repo.html'))
    await page.goto(FIXTURE_URL.repo)
    await expect(repoTab(page, 'pull-requests')).toHaveText('拉取请求')
    // Issues 的译名随术语表调整，不写死：记下首轮译文，重新开启后比对
    await expect(repoTab(page, 'issues')).toHaveText(CJK)
    const issuesText = (await repoTab(page, 'issues').textContent()) ?? ''
    await waitForSimulation(page)
    await expect(fx(page, 'dynamic-cancel')).toHaveText('取消')
    await page.evaluate(() => {
      ;(window as MarkedGlobal).__fxMarker = 'same-document'
    })

    await extension.setSettings({ enabled: false })
    await page.bringToFront()
    await expect(repoTab(page, 'pull-requests')).toHaveText('Pull requests')
    await expect(repoTab(page, 'issues')).toHaveText('Issues')
    await expect(repoTab(page, 'code')).toHaveText('Code')
    await expect(fx(page, 'watch-label')).toHaveText('Watch')
    await expect(fx(page, 'fork')).toContainText('Fork')
    await expect(fx(page, 'star')).toContainText('Star')
    await expect(fx(page, 'search')).toHaveAttribute('placeholder', 'Search')
    await expect(fx(page, 'repo-nav')).toHaveAttribute('aria-label', 'Repository')
    await expect(fx(page, 'dynamic-cancel')).toHaveText('Cancel')
    await expect(fx(page, 'dynamic')).toHaveAttribute('aria-label', 'Settings')
    await expect(page.locator('relative-time[lang="zh-CN"]')).toHaveCount(0)
    await expect(page).toHaveTitle(originalTitle)
    expect(await page.evaluate(() => (window as MarkedGlobal).__fxMarker)).toBe('same-document')

    await extension.setSettings({ enabled: true })
    await page.bringToFront()
    await expect(repoTab(page, 'pull-requests')).toHaveText('拉取请求')
    await expect(repoTab(page, 'issues')).toHaveText(issuesText)
    await expect(fx(page, 'watch-label')).toHaveText('关注')
    await expect(fx(page, 'search')).toHaveAttribute('placeholder', '搜索')
    await expect(fx(page, 'dynamic-cancel')).toHaveText('取消')
    await expect(page.locator('relative-time:not([lang="zh-CN"])')).toHaveCount(0)
    expect(await page.evaluate(() => (window as MarkedGlobal).__fxMarker)).toBe('same-document')
  })

  test('关闭总开关后标题恢复原文，重新开启后再次翻译', async ({ page, extension }) => {
    // 存储库首页的标题不命中词典：用问题列表的标题
    const originalTitle = extractTitle(await readFixture('issues.html'))
    await page.goto(FIXTURE_URL.issues)
    await expect(page).toHaveTitle(CJK)
    await expect(page).not.toHaveTitle(originalTitle)
    await page.evaluate(() => {
      ;(window as MarkedGlobal).__fxMarker = 'same-document'
    })

    await extension.setSettings({ enabled: false })
    await page.bringToFront()
    await expect(page).toHaveTitle(originalTitle)

    await extension.setSettings({ enabled: true })
    await page.bringToFront()
    await expect(page).toHaveTitle(CJK)
    await expect(page).not.toHaveTitle(originalTitle)
    expect(await page.evaluate(() => (window as MarkedGlobal).__fxMarker)).toBe('same-document')
  })

  test('排除路径生效', async ({ page, extension }) => {
    const originalTitle = extractTitle(await readFixture('issues.html'))
    await extension.setSettings({ excludedPaths: ['/*/*/issues'] })

    // 未排除的页面照常翻译（Issues 的译名随术语表调整，只断言已译成中文）
    await page.goto(FIXTURE_URL.repo)
    await expect(repoTab(page, 'issues')).toHaveText(CJK)

    await page.goto(FIXTURE_URL.issues)
    await expect.poll(() => extension.status(FIXTURE_URL.issues)).toMatchObject({ excluded: true, active: false })
    await page.bringToFront()
    await expect(repoTab(page, 'issues')).toHaveText('Issues')
    await expect(repoTab(page, 'pull-requests')).toHaveText('Pull requests')
    await expect(fx(page, 'new-issue')).toHaveText('New issue')
    await expect(page.locator('relative-time[lang="zh-CN"]')).toHaveCount(0)
    await expect(page).toHaveTitle(originalTitle)

    // 去掉排除规则后同一页面恢复翻译
    await extension.setSettings({ excludedPaths: [] })
    await page.reload()
    await expect(repoTab(page, 'issues')).toHaveText(CJK)
  })

  test('已打开的页面实时应用自定义词条，后台休眠后照常转发', async ({ page, extension }) => {
    await page.goto(FIXTURE_URL.repo)
    await expect(repoTab(page, 'pull-requests')).toHaveText('拉取请求')
    await waitForSimulation(page)
    await page.evaluate(() => {
      ;(window as MarkedGlobal).__fxMarker = 'same-document'
    })

    await extension.setCustomEntries({ 'Pull requests': '合并请求' })
    await page.bringToFront()
    await expect(repoTab(page, 'pull-requests')).toHaveText('合并请求')

    // 后台的全局环境上留标记：重新启动后是新的全局环境，标记随之消失
    await extension.serviceWorker().evaluate(() => {
      ;(globalThis as MarkedGlobal).__fxMarker = 'before-stop'
    })
    await extension.stopServiceWorker()
    await extension.setCustomEntries({ 'Pull requests': '拉取请求列表' })
    await page.bringToFront()
    await expect(repoTab(page, 'pull-requests')).toHaveText('拉取请求列表')
    // 转发来自被消息唤醒的新后台
    await expect
      .poll(() => extension.serviceWorker().evaluate(() => (globalThis as MarkedGlobal).__fxMarker))
      .toBeUndefined()

    await extension.setCustomEntries({})
    await page.bringToFront()
    await expect(repoTab(page, 'pull-requests')).toHaveText('拉取请求')
    expect(await page.evaluate(() => (window as MarkedGlobal).__fxMarker)).toBe('same-document')
  })

  test('自定义词条覆盖内置译文', async ({ page, extension }) => {
    await extension.setCustomEntries({ 'Pull requests': '合并请求' })
    await page.goto(FIXTURE_URL.repo)
    await expect(repoTab(page, 'pull-requests')).toHaveText('合并请求')
    // 未覆盖的词条仍用内置译文（自定义词条里没有 Issues：译成中文即来自内置词典）
    await expect(repoTab(page, 'issues')).toHaveText(CJK)
    // React 改写后仍使用自定义译文
    await waitForSimulation(page)
    await expect(repoTab(page, 'pull-requests')).toHaveText('合并请求')
  })
})
