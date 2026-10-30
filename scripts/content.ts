/** 明显是用户内容、标识符或数据的文本：覆盖率统计与用户采集数据整理共用 */

const MONTH =
  '(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|June?|July?|Aug(?:ust)?|Sep(?:t(?:ember)?)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)'
/** 带年份的日期：Oct 26, 2026 / 26 Oct 2026 / 2026-10-26 */
const DATE = `(?:${MONTH}\\.? \\d{1,2}(?:st|nd|rd|th)?,? \\d{4}|\\d{1,2} ${MONTH},? \\d{4}|\\d{4}-\\d{2}-\\d{2})`
/** 时刻：8:33 AM GMT+8 / 20:10 / 07:59:30 UTC */
const CLOCK = '\\d{1,2}:\\d{2}(?::\\d{2})?(?: ?[AP]M)?(?: (?:GMT|UTC)(?:[+-]\\d{1,2}(?::?\\d{2})?)?)?'

const CONTENT_PATTERNS: readonly RegExp[] = [
  // 链接、邮箱、域名（可带路径）
  /^https?:\/\//i,
  /^[\w.+-]+@[\w-]+\.[\w.]+$/,
  /^(?:[\w-]+\.)+[a-z]{2,}\/\S*$/i,
  // 版本号、文件名
  /^v?\d+(?:\.\d+)+(?:[-+][\w.]+)?$/i,
  /^[\w.-]+\.[a-z0-9]{1,8}$/i,
  // 提交 SHA 与比较范围：1e1a7ca、• 0ff253b…ca03482
  /^(?:• )?[0-9a-f]{7,40}(?:(?:\.{2,3}|…)[0-9a-f]{7,40})?$/i,
  // 镜像 / 软件包摘要：sha256:…、sha256-…、sha-…
  /^sha\d*[:-][0-9a-f]{7,}$/i,
  // 安全公告编号
  /^(?:CVE-\d{4}-\d{4,}|GHSA(?:-[0-9a-z]{4}){3})$/i,
  // @用户、#编号、owner/repo#编号
  /^[@#]\S+$/,
  /^[\w.-]+\/[\w.-]+#\d+$/,
  // 路径、owner/repo、owner/ 前缀
  /^[\w.-]+(?:\/[\w.-]+)+\/?$/,
  /^[\w.-]+ ?\/$/,
  // 冒号连接的标识符：owner:branch、sha256:…
  /^\S+:\S+$/,
  // 时间戳：Oct 26, 2026, 8:33 AM GMT+8、on Oct 19, 2026、October 26, 2026 02:31、23 Oct 07:59、Today at 2:45 PM
  new RegExp(`^(?:on )?${DATE}(?:,? (?:at )?${CLOCK})?$`, 'i'),
  new RegExp(`^${MONTH} \\d{1,2},? (?:at )?${CLOCK}$`, 'i'),
  new RegExp(`^\\d{1,2} ${MONTH},? ${CLOCK}$`, 'i'),
  new RegExp(`^(?:Today|Yesterday) at ${CLOCK}$`, 'i'),
  // 语言占比：TypeScript 96.4%、C: 97.9%
  /^[\p{L}\p{N}][\p{L}\p{N} #+.'-]*:? \d{1,3}(?:\.\d+)?%$/u,
  // 计数与大小：9.7k、11.6M、13.5 MB、$40M+、4.2K+
  /^\$?\d[\d.,]*\s?[kKmMbB]\+?$/,
  /^\d[\d.,]*\s?(?:[KMGTP]i?B|bytes?)$/i,
  // 列表行 aria-label：「<标题>. More information available below.」
  /\. More information available below\.$/,
]

/** 明显是用户内容、标识符或数据（时间戳、语言占比等）的文本，不计入覆盖率 */
export function isLikelyContent(text: string): boolean {
  return CONTENT_PATTERNS.some((pattern) => pattern.test(text))
}
