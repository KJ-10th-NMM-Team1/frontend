import { useCallback, useEffect } from 'react'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { z } from 'zod'

import { useAuthSuccessHandler } from '@/features/auth/hooks/useAuthMutations'
import { apiClient } from '@/shared/api/client'

import { routes } from '../../../shared/config/routes'
import { trackEvent } from '../../../shared/lib/analytics'
import { Button } from '../../../shared/ui/Button'
import { Input } from '../../../shared/ui/Input'
import { Label } from '../../../shared/ui/Label'
import { ValidationMessage } from '../../../shared/ui/ValidationMessage'
import type { GoogleAPI, GoogleCredentialResponse } from '../../../types/google'
import { useLoginMutation } from '../hooks/useAuthMutations'


const loginSchema = z.object({
  email: z.string().email({ message: '올바른 이메일 형식을 입력해주세요.' }),
  password: z.string().min(8, { message: '비밀번호는 8자 이상이어야 합니다.' }),
})

type LoginFormValues = z.infer<typeof loginSchema>

export function LoginForm() {
  const handleAuthSuccess = useAuthSuccessHandler()
  const loginMutation = useLoginMutation()
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const onSubmit = handleSubmit((data) => {
    loginMutation.mutate(data, {
      onSuccess: () => {
        navigate(routes.workspace)
      },
    })
  })

  const handleGoogleCredentialResponse = useCallback(({ credential }: GoogleCredentialResponse) => {
    if (!credential) {
      console.warn('Google credential missing')
      return
    }

    trackEvent('login_google_credential_received')

    const processLogin = async () => {
        await apiClient.post('api/auth/google/login', {
          json: { id_token: credential },
        })
        await handleAuthSuccess()
      await handleAuthSuccess()
    }

    void processLogin().catch((error) => console.error('Google login error', error))
  }, [handleAuthSuccess])

  useEffect(() => {
    const googleClient: GoogleAPI | undefined = window.google
    if (!googleClient) {
      console.warn('Google Identity Services script not loaded')
      return
    }
    const target = document.getElementById('google-login-button')
    if (!target) {
      console.warn('Google login button container missing')
      return
    }

    const clientId = String(import.meta.env.VITE_GOOGLE_CLIENT_ID ?? '')

    googleClient.accounts.id.initialize({
      client_id: clientId,
      callback: handleGoogleCredentialResponse,
    })
    googleClient.accounts.id.renderButton(target, { theme: 'outline', size: 'large' })
  }, [handleGoogleCredentialResponse])

  return (
    <form
      onSubmit={(event) => {
        void onSubmit(event)
      }}
      className="space-y-6"
    >
      <div className="space-y-2">
        <Label htmlFor="email">이메일</Label>
        <div>
          <Input id="email" type="email" placeholder="name@example.com" {...register('email')} />
          <ValidationMessage message={errors.email?.message} />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">비밀번호</Label>
        <div>
          <Input id="password" type="password" placeholder="8자 이상" {...register('password')} />
          <ValidationMessage message={errors.password?.message} />
        </div>
      </div>
      <div className="grid gap-3">
        <Button type="submit" disabled={loginMutation.isPending} className="w-full">
          {loginMutation.isPending ? '로그인 중...' : '로그인'}
        </Button>
        <div id="google-login-button" className="w-full" />
      </div>
      <div className="text-muted flex flex-wrap items-center justify-between gap-3 text-sm">
        <Link to={routes.signup} className="text-primary font-medium hover:underline">
          회원가입 이동
        </Link>
      </div>
    </form>
  )
}
