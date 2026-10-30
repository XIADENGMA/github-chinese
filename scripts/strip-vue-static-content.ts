/**
 * 构建时去掉 Vue 运行时（@vue/runtime-dom）按 HTML 字符串插入静态内容的代码：insertStaticContent 把模板编译时
 * 字符串化的静态片段写进 innerHTML 解析，AMO 的代码检查（addons-linter）报为不安全的 innerHTML 赋值。
 * 模板编译关闭静态提升（VUE_COMPILER_OPTIONS），不生成字符串化的静态片段，这段代码执行不到，改成抛错。
 * Vue 升级后找不到原代码（或不止一处）时构建报错，按新版本重新核对。
 * 插件挂在 wxt.config.ts 的 vite 配置上；vitest 不经过这一步，模板编译选项相同。
 */
import MagicString, { type SourceMap } from 'magic-string'
import type { Plugin } from 'vite'

/** 模板编译选项：关闭静态提升，编译器随之不做静态片段字符串化（见 @vue/compiler-core 的 cacheStatic） */
export const VUE_COMPILER_OPTIONS = { hoistStatic: false } as const

/** insertStaticContent 里解析 HTML 的语句（实参里没有分号） */
const STATIC_HTML_RE = /templateContainer\.innerHTML = unsafeToTrustedHTML\([^;]*\);/g

/** 换上的语句：执行到即说明编译选项没生效 */
const DISABLED_STATEMENT = 'throw new Error("insertStaticContent 已停用：模板须以 hoistStatic: false 编译");'

/** Vue 运行时的 DOM 渲染模块（vue 包的 esm-bundler 构建导入它） */
const RUNTIME_DOM_RE = /[\\/]@vue[\\/]runtime-dom[\\/]dist[\\/]runtime-dom\.esm-bundler\.js(?:\?|$)/

export interface StrippedModule {
  readonly code: string
  readonly map: SourceMap
}

/** 把唯一一处 innerHTML 解析换成抛错；没有或不止一处时报错 */
export function stripStaticContent(code: string, file = 'runtime-dom.esm-bundler.js'): StrippedModule {
  const matches = [...code.matchAll(STATIC_HTML_RE)]
  if (matches.length !== 1) {
    throw new Error(`${file}：静态内容的 innerHTML 解析应恰有 1 处，实有 ${matches.length} 处，按当前 Vue 版本核对`)
  }
  const [match] = matches as [RegExpExecArray]
  const result = new MagicString(code)
  result.overwrite(match.index, match.index + match[0].length, DISABLED_STATEMENT)
  return { code: result.toString(), map: result.generateMap({ hires: true, source: file }) }
}

export function stripVueStaticContentPlugin(): Plugin {
  return {
    name: 'github-chinese:strip-vue-static-content',
    transform: {
      filter: { id: RUNTIME_DOM_RE },
      handler(code, id) {
        return stripStaticContent(code, id.split('?', 1)[0])
      },
    },
  }
}
