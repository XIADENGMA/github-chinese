import type { PageDictionary } from '../../../core/types'

/**
 * 高级搜索 /search/advanced（Rails 表单）。
 * 字段占位符是示例值（用户名、存储库名、日期格式），保持原样。
 */
export default {
  static: {
    'Advanced options': '高级选项',
    'From these owners': '来自这些所有者',
    'In these repositories': '在这些存储库中',
    'Created on the dates': '创建于这些日期',
    'Written in this language': '使用此语言编写',
    'Any language': '任意语言',

    // 存储库选项：Return repositories [not / and / only] including forks.
    'Repositories options': '存储库选项',
    'With this many stars': '星标数为',
    'With this many forks': '复刻数为',
    'Of this size': '大小为',
    'Repository size in KB': '以 KB 为单位的存储库大小',
    'Pushed to': '推送于',
    'With this license': '使用此许可证',
    'Any license': '任意许可证',
    'License families': '许可证系列',
    'Return repositories': '返回存储库',
    'including forks.': '复刻。',

    // 代码选项
    'Code options': '代码选项',
    'With this extension': '扩展名为',
    'In this path': '位于此路径',
    'With this file name': '文件名为',
    'Return code': '返回代码',

    // 议题选项
    'Issues options': '议题选项',
    'In the state': '状态为',
    'With the reason': '原因为',
    'any reason': '任意原因',
    'With this many comments': '评论数为',
    'With the labels': '带有这些标签',
    'Opened by the author': '由此作者打开',
    'Mentioning the users': '提及这些用户',
    'Assigned to the users': '分配给这些用户',
    'Updated before the date': '更新早于此日期',

    // 用户选项
    'Users options': '用户选项',
    'With this full name': '全名为',
    'From this location': '所在地为',
    'With this many followers': '关注者数为',
    'With this many public repositories': '公共存储库数为',
    'Working in this language': '使用此语言',

    // Wiki 选项
    'Wiki options': 'Wiki 选项'
  },
  scoped: {
    // 语言下拉分组（Popular 由 common 收录）
    'Everything else': '其他',
    // 许可证下拉分组
    Licenses: '许可证',
    // 复刻选项：「返回存储库 [不含 / 和 / 仅限] 复刻。」，and 由 common 收录
    not: '不含',
    only: '仅限',
    // 议题状态与原因（not planned 由 common 收录）
    'open/closed': '打开/已关闭',
    open: '打开',
    closed: '已关闭',
    completed: '已完成',
    reopened: '已重新打开'
  },
  ignore: [
    // 语言、许可证下拉中的名称
    '#search_language optgroup > option',
    '#search_user_language optgroup > option',
    '#search_license optgroup > option'
  ]
} satisfies PageDictionary
