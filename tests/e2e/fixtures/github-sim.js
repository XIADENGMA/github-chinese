/**
 * 离线夹具的页面脚本：在页面主世界运行，模拟 GitHub 前端行为。
 * 1. <relative-time>：按最近的 lang 用 Intl 在 shadow DOM 中渲染，文字变化后派发 relative-time-updated
 *    （简化版 @github/relative-time-element）
 * 2. React 改写：扩展翻译后，像 React 状态更新那样把文本、子节点、属性写回英文
 * 3. 延迟插入的动态内容
 * 完成标记：body[data-fx-rewritten="true"]、body[data-fx-dynamic="true"]
 */
;(() => {
  'use strict'

  const DAY_MS = 86_400_000

  class RelativeTimeElement extends HTMLElement {
    static get observedAttributes() {
      return ['lang', 'datetime']
    }

    constructor() {
      super()
      this.attachShadow({ mode: 'open' })
    }

    connectedCallback() {
      this.render()
    }

    attributeChangedCallback() {
      this.render()
    }

    render() {
      const time = Date.parse(this.getAttribute('datetime') ?? '')
      if (Number.isNaN(time)) return
      const lang = this.closest('[lang]')?.getAttribute('lang') || 'en'
      const days = Math.round((time - Date.now()) / DAY_MS)
      const text = new Intl.RelativeTimeFormat(lang, { numeric: 'auto' }).format(days, 'day')
      if (this.shadowRoot.textContent === text) return
      this.shadowRoot.textContent = text
      this.dispatchEvent(new Event('relative-time-updated', { bubbles: true, composed: true }))
    }
  }

  if (!customElements.get('relative-time')) customElements.define('relative-time', RelativeTimeElement)

  const PR_LABEL = '[data-tab-item="pull-requests"] [data-component="text"]'
  const PR_TEXT = 'Pull requests'
  const POLL_MS = 50
  const DYNAMIC_DELAY_MS = 300

  /** 等扩展把 PR 标签页翻译掉（文本不再是英文原文） */
  function whenTranslated(callback) {
    const timer = setInterval(() => {
      const label = document.querySelector(PR_LABEL)
      if (!label || label.textContent.trim() === PR_TEXT) return
      clearInterval(timer)
      callback(label)
    }, POLL_MS)
  }

  /** 模拟 React 状态更新：覆盖扩展的译文 */
  function simulateReactRewrite(label) {
    // characterData：React 直接改写已有文本节点的 nodeValue
    const textNode = [...label.childNodes].find(node => node.nodeType === Node.TEXT_NODE)
    if (textNode) textNode.nodeValue = PR_TEXT
    else label.textContent = PR_TEXT
    // childList：React 重新渲染子节点（新建文本节点）
    document.querySelector('[data-fx="watch-label"]')?.replaceChildren(document.createTextNode('Watch'))
    // attributes：React 更新属性
    document.querySelector('[data-fx="search"]')?.setAttribute('placeholder', 'Search')
    document.body.dataset.fxRewritten = 'true'
  }

  /** 模拟懒加载的对话框 */
  function insertDynamicContent() {
    const slot = document.querySelector('[data-fx="dynamic-slot"]')
    if (!slot) return
    const dialog = document.createElement('div')
    dialog.className = 'Overlay'
    dialog.setAttribute('role', 'dialog')
    dialog.setAttribute('aria-label', 'Settings')
    dialog.dataset.fx = 'dynamic'
    dialog.innerHTML = [
      '<h3 class="Overlay-title" data-fx="dynamic-title">Settings</h3>',
      '<button type="button" class="close-button" aria-label="Close" data-fx="dynamic-close">×</button>',
      '<button type="button" class="btn" data-fx="dynamic-cancel">Cancel</button>',
      '<button type="submit" class="btn btn-primary" data-fx="dynamic-save">Save</button>'
    ].join('')
    slot.append(dialog)
    document.body.dataset.fxDynamic = 'true'
  }

  function start() {
    whenTranslated(label => {
      simulateReactRewrite(label)
      setTimeout(insertDynamicContent, DYNAMIC_DELAY_MS)
    })
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true })
  else start()
})()
