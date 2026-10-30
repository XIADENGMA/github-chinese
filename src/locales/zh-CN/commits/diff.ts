import type { PageDictionary, RegExpRule } from '../../../core/types'
import { joinCjk } from '../helpers'

/** 行号前缀：L 左侧（原始），R 右侧（新） */
const LINE_SOURCE = '[LR]?\\d+'

/** 行操作菜单：Add comment / Suggest change */
const LINE_ACTIONS: Readonly<Record<string, string>> = {
  'Add comment': '添加评论',
  'Suggest change': '建议更改',
}

/** 行操作菜单的行范围：修改后 / 原始 */
const LINE_SIDES: Readonly<Record<string, string>> = { modified: '修改后的', original: '原始的' }

/** 文件树注释级别 */
const ANNOTATION_LEVELS: Readonly<Record<string, string>> = {
  warning: '警告',
  notice: '提示',
  failure: '失败',
}

/** 文件树条目的屏幕阅读器文字：src/app.ts 有 3 条评论和警告注释（原文无标点，译文不加） */
function fileTreeNote(file: string, count: string, level: string): string {
  const name = file === 'This file' ? '此文件' : `${file} `
  const parts = [count ? `${count} 条评论` : '', level ? `${ANNOTATION_LEVELS[level] ?? level}注释` : '']
  return name + joinCjk('有', parts.filter(Boolean).join('和'))
}

const regexp: readonly RegExpRule[] = [
  // 行数统计（React 页头与文件头的屏幕阅读器文字；经典差异文件头）。& 译“和”，原文无逗号，译文不加
  [/^Lines changed: ([\d,]+) additions? & ([\d,]+) deletions?$/, '更改行数：新增 $1 行和删除 $2 行'],
  [/^([\d,]+) changes?: ([\d,]+) additions? & ([\d,]+) deletions?$/, '$1 处更改：新增 $2 行和删除 $3 行'],
  // 经典比较页摘要（整句在同一节点时；原文无逗号，改语序不加逗号，with 与拆开时的 scoped 同译“包含”）
  [
    /^Showing ([\d,]+) changed files? with ([\d,]+) additions? and ([\d,]+) deletions?\.$/,
    '显示包含新增 $2 行和删除 $3 行的 $1 个已更改的文件。',
  ],
  // 经典比较页摘要：Showing <698 changed files> with <199,850 additions> and <8,959 deletions>.
  [/^([\d,]+) changed files?$/, '$1 个已更改的文件'],
  [/^([\d,]+) additions?$/, '新增 $1 行'],
  [/^([\d,]+) deletions?$/, '删除 $1 行'],
  // 文件头（路径通常在 <code> 中，这里只处理无障碍名称与提示；原文无括号，译文不加）
  [/^Diff for: (.+?) renamed to (.+)$/, '$1 重命名为 $2 的差异'],
  [/^Diff for: (\S.*)$/, '$1 的差异'],
  [/^Expand all lines: (\S.*)$/, '展开所有行：$1'],
  [/^Collapse non-diff lines: (\S.*)$/, '折叠无差异的行：$1'],
  [/^collapse file: (\S.*)$/, '折叠文件：$1'],
  [/^(\S+) renamed to (\S+)$/, '$1 重命名为 $2'],
  // 文件树：src/app.ts has 3 comments and has warning annotations
  [
    /^(\S.*?) has (\d+|9\+) comments?(?: and has (warning|notice|failure) annotations)?$/,
    (_, file: string, count: string, level: string) => fileTreeNote(file, count, level),
  ],
  [
    /^(\S.*?) has (warning|notice|failure) annotations$/,
    (_, file: string, level: string) => fileTreeNote(file, '', level),
  ],
  // 展开上下文
  [/^Expand file up from line (\d+)$/, '从第 $1 行向上展开文件'],
  [/^Expand file down from line (\d+)$/, '从第 $1 行向下展开文件'],
  [/^Expand file from line (\d+) to line (\d+)$/, '展开文件第 $1 至 $2 行'],
  // 行选择播报
  [new RegExp(`^(${LINE_SOURCE}) selected\\.$`), '已选择 $1。'],
  [new RegExp(`^(${LINE_SOURCE}) to (${LINE_SOURCE}) selected\\.$`), '已选择 $1 至 $2。'],
  [/^Line (\d+)$/, '第 $1 行'],
  // 行评论
  [new RegExp(`^Add a comment on line (${LINE_SOURCE})$`), '在第 $1 行添加评论'],
  [new RegExp(`^Add a comment on lines (${LINE_SOURCE}) to (${LINE_SOURCE})$`), '在第 $1 至 $2 行添加评论'],
  [new RegExp(`^Comment on line (${LINE_SOURCE})$`), '评论第 $1 行'],
  [new RegExp(`^Comment on lines (${LINE_SOURCE})-(${LINE_SOURCE})$`), '评论第 $1 至 $2 行'],
  // 行操作菜单（右键）：Add comment on line R12 / Suggest change, modified lines R3-R5
  [
    /^(Add comment|Suggest change)(?: on lines? |, (modified|original) lines? )([LR]\d+)(?:-([LR]\d+))?$/,
    (_, action: string, side: string, start: string, end: string) =>
      `在${side ? LINE_SIDES[side] : ''}第 ${end ? `${start} 至 ${end}` : start} 行${LINE_ACTIONS[action] ?? action}`,
  ],
  // 文件筛选后的剩余数播报
  [/^(\d+) files? remains?$/, '剩余 $1 个文件'],
  // 子模块：Submodule <路径> added at <sha> / updated <3 files>（路径无链接时与后面的动作拼成一句）
  [
    /^Submodule (\S+) (added at|deleted from)(?: ([0-9a-f]{7}))?$/,
    (_, path: string, action: string, sha: string) =>
      `子模块 ${path} ${action === 'added at' ? '添加于' : '删除自'}${sha ? ` ${sha}` : ''}`,
  ],
  [
    /^Submodule (\S+) updated(?: from ([0-9a-f]{7}) to ([0-9a-f]{7}))?$/,
    (_, path: string, from: string, to: string) =>
      from ? `子模块 ${path} 已从 ${from} 更新到 ${to}` : `子模块 ${path} 已更新`,
  ],
  [/^updated from ([0-9a-f]{7}) to ([0-9a-f]{7})$/, '已从 $1 更新到 $2'],
  [/^added at ([0-9a-f]{7})$/, '添加于 $1'],
  [/^deleted from ([0-9a-f]{7})$/, '删除自 $1'],
  [/^from ([0-9a-f]{7}) to ([0-9a-f]{7})$/, '从 $1 到 $2'],
]

/**
 * 差异视图：React 提交详情页与经典比较页共用。视图设置、文件头与菜单、文件状态提示、
 * 展开上下文、注释、行评论、富差异。
 */
export default {
  static: {
    // 经典差异视图切换
    'Diff view': '差异视图',

    // 文件头
    'Collapse file': '折叠文件',
    'Expand file': '展开文件',

    // 差异表格（屏幕阅读器）
    'Original file line number': '原始文件行号',
    'Original file line': '原始文件行',
    'Diff line number': '差异行号',
    'Diff line change': '差异行更改',

    // 文件状态提示
    'Load diff': '加载差异',
    'Load Diff': '加载差异',
    'This file was deleted.': '此文件已删除。',
    'Empty file added': '已添加空文件',
    // 带句号的写法与拉取请求共用，见 scoped
    'File renamed without changes': '文件已重命名且内容无更改',
    'There was a problem loading the remainder of the diff.': '加载差异的其余部分时出现问题。',
    'error fetching diff lines.': '获取差异行时出错。',
    'Error fetching diff lines': '获取差异行时出错',
    'Loading dependency review...': '正在加载依赖项审查...',
    // 清单文件的依赖项审查富差异（原文无标点，译文不加）
    'No dependencies changed.': '依赖项未更改。',
    'The changes to this file likely do not affect the dependencies': '对此文件的更改可能不影响依赖项',
    // 底部 Give feedback on <a>dependency review</a> 的整句见 inline，以下两条是整句未命中时的片段
    'Give feedback on': '提供反馈',
    'dependency review': '依赖项审查',
    // 隐藏 / 双向 Unicode 字符警告（首句原文无逗号，译文改语序不加）
    'This file contains hidden or bidirectional Unicode text that may be interpreted or compiled differently than what appears below. To review, open the file in an editor that reveals hidden Unicode characters.':
      '此文件包含解释或编译结果可能与下方显示不同的隐藏或双向 Unicode 文本。要审查，请在能显示隐藏 Unicode 字符的编辑器中打开此文件。',
    'This file contains bidirectional Unicode text that may be interpreted or compiled differently than what appears below. To review, open the file in an editor that reveals hidden Unicode characters.':
      '此文件包含解释或编译结果可能与下方显示不同的双向 Unicode 文本。要审查，请在能显示隐藏 Unicode 字符的编辑器中打开此文件。',

    // 展开上下文
    'Go to next hunk': '转到下一个差异块',
    'Go to previous hunk': '转到上一个差异块',

    // 注释（检查运行）
    'Check failure': '检查失败',
    'Check warning': '检查警告',
    'Check notice': '检查通知',

    // 行评论
    'Add line comment': '添加行评论',
    'Leave a comment': '发表评论',
    'Failed to save comment': '保存评论失败',
    'Suggest change': '建议更改',
    // suggested change → 建议更改（GLOSSARY，与 pulls/review.ts 一致）
    'Suggested change cannot be the same as the original line': '建议更改不能与原始行相同',
    // 行内评论线程标题：评论行 <R12> / 评论行 <L3> 至 <R5>
    'Comment on line': '评论行',
    'Comment on lines': '评论行',
    'Comment on file': '评论此文件',
    'Add comment on file': '在文件上添加评论',
    'Write a reply': '编写回复',
    'Expand comment': '展开评论',
    'Collapse comment': '折叠评论',
    // 行操作菜单的评论折叠项（逗号随原文；modified 与上面行操作正则的 LINE_SIDES 同译“修改后的”）
    'Collapse comments, modified line': '折叠评论，修改后的行',
    'Expand comments, modified line': '展开评论，修改后的行',
    'Collapse comments, original line': '折叠评论，原始行',
    'Expand comments, original line': '展开评论，原始行',
    'View comments': '查看评论',
    'Loading comments': '正在加载评论',
    'Loading comment editor': '正在加载评论编辑器',
    // 两句原文用句号分开，译文不并成逗号句
    'The comment editor failed to load. Try reloading the page.': '评论编辑器加载失败。请尝试重新加载页面。',
    'Comment view': '评论视图',
    'Code has comments and alerts. Press enter to view.': '代码有评论和警报。按 Enter 查看。',
    'Code has comments. Press enter to view.': '代码有评论。按 Enter 查看。',
    'Code has alerts. Press enter to view.': '代码有警报。按 Enter 查看。',
    'Delete comment?': '删除评论？',
    'Are you sure you want to delete this comment?': '确定要删除此评论吗？',
    'Please enter a valid line number or range.': '请输入有效的行号或范围。',
    'Select to change location': '选择以更改位置',
    'Line range': '行范围',
    'Left (L)': '左侧 (L)',
    'Right (R)': '右侧 (R)',
  },
  scoped: {
    // 视图设置
    Layout: '布局',
    Unified: '统一',
    Split: '拆分',
    Format: '格式',
    Whitespace: '空白',
    'Diff settings': '差异设置',
    // 经典比较页摘要：显示 <N 个已更改的文件> 包含 <新增 N 行> 和 <删除 N 行>
    Showing: '显示',
    with: '包含',
    // 行内评论线程标题的行范围：<L3> 至 <R5>
    to: '至',
    // 在差异中查找：上一个 / 下一个结果
    Up: '上一个',
    Down: '下一个',
    // 文件筛选菜单
    'File extensions': '文件扩展名',
    'No extension': '无扩展名',

    // 以下差异视图文字与拉取请求“已更改的文件”页共用，pulls 词典已收入全局 static；
    // 这里按页面收录同样的译法，避免跨文件重复，也不受对方词典调整影响
    'Compact line height': '紧凑行高',
    'Minimize comments': '最小化评论',
    'Ask about this diff': '询问此差异',
    'Customizable line height': '可自定义行高',
    // 原文无逗号，译文不加
    'The default line height has been increased for improved accessibility. You can choose to enable a more compact line height from the view settings menu.':
      '默认行高已为改善辅助功能而增加。你可以在视图设置菜单中启用更紧凑的行高。',
    'Enable compact line height': '启用紧凑行高',
    'Whitespace changes': '空白更改',
    'Show in all files.': '在所有文件中显示。',
    'Always show': '始终显示',
    'Hide in all files.': '在所有文件中隐藏。',
    'Always hide': '始终隐藏',
    'Other diffs stay unchanged.': '其他差异保持不变。',
    'Hide for this diff only': '仅在此差异中隐藏',
    'Toggle all file notes': '切换所有文件备注',
    'Toggle all file annotations': '切换所有文件注释',
    'Copy file name to clipboard': '复制文件名到剪贴板',
    'Display the source diff': '显示源差异',
    'Display the rich diff': '显示富差异',
    'Toggle diff contents': '切换差异内容',
    'Action unavailable': '操作不可用',
    'You must be signed in and have push access to make changes.': '你必须登录并拥有推送权限才能进行更改。',
    'You must be signed in and have push access to delete this file.': '你必须登录并拥有推送权限才能删除此文件。',
    'Selection Cleared': '已清除选择',
    'Large diffs are not rendered by default.': '大型差异默认不渲染。',
    // 原文无逗号，译文不加
    'File renamed without changes.': '文件已重命名且内容无更改。',
    'File copied without changes.': '文件已复制且内容无更改。',
    'File mode changed.': '文件模式已更改。',
    'Whitespace-only changes.': '仅有空白更改。',
    'Binary file not shown.': '不显示二进制文件。',
    'Empty file.': '空文件。',
    // 部分生成的文件默认不渲染。了解 <如何自定义已更改的文件在 GitHub 上的显示方式。>
    'Some generated files are not rendered by default. Learn more about': '部分生成的文件默认不渲染。了解',
    'customizing how changed files appear on GitHub.': '如何自定义已更改的文件在 GitHub 上的显示方式。',
    "The contents of the file couldn't be loaded.": '无法加载文件内容。',
    'The contents of the file couldn’t be loaded.': '无法加载文件内容。',
    'maximum diff size exceeded.': '超出最大差异大小。',
    'maximum number of lines exceeded.': '超出最大行数。',
    'This diff could not be loaded automatically because of too many other changes.':
      '此差异因其他更改过多而无法自动加载。',
    'This diff could not be loaded automatically because of too many other files to display.':
      '此差异因要显示的其他文件过多而无法自动加载。',
    'There was an issue loading this file': '加载此文件时出现问题',
    'There are no files selected for viewing': '没有选择要查看的文件',
    'This rich diff is not supported at the moment.': '暂不支持此富差异。',
    'Loading Dependency Review...': '正在加载依赖项审查...',
    'Expand above': '向上展开',
    'Expand below': '向下展开',
    'Collapse expanded lines': '折叠已展开的行',
    'Collapse added diff lines': '折叠添加的差异行',
    'Expand annotation': '展开注释',
    'Collapse annotation': '折叠注释',
    'Collapse comments': '折叠评论',
    'Expand comments': '展开评论',
    'Return to code': '返回代码',
    'Continue comment in progress': '继续未完成的评论',

    // 文件头菜单（Show options、More options、View details 由 common-ui 收录）
    'Show comments': '显示评论',
    'View file': '查看文件',
    'Edit file': '编辑文件',
    'Delete file': '删除文件',
    Annotation: '注释',
    // 注释标题：检查失败位于行 <R12>
    'Check failure on line': '检查失败位于行',
    'Check warning on line': '检查警告位于行',
    'Check notice on line': '检查通知位于行',
    Diff: '差异',
    Diffs: '差异',
    // 子模块：子模块 <路径> 添加于 <sha> / 已更新 <3 个文件>
    'added at': '添加于',
    'deleted from': '删除自',
    updated: '已更新',
    // 行评论（Reply、Add a comment、Copy link、Select all、Expand all 由 common-ui 收录）
    'Add comment': '添加评论',
    // 新评论标题与更改位置对话框：添加评论于 <R12>（行号在按钮中）
    'Add a comment on': '添加评论于',
    'Add comment on': '添加评论于',
  },
  regexp,
  inline: [
    // 依赖项审查富差异底部：对 <依赖项审查> 提供反馈（与 Give feedback on Issues 同一句式）
    ['Give feedback on {}', '对{}提供反馈'],
  ],
} satisfies PageDictionary
