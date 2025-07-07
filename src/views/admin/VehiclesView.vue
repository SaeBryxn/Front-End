<template>
  <div class="p-4 bg-white rounded shadow">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Gestión de Vehículos</h1>
        <p class="text-gray-600">Administra la flota de vehículos</p>
      </div>
      <button
          class="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg transition-colors duration-200"
          @click="showModal = true"
      >
        Nuevo Vehículo
      </button>
    </div>

    <!-- Estadísticas -->
    <div class="bg-gray-50 rounded-lg p-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div class="bg-white p-4 rounded-lg border">
          <h3 class="text-sm font-medium text-gray-500">Total Vehículos</h3>
          <p class="text-2xl font-bold text-gray-900">{{ total }}</p>
        </div>
        <div class="bg-white p-4 rounded-lg border">
          <h3 class="text-sm font-medium text-gray-500">Disponibles</h3>
          <p class="text-2xl font-bold text-primary-600">{{ disponibles }}</p>
        </div>
        <div class="bg-white p-4 rounded-lg border">
          <h3 class="text-sm font-medium text-gray-500">En Uso</h3>
          <p class="text-2xl font-bold text-secondary-600">{{ enUso }}</p>
        </div>
        <div class="bg-white p-4 rounded-lg border">
          <h3 class="text-sm font-medium text-gray-500">Mantenimiento</h3>
          <p class="text-2xl font-bold text-yellow-600">{{ mantenimiento }}</p>
        </div>
      </div>

      <!-- Lista -->
      <div class="bg-white rounded-lg border">
        <div class="p-4 border-b">
          <h3 class="text-lg font-medium text-gray-900">Lista de Vehículos</h3>
        </div>

        <div v-if="vehicles.length > 0" class="divide-y">
          <div v-for="vehicle in vehicles" :key="vehicle.id" class="p-4">
            <p class="text-lg font-semibold text-gray-800">{{ vehicle.licensePlate }} - {{ vehicle.brand }} {{ vehicle.model }}</p>
            <p class="text-sm text-gray-600">Año: {{ vehicle.year }} | Capacidad: {{ vehicle.capacity }} L</p>
            <p class="text-xs text-gray-400">Estado: {{ statusText(vehicle.status) }}</p>
          </div>
        </div>

        <div v-else-if="!loading" class="p-8 text-center text-gray-500">
          <p>No hay vehículos registrados aún.</p>
        </div>

        <div v-else class="p-8 text-center text-gray-500">
          <p>Cargando vehículos...</p>
        </div>
      </div>
    </div>

    <!-- Modal de creación -->
    <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div class="bg-white p-6 rounded-lg w-full max-w-md shadow">
        <h2 class="text-xl font-bold mb-4 text-gray-800">Nuevo Vehículo</h2>
        <form @submit.prevent="createVehicle">
          <div class="space-y-4">
            <input v-model="form.licensePlate" type="text" placeholder="Placa" class="w-full border rounded px-3 py-2" required />
            <input v-model="form.brand" type="text" placeholder="Marca" class="w-full border rounded px-3 py-2" required />
            <input v-model="form.model" type="text" placeholder="Modelo" class="w-full border rounded px-3 py-2" required />
            <input v-model.number="form.year" type="number" placeholder="Año" class="w-full border rounded px-3 py-2" required />
            <input v-model.number="form.capacity" type="number" placeholder="Capacidad (L)" class="w-full border rounded px-3 py-2" required />
          </div>
          <div class="mt-6 flex justify-end space-x-2">
            <button type="button" class="px-4 py-2 bg-gray-300 rounded" @click="showModal = false">Cancelar</button>
            <button type="submit" class="px-4 py-2 bg-primary-600 text-white rounded">Guardar</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'
import { useToast } from 'vue-toastification'

const toast = useToast()
const vehicles = ref([])
const loading = ref(true)
const showModal = ref(false)

const form = ref({
  licensePlate: '',
  brand: '',
  model: '',
  year: new Date().getFullYear(),
  capacity: 1000
})

const fetchVehicles = async () => {
  try {
    const token = localStorage.getItem('token')
    const baseURL = import.meta.env.VITE_API_BASE_URL

    const response = await axios.get(`${baseURL}/vehicles`, {
      headers: { Authorization: `Bearer ${token}` }
    })

    vehicles.value = response.data
  } catch (error) {
    console.error('❌ Error al obtener vehículos:', error)
  } finally {
    loading.value = false
  }
}

const createVehicle = async () => {
  try {
    const token = localStorage.getItem('token')
    const baseURL = import.meta.env.VITE_API_BASE_URL

    await axios.post(`${baseURL}/vehicles`, form.value, {
      headers: { Authorization: `Bearer ${token}` }
    })

    toast.success('Vehículo creado correctamente.')
    showModal.value = false
    await fetchVehicles()
  } catch (error) {
    console.error('❌ Error al crear vehículo:', error)
    toast.error(error.response?.data?.message || 'Error al crear vehículo.')
  }
}

onMounted(fetchVehicles)

const total = computed(() => vehicles.value.length)
const disponibles = computed(() => vehicles.value.filter(v => v.status === 1).length)
const enUso = computed(() => vehicles.value.filter(v => v.status === 2).length)
const mantenimiento = computed(() => vehicles.value.filter(v => v.status === 3).length)

const statusText = (status) => ({
  1: 'Disponible',
  2: 'En Uso',
  3: 'Mantenimiento',
  4: 'Fuera de Servicio'
}[status] || 'Desconocido')
</script>
