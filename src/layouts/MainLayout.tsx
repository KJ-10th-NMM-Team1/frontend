import { useEffect, useState } from 'react'
import { Video } from 'lucide-react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { getApiUrl } from '@/config'

export default function MainLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null)
  const baseBtn =
    'rounded-md px-4 py-2 text-sm font-medium transition-colors border border-transparent'
  const activeBtn = 'bg-blue-600 text-white'
  const inactiveBtn = 'bg-white text-gray-700 hover:bg-gray-100 border-gray-200'

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const response = await fetch(getApiUrl('api/auth/me'), {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        })
        if (response.ok) {
          setIsLoggedIn(true)
        } else {
          setIsLoggedIn(false)
        }
      } catch (error) {
        console.error('로그인 상태 확인 오류:', error)
        setIsLoggedIn(false)
      }
    }
    checkLoginStatus()
  }, [location.pathname])

  const handleLogout = async () => {
    try {
      // [2] 백엔드의 /logout 엔드포인트를 호출
      const response = await fetch(getApiUrl('api/auth/logout'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error('로그아웃 실패')
      }

      console.log('로그아웃 성공, 쿠키 만료됨')
      setIsLoggedIn(false)
      navigate('/login')
    } catch (error) {
      console.error('로그아웃 중 오류:', error)
    }
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
                {isLoggedIn === null ? null : isLoggedIn ? (
                  <button onClick={handleLogout} className={`${baseBtn} ${inactiveBtn}`}>
                    로그아웃
                  </button>
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
