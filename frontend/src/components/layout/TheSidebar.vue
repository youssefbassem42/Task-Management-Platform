<template>
  <Transition name="sidebar-overlay">
    <div v-if="uiStore.mobileDrawerOpen" class="fixed inset-0 z-40 bg-slate-950/30 backdrop-blur-sm md:hidden" @click="uiStore.toggleMobileDrawer()"></div>
  </Transition>

  <aside
    class="fixed bottom-0 left-0 top-16 z-50 flex flex-col border-r border-white/60 bg-surface-container-low/85 px-4 py-5 backdrop-blur-xl transition-all duration-300 md:translate-x-0"
    :class="[
      uiStore.mobileDrawerOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
      uiStore.sidebarCollapsed ? 'w-[88px] items-center' : 'w-72'
    ]"
  >

    <button
      @click="uiStore.toggleSidebar()"
      class="mb-6 flex h-8 w-8 items-center justify-center rounded-xl text-on-surface-variant transition hover:bg-surface-variant/50 hover:text-primary"
      :class="uiStore.sidebarCollapsed ? '' : 'self-end'"
      title="Toggle Sidebar"
    >
      <span class="material-symbols-outlined text-[20px]">{{ uiStore.sidebarCollapsed ? 'keyboard_double_arrow_right' : 'keyboard_double_arrow_left' }}</span>
    </button>

    <nav class="flex flex-1 flex-col gap-2 w-full">
      <router-link
        v-for="item in items"
        :key="item.label"
        :to="item.to"
        class="group flex items-center gap-3 rounded-2xl py-3 text-sm font-semibold transition w-full"
        :class="[
          isActive(item) ? 'bg-white text-primary shadow-sm shadow-primary/5' : 'text-on-surface-variant hover:bg-white/75 hover:text-primary',
          uiStore.sidebarCollapsed ? 'justify-center px-0' : 'px-4'
        ]"
        @click="closeOnMobile"
        :title="uiStore.sidebarCollapsed ? item.label : ''"
      >
        <span class="material-symbols-outlined transition-transform duration-200 group-hover:scale-110" :style="isActive(item) ? `font-variation-settings: 'FILL' 1;` : ''">
          {{ item.icon }}
        </span>
        <span v-if="!uiStore.sidebarCollapsed">{{ item.label }}</span>
        <span
          v-if="!uiStore.sidebarCollapsed && item.badge && item.badge() > 0"
          class="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white shadow"
        >
          {{ item.badge() > 99 ? '99+' : item.badge() }}
        </span>
        <span
          v-else-if="uiStore.sidebarCollapsed && item.badge && item.badge() > 0"
          class="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-red-500"
        ></span>
      </router-link>
    </nav>

    <div v-if="!uiStore.sidebarCollapsed" class="rounded-[28px] border border-white/70 bg-white/78 p-4 shadow-sm w-full">
      <p class="text-sm font-semibold text-on-surface">Need a new board?</p>
      <p class="mt-1 text-xs leading-5 text-on-surface-variant">Spin up a new delivery space with the same polished UI language as the reference screens.</p>
      <button
        @click="$emit('createBoard'); closeOnMobile()"
        class="mt-4 w-full rounded-full bg-gradient-to-br from-primary-container to-primary px-4 py-3 text-sm font-semibold text-on-primary shadow-[0_14px_26px_-18px_rgba(0,74,198,0.7)] transition hover:brightness-110 active:scale-[0.98]"
      >
        Create Board
      </button>
    </div>
    <button
      v-else
      @click="$emit('createBoard'); closeOnMobile()"
      class="mt-4 flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary-container to-primary text-on-primary shadow-[0_10px_20px_-10px_rgba(0,74,198,0.7)] transition hover:brightness-110 active:scale-[0.98]"
      title="Create Board"
    >
      <span class="material-symbols-outlined">add</span>
    </button>

    <!-- Logout button -->
    <button
      @click="handleLogout"
      class="mt-4 flex items-center gap-3 rounded-2xl py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50 w-full"
      :class="uiStore.sidebarCollapsed ? 'justify-center px-0' : 'px-4'"
      title="Sign Out"
    >
      <span class="material-symbols-outlined text-[22px]">logout</span>
      <span v-if="!uiStore.sidebarCollapsed">Sign Out</span>
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
