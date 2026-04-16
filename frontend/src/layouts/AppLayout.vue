<template>
  <div class="app-layout" :class="{ 'sidebar-collapsed': uiStore.sidebarCollapsed }">
    <TheSidebar />
    <div class="main-content">
      <TheTopBar />
      <main class="page-content">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>
    </div>
    <AppToast />
    <AppConfirmDialog />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useUIStore } from '@/stores/uiStore'
import { useAuthStore } from '@/stores/authStore'
import TheSidebar from '@/components/layout/TheSidebar.vue'
import TheTopBar from '@/components/layout/TheTopBar.vue'

const uiStore = useUIStore()
const authStore = useAuthStore()

onMounted(() => {
  // Can fetch global config or verify token
  authStore.initializeAuth();
})
</script>

<style scoped>
.app-layout {
  display: flex;
  height: 100vh;
  overflow: hidden;
  background-color: var(--c-bg);
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  transition: margin-left var(--transition-normal);
}

.page-content {
  flex: 1;
  padding: var(--space-6);
  overflow-y: auto;
}

@media (max-width: 768px) {
  .page-content { padding: var(--space-4); }
}
</style>
