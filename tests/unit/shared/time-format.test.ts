import { describe, expect, it } from 'vitest'
import {
  activeTimeFormat,
  DEFAULT_CUSTOM_TIME_FORMAT,
  formatTime,
  isTimeFormatMode,
  sanitizeTimeFormat,
  TIME_FORMAT_MAX_LENGTH
} from '../../../src/shared/time-format'

/** 2026-10-07 07:06:05.042 UTC：本地（测试时区 GMT+8）为 2026 年 10 月 7 日星期三 15:06:05 */
const AFTERNOON = Date.parse('2026-10-07T07:06:05.042Z')
/** 本地 2026 年 1 月 5 日星期一 09:03:04（上午） */
const MORNING = Date.parse('2026-01-05T01:03:04Z')

describe('isTimeFormatMode', () => {
  it.each([
    ['default', true],
    ['custom', true],
    ['auto', false],
    [undefined, false],
    [1, false]
  ])('%s → %s', (value, expected) => {
    expect(isTimeFormatMode(value)).toBe(expected)
  })
})

describe('sanitizeTimeFormat', () => {
  it('不是字符串：默认写法', () => {
    expect(sanitizeTimeFormat(undefined)).toBe(DEFAULT_CUSTOM_TIME_FORMAT)
    expect(sanitizeTimeFormat(42)).toBe(DEFAULT_CUSTOM_TIME_FORMAT)
  })

  it('去掉首尾空白；空串保留', () => {
    expect(sanitizeTimeFormat('  YYYY-MM-DD  ')).toBe('YYYY-MM-DD')
    expect(sanitizeTimeFormat('   ')).toBe('')
  })

  it(`超过 ${TIME_FORMAT_MAX_LENGTH} 个字符时截断（不拆开代理对）`, () => {
    expect(sanitizeTimeFormat('Y'.repeat(TIME_FORMAT_MAX_LENGTH + 5))).toBe('Y'.repeat(TIME_FORMAT_MAX_LENGTH))
    const emoji = '😀'.repeat(TIME_FORMAT_MAX_LENGTH + 1)
    expect([...sanitizeTimeFormat(emoji)]).toHaveLength(TIME_FORMAT_MAX_LENGTH)
  })
})

describe('activeTimeFormat', () => {
  it('自定义且写法非空时为写法，否则按默认（空串）', () => {
    expect(activeTimeFormat('custom', 'YYYY-MM-DD')).toBe('YYYY-MM-DD')
    expect(activeTimeFormat('custom', '  HH:mm ')).toBe('HH:mm')
    expect(activeTimeFormat('custom', '   ')).toBe('')
    expect(activeTimeFormat('default', 'YYYY-MM-DD')).toBe('')
  })
})

describe('formatTime', () => {
  it.each<[string, number, string]>([
    ['YYYY-MM-DD HH:mm:ss', AFTERNOON, '2026-10-07 15:06:05'],
    ['YYYY-MM-DD HH:mm', MORNING, '2026-01-05 09:03'],
    ['YY/M/D H:m:s', MORNING, '26/1/5 9:3:4'],
    ['YYYY 年 M 月 D 日', AFTERNOON, '2026 年 10 月 7 日'],
    ['hh:mm A', AFTERNOON, '03:06 下午'],
    ['h:mm a', MORNING, '9:03 上午'],
    ['h', Date.parse('2026-01-04T16:00:00Z'), '12'],
    ['dddd', AFTERNOON, '星期三'],
    ['ddd', AFTERNOON, '周三'],
    ['dd', MORNING, '一'],
    ['d', Date.parse('2026-01-04T04:00:00Z'), '0'],
    ['MMMM', AFTERNOON, '十月'],
    ['MMM', MORNING, '1月'],
    ['SSS', AFTERNOON, '042'],
    ['Z', AFTERNOON, '+08:00'],
    ['ZZ', AFTERNOON, '+0800']
  ])('%s → %s', (pattern, time, expected) => {
    expect(formatTime(pattern, time)).toBe(expected)
  })

  it('[] 内原样输出，其余不认识的字符原样保留', () => {
    expect(formatTime('[YYYY 年] YYYY [MM]', AFTERNOON)).toBe('YYYY 年 2026 MM')
    expect(formatTime('更新于 YYYY.MM.DD', AFTERNOON)).toBe('更新于 2026.10.07')
    expect(formatTime('[]', AFTERNOON)).toBe('[]')
  })

  it('繁体：星期的简称用「週」', () => {
    expect(formatTime('ddd', AFTERNOON, { lang: 'zh-TW' })).toBe('週三')
    expect(formatTime('dddd A', AFTERNOON, { lang: 'zh-TW' })).toBe('星期三 下午')
  })

  it('按给定时区写出（含跨日与偏移）；时区无效时按本地', () => {
    expect(formatTime('YYYY-MM-DD HH:mm Z ddd', AFTERNOON, { timeZone: 'America/Los_Angeles' })).toBe('2026-10-07 00:06 -07:00 周三')
    expect(formatTime('YYYY-MM-DD HH:mm ZZ', AFTERNOON, { timeZone: 'Asia/Kolkata' })).toBe('2026-10-07 12:36 +0530')
    expect(formatTime('YYYY-MM-DD HH:mm:ss.SSS', AFTERNOON, { timeZone: 'UTC' })).toBe('2026-10-07 07:06:05.042')
    expect(formatTime('D HH:mm', Date.parse('2026-10-06T23:30:00Z'), { timeZone: 'Asia/Tokyo' })).toBe('7 08:30')
    expect(formatTime('HH:mm Z', AFTERNOON, { timeZone: 'Not/AZone' })).toBe('15:06 +08:00')
  })

  it('时刻无效：空串', () => {
    expect(formatTime('YYYY', Number.NaN)).toBe('')
  })
})
