/**
 * SSE Progress Event Types
 */

export type ProjectStatus = 'pending' | 'processing' | 'completed' | 'failed'

export interface ConnectedEvent {
  message: string
  timestamp: string
}

export interface TargetProgressEvent {
  eventType: 'target-progress'
  projectId: string
  projectTitle: string // 프로젝트 제목 (서버에서 제공)
  targetLang: string
  status: ProjectStatus
  progress: number // 0-100
  stage: string // e.g., "asr_completed", "tts_started"
  stageName: string // e.g., "음성 인식 완료", "음성 합성 시작"
  message: string
  timestamp: string
}

export interface ProjectProgressEvent {
  eventType: 'project-progress'
  projectId: string
  projectTitle: string // 프로젝트 제목 (서버에서 제공)
  status: ProjectStatus
  progress: number // 0-100 (average of all languages)
  message: string
  timestamp: string
}

export interface HeartbeatEvent {
  timestamp: string
  stats: {
    activeConnections: number
    totalEventsSent: number
  }
}

export interface ErrorEvent {
  error: string
  timestamp: string
}

// Store State Types
export interface TargetProgress {
  targetLang: string
  status: ProjectStatus
  progress: number
  stage: string
  stageName: string
  message: string
  timestamp: string
}

export interface ProjectProgress {
  projectId: string
  status: ProjectStatus
  overallProgress: number
  message: string
  timestamp: string
  targets: Record<string, TargetProgress> // keyed by targetLang
}

export interface ProjectProgressState {
  projects: Record<string, ProjectProgress> // keyed by projectId
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error'
  lastHeartbeat: string | null
  connectionError: string | null
}