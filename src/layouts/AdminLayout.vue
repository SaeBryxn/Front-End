<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Sidebar -->
    <div class="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0" :class="{ '-translate-x-full': !sidebarOpen }">
      <div class="flex items-center justify-center h-16 bg-primary-600">
        <h1 class="text-xl font-bold text-white">FuelTrack Admin</h1>
      </div>
      
      <nav class="mt-8">
        <div class="px-4 space-y-2">
          <router-link
            v-for="item in navigation"
            :key="item.name"
            :to="item.href"
            class="group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors duration-200"
            :class="$route.path === item.href ? 'bg-primary-100 text-primary-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'"
          >
            <component :is="item.icon" class="mr-3 h-5 w-5" />
            {{ item.name }}
          </router-link>
        </div>
      </nav>
    </div>

    <!-- Main content -->
    <div class="lg:pl-64">
      <!-- Top bar -->
      <div class="sticky top-0 z-40 bg-white shadow-sm border-b border-gray-200">
        <div class="flex items-center justify-between h-16 px-4">
          <button
            @click="sidebarOpen = !sidebarOpen"
            class="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
          >
            <Bars3Icon class="h-6 w-6" />
          </button>
          
          <div class="flex items-center space-x-4">
            <!-- Notifications -->
            <NotificationDropdown />
            
            <!-- User menu -->
            <UserDropdown />
          </div>
        </div>
      </div>

      <!-- Page content -->
      <main class="p-6">
        <router-view />
      </main>
    </div>

    <!-- Mobile sidebar overlay -->
    <div
      v-if="sidebarOpen"
      class="fixed inset-0 z-40 lg:hidden"
      @click="sidebarOpen = false"
    >
      <div class="absolute inset-0 bg-gray-600 opacity-75"></div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import {
  Bars3Icon,
  HomeIcon,
  UsersIcon,
  TruckIcon,
  UserGroupIcon,
  ClipboardDocumentListIcon,
  ChartBarIcon
} from '@heroicons/vue/24/outline'
import NotificationDropdown from '@/components/NotificationDropdown.vue'
import UserDropdown from '@/components/UserDropdown.vue'

const sidebarOpen = ref(false)

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'Usuarios', href: '/admin/users', icon: UsersIcon },
  { name: 'Pedidos', href: '/admin/orders', icon: ClipboardDocumentListIcon },
  { name: 'Vehículos', href: '/admin/vehicles', icon: TruckIcon },
  { name: 'Operadores', href: '/admin/operators', icon: UserGroupIcon },
  { name: 'Analíticas', href: '/admin/analytics', icon: ChartBarIcon }
]
</script>