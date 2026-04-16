<template>
  <div class="app-spinner-wrapper" :class="{ 'is-overlay': overlay }">
    <div class="spinner" :style="{ width: size, height: size, borderWidth: thickness }"></div>
  </div>
</template>

<script setup>
defineProps({
  size: { type: String, default: '2rem' },
  thickness: { type: String, default: '3px' },
  overlay: { type: Boolean, default: false }
})
</script>

<style scoped>
.app-spinner-wrapper { display: inline-flex; align-items: center; justify-content: center; }
.is-overlay {
  position: absolute; top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(255, 255, 255, 0.7);
  z-index: 10;
}
[data-theme='dark'] .is-overlay { background: rgba(15, 23, 42, 0.7); }
.spinner {
  border-style: solid;
  border-color: var(--c-primary-alpha);
  border-right-color: var(--c-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin { 100% { transform: rotate(360deg); } }
</style>
