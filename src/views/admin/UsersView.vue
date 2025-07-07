<template>
  <div class="p-4 bg-white rounded shadow">
    <!-- Encabezado -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Gestión de Usuarios</h1>
        <p class="text-gray-600">Administra todos los usuarios del sistema</p>
      </div>
      <button
          @click="showModal = true"
          class="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg"
      >
        Nuevo Usuario
      </button>
    </div>

    <!-- Estadísticas -->
    <div class="bg-gray-50 rounded-lg p-6">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div class="bg-white p-4 rounded-lg border">
          <h3 class="text-sm text-gray-500">Total Usuarios</h3>
          <p class="text-2xl font-bold text-gray-900">{{ totalUsers }}</p>
        </div>
        <div class="bg-white p-4 rounded-lg border">
          <h3 class="text-sm text-gray-500">Usuarios Activos</h3>
          <p class="text-2xl font-bold text-green-600">{{ activeUsers }}</p>
        </div>
        <div class="bg-white p-4 rounded-lg border">
          <h3 class="text-sm text-gray-500">Nuevos este mes</h3>
          <p class="text-2xl font-bold text-primary-600">{{ newUsersThisMonth }}</p>
        </div>
      </div>

      <!-- Lista de Usuarios -->
      <div class="bg-white rounded-lg border">
        <div class="p-4 border-b">
          <h3 class="text-lg font-medium text-gray-900">Lista de Usuarios</h3>
        </div>

        <div v-if="users.length" class="divide-y">
          <div
              v-for="user in users"
              :key="user.id"
              class="p-4 flex items-center justify-between"
          >
            <div>
              <p class="text-lg font-semibold text-gray-800">
                {{ user.firstName }} {{ user.lastName }}
              </p>
              <p class="text-sm text-gray-600">{{ user.email }} - Rol: {{ getRole(user.role) }}</p>
              <p class="text-xs text-gray-400">
                Estado:
                <span :class="user.isActive ? 'text-green-600' : 'text-red-600'">
                  {{ user.isActive ? 'Activo' : 'Inactivo' }}
                </span>
              </p>
            </div>
            <button
                @click="toggleUserStatus(user)"
                class="px-4 py-1 rounded-lg text-white transition"
                :class="user.isActive ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'"
            >
              {{ user.isActive ? 'Desactivar' : 'Activar' }}
            </button>
          </div>
        </div>

        <div v-else class="p-8 text-center text-gray-500">
          <p>No hay usuarios registrados.</p>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow p-6 w-full max-w-md">
        <h2 class="text-xl font-bold mb-4">Crear Nuevo Usuario</h2>

        <div class="space-y-3">
          <input v-model="newUser.firstName" type="text" placeholder="Nombre" class="w-full border rounded px-3 py-2" />
          <p v-if="errors.firstName" class="text-sm text-red-600">{{ errors.firstName }}</p>

          <input v-model="newUser.lastName" type="text" placeholder="Apellido" class="w-full border rounded px-3 py-2" />
          <p v-if="errors.lastName" class="text-sm text-red-600">{{ errors.lastName }}</p>

          <input v-model="newUser.email" type="email" placeholder="Correo electrónico" class="w-full border rounded px-3 py-2" />
          <p v-if="errors.email" class="text-sm text-red-600">{{ errors.email }}</p>

          <input v-model="newUser.phone" type="text" placeholder="Teléfono" class="w-full border rounded px-3 py-2" />

          <input v-model="newUser.password" type="password" placeholder="Contraseña" class="w-full border rounded px-3 py-2" />
          <p v-if="errors.password" class="text-sm text-red-600">{{ errors.password }}</p>

          <select v-model="newUser.role" class="w-full border rounded px-3 py-2">
            <option disabled value="">Seleccione un rol</option>
            <option value="1">Admin</option>
            <option value="2">Proveedor</option>
            <option value="3">Cliente</option>
          </select>
          <p v-if="errors.role" class="text-sm text-red-600">{{ errors.role }}</p>
        </div>

        <div class="flex justify-end space-x-2 mt-6">
          <button @click="closeModal" class="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">Cancelar</button>
          <button
              @click="createUser"
              :disabled="hasErrors"
              class="px-4 py-2 rounded text-white"
              :class="hasErrors ? 'bg-gray-400 cursor-not-allowed' : 'bg-primary-500 hover:bg-primary-600'"
          >
            Crear
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import axios from 'axios'
import { useToast } from 'vue-toastification'

const users = ref([])
const totalUsers = ref(0)
const activeUsers = ref(0)
const newUsersThisMonth = ref(0)

const showModal = ref(false)
const toast = useToast()

const newUser = reactive({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  password: '',
  role: ''
})

const errors = reactive({
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  role: ''
})

const validateForm = () => {
  errors.firstName = !newUser.firstName ? 'Nombre requerido' : ''
  errors.lastName = !newUser.lastName ? 'Apellido requerido' : ''
  errors.email = !newUser.email
      ? 'Email requerido'
      : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newUser.email)
          ? 'Email inválido'
          : ''
  errors.password = !newUser.password ? 'Contraseña requerida' : ''
  errors.role = !newUser.role ? 'Rol requerido' : ''
}

const hasErrors = computed(() =>
    Object.values(errors).some((e) => e !== '')
)

const getRole = (role) => {
  return { 1: 'Admin', 2: 'Proveedor', 3: 'Cliente' }[role] || 'Desconocido'
}

const fetchUsers = async () => {
  try {
    const token = localStorage.getItem('token')
    const baseURL = import.meta.env.VITE_API_BASE_URL
    const response = await axios.get(`${baseURL}/Users`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    users.value = response.data
    totalUsers.value = users.value.length
    activeUsers.value = users.value.filter(u => u.isActive).length
    const currentMonth = new Date().getMonth()
    newUsersThisMonth.value = users.value.filter(u => new Date(u.createdAt).getMonth() === currentMonth).length
  } catch (error) {
    console.error('Error al cargar usuarios:', error)
    toast.error('Error al cargar usuarios')
  }
}

const toggleUserStatus = async (user) => {
  try {
    const token = localStorage.getItem('token')
    const baseURL = import.meta.env.VITE_API_BASE_URL
    await axios.patch(`${baseURL}/Users/${user.id}/toggle-status`, null, {
      headers: { Authorization: `Bearer ${token}` }
    })
    user.isActive = !user.isActive
    activeUsers.value = users.value.filter(u => u.isActive).length
  } catch (error) {
    console.error('Error al actualizar estado:', error)
    toast.error('Error al actualizar estado del usuario')
  }
}

const closeModal = () => {
  showModal.value = false
  Object.assign(newUser, {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    role: ''
  })
  Object.keys(errors).forEach(k => (errors[k] = ''))
}

const createUser = async () => {
  validateForm()
  if (hasErrors.value) return

  try {
    const baseURL = import.meta.env.VITE_API_BASE_URL
    await axios.post(`${baseURL}/auth/register`, {
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      email: newUser.email,
      phone: newUser.phone,
      password: newUser.password,
      role: parseInt(newUser.role)
    })
    toast.success('Usuario creado exitosamente')
    closeModal()
    await fetchUsers()
  } catch (error) {
    console.error('Error al crear usuario:', error)
    toast.error('Error al crear usuario')
  }
}

onMounted(fetchUsers)
</script>

<style scoped>
/* Estilos adicionales si los necesitas */
</style>
