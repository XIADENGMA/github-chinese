import type { PageDictionary } from '../../../core/types'
import { DATE_SOURCE, joinCjk, translateDate } from '../helpers'

/** 逾期时长单位（MilestoneDate 的 day(s) / month(s) / year(s)） */
const OVERDUE_UNIT: Readonly<Record<string, string>> = { day: '天', month: '個月', year: '年' }

/** 系统错误说明（后接“Try reloading the page, or if the problem persists” + 链接 contact support） */
const LOAD_ERROR: Readonly<Record<string, string>> = {
  'Milestones cannot be loaded due to a system error.': '因系統錯誤而無法載入里程碑。',
  'This milestone cannot be loaded due to a system error.': '因系統錯誤而無法載入此里程碑。',
  'This page cannot be loaded due to a system error.': '因系統錯誤而無法載入此頁面。',
  "This milestone's issues can not be loaded due to a system error.": '因系統錯誤而無法載入此里程碑的議題。',
}

const LOAD_ERROR_SOURCE = Object.keys(LOAD_ERROR)
  .map((text) => text.replace(/[.']/g, '\\$&'))
  .join('|')

/**
 * 里程碑页：列表（打开 / 已关闭、排序、进度、截止日期）、详情页（议题列表、关闭 / 重新打开）、
 * 新建 / 编辑表单、删除确认、空状态与错误。
 */
export default {
  static: {
    // 列表
    'New milestone': '新增里程碑',
    // 新建页的标签页标题
    'New Milestone': '新增里程碑',
    'Milestone menu': '里程碑選單',
    'Furthest due date': '截止日期最遠',
    'Closest due date': '截止日期最近',
    'Least complete': '完成度最低',
    'Most complete': '完成度最高',
    Alphabetical: '依字母順序',
    'Reverse alphabetical': '依字母倒序',
    'Most issues': '最多議題',
    'Fewest issues': '最少議題',
    'You haven’t created any Milestones.': '你尚未建立任何里程碑。',
    "You haven't created any Milestones.": '你尚未建立任何里程碑。',
    'Use Milestones to create collections of Issues and Pull Requests for a particular release or project.':
      '使用里程碑為特定發行版本或專案彙整議題和拉取請求。',
    'Create a milestone': '建立里程碑',
    'We couldn’t find anything!': '找不到任何內容！',
    "We couldn't find anything!": '找不到任何內容！',
    "There aren't any milestones that match. Give it another shot above.": '沒有相符的里程碑。請在上方再試一次。',
    'There aren’t any milestones that match. Give it another shot above.': '沒有相符的里程碑。請在上方再試一次。',
    'Milestones cannot be loaded.': '無法載入里程碑。',
    'Milestone cannot be loaded.': '無法載入里程碑。',
    'Could not load page': '無法載入頁面',
    // 系统错误说明（与后半句被元素隔开时单独匹配）
    ...LOAD_ERROR,

    // 详情页
    'Back to milestones': '返回里程碑',
    'Back to Milestones': '返回里程碑',
    'More milestone actions': '更多里程碑動作',
    'Milestone issues': '里程碑議題',
    'Close milestone': '關閉里程碑',
    'Reopen milestone': '重新開啟里程碑',
    'Close Milestone': '關閉里程碑',
    'Reopen Milestone': '重新開啟里程碑',
    'Closing milestone.': '正在關閉里程碑。',
    'Reopening milestone.': '正在重新開啟里程碑。',
    'Milestone closed.': '里程碑已關閉。',
    'Milestone reopened.': '里程碑已重新開啟。',
    'Could not change Milestone state': '無法變更里程碑狀態',
    'There are no open issues in this milestone': '此里程碑中沒有開放中的議題',
    'There are no closed issues in this milestone': '此里程碑中沒有已關閉的議題',
    'Failed to load issues.': '無法載入議題。',
    'Failed to refresh issues. Please try again.': '無法重新整理議題。請再試一次。',
    'Unable to refresh milestone issues.': '無法重新整理里程碑議題。',
    'Unable to load more issues.': '無法載入更多議題。',
    'More issues loaded.': '已載入更多議題。',
    'Failed to reorder milestone item. Please try again.': '無法調整里程碑項目的順序。請再試一次。',
    'Milestone changes could not be saved': '無法儲存里程碑變更',
    'Your draft has been kept. Check your connection and try again.': '已保留草稿。請檢查網路連線後再試一次。',
    'Edit and retry': '編輯並重試',
    'Saving milestone changes.': '正在儲存里程碑變更。',
    'Milestone changes saved.': '已儲存里程碑變更。',

    // 新建 / 编辑
    'Create milestone': '建立里程碑',
    'Edit milestone': '編輯里程碑',
    'Create a new milestone to help organize your issues and pull requests. Learn more about':
      '建立新的里程碑來整理你的議題和拉取請求。瞭解',
    'Create a new milestone to help organize your issues and pull requests.':
      '建立新的里程碑來整理你的議題和拉取請求。',
    'milestones and issues': '里程碑和議題',
    'Milestone name': '里程碑名稱',
    'Describe your milestone': '描述你的里程碑',
    'Choose date...': '選擇日期...',
    'Due date': '截止日期',
    'Due date - Choose date...': '截止日期 - 選擇日期...',
    'Title cannot be empty': '標題不可空白',
    'Could not edit milestone': '無法編輯里程碑',
    'You do not have permission to create milestones in this repository.': '你沒有在此儲存庫中建立里程碑的權限。',
    'You do not have permission to edit milestones in this repository.': '你沒有在此儲存庫中編輯里程碑的權限。',

    // 删除
    'Permanently delete milestone': '永久刪除里程碑',
    'Once you delete this milestone you will not be able to see it again.': '刪除此里程碑後將無法再看到它。',
    'Deleting this milestone will not delete or close the associated issues.': '刪除此里程碑不會刪除或關閉關聯的議題。',
    'Delete milestone': '刪除里程碑',
    'Could not delete this milestone. Please try again.': '無法刪除此里程碑。請再試一次。',
    'Could not delete Milestone': '無法刪除里程碑',
    'Error deleting milestone': '刪除里程碑時發生錯誤',
  },
  scoped: {
    // 进度：<span>45%</span> complete、<span>3</span> open、<span>2</span> closed
    complete: '已完成',
    open: '個開放中',
    closed: '個已關閉',
    'Overdue by': '逾期',
    'contact support': '聯絡支援團隊',
    // 系统错误说明的后半句 + 链接 contact support
    'Try reloading the page, or if the problem persists': '請嘗試重新載入頁面，若問題持續發生，請',
  },
  regexp: [
    // 标签页标题片段：Milestone #3
    [/^Milestone #(\d+)$/, '里程碑 #$1'],
    // 截止日期：Due by October 26, 2026（选择器中可带“, 45% complete”或“, not started”）
    [
      new RegExp(`^Due by (${DATE_SOURCE})(?:, (\\d+)% complete|(, not started))?$`),
      (_, date, percent, notStarted) =>
        `${joinCjk(translateDate(date) ?? date, '截止')}${percent ? `，已完成 ${percent}%` : notStarted ? '，未開始' : ''}`,
    ],
    // 逾期：Overdue by 3 day(s)
    [/^Overdue by (\d+) (day|month|year)\(s\)$/, (_, count, unit) => `逾期 ${count} ${OVERDUE_UNIT[unit] ?? unit}`],
    // 议题计数：3/10 issues closed
    [/^(\d+)\/(\d+) issues closed$/, '已關閉 $1/$2 個議題'],
    // 进度百分比
    [/^(\d+)% complete$/, '已完成 $1%'],
    // 系统错误 + 「請嘗試重新載入頁面，若問題持續發生，請」 + 链接「聯絡支援團隊」
    [
      new RegExp(`^(${LOAD_ERROR_SOURCE}) Try reloading the page, or if the problem persists$`),
      (_, message) => `${LOAD_ERROR[message] ?? message}請嘗試重新載入頁面，若問題持續發生，請`,
    ],
  ],
  inline: [
    // 详情页状态行：Closed <relative-time>（未关闭时的 Last updated 由通用词典按片段翻译）；
    // 状态徽章 StateLabel 的 Closed 前是图标或没有元素，句型键不同，仍作「已關閉」
    ['Closed {}', '關閉於 {}'],
    // 议题侧栏与里程碑选择器的说明（MilestoneDescription）：Closed&nbsp;<relative-time>，
    // 侧栏带进度时后接「, 45% complete」
    [/^Closed \{\}, (\d+)% complete$/, '關閉於 {}，已完成 $1%'],
  ],
  ignore: [
    // 列表行中的里程碑描述、详情页的乐观更新描述与旧版标题
    'p[class*="listDescription__"]',
    '#milestone-description > p',
    '[class*="milestoneTitleWrapper__"] h2',
  ],
} satisfies PageDictionary
