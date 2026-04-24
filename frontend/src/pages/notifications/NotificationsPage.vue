<template>
  <div class="space-y-8">
    <!-- Header -->
    <section class="rounded-[34px] border border-white/70 bg-white/82 p-7 shadow-[0_24px_50px_-30px_rgba(0,37,102,0.55)]">
      <div class="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span class="inline-flex items-center rounded-full bg-primary-fixed px-3 py-1 text-[11px] font-bold uppercase tracking-[0.22em] text-on-primary-fixed">Notifications</span>
          <h1 class="mt-4 font-['Sora'] text-4xl font-[700] tracking-[-0.05em] text-on-surface">Stay in the loop.</h1>
          <p class="mt-2 text-sm text-on-surface-variant">Task assignments, status changes, comments, and more — all in one place.</p>
        </div>
        <div class="flex items-center gap-3">
          <span v-if="notificationStore.unreadCount > 0" class="rounded-full bg-error-container px-3 py-1.5 text-xs font-bold text-on-error-container">
            {{ notificationStore.unreadCount }} unread
          </span>
          <button
            v-if="notificationStore.notifications.some((n) => !n.read)"
            @click="handleMarkAllRead"
            class="flex items-center justify-center gap-2 rounded-full bg-gradient-to-br from-primary-container to-primary px-6 py-3 text-sm font-medium text-on-primary shadow-[0_20px_40px_-24px_rgba(0,74,198,0.8)] transition duration-200 hover:brightness-110 active:scale-95"
          >
            <span class="material-symbols-outlined text-[18px]">done_all</span>
            Mark All Read
          </button>
        </div>
      </div>
    </section>

    <!-- Filter Tabs -->
    <div class="flex items-center gap-2 rounded-full border border-white/70 bg-white/80 p-1.5 shadow-sm w-max">
      <button
        v-for="tab in filterTabs"
        :key="tab.value"
        @click="activeFilter = tab.value"
        class="rounded-full px-4 py-2 text-xs font-semibold transition-colors capitalize"
        :class="activeFilter === tab.value ? 'bg-surface-container-lowest text-on-surface shadow-sm' : 'text-on-surface-variant hover:text-on-surface'"
      >
        {{ tab.label }}
        <span
          v-if="tab.count > 0"
          class="ml-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] font-bold"
          :class="activeFilter === tab.value ? 'bg-primary text-on-primary' : 'bg-surface-container-high text-on-surface-variant'"
        >
          {{ tab.count > 99 ? '99+' : tab.count }}
        </span>
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="notificationStore.isLoading" class="flex justify-center p-10">
      <AppSpinner size="3rem" />
    </div>

    <!-- Notifications List -->
    <div v-else-if="filteredNotifications.length" class="space-y-3">
      <TransitionGroup name="notification-list">
        <article
          v-for="notification in filteredNotifications"
          :key="notification._id"
          @click="handleNotificationClick(notification)"
          class="group flex cursor-pointer items-start gap-4 rounded-[24px] border p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_20px_40px_-28px_rgba(0,37,102,0.45)]"
          :class="notification.read
            ? 'border-white/60 bg-white/60'
            : 'border-primary/15 bg-gradient-to-r from-primary-fixed/30 to-white/80 shadow-[0_12px_30px_-20px_rgba(0,37,102,0.35)]'"
        >
          <!-- Icon -->
          <div
            class="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl transition-transform group-hover:scale-105"
            :class="getNotificationIconStyle(notification.type)"
          >
            <span class="material-symbols-outlined text-[22px]">{{ getNotificationIcon(notification.type) }}</span>
          </div>

          <!-- Content -->
          <div class="min-w-0 flex-1">
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0 flex-1">
                <p class="text-sm font-semibold leading-relaxed text-on-surface" :class="{ 'font-bold': !notification.read }">
                  {{ notification.message }}
                </p>
                <div class="mt-2 flex items-center gap-3">
                  <span
                    class="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em]"
                    :class="getNotificationTypeBadge(notification.type)"
                  >
                    {{ getNotificationTypeLabel(notification.type) }}
                  </span>
                  <span class="text-[11px] text-on-surface-variant">{{ timeAgo(notification.createdAt) }}</span>
                </div>
              </div>

              <!-- Unread Indicator & Actions -->
              <div class="flex shrink-0 items-center gap-2">
                <span
                  v-if="!notification.read"
                  class="h-2.5 w-2.5 rounded-full bg-primary shadow-[0_0_8px_rgba(0,74,198,0.4)]"
                  title="Unread"
                ></span>
                <button
                  v-if="!notification.read"
                  @click.stop="handleMarkRead(notification)"
                  class="rounded-full p-1.5 text-on-surface-variant opacity-0 transition-all hover:bg-surface-container-low hover:text-primary group-hover:opacity-100"
                  title="Mark as read"
                >
                  <span class="material-symbols-outlined text-[18px]">check</span>
                </button>
                <span class="material-symbols-outlined text-[16px] text-on-surface-variant opacity-0 transition group-hover:opacity-100">arrow_forward</span>
              </div>
            </div>
          </div>
        </article>
      </TransitionGroup>
    </div>

    <!-- Empty State -->
    <AppEmptyState
      v-else
      :title="activeFilter === 'unread' ? 'You\'re all caught up!' : 'No notifications yet'"
      :description="activeFilter === 'unread' ? 'All notifications have been read. Switch to \'All\' to see past activity.' : 'Notifications will appear here when tasks are assigned, statuses change, and teammates interact.'"
      class="mt-10"
    >
      <template #action v-if="activeFilter === 'unread'">
        <AppButton @click="activeFilter = 'all'" variant="primary">View All Notifications</AppButton>
      </template>
    </AppEmptyState>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useNotificationStore } from '@/stores/notificationStore'
import { useUIStore } from '@/stores/uiStore'
import { timeAgo } from '@/utils/formatters'
import AppSpinner from '@/components/shared/AppSpinner.vue'
import AppEmptyState from '@/components/shared/AppEmptyState.vue'
import AppButton from '@/components/shared/AppButton.vue'

const router = useRouter()
const notificationStore = useNotificationStore()
const uiStore = useUIStore()

const activeFilter = ref('all')

onMounted(async () => {
  try {
    await notificationStore.fetchNotifications()
  } catch (error) {
    uiStore.addToast('error', error.message || 'Failed to load notifications')
  }
})

const filteredNotifications = computed(() => {
  if (activeFilter.value === 'unread') {
    return notificationStore.notifications.filter((n) => !n.read)
  }
  if (activeFilter.value === 'read') {
    return notificationStore.notifications.filter((n) => n.read)
  }
  return notificationStore.notifications
})

const filterTabs = computed(() => [
  { label: 'All', value: 'all', count: notificationStore.notifications.length },
  { label: 'Unread', value: 'unread', count: notificationStore.unreadCount },
  { label: 'Read', value: 'read', count: notificationStore.notifications.filter((n) => n.read).length }
])

const handleNotificationClick = async (notification) => {
  // Mark as read if unread
  if (!notification.read) {
    try {
      await notificationStore.markAsRead(notification._id)
    } catch (err) {
      // Proceed anyway
    }
  }

  // Navigate to the linked resource
  if (notification.link) {
    router.push(notification.link)
  }
}

const handleMarkRead = async (notification) => {
  try {
    await notificationStore.markAsRead(notification._id)
  } catch (error) {
    uiStore.addToast('error', error.message || 'Failed to mark notification as read')
  }
}

const handleMarkAllRead = async () => {
  try {
    await notificationStore.markAllAsRead()
    uiStore.addToast('success', 'All notifications marked as read')
  } catch (error) {
    uiStore.addToast('error', error.message || 'Failed to mark all as read')
  }
}

const getNotificationIcon = (type) => {
  const icons = {
    TASK_CREATED: 'add_task',
    TASK_UPDATED: 'edit_note',
    TASK_ASSIGNED: 'person_add',
    TASK_STATUS_CHANGED: 'swap_horiz',
    TASK_COMMENTED: 'comment',
    BOARD_MEMBER_JOINED: 'group_add',
    BOARD_UPDATED: 'dashboard_customize',
    MESSAGE_RECEIVED: 'chat'
  }
  return icons[type] || 'notifications'
}

const getNotificationIconStyle = (type) => {
  const styles = {
    TASK_CREATED: 'bg-secondary-fixed text-secondary',
    TASK_UPDATED: 'bg-tertiary-fixed text-on-tertiary-fixed',
    TASK_ASSIGNED: 'bg-primary-fixed text-on-primary-fixed',
    TASK_STATUS_CHANGED: 'bg-tertiary-fixed text-on-tertiary-fixed',
    TASK_COMMENTED: 'bg-secondary-container text-secondary',
    BOARD_MEMBER_JOINED: 'bg-primary-container text-on-primary-container',
    BOARD_UPDATED: 'bg-primary-fixed text-on-primary-fixed',
    MESSAGE_RECEIVED: 'bg-secondary-fixed text-secondary'
  }
  return styles[type] || 'bg-surface-variant text-on-surface-variant'
}

const getNotificationTypeBadge = (type) => {
  const badges = {
    TASK_CREATED: 'bg-secondary-fixed text-secondary',
    TASK_UPDATED: 'bg-tertiary-fixed text-on-tertiary-fixed',
    TASK_ASSIGNED: 'bg-primary-fixed text-on-primary-fixed',
    TASK_STATUS_CHANGED: 'bg-tertiary-fixed text-on-tertiary-fixed',
    TASK_COMMENTED: 'bg-secondary-container text-secondary',
    BOARD_MEMBER_JOINED: 'bg-primary-container text-on-primary-container',
    BOARD_UPDATED: 'bg-primary-fixed text-on-primary-fixed',
    MESSAGE_RECEIVED: 'bg-secondary-fixed text-secondary'
  }
  return badges[type] || 'bg-surface-variant text-on-surface-variant'
}

const getNotificationTypeLabel = (type) => {
  const labels = {
    TASK_CREATED: 'New Task',
    TASK_UPDATED: 'Updated',
    TASK_ASSIGNED: 'Assigned',
    TASK_STATUS_CHANGED: 'Status',
    TASK_COMMENTED: 'Comment',
    BOARD_MEMBER_JOINED: 'Joined',
    BOARD_UPDATED: 'Board',
    MESSAGE_RECEIVED: 'Message'
  }
  return labels[type] || 'Notification'
}
</script>

<style scoped>
.notification-list-enter-active,
.notification-list-leave-active {
  transition: all 0.3s ease;
}
.notification-list-enter-from {
  opacity: 0;
  transform: translateY(-12px);
}
.notification-list-leave-to {
  opacity: 0;
  transform: translateX(20px);
}
.notification-list-move {
  transition: transform 0.3s ease;
}
</style>
