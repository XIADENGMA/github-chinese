import { CJK, expect, FIXTURE_URL, fx, offlineTest as test } from './fixtures'

test.describe('离线夹具：忽略区域', () => {
  test('评论中的建议块：标题栏与后插入的按钮翻译，正文与代码格保持原样', async ({ page }) => {
    await page.goto(FIXTURE_URL.pull)
    // Suggested change 的译名随术语表调整，只断言已译成中文
    await expect(fx(page, 'suggested-label')).toHaveText(CJK)
    await expect(page.locator('body')).toHaveAttribute('data-fx-portal', 'true')
    await expect(fx(page, 'apply-button')).toHaveText('提交建议')
    await expect(fx(page, 'comment-user')).toHaveText('Pull requests')
    await expect(fx(page, 'suggested-code')).toHaveText('Pull requests')
  })

  test('应用权限选择器中的列表标题翻译（含插入、改写）；其他 React 列表的标题保持原样', async ({ page }) => {
    await page.goto(FIXTURE_URL.appPermissions)
    await expect(fx(page, 'permission-title')).toHaveText('管理')
    await expect(fx(page, 'list-title')).toHaveText('Administration')

    // 夹具脚本：*-rewritten 改写为 Administration，*-inserted 插入 Administration
    await expect(page.locator('body')).toHaveAttribute('data-fx-dynamic', 'true')
    const translated = (await fx(page, 'permission-title').textContent()) ?? ''
    await expect(fx(page, 'permission-rewritten')).toHaveText(translated)
    await expect(fx(page, 'permission-inserted')).toHaveText(translated)
    // 同一批变动：权限选择器内的已重译，react-app 内的也已处理
    await expect(fx(page, 'list-rewritten')).toHaveText('Administration')
    await expect(fx(page, 'list-inserted')).toHaveText('Administration')
  })
})
