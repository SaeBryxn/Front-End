import api from './api'

export const authService = {
  async login(credentials) {
    const response = await api.post('/auth/login', credentials)
    return response.data
  },

  async register(userData) {
    const response = await api.post('/auth/register', userData)
    return response.data
  },

  async refreshToken(refreshToken) {
    const response = await api.post('/auth/refresh', { refreshToken })
    return response.data
  },

  async logout(refreshToken) {
    await api.post('/auth/revoke', { refreshToken })
  }
}