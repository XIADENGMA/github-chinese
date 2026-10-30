import { lookupTable } from '../../../core/table'
import type { PageDictionary } from '../../../core/types'
import regions from '../common/regions'
import { joinCjk, TIME_SOURCE, translateTime } from '../helpers'

const regionText = lookupTable(regions.static)

/** 国家/地区名的译名（common/regions）；未收录的地点保留英文原文，两侧加空格 */
function regionName(location: string): string {
  return regionText(location) ?? ` ${location} `
}

/** 会话设备描述中的浏览器与操作系统：“Chrome on Windows 10” */
const BROWSER_SOURCE =
  '(Chrome|Chromium|Firefox|Safari|Mobile Safari|Edge|Microsoft Edge|Opera|Brave|Vivaldi|Samsung Internet|Yandex|Electron|GitHub Desktop|GitHub Mobile)'
const OS_SOURCE = '(Windows|macOS|Mac OS X|OS X|Linux|Ubuntu|Fedora|Debian|Android|iOS|iPadOS|Chrome OS|ChromeOS)'
const VERSION_SOURCE = '( \\d+(?:[._]\\d+)*)?'

/** 作为“浏览器”出现的 GitHub 客户端名按用户规定译成中文；浏览器名保留原文 */
const CLIENT_NAMES: Readonly<Record<string, string>> = {
  'GitHub Desktop': 'GitHub 桌面版',
  'GitHub Mobile': 'GitHub 行動版',
}

/**
 * 会话（/settings/sessions）：网页会话、GitHub Mobile 会话；会话详细信息页（/settings/sessions/<id>）。
 * 时间多在 <relative-time> 中，前缀按片段收录；时间是纯文本时由正则整句处理。
 * 「Session details」「View all sessions」「Revoke」由其他词典 static 收录，「Never used」由 settings-developer 收录。
 * 产品名按用户规定译成中文：GitHub Mobile → GitHub 行動版。session 译作「工作階段」（GLOSSARY.zh-TW 繁体补充）。
 */
export default {
  static: {
    // 网页会话
    'Web sessions': '網頁工作階段',
    'This is a list of devices that have logged into your account. Revoke any sessions that you do not recognize.':
      '這是曾登入你帳號的裝置清單。撤銷任何你不認得的工作階段。',
    'Your current session': '你目前的工作階段',
    'Last accessed on': '上次存取於',

    // GitHub Mobile 会话：说明被 “revoke” 链接拆开
    'GitHub Mobile sessions': 'GitHub 行動版工作階段',
    'This is a list of devices that have logged into your account via the GitHub Mobile app. Revoke any session that you do not recognize or you can':
      '這是曾透過 GitHub 行動版應用程式登入你帳號的裝置清單。撤銷任何你不認得的工作階段，或',
    'your GitHub Mobile app authorization to sign out of all your devices.':
      '你的 GitHub 行動版應用程式授權以登出所有裝置。',
    'GitHub Mobile can be used to verify your identity when signing in from a new device and as a two-factor authentication method.':
      'GitHub 行動版可用於在新裝置登入時驗證你的身分，也可作為雙重驗證方式。',
    'Learn more about authentication with GitHub Mobile.': '瞭解如何使用 GitHub 行動版驗證身分。',
    // 「To get started, install GitHub Mobile for <a>iOS</a> or <a>Android</a> and sign in to your account.」
    'To get started, install GitHub Mobile for': '若要開始使用，請安裝適用於',
    'and sign in to your account.': '的 GitHub 行動版並登入你的帳號。',
    'Registered -': '註冊於',
    'Last accessed -': '上次存取於',
    // 其后是时间元素或「Never used」：分隔符「-」照原文保留，「上次用於身分驗證 - 從未使用」
    'Last used for authentication -': '上次用於身分驗證 -',

    // 会话详细信息
    'Revoke session': '撤銷工作階段',
    'Device:': '裝置：',
    'Last location:': '上次位置：',
    'Signed in:': '登入時間：',
  },
  scoped: {
    revoke: '撤銷',
    // 会话状态指示（aria-label / title）
    active: '活躍',
    stale: '閒置',
  },
  regexp: [
    [
      new RegExp(`^Last accessed(?: -)? (${TIME_SOURCE})$`),
      (_, time: string) => joinCjk('上次存取於', translateTime(time)),
    ],
    [new RegExp(`^Registered - (${TIME_SOURCE})$`), (_, time: string) => joinCjk('註冊於', translateTime(time))],
    [
      new RegExp(`^Last used for authentication - (${TIME_SOURCE})$`),
      (_, time: string) => joinCjk('上次身分驗證於', translateTime(time)),
    ],
    // 会话出现过的国家/地区代码：Seen in CN, HK → 曾在 CN, HK 使用
    [/^Seen in (.+)$/, '曾在 $1 使用'],
    // 会话行详细信息按钮的无障碍名称：地点为国家/地区名时沿用 common 的译名，其他地点保留原文；原文无标点，不加括号
    [
      new RegExp(`^View details of session from (.+?) last accessed (${TIME_SOURCE})$`),
      (_, location: string, time: string) =>
        joinCjk(joinCjk(`查看來自${regionName(location)}且上次存取於`, translateTime(time)), '的工作階段詳細資料'),
    ],
    // 设备：浏览器与系统名保留原文（GitHub 客户端名译成中文），语序改为“系统 上的 浏览器”
    [
      new RegExp(`^${BROWSER_SOURCE}${VERSION_SOURCE} on ${OS_SOURCE}${VERSION_SOURCE}$`),
      (_, browser: string, browserVersion: string, os: string, osVersion: string) =>
        `${os}${osVersion} 上的 ${CLIENT_NAMES[browser] ?? browser}${browserVersion}`,
    ],
  ],
} satisfies PageDictionary
