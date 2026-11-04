import { pathSegments } from './page'
import type { PageKey } from './types'

/**
 * 未翻译文本收集：诊断用，仅测试启用（引擎与词典测试据此断言没有漏译），扩展运行时不收集。
 * 只收界面文字候选，排除网址、邮箱、版本号、哈希、@提及、#编号、路径、文件名、纯日期时间。
 * 输入应为规范化文本（见 normalizeText）。
 */

const DEFAULT_MAX_PENDING = 2000
const DEFAULT_MAX_LENGTH = 200

/** 文本出处：文本节点、可翻译属性（标签页标题不收集：标题含仓库名、议题标题等用户内容） */
export type UntranslatedKind = 'text' | 'attr'

/** 出处按位合并：text = 1，attr = 2 */
const UNTRANSLATED_KINDS: readonly UntranslatedKind[] = ['text', 'attr']

export function kindBit(kind: UntranslatedKind): number {
  return 1 << UNTRANSLATED_KINDS.indexOf(kind)
}

/**
 * 未翻译增量：[原文, 页面类型, 出处位, 出现次数, 页面数]。
 * 页面数：本批内该文本在几次页面访问中首次出现。
 */
export type UntranslatedDelta = readonly [text: string, page: PageKey, kinds: number, count: number, views: number]

/** 至少两个英文字母：test 比 match 全局计数快一个数量级 */
const TWO_LETTERS_RE = /[A-Za-z][^A-Za-z]*[A-Za-z]/
/** 含汉字：已译文字（如 Turbo 缓存克隆体里没有记录的译文）或中文用户内容 */
const HAN_RE = /\p{Script=Han}/u
const MONTH = '(?:jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)[a-z]*\\.?'
const WEEKDAY = '(?:mon|tue|wed|thu|fri|sat|sun)[a-z]*\\.?'
const CLOCK = '\\d{1,2}:\\d{2}(?::\\d{2})?(?:\\s?[ap]\\.?m\\.?)?'
const ZONE = '(?:(?:gmt|utc)(?:[+-]\\d{1,2}(?::?\\d{2})?)?|[a-z]{2,5})'
const CALENDAR = `(?:${MONTH} \\d{1,2}(?:st|nd|rd|th)?(?:,? \\d{4})?|\\d{1,2} ${MONTH},? \\d{4}|${MONTH},? \\d{4})`

const EXCLUDED_PATTERNS: readonly RegExp[] = [
  // 网址、域名
  /^(?:[a-z][a-z\d+.-]*:\/\/|www\.)\S+$/i,
  /^(?:[a-z\d-]+\.)+[a-z]{2,}(?::\d+)?(?:\/\S*)?$/i,
  // 邮箱
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  // 版本号：v1.2.3、1.2.3-beta.1
  /^v?\d+(?:\.\d+)+(?:[-+][\w.-]+)?$/i,
  // 提交哈希（至少含一位数字）
  /^(?=[\da-f]*\d)[\da-f]{7,64}$/i,
  // @提及、@组织/团队
  /^@[\w-]+(?:\/[\w.-]+)?$/,
  // #编号、owner/repo#编号、GH-123
  /^(?:[\w.-]+\/[\w.-]+)?#\d+$/,
  /^[A-Z]{2,10}-\d+$/,
  // 路径：owner/repo、/settings、src/a.ts、dir/
  /^[\w.@-]*(?:\/[\w.@-]+)+\/?$/,
  /^[\w.@-]+\/$/,
  // 文件名：package.json、README.md
  /^[\w@-]+(?:\.[\w-]+)*\.[a-z\d]{1,8}$/i,
  // 日期时间：Oct 26, 2026、Mon, Oct 26、2026-10-26T10:00:00Z、10:30 AM、Oct 26, 2026, 10:30 AM GMT+8
  new RegExp(`^(?:${WEEKDAY},? )?${CALENDAR}(?:,? (?:at )?${CLOCK})?(?: ${ZONE})?$`, 'i'),
  /^\d{4}-\d{2}-\d{2}(?:[t ]\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?(?:z|[+-]\d{2}:?\d{2})?)?$/i,
  new RegExp(`^${CLOCK}(?: ${ZONE})?$`, 'i'),
  // 密钥类：两步验证恢复码、TOTP 密钥（连续或四位一组）、长串字母数字混合（令牌、指纹）
  /^[\da-f]{5}-[\da-f]{5}$/i,
  /^[A-Z2-7]{16,}=*$/,
  /^(?=.*[2-7])(?:[a-z2-7]{4} ){3,}[a-z2-7]{4}$/i,
  /^(?=\S*\d)(?=\S*[a-z])\S{20,}$/i
]

/** 文本中只要出现就整条不收：令牌、密钥指纹、IP 地址、卡号尾号 */
const EXCLUDED_FRAGMENTS: readonly RegExp[] = [
  /\b(?:gh[pousr]|github_pat)_\w+/,
  /\bSHA256:[\w+/=]{16,}/,
  /\b\d{1,3}(?:\.\d{1,3}){3}\b/,
  // IPv6；也覆盖 MD5 指纹（16:27:ac:…）
  /\b[\da-f]{1,4}(?::[\da-f]{1,4}){3,7}\b/i,
  /\b[\da-f]{0,4}::[\da-f]{1,4}\b/i,
  // 卡号尾号：ending in 0000、•••• 0000
  /\bending in \d{4}\b/i,
  /•{2,}\s?\d{4}\b/
]

/** 句中邮箱：先查有没有 @ 再跑正则 */
const EMAIL_FRAGMENT_RE = /[^\s@]+@[^\s@]+\.[a-z]{2,}/i

/**
 * 不收集的页面：展示令牌、恢复码、密钥、邮箱、账单与支付信息、会话、审计日志、机密的页面，以及登录相关页。
 * 按规范化后的路径匹配（见 isSensitivePath）
 */
const SENSITIVE_PATHS: readonly RegExp[] = [
  // 个人、组织、企业设置（/settings、/organizations/<组织>/settings、/orgs/<组织>/settings、/enterprises/<企业>/settings）
  /^\/(?:(?:organizations|orgs|enterprises)\/[^/]+\/)?settings\/(?:auth|two_factor_authentication|security|security-log|sponsors-log|audit-log|sessions|tokens|personal-access-token(?:s|-requests)|keys|ssh|gpg|emails|billing|apps|applications|developers|installations|secrets|variables|credentials)(?:\/|$)/i,
  // 个人设置：Codespaces 机密、已授权的应用
  /^\/settings\/(?:codespaces|connections)(?:\/|$)/i,
  // 组织、企业：账单与授权、审计日志（不在 settings 下）；成员的 SSO 身份
  /^\/(?:organizations|orgs|enterprises)\/[^/]+\/(?:billing|licensing|enterprise_licensing|audit-log)(?:\/|$)/i,
  /^\/(?:orgs|enterprises)\/[^/]+\/people\/[^/]+\/sso(?:\/|$)/i,
  // 升级、结账、支付历史：内嵌账单与支付信息
  /^\/account\/(?:upgrade|billing)(?:\/|$)/i,
  /^\/marketplace\/[^/]+\/order(?:\/|$)/i,
  // Copilot 订阅：signup、pro/signup、business_signup、free_signup 等
  /^\/github-copilot\/(?:[^/]+\/)?[\w-]*signup(?:\/|$)/i,
  // 赞助：结账页；赞助者仪表板（收款、私密赞助者、Webhook 投递）
  /^\/sponsors\/[^/]+\/(?:sponsorships|dashboard)(?:\/|$)/i,
  // 仓库设置：密钥与变量、部署密钥、Webhook、环境
  /^\/[^/]+\/[^/]+\/settings\/(?:secrets|variables|keys|hooks|environments)(?:\/|$)/i,
  // 机密扫描警报：可能显示泄露的密钥值
  /^\/[^/]+\/[^/]+\/security\/secret-scanning(?:\/|$)/i,
  /^\/(?:orgs|enterprises)\/[^/]+\/security\/alerts\/secret-scanning(?:\/|$)/i,
  // 登录、注册（含邮箱验证）、找回密码、会话
  /^\/(?:login|logout|session|sessions|password_reset|signup|join|account_verifications)(?:\/|$)/i
]

/** 末段的格式后缀：GitHub 按 /login(.:format) 这类路由应答，/login.html 也是登录页 */
const FORMAT_SUFFIX_RE = /\.[a-z\d]+$/

/**
 * 地址先规范化：拆段同 detectPages（去掉空段、逐段解码并转小写），解码出的 /（%2F）再拆段，
 * 然后去掉末段的格式后缀。原始路径也匹配。只会多判、不会漏判
 */
export function isSensitivePath(pathname: string): boolean {
  const segments = pathSegments(pathname).flatMap(segment => segment.split('/').filter(Boolean))
  const normalized = `/${segments.join('/')}`.replace(FORMAT_SUFFIX_RE, '')
  return SENSITIVE_PATHS.some(pattern => pattern.test(normalized) || pattern.test(pathname))
}

/** 是否值得收集：含至少两个英文字母、不含汉字、不超长、不是技术记号、日期或密钥类内容 */
export function isCollectable(text: string, maxLength = DEFAULT_MAX_LENGTH): boolean {
  if (!text || text.length > maxLength) return false
  if (!TWO_LETTERS_RE.test(text) || HAN_RE.test(text)) return false
  return (
    !EXCLUDED_PATTERNS.some(pattern => pattern.test(text)) &&
    !EXCLUDED_FRAGMENTS.some(pattern => pattern.test(text)) &&
    !(text.includes('@') && EMAIL_FRAGMENT_RE.test(text))
  )
}

export interface UntranslatedBuffer {
  /** 记录一次出现；不值得收集的文本、待取出已满时的新条目忽略 */
  add(text: string, kind: UntranslatedKind, page: PageKey): void
  /** 新的页面访问开始：之后再出现的文本重新计入页面数 */
  startVisit(): void
  /** 取出全部增量并清空 */
  drain(): UntranslatedDelta[]
  /** 丢弃待取出的增量与本次访问记录 */
  clear(): void
}

export interface BufferOptions {
  readonly maxPending?: number
  readonly maxLength?: number
}

interface PendingDelta {
  readonly text: string
  readonly page: PageKey
  kinds: number
  count: number
  views: number
}

export function createUntranslatedBuffer(options: BufferOptions = {}): UntranslatedBuffer {
  const maxPending = options.maxPending ?? DEFAULT_MAX_PENDING
  const maxLength = options.maxLength ?? DEFAULT_MAX_LENGTH
  /** 页面类型 + 原文 → 增量（规范化文本不含换行，可作分隔符） */
  const pending = new Map<string, PendingDelta>()
  /** 本次页面访问中已计入页面数的文本 */
  const visit = new Set<string>()

  function entryOf(text: string, page: PageKey): PendingDelta | undefined {
    const key = `${page}\n${text}`
    const existing = pending.get(key)
    if (existing || pending.size >= maxPending) return existing
    const created: PendingDelta = { text, page, kinds: 0, count: 0, views: 0 }
    pending.set(key, created)
    return created
  }

  return {
    add(text, kind, page) {
      if (!isCollectable(text, maxLength)) return
      const entry = entryOf(text, page)
      if (!entry) return
      entry.kinds |= kindBit(kind)
      entry.count += 1
      if (visit.has(text)) return
      visit.add(text)
      entry.views += 1
    },
    startVisit() {
      visit.clear()
    },
    drain() {
      const deltas = [...pending.values()].map((entry): UntranslatedDelta => [
        entry.text,
        entry.page,
        entry.kinds,
        entry.count,
        entry.views
      ])
      pending.clear()
      return deltas
    },
    clear() {
      pending.clear()
      visit.clear()
    }
  }
}
