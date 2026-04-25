import axios from 'axios'

const axiosClient = axios.create({
  baseURL: `${import.meta.env.VITE_API_BASE_URL}/api`,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
})

axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('taskmanager_token') || sessionStorage.getItem('taskmanager_token')

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
    console.log(`[AXIOS] Request to ${config.url} - Token attached`);
  } else {
    console.warn(`[AXIOS] Request to ${config.url} - NO TOKEN FOUND`);
  }

  return config
})

axiosClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const fallbackMessage = error.message || 'Network Error'

    if (!error.response) {
      console.error('[AXIOS] Network error:', fallbackMessage);
      return Promise.reject({
        message: fallbackMessage,
        status: 0,
        data: null,
        errorCode: 'NETWORK_ERROR'
      })
    }

    const normalizedError = {
      message: error.response.data?.message || fallbackMessage,
      status: error.response.status,
      data: error.response.data ?? null,
      errorCode: error.response.data?.errorCode
    }

    // ✅ NEW: Differentiate auth errors
    if (error.response.status === 401) {
      const { errorCode, message } = error.response.data || {};
      const token = localStorage.getItem('taskmanager_token') || sessionStorage.getItem('taskmanager_token');
      
      console.warn('[AXIOS] 401 Auth Error:', {
        errorCode,
        message,
        tokenExists: !!token,
        url: error.config.url
      });

      if (errorCode === 'TOKEN_INVALID' || errorCode === 'TOKEN_EXPIRED') {
        console.warn('[AXIOS] Token invalid/expired - will trigger logout in component');
      }
    }

    return Promise.reject(normalizedError)
  }
)

export default axiosClient
