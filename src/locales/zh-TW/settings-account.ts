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
 * 个人设定（/settings/…，以及同组件的 /account/… 升级、选择方案、付款历史记录）：左侧导览、公开个人档案（含时区下拉式选单）、
 * 帐号、外观、无障碍、通知设定、帐务和授权、电子邮件、密码和身分验证、工作阶段。其余设定页见 settings-developer。
 * 帐务页面与组织帐务共用，相关词条放 static；正则按顺序匹配，各文件的具体规则在前，通用计数规则在后。
 * 公开个人档案「Preferred spoken language」下拉式选单与热门页「Spoken Language」选单是同一份自然语言名（ISO 639-1），
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
  billing
) satisfies PageDictionary
