export type ProjectStatus =
  | 'uploading'
  | 'processing'
  | 'uploaded'
  | 'editing'
  | 'completed'
  | 'failed'

interface ProjectThumbnail {
  kind: 's3' | 'external'
  key: string
  url: string
}

export interface ProjectSummary {
  id: string
  title: string
  sourceLanguage: string
  targetLanguages: string[]
  status: ProjectStatus
  dueDate: string
  assignedEditor?: string
  createdAt?: string
  video_source?: string
  thumbnailUrl?: string
  durationSeconds?: number
  targets?: ProjectTarget[]
  thumbnail?: ProjectThumbnail
}

export type ProjectTargetStatus = 'pending' | 'processing' | 'completed' | 'failed'

export interface ProjectTarget {
  id: string
  projectId: string
  languageCode: string
  status: ProjectTargetStatus
  progress: number
}

export interface ProjectAsset {
  id: string
  language: string
  type: 'video' | 'subtitle'
  url: string
  duration: number
  codec: string
  resolution: string
  sizeMb: number
}

export interface ProjectPayload {
  title: string
  sourceType: 'file' | 'youtube'
  detectAutomatically: boolean
  sourceLanguage?: string | null
  speakerCount: number
  youtubeUrl?: string
  fileName?: string
  fileSize?: number
  owner_code: string
}

export interface ProjectDetail extends ProjectSummary {
  description?: string
  createdAt: string
  // glossaryName?: string
  speakerCount: number
  assets: ProjectAsset[]
  // notes?: string
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
    targetLanguages: ['en', 'ja'],
    status: 'completed',
    dueDate: '2025-02-06',
    assignedEditor: 'translator-amy',
    description:
      'Marketing trailer localisation for the upcoming AI voice-over suite. Includes three regional variants and a shared glossary.',
    createdAt: '2025-01-15T10:00:00Z',
    speakerCount: 3,
    assets: [
      {
        id: 'asset-kr-video',
        language: 'Korean',
        type: 'video',
        url: '/assets/sample-video-kr.mp4',
        duration: 126,
        codec: 'H.264',
        resolution: '1920x1080',
        sizeMb: 210,
      },
      {
        id: 'asset-jp-video',
        language: 'ja',
        type: 'video',
        url: '/assets/sample-video-jp.mp4',
        duration: 126,
        codec: 'H.264',
        resolution: '1920x1080',
        sizeMb: 208,
      },
      {
        id: 'asset-es-video',
        language: 'Spanish',
        type: 'video',
        url: '/assets/sample-video-es.mp4',
        duration: 126,
        codec: 'H.264',
        resolution: '1920x1080',
        sizeMb: 212,
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
    thumbnailUrl:
      'https://images.unsplash.com/photo-1487528278747-ba99ed528ebc?auto=format&fit=crop&w=1200&q=80',
    durationSeconds: 126,
  },
  {
    id: 'proj-1002',
    title: 'Educational Webinar Series',
    sourceLanguage: 'en',
    targetLanguages: ['ko', 'ja'],
    status: 'processing',
    dueDate: '2025-02-28',
    assignedEditor: 'translator-luis',
    createdAt: '2025-01-20T09:00:00Z',
    speakerCount: 2,
    assets: [
      {
        id: 'asset-en-preview',
        language: 'English',
        type: 'video',
        url: '/assets/sample-video-en.mp4',
        duration: 162,
        codec: 'H.264',
        resolution: '1920x1080',
        sizeMb: 256,
      },
    ],
    targets: [
      {
        id: 't-ko',
        projectId: 'proj-1002',
        languageCode: 'ko',
        status: 'processing',
        progress: 50,
      },
      {
        id: 't-ja',
        projectId: 'proj-1002',
        languageCode: 'ja',
        status: 'processing',
        progress: 50,
      },
    ],
    thumbnailUrl:
      'https://images.unsplash.com/photo-1487528278747-ba99ed528ebc?auto=format&fit=crop&w=1200&q=80',
    durationSeconds: 226,
  },
  {
    id: 'proj-1003',
    title: 'Creator Success Stories',
    sourceLanguage: 'ja',
    targetLanguages: ['ko', 'en'],
    status: 'editing',
    dueDate: '2025-01-31',
    assignedEditor: 'translator-erin',
    createdAt: '2025-01-05T14:25:00Z',
    speakerCount: 4,
    assets: [
      {
        id: 'asset-en-video',
        language: 'English',
        type: 'video',
        url: '/assets/sample-video-en.mp4',
        duration: 180,
        codec: 'H.265',
        resolution: '3840x2160',
        sizeMb: 420,
      },
      {
        id: 'asset-ko-subtitle',
        language: 'Korean',
        type: 'subtitle',
        url: '/assets/sample-subtitle-ko.srt',
        duration: 180,
        codec: 'SRT',
        resolution: '—',
        sizeMb: 0.4,
      },
    ],
    targets: [
      {
        id: 't-ko',
        projectId: 'proj-1003',
        languageCode: 'ko',
        status: 'completed',
        progress: 100,
      },
      {
        id: 't-en',
        projectId: 'proj-1003',
        languageCode: 'en',
        status: 'processing',
        progress: 50,
      },
    ],
    thumbnailUrl:
      'https://images.unsplash.com/photo-1487528278747-ba99ed528ebc?auto=format&fit=crop&w=1200&q=80',
    durationSeconds: 326,
  },
]
