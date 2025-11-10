import { useEffect, useState } from 'react'

import { useQuery } from '@tanstack/react-query'

import { useAuthStore } from '../../../shared/store/useAuthStore'
import { getCurrentUser } from '../api/authApi'

export function useAuthRestore() {
  const authenticate = useAuthStore((state) => state.authenticate)
  const [isRestoring, setIsRestoring] = useState(true)

  const { data: user, isError } = useQuery({
    queryKey: ['auth', 'current-user'],
    queryFn: getCurrentUser,
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
