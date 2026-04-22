<template>
  <div class="app-card" :class="{ 'hover-effect': hoverable }" @click="hoverable && $emit('click', $event)">
    <div v-if="$slots.header || title" class="card-header">
      <slot name="header">
        <h3 v-if="title" class="card-title">{{ title }}</h3>
      </slot>
    </div>
    <div class="card-body">
      <slot></slot>
    </div>
    <div v-if="$slots.footer" class="card-footer">
      <slot name="footer"></slot>
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: String,
  hoverable: Boolean
})
defineEmits(['click'])
</script>

<style scoped>
.app-card {
  background-color: var(--c-surface-container-lowest);
  border-radius: var(--radius-xl); /* soft minimalist 24px */
  box-shadow: var(--shadow-diffuse); /* Ambient diffuse shadow */
  display: flex;
  flex-direction: column;
  transition: transform var(--transition-fast), box-shadow var(--transition-fast);
  overflow: hidden;
  border: none;
}
.hover-effect { cursor: pointer; }
/* Natural Lift instead of border color */
.hover-effect:hover { 
  transform: translateY(-4px); 
  box-shadow: 0px 16px 40px rgba(25, 28, 30, 0.08); 
}

.card-header {
  padding: var(--space-6) var(--space-6) var(--space-2);
}
.card-header + .card-body {
  padding-top: var(--space-2);
}
.card-title { margin: 0; font-size: var(--font-size-xl); }
.card-body { padding: var(--space-6); flex-grow: 1; }
/* Distinguish footer by moving to surface_container_low instead of 1px border */
.card-footer { 
  padding: var(--space-4) var(--space-6); 
  background: var(--c-surface-container-low); 
}
</style>
