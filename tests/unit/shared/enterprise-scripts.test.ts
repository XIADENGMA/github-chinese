import { fakeBrowser } from 'wxt/testing/fake-browser'
import { ENTERPRISE_BRIDGE_ID, ENTERPRISE_CONTENT_ID, syncEnterpriseScripts } from '../../../src/shared/enterprise-scripts'
import { removeApi } from './fake-api'
import { fakeContentScripts, type FakeContentScripts } from './fake-scripting'

const MATCHES = ['*://github.example.com/*', '*://gist.github.example.com/*']

let scripts: FakeContentScripts

const bridge = (matches: readonly string[] = MATCHES): unknown => ({
  id: ENTERPRISE_BRIDGE_ID,
  matches,
  js: ['content-scripts/turbo-bridge.js'],
  runAt: 'document_start',
  persistAcrossSessions: true,
  world: 'MAIN'
})

const content = (matches: readonly string[] = MATCHES): unknown => ({
  id: ENTERPRISE_CONTENT_ID,
  matches,
  js: ['content-scripts/content.js'],
  runAt: 'document_start',
  persistAcrossSessions: true
})

beforeEach(() => {
  fakeBrowser.reset()
  scripts = fakeContentScripts()
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('syncEnterpriseScripts', () => {
  it('注册桥接（主世界）与内容脚本：document_start，跨会话保留', async () => {
    await syncEnterpriseScripts(MATCHES)
    expect(scripts.registered).toEqual([bridge(), content()])
  })

  it('与已注册的相同：不改动（浏览器按字符串排序返回站点列表）', async () => {
    await syncEnterpriseScripts(MATCHES)
    await syncEnterpriseScripts([...MATCHES].reverse())
    expect(fakeBrowser.scripting.registerContentScripts).toHaveBeenCalledTimes(2)
    expect(fakeBrowser.scripting.updateContentScripts).not.toHaveBeenCalled()
  })

  it('站点变化：更新，仍跨会话保留', async () => {
    await syncEnterpriseScripts(MATCHES)
    const next = [...MATCHES, '*://octo-corp.ghe.com/*']
    await syncEnterpriseScripts(next)
    expect(fakeBrowser.scripting.updateContentScripts).toHaveBeenCalledTimes(2)
    expect(scripts.registered).toEqual([bridge(next), content(next)])
  })

  it('已注册的运行环境不同、降为仅本次会话：更新', async () => {
    scripts.registered.push(
      { id: ENTERPRISE_BRIDGE_ID, matches: MATCHES, js: ['content-scripts/turbo-bridge.js'], runAt: 'document_start' },
      { ...(content() as object), id: ENTERPRISE_CONTENT_ID, persistAcrossSessions: false }
    )
    await syncEnterpriseScripts(MATCHES)
    expect(fakeBrowser.scripting.updateContentScripts).toHaveBeenCalledTimes(2)
    expect(scripts.registered).toEqual([bridge(), content()])
  })

  it('没有站点：注销；未注册时不报错', async () => {
    await syncEnterpriseScripts([])
    expect(fakeBrowser.scripting.unregisterContentScripts).not.toHaveBeenCalled()
    await syncEnterpriseScripts(MATCHES)
    await syncEnterpriseScripts([])
    expect(scripts.registered).toEqual([])
  })

  it('注册报 ID 已存在（启动初期持久注册还在加载）：按已注册处理；其他错误抛出', async () => {
    vi.mocked(fakeBrowser.scripting.registerContentScripts).mockRejectedValueOnce(
      new Error(`Duplicate script ID '${ENTERPRISE_BRIDGE_ID}'`)
    )
    await syncEnterpriseScripts(MATCHES)
    expect(scripts.registered).toEqual([content()])
    vi.mocked(fakeBrowser.scripting.registerContentScripts).mockRejectedValueOnce(new Error('配额'))
    await expect(syncEnterpriseScripts(MATCHES)).rejects.toThrow('配额')
  })

  it('没有 scripting API：不处理', async () => {
    const restore = removeApi('scripting')
    try {
      await expect(syncEnterpriseScripts(MATCHES)).resolves.toBeUndefined()
    } finally {
      restore()
    }
  })
})
