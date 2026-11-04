import type { PageDictionary } from '../../../core/types'

/**
 * 存储库设置 · 页面：站点状态、生成和部署（来源、分支、文件夹、工作流）、自定义域与 DNS 检查、
 * 强制实施 HTTPS、可见性（企业版）、取消发布。
 * 产品名译法见 nav.ts 文件头：GitHub Pages → GitHub 页面，GitHub Actions → GitHub 操作。
 */
export default {
  static: {
    // 简介与状态
    'is designed to host your personal, organization, or project pages from a GitHub repository.':
      '用于托管来自 GitHub 存储库的个人、组织或项目页面。',
    'GitHub Pages is designed to host your personal, organization, or project pages from a GitHub repository.':
      'GitHub 页面用于托管来自 GitHub 存储库的个人、组织或项目页面。',
    'Upgrade or make this repository public to enable Pages': '升级或将此存储库设为公共以启用 GitHub 页面',
    'Learn more about GitHub Pages': '了解 GitHub 页面',
    'This repository has been archived. The associated GitHub Pages site remains published but settings are read-only.':
      '此存储库已存档。关联的 GitHub 页面站点仍保持发布，但设置为只读。',
    'Your site is live at': '你的站点已上线于',
    'Last deployed by': '最近部署者',
    'Visit site': '访问站点',
    'Additional site options': '更多站点选项',
    'Unpublish site': '取消发布站点',
    'GitHub Pages unpublished.': 'GitHub 页面已取消发布。',

    // 生成和部署
    'Build and deployment': '生成和部署',
    'GitHub Pages source saved.': 'GitHub 页面来源已保存。',
    'Page source has been saved': '页面来源已保存',
    'Select branch options': '选择分支选项',
    'Select folder options': '选择文件夹选项',
    'Best for using frameworks and customizing your build process': '最适合使用框架和自定义构建流程',
    'Deploy from a branch': '从分支部署',
    'Classic Pages experience': '经典页面体验',
    'Use a suggested workflow,': '使用建议的工作流、',
    'browse all workflows': '浏览所有工作流',
    'Deploy static files in a repository without a build.': '无需构建，直接部署存储库中的静态文件。',
    'Workflow details will appear here once your site has been deployed.': '站点部署后，工作流详细信息将显示在这里。',
    'View workflow runs.': '查看工作流运行。',
    'Your site was last deployed to the': '你的站点最近一次部署到',
    'environment by the': '环境所用的是',
    'Learn more about deploying to GitHub Pages using custom workflows': '了解如何使用自定义工作流部署到 GitHub 页面',
    'GitHub Pages is currently disabled. Select a source below to enable GitHub Pages for this repository.':
      'GitHub 页面当前已禁用。在下方选择来源即可为此存储库启用 GitHub 页面。',
    'GitHub Pages is currently disabled. You must first add content to your repository before you can publish a GitHub Pages site.':
      'GitHub 页面当前已禁用。须先向存储库添加内容，才能发布 GitHub 页面站点。',
    // 片段被 <code>/docs</code>、<code>main</code> 隔开：构建自 /docs 文件夹所在的 main 分支。（原文无标点，不加逗号）
    'Your GitHub Pages site is currently being built from the': '你的 GitHub 页面站点当前构建自',
    'folder in the': '文件夹所在的',
    'Learn more about configuring the publishing source for your site': '了解如何配置站点的发布来源',
    'Select folder': '选择文件夹',
    'add a Jekyll theme': '添加 Jekyll 主题',
    'to your site.': '到你的站点。',

    // 自定义域
    'Custom domains allow you to serve your site from a domain other than': '自定义域可让站点使用其他域而非',
    'Learn more about configuring custom domains': '了解如何配置自定义域',
    'Check again': '再次检查',
    'DNS Check in Progress': '正在检查 DNS',
    'DNS check successful': 'DNS 检查成功',
    'DNS check unsuccessful': 'DNS 检查失败',
    'Please wait for the DNS check to complete.': '请等待 DNS 检查完成。',
    'DNS records should point to the': 'DNS 记录应指向',
    'internationalized domain name': '国际化域名',
    'Domain does not resolve to the GitHub Pages server. For more information, see': '域未解析到 GitHub 页面服务器。详情请参阅',
    "Domain's DNS record could not be retrieved. For more information, see": '无法获取域的 DNS 记录。详情请参阅',
    'Domain’s DNS record could not be retrieved. For more information, see': '无法获取域的 DNS 记录。详情请参阅',
    'No changes to custom domain.': '自定义域未更改。',
    'Custom domain removed. Please remember to remove any GitHub Pages DNS records for this domain if you do not plan to continue using it with GitHub Pages.':
      '自定义域已删除。如果不再将此域用于 GitHub 页面，请记得删除此域的 GitHub 页面 DNS 记录。',
    'Certificate not yet created': '证书尚未创建',

    // 强制实施 HTTPS
    'Enforce HTTPS': '强制实施 HTTPS',
    '— Unavailable for your site because your domain is not properly configured to support HTTPS (':
      '— 你的站点不可用此选项，因为域未正确配置以支持 HTTPS (',
    '— Unavailable for your site because a certificate has not yet been issued for your domain (':
      '— 你的站点不可用此选项，因为尚未为域签发证书 (',
    '— Required for your site because you are using the default domain (': '— 你的站点必须启用，因为正在使用默认域 (',
    'Troubleshooting custom domains': '自定义域故障排除',
    'HTTPS provides a layer of encryption that prevents others from snooping on or tampering with traffic to your site.':
      'HTTPS 提供一层加密，防止他人窥探或篡改站点流量。',
    'When HTTPS is enforced, your site will only be served over HTTPS.': '强制实施 HTTPS 后，站点将仅通过 HTTPS 提供服务。',
    'Learn more about securing your GitHub Pages site with HTTPS': '了解如何使用 HTTPS 保护 GitHub 页面站点',

    // 可见性
    'GitHub Pages visibility': 'GitHub 页面可见性',
    'With a GitHub Enterprise account, you can restrict access to your GitHub Pages site by publishing it privately. You can use privately published sites to share your internal documentation or knowledge base with members of your enterprise. You can try GitHub Enterprise risk-free for 30 days.':
      '使用 GitHub 企业版帐户，可以私密发布 GitHub 页面站点以限制访问。私密发布的站点可用于与企业成员共享内部文档或知识库。你可以免费试用 GitHub 企业版 30 天。',
    'With a GitHub Enterprise account, you can restrict access to your GitHub Pages site by publishing it privately. You can use privately published sites to share your internal documentation or knowledge base with members of your enterprise.':
      '使用 GitHub 企业版帐户，可以私密发布 GitHub 页面站点以限制访问。私密发布的站点可用于与企业成员共享内部文档或知识库。',
    'Try GitHub Enterprise': '试用 GitHub 企业版',
    'Try GitHub Enterprise risk-free for 30 days': '免费试用 GitHub 企业版 30 天',
    'Learn more about the visibility of your GitHub Pages site.': '了解 GitHub 页面站点的可见性。'
  },
  scoped: {
    'create your own': '创建自己的工作流',
    'Learn how to': '了解如何',
    Last: '最近',
    deployed: '部署于',
    Source: '来源',
    'workflow.': '工作流。',
    'branch.': '分支。',
    '/ (root)': '/（根目录）',
    'Custom domain': '自定义域',
    // DNS 检查失败的句尾：「… see <a>documentation</a> (NotServedByPagesError).」；错误码照原文，句号改全角
    '(NotServedByPagesError).': '(NotServedByPagesError)。',
    '(InvalidDNSError).': '(InvalidDNSError)。',
    // 来源下拉框与简介链接里单独出现的产品名（见 nav.ts 文件头）
    'GitHub Pages': 'GitHub 页面',
    'GitHub Actions': 'GitHub 操作',
    'GitHub Enterprise': 'GitHub 企业版'
  },
  regexp: [
    // 站点状态
    [/^Your site is live at (\S+)$/, '你的站点已上线于 $1'],
    [/^Your site is (?:ready to be )?published at (\S+)$/, '你的站点发布于 $1'],
    [/^Last deployed by ([\w-]+)$/, '最近部署者 $1'],
    // 构建来源（片段被 <code> 隔开时由 static 分别匹配）
    [
      /^Your GitHub Pages site is currently being built from the (\S+) folder in the (\S+) branch\.$/,
      '你的 GitHub 页面站点当前构建自 $2 分支中的 $1 文件夹。'
    ],
    [/^Your GitHub Pages site is currently being built from the (\S+) branch\.$/, '你的 GitHub 页面站点当前构建自 $1 分支。'],
    [
      /^Your site was last deployed to the (\S+) environment by the (.{1,100}) workflow\.$/,
      '你的站点最近一次通过 $2 工作流部署到 $1 环境。'
    ],
    // 自定义域
    [
      /^Custom domains allow you to serve your site from a domain other than (\S+?)(\.?)$/,
      (_, domain: string, dot: string) => `自定义域可让站点使用 ${domain} 之外的域提供服务${dot ? '。' : ''}`
    ],
    // 取消发布（更多选项菜单的读屏名称）
    [/^Unpublish ([\w.-]+\/[\w.-]+)$/, '取消发布 $1']
  ]
} satisfies PageDictionary
