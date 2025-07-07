import api from './api'

export const vehiclesService = {
  async getVehicles() {
    const response = await api.get('/vehicles')
    return response.data
  },

  async getAvailableVehicles() {
    const response = await api.get('/vehicles/available')
    return response.data
  },

  async createVehicle(vehicleData) {
    const response = await api.post('/vehicles', vehicleData)
    return response.data
  },

  async updateVehicle(vehicleId, vehicleData) {
    const response = await api.put(`/vehicles/${vehicleId}`, vehicleData)
    return response.data
  },

  async deleteVehicle(vehicleId) {
    const response = await api.delete(`/vehicles/${vehicleId}`)
    return response.data
  },

  async updateVehicleLocation(vehicleId, locationData) {
    const response = await api.patch(`/vehicles/${vehicleId}/location`, locationData)
    return response.data
  }
}