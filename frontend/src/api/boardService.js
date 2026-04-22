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
  updateBoard(boardId, payload) {
    return axiosClient.put(`/boards/${boardId}`, payload)
  },
  getBoardInvite(inviteCode) {
    return axiosClient.get(`/boards/join/${inviteCode}`)
  },
  joinBoardByInvite(inviteCode) {
    return axiosClient.post(`/boards/join/${inviteCode}`)
  },
  updateBoardMembers(boardId, memberIds) {
    return axiosClient.put(`/boards/${boardId}/members`, { memberIds })
  },
  getBoardActivity(boardId) {
    return axiosClient.get(`/boards/${boardId}/activity`)
  },
  exportBoard(boardId) {
    return axiosClient.get(`/boards/${boardId}/export`, { responseType: 'blob' })
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
  addComment(boardId, taskId, payload) {
    return axiosClient.post(`/boards/${boardId}/tasks/${taskId}/comments`, payload)
  },
  getBoardAttachments(boardId) {
    return axiosClient.get(`/boards/${boardId}/attachments`)
  },
  uploadBoardAttachment(boardId, file) {
    const formData = new FormData()
    formData.append('file', file)

    return axiosClient.post(`/boards/${boardId}/attachments`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },
  deleteBoardAttachment(boardId, attachmentId) {
    return axiosClient.delete(`/boards/${boardId}/attachments/${attachmentId}`)
  },
  getTaskAttachments(boardId, taskId) {
    return axiosClient.get(`/boards/${boardId}/tasks/${taskId}/attachments`)
  },
  uploadTaskAttachment(boardId, taskId, file) {
    const formData = new FormData()
    formData.append('file', file)

    return axiosClient.post(`/boards/${boardId}/tasks/${taskId}/attachments`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },
  deleteTaskAttachment(boardId, taskId, attachmentId) {
    return axiosClient.delete(`/boards/${boardId}/tasks/${taskId}/attachments/${attachmentId}`)
  }
}
