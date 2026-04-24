<template>
  <header class="fixed inset-x-0 top-0 z-50 border-b border-white/60 bg-surface/80 backdrop-blur-xl">
    <div class="flex h-16 w-full items-center justify-between gap-4 px-4 md:px-6">
      <div class="flex min-w-0 items-center gap-4">
        <button
          class="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/70 bg-white/70 text-on-surface shadow-sm md:hidden"
          @click="uiStore.toggleMobileDrawer()"
        >
          <span class="material-symbols-outlined">menu</span>
        </button>
        <AppLogo :size="40" />
      </div>

      <!-- Global Search -->
      <div class="relative hidden flex-1 max-w-md mx-4 md:block" ref="searchContainer">
        <div class="relative">
          <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">search</span>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search users, tasks, subtasks…"
            class="w-full rounded-2xl border border-white/70 bg-white/80 py-2.5 pl-10 pr-4 text-sm text-on-surface shadow-sm backdrop-blur-sm transition placeholder:text-on-surface-variant/60 focus:border-primary/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/15"
            @focus="showSearchResults = true"
            @input="debouncedSearch"
          />
        </div>

        <Transition name="dropdown">
          <div
            v-if="showSearchResults && searchQuery.trim().length >= 2"
            class="absolute left-0 right-0 top-full z-50 mt-2 max-h-[420px] overflow-y-auto rounded-2xl border border-white/70 bg-white/95 p-3 shadow-xl backdrop-blur-xl"
          >
            <div v-if="isSearching" class="flex items-center justify-center py-6">
              <AppSpinner />
            </div>

            <div v-else-if="searchResults.users.length === 0 && searchResults.tasks.length === 0" class="py-6 text-center text-sm text-on-surface-variant">
              No results found for "{{ searchQuery }}"
            </div>

            <template v-else>
              <!-- Users -->
              <div v-if="searchResults.users.length > 0">
                <p class="mb-2 text-xs font-semibold uppercase tracking-wider text-on-surface-variant/70">Members</p>
                <router-link
                  v-for="u in searchResults.users"
                  :key="u._id"
                  :to="`/members/${u._id}`"
                  class="flex items-center gap-3 rounded-xl p-2.5 transition hover:bg-primary/5"
                  @click="closeSearch"
                >
                  <div class="flex h-9 w-9 items-center justify-center overflow-hidden rounded-lg border border-white/70 bg-primary-container text-xs font-bold uppercase text-on-primary">
                    <img v-if="u.avatar" :src="u.avatar" class="h-full w-full object-cover" />
                    <span v-else>{{ u.name?.charAt(0) }}</span>
                  </div>
                  <div class="min-w-0 flex-1">
                    <p class="truncate text-sm font-medium text-on-surface">{{ u.name }}</p>
                    <p class="truncate text-xs text-on-surface-variant">{{ u.email }}</p>
                  </div>
                </router-link>
              </div>

              <!-- Tasks -->
              <div v-if="searchResults.tasks.length > 0" :class="searchResults.users.length > 0 ? 'mt-4' : ''">
                <p class="mb-2 text-xs font-semibold uppercase tracking-wider text-on-surface-variant/70">Tasks</p>
                <router-link
                  v-for="t in searchResults.tasks"
                  :key="t._id"
                  :to="`/boards/${t.boardId?._id || t.boardId}`"
                  class="flex items-center gap-3 rounded-xl p-2.5 transition hover:bg-primary/5"
                  @click="closeSearch"
                >
                  <div class="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary-container/80 to-primary/10">
                    <span class="material-symbols-outlined text-[18px] text-primary">task_alt</span>
                  </div>
                  <div class="min-w-0 flex-1">
                    <p class="truncate text-sm font-medium text-on-surface">{{ t.title }}</p>
                    <p class="truncate text-xs text-on-surface-variant">
                      {{ t.boardId?.name || 'Board' }} · {{ t.status }}
                    </p>
                  </div>
                </router-link>
              </div>
            </template>
          </div>
        </Transition>
      </div>

      <div class="flex flex-1 items-center justify-end gap-3 md:flex-none md:gap-4">
        <!-- Notification Bell -->
        <div class="relative" ref="notifContainer">
          <button
            class="relative inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/70 bg-white/80 text-on-surface shadow-sm transition hover:bg-white hover:shadow-md"
            @click="toggleNotifications"
          >
            <span class="material-symbols-outlined text-[22px]">notifications</span>
            <span
              v-if="notificationStore.unreadCount > 0"
              class="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white shadow"
            >
              {{ notificationStore.unreadCount > 99 ? '99+' : notificationStore.unreadCount }}
            </span>
          </button>

          <Transition name="dropdown">
            <div
              v-if="showNotifications"
              class="absolute right-0 top-full z-50 mt-2 w-80 max-h-[420px] overflow-y-auto rounded-2xl border border-white/70 bg-white/95 shadow-xl backdrop-blur-xl"
            >
              <div class="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                <p class="text-sm font-semibold text-on-surface">Notifications</p>
                <button
                  v-if="notificationStore.unreadCount > 0"
                  class="text-xs font-medium text-primary transition hover:text-primary/80"
                  @click="markAllRead"
                >
                  Mark all read
                </button>
              </div>

              <div v-if="notificationStore.isLoading" class="flex items-center justify-center py-8">
                <AppSpinner />
              </div>

              <div v-else-if="notificationStore.notifications.length === 0" class="py-8 text-center text-sm text-on-surface-variant">
                No notifications yet
              </div>

              <div v-else class="divide-y divide-slate-50">
                <router-link
                  v-for="notif in notificationStore.notifications"
                  :key="notif._id"
                  :to="notif.link || '#'"
                  class="flex items-start gap-3 px-4 py-3 transition hover:bg-primary/5"
                  :class="{ 'bg-primary/3': !notif.read }"
                  @click="handleNotifClick(notif)"
                >
                  <div class="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg" :class="getNotifIconBg(notif.type)">
                    <span class="material-symbols-outlined text-[16px]" :class="getNotifIconColor(notif.type)">{{ getNotifIcon(notif.type) }}</span>
                  </div>
                  <div class="min-w-0 flex-1">
                    <p class="text-sm text-on-surface" :class="{ 'font-medium': !notif.read }">{{ notif.message }}</p>
                    <p class="mt-0.5 text-xs text-on-surface-variant">{{ formatTimeAgo(notif.createdAt) }}</p>
                  </div>
                  <div v-if="!notif.read" class="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-primary"></div>
                </router-link>
              </div>
            </div>
          </Transition>
        </div>

        <!-- User Profile -->
        <div class="relative" ref="profileDropdownContainer">
          <button class="flex items-center gap-3 rounded-full border border-white/70 bg-white/80 py-1.5 pl-1.5 pr-3 shadow-sm transition hover:shadow-md" @click="toggleProfileDropdown">
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
            <span class="material-symbols-outlined hidden text-[18px] text-on-surface-variant transition-transform sm:block" :class="{ 'rotate-180': showProfileDropdown }">expand_more</span>
          </button>

          <Transition name="dropdown">
            <div v-if="showProfileDropdown" class="absolute right-0 top-full z-50 mt-2 w-56 rounded-2xl border border-white/70 bg-white/95 py-2 shadow-xl backdrop-blur-xl">
              <router-link
                to="/profile"
                class="flex items-center gap-3 px-4 py-2.5 text-sm text-on-surface transition hover:bg-primary/5"
                @click="showProfileDropdown = false"
              >
                <span class="material-symbols-outlined text-[20px]">person</span>
                My Profile
              </router-link>
              <router-link
                to="/chat"
                class="flex items-center gap-3 px-4 py-2.5 text-sm text-on-surface transition hover:bg-primary/5"
                @click="showProfileDropdown = false"
              >
                <span class="material-symbols-outlined text-[20px]">chat</span>
                Messages
                <span v-if="messageStore.totalUnread > 0" class="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">{{ messageStore.totalUnread }}</span>
              </router-link>
              <div class="my-1 border-t border-slate-100"></div>
              <button
                class="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-red-600 transition hover:bg-red-50"
                @click="handleLogout"
              >
                <span class="material-symbols-outlined text-[20px]">logout</span>
                Sign Out
              </button>
            </div>
          </Transition>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { useUIStore } from '@/stores/uiStore'
import { useNotificationStore } from '@/stores/notificationStore'
import { useMessageStore } from '@/stores/messageStore'
import AppLogo from '@/components/shared/AppLogo.vue'
import searchService from '@/api/searchService'
import { formatDistanceToNow } from 'date-fns'

const router = useRouter()
const authStore = useAuthStore()
const uiStore = useUIStore()
const notificationStore = useNotificationStore()
const messageStore = useMessageStore()

const user = computed(() => authStore.user)
const userInitial = computed(() => {
  if (user.value?.name) return user.value.name.charAt(0)
  if (user.value?.email) return user.value.email.charAt(0)
  return 'U'
})

// Profile dropdown
const showProfileDropdown = ref(false)
const profileDropdownContainer = ref(null)

const toggleProfileDropdown = () => {
  showProfileDropdown.value = !showProfileDropdown.value
  showNotifications.value = false
  showSearchResults.value = false
}

// Logout
const handleLogout = () => {
  showProfileDropdown.value = false
  authStore.logout()
  router.push('/login')
}

// Search
const searchQuery = ref('')
const searchResults = ref({ users: [], tasks: [] })
const isSearching = ref(false)
const showSearchResults = ref(false)
const searchContainer = ref(null)
let searchTimeout = null

const debouncedSearch = () => {
  clearTimeout(searchTimeout)
  if (searchQuery.value.trim().length < 2) {
    searchResults.value = { users: [], tasks: [] }
    return
  }
  isSearching.value = true
  searchTimeout = setTimeout(async () => {
    try {
      searchResults.value = await searchService.search(searchQuery.value.trim())
    } catch {
      searchResults.value = { users: [], tasks: [] }
    } finally {
      isSearching.value = false
    }
  }, 350)
}

const closeSearch = () => {
  showSearchResults.value = false
  searchQuery.value = ''
  searchResults.value = { users: [], tasks: [] }
}

// Notifications
const showNotifications = ref(false)
const notifContainer = ref(null)

const toggleNotifications = () => {
  showNotifications.value = !showNotifications.value
  showProfileDropdown.value = false
  showSearchResults.value = false
  if (showNotifications.value && notificationStore.notifications.length === 0) {
    notificationStore.fetchNotifications()
  }
}

const handleNotifClick = (notif) => {
  if (!notif.read) {
    notificationStore.markAsRead(notif._id)
  }
  showNotifications.value = false
}

const markAllRead = () => {
  notificationStore.markAllAsRead()
}

const formatTimeAgo = (date) => {
  try {
    return formatDistanceToNow(new Date(date), { addSuffix: true })
  } catch {
    return ''
  }
}

const getNotifIcon = (type) => {
  const map = {
    TASK_CREATED: 'add_task',
    TASK_UPDATED: 'edit_note',
    TASK_ASSIGNED: 'person_add',
    TASK_STATUS_CHANGED: 'swap_horiz',
    TASK_COMMENTED: 'comment',
    BOARD_MEMBER_JOINED: 'group_add',
    BOARD_UPDATED: 'dashboard_customize',
    MESSAGE_RECEIVED: 'chat',
  }
  return map[type] || 'notifications'
}

const getNotifIconBg = (type) => {
  if (type === 'MESSAGE_RECEIVED') return 'bg-blue-50'
  if (type?.startsWith('TASK')) return 'bg-emerald-50'
  return 'bg-amber-50'
}

const getNotifIconColor = (type) => {
  if (type === 'MESSAGE_RECEIVED') return 'text-blue-600'
  if (type?.startsWith('TASK')) return 'text-emerald-600'
  return 'text-amber-600'
}

// Close dropdowns on outside click
const handleClickOutside = (e) => {
  if (profileDropdownContainer.value && !profileDropdownContainer.value.contains(e.target)) {
    showProfileDropdown.value = false
  }
  if (notifContainer.value && !notifContainer.value.contains(e.target)) {
    showNotifications.value = false
  }
  if (searchContainer.value && !searchContainer.value.contains(e.target)) {
    showSearchResults.value = false
  }
}

// Polling for notifications & messages
let pollInterval = null

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  notificationStore.fetchNotifications()
  messageStore.fetchConversations()

  pollInterval = setInterval(async () => {
    const prevUnread = notificationStore.unreadCount
    await notificationStore.fetchNotifications()
    await messageStore.fetchConversations()
    if (notificationStore.unreadCount > prevUnread) {
      const unreadNotifs = notificationStore.notifications.filter(n => !n.read)
      if (unreadNotifs.length > 0) {
        uiStore.addToast('info', unreadNotifs[0].message || 'You have new notifications')
      }
    }
  }, 30000)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  clearInterval(pollInterval)
})
</script>

<style scoped>
.dropdown-enter-active,
.dropdown-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>
