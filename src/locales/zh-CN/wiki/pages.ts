import type { PageDictionary, RegExpRule } from '../../../core/types'
import { joinCjk, TIME_SOURCE, translateTime } from '../helpers'

const regexp: readonly RegExpRule[] = [
  // 空 Wiki
  [/^Welcome to the (.+) [Ww]iki!$/, '欢迎来到 $1 Wiki！'],
  [/^Wiki: ([\w.-]+\/[\w.-]+)$/, 'Wiki：$1'],
  // 页面头部：<用户> edited this page <时间> · 14 revisions
  [/^(.+) edited this page$/, '$1 编辑于'],
  [/^(\d[\d,]*) revisions?$/, '$1 次修订'],
  [new RegExp(`^Last edited by (.+?),? (${TIME_SOURCE})$`), (_, user, time) => `${user} ${joinCjk('最后编辑于', translateTime(time))}`],
  // 侧栏（页面名原文不带引号，译文也不加）
  [/^Show (\d[\d,]*) more pages?(…|\.\.\.)$/, '再显示 $1 个页面$2'],
  [/^Structure for (.+)$/, (_, name: string) => joinCjk(name, '的结构')],
  // 编辑
  [/^Editing (.+)$/, '编辑 $1'],
  [/^Could not find version "(.+)"$/, '找不到版本“$1”'],
  // 比较修订：Compare: <页面名>
  [/^Compare: (.+)$/, '比较：$1'],
  // 比较修订：差异统计（与 commits 词典一致：& 译“和”，原文无逗号，译文不加；N lines changed 由 common-ui 翻译）
  [/^(\d[\d,]*) changes?: (\d[\d,]*) additions? & (\d[\d,]*) deletions?$/, '$1 处更改：新增 $2 行和删除 $3 行'],
  [/^(\d[\d,]*) changed files?$/, '$1 个已更改的文件'],
  [/^(\d[\d,]*) additions?$/, '新增 $1 行'],
  [/^(\d[\d,]*) deletions?$/, '删除 $1 行']
]

/**
 * Wiki 页面：查看、侧栏页面列表、页面列表（_pages）、历史与比较（_history / _compare）、新建与编辑表单。
 * 页面标题、侧栏页面名与目录、页面列表中的页面名、修订说明属于用户内容，由 ignore 排除。
 */
export default {
  static: {
    // 空 Wiki
    'Wikis provide a place in your repository to lay out the roadmap of your project, show the current status, and document software better, together.':
      'Wiki 为存储库提供了一个空间，可以规划项目路线图、展示当前状态，并协作完善软件文档。',
    'Create the first page': '创建第一个页面',
    'You do not have permission to update this wiki.': '你没有更新此 Wiki 的权限。',

    // 页面查看与侧栏
    'Wiki pages': 'Wiki 页面',
    'Find a page or section': '查找页面或章节',
    'Find a page or section…': '查找页面或章节…',
    'Find a page or section...': '查找页面或章节...',
    'Find a page…': '查找页面…',
    'Find a page...': '查找页面...',
    'Clone this wiki locally': '在本地克隆此 Wiki',
    'Clone URL for this wiki': '此 Wiki 的克隆 URL',
    'Add a custom sidebar': '添加自定义侧边栏',
    '+ Add a custom sidebar': '+ 添加自定义侧边栏',
    'Add a custom footer': '添加自定义页脚',
    '+ Add a custom footer': '+ 添加自定义页脚',
    'Page history': '页面历史记录',

    // 历史与比较（文档中的标题式大小写也收录）
    'Compare revisions': '比较修订',
    'Compare Revisions': '比较修订',
    'Revert changes': '还原更改',
    'Revert Changes': '还原更改',
    'Invalid or empty diff.': '差异无效或为空。',

    // 新建与编辑
    'Create new page': '创建新页面',
    'Save page': '保存页面',
    'Save Page': '保存页面',
    'Delete page': '删除页面',
    'Are you sure you want to delete this page?': '确定要删除此页面吗？',
    'The wiki page was successfully deleted.': '已删除 Wiki 页面。',
    'Your Wiki was created.': '已创建 Wiki。',
    'Someone has edited the wiki since you started. Please reload this page and re-apply your changes.':
      '在你编辑期间有人修改了此 Wiki。请重新加载此页面并重新应用你的更改。',
    'Edit mode': '编辑模式',
    'Edit mode:': '编辑模式：',
    'Write a small message here explaining this change. (Optional)': '简要说明此次更改。（可选）'
  },
  scoped: {
    // 页面查看与侧栏（Last edited by 由 common-ui 翻译）
    Pages: '页面',
    'New page': '新建页面',
    'New Page': '新建页面',
    'Edit page': '编辑页面',
    'Toggle table of contents': '切换目录',
    // 页面头部：<用户> edited this page <时间>（用户名单独成元素时）
    'edited this page': '编辑于',

    // 页面列表：Last updated <时间>
    'Last updated': '最后更新于',

    // 历史：<用户> committed <时间>（History、committed、Newer、Older 由 common-ui 翻译）
    Revisions: '修订',

    // 比较修订：Showing <1 changed file> with <0 additions> and <1 deletion>（与 commits 词典一致）
    'Diff view': '差异视图',
    Split: '拆分',
    Unified: '统一',
    Showing: '显示',
    with: '包含',
    modified: '已修改',
    added: '已添加',
    removed: '已删除',
    renamed: '已重命名',
    'There are no files selected for viewing': '没有选择要查看的文件',
    'Toggle diff contents': '切换差异内容',
    'Display the source diff': '显示源差异',
    'Display the rich diff': '显示富差异',
    'Show comments': '显示评论',
    'Show annotations': '显示注释',
    'View file': '查看文件',
    'Edit file': '编辑文件',
    'Delete file': '删除文件',
    'Diff line number': '差异行号',
    'Diff line change': '差异行更改',
    'No newline at end of file': '文件末尾没有换行符',
    'Toggle all file annotations': '切换所有文件注释',
    'Load diff': '加载差异',

    // 新建与编辑
    // 编辑页标题：Editing <页面名>（与正则“Editing X”译法一致）
    Editing: '编辑',
    'Edit message': '编辑说明',
    'Page content': '页面内容'
  },
  regexp,
  ignore: [
    // 页面标题（页面查看、历史版本查看）；页面历史标题含页面名，整个标题不翻译
    '#wiki-wrapper .gh-header:has(+ .gh-header-meta) .gh-header-title',
    '#wiki-wrapper .gh-header-title:has(> .divider)',
    // 侧栏页面名与页面目录（目录加载出错的提示是界面文字）
    '.js-wiki-sidebar-page-container a.Truncate',
    '.js-wiki-sidebar-toc-container li > a',
    // 页面列表（_pages）中的页面名
    '#wiki-content .Box-row .col-md-8 a',
    '.Box-row .col-md-8 > a[href*="/wiki"]',
    // 历史：修订说明、作者名、勾选框（aria-label 含修订说明）
    '.js-wiki-history-revision p',
    '.js-wiki-history-revision .text-bold',
    '.js-wiki-history-checkbox'
  ]
} satisfies PageDictionary
