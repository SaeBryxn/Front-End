import { createApp } from 'vue'
import { createPinia } from 'pinia'
import Toast from 'vue-toastification'
import router from './router'
import App from './App.vue'

import './assets/styles/main.css'
import 'vue-toastification/dist/index.css'

// 👉 Importa el store
import { useAuthStore } from '@/stores/auth'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)

// ✅ Inicializa la autenticación antes de usar router
const authStore = useAuthStore()
authStore.initializeAuth()

app.use(router)

app.use(Toast, {
  position: 'top-right',
  timeout: 5000,
  closeOnClick: true,
  pauseOnFocusLoss: true,
  pauseOnHover: true,
  draggable: true,
  draggablePercent: 0.6,
  showCloseButtonOnHover: false,
  hideProgressBar: false,
  closeButton: 'button',
  icon: true,
  rtl: false
})

app.mount('#app')
