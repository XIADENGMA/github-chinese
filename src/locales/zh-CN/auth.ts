import type { PageDictionary } from '../../core/types'
import login from './auth/login'
import oauth from './auth/oauth'
import signup from './auth/signup'
import twoFactor from './auth/two-factor'
import { mergeDictionaries } from './helpers'

/**
 * 登录与帐户安全：登录、通行密钥、第三方登录、双因素身份验证、设备验证与激活、sudo 确认、
 * OAuth 应用 / GitHub 应用授权、注册、电子邮件验证、找回密码、退出登录。
 */
export default mergeDictionaries(login, twoFactor, oauth, signup) satisfies PageDictionary
