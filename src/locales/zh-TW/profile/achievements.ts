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
  'Open Sourcerer'
] as const

const ACHIEVEMENT_SOURCE = ACHIEVEMENTS.join('|')

/** 成就分页与成就详细资料对话框；成就名称不翻译，描述翻译 */
export default {
  static: {
    Achievements: '成就',
    'Earned achievements': '已獲得的成就',
    '· First unlocked': '· 首次解鎖於',
    '· Unlocked': '· 解鎖於',
    // 分级成就的解锁进度（x2 青铜、x3 白银；全部解锁显示为 100% unlocked）
    'Bronze unlocked': '已解鎖青銅',
    'Bronze and Silver unlocked': '已解鎖青銅和白銀',

    // 详细资料：解锁记录
    'Coauthored with': '共同作者',
    'Coauthored with an unknown user': '與未知使用者共同撰寫',
    'Merged without a review': '未經審查即合併',
    'Closed within 5 minutes of opening': '建立後 5 分鐘內關閉',
    'these repositories, and more, were archived': '這些儲存庫和更多儲存庫已封存',
    'this repository was included': '此儲存庫已收錄',

    // 详细资料：描述
    'You want it? You merge it.': '想要就自己合併。',
    'Gitty up!': '快馬加鞭！',
    '2020 GitHub Archive Program': '2020 GitHub 封存計畫',
    'Mars 2020 Helicopter Mission': '火星 2020 直升機任務',

    // 详细资料：本人主页的操作
    'Hide from profile': '從個人檔案中隱藏',
    'Hidden from your profile.': '已從你的個人檔案中隱藏。',
    'Show on profile': '在個人檔案中顯示',
    'Preview on Twitter': '在 Twitter 上預覽',

    // 本人主页：私人贡献解锁成就的提示（后接「設定」链接；原文句中没有逗号，译文用语序代替）
    'You unlocked new Achievements with private contributions! Show them off by including private contributions in your Profile in':
      '你透過私人貢獻解鎖了新成就！要在個人檔案中包含私人貢獻來展示它們可前往',
    'You unlocked new Achievements! Show them off by including achievements and private contributions in your Profile in':
      '你解鎖了新成就！要在個人檔案中包含成就和私人貢獻來展示它們可前往',

    // 亮点
    'GitHub Star': 'GitHub 之星'
  },
  scoped: {
    inaccessible: '無法存取'
  },
  regexp: [
    [new RegExp(`^(${ACHIEVEMENT_SOURCE}) details$`), '$1 詳細資料'],
    [new RegExp(`^Achievement: (${ACHIEVEMENT_SOURCE})$`), '成就：$1'],
    [/^(\d{1,3})% unlocked$/, '已解鎖 $1%'],
    // 解锁记录
    [/^(\d+)(?:st|nd|rd|th) pull request merged$/, '第 $1 個已合併的拉取請求'],
    [/^(\d+)(?:st|nd|rd|th) sponsorship$/, '第 $1 次贊助'],
    [/^(\d+)(?:st|nd|rd|th) accepted answer$/, '第 $1 個獲採納的答案'],
    [/^⭐️? (\d+) stars?$/, '⭐️ $1 顆星'],
    // 描述
    [/^@([\w-]+) opened pull requests that have been merged\.$/, '@$1 建立的拉取請求已合併。'],
    [/^@([\w-]+) is sponsoring (\d+) organizations? or users?\.$/, '@$1 正在贊助 $2 個組織或使用者。'],
    [/^@([\w-]+) coauthored commits on merged pull requests\.$/, '@$1 在已合併的拉取請求中共同撰寫了提交。'],
    [/^@([\w-]+) answered discussions\.$/, '@$1 回答了討論。'],
    [/^@([\w-]+) created a repository that has many stars\.$/, '@$1 建立了獲得許多星號的儲存庫。'],
    // 后接链接：<2020 GitHub Archive Program> / <Mars 2020 Helicopter Mission>
    [/^@([\w-]+) contributed code to several repositories in the$/, '@$1 貢獻過程式碼的多個儲存庫收錄於'],
    [/^@([\w-]+) contributed code to (\d+) repositor(?:y|ies) used in the$/, '@$1 貢獻過程式碼的 $2 個儲存庫用於'],
    // 隐藏 / 显示成就后的提示
    [
      new RegExp(`^The (${ACHIEVEMENT_SOURCE}) achievement will now be hidden from your profile\\.$`),
      '$1 成就將不再顯示在你的個人檔案中。'
    ],
    [new RegExp(`^The (${ACHIEVEMENT_SOURCE}) achievement will now be shown in your profile\\.$`), '$1 成就將顯示在你的個人檔案中。']
  ]
} satisfies PageDictionary
