// @vitest-environment-options { "url": "https://github.com/vuejs/core" }
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  createNavigationWatcher,
  DOCUMENT_NAVIGATION_EVENTS,
  WINDOW_NAVIGATION_EVENTS,
  type NavigationHost
} from '../../../src/core/location'
import { settle } from './helpers'

const HOME = '/vuejs/core'
let stops: (() => void)[] = []

function watch(host: NavigationHost = window): { onChange: ReturnType<typeof vi.fn>; stop: () => void } {
  const onChange = vi.fn()
  const watcher = createNavigationWatcher(host, onChange)
  watcher.start()
  watcher.start()
  expect(watcher.running).toBe(true)
  stops.push(() => watcher.stop())
  return { onChange, stop: () => watcher.stop() }
}

afterEach(() => {
  for (const stop of stops) stop()
  stops = []
  document.body.innerHTML = ''
  history.replaceState(null, '', HOME)
})

describe('createNavigationWatcher', () => {
  it.each(DOCUMENT_NAVIGATION_EVENTS)('document 事件 %s 触发地址比较', type => {
    const { onChange } = watch()
    history.pushState(null, '', `/vuejs/core/${type.replace(':', '-')}`)
    document.dispatchEvent(new Event(type))
    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange).toHaveBeenCalledWith(location.href)
  })

  it.each(WINDOW_NAVIGATION_EVENTS)('window 事件 %s 触发地址比较', type => {
    const { onChange } = watch()
    history.pushState(null, '', `/vuejs/core/${type}`)
    window.dispatchEvent(new Event(type))
    expect(onChange).toHaveBeenCalledTimes(1)
  })

  it('地址未变时不回调', () => {
    const { onChange } = watch()
    document.dispatchEvent(new Event('turbo:load'))
    window.dispatchEvent(new Event('popstate'))
    expect(onChange).not.toHaveBeenCalled()
  })

  it('DOM 变动时比较地址（React 软导航不派发事件）', async () => {
    const { onChange } = watch()
    history.pushState(null, '', '/vuejs/core/pulls')
    document.body.append(document.createElement('div'))
    await settle()
    expect(onChange).toHaveBeenCalledTimes(1)
  })

  it('Navigation API 的 currententrychange', () => {
    const navigation = new EventTarget()
    const host: NavigationHost & { navigation: EventTarget } = {
      document,
      location,
      MutationObserver,
      navigation,
      addEventListener: (type, listener) => window.addEventListener(type, listener),
      removeEventListener: (type, listener) => window.removeEventListener(type, listener)
    }
    const { onChange, stop } = watch(host)
    history.pushState(null, '', '/vuejs/core/actions')
    navigation.dispatchEvent(new Event('currententrychange'))
    expect(onChange).toHaveBeenCalledTimes(1)
    stop()
    history.pushState(null, '', '/vuejs/core/wiki')
    navigation.dispatchEvent(new Event('currententrychange'))
    expect(onChange).toHaveBeenCalledTimes(1)
  })

  it('停止后不再回调', async () => {
    const { onChange, stop } = watch()
    stop()
    stop()
    history.pushState(null, '', '/vuejs/core/pulls')
    document.dispatchEvent(new Event('turbo:load'))
    document.body.append(document.createElement('div'))
    await settle()
    expect(onChange).not.toHaveBeenCalled()
  })

  it('未启动时 check 不回调', () => {
    const onChange = vi.fn()
    const watcher = createNavigationWatcher(window, onChange)
    history.pushState(null, '', '/vuejs/core/pulls')
    watcher.check()
    expect(onChange).not.toHaveBeenCalled()
    expect(watcher.running).toBe(false)
  })
})
