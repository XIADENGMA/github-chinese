<template>
  <span ref="host" class="ui-ripple" aria-hidden="true">
    <span
      v-for="wave in waves"
      :key="wave.id"
      class="ui-ripple-wave"
      :style="{ left: `${wave.left}px`, top: `${wave.top}px`, width: `${wave.size}px`, height: `${wave.size}px` }"
      @animationend="remove(wave.id)"
    ></span>
  </span>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, shallowRef, useTemplateRef } from 'vue'

/**
 * 水波纹：放在按钮（或按钮外观的链接）内部，监听它的按下与点击。
 * 指针按下时从按下位置扩散，键盘（Enter、空格）触发时从中心扩散；按钮禁用、系统要求减少动态效果时不生成。
 * 只追加装饰节点，不拦截、不延迟点击事件
 */
const { centered = false } = defineProps<{
  /** 总从中心扩散（不随指针位置），如开关的滑块 */
  centered?: boolean
}>()

interface Wave {
  readonly id: number
  /** 波纹外接正方形相对宿主的位置与边长 */
  readonly left: number
  readonly top: number
  readonly size: number
}

interface Point {
  readonly clientX: number
  readonly clientY: number
}

/** 同时保留的波纹数：连点时丢弃最早的；动画没有结束（如被浏览器暂停）也不会累积 */
const MAX_WAVES = 3

const host = useTemplateRef<HTMLElement>('host')
const waves = shallowRef<readonly Wave[]>([])
let nextId = 0
let trigger: HTMLElement | null = null

function reducedMotion(): boolean {
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
}

/** 在指针位置生成波纹；没有位置或 centered 时从中心 */
function spawn(point?: Point): void {
  const element = host.value
  if (!element || (trigger instanceof HTMLButtonElement && trigger.disabled) || reducedMotion()) return
  const rect = element.getBoundingClientRect()
  const fromPoint = point !== undefined && !centered
  const x = fromPoint ? point.clientX - rect.left : rect.width / 2
  const y = fromPoint ? point.clientY - rect.top : rect.height / 2
  // 半径取到最远角的距离：扩散结束时覆盖整个宿主
  const radius = Math.hypot(Math.max(x, rect.width - x), Math.max(y, rect.height - y))
  const wave: Wave = { id: nextId++, left: x - radius, top: y - radius, size: radius * 2 }
  waves.value = [...waves.value, wave].slice(-MAX_WAVES)
}

function remove(id: number): void {
  waves.value = waves.value.filter((wave) => wave.id !== id)
}

function onPointerdown(event: PointerEvent): void {
  // 只响应主键：鼠标左键、触摸、触控笔
  if (event.button === 0) spawn(event)
}

function onClick(event: MouseEvent): void {
  // 键盘触发的点击没有指针位置（detail 为 0）
  if (event.detail === 0) spawn()
}

onMounted(() => {
  trigger = host.value?.parentElement?.closest<HTMLElement>('button, a') ?? null
  trigger?.addEventListener('pointerdown', onPointerdown)
  trigger?.addEventListener('click', onClick)
})

onBeforeUnmount(() => {
  trigger?.removeEventListener('pointerdown', onPointerdown)
  trigger?.removeEventListener('click', onClick)
  trigger = null
})
</script>

<style scoped>
/* 宿主铺满所在元素并按其圆角裁剪；颜色取文字色 */
.ui-ripple {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
  border-radius: inherit;
}

/* 扩散先快后慢，淡出匀速；两段同时结束，animationend 时移除 */
.ui-ripple-wave {
  position: absolute;
  background: currentColor;
  border-radius: 50%;
  opacity: 0;
  transform: scale(0);
  animation:
    ui-ripple-grow 600ms cubic-bezier(0.2, 0, 0, 1),
    ui-ripple-fade 600ms linear;
}

/* 高对比度模式下背景色由系统接管，波纹没有意义 */
@media (forced-colors: active) {
  .ui-ripple {
    display: none;
  }
}

@keyframes ui-ripple-grow {
  from {
    transform: scale(0);
  }

  to {
    transform: scale(1);
  }
}

@keyframes ui-ripple-fade {
  from {
    opacity: 0.28;
  }

  40% {
    opacity: 0.22;
  }

  to {
    opacity: 0;
  }
}
</style>
