<template>
  <Teleport to="body">
    <div class="toast-container">
      <TransitionGroup name="slide-fade">
        <div v-for="toast in toasts" :key="toast.id" class="app-toast" :class="`toast-${toast.type}`">
          <span class="icon material-symbols-outlined">{{ getToastIcon(toast.type) }}</span>
          <span class="message">{{ toast.message }}</span>
          <button class="close-btn material-symbols-outlined" @click="uiStore.removeToast(toast.id)">close</button>
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

const getToastIcon = (type) => {
  if (type === 'success') return 'check_circle'
  if (type === 'error') return 'error'
  if (type === 'warning') return 'warning'
  return 'info'
}
</script>

<style scoped>
.toast-container {
  position: fixed;
  top: var(--space-6);
  right: var(--space-6);
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  z-index: 9999;
}
.app-toast {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
  border-radius: 20px;
  box-shadow: 0 20px 50px -24px rgba(0, 37, 102, 0.3);
  min-width: min(360px, calc(100vw - 2rem));
  border: 1px solid rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(18px);
}
.toast-success { background: rgba(220, 252, 231, 0.94); color: #166534; }
.toast-error { background: rgba(255, 218, 214, 0.96); color: #93000a; }
.toast-warning { background: rgba(255, 239, 204, 0.96); color: #7c4a03; }
.toast-info { background: rgba(219, 225, 255, 0.96); color: #003ea8; }
.icon { font-size: 1.15rem; }
.message { flex-grow: 1; font-weight: 600; font-size: var(--font-size-sm); line-height: 1.4; }
.close-btn {
  background: rgba(255, 255, 255, 0.55);
  border: none;
  color: inherit;
  cursor: pointer;
  opacity: 0.85;
  font-size: 1rem;
  width: 1.9rem;
  height: 1.9rem;
  border-radius: 999px;
}
.close-btn:hover { opacity: 1; background: rgba(255, 255, 255, 0.88); }

.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.2s ease;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
