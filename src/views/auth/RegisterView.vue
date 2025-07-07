<template>
  <div class="card">
    <div class="text-center mb-6">
      <h2 class="text-2xl font-bold text-gray-900">Crear Cuenta</h2>
      <p class="mt-2 text-gray-600">Únete a FuelTrack</p>
    </div>

    <form @submit.prevent="handleRegister" class="space-y-6">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label for="firstName" class="block text-sm font-medium text-gray-700 mb-1">
            Nombre
          </label>
          <input
            id="firstName"
            v-model="form.firstName"
            type="text"
            required
            class="input-field"
            :class="{ 'border-red-300': $v.firstName.$error }"
            placeholder="Juan"
          />
          <p v-if="$v.firstName.$error" class="mt-1 text-sm text-red-600">
            {{ $v.firstName.$errors[0].$message }}
          </p>
        </div>

        <div>
          <label for="lastName" class="block text-sm font-medium text-gray-700 mb-1">
            Apellido
          </label>
          <input
            id="lastName"
            v-model="form.lastName"
            type="text"
            required
            class="input-field"
            :class="{ 'border-red-300': $v.lastName.$error }"
            placeholder="Pérez"
          />
          <p v-if="$v.lastName.$error" class="mt-1 text-sm text-red-600">
            {{ $v.lastName.$errors[0].$message }}
          </p>
        </div>
      </div>

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
        <label for="phone" class="block text-sm font-medium text-gray-700 mb-1">
          Teléfono (Opcional)
        </label>
        <input
          id="phone"
          v-model="form.phone"
          type="tel"
          class="input-field"
          placeholder="+1234567890"
        />
      </div>

      <div>
        <label for="role" class="block text-sm font-medium text-gray-700 mb-1">
          Tipo de Usuario
        </label>
        <select
          id="role"
          v-model="form.role"
          required
          class="input-field"
          :class="{ 'border-red-300': $v.role.$error }"
        >
          <option value="">Selecciona un tipo</option>
          <option value="Cliente">Cliente</option>
          <option value="Proveedor">Proveedor</option>
        </select>
        <p v-if="$v.role.$error" class="mt-1 text-sm text-red-600">
          {{ $v.role.$errors[0].$message }}
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
        <p class="mt-1 text-xs text-gray-500">
          Mínimo 6 caracteres, incluye mayúscula, minúscula, número y carácter especial
        </p>
      </div>

      <div>
        <label for="confirmPassword" class="block text-sm font-medium text-gray-700 mb-1">
          Confirmar Contraseña
        </label>
        <input
          id="confirmPassword"
          v-model="form.confirmPassword"
          type="password"
          required
          class="input-field"
          :class="{ 'border-red-300': $v.confirmPassword.$error }"
          placeholder="••••••••"
        />
        <p v-if="$v.confirmPassword.$error" class="mt-1 text-sm text-red-600">
          {{ $v.confirmPassword.$errors[0].$message }}
        </p>
      </div>

      <button
        type="submit"
        :disabled="loading"
        class="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <LoadingSpinner v-if="loading" size="sm" class="mr-2" />
        {{ loading ? 'Creando cuenta...' : 'Crear Cuenta' }}
      </button>
    </form>

    <div class="mt-6 text-center">
      <p class="text-sm text-gray-600">
        ¿Ya tienes una cuenta?
        <router-link to="/login" class="font-medium text-primary-600 hover:text-primary-500">
          Inicia sesión aquí
        </router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { EyeIcon, EyeSlashIcon } from '@heroicons/vue/24/outline'
import { useVuelidate } from '@vuelidate/core'
import { required, email, minLength, sameAs } from '@vuelidate/validators'
import { useAuthStore } from '@/stores/auth'
import LoadingSpinner from '@/components/LoadingSpinner.vue'

const router = useRouter()
const authStore = useAuthStore()

const loading = ref(false)
const showPassword = ref(false)

const form = reactive({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  role: '',
  password: '',
  confirmPassword: ''
})

const rules = {
  firstName: { required, minLength: minLength(2) },
  lastName: { required, minLength: minLength(2) },
  email: { required, email },
  role: { required },
  password: { required, minLength: minLength(6) },
  confirmPassword: { required, sameAs: sameAs(() => form.password) }
}

const $v = useVuelidate(rules, form)

const handleRegister = async () => {
  $v.value.$touch()
  if ($v.value.$invalid) return

  loading.value = true
  
  try {
    const success = await authStore.register({
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email,
      phone: form.phone || null,
      role: form.role === 'Cliente' ? 2 : 3, // Convert to enum value
      password: form.password
    })

    if (success) {
      // Redirect based on user role
      const roleRoutes = {
        'Cliente': '/dashboard',
        'Proveedor': '/dashboard'
      }
      router.push(roleRoutes[authStore.userRole] || '/dashboard')
    }
  } finally {
    loading.value = false
  }
}
</script>