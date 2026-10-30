/**
 * 构建时压缩词典的词条表：把 src/locales 中纯字符串的 static / scoped 对象字面量改写成一个字符串
 * （格式与读取见 src/core/table.ts）。词典脚本在 document_start 同步编译执行，几万个对象属性编译、建对象都慢；
 * 改成字符串后编译只扫一个字面量，由 matcher 在建表时拆开。
 * 只改「键全是字符串字面量或标识符、值全是字符串字面量、没有展开和计算键」的对象，其余原样保留；
 * 键为 __proto__（对象字面量里设置的是原型，不是条目）、原文或译文含分隔符的表不改写。
 * 插件挂在 wxt.config.ts 的 vite 配置上，wxt build 与 wxt dev 都经过这一步；vitest 与 scripts/ 下的检查脚本直接导入源码，
 * 用的是源码对象。
 */
import { isAbsolute, relative } from 'node:path'
import MagicString, { type SourceMap } from 'magic-string'
import type { ESTree, Plugin } from 'vite'
import { packTable } from '../src/core/table'

/** 可改写的词条表 */
export interface TableLiteral {
  /** 对象字面量在代码中的起止位置 */
  readonly start: number
  readonly end: number
  /** 条目：同原对象的 Object.entries（重复的原文后者覆盖，整数样式的原文排在前面） */
  readonly entries: readonly (readonly [string, string])[]
  /** 改写成的字符串 */
  readonly packed: string
}

/** 改写结果 */
export interface PackedModule {
  readonly code: string
  readonly map: SourceMap
}

/** 代码中可能有词条表 */
const TABLE_KEY_RE = /\b(?:static|scoped)\b/

/** 遍历语法树：visit 返回 true 时不再深入该节点 */
function walk(node: unknown, visit: (node: ESTree.Node) => boolean): void {
  if (Array.isArray(node)) {
    for (const child of node) walk(child, visit)
    return
  }
  if (typeof node !== 'object' || node === null) return
  if (typeof (node as { type?: unknown }).type === 'string' && visit(node as ESTree.Node)) return
  for (const [key, value] of Object.entries(node)) {
    if (key !== 'parent' && typeof value === 'object' && value !== null) walk(value, visit)
  }
}

/** 属性名：标识符或字符串字面量；其他（数字、计算键等）返回 undefined */
function keyName(key: ESTree.PropertyKey): string | undefined {
  if (key.type === 'Identifier') return key.name
  return key.type === 'Literal' && typeof key.value === 'string' ? key.value : undefined
}

/** 纯字符串的对象字面量；不符合条件时返回 undefined */
function tableLiteral(object: ESTree.ObjectExpression): TableLiteral | undefined {
  if (object.properties.length === 0) return undefined
  // 按对象字面量的语义求条目：重复的原文后者覆盖、位置不变，整数样式的原文排在前面（同 Object.keys）
  const record: Record<string, string> = Object.create(null)
  for (const property of object.properties) {
    if (property.type !== 'Property' || property.kind !== 'init') return undefined
    if (property.method || property.shorthand || property.computed) return undefined
    const key = keyName(property.key)
    if (key === undefined || key === '__proto__') return undefined
    const value = property.value
    if (value.type !== 'Literal' || typeof value.value !== 'string') return undefined
    record[key] = value.value
  }
  const entries = Object.entries(record)
  const packed = packTable(entries)
  return packed === undefined ? undefined : { start: object.start, end: object.end, entries, packed }
}

/** 代码中可改写的 static / scoped 对象字面量（按出现顺序） */
export function findTables(program: ESTree.Program): TableLiteral[] {
  const tables: TableLiteral[] = []
  walk(program, (node) => {
    if (node.type !== 'Property' || node.computed || node.value.type !== 'ObjectExpression') return false
    const name = keyName(node.key)
    if (name !== 'static' && name !== 'scoped') return false
    const table = tableLiteral(node.value)
    if (!table) return false
    tables.push(table)
    return true
  })
  return tables
}

/** 把代码中可改写的词条表换成字符串字面量，并生成源码映射；没有可改写的表时返回 undefined */
export function packTables(code: string, program: ESTree.Program, source?: string): PackedModule | undefined {
  const tables = findTables(program)
  if (tables.length === 0) return undefined
  const output = new MagicString(code)
  for (const { start, end, packed } of tables) output.overwrite(start, end, JSON.stringify(packed))
  return { code: output.toString(), map: output.generateMap({ source, includeContent: true, hires: 'boundary' }) }
}

/** 文件在目录下（含子目录） */
function isInside(file: string, dir: string): boolean {
  const rel = relative(dir, file)
  return rel !== '' && !rel.startsWith('..') && !isAbsolute(rel)
}

/** Vite 插件：改写 dir（词典目录 src/locales）下各模块的词条表；代码已由 Vite 转成 JS，用插件上下文的 parse 解析 */
export function packTablesPlugin(dir: string): Plugin {
  return {
    name: 'github-chinese:pack-tables',
    transform: {
      filter: { id: /[\\/]src[\\/]locales[\\/]/ },
      handler(code, id) {
        const file = id.split('?', 1)[0]!
        if (!isInside(file, dir) || !TABLE_KEY_RE.test(code)) return null
        return packTables(code, this.parse(code), file) ?? null
      },
    },
  }
}
