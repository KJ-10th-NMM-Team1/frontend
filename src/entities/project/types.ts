export type ProjectStatus =
  | 'uploading'
  | 'processing'
  | 'uploaded'
  | 'editing'
  | 'done'
  | 'failed'

interface ProjectThumbnail {
  kind: 's3' | 'external'
  key: string
  url: string
}

export interface ProjectSummary {
  id: string
  title: string
  owner_id: string
  source_type: 'file' | 'youtube'
  duration_seconds: number
  status: ProjectStatus
  source_language: string
  dueDate: string
  assignedEditor?: string
  createdAt?: string
  video_source?: string
  // thumbnailUrl?: string
  targets?: ProjectTarget[]
  thumbnail?: ProjectThumbnail
  glosary_id?: string
  created_at: Date
}

export type ProjectTargetStatus = 'pending' | 'processing' | 'completed' | 'failed'

export interface ProjectTarget {
  id: string
  projectId: string
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
  sourceLanguage?: string | null
  targetLanguages: string[]
}

export interface ProjectDetail extends ProjectSummary {
  speaker_count: number
  assets: ProjectAsset[]
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
    sourceLanguage: 'ko',
    status: 'completed',
    video_source: 'https://www.w3schools.com/html/mov_bbb.mp4',
    dueDate: '2025-02-06',
    assignedEditor: 'translator-amy',
    description:
      'Marketing trailer localisation for the upcoming AI voice-over suite. Includes three regional variants and a shared glossary.',
    createdAt: '2025-01-15T10:00:00Z',
    speakerCount: 3,
    thumbnailUrl:
      'https://images.unsplash.com/photo-1487528278747-ba99ed528ebc?auto=format&fit=crop&w=1200&q=80',
    durationSeconds: 126,
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
        id: 't-en',
        projectId: 'proj-1001',
        languageCode: 'en',
        status: 'completed',
        progress: 100,
      },
      {
        id: 't-ja',
        projectId: 'proj-1001',
        languageCode: 'ja',
        status: 'completed',
        progress: 100,
      },
    ],
  },
]
