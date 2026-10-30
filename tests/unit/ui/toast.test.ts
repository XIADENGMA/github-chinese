import {
  MAX_TOASTS,
  clearToasts,
  createToastSource,
  dismissToast,
  showToast,
  useToasts,
} from '../../../src/components/toast'
import { shownToasts } from './helpers'

afterEach(() => {
  clearToasts()
})

describe('提示队列', () => {
  it('按显示顺序排列，新的在后；返回各自的 id', () => {
    const first = showToast('success', 'saved')
    const second = showToast('danger', 'imported', { count: 2 })
    expect(first).not.toBe(second)
    expect(useToasts().value.map((toast) => toast.id)).toEqual([first, second])
    expect(shownToasts()).toEqual([
      { tone: 'success', key: 'saved' },
      { tone: 'danger', key: 'imported', params: { count: 2 } },
    ])
  })

  it('相同的提示不叠加：换成新的一条（新 id，排到最后）', () => {
    const first = showToast('danger', 'saveFailed')
    showToast('success', 'saved')
    const again = showToast('danger', 'saveFailed')
    expect(again).not.toBe(first)
    expect(useToasts().value.map((toast) => toast.id)).not.toContain(first)
    expect(shownToasts()).toEqual([
      { tone: 'success', key: 'saved' },
      { tone: 'danger', key: 'saveFailed' },
    ])
  })

  it('类型、文案或参数不同即为不同的提示', () => {
    showToast('danger', 'imported', { count: 1 })
    showToast('danger', 'imported', { count: 2 })
    showToast('success', 'imported', { count: 2 })
    expect(shownToasts()).toHaveLength(3)
  })

  it(`最多同时显示 ${MAX_TOASTS} 条：超出时先收起最早的`, () => {
    showToast('success', 'imported', { count: 1 })
    showToast('success', 'imported', { count: 2 })
    showToast('success', 'imported', { count: 3 })
    showToast('success', 'imported', { count: 4 })
    expect(shownToasts().map((toast) => toast.params)).toEqual([{ count: 2 }, { count: 3 }, { count: 4 }])
  })

  it('按 id 收起；id 不存在时不变', () => {
    const first = showToast('success', 'saved')
    showToast('danger', 'saveFailed')
    dismissToast(first)
    expect(shownToasts()).toEqual([{ tone: 'danger', key: 'saveFailed' }])
    dismissToast(first)
    expect(shownToasts()).toHaveLength(1)
  })
})

describe('createToastSource', () => {
  it('同一处只留一条：新的替换旧的；clear 收起', () => {
    const source = createToastSource()
    source.show('danger', 'invalidFormat')
    source.show('danger', 'saveFailed')
    expect(shownToasts()).toEqual([{ tone: 'danger', key: 'saveFailed' }])
    source.clear()
    expect(shownToasts()).toEqual([])
    source.clear()
    expect(shownToasts()).toEqual([])
  })

  it('各处互不影响', () => {
    const save = createToastSource()
    const load = createToastSource()
    save.show('success', 'saved')
    load.show('danger', 'readFailed')
    save.clear()
    expect(shownToasts()).toEqual([{ tone: 'danger', key: 'readFailed' }])
  })

  it('另一处显示了相同的提示后，这处 clear 不收起那条', () => {
    const first = createToastSource()
    const second = createToastSource()
    first.show('danger', 'saveFailed')
    second.show('danger', 'saveFailed')
    first.clear()
    expect(shownToasts()).toEqual([{ tone: 'danger', key: 'saveFailed' }])
    second.clear()
    expect(shownToasts()).toEqual([])
  })
})
