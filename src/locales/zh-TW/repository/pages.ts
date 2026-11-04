import type { PageDictionary, RegExpRule } from '../../../core/types'

const regexp: readonly RegExpRule[] = [
  // 贡献入口页的标签页标题：Contribute to <owner/repo>
  [/^Contribute to ([\w.-]+\/[\w.-]+)$/, '參與貢獻 $1']
]

/**
 * 存储库级整页：已被禁用的存储库、DMCA 下架、恶意内容警告，以及贡献入口页 /<owner>/<repo>/contribute
 * （该路径不属于任何分区，页面类型只有 common → repository）。
 * 存储库名、议题标题、贡献指南文件路径属于用户内容，不收录。
 */
export default {
  static: {
    // 已被禁用的存储库（原文只有一个逗号，译文不多加）
    'This repository has been disabled.': '此儲存庫已停用。',
    "Access to this repository has been disabled by GitHub Staff due to a violation of GitHub's terms of service. If you are the owner of the repository, you may reach out to GitHub Support for more information.":
      '此儲存庫的存取權已因違反 GitHub 服務條款而遭 GitHub 員工停用。如果你是此儲存庫的擁有者，可以聯絡 GitHub 支援以瞭解詳情。',
    'Access to this repository has been disabled by GitHub Staff due to a violation of GitHub’s terms of service. If you are the owner of the repository, you may reach out to GitHub Support for more information.':
      '此儲存庫的存取權已因違反 GitHub 服務條款而遭 GitHub 員工停用。如果你是此儲存庫的擁有者，可以聯絡 GitHub 支援以瞭解詳情。',

    // DMCA 下架：…該通知已 <公開發布>。
    'Repository unavailable due to DMCA takedown.': '儲存庫因 DMCA 下架而無法使用。',
    'This repository is currently disabled due to a DMCA takedown notice. We have disabled public access to the repository. The notice has been':
      '此儲存庫目前因 DMCA 下架通知而停用。我們已停用此儲存庫的公開存取權。該通知已',
    'publicly posted': '公開發布',
    // …我們的說明文章詳細介紹了我們的 <DMCA 下架政策> 和 <如何提出反通知>。
    'If you are the repository owner, and you believe that your repository was disabled as a result of mistake or misidentification, you have the right to file a counter notice and have the repository reinstated. Our help articles provide more details on our':
      '如果你是儲存庫擁有者，並認為儲存庫是因錯誤或誤認而遭停用，你有權提出反通知並讓儲存庫重新啟用。我們的說明文章詳細介紹了我們的',
    'DMCA takedown policy': 'DMCA 下架政策',
    'how to file a counter notice': '如何提出反通知',
    '. If you have any questions about the process or the risks in filing a counter notice, we suggest that you consult with a lawyer.':
      '。如果你對提出反通知的流程或風險有任何疑問，建議諮詢律師。',

    // 恶意内容警告（原文的逗号都在并列的动作之间，译作顿号，译文不另加逗号）
    'This repository contains malicious content that may cause technical harms. We have decided to preserve this content for security research purposes. Please exercise CAUTION when clicking links, downloading releases, or otherwise interacting with this repository.':
      '此儲存庫包含可能造成技術危害的惡意內容。我們決定保留這些內容以供安全性研究。請在按一下連結、下載發行版本或以其他方式與此儲存庫互動時務必謹慎。',

    // 贡献入口页：參與貢獻 <owner/repo>
    'Contribute to': '參與貢獻',
    'Make your first contribution to this repository by tackling one of the issues listed below.':
      '解決下方列出的任一議題來完成你對此儲存庫的首次貢獻。',
    'Read the contributing guidelines': '閱讀貢獻指南',
    'Good first issues': '適合新手的議題',
    'Each issue displayed here is a "good first issue," selected for its relative approachability for first-time contributors.':
      '此處顯示的每個議題都是「適合新手的議題」，因對首次貢獻者而言相對容易上手而入選。',
    'Each issue displayed here is a “good first issue,” selected for its relative approachability for first-time contributors.':
      '此處顯示的每個議題都是「適合新手的議題」，因對首次貢獻者而言相對容易上手而入選。',
    'See all issues': '查看所有議題',
    "This repo doesn't have any good first issues, yet": '此儲存庫尚無適合新手的議題',
    'This repo doesn’t have any good first issues, yet': '此儲存庫尚無適合新手的議題',
    'Once its maintainers label issues and pull requests for new contributors, they will begin to appear here.':
      '維護者為議題和拉取請求加上適合新貢獻者的標籤後，它們就會顯示在這裡。',
    'All issues in this repository': '此儲存庫的所有議題',
    'Additional resources': '其他資源',
    'Discover other projects on GitHub': '探索 GitHub 上的其他專案'
  },
  regexp
} satisfies PageDictionary
