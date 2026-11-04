import type { PageDictionary } from '../../../core/types'
import { TIME_SOURCE, translateTime } from '../helpers'

/**
 * 主题页 /topics、/topics/<name> 与精选集页 /collections、/collections/<name>：
 * 页头、储存库列表筛选与排序、主题侧栏、空状态、标签页标题。
 * 主题名、精选集名与描述属于用户内容，由 ignore 跳过。
 */
export default {
  static: {
    // 主题列表
    'Browse popular topics on GitHub.': '瀏覽 GitHub 上的熱門主題。',
    'All featured topics': '所有精選主題',
    'Popular topics': '熱門主題',
    'Open Source, AI & Coding Topics on GitHub': 'GitHub 上的開源、AI 和程式設計主題',
    'Topics on GitHub': 'GitHub 上的主題',
    'GitHub Topics': 'GitHub 主題',

    // 主题详情：储存库列表
    'Filter by language': '依語言篩選',

    // 主题详情：侧栏
    'Topic followers': '主題追蹤者',
    'Related topics': '相關主題',
    'Related Topics': '相關主題',
    'Improve this page': '改善此頁面',
    // 句子被主题标签拆成：Add a description, image, and links to the + <主题> + topic page so that …
    'Add a description, image, and links to the': '為',
    'topic page so that developers can more easily learn about it.': '主題頁面新增描述、圖片和連結，讓開發人員更容易瞭解此主題。',
    'Curate this topic': '整理此主題',
    'Add this topic to your repo': '將此主題加入你的儲存庫',
    // 句子被主题名拆成：To associate your repository with the + <主题> + topic, visit …
    // 原文句号在引号内（select "manage topics."），check:locale 不把引号算作结尾标点，译文结尾不加句号（与 settings-account/profile.ts 同法）
    'To associate your repository with the': '若要將你的儲存庫關聯到',
    'topic, visit your repo\'s landing page and select "manage topics."': '主題，請前往儲存庫首頁並選擇「管理主題」',

    // 主题详情：空状态（The + <主题> + topic hasn't been used …）
    "topic hasn't been used on any public repositories, yet.": '尚未用於任何公開儲存庫。',
    'Explore topics': '探索主題',

    // 精选集
    'Curated lists and insight into burgeoning industries, topics, and communities.': '精選清單，以及對新興產業、主題和社群的洞察。',
    'Open Source, AI & Coding Repo Collections on GitHub': 'GitHub 上的開源、AI 和程式設計儲存庫精選集'
  },
  scoped: {
    The: '主題',
    'Sort:': '排序：',
    'Most stars': '最多星號',
    'Fewest stars': '最少星號',
    'Most forks': '最多分叉',
    'Fewest forks': '最少分叉',
    'Created by': '建立者',
    Released: '發布於',
    'Latest release': '最新發行版本',
    Followers: '追蹤者',
    Website: '網站',
    Wikipedia: '維基百科',
    Collection: '精選集'
  },
  regexp: [
    // 主题详情：Here are 67,180 public repositories matching this topic...
    [/^Here (?:are|is) ([\d,]+) public repositor(?:ies|y) matching this topic\.\.\.$/, '共有 $1 個公開儲存庫與此主題相符...'],
    // 列表计数的另一写法：There are 1,234 public repositories matching this topic（句号随原文）
    [
      /^There (?:are|is) ([\d,]+) public repositor(?:ies|y) matching this topic(\.)?$/,
      (_, count, period) => `共有 ${count} 個公開儲存庫與此主題相符${period ? '。' : ''}`
    ],
    // 侧栏追踪者计数（59k followers）由 common-ui 的通用计数规则翻译
    // 侧栏发布日期与最新发行版本时间：February 11, 2014 / 13 days ago
    [new RegExp(`^${TIME_SOURCE}$`), time => translateTime(time)],
    // 精选集详情标签页标题段
    [/^Collection: (.+)$/, '精選集：$1']
  ],
  ignore: [
    // 主题名：页头、空状态、侧栏「將此主題加入你的儲存庫」说明
    'div.flex-1 > h1.h1',
    'div.f3.color-fg-muted > strong.h3',
    '.col-md-4 p.color-fg-muted > span.text-bold',
    // 主题列表页的推荐卡片与精选主题列表：名称与描述由全局规则 a[href^="/topics/"] > p 跳过
    // 精选集网格中的名称与描述
    'a.exploregrid-item > p',
    // 精选集详情页头：精选集名与描述
    'h1.h1.lh-condensed',
    'h1.h1.lh-condensed + .f3.color-fg-muted'
  ]
} satisfies PageDictionary
