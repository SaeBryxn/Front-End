import api from './api'

export const usersService = {
  async getAllUsers() {
    const response = await api.get('/users')
    return response.data
  },

  async getUserProfile() {
    const response = await api.get('/users/profile')
    return response.data
  },

  async updateProfile(userData) {
    const response = await api.put('/users/profile', userData)
    return response.data
  },

  async toggleUserStatus(userId) {
    const response = await api.patch(`/users/${userId}/toggle-status`)
    return response.data
  }
}