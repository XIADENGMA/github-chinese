import type { PageDictionary } from '../../core/types'
import { mergeDictionaries } from './helpers'
import list from './codespaces/list'
import repoRules from './codespaces/repo-rules'
import repoTab from './codespaces/repo-tab'

/**
 * 代码空间页（列表、模板、新建表单、启动页）+ 存储库 Code 下拉框的代码空间标签页。
 * 产品名按 product-names.md 译成中文：codespace(s) / Codespaces → 代码空间，GitHub Codespaces → GitHub 代码空间。
 * repo-tab 的 static 全局生效；repo-rules 的正则需由存储库类词典合并才能在存储库页生效。
 */
export default mergeDictionaries(list, repoTab, repoRules) satisfies PageDictionary
