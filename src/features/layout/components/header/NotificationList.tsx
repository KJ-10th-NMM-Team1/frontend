import { CheckCheck, Trash2, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { routes } from '@/shared/config/routes'
import { useNotificationStore } from '@/shared/store/useNotificationStore'
import { Button } from '@/shared/ui/Button'

/**
 * 알림 목록 컴포넌트
 * - 알림 목록 표시
 * - 개별 알림 읽음 처리 및 삭제
 * - 전체 읽음 처리 및 전체 삭제
 * - 알림 클릭 시 해당 프로젝트로 이동
 */
export function NotificationList() {
  const navigate = useNavigate()
  const { notifications, unreadCount, markAsRead, markAllAsRead, removeNotification, clearAll } =
    useNotificationStore()

  const handleNotificationClick = (
    notificationId: string,
    projectId?: string,
    targetLanguage?: string,
  ) => {
    markAsRead(notificationId)
    if (projectId && targetLanguage) {
      navigate(routes.editor(projectId, targetLanguage))
    } else if (projectId) {
      navigate(routes.projectDetail(projectId))
    }
  }

  const formatTimestamp = (timestamp: number) => {
    const now = Date.now()
    const diff = now - timestamp
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return '방금 전'
    if (minutes < 60) return `${minutes}분 전`
    if (hours < 24) return `${hours}시간 전`
    if (days < 7) return `${days}일 전`
    return new Date(timestamp).toLocaleDateString('ko-KR', {
      month: 'short',
      day: 'numeric',
    })
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return '✅'
      case 'error':
        return '❌'
      case 'warning':
        return '⚠️'
      default:
        return 'ℹ️'
    }
  }

  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Bell className="mb-3 h-12 w-12 text-muted" />
        <p className="text-sm text-muted">알림이 없습니다</p>
      </div>
    )
  }

  return (
    <div className="flex max-h-[500px] flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-surface-3 px-4 py-3">
        <h3 className="text-sm font-semibold text-foreground">
          알림
          {unreadCount > 0 && (
            <span className="ml-2 text-xs font-normal text-muted">({unreadCount}개 읽지 않음)</span>
          )}
        </h3>
        <div className="flex items-center gap-1">
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              className="h-7 px-2 text-xs text-muted hover:text-foreground"
              title="모두 읽음으로 표시"
            >
              <CheckCheck className="h-3.5 w-3.5" />
            </Button>
          )}
          {notifications.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAll}
              className="h-7 px-2 text-xs text-muted hover:text-danger"
              title="모두 삭제"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>

      {/* Notification List */}
      <div className="overflow-y-auto">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`group relative border-b border-surface-2 transition-colors hover:bg-surface-2 ${
              !notification.read ? 'bg-primary/5' : ''
            }`}
          >
            <button
              onClick={() =>
                handleNotificationClick(
                  notification.id,
                  notification.projectId,
                  notification.targetLanguage,
                )
              }
              className="w-full px-4 py-3 text-left"
            >
              <div className="flex items-start gap-3">
                <span className="mt-0.5 text-lg" aria-label={notification.type}>
                  {getNotificationIcon(notification.type)}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium text-foreground">{notification.title}</p>
                    {!notification.read && (
                      <span className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-primary" />
                    )}
                  </div>
                  <p className="mt-1 text-xs text-muted">{notification.message}</p>
                  <p className="mt-1.5 text-xs text-muted">
                    {formatTimestamp(notification.timestamp)}
                  </p>
                </div>
              </div>
            </button>

            {/* Delete button */}
            <button
              onClick={(e) => {
                e.stopPropagation()
                removeNotification(notification.id)
              }}
              className="absolute right-2 top-3 rounded p-1 opacity-0 transition-opacity hover:bg-surface-3 group-hover:opacity-100"
              title="삭제"
            >
              <X className="h-3.5 w-3.5 text-muted" />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

function Bell({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </svg>
  )
}
