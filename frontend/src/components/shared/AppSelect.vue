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
.app-select-wrapper { display: flex; flex-direction: column; gap: var(--space-1); width: 100%; }
.app-label { font-size: var(--font-size-sm); font-weight: 500; color: var(--c-text-secondary); }
.app-select {
  width: 100%;
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--c-border);
  border-radius: var(--radius-md);
  background-color: var(--c-bg-surface);
  color: var(--c-text-primary);
  outline: none;
}
.app-select.is-multiple {
  min-height: 140px;
}
.app-select:focus { border-color: var(--c-primary); box-shadow: 0 0 0 3px var(--c-primary-alpha); }
.app-select.has-error { border-color: var(--c-danger); }
.app-select:disabled { opacity: 0.7; cursor: not-allowed; }
.error-msg { font-size: var(--font-size-xs); color: var(--c-danger); }
</style>
