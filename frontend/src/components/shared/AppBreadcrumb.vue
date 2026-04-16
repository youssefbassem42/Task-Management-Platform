<template>
  <nav class="app-breadcrumb">
    <ol>
      <li v-for="(item, index) in items" :key="index">
        <router-link v-if="item.to && index < items.length - 1" :to="item.to" class="breadcrumb-link">{{ item.label }}</router-link>
        <span v-else class="breadcrumb-current">{{ item.label }}</span>
        <span v-if="index < items.length - 1" class="separator">/</span>
      </li>
    </ol>
  </nav>
</template>

<script setup>
defineProps({
  items: { type: Array, required: true } // Array of { label, to? }
})
</script>

<style scoped>
.app-breadcrumb ol { display: flex; align-items: center; flex-wrap: wrap; margin: 0; padding: 0; }
.app-breadcrumb li { display: inline-flex; align-items: center; font-size: var(--font-size-sm); }
.breadcrumb-link { color: var(--c-text-muted); font-weight: 500; }
.breadcrumb-link:hover { color: var(--c-primary); }
.breadcrumb-current { color: var(--c-text-primary); font-weight: 600; }
.separator { margin: 0 var(--space-2); color: var(--c-text-muted); font-size: 0.8em; }
</style>
