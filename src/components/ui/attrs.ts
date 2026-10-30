/** 外层（class、style：布局与宽度）与原生控件（id、aria-*、data-test、事件等其余属性）各自的属性 */
export interface SplitAttrs {
  readonly root: Record<string, unknown>
  readonly field: Record<string, unknown>
}

/** 有外层包装的控件（下拉框、输入框）拆分透传属性；在渲染时调用（useAttrs() 不是响应式的，不能放进 computed） */
export function splitAttrs(attrs: Record<string, unknown>): SplitAttrs {
  const { class: className, style, ...field } = attrs
  return { root: { class: className, style }, field }
}
