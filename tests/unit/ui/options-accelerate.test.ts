import { enableAutoUnmount, mount, type DOMWrapper, type VueWrapper } from '@vue/test-utils'
import { fakeBrowser } from 'wxt/testing/fake-browser'
import { clearToasts } from '../../../src/components/toast'
import '../../../src/entrypoints/options/options.css'
import { MAX_CUSTOM_SOURCES } from '../../../src/shared/accelerate'
import { getSettings, settingsItem } from '../../../src/shared/settings'
import { mockVersion, seedChineseUi, settle, ZH_SETTINGS } from './helpers'
import { importSfc, required } from './sfc'

const App = await importSfc(() => import('../../../src/entrypoints/options/App.vue'))

enableAutoUnmount(afterEach)

const BUILTIN_NAMES = ['ghfast.top', 'wget.la', 'hk.gh-proxy.org', 'cdn.gh-proxy.org']

/** 打开设置页并切到加速设置标签页 */
async function render(): Promise<VueWrapper> {
  const wrapper = mount(required(App), { attachTo: document.body })
  await settle()
  await tab(wrapper).trigger('click')
  await settle()
  return wrapper
}

function tab(wrapper: VueWrapper): DOMWrapper<Element> {
  const found = wrapper.findAll('[role="tab"]').find((item) => item.text() === '加速设置')
  if (!found) throw new Error('未找到标签：加速设置')
  return found
}

/** 加速设置标签页的面板 */
function section(wrapper: VueWrapper): DOMWrapper<Element> {
  return wrapper.get(`#${CSS.escape(tab(wrapper).attributes('aria-controls') ?? '')}`) as DOMWrapper<Element>
}

/** 页面顶部的提示文字 */
function toastTexts(wrapper: VueWrapper): string[] {
  return wrapper
    .get('[aria-live="polite"]')
    .findAll('.ui-toast')
    .map((toast) => toast.text())
}

function button(scope: DOMWrapper<Element>, text: string): DOMWrapper<HTMLButtonElement> {
  const found = scope.findAll('button').find((item) => item.text() === text)
  if (!found) throw new Error(`未找到按钮：${text}`)
  return found as DOMWrapper<HTMLButtonElement>
}

function switchOf(scope: DOMWrapper<Element>, label: string): DOMWrapper<HTMLButtonElement> {
  const labelEl = scope.findAll('label').find((item) => item.text() === label)
  if (!labelEl) throw new Error(`未找到开关：${label}`)
  return scope.get(`#${CSS.escape(labelEl.attributes('for') ?? '')}`) as DOMWrapper<HTMLButtonElement>
}

interface RowView {
  readonly name: string
  readonly template: string
  readonly latency: string
  readonly ping: string
  readonly preferred: boolean
}

/** 加速源列表各行 */
function rows(wrapper: VueWrapper): RowView[] {
  return section(wrapper)
    .findAll('tbody tr')
    .map((row) => {
      const cells = row.findAll('td')
      return {
        name: row.get('.source-name').text(),
        template: row.get('.source-template').text(),
        latency: cells[1]?.text() ?? '',
        ping: cells[2]?.text() ?? '',
        preferred: (row.get('input[type="radio"]').element as HTMLInputElement).checked,
      }
    })
}

function names(wrapper: VueWrapper): string[] {
  return rows(wrapper).map((row) => row.name)
}

function row(wrapper: VueWrapper, name: string): DOMWrapper<Element> {
  const found = section(wrapper)
    .findAll('tbody tr')
    .find((item) => item.get('.source-name').text() === name)
  if (!found) throw new Error(`未找到加速源：${name}`)
  return found
}

async function addSource(wrapper: VueWrapper, name: string, template: string): Promise<void> {
  const inputs = section(wrapper).findAll('form input')
  await inputs[0]!.setValue(name)
  await inputs[1]!.setValue(template)
  await section(wrapper).get('form').trigger('submit')
  await settle()
}

describe.skipIf(!App)('设置页：加速', () => {
  beforeEach(async () => {
    fakeBrowser.reset()
    await seedChineseUi()
    mockVersion('1.2.3')
  })

  afterEach(() => {
    delete document.documentElement.dataset.theme
    clearToasts()
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it('标签页内依次为开关、测速与恢复内置、加速源列表、添加表单；标签即标题，面板内不再有标题', async () => {
    const wrapper = await render()
    const scope = section(wrapper)
    expect(tab(wrapper).attributes('aria-selected')).toBe('true')
    expect(scope.find('h2').exists()).toBe(false)
    const content = scope.get('.section').element
    const order = ['.switches', '.sources-tools', '.list-frame', '.source-form'].map((selector) =>
      [...content.children].indexOf(content.querySelector(`:scope > ${selector}`)!),
    )
    expect(order).toEqual([...order].sort((a, b) => a - b))
    expect(order.every((index) => index >= 0)).toBe(true)
    expect(
      scope
        .get('.sources-tools')
        .findAll('button')
        .map((item) => item.text()),
    ).toEqual(['测速', '恢复内置'])
  })

  it('列表框限高、框内滚动；表头固定在顶部，键盘切换焦点时滚动留出表头高度', async () => {
    const wrapper = await render()
    const frame = getComputedStyle(section(wrapper).get('.list-frame').element)
    const head = getComputedStyle(section(wrapper).get('th').element)
    expect(frame.maxHeight).toMatch(/^min\(480px, /)
    expect(frame.overflowY).toBe('auto')
    expect(head.position).toBe('sticky')
    expect(head.top).toBe('0px')
    expect(head.height).toBe('36px')
    expect(frame.scrollPaddingTop).toBe(head.height)
  })

  it('默认：三个开关关闭；内置加速源，首选第一个；未测速；不用恢复', async () => {
    const wrapper = await render()
    const scope = section(wrapper)
    for (const label of ['加速下载', '加速图片', '故障转移']) {
      expect(switchOf(scope, label).attributes('aria-checked'), label).toBe('false')
    }
    expect(scope.findAll('th').map((item) => item.text())).toEqual(['加速源', '延迟', 'Ping', '操作'])
    expect(rows(wrapper)[0]).toEqual({
      name: 'ghfast.top',
      template: 'https://ghfast.top/{url}',
      latency: '—',
      ping: '—',
      preferred: true,
    })
    expect(names(wrapper)).toEqual(BUILTIN_NAMES)
    expect(rows(wrapper).filter((item) => item.preferred)).toHaveLength(1)
    expect(button(scope, '恢复内置').element.disabled).toBe(true)
    expect(button(scope, '测速').element.disabled).toBe(false)
  })

  it.each([
    ['加速下载', 'accelerate'],
    ['加速图片', 'accelerateImages'],
    ['故障转移', 'failover'],
  ] as const)('%s 开关即时保存', async (label, key) => {
    const wrapper = await render()
    await switchOf(section(wrapper), label).trigger('click')
    await settle()
    expect((await getSettings())[key]).toBe(true)
    expect(switchOf(section(wrapper), label).attributes('aria-checked')).toBe('true')
  })

  it('选择首选：即时保存', async () => {
    const wrapper = await render()
    await row(wrapper, 'wget.la').get('input[type="radio"]').setValue(true)
    await settle()
    expect((await getSettings()).accelerateSource).toBe('wget-la')
    expect(rows(wrapper).map((item) => item.preferred)).toEqual([false, true, false, false])
  })

  it('添加：排在最后，清空表单，焦点回到名称；名称为空时用域名', async () => {
    const wrapper = await render()
    await addSource(wrapper, 'Mirror', ' https://mirror.example/{url} ')
    await addSource(wrapper, '', 'https://other.example/{path}')
    expect(rows(wrapper).slice(-2)).toEqual([
      { name: 'Mirror', template: 'https://mirror.example/{url}', latency: '—', ping: '—', preferred: false },
      { name: 'other.example', template: 'https://other.example/{path}', latency: '—', ping: '—', preferred: false },
    ])
    expect(
      section(wrapper)
        .findAll<HTMLInputElement>('form input')
        .map((input) => input.element.value),
    ).toEqual(['', ''])
    expect(document.activeElement).toBe(section(wrapper).find('form input').element)
    expect((await getSettings()).customSources).toHaveLength(2)
    expect(toastTexts(wrapper)).toEqual([])
  })

  it('地址为空时不能添加', async () => {
    const wrapper = await render()
    await section(wrapper).findAll('form input')[0]!.setValue('Mirror')
    expect(button(section(wrapper), '添加').element.disabled).toBe(true)
  })

  it.each([
    ['格式错误', 'http://mirror.example/{url}', '格式错误'],
    ['已存在（写法不同、效果相同）', 'https://ghfast.top', '已存在'],
  ])('添加失败（%s）：提示，表单保留', async (_name, template, message) => {
    const wrapper = await render()
    await addSource(wrapper, 'Mirror', template)
    expect(toastTexts(wrapper)).toEqual([message])
    expect(names(wrapper)).toEqual(BUILTIN_NAMES)
    expect((section(wrapper).findAll('form input')[1]!.element as HTMLInputElement).value).toBe(template)
  })

  it('自定义源已达上限：提示', async () => {
    const customSources = Array.from({ length: MAX_CUSTOM_SOURCES }, (_, index) => ({
      id: `custom-${index}`,
      name: `M${index}`,
      template: `https://m${index}.example/{url}`,
    }))
    await settingsItem.setValue({ ...ZH_SETTINGS, customSources })
    const wrapper = await render()
    await addSource(wrapper, 'Mirror', 'https://mirror.example/{url}')
    expect(toastTexts(wrapper)).toEqual(['已达上限'])
  })

  it('删除内置源后可恢复；删除自定义源', async () => {
    await settingsItem.setValue({
      ...ZH_SETTINGS,
      customSources: [{ id: 'custom-1', name: 'Mirror', template: 'https://mirror.example/{url}' }],
    })
    const wrapper = await render()
    await row(wrapper, 'wget.la').get('button').trigger('click')
    await settle()
    expect(names(wrapper)).toEqual(['ghfast.top', 'hk.gh-proxy.org', 'cdn.gh-proxy.org', 'Mirror'])
    expect((await getSettings()).removedSources).toEqual(['wget-la'])
    await row(wrapper, 'Mirror').get('button').trigger('click')
    await settle()
    expect((await getSettings()).customSources).toEqual([])
    await button(section(wrapper), '恢复内置').trigger('click')
    await settle()
    expect(names(wrapper)).toEqual(BUILTIN_NAMES)
    expect(button(section(wrapper), '恢复内置').element.disabled).toBe(true)
  })

  it('删除按钮的无障碍名称带加速源名称', async () => {
    const wrapper = await render()
    expect(row(wrapper, 'wget.la').get('button').attributes('aria-label')).toBe('删除 wget.la')
  })

  it('删除首选：首选换成列表第一个', async () => {
    await settingsItem.setValue({ ...ZH_SETTINGS, accelerateSource: 'wget-la' })
    const wrapper = await render()
    await row(wrapper, 'wget.la').get('button').trigger('click')
    await settle()
    expect(rows(wrapper)[0]).toMatchObject({ name: 'ghfast.top', preferred: true })
  })

  it('键盘删除：焦点移到原位置这一行的删除按钮；删空时移到名称输入框，显示空列表，不能测速', async () => {
    const wrapper = await render()
    for (const expected of ['hk.gh-proxy.org', 'cdn.gh-proxy.org', 'ghfast.top']) {
      const target = row(wrapper, names(wrapper)[1] ?? names(wrapper)[0]!).get<HTMLButtonElement>('button')
      target.element.focus()
      await target.trigger('click')
      await settle()
      expect(document.activeElement?.getAttribute('aria-label')).toBe(`删除 ${expected}`)
    }
    const last = row(wrapper, 'ghfast.top').get<HTMLButtonElement>('button')
    last.element.focus()
    await last.trigger('click')
    await settle()
    expect(section(wrapper).get('[data-test="sources-empty"]').text()).toBe('暂无加速源')
    expect(document.activeElement).toBe(section(wrapper).find('form input').element)
    expect(button(section(wrapper), '测速').element.disabled).toBe(true)
  })

  it('保存失败：提示', async () => {
    const wrapper = await render()
    vi.spyOn(fakeBrowser.storage.sync, 'set').mockRejectedValue(new Error('配额'))
    await row(wrapper, 'wget.la').get('button').trigger('click')
    await settle()
    expect(toastTexts(wrapper)).toEqual(['保存失败'])
    expect(names(wrapper)).toEqual(BUILTIN_NAMES)
  })

  it('测速：各加速源并行，测速中按钮不可用；结果为延迟与 Ping，连不上的为失败', async () => {
    const pending: (() => void)[] = []
    const fetch = vi.fn((url: string) => {
      if (url === 'https://wget.la/') return Promise.reject(new TypeError('Failed to fetch'))
      if (url === 'https://hk.gh-proxy.org/') return new Promise((resolve) => pending.push(() => resolve({})))
      return Promise.resolve({})
    })
    vi.stubGlobal('fetch', fetch)
    const wrapper = await render()
    await button(section(wrapper), '测速').trigger('click')
    await settle()
    expect(button(section(wrapper), '测速').element.disabled).toBe(true)
    expect(rows(wrapper)[2]).toMatchObject({ latency: '测速中', ping: '测速中' })
    expect(rows(wrapper)[1]).toMatchObject({ latency: '失败', ping: '—' })
    expect(rows(wrapper)[0]?.latency).toMatch(/^\d+ ms$/)
    expect(rows(wrapper)[0]?.ping).toMatch(/^\d+ ms$/)
    expect(row(wrapper, 'ghfast.top').findAll('td')[1]?.classes()).toContain('is-good')
    expect(row(wrapper, 'wget.la').findAll('td')[1]?.classes()).toContain('is-slow')
    // 延迟 1 次 + Ping 3 次
    expect(fetch.mock.calls.filter(([url]) => url === 'https://ghfast.top/')).toHaveLength(4)
    while (pending.length > 0) {
      pending.shift()?.()
      await settle()
    }
    expect(rows(wrapper)[2]?.latency).toMatch(/^\d+ ms$/)
    expect(button(section(wrapper), '测速').element.disabled).toBe(false)
  })
})
