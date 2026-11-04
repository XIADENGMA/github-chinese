import type { MessageKey } from '../i18n'
import { accelerateLink, parseDownloadLink, type AccelerableLink, type AccelerateSource } from '../shared/accelerate'
import {
  categoryCandidates,
  categoryName,
  listCategories,
  pickSource,
  type AccelerateCategory,
  type SourceHealth
} from '../shared/accelerate-categories'
import type { Settings } from '../shared/settings'
import type { HealthCache } from './accelerate-health'
import {
  encodePath,
  fetchFile,
  FETCH_CONCURRENCY,
  FolderError,
  listFolder,
  MAX_TOTAL_BYTES,
  runPool,
  treePage,
  type FetchLike,
  type FolderErrorReason,
  type FolderInfo
} from './folder-files'
import { createIcon } from './icons'
import { isPrivatePage } from './private-page'
import { createZip } from './zip'

/**
 * 下载文件夹：目录页顶栏的「添加文件」之后加按钮「下载文件夹」（放在「…」更多选项按钮之前，按 data-testid 定位，不靠按钮文字；
 * 窄屏顶栏只显示图标）。扩展内取回目录下的全部文件（见 core/folder-files），本地打包成 ZIP 保存，不经第三方服务。
 * 开启下载加速、公开存储库（github.com）时按钮带下拉菜单：直连与各加速分类，文件经所选分类的加速源取回
 * （故障转移开启时用可用的最快的；还没有探测结果时先列出各分类，下载时再按结果选；都不可用的分类按自动隐藏开关隐藏或显示为不可用）。
 * 进度显示在页面右下角，可取消
 */
export interface FolderDownloadDeps {
  readonly settings: () => Settings
  /** 加速源的探测结果（故障转移开启时用） */
  readonly health: HealthCache
  /** 界面文案（扩展界面语言） */
  readonly label: (key: MessageKey) => string
  /** 取回；不给时用全局 fetch */
  readonly fetch?: FetchLike
  /** 保存 ZIP；不给时建对象地址后下载 */
  readonly save?: (blob: Blob, name: string) => void
}

export interface FolderDownload {
  /** 设置变化后按新设置更新按钮 */
  refresh(): void
  /** 停止：取消进行中的下载，移除按钮、菜单与进度 */
  stop(): void
}

/** 加的元素（按钮外层 wrap、按钮 button、下拉菜单 menu、分隔线 divider）、菜单项（值为分类，直连为 direct）、进度区域、单个任务上的标记属性 */
export const MENU_ATTRIBUTE = 'data-gcn-folder'
export const MENU_ITEM_ATTRIBUTE = 'data-gcn-folder-item'
export const TASKS_ATTRIBUTE = 'data-gcn-tasks'
export const TASK_ATTRIBUTE = 'data-gcn-task'
/** 完成后进度保留多久 */
export const DONE_VISIBLE_MS = 3000
/** 经加速源取回时同时进行的请求数（公益服务，比直连少） */
export const ACCELERATED_CONCURRENCY = 4
/** 对象地址保留多久（浏览器开始下载后即可释放） */
const REVOKE_DELAY_MS = 60_000

/** 目录页顶栏的「…」（更多选项）按钮：宽屏、窄屏顶栏各一个，按钮放在它之前 */
const ANCHOR_SELECTOR = 'button[data-testid="tree-overflow-menu-anchor"]'
/** 窄屏顶栏：按钮只显示图标 */
const NARROW_SELECTOR = '.react-code-view-header-element--narrow'
/** 「…」按钮前的读屏标题（More options） */
const HEADING_SELECTOR = 'h2, h3, [data-testid="screen-reader-heading"]'
const STYLE_ID = 'gcn-folder-style'
const MENU_ID = 'gcn-folder-menu'

const ERROR_MESSAGES: Readonly<Record<FolderErrorReason, MessageKey>> = {
  tooMany: 'tooManyFiles',
  tooLarge: 'tooLarge',
  empty: 'emptyFolder',
  failed: 'downloadFailed'
}

const STYLE = `
[${MENU_ATTRIBUTE}='wrap'] {
  display: flex;
  flex: none;
}
[${MENU_ATTRIBUTE}='button'] {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  height: var(--control-medium-size, 32px);
  margin: 0;
  padding: 0 var(--control-medium-paddingInline-normal, 12px);
  border: var(--borderWidth-thin, 1px) solid var(--button-default-borderColor-rest, var(--color-btn-border, #d1d9e0));
  border-radius: var(--borderRadius-medium, 6px);
  background: var(--button-default-bgColor-rest, var(--color-btn-bg, #f6f8fa));
  box-shadow: var(--button-default-shadow-resting, 0 1px 0 0 #1f23280a);
  color: var(--button-default-fgColor-rest, var(--color-btn-text, #25292e));
  font: inherit;
  font-size: var(--text-body-size-medium, 14px);
  font-weight: var(--base-text-weight-medium, 500);
  line-height: 20px;
  white-space: nowrap;
  cursor: pointer;
  user-select: none;
  transition: background-color 80ms cubic-bezier(0.33, 1, 0.68, 1), border-color 80ms cubic-bezier(0.33, 1, 0.68, 1);
}
[${MENU_ATTRIBUTE}='button'][data-compact] {
  width: var(--control-medium-size, 32px);
  padding: 0;
}
[${MENU_ATTRIBUTE}='button'] > svg {
  flex: none;
}
[${MENU_ATTRIBUTE}='button']:hover {
  background: var(--button-default-bgColor-hover, var(--color-btn-hover-bg, #eff2f5));
  border-color: var(--button-default-borderColor-hover, var(--color-btn-hover-border, #d1d9e0));
}
[${MENU_ATTRIBUTE}='button']:active,
[${MENU_ATTRIBUTE}='button'][aria-expanded='true'] {
  background: var(--button-default-bgColor-active, var(--color-btn-active-bg, #e6eaef));
  border-color: var(--button-default-borderColor-active, var(--color-btn-active-border, #d1d9e0));
}
[${MENU_ATTRIBUTE}='button']:focus-visible {
  outline: 2px solid var(--focus-outlineColor, var(--color-accent-fg, #0969da));
  outline-offset: -2px;
  box-shadow: none;
}
[${MENU_ATTRIBUTE}='menu'] {
  position: fixed;
  z-index: 2147482999;
  min-width: 192px;
  max-width: min(320px, calc(100vw - 16px));
  margin: 0;
  padding: 8px;
  border-radius: var(--borderRadius-large, 12px);
  background: var(--overlay-bgColor, var(--color-canvas-overlay, #ffffff));
  box-shadow: var(--shadow-floating-small, 0 0 0 1px #d1d9e080, 0 6px 12px -3px #25292e0a, 0 6px 18px 0 #25292e1f);
  color: var(--fgColor-default, var(--color-fg-default, #1f2328));
  font-size: 14px;
  line-height: 20px;
  list-style: none;
}
[${MENU_ATTRIBUTE}='divider'] {
  display: block;
  height: 1px;
  margin: 8px -8px;
  padding: 0;
  background: var(--borderColor-muted, var(--color-border-muted, #d1d9e0b3));
  list-style: none;
}
[${MENU_ITEM_ATTRIBUTE}] {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 32px;
  margin: 0;
  padding: 6px 8px;
  border-radius: var(--borderRadius-medium, 6px);
  color: var(--fgColor-default, var(--color-fg-default, #1f2328));
  font-size: 14px;
  line-height: 20px;
  white-space: nowrap;
  list-style: none;
  cursor: pointer;
  user-select: none;
}
[${MENU_ITEM_ATTRIBUTE}] > svg {
  flex: none;
  color: var(--fgColor-muted, #59636e);
}
[${MENU_ITEM_ATTRIBUTE}]:hover,
[${MENU_ITEM_ATTRIBUTE}]:focus {
  outline: none;
  background: var(--control-transparent-bgColor-hover, #818b981a);
}
[${MENU_ITEM_ATTRIBUTE}]:focus-visible {
  outline: 2px solid var(--focus-outlineColor, #0969da);
  outline-offset: -2px;
}
[${MENU_ITEM_ATTRIBUTE}][aria-disabled='true'] {
  color: var(--fgColor-disabled, #818b98);
  cursor: not-allowed;
}
[${MENU_ITEM_ATTRIBUTE}][aria-disabled='true']:hover {
  background: transparent;
}
[${TASKS_ATTRIBUTE}] {
  position: fixed;
  right: 16px;
  bottom: 16px;
  z-index: 2147483000;
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-width: min(360px, calc(100vw - 32px));
}
[${TASK_ATTRIBUTE}] {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 8px 8px 12px;
  border: 1px solid var(--borderColor-default, #d1d9e0);
  border-radius: 8px;
  background: var(--overlay-bgColor, var(--bgColor-default, #ffffff));
  box-shadow: var(--shadow-floating-small, 0 6px 12px -3px #25292e0a, 0 6px 18px 0 #25292e1f);
  color: var(--fgColor-default, #1f2328);
  font-size: 13px;
  line-height: 20px;
}
[${TASK_ATTRIBUTE}] > svg {
  flex: none;
  color: var(--fgColor-muted, #59636e);
}
[${TASK_ATTRIBUTE}] [data-part='name'] {
  min-width: 0;
  overflow: hidden;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
}
[${TASK_ATTRIBUTE}] [data-part='status'] {
  flex: none;
  margin-left: auto;
  color: var(--fgColor-muted, #59636e);
  font-variant-numeric: tabular-nums;
}
[${TASK_ATTRIBUTE}][data-state='failed'] [data-part='status'] {
  color: var(--fgColor-danger, #d1242f);
}
[${TASK_ATTRIBUTE}][data-state='done'] [data-part='status'] {
  color: var(--fgColor-success, #1a7f37);
}
[${TASK_ATTRIBUTE}] button {
  display: inline-flex;
  flex: none;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  padding: 0;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: var(--fgColor-muted, #59636e);
  cursor: pointer;
}
[${TASK_ATTRIBUTE}] button:hover {
  background: var(--control-transparent-bgColor-hover, #818b981a);
  color: var(--fgColor-default, #1f2328);
}
[${TASK_ATTRIBUTE}] button:focus-visible {
  outline: 2px solid var(--focus-outlineColor, #0969da);
  outline-offset: -2px;
}
`

/** 菜单里的一项：直连（无分类），或一个加速分类（不可用时没有加速源） */
interface MenuChoice {
  readonly name: string
  readonly category?: AccelerateCategory
  readonly unavailable?: boolean
}

/** 下载用的取回方式：直连，或经一个加速源 */
type Route = { readonly kind: 'direct' } | { readonly kind: 'source'; readonly source: AccelerateSource }

/** 存储库中文件的 Raw 地址（raw.githubusercontent.com，交给加速源） */
function rawLink(info: FolderInfo, path: string): AccelerableLink | undefined {
  return parseDownloadLink(
    `https://raw.githubusercontent.com/${encodePath(info.owner)}/${encodePath(info.repo)}/${info.oid}/${encodePath(path)}`
  )
}

/** 判断分类能否加速本存储库的文件用的示例地址 */
function sampleLink(owner: string, repo: string): AccelerableLink | undefined {
  return parseDownloadLink(`https://raw.githubusercontent.com/${encodePath(owner)}/${encodePath(repo)}/HEAD/README.md`)
}

/** 压缩包与根目录的名称：目录名，根目录为存储库名；Windows 保留字符换成 _ */
export function archiveName(info: Pick<FolderInfo, 'repo' | 'path'>): string {
  const last = info.path.split('/').pop() || info.repo
  return last.replace(/[\\/:*?"<>|\p{Cc}]+/gu, '_').trim() || 'folder'
}

function isAbort(error: unknown): boolean {
  return error instanceof DOMException && error.name === 'AbortError'
}

export function createFolderDownload(doc: Document, deps: FolderDownloadDeps): FolderDownload {
  const fetcher: FetchLike = deps.fetch ?? ((url, init) => fetch(url, init))
  const tasks = new Set<AbortController>()
  /** 「…」按钮 → 放在它之前的按钮外层与渲染时的内容 */
  const buttons = new Map<Element, { readonly wrap: HTMLElement; readonly key: string }>()
  /** 打开的下拉菜单 */
  let menuState: { readonly menu: HTMLElement; readonly button: HTMLButtonElement; key: string } | undefined
  let scheduled = false
  let stopped = false
  /** 正在等后台的探测结果 */
  let healthPending = false
  /** 探测失败：本轮设置下不再等，按不探测处理 */
  let healthFailed = false

  function isEnabled(): boolean {
    const settings = deps.settings()
    return settings.enabled && settings.folderDownload
  }

  function ensureStyle(): void {
    if (doc.getElementById(STYLE_ID)) return
    const style = doc.createElement('style')
    style.id = STYLE_ID
    style.textContent = STYLE
    ;(doc.head ?? doc.documentElement).append(style)
  }

  /** 按钮放在「…」按钮之前；「…」前面是读屏标题时放在标题之前 */
  function slotOf(anchor: Element): Element {
    const previous = anchor.previousElementSibling
    return previous?.matches(HEADING_SELECTOR) ? previous : anchor
  }

  /**
   * 可选的取回方式：直连在前；开启下载加速的公开存储库（github.com）另列各分类。
   * 故障转移开启、还没有探测结果时不等，先按各分类的第一个加速源列出，结果到后更新
   */
  function choices(): MenuChoice[] {
    const settings = deps.settings()
    const direct: MenuChoice = { name: deps.label('directDownload') }
    const page = treePage(doc.location.pathname)
    const sample = page && doc.location.hostname === 'github.com' ? sampleLink(page.owner, page.repo) : undefined
    if (!settings.accelerate || !sample || isPrivatePage(doc)) return [direct]
    let health: SourceHealth | undefined
    if (settings.failover && !healthFailed) {
      health = deps.health.current()
      if (!health) requestHealth()
    }
    const result = [direct]
    for (const category of listCategories(settings)) {
      if (categoryCandidates(category, sample).length === 0) continue
      const available = pickSource(category, sample, health) !== undefined
      if (!available && category.autoHide) continue
      result.push({ name: categoryName(category, deps.label), category, ...(available ? {} : { unavailable: true }) })
    }
    return result
  }

  function requestHealth(): void {
    if (healthPending) return
    healthPending = true
    deps.health.get().then(
      () => {
        healthPending = false
        schedule()
      },
      () => {
        healthPending = false
        healthFailed = true
        schedule()
      }
    )
  }

  // ---------- 下拉菜单 ----------

  function menuItems(): HTMLElement[] {
    return menuState ? [...menuState.menu.querySelectorAll<HTMLElement>(`[${MENU_ITEM_ATTRIBUTE}]`)] : []
  }

  /** 聚焦第 index 项（负数从末尾算，越界时循环） */
  function focusItem(index: number): void {
    const items = menuItems()
    if (items.length > 0) items[((index % items.length) + items.length) % items.length]!.focus()
  }

  function createItem(choice: MenuChoice): HTMLElement {
    const item = doc.createElement('li')
    item.setAttribute(MENU_ITEM_ATTRIBUTE, choice.category?.id ?? 'direct')
    item.setAttribute('role', 'menuitem')
    item.tabIndex = -1
    item.append(createIcon(doc, choice.category ? 'zap' : 'download'), choice.name)
    if (choice.unavailable) {
      item.setAttribute('aria-disabled', 'true')
      item.title = deps.label('stateUnavailable')
      return item
    }
    item.addEventListener('click', event => {
      event.preventDefault()
      closeMenu(true)
      start(choice.category)
    })
    return item
  }

  /** 填入菜单项：直连、分隔线、各分类；内容变化时重建，键盘焦点留在同一项 */
  function fillMenu(list: readonly MenuChoice[]): void {
    if (!menuState) return
    const key = JSON.stringify(list.map(choice => [choice.name, choice.category?.id, choice.unavailable]))
    if (key === menuState.key) return
    const focused = menuItems()
      .find(item => item === doc.activeElement)
      ?.getAttribute(MENU_ITEM_ATTRIBUTE)
    const [direct, ...categories] = list
    const children = direct ? [createItem(direct)] : []
    if (categories.length > 0) {
      const divider = doc.createElement('li')
      divider.setAttribute(MENU_ATTRIBUTE, 'divider')
      divider.setAttribute('role', 'none')
      divider.setAttribute('aria-hidden', 'true')
      children.push(divider, ...categories.map(createItem))
    }
    menuState.menu.replaceChildren(...children)
    menuState.key = key
    if (focused) (menuItems().find(item => item.getAttribute(MENU_ITEM_ATTRIBUTE) === focused) ?? menuItems()[0])?.focus()
  }

  /** 菜单在按钮下方，右边与按钮对齐，不超出窗口 */
  function positionMenu(): void {
    if (!menuState) return
    const { menu, button } = menuState
    const rect = button.getBoundingClientRect()
    const width = menu.offsetWidth
    const viewport = doc.documentElement.clientWidth || rect.right
    menu.style.top = `${Math.round(rect.bottom + 4)}px`
    menu.style.left = `${Math.round(Math.max(8, Math.min(rect.right - width, viewport - width - 8)))}px`
  }

  /** 在菜单与按钮之外按下指针：关闭 */
  function onPointerDown(event: Event): void {
    const target = event.target instanceof Node ? event.target : null
    if (!menuState || (target && (menuState.menu.contains(target) || menuState.button.contains(target)))) return
    closeMenu(false)
  }

  function onViewportChange(): void {
    positionMenu()
  }

  /** 菜单的键盘操作：↑ ↓ Home End 移动，Enter、空格选择，Escape 关闭并回到按钮，Tab 关闭 */
  function onMenuKeydown(event: KeyboardEvent): void {
    const items = menuItems()
    const index = items.findIndex(item => item === doc.activeElement)
    switch (event.key) {
      case 'ArrowDown':
        focusItem(index + 1)
        break
      case 'ArrowUp':
        focusItem(index < 0 ? -1 : index - 1)
        break
      case 'Home':
        focusItem(0)
        break
      case 'End':
        focusItem(-1)
        break
      case 'Escape':
        closeMenu(true)
        break
      case 'Enter':
      case ' ':
        if (index >= 0) items[index]!.click()
        break
      case 'Tab':
        closeMenu(false)
        return
      default:
        return
    }
    event.preventDefault()
    event.stopPropagation()
  }

  function openMenu(button: HTMLButtonElement, focus: 'first' | 'last'): void {
    closeMenu(false)
    ensureStyle()
    const menu = doc.createElement('ul')
    menu.id = MENU_ID
    menu.setAttribute(MENU_ATTRIBUTE, 'menu')
    menu.setAttribute('role', 'menu')
    menu.setAttribute('aria-label', deps.label('downloadFolder'))
    // 文字已是界面语言：汉化引擎、浏览器翻译都不处理
    menu.setAttribute('translate', 'no')
    menu.addEventListener('keydown', onMenuKeydown)
    doc.body.append(menu)
    menuState = { menu, button, key: '' }
    fillMenu(choices())
    button.setAttribute('aria-expanded', 'true')
    button.setAttribute('aria-controls', MENU_ID)
    positionMenu()
    doc.addEventListener('pointerdown', onPointerDown, true)
    doc.defaultView?.addEventListener('scroll', onViewportChange, true)
    doc.defaultView?.addEventListener('resize', onViewportChange)
    focusItem(focus === 'first' ? 0 : -1)
  }

  function closeMenu(returnFocus: boolean): void {
    if (!menuState) return
    const { menu, button } = menuState
    menuState = undefined
    menu.remove()
    button.setAttribute('aria-expanded', 'false')
    button.removeAttribute('aria-controls')
    doc.removeEventListener('pointerdown', onPointerDown, true)
    doc.defaultView?.removeEventListener('scroll', onViewportChange, true)
    doc.defaultView?.removeEventListener('resize', onViewportChange)
    if (returnFocus && button.isConnected) button.focus()
  }

  // ---------- 按钮 ----------

  /** 按钮「下载文件夹」：有分类时打开下拉菜单，否则直接下载（直连）；窄屏只显示图标 */
  function createButton(hasMenu: boolean, compact: boolean): HTMLElement {
    const wrap = doc.createElement('div')
    wrap.setAttribute(MENU_ATTRIBUTE, 'wrap')
    wrap.setAttribute('translate', 'no')
    const button = doc.createElement('button')
    button.type = 'button'
    button.setAttribute(MENU_ATTRIBUTE, 'button')
    const title = deps.label('downloadFolder')
    if (compact) {
      button.dataset.compact = ''
      button.setAttribute('aria-label', title)
      button.title = title
      button.append(createIcon(doc, 'download'))
    } else {
      button.append(title)
      if (hasMenu) button.append(createIcon(doc, 'triangleDown'))
    }
    if (hasMenu) {
      button.setAttribute('aria-haspopup', 'menu')
      button.setAttribute('aria-expanded', 'false')
      button.addEventListener('keydown', event => {
        if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return
        event.preventDefault()
        openMenu(button, event.key === 'ArrowDown' ? 'first' : 'last')
      })
    }
    button.addEventListener('click', event => {
      event.preventDefault()
      if (!hasMenu) start(undefined)
      else if (menuState?.button === button) closeMenu(false)
      else openMenu(button, 'first')
    })
    wrap.append(button)
    return wrap
  }

  function removeButtons(): void {
    closeMenu(false)
    for (const { wrap } of buttons.values()) wrap.remove()
    buttons.clear()
  }

  function scan(): void {
    scheduled = false
    const anchors = isEnabled() && treePage(doc.location.pathname) ? [...doc.querySelectorAll(ANCHOR_SELECTOR)] : []
    if (anchors.length === 0) {
      removeButtons()
      return
    }
    const list = choices()
    const hasMenu = list.length > 1
    const title = deps.label('downloadFolder')
    // 页面重新渲染后不在原处的：移除，下面重新加
    for (const [anchor, { wrap }] of buttons) {
      if (anchors.includes(anchor) && wrap.isConnected && wrap.nextElementSibling === slotOf(anchor)) continue
      wrap.remove()
      buttons.delete(anchor)
    }
    for (const anchor of anchors) {
      const compact = anchor.closest(NARROW_SELECTOR) !== null
      const key = JSON.stringify([hasMenu, compact, title])
      const existing = buttons.get(anchor)
      if (existing?.key === key) continue
      existing?.wrap.remove()
      ensureStyle()
      const wrap = createButton(hasMenu, compact)
      slotOf(anchor).before(wrap)
      buttons.set(anchor, { wrap, key })
    }
    // 打开的菜单：按钮已不在页面上时关闭，否则更新菜单项（探测结果到了等）
    if (menuState && !menuState.button.isConnected) closeMenu(false)
    else fillMenu(list)
  }

  function schedule(): void {
    if (scheduled || stopped) return
    scheduled = true
    queueMicrotask(scan)
  }

  // ---------- 下载与进度 ----------

  function taskContainer(): HTMLElement {
    let container = doc.querySelector<HTMLElement>(`[${TASKS_ATTRIBUTE}]`)
    if (container) return container
    ensureStyle()
    container = doc.createElement('div')
    container.setAttribute(TASKS_ATTRIBUTE, '')
    container.setAttribute('translate', 'no')
    container.setAttribute('role', 'status')
    container.setAttribute('aria-live', 'polite')
    doc.body.append(container)
    return container
  }

  function createTaskView(controller: AbortController): {
    readonly element: HTMLElement
    setName(name: string): void
    setStatus(text: string, state?: 'done' | 'failed'): void
  } {
    const element = doc.createElement('div')
    element.setAttribute(TASK_ATTRIBUTE, '')
    const name = doc.createElement('span')
    name.dataset.part = 'name'
    name.textContent = deps.label('downloadFolder')
    const status = doc.createElement('span')
    status.dataset.part = 'status'
    status.textContent = deps.label('stateLoading')
    const button = doc.createElement('button')
    button.type = 'button'
    button.setAttribute('aria-label', deps.label('cancel'))
    button.title = deps.label('cancel')
    button.append(createIcon(doc, 'cross'))
    button.addEventListener('click', () => {
      controller.abort()
      element.remove()
    })
    element.append(createIcon(doc, 'download'), name, status, button)
    taskContainer().append(element)
    return {
      element,
      setName: text => {
        name.textContent = text
        name.title = text
      },
      setStatus: (text, state) => {
        status.textContent = text
        if (state) {
          element.dataset.state = state
          button.setAttribute('aria-label', deps.label('close'))
          button.title = deps.label('close')
        }
      }
    }
  }

  function save(blob: Blob, name: string): void {
    if (deps.save) {
      deps.save(blob, name)
      return
    }
    const url = URL.createObjectURL(blob)
    // 不放进页面：点击不经过页面脚本与本扩展的点击处理
    const anchor = doc.createElement('a')
    anchor.href = url
    anchor.download = name
    anchor.click()
    setTimeout(() => URL.revokeObjectURL(url), REVOKE_DELAY_MS)
  }

  /** 选定取回方式：直连；分类时为探测可用的最快的（故障转移关闭时为第一个），都不可用时以 failed 拒绝 */
  async function route(category: AccelerateCategory | undefined, info: FolderInfo, sample: string): Promise<Route> {
    if (!category) return { kind: 'direct' }
    const link = rawLink(info, sample)
    const health = deps.settings().failover ? await deps.health.get().catch(() => undefined) : undefined
    const source = link && pickSource(category, link, health)
    if (!source) throw new FolderError('failed')
    return { kind: 'source', source }
  }

  function fileRequest(info: FolderInfo, path: string, via: Route): { readonly url: string; readonly init: RequestInit } {
    if (via.kind === 'direct') {
      const url = `${doc.location.origin}/${encodePath(info.owner)}/${encodePath(info.repo)}/raw/${info.oid}/${encodePath(path)}`
      return { url, init: { credentials: 'same-origin' } }
    }
    const link = rawLink(info, path)
    const url = link && accelerateLink(via.source.template, link)
    if (!url) throw new FolderError('failed')
    return { url, init: { credentials: 'omit', referrerPolicy: 'no-referrer' } }
  }

  async function download(
    category: AccelerateCategory | undefined,
    controller: AbortController,
    view: ReturnType<typeof createTaskView>
  ): Promise<void> {
    const { signal } = controller
    const { info, files } = await listFolder(doc.location.origin, doc.location.pathname, fetcher, signal)
    const name = archiveName(info)
    view.setName(name)
    const via = await route(category, info, files[0]!)
    const prefix = info.path === '' ? '' : `${info.path}/`
    const entries: { name: string; data: Uint8Array }[] = []
    let total = 0
    view.setStatus(`0/${files.length}`)
    await runPool(files, via.kind === 'direct' ? FETCH_CONCURRENCY : ACCELERATED_CONCURRENCY, async path => {
      const request = fileRequest(info, path, via)
      const data = await fetchFile(fetcher, request.url, request.init, signal)
      total += data.length
      if (total > MAX_TOTAL_BYTES) throw new FolderError('tooLarge')
      entries.push({ name: `${name}/${path.startsWith(prefix) ? path.slice(prefix.length) : path}`, data })
      view.setStatus(`${entries.length}/${files.length}`)
    })
    signal.throwIfAborted()
    view.setStatus(deps.label('packing'))
    entries.sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0))
    const blob = await createZip(entries)
    signal.throwIfAborted()
    save(blob, `${name}.zip`)
  }

  function start(category: AccelerateCategory | undefined): void {
    const controller = new AbortController()
    tasks.add(controller)
    const view = createTaskView(controller)
    download(category, controller, view)
      .then(
        () => {
          view.setStatus(deps.label('completed'), 'done')
          setTimeout(() => view.element.remove(), DONE_VISIBLE_MS)
        },
        (error: unknown) => {
          // 失败时停下其余请求
          const cancelled = controller.signal.aborted && isAbort(error)
          controller.abort()
          if (cancelled || stopped) return
          const reason = error instanceof FolderError ? error.reason : 'failed'
          view.setStatus(deps.label(ERROR_MESSAGES[reason]), 'failed')
        }
      )
      .finally(() => tasks.delete(controller))
  }

  const observer = new MutationObserver(schedule)
  observer.observe(doc.documentElement, { childList: true, subtree: true })
  scan()

  return {
    refresh: () => {
      healthFailed = false
      scan()
    },
    stop() {
      stopped = true
      observer.disconnect()
      for (const controller of tasks) controller.abort()
      tasks.clear()
      removeButtons()
      doc.querySelector(`[${TASKS_ATTRIBUTE}]`)?.remove()
      doc.getElementById(STYLE_ID)?.remove()
    }
  }
}
