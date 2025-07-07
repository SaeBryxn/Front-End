import { defineStore } from 'pinia'
import { ref } from 'vue'
import { notificationsService } from '@/services/notifications'

export const useNotificationsStore = defineStore('notifications', () => {
  const notifications = ref([])
  const unreadCount = ref(0)
  const loading = ref(false)

  const fetchNotifications = async () => {
    loading.value = true
    try {
      notifications.value = await notificationsService.getNotifications()
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      loading.value = false
    }
  }

  const fetchUnreadCount = async () => {
    try {
      unreadCount.value = await notificationsService.getUnreadCount()
    } catch (error) {
      console.error('Error fetching unread count:', error)
    }
  }

  const markAsRead = async (notificationId) => {
    try {
      await notificationsService.markAsRead(notificationId)
      const notification = notifications.value.find(n => n.id === notificationId)
      if (notification) {
        notification.isRead = true
        unreadCount.value = Math.max(0, unreadCount.value - 1)
      }
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      await notificationsService.markAllAsRead()
      notifications.value.forEach(notification => {
        notification.isRead = true
      })
      unreadCount.value = 0
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
    }
  }

  return {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead
  }
})