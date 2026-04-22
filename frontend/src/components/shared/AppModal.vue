<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="modelValue" class="modal-backdrop" @click.self="close">
        <Transition name="modal" appear>
          <div class="modal-content" :class="`size-${size}`">
            <header class="modal-header">
              <h3 class="modal-title">{{ title }}</h3>
              <button class="close-btn" @click="close">&times;</button>
            </header>
            <div class="modal-body">
              <slot></slot>
            </div>
            <footer v-if="$slots.footer" class="modal-footer">
              <slot name="footer"></slot>
            </footer>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { watch } from 'vue'

const props = defineProps({
  modelValue: Boolean,
  title: String,
  size: { type: String, default: 'md' } // sm, md, lg
})
const emit = defineEmits(['update:modelValue', 'close'])

const close = () => {
  emit('update:modelValue', false)
  emit('close')
}

watch(() => props.modelValue, (val) => {
  if (val) document.body.style.overflow = 'hidden'
  else document.body.style.overflow = ''
})
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background:
    radial-gradient(circle at top, rgba(180, 197, 255, 0.18), transparent 28%),
    rgba(25, 28, 30, 0.42);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(12px);
}
.modal-content {
  background: linear-gradient(180deg, rgba(255,255,255,0.95), rgba(242,244,246,0.98));
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  display: flex;
  flex-direction: column;
  max-height: 90vh;
  margin: var(--space-4);
}
.size-sm { width: min(420px, calc(100vw - 2rem)); }
.size-md { width: min(640px, calc(100vw - 2rem)); }
.size-lg { width: min(880px, calc(100vw - 2rem)); }
.modal-header {
  padding: var(--space-5) var(--space-5) var(--space-4);
  border-bottom: 1px solid rgba(115, 118, 134, 0.14);
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.modal-title { margin: 0; font-family: var(--font-family-display); font-size: 1.25rem; font-weight: 700; letter-spacing: -0.03em; }
.close-btn {
  width: 2.25rem;
  height: 2.25rem;
  font-size: 1.2rem;
  color: var(--c-text-muted);
  cursor: pointer;
  border: none;
  background: rgba(255,255,255,0.65);
  border-radius: 999px;
}
.close-btn:hover { color: var(--c-text-primary); background: white; }
.modal-body { padding: 0 var(--space-5) var(--space-5); overflow-y: auto; }
.modal-footer { padding: 0 var(--space-5) var(--space-5); display: flex; justify-content: flex-end; gap: var(--space-4); }
</style>
