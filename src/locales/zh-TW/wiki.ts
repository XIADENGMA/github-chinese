import type { PageDictionary } from '../../core/types'
import { mergeDictionaries } from './helpers'
import editorHelp from './wiki/editor-help'
import pages from './wiki/pages'

/**
 * Wiki：页面查看、侧边栏、页面清单、历史记录与比较、新增与编辑（pages），编辑器工具列与标记语言说明（editor-help）。
 * 页面类型 wiki 覆盖 /<owner>/<repo>/wiki…。
 */
export default mergeDictionaries(pages, editorHelp) satisfies PageDictionary
