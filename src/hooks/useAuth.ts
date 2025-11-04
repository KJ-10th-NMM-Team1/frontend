import { AuthContext } from '@/providers/AuthContext'
import type { AuthContextValue } from '@/types'
import { useContext } from 'react'

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return ctx
}
