import type { PageDictionary } from '../../../core/types'
import { joinCjk, translateTime } from '../helpers'

/** 功能申请里由服务端传入的产品名、方案名（按 product-names.md 译出）；未收录的原样保留 */
const FEATURE_NAMES: Readonly<Record<string, string>> = {
  'Copilot Business': 'Copilot 商业版',
  'Copilot Enterprise': 'Copilot 企业版',
  'GitHub Codespaces': 'GitHub 代码空间',
  Codespaces: '代码空间',
  'GitHub Actions': 'GitHub 操作',
  Actions: '操作',
}

function featureName(feature: string): string {
  return FEATURE_NAMES[feature] ?? feature
}

/** 功能申请被拒：日期由服务端下发，可缺省；功能名、日期与两侧中文按 joinCjk 补空格 */
function declinedRequest(feature: string, date: string | undefined): string {
  const subject = joinCjk(joinCjk('你的', featureName(feature)), '申请')
  if (!date) return `${subject}已被管理员拒绝。`
  return joinCjk(joinCjk(`${subject}已于`, translateTime(date)), '被管理员拒绝。')
}

/** 空存储库引导卡片：功能申请已提交 */
function submittedRequest(feature: string): string {
  return `${joinCjk('你已成功向组织管理员申请访问', featureName(feature))}。管理员批准后才能使用此功能。`
}

/** CSV 解析错误（服务端下发，末尾为「in line N.」）；未收录的原样保留 */
const CSV_ERRORS: readonly (readonly [RegExp, string])[] = [
  [/^No commas found in this CSV file in line (\d+)\.$/, '此 CSV 文件第 $1 行中未找到逗号。'],
  [/^Illegal quoting in line (\d+)\.$/, '第 $1 行的引号不合法。'],
  [/^Unclosed quoted field in line (\d+)\.$/, '第 $1 行有未闭合的引号字段。'],
  [/^Any value after quoted field isn't allowed in line (\d+)\.$/, '第 $1 行的引号字段后不允许有值。'],
  [/^Field size exceeded in line (\d+)\.$/, '第 $1 行的字段过大。'],
]

function csvError(message: string): string {
  const rule = CSV_ERRORS.find(([pattern]) => pattern.test(message))
  return rule ? message.replace(rule[0], rule[1]) : message
}

/**
 * 文件视图横幅与弹层：许可证、CODEOWNERS 校验、Dependabot、议题/讨论模板、CITATION、
 * FUNDING、CSV 解析错误、操作发布、伪造提交、代码空间调查、Copilot 推广、添加到空间、
 * 空存储库引导卡片的功能申请。
 * 产品名、方案名按 product-names.md 译出（GitHub Actions → GitHub 操作、Copilot Business → Copilot 商业版）。
 * 标点随原文：原文没有的冒号、逗号、括号不加，必要时调整语序。
 */
export default {
  static: {
    // 许可证（choosealicense.com 数据，GitHub 界面文字；原文没有的逗号、冒号、括号不加）
    'This is not legal advice.': '此信息不构成法律建议。',
    'Learn more about repository licenses': '了解存储库许可证',
    'A short and simple permissive license with conditions only requiring preservation of copyright and license notices. Licensed works, modifications, and larger works may be distributed under different terms and without source code.':
      '一种仅以保留版权和许可证声明为条件的简短宽松许可证。被许可作品、修改版本和更大的作品可以按不同条款分发且无需提供源码。',
    'A permissive license whose main conditions require preservation of copyright and license notices. Contributors provide an express grant of patent rights. Licensed works, modifications, and larger works may be distributed under different terms and without source code.':
      '一种主要以保留版权和许可证声明为条件的宽松许可证。贡献者明确授予专利权。被许可作品、修改版本和更大的作品可以按不同条款分发且无需提供源码。',
    'Permissions of this strong copyleft license are conditioned on making available complete source code of licensed works and modifications, which include larger works using a licensed work, under the same license. Copyright and license notices must be preserved. Contributors provide an express grant of patent rights.':
      '这种强 Copyleft 许可证的授权条件是以相同许可证公开被许可作品和修改版本的完整源码，修改版本包括使用被许可作品的更大作品。必须保留版权和许可证声明。贡献者明确授予专利权。',
    'Permissions of this strongest copyleft license are conditioned on making available complete source code of licensed works and modifications, which include larger works using a licensed work, under the same license. Copyright and license notices must be preserved. Contributors provide an express grant of patent rights. When a modified version is used to provide a service over a network, the complete source code of the modified version must be made available.':
      '这种最强 Copyleft 许可证的授权条件是以相同许可证公开被许可作品和修改版本的完整源码，修改版本包括使用被许可作品的更大作品。必须保留版权和许可证声明。贡献者明确授予专利权。通过网络使用修改版本提供服务时，必须公开修改版本的完整源码。',
    'The GNU GPL is the most widely used free software license and has a strong copyleft requirement. When distributing derived works, the source code of the work must be made available under the same license. There are multiple variants of the GNU GPL, each with different requirements.':
      'GNU GPL 是使用最广泛且具有强 Copyleft 要求的自由软件许可证。分发衍生作品时，必须以相同许可证公开作品源码。GNU GPL 有多个变体，各自要求不同。',
    'Permissions of this copyleft license are conditioned on making available complete source code of licensed works and modifications under the same license or the GNU GPLv3. Copyright and license notices must be preserved. Contributors provide an express grant of patent rights. However, a larger work using the licensed work through interfaces provided by the licensed work may be distributed under different terms and without source code for the larger work.':
      '这种 Copyleft 许可证的授权条件是以相同许可证或 GNU GPLv3 公开被许可作品及其修改版本的完整源码。必须保留版权和许可证声明。贡献者明确授予专利权。但通过被许可作品提供的接口使用它的更大作品可以按不同条款分发且无需提供该更大作品的源码。',
    'Primarily used for software libraries, the GNU LGPL requires that derived works be licensed under the same license, but works that only link to it do not fall under this restriction. There are two commonly used versions of the GNU LGPL.':
      'GNU LGPL 主要用于软件库，要求衍生作品使用相同许可证，但仅链接到它的作品不受此限制。GNU LGPL 有两个常用版本。',
    'Permissions of this weak copyleft license are conditioned on making available source code of licensed files and modifications of those files under the same license (or in certain cases, one of the GNU licenses). Copyright and license notices must be preserved. Contributors provide an express grant of patent rights. However, a larger work using the licensed work may be distributed under different terms and without source code for files added in the larger work.':
      '这种弱 Copyleft 许可证的授权条件是以相同许可证（某些情况下可为 GNU 许可证之一）公开被许可文件及其修改的源码。必须保留版权和许可证声明。贡献者明确授予专利权。但使用被许可作品的更大作品可以按不同条款分发且无需提供其中新增文件的源码。',
    'A simple permissive license only requiring preservation of copyright and license notices for source (and not binary) distribution. Licensed works, modifications, and larger works may be distributed under different terms and without source code.':
      '一种仅要求分发源码（而非二进制文件）时保留版权和许可证声明的简单宽松许可证。被许可作品、修改版本和更大的作品可以按不同条款分发且无需提供源码。',
    'A license with no conditions whatsoever which dedicates works to the public domain. Unlicensed works, modifications, and larger works may be distributed under different terms and without source code.':
      '一种没有任何条件并将作品贡献到公有领域的许可证。采用此许可证的作品、修改版本和更大的作品可以按不同条款分发且无需提供源码。',
    'A short and simple permissive license with no conditions, not even requiring preservation of copyright and license notices. Licensed works, modifications, and larger works may be distributed under different terms and without source code.':
      '一种没有任何条件的简短宽松许可证，甚至不要求保留版权和许可证声明。被许可作品、修改版本和更大的作品可以按不同条款分发且无需提供源码。',
    'The BSD Zero Clause license goes further than the BSD 2-Clause license to allow you unlimited freedom with the software without requirements to include the copyright notice, license text, or disclaimer in either source or binary forms.':
      'BSD 零条款许可证比 BSD 2-Clause 许可证更进一步，允许你不受限制地使用软件且源码和二进制形式都无需附带版权声明、许可证文本或免责声明。',
    'Heavily favored by the Perl community, the Artistic license requires that modified versions of the software do not prevent users from running the standard version.':
      'Artistic 许可证深受 Perl 社区青睐，要求软件的修改版本不得妨碍用户运行标准版本。',
    'This commercially-friendly copyleft license provides the ability to commercially license binaries; a modern royalty-free patent license grant; and the ability for linked works to use other licenses, including commercial ones.':
      '这种对商业友好的 Copyleft 许可证允许对二进制文件进行商业授权；提供现代的免版税专利许可；并允许链接作品使用其他许可证，包括商业许可证。',
    'Permits almost any use subject to providing credit and license notice. Frequently used for media assets and educational materials. The most common license for Open Access scientific publications. Not recommended for software.':
      '只要注明出处并附上许可证声明即允许几乎任何用途。常用于媒体资源和教育材料。开放获取科学出版物最常用的许可证。不建议用于软件。',
    'The Open Font License (OFL) is maintained by SIL International. It attempts to be a compromise between the values of the free software and typeface design communities. It is used for almost all open source font projects, including those by Adobe, Google and Mozilla.':
      '开放字体许可证 (OFL) 由 SIL International 维护。它试图在自由软件社区与字体设计社区的价值观之间取得平衡。几乎所有开源字体项目都使用它，包括 Adobe、Google 和 Mozilla 的项目。',
    'The easiest license out there. It gives the user permissions to do whatever they want with your code.':
      '最简单的许可证。它允许用户对你的代码做任何事。',
    'A short permissive license, compatible with GPL. Requires altered source versions to be documented as such.':
      '一种简短的宽松许可证，与 GPL 兼容。要求注明源码的修改版本。',
    // 含链接的许可证说明（按链接拆分的片段；整句未命中 inline 时使用）
    'A permissive license similar to the': '一种类似于',
    ', but with a 3rd clause that prohibits others from using the name of the copyright holder or its contributors to promote derived products without written consent.':
      '的宽松许可证，但增加的第三条禁止他人未经书面同意使用版权所有者或其贡献者的名义推广衍生产品。',
    'A permissive license that comes in two variants, the': '一种宽松许可证，有两个变体',
    '. Both have very minute differences to the MIT license.': '。两者与 MIT 许可证的差异都很小。',
    'A permissive license lets people do anything with your code with proper attribution and without warranty. The ISC license is functionally equivalent to the':
      '宽松许可证允许他人在适当署名且无担保的前提下对你的代码做任何事。ISC 许可证在功能上等同于',
    'licenses, removing some language that is no longer necessary.': '许可证，并删除了一些不再必要的措辞。',
    "waives copyright interest in a work you've created and dedicates it to the world-wide public domain. Use CC0 to opt out of copyright entirely and ensure your work has the widest reach. As with the Unlicense and typical software licenses, CC0 disclaims warranties. CC0 is very similar to the Unlicense.":
      '放弃你所创作作品的版权权益并将其贡献到全球公有领域。使用 CC0 可完全放弃版权并让作品得到最广泛的传播。与 Unlicense 和典型的软件许可证一样，CC0 不提供担保。CC0 与 Unlicense 非常相似。',
    // A variant of the <a>BSD 3-Clause License</a> that explicitly does not grant any patent rights.（整句由 inline 处理）
    'A variant of the': '一种',
    'that explicitly does not grant any patent rights.': '变体且明确不授予任何专利权。',
    // …approved by the European Commission in <a>23 official languages</a> of the European Union.
    'The European Union Public Licence (EUPL) is a copyleft free/open source software license created on the initiative of and approved by the European Commission in':
      '欧盟公共许可证 (EUPL) 是由欧盟委员会发起并以欧盟',
    '23 official languages': '23 种官方语言',
    'of the European Union.': '版本批准的 Copyleft 自由/开源软件许可证。',
    // Similar to <a>CC-BY-4.0</a> but requires … a similar, <a>compatible</a> license. …（整句由 inline 处理）
    'but requires derivatives be distributed under the same or a similar,': '但要求衍生作品以相同或类似的',
    'license. Frequently used for media assets and educational materials. A previous version is the default license for Wikipedia and other Wikimedia projects. Not recommended for software.':
      '许可证分发。常用于媒体资源和教育材料。其旧版本是维基百科等维基媒体项目的默认许可证。不建议用于软件。',

    // CODEOWNERS 校验
    'Failed to validate this CODEOWNERS file': '无法校验此 CODEOWNERS 文件',
    'Validating CODEOWNERS rules...': '正在校验 CODEOWNERS 规则...',
    'This CODEOWNERS file is valid.': '此 CODEOWNERS 文件有效。',
    'This CODEOWNERS file contains errors': '此 CODEOWNERS 文件包含错误',
    'View CODEOWNERS errors': '查看 CODEOWNERS 错误',
    'CODEOWNERS errors': 'CODEOWNERS 错误',
    'CODEOWNERS error': 'CODEOWNERS 错误',
    'This line contains CODEOWNERS errors': '此行包含 CODEOWNERS 错误',

    // Dependabot 配置文件
    'Dependabot creates pull requests to keep your dependencies secure and up-to-date.':
      'Dependabot 会创建拉取请求以使你的依赖项保持安全和最新。',
    'You can opt out at any time by removing the': '可随时删除',
    'config file.': '配置文件以停用。',
    'View update status': '查看更新状态',
    'Cannot configure Dependabot from this branch': '无法在此分支上配置 Dependabot',
    'To configure Dependabot, you must use': '配置 Dependabot 须使用',
    "this repository's default branch": '此存储库的默认分支',

    // 议题/讨论模板（problem 译作「错误」）
    'There is a problem with this template': '此模板有一个错误',
    'There are some problems with this template': '此模板存在一些错误',
    'Learn more about this error.': '了解此错误。',
    'This file is used as an Issue Form template.': '此文件用作议题表单模板。',
    'This file is used as a markdown issue template.': '此文件用作 Markdown 议题模板。',
    'Issue form templates are not supported on private repositories.': '专用存储库不支持议题表单模板。',
    'You are using an old version of issue templates. Please update to the new issue template workflow.':
      '你正在使用旧版议题模板。请更新为新的议题模板工作流。',
    'Learn more about issue templates.': '了解议题模板。',

    // CITATION、FUNDING
    'file cannot be parsed. Make sure the formatting is correct.': '文件无法解析。请检查格式。',
    'This file is overriding the organization-wide': '此文件覆盖了组织级',
    'file. Removing': '文件。删除此存储库中的',
    'in this repository will use the organization default.': '将改用组织默认设置。',
    'View organization funding file.': '查看组织赞助文件。',

    // CSV 解析出错：We can make this file <strong>beautiful and searchable</strong> if this error is corrected: …
    'We can make this file': '更正以下错误后可使此文件',
    'beautiful and searchable': '美观且可搜索',

    // 操作发布、伪造提交
    'You can publish this Action to the GitHub Marketplace': '可将此操作发布到 GitHub 市场',

    // 组织演示存储库的引导提示（auto-assign.yml）：该 <auto-assign.yml> 文件位于你的 <demo-repository> 中并定义了…
    'Auto-assign new issue with GitHub Actions': '使用 GitHub 操作自动分配新议题',
    'file below lives inside your': '文件位于你的',
    'and defines when and how it’s automatically triggered. This': '中并定义了自动触发的时机和方式。此',
    '“Auto Assign” workflow': '“Auto Assign”工作流',
    'happens to add reviewers and assignees to issues and pull requests when they’re opened in this repository.':
      '会在此存储库中创建议题和拉取请求时为其添加审查者和受理人。',
    // 此工作流的结果可在你于此存储库创建的任何 <议题> 或 <拉取请求> 中查看…可在 <存储库的“操作”标签页中查看。>
    'You can see the results of this workflow in any': '此工作流的结果可在你于此存储库创建的任何',
    'that you create in this repository, as it’ll assign them to the specified members. And you can see a log of any workflows you run in':
      '中查看，它会将其分配给指定成员。所运行工作流的日志可在',
    'your repository’s “Actions” tab.': '存储库的“操作”标签页中查看。',
    'Create new issue to see results': '新建议题以查看结果',
    'Learn how automation works on GitHub': '了解 GitHub 上的自动化',

    // 代码空间调查（与 actions 词典的 GitHub 操作调查同译）
    'Help us improve GitHub Codespaces': '帮助我们改进 GitHub 代码空间',
    'Tell us how to make GitHub Codespaces work better for you with three quick questions.':
      '通过三个简短问题告诉我们如何改进 GitHub 代码空间。',

    // Copilot 推广弹层
    'Code 55% faster with GitHub Copilot': '使用 GitHub Copilot 编码速度提升 55%',
    'Spend less time creating boilerplate and repetitive code patterns, and more time building great software. Try it in Codespaces or your favorite file editor.':
      '减少编写样板代码和重复代码的时间，把更多时间用于构建优秀的软件。可在代码空间或你常用的编辑器中试用。',
    'For an organization, developers writing less boilerplate code means more productivity, while learning new technologies means delivering better customers solutions. Try it in Codespaces or your file editor.':
      '对组织而言，开发人员少写样板代码意味着更高的效率，学习新技术意味着为客户提供更好的解决方案。可在代码空间或你的编辑器中试用。',
    "We noticed that you're personally paying for GitHub Copilot. Instead, ask your organization admin to purchase the business version of GitHub Copilot.":
      '你正在个人付费使用 GitHub Copilot。可请组织管理员购买 Copilot 商业版。',
    'Your organization can pay for GitHub Copilot': '你的组织可以为 GitHub Copilot 付费',
    // 申请被拒：日期与句号通常与此句拼成一段，由 regexp 整句处理；此为未拼接时的片段
    'Your request for Copilot Business was declined by an admin on': '你的 Copilot 商业版申请被管理员拒绝于',
    'Click this link to contact your admin.': '单击此链接联系管理员。',
    'Click this link to learn more about copilot. This action opens in a new tab.':
      '单击此链接了解 Copilot。将在新标签页中打开。',
    // 空存储库引导卡片：功能申请已提交（功能名之后的片段；通常与前文拼成整句，由 regexp 处理）
    '. An admin will need to approve your request before you can use this feature.': '。管理员批准后才能使用此功能。',

    // 添加到空间（Copilot Spaces）
    'Add to space': '添加到空间',
    'Select a space': '选择空间',
    'No spaces found': '未找到空间',
    'You can create a new space to get started.': '新建空间以开始使用。',
    'Create a new space': '新建空间',
    'Create a new Space': '新建空间',
    'Create a space': '创建空间',
    'File added to': '文件已添加到',
    'There was an error adding the file to the space.': '无法将文件添加到空间。',
    'There was an error adding the file to the space': '无法将文件添加到空间',
    'Space owner. Required.': '空间所有者。必填。',
    'Where we will store your space.': '空间的存储位置。',
    'Only you will be able to see this space.': '仅你可见。',
    'Only visible to you and organization admins. You can share it later.': '仅你和组织管理员可见。之后可共享。',
    'Fetching owners…': '正在获取所有者…',
    'An error occurred while loading owners. Please reopen the dialog to try again.':
      '所有者加载失败。请重新打开对话框重试。',
    'Unable to save space.': '无法保存空间。',
  },

  scoped: {
    // 许可证规则分组与标签（Permissions 由通用词典处理）
    Limitations: '限制',
    Conditions: '条件',
    'Commercial use': '商业用途',
    Modification: '修改',
    Distribution: '分发',
    'Private use': '私人使用',
    'Patent use': '专利使用',
    'License and copyright notice': '许可证和版权声明',
    'License and copyright notice for source': '源码的许可证和版权声明',
    'State changes': '声明变更',
    'Disclose source': '公开源码',
    'Network use is distribution': '网络使用即分发',
    'Same license': '相同许可证',
    'Same license (file)': '相同许可证（文件）',
    'Same license (library)': '相同许可证（库）',
    'Trademark use': '商标使用',
    Liability: '责任',
    Warranty: '担保',
    'Similar to': '类似于',
    compatible: '兼容',

    // 议题模板预览、横幅标题（None、Upgrade now 由全局词条处理）
    Info: '信息',
    'Give feedback.': '提供反馈。',
    'Draft a release': '起草发行版',

    // 组织演示存储库的引导提示：面包屑与句中链接
    Tasks: '任务',
    issue: '议题',
    'pull request': '拉取请求',

    // 分支信息栏「贡献」弹层、同步复刻冲突弹层的按钮（全局 static 是状态义「打开的拉取请求」；
    // 代码页上命令面板等全局浮层里状态义的同名读屏文字也会用此译法）
    'Open pull request': '创建拉取请求',

    // Copilot 推广弹层
    'Get GitHub Copilot': '获取 GitHub Copilot',
    'Start a free trial': '开始免费试用',
    "Don't show again": '不再显示',
    'Contact your admin': '联系管理员',
    'for more details around their decision.': '了解此决定的详细信息。',
    successfully: '中',
  },

  regexp: [
    // 许可证：<owner>/<repo> is licensed under（ the）
    [/^([\w.-]+\/[\w.-]+) is licensed under(?: the)?$/, '$1 采用以下许可证'],
    // 议题模板错误链接
    [/^Learn more about error (\d+)\.$/, '了解错误 $1。'],
    // CSV 解析出错：<strong> 之后的片段
    [/^if this error is corrected: (\S.*)$/, (_, message: string) => `：${csvError(message)}`],
    // Copilot Spaces：已选所有者（屏幕阅读器文字）
    [/^Space owner\. Required\. Selected owner: @(\S+)$/, '空间所有者。必填。已选所有者：@$1'],
    // 添加到空间：播报
    [/^File added to (\S.*) successfully\.$/, '文件已添加到 $1。'],
    // Copilot 推广弹层：申请被拒（相邻文本节点拼接后整句匹配）
    [
      /^Your request for (\S.*?) was declined by an admin(?: on (\S.*))?\.$/,
      (_, feature: string, date: string | undefined) => declinedRequest(feature, date),
    ],
    // 空存储库引导卡片：功能申请已提交（相邻文本节点拼接后整句匹配）
    [
      /^You['’]ve successfully submitted a request to your organization['’]s admins for access to (\S.*?)\. An admin will need to approve your request before you can use this feature\.$/,
      (_, feature: string) => submittedRequest(feature),
    ],
  ],

  inline: [
    // 含链接的许可证说明（div.VerifiedHTMLBox__* 内的 HTML，取自 choosealicense.com 数据）：
    // 语序要跨链接调整、或链接两侧的空格要按中文重排的整句；其余含链接的说明按片段翻译
    // A permissive license similar to the <a>BSD 2-Clause License</a>, but with a 3rd clause …
    [
      'A permissive license similar to the {}, but with a 3rd clause that prohibits others from using the name of the copyright holder or its contributors to promote derived products without written consent.',
      '一种类似于 {} 的宽松许可证，但增加的第三条禁止他人未经书面同意使用版权所有者或其贡献者的名义推广衍生产品。',
    ],
    // A variant of the <a>BSD 3-Clause License</a> that explicitly does not grant any patent rights.
    ['A variant of the {} that explicitly does not grant any patent rights.', '一种明确不授予任何专利权的 {} 变体。'],
    // … approved by the European Commission in <a>23 official languages</a> of the European Union.
    [
      'The European Union Public Licence (EUPL) is a copyleft free/open source software license created on the initiative of and approved by the European Commission in {} of the European Union.',
      '欧盟公共许可证 (EUPL) 是由欧盟委员会发起并以欧盟 {}版本批准的 Copyleft 自由/开源软件许可证。',
    ],
    // Similar to <a>CC-BY-4.0</a> but requires … a similar, <a>compatible</a> license. …
    [
      'Similar to {} but requires derivatives be distributed under the same or a similar, {} license. Frequently used for media assets and educational materials. A previous version is the default license for Wikipedia and other Wikimedia projects. Not recommended for software.',
      '类似于 {} 但要求衍生作品以相同或类似的{}许可证分发。常用于媒体资源和教育材料。其旧版本是维基百科等维基媒体项目的默认许可证。不建议用于软件。',
    ],
  ],
} satisfies PageDictionary
