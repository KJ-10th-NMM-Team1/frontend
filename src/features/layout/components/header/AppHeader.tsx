import { LogOut, Waves } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

import { routes } from '@/shared/config/routes'
import { useAuthStore } from '@/shared/store/useAuthStore'
import { Button } from '@/shared/ui/Button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/ui/Dropdown'

export function AppHeader() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const userName = useAuthStore((state) => state.userName)
  const signOut = useAuthStore((state) => state.signOut)
  const location = useLocation()
  const navigate = useNavigate()
  const isWideLayout = location.pathname.startsWith('/editor')
  const containerWidthClass = isWideLayout ? 'max-w-[1920px]' : 'max-w-7xl'
  const initials =
    userName
      ?.split(' ')
      .map((word) => word[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() ?? 'DP'

  const handleVoiceSamples = () => {
    navigate({ pathname: routes.workspace, search: '?section=voice-samples' })
  }

  const handleSignOut = () => {
    signOut()
    navigate(routes.home)
  }
  // const userNavItems = isAuthenticated
  //   ? [
  //       { to: `${routes.home}projects`, label: '프로젝트' },
  //       { to: `${routes.home}voice-samples`, label: '보이스 샘플' },
  //       { to: `${routes.home}guide`, label: '이용 가이드' },
  //       { to: `${routes.home}support`, label: '문의' },
  //     ]
  //   : []

  return (
    <header className="border-surface-3 bg-surface-1/90 sticky top-0 z-40 border-b backdrop-blur">
      <div
        className={`mx-auto flex w-full ${containerWidthClass} items-center justify-between gap-6 px-6 py-4`}
      >
        <Link
          to={routes.home}
          className="focus-visible:outline-hidden focus-visible:ring-primary group flex flex-col leading-tight focus-visible:ring-2 focus-visible:ring-offset-2"
          aria-label="Dupliot 홈으로 이동"
        >
          <span className="text-foreground text-2xl font-semibold tracking-tight">
            Dupliot
            <span className="text-primary">.</span>
          </span>
          <span className="text-muted group-hover:text-foreground text-xs uppercase tracking-[0.35em] transition-colors duration-150">
            studio workspace
          </span>
        </Link>

        {isAuthenticated ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="bg-surface-2 text-foreground border-surface-4 inline-flex h-11 w-11 items-center justify-center rounded-full border text-sm font-semibold uppercase shadow-inner"
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
        ) : (
          <div className="flex items-center gap-2">
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="text-foreground/70 hover:bg-surface-2/80 hover:text-foreground rounded-md px-4"
            >
              <Link to={routes.login}>로그인</Link>
            </Button>
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="border-surface-3 bg-surface-1 text-foreground rounded-md border px-5 font-semibold shadow-soft hover:bg-white"
            >
              <Link to={routes.signup}>회원가입</Link>
            </Button>
          </div>
        )}
      </div>
    </header>
  )
}
