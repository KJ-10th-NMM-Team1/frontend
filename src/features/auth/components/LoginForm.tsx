import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, LogIn, Mail } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { z } from 'zod'

import { routes } from '../../../shared/config/routes'
import { trackEvent } from '../../../shared/lib/analytics'
import { Button } from '../../../shared/ui/Button'
import { Input } from '../../../shared/ui/Input'
import { Label } from '../../../shared/ui/Label'
import { ValidationMessage } from '../../../shared/ui/ValidationMessage'
import { useLoginMutation } from '../hooks/useAuthMutations'

const loginSchema = z.object({
  email: z.string().email({ message: '올바른 이메일 형식을 입력하세요.' }),
  password: z.string().min(8, { message: '비밀번호는 8자 이상이어야 합니다.' }),
})

type LoginFormValues = z.infer<typeof loginSchema>

export function LoginForm() {
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
          {loginMutation.isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              로그인 중…
            </>
          ) : (
            <>
              <LogIn className="h-4 w-4" />
              로그인
            </>
          )}
        </Button>
        <Button
          type="button"
          variant="secondary"
          className="w-full"
          onClick={() => {
            trackEvent('login_google_click')
          }}
        >
          <Mail className="h-4 w-4" />
          Google로 계속
        </Button>
      </div>
      <div className="text-muted flex flex-wrap items-center justify-between gap-3 text-sm">
        <Link to={routes.signup} className="text-primary font-medium hover:underline">
          회원가입으로 이동
        </Link>
        {/* <button
          type="button"
          className="text-muted hover:text-primary text-sm"
          onClick={() => trackEvent('login_forgot_password_click')}
        >
          비밀번호 찾기
        </button> */}
      </div>
    </form>
  )
}
