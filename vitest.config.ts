import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vitest/config'
import { WxtVitest } from 'wxt/testing/vitest-plugin'
import { VUE_COMPILER_OPTIONS } from './scripts/strip-vue-static-content.ts'

export default defineConfig({
  // 模板编译选项与构建相同（见 wxt.config.ts）
  plugins: [vue({ template: { compilerOptions: VUE_COMPILER_OPTIONS } }), WxtVitest()],
  test: {
    environment: 'happy-dom',
    // 时区固定为 GMT+8：完整时间是否写时区取决于浏览器本地时区（见 time-text.ts、common-ui/time.ts）
    env: { TZ: 'Asia/Shanghai' },
    include: ['tests/unit/**/*.test.ts'],
    globals: true,
    // 样式默认不处理；这几个组件的布局约束（列表限高、表头固定、弹出页宽度）有用例按计算样式断言
    css: { include: [/options[\\/]CustomEntriesSection\.vue/, /popup[\\/]App\.vue/] },
    coverage: {
      provider: 'v8',
      // 只统计脚本与组件：入口目录里的 index.html、样式表不是可执行代码，纳入时 HTML 解析报错
      include: ['src/**/*.{ts,vue}'],
      exclude: ['src/locales/**'],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 75,
        statements: 80,
      },
    },
  },
})
