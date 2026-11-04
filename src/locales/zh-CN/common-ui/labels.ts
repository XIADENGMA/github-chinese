import type { PageDictionary } from '../../../core/types'
import {
  archivedLabelName,
  ECOSYSTEM_DESCRIPTION,
  LABEL_DESCRIPTION_SOURCE,
  LABEL_NAME_SOURCE,
  labelDescription,
  labelName,
  labelTokenName
} from '../issues/labels'
import { joinName } from '../issues/list'

/**
 * 标签令牌所在控件的无障碍名称（全站）：默认标签名与说明和令牌、说明提示里显示的译文一致（名称表、说明表见 issues/labels.ts）；
 * 自定义标签名保持原文。选择器不依赖被改写的 aria-label。
 * 另有标签区域外的 Dependabot 生态说明（标签选择器、拉取请求侧栏令牌的 title 等），与 static 里的默认说明一样全站生效
 */
export default {
  regexp: [ECOSYSTEM_DESCRIPTION],
  attributeRules: [
    // 议题、拉取请求列表里的标签筛选按钮（按钮里是标签令牌）：同 issues/list.ts 的 Filter by label 规则
    [
      'button[class*="filterLink__"]',
      'aria-label',
      new RegExp(`^Filter by label (${LABEL_NAME_SOURCE})$`),
      (_, name: string) => joinName(joinName('按标签', labelName(name)), '筛选')
    ],
    // 项目卡片上的标签令牌（按钮本身是令牌）：Label: 加标签名，已存档的标签名前加 Archived；自定义标签名保持原文
    [
      'button[class*="prc-Token-IssueLabel-"]',
      'aria-label',
      /^Label: (?:(Archived) )?(.+)$/,
      (_, archived: string, name: string) => `标签：${archivedLabelName(archived, name)}`
    ],
    // 可删除的标签令牌旁的删除按钮（移除中按钮禁用，名称写在 aria-label 上；常态的名称取自提示文字，见 issues/metadata.ts）：
    // 同 issues/metadata.ts 的 Remove label: 规则；已存档的标签名前加 Archived
    [
      'button',
      'aria-label',
      new RegExp(`^Remove label: (?:(Archived) )?(${LABEL_NAME_SOURCE})$`),
      (_, archived: string, name: string) => `删除标签：${archivedLabelName(archived, name)}`
    ],
    // 新建、编辑标签对话框的预览令牌（令牌本身带 aria-label，值是令牌里显示的名称）：与令牌同译，自定义名称保持原文
    // （命中后不再查词典：与词条同形的自定义名称不译）
    ['span[class*="prc-Token-IssueLabel-"]', 'aria-label', /^(.+)$/, (_, text: string) => labelTokenName(text)],
    // 议题侧栏标签链接后的说明提示（忽略区域根）：无障碍名称是说明，默认说明与提示里的文字同译
    [
      '[class*="labelDescriptionTooltip__"]',
      'aria-label',
      new RegExp(`^(${LABEL_DESCRIPTION_SOURCE})$`),
      (_, description: string) => labelDescription(description)
    ],
    ['[class*="labelDescriptionTooltip__"]', 'aria-label', ...ECOSYSTEM_DESCRIPTION]
  ]
} satisfies PageDictionary
