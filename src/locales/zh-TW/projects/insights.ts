import type { PageDictionary } from '../../../core/types'
import { pangu, translateFieldName } from './fields'
import { joinCjk } from '../helpers'

/**
 * 项目（新版 Projects）：洞察（图表）。
 * 默认图表、图表侧栏与菜单、配置面板（布局、X / Y 轴、分组）、时间段、升级提示、
 * 图表卡片（自定义设置、导出）、错误与空状态。
 */

const OPERATIONS: Readonly<Record<string, string>> = {
  Count: '計數',
  Sum: '總和',
  Average: '平均值',
  Minimum: '最小值',
  Maximum: '最大值'
}

/**
 * Y 轴聚合标签：Sum of Estimate → 預估總和；Count of items → 項目計數。
 * 无分组图表的系列名（图例、提示框、以表格查看的列头）是 Count of Items，同译「項目計數」
 */
function aggregateLabel(operation: string, field: string): string {
  const subject = /^items$/i.test(field) ? '項目' : field === 'a field' ? '欄位' : translateFieldName(field)
  return pangu(`${subject}${OPERATIONS[operation] ?? operation}`)
}

const PERIODS: Readonly<Record<string, string>> = {
  '2 weeks': '2 週',
  '1 month': '1 個月',
  '3 months': '3 個月',
  Max: '全部'
}

/** 默认图表名称（可被用户改名） */
const CHART_TITLES: Readonly<Record<string, string>> = {
  'Burn up': '燃起圖',
  'Status chart': '狀態圖表'
}

function chartTitle(title: string): string {
  return CHART_TITLES[title] ?? title
}

/** Highcharts 无障碍描述：图表类型（与 insights/charts.ts 一致） */
const CHART_TYPES: Readonly<Record<string, string>> = {
  'Combination chart': '組合圖',
  'Line chart': '折線圖',
  'Bar chart': '長條圖',
  'Pie chart': '圓餅圖',
  Chart: '圖表'
}

/** Highcharts 无障碍描述：计数单位 */
const CHART_UNITS: Readonly<Record<string, string>> = {
  'data series': '個資料數列',
  'data point': '個資料點',
  'data points': '個資料點',
  line: '條線',
  lines: '條線',
  bar: '個長條',
  bars: '個長條',
  slice: '個扇形',
  slices: '個扇形',
  pie: '個圓餅',
  pies: '個圓餅'
}

const RANGE_UNITS: Readonly<Record<string, string>> = {
  days: '天',
  hours: '小時',
  minutes: '分鐘',
  seconds: '秒'
}

/**
 * 坐标轴默认名：历史图表的 Date / items；计数图 Y 轴的 Count；
 * X 轴不带标题，读屏描述用 Highcharts 的默认名 categories
 */
const AXIS_NAMES: Readonly<Record<string, string>> = {
  Date: '日期',
  items: '項目',
  Count: '計數',
  categories: '類別'
}

/** 坐标轴名：默认名、聚合标签（Count of items）、字段名 */
function axisName(name: string): string {
  if (Object.hasOwn(AXIS_NAMES, name)) return AXIS_NAMES[name] ?? name
  const aggregate = /^(Count|Sum|Average|Minimum|Maximum) of (.+)$/.exec(name)
  return aggregate ? aggregateLabel(aggregate[1] ?? '', aggregate[2] ?? '') : translateFieldName(name)
}

/** 「顯示」后接坐标轴名：英文名前加空格 */
function displaying(name: string): string {
  const text = axisName(name)
  return /^[A-Za-z0-9]/.test(text) ? `顯示 ${text}` : `顯示${text}`
}

/** 坐标轴取值：数字或 2026-07-26 00:00:00 */
const AXIS_VALUE = '(-?[\\d,.]+|\\d{4}-\\d{2}-\\d{2}(?: \\d{2}:\\d{2}:\\d{2})?)'

export default {
  static: {
    // 默认图表
    'Add a name for this chart': '為此圖表命名',
    'Burn up': '燃起圖',
    'The Burn up chart shows the progress of your project items over time, showing how much work has been completed and how much is left to do. Use this chart to view progress, spot trends, and identify bottlenecks to help move the project forward.':
      '燃起圖顯示專案項目隨時間的進度，呈現已完成和剩餘的工作量。可用此圖表查看進度、發現趨勢和找出瓶頸以推動專案進展。',
    'Status chart': '狀態圖表',
    'This chart shows the current status for the total number of items in your project.': '此圖表顯示專案中所有項目的目前狀態。',
    'Missing field': '缺少欄位',
    'The selected field no longer exists': '所選欄位已不存在',

    // 图表侧栏与菜单
    'New chart': '新增圖表',
    'Default charts': '預設圖表',
    'Custom charts': '自訂圖表',
    'Historical charts are currently in limited feature preview.': '歷史圖表目前處於有限功能預覽階段。',
    'Get unlimited charts': '取得無限圖表',
    'Unlimited custom charts for private projects': '私人專案可使用無限自訂圖表',
    // 方案名按用户要求译成中文（product-names.md）：Team / Enterprise → 團隊版 / 企業版
    'Historical insights (Team or Enterprise plans only)': '歷史洞察（僅限團隊版或企業版方案）',
    'Save to new chart': '儲存為新圖表',
    'Save changes to new chart': '將變更儲存為新圖表',
    'Duplicate chart': '複製圖表',
    'Delete chart': '刪除圖表',
    'Delete chart?': '刪除圖表？',
    'Edit chart name': '編輯圖表名稱',
    'Chart name': '圖表名稱',

    // 配置面板
    'Configure chart': '設定圖表',
    'Close configuration pane': '關閉設定窗格',
    'Y-axis field': 'Y 軸欄位',
    'Chart filters': '圖表篩選器',

    // 错误与空状态
    'This chart configuration is no longer valid': '此圖表設定已失效',
    'A required field may have been deleted. You will need to delete and re-create this chart.':
      '必要欄位可能已被刪除。你必須刪除並重新建立此圖表。',
    'A required field may have been deleted. Update the configuration or delete the chart.': '必要欄位可能已被刪除。請更新設定或刪除圖表。',
    'This insight chart no longer exists': '此洞察圖表已不存在',
    'Select another chart to view insights': '選擇其他圖表以查看洞察',
    'You do not have access to all project items. Your chart visualization might differ from others.':
      '你沒有存取所有專案項目的權限。你看到的圖表可能與其他人不同。'
  },
  scoped: {
    // 通用文本（仅项目页生效）
    'Upgrade your plan to get:': '升級方案以取得：',
    'All the additional perks of a premium GitHub plan': 'GitHub 付費方案的所有額外福利',
    'Upgrade plan': '升級方案',
    'Group by (optional)': '分組依據（選填）',
    'Time period': '時間範圍',
    'Custom range': '自訂範圍',
    'Stacked area': '堆疊區域圖',
    'Stacked bar': '堆疊橫條圖',
    'Stacked column': '堆疊直條圖',
    'Update configuration': '更新設定',
    'No results were returned.': '沒有傳回任何結果。',
    Configure: '設定',
    'X-axis': 'X 軸',
    'Y-axis': 'Y 軸',
    Historical: '歷史',
    Time: '時間',
    None: '無',
    Line: '折線圖',
    'No data available': '沒有資料',
    'Error loading data': '資料載入失敗',
    'Unable to render chart.': '無法顯示圖表。',
    Unlabeled: '無標籤',
    'Y value': 'Y 值',
    // 图表卡片
    'Chart options': '圖表選項',
    'View as table': '以表格查看',
    'Download CSV': '下載 CSV',
    'Download PNG': '下載 PNG',
    'Customization settings': '自訂設定',
    'Chart settings': '圖表設定',
    'Column & bar chart settings': '直條圖和橫條圖設定',
    'Line chart settings': '折線圖設定',
    'Adds gradients and outlines to increase contrast in charts.': '為圖表加上漸層和外框以提高對比度。',
    'Show data labels': '顯示資料標籤',
    'Show labels for each data point in column and bar charts.': '在直條圖和橫條圖中顯示每個資料點的標籤。',
    'Show labels for each data point in line chart.': '在折線圖中顯示每個資料點的標籤。',
    'Show labels for each data point in chart.': '在圖表中顯示每個資料點的標籤。',
    'Differentiate by line style': '依線條樣式區分',
    'Use unique line styles (dashed, dotted, etc.) to differentiate lines in charts.':
      '使用不同的線條樣式（虛線、點線等）區分圖表中的線條。',
    'Interactive chart.': '互動式圖表。',
    // 历史图表的状态分组
    'Closed pull requests': '已關閉的拉取請求',
    ...PERIODS
  },
  regexp: [
    // 字段名不以数字开头：避开 Maximum of 5 pins reached… 之类的数量上限提示
    [/^(Count|Sum|Average|Minimum|Maximum) of (?!\d)(.+)$/, (_, operation: string, field: string) => aggregateLabel(operation, field)],
    [
      /^Private projects are limited to (\d+) custom charts\. Make your project public or upgrade your plan to add more charts\.$/,
      '私人專案最多只能有 $1 個自訂圖表。將專案設為公開或升級方案以新增更多圖表。'
    ],
    [
      /^Displaying results for (.+)$/,
      (_, period: string) => {
        const translated = PERIODS[period]
        // 全部 → 顯示全部結果；时长与未知时间段 → 顯示 2 週的結果、顯示 Q3 2026 的結果
        if (translated && !/^\d/.test(translated)) return `顯示${translated}結果`
        return joinCjk(joinCjk('顯示', translated ?? period), '的結果')
      }
    ],
    [/^Are you sure you want to delete "(.+)"\?$/, '確定要刪除「$1」嗎？'],
    [/^(.+)\. Interactive chart\.$/, (_, title: string) => `${chartTitle(title)}。互動式圖表。`],
    [/^(.+) Axis zoom$/, (_, title: string) => joinCjk(chartTitle(title), '的座標軸縮放')],

    // Highcharts 无障碍描述（读屏文本）：原文没有逗号、冒号的不加，改语序代替标点
    [
      /^(Combination chart|Line chart|Bar chart|Pie chart|Chart) with ([\d,]+) (data series|data points?|lines?|bars?|slices?|pies?)\.$/,
      (_, type: string, count: string, unit: string) => `包含 ${count} ${CHART_UNITS[unit] ?? unit}的${CHART_TYPES[type] ?? type}。`
    ],
    [
      new RegExp(
        `^The chart has 1 (X|Y) axis displaying ([^.]+)\\.(?: Data ranges from ${AXIS_VALUE} to ${AXIS_VALUE}\\.| Data range: ([\\d,.]+) (categories|days|hours|minutes|seconds)\\.)?$`
      ),
      (_, axis: string, name: string, from: string, to: string, amount: string, unit: string) => {
        let range = ''
        if (from) range = `資料範圍從 ${from} 到 ${to}。`
        else if (amount) range = `資料範圍：${unit === 'categories' ? `${amount} 個類別` : `${amount} ${RANGE_UNITS[unit] ?? unit}`}。`
        return `圖表有 1 條${joinCjk(displaying(name), `的 ${axis} 軸`)}。${range}`
      }
    ],
    [/^View as data table, (.+)$/, (_, title: string) => `以資料表查看，${chartTitle(title)}`],
    [/^Toggle series visibility, (.+)$/, (_, title: string) => `切換數列顯示，${chartTitle(title)}`]
  ]
} satisfies PageDictionary
