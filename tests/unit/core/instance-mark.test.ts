import { afterEach, describe, expect, it } from 'vitest'
import {
  createInstanceId,
  createInstanceMark,
  INSTANCE_MARK_PREFIX,
  type InstanceMark,
} from '../../../src/core/instance-mark'
import { settle } from './helpers'

/** <html> 上的实例标记 */
function marks(): string[] {
  return document.documentElement.getAttributeNames().filter((name) => name.startsWith(INSTANCE_MARK_PREFIX))
}

let created: InstanceMark[] = []

/** 创建并在测试结束时停止维护 */
function track(mark: InstanceMark): InstanceMark {
  created.push(mark)
  return mark
}

afterEach(() => {
  for (const mark of created) mark.disconnect()
  created = []
  for (const name of document.documentElement.getAttributeNames()) {
    if (name.startsWith('data-gcn')) document.documentElement.removeAttribute(name)
  }
})

describe('createInstanceId', () => {
  it('只含小写字母与数字，每次不同', () => {
    const ids = new Set(Array.from({ length: 50 }, () => createInstanceId()))
    expect(ids.size).toBe(50)
    for (const id of ids) expect(id).toMatch(/^[0-9a-z]{14}$/)
  })
})

describe('createInstanceMark', () => {
  it('翻译中写入本实例的属性，停止时移除；只改 <html> 的属性，不增删节点', () => {
    const mark = track(createInstanceMark(document, 'own'))
    expect(mark.name).toBe(`${INSTANCE_MARK_PREFIX}own`)
    const observer = new MutationObserver(() => undefined)
    observer.observe(document, { childList: true, subtree: true, attributes: true })
    mark.update(true)
    mark.update(true)
    expect(marks()).toEqual([mark.name])
    mark.update(false)
    expect(marks()).toEqual([])
    const records = observer.takeRecords()
    observer.disconnect()
    expect(records.length).toBeGreaterThan(0)
    expect(records.every((record) => record.type === 'attributes' && record.target === document.documentElement)).toBe(
      true,
    )
  })

  it('默认生成实例 id：各实例的属性名不同', () => {
    const first = track(createInstanceMark(document))
    const second = track(createInstanceMark(document))
    expect(first.name.startsWith(INSTANCE_MARK_PREFIX)).toBe(true)
    expect(first.name).not.toBe(second.name)
  })

  it('clearOthers 移除其他实例的标记，返回其中是否有已失效实例留下的', () => {
    const root = document.documentElement
    root.setAttribute(`${INSTANCE_MARK_PREFIX}old1`, '')
    root.setAttribute(`${INSTANCE_MARK_PREFIX}old2`, '')
    // 前缀不同，不是实例标记
    root.setAttribute('data-gcn-ignore', '')
    const mark = track(createInstanceMark(document, 'own'))
    mark.update(true)
    expect(mark.clearOthers()).toBe(true)
    expect(marks()).toEqual([mark.name])
    expect(root.hasAttribute('data-gcn-ignore')).toBe(true)
    expect(mark.clearOthers()).toBe(false)
  })

  it('本实例未在翻译时也能清理其他实例的标记', () => {
    document.documentElement.setAttribute(`${INSTANCE_MARK_PREFIX}old`, '')
    const mark = track(createInstanceMark(document, 'own'))
    expect(mark.clearOthers()).toBe(true)
    expect(marks()).toEqual([])
  })

  it('文档没有根元素：不报错', () => {
    const empty = document.implementation.createHTMLDocument()
    empty.documentElement.remove()
    expect(empty.documentElement).toBeNull()
    const mark = createInstanceMark(empty, 'own')
    expect(() => mark.update(true)).not.toThrow()
    expect(() => mark.update(false)).not.toThrow()
    expect(mark.clearOthers()).toBe(false)
    expect(() => mark.disconnect()).not.toThrow()
  })
})

describe('页面改写 <html> 属性（GitHub 前进后退时按地址还原）', () => {
  it('本实例启动后才出现的其他实例标记（页面写回的已移除标记）不算失效实例，照样移除', () => {
    const mark = track(createInstanceMark(document, 'own'))
    mark.update(true)
    document.documentElement.setAttribute(`${INSTANCE_MARK_PREFIX}restored`, '')
    expect(mark.clearOthers()).toBe(false)
    expect(marks()).toEqual([mark.name])
  })

  it('启动时就在的标记之后被移除过（旧实例随后还原、页面改掉）：再写回也不算', async () => {
    const root = document.documentElement
    root.setAttribute(`${INSTANCE_MARK_PREFIX}old`, '')
    const mark = track(createInstanceMark(document, 'own'))
    root.removeAttribute(`${INSTANCE_MARK_PREFIX}old`)
    await settle()
    root.setAttribute(`${INSTANCE_MARK_PREFIX}old`, '')
    expect(mark.clearOthers()).toBe(false)
    expect(marks()).toEqual([])
  })

  it('启动时就在、一直没被移除的标记：照常算失效实例', async () => {
    document.documentElement.setAttribute(`${INSTANCE_MARK_PREFIX}old`, '')
    const mark = track(createInstanceMark(document, 'own'))
    mark.update(true)
    document.documentElement.setAttribute('data-color-mode', 'dark')
    await settle()
    expect(mark.clearOthers()).toBe(true)
    document.documentElement.removeAttribute('data-color-mode')
  })

  it('翻译中本实例的标记被页面移除：随即写回', async () => {
    const mark = track(createInstanceMark(document, 'own'))
    mark.update(true)
    document.documentElement.removeAttribute(mark.name)
    await settle()
    expect(marks()).toEqual([mark.name])
  })

  it('停止后本实例的标记被页面写回：随即移除', async () => {
    const mark = track(createInstanceMark(document, 'own'))
    mark.update(true)
    mark.update(false)
    document.documentElement.setAttribute(mark.name, '')
    await settle()
    expect(marks()).toEqual([])
  })

  it('disconnect 后不再维护本实例的标记', async () => {
    const mark = track(createInstanceMark(document, 'own'))
    mark.update(true)
    mark.disconnect()
    document.documentElement.removeAttribute(mark.name)
    await settle()
    expect(marks()).toEqual([])
  })
})
