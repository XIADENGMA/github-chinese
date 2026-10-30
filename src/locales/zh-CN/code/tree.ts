import type { PageDictionary } from '../../../core/types'

/** 「Ask Copilot about this file」里的对象类型 */
const COPILOT_REFERENCE: Readonly<Record<string, string>> = {
  file: '文件',
  folder: '文件夹',
  directory: '目录',
  symbol: '符号',
  selection: '所选内容',
}

/** 「1 entry was」「12 entries were」→ 条目数 */
const OMITTED_SOURCE = '([\\d,]+) (?:entries were|entry was) omitted from the list\\.'

/** 目录列表文件名链接的无障碍名称里的类型：<名称>, (Directory)（与 repository/overview.ts 的 ENTRY_TYPES 同译） */
const ENTRY_TYPES: Readonly<Record<string, string>> = {
  Directory: '目录',
  File: '文件',
  Submodule: '子模块',
  'Symlink to directory': '指向目录的符号链接',
  'Symlink to file': '指向文件的符号链接',
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
    'Expand file tree': '展开文件树',
    'Collapse file tree': '折叠文件树',
    'File Tree Navigation': '文件树导航',
    'File navigation': '文件导航',
    'File tree unavailable': '文件树不可用',
    'File navigation could not be loaded right now.': '文件导航加载失败。',
    'View file on default branch': '在默认分支上查看文件',
    'File does not exist on default branch': '默认分支上不存在此文件',
    'Ref is invalid': '引用无效',
    'There was an error loading the folder contents.': '文件夹内容加载失败。',
    'Loading file tree': '正在加载文件树',
    'Some files could not be loaded.': '部分文件加载失败。',
    'Sign in to see the full file tree.': '登录以查看完整文件树。',
    'Search this repository': '搜索此存储库',

    // 目录页头部
    'Directory actions': '目录操作',
    'Path copied!': '已复制路径！',
    'Permalink copied!': '已复制永久链接！',
    'View runs': '查看运行',
    'Delete directory': '删除目录',
    'Latest commit info may be omitted.': '最新提交信息可能不完整。',

    // 议题模板目录（.github/ISSUE_TEMPLATE）列表底部：…可使用 <config.yml> 文件。了解如何配置模板选择器。
    'Customize the issue creation experience with a': '自定义议题创建体验可使用',

    // 贡献者（追溯视图头部）
    'Cannot retrieve contributors info at this time.': '暂时无法获取贡献者信息。',

    // 查找文件页（/find，Rails）
    'File Finder': '文件查找器',
    'The name of the file to navigate to.': '要跳转到的文件名。',
    'No matching files found.': '未找到匹配的文件。',
  },

  scoped: {
    'Find file': '查找文件',
    'Copy path': '复制路径',
    'Copy permalink': '复制永久链接',
    // 文件树「搜索此存储库」按钮的快捷键提示（屏幕阅读器文字，括号可能与键名拆成不同文本节点）
    'forward slash': '正斜杠',
    '(forward slash)': '（正斜杠）',

    // 存储库概述侧栏：推荐工作流的作者（By <作者>，作者名是相邻文本节点）
    By: '来自',
  },

  regexp: [
    // 页面标题分段：Blaming / Editing / Deleting <路径> at <引用>（原文无标点，引用名不加括号）
    [/^Blaming (\S.*) at (\S+)$/, '追溯 $2 上的 $1'],
    [/^Editing (\S.*) at (\S+)$/, '编辑 $2 上的 $1'],
    [/^Deleting (\S.*) at (\S+)$/, '删除 $2 上的 $1'],
    [/^New File at (\S+)$/, (_, dir: string) => (dir === '/' ? '新建文件' : `在 ${dir} 中新建文件`)],
    // 页面标题分段：<存储库名>/<路径> at <引用>（路径不含空格，避免误伤带空格的界面文字）
    [/^([^\s/]+\/\S*) at (\S+)$/, '$2 上的 $1'],

    // 文件树：超出数量的条目
    [/^([\d,]+) entries not shown$/, '另有 $1 项未显示'],

    // 目录页截断提示（同一 Flash 内的文本节点拼接后整段匹配；不带末句的版本由 repository 词典处理）
    [
      new RegExp(
        `^Sorry, we had to truncate this directory to ([\\d,]+) files\\. ${OMITTED_SOURCE} Latest commit info may be omitted\\.$`,
      ),
      '此目录已截断为 $1 个文件，另有 $2 个条目未列出。最新提交信息可能不完整。',
    ],

    // 贡献者（追溯视图头部）：按钮 aria-label 末尾带一个多余的引号
    [/^Show ([\d,]+) contributors?"?$/, '显示 $1 个贡献者'],
    [/^([\d,]+) contributors?$/, '$1 个贡献者'],
    [/^([\d,]+) commits? by (\S+)$/, '$2 的 $1 个提交'],

    // 询问 Copilot（Ask Copilot about this repository 由 repository 词典的 static 处理）
    [
      /^Ask Copilot about this (file|folder|directory|symbol|selection)$/,
      (_, kind: string) => `向 Copilot 询问此${COPILOT_REFERENCE[kind] ?? kind}`,
    ],

    // 存储库概述侧栏：引用对话框的复制按钮
    [/^Copy (APA|BibTeX)$/, '复制 $1'],
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
    'virtual-filter-input .bold',
  ],

  attributeRules: [
    // 目录列表文件名链接的无障碍名称：<名称>, (Directory) → <名称>（目录）；名称原样保留，链接文字不动
    [
      FILENAME_LINK,
      'aria-label',
      /^(.+), \((Directory|File|Submodule|Symlink to directory|Symlink to file)\)$/,
      (_, name: string, type: string) => `${name}（${ENTRY_TYPES[type] ?? type}）`,
    ],
  ],
} satisfies PageDictionary
