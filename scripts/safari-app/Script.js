// Safari 版宿主应用的页面（替换 safari-web-extension-converter 生成的页面，见 scripts/pack-safari.ts）。
// 应用载入页面后调用 show(...)，参数中第一个布尔值为扩展是否已在 Safari 中开启（Xcode 各版本模板的参数个数不同）；
// 点按钮时向应用发 open-preferences，应用退出并打开 Safari 的扩展设置

const TEXT = {
  'zh-CN': { name: 'GitHub 中文化', on: '已开启', off: '已关闭', open: '打开 Safari 设置' },
  'zh-TW': { name: 'GitHub 中文化', on: '已開啟', off: '已關閉', open: '打開 Safari 設定' },
  en: { name: 'GitHub Chinese', on: 'On', off: 'Off', open: 'Open Safari Settings' },
}

/** 繁体的地区 */
const TRADITIONAL_REGIONS = new Set(['tw', 'hk', 'mo'])

/** 界面语言：同扩展（见 src/shared/locale.ts），中文按简繁，其他语言用英文 */
function uiLanguage(tag) {
  const [language = '', ...subtags] = String(tag ?? '')
    .toLowerCase()
    .replaceAll('_', '-')
    .split('-')
  if (language !== 'zh' && language !== 'yue') return 'en'
  if (subtags.includes('hant')) return 'zh-TW'
  if (subtags.includes('hans')) return 'zh-CN'
  return language === 'yue' || subtags.some((subtag) => TRADITIONAL_REGIONS.has(subtag)) ? 'zh-TW' : 'zh-CN'
}

const language = uiLanguage(navigator.languages?.[0] ?? navigator.language)
const text = TEXT[language]
document.documentElement.lang = language
document.getElementById('name').textContent = text.name
document.getElementById('open-settings').textContent = text.open

window.show = (...args) => {
  const enabled = args.find((arg) => typeof arg === 'boolean')
  document.getElementById('state').textContent = enabled === undefined ? '' : enabled ? text.on : text.off
}

document.getElementById('open-settings').addEventListener('click', () => {
  window.webkit?.messageHandlers?.controller?.postMessage('open-preferences')
})
