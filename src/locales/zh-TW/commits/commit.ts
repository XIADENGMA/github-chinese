import type { PageDictionary, RegExpRule } from '../../../core/types'

const regexp: readonly RegExpRule[] = [
  // 页头：父提交数、标记数（父提交行在 <pre> 内，已由引擎放行：2 parents <sha> + <sha> commit <sha>）
  [/^(\d+) parents?$/, '$1 個父提交'],
  [/^(\d+) tags$/, '$1 個標記'],
  // 更改统计：2 files changed（React 拆成 “2” “ file” “s” “ changed” 后拼接）
  [/^(\d[\d,]*) files? changed$/, '已變更 $1 個檔案'],
  // 评论区标题：3 commit comments（量词作「則」）
  [/^(\d[\d,]*) commit comments?$/, '$1 則提交留言'],
  // 经典评论区标题：0 comments on commit <0ff253b>
  [/^(\d[\d,]*) comments? on commit$/, '$1 則提交留言'],
  [/^(\d[\d,]*) comments? on commit ([0-9a-f]{7,40})$/, '提交 $2 的 $1 則留言'],
  [/^Comments on commit ([0-9a-f]{7,40})$/, '提交 $1 的留言'],
  // 行内评论线程：回复过多时的提示、评论的无障碍名称
  [/^Only the first (\d+) replies are currently being shown\.$/, '目前只顯示前 $1 則回覆。'],
  [/^Reply (\d+) to Comment (\d+)$/, '留言 $2 的第 $1 則回覆'],
  [/^Reply (\d+)$/, '第 $1 則回覆'],
  [/^Comment (\d+)$/, '第 $1 則留言'],
  // 过时评论线程的差异预览标题：Line +12, commit <0ff253b> / Line -3 to +5, commit <0ff253b>
  [/^Line ([+-]?\d+)(?: to ([+-]?\d+))?, commit$/, (_, start: string, end: string) => `第 ${end ? `${start} 至 ${end}` : start} 行，提交`],
  // 应用建议对话框：提交失败（冒号后为服务器返回的原因）
  [/^There was an error trying to commit changes: (\S.*)$/, '提交變更時發生錯誤：$1']
]

/**
 * 提交详情页（/commit/<sha>）：页头、更改统计、文件树、评论区（含应用建议对话框）与锁定对话、订阅、在场证明、
 * 错误与横幅。差异视图的文字见 diff.ts，签名弹层见 list.ts。
 */
export default {
  static: {
    // 页头
    'Show more tags': '顯示更多標記',
    'Show all tags': '顯示所有標記',
    'Loading branch information': '正在載入分支資訊',

    // 文件树（展开 / 折叠、筛选文件等由 code、pulls 词典收录）
    'File Tree': '檔案樹',
    'Draggable pane splitter': '可拖曳的窗格分隔線',
    'Find in commit input': '在提交中尋找',
    'Search within code': '在程式碼中搜尋',

    // 差异加载错误
    'Sorry, this diff is unavailable.': '抱歉，此差異無法顯示。',
    'The repository may be missing relevant data.': '儲存庫可能缺少相關資料。',
    'Please contact support for more information': '請聯絡支援團隊取得詳細資訊',
    'Sorry, this diff is taking too long to generate.': '抱歉，產生此差異耗時過長。',
    'It may be too large to display on GitHub.': '可能過大而無法在 GitHub 上顯示。',
    'Sorry, this diff is temporarily unavailable due to heavy server load.': '抱歉，此差異因伺服器負載過高而暫時無法顯示。',
    'Some content is hidden': '部分內容已隱藏',
    'Large Commits have some content hidden by default. Use the searchbox below for content that may be hidden.':
      '大型提交預設會隱藏部分內容。使用下方的搜尋方塊尋找可能隱藏的內容。',
    // 纪念 Jim Weirich 的提交横幅
    'Thanks for everything, Jim.': '感謝你所做的一切，Jim。',
    'We will miss you.': '我們會想念你。',

    // 评论区
    'to comment.': '後留言。',
    'Comment on this commit': '對此提交留言',
    'Load more comments': '載入更多留言',
    'Comments cannot be loaded right now': '目前無法載入留言',
    'Refresh the page or try again later': '重新整理頁面或稍後再試',
    'Failed to add comment': '無法新增留言',
    'Failed to edit comment': '無法編輯留言',
    'Failed to update comment': '無法更新留言',
    'Failed to delete comment': '無法刪除留言',
    'Failed to hide comment': '無法隱藏留言',
    'Failed to unhide comment': '無法取消隱藏留言',
    'Failed to fetch thread': '無法擷取討論串',
    'Failed to fetch comment data': '無法擷取留言資料',
    'Comment not found': '找不到留言',
    // 建议更改：应用 / 加入批次（应用建议、加入批次等按钮与不可应用的原因由 pulls 词典收录）
    'More suggestion batching options': '更多建議批次處理選項',
    'This feature is not supported yet.': '尚不支援此功能。',
    'There was an error trying to commit changes.': '提交變更時發生錯誤。',
    // 订阅
    "You're now subscribed to this thread.": '你已訂閱此討論串。',
    'You’re now subscribed to this thread.': '你已訂閱此討論串。',
    "You're now unsubscribed to this thread.": '你已取消訂閱此討論串。',
    'You’re now unsubscribed to this thread.': '你已取消訂閱此討論串。',

    // 锁定对话对话框（片段按原文顺序收录，译文重排后整句通顺）
    'Lock conversation on this commit': '鎖定此提交的對話',
    'Unlock conversation on this commit': '解除鎖定此提交的對話',
    // 「X. Please try again.」句号随原文（与 pulls、common-ui 一致）
    'There was an error locking this conversation. Please try again.': '鎖定此對話時發生錯誤。請再試一次。',
    'There was an error unlocking this conversation. Please try again.': '解除鎖定此對話時發生錯誤。請再試一次。',
    'Locking the conversation means:': '鎖定對話後：',
    'Unlocking the conversation means:': '解除鎖定對話後：',
    // 所有人 都能再次對此提交留言。
    'will be able to comment on this commit once more.': '都能再次對此提交留言。',
    // 其他使用者 將無法 對此提交新增留言。
    'to this commit.': '對此提交新增留言。',
    // 你和其他所屬團隊擁有此儲存庫 <寫入權限> 的人員 仍可發表 其他人可見的留言。（write access 由 issues 词典全局收录）
    'You and other members of teams with': '你和其他所屬團隊擁有此儲存庫',
    'You can always unlock this commit again in the future.': '你之後隨時可以解除鎖定此提交。',
    'You can always lock this commit again in the future.': '你之後隨時可以再次鎖定此提交。'
  },
  scoped: {
    // 页头父提交行：N 個父提交 <sha> 提交 <sha>（commit 是 <pre> 内的独立文本）
    commit: '提交',
    'Browse files': '瀏覽檔案',
    // 评论区的屏幕阅读器标题：<3> 則提交留言（评论数尚未加载时只有文字部分）
    'commit comments': '提交留言',
    'Comments on commit': '提交留言',
    // 服务器繁忙时的差异不可用说明
    'Please try again later.': '請稍後再試。',
    Top: '頂端',
    Comments: '留言',
    // 行内评论
    'Add diff comment': '新增差異留言',
    'Failed to react to comment': '無法對留言新增表情回應',
    // 应用建议对话框
    'Commit message': '提交訊息',
    'Extended description': '詳細描述',
    // 锁定对话片段（与讨论区同一套重排译法）
    'Other users': '其他使用者',
    'can’t add new comments': '將無法',
    "can't add new comments": '將無法',
    'You and other collaborators': '你和其他',
    'with access': '有權存取此儲存庫',
    'to this repository': '的人員',
    'can still leave comments': '仍可發表',
    'that others can see.': '其他人可見的留言。',
    'Lock conversation': '鎖定對話',
    'Unlock conversation': '解除鎖定對話',
    // 原文无逗号，译文不加
    'The page is unavailable due to a system error.': '頁面因系統錯誤而無法使用。',
    'Try reloading the page, or if the problem persists, contact support.': '請嘗試重新載入頁面，若問題持續發生，請聯絡支援團隊。'
  },
  regexp
} satisfies PageDictionary
