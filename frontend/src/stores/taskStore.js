import { defineStore } from 'pinia'
import taskService from '@/api/taskService'

function normalizeTask(task) {
  const assignedUsers = Array.isArray(task?.assignedTo) ? task.assignedTo : []
  const checklist = Array.isArray(task?.todoChecklist) ? task.todoChecklist : []
  const completedTodoCount =
    typeof task?.completedTodoCount === 'number'
      ? task.completedTodoCount
      : checklist.filter((item) => item.completed).length

  return {
    ...task,
    assignedTo: assignedUsers,
    todoChecklist: checklist,
    attachments: Array.isArray(task?.attachments) ? task.attachments : [],
    completedTodoCount
  }
}

function sortTasks(tasks, sortKey, sortDirection) {
  const direction = sortDirection === 'desc' ? -1 : 1

  return [...tasks].sort((a, b) => {
    if (sortKey === 'dueDate' || sortKey === 'createdAt') {
      return (new Date(a?.[sortKey] || 0) - new Date(b?.[sortKey] || 0)) * direction
    }

    const first = String(a?.[sortKey] || '').toLowerCase()
    const second = String(b?.[sortKey] || '').toLowerCase()

    return first.localeCompare(second) * direction
  })
}

export const useTaskStore = defineStore('tasks', {
  state: () => ({
    tasks: [],
    currentTask: null,
    statusSummary: {
      all: 0,
      pendingTasks: 0,
      inProgressTasks: 0,
      completedTasks: 0
    },
    filters: {
      status: 'all',
      search: '',
      sortKey: 'dueDate',
      sortDirection: 'asc'
    },
    pagination: {
      currentPage: 1,
      pageSize: 10
    },
    listLoading: false,
    detailLoading: false,
    mutationLoading: false,
    error: null
  }),
  getters: {
    filteredTasks(state) {
      const search = state.filters.search.trim().toLowerCase()

      const filtered = state.tasks.filter((task) => {
        const statusMatches =
          state.filters.status === 'all' || task.status === state.filters.status

        const searchMatches =
          !search ||
          [task.title, task.description, task.priority, task.status]
            .filter(Boolean)
            .some((value) => String(value).toLowerCase().includes(search))

        return statusMatches && searchMatches
      })

      return sortTasks(filtered, state.filters.sortKey, state.filters.sortDirection)
    },
    paginatedTasks(state) {
      const start = (state.pagination.currentPage - 1) * state.pagination.pageSize
      return this.filteredTasks.slice(start, start + state.pagination.pageSize)
    },
    totalPages(state) {
      return Math.max(1, Math.ceil(this.filteredTasks.length / state.pagination.pageSize))
    },
    hasTasks: (state) => state.tasks.length > 0,
    taskById: (state) => (id) => state.tasks.find((task) => task._id === id),
    isLoading(state) {
      return state.listLoading || state.detailLoading || state.mutationLoading
    }
  },
  actions: {
    async fetchTasks(query = {}) {
      this.listLoading = true
      this.error = null

      try {
        const data = await taskService.getTasks(query)
        this.tasks = Array.isArray(data.tasks) ? data.tasks.map(normalizeTask) : []
        this.statusSummary = {
          all: data.statusSummary?.all || this.tasks.length,
          pendingTasks: data.statusSummary?.pendingTasks || 0,
          inProgressTasks: data.statusSummary?.inProgressTasks || 0,
          completedTasks: data.statusSummary?.completedTasks || 0
        }
        this.pagination.currentPage = 1
        return this.tasks
      } catch (err) {
        this.error = err.message
        throw err
      } finally {
        this.listLoading = false
      }
    },
    async fetchTaskById(id) {
      this.detailLoading = true
      this.error = null

      try {
        const data = await taskService.getTaskById(id)
        this.currentTask = normalizeTask(data)
        return this.currentTask
      } catch (err) {
        this.error = err.message
        throw err
      } finally {
        this.detailLoading = false
      }
    },
    setFilter(status) {
      this.filters.status = status
      this.pagination.currentPage = 1
    },
    setSearch(search) {
      this.filters.search = search
      this.pagination.currentPage = 1
    },
    setSort(sortKey) {
      if (this.filters.sortKey === sortKey) {
        this.filters.sortDirection = this.filters.sortDirection === 'asc' ? 'desc' : 'asc'
      } else {
        this.filters.sortKey = sortKey
        this.filters.sortDirection = sortKey === 'dueDate' ? 'asc' : 'asc'
      }
    },
    setPage(page) {
      this.pagination.currentPage = Math.min(Math.max(1, page), this.totalPages)
    },
    clearCurrentTask() {
      this.currentTask = null
    },
    async createTask(payload) {
      this.mutationLoading = true
      this.error = null

      try {
        const response = await taskService.createTask(payload)
        await this.fetchTasks({ status: this.filters.status })
        return response
      } catch (err) {
        this.error = err.message
        throw err
      } finally {
        this.mutationLoading = false
      }
    },
    async updateTask(id, payload) {
      this.mutationLoading = true
      this.error = null

      try {
        const response = await taskService.updateTask(id, payload)
        await Promise.allSettled([
          this.fetchTasks({ status: this.filters.status }),
          this.fetchTaskById(id)
        ])
        return response
      } catch (err) {
        this.error = err.message
        throw err
      } finally {
        this.mutationLoading = false
      }
    },
    async updateTaskStatus(id, status) {
      this.mutationLoading = true
      this.error = null

      try {
        const response = await taskService.updateTaskStatus(id, status)
        await Promise.allSettled([
          this.fetchTasks({ status: this.filters.status }),
          this.fetchTaskById(id)
        ])
        return response
      } catch (err) {
        this.error = err.message
        throw err
      } finally {
        this.mutationLoading = false
      }
    },
    async updateTaskChecklist(id, checklist) {
      this.mutationLoading = true
      this.error = null

      try {
        const response = await taskService.updateTaskChecklist(id, checklist)
        await Promise.allSettled([
          this.fetchTasks({ status: this.filters.status }),
          this.fetchTaskById(id)
        ])
        return response
      } catch (err) {
        this.error = err.message
        throw err
      } finally {
        this.mutationLoading = false
      }
    },
    async deleteTask(id) {
      this.mutationLoading = true
      this.error = null

      try {
        const response = await taskService.deleteTask(id)
        this.tasks = this.tasks.filter((task) => task._id !== id)
        this.statusSummary.all = Math.max(0, this.statusSummary.all - 1)
        this.pagination.currentPage = Math.min(this.pagination.currentPage, this.totalPages)
        return response
      } catch (err) {
        this.error = err.message
        throw err
      } finally {
        this.mutationLoading = false
      }
    }
  }
})
