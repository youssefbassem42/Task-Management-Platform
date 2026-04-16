import axiosClient from './axiosClient'

export default {
  login(email, password) {
    return axiosClient.post('/auth/login', { email, password })
  },
  register(payload) {
    return axiosClient.post('/auth/register', payload)
  },
  getProfile() {
    return axiosClient.get('/auth/profile')
  },
  updateProfile(payload) {
    return axiosClient.put('/auth/profile', payload)
  }
}
