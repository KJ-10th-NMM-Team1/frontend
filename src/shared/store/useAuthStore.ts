import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

type UserRole = 'distributor' | 'editor'

type AuthState = {
  isAuthenticated: boolean
  roles: UserRole[]
  userName?: string
  authenticate: (payload: { userName: string; roles: UserRole[] }) => void
  signOut: () => void
}

export const useAuthStore = create<AuthState>()(
  devtools((set) => ({
    isAuthenticated: false,
    roles: [],
    userName: undefined,
    authenticate: ({ userName, roles }) =>
      set(
        {
          isAuthenticated: true,
          userName,
          roles,
        },
        false,
        { type: 'auth/authenticate', payload: roles },
      ),
    signOut: () =>
      set(
        {
          isAuthenticated: false,
          roles: [],
          userName: undefined,
        },
        false,
        { type: 'auth/signOut' },
      ),
  })),
)

export type { UserRole }
