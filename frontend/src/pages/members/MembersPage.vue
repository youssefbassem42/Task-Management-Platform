<template>
  <div class="members-page">
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-on-surface">Members</h1>
      <p class="mt-1 text-sm text-on-surface-variant">People from boards you've joined or created</p>
    </div>

    <!-- Search -->
    <div class="mb-6">
      <div class="relative max-w-md">
        <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">search</span>
        <input
          v-model="search"
          type="text"
          placeholder="Search members by name or email…"
          class="w-full rounded-2xl border border-white/70 bg-white/80 py-2.5 pl-10 pr-4 text-sm text-on-surface shadow-sm transition placeholder:text-on-surface-variant/60 focus:border-primary/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/15"
        />
      </div>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="flex items-center justify-center py-16">
      <AppSpinner />
    </div>

    <!-- Empty -->
    <div v-else-if="filteredMembers.length === 0" class="rounded-3xl border border-white/70 bg-white/60 py-16 text-center">
      <span class="material-symbols-outlined mb-4 text-5xl text-on-surface-variant/40">group_off</span>
      <p class="text-lg font-semibold text-on-surface">No members yet</p>
      <p class="mt-1 text-sm text-on-surface-variant">Join or create boards to see mutual members here</p>
    </div>

    <!-- Members Grid -->
    <div v-else class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <router-link
        v-for="member in filteredMembers"
        :key="member._id"
        :to="`/members/${member._id}`"
        class="group flex items-start gap-4 rounded-3xl border border-white/70 bg-white/60 p-5 shadow-sm backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:bg-white/90 hover:shadow-lg"
      >
        <!-- Square Avatar -->
        <div class="flex h-14 w-14 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl border-2 border-white/80 bg-gradient-to-br from-primary-container to-primary/20 text-lg font-bold uppercase text-on-primary shadow-sm">
          <img v-if="member.avatar" :src="member.avatar" class="h-full w-full object-cover" />
          <span v-else>{{ member.name?.charAt(0) }}</span>
        </div>

        <div class="min-w-0 flex-1">
          <p class="truncate text-sm font-semibold text-on-surface group-hover:text-primary transition">{{ member.name }}</p>
          <p class="mt-0.5 truncate text-xs text-on-surface-variant">{{ member.email }}</p>

          <!-- Shared boards -->
          <div class="mt-2.5 flex flex-wrap gap-1.5">
            <span
              v-for="(board, idx) in member.sharedBoards.slice(0, 3)"
              :key="idx"
              class="inline-flex items-center rounded-full bg-primary/8 px-2.5 py-0.5 text-[11px] font-medium text-primary"
            >
              {{ board }}
            </span>
            <span
              v-if="member.sharedBoards.length > 3"
              class="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-medium text-on-surface-variant"
            >
              +{{ member.sharedBoards.length - 3 }} more
            </span>
          </div>
        </div>

        <span class="material-symbols-outlined text-[18px] text-on-surface-variant/40 transition group-hover:text-primary">arrow_forward</span>
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, computed } from 'vue'
import { useUIStore } from '@/stores/uiStore'
import userService from '@/api/userService'

const uiStore = useUIStore()
const members = ref([])
const isLoading = ref(false)
const search = ref('')

const filteredMembers = computed(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return members.value
  return members.value.filter(
    (m) =>
      m.name.toLowerCase().includes(q) ||
      m.email.toLowerCase().includes(q)
  )
})

onMounted(async () => {
  isLoading.value = true
  try {
    members.value = await userService.getMembers()
  } catch (err) {
    uiStore.addToast('error', err.message || 'Failed to load members')
  } finally {
    isLoading.value = false
  }
})
</script>
