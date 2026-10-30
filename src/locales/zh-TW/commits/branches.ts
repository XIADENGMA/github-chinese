import type { PageDictionary, RegExpRule } from '../../../core/types'

const PULL_STATES: Readonly<Record<string, string>> = {
  Open: '開放中的',
  Closed: '已關閉的',
  Merged: '已合併的',
  Draft: '草稿',
}

const regexp: readonly RegExpRule[] = [
  // 分支行：领先和落后计数图的无障碍名称（原文为 and，译文不用斜杠）
  [/^Ahead and behind counts: (\d[\d,]*) ahead, (\d[\d,]*) behind$/, '領先和落後計數：領先 $1，落後 $2'],
  // 分支行：关联拉取请求的无障碍名称
  [
    /^(Open|Closed|Merged|Draft) pull request #(\d+)$/,
    (_, state: string, number: string) => `${PULL_STATES[state] ?? state}拉取請求 #${number}`,
  ],
  // 分支菜单：重命名分支的无障碍名称（单引号单独出现，转成「」）
  [/^Rename branch ['‘](.+)['’]$/, '重新命名分支「$1」'],
  // 未保护分支横幅
  [/^Your (\S+) branch isn['’]t protected$/, '你的 $1 分支未受保護'],
  // 合并队列徽章的无障碍名称（1 个时原文为 There is 1 pull request in the merge queue）
  [/^There are (\d+) pull requests in the merge queue$/, '合併佇列中有 $1 個拉取請求'],
  // 搜索分支后的结果播报（结果量词作「項」）
  [/^(\d[\d,]*) results? found$/, '找到 $1 項結果'],
  // 重命名对话框：名称校验结果（服务器按规范化后的名称返回）、重命名成功提示
  [/^Your branch name will be (\S+)$/, '分支名稱將為 $1'],
  [/^Branch (\S+) will be renamed to (\S+) shortly\.$/, '分支 $1 即將重新命名為 $2。'],
]

/**
 * 分支页（/branches）：标签页、分支表格、合并队列徽章、分支菜单、新建 / 重命名 / 删除 / 恢复分支、
 * 未保护分支横幅。
 */
export default {
  static: {
    // 页头与标签页
    'Branches navigation': '分支導覽',
    'Branch views': '分支檢視',
    'Search branches...': '搜尋分支...',
    'Search branches…': '搜尋分支…',
    'Search branches': '搜尋分支',
    'Your branches': '你的分支',
    'Active branches': '活躍分支',
    'Stale branches': '過時分支',
    'View more branches': '查看更多分支',
    'No branches': '沒有分支',
    'No branches match the search': '沒有與搜尋相符的分支',

    // 表格列与行操作
    'Check status': '檢查狀態',
    Behind: '落後',
    Ahead: '領先',
    'Action menu': '動作選單',
    'Merge queue': '合併佇列',
    'View the merge queue': '查看合併佇列',
    'There is 1 pull request in the merge queue': '合併佇列中有 1 個拉取請求',
    'Copy branch name to clipboard': '複製分支名稱到剪貼簿',
    'View rules': '查看規則',
    'View all rules': '查看所有規則',
    'There are no rulesets associated with this branch.': '此分支沒有關聯的規則集。',
    'This branch is protected by branch protections': '此分支受分支保護規則保護',
    'Branch menu': '分支選單',
    'Rename branch': '重新命名分支',
    'This branch no longer exists.': '此分支已不存在。',

    // 操作错误
    "You can't delete the default branch.": '無法刪除預設分支。',
    'You can’t delete the default branch.': '無法刪除預設分支。',
    // protected branch → 受保護的分支（GLOSSARY.zh-TW）
    "You can't delete this protected branch.": '無法刪除此受保護的分支。',
    'You can’t delete this protected branch.': '無法刪除此受保護的分支。',
    // 正在重命名的分支（原文无逗号，译文用「因…而…」不加）
    "You can't delete this branch because it is being renamed.": '此分支因正在重新命名而無法刪除。',
    'You can’t delete this branch because it is being renamed.': '此分支因正在重新命名而無法刪除。',
    "You can't delete this branch.": '無法刪除此分支。',
    'You can’t delete this branch.': '無法刪除此分支。',
    'Branch could not be deleted.': '無法刪除分支。',
    'Branch could not be deleted': '無法刪除分支',
    'Branch could not be restored.': '無法還原分支。',
    "You can't rename this branch because it is being renamed.": '此分支因正在重新命名而無法再次重新命名。',
    'You can’t rename this branch because it is being renamed.': '此分支因正在重新命名而無法再次重新命名。',
    "You don't have permission to rename this branch.": '你沒有重新命名此分支的權限。',
    'You don’t have permission to rename this branch.': '你沒有重新命名此分支的權限。',

    // 删除分支对话框：分支 <名称> 與一個開放中的拉取請求相關聯： / 分支 <名称> 將永久刪除。
    'is associated with an open pull request:': '與一個開放中的拉取請求相關聯：',
    'If you delete this branch, the pull request will be closed.': '如果刪除此分支，該拉取請求將會關閉。',
    'will be permanently deleted.': '將永久刪除。',
    'Are you sure you want to delete this branch?': '確定要刪除此分支嗎？',

    // 未保护分支横幅：你的 <main> 分支未受保護
    "branch isn't protected": '分支未受保護',
    'branch isn’t protected': '分支未受保護',

    // 新建分支对话框
    'New branch': '新增分支',
    'Create a branch': '建立分支',
    'New branch name': '新分支名稱',
    'Choose from this fork or its upstream repository.': '從此分叉或其上游儲存庫中選擇。',
    'Create new branch': '建立新分支',
    'Unable to create branch:': '無法建立分支：',
    'Repository rule violations found:': '發現違反儲存庫規則：',
    'Please address the rule violations and try again.': '請解決違反規則的問題後再試一次。',
    'Learn more about rulesets.': '瞭解規則集。',
    'Checking if ref name is valid': '正在檢查參考名稱是否有效',
    'Checking if branch name is valid': '正在檢查分支名稱是否有效',

    // 重命名分支对话框（“Will close N open pull requests for this branch.”与页面站点说明由 repo-settings 词典收录）
    'Rename this branch': '重新命名此分支',
    'Rename default branch': '重新命名預設分支',
    'Renaming this branch:': '重新命名此分支後：',
    // draft release → 草稿發行版本（与 草稿議題、草稿拉取請求 同一词序）
    'draft release targeting this branch.': '個以此分支為目標的草稿發行版本。',
    'draft releases targeting this branch.': '個以此分支為目標的草稿發行版本。',
    // 产品名译中文：GitHub Pages → GitHub 頁面；Pages site → 頁面網站
    'Show details on unpublishing GitHub Pages site': '顯示取消發布 GitHub 頁面網站的詳細資料',
    'Hide details on unpublishing GitHub Pages site': '隱藏取消發布 GitHub 頁面網站的詳細資料',
    'Show details on updating local environment': '顯示更新本機環境的詳細資料',
    'Hide details on updating local environment': '隱藏更新本機環境的詳細資料',
    "Will not update your members' local environments.": '不會更新成員的本機環境。',
    'Will not update your members’ local environments.': '不會更新成員的本機環境。',
    "Your members will have to manually update their local environments. We'll let them know when they visit the repository, or you can share the following commands.":
      '成員必須手動更新本機環境。他們造訪儲存庫時會收到通知，你也可以分享下列命令。',
    'Your members will have to manually update their local environments. We’ll let them know when they visit the repository, or you can share the following commands.':
      '成員必須手動更新本機環境。他們造訪儲存庫時會收到通知，你也可以分享下列命令。',
  },
  scoped: {
    // 标签页、表格列与行操作（All、Default、Pull request、Restore、Deleted 由 common-ui 收录）
    Branches: '分支',
    Overview: '總覽',
    Yours: '你的',
    Active: '活躍',
    Stale: '過時',
    'All branches': '所有分支',
    Branch: '分支',
    Updated: '更新時間',
    Source: '來源',
    Your: '你的',
    // 重命名对话框：重新命名 <分支> 為：（Rename 由 common-ui 收录）
    'to:': '為：',
    // 重命名对话框的影响列表（数字在单独的元素中；片段原文无标点，译文不加）：
    // 將更新 <3> 個以此分支為目標的拉取請求。 / … 個以此分支為目標並分布於 <2> 個儲存庫的拉取請求。
    // 將更新 <1> 個明確針對下列分支的分支保護規則 <main>.
    'Will update': '將更新',
    'Will close': '將關閉',
    // 拉取请求一项的前半句整句见 inline，以下两条是整句未命中时的片段
    'pull request targeting this': '個以此',
    'pull requests targeting this': '個以此',
    'branch.': '分支為目標的拉取請求。',
    'branch across': '分支為目標並分布於',
    'repositories.': '個儲存庫的拉取請求。',
    'branch protection that explicitly targets': '個明確針對下列分支的分支保護規則',
    'branch protections that explicitly target': '個明確針對下列分支的分支保護規則',
    // 删除分支对话框：分支 <名称> 將永久刪除。
    'The branch': '分支',
    // 与 pulls、repository 词典的全局条目同译，按页面收录
    'Delete branch': '刪除分支',
    'Repository rule violations found': '發現違反儲存庫規則',
    'Protect this branch from force pushing or deletion, or require status checks before merging.':
      '保護此分支免於強制推送或刪除，或要求合併前通過狀態檢查。',
    'Protect this branch': '保護此分支',
  },
  regexp,
  ignore: [
    // 分支行更新者的用户名提示
    '[class*="UserLink__"] + [data-component="Tooltip"]',
  ],
  inline: [
    // 重命名对话框：Will update <span>3</span> pull requests targeting this <span>branch…</span>（宿主为 <div>）；
    // 按片段翻译时「以此」后的空白文本节点会留下空格，前半句整句收录，尾部 <span> 里的片段照常翻译
    ['Will update {} pull request targeting this {}', '將更新 {} 個以此{}'],
    ['Will update {} pull requests targeting this {}', '將更新 {} 個以此{}'],
  ],
} satisfies PageDictionary
