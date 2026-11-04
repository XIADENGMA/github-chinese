/**
 * 词条表：PageDictionary 的 static / scoped（规范化原文 → 译文）。
 *
 * 作者在源码中照常写普通对象。运行时还有另外两种形态，所以读取词条表一律经本模块的函数，
 * 不直接按键取值、展开或用 Object.keys / entries：测试与检查脚本里表是普通对象，这些写法不报错，构建出的扩展中却会读错。
 * - 普通对象：源码形态，vitest 与 scripts/ 下的检查脚本直接导入源码，用的就是它；
 *   构建产物中不能压缩的表（含展开、计算键、非字符串值等）也是普通对象
 * - 压缩串：构建时（wxt build 与 wxt dev 都经过 scripts/pack-tables.ts 的插件）把纯字符串的 static / scoped
 *   对象字面量改写成一个字符串，原文、译文交替排列，以 TABLE_SEPARATOR 分隔；条目顺序同原对象的 Object.keys，原文不重复
 * - 合并表：mergeTables 的结果。子表都是普通对象时合并成新的普通对象；含压缩串时不复制，是子表数组（不嵌套），
 *   同一原文先出现者优先
 * 条目是表的自有可枚举键（含计算键写出的 __proto__），各读取函数对三种形态的结果相同。
 * 词典脚本与内容脚本分别打包、各有一份本模块，形态只按 typeof / Array.isArray 区分，不依赖模块内的类或 Symbol
 */

/** 词条表在源码中的类型（同 PageDictionary 的 static / scoped）；运行时形态见文件说明 */
export type Table = Readonly<Record<string, string>>

/** 运行时的词条表：普通对象、压缩串、合并表（子表数组） */
type RuntimeTable = Table | string | readonly RuntimeTable[]

/** 压缩串的分隔符：词典里不会出现的控制字符（原文或译文含分隔符的表不压缩） */
export const TABLE_SEPARATOR = '\u001f'

function isList(table: RuntimeTable): table is readonly RuntimeTable[] {
  return Array.isArray(table)
}

function isRecord(table: RuntimeTable): table is Table {
  return typeof table === 'object' && !Array.isArray(table)
}

/** 按运行时形态看待（声明类型 Table 只描述源码中的普通对象） */
function runtimeOf(table: Table): RuntimeTable {
  return table
}

/** 压缩串、合并表在类型上仍写作 Table（PageDictionary 的字段类型） */
function asTable(table: RuntimeTable): Table {
  return table as Table
}

/** 压缩：原文、译文依次以分隔符相连；有原文或译文含分隔符时返回 undefined（该表不压缩） */
export function packTable(entries: readonly (readonly [string, string])[]): string | undefined {
  const items = entries.flat()
  return items.some(item => item.includes(TABLE_SEPARATOR)) ? undefined : items.join(TABLE_SEPARATOR)
}

/** 把表中的条目加进 target：target 已有的原文不覆盖（先收录者优先） */
export function addEntries(target: Map<string, string>, table: Table | undefined): void {
  if (table === undefined) return
  const value = runtimeOf(table)
  if (typeof value === 'string') {
    const items = value.split(TABLE_SEPARATOR)
    for (let i = 1; i < items.length; i += 2) {
      const key = items[i - 1]!
      if (!target.has(key)) target.set(key, items[i]!)
    }
    return
  }
  if (isList(value)) {
    for (const part of value) addEntries(target, asTable(part))
    return
  }
  // 不用 Object.entries：词条有数万条，逐条分配键值对数组明显拖慢启动
  const keys = Object.keys(value)
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i]!
    if (!target.has(key)) target.set(key, value[key]!)
  }
}

/**
 * 写入一条，已有的同一原文被覆盖。原文为 __proto__ 时用 defineProperty 写成自有条目：
 * 直接赋值（含 Object.assign）调用的是原型设置器，条目会丢失，而 addEntries 按 Object.keys 收录了它
 */
function setEntry(record: Record<string, string>, key: string, value: string): void {
  if (key === '__proto__') {
    Object.defineProperty(record, key, { value, writable: true, enumerable: true, configurable: true })
  } else {
    record[key] = value
  }
}

/** 合并成新的普通对象：同一原文先出现者优先，条目顺序同 Object.assign({}, ...[...records].reverse()) */
function assignRecords(records: readonly Table[]): Table {
  const record: Record<string, string> = {}
  for (let i = records.length - 1; i >= 0; i--) {
    const part = records[i]!
    const keys = Object.keys(part)
    for (let k = 0; k < keys.length; k++) {
      const key = keys[k]!
      setEntry(record, key, part[key]!)
    }
  }
  return record
}

/** 合并成普通对象，与子表都是普通对象时 mergeTables 的结果相同 */
function recordOf(table: RuntimeTable): Table {
  if (typeof table === 'string') {
    const record: Record<string, string> = {}
    const items = table.split(TABLE_SEPARATOR)
    for (let i = 1; i < items.length; i += 2) {
      const key = items[i - 1]!
      // 同 addEntries：原文重复时先出现者优先（插件生成的压缩串原文不重复）
      if (!Object.hasOwn(record, key)) setEntry(record, key, items[i]!)
    }
    return record
  }
  return isList(table) ? assignRecords(table.map(recordOf)) : table
}

/** 表的条目（同一原文先出现者优先）：顺序同源码形态（普通对象合并）的 Object.entries */
export function tableEntries(table: Table | undefined): [string, string][] {
  return table === undefined ? [] : Object.entries(recordOf(runtimeOf(table)))
}

/** 按原文查译文的函数：只查表自身的条目（不查原型链），第一次调用时建立查找表 */
export function lookupTable(table: Table | undefined): (key: string) => string | undefined {
  let map: Map<string, string> | undefined
  return key => {
    if (!map) {
      map = new Map()
      addEntries(map, table)
    }
    return map.get(key)
  }
}

/**
 * 按顺序合并多张表，同一原文先出现者优先。子表都是普通对象（源码形态：测试、检查脚本）时合并成新的普通对象，
 * 可直接按键读取；含压缩串（构建产物）时不复制，返回子表数组，由本模块的读取函数按顺序读取
 */
export function mergeTables(tables: readonly (Table | undefined)[]): Table {
  const parts: RuntimeTable[] = []
  for (const table of tables) {
    if (table === undefined) continue
    const value = runtimeOf(table)
    if (isList(value)) parts.push(...value)
    else parts.push(value)
  }
  if (parts.every(isRecord)) return assignRecords(parts)
  return asTable(parts.length === 1 ? parts[0]! : parts)
}
