import type { PageDictionary, RegExpRule } from '../../../core/types'
import { DATE_SOURCE, MONTH_SOURCE, joinCjk, translateDate, translateTime } from '../helpers'

/** 日期单元格无障碍名称中的星期 */
const WEEKDAYS: Readonly<Record<string, string>> = {
  Monday: '星期一',
  Tuesday: '星期二',
  Wednesday: '星期三',
  Thursday: '星期四',
  Friday: '星期五',
  Saturday: '星期六',
  Sunday: '星期日',
}

/** 日期单元格无障碍名称的附注：Monday, October 26 (Today) (Maximum allowed date) */
const DAY_NOTES: Readonly<Record<string, string>> = {
  Today: '今天',
  'Start of selected range': '所选范围开始',
  'End of selected range': '所选范围结束',
  'Inside selected range': '在所选范围内',
  'Minimum allowed date': '允许的最早日期',
  'Maximum allowed date': '允许的最晚日期',
}

const WEEKDAY_SOURCE = Object.keys(WEEKDAYS).join('|')
const DAY_NOTE_SOURCE = Object.keys(DAY_NOTES).join('|')

function translateDayNotes(notes: string): string {
  return notes.replace(/ \(([^)]+)\)/g, (_, note: string) => `（${DAY_NOTES[note] ?? note}）`)
}

const regexp: readonly RegExpRule[] = [
  // 筛选按钮：所选日期范围（Oct 1 - Oct 26 / Dec 1, 2025 - Jan 5, 2026；只选了起点时为 Oct 1 -）
  [
    new RegExp(`^(${DATE_SOURCE}) - (${DATE_SOURCE})$`),
    (_, from: string, to: string) => `${translateTime(from)} - ${translateTime(to)}`,
  ],
  [new RegExp(`^(${DATE_SOURCE}) -$`), (_, from: string) => `${translateTime(from)} -`],
  // 日历：周行、日期单元格
  [/^Week (\d)$/, '第 $1 周'],
  [
    new RegExp(`^(${WEEKDAY_SOURCE}), (${MONTH_SOURCE} \\d{1,2})((?: \\((?:${DAY_NOTE_SOURCE})\\))*)$`),
    (_, weekday: string, date: string, notes: string) =>
      `${joinCjk(translateDate(date) ?? date, WEEKDAYS[weekday] ?? '')}${translateDayNotes(notes)}`,
  ],
  // 输入校验
  [new RegExp(`^Must be on or after (${DATE_SOURCE})$`), (_, date: string) => joinCjk('不能早于', translateTime(date))],
  [
    new RegExp(`^Must be on or before (${DATE_SOURCE})$`),
    (_, date: string) => joinCjk('不能晚于', translateTime(date)),
  ],
]

/**
 * 提交列表的日期范围选择器（All time 按钮展开的日历）：月份与年份选择、星期表头、日期单元格、
 * 起止日期输入框、清除 / 今天 / 应用按钮。与 projects 词典的日期选择器同一套译法。
 */
export default {
  scoped: {
    'Open date picker': '打开日期选择器',
    'Selected date': '所选日期',
    'Date Picker': '日期选择器',
    'Start date': '开始日期',
    'End date': '结束日期',
    'Go to month': '转到月份',
    'Go to year': '转到年份',
    'Go to previous month': '转到上个月',
    'Go to next month': '转到下个月',
    'Clear selected date': '清除所选日期',
    "Go to today's date": '转到今天',
    'Apply selection and close': '应用并关闭',
    'Invalid configuration': '配置无效',
    'Invalid selection': '选择无效',
    // 原文 like 前无逗号，译文改语序不加
    'Use arrow keys to select a date, or type a date like "Dec 28, 2020" or "12/28/2020".':
      '用方向键选择日期，或输入如“Dec 28, 2020”或“12/28/2020”的日期。',
    'Type a date, like "Dec 28, 2020" or "12/28/2020".': '输入日期，如“Dec 28, 2020”或“12/28/2020”。',
    'Select a date from the grid.': '从日历中选择日期。',
    'Select a start date from the grid.': '从日历中选择开始日期。',
    'Select an end date from the grid.': '从日历中选择结束日期。',
    // 月份下拉
    Jan: '1 月',
    Feb: '2 月',
    Mar: '3 月',
    Apr: '4 月',
    May: '5 月',
    Jun: '6 月',
    Jul: '7 月',
    Aug: '8 月',
    Sep: '9 月',
    Oct: '10 月',
    Nov: '11 月',
    Dec: '12 月',
    // 星期表头（可见缩写与无障碍名称）
    Su: '日',
    Mo: '一',
    Tu: '二',
    We: '三',
    Th: '四',
    Fr: '五',
    Sa: '六',
    Sunday: '星期日',
    Monday: '星期一',
    Tuesday: '星期二',
    Wednesday: '星期三',
    Thursday: '星期四',
    Friday: '星期五',
    Saturday: '星期六',
  },
  regexp,
} satisfies PageDictionary
