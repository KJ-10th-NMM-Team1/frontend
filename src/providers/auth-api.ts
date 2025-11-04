import { getApiUrl } from '@/config'
import { handleResponse } from '@/lib/http'
import type { AuthUser } from '@/types'

interface RawAuthUser {
  _id: string
  username?: string
  email?: string
  role?: string
}

const mapAuthUser = (raw: RawAuthUser): AuthUser => ({
  code: raw._id,
  name: raw.username ?? '',
  email: raw.email,
  role: raw.role === 'translator' ? 'translator' : 'owner',
})

export async function fetchCurrentUser(): Promise<AuthUser> {
  const res = await fetch(getApiUrl('/api/auth/me'), {
    method: 'GET',
    credentials: 'include',
  })
  const raw = await handleResponse<RawAuthUser>(res)
  return mapAuthUser(raw)
}
