import type { PageDictionary } from '../../../core/types'

/**
 * 存储库 Code 下拉框的代码空间标签页（React）及其对话框：新建、重命名、更改计算机类型、导出、分享深层链接。
 * 这些界面出现在存储库页，整句放 static（全局）；含变量的文字见 repo-rules.ts（已由 repository.ts 合并）。
 * 议题开发侧栏里的代码空间文字归 issues 词典；产品名译法见 codespaces.ts 文件头。
 */
export default {
  static: {
    // 标签页头部
    'Your workspaces in the cloud': '你的云端工作区',
    'Codespace repository configuration': '代码空间存储库配置',
    'New with options...': '使用选项新建...',
    'New with options…': '使用选项新建…',
    'Configure dev container': '配置开发容器',
    'Set up prebuilds': '设置预生成',
    'Manage codespaces': '管理代码空间',
    'Share a deep link': '分享深层链接',
    'What are codespaces?': '什么是代码空间？',
    'Create error': '创建出错',
    'Configure and create a codespace': '配置并创建代码空间',
    'Creating codespace': '正在创建代码空间',
    'Creating codespace...': '正在创建代码空间...',
    'Creating codespace…': '正在创建代码空间…',
    'Create codespace': '创建代码空间',
    // 按分支创建（Create codespace on <branch>）由 repo-rules.ts 的正则处理，分支名不收录
    'Create a codespace on default branch': '在默认分支上创建代码空间',
    'Could not create a codespace. Try again.': '无法创建代码空间。请重试。',
    'Codespace failed to provision': '代码空间预配失败',
    'Codespace provisioning timed out': '代码空间预配超时',

    // 列表
    'On current branch': '当前分支',
    'On other branches': '其他分支',
    'No codespaces on current branch': '当前分支上没有代码空间',
    'No codespaces': '暂无代码空间',
    "You don't have any codespaces with this repository checked out": '你没有检出此存储库的代码空间',
    'You don’t have any codespaces with this repository checked out': '你没有检出此存储库的代码空间',
    'Learn more about codespaces...': '了解代码空间...',
    'Learn more about codespaces…': '了解代码空间…',
    'Machine type disallowed': '不允许的计算机类型',
    'Image disallowed': '不允许的映像',
    // 自动删除 <3 天后>
    'Auto-deletes': '自动删除',
    'Uncommitted changes': '有未提交的更改',
    'Unpushed changes': '有未推送的更改',
    'From your fork': '来自你的复刻',
    'From fork': '来自复刻',
    "You don't have push permissions": '你没有推送权限',
    'You don’t have push permissions': '你没有推送权限',

    // 横幅（标题隐藏，正文由服务器下发）
    'Codespaces maintenance notice': '代码空间维护通知',
    'Codespaces is undergoing maintenance. Users may experience connection issues during this time, for more details please visit':
      '代码空间正在维护。在此期间可能出现连接问题，详细信息请访问',
    'Codespaces will be undergoing maintenance. Users may experience connection issues during this time, for more details please visit':
      '代码空间即将维护。在此期间可能出现连接问题，详细信息请访问',
    'this announcement': '此公告',
    'SSO warning': 'SSO 警告',
    'Pull request warning': '拉取请求警告',
    'You cannot create a codespace on a closed pull request. Please reopen it if you wish to create a new codespace.':
      '无法在已关闭的拉取请求上创建代码空间。如需创建新的代码空间，请重新打开该拉取请求。',
    'You may be able to': '你或许可以',
    'Create notice': '创建提示',
    // 此存储库的代码空间使用量付费方为 <owner>。
    'Codespace usage for this repository is paid for by': '此存储库的代码空间使用量付费方为',

    // 运行上限
    'Maximum running codespaces reached': '运行中的代码空间已达上限',
    "You have too many running codespaces. You'll need to stop some before you start a new codespace.":
      '运行中的代码空间过多。需先停止部分代码空间，才能启动新的代码空间。',
    'You have too many running codespaces. You’ll need to stop some before you start a new codespace.':
      '运行中的代码空间过多。需先停止部分代码空间，才能启动新的代码空间。',
    'Manage all codespaces': '管理所有代码空间',

    // 操作菜单
    'Change machine type': '更改计算机类型',
    'Stop codespace': '停止代码空间',
    'Stopping...': '停止中...',
    'Auto-delete codespace': '自动删除代码空间',
    'Keep codespace': '保留代码空间',
    'Action disabled by your organization': '你的组织已禁用此操作',
    'Start is temporarily disabled': '暂时无法启动',
    'Open in browser': '在浏览器中打开',
    'Open in Browser': '在浏览器中打开',
    'Open in Visual Studio Code': '在 Visual Studio Code 中打开',
    'Open in Visual Studio Code Insiders': '在 Visual Studio Code Insiders 中打开',
    'Open in JupyterLab': '在 JupyterLab 中打开',
    'Open in JetBrains Gateway': '在 JetBrains Gateway 中打开',
    'Open in ...': '在...中打开',
    'Open in...': '在...中打开',
    'Open in…': '在…中打开',

    // 更改计算机类型
    'Change codespace machine type': '更改代码空间计算机类型',
    'Update codespace': '更新代码空间',
    'Updating…': '更新中…',
    'Machine type': '计算机类型',
    'Failed to load machine types': '无法加载计算机类型',
    'Failed to update machine type. Please try again.': '更新计算机类型失败。请重试。',
    // 标准规格：存储库页与代码空间页由 repo-rules.ts 的正则处理；设置页等未合并这些正则的页面靠这里的固定组合
    '2-core': '2 核',
    '4-core': '4 核',
    '8-core': '8 核',
    '16-core': '16 核',
    '32-core': '32 核',
    '64-core': '64 核',
    '8GB RAM · 32GB': '8 GB 内存 · 32 GB 存储',
    '16GB RAM · 32GB': '16 GB 内存 · 32 GB 存储',
    '32GB RAM · 64GB': '32 GB 内存 · 64 GB 存储',
    '64GB RAM · 128GB': '64 GB 内存 · 128 GB 存储',
    '128GB RAM · 256GB': '128 GB 内存 · 256 GB 存储',

    // 导出 / 发布
    'Publish to a new repository': '发布到新存储库',
    'Export changes to a fork': '将更改导出到复刻',
    'Export changes to a branch': '将更改导出到分支',
    'Checking repository status': '正在检查存储库状态',
    'Checking fork status': '正在检查复刻状态',
    'Checking branch status': '正在检查分支状态',
    'Your changes have been published to a new repository.': '你的更改已发布到新存储库。',
    'Your changes have been exported to a new fork.': '你的更改已导出到新复刻。',
    'Your changes have been exported to a new branch.': '你的更改已导出到新分支。',
    'See repository': '查看存储库',
    'See fork': '查看复刻',
    'See branch': '查看分支',
    // 主按钮：Create ${target} 已由 new / repository 词典覆盖；导出中为 Creating ${target}...
    'Creating repository...': '正在创建存储库...',
    'Creating fork...': '正在创建复刻...',
    'Creating branch...': '正在创建分支...',
    'This will create a new repository and push up your work.': '这会创建新存储库并推送你的工作。',
    'This will create a new branch with any unpushed changes': '这会用所有未推送的更改创建新分支',
    // 已有复刻：……重新分配到你现有的此存储库复刻 <owner/repo>，并将……
    "You do not have write access to this codespace's repository. This will reassign your codespace to your existing fork of this repository,":
      '你没有此代码空间所属存储库的写入访问权限。这会将你的代码空间重新分配到你现有的此存储库复刻',
    'You do not have write access to this codespace’s repository. This will reassign your codespace to your existing fork of this repository,':
      '你没有此代码空间所属存储库的写入访问权限。这会将你的代码空间重新分配到你现有的此存储库复刻',
    ', and export your changes to a new branch.': '，并将你的更改导出到新分支。',
    // 没有复刻：……这会复刻 <owner/repo>，将你的代码空间……
    "You do not have write access to this codespace's repository. This will create a new fork of":
      '你没有此代码空间所属存储库的写入访问权限。这会复刻',
    'You do not have write access to this codespace’s repository. This will create a new fork of':
      '你没有此代码空间所属存储库的写入访问权限。这会复刻',
    ', reassign your codespace to that fork, and export your changes to a new branch.':
      '，将你的代码空间重新分配到该复刻，并将你的更改导出到新分支。',
    // 旧版文案：……这会将此存储库复刻到 <owner/repo>，……
    "You do not have write access to this codespace's repository. This will create a new fork of the repository at":
      '你没有此代码空间所属存储库的写入访问权限。这会将此存储库复刻到',
    'You do not have write access to this codespace’s repository. This will create a new fork of the repository at':
      '你没有此代码空间所属存储库的写入访问权限。这会将此存储库复刻到',
    'this repository': '此存储库',
    'Your codespace export did not complete. Please try again.': '代码空间导出未完成。请重试。',
    'Your codespace does not appear to be exporting. Please try again.': '代码空间似乎未在导出。请重试。',
    'Failed to check export status.': '检查导出状态失败。',
    'Failed to start export. Please try again.': '启动导出失败。请重试。',
    'Failed to start export.': '启动导出失败。',

    // 重命名
    'Rename codespace': '重命名代码空间',
    'Display name': '显示名称',
    'Failed to rename codespace. Please try again.': '重命名代码空间失败。请重试。',

    // 分享深层链接（徽章图片的 alt“Open in GitHub Codespaces”与按钮名“Open in Codespaces”是图片上的文字，不翻译）
    'Share codespace configuration': '分享代码空间配置',
    'Choose which settings from this configuration to include when sharing': '选择分享时要包含的配置项',
    'Quick start': '快速启动',
    'Automatically create or reuse the most recent matching codespace.': '自动创建或复用最近匹配的代码空间。',
    'Read more about creating a link.': '了解如何创建链接。',
    Snippets: '代码片段',
    'Use the following snippets to embed an “Open in Codespaces” button for this configuration in your own page or README.':
      '使用以下代码片段，在你自己的页面或自述文件中嵌入此配置的“Open in Codespaces”按钮。',
    'Snippet format': '代码片段格式',
    'URL snippet': 'URL 代码片段',
    'HTML snippet': 'HTML 代码片段',
    'MARKDOWN snippet': 'Markdown 代码片段'
  }
} satisfies PageDictionary
