<template>
  <div class="p-4 bg-white rounded shadow">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Gestión de Pedidos</h1>
        <p class="text-gray-600">Administra todos los pedidos del sistema</p>
      </div>
      <div class="flex space-x-2">
        <select v-model="selectedStatus" class="border border-gray-300 rounded-lg px-3 py-2 text-sm">
          <option value="">Todos los estados</option>
          <option value="1">Pendiente</option>
          <option value="2">Confirmado</option>
          <option value="3">En Tránsito</option>
          <option value="4">Entregado</option>
          <option value="5">Cancelado</option>
        </select>
      </div>
    </div>

    <div class="bg-gray-50 rounded-lg p-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div class="bg-white p-4 rounded-lg border">
          <h3 class="text-sm font-medium text-gray-500">Total Pedidos</h3>
          <p class="text-2xl font-bold text-gray-900">{{ total }}</p>
        </div>
        <div class="bg-white p-4 rounded-lg border">
          <h3 class="text-sm font-medium text-gray-500">Pendientes</h3>
          <p class="text-2xl font-bold text-yellow-600">{{ pendientes }}</p>
        </div>
        <div class="bg-white p-4 rounded-lg border">
          <h3 class="text-sm font-medium text-gray-500">En Proceso</h3>
          <p class="text-2xl font-bold text-secondary-600">{{ enProceso }}</p>
        </div>
        <div class="bg-white p-4 rounded-lg border">
          <h3 class="text-sm font-medium text-gray-500">Completados</h3>
          <p class="text-2xl font-bold text-primary-600">{{ completados }}</p>
        </div>
      </div>

      <div class="bg-white rounded-lg border">
        <div class="p-4 border-b">
          <h3 class="text-lg font-medium text-gray-900">Lista de Pedidos</h3>
        </div>

        <div v-if="filteredOrders.length > 0" class="divide-y">
          <div v-for="order in filteredOrders" :key="order.id" class="p-4">
            <p class="text-lg font-semibold text-gray-800">#{{ order.orderNumber }}</p>
            <p class="text-sm text-gray-600">
              {{ order.quantity }} litros - Estado: {{ statusText(order.status) }}
            </p>
            <p class="text-xs text-gray-400">Cliente: {{ order.customerName }}</p>
          </div>
        </div>

        <div v-else-if="!loading" class="p-8 text-center text-gray-500">
          <p>No hay pedidos registrados con el filtro actual.</p>
        </div>

        <div v-else class="p-8 text-center text-gray-500">
          <p>Cargando pedidos...</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'

const orders = ref([])
const loading = ref(true)
const selectedStatus = ref('')

// Obtener pedidos
const fetchOrders = async () => {
  try {
    const token = localStorage.getItem('token')
    const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'
    const { data } = await axios.get(`${baseURL}/orders`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    orders.value = data
  } catch (error) {
    console.error('❌ Error al obtener pedidos:', error)
  } finally {
    loading.value = false
  }
}

onMounted(fetchOrders)

// Conteos por estado
const total = computed(() => orders.value.length)
const pendientes = computed(() => orders.value.filter(o => o.status === 1).length)
const enProceso = computed(() => orders.value.filter(o => o.status === 3).length)
const completados = computed(() => orders.value.filter(o => o.status === 4).length)

const filteredOrders = computed(() => {
  if (!selectedStatus.value) return orders.value
  return orders.value.filter(o => o.status === Number(selectedStatus.value))
})

const statusText = (status) => ({
  1: 'Pendiente',
  2: 'Confirmado',
  3: 'En Tránsito',
  4: 'Entregado',
  5: 'Cancelado'
}[status] || 'Desconocido')
</script>
