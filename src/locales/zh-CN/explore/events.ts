import type { PageDictionary } from '../../../core/types'

/**
 * 活动页 /events（跳转到 /resources/events，按探索页识别）：页头、筛选、排序、活动卡片按钮、空状态、标签页标题。
 * 活动标题、简介、地点与时间属于运营内容，不收录。
 * 筛选标题 Type 收录为 scoped：登录后页头的“Type <kbd>/</kbd> to search”由引擎按 kbd 整句先匹配，不受影响。
 */
export default {
  static: {
    'Events & Webinars': '活动与网络研讨会',
    'Discover upcoming GitHub events, webinars, and conferences. Connect with developers, explore new tools, and learn how to build, secure, and scale software with GitHub.':
      '发现即将举行的 GitHub 活动、网络研讨会和会议。与开发人员交流，探索新工具，学习如何用 GitHub 构建、保护和扩展软件。',
    'Selecting a sort option will reload the page.': '选择排序选项后将重新加载页面。',
    'Date (soonest)': '日期（由近及远）',
    'Register here': '在此注册',
    'Enter now': '立即参加',
    'Explore more': '探索更多',
    // 名词 filters → 筛选器（GLOSSARY Clear filters → 清除筛选器）
    'No results found. Please clear your filters and try another search.': '未找到结果。请清除筛选器后重新搜索。',
    // 标签页标题段
    'Upcoming GitHub events, webinars & developer conferences': '即将举行的 GitHub 活动、网络研讨会与开发人员大会'
  },
  scoped: {
    // 筛选：类型（形式）、主题、地区、观看方式
    Type: '类型',
    Virtual: '线上',
    'In Person': '线下',
    Topic: '主题',
    Region: '地区',
    AMER: '美洲',
    APAC: '亚太',
    EMEA: '欧洲中东非洲',
    Availability: '观看方式',
    Live: '直播',
    'On demand': '点播',
    // 窄屏筛选菜单开关的读屏文字：Open / Close + " Filters"
    'Open Filters': '打开筛选器',
    'Close Filters': '关闭筛选器',
    // 活动卡片按钮
    Register: '注册',
    'Join now': '立即加入'
  },
  regexp: [
    // 筛选标题带已选数量：Filters (2)
    [/^Filters \((\d+)\)$/, '筛选器 ($1)'],
    // 标签页标题段的分页变体：Upcoming GitHub events, webinars & developer conferences - Page 2
    [
      /^Upcoming GitHub events, webinars & developer conferences - Page (\d+)$/,
      '即将举行的 GitHub 活动、网络研讨会与开发人员大会 - 第 $1 页'
    ]
  ],
  ignore: [
    // 页脚站点语言选择器的当前语言（与自然语言筛选同名，保持原文）
    '[class*="triggerContent__"]:has(.octicon-globe) [class*="triggerLabel__"]'
  ]
} satisfies PageDictionary
