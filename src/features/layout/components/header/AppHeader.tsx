import { BookOpenCheck, LogOut, Mic, Search, User, Waves } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

import { useLogoutMutation } from '@/features/auth/hooks/useAuthMutations'
import { routes } from '@/shared/config/routes'
import { useAuthStore } from '@/shared/store/useAuthStore'
import { useUiStore } from '@/shared/store/useUiStore'
import { Button } from '@/shared/ui/Button'
import { Input } from '@/shared/ui/Input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/ui/Dropdown'

const routeTitles: Array<{ pattern: RegExp; label: string }> = [
  { pattern: /^\/workspace/, label: '워크스페이스' },
  { pattern: /^\/voice-cloning/, label: '보이스 클로닝' },
  { pattern: /^\/voice-library/, label: '보이스 라이브러리' },
  { pattern: /^\/myinfo/, label: '내 정보' },
]

export function AppHeader() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const userName = useAuthStore((state) => state.userName)
  const workspaceSearchTerm = useUiStore((state) => state.workspaceSearchTerm)
  const setWorkspaceSearchTerm = useUiStore((state) => state.setWorkspaceSearchTerm)
  const location = useLocation()
  const navigate = useNavigate()
  const logoutMutation = useLogoutMutation()
  const containerWidthClass = 'w-full'
  const showWorkspaceSearch = location.pathname.startsWith(routes.workspace)
  const currentTitle =
    routeTitles.find((entry) => entry.pattern.test(location.pathname))?.label ?? null
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

  const handleVoiceCloning = () => {
    navigate(routes.voiceCloning)
  }

  const handleVoiceLibrary = () => {
    navigate(routes.voiceLibrary)
  }

  const handleMyInfo = () => {
    navigate(routes.myinfo)
  }

  const handleSignOut = () => {
    logoutMutation.mutate()
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
    <header className="bg-[#F1F5F9]/95 sticky top-0 z-40 backdrop-blur">
      <div className={`mx-auto flex ${containerWidthClass} items-center justify-between gap-6 px-6 py-4`}>
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

        <div className="flex flex-1 items-center justify-start px-10">
          {currentTitle ? (
            <h2 className="text-foreground text-lg font-semibold">{currentTitle}</h2>
          ) : null}
        </div>

        <div className="ml-auto flex items-center gap-3">
          {showWorkspaceSearch ? (
            <div className="relative flex items-center">
              <Search className="text-muted absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" aria-hidden="true" />
              <Input
                value={workspaceSearchTerm}
                onChange={(event) => setWorkspaceSearchTerm(event.target.value)}
                placeholder="워크스페이스 검색"
                className="pl-9"
              />
            </div>
          ) : null}

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
                <DropdownMenuItem onSelect={handleMyInfo}>
                  <User className="text-muted h-4 w-4" />
                  내 정보
                </DropdownMenuItem>
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
      </div>
    </header>
  )
}
