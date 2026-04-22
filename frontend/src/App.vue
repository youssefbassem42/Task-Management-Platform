<template>
  <component :is="layout">
  </component>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AuthLayout from '@/layouts/AuthLayout.vue'
import AppLayout from '@/layouts/AppLayout.vue'

const route = useRoute()
const layout = computed(() => {
  if (route.meta.guestOnly || route.name === 'NotFound') return AuthLayout
  return AppLayout
})
</script>
