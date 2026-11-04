import { createMatcher, type Matcher, type MatcherOptions } from '../../../src/core/matcher'
import type { LocaleBundle, PageKey } from '../../../src/core/types'

/** 测试用小词典：不依赖正式语言包 */
export const TEST_BUNDLE: LocaleBundle = [
  [
    'common',
    {
      static: {
        Issues: '议题',
        'Pull requests': '拉取请求',
        Open: '打开',
        Search: '搜索',
        Submit: '提交',
        Cancel: '取消',
        Copy: '复制',
        'Copied!': '已复制！',
        Edit: '编辑',
        file: '文件',
        'Edit file': '编辑文件',
        Notifications: '通知',
        Close: '关闭',
        Comments: '评论',
        Settings: '设置',
        Star: '星标',
        Newest: '最新',
        'Are you sure?': '确定吗？',
        'Saving…': '保存中…'
      },
      regexp: [
        [/^Updated (\d+) days? ago$/, '$1天前更新'],
        [/^(\d+) comments?$/, '$1 条评论'],
        [/^Opened by (.+)$/, (_, user) => `由 ${user} 打开`]
      ]
    }
  ],
  ['issues', { scoped: { Open: '未解决' }, ignore: ['.issue-user-content'] }],
  ['pulls', { scoped: { Open: '开启中' } }]
]

export function testMatcher(options?: MatcherOptions, bundle: LocaleBundle = TEST_BUNDLE): Matcher {
  return createMatcher(bundle, options)
}

/**
 * 页面级忽略规则（由对应词典的 ignore 引入，这里核对选择器本身）：
 * - repository：头部面包屑中的所有者名、仓库名；
 * - actions：作业页窄屏页头的作业名、运行标题对话框的无障碍标题。
 */
export const PAGE_IGNORES = {
  repository: [
    'header.GlobalNav [data-component="Breadcrumbs.Item"]',
    '.AppHeader-context-item-label',
    '.AppHeader-context-compact-parentItem',
    '.AppHeader-context-compact-mainItem'
  ],
  actions: [
    '[data-target~="streaming-graph-job.name"]',
    '[data-target~="streaming-graph-job.name"] ~ .css-truncate',
    '.Overlay-titleWrap:has(.markdown-title) > .Overlay-title'
  ]
} as const satisfies Partial<Record<PageKey, readonly string[]>>

/** 等待微任务与变动回调全部完成 */
export function settle(): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, 0))
}

/** 元素的直接子文本节点内容 */
export function texts(element: Element): string[] {
  return [...element.childNodes].filter(node => node.nodeType === 3).map(node => (node as Text).data)
}

export function $(selector: string): Element {
  const element = document.querySelector(selector)
  if (!element) throw new Error(`未找到 ${selector}`)
  return element
}
