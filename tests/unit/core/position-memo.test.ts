import { afterEach, describe, expect, it, vi, type Mock } from 'vitest'
import { createPositionMemo, type PositionMemo } from '../../../src/core/position-memo'
import { $ } from './helpers'

afterEach(() => {
  document.body.innerHTML = ''
})

/** 判断：是否位于 .sample-region 或 [data-region] 内 */
function setup(html: string): { memo: PositionMemo; compute: Mock<(element: Element) => boolean> } {
  document.body.innerHTML = html
  const compute = vi.fn((element: Element) => element.closest('.sample-region, [data-region]') !== null)
  return { memo: createPositionMemo(compute), compute }
}

describe('createPositionMemo', () => {
  it('元素与祖先未变：沿用上次的判断', () => {
    const { memo, compute } = setup('<main><section><span id="target"></span></section></main>')
    expect(memo.get($('#target'))).toBe(false)
    expect(memo.get($('#target'))).toBe(false)
    expect(compute).toHaveBeenCalledTimes(1)
  })

  it('各元素分别判断', () => {
    const { memo, compute } = setup('<main><span id="a"></span></main><div data-region><span id="b"></span></div>')
    expect(memo.get($('#a'))).toBe(false)
    expect(memo.get($('#b'))).toBe(true)
    expect(memo.get($('#a'))).toBe(false)
    expect(compute).toHaveBeenCalledTimes(2)
  })

  it('文字变化：沿用', () => {
    const { memo, compute } = setup('<main><section><span id="target">Sample text</span></section></main>')
    memo.get($('#target'))
    $('#target').textContent = 'octocat'
    expect(memo.get($('#target'))).toBe(false)
    expect(compute).toHaveBeenCalledTimes(1)
  })

  // 以下移动前后，元素到根的层数与各层 class 都相同，只有元素不同
  it('元素移到别处：重新判断', () => {
    const { memo, compute } = setup('<main><span id="target"></span></main><aside data-region></aside>')
    expect(memo.get($('#target'))).toBe(false)
    $('aside').append($('#target'))
    expect(memo.get($('#target'))).toBe(true)
    $('main').append($('#target'))
    expect(memo.get($('#target'))).toBe(false)
    expect(compute).toHaveBeenCalledTimes(3)
  })

  it('祖先移到别处：重新判断', () => {
    const { memo } = setup(
      '<main><section><p><span id="target"></span></p></section></main><aside data-region></aside>',
    )
    expect(memo.get($('#target'))).toBe(false)
    $('aside').append($('section'))
    expect(memo.get($('#target'))).toBe(true)
  })

  it('所在子树移出文档：重新判断', () => {
    const { memo, compute } = setup('<div data-region><section><span id="target"></span></section></div>')
    const target = $('#target')
    expect(memo.get(target)).toBe(true)
    $('section').remove()
    expect(memo.get(target)).toBe(false)
    expect(compute).toHaveBeenCalledTimes(2)
  })

  it('在文档外判断过的子树插入文档：重新判断', () => {
    const { memo } = setup('<div data-region></div>')
    const section = document.createElement('section')
    const target = section.appendChild(document.createElement('span'))
    expect(memo.get(target)).toBe(false)
    $('[data-region]').append(section)
    expect(memo.get(target)).toBe(true)
  })

  it('祖先或元素自身 class 变化：重新判断', () => {
    const { memo, compute } = setup('<main><section class="d-flex"><span id="target"></span></section></main>')
    expect(memo.get($('#target'))).toBe(false)
    $('section').className = 'sample-region'
    expect(memo.get($('#target'))).toBe(true)
    $('section').removeAttribute('class')
    expect(memo.get($('#target'))).toBe(false)
    $('#target').className = 'sample-region'
    expect(memo.get($('#target'))).toBe(true)
    expect(compute).toHaveBeenCalledTimes(4)
  })

  it('class 以外的属性变化：沿用，作废后重新判断', () => {
    const { memo, compute } = setup('<main><section><span id="target"></span></section></main>')
    expect(memo.get($('#target'))).toBe(false)
    $('section').setAttribute('data-region', '')
    expect(memo.get($('#target'))).toBe(false)
    memo.invalidate()
    expect(memo.get($('#target'))).toBe(true)
    expect(memo.get($('#target'))).toBe(true)
    expect(compute).toHaveBeenCalledTimes(2)
  })
})
