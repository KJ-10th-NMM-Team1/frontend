import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'

import {
  login,
  signup,
  logout,
  getCurrentUser,
  type LoginPayload,
  type SignupPayload,
} from '../api/authApi'
import { trackEvent } from '../../../shared/lib/analytics'
import { useAuthStore } from '../../../shared/store/useAuthStore'
import { useUiStore } from '../../../shared/store/useUiStore'
import { routes } from '../../../shared/config/routes'

// type Credentials = {
//   email: string
//   password: string
//   roles?: string[]
// }

// type SignupPayload = Credentials & {
//   userName: string
//   agreeTerms: boolean
// }

// function delay<T>(data: T, ms = 800) {
//   return new Promise<T>((resolve) => setTimeout(() => resolve(data), ms))
// }

export function useLoginMutation() {
  const authenticate = useAuthStore((state) => state.authenticate)
  const showToast = useUiStore((state) => state.showToast)
  const navigate = useNavigate()

  return useMutation({
    mutationKey: ['auth', 'login'],
    mutationFn: async (payload: LoginPayload) => {
      trackEvent('login_attempt', { email: payload.email })
      const response = await login(payload)
      return response
    },
    // mutationFn: async ({ email, password, roles }: Credentials) => {
    //   if (!email || !password) {
    //     throw new Error('Missing credentials')
    //   }
    //   const effectiveRoles = roles?.length ? roles : ['distributor']
    //   trackEvent('login_attempt', { roles: effectiveRoles })
    //   return delay({
    //     userName: email.split('@')[0],
    //     roles: effectiveRoles,
    //   })
    // },
    // onSuccess: ({ userName, roles }) => {
    //   authenticate({ userName, roles: roles as ('distributor' | 'editor')[] })
    //   trackEvent('login_success')
    //   showToast({
    //     id: 'login-success',
    //     title: '로그인 성공',
    //     description: '요청한 역할 권한을 반영했습니다.',
    //     autoDismiss: 4000,
    //   })
    // },
    onSuccess: async () => {
      try {
        // 로그인 성공 후 사용자 정보 가져오기
        const user = await getCurrentUser()

        const roles = user.role === 'editor' ? ['editor'] : ['distributor']

        authenticate({
          userName: user.username,
          roles: roles as ('distributor' | 'editor')[],
        })

        trackEvent('login_success', { userId: user.id })
        showToast({
          id: 'login_success',
          title: '로그인 성공',
          description: `${user.username}님, 환영합니다!`,
          autoDismiss: 4000,
        })
        navigate(routes.workspace)
      } catch (error) {
        // 사용자 정보 가져오기 실패 시에도 로그인은 성공한 상태
        console.error('Failed to fetch user info:', error)
        authenticate({
          userName: 'User',
          roles: ['distributor'],
        })
        trackEvent('login_success')
        showToast({
          id: 'login_success',
          title: '로그인 성공',
          description: '환영합니다!',
          autoDismiss: 4000,
        })
        navigate(routes.workspace)
      }
    },
    onError: (error: Error) => {
      // 에러 메시지 추출
      let errorMessage = '이메일 또는 비밀번호를 확인해주세요.'

      // ky 에러에서 메시지 추출 시도
      if (error instanceof Error) {
        // 백엔드에서 반환한 에러 메시지가 있을 수 있음
        const message = error.message
        if (message.includes('Incorrect') || message.includes('401')) {
          errorMessage = '이메일 또는 비밀번호가 올바르지 않습니다.'
        } else if (message) {
          errorMessage = message
        }
      }
      trackEvent('login_error', { error: errorMessage })
      showToast({
        id: 'login-error',
        title: '로그인 실패',
        description: errorMessage,
        autoDismiss: 4000,
      })
    },
  })
}

export function useSignupMutation() {
  const showToast = useUiStore((state) => state.showToast)
  const navigate = useNavigate()

  return useMutation({
    mutationKey: ['auth', 'signup'],
    mutationFn: async (payload: SignupPayload) => {
      trackEvent('signup_submit', { email: payload.email })
      return signup(payload)
    },
    onSuccess: (data) => {
      trackEvent('account_created', { userId: data.id })
      showToast({
        id: 'signup-success',
        title: '회원가입 완료',
        description: `${data.username}님, 환영합니다!`,
        autoDismiss: 4000,
      })
      navigate(routes.login)
    },
    onError: (error: Error) => {
      showToast({
        id: 'signup-error',
        title: '회원가입 실패',
        description: error.message || '회원가입 중 오류가 발생했습니다.',
        autoDismiss: 4000,
      })
    },
    // mutationFn: async ({ email, roles, userName, agreeTerms }: SignupPayload) => {
    //   if (!agreeTerms) {
    //     throw new Error('약관 동의가 필요합니다.')
    //   }
    //   const effectiveRoles = roles?.length ? roles : ['distributor']
    //   trackEvent('signup_submit', { roles: effectiveRoles })
    //   return delay({
    //     email,
    //     userName,
    //     roles: effectiveRoles,
    //   })
    // },
    // onSuccess: ({ userName, roles }) => {
    //   trackEvent('account_created', { roles })
    //   showToast({
    //     id: 'signup-success',
    //     title: '회원가입 완료',
    //     description: `${userName}님, 이메일 인증을 진행해주세요.`,
    //     autoDismiss: 4000,
    //   })
    // },
  })
}

export function useLogoutMutation() {
  const signOut = useAuthStore((state) => state.signOut)
  const showToast = useUiStore((state) => state.showToast)
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['auth', 'logout'],
    mutationFn: logout,
    onSuccess: () => {
      // 인증 상태 초기화
      signOut()
      
      // React Query 캐시 초기화
      queryClient.clear()
      
      showToast({
        id: 'logout-success',
        title: '로그아웃 완료',
        autoDismiss: 2000,
      })
      navigate(routes.home)
    },
    onError: (error) => {
      // API 호출 실패해도 로컬 상태는 초기화
      signOut()
      queryClient.clear()
      
      console.error('Logout error:', error)
      navigate(routes.home)
    },
  })
}
