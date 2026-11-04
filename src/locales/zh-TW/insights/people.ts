import type { PageDictionary } from '../../../core/types'
import { DATE_SOURCE, joinCjk, translateTime } from '../helpers'

/** 标星者（/stargazers）、关注者（/watchers）列表：空状态、用户卡片、关注按钮 */
export default {
  static: {
    'No one’s watching this repository yet. You could be the first.': '還沒有人關注此儲存庫。你可以成為第一個。',
    "No one's watching this repository yet. You could be the first.": '還沒有人關注此儲存庫。你可以成為第一個。',
    'Learn more about how watching repositories works on GitHub': '瞭解在 GitHub 上關注儲存庫的運作方式',
    'Be the first to star this repository': '成為第一個為此儲存庫加星號的人',
    'Be the first of your friends to star this repository.': '成為朋友中第一個為此儲存庫加星號的人。',
    'No one you follow has starred this repository yet.': '你追蹤的人都還沒有為此儲存庫加星號。',
    'Learn more about how starring works on GitHub.': '瞭解在 GitHub 上加星號的運作方式。',
    // Learn more <about how starring works on GitHub.>（Learn more 由 common-ui 译作「瞭解詳情」）：
    // 以全形冒号承接，拼成「瞭解詳情：在 GitHub 上加星號的運作方式。」
    'about how starring works on GitHub.': '：在 GitHub 上加星號的運作方式。'
  },
  regexp: [
    // 关注按钮的 aria-label（关注用户按术语表作「追蹤」）
    [/^Follow ([\w-]+)$/, '追蹤 $1'],
    [/^Unfollow ([\w-]+)$/, '取消追蹤 $1'],
    // 用户卡片：Joined on Apr 13, 2014 / Works for @octo-org / Is from San Francisco（加入日期按中文语序前置：於 … 加入）
    [new RegExp(`^Joined on (${DATE_SOURCE})$`), (_, date: string) => `${joinCjk('於', translateTime(date))}加入`],
    [/^Works for (@?[\w.-]+)$/, '任職於 $1'],
    [/^Is from (.+)$/, '來自 $1']
  ]
} satisfies PageDictionary
