import type { PageDictionary, RegExpRule } from '../../../core/types'
import { joinCjk } from '../helpers'

/** 引导卡片申请的功能名：产品名译出，Copilot 等品牌词与未收录的名称原样保留（Map 查找不会命中原型链上的键） */
const FEATURE_NAMES: ReadonlyMap<string, string> = new Map([
  ['Codespaces', '程式碼空間'],
  ['GitHub Codespaces', 'GitHub 程式碼空間'],
])

/** 「<前缀><功能名><后缀>」：功能名为英文时与两侧中文之间补空格 */
function featureRequest(prefix: string, name: string, suffix: string): string {
  return joinCjk(joinCjk(prefix, FEATURE_NAMES.get(name) ?? name), suffix)
}

const regexp: readonly RegExpRule[] = [
  // 正在创建存储库时的自动刷新提示（原文无逗号，译文不加）
  [
    /^This page will automatically refresh in (\d+) seconds to check if the repository is ready\.$/,
    '此頁面將在 $1 秒後自動重新整理以檢查儲存庫是否已就緒。',
  ],
  // 空存储库的功能申请（引导卡片）：读屏播报
  [/^Request for (.+) submitted successfully$/, (_, name: string) => featureRequest('已送出', name, '的申請')],
  [
    /^Request for (.+) failed, please try again$/,
    (_, name: string) => featureRequest('', name, '的申請送出失敗，請再試一次'),
  ],
  [/^Request for (.+) removed$/, (_, name: string) => featureRequest('已撤回', name, '的申請')],
  [
    /^Removing request for (.+) failed, please try again$/,
    (_, name: string) => featureRequest('無法撤回', name, '的申請，請再試一次'),
  ],
]

/**
 * 空存储库与创建中的存储库：无写入访问权限的空存储库、正在复刻 / 镜像 / 生成，以及有写入访问权限时的快速设置
 * （克隆地址、命令行指引）和引导卡片（代码空间、Copilot、添加协作者）。
 * 命令行内容是代码，由 <pre> / <code> 排除。
 * 引导卡片的申请已提交、申请被拒整句（相邻文本节点拼接后匹配）由 code 词典处理。
 */
export default {
  static: {
    // 无写入访问权限的空存储库：要不要看看 <YouTube 上的 GitHub 頻道> 來打發等待時間？
    'This repository is empty.': '此儲存庫是空的。',
    'You don’t have write access to this repository yet': '你還沒有此儲存庫的寫入權限',
    "You don't have write access to this repository yet": '你還沒有此儲存庫的寫入權限',
    'Care to check out the': '要不要看看',
    'GitHub Channel on YouTube': 'YouTube 上的 GitHub 頻道',
    'while you wait?': '來打發等待時間？',

    // 创建中
    'Forking your repository': '正在分叉你的儲存庫',
    'Mirroring your repository': '正在建立你的儲存庫鏡像',
    'Generating your repository...': '正在產生你的儲存庫...',
    'Generating your repository…': '正在產生你的儲存庫…',
    'This may take anywhere from a few minutes to a few hours depending on the size of the repository being mirrored.':
      '所需時間依要鏡像的儲存庫大小從幾分鐘到幾小時不等。',

    // 快速设置
    'Quick setup': '快速設定',
    '— if you’ve done this kind of thing before': '— 如果你之前做過類似的事',
    "— if you've done this kind of thing before": '— 如果你之前做過類似的事',
    'Set up in GitHub Desktop': '在 GitHub 桌面版中設定',
    'Set up in Desktop': '在桌面版中設定',
    'Clone protocol': '複製用通訊協定',
    'Clone URL': '複製用 URL',
    // 首先 <建立新檔案> 或 <上傳現有檔案>。建議每個儲存庫都包含 README、LICENSE，以及 .gitignore。
    'Get started by': '首先',
    'creating a new file': '建立新檔案',
    'uploading an existing file': '上傳現有檔案',
    '. We recommend every repository include a': '。建議每個儲存庫都包含',
    '…or create a new repository on the command line': '…或在命令列中建立新儲存庫',
    '…or push an existing repository from the command line': '…或從命令列推送現有儲存庫',
    '…or import code from another repository': '…或從其他儲存庫匯入程式碼',
    'You can initialize this repository with code from a Subversion, Mercurial, or TFS project.':
      '你可以使用 Subversion、Mercurial 或 TFS 專案的程式碼初始化此儲存庫。',
    'Import code': '匯入程式碼',
    'Copy create commands to clipboard': '將建立命令複製到剪貼簿',
    'Copy push commands to clipboard': '將推送命令複製到剪貼簿',
    'Use the URL for this page when adding GitHub as a remote.': '將 GitHub 新增為遠端儲存庫時使用此頁面的 URL。',

    // 引导卡片
    'Start coding with Codespaces': '使用程式碼空間開始寫程式',
    // 原文的逗号都在并列的形容词之间（译作顿号），译文不另加逗号
    'Add a README file and start coding in a secure, configurable, and dedicated development environment.':
      '新增讀我檔案並在安全、可設定的專屬開發環境中開始寫程式。',
    'Set up GitHub Copilot': '設定 GitHub Copilot',
    "Use GitHub's AI pair programmer to autocomplete suggestions as you code.":
      '撰寫程式碼時使用 GitHub 的 AI 結對程式設計師自動完成建議。',
    'Use GitHub’s AI pair programmer to autocomplete suggestions as you code.':
      '撰寫程式碼時使用 GitHub 的 AI 結對程式設計師自動完成建議。',
    'Get started with GitHub Copilot': '開始使用 GitHub Copilot',
    'Add collaborators to this repository': '為此儲存庫新增協作者',
    'Search for people using their GitHub username or email address.': '依 GitHub 使用者名稱或電子郵件地址搜尋人員。',
  },
  scoped: {
    // 快速设置：README、LICENSE，以及 .gitignore（逗号无英文，不翻译）
    ', and': '，以及',
    'Invite collaborators': '邀請協作者',
  },
  regexp,
} satisfies PageDictionary
