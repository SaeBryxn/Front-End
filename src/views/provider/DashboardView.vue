<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Dashboard Proveedor</h1>
        <p class="text-gray-600">Gestiona entregas y recursos</p>
      </div>
      <div class="text-sm text-gray-500">
        Última actualización: {{ new Date().toLocaleString('es-ES') }}
      </div>
    </div>

    <!-- Quick Stats -->
    <div v-if="loading" class="grid grid-cols-1 md:grid-cols-4 gap-6">
      <SkeletonLoader v-for="i in 4" :key="i" type="card" />
    </div>
    
    <div v-else class="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div class="card">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <ClipboardDocumentListIcon class="h-8 w-8 text-primary-600" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500">Entregas Asignadas</p>
            <p class="text-2xl font-bold text-gray-900">{{ stats?.totalOrders || 0 }}</p>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <TruckIcon class="h-8 w-8 text-orange-600" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500">En Tránsito</p>
            <p class="text-2xl font-bold text-gray-900">{{ stats?.pendingOrders || 0 }}</p>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <CheckCircleIcon class="h-8 w-8 text-green-600" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500">Completadas</p>
            <p class="text-2xl font-bold text-gray-900">{{ stats?.completedOrders || 0 }}</p>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <UserGroupIcon class="h-8 w-8 text-blue-600" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500">Operadores Disponibles</p>
            <p class="text-2xl font-bold text-gray-900">{{ stats?.availableOperators || 0 }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Active Deliveries -->
    <div class="card">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-medium text-gray-900">Entregas Activas</h3>
        <router-link to="/provider/orders" class="text-sm text-primary-600 hover:text-primary-700">
          Ver todas
        </router-link>
      </div>
      
      <div v-if="loading" class="space-y-3">
        <SkeletonLoader v-for="i in 5" :key="i" type="table" :rows="1" />
      </div>
      
      <div v-else-if="activeOrders.length" class="space-y-4">
        <div
          v-for="order in activeOrders"
          :key="order.id"
          class="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200"
        >
          <div class="flex-1">
            <div class="flex items-center space-x-4">
              <div>
                <p class="text-sm font-medium text-gray-900">{{ order.orderNumber }}</p>
                <p class="text-sm text-gray-500">{{ order.customerName }}</p>
              </div>
              <StatusBadge :status="order.status" type="order" />
            </div>
            <div class="mt-2 flex items-center space-x-4 text-xs text-gray-500">
              <span v-if="order.assignedVehiclePlate">
                🚛 {{ order.assignedVehiclePlate }}
              </span>
              <span v-if="order.assignedOperatorName">
                👤 {{ order.assignedOperatorName }}
              </span>
              <span>{{ order.fuelType }} - {{ order.quantity }}L</span>
            </div>
          </div>
          <div class="text-right">
            <p class="text-sm font-medium text-gray-900">${{ formatCurrency(order.totalAmount) }}</p>
            <p v-if="order.estimatedDeliveryTime" class="text-xs text-gray-500">
              ETA: {{ formatDate(order.estimatedDeliveryTime) }}
            </p>
          </div>
        </div>
      </div>
      
      <div v-else class="text-center py-8">
        <TruckIcon class="mx-auto h-12 w-12 text-gray-400" />
        <h3 class="mt-2 text-sm font-medium text-gray-900">No hay entregas activas</h3>
        <p class="mt-1 text-sm text-gray-500">Las nuevas entregas aparecerán aquí.</p>
      </div>
    </div>

    <!-- Resources Overview -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Vehicles Status -->
      <div class="card">
        <h3 class="text-lg font-medium text-gray-900 mb-4">Estado de Vehículos</h3>
        <div v-if="loading" class="space-y-3">
          <SkeletonLoader v-for="i in 3" :key="i" height="2rem" />
        </div>
        <div v-else class="space-y-3">
          <div class="flex items-center justify-between">
            <span class="text-sm text-gray-600">Disponibles</span>
            <span class="text-sm font-medium text-green-600">{{ vehicleStats.available || 0 }}</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-sm text-gray-600">En Uso</span>
            <span class="text-sm font-medium text-orange-600">{{ vehicleStats.inUse || 0 }}</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-sm text-gray-600">Mantenimiento</span>
            <span class="text-sm font-medium text-yellow-600">{{ vehicleStats.maintenance || 0 }}</span>
          </div>
        </div>
      </div>

      <!-- Operators Status -->
      <div class="card">
        <h3 class="text-lg font-medium text-gray-900 mb-4">Estado de Operadores</h3>
        <div v-if="loading" class="space-y-3">
          <SkeletonLoader v-for="i in 3" :key="i" height="2rem" />
        </div>
        <div v-else class="space-y-3">
          <div class="flex items-center justify-between">
            <span class="text-sm text-gray-600">Disponibles</span>
            <span class="text-sm font-medium text-green-600">{{ operatorStats.available || 0 }}</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-sm text-gray-600">En Entrega</span>
            <span class="text-sm font-medium text-orange-600">{{ operatorStats.onDelivery || 0 }}</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-sm text-gray-600">Fuera de Turno</span>
            <span class="text-sm font-medium text-gray-600">{{ operatorStats.offDuty || 0 }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import {
  ClipboardDocumentListIcon,
  TruckIcon,
  CheckCircleIcon,
  UserGroupIcon
} from '@heroicons/vue/24/outline'
import { analyticsService } from '@/services/analytics'
import { ordersService } from '@/services/orders'
import { vehiclesService } from '@/services/vehicles'
import { operatorsService } from '@/services/operators'
import SkeletonLoader from '@/components/SkeletonLoader.vue'
import StatusBadge from '@/components/StatusBadge.vue'

const loading = ref(true)
const stats = ref(null)
const activeOrders = ref([])
const vehicleStats = ref({})
const operatorStats = ref({})

const fetchData = async () => {
  loading.value = true
  try {
    const [statsData, ordersData, vehiclesData, operatorsData] = await Promise.all([
      analyticsService.getProviderStats(),
      ordersService.getOrders(),
      vehiclesService.getVehicles(),
      operatorsService.getOperators()
    ])
    
    stats.value = statsData
    activeOrders.value = ordersData.filter(order => 
      order.status === 2 || order.status === 3 // Confirmed or InTransit
    ).slice(0, 5)
    
    // Calculate vehicle stats
    vehicleStats.value = vehiclesData.reduce((acc, vehicle) => {
      switch (vehicle.status) {
        case 1: acc.available = (acc.available || 0) + 1; break
        case 2: acc.inUse = (acc.inUse || 0) + 1; break
        case 3: acc.maintenance = (acc.maintenance || 0) + 1; break
      }
      return acc
    }, {})
    
    // Calculate operator stats
    operatorStats.value = operatorsData.reduce((acc, operator) => {
      switch (operator.status) {
        case 1: acc.available = (acc.available || 0) + 1; break
        case 2: acc.onDelivery = (acc.onDelivery || 0) + 1; break
        case 3: acc.offDuty = (acc.offDuty || 0) + 1; break
      }
      return acc
    }, {})
    
  } catch (error) {
    console.error('Error fetching dashboard data:', error)
  } finally {
    loading.value = false
  }
}

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('es-ES', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount)
}

const formatDate = (dateStr) => {
  return new Date(dateStr).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  })
}

onMounted(() => {
  fetchData()
})
</script>