import { defineConfig } from 'vitest/config'

/** 不依赖 WXT 的纯逻辑测试（core / locales），可并行运行 */
export default defineConfig({
  test: {
    environment: 'happy-dom',
    // 时区固定为 GMT+8：完整时间是否写时区取决于浏览器本地时区（见 time-text.ts、common-ui/time.ts）
    env: { TZ: 'Asia/Shanghai' },
    include: ['tests/unit/core/**/*.test.ts', 'tests/unit/locales/**/*.test.ts'],
    globals: true
  }
})
