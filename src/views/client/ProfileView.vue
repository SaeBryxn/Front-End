<template>
  <div class="p-4 bg-white rounded shadow">
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900">Mi Perfil</h1>
      <p class="text-gray-600">Gestiona tu información personal y seguridad</p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Información Personal -->
      <div class="lg:col-span-2">
        <div class="card">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Información Personal</h3>
          <form @submit.prevent="saveProfile" class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium mb-1">Nombre</label>
                <input v-model="form.firstName" type="text" required class="input-field" />
              </div>
              <div>
                <label class="block text-sm font-medium mb-1">Apellido</label>
                <input v-model="form.lastName" type="text" required class="input-field" />
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">Teléfono</label>
              <input v-model="form.phone" type="tel" class="input-field" />
            </div>
            <div class="text-sm text-gray-500">
              Email: <span class="font-medium text-gray-700">{{ form.email }}</span>
            </div>
            <div class="flex justify-end">
              <button type="submit" :disabled="saving" class="btn-primary">
                {{ saving ? 'Guardando...' : 'Guardar Cambios' }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Estadísticas + Seguridad -->
      <div class="space-y-6">
        <div class="card">
          <h3 class="text-lg font-medium mb-4">Estadísticas</h3>
          <ul class="text-sm space-y-2">
            <li class="flex justify-between">
              <span>Pedidos realizados</span>
              <span class="font-medium text-gray-800">{{ stats.totalOrders }}</span>
            </li>
            <li class="flex justify-between">
              <span>Total gastado</span>
              <span class="font-medium text-gray-800">{{ formatCurrency(stats.totalSpent) }}</span>
            </li>
            <li class="flex justify-between">
              <span>Miembro desde</span>
              <span class="font-medium text-gray-800">{{ stats.memberSince }}</span>
            </li>
          </ul>
        </div>

        <div class="card">
          <h3 class="text-lg font-medium mb-4">Cambiar Contraseña</h3>
          <form @submit.prevent="changePassword" class="space-y-4">
            <div>
              <label class="block text-sm font-medium mb-1">Contraseña Actual</label>
              <input v-model="passwords.current" type="password" required class="input-field" />
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">Nueva Contraseña</label>
              <input v-model="passwords.new" type="password" required class="input-field" />
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">Confirmar Nueva Contraseña</label>
              <input v-model="passwords.confirm" type="password" required class="input-field" />
            </div>
            <button type="submit" class="btn-secondary w-full">Actualizar Contraseña</button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useToast } from 'vue-toastification'

const toast = useToast()
const form = ref({
  firstName: '',
  lastName: '',
  email: '',
  phone: ''
})

const stats = ref({
  totalOrders: 0,
  totalSpent: 0,
  memberSince: '-'
})

const passwords = ref({
  current: '',
  new: '',
  confirm: ''
})

const saving = ref(false)

const formatCurrency = (amount) =>
    new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(amount)

onMounted(async () => {
  try {
    const token = localStorage.getItem('token')
    const userRes = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/Users/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    })

    const statsRes = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/Analytics/client`, {
      headers: { Authorization: `Bearer ${token}` }
    })

    form.value = {
      firstName: userRes.data.firstName,
      lastName: userRes.data.lastName,
      email: userRes.data.email,
      phone: userRes.data.phone || ''
    }

    stats.value = {
      totalOrders: statsRes.data.totalOrders,
      totalSpent: statsRes.data.totalRevenue,
      memberSince: new Date(userRes.data.createdAt).toLocaleDateString()
    }
  } catch (error) {
    console.error('❌ Error al cargar perfil:', error)
    toast.error('Error al cargar perfil')
  }
})

async function saveProfile() {
  saving.value = true
  try {
    const token = localStorage.getItem('token')
    await axios.put(`${import.meta.env.VITE_API_BASE_URL}/Users/profile`, {
      firstName: form.value.firstName,
      lastName: form.value.lastName,
      phone: form.value.phone
    }, {
      headers: { Authorization: `Bearer ${token}` }
    })
    toast.success('Perfil actualizado correctamente')
  } catch (error) {
    console.error('❌ Error al guardar perfil:', error)
    toast.error('Error al actualizar perfil')
  } finally {
    saving.value = false
  }
}

async function changePassword() {
  if (passwords.value.new !== passwords.value.confirm) {
    toast.warning('Las contraseñas no coinciden')
    return
  }

  try {
    const token = localStorage.getItem('token')
    await axios.post(`${import.meta.env.VITE_API_BASE_URL}/Users/change-password`, {
      currentPassword: passwords.value.current,
      newPassword: passwords.value.new
    }, {
      headers: { Authorization: `Bearer ${token}` }
    })

    toast.success('Contraseña actualizada')
    passwords.value.current = passwords.value.new = passwords.value.confirm = ''
  } catch (error) {
    console.error('❌ Error al cambiar contraseña:', error)
    toast.error('No se pudo cambiar la contraseña')
  }
}
</script>
