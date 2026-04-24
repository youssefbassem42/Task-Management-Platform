<template>
  <Transition name="sidebar-overlay">
    <div v-if="uiStore.mobileDrawerOpen" class="fixed inset-0 z-40 bg-slate-950/30 backdrop-blur-sm md:hidden" @click="uiStore.toggleMobileDrawer()"></div>
  </Transition>

  <aside
    class="fixed bottom-0 left-0 top-16 z-50 flex w-72 flex-col border-r border-white/60 bg-surface-container-low/85 px-4 py-5 backdrop-blur-xl transition-transform duration-300 md:translate-x-0"
    :class="uiStore.mobileDrawerOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'"
  >

    <nav class="mt-6 flex flex-1 flex-col gap-2">
      <router-link
        v-for="item in items"
        :key="item.label"
        :to="item.to"
        class="group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition"
        :class="isActive(item) ? 'bg-white text-primary shadow-sm shadow-primary/5' : 'text-on-surface-variant hover:bg-white/75 hover:text-primary'"
        @click="closeOnMobile"
      >
        <span class="material-symbols-outlined transition-transform duration-200 group-hover:translate-x-0.5" :style="isActive(item) ? `font-variation-settings: 'FILL' 1;` : ''">
          {{ item.icon }}
        </span>
        <span>{{ item.label }}</span>
        <span
          v-if="item.badge && item.badge() > 0"
          class="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white shadow"
        >
          {{ item.badge() > 99 ? '99+' : item.badge() }}
        </span>
      </router-link>
    </nav>

    <div class="rounded-[28px] border border-white/70 bg-white/78 p-4 shadow-sm">
      <p class="text-sm font-semibold text-on-surface">Need a new board?</p>
      <p class="mt-1 text-xs leading-5 text-on-surface-variant">Spin up a new delivery space with the same polished UI language as the reference screens.</p>
      <button
        @click="$emit('createBoard'); closeOnMobile()"
        class="mt-4 w-full rounded-full bg-gradient-to-br from-primary-container to-primary px-4 py-3 text-sm font-semibold text-on-primary shadow-[0_14px_26px_-18px_rgba(0,74,198,0.7)] transition hover:brightness-110 active:scale-[0.98]"
      >
        Create Board
      </button>
    </div>

    <!-- Logout button -->
    <button
      @click="handleLogout"
      class="mt-4 flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50"
    >
      <span class="material-symbols-outlined text-[22px]">logout</span>
      <span>Sign Out</span>
    </button>
  </aside>
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router'
import { useUIStore } from '@/stores/uiStore'
import { useAuthStore } from '@/stores/authStore'
import { useNotificationStore } from '@/stores/notificationStore'
import { useMessageStore } from '@/stores/messageStore'

const route = useRoute()
const router = useRouter()
const uiStore = useUIStore()
const authStore = useAuthStore()
const notificationStore = useNotificationStore()
const messageStore = useMessageStore()

defineEmits(['createBoard'])

const items = [
  { label: 'Dashboard', to: '/dashboard', icon: 'grid_view' },
  { label: 'Boards', to: '/boards', icon: 'view_kanban' },
  { label: 'Members', to: '/members', icon: 'group' },
  {
    label: 'Chat',
    to: '/chat',
    icon: 'chat',
    badge: () => messageStore.totalUnread
  },
  {
    label: 'Notifications',
    to: '/notifications',
    icon: 'notifications',
    badge: () => notificationStore.unreadCount
  },
  { label: 'Settings', to: '/profile', icon: 'settings' }
]

const isActive = (item) => {
  if (item.to === '/dashboard') return route.path === item.to
  return route.path.startsWith(item.to)
}

const closeOnMobile = () => {
  if (uiStore.mobileDrawerOpen) {
    uiStore.toggleMobileDrawer()
  }
}

const handleLogout = () => {
  closeOnMobile()
  authStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.sidebar-overlay-enter-active,
.sidebar-overlay-leave-active {
  transition: opacity 0.2s ease;
}

.sidebar-overlay-enter-from,
.sidebar-overlay-leave-to {
  opacity: 0;
}
</style>
