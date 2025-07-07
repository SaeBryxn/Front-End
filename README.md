# FuelTrack Frontend

Sistema completo de gestión de pedidos de combustible desarrollado en Vue 3 con Composition API, Vue Router, Pinia y TailwindCSS.

## 🚀 Características

- **Vue 3 + Composition API**: Arquitectura moderna y reactiva
- **Autenticación JWT**: Con refresh tokens y gestión de sesión
- **Autorización por Roles**: Admin, Cliente, Proveedor
- **Responsive Design**: Optimizado para desktop y móvil
- **Estado Global**: Gestión con Pinia
- **Routing Protegido**: Guards por rol con Vue Router
- **UI/UX Moderna**: TailwindCSS con paleta de colores personalizada
- **Validaciones**: Vuelidate para formularios
- **Notificaciones**: Vue Toastification integrado

## 📋 Requisitos Previos

- Node.js 18+ 
- npm o yarn
- Backend FuelTrack API ejecutándose

## 🛠️ Instalación y Configuración

### 1. Instalar Dependencias

```bash
npm install
```

### 2. Configurar Variables de Entorno

```bash
cp .env

```

Editar `.env` con la URL de tu API:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

### 3. Ejecutar en Desarrollo

```bash
npm run dev
```

La aplicación estará disponible en: http://localhost:3000

### 4. Construir para Producción

```bash
npm run build
```

## 👥 Usuarios de Prueba

Utiliza estas credenciales para probar la aplicación:

| Email | Password | Rol |
|-------|----------|-----|
| admin@fueltrack.com | Admin123! | Admin |
| cliente@fueltrack.com | Cliente123! | Cliente |
| proveedor@fueltrack.com | Proveedor123! | Proveedor |

## 🎨 Paleta de Colores

| Propósito | Color | Uso |
|-----------|-------|-----|
| Primario | #22C55E | Botones, íconos activos, CTA |
| Secundario | #F97316 | Estados "aprobado", acentos |
| Fondo general | #F9FAFB | Fondo base del layout |
| Fondo contenedor | #FFFFFF | Tarjetas, paneles, tablas |
| Borde claro | #E5E7EB | Separadores y bordes |
| Texto principal | #111827 | Títulos y texto fuerte |
| Texto secundario | #6B7280 | Descripciones, texto tenue |

## 📁 Estructura del Proyecto

```
src/
├── components/          # Componentes reutilizables
│   ├── LoadingSpinner.vue
│   ├── SkeletonLoader.vue
│   ├── StatusBadge.vue
│   ├── NotificationDropdown.vue
│   └── UserDropdown.vue
├── layouts/            # Layouts por rol
│   ├── AuthLayout.vue
│   ├── AdminLayout.vue
│   ├── ClientLayout.vue
│   └── ProviderLayout.vue
├── views/              # Vistas por módulo
│   ├── auth/          # Login, registro
│   ├── admin/         # Dashboard, usuarios, etc.
│   ├── client/        # Dashboard, pedidos, pagos
│   └── provider/      # Dashboard, entregas
├── stores/             # Pinia stores
│   ├── auth.js
│   ├── orders.js
│   └── notifications.js
├── services/           # API services
│   ├── api.js         # Configuración Axios
│   ├── auth.js
│   ├── orders.js
│   └── ...
├── router/             # Vue Router
│   └── index.js
└── assets/
    └── styles/
        └── main.css   # Estilos Tailwind
```

## 🔐 Funcionalidades por Rol

### 🛠️ Administrador
- Dashboard con estadísticas globales
- Gestión de usuarios (CRUD)
- Gestión de pedidos y asignaciones
- Gestión de vehículos y operadores
- Reportes y analíticas

### 👤 Cliente
- Dashboard personal
- Crear y gestionar pedidos
- Métodos de pago (tarjetas)
- Historial de pedidos y pagos
- Notificaciones de estado

### 🚚 Proveedor
- Dashboard operativo
- Gestión de entregas
- Asignación de vehículos y operadores
- Actualización de estados
- Vista de recursos disponibles

## 🛡️ Seguridad

- **JWT Tokens**: Autenticación segura con refresh tokens
- **Route Guards**: Protección de rutas por rol
- **API Interceptors**: Manejo automático de tokens y errores
- **Validaciones**: Validación en cliente y servidor

## 📱 Responsive Design

- **Mobile First**: Diseño optimizado para móviles
- **Breakpoints**: sm, md, lg, xl
- **Sidebar Responsive**: Colapsable en móviles
- **Touch Friendly**: Botones y elementos táctiles

## 🔧 Tecnologías Utilizadas

- **Vue 3**: Framework principal
- **Composition API**: Lógica reactiva
- **Vue Router**: Enrutamiento SPA
- **Pinia**: Gestión de estado
- **TailwindCSS**: Framework CSS
- **Axios**: Cliente HTTP
- **Vuelidate**: Validaciones
- **Vue Toastification**: Notificaciones
- **Heroicons**: Iconografía
- **VueUse**: Utilidades de composición

## 🚀 Despliegue

### Netlify
```bash
npm run build
# Subir carpeta dist/ a Netlify
```

### Vercel
```bash
npm run build
# Conectar repositorio con Vercel
```

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "preview"]
```

## 📞 Soporte

Para soporte técnico o preguntas sobre la implementación:

1. Verificar que el backend esté ejecutándose
2. Revisar la configuración de variables de entorno
3. Comprobar la consola del navegador para errores
4. Verificar la conectividad con la API

---

**FuelTrack Frontend v1.0** - Interfaz moderna para gestión de combustible