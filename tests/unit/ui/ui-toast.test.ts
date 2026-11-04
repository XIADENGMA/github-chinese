import { enableAutoUnmount, mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { clearToasts, showToast } from '../../../src/components/toast'
import { applyUiPreferences } from '../../../src/components/ui-preferences'
import { shownToasts, ZH_SETTINGS } from './helpers'
import { importSfc, required } from './sfc'

const UiToast = await importSfc(() => import('../../../src/components/ui/UiToast.vue'))
const ToastHost = await importSfc(() => import('../../../src/components/ToastHost.vue'))

enableAutoUnmount(afterEach)

let pageHidden = false

/** 切换页面可见性并发出 visibilitychange */
function setPageHidden(value: boolean): void {
  pageHidden = value
  document.dispatchEvent(new Event('visibilitychange'))
}

beforeEach(() => {
  vi.useFakeTimers()
  pageHidden = false
  Object.defineProperty(document, 'hidden', { configurable: true, get: () => pageHidden })
})

afterEach(() => {
  Reflect.deleteProperty(document, 'hidden')
  clearToasts()
  vi.useRealTimers()
  vi.restoreAllMocks()
})

describe.skipIf(!UiToast)('UiToast', () => {
  function render(tone: 'success' | 'danger' = 'success', duration = 3000) {
    return mount(required(UiToast), { props: { tone, duration }, slots: { default: '已保存' } })
  }

  it('显示插槽文字；图标对读屏隐藏，成功、失败各用其图形', () => {
    const success = render('success')
    const danger = render('danger')
    expect(success.text()).toBe('已保存')
    expect(success.classes()).toContain('ui-toast-success')
    expect(danger.classes()).toContain('ui-toast-danger')
    expect(success.get('svg').attributes('aria-hidden')).toBe('true')
    expect(success.get('.ui-toast-glyph').attributes('d')).not.toBe(danger.get('.ui-toast-glyph').attributes('d'))
  })

  it('到时发出 close，只发一次', () => {
    const wrapper = render('success', 3000)
    vi.advanceTimersByTime(2999)
    expect(wrapper.emitted('close')).toBeUndefined()
    vi.advanceTimersByTime(1)
    expect(wrapper.emitted('close')).toHaveLength(1)
    vi.advanceTimersByTime(10_000)
    expect(wrapper.emitted('close')).toHaveLength(1)
  })

  it('指针停在上面时暂停，移开后走完剩余时间', async () => {
    const wrapper = render('success', 3000)
    vi.advanceTimersByTime(1000)
    await wrapper.trigger('pointerenter')
    vi.advanceTimersByTime(10_000)
    expect(wrapper.emitted('close')).toBeUndefined()
    await wrapper.trigger('pointerleave')
    vi.advanceTimersByTime(1999)
    expect(wrapper.emitted('close')).toBeUndefined()
    vi.advanceTimersByTime(1)
    expect(wrapper.emitted('close')).toHaveLength(1)
  })

  it('页面切到后台时暂停，回到前台后走完剩余时间', () => {
    const wrapper = render('danger', 5000)
    vi.advanceTimersByTime(2000)
    setPageHidden(true)
    vi.advanceTimersByTime(60_000)
    expect(wrapper.emitted('close')).toBeUndefined()
    setPageHidden(false)
    vi.advanceTimersByTime(2999)
    expect(wrapper.emitted('close')).toBeUndefined()
    vi.advanceTimersByTime(1)
    expect(wrapper.emitted('close')).toHaveLength(1)
  })

  it('在后台显示时，回到前台才开始计时', () => {
    pageHidden = true
    const wrapper = render('success', 3000)
    vi.advanceTimersByTime(60_000)
    expect(wrapper.emitted('close')).toBeUndefined()
    setPageHidden(false)
    vi.advanceTimersByTime(3000)
    expect(wrapper.emitted('close')).toHaveLength(1)
  })

  it('指针停留期间页面切换前后台，仍保持暂停', async () => {
    const wrapper = render('success', 3000)
    await wrapper.trigger('pointerenter')
    setPageHidden(true)
    setPageHidden(false)
    vi.advanceTimersByTime(60_000)
    expect(wrapper.emitted('close')).toBeUndefined()
  })

  it('卸载后不再计时，也不再监听页面可见性', () => {
    const remove = vi.spyOn(document, 'removeEventListener')
    const wrapper = render('success', 3000)
    wrapper.unmount()
    expect(vi.getTimerCount()).toBe(0)
    expect(remove).toHaveBeenCalledWith('visibilitychange', expect.any(Function))
  })
})

describe.skipIf(!ToastHost)('ToastHost', () => {
  beforeEach(() => {
    applyUiPreferences(ZH_SETTINGS)
  })

  afterEach(() => {
    applyUiPreferences(ZH_SETTINGS)
  })

  function render() {
    return mount(required(ToastHost))
  }

  function texts(wrapper: ReturnType<typeof render>): string[] {
    return wrapper.findAll('.ui-toast').map(toast => toast.text())
  }

  it('朗读区域一直在（没有提示时也在），有提示时读屏朗读', () => {
    const wrapper = render()
    expect(wrapper.attributes('aria-live')).toBe('polite')
    expect(texts(wrapper)).toEqual([])
  })

  it('按当前界面语言显示文案与参数；语言切换后随之更新', async () => {
    const wrapper = render()
    showToast('success', 'imported', { count: 2 })
    showToast('danger', 'saveFailed')
    await nextTick()
    expect(texts(wrapper)).toEqual(['已导入 2 条', '保存失败'])

    applyUiPreferences({ ...ZH_SETTINGS, uiLanguage: 'en' })
    await nextTick()
    expect(texts(wrapper)).toEqual(['Imported 2', 'Save failed'])
  })

  it('成功的提示 3 秒后收起，失败的 5 秒后收起', async () => {
    const wrapper = render()
    showToast('success', 'exists')
    showToast('danger', 'saveFailed')
    await nextTick()
    vi.advanceTimersByTime(3000)
    await nextTick()
    expect(shownToasts()).toEqual([{ tone: 'danger', key: 'saveFailed' }])
    expect(texts(wrapper)).toEqual(['保存失败'])
    vi.advanceTimersByTime(2000)
    await nextTick()
    expect(shownToasts()).toEqual([])
    expect(texts(wrapper)).toEqual([])
  })

  it('相同的提示再次出现时重新计时', async () => {
    render()
    showToast('success', 'exists')
    await nextTick()
    vi.advanceTimersByTime(2000)
    showToast('success', 'exists')
    await nextTick()
    vi.advanceTimersByTime(2000)
    expect(shownToasts()).toEqual([{ tone: 'success', key: 'exists' }])
    vi.advanceTimersByTime(1000)
    await nextTick()
    expect(shownToasts()).toEqual([])
  })
})
