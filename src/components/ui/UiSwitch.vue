<template>
  <div class="ui-switch" :class="{ 'ui-switch-compact': compact }">
    <label :for="id" class="ui-switch-label">{{ label }}</label>
    <button
      :id="id"
      type="button"
      role="switch"
      class="ui-switch-track"
      :aria-checked="checked"
      :disabled="disabled"
      @click="emit('change', !checked)"
    >
      <UiRipple class="ui-switch-ripple" centered />
      <span class="ui-switch-knob" aria-hidden="true"></span>
    </button>
  </div>
</template>

<script setup lang="ts">
  import { useId } from 'vue'
  import UiRipple from './UiRipple.vue'

  /** 开关：标签在左、开关在右。状态由父组件持有，点击只发出相反状态 */
  defineProps<{
    /** 当前状态 */
    checked: boolean
    /** 可见标签 */
    label: string
    disabled?: boolean
    /** 紧凑：开关小一号，标签占满其余宽度（整块可点），用于并排的开关 */
    compact?: boolean
  }>()

  const emit = defineEmits<{ change: [checked: boolean] }>()

  const id = useId()
</script>

<style scoped>
  .ui-switch {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    min-height: var(--gcn-control-md);
  }

  .ui-switch-label {
    cursor: pointer;
    user-select: none;
  }

  .ui-switch-track {
    position: relative;
    flex: none;
    width: 36px;
    height: 20px;
    padding: 0;
    background: var(--gcn-switch-off);
    border: 0;
    border-radius: 10px;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
    transition: background-color var(--gcn-duration-base) var(--gcn-ease);
  }

  /* 标签也能切换：悬停标签时开关同样显示悬停色 */
  .ui-switch-track:hover:not(:disabled),
  .ui-switch-label:hover + .ui-switch-track:not(:disabled) {
    background: var(--gcn-switch-off-hover);
  }

  .ui-switch-track[aria-checked='true'] {
    background: var(--gcn-switch-on);
  }

  .ui-switch-track[aria-checked='true']:hover:not(:disabled),
  .ui-switch-label:hover + .ui-switch-track[aria-checked='true']:not(:disabled) {
    background: var(--gcn-switch-on-hover);
  }

  .ui-switch-track:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }

  .ui-switch-knob {
    position: absolute;
    top: 2px;
    left: 2px;
    width: 16px;
    height: 16px;
    background: var(--gcn-knob);
    border-radius: 50%;
    box-shadow:
      0 1px 3px rgb(31 35 40 / 0.2),
      0 1px 1px rgb(31 35 40 / 0.12);
    transition: transform var(--gcn-duration-base) var(--gcn-ease-out);
  }

  .ui-switch-track[aria-checked='true'] .ui-switch-knob {
    transform: translateX(16px);
  }

  /*
 * 波纹是滑块外一圈的光晕：以滑块中心为圆心、直径 32px，与滑块同步移动；
 * 排在滑块之前，画在滑块下、轨道上。关时灰色，开时主题色
 */
  .ui-switch-track > .ui-switch-ripple {
    inset: auto;
    top: -6px;
    left: -6px;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    color: var(--gcn-switch-off);
    transition: transform var(--gcn-duration-base) var(--gcn-ease-out);
  }

  .ui-switch-track[aria-checked='true'] > .ui-switch-ripple {
    color: var(--gcn-switch-on);
    transform: translateX(16px);
  }

  /*
 * 紧凑（格子里并排的开关）：轨道 28×16、滑块 12；自带内边距，标签区连同左侧、上下内边距占满，点任意处都切换。
 * 标签放不下时折行，各行等宽（英文按词断成两行）
 */
  .ui-switch-compact {
    gap: 0;
    min-height: var(--gcn-control-sm);
    padding-right: 6px;
  }

  .ui-switch-compact .ui-switch-label {
    flex: 1 1 auto;
    min-width: 0;
    align-self: stretch;
    display: flex;
    align-items: center;
    padding: 4px 6px 4px 8px;
    overflow-wrap: anywhere;
    text-wrap: balance;
  }

  .ui-switch-compact .ui-switch-track {
    width: 28px;
    height: 16px;
    border-radius: 8px;
  }

  .ui-switch-compact .ui-switch-knob {
    width: 12px;
    height: 12px;
  }

  .ui-switch-compact .ui-switch-track[aria-checked='true'] .ui-switch-knob,
  .ui-switch-compact .ui-switch-track[aria-checked='true'] > .ui-switch-ripple {
    transform: translateX(12px);
  }

  .ui-switch-compact .ui-switch-track > .ui-switch-ripple {
    top: -6px;
    left: -6px;
    width: 28px;
    height: 28px;
  }

  @media (prefers-reduced-motion: reduce) {
    .ui-switch-track,
    .ui-switch-knob,
    .ui-switch-track > .ui-switch-ripple {
      transition: none;
    }
  }

  /* 高对比度模式：系统会替换背景色，开与关只靠底色就分不出来；改用系统色描边与填充 */
  @media (forced-colors: active) {
    .ui-switch-track {
      background: Canvas;
      border: 1px solid ButtonText;
      forced-color-adjust: none;
    }

    .ui-switch-knob {
      top: 1px;
      left: 1px;
      background: ButtonText;
      box-shadow: none;
    }

    .ui-switch-track[aria-checked='true'] {
      background: Highlight;
      border-color: Highlight;
    }

    .ui-switch-track[aria-checked='true'] .ui-switch-knob {
      background: HighlightText;
    }

    .ui-switch-track:disabled {
      border-color: GrayText;
      opacity: 1;
    }

    .ui-switch-track:disabled .ui-switch-knob {
      background: GrayText;
    }

    .ui-switch-track[aria-checked='true']:disabled {
      background: GrayText;
    }

    .ui-switch-track[aria-checked='true']:disabled .ui-switch-knob {
      background: Canvas;
    }
  }
</style>
