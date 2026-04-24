<template>
  <div class="min-h-screen bg-surface font-body text-on-surface">
    <TheTopBar />

    <div class="flex min-h-screen pt-16">
      <TheSidebar @createBoard="openCreateBoardModal" />

      <main class="min-w-0 flex-1 px-4 pb-8 pt-6 md:ml-72 md:px-6 lg:px-8 lg:pt-8">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <div class="mx-auto max-w-7xl">
              <component :is="Component" />
            </div>
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
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { useNotificationStore } from '@/stores/notificationStore'
import TheSidebar from '@/components/layout/TheSidebar.vue'
import TheTopBar from '@/components/layout/TheTopBar.vue'

const authStore = useAuthStore()
const notificationStore = useNotificationStore()
const router = useRouter()

const openCreateBoardModal = () => {
  router.push('/boards?create=true')
}

onMounted(() => {
  authStore.initializeAuth();
  notificationStore.fetchNotifications().catch(() => {});
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
