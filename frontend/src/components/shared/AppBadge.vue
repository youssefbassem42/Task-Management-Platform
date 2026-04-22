<template>
  <span class="app-badge text-status" :style="badgeStyle">
    <slot>{{ resolvedText }}</slot>
  </span>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  text: String,
  variant: { type: String, default: 'primary' }
})

const resolvedText = computed(() => {
  return props.text ? String(props.text).toUpperCase() : ''
})

const badgeStyle = computed(() => {
  const norm = String(props.text || props.variant).toUpperCase().replace(/_/g, ' ')
  if (norm.includes('DONE') || norm.includes('COMPLETED')) {
    return { backgroundColor: 'var(--c-secondary)', color: '#ffffff' } // Mint green, white text
  }
  if (norm.includes('TODO') || norm.includes('TO DO')) {
    return { backgroundColor: 'var(--c-primary-fixed)', color: 'var(--c-on-primary-fixed)' } 
  }
  if (norm.includes('PROGRESS') || norm.includes('IN PROGRESS')) {
    return { backgroundColor: 'var(--c-tertiary-fixed)', color: 'var(--c-on-tertiary-fixed)' } 
  }
  if (norm.includes('BLOCK') || norm.includes('REVIEW')) {
    return { backgroundColor: 'var(--c-surface-dim)', color: 'var(--c-on-surface-variant)' }
  }
  if (norm === 'HIGH' || norm === 'URGENT') {
    return { backgroundColor: '#fee2e2', color: '#ef4444' }
  }
  return { backgroundColor: 'var(--c-surface-container-high)', color: 'var(--c-on-surface)' }
})
</script>

<style scoped>
.app-badge {
  display: inline-flex;
  align-items: center;
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-full);
  line-height: normal;
  white-space: nowrap;
}
</style>
