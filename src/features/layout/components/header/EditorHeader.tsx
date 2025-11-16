import { LogOut, User, Waves } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'

import { useLogoutMutation } from '@/features/auth/hooks/useAuthMutations'
import { routes } from '@/shared/config/routes'
import { useAuthStore } from '@/shared/store/useAuthStore'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/ui/Dropdown'

export function EditorHeader() {
  const navigate = useNavigate()
  const logoutMutation = useLogoutMutation()

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const userName = useAuthStore((state) => state.userName)

  const initials =
    userName
      ?.split(' ')
      .map((word) => word[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() ?? 'DP'

  const handleVoiceSamples = () => {
    navigate(routes.voiceSamples)
  }

  const handleMyInfo = () => {
    navigate(routes.myinfo)
  }

  const handleSignOut = () => {
    logoutMutation.mutate()
  }

  return (
    <header className="border-surface-3 bg-surface-1 border-b">
      <div className="mx-auto flex w-full max-w-[1920px] items-center justify-between gap-6 px-6 py-2">
        {/* Logo - 얇은 버전 */}
        <Link
          to={routes.home}
          className="focus-visible:outline-hidden focus-visible:ring-primary group flex items-center gap-1 focus-visible:ring-2 focus-visible:ring-offset-2"
          aria-label="Dupliot 홈으로 이동"
        >
          <span className="text-foreground text-xl font-semibold tracking-tight">
            Dupliot
            <span className="text-primary">.</span>
          </span>
        </Link>

        {/* User Menu */}
        {isAuthenticated ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="bg-surface-2 text-foreground border-surface-4 inline-flex h-9 w-9 items-center justify-center rounded-full border text-xs font-semibold uppercase shadow-inner"
              >
                {initials}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-60">
              <DropdownMenuLabel>
                <p className="text-muted text-xs font-medium uppercase tracking-[0.3em]">Creator</p>
                <p className="text-foreground mt-1 text-sm font-semibold">{userName ?? '미등록'}</p>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={handleMyInfo}>
                <User className="text-muted h-4 w-4" />내 정보
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={handleVoiceSamples}>
                <Waves className="text-muted h-4 w-4" />
                음성 샘플
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-danger" onSelect={handleSignOut}>
                <LogOut className="h-4 w-4" />
                로그아웃
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : null}
      </div>
    </header>
  )
}
