<template>
  <div class="flex items-center gap-3">
    <div
      class="relative flex items-center justify-center rounded-[22px] bg-gradient-to-br from-primary-container to-primary text-on-primary shadow-[0_16px_30px_-14px_rgba(0,74,198,0.5)]"
      :style="{ width: pixelSize, height: pixelSize }"
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" class="h-[70%] w-[70%]" fill="none">
        <rect x="8" y="8" width="48" height="48" rx="18" fill="rgba(255,255,255,0.14)" />
        <path d="M20 33.5L28 41.5L45.5 22.5" stroke="white" stroke-width="5.5" stroke-linecap="round" stroke-linejoin="round" />
        <path d="M19 23.5H31" stroke="white" stroke-width="4" stroke-linecap="round" opacity="0.85" />
        <path d="M19 15.5H39" stroke="white" stroke-width="4" stroke-linecap="round" opacity="0.55" />
      </svg>
      <span class="absolute inset-[2px] rounded-[20px] border border-white/15"></span>
    </div>

    <div v-if="showText" class="leading-none">
      <span class="block font-['Sora'] text-xl font-[700] tracking-[-0.04em] text-primary">Taskify</span>
      <span class="block pt-1 text-[10px] font-semibold uppercase tracking-[0.34em] text-on-surface-variant">Workflow OS</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  size: {
    type: [Number, String],
    default: 36
  },
  showText: {
    type: Boolean,
    default: true
  }
})

const pixelSize = computed(() => (typeof props.size === 'number' ? `${props.size}px` : props.size))
</script>
