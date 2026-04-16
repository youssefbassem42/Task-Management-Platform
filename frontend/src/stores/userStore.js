import { defineStore } from 'pinia'
import userService from '@/api/userService'

function sortUsers(users, sortKey, sortDirection) {
  const direction = sortDirection === 'desc' ? -1 : 1

  return [...users].sort((a, b) => {
    const first = String(a?.[sortKey] || '').toLowerCase()
    const second = String(b?.[sortKey] || '').toLowerCase()
    return first.localeCompare(second) * direction
  })
}

export const useUserStore = defineStore('users', {
  state: () => ({
    users: [],
    filters: {
      search: '',
      sortKey: 'name',
      sortDirection: 'asc'
    },
    isLoading: false,
    error: null
  }),
  getters: {
    filteredUsers(state) {
      const search = state.filters.search.trim().toLowerCase()

      const filtered = state.users.filter((user) => {
        if (!search) {
          return true
        }

        return [user.name, user.email]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(search))
      })

      return sortUsers(filtered, state.filters.sortKey, state.filters.sortDirection)
    },
    userOptions(state) {
      return state.filteredUsers.map((user) => ({
        value: user._id,
        label: `${user.name} (${user.email})`
      }))
    }
  },
  actions: {
    async fetchUsers() {
      this.isLoading = true
      this.error = null

      try {
        const data = await userService.getUsers()
        this.users = Array.isArray(data) ? data : []
        return this.users
      } catch (err) {
        this.error = err.message
        throw err
      } finally {
        this.isLoading = false
      }
    }
  }
})
