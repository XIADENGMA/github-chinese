/**
 * Actions 词典共用的格式工具（不是词典）：时长、状态、事件名。
 * 时长的数字与单位之间、各段之间加空格（术语表：中文与数字之间加空格）：1m 44s → 1 分鐘 44 秒。
 */

/** 时长片段（不含捕获组）：45s、1m 44s、9h 55m 51s、1d 2h 3m 4s */
export const DURATION_SOURCE = '\\d+[dhms](?: \\d+[dhms]){0,3}'

const DURATION_UNITS: Readonly<Record<string, string>> = { d: '天', h: '小時', m: '分鐘', s: '秒' }
const DURATION_PART_RE = /(\d+)([dhms])/g

/** 1m 44s → 1 分鐘 44 秒；2m 0s → 2 分鐘 0 秒；6h0m0s → 6 小時 0 分鐘 0 秒 */
export function formatDuration(text: string): string {
  const parts = Array.from(text.matchAll(DURATION_PART_RE), ([, amount, unit]) => `${amount} ${DURATION_UNITS[unit!]}`)
  return parts.join(' ')
}

/** 运行与作业状态（首字母大写）：运行摘要、运行列表耗时栏、作业筛选 */
export const RUN_STATUS: Readonly<Record<string, string>> = {
  Success: '成功',
  Successful: '成功',
  Failure: '失敗',
  Failed: '失敗',
  Cancelled: '已取消',
  Canceled: '已取消',
  Skipped: '已略過',
  'In progress': '進行中',
  Queued: '已排入佇列',
  Waiting: '等待中',
  Pending: '擱置中',
  Requested: '已請求',
  Completed: '已完成',
  'Action required': '需要採取動作',
  Neutral: '中性',
  'Timed out': '已逾時',
  'Startup failure': '啟動失敗',
  Stale: '過時'
}

/** 运行列表状态图标的无障碍前缀（带冒号） */
export const RUN_STATUS_LABELS: Readonly<Record<string, string>> = {
  'neutral:': '中性：',
  'completed successfully:': '成功完成：',
  'failed:': '失敗：',
  'cancelled:': '已取消：',
  'requires action with the application:': '需要採取動作：',
  'timed out:': '已逾時：',
  'skipped:': '已略過：',
  'marked stale by GitHub because it took too long:': '因耗時過長，已由 GitHub 標示為過時：',
  'failed at startup:': '啟動失敗：',
  'status unavailable:': '無法取得狀態：',
  'requested:': '已請求：',
  'waiting for another serialized run to finish:': '正在等待另一個序列化執行完成：',
  'waiting:': '等待中：',
  'queued:': '已排入佇列：',
  'currently running:': '正在執行：'
}

/** 状态前缀的正则片段（不含冒号与捕获组），长者在前 */
export const RUN_STATUS_LABEL_SOURCE = Object.keys(RUN_STATUS_LABELS)
  .map(label => label.slice(0, -1))
  .sort((a, b) => b.length - a.length)
  .join('|')

/** 触发事件（Triggered via push 等，小写或产品名） */
export const TRIGGER_EVENTS: Readonly<Record<string, string>> = {
  push: '推送',
  'pull request': '拉取請求',
  'pull request target': '拉取請求目標',
  'pull request review': '拉取請求審查',
  'pull request review comment': '拉取請求審查留言',
  schedule: '排程',
  'workflow run': '工作流程執行',
  'workflow dispatch': '工作流程分派',
  'workflow call': '工作流程呼叫',
  'repository dispatch': '儲存庫分派',
  issue: '議題',
  issues: '議題',
  'issue comment': '議題留言',
  release: '發行版本',
  discussion: '討論',
  'discussion comment': '討論留言',
  'merge group': '合併群組',
  'check run': '檢查執行',
  'check suite': '檢查套件',
  create: '建立',
  delete: '刪除',
  deployment: '部署',
  'deployment status': '部署狀態',
  fork: '分叉',
  label: '標籤',
  milestone: '里程碑',
  // public 事件：储存库由私人改为公开（可见度 → 公開，Make public → 設為公開），补主语「儲存庫」：由儲存庫設為公開觸發
  public: '儲存庫設為公開',
  status: '狀態',
  // watch 事件由加星号触发（star → 加星號）：由加星號觸發
  watch: '加星號',
  'registry package': '登錄庫套件',
  'page build': '頁面建置',
  dynamic: '動態工作流程',
  // 产品名（Pages 建置部署的执行）：GitHub Pages → GitHub 頁面
  'GitHub Pages': 'GitHub 頁面'
}

/** 部署状态（Status: Deployed (completed).） */
export const DEPLOYMENT_STATES: Readonly<Record<string, string>> = {
  Deployed: '已部署',
  'Failed to deploy': '部署失敗',
  // 单独的进度动名词作「X中」
  Deploying: '部署中',
  Pending: '擱置中',
  Queued: '已排入佇列',
  Waiting: '等待中',
  'In progress': '進行中',
  Inactive: '非作用中',
  Error: '錯誤',
  Failure: '失敗',
  Abandoned: '已放棄',
  Destroyed: '已銷毀',
  Success: '成功',
  Active: '作用中'
}

/** 部署进度（括号内） */
export const DEPLOYMENT_PHASES: Readonly<Record<string, string>> = {
  completed: '已完成',
  'in progress': '進行中',
  in_progress: '進行中',
  queued: '已排入佇列',
  pending: '擱置中',
  waiting: '等待中',
  inactive: '非作用中'
}

/** 狀態：已部署（已完成）。未知取值保留原文，进度为英文时用半角括号：狀態：已部署 (done) */
export function deploymentStatus(state: string, phase: string): string {
  const stateText = DEPLOYMENT_STATES[state] ?? state
  const phaseText = DEPLOYMENT_PHASES[phase]
  return phaseText === undefined ? `狀態：${stateText} (${phase})` : `狀態：${stateText}（${phaseText}）`
}
