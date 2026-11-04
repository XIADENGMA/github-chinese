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
  'GitHub Mobile': 'GitHub 移动版'
}

/**
 * 会话（/settings/sessions）：网页会话、GitHub 移动版会话；会话详细信息页（/settings/sessions/<id>）。
 * 时间多在 <relative-time> 中，前缀按片段收录；时间是纯文本时由正则整句处理。
 * 「Session details」「View all sessions」「Revoke」由其他词典 static 收录，「Never used」由 settings-developer 收录。
 * 产品名按用户规定译成中文：GitHub Mobile → GitHub 移动版。
 */
export default {
  static: {
    // 网页会话
    'Web sessions': '网页会话',
    'This is a list of devices that have logged into your account. Revoke any sessions that you do not recognize.':
      '这是登录过你帐户的设备列表。撤销你不认识的会话。',
    'Your current session': '你的当前会话',
    'Last accessed on': '上次访问于',

    // GitHub 移动版会话：说明被 “revoke” 链接拆开（原文无逗号，译文不加）
    'GitHub Mobile sessions': 'GitHub 移动版会话',
    'This is a list of devices that have logged into your account via the GitHub Mobile app. Revoke any session that you do not recognize or you can':
      '这是通过 GitHub 移动版应用登录过你帐户的设备列表。撤销你不认识的会话或者',
    'your GitHub Mobile app authorization to sign out of all your devices.': '你的 GitHub 移动版应用授权以退出所有设备。',
    'GitHub Mobile can be used to verify your identity when signing in from a new device and as a two-factor authentication method.':
      'GitHub 移动版可用于在新设备登录时验证身份以及用作双因素身份验证方法。',
    'Learn more about authentication with GitHub Mobile.': '了解使用 GitHub 移动版进行身份验证。',
    // 「To get started, install GitHub Mobile for <a>iOS</a> or <a>Android</a> and sign in to your account.」
    'To get started, install GitHub Mobile for': '首先，安装适用于',
    'and sign in to your account.': '的 GitHub 移动版并登录你的帐户。',
    'Registered -': '注册于',
    'Last accessed -': '上次访问于',
    // 其后是时间元素或「Never used」：分隔符「-」照原文保留，“上次用于身份验证 - 从未使用”
    'Last used for authentication -': '上次用于身份验证 -',

    // 会话详细信息
    'Revoke session': '撤销会话',
    'Device:': '设备：',
    'Last location:': '上次位置：',
    'Signed in:': '登录时间：'
  },
  scoped: {
    revoke: '撤销',
    // 会话状态指示（aria-label / title）
    active: '活跃',
    stale: '闲置'
  },
  regexp: [
    [new RegExp(`^Last accessed(?: -)? (${TIME_SOURCE})$`), (_, time: string) => joinCjk('上次访问于', translateTime(time))],
    [new RegExp(`^Registered - (${TIME_SOURCE})$`), (_, time: string) => joinCjk('注册于', translateTime(time))],
    [new RegExp(`^Last used for authentication - (${TIME_SOURCE})$`), (_, time: string) => joinCjk('上次身份验证于', translateTime(time))],
    // 会话出现过的国家/地区代码：Seen in CN, HK → 曾在 CN, HK 使用
    [/^Seen in (.+)$/, '曾在 $1 使用'],
    // 会话行详细信息按钮的无障碍名称：地点为国家/地区名时沿用 common 的译名，其他地点保留原文；原文无标点，不加括号
    [
      new RegExp(`^View details of session from (.+?) last accessed (${TIME_SOURCE})$`),
      (_, location: string, time: string) =>
        joinCjk(joinCjk(`查看来自${regionName(location)}且上次访问于`, translateTime(time)), '的会话详细信息')
    ],
    // 设备：浏览器与系统名保留原文（GitHub 客户端名译成中文），语序改为“系统 上的 浏览器”
    [
      new RegExp(`^${BROWSER_SOURCE}${VERSION_SOURCE} on ${OS_SOURCE}${VERSION_SOURCE}$`),
      (_, browser: string, browserVersion: string, os: string, osVersion: string) =>
        `${os}${osVersion} 上的 ${CLIENT_NAMES[browser] ?? browser}${browserVersion}`
    ]
  ]
} satisfies PageDictionary
