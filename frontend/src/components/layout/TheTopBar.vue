<template>
  <header class="fixed inset-x-0 top-0 z-50 border-b border-white/60 bg-surface/80 backdrop-blur-xl">
    <div class="mx-auto flex h-16 max-w-[1600px] items-center justify-between gap-4 px-4 md:px-6">
      <div class="flex min-w-0 items-center gap-4">
        <button
          class="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/70 bg-white/70 text-on-surface shadow-sm md:hidden"
          @click="uiStore.toggleMobileDrawer()"
        >
          <span class="material-symbols-outlined">menu</span>
        </button>
        <AppLogo :size="34" />
      </div>

      <div class="flex flex-1 items-center justify-end gap-3 md:gap-4">
        <div class="hidden min-w-[240px] max-w-[360px] flex-1 items-center rounded-full border border-white/70 bg-white/72 px-4 py-2 shadow-sm md:flex">
          <span class="material-symbols-outlined mr-2 text-[18px] text-on-surface-variant">search</span>
          <input
            v-model="searchQuery"
            class="w-full border-none bg-transparent p-0 text-sm text-on-surface outline-none placeholder:text-on-surface-variant/70 focus:ring-0"
            placeholder="Search boards, tasks, people"
            type="text"
          />
        </div>

        <button class="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/70 bg-white/72 text-on-surface-variant shadow-sm transition hover:text-primary">
          <span class="material-symbols-outlined">notifications</span>
        </button>
        <button class="hidden h-11 w-11 items-center justify-center rounded-2xl border border-white/70 bg-white/72 text-on-surface-variant shadow-sm transition hover:text-primary sm:inline-flex">
          <span class="material-symbols-outlined">help</span>
        </button>

        <button class="flex items-center gap-3 rounded-full border border-white/70 bg-white/80 py-1.5 pl-1.5 pr-3 shadow-sm transition hover:shadow-md" @click="goToProfile">
          <div class="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-white/70 bg-primary-container text-sm font-bold uppercase text-on-primary">
            <img
              v-if="user?.avatar"
              :src="user.avatar"
              alt="User profile avatar"
              class="h-full w-full object-cover text-[10px]"
            />
            <span v-else>{{ userInitial }}</span>
          </div>
          <div class="hidden text-left sm:block">
            <p class="max-w-[140px] truncate text-sm font-semibold text-on-surface">{{ user?.name || 'Taskify user' }}</p>
            <p class="max-w-[140px] truncate text-xs text-on-surface-variant">{{ user?.email || 'Workspace member' }}</p>
          </div>
        </button>
      </div>
    </div>
  </header>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { useUIStore } from '@/stores/uiStore'
import AppLogo from '@/components/shared/AppLogo.vue'

const router = useRouter()
const authStore = useAuthStore()
const uiStore = useUIStore()

const user = computed(() => authStore.user)
const searchQuery = computed({
  get: () => uiStore.globalSearchQuery,
  set: (value) => uiStore.setGlobalSearchQuery(value)
})

const userInitial = computed(() => {
  if (user.value?.name) return user.value.name.charAt(0)
  if (user.value?.email) return user.value.email.charAt(0)
  return 'U'
})

const goToProfile = () => {
  router.push('/profile')
}
</script>
