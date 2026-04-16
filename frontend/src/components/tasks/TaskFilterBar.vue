<template>
  <div class="filter-bar">
    <div class="left-controls">
      <!-- We can add search input here if needed -->
      <h3 class="title">My Tasks</h3>
    </div>
    <div class="right-controls">
      <div class="tabs">
        <button v-for="tab in tabs" :key="tab.value" 
          class="tab-btn" 
          :class="{ active: modelValue === tab.value }"
          @click="$emit('update:modelValue', tab.value)"
        >
          {{ tab.label }}
        </button>
      </div>
      <AppButton v-if="showCreate" icon="+" variant="primary" @click="$emit('create')">New Task</AppButton>
    </div>
  </div>
</template>

<script setup>
defineProps({
  modelValue: String,
  tabs: { type: Array, default: () => [] },
  showCreate: Boolean
})
defineEmits(['update:modelValue', 'create'])
</script>

<style scoped>
.filter-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-6);
  flex-wrap: wrap;
  gap: var(--space-4);
}
.title { margin: 0; font-size: var(--font-size-xl); }
.right-controls { display: flex; gap: var(--space-4); align-items: center; flex-wrap: wrap; }
.tabs {
  display: flex;
  background: var(--c-bg-surface);
  border: 1px solid var(--c-border);
  border-radius: var(--radius-md);
  padding: 2px;
}
.tab-btn {
  padding: var(--space-1) var(--space-3);
  font-size: var(--font-size-sm);
  font-weight: 500;
  color: var(--c-text-secondary);
  border-radius: calc(var(--radius-md) - 2px);
  transition: all var(--transition-fast);
}
.tab-btn:hover { color: var(--c-text-primary); }
.tab-btn.active {
  background: var(--c-bg);
  color: var(--c-text-primary);
  box-shadow: var(--shadow-sm);
}

@media (max-width: 600px) {
  .filter-bar { flex-direction: column; align-items: stretch; }
  .right-controls { justify-content: space-between; }
}
</style>
