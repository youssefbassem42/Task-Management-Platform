import { defineStore } from 'pinia'
import authService from '@/api/authService'

function mapAuthUser(payload) {
  return payload
    ? {
        _id: payload._id,
        name: payload.name,
        email: payload.email,
        avatar: payload.avatar || ''
      }
    : null
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: localStorage.getItem('taskmanager_token') || sessionStorage.getItem('taskmanager_token'),
    isLoading: false,
    initialized: false,
    error: null,
    // ✅ NEW: Track which storage we're using
    tokenStorage: localStorage.getItem('taskmanager_token') ? 'local' : 
                 sessionStorage.getItem('taskmanager_token') ? 'session' : 'local'
  }),
  getters: {
    isAuthenticated: (state) => Boolean(state.token && state.user)
  },
  actions: {
    setToken(token, rememberMe = null) {
      this.token = token || null

      if (token) {
        console.log("[AUTH] Token set - storing in", rememberMe === true ? "localStorage" : rememberMe === false ? "sessionStorage" : "preferred storage");
        if (rememberMe === true) {
          localStorage.setItem('taskmanager_token', token)
          sessionStorage.removeItem('taskmanager_token')
          this.tokenStorage = 'local'
        } else if (rememberMe === false) {
          sessionStorage.setItem('taskmanager_token', token)
          localStorage.removeItem('taskmanager_token')
          this.tokenStorage = 'session'
        } else {
          // ✅ NEW: Preserve existing storage preference, default to localStorage
          if (this.tokenStorage === 'session') {
            sessionStorage.setItem('taskmanager_token', token)
            localStorage.removeItem('taskmanager_token')
          } else {
            localStorage.setItem('taskmanager_token', token)
            sessionStorage.removeItem('taskmanager_token')
          }
        }
      } else {
        console.warn("[AUTH] Token removed - clearing storage");
        localStorage.removeItem('taskmanager_token')
        sessionStorage.removeItem('taskmanager_token')
      }
    },
    setUser(user) {
      this.user = mapAuthUser(user)
    },
    async login(email, password, rememberMe = false) {
      this.isLoading = true
      this.error = null

      try {
        const data = await authService.login(email, password)
        this.setToken(data.token, rememberMe)
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
        console.warn("[AUTH] fetchProfile called but no token available");
        this.user = null
        return null
      }

      console.log("[AUTH] Fetching profile with token");
      this.isLoading = true
      this.error = null

      try {
        const user = await authService.getProfile()
        this.setUser(user)
        console.log("[AUTH] Profile fetched successfully");
        return user
      } catch (err) {
        this.error = err.message
        console.warn("[AUTH] Profile fetch failed but keeping token for retry - Error:", err.message);
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
    async uploadAvatar(file) {
      this.isLoading = true
      this.error = null

      try {
        const data = await authService.uploadAvatar(file)
        this.setToken(data.token || this.token)
        this.user = {
          ...this.user,
          ...mapAuthUser({ ...this.user, ...data })
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

      const token = localStorage.getItem('taskmanager_token') || sessionStorage.getItem('taskmanager_token')

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
