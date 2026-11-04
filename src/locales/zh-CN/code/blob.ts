import type { PageDictionary } from '../../../core/types'
import { DATE_SOURCE, joinCjk, translateTime } from '../helpers'

/** 代码导航分组：Definitions / References / Results in <路径> */
const CODE_NAV_KIND: Readonly<Record<string, string>> = {
  Definitions: '定义',
  References: '引用',
  Results: '结果'
}

/** 「启用此功能」或「启用 CODEOWNERS」（功能名由 GitHub 传入） */
function enableFeature(feature: string): string {
  return feature === 'this feature' ? '启用此功能' : `启用 ${feature}`
}

/** 计划限制提示里的方案名（product-names.md：方案名译「X 版」） */
const PLAN_NAMES: Readonly<Record<string, string>> = {
  Pro: '专业版',
  Team: '团队版'
}

/** 实验性代码视图：行号旁警告按钮的注释类型 */
const ANNOTATION_KIND: Readonly<Record<string, string>> = {
  'Hidden Unicode': '隐藏 Unicode',
  'CODEOWNERS error': 'CODEOWNERS 错误'
}

/** 「Hidden Unicode, CODEOWNERS error」→「隐藏 Unicode、CODEOWNERS 错误」 */
function annotationKinds(list: string): string {
  return list
    .split(', ')
    .map(kind => ANNOTATION_KIND[kind] ?? kind)
    .join('、')
}

/** CODEOWNERS 行号后缀：「 (from CODEOWNERS line 3)」 */
function codeownersLine(line: string | undefined): string {
  return line ? `（来自 CODEOWNERS 第 ${line} 行）` : ''
}

/** 文件大小：「504 Bytes」→「504 字节」，KB / MB 等单位原样保留 */
function fileSize(size: string): string {
  return size.replace(/^([\d,.]+) Bytes?$/, '$1 字节')
}

/** 折叠代码段后的播报（实验性代码视图；原文三句都只有句号，译文不加逗号） */
function foldStatus(collapsed: string, visible: string, total: string, caret: string | undefined): string {
  const moved = caret ? `光标已移到可见的第 ${caret} 行。` : ''
  return `已折叠 ${collapsed} 个代码段。${total} 行源代码中可见 ${visible} 行。${moved}`
}

/**
 * 文件视图（blob / blame）：头部工具栏、代码 / 追溯 / 预览、符号面板、大纲、行菜单、
 * 跳转到行、文件内查找、隐藏 Unicode、大文件、追溯视图横幅、错误页。
 */
export default {
  static: {
    // 文件头部
    'File metadata and controls': '文件元数据与控件',
    'Edit and raw actions': '编辑与原始文件操作',
    'More file actions': '更多文件操作',
    'More edit options': '更多编辑选项',
    'Copy raw file': '复制原始文件',
    'Download raw file': '下载原始文件',
    'Copy file permalink': '复制文件永久链接',
    'Raw file content': '原始文件内容',
    'Edit file...': '编辑文件...',
    'In place': '就地编辑',
    'Open with...': '打开方式...',
    'Jump to line': '跳转到行',
    'Find in file': '在文件中查找',
    'Ask about this file': '询问此文件',
    'File view': '文件视图',
    'Show code folding buttons': '显示代码折叠按钮',
    'Wrap lines': '自动换行',
    'Center content': '内容居中',
    'Open symbols on click': '单击时打开符号',
    'Open symbols panel': '打开符号面板',
    'Close symbols panel': '关闭符号面板',
    'Symbolic link': '符号链接',
    // 文件模式（文件大小前的标记）
    'symbolic link': '符号链接',
    'executable file': '可执行文件',
    'Stored with Git LFS': '使用 Git LFS 存储',
    'Learn more about Git LFS': '了解 Git LFS',
    'View CODEOWNERS rule': '查看 CODEOWNERS 规则',
    'Code owner details': '代码所有者详细信息',

    // 编辑 / 删除按钮提示（服务端下发）
    'Edit this file': '编辑此文件',
    'Edit the file in your fork of this project': '在你的复刻中编辑此文件',
    'Fork this project and edit the file': '复刻此项目并编辑此文件',
    'Fork this repository and edit the file': '复刻此存储库并编辑此文件',
    'Delete this file': '删除此文件',
    'Delete the file in your fork of this project': '在你的复刻中删除此文件',
    'Fork this project and delete the file': '复刻此项目并删除此文件',
    'Fork this repository and delete the file': '复刻此存储库并删除此文件',
    'You must be on a branch to make or propose changes to this file': '须在分支上才能更改或提议更改此文件',
    'Edit in place': '就地编辑',
    'View file in GitHub.dev': '在 GitHub.dev 中查看文件',

    // 行菜单
    'Copy line': '复制此行',
    'Copy lines': '复制所选行',
    'View git blame': '查看追溯',
    'Reference in new issue': '在新议题中引用',
    'Reference in new discussion': '在新讨论中引用',
    'Expand current section': '展开当前代码段',
    'Collapse current section': '折叠当前代码段',
    'View file in different branch/tag': '在其他分支/标签中查看文件',
    'Copied permalink.': '已复制永久链接。',
    'Code section expanded': '代码段已展开',
    'Code section collapsed': '代码段已折叠',
    // 行号旁的代码折叠按钮
    'Expand code section': '展开代码段',
    'Collapse code section': '折叠代码段',

    // 代码区
    'Code view is read-only.': '代码视图为只读。',
    'Code view is read only.': '代码视图为只读。',
    'Switch to the editor.': '切换到编辑器。',
    'While the code is focused, press Alt+F1 for a menu of operations.': '代码获得焦点时，按 Alt+F1 打开操作菜单。',
    'file content': '文件内容',
    'Expand row': '展开行',
    'View remainder of file in raw view': '在原始视图中查看文件其余部分',
    'Code blob focused hotkeys': '代码区快捷键',
    'Select the line the cursor is on': '选择光标所在行',
    'Select the symbol under the cursor': '选择光标处的符号',
    'Move focus to the highlighted line menu': '将焦点移到高亮行菜单',

    // 跳转到行
    'Line number': '行号',
    'Jump to line...': '跳转到行...',
    'Invalid line number': '行号无效',

    // 大文件、截断、渲染
    'View raw': '查看原始文件',
    '(Sorry about that, but we can’t show files that are this big right now.)': '（文件过大，无法显示。）',
    'Sorry about that, but we can’t show files that are this big right now.': '文件过大，无法显示。',
    'This file has been truncated, but you can': '此文件已截断，你可以',
    'view the full file': '查看完整文件',
    'Sorry, this is too big to display.': '文件过大，无法显示。',
    'File display': '文件显示',
    'Viewer requires iframe.': '查看器需要 iframe。',
    'Unable to render code block': '无法渲染代码块',
    'Error rendering embedded code': '渲染嵌入代码出错',
    // 上一句下方逐行显示的渲染器错误（与「行号无效」同式）
    'Invalid PDF': 'PDF 无效',
    'Unable to render rich display': '无法渲染富显示',
    'But you can view the': '但你可以查看',
    'raw file': '原始文件',

    // 隐藏 Unicode（原文只有「To review,」一个逗号）
    'This file contains bidirectional or hidden Unicode text that may be interpreted or compiled differently than what appears below. To review, open the file in an editor that reveals hidden Unicode characters.':
      '此文件包含解释或编译结果可能与下方显示不同的双向或隐藏 Unicode 文本。如需审查，请在能显示隐藏 Unicode 字符的编辑器中打开此文件。',
    'Learn more about bidirectional Unicode characters': '了解双向 Unicode 字符',
    'Hide revealed characters': '隐藏已显示的字符',
    'Show hidden characters': '显示隐藏字符',
    'Hidden Unicode': '隐藏 Unicode',
    'Hidden Unicode:': '隐藏 Unicode：',
    'Hidden Unicode details': '隐藏 Unicode 详细信息',
    'This line has hidden Unicode characters': '此行包含隐藏的 Unicode 字符',
    'Bidirectional or hidden Unicode can change how code is interpreted. Review in an editor that reveals hidden characters.':
      '双向或隐藏的 Unicode 可能改变代码的解释方式。请在能显示隐藏字符的编辑器中审查。',

    // 文件内查找（Press <kbd>Ctrl F</kbd> again…；整句由 regexp 处理，此为整句未命中时的片段）
    "again to open the browser's find menu": '键再次打开浏览器的查找菜单',
    'Close find in file': '关闭文件内查找',
    'Search this file': '搜索此文件',
    'Find in file input': '文件内查找输入框',

    // 符号面板
    'Close symbols': '关闭符号',
    'Find definitions and references for functions and other symbols in this file by clicking a symbol below or in the code.':
      '单击下方或代码中的符号以查找此文件中函数等符号的定义和引用。',
    'Filter symbols': '筛选符号',
    'Clear input': '清除输入',
    'Symbol outline not available for this file': '此文件没有符号大纲',
    'To inspect a symbol, try clicking on the symbol directly in the code view.': '在代码视图中直接单击符号进行检查。',
    'Code navigation supports a limited number of languages.': '代码导航仅支持部分语言。',
    'See which languages are supported.': '查看支持的语言。',
    'No symbols found': '未找到符号',
    'No lines in this file contain that string.': '此文件中没有包含该字符串的行。',
    'all of GitHub': '整个 GitHub',
    'Symbol Navigation Details': '符号导航详细信息',
    'Back to all symbols': '返回全部符号',
    'All symbols': '全部符号',
    'Previous reference': '上一个引用',
    'Next reference': '下一个引用',
    'No references found': '未找到引用',
    'No definitions or references found': '未找到定义或引用',
    'Search for this symbol': '搜索此符号',
    'In this file': '在此文件中',
    'Click on a symbol to see code navigation data': '单击符号查看代码导航数据',
    'Symbol location is unavailable.': '符号位置不可用。',

    // 追溯视图：已忽略 <.git-blame-ignore-revs> 中列出的修订（文件名为链接）
    'file is invalid.': '文件无效。',
    'file is too large.': '文件过大。',
    'Symlinks are not supported.': '不支持符号链接。',
    'Your blame took too long to compute.': '追溯计算超时。',
    'Failed to ignore revisions in': '无法忽略以下文件中的修订',
    'Ignoring revisions in': '已忽略以下文件中的修订',

    // 错误页
    'Error loading page': '页面加载出错',
    'Return to the repository overview': '返回存储库概述',
    'Go to default branch': '转到默认分支',
    'It looks like your internet connection is down. Please check it.': '网络连接似乎已断开。请检查。',
    'reloading the page.': '重新加载页面。',
    'does not contain the path': '中不包含路径',
    'Cannot find a valid ref in': '找不到有效引用',
    // 无锁定文件：…运行 <gh actions-lock> in your repository.（末句由 actions 词典的全局词条处理）
    'No lockfile found': '未找到锁定文件',
    'No lockfile was found for the workflows in this repository. Lock your workflow dependencies by running':
      '未找到此存储库工作流的锁定文件。运行',
    '404 - page not found': '404 - 找不到页面',
    'The requested file could not be found in': '请求的文件不在存储库',
    'File successfully deleted.': '文件已删除。',

    // 实验性代码视图（taillights）
    'Syntax rendering failed': '语法渲染失败',
    'Native text remains available.': '原始文本仍可用。',
    'Syntax rendering failed. Native text remains available.': '语法渲染失败。原始文本仍可用。',
    'Close annotations': '关闭注释',
    'CODEOWNERS error:': 'CODEOWNERS 错误：',
    'Selected line': '所选行',
    'Copied source lines.': '已复制源代码行。',
    'Copied source permalink.': '已复制源代码永久链接。',
    'Copied original source lines.': '已复制原始源代码行。',
    'Copied selected text or current line.': '已复制所选文本或当前行。',
    'Find in file cleared.': '已清除文件内查找。',
    'Enter text to find in this source.': '输入要在此源代码中查找的文本。',
    'No results in this source.': '此源代码中无结果。',
    'No source lines available.': '没有可用的源代码行。',
    'Symbol highlighting failed. Select the symbol again to retry.': '符号高亮失败。请重新选择符号以重试。',
    'Source preparation failed. Original source text remains available.': '源代码准备失败。原始文本仍可用。',
    'Source preparation is still pending.': '源代码仍在准备中。',
    "Clipboard access failed. Select the code and use your browser's Copy command.": '无法访问剪贴板。请选中代码后使用浏览器的复制命令。',
    'Clipboard access failed. Select the code and use your browser’s Copy command.': '无法访问剪贴板。请选中代码后使用浏览器的复制命令。'
  },

  scoped: {
    // 头部按钮、标签页（单词或与其他区域共用；Preview、View 由通用词典处理）
    Raw: '原始',
    Blame: '追溯',
    Top: '顶部',
    Symbols: '符号',
    Find: '查找',
    Press: '按',
    // 文件内查找：上一个 / 下一个匹配
    Up: '上一个',
    Down: '下一个',
    'Delete file': '删除文件',
    'Code navigation': '代码导航',
    Definitions: '定义',
    Definition: '定义',
    // 符号面板：引用（全站词条中 References 译为「参考资料」）
    References: '引用',
    Precise: '精确',
    'Search in': '搜索',
    On: '在',
    branch: '分支',
    // 复制原始文件按钮的状态
    Copying: '复制中',
    // 实验性代码视图：代码区的无障碍名称
    'Source code': '源代码',
    // 键盘快捷方式对话框中的代码视图命令
    'Copy file path': '复制文件路径',
    'Copy raw content': '复制原始内容',
    'Find symbol': '查找符号',
    'View blame': '查看追溯',
    'View code': '查看代码',
    'View preview': '查看预览',

    // 议题 / 讨论表单模板预览的表头（Name、About、Title、Projects 由通用词典处理；
    // Type 不收录：与页头「Type / to search」的片段同形）
    Labels: '标签',
    Assignees: '受理人',

    // 追溯视图（Newer、Older 由通用词典处理）
    Your: '你的',

    // 错误页片段
    The: '该',
    'branch of': '分支在',
    'An unexpected error occurred. Try': '发生意外错误。请尝试',
    // 路径不存在时的页面标题
    'File not found': '找不到文件',

    // Copilot 行菜单
    'Suggest improvements': '建议改进'
  },

  regexp: [
    // 文件大小：117 lines (117 loc) · 5.03 KB；大文件的行数缩写为 12.3k
    [
      /^([\d,.]+k?) lines? \(([\d,.]+k?) loc\) · (\S.*)$/,
      (_, lines: string, loc: string, size: string) => `${lines} 行（${loc} 行代码）· ${fileSize(size)}`
    ],
    // 不可预览的文件（二进制等）只显示大小
    [/^([\d,.]+) Bytes?$/, '$1 字节'],

    // 代码所有者（「younull」是 GitHub 自身拼接缺陷；原文无标点，译文不加冒号、顿号；
    // 与 pulls/files.ts 差异视图的同一提示同译「所有者为 X」）
    [
      /^Owned by you(?:null)?(?: along with (\S.*?))?(?: \(from CODEOWNERS line (\d+)\))?$/,
      (_, others: string, line: string) => `所有者为你${others ? `和 ${others}` : ''}${codeownersLine(line)}`
    ],
    [
      /^Owned by (\S.*?)(?: \(from CODEOWNERS line (\d+)\))?$/,
      (_, owners: string, line: string) => `所有者为 ${owners}${codeownersLine(line)}`
    ],
    [/^Code owners: You, (\S.*)$/, '代码所有者：你、$1'],
    [/^Code owner: You$/, '代码所有者：你'],
    [/^Code owner: (\S.*)$/, '代码所有者：$1'],

    // 行菜单
    [/^Line (\d+) options$/, '第 $1 行选项'],
    [/^Copied line (\d+)\.$/, '已复制第 $1 行。'],
    [/^Copied lines (\d+)-(\d+)\.$/, '已复制第 $1-$2 行。'],

    // 文件内查找：Press <kbd>快捷键</kbd> again…（kbd 整句匹配，快捷键随系统变化）
    [/^Press (.+?) again to open the browser's find menu$/, '再次按 $1 打开浏览器的查找菜单'],

    // 追溯：Blame prior to change <SHA>, made on <日期>（原文只有逗号，译文不换成括号）
    [
      new RegExp(`^Blame prior to change ([0-9a-f]{7,40}), made on (${DATE_SOURCE})$`),
      (_, sha: string, date: string) => `追溯 ${sha} 之前的版本，${joinCjk('该更改提交于', translateTime(date))}`
    ],

    // 符号面板（播报文字末尾可能带零宽空格）
    [/^(\d+) symbols? found\u200B*$/, '找到 $1 个符号'],
    [/^([\d,]+) References?$/, '$1 个引用'],
    [
      /^(Definitions|References|Results) in (\S.*)$/,
      (_, kind: string, where: string) => `${where === 'this file' ? '此文件' : `${where} `}中的${CODE_NAV_KIND[kind] ?? kind}`
    ],

    // 错误页：An unexpected 500 error occurred. Try（文本节点拼接后匹配）
    [/^An unexpected (\d{3}) error occurred\. Try$/, '发生意外的 $1 错误。请尝试'],

    // 计划限制提示（方案名译「X 版」）
    [
      /^Upgrade to GitHub (Pro|Team) or make this repository public to enable (\S.*)\.$/,
      (_, plan: string, feature: string) => `升级到 GitHub ${PLAN_NAMES[plan] ?? plan}或将此存储库设为公共以${enableFeature(feature)}。`
    ],
    // 复刻存储库：原文句末没有句号
    [
      /^This repository is a fork, and inherits the features of the parent repository\. Contact the owner of the root repository to enable (\S.*?)(\.?)$/,
      (_, feature: string, period: string) =>
        `此存储库是复刻，继承父存储库的功能。联系根存储库所有者以${enableFeature(feature)}${period ? '。' : ''}`
    ],
    [/^Contact the owner of the repository to enable (\S.*)\.$/, (_, feature: string) => `联系存储库所有者以${enableFeature(feature)}。`],

    // 实验性代码视图（taillights）
    [/^Line (\d+) annotations$/, '第 $1 行注释'],
    // 行号旁警告按钮：Line 3 annotations: Hidden Unicode, CODEOWNERS error
    [
      /^Line (\d+) annotations: ((?:Hidden Unicode|CODEOWNERS error)(?:, (?:Hidden Unicode|CODEOWNERS error))*)$/,
      (_, line: string, kinds: string) => `第 ${line} 行注释：${annotationKinds(kinds)}`
    ],
    [/^Line (\d+) actions$/, '第 $1 行操作'],
    [/^Lines (\d+)[–-](\d+) actions$/, '第 $1–$2 行操作'],
    [/^Expand section at line (\d+)$/, '展开第 $1 行处的代码段'],
    [/^Collapse section at line (\d+)$/, '折叠第 $1 行处的代码段'],
    [/^Expand row (\d+)$/, '展开第 $1 行'],
    [/^Line (\d+) highlighted\.$/, '已高亮第 $1 行。'],
    [/^Lines (\d+) to (\d+) highlighted\.$/, '已高亮第 $1 至 $2 行。'],
    [/^Find in file: (\d+) results\. Result (\d+) of \d+, line (\d+)\.$/, '文件内查找：共 $1 个结果。第 $2 个，第 $3 行。'],
    // 原文只有一个逗号：不写成「第 N 个结果，共 M 个，第 L 行」
    [/^Result (\d+) of (\d+), line (\d+)\.$/, '共 $2 个结果中的第 $1 个，第 $3 行。'],
    [/^Line (\d+)$/, '第 $1 行'],
    // 原文无冒号：符号名用「的」连接
    [/^(\d+) text references? to (.+)\.$/, '$2 的 $1 处文本引用。'],
    [
      /^(\d+) sections? collapsed\. (\d+) of (\d+) source lines visible\.(?: Caret moved to visible line (\d+)\.)?$/,
      (_, collapsed: string, visible: string, total: string, caret: string) => foldStatus(collapsed, visible, total, caret)
    ],
    [/^Source preparation failed\. (.+)$/, '源代码准备失败。$1'],
    // 实验性代码视图：符号详细信息（符号名原样保留）
    [/^Loading symbol details for (.+)\.$/, '正在加载 $1 的符号详细信息。'],
    [/^Unable to load symbol details for (.+)\.$/, '无法加载 $1 的符号详细信息。'],
    [/^Loading references for (.+)\.$/, '正在加载 $1 的引用。'],
    [/^Unable to load references for (.+)\.$/, '无法加载 $1 的引用。'],
    [/^(\d+) definitions? and (\d+) references? for (.+)\.$/, '$3 的 $1 个定义和 $2 个引用。']
  ],

  ignore: [
    // 大纲中的标题（Markdown 文件内容）
    '[class*="TocLevel"]',
    // 符号面板：符号名、定义标题、跳转列表、引用代码片段、其他存储库名
    '[class*="treeContent__"]',
    '[class*="jumpToLink__"]',
    '[class*="definitionHeader__"]',
    '[class*="codeContainer__"]',
    '[class*="fileHeader__"] [class*="repoName__"]',
    // CSV 表格单元格
    '.react-csv-cell',
    // 议题 / 讨论表单模板预览：元数据值、输入项（标签、说明、占位符、选项）
    'td[class*="tableCell__"]',
    '[class*="templateWrapper__"] > :not(table)'
  ]
} satisfies PageDictionary
