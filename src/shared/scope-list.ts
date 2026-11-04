/** 范围列表（新标签页打开、自动加载的范围）的读取与开关：列表按 all 的顺序，不含未知项与重复项 */

/** 读取存储中的范围：不是数组时用 fallback；丢弃未知项，去重，按 all 的顺序 */
export function sanitizeScopes<T extends string>(all: readonly T[], value: unknown, fallback: readonly T[]): readonly T[] {
  if (!Array.isArray(value)) return fallback
  return all.filter(scope => value.includes(scope))
}

/** 开关一个范围，返回新的范围列表（按 all 的顺序） */
export function toggleScope<T extends string>(all: readonly T[], scopes: readonly T[], scope: T, on: boolean): readonly T[] {
  return all.filter(item => (item === scope ? on : scopes.includes(item)))
}
