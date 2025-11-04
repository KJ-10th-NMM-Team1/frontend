import React, { useState, useEffect } from 'react'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from './ui/card'
import { AlertCircle, Loader2 } from 'lucide-react'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { LogIn } from 'lucide-react'
import { getApiUrl } from '@/config'
import { useNavigate } from 'react-router-dom'
import { GoogleLoginButton } from './GoogleLoginButton'

export const LoginView = () => {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // HttpOnly 쿠키 방식은 /api/auth/me를 호출하여 상태를 확인합니다.
    const checkLoginStatus = async () => {
      try {
        const response = await fetch(getApiUrl('api/auth/me'), {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        })
        if (response.ok) {
          console.log('이미 로그인된 상태입니다. 메인 페이지로 이동합니다.')
          navigate('/', { replace: true })
        }
      } catch (error) {
        console.error('자동 로그인 확인 오류:', error)
      }
    }
    checkLoginStatus()
  }, [navigate])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(getApiUrl('api/auth/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      })
      if (!response.ok) {
        throw new Error('로그인에 실패했습니다. 이메일과 비밀번호를 확인해주세요.')
      }
      const data = await response.json()
      if (!data.message) {
        throw new Error('서버 응답이 올바르지 않습니다.')
      }
      navigate('/', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async (credential: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(getApiUrl('api/auth/google/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ id_token: credential }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        const message =
          (errorData && (errorData.detail || errorData.message)) ||
          '구글 로그인에 실패했습니다. 잠시 후 다시 시도해주세요.'
        throw new Error(message)
      }

      navigate('/', { replace: true })
    } catch (err) {
      setError(
        err instanceof Error ? err.message : '구글 로그인 중 알 수 없는 오류가 발생했습니다.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleError = (message: string) => {
    setError(message)
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">로그인</CardTitle>
          <CardDescription className="mt-2 text-sm text-gray-500">
            계정에 액세스하세요.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 이메일 입력 */}
            <div className="space-y-2">
              <Label htmlFor="email">이메일 주소</Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                placeholder="you@example.com"
              />
            </div>

            {/* 비밀번호 입력 */}
            <div className="space-y-2">
              <Label htmlFor="password">비밀번호</Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                placeholder="••••••••"
              />
            </div>

            {/* 오류 메시지 표시 */}
            {error && (
              <div className="flex items-center rounded-md border border-red-200 bg-red-50 p-3">
                <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-500" />
                <p className="ml-3 text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* 로그인 버튼 */}
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <div className="flex items-center">
                  <LogIn className="mr-2 h-5 w-5" />
                  <span>로그인</span>
                </div>
              )}
            </Button>
          </form>

          <div className="mt-6 space-y-4">
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <span className="h-px flex-1 bg-gray-200" />
              <span>또는</span>
              <span className="h-px flex-1 bg-gray-200" />
            </div>
            <GoogleLoginButton
              onToken={handleGoogleSignIn}
              onError={handleGoogleError}
              disabled={isLoading}
            />
          </div>
        </CardContent>

        {/* 하단 링크 */}
        <CardFooter className="flex justify-center">
          <p className="text-sm text-gray-500">
            계정이 없으신가요?{' '}
            <button
              type="button"
              onClick={() => navigate('/signup')}
              className="font-medium text-blue-600 hover:text-blue-500 focus:outline-none"
            >
              회원가입
            </button>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
