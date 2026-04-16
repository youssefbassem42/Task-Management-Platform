import { defineStore } from 'pinia'
import taskService from '@/api/taskService'
import userService from '@/api/userService'
import {
  buildPrioritySeries,
  buildStatusSeries,
  buildTrendSeries,
  normalizeDashboardSummary
} from '@/utils/dashboard'

export const useDashboardStore = defineStore('dashboard', {
  state: () => ({
    summary: null,
    tasks: [],
    users: [],
    isLoading: false,
    error: null,
    scope: 'user'
  }),
  getters: {
    hasData: (state) => Boolean(state.summary),
    stats(state) {
      const statistics = state.summary?.statistics || {}
      const completionRate =
        statistics.totalTasks > 0
          ? Math.round((statistics.completedTasks / statistics.totalTasks) * 100)
          : 0

      return [
        {
          label: 'Total Tasks',
          value: statistics.totalTasks || 0,
          color: 'var(--c-primary)',
          bgColor: 'var(--c-primary-alpha)'
        },
        {
          label: 'Completed Rate',
          value: `${completionRate}%`,
          color: 'var(--c-success)',
          bgColor: 'var(--c-success-light)'
        },
        {
          label: 'Overdue Tasks',
          value: statistics.overdueTasks || 0,
          color: 'var(--c-danger)',
          bgColor: 'var(--c-danger-light)'
        },
        {
          label: state.scope === 'admin' ? 'Team Members' : 'In Progress',
          value: state.scope === 'admin' ? state.users.length : statistics.inProgressTasks || 0,
          color: 'var(--c-info)',
          bgColor: 'var(--c-info-light)'
        }
      ]
    },
    trendChart(state) {
      return buildTrendSeries(state.tasks)
    },
    priorityChart(state) {
      return buildPrioritySeries(state.summary, state.tasks)
    },
    statusChart(state) {
      return buildStatusSeries(state.summary, state.tasks)
    },
    recentTasks(state) {
      return state.summary?.recentTasks || []
    }
  },
  actions: {
    async fetchDashboard(isAdmin) {
      this.isLoading = true
      this.error = null
      this.scope = isAdmin ? 'admin' : 'user'

      try {
        const [summary, taskList, users] = await Promise.all([
          taskService.getDashboardSummary(isAdmin),
          taskService.getTasks(),
          isAdmin ? userService.getUsers() : Promise.resolve([])
        ])

        this.summary = normalizeDashboardSummary(summary)
        this.tasks = Array.isArray(taskList.tasks) ? taskList.tasks : []
        this.users = Array.isArray(users) ? users : []
      } catch (err) {
        this.error = err.message
        throw err
      } finally {
        this.isLoading = false
      }
    }
  }
})
