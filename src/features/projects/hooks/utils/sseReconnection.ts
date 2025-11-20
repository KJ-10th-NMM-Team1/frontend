/**
 * SSE 재연결 로직
 */
export function createReconnectionHandler(
  reconnectAttemptsRef: React.MutableRefObject<number>,
  reconnectTimeoutRef: React.MutableRefObject<NodeJS.Timeout | undefined>,
  setConnectionStatus: (status: 'connecting' | 'connected' | 'disconnected' | 'error') => void,
  showToast: (options: { id: string; title: string; description: string; autoDismiss?: number }) => void,
  reconnect: () => void,
) {
  return () => {
    // Maximum 10 reconnect attempts to prevent infinite loops
    const MAX_RECONNECT_ATTEMPTS = 10

    if (reconnectAttemptsRef.current >= MAX_RECONNECT_ATTEMPTS) {
      console.log(`[SSE] Maximum reconnection attempts (${MAX_RECONNECT_ATTEMPTS}) reached. Stopping reconnection.`)
      setConnectionStatus('error')
      showToast({
        id: 'sse-max-attempts',
        title: '연결 실패',
        description: 'SSE 서버에 연결할 수 없습니다. 나중에 다시 시도해주세요.',
        autoDismiss: 10000,
      })
      return
    }

    reconnectAttemptsRef.current++
    const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000)

    console.log(`[SSE] Reconnecting in ${delay}ms (attempt ${reconnectAttemptsRef.current}/${MAX_RECONNECT_ATTEMPTS})`)

    if (reconnectAttemptsRef.current === 1) {
      showToast({
        id: 'sse-disconnected',
        title: '연결 끊김',
        description: '실시간 진행도 업데이트가 일시적으로 중단되었습니다. 재연결 시도 중...',
        autoDismiss: 5000,
      })
    }

    reconnectTimeoutRef.current = setTimeout(() => {
      reconnect()
    }, delay)
  }
}

/**
 * SSE 연결 오류 핸들러 생성
 */
export function createConnectionErrorHandler(
  eventSource: EventSource,
  setConnectionStatus: (status: 'connecting' | 'connected' | 'disconnected' | 'error') => void,
  attemptReconnect: () => void,
) {
  return (event: Event) => {
    console.error('[SSE] Connection error occurred')

    // Handle connection state
    if (eventSource.readyState === EventSource.CLOSED) {
      console.log('[SSE] Connection closed')
      setConnectionStatus('disconnected')
      attemptReconnect()
    } else {
      setConnectionStatus('error')
    }
  }
}