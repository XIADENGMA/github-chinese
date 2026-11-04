import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createCloneUrlRewriter, type CloneUrlRewriter } from '../../../src/core/clone-url'
import { DEFAULT_SETTINGS, type Settings } from '../../../src/shared/settings'

const REPO = 'https://github.com/vuejs/core.git'
const GIST = 'https://gist.github.com/0831f3fbd83ac4d46451.git'

let settings: Settings
let rewriter: CloneUrlRewriter | undefined
const resolve = vi.fn(async (url: string): Promise<string> => `https://resolved.example/${url}`)
const copy = vi.fn()

/** 等 MutationObserver 回调与异步选源 */
async function flush(): Promise<void> {
  await new Promise((done) => setTimeout(done, 0))
}

function start(): CloneUrlRewriter {
  rewriter = createCloneUrlRewriter(document, { settings: () => settings, resolve, copy })
  return rewriter
}

/** 存储库 Code 下拉框的克隆地址（同 GitHub 的 React 组件：输入框与复制按钮在同一容器） */
function repoClone(value = REPO): { input: HTMLInputElement; button: HTMLButtonElement } {
  document.body.innerHTML = `<div class="CloneContainer"><input id="clone-with-https" readonly value="${value}"><button type="button"></button></div>`
  return { input: document.querySelector('input')!, button: document.querySelector('button')! }
}

/** 页面脚本切换克隆方式、重新渲染：同时改属性与当前值 */
function setPageValue(element: HTMLInputElement | HTMLButtonElement, value: string): void {
  element.setAttribute('value', value)
  element.value = value
}

beforeEach(() => {
  settings = { ...DEFAULT_SETTINGS, accelerate: true }
})

afterEach(() => {
  rewriter?.stop()
  rewriter = undefined
  resolve.mockClear()
  copy.mockClear()
  document.head.innerHTML = ''
  document.body.innerHTML = ''
})

describe('createCloneUrlRewriter', () => {
  it('存储库的 HTTPS 克隆地址：属性与当前值都换成首选加速源的地址', () => {
    const { input } = repoClone()
    start()
    expect(input.getAttribute('value')).toBe(`https://ghfast.top/${REPO}`)
    expect(input.value).toBe(`https://ghfast.top/${REPO}`)
  })

  it('之后出现的输入框（打开下拉框）、页面改回原地址（重新渲染）：再改写', async () => {
    start()
    const { input } = repoClone()
    await flush()
    expect(input.value).toBe(`https://ghfast.top/${REPO}`)
    setPageValue(input, REPO)
    await flush()
    expect(input.value).toBe(`https://ghfast.top/${REPO}`)
  })

  it('切换到 GitHub CLI 不改；切回 HTTPS 再改写', async () => {
    const { input } = repoClone()
    start()
    setPageValue(input, 'gh repo clone vuejs/core')
    await flush()
    expect(input.value).toBe('gh repo clone vuejs/core')
    setPageValue(input, REPO)
    await flush()
    expect(input.value).toBe(`https://ghfast.top/${REPO}`)
  })

  it('复制按钮：页面脚本复制原地址之后，剪贴板改写为加速后的地址；点输入框不处理', () => {
    const { input, button } = repoClone()
    start()
    const order: string[] = []
    copy.mockImplementation(() => order.push('copy'))
    // 页面脚本（React）在根容器上处理点击，先于 window 的冒泡监听
    document.body.addEventListener('click', () => order.push('page'))
    button.click()
    expect(copy).toHaveBeenCalledExactlyOnceWith(`https://ghfast.top/${REPO}`)
    expect(order).toEqual(['page', 'copy'])
    input.click()
    expect(copy).toHaveBeenCalledTimes(1)
  })

  it('代码片段：「Clone via HTTPS」选项与分享输入框中的克隆地址改写；嵌入代码、SSH 不改', () => {
    settings = { ...settings, accelerateSource: 'gh-proxy-hk' }
    document.body.innerHTML = `
      <input id="gist-share-url-original" readonly value="&lt;script src=&quot;https://gist.github.com/octocat/0831f3fbd83ac4d46451.js&quot;&gt;&lt;/script&gt;">
      <input id="gist-share-url-sized-down" readonly value="${GIST}">
      <button role="option" value="${GIST}">Clone via HTTPS</button>
      <button role="option" value="git@gist.github.com:0831f3fbd83ac4d46451.git">Clone via SSH</button>`
    start()
    const [embed, share] = document.querySelectorAll('input')
    const [https, ssh] = document.querySelectorAll('button')
    // gh-proxy.org 不支持 gist.github.com：用列表中第一个支持的
    expect(https!.value).toBe(`https://ghfast.top/${GIST}`)
    expect(share!.value).toBe(`https://ghfast.top/${GIST}`)
    expect(embed!.value).toContain('<script')
    expect(ssh!.value).toBe('git@gist.github.com:0831f3fbd83ac4d46451.git')
  })

  it('新建存储库页面的地址（用于推送）不改', () => {
    document.body.innerHTML = `<input id="empty-setup-clone-url" readonly value="${REPO}">`
    start()
    expect(document.querySelector('input')!.value).toBe(REPO)
  })

  it.each([
    ['未开启下载加速', { accelerate: false }],
    ['总开关关闭', { enabled: false }],
  ] as const)('%s：不改；之后开启再改写，再关闭时还原', (_name, overrides) => {
    settings = { ...settings, ...overrides }
    const { input } = repoClone()
    start()
    expect(input.value).toBe(REPO)
    settings = { ...settings, accelerate: true, enabled: true }
    rewriter!.refresh()
    expect(input.value).toBe(`https://ghfast.top/${REPO}`)
    settings = { ...settings, ...overrides }
    rewriter!.refresh()
    expect(input.getAttribute('value')).toBe(REPO)
    expect(input.value).toBe(REPO)
  })

  it('私有存储库的页面：不改', () => {
    document.head.innerHTML = '<meta name="octolytics-dimension-repository_public" content="false">'
    const { input } = repoClone()
    start()
    expect(input.value).toBe(REPO)
  })

  it('停止：还原，之后不再改写', async () => {
    const { input } = repoClone()
    start().stop()
    expect(input.value).toBe(REPO)
    setPageValue(input, REPO)
    await flush()
    expect(input.value).toBe(REPO)
  })

  describe('故障转移开启', () => {
    beforeEach(() => {
      settings = { ...settings, failover: true }
    })

    it('请后台选源，应答后改写', async () => {
      const { input } = repoClone()
      start()
      expect(resolve).toHaveBeenCalledExactlyOnceWith(REPO)
      expect(input.value).toBe(REPO)
      await flush()
      expect(input.value).toBe(`https://resolved.example/${REPO}`)
    })

    it('等待期间切换了克隆方式、后台出错、应答原地址：不改', async () => {
      const { input } = repoClone()
      start()
      setPageValue(input, 'gh repo clone vuejs/core')
      await flush()
      expect(input.value).toBe('gh repo clone vuejs/core')
      resolve.mockRejectedValueOnce(new Error('后台无响应'))
      setPageValue(input, REPO)
      await flush()
      expect(input.value).toBe(REPO)
      resolve.mockResolvedValueOnce(REPO)
      rewriter!.refresh()
      await flush()
      expect(input.value).toBe(REPO)
    })

    it('没有加速源支持：不请后台', () => {
      settings = { ...settings, removedSources: ['ghfast', 'wget-la', 'gh-monlor', 'hub-ddayh', 'ghproxy-053000'] }
      document.body.innerHTML = `<button role="option" value="${GIST}">Clone via HTTPS</button>`
      start()
      expect(resolve).not.toHaveBeenCalled()
    })
  })
})
