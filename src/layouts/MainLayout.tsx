import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'
import { logout } from '@/providers/auth-api'
import { Video } from 'lucide-react'
import { useCallback } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'

export default function MainLayout() {
  const { user, isLoading, setUser, refresh } = useAuth()
  const navigate = useNavigate()
  const baseBtn =
    'rounded-md px-4 py-2 text-sm font-medium transition-colors border border-transparent'
  const activeBtn = 'bg-blue-600 text-white'
  const inactiveBtn = 'bg-white text-gray-700 hover:bg-gray-100 border-gray-200'

  const handleLogout = useCallback(async () => {
    try {
      await logout()
      setUser(null)
      await refresh()
      navigate('/login', { replace: true })
    } catch (error) {
      console.error('로그아웃 중 오류:', error)
    }
  }, [navigate, refresh, setUser])

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <header className="sticky top-0 z-10 border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-linear-to-br from-blue-500 to-purple-600">
              <Video className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1>Video Dubbing Studio</h1>
              <p className="text-xs text-gray-500">AI 기반 영상 자동 더빙 솔루션</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex gap-2">
              <NavLink
                to="/"
                className={({ isActive }) => `${baseBtn} ${isActive ? activeBtn : inactiveBtn}`}
              >
                배급자 모드
              </NavLink>
              <NavLink
                to="/translator"
                className={({ isActive }) => `${baseBtn} ${isActive ? activeBtn : inactiveBtn}`}
              >
                번역가 모드
              </NavLink>
            </div>

            {!isLoading && user ? (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">{user.name}</span>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  로그아웃
                </Button>
              </div>
            ) : (
              <NavLink to="/login">
                <Button size="sm">로그인</Button>
              </NavLink>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl px-6 py-8">
        <Outlet />
      </main>
    </div>
  )
}
