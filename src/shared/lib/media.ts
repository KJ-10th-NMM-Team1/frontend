import { env } from '@/shared/config/env'

const ABSOLUTE_URL_REGEX = /^https?:\/\//i

const encodeKey = (key: string) =>
  key
    .split('/')
    .filter((segment, index) => segment.length > 0 || index === 0)
    .map((segment) => encodeURIComponent(segment))
    .join('/')

export function resolveMediaUrl(source?: string) {
  if (!source) return undefined
  if (ABSOLUTE_URL_REGEX.test(source)) return source
  const normalized = source.replace(/^\/+/, '')
  const encoded = encodeKey(normalized)
  return `${env.apiBaseUrl}/api/storage/media/${encoded}`
}
