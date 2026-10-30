import type { PageDictionary, RegExpRule } from '../../../core/types'
import { joinCjk } from '../helpers'

/** 行号前缀：L 左侧（原始），R 右侧（新） */
const LINE_SOURCE = '[LR]?\\d+'

/** 行操作菜单：Add comment / Suggest change */
const LINE_ACTIONS: Readonly<Record<string, string>> = {
  'Add comment': '新增留言',
  'Suggest change': '建議變更',
}

/** 行操作菜单的行范围：修改后 / 原始 */
const LINE_SIDES: Readonly<Record<string, string>> = { modified: '修改後的', original: '原始的' }

/** 文件树注释级别（annotation → 標註） */
const ANNOTATION_LEVELS: Readonly<Record<string, string>> = {
  warning: '警告',
  notice: '提示',
  failure: '失敗',
}

/** 文件树条目的屏幕阅读器文字：src/app.ts 有 3 則留言和警告標註（原文无标点，译文不加） */
function fileTreeNote(file: string, count: string, level: string): string {
  const name = file === 'This file' ? '此檔案' : `${file} `
  const parts = [count ? `${count} 則留言` : '', level ? `${ANNOTATION_LEVELS[level] ?? level}標註` : '']
  return name + joinCjk('有', parts.filter(Boolean).join('和'))
}

const regexp: readonly RegExpRule[] = [
  // 行数统计（React 页头与文件头的屏幕阅读器文字；经典差异文件头）。& 译「和」，原文无逗号，译文不加
  [/^Lines changed: ([\d,]+) additions? & ([\d,]+) deletions?$/, '變更行數：新增 $1 行和刪除 $2 行'],
  [/^([\d,]+) changes?: ([\d,]+) additions? & ([\d,]+) deletions?$/, '$1 處變更：新增 $2 行和刪除 $3 行'],
  // 经典比较页摘要（整句在同一节点时；原文无逗号，改语序不加逗号，with 与拆开时的 scoped 同译「包含」）
  [
    /^Showing ([\d,]+) changed files? with ([\d,]+) additions? and ([\d,]+) deletions?\.$/,
    '顯示包含新增 $2 行和刪除 $3 行的 $1 個變更的檔案。',
  ],
  // 经典比较页摘要：Showing <698 changed files> with <199,850 additions> and <8,959 deletions>.
  [/^([\d,]+) changed files?$/, '$1 個變更的檔案'],
  [/^([\d,]+) additions?$/, '新增 $1 行'],
  [/^([\d,]+) deletions?$/, '刪除 $1 行'],
  // 文件头（路径通常在 <code> 中，这里只处理无障碍名称与提示；原文无括号，译文不加）
  [/^Diff for: (.+?) renamed to (.+)$/, '$1 重新命名為 $2 的差異'],
  [/^Diff for: (\S.*)$/, '$1 的差異'],
  [/^Expand all lines: (\S.*)$/, '展開所有行：$1'],
  [/^Collapse non-diff lines: (\S.*)$/, '摺疊無差異的行：$1'],
  [/^collapse file: (\S.*)$/, '摺疊檔案：$1'],
  [/^(\S+) renamed to (\S+)$/, '$1 重新命名為 $2'],
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
  [/^Expand file up from line (\d+)$/, '從第 $1 行向上展開檔案'],
  [/^Expand file down from line (\d+)$/, '從第 $1 行向下展開檔案'],
  [/^Expand file from line (\d+) to line (\d+)$/, '展開檔案第 $1 至 $2 行'],
  // 行选择播报
  [new RegExp(`^(${LINE_SOURCE}) selected\\.$`), '已選取 $1。'],
  [new RegExp(`^(${LINE_SOURCE}) to (${LINE_SOURCE}) selected\\.$`), '已選取 $1 至 $2。'],
  [/^Line (\d+)$/, '第 $1 行'],
  // 行评论
  [new RegExp(`^Add a comment on line (${LINE_SOURCE})$`), '在第 $1 行新增留言'],
  [new RegExp(`^Add a comment on lines (${LINE_SOURCE}) to (${LINE_SOURCE})$`), '在第 $1 至 $2 行新增留言'],
  [new RegExp(`^Comment on line (${LINE_SOURCE})$`), '對第 $1 行留言'],
  [new RegExp(`^Comment on lines (${LINE_SOURCE})-(${LINE_SOURCE})$`), '對第 $1 至 $2 行留言'],
  // 行操作菜单（右键）：Add comment on line R12 / Suggest change, modified lines R3-R5
  [
    /^(Add comment|Suggest change)(?: on lines? |, (modified|original) lines? )([LR]\d+)(?:-([LR]\d+))?$/,
    (_, action: string, side: string, start: string, end: string) =>
      `在${side ? LINE_SIDES[side] : ''}第 ${end ? `${start} 至 ${end}` : start} 行${LINE_ACTIONS[action] ?? action}`,
  ],
  // 文件筛选后的剩余数播报
  [/^(\d+) files? remains?$/, '剩餘 $1 個檔案'],
  // 子模块：Submodule <路径> added at <sha> / updated <3 files>（路径无链接时与后面的动作拼成一句）
  [
    /^Submodule (\S+) (added at|deleted from)(?: ([0-9a-f]{7}))?$/,
    (_, path: string, action: string, sha: string) =>
      `子模組 ${path} ${action === 'added at' ? '新增於' : '刪除自'}${sha ? ` ${sha}` : ''}`,
  ],
  [
    /^Submodule (\S+) updated(?: from ([0-9a-f]{7}) to ([0-9a-f]{7}))?$/,
    (_, path: string, from: string, to: string) =>
      from ? `子模組 ${path} 已從 ${from} 更新為 ${to}` : `子模組 ${path} 已更新`,
  ],
  [/^updated from ([0-9a-f]{7}) to ([0-9a-f]{7})$/, '已從 $1 更新為 $2'],
  [/^added at ([0-9a-f]{7})$/, '新增於 $1'],
  [/^deleted from ([0-9a-f]{7})$/, '刪除自 $1'],
  [/^from ([0-9a-f]{7}) to ([0-9a-f]{7})$/, '從 $1 到 $2'],
]

/**
 * 差异视图：React 提交详情页与经典比较页共用。视图设置、文件头与菜单、文件状态提示、
 * 展开上下文、注释、行评论、富差异。
 */
export default {
  static: {
    // 经典差异视图切换
    'Diff view': '差異檢視',

    // 文件头
    'Collapse file': '摺疊檔案',
    'Expand file': '展開檔案',

    // 差异表格（屏幕阅读器）
    'Original file line number': '原始檔案行號',
    'Original file line': '原始檔案行',
    'Diff line number': '差異行號',
    'Diff line change': '差異行變更',

    // 文件状态提示
    'Load diff': '載入差異',
    'Load Diff': '載入差異',
    'This file was deleted.': '此檔案已刪除。',
    'Empty file added': '已新增空白檔案',
    // 带句号的写法与拉取请求共用，见 scoped
    'File renamed without changes': '檔案已重新命名且內容未變更',
    'There was a problem loading the remainder of the diff.': '載入差異的其餘部分時發生問題。',
    'error fetching diff lines.': '擷取差異行時發生錯誤。',
    'Error fetching diff lines': '擷取差異行時發生錯誤',
    'Loading dependency review...': '正在載入相依性審查...',
    // 清单文件的依赖项审查富差异（原文无标点，译文不加）
    'No dependencies changed.': '相依項目未變更。',
    'The changes to this file likely do not affect the dependencies': '此檔案的變更可能不會影響相依項目',
    // 底部 Give feedback on <a>dependency review</a> 的整句见 inline，以下两条是整句未命中时的片段
    'Give feedback on': '提供意見回饋',
    'dependency review': '相依性審查',
    // 隐藏 / 双向 Unicode 字符警告（首句原文无逗号，译文改语序不加）
    'This file contains hidden or bidirectional Unicode text that may be interpreted or compiled differently than what appears below. To review, open the file in an editor that reveals hidden Unicode characters.':
      '此檔案包含解讀或編譯結果可能與下方顯示不同的隱藏或雙向 Unicode 文字。若要審查，請在能顯示隱藏 Unicode 字元的編輯器中開啟此檔案。',
    'This file contains bidirectional Unicode text that may be interpreted or compiled differently than what appears below. To review, open the file in an editor that reveals hidden Unicode characters.':
      '此檔案包含解讀或編譯結果可能與下方顯示不同的雙向 Unicode 文字。若要審查，請在能顯示隱藏 Unicode 字元的編輯器中開啟此檔案。',

    // 展开上下文
    'Go to next hunk': '前往下一個差異區塊',
    'Go to previous hunk': '前往上一個差異區塊',

    // 注释（检查运行）
    'Check failure': '檢查失敗',
    'Check warning': '檢查警告',
    'Check notice': '檢查提示',

    // 行评论
    'Add line comment': '新增行留言',
    'Leave a comment': '發表留言',
    'Failed to save comment': '無法儲存留言',
    'Suggest change': '建議變更',
    // suggested change → 建議的變更（GLOSSARY.zh-TW）
    'Suggested change cannot be the same as the original line': '建議的變更不能與原始行相同',
    // 行内评论线程标题：留言位於行 <R12> / 留言位於行 <L3> 至 <R5>
    'Comment on line': '留言位於行',
    'Comment on lines': '留言位於行',
    'Comment on file': '對檔案留言',
    'Add comment on file': '對檔案新增留言',
    'Write a reply': '撰寫回覆',
    'Expand comment': '展開留言',
    'Collapse comment': '摺疊留言',
    // 行操作菜单的评论折叠项（逗号随原文；modified 与上面行操作正则的 LINE_SIDES 同译「修改後的」）
    'Collapse comments, modified line': '摺疊留言，修改後的行',
    'Expand comments, modified line': '展開留言，修改後的行',
    'Collapse comments, original line': '摺疊留言，原始行',
    'Expand comments, original line': '展開留言，原始行',
    'View comments': '查看留言',
    'Loading comments': '正在載入留言',
    'Loading comment editor': '正在載入留言編輯器',
    // 两句原文用句号分开，译文不并成逗号句
    'The comment editor failed to load. Try reloading the page.': '留言編輯器載入失敗。請嘗試重新載入頁面。',
    'Comment view': '留言檢視',
    'Code has comments and alerts. Press enter to view.': '程式碼有留言和警示。按 Enter 查看。',
    'Code has comments. Press enter to view.': '程式碼有留言。按 Enter 查看。',
    'Code has alerts. Press enter to view.': '程式碼有警示。按 Enter 查看。',
    'Delete comment?': '刪除留言？',
    'Are you sure you want to delete this comment?': '確定要刪除此留言嗎？',
    'Please enter a valid line number or range.': '請輸入有效的行號或範圍。',
    'Select to change location': '選取以變更位置',
    'Line range': '行範圍',
    'Left (L)': '左側 (L)',
    'Right (R)': '右側 (R)',
  },
  scoped: {
    // 视图设置
    Layout: '版面配置',
    Unified: '統一',
    Split: '分割',
    Format: '格式',
    Whitespace: '空白字元',
    'Diff settings': '差異設定',
    // 经典比较页摘要：顯示 <N 個變更的檔案> 包含 <新增 N 行> 和 <刪除 N 行>
    Showing: '顯示',
    with: '包含',
    // 行内评论线程标题的行范围：<L3> 至 <R5>
    to: '至',
    // 在差异中查找：上一个 / 下一个结果
    Up: '上一個',
    Down: '下一個',
    // 文件筛选菜单
    'File extensions': '副檔名',
    'No extension': '無副檔名',

    // 以下差异视图文字与拉取请求「變更的檔案」页共用，pulls 词典已收入全局 static；
    // 这里按页面收录同样的译法，避免跨文件重复，也不受对方词典调整影响
    'Compact line height': '緊密行高',
    'Minimize comments': '最小化留言',
    'Ask about this diff': '針對此差異提問',
    'Customizable line height': '可自訂行高',
    // 原文无逗号，译文不加
    'The default line height has been increased for improved accessibility. You can choose to enable a more compact line height from the view settings menu.':
      '預設行高已加大以改善無障礙體驗。你可以在檢視設定選單中啟用較緊密的行高。',
    'Enable compact line height': '啟用緊密行高',
    'Whitespace changes': '空白字元變更',
    'Show in all files.': '在所有檔案中顯示。',
    'Always show': '一律顯示',
    'Hide in all files.': '在所有檔案中隱藏。',
    'Always hide': '一律隱藏',
    'Other diffs stay unchanged.': '其他差異維持不變。',
    'Hide for this diff only': '僅在此差異中隱藏',
    'Toggle all file notes': '切換所有檔案附註',
    'Toggle all file annotations': '切換所有檔案標註',
    'Copy file name to clipboard': '複製檔案名稱到剪貼簿',
    'Display the source diff': '顯示原始碼差異',
    'Display the rich diff': '顯示豐富差異',
    'Toggle diff contents': '切換差異內容',
    'Action unavailable': '動作無法使用',
    'You must be signed in and have push access to make changes.': '你必須登入並具有推送權限才能變更。',
    'You must be signed in and have push access to delete this file.': '你必須登入並具有推送權限才能刪除此檔案。',
    'Selection Cleared': '已清除選取範圍',
    'Large diffs are not rendered by default.': '預設不顯示大型差異。',
    // 原文无逗号，译文不加
    'File renamed without changes.': '檔案已重新命名且內容未變更。',
    'File copied without changes.': '檔案已複製且內容未變更。',
    'File mode changed.': '檔案模式已變更。',
    'Whitespace-only changes.': '僅有空白字元變更。',
    'Binary file not shown.': '不顯示二進位檔案。',
    'Empty file.': '空白檔案。',
    // 部分產生的檔案預設不顯示。瞭解 <如何自訂變更的檔案在 GitHub 上的顯示方式。>
    'Some generated files are not rendered by default. Learn more about': '部分產生的檔案預設不顯示。瞭解',
    'customizing how changed files appear on GitHub.': '如何自訂變更的檔案在 GitHub 上的顯示方式。',
    "The contents of the file couldn't be loaded.": '無法載入檔案內容。',
    'The contents of the file couldn’t be loaded.': '無法載入檔案內容。',
    'maximum diff size exceeded.': '超出差異大小上限。',
    'maximum number of lines exceeded.': '超出行數上限。',
    'This diff could not be loaded automatically because of too many other changes.':
      '此差異因其他變更過多而無法自動載入。',
    'This diff could not be loaded automatically because of too many other files to display.':
      '此差異因要顯示的其他檔案過多而無法自動載入。',
    'There was an issue loading this file': '載入此檔案時發生問題',
    'There are no files selected for viewing': '沒有選取要查看的檔案',
    'This rich diff is not supported at the moment.': '目前不支援此豐富差異。',
    'Loading Dependency Review...': '正在載入相依性審查...',
    'Expand above': '向上展開',
    'Expand below': '向下展開',
    'Collapse expanded lines': '摺疊已展開的行',
    'Collapse added diff lines': '摺疊新增的差異行',
    'Expand annotation': '展開標註',
    'Collapse annotation': '摺疊標註',
    'Collapse comments': '摺疊留言',
    'Expand comments': '展開留言',
    'Return to code': '返回程式碼',
    'Continue comment in progress': '繼續撰寫未完成的留言',

    // 文件头菜单（Show options、More options、View details 由 common-ui 收录）
    'Show comments': '顯示留言',
    'View file': '查看檔案',
    'Edit file': '編輯檔案',
    'Delete file': '刪除檔案',
    Annotation: '標註',
    // 注释标题：檢查失敗位於行 <R12>
    'Check failure on line': '檢查失敗位於行',
    'Check warning on line': '檢查警告位於行',
    'Check notice on line': '檢查提示位於行',
    Diff: '差異',
    Diffs: '差異',
    // 子模块：子模組 <路径> 新增於 <sha> / 已更新 <3 個檔案>
    'added at': '新增於',
    'deleted from': '刪除自',
    updated: '已更新',
    // 行评论（Reply、Add a comment、Copy link、Select all、Expand all 由 common-ui 收录）
    'Add comment': '新增留言',
    // 新评论标题与更改位置对话框：新增留言於 <R12>（行号在按钮中）
    'Add a comment on': '新增留言於',
    'Add comment on': '新增留言於',
  },
  regexp,
  inline: [
    // 依赖项审查富差异底部：提供 <相依性審查> 的意見回饋（与 Give feedback on Issues 同一句式）
    ['Give feedback on {}', '提供{}的意見回饋'],
  ],
} satisfies PageDictionary
