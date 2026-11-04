import type { PageDictionary } from '../../../core/types'
import { joinCjk, translateTime } from '../helpers'

/** 功能申请里由服务端传入的产品名、方案名（按 product-names.md 译出）；未收录的原样保留 */
const FEATURE_NAMES: Readonly<Record<string, string>> = {
  'Copilot Business': 'Copilot 商務版',
  'Copilot Enterprise': 'Copilot 企業版',
  'GitHub Codespaces': 'GitHub 程式碼空間',
  Codespaces: '程式碼空間',
  'GitHub Actions': 'GitHub 動作',
  Actions: '動作'
}

function featureName(feature: string): string {
  return FEATURE_NAMES[feature] ?? feature
}

/** 功能申请被拒：日期由服务端下发，可缺省；功能名、日期与两侧中文按 joinCjk 补空格 */
function declinedRequest(feature: string, date: string | undefined): string {
  const subject = joinCjk(joinCjk('你的', featureName(feature)), '申請')
  if (!date) return `${subject}已被管理員拒絕。`
  return joinCjk(joinCjk(`${subject}已於`, translateTime(date)), '被管理員拒絕。')
}

/** 空存储库引导卡片：功能申请已提交（access 译「存取權」，功能名与两侧中文按 joinCjk 补空格） */
function submittedRequest(feature: string): string {
  return `${joinCjk(joinCjk('你已成功向組織管理員申請', featureName(feature)), '的存取權')}。管理員核准後才能使用此功能。`
}

/** CSV 解析错误（服务端下发，末尾为「in line N.」）；未收录的原样保留 */
const CSV_ERRORS: readonly (readonly [RegExp, string])[] = [
  [/^No commas found in this CSV file in line (\d+)\.$/, '此 CSV 檔案第 $1 行中找不到逗號。'],
  [/^Illegal quoting in line (\d+)\.$/, '第 $1 行的引號不合法。'],
  [/^Unclosed quoted field in line (\d+)\.$/, '第 $1 行有未閉合的引號欄位。'],
  [/^Any value after quoted field isn't allowed in line (\d+)\.$/, '第 $1 行的引號欄位後不允許有值。'],
  [/^Field size exceeded in line (\d+)\.$/, '第 $1 行的欄位過大。']
]

function csvError(message: string): string {
  const rule = CSV_ERRORS.find(([pattern]) => pattern.test(message))
  return rule ? message.replace(rule[0], rule[1]) : message
}

/**
 * 文件视图横幅与弹层：许可证、CODEOWNERS 校验、Dependabot、议题/讨论模板、CITATION、
 * FUNDING、CSV 解析错误、操作发布、伪造提交、代码空间调查、Copilot 推广、添加到空间、
 * 空存储库引导卡片的功能申请。
 * 产品名、方案名按 product-names.md 译出（GitHub Actions → GitHub 動作、Copilot Business → Copilot 商務版）。
 * 标点随原文：原文没有的冒号、逗号、括号不加，必要时调整语序。
 */
export default {
  static: {
    // 许可证（choosealicense.com 数据，GitHub 界面文字；原文没有的逗号、冒号、括号不加）
    'This is not legal advice.': '此內容不構成法律建議。',
    'Learn more about repository licenses': '瞭解儲存庫授權條款',
    'A short and simple permissive license with conditions only requiring preservation of copyright and license notices. Licensed works, modifications, and larger works may be distributed under different terms and without source code.':
      '一種僅以保留著作權和授權條款聲明為條件的簡短寬鬆授權條款。授權作品、修改版本和更大的作品可以依不同條款散布且無需提供原始碼。',
    'A permissive license whose main conditions require preservation of copyright and license notices. Contributors provide an express grant of patent rights. Licensed works, modifications, and larger works may be distributed under different terms and without source code.':
      '一種主要條件為保留著作權和授權條款聲明的寬鬆授權條款。貢獻者明確授予專利權。授權作品、修改版本和更大的作品可以依不同條款散布且無需提供原始碼。',
    'Permissions of this strong copyleft license are conditioned on making available complete source code of licensed works and modifications, which include larger works using a licensed work, under the same license. Copyright and license notices must be preserved. Contributors provide an express grant of patent rights.':
      '這種強 Copyleft 授權條款授予權利的條件是以相同授權條款公開授權作品和修改版本的完整原始碼，修改版本包括使用授權作品的更大作品。必須保留著作權和授權條款聲明。貢獻者明確授予專利權。',
    'Permissions of this strongest copyleft license are conditioned on making available complete source code of licensed works and modifications, which include larger works using a licensed work, under the same license. Copyright and license notices must be preserved. Contributors provide an express grant of patent rights. When a modified version is used to provide a service over a network, the complete source code of the modified version must be made available.':
      '這種最強 Copyleft 授權條款授予權利的條件是以相同授權條款公開授權作品和修改版本的完整原始碼，修改版本包括使用授權作品的更大作品。必須保留著作權和授權條款聲明。貢獻者明確授予專利權。透過網路使用修改版本提供服務時，必須公開修改版本的完整原始碼。',
    'The GNU GPL is the most widely used free software license and has a strong copyleft requirement. When distributing derived works, the source code of the work must be made available under the same license. There are multiple variants of the GNU GPL, each with different requirements.':
      'GNU GPL 是使用最廣泛且具有強 Copyleft 要求的自由軟體授權條款。散布衍生作品時，必須以相同授權條款公開作品的原始碼。GNU GPL 有多種變體，各有不同要求。',
    'Permissions of this copyleft license are conditioned on making available complete source code of licensed works and modifications under the same license or the GNU GPLv3. Copyright and license notices must be preserved. Contributors provide an express grant of patent rights. However, a larger work using the licensed work through interfaces provided by the licensed work may be distributed under different terms and without source code for the larger work.':
      '這種 Copyleft 授權條款授予權利的條件是以相同授權條款或 GNU GPLv3 公開授權作品和修改版本的完整原始碼。必須保留著作權和授權條款聲明。貢獻者明確授予專利權。但透過授權作品提供的介面使用它的更大作品，可以依不同條款散布且無需提供該更大作品的原始碼。',
    'Primarily used for software libraries, the GNU LGPL requires that derived works be licensed under the same license, but works that only link to it do not fall under this restriction. There are two commonly used versions of the GNU LGPL.':
      'GNU LGPL 主要用於軟體程式庫，要求衍生作品採用相同授權條款，但僅連結到它的作品不受此限制。GNU LGPL 有兩個常用版本。',
    'Permissions of this weak copyleft license are conditioned on making available source code of licensed files and modifications of those files under the same license (or in certain cases, one of the GNU licenses). Copyright and license notices must be preserved. Contributors provide an express grant of patent rights. However, a larger work using the licensed work may be distributed under different terms and without source code for files added in the larger work.':
      '這種弱 Copyleft 授權條款授予權利的條件是以相同授權條款（某些情況下可為 GNU 授權條款之一）公開授權檔案和這些檔案修改內容的原始碼。必須保留著作權和授權條款聲明。貢獻者明確授予專利權。但使用授權作品的更大作品，可以依不同條款散布且無需提供其中新增檔案的原始碼。',
    'A simple permissive license only requiring preservation of copyright and license notices for source (and not binary) distribution. Licensed works, modifications, and larger works may be distributed under different terms and without source code.':
      '一種僅要求以原始碼（而非二進位）形式散布時保留著作權和授權條款聲明的簡單寬鬆授權條款。授權作品、修改版本和更大的作品可以依不同條款散布且無需提供原始碼。',
    'A license with no conditions whatsoever which dedicates works to the public domain. Unlicensed works, modifications, and larger works may be distributed under different terms and without source code.':
      '一種沒有任何條件並將作品貢獻至公共領域的授權條款。採用此授權條款的作品、修改版本和更大的作品可以依不同條款散布且無需提供原始碼。',
    'A short and simple permissive license with no conditions, not even requiring preservation of copyright and license notices. Licensed works, modifications, and larger works may be distributed under different terms and without source code.':
      '一種沒有任何條件的簡短寬鬆授權條款，甚至不要求保留著作權和授權條款聲明。授權作品、修改版本和更大的作品可以依不同條款散布且無需提供原始碼。',
    'The BSD Zero Clause license goes further than the BSD 2-Clause license to allow you unlimited freedom with the software without requirements to include the copyright notice, license text, or disclaimer in either source or binary forms.':
      'BSD Zero Clause 授權條款比 BSD 2-Clause 授權條款更進一步，讓你不受限制地使用軟體，且原始碼和二進位形式都不需附上著作權聲明、授權條款文字或免責聲明。',
    'Heavily favored by the Perl community, the Artistic license requires that modified versions of the software do not prevent users from running the standard version.':
      'Artistic 授權條款深受 Perl 社群青睞，要求軟體的修改版本不得妨礙使用者執行標準版本。',
    'This commercially-friendly copyleft license provides the ability to commercially license binaries; a modern royalty-free patent license grant; and the ability for linked works to use other licenses, including commercial ones.':
      '這種對商業友善的 Copyleft 授權條款允許以商業授權方式提供二進位檔；提供現代的免權利金專利授權；並允許連結的作品使用其他授權條款，包括商業授權條款。',
    'Permits almost any use subject to providing credit and license notice. Frequently used for media assets and educational materials. The most common license for Open Access scientific publications. Not recommended for software.':
      '在註明出處並附上授權條款聲明的前提下允許幾乎任何用途。常用於媒體素材和教材。開放取用科學出版品最常用的授權條款。不建議用於軟體。',
    'The Open Font License (OFL) is maintained by SIL International. It attempts to be a compromise between the values of the free software and typeface design communities. It is used for almost all open source font projects, including those by Adobe, Google and Mozilla.':
      '開放字型授權條款 (OFL) 由 SIL International 維護。它試圖在自由軟體社群和字型設計社群的價值觀之間取得折衷。幾乎所有開源字型專案都採用它，包括 Adobe、Google 和 Mozilla 的專案。',
    'The easiest license out there. It gives the user permissions to do whatever they want with your code.':
      '最簡單的授權條款。它允許使用者對你的程式碼做任何事。',
    'A short permissive license, compatible with GPL. Requires altered source versions to be documented as such.':
      '一種簡短的寬鬆授權條款，與 GPL 相容。要求將修改過的原始碼版本標明為修改版本。',
    // 含链接的许可证说明（按链接拆分的片段；整句未命中 inline 时使用）
    'A permissive license similar to the': '一種類似於',
    ', but with a 3rd clause that prohibits others from using the name of the copyright holder or its contributors to promote derived products without written consent.':
      '的寬鬆授權條款，但增加的第三條禁止他人未經書面同意使用著作權人或其貢獻者的名義推廣衍生產品。',
    'A permissive license that comes in two variants, the': '一種有兩種變體的寬鬆授權條款，分別是',
    '. Both have very minute differences to the MIT license.': '。兩者和 MIT 授權條款的差異都很小。',
    'A permissive license lets people do anything with your code with proper attribution and without warranty. The ISC license is functionally equivalent to the':
      '寬鬆授權條款允許他人在適當標示出處且無擔保的前提下對你的程式碼做任何事。ISC 授權條款在功能上等同於',
    'licenses, removing some language that is no longer necessary.': '授權條款，並刪除了一些已不再必要的措辭。',
    "waives copyright interest in a work you've created and dedicates it to the world-wide public domain. Use CC0 to opt out of copyright entirely and ensure your work has the widest reach. As with the Unlicense and typical software licenses, CC0 disclaims warranties. CC0 is very similar to the Unlicense.":
      '放棄你對所創作作品的著作權權益，並將作品貢獻至全球公共領域。使用 CC0 可完全放棄著作權，讓作品得到最廣泛的傳播。如同 Unlicense 和一般軟體授權條款，CC0 不提供擔保。CC0 和 Unlicense 非常相似。',
    // A variant of the <a>BSD 3-Clause License</a> that explicitly does not grant any patent rights.（整句由 inline 处理）
    'A variant of the': '一種',
    'that explicitly does not grant any patent rights.': '變體且明確不授予任何專利權。',
    // …approved by the European Commission in <a>23 official languages</a> of the European Union.
    'The European Union Public Licence (EUPL) is a copyleft free/open source software license created on the initiative of and approved by the European Commission in':
      '歐盟公共授權條款 (EUPL) 是由歐盟執委會發起並以歐盟',
    '23 official languages': '23 種官方語言',
    'of the European Union.': '版本核准的 Copyleft 自由/開源軟體授權條款。',
    // Similar to <a>CC-BY-4.0</a> but requires … a similar, <a>compatible</a> license. …（整句由 inline 处理）
    'but requires derivatives be distributed under the same or a similar,': '但要求衍生作品以相同或類似的',
    'license. Frequently used for media assets and educational materials. A previous version is the default license for Wikipedia and other Wikimedia projects. Not recommended for software.':
      '授權條款散布。常用於媒體素材和教材。其舊版本是維基百科等維基媒體計畫的預設授權條款。不建議用於軟體。',

    // CODEOWNERS 校验
    'Failed to validate this CODEOWNERS file': '無法驗證此 CODEOWNERS 檔案',
    'Validating CODEOWNERS rules...': '正在驗證 CODEOWNERS 規則...',
    'This CODEOWNERS file is valid.': '此 CODEOWNERS 檔案有效。',
    'This CODEOWNERS file contains errors': '此 CODEOWNERS 檔案含有錯誤',
    'View CODEOWNERS errors': '查看 CODEOWNERS 錯誤',
    'CODEOWNERS errors': 'CODEOWNERS 錯誤',
    'CODEOWNERS error': 'CODEOWNERS 錯誤',
    'This line contains CODEOWNERS errors': '此行含有 CODEOWNERS 錯誤',

    // Dependabot 配置文件
    'Dependabot creates pull requests to keep your dependencies secure and up-to-date.':
      'Dependabot 會建立拉取請求以確保你的相依項目安全且為最新版本。',
    'You can opt out at any time by removing the': '可隨時刪除',
    'config file.': '設定檔以停用。',
    'View update status': '查看更新狀態',
    'Cannot configure Dependabot from this branch': '無法從此分支設定 Dependabot',
    'To configure Dependabot, you must use': '若要設定 Dependabot，必須使用',
    "this repository's default branch": '此儲存庫的預設分支',

    // 议题/讨论模板（problem 译作「問題」：issue 作「議題」，议题模板是「議題範本」，不会混淆）
    'There is a problem with this template': '此範本有一個問題',
    'There are some problems with this template': '此範本有一些問題',
    'Learn more about this error.': '瞭解此錯誤。',
    'This file is used as an Issue Form template.': '此檔案用作議題表單範本。',
    'This file is used as a markdown issue template.': '此檔案用作 Markdown 議題範本。',
    'Issue form templates are not supported on private repositories.': '私人儲存庫不支援議題表單範本。',
    'You are using an old version of issue templates. Please update to the new issue template workflow.':
      '你正在使用舊版議題範本。請更新為新的議題範本工作流程。',
    'Learn more about issue templates.': '瞭解議題範本。',

    // CITATION、FUNDING
    'file cannot be parsed. Make sure the formatting is correct.': '檔案無法剖析。請確認格式正確。',
    'This file is overriding the organization-wide': '此檔案覆寫了組織層級的',
    'file. Removing': '檔案。刪除此儲存庫中的',
    'in this repository will use the organization default.': '將改用組織的預設檔案。',
    'View organization funding file.': '查看組織的贊助檔案。',

    // CSV 解析出错：We can make this file <strong>beautiful and searchable</strong> if this error is corrected: …
    'We can make this file': '更正以下錯誤後可讓此檔案',
    'beautiful and searchable': '美觀且可搜尋',

    // 操作发布、伪造提交
    'You can publish this Action to the GitHub Marketplace': '可將此動作發布到 GitHub 市集',

    // 组织演示存储库的引导提示（auto-assign.yml）：該 <auto-assign.yml> 檔案位於你的 <demo-repository> 中並定義了…
    'Auto-assign new issue with GitHub Actions': '使用 GitHub 動作自動指派新議題',
    'file below lives inside your': '檔案位於你的',
    'and defines when and how it’s automatically triggered. This': '中並定義了自動觸發的時機和方式。此',
    '“Auto Assign” workflow': '「Auto Assign」工作流程',
    'happens to add reviewers and assignees to issues and pull requests when they’re opened in this repository.':
      '會在此儲存庫中建立議題和拉取請求時為其新增審查者和負責人。',
    // 此工作流程的結果可在你於此儲存庫建立的任何 <議題> 或 <拉取請求> 中查看…都可在 <儲存庫的「動作」分頁中查看。>
    'You can see the results of this workflow in any': '此工作流程的結果可在你於此儲存庫建立的任何',
    'that you create in this repository, as it’ll assign them to the specified members. And you can see a log of any workflows you run in':
      '中查看，因為它會將其指派給指定成員。你執行的任何工作流程的記錄都可在',
    'your repository’s “Actions” tab.': '儲存庫的「動作」分頁中查看。',
    'Create new issue to see results': '建立新議題以查看結果',
    'Learn how automation works on GitHub': '瞭解 GitHub 上的自動化運作方式',

    // 代码空间调查（与 actions 词典的「GitHub 動作」调查同译）
    'Help us improve GitHub Codespaces': '協助我們改善 GitHub 程式碼空間',
    'Tell us how to make GitHub Codespaces work better for you with three quick questions.':
      '透過三個簡短問題告訴我們如何讓 GitHub 程式碼空間更適合你。',

    // Copilot 推广弹层
    'Code 55% faster with GitHub Copilot': '使用 GitHub Copilot 撰寫程式碼速度提升 55%',
    'Spend less time creating boilerplate and repetitive code patterns, and more time building great software. Try it in Codespaces or your favorite file editor.':
      '減少撰寫樣板程式碼和重複程式碼模式的時間，把更多時間用在開發優秀的軟體上。可在程式碼空間或你慣用的編輯器中試用。',
    'For an organization, developers writing less boilerplate code means more productivity, while learning new technologies means delivering better customers solutions. Try it in Codespaces or your file editor.':
      '對組織而言，開發人員少寫樣板程式碼代表生產力更高，學習新技術則代表能為客戶提供更好的解決方案。可在程式碼空間或你的編輯器中試用。',
    "We noticed that you're personally paying for GitHub Copilot. Instead, ask your organization admin to purchase the business version of GitHub Copilot.":
      '你正以個人身分付費使用 GitHub Copilot。可改請組織管理員購買 Copilot 商務版。',
    'Your organization can pay for GitHub Copilot': '你的組織可以為 GitHub Copilot 付費',
    // 申请被拒：日期与句号通常与此句拼成一段，由 regexp 整句处理；此为未拼接时的片段
    'Your request for Copilot Business was declined by an admin on': '你的 Copilot 商務版申請被管理員拒絕於',
    'Click this link to contact your admin.': '按一下此連結以聯絡管理員。',
    'Click this link to learn more about copilot. This action opens in a new tab.': '按一下此連結以瞭解 Copilot。將在新分頁中開啟。',
    // 空存储库引导卡片：功能申请已提交（功能名之后的片段；通常与前文拼成整句，由 regexp 处理）
    '. An admin will need to approve your request before you can use this feature.': '。管理員核准後才能使用此功能。',

    // 添加到空间（Copilot Spaces）
    'Add to space': '加入空間',
    'Select a space': '選擇空間',
    'No spaces found': '找不到空間',
    'You can create a new space to get started.': '建立新空間以開始使用。',
    'Create a new space': '建立新空間',
    'Create a new Space': '建立新空間',
    'Create a space': '建立空間',
    'File added to': '檔案已加入',
    'There was an error adding the file to the space.': '無法將檔案加入空間。',
    'There was an error adding the file to the space': '無法將檔案加入空間',
    'Space owner. Required.': '空間擁有者。必填。',
    'Where we will store your space.': '空間的儲存位置。',
    'Only you will be able to see this space.': '只有你可以看到此空間。',
    'Only visible to you and organization admins. You can share it later.': '只有你和組織管理員可以看到。之後可以共用。',
    'Fetching owners…': '正在擷取擁有者…',
    'An error occurred while loading owners. Please reopen the dialog to try again.': '載入擁有者時發生錯誤。請重新開啟對話方塊再試一次。',
    'Unable to save space.': '無法儲存此空間。'
  },

  scoped: {
    // 许可证规则分组与标签（Permissions 由通用词典处理）
    Limitations: '限制',
    Conditions: '條件',
    'Commercial use': '商業用途',
    Modification: '修改',
    Distribution: '散布',
    'Private use': '私人使用',
    'Patent use': '專利使用',
    'License and copyright notice': '授權條款和著作權聲明',
    'License and copyright notice for source': '原始碼的授權條款和著作權聲明',
    'State changes': '註明變更',
    'Disclose source': '公開原始碼',
    'Network use is distribution': '網路使用即散布',
    'Same license': '相同授權條款',
    'Same license (file)': '相同授權條款（檔案）',
    'Same license (library)': '相同授權條款（程式庫）',
    'Trademark use': '商標使用',
    Liability: '責任',
    Warranty: '擔保',
    'Similar to': '類似於',
    compatible: '相容',

    // 议题模板预览、横幅标题（None、Upgrade now 由全局词条处理）
    Info: '資訊',
    'Give feedback.': '提供意見回饋。',
    'Draft a release': '草擬發行版本',

    // 组织演示存储库的引导提示：面包屑与句中链接
    Tasks: '任務',
    issue: '議題',
    'pull request': '拉取請求',

    // 分支信息栏「貢獻」弹层、同步复刻冲突弹层的按钮（全局 static 是状态义「開放中的拉取請求」；
    // 代码页上命令面板等全局浮层里状态义的同名读屏文字也会用此译法）
    'Open pull request': '建立拉取請求',

    // Copilot 推广弹层
    'Get GitHub Copilot': '取得 GitHub Copilot',
    'Start a free trial': '開始免費試用',
    "Don't show again": '不再顯示',
    'Contact your admin': '聯絡管理員',
    'for more details around their decision.': '以瞭解此決定的詳情。',
    successfully: '中'
  },

  regexp: [
    // 许可证：<owner>/<repo> is licensed under（ the）
    [/^([\w.-]+\/[\w.-]+) is licensed under(?: the)?$/, '$1 採用以下授權條款'],
    // 议题模板错误链接
    [/^Learn more about error (\d+)\.$/, '瞭解錯誤 $1。'],
    // CSV 解析出错：<strong> 之后的片段
    [/^if this error is corrected: (\S.*)$/, (_, message: string) => `：${csvError(message)}`],
    // Copilot Spaces：已选所有者（屏幕阅读器文字）
    [/^Space owner\. Required\. Selected owner: @(\S+)$/, '空間擁有者。必填。選取的擁有者：@$1'],
    // 添加到空间：播报
    [/^File added to (\S.*) successfully\.$/, '檔案已加入 $1。'],
    // Copilot 推广弹层：申请被拒（相邻文本节点拼接后整句匹配）
    [
      /^Your request for (\S.*?) was declined by an admin(?: on (\S.*))?\.$/,
      (_, feature: string, date: string | undefined) => declinedRequest(feature, date)
    ],
    // 空存储库引导卡片：功能申请已提交（相邻文本节点拼接后整句匹配）
    [
      /^You['’]ve successfully submitted a request to your organization['’]s admins for access to (\S.*?)\. An admin will need to approve your request before you can use this feature\.$/,
      (_, feature: string) => submittedRequest(feature)
    ]
  ],

  inline: [
    // 含链接的许可证说明（div.VerifiedHTMLBox__* 内的 HTML，取自 choosealicense.com 数据）：
    // 语序要跨链接调整、或链接两侧的空格要按中文重排的整句；其余含链接的说明按片段翻译
    // A permissive license similar to the <a>BSD 2-Clause License</a>, but with a 3rd clause …
    [
      'A permissive license similar to the {}, but with a 3rd clause that prohibits others from using the name of the copyright holder or its contributors to promote derived products without written consent.',
      '一種類似於 {} 的寬鬆授權條款，但增加的第三條禁止他人未經書面同意使用著作權人或其貢獻者的名義推廣衍生產品。'
    ],
    // A variant of the <a>BSD 3-Clause License</a> that explicitly does not grant any patent rights.
    ['A variant of the {} that explicitly does not grant any patent rights.', '一種明確不授予任何專利權的 {} 變體。'],
    // … approved by the European Commission in <a>23 official languages</a> of the European Union.
    [
      'The European Union Public Licence (EUPL) is a copyleft free/open source software license created on the initiative of and approved by the European Commission in {} of the European Union.',
      '歐盟公共授權條款 (EUPL) 是由歐盟執委會發起並以歐盟 {}版本核准的 Copyleft 自由/開源軟體授權條款。'
    ],
    // Similar to <a>CC-BY-4.0</a> but requires … a similar, <a>compatible</a> license. …
    [
      'Similar to {} but requires derivatives be distributed under the same or a similar, {} license. Frequently used for media assets and educational materials. A previous version is the default license for Wikipedia and other Wikimedia projects. Not recommended for software.',
      '類似於 {} 但要求衍生作品以相同或類似的{}授權條款散布。常用於媒體素材和教材。其舊版本是維基百科等維基媒體計畫的預設授權條款。不建議用於軟體。'
    ]
  ]
} satisfies PageDictionary
