import ky, { HTTPError } from 'ky'
import type { KyInstance, Options } from 'ky'

import { env } from '../config/env'

// refresh token 갱신 중 플래그 (동시 요청 방지)
let isRefreshing = false
let refreshPromise: Promise<void> | null = null

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

// refresh token으로 access token 갱신
async function refreshAccessToken(): Promise<void> {
  // 이미 갱신 중이면 기존 Promise 반환
  if (isRefreshing && refreshPromise) {
    return refreshPromise
  }

  isRefreshing = true
  refreshPromise = (async () => {
    try {
      // refresh token 엔드포인트 호출 (별도 클라이언트 사용하여 무한 루프 방지)
      const refreshClient = ky.create({
        prefixUrl: env.apiBaseUrl,
        timeout: 15_000,
        credentials: 'include',
        hooks: {
          beforeRequest: [
            (request) => {
              request.headers.set('Accept', 'application/json')
              request.headers.set('Content-Type', 'application/json')
            },
          ],
        },
      })

      await refreshClient.post('api/auth/refresh', {}).json<{ message: string }>()
    } finally {
      isRefreshing = false
      refreshPromise = null
    }
  })()

  return refreshPromise
}

// 원래 요청을 재시도하는 함수
async function retryRequest(originalRequest: Request): Promise<Response> {
  const method = originalRequest.method
  const url = originalRequest.url
  const headers = new Headers(originalRequest.headers)

  // Content-Type이 JSON인 경우 body를 JSON으로 파싱
  let body: BodyInit | undefined = undefined
  if (originalRequest.body) {
    if (originalRequest.body instanceof FormData) {
      body = originalRequest.body
    } else {
      try {
        const text = await originalRequest.clone().text()
        if (text) {
          if (headers.get('Content-Type')?.includes('application/json')) {
            body = text
          } else {
            body = originalRequest.body
          }
        }
      } catch {
        body = originalRequest.body
      }
    }
  }

  // fetch를 직접 사용하여 재시도
  return fetch(url, {
    method,
    headers,
    body,
    credentials: 'include',
  })
}

export const apiClient: KyInstance = ky.create({
  prefixUrl: env.apiBaseUrl,
  timeout: 15_000,
  credentials: 'include', // 쿠키 전송
  hooks: {
    beforeRequest: [
      (request) => {
        request.headers.set('Accept', 'application/json')
        // Content-Type은 body가 있을 때만 설정 (FormData는 자동으로 설정됨)
        if (!request.body || request.body instanceof FormData) {
          // FormData는 Content-Type을 자동으로 설정하므로 제거
        } else {
          request.headers.set('Content-Type', 'application/json')
        }
        handleRequestLogging(request)
      },
    ],
    beforeError: [
      async (error) => {
        // 401 에러이고 refresh 엔드포인트가 아닌 경우에만 갱신 시도
        if (error instanceof HTTPError && error.response.status === 401) {
          const requestUrl = error.request.url
          if (
            !requestUrl.includes('/api/auth/refresh') &&
            !requestUrl.includes('/api/auth/login')
          ) {
            try {
              // refresh token으로 access token 갱신
              await refreshAccessToken()

              // 원래 요청 재시도
              const retryResponse = await retryRequest(error.request)

              if (retryResponse.ok) {
                return error // 일단 원래 에러 반환 (재시도는 호출하는 쪽에서 처리)
              }

              return error
            } catch (refreshError) {
              // refresh 실패 시 원래 에러 반환
              return error
            }
          }
        }
        return error
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
