import type { PageDictionary } from '../../core/types'
import { mergeDictionaries } from './helpers'
import editorHelp from './wiki/editor-help'
import pages from './wiki/pages'

/**
 * Wiki：页面查看、侧栏、页面列表、历史与比较、新建与编辑（pages），编辑器工具栏与标记语言帮助（editor-help）。
 * 页面类型 wiki 覆盖 /<owner>/<repo>/wiki…。
 */
export default mergeDictionaries(pages, editorHelp) satisfies PageDictionary
