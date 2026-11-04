import type { PageDictionary } from '../../../core/types'

/** 「Your license is ready」里的文件类型 */
const COMMUNITY_FILE: Readonly<Record<string, string>> = {
  license: '授權條款',
  'code of conduct': '行為準則'
}

/**
 * 许可证、行为准则模板选择页（/community/license/new、/community/code-of-conduct/new），
 * 以及选定模板后跳转到编辑器时的提示。许可证说明、规则分组与标签由 banners 处理。
 */
export default {
  static: {
    // 许可证
    'Add a license to your project': '為專案新增授權條款',
    'Choose a license to add to your project': '選擇要加入專案的授權條款',
    'Select a template on the left to get started.': '在左側選擇範本以開始。',
    // 瞭解 <哪種授權條款最適合你的專案>
    'which license best fits your project': '哪種授權條款最適合你的專案',
    // To adopt <许可证名>, enter your details. You’ll have a chance to review before committing a <LICENSE> file to …
    // （后半句原文无标点，译文不加逗号：你可以先審查再將 <LICENSE> 檔案提交到新分支或專案根目錄。）
    'To adopt': '若要採用',
    ', enter your details. You’ll have a chance to review before committing a': '，請填寫你的資訊。你可以先審查再將',
    ", enter your details. You'll have a chance to review before committing a": '，請填寫你的資訊。你可以先審查再將',
    'You’ll have a chance to review before committing a': '你可以先審查再將',
    "You'll have a chance to review before committing a": '你可以先審查再將',
    'file to a new branch or the root of your project.': '檔案提交到新分支或專案根目錄。',
    'The current year': '目前年份',
    'The full name or username of the repository owner': '儲存庫擁有者的全名或使用者名稱',
    'Review and submit': '審查並送出',

    // 行为准则（模板名 Contributor Covenant、Citizen Code Of Conduct 不翻译）
    'Add a code of conduct to your project': '為專案新增行為準則',
    'Choose a code of conduct to add to your project': '選擇要加入專案的行為準則',
    // 瞭解 <什麼是行為準則> 和如何執行。
    'what a code of conduct is': '什麼是行為準則',
    'and how to enforce it.': '和如何執行。',
    'Recommended for projects of all sizes': '建議用於各種規模的專案',
    'Suitable for large communities and events': '適合大型社群和活動'
  },

  scoped: {
    // 模板表单字段
    Year: '年份',
    'Contact method': '聯絡方式',
    'Community name': '社群名稱',
    'Governing body': '管理機構',
    'Link to reporting guidelines': '檢舉指南連結',
    'Link to policy': '政策連結',
    'Contact info': '聯絡資訊',
    Note: '附註'
  },

  regexp: [
    // 选定模板后编辑器顶部的提示
    [
      /^Your (license|code of conduct) is ready\. Please review it below and either commit it to the (\S+) branch or to a new branch\.$/,
      (_, kind: string, branch: string) => `${COMMUNITY_FILE[kind] ?? kind}已就緒。請在下方審查後提交到 ${branch} 分支或新分支。`
    ]
  ]
} satisfies PageDictionary
