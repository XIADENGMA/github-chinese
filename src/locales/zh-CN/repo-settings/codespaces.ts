import type { PageDictionary } from '../../../core/types'

/**
 * 存储库设置 · 代码空间：预生成配置列表、新建 / 编辑预生成配置（触发器、区域可用性、模板历史记录、
 * 失败通知、高级选项）。
 */
export default {
  static: {
    // 列表
    'Prebuild configuration created': '预生成配置已创建',
    'Prebuild configuration deleted': '预生成配置已删除',
    'Prebuild configuration': '预生成配置',
    'Set up prebuild': '设置预生成',
    'There are no prebuilds configured for this repository': '此存储库尚未配置预生成',
    'Prebuild configurations speed up Codespace creations significantly by pre-executing all the tasks required to build your development environment.':
      '预生成配置会预先执行构建开发环境所需的全部任务，显著加快代码空间的创建。',
    'Learn more about setting up prebuilds': '了解如何设置预生成',
    'Currently Running': '正在运行',
    'See output': '查看输出',
    'Manually trigger': '手动触发',
    'Disable runs': '禁用运行',
    'Enable runs': '启用运行',
    'Are you sure you want to delete this prebuild configuration? Running workflow may fail and templates associated with this configuration will be deleted.':
      '确定要删除此预生成配置吗？正在运行的工作流可能会失败，与此配置关联的模板也将被删除。',

    // 新建 / 编辑
    '/ New prebuild configuration': '/ 新建预生成配置',
    '/ Edit configuration': '/ 编辑配置',
    'Prebuilds consume storage space that will incur a billable charge. Learn more about': '预生成会占用存储空间并产生费用。了解',
    'prebuild configurations': '预生成配置',
    'Your prebuild will be built from the branch and configuration file selected below. Learn more about':
      '预生成将根据下方选择的分支和配置文件构建。了解',
    'prebuild configuration.': '预生成配置。',
    'Configuration File:': '配置文件：',
    'Default Codespaces Configuration': '默认代码空间配置',
    'Access and cost control': '访问和费用控制',
    'Prebuild triggers': '预生成触发器',
    'You can specify how often to prebuild your codespace based on changes to your repository or a schedule to manage Actions usage.':
      '你可以根据存储库更改或计划指定预生成代码空间的频率，以管理操作使用量。',
    'Learn about prebuild triggers': '了解预生成触发器',
    'Every push': '每次推送',
    'Your codespace will prebuild on every push to this branch': '每次推送到此分支时预生成代码空间',
    'Configuration change': '配置更改',
    'Your codespace will prebuild when a change is detected on the devcontainer.json and associated configuration files':
      '检测到 devcontainer.json 及相关配置文件有更改时预生成代码空间',
    'Your codespace will prebuild on a schedule': '按计划预生成代码空间',
    'Every day': '每天',
    'Region availability': '区域可用性',
    'Reduce prebuild availability to only specific regions': '仅在特定区域提供预生成',
    'By default, your prebuilt image will be available to all regions where codespaces are available and storage costs will apply for each region. You can adjust this to manage your storage usage.':
      '默认情况下，预生成映像在所有提供代码空间的区域可用，且每个区域都会产生存储费用。你可以调整此设置以管理存储使用量。',
    'Learn about region availability': '了解区域可用性',
    'US East': '美国东部',
    'US West': '美国西部',
    'Europe West': '欧洲西部',
    'Southeast Asia': '东南亚',
    'Template history': '模板历史记录',
    'You can specify the number of prebuild template versions retained to speed up codespaces from an older commit to manage storage costs. The maximum value is 5 versions.':
      '你可以指定保留的预生成模板版本数，以加快基于较早提交创建代码空间的速度并管理存储费用。最多 5 个版本。',
    'Learn about template history': '了解模板历史记录',
    'Failure notifications': '失败通知',
    'You can specify users or teams to be notified via e-mail when prebuilds for this particular configuration fail.':
      '你可以指定在此配置的预生成失败时通过电子邮件通知的用户或团队。',
    'Add by username, full name, or team name': '按用户名、全名或团队名称添加',
    "You haven't added anyone yet": '你尚未添加任何人',
    'You haven’t added anyone yet': '你尚未添加任何人',
    'Add members to receive email notifications when prebuilds fail for this configuration':
      '添加成员以在此配置的预生成失败时接收电子邮件通知',
    'Show advanced options': '显示高级选项',
    "You can disable prebuild optimization if you're having issues where codespaces are several commits behind on a specific branch.":
      '如果特定分支上的代码空间落后多个提交，可以禁用预生成优化。',
    'You can disable prebuild optimization if you’re having issues where codespaces are several commits behind on a specific branch.':
      '如果特定分支上的代码空间落后多个提交，可以禁用预生成优化。',
    'Learn about prebuild optimization': '了解预生成优化',
    'Disable prebuild optimization': '禁用预生成优化',
    'This prevents codespaces from attempting to use an older image to speed up boot time. This could adversely affect performance.':
      '这会阻止代码空间尝试使用较旧的映像来加快启动，可能对性能产生不利影响。',
    'Hide advanced options': '隐藏高级选项'
  },
  scoped: {
    Scheduled: '按计划',
    Days: '日期',
    Weekdays: '工作日',
    Times: '时间',
    Sunday: '星期日',
    Monday: '星期一',
    Tuesday: '星期二',
    Wednesday: '星期三',
    Thursday: '星期四',
    Friday: '星期五',
    Saturday: '星期六',
    versions: '个版本',
    'Find a branch': '查找分支',
    'Select branch': '选择分支'
  },
  regexp: [
    // 模板历史记录：保留的版本数
    [/^(\d+) versions?$/, '$1 个版本']
  ]
} satisfies PageDictionary
