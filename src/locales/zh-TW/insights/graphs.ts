import type { PageDictionary } from '../../../core/types'
import { DATE_SOURCE, formatDate, joinCjk, translateTime } from '../helpers'
import { METRIC } from './charts'

const REPO = '([\\w.-]+\\/[\\w.-]+)'

/**
 * 贡献者图说明（Weekly from … to …）里的日期：toLocaleDateString 按浏览器语言输出，
 * 英文（Jul 25, 2026 / 25 Jul 2026）或中文本地格式（原生无空格，也接受带空格的写法）
 */
const WEEK_DATE = `(${DATE_SOURCE}|\\d{4} ?年 ?\\d{1,2} ?月 ?\\d{1,2} ?日)`
const CJK_DATE_RE = /^(\d{4}) ?年 ?(\d{1,2}) ?月 ?(\d{1,2}) ?日$/

/** 说明里的日期统一按 helpers 的日期格式输出 */
function weekDate(text: string): string {
  const cjk = CJK_DATE_RE.exec(text)
  return cjk ? formatDate(Number(cjk[1]), Number(cjk[2]), Number(cjk[3])) : translateTime(text)
}

/** 贡献者图周期选项（Last N months 是相对今天的时段，作「過去 N 個月」，同 actions 指标的「過去 30 天」） */
function translatePeriod(name: string): string {
  if (name === 'All') return '全部'
  if (name === 'Last month') return '過去 1 個月'
  if (name === 'Custom range') return '自訂範圍'
  const months = /^Last (\d+) months$/.exec(name)
  return months ? `過去 ${months[1]} 個月` : name
}

/**
 * 见解侧栏、页面标题，以及贡献者（graphs/contributors）、
 * 提交活动（graphs/commit-activity）、代码频率（graphs/code-frequency）三个 React 图表页。
 */
export default {
  static: {
    // 侧栏
    Contributors: '貢獻者',
    'Code frequency': '程式碼頻率',

    // 贡献者（period 是时段，作「期間」；「週期」在台湾指循环周期）
    Period: '期間',
    'Contributions:': '貢獻：',
    "'s Commits": '的提交',
    "'s Additions": '的新增',
    "'s Deletions": '的刪除',
    // 原文无标点（撇号不算），译文不加逗号
    "We don't have enough data to generate this graph": '資料不足以產生此圖表',
    'We don’t have enough data to generate this graph': '資料不足以產生此圖表',
    'We need at least one non-empty commit with an email to generate this graph':
      '至少需要一個帶有電子郵件的非空提交才能產生此圖表',
    'There was an error generating this graph': '產生此圖表時發生錯誤',
    'Graph could not be rendered': '無法顯示圖表',
    'Crunching the latest data, just for you. Hang tight…': '正在為你計算最新資料，請稍候…',
    'Loading contributions…': '正在載入貢獻…',
    'Loading contributions...': '正在載入貢獻...',
    'Filter contributions': '篩選貢獻',
    'Crunching the latest data, just for you. Hang tight...': '正在為你計算最新資料，請稍候...',

    // 提交活动
    // Commits over the last year of <strong>owner/repo</strong>
    'Commits over the last year of': '以下儲存庫過去一年的提交',
    'Number of commits per week': '每週提交數',
    'Sorry, No Data Found': '找不到資料',
    'This repository has no recorded commit activity.': '此儲存庫沒有提交活動記錄。',
    'Graph data path is not available': '圖表資料路徑無法使用',

    // 代码频率
    // Code frequency over the history of <strong>owner/repo</strong>
    'Code frequency over the history of': '以下儲存庫完整歷史記錄的程式碼頻率',
    'Additions and deletions per week': '每週新增和刪除',
    'There are too many commits to generate this graph.': '提交過多而無法產生此圖表。',
    // More information about this data can be found in the <activity documentation>.（原文无标点，译文不加逗号）
    'More information about this data can be found in the': '有關此資料的詳細資訊請參閱',
    'activity documentation': '活動說明文件',
  },
  scoped: {
    'Last month': '過去 1 個月',
    'Custom range': '自訂範圍',
    Additions: '新增',
    Deletions: '刪除',
    // 拼接失败时的单节点兜底：Contributions per week to <main>, excluding merge commits
    'Contributions per week to': '每週貢獻至',
    ', excluding merge commits': '，不含合併提交',
    'over time': '趨勢',
  },
  regexp: [
    // 无障碍标题与页面标题
    [new RegExp(`^Insights: ${REPO}$`), '洞察：$1'],
    [new RegExp(`^Contributors to ${REPO}$`), '$1 的貢獻者'],

    // 贡献者页说明（分支名在独立文本节点，拼接后匹配）；原文只有一个逗号，译文不多加
    [/^Contributions per week to (\S+), excluding merge commits$/, '每週對 $1 的貢獻，不含合併提交'],
    [
      /^Contributions per week to (\S+), line counts have been omitted because commit count exceeds ([\d,]+)\.$/,
      '每週對 $1 的貢獻，因提交數超過 $2 而省略行數統計。',
    ],
    // 拼接失败时的单节点兜底（同 scoped 的「, excluding merge commits」）
    [/^, line counts have been omitted because commit count exceeds ([\d,]+)\.$/, '，因提交數超過 $1 而省略行數統計。'],
    // 周期按钮：<span>Period</span>: Last 3 months
    [/^: (All|Last month|Last \d+ months|Custom range)$/, (_, name) => `：${translatePeriod(name)}`],
    [/^Last (\d+) months$/, '過去 $1 個月'],
    // 汇总图标题与说明
    [/^(Commits|Additions|Deletions) over time$/, (_, metric) => `${METRIC[metric]}趨勢`],
    // 单个贡献者图表的数据表对话框标题：octocat's Commits
    [/^([\w.-]+(?:\[bot\])?)'s (Commits|Additions|Deletions)$/, (_, login, metric) => `${login} 的${METRIC[metric]}`],
    // 周统计说明：Weekly from Jul 25, 2026 to Oct 25, 2026（原文无冒号，译文不加；按中文语序作「自 … 至 … 的每週統計」）；前缀与日期用 joinCjk 拼接
    [
      new RegExp(`^Weekly from ${WEEK_DATE} to ${WEEK_DATE}$`),
      (_, from, to) => `${joinCjk('自', weekDate(from))}${joinCjk('至', weekDate(to))}的每週統計`,
    ],
    // 提交数：Pulse 摘要、贡献者卡片
    [/^([\d,]+) commits?$/, '$1 個提交'],
  ],
  // 贡献者卡片标题里的用户名链接
  ignore: ['[class*="chartListItem"] h2 a'],
} satisfies PageDictionary
