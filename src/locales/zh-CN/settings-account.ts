import type { PageDictionary } from '../../core/types'
import spokenLanguages from './explore/languages'
import { mergeDictionaries } from './helpers'
import account from './settings-account/account'
import appearance from './settings-account/appearance'
import billing from './settings-account/billing'
import emails from './settings-account/emails'
import nav from './settings-account/nav'
import notificationSettings from './settings-account/notification-settings'
import plans from './settings-account/plans'
import profile from './settings-account/profile'
import security from './settings-account/security'
import sessions from './settings-account/sessions'
import timeZones from './settings-account/time-zones'

/**
 * 个人设置（/settings/…，以及同组件的 /account/… 升级、选择计划、付款历史）：左侧导航、公开个人资料（含时区下拉框）、帐户、外观、
 * 辅助功能、通知设置、计费和许可、电子邮件、密码和身份验证、会话。其余设置页见 settings-developer。
 * 计费页面与组织计费共用，相关词条放 static；正则按顺序匹配，各文件的具体规则在前，通用计数规则在后。
 * 公开个人资料「Preferred spoken language」下拉框与趋势页「Spoken Language」菜单是同一份自然语言名（ISO 639-1），
 * 直接合并 explore/languages，不重复收录。
 */
export default mergeDictionaries(
  nav,
  profile,
  timeZones,
  spokenLanguages,
  account,
  appearance,
  notificationSettings,
  emails,
  security,
  sessions,
  plans,
  billing,
) satisfies PageDictionary
