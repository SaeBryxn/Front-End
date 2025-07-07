<template>
  <div class="p-4 bg-white rounded shadow">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Gestión de Operadores</h1>
        <p class="text-gray-600">Administra los operadores del sistema</p>
      </div>
      <button
          class="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg transition"
          @click="showModal = true"
      >
        Nuevo Operador
      </button>
    </div>

    <!-- Stats -->
    <div class="bg-gray-50 rounded-lg p-6">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div class="bg-white p-4 rounded-lg border">
          <h3 class="text-sm font-medium text-gray-500">Total Operadores</h3>
          <p class="text-2xl font-bold text-gray-900">{{ total }}</p>
        </div>
        <div class="bg-white p-4 rounded-lg border">
          <h3 class="text-sm font-medium text-gray-500">Disponibles</h3>
          <p class="text-2xl font-bold text-primary-600">{{ disponibles }}</p>
        </div>
        <div class="bg-white p-4 rounded-lg border">
          <h3 class="text-sm font-medium text-gray-500">En Entrega</h3>
          <p class="text-2xl font-bold text-secondary-600">{{ enEntrega }}</p>
        </div>
      </div>

      <!-- Lista -->
      <div class="bg-white rounded-lg border">
        <div class="p-4 border-b">
          <h3 class="text-lg font-medium text-gray-900">Lista de Operadores</h3>
        </div>

        <div v-if="operators.length > 0" class="divide-y">
          <div v-for="operator in operators" :key="operator.id" class="p-4">
            <p class="text-lg font-semibold text-gray-800">
              {{ operator.firstName }} {{ operator.lastName }}
            </p>
            <p class="text-sm text-gray-600">
              Licencia: {{ operator.licenseNumber }} | Teléfono: {{ operator.phone || '—' }}
            </p>
            <p class="text-xs text-gray-400">Estado: {{ statusText(operator.status) }}</p>
          </div>
        </div>

        <div v-else-if="!loading" class="p-8 text-center text-gray-500">
          <p>No hay operadores registrados aún.</p>
        </div>

        <div v-else class="p-8 text-center text-gray-500">
          <p>Cargando operadores...</p>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div class="bg-white p-6 rounded-lg w-full max-w-md shadow">
        <h2 class="text-xl font-bold mb-4 text-gray-800">Nuevo Operador</h2>
        <form @submit.prevent="createOperator">
          <div class="space-y-4">
            <input v-model="form.firstName" type="text" placeholder="Nombre" class="w-full border rounded px-3 py-2" required />
            <input v-model="form.lastName" type="text" placeholder="Apellido" class="w-full border rounded px-3 py-2" required />
            <input v-model="form.licenseNumber" type="text" placeholder="Número de Licencia" class="w-full border rounded px-3 py-2" required />
            <input v-model="form.phone" type="text" placeholder="Teléfono" class="w-full border rounded px-3 py-2" />
            <input v-model="form.licenseExpiryDate" type="date" class="w-full border rounded px-3 py-2" required />
          </div>
          <div class="mt-6 flex justify-end space-x-2">
            <button type="button" class="px-4 py-2 bg-gray-300 rounded" @click="showModal = false">Cancelar</button>
            <button type="submit" class="px-4 py-2 bg-primary-600 text-white rounded">Guardar</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'
import { useToast } from 'vue-toastification'

const toast = useToast()
const operators = ref([])
const loading = ref(true)
const showModal = ref(false)

const form = ref({
  firstName: '',
  lastName: '',
  licenseNumber: '',
  phone: '',
  licenseExpiryDate: ''
})

const fetchOperators = async () => {
  try {
    const token = localStorage.getItem('token')
    const baseURL = import.meta.env.VITE_API_BASE_URL

    const response = await axios.get(`${baseURL}/operators`, {
      headers: { Authorization: `Bearer ${token}` }
    })

    operators.value = response.data
  } catch (error) {
    console.error('❌ Error al obtener operadores:', error)
  } finally {
    loading.value = false
  }
}

const createOperator = async () => {
  try {
    const token = localStorage.getItem('token')
    const baseURL = import.meta.env.VITE_API_BASE_URL

    // ✅ Asegurarse de enviar la fecha en formato UTC
    form.value.licenseExpiryDate = new Date(form.value.licenseExpiryDate).toISOString()

    await axios.post(`${baseURL}/operators`, form.value, {
      headers: { Authorization: `Bearer ${token}` }
    })

    toast.success('Operador creado correctamente.')
    showModal.value = false
    await fetchOperators()
  } catch (error) {
    console.error('❌ Error al crear operador:', error)
    toast.error(error.response?.data?.message || 'Error al crear operador.')
  }
}


onMounted(fetchOperators)

const total = computed(() => operators.value.length)
const disponibles = computed(() => operators.value.filter(op => op.status === 1).length)
const enEntrega = computed(() => operators.value.filter(op => op.status === 2).length)

const statusText = (status) => ({
  1: 'Disponible',
  2: 'En entrega',
  3: 'Inactivo'
}[status] || 'Desconocido')
</script>
