<template>
  <div class="max-w-2xl mx-auto space-y-6">
    <!-- Header -->
    <div>
      <h1 class="text-2xl font-bold text-gray-900">Crear Nuevo Pedido</h1>
      <p class="text-gray-600">Solicita combustible para tu ubicación</p>
    </div>

    <!-- Order Form -->
    <div class="card">
      <form @submit.prevent="handleSubmit" class="space-y-6">
        <!-- Fuel Type -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-3">Tipo de Combustible</label>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div
                v-for="fuel in fuelTypes"
                :key="fuel.value"
                @click="form.fuelType = fuel.value"
                class="relative cursor-pointer rounded-lg border p-4 transition-colors duration-200"
                :class="form.fuelType === fuel.value ? 'border-primary-500 bg-primary-50' : 'border-gray-300 hover:border-gray-400'"
            >
              <div class="flex items-center">
                <input
                    :value="fuel.value"
                    v-model="form.fuelType"
                    type="radio"
                    class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                />
                <div class="ml-3">
                  <p class="text-sm font-medium text-gray-900">{{ fuel.label }}</p>
                  <p class="text-sm text-gray-500">${{ fuel.price }}/L</p>
                </div>
              </div>
            </div>
          </div>
          <p v-if="$v.fuelType.$error" class="mt-1 text-sm text-red-600">
            {{ $v.fuelType.$errors[0].$message }}
          </p>
        </div>

        <!-- Quantity -->
        <div>
          <label for="quantity" class="block text-sm font-medium text-gray-700 mb-1">Cantidad (Litros)</label>
          <input
              id="quantity"
              v-model.number="form.quantity"
              type="number"
              min="1"
              max="50000"
              step="0.1"
              required
              class="input-field"
              :class="{ 'border-red-300': $v.quantity.$error }"
              placeholder="100"
          />
          <p v-if="$v.quantity.$error" class="mt-1 text-sm text-red-600">
            {{ $v.quantity.$errors[0].$message }}
          </p>
        </div>

        <!-- Delivery Address -->
        <div>
          <label for="address" class="block text-sm font-medium text-gray-700 mb-1">Dirección de Entrega</label>
          <textarea
              id="address"
              v-model="form.deliveryAddress"
              rows="3"
              required
              class="input-field"
              :class="{ 'border-red-300': $v.deliveryAddress.$error }"
              placeholder="Ingresa la dirección completa"
          ></textarea>
          <p v-if="$v.deliveryAddress.$error" class="mt-1 text-sm text-red-600">
            {{ $v.deliveryAddress.$errors[0].$message }}
          </p>
        </div>

        <!-- Location -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Ubicación GPS (opcional)</label>
          <div class="grid grid-cols-2 gap-4">
            <input v-model.number="form.deliveryLatitude" type="number" step="any" class="input-field" placeholder="Latitud" />
            <input v-model.number="form.deliveryLongitude" type="number" step="any" class="input-field" placeholder="Longitud" />
          </div>
        </div>

        <!-- Summary -->
        <div v-if="form.fuelType && form.quantity" class="bg-gray-50 rounded-lg p-4">
          <h3 class="text-sm font-medium text-gray-900 mb-2">Resumen del Pedido</h3>
          <div class="text-sm space-y-1">
            <div class="flex justify-between"><span>Combustible:</span><span>{{ getFuelLabel(form.fuelType) }}</span></div>
            <div class="flex justify-between"><span>Cantidad:</span><span>{{ form.quantity }} L</span></div>
            <div class="flex justify-between"><span>Precio por litro:</span><span>${{ getFuelPrice(form.fuelType) }}</span></div>
            <div class="border-t pt-2 mt-2 flex justify-between font-semibold">
              <span>Total:</span><span>${{ formatCurrency(totalAmount) }}</span>
            </div>
          </div>
        </div>

        <!-- Submit Button -->
        <div class="flex space-x-4">
          <button type="submit" class="btn-primary flex-1" :disabled="loading || $v.$invalid">
            {{ loading ? 'Creando...' : 'Crear Pedido' }}
          </button>
          <router-link to="/client/orders" class="btn-outline">Cancelar</router-link>
        </div>
      </form>
    </div>

    <!-- Payment Modal -->
    <div v-if="showPaymentModal" class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div class="card w-full max-w-md">
        <h2 class="text-lg font-semibold mb-4">Pagar Pedido</h2>
        <div v-if="paymentMethods.length === 0" class="text-sm text-gray-600">No tienes tarjetas registradas.</div>
        <div v-else class="space-y-3">
          <div v-for="method in paymentMethods" :key="method.id" class="flex items-center justify-between border rounded p-3">
            <div>
              <p class="text-sm font-medium">**** {{ method.lastFourDigits }} - {{ method.cardType }}</p>
              <p class="text-xs text-gray-500">Vence: {{ formatDate(method.expiryDate) }}</p>
            </div>
            <button @click="payOrder(method.id)" class="btn-primary">Pagar</button>
          </div>
        </div>
        <button class="btn-outline w-full mt-4" @click="showPaymentModal = false">Cerrar</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useVuelidate } from '@vuelidate/core'
import { required, minValue, maxValue, maxLength } from '@vuelidate/validators'
import { useOrdersStore } from '@/stores/orders'
import { useToast } from 'vue-toastification'
import api from '@/services/api'

const router = useRouter()
const toast = useToast()
const ordersStore = useOrdersStore()

const loading = ref(false)
const showPaymentModal = ref(false)
const createdOrderId = ref(null)
const paymentMethods = ref([])

const form = reactive({
  fuelType: '',
  quantity: null,
  deliveryAddress: '',
  deliveryLatitude: null,
  deliveryLongitude: null
})

const rules = {
  fuelType: { required },
  quantity: { required, minValue: minValue(1), maxValue: maxValue(50000) },
  deliveryAddress: { required, maxLength: maxLength(500) }
}

const $v = useVuelidate(rules, form)

const fuelTypes = [
  { value: 1, label: 'Gasolina', price: '1.25' },
  { value: 2, label: 'Diesel', price: '1.15' },
  { value: 3, label: 'Premium', price: '1.45' }
]

const getFuelLabel = val => fuelTypes.find(f => f.value === val)?.label || ''
const getFuelPrice = val => fuelTypes.find(f => f.value === val)?.price || '0'
const formatCurrency = amt => new Intl.NumberFormat('es-ES', { minimumFractionDigits: 2 }).format(amt)
const formatDate = date => new Date(date).toLocaleDateString('es-ES')

const totalAmount = computed(() => {
  if (!form.fuelType || !form.quantity) return 0
  return parseFloat(getFuelPrice(form.fuelType)) * form.quantity
})

const handleSubmit = async () => {
  $v.value.$touch()
  if ($v.value.$invalid) return

  loading.value = true
  try {
    const orderData = { ...form }
    const order = await ordersStore.createOrder(orderData)
    createdOrderId.value = order.id
    toast.success('Pedido creado correctamente')
    await loadPaymentMethods()
    showPaymentModal.value = true
  } catch (err) {
    toast.error('Error al crear pedido')
  } finally {
    loading.value = false
  }
}

const loadPaymentMethods = async () => {
  try {
    const res = await api.get('/payments/methods')
    paymentMethods.value = res.data
  } catch (e) {
    toast.error('No se pudieron cargar los métodos de pago')
  }
}

const payOrder = async (methodId) => {
  try {
    await api.post('/payments/process', {
      orderId: createdOrderId.value,
      paymentMethodId: methodId
    })
    toast.success('Pago realizado con éxito')
    showPaymentModal.value = false
    router.push('/client/orders')
  } catch (e) {
    toast.error('Error al procesar el pago')
  }
}
</script>