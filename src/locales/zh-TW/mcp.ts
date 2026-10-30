import type { PageDictionary } from '../../core/types'

/**
 * MCP 服务器目录（/mcp）与服务器详情页（/mcp/<所有者>/<服务器>）。
 * 服务器名称、所有者、描述、README、存储库链接是第三方内容，用 ignore 排除；README 由全局 .markdown-body 规则忽略。
 * 徽标的 alt（「<名称> logo」）不是可翻译属性（core/ignore 的 TRANSLATABLE_ATTRIBUTES），引擎不碰。
 * 页头面包屑「MCP Registry」、未登录时详情页顶部面包屑「MCP registry」、「Search results」「Install」「Previous / Next」
 * 「Page N」「Suggestions」「About」「Resources」「Contact support」、屏幕阅读器通知「N result(s)」由 common 收录。
 * registry 作「登錄庫」，与 common 的「MCP 登錄庫」一致。
 */
export default {
  static: {
    // 目录页头与搜索框（文字、aria-label、placeholder）
    'Connect models to the real world': '將模型連接到真實世界',
    // 原文的逗号都是并列项的逗号，译文只用顿号
    'Servers and tools from the community that connect models to files, APIs, databases, and more.':
      '社群提供的伺服器和工具可將模型連接到檔案、API、資料庫等。',
    'Search MCP registry': '搜尋 MCP 登錄庫',
    'Search MCPs': '搜尋 MCP',
    'All MCP servers': '所有 MCP 伺服器',
    'MCP registry pagination': 'MCP 登錄庫分頁',
    // 安装按钮（详情页）与安装菜单项（@github-ui/mcp-install-button，单击后渲染；卡片上的 Install 由 common-ui 收录）
    'Install MCP server': '安裝 MCP 伺服器',
    'Install in VS Code': '在 VS Code 中安裝',
    'Install in VS Code Insiders': '在 VS Code Insiders 中安裝',
    'Install in GitHub Copilot app': '在 GitHub Copilot 應用程式中安裝',
  },
  scoped: {
    // 卡片页脚与详情页「关于」块：By <所有者>（与 Marketplace 一致）
    By: '來自',
    // 目录页标签页标题「MCP Registry · Connect Agents to tools」的第二段
    'Connect Agents to tools': '將代理連接到工具',
  },
  regexp: [
    // 详情页标签页标题「MCP Registry | <服务器名>」只有一段：服务器名保持原文
    [/^MCP Registry \| (.+)$/, 'MCP 登錄庫 | $1'],
    // 搜索无结果：No MCPs found matching "<查询>". Try a different search term.
    // （查询词与前后文是相邻文本节点，引擎先整组匹配；屏幕阅读器通知同一句）
    [/^No MCPs found matching "(.+)"\. Try a different search term\.$/, '找不到與「$1」相符的 MCP。嘗試其他搜尋字詞。'],
    // 屏幕阅读器通知：648 MCPs available.、1 MCP available.（「648 results / 1 result」由 common-ui/counts.ts 覆盖）
    [/^(\d+) MCPs? available\.$/, '有 $1 個 MCP 可用。'],
  ],
  ignore: [
    // 面包屑第二项：服务器名（登录后在页头，未登录时在详情页顶部；首项「MCP Registry」/「MCP registry」照常翻译）
    '[data-component="Breadcrumbs"] li + li > [data-component="Breadcrumbs.Item"]',
    // 目录卡片：服务器名链接、描述、所有者（「By」照常翻译）
    '[class*="card__"] a[href^="/mcp/"]',
    '[class*="card__"] p[class*="description__"]',
    'p[class*="footerOwner__"] > span',
    // 详情页「关于」块：服务器名（subheading__ 段落含「By」，照常翻译）、所有者链接、描述
    '[class*="about__"] > p[class*="heading__"]:not([class*="subheading__"])',
    'a[class*="ownerLink__"]',
    '[class*="about__"] > p[class*="description__"]',
    // 详情页侧栏「资源」：存储库「所有者 / 名称」链接（「Contact support」是外链，照常翻译）
    '[class*="resourceLinks__"] a[href^="/"]',
  ],
} satisfies PageDictionary
