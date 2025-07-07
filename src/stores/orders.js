import { defineStore } from 'pinia'
import { ref } from 'vue'
import { ordersService } from '@/services/orders'
import { useToast } from 'vue-toastification'

export const useOrdersStore = defineStore('orders', () => {
  const orders = ref([])
  const currentOrder = ref(null)
  const loading = ref(false)
  const toast = useToast()

  const fetchOrders = async () => {
    loading.value = true
    try {
      orders.value = await ordersService.getOrders()
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      loading.value = false
    }
  }

  const fetchOrder = async (id) => {
    loading.value = true
    try {
      currentOrder.value = await ordersService.getOrder(id)
    } catch (error) {
      console.error('Error fetching order:', error)
    } finally {
      loading.value = false
    }
  }

  const createOrder = async (orderData) => {
    try {
      const newOrder = await ordersService.createOrder(orderData)
      orders.value.unshift(newOrder)
      toast.success('Pedido creado exitosamente')
      return newOrder
    } catch (error) {
      console.error('Error creating order:', error)
      throw error
    }
  }

  const assignDelivery = async (orderId, assignmentData) => {
    try {
      const updatedOrder = await ordersService.assignDelivery(orderId, assignmentData)
      const index = orders.value.findIndex(order => order.id === orderId)
      if (index !== -1) {
        orders.value[index] = updatedOrder
      }
      toast.success('Entrega asignada exitosamente')
      return updatedOrder
    } catch (error) {
      console.error('Error assigning delivery:', error)
      throw error
    }
  }

  const updateOrderStatus = async (orderId, status) => {
    try {
      const updatedOrder = await ordersService.updateOrderStatus(orderId, status)
      const index = orders.value.findIndex(order => order.id === orderId)
      if (index !== -1) {
        orders.value[index] = updatedOrder
      }
      toast.success('Estado actualizado exitosamente')
      return updatedOrder
    } catch (error) {
      console.error('Error updating order status:', error)
      throw error
    }
  }

  return {
    orders,
    currentOrder,
    loading,
    fetchOrders,
    fetchOrder,
    createOrder,
    assignDelivery,
    updateOrderStatus
  }
})