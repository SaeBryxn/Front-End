import axios from 'axios'
import { useToast } from 'vue-toastification'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
})

// ✅ Interceptor de request para agregar el token desde localStorage
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token')
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error) => Promise.reject(error)
)

// ✅ Interceptor de respuesta para manejar errores
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const toast = useToast()

        if (error.response?.status === 401) {
            localStorage.removeItem('token')
            localStorage.removeItem('user')
            localStorage.removeItem('refreshToken')
            window.location.href = '/login'
        }

        if (error.response?.data?.message) {
            toast.error(error.response.data.message)
        } else if (error.message) {
            toast.error(error.message)
        }

        return Promise.reject(error)
    }
)

export default api
