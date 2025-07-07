import api from './api'

export const analyticsService = {
  async getDashboardStats() {
    const response = await api.get('/analytics/dashboard')
    return response.data
  },

  async getUserStats() {
    const response = await api.get('/analytics/users')
    return response.data
  },

  async getProviderStats() {
    const response = await api.get('/analytics/provider')
    return response.data
  },

  async getClientStats() {
    const response = await api.get('/analytics/client')
    return response.data
  }
}