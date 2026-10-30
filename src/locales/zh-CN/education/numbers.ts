/**
 * 教育页统计数字的中文写法：原文用 K / M 缩写（200K、5M、2k+），译文按万、亿换算；
 * 不足一万时直接写数字（2K → 2000）。
 */

/** 千（K）：n 千 → 「2000」「20 万」「1.5 万」 */
export function thousands(count: string): string {
  const value = Number(count) * 1000
  return value >= 10000 ? `${value / 10000} 万` : String(value)
}

/** 百万（M / million）：n 百万 → 「500 万」「1 亿」 */
export function millions(count: string): string {
  const value = Number(count) * 1000000
  return value >= 100000000 ? `${value / 100000000} 亿` : `${value / 10000} 万`
}
