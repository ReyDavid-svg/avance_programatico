import axios from 'axios'
import { authStore } from '../stores/auth'

const api = axios.create({
  baseURL: '/api',
  timeout: 15000,
})

// Adjunta el token en cada petición
api.interceptors.request.use((config) => {
  const token = authStore.token
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Si el servidor responde 401, cierra sesión automáticamente
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      authStore.logout()
      window.location.reload()
    }
    return Promise.reject(err)
  }
)

export default api
