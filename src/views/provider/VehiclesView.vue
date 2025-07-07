<template>
  <div class="p-4 bg-white rounded shadow">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Gestión de Vehículos</h1>
        <p class="text-gray-600">Administra la flota de vehículos disponibles</p>
      </div>
      <div class="flex space-x-2">
        <select v-model="filter" class="border border-gray-300 rounded-lg px-3 py-2 text-sm">
          <option value="">Todos los vehículos</option>
          <option value="1">Disponibles</option>
          <option value="2">En uso</option>
          <option value="3">Mantenimiento</option>
        </select>
        <button
            @click="fetchVehicles"
            class="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg text-sm"
        >
          Actualizar Lista
        </button>
      </div>
    </div>

    <div class="bg-gray-50 rounded-lg p-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div class="bg-white p-4 rounded-lg border">
          <h3 class="text-sm font-medium text-gray-500">Total Vehículos</h3>
          <p class="text-2xl font-bold text-gray-900">{{ total }}</p>
        </div>
        <div class="bg-white p-4 rounded-lg border">
          <h3 class="text-sm font-medium text-gray-500">Disponibles</h3>
          <p class="text-2xl font-bold text-primary-600">{{ available }}</p>
        </div>
        <div class="bg-white p-4 rounded-lg border">
          <h3 class="text-sm font-medium text-gray-500">En Uso</h3>
          <p class="text-2xl font-bold text-secondary-600">{{ inUse }}</p>
        </div>
        <div class="bg-white p-4 rounded-lg border">
          <h3 class="text-sm font-medium text-gray-500">Mantenimiento</h3>
          <p class="text-2xl font-bold text-yellow-600">{{ maintenance }}</p>
        </div>
      </div>

      <div class="bg-white rounded-lg border">
        <div class="p-4 border-b">
          <h3 class="text-lg font-medium text-gray-900">Lista de Vehículos</h3>
        </div>
        <div v-if="filteredVehicles.length" class="divide-y">
          <div
              v-for="vehicle in filteredVehicles"
              :key="vehicle.id"
              class="p-4 text-sm text-gray-800"
          >
            <p class="font-semibold">
              {{ vehicle.licensePlate }} - {{ vehicle.brand }} {{ vehicle.model }} ({{ vehicle.year }})
            </p>
            <p class="text-xs text-gray-500">
              Capacidad: {{ vehicle.capacity }}L — Estado: {{ statusText(vehicle.status) }}
            </p>
            <p class="text-xs text-gray-400">
              Ubicación:
              <span v-if="vehicle.currentLatitude && vehicle.currentLongitude">
                {{ vehicle.currentLatitude.toFixed(4) }}, {{ vehicle.currentLongitude.toFixed(4) }}
              </span>
              <span v-else>No registrada</span>
            </p>
          </div>
        </div>
        <div v-else class="p-8 text-center text-gray-500">
          <p>No hay vehículos registrados en el sistema.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'

const vehicles = ref([])
const filter = ref('')
const token = localStorage.getItem('token')
const base = import.meta.env.VITE_API_BASE_URL

const fetchVehicles = async () => {
  try {
    const config = { headers: { Authorization: `Bearer ${token}` } }
    const response = await axios.get(`${base}/vehicles`, config)
    vehicles.value = response.data
  } catch (error) {
    console.error('[Error cargando vehículos]:', error)
  }
}

onMounted(fetchVehicles)

const total = computed(() => vehicles.value.length)
const available = computed(() => vehicles.value.filter(v => v.status === 1).length)
const inUse = computed(() => vehicles.value.filter(v => v.status === 2).length)
const maintenance = computed(() => vehicles.value.filter(v => v.status === 3).length)

const filteredVehicles = computed(() => {
  if (!filter.value) return vehicles.value
  return vehicles.value.filter(v => v.status === parseInt(filter.value))
})

const statusText = (status) => ({
  1: 'Disponible',
  2: 'En uso',
  3: 'Mantenimiento',
  4: 'Fuera de servicio'
}[status] || 'Desconocido')
</script>

<style scoped>
/* Estilos opcionales adicionales */
</style>
