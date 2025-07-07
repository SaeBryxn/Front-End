<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Dashboard Administrativo</h1>
        <p class="text-gray-600">Resumen general del sistema FuelTrack</p>
      </div>
      <div class="text-sm text-gray-500">
        Última actualización: {{ new Date().toLocaleString('es-ES') }}
      </div>
    </div>

    <!-- Stats Cards -->
    <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <SkeletonLoader v-for="i in 4" :key="i" type="card" />
    </div>
    
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div class="card">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <ClipboardDocumentListIcon class="h-8 w-8 text-primary-600" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500">Total Pedidos</p>
            <p class="text-2xl font-bold text-gray-900">{{ stats?.totalOrders || 0 }}</p>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <ClockIcon class="h-8 w-8 text-yellow-600" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500">Pedidos Pendientes</p>
            <p class="text-2xl font-bold text-gray-900">{{ stats?.pendingOrders || 0 }}</p>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <CurrencyDollarIcon class="h-8 w-8 text-green-600" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500">Ingresos Totales</p>
            <p class="text-2xl font-bold text-gray-900">${{ formatCurrency(stats?.totalRevenue || 0) }}</p>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <TruckIcon class="h-8 w-8 text-blue-600" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500">Vehículos Activos</p>
            <p class="text-2xl font-bold text-gray-900">{{ stats?.activeVehicles || 0 }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Charts Section -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Monthly Revenue Chart -->
      <div class="card">
        <h3 class="text-lg font-medium text-gray-900 mb-4">Ingresos Mensuales</h3>
        <div v-if="loading" class="h-64">
          <SkeletonLoader height="16rem" />
        </div>
        <div v-else-if="stats?.monthlyRevenue?.length" class="h-64">
          <!-- Simple bar chart representation -->
          <div class="flex items-end justify-between h-48 space-x-2">
            <div
              v-for="month in stats.monthlyRevenue.slice(-6)"
              :key="month.month"
              class="flex-1 bg-primary-500 rounded-t"
              :style="{ height: `${(month.revenue / maxRevenue) * 100}%` }"
              :title="`${month.month}: $${formatCurrency(month.revenue)}`"
            ></div>
          </div>
          <div class="flex justify-between mt-2 text-xs text-gray-500">
            <span v-for="month in stats.monthlyRevenue.slice(-6)" :key="month.month">
              {{ formatMonth(month.month) }}
            </span>
          </div>
        </div>
        <div v-else class="h-64 flex items-center justify-center text-gray-500">
          No hay datos disponibles
        </div>
      </div>

      <!-- Fuel Type Stats -->
      <div class="card">
        <h3 class="text-lg font-medium text-gray-900 mb-4">Ventas por Tipo de Combustible</h3>
        <div v-if="loading" class="space-y-3">
          <SkeletonLoader v-for="i in 3" :key="i" height="2rem" />
        </div>
        <div v-else-if="stats?.fuelTypeStats?.length" class="space-y-4">
          <div
            v-for="fuel in stats.fuelTypeStats"
            :key="fuel.fuelType"
            class="flex items-center justify-between"
          >
            <div class="flex items-center space-x-3">
              <div class="w-4 h-4 rounded-full" :class="getFuelColor(fuel.fuelType)"></div>
              <span class="text-sm font-medium text-gray-900">{{ fuel.fuelType }}</span>
            </div>
            <div class="text-right">
              <p class="text-sm font-medium text-gray-900">${{ formatCurrency(fuel.totalRevenue) }}</p>
              <p class="text-xs text-gray-500">{{ fuel.orderCount }} pedidos</p>
            </div>
          </div>
        </div>
        <div v-else class="h-32 flex items-center justify-center text-gray-500">
          No hay datos disponibles
        </div>
      </div>
    </div>

    <!-- Recent Activity -->
    <div class="card">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-medium text-gray-900">Actividad Reciente</h3>
        <router-link to="/admin/orders" class="text-sm text-primary-600 hover:text-primary-700">
          Ver todos los pedidos
        </router-link>
      </div>
      
      <div v-if="loading" class="space-y-3">
        <SkeletonLoader v-for="i in 5" :key="i" type="table" :rows="1" />
      </div>
      
      <div v-else class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Pedido
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Cliente
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Monto
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fecha
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="order in recentOrders" :key="order.id">
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {{ order.orderNumber }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ order.customerName }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <StatusBadge :status="order.status" type="order" />
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                ${{ formatCurrency(order.totalAmount) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ formatDate(order.createdAt) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import {
  ClipboardDocumentListIcon,
  ClockIcon,
  CurrencyDollarIcon,
  TruckIcon
} from '@heroicons/vue/24/outline'
import { analyticsService } from '@/services/analytics'
import { ordersService } from '@/services/orders'
import SkeletonLoader from '@/components/SkeletonLoader.vue'
import StatusBadge from '@/components/StatusBadge.vue'

const loading = ref(true)
const stats = ref(null)
const recentOrders = ref([])

const maxRevenue = computed(() => {
  if (!stats.value?.monthlyRevenue?.length) return 0
  return Math.max(...stats.value.monthlyRevenue.map(m => m.revenue))
})

const fetchData = async () => {
  loading.value = true
  try {
    const [statsData, ordersData] = await Promise.all([
      analyticsService.getDashboardStats(),
      ordersService.getOrders()
    ])
    
    stats.value = statsData
    recentOrders.value = ordersData.slice(0, 10)
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

const formatMonth = (monthStr) => {
  const [year, month] = monthStr.split('-')
  const date = new Date(year, month - 1)
  return date.toLocaleDateString('es-ES', { month: 'short' })
}

const formatDate = (dateStr) => {
  return new Date(dateStr).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getFuelColor = (fuelType) => {
  const colors = {
    'Gasoline': 'bg-blue-500',
    'Diesel': 'bg-green-500',
    'Premium': 'bg-purple-500'
  }
  return colors[fuelType] || 'bg-gray-500'
}

onMounted(() => {
  fetchData()
})
</script>