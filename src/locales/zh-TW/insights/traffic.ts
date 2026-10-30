import type { PageDictionary } from '../../../core/types'

/** 流量图表标题：Clones in last 14 days（unique 取台湾流量统计通行的「不重複」） */
const TRAFFIC_METRIC: Readonly<Record<string, string>> = {
  Clones: '複製次數',
  'Unique cloners': '不重複複製者',
  'Total views': '總瀏覽次數',
  'Unique visitors': '不重複訪客',
}

/** 流量计数单位：12 Clones（次数用「次」，人用「位」） */
const TRAFFIC_UNIT: Readonly<Record<string, string>> = {
  clone: '次複製',
  'unique cloner': '位不重複複製者',
  view: '次瀏覽',
  'unique visitor': '位不重複訪客',
}

/**
 * 流量（/graphs/traffic，需推送权限）与 Actions 使用 / 性能指标标题。
 * 指标页属于 actions 页面类型（组织级属于 organization），只有 static 生效；
 * 指标页的列名、筛选等由 actions 词典收录，这里只保留标题与组织见解侧栏。
 */
export default {
  static: {
    Traffic: '流量',
    'Git clones': 'Git 複製次數',
    Clones: '複製次數',
    'Unique cloners': '不重複複製者',
    Visitors: '訪客',
    'Unique visitors': '不重複訪客',
    'Referring sites': '參照網站',
    'Popular content': '熱門內容',
    'Unique Visits': '不重複造訪次數',
    "We don't have enough data to show anything useful.": '資料不足以顯示有用的資訊。',
    'We don’t have enough data to show anything useful.': '資料不足以顯示有用的資訊。',
    'It usually takes about a week to populate this graph.': '通常約需一週才能產生此圖表。',
    'It usually takes about a week to populate this table.': '通常約需一週才能產生此表格。',
    'It looks like traffic to your repository is a little light. Go spread the word and check back later!':
      '你的儲存庫流量似乎偏少。去宣傳一下，稍後再回來查看！',
    "Referring sites and popular content are temporarily unavailable or may not display accurately. We're actively working to resolve the issue.":
      '參照網站和熱門內容暫時無法使用或可能無法正確顯示。我們正在積極解決此問題。',
    'Referring sites and popular content are temporarily unavailable or may not display accurately. We’re actively working to resolve the issue.':
      '參照網站和熱門內容暫時無法使用或可能無法正確顯示。我們正在積極解決此問題。',

    // Actions 使用 / 性能指标（存储库 /actions/metrics/*、组织 /insights/actions/*）
    'Actions usage metrics': '動作使用量指標',
    'Actions performance metrics': '動作效能指標',
    'Actions Usage Metrics': '動作使用量指標',
    'Actions Performance Metrics': '動作效能指標',

    // 组织见解侧栏
    'Insights navigation': '洞察導覽',
    'Copilot impact': 'Copilot 成效',
    'Code generation': '程式碼產生',
  },
  scoped: {
    Views: '瀏覽次數',
    Site: '網站',
    Content: '內容',
    Domains: '網域',
    Visits: '造訪次數',
    Path: '路徑',
    Cloners: '複製者',
    'Total views': '總瀏覽次數',
    Total: '總計',
    Unique: '不重複',
    // 图表提示里的计数单位：<strong>12</strong> clones
    clones: '次複製',
    clone: '次複製',
    'unique cloners': '位不重複複製者',
    'unique cloner': '位不重複複製者',
    views: '次瀏覽',
    view: '次瀏覽',
    'unique visitors': '位不重複訪客',
    'unique visitor': '位不重複訪客',
  },
  regexp: [
    // 图表标题：Clones in last 14 days
    [
      /^(Clones|Unique cloners|Total views|Unique visitors) in last (\d+) days$/,
      (_, metric: string, days: string) => `過去 ${days} 天的${TRAFFIC_METRIC[metric]}`,
    ],
    // 计数：12 Clones / 1 Unique visitor
    [
      /^([\d,]+) (Clones?|Unique cloners?|Views?|Unique visitors?)$/,
      (_, count: string, unit: string) => `${count} ${TRAFFIC_UNIT[unit.toLowerCase().replace(/s$/, '')]}`,
    ],
  ],
} satisfies PageDictionary
