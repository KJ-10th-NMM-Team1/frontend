import { useState, useRef, useEffect } from 'react'

// url -> SSE 엔드 포인터, T -> 서버에서 받을 데이터의 타입
export function useSSE<T>(url: string) {
  const [data, setData] = useState<T | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const eventSourceRef = useRef<EventSource | null>(null)
  const reconnectTimeoutRef = useRef<number | null>(null)


  // cleanup 함수
  const disconnect = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
      eventSourceRef.current = null
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }
    setIsConnected(false)
  }

  // 마운트 시 자동 연결
  useEffect(() => {
    // connect 함수
    const connect = () => {
      // 기존 연결이 있으면 닫기
      if (eventSourceRef.current) {
        eventSourceRef.current.close()
      }
      try {
        console.log('SSE connecting to:', url)
        const eventSource = new EventSource(url)
        eventSourceRef.current = eventSource
      
        // 연결 성공
        eventSource.onopen = () => {
          setIsConnected(true)
          setError(null)
        }
      
        // 메시지 받기
        eventSource.onmessage = (event) => {
          try {
            // SSE data: 접두사 제거 및 HTML 엔티티 디코딩
            const decodedData = event.data
          
            // 문자열이 유효한 JSON인지 확인
            if (decodedData.trim().startsWith('{') && decodedData.trim().endsWith('}')) {
              const parseData = JSON.parse(decodedData)
              setData(parseData)
            } else {
              // JSON이 아닌 데이터는 무시
            }
          } catch (err) {
            console.error('Failed to parse SSE message', err, 'Raw data:', event.data)
          }
        }
        // 연결 오류
        eventSource.onerror = () => {
          setIsConnected(false)
          setError('Connection error')
        
          // 3초 후 자동 재연결
          if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current)
          }
          reconnectTimeoutRef.current = setTimeout(() => {
            connect()
          }, 3000)
        }
      } catch (err) {
        setError('Failed to create EventSource', err)
      }
    }
    connect()
    return disconnect
  }, [url])

  return {
    data,
    isConnected,
    error,
  }
}
