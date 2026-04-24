import axiosClient from './axiosClient'

export default {
  getNotifications() {
    return axiosClient.get('/notifications')
  },
  markAsRead(id) {
    return axiosClient.patch(`/notifications/${id}/read`)
  },
  markAllAsRead() {
    return axiosClient.patch('/notifications/read-all')
  }
}
