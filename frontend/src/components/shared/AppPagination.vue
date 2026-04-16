<template>
  <div class="app-pagination" v-if="totalPages > 1">
    <button class="page-btn" :disabled="currentPage === 1" @click="emitPage(currentPage - 1)">« Prev</button>
    
    <div class="pages">
      <button 
        v-for="page in displayedPages" 
        :key="page"
        class="page-btn"
        :class="{ active: page === currentPage, ellipsis: page === '...' }"
        :disabled="page === '...'"
        @click="page !== '...' && emitPage(page)"
      >
        {{ page }}
      </button>
    </div>

    <button class="page-btn" :disabled="currentPage === totalPages" @click="emitPage(currentPage + 1)">Next »</button>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  currentPage: { type: Number, required: true },
  totalPages: { type: Number, required: true }
})
const emit = defineEmits(['update:currentPage'])

const emitPage = (page) => {
  emit('update:currentPage', page)
}

const displayedPages = computed(() => {
  const current = props.currentPage;
  const total = props.totalPages;
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  if (current <= 4) return [1, 2, 3, 4, 5, '...', total];
  if (current >= total - 3) return [1, '...', total - 4, total - 3, total - 2, total - 1, total];
  return [1, '...', current - 1, current, current + 1, '...', total];
});
</script>

<style scoped>
.app-pagination { display: flex; align-items: center; justify-content: center; gap: var(--space-2); margin-top: var(--space-4); }
.pages { display: flex; gap: var(--space-1); }
.page-btn {
  padding: var(--space-1) var(--space-3);
  border: 1px solid var(--c-border);
  background: var(--c-bg-surface);
  color: var(--c-text-primary);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all var(--transition-fast);
  font-size: var(--font-size-sm);
}
.page-btn:hover:not(:disabled) { background: var(--c-bg); border-color: var(--c-border); }
.page-btn.active { background: var(--c-primary); color: white; border-color: var(--c-primary); font-weight: 600; }
.page-btn:disabled { cursor: not-allowed; opacity: 0.5; }
.page-btn.ellipsis { border: none; background: transparent; cursor: default; padding: var(--space-1); min-width: 20px; }
</style>
