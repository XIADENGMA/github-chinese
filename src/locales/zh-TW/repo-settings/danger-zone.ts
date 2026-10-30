import type { PageDictionary } from '../../../core/types'

const REPO = '([\\w.-]+(?:/[\\w.-]+)?)'
const COUNT = '(\\d[\\d,]*)'

/** 可见性：英文 → 中文（可见度：公開 / 私人 / 內部） */
const VISIBILITY: Readonly<Record<string, string>> = {
  private: '私人',
  public: '公開',
  internal: '內部',
}

/**
 * 存储库设置 · 常规 · 危险区域：更改可见性、禁用分支保护规则、转让所有权、离开复刻网络、
 * 存档 / 取消存档、删除存储库，以及各自的确认对话框与提示。
 * 「Unexpected bad things will happen if you don’t read this!」「Before you archive, please consider:」
 * 已由 org-settings 收录。
 * 术语：transfer → 轉移，fork network → 分叉網路，detach → 分離，Duplicate the repository → 建立此儲存庫的副本
 * （「複製儲存庫」是 clone 的译法，避开），星号计数 → 顆星，关注者计数 → 位關注者。
 */
export default {
  static: {
    // 更改可见性
    'Change repository visibility': '變更儲存庫可見度',
    'This repository is currently public.': '此儲存庫目前為公開儲存庫。',
    'This repository is currently private.': '此儲存庫目前為私人儲存庫。',
    'This repository is currently internal.': '此儲存庫目前為內部儲存庫。',
    'Change to private': '變更為私人',
    'Change to public': '變更為公開',
    'Change to internal': '變更為內部',
    'You cannot change the visibility of a fork. please': '無法變更分叉的可見度。請',
    'You cannot change the visibility of a fork. Please': '無法變更分叉的可見度。請',
    'Duplicate the repository': '建立此儲存庫的副本',
    'For security reasons, you cannot change the visibility of a fork.': '基於安全性考量，無法變更分叉的可見度。',
    'I want to make this repository public': '我要將此儲存庫設為公開',
    'I want to make this repository private': '我要將此儲存庫設為私人',
    'I want to make this repository internal': '我要將此儲存庫設為內部',
    'The code will be visible to everyone who can visit https://github.com':
      '所有能造訪 https://github.com 的人都能看到程式碼',
    "Attachments uploaded to this repository's issues and pull requests will not be accessible unless it is made private again.":
      '除非重新設為私人，否則將無法存取上傳到此儲存庫議題和拉取請求的附件。',
    'Attachments uploaded to this repository’s issues and pull requests will not be accessible unless it is made private again.':
      '除非重新設為私人，否則將無法存取上傳到此儲存庫議題和拉取請求的附件。',
    'Anyone can fork your repository.': '任何人都可以分叉你的儲存庫。',
    'All push rulesets will be disabled.': '所有推送規則集都將停用。',
    'Your changes will be published as activity.': '你的變更將以活動的形式發布。',
    'Actions history and logs will be visible to everyone.': '所有人都將能查看 GitHub 動作的歷史記錄和記錄檔。',
    'Make this repository public': '將此儲存庫設為公開',
    'Make this repository private': '將此儲存庫設為私人',
    'Make this repository internal': '將此儲存庫設為內部',
    'Effects of making this repository public': '將此儲存庫設為公開的影響',
    'Effects of making this repository private': '將此儲存庫設為私人的影響',
    'Effects of making this repository internal': '將此儲存庫設為內部的影響',
    'Making this repository private could permanently erase these counts by removing stars and watchers associated to users that will no longer have access to this repository:':
      '將此儲存庫設為私人會移除不再具有此儲存庫存取權的使用者所加的星號和關注，可能因此永久清除以下計數：',
    'If you decide to make this repository public in the future, it will not be possible to restore these stars and watchers and this will affect its repository rankings.':
      '即使日後決定將此儲存庫設為公開，也無法還原這些星號和關注者，且會影響儲存庫排名。',
    'Dependency graph and Dependabot alerts will remain enabled with permission to perform read-only analysis on this repository.':
      '相依性圖表和 Dependabot 警示將維持啟用，並保有對此儲存庫執行唯讀分析的權限。',
    'Dependency graph and Dependabot alerts will remain enabled with permission to perform read-only analysis on this repository. Any custom Dependabot alert rules will be disabled unless GitHub Advanced Security is enabled for this repository.':
      '相依性圖表和 Dependabot 警示將維持啟用，並保有對此儲存庫執行唯讀分析的權限。除非此儲存庫已啟用 GitHub 進階安全性，否則所有自訂 Dependabot 警示規則都將停用。',
    'Any custom Dependabot alert rules will be disabled unless GitHub Advanced Security is enabled for this repository.':
      '除非此儲存庫已啟用 GitHub 進階安全性，否則所有自訂 Dependabot 警示規則都將停用。',
    'Code scanning will become unavailable.': '程式碼掃描將無法使用。',
    'Current forks will remain public and will be detached from this repository.':
      '現有分叉將維持公開，並與此儲存庫分離。',
    'Advanced Security will be disabled.': '進階安全性將停用。',
    'I have read and understand these effects': '我已閱讀並瞭解這些影響',
    'Warning: this is a destructive action': '警告：這是破壞性動作',
    'Warning: this is a destructive action.': '警告：這是破壞性動作。',
    'Warning: this is a potentially destructive action.': '警告：這可能是破壞性動作。',
    'To confirm, type the number of stars on this repository in the box below':
      '若要確認，請在下方方塊中輸入此儲存庫的星號數',
    'To confirm, type the number of stars on this repository in the box below.':
      '若要確認，請在下方方塊中輸入此儲存庫的星號數。',

    // 禁用 / 重新启用分支保护规则
    'Disable branch protection rules': '停用分支保護規則',
    'Disable branch protection rules enforcement and APIs': '停用分支保護規則的強制執行和 API',
    'This will hide the branch protection settings and disable branch protection rules for this repository.':
      '這將隱藏分支保護設定，並停用此儲存庫的分支保護規則。',
    'Disabling branch protection rules allows you to enforce branch and tag protections exclusively with Repository Rules.':
      '停用分支保護規則後，你可以僅透過儲存庫規則強制執行分支和標記保護。',
    'This action will disable:': '此動作將停用：',
    'Branch protection rule enforcement': '分支保護規則的強制執行',
    'Branch protection rule APIs': '分支保護規則 API',
    'will be disabled as part of this action': '將隨此動作一併停用',
    'Re-enable branch protection rules': '重新啟用分支保護規則',
    'Re-enable branch protection rules enforcement and APIs': '重新啟用分支保護規則的強制執行和 API',
    'Re-enable branch protection': '重新啟用分支保護',
    'will be re-enabled as part of this action': '將隨此動作一併重新啟用',
    'Branch protection settings saved.': '已儲存分支保護設定。',

    // 转让所有权（转让页面属于 new 页面类型）
    'Transfer ownership': '轉移擁有權',
    'Organization members cannot transfer repositories': '組織成員無法轉移儲存庫',
    'Organization members cannot transfer repositories.': '組織成員無法轉移儲存庫。',

    // 离开复刻网络
    'Leave fork network': '離開分叉網路',
    "Can't leave the fork network because this fork has child forks.": '此分叉有子分叉，因此無法離開分叉網路。',
    'Can’t leave the fork network because this fork has child forks.': '此分叉有子分叉，因此無法離開分叉網路。',
    "Can't detach forks larger than 1 GB.": '無法分離大於 1 GB 的分叉。',
    'Can’t detach forks larger than 1 GB.': '無法分離大於 1 GB 的分叉。',
    'Unlink this repository from the fork network and make it standalone.':
      '取消此儲存庫與分叉網路的連結，使其成為獨立儲存庫。',
    'Detach is in progress.': '正在分離。',
    'Detaching this repository.': '正在分離此儲存庫。',
    'This will permanently remove the fork relationship to the upstream repository':
      '這將永久移除與上游儲存庫的分叉關係',
    // 原文无标点，译文不加
    'will become a standalone repository and will no longer be able to fetch upstream updates or propose changes to the upstream repository':
      '將成為獨立儲存庫且無法再擷取上游更新或向上游儲存庫提議變更',
    'cannot rejoin the fork network.': '無法重新加入分叉網路。',

    // 存档
    'Archive this repository': '封存此儲存庫',
    'Mark this repository as archived and read-only.': '將此儲存庫標示為已封存且唯讀。',
    'Archive repository': '封存儲存庫',
    'This repository will become read-only.': '此儲存庫將變為唯讀。',
    'You will still be able to fork the repository and unarchive it at any time.': '你仍可隨時分叉此儲存庫或取消封存。',
    'All scheduled workflows will stop running.': '所有排程工作流程都將停止執行。',
    'Security features will be unavailable:': '安全性功能將無法使用：',
    'Security features will be interrupted:': '安全性功能將中斷：',
    'Code scanning will be paused': '程式碼掃描將暫停',
    'Updating any repository settings': '更新任何儲存庫設定',
    'Closing all open issues and pull requests': '關閉所有開放中的議題和拉取請求',
    'Making a note in your README': '在你的讀我檔案中新增說明',
    'I understand the consequences, archive this repository': '我瞭解後果，封存此儲存庫',

    // 取消存档
    'Unarchive this repository': '取消封存此儲存庫',
    'Mark this repository as unarchived and read-write.': '將此儲存庫標示為未封存且可讀寫。',
    'Unarchive repository': '取消封存儲存庫',
    'Once unarchived, the following can be modified and commented on:': '取消封存後，以下內容可以修改並留言：',
    'Security features will become available:': '安全性功能將可供使用：',
    'I understand the consequences, unarchive this repository': '我瞭解後果，取消封存此儲存庫',

    // 删除
    'Delete this repository': '刪除此儲存庫',
    'Effects of deleting this repository': '刪除此儲存庫的影響',
    'Once you delete a repository, there is no going back. Please be certain.':
      '儲存庫一經刪除便無法復原。請務必確定。',
    'Organization members cannot delete repositories.': '組織成員無法刪除儲存庫。',
    'Organization members cannot delete repositories': '組織成員無法刪除儲存庫',
    'I want to delete this repository': '我要刪除此儲存庫',
    'This will permanently delete the': '這將永久刪除',
    'repository, wiki, issues, comments, packages, secrets, workflow runs, and remove all collaborator associations.':
      '儲存庫及其 Wiki、議題、留言、套件、機密和工作流程執行，並移除所有協作者關聯。',
    'repository, wiki, issues, comments, packages, secrets, workflow runs, and remove all collaborator associations will be permanently deleted.':
      '儲存庫及其 Wiki、議題、留言、套件、機密和工作流程執行，並移除所有協作者關聯。',
    'repository, wiki, issues, comments, packages, secrets, workflow runs, and remove all team associations.':
      '儲存庫及其 Wiki、議題、留言、套件、機密和工作流程執行，並移除所有團隊關聯。',
    'This will not change your billing plan. If you want to downgrade, you can do so in your Billing Settings.':
      '這不會變更你的計費方案。如需降級，可以在帳務設定中變更。',
  },
  scoped: {
    'Danger Zone': '危險區域',
    'Danger zone': '危險區域',
    'Change visibility': '變更可見度',
    Transfer: '轉移',
    // 计数片段：<strong>12</strong> stars / watchers
    star: '顆星',
    stars: '顆星',
    watcher: '位關注者',
    watchers: '位關注者',
    'Dependabot alerts': 'Dependabot 警示',
    'Dependabot security updates': 'Dependabot 安全性更新',
    'Code scanning': '程式碼掃描',
    'Secret scanning': '機密掃描',
    Labels: '標籤',
    Milestones: '里程碑',
    'Please type': '請輸入',
    'to confirm.': '以確認。',
    'This will make': '這將使',
    'read-write.': '變為可讀寫。',
  },
  regexp: [
    // 可见性对话框
    [
      new RegExp(`^Make ${REPO} (private|public|internal)$`),
      (_, repo: string, visibility: string) => `將 ${repo} 設為${VISIBILITY[visibility] ?? visibility}`,
    ],
    [new RegExp(`^${COUNT} stars?$`), '$1 顆星'],
    [new RegExp(`^${COUNT} watchers?$`), '$1 位關注者'],
    [
      /^To confirm, type (?:"([^"]{1,200})"|“([^”]{1,200})”) in the box below(:?)$/,
      (_, straight: string, curly: string, colon: string) =>
        `若要確認，請在下方方塊中輸入「${straight || curly}」${colon ? '：' : ''}`,
    ],
    // 禁用 / 重新启用分支保护规则（规则量词作「個」，与 commits/branches.ts、org-settings/security.ts 一致）
    [/^(\d+) branch protection rules?$/, '$1 個分支保護規則'],
    // 存档 / 取消存档
    [new RegExp(`^Please type ${REPO} to confirm\\.$`), '請輸入 $1 以確認。'],
    [new RegExp(`^This will make ${REPO} read-write\\.$`), '這將使 $1 變為可讀寫。'],
    [/^Your repository "([^"]{1,200})" was successfully archived\.$/, '已封存儲存庫「$1」。'],
    [/^Your repository "([^"]{1,200})" was successfully unarchived\.$/, '已取消封存儲存庫「$1」。'],
    // 删除对话框标题：Delete owner/repo（必须含 /，避免误伤“Delete xxx”按钮）
    [/^Delete ([\w.-]+\/[\w.-]+)$/, '刪除 $1'],
    [
      new RegExp(
        `^This will permanently delete the ${REPO} repository, wiki, issues, comments, packages, secrets, workflow runs, and remove all (collaborator|team) associations\\.$`,
      ),
      (_, repo: string, kind: string) =>
        `這將永久刪除 ${repo} 儲存庫及其 Wiki、議題、留言、套件、機密和工作流程執行，並移除所有${kind === 'team' ? '團隊' : '協作者'}關聯。`,
    ],
  ],
} satisfies PageDictionary
