import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type NotificationType = 'success' | 'info' | 'warning' | 'error'

export interface Notification {
  id: string
  type: NotificationType
  title: string
  message: string
  timestamp: number
  read: boolean
  projectId?: string
  targetLanguage?: string
}

interface NotificationState {
  notifications: Notification[]
  unreadCount: number
}

interface NotificationActions {
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  removeNotification: (id: string) => void
  clearAll: () => void
}

type NotificationStore = NotificationState & NotificationActions

/**
 * 알림 전역 상태 관리
 * - 작업 완료 알림 저장
 * - 읽음/안읽음 상태 관리
 * - localStorage에 영구 저장
 */
export const useNotificationStore = create<NotificationStore>()(
  persist(
    (set) => ({
      notifications: [],
      unreadCount: 0,

      addNotification: (notification) =>
        set((state) => {
          const newNotification: Notification = {
            ...notification,
            id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            timestamp: Date.now(),
            read: false,
          }

          const newNotifications = [newNotification, ...state.notifications].slice(0, 50) // 최대 50개

          return {
            notifications: newNotifications,
            unreadCount: state.unreadCount + 1,
          }
        }),

      markAsRead: (id) =>
        set((state) => {
          const notification = state.notifications.find((n) => n.id === id)
          if (!notification || notification.read) return state

          return {
            notifications: state.notifications.map((n) =>
              n.id === id ? { ...n, read: true } : n
            ),
            unreadCount: Math.max(0, state.unreadCount - 1),
          }
        }),

      markAllAsRead: () =>
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, read: true })),
          unreadCount: 0,
        })),

      removeNotification: (id) =>
        set((state) => {
          const notification = state.notifications.find((n) => n.id === id)
          const wasUnread = notification && !notification.read

          return {
            notifications: state.notifications.filter((n) => n.id !== id),
            unreadCount: wasUnread ? Math.max(0, state.unreadCount - 1) : state.unreadCount,
          }
        }),

      clearAll: () =>
        set({
          notifications: [],
          unreadCount: 0,
        }),
    }),
    {
      name: 'notification-storage',
      partialize: (state) => ({
        notifications: state.notifications,
        unreadCount: state.unreadCount,
      }),
    }
  )
)
