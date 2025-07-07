<template>
  <div class="relative" ref="dropdownRef">
    <button
      @click="toggleDropdown"
      class="flex items-center space-x-2 p-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200"
    >
      <div class="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
        <span class="text-white text-sm font-medium">
          {{ userInitials }}
        </span>
      </div>
      <div class="hidden md:block text-left">
        <p class="text-sm font-medium">{{ user?.firstName }} {{ user?.lastName }}</p>
        <p class="text-xs text-gray-500">{{ user?.role }}</p>
      </div>
      <ChevronDownIcon class="h-4 w-4" />
    </button>

    <Transition
      enter-active-class="transition ease-out duration-200"
      enter-from-class="transform opacity-0 scale-95"
      enter-to-class="transform opacity-100 scale-100"
      leave-active-class="transition ease-in duration-75"
      leave-from-class="transform opacity-100 scale-100"
      leave-to-class="transform opacity-0 scale-95"
    >
      <div
        v-if="isOpen"
        class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 z-50"
      >
        <div class="py-1">
          <router-link
            v-if="user?.role === 'Cliente'"
            to="/client/profile"
            class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
            @click="isOpen = false"
          >
            <UserIcon class="inline h-4 w-4 mr-2" />
            Mi Perfil
          </router-link>
          
          <button
            @click="handleLogout"
            class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
          >
            <ArrowRightOnRectangleIcon class="inline h-4 w-4 mr-2" />
            Cerrar Sesión
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ChevronDownIcon, UserIcon, ArrowRightOnRectangleIcon } from '@heroicons/vue/24/outline'
import { useAuthStore } from '@/stores/auth'
import { onClickOutside } from '@vueuse/core'

const authStore = useAuthStore()
const router = useRouter()
const isOpen = ref(false)
const dropdownRef = ref(null)

const user = computed(() => authStore.user)
const userInitials = computed(() => {
  if (!user.value) return ''
  return `${user.value.firstName?.[0] || ''}${user.value.lastName?.[0] || ''}`.toUpperCase()
})

const toggleDropdown = () => {
  isOpen.value = !isOpen.value
}

const handleLogout = async () => {
  await authStore.logout()
  router.push('/login')
}

onClickOutside(dropdownRef, () => {
  isOpen.value = false
})
</script>