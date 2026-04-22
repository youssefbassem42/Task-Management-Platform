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
        :class="{ 'with-icon': $slots.icon, 'pr-12': $slots.trailing }"
      />
      <span v-if="$slots.trailing" class="trailing-slot">
        <slot name="trailing"></slot>
      </span>
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
.app-input-wrapper { display: flex; flex-direction: column; gap: var(--space-2); width: 100%; }
.app-label { font-size: var(--font-size-xs); font-weight: 700; color: var(--c-on-surface-variant); text-transform: uppercase; letter-spacing: 0.12em; }
.input-container { position: relative; display: flex; align-items: center; }
.input-icon,
.trailing-slot { position: absolute; color: var(--c-on-surface-variant); display: flex; z-index: 1; }
.input-icon { left: var(--space-4); }
.trailing-slot { right: var(--space-4); }
.app-input {
  width: 100%;
  min-height: 3rem;
  padding: 0.875rem 1rem;
  border: 1px solid transparent;
  border-radius: var(--radius-md);
  background-color: var(--c-surface-container-highest);
  color: var(--c-on-surface);
  transition: all var(--transition-normal);
  outline: none;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.7);
}
.app-input::placeholder { color: rgba(115, 118, 134, 0.9); }
.app-input.with-icon { padding-left: 2.9rem; }
.app-input:focus { 
  background-color: var(--c-surface-container-lowest);
  border-color: rgba(37, 99, 235, 0.25);
  box-shadow: var(--shadow-glow);
}
.has-error .app-input {
  border-color: rgba(186, 26, 26, 0.35);
  background-color: rgba(255, 218, 214, 0.7);
}
.has-error .input-icon,
.has-error .trailing-slot,
.error-msg { color: var(--c-danger); }
.error-msg { font-size: var(--font-size-xs); font-weight: 600; }
</style>
