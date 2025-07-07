import api from './api'

export const notificationsService = {
  async getNotifications() {
    const response = await api.get('/notifications')
    return response.data
  },

  async createNotification(notificationData) {
    const response = await api.post('/notifications', notificationData)
    return response.data
  },

  async markAsRead(notificationId) {
    const response = await api.patch(`/notifications/${notificationId}/read`)
    return response.data
  },

  async markAllAsRead() {
    const response = await api.patch('/notifications/read-all')
    return response.data
  },

  async getUnreadCount() {
    const response = await api.get('/notifications/unread-count')
    return response.data
  }
}