import type { PageDictionary, RegExpRule } from '../../../core/types'
import { joinCjk } from '../helpers'
import { joinName } from './list'

/** 视图的可见范围（Everyone who can view this repository …） */
const SCOPE: Readonly<Record<string, string>> = { repository: '儲存庫', organization: '組織', profile: '個人檔案' }

/**
 * 视图分区与可见性：私人 / 共用。界面标为「可見度」，按可见度译「私人」；
 * 单独出现的 Private（分区标题、可见性按钮文字）由通用词典译为「私人」，组合文字须与之一致；
 * Shared 按术语表 share（资源共用义）译「共用」
 */
const SECTION: Readonly<Record<string, string>> = {
  Private: '私人',
  Shared: '共用',
  private: '私人',
  shared: '共用'
}

/** 视图图标颜色（与标签颜色同译：Orange → 「橘色」、Pink → 「粉紅色」） */
const ICON_COLOR: Readonly<Record<string, string>> = {
  Gray: '灰色',
  Blue: '藍色',
  Green: '綠色',
  Orange: '橘色',
  Red: '紅色',
  Pink: '粉紅色',
  Purple: '紫色'
}

/** 视图图标名（getDisplayName 后的形式） */
const ICON: Readonly<Record<string, string>> = {
  People: '人群',
  Smiley: '笑臉',
  Mention: '提及',
  Clock: '時鐘',
  'Git pull request': '拉取請求',
  Zap: '閃電',
  'Issue opened': '開放中的議題',
  Person: '人物',
  'Comment discussion': '討論',
  Organization: '組織',
  Briefcase: '公事包',
  'File diff': '檔案差異',
  'Code review': '程式碼審查',
  Codescan: '程式碼掃描',
  Terminal: '終端機',
  Tools: '工具',
  Beaker: '燒杯',
  Alert: '警示',
  Eye: '眼睛',
  Telescope: '望遠鏡',
  Bookmark: '書籤',
  Calendar: '日曆',
  Meter: '儀表',
  Moon: '月亮',
  Sun: '太陽',
  Flame: '火焰',
  Bug: '蟲子',
  'North star': '北極星',
  Rocket: '火箭',
  Squirrel: '松鼠',
  Hubot: 'Hubot',
  Dependabot: 'Dependabot',
  Repo: '儲存庫',
  'Repo locked': '已鎖定的儲存庫',
  Link: '連結',
  'Repo forked': '分叉的儲存庫',
  'Repo template': '範本儲存庫',
  Archive: '封存',
  Home: '首頁',
  Inbox: '收件匣',
  Gear: '齒輪',
  Copilot: 'Copilot',
  Globe: '地球',
  Comment: '留言'
}

const ICON_SOURCE = Object.keys(ICON)
  .sort((a, b) => b.length - a.length)
  .join('|')

/** 图标与颜色选择器按钮的 Tooltip 与 aria-label；已保存视图组件与 /repos 存储库视图共用 */
export const VIEW_ICON_RULES: readonly RegExpRule[] = [
  [/^(Gray|Blue|Green|Orange|Red|Pink|Purple) color$/, (_, color) => `${ICON_COLOR[color] ?? color}`],
  [new RegExp(`^(${ICON_SOURCE}) icon$`), (_, name) => joinCjk(ICON[name] ?? name, '圖示')]
]

function scope(name: string): string {
  return SCOPE[name] ?? name
}

function section(name: string): string {
  return SECTION[name] ?? name
}

/** 前缀 + 视图名 + 后缀：视图名是用户内容，不加引号；与中文之间按 joinName 留空格 */
function viewName(prefix: string, name: string, suffix: string): string {
  return joinName(joinName(prefix, name), suffix)
}

/**
 * 已保存的视图：视图索引页（私人/共用分区、排序、钉选）、视图详情与编辑、新建 / 复制 / 删除对话框、
 * 图标与颜色选择、视图选项菜单，/issues 仪表板的侧栏与头部选项，以及看板布局的通用文字。
 * view（名词）作「檢視」；看板的 column 作「欄」、row 作「列」，与 projects/views.ts 一致。
 */
export default {
  static: {
    // 视图索引与分区
    'Saved views': '已儲存的檢視',
    'Saved views menu': '已儲存檢視選單',
    'Loading saved views': '正在載入已儲存的檢視',
    'No views yet': '尚無檢視',
    'No private views yet': '尚無私人檢視',
    'No shared views yet': '尚無共用檢視',
    'No saved views': '沒有已儲存的檢視',
    'Create a private view': '建立私人檢視',
    'Create a shared view': '建立共用檢視',
    'to track your work.': '以追蹤你的工作。',
    'for everyone who can view this profile.': '供所有能查看此個人檔案的人使用。',
    'Pin view': '釘選檢視',
    'Unpin view': '取消釘選檢視',
    'Pinned view': '已釘選的檢視',
    'Private view': '私人檢視',
    'Build powerful views to keep track of work': '打造強大的檢視以追蹤工作',
    'Create your own views to quickly find and access your work.': '建立自己的檢視以快速尋找並存取你的工作。',
    'We couldn’t load your views. Please try again.': '無法載入你的檢視。請再試一次。',
    'We couldn’t display your views. Try reloading the page.': '無法顯示你的檢視。請嘗試重新載入頁面。',
    "We couldn't load your views. Please try again.": '無法載入你的檢視。請再試一次。',
    "We couldn't display your views. Try reloading the page.": '無法顯示你的檢視。請嘗試重新載入頁面。',
    'You have reached the maximum number of saved views': '已儲存的檢視數量已達上限',
    'Maximum number of views reached': '檢視數量已達上限',
    'Please remove an existing view before creating a new one.': '請先移除一個現有檢視再建立新檢視。',

    // 视图详情与编辑（Delete view、Duplicate view、Save changes to new view 与项目视图共用，由本词典收录）
    'Back to views': '返回檢視',
    'Create view': '建立檢視',
    'Edit view': '編輯檢視',
    'Delete view': '刪除檢視',
    'Duplicate view': '複製檢視',
    'Save changes to new view': '將變更儲存到新檢視',
    'New view name': '新檢視名稱',
    'Name cannot be blank': '名稱不可空白',
    'Title can not be empty': '標題不可空白',
    'Query can not be empty': '查詢不可空白',
    'Add a title for your saved view': '為已儲存的檢視新增標題',
    'Only you can see this private view.': '只有你能看到此私人檢視。',
    'Only you': '只有你',
    'Update view with current query': '以目前的查詢更新檢視',
    'Saved view menu': '已儲存檢視選單',
    'Saved view menu (update available)': '已儲存檢視選單（有可用的更新）',
    'Discard changes': '捨棄變更',
    'Are you sure you want to discard changes?': '確定要捨棄變更嗎？',
    'Could not create a new view': '無法建立新檢視',
    'Could not update the view': '無法更新檢視',
    'Could not delete view': '無法刪除檢視',
    'Could not duplicate view': '無法複製檢視',
    // shortcut 是已保存视图的内部名称，界面上即视图
    'Failed to delete shortcut': '刪除檢視失敗',
    'Failed to save shortcut': '儲存檢視失敗',
    'View not found': '找不到檢視',
    'It may have been deleted, or the URL may be incorrect.': '此檢視可能已刪除，或 URL 不正確。',
    'Couldn’t load this view': '無法載入此檢視',
    "Couldn't load this view": '無法載入此檢視',
    'Something went wrong loading this view. Please try again.': '載入此檢視時發生錯誤。請再試一次。',
    'Couldn’t display this view': '無法顯示此檢視',
    "Couldn't display this view": '無法顯示此檢視',
    'Something went wrong displaying this view. Try reloading the page.': '顯示此檢視時發生錯誤。請嘗試重新載入頁面。',
    Retrying: '重試中',

    // 团队（勾选列表里的团队：select → 「選取」，Choose → 「選擇」）
    'Currently selected': '目前已選取',
    'Loading selected teams': '正在載入已選取的團隊',
    'Choose teams that show up in your sidebar.': '選擇要在側邊欄中顯示的團隊。',
    'No teams selected.': '未選取團隊。',

    // 图标与颜色
    'Change icon and color': '變更圖示和顏色',
    'Change icon': '變更圖示',
    'Color selection': '顏色選擇',
    'Icon selection': '圖示選擇',

    // 视图选项与仪表板头部（Visible fields 与项目视图共用，由本词典收录）
    'View options (update available)': '檢視選項（有可用的更新）',
    'Visible fields': '顯示的欄位',
    'Set as default view': '設為預設檢視',
    // section 作「區段」，与 pulls/dashboard.ts 的「正在載入自訂區段...」一致
    'Customize sections': '自訂區段',
    'Customize your view': '自訂檢視',
    'Dismiss tip': '關閉提示',
    'Switch to the classic experience': '切換到傳統體驗',

    // 看板布局（与项目视图共用，由本词典收录）
    'Column overview': '欄總覽',
    'Loading board': '正在載入看板',
    'There are more columns than can be shown. Narrow your search to see the rest.': '欄數超出可顯示的上限。縮小搜尋範圍以查看其餘欄。',
    'There are more rows than can be shown. Narrow your search to see the rest.': '列數超出可顯示的上限。縮小搜尋範圍以查看其餘列。',
    'No cards': '沒有卡片',
    'Loading cards': '正在載入卡片',
    'Loading columns': '正在載入欄',
    'Loading rows': '正在載入列',
    'More columns': '更多欄',
    'More rows': '更多列',
    'Move to': '移到',
    'Move left': '左移',
    'Move right': '右移'
  },
  scoped: {
    Icon: '圖示',
    Shared: '共用',
    Pinned: '已釘選',
    'Move up': '上移',
    'Move down': '下移'
  },
  regexp: [
    // 视图行：Created by octocat •
    [/^Created by ([\w-]+(?:\[bot\])?)( •)?$/, (_, login, dot) => `由 ${login} 建立${dot ? ' •' : ''}`],
    // 分区折叠、展开全部
    [/^(Expand|Collapse) (Private|Shared)$/, (_, action, name) => `${action === 'Expand' ? '展開' : '摺疊'}${section(name)}檢視`],
    [/^Showing all (\d+) (private|shared) views$/, (_, count, name) => `顯示全部 ${count} 個${section(name)}檢視`],
    [/^Show more (private|shared) views$/, (_, name) => `顯示更多${section(name)}檢視`],
    // 可见范围说明（access → 「存取權」）
    [
      /^Everyone who can view this (repository|organization|profile) can see this shared view\.$/,
      (_, name) => `所有能查看此${scope(name)}的人都能看到此共用檢視。`
    ],
    [
      /^Anyone with (repository|organization|profile) access can see this view\.$/,
      (_, name) => `具有${scope(name)}存取權的任何人都能看到此檢視。`
    ],
    [/^Everyone who can view this (repository|organization|profile)$/, (_, name) => `所有能查看此${scope(name)}的人`],
    [
      /^Save a search as a view\. Views are visible to everyone with (repository|organization|profile) access\.$/,
      (_, name) => `將搜尋儲存為檢視。具有${scope(name)}存取權的所有人都能看到檢視。`
    ],
    [/^for everyone in this (repository|organization)\.$/, (_, name) => `供此${scope(name)}中的所有人使用。`],
    // 删除、复制、钉选（视图名是用户内容：原文有引号的才用「」，没有的不加；与中文之间按 joinName 留空格）
    [/^Are you sure you want to delete view '(.+)'\?$/, '確定要刪除檢視「$1」嗎？'],
    [/^Are you sure you want to delete view (.+)\?$/, (_, name) => `${viewName('確定要刪除檢視', name, '嗎')}？`],
    [
      /^View (.+) deleted\. No (private|shared) views remaining\.$/,
      (_, name, kind) => `${viewName('檢視', name, '已刪除')}。沒有剩餘的${section(kind)}檢視。`
    ],
    [/^View (.+) deleted\. No saved views remaining\.$/, (_, name) => `${viewName('檢視', name, '已刪除')}。沒有剩餘的已儲存檢視。`],
    [/^View (.+) deleted$/, (_, name) => viewName('檢視', name, '已刪除')],
    [/^Create a copy of “(.+)” as a new saved view\.$/, '將「$1」複製為新的已儲存檢視。'],
    [/^Maximum of (\d+) pins reached\. Unpin an item to pin another\.$/, '已達 $1 個釘選項目的上限。請先取消釘選一個項目再釘選其他項目。'],
    [/^View (.+) pinned$/, (_, name) => viewName('檢視', name, '已釘選')],
    [/^View (.+) unpinned$/, (_, name) => viewName('檢視', name, '已取消釘選')],
    [/^Could not pin (.+)$/, (_, name) => joinName('無法釘選', name)],
    [/^Could not unpin (.+)$/, (_, name) => joinName('無法取消釘選', name)],
    [/^Edit (.+) description$/, (_, name) => viewName('編輯', name, '的描述')],
    [/^Edit (.+) title$/, (_, name) => viewName('編輯', name, '的標題')],
    // 图标与颜色选择器
    ...VIEW_ICON_RULES,
    // 可见性按钮：Visibility: Private
    [/^Visibility: (Private|Shared)$/, (_, name) => `可見度：${section(name)}`],
    // 仪表板：Change the issues type filter（窄屏侧栏折叠按钮，与 organization/repos-list.ts 同译）、
    // Default to this view when visiting github.com/issues（与 pulls/dashboard.ts 同译）
    [/^Change the issues type filter$/, '切換議題檢視'],
    [/^Default to this view when visiting (\S+)$/, '造訪 $1 時預設開啟此檢視'],
    // 看板：12 cards、More cards in Todo
    [/^(\d+) cards?$/, '$1 張卡片'],
    [/^More cards in (.+)$/, (_, name) => joinName(name, '中的更多卡片')],
    // 看板泳道与单元格的无障碍名称（数量在最后）：Alice row, 3 cards；Done, Alice, 1 card（分组值不加引号）
    [/^(.+) row, ([\d,]+) cards?$/, (_, name, count) => `${joinName(name, '列')}，${count} 張卡片`],
    [/^(.+), ([\d,]+) cards?$/, '$1，$2 張卡片']
  ]
} satisfies PageDictionary
