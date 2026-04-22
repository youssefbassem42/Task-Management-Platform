<template>
  <button
    :class="buttonClasses"
    :disabled="disabled || loading"
    v-bind="$attrs"
  >
    <span v-if="loading" class="inline-flex h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent"></span>
    <span v-if="$slots.icon && !loading" class="inline-flex shrink-0 items-center">
      <slot name="icon"></slot>
    </span>
    <span class="inline-flex items-center">
      <slot></slot>
    </span>
  </button>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  variant: { type: String, default: 'primary' }, // primary, secondary, danger, ghost
  size: { type: String, default: 'md' }, // sm, md, lg
  loading: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false }
})

const buttonClasses = computed(() => {
  const classes = [
    'inline-flex items-center justify-center gap-2 rounded-full border font-semibold tracking-tight transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-primary/10 disabled:cursor-not-allowed disabled:opacity-60'
  ]

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-5 py-3 text-sm',
    lg: 'px-6 py-3.5 text-base'
  }

  const variants = {
    primary: 'border-transparent bg-gradient-to-br from-primary-container to-primary text-on-primary shadow-[0_14px_28px_-16px_rgba(0,74,198,0.65)] hover:brightness-110 active:scale-[0.98]',
    secondary: 'border-outline-variant/70 bg-surface-container-lowest text-on-surface hover:border-primary/30 hover:text-primary hover:bg-white',
    danger: 'border-transparent bg-error text-on-error shadow-[0_14px_24px_-16px_rgba(186,26,26,0.6)] hover:brightness-110 active:scale-[0.98]',
    ghost: 'border-transparent bg-transparent text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
  }

  classes.push(sizes[props.size] || sizes.md)
  classes.push(variants[props.variant] || variants.primary)

  return classes.join(' ')
})
</script>
