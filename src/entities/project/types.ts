/**
 * 프로젝트 전체 상태 (워커에서 보내는 stage 값)
 * - 서버에서 string으로 전달되며, 워커의 현재 처리 단계를 나타냄
 * - 예: "starting", "asr_started", "translation_completed", "done", "failed"
 */
export type ProjectStatus = string

/**
 * 파이프라인 처리 단계
 */
export type PipelineStage =
  | 'starting'
  | 'upload'
  | 'vad'
  | 'asr_started'
  | 'asr_completed'
  | 'stt'
  | 'translation_started'
  | 'translation_completed'
  | 'mt'
  | 'rag'
  | 'voice_mapping'
  | 'tts_started'
  | 'tts_completed'
  | 'tts'
  | 'packaging'
  | 'outputs'
  | 'sync_started'
  | 'sync_completed'
  | 'mux_started'
  | 'mux_completed'
  | 'done'
  | 'failed'

interface ProjectThumbnail {
  kind: 's3' | 'external'
  key: string
  url: string
}

/**
 * 프로젝트 리스트 API 응답 (ProjectOut)
 */
export interface ProjectSummary {
  id: string
  title: string
  status: ProjectStatus
  dueDate: string
  assignedEditor?: string
  createdAt?: string
  description?: string
  tags?: string[]
  thumbnail?: ProjectThumbnail
  glosary_id?: string
  video_source?: string | null
  duration_seconds?: number | null
  issue_count: number
  targets: ProjectTarget[]
  source_language?: string | null
  created_at: Date
  speaker_count?: number | null
}

export type ProjectTargetStatus = 'pending' | 'processing' | 'completed' | 'failed'

/**
 * 타겟 언어 정보 (ProjectTarget)
 */
export interface ProjectTarget {
  target_id: string
  project_id: string
  language_code: string
  status: ProjectTargetStatus
  progress: number
}

export interface ProjectAsset {
  id: string
  languageCode: string
  type: 'preview_video' | 'subtitle_srt' | 'dubbed_audio'
  file_path: string
  duration: number
  codec: string
  resolution: string
  sizeMb: number
}

export interface ProjectPayload {
  owner_id: string
  title: string
  sourceType: 'file' | 'youtube'
  youtubeUrl?: string
  fileName?: string
  fileSize?: number
  speakerCount: number
  detectAutomatically: boolean
  replaceVoiceSamples: boolean
  sourceLanguage?: string | null
  targetLanguages: string[]
  tags?: string[]
}

export interface ProjectDetail extends ProjectSummary {
  speaker_count: number
  assets: ProjectAsset[]
  description?: string
  tags?: string[]
}

export interface ProjectResponse extends ProjectDetail {
  project_id: string
}

export type ProjectsResponse = {
  items: ProjectSummary[]
}

export interface PrepareUploadPayload {
  projectId: string
  fileName: string
  contentType: string
}

export interface PrepareUploadResponse {
  project_id: string
  upload_url: string
  object_key: string
  fields?: Record<string, string>
}

export interface RegisterYoutubeSourcePayload {
  projectId: string
  youtubeUrl: string
}

export interface RegisterYoutubeSourceResponse {
  projectId: string
  status: ProjectStatus
}

export interface FinishUploadPayload {
  projectId: string
  objectKey: string
}

export interface FinishUploadResponse {
  projectId: string
  status: ProjectStatus
}

export const sampleProjects: ProjectDetail[] = [
  {
    id: 'proj-1001',
    title: 'AI Voice-over Launch Trailer',
    duration_seconds: 126,
    status: 'completed',
    source_language: 'ko',
    dueDate: '2025-02-06',
    assignedEditor: 'translator-amy',
    description:
      'Marketing trailer localisation for the upcoming AI voice-over suite. Includes three regional variants and a shared glossary.',
    createdAt: '2025-01-15T10:00:00Z',
    created_at: new Date('2025-01-15T10:00:00Z'),
    video_source: 'https://www.w3schools.com/html/mov_bbb.mp4',
    speaker_count: 3,
    thumbnail: {
      kind: 'external',
      key: '',
      url: 'https://images.unsplash.com/photo-1487528278747-ba99ed528ebc?auto=format&fit=crop&w=1200&q=80',
    },
    issue_count: 0,
    assets: [
      {
        id: 'asset-en-video',
        languageCode: 'en',
        type: 'preview_video',
        file_path: 'https://archive.org/download/ElephantsDream/ed_1024_512kb.mp4',
        duration: 126,
        codec: 'H.264',
        resolution: '1920x1080',
        sizeMb: 210,
      },
      {
        id: 'asset-en-subtitle',
        languageCode: 'en',
        type: 'subtitle_srt',
        file_path: '',
        duration: 126,
        codec: 'H.264',
        resolution: '1920x1080',
        sizeMb: 208,
      },
      {
        id: 'asset-ja-video',
        languageCode: 'ja',
        type: 'preview_video',
        file_path: 'https://samplelib.com/lib/preview/mp4/sample-5s.mp4',
        duration: 126,
        codec: 'H.264',
        resolution: '1920x1080',
        sizeMb: 212,
      },
      {
        id: 'asset-ja-subtitle',
        languageCode: 'ja',
        type: 'subtitle_srt',
        file_path: '',
        duration: 126,
        codec: 'H.264',
        resolution: '1920x1080',
        sizeMb: 208,
      },
    ],
    targets: [
      {
        target_id: 't-en',
        project_id: 'proj-1001',
        language_code: 'en',
        status: 'completed',
        progress: 100,
      },
      {
        target_id: 't-ja',
        project_id: 'proj-1001',
        language_code: 'ja',
        status: 'completed',
        progress: 100,
      },
    ],
    tags: ['게임', '튜토리얼'],
  },
]
