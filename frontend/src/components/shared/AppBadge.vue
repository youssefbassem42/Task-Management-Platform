<template>
  <span class="app-badge" :style="badgeStyle">
    <slot>{{ text }}</slot>
  </span>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  text: String,
  variant: { type: String, default: 'primary' }
})

const badgeStyle = computed(() => {
  const map = {
    DONE: { bg: 'var(--c-success-light)', color: 'var(--c-success)' },
    IN_PROGRESS: { bg: 'var(--c-info-light)', color: 'var(--c-info)' },
    TODO: { bg: 'var(--c-warning-light)', color: 'var(--c-warning)' },
    HIGH: { bg: 'var(--c-danger-light)', color: 'var(--c-danger)' },
    MEDIUM: { bg: 'var(--c-warning-light)', color: 'var(--c-warning)' },
    LOW: { bg: 'var(--c-info-light)', color: 'var(--c-info)' }
  }
  const match = map[props.text] || map[props.variant] || { bg: 'var(--c-border)', color: 'var(--c-text-primary)' }
  return { backgroundColor: match.bg, color: match.color }
})
</script>

<style scoped>
.app-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.125rem 0.625rem;
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  font-weight: 600;
  line-height: normal;
  white-space: nowrap;
}
</style>
