import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authService } from '@/services/auth'
import { useToast } from 'vue-toastification'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('token'))
  const refreshToken = ref(localStorage.getItem('refreshToken'))
  const user = ref(JSON.parse(localStorage.getItem('user') || 'null'))
  const toast = useToast()

  const isAuthenticated = computed(() => !!token.value)
  const userRole = computed(() => user.value?.role)

  const initializeAuth = () => {
    const storedToken = localStorage.getItem('token')
    const storedRefreshToken = localStorage.getItem('refreshToken')
    const storedUser = localStorage.getItem('user')

    if (storedToken && storedRefreshToken && storedUser) {
      token.value = storedToken
      refreshToken.value = storedRefreshToken
      user.value = JSON.parse(storedUser)
      localStorage.setItem('role', user.value?.role || '') // ✅
    }
  }

  const login = async (credentials) => {
    try {
      const response = await authService.login(credentials)

      token.value = response.accessToken
      refreshToken.value = response.refreshToken
      user.value = response.user

      localStorage.setItem('token', response.accessToken)
      localStorage.setItem('refreshToken', response.refreshToken)
      localStorage.setItem('user', JSON.stringify(response.user))
      localStorage.setItem('role', response.user.role) // ✅ NUEVO

      toast.success('¡Bienvenido!')
      return true
    } catch (error) {
      console.error('Login error:', error)
      return false
    }
  }

  const register = async (userData) => {
    try {
      const response = await authService.register(userData)

      token.value = response.accessToken
      refreshToken.value = response.refreshToken
      user.value = response.user

      localStorage.setItem('token', response.accessToken)
      localStorage.setItem('refreshToken', response.refreshToken)
      localStorage.setItem('user', JSON.stringify(response.user))
      localStorage.setItem('role', response.user.role) // ✅ NUEVO

      toast.success('¡Registro exitoso!')
      return true
    } catch (error) {
      console.error('Register error:', error)
      return false
    }
  }

  const refreshTokenAction = async () => {
    try {
      if (!refreshToken.value) return false

      const response = await authService.refreshToken(refreshToken.value)

      token.value = response.accessToken
      refreshToken.value = response.refreshToken
      user.value = response.user

      localStorage.setItem('token', response.accessToken)
      localStorage.setItem('refreshToken', response.refreshToken)
      localStorage.setItem('user', JSON.stringify(response.user))
      localStorage.setItem('role', response.user.role) // ✅ NUEVO

      return true
    } catch (error) {
      console.error('Token refresh error:', error)
      logout()
      return false
    }
  }

  const logout = async () => {
    try {
      if (refreshToken.value) {
        await authService.logout(refreshToken.value)
      }
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      token.value = null
      refreshToken.value = null
      user.value = null

      localStorage.removeItem('token')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('user')
      localStorage.removeItem('role') // ✅ NUEVO

      toast.info('Sesión cerrada')
    }
  }

  return {
    token,
    refreshToken,
    user,
    isAuthenticated,
    userRole,
    initializeAuth,
    login,
    register,
    refreshToken: refreshTokenAction,
    logout
  }
})
