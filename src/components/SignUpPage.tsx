import React, { useState } from 'react'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from './ui/card'
import { AlertCircle, Loader2, UserPlus } from 'lucide-react'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { getApiUrl } from '@/config'
import { useNavigate } from 'react-router-dom'

export const SignUpView = () => {
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  /**
   * 폼 제출 시 호출되는 핸들러
   */
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.')
      return
    }
    setIsLoading(true)
    setError(null)

    try {
      // --- 실제 회원가입 API 호출 ---
      const response = await fetch(getApiUrl('api/auth/signup'), {
        // (엔드포인트는 예시)
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: username,
          email: email,
          hashed_password: password,
          role: 'owner',
        }),
      })
      // ------------------------

      if (!response.ok) {
        const errorData = await response.json()
        console.log(errorData)
        throw new Error('회원가입에 실패했습니다.')
      }

      // const data = await response.json();
      console.log('회원가입 성공')
      navigate('/login')
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
          <CardTitle className="text-3xl font-bold">회원가입</CardTitle>
          <CardDescription className="mt-2 text-sm text-gray-500">
            새 계정을 생성합니다.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="username">사용자 이름</Label>
              <Input
                id="username"
                name="username"
                type="username"
                autoComplete="username"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isLoading}
                placeholder="사용자 이름"
              />
            </div>

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
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                placeholder="••••••••"
              />
            </div>

            {/* 비밀번호 확인 */}
            <div className="space-y-2">
              <Label htmlFor="confirm-password">비밀번호 확인</Label>
              <Input
                id="confirm-password"
                name="confirm-password"
                type="password"
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
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

            {/* 회원가입 버튼 */}
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <div className="flex items-center">
                  <UserPlus className="mr-2 h-5 w-5" />
                  <span>계정 생성</span>
                </div>
              )}
            </Button>
          </form>
        </CardContent>

        {/* 하단 링크 */}
        <CardFooter className="flex justify-center">
          <p className="text-sm text-gray-500">
            이미 계정이 있으신가요?{' '}
            <Button
              variant="link"
              size="sm"
              type="button"
              className="p-0 h-auto font-medium text-blue-600 hover:text-blue-500"
              onClick={() => navigate('/login')}
            >
              로그인
            </Button>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
