import api from './api'

export const ordersService = {
  async getOrders() {
    const response = await api.get('/orders')
    return response.data
  },

  async getOrder(id) {
    const response = await api.get(`/orders/${id}`)
    return response.data
  },

  async createOrder(orderData) {
    const response = await api.post('/orders', orderData)
    return response.data
  },

  async assignDelivery(orderId, assignmentData) {
    const response = await api.post(`/orders/${orderId}/assign`, assignmentData)
    return response.data
  },

  async updateOrderStatus(orderId, status) {
    const response = await api.patch(`/orders/${orderId}/status`, status)
    return response.data
  }
}