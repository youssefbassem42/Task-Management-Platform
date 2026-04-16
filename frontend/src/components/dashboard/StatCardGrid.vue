<template>
  <div class="stat-grid">
    <AppCard v-for="(stat, idx) in stats" :key="idx" class="stat-card">
      <div class="stat-content">
        <div class="stat-info">
          <p class="stat-label text-muted">{{ stat.label }}</p>
          <h3 class="stat-value">{{ stat.value }}</h3>
        </div>
        <div class="stat-icon" :style="{ color: stat.color, backgroundColor: stat.bgColor }">
          <slot :name="`icon-${idx}`">{{ stat.icon }}</slot>
        </div>
      </div>
    </AppCard>
  </div>
</template>

<script setup>
defineProps({
  stats: { type: Array, required: true } // { label, value, color, bgColor, icon? }
})
</script>

<style scoped>
.stat-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--space-4);
  margin-bottom: var(--space-6);
}
.stat-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.stat-label { font-size: var(--font-size-sm); margin-bottom: var(--space-1); font-weight: 500; }
.stat-value { font-size: var(--font-size-2xl); margin: 0; }
.stat-icon {
  width: 48px; height: 48px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 1.5rem;
}
</style>
