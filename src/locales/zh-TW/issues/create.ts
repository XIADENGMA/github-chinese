import type { PageDictionary } from '../../../core/types'

/** 新建对象：议题 / 子议题 */
const RELATION: Readonly<Record<string, string>> = { issue: '議題', 'sub-issue': '子議題' }

/** 跨存储库克隆时可能丢失的元数据 */
const METADATA: Readonly<Record<string, string>> = {
  Milestone: '里程碑',
  Labels: '標籤',
  Assignees: '負責人',
  Fields: '欄位',
  Type: '類型',
}

const REPO_SOURCE = '[\\w.-]+\\/[\\w.-]+'

function relation(name: string): string {
  return RELATION[name] ?? name
}

/**
 * 新建议题：模板选择页、新建页与新建对话框（标题、描述、继续创建、存储库切换）、议题表单元素、
 * 可能重复的议题、使用 Copilot 生成内容、权限受限提示、首次贡献提示、议题模板编辑器。
 */
export default {
  static: {
    // 页头与模板选择
    'Create new issue': '建立新議題',
    'Create new issue in': '建立新議題於',
    // 模板选择页的标签页标题
    'Choose an Issue Template': '選擇議題範本',
    'Back to templates': '返回範本',
    'Choose a different template': '選擇其他範本',
    'Templates and forms': '範本和表單',
    'No templates available for the current repository': '目前的儲存庫沒有可用的範本',
    'Failed to load templates.': '無法載入範本。',
    'Blank issue': '空白議題',
    'Create a new issue from scratch': '從頭建立新議題',
    'Maintainers only': '僅限維護者',
    'Report a security vulnerability': '回報安全性漏洞',
    'Please review our security policy for more details': '詳情請參閱我們的安全性政策',
    'Edit templates': '編輯範本',
    'View templates': '查看範本',
    'Issues are disabled for the selected repository. Please select a different repository.':
      '選取的儲存庫已停用議題。請選擇其他儲存庫。',
    'Unable to load top repositories': '無法載入常用儲存庫',
    // 存储库选择按钮（按钮文字 Select repository 由通用词典处理，各状态的无障碍名称同用「儲存庫」）
    'No repository selected': '未選擇儲存庫',
    'Select repository (required)': '選擇儲存庫（必填）',
    'Choose repository to clone issue in': '選擇要複製議題的目標儲存庫',
    'Changing the repository may remove Milestone, Labels, Type, and Assignees from the cloned issue.':
      '變更儲存庫可能會從複製的議題中移除里程碑、標籤、類型和負責人。',

    // 首次贡献与贡献指南更新提示（新建议题页与比较页，放 static）：Be sure to review the <contributing guidelines>.
    'It looks like this is your first time opening an issue in this project!': '看來這是你第一次在此專案中建立議題！',
    'It looks like this is your first time opening a pull request in this project!':
      '看來這是你第一次在此專案中建立拉取請求！',
    'Be sure to review the': '請務必詳閱',
    // Documentation has changed since you last contributed. Take a look before submitting an issue: <Contributing guidelines>
    'Documentation has changed since you last contributed': '自你上次貢獻以來說明文件已變更',
    '. Take a look before submitting an issue:': '。送出議題前請先查看：',
    '. Take a look before submitting a pull request:': '。送出拉取請求前請先查看：',
    'Contributing guidelines': '貢獻指南',

    // 议题表单提示：You’re using an <issue form>, a new type of issue template.（前两段见 scoped）
    ', a new type of issue template.': '，這是一種新型議題範本。',

    // 表单
    'Add a description': '新增描述',
    'Set additional issue fields': '設定其他議題欄位',
    'Set date': '設定日期',
    'Select status': '選擇狀態',
    'Projects are unavailable': '專案無法使用',
    'You do not have permission to change the type': '你沒有變更類型的權限',
    'You need the triage role or higher in this repository to change the issue type.':
      '你需要此儲存庫的分類角色或更高角色才能變更議題類型。',
    'Paste, drop, or click to add files': '貼上、拖放或按一下以新增檔案',
    'Failed to upload file. Please try again.': '無法上傳檔案。請再試一次。',

    // 页脚（Submit new issue 是经典新建页的提交按钮）
    'Submit new issue': '送出新議題',
    'Create more': '繼續建立',
    'Create more sub-issues': '繼續建立子議題',
    'Issue created': '議題已建立',
    'Issue will be created once your upload has completed': '上傳完成後將建立議題',

    // 错误与受限
    'Failed to create issue': '無法建立議題',
    'Unable to create issue.': '無法建立議題。',
    'Unable to selected template': '無法載入選取的範本',
    'Unable to load repository details.': '無法載入儲存庫詳細資料。',
    'Current user not found': '找不到目前的使用者',
    'Action restricted': '動作受限',
    'Back to all issues': '返回所有議題',
    'An owner of this repository has limited the ability to create an issue to users that are collaborators.':
      '此儲存庫的擁有者已限制只有協作者才能建立議題。',

    // 可能重复的议题
    'Potential duplicate': '可能重複',
    'No potential duplicates': '沒有可能重複的議題',
    'View all potential duplicates': '查看所有可能重複的議題',

    // 使用 Copilot 撰写；产品名按术语表第 3 节译成中文：Copilot Chat → Copilot 聊天
    'Navigate to Copilot Chat': '前往 Copilot 聊天',
    'Go to Copilot': '前往 Copilot',
    'Generate issue content with Copilot': '使用 Copilot 產生議題內容',
    'Additional context (optional)': '額外上下文（選填）',
    'Add any additional context to help Copilot generate a better issue...':
      '新增任何額外上下文，幫助 Copilot 產生更好的議題...',
    'Generate content': '產生內容',
    'Failed to generate content with Copilot. Please try again.': '無法使用 Copilot 產生內容。請再試一次。',
    'Please provide a title, existing description, or additional context to generate content.':
      '請提供標題、現有描述或額外上下文以產生內容。',
    'How can I help you write your issue?': '我可以如何協助你撰寫議題？',
    'Type your message here...': '在此輸入訊息...',
    "I've updated the issue title and description above.": '我已更新上方的議題標題和描述。',
    'I’ve updated the issue title and description above.': '我已更新上方的議題標題和描述。',
    'Writing…': '撰寫中…',
    'Try again?': '再試一次？',
    'You have made edits to the generated content. Discarding will lose your changes.':
      '你已編輯產生的內容。捨棄將會遺失你的變更。',
    'You have made edits to the generated content. Trying again will replace your changes with new generated content.':
      '你已編輯產生的內容。再試一次會以新產生的內容取代你的變更。',

    // 议题模板编辑器（/issues/templates/edit）；Add template: 后的下拉按钮 select 见 scoped
    'Add template:': '新增範本：',
    'Standard bug report template': '標準錯誤回報範本',
    'Standard feature request template': '標準功能請求範本',
    'Custom template': '自訂範本',
    'Blank template for other issue types': '用於其他議題類型的空白範本',
    'Preview and edit': '預覽並編輯',
    'Template name': '範本名稱',
    // 后接 .github/ISSUE_TEMPLATE/ 下的文件路径
    'This file lives in': '此檔案位於',
    'Template content': '範本內容',
    'Optional additional items': '選填的其他項目',
    'Issue default title': '議題預設標題',
    'This will be suggested as the issue title': '這將作為建議的議題標題',
    'Add a placeholder for issue title, ex. [BUG]': '新增議題標題的預留位置，例如 [BUG]',
    // GitHub 默认模板的说明（同 labels.ts 默认标签说明；默认模板名不译）
    'Create a report to help us improve': '建立回報以協助我們改進',
    'Suggest an idea for this project': '為此專案提出想法',
    "Describe this issue template's purpose here.": '在此描述此議題範本的用途。',
  },
  scoped: {
    // 标题输入框占位符与 aria-label（Copilot 页面另有同名词条）
    'Add a title': '新增標題',
    'View less': '顯示較少',
    // 议题表单提示的前两段：You’re using an <issue form>
    "You're using an": '你正在使用',
    'You’re using an': '你正在使用',
    'issue form': '議題表單',
    // 模板编辑器 Add template: 后的下拉按钮
    select: '選擇',
  },
  regexp: [
    // 对话框标题：Create new sub-issue、Create new issue - "标题"
    [/^Create new sub-issue$/, '建立新子議題'],
    [/^Create new (issue|sub-issue) - "(.+)"$/, (_, type, title) => `建立新${relation(type)} - 「${title}」`],
    // Create new issue in owner/repo[: 模板名]
    [
      new RegExp(`^Create new (issue|sub-issue) in (${REPO_SOURCE})(?:: (.+))?$`),
      (_, type, repo, template) => `在 ${repo} 中建立新${relation(type)}${template ? `：${template}` : ''}`,
    ],
    [
      new RegExp(`^Clone current (issue|sub-issue) in (${REPO_SOURCE})$`),
      (_, type, repo) => `在 ${repo} 中複製目前的${relation(type)}`,
    ],
    // 存储库选择按钮：Selected repository: owner/repo (required)
    [
      /^Selected repository: ([\w.-]+(?:\/[\w.-]+)?)( \(required\))?$/,
      (_, repo, required) => `已選擇的儲存庫：${repo}${required ? '（必填）' : ''}`,
    ],
    // 继续创建后的链接与播报
    [/^Issue #(\d+) created$/, '議題 #$1 已建立'],
    // 可能重复（dismiss 按术语表对提示应译「關閉」，但「關閉…議題」会被读成关闭议题本身，改译「隱藏」）
    [/^([\d,]+) potential duplicates?$/, '$1 個可能重複的議題'],
    [/^Dismiss potential duplicates?$/, '隱藏可能重複的議題'],
    // 跨存储库克隆提示
    [
      /^This issue is being cloned across repositories\. The following metadata might not be copied: ((?:Milestone|Labels|Assignees|Fields|Type)(?:, (?:Milestone|Labels|Assignees|Fields|Type))*)\.$/,
      (_, list: string) =>
        `正在跨儲存庫複製此議題。以下中繼資料可能不會一併複製：${list
          .split(', ')
          .map((name) => METADATA[name] ?? name)
          .join('、')}。`,
    ],
    // 议题表单上传
    [/^Uploading (\d+) files?\.\.\.$/, '正在上傳 $1 個檔案...'],
    [/^View (\d+) more$/, '查看其他 $1 個'],
    // 创建后添加关系
    [/^Failed to add (\d+) of (\d+) issue relationship\(s\)$/, '$2 個議題關係中有 $1 個無法新增'],
  ],
  ignore: [
    // 议题表单：字段标签、复选框分组与选项、下拉菜单选项（模板作者编写）
    '[class*="elementLabel__"]',
    '[class*="CheckboxesElementGroupLabel__"]',
    '[class*="checkboxOptionLabel__"]',
    '[class*="dropdownMenuOverlay__"] [class*="prc-ActionList-ItemLabel-"]',
    // 可能重复的议题标题
    '[class*="issueTitleText__"]',
  ],
} satisfies PageDictionary
