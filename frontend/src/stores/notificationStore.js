import { defineStore } from 'pinia'
import notificationService from '@/api/notificationService'

export const useNotificationStore = defineStore('notifications', {
  state: () => ({
    notifications: [],
    unreadCount: 0,
    isLoading: false,
    error: null
  }),
  actions: {
    async fetchNotifications() {
      this.isLoading = true
      this.error = null

      try {
        const data = await notificationService.getNotifications()
        this.notifications = data.notifications || []
        this.unreadCount = data.unreadCount || 0
        return data
      } catch (err) {
        this.error = err.message
        throw err
      } finally {
        this.isLoading = false
      }
    },
    async markAsRead(id) {
      try {
        await notificationService.markAsRead(id)
        const notification = this.notifications.find((n) => n._id === id)
        if (notification) {
          notification.read = true
          this.unreadCount = Math.max(0, this.unreadCount - 1)
        }
      } catch (err) {
        this.error = err.message
        throw err
      }
    },
    async markAllAsRead() {
      try {
        await notificationService.markAllAsRead()
        this.notifications.forEach((n) => (n.read = true))
        this.unreadCount = 0
      } catch (err) {
        this.error = err.message
        throw err
      }
    }
  }
})
