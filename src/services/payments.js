import api from './api'

export const paymentsService = {
  async getPaymentMethods() {
    const response = await api.get('/payments/methods')
    return response.data
  },

  async createPaymentMethod(methodData) {
    const response = await api.post('/payments/methods', methodData)
    return response.data
  },

  async deletePaymentMethod(methodId) {
    const response = await api.delete(`/payments/methods/${methodId}`)
    return response.data
  },

  async processPayment(paymentData) {
    const response = await api.post('/payments/process', paymentData)
    return response.data
  },

  async getPayments() {
    const response = await api.get('/payments')
    return response.data
  }
}