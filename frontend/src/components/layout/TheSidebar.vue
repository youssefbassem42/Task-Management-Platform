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
  </aside>
</template>

<script setup>
import { useRoute } from 'vue-router'
import { useUIStore } from '@/stores/uiStore'

const route = useRoute()
const uiStore = useUIStore()

defineEmits(['createBoard'])

const items = [
  { label: 'Dashboard', to: '/dashboard', icon: 'grid_view' },
  { label: 'Boards', to: '/boards', icon: 'view_kanban' },
  { label: 'Members', to: '/users', icon: 'group' },
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
