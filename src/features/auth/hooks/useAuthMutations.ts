import { useMutation } from '@tanstack/react-query'

import { trackEvent } from '../../../shared/lib/analytics'
import { useAuthStore } from '../../../shared/store/useAuthStore'
import { useUiStore } from '../../../shared/store/useUiStore'

type Credentials = {
  email: string
  password: string
  roles?: string[]
}

type SignupPayload = Credentials & {
  userName: string
  agreeTerms: boolean
}

function delay<T>(data: T, ms = 800) {
  return new Promise<T>((resolve) => setTimeout(() => resolve(data), ms))
}

export function useLoginMutation() {
  const authenticate = useAuthStore((state) => state.authenticate)
  const showToast = useUiStore((state) => state.showToast)

  return useMutation({
    mutationKey: ['auth', 'login'],
    mutationFn: async ({ email, password, roles }: Credentials) => {
      if (!email || !password) {
        throw new Error('Missing credentials')
      }
      const effectiveRoles = roles?.length ? roles : ['distributor']
      trackEvent('login_attempt', { roles: effectiveRoles })
      return delay({
        userName: email.split('@')[0],
        roles: effectiveRoles,
      })
    },
    onSuccess: ({ userName, roles }) => {
      authenticate({ userName, roles: roles as ('distributor' | 'editor')[] })
      trackEvent('login_success')
      showToast({
        id: 'login-success',
        title: '로그인 성공',
        description: '요청한 역할 권한을 반영했습니다.',
        autoDismiss: 4000,
      })
    },
  })
}

export function useSignupMutation() {
  const showToast = useUiStore((state) => state.showToast)

  return useMutation({
    mutationKey: ['auth', 'signup'],
    mutationFn: async ({ email, roles, userName, agreeTerms }: SignupPayload) => {
      if (!agreeTerms) {
        throw new Error('약관 동의가 필요합니다.')
      }
      const effectiveRoles = roles?.length ? roles : ['distributor']
      trackEvent('signup_submit', { roles: effectiveRoles })
      return delay({
        email,
        userName,
        roles: effectiveRoles,
      })
    },
    onSuccess: ({ userName, roles }) => {
      trackEvent('account_created', { roles })
      showToast({
        id: 'signup-success',
        title: '회원가입 완료',
        description: `${userName}님, 이메일 인증을 진행해주세요.`,
        autoDismiss: 4000,
      })
    },
  })
}
