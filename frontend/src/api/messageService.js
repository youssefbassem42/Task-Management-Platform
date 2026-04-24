import axiosClient from './axiosClient'

export default {
  getConversations() {
    return axiosClient.get('/messages/conversations')
  },
  getMessages(userId) {
    return axiosClient.get(`/messages/${userId}`)
  },
  sendMessage(userId, text) {
    return axiosClient.post(`/messages/${userId}`, { text })
  },
  getMutualMembers() {
    return axiosClient.get('/users/members')
  }
}
