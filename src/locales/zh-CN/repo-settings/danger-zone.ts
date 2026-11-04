import type { PageDictionary } from '../../../core/types'

const REPO = '([\\w.-]+(?:/[\\w.-]+)?)'
const COUNT = '(\\d[\\d,]*)'

/** 可见性：英文 → 中文 */
const VISIBILITY: Readonly<Record<string, string>> = {
  private: '专用',
  public: '公共',
  internal: '内部'
}

/**
 * 存储库设置 · 常规 · 危险区域：更改可见性、禁用分支保护规则、转让所有权、离开复刻网络、
 * 存档 / 取消存档、删除存储库，以及各自的确认对话框与提示。
 * 「Unexpected bad things will happen if you don’t read this!」「Before you archive, please consider:」
 * 已由 org-settings 收录。
 */
export default {
  static: {
    // 更改可见性
    'Change repository visibility': '更改存储库可见性',
    'This repository is currently public.': '此存储库当前为公共存储库。',
    'This repository is currently private.': '此存储库当前为专用存储库。',
    'This repository is currently internal.': '此存储库当前为内部存储库。',
    'Change to private': '更改为专用',
    'Change to public': '更改为公共',
    'Change to internal': '更改为内部',
    'You cannot change the visibility of a fork. please': '无法更改复刻的可见性。请',
    'You cannot change the visibility of a fork. Please': '无法更改复刻的可见性。请',
    'Duplicate the repository': '复制此存储库',
    'For security reasons, you cannot change the visibility of a fork.': '出于安全考虑，无法更改复刻的可见性。',
    'I want to make this repository public': '我要将此存储库设为公共',
    'I want to make this repository private': '我要将此存储库设为专用',
    'I want to make this repository internal': '我要将此存储库设为内部',
    'The code will be visible to everyone who can visit https://github.com': '所有能访问 https://github.com 的人都能看到代码',
    "Attachments uploaded to this repository's issues and pull requests will not be accessible unless it is made private again.":
      '上传到此存储库议题和拉取请求的附件将无法访问，除非重新设为专用。',
    'Attachments uploaded to this repository’s issues and pull requests will not be accessible unless it is made private again.':
      '上传到此存储库议题和拉取请求的附件将无法访问，除非重新设为专用。',
    'Anyone can fork your repository.': '任何人都可以复刻你的存储库。',
    'All push rulesets will be disabled.': '所有推送规则集都将被禁用。',
    'Your changes will be published as activity.': '你的更改将作为活动发布。',
    'Actions history and logs will be visible to everyone.': 'GitHub 操作历史记录和日志将对所有人可见。',
    'Make this repository public': '将此存储库设为公共',
    'Make this repository private': '将此存储库设为专用',
    'Make this repository internal': '将此存储库设为内部',
    'Effects of making this repository public': '将此存储库设为公共的影响',
    'Effects of making this repository private': '将此存储库设为专用的影响',
    'Effects of making this repository internal': '将此存储库设为内部的影响',
    'Making this repository private could permanently erase these counts by removing stars and watchers associated to users that will no longer have access to this repository:':
      '设为专用后，将删除不再拥有访问权限的用户的星标和关注，可能永久清除以下计数：',
    'If you decide to make this repository public in the future, it will not be possible to restore these stars and watchers and this will affect its repository rankings.':
      '即使以后再将此存储库设为公共，也无法恢复这些星标和关注者，并会影响存储库排名。',
    'Dependency graph and Dependabot alerts will remain enabled with permission to perform read-only analysis on this repository.':
      '依赖项关系图和 Dependabot 警报将保持启用，并保留对此存储库执行只读分析的权限。',
    'Dependency graph and Dependabot alerts will remain enabled with permission to perform read-only analysis on this repository. Any custom Dependabot alert rules will be disabled unless GitHub Advanced Security is enabled for this repository.':
      '依赖项关系图和 Dependabot 警报将保持启用，并保留对此存储库执行只读分析的权限。除非此存储库启用了 GitHub 高级安全，否则所有自定义 Dependabot 警报规则都将被禁用。',
    'Any custom Dependabot alert rules will be disabled unless GitHub Advanced Security is enabled for this repository.':
      '除非此存储库启用了 GitHub 高级安全，否则所有自定义 Dependabot 警报规则都将被禁用。',
    'Code scanning will become unavailable.': '代码扫描将不可用。',
    'Current forks will remain public and will be detached from this repository.': '现有复刻仍为公共存储库，并与此存储库分离。',
    'Advanced Security will be disabled.': '高级安全将被禁用。',
    'I have read and understand these effects': '我已阅读并了解这些影响',
    'Warning: this is a destructive action': '警告：这是破坏性操作',
    'Warning: this is a destructive action.': '警告：这是破坏性操作。',
    'Warning: this is a potentially destructive action.': '警告：这可能是破坏性操作。',
    'To confirm, type the number of stars on this repository in the box below': '要确认，请在下方输入框中输入此存储库的星标数',
    'To confirm, type the number of stars on this repository in the box below.': '要确认，请在下方输入框中输入此存储库的星标数。',

    // 禁用 / 重新启用分支保护规则
    'Disable branch protection rules': '禁用分支保护规则',
    'Disable branch protection rules enforcement and APIs': '禁用分支保护规则的强制实施和 API',
    'This will hide the branch protection settings and disable branch protection rules for this repository.':
      '这将隐藏分支保护设置，并禁用此存储库的分支保护规则。',
    'Disabling branch protection rules allows you to enforce branch and tag protections exclusively with Repository Rules.':
      '禁用分支保护规则后，可以仅使用存储库规则来强制实施分支和标签保护。',
    'This action will disable:': '此操作将禁用：',
    'Branch protection rule enforcement': '分支保护规则的强制实施',
    'Branch protection rule APIs': '分支保护规则 API',
    'will be disabled as part of this action': '将随此操作一并禁用',
    'Re-enable branch protection rules': '重新启用分支保护规则',
    'Re-enable branch protection rules enforcement and APIs': '重新启用分支保护规则的强制实施和 API',
    'Re-enable branch protection': '重新启用分支保护',
    'will be re-enabled as part of this action': '将随此操作一并重新启用',
    'Branch protection settings saved.': '分支保护设置已保存。',

    // 转让所有权（转让页面属于 new 页面类型）
    'Transfer ownership': '转让所有权',
    'Organization members cannot transfer repositories': '组织成员无法转让存储库',
    'Organization members cannot transfer repositories.': '组织成员无法转让存储库。',

    // 离开复刻网络
    'Leave fork network': '离开复刻网络',
    "Can't leave the fork network because this fork has child forks.": '此复刻有子复刻，无法离开复刻网络。',
    'Can’t leave the fork network because this fork has child forks.': '此复刻有子复刻，无法离开复刻网络。',
    "Can't detach forks larger than 1 GB.": '无法分离大于 1 GB 的复刻。',
    'Can’t detach forks larger than 1 GB.': '无法分离大于 1 GB 的复刻。',
    'Unlink this repository from the fork network and make it standalone.': '取消此存储库与复刻网络的链接，使其成为独立存储库。',
    'Detach is in progress.': '正在分离。',
    'Detaching this repository.': '正在分离此存储库。',
    'This will permanently remove the fork relationship to the upstream repository': '这将永久删除与上游存储库的复刻关系',
    'will become a standalone repository and will no longer be able to fetch upstream updates or propose changes to the upstream repository':
      '将成为独立存储库且无法再获取上游更新或向上游存储库提议更改',
    'cannot rejoin the fork network.': '无法重新加入复刻网络。',

    // 存档
    'Archive this repository': '存档此存储库',
    'Mark this repository as archived and read-only.': '将此存储库标记为已存档并设为只读。',
    'Archive repository': '存档存储库',
    'This repository will become read-only.': '此存储库将变为只读。',
    'You will still be able to fork the repository and unarchive it at any time.': '你仍可随时复刻此存储库或取消存档。',
    'All scheduled workflows will stop running.': '所有计划的工作流都将停止运行。',
    'Security features will be unavailable:': '安全功能将不可用：',
    'Security features will be interrupted:': '安全功能将中断：',
    'Code scanning will be paused': '代码扫描将暂停',
    'Updating any repository settings': '更新存储库设置',
    'Closing all open issues and pull requests': '关闭所有打开的议题和拉取请求',
    'Making a note in your README': '在自述文件中添加说明',
    'I understand the consequences, archive this repository': '我了解后果，存档此存储库',

    // 取消存档
    'Unarchive this repository': '取消存档此存储库',
    'Mark this repository as unarchived and read-write.': '将此存储库标记为未存档并恢复读写。',
    'Unarchive repository': '取消存档存储库',
    'Once unarchived, the following can be modified and commented on:': '取消存档后，以下内容可以修改和评论：',
    'Security features will become available:': '安全功能将恢复可用：',
    'I understand the consequences, unarchive this repository': '我了解后果，取消存档此存储库',

    // 删除
    'Delete this repository': '删除此存储库',
    'Effects of deleting this repository': '删除此存储库的影响',
    'Once you delete a repository, there is no going back. Please be certain.': '存储库删除后无法恢复，请谨慎操作。',
    'Organization members cannot delete repositories.': '组织成员无法删除存储库。',
    'Organization members cannot delete repositories': '组织成员无法删除存储库',
    'I want to delete this repository': '我要删除此存储库',
    'This will permanently delete the': '这将永久删除',
    'repository, wiki, issues, comments, packages, secrets, workflow runs, and remove all collaborator associations.':
      '存储库及其 Wiki、议题、评论、软件包、机密和工作流运行，并移除所有协作者关联。',
    'repository, wiki, issues, comments, packages, secrets, workflow runs, and remove all collaborator associations will be permanently deleted.':
      '存储库及其 Wiki、议题、评论、软件包、机密和工作流运行，并移除所有协作者关联。',
    'repository, wiki, issues, comments, packages, secrets, workflow runs, and remove all team associations.':
      '存储库及其 Wiki、议题、评论、软件包、机密和工作流运行，并移除所有团队关联。',
    'This will not change your billing plan. If you want to downgrade, you can do so in your Billing Settings.':
      '这不会更改你的计费计划。如需降级，可在计费设置中操作。'
  },
  scoped: {
    'Danger Zone': '危险区域',
    'Danger zone': '危险区域',
    'Change visibility': '更改可见性',
    Transfer: '转移',
    star: '个星标',
    stars: '个星标',
    watcher: '个关注者',
    watchers: '个关注者',
    'Dependabot alerts': 'Dependabot 警报',
    'Dependabot security updates': 'Dependabot 安全更新',
    'Code scanning': '代码扫描',
    'Secret scanning': '机密扫描',
    Labels: '标签',
    Milestones: '里程碑',
    'Please type': '请输入',
    'to confirm.': '以确认。',
    'This will make': '这将使',
    'read-write.': '恢复读写。'
  },
  regexp: [
    // 可见性对话框
    [
      new RegExp(`^Make ${REPO} (private|public|internal)$`),
      (_, repo: string, visibility: string) => `将 ${repo} 设为${VISIBILITY[visibility] ?? visibility}`
    ],
    [new RegExp(`^${COUNT} stars?$`), '$1 个星标'],
    [new RegExp(`^${COUNT} watchers?$`), '$1 个关注者'],
    [
      /^To confirm, type (?:"([^"]{1,200})"|“([^”]{1,200})”) in the box below(:?)$/,
      (_, straight: string, curly: string, colon: string) => `要确认，请在下方输入框中输入“${straight || curly}”${colon ? '：' : ''}`
    ],
    // 禁用 / 重新启用分支保护规则
    [/^(\d+) branch protection rules?$/, '$1 条分支保护规则'],
    // 存档 / 取消存档
    [new RegExp(`^Please type ${REPO} to confirm\\.$`), '请输入 $1 以确认。'],
    [new RegExp(`^This will make ${REPO} read-write\\.$`), '这将使 $1 恢复读写。'],
    [/^Your repository "([^"]{1,200})" was successfully archived\.$/, '存储库“$1”已存档。'],
    [/^Your repository "([^"]{1,200})" was successfully unarchived\.$/, '存储库“$1”已取消存档。'],
    // 删除对话框标题：Delete owner/repo（必须含 /，避免误伤“Delete xxx”按钮）
    [/^Delete ([\w.-]+\/[\w.-]+)$/, '删除 $1'],
    [
      new RegExp(
        `^This will permanently delete the ${REPO} repository, wiki, issues, comments, packages, secrets, workflow runs, and remove all (collaborator|team) associations\\.$`
      ),
      (_, repo: string, kind: string) =>
        `这将永久删除 ${repo} 存储库及其 Wiki、议题、评论、软件包、机密和工作流运行，并移除所有${kind === 'team' ? '团队' : '协作者'}关联。`
    ]
  ]
} satisfies PageDictionary
