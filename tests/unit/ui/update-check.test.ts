import { enableAutoUnmount, mount, type VueWrapper } from '@vue/test-utils'
import { fakeBrowser } from 'wxt/testing/fake-browser'
import { clearToasts } from '../../../src/components/toast'
import { REPOSITORY_URL } from '../../../src/shared/extension'
import { settingsItem } from '../../../src/shared/settings'
import { LATEST_RELEASE_URL, updateCheckItem } from '../../../src/shared/update-check'
import '../../../src/entrypoints/options/options.css'
import { mockPermission, mockVersion, seedChineseUi, settle, ZH_SETTINGS } from './helpers'
import { importSfc, required } from './sfc'

const Popup = await importSfc(() => import('../../../src/entrypoints/popup/App.vue'))
const Options = await importSfc(() => import('../../../src/entrypoints/options/App.vue'))

const TAG_URL = `${REPOSITORY_URL}/releases/tag/v1.3.0`

enableAutoUnmount(afterEach)

const PAGES = [
  ['弹出页', () => Popup],
  ['设置页', () => Options]
] as const

async function render(page: (typeof PAGES)[number][1]): Promise<VueWrapper> {
  const wrapper = mount(required(page()), { attachTo: document.body })
  await settle()
  return wrapper
}

/** 最新发行版跳转到的地址 */
function mockLatest(url = TAG_URL): ReturnType<typeof vi.spyOn> {
  return vi.spyOn(globalThis, 'fetch').mockResolvedValue({ ok: true, url } as Response)
}

describe.skipIf(!Popup || !Options)('新版本提示', () => {
  beforeEach(async () => {
    fakeBrowser.reset()
    await seedChineseUi()
    mockVersion('1.2.0')
    mockPermission(true)
  })

  afterEach(() => {
    delete document.documentElement.dataset.theme
    clearToasts()
    vi.restoreAllMocks()
    vi.unstubAllEnvs()
  })

  describe.each(PAGES)('%s', (_name, page) => {
    it('从发行版安装、有新版本：版本号后显示「新版本」，新标签页打开该版本的发行版页', async () => {
      const fetch = mockLatest()
      const wrapper = await render(page)
      const badge = wrapper.get('[data-test="update"]')
      expect(badge.text()).toBe('新版本')
      expect(badge.attributes('href')).toBe(TAG_URL)
      expect(badge.attributes('target')).toBe('_blank')
      expect(badge.attributes('rel')).toBe('noreferrer')
      expect(badge.attributes('aria-label')).toBe('新版本 v1.3.0')
      expect(badge.attributes('title')).toBe('新版本 v1.3.0')
      expect(wrapper.get('[data-test="version"]').element.nextElementSibling).toBe(badge.element)
      expect(fetch).toHaveBeenCalledTimes(1)
      expect(fetch.mock.calls[0]![0]).toBe(LATEST_RELEASE_URL)
    })

    it('已是最新：不显示', async () => {
      mockLatest(`${REPOSITORY_URL}/releases/tag/v1.2.0`)
      const wrapper = await render(page)
      expect(wrapper.find('[data-test="update"]').exists()).toBe(false)
    })

    it('商店安装（manifest 带 update_url）：不请求、不显示', async () => {
      vi.spyOn(fakeBrowser.runtime, 'getManifest').mockReturnValue({
        version: '1.2.0',
        update_url: 'https://clients2.google.com/service/update2/crx'
      } as never)
      const fetch = mockLatest()
      const wrapper = await render(page)
      expect(fetch).not.toHaveBeenCalled()
      expect(wrapper.find('[data-test="update"]').exists()).toBe(false)
    })

    it('Firefox 构建：不请求、不显示', async () => {
      vi.stubEnv('FIREFOX', 'true')
      await updateCheckItem.setValue({ latest: '1.3.0', checkedAt: Date.now() })
      const fetch = mockLatest()
      const wrapper = await render(page)
      expect(fetch).not.toHaveBeenCalled()
      expect(wrapper.find('[data-test="update"]').exists()).toBe(false)
    })

    it('24 小时内检查过：按缓存显示，不请求', async () => {
      await updateCheckItem.setValue({ latest: '1.3.0', checkedAt: Date.now() })
      const fetch = mockLatest()
      const wrapper = await render(page)
      expect(fetch).not.toHaveBeenCalled()
      expect(wrapper.get('[data-test="update"]').attributes('href')).toBe(TAG_URL)
    })

    it('请求失败：不显示', async () => {
      vi.spyOn(globalThis, 'fetch').mockRejectedValue(new TypeError('Failed to fetch'))
      const wrapper = await render(page)
      expect(wrapper.find('[data-test="update"]').exists()).toBe(false)
    })

    it('英文界面', async () => {
      await settingsItem.setValue({ ...ZH_SETTINGS, uiLanguage: 'en' })
      mockLatest()
      const wrapper = await render(page)
      const badge = wrapper.get('[data-test="update"]')
      expect(badge.text()).toBe('Update')
      expect(badge.attributes('aria-label')).toBe('Update v1.3.0')
    })
  })
})
