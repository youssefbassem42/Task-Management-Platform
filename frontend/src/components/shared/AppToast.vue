<template>
  <Teleport to="body">
    <div class="toast-container">
      <TransitionGroup name="slide-fade">
        <div v-for="toast in toasts" :key="toast.id" class="app-toast" :class="`toast-${toast.type}`">
          <span class="icon">
             <template v-if="toast.type === 'success'">✓</template>
             <template v-else-if="toast.type === 'error'">!</template>
             <template v-else>i</template>
          </span>
          <span class="message">{{ toast.message }}</span>
          <button class="close-btn" @click="uiStore.removeToast(toast.id)">&times;</button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup>
import { computed } from 'vue'
import { useUIStore } from '@/stores/uiStore'

const uiStore = useUIStore()
const toasts = computed(() => uiStore.toasts)
</script>

<style scoped>
.toast-container {
  position: fixed;
  bottom: var(--space-6);
  right: var(--space-6);
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  z-index: 9999;
}
.app-toast {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  color: white;
  min-width: 250px;
}
.toast-success { background-color: var(--c-success); }
.toast-error { background-color: var(--c-danger); }
.toast-warning { background-color: var(--c-warning); }
.toast-info { background-color: var(--c-info); }
.message { flex-grow: 1; font-weight: 500; font-size: var(--font-size-sm); }
.close-btn { background: none; border: none; color: white; cursor: pointer; opacity: 0.8; font-size: 1.25rem; }
.close-btn:hover { opacity: 1; }
</style>
