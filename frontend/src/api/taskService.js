import axiosClient from './axiosClient'

function buildTaskQuery(query = {}) {
  const params = {}

  if (query.status && query.status !== 'all' && query.status !== 'All') {
    params.status = query.status
  }

  return params
}

export default {
  getDashboardSummary(isAdmin) {
    return axiosClient.get(isAdmin ? '/tasks/dashboard-data/' : '/tasks/user-dashboard-data')
  },
  getTasks(query = {}) {
    return axiosClient.get('/tasks', { params: buildTaskQuery(query) })
  },
  getTaskById(id) {
    return axiosClient.get(`/tasks/${id}`)
  },
  createTask(payload) {
    return axiosClient.post('/tasks', payload)
  },
  updateTask(id, payload) {
    return axiosClient.put(`/tasks/${id}`, payload)
  },
  deleteTask(id) {
    return axiosClient.delete(`/tasks/${id}`)
  },
  updateTaskStatus(id, status) {
    return axiosClient.put(`/tasks/${id}/status`, { status })
  },
  updateTaskChecklist(id, todoChecklist) {
    return axiosClient.put(`/tasks/${id}/todo`, { todoChecklist })
  }
}
