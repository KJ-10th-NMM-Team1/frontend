import { AlertCircle, Loader2, LogIn } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { GoogleLoginButton } from '@/components/GoogleLoginButton'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { getApiUrl } from '@/config'
import { useAuth } from '@/hooks/useAuth'

export const LoginView = () => {
  const navigate = useNavigate()
  const { user, refresh } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      navigate('/', { replace: true })
    }
  }, [user, navigate])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(getApiUrl('/api/auth/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) {
        throw new Error('로그인에 실패했습니다. 이메일과 비밀번호를 확인해주세요.')
      }

      await refresh()
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
      const response = await fetch(getApiUrl('/api/auth/google/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ id_token: credential }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        throw new Error(
          errorData?.detail ||
            errorData?.message ||
            '구글 로그인에 실패했습니다. 잠시 후 다시 시도해주세요.'
        )
      }

      await refresh()
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
            <div className="space-y-2">
              <Label htmlFor="email">이메일 주소</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                disabled={isLoading}
                placeholder="you@example.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">비밀번호</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                disabled={isLoading}
                placeholder="••••••••"
              />
            </div>

            {error ? (
              <div className="flex items-center rounded-md border border-red-200 bg-red-50 p-3">
                <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-500" />
                <p className="ml-3 text-sm text-red-700">{error}</p>
              </div>
            ) : null}

            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <span className="flex items-center justify-center">
                  <LogIn className="mr-2 h-5 w-5" />
                  로그인
                </span>
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
