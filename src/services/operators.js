import api from './api'

export const operatorsService = {
  async getOperators() {
    const response = await api.get('/operators')
    return response.data
  },

  async getAvailableOperators() {
    const response = await api.get('/operators/available')
    return response.data
  },

  async createOperator(operatorData) {
    const response = await api.post('/operators', operatorData)
    return response.data
  },

  async updateOperator(operatorId, operatorData) {
    const response = await api.put(`/operators/${operatorId}`, operatorData)
    return response.data
  },

  async deleteOperator(operatorId) {
    const response = await api.delete(`/operators/${operatorId}`)
    return response.data
  }
}