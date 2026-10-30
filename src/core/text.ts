const LATIN_RE = /[A-Za-z]/
const SPACE_RE = /\s+/g

/** 以全角标点（含破折号「——」）开头 / 结尾：全角标点两侧不留空白 */
export const FULL_PUNCT_START_RE = /^(?:[，。、；：？！（）《》「」『』“”‘’【】]|——)/
export const FULL_PUNCT_END_RE = /(?:[，。、；：？！（）《》「」『』“”‘’【】]|——)$/

/** 规范化：合并连续空白（含 NBSP）并去掉首尾空白 */
export function normalizeText(raw: string): string {
  return raw.replace(SPACE_RE, ' ').trim()
}

export function hasLatin(text: string): boolean {
  return LATIN_RE.test(text)
}
