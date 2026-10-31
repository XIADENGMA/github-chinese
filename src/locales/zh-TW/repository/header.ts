import type { PageDictionary, RegExpRule } from '../../../core/types'
import { DATE_SOURCE, joinCjk, translateTime } from '../helpers'

/** 存储库全名 owner/repo：登录名与存储库名都不含空格 */
const REPO = '([\\w.-]+/[\\w.-]+)'
const COUNT = '(\\d[\\d,]*)'

/** 关注按钮文字 */
const WATCH_BUTTON: Readonly<Record<string, string>> = {
  Watch: '關注',
  Unwatch: '取消關注',
}

/** 关注按钮无障碍名称中的当前订阅方式（Participating 是屏幕阅读器用的简称） */
const WATCH_SELECTION: Readonly<Record<string, string>> = {
  Participating: '參與',
  'All Activity': '所有活動',
  Ignore: '忽略',
  Custom: '自訂',
}

/** 自定义订阅对话框中的事件类型 */
const THREAD_TYPES: Readonly<Record<string, string>> = {
  Issues: '議題',
  'Pull requests': '拉取請求',
  Releases: '發行版本',
  Discussions: '討論',
  'Security alerts': '安全性警示',
}

/** 无法复刻的原因：Cannot fork because <owner/repo> …（复刻按钮的无障碍名称；原文无标点，译文不加） */
const FORK_BLOCKERS: Readonly<Record<string, (repo: string) => string>> = {
  'has forking disabled': (repo) => `因 ${repo} 已停用分叉而無法分叉`,
  'is locked': (repo) => `無法分叉已鎖定的 ${repo}`,
  'is disabled': (repo) => `無法分叉已停用的 ${repo}`,
  'is unavailable due to a DMCA takedown': (repo) => `無法分叉已遭 DMCA 下架的 ${repo}`,
  'is currently unavailable': (repo) => `無法分叉目前無法使用的 ${repo}`,
  'is empty': (repo) => `無法分叉空儲存庫 ${repo}`,
}

/** 存储库类型说明：Public archive repository · Forked from */
const VISIBILITY: Readonly<Record<string, string>> = {
  Public: '公開',
  Private: '私人',
  Internal: '內部',
}

const REPO_KINDS: Readonly<Record<string, string>> = {
  archive: '封存',
  template: '範本',
  mirror: '鏡像',
}

const ORIGINS: Readonly<Record<string, string>> = {
  Forked: '分叉自',
  Generated: '產生自',
  Mirrored: '鏡像自',
}

const regexp: readonly RegExpRule[] = [
  // 存档横幅（原文是两句，译文同样两句，不并成一句；原文有 repository、repo 两种写法）
  [
    new RegExp(`^This (?:repository|repo) was archived by the owner on (${DATE_SOURCE})\\. It is now read-only\\.$`),
    (_, date: string) => joinCjk(joinCjk('此儲存庫已由擁有者於', translateTime(date)), '封存。目前為唯讀。'),
  ],
  // 关注按钮的无障碍名称
  [
    new RegExp(
      `^(Watch|Unwatch): (Participating|All Activity|Ignore|Custom) in ${REPO}\\. ${COUNT} users? (?:is|are) watching this repository\\. Click to change subscription settings\\.$`,
    ),
    (_, button: string, selection: string, repo: string, count: string) =>
      `${WATCH_BUTTON[button] ?? button}：${repo}（${WATCH_SELECTION[selection] ?? selection}）。${count} 位使用者正在關注此儲存庫。按一下可變更訂閱設定。`,
  ],
  [
    new RegExp(
      `^Stop ignoring in ${REPO}\\. ${COUNT} users? (?:is|are) watching this repository\\. Click to change subscription settings\\.$`,
    ),
    // 原文 Stop ignoring 后没有冒号，译文不加
    '停止忽略 $1。$2 位使用者正在關注此儲存庫。按一下可變更訂閱設定。',
  ],
  // 自定义订阅对话框
  [new RegExp(`^Subscribe to events for ${REPO}$`), '訂閱 $1 的事件'],
  [
    /^(Issues|Pull requests|Releases|Discussions|Security alerts) are not enabled for this repository$/,
    (_, thread: string) => `此儲存庫未啟用${THREAD_TYPES[thread] ?? thread}`,
  ],
  // 复刻按钮：不可复刻的原因与无障碍名称
  [
    new RegExp(
      `^Cannot fork because ${REPO} (has forking disabled|is locked|is disabled|is unavailable due to a DMCA takedown|is currently unavailable|is empty)$`,
    ),
    (_, repo: string, reason: string) => FORK_BLOCKERS[reason]?.(repo) ?? `無法分叉 ${repo}`,
  ],
  [new RegExp(`^You own ${REPO} and are not a member of any organizations$`), '你擁有 $1 且未加入任何組織'],
  [new RegExp(`^Cannot fork ${REPO}$`), '無法分叉 $1'],
  [new RegExp(`^Fork your own copy of ${REPO}$`), '建立 $1 的分叉'],
  // 星标按钮的无障碍名称
  [new RegExp(`^Star ${REPO}$`), '為 $1 加星號'],
  [new RegExp(`^Unstar ${REPO}$`), '移除 $1 的星號'],
  [new RegExp(`^You can['’]t star ${REPO}$`), '無法為 $1 加星號'],
  // 取消星标确认：存储库已在星标列表中
  [
    new RegExp(`^This will remove ${REPO} from the ${COUNT} lists? that it['’]s been added to\\.$`),
    '這會將 $1 從其所在的 $2 個清單中移除。',
  ],
  // 固定按钮
  [new RegExp(`^Pin ${REPO} to your profile$`), '將 $1 釘選到你的個人檔案'],
  [new RegExp(`^Unpin ${REPO} from your profile$`), '從你的個人檔案取消釘選 $1'],
  [
    /^Failed to (pin|unpin) repository$/,
    (_, action: string) => (action === 'pin' ? '無法釘選儲存庫' : '無法取消釘選儲存庫'),
  ],
  // 赞助按钮的无障碍名称与赞助对话框标题
  [
    new RegExp(`^(Sponsor|Sponsoring) ${REPO}$`),
    (_, state: string, repo: string) => `${state === 'Sponsor' ? '贊助' : '正在贊助'} ${repo}`,
  ],
  // 固定按钮的无障碍名称（自己的存储库）
  [
    new RegExp(`^(Pin|Unpin) ${REPO}$`),
    (_, action: string, repo: string) => `${action === 'Pin' ? '釘選' : '取消釘選'} ${repo}`,
  ],
  // 存储库类型说明：Public repository · Forked from、Public archive repository
  [
    /^(Public|Private|Internal)(?: (archive|template|mirror))? repository(?: · (Forked|Generated|Mirrored) from)?$/,
    (_, visibility: string, kind: string, origin: string) =>
      `${VISIBILITY[visibility] ?? visibility}${kind ? (REPO_KINDS[kind] ?? kind) : ''}儲存庫${origin ? ` · ${ORIGINS[origin] ?? origin}` : ''}`,
  ],
  // 自定义订阅对话框：已选标签摘要（标签名是用户内容，原样保留；省略号随原文）bug, docs... +3 more
  [
    /^([^+]{1,40}?)(\.\.\.)? \+(\d+) more$/,
    (_, labels: string, dots: string | undefined, count: string) => `${labels}${dots ?? ''} 和其他 ${count} 個`,
  ],
  // 旧版页头（窄屏）：上下文按钮的无障碍名称 Page context: <所有者> / <存储库>（名称原样保留）
  [/^Page context: ([\w.-]+) \/ ([\w.-]+)$/, '頁面上下文：$1 / $2'],
]

/**
 * 存储库头部（仅存储库首页）：标题区的可见性标签与来源、存档横幅、演示存储库提示，
 * 以及固定、关注、复刻、星标与星标列表、赞助、模板按钮和它们的菜单与对话框。
 * 存储库名、复刻名、列表名、赞助者名属于用户内容，不收录；
 * 全局页头面包屑中的所有者名、存储库名（所有存储库页）由 ignore 排除，旧版页头窄屏上下文按钮的无障碍名称由 regexp 翻译。
 */
export default {
  static: {
    // 旧版存储库标签导航的溢出菜单
    'Additional navigation options': '更多導覽選項',
    // 旧版页头（窄屏）：上下文对话框标题，其下是所有者、存储库链接（名称由 ignore 排除）
    'Navigate back to': '返回至',
    // 标题区：可见性标签（Public / Private / Internal 由通用词典收录，Public archive、Private archive 由 profile 收录）
    'Public template': '公開範本',
    'Private template': '私人範本',
    'Internal template': '內部範本',
    'Internal archive': '內部封存',
    'Public mirror': '公開鏡像',
    'Private mirror': '私人鏡像',
    'Internal mirror': '內部鏡像',
    // 标题区：来源（后接存储库链接）
    'forked from': '分叉自',
    'mirrored from': '鏡像自',
    'generated from': '產生自',
    'Parent repository:': '父儲存庫：',
    // 安全公告临时复刻：此儲存庫是 <公告链接> 安全性公告的臨時私人分叉。
    'This repository is a temporary private fork for the': '此儲存庫是',
    // 演示存储库提示
    'Demo notification': '示範通知',
    'Welcome to your demo repository': '歡迎使用你的示範儲存庫',
    "To help you get started, we've created a code repository in your organization, named":
      '為了協助你開始使用，我們已在你的組織中建立一個程式碼儲存庫，名為',
    'To help you get started, we’ve created a code repository in your organization, named':
      '為了協助你開始使用，我們已在你的組織中建立一個程式碼儲存庫，名為',
    ". You can use it to sample some of GitHub's most valuable tools.": '。你可以用它體驗 GitHub 最有價值的一些工具。',
    '. You can use it to sample some of GitHub’s most valuable tools.': '。你可以用它體驗 GitHub 最有價值的一些工具。',
    // 存档横幅（旧版，不带日期；原文是两句，译文同样两句）
    'This repository has been archived by the owner. It is now read-only.': '此儲存庫已由擁有者封存。目前為唯讀。',

    // 关注菜单
    'You must be signed in to change notification settings': '必須登入才能變更通知設定',
    'Participating and @mentions': '參與和 @提及',
    'Only receive notifications from this repository when participating or @mentioned.':
      '只在參與或被 @提及時接收此儲存庫的通知。',
    'All Activity': '所有活動',
    'Notified of all notifications on this repository.': '接收此儲存庫的所有通知。',
    'Never be notified.': '不接收任何通知。',
    'Select events you want to be notified of in addition to participating and @mentions.':
      '選擇在參與和 @提及之外還要接收通知的事件。',
    'Get push notifications on': '推播通知支援',
    'Security alerts': '安全性警示',
    'Select Labels': '選取標籤',
    'Error. Please try again.': '發生錯誤。請再試一次。',
    'You are unable to watch this repository': '你無法關注此儲存庫',
    'This action is not available for this repository.': '此動作不適用於此儲存庫。',
    'You have reached the limit of 10,000 watched repositories. Update your':
      '你關注的儲存庫已達 10,000 個上限。請更新你的',
    'watch settings': '關注設定',
    // 旧版关注按钮加载失败
    "Couldn't load subscription status.": '無法載入訂閱狀態。',
    'Couldn’t load subscription status.': '無法載入訂閱狀態。',

    // 复刻按钮与菜单
    'You must be signed in to fork a repository': '必須登入才能分叉儲存庫',
    'Cannot fork because repository is offline': '無法分叉離線的儲存庫',
    'Cannot fork because the repository is outside of your enterprise': '無法分叉你企業以外的儲存庫',
    'Cannot fork because repository is empty.': '無法分叉空儲存庫。',
    'Cannot fork because repository is locked.': '無法分叉已鎖定的儲存庫。',
    'Cannot fork because you own this repository and are not a member of any organizations.':
      '因你擁有此儲存庫且未加入任何組織而無法分叉。',
    'See your forks of this repository': '查看你對此儲存庫建立的分叉',
    'Existing forks': '現有分叉',
    'No existing forks': '尚無分叉',
    "You don't have any forks of this repository.": '你沒有此儲存庫的分叉。',
    'You don’t have any forks of this repository.': '你沒有此儲存庫的分叉。',
    'Forks could not be loaded': '無法載入分叉',
    'Failed to load forks': '分叉載入失敗',

    // 星标按钮与星标列表
    'Star this repository': '為此儲存庫加星號',
    'Unstar this repository': '移除此儲存庫的星號',
    "You can't star this repository": '無法為此儲存庫加星號',
    'You can’t star this repository': '無法為此儲存庫加星號',
    'You cannot star repositories outside of your enterprise': '無法為你企業以外的儲存庫加星號',
    'Star lists': '星號清單',
    'Unstar this repository?': '要移除此儲存庫的星號嗎？',
    'You must be signed in to add this repository to a list': '必須登入才能將此儲存庫加入清單',
    'Add this repository to one or more lists': '將此儲存庫加入一個或多個清單',
    'Add this repository to a list': '將此儲存庫加入清單',
    'Filter lists': '篩選清單',
    'No lists yet': '尚無清單',
    'Create a list to organize your starred repositories.': '建立清單來整理已加星號的儲存庫。',
    'No matching lists': '沒有相符的清單',
    'Lists could not be loaded': '無法載入清單',
    'Failed to load lists': '清單載入失敗',
    'Failed to update lists': '無法更新清單',
    'Failed to create list': '無法建立清單',
    '⭐️ Name this list': '⭐️ 為此清單命名',
    'Enabling this makes the list visible only to you.': '啟用後只有你能看到此清單。',

    // 固定按钮与组织固定菜单
    'Pin this repository to your profile': '將此儲存庫釘選到你的個人檔案',
    'Pin or unpin this repository on organization profiles and your profile':
      '在組織資料和你的個人檔案中釘選或取消釘選此儲存庫',
    'Pin or unpin this repository on organization profiles': '在組織資料中釘選或取消釘選此儲存庫',
    'Pin or unpin this repository on your profile': '在你的個人檔案中釘選或取消釘選此儲存庫',
    'Edit Pins': '編輯釘選項目',
    'Pin to…': '釘選到…',
    'Pin repository locations': '儲存庫釘選位置',
    'Visible to anyone': '所有人可見',
    'Public pins in this organization': '此組織的公開釘選項目',
    'Visible to members only': '僅成員可見',
    'Private pins in this organization': '此組織的不公開釘選項目',
    'Pin this to your personal profile, visible to everyone': '釘選到你的個人檔案，所有人可見',
    'No pin slots remaining in your profile': '個人檔案的釘選位置已滿',
    'Failed to update organization pin': '無法更新組織釘選項目',
    'Unable to pin repository. Please try again.': '無法釘選儲存庫。請再試一次。',

    // 模板按钮
    'Open in a codespace': '在程式碼空間中開啟',
    'Unable to create template. Please try again.': '無法建立範本。請再試一次。',

    // 赞助对话框
    'Learn more about GitHub Sponsors': '瞭解 GitHub 贊助',
  },
  scoped: {
    // Watch、Fork、Star、Pin 等按钮文字与 More、Lists、Name、Description、Create 等通用词由 common-ui 收录
    // 安全公告临时复刻（句尾片段）
    'security advisory.': '安全性公告的臨時私人分叉。',
    // 关注按钮与菜单
    Participating: '參與',
    Ignore: '忽略',
    Ignoring: '已忽略',
    Custom: '自訂',
    Releases: '發行版本',
    'Labels:': '標籤：',
    'Failed to update': '無法更新',
    // 关注上限提示句尾：請更新你的 <關注設定> 以繼續。（整句由 inline 处理，此为未拼成整句时的片段）
    'to continue.': '以繼續。',
    // 星标列表菜单
    'Try again later.': '請稍後再試。',
    'Try a different search term.': '嘗試其他搜尋字詞。',
  },
  regexp,
  // 关注数量达到上限的对话框（NotificationsSubscriptionsMenu，React 把 {' '} 渲染成单独的文本节点）：
  // 請更新你的 <關注設定> 以繼續。整句命中后链接两侧不留空白，链接文字照常翻译
  inline: [
    [
      'You have reached the limit of 10,000 watched repositories. Update your {} to continue.',
      '你關注的儲存庫已達 10,000 個上限。請更新你的{}以繼續。',
    ],
  ],
  ignore: [
    // 页头面包屑：所有者名、存储库名（新版 React 页头；登录后的切换存储库按钮也带 contextCrumb__ 类，不用类名匹配）
    'header.GlobalNav [data-component="Breadcrumbs.Item"]',
    // 页头面包屑：所有者名、存储库名（旧版页头：完整导航、窄屏折叠按钮与其返回菜单）
    '.AppHeader-context-item-label',
    '.AppHeader-context-compact-parentItem',
    '.AppHeader-context-compact-mainItem',
    // 旧版页头（自适应）：名称截断时的提示、放不下时收进溢出菜单的项
    'tool-tip[data-target="context-region-crumb.tooltip"]',
    '[data-targets~="context-region.overflowCrumbs"] .ActionListItem-label',
  ],
} satisfies PageDictionary
