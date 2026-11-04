import { enableAutoUnmount, mount, type DOMWrapper, type VueWrapper } from '@vue/test-utils'
import { nextTick } from 'vue'
import { fakeBrowser } from 'wxt/testing/fake-browser'
import { clearToasts } from '../../../src/components/toast'
import '../../../src/entrypoints/options/options.css'
import { MAX_CUSTOM_SOURCES } from '../../../src/shared/accelerate'
import { MAX_CUSTOM_CATEGORIES } from '../../../src/shared/accelerate-categories'
import { getSettings, settingsItem } from '../../../src/shared/settings'
import { deleteSelected, mockVersion, seedChineseUi, settle, ZH_SETTINGS } from './helpers'
import { importSfc, required } from './sfc'

const App = await importSfc(() => import('../../../src/entrypoints/options/App.vue'))

enableAutoUnmount(afterEach)

const CATEGORY_NAMES = ['gh-proxy', 'ghfast', 'wget.la', '其他', '自定义']
const GH_PROXY = ['hk.gh-proxy.org', 'cdn.gh-proxy.org', 'edgeone.gh-proxy.org', 'gh-proxy.com']
const ALL_BUILTIN_CATEGORIES = ['gh-proxy', 'ghfast', 'wget-la', 'other', 'custom']

/** 打开设置页并切到加速设置标签页 */
async function render(): Promise<VueWrapper> {
  const wrapper = mount(required(App), { attachTo: document.body })
  await settle()
  await tab(wrapper).trigger('click')
  await settle()
  return wrapper
}

function tab(wrapper: VueWrapper): DOMWrapper<Element> {
  const found = wrapper.findAll('[role="tab"]').find(item => item.text() === '加速设置')
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
    .map(toast => toast.text())
}

function button(scope: DOMWrapper<Element>, text: string): DOMWrapper<HTMLButtonElement> {
  const found = scope.findAll('button').find(item => item.text() === text)
  if (!found) throw new Error(`未找到按钮：${text}`)
  return found as DOMWrapper<HTMLButtonElement>
}

function switchOf(scope: DOMWrapper<Element>, label: string): DOMWrapper<HTMLButtonElement> {
  const labelEl = scope.findAll('label').find(item => item.text() === label)
  if (!labelEl) throw new Error(`未找到开关：${label}`)
  return scope.get(`#${CSS.escape(labelEl.attributes('for') ?? '')}`) as DOMWrapper<HTMLButtonElement>
}

/** 分类的标签 */
function categoryTabs(wrapper: VueWrapper): DOMWrapper<Element>[] {
  return section(wrapper).get('.categories [role="tablist"]').findAll('[role="tab"]')
}

function tabName(item: DOMWrapper<Element>): string {
  return item.get('.ui-tab-text').text()
}

function categoryNames(wrapper: VueWrapper): string[] {
  return categoryTabs(wrapper).map(tabName)
}

/** 各分类标签上的加速源个数 */
function counts(wrapper: VueWrapper): string[] {
  return categoryTabs(wrapper).map(item => item.get('[data-test="tab-count"]').text())
}

function categoryTab(wrapper: VueWrapper, name: string): DOMWrapper<Element> {
  const found = categoryTabs(wrapper).find(item => tabName(item) === name)
  if (!found) throw new Error(`未找到分类：${name}`)
  return found
}

/** 选中的分类 */
function activeCategory(wrapper: VueWrapper): string | undefined {
  const found = categoryTabs(wrapper).find(item => item.attributes('aria-selected') === 'true')
  return found ? tabName(found) : undefined
}

async function selectCategory(wrapper: VueWrapper, name: string): Promise<void> {
  await categoryTab(wrapper, name).trigger('click')
  await settle()
}

/** 分类的面板内容（未选中的分类面板只隐藏） */
function category(wrapper: VueWrapper, name: string): DOMWrapper<Element> {
  const panel = categoryTab(wrapper, name).attributes('aria-controls') ?? ''
  return section(wrapper)
    .get(`#${CSS.escape(panel)}`)
    .get('.category') as DOMWrapper<Element>
}

function nameInput(wrapper: VueWrapper, name: string): DOMWrapper<HTMLInputElement> {
  return category(wrapper, name).get<HTMLInputElement>('[data-test="category-name"]') as DOMWrapper<HTMLInputElement>
}

/** 分类中的加速源名称 */
function sourceNames(scope: DOMWrapper<Element>): string[] {
  return scope.findAll('.source-name').map(item => item.text())
}

function row(scope: DOMWrapper<Element>, name: string): DOMWrapper<Element> {
  const found = scope.findAll('tbody tr').find(item => item.get('.source-name').text() === name)
  if (!found) throw new Error(`未找到加速源：${name}`)
  return found
}

/** 下拉框的按钮 */
function select(wrapper: VueWrapper, name: string): DOMWrapper<HTMLButtonElement> {
  return section(wrapper).get(`[data-test="${name}"]`) as DOMWrapper<HTMLButtonElement>
}

function optionsOf(wrapper: VueWrapper, name: string): DOMWrapper<Element>[] {
  const id = select(wrapper, name).attributes('aria-controls') ?? ''
  return wrapper.get(`#${CSS.escape(id)}`).findAll('[role="option"]')
}

function selectedLabel(wrapper: VueWrapper, name: string): string | undefined {
  return optionsOf(wrapper, name)
    .find(option => option.attributes('aria-selected') === 'true')
    ?.text()
}

async function choose(wrapper: VueWrapper, name: string, label: string): Promise<void> {
  await select(wrapper, name).trigger('click')
  const option = optionsOf(wrapper, name).find(item => item.text() === label)
  if (!option) throw new Error(`未找到选项：${label}`)
  await option.trigger('click')
  await settle()
}

/** 添加加速源表单（只在选中的分类里）的名称、地址输入框 */
function sourceInputs(wrapper: VueWrapper): DOMWrapper<HTMLInputElement>[] {
  return section(wrapper).get('.source-form').findAll<HTMLInputElement>('input')
}

async function addSource(wrapper: VueWrapper, name: string, template: string): Promise<void> {
  const [nameField, templateField] = sourceInputs(wrapper)
  await nameField!.setValue(name)
  await templateField!.setValue(template)
  await section(wrapper).get('.source-form').trigger('submit')
  await settle()
}

async function newCategory(wrapper: VueWrapper): Promise<void> {
  await section(wrapper).get('[data-test="new-category"]').trigger('click')
  await settle()
}

/** 改分类名称：输入后失焦（change） */
async function rename(wrapper: VueWrapper, name: string, next: string): Promise<DOMWrapper<HTMLInputElement>> {
  const input = nameInput(wrapper, name)
  input.element.value = next
  await input.trigger('change')
  await settle()
  return input
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

  it('标签页内依次为开关与替换原链接、加速源；加速源标题右侧为导入导出，其下为分类标签页；分类标签栏右侧为新建、测速、恢复内置', async () => {
    const wrapper = await render()
    const scope = section(wrapper)
    expect(tab(wrapper).attributes('aria-selected')).toBe('true')
    const content = scope.get('.section').element
    expect([...content.children].map(child => child.className)).toEqual(['switches', 'section sources-section', 'ui-confirm'])
    const sources = scope.get('.sources-section')
    expect(sources.findAll('h2').map(item => item.text())).toEqual(['加速源'])
    expect(sources.attributes('aria-labelledby')).toBe(sources.get('h2').attributes('id'))
    expect(scope.findAll('.transfer-tools')).toHaveLength(1)
    expect(
      sources
        .get('.section-head .transfer-tools')
        .findAll('button')
        .map(item => item.text())
    ).toEqual(['导入', '导出'])
    expect(sources.get('.section-head').element.nextElementSibling?.classList.contains('categories')).toBe(true)
    expect(scope.get('.categories [role="tablist"]').attributes('aria-label')).toBe('分类')
    expect(
      scope
        .get('.categories .ui-tabs-actions')
        .findAll('button')
        .map(item => item.attributes('aria-label') ?? item.text())
    ).toEqual(['新建分类', '测速', '恢复内置'])
    expect(scope.get('[data-test="new-category"]').attributes('title')).toBe('新建分类')
  })

  it('分类面板：名称、自动隐藏、删除分类在上，其下为加速源列表（末尾有返回顶部）；添加表单只在选中的分类里', async () => {
    const wrapper = await render()
    const panel = category(wrapper, 'gh-proxy')
    const head = panel.get('.category-head')
    expect(head.get('[data-test="category-name"]').attributes('aria-label')).toBe('分类名称')
    expect(head.findAll('label').map(item => item.text())).toEqual(['自动隐藏'])
    expect(head.get('[data-test="delete-category"]').text()).toBe('删除分类')
    expect(section(wrapper).findAll('.source-form')).toHaveLength(1)
    expect(panel.find('.source-form').exists()).toBe(true)
    const children = [...panel.element.children].map(child => child.classList[0])
    expect(children).toEqual(['category-head', 'list-frame', 'source-form'])
    expect(panel.get('.list-frame > .ui-back-to-top [data-test="back-to-top"]').attributes('aria-label')).toBe('返回顶部')
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

  it('默认：三个开关关闭，不替换；内置分类与加速源，选中第一个分类；自动隐藏开启（故障转移关闭时不可改）；未测速；不用恢复', async () => {
    const wrapper = await render()
    const scope = section(wrapper)
    for (const label of ['加速下载', '加速图片', '故障转移']) {
      expect(switchOf(scope, label).attributes('aria-checked'), label).toBe('false')
    }
    expect(scope.get('label[for="replace-category"]').text()).toBe('替换原链接')
    expect(optionsOf(wrapper, 'replace-category').map(item => item.text())).toEqual(['不替换', ...CATEGORY_NAMES])
    expect(selectedLabel(wrapper, 'replace-category')).toBe('不替换')
    expect(categoryNames(wrapper)).toEqual(CATEGORY_NAMES)
    expect(counts(wrapper)).toEqual(['4', '1', '1', '3', '0'])
    expect(activeCategory(wrapper)).toBe('gh-proxy')
    for (const name of CATEGORY_NAMES) {
      expect(nameInput(wrapper, name).element.value, name).toBe(name)
      const hide = switchOf(category(wrapper, name), '自动隐藏')
      expect(hide.attributes('aria-checked'), name).toBe('true')
      expect(hide.element.disabled, name).toBe(true)
    }
    expect(sourceNames(category(wrapper, 'gh-proxy'))).toEqual(GH_PROXY)
    expect(sourceNames(category(wrapper, '其他'))).toEqual(['gh.monlor.com', 'hub.ddayh.com', 'ghproxy.053000.xyz'])
    expect(category(wrapper, '自定义').get('[data-test="sources-empty"]').text()).toBe('暂无加速源')
    expect(
      category(wrapper, 'gh-proxy')
        .findAll('th')
        .map(item => item.text())
    ).toEqual(['', '加速源', '延迟', 'Ping', '操作'])
    expect(
      row(category(wrapper, 'ghfast'), 'ghfast.top')
        .findAll('td')
        .slice(2, 4)
        .map(item => item.text())
    ).toEqual(['—', '—'])
    expect(button(scope, '恢复内置').element.disabled).toBe(true)
    expect(button(scope, '测速').element.disabled).toBe(false)
    expect(scope.find('[data-test="categories-empty"]').exists()).toBe(false)
  })

  it.each([
    ['加速下载', 'accelerate'],
    ['加速图片', 'accelerateImages'],
    ['故障转移', 'failover']
  ] as const)('%s 开关即时保存', async (label, key) => {
    const wrapper = await render()
    await switchOf(section(wrapper), label).trigger('click')
    await settle()
    expect((await getSettings())[key]).toBe(true)
    expect(switchOf(section(wrapper), label).attributes('aria-checked')).toBe('true')
  })

  it('替换原链接：选分类即时保存，选不替换时清空', async () => {
    const wrapper = await render()
    await choose(wrapper, 'replace-category', 'ghfast')
    expect((await getSettings()).replaceCategory).toBe('ghfast')
    expect(selectedLabel(wrapper, 'replace-category')).toBe('ghfast')
    await choose(wrapper, 'replace-category', '不替换')
    expect((await getSettings()).replaceCategory).toBe('')
  })

  it('开关列表的分隔线只在列表项之间，不加到其中下拉框的选项上', async () => {
    // 测试环境不加载主题令牌：分隔线颜色未定义时整条声明无效
    document.documentElement.style.setProperty('--gcn-border-muted', 'rgb(1, 2, 3)')
    onTestFinished(() => {
      document.documentElement.style.removeProperty('--gcn-border-muted')
    })
    const wrapper = await render()
    const items = section(wrapper).findAll('.switches > li')
    expect(items).toHaveLength(4)
    expect(getComputedStyle(items[0]!.element).borderTopStyle).not.toBe('solid')
    expect(items.slice(1).map(item => getComputedStyle(item.element).borderTopStyle)).toEqual(['solid', 'solid', 'solid'])
    const options = optionsOf(wrapper, 'replace-category')
    expect(options.length).toBeGreaterThan(1)
    expect(options.map(option => getComputedStyle(option.element).borderTopStyle).filter(style => style === 'solid')).toEqual([])
  })

  it('自动隐藏：故障转移开启时可改，关闭时记为改动', async () => {
    await settingsItem.setValue({ ...ZH_SETTINGS, failover: true })
    const wrapper = await render()
    await selectCategory(wrapper, 'ghfast')
    const hide = switchOf(category(wrapper, 'ghfast'), '自动隐藏')
    expect(hide.element.disabled).toBe(false)
    await hide.trigger('click')
    await settle()
    expect((await getSettings()).categories).toEqual([{ id: 'ghfast', autoHide: false }])
    expect(switchOf(category(wrapper, 'ghfast'), '自动隐藏').attributes('aria-checked')).toBe('false')
  })

  it('切换分类：添加表单随之移到该分类，未提交的输入清空', async () => {
    const wrapper = await render()
    const [nameField, templateField] = sourceInputs(wrapper)
    await nameField!.setValue('Mirror')
    await templateField!.setValue('https://mirror.example/{url}')
    await selectCategory(wrapper, 'ghfast')
    expect(activeCategory(wrapper)).toBe('ghfast')
    expect(category(wrapper, 'ghfast').find('.source-form').exists()).toBe(true)
    expect(category(wrapper, 'gh-proxy').find('.source-form').exists()).toBe(false)
    expect(sourceInputs(wrapper).map(input => input.element.value)).toEqual(['', ''])
  })

  it('新建分类：默认名称为「分类 1」，排在最后并选中，名称全选待改；添加的加速源归入其中', async () => {
    const wrapper = await render()
    await newCategory(wrapper)
    expect(categoryNames(wrapper)).toEqual([...CATEGORY_NAMES, '分类 1'])
    expect(activeCategory(wrapper)).toBe('分类 1')
    expect(counts(wrapper).at(-1)).toBe('0')
    const input = nameInput(wrapper, '分类 1')
    expect(document.activeElement).toBe(input.element)
    expect([input.element.selectionStart, input.element.selectionEnd]).toEqual([0, '分类 1'.length])
    await addSource(wrapper, 'Mirror', 'https://mirror.example/{url}')
    expect(sourceNames(category(wrapper, '分类 1'))).toEqual(['Mirror'])
    expect(counts(wrapper).at(-1)).toBe('1')
    const settings = await getSettings()
    expect(settings.categories).toEqual([{ id: expect.stringMatching(/^category-/), name: '分类 1' }])
    expect(settings.customSources).toEqual([expect.objectContaining({ name: 'Mirror', category: settings.categories[0]!.id })])
    expect(optionsOf(wrapper, 'replace-category').map(item => item.text())).toContain('分类 1')
  })

  it('新建分类：默认名称跳过已有的名称（不区分大小写）', async () => {
    await settingsItem.setValue({
      ...ZH_SETTINGS,
      categories: [
        { id: 'category-1', name: '分类 1' },
        { id: 'ghfast', name: '分类 3' }
      ]
    })
    const wrapper = await render()
    await newCategory(wrapper)
    await newCategory(wrapper)
    expect(categoryNames(wrapper).slice(-3)).toEqual(['分类 1', '分类 2', '分类 4'])
    expect(activeCategory(wrapper)).toBe('分类 4')
  })

  it('新建分类：自定义分类已达上限时提示，不新建', async () => {
    const categories = Array.from({ length: MAX_CUSTOM_CATEGORIES }, (_, index) => ({ id: `category-${index}`, name: `C${index}` }))
    await settingsItem.setValue({ ...ZH_SETTINGS, categories })
    const wrapper = await render()
    await newCategory(wrapper)
    expect(toastTexts(wrapper)).toEqual(['已达上限'])
    expect(categoryNames(wrapper)).toHaveLength(CATEGORY_NAMES.length + MAX_CUSTOM_CATEGORIES)
    expect(activeCategory(wrapper)).toBe('gh-proxy')
  })

  it('改名：失焦时保存，标签随之改名；重名时提示并恢复原名；内置分类清空时恢复默认名称', async () => {
    const wrapper = await render()
    await rename(wrapper, 'ghfast', '快')
    expect(categoryNames(wrapper)).toEqual(['gh-proxy', '快', 'wget.la', '其他', '自定义'])
    expect((await getSettings()).categories).toEqual([{ id: 'ghfast', name: '快' }])
    const input = await rename(wrapper, '快', 'WGET.LA')
    expect(toastTexts(wrapper)).toEqual(['已存在'])
    expect(input.element.value).toBe('快')
    clearToasts()
    await rename(wrapper, '快', '  ')
    expect(categoryNames(wrapper)).toEqual(CATEGORY_NAMES)
    expect((await getSettings()).categories).toEqual([])
  })

  it('改名：名称不变时不保存', async () => {
    const wrapper = await render()
    const set = vi.spyOn(fakeBrowser.storage.sync, 'set')
    const input = await rename(wrapper, 'ghfast', ' ghfast ')
    expect(set).not.toHaveBeenCalled()
    expect(input.element.value).toBe('ghfast')
  })

  it('改名：自定义分类不能清空', async () => {
    await settingsItem.setValue({ ...ZH_SETTINGS, categories: [{ id: 'category-1', name: 'Team' }] })
    const wrapper = await render()
    const input = await rename(wrapper, 'Team', '')
    expect(toastTexts(wrapper)).toEqual(['格式错误'])
    expect(input.element.value).toBe('Team')
  })

  it('改名：回车结束编辑', async () => {
    const wrapper = await render()
    const input = nameInput(wrapper, 'gh-proxy')
    input.element.focus()
    await input.trigger('keydown', { key: 'Enter' })
    expect(document.activeElement).not.toBe(input.element)
  })

  it('删除分类：选中前一个分类；连同其中的自定义源；替换原链接用的是它时改为不替换；内置分类可恢复', async () => {
    await settingsItem.setValue({
      ...ZH_SETTINGS,
      customSources: [{ id: 'custom-1', name: 'Mirror', template: 'https://mirror.example/{url}', category: 'wget-la' }],
      replaceCategory: 'wget-la'
    })
    const wrapper = await render()
    await selectCategory(wrapper, 'wget.la')
    expect(sourceNames(category(wrapper, 'wget.la'))).toEqual(['wget.la', 'Mirror'])
    await category(wrapper, 'wget.la').get('[data-test="delete-category"]').trigger('click')
    await settle()
    expect(categoryNames(wrapper)).toEqual(['gh-proxy', 'ghfast', '其他', '自定义'])
    expect(activeCategory(wrapper)).toBe('ghfast')
    expect(await getSettings()).toMatchObject({ removedCategories: ['wget-la'], customSources: [], replaceCategory: '' })
    await button(section(wrapper), '恢复内置').trigger('click')
    await settle()
    expect(categoryNames(wrapper)).toEqual(CATEGORY_NAMES)
    expect(sourceNames(category(wrapper, 'wget.la'))).toEqual(['wget.la'])
    expect(button(section(wrapper), '恢复内置').element.disabled).toBe(true)
  })

  it('删除第一个分类：选中新的第一个', async () => {
    const wrapper = await render()
    await category(wrapper, 'gh-proxy').get('[data-test="delete-category"]').trigger('click')
    await settle()
    expect(categoryNames(wrapper)).toEqual(['ghfast', 'wget.la', '其他', '自定义'])
    expect(activeCategory(wrapper)).toBe('ghfast')
  })

  it('没有分类：显示暂无分类，不能测速；新建后显示该分类', async () => {
    await settingsItem.setValue({ ...ZH_SETTINGS, removedCategories: ALL_BUILTIN_CATEGORIES })
    const wrapper = await render()
    const scope = section(wrapper)
    expect(categoryNames(wrapper)).toEqual([])
    expect(scope.get('[data-test="categories-empty"]').text()).toBe('暂无分类')
    expect(scope.find('.source-form').exists()).toBe(false)
    expect(button(scope, '测速').element.disabled).toBe(true)
    expect(button(scope, '恢复内置').element.disabled).toBe(false)
    await newCategory(wrapper)
    expect(categoryNames(wrapper)).toEqual(['分类 1'])
    expect(activeCategory(wrapper)).toBe('分类 1')
    expect(section(wrapper).find('[data-test="categories-empty"]').exists()).toBe(false)
  })

  it('添加加速源：归入选中的分类，清空表单，焦点回到名称；名称为空时用域名', async () => {
    const wrapper = await render()
    await selectCategory(wrapper, '自定义')
    await addSource(wrapper, 'Mirror', ' https://mirror.example/{url} ')
    await addSource(wrapper, '', 'https://other.example/{path}')
    const custom = category(wrapper, '自定义')
    expect(sourceNames(custom)).toEqual(['Mirror', 'other.example'])
    expect(custom.findAll('.source-template').map(item => item.text())).toEqual([
      'https://mirror.example/{url}',
      'https://other.example/{path}'
    ])
    expect(counts(wrapper).at(-1)).toBe('2')
    expect(sourceInputs(wrapper).map(input => input.element.value)).toEqual(['', ''])
    expect(document.activeElement).toBe(sourceInputs(wrapper)[0]!.element)
    expect((await getSettings()).customSources.map(source => source.category)).toEqual(['custom', 'custom'])
    expect(toastTexts(wrapper)).toEqual([])
  })

  it('添加加速源：未切换时归入第一个分类', async () => {
    const wrapper = await render()
    await addSource(wrapper, 'Mirror', 'https://mirror.example/{url}')
    expect(sourceNames(category(wrapper, 'gh-proxy'))).toEqual([...GH_PROXY, 'Mirror'])
  })

  it('地址为空时不能添加', async () => {
    const wrapper = await render()
    await sourceInputs(wrapper)[0]!.setValue('Mirror')
    expect(button(section(wrapper), '添加').element.disabled).toBe(true)
  })

  it.each([
    ['格式错误', 'http://mirror.example/{url}', '格式错误'],
    ['已存在（写法不同、效果相同，在其他分类中）', 'https://ghfast.top', '已存在']
  ])('添加失败（%s）：提示，表单保留', async (_name, template, message) => {
    const wrapper = await render()
    await selectCategory(wrapper, '自定义')
    await addSource(wrapper, 'Mirror', template)
    expect(toastTexts(wrapper)).toEqual([message])
    expect(category(wrapper, '自定义').find('tbody').exists()).toBe(false)
    expect(sourceInputs(wrapper)[1]!.element.value).toBe(template)
  })

  it('自定义源已达上限：提示', async () => {
    const customSources = Array.from({ length: MAX_CUSTOM_SOURCES }, (_, index) => ({
      id: `custom-${index}`,
      name: `M${index}`,
      template: `https://m${index}.example/{url}`,
      category: 'custom'
    }))
    await settingsItem.setValue({ ...ZH_SETTINGS, customSources })
    const wrapper = await render()
    await addSource(wrapper, 'Mirror', 'https://mirror.example/{url}')
    expect(toastTexts(wrapper)).toEqual(['已达上限'])
  })

  it('多选：只选选中分类里的加速源；换分类清空所选；删除所选确认后一次写入（内置源记入已删除，自定义源去掉）', async () => {
    await settingsItem.setValue({
      ...ZH_SETTINGS,
      customSources: [{ id: 'custom-1', name: 'Mirror', template: 'https://mirror.example/{url}', category: 'gh-proxy' }]
    })
    const wrapper = await render()
    const box = (name: string) => row(category(wrapper, 'gh-proxy'), name).get<HTMLInputElement>('input[type="checkbox"]')
    const selectAll = () => category(wrapper, 'gh-proxy').get<HTMLInputElement>('[data-test="select-all"] input')
    expect(box('Mirror').attributes('aria-label')).toBe('选择 Mirror')
    expect(selectAll().attributes('aria-label')).toBe('全选')
    await box('Mirror').setValue(true)
    await box('cdn.gh-proxy.org').setValue(true)
    expect(category(wrapper, 'gh-proxy').get('[data-test="delete-selected"]').text()).toBe('删除 2 条')
    expect(selectAll().element.indeterminate).toBe(true)

    await selectCategory(wrapper, 'ghfast')
    expect(section(wrapper).find('[data-test="delete-selected"]').exists()).toBe(false)
    expect(category(wrapper, 'ghfast').get<HTMLInputElement>('[data-test="select-all"] input').element.indeterminate).toBe(false)
    await selectCategory(wrapper, 'gh-proxy')
    expect(box('Mirror').element.checked).toBe(false)

    await box('Mirror').setValue(true)
    await box('cdn.gh-proxy.org').setValue(true)
    const set = vi.spyOn(fakeBrowser.storage.sync, 'set')
    await deleteSelected(section(wrapper))
    expect(set).toHaveBeenCalledOnce()
    const settings = await getSettings()
    expect(settings.customSources).toEqual([])
    expect(settings.removedSources).toEqual(['gh-proxy-cdn'])
    expect(sourceNames(category(wrapper, 'gh-proxy'))).toEqual(['hk.gh-proxy.org', 'edgeone.gh-proxy.org', 'gh-proxy.com'])
    expect(document.activeElement).toBe(selectAll().element)

    await selectAll().setValue(true)
    expect(category(wrapper, 'gh-proxy').get('[data-test="delete-selected"]').text()).toBe('删除 3 条')
    await deleteSelected(section(wrapper))
    expect(category(wrapper, 'gh-proxy').find('[data-test="sources-empty"]').exists()).toBe(true)
    expect(document.activeElement?.getAttribute('aria-label')).toBe('名称')
  })

  it('分类排序：Alt + → ← 前移、后移，即时保存；替换原链接的选项随之换顺序；移回默认顺序时清空', async () => {
    const wrapper = await render()
    const first = categoryTab(wrapper, 'gh-proxy').element as HTMLElement
    expect(first.getAttribute('aria-keyshortcuts')).toBe('Alt+ArrowLeft Alt+ArrowRight')
    first.focus()
    first.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', altKey: true, bubbles: true, cancelable: true }))
    // 先按新顺序显示，不等写入完成
    await nextTick()
    expect(categoryNames(wrapper)).toEqual(['ghfast', 'gh-proxy', 'wget.la', '其他', '自定义'])
    await settle()
    expect((await getSettings()).categoryOrder).toEqual(['ghfast', 'gh-proxy', 'wget-la', 'other', 'custom'])
    expect(categoryNames(wrapper)).toEqual(['ghfast', 'gh-proxy', 'wget.la', '其他', '自定义'])
    expect(document.activeElement).toBe(categoryTab(wrapper, 'gh-proxy').element)
    expect(activeCategory(wrapper)).toBe('gh-proxy')
    expect(optionsOf(wrapper, 'replace-category').map(item => item.text())).toEqual([
      '不替换',
      'ghfast',
      'gh-proxy',
      'wget.la',
      '其他',
      '自定义'
    ])

    categoryTab(wrapper, 'gh-proxy').element.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowLeft', altKey: true, bubbles: true, cancelable: true })
    )
    await settle()
    expect(categoryNames(wrapper)).toEqual(CATEGORY_NAMES)
    expect((await getSettings()).categoryOrder).toEqual([])
  })

  it('分类排序：拖动分类标签到两个分类之间，松开后即时保存', async () => {
    const wrapper = await render()
    const boxes = new Map(categoryTabs(wrapper).map((item, index) => [item.element, { left: index * 100, width: 90 }]))
    vi.spyOn(HTMLElement.prototype, 'offsetLeft', 'get').mockImplementation(function (this: HTMLElement) {
      return boxes.get(this)?.left ?? 0
    })
    vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockImplementation(function (this: HTMLElement) {
      return boxes.get(this)?.width ?? 0
    })
    vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockImplementation(function (this: HTMLElement) {
      return boxes.has(this) ? 28 : 0
    })
    const pointer = (type: string, target: EventTarget, x: number): void => {
      target.dispatchEvent(
        new PointerEvent(type, {
          bubbles: true,
          cancelable: true,
          clientX: x,
          clientY: 10,
          pointerId: 1,
          pointerType: 'mouse',
          isPrimary: true
        })
      )
    }
    // 其他 拖到 gh-proxy 与 ghfast 之间
    const other = categoryTab(wrapper, '其他').element
    pointer('pointerdown', other, 340)
    pointer('pointermove', window, 120)
    await settle()
    expect(section(wrapper).find('[data-test="tabs-drop"]').exists()).toBe(true)
    pointer('pointerup', window, 120)
    await settle()
    expect(categoryNames(wrapper)).toEqual(['gh-proxy', '其他', 'ghfast', 'wget.la', '自定义'])
    expect((await getSettings()).categoryOrder).toEqual(['gh-proxy', 'other', 'ghfast', 'wget-la', 'custom'])
  })

  it('分类排序保存失败：提示，恢复原来的顺序', async () => {
    const wrapper = await render()
    vi.spyOn(fakeBrowser.storage.sync, 'set').mockRejectedValue(new Error('配额'))
    const first = categoryTab(wrapper, 'gh-proxy').element as HTMLElement
    first.focus()
    first.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', altKey: true, bubbles: true, cancelable: true }))
    await settle()
    expect(toastTexts(wrapper)).toEqual(['保存失败'])
    expect(categoryNames(wrapper)).toEqual(CATEGORY_NAMES)
  })

  it('删除内置源后可恢复；删除自定义源；删除按钮的无障碍名称带加速源名称', async () => {
    await settingsItem.setValue({
      ...ZH_SETTINGS,
      customSources: [{ id: 'custom-1', name: 'Mirror', template: 'https://mirror.example/{url}', category: 'custom' }]
    })
    const wrapper = await render()
    await selectCategory(wrapper, 'wget.la')
    const deleteWget = row(category(wrapper, 'wget.la'), 'wget.la').get('button')
    expect(deleteWget.attributes('aria-label')).toBe('删除 wget.la')
    await deleteWget.trigger('click')
    await settle()
    expect(category(wrapper, 'wget.la').find('[data-test="sources-empty"]').exists()).toBe(true)
    expect(counts(wrapper)[2]).toBe('0')
    expect((await getSettings()).removedSources).toEqual(['wget-la'])
    await selectCategory(wrapper, '自定义')
    await row(category(wrapper, '自定义'), 'Mirror').get('button').trigger('click')
    await settle()
    expect((await getSettings()).customSources).toEqual([])
    await button(section(wrapper), '恢复内置').trigger('click')
    await settle()
    expect(sourceNames(category(wrapper, 'wget.la'))).toEqual(['wget.la'])
    expect(button(section(wrapper), '恢复内置').element.disabled).toBe(true)
  })

  it('键盘删除：焦点移到同一分类中原位置这一行的删除按钮；分类删空时移到添加表单的名称，显示空列表', async () => {
    const wrapper = await render()
    for (const expected of ['edgeone.gh-proxy.org', 'gh-proxy.com', 'hk.gh-proxy.org']) {
      const scope = category(wrapper, 'gh-proxy')
      const names = sourceNames(scope)
      const target = row(scope, names[1] ?? names[0]!).get<HTMLButtonElement>('button')
      target.element.focus()
      await target.trigger('click')
      await settle()
      expect(document.activeElement?.getAttribute('aria-label')).toBe(`删除 ${expected}`)
    }
    const last = row(category(wrapper, 'gh-proxy'), 'hk.gh-proxy.org').get<HTMLButtonElement>('button')
    last.element.focus()
    await last.trigger('click')
    await settle()
    expect(category(wrapper, 'gh-proxy').get('[data-test="sources-empty"]').text()).toBe('暂无加速源')
    expect(document.activeElement).toBe(sourceInputs(wrapper)[0]!.element)
  })

  it('点击删除（焦点不在该行）：焦点不移动', async () => {
    const wrapper = await render()
    const input = nameInput(wrapper, 'gh-proxy')
    input.element.focus()
    await row(category(wrapper, 'gh-proxy'), 'gh-proxy.com').get('button').trigger('click')
    await settle()
    expect(sourceNames(category(wrapper, 'gh-proxy'))).not.toContain('gh-proxy.com')
    expect(document.activeElement).toBe(input.element)
  })

  it('没有加速源时不能测速', async () => {
    await settingsItem.setValue({ ...ZH_SETTINGS, removedCategories: ['gh-proxy', 'ghfast', 'wget-la', 'other'] })
    const wrapper = await render()
    expect(categoryNames(wrapper)).toEqual(['自定义'])
    expect(button(section(wrapper), '测速').element.disabled).toBe(true)
  })

  it('保存失败：提示', async () => {
    const wrapper = await render()
    await selectCategory(wrapper, 'wget.la')
    vi.spyOn(fakeBrowser.storage.sync, 'set').mockRejectedValue(new Error('配额'))
    await row(category(wrapper, 'wget.la'), 'wget.la').get('button').trigger('click')
    await settle()
    expect(toastTexts(wrapper)).toEqual(['保存失败'])
    expect(sourceNames(category(wrapper, 'wget.la'))).toEqual(['wget.la'])
  })

  it('测速：各加速源并行，测速中按钮不可用；结果为延迟与 Ping，连不上的为失败', async () => {
    const pending: (() => void)[] = []
    const fetch = vi.fn((url: string) => {
      if (url === 'https://wget.la/') return Promise.reject(new TypeError('Failed to fetch'))
      if (url === 'https://hk.gh-proxy.org/') return new Promise(resolve => pending.push(() => resolve({})))
      return Promise.resolve({})
    })
    vi.stubGlobal('fetch', fetch)
    const wrapper = await render()
    await button(section(wrapper), '测速').trigger('click')
    await settle()
    const cells = (scope: string, name: string): string[] =>
      row(category(wrapper, scope), name)
        .findAll('td')
        .slice(2, 4)
        .map(item => item.text())
    expect(button(section(wrapper), '测速').element.disabled).toBe(true)
    expect(category(wrapper, 'gh-proxy').get('table').attributes('aria-busy')).toBe('true')
    expect(cells('gh-proxy', 'hk.gh-proxy.org')).toEqual(['测速中', '测速中'])
    expect(cells('wget.la', 'wget.la')).toEqual(['失败', '—'])
    expect(cells('ghfast', 'ghfast.top').every(text => /^\d+ ms$/.test(text))).toBe(true)
    expect(row(category(wrapper, 'ghfast'), 'ghfast.top').findAll('td')[2]?.classes()).toContain('is-good')
    expect(row(category(wrapper, 'wget.la'), 'wget.la').findAll('td')[2]?.classes()).toContain('is-slow')
    // 延迟 1 次 + Ping 3 次
    expect(fetch.mock.calls.filter(([url]) => url === 'https://ghfast.top/')).toHaveLength(4)
    while (pending.length > 0) {
      pending.shift()?.()
      await settle()
    }
    expect(cells('gh-proxy', 'hk.gh-proxy.org')[0]).toMatch(/^\d+ ms$/)
    expect(button(section(wrapper), '测速').element.disabled).toBe(false)
  })
})
