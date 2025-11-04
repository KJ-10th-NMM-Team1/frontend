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
      setUser(null) // 즉시 프런트 상태 비우기
      await refresh() // (선택) 서버와 동기화
      navigate('/login', { replace: true })
    } catch (error) {
      console.error('로그아웃 중 오류:', error)
    }
  }, [navigate, refresh, setUser])

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 space-y-3">
          <div className="flex  gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-linear-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Video className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1>Video Dubbing Studio</h1>
                <p className="text-xs text-gray-500">AI 기반 영상 자동 더빙 솔루션</p>
              </div>
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
              {/* 로그인/사용자 영역 */}
              <div className="ml-auto flex items-center gap-2">
                {!isLoading && user ? (
                  <>
                    <span className="text-sm text-gray-600">{user.name}</span>
                    <Button variant="outline" size="sm" onClick={handleLogout}>
                      로그아웃
                    </Button>
                  </>
                ) : (
                  <NavLink to="/login">
                    <Button size="sm">로그인</Button>
                  </NavLink>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-7xl px-6 py-8">
        <Outlet />
      </main>
    </div>
  )
}
