<template>
  <AppCard :title="title" class="chart-card">
    <div v-if="loading" class="chart-state">
      <AppSpinner />
    </div>
    <div v-else-if="error" class="chart-state">
      <AppEmptyState title="Unable to load chart" :description="error" />
    </div>
    <div v-else-if="empty" class="chart-state">
      <AppEmptyState :title="emptyTitle" :description="emptyDescription" />
    </div>
    <slot v-else />
  </AppCard>
</template>

<script setup>
defineProps({
  title: { type: String, required: true },
  loading: Boolean,
  error: String,
  empty: Boolean,
  emptyTitle: { type: String, default: 'No chart data yet' },
  emptyDescription: {
    type: String,
    default: 'Data will appear here once tasks are available.'
  }
})
</script>

<style scoped>
.chart-card {
  min-height: 380px;
}

.chart-state {
  min-height: 280px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
