import axiosClient from './axiosClient'

export default {
  search(query) {
    return axiosClient.get('/search', { params: { q: query } })
  }
}
