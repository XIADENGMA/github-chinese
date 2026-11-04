// @vitest-environment-options { "url": "https://github.com/vuejs/core/tree/main/packages" }
import { inflateRawSync } from 'node:zlib'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createHealthCache, type HealthCache } from '../../../src/core/accelerate-health'
import {
  archiveName,
  createFolderDownload,
  MENU_ATTRIBUTE,
  MENU_ITEM_ATTRIBUTE,
  TASK_ATTRIBUTE,
  TASKS_ATTRIBUTE,
  type FolderDownload
} from '../../../src/core/folder-download'
import type { FetchLike } from '../../../src/core/folder-files'
import { translateMessage, type MessageKey } from '../../../src/i18n'
import type { SourceHealth } from '../../../src/shared/accelerate-categories'
import { DEFAULT_SETTINGS, type Settings } from '../../../src/shared/settings'

const OID = 'b'.repeat(40)
const ROOT = 'https://github.com/vuejs/core/tree/main/packages'
const RAW_BASE = `https://raw.githubusercontent.com/vuejs/core/${OID}`
const CATEGORIES = ['gh-proxy', 'ghfast', 'wget.la', '其他']

interface Item {
  readonly path: string
  readonly contentType: string
}

function tree(path: string, items: readonly Item[], totalCount = items.length): unknown {
  return { payload: { codeViewTreeRoute: { path, refInfo: { currentOid: OID }, tree: { items, totalCount } } } }
}

/** 目录 packages：a.txt、sub/b.txt */
const TREES: Readonly<Record<string, unknown>> = {
  [ROOT]: tree('packages', [
    { path: 'packages/a.txt', contentType: 'file' },
    { path: 'packages/sub', contentType: 'directory' }
  ]),
  [`https://github.com/vuejs/core/tree/${OID}/packages/sub`]: tree('packages/sub', [{ path: 'packages/sub/b.txt', contentType: 'file' }])
}

/** 文件内容：按路径 */
const FILES: Readonly<Record<string, string>> = { 'packages/a.txt': 'Sample text A', 'packages/sub/b.txt': 'Sample text B' }

let settings: Settings
let folders: FolderDownload | undefined
let health: HealthCache
const probe = vi.fn(async (): Promise<SourceHealth> => ({}))
const save = vi.fn<(blob: Blob, name: string) => void>()
const label = (key: MessageKey): string => translateMessage('zh-CN', key)
/** 文件地址 → 路径：直连与经加速源 */
let fileRoutes: (url: string) => string | undefined
const fetcher = vi.fn<FetchLike>()

function defaultFetch(url: string): Promise<Response> {
  if (url in TREES) return Promise.resolve(new Response(JSON.stringify(TREES[url])))
  const path = fileRoutes(url)
  if (path !== undefined && path in FILES) return Promise.resolve(new Response(FILES[path]))
  return Promise.resolve(new Response('', { status: 404 }))
}

function start(): FolderDownload {
  folders = createFolderDownload(document, { settings: () => settings, health, label, fetch: fetcher, save })
  return folders
}

async function flush(): Promise<void> {
  await new Promise(done => setTimeout(done, 0))
}

/** 等下载结束（完成、失败或取消） */
async function settleTask(): Promise<void> {
  for (let round = 0; round < 50; round += 1) {
    await flush()
    const task = document.querySelector<HTMLElement>(`[${TASK_ATTRIBUTE}]`)
    if (!task || task.dataset.state) return
  }
}

/** 目录页顶栏（同 GitHub：宽屏有「添加文件」，窄屏只有「…」；「…」前是读屏标题） */
function header(): void {
  document.body.innerHTML = `
    <div class="react-code-view-header-element--wide"><div class="d-flex gap-2">
      <div><button aria-label="Add file">Add file</button></div>
      <div class="d-none"></div>
      <h2 data-testid="screen-reader-heading">More options</h2>
      <button data-testid="tree-overflow-menu-anchor" aria-haspopup="true">…</button>
    </div></div>
    <div class="react-code-view-header-element--narrow"><div class="d-flex gap-2">
      <h2 data-testid="screen-reader-heading">More options</h2>
      <button data-testid="tree-overflow-menu-anchor" aria-haspopup="true">…</button>
    </div></div>`
}

/** 加上的按钮：宽屏、窄屏顶栏各一个 */
function folderButtons(): HTMLButtonElement[] {
  return [...document.querySelectorAll<HTMLButtonElement>(`[${MENU_ATTRIBUTE}="button"]`)]
}

function wideButton(): HTMLButtonElement {
  const found = folderButtons()[0]
  if (!found) throw new Error('未找到按钮')
  return found
}

function menu(): HTMLElement | null {
  return document.querySelector<HTMLElement>(`[${MENU_ATTRIBUTE}="menu"]`)
}

/** 单击宽屏顶栏的按钮，打开下拉菜单 */
function openMenu(): HTMLElement {
  wideButton().click()
  const found = menu()
  if (!found) throw new Error('菜单没有打开')
  return found
}

function addedItems(scope: Element | null): HTMLElement[] {
  return [...(scope?.querySelectorAll<HTMLElement>(`[${MENU_ITEM_ATTRIBUTE}]`) ?? [])]
}

function itemTexts(scope: Element | null): string[] {
  return addedItems(scope).map(item => item.textContent ?? '')
}

function item(scope: Element | null, text: string): HTMLElement {
  const found = addedItems(scope).find(element => element.textContent === text)
  if (!found) throw new Error(`未找到菜单项：${text}`)
  return found
}

/** 在当前焦点上按键（冒泡） */
function press(key: string, target: Element | null = document.activeElement): void {
  target?.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }))
}

function task(): HTMLElement | null {
  return document.querySelector<HTMLElement>(`[${TASK_ATTRIBUTE}]`)
}

function taskStatus(): string {
  return task()?.querySelector('[data-part="status"]')?.textContent ?? ''
}

/** 读出 ZIP 中的文件名与内容 */
async function readZip(blob: Blob): Promise<Record<string, string>> {
  const bytes = new Uint8Array(await blob.arrayBuffer())
  const view = new DataView(bytes.buffer)
  const end = bytes.length - 22
  const count = view.getUint16(end + 10, true)
  let at = view.getUint32(end + 16, true)
  const files: Record<string, string> = {}
  const decoder = new TextDecoder()
  for (let index = 0; index < count; index += 1) {
    const method = view.getUint16(at + 10, true)
    const compressed = view.getUint32(at + 20, true)
    const nameLength = view.getUint16(at + 28, true)
    const offset = view.getUint32(at + 42, true)
    const name = decoder.decode(bytes.subarray(at + 46, at + 46 + nameLength))
    const start = offset + 30 + view.getUint16(offset + 26, true) + view.getUint16(offset + 28, true)
    const body = bytes.subarray(start, start + compressed)
    files[name] = decoder.decode(method === 8 ? inflateRawSync(body) : body)
    at += 46 + nameLength
  }
  return files
}

beforeEach(() => {
  settings = { ...DEFAULT_SETTINGS }
  health = createHealthCache(probe)
  fileRoutes = url => {
    const prefix = `https://github.com/vuejs/core/raw/${OID}/`
    return url.startsWith(prefix) ? decodeURIComponent(url.slice(prefix.length)) : undefined
  }
  fetcher.mockImplementation(defaultFetch)
  document.head.innerHTML = '<meta name="octolytics-dimension-repository_public" content="true">'
  history.replaceState(null, '', '/vuejs/core/tree/main/packages')
})

afterEach(() => {
  folders?.stop()
  folders = undefined
  fetcher.mockReset()
  probe.mockReset()
  probe.mockImplementation(async () => ({}))
  save.mockReset()
  document.head.innerHTML = ''
  document.body.innerHTML = ''
})

describe('archiveName', () => {
  it('目录名；根目录为存储库名；Windows 保留字符换成 _', () => {
    expect(archiveName({ repo: 'core', path: 'packages/runtime-core' })).toBe('runtime-core')
    expect(archiveName({ repo: 'core', path: '' })).toBe('core')
    expect(archiveName({ repo: 'core', path: 'docs/a:b*c' })).toBe('a_b_c')
    expect(archiveName({ repo: 'core', path: 'docs/???' })).toBe('_')
  })
})

describe('createFolderDownload：按钮', () => {
  it('目录页：「…」按钮前（「添加文件」之后）加按钮「下载文件夹」；窄屏顶栏只显示图标；文字不翻译', () => {
    header()
    start()
    const [wide, narrow] = folderButtons()
    const wrap = wide!.parentElement!
    expect(wrap.getAttribute(MENU_ATTRIBUTE)).toBe('wrap')
    expect(wrap.getAttribute('translate')).toBe('no')
    expect(wrap.previousElementSibling?.className).toBe('d-none')
    expect(wrap.nextElementSibling?.textContent).toBe('More options')
    expect(wide!.type).toBe('button')
    expect(wide!.textContent).toBe('下载文件夹')
    expect(wide!.hasAttribute('aria-haspopup')).toBe(false)
    expect(narrow!.textContent).toBe('')
    expect(narrow!.hasAttribute('data-compact')).toBe(true)
    expect(narrow!.getAttribute('aria-label')).toBe('下载文件夹')
    expect(narrow!.title).toBe('下载文件夹')
    expect(narrow!.querySelector('svg')).not.toBeNull()
    expect(narrow!.parentElement!.nextElementSibling?.textContent).toBe('More options')
    expect(document.getElementById('gcn-folder-style')).not.toBeNull()
  })

  it('不是目录页：不加', () => {
    history.replaceState(null, '', '/vuejs/core/blob/main/README.md')
    header()
    start()
    expect(folderButtons()).toEqual([])
  })

  it.each([
    ['关闭下载文件夹', { folderDownload: false }],
    ['总开关关闭', { enabled: false }]
  ] as const)('%s：不加；开启后刷新时加上，关闭后移除', (_name, overrides) => {
    settings = { ...settings, ...overrides }
    header()
    start()
    expect(folderButtons()).toEqual([])
    settings = { ...DEFAULT_SETTINGS }
    folders!.refresh()
    expect(folderButtons()).toHaveLength(2)
    settings = { ...settings, ...overrides }
    folders!.refresh()
    expect(document.querySelector(`[${MENU_ATTRIBUTE}]`)).toBeNull()
  })

  it('页面重新渲染（按钮被移走）：重新加上', async () => {
    header()
    start()
    wideButton().parentElement!.remove()
    await flush()
    expect(folderButtons()).toHaveLength(2)
    expect(wideButton().parentElement!.nextElementSibling?.textContent).toBe('More options')
  })

  it('开启下载加速（公开存储库）：按钮带下拉菜单；单击打开：直连、分隔线、各分类（没有加速源的「自定义」不列），第一项获得焦点', () => {
    settings = { ...settings, accelerate: true }
    header()
    start()
    const button = wideButton()
    expect(button.getAttribute('aria-haspopup')).toBe('menu')
    expect(button.getAttribute('aria-expanded')).toBe('false')
    expect(button.textContent).toBe('下载文件夹')
    expect(button.querySelector('svg')).not.toBeNull()
    const opened = openMenu()
    expect(opened.parentElement).toBe(document.body)
    expect(opened.getAttribute('role')).toBe('menu')
    expect(opened.getAttribute('aria-label')).toBe('下载文件夹')
    expect(opened.getAttribute('translate')).toBe('no')
    expect(button.getAttribute('aria-expanded')).toBe('true')
    expect(button.getAttribute('aria-controls')).toBe(opened.id)
    expect(itemTexts(opened)).toEqual(['直连', ...CATEGORIES])
    expect(addedItems(opened).map(element => element.getAttribute('role'))).toEqual(Array.from({ length: 5 }, () => 'menuitem'))
    expect(addedItems(opened).map(element => element.tabIndex)).toEqual([-1, -1, -1, -1, -1])
    const divider = opened.querySelector(`[${MENU_ATTRIBUTE}="divider"]`)!
    expect(divider.previousElementSibling?.textContent).toBe('直连')
    expect(divider.getAttribute('role')).toBe('none')
    expect(document.activeElement).toBe(item(opened, '直连'))
  })

  it('菜单的键盘操作：↓ ↑ 循环移动，Home、End 到首尾，Escape 关闭并回到按钮', () => {
    settings = { ...settings, accelerate: true }
    header()
    start()
    const opened = openMenu()
    press('ArrowDown')
    expect(document.activeElement).toBe(item(opened, 'gh-proxy'))
    press('End')
    expect(document.activeElement).toBe(item(opened, '其他'))
    press('ArrowDown')
    expect(document.activeElement).toBe(item(opened, '直连'))
    press('ArrowUp')
    expect(document.activeElement).toBe(item(opened, '其他'))
    press('Home')
    expect(document.activeElement).toBe(item(opened, '直连'))
    press('Escape')
    expect(menu()).toBeNull()
    expect(wideButton().getAttribute('aria-expanded')).toBe('false')
    expect(wideButton().hasAttribute('aria-controls')).toBe(false)
    expect(document.activeElement).toBe(wideButton())
  })

  it('按钮上按 ↓ 打开并聚焦第一项，↑ 打开并聚焦最后一项；再次单击按钮、在外面按下指针都关闭', () => {
    settings = { ...settings, accelerate: true }
    header()
    start()
    press('ArrowDown', wideButton())
    expect(document.activeElement).toBe(item(menu(), '直连'))
    wideButton().click()
    expect(menu()).toBeNull()
    press('ArrowUp', wideButton())
    expect(document.activeElement).toBe(item(menu(), '其他'))
    document.body.dispatchEvent(new Event('pointerdown', { bubbles: true }))
    expect(menu()).toBeNull()
  })

  it('Tab 关闭菜单（不拦截）；其他按键不处理；按钮上按其他键不打开', () => {
    settings = { ...settings, accelerate: true }
    header()
    start()
    const key = new KeyboardEvent('keydown', { key: 'Shift', bubbles: true, cancelable: true })
    wideButton().dispatchEvent(key)
    expect(menu()).toBeNull()
    expect(key.defaultPrevented).toBe(false)
    openMenu()
    const other = new KeyboardEvent('keydown', { key: 'a', bubbles: true, cancelable: true })
    document.activeElement!.dispatchEvent(other)
    expect(other.defaultPrevented).toBe(false)
    expect(menu()).not.toBeNull()
    const tab = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true })
    document.activeElement!.dispatchEvent(tab)
    expect(tab.defaultPrevented).toBe(false)
    expect(menu()).toBeNull()
  })

  it('菜单在按钮下方，右边与按钮对齐；滚动时跟随按钮', () => {
    settings = { ...settings, accelerate: true }
    header()
    start()
    let top = 100
    vi.spyOn(wideButton(), 'getBoundingClientRect').mockImplementation(() => ({ top, bottom: top + 32, left: 300, right: 400 }) as DOMRect)
    const opened = openMenu()
    expect(opened.style.top).toBe('136px')
    top = 40
    window.dispatchEvent(new Event('scroll'))
    expect(opened.style.top).toBe('76px')
  })

  it('页面重新渲染移走了按钮：打开的菜单随之关闭', async () => {
    settings = { ...settings, accelerate: true }
    header()
    start()
    openMenu()
    wideButton().parentElement!.remove()
    await flush()
    expect(menu()).toBeNull()
  })

  it('分类排过序：菜单按排好的顺序；换了顺序后菜单随之更新', () => {
    settings = { ...settings, accelerate: true, categoryOrder: ['other', 'ghfast'] }
    header()
    start()
    const opened = openMenu()
    expect(itemTexts(opened)).toEqual(['直连', '其他', 'ghfast', 'gh-proxy', 'wget.la'])
    settings = { ...settings, categoryOrder: [] }
    folders!.refresh()
    expect(itemTexts(menu())).toEqual(['直连', ...CATEGORIES])
  })

  it('在菜单里按下指针：不关闭', () => {
    settings = { ...settings, accelerate: true }
    header()
    start()
    const opened = openMenu()
    item(opened, 'ghfast').dispatchEvent(new Event('pointerdown', { bubbles: true }))
    expect(menu()).toBe(opened)
  })

  it('不公开的存储库：没有下拉菜单', () => {
    settings = { ...settings, accelerate: true }
    document.head.innerHTML = '<meta name="octolytics-dimension-repository_public" content="false">'
    header()
    start()
    expect(wideButton().hasAttribute('aria-haspopup')).toBe(false)
  })

  it('故障转移开启：不等探测，先列出各分类；结果到后更新，都不可用的隐藏，关闭自动隐藏的显示为不可用', async () => {
    settings = { ...settings, accelerate: true, failover: true, categories: [{ id: 'other', autoHide: false }] }
    probe.mockResolvedValue({ ghfast: 80, 'wget-la': null, 'gh-monlor': null })
    header()
    start()
    expect(probe).toHaveBeenCalledOnce()
    const opened = openMenu()
    expect(itemTexts(opened)).toEqual(['直连', ...CATEGORIES])
    press('ArrowDown')
    press('ArrowDown')
    expect(document.activeElement).toBe(item(opened, 'ghfast'))
    await flush()
    expect(itemTexts(opened)).toEqual(['直连', 'ghfast', '其他'])
    expect(document.activeElement).toBe(item(opened, 'ghfast'))
    const other = item(opened, '其他')
    expect(other.getAttribute('aria-disabled')).toBe('true')
    expect(other.title).toBe('不可用')
    other.click()
    expect(task()).toBeNull()
    expect(menu()).toBe(opened)
  })

  it('探测失败：按不探测处理', async () => {
    settings = { ...settings, accelerate: true, failover: true }
    probe.mockRejectedValue(new Error('后台无响应'))
    header()
    start()
    await flush()
    expect(itemTexts(openMenu())).toEqual(['直连', ...CATEGORIES])
  })

  it('停止：移除按钮、菜单与样式，之后不再添加', async () => {
    settings = { ...settings, accelerate: true }
    header()
    const instance = start()
    openMenu()
    instance.stop()
    expect(document.querySelector(`[${MENU_ATTRIBUTE}]`)).toBeNull()
    expect(document.getElementById('gcn-folder-style')).toBeNull()
    header()
    await flush()
    expect(document.querySelector(`[${MENU_ATTRIBUTE}]`)).toBeNull()
  })
})

describe('createFolderDownload：下载', () => {
  it('没有加速：单击按钮即直连下载：逐级列出、取回文件（带 Cookie），打包成 ZIP 保存，显示进度与完成', async () => {
    header()
    start()
    wideButton().click()
    const container = document.querySelector(`[${TASKS_ATTRIBUTE}]`)!
    expect(container.getAttribute('role')).toBe('status')
    expect(container.getAttribute('translate')).toBe('no')
    expect(taskStatus()).toBe('加载中')
    await settleTask()
    expect(taskStatus()).toBe('已完成')
    expect(task()?.dataset.state).toBe('done')
    expect(task()?.querySelector('[data-part="name"]')?.textContent).toBe('packages')
    expect(save).toHaveBeenCalledOnce()
    const [blob, name] = save.mock.calls[0]!
    expect(name).toBe('packages.zip')
    expect(await readZip(blob)).toEqual({ 'packages/a.txt': 'Sample text A', 'packages/sub/b.txt': 'Sample text B' })
    const fileCall = fetcher.mock.calls.find(([url]) => url.includes('/raw/'))!
    expect(fileCall[0]).toBe(`https://github.com/vuejs/core/raw/${OID}/packages/a.txt`)
    expect(fileCall[1]).toMatchObject({ credentials: 'same-origin' })
  })

  it('菜单里选直连：关闭菜单，焦点回到按钮，开始下载', async () => {
    settings = { ...settings, accelerate: true }
    header()
    start()
    item(openMenu(), '直连').click()
    expect(menu()).toBeNull()
    expect(document.activeElement).toBe(wideButton())
    await settleTask()
    expect(save).toHaveBeenCalledOnce()
    expect(fetcher.mock.calls.some(([url]) => url.startsWith(`https://github.com/vuejs/core/raw/${OID}/`))).toBe(true)
  })

  it('键盘 Enter、空格同样选择', async () => {
    settings = { ...settings, accelerate: true }
    header()
    start()
    openMenu()
    press('Enter')
    expect(menu()).toBeNull()
    await settleTask()
    expect(save).toHaveBeenCalledOnce()
    // 已完成的进度还会显示一会：先移除，下面等第二个下载
    task()!.remove()
    openMenu()
    press(' ')
    await settleTask()
    expect(save).toHaveBeenCalledTimes(2)
  })

  it('经加速分类：文件经该分类的加速源从 raw.githubusercontent.com 取回，不带 Cookie 与来源页', async () => {
    settings = { ...settings, accelerate: true }
    fileRoutes = url => {
      const prefix = `https://ghfast.top/${RAW_BASE}/`
      return url.startsWith(prefix) ? decodeURIComponent(url.slice(prefix.length)) : undefined
    }
    header()
    start()
    item(openMenu(), 'ghfast').click()
    await settleTask()
    expect(taskStatus()).toBe('已完成')
    const fileCall = fetcher.mock.calls.find(([url]) => url.startsWith('https://ghfast.top/'))!
    expect(fileCall[0]).toBe(`https://ghfast.top/${RAW_BASE}/packages/a.txt`)
    expect(fileCall[1]).toMatchObject({ credentials: 'omit', referrerPolicy: 'no-referrer' })
  })

  it('故障转移开启：用分类中可用的最快的加速源；探测结果到之前选的，等结果再选', async () => {
    settings = { ...settings, accelerate: true, failover: true }
    let resolve: ((value: SourceHealth) => void) | undefined
    probe.mockImplementation(
      () =>
        new Promise(done => {
          resolve = done
        })
    )
    fileRoutes = url => {
      const prefix = `https://cdn.gh-proxy.org/${RAW_BASE}/`
      return url.startsWith(prefix) ? decodeURIComponent(url.slice(prefix.length)) : undefined
    }
    header()
    start()
    item(openMenu(), 'gh-proxy').click()
    await flush()
    expect(fetcher.mock.calls.some(([url]) => url.includes('gh-proxy'))).toBe(false)
    resolve?.({ 'gh-proxy-hk': 300, 'gh-proxy-cdn': 50 })
    await settleTask()
    expect(taskStatus()).toBe('已完成')
    expect(save).toHaveBeenCalledOnce()
  })

  it('文件过多：显示原因，按钮改为关闭，点击后移除', async () => {
    fetcher.mockImplementation(async url =>
      url === ROOT
        ? new Response(JSON.stringify(tree('packages', [{ path: 'packages/a.txt', contentType: 'file' }], 5000)))
        : defaultFetch(url)
    )
    header()
    start()
    wideButton().click()
    await settleTask()
    expect(taskStatus()).toBe('文件过多')
    expect(task()?.dataset.state).toBe('failed')
    const close = task()!.querySelector('button')!
    expect(close.getAttribute('aria-label')).toBe('关闭')
    close.click()
    expect(task()).toBeNull()
    expect(save).not.toHaveBeenCalled()
  })

  it('取文件失败：下载失败', async () => {
    fileRoutes = () => undefined
    header()
    start()
    wideButton().click()
    await settleTask()
    expect(taskStatus()).toBe('下载失败')
    expect(save).not.toHaveBeenCalled()
  })

  it('取消：中止请求，移除进度，不保存', async () => {
    const aborted: string[] = []
    fetcher.mockImplementation((url, init) => {
      if (!url.includes('/raw/')) return defaultFetch(url)
      return new Promise((_, reject) => {
        init.signal?.addEventListener('abort', () => {
          aborted.push(url)
          reject(new DOMException('aborted', 'AbortError'))
        })
      })
    })
    header()
    start()
    wideButton().click()
    await flush()
    await flush()
    const cancel = task()!.querySelector('button')!
    expect(cancel.getAttribute('aria-label')).toBe('取消')
    cancel.click()
    await flush()
    expect(task()).toBeNull()
    expect(aborted.length).toBeGreaterThan(0)
    expect(save).not.toHaveBeenCalled()
  })

  it('停止：中止进行中的下载，移除进度', async () => {
    fetcher.mockImplementation((url, init) =>
      url in TREES
        ? defaultFetch(url)
        : new Promise((_, reject) => init.signal?.addEventListener('abort', () => reject(new DOMException('aborted', 'AbortError'))))
    )
    header()
    start()
    wideButton().click()
    await flush()
    folders!.stop()
    await flush()
    expect(document.querySelector(`[${TASKS_ATTRIBUTE}]`)).toBeNull()
    expect(save).not.toHaveBeenCalled()
  })
})
