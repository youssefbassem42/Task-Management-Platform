import axiosClient from './axiosClient'

export default {
  getBoards() {
    return axiosClient.get('/boards')
  },
  createBoard(payload) {
    return axiosClient.post('/boards', payload)
  },
  getBoardById(boardId) {
    return axiosClient.get(`/boards/${boardId}`)
  },
  updateBoardMembers(boardId, memberIds) {
    return axiosClient.put(`/boards/${boardId}/members`, { memberIds })
  },
  deleteBoard(boardId) {
    return axiosClient.delete(`/boards/${boardId}`)
  },
  getTasks(boardId, params = {}) {
    return axiosClient.get(`/boards/${boardId}/tasks`, { params })
  },
  getTask(boardId, taskId) {
    return axiosClient.get(`/boards/${boardId}/tasks/${taskId}`)
  },
  createTask(boardId, payload) {
    return axiosClient.post(`/boards/${boardId}/tasks`, payload)
  },
  updateTask(boardId, taskId, payload) {
    return axiosClient.put(`/boards/${boardId}/tasks/${taskId}`, payload)
  },
  updateTaskStatus(boardId, taskId, status) {
    return axiosClient.patch(`/boards/${boardId}/tasks/${taskId}/status`, { status })
  },
  archiveTask(boardId, taskId, isArchived = true) {
    return axiosClient.patch(`/boards/${boardId}/tasks/${taskId}/archive`, { isArchived })
  },
  deleteTask(boardId, taskId) {
    return axiosClient.delete(`/boards/${boardId}/tasks/${taskId}`)
  },
  getComments(boardId, taskId) {
    return axiosClient.get(`/boards/${boardId}/tasks/${taskId}/comments`)
  },
  addComment(boardId, taskId, content) {
    return axiosClient.post(`/boards/${boardId}/tasks/${taskId}/comments`, { content })
  }
}
