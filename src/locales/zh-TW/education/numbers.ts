/**
 * 教育页统计数字的中文写法：原文用 K / M 缩写（200K、5M、2k+），译文按「萬」「億」换算；
 * 不足一万时直接写数字（2K → 2000）。
 */

/** 千（K）：n 千 → 「2000」「20 萬」「1.5 萬」 */
export function thousands(count: string): string {
  const value = Number(count) * 1000
  return value >= 10000 ? `${value / 10000} 萬` : String(value)
}

/** 百万（M / million）：n 百万 → 「500 萬」「1 億」 */
export function millions(count: string): string {
  const value = Number(count) * 1000000
  return value >= 100000000 ? `${value / 100000000} 億` : `${value / 10000} 萬`
}
