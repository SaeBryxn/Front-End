<template>
  <div class="card">
    <div class="text-center mb-6">
      <h2 class="text-2xl font-bold text-gray-900">Iniciar Sesión</h2>
      <p class="mt-2 text-gray-600">Accede a tu cuenta de FuelTrack</p>
    </div>

    <form @submit.prevent="handleLogin" class="space-y-6">
      <div>
        <label for="email" class="block text-sm font-medium text-gray-700 mb-1">
          Correo Electrónico
        </label>
        <input
            id="email"
            v-model="form.email"
            type="email"
            required
            class="input-field"
            :class="{ 'border-red-300': $v.email.$error }"
            placeholder="tu@email.com"
        />
        <p v-if="$v.email.$error" class="mt-1 text-sm text-red-600">
          {{ $v.email.$errors[0].$message }}
        </p>
      </div>

      <div>
        <label for="password" class="block text-sm font-medium text-gray-700 mb-1">
          Contraseña
        </label>
        <div class="relative">
          <input
              id="password"
              v-model="form.password"
              :type="showPassword ? 'text' : 'password'"
              required
              class="input-field pr-10"
              :class="{ 'border-red-300': $v.password.$error }"
              placeholder="••••••••"
          />
          <button
              type="button"
              @click="showPassword = !showPassword"
              class="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            <EyeIcon v-if="!showPassword" class="h-5 w-5 text-gray-400" />
            <EyeSlashIcon v-else class="h-5 w-5 text-gray-400" />
          </button>
        </div>
        <p v-if="$v.password.$error" class="mt-1 text-sm text-red-600">
          {{ $v.password.$errors[0].$message }}
        </p>
      </div>

      <div class="flex items-center justify-between">
        <div class="flex items-center">
          <input
              id="remember"
              v-model="form.remember"
              type="checkbox"
              class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
          />
          <label for="remember" class="ml-2 block text-sm text-gray-700">
            Recordarme
          </label>
        </div>
      </div>

      <button
          type="submit"
          :disabled="loading"
          class="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <LoadingSpinner v-if="loading" size="sm" class="mr-2" />
        {{ loading ? 'Iniciando sesión...' : 'Iniciar Sesión' }}
      </button>
    </form>

    <div class="mt-6 text-center">
      <p class="text-sm text-gray-600">
        ¿No tienes una cuenta?
        <router-link to="/auth/register" class="font-medium text-primary-600 hover:text-primary-500">
          Regístrate aquí
        </router-link>
      </p>
    </div>

    <!-- Demo credentials -->
    <div class="mt-6 p-4 bg-gray-50 rounded-lg">
      <h3 class="text-sm font-medium text-gray-700 mb-2">Credenciales de prueba:</h3>
      <div class="space-y-1 text-xs text-gray-600">
        <p><strong>Admin:</strong> admin@fueltrack.com / Admin123!</p>
        <p><strong>Cliente:</strong> cliente@fueltrack.com / Cliente123!</p>
        <p><strong>Proveedor:</strong> proveedor@fueltrack.com / Proveedor123!</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { EyeIcon, EyeSlashIcon } from '@heroicons/vue/24/outline'
import { useVuelidate } from '@vuelidate/core'
import { required, email, minLength } from '@vuelidate/validators'
import { useAuthStore } from '@/stores/auth'
import LoadingSpinner from '@/components/LoadingSpinner.vue'

const router = useRouter()
const authStore = useAuthStore()

const loading = ref(false)
const showPassword = ref(false)

const form = reactive({
  email: '',
  password: '',
  remember: false
})

const rules = {
  email: { required, email },
  password: { required, minLength: minLength(6) }
}

const $v = useVuelidate(rules, form)

const handleLogin = async () => {
  $v.value.$touch()
  if ($v.value.$invalid) return

  loading.value = true

  try {
    const success = await authStore.login({
      email: form.email,
      password: form.password
    })

    if (success) {
      await nextTick() // 🛠️ espera a que Pinia reactive los datos

      const roleRoutes = {
        Admin: '/admin/dashboard',
        Cliente: '/client/dashboard',
        Proveedor: '/provider/dashboard'
      }

      router.push(roleRoutes[authStore.userRole] || '/auth/login')
    }
  } finally {
    loading.value = false
  }
}
</script>
