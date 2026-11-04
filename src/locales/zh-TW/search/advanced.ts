import type { PageDictionary } from '../../../core/types'

/**
 * 高级搜索 /search/advanced（Rails 表单）。
 * 字段占位符是示例值（用户名、存储库名、日期格式），保持原样。
 */
export default {
  static: {
    'Advanced options': '進階選項',
    'From these owners': '來自這些擁有者',
    'In these repositories': '在這些儲存庫中',
    'Created on the dates': '建立於這些日期',
    'Written in this language': '使用此語言撰寫',
    'Any language': '任何語言',

    // 存储库选项：Return repositories [not / and / only] including forks.
    'Repositories options': '儲存庫選項',
    'With this many stars': '星號數為',
    'With this many forks': '分叉數為',
    'Of this size': '大小為',
    'Repository size in KB': '以 KB 為單位的儲存庫大小',
    'Pushed to': '推送於',
    'With this license': '使用此授權條款',
    'Any license': '任何授權條款',
    'License families': '授權條款系列',
    'Return repositories': '傳回儲存庫',
    'including forks.': '分叉。',

    // 代码选项
    'Code options': '程式碼選項',
    'With this extension': '副檔名為',
    'In this path': '位於此路徑',
    'With this file name': '檔案名稱為',
    'Return code': '傳回程式碼',

    // 议题选项
    'Issues options': '議題選項',
    'In the state': '狀態為',
    'With the reason': '原因為',
    'any reason': '任何原因',
    'With this many comments': '留言數為',
    'With the labels': '帶有這些標籤',
    // 议题的 open 作「建立」
    'Opened by the author': '由此作者建立',
    'Mentioning the users': '提及這些使用者',
    'Assigned to the users': '指派給這些使用者',
    'Updated before the date': '於此日期前更新',

    // 用户选项
    'Users options': '使用者選項',
    'With this full name': '全名為',
    'From this location': '所在地為',
    'With this many followers': '追蹤者數為',
    'With this many public repositories': '公開儲存庫數為',
    'Working in this language': '使用此語言',

    // Wiki 选项
    'Wiki options': 'Wiki 選項'
  },
  scoped: {
    // 语言下拉分组（Popular 由 common 收录）
    'Everything else': '其他',
    // 授权条款下拉分组
    Licenses: '授權條款',
    // 分叉选项：「傳回儲存庫 [不含 / 和 / 僅限] 分叉。」，and 由 common 收录
    not: '不含',
    only: '僅限',
    // 议题状态与原因（not planned 由 common 收录，作「不予處理」）；状态 open 作「開放中」；
    // With the reason 下拉选项是原因名，与关闭原因同作「完成」「重新開啟」，不加「已」
    'open/closed': '開放中/已關閉',
    open: '開放中',
    closed: '已關閉',
    completed: '完成',
    reopened: '重新開啟'
  },
  ignore: [
    // 语言、许可证下拉中的名称
    '#search_language optgroup > option',
    '#search_user_language optgroup > option',
    '#search_license optgroup > option'
  ]
} satisfies PageDictionary
