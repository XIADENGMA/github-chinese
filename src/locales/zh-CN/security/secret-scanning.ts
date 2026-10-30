import type { PageDictionary } from '../../../core/types'

const CLOSE_REASON: Readonly<Record<string, string>> = {
  revoked: '已撤销',
  'false positive': '误报',
  'used in tests': '用于测试',
  "won't fix": '不予修复',
  'won’t fix': '不予修复',
}

/** 机密扫描：警报列表（筛选、空状态、反馈横幅）、详情（修复步骤、时间线）、有效性、关闭原因、推送保护 */
export default {
  static: {
    'Secret scanning alert': '机密扫描警报',
    Generic: '通用',
    Bypassed: '已绕过',
    Validity: '有效性',
    'Secret type': '机密类型',
    Provider: '提供程序',
    'Possibly active secret': '可能有效的机密',
    'Active secret': '有效的机密',
    'Inactive secret': '无效的机密',
    'Possibly active': '可能有效',
    'Close as': '关闭原因',
    'Close alert': '关闭警报',
    Revoked: '已撤销',
    'This secret has been revoked': '此机密已被撤销',
    'This secret is only used in tests': '此机密仅用于测试',
    'This secret is not in production code': '此机密不在生产代码中',
    'Select a close reason': '选择关闭原因',
    'Remediation steps': '修复步骤',
    'Push protection bypassed': '已绕过推送保护',
    'Verify secret': '验证机密',
    'Check secret': '检查机密',
    'Last checked': '上次检查',
    'Secret detected': '检测到机密',
    'No secret scanning alerts': '暂无机密扫描警报',

    // 反馈横幅：<Book some time with us> to discuss the GitHub secret scanning experience.
    'Can you give us some feedback?': '能给我们一些反馈吗？',
    "We want to better understand our users' needs and experiences.": '我们希望更好地了解用户的需求与体验。',
    'We want to better understand our users’ needs and experiences.': '我们希望更好地了解用户的需求与体验。',
    'Book some time with us': '预约时间',
    'to discuss the GitHub secret scanning experience.': '与我们讨论 GitHub 机密扫描体验。',

    // 未启用：To scan for secrets, you must first enable secret scanning in <this repository's settings>.
    'Secret scanning disabled': '机密扫描已禁用',
    'To scan for secrets, you must first enable secret scanning in': '要扫描机密，须先启用机密扫描，前往',

    // 列表筛选
    'Ignored by configuration': '已被配置忽略',
    'Clear closure reasons': '清除关闭原因',
    'Service Providers': '服务提供程序',
    'Custom Patterns': '自定义模式',
    'Filter by secret type': '按机密类型筛选',
    'Filter secret type': '筛选机密类型',
    'Filter by provider': '按提供程序筛选',
    'Filter provider': '筛选提供程序',
    'Advanced filter dialog': '高级筛选器对话框',
    'Select all alerts': '全选警报',
    'Select validity option': '选择有效性选项',
    'Select secret type option': '选择机密类型选项',
    'Select provider option': '选择提供程序选项',
    'Select sort option': '选择排序选项',

    // 空状态：No secrets found. Try <clearing filters> to view all of this repository's secret alerts.
    'No secrets found.': '未找到机密。',
    "to view all of this repository's secret alerts.": '以查看此存储库的所有机密警报。',
    'to view all of this repository’s secret alerts.': '以查看此存储库的所有机密警报。',
    "Your repository doesn't have any unresolved secrets.": '此存储库没有未解决的机密。',
    'Your repository doesn’t have any unresolved secrets.': '此存储库没有未解决的机密。',

    // 详情：修复步骤（Revoke this <机密类型> through <提供程序> to prevent unauthorized access.）
    'Follow the steps below before you close this alert.': '关闭此警报前请按以下步骤操作。',
    "Rotate the secret if it's in use to prevent breaking workflows.": '机密正在使用时请先轮换以免中断工作流。',
    'Rotate the secret if it’s in use to prevent breaking workflows.': '机密正在使用时请先轮换以免中断工作流。',
    'Revoke this': '撤销此',
    'to prevent unauthorized access.': '以防止未经授权的访问。',
    'Check security logs for potential breaches.': '检查安全日志以排查潜在的入侵。',
    'Close the alert as revoked.': '将警报关闭为已撤销。',
    'Preview unavailable': '预览不可用',
    'This file is too large to show a preview': '文件过大无法显示预览',

    // 详情：时间线（<用户> opened this alert <时间>）
    'opened this alert': '打开了此警报',
    'closed this as': '将此警报关闭为',
    'closed this as completed in': '在以下提交中完成并关闭了此警报',
  },
  scoped: {
    // 其他区域也出现的同形文字，本区域内单独生效
    'Push protection': '推送保护',
    Inactive: '无效',
    True: '是',
    Qualifier: '限定符',
    Operator: '运算符',
    Value: '值',
    Is: '是',
    'is one of': '属于其中之一',
    Try: '尝试',
    'clearing filters': '清除筛选器',
    // <检测工具> detected a <类型> secret
    'detected a': '检测到',
    secret: '机密',
    'Give us feedback': '提供反馈',
    through: '通过',
    'to clipboard': '到剪贴板',
    'View file': '查看文件',
    'reopened this': '重新打开了此警报',
    'closed as': '关闭为',
    'used in tests': '用于测试',
    "won't fix": '不予修复',
    'won’t fix': '不予修复',
    revoked: '已撤销',
    'false positive': '误报',
    'hidden item': '个隐藏项',
    'hidden items': '个隐藏项',
    'Load all...': '加载全部...',
    'Load all…': '加载全部…',
  },
  regexp: [
    // 关闭原因标签：Closed as revoked（原文无标点，译文不加冒号）
    [
      /^Closed as (revoked|false positive|used in tests|won['’]t fix)$/i,
      (_, reason) => `以${CLOSE_REASON[reason.toLowerCase()]}为由关闭`,
    ],
    // 筛选栏 aria-label：Advanced filter dialog: 1 valid filter
    [/^Advanced filter dialog: ([\d,]+) valid filters?$/, '高级筛选器对话框：$1 个有效筛选器'],
  ],
  // 被元素拆开的整句；整句未命中时由 static 的片段兜底
  inline: [
    // 修复步骤：Revoke this <机密类型> through <提供程序> to prevent unauthorized access.；“通过 …”移到动词前
    ['Revoke this {} through {} to prevent unauthorized access.', '将此 {} 通过 {} 撤销，以防止未经授权的访问。'],
  ],
} satisfies PageDictionary
