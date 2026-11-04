import type { PageDictionary } from '../../../core/types'

/** 「Ask Copilot about this file」里的对象类型 */
const COPILOT_REFERENCE: Readonly<Record<string, string>> = {
  file: '檔案',
  folder: '資料夾',
  directory: '目錄',
  symbol: '符號',
  selection: '選取範圍'
}

/** 「1 entry was」「12 entries were」→ 条目数 */
const OMITTED_SOURCE = '([\\d,]+) (?:entries were|entry was) omitted from the list\\.'

/** 目录列表文件名链接的无障碍名称里的类型：<名称>, (Directory)（与 repository/overview.ts 的 ENTRY_TYPES 同译） */
const ENTRY_TYPES: Readonly<Record<string, string>> = {
  Directory: '目錄',
  File: '檔案',
  Submodule: '子模組',
  'Symlink to directory': '指向目錄的符號連結',
  'Symlink to file': '指向檔案的符號連結'
}

/**
 * 目录列表的文件名链接（每行按窄屏、宽屏各渲染一次）：
 * <div class="react-directory-filename-cell"><div class="react-directory-truncate">
 * <a title="compiler-core" aria-label="compiler-core, (Directory)" class="Link--primary" href="…">compiler-core</a>
 * 合并显示的空目录路径：<a title="This path skips through empty directories" aria-label=".licenses/npm, (Directory)">
 * <span data-testid="path-name-segment">.licenses/</span><span data-testid="path-name-segment">npm</span></a>。
 * 普通文件名链接整段由全局规则忽略（src/core/ignore.ts），只按属性规则改写 aria-label；合并路径链接只忽略路径片段，
 * title 由 repository/overview.ts 的全站词条翻译。选择器不依赖 aria-label 的取值（改写后会失配）
 */
const FILENAME_LINK = '.react-directory-filename-cell a'

/**
 * 文件树、目录页头部、贡献者（追溯视图）、查找文件页（/find）、页面标题，
 * 以及存储库概述侧栏中 repository 词典未收录的片段。
 * 转到文件、添加文件菜单、最新提交、目录列表、分支信息栏、引用选择器、存储库概述由 repository 词典处理；
 * 页头面包屑（GitHub Breadcrumb 等）由 common 词典处理。
 */
export default {
  static: {
    // 文件树面板
    'Expand file tree': '展開檔案樹',
    'Collapse file tree': '摺疊檔案樹',
    'File Tree Navigation': '檔案樹導覽',
    'File navigation': '檔案導覽',
    'File tree unavailable': '檔案樹無法使用',
    'File navigation could not be loaded right now.': '目前無法載入檔案導覽。',
    'View file on default branch': '在預設分支上查看檔案',
    'File does not exist on default branch': '預設分支上沒有此檔案',
    'Ref is invalid': '參考無效',
    'There was an error loading the folder contents.': '載入資料夾內容時發生錯誤。',
    'Loading file tree': '正在載入檔案樹',
    'Some files could not be loaded.': '部分檔案無法載入。',
    'Sign in to see the full file tree.': '登入以查看完整的檔案樹。',
    'Search this repository': '搜尋此儲存庫',

    // 目录页头部
    'Directory actions': '目錄動作',
    'Path copied!': '已複製路徑！',
    'Permalink copied!': '已複製永久連結！',
    'View runs': '查看執行',
    'Delete directory': '刪除目錄',
    'Latest commit info may be omitted.': '最新提交資訊可能不完整。',

    // 议题模板目录（.github/ISSUE_TEMPLATE）列表底部：…可使用 <config.yml> 檔案。瞭解如何設定範本選擇器。
    'Customize the issue creation experience with a': '自訂建立議題的體驗可使用',

    // 贡献者（追溯视图头部）
    'Cannot retrieve contributors info at this time.': '目前無法取得貢獻者資訊。',

    // 查找文件页（/find，Rails）
    'File Finder': '檔案尋找工具',
    'The name of the file to navigate to.': '要前往的檔案名稱。',
    'No matching files found.': '找不到相符的檔案。'
  },

  scoped: {
    'Find file': '尋找檔案',
    'Copy path': '複製路徑',
    'Copy permalink': '複製永久連結',
    // 文件树「搜尋此儲存庫」按钮的快捷键提示（屏幕阅读器文字，括号可能与键名拆成不同文本节点）
    'forward slash': '正斜線',
    '(forward slash)': '（正斜線）',

    // 存储库概述侧栏：推荐工作流的作者（By <作者>，作者名是相邻文本节点）
    By: '來自'
  },

  regexp: [
    // 页面标题分段：Blaming / Editing / Deleting <路径> at <引用>（原文无标点，引用名不加括号）
    [/^Blaming (\S.*) at (\S+)$/, '追溯 $2 上的 $1'],
    [/^Editing (\S.*) at (\S+)$/, '編輯 $2 上的 $1'],
    [/^Deleting (\S.*) at (\S+)$/, '刪除 $2 上的 $1'],
    [/^New File at (\S+)$/, (_, dir: string) => (dir === '/' ? '新增檔案' : `在 ${dir} 中新增檔案`)],
    // 页面标题分段：<存储库名>/<路径> at <引用>（路径不含空格，避免误伤带空格的界面文字）
    [/^([^\s/]+\/\S*) at (\S+)$/, '$2 上的 $1'],

    // 文件树：超出数量的条目
    [/^([\d,]+) entries not shown$/, '另有 $1 項未顯示'],

    // 目录页截断提示（同一 Flash 内的文本节点拼接后整段匹配；不带末句的版本由 repository 词典处理）
    [
      new RegExp(`^Sorry, we had to truncate this directory to ([\\d,]+) files\\. ${OMITTED_SOURCE} Latest commit info may be omitted\\.$`),
      '此目錄已截斷為 $1 個檔案，另有 $2 項未列出。最新提交資訊可能不完整。'
    ],

    // 贡献者（追溯视图头部）：按钮 aria-label 末尾带一个多余的引号
    [/^Show ([\d,]+) contributors?"?$/, '顯示 $1 位貢獻者'],
    [/^([\d,]+) contributors?$/, '$1 位貢獻者'],
    [/^([\d,]+) commits? by (\S+)$/, '$2 的 $1 個提交'],

    // 询问 Copilot（Ask Copilot about this repository 由 repository 词典的 static 处理）
    [
      /^Ask Copilot about this (file|folder|directory|symbol|selection)$/,
      (_, kind: string) => `向 Copilot 詢問此${COPILOT_REFERENCE[kind] ?? kind}`
    ],

    // 存储库概述侧栏：引用对话框的复制按钮
    [/^Copy (APA|BibTeX)$/, '複製 $1']
  ],

  ignore: [
    // 面包屑中的目录名、存储库名（文件名、存储库链接由全局规则忽略）
    '[data-testid="breadcrumbs"] ol a',
    '[data-testid="breadcrumbs"] h1',
    // 文件树子目录列表：aria-label 是目录名；加载中、有截断提示时不忽略，保留其中的界面文字
    '[data-testid="repos-file-tree-container"] ul[role="group"]:not(:has([data-loading], #error-tree-row))',
    // 贡献者对话框、被阻止贡献者横幅：用户名
    '[class*="contributorLink__"]',
    // 查找文件页：存储库名
    'virtual-filter-input .bold'
  ],

  attributeRules: [
    // 目录列表文件名链接的无障碍名称：<名称>, (Directory) → <名称>（目錄）；名称原样保留，链接文字不动
    [
      FILENAME_LINK,
      'aria-label',
      /^(.+), \((Directory|File|Submodule|Symlink to directory|Symlink to file)\)$/,
      (_, name: string, type: string) => `${name}（${ENTRY_TYPES[type] ?? type}）`
    ]
  ]
} satisfies PageDictionary
