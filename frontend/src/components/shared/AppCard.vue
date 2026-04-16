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
  background-color: var(--c-bg-surface);
  border: 1px solid var(--c-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  display: flex;
  flex-direction: column;
  transition: box-shadow var(--transition-fast), transform var(--transition-fast);
  overflow: hidden;
}
.hover-effect { cursor: pointer; }
.hover-effect:hover { box-shadow: var(--shadow-md); transform: translateY(-2px); border-color: var(--c-primary-light); }
.card-header {
  padding: var(--space-4) var(--space-4) var(--space-2);
  border-bottom: 1px solid var(--c-border-light);
}
.card-title { margin: 0; font-size: var(--font-size-lg); }
.card-body { padding: var(--space-4); flex-grow: 1; }
.card-footer { padding: var(--space-2) var(--space-4); background: var(--c-bg); border-top: 1px solid var(--c-border-light); }
</style>
