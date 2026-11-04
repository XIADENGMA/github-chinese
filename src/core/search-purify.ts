import { isBlockedResult, isEmptyBlockList, ownerOfPath, type SearchBlockList, type SearchResultInfo } from '../shared/search-block'
import { pageSite } from './page'

/**
 * 搜索净化：github.com（及企业版主站）的搜索结果页中命中屏蔽规则（见 shared/search-block）的结果直接隐藏，不留占位、不提示。
 * 结果由 React 渲染：只改结果元素的行内 display，不删节点。DOM 变动的回调在绘制前执行，命中的结果不会先显示再消失
 */
export interface SearchPurifierOptions {
  /** 是否净化：总开关与「净化搜索」都开启 */
  readonly active: () => boolean
  /** 当前的规则 */
  readonly rules: () => SearchBlockList
}

export interface SearchPurifier {
  /** 设置、规则变化后按新状态隐藏或显示 */
  refresh(): void
  /** 停止监听，显示已隐藏的结果 */
  stop(): void
}

/** 搜索结果页：github.com 与企业版主站（见 pageSite）的 /search */
const SEARCH_PATH = '/search'
/** 结果列表：每个子元素是一条结果 */
const RESULTS_SELECTOR = '[data-testid="results-list"]'
/**
 * 结果中的用户内容，取到的是原文（翻译时跳过，见 core/ignore 与 search 词典的忽略规则；所属存储库的链接文字是存储库名）：
 * 标题与所属存储库的链接、描述与摘要、主题、标签等高亮文字
 */
const TEXT_SELECTOR = [
  '.search-title a',
  '[class*="RepositoryContext"] a',
  ':is([class^="Content__"], [class*=" Content__"])',
  'a[href^="/topics/"]',
  '.search-match'
].join(', ')

/**
 * 结果的增删与替换：React 换页、加载更多时插入新的结果元素；复用元素时链接的 href 随结果改变。
 * 不看 style：隐藏、显示改的是 style，不重复触发
 */
const OBSERVE_OPTIONS: MutationObserverInit = {
  childList: true,
  subtree: true,
  attributes: true,
  attributeFilter: ['href']
}

/** 隐藏前的行内 display，显示时还原 */
interface DisplayStyle {
  readonly value: string
  readonly priority: string
}

/** 所有者、存储库取自标题行中第一个指向用户、存储库的链接：存储库结果的名称，议题、代码等结果的所属存储库，用户结果的用户名 */
function describeResult(item: Element, origin: string): SearchResultInfo {
  const header = item.querySelector('h3') ?? item
  let owner: string | undefined
  let repo: string | undefined
  for (const link of header.querySelectorAll<HTMLAnchorElement>('a[href]')) {
    let url: URL
    try {
      url = new URL(link.href)
    } catch {
      continue
    }
    const path = url.origin === origin ? ownerOfPath(url.pathname) : undefined
    if (!path) continue
    owner = path.owner
    repo = path.name === undefined ? undefined : `${path.owner}/${path.name}`
    break
  }
  const text = Array.from(item.querySelectorAll(TEXT_SELECTOR), element => element.textContent ?? '').join('\n')
  return { owner, repo, text }
}

/** 在搜索结果页时为页面的 origin */
function searchOrigin(doc: Document): string | undefined {
  const location = doc.defaultView?.location
  return location && pageSite(location).kind === 'github' && location.pathname === SEARCH_PATH ? location.origin : undefined
}

export function createSearchPurifier(doc: Document, options: SearchPurifierOptions): SearchPurifier {
  const hidden = new Map<HTMLElement, DisplayStyle>()

  /** 已隐藏的也检查：页面改回了 display 时再隐藏 */
  function hide(item: HTMLElement): void {
    const { style } = item
    if (!hidden.has(item)) {
      hidden.set(item, { value: style.getPropertyValue('display'), priority: style.getPropertyPriority('display') })
    }
    if (style.getPropertyValue('display') !== 'none' || style.getPropertyPriority('display') !== 'important') {
      style.setProperty('display', 'none', 'important')
    }
  }

  function show(item: HTMLElement, saved: DisplayStyle): void {
    hidden.delete(item)
    if (saved.value === '') item.style.removeProperty('display')
    else item.style.setProperty('display', saved.value, saved.priority)
  }

  function showAll(): void {
    for (const [item, saved] of hidden) show(item, saved)
  }

  function scan(): void {
    for (const item of hidden.keys()) {
      if (!item.isConnected) hidden.delete(item)
    }
    const origin = searchOrigin(doc)
    const rules = options.rules()
    if (origin === undefined || !options.active() || isEmptyBlockList(rules)) {
      showAll()
      return
    }
    for (const list of doc.querySelectorAll(RESULTS_SELECTOR)) {
      for (const item of list.children) {
        if (!(item instanceof HTMLElement)) continue
        const saved = hidden.get(item)
        if (isBlockedResult(describeResult(item, origin), rules)) hide(item)
        else if (saved) show(item, saved)
      }
    }
  }

  const observer = new MutationObserver(scan)
  observer.observe(doc, OBSERVE_OPTIONS)
  scan()

  return {
    refresh: scan,
    stop() {
      observer.disconnect()
      showAll()
    }
  }
}
