import type { PageDictionary, RegExpRule } from '../../../core/types'
import { joinCjk } from '../helpers'
import { joinName } from './list'

/** 视图的可见范围（Everyone who can view this repository …） */
const SCOPE: Readonly<Record<string, string>> = { repository: '存储库', organization: '组织', profile: '个人资料' }

/**
 * 视图分区与可见性：专用 / 共享。界面标为“可见性”，按可见性译“专用”；
 * 单独出现的 Private（分区标题、可见性按钮文字）由通用词典译为“专用”，组合文字须与之一致
 */
const SECTION: Readonly<Record<string, string>> = {
  Private: '专用',
  Shared: '共享',
  private: '专用',
  shared: '共享',
}

/** 视图图标颜色 */
const ICON_COLOR: Readonly<Record<string, string>> = {
  Gray: '灰色',
  Blue: '蓝色',
  Green: '绿色',
  Orange: '橙色',
  Red: '红色',
  Pink: '粉色',
  Purple: '紫色',
}

/** 视图图标名（getDisplayName 后的形式） */
const ICON: Readonly<Record<string, string>> = {
  People: '人群',
  Smiley: '笑脸',
  Mention: '提及',
  Clock: '时钟',
  'Git pull request': '拉取请求',
  Zap: '闪电',
  'Issue opened': '打开的议题',
  Person: '人员',
  'Comment discussion': '讨论',
  Organization: '组织',
  Briefcase: '公文包',
  'File diff': '文件差异',
  'Code review': '代码审查',
  Codescan: '代码扫描',
  Terminal: '终端',
  Tools: '工具',
  Beaker: '烧杯',
  Alert: '警告',
  Eye: '眼睛',
  Telescope: '望远镜',
  Bookmark: '书签',
  Calendar: '日历',
  Meter: '仪表',
  Moon: '月亮',
  Sun: '太阳',
  Flame: '火焰',
  Bug: '虫子',
  'North star': '北极星',
  Rocket: '火箭',
  Squirrel: '松鼠',
  Hubot: 'Hubot',
  Dependabot: 'Dependabot',
  Repo: '存储库',
  'Repo locked': '锁定的存储库',
  Link: '链接',
  'Repo forked': '复刻的存储库',
  'Repo template': '模板存储库',
  Archive: '存档',
  Home: '主页',
  Inbox: '收件箱',
  Gear: '齿轮',
  Copilot: 'Copilot',
  Globe: '地球',
  Comment: '评论',
}

const ICON_SOURCE = Object.keys(ICON)
  .sort((a, b) => b.length - a.length)
  .join('|')

/** 图标与颜色选择器按钮的 Tooltip 与 aria-label；已保存视图组件与 /repos 存储库视图共用 */
export const VIEW_ICON_RULES: readonly RegExpRule[] = [
  [/^(Gray|Blue|Green|Orange|Red|Pink|Purple) color$/, (_, color) => `${ICON_COLOR[color] ?? color}`],
  [new RegExp(`^(${ICON_SOURCE}) icon$`), (_, name) => joinCjk(ICON[name] ?? name, '图标')],
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
 * 已保存的视图：视图索引页（专用/共享分区、排序、置顶）、视图详情与编辑、新建 / 复制 / 删除对话框、
 * 图标与颜色选择、视图选项菜单，/issues 仪表板的侧栏与头部选项，以及看板布局的通用文字。
 */
export default {
  static: {
    // 视图索引与分区
    'Saved views': '已保存的视图',
    'Saved views menu': '已保存视图菜单',
    'Loading saved views': '正在加载已保存的视图',
    'No views yet': '暂无视图',
    'No private views yet': '暂无专用视图',
    'No shared views yet': '暂无共享视图',
    'No saved views': '没有已保存的视图',
    'Create a private view': '创建专用视图',
    'Create a shared view': '创建共享视图',
    'to track your work.': '来跟踪你的工作。',
    'for everyone who can view this profile.': '供所有能查看此个人资料的人使用。',
    'Pin view': '置顶视图',
    'Unpin view': '取消置顶视图',
    'Pinned view': '已置顶的视图',
    'Private view': '专用视图',
    'Build powerful views to keep track of work': '构建强大的视图来跟踪工作',
    'Create your own views to quickly find and access your work.': '创建自己的视图，快速查找和访问你的工作。',
    'We couldn’t load your views. Please try again.': '无法加载你的视图。请重试。',
    'We couldn’t display your views. Try reloading the page.': '无法显示你的视图。请尝试重新加载页面。',
    "We couldn't load your views. Please try again.": '无法加载你的视图。请重试。',
    "We couldn't display your views. Try reloading the page.": '无法显示你的视图。请尝试重新加载页面。',
    'You have reached the maximum number of saved views': '已保存的视图数量已达上限',
    'Maximum number of views reached': '视图数量已达上限',
    'Please remove an existing view before creating a new one.': '请先删除现有视图再新建。',

    // 视图详情与编辑（Delete view、Duplicate view、Save changes to new view 与项目视图共用，由本词典收录）
    'Back to views': '返回视图',
    'Create view': '创建视图',
    'Edit view': '编辑视图',
    'Delete view': '删除视图',
    'Duplicate view': '复制视图',
    'Save changes to new view': '将更改保存到新视图',
    'New view name': '新视图名称',
    'Name cannot be blank': '名称不能为空',
    'Title can not be empty': '标题不能为空',
    'Query can not be empty': '查询不能为空',
    'Add a title for your saved view': '为已保存的视图添加标题',
    'Only you can see this private view.': '只有你能看到此专用视图。',
    'Only you': '仅你自己',
    'Update view with current query': '用当前查询更新视图',
    'Saved view menu': '已保存视图菜单',
    'Saved view menu (update available)': '已保存视图菜单（有可用更新）',
    'Discard changes': '放弃更改',
    'Are you sure you want to discard changes?': '确定要放弃更改吗？',
    'Could not create a new view': '无法创建新视图',
    'Could not update the view': '无法更新视图',
    'Could not delete view': '无法删除视图',
    'Could not duplicate view': '无法复制视图',
    'Failed to delete shortcut': '删除视图失败',
    'Failed to save shortcut': '保存视图失败',
    'View not found': '未找到视图',
    'It may have been deleted, or the URL may be incorrect.': '它可能已被删除，或网址有误。',
    'Couldn’t load this view': '无法加载此视图',
    "Couldn't load this view": '无法加载此视图',
    'Something went wrong loading this view. Please try again.': '加载此视图时出错。请重试。',
    'Couldn’t display this view': '无法显示此视图',
    "Couldn't display this view": '无法显示此视图',
    'Something went wrong displaying this view. Try reloading the page.': '显示此视图时出错。请尝试重新加载页面。',
    Retrying: '重试中',

    // 团队
    'Currently selected': '当前已选',
    'Loading selected teams': '正在加载所选团队',
    'Choose teams that show up in your sidebar.': '选择要在侧栏中显示的团队。',
    'No teams selected.': '未选择团队。',

    // 图标与颜色
    'Change icon and color': '更改图标和颜色',
    'Change icon': '更改图标',
    'Color selection': '颜色选择',
    'Icon selection': '图标选择',

    // 视图选项与仪表板头部（Visible fields 与项目视图共用，由本词典收录）
    'View options (update available)': '视图选项（有可用更新）',
    'Visible fields': '可见字段',
    'Set as default view': '设为默认视图',
    'Customize sections': '自定义分区',
    'Customize your view': '自定义视图',
    'Dismiss tip': '关闭提示',
    'Switch to the classic experience': '切换到经典体验',

    // 看板布局（与项目视图共用，由本词典收录）
    'Column overview': '列概述',
    'Loading board': '正在加载看板',
    'There are more columns than can be shown. Narrow your search to see the rest.':
      '列数超出显示上限。缩小搜索范围以查看其余列。',
    'There are more rows than can be shown. Narrow your search to see the rest.':
      '行数超出显示上限。缩小搜索范围以查看其余行。',
    'No cards': '没有卡片',
    'Loading cards': '正在加载卡片',
    'Loading columns': '正在加载列',
    'Loading rows': '正在加载行',
    'More columns': '更多列',
    'More rows': '更多行',
    'Move to': '移动到',
    'Move left': '左移',
    'Move right': '右移',
  },
  scoped: {
    Icon: '图标',
    Shared: '共享',
    Pinned: '已置顶',
    'Move up': '上移',
    'Move down': '下移',
  },
  regexp: [
    // 视图行：Created by octocat •
    [/^Created by ([\w-]+(?:\[bot\])?)( •)?$/, (_, login, dot) => `由 ${login} 创建${dot ? ' •' : ''}`],
    // 分区折叠、展开全部
    [
      /^(Expand|Collapse) (Private|Shared)$/,
      (_, action, name) => `${action === 'Expand' ? '展开' : '折叠'}${section(name)}视图`,
    ],
    [/^Showing all (\d+) (private|shared) views$/, (_, count, name) => `显示全部 ${count} 个${section(name)}视图`],
    [/^Show more (private|shared) views$/, (_, name) => `显示更多${section(name)}视图`],
    // 可见范围说明
    [
      /^Everyone who can view this (repository|organization|profile) can see this shared view\.$/,
      (_, name) => `所有能查看此${scope(name)}的人都能看到此共享视图。`,
    ],
    [
      /^Anyone with (repository|organization|profile) access can see this view\.$/,
      (_, name) => `拥有${scope(name)}访问权限的任何人都能看到此视图。`,
    ],
    [/^Everyone who can view this (repository|organization|profile)$/, (_, name) => `所有能查看此${scope(name)}的人`],
    [
      /^Save a search as a view\. Views are visible to everyone with (repository|organization|profile) access\.$/,
      (_, name) => `将搜索保存为视图。拥有${scope(name)}访问权限的所有人都能看到视图。`,
    ],
    [/^for everyone in this (repository|organization)\.$/, (_, name) => `供此${scope(name)}中的所有人使用。`],
    // 删除、复制、置顶（视图名是用户内容：原文有引号的才用“”，没有的不加；与中文之间按 joinName 留空格）
    [/^Are you sure you want to delete view '(.+)'\?$/, '确定要删除视图“$1”吗？'],
    [/^Are you sure you want to delete view (.+)\?$/, (_, name) => `${viewName('确定要删除视图', name, '吗')}？`],
    [
      /^View (.+) deleted\. No (private|shared) views remaining\.$/,
      (_, name, kind) => `${viewName('视图', name, '已删除')}。已没有${section(kind)}视图。`,
    ],
    [
      /^View (.+) deleted\. No saved views remaining\.$/,
      (_, name) => `${viewName('视图', name, '已删除')}。已没有已保存的视图。`,
    ],
    [/^View (.+) deleted$/, (_, name) => viewName('视图', name, '已删除')],
    [/^Create a copy of “(.+)” as a new saved view\.$/, '将“$1”复制为新的已保存视图。'],
    [
      /^Maximum of (\d+) pins reached\. Unpin an item to pin another\.$/,
      '已达到 $1 个置顶项的上限。请先取消置顶一项。',
    ],
    [/^View (.+) pinned$/, (_, name) => viewName('视图', name, '已置顶')],
    [/^View (.+) unpinned$/, (_, name) => viewName('视图', name, '已取消置顶')],
    [/^Could not pin (.+)$/, (_, name) => joinName('无法置顶', name)],
    [/^Could not unpin (.+)$/, (_, name) => joinName('无法取消置顶', name)],
    [/^Edit (.+) description$/, (_, name) => viewName('编辑', name, '的描述')],
    [/^Edit (.+) title$/, (_, name) => viewName('编辑', name, '的标题')],
    // 图标与颜色选择器
    ...VIEW_ICON_RULES,
    // 可见性按钮：Visibility: Private
    [/^Visibility: (Private|Shared)$/, (_, name) => `可见性：${section(name)}`],
    // 仪表板：Change the issues type filter、Default to this view when visiting github.com/issues
    [/^Change the issues type filter$/, '切换议题视图'],
    [/^Default to this view when visiting (\S+)$/, '访问 $1 时默认打开此视图'],
    // 看板：12 cards、More cards in Todo
    [/^(\d+) cards?$/, '$1 张卡片'],
    [/^More cards in (.+)$/, (_, name) => joinName(name, '中的更多卡片')],
    // 看板泳道与单元格的无障碍名称（数量在最后）：Alice row, 3 cards；Done, Alice, 1 card（分组值不加引号）
    [/^(.+) row, ([\d,]+) cards?$/, (_, name, count) => `${joinName(name, '行')}，${count} 张卡片`],
    [/^(.+), ([\d,]+) cards?$/, '$1，$2 张卡片'],
  ],
} satisfies PageDictionary
