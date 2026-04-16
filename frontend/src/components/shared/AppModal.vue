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
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}
.modal-content {
  background: var(--c-bg-surface);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  display: flex;
  flex-direction: column;
  max-height: 90vh;
  margin: var(--space-4);
}
.size-sm { width: 400px; }
.size-md { width: 600px; }
.size-lg { width: 800px; }
.modal-header {
  padding: var(--space-4);
  border-bottom: 1px solid var(--c-border);
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.modal-title { margin: 0; }
.close-btn { font-size: 1.5rem; color: var(--c-text-muted); cursor: pointer; border: none; background: none; }
.close-btn:hover { color: var(--c-text-primary); }
.modal-body { padding: var(--space-4); overflow-y: auto; }
.modal-footer { padding: var(--space-4); border-top: 1px solid var(--c-border); display: flex; justify-content: flex-end; gap: var(--space-4); }
</style>
