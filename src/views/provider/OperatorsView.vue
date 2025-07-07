<template>
  <div class="p-4 bg-white rounded shadow">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Gestión de Operadores</h1>
        <p class="text-gray-600">Administra los operadores disponibles</p>
      </div>
      <div class="flex space-x-2">
        <select v-model="filter" class="border border-gray-300 rounded-lg px-3 py-2 text-sm">
          <option value="">Todos los operadores</option>
          <option value="1">Disponibles</option>
          <option value="2">En entrega</option>
          <option value="3">Fuera de turno</option>
        </select>
        <button @click="fetchData" class="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg text-sm">
          Actualizar Lista
        </button>
      </div>
    </div>

    <div class="bg-gray-50 rounded-lg p-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div class="bg-white p-4 rounded-lg border">
          <h3 class="text-sm font-medium text-gray-500">Total Operadores</h3>
          <p class="text-2xl font-bold text-gray-900">{{ stats.total }}</p>
        </div>
        <div class="bg-white p-4 rounded-lg border">
          <h3 class="text-sm font-medium text-gray-500">Disponibles</h3>
          <p class="text-2xl font-bold text-primary-600">{{ stats.available }}</p>
        </div>
        <div class="bg-white p-4 rounded-lg border">
          <h3 class="text-sm font-medium text-gray-500">En Entrega</h3>
          <p class="text-2xl font-bold text-secondary-600">{{ stats.inDelivery }}</p>
        </div>
        <div class="bg-white p-4 rounded-lg border">
          <h3 class="text-sm font-medium text-gray-500">Fuera de Turno</h3>
          <p class="text-2xl font-bold text-gray-600">{{ stats.offShift }}</p>
        </div>
      </div>

      <div class="bg-white rounded-lg border">
        <div class="p-4 border-b flex items-center justify-between">
          <h3 class="text-lg font-medium text-gray-900">Lista de Operadores</h3>
        </div>

        <div v-if="filteredOperators.length" class="divide-y">
          <div v-for="op in filteredOperators" :key="op.id" class="p-4">
            <p class="font-medium text-gray-800">{{ fullName(op) }}</p>
            <p class="text-sm text-gray-500">Estado: {{ statusText(op.status) }}</p>
          </div>
        </div>

        <div v-else class="p-8 text-center text-gray-500">
          <p>No hay operadores registrados en el sistema.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'

const operators = ref([])
const filter = ref('')
const stats = ref({
  total: 0,
  available: 0,
  inDelivery: 0,
  offShift: 0,
})

const fetchData = async () => {
  try {
    const token = localStorage.getItem('token')
    const config = { headers: { Authorization: `Bearer ${token}` } }
    const base = import.meta.env.VITE_API_BASE_URL

    const res = await axios.get(`${base}/operators`, config)
    operators.value = res.data

    stats.value.total = operators.value.length
    stats.value.available = operators.value.filter(o => o.status === 1).length
    stats.value.inDelivery = operators.value.filter(o => o.status === 2).length
    stats.value.offShift = operators.value.filter(o => o.status === 3).length
  } catch (error) {
    console.error('[Error al cargar operadores]:', error)
  }
}

const filteredOperators = computed(() => {
  if (!filter.value) return operators.value
  return operators.value.filter(o => o.status === parseInt(filter.value))
})

const statusText = (status) => ({
  1: 'Disponible',
  2: 'En entrega',
  3: 'Fuera de turno',
}[status] || 'Desconocido')

const fullName = (op) => `${op.firstName} ${op.lastName}`

onMounted(fetchData)
</script>
