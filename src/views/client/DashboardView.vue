<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Mi Dashboard</h1>
        <p class="text-gray-600">Bienvenido, {{ user?.firstName }} {{ user?.lastName }}</p>
      </div>
      <router-link to="/client/create-order" class="btn-primary">
        <PlusIcon class="h-5 w-5 mr-2" />
        Nuevo Pedido
      </router-link>
    </div>

    <!-- Quick Stats -->
    <div v-if="loading" class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <SkeletonLoader v-for="i in 3" :key="i" type="card" />
    </div>
    
    <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-6">
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
            <p class="text-sm font-medium text-gray-500">Total Gastado</p>
            <p class="text-2xl font-bold text-gray-900">${{ formatCurrency(stats?.totalRevenue || 0) }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Recent Orders -->
    <div class="card">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-medium text-gray-900">Pedidos Recientes</h3>
        <router-link to="/client/orders" class="text-sm text-primary-600 hover:text-primary-700">
          Ver todos
        </router-link>
      </div>
      
      <div v-if="loading" class="space-y-3">
        <SkeletonLoader v-for="i in 5" :key="i" type="table" :rows="1" />
      </div>
      
      <div v-else-if="recentOrders.length" class="space-y-4">
        <div
          v-for="order in recentOrders"
          :key="order.id"
          class="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200"
        >
          <div class="flex-1">
            <div class="flex items-center space-x-4">
              <div>
                <p class="text-sm font-medium text-gray-900">{{ order.orderNumber }}</p>
                <p class="text-sm text-gray-500">{{ order.fuelType }} - {{ order.quantity }}L</p>
              </div>
              <StatusBadge :status="order.status" type="order" />
            </div>
            <p class="text-xs text-gray-400 mt-1">{{ formatDate(order.createdAt) }}</p>
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
        <ClipboardDocumentListIcon class="mx-auto h-12 w-12 text-gray-400" />
        <h3 class="mt-2 text-sm font-medium text-gray-900">No tienes pedidos</h3>
        <p class="mt-1 text-sm text-gray-500">Comienza creando tu primer pedido de combustible.</p>
        <div class="mt-6">
          <router-link to="/client/create-order" class="btn-primary">
            <PlusIcon class="h-5 w-5 mr-2" />
            Crear Pedido
          </router-link>
        </div>
      </div>
    </div>

    <!-- Spending Chart -->
    <div v-if="stats?.monthlyRevenue?.length" class="card">
      <h3 class="text-lg font-medium text-gray-900 mb-4">Gastos Mensuales</h3>
      <div class="h-64">
        <div class="flex items-end justify-between h-48 space-x-2">
          <div
            v-for="month in stats.monthlyRevenue.slice(-6)"
            :key="month.month"
            class="flex-1 bg-primary-500 rounded-t"
            :style="{ height: `${(month.revenue / maxSpending) * 100}%` }"
            :title="`${month.month}: $${formatCurrency(month.revenue)}`"
          ></div>
        </div>
        <div class="flex justify-between mt-2 text-xs text-gray-500">
          <span v-for="month in stats.monthlyRevenue.slice(-6)" :key="month.month">
            {{ formatMonth(month.month) }}
          </span>
        </div>
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
  PlusIcon
} from '@heroicons/vue/24/outline'
import { useAuthStore } from '@/stores/auth'
import { analyticsService } from '@/services/analytics'
import { ordersService } from '@/services/orders'
import SkeletonLoader from '@/components/SkeletonLoader.vue'
import StatusBadge from '@/components/StatusBadge.vue'

const authStore = useAuthStore()
const loading = ref(true)
const stats = ref(null)
const recentOrders = ref([])

const user = computed(() => authStore.user)

const maxSpending = computed(() => {
  if (!stats.value?.monthlyRevenue?.length) return 0
  return Math.max(...stats.value.monthlyRevenue.map(m => m.revenue))
})

const fetchData = async () => {
  loading.value = true
  try {
    const [statsData, ordersData] = await Promise.all([
      analyticsService.getClientStats(),
      ordersService.getOrders()
    ])
    
    stats.value = statsData
    recentOrders.value = ordersData.slice(0, 5)
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

onMounted(() => {
  fetchData()
})
</script>