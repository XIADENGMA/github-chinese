import type { PageDictionary } from '../../../core/types'

/** 新建对象：议题 / 子议题 */
const RELATION: Readonly<Record<string, string>> = { issue: '议题', 'sub-issue': '子议题' }

/** 跨存储库克隆时可能丢失的元数据 */
const METADATA: Readonly<Record<string, string>> = {
  Milestone: '里程碑',
  Labels: '标签',
  Assignees: '受理人',
  Fields: '字段',
  Type: '类型',
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
    'Create new issue': '新建议题',
    'Create new issue in': '新建议题于',
    // 模板选择页的标签页标题
    'Choose an Issue Template': '选择议题模板',
    'Back to templates': '返回模板',
    'Choose a different template': '选择其他模板',
    'Templates and forms': '模板和表单',
    'No templates available for the current repository': '当前存储库没有可用的模板',
    'Failed to load templates.': '加载模板失败。',
    'Blank issue': '空白议题',
    'Create a new issue from scratch': '从头开始创建新议题',
    'Maintainers only': '仅维护者',
    'Report a security vulnerability': '报告安全漏洞',
    'Please review our security policy for more details': '请查看安全策略以了解详细信息',
    'Edit templates': '编辑模板',
    'View templates': '查看模板',
    'Issues are disabled for the selected repository. Please select a different repository.':
      '所选存储库已禁用议题。请选择其他存储库。',
    'Unable to load top repositories': '无法加载常用存储库',
    // 存储库选择按钮（按钮文字 Select repository 由通用词典处理，各状态的无障碍名称同用“存储库”）
    'No repository selected': '未选择存储库',
    'Select repository (required)': '选择存储库（必填）',
    'Choose repository to clone issue in': '选择要克隆议题的目标存储库',
    'Changing the repository may remove Milestone, Labels, Type, and Assignees from the cloned issue.':
      '更改存储库可能会使克隆的议题丢失里程碑、标签、类型和受理人。',

    // 首次贡献与贡献指南更新提示（新建议题页与比较页，放 static）：Be sure to review the <contributing guidelines>.
    'It looks like this is your first time opening an issue in this project!': '看起来这是你第一次在此项目中打开议题！',
    'It looks like this is your first time opening a pull request in this project!':
      '看起来这是你第一次在此项目中创建拉取请求！',
    'Be sure to review the': '请务必查看',
    // Documentation has changed since you last contributed. Take a look before submitting an issue: <Contributing guidelines>
    'Documentation has changed since you last contributed': '自你上次贡献以来文档已更改',
    '. Take a look before submitting an issue:': '。提交议题前请先查看：',
    '. Take a look before submitting a pull request:': '。提交拉取请求前请先查看：',
    'Contributing guidelines': '贡献指南',

    // 议题表单提示：You’re using an <issue form>, a new type of issue template.（前两段见 scoped）
    ', a new type of issue template.': '，这是一种新型议题模板。',

    // 表单
    'Add a description': '添加描述',
    'Set additional issue fields': '设置其他议题字段',
    'Set date': '设置日期',
    'Select status': '选择状态',
    'Projects are unavailable': '项目不可用',
    'You do not have permission to change the type': '你没有更改类型的权限',
    'You need the triage role or higher in this repository to change the issue type.':
      '需要此存储库的分类角色或更高角色才能更改议题类型。',
    'Paste, drop, or click to add files': '粘贴、拖放或单击以添加文件',
    'Failed to upload file. Please try again.': '上传文件失败。请重试。',

    // 页脚（Submit new issue 是经典新建页的提交按钮）
    'Submit new issue': '提交新议题',
    'Create more': '继续创建',
    'Create more sub-issues': '继续创建子议题',
    'Issue created': '议题已创建',
    'Issue will be created once your upload has completed': '上传完成后将创建议题',

    // 错误与受限
    'Failed to create issue': '创建议题失败',
    'Unable to create issue.': '无法创建议题。',
    'Unable to selected template': '无法加载所选模板',
    'Unable to load repository details.': '无法加载存储库详细信息。',
    'Current user not found': '未找到当前用户',
    'Action restricted': '操作受限',
    'Back to all issues': '返回所有议题',
    'An owner of this repository has limited the ability to create an issue to users that are collaborators.':
      '此存储库的所有者已将创建议题限制为仅协作者可用。',

    // 可能重复的议题
    'Potential duplicate': '可能重复',
    'No potential duplicates': '没有可能重复的议题',
    'View all potential duplicates': '查看所有可能重复的议题',

    // 使用 Copilot 撰写；产品名按用户要求译成中文（product-names.md）：Copilot Chat → Copilot 聊天
    'Navigate to Copilot Chat': '转到 Copilot 聊天',
    'Go to Copilot': '转到 Copilot',
    'Generate issue content with Copilot': '使用 Copilot 生成议题内容',
    'Additional context (optional)': '附加上下文（可选）',
    'Add any additional context to help Copilot generate a better issue...':
      '添加附加上下文，帮助 Copilot 生成更好的议题...',
    'Generate content': '生成内容',
    'Failed to generate content with Copilot. Please try again.': '使用 Copilot 生成内容失败。请重试。',
    'Please provide a title, existing description, or additional context to generate content.':
      '请提供标题、现有描述或附加上下文以生成内容。',
    'How can I help you write your issue?': '需要我如何帮你撰写议题？',
    'Type your message here...': '在此输入消息...',
    "I've updated the issue title and description above.": '已更新上方的议题标题和描述。',
    'I’ve updated the issue title and description above.': '已更新上方的议题标题和描述。',
    'Writing…': '撰写中…',
    'Try again?': '重试？',
    'You have made edits to the generated content. Discarding will lose your changes.':
      '你已编辑生成的内容。放弃将丢失这些更改。',
    'You have made edits to the generated content. Trying again will replace your changes with new generated content.':
      '你已编辑生成的内容。重试会用新生成的内容替换这些更改。',

    // 议题模板编辑器（/issues/templates/edit）；Add template: 后的下拉按钮 select 见 scoped
    'Add template:': '添加模板：',
    'Standard bug report template': '标准错误报告模板',
    'Standard feature request template': '标准功能请求模板',
    'Custom template': '自定义模板',
    'Blank template for other issue types': '用于其他议题类型的空白模板',
    'Preview and edit': '预览并编辑',
    'Template name': '模板名称',
    // 后接 .github/ISSUE_TEMPLATE/ 下的文件路径
    'This file lives in': '此文件位于',
    'Template content': '模板内容',
    'Optional additional items': '可选的附加项',
    'Issue default title': '议题默认标题',
    'This will be suggested as the issue title': '这将作为建议的议题标题',
    'Add a placeholder for issue title, ex. [BUG]': '添加议题标题占位符，例如 [BUG]',
    // GitHub 默认模板的说明（同 labels.ts 默认标签说明；默认模板名不译）
    'Create a report to help us improve': '创建报告以帮助我们改进',
    'Suggest an idea for this project': '为此项目提出想法',
    "Describe this issue template's purpose here.": '在此描述此议题模板的用途。',
  },
  scoped: {
    // 标题输入框占位符与 aria-label（Copilot 页面另有同名词条）
    'Add a title': '添加标题',
    'View less': '收起',
    // 议题表单提示的前两段：You’re using an <issue form>
    "You're using an": '你正在使用',
    'You’re using an': '你正在使用',
    'issue form': '议题表单',
    // 模板编辑器 Add template: 后的下拉按钮
    select: '选择',
  },
  regexp: [
    // 对话框标题：Create new sub-issue、Create new issue - "标题"
    [/^Create new sub-issue$/, '新建子议题'],
    [/^Create new (issue|sub-issue) - "(.+)"$/, (_, type, title) => `新建${relation(type)} - “${title}”`],
    // Create new issue in owner/repo[: 模板名]
    [
      new RegExp(`^Create new (issue|sub-issue) in (${REPO_SOURCE})(?:: (.+))?$`),
      (_, type, repo, template) => `在 ${repo} 中新建${relation(type)}${template ? `：${template}` : ''}`,
    ],
    [
      new RegExp(`^Clone current (issue|sub-issue) in (${REPO_SOURCE})$`),
      (_, type, repo) => `在 ${repo} 中克隆当前${relation(type)}`,
    ],
    // 存储库选择按钮：Selected repository: owner/repo (required)
    [
      /^Selected repository: ([\w.-]+(?:\/[\w.-]+)?)( \(required\))?$/,
      (_, repo, required) => `已选存储库：${repo}${required ? '（必填）' : ''}`,
    ],
    // 继续创建后的链接与播报
    [/^Issue #(\d+) created$/, '议题 #$1 已创建'],
    // 可能重复（dismiss 按术语表对提示应译“关闭”，但“关闭…议题”会被读成关闭议题本身，改译“隐藏”）
    [/^([\d,]+) potential duplicates?$/, '$1 个可能重复的议题'],
    [/^Dismiss potential duplicates?$/, '隐藏可能重复的议题'],
    // 跨存储库克隆提示
    [
      /^This issue is being cloned across repositories\. The following metadata might not be copied: ((?:Milestone|Labels|Assignees|Fields|Type)(?:, (?:Milestone|Labels|Assignees|Fields|Type))*)\.$/,
      (_, list: string) =>
        `正在跨存储库克隆此议题。以下元数据可能不会被复制：${list
          .split(', ')
          .map((name) => METADATA[name] ?? name)
          .join('、')}。`,
    ],
    // 议题表单上传
    [/^Uploading (\d+) files?\.\.\.$/, '正在上传 $1 个文件...'],
    [/^View (\d+) more$/, '再查看 $1 个'],
    // 创建后添加关系
    [/^Failed to add (\d+) of (\d+) issue relationship\(s\)$/, '$2 个议题关系中有 $1 个添加失败'],
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
