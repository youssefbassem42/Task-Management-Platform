import { eachDayOfInterval, endOfDay, format, startOfDay, subDays } from 'date-fns'

export function normalizeDashboardSummary(payload) {
  const root = payload?.data ?? payload ?? {}

  return {
    statistics: {
      totalTasks: root.statistics?.totalTasks || 0,
      pendingTasks: root.statistics?.pendingTasks || 0,
      inProgressTasks: root.statistics?.inProgressTasks || 0,
      completedTasks: root.statistics?.completedTasks || 0,
      overdueTasks: root.statistics?.overdueTasks || 0
    },
    charts: {
      taskDistribution: root.charts?.taskDistribution || {},
      taskPriorityLevels: root.charts?.taskPriorityLevels || {}
    },
    recentTasks: Array.isArray(root.recentTasks) ? root.recentTasks : []
  }
}

export function buildTrendSeries(tasks, days = 7) {
  const end = endOfDay(new Date())
  const start = startOfDay(subDays(end, days - 1))
  const labels = eachDayOfInterval({ start, end }).map((date) => format(date, 'MMM d'))
  const counts = new Map(labels.map((label) => [label, 0]))

  tasks.forEach((task) => {
    if (!task?.createdAt) {
      return
    }

    const createdAt = new Date(task.createdAt)

    if (createdAt >= start && createdAt <= end) {
      const label = format(createdAt, 'MMM d')
      counts.set(label, (counts.get(label) || 0) + 1)
    }
  })

  return {
    labels,
    series: [{ name: 'Tasks Created', data: labels.map((label) => counts.get(label) || 0) }]
  }
}

export function buildPrioritySeries(summary, tasks) {
  const source = summary?.charts?.taskPriorityLevels || {}
  const labels = ['High', 'Medium', 'Low']

  if (Object.keys(source).length > 0) {
    return {
      labels,
      series: [{ name: 'Tasks', data: labels.map((label) => source[label] || 0) }]
    }
  }

  const distribution = labels.reduce((acc, label) => ({ ...acc, [label]: 0 }), {})
  tasks.forEach((task) => {
    if (distribution[task.priority] !== undefined) {
      distribution[task.priority] += 1
    }
  })

  return {
    labels,
    series: [{ name: 'Tasks', data: labels.map((label) => distribution[label] || 0) }]
  }
}

export function buildStatusSeries(summary, tasks) {
  const labels = ['Pending', 'In Progress', 'Completed']
  const source = summary?.charts?.taskDistribution || {}

  if (Object.keys(source).length > 0) {
    return {
      labels,
      series: labels.map((label) => source[label.replace(/\s+/g, '')] || 0)
    }
  }

  const distribution = labels.reduce((acc, label) => ({ ...acc, [label]: 0 }), {})
  tasks.forEach((task) => {
    if (distribution[task.status] !== undefined) {
      distribution[task.status] += 1
    }
  })

  return {
    labels,
    series: labels.map((label) => distribution[label] || 0)
  }
}
