<template>
  <div class="p-4 bg-white rounded shadow">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Analíticas y Reportes</h1>
        <p class="text-gray-600">Estadísticas detalladas del sistema</p>
      </div>
      <div class="flex space-x-2">
        <select class="border border-gray-300 rounded-lg px-3 py-2 text-sm">
          <option>Último mes</option>
          <option>Últimos 3 meses</option>
          <option>Último año</option>
        </select>
        <button @click="exportToPDF" class="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg transition-colors duration-200">
          Exportar PDF
        </button>
        <button @click="exportToExcel" class="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors duration-200">
          Exportar Excel
        </button>
      </div>
    </div>

    <div class="bg-gray-50 rounded-lg p-6">
      <!-- Métricas -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div class="bg-white p-4 rounded-lg border">
          <h3 class="text-sm font-medium text-gray-500">Ingresos Totales</h3>
          <p class="text-2xl font-bold text-green-600">${{ totalRevenue }}</p>
        </div>
        <div class="bg-white p-4 rounded-lg border">
          <h3 class="text-sm font-medium text-gray-500">Pedidos Completados</h3>
          <p class="text-2xl font-bold text-gray-900">{{ completedOrders }}</p>
        </div>
        <div class="bg-white p-4 rounded-lg border">
          <h3 class="text-sm font-medium text-gray-500">Vehículos Activos</h3>
          <p class="text-2xl font-bold text-orange-500">{{ activeVehicles }}</p>
        </div>
        <div class="bg-white p-4 rounded-lg border">
          <h3 class="text-sm font-medium text-gray-500">Operadores Disponibles</h3>
          <p class="text-2xl font-bold text-green-600">{{ availableOperators }}</p>
        </div>
      </div>

      <!-- Gráficos -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Línea de ingresos -->
        <div class="bg-white rounded-lg border p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Ingresos Mensuales</h3>
          <LineChart v-if="monthlyRevenue.length > 0" :data="revenueChartData" />
          <div v-else class="h-64 flex items-center justify-center text-gray-500">
            <p>No hay datos de ingresos</p>
          </div>
        </div>

        <!-- Pie de combustible -->
        <div class="bg-white rounded-lg border p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Distribución por Combustible</h3>
          <PieChart v-if="fuelTypeStats.length > 0" :data="fuelChartData" />
          <div v-else class="h-64 flex items-center justify-center text-gray-500">
            <p>No hay datos de combustible</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import axios from 'axios'
import { Line, Pie } from 'vue-chartjs'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  ArcElement
} from 'chart.js'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'

ChartJS.register(Title, Tooltip, Legend, LineElement, PointElement, CategoryScale, LinearScale, ArcElement)

const totalRevenue = ref(0)
const completedOrders = ref(0)
const activeVehicles = ref(0)
const availableOperators = ref(0)
const monthlyRevenue = ref([])
const fuelTypeStats = ref([])

const token = localStorage.getItem('token')
const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'

const loadDashboardStats = async () => {
  try {
    const res = await axios.get(`${baseURL}/analytics/dashboard`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    const data = res.data
    totalRevenue.value = data.totalRevenue.toFixed(2)
    completedOrders.value = data.completedOrders
    activeVehicles.value = data.activeVehicles
    availableOperators.value = data.availableOperators
    monthlyRevenue.value = data.monthlyRevenue
    fuelTypeStats.value = data.fuelTypeStats
  } catch (err) {
    console.error('❌ Error cargando estadísticas:', err)
  }
}

onMounted(loadDashboardStats)

const LineChart = Line
const PieChart = Pie

const revenueChartData = computed(() => ({
  labels: monthlyRevenue.value.map(item => item.month),
  datasets: [
    {
      label: 'Ingresos',
      data: monthlyRevenue.value.map(item => item.revenue),
      borderColor: '#3b82f6',
      backgroundColor: 'rgba(59,130,246,0.2)',
      tension: 0.4,
      fill: true
    }
  ]
}))

const fuelChartData = computed(() => ({
  labels: fuelTypeStats.value.map(item => item.fuelType),
  datasets: [
    {
      label: 'Total por Combustible',
      data: fuelTypeStats.value.map(item => item.totalRevenue),
      backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444']
    }
  ]
}))

const exportToPDF = () => {
  const doc = new jsPDF()
  doc.text('Reporte de Analíticas', 14, 16)
  autoTable(doc, {
    startY: 22,
    head: [['Métrica', 'Valor']],
    body: [
      ['Ingresos Totales', `$${totalRevenue.value}`],
      ['Pedidos Completados', completedOrders.value],
      ['Vehículos Activos', activeVehicles.value],
      ['Operadores Disponibles', availableOperators.value]
    ]
  })
  doc.save('analiticas.pdf')
}

const exportToExcel = () => {
  const ws = XLSX.utils.json_to_sheet([
    {
      IngresosTotales: `$${totalRevenue.value}`,
      PedidosCompletados: completedOrders.value,
      VehiculosActivos: activeVehicles.value,
      OperadoresDisponibles: availableOperators.value
    }
  ])
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Analiticas')
  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
  const data = new Blob([excelBuffer], { type: 'application/octet-stream' })
  saveAs(data, 'analiticas.xlsx')
}
</script>