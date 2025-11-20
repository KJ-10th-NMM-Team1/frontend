import type {
  ConnectedEvent,
  ErrorEvent,
  HeartbeatEvent,
  ProjectProgressEvent,
  TargetProgressEvent,
} from '../../types/progress'

export interface EventHandlerDependencies {
  setConnectionStatus: (status: 'connecting' | 'connected' | 'disconnected' | 'error') => void
  setConnectionError: (error: string | null) => void
  setLastHeartbeat: (timestamp: string) => void
  updateTargetProgress: (
    projectId: string,
    targetLang: string,
    progress: {
      status: 'pending' | 'processing' | 'completed' | 'failed'
      progress: number
      stage: string
      stageName: string
      message: string
      timestamp: string
    },
  ) => void
  updateProjectProgress: (
    projectId: string,
    status: 'pending' | 'processing' | 'completed' | 'failed',
    overallProgress: number,
    message: string,
    timestamp: string,
  ) => void
  showToast: (options: {
    id: string
    title: string
    description: string
    autoDismiss?: number
  }) => void
  checkTargetCompletion: (event: TargetProgressEvent) => void
  checkProjectCompletion: (event: ProjectProgressEvent) => void
}

/**
 * Connected 이벤트 핸들러 생성
 */
export function createConnectedHandler(
  deps: Pick<EventHandlerDependencies, 'setConnectionStatus' | 'setConnectionError'>,
  reconnectAttemptsRef: React.MutableRefObject<number>,
  showToast: EventHandlerDependencies['showToast'],
) {
  return (event: MessageEvent) => {
    try {
      const data = JSON.parse(event.data as string) as ConnectedEvent
      console.log('[SSE] Connected:', data.message)

      deps.setConnectionStatus('connected')
      deps.setConnectionError(null)
      reconnectAttemptsRef.current = 0

      // Show success toast only on reconnection
      if (reconnectAttemptsRef.current > 0) {
        showToast({
          id: 'sse-reconnected',
          title: '연결 복구',
          description: '실시간 진행도 업데이트가 재개되었습니다.',
          autoDismiss: 3000,
        })
      }
    } catch (error) {
      console.error('[SSE] Failed to parse connected event:', error)
    }
  }
}

/**
 * Target Progress 이벤트 핸들러 생성
 */
export function createTargetProgressHandler(
  deps: Pick<EventHandlerDependencies, 'updateTargetProgress' | 'checkTargetCompletion'>,
) {
  return (event: MessageEvent) => {
    try {
      const data = JSON.parse(event.data as string) as TargetProgressEvent
      console.log('[SSE] Target progress:', data)

      // Update store
      deps.updateTargetProgress(data.projectId, data.targetLang, {
        status: data.status,
        progress: data.progress,
        stage: data.stage,
        stageName: data.stageName,
        message: data.message,
        timestamp: data.timestamp,
      })

      // Check for completion
      deps.checkTargetCompletion(data)
    } catch (error) {
      console.error('[SSE] Failed to parse target-progress event:', error)
    }
  }
}

/**
 * Project Progress 이벤트 핸들러 생성
 */
export function createProjectProgressHandler(
  deps: Pick<EventHandlerDependencies, 'updateProjectProgress' | 'checkProjectCompletion'>,
) {
  return (event: MessageEvent) => {
    try {
      const data = JSON.parse(event.data as string) as ProjectProgressEvent
      console.log('[SSE] Project progress:', data)

      // Update store
      deps.updateProjectProgress(
        data.projectId,
        data.status,
        data.progress,
        data.message,
        data.timestamp,
      )

      // Check for completion
      deps.checkProjectCompletion(data)
    } catch (error) {
      console.error('[SSE] Failed to parse project-progress event:', error)
    }
  }
}

/**
 * Heartbeat 이벤트 핸들러 생성
 */
export function createHeartbeatHandler(
  deps: Pick<EventHandlerDependencies, 'setLastHeartbeat'>,
) {
  return (event: MessageEvent) => {
    try {
      const data = JSON.parse(event.data as string) as HeartbeatEvent
      console.log('[SSE] Heartbeat:', data.stats)
      deps.setLastHeartbeat(data.timestamp)
    } catch (error) {
      console.error('[SSE] Failed to parse heartbeat event:', error)
    }
  }
}

/**
 * Error Message 이벤트 핸들러 생성
 */
export function createErrorMessageHandler(
  deps: Pick<EventHandlerDependencies, 'setConnectionError' | 'showToast'>,
) {
  return (event: MessageEvent) => {
    try {
      const data = JSON.parse(event.data as string) as ErrorEvent
      console.error('[SSE] Server error:', data.error)
      deps.setConnectionError(data.error)

      deps.showToast({
        id: 'sse-server-error',
        title: '서버 오류',
        description: data.error,
        autoDismiss: 5000,
      })
    } catch (error) {
      console.error('[SSE] Failed to parse error-message event:', error)
    }
  }
}