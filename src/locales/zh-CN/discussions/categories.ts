import type { PageDictionary, RegExpRule } from '../../../core/types'
import { joinCjk } from '../helpers'

/** 启用讨论时自动创建的默认类别（Help 为常见的 Q&A 改名）；其余类别名是用户内容 */
export const DEFAULT_CATEGORIES: ReadonlyMap<string, string> = new Map([
  ['Announcements', '公告'],
  ['General', '常规'],
  ['Ideas', '想法'],
  ['Polls', '投票'],
  ['Q&A', '问答'],
  ['Show and tell', '展示与分享'],
  ['Help', '帮助']
])

/** 默认类别名的正则片段（不含捕获组；类别名中没有正则元字符） */
export const DEFAULT_CATEGORY_SOURCE = `(?:${[...DEFAULT_CATEGORIES.keys()].join('|')})`

/** 默认类别名译为中文，其余原样保留（用 Map 查找，constructor 等原型链键不会命中） */
export function categoryName(name: string): string {
  return DEFAULT_CATEGORIES.get(name) ?? name
}

/**
 * 类别名嵌入中文：默认类别用译名，与两侧中文按需补空格。
 * 原文类别名不带引号，译文也不加：withCategory('置顶到', 'RFC') → 置顶到 RFC；withCategory('编辑', 'Polls', '类别') → 编辑投票类别
 */
export function withCategory(before: string, name: string, after = ''): string {
  return joinCjk(joinCjk(before, categoryName(name)), after)
}

/** 类别页路径中的类别标识：Q&A → q-a，Show and tell → show-and-tell */
function categorySlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

/** 筛选查询中的类别名（URL 编码，空格为 +）：Q&A → Q%26A */
function categoryQuery(name: string): string {
  return encodeURIComponent(name).replaceAll('%20', '+')
}

/** 链接指向默认类别页：…/discussions/categories/<标识>，可带查询串 */
const DEFAULT_CATEGORY_PATH = `:is(${[...DEFAULT_CATEGORIES.keys()]
  .map(categorySlug)
  .flatMap(slug => [`[href$="/categories/${slug}"]`, `[href*="/categories/${slug}?"]`])
  .join(', ')})`

/** 链接按默认类别筛选：discussions_q=category:<名称> 或 category:"<名称>" */
const DEFAULT_CATEGORY_QUERY = `:is(${[...DEFAULT_CATEGORIES.keys()]
  .map(categoryQuery)
  .flatMap(query => [`[href$="category%3A${query}"]`, `[href*="category%3A%22${query}%22"]`])
  .join(', ')})`

/** 指向自定义类别页的链接 */
const CUSTOM_CATEGORY_LINK = `[href*="/discussions/categories/"]:not(${DEFAULT_CATEGORY_PATH})`

/**
 * 自定义类别名所在元素：类别名是用户内容，与全站 static 同形时（Feedback、Security 等）会被误译。
 * 默认类别名不忽略，由 scoped 翻译；类别页的排序、筛选菜单也链接到类别页，不在此列。
 */
export const CUSTOM_CATEGORY_IGNORE: readonly string[] = [
  // 侧栏类别列表
  `a.ActionList-content${CUSTOM_CATEGORY_LINK} .ActionList-item-label`,
  // 列表项的类别链接（无障碍名称“X (category)”随之不译）
  `a.Link--inTextBlock${CUSTOM_CATEGORY_LINK}`,
  // 置顶讨论卡片的类别链接
  `a.Truncate-text[href*="discussions_q=category%3A"]:not(${DEFAULT_CATEGORY_QUERY})`,
  // 讨论详情：头部与侧栏的类别链接
  `a.color-fg-inherit${CUSTOM_CATEGORY_LINK}`,
  `a.Link--onHover${CUSTOM_CATEGORY_LINK}`,
  // 自定义类别页的标题与说明
  `body:has(a.ActionList-content[aria-current="page"]${CUSTOM_CATEGORY_LINK}) :is(#discussions-list, .Subhead-description)`
]

const ACTIONS: ReadonlyMap<string, string> = new Map([
  ['created', '创建'],
  ['updated', '更新'],
  ['deleted', '删除']
])

function action(verb: string): string {
  return ACTIONS.get(verb) ?? verb
}

/**
 * 提示条中的名称：原文带引号的译文用“”括起，否则与后面的中文按需补空格（未参与匹配的捕获组由引擎传入空串）。
 * Category "Ideas" has been created. → “想法”类别已创建。；Category RFC has been deleted. → RFC 类别已删除。
 */
function noticeSubject(quotedName: string, name: string, noun: string, rename: (value: string) => string = value => value): string {
  if (quotedName) return `“${rename(quotedName)}”${noun}`
  return joinCjk(rename(name), noun)
}

const regexp: readonly RegExpRule[] = [
  // 类别管理页（类别名、分组名原文不带引号，译文也不加）
  [/^(\d[\d,]*) categor(?:y|ies)$/, '$1 个类别'],
  [/^Edit (.+) category$/, (_, name) => withCategory('编辑', name, '类别')],
  [/^Delete (.+) category$/, (_, name) => withCategory('删除', name, '类别')],
  [/^Edit section (.+)$/, (_, name) => joinCjk('编辑分组', name)],
  [/^Delete section (.+)$/, (_, name) => joinCjk('删除分组', name)],
  [/^Delete (.+) section$/, (_, name) => joinCjk(joinCjk('删除', name), '分组')],
  // 提示条：Category "Ideas" has been created. / Category RFC has been deleted.
  [
    /^Category (?:"(.+)"|(.+?)) has been (created|updated|deleted)\.$/,
    (_, quotedName: string, name: string, verb: string) => `${noticeSubject(quotedName, name, '类别', categoryName)}已${action(verb)}。`
  ],
  [
    /^Section (?:"(.+)"|(.+?)) has been (created|updated|deleted)\.$/,
    (_, quotedName: string, name: string, verb: string) => `${noticeSubject(quotedName, name, '分组')}已${action(verb)}。`
  ]
]

/**
 * 讨论类别：默认类别名与说明、类别与分组管理（/discussions/categories）、新建与编辑类别 / 分组。
 * 自定义类别名由 ignore 排除（列表、侧栏、置顶卡片、讨论详情、类别页）。
 */
export default {
  static: {
    // 默认类别说明
    'Updates from maintainers': '来自维护者的更新',
    'Chat about anything and everything here': '在这里畅聊任何话题',
    'Share ideas for new features': '分享新功能的想法',
    'Take a vote from the community': '向社区发起投票',
    'Ask the community for help': '向社区求助',
    "Show off something you've made": '展示你的作品',
    'Show off something you’ve made': '展示你的作品',

    // 类别管理页
    'Manage discussion categories': '管理讨论类别',
    'Sections are a dropdown of categories. Categories have types of discussions, and discussions within them.':
      '分组以下拉列表的形式收纳类别。每个类别有各自的讨论格式，并包含相应的讨论。',
    'Categories without section': '未分组的类别',
    'Answers enabled': '已启用答案',
    'New category': '新建类别',
    'New section': '新建分组',
    'Edit category': '编辑类别',
    'Delete category': '删除类别',
    'Edit section': '编辑分组',
    'Delete section': '删除分组',
    'If this category has discussions associated, where would you like to reassign them?': '如果此类别中有讨论，要将它们重新分配到哪里？',
    'Delete and move': '删除并移动',
    'Delete & Move': '删除并移动',
    'Delete & move': '删除并移动',
    'Are you sure you want to delete this section? All categories in this section will no longer belong to a section.':
      '确定要删除此分组吗？此分组中的所有类别将不再属于任何分组。',

    // 新建与编辑类别
    'Create category': '创建类别',
    'Category name': '类别名称',
    'Discussion Format': '讨论格式',
    'Discussion format': '讨论格式',
    'Open-ended discussion': '开放式讨论',
    "Enable your community to have conversations that don't require a definitive answer to a question. Great for sharing tips and tricks or just chatting.":
      '让社区进行无需明确答案的对话。适合分享技巧或闲聊。',
    'Enable your community to have conversations that don’t require a definitive answer to a question. Great for sharing tips and tricks or just chatting.':
      '让社区进行无需明确答案的对话。适合分享技巧或闲聊。',
    'Question / Answer': '问题/回答',
    'Enable your community to ask questions, suggest answers, and vote on the best suggested answer.':
      '让社区提出问题、建议答案，并投票选出最佳答案。',
    'Share updates and news with your community. Only maintainers and admins can post new discussions in these categories, but anyone can comment and reply.':
      '向社区分享动态和新闻。只有维护者和管理员可以在这些类别中发起新讨论，但任何人都可以评论和回复。',
    'Gauge interest, vote, and interact with other community members using polls.':
      '通过投票了解社区意向、参与表决，并与其他社区成员互动。',
    'Cannot be changed to polls. Please create a new category for polls.': '无法更改为投票格式。请为投票新建类别。',
    'Add this category to a section (optional)': '将此类别添加到分组（可选）',
    'No section': '无分组',

    // 新建与编辑分组
    'Create section': '创建分组',
    'Section name': '分组名称',
    'Add categories to this section': '向此分组添加类别',
    'A category can only belong to one section at a time.': '一个类别同时只能属于一个分组。'
  },
  scoped: {
    // 默认类别名（Help 与 common-ui 全局同译，为与繁体同键而收录）
    ...Object.fromEntries(DEFAULT_CATEGORIES),
    // 讨论格式
    Poll: '投票',
    'Add a description (optional)': '添加描述（可选）'
  },
  regexp,
  ignore: CUSTOM_CATEGORY_IGNORE
} satisfies PageDictionary
