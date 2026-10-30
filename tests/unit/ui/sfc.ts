/**
 * 动态导入 .vue 组件。
 * 项目 vitest.config.ts 未加载 @vitejs/plugin-vue 时 .vue 无法编译：返回 undefined，组件用例跳过。
 * 其他导入错误照常抛出。
 */
export async function importSfc<T>(load: () => Promise<{ default: T }>): Promise<T | undefined> {
  try {
    return (await load()).default
  } catch (error) {
    if (error instanceof Error && error.message.includes('@vitejs/plugin-vue')) return undefined
    throw error
  }
}

/** 取已导入的组件；未导入时抛错（仅在 skipIf 保护的用例内调用） */
export function required<T>(component: T | undefined): T {
  if (component === undefined) throw new Error('需要 @vitejs/plugin-vue')
  return component
}
