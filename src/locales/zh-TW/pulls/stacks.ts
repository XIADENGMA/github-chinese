import type { PageDictionary } from '../../../core/types'

/**
 * 堆栈页：堆栈列表（/<所有者>/<存储库>/stacks）与堆栈详情（/<所有者>/<存储库>/stack/<编号>），两页的作用域含 pulls（见 page.ts）；
 * 另有拉取请求页上可堆叠横幅、堆栈创建横幅、预览堆栈对话框中被链接拆开的句子。
 * 已收录的堆栈词条不在此重复：列表标题、空状态、返回链接、进度（list.ts），堆栈操作菜单、取消堆叠对话框、
 * 堆栈编号与成员数（header.ts）；列表筛选、排序、分页、侧栏与拉取请求列表项沿用 pulls、common 的词条。
 * stack 作「堆疊」；operation 作「操作」（同 actions/run.ts「已取消操作。」、org-settings/archive.ts「操作類型」），
 * perform this action 作「執行此動作」（同 common-ui/messages.ts「此動作無法復原」）。
 */
export default {
  static: {
    // 列表头部的操作栏放不下排序按钮时的溢出菜单按钮：More + 操作栏名称 Actions
    'More Actions': '更多動作',
    // 窄屏时打开侧栏的按钮：Open + 侧栏名称 Pull requests navigation
    'Open Pull requests navigation': '開啟拉取請求導覽',
    // 拉取请求页面数据接口的错误信息：取消堆叠、创建堆栈失败时显示在对话框中
    'Unable to perform this operation. Please check your internet connection and try again later.':
      '無法執行此操作。請檢查網路連線並稍後再試。',
    'The server is currently unable to perform this operation. Please try again later.': '伺服器目前無法執行此操作。請稍後再試。',
    'Unable to read response from the server. Please try again later.': '無法讀取伺服器的回應。請稍後再試。',
    'You need to sign in again to perform this action. Please refresh the page and try again.':
      '你需要重新登入才能執行此動作。請重新整理頁面後再試一次。'
  },
  scoped: {
    // 列表项堆栈徽章打开的对话框：数据加载完成前标题只有 Stack（加载后为 Stack #N，见 header.ts）
    Stack: '堆疊'
  },
  inline: [
    // 可堆叠横幅：句号与「瞭解堆疊」链接之间的空格是单独的文本节点，按片段会在「。」后留空格
    ['This pull request can be stacked with other pull requests. {}', '此拉取請求可以和其他拉取請求堆疊。{}'],
    // 堆栈创建横幅：堆栈引用是链接时（This pull request was added to <stack #4>）；不是链接时整段由 header.ts 的堆栈编号正则处理
    ['This pull request was added to {}', '此拉取請求已加入{}'],
    // 预览堆栈对话框的说明：堆栈引用在 <span> 中（链接或文字）
    [
      'This pull request can be added to {}. Review and update the stack when you’re ready.',
      '此拉取請求可加入{}。準備好後審查並更新堆疊。'
    ],
    [
      'This pull request and other pull requests can be added to {}. Review and update the stack when you’re ready.',
      '此拉取請求和其他拉取請求可加入{}。準備好後審查並更新堆疊。'
    ]
  ]
} satisfies PageDictionary
