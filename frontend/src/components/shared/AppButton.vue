<template>
  <button
    :class="['app-button', `variant-${variant}`, `size-${size}`, { 'is-loading': loading, 'is-disabled': disabled || loading }]"
    :disabled="disabled || loading"
    v-bind="$attrs"
  >
    <span v-if="loading" class="spinner"></span>
    <span v-if="$slots.icon && !loading" class="icon-slot">
      <slot name="icon"></slot>
    </span>
    <span class="content-slot">
      <slot></slot>
    </span>
  </button>
</template>

<script setup>
defineProps({
  variant: { type: String, default: 'primary' }, // primary, secondary, danger, ghost
  size: { type: String, default: 'md' }, // sm, md, lg
  loading: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false }
})
</script>

<style scoped>
.app-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  border-radius: var(--radius-md);
  font-weight: 500;
  transition: all var(--transition-fast);
  cursor: pointer;
  white-space: nowrap;
}
.app-button:active:not(.is-disabled) { transform: scale(0.98); }
.app-button.is-disabled { opacity: 0.6; cursor: not-allowed; }

.size-sm { padding: var(--space-1) var(--space-3); font-size: var(--font-size-sm); }
.size-md { padding: var(--space-2) var(--space-4); font-size: var(--font-size-md); }
.size-lg { padding: var(--space-3) var(--space-6); font-size: var(--font-size-lg); }

.variant-primary {
  background-color: var(--c-primary);
  color: var(--c-text-inverse);
}
.variant-primary:hover:not(.is-disabled) { background-color: var(--c-primary-light); }

.variant-secondary {
  background-color: var(--c-secondary);
  color: var(--c-primary-dark);
}
.variant-secondary:hover:not(.is-disabled) { background-color: var(--c-border); }

.variant-danger {
  background-color: var(--c-danger);
  color: white;
}
.variant-danger:hover:not(.is-disabled) { background-color: #dc2626; }

.variant-ghost {
  background-color: transparent;
  color: var(--c-text-secondary);
}
.variant-ghost:hover:not(.is-disabled) { background-color: var(--c-bg); color: var(--c-text-primary); }

.spinner {
  width: 1em;
  height: 1em;
  border: 2px solid currentColor;
  border-right-color: transparent;
  border-radius: 50%;
  animation: spin 0.75s linear infinite;
}
@keyframes spin { 100% { transform: rotate(360deg); } }
</style>
