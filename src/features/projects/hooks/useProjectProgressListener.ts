import { useEffect, useRef, useCallback } from 'react'

import { useQueryClient } from '@tanstack/react-query'

import type { ProjectSummary } from '@/entities/project/types'
import { env } from '@/shared/config/env'
import { queryKeys } from '@/shared/config/queryKeys'
import { useNotificationStore } from '@/shared/store/useNotificationStore'
import { useUiStore } from '@/shared/store/useUiStore'

import { getLanguageDisplayName, NOTIFICATION_MESSAGES } from '../constants/notificationMessages'
import { useProjectProgressStore } from '../stores/useProjectProgressStore'
import type { ProjectProgressEvent, TargetProgressEvent } from '../types/progress'

import {
  createProjectCompletionChecker,
  createTargetCompletionChecker,
} from './utils/progressCompletion'
import {
  createConnectedHandler,
  createErrorMessageHandler,
  createHeartbeatHandler,
  createProjectProgressHandler,
  createTargetProgressHandler,
} from './utils/progressEventHandlers'
import { createConnectionErrorHandler, createReconnectionHandler } from './utils/sseReconnection'

export interface UseProjectProgressListenerOptions {
  projectId?: string // Optional: subscribe to specific project only
  enabled?: boolean // Default: true
  onTargetComplete?: (projectId: string, targetLang: string, message: string) => void
  onProjectComplete?: (projectId: string, message: string) => void
}

/**
 * SSE 연결을 통해 프로젝트 진행도 이벤트를 구독하는 훅
 *
 * @param options - 구독 옵션
 * @returns void
 *
 * @example
 * // 전체 프로젝트 구독 (대시보드)
 * useProjectProgressListener()
 *
 * // 특정 프로젝트만 구독
 * useProjectProgressListener({ projectId: 'project-123' })
 *
 * // 완료 콜백과 함께 사용
 * useProjectProgressListener({
 *   onTargetComplete: (projectId, targetLang) => {
 *     console.log(`${projectId}의 ${targetLang} 작업 완료!`)
 *   }
 * })
 */
export function useProjectProgressListener({
  projectId,
  enabled = true,
  onTargetComplete,
  onProjectComplete,
}: UseProjectProgressListenerOptions = {}) {
  const eventSourceRef = useRef<EventSource | null>(null)
  const previousTargetStatusRef = useRef<Map<string, string>>(new Map())
  const previousProjectStatusRef = useRef<Map<string, string>>(new Map())
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>()
  const reconnectAttemptsRef = useRef(0)
  const connectRef = useRef<() => void>()

  const queryClient = useQueryClient()
  const showToast = useUiStore((state) => state.showToast)
  const addNotification = useNotificationStore((state) => state.addNotification)
  const {
    setConnectionStatus,
    setConnectionError,
    setLastHeartbeat,
    updateTargetProgress,
    updateProjectProgress,
  } = useProjectProgressStore()

  // Create completion checkers
  const checkTargetCompletion = useCallback(
    (event: TargetProgressEvent) => {
      const checker = createTargetCompletionChecker(
        previousTargetStatusRef.current,
        (projectId, projectTitle, targetLang, message) => {
          // 서버에서 제공하는 projectTitle 사용 (캐시 불필요)
          const languageDisplay = getLanguageDisplayName(targetLang)

          // 알림 메시지 생성
          const notificationMessage = NOTIFICATION_MESSAGES.TARGET_COMPLETED(
            projectTitle,
            languageDisplay,
            targetLang,
          )

          // 토스트 표시 (초록색 성공 토스트)
          showToast({
            id: `target-completed-${projectId}:${targetLang}`,
            title: '더빙 생성이 완료되었습니다',
            description: notificationMessage,
            autoDismiss: 6000,
            variant: 'success',
          })

          // 알림 저장
          addNotification({
            type: 'success',
            title: '더빙 생성이 완료되었습니다',
            message: notificationMessage,
            projectId,
            targetLanguage: targetLang,
          })

          onTargetComplete?.(projectId, targetLang, message)
        },
      )
      checker(event)
    },
    [showToast, addNotification, onTargetComplete],
  )

  const checkProjectCompletion = useCallback(
    (event: ProjectProgressEvent) => {
      const checker = createProjectCompletionChecker(
        previousProjectStatusRef.current,
        (projectId, message) => {
          // showToast({
          //   id: `project-completed-${projectId}`,
          //   title: '프로젝트 완료',
          //   description: message,
          //   autoDismiss: 6000,
          // })
          onProjectComplete?.(projectId, message)
        },
      )
      checker(event)
    },
    [onProjectComplete],
  )

  // Connect to SSE
  const connect = useCallback(() => {
    if (!enabled || eventSourceRef.current?.readyState === EventSource.OPEN) return

    // Close existing connection if any
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
      eventSourceRef.current = null
    }

    // Build URL with optional project_id query param
    const url = new URL(`${env.apiBaseUrl}/api/progress/events`)
    if (projectId) {
      url.searchParams.set('project_id', projectId)
    }

    console.log('[SSE] Connecting to progress events:', url.toString())
    setConnectionStatus('connecting')

    const eventSource = new EventSource(url.toString(), {
      withCredentials: true,
    })

    // Dependencies for event handlers
    const deps = {
      setConnectionStatus,
      setConnectionError,
      setLastHeartbeat,
      updateTargetProgress,
      updateProjectProgress,
      showToast,
      checkTargetCompletion,
      checkProjectCompletion,
    }

    // Register event handlers
    eventSource.addEventListener(
      'connected',
      createConnectedHandler(deps, reconnectAttemptsRef, showToast),
    )

    eventSource.addEventListener('target-progress', createTargetProgressHandler(deps))

    eventSource.addEventListener('project-progress', createProjectProgressHandler(deps))

    eventSource.addEventListener('heartbeat', createHeartbeatHandler(deps))

    eventSource.addEventListener('error-message', createErrorMessageHandler(deps))

    // Handle connection errors with reconnection logic
    const attemptReconnect = createReconnectionHandler(
      reconnectAttemptsRef,
      reconnectTimeoutRef,
      setConnectionStatus,
      showToast,
      () => connectRef.current?.(), // Use ref to avoid circular dependency
    )

    eventSource.onerror = createConnectionErrorHandler(
      eventSource,
      setConnectionStatus,
      attemptReconnect,
    )

    eventSourceRef.current = eventSource
  }, [
    enabled,
    projectId,
    setConnectionStatus,
    setConnectionError,
    setLastHeartbeat,
    updateTargetProgress,
    updateProjectProgress,
    checkTargetCompletion,
    checkProjectCompletion,
    showToast,
  ])

  // Store connect function in ref
  connectRef.current = connect

  // Cleanup on unmount or when dependencies change
  useEffect(() => {
    if (enabled) {
      connect()
    }

    // Cleanup function
    const cleanup = () => {
      console.log('[SSE] Cleanup: Closing connection')

      // Clear reconnect timeout - access ref directly
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
        reconnectTimeoutRef.current = undefined
      }

      // Close EventSource - access ref directly, not captured value
      if (eventSourceRef.current) {
        console.log('[SSE] Closing EventSource with readyState:', eventSourceRef.current.readyState)
        eventSourceRef.current.close()
        eventSourceRef.current = null
      }

      // Reset connection status
      setConnectionStatus('disconnected')
      setConnectionError(null)

      // Reset reconnect attempts on cleanup
      reconnectAttemptsRef.current = 0
    }

    // Handle page unload/refresh
    const handleBeforeUnload = () => {
      console.log('[SSE] Page unloading - closing connection')
      if (eventSourceRef.current) {
        eventSourceRef.current.close()
        eventSourceRef.current = null
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      cleanup()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, projectId]) // Removed store setters from deps to prevent unnecessary re-renders

  // Return connection status for component use
  const connectionStatus = useProjectProgressStore((state) => state.connectionStatus)
  const connectionError = useProjectProgressStore((state) => state.connectionError)

  return { connectionStatus, connectionError }
}
