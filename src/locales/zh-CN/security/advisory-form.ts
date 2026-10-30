import type { PageDictionary } from '../../../core/types'

/**
 * 新建存储库安全公告表单（/security/advisories/new）：
 * 字段、CVE 选项、受影响产品、严重性、致谢，以及右侧「访问与可见性」说明。
 */
export default {
  static: {
    // 页头说明
    "After the draft security advisory is open, you can privately discuss it with collaborators and create a temporary private fork where you can collaborate on a fix. If you've already fixed the vulnerability, just fill out the draft security advisory and then publish it.":
      '安全公告草稿创建后，可与协作者私下讨论并创建临时专用复刻来协作修复。如果已修复该漏洞，填写安全公告草稿后直接发布即可。',
    'After the draft security advisory is open, you can privately discuss it with collaborators and create a temporary private fork where you can collaborate on a fix. If you’ve already fixed the vulnerability, just fill out the draft security advisory and then publish it.':
      '安全公告草稿创建后，可与协作者私下讨论并创建临时专用复刻来协作修复。如果已修复该漏洞，填写安全公告草稿后直接发布即可。',

    // 字段
    'Advisory Details': '公告详细信息',
    'Title *': '标题 *',
    'Description *': '描述 *',
    'Ecosystem *': '生态系统 *',
    'Not applicable': '不适用',
    'After you create your draft advisory, GitHub can assign a CVE ID to your repository security advisory prior to public disclosure. Once you publish the advisory, GitHub publishes the CVE details.':
      '创建公告草稿后，GitHub 可在公开披露前为存储库安全公告分配 CVE ID。发布公告后，GitHub 会发布 CVE 详细信息。',
    'Existing CVE': '已有 CVE',
    'This security advisory does not require a CVE ID or is not eligible for one. You can still publish your advisory without a CVE.':
      '此安全公告不需要 CVE ID 或不符合分配条件。没有 CVE 也可以发布公告。',
    'Proof of concept': '概念验证',
    'There was an error creating your RepositoryAdvisory.': '创建存储库安全公告时出错。',

    // 受影响的产品
    "Don't see the ecosystem you're looking for? It may not be supported yet.": '没有所需的生态系统？可能尚不支持。',
    'Don’t see the ecosystem you’re looking for? It may not be supported yet.': '没有所需的生态系统？可能尚不支持。',
    'Remove affected product': '删除受影响的产品',

    // 严重性
    'Pending selection': '待选择',
    'We were not able to calculate your score. Please try changing the vector string again.':
      '无法计算评分。请重新修改向量字符串。',
    'Assess severity using CVSS v3': '使用 CVSS v3 评估严重性',
    'Assess severity using CVSS v4': '使用 CVSS v4 评估严重性',
    'CVSS score required': '需要 CVSS 评分',
    'Learn more about CVSS scoring': '了解 CVSS 评分',

    // 致谢
    'Add a user by username, full name, or email': '按用户名、全名或电子邮件添加用户',

    // 侧栏：访问与可见性
    'Access and visibility': '访问与可见性',
    // Until it is published, … maintainers of <存储库>. Other users and teams …
    'Until it is published, this draft security advisory will only be visible to the maintainers of':
      '发布前，此安全公告草稿仅对以下存储库的维护者可见',
    '. Other users and teams may be added once the advisory is created.': '。创建公告后可添加其他用户和团队。',
    'Once published, security advisories on public repositories are visible to everyone.':
      '公共存储库的安全公告发布后对所有人可见。',
    // Once reviewed by GitHub, … broadcast on the <GitHub Advisory Database>. They may also …
    'Once reviewed by GitHub, security advisories may be broadcast on the': '经 GitHub 审查后，安全公告可能会发布到',
    '. They may also trigger Dependabot alerts to users that depend on this repository.':
      '。还可能向依赖此存储库的用户发出 Dependabot 警报。',
    'Glossary and documentation': '术语表与文档',
    'Dependabot language support': 'Dependabot 语言支持',
  },
  scoped: {
    // 描述模板的小标题
    Summary: '摘要',
    Impact: '影响',
    // 致谢类型（另见 advisories.ts；Tool 见 code-scanning.ts）
    Sponsor: '赞助者',
    // 描述编辑器的已保存回复为空：You can create one in your <a>settings</a>.（前段由 common-ui 翻译）
    settings: '设置',
  },
  regexp: [
    // 输入框占位符：e.g. CVE-2026-######、e.g. < 1.2.3、e.g. example.js
    [/^e\.g\. (\S.*)$/, '例如 $1'],
  ],
} satisfies PageDictionary
