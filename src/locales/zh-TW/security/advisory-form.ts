import type { PageDictionary } from '../../../core/types'

/**
 * 新建存储库安全公告表单（/security/advisories/new）：
 * 字段、CVE 选项、受影响产品、严重性、致谢，以及右侧「存取和可見度」说明。
 * ecosystem 作「生態系」，disclosure 作「揭露」，fork 作「分叉」，private（可见度）作「私人」。
 */
export default {
  static: {
    // 页头说明（原文 discuss … and create 之间没有逗号，译文不加）
    "After the draft security advisory is open, you can privately discuss it with collaborators and create a temporary private fork where you can collaborate on a fix. If you've already fixed the vulnerability, just fill out the draft security advisory and then publish it.":
      '安全性公告草稿建立後，你可以與協作者私下討論並建立臨時私人分叉來協作修正。如果已修正此漏洞，填寫安全性公告草稿後直接發布。',
    'After the draft security advisory is open, you can privately discuss it with collaborators and create a temporary private fork where you can collaborate on a fix. If you’ve already fixed the vulnerability, just fill out the draft security advisory and then publish it.':
      '安全性公告草稿建立後，你可以與協作者私下討論並建立臨時私人分叉來協作修正。如果已修正此漏洞，填寫安全性公告草稿後直接發布。',

    // 字段
    'Advisory Details': '公告詳細資料',
    'Title *': '標題 *',
    'Description *': '描述 *',
    'Ecosystem *': '生態系 *',
    'Not applicable': '不適用',
    'After you create your draft advisory, GitHub can assign a CVE ID to your repository security advisory prior to public disclosure. Once you publish the advisory, GitHub publishes the CVE details.':
      '建立公告草稿後，GitHub 可在公開揭露前為你的儲存庫安全性公告指派 CVE ID。發布公告後，GitHub 會發布 CVE 詳細資料。',
    'Existing CVE': '現有 CVE',
    'This security advisory does not require a CVE ID or is not eligible for one. You can still publish your advisory without a CVE.':
      '此安全性公告不需要 CVE ID 或不符合取得資格。沒有 CVE 也可以發布公告。',
    'Proof of concept': '概念驗證',
    'There was an error creating your RepositoryAdvisory.': '建立儲存庫安全性公告時發生錯誤。',

    // 受影响的产品
    "Don't see the ecosystem you're looking for? It may not be supported yet.": '找不到你要的生態系？可能尚未支援。',
    'Don’t see the ecosystem you’re looking for? It may not be supported yet.': '找不到你要的生態系？可能尚未支援。',
    'Remove affected product': '移除受影響的產品',

    // 严重性
    'Pending selection': '待選擇',
    'We were not able to calculate your score. Please try changing the vector string again.':
      '無法計算分數。請再次嘗試修改向量字串。',
    'Assess severity using CVSS v3': '使用 CVSS v3 評估嚴重性',
    'Assess severity using CVSS v4': '使用 CVSS v4 評估嚴重性',
    'CVSS score required': '需要 CVSS 分數',
    'Learn more about CVSS scoring': '瞭解 CVSS 評分',

    // 致谢
    'Add a user by username, full name, or email': '依使用者名稱、全名或電子郵件新增使用者',

    // 侧栏：存取和可見度
    'Access and visibility': '存取和可見度',
    // Until it is published, … maintainers of <存储库>. Other users and teams …
    'Until it is published, this draft security advisory will only be visible to the maintainers of':
      '發布前，此安全性公告草稿僅對以下儲存庫的維護者可見',
    '. Other users and teams may be added once the advisory is created.': '。公告建立後可新增其他使用者和團隊。',
    'Once published, security advisories on public repositories are visible to everyone.':
      '公開儲存庫的安全性公告發布後，所有人都能看到。',
    // Once reviewed by GitHub, … broadcast on the <GitHub Advisory Database>. They may also …
    'Once reviewed by GitHub, security advisories may be broadcast on the': '經 GitHub 審查後，安全性公告可能會發布到',
    '. They may also trigger Dependabot alerts to users that depend on this repository.':
      '。還可能對相依於此儲存庫的使用者觸發 Dependabot 警示。',
    'Glossary and documentation': '詞彙表和說明文件',
    'Dependabot language support': 'Dependabot 語言支援',
  },
  scoped: {
    // 描述模板的小标题
    Summary: '摘要',
    Impact: '影響',
    // 致谢类型（另见 advisories.ts；Tool 见 code-scanning.ts）
    Sponsor: '贊助者',
    // 描述编辑器的已保存回复为空：You can create one in your <a>settings</a>.（前段由 common-ui 翻译）
    settings: '設定',
  },
  regexp: [
    // 输入框占位符：e.g. CVE-2026-######、e.g. < 1.2.3、e.g. example.js
    [/^e\.g\. (\S.*)$/, '例如 $1'],
  ],
} satisfies PageDictionary
