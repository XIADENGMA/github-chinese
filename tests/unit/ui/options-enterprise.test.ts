import { enableAutoUnmount, mount, type DOMWrapper, type VueWrapper } from '@vue/test-utils'
import { fakeBrowser } from 'wxt/testing/fake-browser'
import { clearToasts } from '../../../src/components/toast'
import '../../../src/entrypoints/options/options.css'
import { enterpriseOrigins } from '../../../src/shared/enterprise'
import { fakePermissions } from '../shared/fake-permissions'
import { deleteSelected, mockVersion, seedChineseUi, settle } from './helpers'
import { importSfc, required } from './sfc'

const App = await importSfc(() => import('../../../src/entrypoints/options/App.vue'))

enableAutoUnmount(afterEach)

const HOST = 'github.example.com'

function tab(wrapper: VueWrapper): DOMWrapper<Element> {
  const found = wrapper.findAll('[role="tab"]').find(item => item.text() === '企业版设置')
  if (!found) throw new Error('未找到标签：企业版设置')
  return found
}

/** 企业版设置标签页的面板 */
function section(wrapper: VueWrapper): DOMWrapper<Element> {
  return wrapper.get(`#${CSS.escape(tab(wrapper).attributes('aria-controls') ?? '')}`) as DOMWrapper<Element>
}

/** 打开设置页并切到企业版设置标签页 */
async function render(): Promise<VueWrapper> {
  const wrapper = mount(required(App), { attachTo: document.body })
  await settle()
  await tab(wrapper).trigger('click')
  await settle()
  return wrapper
}

/** 列表各行的站点 */
function sites(wrapper: VueWrapper): string[] {
  return section(wrapper)
    .findAll<HTMLInputElement>('tbody input:not([type="checkbox"])')
    .map(input => input.element.value)
}

async function addSite(wrapper: VueWrapper, value: string): Promise<void> {
  await section(wrapper).get('form input').setValue(value)
  await section(wrapper).get('form').trigger('submit')
  await settle()
}

function toastTexts(wrapper: VueWrapper): string[] {
  return wrapper
    .get('[aria-live="polite"]')
    .findAll('.ui-toast')
    .map(toast => toast.text())
}

describe.skipIf(!App)('设置页：企业版设置', () => {
  beforeEach(async () => {
    fakeBrowser.reset()
    await seedChineseUi()
    mockVersion('1.2.3')
  })

  afterEach(() => {
    clearToasts()
    vi.restoreAllMocks()
  })

  it('站点的添加框与列表；空时显示暂无站点', async () => {
    const wrapper = await render()
    const input = section(wrapper).get('form input')
    expect(input.attributes('aria-label')).toBe('企业版站点')
    expect(input.attributes('placeholder')).toBe('github.example.com')
    expect(section(wrapper).get('[data-test="list-empty"]').text()).toBe('暂无站点')
  })

  it('列表来自已授权的站点：代码片段子域名并入主站，不含 GitHub 自己的站点、通配权限', async () => {
    fakePermissions.granted.push(...enterpriseOrigins(HOST), '*://*/*', '*://octo-corp.ghe.com/*')
    const wrapper = await render()
    expect(sites(wrapper)).toEqual(['octo-corp.ghe.com', HOST])
  })

  it('添加：规范化输入，提交时同步申请主站与代码片段子域名的权限；授予后显示', async () => {
    const wrapper = await render()
    const request = vi.spyOn(fakeBrowser.permissions, 'request')
    await section(wrapper).get('form input').setValue(`https://${HOST}/octocat/hello-world`)
    // 提交事件中同步发起，处于用户手势内
    void section(wrapper).get('form').trigger('submit')
    expect(request).toHaveBeenCalledExactlyOnceWith({ origins: enterpriseOrigins(HOST) })
    await settle()
    expect(fakePermissions.granted).toEqual(enterpriseOrigins(HOST))
    expect(sites(wrapper)).toEqual([HOST])
    expect(toastTexts(wrapper)).toEqual([])
    expect(section(wrapper).get<HTMLInputElement>('form input').element.value).toBe('')
  })

  it('拒绝授权：提示授权失败，列表不变，输入保留', async () => {
    fakePermissions.answer = false
    const wrapper = await render()
    await addSite(wrapper, HOST)
    expect(toastTexts(wrapper)).toEqual(['授权失败'])
    expect(section(wrapper).find('tbody').exists()).toBe(false)
    expect(section(wrapper).get<HTMLInputElement>('form input').element.value).toBe(HOST)
  })

  it('申请出错：提示授权失败', async () => {
    vi.spyOn(fakeBrowser.permissions, 'request').mockRejectedValue(new Error('需要用户手势'))
    const wrapper = await render()
    await addSite(wrapper, HOST)
    expect(toastTexts(wrapper)).toEqual(['授权失败'])
  })

  it.each(['github example', 'github.com', 'https://gist.github.com/octocat'])('%s：格式错误，不申请权限', async value => {
    const wrapper = await render()
    const request = vi.spyOn(fakeBrowser.permissions, 'request')
    await addSite(wrapper, value)
    expect(request).not.toHaveBeenCalled()
    expect(toastTexts(wrapper)).toEqual(['格式错误'])
  })

  it('已存在：提示，不申请权限', async () => {
    fakePermissions.granted.push(...enterpriseOrigins(HOST))
    const wrapper = await render()
    const request = vi.spyOn(fakeBrowser.permissions, 'request')
    await addSite(wrapper, `HTTPS://${HOST.toUpperCase()}/`)
    expect(request).not.toHaveBeenCalled()
    expect(toastTexts(wrapper)).toEqual(['已存在'])
  })

  it('删除：移除该站点的权限（主站与代码片段子域名），其他站点保留', async () => {
    fakePermissions.granted.push(...enterpriseOrigins(HOST), ...enterpriseOrigins('octo-corp.ghe.com'))
    const wrapper = await render()
    const remove = vi.spyOn(fakeBrowser.permissions, 'remove')
    await section(wrapper).get(`button[aria-label="删除 ${HOST}"]`).trigger('click')
    await settle()
    expect(remove).toHaveBeenCalledExactlyOnceWith({ origins: enterpriseOrigins(HOST) })
    expect(fakePermissions.granted).toEqual(enterpriseOrigins('octo-corp.ghe.com'))
    expect(sites(wrapper)).toEqual(['octo-corp.ghe.com'])
  })

  it('删除所选：一次移除这些站点的权限；全选时列表清空', async () => {
    fakePermissions.granted.push(
      ...enterpriseOrigins(HOST),
      ...enterpriseOrigins('octo-corp.ghe.com'),
      ...enterpriseOrigins('acme.ghe.com')
    )
    const wrapper = await render()
    const remove = vi.spyOn(fakeBrowser.permissions, 'remove')
    await section(wrapper).get(`input[type="checkbox"][aria-label="选择 ${HOST}"]`).setValue(true)
    await section(wrapper).get('input[type="checkbox"][aria-label="选择 acme.ghe.com"]').setValue(true)
    await deleteSelected(section(wrapper))
    expect(remove).toHaveBeenCalledExactlyOnceWith({ origins: [...enterpriseOrigins(HOST), ...enterpriseOrigins('acme.ghe.com')] })
    expect(sites(wrapper)).toEqual(['octo-corp.ghe.com'])
    await section(wrapper).get('[data-test="select-all"] input').setValue(true)
    await deleteSelected(section(wrapper))
    expect(fakePermissions.granted).toEqual([])
    expect(section(wrapper).get('[data-test="list-empty"]').text()).toBe('暂无站点')
  })

  it('删除出错：提示保存失败', async () => {
    fakePermissions.granted.push(...enterpriseOrigins(HOST))
    vi.spyOn(fakeBrowser.permissions, 'remove').mockRejectedValue(new Error('不支持'))
    const wrapper = await render()
    await section(wrapper).get(`button[aria-label="删除 ${HOST}"]`).trigger('click')
    await settle()
    expect(toastTexts(wrapper)).toEqual(['保存失败'])
    expect(sites(wrapper)).toEqual([HOST])
  })

  it('行内改写：申请新站点的权限，授予后移除原站点的', async () => {
    fakePermissions.granted.push(...enterpriseOrigins(HOST))
    const wrapper = await render()
    const input = section(wrapper).get<HTMLInputElement>('tbody input:not([type="checkbox"])')
    await input.setValue('octo-corp.ghe.com')
    await settle()
    expect(fakePermissions.granted).toEqual(enterpriseOrigins('octo-corp.ghe.com'))
    expect(sites(wrapper)).toEqual(['octo-corp.ghe.com'])
  })

  it('在别处授权、撤销（弹出页、浏览器的扩展管理）：列表随之刷新', async () => {
    const wrapper = await render()
    await fakePermissions.grant(enterpriseOrigins(HOST))
    await settle()
    expect(sites(wrapper)).toEqual([HOST])
    await fakePermissions.revoke(enterpriseOrigins(HOST))
    await settle()
    expect(sites(wrapper)).toEqual([])
  })

  it('读取失败：显示加载失败；关闭设置页后不再监听权限变化', async () => {
    vi.spyOn(fakeBrowser.permissions, 'getAll').mockRejectedValue(new Error('不支持'))
    const wrapper = await render()
    expect(section(wrapper).get('[data-test="list-empty"]').text()).toBe('加载失败')
    expect(fakePermissions.onAdded.hasListeners()).toBe(true)
    wrapper.unmount()
    expect(fakePermissions.onAdded.hasListeners()).toBe(false)
    expect(fakePermissions.onRemoved.hasListeners()).toBe(false)
  })
})
