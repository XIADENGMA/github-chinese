import { describe, expect, it, vi } from 'vitest'
import { childTexts, isRunNode, isTextNode, textRun, titleElement } from '../../../src/core/dom'
import { CONTESTED, createRecordStore, FIGHT_LIMIT, FIGHT_WINDOW_MS } from '../../../src/core/records'
import { TITLE_SEPARATOR, translateTitleText } from '../../../src/core/title'

function fragment(html: string): HTMLElement {
  const host = document.createElement('div')
  host.innerHTML = html
  return host
}

describe('textRun', () => {
  it('收集同一父节点下只隔注释的连续文本', () => {
    const host = fragment('a<!-- -->b<!--x-->c<b>d</b>e<!-- -->')
    const [a, , b, , c, bold, e, comment] = [...host.childNodes]
    expect(textRun(b!).map(node => node.data)).toEqual(['a', 'b', 'c'])
    expect(textRun(a!)).toEqual(textRun(c!))
    expect(textRun(e!).map(node => node.data)).toEqual(['e'])
    expect(textRun(comment!).map(node => node.data)).toEqual(['e'])
    expect(textRun(bold!.firstChild!).map(node => node.data)).toEqual(['d'])
  })

  it('只有注释时为空', () => {
    const host = fragment('<!--a--><!--b-->')
    expect(textRun(host.firstChild!)).toEqual([])
  })

  it('节点类型判断', () => {
    const host = fragment('a<!--b--><i></i>')
    expect(isTextNode(host.childNodes[0])).toBe(true)
    expect(isRunNode(host.childNodes[1])).toBe(true)
    expect(isRunNode(host.childNodes[2])).toBe(false)
    expect(isTextNode(null)).toBe(false)
  })

  it('childTexts 只取直接子文本', () => {
    const host = fragment('a<b>x</b>c')
    expect(childTexts(host).map(node => node.data)).toEqual(['a', 'c'])
  })
})

describe('titleElement', () => {
  it('跳过 SVG 内的 title', () => {
    document.body.innerHTML = '<svg><title>icon</title></svg>'
    document.head.innerHTML = ''
    expect(titleElement(document)).toBeNull()
    document.head.innerHTML = '<title>Page</title>'
    expect(titleElement(document)?.textContent).toBe('Page')
    document.head.innerHTML = ''
    document.body.innerHTML = ''
  })
})

describe('translateTitleText', () => {
  const dictionary: Record<string, string> = { Issues: '议题', 'Pull requests': '拉取请求' }
  const translate = (text: string): string | undefined => dictionary[text]

  it('逐段翻译，未命中段保持原样', () => {
    expect(translateTitleText('Issues · vuejs/core', translate)).toBe('议题 · vuejs/core')
    expect(translateTitleText(`Pull requests${TITLE_SEPARATOR}Issues`, translate)).toBe('拉取请求 · 议题')
    expect(translateTitleText('GitHub', translate)).toBe('GitHub')
  })

  it('段内空白规范化后匹配，空段保持', () => {
    expect(translateTitleText('  Pull   requests · ', translate)).toBe('拉取请求 · ')
  })
})

describe('translateTitleText：用户内容段', () => {
  const dictionary: Record<string, string> = {
    Issues: '议题',
    Documentation: '文档',
    Settings: '设置',
    Home: '首页',
    Pages: '页面',
    Release: '发布',
    'All workflows': '所有工作流',
    'Issue #11': '议题 #11',
    Rulesets: '规则集',
    Ruleset: '规则集',
    'GitHub Topics': 'GitHub 主题',
    Forks: '复刻',
    Revisions: '修订',
    Stargazers: '标星者',
    Discussions: '讨论',
    Webhooks: 'Webhook',
    Search: '搜索'
  }
  const translate = (text: string): string | undefined =>
    dictionary[text] ?? /^(Issue|Pull Request|Discussion) #(\d+)$/.exec(text)?.[0].replace(/^Issue/, '议题')
  const title = (text: string, pathname = '/o/r'): string => translateTitleText(text, translate, pathname)

  it('内容标记段之前的段（议题、拉取请求、讨论标题，提交信息）不翻译', () => {
    expect(title('Documentation · Issue #12 · o/r')).toBe('Documentation · 议题 #12 · o/r')
    expect(title('Settings by octocat · Pull Request #3 · o/r')).toBe('Settings by octocat · Pull Request #3 · o/r')
    expect(title('Settings · o/r · Discussion #5')).toBe('Settings · o/r · Discussion #5')
    expect(title('Settings · o/r@abc1234 · GitHub')).toBe('Settings · o/r@abc1234 · GitHub')
  })

  it('取最右边的内容标记：标题本身形如「Issue #11」时也不翻译', () => {
    expect(title('Issue #11 · Issue #12 · o/r')).toBe('Issue #11 · 议题 #12 · o/r')
    expect(title('Home · Settings · Issue #12 · o/r')).toBe('Home · Settings · 议题 #12 · o/r')
  })

  it('Wiki 页面名不翻译；下划线开头的功能页照常', () => {
    expect(title('Home · o/r Wiki', '/o/r/wiki')).toBe('Home · o/r Wiki')
    expect(title('Home · o/r Wiki · GitHub', '/o/r/wiki/Home')).toBe('Home · o/r Wiki · GitHub')
    expect(title('Home · o/r Wiki', `/o/r/wiki/Home/${'a'.repeat(40)}`)).toBe('Home · o/r Wiki')
    expect(title('Home · Settings · o/r Wiki', '/o/r/wiki/Home')).toBe('Home · Settings · o/r Wiki')
    expect(title('Pages · o/r Wiki', '/o/r/wiki/_pages')).toBe('页面 · o/r Wiki')
    expect(title('Home · o/r Wiki', '/o/r/wiki/Home/_history')).toBe('首页 · o/r Wiki')
    expect(title('Home · o/r Wiki', '/o/r/issues')).toBe('首页 · o/r Wiki')
  })

  it('工作流页的工作流名不翻译；其他 Actions 页照常', () => {
    expect(title('Release · GitHub', '/o/r/actions/workflows/release.yml')).toBe('Release · GitHub')
    expect(title('Release', '/o/r/actions/workflows/release.yml')).toBe('Release')
    // 工作流名含分段符：站点名段之前都是工作流名
    expect(title('Sample · Release · GitHub', '/o/r/actions/workflows/release.yml')).toBe('Sample · Release · GitHub')
    expect(title('Sample · Release', '/o/r/actions/workflows/release.yml')).toBe('Sample · Release')
    expect(title('All workflows · GitHub', '/o/r/actions')).toBe('所有工作流 · GitHub')
  })

  it('仓库首页的描述不翻译：可带「GitHub - 」前缀，不区分大小写；其他页照常', () => {
    expect(title('GitHub - o/r: Sample text · Documentation · Home · GitHub', '/o/r')).toBe(
      'GitHub - o/r: Sample text · Documentation · Home · GitHub'
    )
    expect(title('o/r: Sample text · Documentation · Home', '/o/r')).toBe('o/r: Sample text · Documentation · Home')
    expect(title('GitHub - O/R: Sample text · Documentation · GitHub', '/o/r/')).toBe('GitHub - O/R: Sample text · Documentation · GitHub')
    expect(title('o/r: Sample text · Documentation', '/O/R')).toBe('o/r: Sample text · Documentation')
    // 不是仓库首页，或首段不以「owner/repo:」开头
    expect(title('o/r: Sample text · Documentation', '/o/r/issues')).toBe('o/r: Sample text · 文档')
    expect(title('o/x: Sample text · Documentation', '/o/r')).toBe('o/x: Sample text · 文档')
    expect(title('o/r Sample text · Documentation', '/o/r')).toBe('o/r Sample text · 文档')
    expect(title('Documentation · GitHub', '/o/r')).toBe('文档 · GitHub')
    // 站点页面
    expect(title('settings/profile: Sample text · Documentation', '/settings/profile')).toBe('settings/profile: Sample text · 文档')
  })

  it('与地址中账号同名的段（登录名）不翻译；站点页面照常', () => {
    expect(title('Documentation · GitHub', '/documentation')).toBe('Documentation · GitHub')
    expect(title('Documentation · GitHub', '/Documentation')).toBe('Documentation · GitHub')
    expect(title('Issues · Documentation', '/orgs/documentation/discussions')).toBe('议题 · Documentation')
    expect(title('Documentation · Issues', '/users/documentation/projects')).toBe('Documentation · 议题')
    expect(title('Documentation · o/r', '/o/r')).toBe('文档 · o/r')
    expect(title('Settings · GitHub', '/settings')).toBe('设置 · GitHub')
    expect(title('Issues · GitHub', '/issues')).toBe('议题 · GitHub')
  })

  it('规则集页的仓库名段、主题页的主题名段不翻译', () => {
    expect(title('Settings · Rulesets · documentation', '/o/documentation/settings/rules')).toBe('设置 · 规则集 · documentation')
    expect(title('Settings · Ruleset · Documentation', '/o/Documentation/settings/rules/1')).toBe('设置 · 规则集 · Documentation')
    expect(title('Rulesets · documentation · GitHub', '/o/documentation/rules')).toBe('规则集 · documentation · GitHub')
    expect(title('Rulesets · documentation', '/o/documentation/rules/1')).toBe('规则集 · documentation')
    expect(title('Rulesets · 文档 · GitHub', '/o/%E6%96%87%E6%A1%A3/rules')).toBe('规则集 · 文档 · GitHub')
    // 只认站点名段之前的末段：首段、中间的界面名与仓库名同名也照常翻译
    expect(title('Rulesets · rulesets · GitHub', '/o/rulesets/rules')).toBe('规则集 · rulesets · GitHub')
    expect(title('Settings · Rulesets · rulesets', '/o/rulesets/settings/rules')).toBe('设置 · 规则集 · rulesets')
    // 其他仓库页：与仓库名同名的界面段照常翻译
    expect(title('Issues · o/issues', '/o/issues/issues')).toBe('议题 · o/issues')
    expect(title('o/discussions · Discussions · GitHub', '/o/discussions/discussions')).toBe('o/discussions · 讨论 · GitHub')
    expect(title('Webhooks · Settings · o/settings', '/o/settings/settings/hooks')).toBe('Webhook · 设置 · o/settings')
    expect(title('Documentation · GitHub Topics · GitHub', '/topics/documentation')).toBe('Documentation · GitHub 主题 · GitHub')
    expect(title('GitHub Topics · GitHub', '/topics')).toBe('GitHub 主题 · GitHub')
    expect(title('Documentation · GitHub Topics · GitHub', '/topics/vue')).toBe('文档 · GitHub 主题 · GitHub')
  })

  it('单个 gist 页的 gist 名不翻译；子页名与站点名段照常', () => {
    const gist = (text: string, pathname: string): string => translateTitleText(text, translate, pathname, 'gist.github.com')
    const id = '0123456789abcdef0123'
    expect(gist('Documentation · GitHub', `/octocat/${id}`)).toBe('Documentation · GitHub')
    expect(gist('Documentation · GitHub', `/${id}`)).toBe('Documentation · GitHub')
    expect(gist('Forks · Documentation · GitHub', `/octocat/${id}/forks`)).toBe('复刻 · Documentation · GitHub')
    expect(gist('Forks · Documentation · GitHub', `/${id}/forks`)).toBe('复刻 · Documentation · GitHub')
    expect(gist('Revisions · Settings · Home · GitHub', `/octocat/${id}/revisions`)).toBe('修订 · Settings · Home · GitHub')
    expect(gist('Stargazers · Settings · GitHub', `/octocat/${id}/stargazers`)).toBe('标星者 · Settings · GitHub')
    expect(gist('Settings · Home · GitHub', `/octocat/${id}`)).toBe('Settings · Home · GitHub')
    // 旧式数字编号
    expect(gist('Documentation · GitHub', '/octocat/1')).toBe('Documentation · GitHub')
    expect(gist('Forks · Documentation · GitHub', '/octocat/1/forks')).toBe('复刻 · Documentation · GitHub')
    // 没有站点名段
    expect(gist('Documentation', `/octocat/${id}`)).toBe('Documentation')
    expect(gist('Forks · Documentation', `/octocat/${id}/forks`)).toBe('复刻 · Documentation')
    // 纯数字登录名：首段不是 gist 编号
    expect(gist('Documentation · GitHub', `/1234567/${id}`)).toBe('Documentation · GitHub')
    expect(gist('Forks · Documentation · GitHub', `/1234567/${id}/forks`)).toBe('复刻 · Documentation · GitHub')
    expect(gist('Revisions · Documentation · GitHub', `/1234567/${id}/revisions`)).toBe('修订 · Documentation · GitHub')
    expect(gist('Stargazers · Documentation · GitHub', `/1234567/${id}/stargazers`)).toBe('标星者 · Documentation · GitHub')
    // 不是单个 gist 页照常翻译
    expect(gist('Settings · GitHub', '/discover')).toBe('设置 · GitHub')
    expect(gist('Settings · GitHub', '/octocat')).toBe('设置 · GitHub')
    expect(gist('Settings · GitHub', '/1234567')).toBe('设置 · GitHub')
    expect(gist('Settings · GitHub', '/1234567/starred')).toBe('设置 · GitHub')
    // 搜索页：查询词不翻译（可能含分段符），首段与站点名段照常
    expect(gist('Search · Settings · GitHub', '/search')).toBe('搜索 · Settings · GitHub')
    expect(gist('Search · Settings', '/search')).toBe('搜索 · Settings')
    expect(gist('Search · Home · Settings · GitHub', '/search')).toBe('搜索 · Home · Settings · GitHub')
    expect(gist('Search · GitHub', '/search')).toBe('搜索 · GitHub')
    expect(title('Search · Settings · GitHub', '/search')).toBe('搜索 · 设置 · GitHub')
    // github.com 同形路径不受影响
    expect(title('Forks · Documentation', `/octocat/${id}/forks`)).toBe('复刻 · 文档')
  })

  it('企业版站点的代码片段（gist 子域名、主站的 /gist 下）：同 gist.github.com；主站的页面同 github.com', () => {
    const id = '0123456789abcdef0123'
    const on = (text: string, pathname: string, hostname: string): string => translateTitleText(text, translate, pathname, hostname)
    expect(on('Documentation · GitHub', `/octocat/${id}`, 'gist.github.example.com')).toBe('Documentation · GitHub')
    expect(on('Forks · Documentation · GitHub', `/gist/octocat/${id}/forks`, 'github.example.com')).toBe('复刻 · Documentation · GitHub')
    expect(on('Settings · GitHub', '/gist/discover', 'github.example.com')).toBe('设置 · GitHub')
    expect(on('Forks · Documentation', `/octocat/${id}/forks`, 'github.example.com')).toBe('复刻 · 文档')
  })

  it('没有内容标记的标题照常逐段翻译；不传路径时同样处理内容标记', () => {
    expect(title('Issues · o/r')).toBe('议题 · o/r')
    expect(translateTitleText('Settings · Issue #1 · o/r', translate)).toBe('Settings · 议题 #1 · o/r')
  })
})

describe('createRecordStore', () => {
  it('区分自身写入、外部改写与改回原文', () => {
    const records = createRecordStore(() => 0)
    const node = document.createTextNode('Issues')
    expect(records.textSource(node)).toBe('Issues')
    records.writeText(node, 'Issues', '议题')
    expect(records.ownText(node)).toBe(true)
    expect(records.hasText(node)).toBe(true)
    expect(records.textSource(node)).toBe('Issues')
    node.data = 'Search'
    expect(records.ownText(node)).toBe(false)
    expect(records.textSource(node)).toBe('Search')
    expect(records.hasText(node)).toBe(false)
  })

  it('期望值等于原文时清除记录；还原只还原自身写入', () => {
    const records = createRecordStore(() => 0)
    const node = document.createTextNode('Issues')
    records.writeText(node, 'Issues', '议题')
    records.writeText(node, 'Issues', 'Issues')
    expect(node.data).toBe('Issues')
    expect(records.hasText(node)).toBe(false)
    records.writeText(node, 'Issues', '议题')
    node.data = 'Changed'
    records.restoreText(node)
    expect(node.data).toBe('Changed')
    records.restoreText(node)
  })

  it('窗口内反复改回原文超过上限返回 CONTESTED，窗口过后恢复', () => {
    let now = 1000
    const records = createRecordStore(() => now)
    const node = document.createTextNode('Issues')
    records.writeText(node, 'Issues', '议题')
    for (let i = 0; i < FIGHT_LIMIT; i++) {
      node.data = 'Issues'
      expect(records.textSource(node)).toBe('Issues')
      records.writeText(node, 'Issues', '议题')
    }
    node.data = 'Issues'
    expect(records.textSource(node)).toBe(CONTESTED)
    now += FIGHT_WINDOW_MS + 1
    expect(records.textSource(node)).toBe('Issues')
  })

  it('peekText 只读：自身写入时返回原文，否则返回当前文字；不计改回次数', () => {
    const records = createRecordStore(() => 0)
    const node = document.createTextNode('Issues')
    expect(records.peekText(node)).toBe('Issues')
    records.writeText(node, 'Issues', '议题')
    expect(records.peekText(node)).toBe('Issues')
    node.data = 'Issues'
    for (let i = 0; i <= FIGHT_LIMIT; i++) expect(records.peekText(node)).toBe('Issues')
    expect(records.textSource(node)).toBe('Issues')
    node.data = 'Changed'
    expect(records.peekText(node)).toBe('Changed')
    expect(records.hasText(node)).toBe(true)
  })

  it('属性：原本不存在的属性还原时移除', () => {
    const records = createRecordStore(() => 0)
    const element = document.createElement('relative-time')
    expect(records.attributeSource(element, 'lang', null)).toBeNull()
    records.writeAttribute(element, 'lang', null, null, 'zh-CN')
    expect(element.getAttribute('lang')).toBe('zh-CN')
    expect(records.ownAttribute(element, 'lang', 'zh-CN')).toBe(true)
    expect(records.attributeSource(element, 'lang', 'zh-CN')).toBeNull()
    expect(records.translatedAttributes(element)).toBe(1)
    records.restoreAttributes(element)
    expect(element.hasAttribute('lang')).toBe(false)
    expect(records.translatedAttributes(element)).toBe(0)
  })

  it('属性：外部改写、移除、按名称还原', () => {
    const records = createRecordStore(() => 0)
    const element = document.createElement('button')
    element.setAttribute('title', 'Close')
    element.setAttribute('aria-label', 'Copy')
    records.writeAttribute(element, 'title', 'Close', 'Close', '关闭')
    records.writeAttribute(element, 'aria-label', 'Copy', 'Copy', '复制')
    records.restoreAttributes(element, ['title'])
    expect(element.getAttribute('title')).toBe('Close')
    expect(element.getAttribute('aria-label')).toBe('复制')
    element.setAttribute('aria-label', 'Copied!')
    expect(records.attributeSource(element, 'aria-label', 'Copied!')).toBe('Copied!')
    records.writeAttribute(element, 'aria-label', 'Copied!', 'Copied!', null)
    expect(element.hasAttribute('aria-label')).toBe(false)
    records.restoreAttributes(element)
  })

  it('属性改回原文计数与 CONTESTED', () => {
    const records = createRecordStore(vi.fn(() => 5))
    const element = document.createElement('button')
    element.setAttribute('title', 'Close')
    records.writeAttribute(element, 'title', 'Close', 'Close', '关闭')
    for (let i = 0; i < FIGHT_LIMIT; i++) {
      element.setAttribute('title', 'Close')
      expect(records.attributeSource(element, 'title', 'Close')).toBe('Close')
      records.writeAttribute(element, 'title', 'Close', 'Close', '关闭')
    }
    expect(records.attributeSource(element, 'title', 'Close')).toBe(CONTESTED)
  })

  it('clear 丢弃全部记录', () => {
    const records = createRecordStore(() => 0)
    const node = document.createTextNode('Issues')
    records.writeText(node, 'Issues', '议题')
    records.clear()
    expect(records.hasText(node)).toBe(false)
    expect(records.textSource(node)).toBe('议题')
  })
})
