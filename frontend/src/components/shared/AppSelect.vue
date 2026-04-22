<template>
  <div class="app-select-wrapper">
    <label v-if="label" class="app-label">{{ label }}</label>
    <select
      :value="multiple ? undefined : modelValue"
      :multiple="multiple"
      :disabled="disabled"
      @change="handleChange"
      class="app-select"
      :class="{ 'has-error': error, 'is-multiple': multiple }"
    >
      <option v-if="placeholder" value="" disabled>{{ placeholder }}</option>
      <option
        v-for="option in options"
        :key="option.value"
        :value="option.value"
        :selected="multiple && Array.isArray(modelValue) ? modelValue.includes(option.value) : undefined"
      >
        {{ option.label || option.text }}
      </option>
    </select>
    <span v-if="error" class="error-msg">{{ error }}</span>
  </div>
</template>

<script setup>
defineProps({
  label: String,
  options: { type: Array, default: () => [] },
  modelValue: { type: [String, Number, Array], default: '' },
  placeholder: String,
  error: String,
  multiple: Boolean,
  disabled: Boolean
})
const emit = defineEmits(['update:modelValue'])

function handleChange(event) {
  if (event.target.multiple) {
    const values = Array.from(event.target.selectedOptions).map((option) => option.value)
    emit('update:modelValue', values)
    return
  }

  emit('update:modelValue', event.target.value)
}
</script>

<style scoped>
.app-select-wrapper { display: flex; flex-direction: column; gap: var(--space-2); width: 100%; }
.app-label { font-size: var(--font-size-xs); font-weight: 700; color: var(--c-text-secondary); text-transform: uppercase; letter-spacing: 0.12em; }
.app-select {
  width: 100%;
  min-height: 3rem;
  padding: 0.875rem 1rem;
  border: 1px solid var(--c-border);
  border-radius: var(--radius-md);
  background-color: var(--c-surface-container-highest);
  color: var(--c-text-primary);
  outline: none;
  transition: all var(--transition-normal);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.7);
}
.app-select.is-multiple {
  min-height: 140px;
}
.app-select:focus {
  border-color: rgba(37, 99, 235, 0.25);
  background-color: var(--c-surface-container-lowest);
  box-shadow: var(--shadow-glow);
}
.app-select.has-error {
  border-color: rgba(186, 26, 26, 0.35);
  background-color: rgba(255, 218, 214, 0.7);
}
.app-select:disabled { opacity: 0.7; cursor: not-allowed; }
.error-msg { font-size: var(--font-size-xs); color: var(--c-danger); font-weight: 600; }
</style>
