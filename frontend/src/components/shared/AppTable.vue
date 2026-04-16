<template>
  <div class="app-table-wrapper">
    <table class="app-table">
      <thead>
        <tr>
          <th
            v-for="col in columns"
            :key="col.key || col.label"
            :style="col.style"
            :class="{ sortable: col.sortable }"
            @click="col.sortable && handleSort(col)"
          >
            {{ col.label }}
            <span v-if="col.sortable" class="sort-icon">
              {{ sortIndicator(col.key) }}
            </span>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="loading">
          <td :colspan="columns.length" class="text-center p-6"><AppSpinner /></td>
        </tr>
        <tr v-else-if="!data || data.length === 0">
          <td :colspan="columns.length" class="text-center p-6 text-muted">No data available</td>
        </tr>
        <tr v-else v-for="(row, idx) in data" :key="row._id || row.id || idx" @click="hoverable && $emit('row-click', row)" :class="{ 'hoverable': hoverable }">
          <td v-for="col in columns" :key="col.key || col.label" :style="col.style">
            <slot :name="col.key" :row="row" :value="row[col.key]">
               {{ typeof col.formatter === 'function' ? col.formatter(row[col.key], row) : row[col.key] }}
            </slot>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import AppSpinner from './AppSpinner.vue'

const props = defineProps({
  columns: { type: Array, required: true }, // { label, key, sortable?, formatter?, style? }
  data: { type: Array, default: () => [] },
  loading: Boolean,
  hoverable: Boolean,
  sortKey: { type: String, default: '' },
  sortDirection: { type: String, default: 'asc' }
})
const emit = defineEmits(['sort', 'row-click'])

const handleSort = (col) => {
  emit('sort', col.key)
}

const sortIndicator = (key) => {
  if (props.sortKey !== key) {
    return '↕'
  }

  return props.sortDirection === 'desc' ? '↓' : '↑'
}
</script>

<style scoped>
.app-table-wrapper { width: 100%; overflow-x: auto; background: var(--c-bg-surface); border-radius: var(--radius-md); border: 1px solid var(--c-border); }
.app-table { width: 100%; border-collapse: collapse; text-align: left; }
.app-table th { padding: var(--space-3) var(--space-4); border-bottom: 1px solid var(--c-border); background: var(--c-bg); color: var(--c-text-secondary); font-weight: 600; font-size: var(--font-size-sm); }
.app-table td { padding: var(--space-3) var(--space-4); border-bottom: 1px solid var(--c-border-light); font-size: var(--font-size-sm); color: var(--c-text-primary); }
.app-table tbody tr:last-child td { border-bottom: none; }
.app-table th.sortable { cursor: pointer; user-select: none; }
.app-table th.sortable:hover { color: var(--c-text-primary); }
.sort-icon { display: inline-block; margin-left: var(--space-1); font-size: 0.8em; }
.hoverable { cursor: pointer; transition: background var(--transition-fast); }
.hoverable:hover { background-color: var(--c-primary-alpha); }
</style>
