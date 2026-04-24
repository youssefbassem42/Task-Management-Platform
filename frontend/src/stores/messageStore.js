import { defineStore } from 'pinia'
import messageService from '@/api/messageService'

export const useMessageStore = defineStore('messages', {
  state: () => ({
    conversations: [],
    currentMessages: [],
    mutualMembers: [],
    isLoading: false,
    isSending: false,
    membersLoading: false,
    error: null
  }),
  getters: {
    totalUnread: (state) =>
      state.conversations.reduce((sum, c) => sum + (c.unreadCount || 0), 0)
  },
  actions: {
    async fetchConversations() {
      this.isLoading = true
      this.error = null

      try {
        this.conversations = await messageService.getConversations()
        return this.conversations
      } catch (err) {
        this.error = err.message
        throw err
      } finally {
        this.isLoading = false
      }
    },
    async fetchMessages(userId) {
      this.isLoading = true
      this.error = null

      try {
        this.currentMessages = await messageService.getMessages(userId)
        // Reset unread count for this conversation
        const conv = this.conversations.find(
          (c) => c.user?._id === userId
        )
        if (conv) {
          conv.unreadCount = 0
        }
        return this.currentMessages
      } catch (err) {
        this.error = err.message
        throw err
      } finally {
        this.isLoading = false
      }
    },
    async sendMessage(userId, text) {
      this.isSending = true
      this.error = null

      try {
        const message = await messageService.sendMessage(userId, text)
        this.currentMessages.push(message)
        return message
      } catch (err) {
        this.error = err.message
        throw err
      } finally {
        this.isSending = false
      }
    },
    async fetchMutualMembers() {
      this.membersLoading = true
      this.error = null

      try {
        this.mutualMembers = await messageService.getMutualMembers()
        return this.mutualMembers
      } catch (err) {
        this.error = err.message
        throw err
      } finally {
        this.membersLoading = false
      }
    }
  }
})
