<template>
  <div class="p-4 bg-white rounded shadow">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Mis Pedidos</h1>
        <p class="text-gray-600">Historial y estado de tus pedidos de combustible</p>
      </div>
      <router-link
          to="/client/create-order"
          class="btn-primary"
      >
        Nuevo Pedido
      </router-link>
    </div>

    <!-- Estadísticas -->
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
        <h3 class="text-sm font-medium text-gray-500">En tránsito</h3>
        <p class="text-2xl font-bold text-secondary-600">{{ enProceso }}</p>
      </div>
      <div class="bg-white p-4 rounded-lg border">
        <h3 class="text-sm font-medium text-gray-500">Completados</h3>
        <p class="text-2xl font-bold text-primary-600">{{ completados }}</p>
      </div>
    </div>

    <!-- Lista de pedidos -->
    <div class="bg-white rounded-lg border">
      <div class="p-4 border-b">
        <h3 class="text-lg font-medium text-gray-900">Historial de Pedidos</h3>
      </div>

      <div v-if="orders.length > 0" class="divide-y">
        <div v-for="order in orders" :key="order.id" class="p-4">
          <div class="flex justify-between items-center mb-1">
            <p class="text-lg font-semibold text-gray-800">
              #{{ order.orderNumber }}
            </p>
            <span
                class="text-xs px-2 py-1 rounded-full"
                :class="badgeClass(order.status)"
            >
              {{ statusText(order.status) }}
            </span>
          </div>

          <p class="text-sm text-gray-600">
            {{ order.quantity }} L de {{ fuelTypeText(order.fuelType) }} • Total:
            <span class="text-gray-800 font-medium">
              {{ formatCurrency(order.totalAmount) }}
            </span>
          </p>

          <p class="text-xs text-gray-500">Fecha: {{ formatDate(order.createdAt) }}</p>
          <p class="text-xs text-gray-500">Dirección: {{ order.deliveryAddress }}</p>

          <!-- Acción contextual -->
          <div v-if="order.status === 2" class="mt-3">
            <router-link
                :to="`/client/pay-order/${order.id}`"
                class="btn-secondary text-sm"
            >
              Pagar ahora
            </router-link>
          </div>
        </div>
      </div>

      <div v-else-if="!loading" class="p-8 text-center text-gray-500">
        <p>No tienes pedidos aún. ¡Crea tu primer pedido de combustible!</p>
        <router-link
            to="/client/create-order"
            class="inline-block mt-4 btn-primary"
        >
          Crear Pedido
        </router-link>
      </div>

      <div v-else class="p-8 text-center text-gray-500">
        <p>Cargando pedidos...</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import axios from 'axios'

const orders = ref([])
const loading = ref(true)

const fetchOrders = async () => {
  try {
    const token = localStorage.getItem('token')
    if (!token) throw new Error('Token no encontrado')

    const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'
    const url = `${baseURL}/orders`

    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    orders.value = response.data
  } catch (error) {
    console.error('❌ Error al obtener pedidos:', error)
  } finally {
    loading.value = false
  }
}

onMounted(fetchOrders)

// Estadísticas
const total = computed(() => orders.value.length)
const pendientes = computed(() => orders.value.filter(o => o.status === 1).length)
const enProceso = computed(() => orders.value.filter(o => o.status === 3).length)
const completados = computed(() => orders.value.filter(o => o.status === 4).length)

// Utilidades
const fuelTypeText = (type) => ({
  1: 'Gasolina',
  2: 'Diesel',
  3: 'Premium'
}[type] || 'Desconocido')

const statusText = (status) => ({
  1: 'Pendiente',
  2: 'Confirmado',
  3: 'En tránsito',
  4: 'Entregado',
  5: 'Cancelado'
}[status] || 'Desconocido')

const badgeClass = (status) => ({
  1: 'bg-yellow-100 text-yellow-800',
  2: 'bg-blue-100 text-blue-800',
  3: 'bg-purple-100 text-purple-800',
  4: 'bg-green-100 text-green-800',
  5: 'bg-red-100 text-red-800'
}[status] || 'bg-gray-100 text-gray-700')

const formatDate = (date) =>
    new Date(date).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })

const formatCurrency = (amount) =>
    new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
</script>
