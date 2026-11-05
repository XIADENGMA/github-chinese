/**
 * 时间格式：时间本地化开启时，时间元素（<relative-time> 等）默认按翻译语言渲染（3 天前、2026 年 10 月 26 日）；
 * 选「自定义」时按写法显示具体时刻（见 core/time-text）。写法同 Day.js 的 format：
 * YYYY / YY 年，M / MM 月（MMM 为「1月」，MMMM 为「一月」），D / DD 日，d 星期（0–6，周日为 0；dd「一」，ddd「周一」，dddd「星期一」），
 * H / HH 时（24 小时制），h / hh 时（12 小时制），A / a 上午、下午，m / mm 分，s / ss 秒，SSS 毫秒，Z / ZZ 与 UTC 的偏移（+08:00 / +0800）；
 * [] 内原样输出，其余字符原样保留
 */

/** 时间格式：default 为元素按翻译语言渲染，custom 按自定义写法 */
export type TimeFormatMode = 'default' | 'custom'

export const TIME_FORMAT_MODES: readonly TimeFormatMode[] = ['default', 'custom']

/** 自定义写法的默认值 */
export const DEFAULT_CUSTOM_TIME_FORMAT = 'YYYY-MM-DD HH:mm'

/** 自定义写法最多多少个字符 */
export const TIME_FORMAT_MAX_LENGTH = 64

export function isTimeFormatMode(value: unknown): value is TimeFormatMode {
  return (TIME_FORMAT_MODES as readonly unknown[]).includes(value)
}

/** 规范化写法：不是字符串时为默认写法；去掉首尾空白，超出最多字符数的截去（不拆开代理对） */
export function sanitizeTimeFormat(value: unknown): string {
  if (typeof value !== 'string') return DEFAULT_CUSTOM_TIME_FORMAT
  const characters = [...value.trim()]
  return characters.length > TIME_FORMAT_MAX_LENGTH ? characters.slice(0, TIME_FORMAT_MAX_LENGTH).join('') : characters.join('')
}

/** 时间元素用的写法：自定义且写法不为空时为写法（去掉首尾空白），否则为空串（按默认渲染） */
export function activeTimeFormat(mode: TimeFormatMode, pattern: string): string {
  return mode === 'custom' ? pattern.trim() : ''
}

export interface TimeFormatOptions {
  /** 翻译语言（zh-CN / zh-TW）：星期的简称简体为「周一」，繁体为「週一」；默认 zh-CN */
  readonly lang?: string
  /** IANA 时区（元素设了 time-zone 时）；不设或无效时按浏览器本地时区 */
  readonly timeZone?: string
}

/** 某时刻的各部分（按某个时区） */
interface TimeParts {
  readonly year: number
  /** 1–12 */
  readonly month: number
  readonly day: number
  /** 0–6，周日为 0 */
  readonly weekday: number
  /** 0–23 */
  readonly hour: number
  readonly minute: number
  readonly second: number
  readonly millisecond: number
  /** 与 UTC 的偏移（分钟，东正西负） */
  readonly offset: number
}

/** 写法里的记号；[] 内原样输出（与 Day.js 相同，[] 内至少一个字符） */
const TOKEN_RE = /\[([^\]]+)]|YYYY|YY|MMMM|MMM|MM|M|DD|D|dddd|ddd|dd|d|HH|H|hh|h|mm|m|ss|s|SSS|A|a|ZZ|Z/g
const WEEKDAY_NAMES = ['日', '一', '二', '三', '四', '五', '六']
const MONTH_NAMES = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月']
/** Intl 按 en-US 写出的星期简称 → 0–6 */
const EN_WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

/** 各时区的格式器（无效时区为 null） */
const zoneFormats = new Map<string, Intl.DateTimeFormat | null>()

function zoneFormat(timeZone: string): Intl.DateTimeFormat | null {
  let format = zoneFormats.get(timeZone)
  if (format === undefined) {
    try {
      format = new Intl.DateTimeFormat('en-US', {
        timeZone,
        hourCycle: 'h23',
        weekday: 'short',
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric'
      })
    } catch {
      format = null
    }
    zoneFormats.set(timeZone, format)
  }
  return format
}

function localParts(date: Date): TimeParts {
  return {
    year: date.getFullYear(),
    month: date.getMonth() + 1,
    day: date.getDate(),
    weekday: date.getDay(),
    hour: date.getHours(),
    minute: date.getMinutes(),
    second: date.getSeconds(),
    millisecond: date.getMilliseconds(),
    offset: -date.getTimezoneOffset()
  }
}

/** 按时区取各部分；时区无效时为 undefined */
function zonedParts(date: Date, timeZone: string): TimeParts | undefined {
  const format = zoneFormat(timeZone)
  if (!format) return undefined
  const values: Partial<Record<Intl.DateTimeFormatPartTypes, string>> = {}
  for (const part of format.formatToParts(date)) values[part.type] = part.value
  const year = Number(values.year)
  const month = Number(values.month)
  const day = Number(values.day)
  // 个别实现把午夜写作 24
  const hour = Number(values.hour) % 24
  const minute = Number(values.minute)
  const second = Number(values.second)
  const millisecond = date.getUTCMilliseconds()
  const wall = Date.UTC(year, month - 1, day, hour, minute, second, millisecond)
  return {
    year,
    month,
    day,
    weekday: EN_WEEKDAYS.indexOf(values.weekday ?? ''),
    hour,
    minute,
    second,
    millisecond,
    offset: Math.round((wall - date.getTime()) / 60_000)
  }
}

function pad(value: number, length = 2): string {
  return String(value).padStart(length, '0')
}

/** 偏移写成 +08:00（separator 为空时 +0800） */
function offsetText(offset: number, separator: string): string {
  const sign = offset < 0 ? '-' : '+'
  const minutes = Math.abs(offset)
  return `${sign}${pad(Math.floor(minutes / 60))}${separator}${pad(minutes % 60)}`
}

function tokenValue(token: string, parts: TimeParts, lang: string): string {
  switch (token) {
    case 'YYYY':
      return pad(parts.year, 4)
    case 'YY':
      return pad(parts.year % 100)
    case 'MMMM':
      return MONTH_NAMES[parts.month - 1] ?? ''
    case 'MMM':
      return `${parts.month}月`
    case 'MM':
      return pad(parts.month)
    case 'M':
      return String(parts.month)
    case 'DD':
      return pad(parts.day)
    case 'D':
      return String(parts.day)
    case 'dddd':
      return `星期${WEEKDAY_NAMES[parts.weekday] ?? ''}`
    case 'ddd':
      return `${lang === 'zh-TW' ? '週' : '周'}${WEEKDAY_NAMES[parts.weekday] ?? ''}`
    case 'dd':
      return WEEKDAY_NAMES[parts.weekday] ?? ''
    case 'd':
      return String(parts.weekday)
    case 'HH':
      return pad(parts.hour)
    case 'H':
      return String(parts.hour)
    case 'hh':
      return pad(parts.hour % 12 || 12)
    case 'h':
      return String(parts.hour % 12 || 12)
    case 'A':
    case 'a':
      return parts.hour < 12 ? '上午' : '下午'
    case 'mm':
      return pad(parts.minute)
    case 'm':
      return String(parts.minute)
    case 'ss':
      return pad(parts.second)
    case 's':
      return String(parts.second)
    case 'SSS':
      return pad(parts.millisecond, 3)
    case 'ZZ':
      return offsetText(parts.offset, '')
    default:
      return offsetText(parts.offset, ':')
  }
}

/** 按写法写出 time（毫秒）时刻；时刻无效时为空串 */
export function formatTime(pattern: string, time: number, options: TimeFormatOptions = {}): string {
  if (!Number.isFinite(time)) return ''
  const date = new Date(time)
  const parts = (options.timeZone ? zonedParts(date, options.timeZone) : undefined) ?? localParts(date)
  const lang = options.lang ?? 'zh-CN'
  return pattern.replace(TOKEN_RE, (token: string, literal: string | undefined) => literal ?? tokenValue(token, parts, lang))
}
