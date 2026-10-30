import type { PageDictionary } from '../../../core/types'

/**
 * 活动页 /events（跳转到 /resources/events，按探索页识别）：页头、筛选、排序、活动卡片按钮、空状态、标签页标题。
 * 活动标题、简介、地点与时间属于运营内容，不收录。
 * 筛选标题 Type 收录为 scoped：登录后页头的“Type <kbd>/</kbd> to search”由引擎按 kbd 整句先匹配，不受影响。
 * webinar 取微软繁中的「網路研討會」；活动报名的 Register 作「報名」（帐号注册才作「註冊」）。
 */
export default {
  static: {
    'Events & Webinars': '活動和網路研討會',
    'Discover upcoming GitHub events, webinars, and conferences. Connect with developers, explore new tools, and learn how to build, secure, and scale software with GitHub.':
      '發現即將舉行的 GitHub 活動、網路研討會和會議。與開發人員交流、探索新工具，並瞭解如何使用 GitHub 建置、保護、擴充軟體。',
    'Selecting a sort option will reload the page.': '選擇排序選項後會重新載入頁面。',
    'Date (soonest)': '日期（由近到遠）',
    'Register here': '在此報名',
    'Enter now': '立即參加',
    'Explore more': '探索更多',
    // 名词 filters → 篩選器（GLOSSARY.zh-TW：Clear filters → 清除篩選器）
    'No results found. Please clear your filters and try another search.': '找不到結果。請清除篩選器並重新搜尋。',
    // 标签页标题段
    'Upcoming GitHub events, webinars & developer conferences': '即將舉行的 GitHub 活動、網路研討會和開發人員大會',
  },
  scoped: {
    // 筛选：Type（形式）、Topic、Region、Availability
    Type: '類型',
    Virtual: '線上',
    'In Person': '實體',
    Topic: '主題',
    Region: '地區',
    AMER: '美洲',
    APAC: '亞太',
    // 原文无标点，译文不加顿号：取台湾通行的简称「歐非中東」
    EMEA: '歐非中東',
    Availability: '觀看方式',
    Live: '直播',
    // on-demand 取台湾通行的「隨選」（隨選視訊）
    'On demand': '隨選',
    // 窄屏筛选菜单开关的读屏文字：Open / Close + " Filters"
    'Open Filters': '開啟篩選器',
    'Close Filters': '關閉篩選器',
    // 活动卡片按钮
    Register: '報名',
    'Join now': '立即加入',
  },
  regexp: [
    // 筛选标题带已选数量：Filters (2)
    [/^Filters \((\d+)\)$/, '篩選器 ($1)'],
    // 标签页标题段的分页变体：Upcoming GitHub events, webinars & developer conferences - Page 2
    [
      /^Upcoming GitHub events, webinars & developer conferences - Page (\d+)$/,
      '即將舉行的 GitHub 活動、網路研討會和開發人員大會 - 第 $1 頁',
    ],
  ],
  ignore: [
    // 页脚站点语言选择器的当前语言（与自然语言筛选同名，保持原文）
    '[class*="triggerContent__"]:has(.octicon-globe) [class*="triggerLabel__"]',
  ],
} satisfies PageDictionary
