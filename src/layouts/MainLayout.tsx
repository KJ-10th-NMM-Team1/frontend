import { useState } from 'react'
import { Video } from 'lucide-react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'

export default function MainLayout() {
  const navigate = useNavigate()
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => !!localStorage.getItem('authToken'))
  const baseBtn =
    'rounded-md px-4 py-2 text-sm font-medium transition-colors border border-transparent'
  const activeBtn = 'bg-blue-600 text-white'
  const inactiveBtn = 'bg-white text-gray-700 hover:bg-gray-100 border-gray-200'

  const handleLogout = () => {
    // 1. localStorage에서 토큰 삭제
    localStorage.removeItem('authToken')
    // 2. React state를 변경하여 컴포넌트 리렌더링 (가장 중요!)
    setIsLoggedIn(false)
    // 3. 로그인 페이지로 이동
    navigate('/login')
  }

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
                {isLoggedIn ? (
                  <NavLink
                    to="/logout"
                    onClick={handleLogout}
                    className={({ isActive }) => `${baseBtn} ${isActive ? activeBtn : inactiveBtn}`}
                  >
                    로그아웃
                  </NavLink>
                ) : (
                  <NavLink
                    to="/login"
                    className={({ isActive }) => `${baseBtn} ${isActive ? activeBtn : inactiveBtn}`}
                  >
                    로그인
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
