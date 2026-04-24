<template>
  <div class="member-profile-page">
    <!-- Loading -->
    <div v-if="isLoading" class="flex items-center justify-center py-16">
      <AppSpinner />
    </div>

    <template v-else-if="profile">
      <!-- Breadcrumb -->
      <AppBreadcrumb :items="[{ label: 'Members', to: '/members' }, { label: profile.user.name }]" class="mb-6" />

      <!-- Profile Header -->
      <div class="mb-8 flex flex-col items-start gap-6 rounded-3xl border border-white/70 bg-white/60 p-6 backdrop-blur-sm sm:flex-row sm:items-center">
        <div class="flex h-20 w-20 flex-shrink-0 items-center justify-center overflow-hidden rounded-2xl border-2 border-white/80 bg-gradient-to-br from-primary-container to-primary/20 text-2xl font-bold uppercase text-on-primary shadow-md">
          <img v-if="profile.user.avatar" :src="profile.user.avatar" class="h-full w-full object-cover" />
          <span v-else>{{ profile.user.name?.charAt(0) }}</span>
        </div>

        <div class="min-w-0 flex-1">
          <h1 class="text-xl font-bold text-on-surface">{{ profile.user.name }}</h1>
          <p class="mt-0.5 text-sm text-on-surface-variant">{{ profile.user.email }}</p>
          <p class="mt-2 text-sm text-on-surface-variant">
            <span class="font-medium text-primary">{{ profile.sharedBoards.length }}</span> shared boards ·
            <span class="font-medium text-primary">{{ profile.sharedTasks.length }}</span> shared tasks
          </p>
        </div>

        <router-link
          :to="`/chat/${profile.user._id}`"
          class="inline-flex items-center gap-2 rounded-full bg-gradient-to-br from-primary-container to-primary px-5 py-2.5 text-sm font-semibold text-on-primary shadow-md transition hover:brightness-110 active:scale-[0.98]"
        >
          <span class="material-symbols-outlined text-[18px]">chat</span>
          Send Message
        </router-link>
      </div>

      <!-- Tabs -->
      <div class="mb-6 flex gap-1 rounded-2xl border border-white/70 bg-white/60 p-1 backdrop-blur-sm">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          class="flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold transition"
          :class="activeTab === tab.key ? 'bg-white text-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'"
          @click="activeTab = tab.key"
        >
          {{ tab.label }}
        </button>
      </div>

      <!-- Shared Boards Tab -->
      <div v-if="activeTab === 'boards'">
        <div v-if="profile.sharedBoards.length === 0" class="rounded-3xl border border-white/70 bg-white/60 py-12 text-center">
          <span class="material-symbols-outlined mb-3 text-4xl text-on-surface-variant/40">view_kanban</span>
          <p class="text-sm text-on-surface-variant">No shared boards</p>
        </div>

        <div v-else class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <router-link
            v-for="board in profile.sharedBoards"
            :key="board._id"
            :to="`/boards/${board._id}`"
            class="group rounded-3xl border border-white/70 bg-white/60 p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:bg-white/90 hover:shadow-lg"
          >
            <div class="flex items-center gap-3">
              <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary-container/80 to-primary/15">
                <span class="material-symbols-outlined text-[20px] text-primary">view_kanban</span>
              </div>
              <div class="min-w-0 flex-1">
                <p class="truncate text-sm font-semibold text-on-surface group-hover:text-primary transition">{{ board.name }}</p>
                <p class="mt-0.5 truncate text-xs text-on-surface-variant">{{ board.description || 'No description' }}</p>
              </div>
              <span class="material-symbols-outlined text-[18px] text-on-surface-variant/40 transition group-hover:text-primary">arrow_forward</span>
            </div>
          </router-link>
        </div>
      </div>

      <!-- Shared Tasks Tab -->
      <div v-if="activeTab === 'tasks'">
        <div v-if="profile.sharedTasks.length === 0" class="rounded-3xl border border-white/70 bg-white/60 py-12 text-center">
          <span class="material-symbols-outlined mb-3 text-4xl text-on-surface-variant/40">task_alt</span>
          <p class="text-sm text-on-surface-variant">No shared tasks</p>
        </div>

        <div v-else class="space-y-3">
          <router-link
            v-for="task in profile.sharedTasks"
            :key="task._id"
            :to="`/boards/${task.boardId?._id || task.boardId}`"
            class="group flex items-center gap-4 rounded-2xl border border-white/70 bg-white/60 p-4 shadow-sm transition-all hover:bg-white/90 hover:shadow-md"
          >
            <div class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl" :class="getStatusBg(task.status)">
              <span class="material-symbols-outlined text-[18px]" :class="getStatusColor(task.status)">{{ getStatusIcon(task.status) }}</span>
            </div>
            <div class="min-w-0 flex-1">
              <p class="truncate text-sm font-semibold text-on-surface">{{ task.title }}</p>
              <div class="mt-1 flex items-center gap-2 text-xs text-on-surface-variant">
                <span>{{ task.boardId?.name || 'Board' }}</span>
                <span class="text-on-surface-variant/40">·</span>
                <span :class="getStatusTextColor(task.status)">{{ formatStatus(task.status) }}</span>
                <span class="text-on-surface-variant/40">·</span>
                <span :class="getPriorityColor(task.priority)">{{ task.priority }}</span>
              </div>
            </div>
          </router-link>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useUIStore } from '@/stores/uiStore'
import userService from '@/api/userService'

const route = useRoute()
const uiStore = useUIStore()

const profile = ref(null)
const isLoading = ref(false)
const activeTab = ref('boards')

const tabs = [
  { key: 'boards', label: 'Shared Boards' },
  { key: 'tasks', label: 'Shared Tasks' }
]

onMounted(async () => {
  isLoading.value = true
  try {
    profile.value = await userService.getSharedProfile(route.params.id)
  } catch (err) {
    uiStore.addToast('error', err.message || 'Failed to load profile')
  } finally {
    isLoading.value = false
  }
})

const formatStatus = (status) => {
  const map = { TODO: 'To Do', IN_PROGRESS: 'In Progress', DONE: 'Done' }
  return map[status] || status
}

const getStatusIcon = (status) => {
  const map = { TODO: 'radio_button_unchecked', IN_PROGRESS: 'pending', DONE: 'check_circle' }
  return map[status] || 'circle'
}

const getStatusBg = (status) => {
  const map = { TODO: 'bg-slate-100', IN_PROGRESS: 'bg-amber-50', DONE: 'bg-emerald-50' }
  return map[status] || 'bg-slate-100'
}

const getStatusColor = (status) => {
  const map = { TODO: 'text-slate-500', IN_PROGRESS: 'text-amber-600', DONE: 'text-emerald-600' }
  return map[status] || 'text-slate-500'
}

const getStatusTextColor = (status) => {
  const map = { TODO: 'text-slate-500', IN_PROGRESS: 'text-amber-600', DONE: 'text-emerald-600' }
  return map[status] || ''
}

const getPriorityColor = (priority) => {
  const map = { LOW: 'text-blue-500', MEDIUM: 'text-amber-500', HIGH: 'text-red-500' }
  return map[priority] || ''
}
</script>
