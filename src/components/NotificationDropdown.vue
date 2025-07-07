<template>
  <div class="relative">
    <button
      @click="toggleDropdown"
      class="relative p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-full"
    >
      <BellIcon class="h-6 w-6" />
      <span
        v-if="unreadCount > 0"
        class="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center"
      >
        {{ unreadCount > 9 ? '9+' : unreadCount }}
      </span>
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
        class="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 z-50"
      >
        <div class="p-4 border-b border-gray-200">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-medium text-gray-900">Notificaciones</h3>
            <button
              v-if="unreadCount > 0"
              @click="markAllAsRead"
              class="text-sm text-primary-600 hover:text-primary-700"
            >
              Marcar todas como leídas
            </button>
          </div>
        </div>

        <div class="max-h-96 overflow-y-auto">
          <div v-if="loading" class="p-4">
            <div class="space-y-3">
              <div v-for="i in 3" :key="i" class="animate-pulse">
                <div class="flex space-x-3">
                  <div class="w-2 h-2 bg-gray-300 rounded-full mt-2"></div>
                  <div class="flex-1 space-y-2">
                    <div class="h-4 bg-gray-300 rounded w-3/4"></div>
                    <div class="h-3 bg-gray-300 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div v-else-if="notifications.length === 0" class="p-4 text-center text-gray-500">
            No tienes notificaciones
          </div>

          <div v-else class="divide-y divide-gray-200">
            <div
              v-for="notification in notifications.slice(0, 10)"
              :key="notification.id"
              @click="markAsRead(notification.id)"
              class="p-4 hover:bg-gray-50 cursor-pointer transition-colors duration-200"
              :class="{ 'bg-blue-50': !notification.isRead }"
            >
              <div class="flex items-start space-x-3">
                <div
                  class="w-2 h-2 rounded-full mt-2"
                  :class="notification.isRead ? 'bg-gray-300' : 'bg-primary-500'"
                ></div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-gray-900">
                    {{ notification.title }}
                  </p>
                  <p class="text-sm text-gray-500 mt-1">
                    {{ notification.message }}
                  </p>
                  <p class="text-xs text-gray-400 mt-1">
                    {{ formatDate(notification.createdAt) }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-if="notifications.length > 10" class="p-4 border-t border-gray-200">
          <button class="w-full text-center text-sm text-primary-600 hover:text-primary-700">
            Ver todas las notificaciones
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { BellIcon } from '@heroicons/vue/24/outline'
import { useNotificationsStore } from '@/stores/notifications'
import { onClickOutside } from '@vueuse/core'

const notificationsStore = useNotificationsStore()
const isOpen = ref(false)
const dropdownRef = ref(null)

const notifications = computed(() => notificationsStore.notifications)
const unreadCount = computed(() => notificationsStore.unreadCount)
const loading = computed(() => notificationsStore.loading)

const toggleDropdown = () => {
  isOpen.value = !isOpen.value
  if (isOpen.value && notifications.value.length === 0) {
    notificationsStore.fetchNotifications()
  }
}

const markAsRead = (notificationId) => {
  notificationsStore.markAsRead(notificationId)
}

const markAllAsRead = () => {
  notificationsStore.markAllAsRead()
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffInHours = Math.floor((now - date) / (1000 * 60 * 60))
  
  if (diffInHours < 1) {
    return 'Hace unos minutos'
  } else if (diffInHours < 24) {
    return `Hace ${diffInHours} hora${diffInHours > 1 ? 's' : ''}`
  } else {
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
}

onClickOutside(dropdownRef, () => {
  isOpen.value = false
})

onMounted(() => {
  notificationsStore.fetchUnreadCount()
})
</script>