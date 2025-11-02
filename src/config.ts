const DEFAULT_API_BASE_URL = 'http://localhost:8000'

const rawBaseUrl = import.meta.env.VITE_API_BASE_URL as string | undefined

const normalisedBaseUrl = rawBaseUrl?.replace(/\/+$/, '') || DEFAULT_API_BASE_URL

export function getApiUrl(path: string): string {
  const normalisedPath = path.startsWith('/') ? path : `/${path}`
  return `${normalisedBaseUrl}${normalisedPath}`
}

export const config = {
  apiBaseUrl: normalisedBaseUrl,
}
