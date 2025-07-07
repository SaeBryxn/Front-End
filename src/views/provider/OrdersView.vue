<template>
  <div class="p-4 bg-white rounded shadow">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Gestión de Entregas</h1>
        <p class="text-gray-600">Administra las entregas asignadas</p>
      </div>
      <select v-model="filter" class="border border-gray-300 rounded px-3 py-2">
        <option value="">Todas</option>
        <option value="1">Pendiente</option>
        <option value="2">Confirmado</option>
        <option value="3">En tránsito</option>
        <option value="4">Entregado</option>
      </select>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div v-for="(value, key) in statMap" :key="key" class="bg-white p-4 rounded-lg border">
        <h3 class="text-sm text-gray-500">{{ key }}</h3>
        <p class="text-2xl font-bold" :class="value.color">{{ value.val }}</p>
      </div>
    </div>

    <div v-if="filteredOrders.length" class="space-y-4">
      <div v-for="order in filteredOrders" :key="order.id" class="bg-white p-4 rounded border">
        <div class="flex justify-between items-center">
          <div>
            <p class="font-semibold">#{{ order.orderNumber }}</p>
            <p class="text-sm text-gray-600">
              {{ order.quantity }}L - {{ fuelTypeText(order.fuelType) }} - Estado: {{ statusText(order.status) }}
            </p>
            <p class="text-xs text-gray-500">Cliente: {{ order.customerName }}</p>
            <p class="text-xs text-gray-500">Dirección: {{ order.deliveryAddress }}</p>
          </div>
          <div class="space-y-2">
            <select v-model="order.newStatus" class="border rounded px-2 py-1 text-sm">
              <option disabled value="">Actualizar Estado</option>
              <option :value="3">En tránsito</option>
              <option :value="4">Entregado</option>
            </select>
            <button
                v-if="order.newStatus"
                class="text-white bg-primary-500 hover:bg-primary-600 px-2 py-1 rounded text-sm"
                @click="updateStatus(order.id, order.newStatus)"
            >
              Confirmar
            </button>
          </div>
        </div>

        <div v-if="order.status === 1 && assignments[order.id]" class="mt-2 flex space-x-2">
          <select v-model="assignments[order.id].operatorId" class="text-sm border rounded px-2 py-1">
            <option disabled value="">Asignar Operador</option>
            <option v-for="op in availableOperators" :key="op.id" :value="op.id">
              {{ op.fullName || 'Operador sin nombre' }}
            </option>
          </select>

          <select v-model="assignments[order.id].vehicleId" class="text-sm border rounded px-2 py-1">
            <option disabled value="">Asignar Vehículo</option>
            <option v-for="v in availableVehicles" :key="v.id" :value="v.id">
              {{ v.display || 'Vehículo sin nombre' }}
            </option>
          </select>

          <button
              class="text-sm bg-secondary-500 hover:bg-secondary-600 text-white px-3 py-1 rounded"
              @click="assign(order.id)"
          >
            Asignar
          </button>
        </div>
      </div>
    </div>

    <div v-else class="text-center text-gray-500 py-10">
      No hay entregas asignadas.
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, reactive, watch } from 'vue'
import axios from 'axios'
import { useToast } from 'vue-toastification'

const stats = ref(null)
const orders = ref([])
const availableOperators = ref([])
const availableVehicles = ref([])
const assignments = reactive({})
const filter = ref('')
const toast = useToast()

const initAssignments = () => {
  orders.value.forEach(order => {
    if (!assignments[order.id]) {
      assignments[order.id] = { operatorId: null, vehicleId: null }
    }
    order.newStatus = ''
  })
}

watch(orders, initAssignments)

const fetchData = async () => {
  try {
    const token = localStorage.getItem('token')
    const user = JSON.parse(localStorage.getItem('user') || '{}')

    if (user.role !== 'Proveedor') {
      console.warn('Acceso denegado: solo proveedores pueden ver entregas.')
      return
    }

    const config = { headers: { Authorization: `Bearer ${token}` } }
    const base = import.meta.env.VITE_API_BASE_URL

    const [statsRes, ordersRes, opsRes, vehsRes] = await Promise.all([
      axios.get(`${base}/analytics/provider`, config),
      axios.get(`${base}/orders/provider`, config),
      axios.get(`${base}/operators/available`, config),
      axios.get(`${base}/vehicles/available`, config)
    ])

    stats.value = statsRes.data
    orders.value = ordersRes.data

    // operadores normales
    availableOperators.value = opsRes.data.map(op => ({
      ...op,
      fullName: op.fullName || `${op.firstName || ''} ${op.lastName || ''}`.trim()
    }))

    // vehículos con display name
    availableVehicles.value = vehsRes.data.map(v => ({
      ...v,
      display: v.plate || `${v.brand || ''} ${v.model || ''} (${v.year || ''})`.trim()
    }))
  } catch (error) {
    console.error('[Error cargando datos]:', error)
  }
}

const updateStatus = async (orderId, newStatus) => {
  try {
    const token = localStorage.getItem('token')
    await axios.patch(
        `${import.meta.env.VITE_API_BASE_URL}/orders/${orderId}/status`,
        newStatus,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
    )
    toast.success('Estado actualizado correctamente.')
    await fetchData()
  } catch (error) {
    console.error('[Error actualizando estado]:', error)
    toast.error('Error al actualizar el estado.')
  }
}

const assign = async (orderId) => {
  try {
    const { operatorId, vehicleId } = assignments[orderId]
    if (!operatorId || !vehicleId) return

    const token = localStorage.getItem('token')
    const config = { headers: { Authorization: `Bearer ${token}` } }

    await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/orders/${orderId}/assign`,
        { operatorId, vehicleId },
        config
    )

    toast.success('Pedido asignado correctamente.')
    await fetchData()
  } catch (error) {
    console.error('[Error asignando pedido]:', error)
    toast.error('Error al asignar pedido.')
  }
}

onMounted(fetchData)

const filteredOrders = computed(() => {
  if (!filter.value) return orders.value
  return orders.value.filter(order => order.status === parseInt(filter.value))
})

const statMap = computed(() => ({
  'Entregas Asignadas': { val: stats.value?.assignedOrders || 0, color: 'text-gray-900' },
  'En Tránsito': { val: stats.value?.inTransitOrders || 0, color: 'text-yellow-600' },
  'Completadas Hoy': { val: stats.value?.completedToday || 0, color: 'text-primary-600' },
  'Eficiencia': { val: `${stats.value?.efficiency || 0}%`, color: 'text-green-600' }
}))

const fuelTypeText = (t) => ({ 1: 'Gasolina', 2: 'Diesel', 3: 'Premium' }[t] || 'Desconocido')
const statusText = (s) => ({
  1: 'Pendiente',
  2: 'Confirmado',
  3: 'En tránsito',
  4: 'Entregado',
  5: 'Cancelado'
}[s] || 'Desconocido')
</script>

<style scoped>
.card {
  background: white;
  padding: 1rem;
  border-radius: 0.5rem;
  border: 1px solid #e5e7eb;
}
</style>
