/** 按钮样式：默认、主要（绿底）、危险（红字，悬停红底）、透明（无边框，悬停才有底色，用于标题栏的图标按钮） */
export type UiButtonVariant = 'default' | 'primary' | 'danger' | 'invisible'

/** 按钮尺寸：sm 28px（弹出页、工具栏），md 32px */
export type UiButtonSize = 'sm' | 'md'

/** 提示条：成功（绿色勾）、失败（红色叉） */
export type UiToastTone = 'success' | 'danger'

/** 标签页 */
export interface UiTab {
  /** 标识：也是对应面板的插槽名 */
  readonly value: string
  readonly label: string
  /** 标签后的计数（如分类中的条数）；不给时不显示 */
  readonly count?: number
}

/** 下拉框选项 */
export interface UiSelectOption {
  readonly value: string
  readonly label: string
  /** 选项文字的语言（如用各自语言书写的语言名）；不标时随页面 */
  readonly lang?: string
}
