import type { PageDictionary, RegExpRule } from '../../../core/types'
import { DATE_SOURCE, joinCjk, translateTime } from '../helpers'

/** 存储库全名 owner/repo：登录名与存储库名都不含空格 */
const REPO = '([\\w.-]+/[\\w.-]+)'
const COUNT = '(\\d[\\d,]*)'

/** 关注按钮文字 */
const WATCH_BUTTON: Readonly<Record<string, string>> = {
  Watch: '关注',
  Unwatch: '取消关注',
}

/** 关注按钮无障碍名称中的当前订阅方式（Participating 是屏幕阅读器用的简称） */
const WATCH_SELECTION: Readonly<Record<string, string>> = {
  Participating: '参与',
  'All Activity': '所有活动',
  Ignore: '忽略',
  Custom: '自定义',
}

/** 自定义订阅对话框中的事件类型 */
const THREAD_TYPES: Readonly<Record<string, string>> = {
  Issues: '议题',
  'Pull requests': '拉取请求',
  Releases: '发行版',
  Discussions: '讨论',
  'Security alerts': '安全警报',
}

/** 无法复刻的原因：Cannot fork because <owner/repo> …（复刻按钮的无障碍名称；原文无标点，译文不加） */
const FORK_BLOCKERS: Readonly<Record<string, (repo: string) => string>> = {
  'has forking disabled': (repo) => `${repo} 已禁用复刻`,
  'is locked': (repo) => `无法复刻已锁定的 ${repo}`,
  'is disabled': (repo) => `无法复刻已被禁用的 ${repo}`,
  'is unavailable due to a DMCA takedown': (repo) => `无法复刻已被 DMCA 下架的 ${repo}`,
  'is currently unavailable': (repo) => `无法复刻当前不可用的 ${repo}`,
  'is empty': (repo) => `无法复刻空存储库 ${repo}`,
}

/** 存储库类型说明：Public archive repository · Forked from */
const VISIBILITY: Readonly<Record<string, string>> = {
  Public: '公共',
  Private: '专用',
  Internal: '内部',
}

const REPO_KINDS: Readonly<Record<string, string>> = {
  archive: '存档',
  template: '模板',
  mirror: '镜像',
}

const ORIGINS: Readonly<Record<string, string>> = {
  Forked: '复刻自',
  Generated: '生成自',
  Mirrored: '镜像自',
}

const regexp: readonly RegExpRule[] = [
  // 存档横幅（原文是两句，译文同样两句，不并成一句）
  [
    new RegExp(`^This repository was archived by the owner on (${DATE_SOURCE})\\. It is now read-only\\.$`),
    (_, date: string) => joinCjk(joinCjk('此存储库已由所有者于', translateTime(date)), '存档。现为只读。'),
  ],
  // 关注按钮的无障碍名称
  [
    new RegExp(
      `^(Watch|Unwatch): (Participating|All Activity|Ignore|Custom) in ${REPO}\\. ${COUNT} users? (?:is|are) watching this repository\\. Click to change subscription settings\\.$`,
    ),
    (_, button: string, selection: string, repo: string, count: string) =>
      `${WATCH_BUTTON[button] ?? button}：${repo}（${WATCH_SELECTION[selection] ?? selection}）。${count} 个用户正在关注此存储库。单击可更改订阅设置。`,
  ],
  [
    new RegExp(
      `^Stop ignoring in ${REPO}\\. ${COUNT} users? (?:is|are) watching this repository\\. Click to change subscription settings\\.$`,
    ),
    // 原文 Stop ignoring 后没有冒号，译文不加
    '停止忽略 $1。$2 个用户正在关注此存储库。单击可更改订阅设置。',
  ],
  // 自定义订阅对话框
  [new RegExp(`^Subscribe to events for ${REPO}$`), '订阅 $1 的事件'],
  [
    /^(Issues|Pull requests|Releases|Discussions|Security alerts) are not enabled for this repository$/,
    (_, thread: string) => `此存储库未启用${THREAD_TYPES[thread] ?? thread}`,
  ],
  // 复刻按钮：不可复刻的原因与无障碍名称
  [
    new RegExp(
      `^Cannot fork because ${REPO} (has forking disabled|is locked|is disabled|is unavailable due to a DMCA takedown|is currently unavailable|is empty)$`,
    ),
    (_, repo: string, reason: string) => FORK_BLOCKERS[reason]?.(repo) ?? `无法复刻 ${repo}`,
  ],
  [new RegExp(`^You own ${REPO} and are not a member of any organizations$`), '你拥有 $1 且未加入任何组织'],
  [new RegExp(`^Cannot fork ${REPO}$`), '无法复刻 $1'],
  [new RegExp(`^Fork your own copy of ${REPO}$`), '创建 $1 的复刻'],
  // 星标按钮的无障碍名称
  [new RegExp(`^Star ${REPO}$`), '为 $1 加星标'],
  [new RegExp(`^Unstar ${REPO}$`), '取消 $1 的星标'],
  [new RegExp(`^You can['’]t star ${REPO}$`), '无法为 $1 加星标'],
  // 取消星标确认：存储库已在星标列表中
  [
    new RegExp(`^This will remove ${REPO} from the ${COUNT} lists? that it['’]s been added to\\.$`),
    '此操作会将 $1 从其所在的 $2 个列表中删除。',
  ],
  // 置顶按钮
  [new RegExp(`^Pin ${REPO} to your profile$`), '在个人资料中置顶 $1'],
  [new RegExp(`^Unpin ${REPO} from your profile$`), '在个人资料中取消置顶 $1'],
  [
    /^Failed to (pin|unpin) repository$/,
    (_, action: string) => (action === 'pin' ? '置顶存储库失败' : '取消置顶存储库失败'),
  ],
  // 赞助按钮的无障碍名称与赞助对话框标题
  [
    new RegExp(`^(Sponsor|Sponsoring) ${REPO}$`),
    (_, state: string, repo: string) => `${state === 'Sponsor' ? '赞助' : '正在赞助'} ${repo}`,
  ],
  // 置顶按钮的无障碍名称（自己的存储库）
  [
    new RegExp(`^(Pin|Unpin) ${REPO}$`),
    (_, action: string, repo: string) => `${action === 'Pin' ? '置顶' : '取消置顶'} ${repo}`,
  ],
  // 存储库类型说明：Public repository · Forked from、Public archive repository
  [
    /^(Public|Private|Internal)(?: (archive|template|mirror))? repository(?: · (Forked|Generated|Mirrored) from)?$/,
    (_, visibility: string, kind: string, origin: string) =>
      `${VISIBILITY[visibility] ?? visibility}${kind ? (REPO_KINDS[kind] ?? kind) : ''}存储库${origin ? ` · ${ORIGINS[origin] ?? origin}` : ''}`,
  ],
  // 自定义订阅对话框：已选标签摘要（标签名是用户内容，原样保留；省略号随原文）bug, docs... +3 more
  [
    /^([^+]{1,40}?)(\.\.\.)? \+(\d+) more$/,
    (_, labels: string, dots: string | undefined, count: string) => `${labels}${dots ?? ''} 及另外 ${count} 个`,
  ],
  // 旧版页头（窄屏）：上下文按钮的无障碍名称 Page context: <所有者> / <存储库>（名称原样保留）
  [/^Page context: ([\w.-]+) \/ ([\w.-]+)$/, '页面上下文：$1 / $2'],
]

/**
 * 存储库头部（仅存储库首页）：标题区的可见性标签与来源、存档横幅、演示存储库提示，
 * 以及置顶、关注、复刻、星标与星标列表、赞助、模板按钮和它们的菜单与对话框。
 * 存储库名、复刻名、列表名、赞助者名属于用户内容，不收录；
 * 全局页头面包屑中的所有者名、存储库名（所有存储库页）由 ignore 排除，旧版页头窄屏上下文按钮的无障碍名称由 regexp 翻译。
 */
export default {
  static: {
    // 旧版存储库标签导航的溢出菜单
    'Additional navigation options': '更多导航选项',
    // 旧版页头（窄屏）：上下文对话框标题，其下是所有者、存储库链接（名称由 ignore 排除）
    'Navigate back to': '返回到',
    // 标题区：可见性标签（Public / Private / Internal 由通用词典收录，Public archive、Private archive 由 profile 收录）
    'Public template': '公共模板',
    'Private template': '专用模板',
    'Internal template': '内部模板',
    'Internal archive': '内部存档',
    'Public mirror': '公共镜像',
    'Private mirror': '专用镜像',
    'Internal mirror': '内部镜像',
    // 标题区：来源（后接存储库链接）
    'forked from': '复刻自',
    'mirrored from': '镜像自',
    'generated from': '生成自',
    'Parent repository:': '父存储库：',
    // 安全公告临时复刻：此存储库是 <公告链接> 安全公告的临时专用复刻
    'This repository is a temporary private fork for the': '此存储库是',
    // 演示存储库提示
    'Demo notification': '演示通知',
    'Welcome to your demo repository': '欢迎使用你的演示存储库',
    "To help you get started, we've created a code repository in your organization, named":
      '为帮助你上手，我们在你的组织中创建了一个代码存储库，名为',
    'To help you get started, we’ve created a code repository in your organization, named':
      '为帮助你上手，我们在你的组织中创建了一个代码存储库，名为',
    ". You can use it to sample some of GitHub's most valuable tools.": '。你可以用它体验 GitHub 最有价值的一些工具。',
    '. You can use it to sample some of GitHub’s most valuable tools.': '。你可以用它体验 GitHub 最有价值的一些工具。',
    // 存档横幅（旧版，不带日期；原文是两句，译文同样两句）
    'This repository has been archived by the owner. It is now read-only.': '此存储库已由所有者存档。现为只读。',

    // 关注菜单
    'You must be signed in to change notification settings': '登录后才能更改通知设置',
    'Participating and @mentions': '参与和 @提及',
    'Only receive notifications from this repository when participating or @mentioned.':
      '仅在参与或被 @提及时接收此存储库的通知。',
    'All Activity': '所有活动',
    'Notified of all notifications on this repository.': '接收此存储库的所有通知。',
    'Never be notified.': '从不接收通知。',
    'Select events you want to be notified of in addition to participating and @mentions.':
      '选择除参与和 @提及外还要接收通知的事件。',
    'Get push notifications on': '推送通知支持',
    'Security alerts': '安全警报',
    'Select Labels': '选择标签',
    'Error. Please try again.': '出错了。请重试。',
    'You are unable to watch this repository': '你无法关注此存储库',
    'This action is not available for this repository.': '此操作对此存储库不可用。',
    'You have reached the limit of 10,000 watched repositories. Update your':
      '你关注的存储库数量已达 10,000 个上限。请更新你的',
    'watch settings': '关注设置',
    // 旧版关注按钮加载失败
    "Couldn't load subscription status.": '无法加载订阅状态。',
    'Couldn’t load subscription status.': '无法加载订阅状态。',

    // 复刻按钮与菜单
    'You must be signed in to fork a repository': '登录后才能复刻存储库',
    'Cannot fork because repository is offline': '无法复刻离线存储库',
    'Cannot fork because the repository is outside of your enterprise': '无法复刻企业外的存储库',
    'Cannot fork because repository is empty.': '无法复刻空存储库。',
    'Cannot fork because repository is locked.': '无法复刻已锁定的存储库。',
    'Cannot fork because you own this repository and are not a member of any organizations.':
      '因你拥有此存储库且未加入任何组织而无法复刻。',
    'See your forks of this repository': '查看你对此存储库的复刻',
    'Existing forks': '现有复刻',
    'No existing forks': '暂无复刻',
    "You don't have any forks of this repository.": '你没有此存储库的复刻。',
    'You don’t have any forks of this repository.': '你没有此存储库的复刻。',
    'Forks could not be loaded': '无法加载复刻',
    'Failed to load forks': '加载复刻失败',

    // 星标按钮与星标列表
    'Star this repository': '为此存储库加星标',
    'Unstar this repository': '取消此存储库的星标',
    "You can't star this repository": '无法为此存储库加星标',
    'You can’t star this repository': '无法为此存储库加星标',
    'You cannot star repositories outside of your enterprise': '无法为企业外的存储库加星标',
    'Star lists': '星标列表',
    'Unstar this repository?': '取消此存储库的星标？',
    'You must be signed in to add this repository to a list': '登录后才能将此存储库添加到列表',
    'Add this repository to one or more lists': '将此存储库添加到一个或多个列表',
    'Add this repository to a list': '将此存储库添加到列表',
    'Filter lists': '筛选列表',
    'No lists yet': '暂无列表',
    'Create a list to organize your starred repositories.': '创建列表来整理已加星标的存储库。',
    'No matching lists': '没有匹配的列表',
    'Lists could not be loaded': '无法加载列表',
    'Failed to load lists': '加载列表失败',
    'Failed to update lists': '更新列表失败',
    'Failed to create list': '创建列表失败',
    '⭐️ Name this list': '⭐️ 为列表命名',
    'Enabling this makes the list visible only to you.': '启用后列表仅你自己可见。',

    // 置顶按钮与组织置顶菜单
    'Pin this repository to your profile': '在你的个人资料中置顶此存储库',
    'Pin or unpin this repository on organization profiles and your profile':
      '在组织个人资料和你的个人资料中置顶或取消置顶此存储库',
    'Pin or unpin this repository on organization profiles': '在组织个人资料中置顶或取消置顶此存储库',
    'Pin or unpin this repository on your profile': '在你的个人资料中置顶或取消置顶此存储库',
    'Edit Pins': '编辑置顶项',
    'Pin to…': '置顶到…',
    'Pin repository locations': '存储库置顶位置',
    'Visible to anyone': '所有人可见',
    'Public pins in this organization': '此组织中的公开置顶项',
    'Visible to members only': '仅成员可见',
    'Private pins in this organization': '此组织中的私密置顶项',
    'Pin this to your personal profile, visible to everyone': '置顶到你的个人资料，所有人可见',
    'No pin slots remaining in your profile': '个人资料置顶项已满',
    'Failed to update organization pin': '更新组织置顶项失败',
    'Unable to pin repository. Please try again.': '无法置顶存储库。请重试。',

    // 模板按钮
    'Open in a codespace': '在代码空间中打开',
    'Unable to create template. Please try again.': '无法创建模板。请重试。',

    // 赞助对话框
    'Learn more about GitHub Sponsors': '了解 GitHub 赞助',
  },
  scoped: {
    // Watch、Fork、Star、Pin 等按钮文字与 More、Lists、Name、Description、Create 等通用词由 common-ui 收录
    // 安全公告临时复刻（句尾片段）
    'security advisory.': '安全公告的临时专用复刻。',
    // 关注按钮与菜单
    Participating: '参与',
    Ignore: '忽略',
    Ignoring: '已忽略',
    Custom: '自定义',
    Releases: '发行版',
    'Labels:': '标签：',
    'Failed to update': '更新失败',
    // 关注上限提示句尾：请更新你的 <关注设置> 后继续。（整句由 inline 处理，此为未拼成整句时的片段）
    'to continue.': '后继续。',
    // 星标列表菜单
    'Try again later.': '请稍后重试。',
    'Try a different search term.': '换个搜索词。',
  },
  regexp,
  // 关注数量达到上限的对话框（NotificationsSubscriptionsMenu，React 把 {' '} 渲染成单独的文本节点）：
  // 请更新你的 <关注设置> 后继续。整句命中后链接两侧不留空白，链接文字照常翻译
  inline: [
    [
      'You have reached the limit of 10,000 watched repositories. Update your {} to continue.',
      '你关注的存储库数量已达 10,000 个上限。请更新你的{}后继续。',
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
