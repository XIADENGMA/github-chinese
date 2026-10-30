import type { PageDictionary } from '../../../core/types'

/** 本地时间差：「1h」「5.5h」「5h30m」「30m」→ 1 小時、5.5 小時、5 小時 30 分鐘、30 分鐘 */
function formatOffset(offset: string): string {
  const hours = /(\d+(?:\.\d+)?)h/.exec(offset)?.[1]
  const minutes = /(\d+)m/.exec(offset)?.[1]
  const parts = [hours === undefined ? '' : `${hours} 小時`, minutes === undefined ? '' : `${minutes} 分鐘`]
  return parts.filter(Boolean).join(' ')
}

/**
 * 个人主页头部与侧栏：分页导航、名片信息、追踪与赞助、亮点、已钉选的储存库、私人个人档案提示、
 * 封锁与检举对话框、编辑个人档案表单、个人档案读我档案入口。
 * 「Stars」「Organizations」「Repositories」「Projects」「Following」及状态对话框由 common 收录；
 * 「Sponsors」common 译「贊助」（导航项），侧栏赞助者列表标题在本文件 scoped 译「贊助者」。
 */
export default {
  static: {
    // 分页导航
    'User profile': '使用者個人檔案',
    Overview: '總覽',
    Packages: '套件',
    Sponsoring: '贊助中',

    // 名片
    'Change your avatar': '更換頭像',
    'Edit profile': '編輯個人檔案',
    Follow: '追蹤',
    Unfollow: '取消追蹤',
    // 计数片段：<span>329k</span> followers → 329k 位追蹤者
    followers: '位追蹤者',
    follower: '位追蹤者',
    following: '追蹤中',
    // Followed by <用户>, <用户>, and N more
    'Followed by': '追蹤者包括',
    Sponsor: '贊助',
    'Private Sponsor': '不公開的贊助者',
    'Member since': '加入時間',
    Joined: '加入於',
    '- same time': '- 時間相同',

    // 亮点
    Highlights: '亮點',
    'Developer Program Member': '開發人員計畫成員',
    'Security Bug Bounty Hunter': '安全漏洞賞金獵人',
    'GitHub Campus Expert': 'GitHub 校園專家',
    'security advisory credit': '次安全性公告致謝',
    'security advisory credits': '次安全性公告致謝',
    // PRO 徽章的 title；方案名按用户要求译出（可见文字 Pro 由 common 的全局词条译「專業版」）
    'Label: Pro': '標籤：專業版',

    // 个人档案读我档案（本人主页）
    'Edit your profile readme file': '編輯個人檔案讀我檔案',
    'GitHub profile guide': 'GitHub 個人檔案指南',

    // 已钉选的储存库
    Pinned: '已釘選',
    'Popular repositories': '熱門儲存庫',
    'Customize your pins': '自訂釘選項目',
    'Customize pins': '自訂釘選項目',
    'Edit pinned items': '編輯釘選項目',
    'Select up to six public repositories or gists you’d like to show to anyone.':
      '最多選取六個要向所有人展示的公開儲存庫或程式碼片段。',
    "Select up to six public repositories or gists you'd like to show to anyone.":
      '最多選取六個要向所有人展示的公開儲存庫或程式碼片段。',
    'Select up to six public repositories you’d like to show to anyone.': '最多選取六個要向所有人展示的公開儲存庫。',
    "Select up to six public repositories you'd like to show to anyone.": '最多選取六個要向所有人展示的公開儲存庫。',
    'Select up to six public repositories you’d like to show.': '最多選取六個要展示的公開儲存庫。',
    "Select up to six public repositories you'd like to show.": '最多選取六個要展示的公開儲存庫。',
    'Filter repositories and gists': '篩選儲存庫和程式碼片段',
    'Show:': '顯示：',
    'Save pins': '儲存釘選項目',
    'Drag to reorder': '拖曳以調整順序',
    'Order updated.': '順序已更新。',
    'Your pins have been updated.': '釘選項目已更新。',
    'Your pins have been updated. Drag and drop to reorder them.': '釘選項目已更新。拖放以調整順序。',
    'Your popular repositories will now be shown instead of your pins.': '現在將顯示你的熱門儲存庫而非釘選項目。',

    // 私人个人档案（本人主页）
    'Only you can see your full profile.': '只有你能查看完整的個人檔案。',
    'You have marked your profile as private, which limits what activity other people can see.':
      '你已將個人檔案設為私人，其他人能看到的活動將受到限制。',
    'Update profile settings': '更新個人檔案設定',
    'View what others see': '查看他人所見',
    'View full profile': '查看完整個人檔案',

    // 封锁与检举
    'Block or Report': '封鎖或檢舉',
    'Block or report user': '封鎖或檢舉使用者',
    'Block or Report user': '封鎖或檢舉使用者',
    'Block user': '封鎖使用者',
    'Unblock user': '解除封鎖使用者',
    'You have blocked this user': '你已封鎖此使用者',
    'Unblock or report user': '解除封鎖或檢舉使用者',
    'Prevent this user from interacting with your repositories and sending you notifications. Learn more about':
      '禁止此使用者與你的儲存庫互動並向你傳送通知。瞭解',
    'Allow this user to interact with your repositories and send you notifications. Learn more about':
      '允許此使用者與你的儲存庫互動並向你傳送通知。瞭解',
    'blocking users': '封鎖使用者',
    'You must be logged in to block users.': '登入後才能封鎖使用者。',
    'Close all issues, pull requests, and discussions opened by this user':
      '關閉此使用者建立的所有議題、拉取請求和討論',
    'Content in all repositories owned by your account will be closed.': '你的帳號擁有的所有儲存庫中的內容都將關閉。',
    'Add an optional note': '新增選填備註',
    'Maximum 250 characters. Please don’t include any personal information such as legal names or email addresses. Markdown is supported. This note will only be visible to you.':
      '最多 250 個字元。請勿包含法定姓名或電子郵件地址等個人資料。支援 Markdown。此備註只有你看得到。',
    "Maximum 250 characters. Please don't include any personal information such as legal names or email addresses. Markdown is supported. This note will only be visible to you.":
      '最多 250 個字元。請勿包含法定姓名或電子郵件地址等個人資料。支援 Markdown。此備註只有你看得到。',
    'Report abuse': '檢舉濫用',
    'Contact GitHub support about this user’s behavior. Learn more about': '就此使用者的行為聯絡 GitHub 支援。瞭解',
    "Contact GitHub support about this user's behavior. Learn more about": '就此使用者的行為聯絡 GitHub 支援。瞭解',
    'reporting abuse': '檢舉濫用',

    // 编辑个人档案表单
    'You can @mention other users and organizations to link to them.': '你可以 @提及其他使用者和組織以連結到他們。',
    'other users and organizations to link to them.': '其他使用者和組織以連結到他們。',
  },
  scoped: {
    Followers: '追蹤者',
    // 侧栏赞助者列表标题 <h2>Sponsors</h2>
    Sponsors: '贊助者',
    // 编辑个人档案表单（设定页的同名字段由设定词典负责）
    Bio: '個人簡介',
    'Add a bio': '新增個人簡介',
    Pronouns: '代名詞',
    "Don't specify": '不指定',
    'Don’t specify': '不指定',
    Website: '網站',
    Location: '所在地',
    'Display current local time': '顯示目前當地時間',
    'Social accounts': '社群帳號',
    'Social account': '社群帳號',
    Custom: '自訂',
    'Time zone': '時區',
    'You can': '你可以',
    // Display <PRO> badge.
    Display: '顯示',
    'badge.': '徽章。',
    'Filter repositories': '篩選儲存庫',
    // 钉选对话框加载失败：Something went wrong. <Retry.>
    'Retry.': '重試。',
  },
  regexp: [
    // 追踪人数（数字与文字拼接后）；N followers 由 common-ui 的通用计数规则翻译
    [/^(\d[\d.,]*[kKmM]?) following$/, '追蹤 $1 人'],
    [/^Sponsor @([\w-]+)$/, '贊助 @$1'],
    [/^Block or report ([\w-]+)$/, '封鎖或檢舉 $1'],
    // 名片 aria-label
    [/^Organization: (.+)$/, '組織：$1'],
    [/^Home location: (.+)$/, '所在地：$1'],
    [/^Email: (\S+@\S+)$/, '電子郵件：$1'],
    // 本地时间：- 1h ahead / - 7h behind / - 5h30m ahead（时与分之间不带空格；带空格的写法同样接受）
    [
      /^- (\d+(?:\.\d+)?h(?: ?\d+m)?|\d+m) (ahead|behind)$/,
      (_, offset, direction) => `- ${direction === 'ahead' ? '快' : '慢'} ${formatOffset(offset)}`,
    ],
    // 组织头像溢出：+ 12 more
    [/^\+ (\d+) more$/, '另有 $1 個'],
    [/^(\d+) security advisory credits?$/, '$1 次安全性公告致謝'],
    // 编辑个人档案：社群帐号输入框
    [/^Link to social profile (\d)$/, '社群帳號連結 $1'],
    // 钉选项目排序按钮：Move hello-world up
    [/^Move (.+?) (up|down)$/, (_, name, direction) => `將 ${name} ${direction === 'up' ? '上移' : '下移'}`],
  ],
  ignore: [
    // 状态消息（姓名、简介、公司、所在地、已钉选的储存库由全局忽略规则处理）
    '.user-status-message-wrapper',
    // 页头面包屑首项的使用者名称（today 这类使用者名称会被当成时间词翻译）
    'li:first-child > [class*="contextCrumb__"]',
    // 个人档案读我档案标题中的「使用者名称/使用者名称」
    '.profile-readme .text-mono',
  ],
  // 追踪人数被 <span> 拆开：<a><span>31</span> following</a>（链接内没有图标）
  inline: [['{} following', '追蹤 {} 人']],
} satisfies PageDictionary
