import type { PageDictionary } from '../../../core/types'

/**
 * 存储库设置 · 规则集的导入与转换：导入分支保护规则对话框、单条分支保护规则转换为规则集对话框、
 * 「用自定义属性选择目标」横幅与新建自定义属性侧栏。
 * 「Enforcement status」「Ruleset name」等编辑器通用文字见 rulesets.ts。
 * 术语：import → 匯入，migration → 移轉，enforce → 強制執行，bypass actor → 可繞過的執行者，cover → 涵蓋。
 */
export default {
  static: {
    // 规则集列表页横幅
    'You have branch protection rules that can be converted': '你有可以轉換的分支保護規則',
    'Rulesets offer layered enforcement, evaluate mode, and richer branch targeting. Import your existing rules to get started.':
      '規則集提供分層強制執行、評估模式和更豐富的分支目標設定。匯入現有規則以開始使用。',
    'Import branch protection rules': '匯入分支保護規則',

    // 导入分支保护规则对话框
    'Review import': '審查匯入',
    'Ruleset previews': '規則集預覽',
    'Create ruleset': '建立規則集',
    'Create rulesets': '建立規則集',
    'Creating ruleset': '正在建立規則集',
    'Creating rulesets': '正在建立規則集',
    'Keep rule': '保留規則',
    'Keep rules': '保留規則',
    'Delete branch protection rule': '刪除分支保護規則',
    'Delete branch protection rules': '刪除分支保護規則',
    'Too many rules selected': '選取的規則過多',
    'Selected branch protections would generate more than 75 rulesets.': '選取的分支保護會產生超過 75 個規則集。',
    'No rules selected': '未選取規則',
    'You must select at least one branch protection rule to import.': '必須至少選取一個要匯入的分支保護規則。',
    'No rules to create': '沒有可建立的規則',
    'The current selection would not create any new rulesets.': '目前的選取項目不會建立任何新規則集。',
    'Already covered by an existing ruleset': '已由現有規則集涵蓋',
    'No rulesets would be created': '不會建立任何規則集',
    'Failed to load previews.': '無法載入預覽。',
    'Your request timed out.': '請求已逾時。',
    'Failed to create rulesets.': '無法建立規則集。',
    'Failed to create rulesets and delete branch protection rules.': '無法建立規則集並刪除分支保護規則。',

    // 规则行为变化提示
    'New behavior': '新行為',
    'Require conversation resolution:': '要求解決對話：',
    "In rulesets, requiring conversation resolution also requires a pull request. Comment resolution itself works the same, except you can't bypass it by merging without a pull request.":
      '在規則集中，要求解決對話也會要求拉取請求。留言的解決方式不變，只是無法透過不經拉取請求直接合併來繞過。',
    'Merge queue and restricted pushers:': '合併佇列和受限推送者：',
    'In rulesets, enabling merge queue and restricting updates for the same branch is not supported.':
      '規則集不支援對同一分支同時啟用合併佇列和限制更新。',

    // 转换为规则集对话框
    'Convert to ruleset': '轉換為規則集',
    'Targeted branches': '目標分支',
    'Delete branch protection rule once migration is done': '移轉完成後刪除分支保護規則',
    'The new ruleset will enforce this branch.': '新規則集將對此分支強制執行。',
    'The new rulesets will enforce this branch.': '新規則集將對此分支強制執行。',
    'Ruleset name is invalid': '規則集名稱無效',
    'Unable to create the ruleset.': '無法建立規則集。',
    'Unable to load the migration preview.': '無法載入移轉預覽。',
    'This branch protection rule has no rules that can be converted to a ruleset yet.': '此分支保護規則中尚無可轉換為規則集的規則。',

    // 用自定义属性选择目标
    'Automate targeting with custom properties': '使用自訂屬性自動設定目標',
    'Create property': '建立屬性',
    'Set values for remaining repositories': '為其餘儲存庫設定值',
    'New custom property': '新增自訂屬性',
    'Save and apply': '儲存並套用',
    'Failed to fetch properties': '無法擷取屬性',
    'Value is required': '值為必填',
    'For the following repositories:': '針對下列儲存庫：',
    'Apply the following value:': '套用下列值：',
    'When you save:': '儲存時：',
    'This ruleset will be updated to target repositories by this property and value instead of by name.':
      '此規則集將改為依此屬性和值（而非名稱）選擇目標儲存庫。',
    'This is the default value that will be set for this property. Changing it has immediate effect, although on large organizations it may take minutes to be available in search results.':
      '這是將為此屬性設定的預設值。變更會立即生效，但在大型組織中，可能需要幾分鐘才會出現在搜尋結果中。',
    'When creating, transferring, or updating the property values of repositories, users must provide an explicit value.':
      '建立、轉移儲存庫或更新儲存庫的屬性值時，使用者必須提供明確的值。'
  },
  regexp: [
    // 导入对话框：<span>3 rulesets <span>will be created from 2 branch protection rules.</span></span>
    [/^will be created from (\d+) branch protection rules?\.$/, '將從 $1 個分支保護規則建立。'],
    [
      /^(\d+) rulesets? will be created\. Would you like to delete the (\d+) original branch protection rules? now covered by rulesets\?$/,
      '將建立 $1 個規則集。要刪除現已由規則集涵蓋的 $2 個原始分支保護規則嗎？'
    ],
    // 转换对话框
    [/^Create (\d+) rulesets from "(.{1,100})"$/, '從「$2」建立 $1 個規則集'],
    [/^Create (\d+) rulesets$/, '建立 $1 個規則集'],
    [/^This branch protection rule will be split into (\d+) rulesets\.$/, '此分支保護規則將拆分為 $1 個規則集。'],
    // 执行者可以是角色、团队或应用程序，量词作「個」
    [/^, with (\d+) bypass actors?$/, '，含 $1 個可繞過的執行者'],
    // 用自定义属性选择目标
    [
      /^You've manually selected (\d+) repositories\. A custom property lets you target them as a group and keeps the list up to date as repositories change\.$/,
      '你已手動選取 $1 個儲存庫。自訂屬性可將它們整組設為目標，並在儲存庫變動時讓清單保持最新。'
    ],
    [/^Ruleset updated to target (.{1,100}) value$/, '規則集已更新為以 $1 值為目標'],
    [
      /^The (.{1,100}) property has been created and applied to the (\d+) selected repositories\. You should make sure to set values for the remaining repositories\.$/,
      '已建立 $1 屬性並套用到 $2 個選取的儲存庫。請務必為其餘儲存庫設定值。'
    ],
    [/^This property will be set to this value on the (\d+) selected repositories\.$/, '此屬性將在 $1 個選取的儲存庫上設為此值。'],
    [/^and (\d+) more$/, '和其他 $1 個'],
    [/^Step (\d+) of (\d+)$/, '步驟 $1/$2']
  ]
} satisfies PageDictionary
