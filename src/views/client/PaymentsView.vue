<template>
  <div class="max-w-5xl mx-auto space-y-8 p-4">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Mis Pagos</h1>
        <p class="text-gray-600">Historial, tarjetas y estado de tus pagos</p>
      </div>
      <button @click="showAddCard = true" class="btn-primary">Agregar Tarjeta</button>
    </div>

    <!-- Métodos de Pago -->
    <div class="card">
      <h2 class="text-lg font-semibold text-gray-900 mb-4">Mis Métodos de Pago</h2>
      <div v-if="paymentMethods.length" class="space-y-3">
        <div v-for="card in paymentMethods" :key="card.id" class="flex items-center justify-between p-3 border rounded-lg">
          <div>
            <p class="text-gray-800 font-medium">
              {{ card.cardType }} ****{{ card.lastFourDigits }}
              <span v-if="card.isDefault" class="text-xs text-primary-500 ml-2">(Principal)</span>
            </p>
            <p class="text-sm text-gray-500">Vence: {{ formatExpiry(card.expiryDate) }}</p>
          </div>
          <button @click="deleteCard(card.id)" class="text-red-500 text-sm hover:underline">Eliminar</button>
        </div>
      </div>
      <div v-else class="text-sm text-gray-500">No tienes métodos registrados.</div>
    </div>

    <!-- Estadísticas -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div class="card">
        <h3 class="text-sm font-medium text-gray-500">Total Gastado</h3>
        <p class="text-2xl font-bold text-gray-900">${{ totalGastado }}</p>
      </div>
      <div class="card">
        <h3 class="text-sm font-medium text-gray-500">Pagos Exitosos</h3>
        <p class="text-2xl font-bold text-green-600">{{ pagosExitosos }}</p>
      </div>
      <div class="card">
        <h3 class="text-sm font-medium text-gray-500">Último Pago</h3>
        <p class="text-2xl font-bold text-gray-900">{{ ultimoPago }}</p>
      </div>
    </div>

    <!-- Historial de Pagos -->
    <div class="card">
      <h2 class="text-lg font-semibold text-gray-900 mb-4">Historial de Pagos</h2>
      <div v-if="payments.length" class="divide-y">
        <div v-for="p in payments" :key="p.id" class="py-3">
          <p class="font-semibold text-gray-800">#{{ p.id }} - {{ p.amount.toFixed(2) }} USD</p>
          <p class="text-sm text-gray-600">
            {{ p.cardType }} ****{{ p.lastFourDigits }} • Estado: {{ statusText(p.status) }}
          </p>
          <p class="text-xs text-gray-400">Fecha: {{ formatDate(p.createdAt) }}</p>
        </div>
      </div>
      <div v-else class="text-sm text-gray-500">Aún no has realizado pagos.</div>
    </div>

    <!-- Órdenes pendientes -->
    <div class="card" v-if="pendingOrders.length">
      <h2 class="text-lg font-semibold text-gray-900 mb-4">Pagar Pedido</h2>
      <form @submit.prevent="handlePayment" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Selecciona un pedido</label>
          <select v-model="selectedOrderId" class="input-field" required>
            <option disabled value="">-- Selecciona un pedido --</option>
            <option v-for="order in pendingOrders" :value="order.id" :key="order.id">
              Pedido #{{ order.id }} - {{ order.totalAmount.toFixed(2) }} USD
            </option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Selecciona método de pago</label>
          <select v-model="selectedCardId" class="input-field" required>
            <option disabled value="">-- Selecciona tarjeta --</option>
            <option v-for="card in paymentMethods" :value="card.id" :key="card.id">
              {{ card.cardType }} ****{{ card.lastFourDigits }} {{ card.isDefault ? '(Principal)' : '' }}
            </option>
          </select>
        </div>

        <button class="btn-primary w-full" type="submit" :disabled="loadingPay">
          {{ loadingPay ? 'Procesando pago...' : 'Pagar Pedido' }}
        </button>
      </form>
    </div>

    <!-- Modal Nueva Tarjeta -->
    <div v-if="showAddCard" class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div class="bg-white rounded-2xl p-6 shadow-xl w-full max-w-lg relative">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-bold">Agregar Nueva Tarjeta</h2>
          <button @click="showAddCard = false" class="text-gray-500 hover:text-gray-700 text-2xl font-light">&times;</button>
        </div>

        <form @submit.prevent="handleAddCard" class="space-y-4">
          <!-- Titular -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Nombre del Titular</label>
            <input v-model="cardForm.cardHolderName" type="text" class="input-field w-full" placeholder="Ej: Bryan Torres" required />
          </div>

          <!-- Número de tarjeta -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Número de Tarjeta</label>
            <input v-model="cardForm.cardNumber" type="tel" inputmode="numeric" maxlength="19" class="input-field w-full" placeholder="4111 1111 1111 1111" required />
          </div>

          <!-- Fecha y CVV -->
          <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Mes</label>
              <input v-model.number="cardForm.expiryMonth" type="number" min="1" max="12" class="input-field w-full" placeholder="MM" required />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Año</label>
              <input v-model.number="cardForm.expiryYear" type="number" min="2024" max="2050" class="input-field w-full" placeholder="YYYY" required />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">CVV</label>
              <input v-model="cardForm.cvv" type="password" maxlength="4" class="input-field w-full" placeholder="Ej: 123" required />
            </div>
          </div>

          <!-- Checkbox -->
          <div class="flex items-center gap-2">
            <input v-model="cardForm.isDefault" type="checkbox" id="isDefault" class="accent-primary-600 h-4 w-4 rounded" />
            <label for="isDefault" class="text-sm text-gray-700">Usar como tarjeta principal</label>
          </div>

          <!-- Botón -->
          <button type="submit" class="btn-primary w-full flex justify-center items-center gap-2" :disabled="loadingAddCard">
            <span v-if="loadingAddCard" class="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></span>
            {{ loadingAddCard ? 'Guardando...' : 'Guardar Tarjeta' }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import axios from 'axios'
import { useToast } from 'vue-toastification'

const toast = useToast()

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'
const token = localStorage.getItem('token')
const headers = { Authorization: `Bearer ${token}` }

const paymentMethods = ref([])
const payments = ref([])
const pendingOrders = ref([])
const showAddCard = ref(false)
const loadingAddCard = ref(false)
const loadingPay = ref(false)

const selectedOrderId = ref('')
const selectedCardId = ref('')

const cardForm = reactive({
  cardHolderName: '',
  cardNumber: '',
  expiryMonth: null,
  expiryYear: null,
  cvv: '',
  isDefault: true
})

const fetchPaymentMethods = async () => {
  try {
    const res = await axios.get(`${baseURL}/payments/methods`, { headers })
    paymentMethods.value = res.data
  } catch {
    toast.error('Error al cargar métodos de pago')
  }
}

const fetchPayments = async () => {
  try {
    const res = await axios.get(`${baseURL}/payments`, { headers })
    payments.value = res.data
  } catch {
    toast.error('Error al cargar historial de pagos')
  }
}

const fetchPendingOrders = async () => {
  try {
    const res = await axios.get(`${baseURL}/orders`, { headers })
    pendingOrders.value = res.data.filter(o => o.status === 1)
  } catch {
    toast.error('Error al cargar pedidos')
  }
}

const deleteCard = async (id) => {
  if (!confirm('¿Eliminar esta tarjeta?')) return
  try {
    await axios.delete(`${baseURL}/payments/methods/${id}`, { headers })
    toast.success('Tarjeta eliminada')
    await fetchPaymentMethods()
  } catch {
    toast.error('No se pudo eliminar la tarjeta')
  }
}

const handleAddCard = async () => {
  loadingAddCard.value = true
  try {
    await axios.post(`${baseURL}/payments/methods`, { ...cardForm }, { headers })
    await fetchPaymentMethods()
    Object.assign(cardForm, {
      cardHolderName: '',
      cardNumber: '',
      expiryMonth: null,
      expiryYear: null,
      cvv: '',
      isDefault: true
    })
    toast.success('Tarjeta agregada correctamente')
    showAddCard.value = false
  } catch (err) {
    toast.error(err.response?.data?.message || 'Error al guardar tarjeta')
  } finally {
    loadingAddCard.value = false
  }
}

const handlePayment = async () => {
  if (!selectedOrderId.value || !selectedCardId.value) return
  loadingPay.value = true
  try {
    await axios.post(`${baseURL}/payments/process`, {
      orderId: selectedOrderId.value,
      paymentMethodId: selectedCardId.value
    }, { headers })
    await fetchPayments()
    await fetchPendingOrders()
    selectedOrderId.value = ''
    selectedCardId.value = ''
    toast.success('Pago procesado correctamente')
  } catch (err) {
    toast.error(err.response?.data?.message || 'Error al procesar el pago')
  } finally {
    loadingPay.value = false
  }
}

// Estadísticas
const totalGastado = computed(() =>
    payments.value.reduce((sum, p) => sum + (p.amount || 0), 0).toFixed(2)
)

const pagosExitosos = computed(() =>
    payments.value.filter(p => p.status === 2).length
)

const ultimoPago = computed(() => {
  if (payments.value.length === 0) return '-'
  const sorted = [...payments.value].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  return new Date(sorted[0].createdAt).toLocaleDateString()
})

// Formatos
const formatDate = (d) => {
  try {
    return new Date(d).toLocaleString('es-ES')
  } catch { return '-' }
}
const formatExpiry = (d) => {
  try {
    const date = new Date(d)
    return `${date.getMonth() + 1}/${date.getFullYear()}`
  } catch { return '-' }
}
const statusText = (s) => ({
  1: 'Pendiente', 2: 'Pagado', 3: 'Fallido', 4: 'Reembolsado'
}[s] || 'Desconocido')

onMounted(() => {
  fetchPayments()
  fetchPaymentMethods()
  fetchPendingOrders()
})
</script>