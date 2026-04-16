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
  // Use AuthLayout if route explicitly sets guestOnly, otherwise AppLayout (includes Dashboard etc.)
  // If route is 404, we can render AppLayout or a separate layout. Let's use AuthLayout for 404 visually (no sidebar).
  if (route.meta.guestOnly || route.name === 'NotFound') return AuthLayout
  return AppLayout
})
</script>
