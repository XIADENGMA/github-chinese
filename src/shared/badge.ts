import { browser } from 'wxt/browser'
import { translateMessage } from '../i18n'
import { languageEnvironment } from './language-env'
import { resolveUiLanguage, type LanguageEnvironment } from './locale'
import type { Settings } from './settings'

/** 徽标背景色（Primer neutral emphasis） */
export const BADGE_COLOR = '#59636e'

/** 按总开关同步扩展图标徽标：停用显示「关」（随界面语言），启用清空 */
export async function syncBadge(
  settings: Pick<Settings, 'enabled' | 'uiLanguage'>,
  env: LanguageEnvironment = languageEnvironment(),
): Promise<void> {
  const action = browser.action as typeof browser.action | undefined
  // 不支持徽标的平台（如部分移动端）直接跳过
  if (typeof action?.setBadgeText !== 'function') return
  if (settings.enabled) {
    await action.setBadgeText({ text: '' })
    return
  }
  await action.setBadgeBackgroundColor({ color: BADGE_COLOR })
  await action.setBadgeText({ text: translateMessage(resolveUiLanguage(settings.uiLanguage, env), 'badgeOff') })
}
