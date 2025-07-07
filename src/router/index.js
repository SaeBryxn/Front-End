import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

// Layouts
import AuthLayout from '@/layouts/AuthLayout.vue'
import AdminLayout from '@/layouts/AdminLayout.vue'
import ClientLayout from '@/layouts/ClientLayout.vue'
import ProviderLayout from '@/layouts/ProviderLayout.vue'

// Auth Views
import LoginView from '@/views/auth/LoginView.vue'
import RegisterView from '@/views/auth/RegisterView.vue'

// Admin Views
import AdminDashboard from '@/views/admin/DashboardView.vue'
import AdminUsers from '@/views/admin/UsersView.vue'
import AdminOrders from '@/views/admin/OrdersView.vue'
import AdminVehicles from '@/views/admin/VehiclesView.vue'
import AdminOperators from '@/views/admin/OperatorsView.vue'
import AdminAnalytics from '@/views/admin/AnalyticsView.vue'

// Client Views
import ClientDashboard from '@/views/client/DashboardView.vue'
import ClientOrders from '@/views/client/OrdersView.vue'
import ClientCreateOrder from '@/views/client/CreateOrderView.vue'
import ClientPayments from '@/views/client/PaymentsView.vue'
import ClientProfile from '@/views/client/ProfileView.vue'

// Provider Views
import ProviderDashboard from '@/views/provider/DashboardView.vue'
import ProviderOrders from '@/views/provider/OrdersView.vue'
import ProviderVehicles from '@/views/provider/VehiclesView.vue'
import ProviderOperators from '@/views/provider/OperatorsView.vue'

const routes = [
  {
    path: '/',
    beforeEnter: (to, from, next) => {
      const auth = useAuthStore()
      if (!auth.isAuthenticated) return next('/auth/login')

      const roleRoutes = {
        Admin: '/admin/dashboard',
        Cliente: '/client/dashboard',
        Proveedor: '/provider/dashboard'
      }
      return next(roleRoutes[auth.userRole] || '/auth/login')
    }
  },
  {
    path: '/auth',
    component: AuthLayout,
    children: [
      {
        path: 'login',
        name: 'Login',
        component: LoginView,
        meta: { requiresGuest: true }
      },
      {
        path: 'register',
        name: 'Register',
        component: RegisterView,
        meta: { requiresGuest: true }
      }
    ]
  },
  {
    path: '/admin',
    component: AdminLayout,
    meta: { requiresAuth: true, role: 'Admin' },
    children: [
      { path: 'dashboard', name: 'AdminDashboard', component: AdminDashboard },
      { path: 'users', name: 'AdminUsers', component: AdminUsers },
      { path: 'orders', name: 'AdminOrders', component: AdminOrders },
      { path: 'vehicles', name: 'AdminVehicles', component: AdminVehicles },
      { path: 'operators', name: 'AdminOperators', component: AdminOperators },
      { path: 'analytics', name: 'AdminAnalytics', component: AdminAnalytics }
    ]
  },
  {
    path: '/client',
    component: ClientLayout,
    meta: { requiresAuth: true, role: 'Cliente' },
    children: [
      { path: 'dashboard', name: 'ClientDashboard', component: ClientDashboard },
      { path: 'orders', name: 'ClientOrders', component: ClientOrders },
      { path: 'create-order', name: 'ClientCreateOrder', component: ClientCreateOrder },
      { path: 'payments', name: 'ClientPayments', component: ClientPayments },
      { path: 'profile', name: 'ClientProfile', component: ClientProfile }
    ]
  },
  {
    path: '/provider',
    component: ProviderLayout,
    meta: { requiresAuth: true, role: 'Proveedor' },
    children: [
      { path: 'dashboard', name: 'ProviderDashboard', component: ProviderDashboard },
      { path: 'orders', name: 'ProviderOrders', component: ProviderOrders },
      { path: 'vehicles', name: 'ProviderVehicles', component: ProviderVehicles },
      { path: 'operators', name: 'ProviderOperators', component: ProviderOperators }
    ]
  },
  {
    path: '/:catchAll(.*)',
    redirect: '/auth/login'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 🔒 Global Navigation Guard
router.beforeEach((to, from, next) => {
  const auth = useAuthStore()

  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return next('/auth/login')
  }

  if (to.meta.requiresGuest && auth.isAuthenticated) {
    const roleRoutes = {
      Admin: '/admin/dashboard',
      Cliente: '/client/dashboard',
      Proveedor: '/provider/dashboard'
    }
    return next(roleRoutes[auth.userRole] || '/auth/login')
  }

  if (to.meta.role && to.meta.role !== auth.userRole) {
    const roleRoutes = {
      Admin: '/admin/dashboard',
      Cliente: '/client/dashboard',
      Proveedor: '/provider/dashboard'
    }
    return next(roleRoutes[auth.userRole] || '/auth/login')
  }

  return next()
})

export default router
