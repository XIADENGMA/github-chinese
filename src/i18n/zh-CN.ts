/** 扩展界面文案：简体中文（键的来源，其余语言须逐键对应） */
const zhCN = {
  appName: 'GitHub 中文化',

  enable: '启用',
  status: '状态',
  stateLoading: '加载中',
  stateUnauthorized: '未授权',
  stateUnavailable: '不可用',
  stateNotReady: '未就绪',
  stateTranslated: '已翻译',
  stateExcluded: '已排除',
  stateDisabled: '已停用',
  reload: '刷新',
  authorize: '授权',
  excludePage: '排除此页',
  includePage: '取消排除',
  settings: '设置',
  saveFailed: '保存失败',
  authorizeFailed: '授权失败',
  reloadFailed: '刷新失败',
  openFailed: '打开失败',

  appearanceCurrent: '外观：{mode}',
  themeAuto: '自动',
  themeLight: '浅色',
  themeDark: '深色',

  general: '常规',
  translateTime: '时间本地化',
  translateTitle: '翻译标题',
  languageSection: '语言',
  uiLanguage: '界面语言',
  pageLanguage: '翻译语言',
  autoOption: '自动（{name}）',
  languageZhCN: '简体中文',
  languageZhTW: '繁体中文',
  languageEn: '英文',

  translationSection: '汉化设置',
  excludedPaths: '排除路径',
  path: '路径',
  noPaths: '暂无路径',
  invalidFormat: '格式错误',

  customEntries: '自定义词条',
  import: '导入',
  export: '导出',
  source: '原文',
  target: '译文',
  add: '添加',
  search: '搜索',
  actions: '操作',
  delete: '删除',
  deleteEntry: '删除 {source}',
  noEntries: '暂无词条',
  notFound: '未找到',
  exists: '已存在',
  readFailed: '读取失败',
  loadFailed: '加载失败',
  imported: '已导入 {count} 条',

  accelerateSection: '加速设置',
  accelerate: '加速下载',
  accelerateImages: '加速图片',
  failover: '故障转移',
  sources: '加速源',
  sourceName: '名称',
  sourceTemplate: '地址',
  latency: '延迟',
  ping: 'Ping',
  testLatency: '测速',
  testing: '测速中',
  timeout: '超时',
  failed: '失败',
  restoreSources: '恢复内置',
  noSources: '暂无加速源',
  limitReached: '已达上限',

  purifySection: '净化设置',
  purifySearch: '净化搜索',
  searchBlockRules: '屏蔽规则',
  noRules: '暂无规则',

  about: '关于',
  githubRepository: 'GitHub',

  badgeOff: '关',
}

export type MessageKey = keyof typeof zhCN

/** 一种语言的全部文案 */
export type Messages = Readonly<Record<MessageKey, string>>

export default zhCN satisfies Messages
