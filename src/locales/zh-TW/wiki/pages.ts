import type { PageDictionary, RegExpRule } from '../../../core/types'
import { joinCjk, TIME_SOURCE, translateTime } from '../helpers'

const regexp: readonly RegExpRule[] = [
  // 空 Wiki
  [/^Welcome to the (.+) [Ww]iki!$/, '歡迎來到 $1 Wiki！'],
  [/^Wiki: ([\w.-]+\/[\w.-]+)$/, 'Wiki：$1'],
  // 页面头部：<用户> edited this page <时间> · 14 revisions（committed → 提交於，edited → 編輯於）
  [/^(.+) edited this page$/, '$1 編輯於'],
  // revision 作「修訂版本」（与 gist、common-ui 的编辑历史一致）
  [/^(\d[\d,]*) revisions?$/, '$1 個修訂版本'],
  [
    new RegExp(`^Last edited by (.+?),? (${TIME_SOURCE})$`),
    (_, user, time) => `${user} ${joinCjk('上次編輯於', translateTime(time))}`,
  ],
  // 侧边栏（页面名原文不带引号，译文也不加）
  [/^Show (\d[\d,]*) more pages?(…|\.\.\.)$/, '再顯示 $1 個頁面$2'],
  [/^Structure for (.+)$/, (_, name: string) => joinCjk(name, '的結構')],
  // 编辑：进行中的动作带宾语，作「正在編輯」（与 gist 的 Editing 一致）
  [/^Editing (.+)$/, '正在編輯 $1'],
  [/^Could not find version "(.+)"$/, '找不到版本「$1」'],
  // 比较修订版本：Compare: <页面名>
  [/^Compare: (.+)$/, '比較：$1'],
  // 比较修订版本：差异统计（与 commits、gist 词典一致：& 译「和」，原文无逗号，译文不加；N lines changed 由 common-ui 翻译）
  [/^(\d[\d,]*) changes?: (\d[\d,]*) additions? & (\d[\d,]*) deletions?$/, '$1 處變更：新增 $2 行和刪除 $3 行'],
  [/^(\d[\d,]*) changed files?$/, '$1 個變更的檔案'],
  [/^(\d[\d,]*) additions?$/, '新增 $1 行'],
  [/^(\d[\d,]*) deletions?$/, '刪除 $1 行'],
]

/**
 * Wiki 页面：查看、侧边栏页面清单、页面清单（_pages）、历史记录与比较（_history / _compare）、新增与编辑表单。
 * 页面标题、侧边栏页面名与目录、页面清单中的页面名、修订说明属于用户内容，由 ignore 排除。
 */
export default {
  static: {
    // 空 Wiki
    'Wikis provide a place in your repository to lay out the roadmap of your project, show the current status, and document software better, together.':
      'Wiki 為儲存庫提供一個空間，讓你規劃專案藍圖、展示目前狀態，並一起完善軟體說明文件。',
    'Create the first page': '建立第一個頁面',
    'You do not have permission to update this wiki.': '你沒有更新此 Wiki 的權限。',

    // 页面查看与侧边栏
    'Wiki pages': 'Wiki 頁面',
    'Find a page or section': '尋找頁面或章節',
    'Find a page or section…': '尋找頁面或章節…',
    'Find a page or section...': '尋找頁面或章節...',
    'Find a page…': '尋找頁面…',
    'Find a page...': '尋找頁面...',
    // clone 作「複製」，带宾语，不与 copy 混淆
    'Clone this wiki locally': '在本機複製此 Wiki',
    'Clone URL for this wiki': '此 Wiki 的複製用 URL',
    'Add a custom sidebar': '新增自訂側邊欄',
    '+ Add a custom sidebar': '+ 新增自訂側邊欄',
    'Add a custom footer': '新增自訂頁尾',
    '+ Add a custom footer': '+ 新增自訂頁尾',
    'Page history': '頁面歷史記錄',

    // 历史记录与比较（文档中的标题式大小写也收录）
    'Compare revisions': '比較修訂版本',
    'Compare Revisions': '比較修訂版本',
    'Revert changes': '還原變更',
    'Revert Changes': '還原變更',
    'Invalid or empty diff.': '差異無效或為空。',

    // 新增与编辑
    'Create new page': '建立新頁面',
    'Save page': '儲存頁面',
    'Save Page': '儲存頁面',
    'Delete page': '刪除頁面',
    'Are you sure you want to delete this page?': '確定要刪除此頁面嗎？',
    'The wiki page was successfully deleted.': '已刪除 Wiki 頁面。',
    'Your Wiki was created.': '已建立 Wiki。',
    'Someone has edited the wiki since you started. Please reload this page and re-apply your changes.':
      '有人在你開始編輯後修改了此 Wiki。請重新載入此頁面並重新套用你的變更。',
    'Edit mode': '編輯模式',
    'Edit mode:': '編輯模式：',
    'Write a small message here explaining this change. (Optional)': '在此簡短說明這次變更。（選填）',
  },
  scoped: {
    // 页面查看与侧边栏（Last edited by 由 common-ui 翻译）
    Pages: '頁面',
    'New page': '新增頁面',
    'New Page': '新增頁面',
    'Edit page': '編輯頁面',
    'Toggle table of contents': '切換目錄',
    // 页面头部：<用户> edited this page <时间>（用户名单独成元素时）
    'edited this page': '編輯於',

    // 页面清单：Last updated <时间>
    'Last updated': '上次更新於',

    // 历史记录：<用户> committed <时间>（History、committed、Newer、Older 由 common-ui 翻译）
    Revisions: '修訂版本',

    // 比较修订版本：Showing <1 changed file> with <0 additions> and <1 deletion>（与 commits 词典一致）
    'Diff view': '差異檢視',
    Split: '分割',
    Unified: '統一',
    Showing: '顯示',
    with: '包含',
    modified: '已修改',
    added: '已新增',
    removed: '已移除',
    renamed: '已重新命名',
    'There are no files selected for viewing': '沒有選取要查看的檔案',
    'Toggle diff contents': '切換差異內容',
    'Display the source diff': '顯示原始碼差異',
    'Display the rich diff': '顯示豐富差異',
    'Show comments': '顯示留言',
    'Show annotations': '顯示標註',
    'View file': '查看檔案',
    'Edit file': '編輯檔案',
    'Delete file': '刪除檔案',
    'Diff line number': '差異行號',
    'Diff line change': '差異行變更',
    'No newline at end of file': '檔案結尾沒有換行字元',
    'Toggle all file annotations': '切換所有檔案標註',
    'Load diff': '載入差異',

    // 新增与编辑
    // 编辑页标题：Editing <页面名>（与正则「Editing X」译法一致）
    Editing: '正在編輯',
    // 编辑表单里说明此次修改的栏位（相当于提交讯息），取维基百科繁中的「編輯摘要」
    'Edit message': '編輯摘要',
    'Page content': '頁面內容',
  },
  regexp,
  ignore: [
    // 页面标题（页面查看、历史版本查看）；页面历史记录标题含页面名，整个标题不翻译
    '#wiki-wrapper .gh-header:has(+ .gh-header-meta) .gh-header-title',
    '#wiki-wrapper .gh-header-title:has(> .divider)',
    // 侧边栏页面名与页面目录（目录载入出错的提示是界面文字）
    '.js-wiki-sidebar-page-container a.Truncate',
    '.js-wiki-sidebar-toc-container li > a',
    // 页面清单（_pages）中的页面名
    '#wiki-content .Box-row .col-md-8 a',
    '.Box-row .col-md-8 > a[href*="/wiki"]',
    // 历史记录：修订说明、作者名、勾选框（aria-label 含修订说明）
    '.js-wiki-history-revision p',
    '.js-wiki-history-revision .text-bold',
    '.js-wiki-history-checkbox',
  ],
} satisfies PageDictionary
