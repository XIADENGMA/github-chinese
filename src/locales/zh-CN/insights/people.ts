import type { PageDictionary } from '../../../core/types'
import { DATE_SOURCE, joinCjk, translateTime } from '../helpers'

/** 标星者（/stargazers）、关注者（/watchers）列表：空状态、用户卡片、关注按钮 */
export default {
  static: {
    'No one’s watching this repository yet. You could be the first.': '还没有人关注此存储库。你可以成为第一个。',
    "No one's watching this repository yet. You could be the first.": '还没有人关注此存储库。你可以成为第一个。',
    'Learn more about how watching repositories works on GitHub': '了解 GitHub 上关注存储库的工作方式',
    'Be the first to star this repository': '成为第一个为此存储库加星标的人',
    'Be the first of your friends to star this repository.': '成为你关注的人中第一个为此存储库加星标的人。',
    'No one you follow has starred this repository yet.': '你关注的人中还没有人为此存储库加星标。',
    'Learn more about how starring works on GitHub.': '了解 GitHub 上星标的工作方式。',
    // Learn more <about how starring works on GitHub.>
    'about how starring works on GitHub.': '关于 GitHub 上星标的工作方式。',
  },
  regexp: [
    // 关注按钮的 aria-label
    [/^Follow ([\w-]+)$/, '关注 $1'],
    [/^Unfollow ([\w-]+)$/, '取消关注 $1'],
    // 用户卡片：Joined on Apr 13, 2014 / Works for @octo-org / Is from San Francisco
    [new RegExp(`^Joined on (${DATE_SOURCE})$`), (_, date: string) => joinCjk('加入于', translateTime(date))],
    [/^Works for (@?[\w.-]+)$/, '就职于 $1'],
    [/^Is from (.+)$/, '来自 $1'],
  ],
} satisfies PageDictionary
