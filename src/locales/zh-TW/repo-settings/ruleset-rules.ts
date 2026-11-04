import type { PageDictionary } from '../../../core/types'

/** 合并方式：英文 → 中文 */
const MERGE_METHOD: Readonly<Record<string, string>> = {
  Merge: '合併',
  Squash: '壓縮',
  Rebase: '重定基底'
}

/** 元数据限制的对象：英文 → 中文 */
const METADATA_SUBJECT: Readonly<Record<string, string>> = {
  'Commit message': '提交訊息',
  'Author email': '作者電子郵件',
  'Committer email': '提交者電子郵件',
  'Branch name': '分支名稱',
  'Tag name': '標記名稱'
}

/** 元数据限制的匹配方式：英文 → 中文（matching pattern 是用户填写的「比對模式」） */
const METADATA_OPERATOR: Readonly<Record<string, string>> = {
  'start with a matching pattern': '以比對模式開頭',
  'end with a matching pattern': '以比對模式結尾',
  'contain a matching pattern': '包含比對模式',
  'match a given regex pattern': '符合指定的規則運算式'
}

/** 输入校验的字段：英文 → 中文 */
const FIELD: Readonly<Record<string, string>> = {
  'File path': '檔案路徑',
  'File extension': '副檔名',
  'Maximum file path length': '檔案路徑長度上限',
  'Maximum file size (MB)': '檔案大小上限 (MB)'
}

/** 输入校验的问题：英文 → 中文 */
const FIELD_PROBLEM: Readonly<Record<string, string>> = {
  'cannot be empty': '不可空白',
  'has already been added': '已加入',
  'must be a whole number': '必須為整數'
}

/**
 * 存储库设置 · 规则集的规则：分支 / 标记 / 推送规则及其参数（合并队列、部署、拉取请求与必需审查者、
 * 状态检查、代码扫描、代码质量、工作流、机密扫描、代码覆盖率、文件路径 / 扩展名 / 大小）、元数据限制、规则错误提示。
 * 与经典分支保护同名的规则（Require signed commits 等）见 branches.ts。
 * 术语：ref → 參考，matching → 相符（matching pattern 作「比對模式」），regex → 規則運算式，metadata → 中繼資料，
 * required（规则要求）→ 必要，threshold → 門檻，code coverage → 程式碼涵蓋率，dismiss（审查核准）→ 駁回，
 * pin（工作流固定到某个提交）→ 固定；阻挡推送、合并作「阻擋」，禁止某类推送作「禁止」。
 */
export default {
  static: {
    // 规则面板
    'Branch rules': '分支規則',
    'Tag rules': '標記規則',
    'Push rules': '推送規則',
    'Branch protections': '分支保護',
    'Tag protections': '標記保護',
    'Push protections': '推送保護',
    'No branch protections have been added': '尚未新增分支保護',
    'No tag protections have been added': '尚未新增標記保護',
    'No push protections have been added': '尚未新增推送保護',
    'Which rules should be applied to the targets that you have selected?': '要對你選取的目標套用哪些規則？',
    'Which rules should be applied?': '要套用哪些規則？',
    'Hide additional settings': '隱藏其他設定',
    'Show additional settings': '顯示其他設定',

    // 创建 / 更新 / 删除
    'Restrict creations': '限制建立',
    'Only allow users with bypass permission to create matching refs.': '僅允許具有繞過權限的使用者建立相符的參考。',
    'Restrict updates': '限制更新',
    'Only allow users with bypass permission to update matching refs.': '僅允許具有繞過權限的使用者更新相符的參考。',
    'Allow fork syncing': '允許同步分叉',
    'Branch can pull changes from its upstream repository': '分支可以從上游儲存庫拉取變更',
    'Restrict deletions': '限制刪除',
    'Only allow users with bypass permissions to delete matching refs.': '僅允許具有繞過權限的使用者刪除相符的參考。',
    'Prevent merge commits from being pushed to matching refs.': '禁止將合併提交推送到相符的參考。',
    'Block force pushes': '阻擋強制推送',
    'Prevent users with push access from force pushing to refs.': '禁止具有推送權限的使用者強制推送到參考。',

    // 合并队列
    'Merges must be performed via a merge queue.': '必須透過合併佇列合併。',
    'Limit the number of queued pull requests requesting checks and workflow runs at the same time.':
      '限制佇列中同時請求檢查和工作流程執行的拉取請求數量。',
    'Minimum group size': '最小群組大小',
    'The minimum number of PRs that will be merged together in a group.': '一個群組中一起合併的 PR 數量下限。',
    'Maximum group size': '最大群組大小',
    'The maximum number of PRs that will be merged together in a group.': '一個群組中一起合併的 PR 數量上限。',
    'Wait time to meet minimum group size (minutes)': '等待達到最小群組大小的時間（分鐘）',
    'The time merge queue should wait after the first PR is added to the queue for the minimum group size to be met. After this time has elapsed, the minimum group size will be ignored and a smaller group will be merged.':
      '第一個 PR 加入佇列後，合併佇列等待達到最小群組大小的時間。超過此時間後，將忽略最小群組大小並合併較小的群組。',
    'Require all queue entries to pass required checks': '要求所有佇列項目都通過必要檢查',
    'When this setting is disabled, only the commit at the head of the merge group, i.e. the commit containing changes from all of the PRs in the group, must pass its required checks to merge.':
      '停用此設定時，只有合併群組最前端的提交（即包含群組內所有 PR 變更的提交）須通過其必要檢查才能合併。',
    'Status check timeout (minutes)': '狀態檢查逾時（分鐘）',
    'Maximum time for a required status check to report a conclusion. After this much time has elapsed, checks that have not reported a conclusion will be assumed to have failed':
      '必要狀態檢查回報結論的時間上限。超過此時間仍未回報結論的檢查將視為失敗',
    'Repository settings load was cancelled': '已取消載入儲存庫設定',
    'Failed to load repository settings': '無法載入儲存庫設定',

    // 部署
    'Require deployments to succeed': '要求部署成功',
    'Choose which environments must be successfully deployed to before refs can be pushed into a ref that matches this rule.':
      '選擇哪些環境必須部署成功，才能將參考推送到符合此規則的參考。',
    'Required deployment environments': '必要的部署環境',
    'Add environments': '新增環境',
    'Select environments': '選擇環境',
    'Click to add environments': '按一下以新增環境',
    'No environments found': '找不到環境',
    'Search for deployment environments': '搜尋部署環境',
    'No deployment environments have been added': '尚未新增部署環境',
    'Learn more about deployment environments': '瞭解部署環境',

    // 签名提交、拉取请求
    'Commits pushed to matching refs must have verified signatures.': '推送到相符參考的提交必須具有已驗證的簽章。',
    'Require all commits be made to a non-target branch and submitted via a pull request before they can be merged.':
      '所有提交都必須先提交到非目標分支並透過拉取請求送出，才能合併。',
    'Required approvals': '必要的核准數',
    'The number of approving reviews that are required before a pull request can be merged.': '合併拉取請求前所需的核准審查數量。',
    'New, reviewable commits pushed will dismiss previous pull request review approvals.':
      '推送新的可審查提交時，將駁回先前的拉取請求審查核准。',
    'Require an approving review in pull requests that modify files that have a designated code owner.':
      '拉取請求修改有指定程式碼擁有者的檔案時，須取得核准審查。',
    'All conversations on code must be resolved before a pull request can be merged.': '必須先解決程式碼上的所有對話，拉取請求才能合併。',
    'Require an additional approval for unattributed Copilot pull requests': '要求未署名的 Copilot 拉取請求額外取得一次核准',
    'When Copilot opens a pull request without a human collaborator, require one more approving review if a non-zero approval count is required.':
      '當 Copilot 在沒有人類協作者的情況下建立拉取請求時，若所需核准數不為零，則要求多一次核准審查。',
    'Allowed merge methods': '允許的合併方式',
    'When merging pull requests, you can allow any combination of merge commits, squashing, or rebasing. At least one option must be enabled.':
      '合併拉取請求時，你可以允許合併提交、壓縮或重定基底的任意組合。必須至少啟用一個選項。',

    // 必需审查者（指定团队审查匹配文件）
    'Require review from specific teams': '要求特定團隊審查',
    'A collection of reviewers and associated file patterns. Each reviewer has a list of file patterns which determine the files that reviewer is required to review.':
      '審查者及其關聯檔案模式的集合。每個審查者都有一組檔案模式，用以決定該審查者必須審查的檔案。',
    'Add reviewer': '新增審查者',
    'Edit reviewer': '編輯審查者',
    'Reviewer details': '審查者詳細資料',
    'No reviewers have been added': '尚未新增審查者',
    'Reviewer not found': '找不到審查者',
    'Reviewer was not found': '找不到審查者',
    'Select reviewer': '選擇審查者',
    'Search reviewers': '搜尋審查者',
    'Pagination for required reviewers': '必要審查者分頁',
    'Pull requests which change matching files must be approved by the specified team.': '變更相符檔案的拉取請求必須經指定團隊核准。',
    'Pull requests which change matching files must be approved by the specified team. File patterns use fnmatch syntax.':
      '變更相符檔案的拉取請求必須經指定團隊核准。檔案模式使用 fnmatch 語法。',
    'A reviewer must be selected': '必須選擇審查者',
    'This team is already added as a reviewer': '此團隊已加入為審查者',
    'At least one file pattern must be specified': '必須至少指定一個檔案模式',
    'Failed to read response': '無法讀取回應',
    'No teams found': '找不到團隊',
    'Adjust your search term to find other teams. Only visible teams can be added as reviewers.':
      '調整搜尋字詞以尋找其他團隊。只能將可見團隊新增為審查者。',
    'Only visible teams can be added as reviewers.': '只能將可見團隊新增為審查者。',

    // Copilot 代码审查
    'Request pull request review from Copilot': '請求 Copilot 審查拉取請求',
    'Automatically request review from Copilot for new pull requests, if the author has access to Copilot code review.':
      '若作者可以使用 Copilot 程式碼審查，則自動請求 Copilot 審查新的拉取請求。',
    'Request Copilot code review for new pull requests automatically if the author has access to Copilot code review and their premium requests quota has not reached the limit.':
      '若作者可以使用 Copilot 程式碼審查且進階請求配額尚未達到上限，則自動請求 Copilot 審查新的拉取請求。',
    'Request Copilot code review for new pull requests automatically if the author has access to Copilot code review and AI credits.':
      '若作者可以使用 Copilot 程式碼審查且有 AI 點數，則自動請求 Copilot 審查新的拉取請求。',
    'Review new pushes': '審查新推送',
    'Copilot automatically reviews each new push to the pull request.': 'Copilot 會自動審查拉取請求的每次新推送。',
    'Review draft pull requests': '審查草稿拉取請求',
    'Copilot automatically reviews draft pull requests before they are marked as ready for review.':
      'Copilot 會在草稿拉取請求標示為可供審查之前自動審查。',
    'Automated code reviews on push': '推送時自動審查程式碼',
    'Manage static analysis tools in Copilot code review': '管理 Copilot 程式碼審查中的靜態分析工具',
    'Copilot code review will include findings from the selected static analysis tools in its review comments.':
      'Copilot 程式碼審查會在審查留言中納入所選靜態分析工具的發現項目。',

    // 状态检查
    'Require status checks to pass': '要求通過狀態檢查',
    'Choose which status checks must pass before the ref is updated. When enabled, commits must first be pushed to another ref where the checks pass.':
      '選擇更新參考前必須通過哪些狀態檢查。啟用後，提交必須先推送到其他參考並通過檢查。',
    'Whether pull requests targeting a matching branch must be tested with the latest code. This setting will not take effect unless at least one status check is enabled.':
      '以相符分支為目標的拉取請求是否必須以最新程式碼測試。至少啟用一項狀態檢查後，此設定才會生效。',
    'Enter the name of a status check': '輸入狀態檢查名稱',
    'No required checks': '沒有必要檢查',
    'Add checks': '新增檢查',
    'Add Checks': '新增檢查',
    'Search for checks': '搜尋檢查',
    'No matching checks found': '找不到相符的檢查',
    'Start typing to find status checks to require.': '開始輸入以尋找要設為必要的狀態檢查。',
    'No checks have been added': '尚未新增檢查',
    'Any source': '任何來源',
    'Select source': '選擇來源',

    // 代码扫描
    'Require code scanning results': '要求程式碼掃描結果',
    'Choose which tools must provide code scanning results before the reference is updated. When configured, code scanning must be enabled and have results for both the commit and the reference being updated.':
      '選擇更新參考前必須提供程式碼掃描結果的工具。設定後，必須啟用程式碼掃描，且提交和要更新的參考都必須有掃描結果。',
    'Code scanning tools': '程式碼掃描工具',
    'Required tools and alert thresholds': '必要工具和警示門檻',
    'No code scanning tools specified': '未指定程式碼掃描工具',
    'Learn more about code scanning thresholds': '瞭解程式碼掃描門檻',
    'Enter a tool name': '輸入工具名稱',
    'Enter the name of a code scanning tool': '輸入程式碼掃描工具名稱',
    'Delete tool': '刪除工具',
    'Security alerts threshold': '安全性警示門檻',
    'Alerts threshold': '警示門檻',
    // 严重性 High / Medium → 高 / 中；「以上」含本级
    'High or higher': '高以上',
    'Medium or higher': '中以上',
    'Errors and Warnings': '錯誤和警告',
    'Tools that must provide code scanning results for this rule to pass.': '必須提供程式碼掃描結果才能通過此規則的工具。',
    'Learn more about enabling code scanning.': '瞭解如何啟用程式碼掃描。',
    'Please select at least one code scanning tool': '請至少選擇一個程式碼掃描工具',

    // 代码质量
    'Require code quality results': '要求程式碼品質結果',
    'Choose which severity levels of code quality results should block pull request merges. When configured, a code quality analysis must be done on the pull request before the changes can be merged.':
      '選擇哪些嚴重性層級的程式碼品質結果應阻擋拉取請求合併。設定後，必須先對拉取請求完成程式碼品質分析，才能合併變更。',
    'Warnings and higher': '警告以上',
    'Notes and higher': '附註以上',
    'The lowest severity level at which code quality reviews need to be resolved before commits can be merged.':
      '合併提交前須解決的程式碼品質審查最低嚴重性層級。',

    // 工作流
    'Require workflows to pass before merging': '要求合併前通過工作流程',
    'Require all changes made to a targeted branch to pass the specified workflows before they can be merged.':
      '對目標分支所做的所有變更都必須通過指定的工作流程，才能合併。',
    'Workflow configurations': '工作流程設定',
    'No workflow configurations found': '找不到工作流程設定',
    'Add required workflow': '新增必要工作流程',
    'Workflow already exists': '工作流程已存在',
    'Unknown repository': '未知的儲存庫',
    'Select branch or tag': '選擇分支或標記',
    'Branch or tag': '分支或標記',
    'Pin to commit': '固定到提交',
    'Always reference the current commit': '一律參考目前的提交',
    'Enter a SHA': '輸入 SHA',
    'Enter a valid SHA': '輸入有效的 SHA',
    'Enter the SHA for the commit you want to reference': '輸入要參考的提交 SHA',
    'Invalid SHA': '無效的 SHA',
    'Valid SHA': '有效的 SHA',
    'Validating...': '驗證中...',
    'Validating…': '驗證中…',
    'Pick a workflow file': '選擇工作流程檔案',
    'Please select a workflow path': '請選擇工作流程路徑',
    'Organizations could not be loaded. Try searching again.': '無法載入組織。請再搜尋一次。',
    'Repositories could not be loaded. Try searching again.': '無法載入儲存庫。請再搜尋一次。',
    'Required workflows could not be loaded': '無法載入必要工作流程',
    'Please select an organization': '請選擇組織',
    'Select organization': '選擇組織',
    'Please select a repository': '請選擇儲存庫',

    // 机密扫描、许可证、代码覆盖率
    'Require secret scanning alerts are resolved': '要求解決機密掃描警示',
    'Choose which secret scanning alerts should block pull request merges. When configured, secret scanning alerts created from the pull request must be resolved before the changes can be merged. Secret Protection must be enabled.':
      '選擇哪些機密掃描警示應阻擋拉取請求合併。設定後，必須先解決拉取請求產生的機密掃描警示，才能合併變更。必須啟用機密保護。',
    'Secret types': '機密類型',
    'Provider patterns': '提供者模式',
    'Secrets tied to a specific service provider.': '與特定服務提供者關聯的機密。',
    'Secrets detected using regular expression patterns defined by your organization.': '使用組織定義的規則運算式模式偵測到的機密。',
    'Secrets not tied to a specific provider, detected with deterministic methods.': '不與特定提供者關聯、以確定性方法偵測到的機密。',
    'Require license compliance results before merging': '要求合併前取得授權條款合規性結果',
    "Enforce any added or changed dependencies to comply with the organization's license policy.":
      '強制要求新增或變更的相依項目符合組織的授權條款政策。',
    'Restrict code coverage': '限制程式碼涵蓋率',
    'Enforce minimum line coverage thresholds on pull requests. This rule evaluates uploaded coverage data but does not wait for coverage uploads. To ensure coverage is evaluated before merging, make each status check associated with a coverage upload a required status check.':
      '對拉取請求強制執行最低行涵蓋率門檻。此規則會評估已上傳的涵蓋率資料，但不會等待涵蓋率上傳。若要確保合併前評估涵蓋率，請將每個與涵蓋率上傳關聯的狀態檢查設為必要狀態檢查。',
    'Minimum line coverage percentage': '最低行涵蓋率百分比',
    'Maximum line coverage drop': '行涵蓋率最大降幅',

    // 多选参数
    'Click to add values': '按一下以新增值',
    'Add values': '新增值',
    'Select values': '選擇值',
    'No values have been added': '尚未新增值',

    // 推送规则
    'Restrict file paths': '限制檔案路徑',
    'Prevent commits that include changes in specified file paths from being pushed.': '禁止推送包含指定檔案路徑變更的提交。',
    'Restrict file path length': '限制檔案路徑長度',
    'Prevent commits that include file paths that exceed a specified character limit from being pushed.':
      '禁止推送檔案路徑超過指定字元數上限的提交。',
    'Restrict file extensions': '限制副檔名',
    'Prevent commits that include files with specified file extensions from being pushed.': '禁止推送包含指定副檔名檔案的提交。',
    'Restrict file size': '限制檔案大小',
    'Prevent commits that exceed a specified file size limit from being pushed.': '禁止推送超過指定檔案大小上限的提交。',
    'Restricted file paths': '受限的檔案路徑',
    'Add restricted path': '新增受限路徑',
    'No restricted paths': '沒有受限路徑',
    'File path': '檔案路徑',
    'Examples: `.github/**/*`, `**/*.exe`': '範例：`.github/**/*`、`**/*.exe`',
    'File path is too long. Maximum length is 200 characters': '檔案路徑過長。長度上限為 200 個字元',
    'fnmatch patterns': 'fnmatch 模式',
    'for files and folders.': '比對檔案和資料夾。',
    'Allowed exceptions': '允許的例外',
    'Add allowed path': '新增允許的路徑',
    'Add a restricted path before adding exceptions': '新增例外前須先新增受限路徑',
    'No allowed exceptions': '沒有允許的例外',
    'Restricted file extensions': '受限的副檔名',
    'Add file extension': '新增副檔名',
    'File extension': '副檔名',
    'Commits that include files with the specified file extension will be rejected.': '包含指定副檔名檔案的提交將遭拒絕。',
    'Examples: `bin`, `exe`': '範例：`bin`、`exe`',
    'No file extensions': '沒有副檔名',
    'File extension cannot contain \\, /, or *': '副檔名不可包含 \\、/ 或 *',
    'File extension is too long. Maximum length is 200 characters': '副檔名過長。長度上限為 200 個字元',
    'Maximum file path length': '檔案路徑長度上限',
    'Maximum file path length:': '檔案路徑長度上限：',
    'Maximum file size (MB)': '檔案大小上限 (MB)',
    'Maximum file size (MB):': '檔案大小上限 (MB)：',
    'This limit does not apply to Git Large File Storage (Git LFS).': '此限制不適用於 Git 大型檔案儲存 (Git LFS)。',
    // 受限提交
    'Contains secret(s)': '包含機密',
    'Contains sensitive information': '包含敏感資訊',
    'Company IP': '公司智慧財產',
    'Add full or abbreviated commit hash': '新增完整或縮寫的提交雜湊',
    'Commit ID': '提交 ID',
    'Select reason': '選擇原因',
    'Other reason': '其他原因',
    'No commit IDs have been added yet': '尚未新增提交 ID',
    // 原文无标点，译文不加
    'Add a commit ID restriction to prevent specific commits from ever being accepted into target branches':
      '新增提交 ID 限制以禁止特定提交進入目標分支',

    // 按名称匹配存储库（组织规则集）
    'Specify if repository names must match or cannot match the naming pattern.': '指定儲存庫名稱必須符合還是不得符合命名模式。',
    'Must match': '必須符合',
    'Repository names must match the specified naming pattern.': '儲存庫名稱必須符合指定的命名模式。',
    'Cannot match': '不得符合',
    'Repository names cannot match the specified naming pattern.': '儲存庫名稱不得符合指定的命名模式。',

    // 元数据限制
    'Restrict commit metadata': '限制提交中繼資料',
    'Restrict commit author email addresses, committer email addresses, commit message content, and other metadata':
      '限制提交作者電子郵件地址、提交者電子郵件地址、提交訊息內容和其他中繼資料',
    'Restrict commit messages': '限制提交訊息',
    'Restrict commit author emails': '限制提交作者電子郵件',
    'Restrict committer emails': '限制提交者電子郵件',
    'Restrict branch names': '限制分支名稱',
    'Restrict tag names': '限制標記名稱',
    'Metadata restrictions': '中繼資料限制',
    'Metadata restrictions are available to Enterprise organizations': '中繼資料限制可供企業版組織使用',
    'Metadata restrictions can ensure that commit messages contain a GitHub issue number, or enforce the format of new branch and tag names.':
      '中繼資料限制可確保提交訊息包含 GitHub 議題編號，或強制執行新分支和標記名稱的格式。',
    'Learn more about metadata restrictions': '瞭解中繼資料限制',
    'No metadata restrictions have been added': '尚未新增中繼資料限制',
    'No restrictions have been added': '尚未新增限制',
    'Add restriction': '新增限制',
    'Add a metadata restriction': '新增中繼資料限制',
    'Edit a metadata restriction': '編輯中繼資料限制',
    'All metadata restrictions have been used': '已用完所有中繼資料限制',
    'This ruleset uses all metadata restriction types. You can edit the existing restrictions or remove them to add new ones.':
      '此規則集已使用所有中繼資料限制類型。你可以編輯現有限制，或移除限制以新增其他限制。',
    'Edit this metadata rule': '編輯此中繼資料規則',
    'Delete this metadata rule': '刪除此中繼資料規則',
    'Restore this metadata rule': '還原此中繼資料規則',
    'start with a matching pattern': '以比對模式開頭',
    'end with a matching pattern': '以比對模式結尾',
    'contain a matching pattern': '包含比對模式',
    'match a given regex pattern': '符合指定的規則運算式',
    'Must start with a matching pattern': '必須以比對模式開頭',
    'Must end with a matching pattern': '必須以比對模式結尾',
    'Must contain a matching pattern': '必須包含比對模式',
    'Must match a given regex pattern': '必須符合指定的規則運算式',
    'Must not start with a matching pattern': '不得以比對模式開頭',
    'Must not end with a matching pattern': '不得以比對模式結尾',
    'Must not contain a matching pattern': '不得包含比對模式',
    'Must not match a given regex pattern': '不得符合指定的規則運算式',
    'Matching pattern': '比對模式',
    'How this rule appears when configuring it.': '設定時此規則的顯示方式。',
    'How this rule will appear to your': '此規則向你的',
    "'s users throughout": '使用者顯示的方式，範圍涵蓋',
    '’s users throughout': '使用者顯示的方式，範圍涵蓋',

    // 规则错误
    'An error occurred': '發生錯誤',
    'Restricted file paths cannot be empty. Please add at least one restricted file path or disable the rule.':
      '受限的檔案路徑不可空白。請至少新增一個受限的檔案路徑，或停用此規則。',
    'Restricted file extensions cannot be empty. Please add at least one restricted file extension or disable the rule.':
      '受限的副檔名不可空白。請至少新增一個受限的副檔名，或停用此規則。',
    'Merge queue rules are only supported for named branches or the default branch. Please adjust your branch targets.':
      '合併佇列規則僅支援具名分支或預設分支。請調整分支目標。',
    'Repository conditions cannot be empty': '儲存庫條件不可空白',
    'Required deployments cannot be empty. Please add at least one deployment or disable the rule.':
      '必要的部署不可空白。請至少新增一個部署，或停用此規則。',
    'Required status checks cannot be empty. Please add at least one status check or disable the rule.':
      '必要狀態檢查不可空白。請至少新增一項狀態檢查，或停用此規則。',
    'Workflows cannot be empty. Please add at least one workflow or disable the rule.':
      '工作流程不可空白。請至少新增一個工作流程，或停用此規則。'
  },
  scoped: {
    Merge: '合併',
    Squash: '壓縮',
    Rebase: '重定基底',
    Alerts: '警示',
    Errors: '錯誤',
    // 代码扫描阈值：编辑时为「Alerts:」，只读时为「Alerts threshold:」
    'Alerts:': '警示：',
    'Security alerts:': '安全性警示：',
    'Alerts threshold:': '警示門檻：',
    'Security alerts threshold:': '安全性警示門檻：',
    'Tool name': '工具名稱',
    Restrictions: '限制',
    Requirement: '要求',
    Must: '必須',
    'Must not': '不得',
    Metadata: '中繼資料',
    metadata: '中繼資料',
    restrictions: '限制',
    Negate: '反向',
    'Branch name': '分支名稱',
    'Tag name': '標記名稱',
    'Commit message': '提交訊息',
    'Additional settings': '其他設定',
    'Add workflow': '新增工作流程',
    Reviewer: '審查者',
    'File patterns': '檔案模式',
    // 文件路径限制说明：<字段说明> Supports <a>fnmatch patterns</a> for files and folders.（支援 fnmatch 模式比對檔案和資料夾。）
    Supports: '支援'
  },
  regexp: [
    // 元数据限制说明：Commit message must start with a matching pattern
    [
      /^(Commit message|Author email|Committer email|Branch name|Tag name) must (not )?(start with a matching pattern|end with a matching pattern|contain a matching pattern|match a given regex pattern)$/,
      (_, subject: string, not: string, operator: string) =>
        `${METADATA_SUBJECT[subject] ?? subject}${not ? '不得' : '必須'}${METADATA_OPERATOR[operator] ?? operator}`
    ],
    // 允许的合并方式组合：Merge, Squash, Rebase
    [
      /^(?:Merge|Squash|Rebase)(?:, (?:Merge|Squash|Rebase)){1,2}$/,
      (match: string) =>
        match
          .split(', ')
          .map(method => MERGE_METHOD[method] ?? method)
          .join('、')
    ],
    // 状态检查搜索结果：Already added ci/build、Add ci/build（只认带 / : . _ - 的检查名，避免误伤普通按钮）
    [/^Already added (.{1,100})$/, '已加入 $1'],
    [/^Add ([^\s/:._-]*[/:._-]\S*)$/, '新增 $1'],
    // 多选参数：Select all (3)
    [/^Select all \((\d+)\)$/, '全選 ($1)'],
    // 必需审查者（审查者量词作「位」）
    [/^(\d+) reviewers?$/, '$1 位審查者'],
    [/^Show \+(\d+) more$/, '再顯示 $1 個'],
    [/^\+ (\d+) more$/, '+ $1 個'],
    [/^No teams found for '(.{1,100})'$/, '找不到與「$1」相符的團隊'],
    // 文件路径 / 扩展名 / 大小输入校验：File path cannot be empty
    [
      /^(File path|File extension|Maximum file path length|Maximum file size \(MB\)) (cannot be empty|has already been added|must be a whole number)$/,
      (_, field: string, problem: string) => {
        const name = FIELD[field] ?? field
        // 半角括号与中文之间空一格：檔案大小上限 (MB) 必須為整數
        return `${name}${name.endsWith(')') ? ' ' : ''}${FIELD_PROBLEM[problem] ?? problem}`
      }
    ]
  ]
} satisfies PageDictionary
