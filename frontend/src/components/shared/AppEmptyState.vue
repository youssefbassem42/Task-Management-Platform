<template>
  <div class="app-empty-state">
    <div class="icon-container">
      <slot name="icon">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" class="default-icon">
          <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </slot>
    </div>
    <h3 class="title">{{ title }}</h3>
    <p v-if="description" class="description text-muted">{{ description }}</p>
    <div v-if="$slots.action" class="action">
      <slot name="action"></slot>
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: { type: String, required: true },
  description: String
})
</script>

<style scoped>
.app-empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: var(--space-12) var(--space-4);
  border: 1px dashed rgba(115, 118, 134, 0.24);
  border-radius: var(--radius-lg);
  background: linear-gradient(180deg, rgba(255,255,255,0.72), rgba(242,244,246,0.85));
}
.icon-container {
  color: var(--c-primary);
  margin-bottom: var(--space-4);
  background: rgba(219, 225, 255, 0.7);
  width: 96px; height: 96px;
  border-radius: 28px;
  display: flex; align-items: center; justify-content: center;
}
.default-icon { width: 48px; height: 48px; }
.title { font-size: var(--font-size-xl); margin-bottom: var(--space-2); font-family: var(--font-family-display); font-weight: 700; letter-spacing: -0.03em; }
.description { max-width: 400px; margin: 0 auto var(--space-6); color: var(--c-text-secondary); }
</style>
