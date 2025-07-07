<template>
  <span
    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
    :class="badgeClasses"
  >
    {{ statusText }}
  </span>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  status: {
    type: [String, Number],
    required: true
  },
  type: {
    type: String,
    default: 'order',
    validator: (value) => ['order', 'payment', 'vehicle', 'operator'].includes(value)
  }
})

const statusText = computed(() => {
  if (props.type === 'order') {
    const orderStatuses = {
      1: 'Pendiente',
      2: 'Confirmado',
      3: 'En Tránsito',
      4: 'Entregado',
      5: 'Cancelado'
    }
    return orderStatuses[props.status] || props.status
  }
  
  if (props.type === 'payment') {
    const paymentStatuses = {
      1: 'Pendiente',
      2: 'Completado',
      3: 'Fallido',
      4: 'Reembolsado'
    }
    return paymentStatuses[props.status] || props.status
  }
  
  if (props.type === 'vehicle') {
    const vehicleStatuses = {
      1: 'Disponible',
      2: 'En Uso',
      3: 'Mantenimiento',
      4: 'Fuera de Servicio'
    }
    return vehicleStatuses[props.status] || props.status
  }
  
  if (props.type === 'operator') {
    const operatorStatuses = {
      1: 'Disponible',
      2: 'En Entrega',
      3: 'Fuera de Turno'
    }
    return operatorStatuses[props.status] || props.status
  }
  
  return props.status
})

const badgeClasses = computed(() => {
  if (props.type === 'order') {
    const classes = {
      1: 'bg-yellow-100 text-yellow-800', // Pendiente
      2: 'bg-blue-100 text-blue-800',     // Confirmado
      3: 'bg-orange-100 text-orange-800', // En Tránsito
      4: 'bg-green-100 text-green-800',   // Entregado
      5: 'bg-red-100 text-red-800'        // Cancelado
    }
    return classes[props.status] || 'bg-gray-100 text-gray-800'
  }
  
  if (props.type === 'payment') {
    const classes = {
      1: 'bg-yellow-100 text-yellow-800', // Pendiente
      2: 'bg-green-100 text-green-800',   // Completado
      3: 'bg-red-100 text-red-800',       // Fallido
      4: 'bg-blue-100 text-blue-800'      // Reembolsado
    }
    return classes[props.status] || 'bg-gray-100 text-gray-800'
  }
  
  if (props.type === 'vehicle') {
    const classes = {
      1: 'bg-green-100 text-green-800',   // Disponible
      2: 'bg-orange-100 text-orange-800', // En Uso
      3: 'bg-yellow-100 text-yellow-800', // Mantenimiento
      4: 'bg-red-100 text-red-800'        // Fuera de Servicio
    }
    return classes[props.status] || 'bg-gray-100 text-gray-800'
  }
  
  if (props.type === 'operator') {
    const classes = {
      1: 'bg-green-100 text-green-800',   // Disponible
      2: 'bg-orange-100 text-orange-800', // En Entrega
      3: 'bg-gray-100 text-gray-800'      // Fuera de Turno
    }
    return classes[props.status] || 'bg-gray-100 text-gray-800'
  }
  
  return 'bg-gray-100 text-gray-800'
})
</script>