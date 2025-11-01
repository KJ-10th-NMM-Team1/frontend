import { useState, useCallback, useEffect } from 'react'
import axios, { AxiosRequestConfig, AxiosError } from 'axios'

// API 상태를 위한 인터페이스
interface UseAxiosState<T> {
  data: T | null
  error: AxiosError | Error | null
  loading: boolean
}

// Execute 함수가 반환할 결과 타입
interface ExecuteResult<T> {
  success: boolean
  response?: T
  error?: AxiosError | Error
}

// Execute 함수의 시그너처 (Payload 타입 <P>)
type ExecuteFunction<T, P> = (
  payload?: P,
  configOberride?: AxiosRequestConfig
) => Promise<ExecuteResult<T>>

// useAxios 훅(응답 타입 <T>, 페이로드 타입 <P>)
export function useAxios<T, P = unknown>(
  defaultConfig: AxiosRequestConfig
): [ExecuteFunction<T, P>, UseAxiosState<T>] {
  const [state, setState] = useState<UseAxiosState<T>>({
    data: null,
    error: null,
    loading: false,
  })

  // AbortController: 컴포넌트 unmount 시 요청 취소
  const [controller, setController] = useState(new AbortController())

  const execute = useCallback(
    async (payload?: P, configOverride: AxiosRequestConfig = {}): Promise<ExecuteResult<T>> => {
      // 이전 요청이 있다면 취소
      if (state.loading) {
        controller.abort()
      }
      const newController = new AbortController()
      setController(newController)

      setState({ data: null, error: null, loading: true })

      // 기본 설정과 오버라이드 설정 병합
      const config: AxiosRequestConfig = {
        ...defaultConfig,
        ...configOverride,
        signal: newController.signal,
      }

      // 메서드에 따라 payload를 'data' (body) 또는 'params' (query)로 할당
      const method = (config.method || 'GET').toUpperCase()
      if (payload) {
        if (['POST', 'PUT', 'PATCH'].includes(method)) {
          config.data = payload
        } else {
          config.params = payload
        }
      }
      try {
        // Axios 호출 (axios<T>로 응답 데이터 타입을 T 로 지정)
        const response = await axios<T>(config)

        setState({ data: response.data, error: null, loading: false })
        return { success: true, response: response.data }
      } catch (err) {
        if (axios.isCancel(err)) {
          console.log('Axios request canceled:', err.message)
          return { success: false, error: err as Error }
        }
        // AxiosError 또는 일반 Error로 타입 캐스팅
        const error = err as AxiosError | Error
        setState({ data: null, error: error, loading: false })
        return { success: false, error: error }
      }
    },
    [defaultConfig, state.loading, controller]
  )

  useEffect(() => {
    return () => controller.abort()
  }, [controller])
  return [execute, state]
}
