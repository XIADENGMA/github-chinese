import type { PageDictionary, RegExpRule } from '../../core/types'
import { joinCjk, TIME_SOURCE, translateTime } from './helpers'

/** “Learn more about …”中的注册表名；Containers 与 profile.ts 一致译为“容器”，其余是第三方品牌名，保留英文 */
const REGISTRY_SOURCE = '(?:Apache Maven|Maven or Gradle|Maven|Gradle|NuGet|RubyGems|npm|Docker|Containers)'

/** Learn more about npm packages → 瞭解 npm 套件；Learn more about Maven or Gradle → 瞭解 Maven 或 Gradle */
function learnMoreAbout(registry: string, packages: boolean): string {
  if (registry === 'Containers') return packages ? '瞭解容器套件' : '瞭解容器'
  const name = registry.replace(' or ', ' 或 ')
  return packages ? `瞭解 ${name} 套件` : `瞭解 ${name}`
}

/** 软件包名：容器 / npm / NuGet / Maven / RubyGems 名称所用字符 */
const NAME_SOURCE = '[\\w.@/-]+'

/** 设置页提示中的存储库名、软件包名、用户名（不含空白） */
const ID_SOURCE = '[\\w.@/-]+'

/** “Remove <名称> from <软件包>”中名称不会是这些界面名词（Remove access from repository 等） */
const NOT_UI_NOUN = '(?!(?:access|collaborator|member|package|permission|repository|team|user|version)s? )'

/** “Package <名称>”标题段排除的界面词：Package settings、Package Details 等 */
const NOT_PACKAGE_WORD =
  '(?![A-Z][a-z]+$)(?!(?:access|details|description|downloads|history|name|owner|registry|settings|source|type|versions|visibility)$)'

/** “<名称> versions”标题段排除的界面词：首字母大写的单词（Show versions、Older versions）与小写的 all versions 等 */
const NOT_VERSIONS_WORD =
  '(?![A-Z][a-z]+ versions$)(?!(?:active|all|deleted|latest|more|new|newer|no|old|older|other|package|previous|recent|tagged|untagged|view) versions$)'

const regexp: readonly RegExpRule[] = [
  // 版本发布时间：Published 38 minutes ago · Digest / Published over 6 years ago
  [new RegExp(`^Published (${TIME_SOURCE}) · Digest$`), (_, time) => `${joinCjk(translateTime(time), '發布')} · 摘要`],
  [new RegExp(`^Published (${TIME_SOURCE})$`), (_, time) => joinCjk(translateTime(time), '發布')],
  // 版本列表标签页与筛选
  [/^(\d[\d,]*) tagged$/, '$1 個已標記版本'],
  [/^(\d[\d,]*) untagged$/, '$1 個未標記版本'],
  [/^(\d[\d,]*) active$/, '$1 個作用中版本'],
  [/^(\d[\d,]*) deleted$/, '$1 個已刪除版本'],
  [/^Package versions of (.+)$/, '$1 的套件版本'],
  // 详情侧栏
  [/^\+ (\d[\d,]*) contributors?$/, '+ $1 位貢獻者'],
  [/^(\d[\d,]*) dependenc(?:y|ies)$/, '$1 個相依項目'],
  [
    new RegExp(`^Learn more about (${REGISTRY_SOURCE})( packages)?$`),
    (_, registry, suffix) => learnMoreAbout(registry, Boolean(suffix)),
  ],
  // 页面标题段：Package hello-world / hello-world versions
  [new RegExp(`^Package ${NOT_PACKAGE_WORD}(${NAME_SOURCE})$`), '套件 $1'],
  [new RegExp(`^${NOT_VERSIONS_WORD}(${NAME_SOURCE}) versions$`), '$1 的版本'],
  // 设置：确认对话框
  [/^Please type (.+) to confirm([.:])$/, (_, name, mark) => `請輸入 ${name} 以確認${mark === ':' ? '：' : '。'}`],
  [
    new RegExp(`^Are you sure you want to unlink (${ID_SOURCE}) from (${ID_SOURCE})\\?$`),
    '確定要取消 $1 和 $2 的連結嗎？',
  ],
  // 设置：访问权限列表
  [/^(\d[\d,]*) repositor(?:y|ies) selected(…|\.\.\.)$/, '已選取 $1 個儲存庫$2'],
  [/^Change the role of (\d[\d,]*) repositor(?:y|ies)\?$/, '要變更 $1 個儲存庫的角色嗎？'],
  [/^(\d[\d,]*) members? selected(…|\.\.\.)$/, '已選取 $1 位成員$2'],
  [/^Change the role of (\d[\d,]*) members?\?$/, '要變更 $1 位成員的角色嗎？'],
  [/^Change (\d[\d,]*) [Rr]oles?$/, '變更 $1 個角色'],
  [new RegExp(`^(${ID_SOURCE})'s access settings$`), '$1 的存取設定'],
  [new RegExp(`^Removed access from repository (${ID_SOURCE})\\.$`), '已移除儲存庫 $1 的存取權。'],
  [new RegExp(`^Removed (${ID_SOURCE}) as a package collaborator\\.$`), '已將 $1 從套件協作者中移除。'],
  [
    new RegExp(`^Remove ${NOT_UI_NOUN}(${ID_SOURCE}) from (${ID_SOURCE})(\\??)$`),
    (_, item, target, question) => (question ? `要從 ${target} 中移除 ${item} 嗎？` : `從 ${target} 中移除 ${item}`),
  ],
]

/**
 * 软件包（GitHub Packages）：组织 / 用户 / 存储库的软件包列表、软件包详情（各注册表安装说明）、版本列表、单个版本、
 * 链接存储库、软件包设置（访问权限、可见性、删除）。
 * 页面类型 packages 覆盖 /orgs/<org>/packages…、/users/<user>/packages…、/<owner>/<repo>/pkgs…、/<owner>/<repo>/packages。
 * 空状态（Get started with GitHub Packages、Choose a registry、各注册表说明）已由 profile 词典的 static 收录。
 */
export default {
  static: {
    // 列表与存储库首页侧栏（“Clear current search query, filters, and sorts”由 security 词典收录）
    'Search packages…': '搜尋套件…',
    'Search packages...': '搜尋套件...',
    'browsing all packages': '瀏覽所有套件',
    'No packages published': '未發布任何套件',
    'Publish your first package': '發布你的第一個套件',
    // 原文用破折号补充说明容器，译文同用破折号，不改成括号
    'A software platform used for building applications based on containers — small and lightweight execution environments.':
      '以容器建置應用程式的軟體平台——容器是小巧輕量的執行環境。',

    // 软件包详情：安装说明
    'Install from the command line': '從命令列安裝',
    'Install from the command line:': '從命令列安裝：',
    'Install via package.json:': '透過 package.json 安裝：',
    'Install via Gemfile:': '透過 Gemfile 安裝：',
    'Install 1/2: Add this to pom.xml:': '安裝 1/2：將下列內容新增到 pom.xml：',
    'Install 2/2: Run via command line': '安裝 2/2：透過命令列執行',
    'Install 2/2: Run via command line:': '安裝 2/2：透過命令列執行：',
    'Learn more about packages': '瞭解套件',
    'Use as base image in Dockerfile:': '在 Dockerfile 中作為基底映像檔使用：',
    'Use as base image in DockerFile:': '在 Dockerfile 中作為基底映像檔使用：',

    // 软件包详情：版本与侧栏
    'About this package': '關於此套件',
    'Recent tagged image versions': '最近的已標記映像檔版本',
    'View all tagged versions': '查看所有已標記的版本',
    'View and manage all versions': '查看並管理所有版本',
    'View all versions': '查看所有版本',
    'Recent Versions': '最近的版本',
    'Version downloads': '版本下載次數',
    'Last published': '上次發布',
    'Total downloads': '總下載次數',
    'Downloads for the last 30 days': '過去 30 天的下載次數',
    'Package settings': '套件設定',
    'Add a Readme to the linked repository': '為已連結的儲存庫新增讀我檔案',
    "The linked repository's Readme will be shown here.": '已連結儲存庫的讀我檔案會顯示在這裡。',
    'The linked repository’s Readme will be shown here.': '已連結儲存庫的讀我檔案會顯示在這裡。',

    // 未链接存储库的软件包
    'Link this package to a repository': '將此套件連結到儲存庫',
    'By linking to a repository, you can automatically add a Readme, link discussions, and show contributors on this page.':
      '連結到儲存庫後，可以自動在此頁面新增讀我檔案、連結討論並顯示貢獻者。',
    'Connect Repository': '連接儲存庫',
    'Connect repository': '連接儲存庫',
    'Link to repository': '連結到儲存庫',
    'Select a repository to link to this package.': '選擇要連結到此套件的儲存庫。',

    // 单个版本
    'About this version': '關於此版本',
    'Container instructions': '容器使用說明',
    'OS / Arch': '作業系統/架構',
    'This package version was published': '此套件版本發布於',
    'To provide a description, add the following line to your Dockerfile:':
      '若要提供描述，請在 Dockerfile 中新增下列這行：',
    // For multi-arch images, set a value for the <code>…</code> key in the <code>…</code> field of the manifest:
    // 译文按片段读作：若是多架構映像檔，請為 <code> 鍵在資訊清單的 <code> 欄位中設定值：
    'For multi-arch images, set a value for the': '若是多架構映像檔，請為',
    'Learn more about labelling container images': '瞭解如何為容器映像檔加上標籤',
    'Download activity': '下載活動',
    'Download activity of this version': '此版本的下載活動',
    'Other tags on this version': '此版本的其他標記',
    'Delete version': '刪除版本',
    // This cannot be undone. This will permanently delete the version <strong> so users and processes won’t …
    // 原文片段之间没有逗号，译文用“並”衔接
    'This cannot be undone. This will permanently delete the version': '此動作無法復原。這將永久刪除版本',
    'so users and processes won’t be able to download this version.': '並讓使用者和處理程序無法再下載此版本。',
    "so users and processes won't be able to download this version.": '並讓使用者和處理程序無法再下載此版本。',
    'I understand the consequences, delete this version': '我瞭解後果，刪除此版本',

    // 软件包设置：存储库来源
    'Repository source': '儲存庫來源',
    // This is the repository … using the <code>repository</code> field.
    "This is the repository where the package's source code is stored. This is defined in the repository's package.json file using the":
      '這是存放套件原始碼的儲存庫。它由儲存庫 package.json 檔案中的',
    'A GitHub repository has been identified as the source for this package. This package will be displayed in this repositories package list.':
      '已識別出此套件的來源 GitHub 儲存庫。此套件將顯示在該儲存庫的套件清單中。',
    'You have referenced a non-GitHub source for this package that cannot be verified.':
      '你為此套件參照了無法驗證的非 GitHub 來源。',
    'Confirm you want to unlink this repository': '確認取消連結此儲存庫',
    'Yes, unlink this repository': '是，取消連結此儲存庫',

    // 软件包设置：Actions / Codespaces 访问权限（产品名译成中文：Actions → 動作，Codespaces → 程式碼空間）
    'Manage Actions access': '管理動作存取權',
    'Actions repository access': '動作儲存庫存取權',
    'Pick the repositories that can access this package using GitHub Actions.':
      '選擇可透過 GitHub 動作存取此套件的儲存庫。',
    // Pick the repositories that can access this package using <a>GitHub Actions</a>.
    'Pick the repositories that can access this package using': '選擇可透過下列方式存取此套件的儲存庫',
    'Select repository that can access this package using GitHub actions': '選擇可透過 GitHub 動作存取此套件的儲存庫',
    'Manage Codespaces access': '管理程式碼空間存取權',
    'Codespaces repository access': '程式碼空間儲存庫存取權',
    'Pick the repositories that can read this package using GitHub Codespaces.':
      '選擇可透過 GitHub 程式碼空間讀取此套件的儲存庫。',
    'Pick the repositories that can read this package using': '選擇可透過下列方式讀取此套件的儲存庫',
    'Select repository that can access this package using GitHub codespaces':
      '選擇可透過 GitHub 程式碼空間存取此套件的儲存庫',
    'Permissions added for selected repositories.': '已為選取的儲存庫新增權限。',
    'Permissions updated for selected repositories.': '已為選取的儲存庫更新權限。',
    'Confirm you want to remove this repository': '確認移除此儲存庫',
    // 访问权限列表中移除存储库的按钮（aria-label）
    'remove access to repository from this package': '移除儲存庫對此套件的存取權',

    // 软件包设置：角色说明（原文分句，译文同样分句）
    'Can download this package and read package metadata.': '可下載此套件並讀取套件中繼資料。',
    'Can upload and download this package. Can read and write package metadata.':
      '可上傳和下載此套件。可讀寫套件中繼資料。',
    'Can upload, download, and manage this package. Can read and write package metadata. Can delete and restore packages.':
      '可上傳、下載並管理此套件。可讀寫套件中繼資料。可刪除和還原套件。',
    'Can upload, download, and manage this package. Can read and write package metadata. Can grant package permissions.':
      '可上傳、下載並管理此套件。可讀寫套件中繼資料。可授予套件權限。',
    'Recommended for non-code contributors who want to view or discuss your package.':
      '適合想查看或討論套件的非程式碼貢獻者。',
    'Recommended for contributors who actively push to your package.': '適合積極推送到套件的貢獻者。',
    'Recommended for people who need full access to the package, including sensitive and destructive actions like managing security and package visibility.':
      '適合需要套件完整存取權的人員，包括管理安全性和套件可見度等敏感且具破壞性的動作。',

    // 软件包设置：继承的访问权限
    'Inherited access': '繼承的存取權',
    'Inherit access from source repository (recommended)': '從來源儲存庫繼承存取權（建議）',
    'Inherit access from repository (recommended)': '從儲存庫繼承存取權（建議）',
    // Go to <a>owner/repo</a> to change access, or remove inherited access …
    'to change access, or remove inherited access to manage it separately. Inherited access is recommended.':
      '變更存取權，或移除繼承的存取權以個別管理。建議使用繼承的存取權。',

    // 软件包设置：危险区域
    'Change package visibility': '變更套件可見度',
    'This package is currently public.': '此套件目前為公開套件。',
    'This package is currently private.': '此套件目前為私人套件。',
    'This package is currently internal.': '此套件目前為內部套件。',
    'Make this package visible to anyone.': '讓任何人都能看到此套件。',
    'Make this package visible privately, to organization members that have access.':
      '將此套件設為私人，僅向有存取權的組織成員顯示。',
    'I understand the consequences, change package visibility': '我瞭解後果，變更套件可見度',
    'I understand the consequences, change package visibility.': '我瞭解後果，變更套件可見度。',
    'Delete this package': '刪除此套件',
    'Once you delete a package, there is no going back. Please be certain.': '刪除套件後，將無法復原。請務必確定。',
    'Once this package is deleted, it will no longer be accessible.': '此套件刪除後，將無法再存取。',
    // This action will delete package <strong>name</strong>. Versions of this package …
    'This action will delete package': '此動作將刪除套件',
    '. Versions of this package will no longer be accessible, and it will not appear in searches or package listings.':
      '。此套件的所有版本將無法再存取，也不會出現在搜尋結果或套件清單中。',
    'I understand the consequences, delete this package': '我瞭解後果，刪除此套件',
    // 存储库范围的软件包（继承存储库权限）
    'I understand, delete this package.': '我瞭解，刪除此套件。',
    'I understand, delete this package': '我瞭解，刪除此套件',
    'I understand the consequences, restore this package': '我瞭解後果，還原此套件',
    'I understand the consequences, restore this version.': '我瞭解後果，還原此版本。',
    'I understand the consequences, restore this version': '我瞭解後果，還原此版本',
  },
  scoped: {
    // 侧栏与筛选（组织软件包页侧栏：Packages 标题下的 GitHub Packages、Linked artifacts）
    Packages: '套件',
    'GitHub Packages': 'GitHub 套件',
    'Linked artifacts': '已連結的成品',
    'Type:': '類型：',
    'Select type': '選擇類型',
    'Close type options': '關閉類型選項',
    'Visibility:': '可見度：',
    'Select visibility': '選擇可見度',
    'Close visibility options': '關閉可見度選項',
    'Select sort view': '選擇排序方式',
    'Close sort options': '關閉排序選項',
    'Most downloads': '最多下載次數',
    'Least downloads': '最少下載次數',
    Container: '容器',
    Containers: '容器',
    // 搜索无结果：Try <a>browsing all packages</a> to find what you're looking for.（原文无逗号，译文不加）
    'No results matched your search.': '沒有相符的結果。',
    Try: '嘗試',
    "to find what you're looking for.": '來尋找你要的內容。',
    'to find what you’re looking for.': '來尋找你要的內容。',

    // 列表项：Published <时间> by <所有者> in <存储库>（标签式译法，避免片段间的标点）
    Published: '發布於',
    by: '發布者',
    in: '儲存庫',

    // 软件包详情
    Latest: '最新',
    'Latest version': '最新版本',
    'Label: Latest': '標籤：最新',
    'Label: Latest version': '標籤：最新版本',
    'Label: Visibility': '標籤：可見度',
    'Recent versions': '最近的版本',
    // 侧栏中指向链接的存储库自述文件的链接
    Readme: '讀我檔案',
    // 侧栏星号计数链接：<strong>12</strong> stars → 12 顆星
    star: '顆星',
    stars: '顆星',
    Other: '其他',
    Contributors: '貢獻者',
    'Open an issue': '建立議題',
    'Start a discussion': '發起討論',
    Versions: '版本',
    'All versions': '所有版本',
    'Package versions': '套件版本',
    // 版本列表右上角的视图切换（Tagged / Untagged、Active / Deleted）
    'Select versions view': '選擇版本檢視',
    // GitHub Enterprise Server 的软件包设置侧栏
    'Manage versions': '管理版本',
    'Actions access': '動作存取權',
    Tagged: '已標記',
    Untagged: '未標記',
    Active: '作用中',
    Deleted: '已刪除',
    Digest: '摘要',
    Manifest: '資訊清單',

    // 单个版本
    Installation: '安裝',
    'No description provided': '未提供描述',
    'key in the': '鍵在資訊清單的',
    'field of the manifest:': '欄位中設定值：',
    'Last 30 days': '過去 30 天',
    'Last week': '過去一週',

    // 软件包设置
    'Danger Zone': '危險區域',
    'Danger zone': '危險區域',
    'Change visibility': '變更可見度',
    'Manage access': '管理存取權',
    'Add Repository': '新增儲存庫',
    'Add repository': '新增儲存庫',
    'Add repositories': '新增儲存庫',
    'Invite teams or people': '邀請團隊或人員',
    // Invite teams or people to <strong>name</strong>
    'Invite teams or people to': '邀請團隊或人員存取',
    'Search by username, full name, or email': '依使用者名稱、全名或電子郵件搜尋',
    'Confirm you want to remove this user': '確認移除此使用者',
    'Role:': '角色：',
    'Choose role': '選擇角色',
    'Change role': '變更角色',
    'Select a new role': '選擇新角色',
    Read: '讀取',
    Write: '寫入',
    'Go to': '前往',
    'field.': '欄位定義。',
    // Once removed, <strong>repo</strong> will no longer have access to the <strong>name</strong> package.
    'Once removed,': '移除後，',
    'will no longer have access to the': '將無法再存取',
    'package.': '套件。',
    // Please type <strong>name</strong> to confirm:
    'Please type': '請輸入',
    'to confirm:': '以確認：',
    'to confirm.': '以確認。',
    'Are you absolutely sure?': '你確定嗎？',
  },
  regexp,
  ignore: [
    // 版本标记（如 latest、dev、2026.1.0）
    'a.Label',
    // 列表中的软件包名、所有者名与存储库名
    '#package-results .Box-row a.f4',
    '#package-results .Box-row .f6 a',
    // 软件包描述
    '.flex-md-row.mt-n1 > .col-12 > p',
    // 详情与版本页标题中的软件包名、版本标记
    'h1 > span.overflow-hidden.lh-condensed',
    // 面包屑：软件包名、当前版本的标记
    '.breadcrumb-item:first-child > a',
    '.breadcrumb-item-selected > a[href*="?tag="]',
    // 侧栏 Details：所有者、链接的存储库（星标数链接是界面文字）
    '.col-md-3 h4 + ul.list-style-none a.Link--primary',
    '.col-md-3 h4 + ul.list-style-none a.Link--muted:not([href$="/stargazers"])',
  ],
} satisfies PageDictionary
