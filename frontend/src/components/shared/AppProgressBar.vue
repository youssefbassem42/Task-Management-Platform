<template>
  <div class="progress-wrapper">
    <div class="progress-header" v-if="showLabel">
      <span class="label">Progress</span>
      <span class="value">{{ Math.round(value) }}%</span>
    </div>
    <div class="progress-bar-container">
      <div class="progress-bar-fill" :style="{ width: `${value}%`, backgroundColor: color }"></div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  value: { type: Number, default: 0 },
  color: { type: String, default: 'var(--c-primary)' },
  showLabel: { type: Boolean, default: true }
})
</script>

<style scoped>
.progress-wrapper { width: 100%; display: flex; flex-direction: column; gap: var(--space-1); }
.progress-header { display: flex; justify-content: space-between; font-size: var(--font-size-xs); font-weight: 500; color: var(--c-text-secondary); }
.progress-bar-container { height: 6px; width: 100%; background-color: var(--c-border-light); border-radius: var(--radius-full); overflow: hidden; }
.progress-bar-fill { height: 100%; border-radius: var(--radius-full); transition: width 0.3s ease; }
</style>
