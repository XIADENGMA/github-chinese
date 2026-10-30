import { fakeBrowser } from 'wxt/testing/fake-browser'
import { BADGE_COLOR, syncBadge } from '../../../src/shared/badge'
import { getExtensionVersion, isFirefoxBuild } from '../../../src/shared/extension'
import { MESSAGE_TIMEOUT_MS, sendToBackground, sendToTab } from '../../../src/shared/tab-messages'
import { removeApi } from './fake-api'

let restoreApi: (() => void) | undefined

beforeEach(() => {
  fakeBrowser.reset()
})

afterEach(() => {
  restoreApi?.()
  restoreApi = undefined
  vi.useRealTimers()
  vi.restoreAllMocks()
})

describe('syncBadge', () => {
  it('停用显示「关」', async () => {
    await syncBadge({ enabled: false, uiLanguage: 'zh-CN' })
    expect(await fakeBrowser.action.getBadgeText({})).toBe('关')
    expect(await fakeBrowser.action.getBadgeBackgroundColor({})).toEqual([0x59, 0x63, 0x6e, 255])
    expect(BADGE_COLOR).toBe('#59636e')
  })

  it.each([
    ['zh-TW', [], '關'],
    ['en', [], 'OFF'],
    ['auto', ['zh-HK', 'en'], '關'],
    ['auto', ['zh-CN'], '关'],
    ['auto', ['ja-JP'], 'OFF'],
  ] as const)('徽标文字随界面语言：%s %j → %s', async (uiLanguage, languages, text) => {
    await syncBadge({ enabled: false, uiLanguage }, { languages })
    expect(await fakeBrowser.action.getBadgeText({})).toBe(text)
  })

  it('启用清空', async () => {
    await syncBadge({ enabled: false, uiLanguage: 'zh-CN' })
    await syncBadge({ enabled: true, uiLanguage: 'zh-CN' })
    expect(await fakeBrowser.action.getBadgeText({})).toBe('')
  })

  it('不支持徽标时跳过', async () => {
    restoreApi = removeApi('action')
    await expect(syncBadge({ enabled: false, uiLanguage: 'zh-CN' })).resolves.toBeUndefined()
  })
})

describe('extension', () => {
  it('读取版本号', () => {
    vi.spyOn(fakeBrowser.runtime, 'getManifest').mockReturnValue({ version: '1.2.3' } as never)
    expect(getExtensionVersion()).toBe('1.2.3')
  })

  it('读取失败返回空串', () => {
    vi.spyOn(fakeBrowser.runtime, 'getManifest').mockImplementation(() => {
      throw new Error('不可用')
    })
    expect(getExtensionVersion()).toBe('')
  })

  it('Firefox 构建：按 import.meta.env.FIREFOX 判断（测试环境的值是字符串）', () => {
    try {
      expect(isFirefoxBuild()).toBe(false)
      vi.stubEnv('FIREFOX', 'true')
      expect(isFirefoxBuild()).toBe(true)
    } finally {
      vi.unstubAllEnvs()
    }
  })
})

describe('sendToTab', () => {
  it('只发往顶层框架并返回响应', async () => {
    const sendMessage = vi.spyOn(fakeBrowser.tabs, 'sendMessage').mockResolvedValue({ ok: 1 } as never)
    expect(await sendToTab(7, 'gcn:get-status')).toEqual({ ok: 1 })
    expect(sendMessage).toHaveBeenCalledWith(7, { type: 'gcn:get-status' }, { frameId: 0 })
  })

  it('内容脚本未注入时拒绝', async () => {
    vi.spyOn(fakeBrowser.tabs, 'sendMessage').mockRejectedValue(new Error('Receiving end does not exist.'))
    await expect(sendToTab(7, 'gcn:get-status')).rejects.toThrow('Receiving end does not exist.')
  })

  it('超时未回复时拒绝', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
    vi.spyOn(fakeBrowser.tabs, 'sendMessage').mockReturnValue(new Promise(() => undefined) as never)
    const pending = sendToTab(7, 'gcn:get-status')
    vi.advanceTimersByTime(MESSAGE_TIMEOUT_MS)
    await expect(pending).rejects.toThrow('内容脚本无响应')
  })
})

describe('sendToBackground', () => {
  const SAVED = { type: 'gcn:custom-entries-saved' } as const

  it('原样发给后台并返回应答', async () => {
    const sendMessage = vi.spyOn(fakeBrowser.runtime, 'sendMessage').mockResolvedValue({ ok: true } as never)
    expect(await sendToBackground(SAVED)).toEqual({ ok: true })
    expect(sendMessage).toHaveBeenCalledWith(SAVED)
  })

  it('发送失败时拒绝', async () => {
    vi.spyOn(fakeBrowser.runtime, 'sendMessage').mockRejectedValue(new Error('Receiving end does not exist.'))
    await expect(sendToBackground(SAVED)).rejects.toThrow('Receiving end does not exist.')
  })

  it('超时未回复时拒绝', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
    vi.spyOn(fakeBrowser.runtime, 'sendMessage').mockReturnValue(new Promise(() => undefined) as never)
    const pending = sendToBackground(SAVED)
    vi.advanceTimersByTime(MESSAGE_TIMEOUT_MS)
    await expect(pending).rejects.toThrow('后台无响应')
  })
})
