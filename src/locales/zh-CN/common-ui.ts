import type { PageDictionary } from '../../core/types'
import actions from './common-ui/actions'
import comments from './common-ui/comments'
import counts from './common-ui/counts'
import editor from './common-ui/editor'
import hovercards from './common-ui/hovercards'
import labels from './common-ui/labels'
import messages from './common-ui/messages'
import status from './common-ui/status'
import time from './common-ui/time'
import validation from './common-ui/validation'
import { mergeDictionaries } from './helpers'

/**
 * 通用组件（全站生效）：按钮与菜单、加载与出错提示、状态徽章、时间日期、计数、评论编辑器、评论与反应、悬停卡片、表单校验错误、
 * 标签令牌所在控件的无障碍名称。
 * 站点头部页脚、全局导航、命令面板、错误页由 common.ts 收录。
 */
export default mergeDictionaries(
  actions,
  messages,
  status,
  time,
  counts,
  editor,
  comments,
  hovercards,
  validation,
  labels
) satisfies PageDictionary
