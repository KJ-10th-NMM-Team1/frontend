import ky from 'ky'
import type { KyInstance, Options } from 'ky'

import { env } from '../config/env'

function handleRequestLogging(request: Request) {
  if (import.meta.env.DEV) {
    console.debug('[api] request', request.method, request.url)
  }
}

function handleErrorLogging(error: Error) {
  if (import.meta.env.DEV) {
    console.error('[api] error', error)
  }
}

export const apiClient: KyInstance = ky.create({
  prefixUrl: env.apiBaseUrl,
  timeout: 15_000,
  credentials: 'include', // 쿠키 전송
  hooks: {
    beforeRequest: [
      (request) => {
        request.headers.set('Accept', 'application/json')
        request.headers.set('Content-Type', 'application/json')
        // const token = localStorage.getItem('demo-token')
        // if (typeof token === 'string' && token.length > 0) {
        //   request.headers.set('Authorization', `Bearer${token}`)
        // }
        handleRequestLogging(request)
      },
    ],
    afterResponse: [
      (_request, _options, response) => {
        if (!response.ok && response.status >= 500) {
          handleErrorLogging(new Error(`Server error: ${response.status}`))
        }
      },
    ],
  },
  retry: {
    limit: 3,
    methods: ['get', 'post', 'put', 'patch', 'delete'],
    statusCodes: [408, 413, 429, 500, 502, 503, 504],
    backoffLimit: 5000,
    delay: (attemptCount) => Math.min(1000 * 2 ** (attemptCount - 1), 5000),
  },
})

export function apiGet<T>(input: string, options?: Options): Promise<T> {
  return apiClient.get(input, options).json<T>()
}

export function apiPost<T>(input: string, json: unknown, options?: Options): Promise<T> {
  return apiClient.post(input, { json, ...options }).json<T>()
}
