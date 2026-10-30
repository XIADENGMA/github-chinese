import type { PageDictionary } from '../../../core/types'

/** 成就名保留英文 */
const ACHIEVEMENTS = [
  'Pull Shark',
  'Public Sponsor',
  'Pair Extraordinaire',
  'Galaxy Brain',
  'YOLO',
  'Quickdraw',
  'Starstruck',
  'Arctic Code Vault Contributor',
  'Mars 2020 Contributor',
  'Heart On Your Sleeve',
  'Open Sourcerer',
] as const

const ACHIEVEMENT_SOURCE = ACHIEVEMENTS.join('|')

/** 成就标签页与成就详细信息对话框；成就名称不翻译，描述翻译 */
export default {
  static: {
    Achievements: '成就',
    'Earned achievements': '已获得的成就',
    '· First unlocked': '· 首次解锁于',
    '· Unlocked': '· 解锁于',
    // 分级成就的解锁进度（x2 青铜、x3 白银；全部解锁显示为 100% unlocked）
    'Bronze unlocked': '已解锁青铜',
    'Bronze and Silver unlocked': '已解锁青铜和白银',

    // 详细信息：解锁记录
    'Coauthored with': '合著者',
    'Coauthored with an unknown user': '与未知用户合著',
    'Merged without a review': '未经审查即合并',
    'Closed within 5 minutes of opening': '打开后 5 分钟内关闭',
    'these repositories, and more, were archived': '这些存储库及更多存储库已被存档',
    'this repository was included': '此存储库已被收录',

    // 详细信息：描述
    'You want it? You merge it.': '想要就自己合并。',
    'Gitty up!': '快马加鞭！',
    '2020 GitHub Archive Program': '2020 GitHub 存档计划',
    'Mars 2020 Helicopter Mission': '火星 2020 直升机任务',

    // 详细信息：本人主页的操作
    'Hide from profile': '从个人资料中隐藏',
    'Hidden from your profile.': '已从你的个人资料中隐藏。',
    'Show on profile': '在个人资料中显示',
    'Preview on Twitter': '在 Twitter 上预览',

    // 本人主页：私密贡献解锁成就的提示（后接「设置」链接；原文句中没有逗号，译文用语序代替）
    'You unlocked new Achievements with private contributions! Show them off by including private contributions in your Profile in':
      '你通过私密贡献解锁了新成就！要在个人资料中包含私密贡献来展示它们可前往',
    'You unlocked new Achievements! Show them off by including achievements and private contributions in your Profile in':
      '你解锁了新成就！要在个人资料中包含成就和私密贡献来展示它们可前往',

    // 亮点
    'GitHub Star': 'GitHub 之星',
  },
  scoped: {
    inaccessible: '无法访问',
  },
  regexp: [
    [new RegExp(`^(${ACHIEVEMENT_SOURCE}) details$`), '$1 详细信息'],
    [new RegExp(`^Achievement: (${ACHIEVEMENT_SOURCE})$`), '成就：$1'],
    [/^(\d{1,3})% unlocked$/, '已解锁 $1%'],
    // 解锁记录
    [/^(\d+)(?:st|nd|rd|th) pull request merged$/, '第 $1 个合并的拉取请求'],
    [/^(\d+)(?:st|nd|rd|th) sponsorship$/, '第 $1 次赞助'],
    [/^(\d+)(?:st|nd|rd|th) accepted answer$/, '第 $1 个被采纳的回答'],
    [/^⭐️? (\d+) stars?$/, '⭐️ $1 个星标'],
    // 描述
    [/^@([\w-]+) opened pull requests that have been merged\.$/, '@$1 创建的拉取请求已被合并。'],
    [/^@([\w-]+) is sponsoring (\d+) organizations? or users?\.$/, '@$1 正在赞助 $2 个组织或用户。'],
    [/^@([\w-]+) coauthored commits on merged pull requests\.$/, '@$1 在已合并的拉取请求中合著了提交。'],
    [/^@([\w-]+) answered discussions\.$/, '@$1 回答了讨论。'],
    [/^@([\w-]+) created a repository that has many stars\.$/, '@$1 创建了获得大量星标的存储库。'],
    // 后接链接：<2020 GitHub Archive Program> / <Mars 2020 Helicopter Mission>
    [/^@([\w-]+) contributed code to several repositories in the$/, '@$1 贡献过代码的多个存储库收录于'],
    [/^@([\w-]+) contributed code to (\d+) repositor(?:y|ies) used in the$/, '@$1 贡献过代码的 $2 个存储库用于'],
    // 隐藏 / 显示成就后的提示
    [
      new RegExp(`^The (${ACHIEVEMENT_SOURCE}) achievement will now be hidden from your profile\\.$`),
      '$1 成就将不再显示在你的个人资料中。',
    ],
    [
      new RegExp(`^The (${ACHIEVEMENT_SOURCE}) achievement will now be shown in your profile\\.$`),
      '$1 成就将显示在你的个人资料中。',
    ],
  ],
} satisfies PageDictionary
