import type { PageDictionary } from '../../../core/types'

/** 「Your license is ready」里的文件类型 */
const COMMUNITY_FILE: Readonly<Record<string, string>> = {
  license: '许可证',
  'code of conduct': '行为准则',
}

/**
 * 许可证、行为准则模板选择页（/community/license/new、/community/code-of-conduct/new），
 * 以及选定模板后跳转到编辑器时的提示。许可证说明、规则分组与标签由 banners 处理。
 */
export default {
  static: {
    // 许可证
    'Add a license to your project': '为项目添加许可证',
    'Choose a license to add to your project': '选择要添加到项目的许可证',
    'Select a template on the left to get started.': '在左侧选择模板。',
    // 了解 <哪种许可证最适合你的项目>
    'which license best fits your project': '哪种许可证最适合你的项目',
    // To adopt <许可证名>, enter your details. You’ll have a chance to review before committing a <LICENSE> file to …
    // （后半句原文无标点，译文不加逗号：你可以先审查再将 <LICENSE> 文件提交到新分支或项目根目录。）
    'To adopt': '要采用',
    ', enter your details. You’ll have a chance to review before committing a': '，填写以下信息。你可以先审查再将',
    ", enter your details. You'll have a chance to review before committing a": '，填写以下信息。你可以先审查再将',
    'You’ll have a chance to review before committing a': '你可以先审查再将',
    "You'll have a chance to review before committing a": '你可以先审查再将',
    'file to a new branch or the root of your project.': '文件提交到新分支或项目根目录。',
    'The current year': '当前年份',
    'The full name or username of the repository owner': '存储库所有者的全名或用户名',
    'Review and submit': '审查并提交',

    // 行为准则（模板名 Contributor Covenant、Citizen Code Of Conduct 不翻译）
    'Add a code of conduct to your project': '为项目添加行为准则',
    'Choose a code of conduct to add to your project': '选择要添加到项目的行为准则',
    // 了解 <什么是行为准则> 以及如何执行。
    'what a code of conduct is': '什么是行为准则',
    'and how to enforce it.': '以及如何执行。',
    'Recommended for projects of all sizes': '推荐用于各种规模的项目',
    'Suitable for large communities and events': '适合大型社区和活动',
  },

  scoped: {
    // 模板表单字段
    Year: '年份',
    'Contact method': '联系方式',
    'Community name': '社区名称',
    'Governing body': '管理机构',
    'Link to reporting guidelines': '举报指南链接',
    'Link to policy': '政策链接',
    'Contact info': '联系信息',
    Note: '备注',
  },

  regexp: [
    // 选定模板后编辑器顶部的提示
    [
      /^Your (license|code of conduct) is ready\. Please review it below and either commit it to the (\S+) branch or to a new branch\.$/,
      (_, kind: string, branch: string) =>
        `${COMMUNITY_FILE[kind] ?? kind}已就绪。审查后提交到 ${branch} 分支或新分支。`,
    ],
  ],
} satisfies PageDictionary
