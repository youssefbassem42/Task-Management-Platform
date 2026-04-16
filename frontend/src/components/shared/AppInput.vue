<template>
  <div class="app-input-wrapper">
    <label v-if="label" class="app-label">{{ label }}</label>
    <div class="input-container" :class="{ 'has-error': error }">
      <span v-if="$slots.icon" class="input-icon">
        <slot name="icon"></slot>
      </span>
      <input
        v-bind="$attrs"
        :value="modelValue"
        @input="$emit('update:modelValue', $event.target.value)"
        class="app-input"
        :class="{ 'with-icon': $slots.icon }"
      />
    </div>
    <span v-if="error" class="error-msg">{{ error }}</span>
  </div>
</template>

<script setup>
defineProps({
  label: String,
  modelValue: [String, Number],
  error: String
})
defineEmits(['update:modelValue'])
</script>

<style scoped>
.app-input-wrapper { display: flex; flex-direction: column; gap: var(--space-1); width: 100%; }
.app-label { font-size: var(--font-size-sm); font-weight: 500; color: var(--c-text-secondary); }
.input-container { position: relative; display: flex; align-items: center; }
.input-icon { position: absolute; left: var(--space-3); color: var(--c-text-muted); display: flex; }
.app-input {
  width: 100%;
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--c-border);
  border-radius: var(--radius-md);
  background-color: var(--c-bg-surface);
  color: var(--c-text-primary);
  transition: all var(--transition-fast);
  outline: none;
}
.app-input.with-icon { padding-left: calc(var(--space-8) + var(--space-1)); }
.app-input:focus { border-color: var(--c-primary); box-shadow: 0 0 0 3px var(--c-primary-alpha); }
.has-error .app-input { border-color: var(--c-danger); }
.has-error .app-input:focus { box-shadow: 0 0 0 3px var(--c-danger-light); }
.error-msg { font-size: var(--font-size-xs); color: var(--c-danger); }
</style>
