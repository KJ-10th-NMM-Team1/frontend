import { useEffect, useState } from 'react'

import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'

import { changePassword, type ChangePasswordPayload } from '@/features/auth/api/authApi'
import { routes } from '@/shared/config/routes'
import { useAuthStore } from '@/shared/store/useAuthStore'
import { useUiStore } from '@/shared/store/useUiStore'
import { Button } from '@/shared/ui/Button'
import { Card, CardDescription, CardHeader, CardTitle } from '@/shared/ui/Card'
import { Input } from '@/shared/ui/Input'

export default function ChangedPasswordPage() {
  const { isAuthenticated, signOut } = useAuthStore((state) => ({
    isAuthenticated: state.isAuthenticated,
    signOut: state.signOut,
  }))
  const navigate = useNavigate()
  const showToast = useUiStore((state) => state.showToast)
  const [form, setForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [error, setError] = useState<string | null>(null)
  const changePasswordMutation = useMutation({
    mutationFn: (payload: ChangePasswordPayload) => changePassword(payload),
  })

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth/login', { replace: true })
    }
  }, [isAuthenticated, navigate])

  if (!isAuthenticated) {
    return null
  }

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    setError(null)
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!form.currentPassword || !form.newPassword || !form.confirmPassword) {
      setError('모든 비밀번호 입력란을 채워주세요.')
      return
    }
    if (form.newPassword !== form.confirmPassword) {
      setError('새 비밀번호가 일치하지 않습니다.')
      return
    }
    try {
      await changePasswordMutation.mutateAsync({
        current_password: form.currentPassword,
        new_password: form.newPassword,
      })
      showToast({
        title: '비밀번호 변경 완료',
        description: '새 비밀번호로 다시 로그인해 주세요.',
      })
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
      signOut()
      navigate(routes.login, { replace: true })
    } catch (err) {
      console.error(err)
      setError('비밀번호 변경에 실패했습니다. 다시 시도해주세요.')
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-8 px-6 py-12">
      <header className="space-y-2 text-center">
        <p className="text-muted text-xs font-semibold uppercase tracking-[0.35em]">Account</p>
        <h1 className="text-foreground text-3xl font-semibold">비밀번호 변경</h1>
        <p className="text-muted">
          현재 비밀번호를 확인하고 새 비밀번호를 설정해 주세요. 새 비밀번호는 8자 이상을 권장합니다.
        </p>
      </header>
      <Card className="p-8">
        <CardHeader>
          <CardTitle>보안 확인</CardTitle>
          <CardDescription>아래 정보를 입력한 후 비밀번호를 변경할 수 있습니다.</CardDescription>
        </CardHeader>
        <form className="space-y-5" onSubmit={(event) => void handleSubmit(event)}>
          <div className="space-y-2">
            <label className="text-muted text-xs font-semibold uppercase tracking-wide">
              현재 비밀번호
            </label>
            <Input
              type="password"
              value={form.currentPassword}
              onChange={(event) => handleChange('currentPassword', event.target.value)}
              placeholder="현재 비밀번호"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-muted text-xs font-semibold uppercase tracking-wide">
              새 비밀번호
            </label>
            <Input
              type="password"
              value={form.newPassword}
              onChange={(event) => handleChange('newPassword', event.target.value)}
              placeholder="새 비밀번호"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-muted text-xs font-semibold uppercase tracking-wide">
              새 비밀번호 확인
            </label>
            <Input
              type="password"
              value={form.confirmPassword}
              onChange={(event) => handleChange('confirmPassword', event.target.value)}
              placeholder="새 비밀번호 확인"
              required
            />
          </div>
          {error && (
            <p className="text-danger text-sm" role="alert">
              {error}
            </p>
          )}
          <Button type="submit" className="w-full" disabled={changePasswordMutation.isPending}>
            {changePasswordMutation.isPending ? '변경 중…' : '비밀번호 변경'}
          </Button>
        </form>
      </Card>
      <Button variant="ghost" onClick={() => navigate(-1)} className="text-muted self-center">
        돌아가기
      </Button>
    </div>
  )
}
