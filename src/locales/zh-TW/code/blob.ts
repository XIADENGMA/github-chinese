import type { PageDictionary } from '../../../core/types'
import { DATE_SOURCE, joinCjk, translateTime } from '../helpers'

/** 代码导航分组：Definitions / References / Results in <路径> */
const CODE_NAV_KIND: Readonly<Record<string, string>> = {
  Definitions: '定義',
  References: '參考',
  Results: '結果',
}

/** 「啟用此功能」或「啟用 CODEOWNERS」（功能名由 GitHub 传入） */
function enableFeature(feature: string): string {
  return feature === 'this feature' ? '啟用此功能' : `啟用 ${feature}`
}

/** 计划限制提示里的方案名（product-names.md：方案名译「X 版」） */
const PLAN_NAMES: Readonly<Record<string, string>> = {
  Pro: '專業版',
  Team: '團隊版',
}

/** 实验性代码视图：行号旁警告按钮的注释类型 */
const ANNOTATION_KIND: Readonly<Record<string, string>> = {
  'Hidden Unicode': '隱藏的 Unicode',
  'CODEOWNERS error': 'CODEOWNERS 錯誤',
}

/** 「Hidden Unicode, CODEOWNERS error」→「隱藏的 Unicode、CODEOWNERS 錯誤」 */
function annotationKinds(list: string): string {
  return list
    .split(', ')
    .map((kind) => ANNOTATION_KIND[kind] ?? kind)
    .join('、')
}

/** CODEOWNERS 行号后缀：「 (from CODEOWNERS line 3)」 */
function codeownersLine(line: string | undefined): string {
  return line ? `（來自 CODEOWNERS 第 ${line} 行）` : ''
}

/** 文件大小：「504 Bytes」→「504 位元組」，KB / MB 等单位原样保留 */
function fileSize(size: string): string {
  return size.replace(/^([\d,.]+) Bytes?$/, '$1 位元組')
}

/** 折叠代码段后的播报（实验性代码视图；原文三句都只有句号，译文不加逗号） */
function foldStatus(collapsed: string, visible: string, total: string, caret: string | undefined): string {
  const moved = caret ? `游標已移到可見的第 ${caret} 行。` : ''
  return `已摺疊 ${collapsed} 個程式碼區段。${total} 行原始碼中可見 ${visible} 行。${moved}`
}

/**
 * 文件视图（blob / blame）：头部工具栏、代码 / 追溯 / 预览、符号面板、大纲、行菜单、
 * 跳转到行、文件内查找、隐藏 Unicode、大文件、追溯视图横幅、错误页。
 */
export default {
  static: {
    // 文件头部
    'File metadata and controls': '檔案中繼資料和控制項',
    'Edit and raw actions': '編輯和原始檔動作',
    'More file actions': '更多檔案動作',
    'More edit options': '更多編輯選項',
    'Copy raw file': '複製原始檔',
    'Download raw file': '下載原始檔',
    'Copy file permalink': '複製檔案永久連結',
    'Raw file content': '原始檔內容',
    'Edit file...': '編輯檔案...',
    'In place': '就地編輯',
    'Open with...': '開啟方式...',
    'Jump to line': '跳至行',
    'Find in file': '在檔案中尋找',
    'Ask about this file': '針對此檔案提問',
    'File view': '檔案檢視',
    'Show code folding buttons': '顯示程式碼摺疊按鈕',
    'Wrap lines': '自動換行',
    'Center content': '內容置中',
    'Open symbols on click': '按一下時開啟符號',
    'Open symbols panel': '開啟符號面板',
    'Close symbols panel': '關閉符號面板',
    'Symbolic link': '符號連結',
    // 文件模式（文件大小前的标记）
    'symbolic link': '符號連結',
    'executable file': '可執行檔',
    'Stored with Git LFS': '使用 Git LFS 儲存',
    'Learn more about Git LFS': '瞭解 Git LFS',
    'View CODEOWNERS rule': '查看 CODEOWNERS 規則',
    'Code owner details': '程式碼擁有者詳細資料',

    // 编辑 / 删除按钮提示（服务端下发）
    'Edit this file': '編輯此檔案',
    'Edit the file in your fork of this project': '在你的分叉中編輯此檔案',
    'Fork this project and edit the file': '分叉此專案並編輯此檔案',
    'Fork this repository and edit the file': '分叉此儲存庫並編輯此檔案',
    'Delete this file': '刪除此檔案',
    'Delete the file in your fork of this project': '在你的分叉中刪除此檔案',
    'Fork this project and delete the file': '分叉此專案並刪除此檔案',
    'Fork this repository and delete the file': '分叉此儲存庫並刪除此檔案',
    'You must be on a branch to make or propose changes to this file': '必須在分支上才能變更或提議變更此檔案',
    'Edit in place': '就地編輯',
    'View file in GitHub.dev': '在 GitHub.dev 中查看檔案',

    // 行菜单
    'Copy line': '複製此行',
    'Copy lines': '複製選取的行',
    'View git blame': '查看追溯',
    'Reference in new issue': '在新議題中參考',
    'Reference in new discussion': '在新討論中參考',
    'Expand current section': '展開目前區段',
    'Collapse current section': '摺疊目前區段',
    'View file in different branch/tag': '在其他分支/標記中查看檔案',
    'Copied permalink.': '已複製永久連結。',
    'Code section expanded': '程式碼區段已展開',
    'Code section collapsed': '程式碼區段已摺疊',
    // 行号旁的代码折叠按钮
    'Expand code section': '展開程式碼區段',
    'Collapse code section': '摺疊程式碼區段',

    // 代码区
    'Code view is read-only.': '程式碼檢視為唯讀。',
    'Code view is read only.': '程式碼檢視為唯讀。',
    'Switch to the editor.': '切換到編輯器。',
    'While the code is focused, press Alt+F1 for a menu of operations.': '程式碼取得焦點時，按 Alt+F1 開啟動作選單。',
    'file content': '檔案內容',
    'Expand row': '展開行',
    'View remainder of file in raw view': '在原始檔檢視中查看檔案的其餘部分',
    'Code blob focused hotkeys': '程式碼區快速鍵',
    'Select the line the cursor is on': '選取游標所在行',
    'Select the symbol under the cursor': '選取游標處的符號',
    'Move focus to the highlighted line menu': '將焦點移到醒目提示行的選單',

    // 跳转到行
    'Line number': '行號',
    'Jump to line...': '跳至行...',
    'Invalid line number': '行號無效',

    // 大文件、截断、渲染
    'View raw': '查看原始檔',
    '(Sorry about that, but we can’t show files that are this big right now.)': '（檔案過大，無法顯示。）',
    'Sorry about that, but we can’t show files that are this big right now.': '檔案過大，無法顯示。',
    'This file has been truncated, but you can': '此檔案已截斷，但你可以',
    'view the full file': '查看完整檔案',
    'Sorry, this is too big to display.': '檔案過大，無法顯示。',
    'File display': '檔案顯示',
    'Viewer requires iframe.': '檢視器需要 iframe。',
    'Unable to render code block': '無法轉譯程式碼區塊',
    'Error rendering embedded code': '轉譯內嵌程式碼時發生錯誤',
    // 上一句下方逐行显示的渲染器错误（与「行號無效」同式）
    'Invalid PDF': 'PDF 無效',
    'Unable to render rich display': '無法轉譯豐富顯示',
    'But you can view the': '但你可以查看',
    'raw file': '原始檔',

    // 隐藏 Unicode（原文只有「To review,」一个逗号）
    'This file contains bidirectional or hidden Unicode text that may be interpreted or compiled differently than what appears below. To review, open the file in an editor that reveals hidden Unicode characters.':
      '此檔案包含解讀或編譯結果可能與下方顯示不同的雙向或隱藏 Unicode 文字。若要審查，請在能顯示隱藏 Unicode 字元的編輯器中開啟此檔案。',
    'Learn more about bidirectional Unicode characters': '瞭解雙向 Unicode 字元',
    'Hide revealed characters': '隱藏已顯示的字元',
    'Show hidden characters': '顯示隱藏的字元',
    'Hidden Unicode': '隱藏的 Unicode',
    'Hidden Unicode:': '隱藏的 Unicode：',
    'Hidden Unicode details': '隱藏的 Unicode 詳細資料',
    'This line has hidden Unicode characters': '此行含有隱藏的 Unicode 字元',
    'Bidirectional or hidden Unicode can change how code is interpreted. Review in an editor that reveals hidden characters.':
      '雙向或隱藏的 Unicode 可能改變程式碼的解讀方式。請在能顯示隱藏字元的編輯器中審查。',

    // 文件内查找（Press <kbd>Ctrl F</kbd> again…；整句由 regexp 处理，此为整句未命中时的片段）
    "again to open the browser's find menu": '鍵再次開啟瀏覽器的尋找選單',
    'Close find in file': '關閉檔案內尋找',
    'Search this file': '搜尋此檔案',
    'Find in file input': '檔案內尋找輸入方塊',

    // 符号面板
    'Close symbols': '關閉符號',
    'Find definitions and references for functions and other symbols in this file by clicking a symbol below or in the code.':
      '在下方或程式碼中按一下符號以尋找此檔案中函式等符號的定義和參考。',
    'Filter symbols': '篩選符號',
    'Clear input': '清除輸入',
    'Symbol outline not available for this file': '此檔案沒有符號大綱',
    'To inspect a symbol, try clicking on the symbol directly in the code view.':
      '若要檢查符號，請直接在程式碼檢視中按一下該符號。',
    'Code navigation supports a limited number of languages.': '程式碼導覽僅支援部分語言。',
    'See which languages are supported.': '查看支援的語言。',
    'No symbols found': '找不到符號',
    'No lines in this file contain that string.': '此檔案中沒有包含該字串的行。',
    'all of GitHub': '整個 GitHub',
    'Symbol Navigation Details': '符號導覽詳細資料',
    'Back to all symbols': '返回所有符號',
    'All symbols': '所有符號',
    'Previous reference': '上一個參考',
    'Next reference': '下一個參考',
    'No references found': '找不到參考',
    'No definitions or references found': '找不到定義或參考',
    'Search for this symbol': '搜尋此符號',
    'In this file': '在此檔案中',
    'Click on a symbol to see code navigation data': '按一下符號以查看程式碼導覽資料',
    'Symbol location is unavailable.': '無法取得符號位置。',

    // 追溯视图：已忽略 <.git-blame-ignore-revs> 中列出的修订（文件名为链接）
    'file is invalid.': '檔案無效。',
    'file is too large.': '檔案過大。',
    'Symlinks are not supported.': '不支援符號連結。',
    'Your blame took too long to compute.': '追溯計算逾時。',
    'Failed to ignore revisions in': '無法忽略以下檔案中的修訂',
    'Ignoring revisions in': '已忽略以下檔案中的修訂',

    // 错误页
    'Error loading page': '載入頁面時發生錯誤',
    'Return to the repository overview': '返回儲存庫總覽',
    'Go to default branch': '前往預設分支',
    'It looks like your internet connection is down. Please check it.': '網路連線似乎已中斷。請檢查連線。',
    'reloading the page.': '重新載入頁面。',
    'does not contain the path': '中不包含路徑',
    'Cannot find a valid ref in': '找不到有效的參考',
    // 无锁定文件：…執行 <gh actions-lock> in your repository.（末句由 actions 词典的全局词条处理）
    'No lockfile found': '找不到鎖定檔',
    'No lockfile was found for the workflows in this repository. Lock your workflow dependencies by running':
      '找不到此儲存庫中工作流程的鎖定檔。執行',
    '404 - page not found': '404 - 找不到頁面',
    'The requested file could not be found in': '所要求的檔案不在儲存庫',
    'File successfully deleted.': '檔案已刪除。',

    // 实验性代码视图（taillights）
    'Syntax rendering failed': '語法轉譯失敗',
    'Native text remains available.': '原生文字仍可使用。',
    'Syntax rendering failed. Native text remains available.': '語法轉譯失敗。原生文字仍可使用。',
    'Close annotations': '關閉標註',
    'CODEOWNERS error:': 'CODEOWNERS 錯誤：',
    'Selected line': '選取的行',
    'Copied source lines.': '已複製原始碼行。',
    'Copied source permalink.': '已複製原始碼永久連結。',
    'Copied original source lines.': '已複製原本的原始碼行。',
    'Copied selected text or current line.': '已複製選取的文字或目前的行。',
    'Find in file cleared.': '已清除檔案內尋找。',
    'Enter text to find in this source.': '輸入要在此原始碼中尋找的文字。',
    'No results in this source.': '此原始碼中沒有結果。',
    'No source lines available.': '沒有可用的原始碼行。',
    'Symbol highlighting failed. Select the symbol again to retry.': '符號醒目提示失敗。請重新選取符號以重試。',
    'Source preparation failed. Original source text remains available.': '原始碼準備失敗。原本的原始碼文字仍可使用。',
    'Source preparation is still pending.': '原始碼仍在準備中。',
    "Clipboard access failed. Select the code and use your browser's Copy command.":
      '無法存取剪貼簿。請選取程式碼後使用瀏覽器的複製命令。',
    'Clipboard access failed. Select the code and use your browser’s Copy command.':
      '無法存取剪貼簿。請選取程式碼後使用瀏覽器的複製命令。',
  },

  scoped: {
    // 头部按钮、标签页（单词或与其他区域共用；Preview、View 由通用词典处理）
    Raw: '原始檔',
    Blame: '追溯',
    Top: '頂端',
    Symbols: '符號',
    Find: '尋找',
    Press: '按',
    // 文件内查找：上一个 / 下一个匹配
    Up: '上一個',
    Down: '下一個',
    'Delete file': '刪除檔案',
    'Code navigation': '程式碼導覽',
    Definitions: '定義',
    Definition: '定義',
    // 符号面板：代码导航的引用（全站 static 的 References 是安全公告页的「參考資料」，此处译「參考」）
    References: '參考',
    Precise: '精確',
    'Search in': '搜尋',
    On: '在',
    branch: '分支',
    // 复制原始文件按钮的状态
    Copying: '複製中',
    // 实验性代码视图：代码区的无障碍名称
    'Source code': '原始碼',
    // 键盘快捷方式对话框中的代码视图命令
    'Copy file path': '複製檔案路徑',
    'Copy raw content': '複製原始檔內容',
    'Find symbol': '尋找符號',
    'View blame': '查看追溯',
    'View code': '查看程式碼',
    'View preview': '查看預覽',

    // 议题 / 讨论表单模板预览的表头（Name、About、Title、Projects 由通用词典处理；
    // Type 不收录：与页头「Type / to search」的片段同形）
    Labels: '標籤',
    Assignees: '負責人',

    // 追溯视图（Newer、Older 由通用词典处理）
    Your: '你的',

    // 错误页片段
    The: '該',
    'branch of': '分支在',
    'An unexpected error occurred. Try': '發生未預期的錯誤。請嘗試',
    // 路径不存在时的页面标题
    'File not found': '找不到檔案',

    // Copilot 行菜单
    'Suggest improvements': '建議改進',
  },

  regexp: [
    // 文件大小：117 lines (117 loc) · 5.03 KB；大文件的行数缩写为 12.3k
    [
      /^([\d,.]+k?) lines? \(([\d,.]+k?) loc\) · (\S.*)$/,
      (_, lines: string, loc: string, size: string) => `${lines} 行（${loc} 行程式碼）· ${fileSize(size)}`,
    ],
    // 不可预览的文件（二进制等）只显示大小
    [/^([\d,.]+) Bytes?$/, '$1 位元組'],

    // 代码所有者（「younull」是 GitHub 自身拼接缺陷；原文无标点，译文不加冒号、顿号；
    // 与 pulls/files.ts 差异视图的同一提示同译「擁有者為 X」）
    [
      /^Owned by you(?:null)?(?: along with (\S.*?))?(?: \(from CODEOWNERS line (\d+)\))?$/,
      (_, others: string, line: string) => `擁有者為你${others ? `和 ${others}` : ''}${codeownersLine(line)}`,
    ],
    [
      /^Owned by (\S.*?)(?: \(from CODEOWNERS line (\d+)\))?$/,
      (_, owners: string, line: string) => `擁有者為 ${owners}${codeownersLine(line)}`,
    ],
    [/^Code owners: You, (\S.*)$/, '程式碼擁有者：你、$1'],
    [/^Code owner: You$/, '程式碼擁有者：你'],
    [/^Code owner: (\S.*)$/, '程式碼擁有者：$1'],

    // 行菜单
    [/^Line (\d+) options$/, '第 $1 行選項'],
    [/^Copied line (\d+)\.$/, '已複製第 $1 行。'],
    [/^Copied lines (\d+)-(\d+)\.$/, '已複製第 $1-$2 行。'],

    // 文件内查找：Press <kbd>快捷键</kbd> again…（kbd 整句匹配，快捷键随系统变化）
    [/^Press (.+?) again to open the browser's find menu$/, '再按一次 $1 以開啟瀏覽器的尋找選單'],

    // 追溯：Blame prior to change <SHA>, made on <日期>（原文只有逗号，译文不换成括号）
    [
      new RegExp(`^Blame prior to change ([0-9a-f]{7,40}), made on (${DATE_SOURCE})$`),
      (_, sha: string, date: string) => `追溯 ${sha} 之前的版本，${joinCjk('該變更提交於', translateTime(date))}`,
    ],

    // 符号面板（播报文字末尾可能带零宽空格）
    [/^(\d+) symbols? found\u200B*$/, '找到 $1 個符號'],
    [/^([\d,]+) References?$/, '$1 個參考'],
    [
      /^(Definitions|References|Results) in (\S.*)$/,
      (_, kind: string, where: string) =>
        `${where === 'this file' ? '此檔案' : `${where} `}中的${CODE_NAV_KIND[kind] ?? kind}`,
    ],

    // 错误页：An unexpected 500 error occurred. Try（文本节点拼接后匹配）
    [/^An unexpected (\d{3}) error occurred\. Try$/, '發生未預期的 $1 錯誤。請嘗試'],

    // 计划限制提示（方案名译「X 版」）
    [
      /^Upgrade to GitHub (Pro|Team) or make this repository public to enable (\S.*)\.$/,
      (_, plan: string, feature: string) =>
        `升級到 GitHub ${PLAN_NAMES[plan] ?? plan}或將此儲存庫設為公開以${enableFeature(feature)}。`,
    ],
    // 复刻存储库：原文句末没有句号
    [
      /^This repository is a fork, and inherits the features of the parent repository\. Contact the owner of the root repository to enable (\S.*?)(\.?)$/,
      (_, feature: string, period: string) =>
        `此儲存庫是分叉，繼承了父儲存庫的功能。聯絡根儲存庫的擁有者以${enableFeature(feature)}${period ? '。' : ''}`,
    ],
    [
      /^Contact the owner of the repository to enable (\S.*)\.$/,
      (_, feature: string) => `聯絡儲存庫擁有者以${enableFeature(feature)}。`,
    ],

    // 实验性代码视图（taillights）
    [/^Line (\d+) annotations$/, '第 $1 行標註'],
    // 行号旁警告按钮：Line 3 annotations: Hidden Unicode, CODEOWNERS error
    [
      /^Line (\d+) annotations: ((?:Hidden Unicode|CODEOWNERS error)(?:, (?:Hidden Unicode|CODEOWNERS error))*)$/,
      (_, line: string, kinds: string) => `第 ${line} 行標註：${annotationKinds(kinds)}`,
    ],
    [/^Line (\d+) actions$/, '第 $1 行的動作'],
    [/^Lines (\d+)[–-](\d+) actions$/, '第 $1–$2 行的動作'],
    [/^Expand section at line (\d+)$/, '展開第 $1 行處的程式碼區段'],
    [/^Collapse section at line (\d+)$/, '摺疊第 $1 行處的程式碼區段'],
    [/^Expand row (\d+)$/, '展開第 $1 行'],
    [/^Line (\d+) highlighted\.$/, '已醒目提示第 $1 行。'],
    [/^Lines (\d+) to (\d+) highlighted\.$/, '已醒目提示第 $1 至 $2 行。'],
    [
      /^Find in file: (\d+) results\. Result (\d+) of \d+, line (\d+)\.$/,
      '檔案內尋找：共 $1 項結果。第 $2 項，第 $3 行。',
    ],
    // 原文只有一个逗号：不写成「第 N 項結果，共 M 項，第 L 行」
    [/^Result (\d+) of (\d+), line (\d+)\.$/, '共 $2 項結果中的第 $1 項，第 $3 行。'],
    [/^Line (\d+)$/, '第 $1 行'],
    // 原文无冒号：符号名用「的」连接
    [/^(\d+) text references? to (.+)\.$/, '$2 的 $1 處文字參考。'],
    [
      /^(\d+) sections? collapsed\. (\d+) of (\d+) source lines visible\.(?: Caret moved to visible line (\d+)\.)?$/,
      (_, collapsed: string, visible: string, total: string, caret: string) =>
        foldStatus(collapsed, visible, total, caret),
    ],
    [/^Source preparation failed\. (.+)$/, '原始碼準備失敗。$1'],
    // 实验性代码视图：符号详细信息（符号名原样保留）
    [/^Loading symbol details for (.+)\.$/, '正在載入 $1 的符號詳細資料。'],
    [/^Unable to load symbol details for (.+)\.$/, '無法載入 $1 的符號詳細資料。'],
    [/^Loading references for (.+)\.$/, '正在載入 $1 的參考。'],
    [/^Unable to load references for (.+)\.$/, '無法載入 $1 的參考。'],
    [/^(\d+) definitions? and (\d+) references? for (.+)\.$/, '$3 的 $1 個定義和 $2 個參考。'],
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
    '[class*="templateWrapper__"] > :not(table)',
  ],
} satisfies PageDictionary
