export type RoleType = 'owner' | 'translator' | 'reviewer'

export interface User {
  id: string
  name: string
  role: RoleType
  avatarUrl?: string
  languages?: string[]
}

export interface ProjectMember {
  id: string
  name: string
  role: RoleType
  assignedLanguages?: string[]
}

export type LanguageStatus = 'pending' | 'processing' | 'review' | 'completed'

export interface Language {
  code: string
  name: string
  subtitle: boolean
  dubbing: boolean
  progress?: number
  status?: LanguageStatus
  translatorId?: string
  translator?: string
  reviewerId?: string
  deadline?: string
  translationReviewed?: boolean
  voiceConfig?: Record<string, { voiceId?: string; preserveTone: boolean }>
}
export interface STTSegment {
  id: string
  startTime: string
  endTime: string
  text: string
  speaker?: string
  confidence: number
}

export type TranslationIssueType = 'term' | 'length' | 'number' | 'tone'

export type TranslationIssueSeverity = 'warning' | 'error'

export interface TranslationIssue {
  type: TranslationIssueType
  severity: TranslationIssueSeverity
  message: string
  suggestion?: string
}

export interface CorrectionSuggestion {
  id: string
  text: string
  reason: string
}

export interface TermCorrection {
  id: string
  original: string
  replacement: string
  reason?: string
}

export interface Translation {
  id: string
  timestamp: string
  original: string
  translated: string
  confidence: number
  issues: TranslationIssue[]
  speaker?: string
  segmentDurationSeconds?: number
  originalSpeechSeconds?: number
  translatedSpeechSeconds?: number
  correctionSuggestions?: CorrectionSuggestion[]
  termCorrections?: TermCorrection[]

  // 백엔드 세그먼트 PK (없으면 기존 id를 임시로 사용)
  segmentId?: string
  // 미리보기 상태/결과
  preview?: {
    jobId?: string
    status: 'pending' | 'processing' | 'completed' | 'failed'
    videoUrl?: string
    audioUrl?: string
    updatedAt?: string
  }
}

export type ProjectStatus = 'uploading' | 'processing' | 'completed' | 'failed'

export interface Project {
  id: string
  name: string
  languages: Language[]
  status: ProjectStatus
  uploadProgress?: number
  createdAt: string
  thumbnail?: string
  members?: ProjectMember[]
  seriesTitle?: string
  episodeTitle?: string
  deadline?: string
  reviewerId?: string
  ownerId?: string
}
