import React, { useState, useEffect } from 'react'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from './ui/card'
import { AlertCircle, Loader2 } from 'lucide-react'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { LogIn } from 'lucide-react'
import { getApiUrl } from '@/config'
import { useNavigate } from 'react-router-dom'

export const LoginView = () => {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (localStorage.getItem('authToken')) {
      setError('이미 로그인되어 있습니다.')
      setIsLoading(false)
      navigate('/')
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      // --- 실제 API 호출 예시 ---
      const formData = new URLSearchParams()
      formData.append('username', email)
      formData.append('password', password)

      const response = await fetch(getApiUrl('api/auth/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData,
      })
      if (!response.ok) {
        throw new Error('로그인에 실패했습니다. 이메일과 비밀번호를 확인해주세요.')
      }
      const data = await response.json()
      console.log('로그인 성공, 토큰:', data.access_token)
      if (data.access_token) {
        localStorage.setItem('authToken', data.access_token)
      }

      // onLoginSuccess(data.token)
      navigate('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
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
        </CardContent>

        {/* 하단 링크 */}
        <CardFooter className="flex justify-center">
          <p className="text-sm text-gray-500">
            계정이 없으신가요?{' '}
            <a href="/signup" className="font-medium text-blue-600 hover:text-blue-500">
              회원가입
            </a>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
