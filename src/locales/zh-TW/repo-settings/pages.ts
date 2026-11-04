import type { PageDictionary } from '../../../core/types'

/**
 * 存储库设置 · 页面：站点状态、生成和部署（来源、分支、文件夹、工作流）、自定义域与 DNS 检查、
 * 强制实施 HTTPS、可见性（企业版）、取消发布。
 * 产品名译法见 nav.ts 文件头：GitHub Pages → GitHub 頁面，GitHub Actions → GitHub 動作。
 * 术语：Pages site → 頁面網站，site → 網站，build → 建置（Build and deployment → 建置和部署），
 * custom domain → 自訂網域，host → 代管，certificate → 憑證，Enforce HTTPS → 強制使用 HTTPS，theme → 佈景主題。
 */
export default {
  static: {
    // 简介与状态
    'is designed to host your personal, organization, or project pages from a GitHub repository.':
      '用於代管來自 GitHub 儲存庫的個人、組織或專案頁面。',
    'GitHub Pages is designed to host your personal, organization, or project pages from a GitHub repository.':
      'GitHub 頁面用於代管來自 GitHub 儲存庫的個人、組織或專案頁面。',
    'Upgrade or make this repository public to enable Pages': '升級或將此儲存庫設為公開以啟用 GitHub 頁面',
    'Learn more about GitHub Pages': '瞭解 GitHub 頁面',
    'This repository has been archived. The associated GitHub Pages site remains published but settings are read-only.':
      '此儲存庫已封存。相關聯的 GitHub 頁面網站仍維持發布，但設定已變為唯讀。',
    'Your site is live at': '你的網站已上線於',
    'Last deployed by': '上次部署者',
    'Visit site': '造訪網站',
    'Additional site options': '其他網站選項',
    'Unpublish site': '取消發布網站',
    'GitHub Pages unpublished.': '已取消發布 GitHub 頁面。',

    // 生成和部署
    'Build and deployment': '建置和部署',
    'GitHub Pages source saved.': '已儲存 GitHub 頁面來源。',
    'Page source has been saved': '已儲存頁面來源',
    'Select branch options': '選擇分支選項',
    'Select folder options': '選擇資料夾選項',
    'Best for using frameworks and customizing your build process': '最適合使用框架和自訂建置流程',
    'Deploy from a branch': '從分支部署',
    'Classic Pages experience': '傳統頁面體驗',
    // 「Use a suggested workflow,」+「browse all workflows」+「or」+「create your own」
    'Use a suggested workflow,': '使用建議的工作流程、',
    'browse all workflows': '瀏覽所有工作流程',
    'Deploy static files in a repository without a build.': '不經建置，直接部署儲存庫中的靜態檔案。',
    'Workflow details will appear here once your site has been deployed.': '網站部署後，工作流程詳細資料將顯示在這裡。',
    'View workflow runs.': '查看工作流程執行。',
    // 「Your site was last deployed to the」+ <code>github-pages</code> +「environment by the」+ <a>工作流名</a> +「workflow.」：
    // 你的網站上次部署到 github-pages 環境時使用的是 <工作流名> 工作流程。
    'Your site was last deployed to the': '你的網站上次部署到',
    'environment by the': '環境時使用的是',
    'Learn more about deploying to GitHub Pages using custom workflows': '瞭解如何使用自訂工作流程部署到 GitHub 頁面',
    'GitHub Pages is currently disabled. Select a source below to enable GitHub Pages for this repository.':
      'GitHub 頁面目前已停用。在下方選擇來源，為此儲存庫啟用 GitHub 頁面。',
    'GitHub Pages is currently disabled. You must first add content to your repository before you can publish a GitHub Pages site.':
      'GitHub 頁面目前已停用。必須先在儲存庫中新增內容，才能發布 GitHub 頁面網站。',
    // 片段被 <code>/docs</code>、<code>main</code> 隔开：建置自 /docs 資料夾所在的 main 分支。（原文无标点，不加逗号）
    'Your GitHub Pages site is currently being built from the': '你的 GitHub 頁面網站目前建置自',
    'folder in the': '資料夾所在的',
    'Learn more about configuring the publishing source for your site': '瞭解如何設定網站的發布來源',
    'Select folder': '選擇資料夾',
    // 「Learn how to」+「add a Jekyll theme」+「to your site.」
    'add a Jekyll theme': '新增 Jekyll 佈景主題',
    'to your site.': '到你的網站。',

    // 自定义域
    // 原文无标点，译文不加：自訂網域可讓網站使用其他網域而非 <octocat.github.io>
    'Custom domains allow you to serve your site from a domain other than': '自訂網域可讓網站使用其他網域而非',
    'Learn more about configuring custom domains': '瞭解如何設定自訂網域',
    'Check again': '再次檢查',
    'DNS Check in Progress': '正在檢查 DNS',
    'DNS check successful': 'DNS 檢查成功',
    'DNS check unsuccessful': 'DNS 檢查失敗',
    'Please wait for the DNS check to complete.': '請等待 DNS 檢查完成。',
    'DNS records should point to the': 'DNS 記錄應指向',
    'internationalized domain name': '國際化網域名稱',
    'Domain does not resolve to the GitHub Pages server. For more information, see': '網域未解析至 GitHub 頁面伺服器。如需詳細資訊，請參閱',
    "Domain's DNS record could not be retrieved. For more information, see": '無法擷取網域的 DNS 記錄。如需詳細資訊，請參閱',
    'Domain’s DNS record could not be retrieved. For more information, see': '無法擷取網域的 DNS 記錄。如需詳細資訊，請參閱',
    'No changes to custom domain.': '自訂網域沒有變更。',
    'Custom domain removed. Please remember to remove any GitHub Pages DNS records for this domain if you do not plan to continue using it with GitHub Pages.':
      '已移除自訂網域。如果不打算繼續將此網域用於 GitHub 頁面，請記得移除此網域的所有 GitHub 頁面 DNS 記錄。',
    'Certificate not yet created': '尚未建立憑證',

    // 强制实施 HTTPS（分隔用的“—”照原文保留；括号内是域名，用半角括号）
    'Enforce HTTPS': '強制使用 HTTPS',
    '— Unavailable for your site because your domain is not properly configured to support HTTPS (':
      '— 你的網站無法使用此選項，因為網域未正確設定為支援 HTTPS (',
    '— Unavailable for your site because a certificate has not yet been issued for your domain (':
      '— 你的網站無法使用此選項，因為尚未為網域核發憑證 (',
    '— Required for your site because you are using the default domain (': '— 你的網站必須啟用此選項，因為正在使用預設網域 (',
    'Troubleshooting custom domains': '自訂網域疑難排解',
    'HTTPS provides a layer of encryption that prevents others from snooping on or tampering with traffic to your site.':
      'HTTPS 提供一層加密，防止他人窺探或竄改網站的流量。',
    'When HTTPS is enforced, your site will only be served over HTTPS.': '強制使用 HTTPS 時，網站只會透過 HTTPS 提供服務。',
    'Learn more about securing your GitHub Pages site with HTTPS': '瞭解如何使用 HTTPS 保護 GitHub 頁面網站',

    // 可见性
    'GitHub Pages visibility': 'GitHub 頁面可見度',
    'With a GitHub Enterprise account, you can restrict access to your GitHub Pages site by publishing it privately. You can use privately published sites to share your internal documentation or knowledge base with members of your enterprise. You can try GitHub Enterprise risk-free for 30 days.':
      '使用 GitHub 企業版帳號，你可以透過私人發布來限制 GitHub 頁面網站的存取。私人發布的網站可用來與企業成員分享內部文件或知識庫。你可以免費試用 GitHub 企業版 30 天。',
    'With a GitHub Enterprise account, you can restrict access to your GitHub Pages site by publishing it privately. You can use privately published sites to share your internal documentation or knowledge base with members of your enterprise.':
      '使用 GitHub 企業版帳號，你可以透過私人發布來限制 GitHub 頁面網站的存取。私人發布的網站可用來與企業成員分享內部文件或知識庫。',
    'Try GitHub Enterprise': '試用 GitHub 企業版',
    'Try GitHub Enterprise risk-free for 30 days': '免費試用 GitHub 企業版 30 天',
    'Learn more about the visibility of your GitHub Pages site.': '瞭解 GitHub 頁面網站的可見度。'
  },
  scoped: {
    'create your own': '建立自己的工作流程',
    'Learn how to': '瞭解如何',
    // Last deployed <时间>：上次部署於 3 天前（与 actions/deployments.ts 一致）
    Last: '上次',
    deployed: '部署於',
    Source: '來源',
    'workflow.': '工作流程。',
    'branch.': '分支。',
    '/ (root)': '/（根目錄）',
    'Custom domain': '自訂網域',
    // DNS 检查失败的句尾：「… see <a>documentation</a> (NotServedByPagesError).」；错误码照原文，句号改全角
    '(NotServedByPagesError).': '(NotServedByPagesError)。',
    '(InvalidDNSError).': '(InvalidDNSError)。',
    // 来源下拉框与简介链接里单独出现的产品名（见 nav.ts 文件头）
    'GitHub Pages': 'GitHub 頁面',
    'GitHub Actions': 'GitHub 動作',
    'GitHub Enterprise': 'GitHub 企業版'
  },
  regexp: [
    // 站点状态
    [/^Your site is live at (\S+)$/, '你的網站已上線於 $1'],
    [/^Your site is (?:ready to be )?published at (\S+)$/, '你的網站發布於 $1'],
    [/^Last deployed by ([\w-]+)$/, '上次由 $1 部署'],
    // 构建来源（片段被 <code> 隔开时由 static 分别匹配）
    [
      /^Your GitHub Pages site is currently being built from the (\S+) folder in the (\S+) branch\.$/,
      '你的 GitHub 頁面網站目前建置自 $2 分支中的 $1 資料夾。'
    ],
    [/^Your GitHub Pages site is currently being built from the (\S+) branch\.$/, '你的 GitHub 頁面網站目前建置自 $1 分支。'],
    [/^Your site was last deployed to the (\S+) environment by the (.{1,100}) workflow\.$/, '你的網站上次透過 $2 工作流程部署到 $1 環境。'],
    // 自定义域
    [
      /^Custom domains allow you to serve your site from a domain other than (\S+?)(\.?)$/,
      (_, domain: string, dot: string) => `自訂網域可讓網站使用 ${domain} 以外的網域提供服務${dot ? '。' : ''}`
    ],
    // 取消发布（更多选项菜单的读屏名称）
    [/^Unpublish ([\w.-]+\/[\w.-]+)$/, '取消發布 $1']
  ]
} satisfies PageDictionary
