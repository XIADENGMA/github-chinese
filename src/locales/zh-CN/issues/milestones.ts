import type { PageDictionary } from '../../../core/types'
import { DATE_SOURCE, joinCjk, translateDate } from '../helpers'

/** 逾期时长单位（MilestoneDate 的 day(s) / month(s) / year(s)） */
const OVERDUE_UNIT: Readonly<Record<string, string>> = { day: '天', month: '个月', year: '年' }

/** 系统错误说明（后接“Try reloading the page, or if the problem persists” + 链接 contact support） */
const LOAD_ERROR: Readonly<Record<string, string>> = {
  'Milestones cannot be loaded due to a system error.': '系统错误，无法加载里程碑。',
  'This milestone cannot be loaded due to a system error.': '系统错误，无法加载此里程碑。',
  'This page cannot be loaded due to a system error.': '系统错误，无法加载此页面。',
  "This milestone's issues can not be loaded due to a system error.": '系统错误，无法加载此里程碑的议题。',
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
    'New milestone': '新建里程碑',
    // 新建页的标签页标题
    'New Milestone': '新建里程碑',
    'Milestone menu': '里程碑菜单',
    'Furthest due date': '截止日期最远',
    'Closest due date': '截止日期最近',
    'Least complete': '完成度最低',
    'Most complete': '完成度最高',
    Alphabetical: '按字母顺序',
    'Reverse alphabetical': '按字母倒序',
    'Most issues': '议题最多',
    'Fewest issues': '议题最少',
    'You haven’t created any Milestones.': '你还没有创建里程碑。',
    "You haven't created any Milestones.": '你还没有创建里程碑。',
    'Use Milestones to create collections of Issues and Pull Requests for a particular release or project.':
      '使用里程碑为特定的发行版或项目归集议题和拉取请求。',
    'Create a milestone': '创建里程碑',
    'We couldn’t find anything!': '什么也没找到！',
    "We couldn't find anything!": '什么也没找到！',
    "There aren't any milestones that match. Give it another shot above.": '没有匹配的里程碑。请在上方重新搜索。',
    'There aren’t any milestones that match. Give it another shot above.': '没有匹配的里程碑。请在上方重新搜索。',
    'Milestones cannot be loaded.': '无法加载里程碑。',
    'Milestone cannot be loaded.': '无法加载里程碑。',
    'Could not load page': '无法加载页面',
    // 系统错误说明（与后半句被元素隔开时单独匹配）
    ...LOAD_ERROR,

    // 详情页
    'Back to milestones': '返回里程碑',
    'Back to Milestones': '返回里程碑',
    'More milestone actions': '更多里程碑操作',
    'Milestone issues': '里程碑议题',
    'Close milestone': '关闭里程碑',
    'Reopen milestone': '重新打开里程碑',
    'Close Milestone': '关闭里程碑',
    'Reopen Milestone': '重新打开里程碑',
    'Closing milestone.': '正在关闭里程碑。',
    'Reopening milestone.': '正在重新打开里程碑。',
    'Milestone closed.': '里程碑已关闭。',
    'Milestone reopened.': '里程碑已重新打开。',
    'Could not change Milestone state': '无法更改里程碑状态',
    'There are no open issues in this milestone': '此里程碑中没有打开的议题',
    'There are no closed issues in this milestone': '此里程碑中没有已关闭的议题',
    'Failed to load issues.': '加载议题失败。',
    'Failed to refresh issues. Please try again.': '刷新议题失败。请重试。',
    'Unable to refresh milestone issues.': '无法刷新里程碑议题。',
    'Unable to load more issues.': '无法加载更多议题。',
    'More issues loaded.': '已加载更多议题。',
    'Failed to reorder milestone item. Please try again.': '调整里程碑条目顺序失败。请重试。',
    'Milestone changes could not be saved': '无法保存里程碑更改',
    'Your draft has been kept. Check your connection and try again.': '草稿已保留。请检查网络连接后重试。',
    'Edit and retry': '编辑并重试',
    'Saving milestone changes.': '正在保存里程碑更改。',
    'Milestone changes saved.': '里程碑更改已保存。',

    // 新建 / 编辑
    'Create milestone': '创建里程碑',
    'Edit milestone': '编辑里程碑',
    'Create a new milestone to help organize your issues and pull requests. Learn more about':
      '创建新的里程碑来组织议题和拉取请求。了解',
    'Create a new milestone to help organize your issues and pull requests.': '创建新的里程碑来组织议题和拉取请求。',
    'milestones and issues': '里程碑和议题',
    'Milestone name': '里程碑名称',
    'Describe your milestone': '描述你的里程碑',
    'Choose date...': '选择日期...',
    'Due date': '截止日期',
    'Due date - Choose date...': '截止日期 - 选择日期...',
    'Title cannot be empty': '标题不能为空',
    'Could not edit milestone': '无法编辑里程碑',
    'You do not have permission to create milestones in this repository.': '你没有在此存储库中创建里程碑的权限。',
    'You do not have permission to edit milestones in this repository.': '你没有在此存储库中编辑里程碑的权限。',

    // 删除
    'Permanently delete milestone': '永久删除里程碑',
    'Once you delete this milestone you will not be able to see it again.': '删除后将无法再看到此里程碑。',
    'Deleting this milestone will not delete or close the associated issues.': '删除此里程碑不会删除或关闭关联的议题。',
    'Delete milestone': '删除里程碑',
    'Could not delete this milestone. Please try again.': '无法删除此里程碑。请重试。',
    'Could not delete Milestone': '无法删除里程碑',
    'Error deleting milestone': '删除里程碑时出错',
  },
  scoped: {
    // 进度：<span>45%</span> complete、<span>3</span> open、<span>2</span> closed
    complete: '已完成',
    open: '个打开的',
    closed: '个已关闭的',
    'Overdue by': '逾期',
    'contact support': '联系支持',
    // 系统错误说明的后半句 + 链接 contact support
    'Try reloading the page, or if the problem persists': '请尝试重新加载页面；仍然出错时请',
  },
  regexp: [
    // 标签页标题片段：Milestone #3
    [/^Milestone #(\d+)$/, '里程碑 #$1'],
    // 截止日期：Due by October 26, 2026（选择器中可带“, 45% complete”或“, not started”）
    [
      new RegExp(`^Due by (${DATE_SOURCE})(?:, (\\d+)% complete|(, not started))?$`),
      (_, date, percent, notStarted) =>
        `${joinCjk(translateDate(date) ?? date, '截止')}${percent ? `，已完成 ${percent}%` : notStarted ? '，未开始' : ''}`,
    ],
    // 逾期：Overdue by 3 day(s)
    [/^Overdue by (\d+) (day|month|year)\(s\)$/, (_, count, unit) => `逾期 ${count} ${OVERDUE_UNIT[unit] ?? unit}`],
    // 议题计数：3/10 issues closed
    [/^(\d+)\/(\d+) issues closed$/, '已关闭 $1/$2 个议题'],
    // 进度百分比
    [/^(\d+)% complete$/, '已完成 $1%'],
    // 系统错误 + “请尝试重新加载页面；仍然出错时请” + 链接“联系支持”
    [
      new RegExp(`^(${LOAD_ERROR_SOURCE}) Try reloading the page, or if the problem persists$`),
      (_, message) => `${LOAD_ERROR[message] ?? message}请尝试重新加载页面；仍然出错时请`,
    ],
  ],
  inline: [
    // 详情页状态行：Closed <relative-time>（未关闭时的 Last updated 由通用词典按片段翻译）；
    // 状态徽章 StateLabel 的 Closed 前是图标或没有元素，句型键不同，仍作“已关闭”
    ['Closed {}', '关闭于 {}'],
    // 议题侧栏与里程碑选择器的说明（MilestoneDescription）：Closed&nbsp;<relative-time>，
    // 侧栏带进度时后接“, 45% complete”
    [/^Closed \{\}, (\d+)% complete$/, '关闭于 {}，已完成 $1%'],
  ],
  ignore: [
    // 列表行中的里程碑描述、详情页的乐观更新描述与旧版标题
    'p[class*="listDescription__"]',
    '#milestone-description > p',
    '[class*="milestoneTitleWrapper__"] h2',
  ],
} satisfies PageDictionary
