<template>
  <div class="app-avatar" :class="`size-${size}`" :style="{ backgroundImage: src ? `url(${src})` : 'none' }">
    <span v-if="!src">{{ initials }}</span>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { getInitials } from '@/utils/formatters'

const props = defineProps({
  src: String,
  name: String,
  size: { type: String, default: 'md' } // sm, md, lg, xl
})

const initials = computed(() => getInitials(props.name))
</script>

<style scoped>
.app-avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background-color: var(--c-primary-alpha);
  color: var(--c-primary);
  font-weight: 600;
  background-size: cover;
  background-position: center;
  flex-shrink: 0;
}
.size-sm { width: 32px; height: 32px; font-size: 0.75rem; }
.size-md { width: 40px; height: 40px; font-size: 0.875rem; }
.size-lg { width: 56px; height: 56px; font-size: 1.25rem; }
.size-xl { width: 80px; height: 80px; font-size: 1.5rem; }
</style>
