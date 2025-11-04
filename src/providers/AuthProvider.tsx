import type { AuthContextValue, AuthUser } from '@/types'
import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { fetchCurrentUser } from './auth-api'
import { AuthContext } from './AuthContext'

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const refresh = useCallback(async () => {
    setIsLoading(true)
    try {
      const me = await fetchCurrentUser()
      setUser(me)
    } catch (error) {
      console.error('Failed to fetch current user', error)
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      setUser,
      isLoading,
      setIsLoading,
      refresh,
    }),
    [user, isLoading, refresh]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
