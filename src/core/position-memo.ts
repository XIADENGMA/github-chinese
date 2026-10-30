/**
 * 依赖元素位置的判断（如时间元素是否位于跳过区域）按元素记下，再次查询时条件未变就沿用：
 * - 未作废：调用方在判断依据可能变化时作废（忽略规则重新编译、页面增删节点或改动观察的属性）；
 * - 元素自身与各级祖先仍是判断时的那些元素（元素或祖先移动后重新判断，移动当时同步渲染的也不例外）；
 * - 这些元素的 class 与判断时相同：class 变化不观察，在这里比对。其余不观察的属性变化不重新判断。
 * 元素按编号记下，不持有元素：元素移走后，旧祖先照常回收。
 */

export interface PositionMemo {
  /** 元素的判断：条件未变时沿用上次的结果 */
  get(element: Element): boolean
  /** 作废此前的全部判断 */
  invalidate(): void
}

interface Verdict {
  readonly value: boolean
  /** 判断时的版本：作废后加一 */
  readonly version: number
  /** 元素自身与各级祖先（到根为止）的编号 */
  readonly path: readonly number[]
  /** path 中各元素判断时的 class */
  readonly classes: readonly (string | null)[]
}

export function createPositionMemo(compute: (element: Element) => boolean): PositionMemo {
  const numbers = new WeakMap<Element, number>()
  const verdicts = new WeakMap<Element, Verdict>()
  let lastNumber = 0
  let version = 0

  function numberOf(element: Element): number {
    let number = numbers.get(element)
    if (number === undefined) numbers.set(element, (number = ++lastNumber))
    return number
  }

  /** 元素自身与各级祖先、其 class 都与判断时相同 */
  function samePath(element: Element, verdict: Verdict): boolean {
    let current: Element | null = element
    for (let i = 0; i < verdict.path.length; i++) {
      if (current === null || numbers.get(current) !== verdict.path[i]) return false
      if (current.getAttribute('class') !== verdict.classes[i]) return false
      current = current.parentElement
    }
    return current === null
  }

  function judge(element: Element): boolean {
    const value = compute(element)
    const path: number[] = []
    const classes: (string | null)[] = []
    for (let current: Element | null = element; current; current = current.parentElement) {
      path.push(numberOf(current))
      classes.push(current.getAttribute('class'))
    }
    verdicts.set(element, { value, version, path, classes })
    return value
  }

  return {
    get(element) {
      const verdict = verdicts.get(element)
      return verdict?.version === version && samePath(element, verdict) ? verdict.value : judge(element)
    },

    invalidate() {
      version++
    },
  }
}
