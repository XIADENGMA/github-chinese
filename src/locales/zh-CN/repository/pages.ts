import type { PageDictionary, RegExpRule } from '../../../core/types'

const regexp: readonly RegExpRule[] = [
  // 贡献入口页的标签页标题：Contribute to <owner/repo>
  [/^Contribute to ([\w.-]+\/[\w.-]+)$/, '参与贡献 $1']
]

/**
 * 存储库级整页：已被禁用的存储库、DMCA 下架、恶意内容警告，以及贡献入口页 /<owner>/<repo>/contribute
 * （该路径不属于任何分区，页面类型只有 common → repository）。
 * 存储库名、议题标题、贡献指南文件路径属于用户内容，不收录。
 */
export default {
  static: {
    // 已被禁用的存储库（原文只有一个逗号，译文不多加）
    'This repository has been disabled.': '此存储库已被禁用。',
    "Access to this repository has been disabled by GitHub Staff due to a violation of GitHub's terms of service. If you are the owner of the repository, you may reach out to GitHub Support for more information.":
      '对此存储库的访问已因违反 GitHub 服务条款而被 GitHub 工作人员禁用。如果你是此存储库的所有者，可以联系 GitHub 支持了解详情。',
    'Access to this repository has been disabled by GitHub Staff due to a violation of GitHub’s terms of service. If you are the owner of the repository, you may reach out to GitHub Support for more information.':
      '对此存储库的访问已因违反 GitHub 服务条款而被 GitHub 工作人员禁用。如果你是此存储库的所有者，可以联系 GitHub 支持了解详情。',

    // DMCA 下架：…该通知已 <公开发布>。
    'Repository unavailable due to DMCA takedown.': '存储库因 DMCA 下架而不可用。',
    'This repository is currently disabled due to a DMCA takedown notice. We have disabled public access to the repository. The notice has been':
      '此存储库目前因 DMCA 下架通知而被禁用。我们已禁用对此存储库的公开访问。该通知已',
    'publicly posted': '公开发布',
    // …帮助文章中详细介绍了我们的 <DMCA 下架政策> 和 <如何提交反通知>。
    'If you are the repository owner, and you believe that your repository was disabled as a result of mistake or misidentification, you have the right to file a counter notice and have the repository reinstated. Our help articles provide more details on our':
      '如果你是存储库所有者，并认为存储库因错误或误认而被禁用，你有权提交反通知并恢复存储库。帮助文章中详细介绍了我们的',
    'DMCA takedown policy': 'DMCA 下架政策',
    'how to file a counter notice': '如何提交反通知',
    '. If you have any questions about the process or the risks in filing a counter notice, we suggest that you consult with a lawyer.':
      '。如果你对提交反通知的流程或风险有任何疑问，建议咨询律师。',

    // 恶意内容警告（原文的逗号都在并列的动作之间，译作顿号，译文不另加逗号）
    'This repository contains malicious content that may cause technical harms. We have decided to preserve this content for security research purposes. Please exercise CAUTION when clicking links, downloading releases, or otherwise interacting with this repository.':
      '此存储库包含可能造成技术危害的恶意内容。我们决定保留这些内容以供安全研究。请在单击链接、下载发行版或以其他方式与此存储库交互时务必谨慎。',

    // 贡献入口页：参与贡献 <owner/repo>
    'Contribute to': '参与贡献',
    'Make your first contribution to this repository by tackling one of the issues listed below.':
      '通过解决下方列出的任一议题完成你对此存储库的首次贡献。',
    'Read the contributing guidelines': '阅读贡献指南',
    'Good first issues': '适合新手的议题',
    'Each issue displayed here is a "good first issue," selected for its relative approachability for first-time contributors.':
      '此处显示的每个议题都是“适合新手的议题”，因相对容易上手而为首次贡献者精选。',
    'Each issue displayed here is a “good first issue,” selected for its relative approachability for first-time contributors.':
      '此处显示的每个议题都是“适合新手的议题”，因相对容易上手而为首次贡献者精选。',
    'See all issues': '查看所有议题',
    "This repo doesn't have any good first issues, yet": '此存储库暂时还没有适合新手的议题',
    'This repo doesn’t have any good first issues, yet': '此存储库暂时还没有适合新手的议题',
    'Once its maintainers label issues and pull requests for new contributors, they will begin to appear here.':
      '维护者为议题和拉取请求添加面向新贡献者的标签后，它们会显示在这里。',
    'All issues in this repository': '此存储库的所有议题',
    'Additional resources': '其他资源',
    'Discover other projects on GitHub': '发现 GitHub 上的其他项目'
  },
  regexp
} satisfies PageDictionary
