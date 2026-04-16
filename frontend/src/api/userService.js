import axiosClient from './axiosClient'

export default {
  getUsers() {
    return axiosClient.get('/users')
  },
  getUserById(id) {
    return axiosClient.get(`/users/${id}`)
  },
  deleteUser(id) {
    return axiosClient.delete(`/users/${id}`)
  }
}
