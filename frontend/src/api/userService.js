import axiosClient from './axiosClient'

export default {
  getUsers() {
    return axiosClient.get('/users')
  },
  getUserById(id) {
    return axiosClient.get(`/users/${id}`)
  },
  getMembers() {
    return axiosClient.get('/users/members')
  },
  getSharedProfile(userId) {
    return axiosClient.get(`/users/${userId}/shared`)
  },
  deleteUser(id) {
    return axiosClient.delete(`/users/${id}`)
  }
}
