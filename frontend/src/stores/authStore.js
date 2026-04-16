import { defineStore } from 'pinia'
import authService from '@/api/authService'

function mapAuthUser(payload) {
  return payload
    ? {
        _id: payload._id,
        name: payload.name,
        email: payload.email
      }
    : null
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: localStorage.getItem('taskmanager_token'),
    isLoading: false,
    initialized: false,
    error: null
  }),
  getters: {
    isAuthenticated: (state) => Boolean(state.token && state.user)
  },
  actions: {
    setToken(token) {
      this.token = token || null

      if (token) {
        localStorage.setItem('taskmanager_token', token)
      } else {
        localStorage.removeItem('taskmanager_token')
      }
    },
    setUser(user) {
      this.user = mapAuthUser(user)
    },
    async login(email, password) {
      this.isLoading = true
      this.error = null

      try {
        const data = await authService.login(email, password)
        this.setToken(data.token)
        this.setUser(data)
        this.initialized = true
        return data
      } catch (err) {
        this.error = err.message
        throw err
      } finally {
        this.isLoading = false
      }
    },
    async register(payload) {
      this.isLoading = true
      this.error = null

      try {
        const data = await authService.register(payload)
        this.setToken(data.token)
        this.setUser(data)
        this.initialized = true
        return data
      } catch (err) {
        this.error = err.message
        throw err
      } finally {
        this.isLoading = false
      }
    },
    async fetchProfile() {
      if (!this.token) {
        this.user = null
        return null
      }

      this.isLoading = true
      this.error = null

      try {
        const user = await authService.getProfile()
        this.setUser(user)
        return user
      } catch (err) {
        this.error = err.message
        this.logout()
        throw err
      } finally {
        this.isLoading = false
      }
    },
    async updateProfile(payload) {
      this.isLoading = true
      this.error = null

      try {
        const data = await authService.updateProfile(payload)
        this.setToken(data.token || this.token)
        this.user = {
          ...this.user,
          ...mapAuthUser({ ...this.user, ...payload, ...data })
        }
        return data
      } catch (err) {
        this.error = err.message
        throw err
      } finally {
        this.isLoading = false
      }
    },
    logout() {
      this.user = null
      this.setToken(null)
      this.initialized = true
    },
    async initializeAuth() {
      if (this.initialized) {
        return
      }

      const token = localStorage.getItem('taskmanager_token')

      if (!token) {
        this.initialized = true
        return
      }

      this.setToken(token)

      try {
        await this.fetchProfile()
      } finally {
        this.initialized = true
      }
    }
  }
})
