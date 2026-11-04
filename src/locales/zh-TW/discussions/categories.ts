import type { PageDictionary, RegExpRule } from '../../../core/types'
import { joinCjk } from '../helpers'

/** 启用讨论时自动创建的默认类别（Help 为常见的 Q&A 改名）；其余类别名是用户内容 */
export const DEFAULT_CATEGORIES: ReadonlyMap<string, string> = new Map([
  ['Announcements', '公告'],
  ['General', '一般'],
  ['Ideas', '想法'],
  ['Polls', '投票'],
  ['Q&A', '問與答'],
  ['Show and tell', '成果分享'],
  ['Help', '求助']
])

/** 默认类别名的正则片段（不含捕获组；类别名中没有正则元字符） */
export const DEFAULT_CATEGORY_SOURCE = `(?:${[...DEFAULT_CATEGORIES.keys()].join('|')})`

/** 默认类别名译为中文，其余原样保留（用 Map 查找，constructor 等原型链键不会命中） */
export function categoryName(name: string): string {
  return DEFAULT_CATEGORIES.get(name) ?? name
}

/**
 * 类别名嵌入中文：默认类别用译名，与两侧中文按需补空格。
 * 原文类别名不带引号，译文也不加：withCategory('釘選到', 'RFC') → 釘選到 RFC；withCategory('編輯', 'Polls', '類別') → 編輯投票類別
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
  // 固定讨论卡片的类别链接
  `a.Truncate-text[href*="discussions_q=category%3A"]:not(${DEFAULT_CATEGORY_QUERY})`,
  // 讨论详情：头部与侧栏的类别链接
  `a.color-fg-inherit${CUSTOM_CATEGORY_LINK}`,
  `a.Link--onHover${CUSTOM_CATEGORY_LINK}`,
  // 自定义类别页的标题与说明
  `body:has(a.ActionList-content[aria-current="page"]${CUSTOM_CATEGORY_LINK}) :is(#discussions-list, .Subhead-description)`
]

const ACTIONS: ReadonlyMap<string, string> = new Map([
  ['created', '建立'],
  ['updated', '更新'],
  ['deleted', '刪除']
])

function action(verb: string): string {
  return ACTIONS.get(verb) ?? verb
}

/**
 * 提示条中的名称：原文带引号的译文用「」括起，否则与后面的中文按需补空格（未参与匹配的捕获组由引擎传入空串）。
 * Category "Ideas" has been created. → 「想法」類別已建立。；Category RFC has been deleted. → RFC 類別已刪除。
 */
function noticeSubject(quotedName: string, name: string, noun: string, rename: (value: string) => string = value => value): string {
  if (quotedName) return `「${rename(quotedName)}」${noun}`
  return joinCjk(rename(name), noun)
}

const regexp: readonly RegExpRule[] = [
  // 类别管理页（类别名、分组名原文不带引号，译文也不加）
  [/^(\d[\d,]*) categor(?:y|ies)$/, '$1 個類別'],
  [/^Edit (.+) category$/, (_, name) => withCategory('編輯', name, '類別')],
  [/^Delete (.+) category$/, (_, name) => withCategory('刪除', name, '類別')],
  [/^Edit section (.+)$/, (_, name) => joinCjk('編輯區段', name)],
  [/^Delete section (.+)$/, (_, name) => joinCjk('刪除區段', name)],
  [/^Delete (.+) section$/, (_, name) => joinCjk(joinCjk('刪除', name), '區段')],
  // 提示条：Category "Ideas" has been created. / Category RFC has been deleted.
  [
    /^Category (?:"(.+)"|(.+?)) has been (created|updated|deleted)\.$/,
    (_, quotedName: string, name: string, verb: string) => `${noticeSubject(quotedName, name, '類別', categoryName)}已${action(verb)}。`
  ],
  [
    /^Section (?:"(.+)"|(.+?)) has been (created|updated|deleted)\.$/,
    (_, quotedName: string, name: string, verb: string) => `${noticeSubject(quotedName, name, '區段')}已${action(verb)}。`
  ]
]

/**
 * 讨论类别：默认类别名与说明、类别与分组管理（/discussions/categories）、新建与编辑类别 / 分组。
 * 分组（section）译「區段」，与已有繁体词典的 section 同译。
 * 自定义类别名由 ignore 排除（列表、侧栏、固定卡片、讨论详情、类别页）。
 */
export default {
  static: {
    // 默认类别说明
    'Updates from maintainers': '來自維護者的更新',
    'Chat about anything and everything here': '在這裡暢談任何話題',
    'Share ideas for new features': '分享新功能的想法',
    'Take a vote from the community': '向社群發起投票',
    'Ask the community for help': '向社群求助',
    "Show off something you've made": '展示你的作品',
    'Show off something you’ve made': '展示你的作品',

    // 类别管理页
    'Manage discussion categories': '管理討論類別',
    'Sections are a dropdown of categories. Categories have types of discussions, and discussions within them.':
      '區段以下拉式選單收納類別。每個類別各有討論類型，並包含其中的討論。',
    'Categories without section': '未歸入區段的類別',
    'Answers enabled': '已啟用答案',
    'New category': '新增類別',
    'New section': '新增區段',
    'Edit category': '編輯類別',
    'Delete category': '刪除類別',
    'Edit section': '編輯區段',
    'Delete section': '刪除區段',
    'If this category has discussions associated, where would you like to reassign them?': '如果此類別中有討論，要將它們重新分配到哪裡？',
    'Delete and move': '刪除並移動',
    'Delete & Move': '刪除並移動',
    'Delete & move': '刪除並移動',
    'Are you sure you want to delete this section? All categories in this section will no longer belong to a section.':
      '確定要刪除此區段嗎？此區段中的所有類別將不再屬於任何區段。',

    // 新建与编辑类别
    'Create category': '建立類別',
    'Category name': '類別名稱',
    'Discussion Format': '討論格式',
    'Discussion format': '討論格式',
    'Open-ended discussion': '開放式討論',
    "Enable your community to have conversations that don't require a definitive answer to a question. Great for sharing tips and tricks or just chatting.":
      '讓社群展開不需要明確答案的對話。適合分享技巧或單純閒聊。',
    'Enable your community to have conversations that don’t require a definitive answer to a question. Great for sharing tips and tricks or just chatting.':
      '讓社群展開不需要明確答案的對話。適合分享技巧或單純閒聊。',
    'Question / Answer': '問題/回答',
    'Enable your community to ask questions, suggest answers, and vote on the best suggested answer.':
      '讓社群提出問題、建議答案，並投票選出最佳答案。',
    'Share updates and news with your community. Only maintainers and admins can post new discussions in these categories, but anyone can comment and reply.':
      '與社群分享最新動態和新聞。只有維護者和管理員可以在這些類別中發起新討論，但任何人都可以留言並回覆。',
    'Gauge interest, vote, and interact with other community members using polls.':
      '透過投票瞭解大家的意向、發起表決，並與其他社群成員互動。',
    'Cannot be changed to polls. Please create a new category for polls.': '無法變更為投票格式。請為投票建立新類別。',
    'Add this category to a section (optional)': '將此類別加入區段（選填）',
    'No section': '無區段',

    // 新建与编辑分组
    'Create section': '建立區段',
    'Section name': '區段名稱',
    'Add categories to this section': '將類別加入此區段',
    'A category can only belong to one section at a time.': '一個類別同時只能屬於一個區段。'
  },
  scoped: {
    // 默认类别名（Help 覆盖 common-ui 全局的「說明」）
    ...Object.fromEntries(DEFAULT_CATEGORIES),
    // 讨论格式
    Poll: '投票',
    'Add a description (optional)': '新增描述（選填）'
  },
  regexp,
  ignore: CUSTOM_CATEGORY_IGNORE
} satisfies PageDictionary
