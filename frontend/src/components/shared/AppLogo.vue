<template>
  <div class="flex items-center gap-3">
    <div
      class="relative flex items-center justify-center rounded-[22px] bg-gradient-to-br from-primary-container to-primary text-on-primary shadow-[0_16px_30px_-14px_rgba(0,74,198,0.5)]"
      :style="{ width: pixelSize, height: pixelSize }"
    >
      <img src="../../../public/favicon.ico" alt="" class="h-full w-full object-cover">
    </div>

    <div v-if="showText" class="leading-none">
      <span class="block font-['Sora'] text-xl font-[700] tracking-[-0.04em] text-primary">Taskify</span>
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
