import { Bell } from 'lucide-react'

import { useNotificationStore } from '@/shared/store/useNotificationStore'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/shared/ui/Dropdown'

import { NotificationList } from './NotificationList'

/**
 * 알림 드롭다운 컴포넌트
 * - 벨 아이콘과 읽지 않은 알림 개수 배지 표시
 * - 클릭 시 알림 목록 표시
 */
export function NotificationDropdown() {
  const unreadCount = useNotificationStore((state) => state.unreadCount)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="relative inline-flex h-11 w-11 items-center justify-center rounded-full border border-surface-4 bg-surface-2 text-foreground shadow-inner transition-colors hover:bg-surface-3"
          aria-label={`알림 ${unreadCount}개`}
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute right-0 top-0 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-96 p-0">
        <NotificationList />
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
