import axiosClient from './axiosClient'

const MAX_RETRIES = 1;

export default {
  login(email, password) {
    return axiosClient.post('auth/login', { email, password })
  },
  register(payload) {
    return axiosClient.post('/auth/register', payload)
  },
  
  // ✅ Profile fetch with retry logic for Render cold start
  async getProfile(retryCount = 0) {
    try {
      return await axiosClient.get('/auth/profile')
    } catch (err) {
      // Retry once on 401 if not a token validity issue (might be server warmup)
      if (
        err.status === 401 && 
        err.errorCode !== 'TOKEN_INVALID' && 
        err.errorCode !== 'TOKEN_EXPIRED' &&
        retryCount < MAX_RETRIES
      ) {
        console.warn('[AUTH] Profile fetch failed with 401, retrying once...', err.errorCode);
        await new Promise(resolve => setTimeout(resolve, 500)); // 500ms delay
        return this.getProfile(retryCount + 1);
      }
      throw err;
    }
  },
  
  updateProfile(payload) {
    return axiosClient.put('/auth/profile', payload)
  },
  uploadAvatar(file) {
    const formData = new FormData()
    formData.append('avatar', file)

    return axiosClient.post('/auth/profile/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },
  verifyEmail(token) {
    return axiosClient.get(`/auth/verify-email?token=${token}`)
  },
  resendVerification(email) {
    return axiosClient.post('/auth/resend-verification', { email })
  },
  forgotPassword(email) {
    return axiosClient.post('/auth/forgot-password', { email })
  },
  resetPassword(token, password) {
    return axiosClient.post(`/auth/reset-password/${token}`, { password })
  }
}
