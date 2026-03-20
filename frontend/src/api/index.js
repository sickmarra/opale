import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : '/api'

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' }
})

// Attach JWT token to every request
api.interceptors.request.use(config => {
  const token = localStorage.getItem('opale_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Handle 401 globally
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('opale_token')
      localStorage.removeItem('opale_user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export const authApi = {
  register: data => api.post('/auth/register', data),
  login: data => api.post('/auth/login', data),
  googleLogin: data => api.post('/auth/google', data),
  me: () => api.get('/auth/me'),
  verifyEmail: token => api.get(`/auth/verify-email?token=${token}`),
  resendVerification: data => api.post('/auth/resend-verification', data),
  forgotPassword: data => api.post('/auth/forgot-password', data),
  resetPassword: data => api.post('/auth/reset-password', data),
}

export const bookingsApi = {
  getAll: () => api.get('/bookings'),
  create: data => api.post('/bookings', data),
  update: (id, data) => api.put(`/bookings/${id}`, data),
  delete: id => api.delete(`/bookings/${id}`),
}

export const servicesApi = {
  getAll: () => api.get('/services'),
  create: data => api.post('/services', data),
  update: (id, data) => api.put(`/services/${id}`, data),
  delete: id => api.delete(`/services/${id}`),
}

export const availabilityApi = {
  getDay: date => api.get(`/availability?date=${date}`),
  getMonth: (year, month) => api.get(`/availability/month?year=${year}&month=${month}`),
}

export default api
