import { useEffect, useState } from 'react'

import { useQuery } from '@tanstack/react-query'
import { HTTPError } from 'ky'

import { useAuthStore } from '../../../shared/store/useAuthStore'
import { getCurrentUser, refreshToken } from '../api/authApi'

export function useAuthRestore() {
  const authenticate = useAuthStore((state) => state.authenticate)
  const [isRestoring, setIsRestoring] = useState(true)

  const {
    data: user,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['auth', 'current-user'],
    queryFn: async () => {
      try {
        return await getCurrentUser()
      } catch (err) {
        // 401 에러이고 refresh token이 있으면 refresh 시도
        if (err instanceof HTTPError && err.response.status === 401) {
          try {
            // refresh token으로 access token 갱신
            await refreshToken()
            // 갱신 후 다시 사용자 정보 가져오기
            return await getCurrentUser()
          } catch (refreshError) {
            // refresh 실패 시 원래 에러 throw
            throw err
          }
        }
        throw err
      }
    },
    retry: false,
    staleTime: Infinity,
  })

  useEffect(() => {
    if (user) {
      // 사용자 정보가 있으면 인증 상태 복원
      const roles = user.role === 'editor' ? ['editor'] : ['distributor']
      authenticate({
        userName: user.username,
        roles: roles as ('distributor' | 'editor')[],
      })
      setIsRestoring(false)
    } else if (isError) {
      // 사용자 정보가 없거나 에러면 인증되지 않은 상태
      setIsRestoring(false)
    }
  }, [user, isError, authenticate])

  return { isRestoring }
}
