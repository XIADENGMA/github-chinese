import {
  isAcknowledged,
  isBackgroundMessage,
  isContentMessage,
  isContentStatus,
  isFetchedImage,
  isResolvedDownload
} from '../../../src/shared/messages'

const STATUS = {
  active: true,
  excluded: false,
  pages: ['common', 'repository'],
  translatedCount: 12
}

describe('isContentMessage', () => {
  it.each(['gcn:get-status', 'gcn:custom-entries-changed', 'gcn:search-rules-changed'])('%s 合法', type => {
    expect(isContentMessage({ type })).toBe(true)
  })

  it.each([
    null,
    undefined,
    'gcn:get-status',
    {},
    { type: 1 },
    { type: 'gcn:other' },
    { type: 'gcn:get-untranslated' },
    { type: 'gcn:flush-untranslated' },
    { type: 'gcn:untranslated-cleared', epoch: 1 },
    { type: 'gcn:clear-untranslated' }
  ])('%j 非法', value => {
    expect(isContentMessage(value)).toBe(false)
  })
})

describe('isContentStatus', () => {
  it('完整状态合法', () => {
    expect(isContentStatus(STATUS)).toBe(true)
  })

  it.each([
    ['null', null],
    ['数组', [STATUS]],
    ['active 非布尔', { ...STATUS, active: 'yes' }],
    ['excluded 缺失', { ...STATUS, excluded: undefined }],
    ['pages 非数组', { ...STATUS, pages: 'common' }],
    ['pages 含非字符串', { ...STATUS, pages: ['common', 1] }],
    ['计数为负', { ...STATUS, translatedCount: -1 }],
    ['计数非整数', { ...STATUS, translatedCount: 1.5 }],
    ['计数为字符串', { ...STATUS, translatedCount: '3' }]
  ])('%s → 非法', (_name, value) => {
    expect(isContentStatus(value)).toBe(false)
  })
})

describe('isBackgroundMessage', () => {
  it.each(['gcn:custom-entries-saved', 'gcn:search-rules-saved'])('%s（设置页已保存）合法', type => {
    expect(isBackgroundMessage({ type })).toBe(true)
  })

  it('注入词典脚本：只认已知语言', () => {
    expect(isBackgroundMessage({ type: 'gcn:inject-locale', locale: 'zh-CN' })).toBe(true)
    expect(isBackgroundMessage({ type: 'gcn:inject-locale', locale: 'zh-TW' })).toBe(true)
    expect(isBackgroundMessage({ type: 'gcn:inject-locale', locale: 'en' })).toBe(false)
    expect(isBackgroundMessage({ type: 'gcn:inject-locale', locale: '../../popup.js' })).toBe(false)
    expect(isBackgroundMessage({ type: 'gcn:inject-locale' })).toBe(false)
  })

  it.each([
    ['null', null],
    ['数组', [{ type: 'gcn:custom-entries-saved' }]],
    ['未知类型', { type: 'gcn:get-status' }],
    ['发给内容脚本的类型', { type: 'gcn:search-rules-changed' }],
    ['旧版未翻译上报', { type: 'gcn:report-untranslated', items: [['Open issues', 'issues', 1, 2, 1]] }],
    ['旧版未翻译清空', { type: 'gcn:clear-untranslated' }]
  ])('%s → 非法', (_name, value) => {
    expect(isBackgroundMessage(value)).toBe(false)
  })
})

describe('下载选源', () => {
  const URL = 'https://github.com/vuejs/core/releases/download/v3.5.0/vue.global.js'

  it('请求：地址为字符串，不超过上限', () => {
    expect(isBackgroundMessage({ type: 'gcn:resolve-download', url: URL })).toBe(true)
    expect(isBackgroundMessage({ type: 'gcn:resolve-download' })).toBe(false)
    expect(isBackgroundMessage({ type: 'gcn:resolve-download', url: ['x'] })).toBe(false)
    expect(isBackgroundMessage({ type: 'gcn:resolve-download', url: `${URL}?${'a'.repeat(5000)}` })).toBe(false)
  })

  it('应答：ok 为 true，地址为 https', () => {
    expect(isResolvedDownload({ ok: true, url: `https://ghfast.top/${URL}` })).toBe(true)
    expect(isResolvedDownload({ ok: true, url: 'javascript:alert(1)' })).toBe(false)
    expect(isResolvedDownload({ ok: false, url: URL })).toBe(false)
    expect(isResolvedDownload({ ok: true })).toBe(false)
    expect(isResolvedDownload(undefined)).toBe(false)
  })
})

describe('图片取回', () => {
  const AVATAR = 'https://avatars.githubusercontent.com/u/583231?v=4'

  it('请求：地址为字符串，不超过上限', () => {
    expect(isBackgroundMessage({ type: 'gcn:fetch-image', url: AVATAR })).toBe(true)
    expect(isBackgroundMessage({ type: 'gcn:fetch-image' })).toBe(false)
    expect(isBackgroundMessage({ type: 'gcn:fetch-image', url: `${AVATAR}&${'a'.repeat(5000)}` })).toBe(false)
  })

  it('应答：ok 为 true，地址为 base64 的图片 data: 地址', () => {
    expect(isFetchedImage({ ok: true, url: 'data:image/png;base64,iVBORw==' })).toBe(true)
    expect(isFetchedImage({ ok: true, url: 'data:image/svg+xml;base64,PHN2Zz4=' })).toBe(true)
    expect(isFetchedImage({ ok: true, url: 'data:text/html;base64,PGI+' })).toBe(false)
    expect(isFetchedImage({ ok: true, url: AVATAR })).toBe(false)
    expect(isFetchedImage({ ok: false, url: 'data:image/png;base64,iVBORw==' })).toBe(false)
    expect(isFetchedImage(undefined)).toBe(false)
  })
})

describe('isAcknowledged', () => {
  it('只有 ok 为 true 才算确认', () => {
    expect(isAcknowledged({ ok: true })).toBe(true)
    expect(isAcknowledged({ ok: false })).toBe(false)
    expect(isAcknowledged({ ok: 'true' })).toBe(false)
    expect(isAcknowledged(undefined)).toBe(false)
    expect(isAcknowledged(true)).toBe(false)
  })
})
