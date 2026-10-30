import { defineConfig } from '@playwright/test'

/**
 * 端到端测试：加载构建产物 .output/chrome-mv3（先 bun run build）。
 * - offline：离线夹具，github.com 请求由 tests/e2e/fixtures 中的页面应答
 * - live：线上冒烟，仅 E2E_LIVE=1 时执行（bun run test:e2e:live）
 */
export default defineConfig({
  testDir: 'tests/e2e',
  outputDir: 'test-results',
  // 每个测试独占一个带扩展的浏览器实例，串行执行
  fullyParallel: false,
  workers: 1,
  timeout: 90_000,
  expect: { timeout: 15_000 },
  retries: process.env.CI ? 1 : 0,
  forbidOnly: Boolean(process.env.CI),
  reporter: [['list'], ['html', { open: 'never', outputFolder: 'playwright-report' }]],
  use: {
    actionTimeout: 15_000,
    navigationTimeout: 60_000,
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'offline', testIgnore: /live\.spec\.ts$/ },
    { name: 'live', testMatch: /live\.spec\.ts$/, timeout: 180_000 },
  ],
})
