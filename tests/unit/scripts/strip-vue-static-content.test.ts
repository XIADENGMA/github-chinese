import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { describe, expect, it } from 'vitest'
import { stripStaticContent, VUE_COMPILER_OPTIONS } from '../../../scripts/strip-vue-static-content'

/** 当前安装的 Vue 运行时（vue 包的 esm-bundler 构建导入的那份） */
function runtimeDomSource(): string {
  const require = createRequire(import.meta.url)
  const entry = require.resolve('@vue/runtime-dom/package.json', { paths: [require.resolve('vue/package.json')] })
  return readFileSync(entry.replace(/package\.json$/, 'dist/runtime-dom.esm-bundler.js'), 'utf8')
}

describe('strip-vue-static-content', () => {
  it('当前 Vue 版本：去掉 insertStaticContent 的 innerHTML 解析，其余代码不动', () => {
    const source = runtimeDomSource()
    const { code } = stripStaticContent(source)
    expect(code).not.toMatch(/\.innerHTML\s*=/)
    expect(code).toContain('throw new Error("insertStaticContent 已停用：模板须以 hoistStatic: false 编译");')
    // 克隆已插入静态节点的分支、innerHTML 属性的 patch（el[key] = …）原样保留
    expect(code).toContain('parent.insertBefore(start.cloneNode(true), anchor);')
    expect(code).toContain('el[key] = key === "innerHTML" ? unsafeToTrustedHTML(value) : value;')
    expect(code.length - source.length).toBeLessThan(200)
  })

  it('找不到或不止一处时报错', () => {
    expect(() => stripStaticContent('const a = 1;')).toThrow('实有 0 处')
    const statement = 'templateContainer.innerHTML = unsafeToTrustedHTML(content);'
    expect(() => stripStaticContent(`${statement}\n${statement}`)).toThrow('实有 2 处')
  })

  it('模板编译关闭静态提升', () => {
    expect(VUE_COMPILER_OPTIONS).toEqual({ hoistStatic: false })
  })
})
